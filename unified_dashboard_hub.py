#!/usr/bin/env python3
"""
Unified Dashboard Hub - Beautiful UI/UX with Seamless Workflows
A modern, responsive dashboard that unifies all services
"""

from flask import Flask, render_template, jsonify, request, redirect, url_for
import requests
import json
import sqlite3
from datetime import datetime, timedelta
import os
from dashboard_manager import DashboardManager
from redis_cache_manager import RedisCacheManager, DashboardCache
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = 'unified-hub-secret-key'

# Initialize managers
dashboard_manager = DashboardManager()
cache_manager = RedisCacheManager()
dashboard_cache = DashboardCache(cache_manager)

# Dashboard configurations
DASHBOARDS = {
    'main': {'name': 'Control Center', 'port': 5000, 'icon': '🎯', 'color': '#007bff'},
    'approval': {'name': 'Content Approval', 'port': 5001, 'icon': '✅', 'color': '#28a745'},
    'queue': {'name': 'Queue Monitor', 'port': 5003, 'icon': '📊', 'color': '#17a2b8'},
    'platform': {'name': 'Platform Backend', 'port': 5002, 'icon': '⚙️', 'color': '#6c757d'},
    'unified': {'name': 'Unified View', 'port': 5010, 'icon': '🔄', 'color': '#ffc107'},
    'treum': {'name': 'AI Platform', 'port': 5011, 'icon': '🤖', 'color': '#6f42c1'},
    'social': {'name': 'Social Manager', 'port': 5020, 'icon': '📱', 'color': '#fd7e14'},
    'monitoring': {'name': 'System Monitor', 'port': 8080, 'icon': '📈', 'color': '#dc3545'}
}

@app.route('/')
def index():
    """Beautiful unified dashboard hub"""
    return render_template('unified_hub.html', dashboards=DASHBOARDS)

@app.route('/api/dashboard/status')
def get_dashboard_status():
    """Get real-time status of all dashboards"""
    status = dashboard_manager.status()
    health = dashboard_manager.health_check()
    
    combined = {}
    for key in status:
        combined[key] = {
            **status[key],
            'health': health.get(key, {}).get('status', 'unknown'),
            'response_time': health.get(key, {}).get('response_time', 'N/A'),
            'icon': DASHBOARDS.get(key, {}).get('icon', '📌'),
            'color': DASHBOARDS.get(key, {}).get('color', '#333')
        }
    
    return jsonify(combined)

@app.route('/api/metrics/summary')
def get_metrics_summary():
    """Get key performance metrics"""
    metrics = {}
    
    # Queue metrics
    try:
        conn = sqlite3.connect('posting_queue.db')
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                COUNT(CASE WHEN status = 'posted' THEN 1 END) as posted,
                COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
                COUNT(*) as total
            FROM queue
        """)
        
        result = cursor.fetchone()
        if result:
            pending, posted, failed, total = result
            metrics['queue'] = {
                'pending': pending,
                'posted': posted,
                'failed': failed,
                'total': total,
                'backlog_percentage': round((pending / total * 100) if total > 0 else 0, 1)
            }
        conn.close()
    except Exception as e:
        logger.error(f"Error getting queue metrics: {e}")
        metrics['queue'] = {'error': str(e)}
    
    # Cache metrics
    cache_stats = cache_manager.get_stats()
    metrics['cache'] = {
        'hit_rate': cache_stats['hit_rate'],
        'total_keys': cache_stats['redis_info']['total_keys'],
        'memory': cache_stats['redis_info']['used_memory_human']
    }
    
    # System metrics
    import psutil
    metrics['system'] = {
        'cpu': round(psutil.cpu_percent(interval=1), 1),
        'memory': round(psutil.virtual_memory().percent, 1),
        'disk': round(psutil.disk_usage('/').percent, 1)
    }
    
    return jsonify(metrics)

@app.route('/api/recent-activity')
def get_recent_activity():
    """Get recent system activity"""
    activities = []
    
    try:
        # Recent posts
        conn = sqlite3.connect('posting_queue.db')
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT platform, content, status, created_at, posted_at
            FROM queue
            ORDER BY created_at DESC
            LIMIT 10
        """)
        
        for row in cursor.fetchall():
            activities.append({
                'type': 'post',
                'platform': row[0],
                'content': row[1][:100] + '...' if len(row[1]) > 100 else row[1],
                'status': row[2],
                'timestamp': row[4] or row[3]
            })
        
        conn.close()
    except Exception as e:
        logger.error(f"Error getting recent activity: {e}")
    
    return jsonify(activities)

