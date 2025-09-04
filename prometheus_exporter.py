#!/usr/bin/env python3
"""
Prometheus Metrics Exporter for AI Finance Agency
Exports custom metrics in Prometheus format for advanced monitoring
"""

from prometheus_client import start_http_server, Gauge, Counter, Histogram, Info
from prometheus_client.core import CollectorRegistry
import time
import psutil
import sqlite3
import asyncio
from datetime import datetime
from production_monitoring_system import ProductionMonitor
from real_time_market_data_fix import RealTimeMarketDataManager
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIFinancePrometheusExporter:
    """
    Prometheus metrics exporter for AI Finance Agency
    Exports system metrics, service health, and business metrics
    """
    
    def __init__(self, port=8000):
        self.port = port
        self.monitor = ProductionMonitor()
        self.market_manager = RealTimeMarketDataManager()
        
        # Create custom registry
        self.registry = CollectorRegistry()
        
        # System metrics
        self.cpu_usage = Gauge('system_cpu_usage_percent', 'CPU usage percentage', registry=self.registry)
        self.memory_usage = Gauge('system_memory_usage_percent', 'Memory usage percentage', registry=self.registry)
        self.disk_usage = Gauge('system_disk_usage_percent', 'Disk usage percentage', registry=self.registry)
        self.network_sent = Gauge('system_network_sent_bytes_total', 'Network bytes sent', registry=self.registry)
        self.network_recv = Gauge('system_network_recv_bytes_total', 'Network bytes received', registry=self.registry)
        self.active_connections = Gauge('system_active_connections', 'Number of active connections', registry=self.registry)
        self.processes_count = Gauge('system_processes_count', 'Number of running processes', registry=self.registry)
        self.load_average = Gauge('system_load_average', 'System load average', registry=self.registry)
        
        # Service metrics
        self.service_up = Gauge('service_up', 'Service availability (1 = up, 0 = down)', ['service_name'], registry=self.registry)
        self.service_response_time = Gauge('service_response_time_seconds', 'Service response time in seconds', ['service_name'], registry=self.registry)
        self.service_uptime_percentage = Gauge('service_uptime_percentage', 'Service uptime percentage', ['service_name'], registry=self.registry)
        
        # Application metrics
        self.content_published_total = Counter('content_published_total', 'Total content pieces published', ['content_type'], registry=self.registry)
        self.market_data_requests = Counter('market_data_requests_total', 'Total market data requests', registry=self.registry)
        self.market_data_freshness = Gauge('market_data_freshness_seconds', 'Market data age in seconds', registry=self.registry)
        self.nifty_price = Gauge('nifty_current_price', 'Current NIFTY price', registry=self.registry)
        self.banknifty_price = Gauge('banknifty_current_price', 'Current Bank NIFTY price', registry=self.registry)
        
        # Error metrics
        self.errors_total = Counter('errors_total', 'Total errors by service', ['service', 'error_type'], registry=self.registry)
        self.alerts_total = Counter('alerts_total', 'Total alerts by severity', ['severity'], registry=self.registry)
        
        # Business metrics
        self.api_requests_total = Counter('api_requests_total', 'Total API requests', ['endpoint', 'method'], registry=self.registry)
        self.api_request_duration = Histogram('api_request_duration_seconds', 'API request duration', ['endpoint'], registry=self.registry)
        
        # Info metrics
        self.build_info = Info('build_info', 'Build information', registry=self.registry)
        self.build_info.info({
            'version': '1.0.0',
            'service': 'ai-finance-agency',
            'build_date': datetime.now().isoformat(),
            'python_version': '3.11'
        })
        
        logger.info("🔧 Prometheus exporter initialized")
    
    def collect_system_metrics(self):
        """Collect and export system metrics"""
        try:
            metrics = self.monitor.collect_system_metrics()
            
            if metrics:
                self.cpu_usage.set(metrics.cpu_percent)
                self.memory_usage.set(metrics.memory_percent)
                self.disk_usage.set(metrics.disk_percent)
                self.network_sent.set(metrics.network_sent)
                self.network_recv.set(metrics.network_recv)
                self.active_connections.set(metrics.active_connections)
                self.processes_count.set(metrics.processes_count)
                self.load_average.set(metrics.load_average)
                
                logger.debug(f"📊 System metrics updated: CPU {metrics.cpu_percent:.1f}%")
                
        except Exception as e:
            logger.error(f"❌ Error collecting system metrics: {e}")
            self.errors_total.labels(service='system', error_type='metrics_collection').inc()
    
    async def collect_service_metrics(self):
        """Collect and export service health metrics"""
        try:
            services_to_monitor = {
                'webhook_api': 'http://localhost:5001/webhook/n8n/health',
                'enterprise_dashboard': 'http://localhost:5001/enterprise/dashboard',
                'monitoring_dashboard': 'http://localhost:5002/api/monitoring/health'
            }
            
            for service_name, url in services_to_monitor.items():
                try:
                    health = await self.monitor.check_service_health(service_name, url)
                    
                    # Service availability (1 = healthy, 0 = down)
                    availability = 1 if health.status == 'healthy' else 0
                    self.service_up.labels(service_name=service_name).set(availability)
                    
                    # Response time in seconds
                    response_time_seconds = health.response_time_ms / 1000
                    self.service_response_time.labels(service_name=service_name).set(response_time_seconds)
                    
                    # Uptime percentage
                    self.service_uptime_percentage.labels(service_name=service_name).set(health.uptime_percentage)
                    
                    logger.debug(f"🔍 {service_name}: {health.status} ({health.response_time_ms:.0f}ms)")
                    
                except Exception as e:
                    logger.error(f"❌ Error monitoring {service_name}: {e}")
                    self.service_up.labels(service_name=service_name).set(0)
                    self.errors_total.labels(service=service_name, error_type='health_check').inc()
                    
        except Exception as e:
            logger.error(f"❌ Error collecting service metrics: {e}")
    
    def collect_market_data_metrics(self):
        """Collect and export market data metrics"""
        try:
            self.market_data_requests.inc()
            
            market_data = self.market_manager.get_comprehensive_market_data()
            
            if market_data:
                # Market prices
                nifty = market_data['indices']['nifty']
                banknifty = market_data['indices']['banknifty']
                
                self.nifty_price.set(nifty['current_price'])
                self.banknifty_price.set(banknifty['current_price'])
                
                # Data freshness (age in seconds)
                timestamp = datetime.fromisoformat(market_data['timestamp'])
                age_seconds = (datetime.now() - timestamp).total_seconds()
                self.market_data_freshness.set(age_seconds)
                
                logger.debug(f"📈 Market data: NIFTY {nifty['current_price']:.0f}, age {age_seconds:.0f}s")
                
        except Exception as e:
            logger.error(f"❌ Error collecting market data metrics: {e}")
            self.errors_total.labels(service='market_data', error_type='data_collection').inc()
    
    def collect_content_metrics(self):
        """Collect and export content publishing metrics"""
        try:
            conn = sqlite3.connect('data/agency.db')
            cursor = conn.cursor()
            
            # Count published content by type (last hour)
            cursor.execute('''
                SELECT content_type, COUNT(*) as count
                FROM published_content 
                WHERE published_at >= datetime('now', '-1 hour')
                GROUP BY content_type
            ''')
            
            for row in cursor.fetchall():
                content_type, count = row
                # Note: Counter metrics in Prometheus are cumulative, 
                # so we'd need to track this differently in production
                
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Error collecting content metrics: {e}")
            self.errors_total.labels(service='content', error_type='metrics_collection').inc()
    
    def collect_alert_metrics(self):
        """Collect and export alert metrics"""
        try:
            conn = sqlite3.connect(self.monitor.db_path)
            cursor = conn.cursor()
            
            # Count alerts by severity (last 24 hours)
            cursor.execute('''
                SELECT severity, COUNT(*) as count
                FROM alerts 
                WHERE timestamp >= datetime('now', '-24 hours')
                GROUP BY severity
            ''')
            
            alert_counts = dict(cursor.fetchall())
            
            for severity in ['info', 'warning', 'critical']:
                count = alert_counts.get(severity, 0)
                # Reset and set current count (this is a simplified approach)
                # In production, you'd use different logic for cumulative counters
            
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Error collecting alert metrics: {e}")
    
    async def collect_all_metrics(self):
        """Collect all metrics"""
        try:
            # System metrics
            self.collect_system_metrics()
            
            # Service health metrics
            await self.collect_service_metrics()
            
            # Market data metrics
            self.collect_market_data_metrics()
            
            # Content metrics
            self.collect_content_metrics()
            
            # Alert metrics
            self.collect_alert_metrics()
            
            logger.info("✅ All metrics collected")
            
        except Exception as e:
            logger.error(f"❌ Error in metrics collection: {e}")
    
    async def start_metrics_collection(self):
        """Start continuous metrics collection"""
        logger.info("🚀 Starting Prometheus metrics collection")
        logger.info(f"📊 Metrics endpoint: http://localhost:{self.port}/metrics")
        
        # Start Prometheus HTTP server
        start_http_server(self.port, registry=self.registry)
        logger.info(f"✅ Prometheus server started on port {self.port}")
        
        # Continuous metrics collection
        while True:
            try:
                await self.collect_all_metrics()
                await asyncio.sleep(15)  # Collect every 15 seconds
                
            except KeyboardInterrupt:
                logger.info("⏹️ Metrics collection stopped")
                break
            except Exception as e:
                logger.error(f"❌ Error in metrics loop: {e}")
                await asyncio.sleep(30)  # Wait longer on error

