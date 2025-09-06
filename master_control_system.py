#!/usr/bin/env python3
"""
Master Control System for AI Finance Agency
Central orchestration and monitoring hub for all autonomous agents
"""

import os
import sys
import asyncio
import signal
import logging
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import multiprocessing
from typing import Dict, List, Optional
import json
import time
import threading
from dataclasses import dataclass, asdict
from enum import Enum

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/master_control.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Import all agents and components
try:
    from agents.research_agent import ResearchAgent
    from agents.abid_hassan_agent import AbidHassanMethodology
    from agents.technical_analysis_agent import TechnicalAnalysisAgent
    from agents.portfolio_management_agent import PortfolioManager
except ImportError as e:
    logger.warning(f"Some agents not found: {e}")

# Import growth and automation systems
try:
    from telegram_growth_engine import TelegramGrowthEngine
    from autonomous_growth_system import AutonomousGrowthSystem
    from multi_platform_content import MultiPlatformDistributor
except ImportError as e:
    logger.warning(f"Some automation systems not found: {e}")

# Import dashboard and monitoring
try:
    from dashboard import app as dashboard_app
    from control_panel import ControlPanel
except ImportError as e:
    logger.warning(f"Dashboard components not found: {e}")


class SystemState(Enum):
    """System operational states"""
    INITIALIZING = "initializing"
    RUNNING = "running"
    PAUSED = "paused"
    ERROR = "error"
    SHUTDOWN = "shutdown"


class ServiceStatus(Enum):
    """Individual service status"""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    FAILED = "failed"
    STARTING = "starting"
    STOPPED = "stopped"


@dataclass
class ServiceHealth:
    """Health check data for a service"""
    name: str
    status: ServiceStatus
    last_check: datetime
    uptime: float
    error_count: int
    message: str = ""
    
    def to_dict(self):
        return {
            'name': self.name,
            'status': self.status.value,
            'last_check': self.last_check.isoformat(),
            'uptime': self.uptime,
            'error_count': self.error_count,
            'message': self.message
        }


