"""
Prime Audio Solutions API - Firebase Version
This version uses Firebase Firestore instead of PostgreSQL
"""
from fastapi import FastAPI, HTTPException
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

# Offers Router
offers_router = APIRouter(prefix="/offers", tags=["Offers"])

@offers_router.get("/")
async def get_all_offers():
    db = get_firestore_client()
    docs = db.collection('offers').stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@offers_router.get("/active")
async def get_active_offers():
    db = get_firestore_client()
    docs = db.collection('offers').where('is_active', '==', True).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@offers_router.get("/products-on-sale")
async def get_products_on_sale():
    db = get_firestore_client()
    # Get products with discount
    docs = db.collection('products').stream()
    products = []
    for doc in docs:
        p = doc.to_dict()
        if p.get('original_price') and p.get('price') and p['original_price'] > p['price']:
            p['id'] = doc.id
            products.append(p)
    return products[:20]  # Limit to 20

@offers_router.post("/")
async def create_offer(data: dict, current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Admin only")
    db = get_firestore_client()
    doc_ref = db.collection('offers').document()
    from datetime import datetime
    offer = {
        "id": doc_ref.id,
        "title": data.get('title'),
        "description": data.get('description'),
        "discount_percent": data.get('discount_percent', 0),
        "start_date": data.get('start_date'),
        "end_date": data.get('end_date'),
        "is_active": data.get('is_active', True),
        "created_at": datetime.utcnow().isoformat()
    }
    doc_ref.set(offer)
    return offer

@offers_router.put("/{offer_id}")
async def update_offer(offer_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Admin only")
    db = get_firestore_client()
    doc_ref = db.collection('offers').document(offer_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Offer not found")
    doc_ref.update(data)
    return {"id": offer_id, **doc_ref.get().to_dict()}

@offers_router.delete("/{offer_id}")
async def delete_offer(offer_id: str, current_user: dict = Depends(get_current_user)):
    if not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Admin only")
    db = get_firestore_client()
    db.collection('offers').document(offer_id).delete()
    return {"message": "Deleted"}

app.include_router(offers_router)

# Cart sync endpoint
@cart_router.post("/sync")
async def sync_cart(data: dict, current_user: dict = Depends(get_current_user)):
    """Sync cart from frontend to database"""
    db = get_firestore_client()
    # Clear existing cart
    query = db.collection('cart_items').where('user_id', '==', current_user['id'])
    for doc in query.stream():
        doc.reference.delete()
    # Add new items
    items = data.get('items', [])
    for item in items:
        doc_ref = db.collection('cart_items').document()
        cart_item = {
            "id": doc_ref.id,
            "user_id": current_user['id'],
            "product_id": item.get('product_id') or item.get('id'),
            "quantity": item.get('quantity', 1)
        }
        doc_ref.set(cart_item)
    return {"message": "Cart synced", "count": len(items)}

# Reviews Router
reviews_router = APIRouter(prefix="/reviews", tags=["Reviews"])

@reviews_router.get("/product/{product_id}")
async def get_product_reviews(product_id: str):
    db = get_firestore_client()
    query = db.collection('reviews').where('product_id', '==', product_id)
    docs = query.stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@reviews_router.post("/")
async def create_review(data: dict, current_user: dict = Depends(get_current_user)):
    db = get_firestore_client()
    doc_ref = db.collection('reviews').document()
    from datetime import datetime
    review = {
        "id": doc_ref.id,
        "user_id": current_user['id'],
        "user_name": current_user.get('full_name', 'Anonymous'),
        "product_id": data.get('product_id'),
        "rating": data.get('rating', 5),
        "comment": data.get('comment', ''),
        "created_at": datetime.utcnow().isoformat()
    }
    doc_ref.set(review)
    return review

app.include_router(reviews_router)

# Addresses Router
addresses_router = APIRouter(prefix="/addresses", tags=["Addresses"])

@addresses_router.get("/")
async def get_addresses(current_user: dict = Depends(get_current_user)):
    db = get_firestore_client()
    query = db.collection('addresses').where('user_id', '==', current_user['id'])
    docs = query.stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@addresses_router.post("/")
async def create_address(data: dict, current_user: dict = Depends(get_current_user)):
    db = get_firestore_client()
    doc_ref = db.collection('addresses').document()
    address = {
        "id": doc_ref.id,
        "user_id": current_user['id'],
        "name": data.get('name'),
        "phone": data.get('phone'),
        "address": data.get('address'),
        "city": data.get('city'),
        "is_default": data.get('is_default', False)
    }
    doc_ref.set(address)
    return address

app.include_router(addresses_router)

# Messages Router
messages_router = APIRouter(prefix="/messages", tags=["Messages"])

@messages_router.get("/conversations")
async def get_conversations(current_user: dict = Depends(get_current_user)):
    db = get_firestore_client()
    if current_user.get('is_admin'):
        query = db.collection('conversations')
    else:
        query = db.collection('conversations').where('user_id', '==', current_user['id'])
    docs = query.stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@messages_router.get("/conversations/{conv_id}/messages")
async def get_messages(conv_id: str, current_user: dict = Depends(get_current_user)):
    db = get_firestore_client()
    query = db.collection('messages').where('conversation_id', '==', conv_id)
    docs = query.stream()
    messages = [{"id": doc.id, **doc.to_dict()} for doc in docs]
    messages.sort(key=lambda x: x.get('created_at', ''))
    return messages

@messages_router.post("/conversations")
async def create_conversation(data: dict, current_user: dict = Depends(get_current_user)):
    db = get_firestore_client()
    doc_ref = db.collection('conversations').document()
    from datetime import datetime
    conv = {
        "id": doc_ref.id,
        "user_id": current_user['id'],
        "user_name": current_user.get('full_name'),
        "admin_id": data.get('admin_id'),
        "subject": data.get('subject', 'New Conversation'),
        "status": "open",
        "created_at": datetime.utcnow().isoformat()
    }
    doc_ref.set(conv)
    return conv

@messages_router.post("/send")
async def send_message(data: dict, current_user: dict = Depends(get_current_user)):
    db = get_firestore_client()
    doc_ref = db.collection('messages').document()
    from datetime import datetime
    message = {
        "id": doc_ref.id,
        "conversation_id": data.get('conversation_id'),
        "sender_id": current_user['id'],
        "sender_name": current_user.get('full_name'),
        "content": data.get('content'),
        "is_admin": current_user.get('is_admin', False),
        "created_at": datetime.utcnow().isoformat()
    }
    doc_ref.set(message)
    return message

app.include_router(messages_router)

# Payments Router (placeholder)
payments_router = APIRouter(prefix="/payments", tags=["Payments"])

@payments_router.post("/mpesa/initiate")
async def initiate_mpesa(data: dict, current_user: dict = Depends(get_current_user)):
    return {"message": "M-Pesa payment initiated", "checkout_request_id": "test123"}

@payments_router.post("/mpesa/callback")
async def mpesa_callback(data: dict):
    return {"message": "Callback received"}

app.include_router(payments_router)

print("Firebase-powered Prime Audio API is ready!")

