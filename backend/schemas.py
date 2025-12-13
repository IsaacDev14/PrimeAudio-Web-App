from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_admin: bool
    phone: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    brand: Optional[str] = None
    condition: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = []  # Multiple image URLs
    stock: Optional[int] = 0
    is_featured: Optional[bool] = False

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    rating: Optional[float] = 0.0
    review_count: Optional[int] = 0
    created_at: datetime

    class Config:
        from_attributes = True

# Order Schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: Optional[float] = None

class OrderCreate(BaseModel):
    items: List[OrderItemBase]
    total_amount: Optional[float] = None
    payment_method: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    delivery_address: Optional[str] = None
    notes: Optional[str] = None

class OrderItemResponse(OrderItemBase):
    id: int
    price: float

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: str
    total_amount: Optional[float] = None
    tracking_id: Optional[str] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None
    delivery_address: Optional[str] = None
    notes: Optional[str] = None
    approved_at: Optional[datetime] = None
    approved_by: Optional[int] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

# Order Tracking (Public)
class OrderTrackingResponse(BaseModel):
    tracking_id: str
    status: str
    payment_status: Optional[str] = None
    created_at: datetime
    approved_at: Optional[datetime] = None
    shipped_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Review Schemas
class ReviewCreate(BaseModel):
    product_id: int
    rating: int  # 1-5
    title: Optional[str] = None
    comment: Optional[str] = None
    order_id: Optional[int] = None

class ReviewResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    rating: int
    title: Optional[str] = None
    comment: Optional[str] = None
    is_approved: bool
    is_verified_purchase: bool
    helpful_votes: int
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True

# Chat Schemas
class ChatMessageBase(BaseModel):
    message: str

class ChatResponse(ChatMessageBase):
    id: int
    sender: str
    created_at: datetime

    class Config:
        from_attributes = True

# Analytics Schemas
class AnalyticsDateFilter(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    period: Optional[str] = "all"  # "day", "week", "month", "year", "all"

class DashboardStats(BaseModel):
    total_revenue: float
    total_orders: int
    products_in_stock: int
    active_users: int
    pending_orders: int
    approved_orders: int
    shipped_orders: int
    delivered_orders: int
