#!/usr/bin/env python3
"""
Redis Cache Manager - Intelligent caching layer for all dashboards
Implements cache warming, invalidation, and pub/sub for real-time updates
"""

import redis
import json
import pickle
import hashlib
import time
from datetime import datetime, timedelta
from typing import Any, Optional, Dict, List, Callable
from functools import wraps
import logging
import threading

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RedisCacheManager:
    def __init__(self, host='localhost', port=6379, db=0, decode_responses=False):
        """Initialize Redis cache manager"""
        self.redis_client = redis.Redis(
            host=host,
            port=port,
            db=db,
            decode_responses=decode_responses,
            connection_pool=redis.ConnectionPool(
                host=host,
                port=port,
                db=db,
                max_connections=50
            )
        )
        self.pubsub = self.redis_client.pubsub()
        self.cache_stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0
        }
        
        # Cache configuration
        self.default_ttl = 300  # 5 minutes
        self.cache_prefixes = {
            'dashboard': 300,     # 5 minutes
            'queue': 60,         # 1 minute
            'content': 600,      # 10 minutes
            'analytics': 1800,   # 30 minutes
            'user': 3600,       # 1 hour
            'static': 86400     # 24 hours
        }
        
        # Start cache warmer thread
        self.warmer_thread = None
        self.warmer_running = False
        
        # Verify Redis connection
        try:
            self.redis_client.ping()
            logger.info("Redis cache manager initialized successfully")
        except redis.ConnectionError:
            logger.error("Failed to connect to Redis")
            raise
    
    def _generate_key(self, prefix: str, identifier: str) -> str:
        """Generate cache key with prefix"""
        return f"{prefix}:{identifier}"
    
    def _get_ttl_for_prefix(self, prefix: str) -> int:
        """Get TTL based on cache prefix"""
        prefix_type = prefix.split(':')[0] if ':' in prefix else prefix
        return self.cache_prefixes.get(prefix_type, self.default_ttl)
    
    def get(self, key: str, default=None) -> Any:
        """Get value from cache"""
        try:
            value = self.redis_client.get(key)
            if value is not None:
                self.cache_stats['hits'] += 1
                # Try to deserialize JSON first, then pickle
                try:
                    return json.loads(value)
                except (json.JSONDecodeError, TypeError):
                    try:
                        return pickle.loads(value)
                    except:
                        return value.decode() if isinstance(value, bytes) else value
            else:
                self.cache_stats['misses'] += 1
                return default
        except Exception as e:
            logger.error(f"Cache get error for {key}: {e}")
            return default
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache"""
        try:
            if ttl is None:
                ttl = self._get_ttl_for_prefix(key)
            
            # Serialize value
            if isinstance(value, (dict, list)):
                serialized = json.dumps(value)
            elif isinstance(value, str):
                serialized = value
            else:
                serialized = pickle.dumps(value)
            
            result = self.redis_client.setex(key, ttl, serialized)
            self.cache_stats['sets'] += 1
            return result
        except Exception as e:
            logger.error(f"Cache set error for {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            result = self.redis_client.delete(key) > 0
            if result:
                self.cache_stats['deletes'] += 1
            return result
        except Exception as e:
            logger.error(f"Cache delete error for {key}: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                deleted = self.redis_client.delete(*keys)
                self.cache_stats['deletes'] += deleted
                return deleted
            return 0
        except Exception as e:
            logger.error(f"Cache delete pattern error for {pattern}: {e}")
            return 0
    
    def cache_decorator(self, prefix: str = 'cache', ttl: Optional[int] = None):
        """Decorator for caching function results"""
        def decorator(func: Callable):
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Generate cache key from function name and arguments
                cache_data = f"{func.__name__}:{str(args)}:{str(kwargs)}"
                cache_key = self._generate_key(
                    prefix,
                    hashlib.md5(cache_data.encode()).hexdigest()
                )
                
                # Try to get from cache
                cached_result = self.get(cache_key)
                if cached_result is not None:
                    logger.debug(f"Cache hit for {func.__name__}")
                    return cached_result
                
                # Execute function and cache result
                result = func(*args, **kwargs)
                self.set(cache_key, result, ttl)
                logger.debug(f"Cached result for {func.__name__}")
                
                return result
            return wrapper
        return decorator
    
    def invalidate_cache(self, prefix: str):
        """Invalidate all cache entries with given prefix"""
        pattern = f"{prefix}:*"
        deleted = self.delete_pattern(pattern)
        logger.info(f"Invalidated {deleted} cache entries with prefix '{prefix}'")
        return deleted
    
    def warm_cache(self, warmers: List[Dict]):
        """Warm cache with predefined data"""
        warmed = 0
        for warmer in warmers:
            key = warmer.get('key')
            func = warmer.get('func')
            ttl = warmer.get('ttl', self.default_ttl)
            
            if key and func:
                try:
                    result = func()
                    if self.set(key, result, ttl):
                        warmed += 1
                        logger.debug(f"Warmed cache: {key}")
                except Exception as e:
                    logger.error(f"Failed to warm cache for {key}: {e}")
        
        logger.info(f"Cache warming complete: {warmed}/{len(warmers)} entries")
        return warmed
    
    def start_cache_warmer(self, warmers: List[Dict], interval: int = 60):
        """Start background cache warming thread"""
        def warmer_loop():
            while self.warmer_running:
                self.warm_cache(warmers)
                time.sleep(interval)
        
        if not self.warmer_running:
            self.warmer_running = True
            self.warmer_thread = threading.Thread(target=warmer_loop, daemon=True)
            self.warmer_thread.start()
            logger.info(f"Cache warmer started (interval: {interval}s)")
    
    def stop_cache_warmer(self):
        """Stop cache warming thread"""
        self.warmer_running = False
        if self.warmer_thread:
            self.warmer_thread.join(timeout=5)
            logger.info("Cache warmer stopped")
    
    def publish(self, channel: str, message: Dict):
        """Publish message to Redis pub/sub channel"""
        try:
            serialized = json.dumps(message)
            result = self.redis_client.publish(channel, serialized)
            logger.debug(f"Published to {channel}: {message}")
            return result
        except Exception as e:
            logger.error(f"Publish error to {channel}: {e}")
            return 0
    
    def subscribe(self, channels: List[str], callback: Callable):
        """Subscribe to Redis pub/sub channels"""
        def listener():
            self.pubsub.subscribe(*channels)
            logger.info(f"Subscribed to channels: {channels}")
            
            for message in self.pubsub.listen():
                if message['type'] == 'message':
                    try:
                        data = json.loads(message['data'])
                        callback(message['channel'], data)
                    except Exception as e:
                        logger.error(f"Subscription callback error: {e}")
        
        listener_thread = threading.Thread(target=listener, daemon=True)
        listener_thread.start()
        return listener_thread
    
    def get_stats(self) -> Dict:
        """Get cache statistics"""
        total_requests = self.cache_stats['hits'] + self.cache_stats['misses']
        hit_rate = (self.cache_stats['hits'] / total_requests * 100) if total_requests > 0 else 0
        
        # Get Redis info
        info = self.redis_client.info()
        memory_info = self.redis_client.info('memory')
        
        return {
            'cache_stats': self.cache_stats,
            'hit_rate': f"{hit_rate:.2f}%",
            'total_requests': total_requests,
            'redis_info': {
                'connected_clients': info.get('connected_clients', 0),
                'used_memory_human': memory_info.get('used_memory_human', 'N/A'),
                'used_memory_peak_human': memory_info.get('used_memory_peak_human', 'N/A'),
                'total_keys': self.redis_client.dbsize()
            }
        }
    
    def clear_all(self):
        """Clear all cache entries (use with caution!)"""
        self.redis_client.flushdb()
        logger.warning("All cache entries cleared")

# Dashboard-specific cache implementations
class DashboardCache:
    """Cache implementations for dashboard data"""
    
    def __init__(self, cache_manager: RedisCacheManager):
        self.cache = cache_manager
    
    def cache_dashboard_data(self, dashboard_id: str, data: Dict, ttl: int = 300):
        """Cache dashboard data"""
        key = f"dashboard:{dashboard_id}:data"
        return self.cache.set(key, data, ttl)
    
    def get_dashboard_data(self, dashboard_id: str) -> Optional[Dict]:
        """Get cached dashboard data"""
        key = f"dashboard:{dashboard_id}:data"
        return self.cache.get(key)
    
    def cache_queue_status(self, status: Dict, ttl: int = 60):
        """Cache queue status (short TTL for real-time data)"""
        key = "queue:status"
        return self.cache.set(key, status, ttl)
    
    def get_queue_status(self) -> Optional[Dict]:
        """Get cached queue status"""
        return self.cache.get("queue:status")
    
    def cache_content(self, content_id: str, content: Dict, ttl: int = 600):
        """Cache generated content"""
        key = f"content:{content_id}"
        return self.cache.set(key, content, ttl)
    
    def get_content(self, content_id: str) -> Optional[Dict]:
        """Get cached content"""
        key = f"content:{content_id}"
        return self.cache.get(key)
    
    def cache_analytics(self, metric: str, data: Dict, ttl: int = 1800):
        """Cache analytics data"""
        key = f"analytics:{metric}"
        return self.cache.set(key, data, ttl)
    
    def get_analytics(self, metric: str) -> Optional[Dict]:
        """Get cached analytics"""
        key = f"analytics:{metric}"
        return self.cache.get(key)

# Example cache warmers
def get_cache_warmers():
    """Get list of cache warmers for background warming"""
    import sqlite3
    
    def get_queue_count():
        """Get queue count for warming"""
        try:
            conn = sqlite3.connect('posting_queue.db')
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM queue WHERE status = 'pending'")
            count = cursor.fetchone()[0]
            conn.close()
            return {'pending_count': count}
        except:
            return {'pending_count': 0}
    
    def get_recent_posts():
        """Get recent posts for warming"""
        try:
            conn = sqlite3.connect('posting_queue.db')
            cursor = conn.cursor()
            cursor.execute("""
                SELECT platform, COUNT(*) as count 
                FROM queue 
                WHERE status = 'posted' 
                AND posted_at > datetime('now', '-1 day')
                GROUP BY platform
            """)
            results = cursor.fetchall()
            conn.close()
            return dict(results)
        except:
            return {}
    
    return [
        {
            'key': 'queue:pending_count',
            'func': get_queue_count,
            'ttl': 60
        },
        {
            'key': 'analytics:recent_posts',
            'func': get_recent_posts,
            'ttl': 300
        }
    ]

# Real-time event system
class RealtimeEvents:
    """Pub/Sub system for real-time dashboard updates"""
    
    def __init__(self, cache_manager: RedisCacheManager):
        self.cache = cache_manager
        self.channels = {
            'dashboard:updates': self.handle_dashboard_update,
            'queue:changes': self.handle_queue_change,
            'content:generated': self.handle_content_generated,
            'system:alerts': self.handle_system_alert
        }
    
    def start_listening(self):
        """Start listening to all channels"""
        self.cache.subscribe(list(self.channels.keys()), self.route_message)
    
    def route_message(self, channel: str, data: Dict):
        """Route message to appropriate handler"""
        channel = channel.decode() if isinstance(channel, bytes) else channel
        handler = self.channels.get(channel)
        if handler:
            handler(data)
    
    def handle_dashboard_update(self, data: Dict):
        """Handle dashboard update events"""
        logger.info(f"Dashboard update: {data}")
        # Invalidate relevant cache
        self.cache.invalidate_cache(f"dashboard:{data.get('dashboard_id', '*')}")
    
    def handle_queue_change(self, data: Dict):
        """Handle queue change events"""
        logger.info(f"Queue change: {data}")
        # Invalidate queue cache
        self.cache.invalidate_cache("queue")
    
    def handle_content_generated(self, data: Dict):
        """Handle content generated events"""
        logger.info(f"Content generated: {data}")
        # Cache the new content
        if 'content_id' in data and 'content' in data:
            dashboard_cache = DashboardCache(self.cache)
            dashboard_cache.cache_content(data['content_id'], data['content'])
    
    def handle_system_alert(self, data: Dict):
        """Handle system alerts"""
        logger.warning(f"System alert: {data}")
        # Could trigger notifications or other actions

if __name__ == "__main__":
    # Test Redis cache manager
    cache_manager = RedisCacheManager()
    
    print("\n" + "="*60)
    print("🚀 REDIS CACHE MANAGER")
    print("="*60)
    
    # Test basic operations
    print("\n1. Testing basic cache operations...")
    cache_manager.set("test:key", {"data": "test"}, 60)
    result = cache_manager.get("test:key")
    print(f"   Cache set/get: {result}")
    
    # Test dashboard cache
    print("\n2. Testing dashboard cache...")
    dashboard_cache = DashboardCache(cache_manager)
    dashboard_cache.cache_dashboard_data("main", {"visits": 100, "users": 50})
    cached_data = dashboard_cache.get_dashboard_data("main")
    print(f"   Dashboard data: {cached_data}")
    
    # Start cache warmer
    print("\n3. Starting cache warmer...")
    warmers = get_cache_warmers()
    warmed = cache_manager.warm_cache(warmers)
    print(f"   Warmed {warmed} cache entries")
    
    # Show statistics
    print("\n4. Cache statistics:")
    stats = cache_manager.get_stats()
    print(f"   Hit rate: {stats['hit_rate']}")
    print(f"   Total requests: {stats['total_requests']}")
    print(f"   Redis memory: {stats['redis_info']['used_memory_human']}")
    print(f"   Total keys: {stats['redis_info']['total_keys']}")
    
    # Start real-time events
    print("\n5. Starting real-time event system...")
    events = RealtimeEvents(cache_manager)
    events.start_listening()
    print("   Listening for real-time updates...")
    
    print("\n" + "="*60)
    print("Redis cache manager ready!")
    print("="*60)