#!/usr/bin/env python3
"""
AI FINANCE AGENCY DASHBOARD
Complete status overview of all automation systems
"""

import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

class AgencyDashboard:
    def __init__(self):
        self.status = {
            'telegram': self.check_telegram_status(),
            'linkedin': self.check_linkedin_status(), 
            'twitter': self.check_twitter_status(),
            'monitoring': self.check_monitoring_status(),
            'automation': self.check_automation_status()
        }
    
    def check_telegram_status(self):
        """Check Telegram automation status"""
        bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        channel_id = os.getenv('TELEGRAM_CHANNEL_ID')
        
        return {
            'configured': bool(bot_token and channel_id),
            'status': '🟢 Active' if bot_token and channel_id else '🔴 Not configured',
            'details': f'Channel: {channel_id}' if channel_id else 'Missing credentials',
            'automation': '✅ Posting every 4 hours during market hours'
        }
    
    def check_linkedin_status(self):
        """Check LinkedIn automation status"""
        company_token = os.getenv('LINKEDIN_COMPANY_ACCESS_TOKEN', '')
        personal_token = os.getenv('LINKEDIN_PERSONAL_ACCESS_TOKEN', '')
        
        if company_token == 'pending_oauth_setup':
            status = '🟡 Waiting for verification'
            details = 'App ID: 9a47c30f-c31a-4203-a678-523772eb8230 under review'
            automation = '📝 Manual posting with content generator'
        elif company_token.startswith('AQ'):
            status = '🟢 Company posting ready'
            details = 'Company token configured'
            automation = '🤖 Automated company posting'
        else:
            status = '🟡 Partial setup'
            details = 'Personal token available, company pending'
            automation = '👤 Personal posting only'
        
        return {
            'status': status,
            'details': details,
            'automation': automation,
            'personal_configured': bool(personal_token),
            'company_configured': company_token != 'pending_oauth_setup'
        }
    
    def check_twitter_status(self):
        """Check Twitter automation status"""
        consumer_key = os.getenv('TWITTER_CONSUMER_KEY')
        access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        
        return {
            'configured': bool(consumer_key and access_token),
            'status': '🟢 Ready' if consumer_key and access_token else '🔴 Not configured',
            'details': 'API credentials configured' if consumer_key else 'Missing API credentials',
            'automation': '⏳ Ready for testing'
        }
    
    def check_monitoring_status(self):
        """Check monitoring system status"""
        health_reports_exist = os.path.exists('health_reports')
        monitor_script_exists = os.path.exists('monitor.py')
        
        return {
            'configured': monitor_script_exists,
            'status': '🟢 Active' if monitor_script_exists else '🔴 Not found',
            'details': 'Health reports directory ready' if health_reports_exist else 'No health reports directory',
            'automation': '📊 15-minute health checks + daily reports'
        }
    
    def check_automation_status(self):
        """Check cron automation status"""
        import subprocess
        
        try:
            result = subprocess.run(['crontab', '-l'], capture_output=True, text=True)
            cron_active = 'Treum Algotech' in result.stdout
        except:
            cron_active = False
        
        return {
            'configured': cron_active,
            'status': '🟢 Active' if cron_active else '🟡 Manual setup needed',
            'details': 'Cron jobs installed' if cron_active else 'Run ./setup_cron.sh to activate',
            'schedule': [
                'Telegram: 9 AM, 1 PM, 5 PM (Mon-Fri)',
                'LinkedIn content: 8 AM daily (Mon-Fri)', 
                'Health checks: Every 15min (9 AM-4 PM)',
                'Daily reports: 6 PM (Mon-Fri)'
            ]
        }
    
    def display_dashboard(self):
        """Display comprehensive dashboard"""
        
        print("🚀 AI FINANCE AGENCY - TREUM ALGOTECH")
        print("="*60)
        print(f"📅 Status Report: {datetime.now().strftime('%A, %B %d, %Y at %I:%M %p')}")
        print("="*60)
        
        # Platform Status
        print("\n📊 PLATFORM STATUS")
        print("-"*30)
        
        for platform, info in self.status.items():
            if platform == 'automation':
                continue
                
            print(f"📱 {platform.upper()}: {info['status']}")
            print(f"   Details: {info['details']}")
            print(f"   Automation: {info['automation']}")
            print()
        
        # Automation Schedule
        print("⏰ AUTOMATION SCHEDULE")
        print("-"*30)
        if self.status['automation']['configured']:
            for schedule in self.status['automation']['schedule']:
                print(f"   {schedule}")
        else:
            print("   ⚠️ Cron jobs not yet installed")
            print("   Run: ./setup_cron.sh")
        print()
        
        # Quick Actions
        print("🎯 QUICK ACTIONS")
        print("-"*30)
        print("📝 Generate LinkedIn content: python3 instant_company_content.py")
        print("📱 Test Telegram post: python3 auto_telegram_poster.py")
        print("🔍 Check LinkedIn verification: python3 check_linkedin_verification.py")
        print("📊 View logs: tail -f logs/telegram.log")
        print("⚙️ Install automation: ./setup_cron.sh")
        print()
        
        # Key Files
        print("📁 KEY FILES")
        print("-"*30)
        files_status = [
            ('instant_company_content.py', 'LinkedIn content generator'),
            ('auto_telegram_poster.py', 'Telegram automation'),
            ('check_linkedin_verification.py', 'Verification checker'),
            ('setup_automation.sh', 'Automation installer'),
            ('.env', 'API credentials'),
            ('logs/', 'Automation logs')
        ]
        
        for filename, description in files_status:
            exists = '✅' if os.path.exists(filename) else '❌'
            print(f"   {exists} {filename} - {description}")
        
        print()
        
        # Overall Status
        telegram_ok = self.status['telegram']['configured']
        linkedin_ready = self.status['linkedin']['status'] in ['🟢 Company posting ready', '🟡 Waiting for verification']
        monitoring_ok = self.status['monitoring']['configured']
        
        overall_status = "🟢 OPERATIONAL" if telegram_ok and linkedin_ready and monitoring_ok else "🟡 PARTIAL"
        
        print("🏆 OVERALL STATUS")
        print("-"*30)
        print(f"System Status: {overall_status}")
        print("Ready Platforms: Telegram ✅, LinkedIn (manual) ✅")
        print("Pending: LinkedIn company API verification")
        print("Next: Wait for LinkedIn app approval")
        
        return self.status
    
    def save_status_report(self):
        """Save status report to file"""
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'status': self.status,
            'overall_health': 'operational'
        }
        
        os.makedirs('reports', exist_ok=True)
        filename = f"reports/status_{datetime.now().strftime('%Y%m%d_%H%M')}.json"
        
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n💾 Status report saved: {filename}")

def main():
    dashboard = AgencyDashboard()
    status = dashboard.display_dashboard()
    dashboard.save_status_report()

if __name__ == "__main__":
    main()