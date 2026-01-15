from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
import uuid


class AdminUser(BaseModel):
    """Admin user model for authentication"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    password_hash: str
    is_active: bool = True
    is_superadmin: bool = False
    last_login: Optional[datetime] = None
    failed_login_attempts: int = 0
    locked_until: Optional[datetime] = None
    password_reset_token: Optional[str] = None
    password_reset_expires: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class AdminUserCreate(BaseModel):
    """Schema for creating admin user"""
    email: EmailStr
    username: str
    password: str


class AdminUserLogin(BaseModel):
    """Schema for login request"""
    email: EmailStr
    password: str
    remember_me: bool = False


class AdminUserResponse(BaseModel):
    """Schema for user response (without sensitive data)"""
    id: str
    email: EmailStr
    username: str
    is_active: bool
    is_superadmin: bool
    last_login: Optional[datetime] = None
    created_at: datetime


class TokenResponse(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request"""
    refresh_token: str


class PasswordResetRequest(BaseModel):
    """Schema for password reset request"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Schema for password reset confirmation"""
    token: str
    new_password: str
