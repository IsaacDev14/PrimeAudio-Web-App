"""
Firebase Firestore Database Configuration
"""
import firebase_admin
from firebase_admin import credentials, firestore
from functools import lru_cache
import os

# Initialize Firebase
_firebase_app = None

def get_firebase_app():
    global _firebase_app
    if _firebase_app is None:
        cred_path = os.path.join(os.path.dirname(__file__), 'firebase-credentials.json')
        cred = credentials.Certificate(cred_path)
        _firebase_app = firebase_admin.initialize_app(cred)
    return _firebase_app

@lru_cache()
def get_firestore_client():
    """Get Firestore client (cached)"""
    get_firebase_app()
    return firestore.client()

# Collection names
USERS_COLLECTION = 'users'
PRODUCTS_COLLECTION = 'products'
CATEGORIES_COLLECTION = 'categories'
ORDERS_COLLECTION = 'orders'
ORDER_ITEMS_COLLECTION = 'order_items'
REVIEWS_COLLECTION = 'reviews'
CART_ITEMS_COLLECTION = 'cart_items'
WISHLIST_COLLECTION = 'wishlist'
ADDRESSES_COLLECTION = 'addresses'
CONVERSATIONS_COLLECTION = 'conversations'
MESSAGES_COLLECTION = 'messages'
NOTIFICATIONS_COLLECTION = 'notifications'
OFFERS_COLLECTION = 'offers'
CONTENT_COLLECTION = 'content'

def get_db():
    """Get Firestore database client - compatible function name with existing code"""
    return get_firestore_client()

