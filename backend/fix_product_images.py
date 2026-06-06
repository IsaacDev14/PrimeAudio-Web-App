"""
Audit and fix product images in Neon DB and cache_data/products.json.
Only updates image_url and images fields — no other product data is changed.
"""
import asyncio
import json
from pathlib import Path

from sqlalchemy import select

from database import AsyncSessionLocal
import models
from product_images import PRODUCT_IMAGES

PRODUCTS_JSON = Path("cache_data/products.json")


async def fix_database():
    updated = 0
    missing = []

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(models.Product).order_by(models.Product.id))
        products = result.scalars().all()

        for product in products:
            mapping = PRODUCT_IMAGES.get(product.name)
            if not mapping:
                missing.append(product.name)
                continue

            product.image_url = mapping["image_url"]
            product.images = mapping.get("images", [])
            updated += 1

        await session.commit()

    return updated, missing, len(products)


def fix_products_json():
    if not PRODUCTS_JSON.exists():
        return 0, []

    with open(PRODUCTS_JSON, encoding="utf-8") as f:
        products = json.load(f)

    updated = 0
    missing = []
    for p in products:
        mapping = PRODUCT_IMAGES.get(p.get("name"))
        if not mapping:
            missing.append(p.get("name"))
            continue
        p["image_url"] = mapping["image_url"]
        p["images"] = mapping.get("images", [])
        updated += 1

    with open(PRODUCTS_JSON, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=4, ensure_ascii=False)
        f.write("\n")

    return updated, missing


async def main():
    print("Fixing product images (image_url + images only)...\n")

    db_updated, db_missing, db_total = await fix_database()
    json_updated, json_missing = fix_products_json()

    print(f"Database: updated {db_updated}/{db_total} products")
    if db_missing:
        print(f"  No mapping for: {', '.join(db_missing)}")

    print(f"products.json: updated {json_updated} products")
    if json_missing:
        print(f"  No mapping for: {', '.join(json_missing)}")

    print("\nDone.")


if __name__ == "__main__":
    asyncio.run(main())
