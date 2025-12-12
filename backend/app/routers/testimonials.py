from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List
import models, database
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/testimonials", tags=["Testimonials"])

class TestimonialResponse(BaseModel):
    id: int
    customer_name: str
    content: str
    rating: int
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[TestimonialResponse])
async def get_testimonials(
    limit: int = 10,
    verified_only: bool = False,
    db: AsyncSession = Depends(database.get_db)
):
    """Get testimonials for display"""
    query = select(models.Testimonial)
    
    if verified_only:
        query = query.where(models.Testimonial.is_verified == True)
    
    query = query.order_by(func.random()).limit(limit)
    
    result = await db.execute(query)
    testimonials = result.scalars().all()
    return testimonials
