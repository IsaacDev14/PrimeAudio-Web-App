from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone
from typing import List
import database
import models
import schemas
from app.routers.auth import get_current_user, get_admin_user

router = APIRouter(prefix="/offers", tags=["Promotional Offers"])


# ===== PUBLIC ENDPOINTS =====

@router.get("/active", response_model=List[schemas.OfferResponse])
async def get_active_offers(db: AsyncSession = Depends(database.get_db)):
    """Get all currently active offers (for public display)"""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(models.Offer)
        .options(selectinload(models.Offer.offer_products).selectinload(models.OfferProduct.product))
        .where(
            and_(
                models.Offer.is_active == True,
                models.Offer.start_date <= now,
                models.Offer.end_date >= now
            )
        )
        .order_by(models.Offer.created_at.desc())
    )
    offers = result.scalars().all()
    
    # Transform to response format with product details
    response = []
    for offer in offers:
        offer_dict = {
            "id": offer.id,
            "title": offer.title,
            "description": offer.description,
            "discount_percentage": offer.discount_percentage,
            "banner_color": offer.banner_color,
            "badge_text": offer.badge_text,
            "start_date": offer.start_date,
            "end_date": offer.end_date,
            "is_active": offer.is_active,
            "created_at": offer.created_at,
            "products": [
                {
                    "id": op.id,
                    "product_id": op.product_id,
                    "custom_discount": op.custom_discount,
                    "product_name": op.product.name if op.product else None,
                    "product_price": op.product.price if op.product else None,
                    "product_image": op.product.image_url if op.product else None
                }
                for op in offer.offer_products
            ]
        }
        response.append(offer_dict)
    
    return response


@router.get("/products-on-sale")
async def get_products_on_sale(db: AsyncSession = Depends(database.get_db)):
    """Get all products currently on sale with their discount info"""
    now = datetime.now(timezone.utc)
    
    # Get active offers with their products
    result = await db.execute(
        select(models.OfferProduct)
        .join(models.Offer)
        .options(selectinload(models.OfferProduct.product), selectinload(models.OfferProduct.offer))
        .where(
            and_(
                models.Offer.is_active == True,
                models.Offer.start_date <= now,
                models.Offer.end_date >= now
            )
        )
    )
    offer_products = result.scalars().all()
    
    products_on_sale = []
    for op in offer_products:
        if op.product:
            discount = op.custom_discount or op.offer.discount_percentage
            original_price = op.product.price
            sale_price = original_price * (1 - discount / 100)
            
            products_on_sale.append({
                "id": op.product.id,
                "name": op.product.name,
                "original_price": original_price,
                "sale_price": round(sale_price, 2),
                "discount_percentage": discount,
                "badge_text": op.offer.badge_text,
                "image_url": op.product.image_url,
                "category": op.product.category,
                "offer_title": op.offer.title,
                "offer_end_date": op.offer.end_date
            })
    
    return products_on_sale


# ===== ADMIN ENDPOINTS =====

