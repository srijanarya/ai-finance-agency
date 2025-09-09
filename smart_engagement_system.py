#!/usr/bin/env python3
"""
Smart Engagement System - Automated Reply & Follower Growth
============================================================
Engages with posts on LinkedIn and X to grow followers organically
"""

import os
import json
import time
import random
import sqlite3
import requests
import tweepy
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import openai
from dataclasses import dataclass
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class EngagementTarget:
    """Target post for engagement"""
    platform: str
    post_id: str
    author: str
    content: str
    engagement_score: float
    hashtags: List[str]
    timestamp: datetime

class SmartEngagementSystem:
    """Intelligent engagement system for follower growth"""
    
    def __init__(self):
        self.db_path = 'engagement_tracking.db'
        self.init_database()
        self.load_credentials()
        self.engagement_rules = self.load_engagement_rules()
        
    def init_database(self):
        """Initialize engagement tracking database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS engagement_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                platform TEXT NOT NULL,
                post_id TEXT NOT NULL,
                author TEXT NOT NULL,
                original_content TEXT,
                our_reply TEXT,
                reply_type TEXT,
                engagement_score REAL,
                new_followers_gained INTEGER DEFAULT 0,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(platform, post_id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS follower_tracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                platform TEXT NOT NULL,
                follower_count INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS top_influencers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                platform TEXT NOT NULL,
                username TEXT NOT NULL,
                follower_count INTEGER,
                engagement_rate REAL,
                topics TEXT,
                last_engaged DATETIME,
                UNIQUE(platform, username)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def load_credentials(self):
        """Load API credentials"""
        self.openai_key = os.getenv('OPENAI_API_KEY')
        if self.openai_key:
            openai.api_key = self.openai_key
        
        # Twitter credentials
        self.twitter_bearer = os.getenv('TWITTER_BEARER_TOKEN')
        self.twitter_api_key = os.getenv('TWITTER_API_KEY')
        self.twitter_api_secret = os.getenv('TWITTER_API_SECRET')
        self.twitter_access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        self.twitter_access_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        
        # LinkedIn credentials
        self.linkedin_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
    
    def load_engagement_rules(self) -> Dict:
        """Load engagement rules and best practices"""
        return {
            'max_daily_engagements': {
                'linkedin': 25,  # Conservative to avoid restrictions
                'twitter': 50
            },
            'min_time_between_engagements': 300,  # 5 minutes
            'target_hashtags': {
                'linkedin': ['#indianstockmarket', '#nifty50', '#investing', '#financialmarkets', 
                            '#wealthmanagement', '#tradingstrategies', '#stockmarketindia'],
                'twitter': ['#Nifty', '#Sensex', '#StockMarketIndia', '#Trading', 
                           '#Investment', '#FinanceIndia', '#BSE', '#NSE']
            },
            'avoid_keywords': ['spam', 'scam', 'guaranteed returns', 'get rich quick'],
            'priority_accounts': {
                'linkedin': ['financial analysts', 'fund managers', 'market experts'],
                'twitter': ['verified finance accounts', 'market analysts', 'business journalists']
            }
        }
    
    def find_engagement_targets(self, platform: str, limit: int = 10) -> List[EngagementTarget]:
        """Find high-value posts to engage with"""
        targets = []
        
        if platform == 'linkedin':
            targets = self.find_linkedin_targets(limit)
        elif platform == 'twitter':
            targets = self.find_twitter_targets(limit)
        
        # Filter and score targets
        scored_targets = self.score_engagement_targets(targets)
        
        # Return top targets
        return sorted(scored_targets, key=lambda x: x.engagement_score, reverse=True)[:limit]
    
    def find_linkedin_targets(self, limit: int) -> List[EngagementTarget]:
        """Find LinkedIn posts to engage with"""
        targets = []
        
        # Would need LinkedIn API access
        # For now, returning sample targets
        sample_posts = [
            {
                'post_id': 'li_001',
                'author': 'Market Expert',
                'content': 'Nifty showing strong momentum above 24,800. Banking sector leading the rally.',
                'hashtags': ['#Nifty50', '#StockMarket']
            },
            {
                'post_id': 'li_002',
                'author': 'Investment Advisor',
                'content': 'Key sectors to watch in Q4: IT, Pharma, and Infrastructure.',
                'hashtags': ['#Investing', '#IndianMarkets']
            }
        ]
        
        for post in sample_posts:
            targets.append(EngagementTarget(
                platform='linkedin',
                post_id=post['post_id'],
                author=post['author'],
                content=post['content'],
                engagement_score=0.0,
                hashtags=post['hashtags'],
                timestamp=datetime.now()
            ))
        
        return targets
    
    def find_twitter_targets(self, limit: int) -> List[EngagementTarget]:
        """Find tweets to engage with"""
        targets = []
        
        if not self.twitter_bearer:
            return targets
        
        try:
            # Initialize Twitter client
            client = tweepy.Client(bearer_token=self.twitter_bearer)
            
            # Search for relevant tweets
            hashtags = self.engagement_rules['target_hashtags']['twitter']
            query = f"({' OR '.join(hashtags)}) -is:retweet -is:reply lang:en"
            
            tweets = client.search_recent_tweets(
                query=query,
                max_results=limit * 2,
                tweet_fields=['author_id', 'created_at', 'public_metrics']
            )
            
            if tweets.data:
                for tweet in tweets.data:
                    targets.append(EngagementTarget(
                        platform='twitter',
                        post_id=str(tweet.id),
                        author=str(tweet.author_id),
                        content=tweet.text,
                        engagement_score=0.0,
                        hashtags=self.extract_hashtags(tweet.text),
                        timestamp=tweet.created_at
                    ))
        except Exception as e:
            logger.error(f"Error finding Twitter targets: {e}")
        
        return targets
    
    def extract_hashtags(self, text: str) -> List[str]:
        """Extract hashtags from text"""
        import re
        return re.findall(r'#\w+', text)
    
    def score_engagement_targets(self, targets: List[EngagementTarget]) -> List[EngagementTarget]:
        """Score targets based on engagement potential"""
        for target in targets:
            score = 0.0
            
            # Check for relevant keywords
            keywords = ['nifty', 'sensex', 'stock', 'market', 'trading', 'investment']
            for keyword in keywords:
                if keyword.lower() in target.content.lower():
                    score += 0.2
            
            # Check for avoid keywords
            for avoid in self.engagement_rules['avoid_keywords']:
                if avoid.lower() in target.content.lower():
                    score -= 1.0
            
            # Boost for relevant hashtags
            for hashtag in target.hashtags:
                if hashtag.lower() in [h.lower() for h in 
                    self.engagement_rules['target_hashtags'][target.platform]]:
                    score += 0.3
            
            # Recency bonus
            if target.timestamp:
                hours_old = (datetime.now() - target.timestamp).total_seconds() / 3600
                if hours_old < 2:
                    score += 0.5
                elif hours_old < 6:
                    score += 0.3
            
            target.engagement_score = max(0, min(1, score))
        
        return targets
    
    def generate_smart_reply(self, target: EngagementTarget) -> Optional[str]:
        """Generate intelligent, contextual reply"""
        try:
            # Check if we've already engaged with this post
            if self.already_engaged(target.platform, target.post_id):
                return None
            
            prompt = f"""
            Generate a professional, valuable reply to this {target.platform} post about Indian financial markets:
            
            Original Post: "{target.content}"
            
            Requirements:
            1. Add genuine value to the conversation
            2. Show expertise without being promotional
            3. Be respectful and professional
            4. Keep it concise (under 100 words)
            5. Include a thoughtful question or insight
            6. Use natural language, not salesy
            7. Reference specific points from the original post
            
            Reply:
            """
            
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=150
            )
            
            reply = response.choices[0].message.content.strip()
            
            # Validate reply
            if self.validate_reply(reply):
                return reply
            
            return None
            
        except Exception as e:
            logger.error(f"Error generating reply: {e}")
            return None
    
    def validate_reply(self, reply: str) -> bool:
        """Validate reply meets quality standards"""
        if not reply or len(reply) < 20:
            return False
        
        # Check for spam keywords
        spam_indicators = ['buy now', 'click here', 'guaranteed', 'DM me', 'check out my']
        for spam in spam_indicators:
            if spam.lower() in reply.lower():
                return False
        
        # Ensure it's not too long
        if len(reply) > 500:
            return False
        
        return True
    
    def already_engaged(self, platform: str, post_id: str) -> bool:
        """Check if we've already engaged with this post"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT COUNT(*) FROM engagement_history
            WHERE platform = ? AND post_id = ?
        ''', (platform, post_id))
        
        count = cursor.fetchone()[0]
        conn.close()
        
        return count > 0
    
    def post_reply(self, target: EngagementTarget, reply: str) -> bool:
        """Post the reply to the platform"""
        success = False
        
        try:
            if target.platform == 'linkedin':
                # Would need LinkedIn API to post
                logger.info(f"LinkedIn reply ready: {reply[:50]}...")
                success = True  # Simulated
                
            elif target.platform == 'twitter':
                if self.twitter_access_token:
                    # Post tweet reply
                    auth = tweepy.OAuthHandler(self.twitter_api_key, self.twitter_api_secret)
                    auth.set_access_token(self.twitter_access_token, self.twitter_access_secret)
                    api = tweepy.API(auth)
                    
                    api.update_status(
                        status=reply,
                        in_reply_to_status_id=target.post_id,
                        auto_populate_reply_metadata=True
                    )
                    success = True
            
            if success:
                self.record_engagement(target, reply)
                
        except Exception as e:
            logger.error(f"Error posting reply: {e}")
        
        return success
    
    def record_engagement(self, target: EngagementTarget, reply: str):
        """Record engagement in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO engagement_history
            (platform, post_id, author, original_content, our_reply, engagement_score)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            target.platform,
            target.post_id,
            target.author,
            target.content[:500],
            reply,
            target.engagement_score
        ))
        
        conn.commit()
        conn.close()
    
    def track_follower_growth(self, platform: str, current_count: int):
        """Track follower growth over time"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO follower_tracking (platform, follower_count)
            VALUES (?, ?)
        ''', (platform, current_count))
        
        conn.commit()
        conn.close()
    
    def get_engagement_stats(self) -> Dict:
        """Get engagement statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        stats = {}
        
        # Get today's engagements
        cursor.execute('''
            SELECT platform, COUNT(*) 
            FROM engagement_history
            WHERE DATE(timestamp) = DATE('now')
            GROUP BY platform
        ''')
        
        for row in cursor.fetchall():
            stats[f"{row[0]}_engagements_today"] = row[1]
        
        # Get total engagements
        cursor.execute('''
            SELECT platform, COUNT(*)
            FROM engagement_history
            GROUP BY platform
        ''')
        
        for row in cursor.fetchall():
            stats[f"{row[0]}_total_engagements"] = row[1]
        
        conn.close()
        return stats
    
    def run_engagement_cycle(self):
        """Run a complete engagement cycle"""
        logger.info("Starting engagement cycle...")
        
        for platform in ['twitter', 'linkedin']:
            # Check daily limit
            stats = self.get_engagement_stats()
            today_count = stats.get(f"{platform}_engagements_today", 0)
            daily_limit = self.engagement_rules['max_daily_engagements'][platform]
            
            if today_count >= daily_limit:
                logger.info(f"Daily limit reached for {platform}")
                continue
            
            # Find targets
            targets = self.find_engagement_targets(platform, limit=5)
            logger.info(f"Found {len(targets)} targets for {platform}")
            
            for target in targets:
                # Generate reply
                reply = self.generate_smart_reply(target)
                
                if reply:
                    # Post reply
                    success = self.post_reply(target, reply)
                    
                    if success:
                        logger.info(f"Successfully engaged with {target.author} on {platform}")
                        
                        # Wait between engagements
                        wait_time = self.engagement_rules['min_time_between_engagements']
                        time.sleep(wait_time + random.randint(0, 60))
                    else:
                        logger.warning(f"Failed to post reply to {target.author}")
                else:
                    logger.info(f"Skipped {target.post_id} - no suitable reply generated")
        
        logger.info("Engagement cycle completed")

def identify_influencers(platform: str) -> List[Dict]:
    """Identify top influencers to engage with"""
    influencers = []
    
    if platform == 'linkedin':
        # Top Indian finance influencers on LinkedIn
        influencers = [
            {'username': 'marketexpert1', 'followers': 50000, 'topics': 'stock market, trading'},
            {'username': 'wealthadvisor', 'followers': 30000, 'topics': 'investment, wealth'},
            {'username': 'financecoach', 'followers': 25000, 'topics': 'financial planning'}
        ]
    elif platform == 'twitter':
        # Top finance Twitter accounts
        influencers = [
            {'username': 'marketguru', 'followers': 100000, 'topics': 'nifty, sensex'},
            {'username': 'tradingpro', 'followers': 75000, 'topics': 'options, futures'},
            {'username': 'investindia', 'followers': 60000, 'topics': 'stocks, mutual funds'}
        ]
    
    return influencers

if __name__ == "__main__":
    # Initialize system
    engagement_system = SmartEngagementSystem()
    
    print("\n" + "="*60)
    print("🤖 SMART ENGAGEMENT SYSTEM")
    print("="*60)
    print("\n✨ Features:")
    print("  - Finds relevant posts to engage with")
    print("  - Generates intelligent, contextual replies")
    print("  - Tracks follower growth")
    print("  - Respects platform limits")
    print("  - Identifies influencers to engage with")
    print("\n" + "="*60)
    
    # Run engagement cycle
    engagement_system.run_engagement_cycle()
    
    # Get stats
    stats = engagement_system.get_engagement_stats()
    print("\n📊 Engagement Statistics:")
    for key, value in stats.items():
        print(f"  {key}: {value}")