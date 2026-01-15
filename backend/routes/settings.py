"""Comprehensive Site Settings Routes for TimeLov CMS"""
from fastapi import APIRouter, HTTPException, Request, Depends, UploadFile, File
from datetime import datetime
from typing import Optional, List
import logging
import uuid
import os
import base64

from models.settings import (
    CompleteSiteSettings, get_default_settings,
    BrandingSettings, BrandingUpdate,
    SEOSettings, SEOUpdate,
    NavigationSettings, NavigationSection, NavigationSectionUpdate,
    IntegrationsSettings, ThirdPartyIntegration, IntegrationUpdate, IntegrationType, InjectionPosition,
    GeneralSettings, GeneralUpdate, CookieConsentSettings
)
from models.audit_log import AuditLog, AuditAction, EntityType
from middleware.auth_middleware import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cms/settings", tags=["Settings"])

db = None

def set_db(database):
    global db
    db = database


async def log_audit(
    action: AuditAction,
    request: Request,
    admin_id: str,
    admin_email: str,
    entity_id: Optional[str] = None,
    old_values: Optional[dict] = None,
    new_values: Optional[dict] = None
):
    try:
        audit_log = AuditLog(
            admin_id=admin_id,
            admin_email=admin_email,
            action=action,
            entity_type=EntityType.SETTING,
            entity_id=entity_id,
            old_values=old_values,
            new_values=new_values,
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent")
        )
        await db.audit_logs.insert_one(audit_log.dict())
    except Exception as e:
        logger.error(f"Failed to create audit log: {e}")


async def get_or_create_settings() -> dict:
    """Get existing settings or create default ones"""
    settings_doc = await db.site_settings.find_one({"_type": "complete_settings"})
    
    if not settings_doc:
        default = get_default_settings()
        settings_dict = default.dict()
        settings_dict["_type"] = "complete_settings"
        await db.site_settings.insert_one(settings_dict)
        settings_doc = settings_dict
    
    settings_doc.pop("_id", None)
    settings_doc.pop("_type", None)
    return settings_doc


# ═══════════════════════════════════════
# GET ALL SETTINGS
# ═══════════════════════════════════════
@router.get("")
async def get_all_settings(current_user: dict = Depends(get_current_user)):
    """Get complete site settings (admin only)"""
    settings = await get_or_create_settings()
    return settings


@router.get("/public")
async def get_public_settings():
    """Get public site settings (no auth required)"""
    settings = await get_or_create_settings()
    
    # Build public settings response
    public = {
        "branding": {
            "logo_url": settings.get("branding", {}).get("logo_url"),
            "logo_alt": settings.get("branding", {}).get("logo_alt", "TimeLov"),
            "favicon_url": settings.get("branding", {}).get("favicon_url"),
            "primary_color": settings.get("branding", {}).get("primary_color", "#0066FF"),
            "secondary_color": settings.get("branding", {}).get("secondary_color", "#00CC88"),
            "accent_color": settings.get("branding", {}).get("accent_color", "#1A1A1A"),
            "font_family": settings.get("branding", {}).get("font_family", "Inter"),
            "site_tagline": settings.get("branding", {}).get("site_tagline", ""),
        },
        "seo": {
            "meta_title": settings.get("seo", {}).get("meta_title", ""),
            "meta_description": settings.get("seo", {}).get("meta_description", ""),
            "meta_keywords": settings.get("seo", {}).get("meta_keywords", ""),
            "og_title": settings.get("seo", {}).get("og_title"),
            "og_description": settings.get("seo", {}).get("og_description"),
            "og_image_url": settings.get("seo", {}).get("og_image_url"),
            "twitter_title": settings.get("seo", {}).get("twitter_title"),
            "twitter_description": settings.get("seo", {}).get("twitter_description"),
            "twitter_image_url": settings.get("seo", {}).get("twitter_image_url"),
        },
        "navigation": {
            "sections": [
                s for s in settings.get("navigation", {}).get("sections", [])
                if s.get("is_enabled", True)
            ]
        },
        "general": {
            "site_name": settings.get("general", {}).get("site_name", "TimeLov"),
            "site_url": settings.get("general", {}).get("site_url", ""),
            "maintenance_mode": settings.get("general", {}).get("maintenance_mode", False),
            "maintenance_message": settings.get("general", {}).get("maintenance_message", ""),
            "cookie_consent": settings.get("general", {}).get("cookie_consent", {}),
        },
        "integrations": {
            "enabled": [
                {
                    "type": i.get("type"),
                    "name": i.get("name"),
                    "code_snippet": i.get("code_snippet"),
                    "injection_position": i.get("injection_position"),
                    "custom_css": i.get("custom_css") if i.get("whitelabel_enabled", True) else None,
                    "url": i.get("url"),
                    "priority": i.get("priority", 10),
                }
                for i in settings.get("integrations", {}).get("integrations", [])
                if i.get("is_enabled", False)
            ]
        }
    }
    
    return public


