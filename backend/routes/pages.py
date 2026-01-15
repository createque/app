from fastapi import APIRouter, HTTPException, Request, Depends, Query
from datetime import datetime
from typing import List, Optional
import logging

from models.page import (
    Page, PageCreate, PageUpdate, PageResponse, PageStatus
)
from models.audit_log import AuditLog, AuditAction, EntityType
from middleware.auth_middleware import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cms/pages", tags=["Pages"])

# Database reference
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
            entity_type=EntityType.PAGE,
            entity_id=entity_id,
            old_values=old_values,
            new_values=new_values,
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent")
        )
        await db.audit_logs.insert_one(audit_log.dict())
    except Exception as e:
        logger.error(f"Failed to create audit log: {e}")


@router.get("", response_model=List[PageResponse])
async def list_pages(
    status: Optional[PageStatus] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all pages"""
    query = {"deleted_at": None}
    if status:
        query["status"] = status.value
    
    pages = await db.pages.find(query).sort("created_at", -1).to_list(100)
    return [PageResponse(**p) for p in pages]


@router.get("/{page_id}", response_model=PageResponse)
async def get_page(
    page_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific page"""
    page = await db.pages.find_one({"id": page_id, "deleted_at": None})
    if not page:
        raise HTTPException(status_code=404, detail="Strona nie znaleziona")
    return PageResponse(**page)


@router.post("", response_model=PageResponse)
async def create_page(
    request: Request,
    page_data: PageCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new page"""
    # Check for duplicate slug
    existing = await db.pages.find_one({"slug": page_data.slug, "deleted_at": None})
    if existing:
        raise HTTPException(status_code=400, detail=f"Strona z takim slugiem już istnieje: {page_data.slug}")
    
    page = Page(
        slug=page_data.slug,
        title=page_data.title,
        meta_description=page_data.meta_description,
        content=page_data.content,
        status=page_data.status,
        created_by=current_user["user_id"]
    )
    
    if page_data.status == PageStatus.PUBLISHED:
        page.published_at = datetime.utcnow()
    
    await db.pages.insert_one(page.dict())
    
    await log_audit(
        action=AuditAction.PAGE_CREATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=page.id,
        new_values={"slug": page.slug, "title": page.title, "status": page.status.value}
    )
    
    return PageResponse(**page.dict())


@router.patch("/{page_id}", response_model=PageResponse)
async def update_page(
    page_id: str,
    request: Request,
    page_data: PageUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a page"""
    page = await db.pages.find_one({"id": page_id, "deleted_at": None})
    if not page:
        raise HTTPException(status_code=404, detail="Strona nie znaleziona")
    
    # Check for duplicate slug if changing
    if page_data.slug and page_data.slug != page["slug"]:
        existing = await db.pages.find_one({"slug": page_data.slug, "deleted_at": None, "id": {"$ne": page_id}})
        if existing:
            raise HTTPException(status_code=400, detail=f"Strona z takim slugiem już istnieje: {page_data.slug}")
    
    update_data = {"updated_at": datetime.utcnow()}
    old_values = {}
    new_values = {}
    
    for field, value in page_data.dict(exclude_unset=True).items():
        if value is not None:
            old_values[field] = page.get(field)
            if field == "status":
                update_data[field] = value.value
                new_values[field] = value.value
                if value == PageStatus.PUBLISHED and page.get("status") != "published":
                    update_data["published_at"] = datetime.utcnow()
            else:
                update_data[field] = value
                new_values[field] = value
    
    await db.pages.update_one({"id": page_id}, {"$set": update_data})
    
    await log_audit(
        action=AuditAction.PAGE_UPDATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=page_id,
        old_values=old_values,
        new_values=new_values
    )
    
    updated_page = await db.pages.find_one({"id": page_id})
    return PageResponse(**updated_page)


@router.delete("/{page_id}")
async def delete_page(
    page_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Soft delete a page"""
    page = await db.pages.find_one({"id": page_id, "deleted_at": None})
    if not page:
        raise HTTPException(status_code=404, detail="Strona nie znaleziona")
    
    await db.pages.update_one(
        {"id": page_id},
        {"$set": {"deleted_at": datetime.utcnow(), "updated_at": datetime.utcnow()}}
    )
    
    await log_audit(
        action=AuditAction.PAGE_DELETE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=page_id,
        old_values={"slug": page["slug"], "title": page["title"]}
    )
    
    return {"success": True, "message": "Strona usunięta"}


@router.patch("/{page_id}/publish")
async def publish_page(
    page_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Publish a page"""
    page = await db.pages.find_one({"id": page_id, "deleted_at": None})
    if not page:
        raise HTTPException(status_code=404, detail="Strona nie znaleziona")
    
    await db.pages.update_one(
        {"id": page_id},
        {"$set": {
            "status": PageStatus.PUBLISHED.value,
            "published_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }}
    )
    
    await log_audit(
        action=AuditAction.PAGE_PUBLISH,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=page_id
    )
    
    return {"success": True, "message": "Strona opublikowana"}


@router.patch("/{page_id}/unpublish")
async def unpublish_page(
    page_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Unpublish a page (set to draft)"""
    page = await db.pages.find_one({"id": page_id, "deleted_at": None})
    if not page:
        raise HTTPException(status_code=404, detail="Strona nie znaleziona")
    
    await db.pages.update_one(
        {"id": page_id},
        {"$set": {
            "status": PageStatus.DRAFT.value,
            "updated_at": datetime.utcnow()
        }}
    )
    
    await log_audit(
        action=AuditAction.PAGE_UNPUBLISH,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=page_id
    )
    
    return {"success": True, "message": "Strona cofnięta do wersji roboczej"}


# Public endpoint for frontend
@router.get("/public/{slug:path}")
async def get_public_page(slug: str):
    """Get published page by slug (public endpoint)"""
    if not slug.startswith('/'):
        slug = '/' + slug
    
    page = await db.pages.find_one({
        "slug": slug,
        "status": PageStatus.PUBLISHED.value,
        "deleted_at": None
    })
    
    if not page:
        raise HTTPException(status_code=404, detail="Strona nie znaleziona")
    
    return {
        "slug": page["slug"],
        "title": page["title"],
        "meta_description": page.get("meta_description"),
        "content": page["content"]
    }
