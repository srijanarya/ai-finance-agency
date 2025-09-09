#!/usr/bin/env python3
"""
Monitoring System with Prometheus Metrics
Provides comprehensive monitoring for all dashboard services
"""

import os
import time
import json
import psutil
import sqlite3
from datetime import datetime
from prometheus_client import Counter, Histogram, Gauge, Summary, generate_latest, REGISTRY
from prometheus_client import start_http_server
from flask import Flask, Response
import logging
import threading

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define Prometheus metrics
class SystemMetrics:
    # Request metrics
    request_count = Counter('dashboard_requests_total', 'Total requests', ['dashboard', 'endpoint', 'method'])
    request_duration = Histogram('dashboard_request_duration_seconds', 'Request duration', ['dashboard', 'endpoint'])
    request_errors = Counter('dashboard_request_errors_total', 'Request errors', ['dashboard', 'endpoint', 'error_type'])
    
    # Queue metrics
    queue_size = Gauge('queue_size', 'Current queue size', ['status'])
    queue_processing_time = Summary('queue_processing_seconds', 'Queue processing time')
    queue_backlog_percentage = Gauge('queue_backlog_percentage', 'Queue backlog percentage')
    
    # System metrics
    cpu_usage = Gauge('system_cpu_usage_percent', 'CPU usage percentage')
    memory_usage = Gauge('system_memory_usage_percent', 'Memory usage percentage')
    disk_usage = Gauge('system_disk_usage_percent', 'Disk usage percentage')
    
    # Database metrics
    db_connections = Gauge('database_connections', 'Active database connections', ['database'])
    db_query_time = Histogram('database_query_seconds', 'Database query time', ['database', 'query_type'])
    db_size = Gauge('database_size_bytes', 'Database size in bytes', ['database'])
    
    # Cache metrics
    cache_hits = Counter('cache_hits_total', 'Cache hits')
    cache_misses = Counter('cache_misses_total', 'Cache misses')
    cache_hit_rate = Gauge('cache_hit_rate', 'Cache hit rate percentage')
    
    # Service health
    service_status = Gauge('service_status', 'Service status (1=up, 0=down)', ['service'])
    service_response_time = Gauge('service_response_time_ms', 'Service response time', ['service'])
    
    # Content generation metrics
    content_generated = Counter('content_generated_total', 'Content generated', ['platform', 'content_type'])
    content_approved = Counter('content_approved_total', 'Content approved', ['platform'])
    content_posted = Counter('content_posted_total', 'Content posted successfully', ['platform'])
    content_failed = Counter('content_failed_total', 'Content posting failed', ['platform'])

