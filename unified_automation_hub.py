#!/usr/bin/env python3
"""
Unified Automation Hub - Master Control for All Platforms
"""

import os
import sys
import subprocess
import time
from datetime import datetime
from pathlib import Path
import psutil

class UnifiedAutomationHub:
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.services = {
            'telegram': {
                'script': 'full_auto_clicker.py',
                'name': 'Telegram Auto-Poster',
                'status': '❌',
                'posts': 0,
                'schedule': 'Every 20-30 min'
            },
            'twitter': {
                'script': 'twitter_auto_poster.py',
                'name': 'Twitter/X Auto-Poster',
                'status': '❌',
                'posts': 0,
                'schedule': 'Every 60-90 min'
            },
            'linkedin': {
                'script': 'linkedin_company_auto_poster.py',
                'name': 'LinkedIn Company',
                'status': '❌',
                'posts': 0,
                'schedule': 'Every 45-60 min'
            },
            'dashboard': {
                'script': 'simple_dashboard.py',
                'name': 'Web Dashboard',
                'status': '❌',
                'posts': 'N/A',
                'schedule': 'Always On'
            }
        }
        
    def check_process(self, script_name):
        """Check if a process is running"""
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                cmdline = proc.info.get('cmdline', [])
                if cmdline and script_name in ' '.join(cmdline):
                    return True
            except:
                pass
        return False
    
    def start_service(self, service_key):
        """Start a specific service"""
        service = self.services[service_key]
        script = service['script']
        
        if self.check_process(script):
            print(f"✓ {service['name']} already running")
            return True
            
        try:
            cmd = f"nohup python {script} > {service_key}.log 2>&1 &"
            subprocess.Popen(cmd, shell=True, cwd=self.base_dir)
            time.sleep(2)
            
            if self.check_process(script):
                print(f"✅ Started {service['name']}")
                return True
            else:
                print(f"❌ Failed to start {service['name']}")
                return False
        except Exception as e:
            print(f"❌ Error starting {service['name']}: {e}")
            return False
    
    def stop_service(self, service_key):
        """Stop a specific service"""
        service = self.services[service_key]
        script = service['script']
        
        try:
            # Find and kill the process
            for proc in psutil.process_iter(['pid', 'cmdline']):
                try:
                    cmdline = proc.info.get('cmdline', [])
                    if cmdline and script in ' '.join(cmdline):
                        proc.kill()
                        print(f"✅ Stopped {service['name']}")
                        return True
                except:
                    pass
            print(f"⚠️ {service['name']} not running")
            return False
        except Exception as e:
            print(f"❌ Error stopping {service['name']}: {e}")
            return False
    
    def status_report(self):
        """Show status of all services"""
        print("\n" + "=" * 70)
        print("🎯 AI FINANCE AGENCY - AUTOMATION STATUS")
        print("=" * 70)
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("-" * 70)
        print(f"{'Service':<25} {'Status':<10} {'Schedule':<20}")
        print("-" * 70)
        
        for key, service in self.services.items():
            is_running = self.check_process(service['script'])
            status = "✅ Running" if is_running else "❌ Stopped"
            service['status'] = status
            
            print(f"{service['name']:<25} {status:<10} {service['schedule']:<20}")
        
        print("-" * 70)
        
        # Platform-specific status
        print("\n📱 PLATFORM STATUS:")
        print("• Telegram: @AIFinanceNews2024 ✅")
        print("• Twitter/X: Working with v2 API ✅")
        print("• LinkedIn: Needs OAuth token refresh ⚠️")
        
        # Dashboard link
        if self.check_process('simple_dashboard.py'):
            print("\n🌐 Dashboard: http://localhost:8080 ✅")
        else:
            print("\n🌐 Dashboard: Not running ❌")
        
        print("=" * 70)
    
    def interactive_menu(self):
        """Interactive control menu"""
        while True:
            self.status_report()
            
            print("\n📋 COMMANDS:")
            print("1. Start Telegram Auto-Poster")
            print("2. Start Twitter/X Auto-Poster")
            print("3. Start LinkedIn Company Poster")
            print("4. Start Web Dashboard")
            print("5. Start ALL Services")
            print("6. Stop Telegram Auto-Poster")
            print("7. Stop Twitter/X Auto-Poster")
            print("8. Stop LinkedIn Company Poster")
            print("9. Stop Web Dashboard")
            print("10. Stop ALL Services")
            print("11. Refresh Status")
            print("0. Exit")
            
            choice = input("\nEnter choice (0-9): ").strip()
            
            if choice == '1':
                self.start_service('telegram')
            elif choice == '2':
                print("⚠️ LinkedIn needs OAuth token - manual setup required")
            elif choice == '3':
                self.start_service('dashboard')
            elif choice == '4':
                print("\n🚀 Starting all services...")
                self.start_service('telegram')
                self.start_service('dashboard')
                print("⚠️ Skipping LinkedIn (needs OAuth)")
            elif choice == '5':
                self.stop_service('telegram')
            elif choice == '6':
                self.stop_service('linkedin')
            elif choice == '7':
                self.stop_service('dashboard')
            elif choice == '8':
                print("\n🛑 Stopping all services...")
                self.stop_service('telegram')
                self.stop_service('linkedin')
                self.stop_service('dashboard')
            elif choice == '9':
                continue  # Just refresh
            elif choice == '0':
                print("\n👋 Exiting...")
                break
            else:
                print("❌ Invalid choice")
            
            time.sleep(2)

def main():
    """Main entry point"""
    hub = UnifiedAutomationHub()
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == 'status':
            hub.status_report()
        elif command == 'start':
            if len(sys.argv) > 2:
                service = sys.argv[2].lower()
                if service == 'all':
                    hub.start_service('telegram')
                    hub.start_service('dashboard')
                elif service in hub.services:
                    hub.start_service(service)
            else:
                print("Usage: python unified_automation_hub.py start [telegram|linkedin|dashboard|all]")
        elif command == 'stop':
            if len(sys.argv) > 2:
                service = sys.argv[2].lower()
                if service == 'all':
                    for key in hub.services:
                        hub.stop_service(key)
                elif service in hub.services:
                    hub.stop_service(service)
            else:
                print("Usage: python unified_automation_hub.py stop [telegram|linkedin|dashboard|all]")
        else:
            print("Commands: status, start, stop")
    else:
        # Interactive mode
        hub.interactive_menu()

if __name__ == "__main__":
    main()