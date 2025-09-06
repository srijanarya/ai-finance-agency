#!/usr/bin/env python3
"""
Unified Automation System for AI Finance Agency
Complete autonomous system for data collection, content generation, and multi-platform publishing
Based on the workflow: Data Collection → Content Generation → Multi-Platform Publishing
"""

import asyncio
import json
import os
import sys
import time
import random
import hashlib
import sqlite3
import threading
import schedule
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('unified_system.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION
# ============================================================================

class Config:
    """System Configuration"""
    # Market Hours (IST)
    MARKET_OPEN = "09:15"
    MARKET_CLOSE = "15:30"
    
    # Scheduling
    DATA_COLLECTION_INTERVAL = 900  # 15 minutes
    CONTENT_GENERATION_INTERVAL = 3600  # 1 hour
    
    # Platform Posting Intervals
    LINKEDIN_INTERVAL = 7200  # 2 hours
    TWITTER_INTERVAL = 5400   # 90 minutes
    TELEGRAM_INTERVAL = 3600  # 1 hour
    
    # Content Settings
    MAX_CONTENT_HISTORY = 100
    SIMILARITY_THRESHOLD = 0.7
    
    # Database
    DB_PATH = "unified_system.db"
    
    # API Endpoints (for manual triggers)
    API_PORT = 8089

# ============================================================================
# DATA MODELS
# ============================================================================

class ContentType(Enum):
    MARKET_ANALYSIS = "market_analysis"
    NEWS_SUMMARY = "news_summary"
    EDUCATIONAL = "educational"
    OPTIONS_INSIGHT = "options_insight"
    QUICK_UPDATE = "quick_update"

class Platform(Enum):
    LINKEDIN = "linkedin"
    TWITTER = "twitter"
    TELEGRAM = "telegram"

@dataclass
class MarketData:
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: int
    timestamp: datetime
    
@dataclass
class Content:
    id: str
    type: ContentType
    title: str
    body: str
    platforms: List[Platform]
    hashtags: List[str]
    created_at: datetime
    posted: Dict[str, bool]
    performance: Dict[str, Any]

# ============================================================================
# DATABASE MANAGER
# ============================================================================

class DatabaseManager:
    """Manages all database operations"""
    
    def __init__(self, db_path: str = Config.DB_PATH):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database tables"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS market_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    symbol TEXT,
                    price REAL,
                    change REAL,
                    change_percent REAL,
                    volume INTEGER,
                    timestamp DATETIME
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS content (
                    id TEXT PRIMARY KEY,
                    type TEXT,
                    title TEXT,
                    body TEXT,
                    platforms TEXT,
                    hashtags TEXT,
                    created_at DATETIME,
                    posted_linkedin BOOLEAN DEFAULT 0,
                    posted_twitter BOOLEAN DEFAULT 0,
                    posted_telegram BOOLEAN DEFAULT 0
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS analytics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    content_id TEXT,
                    platform TEXT,
                    views INTEGER DEFAULT 0,
                    likes INTEGER DEFAULT 0,
                    shares INTEGER DEFAULT 0,
                    timestamp DATETIME,
                    FOREIGN KEY (content_id) REFERENCES content(id)
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS system_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    module TEXT,
                    level TEXT,
                    message TEXT,
                    timestamp DATETIME
                )
            ''')
            
            conn.commit()
    
    def save_market_data(self, data: MarketData):
        """Save market data to database"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT INTO market_data (symbol, price, change, change_percent, volume, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (data.symbol, data.price, data.change, data.change_percent, 
                  data.volume, data.timestamp))
            conn.commit()
    
    def save_content(self, content: Content):
        """Save generated content"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT OR REPLACE INTO content 
                (id, type, title, body, platforms, hashtags, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (content.id, content.type.value, content.title, content.body,
                  json.dumps([p.value for p in content.platforms]),
                  json.dumps(content.hashtags), content.created_at))
            conn.commit()
    
    def get_recent_content(self, limit: int = 50) -> List[Dict]:
        """Get recent content for duplicate checking"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT id, body FROM content 
                ORDER BY created_at DESC 
                LIMIT ?
            ''', (limit,))
            return [{'id': row[0], 'body': row[1]} for row in cursor]
    
    def mark_posted(self, content_id: str, platform: Platform):
        """Mark content as posted on platform"""
        with sqlite3.connect(self.db_path) as conn:
            column = f"posted_{platform.value}"
            conn.execute(f'''
                UPDATE content 
                SET {column} = 1 
                WHERE id = ?
            ''', (content_id,))
            conn.commit()

