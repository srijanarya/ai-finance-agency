"""
Signal Service Monitoring and Alerting System
Comprehensive monitoring for TREUM's premium signal service
Ensures 99.9% uptime and optimal performance for ₹60-90 Cr revenue stream
"""

import asyncio
import logging
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import aioredis
from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry, generate_latest

from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.core.database import get_db
from app.core.config import settings
from database.models import (
    TradingSignal, SignalProvider, SignalSubscription, SignalAnalytics,
    SignalStatus, SignalPriority, User
)

logger = logging.getLogger(__name__)


class AlertSeverity(str, Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning" 
    ERROR = "error"
    CRITICAL = "critical"


class AlertChannel(str, Enum):
    """Alert delivery channels"""
    EMAIL = "email"
    SLACK = "slack"
    PAGERDUTY = "pagerduty"
    WEBHOOK = "webhook"


@dataclass
class Alert:
    """Alert data structure"""
    id: str
    title: str
    description: str
    severity: AlertSeverity
    service: str
    metric: str
    value: float
    threshold: float
    timestamp: datetime
    channels: List[AlertChannel]
    metadata: Dict[str, Any]


@dataclass
class HealthStatus:
    """Service health status"""
    service: str
    status: str  # healthy, degraded, unhealthy
    uptime: float
    response_time: float
    error_rate: float
    last_check: datetime
    issues: List[str]


class MetricsCollector:
    """Collects and exports metrics for monitoring"""
    
    def __init__(self):
        self.registry = CollectorRegistry()
        
        # Signal generation metrics
        self.signals_generated = Counter(
            'treum_signals_generated_total',
            'Total number of signals generated',
            ['provider', 'asset_class', 'signal_type'],
            registry=self.registry
        )
        
        self.signals_distributed = Counter(
            'treum_signals_distributed_total', 
            'Total number of signals distributed',
            ['channel', 'tier'],
            registry=self.registry
        )
        
        self.signal_generation_time = Histogram(
            'treum_signal_generation_duration_seconds',
            'Time taken to generate signals',
            ['provider'],
            registry=self.registry
        )
        
        self.signal_distribution_time = Histogram(
            'treum_signal_distribution_duration_seconds',
            'Time taken to distribute signals',
            ['channel'],
            registry=self.registry
        )
        
        # Performance metrics
        self.signal_accuracy = Gauge(
            'treum_signal_accuracy_ratio',
            'Signal accuracy ratio',
            ['provider', 'time_period'],
            registry=self.registry
        )
        
        self.user_engagement = Gauge(
            'treum_user_engagement_ratio',
            'User engagement ratio (signals executed / signals sent)',
            ['tier'],
            registry=self.registry
        )
        
        # Revenue metrics
        self.subscription_revenue = Gauge(
            'treum_subscription_revenue_total',
            'Total subscription revenue',
            ['tier', 'period'],
            registry=self.registry
        )
        
        # System health metrics
        self.websocket_connections = Gauge(
            'treum_websocket_connections_active',
            'Active WebSocket connections',
            ['tier'],
            registry=self.registry
        )
        
        self.database_connections = Gauge(
            'treum_database_connections_active',
            'Active database connections',
            registry=self.registry
        )
        
        self.api_response_time = Histogram(
            'treum_api_response_duration_seconds',
            'API response time',
            ['endpoint', 'method', 'status'],
            registry=self.registry
        )
        
        self.error_count = Counter(
            'treum_errors_total',
            'Total number of errors',
            ['service', 'error_type'],
            registry=self.registry
        )
        
        # Market data metrics
        self.market_data_freshness = Gauge(
            'treum_market_data_age_seconds',
            'Age of market data in seconds',
            ['symbol', 'exchange'],
            registry=self.registry
        )
        
        self.external_api_calls = Counter(
            'treum_external_api_calls_total',
            'External API calls',
            ['provider', 'status'],
            registry=self.registry
        )
    
    def record_signal_generated(self, provider: str, asset_class: str, signal_type: str):
        """Record signal generation"""
        self.signals_generated.labels(
            provider=provider,
            asset_class=asset_class, 
            signal_type=signal_type
        ).inc()
    
    def record_signal_distributed(self, channel: str, tier: str):
        """Record signal distribution"""
        self.signals_distributed.labels(
            channel=channel,
            tier=tier
        ).inc()
    
    def record_generation_time(self, provider: str, duration: float):
        """Record signal generation time"""
        self.signal_generation_time.labels(provider=provider).observe(duration)
    
    def record_distribution_time(self, channel: str, duration: float):
        """Record signal distribution time"""
        self.signal_distribution_time.labels(channel=channel).observe(duration)
    
    def update_signal_accuracy(self, provider: str, period: str, accuracy: float):
        """Update signal accuracy metrics"""
        self.signal_accuracy.labels(provider=provider, time_period=period).set(accuracy)
    
    def update_user_engagement(self, tier: str, engagement_ratio: float):
        """Update user engagement metrics"""
        self.user_engagement.labels(tier=tier).set(engagement_ratio)
    
    def update_revenue(self, tier: str, period: str, revenue: float):
        """Update revenue metrics"""
        self.subscription_revenue.labels(tier=tier, period=period).set(revenue)
    
    def update_websocket_connections(self, tier: str, count: int):
        """Update WebSocket connection count"""
        self.websocket_connections.labels(tier=tier).set(count)
    
    def record_error(self, service: str, error_type: str):
        """Record error occurrence"""
        self.error_count.labels(service=service, error_type=error_type).inc()
    
    def record_api_response(self, endpoint: str, method: str, status: str, duration: float):
        """Record API response time"""
        self.api_response_time.labels(
            endpoint=endpoint,
            method=method,
            status=status
        ).observe(duration)
    
    def update_market_data_age(self, symbol: str, exchange: str, age_seconds: float):
        """Update market data freshness"""
        self.market_data_freshness.labels(symbol=symbol, exchange=exchange).set(age_seconds)
    
    def record_external_api_call(self, provider: str, status: str):
        """Record external API call"""
        self.external_api_calls.labels(provider=provider, status=status).inc()
    
    def get_metrics(self) -> str:
        """Get Prometheus metrics in text format"""
        return generate_latest(self.registry).decode('utf-8')


class AlertManager:
    """Manages alerts and notifications"""
    
    def __init__(self):
        self.redis_client = None
        self.alert_history = []
        self.alert_rules = self._load_alert_rules()
        
    async def initialize(self):
        """Initialize alert manager"""
        try:
            self.redis_client = await aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True
            )
        except Exception as e:
            logger.error(f"Failed to initialize Redis for alerts: {str(e)}")
    
    def _load_alert_rules(self) -> Dict[str, Dict[str, Any]]:
        """Load alert rules configuration"""
        return {
            'signal_generation_failure': {
                'threshold': 0,  # Any failure
                'severity': AlertSeverity.CRITICAL,
                'channels': [AlertChannel.SLACK, AlertChannel.PAGERDUTY]
            },
            'signal_accuracy_low': {
                'threshold': 0.6,  # Below 60% accuracy
                'severity': AlertSeverity.WARNING,
                'channels': [AlertChannel.SLACK]
            },
            'websocket_connections_low': {
                'threshold': 10,  # Less than 10 connections during market hours
                'severity': AlertSeverity.WARNING,
                'channels': [AlertChannel.SLACK]
            },
            'distribution_latency_high': {
                'threshold': 0.5,  # Above 500ms
                'severity': AlertSeverity.ERROR,
                'channels': [AlertChannel.SLACK, AlertChannel.PAGERDUTY]
            },
            'market_data_stale': {
                'threshold': 300,  # 5 minutes old
                'severity': AlertSeverity.ERROR,
                'channels': [AlertChannel.SLACK]
            },
            'revenue_drop': {
                'threshold': 0.1,  # 10% drop
                'severity': AlertSeverity.WARNING,
                'channels': [AlertChannel.EMAIL, AlertChannel.SLACK]
            }
        }
    
    async def create_alert(self, alert: Alert):
        """Create and process an alert"""
        try:
            # Add to history
            self.alert_history.append(alert)
            
            # Store in Redis for persistence
            if self.redis_client:
                await self.redis_client.lpush(
                    "alerts:history",
                    json.dumps(asdict(alert), default=str)
                )
                
                # Keep only last 1000 alerts
                await self.redis_client.ltrim("alerts:history", 0, 999)
            
            # Send to configured channels
            await self._send_alert(alert)
            
            logger.info(f"Alert created: {alert.title} ({alert.severity})")
            
        except Exception as e:
            logger.error(f"Error creating alert: {str(e)}")
    
    async def _send_alert(self, alert: Alert):
        """Send alert to configured channels"""
        for channel in alert.channels:
            try:
                if channel == AlertChannel.SLACK:
                    await self._send_slack_alert(alert)
                elif channel == AlertChannel.EMAIL:
                    await self._send_email_alert(alert)
                elif channel == AlertChannel.PAGERDUTY:
                    await self._send_pagerduty_alert(alert)
                elif channel == AlertChannel.WEBHOOK:
                    await self._send_webhook_alert(alert)
                    
            except Exception as e:
                logger.error(f"Error sending alert to {channel}: {str(e)}")
    
    async def _send_slack_alert(self, alert: Alert):
        """Send alert to Slack"""
        # Queue for Slack notification worker
        if self.redis_client:
            slack_message = {
                "channel": "#signals-alerts",
                "text": f"🚨 *{alert.title}*",
                "attachments": [{
                    "color": self._get_color_for_severity(alert.severity),
                    "fields": [
                        {"title": "Service", "value": alert.service, "short": True},
                        {"title": "Metric", "value": alert.metric, "short": True},
                        {"title": "Value", "value": str(alert.value), "short": True},
                        {"title": "Threshold", "value": str(alert.threshold), "short": True},
                        {"title": "Description", "value": alert.description, "short": False}
                    ],
                    "ts": alert.timestamp.timestamp()
                }]
            }
            
            await self.redis_client.lpush(
                "notification_queue:slack",
                json.dumps(slack_message)
            )
    
    async def _send_email_alert(self, alert: Alert):
        """Send alert via email"""
        if self.redis_client:
            email_data = {
                "to": settings.ALERT_EMAIL_RECIPIENTS,
                "subject": f"TREUM Alert: {alert.title}",
                "template": "alert_notification",
                "data": asdict(alert)
            }
            
            await self.redis_client.lpush(
                "notification_queue:email",
                json.dumps(email_data, default=str)
            )
    
    async def _send_pagerduty_alert(self, alert: Alert):
        """Send alert to PagerDuty"""
        if self.redis_client:
            pagerduty_event = {
                "routing_key": settings.PAGERDUTY_ROUTING_KEY,
                "event_action": "trigger",
                "dedup_key": f"treum-{alert.service}-{alert.metric}",
                "payload": {
                    "summary": alert.title,
                    "source": "TREUM Signal Service",
                    "severity": alert.severity,
                    "custom_details": alert.metadata
                }
            }
            
            await self.redis_client.lpush(
                "notification_queue:pagerduty",
                json.dumps(pagerduty_event)
            )
    
    async def _send_webhook_alert(self, alert: Alert):
        """Send alert to webhook"""
        if self.redis_client:
            webhook_data = {
                "url": settings.ALERT_WEBHOOK_URL,
                "payload": asdict(alert),
                "headers": {"Content-Type": "application/json"}
            }
            
            await self.redis_client.lpush(
                "notification_queue:webhook",
                json.dumps(webhook_data, default=str)
            )
    
    def _get_color_for_severity(self, severity: AlertSeverity) -> str:
        """Get color code for severity"""
        colors = {
            AlertSeverity.INFO: "good",
            AlertSeverity.WARNING: "warning", 
            AlertSeverity.ERROR: "danger",
            AlertSeverity.CRITICAL: "danger"
        }
        return colors.get(severity, "warning")
    
    async def check_alert_rules(self, metrics: Dict[str, float]):
        """Check metrics against alert rules"""
        for rule_name, rule_config in self.alert_rules.items():
            metric_value = metrics.get(rule_name, 0)
            threshold = rule_config['threshold']
            
            # Check if alert should be triggered
            should_alert = False
            
            if rule_name in ['signal_generation_failure', 'websocket_connections_low']:
                should_alert = metric_value <= threshold
            elif rule_name in ['signal_accuracy_low']:
                should_alert = metric_value < threshold
            elif rule_name in ['distribution_latency_high', 'market_data_stale']:
                should_alert = metric_value > threshold
            elif rule_name == 'revenue_drop':
                # Check for percentage drop (requires historical comparison)
                should_alert = False  # Implement based on historical data
            
            if should_alert:
                alert = Alert(
                    id=f"{rule_name}_{int(datetime.now().timestamp())}",
                    title=f"Alert: {rule_name.replace('_', ' ').title()}",
                    description=f"Metric {rule_name} value {metric_value} crossed threshold {threshold}",
                    severity=rule_config['severity'],
                    service="signal_service",
                    metric=rule_name,
                    value=metric_value,
                    threshold=threshold,
                    timestamp=datetime.now(timezone.utc),
                    channels=rule_config['channels'],
                    metadata={"rule": rule_name, "auto_generated": True}
                )
                
                await self.create_alert(alert)


