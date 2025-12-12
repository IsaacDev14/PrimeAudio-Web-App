from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from pydantic import BaseModel
import models, database
from app.routers.auth import get_current_user
import shutil
import uuid

router = APIRouter(prefix="/content", tags=["Content"])

# Schemas (Internal for now)
class ContentItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str # Project, Service, Media, Blog
    type: Optional[str] = None # Sub-category
    status: str = "Live"
    image_url: Optional[str] = None
    external_link: Optional[str] = None
    order: int = 0
    date: Optional[str] = None

class ContentItemCreate(ContentItemBase):
    pass

class ContentItemResponse(ContentItemBase):
    id: int
    class Config:
        orm_mode = True

@router.get("/", response_model=List[ContentItemResponse])
async def get_content(category: Optional[str] = None, db: AsyncSession = Depends(database.get_db)):
    query = select(models.ContentItem)
    if category:
        query = query.where(models.ContentItem.category == category)
    query = query.order_by(models.ContentItem.order, models.ContentItem.date.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=ContentItemResponse, status_code=status.HTTP_201_CREATED)
async def create_content(item: ContentItemCreate, current_user: models.User = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    new_item = models.ContentItem(**item.dict())
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return new_item

@router.put("/{item_id}", response_model=ContentItemResponse)
async def update_content(item_id: int, item_update: ContentItemCreate, current_user: models.User = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(select(models.ContentItem).where(models.ContentItem.id == item_id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    for key, value in item_update.dict().items():
        setattr(item, key, value)
    
    await db.commit()
    await db.refresh(item)
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content(item_id: int, current_user: models.User = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(select(models.ContentItem).where(models.ContentItem.id == item_id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    await db.delete(item)
    await db.commit()
