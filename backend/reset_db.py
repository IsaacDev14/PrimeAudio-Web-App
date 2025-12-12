import asyncio
from database import engine, Base
from sqlalchemy import text

async def reset_database():
    print("Dropping all tables...")
    async with engine.begin() as conn:
        # Reflect all tables to ensure we drop everything
        await conn.run_sync(Base.metadata.reflect)
        await conn.run_sync(Base.metadata.drop_all)
        print("Tables dropped.")

if __name__ == "__main__":
    asyncio.run(reset_database())
