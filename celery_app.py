"""
Celery Configuration and Tasks for AI Finance Agency
"""

from celery import Celery
from celery.schedules import crontab
import os
from datetime import timedelta
from typing import Dict, List
import yfinance as yf
from telethon import TelegramClient
import asyncio

# Initialize Celery
app = Celery(
    'ai_finance_agency',
    broker=os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/1'),
    include=['celery_tasks']
)

# Celery configuration
app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=2,
    worker_max_tasks_per_child=1000,
)

# Beat schedule for periodic tasks
app.conf.beat_schedule = {
    # Market data collection every 5 minutes during market hours
    'fetch-market-data': {
        'task': 'celery_tasks.fetch_market_data',
        'schedule': timedelta(minutes=5),
        'options': {'queue': 'market_data'}
    },
    
    # Generate content every 30 minutes
    'generate-content': {
        'task': 'celery_tasks.generate_content',
        'schedule': timedelta(minutes=30),
        'options': {'queue': 'content'}
    },
    
    # Post to social media every hour
    'social-media-post': {
        'task': 'celery_tasks.post_to_social_media',
        'schedule': timedelta(hours=1),
        'options': {'queue': 'social'}
    },
    
    # Telegram growth campaigns every 2 hours
    'telegram-growth-campaign': {
        'task': 'celery_tasks.run_telegram_growth_campaign',
        'schedule': timedelta(hours=2),
        'options': {'queue': 'telegram'}
    },
    
    # Daily analytics report at 9 PM
    'daily-analytics': {
        'task': 'celery_tasks.generate_daily_report',
        'schedule': crontab(hour=21, minute=0),
        'options': {'queue': 'analytics'}
    },
    
    # Check and send trading signals every 15 minutes
    'trading-signals': {
        'task': 'celery_tasks.check_trading_signals',
        'schedule': timedelta(minutes=15),
        'options': {'queue': 'signals'}
    },
    
    # Database cleanup daily at 3 AM
    'database-cleanup': {
        'task': 'celery_tasks.cleanup_old_data',
        'schedule': crontab(hour=3, minute=0),
        'options': {'queue': 'maintenance'}
    },
    
    # Subscriber engagement analysis every 6 hours
    'engagement-analysis': {
        'task': 'celery_tasks.analyze_subscriber_engagement',
        'schedule': timedelta(hours=6),
        'options': {'queue': 'analytics'}
    },
}

# Queue routing
app.conf.task_routes = {
    'celery_tasks.fetch_market_data': {'queue': 'market_data'},
    'celery_tasks.generate_content': {'queue': 'content'},
    'celery_tasks.post_to_social_media': {'queue': 'social'},
    'celery_tasks.run_telegram_growth_campaign': {'queue': 'telegram'},
    'celery_tasks.generate_daily_report': {'queue': 'analytics'},
    'celery_tasks.check_trading_signals': {'queue': 'signals'},
    'celery_tasks.cleanup_old_data': {'queue': 'maintenance'},
    'celery_tasks.analyze_subscriber_engagement': {'queue': 'analytics'},
}

if __name__ == '__main__':
    app.start()