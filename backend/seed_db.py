import asyncio
import json
from datetime import datetime
from passlib.context import CryptContext
from sqlalchemy import select
from database import AsyncSessionLocal
import models

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def parse_date(date_val):
    if not date_val:
        return datetime.utcnow()
    if isinstance(date_val, datetime):
        return date_val
    try:
        if isinstance(date_val, str):
            if date_val.endswith("Z"):
                date_val = date_val[:-1]
            return datetime.fromisoformat(date_val)
    except Exception:
        pass
    return datetime.utcnow()

async def seed():
    print("Reading fallback JSON files...")
    with open("cache_data/products.json", "r", encoding="utf-8") as f:
        products = json.load(f)
    with open("cache_data/testimonials.json", "r", encoding="utf-8") as f:
        testimonials = json.load(f)
    with open("cache_data/categories.json", "r", encoding="utf-8") as f:
        categories = json.load(f)
    with open("cache_data/content.json", "r", encoding="utf-8") as f:
        content = json.load(f)
        
    async with AsyncSessionLocal() as session:
        # 1. Create default admin and demo customer for login testing
        print("Creating seed users...")
        demo_accounts = [
            {
                "email": "admin@primeaudio.co.ke",
                "password": "Admin@123",
                "full_name": "Admin User",
                "phone": "0712345678",
                "is_admin": True,
            },
            {
                "email": "customer@demo.com",
                "password": "Demo@123",
                "full_name": "Demo Customer",
                "phone": "0723456789",
                "is_admin": False,
            },
        ]
        for account in demo_accounts:
            result = await session.execute(
                select(models.User).where(models.User.email == account["email"])
            )
            existing = result.scalars().first()
            if existing:
                existing.hashed_password = pwd_context.hash(account["password"])
                existing.is_active = True
            else:
                session.add(
                    models.User(
                        email=account["email"],
                        hashed_password=pwd_context.hash(account["password"]),
                        full_name=account["full_name"],
                        phone=account["phone"],
                        is_admin=account["is_admin"],
                        is_active=True,
                        created_at=datetime.utcnow(),
                    )
                )
        await session.flush()
        print("Seed users created.")

        # 2. Insert Products
        print(f"Seeding {len(products)} products...")
        for p in products:
            pg_product = models.Product(
                name=p.get('name'),
                description=p.get('description'),
                price=float(p.get('price', 0.0)),
                category=p.get('category'),
                brand=p.get('brand'),
                condition=p.get('condition', 'New'),
                stock=int(p.get('stock', 0)),
                image_url=p.get('image_url'),
                images=p.get('images', []),
                is_featured=bool(p.get('is_featured', False)),
                rating=float(p.get('rating', 0.0)),
                review_count=int(p.get('review_count', 0)),
                created_at=parse_date(p.get('created_at'))
            )
            session.add(pg_product)

        # 3. Insert Testimonials
        print(f"Seeding {len(testimonials)} testimonials...")
        for t in testimonials:
            pg_testimonial = models.Testimonial(
                customer_name=t.get('customer_name') or t.get('name', 'Anonymous'),
                content=t.get('content') or t.get('text', ''),
                rating=int(t.get('rating', 5)),
                is_verified=bool(t.get('is_verified', False)),
                created_at=parse_date(t.get('created_at'))
            )
            session.add(pg_testimonial)

        # 4. Insert Content
        print(f"Seeding {len(content)} content items...")
        for c in content:
            pg_content = models.ContentItem(
                title=c.get('title', 'No Title'),
                description=c.get('description'),
                category=c.get('category'),
                type=c.get('type'),
                status=c.get('status', 'Live'),
                image_url=c.get('image_url'),
                external_link=c.get('external_link'),
                order=int(c.get('order', 0)),
                date=c.get('date'),
                created_at=parse_date(c.get('created_at'))
            )
            session.add(pg_content)

        await session.commit()
        print("Seeding to Neon Postgres completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
