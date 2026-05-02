"""
Prime Audio Solutions API - PostgreSQL Version
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="Prime Audio Solutions API - PostgreSQL")

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
    "https://prime-audio-web-app-mzss.vercel.app",
    "https://prime-audio-web-app-mzss.vercel.app/",
    "*"  # Allow all for testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/static", StaticFiles(directory="uploads"), name="static")

@app.get("/")
def read_root():
    return {"message": "Welcome to Prime Audio Solutions API - PostgreSQL Version"}

# Import and include all PostgreSQL-based routers from app.routers
from app.routers import (
    auth, products, orders, cart, wishlist,
    testimonials, content, chat, offers, reviews,
    addresses, messages, payments, settings, notifications, activity_logs
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(cart.router)
app.include_router(wishlist.router)
app.include_router(testimonials.router)
app.include_router(content.router)
app.include_router(chat.router)
app.include_router(offers.router)
app.include_router(reviews.router)
app.include_router(addresses.router)
app.include_router(messages.router)
app.include_router(payments.router)
app.include_router(settings.router)
app.include_router(notifications.router)
app.include_router(activity_logs.router)

print("PostgreSQL-powered Prime Audio API is ready with ALL endpoints!")
