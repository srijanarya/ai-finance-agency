"""
Celery Application Configuration for Photo Processing
Handles background tasks for scalable image analysis and enhancement
"""

from celery import Celery
from celery.signals import worker_ready, worker_shutting_down
from kombu import Queue
import os
import logging
from .core.config import get_settings

logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Create Celery app
celery_app = Celery(
    "talkingphoto_ai",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=[
        "app.tasks.photo_processing_tasks",
        "app.tasks.background_tasks"
    ]
)

# Celery configuration
celery_app.conf.update(
    # Task routing
    task_routes={
        "app.tasks.photo_processing_tasks.analyze_photo_task": {"queue": "photo_analysis"},
        "app.tasks.photo_processing_tasks.enhance_photo_task": {"queue": "photo_enhancement"},
        "app.tasks.photo_processing_tasks.detect_faces_task": {"queue": "face_detection"},
        "app.tasks.photo_processing_tasks.batch_process_photos_task": {"queue": "batch_processing"},
        "app.tasks.background_tasks.*": {"queue": "general"},
    },
    
    # Queue configuration
    task_queues=(
        Queue("photo_analysis", routing_key="photo_analysis"),
        Queue("photo_enhancement", routing_key="photo_enhancement"),
        Queue("face_detection", routing_key="face_detection"),
        Queue("batch_processing", routing_key="batch_processing"),
        Queue("general", routing_key="general"),
    ),
    
    # Task settings
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Performance settings
    worker_pool_restarts=True,
    worker_max_tasks_per_child=1000,  # Restart worker after 1000 tasks
    worker_prefetch_multiplier=4,     # Prefetch 4 tasks per worker
    task_acks_late=True,              # Acknowledge task after completion
    task_reject_on_worker_lost=True,  # Reject task if worker dies
    
    # Result backend settings
    result_expires=3600,              # Results expire after 1 hour
    result_persistent=True,           # Persist results to disk
    
    # Task timeout settings
    task_soft_time_limit=300,         # 5 minutes soft timeout
    task_time_limit=600,              # 10 minutes hard timeout
    
    # Monitoring
    worker_send_task_events=True,
    task_send_sent_event=True,
    
    # Error handling
    task_annotations={
        "*": {
            "rate_limit": "100/m",    # 100 tasks per minute max
            "max_retries": 3,
            "default_retry_delay": 60,  # 1 minute retry delay
        },
        "app.tasks.photo_processing_tasks.analyze_photo_task": {
            "rate_limit": "50/m",     # Photo analysis is resource intensive
            "max_retries": 2,
        },
        "app.tasks.photo_processing_tasks.enhance_photo_task": {
            "rate_limit": "30/m",     # Enhancement is most resource intensive
            "max_retries": 2,
        },
    },
    
    # Beat schedule (for periodic tasks)
    beat_schedule={
        "cleanup-expired-jobs": {
            "task": "app.tasks.background_tasks.cleanup_expired_jobs",
            "schedule": 3600.0,  # Every hour
        },
        "update-processing-stats": {
            "task": "app.tasks.background_tasks.update_processing_statistics",
            "schedule": 300.0,   # Every 5 minutes
        },
    },
)

# Health check configuration
@worker_ready.connect
def worker_ready_handler(sender, **kwargs):
    """Handler when worker is ready"""
    logger.info(f"Celery worker {sender} is ready")
    
@worker_shutting_down.connect  
def worker_shutting_down_handler(sender, **kwargs):
    """Handler when worker is shutting down"""
    logger.info(f"Celery worker {sender} is shutting down")

