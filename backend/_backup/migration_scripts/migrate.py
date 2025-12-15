"""
Database migration script to add new columns for e-commerce features.
Run this once to update existing tables.
"""
import asyncio
from sqlalchemy import text
from database import engine

async def run_migration():
    async with engine.begin() as conn:
        # Add new columns to products table
        product_columns = [
            ("rating", "FLOAT DEFAULT 0.0"),
            ("review_count", "INTEGER DEFAULT 0"),
        ]
        
        for col_name, col_def in product_columns:
            try:
                await conn.execute(text(f"ALTER TABLE products ADD COLUMN IF NOT EXISTS {col_name} {col_def}"))
                print(f"Added column products.{col_name}")
            except Exception as e:
                print(f"Column products.{col_name} may already exist: {e}")
        
        # Add new columns to orders table
        order_columns = [
            ("payment_method", "VARCHAR"),
            ("payment_status", "VARCHAR DEFAULT 'pending'"),
            ("payment_reference", "VARCHAR"),
            ("customer_name", "VARCHAR"),
            ("customer_email", "VARCHAR"),
            ("customer_phone", "VARCHAR"),
            ("delivery_address", "TEXT"),
            ("notes", "TEXT"),
            ("approved_at", "TIMESTAMP WITH TIME ZONE"),
            ("approved_by", "INTEGER"),
            ("shipped_at", "TIMESTAMP WITH TIME ZONE"),
            ("delivered_at", "TIMESTAMP WITH TIME ZONE"),
        ]
        
        for col_name, col_def in order_columns:
            try:
                await conn.execute(text(f"ALTER TABLE orders ADD COLUMN IF NOT EXISTS {col_name} {col_def}"))
                print(f"Added column orders.{col_name}")
            except Exception as e:
                print(f"Column orders.{col_name} may already exist: {e}")
        
        # Add new columns to users table
        user_columns = [
            ("phone", "VARCHAR"),
            ("avatar_url", "VARCHAR"),
            ("is_active", "BOOLEAN DEFAULT TRUE"),
        ]
        
        for col_name, col_def in user_columns:
            try:
                await conn.execute(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col_name} {col_def}"))
                print(f"Added column users.{col_name}")
            except Exception as e:
                print(f"Column users.{col_name} may already exist: {e}")
        
        # Create new tables
        new_tables_sql = """
        CREATE TABLE IF NOT EXISTS user_addresses (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            label VARCHAR DEFAULT 'Home',
            full_name VARCHAR NOT NULL,
            phone VARCHAR NOT NULL,
            address_line TEXT NOT NULL,
            city VARCHAR DEFAULT 'Nairobi',
            county VARCHAR,
            is_default BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS wishlist_items (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, product_id)
        );
        
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR DEFAULT 'info',
            is_read BOOLEAN DEFAULT FALSE,
            link VARCHAR,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS conversations (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER NOT NULL REFERENCES users(id),
            subject VARCHAR DEFAULT 'General Inquiry',
            status VARCHAR DEFAULT 'open',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE
        );
        
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
            sender_id INTEGER NOT NULL REFERENCES users(id),
            content TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """
        
        for stmt in new_tables_sql.strip().split(';'):
            stmt = stmt.strip()
            if stmt:
                try:
                    await conn.execute(text(stmt))
                except Exception as e:
                    print(f"Table creation error (may already exist): {e}")
        
        print("Migration completed!")

if __name__ == "__main__":
    asyncio.run(run_migration())
