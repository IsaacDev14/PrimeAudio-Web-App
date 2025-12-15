import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://localhost:8000"

async def test_auth():
    print("Testing Authentication Flow...")
    
    # 1. Login
    login_url = f"{BASE_URL}/auth/token"
    # Use the credentials we see in the browser subagent logs
    payload = {
        "username": "customer@demo.com", 
        "password": "Demo@123" 
    }
    
    async with httpx.AsyncClient() as client:
        print(f"1. Keying in credentials to {login_url}...")
        resp = await client.post(login_url, data=payload, headers={"Content-Type": "application/x-www-form-urlencoded"})
        
        if resp.status_code != 200:
            print(f"FAILED to login: {resp.status_code} {resp.text}")
            return
        
        data = resp.json()
        token = data.get("access_token")
        print(f"SUCCESS: Got Token: {token[:10]}...")
        
        # 2. Access Protected Route (e.g., /auth/me)
        print("\n2. Accessing Protected Route /auth/me...")
        headers = {"Authorization": f"Bearer {token}"}
        resp_me = await client.get(f"{BASE_URL}/auth/me", headers=headers)
        
        if resp_me.status_code != 200:
            print(f"FAILED to access /auth/me: {resp_me.status_code} {resp_me.text}")
        else:
            print(f"SUCCESS: /auth/me returned {resp_me.json().get('email')}")
            
        # 3. Access Cart (Repro user issue)
        print("\n3. Accessing Cart...")
        # Try GET cart first
        resp_cart = await client.get(f"{BASE_URL}/cart/", headers=headers)
        if resp_cart.status_code == 200:
            print(f"SUCCESS: GET /cart/ worked. Items: {len(resp_cart.json())}")
        else:
            print(f"FAILED: GET /cart/ - {resp_cart.status_code} {resp_cart.text}")

        # Try POST to cart (Add item)
        # Assuming product_id 1 exists (sample data)
        print("\n4. Adding to Cart...")
        resp_add = await client.post(f"{BASE_URL}/cart/?product_id=1&quantity=1", headers=headers)
        if resp_add.status_code == 200:
             print(f"SUCCESS: POST /cart/ worked. {resp_add.json()}")
        else:
             print(f"FAILED: POST /cart/ - {resp_add.status_code} {resp_add.text}")

if __name__ == "__main__":
    asyncio.run(test_auth())
