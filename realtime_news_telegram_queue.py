#!/usr/bin/env python3
"""
Real-time Financial News Monitor for Telegram
Now uses Centralized Posting Queue to prevent duplicates
"""

import os
import sys
import time
import json
import requests
import feedparser
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from openai import OpenAI
from dotenv import load_dotenv
import schedule
import threading
from centralized_posting_queue import posting_queue, Platform, Priority

load_dotenv()

class RealtimeNewsTelegramQueue:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.channel_id = os.getenv('TELEGRAM_CHANNEL_ID', '@AIFinanceNews2024')
        
        # News sources - Indian financial news
        self.news_sources = {
            'moneycontrol': 'https://www.moneycontrol.com/rss/latestnews.xml',
            'et_markets': 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
            'et_stocks': 'https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms',
            'business_standard': 'https://www.business-standard.com/rss/markets-106.rss',
            'livemint': 'https://www.livemint.com/rss/markets',
            'reuters_india': 'https://feeds.reuters.com/reuters/INmarketNews',
            'bloomberg': 'https://feeds.bloomberg.com/markets/news.rss'
        }
        
        # Use centralized posting queue instead of local history
        self.posting_queue = posting_queue
        
        # Categories for quick analysis
        self.news_categories = {
            'breaking': ['breaking', 'alert', 'flash', 'urgent', 'just in'],
            'earnings': ['results', 'earnings', 'profit', 'revenue', 'quarterly'],
            'market_move': ['sensex', 'nifty', 'surge', 'crash', 'rally', 'fall'],
            'rbi': ['rbi', 'reserve bank', 'policy', 'rate', 'repo'],
            'global': ['fed', 'dow', 'nasdaq', 'crude', 'gold', 'dollar'],
            'ipo': ['ipo', 'listing', 'debut', 'subscription'],
            'sector': ['banking', 'it', 'pharma', 'auto', 'realty', 'metal']
        }
    
    def is_news_duplicate(self, news_content: str) -> bool:
        """Check if news content is duplicate using centralized queue"""
        content_hash = self.posting_queue.generate_content_hash(news_content)
        return self.posting_queue.is_duplicate(content_hash, Platform.TELEGRAM.value)
    
    def queue_telegram_message(self, message: str, priority: Priority = Priority.HIGH, metadata: Dict = None) -> bool:
        """Queue message for Telegram posting through centralized queue"""
        if metadata is None:
            metadata = {}
        
        # Add source metadata
        metadata['source_type'] = 'news_monitor'
        metadata['timestamp'] = datetime.now().isoformat()
        
        result = self.posting_queue.add_to_queue(
            content=message,
            platform=Platform.TELEGRAM.value,
            priority=priority,
            source='realtime_news',
            metadata=metadata
        )
        
        if result['success']:
            print(f"📋 News queued for Telegram: {result['item_id']}")
            print(f"   Queue Position: {result['queue_position']}")
            return True
        else:
            if result.get('reason') == 'duplicate':
                print(f"⚠️ Duplicate news prevented: {result['content_hash']}")
            else:
                print(f"❌ Failed to queue news: {result['message']}")
            return False
    
    def fetch_latest_news(self) -> List[Dict]:
        """Fetch latest news from all sources"""
        all_news = []
        
        for source_name, rss_url in self.news_sources.items():
            try:
                print(f"📰 Checking {source_name}...")
                feed = feedparser.parse(rss_url)
                
                for entry in feed.entries[:5]:  # Get top 5 from each source
                    # Create unique hash for this news
                    news_hash = hashlib.md5(
                        (entry.get('title', '') + entry.get('link', '')).encode()
                    ).hexdigest()
                    
                    # Parse publication time
                    published = entry.get('published_parsed', None)
                    if published:
                        pub_time = datetime.fromtimestamp(time.mktime(published))
                        # Only consider news from last 2 hours
                        if datetime.now() - pub_time > timedelta(hours=2):
                            continue
                    
                    news_item = {
                        'title': entry.get('title', ''),
                        'summary': entry.get('summary', '')[:500],
                        'link': entry.get('link', ''),
                        'source': source_name,
                        'published': entry.get('published', ''),
                        'hash': news_hash,
                        'category': self.categorize_news(entry.get('title', ''))
                    }
                    
                    all_news.append(news_item)
                    
            except Exception as e:
                print(f"❌ Error fetching {source_name}: {e}")
        
        # Sort by importance (breaking news first)
        all_news.sort(key=lambda x: (
            x['category'] == 'breaking',
            x['category'] == 'market_move',
            x['category'] == 'earnings'
        ), reverse=True)
        
        return all_news[:10]  # Return top 10 most relevant
    
    def categorize_news(self, title: str) -> str:
        """Categorize news based on keywords"""
        title_lower = title.lower()
        
        for category, keywords in self.news_categories.items():
            for keyword in keywords:
                if keyword in title_lower:
                    return category
        
        return 'general'
    
    def calculate_urgency(self, news: Dict) -> int:
        """Calculate urgency score (1-10)"""
        score = 5  # Base score
        title_lower = news['title'].lower()
        
        # Breaking news indicators
        if any(word in title_lower for word in ['breaking', 'urgent', 'alert']):
            score += 3
        
        # Market movement indicators
        if any(word in title_lower for word in ['crash', 'surge', 'rally', 'fall']):
            score += 2
            
        # Important market indices
        if any(word in title_lower for word in ['sensex', 'nifty', 'dow', 'nasdaq']):
            score += 1
            
        # RBI/Fed related
        if any(word in title_lower for word in ['rbi', 'fed', 'rate cut', 'rate hike']):
            score += 2
        
        return min(score, 10)
    
    def generate_analysis(self, news: Dict) -> str:
        """Generate expert analysis of the news"""
        prompt = f"""You are a senior financial analyst providing instant analysis for breaking news.

NEWS: {news['title']}
SUMMARY: {news['summary']}
CATEGORY: {news['category']}
SOURCE: {news['source']}

Create a concise Telegram post with:
1. 📰 News headline (simplified)
2. 📊 Quick market impact analysis (2-3 lines)
3. 💡 What it means for investors (2-3 actionable points)
4. 🎯 Sectors/stocks affected
5. ⚡ One-line takeaway

Keep it under 280 words. Use emojis strategically.
End with relevant hashtags for Indian markets.

Make it feel urgent and actionable for retail investors."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert financial analyst specializing in Indian markets."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=400,
                temperature=0.3
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"❌ Analysis generation failed: {e}")
            return None
    
    def format_message(self, news: Dict, analysis: str, urgency: int) -> str:
        """Format final Telegram message"""
        urgency_emoji = "🔥" if urgency >= 8 else "📢" if urgency >= 6 else "📰"
        
        timestamp = datetime.now().strftime('%H:%M')
        
        message = f"""{urgency_emoji} <b>MARKET ALERT</b>

