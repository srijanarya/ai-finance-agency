#!/usr/bin/env python3
"""
Telegram News Broadcaster
Automatically sends scraped financial news to Telegram channel
"""

import sqlite3
import os
import time
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict
import logging
from dotenv import load_dotenv
import requests

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TelegramNewsBroadcaster:
    def __init__(self):
        """Initialize Telegram bot"""
        # Add these to your .env file:
        # TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
        # TELEGRAM_CHANNEL_ID=@your_channel_name or channel_id
        
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN', '')
        self.channel_id = os.getenv('TELEGRAM_CHANNEL_ID', '@AIFinanceAgency')
        self.db_path = 'data/agency.db'
        
        # Telegram API base URL
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"
        
        # Track sent messages to avoid duplicates
        self.sent_cache = set()
        
    def test_connection(self) -> bool:
        """Test Telegram bot connection"""
        if not self.bot_token:
            logger.error("TELEGRAM_BOT_TOKEN not configured in .env")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/getMe")
            if response.status_code == 200:
                bot_info = response.json()
                logger.info(f"Bot connected: @{bot_info['result']['username']}")
                return True
            else:
                logger.error(f"Bot connection failed: {response.text}")
                return False
        except Exception as e:
            logger.error(f"Failed to connect to Telegram: {e}")
            return False
    
    def get_latest_news(self, hours: int = 1) -> List[Dict]:
        """Fetch latest financial news from database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get recent high-relevance news
        time_threshold = (datetime.now() - timedelta(hours=hours)).isoformat()
        
        query = """
        SELECT id, title, content, source, url, scraped_date
        FROM financial_news
        WHERE scraped_date > ?
        AND (sent_to_telegram IS NULL OR sent_to_telegram = 0)
        ORDER BY scraped_date DESC
        LIMIT 10
        """
        
        cursor.execute(query, (time_threshold,))
        results = cursor.fetchall()
        conn.close()
        
        news_list = []
        for row in results:
            news_list.append({
                'id': row[0],
                'title': row[1],
                'summary': row[2],  # content field
                'source': row[3],
                'url': row[4],
                'created_at': row[5]
            })
        
        return news_list
    
    def format_telegram_message(self, news: Dict) -> str:
        """Format news for Telegram with trader focus"""
        # Emoji based on source
        source_emojis = {
            'bloomberg': '📰',
            'reuters': '🌐',
            'cnbc': '📺',
            'wsj': '📈',
            'marketwatch': '📊'
        }
        
        source_lower = news['source'].lower() if news['source'] else ''
        emoji = '📢'
        for key, val in source_emojis.items():
            if key in source_lower:
                emoji = val
                break
        
        # Format message with Markdown
        message = f"{emoji} *{news['title']}*\n\n"
        
        if news['summary']:
            # Truncate summary if too long
            summary = news['summary'][:500]
            if len(news['summary']) > 500:
                summary += "..."
            message += f"{summary}\n\n"
        
        # Add source and link
        if news['source']:
            message += f"📍 Source: {news['source']}\n"
        
        if news['url']:
            message += f"🔗 [Read More]({news['url']})\n"
        
        # Add timestamp
        try:
            timestamp = datetime.fromisoformat(news['created_at']).strftime("%H:%M")
            message += f"\n⏰ {timestamp}"
        except:
            pass
        
        # Add channel signature
        message += "\n\n@AIFinanceAgency"
        
        return message
    
    def send_to_telegram(self, message: str) -> bool:
        """Send message to Telegram channel"""
        if not self.bot_token:
            logger.error("Telegram bot token not configured")
            return False
            
        try:
            # Prepare request
            url = f"{self.base_url}/sendMessage"
            data = {
                'chat_id': self.channel_id,
                'text': message,
                'parse_mode': 'Markdown',
                'disable_web_page_preview': False
            }
            
            # Send message
            response = requests.post(url, json=data)
            
            if response.status_code == 200:
                logger.info("Message sent to Telegram successfully")
                return True
            else:
                logger.error(f"Failed to send to Telegram: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending to Telegram: {e}")
            return False
    
    def mark_as_sent(self, news_id: int):
        """Mark news as sent to Telegram"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Add column if it doesn't exist
        cursor.execute("""
            PRAGMA table_info(financial_news)
        """)
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'sent_to_telegram' not in columns:
            cursor.execute("""
                ALTER TABLE financial_news 
                ADD COLUMN sent_to_telegram INTEGER DEFAULT 0
            """)
        
        # Update record
        cursor.execute("""
            UPDATE financial_news 
            SET sent_to_telegram = 1 
            WHERE id = ?
        """, (news_id,))
        
        conn.commit()
        conn.close()
        
        # Add to cache
        self.sent_cache.add(news_id)
    
    def broadcast_news(self, max_messages: int = 5, delay_seconds: int = 10):
        """Broadcast latest news to Telegram channel"""
        # Test connection first
        if not self.test_connection():
            return 0
        
        # Get latest news
        news_list = self.get_latest_news(hours=24)
        
        if not news_list:
            logger.info("No new news to broadcast")
            return 0
        
        sent_count = 0
        for news in news_list[:max_messages]:
            # Skip if already in cache
            if news['id'] in self.sent_cache:
                continue
            
            # Format and send message
            message = self.format_telegram_message(news)
            
            if self.send_to_telegram(message):
                self.mark_as_sent(news['id'])
                sent_count += 1
                logger.info(f"Sent {sent_count}/{max_messages}: {news['title'][:50]}...")
                
                # Delay between messages
                if sent_count < max_messages and sent_count < len(news_list):
                    time.sleep(delay_seconds)
        
        logger.info(f"Broadcast complete: {sent_count} messages sent")
        return sent_count
    
    def run_continuous(self, interval_minutes: int = 30):
        """Run continuous broadcasting"""
        logger.info(f"Starting continuous broadcast (every {interval_minutes} minutes)")
        
        while True:
            try:
                self.broadcast_news()
                logger.info(f"Waiting {interval_minutes} minutes until next broadcast...")
                time.sleep(interval_minutes * 60)
            except KeyboardInterrupt:
                logger.info("Broadcast stopped by user")
                break
            except Exception as e:
                logger.error(f"Error in continuous broadcast: {e}")
                time.sleep(60)  # Wait 1 minute on error

def main():
    """Test Telegram broadcaster"""
    broadcaster = TelegramNewsBroadcaster()
    
    # Test connection
    if broadcaster.test_connection():
        print("✅ Telegram bot connected successfully")
        
        # Get sample news
        news = broadcaster.get_latest_news(hours=48)
        if news:
            print(f"\n📰 Found {len(news)} news items")
            print("\nSample Telegram message:")
            print("-" * 50)
            print(broadcaster.format_telegram_message(news[0]))
            print("-" * 50)
            
            # Uncomment to actually broadcast
            # broadcaster.broadcast_news(max_messages=1)
        else:
            print("No recent news found")
    else:
        print("❌ Failed to connect to Telegram")
        print("\nTo set up Telegram broadcasting:")
        print("1. Create a bot with @BotFather on Telegram")
        print("2. Get your bot token")
        print("3. Create a channel and add your bot as admin")
        print("4. Add to .env file:")
        print("   TELEGRAM_BOT_TOKEN=your_bot_token")
        print("   TELEGRAM_CHANNEL_ID=@your_channel_name")

if __name__ == "__main__":
    main()