
import firebase_admin
from firebase_admin import credentials, firestore
import os
from collections import defaultdict

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

def cleanup_duplicates():
    print("Scanning for duplicate conversations...")
    
    # 1. Fetch all conversations
    convs_ref = db.collection('conversations')
    docs = convs_ref.stream()
    
    # Group by User + Subject (or User + Admin)
    # Using Key: (user_id, subject) to identify "duplicates" visually seen by user
    grouped = defaultdict(list)
    
    for doc in docs:
        data = doc.to_dict()
        c_id = doc.id
        user_id = data.get('user_id')
        subject = data.get('subject')
        
        # We group by user and subject to find the visual duplicates
        key = (user_id, subject)
        grouped[key].append({
            'id': c_id,
            'created_at': data.get('created_at', ''),
            'data': data
        })

    deleted_count = 0
    
    # 2. Analyze each group
    for key, conv_list in grouped.items():
        if len(conv_list) > 1:
            print(f"\nFound {len(conv_list)} duplicates for User: {key[0]}, Subject: {key[1]}")
            
            # Check message counts for each
            scored_convs = []
            for conv in conv_list:
                # Count messages
                msgs = db.collection('messages').where('conversation_id', '==', conv['id']).stream()
                msg_count = len(list(msgs))
                
                scored_convs.append({
                    'id': conv['id'],
                    'msg_count': msg_count,
                    'created_at': conv['created_at']
                })
                print(f"  - Conv {conv['id']}: {msg_count} messages, Created: {conv['created_at']}")
            
            # Sort: Primary by Msg Count (Desc), Secondary by Created At (Desc)
            # We want to KEEP the one with most messages, or newest if tied.
            scored_convs.sort(key=lambda x: (x['msg_count'], x['created_at']), reverse=True)
            
            winner = scored_convs[0]
            losers = scored_convs[1:]
            
            print(f"  -> Keeping: {winner['id']} ({winner['msg_count']} msgs)")
            
            # Delete losers
            for loser in losers:
                print(f"  -> DELETING: {loser['id']}")
                convs_ref.document(loser['id']).delete()
                
                # Optional: Delete messages of the deleted conversation? 
                # User said "remove the duplicate", implying the convo itself. 
                # We leave orphaned messages or delete them. Let's delete them to be clean.
                l_msgs = db.collection('messages').where('conversation_id', '==', loser['id']).stream()
                for m in l_msgs:
                    m.reference.delete()
                    
                deleted_count += 1

    print(f"\nCleanup Complete. Deleted {deleted_count} duplicate conversations.")

if __name__ == "__main__":
    cleanup_duplicates()
