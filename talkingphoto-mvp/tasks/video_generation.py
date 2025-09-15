"""
TalkingPhoto MVP - Video Generation Celery Tasks
Background processing tasks for video generation workflow
"""

import asyncio
from typing import Dict, Any
from celery import Task
from celery.exceptions import Retry, MaxRetriesExceededError
import structlog
from datetime import datetime, timezone

from celery_app import celery_app
from services.workflow_orchestrator import VideoGenerationWorkflowOrchestrator, process_video_generation_async
from services.websocket_service import WebSocketService
from services.payment_service import PaymentService
from models.video import VideoGeneration, VideoStatus
from models.user import User
from core.database import db

logger = structlog.get_logger()


class VideoGenerationTask(Task):
    """Base task class for video generation with retry logic"""

    autoretry_for = (Exception,)
    retry_kwargs = {'max_retries': 3, 'countdown': 60}
    retry_backoff = True

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Handle task failure"""
        logger.error("Video generation task failed",
                    task_id=task_id,
                    exception=str(exc),
                    args=args,
                    kwargs=kwargs)

        # Update video generation status to failed
        if args and len(args) >= 2:
            user_id, video_gen_id = args[0], args[1] if len(args) > 1 else None
            if video_gen_id:
                try:
                    video_gen = VideoGeneration.query.get(video_gen_id)
                    if video_gen:
                        video_gen.mark_processing_failed(str(exc), 'task_failure')
                        db.session.commit()

                        # Send failure notification
                        asyncio.create_task(
                            WebSocketService().send_error_notification(
                                user_id, video_gen_id, str(exc)
                            )
                        )
                except Exception as e:
                    logger.error("Failed to update video status on task failure", error=str(e))

    def on_retry(self, exc, task_id, args, kwargs, einfo):
        """Handle task retry"""
        logger.warning("Video generation task retry",
                      task_id=task_id,
                      exception=str(exc),
                      retry_count=self.request.retries)


@celery_app.task(
    bind=True,
    base=VideoGenerationTask,
    name='talkingphoto.tasks.generate_video',
    queue='video_generation',
    priority=5
)
def generate_video_task(
    self,
    user_id: str,
    uploaded_file_id: str,
    script_text: str,
    voice_settings: Dict[str, Any],
    video_options: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Main video generation task - processes complete workflow
    """
    task_id = self.request.id
    logger.info("Starting video generation task",
               task_id=task_id,
               user_id=user_id,
               script_length=len(script_text))

    try:
        # Run the async workflow
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            result = loop.run_until_complete(
                process_video_generation_async(
                    user_id=user_id,
                    uploaded_file_id=uploaded_file_id,
                    script_text=script_text,
                    voice_settings=voice_settings,
                    video_options=video_options
                )
            )

            if result['success']:
                logger.info("Video generation task completed successfully",
                           task_id=task_id,
                           video_id=result['video_generation_id'],
                           processing_time=result.get('processing_time'))

                # Send completion notification
                loop.run_until_complete(
                    WebSocketService().send_completion_notification(
                        user_id, result['video_generation_id'], result['output_url']
                    )
                )

            return result

        finally:
            loop.close()

    except MaxRetriesExceededError:
        error_msg = "Video generation failed after maximum retries"
        logger.error("Max retries exceeded for video generation", task_id=task_id)
        return {'success': False, 'error': error_msg}

    except Exception as e:
        logger.error("Video generation task error",
                    task_id=task_id,
                    error=str(e))
        # Let the retry mechanism handle the error
        raise self.retry(exc=e)


