import asyncio
import random
from faker import Faker
from sqlalchemy.ext.asyncio import AsyncSession
from database import AsyncSessionLocal, init_db
from models import User, Product, Order, OrderItem, Review, Testimonial, ContentItem
from passlib.context import CryptContext
from datetime import datetime, timedelta
import uuid

fake = Faker()
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Product categories with real Unsplash images
CATEGORIES = {
    "Guitars": {
        "items": ["Electric Guitar", "Acoustic Guitar", "Bass Guitar", "Classical Guitar", 
                  "Semi-Acoustic Guitar", "12-String Guitar", "Ukulele"],
        "images": [
            "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=600",  # Electric guitar
            "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600",  # Guitar close
            "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600",  # Acoustic
            "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=600",  # Electric red
            "https://images.unsplash.com/photo-1558098329-a11cff621064?w=600",  # Guitar strings
            "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=600",  # Classical
            "https://images.unsplash.com/photo-1605020420620-20c943cc4669?w=600",  # Bass guitar
        ]
    },
    "Keyboards": {
        "items": ["Digital Piano", "Synthesizer", "MIDI Controller", "Organ", 
                  "Portable Keyboard", "Workstation", "Stage Piano"],
        "images": [
            "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600",  # Grand piano
            "https://images.unsplash.com/photo-1552422535-c45813c61732?w=600",  # Piano keys
            "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600",  # Studio keyboard
            "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=600",  # Digital piano
            "https://images.unsplash.com/photo-1595069906974-f8ae7ffc3e7b?w=600",  # MIDI controller
            "https://images.unsplash.com/photo-1514649923863-ceaf75b7ec00?w=600",  # Vintage organ
        ]
    },
    "Drums": {
        "items": ["Acoustic Drum Kit", "Electronic Drum Kit", "Cajón", "Djembe",
                  "Congas", "Bongos", "Snare Drum"],
        "images": [
            "https://images.unsplash.com/photo-1519892300165-cb5542fb6747?w=600",  # Drum kit
            "https://images.unsplash.com/photo-1571214349341-9c60e0a5bfc5?w=600",  # Drums action
            "https://images.unsplash.com/photo-1524230659092-07f99a75c013?w=600",  # Cymbals
            "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=600",  # Drumsticks
            "https://images.unsplash.com/photo-1543443258-92b04ad5ec6b?w=600",  # Snare
        ]
    },
    "Microphones": {
        "items": ["Dynamic Microphone", "Condenser Microphone", "Ribbon Microphone",
                  "Wireless Microphone", "USB Microphone", "Lavalier Microphone"],
        "images": [
            "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600",  # Pro mic
            "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=600",  # Studio mic
            "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=600",  # Vocal mic
            "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600",  # Recording
            "https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?w=600",  # USB mic
        ]
    },
    "Speakers": {
        "items": ["Studio Monitor", "PA Speaker", "Subwoofer", "Bookshelf Speaker",
                  "Powered Speaker", "Passive Speaker", "Column Speaker"],
        "images": [
            "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=600",  # Monitor
            "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600",  # Studio speakers
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",  # Sound system
            "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600",  # Bookshelf
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",  # PA system
        ]
    },
    "DJ Equipment": {
        "items": ["DJ Controller", "Turntable", "DJ Mixer", "CDJ Player",
                  "DJ Headphones", "DJ Software Controller"],
        "images": [
            "https://images.unsplash.com/photo-1571327073757-71d13c24de30?w=600",  # DJ setup
            "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=600",  # Turntable
            "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600",  # DJ live
            "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600",  # CDJ
            "https://images.unsplash.com/photo-1594623274890-6b45ce7cf44a?w=600",  # Controller
        ]
    },
    "Audio Interfaces": {
        "items": ["USB Audio Interface", "Thunderbolt Interface", "Portable Interface",
                  "Rack Mount Interface", "Preamp", "DI Box"],
        "images": [
            "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600",  # Interface
            "https://images.unsplash.com/photo-1619983081563-430f63602796?w=600",  # Studio gear
            "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600",  # Audio setup
            "https://images.unsplash.com/photo-1593697821094-c1b0d96ed86d?w=600",  # Recording
        ]
    },
    "Headphones": {
        "items": ["Studio Headphones", "DJ Headphones", "In-Ear Monitors",
                  "Wireless Headphones", "Gaming Headphones", "Reference Headphones"],
        "images": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",  # Headphones
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600",  # White headphones
            "https://images.unsplash.com/photo-1599669454699-248893623440?w=600",  # Over-ear
            "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600",  # Studio phones
            "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600",  # Earbuds
        ]
    },
    "Amplifiers": {
        "items": ["Guitar Amplifier", "Bass Amplifier", "Keyboard Amplifier",
                  "Power Amplifier", "Tube Amplifier", "Combo Amp"],
        "images": [
            "https://images.unsplash.com/photo-1535587566541-97121a128dc5?w=600",  # Amp stack
            "https://images.unsplash.com/photo-1548123378-bde4eca81d2d?w=600",  # Guitar amp
            "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600",  # Vintage amp
            "https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=600",  # Tube amp
        ]
    },
    "Lighting": {
        "items": ["Stage Light", "LED Par Can", "Moving Head Light", "Laser Light",
                  "Strobe Light", "UV Black Light", "Disco Ball", "Light Controller"],
        "images": [
            "https://images.unsplash.com/photo-1504509546545-e000b4a62425?w=600",  # Stage lights
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600",  # Concert
            "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600",  # DJ lights
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600",  # Club lights
            "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600",  # Festival
            "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600",  # Party lights
        ]
    },
    "Accessories": {
        "items": ["Guitar Strings", "Drum Sticks", "Audio Cables", "Microphone Stand",
                  "Guitar Case", "Effects Pedals", "Tuners", "Music Stand"],
        "images": [
            "https://images.unsplash.com/photo-1558098329-a11cff621064?w=600",  # Strings
            "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=600",  # Drumsticks
            "https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=600",  # Pedals
            "https://images.unsplash.com/photo-1519892300165-cb5542fb6747?w=600",  # Equipment
        ]
    }
}

