"""
Simple Cache for Local Development (No Redis Required)
"""

import json
import time
from typing import Any, Optional

class SimpleCache:
    def __init__(self):
        self.cache = {}
        self.metrics = {}
        
    def get(self, key: str, prefix: str = "cache") -> Optional[Any]:
        """Get value from cache"""
        full_key = f"{prefix}:{key}"
        if full_key in self.cache:
            item = self.cache[full_key]
            if item['expires'] > time.time():
                return item['value']
            else:
                del self.cache[full_key]
        return None
    
    def set(self, key: str, value: Any, ttl: int = 3600, prefix: str = "cache") -> bool:
        """Set value in cache"""
        full_key = f"{prefix}:{key}"
        self.cache[full_key] = {
            'value': value,
            'expires': time.time() + ttl
        }
        return True
    
    def increment_metric(self, metric_name: str, amount: int = 1):
        """Increment a metric counter"""
        if metric_name not in self.metrics:
            self.metrics[metric_name] = 0
        self.metrics[metric_name] += amount
        return self.metrics[metric_name]
    
    def get_metric(self, metric_name: str) -> int:
        """Get metric value"""
        return self.metrics.get(metric_name, 0)
    
    def cache_subscriber(self, telegram_id: str, data: dict, ttl: int = 86400):
        """Cache subscriber data"""
        return self.set(f"subscriber:{telegram_id}", data, ttl, "users")
    
    def get_subscriber(self, telegram_id: str) -> Optional[dict]:
        """Get cached subscriber data"""
        return self.get(f"subscriber:{telegram_id}", "users")

# Singleton instance
cache = SimpleCache()