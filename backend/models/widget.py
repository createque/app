from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import uuid
from enum import Enum
import re
import html


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


# Whitelist of allowed HTML tags for widget code
ALLOWED_TAGS = {
    'div', 'span', 'p', 'a', 'img', 'iframe', 'script', 'style',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'br', 'hr',
    'table', 'tr', 'td', 'th', 'thead', 'tbody',
    'form', 'input', 'button', 'label', 'select', 'option', 'textarea',
    'section', 'article', 'header', 'footer', 'nav', 'aside', 'main',
    'figure', 'figcaption', 'picture', 'source', 'video', 'audio',
    'svg', 'path', 'circle', 'rect', 'line', 'polygon', 'polyline', 'g', 'defs', 'use'
}

# Trusted sources for iframes and scripts
TRUSTED_SOURCES = [
    'elfsight.com',
    'static.elfsight.com',
    'apps.elfsight.com',
    'widget.elfsight.com',
    'youtube.com',
    'www.youtube.com',
    'player.vimeo.com',
    'google.com',
    'www.google.com',
    'googletagmanager.com',
    'facebook.com',
    'www.facebook.com',
    'twitter.com',
    'platform.twitter.com'
]


def sanitize_widget_code(code: str) -> str:
    """Sanitize widget code while preserving Elfsight functionality"""
    # Check for potentially dangerous patterns (excluding trusted sources)
    dangerous_patterns = [
        (r'javascript:', 'JavaScript URLs are not allowed'),
        (r'data:', 'Data URLs are not allowed'),
        (r'vbscript:', 'VBScript URLs are not allowed'),
    ]
    
    code_lower = code.lower()
    
    for pattern, message in dangerous_patterns:
        if re.search(pattern, code_lower):
            # Allow if it's within an Elfsight context
            if 'elfsight' not in code_lower:
                raise ValueError(message)
    
    return code


def validate_iframe_sources(code: str) -> bool:
    """Validate that iframe sources are from trusted domains"""
    iframe_pattern = r'<iframe[^>]*src=["\']([^"\']+)["\']'
    matches = re.findall(iframe_pattern, code, re.IGNORECASE)
    
    for src in matches:
        if src.startswith('https://'):
            domain = src.split('/')[2]
            if not any(trusted in domain for trusted in TRUSTED_SOURCES):
                raise ValueError(f'Iframe source not from trusted domain: {domain}')
        elif not src.startswith('//'):
            raise ValueError('Iframe sources must use HTTPS')
    
    return True


def validate_script_sources(code: str) -> bool:
    """Validate that script sources are from trusted domains"""
    script_pattern = r'<script[^>]*src=["\']([^"\']+)["\']'
    matches = re.findall(script_pattern, code, re.IGNORECASE)
    
    for src in matches:
        if src.startswith('https://') or src.startswith('//'):
            domain = src.replace('//', '').split('/')[0]
            if not any(trusted in domain for trusted in TRUSTED_SOURCES):
                raise ValueError(f'Script source not from trusted domain: {domain}')
        else:
            raise ValueError('Script sources must use HTTPS')
    
    return True


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