BRANDS = [
    "Yamaha", "Fender", "Gibson", "Roland", "Korg", "Behringer",
    "Shure", "Audio-Technica", "JBL", "Pioneer", "Numark", "Native Instruments",
    "Focusrite", "Steinberg", "M-Audio", "Akai", "Tama", "Pearl",
    "Zildjian", "Sabian", "Martin", "Taylor", "Ibanez", "PRS",
    "Chauvet", "American DJ", "ADJ", "Elation", "Martin Lighting"
]

CONDITIONS = ["New", "Used - Like New", "Used - Excellent", "Used - Good"]


async def create_admin_user(session: AsyncSession):
    """Create default admin user"""
    admin_email = "admin@primeaudio.co.ke"
    
    from sqlalchemy import select
    result = await session.execute(select(User).where(User.email == admin_email))
    existing_admin = result.scalar_one_or_none()
    
    if existing_admin:
        print(f"Admin user already exists: {admin_email}. Deleting to ensure fresh hash...")
        await session.delete(existing_admin)
        await session.flush()
    
    admin = User(
        email=admin_email,
        full_name="Admin User",
        hashed_password=pwd_context.hash("Admin@123"),
        is_admin=True
    )
    session.add(admin)
    await session.commit()
    await session.refresh(admin)
    print(f"Created admin user: {admin_email} / Admin@123")
    return admin


async def create_demo_customer(session: AsyncSession):
    """Create demo customer for testing"""
    customer_email = "customer@demo.com"
    
    from sqlalchemy import select
    result = await session.execute(select(User).where(User.email == customer_email))
    existing = result.scalar_one_or_none()
    
    if existing:
        await session.delete(existing)
        await session.flush()
    
    customer = User(
        email=customer_email,
        full_name="Demo Customer",
        hashed_password=pwd_context.hash("Demo@123"),
        is_admin=False
    )
    session.add(customer)
    await session.commit()
    await session.refresh(customer)
    print(f"Created demo customer: {customer_email} / Demo@123")
    return customer