{analysis}

🔗 <a href="{news['link']}">Read Full Story</a>

🕒 {timestamp} | 📍 {news['source'].title()}

📊 Follow: @AIFinanceNews2024"""
        
        return message
    
    def check_and_post_news(self):
        """Check for new news and post analysis"""
        print(f"\n🔍 Checking for breaking financial news... ({datetime.now().strftime('%H:%M:%S')})")
        
        try:
            # Fetch latest news
            news_items = self.fetch_latest_news()
            
            if not news_items:
                print("📭 No new financial news found")
                return
            
            print(f"📰 Found {len(news_items)} potential news items")
            
            posted_count = 0
            processed_count = 0
            
            for news in news_items:
                processed_count += 1
                print(f"\n📝 Processing ({processed_count}/{len(news_items)}): {news['title'][:60]}...")
                
                # Calculate urgency
                urgency = self.calculate_urgency(news)
                
                # Skip low urgency news unless it's specifically categorized as important
                if urgency < 6 and news['category'] not in ['breaking', 'market_move', 'earnings']:
                    print(f"⏩ Skipping low urgency: {urgency}/10")
                    continue
                
                # Generate analysis
                analysis = self.generate_analysis(news)
                
                if not analysis:
                    print("❌ Analysis generation failed")
                    continue
                
                # Create final message
                message = self.format_message(news, analysis, urgency)
                
                # Check for duplicates before queuing
                if self.is_news_duplicate(message):
                    print(f"⚠️ Skipping duplicate: {news['title'][:50]}...")
                    continue
                
                # Queue for Telegram posting
                priority = Priority.URGENT if urgency >= 8 else Priority.HIGH
                metadata = {
                    'news_title': news['title'],
                    'category': news['category'],
                    'urgency': urgency,
                    'source_feed': news['source'],
                    'published': news['published'],
                    'link': news['link'],
                    'hash': news['hash']
                }
                
                if self.queue_telegram_message(message, priority, metadata):
                    posted_count += 1
                    print(f"✅ Queued: {news['title'][:50]}...")
                else:
                    print(f"❌ Failed to queue: {news['title'][:50]}...")
                
                # Brief pause between processing
                time.sleep(1)
                
                # Limit posts per check
                if posted_count >= 3:
                    print("⚠️ Reached posting limit for this cycle")
                    break
            
            # Process some items from the queue if we added news
            if posted_count > 0:
                print(f"\n🔄 Processing {min(posted_count, 3)} items from queue...")
                process_results = self.posting_queue.process_queue(max_items=min(posted_count, 3))
                print(f"   Posted: {process_results['successful']}")
                print(f"   Failed: {process_results['failed']}")
                print(f"   Skipped: {process_results['skipped']}")
                
                # Show queue status
                status = self.posting_queue.get_queue_status()
                print(f"\n📊 Queue Status: {status['queue_counts'].get('pending', 0)} pending, {status['duplicate_stats']['duplicates_prevented']} duplicates prevented")
            
            print(f"\n✅ News check complete: {posted_count} items queued from {processed_count} processed")
            
        except Exception as e:
            print(f"❌ Error in news check: {e}")
    
    def run_monitor(self):
        """Run the news monitor with centralized queue integration"""
        print("="*60)
        print("📰 REAL-TIME NEWS MONITOR - Centralized Queue Mode")
        print("="*60)
        print(f"Monitoring {len(self.news_sources)} news sources...")
        print(f"Telegram Channel: {self.channel_id}")
        print(f"Check interval: Every 5 minutes")
        print(f"Queue Dashboard: http://localhost:5001")
        print("="*60)
        
        # Schedule news checking
        schedule.every(5).minutes.do(self.check_and_post_news)
        
        # Initial check
        self.check_and_post_news()
        
        # Keep running
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
        except KeyboardInterrupt:
            print("\n🛑 News monitor stopped")
    
    def test_posting(self):
        """Test posting functionality through centralized queue"""
        test_message = f"""
