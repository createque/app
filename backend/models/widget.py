"""
Widget and Third-Party Integration Models for TimeLov CMS
Supports Elfsight, Frill, LiveAgent, Tacu.cool, Malcolm and more
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from enum import Enum
import re


# ═══════════════════════════════════════
# ENUMS
# ═══════════════════════════════════════

class IntegrationType(str, Enum):
    """Types of 3rd party integrations with automatic CSS support"""
    # Elfsight Widgets
    ELFSIGHT_REVIEWS = "ELFSIGHT_REVIEWS"
    ELFSIGHT_INSTAGRAM = "ELFSIGHT_INSTAGRAM"
    ELFSIGHT_FACEBOOK = "ELFSIGHT_FACEBOOK"
    ELFSIGHT_TESTIMONIALS = "ELFSIGHT_TESTIMONIALS"
    ELFSIGHT_PRICING = "ELFSIGHT_PRICING"
    ELFSIGHT_FAQ = "ELFSIGHT_FAQ"
    ELFSIGHT_FORM = "ELFSIGHT_FORM"
    
    # Roadmap & Docs
    FRILL_ROADMAP = "FRILL_ROADMAP"
    MALCOLM_DOCS = "MALCOLM_DOCS"
    
    # Chat & Support
    LIVEAGENT_CHAT = "LIVEAGENT_CHAT"
    CRISP_CHAT = "CRISP_CHAT"
    INTERCOM_CHAT = "INTERCOM_CHAT"
    
    # Engagement
    TACU_POPUP = "TACU_POPUP"
    TACU_BANNER = "TACU_BANNER"
    
    # Custom
    CUSTOM = "CUSTOM"


class WidgetSection(str, Enum):
    """Widget placement sections on landing page"""
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


class InjectionPosition(str, Enum):
    """Where to inject the widget code in HTML"""
    HEADER = "header"  # Inside <head>
    AFTER_BODY_OPEN = "after_body_open"  # Right after <body>
    BEFORE_BODY_CLOSE = "before_body_close"  # Right before </body>
    FOOTER = "footer"  # In footer section
    INLINE = "inline"  # Inline in specific section


# ═══════════════════════════════════════
# VALIDATION HELPERS
# ═══════════════════════════════════════

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
    'platform.twitter.com',
    'frill.co',
    'widget.frill.co',
    'liveagent.com',
    'cdn.liveagent.com',
    'tacu.cool',
    'cdn.tacu.cool',
    'malcolm.app',
    'crisp.chat',
    'client.crisp.chat',
    'intercom.io',
    'widget.intercom.io',
]


def validate_widget_code(code: str) -> str:
    """Validate and sanitize widget code"""
    if not code:
        return code
    
    # Check size (max 100KB)
    if len(code) > 100 * 1024:
        raise ValueError('Widget code exceeds 100KB limit')
    
    # Check for dangerous patterns (but allow scripts from trusted sources)
    code_lower = code.lower()
    
    dangerous_patterns = [
        (r'javascript:', 'JavaScript URLs are not allowed'),
        (r'data:', 'Data URLs are not allowed'),
        (r'vbscript:', 'VBScript URLs are not allowed'),
    ]
    
    for pattern, message in dangerous_patterns:
        if re.search(pattern, code_lower):
            # Check if it's from a trusted source
            is_trusted = any(source in code_lower for source in TRUSTED_SOURCES)
            if not is_trusted:
                raise ValueError(message)
    
    return code


# ═══════════════════════════════════════
# THIRD PARTY INTEGRATION MODEL
# ═══════════════════════════════════════

class ThirdPartyIntegration(BaseModel):
    """
    Universal model for all 3rd party integrations.
    CSS is automatically applied based on integration_type.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Type determines automatic CSS
    integration_type: IntegrationType
    
    # User-friendly name (e.g., "Google Reviews Widget")
    integration_name: str
    
    # Raw HTML/JS/iframe code from external service
    widget_code: str
    
    # Positioning
    section_name: Optional[WidgetSection] = None
    injection_position: InjectionPosition = InjectionPosition.BEFORE_BODY_CLOSE
    
    # Status and ordering
    is_active: bool = True
    priority_order: int = 0  # Lower = loads first
    
    # Optional custom CSS override
    custom_css_override: Optional[str] = None
    
    # Configuration for specific integrations
    config: Dict[str, Any] = {}
    
    # Metadata
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('widget_code')
    def validate_code(cls, v):
        return validate_widget_code(v)
    
    def get_css_template(self) -> str:
        """Get automatic CSS template for this integration type"""
        from templates.css_templates import get_css_for_type
        return get_css_for_type(self.integration_type.value)
    
    def get_final_css(self) -> str:
        """Get final CSS (template + optional override)"""
        template_css = self.get_css_template()
        
        if self.custom_css_override:
            return f"{template_css}\n\n/* Custom Override */\n{self.custom_css_override}"
        
        return template_css
    
    def get_rendered_html(self) -> str:
        """Get widget code wrapped with CSS"""
        css = self.get_final_css()
        
        # Generate unique ID for this widget
        widget_id = f"timelove-widget-{self.id[:8]}"
        
        html = f"""
<!-- TimeLov Integration: {self.integration_name} -->
<div id="{widget_id}" class="timelove-widget timelove-{self.integration_type.value.lower().replace('_', '-')}">
    <style>
        #{widget_id} {{
            /* Scoped styles */
        }}
        {css}
    </style>
    {self.widget_code}
</div>
<!-- End: {self.integration_name} -->
"""
        return html

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


