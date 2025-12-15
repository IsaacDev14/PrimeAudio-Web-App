"""
Orders Router - Firebase Firestore Version
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import Optional
from datetime import datetime
import uuid
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from firebase_db import get_firestore_client
from app.routers.auth_firebase import get_current_user, get_admin_user

router = APIRouter(prefix="/orders", tags=["Orders"])

def get_db():
    return get_firestore_client()

@router.get("/")
async def get_orders(
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get orders - admins see all, customers see their own"""
    db = get_db()
    
    if current_user.get('is_admin'):
        query = db.collection('orders')
    else:
        query = db.collection('orders').where('user_id', '==', current_user['id'])
    
    docs = query.stream()
    orders = []
    
    for doc in docs:
        order = doc.to_dict()
        order['id'] = doc.id
        
        # Apply status filter
        if status_filter and order.get('status') != status_filter:
            continue
            
        orders.append(order)
    
    # Sort by created_at descending
    orders.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return orders

@router.get("/stats")
async def get_order_stats(current_user: dict = Depends(get_admin_user)):
    """Get order statistics (admin only)"""
    db = get_db()
    docs = db.collection('orders').stream()
    
    stats = {
        "total_orders": 0,
        "pending": 0,
        "approved": 0,
        "processing": 0,
        "shipped": 0,
        "delivered": 0,
        "cancelled": 0,
        "total_revenue": 0
    }
    
    for doc in docs:
        order = doc.to_dict()
        stats["total_orders"] += 1
        status_lower = order.get('status', '').lower()
        
        if status_lower in stats:
            stats[status_lower] += 1
        
        if status_lower not in ['cancelled', 'pending']:
            stats["total_revenue"] += order.get('total_amount', 0)
    
    return stats

@router.get("/{order_id}")
async def get_order(order_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific order"""
    db = get_db()
    doc = db.collection('orders').document(order_id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = doc.to_dict()
    order['id'] = doc.id
    
    # Check permission
    if not current_user.get('is_admin') and order.get('user_id') != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return order

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_order(order_data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new order"""
    db = get_db()
    
    doc_ref = db.collection('orders').document()
    order = {
        "id": doc_ref.id,
        "user_id": current_user['id'],
        "user_email": current_user.get('email'),
        "user_name": current_user.get('full_name'),
        "status": "pending",
        "total_amount": order_data.get('total_amount', 0),
        "items": order_data.get('items', []),
        "shipping_address": order_data.get('shipping_address', ''),
        "payment_method": order_data.get('payment_method', 'mpesa'),
        "tracking_id": None,
        "created_at": datetime.utcnow().isoformat()
    }
    
    doc_ref.set(order)
    return order

@router.put("/{order_id}/status")
async def update_order_status(
    order_id: str, 
    status_data: dict,
    current_user: dict = Depends(get_admin_user)
):
    """Update order status (admin only)"""
    db = get_db()
    doc_ref = db.collection('orders').document(order_id)
    
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Order not found")
    
    new_status = status_data.get('status')
    update_data = {"status": new_status}
    
    # Add tracking ID if approved
    if new_status in ['approved', 'Processing', 'Shipped']:
        update_data["tracking_id"] = f"PA-{uuid.uuid4().hex[:8].upper()}"
        update_data["approved_at"] = datetime.utcnow().isoformat()
    
    doc_ref.update(update_data)
    
    updated = doc_ref.get().to_dict()
    updated['id'] = doc_ref.id
    return updated

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(order_id: str, current_user: dict = Depends(get_admin_user)):
    """Delete an order (admin only)"""
    db = get_db()
    doc_ref = db.collection('orders').document(order_id)
    
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Order not found")
    
    doc_ref.delete()
    return None

@router.get("/track/{tracking_id}")
async def track_order(tracking_id: str):
    """Track order by tracking ID (public)"""
    db = get_db()
    query = db.collection('orders').where('tracking_id', '==', tracking_id).limit(1)
    docs = list(query.stream())
    
    if not docs:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = docs[0].to_dict()
    order['id'] = docs[0].id
    
    # Return limited info for public tracking
    return {
        "tracking_id": order.get('tracking_id'),
        "status": order.get('status'),
        "created_at": order.get('created_at'),
        "approved_at": order.get('approved_at'),
        "items_count": len(order.get('items', []))
    }
