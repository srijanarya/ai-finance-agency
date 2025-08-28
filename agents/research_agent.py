#!/usr/bin/env python3
"""
Enhanced Research Agent for AI Finance Agency
Autonomous agent for financial content research and idea generation
"""

import os
import json
import asyncio
import aiohttp
from datetime import datetime, timedelta
import yfinance as yf
import feedparser
from typing import Dict, List, Optional, Tuple
import sqlite3
from contextlib import contextmanager
import logging
from dataclasses import dataclass, asdict
from enum import Enum
import hashlib
from dotenv import load_dotenv
import pandas as pd
import numpy as np
from concurrent.futures import ThreadPoolExecutor
import re

load_dotenv()

logging.basicConfig(
    level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.getenv('LOG_FILE', 'logs/research_agent.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class ContentType(Enum):
    NEWS_ANALYSIS = "news_analysis"
    MARKET_ANALYSIS = "market_analysis"
    EDUCATIONAL = "educational"
    TRADING_SIGNAL = "trading_signal"
    SECTOR_REPORT = "sector_report"
    EARNINGS_PREVIEW = "earnings_preview"


class Urgency(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass
class ResearchTopic:
    topic: str
    source: str
    relevance_score: int
    keywords: List[str]
    timestamp: datetime
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data


@dataclass
class ContentIdea:
    title: str
    content_type: ContentType
    target_audience: str
    urgency: Urgency
    keywords: List[str]
    data_points: Dict
    estimated_reach: int
    
    def to_dict(self):
        data = asdict(self)
        data['content_type'] = self.content_type.value
        data['urgency'] = self.urgency.value
        return data


class DatabaseManager:
    """Manages database operations with connection pooling and error handling"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.initialize_database()
    
    @contextmanager
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()
    
    def initialize_database(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS research_topics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    topic TEXT NOT NULL,
                    source TEXT,
                    relevance_score INTEGER,
                    keywords TEXT,
                    hash TEXT UNIQUE,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS content_ideas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content_type TEXT,
                    target_audience TEXT,
                    urgency TEXT,
                    keywords TEXT,
                    data_points TEXT,
                    estimated_reach INTEGER,
                    status TEXT DEFAULT 'pending',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    published_at DATETIME,
                    performance_score INTEGER
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS market_snapshots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT NOT NULL,
                    price REAL,
                    change_percent REAL,
                    volume INTEGER,
                    market_cap REAL,
                    pe_ratio REAL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS trending_keywords (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    keyword TEXT UNIQUE NOT NULL,
                    frequency INTEGER DEFAULT 1,
                    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
                    sentiment_score REAL
                )
            ''')
            
            conn.commit()
            logger.info("Database initialized successfully")


class FinancialDataFetcher:
    """Fetches data from multiple financial sources"""
    
    def __init__(self):
        self.session = None
        self.alpha_vantage_key = os.getenv('ALPHA_VANTAGE_API_KEY')
        self.finnhub_key = os.getenv('FINNHUB_API_KEY')
        self.news_api_key = os.getenv('NEWS_API_KEY')
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def fetch_rss_feeds(self) -> List[Dict]:
        """Fetch and parse RSS feeds from financial news sources"""
        feeds = [
            # Indian financial news sources
            ('Economic Times', 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms'),
            ('Moneycontrol', 'https://www.moneycontrol.com/rss/MCtopnews.xml'),
            ('Business Standard', 'https://www.business-standard.com/rss/markets-106.rss'),
            ('Financial Express', 'https://www.financialexpress.com/market/feed/'),
            ('LiveMint Markets', 'https://www.livemint.com/rss/markets'),
            ('NDTV Business', 'https://feeds.feedburner.com/ndtvprofit-latest'),
            # Global sources with India coverage
            ('Reuters India', 'https://feeds.reuters.com/reuters/INbusinessNews'),
            ('Bloomberg Asia', 'https://feeds.bloomberg.com/markets/news.rss'),
            ('CNBC', 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147'),
        ]
        
        all_articles = []
        
        async def fetch_feed(name, url):
            try:
                feed = await asyncio.get_event_loop().run_in_executor(
                    None, feedparser.parse, url
                )
                articles = []
                for entry in feed.entries[:10]:
                    articles.append({
                        'title': entry.get('title', ''),
                        'link': entry.get('link', ''),
                        'published': entry.get('published', ''),
                        'summary': entry.get('summary', ''),
                        'source': name,
                        'tags': [tag['term'] for tag in entry.get('tags', [])]
                    })
                return articles
            except Exception as e:
                logger.error(f"Error fetching {name} feed: {e}")
                return []
        
        tasks = [fetch_feed(name, url) for name, url in feeds]
        results = await asyncio.gather(*tasks)
        
        for result in results:
            all_articles.extend(result)
        
        return all_articles
    
    async def fetch_market_data(self, symbols: List[str]) -> Dict:
        """Fetch real-time market data for given symbols"""
        market_data = {}
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            loop = asyncio.get_event_loop()
            
            async def get_ticker_data(symbol):
                try:
                    ticker = await loop.run_in_executor(
                        executor, yf.Ticker, symbol
                    )
                    info = await loop.run_in_executor(
                        executor, lambda: ticker.info
                    )
                    hist = await loop.run_in_executor(
                        executor, lambda: ticker.history(period="5d")
                    )
                    
                    if not hist.empty:
                        current_price = hist['Close'].iloc[-1]
                        prev_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
                        change_pct = ((current_price - prev_close) / prev_close) * 100
                        
                        market_data[symbol] = {
                            'price': round(current_price, 2),
                            'change_percent': round(change_pct, 2),
                            'volume': int(hist['Volume'].iloc[-1]),
                            'market_cap': info.get('marketCap', 0),
                            'pe_ratio': info.get('trailingPE', 0),
                            'name': info.get('shortName', symbol),
                            'sector': info.get('sector', 'Unknown')
                        }
                except Exception as e:
                    logger.error(f"Error fetching data for {symbol}: {e}")
            
            tasks = [get_ticker_data(symbol) for symbol in symbols]
            await asyncio.gather(*tasks)
        
        return market_data
    
    async def fetch_trending_topics(self) -> List[str]:
        """Fetch trending financial topics from various sources"""
        trending = set()
        
        if self.news_api_key:
            try:
                url = f"https://newsapi.org/v2/everything"
                params = {
                    'q': 'finance OR stocks OR cryptocurrency',
                    'sortBy': 'popularity',
                    'apiKey': self.news_api_key,
                    'from': (datetime.now() - timedelta(days=1)).isoformat()
                }
                
                async with self.session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        for article in data.get('articles', [])[:20]:
                            title_words = article['title'].split()
                            trending.update([w.lower() for w in title_words if len(w) > 4])
            except Exception as e:
                logger.error(f"Error fetching from NewsAPI: {e}")
        
        return list(trending)


class ContentAnalyzer:
    """Analyzes content and generates insights"""
    
    def __init__(self):
        self.keyword_weights = {
            # Indian market specific keywords
            'nifty': 10,
            'sensex': 10,
            'bse': 9,
            'nse': 9,
            'sebi': 9,
            'rbi': 10,
            'rupee': 8,
            'inr': 8,
            'india': 9,
            'indian': 9,
            'budget': 9,
            'gst': 8,
            'fii': 8,
            'dii': 8,
            'sgx': 7,
            'gift city': 8,
            'mutual fund': 8,
            'sip': 7,
            'demat': 7,
            'zerodha': 7,
            'upstox': 7,
            'groww': 7,
            # Indian companies
            'reliance': 9,
            'tcs': 9,
            'infosys': 9,
            'hdfc': 9,
            'icici': 9,
            'sbi': 9,
            'wipro': 8,
            'hcl': 8,
            'adani': 9,
            'tata': 9,
            'bajaj': 8,
            'maruti': 8,
            'airtel': 8,
            'jio': 8,
            'paytm': 8,
            'zomato': 8,
            'nykaa': 8,
            # Generic financial keywords
            'earnings': 10,
            'ipo': 9,
            'merger': 9,
            'acquisition': 9,
            'bankruptcy': 10,
            'dividend': 7,
            'buyback': 7,
            'guidance': 8,
            'revenue': 6,
            'profit': 6,
            'loss': 6,
            'growth': 5,
            'decline': 5,
            'surge': 7,
            'plunge': 7,
            'rally': 6,
            'crash': 8,
            'bull': 5,
            'bear': 5,
            'recession': 8,
            'inflation': 8,
            'rate': 7,
            'fed': 8,
            'crypto': 6,
            'bitcoin': 6,
            'ai': 7,
            'regulation': 6
        }
    
    def calculate_relevance_score(self, text: str, keywords: List[str]) -> int:
        """Calculate relevance score based on keywords and content"""
        text_lower = text.lower()
        score = 0
        
        for keyword in keywords:
            if keyword.lower() in text_lower:
                score += self.keyword_weights.get(keyword.lower(), 3)
        
        word_count = len(text.split())
        if word_count < 50:
            score -= 2
        elif word_count > 200:
            score += 2
        
        return min(max(score, 0), 100)
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract relevant keywords from text"""
        text_lower = text.lower()
        keywords = []
        
        for keyword, weight in self.keyword_weights.items():
            if keyword in text_lower and weight >= 6:
                keywords.append(keyword)
        
        pattern = r'\$[A-Z]{1,5}\b'
        tickers = re.findall(pattern, text.upper())
        keywords.extend(tickers)
        
        return list(set(keywords))[:10]
    
    def determine_content_type(self, article: Dict) -> ContentType:
        """Determine the type of content based on article characteristics"""
        title_lower = article['title'].lower()
        
        if any(word in title_lower for word in ['earnings', 'revenue', 'profit', 'guidance']):
            return ContentType.EARNINGS_PREVIEW
        elif any(word in title_lower for word in ['buy', 'sell', 'signal', 'alert']):
            return ContentType.TRADING_SIGNAL
        elif any(word in title_lower for word in ['sector', 'industry', 'analysis']):
            return ContentType.SECTOR_REPORT
        elif any(word in title_lower for word in ['how', 'what', 'why', 'guide', 'learn']):
            return ContentType.EDUCATIONAL
        elif any(word in title_lower for word in ['market', 'dow', 's&p', 'nasdaq']):
            return ContentType.MARKET_ANALYSIS
        else:
            return ContentType.NEWS_ANALYSIS
    
    def determine_urgency(self, article: Dict, relevance_score: int) -> Urgency:
        """Determine content urgency"""
        if relevance_score >= 80:
            return Urgency.CRITICAL
        elif relevance_score >= 60:
            return Urgency.HIGH
        elif relevance_score >= 40:
            return Urgency.MEDIUM
        else:
            return Urgency.LOW
    
    def estimate_reach(self, content_type: ContentType, urgency: Urgency) -> int:
        """Estimate potential reach for content"""
        base_reach = {
            ContentType.NEWS_ANALYSIS: 1000,
            ContentType.MARKET_ANALYSIS: 1500,
            ContentType.EDUCATIONAL: 2000,
            ContentType.TRADING_SIGNAL: 2500,
            ContentType.SECTOR_REPORT: 1200,
            ContentType.EARNINGS_PREVIEW: 1800
        }
        
        urgency_multiplier = {
            Urgency.CRITICAL: 3.0,
            Urgency.HIGH: 2.0,
            Urgency.MEDIUM: 1.5,
            Urgency.LOW: 1.0
        }
        
        return int(base_reach[content_type] * urgency_multiplier[urgency])


class ResearchAgent:
    """Enhanced autonomous agent for financial content research"""
    
    def __init__(self):
        self.db_manager = DatabaseManager(os.getenv('DATABASE_PATH', 'data/agency.db'))
        self.data_fetcher = None
        self.analyzer = ContentAnalyzer()
        self.research_interval = int(os.getenv('RESEARCH_INTERVAL_MINUTES', 30))
        self.max_ideas_per_scan = int(os.getenv('MAX_IDEAS_PER_SCAN', 20))
        self.min_relevance_score = int(os.getenv('MIN_RELEVANCE_SCORE', 7))
        
    async def scan_and_analyze(self) -> Tuple[List[ResearchTopic], List[ContentIdea]]:
        """Main scanning and analysis routine"""
        research_topics = []
        content_ideas = []
        
        async with FinancialDataFetcher() as fetcher:
            self.data_fetcher = fetcher
            
            articles = await fetcher.fetch_rss_feeds()
            logger.info(f"Fetched {len(articles)} articles from RSS feeds")
            
            trending_topics = await fetcher.fetch_trending_topics()
            logger.info(f"Identified {len(trending_topics)} trending topics")
            
            # Indian stock symbols with .NS suffix for NSE
            symbols = [
                # Indian indices
                '^NSEI',  # Nifty 50
                '^BSESN', # Sensex
                # Major Indian stocks
                'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
                'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS',
                'LT.NS', 'AXISBANK.NS', 'WIPRO.NS', 'HCLTECH.NS', 'BAJFINANCE.NS',
                'MARUTI.NS', 'TATAMOTORS.NS', 'ADANIENT.NS', 'ADANIGREEN.NS',
                'PAYTM.NS', 'ZOMATO.NS', 'NYKAA.NS'
            ]
            market_data = await fetcher.fetch_market_data(symbols)
            logger.info(f"Fetched market data for {len(market_data)} symbols")
            
            for article in articles[:50]:
                keywords = self.analyzer.extract_keywords(article['title'] + ' ' + article.get('summary', ''))
                relevance_score = self.analyzer.calculate_relevance_score(
                    article['title'] + ' ' + article.get('summary', ''),
                    keywords + trending_topics
                )
                
                if relevance_score >= self.min_relevance_score:
                    topic = ResearchTopic(
                        topic=article['title'],
                        source=article['source'],
                        relevance_score=relevance_score,
                        keywords=keywords,
                        timestamp=datetime.now()
                    )
                    research_topics.append(topic)
                    
                    content_type = self.analyzer.determine_content_type(article)
                    urgency = self.analyzer.determine_urgency(article, relevance_score)
                    estimated_reach = self.analyzer.estimate_reach(content_type, urgency)
                    
                    idea = ContentIdea(
                        title=f"Deep Dive: {article['title']}",
                        content_type=content_type,
                        target_audience=self._determine_audience(content_type),
                        urgency=urgency,
                        keywords=keywords,
                        data_points={'article_link': article['link'], 'source': article['source']},
                        estimated_reach=estimated_reach
                    )
                    content_ideas.append(idea)
            
            for symbol, data in market_data.items():
                if abs(data['change_percent']) > 3:
                    idea = ContentIdea(
                        title=f"{data['name']} ({symbol}) Moves {data['change_percent']:.1f}% - What Investors Need to Know",
                        content_type=ContentType.MARKET_ANALYSIS,
                        target_audience="active_traders",
                        urgency=Urgency.HIGH if abs(data['change_percent']) > 5 else Urgency.MEDIUM,
                        keywords=[symbol, data['sector'], 'market_move'],
                        data_points=data,
                        estimated_reach=2000
                    )
                    content_ideas.append(idea)
            
            content_ideas = sorted(content_ideas, key=lambda x: x.estimated_reach, reverse=True)[:self.max_ideas_per_scan]
            
        return research_topics, content_ideas
    
    def _determine_audience(self, content_type: ContentType) -> str:
        """Determine target audience based on content type"""
        audience_map = {
            ContentType.NEWS_ANALYSIS: "general_investors",
            ContentType.MARKET_ANALYSIS: "active_traders",
            ContentType.EDUCATIONAL: "beginners",
            ContentType.TRADING_SIGNAL: "day_traders",
            ContentType.SECTOR_REPORT: "institutional",
            ContentType.EARNINGS_PREVIEW: "earnings_traders"
        }
        return audience_map.get(content_type, "general")
    
    async def save_research_results(self, topics: List[ResearchTopic], ideas: List[ContentIdea]):
        """Save research results to database"""
        with self.db_manager.get_connection() as conn:
            cursor = conn.cursor()
            
            for topic in topics:
                topic_hash = hashlib.md5(topic.topic.encode()).hexdigest()
                cursor.execute('''
                    INSERT OR IGNORE INTO research_topics 
                    (topic, source, relevance_score, keywords, hash, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    topic.topic,
                    topic.source,
                    topic.relevance_score,
                    json.dumps(topic.keywords),
                    topic_hash,
                    topic.timestamp
                ))
            
            for idea in ideas:
                cursor.execute('''
                    INSERT INTO content_ideas 
                    (title, content_type, target_audience, urgency, keywords, data_points, estimated_reach)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    idea.title,
                    idea.content_type.value,
                    idea.target_audience,
                    idea.urgency.value,
                    json.dumps(idea.keywords),
                    json.dumps(idea.data_points),
                    idea.estimated_reach
                ))
            
            conn.commit()
            logger.info(f"Saved {len(topics)} topics and {len(ideas)} content ideas")
    
    async def update_trending_keywords(self, keywords: List[str]):
        """Update trending keywords in database"""
        with self.db_manager.get_connection() as conn:
            cursor = conn.cursor()
            
            for keyword in keywords:
                cursor.execute('''
                    INSERT INTO trending_keywords (keyword, frequency, last_seen)
                    VALUES (?, 1, ?)
                    ON CONFLICT(keyword) DO UPDATE SET
                    frequency = frequency + 1,
                    last_seen = ?
                ''', (keyword, datetime.now(), datetime.now()))
            
            conn.commit()
    
    async def get_pending_ideas(self, limit: int = 10) -> List[Dict]:
        """Get pending content ideas from database"""
        with self.db_manager.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM content_ideas 
                WHERE status = 'pending'
                ORDER BY urgency DESC, estimated_reach DESC
                LIMIT ?
            ''', (limit,))
            
            return [dict(row) for row in cursor.fetchall()]
    
    async def mark_idea_published(self, idea_id: int, performance_score: int = 0):
        """Mark a content idea as published"""
        with self.db_manager.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE content_ideas 
                SET status = 'published', 
                    published_at = ?,
                    performance_score = ?
                WHERE id = ?
            ''', (datetime.now(), performance_score, idea_id))
            conn.commit()
    
    async def run_continuous(self):
        """Run research agent continuously"""
        logger.info("Starting Research Agent...")
        
        while True:
            try:
                logger.info("Starting research scan...")
                
                topics, ideas = await self.scan_and_analyze()
                
                await self.save_research_results(topics, ideas)
                
                all_keywords = []
                for topic in topics:
                    all_keywords.extend(topic.keywords)
                await self.update_trending_keywords(list(set(all_keywords)))
                
                logger.info(f"Research scan complete. Found {len(topics)} topics and generated {len(ideas)} ideas")
                
                await asyncio.sleep(self.research_interval * 60)
                
            except Exception as e:
                logger.error(f"Error in research agent: {e}", exc_info=True)
                await asyncio.sleep(60)
    
    async def run_once(self):
        """Run a single research scan"""
        try:
            logger.info("Running single research scan...")
            
            topics, ideas = await self.scan_and_analyze()
            await self.save_research_results(topics, ideas)
            
            all_keywords = []
            for topic in topics:
                all_keywords.extend(topic.keywords)
            await self.update_trending_keywords(list(set(all_keywords)))
            
            logger.info(f"Scan complete. Found {len(topics)} topics and generated {len(ideas)} ideas")
            
            return {
                'topics': [t.to_dict() for t in topics],
                'ideas': [i.to_dict() for i in ideas],
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in research scan: {e}", exc_info=True)
            raise


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='AI Finance Agency Research Agent')
    parser.add_argument('--once', action='store_true', help='Run once and exit')
    parser.add_argument('--debug', action='store_true', help='Enable debug logging')
    args = parser.parse_args()
    
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)
    
    agent = ResearchAgent()
    
    if args.once:
        result = asyncio.run(agent.run_once())
        print(json.dumps(result, indent=2))
    else:
        asyncio.run(agent.run_continuous())


if __name__ == "__main__":
    main()
