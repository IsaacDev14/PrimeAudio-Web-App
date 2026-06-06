"""
Ensure demo login accounts exist with correctly hashed passwords.
Run: python seed_users.py
"""
import asyncio
from datetime import datetime

from passlib.context import CryptContext
from sqlalchemy import select

from database import AsyncSessionLocal
import models

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

DEMO_USERS = [
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


async def upsert_user(session, user_data):
    result = await session.execute(
        select(models.User).where(models.User.email == user_data["email"])
    )
    existing = result.scalars().first()

    hashed = pwd_context.hash(user_data["password"])

    if existing:
        existing.hashed_password = hashed
        existing.full_name = user_data["full_name"]
        existing.phone = user_data["phone"]
        existing.is_admin = user_data["is_admin"]
        existing.is_active = True
        print(f"Updated: {user_data['email']}")
    else:
        session.add(
            models.User(
                email=user_data["email"],
                hashed_password=hashed,
                full_name=user_data["full_name"],
                phone=user_data["phone"],
                is_admin=user_data["is_admin"],
                is_active=True,
                created_at=datetime.utcnow(),
            )
        )
        print(f"Created: {user_data['email']}")


async def seed_users():
    async with AsyncSessionLocal() as session:
        for user_data in DEMO_USERS:
            await upsert_user(session, user_data)
        await session.commit()

    print("\nDemo accounts ready:")
    print("  Admin:    admin@primeaudio.co.ke / Admin@123")
    print("  Customer: customer@demo.com / Demo@123")


if __name__ == "__main__":
    asyncio.run(seed_users())
