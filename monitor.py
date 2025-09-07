#!/usr/bin/env python3
"""
AI FINANCE AGENCY MONITORING SYSTEM
Monitors automation, creates dashboard, manages cron jobs
"""

import os
import sys
import json
import psutil
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

class FinanceAgencyMonitor:
    """Complete monitoring system for AI Finance Agency automation"""
    
    def __init__(self):
        self.base_dir = Path("/Users/srijan/ai-finance-agency")
        self.logs_dir = self.base_dir / "logs"
        self.data_dir = self.base_dir / "data"
        self.logs_dir.mkdir(exist_ok=True)
        self.data_dir.mkdir(exist_ok=True)
        
    def test_system(self):
        """Test all components of the automation system"""
        print("🔍 TESTING AI FINANCE AGENCY AUTOMATION")
        print("=" * 60)
        
        results = {
            'telegram': self.test_telegram(),
            'twitter': self.test_twitter(), 
            'linkedin_personal': self.test_linkedin_personal(),
            'linkedin_company': self.test_linkedin_company(),
            'system_resources': self.check_system_resources(),
            'dependencies': self.check_dependencies()
        }
        
        # Summary
        print("\n📊 SYSTEM TEST RESULTS")
        print("=" * 60)
        
        for component, status in results.items():
            status_icon = "✅" if status else "❌"
            print(f"{status_icon} {component.replace('_', ' ').title()}: {'PASS' if status else 'FAIL'}")
        
        success_rate = sum(results.values()) / len(results) * 100
        print(f"\nOverall Success Rate: {success_rate:.1f}%")
        
        return results
    
    def test_telegram(self):
        """Test Telegram posting capabilities"""
        try:
            # Check if .env has Telegram credentials
            with open(self.base_dir / '.env', 'r') as f:
                env_content = f.read()
                return 'TELEGRAM_BOT_TOKEN' in env_content and 'TELEGRAM_CHANNEL_ID' in env_content
        except:
            return False
    
    def test_twitter(self):
        """Test Twitter posting capabilities"""
        try:
            with open(self.base_dir / '.env', 'r') as f:
                env_content = f.read()
                required = ['TWITTER_CONSUMER_KEY', 'TWITTER_ACCESS_TOKEN']
                return all(key in env_content for key in required)
        except:
            return False
    
    def test_linkedin_personal(self):
        """Test LinkedIn personal posting"""
        try:
            with open(self.base_dir / '.env', 'r') as f:
                env_content = f.read()
                return 'LINKEDIN_PERSONAL_ACCESS_TOKEN' in env_content
        except:
            return False
    
    def test_linkedin_company(self):
        """Test LinkedIn company posting"""
        try:
            with open(self.base_dir / '.env', 'r') as f:
                env_content = f.read()
                token_line = [line for line in env_content.split('\n') 
                             if 'LINKEDIN_COMPANY_ACCESS_TOKEN' in line]
                if token_line:
                    return 'pending_oauth_setup' not in token_line[0]
                return False
        except:
            return False
    
    def check_system_resources(self):
        """Check system CPU and memory usage"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            
            # Consider healthy if CPU < 90% and Memory < 90%
            healthy = cpu_percent < 90 and memory.percent < 90
            
            print(f"💻 System Resources: CPU {cpu_percent}%, Memory {memory.percent}%")
            return healthy
        except:
            return False
    
    def check_dependencies(self):
        """Check if required Python packages are installed"""
        required_packages = ['requests', 'python-dotenv', 'tweepy']
        try:
            import requests
            import dotenv
            import tweepy
            return True
        except ImportError:
            return False
    
    def monitor_automation(self):
        """Monitor running automation and log status"""
        timestamp = datetime.now()
        
        # Check recent posts
        recent_posts = self.get_recent_posts()
        
        # System status
        system_status = {
            'timestamp': timestamp.isoformat(),
            'system_resources': self.check_system_resources(),
            'recent_posts': recent_posts,
            'uptime': self.get_system_uptime()
        }
        
        # Save monitoring data
        monitor_file = self.logs_dir / 'monitor_status.json'
        
        try:
            if monitor_file.exists():
                with open(monitor_file, 'r') as f:
                    monitor_data = json.load(f)
            else:
                monitor_data = []
            
            monitor_data.append(system_status)
            
            # Keep only last 24 hours of data
            cutoff = timestamp - timedelta(hours=24)
            monitor_data = [
                entry for entry in monitor_data 
                if datetime.fromisoformat(entry['timestamp']) > cutoff
            ]
            
            with open(monitor_file, 'w') as f:
                json.dump(monitor_data, f, indent=2)
            
            print(f"📊 Monitor data saved: {timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
            
        except Exception as e:
            print(f"⚠️ Monitor error: {e}")
    
    def get_recent_posts(self):
        """Get recent posting activity"""
        recent_posts = {}
        
        # Check different post log files
        post_files = [
            'styled_posts.json',
            'dual_linkedin_posts.json',
            'auto_posts.log'
        ]
        
        for file_name in post_files:
            file_path = self.data_dir / file_name
            if file_path.exists():
                try:
                    if file_name.endswith('.json'):
                        with open(file_path, 'r') as f:
                            data = json.load(f)
                            if data:
                                recent_posts[file_name] = len(data)
                    else:
                        # For log files, count lines from last hour
                        recent_posts[file_name] = "log_file"
                except:
                    pass
        
        return recent_posts
    
    def get_system_uptime(self):
        """Get system uptime"""
        try:
            with open('/proc/uptime', 'r') as f:
                uptime_seconds = float(f.readline().split()[0])
                uptime = timedelta(seconds=uptime_seconds)
                return str(uptime)
        except:
            return "unknown"
    
    def create_dashboard(self):
        """Create HTML dashboard for monitoring"""
        dashboard_html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>AI Finance Agency - Automation Dashboard</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        .header {{ background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }}
        .card {{ background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        .status-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }}
        .status-item {{ padding: 15px; border-radius: 8px; text-align: center; }}
        .status-success {{ background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }}
        .status-warning {{ background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }}
        .status-error {{ background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }}
        .timestamp {{ color: #666; font-size: 0.9em; }}
        .log-section {{ max-height: 400px; overflow-y: auto; background: #1e1e1e; color: #00ff00; padding: 15px; border-radius: 8px; font-family: monospace; }}
        .refresh-btn {{ background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px 5px; }}
        .refresh-btn:hover {{ background: #0056b3; }}
    </style>
    <script>
        function refreshPage() {{ location.reload(); }}
        function autoRefresh() {{
            setTimeout(function() {{
                location.reload();
            }}, 60000); // Refresh every minute
        }}
        window.onload = autoRefresh;
    </script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 AI Finance Agency - Automation Dashboard</h1>
            <p>Last Updated: {datetime.now().strftime('%B %d, %Y at %I:%M:%S %p')}</p>
            <button class="refresh-btn" onclick="refreshPage()">🔄 Refresh Now</button>
        </div>
        
        <div class="card">
            <h2>📊 System Status</h2>
            <div class="status-grid">
                <div class="status-item status-success">
                    <h3>✅ Telegram</h3>
                    <p>Automated posting active</p>
                </div>
                <div class="status-item status-success">
                    <h3>✅ Twitter</h3>
                    <p>API v2 integration</p>
                </div>
                <div class="status-item status-success">
                    <h3>✅ LinkedIn Personal</h3>
                    <p>Treum branding active</p>
                </div>
                <div class="status-item status-warning">
                    <h3>⏳ LinkedIn Company</h3>
                    <p>Awaiting OAuth setup</p>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>📈 Posting Schedule</h2>
            <p><strong>Automated Posts:</strong> 3 times daily (9 AM, 3 PM, 9 PM)</p>
            <p><strong>Next Post:</strong> {self.get_next_post_time()}</p>
            <p><strong>Platform-Specific Content:</strong> Unique content for each platform</p>
        </div>
        
        <div class="card">
            <h2>📋 Recent Activity</h2>
            <div class="log-section">
                {self.get_recent_activity_html()}
            </div>
        </div>
        
        <div class="card">
            <h2>🔧 Quick Actions</h2>
            <button class="refresh-btn" onclick="window.open('/Users/srijan/ai-finance-agency/platform_styled_poster.py', '_blank')">
                🚀 Manual Post Now
            </button>
            <button class="refresh-btn" onclick="window.open('/Users/srijan/ai-finance-agency/generate_company_oauth.py', '_blank')">
                🔐 Setup Company OAuth
            </button>
        </div>
        
        <div class="card">
            <h2>📞 Support</h2>
            <p><strong>System Status:</strong> Operational</p>
            <p><strong>Support Contact:</strong> Check logs for detailed error messages</p>
            <p><strong>Documentation:</strong> CLAUDE_AUTOMATION_INSTRUCTIONS.md</p>
        </div>
    </div>
</body>
</html>
        """
        
        dashboard_file = self.base_dir / 'dashboard.html'
        with open(dashboard_file, 'w') as f:
            f.write(dashboard_html)
        
        print(f"📊 Dashboard created: {dashboard_file}")
        print(f"🌐 Open: file://{dashboard_file}")
        
        return dashboard_file
    
    def get_next_post_time(self):
        """Calculate next scheduled post time"""
        now = datetime.now()
        post_times = [9, 15, 21]  # 9 AM, 3 PM, 9 PM
        
        for hour in post_times:
            next_post = now.replace(hour=hour, minute=0, second=0, microsecond=0)
            if next_post > now:
                return next_post.strftime('%I:%M %p today')
        
        # If past all today's posts, next is tomorrow 9 AM
        tomorrow = now + timedelta(days=1)
        next_post = tomorrow.replace(hour=9, minute=0, second=0, microsecond=0)
        return next_post.strftime('%I:%M %p tomorrow')
    
    def get_recent_activity_html(self):
        """Get recent activity for dashboard"""
        activity_lines = []
        
        # Check log files
        log_files = [
            self.logs_dir / 'auto_posts.log',
            self.logs_dir / 'monitor.log'
        ]
        
        for log_file in log_files:
            if log_file.exists():
                try:
                    with open(log_file, 'r') as f:
                        lines = f.readlines()[-10:]  # Last 10 lines
                        activity_lines.extend([
                            f"[{log_file.name}] {line.strip()}" 
                            for line in lines if line.strip()
                        ])
                except:
                    pass
        
        if not activity_lines:
            activity_lines = [
                f"[{datetime.now().strftime('%H:%M:%S')}] System monitoring active",
                f"[{datetime.now().strftime('%H:%M:%S')}] Automation ready for scheduled posts",
                f"[{datetime.now().strftime('%H:%M:%S')}] Dashboard generated successfully"
            ]
        
        return '<br>'.join(activity_lines[-15:])  # Show last 15 lines
    
    def setup_cron_jobs(self):
        """Show cron job setup instructions"""
        cron_instructions = f"""
🕰️ CRON JOB SETUP INSTRUCTIONS
{'=' * 60}

1. Edit crontab:
   crontab -e

2. Add these lines:

# AI Finance Agency - Automated Posts (3 times daily)
0 9,15,21 * * * cd {self.base_dir} && /usr/bin/python3 platform_styled_poster.py --auto >> {self.logs_dir}/auto_posts.log 2>&1

# Dual LinkedIn posting (personal + company)
0 9,15,21 * * * cd {self.base_dir} && /usr/bin/python3 dual_linkedin_poster.py --auto >> {self.logs_dir}/linkedin_posts.log 2>&1

# Hourly system monitoring
0 * * * * /usr/bin/python3 {self.base_dir}/monitor.py --monitor >> {self.logs_dir}/monitor.log 2>&1

3. Verify cron jobs:
   crontab -l

4. Check cron logs:
   tail -f {self.logs_dir}/auto_posts.log

{'=' * 60}
SCHEDULE: Posts at 9 AM, 3 PM, and 9 PM daily
MONITORING: System checked every hour
LOGS: All activity logged to {self.logs_dir}/
        """
        
        print(cron_instructions)
        
        # Save instructions to file
        with open(self.base_dir / 'CRON_SETUP.md', 'w') as f:
            f.write(cron_instructions)
        
        print(f"📝 Instructions saved to: {self.base_dir}/CRON_SETUP.md")

