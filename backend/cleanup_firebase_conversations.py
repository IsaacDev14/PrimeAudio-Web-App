
import firebase_admin
from firebase_admin import credentials, firestore
import os

# Setup Firebase (Manual init to be standalone)
if not firebase_admin._apps:
    cred_path = os.path.join(os.path.dirname(__file__), 'firebase-credentials.json')
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        print("Error: firebase-credentials.json not found!")
        exit(1)

db = firestore.client()

def cleanup_empty_conversations():
    print("Scanning Firebase conversations...")
    conversations_ref = db.collection('conversations')
    docs = conversations_ref.stream()
    
    count = 0
    deleted = 0
    
    for doc in docs:
        data = doc.to_dict()
        conv_id = doc.id
        subject = data.get('subject', 'Unknown')
        last_msg = data.get('last_message')
        
        # Check if empty
        if not last_msg or str(last_msg).strip() == "":
            print(f"Deleting empty conversation {conv_id} ({subject})...")
            conversations_ref.document(conv_id).delete()
            deleted += 1
        
        count += 1
        
    print(f"\nScan complete.")
    print(f"Total processed: {count}")
    print(f"Deleted: {deleted}")

if __name__ == "__main__":
    cleanup_empty_conversations()
