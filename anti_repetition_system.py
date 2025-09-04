#!/usr/bin/env python3
"""
Anti-Repetition System for Market Content Generator
Prevents duplicate and repetitive content on Telegram and other platforms
"""

import hashlib
import json
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set
import random
import logging
from dataclasses import dataclass, asdict

@dataclass
class ContentRecord:
    """Record of previously generated content"""
    content_hash: str
    content_type: str
    topic: str
    platforms: List[str]
    timestamp: datetime
    content_preview: str
    market_data_hash: str

class AntiRepetitionManager:
    """Manages content deduplication and variation"""
    
    def __init__(self, db_path: str = "content_history.db"):
        self.db_path = db_path
        self.logger = logging.getLogger(__name__)
        self.setup_database()
        
        # Market wisdom variations to avoid repetitive quotes
        self.market_wisdom = [
            "Bulls make money, bears make money, but pigs get slaughtered.",
            "The market can remain irrational longer than you can remain solvent.",
            "Buy when there's blood in the streets, even if it's your own.",
            "The trend is your friend until it bends or ends.",
            "Don't catch a falling knife - wait for the bounce.",
            "Markets climb a wall of worry and slide down a slope of hope.",
            "Time in the market beats timing the market.",
            "The market is a voting machine in the short run, but a weighing machine in the long run.",
            "Never invest money you can't afford to lose.",
            "Diversification is the only free lunch in investing.",
            "Fear and greed drive all markets - know which one is in control.",
            "When everyone is greedy, be fearful. When everyone is fearful, be greedy.",
            "The four most dangerous words in investing are 'this time is different'.",
            "Cut your losses short and let your profits run.",
            "A rising tide lifts all boats, but the tide can turn quickly."
        ]
        
        # Content variation templates
        self.brief_templates = [
            "📊 MARKET SNAPSHOT",
            "🎯 MARKET PULSE", 
            "📈 TRADING UPDATE",
            "💰 MARKET WATCH",
            "🔥 MARKET ROUNDUP",
            "⚡ TRADING ALERT",
            "🎪 MARKET CIRCUS",
            "🚀 MARKET MOMENTUM"
        ]
        
        # Emoji variations for trends
        self.trend_emojis = {
            'positive': ['🚀', '📈', '💚', '⬆️', '🔥', '💎', '🌟'],
            'negative': ['📉', '❤️‍🩹', '⬇️', '🔴', '💔', '😰', '⚠️'],
            'neutral': ['➡️', '⚖️', '🤔', '👀', '📊', '🎭', '🔄']
        }

    def setup_database(self):
        """Setup SQLite database for content tracking"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS content_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_hash TEXT UNIQUE,
                content_type TEXT,
                topic TEXT,
                platforms TEXT,
                timestamp DATETIME,
                content_preview TEXT,
                market_data_hash TEXT,
                similarity_score REAL DEFAULT 0.0
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS message_patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pattern_hash TEXT UNIQUE,
                pattern_type TEXT,
                frequency INTEGER DEFAULT 1,
                last_used DATETIME,
                blocked_until DATETIME
            )
        """)
        
        conn.commit()
        conn.close()

    def _generate_content_hash(self, content: str, market_data: dict) -> tuple:
        """Generate hash for content and market data"""
        # Normalize content for hashing (remove timestamps, minor variations)
        normalized_content = content.lower().strip()
        # Remove dynamic elements like timestamps and specific prices
        import re
        normalized_content = re.sub(r'\d{2}:\d{2}', '', normalized_content)
        normalized_content = re.sub(r'₹[\d,]+', 'PRICE', normalized_content)
        normalized_content = re.sub(r'\d+\.\d+%', 'PERCENT', normalized_content)
        
        content_hash = hashlib.sha256(normalized_content.encode()).hexdigest()[:16]
        
        # Hash market data structure (not values, but pattern)
        market_structure = {
            'indices_count': len(market_data.get('indices', {})),
            'has_gainers': bool(market_data.get('movers', {}).get('gainers')),
            'has_losers': bool(market_data.get('movers', {}).get('losers')),
            'has_fii_dii': bool(market_data.get('fii_dii')),
            'market_status': market_data.get('market_status', 'UNKNOWN')
        }
        market_hash = hashlib.sha256(json.dumps(market_structure, sort_keys=True).encode()).hexdigest()[:16]
        
        return content_hash, market_hash

    def is_content_repetitive(self, content: str, market_data: dict, content_type: str, lookback_hours: int = 6) -> tuple:
        """Check if content is too similar to recent posts"""
        content_hash, market_hash = self._generate_content_hash(content, market_data)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check for exact duplicates in last 6 hours
        cutoff_time = datetime.now() - timedelta(hours=lookback_hours)
        
        cursor.execute("""
            SELECT content_hash, content_preview, timestamp 
            FROM content_history 
            WHERE timestamp > ? AND content_type = ?
            ORDER BY timestamp DESC
        """, (cutoff_time, content_type))
        
        recent_content = cursor.fetchall()
        conn.close()
        
        # Check exact hash match
        for record_hash, preview, timestamp in recent_content:
            if record_hash == content_hash:
                return True, f"Exact duplicate found from {timestamp}"
        
        # Check for high similarity (placeholder - could implement fuzzy matching)
        if len(recent_content) >= 3:
            return True, "Too many similar posts recently - adding variation"
        
        return False, "Content is unique enough"

    def record_content(self, content: str, content_type: str, topic: str, platforms: List[str], market_data: dict):
        """Record generated content to prevent future duplicates"""
        content_hash, market_hash = self._generate_content_hash(content, market_data)
        
        # Create preview (first 100 chars)
        preview = content[:100] + "..." if len(content) > 100 else content
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                INSERT OR REPLACE INTO content_history 
                (content_hash, content_type, topic, platforms, timestamp, content_preview, market_data_hash)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                content_hash,
                content_type, 
                topic,
                json.dumps(platforms),
                datetime.now(),
                preview,
                market_hash
            ))
            conn.commit()
            self.logger.info(f"Recorded content: {content_type} - {preview[:50]}")
        except Exception as e:
            self.logger.error(f"Error recording content: {e}")
        finally:
            conn.close()

    def get_varied_wisdom(self) -> str:
        """Get a varied market wisdom quote"""
        # Check which quotes were used recently
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cutoff_time = datetime.now() - timedelta(hours=12)  # Don't repeat wisdom within 12 hours
        
        cursor.execute("""
            SELECT content_preview FROM content_history 
            WHERE timestamp > ? AND content_type LIKE '%wisdom%'
        """, (cutoff_time,))
        
        recent_wisdom = [row[0] for row in cursor.fetchall()]
        conn.close()
        
        # Filter out recently used wisdom
        available_wisdom = [w for w in self.market_wisdom if not any(w in recent for recent in recent_wisdom)]
        
        # If all wisdom was used recently, reset and use any
        if not available_wisdom:
            available_wisdom = self.market_wisdom
        
        return random.choice(available_wisdom)

    def vary_content_format(self, original_content: str, content_type: str, market_data: dict) -> str:
        """Apply variations to prevent repetitive formatting"""
        
        # Random header variation
        if "MARKET BRIEF" in original_content:
            new_header = random.choice(self.brief_templates)
            original_content = original_content.replace("MARKET BRIEF", new_header)
        
        # Add random market wisdom
        wisdom = self.get_varied_wisdom()
        original_content = f"💡 {wisdom}\n\n{original_content}"
        
        # Vary trend indicators
        for trend, emojis in self.trend_emojis.items():
            # Replace standard emojis with varied ones
            if trend == 'positive' and '📈' in original_content:
                original_content = original_content.replace('📈', random.choice(emojis))
            elif trend == 'negative' and '📉' in original_content:
                original_content = original_content.replace('📉', random.choice(emojis))
        
        # Add timestamp variation to make each post unique
        unique_footer = f"\n\n🕐 Generated: {datetime.now().strftime('%H:%M')} | Always verify data from multiple sources!"
        original_content += unique_footer
        
        return original_content

    def cleanup_old_records(self, days: int = 7):
        """Clean up old content records to prevent database bloat"""
        cutoff_time = datetime.now() - timedelta(days=days)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM content_history WHERE timestamp < ?", (cutoff_time,))
        cursor.execute("DELETE FROM message_patterns WHERE last_used < ?", (cutoff_time,))
        
        deleted_rows = cursor.rowcount
        conn.commit()
        conn.close()
        
        if deleted_rows > 0:
            self.logger.info(f"Cleaned up {deleted_rows} old content records")

    def should_skip_posting(self, content_type: str, platform: str) -> tuple:
        """Determine if posting should be skipped due to recent activity"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Check frequency of posts in last hour
        cutoff_time = datetime.now() - timedelta(hours=1)
        
        cursor.execute("""
            SELECT COUNT(*) FROM content_history 
            WHERE timestamp > ? AND content_type = ? AND platforms LIKE ?
        """, (cutoff_time, content_type, f'%{platform}%'))
        
        recent_count = cursor.fetchone()[0]
        conn.close()
        
        # Skip if too many posts recently
        if content_type == "market_brief" and recent_count >= 2:
            return True, f"Already posted {recent_count} {content_type} to {platform} in last hour"
        elif content_type in ["educational", "analysis"] and recent_count >= 1:
            return True, f"Already posted {content_type} to {platform} recently"
        
        return False, "Posting frequency OK"

# Integration class for existing market content generator
class EnhancedMarketContentGenerator:
    """Enhanced version with anti-repetition features"""
    
    def __init__(self):
        from market_content_generator import MarketContentGenerator
        self.base_generator = MarketContentGenerator()
        self.anti_repeat = AntiRepetitionManager()
        self.logger = logging.getLogger(__name__)

    async def generate_unique_market_content(self):
        """Generate market content with anti-repetition checks"""
        
        print("🚀 ENHANCED MARKET-POWERED CONTENT GENERATOR")
        print("🛡️ Anti-Repetition System: ACTIVE")
        print("=" * 50)
        
        # Get fresh market data
        try:
            market_brief = await self.base_generator.integrator.generate_market_brief()
            print("✅ Fresh market data validated")
        except ValueError as e:
            print(f"❌ Data validation failed: {e}")
            return []
        
        # Content types with anti-repetition logic
        content_configs = [
            {
                "type": "market_brief",
                "topic": "Live Market Update",
                "platforms": ["telegram", "linkedin", "whatsapp"]
            },
            {
                "type": "educational", 
                "topic": "Understanding Market Volatility - Today's Example",
                "platforms": ["instagram", "twitter"]
            },
            {
                "type": "analysis",
                "topic": "FII/DII Impact on Today's Market", 
                "platforms": ["linkedin", "blog"]
            }
        ]
        
        generated_content = []
        
        for config in content_configs:
            print(f"\n📝 Processing: {config['topic']}")
            
            # Check if we should skip due to frequency limits
            for platform in config['platforms']:
                should_skip, reason = self.anti_repeat.should_skip_posting(config['type'], platform)
                if should_skip:
                    print(f"⏸️ Skipping {platform}: {reason}")
                    continue
            
            # Check for repetitive content
            mock_market_data = {"indices": {}, "movers": {}, "market_status": "TEST"}
            is_repetitive, reason = self.anti_repeat.is_content_repetitive(
                market_brief, mock_market_data, config['type']
            )
            
            if is_repetitive:
                print(f"🔄 Content too repetitive: {reason}")
                # Apply variations
                varied_content = self.anti_repeat.vary_content_format(
                    market_brief, config['type'], mock_market_data
                )
                print("✨ Applied content variations")
            else:
                varied_content = market_brief
                print("✅ Content is unique")
            
            # Generate final payload
            payload = {
                "content_type": config["type"],
                "topic": config["topic"], 
                "platforms": config["platforms"],
                "market_data": varied_content,
                "anti_repetition": {
                    "system_active": True,
                    "content_varied": is_repetitive,
                    "timestamp": datetime.now().isoformat()
                }
            }
            
            # Record this content to prevent future duplicates
            self.anti_repeat.record_content(
                varied_content, 
                config['type'], 
                config['topic'], 
                config['platforms'],
                mock_market_data
            )
            
            generated_content.append({
                "config": config,
                "result": {"pipeline_id": f"unique_{len(generated_content)}", "status": "enhanced"},
                "payload": payload
            })
            
            print(f"✅ Generated unique content: {config['type']}")
        
        # Cleanup old records
        self.anti_repeat.cleanup_old_records()
        
        return generated_content

async def main():
    """Test the anti-repetition system"""
    print("🧪 TESTING ANTI-REPETITION SYSTEM")
    print("=" * 50)
    
    enhanced_generator = EnhancedMarketContentGenerator()
    
    # Generate content multiple times to test deduplication
    for i in range(3):
        print(f"\n🔄 Test Run #{i+1}")
        print("-" * 30)
        
        content = await enhanced_generator.generate_unique_market_content()
        print(f"Generated {len(content)} unique content pieces")
        
        # Wait between runs to simulate real usage
        import asyncio
        await asyncio.sleep(2)
    
    print("\n✅ Anti-repetition system tested successfully!")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())