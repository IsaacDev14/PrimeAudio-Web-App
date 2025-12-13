from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, select
from sqlalchemy.sql import desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

import database
import models
from app.routers.auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["Reviews"])


class ReviewCreate(BaseModel):
    product_id: int
    rating: int  # 1-5
    title: Optional[str] = None
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    rating: int
    title: Optional[str]
    comment: Optional[str]
    is_approved: bool
    is_verified_purchase: bool
    helpful_votes: int
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("/product/{product_id}")
async def get_product_reviews(
    product_id: int,
    db: AsyncSession = Depends(database.get_db)
):
    """Get all approved reviews for a product"""
    try:
        result = await db.execute(
            select(models.Review).where(
                and_(
                    models.Review.product_id == product_id,
                    models.Review.is_approved == True
                )
            ).order_by(desc(models.Review.created_at))
        )
        reviews = result.scalars().all()
        
        response = []
        for review in reviews:
            user_result = await db.execute(
                select(models.User).where(models.User.id == review.user_id)
            )
            user = user_result.scalars().first()
            
            response.append({
                "id": review.id,
                "product_id": review.product_id,
                "user_id": review.user_id,
                "rating": review.rating,
                "title": review.title,
                "comment": review.comment,
                "is_approved": review.is_approved,
                "is_verified_purchase": review.is_verified_purchase,
                "helpful_votes": review.helpful_votes or 0,
                "created_at": review.created_at.isoformat() if review.created_at else None,
                "user_name": user.full_name or user.email.split('@')[0] if user else "Anonymous"
            })
        
        return response
    except Exception as e:
        print(f"Error fetching reviews: {e}")
        return []


@router.post("/")
async def create_review(
    review_data: ReviewCreate,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new review for a product"""
    # Validate rating
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Check if product exists
    result = await db.execute(
        select(models.Product).where(models.Product.id == review_data.product_id)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if user already reviewed this product
    existing_result = await db.execute(
        select(models.Review).where(
            and_(
                models.Review.product_id == review_data.product_id,
                models.Review.user_id == current_user.id
            )
        )
    )
    existing = existing_result.scalars().first()
    
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")
    
    # Check if user has purchased this product (verified purchase)
    is_verified = False
    orders_result = await db.execute(
        select(models.Order).where(
            and_(
                models.Order.user_id == current_user.id,
                models.Order.status == "delivered"
            )
        )
    )
    user_orders = orders_result.scalars().all()
    
    for order in user_orders:
        # Fetch order items
        items_result = await db.execute(
            select(models.OrderItem).where(models.OrderItem.order_id == order.id)
        )
        items = items_result.scalars().all()
        for item in items:
            if item.product_id == review_data.product_id:
                is_verified = True
                break
    
    # Create review
    review = models.Review(
        product_id=review_data.product_id,
        user_id=current_user.id,
        rating=review_data.rating,
        title=review_data.title,
        comment=review_data.comment,
        is_verified_purchase=is_verified,
        is_approved=False  # Requires admin approval
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    
    return {"message": "Review submitted for approval", "id": review.id}


@router.get("/pending")
async def get_pending_reviews(
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all pending reviews (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.execute(
        select(models.Review).where(
            models.Review.is_approved == False
        ).order_by(desc(models.Review.created_at))
    )
    reviews = result.scalars().all()
    
    response = []
    for review in reviews:
        user_result = await db.execute(
            select(models.User).where(models.User.id == review.user_id)
        )
        user = user_result.scalars().first()
        
        response.append({
            "id": review.id,
            "product_id": review.product_id,
            "user_id": review.user_id,
            "rating": review.rating,
            "title": review.title,
            "comment": review.comment,
            "is_approved": review.is_approved,
            "is_verified_purchase": review.is_verified_purchase,
            "helpful_votes": review.helpful_votes,
            "created_at": review.created_at,
            "user_name": user.full_name or user.email.split('@')[0] if user else "Anonymous"
        })
    
    return response


@router.put("/{review_id}/approve")
async def approve_review(
    review_id: int,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Approve a review (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.execute(
        select(models.Review).where(models.Review.id == review_id)
    )
    review = result.scalars().first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.is_approved = True
    await db.commit()
    
    # Update product rating
    await update_product_rating(db, review.product_id)
    
    return {"message": "Review approved"}


@router.delete("/{review_id}")
async def delete_review(
    review_id: int,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete a review (admin only, or own review)"""
    result = await db.execute(
        select(models.Review).where(models.Review.id == review_id)
    )
    review = result.scalars().first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if not current_user.is_admin and review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    product_id = review.product_id
    await db.delete(review)
    await db.commit()
    
    # Update product rating
    await update_product_rating(db, product_id)
    
    return {"message": "Review deleted"}


@router.post("/{review_id}/helpful")
async def mark_helpful(
    review_id: int,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Mark a review as helpful"""
    result = await db.execute(
        select(models.Review).where(models.Review.id == review_id)
    )
    review = result.scalars().first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.helpful_votes = (review.helpful_votes or 0) + 1
    await db.commit()
    
    return {"message": "Marked as helpful", "votes": review.helpful_votes}


async def update_product_rating(db: AsyncSession, product_id: int):
    """Update product average rating based on approved reviews"""
    result = await db.execute(
        select(models.Review).where(
            and_(
                models.Review.product_id == product_id,
                models.Review.is_approved == True
            )
        )
    )
    reviews = result.scalars().all()
    
    if reviews:
        avg_rating = sum(r.rating for r in reviews) / len(reviews)
        
        product_result = await db.execute(
            select(models.Product).where(models.Product.id == product_id)
        )
        product = product_result.scalars().first()
        if product:
            product.rating = round(avg_rating, 1)
            product.review_count = len(reviews)
            await db.commit()