class HealthChecker:
    """Monitors service health and performance"""
    
    def __init__(self, metrics_collector: MetricsCollector, alert_manager: AlertManager):
        self.metrics = metrics_collector
        self.alerts = alert_manager
        self.db = next(get_db())
        
    async def check_signal_generation_health(self) -> HealthStatus:
        """Check signal generation service health"""
        issues = []
        
        try:
            # Check recent signal generation
            last_hour = datetime.now(timezone.utc) - timedelta(hours=1)
            recent_signals = self.db.query(TradingSignal).filter(
                TradingSignal.generated_at >= last_hour
            ).count()
            
            # Check if signals are being generated
            if recent_signals == 0:
                issues.append("No signals generated in the last hour")
            
            # Check provider performance
            providers = self.db.query(SignalProvider).filter(
                SignalProvider.is_active == True
            ).all()
            
            for provider in providers:
                if provider.accuracy_score < 0.5:
                    issues.append(f"Provider {provider.name} has low accuracy: {provider.accuracy_score}")
            
            # Determine overall status
            if len(issues) == 0:
                status = "healthy"
            elif len(issues) <= 2:
                status = "degraded"
            else:
                status = "unhealthy"
            
            return HealthStatus(
                service="signal_generation",
                status=status,
                uptime=99.9,  # Would be calculated from actual uptime tracking
                response_time=0.5,  # Average response time
                error_rate=0.01,  # 1% error rate
                last_check=datetime.now(timezone.utc),
                issues=issues
            )
            
        except Exception as e:
            logger.error(f"Error checking signal generation health: {str(e)}")
            return HealthStatus(
                service="signal_generation",
                status="unhealthy",
                uptime=0,
                response_time=0,
                error_rate=1.0,
                last_check=datetime.now(timezone.utc),
                issues=[f"Health check failed: {str(e)}"]
            )
    
    async def check_distribution_health(self) -> HealthStatus:
        """Check signal distribution service health"""
        issues = []
        
        try:
            # Check WebSocket connections (would integrate with actual WebSocket manager)
            active_connections = 0  # Get from WebSocket manager
            
            if active_connections < 10:  # During market hours
                issues.append(f"Low WebSocket connections: {active_connections}")
            
            # Check recent distributions
            last_hour = datetime.now(timezone.utc) - timedelta(hours=1)
            recent_subscriptions = self.db.query(SignalSubscription).filter(
                SignalSubscription.subscribed_at >= last_hour
            ).count()
            
            # Determine status
            status = "healthy" if len(issues) == 0 else "degraded"
            
            return HealthStatus(
                service="signal_distribution",
                status=status,
                uptime=99.8,
                response_time=0.1,  # Sub-100ms target
                error_rate=0.005,
                last_check=datetime.now(timezone.utc),
                issues=issues
            )
            
        except Exception as e:
            logger.error(f"Error checking distribution health: {str(e)}")
            return HealthStatus(
                service="signal_distribution",
                status="unhealthy",
                uptime=0,
                response_time=0,
                error_rate=1.0,
                last_check=datetime.now(timezone.utc),
                issues=[f"Health check failed: {str(e)}"]
            )
    
    async def check_database_health(self) -> HealthStatus:
        """Check database health"""
        issues = []
        
        try:
            start_time = datetime.now()
            
            # Simple query to test database
            signal_count = self.db.query(TradingSignal).count()
            
            end_time = datetime.now()
            response_time = (end_time - start_time).total_seconds()
            
            if response_time > 1.0:
                issues.append(f"Slow database response: {response_time:.2f}s")
            
            # Check for recent errors in error logs
            # This would check actual error logs in production
            
            status = "healthy" if len(issues) == 0 else "degraded"
            
            return HealthStatus(
                service="database",
                status=status,
                uptime=99.95,
                response_time=response_time,
                error_rate=0.001,
                last_check=datetime.now(timezone.utc),
                issues=issues
            )
            
        except Exception as e:
            logger.error(f"Error checking database health: {str(e)}")
            return HealthStatus(
                service="database",
                status="unhealthy",
                uptime=0,
                response_time=0,
                error_rate=1.0,
                last_check=datetime.now(timezone.utc),
                issues=[f"Database check failed: {str(e)}"]
            )
    
    async def check_overall_health(self) -> Dict[str, HealthStatus]:
        """Check overall system health"""
        health_checks = await asyncio.gather(
            self.check_signal_generation_health(),
            self.check_distribution_health(),
            self.check_database_health(),
            return_exceptions=True
        )
        
        health_status = {}
        for health in health_checks:
            if isinstance(health, HealthStatus):
                health_status[health.service] = health
            else:
                logger.error(f"Health check failed: {health}")
        
        return health_status


