#!/usr/bin/env python3
"""
Start Complete Monitoring Suite
Launches all monitoring components for production readiness
"""

import subprocess
import sys
import time
import asyncio
import threading
from pathlib import Path
import signal
import os

class MonitoringSuite:
    """Complete monitoring suite launcher"""
    
    def __init__(self):
        self.processes = []
        self.running = True
        
    def start_monitoring_dashboard(self):
        """Start the web dashboard on port 5002"""
        print("🚀 Starting Monitoring Dashboard (Port 5002)...")
        try:
            process = subprocess.Popen(
                [sys.executable, 'monitoring_dashboard.py'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            self.processes.append(('dashboard', process))
            print("✅ Monitoring Dashboard started")
            return True
        except Exception as e:
            print(f"❌ Failed to start dashboard: {e}")
            return False
    
    def start_prometheus_exporter(self):
        """Start Prometheus metrics exporter on port 8000"""
        print("🔧 Starting Prometheus Exporter (Port 8000)...")
        try:
            process = subprocess.Popen(
                [sys.executable, 'prometheus_exporter.py'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            self.processes.append(('prometheus', process))
            print("✅ Prometheus Exporter started")
            return True
        except Exception as e:
            print(f"❌ Failed to start Prometheus exporter: {e}")
            return False
    
    def start_continuous_monitoring(self):
        """Start continuous monitoring in background"""
        print("👁️ Starting Continuous Monitoring...")
        try:
            process = subprocess.Popen(
                [sys.executable, '-c', '''
import asyncio
from production_monitoring_system import ProductionMonitor

async def run():
    monitor = ProductionMonitor()
    await monitor.start_continuous_monitoring()

if __name__ == "__main__":
    asyncio.run(run())
                '''],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            self.processes.append(('monitor', process))
            print("✅ Continuous Monitoring started")
            return True
        except Exception as e:
            print(f"❌ Failed to start continuous monitoring: {e}")
            return False
    
    def check_process_health(self):
        """Check health of all monitoring processes"""
        healthy_processes = 0
        
        for name, process in self.processes:
            if process.poll() is None:  # Process is running
                healthy_processes += 1
                status = "✅ RUNNING"
            else:
                status = "❌ STOPPED"
            
            print(f"  {name}: {status}")
        
        return healthy_processes == len(self.processes)
    
    def stop_all_processes(self):
        """Stop all monitoring processes"""
        print("\n🛑 Stopping all monitoring processes...")
        
        for name, process in self.processes:
            try:
                if process.poll() is None:  # Process is running
                    print(f"  Stopping {name}...")
                    process.terminate()
                    
                    # Wait for graceful shutdown
                    try:
                        process.wait(timeout=10)
                    except subprocess.TimeoutExpired:
                        print(f"  Force killing {name}...")
                        process.kill()
                        process.wait()
                    
                    print(f"  ✅ {name} stopped")
                else:
                    print(f"  ⏸️ {name} was already stopped")
                    
            except Exception as e:
                print(f"  ❌ Error stopping {name}: {e}")
        
        self.processes.clear()
        print("✅ All processes stopped")
    
    def signal_handler(self, signum, frame):
        """Handle termination signals"""
        print(f"\n📡 Received signal {signum}")
        self.running = False
        self.stop_all_processes()
        sys.exit(0)
    
    def start_all(self):
        """Start complete monitoring suite"""
        print("🚀 AI FINANCE AGENCY - PRODUCTION MONITORING SUITE")
        print("=" * 60)
        
        # Set up signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        success_count = 0
        
        # Start all components
        if self.start_monitoring_dashboard():
            success_count += 1
            
        time.sleep(2)  # Give dashboard time to start
        
        if self.start_prometheus_exporter():
            success_count += 1
            
        time.sleep(2)  # Give exporter time to start
        
        if self.start_continuous_monitoring():
            success_count += 1
        
        print("\n" + "=" * 60)
        print(f"✅ Started {success_count}/3 monitoring components")
        
        if success_count > 0:
            print("\n🎯 MONITORING ENDPOINTS:")
            print("📊 Dashboard: http://localhost:5002")
            print("🔧 Prometheus: http://localhost:8000/metrics")
            print("💊 Health API: http://localhost:5002/api/monitoring/health")
            
            print("\n📊 FEATURES ENABLED:")
            print("✅ Real-time system monitoring (CPU, Memory, Disk)")
            print("✅ Service health checks (API endpoints)")
            print("✅ Market data monitoring")
            print("✅ Automated alerting (Telegram)")
            print("✅ Performance dashboards")
            print("✅ Prometheus metrics export")
            print("✅ 99.9% uptime monitoring")
            
            print("\n🚨 ALERTING CONFIGURED:")
            print("• CPU > 90% → Critical Alert")
            print("• Memory > 90% → Critical Alert") 
            print("• Service Down → Immediate Alert")
            print("• Slow Response (>5s) → Warning Alert")
            print("• Stale Market Data → Warning Alert")
            
            print(f"\n🔄 Running continuous monitoring...")
            print("Press Ctrl+C to stop all monitoring processes")
            
            # Keep the main process alive and monitor health
            try:
                while self.running:
                    time.sleep(30)  # Check every 30 seconds
                    
                    print(f"\n📊 Health Check - {time.strftime('%H:%M:%S')}")
                    if not self.check_process_health():
                        print("⚠️ Some monitoring processes are down!")
                        
            except KeyboardInterrupt:
                pass
        else:
            print("❌ Failed to start monitoring components")
            self.stop_all_processes()

def create_docker_compose_monitoring():
    """Create Docker Compose for full monitoring stack"""
    
    compose_content = """version: '3.8'

services:
  ai-finance-monitoring:
    build: .
    container_name: ai-finance-monitoring
    ports:
      - "5002:5002"  # Dashboard
      - "8000:8000"  # Prometheus exporter
    volumes:
      - ./data:/app/data
    environment:
      - TZ=Asia/Kolkata
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5002/api/monitoring/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./ai_finance_rules.yml:/etc/prometheus/ai_finance_rules.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    restart: unless-stopped

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
"""
    
    with open('docker-compose-monitoring.yml', 'w') as f:
        f.write(compose_content)
    
    print("✅ Created docker-compose-monitoring.yml")

def create_grafana_dashboard():
    """Create Grafana dashboard configuration"""
    
    # Create grafana directory structure
    Path('grafana/provisioning/dashboards').mkdir(parents=True, exist_ok=True)
    Path('grafana/provisioning/datasources').mkdir(parents=True, exist_ok=True)
    
    # Datasource configuration
    datasource_config = """apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
"""
    
    with open('grafana/provisioning/datasources/prometheus.yml', 'w') as f:
        f.write(datasource_config)
    
    # Dashboard provisioning
    dashboard_config = """apiVersion: 1

providers:
  - name: 'AI Finance Agency'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /etc/grafana/provisioning/dashboards
"""
    
    with open('grafana/provisioning/dashboards/dashboard.yml', 'w') as f:
        f.write(dashboard_config)
    
    print("✅ Created Grafana configuration")

def main():
    """Main function"""
    
    print("🎯 MONITORING SUITE SETUP")
    print("=" * 40)
    print("1. Start monitoring suite")
    print("2. Create Docker deployment files")
    print("3. Setup Grafana dashboards")
    print("4. Full setup (all above)")
    
    try:
        choice = input("\nSelect option (1-4): ").strip()
        
        if choice == '1':
            suite = MonitoringSuite()
            suite.start_all()
            
        elif choice == '2':
            create_docker_compose_monitoring()
            print("\n🐳 Docker files created. Run with:")
            print("docker-compose -f docker-compose-monitoring.yml up -d")
            
        elif choice == '3':
            create_grafana_dashboard()
            print("\n📊 Grafana setup complete")
            
        elif choice == '4':
            create_docker_compose_monitoring()
            create_grafana_dashboard()
            print("\n✅ All setup files created!")
            
            suite = MonitoringSuite()
            suite.start_all()
            
        else:
            print("❌ Invalid option")
            
    except KeyboardInterrupt:
        print("\n✋ Setup interrupted")
    except Exception as e:
        print(f"\n❌ Setup error: {e}")

if __name__ == "__main__":
    main()