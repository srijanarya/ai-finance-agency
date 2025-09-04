#!/usr/bin/env python3
"""
Automated Content Publishing Pipeline
Publishes fresh market content to @AIFinanceNews2024 during market hours
"""

import asyncio
import schedule
import time
import pytz
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json
import logging
import requests
from multi_agent_orchestrator import MultiAgentOrchestrator, AgentRole
from real_time_market_data_fix import RealTimeMarketDataManager
import sqlite3
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('automated_publisher.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AutomatedPublisher:
    """
    24/7 Automated Content Publishing System
    Publishes real-time market content during trading hours
    """
    
    def __init__(self):
        self.orchestrator = MultiAgentOrchestrator()
        self.market_manager = RealTimeMarketDataManager()
        self.ist = pytz.timezone('Asia/Kolkata')
        
        # Telegram configuration
        self.bot_token = "8478124403:AAFNni_9GQtWwrzk3ElhkMkTKljbSQyWp9Y"
        self.channel = "@AIFinanceNews2024"
        self.telegram_api = f"https://api.telegram.org/bot{self.bot_token}"
        
        # Publishing settings
        self.content_queue = []
        self.last_published = {}
        self.rate_limits = {
            'market_update': 30,  # minutes
            'news_alert': 15,     # minutes
            'analysis': 60,       # minutes
            'closing_summary': 1440  # daily
        }
        
        # Initialize database
        self.init_database()
        
        logger.info("🚀 Automated Publisher initialized")
    
    def init_database(self):
        """Initialize publishing tracking database"""
        conn = sqlite3.connect('data/agency.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS published_content (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_type TEXT,
                title TEXT,
                content TEXT,
                channel TEXT,
                published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                market_data TEXT,
                engagement_metrics TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS publishing_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_type TEXT,
                priority INTEGER,
                scheduled_time TEXT,
                content_data TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("📊 Database initialized")
    
    def is_market_hours(self) -> bool:
        """Check if Indian markets are open"""
        now = datetime.now(self.ist)
        
        # Market hours: 9:15 AM to 3:30 PM IST, Monday to Friday
        if now.weekday() >= 5:  # Saturday = 5, Sunday = 6
            return False
        
        market_open = now.replace(hour=9, minute=15, second=0, microsecond=0)
        market_close = now.replace(hour=15, minute=30, second=0, microsecond=0)
        
        return market_open <= now <= market_close
    
    def is_pre_market(self) -> bool:
        """Check if it's pre-market hours (8:00-9:15 AM)"""
        now = datetime.now(self.ist)
        if now.weekday() >= 5:
            return False
        
        pre_start = now.replace(hour=8, minute=0, second=0, microsecond=0)
        market_open = now.replace(hour=9, minute=15, second=0, microsecond=0)
        
        return pre_start <= now < market_open
    
    def is_post_market(self) -> bool:
        """Check if it's post-market hours (3:30-5:00 PM)"""
        now = datetime.now(self.ist)
        if now.weekday() >= 5:
            return False
        
        market_close = now.replace(hour=15, minute=30, second=0, microsecond=0)
        post_end = now.replace(hour=17, minute=0, second=0, microsecond=0)
        
        return market_close < now <= post_end
    
    def can_publish(self, content_type: str) -> bool:
        """Check if we can publish based on rate limits"""
        if content_type not in self.last_published:
            return True
        
        last_time = self.last_published[content_type]
        rate_limit = self.rate_limits.get(content_type, 60)
        
        time_diff = (datetime.now() - last_time).total_seconds() / 60
        return time_diff >= rate_limit
    
    async def send_to_telegram(self, message: str, parse_mode: str = 'HTML') -> bool:
        """Send message to Telegram channel"""
        try:
            payload = {
                'chat_id': self.channel,
                'text': message,
                'parse_mode': parse_mode,
                'disable_web_page_preview': False
            }
            
            response = requests.post(f"{self.telegram_api}/sendMessage", json=payload)
            
            if response.status_code == 200:
                result = response.json()
                if result['ok']:
                    logger.info(f"✅ Message sent to {self.channel}")
                    return True
                else:
                    logger.error(f"❌ Telegram API error: {result}")
                    return False
            else:
                logger.error(f"❌ HTTP error {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error sending to Telegram: {e}")
            return False
    
    async def generate_market_update(self) -> Optional[Dict]:
        """Generate real-time market update"""
        try:
            logger.info("📊 Generating market update...")
            
            # Get fresh market data
            market_data = self.market_manager.get_comprehensive_market_data()
            
            # Validate data freshness
            if not self.market_manager.validate_data_freshness(market_data):
                logger.warning("⚠️ Market data may be stale")
            
            # Generate content using research agent
            research_task = {
                'description': 'Generate real-time market update',
                'topic': 'Current market levels and sentiment'
            }
            
            result = await self.orchestrator.agents[AgentRole.RESEARCHER].execute_task(research_task)
            
            if result['status'] == 'success':
                research_data = result['data']
                
                # Create formatted message
                nifty = research_data['key_data']['nifty']
                banknifty = research_data['key_data']['banknifty']
                nifty_change = research_data['key_data']['nifty_change']
                banknifty_change = research_data['key_data']['banknifty_change']
                
                # Determine emoji based on change
                nifty_emoji = "📈" if nifty_change > 0 else "📉" if nifty_change < 0 else "➡️"
                bank_emoji = "🏦📈" if banknifty_change > 0 else "🏦📉" if banknifty_change < 0 else "🏦➡️"
                
                market_status = "🟢 LIVE" if self.is_market_hours() else "🔴 CLOSED"
                
                message = f"""🔔 <b>Market Update</b> {market_status}
                
{nifty_emoji} <b>NIFTY:</b> {nifty:,.0f} ({nifty_change:+.2f}%)
{bank_emoji} <b>BankNifty:</b> {banknifty:,.0f} ({banknifty_change:+.2f}%)

📊 <b>Key Levels:</b>
• Support: {research_data['key_data'].get('nifty_support', 'N/A'):,.0f}
• Resistance: {research_data['key_data'].get('nifty_resistance', 'N/A'):,.0f}

🎯 <b>Sentiment:</b> {research_data['sentiment'].title()}

<i>Remember: Always verify data from multiple sources!</i>
<i>Educational purpose only.</i>

@AIFinanceNews2024"""
                
                return {
                    'type': 'market_update',
                    'message': message,
                    'market_data': market_data,
                    'title': f"Market Update - NIFTY {nifty:,.0f}"
                }
            else:
                logger.error(f"❌ Failed to generate market update: {result.get('error')}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Error generating market update: {e}")
            return None
    
    async def generate_opening_bell(self) -> Optional[Dict]:
        """Generate opening bell content"""
        try:
            logger.info("🔔 Generating opening bell content...")
            
            market_data = self.market_manager.get_comprehensive_market_data()
            nifty_data = market_data['indices']['nifty']
            banknifty_data = market_data['indices']['banknifty']
            
            message = f"""🔔 <b>Opening Bell</b> 🟢
            
Good Morning Traders! 🌅

📈 <b>Pre-Market Levels:</b>
• NIFTY: {nifty_data['current_price']:,.0f}
• BankNifty: {banknifty_data['current_price']:,.0f}

🎯 <b>Key Levels to Watch:</b>
• NIFTY Support: {nifty_data['support']:,.0f}
• NIFTY Resistance: {nifty_data['resistance']:,.0f}

📊 <b>Market Theme:</b> {market_data['content_hints']['key_theme']}

🚀 <b>Strategy:</b> Watch for breakouts and respect key levels

<i>Remember: Always verify data from multiple sources!</i>
<i>Educational purpose only.</i>

@AIFinanceNews2024"""
            
            return {
                'type': 'opening_bell',
                'message': message,
                'market_data': market_data,
                'title': "Opening Bell Analysis"
            }
            
        except Exception as e:
            logger.error(f"❌ Error generating opening bell: {e}")
            return None
    
    async def generate_closing_summary(self) -> Optional[Dict]:
        """Generate market closing summary"""
        try:
            logger.info("📊 Generating closing summary...")
            
            market_data = self.market_manager.get_comprehensive_market_data()
            nifty_data = market_data['indices']['nifty']
            banknifty_data = market_data['indices']['banknifty']
            
            # Determine market performance
            nifty_perf = "gained" if nifty_data['change'] > 0 else "declined"
            bank_perf = "outperformed" if banknifty_data['change_percent'] > nifty_data['change_percent'] else "underperformed"
            
            message = f"""📊 <b>Market Closing Summary</b> 🔴
            
<b>Final Levels:</b>
📈 NIFTY: {nifty_data['current_price']:,.0f} ({nifty_data['change']:+.0f} | {nifty_data['change_percent']:+.2f}%)
🏦 BankNifty: {banknifty_data['current_price']:,.0f} ({banknifty_data['change']:+.0f} | {banknifty_data['change_percent']:+.2f}%)

📝 <b>Day Summary:</b>
• NIFTY {nifty_perf} {abs(nifty_data['change_percent']):.2f}%
• Banking sector {bank_perf} broader market
• Volume: {nifty_data.get('volume', 0)/1000000:.0f}M shares

🎯 <b>Tomorrow's Levels:</b>
• Watch {nifty_data['support']:,.0f} support
• {nifty_data['resistance']:,.0f} key resistance

<i>Remember: Always verify data from multiple sources!</i>
<i>Educational purpose only.</i>

@AIFinanceNews2024"""
            
            return {
                'type': 'closing_summary',
                'message': message,
                'market_data': market_data,
                'title': "Market Closing Summary"
            }
            
        except Exception as e:
            logger.error(f"❌ Error generating closing summary: {e}")
            return None
    
    async def publish_content(self, content: Dict) -> bool:
        """Publish content to Telegram"""
        try:
            if not self.can_publish(content['type']):
                logger.info(f"⏳ Rate limit active for {content['type']}")
                return False
            
            # Send to Telegram
            success = await self.send_to_telegram(content['message'])
            
            if success:
                # Update rate limit tracking
                self.last_published[content['type']] = datetime.now()
                
                # Save to database
                self.save_published_content(content)
                
                logger.info(f"✅ Published {content['type']}: {content['title']}")
                return True
            else:
                logger.error(f"❌ Failed to publish {content['type']}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error publishing content: {e}")
            return False
    
    def save_published_content(self, content: Dict):
        """Save published content to database"""
        try:
            conn = sqlite3.connect('data/agency.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO published_content (content_type, title, content, channel, market_data)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                content['type'],
                content['title'],
                content['message'],
                self.channel,
                json.dumps(content.get('market_data', {}))
            ))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"❌ Error saving published content: {e}")
    
    async def run_publishing_cycle(self):
        """Run one publishing cycle based on market timing"""
        try:
            now = datetime.now(self.ist)
            hour = now.hour
            minute = now.minute
            
            content = None
            
            # Opening bell (9:15 AM)
            if hour == 9 and minute == 15 and self.can_publish('opening_bell'):
                content = await self.generate_opening_bell()
            
            # Market updates during trading hours (every 30 minutes)
            elif self.is_market_hours() and minute in [0, 30] and self.can_publish('market_update'):
                content = await self.generate_market_update()
            
            # Closing summary (3:30 PM)
            elif hour == 15 and minute == 30 and self.can_publish('closing_summary'):
                content = await self.generate_closing_summary()
            
            # Pre-market update (8:30 AM)
            elif hour == 8 and minute == 30 and self.can_publish('pre_market'):
                content = await self.generate_market_update()
                if content:
                    content['type'] = 'pre_market'
            
            if content:
                await self.publish_content(content)
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Error in publishing cycle: {e}")
            return False
    
    async def start_automation(self):
        """Start 24/7 automated publishing"""
        logger.info("🚀 Starting 24/7 Automated Publishing System")
        logger.info(f"📺 Publishing to: {self.channel}")
        logger.info(f"⏰ Current IST time: {datetime.now(self.ist).strftime('%Y-%m-%d %H:%M:%S')}")
        
        cycle_count = 0
        
        while True:
            try:
                cycle_count += 1
                current_time = datetime.now(self.ist)
                
                logger.info(f"🔄 Cycle #{cycle_count} - {current_time.strftime('%H:%M:%S IST')}")
                
                # Determine market session
                if self.is_market_hours():
                    session = "🟢 MARKET OPEN"
                elif self.is_pre_market():
                    session = "🟡 PRE-MARKET"
                elif self.is_post_market():
                    session = "🟠 POST-MARKET"
                else:
                    session = "🔴 MARKET CLOSED"
                
                logger.info(f"📊 Session: {session}")
                
                # Run publishing cycle
                published = await self.run_publishing_cycle()
                
                if published:
                    logger.info("📤 Content published this cycle")
                else:
                    logger.info("⏸️ No content published this cycle")
                
                # Wait 1 minute before next cycle
                await asyncio.sleep(60)
                
            except KeyboardInterrupt:
                logger.info("⏹️ Automation stopped by user")
                break
            except Exception as e:
                logger.error(f"❌ Error in automation cycle: {e}")
                await asyncio.sleep(60)  # Continue after error
    
    def get_publishing_stats(self) -> Dict:
        """Get publishing statistics"""
        try:
            conn = sqlite3.connect('data/agency.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT 
                    content_type,
                    COUNT(*) as count,
                    MAX(published_at) as last_published
                FROM published_content 
                WHERE published_at >= datetime('now', '-24 hours')
                GROUP BY content_type
            ''')
            
            stats = {}
            for row in cursor.fetchall():
                stats[row[0]] = {
                    'count': row[1],
                    'last_published': row[2]
                }
            
            conn.close()
            return stats
        except Exception as e:
            logger.error(f"❌ Error getting stats: {e}")
            return {}

async def main():
    """Main function to start automated publishing"""
    print("🚀 AUTOMATED CONTENT PUBLISHING SYSTEM")
    print("=" * 60)
    
    publisher = AutomatedPublisher()
    
    print(f"📺 Channel: {publisher.channel}")
    print(f"⏰ Current IST: {datetime.now(publisher.ist).strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📊 Market Status: {'🟢 OPEN' if publisher.is_market_hours() else '🔴 CLOSED'}")
    
    print("\n📋 Publishing Schedule:")
    print("• 8:30 AM - Pre-market update")
    print("• 9:15 AM - Opening bell")
    print("• Market hours - Updates every 30 minutes")
    print("• 3:30 PM - Closing summary")
    
    print("\n🔄 Rate Limits:")
    for content_type, limit in publisher.rate_limits.items():
        print(f"• {content_type}: {limit} minutes")
    
    try:
        # Show current stats
        stats = publisher.get_publishing_stats()
        if stats:
            print("\n📊 Last 24h Publishing Stats:")
            for content_type, data in stats.items():
                print(f"• {content_type}: {data['count']} posts")
        
        print("\n" + "=" * 60)
        print("🎯 Starting automation... Press Ctrl+C to stop")
        print("=" * 60 + "\n")
        
        await publisher.start_automation()
        
    except KeyboardInterrupt:
        print("\n✅ Automated publishing stopped")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())