# ═══════════════════════════════════════
# SEKCJA 1: PERSONALIZACJA (BRANDING)
# ═══════════════════════════════════════
@router.get("/branding")
async def get_branding_settings(current_user: dict = Depends(get_current_user)):
    """Get branding settings"""
    settings = await get_or_create_settings()
    return settings.get("branding", {})


@router.patch("/branding")
async def update_branding_settings(
    request: Request,
    data: BrandingUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update branding settings"""
    settings = await get_or_create_settings()
    old_branding = settings.get("branding", {})
    
    # Update only provided fields
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    new_branding = {**old_branding, **update_data}
    
    await db.site_settings.update_one(
        {"_type": "complete_settings"},
        {
            "$set": {
                "branding": new_branding,
                "updated_at": datetime.utcnow(),
                "updated_by": current_user["user_id"]
            }
        }
    )
    
    await log_audit(
        action=AuditAction.SETTINGS_UPDATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id="branding",
        old_values=old_branding,
        new_values=new_branding
    )
    
    return {"success": True, "message": "Ustawienia brandingu zaktualizowane", "branding": new_branding}


# ═══════════════════════════════════════
# SEKCJA 2: SEO
# ═══════════════════════════════════════
@router.get("/seo")
async def get_seo_settings(current_user: dict = Depends(get_current_user)):
    """Get SEO settings"""
    settings = await get_or_create_settings()
    return settings.get("seo", {})


@router.patch("/seo")
async def update_seo_settings(
    request: Request,
    data: SEOUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update SEO settings"""
    settings = await get_or_create_settings()
    old_seo = settings.get("seo", {})
    
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    new_seo = {**old_seo, **update_data}
    
    await db.site_settings.update_one(
        {"_type": "complete_settings"},
        {
            "$set": {
                "seo": new_seo,
                "updated_at": datetime.utcnow(),
                "updated_by": current_user["user_id"]
            }
        }
    )
    
    await log_audit(
        action=AuditAction.SETTINGS_UPDATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id="seo",
        old_values=old_seo,
        new_values=new_seo
    )
    
    return {"success": True, "message": "Ustawienia SEO zaktualizowane", "seo": new_seo}


# ═══════════════════════════════════════
# SEKCJA 3: NAVIGATION SECTIONS
# ═══════════════════════════════════════
@router.get("/navigation")
async def get_navigation_settings(current_user: dict = Depends(get_current_user)):
    """Get navigation settings"""
    settings = await get_or_create_settings()
    return settings.get("navigation", {"sections": []})


@router.post("/navigation/sections")
async def create_navigation_section(
    request: Request,
    section: NavigationSection,
    current_user: dict = Depends(get_current_user)
):
    """Create a new navigation section"""
    settings = await get_or_create_settings()
    sections = settings.get("navigation", {}).get("sections", [])
    
    # Ensure unique ID
    section.id = str(uuid.uuid4())
    sections.append(section.dict())
    
    await db.site_settings.update_one(
        {"_type": "complete_settings"},
        {
            "$set": {
                "navigation.sections": sections,
                "updated_at": datetime.utcnow(),
                "updated_by": current_user["user_id"]
            }
        }
    )
    
    await log_audit(
        action=AuditAction.CREATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=section.id,
        new_values=section.dict()
    )
    
    return {"success": True, "message": "Sekcja nawigacji utworzona", "section": section.dict()}


@router.patch("/navigation/sections/{section_id}")
async def update_navigation_section(
    request: Request,
    section_id: str,
    data: NavigationSectionUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a navigation section"""
    settings = await get_or_create_settings()
    sections = settings.get("navigation", {}).get("sections", [])
    
    section_idx = next((i for i, s in enumerate(sections) if s.get("id") == section_id), None)
    if section_idx is None:
        raise HTTPException(status_code=404, detail="Sekcja nie znaleziona")
    
    old_section = sections[section_idx]
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    sections[section_idx] = {**old_section, **update_data}
    
    await db.site_settings.update_one(
        {"_type": "complete_settings"},
        {
            "$set": {
                "navigation.sections": sections,
                "updated_at": datetime.utcnow(),
                "updated_by": current_user["user_id"]
            }
        }
    )
    
    await log_audit(
        action=AuditAction.UPDATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=section_id,
        old_values=old_section,
        new_values=sections[section_idx]
    )
    
    return {"success": True, "message": "Sekcja nawigacji zaktualizowana", "section": sections[section_idx]}


@router.delete("/navigation/sections/{section_id}")
async def delete_navigation_section(
    request: Request,
    section_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a navigation section"""
    settings = await get_or_create_settings()
    sections = settings.get("navigation", {}).get("sections", [])
    
    section = next((s for s in sections if s.get("id") == section_id), None)
    if not section:
        raise HTTPException(status_code=404, detail="Sekcja nie znaleziona")
    
    sections = [s for s in sections if s.get("id") != section_id]
    
    await db.site_settings.update_one(
        {"_type": "complete_settings"},
        {
            "$set": {
                "navigation.sections": sections,
                "updated_at": datetime.utcnow(),
                "updated_by": current_user["user_id"]
            }
        }
    )
    
    await log_audit(
        action=AuditAction.DELETE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=section_id,
        old_values=section
    )
    
    return {"success": True, "message": "Sekcja nawigacji usunięta"}


# ═══════════════════════════════════════
# SEKCJA 4: INTEGRATIONS
# ═══════════════════════════════════════
@router.get("/integrations")
async def get_integrations(current_user: dict = Depends(get_current_user)):
    """Get all integrations"""
    settings = await get_or_create_settings()
    return settings.get("integrations", {"integrations": []})


@router.post("/integrations")
async def create_integration(
    request: Request,
    integration: ThirdPartyIntegration,
    current_user: dict = Depends(get_current_user)
):
    """Create a new integration"""
    settings = await get_or_create_settings()
    integrations = settings.get("integrations", {}).get("integrations", [])
    
    integration.id = str(uuid.uuid4())
    integrations.append(integration.dict())
    
    await db.site_settings.update_one(
        {"_type": "complete_settings"},
        {
            "$set": {
                "integrations.integrations": integrations,
                "updated_at": datetime.utcnow(),
                "updated_by": current_user["user_id"]
            }
        }
    )
    
    await log_audit(
        action=AuditAction.CREATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=integration.id,
        new_values={"integration": integration.name}
    )
    
    return {"success": True, "message": "Integracja utworzona", "integration": integration.dict()}


@router.patch("/integrations/{integration_id}")
async def update_integration(
    request: Request,
    integration_id: str,
    data: IntegrationUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update an integration"""
    settings = await get_or_create_settings()
    integrations = settings.get("integrations", {}).get("integrations", [])
    
    int_idx = next((i for i, integ in enumerate(integrations) if integ.get("id") == integration_id), None)
    if int_idx is None:
        raise HTTPException(status_code=404, detail="Integracja nie znaleziona")
    
    old_integration = integrations[int_idx]
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    integrations[int_idx] = {**old_integration, **update_data}
    
    await db.site_settings.update_one(
        {"_type": "complete_settings"},
        {
            "$set": {
                "integrations.integrations": integrations,
                "updated_at": datetime.utcnow(),
                "updated_by": current_user["user_id"]
            }
        }
    )
    
    await log_audit(
        action=AuditAction.UPDATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=integration_id,
        old_values={"name": old_integration.get("name"), "is_enabled": old_integration.get("is_enabled")},
        new_values={"name": integrations[int_idx].get("name"), "is_enabled": integrations[int_idx].get("is_enabled")}
    )
    
    return {"success": True, "message": "Integracja zaktualizowana", "integration": integrations[int_idx]}


@router.delete("/integrations/{integration_id}")
async def delete_integration(
    request: Request,
    integration_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete an integration"""
    settings = await get_or_create_settings()
    integrations = settings.get("integrations", {}).get("integrations", [])
    
    integration = next((i for i in integrations if i.get("id") == integration_id), None)
    if not integration:
        raise HTTPException(status_code=404, detail="Integracja nie znaleziona")
    
    integrations = [i for i in integrations if i.get("id") != integration_id]
    
    await db.site_settings.update_one(
        {"_type": "complete_settings"},
        {
            "$set": {
                "integrations.integrations": integrations,
                "updated_at": datetime.utcnow(),
                "updated_by": current_user["user_id"]
            }
        }
    )
    
    await log_audit(
        action=AuditAction.DELETE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=integration_id,
        old_values={"integration": integration.get("name")}
    )
    
    return {"success": True, "message": "Integracja usunięta"}


@router.patch("/integrations/{integration_id}/toggle")
async def toggle_integration(
    request: Request,
    integration_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Toggle integration enabled/disabled"""
    settings = await get_or_create_settings()
    integrations = settings.get("integrations", {}).get("integrations", [])
    
    int_idx = next((i for i, integ in enumerate(integrations) if integ.get("id") == integration_id), None)
    if int_idx is None:
        raise HTTPException(status_code=404, detail="Integracja nie znaleziona")
    
    old_state = integrations[int_idx].get("is_enabled", False)
    integrations[int_idx]["is_enabled"] = not old_state
    
    await db.site_settings.update_one(
        {"_type": "complete_settings"},
        {
            "$set": {
                "integrations.integrations": integrations,
                "updated_at": datetime.utcnow(),
                "updated_by": current_user["user_id"]
            }
        }
    )
    
    status = "włączona" if integrations[int_idx]["is_enabled"] else "wyłączona"
    return {
        "success": True, 
        "message": f"Integracja {status}", 
        "is_enabled": integrations[int_idx]["is_enabled"]
    }


# ═══════════════════════════════════════
# SEKCJA 5: GENERAL SETTINGS
# ═══════════════════════════════════════
@router.get("/general")
async def get_general_settings(current_user: dict = Depends(get_current_user)):
    """Get general settings"""
    settings = await get_or_create_settings()
    return settings.get("general", {})


@router.patch("/general")
async def update_general_settings(
    request: Request,
    data: GeneralUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update general settings"""
    settings = await get_or_create_settings()
    old_general = settings.get("general", {})
    
    update_data = {}
    for k, v in data.dict().items():
        if v is not None:
            # Handle cookie consent nested fields
            if k.startswith("cookie_consent_"):
                if "cookie_consent" not in update_data:
                    update_data["cookie_consent"] = old_general.get("cookie_consent", {})
                field_name = k.replace("cookie_consent_", "")
                if field_name == "enabled":
                    update_data["cookie_consent"]["is_enabled"] = v
                elif field_name == "message":
                    update_data["cookie_consent"]["message"] = v
            else:
                update_data[k] = v
    
    new_general = {**old_general, **update_data}
    
    await db.site_settings.update_one(
        {"_type": "complete_settings"},
        {
            "$set": {
                "general": new_general,
                "updated_at": datetime.utcnow(),
                "updated_by": current_user["user_id"]
            }
        }
    )
    
    await log_audit(
        action=AuditAction.SETTINGS_UPDATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id="general",
        old_values=old_general,
        new_values=new_general
    )
    
    return {"success": True, "message": "Ustawienia ogólne zaktualizowane", "general": new_general}


# ═══════════════════════════════════════
# FILE UPLOAD
# ═══════════════════════════════════════
@router.post("/upload")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload a file (logo, favicon, OG image)"""
    # Validate file type
    allowed_types = ["image/png", "image/jpeg", "image/gif", "image/svg+xml", "image/x-icon", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Nieprawidłowy typ pliku. Dozwolone: PNG, JPEG, GIF, SVG, ICO, WEBP")
    
    # Validate file size (max 2MB)
    content = await file.read()
    if len(content) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Plik zbyt duży. Maksymalny rozmiar: 2MB")
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    filename = f"{uuid.uuid4()}.{ext}"
    
    # For now, store as base64 in database (in production, use S3 or similar)
    base64_content = base64.b64encode(content).decode('utf-8')
    
    file_doc = {
        "id": str(uuid.uuid4()),
        "filename": filename,
        "original_name": file.filename,
        "content_type": file.content_type,
        "size": len(content),
        "data": base64_content,
        "uploaded_by": current_user["user_id"],
        "uploaded_at": datetime.utcnow()
    }
    
    await db.uploaded_files.insert_one(file_doc)
    
    # Return URL that can be used to retrieve the file
    file_url = f"/api/cms/settings/files/{file_doc['id']}"
    
    return {
        "success": True,
        "file_id": file_doc["id"],
        "filename": filename,
        "url": file_url,
        "size": len(content)
    }


@router.get("/files/{file_id}")
async def get_file(file_id: str):
    """Get an uploaded file"""
    file_doc = await db.uploaded_files.find_one({"id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="Plik nie znaleziony")
    
    content = base64.b64decode(file_doc["data"])
    
    from fastapi.responses import Response
    return Response(
        content=content,
        media_type=file_doc["content_type"],
        headers={
            "Content-Disposition": f"inline; filename={file_doc['filename']}",
            "Cache-Control": "public, max-age=31536000"
        }
    )


# ═══════════════════════════════════════
# RESET TO DEFAULTS
# ═══════════════════════════════════════
@router.post("/reset")
async def reset_to_defaults(
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Reset all settings to defaults"""
    default = get_default_settings()
    
    await db.site_settings.update_one(
        {"_type": "complete_settings"},
        {
            "$set": {
                **default.dict(),
                "_type": "complete_settings",
                "updated_at": datetime.utcnow(),
                "updated_by": current_user["user_id"]
            }
        },
        upsert=True
    )
    
    await log_audit(
        action=AuditAction.SETTINGS_UPDATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id="all",
        new_values={"action": "reset_to_defaults"}
    )
    
    return {"success": True, "message": "Ustawienia przywrócone do domyślnych"}
