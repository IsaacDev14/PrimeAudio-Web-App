import requests
import time
import random

API_URL = "http://localhost:8000"

# Templates for better descriptions based on category
TEMPLATES = {
    "Guitars": [
        "Experience the rich, resonant tone of the {name}. Perfect for both studio recordings and live performances, this guitar features premium craftsmanship and exceptional playability.",
        "The {name} combines classic design with modern features. Built with high-quality tonewoods, it delivers warmth and clarity that inspires creativity.",
        "Unleash your musical potential with the {name}. Designed for professionals, it offers superior sustain, comfortable neck profile, and versatile electronics.",
    ],
    "Keyboards": [
        "Unlock new sonic possibilities with the {name}. Featuring realistic touch response and a vast library of sounds, it's the ultimate tool for composers and performers.",
        "The {name} puts professional music production power at your fingertips. With intuitive controls and premium keybed, it's designed for expression.",
        "Elevate your performance with the {name}. combining vintage warmth with modern digital flexibility, perfect for any genre.",
    ],
    "Drums": [
        "The {name} delivers punchy, cutting tones with incredible dynamic range. Built to withstand heavy hitting while maintaining tuning stability.",
        "Set the groove with the {name}. Precision-engineered shells and hardware ensure reliable performance night after night.",
        "Experience the perfect balance of attack and resonance with the {name}. A top choice for drummers seeking professional sound.",
    ],
    "Microphones": [
        "Capture every nuance with the {name}. This microphone offers transparent audio reproduction and low noise, ideal for vocals and instruments.",
        "The {name} is an industry standard for reason. Rugged durability meets studio-quality sound, making it essential for your locker.",
        "Achieve professional broadcast-quality sound with the {name}. Designed for clarity and warmth in any recording environment.",
    ],
    "Speakers": [
        "Immerse yourself in crystal-clear audio with the {name}. Delivers deep bass and pristine highs for an accurate listening experience.",
        "The {name} is engineered for power and precision. Perfect for monitoring mixes or filling the room with high-fidelity sound.",
        "Hear your music as it was meant to be heard with the {name}. Advanced driver technology ensures flat frequency response and minimal distortion.",
    ],
    "DJ Equipment": [
        "Take control of the dancefloor with the {name}. Packed with performance features, it offers seamless mixing and creative effects.",
        "The {name} is built for the booth. Robust construction and intuitive layout make it the reliable choice for professional DJs.",
        "Elevate your sets with the {name}. High-resolution audio and responsive controls let you perform with confidence.",
    ],
    "Lighting": [
        "Transform your stage with the {name}. Vibrant colors and dynamic patterns create an immersive visual experience.",
        "The {name} adds excitement to any event. Energy-efficient and easy to control, it's a must-have for your lighting rig.",
        "Create stunning light shows with the {name}. Features multiple modes and smooth movement for professional atmosphere.",
    ],
    "Accessories": [
        "Reliability you can count on. The {name} is an essential accessory built with high-quality materials for long-lasting performance.",
        "Don't compromise on quality with the {name}. Designed to meet the demands of working musicians.",
        "The {name} offers the perfect blend of durability and functionality. finish your setup with the best.",
    ],
    "Audio Interfaces": [
        "Record studio-quality audio anywhere with the {name}. High-headroom preamps and pristine conversion ensure professional results.",
        "The {name} connects your instruments to the digital world with zero latency. Compact, rugged, and easy to use.",
    ],
    "Headphones": [
        "Hear every detail with the {name}. Designed for critical listening, they offer superior isolation and comfort for long sessions.",
        "The {name} delivers accurate reference sound. Perfect for mixing, mastering, or simply enjoying your favorite tracks.",
    ],
    "Amplifiers": [
        "Drive your sound with the {name}. Delivers authentic tube-like tone and massive power for any venue.",
        "The {name} shapes your tone with precision. Versatile EQ and robust construction make it a gigging workhorse.",
    ]
}

DEFAULT_TEMPLATES = [
    "The {name} represents the pinnacle of audio engineering. Designed for serious musicians, it combines performance, durability, and style.",
    "Upgrade your gear with the {name}. High-quality components and attention to detail ensure superior performance.",
]

def get_all_products():
    try:
        response = requests.get(f"{API_URL}/products/?limit=1000")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching products: {e}")
        return []

def generate_description(product):
    name = product.get('name', 'Product')
    category = product.get('category', 'Accessories')
    
    # Get templates for this category, or default
    templates = TEMPLATES.get(category, DEFAULT_TEMPLATES)
    
    # Choose one randomly
    template = random.choice(templates)
    
    return template.format(name=name, category=category)

def update_product_description(product):
    product_id = product.get('id')
    name = product.get('name')
    current_desc = product.get('description', '')
    
    # Generate new description
    new_desc = generate_description(product)
    
    # Simple check to avoid overwriting if currently looks "custom" or short? 
    # User said they are "bad", so let's overwrite ALL long ones that look like lorem ipsum.
    # Or just overwrite all for consistency as requested.
    
    if new_desc == current_desc:
        print(f"Skipping {name}: Description matches.")
        return

    print(f"Fixing description for {name} ({product_id})...")
    
    try:
        payload = {"description": new_desc}
        response = requests.put(f"{API_URL}/products/{product_id}", json=payload)
        
        if response.status_code == 200:
            print("  Success")
        else:
            print(f"  Failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"  Error updating: {e}")

def main():
    print("Starting product description fix...")
    products = get_all_products()
    print(f"Found {len(products)} products.")
    
    for product in products:
        update_product_description(product)
        time.sleep(0.05)
        
    print("Description update complete.")

if __name__ == "__main__":
    main()
