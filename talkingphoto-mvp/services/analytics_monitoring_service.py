"""
TalkingPhoto MVP - Analytics and Monitoring Service
Comprehensive tracking for conversion metrics, performance monitoring, and business intelligence
"""

import asyncio
import json
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import structlog
from collections import defaultdict, Counter

from models.video import VideoGeneration, VideoStatus, AIProvider
from models.user import User
from models.file import UploadedFile
from core.database import db
from core.cache import cached_result
from flask import current_app
import redis

logger = structlog.get_logger()


class EventType(Enum):
    """Analytics event types"""
    USER_REGISTRATION = "user_registration"
    VIDEO_UPLOAD = "video_upload"
    SCRIPT_INPUT = "script_input"
    VIDEO_GENERATION_STARTED = "video_generation_started"
    VIDEO_GENERATION_COMPLETED = "video_generation_completed"
    VIDEO_GENERATION_FAILED = "video_generation_failed"
    VIDEO_DOWNLOAD = "video_download"
    VIDEO_SHARE = "video_share"
    PAYMENT_COMPLETED = "payment_completed"
    CREDITS_PURCHASED = "credits_purchased"
    USER_RETENTION = "user_retention"
    QUALITY_FEEDBACK = "quality_feedback"
    ERROR_RECOVERY = "error_recovery"
    PERFORMANCE_METRIC = "performance_metric"


class ConversionFunnel(Enum):
    """Conversion funnel stages"""
    LANDING = "landing"
    SIGNUP = "signup"
    UPLOAD = "upload"
    SCRIPT = "script"
    GENERATION = "generation"
    COMPLETION = "completion"
    DOWNLOAD = "download"
    RETENTION = "retention"


@dataclass
class AnalyticsEvent:
    """Analytics event structure"""
    event_type: EventType
    user_id: Optional[str]
    session_id: Optional[str]
    timestamp: datetime
    properties: Dict[str, Any]
    metadata: Dict[str, Any]


@dataclass
class PerformanceMetric:
    """Performance monitoring metric"""
    metric_name: str
    value: float
    unit: str
    timestamp: datetime
    tags: Dict[str, str]