async def create_products(session: AsyncSession, count=400):
    """Create sample products with real images"""
    products = []
    
    # Price ranges per category
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
    
    for i in range(count):
        category = random.choice(list(CATEGORIES.keys()))
        category_data = CATEGORIES[category]
        product_type = random.choice(category_data["items"])
        brand = random.choice(BRANDS)
        
        min_price, max_price = base_prices.get(category, (5000, 100000))
        price = round(random.uniform(min_price, max_price), -2)
        
        # Get random images from category
        category_imgs = category_data["images"]
        primary_image = random.choice(category_imgs)
        additional_images = random.sample(category_imgs, min(len(category_imgs), random.randint(2, 4)))
        
        product = Product(
            name=f"{brand} {product_type}",
            description=fake.paragraph(nb_sentences=5),
            price=price,
            category=category,
            brand=brand,
            condition=random.choice(CONDITIONS),
            stock=random.randint(0, 50),
            image_url=primary_image,
            images=additional_images,
            is_featured=random.random() < 0.15  # 15% featured
        )
        products.append(product)
    
    session.add_all(products)
    await session.commit()
    print(f"Created {count} products with real images")
    return products


async def create_users(session: AsyncSession, count=100):
    """Create sample users"""
    users = []
    
    for i in range(count):
        user = User(
            email=fake.email(),
            full_name=fake.name(),
            hashed_password=pwd_context.hash("password123"),
            is_admin=False
        )
        users.append(user)
    
    session.add_all(users)
    await session.commit()
    print(f"Created {count} users")
    return users


async def create_orders(session: AsyncSession, users, products, count=200):
    """Create sample orders with various statuses"""
    orders = []
    statuses = ["pending", "approved", "Processing", "Shipped", "Delivered", "Cancelled"]
    
    for i in range(count):
        user = random.choice(users)
        order_products = random.sample(products[:100], random.randint(1, 4))  # Use first 100 products
        total = sum(p.price * random.randint(1, 3) for p in order_products)
        
        # Random date in the past 90 days
        days_ago = random.randint(0, 90)
        created_at = datetime.now() - timedelta(days=days_ago)
        
        status = random.choice(statuses)
        tracking_id = None
        approved_at = None
        
        # Orders that are approved or beyond have tracking IDs
        if status in ["approved", "Processing", "Shipped", "Delivered"]:
            tracking_id = f"PA-{uuid.uuid4().hex[:8].upper()}"
            approved_at = created_at + timedelta(hours=random.randint(1, 48))
        
        order = Order(
            user_id=user.id,
            status=status,
            total_amount=total,
            tracking_id=tracking_id,
            approved_at=approved_at,
            created_at=created_at
        )
        orders.append(order)
    
    session.add_all(orders)
    await session.commit()
    
    # Create order items
    for order in orders:
        await session.refresh(order)
        num_items = random.randint(1, 4)
        for _ in range(num_items):
            product = random.choice(products[:100])
            quantity = random.randint(1, 3)
            item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                price=product.price
            )
            session.add(item)
    
    await session.commit()
    print(f"Created {count} orders with items")
    return orders


async def create_testimonials(session: AsyncSession, count=30):
    """Create sample testimonials"""
    testimonials_data = [
        {"name": "David Mwangi", "text": "Best music store in Nairobi! Great quality instruments and excellent customer service.", "rating": 5},
        {"name": "Sarah Kamau", "text": "The team at Prime Audio helped set up my entire studio. Their expertise is unmatched!", "rating": 5},
        {"name": "James Ochieng", "text": "Best prices and authentic gear. I've bought 5 different pieces of equipment here!", "rating": 5},
        {"name": "Mary Njeri", "text": "Professional equipment at competitive prices. Highly recommend Prime Audio!", "rating": 5},
        {"name": "Peter Wambua", "text": "I bought my first guitar here and couldn't be happier. The staff really knows their stuff.", "rating": 5},
        {"name": "Jane Akinyi", "text": "Amazing selection of keyboards. Found exactly what I was looking for.", "rating": 4},
        {"name": "Michael Otieno", "text": "Quality products and fair pricing. My go-to store for all music equipment.", "rating": 5},
        {"name": "Grace Wanjiku", "text": "Excellent after-sales support. They really care about their customers.", "rating": 5},
        {"name": "John Kiprop", "text": "Wide variety of instruments. From beginner to professional level.", "rating": 4},
        {"name": "Lucy Muthoni", "text": "Fast delivery and great packaging. My equipment arrived in perfect condition.", "rating": 5},
        {"name": "Daniel Kimani", "text": "The tracking system is fantastic! I could follow my order every step of the way.", "rating": 5},
        {"name": "Faith Chebet", "text": "Professional DJ equipment at the best prices in Kenya. Highly recommended!", "rating": 5},
    ]
    
    testimonials = []
    for i in range(count):
        data = random.choice(testimonials_data)
        testimonial = Testimonial(
            customer_name=data["name"],
            content=data["text"],
            rating=data["rating"],
            is_verified=random.random() < 0.8
        )
        testimonials.append(testimonial)
    
    session.add_all(testimonials)
    await session.commit()
    print(f"Created {count} testimonials")
    return testimonials


