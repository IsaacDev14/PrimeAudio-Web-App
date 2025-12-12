from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Optional
import models, schemas, database
from app.routers.auth import get_current_user
from datetime import datetime, timedelta
import uuid

router = APIRouter(prefix="/orders", tags=["Orders"])

def generate_tracking_id():
    """Generate a unique tracking ID like PA-XXXXXX"""
    return f"PA-{uuid.uuid4().hex[:8].upper()}"

@router.get("/", response_model=List[schemas.OrderResponse])
async def get_orders(
    skip: int = 0, 
    limit: int = 100, 
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: models.User = Depends(get_current_user), 
    db: AsyncSession = Depends(database.get_db)
):
    """Get all orders with optional filters (admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = select(models.Order)
    
    if status:
        query = query.where(models.Order.status == status)
    
    if start_date:
        start = datetime.fromisoformat(start_date)
        query = query.where(models.Order.created_at >= start)
    
    if end_date:
        end = datetime.fromisoformat(end_date)
        query = query.where(models.Order.created_at <= end)
    
    query = query.offset(skip).limit(limit).order_by(models.Order.created_at.desc())
    
    result = await db.execute(query)
    orders = result.scalars().all()
    return orders

@router.get("/stats")
async def get_order_stats(
    period: str = "all",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(database.get_db)
):
    """Get order statistics with date filtering"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Determine date range based on period
    now = datetime.now()
    if period == "day":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = now
    elif period == "week":
        start = now - timedelta(days=7)
        end = now
    elif period == "month":
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end = now
    elif period == "year":
        start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end = now
    elif start_date and end_date:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
    else:
        start = None
        end = None
    
    # Build query
    query = select(models.Order)
    if start and end:
        query = query.where(models.Order.created_at >= start).where(models.Order.created_at <= end)
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    # Calculate stats
    total_revenue = sum(o.total_amount or 0 for o in orders)
    total_orders = len(orders)
    pending = len([o for o in orders if o.status == "pending"])
    approved = len([o for o in orders if o.status == "approved"])
    processing = len([o for o in orders if o.status == "Processing"])
    shipped = len([o for o in orders if o.status == "Shipped"])
    delivered = len([o for o in orders if o.status == "Delivered"])
    
    # Get product and user counts
    products_result = await db.execute(select(func.sum(models.Product.stock)))
    products_in_stock = products_result.scalar() or 0
    
    users_result = await db.execute(select(func.count(models.User.id)))
    active_users = users_result.scalar() or 0
    
    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "products_in_stock": products_in_stock,
        "active_users": active_users,
        "pending_orders": pending,
        "approved_orders": approved,
        "processing_orders": processing,
        "shipped_orders": shipped,
        "delivered_orders": delivered,
        "period": period,
        "start_date": start.isoformat() if start else None,
        "end_date": end.isoformat() if end else None
    }

@router.get("/user", response_model=List[schemas.OrderResponse])
async def get_my_orders(current_user: models.User = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.Order).where(models.Order.user_id == current_user.id))
    orders = result.scalars().all()
    return orders

@router.get("/track/{tracking_id}", response_model=schemas.OrderTrackingResponse)
async def track_order(tracking_id: str, db: AsyncSession = Depends(database.get_db)):
    """Public endpoint to track order by tracking ID"""
    result = await db.execute(select(models.Order).where(models.Order.tracking_id == tracking_id))
    order = result.scalars().first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found with this tracking ID")
    return order

@router.get("/{order_id}", response_model=schemas.OrderResponse)
async def get_order(order_id: int, current_user: models.User = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.Order).where(models.Order.id == order_id))
    order = result.scalars().first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if not current_user.is_admin and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return order

@router.post("/{order_id}/approve", response_model=schemas.OrderResponse)
async def approve_order(order_id: int, current_user: models.User = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)):
    """Approve an order and generate tracking ID"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(select(models.Order).where(models.Order.id == order_id))
    order = result.scalars().first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.tracking_id:
        raise HTTPException(status_code=400, detail="Order already approved")
    
    # Generate tracking ID and approve
    order.tracking_id = generate_tracking_id()
    order.status = "approved"
    order.approved_at = datetime.now()
    order.approved_by = current_user.id
    
    await db.commit()
    await db.refresh(order)
    return order

@router.put("/{order_id}/status", response_model=schemas.OrderResponse)
async def update_order_status(order_id: int, status: str, current_user: models.User = Depends(get_current_user), db: AsyncSession = Depends(database.get_db)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(select(models.Order).where(models.Order.id == order_id))
    order = result.scalars().first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status
    await db.commit()
    await db.refresh(order)
    return order

@router.post("/", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: schemas.OrderCreate,
    current_user: models.User = Depends(get_current_user),
    db: AsyncSession = Depends(database.get_db)
):
    """Create a new order"""
    # Calculate total and create order items
    total = 0
    order_items = []
    
    for item in order_data.items:
        result = await db.execute(select(models.Product).where(models.Product.id == item.product_id))
        product = result.scalars().first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        item_total = product.price * item.quantity
        total += item_total
        order_items.append({
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price": product.price
        })
    
    # Create order
    new_order = models.Order(
        user_id=current_user.id,
        status="pending",
        total_amount=total
    )
    db.add(new_order)
    await db.flush()
    
    # Create order items
    for item_data in order_items:
        order_item = models.OrderItem(
            order_id=new_order.id,
            **item_data
        )
        db.add(order_item)
    
    await db.commit()
    await db.refresh(new_order)
    return new_order
