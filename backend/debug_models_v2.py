
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key found: {bool(api_key)}")

if api_key:
    genai.configure(api_key=api_key)
    print("Listing available models:")
    try:
        with open("available_models.txt", "w", encoding="utf-8") as f:
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    line = f"- {m.name}"
                    print(line)
                    f.write(line + "\n")
    except Exception as e:
        print(f"Error: {e}")
