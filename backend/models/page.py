from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import uuid
from enum import Enum
import re


class PageStatus(str, Enum):
    """Enum for page status"""
    DRAFT = "draft"
    PUBLISHED = "published"


class Page(BaseModel):
    """Model for CMS pages"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str  # URL slug like "/o-nas", "/kontakt"
    title: str
    meta_description: Optional[str] = None
    content: str = ""
    status: PageStatus = PageStatus.DRAFT
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None  # Soft delete

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class PageCreate(BaseModel):
    """Schema for creating a page"""
    slug: str
    title: str
    meta_description: Optional[str] = None
    content: str = ""
    status: PageStatus = PageStatus.DRAFT

    @validator('slug')
    def validate_slug(cls, v):
        # Ensure slug starts with /
        if not v.startswith('/'):
            v = '/' + v
        # Convert to lowercase, replace spaces with hyphens
        v = v.lower().replace(' ', '-')
        # Only allow lowercase letters, numbers, hyphens, and slashes
        if not re.match(r'^/[a-z0-9-/]*$', v):
            raise ValueError('Slug może zawierać tylko małe litery, cyfry, myślniki i ukośniki')
        return v

    @validator('title')
    def validate_title(cls, v):
        if len(v) > 255:
            raise ValueError('Tytuł nie może przekraczać 255 znaków')
        return v

    @validator('meta_description')
    def validate_meta_description(cls, v):
        if v and len(v) > 160:
            raise ValueError('Meta description nie może przekraczać 160 znaków')
        return v

    @validator('content')
    def validate_content(cls, v):
        if len(v) > 100 * 1024:  # 100KB
            raise ValueError('Treść nie może przekraczać 100KB')
        return v


class PageUpdate(BaseModel):
    """Schema for updating a page"""
    slug: Optional[str] = None
    title: Optional[str] = None
    meta_description: Optional[str] = None
    content: Optional[str] = None
    status: Optional[PageStatus] = None

    @validator('slug')
    def validate_slug(cls, v):
        if v is None:
            return v
        if not v.startswith('/'):
            v = '/' + v
        v = v.lower().replace(' ', '-')
        if not re.match(r'^/[a-z0-9-/]*$', v):
            raise ValueError('Slug może zawierać tylko małe litery, cyfry, myślniki i ukośniki')
        return v


class PageResponse(BaseModel):
    """Schema for page response"""
    id: str
    slug: str
    title: str
    meta_description: Optional[str]
    content: str
    status: str
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]
