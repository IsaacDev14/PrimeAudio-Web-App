from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional
import models, schemas, database
from app.routers.auth import get_current_user
import shutil
import os
import uuid

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/", response_model=List[schemas.ProductResponse])
async def get_products(
    skip: int = 0, 
    limit: int = 100, 
    category: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    condition: Optional[str] = None,
    db: AsyncSession = Depends(database.get_db)
):
    """Get products with optional filtering"""
    query = select(models.Product)
    
    if category:
        query = query.where(models.Product.category == category)
    if brand:
        query = query.where(models.Product.brand == brand)
    if min_price is not None:
        query = query.where(models.Product.price >= min_price)
    if max_price is not None:
        query = query.where(models.Product.price <= max_price)
    if condition:
        query = query.where(models.Product.condition == condition)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    products = result.scalars().all()
    return products

@router.get("/featured", response_model=List[schemas.ProductResponse])
async def get_featured_products(limit: int = 12, db: AsyncSession = Depends(database.get_db)):
    """Get featured products for homepage"""
    result = await db.execute(
        select(models.Product)
        .where(models.Product.is_featured == True)
        .order_by(func.random())
        .limit(limit)
    )
    products = result.scalars().all()
    return products

@router.get("/categories")
async def get_categories(db: AsyncSession = Depends(database.get_db)):
    """Get all product categories with counts"""
    result = await db.execute(
        select(models.Product.category, func.count(models.Product.id))
        .group_by(models.Product.category)
    )
    categories = result.all()
    return [{"name": cat, "count": count} for cat, count in categories if cat]

@router.get("/brands")
async def get_brands(db: AsyncSession = Depends(database.get_db)):
    """Get all product brands with counts"""
    result = await db.execute(
        select(models.Product.brand, func.count(models.Product.id))
        .group_by(models.Product.brand)
    )
    brands = result.all()
    return [{"name": brand, "count": count} for brand, count in brands if brand]

@router.get("/{product_id}", response_model=schemas.ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.Product).where(models.Product.id == product_id))
    product = result.scalars().first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(product: schemas.ProductCreate, current_user: models.User = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    new_product = models.Product(**product.dict())
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return new_product

@router.put("/{product_id}", response_model=schemas.ProductResponse)
async def update_product(product_id: int, product_update: schemas.ProductCreate, current_user: models.User = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(select(models.Product).where(models.Product.id == product_id))
    product = result.scalars().first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_update.dict().items():
        setattr(product, key, value)
    
    await db.commit()
    await db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, current_user: models.User = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(select(models.Product).where(models.Product.id == product_id))
    product = result.scalars().first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.delete(product)
    await db.commit()
    return None

@router.post("/upload", response_model=dict)
async def upload_image(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    file_extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"uploads/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"http://localhost:8000/static/{filename}"}
