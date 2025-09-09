#!/usr/bin/env python3
"""
Unified Database Manager
========================
Consolidates 23 fragmented databases into a unified architecture
with proper connection pooling and thread safety
"""

import sqlite3
import threading
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from contextlib import contextmanager
from pathlib import Path
import time
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UnifiedDatabaseManager:
    """Centralized database management with connection pooling"""
    
    # Database consolidation mapping
    DATABASE_MAP = {
        'core': {
            'path': 'unified_core.db',
            'tables': ['content', 'queue', 'analytics', 'followers', 'metrics'],
            'sources': ['data/agency.db', 'posting_queue.db', 'unified_platform.db']
        },
        'social': {
            'path': 'unified_social.db',
            'tables': ['posts', 'engagement', 'replies', 'groups', 'campaigns'],
            'sources': ['engagement_tracking.db', 'automated_manager.db', 'treum_platform.db']
        },
        'market': {
            'path': 'unified_market.db',
            'tables': ['financial_news', 'market_data', 'signals', 'analysis'],
            'sources': ['financial_data.db', 'realtime_posts.db', 'news_tracker.db']
        }
    }
    
    def __init__(self):
        self.connections = {}
        self.locks = {}
        self.connection_pool = {}
        self.max_connections = 5
        self.timeout = 30.0
        
        # Initialize locks for each database
        for db_name in self.DATABASE_MAP:
            self.locks[db_name] = threading.RLock()
            self.connection_pool[db_name] = []
    
    @contextmanager
    def get_connection(self, db_name: str = 'core'):
        """Get a thread-safe database connection from the pool"""
        if db_name not in self.DATABASE_MAP:
            raise ValueError(f"Unknown database: {db_name}")
        
        with self.locks[db_name]:
            # Try to get a connection from the pool
            if self.connection_pool[db_name]:
                conn = self.connection_pool[db_name].pop()
            else:
                # Create new connection if pool is empty
                db_path = self.DATABASE_MAP[db_name]['path']
                conn = sqlite3.connect(db_path, timeout=self.timeout, check_same_thread=False)
                conn.row_factory = sqlite3.Row
                conn.execute("PRAGMA journal_mode=WAL")  # Write-Ahead Logging for better concurrency
                conn.execute("PRAGMA synchronous=NORMAL")  # Faster writes
                conn.execute("PRAGMA cache_size=10000")  # Larger cache
                
            try:
                yield conn
            finally:
                # Return connection to pool if under limit
                if len(self.connection_pool[db_name]) < self.max_connections:
                    self.connection_pool[db_name].append(conn)
                else:
                    conn.close()
    
    def consolidate_databases(self):
        """Consolidate fragmented databases into unified structure"""
        logger.info("Starting database consolidation...")
        
        for db_name, config in self.DATABASE_MAP.items():
            logger.info(f"Consolidating {db_name} database...")
            
            # Create unified database
            with self.get_connection(db_name) as conn:
                cursor = conn.cursor()
                
                # Create unified schema
                if db_name == 'core':
                    self._create_core_schema(cursor)
                elif db_name == 'social':
                    self._create_social_schema(cursor)
                elif db_name == 'market':
                    self._create_market_schema(cursor)
                
                conn.commit()
            
            # Migrate data from source databases
            for source_db in config['sources']:
                if Path(source_db).exists():
                    self._migrate_data(source_db, db_name)
        
        logger.info("Database consolidation complete!")
    
    def _create_core_schema(self, cursor):
        """Create core database schema"""
        # Unified content table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS content (
                id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                content_type TEXT,
                platform TEXT,
                content_hash TEXT UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata JSON
            )
        """)
        
        # Unified queue table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS queue (
                id TEXT PRIMARY KEY,
                content_id TEXT,
                content TEXT NOT NULL,
                platform TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                priority INTEGER DEFAULT 0,
                scheduled_for TIMESTAMP,
                posted_at TIMESTAMP,
                retry_count INTEGER DEFAULT 0,
                max_retries INTEGER DEFAULT 3,
                error_message TEXT,
                source TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (content_id) REFERENCES content(id)
            )
        """)
        
        # Analytics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_type TEXT NOT NULL,
                metric_value REAL,
                platform TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata JSON
            )
        """)
        
        # Create indexes for performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_queue_status ON queue(status, platform)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_queue_scheduled ON queue(scheduled_for)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_content_hash ON content(content_hash)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_analytics_time ON analytics(timestamp)")
    
    def _create_social_schema(self, cursor):
        """Create social database schema"""
        # Posts table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY,
                content_id TEXT,
                platform TEXT NOT NULL,
                post_id TEXT,
                url TEXT,
                posted_at TIMESTAMP,
                engagement_score REAL DEFAULT 0,
                likes INTEGER DEFAULT 0,
                shares INTEGER DEFAULT 0,
                comments INTEGER DEFAULT 0,
                metadata JSON
            )
        """)
        
        # Engagement tracking
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS engagement (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id TEXT,
                platform TEXT,
                action_type TEXT,
                user_id TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata JSON,
                FOREIGN KEY (post_id) REFERENCES posts(id)
            )
        """)
        
        # Followers table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS followers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                platform TEXT NOT NULL,
                follower_count INTEGER,
                following_count INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                growth_rate REAL,
                metadata JSON
            )
        """)
        
        # Create indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_posts_platform ON posts(platform, posted_at)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_engagement_post ON engagement(post_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_followers_time ON followers(timestamp, platform)")
    
    def _create_market_schema(self, cursor):
        """Create market database schema"""
        # Financial news table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS financial_news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT,
                source TEXT,
                url TEXT,
                sentiment REAL,
                published_at TIMESTAMP,
                analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                tags JSON,
                metadata JSON
            )
        """)
        
        # Market data table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS market_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                price REAL,
                volume INTEGER,
                market_cap REAL,
                change_percent REAL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata JSON
            )
        """)
        
        # Trading signals
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS signals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                signal_type TEXT NOT NULL,
                symbol TEXT,
                action TEXT,
                confidence REAL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata JSON
            )
        """)
        
        # Create indexes
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_news_time ON financial_news(published_at)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_market_symbol ON market_data(symbol, timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(signal_type, timestamp)")
    
    def _migrate_data(self, source_db: str, target_db: str):
        """Migrate data from source to target database"""
        try:
            logger.info(f"Migrating data from {source_db} to {target_db}...")
            
            # Connect to source database
            source_conn = sqlite3.connect(source_db, timeout=30.0)
            source_conn.row_factory = sqlite3.Row
            source_cursor = source_conn.cursor()
            
            # Get tables from source
            source_cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row['name'] for row in source_cursor.fetchall()]
            
            with self.get_connection(target_db) as target_conn:
                target_cursor = target_conn.cursor()
                
                for table in tables:
                    # Skip sqlite internal tables
                    if table.startswith('sqlite_'):
                        continue
                    
                    try:
                        # Get data from source table
                        source_cursor.execute(f"SELECT * FROM {table}")
                        rows = source_cursor.fetchall()
                        
                        if rows:
                            # Prepare insert statement
                            columns = list(rows[0].keys())
                            placeholders = ','.join(['?' for _ in columns])
                            
                            # Check if target table exists
                            target_cursor.execute(f"""
                                SELECT name FROM sqlite_master 
                                WHERE type='table' AND name='{table}'
                            """)
                            
                            if target_cursor.fetchone():
                                # Insert data into target
                                insert_sql = f"""
                                    INSERT OR IGNORE INTO {table} 
                                    ({','.join(columns)}) 
                                    VALUES ({placeholders})
                                """
                                
                                for row in rows:
                                    try:
                                        target_cursor.execute(insert_sql, tuple(row))
                                    except sqlite3.Error as e:
                                        logger.warning(f"Failed to migrate row: {e}")
                                
                                logger.info(f"Migrated {len(rows)} rows from {table}")
                    
                    except sqlite3.Error as e:
                        logger.warning(f"Failed to migrate table {table}: {e}")
                
                target_conn.commit()
            
            source_conn.close()
            
        except Exception as e:
            logger.error(f"Migration failed for {source_db}: {e}")
    
    def get_queue_status(self) -> Dict:
        """Get current queue status from unified database"""
        with self.get_connection('core') as conn:
            cursor = conn.cursor()
            
            # Get queue counts
            cursor.execute("""
                SELECT status, COUNT(*) as count 
                FROM queue 
                GROUP BY status
            """)
            status_counts = {row['status']: row['count'] for row in cursor.fetchall()}
            
            # Get platform distribution
            cursor.execute("""
                SELECT platform, COUNT(*) as count
                FROM queue
                WHERE status = 'pending'
                GROUP BY platform
            """)
            platform_dist = {row['platform']: row['count'] for row in cursor.fetchall()}
            
            return {
                'status_counts': status_counts,
                'platform_distribution': platform_dist,
                'total_pending': status_counts.get('pending', 0),
                'total_posted': status_counts.get('posted', 0),
                'total_failed': status_counts.get('failed', 0)
            }
    
    def add_to_queue(self, content: str, platform: str, priority: int = 0, 
                     scheduled_for: Optional[datetime] = None) -> str:
        """Add item to unified queue"""
        import hashlib
        import uuid
        
        # Generate content hash for duplicate detection
        content_hash = hashlib.md5(content.encode()).hexdigest()
        item_id = str(uuid.uuid4())
        
        with self.get_connection('core') as conn:
            cursor = conn.cursor()
            
            # Check for duplicates
            cursor.execute("""
                SELECT id FROM queue 
                WHERE content_hash = ? AND platform = ? AND status = 'pending'
            """, (content_hash, platform))
            
            if cursor.fetchone():
                logger.warning(f"Duplicate content detected for {platform}")
                return None
            
            # Insert into queue
            cursor.execute("""
                INSERT INTO queue (id, content, platform, priority, scheduled_for, content_hash)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (item_id, content, platform, priority, scheduled_for, content_hash))
            
            conn.commit()
            logger.info(f"Added item {item_id} to queue for {platform}")
            
        return item_id
    
    def process_queue_batch(self, limit: int = 10) -> List[Dict]:
        """Process a batch of queue items"""
        with self.get_connection('core') as conn:
            cursor = conn.cursor()
            
            # Get batch of items to process
            cursor.execute("""
                SELECT id, content, platform
                FROM queue
                WHERE status = 'pending'
                AND (scheduled_for IS NULL OR scheduled_for <= datetime('now'))
                ORDER BY priority DESC, created_at ASC
                LIMIT ?
            """, (limit,))
            
            items = []
            for row in cursor.fetchall():
                items.append({
                    'id': row['id'],
                    'content': row['content'],
                    'platform': row['platform']
                })
                
                # Mark as processing
                cursor.execute("""
                    UPDATE queue
                    SET status = 'processing'
                    WHERE id = ?
                """, (row['id'],))
            
            conn.commit()
            
        return items
    
    def mark_posted(self, item_id: str, post_id: Optional[str] = None):
        """Mark queue item as posted"""
        with self.get_connection('core') as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE queue
                SET status = 'posted',
                    posted_at = datetime('now')
                WHERE id = ?
            """, (item_id,))
            
            conn.commit()
            logger.info(f"Marked {item_id} as posted")
    
    def mark_failed(self, item_id: str, error: str):
        """Mark queue item as failed"""
        with self.get_connection('core') as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE queue
                SET status = 'failed',
                    error_message = ?,
                    retry_count = retry_count + 1
                WHERE id = ?
            """, (error, item_id))
            
            conn.commit()
            logger.info(f"Marked {item_id} as failed: {error}")
    
    def cleanup_old_data(self, days: int = 30):
        """Clean up old data from unified databases"""
        cutoff_date = datetime.now().timestamp() - (days * 24 * 60 * 60)
        
        for db_name in self.DATABASE_MAP:
            with self.get_connection(db_name) as conn:
                cursor = conn.cursor()
                
                # Clean old queue items
                if db_name == 'core':
                    cursor.execute("""
                        DELETE FROM queue
                        WHERE status IN ('posted', 'failed')
                        AND posted_at < datetime(?, 'unixepoch')
                    """, (cutoff_date,))
                    
                    deleted = cursor.rowcount
                    logger.info(f"Cleaned {deleted} old queue items")
                
                # Clean old analytics
                if db_name == 'core':
                    cursor.execute("""
                        DELETE FROM analytics
                        WHERE timestamp < datetime(?, 'unixepoch')
                    """, (cutoff_date,))
                    
                    deleted = cursor.rowcount
                    logger.info(f"Cleaned {deleted} old analytics records")
                
                conn.commit()
    
    def close_all_connections(self):
        """Close all database connections in the pool"""
        for db_name in self.connection_pool:
            while self.connection_pool[db_name]:
                conn = self.connection_pool[db_name].pop()
                conn.close()
        
        logger.info("All database connections closed")

def main():
    """Initialize and test unified database manager"""
    manager = UnifiedDatabaseManager()
    
    try:
        # Consolidate databases
        manager.consolidate_databases()
        
        # Test queue operations
        status = manager.get_queue_status()
        print(f"Queue Status: {json.dumps(status, indent=2)}")
        
        # Clean up old data
        manager.cleanup_old_data(days=7)
        
        logger.info("Unified Database Manager initialized successfully!")
        
    except Exception as e:
        logger.error(f"Failed to initialize database manager: {e}")
        raise
    
    finally:
        manager.close_all_connections()

if __name__ == "__main__":
    main()