# Custom task base class for photo processing
class PhotoProcessingTask(celery_app.Task):
    """Base task class for photo processing with custom error handling"""
    
    def on_success(self, retval, task_id, args, kwargs):
        """Success callback"""
        logger.info(f"Task {task_id} completed successfully")
        self.update_job_status(task_id, "completed", retval)
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Failure callback"""
        logger.error(f"Task {task_id} failed: {exc}")
        self.update_job_status(task_id, "failed", {"error": str(exc)})
    
    def on_retry(self, exc, task_id, args, kwargs, einfo):
        """Retry callback"""
        logger.warning(f"Task {task_id} retrying: {exc}")
        self.update_job_status(task_id, "retrying", {"error": str(exc)})
    
    def update_job_status(self, task_id, status, result_data=None):
        """Update job status in database"""
        try:
            from .database.models import PhotoProcessingJob, db_manager
            
            session = db_manager.get_session()
            job = session.query(PhotoProcessingJob).filter_by(celery_task_id=task_id).first()
            
            if job:
                job.status = status
                if result_data:
                    job.result_data = result_data
                    
                if status == "completed":
                    from datetime import datetime
                    job.completed_at = datetime.utcnow()
                elif status == "failed":
                    job.retry_count += 1
                
                session.commit()
            
            session.close()
            
        except Exception as e:
            logger.error(f"Failed to update job status: {e}")


# Health check endpoint
@celery_app.task(bind=True)
def health_check(self):
    """Health check task"""
    return {
        "status": "healthy",
        "worker_id": self.request.id,
        "timestamp": celery_app.now()
    }


# Task monitoring utilities
class TaskMonitor:
    """Monitor and manage Celery tasks"""
    
    @staticmethod
    def get_active_tasks():
        """Get list of active tasks"""
        inspect = celery_app.control.inspect()
        return inspect.active()
    
    @staticmethod
    def get_waiting_tasks():
        """Get list of waiting tasks"""
        inspect = celery_app.control.inspect()
        return inspect.reserved()
    
    @staticmethod
    def get_worker_stats():
        """Get worker statistics"""
        inspect = celery_app.control.inspect()
        return inspect.stats()
    
    @staticmethod
    def cancel_task(task_id):
        """Cancel a running task"""
        celery_app.control.revoke(task_id, terminate=True)
    
    @staticmethod
    def get_task_result(task_id):
        """Get task result"""
        return celery_app.AsyncResult(task_id)
    
    @staticmethod
    def purge_queue(queue_name):
        """Purge all tasks from a queue"""
        celery_app.control.purge()


# Queue management utilities
class QueueManager:
    """Manage Celery queues"""
    
    @staticmethod
    def get_queue_length(queue_name):
        """Get number of tasks in queue"""
        try:
            inspect = celery_app.control.inspect()
            queues = inspect.active_queues()
            
            for worker, worker_queues in queues.items():
                for queue in worker_queues:
                    if queue['name'] == queue_name:
                        return queue.get('messages', 0)
            return 0
        except:
            return 0
    
    @staticmethod
    def get_all_queue_stats():
        """Get statistics for all queues"""
        stats = {}
        queues = ["photo_analysis", "photo_enhancement", "face_detection", "batch_processing", "general"]
        
        for queue in queues:
            stats[queue] = {
                "length": QueueManager.get_queue_length(queue),
                "active": len([t for t in TaskMonitor.get_active_tasks().values() if queue in str(t)]) if TaskMonitor.get_active_tasks() else 0
            }
        
        return stats
    
    @staticmethod
    def is_queue_healthy():
        """Check if queues are processing normally"""
        try:
            # Check if workers are responsive
            inspect = celery_app.control.inspect()
            stats = inspect.stats()
            
            if not stats:
                return False, "No workers available"
            
            # Check queue lengths
            queue_stats = QueueManager.get_all_queue_stats()
            for queue_name, stats in queue_stats.items():
                if stats["length"] > 100:  # More than 100 tasks waiting
                    return False, f"Queue {queue_name} has {stats['length']} waiting tasks"
            
            return True, "All queues healthy"
            
        except Exception as e:
            return False, f"Queue health check failed: {e}"


# Configuration validation
def validate_celery_config():
    """Validate Celery configuration"""
    issues = []
    
    # Check broker connection
    try:
        conn = celery_app.connection()
        conn.ensure_connection(max_retries=3)
        conn.close()
    except Exception as e:
        issues.append(f"Cannot connect to message broker: {e}")
    
    # Check result backend connection
    try:
        backend = celery_app.backend
        backend.get("test")  # Test connection
    except Exception as e:
        issues.append(f"Cannot connect to result backend: {e}")
    
    # Check required queues
    required_queues = ["photo_analysis", "photo_enhancement", "face_detection", "batch_processing"]
    try:
        inspect = celery_app.control.inspect()
        active_queues = inspect.active_queues()
        if not active_queues:
            issues.append("No active queues found")
    except Exception as e:
        issues.append(f"Cannot inspect queues: {e}")
    
    return issues


# Export for use in other modules
__all__ = [
    "celery_app", 
    "PhotoProcessingTask", 
    "TaskMonitor", 
    "QueueManager",
    "validate_celery_config",
    "health_check"
]