"""
Complete Migration script to seed ALL data to Firebase Firestore
Matches the original PostgreSQL seed.py
"""
from firebase_db import get_firestore_client
import hashlib
from datetime import datetime, timedelta
import random
import uuid

# Use Faker for realistic data
try:
    from faker import Faker
    fake = Faker()
except ImportError:
    # Fallback if faker not installed
    class FakeFaker:
        def email(self): return f"user{random.randint(1000,9999)}@example.com"
        def name(self): return f"User {random.randint(1000,9999)}"
        def paragraph(self, nb_sentences=3): return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " * nb_sentences
    fake = FakeFaker()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def now_iso():
    return datetime.utcnow().isoformat()

# Product categories with real Unsplash images
CATEGORIES = {
    "Guitars": {
        "items": ["Electric Guitar", "Acoustic Guitar", "Bass Guitar", "Classical Guitar", 
                  "Semi-Acoustic Guitar", "12-String Guitar", "Ukulele"],
        "images": [
            "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=600",
            "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600",
            "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600",
            "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=600",
            "https://images.unsplash.com/photo-1558098329-a11cff621064?w=600",
        ]
    },
    "Keyboards": {
        "items": ["Digital Piano", "Synthesizer", "MIDI Controller", "Organ", 
                  "Portable Keyboard", "Workstation", "Stage Piano"],
        "images": [
            "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600",
            "https://images.unsplash.com/photo-1552422535-c45813c61732?w=600",
            "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600",
            "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=600",
        ]
    },
    "Drums": {
        "items": ["Acoustic Drum Kit", "Electronic Drum Kit", "Cajon", "Djembe",
                  "Congas", "Bongos", "Snare Drum"],
        "images": [
            "https://images.unsplash.com/photo-1519892300165-cb5542fb6747?w=600",
            "https://images.unsplash.com/photo-1571214349341-9c60e0a5bfc5?w=600",
            "https://images.unsplash.com/photo-1524230659092-07f99a75c013?w=600",
        ]
    },
    "Microphones": {
        "items": ["Dynamic Microphone", "Condenser Microphone", "Ribbon Microphone",
                  "Wireless Microphone", "USB Microphone", "Lavalier Microphone"],
        "images": [
            "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600",
            "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=600",
            "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=600",
        ]
    },
    "Speakers": {
        "items": ["Studio Monitor", "PA Speaker", "Subwoofer", "Bookshelf Speaker",
                  "Powered Speaker", "Passive Speaker", "Column Speaker"],
        "images": [
            "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=600",
            "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
        ]
    },
    "DJ Equipment": {
        "items": ["DJ Controller", "Turntable", "DJ Mixer", "CDJ Player",
                  "DJ Headphones", "DJ Software Controller"],
        "images": [
            "https://images.unsplash.com/photo-1571327073757-71d13c24de30?w=600",
            "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=600",
            "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600",
        ]
    },
    "Audio Interfaces": {
        "items": ["USB Audio Interface", "Thunderbolt Interface", "Portable Interface",
                  "Rack Mount Interface", "Preamp", "DI Box"],
        "images": [
            "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600",
            "https://images.unsplash.com/photo-1619983081563-430f63602796?w=600",
        ]
    },
    "Headphones": {
        "items": ["Studio Headphones", "DJ Headphones", "In-Ear Monitors",
                  "Wireless Headphones", "Gaming Headphones", "Reference Headphones"],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600",
            "https://images.unsplash.com/photo-1599669454699-248893623440?w=600",
        ]
    },
    "Amplifiers": {
        "items": ["Guitar Amplifier", "Bass Amplifier", "Keyboard Amplifier",
                  "Power Amplifier", "Tube Amplifier", "Combo Amp"],
        "images": [
            "https://images.unsplash.com/photo-1535587566541-97121a128dc5?w=600",
            "https://images.unsplash.com/photo-1548123378-bde4eca81d2d?w=600",
        ]
    },
    "Lighting": {
        "items": ["Stage Light", "LED Par Can", "Moving Head Light", "Laser Light",
                  "Strobe Light", "UV Black Light", "Disco Ball", "Light Controller"],
        "images": [
            "https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=600",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600",
            "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600",
        ]
    },
    "Accessories": {
        "items": ["Guitar Strings", "Drum Sticks", "Audio Cables", "Microphone Stand",
                  "Guitar Case", "Effects Pedals", "Tuners", "Music Stand"],
        "images": [
            "https://images.unsplash.com/photo-1558098329-a11cff621064?w=600",
            "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=600",
        ]
    }
}

