#!/usr/bin/env python3
"""
Simple Production Monitoring Dashboard
Real-time monitoring for AI Finance Agency without complex dependencies
"""

from flask import Flask, render_template_string, jsonify
from flask_cors import CORS
import psutil
import sqlite3
import json
import time
import requests
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict

app = Flask(__name__)
CORS(app)

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

class SimpleMonitor:
    """Simple production monitoring system"""
    
    def __init__(self):
        self.db_path = 'data/monitoring.db'
        self.init_database()
    
    def init_database(self):
        """Initialize monitoring database"""
        import os
        os.makedirs('data', exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
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
        
        conn.commit()
        conn.close()
    
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
            try:
                connections = len(psutil.net_connections())
            except:
                connections = 0
            
            # Process count
            processes = len(psutil.pids())
            
            # Load average (simplified)
            try:
                load_avg = psutil.getloadavg()[0] if hasattr(psutil, 'getloadavg') else cpu_percent / 100
            except:
                load_avg = cpu_percent / 100
            
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
            
            # Save to database
            self.save_metrics(metrics)
            
            return metrics
            
        except Exception as e:
            print(f"Error collecting metrics: {e}")
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
            print(f"Error saving metrics: {e}")
    
    def check_service_health(self, service_name: str, url: str) -> dict:
        """Check health of a service"""
        start_time = time.time()
        
        try:
            response = requests.get(url, timeout=10)
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                status = "healthy"
            else:
                status = "warning"
            
            return {
                'service_name': service_name,
                'status': status,
                'response_time_ms': response_time,
                'status_code': response.status_code
            }
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return {
                'service_name': service_name,
                'status': 'critical',
                'response_time_ms': response_time,
                'error': str(e)
            }
    
    def get_monitoring_summary(self):
        """Get monitoring summary"""
        try:
            # Get latest metrics
            metrics = self.collect_system_metrics()
            
            # Check services
            services = []
            service_urls = {
                'webhook_api': 'http://localhost:5001/webhook/n8n/health',
                'enterprise_dashboard': 'http://localhost:5001/enterprise/dashboard'
            }
            
            for service_name, url in service_urls.items():
                service_health = self.check_service_health(service_name, url)
                services.append(service_health)
            
            # Check automated publisher status
            try:
                conn = sqlite3.connect('data/agency.db')
                cursor = conn.cursor()
                
                cursor.execute('''
                    SELECT COUNT(*) FROM published_content 
                    WHERE published_at >= datetime('now', '-1 hour')
                ''')
                
                recent_posts = cursor.fetchone()[0]
                conn.close()
                
                publisher_status = {
                    'service_name': 'automated_publisher',
                    'status': 'healthy' if recent_posts > 0 else 'warning',
                    'recent_posts': recent_posts,
                    'response_time_ms': 0
                }
                services.append(publisher_status)
                
            except Exception as e:
                print(f"Error checking publisher: {e}")
            
            return {
                'system_metrics': asdict(metrics) if metrics else None,
                'services': services,
                'timestamp': datetime.now().isoformat(),
                'status': 'healthy'
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'timestamp': datetime.now().isoformat(),
                'status': 'error'
            }

# Global monitor instance
monitor = SimpleMonitor()

# Dashboard HTML
DASHBOARD_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Finance Agency - Production Monitoring</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            text-align: center; 
            color: white; 
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .stat-card { 
            background: white; 
            padding: 25px; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .stat-card:hover { transform: translateY(-5px); }
        .stat-card h3 { 
            color: #667eea; 
            margin-bottom: 15px; 
            font-size: 1.2em;
        }
        .metric-value { 
            font-size: 2em; 
            font-weight: bold; 
            margin-bottom: 5px;
        }
        .metric-label { color: #666; font-size: 0.9em; }
        .status-indicator { 
            width: 12px; 
            height: 12px; 
            border-radius: 50%; 
            display: inline-block; 
            margin-right: 8px;
        }
        .status-healthy { background: #10B981; }
        .status-warning { background: #F59E0B; }
        .status-critical { background: #EF4444; }
        .refresh-indicator { 
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: rgba(255,255,255,0.9);
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Production Monitoring</h1>
            <p>AI Finance Agency - Real-time System Health</p>
            <p id="lastUpdate">Loading...</p>
        </div>
        
        <div class="refresh-indicator" id="refreshIndicator">
            🔄 Auto-refresh: 30s
        </div>

        <div class="stats-grid" id="systemStats">
            <!-- Stats will be populated here -->
        </div>
    </div>

    <script>
        async function fetchData() {
            try {
                const response = await fetch('/api/monitoring');
                const data = await response.json();
                
                updateStats(data);
                document.getElementById('lastUpdate').innerText = `Last updated: ${new Date().toLocaleString()}`;
                
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('refreshIndicator').innerHTML = '❌ Connection Error';
            }
        }
        
        function updateStats(data) {
            const container = document.getElementById('systemStats');
            
            if (data.error) {
                container.innerHTML = `<div class="stat-card"><h3>❌ Error</h3><p>${data.error}</p></div>`;
                return;
            }
            
            let html = '';
            
            if (data.system_metrics) {
                const m = data.system_metrics;
                html += `
                    <div class="stat-card">
                        <h3>🖥️ CPU Usage</h3>
                        <div class="metric-value" style="color: ${getCpuColor(m.cpu_percent)}">${m.cpu_percent.toFixed(1)}%</div>
                        <div class="metric-label">Current usage</div>
                    </div>
                    <div class="stat-card">
                        <h3>💾 Memory</h3>
                        <div class="metric-value" style="color: ${getMemoryColor(m.memory_percent)}">${m.memory_percent.toFixed(1)}%</div>
                        <div class="metric-label">RAM usage</div>
                    </div>
                    <div class="stat-card">
                        <h3>💿 Disk</h3>
                        <div class="metric-value" style="color: ${getDiskColor(m.disk_percent)}">${m.disk_percent.toFixed(1)}%</div>
                        <div class="metric-label">Storage used</div>
                    </div>
                    <div class="stat-card">
                        <h3>🌐 Network</h3>
                        <div class="metric-value">${m.active_connections}</div>
                        <div class="metric-label">Connections</div>
                    </div>
                    <div class="stat-card">
                        <h3>⚙️ Processes</h3>
                        <div class="metric-value">${m.processes_count}</div>
                        <div class="metric-label">Running</div>
                    </div>
                    <div class="stat-card">
                        <h3>📈 Load</h3>
                        <div class="metric-value">${m.load_average.toFixed(2)}</div>
                        <div class="metric-label">System load</div>
                    </div>
                `;
            }
            
            if (data.services) {
                data.services.forEach(service => {
                    html += `
                        <div class="stat-card">
                            <h3>🔧 ${service.service_name}</h3>
                            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                <span class="status-indicator status-${service.status}"></span>
                                <span style="font-weight: bold; text-transform: uppercase;">${service.status}</span>
                            </div>
                            <div class="metric-value" style="font-size: 1.5em;">${service.response_time_ms ? service.response_time_ms.toFixed(0) + 'ms' : 'N/A'}</div>
                            <div class="metric-label">Response time</div>
                            ${service.recent_posts !== undefined ? `<div class="metric-label">Recent posts: ${service.recent_posts}</div>` : ''}
                        </div>
                    `;
                });
            }
            
            container.innerHTML = html;
        }
        
        function getCpuColor(value) {
            if (value >= 90) return '#EF4444';
            if (value >= 75) return '#F59E0B';
            return '#10B981';
        }
        
        function getMemoryColor(value) {
            if (value >= 90) return '#EF4444';
            if (value >= 80) return '#F59E0B';
            return '#10B981';
        }
        
        function getDiskColor(value) {
            if (value >= 95) return '#EF4444';
            if (value >= 85) return '#F59E0B';
            return '#10B981';
        }
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            fetchData();
            setInterval(() => {
                fetchData();
                document.getElementById('refreshIndicator').innerHTML = '🔄 Refreshing...';
                setTimeout(() => {
                    document.getElementById('refreshIndicator').innerHTML = '🔄 Auto-refresh: 30s';
                }, 2000);
            }, 30000);
        });
    </script>
</body>
</html>
"""

@app.route('/')
def dashboard():
    """Main dashboard"""
    return render_template_string(DASHBOARD_HTML)

@app.route('/api/monitoring')
def monitoring_api():
    """Monitoring API endpoint"""
    return jsonify(monitor.get_monitoring_summary())

@app.route('/api/health')
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'monitoring_dashboard'
    })

if __name__ == "__main__":
    print("🚀 Starting Simple Monitoring Dashboard")
    print("📊 Dashboard: http://localhost:5002")
    print("🔍 API: http://localhost:5002/api/monitoring")
    print("💊 Health: http://localhost:5002/api/health")
    
    app.run(host='0.0.0.0', port=5002, debug=False)