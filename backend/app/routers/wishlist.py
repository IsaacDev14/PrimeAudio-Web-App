from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, select
from typing import List
from pydantic import BaseModel
from datetime import datetime

import database
import models
from app.routers.auth import get_current_user

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


class WishlistItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_price: float
    product_image: str | None
    product_stock: int
    created_at: datetime

    class Config:
        from_attributes = True


class WishlistAdd(BaseModel):
    product_id: int


@router.get("/")
async def get_wishlist(
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get user's wishlist with product details"""
    try:
        result = await db.execute(
            select(models.WishlistItem).where(
                models.WishlistItem.user_id == current_user.id
            ).order_by(models.WishlistItem.created_at.desc())
        )
        wishlist_items = result.scalars().all()
        
        response = []
        for item in wishlist_items:
            product_result = await db.execute(
                select(models.Product).where(models.Product.id == item.product_id)
            )
            product = product_result.scalars().first()
            if product:
                response.append({
                    "id": item.id,
                    "product_id": product.id,
                    "product_name": product.name,
                    "product_price": product.price,
                    "product_image": product.image_url,
                    "product_stock": product.stock,
                    "created_at": item.created_at.isoformat() if item.created_at else None
                })
        
        return response
    except Exception as e:
        print(f"Error fetching wishlist: {e}")
        return []


@router.post("/")
async def add_to_wishlist(
    item: WishlistAdd,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Add a product to wishlist"""
    # Check if product exists
    result = await db.execute(
        select(models.Product).where(models.Product.id == item.product_id)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if already in wishlist
    existing_result = await db.execute(
        select(models.WishlistItem).where(
            and_(
                models.WishlistItem.user_id == current_user.id,
                models.WishlistItem.product_id == item.product_id
            )
        )
    )
    existing = existing_result.scalars().first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Product already in wishlist")
    
    wishlist_item = models.WishlistItem(
        user_id=current_user.id,
        product_id=item.product_id
    )
    db.add(wishlist_item)
    await db.commit()
    await db.refresh(wishlist_item)
    
    return {"message": "Added to wishlist", "id": wishlist_item.id}


@router.delete("/{product_id}")
async def remove_from_wishlist(
    product_id: int,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Remove a product from wishlist"""
    result = await db.execute(
        select(models.WishlistItem).where(
            and_(
                models.WishlistItem.user_id == current_user.id,
                models.WishlistItem.product_id == product_id
            )
        )
    )
    wishlist_item = result.scalars().first()
    
    if not wishlist_item:
        raise HTTPException(status_code=404, detail="Item not in wishlist")
    
    await db.delete(wishlist_item)
    await db.commit()
    
    return {"message": "Removed from wishlist"}


@router.get("/check/{product_id}")
async def check_wishlist(
    product_id: int,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Check if a product is in user's wishlist"""
    result = await db.execute(
        select(models.WishlistItem).where(
            and_(
                models.WishlistItem.user_id == current_user.id,
                models.WishlistItem.product_id == product_id
            )
        )
    )
    exists = result.scalars().first() is not None
    
    return {"in_wishlist": exists}


@router.delete("/")
async def clear_wishlist(
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Clear all items from wishlist"""
    result = await db.execute(
        select(models.WishlistItem).where(
            models.WishlistItem.user_id == current_user.id
        )
    )
    items = result.scalars().all()
    for item in items:
        await db.delete(item)
    await db.commit()
    
    return {"message": "Wishlist cleared"}
