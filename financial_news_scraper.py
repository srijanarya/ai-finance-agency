#!/usr/bin/env python3
"""
Financial News Scraper
Scrapes real-time news from multiple sources for trading insights
"""

import requests
from bs4 import BeautifulSoup
import feedparser
from datetime import datetime, timedelta
import json
import sqlite3
from typing import List, Dict
import re

class FinancialNewsScraper:
    def __init__(self):
        self.sources = {
            'moneycontrol': {
                'rss': 'https://www.moneycontrol.com/rss/latestnews.xml',
                'type': 'rss'
            },
            'economic_times': {
                'rss': 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
                'type': 'rss'
            },
            'livemint': {
                'rss': 'https://www.livemint.com/rss/markets',
                'type': 'rss'
            },
            'business_standard': {
                'rss': 'https://www.business-standard.com/rss/markets-106.rss',
                'type': 'rss'
            }
        }
        
        # Important Twitter accounts to follow (would need API access)
        self.twitter_accounts = [
            '@CNBCTV18Live',
            '@NDTVProfit', 
            '@bsindia',
            '@FinancialXpress',
            '@ZeeBusiness',
            '@ETMarkets',
            '@moneycontrolcom'
        ]
        
        # Telegram channels (would need Telegram API)
        self.telegram_channels = [
            'Stock Market Ajkal',
            'NSE BSE Updates',
            'Indian Stock Market News'
        ]
        
        self.db_path = "data/agency.db"
        self._init_database()
    
    def _init_database(self):
        """Initialize database for storing news"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS financial_news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                source TEXT NOT NULL,
                url TEXT,
                content TEXT,
                published_date TEXT,
                scraped_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                relevance_score INTEGER DEFAULT 0,
                trading_signal TEXT,
                stocks_mentioned TEXT,
                UNIQUE(title, source)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def scrape_rss_feed(self, feed_url: str, source_name: str) -> List[Dict]:
        """Scrape RSS feed for latest news"""
        try:
            feed = feedparser.parse(feed_url)
            articles = []
            
            for entry in feed.entries[:20]:  # Get latest 20 articles
                article = {
                    'title': entry.get('title', ''),
                    'url': entry.get('link', ''),
                    'content': entry.get('summary', ''),
                    'published': entry.get('published', ''),
                    'source': source_name
                }
                
                # Extract trading relevant info
                article['stocks_mentioned'] = self._extract_stock_mentions(
                    article['title'] + ' ' + article['content']
                )
                article['relevance_score'] = self._calculate_relevance(article)
                article['trading_signal'] = self._extract_trading_signal(article)
                
                articles.append(article)
            
            return articles
        except Exception as e:
            print(f"Error scraping {source_name}: {e}")
            return []
    
    def _extract_stock_mentions(self, text: str) -> List[str]:
        """Extract stock names mentioned in text"""
        stocks = []
        
        # Common Indian stocks
        stock_patterns = [
            'Reliance', 'TCS', 'Infosys', 'HDFC Bank', 'ICICI Bank',
            'SBI', 'ITC', 'Wipro', 'Bharti Airtel', 'Maruti',
            'Asian Paints', 'HUL', 'Kotak Bank', 'L&T', 'Axis Bank',
            'Adani', 'Tata Motors', 'Bajaj', 'Hero', 'Nestle'
        ]
        
        for stock in stock_patterns:
            if stock.lower() in text.lower():
                stocks.append(stock)
        
        # Also look for stock codes
        nse_codes = re.findall(r'\b[A-Z]{3,15}\b', text)
        stocks.extend([code for code in nse_codes if len(code) >= 3])
        
        return list(set(stocks))[:5]  # Return max 5 unique stocks
    
    def _calculate_relevance(self, article: Dict) -> int:
        """Calculate relevance score for traders"""
        score = 0
        text = (article.get('title', '') + ' ' + article.get('content', '')).lower()
        
        # High relevance keywords
        high_relevance = [
            'breakout', 'breakdown', 'surge', 'crash', 'rally', 'plunge',
            'buy', 'sell', 'target', 'stop loss', 'resistance', 'support',
            'results', 'earnings', 'merger', 'acquisition', 'ipo', 'fii', 'dii'
        ]
        
        # Medium relevance keywords
        medium_relevance = [
            'rise', 'fall', 'gain', 'loss', 'up', 'down', 'high', 'low',
            'bullish', 'bearish', 'volatility', 'volume', 'pe', 'ratio'
        ]
        
        for keyword in high_relevance:
            if keyword in text:
                score += 10
        
        for keyword in medium_relevance:
            if keyword in text:
                score += 5
        
        # Bonus for specific numbers/percentages
        if re.search(r'\d+%', text):
            score += 10
        
        # Bonus for price levels
        if re.search(r'₹\d+', text) or re.search(r'Rs\s*\d+', text):
            score += 10
        
        return min(100, score)  # Cap at 100
    
    def _extract_trading_signal(self, article: Dict) -> str:
        """Extract potential trading signal from article"""
        text = (article.get('title', '') + ' ' + article.get('content', '')).lower()
        
        if any(word in text for word in ['buy', 'accumulate', 'add', 'long']):
            return 'BUY'
        elif any(word in text for word in ['sell', 'exit', 'book profit', 'short']):
            return 'SELL'
        elif any(word in text for word in ['hold', 'wait', 'watch']):
            return 'HOLD'
        else:
            return 'NEUTRAL'
    
    def scrape_all_sources(self) -> List[Dict]:
        """Scrape all configured sources"""
        all_articles = []
        
        for source_name, config in self.sources.items():
            if config['type'] == 'rss':
                print(f"📰 Scraping {source_name}...")
                articles = self.scrape_rss_feed(config['rss'], source_name)
                all_articles.extend(articles)
        
        # Sort by relevance
        all_articles.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
        
        return all_articles
    
    def save_to_database(self, articles: List[Dict]):
        """Save articles to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for article in articles:
            try:
                cursor.execute('''
                    INSERT OR IGNORE INTO financial_news 
                    (title, source, url, content, published_date, relevance_score, 
                     trading_signal, stocks_mentioned)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    article.get('title', ''),
                    article.get('source', ''),
                    article.get('url', ''),
                    article.get('content', ''),
                    article.get('published', ''),
                    article.get('relevance_score', 0),
                    article.get('trading_signal', 'NEUTRAL'),
                    json.dumps(article.get('stocks_mentioned', []))
                ))
            except Exception as e:
                print(f"Error saving article: {e}")
        
        conn.commit()
        conn.close()
    
    def get_trading_insights(self) -> Dict:
        """Get actionable trading insights from scraped news"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get high relevance news from last 24 hours
        cursor.execute('''
            SELECT title, content, stocks_mentioned, trading_signal, relevance_score
            FROM financial_news
            WHERE relevance_score > 50
            AND datetime(scraped_date) > datetime('now', '-24 hours')
            ORDER BY relevance_score DESC
            LIMIT 10
        ''')
        
        top_news = cursor.fetchall()
        
        # Get most mentioned stocks
        cursor.execute('''
            SELECT stocks_mentioned, COUNT(*) as mentions
            FROM financial_news
            WHERE datetime(scraped_date) > datetime('now', '-24 hours')
            GROUP BY stocks_mentioned
            ORDER BY mentions DESC
            LIMIT 5
        ''')
        
        hot_stocks = cursor.fetchall()
        
        conn.close()
        
        return {
            'top_news': top_news,
            'hot_stocks': hot_stocks,
            'timestamp': datetime.now().isoformat()
        }
    
    def format_for_content(self, insights: Dict) -> str:
        """Format insights for content generation"""
        content = "🔥 BREAKING MARKET UPDATES:\n\n"
        
        # Add top news
        if insights.get('top_news'):
            for news in insights['top_news'][:3]:
                title = news[0]
                signal = news[3]
                relevance = news[4]
                
                if signal == 'BUY':
                    emoji = '🟢'
                elif signal == 'SELL':
                    emoji = '🔴'
                else:
                    emoji = '⚡'
                
                content += f"{emoji} {title[:100]}...\n"
                content += f"   Signal: {signal} | Relevance: {relevance}/100\n\n"
        
        # Add hot stocks
        if insights.get('hot_stocks'):
            content += "\n📊 STOCKS IN FOCUS:\n"
            for stock_data in insights['hot_stocks'][:5]:
                if stock_data[0]:  # If stocks mentioned exists
                    stocks = json.loads(stock_data[0])
                    if stocks:
                        content += f"• {', '.join(stocks[:3])}\n"
        
        return content


def test_scraper():
    """Test the financial news scraper"""
    print("\n🔍 Testing Financial News Scraper")
    print("="*60)
    
    scraper = FinancialNewsScraper()
    
    # Scrape all sources
    print("\n📡 Scraping financial news sources...")
    articles = scraper.scrape_all_sources()
    
    print(f"\n✅ Scraped {len(articles)} articles")
    
    # Show top 5 most relevant
    print("\n🎯 Top 5 Most Relevant Articles:")
    print("-"*60)
    for i, article in enumerate(articles[:5], 1):
        print(f"\n{i}. {article['title'][:80]}...")
        print(f"   Source: {article['source']}")
        print(f"   Relevance: {article['relevance_score']}/100")
        print(f"   Signal: {article['trading_signal']}")
        if article['stocks_mentioned']:
            print(f"   Stocks: {', '.join(article['stocks_mentioned'][:3])}")
    
    # Save to database
    scraper.save_to_database(articles)
    print("\n💾 Saved to database")
    
    # Get trading insights
    insights = scraper.get_trading_insights()
    formatted = scraper.format_for_content(insights)
    
    print("\n📊 Formatted Trading Insights:")
    print("-"*60)
    print(formatted)
    
    return scraper


if __name__ == "__main__":
    test_scraper()