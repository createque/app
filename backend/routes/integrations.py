"""
Routes for Third-Party Integrations
Supports automatic CSS application based on integration type
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import HTMLResponse
from typing import Optional, List
from datetime import datetime
import logging

from models.widget import (
    ThirdPartyIntegration, IntegrationCreate, IntegrationUpdate, IntegrationResponse,
    IntegrationType, WidgetSection, InjectionPosition, get_integration_type_info
)
from models.audit_log import AuditLog, AuditAction, EntityType
from middleware.auth_middleware import get_current_user
from templates.css_templates import get_css_for_type, get_all_css_types, generate_css_variables

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cms/integrations", tags=["Integrations"])

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
    """Create audit log entry"""
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


# ═══════════════════════════════════════
# INTEGRATION TYPES INFO
# ═══════════════════════════════════════

@router.get("/types")
async def get_integration_types():
    """Get all available integration types with metadata"""
    return {
        "types": get_integration_type_info(),
        "sections": [s.value for s in WidgetSection],
        "positions": [p.value for p in InjectionPosition]
    }


@router.get("/css-templates")
async def get_css_templates():
    """Get all available CSS templates"""
    templates = {}
    for css_type in get_all_css_types():
        templates[css_type] = get_css_for_type(css_type)
    return {
        "templates": templates,
        "css_variables": generate_css_variables()
    }


@router.get("/css-template/{integration_type}")
async def get_css_template(integration_type: str):
    """Get CSS template for a specific integration type"""
    css = get_css_for_type(integration_type.upper())
    if not css:
        raise HTTPException(status_code=404, detail="CSS template not found")
    return {
        "type": integration_type,
        "css": css
    }


# ═══════════════════════════════════════
# CRUD OPERATIONS
# ═══════════════════════════════════════

@router.post("", response_model=dict)
async def create_integration(
    request: Request,
    data: IntegrationCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new third-party integration"""
    integration = ThirdPartyIntegration(
        integration_type=data.integration_type,
        integration_name=data.integration_name,
        widget_code=data.widget_code,
        section_name=data.section_name,
        injection_position=data.injection_position,
        is_active=data.is_active,
        priority_order=data.priority_order,
        custom_css_override=data.custom_css_override,
        config=data.config,
        created_by=current_user["user_id"]
    )
    
    await db.integrations.insert_one(integration.dict())
    
    await log_audit(
        action=AuditAction.INTEGRATION_CREATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=integration.id,
        new_values={"name": integration.integration_name, "type": integration.integration_type.value}
    )
    
    logger.info(f"Integration created: {integration.integration_name} ({integration.integration_type})")
    
    return {
        "success": True,
        "message": "Integracja utworzona",
        "integration": {
            **integration.dict(),
            "css_template": integration.get_css_template(),
            "rendered_html": integration.get_rendered_html()
        }
    }


