from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
import uuid
from enum import Enum
import re


class PostStatus(str, Enum):
    """Enum for post status"""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class PostCategory(str, Enum):
    """Enum for post categories"""
    MUZYKA = "muzyka"
    TECHNOLOGIA = "technologia"
    NEWS = "news"
    PORADNIK = "poradnik"
    INNE = "inne"


class Post(BaseModel):
    """Model for blog posts"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: str
    excerpt: Optional[str] = None  # Short summary, max 255 chars
    content: str = ""
    featured_image_url: Optional[str] = None
    category: PostCategory = PostCategory.INNE
    tags: List[str] = []
    status: PostStatus = PostStatus.DRAFT
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None  # Soft delete

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug"""
    # Convert to lowercase
    text = text.lower()
    # Replace Polish characters
    polish_chars = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
        'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z'
    }
    for polish, ascii_char in polish_chars.items():
        text = text.replace(polish, ascii_char)
    # Replace spaces and special chars with hyphens
    text = re.sub(r'[^a-z0-9]+', '-', text)
    # Remove leading/trailing hyphens
    text = text.strip('-')
    return text


class PostCreate(BaseModel):
    """Schema for creating a post"""
    title: str
    slug: Optional[str] = None  # Auto-generated if not provided
    excerpt: Optional[str] = None
    content: str = ""
    featured_image_url: Optional[str] = None
    category: PostCategory = PostCategory.INNE
    tags: List[str] = []
    status: PostStatus = PostStatus.DRAFT

    @validator('title')
    def validate_title(cls, v):
        if len(v) > 255:
            raise ValueError('Tytuł nie może przekraczać 255 znaków')
        return v

    @validator('excerpt')
    def validate_excerpt(cls, v):
        if v and len(v) > 255:
            raise ValueError('Excerpt nie może przekraczać 255 znaków')
        return v

    @validator('content')
    def validate_content(cls, v):
        if len(v) > 100 * 1024:  # 100KB
            raise ValueError('Treść nie może przekraczać 100KB')
        return v

    @validator('slug', always=True)
    def validate_or_generate_slug(cls, v, values):
        if v:
            v = slugify(v)
        elif 'title' in values:
            v = slugify(values['title'])
        return v


class PostUpdate(BaseModel):
    """Schema for updating a post"""
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    featured_image_url: Optional[str] = None
    category: Optional[PostCategory] = None
    tags: Optional[List[str]] = None
    status: Optional[PostStatus] = None


class PostResponse(BaseModel):
    """Schema for post response"""
    id: str
    slug: str
    title: str
    excerpt: Optional[str]
    content: str
    featured_image_url: Optional[str]
    category: str
    tags: List[str]
    status: str
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime]


class PostListResponse(BaseModel):
    """Schema for post list item (without full content)"""
    id: str
    slug: str
    title: str
    excerpt: Optional[str]
    featured_image_url: Optional[str]
    category: str
    tags: List[str]
    status: str
    created_at: datetime
    published_at: Optional[datetime]