@celery_app.task(
    name='talkingphoto.tasks.process_image',
    queue='image_processing',
    priority=3
)
def process_image_task(
    file_id: str,
    enhancement_options: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Image processing and enhancement task
    """
    logger.info("Starting image processing task", file_id=file_id)

    try:
        from services.ai_service import AIService
        ai_service = AIService()

        result = ai_service.enhance_image(file_id, enhancement_options)

        logger.info("Image processing completed",
                   file_id=file_id,
                   success=result.get('success'))

        return result

    except Exception as e:
        logger.error("Image processing failed", file_id=file_id, error=str(e))
        return {'success': False, 'error': str(e)}


@celery_app.task(
    name='talkingphoto.tasks.generate_tts',
    queue='audio_processing',
    priority=4
)
def generate_tts_task(
    script_text: str,
    voice_settings: Dict[str, Any],
    user_id: str
) -> Dict[str, Any]:
    """
    Text-to-speech generation task
    """
    logger.info("Starting TTS generation task",
               user_id=user_id,
               script_length=len(script_text))

    try:
        from services.tts_service import TTSService

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        try:
            tts_service = TTSService()
            result = loop.run_until_complete(
                tts_service.generate_speech(
                    text=script_text,
                    voice_settings=voice_settings,
                    output_format='wav',
                    sample_rate=44100
                )
            )

            logger.info("TTS generation completed",
                       user_id=user_id,
                       success=result.get('success'))

            return result

        finally:
            loop.close()

    except Exception as e:
        logger.error("TTS generation failed", user_id=user_id, error=str(e))
        return {'success': False, 'error': str(e)}


@celery_app.task(
    name='talkingphoto.tasks.process_pending_videos',
    queue='video_generation'
)
def process_pending_videos():
    """
    Periodic task to process pending video generations
    """
    try:
        # Find pending video generations older than 5 minutes
        cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=5)
        pending_videos = VideoGeneration.query.filter(
            VideoGeneration.status == VideoStatus.PENDING,
            VideoGeneration.created_at < cutoff_time
        ).limit(10).all()

        processed_count = 0
        for video_gen in pending_videos:
            try:
                # Re-submit to processing queue
                generate_video_task.delay(
                    user_id=video_gen.user_id,
                    uploaded_file_id=video_gen.source_file_id,
                    script_text=video_gen.script_text,
                    voice_settings=video_gen.voice_settings or {},
                    video_options={
                        'quality': video_gen.video_quality.value,
                        'aspect_ratio': video_gen.aspect_ratio.value
                    }
                )
                processed_count += 1

            except Exception as e:
                logger.error("Failed to resubmit pending video",
                           video_id=video_gen.id,
                           error=str(e))

        if processed_count > 0:
            logger.info("Resubmitted pending videos",
                       count=processed_count)

    except Exception as e:
        logger.error("Failed to process pending videos", error=str(e))


@celery_app.task(
    name='talkingphoto.tasks.send_notification',
    queue='notifications'
)
def send_notification_task(
    user_id: str,
    notification_type: str,
    data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Send notification to user (email, SMS, push)
    """
    logger.info("Sending notification",
               user_id=user_id,
               type=notification_type)

    try:
        # Implementation depends on notification service
        # For MVP, just log the notification
        logger.info("Notification sent",
                   user_id=user_id,
                   type=notification_type,
                   data=data)

        return {'success': True, 'sent_at': datetime.now(timezone.utc).isoformat()}

    except Exception as e:
        logger.error("Notification failed",
                    user_id=user_id,
                    type=notification_type,
                    error=str(e))
        return {'success': False, 'error': str(e)}


# Utility functions for task management
def submit_video_generation(
    user_id: str,
    uploaded_file_id: str,
    script_text: str,
    voice_settings: Dict[str, Any],
    video_options: Dict[str, Any],
    priority: int = 5
) -> str:
    """
    Submit video generation task with priority
    """
    task = generate_video_task.apply_async(
        args=[user_id, uploaded_file_id, script_text, voice_settings, video_options],
        priority=priority
    )

    logger.info("Video generation task submitted",
               task_id=task.id,
               user_id=user_id,
               priority=priority)

    return task.id


def get_task_status(task_id: str) -> Dict[str, Any]:
    """
    Get status of a Celery task
    """
    try:
        result = celery_app.AsyncResult(task_id)

        return {
            'task_id': task_id,
            'status': result.status,
            'result': result.result if result.ready() else None,
            'progress': result.info if result.state == 'PROGRESS' else None,
            'error': str(result.info) if result.failed() else None
        }

    except Exception as e:
        return {
            'task_id': task_id,
            'status': 'ERROR',
            'error': str(e)
        }


def cancel_task(task_id: str) -> bool:
    """
    Cancel a running task
    """
    try:
        celery_app.control.revoke(task_id, terminate=True, signal='SIGKILL')
        logger.info("Task cancelled", task_id=task_id)
        return True

    except Exception as e:
        logger.error("Failed to cancel task", task_id=task_id, error=str(e))
        return False


# Task monitoring and health checks
@celery_app.task(name='talkingphoto.tasks.health_check')
def health_check_task():
    """Health check task for monitoring"""
    return {
        'status': 'healthy',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'worker_id': health_check_task.request.hostname
    }