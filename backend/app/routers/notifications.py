from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from datetime import datetime
import sys
import os

# Ensure we can import from parent directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from firebase_db import get_firestore_client
from app.routers.auth_firebase import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

def get_db():
    return get_firestore_client()

@router.get("/")
async def get_notifications(
    unread_only: bool = False,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get user's notifications"""
    db = get_db()
    
    # Base query: notifications for this user
    query = db.collection('notifications').where('user_id', '==', current_user['id'])
    
    if unread_only:
        query = query.where('is_read', '==', False)
        
    # Firestore requires composite index for 'where' + 'order_by' on different fields
    # For simplicity/stablity without index creation, we'll fetch then sort in memory for now
    # or just sort by created_at if we can. 
    # Let's try to just get them and sort in memory to avoid "FAILED_PRECONDITION" index errors
    
    docs = query.stream()
    notifications = []
    for doc in docs:
        n = doc.to_dict()
        n['id'] = doc.id
        notifications.append(n)
        
    # Sort in memory (newest first)
    notifications.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    return notifications[:limit]

@router.get("/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get count of unread notifications"""
    db = get_db()
    query = db.collection('notifications')\
        .where('user_id', '==', current_user['id'])\
        .where('is_read', '==', False)
        
    # Counting in Firestore can be done by counting the stream (costly for huge sets used often, but fine here)
    # or using the count() aggregation query (if supported by this lib version).
    # We'll stick to stream len for compatibility.
    
    docs = list(query.stream())
    return {"count": len(docs)}

@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Mark a notification as read"""
    db = get_db()
    doc_ref = db.collection('notifications').document(notification_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    data = doc.to_dict()
    if data.get('user_id') != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    doc_ref.update({"is_read": True})
    return {"message": "Marked as read"}

@router.put("/read-all")
async def mark_all_as_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read"""
    db = get_db()
    batch = db.batch()
    
    query = db.collection('notifications')\
        .where('user_id', '==', current_user['id'])\
        .where('is_read', '==', False)
        
    docs = list(query.stream())
    
    if not docs:
        return {"message": "No unread notifications"}
        
    for doc in docs:
        batch.update(doc.reference, {"is_read": True})
        
    batch.commit()
    return {"message": "All marked as read"}

# Endpoint to create a test notification (for debugging)
@router.post("/test")
async def create_test_notification(current_user: dict = Depends(get_current_user)):
    """Create a sample notification for testing"""
    db = get_db()
    doc_ref = db.collection('notifications').document()
    
    notification = {
        "id": doc_ref.id,
        "user_id": current_user['id'],
        "title": "Welcome User (Test)",
        "message": f"This is a test notification created at {datetime.now().strftime('%H:%M:%S')}",
        "type": "info",
        "is_read": False,
        "created_at": datetime.utcnow().isoformat(),
        "link": "/profile"
    }
    
    doc_ref.set(notification)
    return notification
