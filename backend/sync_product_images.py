"""
Download product images to frontend/public/images/products/ and update Neon + products.json.
Uses Wikimedia + Unsplash sources from product_images.py; optional AI-generated PNGs override.
"""
import asyncio
import json
import shutil
import time
from pathlib import Path

import httpx
from sqlalchemy import select

from database import AsyncSessionLocal
import models
from product_images import PRODUCT_IMAGE_SOURCES, local_path, slugify, local_urls_for_product

ROOT = Path(__file__).resolve().parent.parent
PUBLIC_DIR = ROOT / "frontend" / "public" / "images" / "products"
PRODUCTS_JSON = Path(__file__).resolve().parent / "cache_data" / "products.json"

HEADERS = {"User-Agent": "PrimeAudio-Web-App/1.0 (portfolio; image sync)"}


def resolve_generated_png(name: str) -> Path | None:
    """AI-generated PNG in public folder takes priority over remote download."""
    slug = slugify(name)
    png = PUBLIC_DIR / f"{slug}.png"
    if png.exists():
        return png
    return None


async def download_url(client: httpx.AsyncClient, url: str, dest: Path) -> bool:
    try:
        if "wikimedia.org" in url:
            await asyncio.sleep(0.35)
        r = await client.get(url, headers=HEADERS, follow_redirects=True, timeout=60)
        r.raise_for_status()
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(r.content)
        return True
    except Exception as e:
        print(f"  FAIL download {url[:80]}... -> {e}")
        return False


async def sync_files():
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    ok, fail = 0, 0

    async with httpx.AsyncClient() as client:
        for name, cfg in PRODUCT_IMAGE_SOURCES.items():
            slug = slugify(name)
            generated = resolve_generated_png(name)
            remotes = cfg.get("remote", [])

            if generated and not remotes:
                dest = PUBLIC_DIR / f"{slug}.jpg"
                shutil.copy(generated, dest)
                print(f"  GEN {dest.name}")
                ok += 1
                continue

            for i, url in enumerate(remotes):
                dest = PUBLIC_DIR / (f"{slug}.jpg" if i == 0 else f"{slug}-{i + 1}.jpg")

                if i == 0 and generated:
                    shutil.copy(generated, dest)
                    print(f"  GEN {dest.name}")
                    ok += 1
                    continue

                if dest.exists() and dest.stat().st_size > 5000:
                    ok += 1
                    continue

                if await download_url(client, url, dest):
                    print(f"  OK  {dest.name}")
                    ok += 1
                else:
                    fail += 1

    return ok, fail


async def update_database():
    updated = 0
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(models.Product).order_by(models.Product.id))
        for product in result.scalars().all():
            mapping = local_urls_for_product(product.name)
            if not mapping["image_url"]:
                continue
            primary = PUBLIC_DIR / f"{slugify(product.name)}.jpg"
            if not primary.exists():
                png = PUBLIC_DIR / f"{slugify(product.name)}.png"
                if png.exists():
                    mapping["image_url"] = f"/images/products/{slugify(product.name)}.png"
                else:
                    print(f"  SKIP DB (no file): {product.name}")
                    continue
            product.image_url = mapping["image_url"]
            carousel = []
            for p in mapping["images"]:
                file_part = p.split("/")[-1]
                if (PUBLIC_DIR / file_part).exists():
                    carousel.append(p)
            product.images = carousel
            updated += 1
        await session.commit()
    return updated


def update_products_json():
    if not PRODUCTS_JSON.exists():
        return 0
    with open(PRODUCTS_JSON, encoding="utf-8") as f:
        products = json.load(f)
    updated = 0
    for p in products:
        name = p.get("name")
        mapping = local_urls_for_product(name)
        primary_file = PUBLIC_DIR / f"{slugify(name)}.jpg"
        if not primary_file.exists():
            png = PUBLIC_DIR / f"{slugify(name)}.png"
            if png.exists():
                p["image_url"] = f"/images/products/{slugify(name)}.png"
            else:
                continue
        else:
            p["image_url"] = mapping["image_url"]
        carousel = [u for u in mapping["images"] if (PUBLIC_DIR / u.split("/")[-1]).exists()]
        p["images"] = carousel
        updated += 1
    with open(PRODUCTS_JSON, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=4, ensure_ascii=False)
        f.write("\n")
    return updated


async def main():
    print(f"Syncing product images -> {PUBLIC_DIR}\n")
    ok, fail = await sync_files()
    print(f"\nDownloads: {ok} ok, {fail} failed\n")

    db_n = await update_database()
    json_n = update_products_json()
    print(f"Database updated: {db_n} products")
    print(f"products.json updated: {json_n} products")
    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