class MonitoringSystem:
    def __init__(self, port=9090):
        self.metrics = SystemMetrics()
        self.port = port
        self.monitoring_thread = None
        self.running = False
        
    def start_monitoring(self):
        """Start the monitoring system"""
        if not self.running:
            self.running = True
            
            # Start Prometheus metrics server
            start_http_server(self.port)
            logger.info(f"Prometheus metrics server started on port {self.port}")
            
            # Start monitoring thread
            self.monitoring_thread = threading.Thread(target=self._monitor_loop, daemon=True)
            self.monitoring_thread.start()
            logger.info("Monitoring system started")
    
    def _monitor_loop(self):
        """Main monitoring loop"""
        while self.running:
            try:
                # Update system metrics
                self._update_system_metrics()
                
                # Update queue metrics
                self._update_queue_metrics()
                
                # Update database metrics
                self._update_database_metrics()
                
                # Update cache metrics
                self._update_cache_metrics()
                
                # Update service health
                self._update_service_health()
                
                # Sleep for 10 seconds
                time.sleep(10)
                
            except Exception as e:
                logger.error(f"Monitoring error: {e}")
                time.sleep(30)
    
    def _update_system_metrics(self):
        """Update system resource metrics"""
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        self.metrics.cpu_usage.set(cpu_percent)
        
        # Memory usage
        memory = psutil.virtual_memory()
        self.metrics.memory_usage.set(memory.percent)
        
        # Disk usage
        disk = psutil.disk_usage('/')
        self.metrics.disk_usage.set(disk.percent)
    
    def _update_queue_metrics(self):
        """Update queue metrics"""
        try:
            conn = sqlite3.connect('posting_queue.db')
            cursor = conn.cursor()
            
            # Get queue counts by status
            cursor.execute("""
                SELECT status, COUNT(*) 
                FROM queue 
                GROUP BY status
            """)
            
            total = 0
            pending = 0
            for status, count in cursor.fetchall():
                self.metrics.queue_size.labels(status=status).set(count)
                total += count
                if status == 'pending':
                    pending = count
            
            # Calculate backlog percentage
            if total > 0:
                backlog_pct = (pending / total) * 100
                self.metrics.queue_backlog_percentage.set(backlog_pct)
            
            conn.close()
            
        except Exception as e:
            logger.error(f"Error updating queue metrics: {e}")
    
    def _update_database_metrics(self):
        """Update database metrics"""
        databases = [
            'posting_queue.db',
            'unified_core.db',
            'unified_social.db',
            'unified_market.db'
        ]
        
        for db_path in databases:
            if os.path.exists(db_path):
                # Get file size
                size = os.path.getsize(db_path)
                self.metrics.db_size.labels(database=db_path).set(size)
                
                # Get connection count (simplified)
                try:
                    conn = sqlite3.connect(db_path)
                    cursor = conn.cursor()
                    cursor.execute("PRAGMA database_list")
                    conn.close()
                    self.metrics.db_connections.labels(database=db_path).set(1)
                except:
                    self.metrics.db_connections.labels(database=db_path).set(0)
    
    def _update_cache_metrics(self):
        """Update Redis cache metrics"""
        try:
            import redis
            r = redis.Redis(host='localhost', port=6379)
            
            # Get Redis info
            info = r.info('stats')
            
            # Extract hit/miss statistics
            hits = info.get('keyspace_hits', 0)
            misses = info.get('keyspace_misses', 0)
            
            # Update metrics
            self.metrics.cache_hits._value.set(hits)
            self.metrics.cache_misses._value.set(misses)
            
            # Calculate hit rate
            total_ops = hits + misses
            if total_ops > 0:
                hit_rate = (hits / total_ops) * 100
                self.metrics.cache_hit_rate.set(hit_rate)
            
        except Exception as e:
            logger.error(f"Error updating cache metrics: {e}")
    
    def _update_service_health(self):
        """Update service health metrics"""
        import requests
        
        services = {
            'main_dashboard': 5000,
            'approval_dashboard': 5001,
            'platform_backend': 5002,
            'queue_monitor': 5003,
            'unified_platform': 5010,
            'treum_ai': 5011,
            'automated_manager': 5020
        }
        
        for service_name, port in services.items():
            try:
                start_time = time.time()
                response = requests.get(f'http://localhost:{port}/', timeout=2)
                response_time = (time.time() - start_time) * 1000
                
                if response.status_code < 500:
                    self.metrics.service_status.labels(service=service_name).set(1)
                    self.metrics.service_response_time.labels(service=service_name).set(response_time)
                else:
                    self.metrics.service_status.labels(service=service_name).set(0)
                    
            except:
                self.metrics.service_status.labels(service=service_name).set(0)
                self.metrics.service_response_time.labels(service=service_name).set(0)
    
    def record_request(self, dashboard: str, endpoint: str, method: str, duration: float, error: str = None):
        """Record a request metric"""
        self.metrics.request_count.labels(dashboard=dashboard, endpoint=endpoint, method=method).inc()
        self.metrics.request_duration.labels(dashboard=dashboard, endpoint=endpoint).observe(duration)
        
        if error:
            self.metrics.request_errors.labels(dashboard=dashboard, endpoint=endpoint, error_type=error).inc()
    
    def record_content_event(self, event_type: str, platform: str, content_type: str = None):
        """Record content generation event"""
        if event_type == 'generated':
            self.metrics.content_generated.labels(platform=platform, content_type=content_type).inc()
        elif event_type == 'approved':
            self.metrics.content_approved.labels(platform=platform).inc()
        elif event_type == 'posted':
            self.metrics.content_posted.labels(platform=platform).inc()
        elif event_type == 'failed':
            self.metrics.content_failed.labels(platform=platform).inc()
    
    def get_metrics_summary(self) -> dict:
        """Get a summary of current metrics"""
        return {
            'system': {
                'cpu_usage': self.metrics.cpu_usage._value.get(),
                'memory_usage': self.metrics.memory_usage._value.get(),
                'disk_usage': self.metrics.disk_usage._value.get()
            },
            'queue': {
                'backlog_percentage': self.metrics.queue_backlog_percentage._value.get()
            },
            'cache': {
                'hit_rate': self.metrics.cache_hit_rate._value.get()
            }
        }

