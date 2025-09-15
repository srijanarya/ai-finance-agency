#!/usr/bin/env python3
"""
Automated Monitoring Script
Continuously monitors the AI Finance Agency system and sends alerts
"""

import time
import subprocess
from datetime import datetime, timedelta
from error_notification_system import ErrorNotificationSystem
from platform_health_checker import PlatformHealthChecker
import sqlite3
import json
import os

class AutomatedMonitor:
    def __init__(self):
        self.notifier = ErrorNotificationSystem()
        self.health_checker = PlatformHealthChecker()
        
        # Monitoring intervals (seconds)
        self.intervals = {
            'health_check': 300,     # 5 minutes
            'posting_check': 600,    # 10 minutes  
            'error_scan': 180,       # 3 minutes
            'api_limits': 3600       # 1 hour
        }
        
        # Last check timestamps
        self.last_checks = {
            'health_check': datetime.min,
            'posting_check': datetime.min,
            'error_scan': datetime.min,
            'api_limits': datetime.min
        }
        
        # Alert thresholds
        self.thresholds = {
            'max_failures_per_hour': 5,
            'max_consecutive_failures': 3,
            'min_success_rate_24h': 85.0,
            'max_response_time_ms': 10000
        }
        
        # State tracking
        self.consecutive_failures = 0
        self.last_alert_time = {}
        self.alert_cooldown = 3600  # 1 hour cooldown for same alert type
    
    def should_run_check(self, check_type):
        """Check if enough time has passed to run a specific check"""
        now = datetime.now()
        last_check = self.last_checks[check_type]
        interval = self.intervals[check_type]
        
        return (now - last_check).total_seconds() >= interval
    
    def update_check_time(self, check_type):
        """Update the last check time for a check type"""
        self.last_checks[check_type] = datetime.now()
    
    def can_send_alert(self, alert_key):
        """Check if we can send an alert (respects cooldown)"""
        now = datetime.now()
        last_alert = self.last_alert_time.get(alert_key, datetime.min)
        
        return (now - last_alert).total_seconds() >= self.alert_cooldown
    
    def mark_alert_sent(self, alert_key):
        """Mark that an alert was sent"""
        self.last_alert_time[alert_key] = datetime.now()
    
    def check_platform_health(self):
        """Check all platform health status"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Checking platform health...")
        
        try:
            # Run health checks
            telegram_health = self.health_checker.check_telegram_health()
            twitter_health = self.health_checker.check_twitter_health()
            linkedin_health = self.health_checker.check_linkedin_health()
            database_health = self.health_checker.check_database_health()
            
            platforms = {
                'telegram': telegram_health,
                'twitter': twitter_health,
                'linkedin': linkedin_health,
                'database': database_health
            }
            
            # Check for critical issues
            critical_platforms = []
            warning_platforms = []
            
            for platform, health_data in platforms.items():
                status = health_data['status']
                
                if status in ['error', 'critical', 'unauthorized']:
                    critical_platforms.append(platform)
                elif status in ['warning', 'rate_limited', 'timeout']:
                    warning_platforms.append(platform)
                
                # Check response times
                response_time = health_data.get('response_time_ms', 0)
                if response_time > self.thresholds['max_response_time_ms']:
                    warning_platforms.append(f"{platform}_slow")
            
            # Send alerts if needed
            if critical_platforms and self.can_send_alert('platform_critical'):
                self.notifier.send_alert(
                    level='critical',
                    title=f"Platform Failures Detected",
                    message=f"Critical issues detected with: {', '.join(critical_platforms)}. Immediate attention required.",
                    component="platform_health"
                )
                self.mark_alert_sent('platform_critical')
            
            elif warning_platforms and self.can_send_alert('platform_warning'):
                self.notifier.send_alert(
                    level='warning',
                    title=f"Platform Warnings",
                    message=f"Performance issues detected with: {', '.join(warning_platforms)}. Monitor closely.",
                    component="platform_health"
                )
                self.mark_alert_sent('platform_warning')
            
            # Reset consecutive failures if all healthy
            if not critical_platforms and not warning_platforms:
                self.consecutive_failures = 0
                print("  ✅ All platforms healthy")
            else:
                print(f"  ⚠️ Issues: {len(critical_platforms)} critical, {len(warning_platforms)} warnings")
            
        except Exception as e:
            print(f"  ❌ Health check failed: {e}")
            self.notifier.send_alert(
                level='error',
                title="Health Check System Error",
                message=f"Unable to perform platform health check: {e}",
                component="monitoring"
            )
    
    def check_recent_posts(self):
        """Check for recent posting failures"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Checking recent posts...")
        
        try:
            conn = sqlite3.connect('data/automated_posts.db')
            cursor = conn.cursor()
            
            # Check failures in last hour
            cursor.execute('''
                SELECT COUNT(*) FROM posts 
                WHERE posted_at > datetime('now', '-1 hour')
                AND status != 'success'
            ''')
            recent_failures = cursor.fetchone()[0]
            
            # Check 24h success rate
            cursor.execute('''
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful
                FROM posts 
                WHERE posted_at > datetime('now', '-24 hours')
            ''')
            
            result = cursor.fetchone()
            total_24h = result[0] if result else 0
            successful_24h = result[1] if result else 0
            success_rate_24h = (successful_24h / total_24h * 100) if total_24h > 0 else 100
            
            conn.close()
            
            # Check for issues
            if recent_failures >= self.thresholds['max_failures_per_hour']:
                if self.can_send_alert('posting_failures'):
                    self.notifier.send_alert(
                        level='error',
                        title=f"High Posting Failure Rate",
                        message=f"{recent_failures} posting failures in the last hour. Check API credentials and rate limits.",
                        component="automated_posting"
                    )
                    self.mark_alert_sent('posting_failures')
            
            if success_rate_24h < self.thresholds['min_success_rate_24h']:
                if self.can_send_alert('low_success_rate'):
                    self.notifier.send_alert(
                        level='warning',
                        title=f"Low Success Rate",
                        message=f"24h success rate is {success_rate_24h:.1f}% (below {self.thresholds['min_success_rate_24h']}%). System needs attention.",
                        component="automated_posting"
                    )
                    self.mark_alert_sent('low_success_rate')
            
            print(f"  📊 Recent failures: {recent_failures}, 24h success rate: {success_rate_24h:.1f}%")
            
        except Exception as e:
            print(f"  ❌ Post check failed: {e}")
            self.notifier.send_alert(
                level='error',
                title="Database Check Error",
                message=f"Unable to check recent posts: {e}",
                component="monitoring"
            )
    
    def scan_for_errors(self):
        """Scan system logs for errors"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Scanning for system errors...")
        
        try:
            # Check if any background processes crashed
            error_indicators = []
            
            # Check backup cron log
            if os.path.exists('backup_cron.log'):
                with open('backup_cron.log', 'r') as f:
                    log_lines = f.readlines()[-20:]  # Last 20 lines
                    for line in log_lines:
                        if 'error' in line.lower() or 'failed' in line.lower():
                            error_indicators.append(f"Backup: {line.strip()}")
            
            # Check system resources
            try:
                # Check disk space
                disk_result = subprocess.run(['df', '-h', '.'], capture_output=True, text=True)
                if disk_result.returncode == 0:
                    lines = disk_result.stdout.strip().split('\\n')
                    if len(lines) > 1:
                        usage_line = lines[1]
                        usage_percent = usage_line.split()[4].replace('%', '')
                        if int(usage_percent) > 90:
                            error_indicators.append(f"High disk usage: {usage_percent}%")
            except:
                pass
            
            # Send alert if errors found
            if error_indicators and self.can_send_alert('system_errors'):
                self.notifier.send_alert(
                    level='warning',
                    title=f"System Errors Detected",
                    message=f"Found {len(error_indicators)} system issues:\\n" + "\\n".join(error_indicators),
                    component="system"
                )
                self.mark_alert_sent('system_errors')
                print(f"  ⚠️ Found {len(error_indicators)} system issues")
            else:
                print("  ✅ No system errors detected")
                
        except Exception as e:
            print(f"  ❌ Error scan failed: {e}")
    
    def check_api_limits(self):
        """Check API usage and limits"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Checking API limits...")
        
        try:
            # Run API limit monitor
            result = subprocess.run(['python3', 'api_rate_limit_monitor.py', '--json'], 
                                  capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                try:
                    # Parse JSON output if available
                    output_lines = result.stdout.strip().split('\\n')
                    json_line = next((line for line in output_lines if line.startswith('{')), None)
                    
                    if json_line:
                        api_data = json.loads(json_line)
                        
                        # Check for high usage
                        warnings = []
                        for platform, data in api_data.items():
                            if isinstance(data, dict) and 'usage_percent' in data:
                                usage = data['usage_percent']
                                if usage > 80:
                                    warnings.append(f"{platform}: {usage}%")
                        
                        if warnings and self.can_send_alert('api_limits'):
                            self.notifier.send_alert(
                                level='warning',
                                title="High API Usage",
                                message=f"API usage approaching limits: {', '.join(warnings)}",
                                component="api_limits"
                            )
                            self.mark_alert_sent('api_limits')
                            print(f"  ⚠️ High API usage: {', '.join(warnings)}")
                        else:
                            print("  ✅ API usage normal")
                    else:
                        print("  📊 API limits checked (no JSON output)")
                except json.JSONDecodeError:
                    print("  📊 API limits checked (manual review needed)")
            else:
                print(f"  ⚠️ API limit check returned error code: {result.returncode}")
                
        except subprocess.TimeoutExpired:
            print("  ⚠️ API limit check timed out")
        except Exception as e:
            print(f"  ❌ API limit check failed: {e}")
    
    def run_monitoring_cycle(self):
        """Run one complete monitoring cycle"""
        cycle_start = datetime.now()
        
        # Run checks based on their intervals
        checks_run = []
        
        if self.should_run_check('health_check'):
            self.check_platform_health()
            self.update_check_time('health_check')
            checks_run.append('health')
        
        if self.should_run_check('posting_check'):
            self.check_recent_posts()
            self.update_check_time('posting_check')
            checks_run.append('posting')
        
        if self.should_run_check('error_scan'):
            self.scan_for_errors()
            self.update_check_time('error_scan')
            checks_run.append('errors')
        
        if self.should_run_check('api_limits'):
            self.check_api_limits()
            self.update_check_time('api_limits')
            checks_run.append('api')
        
        cycle_duration = (datetime.now() - cycle_start).total_seconds()
        
        if checks_run:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Cycle complete: {', '.join(checks_run)} ({cycle_duration:.1f}s)")
        
        return len(checks_run)
    
    def start_continuous_monitoring(self):
        """Start continuous monitoring"""
        print("🔍 AI FINANCE AGENCY - AUTOMATED MONITORING")
        print("=" * 60)
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("Monitoring intervals:")
        for check_type, interval in self.intervals.items():
            print(f"  {check_type}: {interval}s ({interval//60}min)")
        print("=" * 60)
        
        # Send startup notification
        self.notifier.send_alert(
            level='info',
            title="Monitoring System Started",
            message="AI Finance Agency automated monitoring system is now running.",
            component="monitoring"
        )
        
        cycle_count = 0
        
        try:
            while True:
                cycle_count += 1
                checks_run = self.run_monitoring_cycle()
                
                # Send periodic status if no checks run (system idle)
                if checks_run == 0 and cycle_count % 20 == 0:  # Every ~10 minutes when idle
                    print(f"[{datetime.now().strftime('%H:%M:%S')}] Monitoring active - no checks needed")
                
                # Sleep before next cycle
                time.sleep(30)  # Check every 30 seconds
                
        except KeyboardInterrupt:
            print(f"\\n[{datetime.now().strftime('%H:%M:%S')}] Monitoring stopped by user")
            
            # Send shutdown notification
            self.notifier.send_alert(
                level='info',
                title="Monitoring System Stopped", 
                message="AI Finance Agency automated monitoring system has been stopped.",
                component="monitoring"
            )
        
        except Exception as e:
            print(f"\\n[{datetime.now().strftime('%H:%M:%S')}] Monitoring error: {e}")
            
            # Send error notification
            self.notifier.send_alert(
                level='critical',
                title="Monitoring System Crashed",
                message=f"Automated monitoring system encountered a critical error: {e}",
                component="monitoring"
            )

def main():
    """Main execution"""
    monitor = AutomatedMonitor()
    
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--continuous':
        # Run continuous monitoring
        monitor.start_continuous_monitoring()
    else:
        # Run single monitoring cycle
        print("🔍 AI Finance Agency - Single Monitoring Check")
        print("=" * 50)
        checks_run = monitor.run_monitoring_cycle()
        print(f"✅ Monitoring check complete - {checks_run} checks performed")

if __name__ == "__main__":
    main()