@router.get("/", response_model=List[schemas.OfferResponse])
async def get_all_offers(
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Get all offers (admin only)"""
    result = await db.execute(
        select(models.Offer)
        .options(selectinload(models.Offer.offer_products).selectinload(models.OfferProduct.product))
        .order_by(models.Offer.created_at.desc())
    )
    offers = result.scalars().all()
    
    response = []
    for offer in offers:
        offer_dict = {
            "id": offer.id,
            "title": offer.title,
            "description": offer.description,
            "discount_percentage": offer.discount_percentage,
            "banner_color": offer.banner_color,
            "badge_text": offer.badge_text,
            "start_date": offer.start_date,
            "end_date": offer.end_date,
            "is_active": offer.is_active,
            "created_at": offer.created_at,
            "products": [
                {
                    "id": op.id,
                    "product_id": op.product_id,
                    "custom_discount": op.custom_discount,
                    "product_name": op.product.name if op.product else None,
                    "product_price": op.product.price if op.product else None,
                    "product_image": op.product.image_url if op.product else None
                }
                for op in offer.offer_products
            ]
        }
        response.append(offer_dict)
    
    return response


@router.post("/", response_model=schemas.OfferResponse)
async def create_offer(
    offer_data: schemas.OfferCreate,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Create a new promotional offer"""
    # Create offer
    offer = models.Offer(
        title=offer_data.title,
        description=offer_data.description,
        discount_percentage=offer_data.discount_percentage,
        banner_color=offer_data.banner_color,
        badge_text=offer_data.badge_text,
        start_date=offer_data.start_date,
        end_date=offer_data.end_date,
        is_active=offer_data.is_active
    )
    db.add(offer)
    await db.commit()
    await db.refresh(offer)
    
    # Add products to offer if provided
    if offer_data.product_ids:
        for product_id in offer_data.product_ids:
            offer_product = models.OfferProduct(
                offer_id=offer.id,
                product_id=product_id
            )
            db.add(offer_product)
        await db.commit()
    
    # Reload with products
    await db.refresh(offer)
    result = await db.execute(
        select(models.Offer)
        .options(selectinload(models.Offer.offer_products).selectinload(models.OfferProduct.product))
        .where(models.Offer.id == offer.id)
    )
    offer = result.scalar_one()
    
    return {
        "id": offer.id,
        "title": offer.title,
        "description": offer.description,
        "discount_percentage": offer.discount_percentage,
        "banner_color": offer.banner_color,
        "badge_text": offer.badge_text,
        "start_date": offer.start_date,
        "end_date": offer.end_date,
        "is_active": offer.is_active,
        "created_at": offer.created_at,
        "products": [
            {
                "id": op.id,
                "product_id": op.product_id,
                "custom_discount": op.custom_discount,
                "product_name": op.product.name if op.product else None,
                "product_price": op.product.price if op.product else None,
                "product_image": op.product.image_url if op.product else None
            }
            for op in offer.offer_products
        ]
    }


@router.put("/{offer_id}", response_model=schemas.OfferResponse)
async def update_offer(
    offer_id: int,
    offer_data: schemas.OfferUpdate,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Update an existing offer"""
    result = await db.execute(
        select(models.Offer)
        .options(selectinload(models.Offer.offer_products).selectinload(models.OfferProduct.product))
        .where(models.Offer.id == offer_id)
    )
    offer = result.scalar_one_or_none()
    
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    # Update fields
    update_data = offer_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(offer, field, value)
    
    await db.commit()
    await db.refresh(offer)
    
    return {
        "id": offer.id,
        "title": offer.title,
        "description": offer.description,
        "discount_percentage": offer.discount_percentage,
        "banner_color": offer.banner_color,
        "badge_text": offer.badge_text,
        "start_date": offer.start_date,
        "end_date": offer.end_date,
        "is_active": offer.is_active,
        "created_at": offer.created_at,
        "products": [
            {
                "id": op.id,
                "product_id": op.product_id,
                "custom_discount": op.custom_discount,
                "product_name": op.product.name if op.product else None,
                "product_price": op.product.price if op.product else None,
                "product_image": op.product.image_url if op.product else None
            }
            for op in offer.offer_products
        ]
    }


@router.delete("/{offer_id}")
async def delete_offer(
    offer_id: int,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Delete an offer"""
    result = await db.execute(select(models.Offer).where(models.Offer.id == offer_id))
    offer = result.scalar_one_or_none()
    
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    await db.delete(offer)
    await db.commit()
    
    return {"message": "Offer deleted successfully"}


@router.post("/{offer_id}/products")
async def add_products_to_offer(
    offer_id: int,
    product_ids: List[int],
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Add products to an existing offer"""
    result = await db.execute(select(models.Offer).where(models.Offer.id == offer_id))
    offer = result.scalar_one_or_none()
    
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    added = 0
    for product_id in product_ids:
        # Check if already exists
        existing = await db.execute(
            select(models.OfferProduct).where(
                and_(
                    models.OfferProduct.offer_id == offer_id,
                    models.OfferProduct.product_id == product_id
                )
            )
        )
        if not existing.scalar_one_or_none():
            offer_product = models.OfferProduct(
                offer_id=offer_id,
                product_id=product_id
            )
            db.add(offer_product)
            added += 1
    
    await db.commit()
    return {"message": f"Added {added} products to offer"}


@router.delete("/{offer_id}/products/{product_id}")
async def remove_product_from_offer(
    offer_id: int,
    product_id: int,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_admin_user)
):
    """Remove a product from an offer"""
    result = await db.execute(
        select(models.OfferProduct).where(
            and_(
                models.OfferProduct.offer_id == offer_id,
                models.OfferProduct.product_id == product_id
            )
        )
    )
    offer_product = result.scalar_one_or_none()
    
    if not offer_product:
        raise HTTPException(status_code=404, detail="Product not in offer")
    
    await db.delete(offer_product)
    await db.commit()
    
    return {"message": "Product removed from offer"}
