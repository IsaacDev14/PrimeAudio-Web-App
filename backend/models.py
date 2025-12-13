from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import uuid


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    orders = relationship("Order", back_populates="user", foreign_keys="Order.user_id")
    chat_messages = relationship("ChatMessage", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    addresses = relationship("UserAddress", back_populates="user", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="customer", foreign_keys="Conversation.customer_id")
    messages = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id")
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")


class UserAddress(Base):
    __tablename__ = "user_addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    label = Column(String, default="Home")  # "Home", "Office", etc.
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address_line = Column(Text, nullable=False)
    city = Column(String, default="Nairobi")
    county = Column(String, nullable=True)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="addresses")


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_items")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")  # order_update, message, promo, review
    is_read = Column(Boolean, default=False)
    link = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String, default="General Inquiry")
    status = Column(String, default="open")  # open, closed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    customer = relationship("User", back_populates="conversations", foreign_keys=[customer_id])
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", back_populates="messages", foreign_keys=[sender_id])


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String, index=True)
    brand = Column(String)
    condition = Column(String)
    stock = Column(Integer, default=0)
    image_url = Column(String)  # Primary image
    images = Column(JSON, default=[])  # Multiple image URLs as JSON array
    is_featured = Column(Boolean, default=False)
    rating = Column(Float, default=0.0)  # Average rating
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product")
    wishlist_items = relationship("WishlistItem", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")


def generate_tracking_id():
    """Generate unique tracking ID like PA-XXXXXX"""
    import random
    import string
    chars = string.ascii_uppercase + string.digits
    return f"PA-{''.join(random.choices(chars, k=6))}"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")  # pending, approved, processing, shipped, delivered, cancelled
    total_amount = Column(Float)
    tracking_id = Column(String, unique=True, index=True, nullable=True)
    
    # Payment fields
    payment_method = Column(String, nullable=True)  # mpesa, card, bank_transfer
    payment_status = Column(String, default="pending")  # pending, paid, failed, refunded
    payment_reference = Column(String, nullable=True)
    
    # Customer info
    customer_name = Column(String, nullable=True)
    customer_email = Column(String, nullable=True)
    customer_phone = Column(String, nullable=True)
    delivery_address = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Timestamps
    approved_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    shipped_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="orders", foreign_keys=[user_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)  # Snapshot of price at purchase

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    message = Column(Text, nullable=False)
    response = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="chat_messages")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)  # Link to purchase
    rating = Column(Integer, nullable=False)  # 1-5
    title = Column(String, nullable=True)
    comment = Column(Text)
    is_approved = Column(Boolean, default=False)  # Requires admin approval
    is_verified_purchase = Column(Boolean, default=False)
    helpful_votes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    product = relationship("Product", back_populates="reviews")
    user = relationship("User", back_populates="reviews")


class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text)
    category = Column(String, index=True)  # Project, Service, Media, Blog
    type = Column(String, index=True) # e.g. "Community", "Press" (Sub-category)
    status = Column(String, default="Live") # Live, Beta, Draft
    image_url = Column(String)
    external_link = Column(String)
    order = Column(Integer, default=0)
    date = Column(String) # Storing as string for simplicity like '2024-03-20', or could use Date
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SiteSettings(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)
    site_name = Column(String, default="Prime Audio")
    site_description = Column(Text, default="East Africa's Premier Music Store")
    contact_email = Column(String, default="info@primeaudio.co.ke")
    phone_number = Column(String, default="+254 700 000000")
    address = Column(String, default="Nairobi, Kenya")
    maintenance_mode = Column(Boolean, default=False)
    facebook_url = Column(String, nullable=True)
    instagram_url = Column(String, nullable=True)
    twitter_url = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
