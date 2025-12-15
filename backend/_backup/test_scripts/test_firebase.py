"""Test Firebase connection and verify data"""
from firebase_db import get_firestore_client

def test_firebase():
    db = get_firestore_client()
    
    # Count documents
    users = list(db.collection('users').stream())
    products = list(db.collection('products').stream())
    categories = list(db.collection('categories').stream())
    
    print(f"Users: {len(users)}")
    print(f"Products: {len(products)}")
    print(f"Categories: {len(categories)}")
    
    print("\n--- Sample Users ---")
    for doc in users[:3]:
        data = doc.to_dict()
        role = "Admin" if data.get("is_admin") else "Customer"
        print(f"  {data.get('email')} - {role}")
    
    print("\n--- Products ---")
    for doc in products:
        data = doc.to_dict()
        print(f"  {data.get('name')} - KES {data.get('price'):,.0f}")
    
    print("\n[OK] Firebase Firestore is working!")

if __name__ == "__main__":
    test_firebase()
