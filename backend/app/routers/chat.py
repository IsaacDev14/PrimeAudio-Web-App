from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import google.generativeai as genai
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import database
import models

router = APIRouter(prefix="/chat", tags=["AI Chat"])

class ChatRequest(BaseModel):
    message: str

# Configure Gemini
api_key = os.getenv("gemini_api_key")
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.5-flash') 
else:
    model = None

@router.post("/")
async def chat_with_ai(request: ChatRequest, db: AsyncSession = Depends(database.get_db)):
    if not model:
        raise HTTPException(status_code=503, detail="AI Service not configured")
    
    try:
        # Fetch products from database for context
        products_result = await db.execute(
            select(models.Product).where(models.Product.stock > 0).limit(50)
        )
        products = products_result.scalars().all()
        
        # Build product catalog for AI
        product_catalog = ""
        for p in products:
            product_catalog += f"- {p.name}: KSh {p.price:,.0f} ({p.category})\n"
        
        if not product_catalog:
            product_catalog = "Currently updating inventory. Please check our Shop page."
        
        # System prompt with real product data
        system_prompt = f"""You are the Prime Audio assistant, a helpful AI for Prime Audio - Kenya's premier online music instrument and audio equipment store since 2010.

ABOUT PRIME AUDIO:
- Location: Nairobi, Kenya (we ship nationwide)
- Payment: M-Pesa, Credit/Debit Cards, Bank Transfer
- Delivery: Same-day in Nairobi, 2-3 days nationwide

STORE POLICIES:
- Returns within 7 days for unused items
- 1-year warranty on all instruments
- Free delivery on orders over KSh 10,000

CURRENT PRODUCTS IN STOCK:
{product_catalog}

PAGES TO DIRECT CUSTOMERS:
- Shop: Browse all products
- Track Order: Check order status with tracking ID
- Contact: Reach our support team

RULES:
- Keep responses concise but well-formatted
- Be friendly and professional
- Use **bold** for product names and prices
- ALWAYS use dash bullets (- ) for lists, NEVER use • symbol
- Each bullet item must be on its own line
- Format: - **Product Name** - KSh XX,XXX
- Keep lists to 3-5 items maximum
- Add blank lines between paragraphs"""

        full_prompt = f"{system_prompt}\n\nCustomer question: {request.message}"
        response = model.generate_content(full_prompt)
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

