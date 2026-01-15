"""User authentication routes for TimeLov App (public users, not admin)"""
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime, timedelta
import uuid
import bcrypt
import jwt
import os
import logging
import re

# Import database
from server import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth/user", tags=["User Auth"])

# JWT settings
JWT_SECRET = os.environ.get("JWT_SECRET_KEY", "timelov_user_secret_key")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=100)
    company_name: Optional[str] = None

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Hasło musi mieć minimum 8 znaków')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Hasło musi zawierać wielką literę')
        if not re.search(r'[0-9]', v):
            raise ValueError('Hasło musi zawierać cyfrę')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Hasło musi zawierać znak specjalny')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    company_name: Optional[str]
    created_at: datetime
    is_active: bool


def hash_password(password: str) -> str:
    """Hash password using bcrypt with 12 rounds"""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def create_token(user_id: str, email: str, expires_delta: timedelta) -> str:
    """Create JWT token"""
    expire = datetime.utcnow() + expires_delta
    to_encode = {
        "sub": user_id,
        "email": email,
        "exp": expire,
        "type": "user"
    }
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


@router.post("/register")
async def register_user(user_data: UserRegister, request: Request):
    """Register a new user account"""
    # Check if email already exists
    existing = await db.app_users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email już zarejestrowany")

    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email.lower(),
        "password_hash": hash_password(user_data.password),
        "full_name": user_data.full_name,
        "company_name": user_data.company_name,
        "is_active": True,
        "is_verified": False,  # Email verification pending
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "last_login": None,
        "login_count": 0,
        "subscription_tier": "free",
        "trial_ends_at": datetime.utcnow() + timedelta(days=14)
    }

    await db.app_users.insert_one(user_doc)

    logger.info(f"New user registered: {user_data.email}")

    return {
        "success": True,
        "message": "Konto zostało utworzone",
        "user_id": user_id
    }


@router.post("/login")
async def login_user(credentials: UserLogin, request: Request):
    """Login user and return tokens"""
    # Find user
    user = await db.app_users.find_one({"email": credentials.email.lower()})
    
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Nieprawidłowy email lub hasło")

    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Konto zostało dezaktywowane")

    # Update login info
    await db.app_users.update_one(
        {"id": user["id"]},
        {
            "$set": {
                "last_login": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            "$inc": {"login_count": 1}
        }
    )

    # Create tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS if credentials.remember_me else 1)

    access_token = create_token(user["id"], user["email"], access_token_expires)
    refresh_token = create_token(user["id"], user["email"], refresh_token_expires)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "company_name": user.get("company_name"),
            "subscription_tier": user.get("subscription_tier", "free"),
            "trial_ends_at": user.get("trial_ends_at")
        }
    }


@router.post("/refresh")
async def refresh_user_token(refresh_token: str):
    """Refresh access token"""
    try:
        payload = jwt.decode(refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id or payload.get("type") != "user":
            raise HTTPException(status_code=401, detail="Token nieprawidłowy")

        # Verify user still exists and is active
        user = await db.app_users.find_one({"id": user_id, "is_active": True})
        if not user:
            raise HTTPException(status_code=401, detail="Użytkownik nie istnieje")

        # Create new tokens
        access_token = create_token(user_id, email, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        new_refresh_token = create_token(user_id, email, timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))

        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token wygasł")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token nieprawidłowy")