🔥 <b>TEST - Market Alert</b>

<b>Headline:</b> Testing Centralized Queue System

📈 <b>Analysis:</b>
This is a test message to verify the centralized posting queue is working correctly for news alerts.

💡 <b>What it means:</b>
• Queue system is operational
• Duplicate prevention is active
• All posts now centrally managed

🎯 <b>Affected:</b> System Infrastructure

⚡ <b>Takeaway:</b> No more duplicate posts across platforms!

🕒 {datetime.now().strftime('%H:%M:%S')} | 📍 Queue System Test

📊 Follow: @AIFinanceNews2024
        """.strip()
        
        print("🧪 Testing centralized queue...")
        metadata = {'test_message': True, 'type': 'system_test'}
        if self.queue_telegram_message(test_message, Priority.URGENT, metadata):
            print("✅ Test message queued successfully!")
            print("\n🔄 Processing test message...")
            results = self.posting_queue.process_queue(max_items=1)
            if results['successful'] > 0:
                print("✅ Test message posted successfully!")
            else:
                print("❌ Test message failed to post!")
        else:
            print("❌ Test message failed to queue!")
    
    def show_queue_status(self):
        """Show current queue status"""
        status = self.posting_queue.get_queue_status()
        print(f"\n📊 Queue Status:")
        print(f"   Pending: {status['queue_counts'].get('pending', 0)}")
        print(f"   Posted: {status['queue_counts'].get('posted', 0)}")
        print(f"   Failed: {status['queue_counts'].get('failed', 0)}")
        print(f"   Duplicates Prevented: {status['duplicate_stats']['duplicates_prevented']}")
        
        # Show recent posts
        print(f"\n📋 Recent Posts:")
        for post in status['recent_posts'][:5]:
            posted_time = post['posted_at'].split('T')[1].split('.')[0] if 'T' in post['posted_at'] else post['posted_at']
            print(f"   • {post['platform'].upper()} at {posted_time} ({post['source']})")


def main():
    """Main function"""
    monitor = RealtimeNewsTelegramQueue()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == 'test':
            monitor.test_posting()
        elif sys.argv[1] == 'once':
            monitor.check_and_post_news()
        elif sys.argv[1] == 'queue-status':
            monitor.show_queue_status()
        elif sys.argv[1] == 'process':
            # Process pending items in queue
            results = monitor.posting_queue.process_queue(max_items=5)
            print(f"Processed: {results['processed']}")
            print(f"Posted: {results['successful']}")
            print(f"Failed: {results['failed']}")
            print(f"Skipped: {results['skipped']}")
        else:
            print("Usage: python realtime_news_telegram_queue.py [test|once|queue-status|process]")
    else:
        monitor.run_monitor()

if __name__ == "__main__":
    main()