@app.route('/workflow/<workflow_name>')
def workflow_page(workflow_name):
    """Render specific workflow page"""
    workflows = {
        'content': {
            'title': 'Content Creation Workflow',
            'steps': [
                {'name': 'Generate', 'icon': '✨', 'url': 'http://localhost:5001/generate'},
                {'name': 'Review', 'icon': '👁️', 'url': 'http://localhost:5001/'},
                {'name': 'Approve', 'icon': '✅', 'url': 'http://localhost:5001/approve'},
                {'name': 'Post', 'icon': '📤', 'url': 'http://localhost:5003/'}
            ]
        },
        'monitoring': {
            'title': 'System Monitoring Workflow',
            'steps': [
                {'name': 'Metrics', 'icon': '📊', 'url': 'http://localhost:8080/'},
                {'name': 'Queue', 'icon': '📈', 'url': 'http://localhost:5003/'},
                {'name': 'Health', 'icon': '❤️', 'url': '/api/dashboard/status'},
                {'name': 'Logs', 'icon': '📝', 'url': '/logs'}
            ]
        },
        'management': {
            'title': 'Service Management Workflow',
            'steps': [
                {'name': 'Status', 'icon': '🔍', 'url': '/api/dashboard/status'},
                {'name': 'Start/Stop', 'icon': '⚡', 'url': '/manage'},
                {'name': 'Configure', 'icon': '⚙️', 'url': '/config'},
                {'name': 'Deploy', 'icon': '🚀', 'url': '/deploy'}
            ]
        }
    }
    
    workflow = workflows.get(workflow_name, workflows['content'])
    return render_template('workflow.html', workflow=workflow)