class MasterControlSystem:
    """
    Master Control System for AI Finance Agency
    Manages all autonomous agents, services, and system health
    """
    
    def __init__(self):
        self.state = SystemState.INITIALIZING
        self.services: Dict[str, ServiceHealth] = {}
        self.start_time = datetime.now()
        self.shutdown_event = threading.Event()
        self.executor = ThreadPoolExecutor(max_workers=10)
        self.process_executor = ProcessPoolExecutor(max_workers=4)
        
        # Service configurations
        self.service_configs = {
            'research_agent': {
                'class': 'ResearchAgent',
                'port': None,
                'critical': True,
                'restart_on_fail': True
            },
            'dashboard': {
                'module': 'dashboard',
                'port': 8088,
                'critical': True,
                'restart_on_fail': True
            },
            'telegram_growth': {
                'module': 'telegram_growth_engine',
                'port': None,
                'critical': False,
                'restart_on_fail': True
            },
            'content_distributor': {
                'module': 'multi_platform_content',
                'port': None,
                'critical': False,
                'restart_on_fail': True
            }
        }
        
        # Running services
        self.running_services = {}
        self.service_threads = {}
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        logger.info("Master Control System initialized")
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        logger.info(f"Received signal {signum}, initiating graceful shutdown...")
        self.shutdown()
    
    async def start_research_agent(self):
        """Start the research agent service"""
        try:
            logger.info("Starting Research Agent...")
            from agents.research_agent import ResearchAgent
            
            agent = ResearchAgent()
            self.running_services['research_agent'] = agent
            
            # Run research agent in background
            async def run_agent():
                while not self.shutdown_event.is_set():
                    try:
                        await agent.run_research_cycle()
                        await asyncio.sleep(300)  # Run every 5 minutes
                    except Exception as e:
                        logger.error(f"Research agent error: {e}")
                        await asyncio.sleep(60)
            
            asyncio.create_task(run_agent())
            
            self.services['research_agent'] = ServiceHealth(
                name='research_agent',
                status=ServiceStatus.HEALTHY,
                last_check=datetime.now(),
                uptime=0,
                error_count=0
            )
            logger.info("Research Agent started successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start Research Agent: {e}")
            self.services['research_agent'] = ServiceHealth(
                name='research_agent',
                status=ServiceStatus.FAILED,
                last_check=datetime.now(),
                uptime=0,
                error_count=1,
                message=str(e)
            )
            return False
    
    def start_dashboard(self):
        """Start the Flask dashboard in a separate thread"""
        try:
            logger.info("Starting Dashboard on port 8088...")
            
            def run_dashboard():
                try:
                    # Import here to avoid circular imports
                    from dashboard import app
                    app.run(host='0.0.0.0', port=8088, debug=False, use_reloader=False)
                except Exception as e:
                    logger.error(f"Dashboard error: {e}")
            
            dashboard_thread = threading.Thread(target=run_dashboard, daemon=True)
            dashboard_thread.start()
            self.service_threads['dashboard'] = dashboard_thread
            
            self.services['dashboard'] = ServiceHealth(
                name='dashboard',
                status=ServiceStatus.HEALTHY,
                last_check=datetime.now(),
                uptime=0,
                error_count=0
            )
            logger.info("Dashboard started successfully on http://localhost:8088")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start Dashboard: {e}")
            self.services['dashboard'] = ServiceHealth(
                name='dashboard',
                status=ServiceStatus.FAILED,
                last_check=datetime.now(),
                uptime=0,
                error_count=1,
                message=str(e)
            )
            return False
    
    def start_telegram_growth(self):
        """Start Telegram growth automation"""
        try:
            logger.info("Starting Telegram Growth Engine...")
            
            def run_telegram():
                try:
                    # Run in subprocess to isolate Telegram operations
                    import subprocess
                    result = subprocess.run(
                        [sys.executable, 'telegram_growth_engine.py'],
                        capture_output=True,
                        text=True,
                        timeout=10
                    )
                    if result.returncode != 0:
                        logger.error(f"Telegram growth failed: {result.stderr}")
                except subprocess.TimeoutExpired:
                    logger.info("Telegram growth engine running in background")
                except Exception as e:
                    logger.error(f"Telegram growth error: {e}")
            
            telegram_thread = threading.Thread(target=run_telegram, daemon=True)
            telegram_thread.start()
            self.service_threads['telegram_growth'] = telegram_thread
            
            self.services['telegram_growth'] = ServiceHealth(
                name='telegram_growth',
                status=ServiceStatus.HEALTHY,
                last_check=datetime.now(),
                uptime=0,
                error_count=0
            )
            logger.info("Telegram Growth Engine started")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start Telegram Growth: {e}")
            self.services['telegram_growth'] = ServiceHealth(
                name='telegram_growth',
                status=ServiceStatus.FAILED,
                last_check=datetime.now(),
                uptime=0,
                error_count=1,
                message=str(e)
            )
            return False
    
    async def health_check_loop(self):
        """Continuous health checking of all services"""
        while not self.shutdown_event.is_set():
            try:
                for service_name, health in self.services.items():
                    # Update uptime
                    health.uptime = (datetime.now() - self.start_time).total_seconds()
                    health.last_check = datetime.now()
                    
                    # Check if service thread is alive
                    if service_name in self.service_threads:
                        thread = self.service_threads[service_name]
                        if not thread.is_alive():
                            health.status = ServiceStatus.FAILED
                            health.error_count += 1
                            logger.warning(f"Service {service_name} is not running")
                            
                            # Attempt restart if configured
                            if self.service_configs.get(service_name, {}).get('restart_on_fail'):
                                logger.info(f"Attempting to restart {service_name}...")
                                self.restart_service(service_name)
                
                await asyncio.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                logger.error(f"Health check error: {e}")
                await asyncio.sleep(30)
    
    def restart_service(self, service_name: str):
        """Restart a failed service"""
        try:
            logger.info(f"Restarting service: {service_name}")
            
            if service_name == 'dashboard':
                self.start_dashboard()
            elif service_name == 'telegram_growth':
                self.start_telegram_growth()
            elif service_name == 'research_agent':
                asyncio.create_task(self.start_research_agent())
            
            logger.info(f"Service {service_name} restarted successfully")
            
        except Exception as e:
            logger.error(f"Failed to restart {service_name}: {e}")
    
    def get_system_status(self) -> Dict:
        """Get current system status and health"""
        return {
            'state': self.state.value,
            'uptime': (datetime.now() - self.start_time).total_seconds(),
            'start_time': self.start_time.isoformat(),
            'services': {
                name: health.to_dict() 
                for name, health in self.services.items()
            },
            'system_info': {
                'cpu_count': multiprocessing.cpu_count(),
                'memory_available': self._get_memory_info(),
                'python_version': sys.version
            }
        }
    
    def _get_memory_info(self) -> Dict:
        """Get system memory information"""
        try:
            import psutil
            mem = psutil.virtual_memory()
            return {
                'total': mem.total,
                'available': mem.available,
                'percent': mem.percent
            }
        except ImportError:
            return {'error': 'psutil not installed'}
    
    async def start(self):
        """Start the master control system and all services"""
        try:
            logger.info("=" * 60)
            logger.info("AI FINANCE AGENCY - MASTER CONTROL SYSTEM")
            logger.info("=" * 60)
            logger.info(f"Starting at {datetime.now()}")
            
            self.state = SystemState.INITIALIZING
            
            # Start core services
            logger.info("\nPhase 1: Starting Core Services...")
            
            # Start Research Agent
            await self.start_research_agent()
            
            # Start Dashboard
            self.start_dashboard()
            await asyncio.sleep(2)  # Give dashboard time to start
            
            # Start Growth Engines
            logger.info("\nPhase 2: Starting Growth Engines...")
            self.start_telegram_growth()
            
            # Start health monitoring
            logger.info("\nPhase 3: Starting Health Monitoring...")
            asyncio.create_task(self.health_check_loop())
            
            self.state = SystemState.RUNNING
            
            # Print status
            logger.info("\n" + "=" * 60)
            logger.info("SYSTEM STATUS: OPERATIONAL")
            logger.info("=" * 60)
            logger.info(f"Dashboard: http://localhost:8088")
            logger.info(f"Services Running: {len([s for s in self.services.values() if s.status == ServiceStatus.HEALTHY])}/{len(self.services)}")
            logger.info("=" * 60 + "\n")
            
            # Keep running until shutdown
            while not self.shutdown_event.is_set():
                await asyncio.sleep(1)
            
        except Exception as e:
            logger.error(f"Critical error in master control: {e}")
            self.state = SystemState.ERROR
            self.shutdown()
    
    def shutdown(self):
        """Gracefully shutdown all services"""
        logger.info("\nInitiating system shutdown...")
        self.state = SystemState.SHUTDOWN
        self.shutdown_event.set()
        
        # Stop all services
        for service_name in self.services:
            try:
                logger.info(f"Stopping {service_name}...")
                self.services[service_name].status = ServiceStatus.STOPPED
            except Exception as e:
                logger.error(f"Error stopping {service_name}: {e}")
        
        # Shutdown executors
        self.executor.shutdown(wait=True, timeout=10)
        self.process_executor.shutdown(wait=True, timeout=10)
        
        logger.info("Master Control System shutdown complete")
        sys.exit(0)


async def main():
    """Main entry point"""
    master = MasterControlSystem()
    
    try:
        await master.start()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
        master.shutdown()
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        master.shutdown()


if __name__ == "__main__":
    # Ensure logs directory exists
    os.makedirs('logs', exist_ok=True)
    
    # Check if running in Docker
    if os.environ.get('DOCKER_CONTAINER'):
        logger.info("Running in Docker container")
    
    # Run the master control system
    try:
        asyncio.run(main())
    except Exception as e:
        logger.error(f"Failed to start: {e}")
        sys.exit(1)