async def create_content_items(session: AsyncSession):
    """Create sample content items for Projects, Services, Media, etc."""
    print("Creating content items...")
    
    projects = [
        {"title": "Prime Audio Studio", "category": "Projects", "type": "Recording Studio", "status": "Live", "date": "2024-03-20"},
        {"title": "Music Production Course", "category": "Projects", "type": "Education", "status": "Live", "date": "2024-03-01"},
        {"title": "Mobile DJ Service", "category": "Projects", "type": "Entertainment", "status": "Live", "date": "2024-02-15"},
        {"title": "Instrument Rental", "category": "Projects", "type": "Service", "status": "Beta", "date": "2024-03-15"},
        {"title": "Sound Equipment Hire", "category": "Projects", "type": "Service", "status": "Live", "date": "2024-02-28"},
    ]
    
    media_items = [
        {"title": "Nairobi Music Festival", "category": "Media", "type": "Event", "status": "Live", "date": "2024-03-10", "image_url": "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600"},
        {"title": "Studio Launch Party", "category": "Media", "type": "Community", "status": "Live", "date": "2024-06-15", "image_url": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600"},
        {"title": "Customer Appreciation Day", "category": "Media", "type": "Event", "status": "Live", "date": "2024-01-15", "image_url": "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600"},
        {"title": "Featured in Daily Nation", "category": "Media", "type": "Press", "status": "Live", "date": "2024-05-12", "image_url": "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600"},
    ]

    services = [
        {"title": "Instrument Repair", "category": "Services", "type": "Repair", "status": "Live", "date": "2024-01-01"},
        {"title": "Music Lessons", "category": "Services", "type": "Education", "status": "Live", "date": "2024-01-01"},
        {"title": "Studio Recording", "category": "Services", "type": "Production", "status": "Live", "date": "2024-01-01"},
    ]

    blogs = [
        {"title": "How to Choose Your First Guitar", "category": "Blog", "type": "Guide", "status": "Live", "date": "2024-03-18"},
        {"title": "Top 10 Studio Monitors of 2024", "category": "Blog", "type": "Review", "status": "Live", "date": "2024-03-05"},
        {"title": "Setting Up a Home Studio on a Budget", "category": "Blog", "type": "Tutorial", "status": "Live", "date": "2024-02-20"},
    ]

    all_items = []
    
    for item in projects + media_items + services + blogs:
        content = ContentItem(
            title=item["title"],
            description=f"Description for {item['title']}",
            category=item["category"],
            type=item["type"],
            status=item["status"],
            date=item["date"],
            image_url=item.get("image_url", "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600"),
            order=random.randint(1, 100)
        )
        all_items.append(content)

    session.add_all(all_items)
    await session.commit()
    print(f"Created {len(all_items)} content items")
    return all_items


async def seed_database():
    """Main seeding function"""
    print("Initializing database...")
    await init_db()
    
    async with AsyncSessionLocal() as session:
        print("\n=== Starting Database Seeding ===\n")
        
        # Create admin user
        admin = await create_admin_user(session)
        
        # Create demo customer
        demo_customer = await create_demo_customer(session)
        
        # Create products with real images
        products = await create_products(session, count=400)

        # Create Content Items
        content_items = await create_content_items(session)
        
        # Create regular users
        users = await create_users(session, count=100)
        all_users = users + [demo_customer]
        
        # Create orders
        orders = await create_orders(session, all_users, products, count=200)
        
        # Create testimonials
        testimonials = await create_testimonials(session, count=30)
        
        print("\n=== Seeding Complete ===")
        print(f"Total Products: {len(products)}")
        print(f"Total Content Items: {len(content_items)}")
        print(f"Total Users: {len(users) + 2}")  # +2 for admin and demo customer
        print(f"Total Orders: {len(orders)}")
        print(f"Total Testimonials: {len(testimonials)}")
        print(f"\n--- Login Credentials ---")
        print(f"Admin:    admin@primeaudio.co.ke / Admin@123")
        print(f"Customer: customer@demo.com / Demo@123")


if __name__ == "__main__":
    asyncio.run(seed_database())
