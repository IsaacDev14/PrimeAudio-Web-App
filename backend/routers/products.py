from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import models, schemas, database
from routers.auth import get_current_user

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/", response_model=List[schemas.ProductResponse])
async def get_products(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.Product).offset(skip).limit(limit))
    products = result.scalars().all()
    return products

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
