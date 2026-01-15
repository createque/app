from fastapi import APIRouter, HTTPException, Request, Depends
from datetime import datetime
from typing import List, Optional
import logging

from models.widget import (
    ElfsightWidget, WidgetCreate, WidgetUpdate,
    WidgetResponse, WidgetPublicResponse, WidgetSection
)
from models.audit_log import AuditLog, AuditAction, EntityType
from middleware.auth_middleware import get_current_user, get_optional_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cms/widgets", tags=["Widgets"])

# Database reference
db = None

def set_db(database):
    """Set the database reference"""
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
    """Create an audit log entry"""
    try:
        audit_log = AuditLog(
            admin_id=admin_id,
            admin_email=admin_email,
            action=action,
            entity_type=EntityType.WIDGET,
            entity_id=entity_id,
            old_values=old_values,
            new_values=new_values,
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent")
        )
        await db.audit_logs.insert_one(audit_log.dict())
    except Exception as e:
        logger.error(f"Failed to create audit log: {e}")


# Public endpoint - get widget for a section
@router.get("/public/{section}", response_model=Optional[WidgetPublicResponse])
async def get_public_widget(section: str):
    """Get active widget for a section (public endpoint for landing page)"""
    try:
        section_enum = WidgetSection(section)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid section: {section}")
    
    widget_doc = await db.widgets.find_one({
        "section_name": section_enum.value,
        "is_active": True,
        "deleted_at": None
    })
    
    if not widget_doc:
        return None
    
    return WidgetPublicResponse(
        section_name=widget_doc["section_name"],
        widget_code=widget_doc["widget_code"],
        is_active=widget_doc["is_active"]
    )


# Admin endpoints
@router.get("", response_model=List[WidgetResponse])
async def list_widgets(
    section: Optional[WidgetSection] = None,
    include_inactive: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """List all widgets (admin only)"""
    query = {"deleted_at": None}
    
    if section:
        query["section_name"] = section.value
    
    if not include_inactive:
        query["is_active"] = True
    
    widgets = await db.widgets.find(query).sort("display_order", 1).to_list(100)
    return [WidgetResponse(**w) for w in widgets]


@router.get("/{widget_id}", response_model=WidgetResponse)
async def get_widget(
    widget_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific widget by ID (admin only)"""
    widget_doc = await db.widgets.find_one({
        "id": widget_id,
        "deleted_at": None
    })
    
    if not widget_doc:
        raise HTTPException(status_code=404, detail="Widget nie znaleziony")
    
    return WidgetResponse(**widget_doc)


@router.post("", response_model=WidgetResponse)
async def create_widget(
    request: Request,
    widget_data: WidgetCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new widget (admin only)"""
    # Check if widget already exists for this section
    existing = await db.widgets.find_one({
        "section_name": widget_data.section_name.value,
        "deleted_at": None
    })
    
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Widget już istnieje dla sekcji: {widget_data.section_name.value}. Użyj aktualizacji zamiast tworzenia nowego."
        )
    
    widget = ElfsightWidget(
        section_name=widget_data.section_name,
        widget_code=widget_data.widget_code,
        widget_name=widget_data.widget_name or f"Widget - {widget_data.section_name.value}",
        is_active=widget_data.is_active,
        display_order=widget_data.display_order,
        created_by=current_user["user_id"]
    )
    
    await db.widgets.insert_one(widget.dict())
    
    # Audit log
    await log_audit(
        action=AuditAction.WIDGET_CREATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=widget.id,
        new_values={"section": widget.section_name.value, "is_active": widget.is_active}
    )
    
    logger.info(f"Widget created for section {widget.section_name.value} by {current_user['email']}")
    
    return WidgetResponse(**widget.dict())


@router.patch("/{widget_id}", response_model=WidgetResponse)
async def update_widget(
    widget_id: str,
    request: Request,
    widget_data: WidgetUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a widget (admin only)"""
    widget_doc = await db.widgets.find_one({
        "id": widget_id,
        "deleted_at": None
    })
    
    if not widget_doc:
        raise HTTPException(status_code=404, detail="Widget nie znaleziony")
    
    # Prepare update data
    update_data = {"updated_at": datetime.utcnow()}
    old_values = {}
    new_values = {}
    
    for field, value in widget_data.dict(exclude_unset=True).items():
        if value is not None:
            old_values[field] = widget_doc.get(field)
            if field == "section_name":
                update_data[field] = value.value
                new_values[field] = value.value
            else:
                update_data[field] = value
                new_values[field] = value
    
    await db.widgets.update_one(
        {"id": widget_id},
        {"$set": update_data}
    )
    
    # Audit log
    await log_audit(
        action=AuditAction.WIDGET_UPDATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=widget_id,
        old_values=old_values,
        new_values=new_values
    )
    
    # Return updated widget
    updated_widget = await db.widgets.find_one({"id": widget_id})
    return WidgetResponse(**updated_widget)


@router.delete("/{widget_id}")
async def delete_widget(
    widget_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Soft delete a widget (admin only)"""
    widget_doc = await db.widgets.find_one({
        "id": widget_id,
        "deleted_at": None
    })
    
    if not widget_doc:
        raise HTTPException(status_code=404, detail="Widget nie znaleziony")
    
    # Soft delete
    await db.widgets.update_one(
        {"id": widget_id},
        {"$set": {
            "deleted_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Audit log
    await log_audit(
        action=AuditAction.WIDGET_DELETE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=widget_id,
        old_values={"section": widget_doc["section_name"]}
    )
    
    return {"success": True, "message": "Widget usunięty"}


@router.patch("/{widget_id}/activate")
async def activate_widget(
    widget_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Activate a widget (admin only)"""
    widget_doc = await db.widgets.find_one({
        "id": widget_id,
        "deleted_at": None
    })
    
    if not widget_doc:
        raise HTTPException(status_code=404, detail="Widget nie znaleziony")
    
    await db.widgets.update_one(
        {"id": widget_id},
        {"$set": {
            "is_active": True,
            "updated_at": datetime.utcnow()
        }}
    )
    
    await log_audit(
        action=AuditAction.WIDGET_ACTIVATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=widget_id
    )
    
    return {"success": True, "message": "Widget aktywowany"}


@router.patch("/{widget_id}/deactivate")
async def deactivate_widget(
    widget_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Deactivate a widget (admin only)"""
    widget_doc = await db.widgets.find_one({
        "id": widget_id,
        "deleted_at": None
    })
    
    if not widget_doc:
        raise HTTPException(status_code=404, detail="Widget nie znaleziony")
    
    await db.widgets.update_one(
        {"id": widget_id},
        {"$set": {
            "is_active": False,
            "updated_at": datetime.utcnow()
        }}
    )
    
    await log_audit(
        action=AuditAction.WIDGET_DEACTIVATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=widget_id
    )
    
    return {"success": True, "message": "Widget dezaktywowany"}


# Get all available sections
@router.get("/sections/available")
async def get_available_sections(current_user: dict = Depends(get_current_user)):
    """Get list of available widget sections"""
    return {
        "sections": [s.value for s in WidgetSection],
        "descriptions": {
            "hero": "Sekcja hero na górze strony",
            "features": "Sekcja funkcji/cech produktu",
            "pricing": "Tabela cenowa",
            "testimonials": "Opinie klientów",
            "faq": "Często zadawane pytania",
            "blog": "Sekcja bloga",
            "gallery": "Galeria zdjęć",
            "contact": "Formularz kontaktowy",
            "footer": "Stopka strony",
            "custom": "Niestandardowa sekcja"
        }
    }
