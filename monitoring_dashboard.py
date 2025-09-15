#!/usr/bin/env python3
"""
Real-time Monitoring Dashboard
Web-based dashboard for AI Finance Agency social media automation
"""

import os
import json
import sqlite3
from datetime import datetime, timedelta
from flask import Flask, render_template_string, jsonify
import subprocess
from threading import Thread
import time

app = Flask(__name__)

# HTML Dashboard Template
DASHBOARD_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Finance Agency - Monitoring Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .header {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        .header h1 {
            color: #333;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header .subtitle {
            color: #666;
            font-size: 1.2em;
        }
        .header .status {
            margin-top: 20px;
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        .status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: #f0f0f0;
            border-radius: 20px;
            font-weight: 500;
        }
        .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        .status-dot.healthy { background: #4caf50; }
        .status-dot.warning { background: #ff9800; }
        .status-dot.error { background: #f44336; }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 50px rgba(0,0,0,0.15);
        }
        .card h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.5em;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .card .icon {
            font-size: 1.5em;
        }
        
        .platform-status {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .platform-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #ddd;
            transition: all 0.3s ease;
        }
        .platform-item.healthy { border-left-color: #4caf50; background: #e8f5e9; }
        .platform-item.warning { border-left-color: #ff9800; background: #fff3e0; }
        .platform-item.error { border-left-color: #f44336; background: #ffebee; }
        
        .platform-name {
            font-weight: 600;
            font-size: 1.1em;
        }
        .platform-details {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .response-time {
            color: #666;
            font-size: 0.9em;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .stat-item {
            padding: 15px;
            background: #f8f9fa;
            border-radius: 10px;
            text-align: center;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #666;
            margin-top: 5px;
            font-size: 0.9em;
        }
        
        .activity-list {
            max-height: 400px;
            overflow-y: auto;
        }
        .activity-item {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background 0.3s ease;
        }
        .activity-item:hover {
            background: #f8f9fa;
        }
        .activity-item:last-child {
            border-bottom: none;
        }
        .activity-time {
            color: #999;
            font-size: 0.85em;
        }
        .activity-status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85em;
            font-weight: 500;
        }
        .activity-status.success { background: #4caf50; color: white; }
        .activity-status.failed { background: #f44336; color: white; }
        
        .refresh-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 1em;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        .refresh-btn:hover {
            background: #5a67d8;
        }
        
        .last-update {
            color: #999;
            font-size: 0.9em;
            margin-top: 10px;
        }
        
        .alert-banner {
            background: #ff5252;
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: none;
        }
        .alert-banner.show {
            display: block;
            animation: slideDown 0.3s ease;
        }
        
        @keyframes slideDown {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
            .grid { grid-template-columns: 1fr; }
            .stats-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="alert-banner" id="alertBanner"></div>
        
        <div class="header">
            <h1>🚀 AI Finance Agency Dashboard</h1>
            <div class="subtitle">Real-time Social Media Automation Monitoring</div>
            <div class="status">
                <div class="status-indicator">
                    <div class="status-dot" id="overallStatus"></div>
                    <span id="overallStatusText">Checking...</span>
                </div>
                <div class="status-indicator">
                    <span class="last-update" id="lastUpdate">Last update: Never</span>
                </div>
                <button class="refresh-btn" onclick="refreshDashboard()">🔄 Refresh</button>
            </div>
        </div>
        
        <div class="grid">
            <!-- Platform Health Card -->
            <div class="card">
                <h2><span class="icon">📱</span> Platform Health</h2>
                <div class="platform-status" id="platformStatus">
                    <div class="loading"></div>
                </div>
            </div>
            
            <!-- Today's Statistics -->
            <div class="card">
                <h2><span class="icon">📊</span> Today's Statistics</h2>
                <div class="stats-grid" id="todayStats">
                    <div class="loading"></div>
                </div>
            </div>
            
            <!-- API Usage -->
            <div class="card">
                <h2><span class="icon">⚡</span> API Usage</h2>
                <div class="platform-status" id="apiUsage">
                    <div class="loading"></div>
                </div>
            </div>
            
            <!-- Recent Activity -->
            <div class="card">
                <h2><span class="icon">📝</span> Recent Posts</h2>
                <div class="activity-list" id="recentActivity">
                    <div class="loading"></div>
                </div>
            </div>
        </div>
        
        <!-- System Health Card -->
        <div class="card">
            <h2><span class="icon">🖥️</span> System Health</h2>
            <div class="stats-grid" id="systemHealth">
                <div class="loading"></div>
            </div>
        </div>
    </div>
    
    <script>
        let autoRefreshInterval;
        
        async function refreshDashboard() {
            try {
                const response = await fetch('/api/dashboard-data');
                const data = await response.json();
                updateDashboard(data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                showAlert('Failed to fetch dashboard data. Please check system status.');
            }
        }
        
        function updateDashboard(data) {
            // Update overall status
            const overallDot = document.getElementById('overallStatus');
            const overallText = document.getElementById('overallStatusText');
            
            overallDot.className = 'status-dot ' + data.overall_status;
            overallText.textContent = data.overall_status_text;
            
            // Update platform status
            const platformDiv = document.getElementById('platformStatus');
            platformDiv.innerHTML = data.platforms.map(p => `
                <div class="platform-item ${p.status}">
                    <span class="platform-name">${p.icon} ${p.name}</span>
                    <div class="platform-details">
                        ${p.response_time ? `<span class="response-time">${p.response_time}ms</span>` : ''}
                        <span class="status-dot ${p.status}"></span>
                    </div>
                </div>
            `).join('');
            
            // Update today's stats
            const statsDiv = document.getElementById('todayStats');
            statsDiv.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value">${data.today_stats.total_posts}</div>
                    <div class="stat-label">Total Posts</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.today_stats.success_rate}%</div>
                    <div class="stat-label">Success Rate</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.today_stats.platforms_active}</div>
                    <div class="stat-label">Active Platforms</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.today_stats.avg_response_time}ms</div>
                    <div class="stat-label">Avg Response Time</div>
                </div>
            `;
            
            // Update API usage
            const apiDiv = document.getElementById('apiUsage');
            apiDiv.innerHTML = data.api_usage.map(api => `
                <div class="platform-item ${api.status}">
                    <span class="platform-name">${api.platform}</span>
                    <div class="platform-details">
                        <span class="response-time">${api.usage}% used</span>
                        <span class="status-dot ${api.status}"></span>
                    </div>
                </div>
            `).join('');
            
            // Update recent activity
            const activityDiv = document.getElementById('recentActivity');
            activityDiv.innerHTML = data.recent_posts.map(post => `
                <div class="activity-item">
                    <div>
                        <div>${post.content_preview}</div>
                        <div class="activity-time">${post.time}</div>
                    </div>
                    <span class="activity-status ${post.status}">${post.status}</span>
                </div>
            `).join('') || '<div class="activity-item">No recent posts</div>';
            
            // Update system health
            const systemDiv = document.getElementById('systemHealth');
            systemDiv.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value">${data.system_health.disk_usage}%</div>
                    <div class="stat-label">Disk Usage</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.system_health.database_size}</div>
                    <div class="stat-label">Database Size</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.system_health.backup_status}</div>
                    <div class="stat-label">Last Backup</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.system_health.uptime}</div>
                    <div class="stat-label">System Uptime</div>
                </div>
            `;
            
            // Update last update time
            document.getElementById('lastUpdate').textContent = 'Last update: ' + new Date().toLocaleTimeString();
            
            // Show alerts if any
            if (data.alerts && data.alerts.length > 0) {
                showAlert(data.alerts[0]);
            }
        }
        
        function showAlert(message) {
            const alertBanner = document.getElementById('alertBanner');
            alertBanner.textContent = '⚠️ ' + message;
            alertBanner.classList.add('show');
            
            setTimeout(() => {
                alertBanner.classList.remove('show');
            }, 5000);
        }
        
        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', () => {
            refreshDashboard();
            
            // Auto-refresh every 30 seconds
            autoRefreshInterval = setInterval(refreshDashboard, 30000);
        });
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
            }
        });
    </script>
</body>
</html>
"""

class DashboardDataCollector:
    """Collect data for dashboard display"""
    
    def __init__(self):
        self.db_path = 'data/automated_posts.db'
    
    def get_platform_health(self):
        """Get current platform health status"""
        platforms = []
        
        try:
            # Run health check script
            from platform_health_checker import PlatformHealthChecker
            checker = PlatformHealthChecker()
            
            # Check each platform
            health_data = {
                'telegram': checker.check_telegram_health(),
                'twitter': checker.check_twitter_health(),
                'linkedin': checker.check_linkedin_health(),
                'database': checker.check_database_health()
            }
            
            for platform, data in health_data.items():
                status = 'healthy' if data['status'] == 'healthy' else 'warning' if data['status'] in ['warning', 'rate_limited'] else 'error'
                
                platforms.append({
                    'name': platform.capitalize(),
                    'icon': {'telegram': '📱', 'twitter': '🐦', 'linkedin': '💼', 'database': '💾'}.get(platform, '📊'),
                    'status': status,
                    'response_time': data.get('response_time_ms')
                })
        except Exception as e:
            print(f"Error getting platform health: {e}")
            
        return platforms
    
    def get_today_stats(self):
        """Get today's posting statistics"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get today's stats
            cursor.execute('''
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
                    COUNT(DISTINCT CASE WHEN telegram_id IS NOT NULL THEN 'telegram' END) +
                    COUNT(DISTINCT CASE WHEN twitter_id IS NOT NULL THEN 'twitter' END) +
                    COUNT(DISTINCT CASE WHEN linkedin_id IS NOT NULL THEN 'linkedin' END) as platforms_active
                FROM posts 
                WHERE DATE(posted_at) = DATE('now')
            ''')
            
            result = cursor.fetchone()
            total = result[0] if result else 0
            successful = result[1] if result else 0
            platforms_active = result[2] if result else 0
            
            conn.close()
            
            success_rate = (successful / total * 100) if total > 0 else 100
            
            return {
                'total_posts': total,
                'success_rate': round(success_rate, 1),
                'platforms_active': platforms_active,
                'avg_response_time': '1.2k'  # Placeholder - would calculate from actual data
            }
        except Exception as e:
            print(f"Error getting today's stats: {e}")
            return {
                'total_posts': 0,
                'success_rate': 0,
                'platforms_active': 0,
                'avg_response_time': 'N/A'
            }
    
    def get_api_usage(self):
        """Get API usage statistics"""
        api_usage = []
        
        # Simulated data - in production, would fetch from api_rate_limit_monitor.py
        platforms_data = {
            'Twitter': {'usage': 15, 'limit': 300},
            'LinkedIn': {'usage': 2, 'limit': 100},
            'Telegram': {'usage': 0, 'limit': 0}  # No limits
        }
        
        for platform, data in platforms_data.items():
            if data['limit'] > 0:
                usage_percent = (data['usage'] / data['limit']) * 100
                status = 'healthy' if usage_percent < 60 else 'warning' if usage_percent < 80 else 'error'
                
                api_usage.append({
                    'platform': platform,
                    'usage': round(usage_percent, 1),
                    'status': status
                })
            else:
                api_usage.append({
                    'platform': platform,
                    'usage': 0,
                    'status': 'healthy'
                })
        
        return api_usage
    
    def get_recent_posts(self):
        """Get recent posting activity"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT content, posted_at, status 
                FROM posts 
                ORDER BY posted_at DESC 
                LIMIT 10
            ''')
            
            posts = []
            for content, posted_at, status in cursor.fetchall():
                # Parse timestamp
                post_time = datetime.fromisoformat(posted_at.replace(' ', 'T'))
                time_diff = datetime.now() - post_time
                
                if time_diff.days > 0:
                    time_str = f"{time_diff.days}d ago"
                elif time_diff.seconds > 3600:
                    time_str = f"{time_diff.seconds // 3600}h ago"
                elif time_diff.seconds > 60:
                    time_str = f"{time_diff.seconds // 60}m ago"
                else:
                    time_str = "Just now"
                
                posts.append({
                    'content_preview': content[:50] + '...' if len(content) > 50 else content,
                    'time': time_str,
                    'status': 'success' if status == 'success' else 'failed'
                })
            
            conn.close()
            return posts
            
        except Exception as e:
            print(f"Error getting recent posts: {e}")
            return []
    
    def get_system_health(self):
        """Get system health metrics"""
        try:
            # Get disk usage
            df_result = subprocess.run(['df', '-h', '.'], capture_output=True, text=True)
            disk_usage = 0
            if df_result.returncode == 0:
                lines = df_result.stdout.strip().split('\n')
                if len(lines) > 1:
                    usage_line = lines[1]
                    parts = usage_line.split()
                    if len(parts) > 4:
                        disk_usage = int(parts[4].replace('%', ''))
            
            # Get database size
            db_size = "0 MB"
            if os.path.exists(self.db_path):
                size_bytes = os.path.getsize(self.db_path)
                size_mb = size_bytes / (1024 * 1024)
                db_size = f"{size_mb:.1f} MB"
            
            # Get last backup
            backup_status = "Unknown"
            backup_dir = 'backup/daily'
            if os.path.exists(backup_dir):
                backups = sorted([d for d in os.listdir(backup_dir) if os.path.isdir(os.path.join(backup_dir, d))])
                if backups:
                    last_backup = backups[-1]
                    # Extract timestamp from backup name
                    if 'backup_' in last_backup:
                        timestamp_str = last_backup.split('_')[1]
                        backup_status = f"{timestamp_str[:4]}-{timestamp_str[4:6]}-{timestamp_str[6:8]}"
            
            # Get system uptime (simplified)
            uptime_result = subprocess.run(['uptime'], capture_output=True, text=True)
            uptime = "Unknown"
            if uptime_result.returncode == 0:
                uptime_parts = uptime_result.stdout.strip().split(',')
                if 'up' in uptime_parts[0]:
                    uptime = uptime_parts[0].split('up')[1].strip()
            
            return {
                'disk_usage': disk_usage,
                'database_size': db_size,
                'backup_status': backup_status,
                'uptime': uptime
            }
            
        except Exception as e:
            print(f"Error getting system health: {e}")
            return {
                'disk_usage': 0,
                'database_size': 'Unknown',
                'backup_status': 'Unknown',
                'uptime': 'Unknown'
            }
    
    def get_dashboard_data(self):
        """Compile all dashboard data"""
        platforms = self.get_platform_health()
        
        # Determine overall status
        if any(p['status'] == 'error' for p in platforms):
            overall_status = 'error'
            overall_status_text = 'System Issues Detected'
        elif any(p['status'] == 'warning' for p in platforms):
            overall_status = 'warning'
            overall_status_text = 'Warnings Present'
        else:
            overall_status = 'healthy'
            overall_status_text = 'All Systems Operational'
        
        # Check for alerts
        alerts = []
        if overall_status == 'error':
            alerts.append('Critical platform issues detected. Check system status.')
        
        return {
            'overall_status': overall_status,
            'overall_status_text': overall_status_text,
            'platforms': platforms,
            'today_stats': self.get_today_stats(),
            'api_usage': self.get_api_usage(),
            'recent_posts': self.get_recent_posts(),
            'system_health': self.get_system_health(),
            'alerts': alerts,
            'timestamp': datetime.now().isoformat()
        }

# Flask routes
@app.route('/')
def dashboard():
    """Serve the dashboard HTML"""
    return render_template_string(DASHBOARD_HTML)

@app.route('/api/dashboard-data')
def dashboard_data():
    """API endpoint for dashboard data"""
    collector = DashboardDataCollector()
    return jsonify(collector.get_dashboard_data())

def run_dashboard(host='127.0.0.1', port=5000, debug=False):
    """Run the dashboard server"""
    print(f"""
    ╔══════════════════════════════════════════════════════╗
    ║     AI FINANCE AGENCY - MONITORING DASHBOARD        ║
    ╠══════════════════════════════════════════════════════╣
    ║                                                      ║
    ║  Dashboard URL: http://{host}:{port}                ║
    ║                                                      ║
    ║  Press Ctrl+C to stop the dashboard                 ║
    ║                                                      ║
    ╚══════════════════════════════════════════════════════╝
    """)
    
    app.run(host=host, port=port, debug=debug)

if __name__ == '__main__':
    import sys
    
    # Parse command line arguments
    host = '127.0.0.1'
    port = 5000
    
    if len(sys.argv) > 1:
        if '--help' in sys.argv:
            print("""
AI Finance Agency - Monitoring Dashboard

Usage:
    python3 monitoring_dashboard.py [options]

Options:
    --host HOST     Host to bind to (default: 127.0.0.1)
    --port PORT     Port to bind to (default: 5000)
    --public        Make dashboard publicly accessible (0.0.0.0)
    --debug         Enable debug mode
    --help          Show this help message

Examples:
    python3 monitoring_dashboard.py
    python3 monitoring_dashboard.py --port 8080
    python3 monitoring_dashboard.py --public --port 3000
            """)
            sys.exit(0)
        
        if '--public' in sys.argv:
            host = '0.0.0.0'
        
        if '--host' in sys.argv:
            idx = sys.argv.index('--host')
            if idx + 1 < len(sys.argv):
                host = sys.argv[idx + 1]
        
        if '--port' in sys.argv:
            idx = sys.argv.index('--port')
            if idx + 1 < len(sys.argv):
                port = int(sys.argv[idx + 1])
        
        debug = '--debug' in sys.argv
    else:
        debug = False
    
    run_dashboard(host=host, port=port, debug=debug)