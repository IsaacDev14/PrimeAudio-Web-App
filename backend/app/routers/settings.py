from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import SiteSettings
from pydantic import BaseModel
from typing import Optional

router = APIRouter(
    prefix="/settings",
    tags=["settings"],
)

class SettingsBase(BaseModel):
    site_name: str
    site_description: Optional[str] = None
    contact_email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    maintenance_mode: bool = False
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    twitter_url: Optional[str] = None

class SettingsUpdate(SettingsBase):
    pass

class SettingsResponse(SettingsBase):
    id: int

    class Config:
        orm_mode = True

@router.get("/", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(SiteSettings).first()
    if not settings:
        # Create default settings if none exist
        settings = SiteSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("/", response_model=SettingsResponse)
def update_settings(settings_update: SettingsUpdate, db: Session = Depends(get_db)):
    settings = db.query(SiteSettings).first()
    if not settings:
        settings = SiteSettings()
        db.add(settings)
    
    for key, value in settings_update.dict().items():
        setattr(settings, key, value)
    
    db.commit()
    db.refresh(settings)
    return settings
