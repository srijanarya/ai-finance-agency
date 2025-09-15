#!/usr/bin/env python3
"""
Error Notification System
Configurable notifications via email, Slack, and system alerts
"""

import os
import json
import smtplib
import subprocess
from datetime import datetime
from dotenv import load_dotenv
import requests
import sqlite3

# Import email modules with fallback
try:
    from email.mime.text import MimeText
    from email.mime.multipart import MimeMultipart
except ImportError:
    # Fallback for newer Python versions
    from email.message import EmailMessage
    MimeText = None
    MimeMultipart = None

# Load environment variables
load_dotenv()

class ErrorNotificationSystem:
    def __init__(self):
        # Notification channels
        self.email_config = {
            'enabled': True,
            'smtp_server': os.getenv('SMTP_SERVER', 'smtp.gmail.com'),
            'smtp_port': int(os.getenv('SMTP_PORT', '587')),
            'username': os.getenv('NOTIFICATION_EMAIL', 'srijanaryay@gmail.com'),
            'password': os.getenv('EMAIL_APP_PASSWORD'),  # App password for Gmail
            'to_email': os.getenv('ALERT_EMAIL', 'srijanaryay@gmail.com')
        }
        
        self.slack_config = {
            'enabled': bool(os.getenv('SLACK_WEBHOOK_URL')),
            'webhook_url': os.getenv('SLACK_WEBHOOK_URL'),
            'channel': os.getenv('SLACK_CHANNEL', '#ai-finance-alerts'),
            'username': 'AI Finance Bot'
        }
        
        self.system_config = {
            'enabled': True,  # Always enable system notifications
            'use_say_command': True,  # For macOS voice alerts
            'use_osascript': True     # For macOS system notifications
        }
        
        # Alert levels and their configurations
        self.alert_levels = {
            'critical': {
                'priority': 1,
                'color': '#FF0000',
                'emoji': '🚨',
                'sound': 'Basso',
                'voice_alert': True
            },
            'error': {
                'priority': 2,
                'color': '#FF6B35',
                'emoji': '❌',
                'sound': 'Sosumi',
                'voice_alert': False
            },
            'warning': {
                'priority': 3,
                'color': '#FFA500',
                'emoji': '⚠️',
                'sound': 'Ping',
                'voice_alert': False
            },
            'info': {
                'priority': 4,
                'color': '#36A2EB',
                'emoji': 'ℹ️',
                'sound': 'Glass',
                'voice_alert': False
            }
        }
        
        # Database for tracking notifications
        self.db_path = 'data/notifications.db'
        self.init_notification_db()
    
    def init_notification_db(self):
        """Initialize notifications database"""
        os.makedirs('data', exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                level TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                component TEXT,
                channels_sent TEXT,
                acknowledged BOOLEAN DEFAULT FALSE,
                resolved BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def send_email_notification(self, level, title, message, component=None):
        """Send email notification"""
        if not self.email_config['enabled'] or not self.email_config['password']:
            return {'success': False, 'reason': 'Email not configured'}
        
        try:
            alert_config = self.alert_levels[level]
            
            # Email body
            body = f"""
{alert_config['emoji']} AI FINANCE AGENCY ALERT

Alert Level: {level.upper()}
Component: {component or 'System'}
Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Title: {title}

Details:
{message}

---
This is an automated alert from your AI Finance Agency social media automation system.
Please check your system status and take appropriate action if required.

System Dashboard: http://localhost:3000/dashboard
Health Check: python3 platform_health_checker.py
            """
            
            # Create message based on available modules
            if MimeMultipart and MimeText:
                # Traditional method
                msg = MimeMultipart()
                msg['From'] = self.email_config['username']
                msg['To'] = self.email_config['to_email']
                msg['Subject'] = f"[{level.upper()}] AI Finance Agency Alert: {title}"
                msg.attach(MimeText(body, 'plain'))
                text = msg.as_string()
            else:
                # Modern EmailMessage method
                msg = EmailMessage()
                msg['From'] = self.email_config['username']
                msg['To'] = self.email_config['to_email']
                msg['Subject'] = f"[{level.upper()}] AI Finance Agency Alert: {title}"
                msg.set_content(body)
                text = str(msg)
            
            # Connect to server and send
            server = smtplib.SMTP(self.email_config['smtp_server'], self.email_config['smtp_port'])
            server.starttls()
            server.login(self.email_config['username'], self.email_config['password'])
            server.sendmail(self.email_config['username'], self.email_config['to_email'], text)
            server.quit()
            
            return {'success': True, 'sent_to': self.email_config['to_email']}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def send_slack_notification(self, level, title, message, component=None):
        """Send Slack notification"""
        if not self.slack_config['enabled']:
            return {'success': False, 'reason': 'Slack not configured'}
        
        try:
            alert_config = self.alert_levels[level]
            
            # Format Slack message
            slack_data = {
                'channel': self.slack_config['channel'],
                'username': self.slack_config['username'],
                'icon_emoji': ':robot_face:',
                'attachments': [
                    {
                        'color': alert_config['color'],
                        'title': f"{alert_config['emoji']} {title}",
                        'text': message,
                        'fields': [
                            {
                                'title': 'Alert Level',
                                'value': level.upper(),
                                'short': True
                            },
                            {
                                'title': 'Component',
                                'value': component or 'System',
                                'short': True
                            },
                            {
                                'title': 'Time',
                                'value': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                                'short': True
                            }
                        ],
                        'footer': 'AI Finance Agency',
                        'footer_icon': 'https://platform.slack-edge.com/img/default_application_icon.png',
                        'ts': int(datetime.now().timestamp())
                    }
                ]
            }
            
            response = requests.post(
                self.slack_config['webhook_url'],
                json=slack_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                return {'success': True, 'sent_to': self.slack_config['channel']}
            else:
                return {'success': False, 'error': f'HTTP {response.status_code}'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def send_system_notification(self, level, title, message, component=None):
        """Send system notification (macOS)"""
        if not self.system_config['enabled']:
            return {'success': False, 'reason': 'System notifications disabled'}
        
        try:
            alert_config = self.alert_levels[level]
            results = []
            
            # macOS notification
            if self.system_config['use_osascript']:
                script = f'''
                display notification "{message}" with title "AI Finance Agency - {title}" subtitle "{level.upper()} Alert" sound name "{alert_config['sound']}"
                '''
                
                try:
                    subprocess.run(['osascript', '-e', script], check=True, capture_output=True)
                    results.append('osascript_notification')
                except subprocess.CalledProcessError:
                    pass
            
            # Voice alert for critical issues
            if self.system_config['use_say_command'] and alert_config['voice_alert']:
                voice_message = f"Critical alert in AI Finance Agency. {title}. Please check immediately."
                
                try:
                    subprocess.run(['say', voice_message], check=True, capture_output=True)
                    results.append('voice_alert')
                except subprocess.CalledProcessError:
                    pass
            
            return {'success': True, 'methods': results}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def log_notification(self, level, title, message, component, channels_sent):
        """Log notification to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO notifications (timestamp, level, title, message, component, channels_sent)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                datetime.now().isoformat(),
                level,
                title,
                message,
                component,
                json.dumps(channels_sent)
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"Failed to log notification: {e}")
    
    def send_alert(self, level, title, message, component=None, channels=None):
        """Send alert through configured channels"""
        if level not in self.alert_levels:
            raise ValueError(f"Invalid alert level: {level}")
        
        if channels is None:
            channels = ['email', 'slack', 'system']
        
        results = {
            'level': level,
            'title': title,
            'message': message,
            'component': component,
            'timestamp': datetime.now().isoformat(),
            'channels': {}
        }
        
        # Send through each requested channel
        if 'email' in channels:
            results['channels']['email'] = self.send_email_notification(level, title, message, component)
        
        if 'slack' in channels:
            results['channels']['slack'] = self.send_slack_notification(level, title, message, component)
        
        if 'system' in channels:
            results['channels']['system'] = self.send_system_notification(level, title, message, component)
        
        # Log notification
        self.log_notification(level, title, message, component, results['channels'])
        
        return results
    
    def get_recent_notifications(self, limit=20):
        """Get recent notifications from database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT timestamp, level, title, message, component, channels_sent, acknowledged, resolved
                FROM notifications 
                ORDER BY created_at DESC 
                LIMIT ?
            ''', (limit,))
            
            notifications = []
            for row in cursor.fetchall():
                notifications.append({
                    'timestamp': row[0],
                    'level': row[1],
                    'title': row[2],
                    'message': row[3],
                    'component': row[4],
                    'channels_sent': json.loads(row[5]) if row[5] else {},
                    'acknowledged': bool(row[6]),
                    'resolved': bool(row[7])
                })
            
            conn.close()
            return notifications
            
        except Exception as e:
            return {'error': str(e)}
    
    def test_all_channels(self):
        """Test all notification channels"""
        print("🧪 TESTING ERROR NOTIFICATION CHANNELS")
        print("=" * 60)
        
        test_results = {}
        
        for level in ['info', 'warning', 'error', 'critical']:
            print(f"\\n📤 Testing {level.upper()} level notifications...")
            
            result = self.send_alert(
                level=level,
                title=f"Test {level.capitalize()} Alert",
                message=f"This is a test {level} notification from the AI Finance Agency error notification system. All systems are functioning normally.",
                component="notification_system",
                channels=['system']  # Only test system notifications to avoid spam
            )
            
            test_results[level] = result
            
            # Show results
            for channel, channel_result in result['channels'].items():
                if channel_result['success']:
                    print(f"  ✅ {channel.capitalize()}: Success")
                else:
                    print(f"  ❌ {channel.capitalize()}: {channel_result.get('reason', channel_result.get('error'))}")
        
        return test_results
    
    def configure_channels(self):
        """Interactive configuration of notification channels"""
        print("⚙️ NOTIFICATION CHANNEL CONFIGURATION")
        print("=" * 50)
        
        # Email configuration
        print("\\n📧 EMAIL CONFIGURATION:")
        print(f"Current email: {self.email_config['username']}")
        print(f"Alert email: {self.email_config['to_email']}")
        print(f"Configured: {'✅' if self.email_config['password'] else '❌'}")
        
        if not self.email_config['password']:
            print("\\nTo enable email notifications:")
            print("1. Go to your Gmail account settings")
            print("2. Enable 2-factor authentication")
            print("3. Generate an App Password")
            print("4. Add to .env file: EMAIL_APP_PASSWORD=your_app_password")
        
        # Slack configuration
        print("\\n💬 SLACK CONFIGURATION:")
        print(f"Configured: {'✅' if self.slack_config['enabled'] else '❌'}")
        print(f"Channel: {self.slack_config['channel']}")
        
        if not self.slack_config['enabled']:
            print("\\nTo enable Slack notifications:")
            print("1. Create a Slack app at https://api.slack.com/apps")
            print("2. Enable Incoming Webhooks")
            print("3. Create a webhook for your channel")
            print("4. Add to .env file: SLACK_WEBHOOK_URL=your_webhook_url")
        
        # System configuration
        print("\\n🖥️ SYSTEM CONFIGURATION:")
        print(f"System notifications: ✅ Enabled")
        print(f"Voice alerts: {'✅' if self.system_config['use_say_command'] else '❌'}")
        
        print("\\n🧪 Run test: python3 error_notification_system.py --test")

def monitor_system_errors():
    """Monitor system for errors and send alerts"""
    notifier = ErrorNotificationSystem()
    
    # Check recent posting failures
    try:
        conn = sqlite3.connect('data/automated_posts.db')
        cursor = conn.cursor()
        
        # Check for failures in last hour
        cursor.execute('''
            SELECT COUNT(*) FROM posts 
            WHERE posted_at > datetime('now', '-1 hour')
            AND status != 'success'
        ''')
        
        recent_failures = cursor.fetchone()[0]
        
        if recent_failures > 2:
            notifier.send_alert(
                level='error',
                title=f"{recent_failures} Posting Failures Detected",
                message=f"Multiple posting failures detected in the last hour. Please check platform health and API credentials.",
                component="automated_posting"
            )
        
        conn.close()
        
    except Exception as e:
        notifier.send_alert(
            level='critical',
            title="Database Connection Error",
            message=f"Could not connect to posts database: {e}",
            component="database"
        )

def main():
    """Main execution"""
    notifier = ErrorNotificationSystem()
    
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == '--test':
            notifier.test_all_channels()
        elif sys.argv[1] == '--monitor':
            monitor_system_errors()
        elif sys.argv[1] == '--config':
            notifier.configure_channels()
        else:
            print("Usage: python3 error_notification_system.py [--test|--monitor|--config]")
    else:
        # Interactive mode
        print("🚨 AI Finance Agency - Error Notification System")
        print("=" * 60)
        
        print("Select operation:")
        print("1. Test all notification channels")
        print("2. Configure notification channels")
        print("3. View recent notifications")
        print("4. Send test alert")
        print("5. Monitor system errors")
        
        try:
            choice = input("\\nEnter choice (1-5): ").strip()
            
            if choice == '1':
                notifier.test_all_channels()
            elif choice == '2':
                notifier.configure_channels()
            elif choice == '3':
                notifications = notifier.get_recent_notifications(10)
                if 'error' in notifications:
                    print(f"Error: {notifications['error']}")
                else:
                    print(f"\\n📋 Recent Notifications ({len(notifications)}):")
                    for notif in notifications:
                        print(f"  {notif['timestamp'][:19]} [{notif['level'].upper()}] {notif['title']}")
            elif choice == '4':
                level = input("Alert level (info/warning/error/critical): ").strip().lower()
                title = input("Alert title: ").strip()
                message = input("Alert message: ").strip()
                
                if level in notifier.alert_levels:
                    result = notifier.send_alert(level, title, message, "manual_test")
                    print(f"\\nAlert sent: {result}")
                else:
                    print("Invalid alert level")
            elif choice == '5':
                monitor_system_errors()
            else:
                print("Invalid choice")
                
        except KeyboardInterrupt:
            print("\\n\\nOperation cancelled by user")

if __name__ == "__main__":
    main()