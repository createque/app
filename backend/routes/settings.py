from fastapi import APIRouter, HTTPException, Request, Depends
from datetime import datetime
from typing import Optional
import logging

from models.settings import SiteSetting, SettingUpdate, SettingsResponse, DEFAULT_SETTINGS
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
    old_values: Optional[dict] = None,
    new_values: Optional[dict] = None
):
    try:
        audit_log = AuditLog(
            admin_id=admin_id,
            admin_email=admin_email,
            action=action,
            entity_type=EntityType.SETTING,
            old_values=old_values,
            new_values=new_values,
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent")
        )
        await db.audit_logs.insert_one(audit_log.dict())
    except Exception as e:
        logger.error(f"Failed to create audit log: {e}")


async def ensure_default_settings():
    """Ensure default settings exist"""
    for key, value in DEFAULT_SETTINGS.items():
        existing = await db.settings.find_one({"setting_key": key})
        if not existing:
            setting = SiteSetting(setting_key=key, setting_value=value)
            await db.settings.insert_one(setting.dict())


@router.get("", response_model=SettingsResponse)
async def get_settings(current_user: dict = Depends(get_current_user)):
    """Get all site settings"""
    await ensure_default_settings()
    
    settings = await db.settings.find({}).to_list(100)
    
    result = {}
    for s in settings:
        key = s["setting_key"]
        value = s["setting_value"]
        if key == "maintenance_mode":
            result[key] = value.lower() == "true"
        else:
            result[key] = value
    
    return SettingsResponse(**result)


@router.patch("")
async def update_settings(
    request: Request,
    settings_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update site settings"""
    await ensure_default_settings()
    
    old_values = {}
    new_values = {}
    
    for key, value in settings_data.items():
        if key not in DEFAULT_SETTINGS:
            continue
        
        # Get current value
        current = await db.settings.find_one({"setting_key": key})
        if current:
            old_values[key] = current["setting_value"]
        
        # Convert boolean to string for maintenance_mode
        if isinstance(value, bool):
            value = str(value).lower()
        
        new_values[key] = value
        
        await db.settings.update_one(
            {"setting_key": key},
            {"$set": {
                "setting_value": value,
                "updated_at": datetime.utcnow(),
                "updated_by": current_user["user_id"]
            }},
            upsert=True
        )
    
    if new_values:
        await log_audit(
            action=AuditAction.SETTINGS_UPDATE,
            request=request,
            admin_id=current_user["user_id"],
            admin_email=current_user["email"],
            old_values=old_values,
            new_values=new_values
        )
    
    return {"success": True, "message": "Ustawienia zaktualizowane"}


@router.get("/public")
async def get_public_settings():
    """Get public site settings (no auth required)"""
    await ensure_default_settings()
    
    settings = await db.settings.find({}).to_list(100)
    
    result = {}
    for s in settings:
        key = s["setting_key"]
        value = s["setting_value"]
        # Only expose certain settings publicly
        if key in ["site_name", "site_description", "maintenance_mode"]:
            if key == "maintenance_mode":
                result[key] = value.lower() == "true"
            else:
                result[key] = value
    
    return result