# ============================================================================
# DATA COLLECTION MODULE
# ============================================================================

class DataCollector:
    """Collects data from multiple sources"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
        self.sources = {
            'market': self.fetch_market_data,
            'rss': self.fetch_rss_feeds,
            'news': self.fetch_news_api
        }
    
    async def fetch_market_data(self) -> List[MarketData]:
        """Fetch market data from TradingView/Yahoo Finance"""
        market_data = []
        
        try:
            import yfinance as yf
            
            symbols = {
                'NIFTY': '^NSEI',
                'BANKNIFTY': '^NSEBANK',
                'SENSEX': '^BSESN'
            }
            
            for name, symbol in symbols.items():
                ticker = yf.Ticker(symbol)
                info = ticker.info
                
                data = MarketData(
                    symbol=name,
                    price=info.get('regularMarketPrice', 0),
                    change=info.get('regularMarketChange', 0),
                    change_percent=info.get('regularMarketChangePercent', 0),
                    volume=info.get('regularMarketVolume', 0),
                    timestamp=datetime.now()
                )
                
                market_data.append(data)
                self.db.save_market_data(data)
                
        except Exception as e:
            logger.error(f"Market data fetch error: {e}")
        
        return market_data
    
    async def fetch_rss_feeds(self) -> List[Dict]:
        """Fetch RSS feeds from financial sources"""
        feeds = []
        
        rss_sources = [
            'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms',
            'https://www.moneycontrol.com/rss/marketreports.xml',
            'https://feeds.bloomberg.com/markets/news.rss'
        ]
        
        try:
            import feedparser
            
            for url in rss_sources:
                feed = feedparser.parse(url)
                for entry in feed.entries[:5]:  # Get top 5 from each
                    feeds.append({
                        'title': entry.title,
                        'link': entry.link,
                        'summary': entry.get('summary', ''),
                        'published': entry.get('published', '')
                    })
                    
        except Exception as e:
            logger.error(f"RSS fetch error: {e}")
        
        return feeds
    
    async def fetch_news_api(self) -> List[Dict]:
        """Fetch news from NewsAPI"""
        # Implementation for NewsAPI
        return []
    
    async def collect_all(self) -> Dict:
        """Collect data from all sources"""
        logger.info("Starting data collection...")
        
        results = {
            'market_data': await self.fetch_market_data(),
            'rss_feeds': await self.fetch_rss_feeds(),
            'news': await self.fetch_news_api(),
            'timestamp': datetime.now()
        }
        
        logger.info(f"Collected: {len(results['market_data'])} market data, "
                   f"{len(results['rss_feeds'])} RSS items")
        
        return results

# ============================================================================
# CONTENT GENERATION MODULE
# ============================================================================

class ContentGenerator:
    """Generates varied content using AI"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
        self.content_types = list(ContentType)
        
    def check_uniqueness(self, content: str) -> bool:
        """Check if content is unique enough"""
        recent_content = self.db.get_recent_content()
        
        content_words = set(content.lower().split())
        
        for prev in recent_content:
            prev_words = set(prev['body'].lower().split())
            
            if len(content_words) > 0:
                similarity = len(content_words & prev_words) / len(content_words)
                if similarity > Config.SIMILARITY_THRESHOLD:
                    return False
        
        return True
    
    async def generate_content(self, data: Dict) -> Optional[Content]:
        """Generate content based on collected data"""
        logger.info("Generating content...")
        
        # Choose content type based on data and time
        content_type = self.choose_content_type(data)
        
        # Generate content using OpenAI
        content_body = await self.generate_with_ai(content_type, data)
        
        if not content_body:
            return None
        
        # Check uniqueness
        if not self.check_uniqueness(content_body):
            logger.warning("Content too similar to recent posts, regenerating...")
            content_body = await self.generate_with_ai(content_type, data, variation=True)
        
        # Create content object
        content = Content(
            id=hashlib.md5(f"{content_body}{datetime.now()}".encode()).hexdigest()[:8],
            type=content_type,
            title=self.generate_title(content_type, data),
            body=content_body,
            platforms=self.select_platforms(content_type),
            hashtags=self.generate_hashtags(content_type),
            created_at=datetime.now(),
            posted={p.value: False for p in Platform},
            performance={}
        )
        
        # Save to database
        self.db.save_content(content)
        
        logger.info(f"Generated {content_type.value} content: {content.id}")
        
        return content
    
    def choose_content_type(self, data: Dict) -> ContentType:
        """Choose content type based on data and timing"""
        hour = datetime.now().hour
        
        # Morning: Educational content
        if 6 <= hour < 10:
            return ContentType.EDUCATIONAL
        
        # Market hours: Analysis and updates
        elif 9 <= hour < 16:
            # Check for significant market moves
            if self.has_significant_move(data):
                return ContentType.QUICK_UPDATE
            return ContentType.MARKET_ANALYSIS
        
        # Evening: Options insights
        elif 16 <= hour < 20:
            return ContentType.OPTIONS_INSIGHT
        
        # Night: News summaries
        else:
            return ContentType.NEWS_SUMMARY
    
    def has_significant_move(self, data: Dict) -> bool:
        """Check if market has significant movement"""
        for market in data.get('market_data', []):
            if abs(market.change_percent) > 1.5:
                return True
        return False
    
    async def generate_with_ai(self, content_type: ContentType, data: Dict, 
                               variation: bool = False) -> str:
        """Generate content using OpenAI API"""
        try:
            import openai
            from dotenv import load_dotenv
            load_dotenv()
            
            openai.api_key = os.getenv('OPENAI_API_KEY')
            
            prompt = self.create_prompt(content_type, data, variation)
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a financial content expert specializing in Indian markets."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7 if not variation else 0.9
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"AI generation error: {e}")
            # Fallback to template-based generation
            return self.generate_fallback_content(content_type, data)
    
    def create_prompt(self, content_type: ContentType, data: Dict, variation: bool) -> str:
        """Create prompt for AI"""
        market_summary = self.summarize_market_data(data.get('market_data', []))
        
        prompts = {
            ContentType.MARKET_ANALYSIS: f"""
                Create a market analysis post about Indian markets.
                Current data: {market_summary}
                Focus on: Key levels, trends, and outlook
                Style: Professional, informative
                Length: 200-300 words
                {"Use different perspective and examples" if variation else ""}
            """,
            ContentType.EDUCATIONAL: f"""
                Create an educational post about options trading or technical analysis.
                Make it beginner-friendly but insightful.
                Include a practical example from current market: {market_summary}
                Length: 150-250 words
            """,
            ContentType.QUICK_UPDATE: f"""
                Create a quick market update.
                Data: {market_summary}
                Style: Concise, actionable
                Length: 50-100 words
            """,
            ContentType.OPTIONS_INSIGHT: f"""
                Apply Abid Hassan's options methodology.
                Analyze PCR, max pain, and institutional positioning.
                Market data: {market_summary}
                Style: Technical but accessible
                Length: 200-250 words
            """,
            ContentType.NEWS_SUMMARY: f"""
                Summarize today's key financial news for Indian markets.
                Focus on market-moving events.
                Length: 150-200 words
            """
        }
        
        return prompts.get(content_type, prompts[ContentType.MARKET_ANALYSIS])
    
    def summarize_market_data(self, market_data: List[MarketData]) -> str:
        """Summarize market data for prompt"""
        summary = []
        for data in market_data:
            summary.append(f"{data.symbol}: {data.price:.2f} ({data.change_percent:+.2f}%)")
        return ", ".join(summary)
    
    def generate_fallback_content(self, content_type: ContentType, data: Dict) -> str:
        """Generate fallback content without AI"""
        templates = {
            ContentType.MARKET_ANALYSIS: "Markets showed mixed signals today with NIFTY at {nifty} levels.",
            ContentType.EDUCATIONAL: "Understanding options Greeks is crucial for risk management.",
            ContentType.QUICK_UPDATE: "Market Update: NIFTY {direction} by {change}%",
            ContentType.OPTIONS_INSIGHT: "Options data suggests {sentiment} sentiment with PCR at {pcr}",
            ContentType.NEWS_SUMMARY: "Key developments in Indian markets today..."
        }
        
        return templates.get(content_type, "Financial markets update.")
    
    def generate_title(self, content_type: ContentType, data: Dict) -> str:
        """Generate title for content"""
        titles = {
            ContentType.MARKET_ANALYSIS: "Market Analysis: " + datetime.now().strftime("%d %b"),
            ContentType.EDUCATIONAL: "Learn: " + random.choice(["Options", "Technical Analysis", "Risk Management"]),
            ContentType.QUICK_UPDATE: "Market Flash: " + datetime.now().strftime("%I:%M %p"),
            ContentType.OPTIONS_INSIGHT: "Options Insight: Institutional View",
            ContentType.NEWS_SUMMARY: "Today's Market Wrap"
        }
        
        return titles.get(content_type, "Market Update")
    
    def select_platforms(self, content_type: ContentType) -> List[Platform]:
        """Select platforms based on content type"""
        platform_map = {
            ContentType.MARKET_ANALYSIS: [Platform.LINKEDIN, Platform.TWITTER],
            ContentType.EDUCATIONAL: [Platform.LINKEDIN],
            ContentType.QUICK_UPDATE: [Platform.TELEGRAM, Platform.TWITTER],
            ContentType.OPTIONS_INSIGHT: [Platform.LINKEDIN, Platform.TELEGRAM],
            ContentType.NEWS_SUMMARY: [Platform.LINKEDIN, Platform.TWITTER, Platform.TELEGRAM]
        }
        
        return platform_map.get(content_type, [Platform.LINKEDIN])
    
    def generate_hashtags(self, content_type: ContentType) -> List[str]:
        """Generate relevant hashtags"""
        base_tags = ['#IndianStockMarket', '#NIFTY', '#StockMarketIndia']
        
        type_tags = {
            ContentType.MARKET_ANALYSIS: ['#MarketAnalysis', '#TechnicalAnalysis'],
            ContentType.EDUCATIONAL: ['#LearnTrading', '#FinancialEducation'],
            ContentType.QUICK_UPDATE: ['#MarketUpdate', '#LiveMarket'],
            ContentType.OPTIONS_INSIGHT: ['#OptionsTrading', '#Derivatives'],
            ContentType.NEWS_SUMMARY: ['#MarketNews', '#FinancialNews']
        }
        
        return base_tags + type_tags.get(content_type, [])