# Flask middleware for automatic request monitoring
def add_monitoring_to_flask(app: Flask, dashboard_name: str):
    """Add monitoring to Flask application"""
    monitor = MonitoringSystem()
    
    @app.before_request
    def before_request():
        request.start_time = time.time()
    
    @app.after_request
    def after_request(response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            monitor.record_request(
                dashboard=dashboard_name,
                endpoint=request.endpoint or 'unknown',
                method=request.method,
                duration=duration,
                error='5xx' if response.status_code >= 500 else None
            )
        return response
    
    return monitor

# Create monitoring dashboard
def create_monitoring_dashboard():
    """Create a monitoring dashboard Flask app"""
    app = Flask(__name__)
    monitor = MonitoringSystem()
    
    @app.route('/')
    def index():
        """Monitoring dashboard home"""
        html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>System Monitoring Dashboard</title>
            <meta http-equiv="refresh" content="10">
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
                h1 { color: #333; }
                .metric-card { 
                    background: white; 
                    padding: 15px; 
                    margin: 10px 0; 
                    border-radius: 8px; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
                }
                .metric-value { 
                    font-size: 24px; 
                    font-weight: bold; 
                    color: #007bff; 
                }
                .metric-label { 
                    color: #666; 
                    font-size: 14px; 
                }
                .status-up { color: #28a745; }
                .status-down { color: #dc3545; }
            </style>
        </head>
        <body>
            <h1>🎯 System Monitoring Dashboard</h1>
            <p>Auto-refreshing every 10 seconds...</p>
        """
        
        # Get metrics summary
        summary = monitor.get_metrics_summary()
        
        # System metrics
        html += """
            <h2>System Resources</h2>
            <div class="metric-card">
                <div class="metric-label">CPU Usage</div>
                <div class="metric-value">{:.1f}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Memory Usage</div>
                <div class="metric-value">{:.1f}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Disk Usage</div>
                <div class="metric-value">{:.1f}%</div>
            </div>
        """.format(
            summary['system']['cpu_usage'] or 0,
            summary['system']['memory_usage'] or 0,
            summary['system']['disk_usage'] or 0
        )
        
        # Queue metrics
        html += """
            <h2>Queue Status</h2>
            <div class="metric-card">
                <div class="metric-label">Queue Backlog</div>
                <div class="metric-value">{:.1f}%</div>
            </div>
        """.format(summary['queue']['backlog_percentage'] or 0)
        
        # Cache metrics
        html += """
            <h2>Cache Performance</h2>
            <div class="metric-card">
                <div class="metric-label">Cache Hit Rate</div>
                <div class="metric-value">{:.1f}%</div>
            </div>
        """.format(summary['cache']['hit_rate'] or 0)
        
        html += """
            <p><a href="/metrics">View Prometheus Metrics</a></p>
        </body>
        </html>
        """
        
        return html
    
    @app.route('/metrics')
    def metrics():
        """Prometheus metrics endpoint"""
        return Response(generate_latest(REGISTRY), mimetype='text/plain')
    
    return app, monitor

if __name__ == "__main__":
    # Create and run monitoring dashboard
    app, monitor = create_monitoring_dashboard()
    
    print("\n" + "="*60)
    print("📊 MONITORING SYSTEM")
    print("="*60)
    print("\nFeatures:")
    print("✅ Prometheus metrics collection")
    print("✅ System resource monitoring")
    print("✅ Queue status tracking")
    print("✅ Cache performance metrics")
    print("✅ Service health checks")
    print("✅ Request tracking")
    
    # Start monitoring
    monitor.start_monitoring()
    
    print(f"\nMonitoring Dashboard: http://localhost:8080")
    print(f"Prometheus Metrics: http://localhost:8080/metrics")
    print("\n" + "="*60)
    
    # Run monitoring dashboard
    app.run(debug=False, host='0.0.0.0', port=8080)