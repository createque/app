"""Comprehensive Site Settings Models for TimeLov CMS"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid
import re


class InjectionPosition(str, Enum):
    """Where to inject 3rd party code"""
    HEADER = "header"
    FOOTER = "footer"
    BEFORE_BODY_CLOSE = "before_body_close"
    AFTER_BODY_OPEN = "after_body_open"
    CUSTOM = "custom"


class IntegrationType(str, Enum):
    """Types of 3rd party integrations"""
    FRILL = "frill"
    MALCOLM = "malcolm"
    TACU = "tacu"
    LIVE_AGENT = "live_agent"
    ELFSIGHT = "elfsight"
    GOOGLE_ANALYTICS = "google_analytics"
    GTM = "gtm"
    CUSTOM = "custom"


# ═══════════════════════════════════════
# SEKCJA 1: PERSONALIZACJA STRONY
# ═══════════════════════════════════════
class BrandingSettings(BaseModel):
    """Site branding and personalization"""
    logo_url: Optional[str] = None
    logo_alt: str = "TimeLov"
    favicon_url: Optional[str] = None
    primary_color: str = "#0066FF"
    secondary_color: str = "#00CC88"
    accent_color: str = "#1A1A1A"
    font_family: str = "Inter"
    base_font_size: str = "16px"
    site_tagline: str = "Centralna kontrola zasobami, ludźmi i procesami"
    meta_description: str = "TimeLov - kompleksowe narzędzie do zarządzania zespołem. Wizualny kalendarz, QR check-in, gamifikacja."


# ═══════════════════════════════════════
# SEKCJA 2: USTAWIENIA SEO
# ═══════════════════════════════════════
class SEOSettings(BaseModel):
    """SEO and meta tags settings"""
    meta_title: str = "TimeLov - Zarządzanie zespołem"
    meta_description: str = "Kompleksowe narzędzie do zarządzania zespołem. Wizualny kalendarz + QR + testy + ewaluacje + gamifikacja."
    meta_keywords: str = "zarządzanie zespołem, kalendarz, QR, gamifikacja, HR, team management"
    
    # Open Graph
    og_title: Optional[str] = None
    og_description: Optional[str] = None
    og_image_url: Optional[str] = None
    og_type: str = "website"
    
    # Twitter Cards
    twitter_title: Optional[str] = None
    twitter_description: Optional[str] = None
    twitter_image_url: Optional[str] = None
    twitter_card_type: str = "summary_large_image"
    
    # Analytics
    google_analytics_id: Optional[str] = None
    gtm_id: Optional[str] = None
    
    # Custom head code (for additional scripts)
    custom_head_code: Optional[str] = None


# ═══════════════════════════════════════
# SEKCJA 3: SYSTEM MODUŁOWY (Sections)
# ═══════════════════════════════════════
class NavigationSection(BaseModel):
    """Configuration for a navigation section"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # Internal name
    display_name: str  # Display name in UI
    url: str  # URL or route
    is_external: bool = False
    is_enabled: bool = True
    icon: Optional[str] = None
    order: int = 0
    show_in_navbar: bool = True
    show_in_footer: bool = True


class NavigationSettings(BaseModel):
    """All navigation sections"""
    sections: List[NavigationSection] = []


