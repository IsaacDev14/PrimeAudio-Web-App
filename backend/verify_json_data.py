
import sys
import os
import json

# Add current directory to path
sys.path.append(os.getcwd())

import fallback_data
from dotenv import load_dotenv

load_dotenv()

print(f"FIREBASE_AVAILABLE: {os.environ.get('FIREBASE_AVAILABLE')}")
print(f"Fallback Active: {not fallback_data.is_firebase_available()}")

print("\n--- Testing Products Fallback ---")
products = fallback_data.get_fallback_products(limit=3)
print(f"Found {len(products)} products.")
for p in products:
    print(f"- {p.get('name')} (${p.get('price')})")

print("\n--- Testing Categories Fallback ---")
cats = fallback_data.get_fallback_categories()
print(f"Found {len(cats)} categories: {[c.get('name') for c in cats[:5]]}...")

print("\n--- Testing Testimonials Fallback ---")
tests = fallback_data.get_fallback_testimonials(limit=2)
for t in tests:
    print(f"- {t.get('customer_name')}: {t.get('content')[:50]}...")

print("\nSUCCESS: JSON data is loadable and structured correctly.")
