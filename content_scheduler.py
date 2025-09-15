#!/usr/bin/env python3
"""
Content Scheduler - Automated posting at scheduled times
Manages posting frequency and content distribution
"""

import os
import sys
import json
import time
import schedule
from datetime import datetime, timedelta
from automated_posting_system import AutomatedPostingSystem
import random

class ContentScheduler:
    def __init__(self):
        self.posting_system = AutomatedPostingSystem()
        self.content_topics = [
            "Market Opening Analysis",
            "Tech Stock Updates", 
            "Crypto Market Trends",
            "Economic Indicators",
            "Trading Strategies",
            "Investment Tips",
            "Financial News Digest",
            "Portfolio Management",
            "Risk Assessment",
            "Market Closing Summary"
        ]
        
        # Posting schedule (IST times)
        self.schedule_times = [
            "09:00",  # Market opening
            "11:30",  # Mid-morning update
            "14:00",  # Afternoon analysis
            "16:30",  # Market closing
            "19:00"   # Evening wrap-up
        ]
        
        self.daily_post_count = 0
        self.daily_limit = 15  # Conservative daily limit
        
    def generate_scheduled_content(self, time_slot):
        """Generate content based on time of day"""
        hour = datetime.now().hour
        
        if hour < 10:
            topic = "Market Opening Analysis"
            content = f"""📈 Good Morning! Market Opening Update - {datetime.now().strftime('%d %b')}

Indian markets open with positive sentiment. Key sectors showing strength: IT, Banking, Pharma.

Nifty50 outlook remains bullish above 19,500 levels.

#StockMarket #Nifty50 #Trading #AIFinance"""
            
        elif hour < 14:
            topic = random.choice(["Tech Stock Updates", "Sector Analysis", "Trading Strategies"])
            content = f"""💡 Midday Market Insight - {topic}

Technical analysis suggests key support levels holding strong. 
Watch for breakout opportunities in select mid-cap stocks.

Stay informed with AI-powered analysis!

#TechnicalAnalysis #StockTips #AIFinance"""
            
        elif hour < 17:
            topic = "Afternoon Market Review"
            content = f"""📊 Afternoon Update - Market Momentum Continues

Markets maintaining gains despite global volatility.
FII activity remains positive. Retail participation increasing.

Smart money movement detected in select sectors.

#MarketUpdate #Investment #AIFinance"""
            
        else:
            topic = "Market Closing Summary"
            content = f"""🔔 Market Close - {datetime.now().strftime('%d %b')}

Today's top gainers across sectors showed strong momentum.
Tomorrow's watchlist prepared with AI analysis.

Follow for pre-market insights tomorrow morning!

#MarketClose #StockMarket #AIFinance"""
        
        return content
    
    def post_scheduled_content(self):
        """Post content at scheduled time"""
        if self.daily_post_count >= self.daily_limit:
            print(f"⚠️ Daily limit reached ({self.daily_limit} posts)")
            return
        
        try:
            # Generate content for current time slot
            content = self.generate_scheduled_content(datetime.now().strftime('%H:%M'))
            
            print(f"\n⏰ Scheduled Post at {datetime.now().strftime('%H:%M:%S')}")
            
            # Post to all platforms
            result = self.posting_system.post_to_all_platforms(content)
            
            if result:
                self.daily_post_count += 1
                print(f"📈 Daily posts: {self.daily_post_count}/{self.daily_limit}")
                
                # Log scheduled post
                self.log_scheduled_post(result)
                
        except Exception as e:
            print(f"❌ Scheduled posting error: {e}")
    
    def log_scheduled_post(self, result):
        """Log scheduled posts to file"""
        log_file = 'data/scheduled_posts_log.json'
        
        try:
            if os.path.exists(log_file):
                with open(log_file, 'r') as f:
                    logs = json.load(f)
            else:
                logs = []
            
            logs.append({
                'timestamp': datetime.now().isoformat(),
                'post_number': self.daily_post_count,
                'result': result
            })
            
            # Keep only last 100 entries
            logs = logs[-100:]
            
            with open(log_file, 'w') as f:
                json.dump(logs, f, indent=2)
                
        except Exception as e:
            print(f"⚠️ Logging error: {e}")
    
    def reset_daily_counter(self):
        """Reset daily post counter at midnight"""
        self.daily_post_count = 0
        print(f"🔄 Daily counter reset at {datetime.now()}")
    
    def setup_schedule(self):
        """Setup posting schedule"""
        print("📅 Setting up posting schedule...")
        
        # Schedule posts at specific times
        for time_slot in self.schedule_times:
            schedule.every().day.at(time_slot).do(self.post_scheduled_content)
            print(f"  ✅ Scheduled post at {time_slot}")
        
        # Reset counter at midnight
        schedule.every().day.at("00:00").do(self.reset_daily_counter)
        
        print(f"\n📊 Schedule configured:")
        print(f"  • {len(self.schedule_times)} posts per day")
        print(f"  • Daily limit: {self.daily_limit} posts")
        print(f"  • Times: {', '.join(self.schedule_times)}")
    
    def run_scheduler(self):
        """Run the scheduler continuously"""
        print("\n🚀 Content Scheduler Started")
        print("="*60)
        
        self.setup_schedule()
        
        print("\n⏳ Scheduler running... (Press Ctrl+C to stop)")
        print(f"Next post: {self.get_next_post_time()}")
        
        while True:
            try:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
                
            except KeyboardInterrupt:
                print("\n\n⏹️ Scheduler stopped by user")
                break
            except Exception as e:
                print(f"❌ Scheduler error: {e}")
                time.sleep(60)
    
    def get_next_post_time(self):
        """Get time until next scheduled post"""
        now = datetime.now()
        current_time = now.strftime('%H:%M')
        
        for scheduled_time in self.schedule_times:
            if scheduled_time > current_time:
                return f"Today at {scheduled_time}"
        
        # Next post is tomorrow
        return f"Tomorrow at {self.schedule_times[0]}"
    
    def test_scheduler(self):
        """Test the scheduler with immediate post"""
        print("\n🧪 Testing scheduler with immediate post...")
        self.post_scheduled_content()

def main():
    """Main execution"""
    scheduler = ContentScheduler()
    
    print("🤖 AI Finance Agency - Content Scheduler")
    print("="*60)
    
    if len(sys.argv) > 1 and sys.argv[1] == '--test':
        # Test mode - post immediately
        scheduler.test_scheduler()
    else:
        # Production mode - run scheduler
        print("\nOptions:")
        print("1. Run scheduler (continuous)")
        print("2. Test post (immediate)")
        print("3. View schedule")
        
        choice = input("\nSelect option (1-3): ").strip()
        
        if choice == '1':
            scheduler.run_scheduler()
        elif choice == '2':
            scheduler.test_scheduler()
        elif choice == '3':
            scheduler.setup_schedule()
            print(f"\nNext post: {scheduler.get_next_post_time()}")
        else:
            print("Invalid option")

if __name__ == "__main__":
    main()