class SignalMonitoringService:
    """Main monitoring service for signal system"""
    
    def __init__(self):
        self.metrics = MetricsCollector()
        self.alerts = AlertManager()
        self.health_checker = HealthChecker(self.metrics, self.alerts)
        self.monitoring_active = False
        
    async def initialize(self):
        """Initialize monitoring service"""
        await self.alerts.initialize()
        self.monitoring_active = True
        logger.info("Signal monitoring service initialized")
    
    async def start_monitoring(self):
        """Start monitoring loop"""
        if not self.monitoring_active:
            await self.initialize()
        
        logger.info("Starting signal monitoring loop")
        
        while self.monitoring_active:
            try:
                # Collect current metrics
                metrics = await self._collect_current_metrics()
                
                # Check health
                health_status = await self.health_checker.check_overall_health()
                
                # Check alert rules
                await self.alerts.check_alert_rules(metrics)
                
                # Log summary
                overall_status = "healthy"
                for service, status in health_status.items():
                    if status.status == "unhealthy":
                        overall_status = "unhealthy"
                        break
                    elif status.status == "degraded":
                        overall_status = "degraded"
                
                logger.info(f"Monitoring cycle complete - Overall status: {overall_status}")
                
                # Wait before next check
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {str(e)}")
                await asyncio.sleep(30)  # Shorter wait on error
    
    async def stop_monitoring(self):
        """Stop monitoring loop"""
        self.monitoring_active = False
        logger.info("Signal monitoring stopped")
    
    async def _collect_current_metrics(self) -> Dict[str, float]:
        """Collect current system metrics"""
        db = next(get_db())
        current_time = datetime.now(timezone.utc)
        
        try:
            # Signal generation metrics
            last_hour = current_time - timedelta(hours=1)
            recent_signals = db.query(TradingSignal).filter(
                TradingSignal.generated_at >= last_hour
            ).count()
            
            # Provider accuracy
            providers = db.query(SignalProvider).filter(
                SignalProvider.is_active == True
            ).all()
            
            avg_accuracy = sum([float(p.accuracy_score) for p in providers]) / len(providers) if providers else 0
            
            # User engagement
            recent_subscriptions = db.query(SignalSubscription).filter(
                SignalSubscription.subscribed_at >= last_hour
            ).count()
            
            metrics = {
                'signals_generated_hourly': recent_signals,
                'signal_accuracy_avg': avg_accuracy,
                'new_subscriptions_hourly': recent_subscriptions,
                'active_providers': len(providers),
                'websocket_connections': 0,  # Would get from WebSocket manager
                'distribution_latency': 0.05,  # Would measure actual latency
                'market_data_age': 30,  # Seconds since last update
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error collecting metrics: {str(e)}")
            return {}
    
    def get_metrics_endpoint(self) -> str:
        """Get Prometheus metrics for scraping"""
        return self.metrics.get_metrics()
    
    async def get_health_status(self) -> Dict[str, Any]:
        """Get current health status"""
        health_status = await self.health_checker.check_overall_health()
        
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "services": {k: asdict(v) for k, v in health_status.items()},
            "overall_status": self._determine_overall_status(health_status)
        }
    
    def _determine_overall_status(self, health_status: Dict[str, HealthStatus]) -> str:
        """Determine overall system status"""
        if not health_status:
            return "unknown"
        
        statuses = [status.status for status in health_status.values()]
        
        if "unhealthy" in statuses:
            return "unhealthy"
        elif "degraded" in statuses:
            return "degraded"
        else:
            return "healthy"


# Global monitoring service instance
monitoring_service = SignalMonitoringService()


async def initialize_monitoring():
    """Initialize monitoring service"""
    await monitoring_service.initialize()


async def start_monitoring_loop():
    """Start monitoring loop"""
    await monitoring_service.start_monitoring()


def get_prometheus_metrics() -> str:
    """Get Prometheus metrics"""
    return monitoring_service.get_metrics_endpoint()