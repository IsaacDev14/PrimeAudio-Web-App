
import requests
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_messaging():
    print("Testing Messaging Flow...")
    
    # 1. Login as Customer (using existing demo user or creating one)
    # Assuming 'demo@example.com' exists from seed data, or we use a known one.
    # Let's try to login with common credentials or register a temp one.
    
    email = "test_msg_user@example.com"
    password = "password123"
    
    # Register/Login
    print("Logging in...")
    login_res = requests.post(f"{BASE_URL}/auth/token", data={
        "username": email,
        "password": password
    })
    
    token = None
    if login_res.status_code == 200:
        token = login_res.json()["access_token"]
    else:
        # Register
         print("Registering...")
         requests.post(f"{BASE_URL}/auth/register", json={
             "email": email, 
             "password": password, 
             "full_name": "Test Msg User",
             "role": "customer"
         })
         login_res = requests.post(f"{BASE_URL}/auth/token", data={
            "username": email,
            "password": password
        })
         if login_res.status_code == 200:
             token = login_res.json()["access_token"]
    
    if not token:
        print("FAILED: Could not instantiate user.")
        return

    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create Conversation
    print("Creating Conversation...")
    conv_res = requests.post(f"{BASE_URL}/messages/conversations", json={
        "subject": "Test Conversation"
    }, headers=headers)
    
    if conv_res.status_code not in [200, 201]:
        print(f"FAILED to update/create conversation: {conv_res.text}")
        # Try getting existing
        get_res = requests.get(f"{BASE_URL}/messages/conversations", headers=headers)
        if get_res.status_code == 200 and len(get_res.json()) > 0:
            conv_id = get_res.json()[0]['id']
            print(f"Using existing conversation {conv_id}")
        else:
            return
    else:
        conv_id = conv_res.json()['id']
        print(f"Created conversation {conv_id}")

    # 3. Send Message
    print(f"Sending Message to {conv_id}...")
    msg_res = requests.post(f"{BASE_URL}/messages/conversations/{conv_id}/messages", json={
        "content": "Hello Admin, is this working?"
    }, headers=headers)
    
    if msg_res.status_code == 200:
        print("SUCCESS: Message sent!")
        print(msg_res.json())
    else:
        print(f"FAILED to send message: {msg_res.text}")

if __name__ == "__main__":
    test_messaging()
