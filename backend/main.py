from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Prime Audio Solutions API")

@app.on_event("startup")
async def on_startup():
    from database import init_db
    await init_db()

origins = [
    "http://localhost:5173", # Vite default
    "http://localhost:3000",
]

from fastapi.staticfiles import StaticFiles

# ... existing code ...

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
import os
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/static", StaticFiles(directory="uploads"), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to Prime Audio Solutions API"}

from app.routers import auth, products, chat, orders, content, testimonials
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(chat.router)
app.include_router(orders.router)
app.include_router(content.router)
app.include_router(testimonials.router)

from app.routers import settings
app.include_router(settings.router)
