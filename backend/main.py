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
    "http://localhost:5174", # Vite alternate port
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:5173/",
    "http://localhost:5174/",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
]

from fastapi.staticfiles import StaticFiles

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
    return {"message": "Welcome to Prime Audio Solutions API"}

# Import and register all routers
from app.routers import auth, products, chat, orders, content, testimonials, settings

# Core routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(chat.router)
app.include_router(orders.router)
app.include_router(content.router)
app.include_router(testimonials.router)
app.include_router(settings.router)

# New customer experience routers
from app.routers import addresses, wishlist, notifications, messages, payments, reviews, cart

app.include_router(addresses.router)
app.include_router(wishlist.router)
app.include_router(notifications.router)
app.include_router(messages.router)
app.include_router(payments.router)
app.include_router(reviews.router)
app.include_router(cart.router)
