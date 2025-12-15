
import google.generativeai as genai
import os

api_key = "AIzaSyC3AReYS9X140l_N4hsTIuy7V9hFhbuxRI"
genai.configure(api_key=api_key)

try:
    with open("models_list.txt", "w") as f:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(f"{m.name}\n")
except Exception as e:
    with open("models_list.txt", "w") as f:
        f.write(f"Error: {e}")
