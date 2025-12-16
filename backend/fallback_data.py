"""
Fallback Data Handler
Provides JSON-based fallback data when Firebase is unavailable or at quota limit.
"""

import json
import os
from pathlib import Path
from typing import List, Dict, Any, Optional

# Path to cache_data directory
CACHE_DIR = Path(__file__).parent / "cache_data"


def load_json_file(filename: str) -> List[Dict[str, Any]]:
    """Load data from a JSON file in the cache_data directory."""
    filepath = CACHE_DIR / filename
    try:
        if filepath.exists():
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print(f"Error loading {filename}: {e}")
    return []


def get_fallback_products(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    featured_only: bool = False
) -> List[Dict[str, Any]]:
    """Get products from JSON fallback with filtering."""
    products = load_json_file("products.json")
    
    # Apply filters
    if category:
        products = [p for p in products if p.get("category", "").lower() == category.lower()]
    
    if brand:
        products = [p for p in products if p.get("brand", "").lower() == brand.lower()]
    
    if search:
        search_lower = search.lower()
        products = [p for p in products if 
                    search_lower in p.get("name", "").lower() or 
                    search_lower in p.get("description", "").lower() or
                    search_lower in p.get("category", "").lower()]
    
    if featured_only:
        products = [p for p in products if p.get("is_featured", False)]
    
    # Apply pagination
    return products[skip:skip + limit]


def get_fallback_product_by_id(product_id: str) -> Optional[Dict[str, Any]]:
    """Get a single product by ID from fallback data."""
    products = load_json_file("products.json")
    for product in products:
        if product.get("id") == product_id:
            return product
    return None


def get_fallback_categories() -> List[Dict[str, Any]]:
    """Get all categories from fallback data."""
    return load_json_file("categories.json")


def get_fallback_brands() -> List[Dict[str, Any]]:
    """Get all brands from fallback data."""
    return load_json_file("brands.json")


def get_fallback_testimonials(limit: int = 10) -> List[Dict[str, Any]]:
    """Get testimonials from fallback data."""
    testimonials = load_json_file("testimonials.json")
    return testimonials[:limit]


def get_fallback_offers(active_only: bool = True) -> List[Dict[str, Any]]:
    """Get offers from fallback data."""
    offers = load_json_file("offers.json")
    # For demo purposes, return all offers (empty by default)
    return offers


def is_firebase_available() -> bool:
    """Check if Firebase is responding (simple health check)."""
    # This is a simple marker - could be enhanced with actual health checks
    return os.environ.get("FIREBASE_AVAILABLE", "true").lower() == "true"


# Pre-load data on module import for faster access
_products_cache = None
_categories_cache = None
_brands_cache = None
_testimonials_cache = None


def preload_fallback_data():
    """Pre-load all fallback data into memory."""
    global _products_cache, _categories_cache, _brands_cache, _testimonials_cache
    _products_cache = load_json_file("products.json")
    _categories_cache = load_json_file("categories.json")
    _brands_cache = load_json_file("brands.json")
    _testimonials_cache = load_json_file("testimonials.json")
    print(f"Fallback data preloaded: {len(_products_cache)} products, {len(_categories_cache)} categories")


# Initialize on import
if CACHE_DIR.exists():
    preload_fallback_data()
