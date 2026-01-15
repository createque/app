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


@router.get("/{widget_id}/preview")
async def preview_widget(
    widget_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get widget HTML preview (admin only)"""
    widget_doc = await db.widgets.find_one({
        "id": widget_id,
        "deleted_at": None
    })
    
    if not widget_doc:
        raise HTTPException(status_code=404, detail="Widget nie znaleziony")
    
    # Return HTML preview with basic wrapper
    html_preview = f"""
    <!DOCTYPE html>
    <html lang="pl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Widget Preview - {widget_doc.get('widget_name', widget_doc['section_name'])}</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background: #f5f5f5;
            }}
            .widget-container {{
                background: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
        </style>
    </head>
    <body>
        <div class="widget-container">
            {widget_doc['widget_code']}
        </div>
    </body>
    </html>
    """
    
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=html_preview, status_code=200)


# Seed endpoint for initial widgets
@router.post("/seed", include_in_schema=False)
async def seed_widgets(current_user: dict = Depends(get_current_user)):
    """Seed example widgets (admin only, one-time setup)"""
    # Check if widgets already exist
    existing = await db.widgets.count_documents({"deleted_at": None})
    if existing > 0:
        return {"message": "Widgets already exist", "count": existing}
    
    # Example Elfsight widget codes (placeholders - replace with real codes)
    sample_widgets = [
        {
            "section_name": "pricing",
            "widget_name": "Pricing Table Widget",
            "widget_code": '''<script src="https://static.elfsight.com/platform/platform.js" data-use-service-core defer></script>
<div class="elfsight-app-pricing-placeholder" style="min-height: 400px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
    <div style="text-align: center; padding: 40px;">
        <h3 style="margin: 0 0 10px 0; font-size: 24px;">📊 Pricing Widget</h3>
        <p style="margin: 0; opacity: 0.8;">Wklej prawdziwy kod Elfsight Pricing Widget tutaj</p>
    </div>
</div>''',
            "is_active": True,
            "display_order": 1
        },
        {
            "section_name": "testimonials",
            "widget_name": "Reviews Widget",
            "widget_code": '''<script src="https://static.elfsight.com/platform/platform.js" data-use-service-core defer></script>
<div class="elfsight-app-reviews-placeholder" style="min-height: 350px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); border-radius: 12px; color: white;">
    <div style="text-align: center; padding: 40px;">
        <h3 style="margin: 0 0 10px 0; font-size: 24px;">⭐ Reviews Widget</h3>
        <p style="margin: 0; opacity: 0.8;">Wklej prawdziwy kod Elfsight Reviews Widget tutaj</p>
    </div>
</div>''',
            "is_active": True,
            "display_order": 2
        },
        {
            "section_name": "faq",
            "widget_name": "FAQ Accordion Widget",
            "widget_code": '''<script src="https://static.elfsight.com/platform/platform.js" data-use-service-core defer></script>
<div class="elfsight-app-faq-placeholder" style="min-height: 300px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; color: white;">
    <div style="text-align: center; padding: 40px;">
        <h3 style="margin: 0 0 10px 0; font-size: 24px;">❓ FAQ Widget</h3>
        <p style="margin: 0; opacity: 0.8;">Wklej prawdziwy kod Elfsight FAQ Widget tutaj</p>
    </div>
</div>''',
            "is_active": True,
            "display_order": 3
        },
        {
            "section_name": "contact",
            "widget_name": "Newsletter Form Widget",
            "widget_code": '''<script src="https://static.elfsight.com/platform/platform.js" data-use-service-core defer></script>
<div class="elfsight-app-form-placeholder" style="min-height: 250px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); border-radius: 12px; color: white;">
    <div style="text-align: center; padding: 40px;">
        <h3 style="margin: 0 0 10px 0; font-size: 24px;">📧 Form Widget</h3>
        <p style="margin: 0; opacity: 0.8;">Wklej prawdziwy kod Elfsight Form Widget tutaj</p>
    </div>
</div>''',
            "is_active": True,
            "display_order": 4
        },
        {
            "section_name": "blog",
            "widget_name": "Blog Feed Widget",
            "widget_code": '''<script src="https://static.elfsight.com/platform/platform.js" data-use-service-core defer></script>
<div class="elfsight-app-blog-placeholder" style="min-height: 400px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); border-radius: 12px; color: white;">
    <div style="text-align: center; padding: 40px;">
        <h3 style="margin: 0 0 10px 0; font-size: 24px;">📝 Blog Widget</h3>
        <p style="margin: 0; opacity: 0.8;">Wklej prawdziwy kod Elfsight Blog Widget tutaj</p>
    </div>
</div>''',
            "is_active": True,
            "display_order": 5
        }
    ]
    
    created = 0
    for widget_data in sample_widgets:
        widget = ElfsightWidget(
            section_name=WidgetSection(widget_data["section_name"]),
            widget_code=widget_data["widget_code"],
            widget_name=widget_data["widget_name"],
            is_active=widget_data["is_active"],
            display_order=widget_data["display_order"],
            created_by=current_user["user_id"]
        )
        await db.widgets.insert_one(widget.dict())
        created += 1
    
    logger.info(f"Seeded {created} example widgets")
    return {"success": True, "message": f"Created {created} example widgets"}
