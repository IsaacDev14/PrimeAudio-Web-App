import sys
import os
import firebase_admin
from firebase_admin import credentials, firestore

# Ensure we can import from the current directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from firebase_db import get_firestore_client

def verify_orders():
    db = get_firestore_client()
    
    # 1. Get all Users
    print("\n--- Users ---")
    users = list(db.collection('users').stream())
    user_map = {}
    for user in users:
        u = user.to_dict()
        uid = user.id
        email = u.get('email', 'No Email')
        print(f"ID: {uid} | Email: {email} | Admin: {u.get('is_admin', False)}")
        user_map[uid] = email

    print("\n--- Orders for customer@demo.com ---")
    orders = list(db.collection('orders').stream())
    
    found_any = False
    for order in orders:
        o = order.to_dict()
        oid = order.id
        status = o.get('status', 'Unknown')
        user_id = o.get('user_id')
        user_email = user_map.get(user_id, "Unknown User")
        
        if user_email == "customer@demo.com":
             print(f"Order ID: {oid} | Status: {status} | User ID: {user_id} ({user_email})")
             found_any = True
             
    if not found_any:
        print("No orders found for customer@demo.com")

if __name__ == "__main__":
    verify_orders()
