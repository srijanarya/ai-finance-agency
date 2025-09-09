#!/usr/bin/env python3
"""
Premium AI-Powered Trading Signal Service - Main Integration
Complete system that integrates all components for $500K-2M ARR generation
"""

import asyncio
import threading
import schedule
import time
import json
from datetime import datetime, timedelta
import logging

# Import all our components
from premium_signal_engine import PremiumSignalEngine
from signal_distribution import SignalDistribution
from performance_tracker import PerformanceTracker
from subscription_tier_manager import SubscriptionTierManager
from compliance_monitor import ComplianceMonitor
from database_initializer import DatabaseInitializer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('premium_signal_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class PremiumSignalService:
    """
    Main service orchestrator for the Premium Trading Signal Platform
    Manages all components and ensures seamless operation
    """
    
    def __init__(self):
        logger.info("Initializing Premium Signal Service...")
        
        # Initialize all components
        self.signal_engine = PremiumSignalEngine()
        self.distribution = SignalDistribution()
        self.performance_tracker = PerformanceTracker()
        self.subscription_manager = SubscriptionTierManager()
        self.compliance_monitor = ComplianceMonitor()
        
        # Service status
        self.is_running = False
        self.last_signal_generation = None
        self.daily_signals_generated = 0
        self.total_subscribers = 0
        
        # Performance metrics
        self.metrics = {
            'signals_generated_today': 0,
            'signals_distributed_today': 0,
            'active_subscribers': 0,
            'current_arr': 0,
            'compliance_rate': 0,
            'avg_signal_performance': 0
        }
        
        logger.info("✅ Premium Signal Service initialized successfully")
    
    async def initialize_system(self):
        """Initialize the complete system"""
        logger.info("🚀 Starting Premium Signal Service initialization...")
        
        try:
            # Initialize databases
            logger.info("📊 Setting up databases...")
            db_initializer = DatabaseInitializer()
            db_initializer.initialize_all_databases()
            
            # Verify system components
            logger.info("🔍 Verifying system components...")
            await self.verify_system_health()
            
            # Load initial data and configurations
            await self.load_system_configurations()
            
            # Start background services
            self.start_background_services()
            
            self.is_running = True
            logger.info("🎉 Premium Signal Service is fully operational!")
            
            # Print system overview
            await self.print_system_overview()
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize system: {e}")
            raise
    
    async def verify_system_health(self):
        """Verify all system components are working"""
        health_checks = []
        
        # Check signal engine
        try:
            test_signals = await self.signal_engine.generate_all_signals()
            logger.info(f"✅ Signal Engine: Generated {len(test_signals)} test signals")
            health_checks.append(True)
        except Exception as e:
            logger.error(f"❌ Signal Engine: {e}")
            health_checks.append(False)
        
        # Check distribution system
        try:
            stats = self.distribution.get_delivery_stats(1)
            logger.info("✅ Distribution System: Ready")
            health_checks.append(True)
        except Exception as e:
            logger.error(f"❌ Distribution System: {e}")
            health_checks.append(False)
        
        # Check performance tracker
        try:
            self.performance_tracker.run_daily_analysis()
            logger.info("✅ Performance Tracker: Operational")
            health_checks.append(True)
        except Exception as e:
            logger.error(f"❌ Performance Tracker: {e}")
            health_checks.append(False)
        
        # Check subscription manager
        try:
            overview = self.subscription_manager.get_subscription_overview()
            logger.info(f"✅ Subscription Manager: {overview['total_active_subscribers']} active subscribers")
            health_checks.append(True)
        except Exception as e:
            logger.error(f"❌ Subscription Manager: {e}")
            health_checks.append(False)
        
        # Check compliance monitor
        try:
            dashboard_data = self.compliance_monitor.get_compliance_dashboard_data()
            logger.info("✅ Compliance Monitor: Active")
            health_checks.append(True)
        except Exception as e:
            logger.error(f"❌ Compliance Monitor: {e}")
            health_checks.append(False)
        
        if not all(health_checks):
            raise Exception("System health check failed - some components are not working")
    
    async def load_system_configurations(self):
        """Load system configurations and initial data"""
        logger.info("⚙️ Loading system configurations...")
        
        # Create sample subscribers for testing
        sample_subscribers = [
            {
                'user_id': 'test_basic_001',
                'email': 'basic@test.com',
                'subscription_tier': 'BASIC',
                'telegram_chat_id': '123456789'
            },
            {
                'user_id': 'test_pro_001', 
                'email': 'pro@test.com',
                'subscription_tier': 'PRO',
                'telegram_chat_id': '987654321',
                'whatsapp_number': '+1234567890'
            },
            {
                'user_id': 'test_enterprise_001',
                'email': 'enterprise@test.com',
                'subscription_tier': 'ENTERPRISE',
                'telegram_chat_id': '555666777'
            }
        ]
        
        for subscriber in sample_subscribers:
            self.distribution.add_subscriber(subscriber)
        
        logger.info(f"📧 Added {len(sample_subscribers)} test subscribers")
    
    def start_background_services(self):
        """Start all background services"""
        logger.info("🔄 Starting background services...")
        
        # Schedule signal generation every 15 minutes during market hours
        schedule.every(15).minutes.do(self.scheduled_signal_generation)
        
        # Schedule performance analysis daily at 18:00 IST
        schedule.every().day.at("18:00").do(self.daily_performance_analysis)
        
        # Schedule compliance checks daily at 08:00 IST  
        schedule.every().day.at("08:00").do(self.daily_compliance_check)
        
        # Schedule subscription analytics daily at 23:00 IST
        schedule.every().day.at("23:00").do(self.daily_subscription_analytics)
        
        # Start scheduler in background thread
        scheduler_thread = threading.Thread(target=self.run_scheduler)
        scheduler_thread.daemon = True
        scheduler_thread.start()
        
        logger.info("✅ Background services started")
    
    def run_scheduler(self):
        """Run the background scheduler"""
        while self.is_running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def scheduled_signal_generation(self):
        """Generate and distribute signals on schedule"""
        if not self.is_market_hours():
            return
        
        try:
            logger.info("🎯 Starting scheduled signal generation...")
            
            # Generate signals
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            signals = loop.run_until_complete(self.signal_engine.generate_all_signals())
            
            if not signals:
                logger.info("📊 No new signals generated this cycle")
                return
            
            logger.info(f"📈 Generated {len(signals)} new signals")
            
            # Run compliance checks
            compliant_signals = []
            for signal in signals:
                try:
                    compliance_result = self.compliance_monitor.check_signal_compliance(signal['signal_id'])
                    if compliance_result['overall_status'] == 'COMPLIANT':
                        # Approve signal for distribution
                        self.compliance_monitor.approve_signal_for_distribution(
                            signal['signal_id'], 'SYSTEM_AUTO'
                        )
                        compliant_signals.append(signal)
                    else:
                        logger.warning(f"⚠️ Signal {signal['signal_id']} failed compliance: {compliance_result['overall_status']}")
                except Exception as e:
                    logger.error(f"❌ Compliance check failed for {signal['signal_id']}: {e}")
            
            logger.info(f"✅ {len(compliant_signals)} signals passed compliance")
            
            # Distribute compliant signals
            for signal in compliant_signals:
                try:
                    loop.run_until_complete(self.distribution.distribute_signal(signal))
                    self.metrics['signals_distributed_today'] += 1
                except Exception as e:
                    logger.error(f"❌ Failed to distribute signal {signal['signal_id']}: {e}")
            
            self.metrics['signals_generated_today'] = len(compliant_signals)
            self.last_signal_generation = datetime.now()
            
            logger.info(f"🚀 Signal generation cycle completed: {len(compliant_signals)} signals distributed")
            
        except Exception as e:
            logger.error(f"❌ Error in scheduled signal generation: {e}")
    
    def is_market_hours(self) -> bool:
        """Check if it's currently market hours"""
        now = datetime.now()
        
        # Indian market hours: 9:15 AM to 3:30 PM IST (Monday to Friday)
        if now.weekday() >= 5:  # Weekend
            return False
        
        market_start = now.replace(hour=9, minute=15, second=0)
        market_end = now.replace(hour=15, minute=30, second=0)
        
        return market_start <= now <= market_end
    
    def daily_performance_analysis(self):
        """Run daily performance analysis"""
        try:
            logger.info("📊 Running daily performance analysis...")
            
            # Update signal performance
            analysis_result = self.performance_tracker.run_daily_analysis()
            
            # Update metrics
            if analysis_result and 'daily_metrics' in analysis_result:
                daily_metrics = analysis_result['daily_metrics']
                self.metrics['avg_signal_performance'] = daily_metrics.get('avg_return', 0)
            
            logger.info("✅ Daily performance analysis completed")
            
        except Exception as e:
            logger.error(f"❌ Error in daily performance analysis: {e}")
    
    def daily_compliance_check(self):
        """Run daily compliance monitoring"""
        try:
            logger.info("🔍 Running daily compliance check...")
            
            # Run compliance scan
            results = self.compliance_monitor.run_daily_compliance_scan()
            
            if results:
                total_checked = results.get('total_signals', 0)
                compliant = results.get('compliant', 0)
                self.metrics['compliance_rate'] = (compliant / total_checked * 100) if total_checked > 0 else 100
                
                logger.info(f"📋 Compliance check completed: {compliant}/{total_checked} signals compliant")
            
        except Exception as e:
            logger.error(f"❌ Error in daily compliance check: {e}")
    
    def daily_subscription_analytics(self):
        """Run daily subscription analytics"""
        try:
            logger.info("💰 Running daily subscription analytics...")
            
            # Calculate subscription metrics
            analytics = self.subscription_manager.calculate_subscription_analytics()
            
            # Update metrics
            overview = self.subscription_manager.get_subscription_overview()
            self.metrics['active_subscribers'] = overview['total_active_subscribers']
            self.metrics['current_arr'] = overview['total_arr']
            
            logger.info(f"💡 Subscription analytics completed: {overview['total_active_subscribers']} subscribers, ${overview['total_arr']:,.0f} ARR")
            
        except Exception as e:
            logger.error(f"❌ Error in subscription analytics: {e}")
    
    async def print_system_overview(self):
        """Print comprehensive system overview"""
        overview = self.subscription_manager.get_subscription_overview()
        
        print("\n" + "="*80)
        print("🚀 PREMIUM AI-POWERED TRADING SIGNAL SERVICE")
        print("="*80)
        print(f"🎯 TARGET: $500K-2M ARR | 📊 CURRENT ARR: ${overview['total_arr']:,.0f}")
        print(f"📈 ARR ACHIEVEMENT: {overview['arr_achievement']:.1f}%")
        print(f"👥 ACTIVE SUBSCRIBERS: {overview['total_active_subscribers']}")
        print("\n📊 SUBSCRIPTION BREAKDOWN:")
        
        for tier, data in overview['tier_breakdown'].items():
            print(f"   {tier:12} | {data['subscribers']:4} subscribers | ${data['arr']:8,.0f} ARR")
        
        print(f"\n⚡ SIGNAL TYPES:")
        print(f"   • Intraday Signals (5-15min timeframes)")
        print(f"   • Swing Trading (1-5 day holds)")
        print(f"   • Investment Signals (weeks-months)")
        print(f"   • Scalping (Enterprise only)")
        
        print(f"\n🌍 ASSET COVERAGE:")
        print(f"   • Indian Stocks (Nifty 50, Bank Nifty)")
        print(f"   • US Markets (Tech, S&P 500)")
        print(f"   • Cryptocurrency (BTC, ETH, Top 20)")
        print(f"   • Forex Majors (USD/INR, EUR/USD)")
        
        print(f"\n📱 DELIVERY CHANNELS:")
        print(f"   • Telegram Premium Channels")
        print(f"   • WhatsApp Business (Pro/Enterprise)")
        print(f"   • Email Alerts with Analysis")
        print(f"   • Push Notifications")
        print(f"   • REST API (Institutional)")
        
        print(f"\n🔒 COMPLIANCE & QUALITY:")
        print(f"   • SEBI Guidelines Compliance")
        print(f"   • Real-time Performance Tracking")
        print(f"   • Risk Management (Min 1:2 R:R)")
        print(f"   • Quality Scoring (6+ Confidence)")
        
        print(f"\n🎛️ SYSTEM STATUS:")
        print(f"   • Service Running: {'✅ YES' if self.is_running else '❌ NO'}")
        print(f"   • Market Hours: {'🟢 ACTIVE' if self.is_market_hours() else '🔴 CLOSED'}")
        print(f"   • Last Signal Gen: {self.last_signal_generation or 'Not yet run'}")
        print(f"   • Signals Today: {self.metrics['signals_generated_today']}")
        
        print("\n🚀 REVENUE PROJECTIONS:")
        print(f"   • Basic (1000 subs × $490): $490,000 ARR")
        print(f"   • Pro (500 subs × $1,990): $995,000 ARR") 
        print(f"   • Enterprise (50 × $9,999): $499,950 ARR")
        print(f"   • TOTAL PROJECTED: $1,984,950 ARR (~$2M)")
        
        print("\n🎯 KEY DIFFERENTIATORS:")
        print(f"   • AI-Powered Multi-Asset Analysis")
        print(f"   • Institutional-Grade Risk Management")
        print(f"   • Real-Time Performance Attribution")
        print(f"   • Multi-Channel Distribution")
        print(f"   • Regulatory Compliance (SEBI)")
        print(f"   • Tiered Access with Premium Features")
        
        print("="*80)
        print("🎉 SYSTEM READY FOR $500K-2M ARR GENERATION!")
        print("="*80)
    
    def get_system_status(self) -> dict:
        """Get current system status"""
        overview = self.subscription_manager.get_subscription_overview()
        
        return {
            'service_status': 'RUNNING' if self.is_running else 'STOPPED',
            'market_status': 'OPEN' if self.is_market_hours() else 'CLOSED',
            'last_signal_generation': self.last_signal_generation.isoformat() if self.last_signal_generation else None,
            'metrics': self.metrics,
            'subscription_overview': overview,
            'projected_arr': 1984950,
            'arr_achievement_percentage': (overview['total_arr'] / 1984950) * 100,
            'timestamp': datetime.now().isoformat()
        }
    
    async def run_service(self):
        """Main service loop"""
        logger.info("🚀 Premium Signal Service main loop started")
        
        try:
            while self.is_running:
                # Update metrics every 5 minutes
                await self.update_real_time_metrics()
                
                # Sleep for 5 minutes
                await asyncio.sleep(300)
                
        except KeyboardInterrupt:
            logger.info("🛑 Service shutdown requested")
            await self.shutdown_service()
        except Exception as e:
            logger.error(f"❌ Critical error in service loop: {e}")
            await self.shutdown_service()
    
    async def update_real_time_metrics(self):
        """Update real-time service metrics"""
        try:
            # Update subscriber count
            overview = self.subscription_manager.get_subscription_overview()
            self.metrics['active_subscribers'] = overview['total_active_subscribers']
            self.metrics['current_arr'] = overview['total_arr']
            
            # Update daily signal count
            # This would be updated by the scheduled signal generation
            
        except Exception as e:
            logger.error(f"❌ Error updating metrics: {e}")
    
    async def shutdown_service(self):
        """Gracefully shutdown the service"""
        logger.info("🛑 Shutting down Premium Signal Service...")
        
        self.is_running = False
        
        # Save final metrics
        final_status = self.get_system_status()
        logger.info(f"📊 Final Status: {json.dumps(final_status, indent=2, default=str)}")
        
        logger.info("✅ Premium Signal Service shutdown complete")

async def main():
    """Main entry point"""
    service = PremiumSignalService()
    
    try:
        # Initialize the complete system
        await service.initialize_system()
        
        # Run the service
        await service.run_service()
        
    except Exception as e:
        logger.error(f"❌ Service failed to start: {e}")
        raise

if __name__ == "__main__":
    print("""
    ╔══════════════════════════════════════════════════════════════════════════════╗
    ║                                                                              ║
    ║               🚀 PREMIUM AI-POWERED TRADING SIGNAL SERVICE 🚀                ║
    ║                                                                              ║
    ║                     Target: $500K - $2M ARR Generation                      ║
    ║                                                                              ║
    ║  🎯 Multi-Asset Coverage    📱 Multi-Channel Delivery    🔒 SEBI Compliant  ║
    ║  📊 Real-Time Analytics     💎 Premium Features         🚀 Enterprise API   ║
    ║                                                                              ║
    ╚══════════════════════════════════════════════════════════════════════════════╝
    """)
    
    # Run the service
    asyncio.run(main())