@router.get("")
async def list_integrations(
    include_inactive: bool = False,
    section: Optional[str] = None,
    integration_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all integrations"""
    query = {}
    
    if not include_inactive:
        query["is_active"] = True
    
    if section:
        query["section_name"] = section
    
    if integration_type:
        query["integration_type"] = integration_type.upper()
    
    cursor = db.integrations.find(query).sort("priority_order", 1)
    integrations = await cursor.to_list(length=100)
    
    result = []
    for integ in integrations:
        integ.pop("_id", None)
        # Add computed fields
        try:
            obj = ThirdPartyIntegration(**integ)
            integ["css_template"] = obj.get_css_template()
        except:
            integ["css_template"] = ""
        result.append(integ)
    
    return result


@router.get("/public")
async def list_public_integrations(
    section: Optional[str] = None,
    position: Optional[str] = None
):
    """List active integrations for public rendering (no auth required)"""
    query = {"is_active": True}
    
    if section:
        query["section_name"] = section
    
    if position:
        query["injection_position"] = position
    
    cursor = db.integrations.find(query).sort("priority_order", 1)
    integrations = await cursor.to_list(length=100)
    
    result = []
    for integ in integrations:
        integ.pop("_id", None)
        try:
            obj = ThirdPartyIntegration(**integ)
            result.append({
                "id": obj.id,
                "type": obj.integration_type.value,
                "name": obj.integration_name,
                "section": obj.section_name.value if obj.section_name else None,
                "position": obj.injection_position.value,
                "priority": obj.priority_order,
                "widget_code": obj.widget_code,
                "css": obj.get_final_css(),
                "rendered_html": obj.get_rendered_html()
            })
        except Exception as e:
            logger.error(f"Error processing integration: {e}")
    
    return result


@router.get("/render")
async def render_integrations_html(position: Optional[str] = None):
    """Get rendered HTML for all active integrations at given position"""
    query = {"is_active": True}
    
    if position:
        query["injection_position"] = position
    
    cursor = db.integrations.find(query).sort("priority_order", 1)
    integrations = await cursor.to_list(length=100)
    
    html_parts = []
    css_parts = [generate_css_variables()]
    
    for integ in integrations:
        try:
            obj = ThirdPartyIntegration(**{k: v for k, v in integ.items() if k != "_id"})
            css_parts.append(obj.get_final_css())
            html_parts.append(obj.get_rendered_html())
        except Exception as e:
            logger.error(f"Error rendering integration: {e}")
    
    combined_css = "\n".join(css_parts)
    combined_html = "\n".join(html_parts)
    
    return {
        "css": combined_css,
        "html": combined_html,
        "count": len(html_parts)
    }


@router.get("/{integration_id}")
async def get_integration(
    integration_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a single integration by ID"""
    integ = await db.integrations.find_one({"id": integration_id})
    
    if not integ:
        raise HTTPException(status_code=404, detail="Integracja nie znaleziona")
    
    integ.pop("_id", None)
    
    try:
        obj = ThirdPartyIntegration(**integ)
        return {
            **integ,
            "css_template": obj.get_css_template(),
            "final_css": obj.get_final_css(),
            "rendered_html": obj.get_rendered_html()
        }
    except:
        return integ


@router.patch("/{integration_id}")
async def update_integration(
    request: Request,
    integration_id: str,
    data: IntegrationUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update an integration"""
    integ = await db.integrations.find_one({"id": integration_id})
    
    if not integ:
        raise HTTPException(status_code=404, detail="Integracja nie znaleziona")
    
    old_name = integ.get("integration_name")
    
    # Build update dict
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.integrations.update_one(
        {"id": integration_id},
        {"$set": update_data}
    )
    
    await log_audit(
        action=AuditAction.INTEGRATION_UPDATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=integration_id,
        old_values={"name": old_name},
        new_values=update_data
    )
    
    # Get updated integration
    updated = await db.integrations.find_one({"id": integration_id})
    updated.pop("_id", None)
    
    try:
        obj = ThirdPartyIntegration(**updated)
        return {
            "success": True,
            "message": "Integracja zaktualizowana",
            "integration": {
                **updated,
                "css_template": obj.get_css_template(),
                "rendered_html": obj.get_rendered_html()
            }
        }
    except:
        return {"success": True, "message": "Integracja zaktualizowana", "integration": updated}


@router.delete("/{integration_id}")
async def delete_integration(
    request: Request,
    integration_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete an integration"""
    integ = await db.integrations.find_one({"id": integration_id})
    
    if not integ:
        raise HTTPException(status_code=404, detail="Integracja nie znaleziona")
    
    await db.integrations.delete_one({"id": integration_id})
    
    await log_audit(
        action=AuditAction.INTEGRATION_DELETE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=integration_id,
        old_values={"name": integ.get("integration_name")}
    )
    
    return {"success": True, "message": "Integracja usunięta"}


@router.patch("/{integration_id}/toggle")
async def toggle_integration(
    request: Request,
    integration_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Toggle integration active status"""
    integ = await db.integrations.find_one({"id": integration_id})
    
    if not integ:
        raise HTTPException(status_code=404, detail="Integracja nie znaleziona")
    
    new_status = not integ.get("is_active", False)
    
    await db.integrations.update_one(
        {"id": integration_id},
        {
            "$set": {
                "is_active": new_status,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    await log_audit(
        action=AuditAction.INTEGRATION_TOGGLE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=integration_id,
        old_values={"is_active": not new_status},
        new_values={"is_active": new_status}
    )
    
    status = "aktywowana" if new_status else "dezaktywowana"
    return {
        "success": True,
        "message": f"Integracja {status}",
        "is_active": new_status
    }


@router.get("/{integration_id}/preview")
async def preview_integration(
    integration_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get HTML preview of an integration"""
    integ = await db.integrations.find_one({"id": integration_id})
    
    if not integ:
        raise HTTPException(status_code=404, detail="Integracja nie znaleziona")
    
    integ.pop("_id", None)
    
    try:
        obj = ThirdPartyIntegration(**integ)
        
        html = f"""
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview: {obj.integration_name}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {{
            box-sizing: border-box;
        }}
        body {{
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            min-height: 100vh;
        }}
        .preview-header {{
            background: linear-gradient(135deg, #1a5f7a 0%, #0066FF 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px 12px 0 0;
            margin-bottom: 0;
        }}
        .preview-header h1 {{
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }}
        .preview-header p {{
            margin: 4px 0 0;
            opacity: 0.8;
            font-size: 14px;
        }}
        .preview-container {{
            background: white;
            border-radius: 0 0 12px 12px;
            padding: 24px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }}
        
        /* Integration CSS */
        {obj.get_final_css()}
    </style>
</head>
<body>
    <div class="preview-header">
        <h1>{obj.integration_name}</h1>
        <p>Typ: {obj.integration_type.value} | Pozycja: {obj.injection_position.value}</p>
    </div>
    <div class="preview-container">
        {obj.widget_code}
    </div>
</body>
</html>
"""
        return HTMLResponse(content=html, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating preview: {str(e)}")