# ═══════════════════════════════════════
# CREATE/UPDATE SCHEMAS
# ═══════════════════════════════════════

class IntegrationCreate(BaseModel):
    """Schema for creating a new integration"""
    integration_type: IntegrationType
    integration_name: str
    widget_code: str
    section_name: Optional[WidgetSection] = None
    injection_position: InjectionPosition = InjectionPosition.BEFORE_BODY_CLOSE
    is_active: bool = True
    priority_order: int = 0
    custom_css_override: Optional[str] = None
    config: Dict[str, Any] = {}
    
    @validator('widget_code')
    def validate_code(cls, v):
        return validate_widget_code(v)


class IntegrationUpdate(BaseModel):
    """Schema for updating an integration"""
    integration_name: Optional[str] = None
    widget_code: Optional[str] = None
    section_name: Optional[WidgetSection] = None
    injection_position: Optional[InjectionPosition] = None
    is_active: Optional[bool] = None
    priority_order: Optional[int] = None
    custom_css_override: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    
    @validator('widget_code')
    def validate_code(cls, v):
        if v is not None:
            return validate_widget_code(v)
        return v


class IntegrationResponse(BaseModel):
    """Schema for integration API response"""
    id: str
    integration_type: str
    integration_name: str
    widget_code: str
    section_name: Optional[str]
    injection_position: str
    is_active: bool
    priority_order: int
    custom_css_override: Optional[str]
    config: Dict[str, Any]
    # Auto-generated
    css_template: str
    rendered_html: str
    created_at: datetime
    updated_at: datetime


# ═══════════════════════════════════════
# LEGACY ELFSIGHT WIDGET MODEL (for backward compatibility)
# ═══════════════════════════════════════

