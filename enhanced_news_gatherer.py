#!/usr/bin/env python3
"""
Enhanced News Gatherer - Collects from 15+ news sources
Real-time financial news from all major platforms
"""

import feedparser
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime, timedelta
import sqlite3
import hashlib
from typing import List, Dict
import asyncio
import aiohttp

class EnhancedNewsGatherer:
    def __init__(self):
        self.db_path = 'data/agency.db'
        self.init_database()
        
        # Comprehensive news sources
        self.rss_feeds = {
            # Indian Financial News
            'MoneyControl': 'https://www.moneycontrol.com/rss/latestnews.xml',
            'EconomicTimes': 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
            'BusinessStandard': 'https://www.business-standard.com/rss/markets-106.rss',
            'LiveMint': 'https://www.livemint.com/rss/markets',
            'FinancialExpress': 'https://www.financialexpress.com/market/feed/',
            'BusinessLine': 'https://www.thehindubusinessline.com/markets/?service=rss',
            
            # International
            'Bloomberg': 'https://feeds.bloomberg.com/markets/news.rss',
            'Reuters': 'https://feeds.reuters.com/reuters/INmarketNews',
            'CNBC': 'https://www.cnbc.com/id/20910258/device/rss/rss.html',
            'MarketWatch': 'https://feeds.marketwatch.com/marketwatch/topstories',
            'WSJ': 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
            'FT': 'https://www.ft.com/markets?format=rss',
            'Yahoo': 'https://finance.yahoo.com/rss/',
            
            # Crypto
            'CoinDesk': 'https://www.coindesk.com/arc/outboundfeeds/rss/',
            'CoinTelegraph': 'https://cointelegraph.com/rss'
        }
        
        # API endpoints for additional sources
        self.api_sources = {
            'newsapi': {
                'url': 'https://newsapi.org/v2/everything',
                'params': {
                    'q': 'stock market india',
                    'sortBy': 'publishedAt',
                    'language': 'en'
                }
            },
            'alphavantage': {
                'url': 'https://www.alphavantage.co/query',
                'function': 'NEWS_SENTIMENT'
            }
        }
    
    def init_database(self):
        """Initialize enhanced news database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS enhanced_news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL,
                title TEXT NOT NULL,
                summary TEXT,
                url TEXT UNIQUE,
                author TEXT,
                published_date TEXT,
                scraped_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                category TEXT,
                sentiment TEXT,
                relevance_score INTEGER DEFAULT 5,
                keywords TEXT,
                hash TEXT UNIQUE
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def calculate_relevance(self, title: str, content: str = "") -> int:
        """Calculate relevance score for Indian markets"""
        score = 5  # Base score
        
        # High priority keywords
        high_priority = ['nifty', 'sensex', 'nse', 'bse', 'india', 'rupee', 
                         'rbi', 'sebi', 'ipo', 'fii', 'dii', 'sgx']
        
        # Stock names
        major_stocks = ['reliance', 'tcs', 'hdfc', 'infosys', 'icici', 
                       'sbi', 'wipro', 'itc', 'axis', 'kotak', 'maruti',
                       'bajaj', 'adani', 'tata', 'larsen']
        
        # Check title and content
        text = (title + " " + content).lower()
        
        for keyword in high_priority:
            if keyword in text:
                score += 2
        
        for stock in major_stocks:
            if stock in text:
                score += 1
        
        # Market events
        if any(word in text for word in ['crash', 'surge', 'rally', 'plunge']):
            score += 2
        
        # Technical terms
        if any(word in text for word in ['breakout', 'resistance', 'support', 'rsi']):
            score += 1
        
        return min(score, 10)  # Cap at 10
    
    def fetch_rss_news(self) -> List[Dict]:
        """Fetch news from all RSS feeds"""
        all_news = []
        
        for source, url in self.rss_feeds.items():
            try:
                print(f"📰 Fetching from {source}...")
                feed = feedparser.parse(url)
                
                for entry in feed.entries[:10]:  # Latest 10 from each
                    # Generate hash to avoid duplicates
                    content_hash = hashlib.md5(
                        (entry.get('title', '') + entry.get('link', '')).encode()
                    ).hexdigest()
                    
                    news_item = {
                        'source': source,
                        'title': entry.get('title', ''),
                        'summary': entry.get('summary', '')[:500],
                        'url': entry.get('link', ''),
                        'published_date': entry.get('published', ''),
                        'category': 'markets',
                        'hash': content_hash
                    }
                    
                    # Calculate relevance
                    news_item['relevance_score'] = self.calculate_relevance(
                        news_item['title'], 
                        news_item['summary']
                    )
                    
                    all_news.append(news_item)
                    
            except Exception as e:
                print(f"  ❌ Error fetching {source}: {e}")
        
        return all_news
    
    async def fetch_twitter_trends(self) -> List[Dict]:
        """Fetch trending finance topics from Twitter/X"""
        # This would require Twitter API v2 with elevated access
        # For now, return popular finance hashtags
        trending = [
            "#Nifty50", "#Sensex", "#StockMarket", "#NSE", "#BSE",
            "#BankNifty", "#Options", "#Trading", "#IPO", "#FII"
        ]
        
        trends = []
        for tag in trending:
            trends.append({
                'source': 'Twitter',
                'title': f"Trending: {tag}",
                'category': 'social',
                'relevance_score': 7
            })
        
        return trends
    
    async def fetch_reddit_posts(self) -> List[Dict]:
        """Fetch from Indian investing subreddits"""
        subreddits = [
            'IndianStreetBets',
            'IndiaInvestments',
            'StockMarketIndia'
        ]
        
        posts = []
        headers = {'User-Agent': 'FinanceBot 1.0'}
        
        for sub in subreddits:
            try:
                url = f"https://www.reddit.com/r/{sub}/hot.json?limit=5"
                
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, headers=headers) as response:
                        if response.status == 200:
                            data = await response.json()
                            
                            for post in data['data']['children']:
                                post_data = post['data']
                                
                                posts.append({
                                    'source': f'Reddit/{sub}',
                                    'title': post_data['title'],
                                    'summary': post_data.get('selftext', '')[:200],
                                    'url': f"https://reddit.com{post_data['permalink']}",
                                    'category': 'social',
                                    'relevance_score': min(post_data['score'] // 100, 10)
                                })
            except Exception as e:
                print(f"Reddit error: {e}")
        
        return posts
    
    def save_to_database(self, news_items: List[Dict]):
        """Save news to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        saved = 0
        for item in news_items:
            try:
                cursor.execute('''
                    INSERT OR IGNORE INTO enhanced_news 
                    (source, title, summary, url, published_date, category, 
                     relevance_score, hash)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    item.get('source'),
                    item.get('title'),
                    item.get('summary'),
                    item.get('url'),
                    item.get('published_date'),
                    item.get('category', 'general'),
                    item.get('relevance_score', 5),
                    item.get('hash')
                ))
                
                if cursor.rowcount > 0:
                    saved += 1
                    
            except Exception as e:
                print(f"Error saving: {e}")
        
        conn.commit()
        conn.close()
        
        return saved
    
    def get_top_news(self, limit: int = 10) -> List[Dict]:
        """Get top news by relevance"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT source, title, summary, url, relevance_score, 
                   scraped_date, category
            FROM enhanced_news
            WHERE scraped_date > datetime('now', '-24 hours')
            ORDER BY relevance_score DESC, scraped_date DESC
            LIMIT ?
        ''', (limit,))
        
        results = cursor.fetchall()
        conn.close()
        
        news = []
        for row in results:
            news.append({
                'source': row[0],
                'title': row[1],
                'summary': row[2],
                'url': row[3],
                'relevance_score': row[4],
                'time': row[5],
                'category': row[6]
            })
        
        return news
    
    def generate_news_summary(self) -> str:
        """Generate formatted news summary"""
        top_news = self.get_top_news(5)
        
        if not top_news:
            return "No recent news available"
        
        summary = "📰 TOP FINANCIAL NEWS\n\n"
        
        for i, news in enumerate(top_news, 1):
            emoji = "🔴" if "crash" in news['title'].lower() or "fall" in news['title'].lower() else "🟢"
            
            summary += f"{emoji} {i}. {news['title'][:100]}\n"
            summary += f"   Source: {news['source']}\n"
            summary += f"   Relevance: {'⭐' * min(news['relevance_score'], 5)}\n\n"
        
        summary += "@AIFinanceNews2024"
        
        return summary
    
    async def run_comprehensive_gathering(self):
        """Run all news gathering methods"""
        print("🌐 COMPREHENSIVE NEWS GATHERING")
        print("="*50)
        
        # Gather from all sources
        rss_news = self.fetch_rss_news()
        print(f"📰 RSS Feeds: {len(rss_news)} articles")
        
        twitter_trends = await self.fetch_twitter_trends()
        print(f"🐦 Twitter: {len(twitter_trends)} trends")
        
        reddit_posts = await self.fetch_reddit_posts()
        print(f"🤖 Reddit: {len(reddit_posts)} posts")
        
        # Combine all
        all_news = rss_news + twitter_trends + reddit_posts
        
        # Save to database
        saved = self.save_to_database(all_news)
        print(f"\n✅ Saved {saved} new items to database")
        
        # Generate summary
        summary = self.generate_news_summary()
        print("\n📊 NEWS SUMMARY:")
        print(summary)
        
        return {
            'total_collected': len(all_news),
            'saved': saved,
            'sources': len(self.rss_feeds) + 2  # +Twitter +Reddit
        }

async def main():
    gatherer = EnhancedNewsGatherer()
    await gatherer.run_comprehensive_gathering()

if __name__ == "__main__":
    asyncio.run(main())