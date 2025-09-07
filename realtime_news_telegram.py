#!/usr/bin/env python3
"""
Real-time Financial News Monitor for Telegram
Monitors breaking news and automatically posts analysis to Telegram
"""

import os
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

load_dotenv()

class RealtimeNewsTelegram:
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
        
        # Track posted news to avoid duplicates
        self.posted_news_file = 'posted_news_history.json'
        self.load_posted_history()
        
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
    
    def load_posted_history(self):
        """Load history of posted news"""
        if os.path.exists(self.posted_news_file):
            with open(self.posted_news_file, 'r') as f:
                self.posted_news = json.load(f)
        else:
            self.posted_news = {'hashes': [], 'last_check': None}
    
    def save_posted_history(self):
        """Save posted news history"""
        with open(self.posted_news_file, 'w') as f:
            json.dump(self.posted_news, f, indent=2)
    
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
                    
                    # Skip if already posted
                    if news_hash in self.posted_news['hashes']:
                        continue
                    
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
                    {"role": "system", "content": "You are a top financial analyst providing instant market analysis."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=400
            )
            
            analysis = response.choices[0].message.content.strip()
            
            # Add source link
            analysis += f"\n\n🔗 Source: {news['link'][:50]}..."
            analysis += "\n\n📲 @AIFinanceNews2024"
            
            return analysis
            
        except Exception as e:
            print(f"❌ Error generating analysis: {e}")
            # Fallback to simple format
            return f"""📰 BREAKING: {news['title']}

{news['summary'][:200]}...

🔗 Read more: {news['link'][:50]}...

📲 @AIFinanceNews2024
#IndianMarkets #StockMarket"""
    
    def post_to_telegram(self, content: str, news: Dict) -> bool:
        """Post analysis to Telegram channel"""
        url = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
        
        # Add urgency indicators for breaking news
        if news['category'] == 'breaking':
            content = "🚨 BREAKING NEWS 🚨\n\n" + content
        elif news['category'] == 'market_move':
            content = "📈 MARKET ALERT 📈\n\n" + content
        
        payload = {
            'chat_id': self.channel_id,
            'text': content[:4096],
            'parse_mode': 'HTML',
            'disable_web_page_preview': False
        }
        
        try:
            response = requests.post(url, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('ok'):
                    print(f"✅ Posted to Telegram: {news['title'][:50]}...")
                    
                    # Mark as posted
                    self.posted_news['hashes'].append(news['hash'])
                    # Keep only last 1000 hashes
                    if len(self.posted_news['hashes']) > 1000:
                        self.posted_news['hashes'] = self.posted_news['hashes'][-1000:]
                    
                    self.save_posted_history()
                    return True
        
        except Exception as e:
            print(f"❌ Telegram post failed: {e}")
        
        return False
    
    def check_and_post_news(self):
        """Main function to check news and post"""
        print(f"\n🔍 Checking for breaking news at {datetime.now().strftime('%H:%M:%S')}...")
        
        # Fetch latest news
        latest_news = self.fetch_latest_news()
        
        if not latest_news:
            print("📭 No new relevant news found")
            return
        
        print(f"📬 Found {len(latest_news)} new items")
        
        # Process and post each news item
        posted_count = 0
        for news in latest_news[:3]:  # Limit to 3 posts per check
            print(f"\n📝 Processing: {news['title'][:60]}...")
            
            # Generate analysis
            analysis = self.generate_analysis(news)
            
            # Post to Telegram
            if self.post_to_telegram(analysis, news):
                posted_count += 1
                time.sleep(5)  # Wait between posts
        
        if posted_count > 0:
            print(f"\n✅ Posted {posted_count} news updates to Telegram!")
        
        # Update last check time
        self.posted_news['last_check'] = datetime.now().isoformat()
        self.save_posted_history()
    
    def run_continuous(self):
        """Run continuous monitoring"""
        print("=" * 60)
        print("🚀 REALTIME NEWS MONITOR FOR TELEGRAM")
        print("=" * 60)
        print(f"Channel: {self.channel_id}")
        print(f"Monitoring {len(self.news_sources)} news sources")
        print("Checking every 5 minutes for breaking news...")
        print("-" * 60)
        
        # Initial check
        self.check_and_post_news()
        
        # Schedule regular checks
        schedule.every(5).minutes.do(self.check_and_post_news)
        
        # Run scheduler
        while True:
            schedule.run_pending()
            time.sleep(30)
    
    def run_once(self):
        """Run a single check (for testing)"""
        print("=" * 60)
        print("🚀 REALTIME NEWS TELEGRAM - TEST RUN")
        print("=" * 60)
        
        self.check_and_post_news()
        
        print("\n✅ Test complete!")


def main():
    """Main execution"""
    monitor = RealtimeNewsTelegram()
    
    # Check if running in GitHub Actions
    if os.getenv('GITHUB_ACTIONS'):
        print("Running in GitHub Actions - Single check mode")
        monitor.run_once()
    else:
        print("Running in continuous monitoring mode")
        print("Press Ctrl+C to stop")
        try:
            monitor.run_continuous()
        except KeyboardInterrupt:
            print("\n\n👋 Monitoring stopped")


if __name__ == "__main__":
    main()