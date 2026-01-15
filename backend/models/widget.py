from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import uuid
from enum import Enum
import re


class WidgetSection(str, Enum):
    """Enum for widget placement sections"""
    HERO = "hero"
    FEATURES = "features"
    PRICING = "pricing"
    TESTIMONIALS = "testimonials"
    FAQ = "faq"
    BLOG = "blog"
    GALLERY = "gallery"
    CONTACT = "contact"
    FOOTER = "footer"
    CUSTOM = "custom"


class ElfsightWidget(BaseModel):
    """Model for Elfsight widget configuration"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section_name: WidgetSection
    widget_code: str
    widget_name: Optional[str] = None  # Friendly name for the widget
    is_active: bool = True
    display_order: int = 0
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None  # Soft delete

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class WidgetCreate(BaseModel):
    """Schema for creating a widget"""
    section_name: WidgetSection
    widget_code: str
    widget_name: Optional[str] = None
    is_active: bool = True
    display_order: int = 0

    @validator('widget_code')
    def validate_widget_code(cls, v):
        # Max 50KB
        if len(v) > 50 * 1024:
            raise ValueError('Widget code exceeds 50KB limit')
        
        # Basic XSS prevention - check for dangerous patterns
        dangerous_patterns = [
            r'javascript:',
            r'on\w+\s*=',  # onclick=, onload=, etc.
            r'<script[^>]*>[^<]*(?!elfsight)',  # scripts not from elfsight
        ]
        
        v_lower = v.lower()
        for pattern in dangerous_patterns:
            if re.search(pattern, v_lower) and 'elfsight' not in v_lower:
                raise ValueError('Widget code contains potentially dangerous content')
        
        return v


class WidgetUpdate(BaseModel):
    """Schema for updating a widget"""
    section_name: Optional[WidgetSection] = None
    widget_code: Optional[str] = None
    widget_name: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None

    @validator('widget_code')
    def validate_widget_code(cls, v):
        if v is None:
            return v
        if len(v) > 50 * 1024:
            raise ValueError('Widget code exceeds 50KB limit')
        return v


class WidgetResponse(BaseModel):
    """Schema for widget response"""
    id: str
    section_name: str
    widget_code: str
    widget_name: Optional[str]
    is_active: bool
    display_order: int
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime


class WidgetPublicResponse(BaseModel):
    """Schema for public widget response (limited data)"""
    section_name: str
    widget_code: str
    is_active: bool
