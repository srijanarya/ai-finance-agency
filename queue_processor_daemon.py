#!/usr/bin/env python3
"""
Queue Processor Daemon
Automatically processes the centralized posting queue at regular intervals
"""

import time
import schedule
import logging
from datetime import datetime
from centralized_posting_queue import posting_queue
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('queue_processor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class QueueProcessorDaemon:
    """Daemon that automatically processes the posting queue"""
    
    def __init__(self):
        self.queue = posting_queue
        self.is_running = False
        
    def process_queue_job(self):
        """Job function for processing queue"""
        logger.info("🔄 Starting scheduled queue processing...")
        
        try:
            # Get current status
            status = self.queue.get_queue_status()
            pending_count = status['queue_counts'].get('pending', 0)
            approved_count = status['queue_counts'].get('approved', 0)
            
            if pending_count == 0 and approved_count == 0:
                logger.info("📭 No items in queue to process")
                return
            
            logger.info(f"📋 Queue status: {pending_count} pending, {approved_count} approved")
            
            # Process up to 5 items
            max_items = min(5, pending_count + approved_count)
            results = self.queue.process_queue(max_items)
            
            # Log results
            logger.info(f"✅ Queue processing complete:")
            logger.info(f"   Processed: {results['processed']}")
            logger.info(f"   Posted: {results['successful']}")
            logger.info(f"   Failed: {results['failed']}")
            logger.info(f"   Skipped: {results['skipped']}")
            
            # Show details for failed items
            if results['failed'] > 0:
                for detail in results['details']:
                    if not detail['success'] and 'Too soon' not in detail['message'] and 'limit exceeded' not in detail['message']:
                        logger.error(f"❌ Failed {detail['item_id']}: {detail['message']}")
            
            # Cleanup old items periodically (every hour)
            current_minute = datetime.now().minute
            if current_minute == 0:  # Top of the hour
                cleaned = self.queue.cleanup_old_items(days_old=1)
                if cleaned > 0:
                    logger.info(f"🗑️ Cleaned up {cleaned} old queue items")
                    
        except Exception as e:
            logger.error(f"❌ Queue processing error: {e}")
    
    def health_check_job(self):
        """Perform health check on queue system"""
        try:
            status = self.queue.get_queue_status()
            
            # Check for stuck items (pending for too long)
            failed_count = status['queue_counts'].get('failed', 0)
            if failed_count > 10:
                logger.warning(f"⚠️ High number of failed items: {failed_count}")
            
            # Check duplicate prevention stats
            dup_stats = status['duplicate_stats']
            if dup_stats['duplicates_prevented'] > 0:
                logger.info(f"🛡️ Prevented {dup_stats['duplicates_prevented']} duplicates so far")
            
            # Log rate limit status
            for platform, limits in status['rate_limits'].items():
                if not limits['hourly_ok'] or not limits['daily_ok']:
                    logger.warning(f"⚠️ Rate limit reached for {platform}: hourly {limits['hourly_count']}/{limits['hourly_limit']}, daily {limits['daily_count']}/{limits['daily_limit']}")
                    
        except Exception as e:
            logger.error(f"❌ Health check error: {e}")
    
    def run(self):
        """Run the daemon with scheduled jobs"""
        logger.info("="*60)
        logger.info("🤖 QUEUE PROCESSOR DAEMON STARTING")
        logger.info("="*60)
        logger.info(f"Start time: {datetime.now()}")
        logger.info("Schedule:")
        logger.info("  • Queue processing: Every 10 minutes")
        logger.info("  • Health check: Every 30 minutes")
        logger.info("  • Cleanup: Every hour (at :00 minutes)")
        logger.info("="*60)
        
        # Schedule jobs
        schedule.every(10).minutes.do(self.process_queue_job)
        schedule.every(30).minutes.do(self.health_check_job)
        
        # Initial health check
        self.health_check_job()
        
        # Initial queue processing
        self.process_queue_job()
        
        # Main loop
        self.is_running = True
        try:
            while self.is_running:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
                
        except KeyboardInterrupt:
            logger.info("🛑 Daemon stopped by user")
        except Exception as e:
            logger.error(f"💥 Daemon crashed: {e}")
        finally:
            self.is_running = False
            logger.info("🔚 Queue processor daemon stopped")
    
    def stop(self):
        """Stop the daemon"""
        self.is_running = False
        
    def process_now(self):
        """Process queue immediately (for testing)"""
        logger.info("🚀 Manual queue processing triggered")
        self.process_queue_job()

def main():
    """Main function"""
    import sys
    
    daemon = QueueProcessorDaemon()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == 'process':
            # Process queue once and exit
            daemon.process_now()
        elif command == 'status':
            # Show queue status
            status = daemon.queue.get_queue_status()
            print(f"\n📊 Queue Status:")
            print(f"   Pending: {status['queue_counts'].get('pending', 0)}")
            print(f"   Approved: {status['queue_counts'].get('approved', 0)}")
            print(f"   Posted: {status['queue_counts'].get('posted', 0)}")
            print(f"   Failed: {status['queue_counts'].get('failed', 0)}")
            print(f"   Duplicates Prevented: {status['duplicate_stats']['duplicates_prevented']}")
            
            # Show rate limits
            print(f"\n📈 Rate Limits:")
            for platform, limits in status['rate_limits'].items():
                print(f"   {platform.title()}: {limits['hourly_count']}/{limits['hourly_limit']} hourly, {limits['daily_count']}/{limits['daily_limit']} daily")
                
            # Show recent posts
            print(f"\n📋 Recent Posts:")
            for post in status['recent_posts'][:5]:
                posted_time = post['posted_at'].split('T')[1].split('.')[0] if 'T' in post['posted_at'] else post['posted_at']
                print(f"   • {post['platform'].upper()} at {posted_time} ({post['source']})")
                
        elif command == 'cleanup':
            # Clean up old items
            days_old = int(sys.argv[2]) if len(sys.argv) > 2 else 7
            cleaned = daemon.queue.cleanup_old_items(days_old)
            print(f"🗑️ Cleaned up {cleaned} items older than {days_old} days")
        
        elif command == 'health':
            # Run health check
            daemon.health_check_job()
            print("✅ Health check complete")
            
        else:
            print("Usage: python queue_processor_daemon.py [process|status|cleanup|health]")
            print("       python queue_processor_daemon.py cleanup [days_old]")
            print("       python queue_processor_daemon.py  # (run daemon)")
    else:
        # Run as daemon
        daemon.run()

if __name__ == "__main__":
    main()