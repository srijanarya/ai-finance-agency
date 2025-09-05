#!/usr/bin/env python3
"""
Main Automation Controller - Ensures everything runs 24/7
"""

import os
import sys
import subprocess
import time
import signal
from datetime import datetime
from pathlib import Path

class AutomationController:
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.processes = {}
        self.log_file = self.base_dir / "automation.log"
        
    def log(self, message):
        """Log with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_msg = f"[{timestamp}] {message}"
        print(log_msg)
        with open(self.log_file, "a") as f:
            f.write(log_msg + "\n")
            
    def check_process(self, name):
        """Check if a process is running"""
        try:
            result = subprocess.run(
                f"ps aux | grep '{name}' | grep -v grep",
                shell=True,
                capture_output=True,
                text=True
            )
            return bool(result.stdout.strip())
        except:
            return False
            
    def start_service(self, name, command):
        """Start a service if not running"""
        if not self.check_process(name):
            self.log(f"Starting {name}...")
            process = subprocess.Popen(
                command,
                shell=True,
                cwd=self.base_dir,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                preexec_fn=os.setsid
            )
            self.processes[name] = process.pid
            self.log(f"✅ {name} started (PID: {process.pid})")
            return True
        else:
            self.log(f"✓ {name} already running")
            return False
            
    def ensure_all_running(self):
        """Make sure all services are running"""
        services = [
            ("Dashboard", "source venv/bin/activate && python simple_dashboard.py"),
            ("Telegram Poster", "source venv/bin/activate && python full_auto_clicker.py"),
        ]
        
        for name, command in services:
            self.start_service(name, command)
            time.sleep(2)  # Give each service time to start
            
    def monitor_loop(self):
        """Continuous monitoring loop"""
        self.log("=" * 60)
        self.log("🚀 AI FINANCE AGENCY AUTOMATION CONTROLLER")
        self.log("=" * 60)
        
        # Initial startup
        self.ensure_all_running()
        
        # Monitor every 5 minutes
        while True:
            try:
                time.sleep(300)  # 5 minutes
                self.log("Checking services...")
                self.ensure_all_running()
                
                # Health check
                if self.check_process("simple_dashboard"):
                    self.log("✅ Dashboard: Healthy")
                else:
                    self.log("⚠️ Dashboard: Down - Restarting...")
                    self.start_service("Dashboard", "source venv/bin/activate && python simple_dashboard.py")
                    
                if self.check_process("full_auto_clicker"):
                    self.log("✅ Telegram Poster: Healthy")
                else:
                    self.log("⚠️ Telegram Poster: Down - Restarting...")
                    self.start_service("Telegram Poster", "source venv/bin/activate && python full_auto_clicker.py")
                    
            except KeyboardInterrupt:
                self.log("Shutdown requested...")
                self.shutdown()
                break
            except Exception as e:
                self.log(f"Error: {e}")
                time.sleep(60)
                
    def shutdown(self):
        """Clean shutdown"""
        self.log("Shutting down services...")
        for name, pid in self.processes.items():
            try:
                os.killpg(os.getpgid(pid), signal.SIGTERM)
                self.log(f"Stopped {name}")
            except:
                pass
        self.log("Shutdown complete")

if __name__ == "__main__":
    controller = AutomationController()
    
    # Check if already running
    if controller.check_process("automation.py"):
        print("⚠️ Automation controller already running!")
        sys.exit(1)
        
    try:
        controller.monitor_loop()
    except Exception as e:
        controller.log(f"Fatal error: {e}")
        controller.shutdown()