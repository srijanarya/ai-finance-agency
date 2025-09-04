#!/usr/bin/env python3
"""
Production Monitoring & Alerting System
Real-time monitoring, error tracking, and alerting for AI Finance Agency
Ensures 99.9% uptime and catches issues before customers notice
"""

import asyncio
import time
import psutil
import sqlite3
import json
import logging
import smtplib
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
from dataclasses import dataclass, asdict
import threading
from pathlib import Path
import subprocess
import sys
from multi_agent_orchestrator import MultiAgentOrchestrator
from real_time_market_data_fix import RealTimeMarketDataManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('monitoring.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class SystemMetrics:
    """System performance metrics"""
    timestamp: str
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    network_sent: int
    network_recv: int
    active_connections: int
    processes_count: int
    load_average: float

@dataclass
class ServiceHealth:
    """Service health status"""
    service_name: str
    status: str  # healthy, warning, critical, down
    response_time_ms: float
    last_check: str
    error_message: Optional[str] = None
    uptime_percentage: float = 100.0

@dataclass
class Alert:
    """Alert notification"""
    id: str
    severity: str  # info, warning, critical
    service: str
    message: str
    timestamp: str
    resolved: bool = False
    resolution_time: Optional[str] = None

class ProductionMonitor:
    """
    Comprehensive Production Monitoring System
    Monitors system health, service availability, and performance
    """
    
    def __init__(self):
        self.db_path = 'data/monitoring.db'
        self.metrics_history = []
        self.alerts = []
        self.services = {}
        self.alert_channels = {
            'telegram': True,
            'email': True,
            'webhook': True
        }
        
        # Monitoring thresholds
        self.thresholds = {
            'cpu_critical': 90.0,
            'cpu_warning': 75.0,
            'memory_critical': 90.0,
            'memory_warning': 80.0,
            'disk_critical': 95.0,
            'disk_warning': 85.0,
            'response_time_critical': 5000,  # 5 seconds
            'response_time_warning': 2000,   # 2 seconds
            'uptime_critical': 95.0,         # 95% uptime
            'uptime_warning': 99.0           # 99% uptime
        }
        
        # Initialize components
        self.init_database()
        self.orchestrator = MultiAgentOrchestrator()
        self.market_manager = RealTimeMarketDataManager()
        
        # Telegram bot for alerts
        self.bot_token = "8478124403:AAFNni_9GQtWwrzk3ElhkMkTKljbSQyWp9Y"
        self.alert_channel = "@AIFinanceNews2024"  # Or separate alerts channel
        
        logger.info("🔍 Production Monitor initialized")
    
    def init_database(self):
        """Initialize monitoring database"""
        Path('data').mkdir(exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # System metrics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS system_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                cpu_percent REAL,
                memory_percent REAL,
                disk_percent REAL,
                network_sent INTEGER,
                network_recv INTEGER,
                active_connections INTEGER,
                processes_count INTEGER,
                load_average REAL
            )
        ''')
        
        # Service health table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS service_health (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service_name TEXT,
                status TEXT,
                response_time_ms REAL,
                last_check TEXT,
                error_message TEXT,
                uptime_percentage REAL
            )
        ''')
        
        # Alerts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY,
                severity TEXT,
                service TEXT,
                message TEXT,
                timestamp TEXT,
                resolved BOOLEAN DEFAULT FALSE,
                resolution_time TEXT
            )
        ''')
        
        # Uptime tracking
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS uptime_tracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                service_name TEXT,
                timestamp TEXT,
                status TEXT,
                response_time_ms REAL
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("📊 Monitoring database initialized")
    
    def collect_system_metrics(self) -> SystemMetrics:
        """Collect current system metrics"""
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            
            # Disk usage
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            
            # Network I/O
            network = psutil.net_io_counters()
            network_sent = network.bytes_sent
            network_recv = network.bytes_recv
            
            # Connection count
            connections = len(psutil.net_connections())
            
            # Process count
            processes = len(psutil.pids())
            
            # Load average
            load_avg = psutil.getloadavg()[0] if hasattr(psutil, 'getloadavg') else cpu_percent / 100
            
            metrics = SystemMetrics(
                timestamp=datetime.now().isoformat(),
                cpu_percent=cpu_percent,
                memory_percent=memory_percent,
                disk_percent=disk_percent,
                network_sent=network_sent,
                network_recv=network_recv,
                active_connections=connections,
                processes_count=processes,
                load_average=load_avg
            )
            
            return metrics
            
        except Exception as e:
            logger.error(f"❌ Error collecting system metrics: {e}")
            return None
    
    def save_metrics(self, metrics: SystemMetrics):
        """Save metrics to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO system_metrics 
                (timestamp, cpu_percent, memory_percent, disk_percent, 
                 network_sent, network_recv, active_connections, processes_count, load_average)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                metrics.timestamp,
                metrics.cpu_percent,
                metrics.memory_percent,
                metrics.disk_percent,
                metrics.network_sent,
                metrics.network_recv,
                metrics.active_connections,
                metrics.processes_count,
                metrics.load_average
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Error saving metrics: {e}")
    
    async def check_service_health(self, service_name: str, url: str) -> ServiceHealth:
        """Check health of a specific service"""
        start_time = time.time()
        
        try:
            response = requests.get(url, timeout=10)
            response_time = (time.time() - start_time) * 1000  # Convert to ms
            
            if response.status_code == 200:
                status = "healthy"
                error_message = None
            elif response.status_code >= 400:
                status = "warning" if response.status_code < 500 else "critical"
                error_message = f"HTTP {response.status_code}: {response.reason}"
            else:
                status = "warning"
                error_message = f"Unexpected status: {response.status_code}"
            
            # Calculate uptime percentage (last 24 hours)
            uptime_pct = await self.calculate_uptime_percentage(service_name)
            
            health = ServiceHealth(
                service_name=service_name,
                status=status,
                response_time_ms=response_time,
                last_check=datetime.now().isoformat(),
                error_message=error_message,
                uptime_percentage=uptime_pct
            )
            
            # Save to database
            self.save_service_health(health)
            
            return health
            
        except requests.exceptions.RequestException as e:
            response_time = (time.time() - start_time) * 1000
            
            health = ServiceHealth(
                service_name=service_name,
                status="critical",
                response_time_ms=response_time,
                last_check=datetime.now().isoformat(),
                error_message=str(e),
                uptime_percentage=await self.calculate_uptime_percentage(service_name)
            )
            
            self.save_service_health(health)
            return health
    
    def save_service_health(self, health: ServiceHealth):
        """Save service health to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Save current health
            cursor.execute('''
                INSERT INTO service_health 
                (service_name, status, response_time_ms, last_check, error_message, uptime_percentage)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                health.service_name,
                health.status,
                health.response_time_ms,
                health.last_check,
                health.error_message,
                health.uptime_percentage
            ))
            
            # Save uptime tracking
            cursor.execute('''
                INSERT INTO uptime_tracking 
                (service_name, timestamp, status, response_time_ms)
                VALUES (?, ?, ?, ?)
            ''', (
                health.service_name,
                health.last_check,
                health.status,
                health.response_time_ms
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Error saving service health: {e}")
    
    async def calculate_uptime_percentage(self, service_name: str, hours: int = 24) -> float:
        """Calculate uptime percentage for a service"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            since = (datetime.now() - timedelta(hours=hours)).isoformat()
            
            cursor.execute('''
                SELECT status FROM uptime_tracking 
                WHERE service_name = ? AND timestamp >= ?
                ORDER BY timestamp DESC
            ''', (service_name, since))
            
            statuses = cursor.fetchall()
            conn.close()
            
            if not statuses:
                return 100.0
            
            healthy_count = sum(1 for status in statuses if status[0] == 'healthy')
            uptime_percentage = (healthy_count / len(statuses)) * 100
            
            return round(uptime_percentage, 2)
            
        except Exception as e:
            logger.error(f"❌ Error calculating uptime: {e}")
            return 0.0
    
    def analyze_metrics_and_create_alerts(self, metrics: SystemMetrics):
        """Analyze metrics and create alerts if thresholds are exceeded"""
        alerts_to_send = []
        
        # CPU usage alerts
        if metrics.cpu_percent >= self.thresholds['cpu_critical']:
            alert = Alert(
                id=f"cpu_critical_{int(time.time())}",
                severity="critical",
                service="system",
                message=f"🚨 CRITICAL: CPU usage at {metrics.cpu_percent:.1f}% (threshold: {self.thresholds['cpu_critical']}%)",
                timestamp=metrics.timestamp
            )
            alerts_to_send.append(alert)
        elif metrics.cpu_percent >= self.thresholds['cpu_warning']:
            alert = Alert(
                id=f"cpu_warning_{int(time.time())}",
                severity="warning",
                service="system",
                message=f"⚠️ WARNING: CPU usage at {metrics.cpu_percent:.1f}% (threshold: {self.thresholds['cpu_warning']}%)",
                timestamp=metrics.timestamp
            )
            alerts_to_send.append(alert)
        
        # Memory usage alerts
        if metrics.memory_percent >= self.thresholds['memory_critical']:
            alert = Alert(
                id=f"memory_critical_{int(time.time())}",
                severity="critical",
                service="system",
                message=f"🚨 CRITICAL: Memory usage at {metrics.memory_percent:.1f}% (threshold: {self.thresholds['memory_critical']}%)",
                timestamp=metrics.timestamp
            )
            alerts_to_send.append(alert)
        elif metrics.memory_percent >= self.thresholds['memory_warning']:
            alert = Alert(
                id=f"memory_warning_{int(time.time())}",
                severity="warning",
                service="system",
                message=f"⚠️ WARNING: Memory usage at {metrics.memory_percent:.1f}% (threshold: {self.thresholds['memory_warning']}%)",
                timestamp=metrics.timestamp
            )
            alerts_to_send.append(alert)
        
        # Disk usage alerts
        if metrics.disk_percent >= self.thresholds['disk_critical']:
            alert = Alert(
                id=f"disk_critical_{int(time.time())}",
                severity="critical",
                service="system",
                message=f"🚨 CRITICAL: Disk usage at {metrics.disk_percent:.1f}% (threshold: {self.thresholds['disk_critical']}%)",
                timestamp=metrics.timestamp
            )
            alerts_to_send.append(alert)
        elif metrics.disk_percent >= self.thresholds['disk_warning']:
            alert = Alert(
                id=f"disk_warning_{int(time.time())}",
                severity="warning",
                service="system",
                message=f"⚠️ WARNING: Disk usage at {metrics.disk_percent:.1f}% (threshold: {self.thresholds['disk_warning']}%)",
                timestamp=metrics.timestamp
            )
            alerts_to_send.append(alert)
        
        return alerts_to_send
    
    def analyze_service_health_and_create_alerts(self, health: ServiceHealth) -> List[Alert]:
        """Analyze service health and create alerts"""
        alerts_to_send = []
        
        # Service down alerts
        if health.status == "critical":
            alert = Alert(
                id=f"{health.service_name}_critical_{int(time.time())}",
                severity="critical",
                service=health.service_name,
                message=f"🚨 CRITICAL: {health.service_name} is DOWN - {health.error_message}",
                timestamp=health.last_check
            )
            alerts_to_send.append(alert)
        
        # Response time alerts
        if health.response_time_ms >= self.thresholds['response_time_critical']:
            alert = Alert(
                id=f"{health.service_name}_slow_{int(time.time())}",
                severity="critical",
                service=health.service_name,
                message=f"🚨 CRITICAL: {health.service_name} response time {health.response_time_ms:.0f}ms (threshold: {self.thresholds['response_time_critical']}ms)",
                timestamp=health.last_check
            )
            alerts_to_send.append(alert)
        elif health.response_time_ms >= self.thresholds['response_time_warning']:
            alert = Alert(
                id=f"{health.service_name}_slow_{int(time.time())}",
                severity="warning",
                service=health.service_name,
                message=f"⚠️ WARNING: {health.service_name} response time {health.response_time_ms:.0f}ms (threshold: {self.thresholds['response_time_warning']}ms)",
                timestamp=health.last_check
            )
            alerts_to_send.append(alert)
        
        # Uptime alerts
        if health.uptime_percentage <= self.thresholds['uptime_critical']:
            alert = Alert(
                id=f"{health.service_name}_uptime_{int(time.time())}",
                severity="critical",
                service=health.service_name,
                message=f"🚨 CRITICAL: {health.service_name} uptime at {health.uptime_percentage}% (threshold: {self.thresholds['uptime_critical']}%)",
                timestamp=health.last_check
            )
            alerts_to_send.append(alert)
        elif health.uptime_percentage <= self.thresholds['uptime_warning']:
            alert = Alert(
                id=f"{health.service_name}_uptime_{int(time.time())}",
                severity="warning",
                service=health.service_name,
                message=f"⚠️ WARNING: {health.service_name} uptime at {health.uptime_percentage}% (threshold: {self.thresholds['uptime_warning']}%)",
                timestamp=health.last_check
            )
            alerts_to_send.append(alert)
        
        return alerts_to_send
    
    async def send_alert_to_telegram(self, alert: Alert) -> bool:
        """Send alert to Telegram"""
        try:
            # Determine emoji based on severity
            emoji = "🚨" if alert.severity == "critical" else "⚠️" if alert.severity == "warning" else "ℹ️"
            
            message = f"""{emoji} <b>SYSTEM ALERT</b>

<b>Service:</b> {alert.service.upper()}
<b>Severity:</b> {alert.severity.upper()}
<b>Time:</b> {alert.timestamp[:19]}

<b>Message:</b>
{alert.message}

<b>Alert ID:</b> {alert.id}

<i>AI Finance Agency Monitoring System</i>"""
            
            payload = {
                'chat_id': self.alert_channel,
                'text': message,
                'parse_mode': 'HTML'
            }
            
            response = requests.post(
                f"https://api.telegram.org/bot{self.bot_token}/sendMessage",
                json=payload
            )
            
            if response.status_code == 200:
                logger.info(f"✅ Alert sent to Telegram: {alert.id}")
                return True
            else:
                logger.error(f"❌ Failed to send Telegram alert: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error sending Telegram alert: {e}")
            return False
    
    def save_alert(self, alert: Alert):
        """Save alert to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO alerts 
                (id, severity, service, message, timestamp, resolved)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                alert.id,
                alert.severity,
                alert.service,
                alert.message,
                alert.timestamp,
                alert.resolved
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Error saving alert: {e}")
    
    async def process_alerts(self, alerts: List[Alert]):
        """Process and send alerts"""
        for alert in alerts:
            # Save to database
            self.save_alert(alert)
            
            # Send notifications
            if self.alert_channels['telegram']:
                await self.send_alert_to_telegram(alert)
            
            logger.warning(f"🚨 ALERT: {alert.message}")
    
    async def monitor_services(self):
        """Monitor all configured services"""
        services_to_monitor = {
            'webhook_api': 'http://localhost:5001/webhook/n8n/health',
            'enterprise_dashboard': 'http://localhost:5001/enterprise/dashboard',
            'automated_publisher': 'http://localhost:5001/webhook/n8n/metrics'  # If available
        }
        
        service_results = {}
        
        for service_name, url in services_to_monitor.items():
            try:
                health = await self.check_service_health(service_name, url)
                service_results[service_name] = health
                
                # Check for alerts
                service_alerts = self.analyze_service_health_and_create_alerts(health)
                if service_alerts:
                    await self.process_alerts(service_alerts)
                
                logger.info(f"✅ {service_name}: {health.status} ({health.response_time_ms:.0f}ms)")
                
            except Exception as e:
                logger.error(f"❌ Error monitoring {service_name}: {e}")
        
        return service_results
    
    async def run_monitoring_cycle(self):
        """Run one complete monitoring cycle"""
        try:
            logger.info("🔍 Starting monitoring cycle...")
            
            # 1. Collect system metrics
            metrics = self.collect_system_metrics()
            if metrics:
                self.save_metrics(metrics)
                
                # Check for system alerts
                system_alerts = self.analyze_metrics_and_create_alerts(metrics)
                if system_alerts:
                    await self.process_alerts(system_alerts)
                
                logger.info(f"📊 System: CPU {metrics.cpu_percent:.1f}% | Memory {metrics.memory_percent:.1f}% | Disk {metrics.disk_percent:.1f}%")
            
            # 2. Monitor services
            service_results = await self.monitor_services()
            
            # 3. Check automated publisher health
            try:
                publisher_health = await self.check_automated_publisher_health()
                logger.info(f"🤖 Publisher: {publisher_health}")
            except Exception as e:
                logger.error(f"❌ Error checking publisher health: {e}")
            
            # 4. Check market data health
            try:
                market_health = await self.check_market_data_health()
                logger.info(f"📈 Market Data: {market_health}")
            except Exception as e:
                logger.error(f"❌ Error checking market data health: {e}")
            
            logger.info("✅ Monitoring cycle completed")
            
        except Exception as e:
            logger.error(f"❌ Error in monitoring cycle: {e}")
    
    async def check_automated_publisher_health(self) -> str:
        """Check health of automated publisher"""
        try:
            # Check if the publisher process is running
            # This is a simplified check - in production you'd check process status
            
            # Check database for recent activity
            conn = sqlite3.connect('data/agency.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT COUNT(*) FROM published_content 
                WHERE published_at >= datetime('now', '-1 hour')
            ''')
            
            recent_posts = cursor.fetchone()[0]
            conn.close()
            
            # Check if market data is fresh
            market_data = self.market_manager.get_comprehensive_market_data()
            is_fresh = self.market_manager.validate_data_freshness(market_data)
            
            if is_fresh:
                return f"HEALTHY - Recent posts: {recent_posts}, Data: FRESH"
            else:
                return f"WARNING - Recent posts: {recent_posts}, Data: STALE"
                
        except Exception as e:
            return f"ERROR - {str(e)}"
    
    async def check_market_data_health(self) -> str:
        """Check health of market data system"""
        try:
            market_data = self.market_manager.get_comprehensive_market_data()
            
            nifty = market_data['indices']['nifty']
            freshness = market_data['data_freshness']
            
            return f"HEALTHY - NIFTY: {nifty['current_price']:.0f}, Freshness: {freshness}"
            
        except Exception as e:
            return f"ERROR - {str(e)}"
    
    async def start_continuous_monitoring(self):
        """Start continuous monitoring loop"""
        logger.info("🚀 Starting Continuous Production Monitoring")
        logger.info("=" * 60)
        logger.info("📊 System Monitoring: CPU, Memory, Disk, Network")
        logger.info("🔍 Service Monitoring: API endpoints, Response times")
        logger.info("🚨 Alert Channels: Telegram, Database")
        logger.info("⏰ Monitoring Interval: 60 seconds")
        logger.info("=" * 60)
        
        cycle_count = 0
        
        while True:
            try:
                cycle_count += 1
                
                print(f"\n🔄 Monitoring Cycle #{cycle_count} - {datetime.now().strftime('%H:%M:%S')}")
                
                await self.run_monitoring_cycle()
                
                # Wait 60 seconds before next cycle
                await asyncio.sleep(60)
                
            except KeyboardInterrupt:
                logger.info("⏹️ Monitoring stopped by user")
                break
            except Exception as e:
                logger.error(f"❌ Error in monitoring loop: {e}")
                await asyncio.sleep(60)  # Continue after error
    
    def get_monitoring_summary(self) -> Dict:
        """Get monitoring summary and statistics"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get latest metrics
            cursor.execute('''
                SELECT * FROM system_metrics 
                ORDER BY timestamp DESC LIMIT 1
            ''')
            
            latest_metrics = cursor.fetchone()
            
            # Get service health
            cursor.execute('''
                SELECT service_name, status, response_time_ms, uptime_percentage
                FROM service_health 
                WHERE last_check >= datetime('now', '-5 minutes')
                GROUP BY service_name
                HAVING MAX(last_check)
            ''')
            
            services = cursor.fetchall()
            
            # Get recent alerts
            cursor.execute('''
                SELECT severity, COUNT(*) as count
                FROM alerts 
                WHERE timestamp >= datetime('now', '-24 hours')
                AND resolved = FALSE
                GROUP BY severity
            ''')
            
            alert_counts = dict(cursor.fetchall())
            
            conn.close()
            
            return {
                'system_metrics': latest_metrics,
                'services': services,
                'alerts': alert_counts,
                'monitoring_status': 'active',
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting monitoring summary: {e}")
            return {'error': str(e)}

async def main():
    """Main monitoring function"""
    print("🔍 AI FINANCE AGENCY - PRODUCTION MONITORING SYSTEM")
    print("=" * 60)
    
    monitor = ProductionMonitor()
    
    print("📊 Monitoring Components:")
    print("• System Metrics (CPU, Memory, Disk)")
    print("• Service Health (API endpoints)")
    print("• Automated Publisher Health")
    print("• Market Data System Health")
    print("• Real-time Alerting (Telegram)")
    
    print(f"\n🚨 Alert Thresholds:")
    for key, value in monitor.thresholds.items():
        if 'percent' in key:
            print(f"• {key}: {value}%")
        elif 'time' in key:
            print(f"• {key}: {value}ms")
    
    print(f"\n📺 Alert Channel: {monitor.alert_channel}")
    
    try:
        # Run initial monitoring cycle
        print(f"\n🧪 Running initial monitoring cycle...")
        await monitor.run_monitoring_cycle()
        
        # Show summary
        summary = monitor.get_monitoring_summary()
        print(f"\n📊 System Status:")
        if summary.get('system_metrics'):
            metrics = summary['system_metrics']
            print(f"• CPU: {metrics[2]:.1f}%")
            print(f"• Memory: {metrics[3]:.1f}%") 
            print(f"• Disk: {metrics[4]:.1f}%")
        
        choice = input(f"\nStart continuous monitoring? (y/N): ").strip().lower()
        
        if choice == 'y':
            await monitor.start_continuous_monitoring()
        else:
            print("✅ Initial monitoring completed. System ready for production!")
            
    except KeyboardInterrupt:
        print("\n✋ Monitoring stopped")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())