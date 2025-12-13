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

router = APIRouter(prefix="/addresses", tags=["Addresses"])


class AddressCreate(BaseModel):
    label: str = "Home"
    full_name: str
    phone: str
    address_line: str
    city: str = "Nairobi"
    county: Optional[str] = None
    is_default: bool = False


class AddressUpdate(BaseModel):
    label: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address_line: Optional[str] = None
    city: Optional[str] = None
    county: Optional[str] = None
    is_default: Optional[bool] = None


@router.get("/")
async def get_addresses(
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all addresses for current user"""
    try:
        result = await db.execute(
            select(models.UserAddress).where(
                models.UserAddress.user_id == current_user.id
            ).order_by(desc(models.UserAddress.is_default), desc(models.UserAddress.created_at))
        )
        addresses = result.scalars().all()
        
        return [{
            "id": a.id,
            "label": a.label,
            "full_name": a.full_name,
            "phone": a.phone,
            "address_line": a.address_line,
            "city": a.city,
            "county": a.county,
            "is_default": a.is_default,
            "created_at": a.created_at.isoformat() if a.created_at else None
        } for a in addresses]
    except Exception as e:
        print(f"Error fetching addresses: {e}")
        return []


@router.post("/")
async def create_address(
    address: AddressCreate,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new address for current user"""
    # Check existing count
    result = await db.execute(
        select(models.UserAddress).where(
            models.UserAddress.user_id == current_user.id
        )
    )
    existing = result.scalars().all()
    
    is_default = address.is_default
    if len(existing) == 0:
        is_default = True
    elif address.is_default:
        # Unset other defaults
        for a in existing:
            if a.is_default:
                a.is_default = False
    
    db_address = models.UserAddress(
        user_id=current_user.id,
        label=address.label,
        full_name=address.full_name,
        phone=address.phone,
        address_line=address.address_line,
        city=address.city,
        county=address.county,
        is_default=is_default
    )
    db.add(db_address)
    await db.commit()
    await db.refresh(db_address)
    
    return {
        "id": db_address.id,
        "label": db_address.label,
        "full_name": db_address.full_name,
        "phone": db_address.phone,
        "address_line": db_address.address_line,
        "city": db_address.city,
        "county": db_address.county,
        "is_default": db_address.is_default,
        "created_at": db_address.created_at.isoformat() if db_address.created_at else None
    }


@router.put("/{address_id}")
async def update_address(
    address_id: int,
    address: AddressUpdate,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update an address"""
    result = await db.execute(
        select(models.UserAddress).where(
            and_(
                models.UserAddress.id == address_id,
                models.UserAddress.user_id == current_user.id
            )
        )
    )
    db_address = result.scalars().first()
    
    if not db_address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    update_data = address.model_dump(exclude_unset=True)
    
    # Handle default address change
    if update_data.get("is_default"):
        all_result = await db.execute(
            select(models.UserAddress).where(
                and_(
                    models.UserAddress.user_id == current_user.id,
                    models.UserAddress.is_default == True
                )
            )
        )
        for a in all_result.scalars().all():
            a.is_default = False
    
    for key, value in update_data.items():
        setattr(db_address, key, value)
    
    await db.commit()
    await db.refresh(db_address)
    
    return {
        "id": db_address.id,
        "label": db_address.label,
        "full_name": db_address.full_name,
        "phone": db_address.phone,
        "address_line": db_address.address_line,
        "city": db_address.city,
        "county": db_address.county,
        "is_default": db_address.is_default,
        "created_at": db_address.created_at.isoformat() if db_address.created_at else None
    }


@router.delete("/{address_id}")
async def delete_address(
    address_id: int,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete an address"""
    result = await db.execute(
        select(models.UserAddress).where(
            and_(
                models.UserAddress.id == address_id,
                models.UserAddress.user_id == current_user.id
            )
        )
    )
    db_address = result.scalars().first()
    
    if not db_address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    was_default = db_address.is_default
    await db.delete(db_address)
    await db.commit()
    
    # If deleted address was default, set another as default
    if was_default:
        next_result = await db.execute(
            select(models.UserAddress).where(
                models.UserAddress.user_id == current_user.id
            ).limit(1)
        )
        next_address = next_result.scalars().first()
        if next_address:
            next_address.is_default = True
            await db.commit()
    
    return {"message": "Address deleted successfully"}


@router.post("/{address_id}/set-default")
async def set_default_address(
    address_id: int,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Set an address as default"""
    result = await db.execute(
        select(models.UserAddress).where(
            and_(
                models.UserAddress.id == address_id,
                models.UserAddress.user_id == current_user.id
            )
        )
    )
    db_address = result.scalars().first()
    
    if not db_address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    # Unset other defaults
    all_result = await db.execute(
        select(models.UserAddress).where(
            and_(
                models.UserAddress.user_id == current_user.id,
                models.UserAddress.is_default == True
            )
        )
    )
    for a in all_result.scalars().all():
        a.is_default = False
    
    db_address.is_default = True
    await db.commit()
    await db.refresh(db_address)
    
    return {
        "id": db_address.id,
        "label": db_address.label,
        "full_name": db_address.full_name,
        "phone": db_address.phone,
        "address_line": db_address.address_line,
        "city": db_address.city,
        "county": db_address.county,
        "is_default": db_address.is_default,
        "created_at": db_address.created_at.isoformat() if db_address.created_at else None
    }