class ElfsightWidget(BaseModel):
    """Legacy widget model - use ThirdPartyIntegration for new code"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section_name: WidgetSection
    widget_code: str
    widget_name: Optional[str] = None
    is_active: bool = True
    display_order: int = 0
    created_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None

    @validator('widget_code')
    def validate_code(cls, v):
        return validate_widget_code(v)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class WidgetCreate(BaseModel):
    """Schema for creating a widget (legacy)"""
    section_name: WidgetSection
    widget_code: str
    widget_name: Optional[str] = None
    is_active: bool = True
    display_order: int = 0

    @validator('widget_code')
    def validate_code(cls, v):
        return validate_widget_code(v)


class WidgetUpdate(BaseModel):
    """Schema for updating a widget (legacy)"""
    section_name: Optional[WidgetSection] = None
    widget_code: Optional[str] = None
    widget_name: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None

    @validator('widget_code')
    def validate_code(cls, v):
        if v is not None:
            return validate_widget_code(v)
        return v


class WidgetResponse(BaseModel):
    """Schema for widget API response (legacy)"""
    id: str
    section_name: str
    widget_code: str
    widget_name: Optional[str]
    is_active: bool
    display_order: int
    created_at: datetime
    updated_at: datetime


class WidgetPublicResponse(BaseModel):
    """Schema for public widget response (legacy)"""
    section_name: str
    widget_code: str
    widget_name: Optional[str]
    is_active: bool


# ═══════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════

def get_integration_type_info() -> List[Dict[str, Any]]:
    """Get information about all integration types"""
    type_info = {
        IntegrationType.ELFSIGHT_REVIEWS: {
            "name": "Elfsight Reviews",
            "description": "Google/Facebook/Yelp reviews widget",
            "category": "reviews",
            "recommended_position": InjectionPosition.INLINE
        },
        IntegrationType.ELFSIGHT_INSTAGRAM: {
            "name": "Elfsight Instagram Feed",
            "description": "Instagram feed widget",
            "category": "social",
            "recommended_position": InjectionPosition.INLINE
        },
        IntegrationType.ELFSIGHT_FACEBOOK: {
            "name": "Elfsight Facebook Feed",
            "description": "Facebook page feed widget",
            "category": "social",
            "recommended_position": InjectionPosition.INLINE
        },
        IntegrationType.ELFSIGHT_TESTIMONIALS: {
            "name": "Elfsight Testimonials",
            "description": "Customer testimonials slider",
            "category": "reviews",
            "recommended_position": InjectionPosition.INLINE
        },
        IntegrationType.ELFSIGHT_PRICING: {
            "name": "Elfsight Pricing Table",
            "description": "Pricing comparison table",
            "category": "pricing",
            "recommended_position": InjectionPosition.INLINE
        },
        IntegrationType.ELFSIGHT_FAQ: {
            "name": "Elfsight FAQ",
            "description": "FAQ accordion widget",
            "category": "content",
            "recommended_position": InjectionPosition.INLINE
        },
        IntegrationType.ELFSIGHT_FORM: {
            "name": "Elfsight Form Builder",
            "description": "Contact/subscription form",
            "category": "forms",
            "recommended_position": InjectionPosition.INLINE
        },
        IntegrationType.FRILL_ROADMAP: {
            "name": "Frill Roadmap",
            "description": "Product roadmap and feedback",
            "category": "feedback",
            "recommended_position": InjectionPosition.INLINE
        },
        IntegrationType.MALCOLM_DOCS: {
            "name": "Malcolm Knowledge Base",
            "description": "Documentation/help center",
            "category": "support",
            "recommended_position": InjectionPosition.INLINE
        },
        IntegrationType.LIVEAGENT_CHAT: {
            "name": "LiveAgent Chat",
            "description": "Live chat support widget",
            "category": "chat",
            "recommended_position": InjectionPosition.BEFORE_BODY_CLOSE
        },
        IntegrationType.CRISP_CHAT: {
            "name": "Crisp Chat",
            "description": "Crisp live chat widget",
            "category": "chat",
            "recommended_position": InjectionPosition.BEFORE_BODY_CLOSE
        },
        IntegrationType.INTERCOM_CHAT: {
            "name": "Intercom",
            "description": "Intercom messenger widget",
            "category": "chat",
            "recommended_position": InjectionPosition.BEFORE_BODY_CLOSE
        },
        IntegrationType.TACU_POPUP: {
            "name": "Tacu.cool Popup",
            "description": "Engagement popup/modal",
            "category": "engagement",
            "recommended_position": InjectionPosition.BEFORE_BODY_CLOSE
        },
        IntegrationType.TACU_BANNER: {
            "name": "Tacu.cool Banner",
            "description": "Sticky banner/bar",
            "category": "engagement",
            "recommended_position": InjectionPosition.AFTER_BODY_OPEN
        },
        IntegrationType.CUSTOM: {
            "name": "Custom Integration",
            "description": "Any other widget or integration",
            "category": "other",
            "recommended_position": InjectionPosition.BEFORE_BODY_CLOSE
        },
    }
    
    return [
        {
            "type": t.value,
            **type_info.get(t, {"name": t.value, "description": "", "category": "other"})
        }
        for t in IntegrationType
    ]