# ============================================================================
# MULTI-PLATFORM PUBLISHER
# ============================================================================

class MultiPlatformPublisher:
    """Publishes content to multiple platforms"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
        self.last_post_time = {
            Platform.LINKEDIN: None,
            Platform.TWITTER: None,
            Platform.TELEGRAM: None
        }
    
    async def publish(self, content: Content) -> Dict[Platform, bool]:
        """Publish content to specified platforms"""
        results = {}
        
        for platform in content.platforms:
            if self.can_post_to_platform(platform):
                success = await self.post_to_platform(content, platform)
                results[platform] = success
                
                if success:
                    self.last_post_time[platform] = datetime.now()
                    self.db.mark_posted(content.id, platform)
                    logger.info(f"Posted to {platform.value}: {content.id}")
                else:
                    logger.error(f"Failed to post to {platform.value}")
        
        return results
    
    def can_post_to_platform(self, platform: Platform) -> bool:
        """Check if enough time has passed for platform"""
        if not self.last_post_time[platform]:
            return True
        
        intervals = {
            Platform.LINKEDIN: Config.LINKEDIN_INTERVAL,
            Platform.TWITTER: Config.TWITTER_INTERVAL,
            Platform.TELEGRAM: Config.TELEGRAM_INTERVAL
        }
        
        time_passed = (datetime.now() - self.last_post_time[platform]).total_seconds()
        return time_passed >= intervals[platform]
    
    async def post_to_platform(self, content: Content, platform: Platform) -> bool:
        """Post to specific platform"""
        try:
            if platform == Platform.LINKEDIN:
                return await self.post_to_linkedin(content)
            elif platform == Platform.TWITTER:
                return await self.post_to_twitter(content)
            elif platform == Platform.TELEGRAM:
                return await self.post_to_telegram(content)
        except Exception as e:
            logger.error(f"Platform posting error ({platform.value}): {e}")
            return False
    
    async def post_to_linkedin(self, content: Content) -> bool:
        """Post to LinkedIn"""
        try:
            # Format content for LinkedIn
            post_text = f"{content.title}\n\n{content.body}\n\n{' '.join(content.hashtags)}"
            
            # Use existing LinkedIn posting script
            import subprocess
            
            # Save content to temp file
            with open('temp_linkedin_content.txt', 'w') as f:
                f.write(post_text)
            
            result = subprocess.run(
                [sys.executable, 'linkedin_simple_post.py'],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            return result.returncode == 0
            
        except Exception as e:
            logger.error(f"LinkedIn posting error: {e}")
            return False
    
    async def post_to_twitter(self, content: Content) -> bool:
        """Post to Twitter"""
        try:
            # Format for Twitter (280 chars)
            post_text = f"{content.title}\n\n{content.body[:200]}..."
            if len(post_text) > 280:
                post_text = post_text[:277] + "..."
            
            # Add hashtags if space allows
            for tag in content.hashtags[:3]:
                if len(post_text + " " + tag) <= 280:
                    post_text += " " + tag
            
            # Twitter posting implementation
            # Currently disabled due to OAuth issues
            logger.warning("Twitter posting disabled (OAuth issues)")
            return False
            
        except Exception as e:
            logger.error(f"Twitter posting error: {e}")
            return False
    
    async def post_to_telegram(self, content: Content) -> bool:
        """Post to Telegram"""
        try:
            # Format for Telegram
            post_text = f"📊 {content.title}\n\n{content.body}\n\n{' '.join(content.hashtags[:5])}"
            
            # Use existing Telegram posting script
            import subprocess
            
            # Save content to temp file
            with open('temp_telegram_content.txt', 'w') as f:
                f.write(post_text)
            
            result = subprocess.run(
                [sys.executable, 'telegram_auto_poster.py'],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            return "Successfully" in result.stdout or result.returncode == 0
            
        except Exception as e:
            logger.error(f"Telegram posting error: {e}")
            return False

# ============================================================================
# MONITORING & ANALYTICS
# ============================================================================

class MonitoringSystem:
    """Monitors system health and performance"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
        self.metrics = {
            'posts_today': 0,
            'content_generated': 0,
            'api_calls': 0,
            'errors': 0,
            'uptime_start': datetime.now()
        }
    
    def log_event(self, module: str, level: str, message: str):
        """Log system event"""
        with sqlite3.connect(self.db.db_path) as conn:
            conn.execute('''
                INSERT INTO system_logs (module, level, message, timestamp)
                VALUES (?, ?, ?, ?)
            ''', (module, level, message, datetime.now()))
            conn.commit()
    
    def update_metrics(self, metric: str, value: int = 1):
        """Update system metrics"""
        if metric in self.metrics:
            self.metrics[metric] += value
    
    def get_system_health(self) -> Dict:
        """Get system health status"""
        uptime = (datetime.now() - self.metrics['uptime_start']).total_seconds()
        
        return {
            'status': 'healthy' if self.metrics['errors'] < 10 else 'degraded',
            'uptime_hours': uptime / 3600,
            'posts_today': self.metrics['posts_today'],
            'content_generated': self.metrics['content_generated'],
            'error_rate': self.metrics['errors'] / max(self.metrics['api_calls'], 1),
            'timestamp': datetime.now().isoformat()
        }
    
    async def generate_daily_report(self) -> str:
        """Generate daily performance report"""
        with sqlite3.connect(self.db.db_path) as conn:
            # Get today's posts
            cursor = conn.execute('''
                SELECT COUNT(*) FROM content 
                WHERE DATE(created_at) = DATE('now')
            ''')
            posts_today = cursor.fetchone()[0]
            
            # Get platform breakdown
            platforms_data = {}
            for platform in ['linkedin', 'twitter', 'telegram']:
                cursor = conn.execute(f'''
                    SELECT COUNT(*) FROM content 
                    WHERE DATE(created_at) = DATE('now') 
                    AND posted_{platform} = 1
                ''')
                platforms_data[platform] = cursor.fetchone()[0]
        
        report = f"""
        📊 Daily Report - {datetime.now().strftime('%Y-%m-%d')}
        
        Content Generated: {posts_today}
        LinkedIn Posts: {platforms_data['linkedin']}
        Twitter Posts: {platforms_data['twitter']}
        Telegram Posts: {platforms_data['telegram']}
        
        System Health: {self.get_system_health()['status']}
        Uptime: {self.get_system_health()['uptime_hours']:.1f} hours
        Error Rate: {self.get_system_health()['error_rate']:.2%}
        """
        
        return report