# Helper functions for common operations
class FirestoreDB:
    def __init__(self):
        self.db = get_firestore_client()
    
    # Users
    def get_user_by_email(self, email: str):
        users_ref = self.db.collection(USERS_COLLECTION)
        query = users_ref.where('email', '==', email).limit(1)
        docs = query.stream()
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            return data
        return None
    
    def get_user_by_id(self, user_id: str):
        doc = self.db.collection(USERS_COLLECTION).document(str(user_id)).get()
        if doc.exists:
            data = doc.to_dict()
            data['id'] = doc.id
            return data
        return None
    
    def create_user(self, user_data: dict):
        doc_ref = self.db.collection(USERS_COLLECTION).document()
        user_data['id'] = doc_ref.id
        doc_ref.set(user_data)
        return user_data
    
    def update_user(self, user_id: str, data: dict):
        self.db.collection(USERS_COLLECTION).document(str(user_id)).update(data)
    
    def get_all_users(self, is_admin: bool = None):
        query = self.db.collection(USERS_COLLECTION)
        if is_admin is not None:
            query = query.where('is_admin', '==', is_admin)
        docs = query.stream()
        users = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            users.append(data)
        return users
    
    # Products
    def get_all_products(self):
        docs = self.db.collection(PRODUCTS_COLLECTION).stream()
        products = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            products.append(data)
        return products
    
    def get_product_by_id(self, product_id: str):
        doc = self.db.collection(PRODUCTS_COLLECTION).document(str(product_id)).get()
        if doc.exists:
            data = doc.to_dict()
            data['id'] = doc.id
            return data
        return None
    
    def create_product(self, product_data: dict):
        doc_ref = self.db.collection(PRODUCTS_COLLECTION).document()
        product_data['id'] = doc_ref.id
        doc_ref.set(product_data)
        return product_data
    
    def update_product(self, product_id: str, data: dict):
        self.db.collection(PRODUCTS_COLLECTION).document(str(product_id)).update(data)
    
    def delete_product(self, product_id: str):
        self.db.collection(PRODUCTS_COLLECTION).document(str(product_id)).delete()
    
    # Categories
    def get_all_categories(self):
        docs = self.db.collection(CATEGORIES_COLLECTION).stream()
        categories = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            categories.append(data)
        return categories
    
    def create_category(self, category_data: dict):
        doc_ref = self.db.collection(CATEGORIES_COLLECTION).document()
        category_data['id'] = doc_ref.id
        doc_ref.set(category_data)
        return category_data
    
    # Orders
    def get_orders_by_user(self, user_id: str):
        query = self.db.collection(ORDERS_COLLECTION).where('user_id', '==', str(user_id))
        docs = query.stream()
        orders = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            orders.append(data)
        return orders
    
    def get_all_orders(self):
        docs = self.db.collection(ORDERS_COLLECTION).stream()
        orders = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            orders.append(data)
        return orders
    
    def get_order_by_id(self, order_id: str):
        doc = self.db.collection(ORDERS_COLLECTION).document(str(order_id)).get()
        if doc.exists:
            data = doc.to_dict()
            data['id'] = doc.id
            return data
        return None
    
    def create_order(self, order_data: dict):
        doc_ref = self.db.collection(ORDERS_COLLECTION).document()
        order_data['id'] = doc_ref.id
        doc_ref.set(order_data)
        return order_data
    
    def update_order(self, order_id: str, data: dict):
        self.db.collection(ORDERS_COLLECTION).document(str(order_id)).update(data)
    
    # Cart
    def get_cart_items(self, user_id: str):
        query = self.db.collection(CART_ITEMS_COLLECTION).where('user_id', '==', str(user_id))
        docs = query.stream()
        items = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            items.append(data)
        return items
    
    def add_to_cart(self, cart_data: dict):
        # Check if item exists
        query = self.db.collection(CART_ITEMS_COLLECTION).where('user_id', '==', cart_data['user_id']).where('product_id', '==', cart_data['product_id']).limit(1)
        docs = list(query.stream())
        if docs:
            # Update quantity
            doc_id = docs[0].id
            existing = docs[0].to_dict()
            new_qty = existing.get('quantity', 0) + cart_data.get('quantity', 1)
            self.db.collection(CART_ITEMS_COLLECTION).document(doc_id).update({'quantity': new_qty})
        else:
            doc_ref = self.db.collection(CART_ITEMS_COLLECTION).document()
            cart_data['id'] = doc_ref.id
            doc_ref.set(cart_data)
    
    def update_cart_item(self, item_id: str, quantity: int):
        self.db.collection(CART_ITEMS_COLLECTION).document(str(item_id)).update({'quantity': quantity})
    
    def remove_from_cart(self, item_id: str):
        self.db.collection(CART_ITEMS_COLLECTION).document(str(item_id)).delete()
    
    def clear_cart(self, user_id: str):
        query = self.db.collection(CART_ITEMS_COLLECTION).where('user_id', '==', str(user_id))
        docs = query.stream()
        for doc in docs:
            doc.reference.delete()
    
    # Wishlist
    def get_wishlist(self, user_id: str):
        query = self.db.collection(WISHLIST_COLLECTION).where('user_id', '==', str(user_id))
        docs = query.stream()
        items = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            items.append(data)
        return items
    
    def add_to_wishlist(self, wishlist_data: dict):
        doc_ref = self.db.collection(WISHLIST_COLLECTION).document()
        wishlist_data['id'] = doc_ref.id
        doc_ref.set(wishlist_data)
        return wishlist_data
    
    def remove_from_wishlist(self, item_id: str):
        self.db.collection(WISHLIST_COLLECTION).document(str(item_id)).delete()
    
    # Reviews
    def get_reviews_by_product(self, product_id: str):
        query = self.db.collection(REVIEWS_COLLECTION).where('product_id', '==', str(product_id))
        docs = query.stream()
        reviews = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            reviews.append(data)
        return reviews
    
    def create_review(self, review_data: dict):
        doc_ref = self.db.collection(REVIEWS_COLLECTION).document()
        review_data['id'] = doc_ref.id
        doc_ref.set(review_data)
        return review_data
    
    # Notifications
    def get_notifications(self, user_id: str):
        query = self.db.collection(NOTIFICATIONS_COLLECTION).where('user_id', '==', str(user_id)).order_by('created_at', direction=firestore.Query.DESCENDING)
        docs = query.stream()
        notifications = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            notifications.append(data)
        return notifications
    
    def create_notification(self, notif_data: dict):
        doc_ref = self.db.collection(NOTIFICATIONS_COLLECTION).document()
        notif_data['id'] = doc_ref.id
        doc_ref.set(notif_data)
        return notif_data

# Singleton instance
firestore_db = FirestoreDB()
