
import requests
import json
import time

def test_chat():
    url = "http://localhost:8000/chat/"
    headers = {"Content-Type": "application/json"}
    payload = {"message": "Hello, are you working? Reply with 'Yes, I am working!' if successful."}

    print(f"Testing Chat API at {url}...")
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            print("SUCCESS! API Response:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"FAILED with status code {response.status_code}")
            print("Response:", response.text)
    except Exception as e:
        print(f"ERROR connecting to API: {str(e)}")

if __name__ == "__main__":
    test_chat()
