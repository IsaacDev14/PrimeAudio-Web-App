from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os

router = APIRouter(prefix="/chat", tags=["AI Chat"])

class ChatRequest(BaseModel):
    message: str

# Configure Gemini
api_key = os.getenv("gemini_api_key")
if api_key:
    genai.configure(api_key=api_key)

    # Use the appropriate model - verifying valid models in a real scenario is good
    # For now assuming 'gemini-pro' or similar exists
    model = genai.GenerativeModel('gemini-pro') 
else:
    model = None

@router.post("/")
async def chat_with_ai(request: ChatRequest):
    if not model:
        raise HTTPException(status_code=503, detail="AI Service not configured")
    
    try:
        # Simple generation for now
        response = model.generate_content(request.message)
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DescriptionRequest(BaseModel):
    product_name: str
    category: str
    features: str

@router.post("/generate-description")
async def generate_description(request: DescriptionRequest):
    if not model:
         raise HTTPException(status_code=503, detail="AI Service not configured")
    
    prompt = f"Write a professional and engaging e-commerce product description for a {request.product_name} in the category {request.category}. Key features: {request.features}. Use HTML formatting for bolding key terms."
    
    try:
        response = model.generate_content(prompt)
        return {"description": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

