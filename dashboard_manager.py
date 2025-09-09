#!/usr/bin/env python3
"""
Dashboard Manager - Centralized service management
Handles starting, stopping, and monitoring all dashboard services
"""

import os
import sys
import time
import json
import signal
import subprocess
import psutil
from pathlib import Path
from datetime import datetime
import logging
from typing import Dict, List, Optional

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DashboardManager:
    def __init__(self):
        self.services = {
            'main': {
                'name': 'Main Dashboard',
                'script': 'dashboard.py',
                'port': 5000,
                'health_endpoint': '/api/status',
                'pid': None,
                'status': 'stopped'
            },
            'approval': {
                'name': 'Approval Dashboard',
                'script': 'approval_dashboard.py',
                'port': 5001,
                'health_endpoint': '/api/stats',
                'pid': None,
                'status': 'stopped'
            },
            'platform': {
                'name': 'Platform Backend',
                'script': 'platform_backend.py',
                'port': 5002,
                'health_endpoint': '/',
                'pid': None,
                'status': 'stopped'
            },
            'queue': {
                'name': 'Queue Monitor',
                'script': 'queue_monitor_dashboard.py',
                'port': 5003,
                'health_endpoint': '/api/queue/status',
                'pid': None,
                'status': 'stopped'
            },
            'unified': {
                'name': 'Unified Platform',
                'script': 'unified_platform.py',
                'port': 5010,
                'health_endpoint': '/api/status',
                'pid': None,
                'status': 'stopped'
            },
            'treum': {
                'name': 'Treum AI Platform',
                'script': 'treum_ai_platform.py',
                'port': 5011,
                'health_endpoint': '/api/health',
                'pid': None,
                'status': 'stopped'
            },
            'automated': {
                'name': 'Automated Social Manager',
                'script': 'automated_social_media_manager.py',
                'port': 5020,
                'health_endpoint': '/api/posts/recent',
                'pid': None,
                'status': 'stopped'
            }
        }
        
        self.pid_file = Path('.dashboard_pids.json')
        self.log_dir = Path('logs')
        self.log_dir.mkdir(exist_ok=True)
        
        # Load existing PIDs if available
        self.load_pids()
        
    def load_pids(self):
        """Load existing service PIDs from file"""
        if self.pid_file.exists():
            try:
                with open(self.pid_file) as f:
                    pids = json.load(f)
                    for service_id, pid in pids.items():
                        if service_id in self.services and self.is_process_running(pid):
                            self.services[service_id]['pid'] = pid
                            self.services[service_id]['status'] = 'running'
            except Exception as e:
                logger.error(f"Error loading PIDs: {e}")
    
    def save_pids(self):
        """Save service PIDs to file"""
        pids = {sid: s['pid'] for sid, s in self.services.items() if s['pid']}
        with open(self.pid_file, 'w') as f:
            json.dump(pids, f)
    
    def is_process_running(self, pid: int) -> bool:
        """Check if a process is running"""
        try:
            process = psutil.Process(pid)
            return process.is_running()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return False
    
    def start_service(self, service_id: str) -> bool:
        """Start a specific service"""
        if service_id not in self.services:
            logger.error(f"Unknown service: {service_id}")
            return False
        
        service = self.services[service_id]
        
        # Check if already running
        if service['pid'] and self.is_process_running(service['pid']):
            logger.info(f"{service['name']} already running (PID: {service['pid']})")
            return True
        
        # Start the service
        try:
            env = os.environ.copy()
            env['PORT'] = str(service['port'])
            env['FLASK_APP'] = service['script']
            
            log_file = self.log_dir / f"{service_id}.log"
            
            with open(log_file, 'a') as log:
                if os.path.exists('venv/bin/python3'):
                    python_cmd = 'venv/bin/python3'
                else:
                    python_cmd = sys.executable
                
                process = subprocess.Popen(
                    [python_cmd, service['script']],
                    env=env,
                    stdout=log,
                    stderr=log,
                    start_new_session=True
                )
                
                service['pid'] = process.pid
                service['status'] = 'running'
                
                logger.info(f"Started {service['name']} on port {service['port']} (PID: {process.pid})")
                
                # Save PIDs
                self.save_pids()
                
                # Wait a moment for the service to start
                time.sleep(2)
                
                # Check if service is actually running
                if self.is_process_running(process.pid):
                    return True
                else:
                    logger.error(f"Failed to start {service['name']}")
                    service['pid'] = None
                    service['status'] = 'failed'
                    return False
                    
        except Exception as e:
            logger.error(f"Error starting {service['name']}: {e}")
            service['status'] = 'error'
            return False
    
    def stop_service(self, service_id: str) -> bool:
        """Stop a specific service"""
        if service_id not in self.services:
            logger.error(f"Unknown service: {service_id}")
            return False
        
        service = self.services[service_id]
        
        if not service['pid']:
            logger.info(f"{service['name']} not running")
            return True
        
        try:
            if self.is_process_running(service['pid']):
                process = psutil.Process(service['pid'])
                process.terminate()
                
                # Wait for graceful shutdown
                try:
                    process.wait(timeout=5)
                except psutil.TimeoutExpired:
                    # Force kill if not responding
                    process.kill()
                
                logger.info(f"Stopped {service['name']} (PID: {service['pid']})")
            
            service['pid'] = None
            service['status'] = 'stopped'
            self.save_pids()
            return True
            
        except Exception as e:
            logger.error(f"Error stopping {service['name']}: {e}")
            return False
    
    def restart_service(self, service_id: str) -> bool:
        """Restart a specific service"""
        logger.info(f"Restarting {self.services[service_id]['name']}...")
        self.stop_service(service_id)
        time.sleep(1)
        return self.start_service(service_id)
    
    def start_all(self):
        """Start all services"""
        logger.info("Starting all dashboard services...")
        success_count = 0
        
        for service_id in self.services:
            if self.start_service(service_id):
                success_count += 1
            time.sleep(1)  # Stagger starts
        
        logger.info(f"Started {success_count}/{len(self.services)} services")
        return success_count
    
    def stop_all(self):
        """Stop all services"""
        logger.info("Stopping all dashboard services...")
        
        for service_id in self.services:
            self.stop_service(service_id)
        
        logger.info("All services stopped")
    
    def restart_all(self):
        """Restart all services"""
        logger.info("Restarting all dashboard services...")
        self.stop_all()
        time.sleep(2)
        return self.start_all()
    
    def status(self) -> Dict:
        """Get status of all services"""
        status_report = {}
        
        for service_id, service in self.services.items():
            # Update status based on actual process state
            if service['pid']:
                if self.is_process_running(service['pid']):
                    service['status'] = 'running'
                else:
                    service['status'] = 'stopped'
                    service['pid'] = None
            
            status_report[service_id] = {
                'name': service['name'],
                'port': service['port'],
                'status': service['status'],
                'pid': service['pid'],
                'url': f"http://localhost:{service['port']}"
            }
        
        return status_report
    
    def health_check(self) -> Dict:
        """Perform health check on all services"""
        import requests
        
        health_report = {}
        
        for service_id, service in self.services.items():
            health_report[service_id] = {
                'name': service['name'],
                'port': service['port'],
                'status': 'unknown',
                'response_time': None
            }
            
            if service['status'] != 'running':
                health_report[service_id]['status'] = 'not_running'
                continue
            
            try:
                url = f"http://localhost:{service['port']}{service['health_endpoint']}"
                start_time = time.time()
                response = requests.get(url, timeout=2)
                response_time = (time.time() - start_time) * 1000
                
                if response.status_code < 500:
                    health_report[service_id]['status'] = 'healthy'
                    health_report[service_id]['response_time'] = f"{response_time:.2f}ms"
                else:
                    health_report[service_id]['status'] = 'unhealthy'
                    health_report[service_id]['error'] = f"HTTP {response.status_code}"
                    
            except requests.exceptions.ConnectionError:
                health_report[service_id]['status'] = 'unreachable'
            except requests.exceptions.Timeout:
                health_report[service_id]['status'] = 'timeout'
            except Exception as e:
                health_report[service_id]['status'] = 'error'
                health_report[service_id]['error'] = str(e)
        
        return health_report
    
    def print_status(self):
        """Print formatted status of all services"""
        print("\n" + "="*70)
        print("DASHBOARD SERVICE STATUS")
        print("="*70)
        
        status = self.status()
        
        for service_id, info in status.items():
            status_icon = "✅" if info['status'] == 'running' else "❌"
            print(f"\n{status_icon} {info['name']}")
            print(f"   Port: {info['port']}")
            print(f"   Status: {info['status']}")
            if info['pid']:
                print(f"   PID: {info['pid']}")
            print(f"   URL: {info['url']}")
        
        print("\n" + "="*70)
        
        # Count running services
        running = sum(1 for s in status.values() if s['status'] == 'running')
        print(f"Services Running: {running}/{len(status)}")
        print("="*70)
    
    def monitor(self, interval: int = 30):
        """Monitor services and restart if needed"""
        logger.info(f"Starting service monitor (checking every {interval} seconds)")
        
        try:
            while True:
                for service_id, service in self.services.items():
                    if service['pid'] and not self.is_process_running(service['pid']):
                        logger.warning(f"{service['name']} crashed, restarting...")
                        self.start_service(service_id)
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            logger.info("Monitor stopped by user")

