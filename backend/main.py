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

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Prime Audio Solutions API"}

from routers import auth, products, chat
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(chat.router)