if __name__ == '__main__':
    # Create templates directory
    os.makedirs('templates', exist_ok=True)
    
    # Create the beautiful unified hub template
    hub_template = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Finance Agency - Unified Dashboard Hub</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        header {
            text-align: center;
            color: white;
            margin-bottom: 3rem;
            animation: fadeInDown 0.8s ease;
        }
        
        h1 {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.95;
        }
        
        .metrics-bar {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
            animation: fadeInUp 0.8s ease 0.2s both;
        }
        
        .metric-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 1.5rem;
            text-align: center;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }
        
        .metric-value {
            font-size: 2.5rem;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .metric-label {
            color: #666;
            font-size: 0.9rem;
            margin-top: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
            animation: fadeInUp 0.8s ease 0.4s both;
        }
        
        .dashboard-card {
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
            position: relative;
        }
        
        .dashboard-card:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        
        .dashboard-header {
            padding: 1.5rem;
            background: linear-gradient(135deg, var(--color) 0%, var(--color-dark) 100%);
            color: white;
            position: relative;
            overflow: hidden;
        }
        
        .dashboard-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
        }
        
        .dashboard-icon {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        
        .dashboard-name {
            font-size: 1.3rem;
            font-weight: 600;
            position: relative;
            z-index: 1;
        }
        
        .dashboard-body {
            padding: 1.5rem;
        }
        
        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 500;
            margin-bottom: 1rem;
        }
        
        .status-online {
            background: #d4edda;
            color: #155724;
        }
        
        .status-offline {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status-loading {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
        }
        
        .status-online .status-dot {
            background: #28a745;
        }
        
        .status-offline .status-dot {
            background: #dc3545;
        }
        
        .dashboard-stats {
            display: flex;
            justify-content: space-between;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
        }
        
        .stat {
            text-align: center;
        }
        
        .stat-value {
            font-size: 1.2rem;
            font-weight: bold;
            color: #333;
        }
        
        .stat-label {
            font-size: 0.8rem;
            color: #999;
            text-transform: uppercase;
        }
        
        .workflows {
            margin-top: 3rem;
            animation: fadeInUp 0.8s ease 0.6s both;
        }
        
        .workflow-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .workflow-btn {
            padding: 1rem 2rem;
            background: white;
            border: none;
            border-radius: 50px;
            font-size: 1rem;
            font-weight: 600;
            color: #667eea;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .workflow-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            background: #667eea;
            color: white;
        }
        
        .floating-action {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
            z-index: 1000;
        }
        
        .floating-action:hover {
            transform: scale(1.1) rotate(90deg);
        }
        
        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.1);
                opacity: 0.7;
            }
        }
        
        .live-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            background: #28a745;
            border-radius: 50%;
            margin-left: 0.5rem;
            animation: live-pulse 2s ease-in-out infinite;
        }
        
        @keyframes live-pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🚀 AI Finance Agency</h1>
            <p class="subtitle">Unified Dashboard Hub <span class="live-indicator"></span></p>
        </header>
        
        <div class="metrics-bar" id="metrics">
            <div class="metric-card">
                <div class="metric-value" id="queue-backlog">--</div>
                <div class="metric-label">Queue Backlog</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" id="posts-today">--</div>
                <div class="metric-label">Posts Today</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" id="cache-hit">--</div>
                <div class="metric-label">Cache Hit Rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" id="system-health">--</div>
                <div class="metric-label">System Health</div>
            </div>
        </div>
        
        <div class="dashboard-grid" id="dashboards">
            {% for key, dashboard in dashboards.items() %}
            <div class="dashboard-card" onclick="openDashboard('{{ dashboard.port }}')" style="--color: {{ dashboard.color }}; --color-dark: {{ dashboard.color }}cc;">
                <div class="dashboard-header">
                    <div class="dashboard-icon">{{ dashboard.icon }}</div>
                    <div class="dashboard-name">{{ dashboard.name }}</div>
                </div>
                <div class="dashboard-body">
                    <div class="status-indicator status-loading" id="status-{{ key }}">
                        <span class="status-dot"></span>
                        <span>Checking...</span>
                    </div>
                    <div class="dashboard-stats">
                        <div class="stat">
                            <div class="stat-value" id="port-{{ key }}">{{ dashboard.port }}</div>
                            <div class="stat-label">Port</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value" id="response-{{ key }}">--</div>
                            <div class="stat-label">Response</div>
                        </div>
                    </div>
                </div>
            </div>
            {% endfor %}
        </div>
        
        <div class="workflows">
            <h2 style="text-align: center; color: white; margin-bottom: 2rem;">Quick Workflows</h2>
            <div class="workflow-buttons">
                <button class="workflow-btn" onclick="startWorkflow('content')">
                    ✨ Content Creation
                </button>
                <button class="workflow-btn" onclick="startWorkflow('monitoring')">
                    📊 System Monitoring
                </button>
                <button class="workflow-btn" onclick="startWorkflow('management')">
                    ⚙️ Service Management
                </button>
                <button class="workflow-btn" onclick="generateContent()">
                    🎯 Quick Generate
                </button>
            </div>
        </div>
    </div>
    
    <button class="floating-action" onclick="refreshAll()" title="Refresh All">
        🔄
    </button>
    
    <script>
        function openDashboard(port) {
            window.open(`http://localhost:${port}`, '_blank');
        }
        
        function startWorkflow(name) {
            window.location.href = `/workflow/${name}`;
        }
        
        function generateContent() {
            fetch('http://localhost:5001/generate', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    alert('Content generation started!');
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Please ensure the Approval Dashboard is running');
                });
        }
        
        function updateMetrics() {
            fetch('/api/metrics/summary')
                .then(response => response.json())
                .then(data => {
                    // Update queue metrics
                    if (data.queue) {
                        document.getElementById('queue-backlog').textContent = 
                            data.queue.backlog_percentage + '%';
                        document.getElementById('posts-today').textContent = 
                            data.queue.posted || '0';
                    }
                    
                    // Update cache metrics
                    if (data.cache) {
                        document.getElementById('cache-hit').textContent = 
                            data.cache.hit_rate;
                    }
                    
                    // Update system health
                    if (data.system) {
                        const health = 100 - ((data.system.cpu + data.system.memory) / 2);
                        document.getElementById('system-health').textContent = 
                            Math.round(health) + '%';
                    }
                })
                .catch(error => console.error('Error updating metrics:', error));
        }
        
        function updateDashboardStatus() {
            fetch('/api/dashboard/status')
                .then(response => response.json())
                .then(data => {
                    for (const [key, info] of Object.entries(data)) {
                        const statusEl = document.getElementById(`status-${key}`);
                        const responseEl = document.getElementById(`response-${key}`);
                        
                        if (statusEl) {
                            if (info.status === 'running' && info.health === 'healthy') {
                                statusEl.className = 'status-indicator status-online';
                                statusEl.innerHTML = '<span class="status-dot"></span><span>Online</span>';
                            } else if (info.status === 'running') {
                                statusEl.className = 'status-indicator status-loading';
                                statusEl.innerHTML = '<span class="status-dot"></span><span>Running</span>';
                            } else {
                                statusEl.className = 'status-indicator status-offline';
                                statusEl.innerHTML = '<span class="status-dot"></span><span>Offline</span>';
                            }
                        }
                        
                        if (responseEl && info.response_time) {
                            responseEl.textContent = info.response_time;
                        }
                    }
                })
                .catch(error => console.error('Error updating status:', error));
        }
        
        function refreshAll() {
            updateMetrics();
            updateDashboardStatus();
            
            // Rotate refresh button
            event.target.style.transform = 'scale(1.1) rotate(360deg)';
            setTimeout(() => {
                event.target.style.transform = '';
            }, 500);
        }
        
        // Initial load
        updateMetrics();
        updateDashboardStatus();
        
        // Auto-refresh every 10 seconds
        setInterval(updateMetrics, 10000);
        setInterval(updateDashboardStatus, 10000);
    </script>
</body>
</html>'''
    
    # Save the template
    with open('templates/unified_hub.html', 'w') as f:
        f.write(hub_template)
    
    print("\n" + "="*60)
    print("🎨 UNIFIED DASHBOARD HUB")
    print("="*60)
    print("\n✨ Beautiful UI/UX Features:")
    print("  • Modern gradient design")
    print("  • Real-time status updates")
    print("  • Animated transitions")
    print("  • Responsive layout")
    print("  • One-click dashboard access")
    print("  • Workflow shortcuts")
    print("  • Live metrics display")
    print("\n🚀 Access at: http://localhost:7777")
    print("="*60)
    
    app.run(debug=False, host='0.0.0.0', port=7777)