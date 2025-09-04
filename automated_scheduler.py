#!/usr/bin/env python3
"""
Automated Content Scheduler
Runs market-powered content generation on schedule
"""

import schedule
import time
import asyncio
import threading
from datetime import datetime
import subprocess
import logging
import json
from market_content_generator import MarketContentGenerator

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scheduler.log'),
        logging.StreamHandler()
    ]
)

class AutomatedScheduler:
    """Automated content generation scheduler"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.generator = MarketContentGenerator()
        self.is_running = False
        
    def generate_content_sync(self):
        """Synchronous wrapper for async content generation"""
        try:
            self.logger.info("🚀 Starting scheduled content generation...")
            
            # Run async function in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            content = loop.run_until_complete(self.generator.generate_market_content())
            
            # Log results
            total_reach = sum(
                item['result'].get('distribution', {}).get('total_reach', 0) 
                for item in content
            )
            
            self.logger.info(f"✅ Generated {len(content)} pieces, reach: {total_reach:,}")
            
            loop.close()
            
        except Exception as e:
            self.logger.error(f"❌ Scheduled generation failed: {e}")
    
    def setup_schedule(self):
        """Set up the content generation schedule"""
        
        # Morning brief - 7:00 AM
        schedule.every().day.at("07:00").do(
            self.generate_content_sync
        ).tag('morning')
        
        # Pre-market analysis - 9:00 AM
        schedule.every().day.at("09:00").do(
            self.generate_content_sync
        ).tag('pre_market')
        
        # Market opening update - 9:30 AM
        schedule.every().day.at("09:30").do(
            self.generate_content_sync
        ).tag('market_open')
        
        # Mid-day analysis - 12:30 PM
        schedule.every().day.at("12:30").do(
            self.generate_content_sync
        ).tag('midday')
        
        # Market closing update - 3:45 PM
        schedule.every().day.at("15:45").do(
            self.generate_content_sync
        ).tag('market_close')
        
        # Evening wrap-up - 7:00 PM
        schedule.every().day.at("19:00").do(
            self.generate_content_sync
        ).tag('evening')
        
        # Weekend special content - Saturday 10:00 AM
        schedule.every().saturday.at("10:00").do(
            self.generate_weekend_content
        ).tag('weekend')
        
        self.logger.info("📅 Schedule configured:")
        self.logger.info("   7:00 AM - Morning Brief")
        self.logger.info("   9:00 AM - Pre-market Analysis")
        self.logger.info("   9:30 AM - Market Opening")
        self.logger.info("   12:30 PM - Mid-day Update")
        self.logger.info("   3:45 PM - Market Closing")
        self.logger.info("   7:00 PM - Evening Wrap")
        self.logger.info("   Saturday 10:00 AM - Weekend Special")
    
    def generate_weekend_content(self):
        """Generate weekend special content"""
        try:
            self.logger.info("📈 Generating weekend special content...")
            
            # Generate weekly market recap and next week outlook
            subprocess.run([
                'python3', 'generate_bulk_content.sh'
            ], check=True)
            
            self.logger.info("✅ Weekend content generated")
            
        except Exception as e:
            self.logger.error(f"❌ Weekend content failed: {e}")
    
    def run_scheduler(self):
        """Run the scheduler continuously"""
        self.is_running = True
        self.logger.info("🔄 Scheduler started - running continuously...")
        
        while self.is_running:
            try:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
                
            except KeyboardInterrupt:
                self.logger.info("⏹️ Scheduler stopped by user")
                self.is_running = False
                break
            except Exception as e:
                self.logger.error(f"❌ Scheduler error: {e}")
                time.sleep(300)  # Wait 5 minutes on error
    
    def start_background(self):
        """Start scheduler in background thread"""
        scheduler_thread = threading.Thread(target=self.run_scheduler, daemon=True)
        scheduler_thread.start()
        self.logger.info("🌟 Scheduler started in background")
        return scheduler_thread
    
    def stop_scheduler(self):
        """Stop the scheduler"""
        self.is_running = False
        self.logger.info("🛑 Scheduler stopping...")
    
    def get_next_jobs(self):
        """Get next scheduled jobs"""
        jobs = []
        for job in schedule.jobs:
            jobs.append({
                'time': str(job.next_run),
                'function': job.job_func.__name__,
                'tags': list(job.tags)
            })
        return jobs

def start_scheduler_service():
    """Start scheduler as a service"""
    print("🚀 AUTOMATED CONTENT SCHEDULER")
    print("=" * 50)
    
    scheduler = AutomatedScheduler()
    scheduler.setup_schedule()
    
    # Show next jobs
    print("\n📅 Upcoming Jobs:")
    for job in scheduler.get_next_jobs()[:5]:
        print(f"   {job['time']} - {job['function']} ({', '.join(job['tags'])})")
    
    print(f"\n⚡ Starting continuous scheduler...")
    print("Press Ctrl+C to stop")
    
    try:
        scheduler.run_scheduler()
    except KeyboardInterrupt:
        print("\n👋 Scheduler stopped")
    
    return scheduler

def run_test_generation():
    """Run a test generation immediately"""
    print("🧪 Running test content generation...")
    
    scheduler = AutomatedScheduler()
    scheduler.generate_content_sync()
    
    print("✅ Test complete")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        run_test_generation()
    else:
        start_scheduler_service()