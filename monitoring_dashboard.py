#!/usr/bin/env python3
"""
Real-time Monitoring Dashboard
Web-based dashboard for monitoring AI Finance Agency production systems
"""

from flask import Flask, render_template_string, jsonify, request
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime, timedelta
from production_monitoring_system import ProductionMonitor
import asyncio
import threading
import time

app = Flask(__name__)
CORS(app)

# Global monitoring instance
monitor = None

def init_monitor():
    """Initialize the monitoring system"""
    global monitor
    monitor = ProductionMonitor()

# Dashboard HTML template
DASHBOARD_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Finance Agency - Production Monitoring</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { 
            text-align: center; 
            color: white; 
            margin-bottom: 30px;
            padding: 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.1em; opacity: 0.9; }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
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
            font-size: 1.3em;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .metric-value { 
            font-size: 2.5em; 
            font-weight: bold; 
            color: #333; 
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
        .chart-container { 
            background: white; 
            padding: 25px; 
            border-radius: 15px; 
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .chart-container h3 { 
            color: #667eea; 
            margin-bottom: 20px; 
            font-size: 1.3em;
        }
        .alerts-section { 
            background: white; 
            padding: 25px; 
            border-radius: 15px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .alert-item { 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 10px; 
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .alert-critical { background: #FEE2E2; border-left: 4px solid #EF4444; }
        .alert-warning { background: #FEF3C7; border-left: 4px solid #F59E0B; }
        .alert-info { background: #DBEAFE; border-left: 4px solid #3B82F6; }
        .refresh-indicator { 
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: rgba(255,255,255,0.9);
            padding: 10px 20px;
            border-radius: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            font-weight: bold;
            color: #667eea;
        }
        .uptime-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            color: white;
        }
        .uptime-excellent { background: #10B981; }
        .uptime-good { background: #F59E0B; }
        .uptime-poor { background: #EF4444; }
        @media (max-width: 768px) {
            .stats-grid { grid-template-columns: 1fr; }
            .container { padding: 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Production Monitoring</h1>
            <p>AI Finance Agency - Real-time System Health & Performance</p>
            <p id="lastUpdate">Last updated: Loading...</p>
        </div>
        
        <div class="refresh-indicator" id="refreshIndicator">
            🔄 Auto-refresh: 30s
        </div>

        <div class="stats-grid" id="systemStats">
            <!-- System stats will be populated here -->
        </div>

        <div class="chart-container">
            <h3>📊 System Performance Trends</h3>
            <canvas id="performanceChart" width="400" height="100"></canvas>
        </div>

        <div class="alerts-section">
            <h3>🚨 Recent Alerts</h3>
            <div id="alertsList">
                <!-- Alerts will be populated here -->
            </div>
        </div>
    </div>

    <script>
        let performanceChart = null;
        let refreshInterval = null;
        
        async function fetchMonitoringData() {
            try {
                const response = await fetch('/api/monitoring/summary');
                const data = await response.json();
                
                updateSystemStats(data);
                updatePerformanceChart(data);
                updateAlerts(data);
                updateTimestamp();
                
            } catch (error) {
                console.error('Error fetching monitoring data:', error);
                document.getElementById('refreshIndicator').innerHTML = '❌ Connection Error';
            }
        }
        
        function updateSystemStats(data) {
            const statsContainer = document.getElementById('systemStats');
            
            if (!data.system_metrics) {
                statsContainer.innerHTML = '<div class="stat-card"><h3>⚠️ No Data</h3><p>System metrics unavailable</p></div>';
                return;
            }
            
            const metrics = data.system_metrics;
            
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <h3>🖥️ CPU Usage</h3>
                    <div class="metric-value" style="color: ${getCpuColor(metrics[2])}">${metrics[2].toFixed(1)}%</div>
                    <div class="metric-label">Current usage</div>
                </div>
                
                <div class="stat-card">
                    <h3>💾 Memory Usage</h3>
                    <div class="metric-value" style="color: ${getMemoryColor(metrics[3])}">${metrics[3].toFixed(1)}%</div>
                    <div class="metric-label">RAM utilization</div>
                </div>
                
                <div class="stat-card">
                    <h3>💿 Disk Usage</h3>
                    <div class="metric-value" style="color: ${getDiskColor(metrics[4])}">${metrics[4].toFixed(1)}%</div>
                    <div class="metric-label">Storage used</div>
                </div>
                
                <div class="stat-card">
                    <h3>🌐 Network</h3>
                    <div class="metric-value">${metrics[6]}</div>
                    <div class="metric-label">Active connections</div>
                </div>
                
                <div class="stat-card">
                    <h3>⚙️ Processes</h3>
                    <div class="metric-value">${metrics[7]}</div>
                    <div class="metric-label">Running processes</div>
                </div>
                
                <div class="stat-card">
                    <h3>📈 System Load</h3>
                    <div class="metric-value">${metrics[8].toFixed(2)}</div>
                    <div class="metric-label">Load average</div>
                </div>
            `;
            
            // Add service status cards
            if (data.services && data.services.length > 0) {
                const servicesHtml = data.services.map(service => `
                    <div class="stat-card">
                        <h3>🔧 ${service[0]}</h3>
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <span class="status-indicator status-${service[1]}"></span>
                            <span style="font-weight: bold; text-transform: uppercase;">${service[1]}</span>
                        </div>
                        <div class="metric-value" style="font-size: 1.5em;">${service[2].toFixed(0)}ms</div>
                        <div class="metric-label">Response time</div>
                        <div class="uptime-badge ${getUptimeBadgeClass(service[3])}">${service[3].toFixed(1)}% uptime</div>
                    </div>
                `).join('');
                
                statsContainer.innerHTML += servicesHtml;
            }
        }
        
        function updatePerformanceChart(data) {
            // This would be implemented with historical data
            // For now, showing a placeholder
            if (performanceChart) {
                performanceChart.destroy();
            }
            
            const ctx = document.getElementById('performanceChart').getContext('2d');
            performanceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['5m ago', '4m ago', '3m ago', '2m ago', '1m ago', 'Now'],
                    datasets: [{
                        label: 'CPU %',
                        data: [65, 70, 68, 72, 69, data.system_metrics ? data.system_metrics[2] : 0],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Memory %',
                        data: [75, 78, 76, 80, 77, data.system_metrics ? data.system_metrics[3] : 0],
                        borderColor: '#764ba2',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true, max: 100 }
                    },
                    plugins: {
                        legend: { display: true }
                    }
                }
            });
        }
        
        function updateAlerts(data) {
            const alertsContainer = document.getElementById('alertsList');
            
            if (!data.alerts || Object.keys(data.alerts).length === 0) {
                alertsContainer.innerHTML = '<div class="alert-item alert-info">✅ No active alerts - All systems operational</div>';
                return;
            }
            
            let alertsHtml = '';
            for (const [severity, count] of Object.entries(data.alerts)) {
                alertsHtml += `
                    <div class="alert-item alert-${severity}">
                        <strong>${severity.toUpperCase()}</strong>
                        <span>${count} active alert${count > 1 ? 's' : ''}</span>
                    </div>
                `;
            }
            
            alertsContainer.innerHTML = alertsHtml;
        }
        
        function updateTimestamp() {
            document.getElementById('lastUpdate').innerText = `Last updated: ${new Date().toLocaleString()}`;
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
        
        function getUptimeBadgeClass(uptime) {
            if (uptime >= 99.5) return 'uptime-excellent';
            if (uptime >= 95) return 'uptime-good';
            return 'uptime-poor';
        }
        
        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            fetchMonitoringData();
            
            // Auto-refresh every 30 seconds
            refreshInterval = setInterval(() => {
                fetchMonitoringData();
                document.getElementById('refreshIndicator').innerHTML = '🔄 Refreshing...';
                setTimeout(() => {
                    document.getElementById('refreshIndicator').innerHTML = '🔄 Auto-refresh: 30s';
                }, 2000);
            }, 30000);
        });
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', function() {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        });
    </script>
</body>
</html>
"""

@app.route('/')
def dashboard():
    """Main monitoring dashboard"""
    return render_template_string(DASHBOARD_HTML)

@app.route('/api/monitoring/summary')
def monitoring_summary():
    """API endpoint for monitoring summary"""
    try:
        if not monitor:
            init_monitor()
        
        summary = monitor.get_monitoring_summary()
        return jsonify(summary)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/monitoring/metrics')
def get_metrics():
    """Get system metrics"""
    try:
        if not monitor:
            init_monitor()
        
        metrics = monitor.collect_system_metrics()
        return jsonify(asdict(metrics) if metrics else {'error': 'No metrics available'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/monitoring/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'monitoring_dashboard'
    })

@app.route('/api/monitoring/alerts')
def get_alerts():
    """Get recent alerts"""
    try:
        if not monitor:
            init_monitor()
        
        conn = sqlite3.connect(monitor.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, severity, service, message, timestamp, resolved
            FROM alerts 
            WHERE timestamp >= datetime('now', '-24 hours')
            ORDER BY timestamp DESC
            LIMIT 50
        ''')
        
        alerts = []
        for row in cursor.fetchall():
            alerts.append({
                'id': row[0],
                'severity': row[1],
                'service': row[2],
                'message': row[3],
                'timestamp': row[4],
                'resolved': bool(row[5])
            })
        
        conn.close()
        return jsonify(alerts)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def run_monitoring_dashboard():
    """Run the monitoring dashboard"""
    print("🚀 Starting Monitoring Dashboard")
    print("=" * 50)
    print("📊 Dashboard: http://localhost:5002")
    print("🔍 API: http://localhost:5002/api/monitoring/summary")
    print("💊 Health: http://localhost:5002/api/monitoring/health")
    print("=" * 50)
    
    init_monitor()
    app.run(host='0.0.0.0', port=5002, debug=False)

if __name__ == "__main__":
    run_monitoring_dashboard()