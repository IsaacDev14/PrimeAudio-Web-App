"""Re-export for backwards compatibility with fix_product_images.py"""
from product_images import PRODUCT_IMAGE_SOURCES, local_urls_for_product

# Legacy alias
PRODUCT_IMAGES = {name: local_urls_for_product(name) for name in PRODUCT_IMAGE_SOURCES}
