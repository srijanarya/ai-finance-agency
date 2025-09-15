"""
TalkingPhoto MVP - Celery Background Processing Configuration
Production-ready Celery setup for video generation workflow processing
"""

import os
from celery import Celery
from celery.signals import worker_ready, worker_shutdown
from kombu import Queue, Exchange
import structlog
from datetime import timedelta

logger = structlog.get_logger()

# Redis Configuration
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', REDIS_URL)

# Create Celery app
celery_app = Celery('talkingphoto')

# Celery Configuration
celery_app.conf.update(
    # Broker settings
    broker_url=REDIS_URL,
    result_backend=CELERY_RESULT_BACKEND,

    # Task routing
    task_routes={
        'talkingphoto.tasks.generate_video': {'queue': 'video_generation'},
        'talkingphoto.tasks.process_image': {'queue': 'image_processing'},
        'talkingphoto.tasks.generate_tts': {'queue': 'audio_processing'},
        'talkingphoto.tasks.cleanup_files': {'queue': 'maintenance'},
        'talkingphoto.tasks.send_notification': {'queue': 'notifications'},
    },

    # Queue definitions
    task_default_queue='default',
    task_queues=(
        Queue('default', Exchange('default'), routing_key='default'),
        Queue('video_generation', Exchange('video'), routing_key='video.generation',
              queue_arguments={'x-max-priority': 10}),
        Queue('image_processing', Exchange('image'), routing_key='image.process'),
        Queue('audio_processing', Exchange('audio'), routing_key='audio.generate'),
        Queue('notifications', Exchange('notifications'), routing_key='notify'),
        Queue('maintenance', Exchange('maintenance'), routing_key='cleanup'),
    ),

    # Task execution settings
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='UTC',
    enable_utc=True,

    # Result expiration
    result_expires=3600,  # 1 hour

    # Task timeouts
    task_time_limit=1800,  # 30 minutes hard limit
    task_soft_time_limit=1500,  # 25 minutes soft limit

    # Worker settings
    worker_prefetch_multiplier=1,  # One task at a time for video processing
    worker_max_tasks_per_child=50,  # Restart workers after 50 tasks
    worker_disable_rate_limits=False,

    # Monitoring
    worker_send_task_events=True,
    task_send_sent_event=True,

    # Retry settings
    task_acks_late=True,
    task_reject_on_worker_lost=True,

    # Beat schedule (for periodic tasks)
    beat_schedule={
        'cleanup-old-files': {
            'task': 'talkingphoto.tasks.cleanup_old_files',
            'schedule': timedelta(hours=6),  # Every 6 hours
        },
        'update-analytics': {
            'task': 'talkingphoto.tasks.update_analytics',
            'schedule': timedelta(minutes=30),  # Every 30 minutes
        },
        'health-check': {
            'task': 'talkingphoto.tasks.health_check',
            'schedule': timedelta(minutes=5),  # Every 5 minutes
        },
        'process-pending-videos': {
            'task': 'talkingphoto.tasks.process_pending_videos',
            'schedule': timedelta(minutes=2),  # Every 2 minutes
        },
    },

    # Redis-specific settings
    broker_transport_options={
        'visibility_timeout': 3600,  # 1 hour
        'fanout_prefix': True,
        'fanout_patterns': True
    },

    # Result backend settings
    result_backend_transport_options={
        'retry_policy': {
            'timeout': 5.0
        }
    },
)

# Worker signal handlers
@worker_ready.connect
def worker_ready_handler(sender, **kwargs):
    """Handle worker ready signal"""
    logger.info("Celery worker is ready", worker=sender.hostname)

@worker_shutdown.connect
def worker_shutdown_handler(sender, **kwargs):
    """Handle worker shutdown signal"""
    logger.info("Celery worker is shutting down", worker=sender.hostname)

# Task discovery
celery_app.autodiscover_tasks([
    'tasks.video_generation',
    'tasks.image_processing',
    'tasks.audio_processing',
    'tasks.notifications',
    'tasks.maintenance'
])

if __name__ == '__main__':
    celery_app.start()