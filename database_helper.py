#!/usr/bin/env python3
"""
Database Helper Module
======================
Provides unified database connections for all dashboards
"""

import sqlite3
import json
import redis
from pathlib import Path
from contextlib import contextmanager
import threading

# Load configuration
config_path = Path(__file__).parent / 'config.json'
with open(config_path, 'r') as f:
    CONFIG = json.load(f)

# Thread-local storage for connections
_thread_local = threading.local()

def get_redis_client():
    """Get Redis client (singleton per thread)"""
    if not hasattr(_thread_local, 'redis_client'):
        _thread_local.redis_client = redis.Redis(
            host=CONFIG['redis']['host'],
            port=CONFIG['redis']['port'],
            db=CONFIG['redis']['db'],
            decode_responses=True
        )
    return _thread_local.redis_client

@contextmanager
def get_db_connection(db_type='core'):
    """Get database connection with proper handling"""
    if db_type not in CONFIG['databases']:
        raise ValueError(f"Unknown database type: {db_type}")
    
    db_path = CONFIG['databases'][db_type]
    conn = sqlite3.connect(db_path, timeout=30.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    
    try:
        yield conn
    finally:
        conn.close()

def get_queue_status():
    """Get current queue status from unified database"""
    with get_db_connection('core') as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT status, COUNT(*) as count 
            FROM queue 
            GROUP BY status
        """)
        status_counts = {row['status']: row['count'] for row in cursor.fetchall()}
        
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
            'total_pending': status_counts.get('pending', 0)
        }

def cache_set(key, value, expire=3600):
    """Set value in Redis cache"""
    redis_client = get_redis_client()
    redis_client.setex(key, expire, json.dumps(value))

def cache_get(key):
    """Get value from Redis cache"""
    redis_client = get_redis_client()
    value = redis_client.get(key)
    return json.loads(value) if value else None

def publish_event(channel, message):
    """Publish event to Redis pub/sub"""
    redis_client = get_redis_client()
    redis_client.publish(channel, json.dumps(message))

def get_rate_limit(platform):
    """Get rate limit configuration for platform"""
    return CONFIG['rate_limits'].get(platform, {})
