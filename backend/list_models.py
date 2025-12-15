
import google.generativeai as genai
import os

api_key = "AIzaSyC3AReYS9X140l_N4hsTIuy7V9hFhbuxRI"
genai.configure(api_key=api_key)

print("Listing available models:")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error: {e}")
