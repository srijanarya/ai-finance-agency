#!/usr/bin/env python3
"""
Automated Social Media Manager for TREUM AI
=============================================
Fully autonomous social media management system
Runs 24/7 without manual intervention
"""

import os
import time
import json
import sqlite3
import random
import schedule
import threading
import logging
from datetime import datetime, timedelta
from typing import Dict, List
import tweepy
import telegram
import openai
import yfinance as yf
import feedparser
from dotenv import load_dotenv

from database_helper import get_db_connection, get_redis_client, cache_get, cache_set


# Import our systems
from content_quality_system import ContentQualitySystem
from centralized_posting_queue import posting_queue, Platform, Priority
from content_variety_enhancer import ContentVarietyEnhancer
from smart_engagement_system import SmartEngagementSystem
# from realtime_news_telegram_queue import RealtimeNewsMonitor

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('social_media_manager.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AutomatedSocialMediaManager:
    """Complete automated social media management"""
    
    def __init__(self):
        logger.info("🚀 Initializing Automated Social Media Manager...")
        
        # Load all credentials
        self.load_credentials()
        
        # Initialize subsystems
        self.quality_system = ContentQualitySystem()
        self.variety_enhancer = ContentVarietyEnhancer()
        self.engagement_system = SmartEngagementSystem()
        # self.news_monitor = RealtimeNewsMonitor()
        
        # Strategy configuration
        self.strategy = self.load_strategy()
        
        # Stats tracking
        self.db_path = 'automated_manager.db'
        self.init_database()
        
        logger.info("✅ Automated Social Media Manager Ready!")
    
    def load_credentials(self):
        """Load all API credentials from environment"""
        self.creds = {
            'openai_key': os.getenv('OPENAI_API_KEY'),
            'linkedin_token': os.getenv('LINKEDIN_ACCESS_TOKEN'),
            'twitter_key': os.getenv('TWITTER_CONSUMER_KEY'),
            'twitter_secret': os.getenv('TWITTER_CONSUMER_SECRET'),
            'twitter_access': os.getenv('TWITTER_ACCESS_TOKEN'),
            'twitter_access_secret': os.getenv('TWITTER_ACCESS_TOKEN_SECRET'),
            'telegram_token': os.getenv('TELEGRAM_BOT_TOKEN'),
            'telegram_channel': os.getenv('TELEGRAM_CHANNEL_ID')
        }
        
        # Set OpenAI key
        if self.creds['openai_key']:
            openai.api_key = self.creds['openai_key']
    
    def load_strategy(self) -> Dict:
        """Load automated posting strategy"""
        return {
            'posting_schedule': {
                'linkedin': ['09:00', '14:00', '19:00'],  # 3 times daily
                'twitter': ['08:00', '11:00', '14:00', '17:00', '20:00'],  # 5 times daily
                'telegram': ['07:00', '10:00', '13:00', '16:00', '19:00', '22:00']  # 6 times daily
            },
            'content_mix': {
                'market_analysis': 0.30,  # 30%
                'educational': 0.25,      # 25%
                'news_based': 0.20,       # 20%
                'trading_tips': 0.15,     # 15%
                'success_stories': 0.10   # 10%
            },
            'engagement_targets': {
                'linkedin': {
                    'daily_replies': 20,
                    'target_hashtags': ['#indianstockmarket', '#nifty50', '#investing'],
                    'influencer_engagement': 5
                },
                'twitter': {
                    'daily_replies': 40,
                    'target_hashtags': ['#Nifty', '#Sensex', '#StockMarketIndia'],
                    'retweets_with_comment': 10
                }
            },
            'telegram_groups': [
                'Stock Market India',
                'Nifty Traders',
                'Investment Ideas India',
                'Options Trading India',
                'Finance News India'
            ],
            'growth_targets': {
                'linkedin_monthly': 500,  # 500 new followers/month
                'twitter_monthly': 1000,   # 1000 new followers/month
                'telegram_monthly': 750    # 750 new subscribers/month
            }
        }
    
    def init_database(self):
        """Initialize tracking database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS automation_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT NOT NULL,
                platform TEXT,
                details TEXT,
                success BOOLEAN,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS performance_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE NOT NULL,
                platform TEXT NOT NULL,
                posts_created INTEGER DEFAULT 0,
                engagements_made INTEGER DEFAULT 0,
                new_followers INTEGER DEFAULT 0,
                total_reach INTEGER DEFAULT 0,
                UNIQUE(date, platform)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def log_action(self, action: str, platform: str = None, details: str = None, success: bool = True):
        """Log automation actions"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO automation_log (action, platform, details, success)
            VALUES (?, ?, ?, ?)
        ''', (action, platform, details, success))
        
        conn.commit()
        conn.close()
        
        status = "✅" if success else "❌"
        logger.info(f"{status} {action} - {platform or 'All'} - {details or ''}")
    
    def create_content_for_platform(self, platform: str, content_type: str = None):
        """Create content for specific platform"""
        try:
            # Get content type based on strategy mix
            if not content_type:
                content_type = self.select_content_type()
            
            # Get variety suggestions
            variety = self.variety_enhancer.get_content_suggestions()
            
            # Create content using quality system
            result = self.quality_system.create_content(
                platform=platform,
                content_type=content_type,
                variety_hints=variety
            )
            
            if result.get('success'):
                # Add to posting queue
                queue_result = posting_queue.add_to_queue(
                    content=result['content'],
                    platform=platform,
                    priority=Priority.NORMAL,
                    source='automated_manager',
                    metadata={
                        'content_type': content_type,
                        'quality_score': result.get('quality_score', 0)
                    }
                )
                
                self.log_action(
                    f"Content created: {content_type}",
                    platform,
                    f"Score: {result.get('quality_score', 0)}/10",
                    True
                )
                
                return True
            
        except Exception as e:
            self.log_action(f"Content creation failed", platform, str(e), False)
            
        return False
    
    def select_content_type(self) -> str:
        """Select content type based on strategy mix"""
        types = []
        weights = []
        
        for content_type, weight in self.strategy['content_mix'].items():
            types.append(content_type)
            weights.append(weight)
        
        return random.choices(types, weights=weights)[0]
    
    def post_scheduled_content(self, platform: str):
        """Post content at scheduled time"""
        logger.info(f"⏰ Scheduled posting for {platform}")
        
        # Create fresh content
        self.create_content_for_platform(platform)
        
        # Process queue for this platform
        result = posting_queue.process_queue(
            platform=platform,
            max_items=1
        )
        
        if result['successful'] > 0:
            self.log_action(f"Scheduled post published", platform, None, True)
            self.update_metrics(platform, 'posts_created', 1)
    
    def engage_with_posts(self, platform: str):
        """Engage with posts on platform"""
        try:
            daily_limit = self.strategy['engagement_targets'][platform]['daily_replies']
            
            # Get today's engagement count
            today_count = self.get_today_engagements(platform)
            
            if today_count >= daily_limit:
                logger.info(f"Daily engagement limit reached for {platform}")
                return
            
            # Find and engage with posts
            targets = self.engagement_system.find_engagement_targets(
                platform, 
                limit=min(5, daily_limit - today_count)
            )
            
            engaged = 0
            for target in targets:
                reply = self.engagement_system.generate_smart_reply(target)
                if reply:
                    success = self.engagement_system.post_reply(target, reply)
                    if success:
                        engaged += 1
                        self.log_action(
                            f"Engaged with post",
                            platform,
                            f"Author: {target.author}",
                            True
                        )
                        
                        # Wait between engagements
                        time.sleep(random.randint(60, 180))
            
            self.update_metrics(platform, 'engagements_made', engaged)
            
        except Exception as e:
            self.log_action(f"Engagement failed", platform, str(e), False)
    
    def analyze_and_create_from_news(self):
        """Analyze news and create content"""
        try:
            # Get latest news from feeds
            news_items = self.fetch_news_from_feeds()
            
            # Filter high-relevance news
            relevant_news = [n for n in news_items if n.get('relevance', 0) > 0.7]
            
            if relevant_news:
                # Create content from top news
                for news in relevant_news[:3]:
                    for platform in ['twitter', 'linkedin', 'telegram']:
                        content = self.create_news_based_content(news, platform)
                        if content:
                            posting_queue.add_to_queue(
                                content=content,
                                platform=platform,
                                priority=Priority.HIGH,
                                source='news_analysis'
                            )
                
                self.log_action(
                    f"News analyzed and content created",
                    "All",
                    f"{len(relevant_news)} news items processed",
                    True
                )
        
        except Exception as e:
            self.log_action("News analysis failed", None, str(e), False)
    
    def fetch_news_from_feeds(self) -> List[Dict]:
        """Fetch news from RSS feeds"""
        news_items = []
        feeds = [
            'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
            'https://www.moneycontrol.com/rss/marketreports.xml'
        ]
        
        for feed_url in feeds:
            try:
                feed = feedparser.parse(feed_url)
                for entry in feed.entries[:3]:
                    news_items.append({
                        'title': entry.get('title', ''),
                        'summary': entry.get('summary', ''),
                        'link': entry.get('link', ''),
                        'relevance': 0.8  # Default relevance
                    })
            except:
                pass
        
        return news_items
    
    def create_news_based_content(self, news: Dict, platform: str) -> str:
        """Create platform-specific content from news"""
        try:
            prompt = f"""
            Create {platform} content based on this financial news:
            
            Headline: {news.get('title', '')}
            Summary: {news.get('summary', '')}
            
            Requirements:
            - Professional tone
            - Add market insights
            - Include actionable takeaway
            - Relevant hashtags
            - Platform-appropriate length
            
            Content:
            """
            
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=300
            )
            
            return response.choices[0].message.content.strip()
            
        except:
            return None
    
    def monitor_and_join_telegram_groups(self):
        """Monitor and join relevant Telegram groups"""
        try:
            # This would require Telegram client API
            # For now, logging the intent
            for group in self.strategy['telegram_groups']:
                self.log_action(
                    f"Telegram group monitoring",
                    "telegram",
                    f"Group: {group}",
                    True
                )
        except Exception as e:
            self.log_action("Telegram group monitoring failed", "telegram", str(e), False)
    
    def track_follower_growth(self):
        """Track follower growth across platforms"""
        metrics = {}
        
        # Would need actual API calls
        # For now, using placeholders
        metrics['linkedin'] = self.get_linkedin_followers()
        metrics['twitter'] = self.get_twitter_followers()
        metrics['telegram'] = self.get_telegram_subscribers()
        
        for platform, data in metrics.items():
            self.update_metrics(
                platform,
                'new_followers',
                data.get('new_today', 0)
            )
        
        self.log_action(
            "Follower growth tracked",
            "All",
            f"Total new: {sum(m.get('new_today', 0) for m in metrics.values())}",
            True
        )
        
        return metrics
    
    def get_linkedin_followers(self) -> Dict:
        """Get LinkedIn followers (placeholder)"""
        return {'total': 1250, 'new_today': 15}
    
    def get_twitter_followers(self) -> Dict:
        """Get Twitter followers (placeholder)"""
        return {'total': 3420, 'new_today': 45}
    
    def get_telegram_subscribers(self) -> Dict:
        """Get Telegram subscribers (placeholder)"""
        return {'total': 890, 'new_today': 22}
    
    def get_today_engagements(self, platform: str) -> int:
        """Get today's engagement count"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT COUNT(*) FROM automation_log
            WHERE platform = ? 
            AND action LIKE '%Engaged%'
            AND DATE(timestamp) = DATE('now')
        ''', (platform,))
        
        count = cursor.fetchone()[0]
        conn.close()
        
        return count
    
    def update_metrics(self, platform: str, metric: str, value: int):
        """Update performance metrics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        today = datetime.now().date()
        
        # Insert or update
        cursor.execute(f'''
            INSERT INTO performance_metrics (date, platform, {metric})
            VALUES (?, ?, ?)
            ON CONFLICT(date, platform) 
            DO UPDATE SET {metric} = {metric} + ?
        ''', (today, platform, value, value))
        
        conn.commit()
        conn.close()
    
    def generate_daily_report(self):
        """Generate daily performance report"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get today's metrics
        cursor.execute('''
            SELECT platform, 
                   SUM(posts_created) as posts,
                   SUM(engagements_made) as engagements,
                   SUM(new_followers) as followers
            FROM performance_metrics
            WHERE date = DATE('now')
            GROUP BY platform
        ''')
        
        report = "📊 DAILY AUTOMATION REPORT\n"
        report += "="*40 + "\n\n"
        
        total_posts = 0
        total_engagements = 0
        total_followers = 0
        
        for row in cursor.fetchall():
            platform, posts, engagements, followers = row
            total_posts += posts or 0
            total_engagements += engagements or 0
            total_followers += followers or 0
            
            report += f"📱 {platform.upper()}\n"
            report += f"  Posts: {posts or 0}\n"
            report += f"  Engagements: {engagements or 0}\n"
            report += f"  New Followers: {followers or 0}\n\n"
        
        report += f"📈 TOTALS\n"
        report += f"  Total Posts: {total_posts}\n"
        report += f"  Total Engagements: {total_engagements}\n"
        report += f"  Total New Followers: {total_followers}\n"
        
        conn.close()
        
        logger.info(f"\n{report}")
        
        # Post report to Telegram
        if self.creds['telegram_token'] and self.creds['telegram_channel']:
            try:
                bot = telegram.Bot(token=self.creds['telegram_token'])
                bot.send_message(
                    chat_id=self.creds['telegram_channel'],
                    text=report
                )
            except:
                pass
        
        return report
    
    def setup_schedule(self):
        """Setup automated schedule"""
        logger.info("📅 Setting up automated schedule...")
        
        # Schedule content posting
        for platform, times in self.strategy['posting_schedule'].items():
            for post_time in times:
                schedule.every().day.at(post_time).do(
                    self.post_scheduled_content, platform
                )
                logger.info(f"  Scheduled {platform} post at {post_time}")
        
        # Schedule engagement sessions
        schedule.every(2).hours.do(self.engage_with_posts, 'linkedin')
        schedule.every(1).hours.do(self.engage_with_posts, 'twitter')
        
        # Schedule news analysis
        schedule.every(30).minutes.do(self.analyze_and_create_from_news)
        
        # Schedule follower tracking
        schedule.every(6).hours.do(self.track_follower_growth)
        
        # Schedule daily report
        schedule.every().day.at("23:00").do(self.generate_daily_report)
        
        # Schedule Telegram group monitoring
        schedule.every(4).hours.do(self.monitor_and_join_telegram_groups)
        
        logger.info("✅ Schedule setup complete!")
    
    def run_forever(self):
        """Run the automation forever"""
        logger.info("🚀 Starting 24/7 Automated Social Media Management")
        logger.info("="*60)
        
        # Setup schedule
        self.setup_schedule()
        
        # Initial actions
        self.track_follower_growth()
        self.analyze_and_create_from_news()
        
        # Run schedule loop
        while True:
            try:
                schedule.run_pending()
                time.sleep(30)  # Check every 30 seconds
                
            except KeyboardInterrupt:
                logger.info("🛑 Automation stopped by user")
                break
                
            except Exception as e:
                logger.error(f"Error in automation loop: {e}")
                time.sleep(60)  # Wait a minute before retrying

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🤖 AUTOMATED SOCIAL MEDIA MANAGER")
    print("="*60)
    print("\n✨ Features:")
    print("  - 24/7 Automated posting")
    print("  - Smart engagement with followers")
    print("  - News-based content creation")
    print("  - Follower growth tracking")
    print("  - Multi-platform management")
    print("  - Daily performance reports")
    print("\n" + "="*60)
    print("\n🚀 Starting automation...\n")
    
    # Create and run manager
    manager = AutomatedSocialMediaManager()
    
    # Run in separate thread for non-blocking operation
    automation_thread = threading.Thread(target=manager.run_forever)
    automation_thread.daemon = True
    automation_thread.start()
    
    print("✅ Automation running in background!")
    print("📊 Check social_media_manager.log for details")
    print("🛑 Press Ctrl+C to stop\n")
    
    try:
        automation_thread.join()
    except KeyboardInterrupt:
        print("\n👋 Automation stopped")