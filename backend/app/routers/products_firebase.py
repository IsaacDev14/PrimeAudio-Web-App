"""
Products Router - Firebase Firestore Version
"""
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Depends
from typing import List, Optional
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from firebase_db import get_firestore_client
import uuid
import shutil

router = APIRouter(prefix="/products", tags=["Products"])

def get_db():
    return get_firestore_client()

@router.get("/")
async def get_products(
    skip: int = 0, 
    limit: int = 100, 
    category: Optional[str] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    condition: Optional[str] = None,
):
    """Get products with optional filtering"""
    db = get_db()
    query = db.collection('products')
    
    # Note: Firestore has limited querying capabilities
    # For complex filters, we fetch and filter in Python
    docs = query.stream()
    products = []
    
    for doc in docs:
        product = doc.to_dict()
        product['id'] = doc.id
        
        # Apply filters
        if category and product.get('category') != category:
            continue
        if brand and product.get('brand') != brand:
            continue
        if min_price and product.get('price', 0) < min_price:
            continue
        if max_price and product.get('price', 0) > max_price:
            continue
        if condition and product.get('condition') != condition:
            continue
            
        products.append(product)
    
    # Apply pagination
    return products[skip:skip + limit]

@router.get("/featured")
async def get_featured_products(limit: int = 12):
    """Get featured products for homepage"""
    db = get_db()
    query = db.collection('products').where('is_featured', '==', True).limit(limit * 2)
    docs = query.stream()
    
    products = []
    for doc in docs:
        product = doc.to_dict()
        product['id'] = doc.id
        products.append(product)
    
    # Shuffle and limit
    import random
    random.shuffle(products)
    return products[:limit]

@router.get("/categories")
async def get_categories():
    """Get all product categories with counts"""
    db = get_db()
    docs = db.collection('products').stream()
    
    category_counts = {}
    for doc in docs:
        product = doc.to_dict()
        cat = product.get('category')
        if cat:
            category_counts[cat] = category_counts.get(cat, 0) + 1
    
    return [{"name": cat, "count": count} for cat, count in category_counts.items()]

@router.get("/brands")
async def get_brands():
    """Get all product brands with counts"""
    db = get_db()
    docs = db.collection('products').stream()
    
    brand_counts = {}
    for doc in docs:
        product = doc.to_dict()
        brand = product.get('brand')
        if brand:
            brand_counts[brand] = brand_counts.get(brand, 0) + 1
    
    return [{"name": brand, "count": count} for brand, count in brand_counts.items()]

@router.get("/{product_id}")
async def get_product(product_id: str):
    """Get a single product by ID"""
    db = get_db()
    doc = db.collection('products').document(product_id).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = doc.to_dict()
    product['id'] = doc.id
    return product

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_product(product: dict):
    """Create a new product (admin only)"""
    db = get_db()
    doc_ref = db.collection('products').document()
    product['id'] = doc_ref.id
    from datetime import datetime
    product['created_at'] = datetime.utcnow().isoformat()
    product['updated_at'] = datetime.utcnow().isoformat()
    doc_ref.set(product)
    return product

@router.put("/{product_id}")
async def update_product(product_id: str, product_update: dict):
    """Update a product (admin only)"""
    db = get_db()
    doc_ref = db.collection('products').document(product_id)
    
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Product not found")
    
    from datetime import datetime
    product_update['updated_at'] = datetime.utcnow().isoformat()
    doc_ref.update(product_update)
    
    updated = doc_ref.get().to_dict()
    updated['id'] = doc_ref.id
    return updated

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    """Delete a product (admin only)"""
    db = get_db()
    doc_ref = db.collection('products').document(product_id)
    
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Product not found")
    
    doc_ref.delete()
    return None

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload product image"""
    file_extension = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"
    
    # Ensure uploads directory exists
    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"http://localhost:8000/static/{filename}"}
