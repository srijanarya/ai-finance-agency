#!/usr/bin/env python3
"""
24/7 Production Setup for AI Finance Agency
Ensures maximum uptime, auto-restart, monitoring, and failover
"""

import os
import subprocess
import time
import psutil
import logging
import json
import requests
from datetime import datetime
import schedule
import threading

class Production24x7Manager:
    """Manage 24/7 production operations"""
    
    def __init__(self):
        self.setup_logging()
        self.critical_processes = {
            'n8n_webhook_endpoint.py': {
                'command': 'python3 n8n_webhook_endpoint.py',
                'port': 5001,
                'restart_count': 0,
                'last_restart': None
            },
            'multi_agent_orchestrator.py': {
                'command': 'echo "3" | python3 multi_agent_orchestrator.py',
                'restart_count': 0,
                'last_restart': None
            },
            'automated_scheduler.py': {
                'command': 'python3 automated_scheduler.py',
                'restart_count': 0,
                'last_restart': None
            }
        }
        
    def setup_logging(self):
        """Setup comprehensive logging"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('production_24x7.log'),
                logging.FileHandler(f'logs/{datetime.now().strftime("%Y%m%d")}_system.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def check_process_health(self):
        """Check health of all critical processes"""
        health_status = {
            'timestamp': datetime.now().isoformat(),
            'all_healthy': True,
            'processes': {}
        }
        
        for process_name, config in self.critical_processes.items():
            is_running = self.is_process_running(process_name)
            
            health_status['processes'][process_name] = {
                'running': is_running,
                'restart_count': config['restart_count'],
                'last_restart': config['last_restart']
            }
            
            if not is_running:
                health_status['all_healthy'] = False
                self.restart_process(process_name, config)
        
        return health_status
    
    def is_process_running(self, process_name):
        """Check if a specific process is running"""
        try:
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                cmdline = ' '.join(proc.info['cmdline']) if proc.info['cmdline'] else ''
                if process_name in cmdline:
                    return True
        except Exception as e:
            self.logger.error(f"Error checking process {process_name}: {e}")
        return False
    
    def restart_process(self, process_name, config):
        """Restart a failed process"""
        self.logger.warning(f"🔄 Restarting {process_name}...")
        
        try:
            # Kill existing process
            subprocess.run(f"pkill -f '{process_name}'", shell=True)
            time.sleep(2)
            
            # Start new process
            if process_name == 'multi_agent_orchestrator.py':
                # Special handling for orchestrator
                proc = subprocess.Popen(
                    'echo "3" | python3 multi_agent_orchestrator.py',
                    shell=True,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
            else:
                proc = subprocess.Popen(
                    config['command'],
                    shell=True,
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
            
            config['restart_count'] += 1
            config['last_restart'] = datetime.now().isoformat()
            
            self.logger.info(f"✅ {process_name} restarted (attempt #{config['restart_count']})")
            
            # Wait and verify restart
            time.sleep(5)
            if self.is_process_running(process_name):
                self.logger.info(f"✅ {process_name} verified running")
            else:
                self.logger.error(f"❌ {process_name} failed to start")
                
        except Exception as e:
            self.logger.error(f"❌ Failed to restart {process_name}: {e}")
    
    def check_system_resources(self):
        """Monitor system resources"""
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        resource_status = {
            'cpu_percent': cpu_percent,
            'memory_percent': memory.percent,
            'disk_percent': disk.percent,
            'memory_available_gb': memory.available / (1024**3),
            'disk_free_gb': disk.free / (1024**3)
        }
        
        # Alert on high resource usage
        if cpu_percent > 80:
            self.logger.warning(f"⚠️ High CPU usage: {cpu_percent}%")
        
        if memory.percent > 85:
            self.logger.warning(f"⚠️ High memory usage: {memory.percent}%")
        
        if disk.percent > 90:
            self.logger.warning(f"⚠️ Low disk space: {disk.percent}% used")
        
        return resource_status
    
    def check_api_health(self):
        """Check API endpoint health"""
        try:
            response = requests.get(
                'http://localhost:5001/webhook/n8n/health',
                timeout=5
            )
            
            if response.status_code == 200:
                return {
                    'api_healthy': True,
                    'response_time': response.elapsed.total_seconds(),
                    'status_code': response.status_code
                }
            else:
                return {
                    'api_healthy': False,
                    'status_code': response.status_code,
                    'error': 'Non-200 response'
                }
                
        except Exception as e:
            self.logger.error(f"API health check failed: {e}")
            return {
                'api_healthy': False,
                'error': str(e)
            }
    
    def generate_health_report(self):
        """Generate comprehensive health report"""
        process_health = self.check_process_health()
        resource_status = self.check_system_resources()
        api_status = self.check_api_health()
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'system_uptime': self.get_system_uptime(),
            'overall_status': 'HEALTHY' if process_health['all_healthy'] and api_status.get('api_healthy', False) else 'DEGRADED',
            'processes': process_health,
            'resources': resource_status,
            'api': api_status,
            'recommendations': self.get_recommendations(resource_status, process_health)
        }
        
        return report
    
    def get_system_uptime(self):
        """Get system uptime"""
        try:
            with open('/proc/uptime', 'r') as f:
                uptime_seconds = float(f.readline().split()[0])
                uptime_days = uptime_seconds / 86400
                return f"{uptime_days:.1f} days"
        except:
            # Fallback for macOS
            uptime_output = subprocess.check_output(['uptime']).decode().strip()
            return uptime_output
    
    def get_recommendations(self, resources, processes):
        """Get system recommendations"""
        recommendations = []
        
        if resources['cpu_percent'] > 70:
            recommendations.append("Consider scaling to multiple servers")
        
        if resources['memory_percent'] > 80:
            recommendations.append("Monitor memory leaks, consider server upgrade")
        
        if resources['disk_free_gb'] < 5:
            recommendations.append("Clean up old logs and data files")
        
        total_restarts = sum(p['restart_count'] for p in processes['processes'].values())
        if total_restarts > 10:
            recommendations.append("Investigate frequent process crashes")
        
        if not recommendations:
            recommendations.append("System running optimally")
        
        return recommendations
    
    def setup_monitoring_schedule(self):
        """Setup monitoring schedule"""
        # Health check every 5 minutes
        schedule.every(5).minutes.do(self.routine_health_check)
        
        # Resource check every 15 minutes  
        schedule.every(15).minutes.do(self.detailed_system_check)
        
        # Daily report
        schedule.every().day.at("08:00").do(self.daily_health_report)
        
        # Weekly cleanup
        schedule.every().sunday.at("02:00").do(self.weekly_maintenance)
    
    def routine_health_check(self):
        """Routine 5-minute health check"""
        health = self.check_process_health()
        if not health['all_healthy']:
            self.logger.warning("⚠️ System health degraded - processes restarted")
    
    def detailed_system_check(self):
        """Detailed 15-minute system check"""
        report = self.generate_health_report()
        
        if report['overall_status'] == 'DEGRADED':
            self.logger.warning(f"⚠️ System degraded: {report}")
        else:
            self.logger.info("✅ System healthy - all services operational")
        
        # Save report
        with open(f"health_reports/{datetime.now().strftime('%Y%m%d_%H%M')}.json", 'w') as f:
            json.dump(report, f, indent=2)
    
    def daily_health_report(self):
        """Generate daily health report"""
        report = self.generate_health_report()
        
        # Calculate daily stats
        daily_stats = {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'total_content_generated': self.get_daily_content_count(),
            'total_restarts': sum(p['restart_count'] for p in report['processes']['processes'].values()),
            'avg_cpu': report['resources']['cpu_percent'],
            'avg_memory': report['resources']['memory_percent'],
            'uptime_status': report['overall_status']
        }
        
        self.logger.info(f"📊 Daily Report: {daily_stats}")
        
        # Save daily report
        with open(f"daily_reports/{datetime.now().strftime('%Y%m%d')}_daily.json", 'w') as f:
            json.dump(daily_stats, f, indent=2)
    
    def get_daily_content_count(self):
        """Get daily content generation count"""
        try:
            response = requests.get('http://localhost:5001/webhook/n8n/metrics')
            if response.status_code == 200:
                data = response.json()
                return data.get('metrics', {}).get('content_generated_24h', 0)
        except:
            pass
        return 0
    
    def weekly_maintenance(self):
        """Weekly maintenance tasks"""
        self.logger.info("🧹 Starting weekly maintenance...")
        
        # Clean old logs (keep 30 days)
        subprocess.run("find logs/ -name '*.log' -mtime +30 -delete", shell=True)
        subprocess.run("find health_reports/ -name '*.json' -mtime +30 -delete", shell=True)
        
        # Restart all processes for fresh start
        for process_name, config in self.critical_processes.items():
            self.restart_process(process_name, config)
        
        self.logger.info("✅ Weekly maintenance complete")
    
    def start_24x7_monitoring(self):
        """Start 24/7 monitoring"""
        self.logger.info("🚀 Starting 24/7 Production Monitoring...")
        
        # Create directories
        os.makedirs('logs', exist_ok=True)
        os.makedirs('health_reports', exist_ok=True)
        os.makedirs('daily_reports', exist_ok=True)
        
        # Setup schedule
        self.setup_monitoring_schedule()
        
        # Initial health check
        report = self.generate_health_report()
        self.logger.info(f"📊 Initial Health Check: {report['overall_status']}")
        
        # Start monitoring loop
        while True:
            try:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
                
            except KeyboardInterrupt:
                self.logger.info("⏹️ Monitoring stopped by user")
                break
            except Exception as e:
                self.logger.error(f"❌ Monitoring error: {e}")
                time.sleep(300)  # Wait 5 minutes on error

def check_24x7_readiness():
    """Check if system is ready for 24/7 operation"""
    print("🔍 24/7 READINESS CHECK")
    print("=" * 50)
    
    manager = Production24x7Manager()
    report = manager.generate_health_report()
    
    print(f"📊 Overall Status: {report['overall_status']}")
    print(f"🔄 System Uptime: {report['system_uptime']}")
    print(f"💻 CPU Usage: {report['resources']['cpu_percent']:.1f}%")
    print(f"💾 Memory Usage: {report['resources']['memory_percent']:.1f}%")
    print(f"💿 Disk Usage: {report['resources']['disk_percent']:.1f}%")
    
    print("\n🔧 Process Status:")
    for name, status in report['processes']['processes'].items():
        status_icon = "✅" if status['running'] else "❌"
        print(f"   {status_icon} {name}: {'Running' if status['running'] else 'Down'}")
    
    print(f"\n🌐 API Status: {'✅ Healthy' if report['api']['api_healthy'] else '❌ Down'}")
    
    print("\n💡 Recommendations:")
    for rec in report['recommendations']:
        print(f"   • {rec}")
    
    # 24/7 Readiness Score
    score = 0
    if report['overall_status'] == 'HEALTHY': score += 40
    if report['resources']['cpu_percent'] < 70: score += 20
    if report['resources']['memory_percent'] < 80: score += 20
    if report['api']['api_healthy']: score += 20
    
    print(f"\n🎯 24/7 Readiness Score: {score}/100")
    
    if score >= 80:
        print("✅ SYSTEM READY FOR 24/7 OPERATION!")
    elif score >= 60:
        print("⚠️ System mostly ready - address recommendations")
    else:
        print("❌ System needs fixes before 24/7 operation")
    
    return report

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "check":
            check_24x7_readiness()
        elif sys.argv[1] == "start":
            manager = Production24x7Manager()
            manager.start_24x7_monitoring()
    else:
        check_24x7_readiness()