class AnalyticsMonitoringService:
    """
    Comprehensive analytics and monitoring service
    """

    def __init__(self):
        self.redis_client = redis.Redis(
            host=current_app.config.get('REDIS_HOST', 'localhost'),
            port=current_app.config.get('REDIS_PORT', 6379),
            decode_responses=True
        )

        # Event buffers for batch processing
        self.event_buffer = []
        self.metrics_buffer = []

        # Conversion tracking
        self.funnel_stages = [stage.value for stage in ConversionFunnel]

        # Performance thresholds
        self.performance_thresholds = {
            'video_generation_time': 30.0,  # seconds
            'api_response_time': 1.0,  # seconds
            'error_rate': 0.05,  # 5%
            'user_satisfaction': 8.0,  # out of 10
            'system_uptime': 0.999  # 99.9%
        }

    async def track_event(
        self,
        event_type: EventType,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        properties: Dict[str, Any] = None,
        metadata: Dict[str, Any] = None
    ) -> None:
        """
        Track analytics event
        """
        try:
            event = AnalyticsEvent(
                event_type=event_type,
                user_id=user_id,
                session_id=session_id,
                timestamp=datetime.now(timezone.utc),
                properties=properties or {},
                metadata=metadata or {}
            )

            # Add to buffer for batch processing
            self.event_buffer.append(event)

            # Store in Redis for real-time processing
            await self._store_event_in_redis(event)

            # Update conversion funnel
            await self._update_conversion_funnel(event)

            # Update real-time metrics
            await self._update_realtime_metrics(event)

            logger.info("Analytics event tracked",
                       event_type=event_type.value,
                       user_id=user_id,
                       properties=properties)

        except Exception as e:
            logger.error("Failed to track analytics event",
                        event_type=event_type.value,
                        error=str(e))

    async def track_performance_metric(
        self,
        metric_name: str,
        value: float,
        unit: str = "",
        tags: Dict[str, str] = None
    ) -> None:
        """
        Track performance metric
        """
        try:
            metric = PerformanceMetric(
                metric_name=metric_name,
                value=value,
                unit=unit,
                timestamp=datetime.now(timezone.utc),
                tags=tags or {}
            )

            # Add to buffer
            self.metrics_buffer.append(metric)

            # Store in Redis for real-time monitoring
            await self._store_metric_in_redis(metric)

            # Check against thresholds
            await self._check_performance_thresholds(metric)

            logger.info("Performance metric tracked",
                       metric=metric_name,
                       value=value,
                       unit=unit)

        except Exception as e:
            logger.error("Failed to track performance metric",
                        metric=metric_name,
                        error=str(e))

    # Video Generation Analytics
    async def track_video_generation_start(
        self,
        video_generation: VideoGeneration
    ) -> None:
        """
        Track start of video generation
        """
        await self.track_event(
            EventType.VIDEO_GENERATION_STARTED,
            user_id=video_generation.user_id,
            properties={
                'video_id': video_generation.id,
                'ai_provider': video_generation.ai_provider.value,
                'quality': video_generation.video_quality.value,
                'script_length': len(video_generation.script_text),
                'duration_seconds': video_generation.duration_seconds,
                'aspect_ratio': video_generation.aspect_ratio.value,
                'voice_language': video_generation.voice_settings.get('language', 'unknown') if video_generation.voice_settings else 'unknown'
            },
            metadata={
                'source_file_size': video_generation.source_file.file_size if video_generation.source_file else 0,
                'estimated_cost': getattr(video_generation, 'estimated_cost', 0)
            }
        )

    async def track_video_generation_completion(
        self,
        video_generation: VideoGeneration,
        processing_time: float,
        output_file_size: int,
        quality_metrics: Dict[str, Any] = None
    ) -> None:
        """
        Track successful video generation completion
        """
        await self.track_event(
            EventType.VIDEO_GENERATION_COMPLETED,
            user_id=video_generation.user_id,
            properties={
                'video_id': video_generation.id,
                'processing_time_seconds': processing_time,
                'ai_provider': video_generation.ai_provider.value,
                'quality': video_generation.video_quality.value,
                'output_file_size': output_file_size,
                'fallback_used': getattr(video_generation, 'fallback_provider', None) is not None,
                'success_rate': 1.0,
                **quality_metrics or {}
            }
        )

        # Track performance metrics
        await self.track_performance_metric(
            'video_generation_time',
            processing_time,
            'seconds',
            {
                'provider': video_generation.ai_provider.value,
                'quality': video_generation.video_quality.value
            }
        )

    async def track_video_generation_failure(
        self,
        video_generation: VideoGeneration,
        error_message: str,
        error_type: str,
        recovery_attempted: bool = False
    ) -> None:
        """
        Track failed video generation
        """
        await self.track_event(
            EventType.VIDEO_GENERATION_FAILED,
            user_id=video_generation.user_id,
            properties={
                'video_id': video_generation.id,
                'error_type': error_type,
                'error_message': error_message,
                'ai_provider': video_generation.ai_provider.value,
                'recovery_attempted': recovery_attempted,
                'success_rate': 0.0
            }
        )

    # Conversion Funnel Analytics
    async def track_user_registration(
        self,
        user_id: str,
        registration_method: str,
        utm_source: str = None
    ) -> None:
        """
        Track user registration
        """
        await self.track_event(
            EventType.USER_REGISTRATION,
            user_id=user_id,
            properties={
                'registration_method': registration_method,
                'utm_source': utm_source,
                'funnel_stage': ConversionFunnel.SIGNUP.value
            }
        )

    async def track_video_upload(
        self,
        user_id: str,
        file_size: int,
        file_type: str,
        upload_time: float
    ) -> None:
        """
        Track video upload
        """
        await self.track_event(
            EventType.VIDEO_UPLOAD,
            user_id=user_id,
            properties={
                'file_size': file_size,
                'file_type': file_type,
                'upload_time_seconds': upload_time,
                'funnel_stage': ConversionFunnel.UPLOAD.value
            }
        )

    async def track_video_download(
        self,
        user_id: str,
        video_id: str,
        download_format: str = 'mp4'
    ) -> None:
        """
        Track video download
        """
        await self.track_event(
            EventType.VIDEO_DOWNLOAD,
            user_id=user_id,
            properties={
                'video_id': video_id,
                'download_format': download_format,
                'funnel_stage': ConversionFunnel.DOWNLOAD.value
            }
        )

    # Business Intelligence Methods
    async def get_conversion_funnel_metrics(
        self,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """
        Get conversion funnel metrics for date range
        """
        try:
            funnel_data = {}

            for stage in ConversionFunnel:
                # Count events for this funnel stage
                count = await self._count_events_by_stage(
                    stage.value,
                    start_date,
                    end_date
                )
                funnel_data[stage.value] = count

            # Calculate conversion rates
            conversion_rates = {}
            for i, stage in enumerate(ConversionFunnel):
                if i > 0:
                    prev_stage = list(ConversionFunnel)[i - 1]
                    if funnel_data[prev_stage.value] > 0:
                        conversion_rates[f"{prev_stage.value}_to_{stage.value}"] = (
                            funnel_data[stage.value] / funnel_data[prev_stage.value] * 100
                        )

            return {
                'funnel_counts': funnel_data,
                'conversion_rates': conversion_rates,
                'date_range': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat()
                },
                'total_users_entered': funnel_data.get(ConversionFunnel.LANDING.value, 0),
                'total_conversions': funnel_data.get(ConversionFunnel.COMPLETION.value, 0),
                'overall_conversion_rate': (
                    funnel_data.get(ConversionFunnel.COMPLETION.value, 0) /
                    max(1, funnel_data.get(ConversionFunnel.LANDING.value, 1)) * 100
                )
            }

        except Exception as e:
            logger.error("Failed to get conversion funnel metrics", error=str(e))
            return {'error': str(e)}

    async def get_performance_dashboard(self) -> Dict[str, Any]:
        """
        Get real-time performance dashboard data
        """
        try:
            dashboard_data = {
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'video_generation': {},
                'system_health': {},
                'user_activity': {},
                'revenue_metrics': {}
            }

            # Video generation metrics
            dashboard_data['video_generation'] = await self._get_video_generation_metrics()

            # System health metrics
            dashboard_data['system_health'] = await self._get_system_health_metrics()

            # User activity metrics
            dashboard_data['user_activity'] = await self._get_user_activity_metrics()

            # Revenue metrics
            dashboard_data['revenue_metrics'] = await self._get_revenue_metrics()

            return dashboard_data

        except Exception as e:
            logger.error("Failed to get performance dashboard", error=str(e))
            return {'error': str(e)}

    async def get_ai_provider_performance(
        self,
        days: int = 7
    ) -> Dict[str, Any]:
        """
        Get AI provider performance comparison
        """
        try:
            end_date = datetime.now(timezone.utc)
            start_date = end_date - timedelta(days=days)

            provider_metrics = {}

            for provider in AIProvider:
                metrics = await self._get_provider_metrics(provider, start_date, end_date)
                provider_metrics[provider.value] = metrics

            # Calculate rankings
            rankings = self._calculate_provider_rankings(provider_metrics)

            return {
                'provider_metrics': provider_metrics,
                'rankings': rankings,
                'date_range': {
                    'start': start_date.isoformat(),
                    'end': end_date.isoformat(),
                    'days': days
                },
                'recommendations': self._generate_provider_recommendations(provider_metrics)
            }

        except Exception as e:
            logger.error("Failed to get AI provider performance", error=str(e))
            return {'error': str(e)}

    # Internal helper methods
    async def _store_event_in_redis(self, event: AnalyticsEvent) -> None:
        """Store event in Redis for real-time processing"""
        try:
            event_key = f"analytics:events:{event.timestamp.strftime('%Y%m%d')}"
            event_data = {
                'type': event.event_type.value,
                'user_id': event.user_id,
                'timestamp': event.timestamp.isoformat(),
                'properties': json.dumps(event.properties),
                'metadata': json.dumps(event.metadata)
            }

            self.redis_client.lpush(event_key, json.dumps(event_data))
            self.redis_client.expire(event_key, 86400 * 7)  # Keep for 7 days

        except Exception as e:
            logger.error("Failed to store event in Redis", error=str(e))

    async def _store_metric_in_redis(self, metric: PerformanceMetric) -> None:
        """Store performance metric in Redis"""
        try:
            metric_key = f"metrics:{metric.metric_name}:{metric.timestamp.strftime('%Y%m%d%H')}"
            metric_data = {
                'value': metric.value,
                'unit': metric.unit,
                'timestamp': metric.timestamp.isoformat(),
                'tags': json.dumps(metric.tags)
            }

            self.redis_client.lpush(metric_key, json.dumps(metric_data))
            self.redis_client.expire(metric_key, 86400 * 30)  # Keep for 30 days

        except Exception as e:
            logger.error("Failed to store metric in Redis", error=str(e))

    async def _update_conversion_funnel(self, event: AnalyticsEvent) -> None:
        """Update conversion funnel counters"""
        try:
            funnel_stage = event.properties.get('funnel_stage')
            if funnel_stage:
                today = datetime.now(timezone.utc).strftime('%Y%m%d')
                funnel_key = f"funnel:{today}:{funnel_stage}"
                self.redis_client.incr(funnel_key)
                self.redis_client.expire(funnel_key, 86400 * 90)  # Keep for 90 days

        except Exception as e:
            logger.error("Failed to update conversion funnel", error=str(e))

    async def _update_realtime_metrics(self, event: AnalyticsEvent) -> None:
        """Update real-time metrics counters"""
        try:
            current_hour = datetime.now(timezone.utc).strftime('%Y%m%d%H')

            # Update event count
            event_key = f"realtime:events:{current_hour}"
            self.redis_client.incr(event_key)
            self.redis_client.expire(event_key, 86400)

            # Update user activity
            if event.user_id:
                user_key = f"realtime:active_users:{current_hour}"
                self.redis_client.sadd(user_key, event.user_id)
                self.redis_client.expire(user_key, 86400)

        except Exception as e:
            logger.error("Failed to update realtime metrics", error=str(e))

    async def _check_performance_thresholds(self, metric: PerformanceMetric) -> None:
        """Check if metric exceeds performance thresholds"""
        try:
            threshold = self.performance_thresholds.get(metric.metric_name)
            if threshold and metric.value > threshold:
                # Alert on threshold breach
                logger.warning("Performance threshold breached",
                             metric=metric.metric_name,
                             value=metric.value,
                             threshold=threshold,
                             tags=metric.tags)

                # Could trigger alerts here
                await self._trigger_performance_alert(metric, threshold)

        except Exception as e:
            logger.error("Failed to check performance thresholds", error=str(e))

    async def _trigger_performance_alert(
        self,
        metric: PerformanceMetric,
        threshold: float
    ) -> None:
        """Trigger performance alert"""
        try:
            alert_data = {
                'alert_type': 'performance_threshold_breach',
                'metric_name': metric.metric_name,
                'current_value': metric.value,
                'threshold': threshold,
                'severity': 'high' if metric.value > threshold * 2 else 'medium',
                'timestamp': metric.timestamp.isoformat(),
                'tags': metric.tags
            }

            # Store alert
            alert_key = f"alerts:performance:{metric.timestamp.strftime('%Y%m%d')}"
            self.redis_client.lpush(alert_key, json.dumps(alert_data))
            self.redis_client.expire(alert_key, 86400 * 7)

            # Could send to external monitoring systems here
            logger.info("Performance alert triggered", **alert_data)

        except Exception as e:
            logger.error("Failed to trigger performance alert", error=str(e))

    async def _count_events_by_stage(
        self,
        stage: str,
        start_date: datetime,
        end_date: datetime
    ) -> int:
        """Count events for a specific funnel stage"""
        try:
            total_count = 0
            current_date = start_date.date()
            end_date_date = end_date.date()

            while current_date <= end_date_date:
                date_str = current_date.strftime('%Y%m%d')
                funnel_key = f"funnel:{date_str}:{stage}"
                count = self.redis_client.get(funnel_key)
                total_count += int(count) if count else 0
                current_date += timedelta(days=1)

            return total_count

        except Exception as e:
            logger.error("Failed to count events by stage", stage=stage, error=str(e))
            return 0

    async def _get_video_generation_metrics(self) -> Dict[str, Any]:
        """Get video generation performance metrics"""
        try:
            # Get recent video generations
            recent_videos = VideoGeneration.query.filter(
                VideoGeneration.created_at >= datetime.now(timezone.utc) - timedelta(hours=24)
            ).all()

            total_videos = len(recent_videos)
            completed_videos = sum(1 for v in recent_videos if v.status == VideoStatus.COMPLETED)
            failed_videos = sum(1 for v in recent_videos if v.status == VideoStatus.FAILED)

            success_rate = (completed_videos / max(1, total_videos)) * 100

            # Calculate average processing time
            completed_with_time = [v for v in recent_videos
                                 if v.status == VideoStatus.COMPLETED and v.processing_time]
            avg_processing_time = (
                sum(v.processing_time for v in completed_with_time) /
                max(1, len(completed_with_time))
            ) if completed_with_time else 0

            return {
                'total_videos_24h': total_videos,
                'completed_videos_24h': completed_videos,
                'failed_videos_24h': failed_videos,
                'success_rate_percent': success_rate,
                'average_processing_time_seconds': avg_processing_time,
                'videos_in_progress': sum(1 for v in recent_videos if v.status == VideoStatus.PROCESSING)
            }

        except Exception as e:
            logger.error("Failed to get video generation metrics", error=str(e))
            return {}

    async def _get_system_health_metrics(self) -> Dict[str, Any]:
        """Get system health metrics"""
        try:
            # Get error rates from Redis
            current_hour = datetime.now(timezone.utc).strftime('%Y%m%d%H')
            error_key = f"realtime:errors:{current_hour}"
            total_key = f"realtime:requests:{current_hour}"

            errors = int(self.redis_client.get(error_key) or 0)
            total_requests = int(self.redis_client.get(total_key) or 1)

            error_rate = (errors / total_requests) * 100

            return {
                'error_rate_percent': error_rate,
                'total_requests_1h': total_requests,
                'total_errors_1h': errors,
                'system_status': 'healthy' if error_rate < 5 else 'degraded' if error_rate < 15 else 'unhealthy'
            }

        except Exception as e:
            logger.error("Failed to get system health metrics", error=str(e))
            return {}

    async def _get_user_activity_metrics(self) -> Dict[str, Any]:
        """Get user activity metrics"""
        try:
            current_hour = datetime.now(timezone.utc).strftime('%Y%m%d%H')
            user_key = f"realtime:active_users:{current_hour}"

            active_users_1h = self.redis_client.scard(user_key)

            # Get daily active users
            today = datetime.now(timezone.utc).strftime('%Y%m%d')
            daily_user_key = f"analytics:dau:{today}"
            daily_active_users = self.redis_client.scard(daily_user_key)

            return {
                'active_users_1h': active_users_1h,
                'daily_active_users': daily_active_users,
                'avg_session_duration_minutes': 0,  # Would need session tracking
                'new_users_today': 0  # Would need registration tracking
            }

        except Exception as e:
            logger.error("Failed to get user activity metrics", error=str(e))
            return {}

    async def _get_revenue_metrics(self) -> Dict[str, Any]:
        """Get revenue metrics"""
        try:
            # This would integrate with payment service
            return {
                'revenue_today_usd': 0,
                'revenue_this_month_usd': 0,
                'avg_revenue_per_user': 0,
                'conversion_to_paid_percent': 0
            }

        except Exception as e:
            logger.error("Failed to get revenue metrics", error=str(e))
            return {}

    async def _get_provider_metrics(
        self,
        provider: AIProvider,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """Get metrics for specific AI provider"""
        try:
            # Query video generations for this provider
            videos = VideoGeneration.query.filter(
                VideoGeneration.ai_provider == provider,
                VideoGeneration.created_at >= start_date,
                VideoGeneration.created_at <= end_date
            ).all()

            total_videos = len(videos)
            completed_videos = sum(1 for v in videos if v.status == VideoStatus.COMPLETED)
            failed_videos = sum(1 for v in videos if v.status == VideoStatus.FAILED)

            success_rate = (completed_videos / max(1, total_videos)) * 100

            # Calculate average processing time and cost
            completed_with_time = [v for v in videos
                                 if v.status == VideoStatus.COMPLETED and v.processing_time]
            avg_processing_time = (
                sum(v.processing_time for v in completed_with_time) /
                max(1, len(completed_with_time))
            ) if completed_with_time else 0

            total_cost = sum(v.processing_cost or 0 for v in videos)

            return {
                'total_videos': total_videos,
                'success_rate': success_rate,
                'average_processing_time': avg_processing_time,
                'total_cost': total_cost,
                'cost_per_video': total_cost / max(1, total_videos),
                'fallback_usage': sum(1 for v in videos if getattr(v, 'fallback_provider', None))
            }

        except Exception as e:
            logger.error("Failed to get provider metrics", provider=provider.value, error=str(e))
            return {}

    def _calculate_provider_rankings(self, provider_metrics: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate provider rankings based on performance"""
        rankings = {
            'by_success_rate': [],
            'by_speed': [],
            'by_cost_efficiency': [],
            'overall': []
        }

        providers = list(provider_metrics.keys())

        # Rank by success rate
        rankings['by_success_rate'] = sorted(
            providers,
            key=lambda p: provider_metrics[p].get('success_rate', 0),
            reverse=True
        )

        # Rank by speed (lower is better)
        rankings['by_speed'] = sorted(
            providers,
            key=lambda p: provider_metrics[p].get('average_processing_time', float('inf'))
        )

        # Rank by cost efficiency (lower cost per video is better)
        rankings['by_cost_efficiency'] = sorted(
            providers,
            key=lambda p: provider_metrics[p].get('cost_per_video', float('inf'))
        )

        # Calculate overall ranking (weighted combination)
        def overall_score(provider):
            metrics = provider_metrics[provider]
            success_weight = 0.4
            speed_weight = 0.3
            cost_weight = 0.3

            success_score = metrics.get('success_rate', 0) / 100
            # Normalize speed (assume 30s is baseline)
            speed_score = max(0, 1 - (metrics.get('average_processing_time', 30) / 60))
            # Normalize cost (assume $0.20 is baseline)
            cost_score = max(0, 1 - (metrics.get('cost_per_video', 0.20) / 0.40))

            return (success_weight * success_score +
                   speed_weight * speed_score +
                   cost_weight * cost_score)

        rankings['overall'] = sorted(providers, key=overall_score, reverse=True)

        return rankings

    def _generate_provider_recommendations(self, provider_metrics: Dict[str, Dict[str, Any]]) -> List[str]:
        """Generate recommendations based on provider performance"""
        recommendations = []

        for provider, metrics in provider_metrics.items():
            success_rate = metrics.get('success_rate', 0)
            avg_time = metrics.get('average_processing_time', 0)
            cost_per_video = metrics.get('cost_per_video', 0)

            if success_rate < 80:
                recommendations.append(f"Consider reducing {provider} usage due to low success rate ({success_rate:.1f}%)")

            if avg_time > 45:
                recommendations.append(f"Monitor {provider} performance - processing time is high ({avg_time:.1f}s)")

            if cost_per_video > 0.25:
                recommendations.append(f"Review {provider} cost efficiency - ${cost_per_video:.3f} per video")

        if not recommendations:
            recommendations.append("All AI providers are performing within acceptable parameters")

        return recommendations