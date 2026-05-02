import asyncio
import sys
from database import Base, engine, init_db
import models

async def main():
    print("Initializing tables on Postgres...")
    try:
        await init_db()
        print("Success: All tables initialized.")
    except Exception as e:
        print(f"Error initializing tables: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
