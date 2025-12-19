import requests
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

def update_product_images(product):
    product_id = product.get('id')
    name = product.get('name')
    current_images = product.get('images', [])
    image_url = product.get('image_url')

    if len(current_images) >= 2:
        print(f"Skipping {name} ({product_id}): Already has {len(current_images)} images.")
        return

    # Create new images list
    new_images = list(current_images)
    
    # Ensure we have at least the main image
    if not new_images and image_url:
        new_images.append(image_url)
    
    # Add a second image if needed
    # We will use the same image URL if we don't have another one, 
    # just to satisfy the "2 images" requirement for the carousel to function.
    # Ideally we'd have different angles, but we don't have that data.
    while len(new_images) < 2:
        if image_url:
            new_images.append(image_url)
        else:
            # Fallback placeholder if no image_url exists
            new_images.append("https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=600")

    print(f"Updating {name} ({product_id}) with {len(new_images)} images...")
    
    try:
        # We only need to send the field we are updating
        payload = {"images": new_images}
        response = requests.put(f"{API_URL}/products/{product_id}", json=payload)
        
        if response.status_code == 200:
            print("  Success")
        else:
            print(f"  Failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"  Error updating: {e}")

def main():
    print("Starting bulk update of product images...")
    products = get_all_products()
    print(f"Found {len(products)} products.")
    
    for product in products:
        update_product_images(product)
        time.sleep(0.1) # Be gentle with the API
        
    print("Bulk update complete.")

if __name__ == "__main__":
    main()
