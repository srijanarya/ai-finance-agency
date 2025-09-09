#!/usr/bin/env python3
"""
Centralized Posting Queue System
Single source of truth for ALL posts across LinkedIn, Twitter, and Telegram
Prevents duplicates and coordinates all posting activities
"""

import os
import json
import hashlib
import sqlite3
import time
import requests
import tweepy
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from threading import Lock
import logging
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('posting_queue.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class Platform(Enum):
    LINKEDIN = "linkedin"
    TWITTER = "twitter"
    TELEGRAM = "telegram"
    ALL = "all"

class Priority(Enum):
    LOW = 1
    NORMAL = 2
    HIGH = 3
    URGENT = 4

class PostStatus(Enum):
    PENDING = "pending"
    APPROVED = "approved"
    POSTED = "posted"
    FAILED = "failed"
    REJECTED = "rejected"
    DUPLICATE = "duplicate"

@dataclass
class QueueItem:
    id: str
    content: str
    platform: str
    content_hash: str
    priority: int
    status: str
    created_at: str
    scheduled_for: Optional[str]
    posted_at: Optional[str]
    retry_count: int
    max_retries: int
    source: str  # cloud_poster, news_monitor, manual, etc.
    metadata: Dict
    error_message: Optional[str] = None

class CentralizedPostingQueue:
    """
    Centralized queue system that prevents duplicates and coordinates all posting
    """
    
    def __init__(self):
        self.db_path = 'posting_queue.db'
        self.lock = Lock()
        self.min_gap_minutes = 30  # Minimum gap between posts
        self.platform_limits = {
            Platform.LINKEDIN.value: {"daily": 50, "hourly": 10},  # Increased for testing
            Platform.TWITTER.value: {"daily": 100, "hourly": 20},  # Increased for testing
            Platform.TELEGRAM.value: {"daily": 200, "hourly": 50}  # Increased for testing
        }
        
        # Initialize database and API clients
        self.init_database()
        self.init_api_clients()
        
        logger.info("Centralized Posting Queue initialized")
    
    def init_database(self):
        """Initialize SQLite database with proper schema"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS queue (
                    id TEXT PRIMARY KEY,
                    content TEXT NOT NULL,
                    platform TEXT NOT NULL,
                    content_hash TEXT NOT NULL,
                    priority INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    scheduled_for TEXT,
                    posted_at TEXT,
                    retry_count INTEGER DEFAULT 0,
                    max_retries INTEGER DEFAULT 3,
                    source TEXT NOT NULL,
                    metadata TEXT,
                    error_message TEXT
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_content_hash ON queue(content_hash)
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_status_platform ON queue(status, platform)
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_scheduled_for ON queue(scheduled_for)
            """)
            
            # Create posting history table for analytics
            conn.execute("""
                CREATE TABLE IF NOT EXISTS posting_history (
                    id TEXT PRIMARY KEY,
                    content_hash TEXT NOT NULL,
                    platform TEXT NOT NULL,
                    posted_at TEXT NOT NULL,
                    source TEXT NOT NULL,
                    success BOOLEAN NOT NULL
                )
            """)
            
            conn.commit()
    
    def init_api_clients(self):
        """Initialize API clients for all platforms"""
        # LinkedIn
        self.linkedin_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
        
        # Twitter/X
        try:
            # Don't require bearer_token - use OAuth 1.0a authentication
            self.twitter_client = tweepy.Client(
                consumer_key=os.getenv('TWITTER_CONSUMER_KEY'),
                consumer_secret=os.getenv('TWITTER_CONSUMER_SECRET'),
                access_token=os.getenv('TWITTER_ACCESS_TOKEN'),
                access_token_secret=os.getenv('TWITTER_ACCESS_TOKEN_SECRET'),
                wait_on_rate_limit=True
            )
            logger.info("Twitter client initialized successfully")
        except Exception as e:
            logger.warning(f"Twitter client initialization failed: {e}")
            self.twitter_client = None
        
        # Telegram
        self.telegram_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.telegram_channel = os.getenv('TELEGRAM_CHANNEL_ID', '@AIFinanceNews2024')
    
    def generate_content_hash(self, content: str) -> str:
        """Generate unique hash for content to detect duplicates"""
        # Normalize content for hashing
        normalized = content.lower().strip()
        # Remove common variations that shouldn't count as different content
        normalized = normalized.replace('\n\n', '\n').replace('  ', ' ')
        return hashlib.sha256(normalized.encode()).hexdigest()[:16]
    
    def is_duplicate(self, content_hash: str, platform: str = None) -> bool:
        """Check if content is duplicate across all platforms or specific platform"""
        with sqlite3.connect(self.db_path) as conn:
            if platform:
                cursor = conn.execute(
                    "SELECT COUNT(*) FROM queue WHERE content_hash = ? AND platform = ? AND status != 'failed'",
                    (content_hash, platform)
                )
            else:
                cursor = conn.execute(
                    "SELECT COUNT(*) FROM queue WHERE content_hash = ? AND status != 'failed'",
                    (content_hash,)
                )
            return cursor.fetchone()[0] > 0
    
    def check_rate_limits(self, platform: str) -> Dict[str, bool]:
        """Check if platform rate limits are exceeded"""
        now = datetime.now()
        hour_ago = now - timedelta(hours=1)
        day_ago = now - timedelta(days=1)
        
        with sqlite3.connect(self.db_path) as conn:
            # Check hourly limit
            cursor = conn.execute("""
                SELECT COUNT(*) FROM queue 
                WHERE platform = ? AND status = 'posted' 
                AND posted_at > ?
            """, (platform, hour_ago.isoformat()))
            hourly_count = cursor.fetchone()[0]
            
            # Check daily limit
            cursor = conn.execute("""
                SELECT COUNT(*) FROM queue 
                WHERE platform = ? AND status = 'posted' 
                AND posted_at > ?
            """, (platform, day_ago.isoformat()))
            daily_count = cursor.fetchone()[0]
            
            limits = self.platform_limits.get(platform, {"daily": 999, "hourly": 999})
            
            return {
                "hourly_ok": hourly_count < limits["hourly"],
                "daily_ok": daily_count < limits["daily"],
                "hourly_count": hourly_count,
                "daily_count": daily_count,
                "hourly_limit": limits["hourly"],
                "daily_limit": limits["daily"]
            }
    
    def can_post_now(self, platform: str) -> Tuple[bool, str]:
        """Check if we can post to platform now considering rate limits and gaps"""
        # Check rate limits
        limits = self.check_rate_limits(platform)
        if not limits["hourly_ok"]:
            return False, f"Hourly limit exceeded ({limits['hourly_count']}/{limits['hourly_limit']})"
        if not limits["daily_ok"]:
            return False, f"Daily limit exceeded ({limits['daily_count']}/{limits['daily_limit']})"
        
        # Check minimum gap
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT posted_at FROM queue 
                WHERE platform = ? AND status = 'posted' 
                ORDER BY posted_at DESC LIMIT 1
            """, (platform,))
            last_post = cursor.fetchone()
            
            if last_post:
                last_post_time = datetime.fromisoformat(last_post[0])
                min_next_time = last_post_time + timedelta(minutes=self.min_gap_minutes)
                if datetime.now() < min_next_time:
                    return False, f"Too soon. Next post allowed at {min_next_time.strftime('%H:%M:%S')}"
        
        return True, "OK"
    
    def add_to_queue(self, content: str, platform: str, priority: Priority = Priority.NORMAL, 
                     source: str = "manual", scheduled_for: Optional[datetime] = None,
                     metadata: Dict = None) -> Dict:
        """Add content to posting queue with duplicate detection"""
        
        if metadata is None:
            metadata = {}
            
        content_hash = self.generate_content_hash(content)
        
        # Check for duplicates
        if self.is_duplicate(content_hash, platform):
            logger.warning(f"Duplicate content detected for {platform}")
            return {
                "success": False,
                "reason": "duplicate",
                "message": f"Content already exists in queue for {platform}",
                "content_hash": content_hash
            }
        
        # Generate unique ID
        item_id = f"{platform}_{int(time.time())}_{content_hash[:8]}"
        
        # Create queue item
        queue_item = QueueItem(
            id=item_id,
            content=content,
            platform=platform,
            content_hash=content_hash,
            priority=priority.value,
            status=PostStatus.PENDING.value,
            created_at=datetime.now().isoformat(),
            scheduled_for=scheduled_for.isoformat() if scheduled_for else None,
            posted_at=None,
            retry_count=0,
            max_retries=3,
            source=source,
            metadata=metadata
        )
        
        # Insert into database
        with self.lock:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO queue VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    queue_item.id, queue_item.content, queue_item.platform,
                    queue_item.content_hash, queue_item.priority, queue_item.status,
                    queue_item.created_at, queue_item.scheduled_for, queue_item.posted_at,
                    queue_item.retry_count, queue_item.max_retries, queue_item.source,
                    json.dumps(queue_item.metadata), queue_item.error_message
                ))
                conn.commit()
        
        logger.info(f"Added to queue: {item_id} for {platform} (source: {source})")
        
        return {
            "success": True,
            "item_id": item_id,
            "content_hash": content_hash,
            "platform": platform,
            "queue_position": self.get_queue_position(item_id)
        }
    
    def get_queue_position(self, item_id: str) -> int:
        """Get position of item in queue"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT COUNT(*) FROM queue 
                WHERE status IN ('pending', 'approved') 
                AND (priority > (SELECT priority FROM queue WHERE id = ?) 
                     OR (priority = (SELECT priority FROM queue WHERE id = ?) 
                         AND created_at < (SELECT created_at FROM queue WHERE id = ?)))
            """, (item_id, item_id, item_id))
            return cursor.fetchone()[0] + 1
    
    def get_next_items_to_post(self, limit: int = 10) -> List[QueueItem]:
        """Get next items ready to post, respecting priority and scheduling"""
        now = datetime.now().isoformat()
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT * FROM queue 
                WHERE status IN ('pending', 'approved') 
                AND (scheduled_for IS NULL OR scheduled_for <= ?)
                ORDER BY priority DESC, created_at ASC
                LIMIT ?
            """, (now, limit))
            
            rows = cursor.fetchall()
            items = []
            
            for row in rows:
                metadata = json.loads(row[12]) if row[12] else {}
                items.append(QueueItem(
                    id=row[0], content=row[1], platform=row[2], content_hash=row[3],
                    priority=row[4], status=row[5], created_at=row[6],
                    scheduled_for=row[7], posted_at=row[8], retry_count=row[9],
                    max_retries=row[10], source=row[11], metadata=metadata,
                    error_message=row[13]
                ))
            
            return items
    
    def post_to_linkedin(self, content: str) -> Tuple[bool, str]:
        """Post content to LinkedIn"""
        if not self.linkedin_token:
            return False, "LinkedIn token not configured"
        
        try:
            # Get user ID
            headers = {
                'Authorization': f'Bearer {self.linkedin_token}',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            user_response = requests.get(
                'https://api.linkedin.com/v2/userinfo',
                headers=headers
            )
            
            if user_response.status_code != 200:
                return False, f"LinkedIn auth failed: {user_response.status_code}"
            
            user_id = user_response.json().get('sub')
            
            # Post content
            post_data = {
                "author": f"urn:li:person:{user_id}",
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": content[:1300]  # LinkedIn limit
                        },
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }
            
            headers['Content-Type'] = 'application/json'
            response = requests.post(
                'https://api.linkedin.com/v2/ugcPosts',
                headers=headers,
                json=post_data
            )
            
            if response.status_code in [200, 201]:
                return True, "Posted successfully"
            else:
                return False, f"LinkedIn API error: {response.status_code}"
                
        except Exception as e:
            return False, f"LinkedIn posting error: {str(e)}"
    
    def post_to_twitter(self, content: str) -> Tuple[bool, str]:
        """Post content to Twitter/X"""
        if not self.twitter_client:
            return False, "Twitter client not configured"
        
        try:
            # Truncate to Twitter limit
            tweet_text = content[:280] if len(content) > 280 else content
            if len(content) > 280:
                tweet_text = content[:277] + "..."
            
            tweet = self.twitter_client.create_tweet(text=tweet_text)
            return True, f"Posted successfully (ID: {tweet.data['id']})"
            
        except Exception as e:
            return False, f"Twitter posting error: {str(e)}"
    
    def post_to_telegram(self, content: str) -> Tuple[bool, str]:
        """Post content to Telegram"""
        if not self.telegram_token:
            return False, "Telegram token not configured"
        
        try:
            url = f"https://api.telegram.org/bot{self.telegram_token}/sendMessage"
            
            # Add channel link if not present
            text = content
            if '@AIFinanceNews2024' not in text:
                text += '\n\n📊 Follow: @AIFinanceNews2024'
            
            payload = {
                'chat_id': self.telegram_channel,
                'text': text[:4096],  # Telegram limit
                'parse_mode': 'HTML'
            }
            
            response = requests.post(url, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('ok'):
                    return True, "Posted successfully"
                else:
                    return False, f"Telegram API error: {result.get('description', 'Unknown error')}"
            else:
                return False, f"Telegram HTTP error: {response.status_code}"
                
        except Exception as e:
            return False, f"Telegram posting error: {str(e)}"
    
    def execute_post(self, item: QueueItem) -> Tuple[bool, str]:
        """Execute posting for a queue item"""
        platform_methods = {
            Platform.LINKEDIN.value: self.post_to_linkedin,
            Platform.TWITTER.value: self.post_to_twitter,
            Platform.TELEGRAM.value: self.post_to_telegram
        }
        
        method = platform_methods.get(item.platform)
        if not method:
            return False, f"Unknown platform: {item.platform}"
        
        # Check if we can post now
        can_post, reason = self.can_post_now(item.platform)
        if not can_post:
            return False, reason
        
        # Execute the post
        success, message = method(item.content)
        
        # Update database
        with self.lock:
            with sqlite3.connect(self.db_path) as conn:
                if success:
                    conn.execute("""
                        UPDATE queue 
                        SET status = 'posted', posted_at = ?, error_message = NULL
                        WHERE id = ?
                    """, (datetime.now().isoformat(), item.id))
                    
                    # Add to history
                    conn.execute("""
                        INSERT INTO posting_history VALUES (?, ?, ?, ?, ?, ?)
                    """, (
                        f"hist_{item.id}", item.content_hash, item.platform,
                        datetime.now().isoformat(), item.source, True
                    ))
                    
                else:
                    # Increment retry count
                    new_retry_count = item.retry_count + 1
                    new_status = 'failed' if new_retry_count >= item.max_retries else 'pending'
                    
                    conn.execute("""
                        UPDATE queue 
                        SET retry_count = ?, status = ?, error_message = ?
                        WHERE id = ?
                    """, (new_retry_count, new_status, message, item.id))
                
                conn.commit()
        
        return success, message
    
    def process_queue(self, max_items: int = 5) -> Dict:
        """Process pending items in queue"""
        logger.info("Processing posting queue...")
        
        items = self.get_next_items_to_post(max_items)
        results = {
            "processed": 0,
            "successful": 0,
            "failed": 0,
            "skipped": 0,
            "details": []
        }
        
        for item in items:
            results["processed"] += 1
            
            logger.info(f"Processing {item.id} for {item.platform}")
            
            success, message = self.execute_post(item)
            
            if success:
                results["successful"] += 1
                logger.info(f"✅ Posted {item.id} to {item.platform}")
            else:
                if "Too soon" in message or "limit exceeded" in message:
                    results["skipped"] += 1
                    logger.info(f"⏸️ Skipped {item.id}: {message}")
                else:
                    results["failed"] += 1
                    logger.error(f"❌ Failed {item.id}: {message}")
            
            results["details"].append({
                "item_id": item.id,
                "platform": item.platform,
                "success": success,
                "message": message,
                "source": item.source
            })
            
            # Rate limiting between posts
            time.sleep(2)
        
        logger.info(f"Queue processing complete: {results['successful']} posted, {results['failed']} failed, {results['skipped']} skipped")
        return results
    
    def get_queue_status(self) -> Dict:
        """Get comprehensive queue status"""
        with sqlite3.connect(self.db_path) as conn:
            # Count by status
            cursor = conn.execute("""
                SELECT status, COUNT(*) 
                FROM queue 
                GROUP BY status
            """)
            status_counts = dict(cursor.fetchall())
            
            # Count by platform
            cursor = conn.execute("""
                SELECT platform, COUNT(*) 
                FROM queue 
                WHERE status = 'pending'
                GROUP BY platform
            """)
            pending_by_platform = dict(cursor.fetchall())
            
            # Recent posts
            cursor = conn.execute("""
                SELECT platform, posted_at, source
                FROM queue 
                WHERE status = 'posted' 
                ORDER BY posted_at DESC 
                LIMIT 10
            """)
            recent_posts = cursor.fetchall()
            
            # Duplicate prevention stats
            cursor = conn.execute("""
                SELECT COUNT(DISTINCT content_hash) as unique_content,
                       COUNT(*) as total_items,
                       COUNT(CASE WHEN status = 'duplicate' THEN 1 END) as duplicates_prevented
                FROM queue
            """)
            dup_stats = cursor.fetchone()
            
            # Failed posts needing attention
            cursor = conn.execute("""
                SELECT id, platform, error_message, retry_count, max_retries
                FROM queue 
                WHERE status = 'failed' 
                ORDER BY created_at DESC 
                LIMIT 5
            """)
            failed_posts = cursor.fetchall()
        
        return {
            "queue_counts": status_counts,
            "pending_by_platform": pending_by_platform,
            "recent_posts": [
                {
                    "platform": post[0],
                    "posted_at": post[1],
                    "source": post[2]
                }
                for post in recent_posts
            ],
            "duplicate_stats": {
                "unique_content": dup_stats[0] or 0,
                "total_items": dup_stats[1] or 0,
                "duplicates_prevented": dup_stats[2] or 0
            },
            "failed_posts": [
                {
                    "id": post[0],
                    "platform": post[1],
                    "error": post[2],
                    "retry_count": post[3],
                    "max_retries": post[4]
                }
                for post in failed_posts
            ],
            "rate_limits": {
                platform: self.check_rate_limits(platform)
                for platform in [Platform.LINKEDIN.value, Platform.TWITTER.value, Platform.TELEGRAM.value]
            }
        }
    
    def cleanup_old_items(self, days_old: int = 7):
        """Clean up old processed items"""
        cutoff_date = (datetime.now() - timedelta(days=days_old)).isoformat()
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                DELETE FROM queue 
                WHERE status IN ('posted', 'failed') 
                AND created_at < ?
            """, (cutoff_date,))
            
            deleted_count = cursor.rowcount
            conn.commit()
            
        logger.info(f"Cleaned up {deleted_count} old queue items")
        return deleted_count
    
    def approve_item(self, item_id: str) -> bool:
        """Approve a pending item for posting"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                UPDATE queue 
                SET status = 'approved'
                WHERE id = ? AND status = 'pending'
            """, (item_id,))
            conn.commit()
            return cursor.rowcount > 0
    
    def reject_item(self, item_id: str, reason: str = "Manual rejection") -> bool:
        """Reject a pending item"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                UPDATE queue 
                SET status = 'rejected', error_message = ?
                WHERE id = ? AND status = 'pending'
            """, (reason, item_id))
            conn.commit()
            return cursor.rowcount > 0
    
    def get_pending_for_approval(self) -> List[QueueItem]:
        """Get all items pending approval"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                SELECT * FROM queue 
                WHERE status = 'pending'
                ORDER BY priority DESC, created_at ASC
            """)
            
            rows = cursor.fetchall()
            items = []
            
            for row in rows:
                metadata = json.loads(row[12]) if row[12] else {}
                items.append(QueueItem(
                    id=row[0], content=row[1], platform=row[2], content_hash=row[3],
                    priority=row[4], status=row[5], created_at=row[6],
                    scheduled_for=row[7], posted_at=row[8], retry_count=row[9],
                    max_retries=row[10], source=row[11], metadata=metadata,
                    error_message=row[13]
                ))
            
            return items

# Global instance for use by other modules
posting_queue = CentralizedPostingQueue()

def main():
    """Main function for running queue processing"""
    queue = CentralizedPostingQueue()
    
    print("="*60)
    print("🎯 CENTRALIZED POSTING QUEUE")
    print("="*60)
    
    # Show current status
    status = queue.get_queue_status()
    print(f"Queue Status: {status['queue_counts']}")
    print(f"Pending by Platform: {status['pending_by_platform']}")
    
    # Process queue
    results = queue.process_queue()
    print(f"\nProcessing Results:")
    print(f"  Processed: {results['processed']}")
    print(f"  Successful: {results['successful']}")
    print(f"  Failed: {results['failed']}")
    print(f"  Skipped: {results['skipped']}")
    
    # Cleanup old items
    cleaned = queue.cleanup_old_items()
    print(f"\nCleaned up {cleaned} old items")

if __name__ == "__main__":
    main()