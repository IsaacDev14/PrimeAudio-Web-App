from firebase_db import get_firestore_client

try:
    print("Initializing Firestore Client...")
    db = get_firestore_client()
    print("Streaming users...")
    docs = list(db.collection('users').stream())
    print(f"Success! Found {len(docs)} users.")
except Exception as e:
    print(f"Error testing firebase: {e}")
