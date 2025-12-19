import requests
import random
import time

API_URL = "http://localhost:8000"

def get_all_products():
    try:
        response = requests.get(f"{API_URL}/products/?limit=1000")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching products: {e}")
        return []

def main():
    print("Fetching products...")
    products = get_all_products()
    print(f"Found {len(products)} products.")

    # 1. Collect all images by category
    category_images = {}
    for p in products:
        cat = p.get('category', 'Uncategorized')
        img = p.get('image_url')
        if cat not in category_images:
            category_images[cat] = set()
        
        if img:
            category_images[cat].add(img)
            
    print(f"Categories found: {list(category_images.keys())}")

    # 2. Update products
    for p in products:
        cat = p.get('category', 'Uncategorized')
        main_img = p.get('image_url')
        product_id = p.get('id')
        name = p.get('name')
        
        # Start with the main image
        new_images = []
        if main_img:
            new_images.append(main_img)
            
        # Find other images in this category
        potential_images = list(category_images.get(cat, set()))
        
        # Remove main image to avoid exact duplicate as first extra
        if main_img in potential_images:
            potential_images.remove(main_img)
            
        # Shuffle to randomize
        random.shuffle(potential_images)
        
        # Add up to 2 extra images from the same category
        # This creates the "illusion" of different angles/versions
        extras_needed = 2
        extras = potential_images[:extras_needed]
        new_images.extend(extras)
        
        # If we still don't have enough (e.g. only 1 product in category),
        # we might have to duplicate or leave it (user prefers different images though)
        # Let's ensure at least 2 images if possible, even if duplicate is last resort
        if len(new_images) < 2 and main_img:
             new_images.append(main_img)

        # Update
        print(f"Updating {name} ({product_id}) with {len(new_images)} images (Category: {cat})...")
        try:
            payload = {"images": new_images}
            requests.put(f"{API_URL}/products/{product_id}", json=payload)
        except Exception as e:
            print(f"  Error: {e}")
            
        time.sleep(0.05)

    print("Smart update complete.")

if __name__ == "__main__":
    main()