BRANDS = [
    "Yamaha", "Fender", "Gibson", "Roland", "Korg", "Behringer",
    "Shure", "Audio-Technica", "JBL", "Pioneer", "Numark", "Native Instruments",
    "Focusrite", "Steinberg", "M-Audio", "Akai", "Tama", "Pearl",
    "Zildjian", "Sabian", "Martin", "Taylor", "Ibanez", "PRS",
    "Chauvet", "American DJ", "Elation", "Martin Lighting"
]

CONDITIONS = ["New", "Used - Like New", "Used - Excellent", "Used - Good"]

base_prices = {
    "Guitars": (15000, 200000),
    "Keyboards": (20000, 300000),
    "Drums": (25000, 250000),
    "Microphones": (3000, 50000),
    "Speakers": (10000, 150000),
    "DJ Equipment": (30000, 400000),
    "Audio Interfaces": (8000, 80000),
    "Headphones": (2000, 50000),
    "Amplifiers": (15000, 150000),
    "Lighting": (5000, 80000),
    "Accessories": (500, 10000)
}


def seed_firebase():
    """Seed Firebase Firestore with COMPLETE data"""
    db = get_firestore_client()
    
    print("[FIREBASE] Starting COMPLETE Firebase Firestore migration...")
    print("[INFO] This will create 400+ products, 100+ users, 200 orders, etc.\n")
    
    # Clear existing data
    print("[CLEAR] Clearing existing collections...")
    collections = ['users', 'products', 'categories', 'orders', 'order_items', 
                   'testimonials', 'content', 'reviews']
    for coll in collections:
        docs = list(db.collection(coll).stream())
        for doc in docs:
            doc.reference.delete()
        print(f"   Cleared {coll}")
    
    # ============ USERS ============
    print("\n[USERS] Creating users...")
    users = []
    
    # Admin
    admin_ref = db.collection('users').document()
    admin = {
        "id": admin_ref.id,
        "email": "admin@primeaudio.co.ke",
        "hashed_password": hash_password("Admin@123"),
        "full_name": "Admin User",
        "phone": "+254700000000",
        "is_admin": True,
        "is_active": True,
        "created_at": now_iso()
    }
    admin_ref.set(admin)
    users.append(admin)
    print("   [OK] Admin: admin@primeaudio.co.ke / Admin@123")
    
    # Demo customer
    customer_ref = db.collection('users').document()
    customer = {
        "id": customer_ref.id,
        "email": "customer@demo.com",
        "hashed_password": hash_password("Demo@123"),
        "full_name": "Demo Customer",
        "phone": "+254711111111",
        "is_admin": False,
        "is_active": True,
        "created_at": now_iso()
    }
    customer_ref.set(customer)
    users.append(customer)
    print("   [OK] Customer: customer@demo.com / Demo@123")
    
    # 100 random users
    for i in range(100):
        user_ref = db.collection('users').document()
        user = {
            "id": user_ref.id,
            "email": fake.email(),
            "hashed_password": hash_password("password123"),
            "full_name": fake.name(),
            "phone": f"+2547{random.randint(10000000, 99999999)}",
            "is_admin": False,
            "is_active": True,
            "created_at": now_iso()
        }
        user_ref.set(user)
        users.append(user)
        if (i + 1) % 25 == 0:
            print(f"   Created {i + 1} users...")
    
    print(f"   [OK] Total users: {len(users)}")
    
    # ============ CATEGORIES ============
    print("\n[CATEGORIES] Creating categories...")
    category_map = {}
    for cat_name in CATEGORIES.keys():
        cat_ref = db.collection('categories').document()
        cat = {
            "id": cat_ref.id,
            "name": cat_name,
            "slug": cat_name.lower().replace(" ", "-"),
            "description": f"Quality {cat_name} equipment",
            "created_at": now_iso()
        }
        cat_ref.set(cat)
        category_map[cat_name] = cat_ref.id
    print(f"   [OK] Created {len(CATEGORIES)} categories")
    
    # ============ PRODUCTS (400) ============
    print("\n[PRODUCTS] Creating 400 products...")
    products = []
    
    for i in range(400):
        category = random.choice(list(CATEGORIES.keys()))
        category_data = CATEGORIES[category]
        product_type = random.choice(category_data["items"])
        brand = random.choice(BRANDS)
        
        min_price, max_price = base_prices.get(category, (5000, 100000))
        price = round(random.uniform(min_price, max_price), -2)
        
        primary_image = random.choice(category_data["images"])
        
        prod_ref = db.collection('products').document()
        product = {
            "id": prod_ref.id,
            "name": f"{brand} {product_type}",
            "slug": f"{brand.lower()}-{product_type.lower().replace(' ', '-')}-{i}",
            "description": fake.paragraph(nb_sentences=5),
            "price": price,
            "original_price": round(price * 1.2, -2) if random.random() > 0.5 else None,
            "category": category,
            "category_id": category_map[category],
            "brand": brand,
            "condition": random.choice(CONDITIONS),
            "stock": random.randint(0, 50),
            "image_url": primary_image,
            "images": [primary_image],
            "is_featured": random.random() < 0.15,
            "is_active": True,
            "rating": round(random.uniform(3.5, 5.0), 1),
            "review_count": random.randint(0, 200),
            "created_at": now_iso(),
            "updated_at": now_iso()
        }
        prod_ref.set(product)
        products.append(product)
        
        if (i + 1) % 100 == 0:
            print(f"   Created {i + 1} products...")
    
    print(f"   [OK] Total products: {len(products)}")
    
    # ============ ORDERS (200) ============
    print("\n[ORDERS] Creating 200 orders...")
    statuses = ["pending", "approved", "Processing", "Shipped", "Delivered", "Cancelled"]
    orders = []
    
    for i in range(200):
        user = random.choice(users[1:])  # Exclude admin
        order_products = random.sample(products[:100], random.randint(1, 4))
        total = sum(p["price"] * random.randint(1, 3) for p in order_products)
        
        days_ago = random.randint(0, 90)
        created_at = (datetime.now() - timedelta(days=days_ago)).isoformat()
        
        status = random.choice(statuses)
        tracking_id = None
        
        if status in ["approved", "Processing", "Shipped", "Delivered"]:
            tracking_id = f"PA-{uuid.uuid4().hex[:8].upper()}"
        
        order_ref = db.collection('orders').document()
        order = {
            "id": order_ref.id,
            "user_id": user["id"],
            "user_email": user["email"],
            "user_name": user["full_name"],
            "status": status,
            "total_amount": total,
            "tracking_id": tracking_id,
            "shipping_address": "Nairobi, Kenya",
            "payment_method": random.choice(["mpesa", "card", "cash"]),
            "created_at": created_at,
            "items": [
                {
                    "product_id": p["id"],
                    "product_name": p["name"],
                    "price": p["price"],
                    "quantity": random.randint(1, 3),
                    "image_url": p["image_url"]
                }
                for p in order_products
            ]
        }
        order_ref.set(order)
        orders.append(order)
        
        if (i + 1) % 50 == 0:
            print(f"   Created {i + 1} orders...")
    
    print(f"   [OK] Total orders: {len(orders)}")
    
    # ============ TESTIMONIALS (30) ============
    print("\n[TESTIMONIALS] Creating testimonials...")
    testimonials_data = [
        {"name": "David Mwangi", "text": "Best music store in Nairobi! Great quality instruments.", "rating": 5},
        {"name": "Sarah Kamau", "text": "The team helped set up my entire studio. Excellent!", "rating": 5},
        {"name": "James Ochieng", "text": "Best prices and authentic gear. Highly recommend!", "rating": 5},
        {"name": "Mary Njeri", "text": "Professional equipment at competitive prices.", "rating": 5},
        {"name": "Peter Wambua", "text": "Bought my first guitar here. The staff knows their stuff.", "rating": 5},
        {"name": "Jane Akinyi", "text": "Amazing selection of keyboards. Found exactly what I needed.", "rating": 4},
        {"name": "Michael Otieno", "text": "Quality products and fair pricing. My go-to store.", "rating": 5},
        {"name": "Grace Wanjiku", "text": "Excellent after-sales support. They care about customers.", "rating": 5},
    ]
    
    for i in range(30):
        data = random.choice(testimonials_data)
        test_ref = db.collection('testimonials').document()
        test = {
            "id": test_ref.id,
            "customer_name": data["name"],
            "content": data["text"],
            "rating": data["rating"],
            "is_verified": random.random() < 0.8,
            "created_at": now_iso()
        }
        test_ref.set(test)
    
    print("   [OK] Created 30 testimonials")
    
    # ============ CONTENT ITEMS ============
    print("\n[CONTENT] Creating content items...")
    content_items = [
        {"title": "Prime Audio Studio", "category": "Projects", "type": "Recording Studio", "status": "Live"},
        {"title": "Music Production Course", "category": "Projects", "type": "Education", "status": "Live"},
        {"title": "Mobile DJ Service", "category": "Projects", "type": "Entertainment", "status": "Live"},
        {"title": "Instrument Repair", "category": "Services", "type": "Repair", "status": "Live"},
        {"title": "Music Lessons", "category": "Services", "type": "Education", "status": "Live"},
        {"title": "Studio Recording", "category": "Services", "type": "Production", "status": "Live"},
        {"title": "How to Choose Your First Guitar", "category": "Blog", "type": "Guide", "status": "Live"},
        {"title": "Top 10 Studio Monitors of 2024", "category": "Blog", "type": "Review", "status": "Live"},
        {"title": "Setting Up a Home Studio", "category": "Blog", "type": "Tutorial", "status": "Live"},
        {"title": "Nairobi Music Festival", "category": "Media", "type": "Event", "status": "Live"},
        {"title": "Studio Launch Party", "category": "Media", "type": "Community", "status": "Live"},
    ]
    
    for item in content_items:
        content_ref = db.collection('content').document()
        content = {
            "id": content_ref.id,
            "title": item["title"],
            "description": f"Description for {item['title']}",
            "category": item["category"],
            "type": item["type"],
            "status": item["status"],
            "image_url": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600",
            "created_at": now_iso()
        }
        content_ref.set(content)
    
    print(f"   [OK] Created {len(content_items)} content items")
    
    # ============ SUMMARY ============
    print("\n" + "="*50)
    print("[SUCCESS] Firebase Firestore migration COMPLETE!")
    print("="*50)
    print(f"   Users:        {len(users)}")
    print(f"   Categories:   {len(CATEGORIES)}")
    print(f"   Products:     {len(products)}")
    print(f"   Orders:       {len(orders)}")
    print(f"   Testimonials: 30")
    print(f"   Content:      {len(content_items)}")
    print("\n[LOGIN] Credentials:")
    print("   Admin:    admin@primeaudio.co.ke / Admin@123")
    print("   Customer: customer@demo.com / Demo@123")


if __name__ == "__main__":
    seed_firebase()
