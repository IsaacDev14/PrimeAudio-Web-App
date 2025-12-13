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

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/")
async def get_notifications(
    unread_only: bool = False,
    limit: int = 50,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get user's notifications"""
    try:
        query = select(models.Notification).where(
            models.Notification.user_id == current_user.id
        )
        
        if unread_only:
            query = query.where(models.Notification.is_read == False)
        
        query = query.order_by(desc(models.Notification.created_at)).limit(limit)
        result = await db.execute(query)
        notifications = result.scalars().all()
        
        return [{
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "is_read": n.is_read,
            "link": n.link,
            "created_at": n.created_at.isoformat() if n.created_at else None
        } for n in notifications]
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return []


@router.get("/unread-count")
async def get_unread_count(
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get count of unread notifications"""
    try:
        result = await db.execute(
            select(models.Notification).where(
                and_(
                    models.Notification.user_id == current_user.id,
                    models.Notification.is_read == False
                )
            )
        )
        notifications = result.scalars().all()
        return {"count": len(notifications)}
    except Exception as e:
        print(f"Error counting notifications: {e}")
        return {"count": 0}


@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: int,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Mark a notification as read"""
    result = await db.execute(
        select(models.Notification).where(
            and_(
                models.Notification.id == notification_id,
                models.Notification.user_id == current_user.id
            )
        )
    )
    notification = result.scalars().first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    await db.commit()
    
    return {"message": "Marked as read"}


@router.put("/read-all")
async def mark_all_as_read(
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Mark all notifications as read"""
    result = await db.execute(
        select(models.Notification).where(
            and_(
                models.Notification.user_id == current_user.id,
                models.Notification.is_read == False
            )
        )
    )
    notifications = result.scalars().all()
    for n in notifications:
        n.is_read = True
    await db.commit()
    
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete a notification"""
    result = await db.execute(
        select(models.Notification).where(
            and_(
                models.Notification.id == notification_id,
                models.Notification.user_id == current_user.id
            )
        )
    )
    notification = result.scalars().first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    await db.delete(notification)
    await db.commit()
    
    return {"message": "Notification deleted"}


@router.delete("/")
async def clear_notifications(
    db: AsyncSession = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Clear all notifications"""
    result = await db.execute(
        select(models.Notification).where(
            models.Notification.user_id == current_user.id
        )
    )
    notifications = result.scalars().all()
    for n in notifications:
        await db.delete(n)
    await db.commit()
    
    return {"message": "All notifications cleared"}