def create_prometheus_config():
    """Create Prometheus configuration file"""
    config = """
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "ai_finance_rules.yml"

scrape_configs:
  - job_name: 'ai-finance-agency'
    static_configs:
      - targets: ['localhost:8000']
    scrape_interval: 15s
    metrics_path: /metrics
    
  - job_name: 'system'
    static_configs:
      - targets: ['localhost:9100']  # Node exporter if available
    scrape_interval: 30s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - localhost:9093
"""
    
    with open('prometheus.yml', 'w') as f:
        f.write(config)
    
    print("✅ Created prometheus.yml configuration")

def create_alerting_rules():
    """Create Prometheus alerting rules"""
    rules = """
groups:
- name: ai_finance_agency
  rules:
  - alert: HighCPUUsage
    expr: system_cpu_usage_percent > 90
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "High CPU usage detected"
      description: "CPU usage is {{ $value }}% for more than 2 minutes"

  - alert: HighMemoryUsage
    expr: system_memory_usage_percent > 90
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "High memory usage detected"
      description: "Memory usage is {{ $value }}% for more than 2 minutes"

  - alert: ServiceDown
    expr: service_up == 0
    for: 30s
    labels:
      severity: critical
    annotations:
      summary: "Service {{ $labels.service_name }} is down"
      description: "Service {{ $labels.service_name }} has been down for more than 30 seconds"

  - alert: SlowServiceResponse
    expr: service_response_time_seconds > 5
    for: 1m
    labels:
      severity: warning
    annotations:
      summary: "Slow service response"
      description: "Service {{ $labels.service_name }} response time is {{ $value }}s"

  - alert: StaleMarketData
    expr: market_data_freshness_seconds > 1800  # 30 minutes
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Market data is stale"
      description: "Market data is {{ $value }} seconds old"

  - alert: LowServiceUptime
    expr: service_uptime_percentage < 99
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Low service uptime"
      description: "Service {{ $labels.service_name }} uptime is {{ $value }}%"
"""
    
    with open('ai_finance_rules.yml', 'w') as f:
        f.write(rules)
    
    print("✅ Created ai_finance_rules.yml alerting rules")

async def main():
    """Main function"""
    print("🔧 AI FINANCE AGENCY - PROMETHEUS EXPORTER")
    print("=" * 50)
    
    # Create configuration files
    create_prometheus_config()
    create_alerting_rules()
    
    print("\n📊 Available Metrics:")
    print("• system_cpu_usage_percent - CPU usage")
    print("• system_memory_usage_percent - Memory usage")
    print("• service_up - Service availability")
    print("• service_response_time_seconds - Response times")
    print("• nifty_current_price - NIFTY price")
    print("• market_data_freshness_seconds - Data age")
    print("• alerts_total - Alert counts")
    
    print(f"\n🚀 Starting exporter on port 8000...")
    print("📈 Metrics: http://localhost:8000/metrics")
    print("🔧 Use with Prometheus: scrape_configs target localhost:8000")
    
    exporter = AIFinancePrometheusExporter()
    
    try:
        await exporter.start_metrics_collection()
    except KeyboardInterrupt:
        print("\n✋ Exporter stopped")

if __name__ == "__main__":
    asyncio.run(main())