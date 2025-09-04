"""
Redis Caching Layer for AI Finance Agency
"""

import redis
import json
import pickle
import os
from typing import Any, Optional, Union
from datetime import timedelta
import hashlib

class RedisCache:
    def __init__(self):
        self.redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        self.client = redis.from_url(self.redis_url, decode_responses=False)
        self.default_ttl = 3600  # 1 hour default
        
    def _make_key(self, prefix: str, identifier: str) -> str:
        """Create a consistent cache key"""
        return f"ai_finance:{prefix}:{identifier}"
    
    def get(self, key: str, prefix: str = "cache") -> Optional[Any]:
        """Get value from cache"""
        try:
            full_key = self._make_key(prefix, key)
            value = self.client.get(full_key)
            
            if value:
                # Try JSON first, then pickle
                try:
                    return json.loads(value)
                except:
                    return pickle.loads(value)
            return None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: int = None, prefix: str = "cache") -> bool:
        """Set value in cache"""
        try:
            full_key = self._make_key(prefix, key)
            ttl = ttl or self.default_ttl
            
            # Try JSON first for simple types, else pickle
            try:
                serialized = json.dumps(value)
            except:
                serialized = pickle.dumps(value)
            
            return self.client.setex(full_key, ttl, serialized)
        except Exception as e:
            print(f"Cache set error: {e}")
            return False
    
    def delete(self, key: str, prefix: str = "cache") -> bool:
        """Delete value from cache"""
        try:
            full_key = self._make_key(prefix, key)
            return bool(self.client.delete(full_key))
        except Exception as e:
            print(f"Cache delete error: {e}")
            return False
    
    def exists(self, key: str, prefix: str = "cache") -> bool:
        """Check if key exists"""
        try:
            full_key = self._make_key(prefix, key)
            return bool(self.client.exists(full_key))
        except Exception as e:
            print(f"Cache exists error: {e}")
            return False
    
    # Specialized cache methods
    
    def cache_market_data(self, symbol: str, data: dict, ttl: int = 300):
        """Cache market data with 5-minute TTL"""
        return self.set(f"market:{symbol}", data, ttl, "realtime")
    
    def get_market_data(self, symbol: str) -> Optional[dict]:
        """Get cached market data"""
        return self.get(f"market:{symbol}", "realtime")
    
    def cache_content(self, content_hash: str, content: dict, ttl: int = 7200):
        """Cache generated content with 2-hour TTL"""
        return self.set(f"content:{content_hash}", content, ttl, "content")
    
    def get_content(self, content_hash: str) -> Optional[dict]:
        """Get cached content"""
        return self.get(f"content:{content_hash}", "content")
    
    def cache_subscriber(self, telegram_id: str, data: dict, ttl: int = 86400):
        """Cache subscriber data with 24-hour TTL"""
        return self.set(f"subscriber:{telegram_id}", data, ttl, "users")
    
    def get_subscriber(self, telegram_id: str) -> Optional[dict]:
        """Get cached subscriber data"""
        return self.get(f"subscriber:{telegram_id}", "users")
    
    def increment_metric(self, metric_name: str, amount: int = 1):
        """Increment a metric counter"""
        key = self._make_key("metrics", metric_name)
        return self.client.incrby(key, amount)
    
    def get_metric(self, metric_name: str) -> int:
        """Get metric value"""
        key = self._make_key("metrics", metric_name)
        value = self.client.get(key)
        return int(value) if value else 0
    
    # Rate limiting
    
    def check_rate_limit(self, identifier: str, limit: int = 60, window: int = 60) -> bool:
        """Check if rate limit is exceeded"""
        key = self._make_key("ratelimit", identifier)
        
        try:
            current = self.client.incr(key)
            if current == 1:
                self.client.expire(key, window)
            
            return current <= limit
        except Exception as e:
            print(f"Rate limit error: {e}")
            return True
    
    # Distributed locking
    
    def acquire_lock(self, resource: str, timeout: int = 10) -> bool:
        """Acquire a distributed lock"""
        key = self._make_key("lock", resource)
        return bool(self.client.set(key, "1", nx=True, ex=timeout))
    
    def release_lock(self, resource: str) -> bool:
        """Release a distributed lock"""
        key = self._make_key("lock", resource)
        return bool(self.client.delete(key))
    
    # Pub/Sub for real-time updates
    
    def publish(self, channel: str, message: Union[str, dict]) -> int:
        """Publish message to channel"""
        if isinstance(message, dict):
            message = json.dumps(message)
        
        full_channel = self._make_key("pubsub", channel)
        return self.client.publish(full_channel, message)
    
    def subscribe(self, channels: list):
        """Subscribe to channels"""
        pubsub = self.client.pubsub()
        full_channels = [self._make_key("pubsub", ch) for ch in channels]
        pubsub.subscribe(full_channels)
        return pubsub
    
    # Session management
    
    def store_session(self, session_id: str, data: dict, ttl: int = 3600):
        """Store user session data"""
        return self.set(f"session:{session_id}", data, ttl, "sessions")
    
    def get_session(self, session_id: str) -> Optional[dict]:
        """Get user session data"""
        return self.get(f"session:{session_id}", "sessions")
    
    def clear_cache_pattern(self, pattern: str):
        """Clear all keys matching pattern"""
        for key in self.client.scan_iter(f"ai_finance:{pattern}*"):
            self.client.delete(key)

# Singleton instance
cache = RedisCache()