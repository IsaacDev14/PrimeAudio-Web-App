from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
import sys
import os

# Ensure we can import from parent directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from firebase_db import get_firestore_client
from app.routers.auth_firebase import get_admin_user

router = APIRouter(prefix="/activity-logs", tags=["Activity Logs"])

def get_db():
    return get_firestore_client()

@router.get("/")
async def get_activity_logs(
    limit: int = 50,
    current_user: dict = Depends(get_admin_user)
):
    """Get system activity logs (Admin only)"""
    db = get_db()
    
    # Query logs, sorted by timestamp desc
    query = db.collection('activity_logs').order_by('created_at', direction='DESCENDING').limit(limit)
    
    docs = query.stream()
    logs = []
    
    for doc in docs:
        log = doc.to_dict()
        log['id'] = doc.id
        logs.append(log)
    
    return logs
