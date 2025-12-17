
import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.append(os.getcwd())

print("--- Testing AI Data Context ---")

# 1. Test Fallback Data directly
try:
    import fallback_data
    print(f"Fallback Module Loaded: {fallback_data}")
    print(f"Fallback Cache Size: {len(fallback_data._products_cache) if fallback_data._products_cache else 'None'}")
    
    # Force load if empty
    if not fallback_data._products_cache:
        print("Forcing preload...")
        fallback_data.preload_fallback_data()
        print(f"Refreshed Cache Size: {len(fallback_data._products_cache)}")
except Exception as e:
    print(f"Fallback Data Error: {e}")

# 2. Emulate get_store_context logic
def get_store_context_debug():
    print("\n[Debug] Generating Context...")
    products = []
    
    # Try Fallback directly (simulating the safety net)
    try:
        import fallback_data
        products = fallback_data._products_cache or fallback_data.load_json_file("products.json")
        print(f"[Debug] Got {len(products)} products from Fallback")
    except Exception as e:
        print(f"[Debug] Fallback import failed: {e}")

    inventory = []
    for p in products:
        stock_status = "In Stock" if p.get('stock', 0) > 0 else "Out of Stock"
        inventory.append(f"- {p.get('name')} (${p.get('price')}): {stock_status}")
    
    return "\n".join(inventory[:5]) # Show first 5

ctx = get_store_context_debug()
print(f"\n--- Result Context Preview (First 5 lines) ---\n{ctx}")
if not ctx:
    print("FAIL: Context is empty string")
else:
    print("SUCCESS: Context Generated")
