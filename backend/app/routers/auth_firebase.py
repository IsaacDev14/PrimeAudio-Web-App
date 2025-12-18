"""
Auth Router - Firebase Firestore Version
"""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from google.cloud.firestore_v1.base_query import FieldFilter
import hashlib
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from firebase_db import get_firestore_client

router = APIRouter(prefix="/auth", tags=["Authentication"])

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

def get_db():
    return get_firestore_client()

def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify a token and return the payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"user_id": payload.get("user_id"), "email": payload.get("sub")}
    except JWTError:
        return None

def get_user_by_email(email: str):
    """Get user from Firestore by email"""
    db = get_db()
    query = db.collection('users').where(filter=FieldFilter('email', '==', email)).limit(1)
    docs = list(query.stream())
    if docs:
        user = docs[0].to_dict()
        user['id'] = docs[0].id
        return user
    return None

def get_user_by_id(user_id: str):
    """Get user from Firestore by ID"""
    db = get_db()
    doc = db.collection('users').document(user_id).get()
    if doc.exists:
        user = doc.to_dict()
        user['id'] = doc.id
        return user
    return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: str = payload.get("user_id")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_id(user_id) if user_id else get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    """Ensure current user is an admin"""
    if not current_user.get('is_admin'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.post("/register")
async def register(user_data: dict):
    """Register a new user"""
    db = get_db()
    
    # Check if email exists
    existing = get_user_by_email(user_data.get('email'))
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    doc_ref = db.collection('users').document()
    new_user = {
        "id": doc_ref.id,
        "email": user_data.get('email'),
        "hashed_password": hash_password(user_data.get('password')),
        "full_name": user_data.get('full_name', ''),
        "phone": user_data.get('phone', ''),
        "is_admin": False,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    }
    doc_ref.set(new_user)
    
    # Return without password
    del new_user['hashed_password']
    return new_user

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and get access token"""
    user = get_user_by_email(form_data.username)
    
    if not user or not verify_password(form_data.password, user.get('hashed_password', '')):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['email'], "user_id": user['id']},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    # Remove sensitive data
    user_data = {k: v for k, v in current_user.items() if k != 'hashed_password'}
    return user_data

@router.get("/users")
async def get_users_by_role(
    role: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Get users filtered by role"""
    db = get_db()
    
    try:
        if current_user.get('is_admin'):
            if role == "admin":
                query = db.collection('users').where(filter=FieldFilter('is_admin', '==', True))
            elif role == "customer":
                query = db.collection('users').where(filter=FieldFilter('is_admin', '==', False))
            else:
                query = db.collection('users')
        else:
            # Customers can only see admins (support staff)
            query = db.collection('users').where(filter=FieldFilter('is_admin', '==', True))
        
        docs = query.stream()
        users = []
        for doc in docs:
            u = doc.to_dict()
            users.append({
                "id": doc.id,
                "email": u.get('email'),
                "full_name": u.get('full_name') or u.get('email'),
                "is_admin": u.get('is_admin', False),
                "is_active": u.get('is_active', True),
                "avatar_url": u.get('avatar_url'),
                "created_at": u.get('created_at')
            })
        return users
    except Exception as e:
        print(f"Error fetching users: {e}")
        return []
