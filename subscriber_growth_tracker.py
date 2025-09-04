#!/usr/bin/env python3
"""
Subscriber Growth Tracking System for AI Finance Agency
Monitor growth across Telegram, LinkedIn, WhatsApp and other platforms
"""

import sqlite3
import asyncio
import aiohttp
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import json
import requests

class SubscriberGrowthTracker:
    """Track subscriber growth across all platforms"""
    
    def __init__(self):
        self.db_path = "subscriber_growth.db"
        self.setup_database()
        
        # Platform configurations (add your API keys)
        self.platforms = {
            "telegram": {
                "bot_token": None,  # Add your Telegram bot token
                "channel_id": "@AIFinanceNews2024",
                "api_base": "https://api.telegram.org/bot"
            },
            "linkedin": {
                "access_token": None,  # Add LinkedIn access token
                "company_page": None,  # Add company page ID
                "api_base": "https://api.linkedin.com/v2"
            },
            "whatsapp": {
                "business_id": None,  # Add WhatsApp Business ID
                "access_token": None,
                "api_base": "https://graph.facebook.com/v18.0"
            },
            "youtube": {
                "channel_id": None,  # Add YouTube channel ID
                "api_key": None,     # Add YouTube API key
                "api_base": "https://www.googleapis.com/youtube/v3"
            }
        }
    
    def setup_database(self):
        """Setup subscriber tracking database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS subscriber_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                platform TEXT,
                subscriber_count INTEGER,
                growth_rate REAL,
                daily_growth INTEGER,
                weekly_growth INTEGER,
                monthly_growth INTEGER,
                timestamp DATETIME,
                data_source TEXT,
                content_correlation TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS growth_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                platform TEXT,
                event_type TEXT,
                event_description TEXT,
                impact_score REAL,
                subscriber_change INTEGER,
                timestamp DATETIME,
                content_id TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS engagement_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                platform TEXT,
                metric_type TEXT,
                metric_value REAL,
                timestamp DATETIME,
                content_reference TEXT
            )
        """)
        
        conn.commit()
        conn.close()
    
    async def fetch_telegram_stats(self) -> Optional[Dict]:
        """Fetch Telegram channel statistics"""
        if not self.platforms["telegram"]["bot_token"]:
            return self._generate_mock_data("telegram", 2847)
        
        try:
            bot_token = self.platforms["telegram"]["bot_token"]
            channel_id = self.platforms["telegram"]["channel_id"]
            
            async with aiohttp.ClientSession() as session:
                # Get member count
                url = f"{self.platforms['telegram']['api_base']}{bot_token}/getChatMemberCount"
                params = {"chat_id": channel_id}
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        member_count = data.get('result', 0)
                        
                        return {
                            "platform": "telegram",
                            "subscribers": member_count,
                            "timestamp": datetime.now(),
                            "source": "api"
                        }
        except Exception as e:
            print(f"Telegram API error: {e}")
        
        return None
    
    async def fetch_linkedin_stats(self) -> Optional[Dict]:
        """Fetch LinkedIn page followers"""
        if not self.platforms["linkedin"]["access_token"]:
            return self._generate_mock_data("linkedin", 1423)
        
        try:
            headers = {
                "Authorization": f"Bearer {self.platforms['linkedin']['access_token']}",
                "Content-Type": "application/json"
            }
            
            # LinkedIn API call would go here
            # For now, return mock data
            return self._generate_mock_data("linkedin", 1423)
            
        except Exception as e:
            print(f"LinkedIn API error: {e}")
        
        return None
    
    async def fetch_whatsapp_stats(self) -> Optional[Dict]:
        """Fetch WhatsApp Business subscriber count"""
        if not self.platforms["whatsapp"]["access_token"]:
            return self._generate_mock_data("whatsapp", 967)
        
        # WhatsApp Business API integration would go here
        return self._generate_mock_data("whatsapp", 967)
    
    def _generate_mock_data(self, platform: str, base_count: int) -> Dict:
        """Generate realistic mock data for testing"""
        import random
        
        # Add some realistic variation
        variation = random.randint(-5, 15)  # Slight growth bias
        current_count = base_count + variation
        
        return {
            "platform": platform,
            "subscribers": current_count,
            "timestamp": datetime.now(),
            "source": "mock"
        }
    
    def store_subscriber_data(self, data: Dict):
        """Store subscriber data and calculate growth metrics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        platform = data["platform"]
        current_count = data["subscribers"]
        timestamp = data["timestamp"]
        
        # Get previous counts for growth calculation
        cursor.execute("""
            SELECT subscriber_count, timestamp FROM subscriber_metrics 
            WHERE platform = ? 
            ORDER BY timestamp DESC 
            LIMIT 3
        """, (platform,))
        
        previous_records = cursor.fetchall()
        
        # Calculate growth rates
        daily_growth = 0
        weekly_growth = 0
        monthly_growth = 0
        growth_rate = 0.0
        
        if previous_records:
            # Daily growth
            if len(previous_records) >= 1:
                prev_count = previous_records[0][0]
                daily_growth = current_count - prev_count
                growth_rate = ((current_count - prev_count) / prev_count * 100) if prev_count > 0 else 0
            
            # Weekly growth (if we have enough data)
            if len(previous_records) >= 7:
                week_ago_count = previous_records[6][0] if len(previous_records) > 6 else previous_records[-1][0]
                weekly_growth = current_count - week_ago_count
            
            # Monthly growth (if we have enough data)  
            if len(previous_records) >= 30:
                month_ago_count = previous_records[29][0] if len(previous_records) > 29 else previous_records[-1][0]
                monthly_growth = current_count - month_ago_count
        
        # Store the data
        cursor.execute("""
            INSERT INTO subscriber_metrics 
            (platform, subscriber_count, growth_rate, daily_growth, weekly_growth, 
             monthly_growth, timestamp, data_source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            platform,
            current_count, 
            growth_rate,
            daily_growth,
            weekly_growth,
            monthly_growth,
            timestamp,
            data.get("source", "api")
        ))
        
        # Record significant growth events
        if abs(daily_growth) > 50:  # Significant daily growth
            event_type = "growth_spike" if daily_growth > 0 else "subscriber_drop"
            cursor.execute("""
                INSERT INTO growth_events 
                (platform, event_type, event_description, impact_score, subscriber_change, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                platform,
                event_type,
                f"{'Gained' if daily_growth > 0 else 'Lost'} {abs(daily_growth)} subscribers in one day",
                abs(daily_growth) / 100.0,  # Impact score
                daily_growth,
                timestamp
            ))
        
        conn.commit()
        conn.close()
        
        print(f"📊 {platform.title()}: {current_count:,} subscribers ({daily_growth:+d} today, {growth_rate:+.1f}%)")
    
    async def collect_all_platform_data(self):
        """Collect subscriber data from all platforms"""
        print("🔄 Collecting subscriber data from all platforms...")
        
        # Fetch data from each platform
        telegram_data = await self.fetch_telegram_stats()
        linkedin_data = await self.fetch_linkedin_stats()
        whatsapp_data = await self.fetch_whatsapp_stats()
        
        # Store data
        for data in [telegram_data, linkedin_data, whatsapp_data]:
            if data:
                self.store_subscriber_data(data)
    
    def generate_growth_report(self, days_back: int = 30) -> str:
        """Generate comprehensive growth report"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        # Get latest subscriber counts per platform
        cursor.execute("""
            SELECT platform, 
                   MAX(subscriber_count) as current_subscribers,
                   AVG(growth_rate) as avg_growth_rate,
                   SUM(daily_growth) as total_growth
            FROM subscriber_metrics 
            WHERE timestamp > ?
            GROUP BY platform
            ORDER BY current_subscribers DESC
        """, (cutoff_date,))
        
        platform_stats = cursor.fetchall()
        
        # Get notable growth events
        cursor.execute("""
            SELECT platform, event_type, event_description, subscriber_change, timestamp
            FROM growth_events 
            WHERE timestamp > ?
            ORDER BY impact_score DESC
            LIMIT 5
        """, (cutoff_date,))
        
        growth_events = cursor.fetchall()
        conn.close()
        
        # Generate report
        total_subscribers = sum(stats[1] for stats in platform_stats)
        total_growth = sum(stats[3] for stats in platform_stats if stats[3])
        
        report = f"""
📈 **SUBSCRIBER GROWTH REPORT**
📅 Last {days_back} Days Performance
{'=' * 50}

🎯 **Overall Performance:**
• Total Subscribers: {total_subscribers:,}
• Total Growth: {total_growth:+,} subscribers
• Avg Growth Rate: {sum(stats[2] for stats in platform_stats if stats[2]) / len(platform_stats):.1f}%

📊 **Platform Breakdown:**
"""
        
        for platform, subscribers, avg_growth, platform_total_growth in platform_stats:
            growth_emoji = "📈" if platform_total_growth > 0 else "📉" if platform_total_growth < 0 else "➡️"
            report += f"• {platform.title()}: {subscribers:,} subscribers ({platform_total_growth:+,}, {avg_growth:.1f}%) {growth_emoji}\n"
        
        if growth_events:
            report += f"\n🚀 **Notable Growth Events:**\n"
            for platform, event_type, description, change, timestamp in growth_events:
                event_date = datetime.fromisoformat(timestamp).strftime('%m/%d')
                report += f"• {event_date} - {platform.title()}: {description}\n"
        
        report += f"""
💡 **Growth Strategy Recommendations:**
• Focus on {platform_stats[0][0]} - highest subscriber base
• Investigate successful content that drives growth spikes
• Cross-promote across platforms to maximize reach
• Maintain consistent posting schedule during peak growth periods

🎯 **Next 30 Days Goal:**
• Target: {int(total_subscribers * 1.1):,} total subscribers (+10%)
• Daily target: {int(total_subscribers * 0.1 / 30):,} new subscribers per day
"""
        
        return report
    
    def get_growth_trends(self, platform: str, days: int = 7) -> Dict:
        """Get growth trends for a specific platform"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cutoff_date = datetime.now() - timedelta(days=days)
        
        cursor.execute("""
            SELECT DATE(timestamp) as date, 
                   MAX(subscriber_count) as subscribers,
                   SUM(daily_growth) as daily_growth
            FROM subscriber_metrics 
            WHERE platform = ? AND timestamp > ?
            GROUP BY DATE(timestamp)
            ORDER BY date
        """, (platform, cutoff_date))
        
        data = cursor.fetchall()
        conn.close()
        
        if not data:
            return {"error": "No data available"}
        
        dates = [row[0] for row in data]
        subscribers = [row[1] for row in data]
        growth = [row[2] for row in data]
        
        return {
            "platform": platform,
            "dates": dates,
            "subscribers": subscribers,
            "daily_growth": growth,
            "total_growth": sum(growth),
            "avg_daily_growth": sum(growth) / len(growth) if growth else 0
        }
    
    async def start_continuous_monitoring(self, interval_hours: int = 6):
        """Start continuous subscriber monitoring"""
        print(f"🔄 Starting continuous subscriber monitoring (every {interval_hours} hours)")
        
        while True:
            try:
                await self.collect_all_platform_data()
                
                # Wait for next collection
                await asyncio.sleep(interval_hours * 3600)
                
            except Exception as e:
                print(f"❌ Monitoring error: {e}")
                await asyncio.sleep(300)  # 5 minute retry

async def main():
    """Test subscriber growth tracking"""
    print("📈 SUBSCRIBER GROWTH TRACKER - DEMO")
    print("=" * 50)
    
    tracker = SubscriberGrowthTracker()
    
    # Collect data
    await tracker.collect_all_platform_data()
    
    # Wait a bit and collect again to show growth calculation
    print("\n⏳ Simulating time passage...")
    await asyncio.sleep(2)
    await tracker.collect_all_platform_data()
    
    # Generate growth report
    print("\n" + "=" * 50)
    report = tracker.generate_growth_report(7)
    print(report)
    
    # Show trends for Telegram
    print("\n📊 Telegram Growth Trend:")
    trends = tracker.get_growth_trends("telegram", 7)
    if "error" not in trends:
        print(f"• Total Growth: {trends['total_growth']:+,}")
        print(f"• Daily Average: {trends['avg_daily_growth']:+.1f}")

if __name__ == "__main__":
    asyncio.run(main())