def main():
    """Main CLI interface"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Dashboard Service Manager')
    parser.add_argument('command', choices=['start', 'stop', 'restart', 'status', 'health', 'monitor'],
                       help='Command to execute')
    parser.add_argument('--service', help='Specific service to manage')
    parser.add_argument('--interval', type=int, default=30, help='Monitor check interval (seconds)')
    
    args = parser.parse_args()
    
    manager = DashboardManager()
    
    if args.command == 'start':
        if args.service:
            success = manager.start_service(args.service)
            sys.exit(0 if success else 1)
        else:
            count = manager.start_all()
            manager.print_status()
            sys.exit(0 if count > 0 else 1)
    
    elif args.command == 'stop':
        if args.service:
            manager.stop_service(args.service)
        else:
            manager.stop_all()
        manager.print_status()
    
    elif args.command == 'restart':
        if args.service:
            manager.restart_service(args.service)
        else:
            manager.restart_all()
        manager.print_status()
    
    elif args.command == 'status':
        manager.print_status()
    
    elif args.command == 'health':
        health = manager.health_check()
        print("\n" + "="*70)
        print("DASHBOARD HEALTH CHECK")
        print("="*70)
        
        for service_id, info in health.items():
            icon = "✅" if info['status'] == 'healthy' else "⚠️" if info['status'] == 'unhealthy' else "❌"
            print(f"\n{icon} {info['name']}")
            print(f"   Status: {info['status']}")
            if info['response_time']:
                print(f"   Response Time: {info['response_time']}")
            if 'error' in info:
                print(f"   Error: {info['error']}")
        
        print("\n" + "="*70)
    
    elif args.command == 'monitor':
        try:
            manager.monitor(args.interval)
        except KeyboardInterrupt:
            print("\nMonitor stopped")

if __name__ == "__main__":
    main()