# ═══════════════════════════════════════
# SEKCJA 4: INTEGRACJE 3RD PARTY
# ═══════════════════════════════════════
class ThirdPartyIntegration(BaseModel):
    """Configuration for a 3rd party integration"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: IntegrationType
    is_enabled: bool = False
    code_snippet: Optional[str] = None
    injection_position: InjectionPosition = InjectionPosition.FOOTER
    custom_css: Optional[str] = None
    url: Optional[str] = None  # For iframe-based integrations
    priority: int = 10  # Lower = loads first
    whitelabel_enabled: bool = True
    config: Dict[str, Any] = {}  # Additional configuration
    
    @validator('code_snippet')
    def validate_code_snippet(cls, v):
        if v and len(v) > 100 * 1024:  # 100KB limit
            raise ValueError('Code snippet exceeds 100KB limit')
        return v


class IntegrationsSettings(BaseModel):
    """All 3rd party integrations"""
    integrations: List[ThirdPartyIntegration] = []


# ═══════════════════════════════════════
# SEKCJA 5: USTAWIENIA STRONY
# ═══════════════════════════════════════
class CookieConsentSettings(BaseModel):
    """Cookie consent configuration"""
    is_enabled: bool = True
    message: str = "Ta strona używa plików cookies, aby zapewnić najlepsze doświadczenie użytkownika."
    privacy_policy_url: str = "/privacy-policy"
    accept_button_text: str = "Akceptuję"
    decline_button_text: str = "Odmawiam"


class GeneralSettings(BaseModel):
    """General site settings"""
    site_name: str = "TimeLov"
    site_url: str = "https://timelov.pl"
    admin_email: str = "admin@timelov.pl"
    support_email: str = "support@timelov.pl"
    maintenance_mode: bool = False
    maintenance_message: str = "Strona jest obecnie w trakcie konserwacji. Przepraszamy za utrudnienia."
    cookie_consent: CookieConsentSettings = CookieConsentSettings()


# ═══════════════════════════════════════
# COMPLETE SETTINGS MODEL
# ═══════════════════════════════════════
class CompleteSiteSettings(BaseModel):
    """Complete site settings structure"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    branding: BrandingSettings = BrandingSettings()
    seo: SEOSettings = SEOSettings()
    navigation: NavigationSettings = NavigationSettings()
    integrations: IntegrationsSettings = IntegrationsSettings()
    general: GeneralSettings = GeneralSettings()
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: Optional[str] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


# ═══════════════════════════════════════
# DEFAULT SETTINGS
# ═══════════════════════════════════════
def get_default_settings() -> CompleteSiteSettings:
    """Get default site settings with all sections and integrations"""
    return CompleteSiteSettings(
        branding=BrandingSettings(),
        seo=SEOSettings(),
        navigation=NavigationSettings(
            sections=[
                NavigationSection(
                    name="signup",
                    display_name="Rejestracja",
                    url="/signup",
                    is_external=False,
                    is_enabled=True,
                    order=1,
                    show_in_navbar=True,
                    show_in_footer=False
                ),
                NavigationSection(
                    name="signin",
                    display_name="Logowanie",
                    url="/signin",
                    is_external=False,
                    is_enabled=True,
                    order=2,
                    show_in_navbar=True,
                    show_in_footer=False
                ),
                NavigationSection(
                    name="demo",
                    display_name="Demo",
                    url="/demo",
                    is_external=False,
                    is_enabled=True,
                    order=3,
                    show_in_navbar=True,
                    show_in_footer=True
                ),
                NavigationSection(
                    name="roadmap",
                    display_name="Roadmap",
                    url="https://roadmap.timelove.pl",
                    is_external=True,
                    is_enabled=True,
                    order=4,
                    show_in_navbar=True,
                    show_in_footer=True
                ),
                NavigationSection(
                    name="docs",
                    display_name="Dokumentacja",
                    url="https://docs.timelove.pl",
                    is_external=True,
                    is_enabled=True,
                    order=5,
                    show_in_navbar=True,
                    show_in_footer=True
                ),
            ]
        ),
        integrations=IntegrationsSettings(
            integrations=[
                ThirdPartyIntegration(
                    name="Frill.co Roadmap",
                    type=IntegrationType.FRILL,
                    is_enabled=False,
                    url="https://roadmap.timelove.pl",
                    injection_position=InjectionPosition.CUSTOM,
                    priority=10,
                    custom_css="""
/* Frill WhiteLabel CSS for TimeLov */
.frill-widget {
    font-family: 'Inter', sans-serif !important;
    --frill-primary: #0066FF !important;
    --frill-secondary: #00CC88 !important;
}
""",
                    config={"embed_type": "iframe"}
                ),
                ThirdPartyIntegration(
                    name="Malcolm Knowledge Base",
                    type=IntegrationType.MALCOLM,
                    is_enabled=False,
                    url="https://docs.timelove.pl",
                    injection_position=InjectionPosition.CUSTOM,
                    priority=20,
                    custom_css="""
/* Malcolm WhiteLabel CSS for TimeLov */
.malcolm-widget {
    font-family: 'Inter', sans-serif !important;
    --malcolm-primary: #0066FF !important;
}
""",
                    config={"embed_type": "iframe"}
                ),
                ThirdPartyIntegration(
                    name="Tacu.cool Engagement",
                    type=IntegrationType.TACU,
                    is_enabled=False,
                    injection_position=InjectionPosition.BEFORE_BODY_CLOSE,
                    priority=30,
                    custom_css="""
/* Tacu.cool WhiteLabel CSS for TimeLov */
.tacu-widget {
    font-family: 'Inter', sans-serif !important;
}
.tacu-popup {
    border-radius: 12px !important;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2) !important;
}
""",
                    config={"site_id": ""}
                ),
                ThirdPartyIntegration(
                    name="LiveAgent Support Chat",
                    type=IntegrationType.LIVE_AGENT,
                    is_enabled=False,
                    injection_position=InjectionPosition.BEFORE_BODY_CLOSE,
                    priority=40,
                    custom_css="""
/* LiveAgent WhiteLabel CSS for TimeLov */
.la-widget-button {
    background-color: #0066FF !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 20px rgba(0,102,255,0.3) !important;
}
.la-widget-chat {
    font-family: 'Inter', sans-serif !important;
    border-radius: 12px !important;
}
""",
                    config={"account_id": "", "button_color": "#0066FF"}
                ),
                ThirdPartyIntegration(
                    name="Google Analytics",
                    type=IntegrationType.GOOGLE_ANALYTICS,
                    is_enabled=False,
                    injection_position=InjectionPosition.HEADER,
                    priority=1,
                    config={"tracking_id": ""}
                ),
                ThirdPartyIntegration(
                    name="Google Tag Manager",
                    type=IntegrationType.GTM,
                    is_enabled=False,
                    injection_position=InjectionPosition.HEADER,
                    priority=2,
                    config={"container_id": ""}
                ),
            ]
        ),
        general=GeneralSettings()
    )


