#!/usr/bin/env python3
"""
X (Twitter) Publisher for Trader-Focused Content
Publishes finance content to X with trader-centric messaging
"""

import tweepy
import sqlite3
import os
import time
from datetime import datetime
from typing import List, Dict
import logging
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class XTraderPublisher:
    def __init__(self):
        """Initialize X/Twitter API connection"""
        # Need Twitter API v2 credentials
        self.consumer_key = os.getenv('TWITTER_CONSUMER_KEY', '')
        self.consumer_secret = os.getenv('TWITTER_CONSUMER_SECRET', '')
        self.access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        self.access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        
        self.db_path = 'data/agency.db'
        self.max_tweet_length = 280
        
        # Initialize API if credentials available
        self.api = None
        if self.access_token and self.access_token_secret:
            try:
                auth = tweepy.OAuthHandler(self.consumer_key, self.consumer_secret)
                auth.set_access_token(self.access_token, self.access_token_secret)
                self.api = tweepy.API(auth, wait_on_rate_limit=True)
                logger.info("X/Twitter API initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize X API: {e}")
    
    def get_unpublished_content(self, limit: int = 10) -> List[Dict]:
        """Fetch unpublished trader-focused content from database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get high-relevance content that hasn't been posted
        query = """
        SELECT id, title, data_points, estimated_reach, keywords
        FROM content_ideas
        WHERE estimated_reach >= 1000
        AND (status = 'pending' OR status IS NULL)
        ORDER BY estimated_reach DESC, created_at DESC
        LIMIT ?
        """
        
        cursor.execute(query, (limit,))
        results = cursor.fetchall()
        conn.close()
        
        content_list = []
        for row in results:
            content_list.append({
                'id': row[0],
                'title': row[1],
                'content': row[2] if row[2] else row[1],  # Use data_points or title
                'relevance_score': row[3] if row[3] else 8,  # Use reach as proxy
                'keywords': row[4] if row[4] else ''
            })
        
        return content_list
    
    def format_trader_tweet(self, content: Dict) -> str:
        """Format content as trader-focused tweet"""
        # Extract key trading terms
        trading_keywords = ['bullish', 'bearish', 'breakout', 'support', 'resistance', 
                          'volume', 'momentum', 'RSI', 'MACD', 'options', 'calls', 'puts']
        
        # Check for trading signals in content
        has_signal = any(kw in content['content'].lower() for kw in trading_keywords)
        
        # Create concise trader message
        title = content['title'][:100] if content['title'] else ""
        
        # Add trading context
        if has_signal:
            tweet = f"🎯 SIGNAL: {title}\n\n"
        else:
            tweet = f"📊 MARKET UPDATE: {title}\n\n"
        
        # Add key insight (shortened)
        insight = content['content'][:150] if content['content'] else ""
        tweet += f"{insight}..."
        
        # Add relevant hashtags
        hashtags = "\n\n#Trading #StockMarket #FinanceNews #TradingSignals"
        
        # Ensure within Twitter limits
        if len(tweet + hashtags) <= self.max_tweet_length:
            tweet += hashtags
        
        return tweet[:self.max_tweet_length]
    
    def publish_to_x(self, content: Dict) -> bool:
        """Publish single content piece to X/Twitter"""
        if not self.api:
            logger.error("X API not initialized. Check credentials.")
            return False
        
        try:
            # Format as trader tweet
            tweet_text = self.format_trader_tweet(content)
            
            # Post to X
            status = self.api.update_status(tweet_text)
            logger.info(f"Published to X: {status.id}")
            
            # Mark as published in database
            self.mark_as_published(content['id'])
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to publish to X: {e}")
            return False
    
    def mark_as_published(self, content_id: int):
        """Mark content as published in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE content_ideas 
            SET published_to_x = 1, 
                published_at = ? 
            WHERE id = ?
        """, (datetime.now().isoformat(), content_id))
        
        conn.commit()
        conn.close()
    
    def publish_batch(self, count: int = 5, delay_seconds: int = 300):
        """Publish multiple posts with delay between them"""
        content_list = self.get_unpublished_content(count)
        
        if not content_list:
            logger.info("No unpublished content found")
            return
        
        published = 0
        for content in content_list:
            if self.publish_to_x(content):
                published += 1
                logger.info(f"Published {published}/{count}: {content['title'][:50]}...")
                
                # Delay between posts to avoid spam
                if published < count:
                    logger.info(f"Waiting {delay_seconds} seconds before next post...")
                    time.sleep(delay_seconds)
        
        logger.info(f"Publishing complete: {published} posts published")
        return published

def main():
    """Test X publisher"""
    publisher = XTraderPublisher()
    
    # Check for unpublished content
    content = publisher.get_unpublished_content(1)
    if content:
        print(f"\nFound {len(content)} unpublished items")
        print(f"\nSample tweet format:")
        print("-" * 50)
        print(publisher.format_trader_tweet(content[0]))
        print("-" * 50)
        
        # Uncomment to actually publish
        # publisher.publish_batch(count=1)
    else:
        print("No unpublished content found")

if __name__ == "__main__":
    main()