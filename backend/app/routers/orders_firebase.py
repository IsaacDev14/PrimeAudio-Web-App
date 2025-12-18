"""
Orders Router - Firebase Firestore Version
"""
from fastapi import APIRouter, HTTPException, status, Depends, Body
from typing import Optional
from datetime import datetime, timedelta, timezone
import uuid
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from firebase_db import get_firestore_client
from app.routers.auth_firebase import get_current_user, get_admin_user

router = APIRouter(prefix="/orders", tags=["Orders"])

# Helper for Kenya Time (UTC+3)
def get_kenya_time():
    kenya_tz = timezone(timedelta(hours=3))
    return datetime.now(kenya_tz).isoformat()

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

@router.get("/user")
async def get_user_orders(current_user: dict = Depends(get_current_user)):
    """Get orders for the current user (explicit endpoint)"""
    return await get_orders(status_filter=None, current_user=current_user)

@router.get("/stats")
async def get_order_stats(
    period: str = 'all',
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_admin_user)
):
    """Get order statistics (admin only) with date filtering"""
    db = get_db()
    
    # Calculate Date Range
    now = datetime.now(timezone(timedelta(hours=3))) # Kenya Time
    filter_start = None
    filter_end = None
    
    if period == 'day':
        filter_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        filter_end = now.replace(hour=23, minute=59, second=59, microsecond=999999)
    elif period == 'week':
        # Start of week (Monday)
        start_of_week = now - timedelta(days=now.weekday())
        filter_start = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        filter_end = now
    elif period == 'month':
        filter_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        filter_end = now
    elif period == 'year':
        filter_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        filter_end = now
    elif period == 'custom' and start_date and end_date:
        try:
            filter_start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            filter_end = datetime.fromisoformat(end_date.replace('Z', '+00:00')) + timedelta(days=1) - timedelta(microseconds=1)
        except ValueError:
            pass # Fallback to all time if invalid
            
    # Count Users (Global) - usually dashboards show total user base regardless of period
    users_ref = db.collection('users')
    active_users = len(list(users_ref.stream()))
    
    # Count Products (Global)
    products_ref = db.collection('products')
    products_in_stock = len(list(products_ref.stream()))
    
    # Process Orders
    docs = db.collection('orders').stream()
    
    stats = {
        "total_orders": 0,
        "total_revenue": 0,
        "pending_orders": 0,
        "approved_orders": 0,
        "processing_orders": 0,
        "shipped_orders": 0,
        "delivered_orders": 0,
        "cancelled_orders": 0,
        "active_users": active_users,
        "products_in_stock": products_in_stock
    }
    
    for doc in docs:
        order = doc.to_dict()
        
        # Date Filtering
        if filter_start and filter_end:
            created_at_str = order.get('created_at')
            if created_at_str:
                try:
                    # Handle ISO format with/without timezone
                    created_at = datetime.fromisoformat(created_at_str)
                    
                    # Ensure timezone awareness for comparison
                    if created_at.tzinfo is None:
                        # Assume Kenya time if naive (legacy data)
                        created_at = created_at.replace(tzinfo=timezone(timedelta(hours=3)))
                    
                    if filter_start.tzinfo is None:
                         filter_start = filter_start.replace(tzinfo=timezone(timedelta(hours=3)))
                    if filter_end.tzinfo is None:
                         filter_end = filter_end.replace(tzinfo=timezone(timedelta(hours=3)))

                    if not (filter_start <= created_at <= filter_end):
                        continue
                except ValueError:
                    continue # Skip if date format error

        stats["total_orders"] += 1
        
        status_raw = order.get('status', '').lower()
        
        # Map status to key
        status_key = f"{status_raw}_orders"
        if status_key in stats:
            stats[status_key] += 1
        
        # Calculate revenue (exclude cancelled)
        if status_raw not in ['cancelled']:
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
    
    # Hydrate product details for items
    if 'items' in order:
        enriched_items = []
        for item in order['items']:
            # If item already has details, keep them (backward compatibility)
            if not item.get('name') or not item.get('image_url'):
                prod_id = item.get('product_id')
                if prod_id:
                    prod_doc = db.collection('products').document(prod_id).get()
                    if prod_doc.exists:
                        prod_data = prod_doc.to_dict()
                        item['name'] = prod_data.get('name', 'Unknown Product')
                        item['image_url'] = prod_data.get('image_url')
                        item['category'] = prod_data.get('category')
            enriched_items.append(item)
        order['items'] = enriched_items
    
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
        "user_email": order_data.get('customer_email') or current_user.get('email'),
        "full_name": order_data.get('customer_name') or current_user.get('full_name'),
        "phone": order_data.get('customer_phone'),
        "status": "pending",
        "payment_status": "pending", 
        "total_amount": order_data.get('total_amount', 0),
        "items": order_data.get('items', []),
        "shipping_address": order_data.get('shipping_address') or order_data.get('delivery_address', ''),
        "notes": order_data.get('notes', ''),
        "payment_method": order_data.get('payment_method', 'mpesa'),
        "tracking_id": None,
        "created_at": get_kenya_time()
    }
    
    doc_ref.set(order)
    return order

@router.put("/{order_id}/status")
async def update_order_status(
    order_id: str, 
    status_data: dict = Body(...),
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
        # Only generate tracking ID if not already present
        current_data = doc_ref.get().to_dict()
        if not current_data.get('tracking_id'):
            update_data["tracking_id"] = f"PA-{uuid.uuid4().hex[:8].upper()}"
            update_data["approved_at"] = get_kenya_time()
    
    doc_ref.update(update_data)
    
    updated = doc_ref.get().to_dict()
    updated['id'] = doc_ref.id
    return updated

@router.post("/{order_id}/approve")
async def approve_order_endpoint(order_id: str, current_user: dict = Depends(get_admin_user)):
    """Approve order (Convenience endpoint)"""
    return await update_order_status(order_id, {"status": "approved"}, current_user)

@router.put("/{order_id}/confirm-delivery")
async def confirm_delivery(order_id: str, current_user: dict = Depends(get_current_user)):
    """Customer confirms delivery"""
    db = get_db()
    doc_ref = db.collection('orders').document(order_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order = doc.to_dict()
    
    # Verify ownership
    if order.get('user_id') != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Verify status flow
    if order.get('status') != 'Shipped':
        raise HTTPException(status_code=400, detail="Order must be Shipped before it can be Delivered")
        
    update_data = {
        "status": "Delivered",
        "delivered_at": get_kenya_time()
    }
    
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

@router.put("/{order_id}/pay")
async def update_payment_status(order_id: str, payment_data: dict, current_user: dict = Depends(get_current_user)):
    """Update payment status (e.g. after successful M-Pesa)"""
    db = get_db()
    doc_ref = db.collection('orders').document(order_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # In a real app, verify signature/admin/callback here. 
    # For this demo, allow user to mark own order paid if successful client-side (or admin)
    order = doc.to_dict()
    if not current_user.get('is_admin') and order.get('user_id') != current_user['id']:
        raise HTTPException(status_code=403, detail="Not authorized")

    new_status = payment_data.get('payment_status')
    if new_status:
        doc_ref.update({"payment_status": new_status})
    
    return {"status": "success", "payment_status": new_status}