# ═══════════════════════════════════════
# UPDATE SCHEMAS
# ═══════════════════════════════════════
class BrandingUpdate(BaseModel):
    """Schema for updating branding settings"""
    logo_url: Optional[str] = None
    logo_alt: Optional[str] = None
    favicon_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None
    font_family: Optional[str] = None
    base_font_size: Optional[str] = None
    site_tagline: Optional[str] = None
    meta_description: Optional[str] = None


class SEOUpdate(BaseModel):
    """Schema for updating SEO settings"""
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    og_title: Optional[str] = None
    og_description: Optional[str] = None
    og_image_url: Optional[str] = None
    twitter_title: Optional[str] = None
    twitter_description: Optional[str] = None
    twitter_image_url: Optional[str] = None
    google_analytics_id: Optional[str] = None
    gtm_id: Optional[str] = None
    custom_head_code: Optional[str] = None


class NavigationSectionUpdate(BaseModel):
    """Schema for updating a navigation section"""
    display_name: Optional[str] = None
    url: Optional[str] = None
    is_external: Optional[bool] = None
    is_enabled: Optional[bool] = None
    icon: Optional[str] = None
    order: Optional[int] = None
    show_in_navbar: Optional[bool] = None
    show_in_footer: Optional[bool] = None


class IntegrationUpdate(BaseModel):
    """Schema for updating an integration"""
    name: Optional[str] = None
    is_enabled: Optional[bool] = None
    code_snippet: Optional[str] = None
    injection_position: Optional[InjectionPosition] = None
    custom_css: Optional[str] = None
    url: Optional[str] = None
    priority: Optional[int] = None
    whitelabel_enabled: Optional[bool] = None
    config: Optional[Dict[str, Any]] = None


class GeneralUpdate(BaseModel):
    """Schema for updating general settings"""
    site_name: Optional[str] = None
    site_url: Optional[str] = None
    admin_email: Optional[str] = None
    support_email: Optional[str] = None
    maintenance_mode: Optional[bool] = None
    maintenance_message: Optional[str] = None
    cookie_consent_enabled: Optional[bool] = None
    cookie_consent_message: Optional[str] = None
    privacy_policy_url: Optional[str] = None
