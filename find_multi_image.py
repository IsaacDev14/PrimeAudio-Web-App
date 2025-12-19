import requests
import json

try:
    response = requests.get('http://localhost:8000/products/?limit=100')
    products = response.json()
    
    found = False
    for p in products:
        images = p.get('images', [])
        if len(images) > 1:
            print(f"FOUND MULTI-IMAGE PRODUCT: {p['name']} (ID: {p['id']}) - {len(images)} images")
            found = True
            break
            
    if not found:
        print("NO products with > 1 image found in the first 100 products.")
        
except Exception as e:
    print(f"Error: {e}")
