
import firebase_admin
from firebase_admin import credentials, firestore
import os

# Setup Firebase
if not firebase_admin._apps:
    cred_path = os.path.join(os.path.dirname(__file__), 'firebase-credentials.json')
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        print("Error: firebase-credentials.json not found!")
        exit(1)

db = firestore.client()

def repair_conversations():
    print("Repairing conversation metadata...")
    
    convs_ref = db.collection('conversations')
    docs = convs_ref.stream()
    
    count = 0
    updated = 0
    
    for doc in docs:
        c_id = doc.id
        print(f"Checking conversation {c_id}...")
        
        # Get latest message (Fetch all and sort in memory to avoid Index requirements)
        msgs = db.collection('messages').where('conversation_id', '==', c_id).stream()
        
        all_msgs = []
        for m in msgs:
            d = m.to_dict()
            all_msgs.append(d)
            
        # Sort by created_at descending
        all_msgs.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        last_msg_content = None
        last_msg_time = None
        
        if all_msgs:
            latest = all_msgs[0]
            last_msg_content = latest.get('content')
            last_msg_time = latest.get('created_at')
            
        if last_msg_content:
            print(f"  -> Found last message: '{last_msg_content[:20]}...'")
            convs_ref.document(c_id).update({
                'last_message': last_msg_content,
                'updated_at': last_msg_time
            })
            updated += 1
        else:
            print("  -> No messages found.")
            
        count += 1
        
    print(f"\nRepair Complete.")
    print(f"Scanned: {count}")
    print(f"Updated: {updated}")

if __name__ == "__main__":
    repair_conversations()
