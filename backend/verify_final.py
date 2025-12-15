
import requests
import json

def test_chat():
    url = "http://localhost:8000/chat/"
    headers = {"Content-Type": "application/json"}
    payload = {"message": "Hello"}
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        with open("verification_result.txt", "w") as f:
            if response.status_code == 200:
                f.write(f"SUCCESS: {response.text}")
            else:
                f.write(f"FAILED: {response.status_code} - {response.text}")
    except Exception as e:
         with open("verification_result.txt", "w") as f:
            f.write(f"ERROR: {str(e)}")

if __name__ == "__main__":
    test_chat()
