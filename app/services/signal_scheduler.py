"""
Signal Scheduler and Background Tasks
Manages automated signal generation, distribution, and maintenance tasks
Ensures reliable 24/7 operation for TREUM's premium signal service
"""

import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from uuid import UUID
import json

from celery import Celery
from celery.schedules import crontab
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func

from app.core.config import settings
from app.core.database import get_db
from app.services.ai_signal_generator import signal_service, generate_signals_scheduled
from app.services.signal_distribution_service import distribution_service, distribute_signal_to_users
from database.models import (
    TradingSignal, SignalProvider, SignalSubscription, SignalAnalytics,
    UserSignalPreferences, SignalStatus, SignalPriority, User
)

logger = logging.getLogger(__name__)

# Initialize Celery app
celery_app = Celery(
    'treum_signals',
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=['app.services.signal_scheduler']
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Kolkata',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Celery beat schedule for automated tasks
celery_app.conf.beat_schedule = {
    # Main signal generation - every 15 minutes during market hours
    'generate-trading-signals': {
        'task': 'app.services.signal_scheduler.generate_trading_signals_task',
        'schedule': crontab(minute='*/15'),  # Every 15 minutes
        'options': {'priority': 9}  # High priority
    },
    
    # Market opening signal burst - more frequent during opening hours
    'opening-signal-burst': {
        'task': 'app.services.signal_scheduler.opening_signal_burst_task',
        'schedule': crontab(hour=9, minute='15,30,45'),  # 9:15, 9:30, 9:45 AM
        'options': {'priority': 10}  # Highest priority
    },
    
    # Crypto signals - 24/7 every 30 minutes
    'generate-crypto-signals': {
        'task': 'app.services.signal_scheduler.generate_crypto_signals_task',
        'schedule': crontab(minute='*/30'),  # Every 30 minutes
        'options': {'priority': 8}
    },
    
    # Expire old signals - every hour
    'expire-old-signals': {
        'task': 'app.services.signal_scheduler.expire_old_signals_task',
        'schedule': crontab(minute=5),  # Every hour at 5 minutes past
        'options': {'priority': 5}
    },
    
    # Performance analytics - every 6 hours
    'calculate-signal-analytics': {
        'task': 'app.services.signal_scheduler.calculate_signal_analytics_task',
        'schedule': crontab(minute=0, hour='*/6'),  # Every 6 hours
        'options': {'priority': 4}
    },
    
    # Daily performance report - 6 PM IST
    'daily-performance-report': {
        'task': 'app.services.signal_scheduler.daily_performance_report_task',
        'schedule': crontab(hour=18, minute=0),  # 6 PM IST
        'options': {'priority': 3}
    },
    
    # Weekly strategy review - Sunday 8 PM
    'weekly-strategy-review': {
        'task': 'app.services.signal_scheduler.weekly_strategy_review_task',
        'schedule': crontab(hour=20, minute=0, day_of_week=0),  # Sunday 8 PM
        'options': {'priority': 2}
    },
    
    # Cleanup expired data - daily at 2 AM
    'cleanup-expired-data': {
        'task': 'app.services.signal_scheduler.cleanup_expired_data_task',
        'schedule': crontab(hour=2, minute=0),  # 2 AM daily
        'options': {'priority': 1}
    },
    
    # Health check - every 5 minutes
    'signal-service-health-check': {
        'task': 'app.services.signal_scheduler.health_check_task',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
        'options': {'priority': 6}
    }
}


class SignalSchedulerService:
    """Service for managing scheduled signal operations"""
    
    def __init__(self):
        self.db = next(get_db())
        self.is_market_hours_cache = {}
        self.cache_expiry = None
    
    def is_market_hours(self, market: str = "NSE") -> bool:
        """Check if market is currently open"""
        now = datetime.now(timezone.utc)
        
        # Cache result for 1 minute to avoid repeated calculations
        if (self.cache_expiry and now < self.cache_expiry and 
            market in self.is_market_hours_cache):
            return self.is_market_hours_cache[market]
        
        # Convert to IST (UTC+5:30)
        ist_now = now + timedelta(hours=5, minutes=30)
        current_hour = ist_now.hour
        current_minute = ist_now.minute
        weekday = ist_now.weekday()  # 0=Monday, 6=Sunday
        
        # Check if it's a weekday (Monday=0 to Friday=4)
        if weekday > 4:  # Saturday or Sunday
            is_open = False
        else:
            # NSE: 9:15 AM to 3:30 PM IST
            if market == "NSE":
                if current_hour == 9 and current_minute >= 15:
                    is_open = True
                elif 10 <= current_hour <= 14:
                    is_open = True
                elif current_hour == 15 and current_minute <= 30:
                    is_open = True
                else:
                    is_open = False
            else:
                # Default to NSE hours
                is_open = False
        
        # Cache result
        self.is_market_hours_cache[market] = is_open
        self.cache_expiry = now + timedelta(minutes=1)
        
        return is_open
    
    def get_active_watchlist(self, market_type: str = "equity") -> List[Dict[str, str]]:
        """Get active watchlist for signal generation"""
        
        if market_type == "equity":
            # Top Indian stocks for equity signals
            return [
                {'symbol': 'RELIANCE', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'TCS', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'HDFCBANK', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'INFY', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'ICICIBANK', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'HINDUNILVR', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'ITC', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'SBIN', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'BHARTIARTL', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'KOTAKBANK', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'LT', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'ASIANPAINT', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'MARUTI', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'NTPC', 'asset_class': 'equity', 'exchange': 'NSE'},
                {'symbol': 'AXISBANK', 'asset_class': 'equity', 'exchange': 'NSE'},
            ]
        elif market_type == "crypto":
            # Major cryptocurrencies
            return [
                {'symbol': 'BTC-USD', 'asset_class': 'crypto', 'exchange': 'CRYPTO'},
                {'symbol': 'ETH-USD', 'asset_class': 'crypto', 'exchange': 'CRYPTO'},
                {'symbol': 'BNB-USD', 'asset_class': 'crypto', 'exchange': 'CRYPTO'},
                {'symbol': 'ADA-USD', 'asset_class': 'crypto', 'exchange': 'CRYPTO'},
                {'symbol': 'SOL-USD', 'asset_class': 'crypto', 'exchange': 'CRYPTO'},
                {'symbol': 'XRP-USD', 'asset_class': 'crypto', 'exchange': 'CRYPTO'},
                {'symbol': 'DOT-USD', 'asset_class': 'crypto', 'exchange': 'CRYPTO'},
                {'symbol': 'DOGE-USD', 'asset_class': 'crypto', 'exchange': 'CRYPTO'},
                {'symbol': 'AVAX-USD', 'asset_class': 'crypto', 'exchange': 'CRYPTO'},
                {'symbol': 'MATIC-USD', 'asset_class': 'crypto', 'exchange': 'CRYPTO'},
            ]
        else:
            return []
    
    async def update_provider_performance(self, provider_id: UUID, signals_generated: int, successful_signals: int):
        """Update provider performance metrics"""
        try:
            provider = self.db.query(SignalProvider).filter(
                SignalProvider.id == provider_id
            ).first()
            
            if provider:
                provider.total_signals += signals_generated
                provider.successful_signals += successful_signals
                provider.accuracy_score = provider.successful_signals / provider.total_signals if provider.total_signals > 0 else 0
                self.db.commit()
                
        except Exception as e:
            logger.error(f"Error updating provider performance: {str(e)}")
            self.db.rollback()


scheduler_service = SignalSchedulerService()


# Celery Tasks

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def generate_trading_signals_task(self):
    """Main signal generation task"""
    try:
        logger.info("Starting automated signal generation")
        
        # Check if market is open for equity signals
        if not scheduler_service.is_market_hours("NSE"):
            logger.info("Market is closed, skipping equity signal generation")
            return {"status": "skipped", "reason": "market_closed"}
        
        # Get equity watchlist
        watchlist = scheduler_service.get_active_watchlist("equity")
        
        # Run signal generation
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            signals = loop.run_until_complete(
                signal_service.generate_signals_for_watchlist(watchlist)
            )
            
            # Save and distribute signals
            saved_signals = []
            for signal_data in signals:
                # Get AI provider
                provider = next(get_db()).query(SignalProvider).filter(
                    SignalProvider.name == "TREUM AI Signal Engine"
                ).first()
                
                if provider:
                    saved_signal = loop.run_until_complete(
                        signal_service.save_signal_to_db(signal_data, provider.id)
                    )
                    
                    if saved_signal:
                        saved_signals.append(saved_signal)
                        
                        # Distribute signal immediately
                        loop.run_until_complete(
                            distribute_signal_to_users(saved_signal)
                        )
            
            logger.info(f"Generated and distributed {len(saved_signals)} equity signals")
            
            return {
                "status": "success",
                "signals_generated": len(saved_signals),
                "watchlist_size": len(watchlist),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Error in signal generation task: {str(e)}")
        self.retry(countdown=60, max_retries=3)


@celery_app.task(bind=True, max_retries=2, default_retry_delay=30)
def opening_signal_burst_task(self):
    """Generate more frequent signals during market opening"""
    try:
        logger.info("Starting opening signal burst")
        
        # Only run during market opening hours (9:15-10:00 AM IST)
        now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
        if not (now.hour == 9 and now.minute >= 15) and not (now.hour == 10 and now.minute == 0):
            return {"status": "skipped", "reason": "not_opening_hours"}
        
        # Focus on high-volume stocks during opening
        opening_watchlist = [
            {'symbol': 'RELIANCE', 'asset_class': 'equity', 'exchange': 'NSE'},
            {'symbol': 'TCS', 'asset_class': 'equity', 'exchange': 'NSE'},
            {'symbol': 'HDFCBANK', 'asset_class': 'equity', 'exchange': 'NSE'},
            {'symbol': 'INFY', 'asset_class': 'equity', 'exchange': 'NSE'},
            {'symbol': 'ICICIBANK', 'asset_class': 'equity', 'exchange': 'NSE'},
        ]
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            signals = loop.run_until_complete(
                signal_service.generate_signals_for_watchlist(opening_watchlist)
            )
            
            # Focus on high-priority signals only
            high_priority_signals = [
                s for s in signals 
                if s.get('priority') in [SignalPriority.HIGH, SignalPriority.CRITICAL]
            ]
            
            saved_signals = []
            for signal_data in high_priority_signals:
                provider = next(get_db()).query(SignalProvider).filter(
                    SignalProvider.name == "TREUM AI Signal Engine"
                ).first()
                
                if provider:
                    saved_signal = loop.run_until_complete(
                        signal_service.save_signal_to_db(signal_data, provider.id)
                    )
                    
                    if saved_signal:
                        saved_signals.append(saved_signal)
                        loop.run_until_complete(
                            distribute_signal_to_users(saved_signal)
                        )
            
            logger.info(f"Opening burst: {len(saved_signals)} high-priority signals")
            
            return {
                "status": "success",
                "signals_generated": len(saved_signals),
                "high_priority_only": True,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Error in opening signal burst: {str(e)}")
        self.retry(countdown=30, max_retries=2)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=120)
def generate_crypto_signals_task(self):
    """Generate cryptocurrency signals (24/7)"""
    try:
        logger.info("Starting crypto signal generation")
        
        # Get crypto watchlist
        crypto_watchlist = scheduler_service.get_active_watchlist("crypto")
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            signals = loop.run_until_complete(
                signal_service.generate_signals_for_watchlist(crypto_watchlist)
            )
            
            saved_signals = []
            for signal_data in signals:
                provider = next(get_db()).query(SignalProvider).filter(
                    SignalProvider.name == "TREUM AI Signal Engine"
                ).first()
                
                if provider:
                    saved_signal = loop.run_until_complete(
                        signal_service.save_signal_to_db(signal_data, provider.id)
                    )
                    
                    if saved_signal:
                        saved_signals.append(saved_signal)
                        loop.run_until_complete(
                            distribute_signal_to_users(saved_signal)
                        )
            
            logger.info(f"Generated and distributed {len(saved_signals)} crypto signals")
            
            return {
                "status": "success",
                "signals_generated": len(saved_signals),
                "market_type": "crypto",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Error in crypto signal generation: {str(e)}")
        self.retry(countdown=120, max_retries=3)


@celery_app.task(bind=True)
def expire_old_signals_task(self):
    """Expire old and invalid signals"""
    try:
        db = next(get_db())
        current_time = datetime.now(timezone.utc)
        
        # Find signals that should be expired
        expired_signals = db.query(TradingSignal).filter(
            TradingSignal.status == SignalStatus.ACTIVE,
            or_(
                TradingSignal.valid_until < current_time,
                TradingSignal.generated_at < current_time - timedelta(hours=24)
            )
        ).all()
        
        # Update status to expired
        for signal in expired_signals:
            signal.status = SignalStatus.EXPIRED
        
        db.commit()
        
        logger.info(f"Expired {len(expired_signals)} old signals")
        
        return {
            "status": "success",
            "signals_expired": len(expired_signals),
            "timestamp": current_time.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error expiring signals: {str(e)}")
        return {"status": "error", "message": str(e)}


@celery_app.task(bind=True)
def calculate_signal_analytics_task(self):
    """Calculate signal performance analytics"""
    try:
        db = next(get_db())
        current_time = datetime.now(timezone.utc)
        start_time = current_time - timedelta(hours=6)
        
        # Get signals from last 6 hours
        recent_signals = db.query(TradingSignal).filter(
            TradingSignal.generated_at >= start_time
        ).all()
        
        if not recent_signals:
            return {"status": "success", "message": "No recent signals to analyze"}
        
        # Calculate analytics
        total_signals = len(recent_signals)
        executed_signals = len([s for s in recent_signals if s.status == SignalStatus.EXECUTED])
        avg_confidence = sum([float(s.confidence_score) for s in recent_signals]) / total_signals
        
        # Calculate returns for executed signals
        executed_with_returns = [
            s for s in recent_signals 
            if s.status == SignalStatus.EXECUTED and s.actual_return_percentage is not None
        ]
        
        if executed_with_returns:
            avg_return = sum([float(s.actual_return_percentage) for s in executed_with_returns]) / len(executed_with_returns)
            win_rate = len([s for s in executed_with_returns if s.actual_return_percentage > 0]) / len(executed_with_returns)
        else:
            avg_return = 0.0
            win_rate = 0.0
        
        # Store analytics
        analytics = SignalAnalytics(
            date=current_time,
            period_type="6_hour",
            total_signals_generated=total_signals,
            total_signals_executed=executed_signals,
            average_confidence_score=avg_confidence,
            average_return=avg_return,
            win_rate=win_rate,
            execution_rate=executed_signals / total_signals if total_signals > 0 else 0
        )
        
        db.add(analytics)
        db.commit()
        
        logger.info(f"Calculated analytics for {total_signals} signals")
        
        return {
            "status": "success",
            "period": "6_hour",
            "total_signals": total_signals,
            "execution_rate": executed_signals / total_signals if total_signals > 0 else 0,
            "win_rate": win_rate,
            "average_return": avg_return
        }
        
    except Exception as e:
        logger.error(f"Error calculating analytics: {str(e)}")
        return {"status": "error", "message": str(e)}


@celery_app.task(bind=True)
def daily_performance_report_task(self):
    """Generate daily performance report"""
    try:
        db = next(get_db())
        today = datetime.now(timezone.utc).date()
        start_of_day = datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc)
        
        # Get today's signals
        daily_signals = db.query(TradingSignal).filter(
            TradingSignal.generated_at >= start_of_day
        ).all()
        
        # Get user subscriptions
        daily_subscriptions = db.query(SignalSubscription).filter(
            SignalSubscription.subscribed_at >= start_of_day
        ).count()
        
        # Calculate metrics
        total_signals = len(daily_signals)
        critical_signals = len([s for s in daily_signals if s.priority == SignalPriority.CRITICAL])
        high_signals = len([s for s in daily_signals if s.priority == SignalPriority.HIGH])
        
        report_data = {
            "date": today.isoformat(),
            "total_signals": total_signals,
            "priority_breakdown": {
                "critical": critical_signals,
                "high": high_signals,
                "medium": len([s for s in daily_signals if s.priority == SignalPriority.MEDIUM]),
                "low": len([s for s in daily_signals if s.priority == SignalPriority.LOW])
            },
            "new_subscriptions": daily_subscriptions,
            "asset_breakdown": {
                "equity": len([s for s in daily_signals if s.asset_class == "equity"]),
                "crypto": len([s for s in daily_signals if s.asset_class == "crypto"])
            }
        }
        
        logger.info(f"Daily report: {total_signals} signals, {daily_subscriptions} new subscriptions")
        
        # Store report (could be sent to admin dashboard or email)
        return {
            "status": "success",
            "report": report_data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating daily report: {str(e)}")
        return {"status": "error", "message": str(e)}


@celery_app.task(bind=True)
def weekly_strategy_review_task(self):
    """Weekly strategy review and optimization"""
    try:
        db = next(get_db())
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        
        # Get week's performance
        weekly_signals = db.query(TradingSignal).filter(
            TradingSignal.generated_at >= week_ago
        ).all()
        
        # Analyze provider performance
        providers = db.query(SignalProvider).all()
        provider_performance = {}
        
        for provider in providers:
            provider_signals = [s for s in weekly_signals if s.provider_id == provider.id]
            if provider_signals:
                executed = [s for s in provider_signals if s.status == SignalStatus.EXECUTED and s.actual_return_percentage]
                if executed:
                    avg_return = sum([float(s.actual_return_percentage) for s in executed]) / len(executed)
                    win_rate = len([s for s in executed if s.actual_return_percentage > 0]) / len(executed)
                    provider_performance[str(provider.id)] = {
                        "name": provider.name,
                        "signals": len(provider_signals),
                        "executed": len(executed),
                        "avg_return": avg_return,
                        "win_rate": win_rate
                    }
        
        logger.info(f"Weekly review: Analyzed {len(weekly_signals)} signals from {len(providers)} providers")
        
        return {
            "status": "success",
            "period": "weekly",
            "total_signals": len(weekly_signals),
            "provider_performance": provider_performance,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in weekly review: {str(e)}")
        return {"status": "error", "message": str(e)}


@celery_app.task(bind=True)
def cleanup_expired_data_task(self):
    """Clean up expired data and old records"""
    try:
        db = next(get_db())
        
        # Delete signals older than 30 days
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        
        old_signals = db.query(TradingSignal).filter(
            TradingSignal.generated_at < thirty_days_ago
        ).count()
        
        db.query(TradingSignal).filter(
            TradingSignal.generated_at < thirty_days_ago
        ).delete()
        
        # Delete old analytics older than 90 days
        ninety_days_ago = datetime.now(timezone.utc) - timedelta(days=90)
        
        old_analytics = db.query(SignalAnalytics).filter(
            SignalAnalytics.date < ninety_days_ago
        ).count()
        
        db.query(SignalAnalytics).filter(
            SignalAnalytics.date < ninety_days_ago
        ).delete()
        
        db.commit()
        
        logger.info(f"Cleanup: Removed {old_signals} old signals and {old_analytics} old analytics")
        
        return {
            "status": "success",
            "signals_deleted": old_signals,
            "analytics_deleted": old_analytics,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in cleanup task: {str(e)}")
        db.rollback()
        return {"status": "error", "message": str(e)}


@celery_app.task(bind=True)
def health_check_task(self):
    """Health check for signal services"""
    try:
        db = next(get_db())
        current_time = datetime.now(timezone.utc)
        
        # Check recent signal generation
        recent_signals = db.query(TradingSignal).filter(
            TradingSignal.generated_at >= current_time - timedelta(hours=1)
        ).count()
        
        # Check active providers
        active_providers = db.query(SignalProvider).filter(
            SignalProvider.is_active == True
        ).count()
        
        # Check WebSocket connections
        websocket_stats = distribution_service.get_distribution_stats()
        
        health_status = {
            "timestamp": current_time.isoformat(),
            "signals_last_hour": recent_signals,
            "active_providers": active_providers,
            "websocket_connections": websocket_stats.get("websocket_stats", {}).get("total_connections", 0),
            "status": "healthy" if recent_signals > 0 and active_providers > 0 else "warning"
        }
        
        if health_status["status"] == "warning":
            logger.warning(f"Health check warning: {health_status}")
        
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


# Manual task triggers (can be called via API)

@celery_app.task
def manual_signal_generation_task(watchlist: List[Dict[str, str]], user_id: str):
    """Manual signal generation triggered by admin"""
    try:
        logger.info(f"Manual signal generation triggered by user {user_id}")
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            signals = loop.run_until_complete(
                signal_service.generate_signals_for_watchlist(watchlist)
            )
            
            saved_signals = []
            for signal_data in signals:
                provider = next(get_db()).query(SignalProvider).filter(
                    SignalProvider.name == "TREUM AI Signal Engine"
                ).first()
                
                if provider:
                    saved_signal = loop.run_until_complete(
                        signal_service.save_signal_to_db(signal_data, provider.id)
                    )
                    
                    if saved_signal:
                        saved_signals.append(saved_signal)
                        loop.run_until_complete(
                            distribute_signal_to_users(saved_signal)
                        )
            
            logger.info(f"Manual generation: {len(saved_signals)} signals created")
            
            return {
                "status": "success",
                "signals_generated": len(saved_signals),
                "triggered_by": user_id,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Error in manual signal generation: {str(e)}")
        return {"status": "error", "message": str(e)}


# Initialize scheduler
async def initialize_signal_scheduler():
    """Initialize the signal scheduler service"""
    await distribution_service.initialize()
    logger.info("Signal scheduler initialized")