# ============================================================================
# SCHEDULER & ORCHESTRATOR
# ============================================================================

class UnifiedScheduler:
    """Orchestrates all system components"""
    
    def __init__(self):
        self.db = DatabaseManager()
        self.collector = DataCollector(self.db)
        self.generator = ContentGenerator(self.db)
        self.publisher = MultiPlatformPublisher(self.db)
        self.monitor = MonitoringSystem(self.db)
        self.running = True
        
    async def data_collection_cycle(self):
        """Run data collection cycle"""
        while self.running:
            try:
                data = await self.collector.collect_all()
                self.monitor.update_metrics('api_calls')
                
                # Check for significant events
                if self.should_generate_content(data):
                    await self.content_generation_cycle(data)
                
            except Exception as e:
                logger.error(f"Data collection error: {e}")
                self.monitor.update_metrics('errors')
            
            await asyncio.sleep(Config.DATA_COLLECTION_INTERVAL)
    
    async def content_generation_cycle(self, data: Dict = None):
        """Run content generation cycle"""
        try:
            if not data:
                data = await self.collector.collect_all()
            
            content = await self.generator.generate_content(data)
            
            if content:
                self.monitor.update_metrics('content_generated')
                await self.publishing_cycle(content)
                
        except Exception as e:
            logger.error(f"Content generation error: {e}")
            self.monitor.update_metrics('errors')
    
    async def publishing_cycle(self, content: Content):
        """Run publishing cycle"""
        try:
            results = await self.publisher.publish(content)
            
            for platform, success in results.items():
                if success:
                    self.monitor.update_metrics('posts_today')
                    
        except Exception as e:
            logger.error(f"Publishing error: {e}")
            self.monitor.update_metrics('errors')
    
    def should_generate_content(self, data: Dict) -> bool:
        """Determine if content should be generated"""
        # Generate on significant market moves
        for market in data.get('market_data', []):
            if abs(market.change_percent) > 2.0:
                return True
        
        # Generate if enough time has passed
        # Implementation depends on last generation time
        return False
    
    async def scheduled_tasks(self):
        """Run scheduled tasks"""
        schedule.every().day.at("09:00").do(lambda: asyncio.create_task(self.content_generation_cycle()))
        schedule.every().day.at("14:00").do(lambda: asyncio.create_task(self.content_generation_cycle()))
        schedule.every().day.at("19:00").do(lambda: asyncio.create_task(self.content_generation_cycle()))
        schedule.every().day.at("22:00").do(lambda: asyncio.create_task(self.monitor.generate_daily_report()))
        
        while self.running:
            schedule.run_pending()
            await asyncio.sleep(60)
    
    async def manual_trigger_server(self):
        """API server for manual triggers"""
        from aiohttp import web
        
        async def trigger_generation(request):
            await self.content_generation_cycle()
            return web.json_response({'status': 'triggered'})
        
        async def get_health(request):
            health = self.monitor.get_system_health()
            return web.json_response(health)
        
        async def get_report(request):
            report = await self.monitor.generate_daily_report()
            return web.Response(text=report)
        
        app = web.Application()
        app.router.add_post('/trigger/generate', trigger_generation)
        app.router.add_get('/health', get_health)
        app.router.add_get('/report', get_report)
        
        runner = web.AppRunner(app)
        await runner.setup()
        site = web.TCPSite(runner, 'localhost', Config.API_PORT)
        await site.start()
        
        logger.info(f"Manual trigger API running on http://localhost:{Config.API_PORT}")
    
    async def run(self):
        """Main orchestrator"""
        logger.info("=" * 60)
        logger.info("🚀 UNIFIED AUTOMATION SYSTEM STARTED")
        logger.info("=" * 60)
        logger.info("Components:")
        logger.info("  ✓ Data Collection (15 min intervals)")
        logger.info("  ✓ Content Generation (intelligent triggers)")
        logger.info("  ✓ Multi-Platform Publishing")
        logger.info("  ✓ Monitoring & Analytics")
        logger.info("  ✓ Manual Trigger API (port 8089)")
        logger.info("=" * 60)
        
        # Start all components
        tasks = [
            asyncio.create_task(self.data_collection_cycle()),
            asyncio.create_task(self.scheduled_tasks()),
            asyncio.create_task(self.manual_trigger_server())
        ]
        
        try:
            await asyncio.gather(*tasks)
        except KeyboardInterrupt:
            logger.info("Shutdown requested")
            self.running = False

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

async def main():
    """Main entry point"""
    scheduler = UnifiedScheduler()
    await scheduler.run()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 System stopped")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)