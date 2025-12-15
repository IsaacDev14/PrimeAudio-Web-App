"""
Simple in-memory cache for Firebase data to reduce reads
"""
import time
from typing import Any, Optional, Dict
from functools import wraps

class SimpleCache:
    """Simple in-memory cache with TTL (Time To Live)"""
    
    def __init__(self, default_ttl: int = 300):
        """
        Initialize cache with default TTL in seconds
        default_ttl=300 means data is cached for 5 minutes
        """
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = default_ttl
        self.hits = 0
        self.misses = 0
    
    def get(self, key: str) -> Optional[Any]:
        """Get item from cache, returns None if expired or not found"""
        if key in self._cache:
            item = self._cache[key]
            if time.time() < item['expires']:
                self.hits += 1
                return item['value']
            else:
                # Expired, remove it
                del self._cache[key]
        self.misses += 1
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set item in cache with optional custom TTL"""
        ttl = ttl or self.default_ttl
        self._cache[key] = {
            'value': value,
            'expires': time.time() + ttl
        }
    
    def delete(self, key: str) -> None:
        """Delete item from cache"""
        if key in self._cache:
            del self._cache[key]
    
    def clear(self) -> None:
        """Clear all cache"""
        self._cache.clear()
    
    def clear_pattern(self, pattern: str) -> None:
        """Clear all keys matching pattern (simple contains check)"""
        keys_to_delete = [k for k in self._cache.keys() if pattern in k]
        for key in keys_to_delete:
            del self._cache[key]
    
    def stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            'total_keys': len(self._cache),
            'hits': self.hits,
            'misses': self.misses,
            'hit_rate': self.hits / (self.hits + self.misses) if (self.hits + self.misses) > 0 else 0
        }

# Global cache instances with different TTLs
# Products cache - 10 minutes (products don't change often)
products_cache = SimpleCache(default_ttl=600)

# Categories/brands cache - 30 minutes (rarely change)
meta_cache = SimpleCache(default_ttl=1800)

# Offers cache - 5 minutes
offers_cache = SimpleCache(default_ttl=300)

# User data cache - 2 minutes (more dynamic)
user_cache = SimpleCache(default_ttl=120)

# Settings cache - 1 hour (rarely changes)
settings_cache = SimpleCache(default_ttl=3600)


def cached(cache: SimpleCache, key_prefix: str = "", ttl: Optional[int] = None):
    """
    Decorator to cache function results
    
    Usage:
        @cached(products_cache, "products_list")
        def get_products():
            # expensive database call
            return db.collection('products').stream()
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key from function name and arguments
            cache_key = f"{key_prefix}:{func.__name__}:{str(args)}:{str(sorted(kwargs.items()))}"
            
            # Try to get from cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Call the actual function
            result = func(*args, **kwargs)
            
            # Store in cache
            cache.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator


def invalidate_products_cache():
    """Call this when products are created/updated/deleted"""
    products_cache.clear()


def invalidate_offers_cache():
    """Call this when offers are created/updated/deleted"""
    offers_cache.clear()


def invalidate_user_cache(user_id: str = None):
    """Call this when user data changes"""
    if user_id:
        user_cache.clear_pattern(user_id)
    else:
        user_cache.clear()


def get_cache_stats():
    """Get stats from all caches"""
    return {
        'products': products_cache.stats(),
        'meta': meta_cache.stats(),
        'offers': offers_cache.stats(),
        'user': user_cache.stats(),
        'settings': settings_cache.stats()
    }
