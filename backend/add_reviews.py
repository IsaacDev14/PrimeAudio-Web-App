"""Add reviews table"""
import asyncio
from sqlalchemy import text
from database import engine

async def add_reviews_table():
    async with engine.begin() as conn:
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                order_id INTEGER REFERENCES orders(id),
                rating INTEGER NOT NULL,
                title VARCHAR,
                comment TEXT,
                is_approved BOOLEAN DEFAULT FALSE,
                is_verified_purchase BOOLEAN DEFAULT FALSE,
                helpful_votes INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        """))
        print("Reviews table created!")

if __name__ == "__main__":
    asyncio.run(add_reviews_table())
