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
    created_at: datetime
    
    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: str
    stock: int

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Order Schemas
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemBase]

class OrderItemResponse(OrderItemBase):
    id: int
    price: float

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    user_id: int
    status: str
    total_amount: float
    items: List[OrderItemResponse]
    created_at: datetime

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
