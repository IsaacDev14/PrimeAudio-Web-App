"""
Prime Audio Solutions API - Firebase Version
This version uses Firebase Firestore instead of PostgreSQL
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Prime Audio Solutions API - Firebase")

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
    "*"  # Allow all for testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/static", StaticFiles(directory="uploads"), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to Prime Audio Solutions API - Firebase Version"}

# Firebase-powered routers
from app.routers import auth_firebase, products_firebase, orders_firebase

app.include_router(auth_firebase.router)
app.include_router(products_firebase.router)
app.include_router(orders_firebase.router)

# Additional Firebase routers (simplified versions)
from fastapi import APIRouter, Depends
from firebase_db import get_firestore_client
from app.routers.auth_firebase import get_current_user

# Cart Router
cart_router = APIRouter(prefix="/cart", tags=["Cart"])

@cart_router.get("/")
async def get_cart(current_user: dict = Depends(get_current_user)):
    db = get_firestore_client()
    query = db.collection('cart_items').where('user_id', '==', current_user['id'])
    docs = query.stream()
    items = []
    for doc in docs:
        item = doc.to_dict()
        item['id'] = doc.id
        # Get product details
        prod_doc = db.collection('products').document(item.get('product_id', '')).get()
        if prod_doc.exists:
            item['product'] = prod_doc.to_dict()
        items.append(item)
    return items

@cart_router.post("/add")
async def add_to_cart(data: dict, current_user: dict = Depends(get_current_user)):
    db = get_firestore_client()
    # Check if item exists in cart
    query = db.collection('cart_items').where('user_id', '==', current_user['id']).where('product_id', '==', data.get('product_id'))
    existing = list(query.stream())
    if existing:
        doc_ref = db.collection('cart_items').document(existing[0].id)
        current_qty = existing[0].to_dict().get('quantity', 0)
        doc_ref.update({'quantity': current_qty + data.get('quantity', 1)})
    else:
        doc_ref = db.collection('cart_items').document()
        cart_item = {
            "id": doc_ref.id,
            "user_id": current_user['id'],
            "product_id": data.get('product_id'),
            "quantity": data.get('quantity', 1)
        }
        doc_ref.set(cart_item)
    return {"message": "Added to cart"}

@cart_router.delete("/clear")
async def clear_cart(current_user: dict = Depends(get_current_user)):
    db = get_firestore_client()
    query = db.collection('cart_items').where('user_id', '==', current_user['id'])
    for doc in query.stream():
        doc.reference.delete()
    return {"message": "Cart cleared"}

app.include_router(cart_router)

# Wishlist Router
wishlist_router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@wishlist_router.get("/")
async def get_wishlist(current_user: dict = Depends(get_current_user)):
    db = get_firestore_client()
    query = db.collection('wishlist').where('user_id', '==', current_user['id'])
    docs = query.stream()
    items = []
    for doc in docs:
        item = doc.to_dict()
        item['id'] = doc.id
        # Get product details
        prod_doc = db.collection('products').document(item.get('product_id', '')).get()
        if prod_doc.exists:
            item['product'] = prod_doc.to_dict()
        items.append(item)
    return items

@wishlist_router.post("/add")
async def add_to_wishlist(data: dict, current_user: dict = Depends(get_current_user)):
    db = get_firestore_client()
    doc_ref = db.collection('wishlist').document()
    item = {
        "id": doc_ref.id,
        "user_id": current_user['id'],
        "product_id": data.get('product_id')
    }
    doc_ref.set(item)
    return {"message": "Added to wishlist"}

@wishlist_router.delete("/{item_id}")
async def remove_from_wishlist(item_id: str, current_user: dict = Depends(get_current_user)):
    db = get_firestore_client()
    db.collection('wishlist').document(item_id).delete()
    return {"message": "Removed from wishlist"}

app.include_router(wishlist_router)

# Testimonials Router
testimonials_router = APIRouter(prefix="/testimonials", tags=["Testimonials"])

@testimonials_router.get("/")
async def get_testimonials():
    db = get_firestore_client()
    docs = db.collection('testimonials').stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

app.include_router(testimonials_router)

# Content Router
content_router = APIRouter(prefix="/content", tags=["Content"])

@content_router.get("/")
async def get_content(category: str = None):
    db = get_firestore_client()
    if category:
        query = db.collection('content').where('category', '==', category)
    else:
        query = db.collection('content')
    docs = query.stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

app.include_router(content_router)

# Categories Router (simple)
categories_router = APIRouter(prefix="/categories", tags=["Categories"])

@categories_router.get("/")
async def get_all_categories():
    db = get_firestore_client()
    docs = db.collection('categories').stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

app.include_router(categories_router)

# Notifications Router
notifications_router = APIRouter(prefix="/notifications", tags=["Notifications"])

@notifications_router.get("/")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    db = get_firestore_client()
    query = db.collection('notifications').where('user_id', '==', current_user['id'])
    docs = query.stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

app.include_router(notifications_router)

# Chat/AI Router (for Gemini integration)
chat_router = APIRouter(prefix="/chat", tags=["Chat"])

@chat_router.post("/generate-description")
async def generate_description(data: dict):
    """Generate product description using Gemini AI"""
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        prompt = f"""Generate a professional, engaging product description for:
        Product: {data.get('product_name')}
        Category: {data.get('category')}
        Features: {data.get('features')}
        
        Make it compelling for an audio equipment store. Include key features and benefits."""
        
        response = model.generate_content(prompt)
        return {"description": response.text}
    except Exception as e:
        return {"description": f"Error generating description: {str(e)}"}

app.include_router(chat_router)

print("Firebase-powered Prime Audio API is ready!")
