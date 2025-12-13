from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
import models, database
from app.routers.auth import get_current_user

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("/")
async def get_cart(
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(database.get_db)
):
    """Get all items in user's cart"""
    try:
        result = await db.execute(
            select(models.CartItem)
            .where(models.CartItem.user_id == current_user.id)
            .options(selectinload(models.CartItem.product))
        )
        cart_items = result.scalars().all()
        
        return [
            {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "product": {
                    "id": item.product.id,
                    "name": item.product.name,
                    "price": item.product.price,
                    "image_url": item.product.image_url,
                    "stock": item.product.stock
                } if item.product else None,
                "created_at": item.created_at.isoformat() if item.created_at else None
            }
            for item in cart_items
        ]
    except Exception as e:
        print(f"Error fetching cart: {e}")
        return []


@router.post("/")
async def add_to_cart(
    product_id: int,
    quantity: int = 1,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(database.get_db)
):
    """Add item to cart or update quantity if exists"""
    try:
        # Check if product exists
        result = await db.execute(
            select(models.Product).where(models.Product.id == product_id)
        )
        product = result.scalars().first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # Check stock
        if quantity > product.stock:
            raise HTTPException(status_code=400, detail=f"Only {product.stock} items in stock")
        
        # Check if already in cart
        result = await db.execute(
            select(models.CartItem).where(
                models.CartItem.user_id == current_user.id,
                models.CartItem.product_id == product_id
            )
        )
        existing_item = result.scalars().first()
        
        if existing_item:
            # Update quantity
            existing_item.quantity += quantity
            if existing_item.quantity > product.stock:
                existing_item.quantity = product.stock
            await db.commit()
            await db.refresh(existing_item)
            return {"message": "Cart updated", "item_id": existing_item.id, "quantity": existing_item.quantity}
        else:
            # Add new item
            cart_item = models.CartItem(
                user_id=current_user.id,
                product_id=product_id,
                quantity=quantity
            )
            db.add(cart_item)
            await db.commit()
            await db.refresh(cart_item)
            return {"message": "Added to cart", "item_id": cart_item.id, "quantity": cart_item.quantity}
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        print(f"Error adding to cart: {e}")
        raise HTTPException(status_code=500, detail="Error adding to cart")


@router.put("/{item_id}")
async def update_cart_item(
    item_id: int,
    quantity: int,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(database.get_db)
):
    """Update cart item quantity"""
    try:
        result = await db.execute(
            select(models.CartItem)
            .where(models.CartItem.id == item_id, models.CartItem.user_id == current_user.id)
            .options(selectinload(models.CartItem.product))
        )
        cart_item = result.scalars().first()
        
        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")
        
        if quantity <= 0:
            # Remove item if quantity is 0 or negative
            await db.delete(cart_item)
            await db.commit()
            return {"message": "Item removed from cart"}
        
        if quantity > cart_item.product.stock:
            raise HTTPException(status_code=400, detail=f"Only {cart_item.product.stock} items in stock")
        
        cart_item.quantity = quantity
        await db.commit()
        return {"message": "Cart updated", "quantity": cart_item.quantity}
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        print(f"Error updating cart: {e}")
        raise HTTPException(status_code=500, detail="Error updating cart")


@router.delete("/{item_id}")
async def remove_from_cart(
    item_id: int,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(database.get_db)
):
    """Remove item from cart"""
    try:
        result = await db.execute(
            select(models.CartItem).where(
                models.CartItem.id == item_id,
                models.CartItem.user_id == current_user.id
            )
        )
        cart_item = result.scalars().first()
        
        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")
        
        await db.delete(cart_item)
        await db.commit()
        return {"message": "Item removed from cart"}
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        print(f"Error removing from cart: {e}")
        raise HTTPException(status_code=500, detail="Error removing from cart")


@router.delete("/")
async def clear_cart(
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(database.get_db)
):
    """Clear all items from cart"""
    try:
        result = await db.execute(
            select(models.CartItem).where(models.CartItem.user_id == current_user.id)
        )
        cart_items = result.scalars().all()
        
        for item in cart_items:
            await db.delete(item)
        
        await db.commit()
        return {"message": "Cart cleared"}
    except Exception as e:
        await db.rollback()
        print(f"Error clearing cart: {e}")
        raise HTTPException(status_code=500, detail="Error clearing cart")


@router.post("/sync")
async def sync_cart(
    items: List[dict],
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(database.get_db)
):
    """Sync guest cart to user's cart (merge on login)"""
    try:
        for item in items:
            product_id = item.get("id") or item.get("product_id")
            quantity = item.get("quantity", 1)
            
            if not product_id:
                continue
            
            # Check if product exists
            result = await db.execute(
                select(models.Product).where(models.Product.id == product_id)
            )
            product = result.scalars().first()
            if not product:
                continue
            
            # Check if already in cart
            result = await db.execute(
                select(models.CartItem).where(
                    models.CartItem.user_id == current_user.id,
                    models.CartItem.product_id == product_id
                )
            )
            existing_item = result.scalars().first()
            
            if existing_item:
                # Update quantity (take max)
                existing_item.quantity = max(existing_item.quantity, quantity)
                if existing_item.quantity > product.stock:
                    existing_item.quantity = product.stock
            else:
                # Add new item
                cart_item = models.CartItem(
                    user_id=current_user.id,
                    product_id=product_id,
                    quantity=min(quantity, product.stock)
                )
                db.add(cart_item)
        
        await db.commit()
        
        # Return updated cart
        result = await db.execute(
            select(models.CartItem)
            .where(models.CartItem.user_id == current_user.id)
            .options(selectinload(models.CartItem.product))
        )
        cart_items = result.scalars().all()
        
        return [
            {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "product": {
                    "id": item.product.id,
                    "name": item.product.name,
                    "price": item.product.price,
                    "image_url": item.product.image_url,
                    "stock": item.product.stock
                } if item.product else None
            }
            for item in cart_items
        ]
    except Exception as e:
        await db.rollback()
        print(f"Error syncing cart: {e}")
        raise HTTPException(status_code=500, detail="Error syncing cart")
