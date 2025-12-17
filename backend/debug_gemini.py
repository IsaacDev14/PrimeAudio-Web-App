
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key present: {bool(api_key)}")
if api_key:
    print(f"API Key length: {len(api_key)}")

try:
    print(f"Library Version: {genai.__version__}")
except:
    print("Could not get library version")

try:
    genai.configure(api_key=api_key)
    print("\nListing available models:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name} (Version: {m.version})")
except Exception as e:
    print(f"Error listing models: {e}")