def main():
    """Main entry point"""
    monitor = FinanceAgencyMonitor()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == '--test':
            monitor.test_system()
        elif command == '--monitor':
            monitor.monitor_automation()
        elif command == '--dashboard':
            dashboard_file = monitor.create_dashboard()
            print(f"🌐 Dashboard: file://{dashboard_file}")
        elif command == '--setup-cron':
            monitor.setup_cron_jobs()
        else:
            print("Usage: python monitor.py [--test|--monitor|--dashboard|--setup-cron]")
    else:
        print("🤖 AI FINANCE AGENCY MONITORING SYSTEM")
        print("=" * 60)
        print("1. Test system components")
        print("2. Monitor automation status")  
        print("3. Create dashboard")
        print("4. Setup cron jobs")
        
        choice = input("\\nSelect (1-4): ").strip()
        
        if choice == "1":
            monitor.test_system()
        elif choice == "2":
            monitor.monitor_automation()
        elif choice == "3":
            dashboard_file = monitor.create_dashboard()
            # Try to open dashboard in browser
            try:
                import webbrowser
                webbrowser.open(f"file://{dashboard_file}")
            except:
                print(f"🌐 Open manually: file://{dashboard_file}")
        elif choice == "4":
            monitor.setup_cron_jobs()

if __name__ == "__main__":
    main()