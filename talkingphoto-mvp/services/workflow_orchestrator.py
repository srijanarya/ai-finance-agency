"""
TalkingPhoto MVP - Video Generation Workflow Orchestrator
End-to-end workflow connecting UI to AI services with real-time progress tracking
"""

import asyncio
import json
import time
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import structlog

from services.ai_service import AIService
from services.payment_service import PaymentService
from services.file_service import FileService
from services.websocket_service import WebSocketService
from services.tts_service import TTSService
from services.lipsync_service import LipSyncService
from services.cost_optimization_service import CostOptimizationService
from models.video import VideoGeneration, VideoStatus, AIProvider, VideoQuality, AspectRatio
from models.file import UploadedFile
from models.user import User
from core.cache import cached_result
from core.database import db

logger = structlog.get_logger()


class WorkflowStep(Enum):
    """Video generation workflow steps"""
    VALIDATION = "validation"
    PHOTO_ENHANCEMENT = "photo_enhancement"
    TTS_GENERATION = "tts_generation"
    LIP_SYNC_PROCESSING = "lipsync_processing"
    VIDEO_GENERATION = "video_generation"
    POST_PROCESSING = "post_processing"
    STORAGE_UPLOAD = "storage_upload"
    COMPLETION = "completion"


class WorkflowStatus(Enum):
    """Workflow execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class WorkflowProgress:
    """Progress tracking for video generation workflow"""
    current_step: WorkflowStep
    progress_percentage: float
    estimated_completion_time: Optional[datetime]
    step_details: Dict[str, Any]
    error_message: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['current_step'] = self.current_step.value
        if self.estimated_completion_time:
            data['estimated_completion_time'] = self.estimated_completion_time.isoformat()
        return data


@dataclass
class WorkflowResult:
    """Final workflow execution result"""
    success: bool
    video_generation_id: str
    output_file_path: Optional[str] = None
    output_file_url: Optional[str] = None
    thumbnail_path: Optional[str] = None
    duration_seconds: Optional[float] = None
    processing_time_seconds: Optional[float] = None
    total_cost: Optional[float] = None
    quality_metrics: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    fallback_used: bool = False


class VideoGenerationWorkflowOrchestrator:
    """
    Production-ready workflow orchestrator for video generation
    Manages the complete end-to-end process with real-time updates
    """

    def __init__(self):
        self.ai_service = AIService()
        self.payment_service = PaymentService()
        self.file_service = FileService()
        self.websocket_service = WebSocketService()
        self.tts_service = TTSService()
        self.lipsync_service = LipSyncService()
        self.cost_optimizer = CostOptimizationService()

        # Workflow configuration
        self.step_timeouts = {
            WorkflowStep.VALIDATION: 10,  # seconds
            WorkflowStep.PHOTO_ENHANCEMENT: 30,
            WorkflowStep.TTS_GENERATION: 15,
            WorkflowStep.LIP_SYNC_PROCESSING: 20,
            WorkflowStep.VIDEO_GENERATION: 120,  # Main processing
            WorkflowStep.POST_PROCESSING: 30,
            WorkflowStep.STORAGE_UPLOAD: 20,
            WorkflowStep.COMPLETION: 5
        }

        self.step_weights = {
            WorkflowStep.VALIDATION: 5,
            WorkflowStep.PHOTO_ENHANCEMENT: 15,
            WorkflowStep.TTS_GENERATION: 10,
            WorkflowStep.LIP_SYNC_PROCESSING: 15,
            WorkflowStep.VIDEO_GENERATION: 40,
            WorkflowStep.POST_PROCESSING: 10,
            WorkflowStep.STORAGE_UPLOAD: 3,
            WorkflowStep.COMPLETION: 2
        }

    async def execute_workflow(
        self,
        user_id: str,
        uploaded_file_id: str,
        script_text: str,
        voice_settings: Dict[str, Any],
        video_options: Dict[str, Any]
    ) -> WorkflowResult:
        """
        Execute complete video generation workflow
        """
        workflow_id = str(uuid.uuid4())
        start_time = datetime.now(timezone.utc)

        logger.info("Starting video generation workflow",
                   workflow_id=workflow_id,
                   user_id=user_id,
                   script_length=len(script_text))

        try:
            # Initialize video generation record
            video_gen = await self._initialize_video_generation(
                user_id, uploaded_file_id, script_text, voice_settings, video_options
            )

            # Initialize progress tracking
            progress = WorkflowProgress(
                current_step=WorkflowStep.VALIDATION,
                progress_percentage=0.0,
                estimated_completion_time=self._calculate_estimated_completion(video_options),
                step_details={"workflow_id": workflow_id}
            )

            # Send initial progress update
            await self._send_progress_update(user_id, video_gen.id, progress)

            # Execute workflow steps
            result = await self._execute_workflow_steps(
                workflow_id, video_gen, progress
            )

            # Calculate final metrics
            processing_time = (datetime.now(timezone.utc) - start_time).total_seconds()
            result.processing_time_seconds = processing_time

            logger.info("Workflow completed",
                       workflow_id=workflow_id,
                       success=result.success,
                       processing_time=processing_time)

            return result

        except Exception as e:
            error_msg = f"Workflow execution failed: {str(e)}"
            logger.error("Workflow execution failed",
                        workflow_id=workflow_id,
                        error=str(e))

            return WorkflowResult(
                success=False,
                video_generation_id=workflow_id,
                error_message=error_msg
            )

    async def _execute_workflow_steps(
        self,
        workflow_id: str,
        video_gen: VideoGeneration,
        progress: WorkflowProgress
    ) -> WorkflowResult:
        """Execute all workflow steps with progress tracking"""

        # Step 1: Validation
        progress.current_step = WorkflowStep.VALIDATION
        await self._send_progress_update(video_gen.user_id, video_gen.id, progress)

        validation_result = await self._validate_inputs(video_gen)
        if not validation_result['success']:
            return WorkflowResult(
                success=False,
                video_generation_id=video_gen.id,
                error_message=validation_result['error']
            )

        progress.progress_percentage = 5.0
        progress.step_details = {"validation": "completed", "credits_available": validation_result['credits_remaining']}
        await self._send_progress_update(video_gen.user_id, video_gen.id, progress)

        # Step 2: Photo Enhancement (if needed)
        progress.current_step = WorkflowStep.PHOTO_ENHANCEMENT
        progress.progress_percentage = 10.0
        await self._send_progress_update(video_gen.user_id, video_gen.id, progress)

        enhancement_result = await self._enhance_photo(video_gen)
        if not enhancement_result['success']:
            return WorkflowResult(
                success=False,
                video_generation_id=video_gen.id,
                error_message=enhancement_result['error']
            )

        progress.progress_percentage = 25.0
        progress.step_details = {"photo_enhancement": "completed", "enhanced_file_id": enhancement_result.get('enhanced_file_id')}
        await self._send_progress_update(video_gen.user_id, video_gen.id, progress)

        # Step 3: TTS Generation
        progress.current_step = WorkflowStep.TTS_GENERATION
        progress.progress_percentage = 30.0
        await self._send_progress_update(video_gen.user_id, video_gen.id, progress)

        tts_result = await self._generate_audio(video_gen)
        if not tts_result['success']:
            return WorkflowResult(
                success=False,
                video_generation_id=video_gen.id,
                error_message=tts_result['error']
            )

        progress.progress_percentage = 40.0
        progress.step_details = {"tts_generation": "completed", "audio_duration": tts_result['duration']}
        await self._send_progress_update(video_gen.user_id, video_gen.id, progress)

        # Step 4: Lip Sync Processing
        progress.current_step = WorkflowStep.LIP_SYNC_PROCESSING
        progress.progress_percentage = 45.0
        await self._send_progress_update(video_gen.user_id, video_gen.id, progress)

        lipsync_result = await self._process_lip_sync(video_gen, tts_result)
        if not lipsync_result['success']:
            return WorkflowResult(
                success=False,
                video_generation_id=video_gen.id,
                error_message=lipsync_result['error']
            )

        progress.progress_percentage = 60.0
        progress.step_details = {"lipsync_processing": "completed", "accuracy_score": lipsync_result.get('accuracy')}
        await self._send_progress_update(video_gen.user_id, video_gen.id, progress)

        # Step 5: Video Generation (Main processing)
        progress.current_step = WorkflowStep.VIDEO_GENERATION
        progress.progress_percentage = 65.0
        await self._send_progress_update(video_gen.user_id, video_gen.id, progress)

        video_result = await self._generate_video_with_progress(video_gen, progress)
        if not video_result['success']:
            return WorkflowResult(
                success=False,
                video_generation_id=video_gen.id,
                error_message=video_result['error'],
                fallback_used=video_result.get('fallback_used', False)
            )

        progress.progress_percentage = 85.0
        progress.step_details = {"video_generation": "completed", "output_file": video_result['output_file_path']}
        await self._send_progress_update(video_gen.user_id, video_gen.id, progress)

        # Step 6: Post Processing
        progress.current_step = WorkflowStep.POST_PROCESSING
        progress.progress_percentage = 88.0
        await self._send_progress_update(video_gen.user_id, video_gen.id, progress)

        post_process_result = await self._post_process_video(video_gen, video_result)

        progress.progress_percentage = 92.0
        await self._send_progress_update(video_gen.user_id, video_gen.id, progress)

        # Step 7: Storage Upload & CDN
        progress.current_step = WorkflowStep.STORAGE_UPLOAD
        progress.progress_percentage = 95.0
        await self._send_progress_update(video_gen.user_id, video_gen.id, progress)

        storage_result = await self._finalize_storage(video_gen, video_result)

        # Step 8: Completion
        progress.current_step = WorkflowStep.COMPLETION
        progress.progress_percentage = 98.0
        await self._send_progress_update(video_gen.user_id, video_gen.id, progress)

        # Update credits and costs
        await self._update_credits_and_costs(video_gen, video_result)

        # Mark video generation as completed
        video_gen.mark_processing_completed(
            output_file_id=storage_result.get('output_file_id'),
            **video_result.get('quality_metrics', {})
        )

        # Final progress update
        progress.progress_percentage = 100.0
        progress.step_details = {"status": "completed", "video_url": storage_result.get('cdn_url')}
        await self._send_progress_update(video_gen.user_id, video_gen.id, progress)

        # Log analytics
        await self._log_analytics(video_gen, video_result)

        return WorkflowResult(
            success=True,
            video_generation_id=video_gen.id,
            output_file_path=storage_result.get('output_file_path'),
            output_file_url=storage_result.get('cdn_url'),
            thumbnail_path=storage_result.get('thumbnail_path'),
            duration_seconds=video_result.get('duration'),
            total_cost=video_result.get('cost', 0),
            quality_metrics=video_result.get('quality_metrics'),
            fallback_used=video_result.get('fallback_used', False)
        )

    async def _initialize_video_generation(
        self,
        user_id: str,
        uploaded_file_id: str,
        script_text: str,
        voice_settings: Dict[str, Any],
        video_options: Dict[str, Any]
    ) -> VideoGeneration:
        """Initialize video generation database record"""

        # Get uploaded file
        source_file = UploadedFile.query.get(uploaded_file_id)
        if not source_file:
            raise ValueError("Source file not found")

        # Calculate duration from script
        word_count = len(script_text.split())
        estimated_duration = max(5, min(30, word_count * 0.35))

        # Select optimal AI provider
        quality_preference = video_options.get('quality', 'standard')
        ai_provider = self.cost_optimizer.select_optimal_provider(
            duration=estimated_duration,
            quality_preference=quality_preference
        )

        # Create video generation record
        video_gen = VideoGeneration(
            user_id=user_id,
            source_file_id=uploaded_file_id,
            script_text=script_text,
            voice_settings=voice_settings,
            duration_seconds=estimated_duration,
            video_quality=VideoQuality(quality_preference),
            aspect_ratio=AspectRatio(video_options.get('aspect_ratio', '16:9')),
            ai_provider=ai_provider,
            status=VideoStatus.PENDING
        )

        db.session.add(video_gen)
        db.session.commit()

        return video_gen

    async def _validate_inputs(self, video_gen: VideoGeneration) -> Dict[str, Any]:
        """Validate all inputs and check user credits"""
        try:
            # Validate source file
            source_file = video_gen.source_file
            if not source_file or not self.file_service.file_exists(source_file.storage_path):
                return {'success': False, 'error': 'Source file not found or inaccessible'}

            # Validate script
            if not video_gen.script_text or len(video_gen.script_text.strip()) < 10:
                return {'success': False, 'error': 'Script text is too short (minimum 10 characters)'}

            if len(video_gen.script_text) > 1000:
                return {'success': False, 'error': 'Script text is too long (maximum 1000 characters)'}

            # Check user credits
            user = User.query.get(video_gen.user_id)
            if not user:
                return {'success': False, 'error': 'User not found'}

            estimated_cost = self.cost_optimizer.calculate_generation_cost(
                duration=video_gen.duration_seconds,
                quality=video_gen.video_quality.value,
                provider=video_gen.ai_provider.value
            )

            credits_check = self.payment_service.check_credits(user.id, estimated_cost)
            if not credits_check['sufficient']:
                return {
                    'success': False,
                    'error': f'Insufficient credits. Required: {estimated_cost}, Available: {credits_check["available"]}'
                }

            return {
                'success': True,
                'estimated_cost': estimated_cost,
                'credits_remaining': credits_check['available'] - estimated_cost
            }

        except Exception as e:
            logger.error("Input validation failed", error=str(e))
            return {'success': False, 'error': str(e)}

    async def _enhance_photo(self, video_gen: VideoGeneration) -> Dict[str, Any]:
        """Enhance photo quality if needed"""
        try:
            source_file = video_gen.source_file

            # Check if enhancement is needed based on image quality
            analysis = await self._analyze_photo_quality(source_file)
            if analysis['quality_score'] >= 8.0:
                return {
                    'success': True,
                    'enhanced_file_id': source_file.id,
                    'enhancement_used': False
                }

            # Enhance image
            enhancement_result = self.ai_service.enhance_image(
                source_file.id,
                {'quality_preference': 'balanced', 'prompt': 'Enhance for video generation'}
            )

            if not enhancement_result['success']:
                # Use original if enhancement fails
                logger.warning("Photo enhancement failed, using original", error=enhancement_result['error'])
                return {
                    'success': True,
                    'enhanced_file_id': source_file.id,
                    'enhancement_used': False,
                    'enhancement_error': enhancement_result['error']
                }

            return {
                'success': True,
                'enhanced_file_id': enhancement_result['file_id'],
                'enhancement_used': True,
                'original_quality': analysis['quality_score'],
                'enhanced_quality': enhancement_result.get('quality_score', 9.0)
            }

        except Exception as e:
            logger.error("Photo enhancement failed", error=str(e))
            return {'success': False, 'error': str(e)}

    async def _generate_audio(self, video_gen: VideoGeneration) -> Dict[str, Any]:
        """Generate TTS audio from script"""
        try:
            tts_result = await self.tts_service.generate_speech(
                text=video_gen.script_text,
                voice_settings=video_gen.voice_settings,
                output_format='wav',  # High quality for lip-sync
                sample_rate=44100
            )

            if not tts_result['success']:
                return {'success': False, 'error': f'TTS generation failed: {tts_result["error"]}'}

            return {
                'success': True,
                'audio_file_path': tts_result['audio_file_path'],
                'duration': tts_result['duration_seconds'],
                'sample_rate': tts_result['sample_rate'],
                'audio_quality_score': tts_result.get('quality_score', 8.0)
            }

        except Exception as e:
            logger.error("TTS generation failed", error=str(e))
            return {'success': False, 'error': str(e)}

    async def _process_lip_sync(self, video_gen: VideoGeneration, tts_result: Dict[str, Any]) -> Dict[str, Any]:
        """Process lip synchronization"""
        try:
            lipsync_result = await self.lipsync_service.generate_lip_sync(
                image_file_id=video_gen.source_file_id,
                audio_file_path=tts_result['audio_file_path'],
                quality_level=video_gen.video_quality.value
            )

            if not lipsync_result['success']:
                return {'success': False, 'error': f'Lip sync failed: {lipsync_result["error"]}'}

            return {
                'success': True,
                'lipsync_data_path': lipsync_result['lipsync_data_path'],
                'accuracy': lipsync_result.get('accuracy_score', 85.0),
                'processing_time': lipsync_result.get('processing_time')
            }

        except Exception as e:
            logger.error("Lip sync processing failed", error=str(e))
            return {'success': False, 'error': str(e)}

    async def _generate_video_with_progress(
        self,
        video_gen: VideoGeneration,
        progress: WorkflowProgress
    ) -> Dict[str, Any]:
        """Generate video with real-time progress updates"""
        try:
            # Start video generation
            generation_result = self.ai_service.generate_video(video_gen.id)

            if not generation_result['success']:
                return {'success': False, 'error': generation_result['error']}

            # If synchronous processing, return immediately
            if generation_result.get('status') != 'processing':
                return generation_result

            # For asynchronous processing, poll for updates
            job_id = generation_result.get('job_id')
            max_wait_time = 300  # 5 minutes
            poll_interval = 3  # 3 seconds
            start_time = time.time()

            while time.time() - start_time < max_wait_time:
                # Check status
                status_result = self.ai_service.get_generation_status(video_gen)

                if status_result.get('status_changed'):
                    new_status = status_result.get('new_status')

                    if new_status == 'completed':
                        completion_result = status_result.get('completion_result', {})
                        return {
                            'success': True,
                            'output_file_path': completion_result.get('output_file_path'),
                            'duration': completion_result.get('duration'),
                            'cost': completion_result.get('cost'),
                            'quality_metrics': completion_result.get('quality_metrics'),
                            'fallback_used': completion_result.get('fallback_used', False)
                        }
                    elif new_status == 'failed':
                        return {
                            'success': False,
                            'error': status_result.get('error', 'Video generation failed')
                        }

                # Update progress based on video generation progress
                video_progress = status_result.get('progress', 0)
                # Map video generation progress (65-85%) to our workflow progress
                workflow_progress = 65 + (video_progress / 100) * 20

                if workflow_progress != progress.progress_percentage:
                    progress.progress_percentage = workflow_progress
                    progress.step_details.update({
                        "video_progress": video_progress,
                        "estimated_remaining": status_result.get('estimated_completion_time')
                    })
                    await self._send_progress_update(video_gen.user_id, video_gen.id, progress)

                await asyncio.sleep(poll_interval)

            return {'success': False, 'error': 'Video generation timeout'}

        except Exception as e:
            logger.error("Video generation failed", error=str(e))
            return {'success': False, 'error': str(e)}

    async def _post_process_video(
        self,
        video_gen: VideoGeneration,
        video_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Post-process generated video (compression, optimization)"""
        try:
            # For MVP, minimal post-processing
            # In production: video optimization, watermarking, format conversion

            output_path = video_result['output_file_path']
            if not self.file_service.file_exists(output_path):
                return {'success': False, 'error': 'Generated video file not found'}

            # Generate thumbnail
            thumbnail_result = await self._generate_video_thumbnail(output_path, video_gen.id)

            return {
                'success': True,
                'thumbnail_path': thumbnail_result.get('thumbnail_path'),
                'optimized_size': video_result.get('file_size'),
                'post_processing_time': 2.5  # Mock time
            }

        except Exception as e:
            logger.error("Post processing failed", error=str(e))
            return {'success': True, 'warning': str(e)}  # Don't fail workflow for post-processing issues

    async def _finalize_storage(
        self,
        video_gen: VideoGeneration,
        video_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Finalize storage and generate CDN URLs"""
        try:
            output_path = video_result['output_file_path']

            # Upload to CDN (mock implementation)
            cdn_result = await self._upload_to_cdn(output_path, video_gen.id)

            # Create output file record
            output_file = UploadedFile(
                filename=f"talking_video_{video_gen.id}.mp4",
                original_filename=f"video_{video_gen.id}.mp4",
                mime_type='video/mp4',
                file_size=video_result.get('file_size', 0),
                storage_path=output_path,
                user_id=video_gen.user_id,
                file_hash=self.file_service.calculate_file_hash(output_path)
            )

            db.session.add(output_file)
            db.session.commit()

            return {
                'success': True,
                'output_file_id': output_file.id,
                'output_file_path': output_path,
                'cdn_url': cdn_result.get('cdn_url'),
                'thumbnail_path': cdn_result.get('thumbnail_path')
            }

        except Exception as e:
            logger.error("Storage finalization failed", error=str(e))
            return {'success': False, 'error': str(e)}

    async def _update_credits_and_costs(
        self,
        video_gen: VideoGeneration,
        video_result: Dict[str, Any]
    ) -> None:
        """Update user credits and record costs"""
        try:
            cost = video_result.get('cost', 0)
            if cost > 0:
                deduction_result = self.payment_service.deduct_credits(
                    video_gen.user_id,
                    cost,
                    f"Video generation - {video_gen.id}"
                )

                if not deduction_result['success']:
                    logger.warning("Failed to deduct credits",
                                 user_id=video_gen.user_id,
                                 cost=cost,
                                 error=deduction_result['error'])

            # Update video generation cost
            video_gen.processing_cost = cost
            db.session.commit()

        except Exception as e:
            logger.error("Credit update failed", error=str(e))

    async def _log_analytics(self, video_gen: VideoGeneration, video_result: Dict[str, Any]) -> None:
        """Log analytics for conversion and quality tracking"""
        try:
            analytics_data = {
                'event': 'video_generation_completed',
                'user_id': video_gen.user_id,
                'video_id': video_gen.id,
                'duration_seconds': video_gen.duration_seconds,
                'quality': video_gen.video_quality.value,
                'ai_provider': video_gen.ai_provider.value,
                'fallback_used': video_result.get('fallback_used', False),
                'processing_cost': video_result.get('cost', 0),
                'quality_metrics': video_result.get('quality_metrics', {}),
                'script_length': len(video_gen.script_text),
                'voice_language': video_gen.voice_settings.get('language', 'unknown'),
                'timestamp': datetime.now(timezone.utc).isoformat()
            }

            # Log to analytics service (implement as needed)
            logger.info("Video generation analytics", **analytics_data)

        except Exception as e:
            logger.error("Analytics logging failed", error=str(e))

    # Helper methods
    async def _send_progress_update(
        self,
        user_id: str,
        video_id: str,
        progress: WorkflowProgress
    ) -> None:
        """Send real-time progress update via WebSocket"""
        try:
            await self.websocket_service.send_progress_update(
                user_id=user_id,
                video_id=video_id,
                progress_data=progress.to_dict()
            )
        except Exception as e:
            logger.warning("Failed to send progress update", error=str(e))

    def _calculate_estimated_completion(self, video_options: Dict[str, Any]) -> datetime:
        """Calculate estimated completion time"""
        base_time = 30  # Base 30 seconds
        quality_multiplier = {
            'economy': 0.8,
            'standard': 1.0,
            'premium': 1.4
        }.get(video_options.get('quality', 'standard'), 1.0)

        estimated_seconds = base_time * quality_multiplier
        return datetime.now(timezone.utc) + timedelta(seconds=estimated_seconds)

    async def _analyze_photo_quality(self, source_file: UploadedFile) -> Dict[str, Any]:
        """Analyze photo quality to determine if enhancement is needed"""
        # Mock implementation - in production, use AI to analyze image quality
        return {
            'quality_score': 7.5,  # Out of 10
            'needs_enhancement': True,
            'issues': ['low_lighting', 'slight_blur']
        }

    async def _generate_video_thumbnail(self, video_path: str, video_id: str) -> Dict[str, Any]:
        """Generate thumbnail from video"""
        # Mock implementation
        return {
            'thumbnail_path': f"/tmp/thumb_{video_id}.jpg",
            'success': True
        }

    async def _upload_to_cdn(self, file_path: str, video_id: str) -> Dict[str, Any]:
        """Upload video to CDN"""
        # Mock implementation - in production, upload to AWS S3/CloudFront
        return {
            'cdn_url': f"https://cdn.talkingphoto.ai/videos/{video_id}.mp4",
            'success': True
        }


# Background task interface for async processing
async def process_video_generation_async(
    user_id: str,
    uploaded_file_id: str,
    script_text: str,
    voice_settings: Dict[str, Any],
    video_options: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Background task entry point for async video generation
    """
    orchestrator = VideoGenerationWorkflowOrchestrator()

    try:
        result = await orchestrator.execute_workflow(
            user_id=user_id,
            uploaded_file_id=uploaded_file_id,
            script_text=script_text,
            voice_settings=voice_settings,
            video_options=video_options
        )

        return {
            'success': result.success,
            'video_generation_id': result.video_generation_id,
            'output_url': result.output_file_url,
            'processing_time': result.processing_time_seconds,
            'cost': result.total_cost,
            'error': result.error_message
        }

    except Exception as e:
        logger.error("Async video generation failed", error=str(e))
        return {
            'success': False,
            'error': str(e)
        }