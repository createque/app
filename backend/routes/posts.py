from fastapi import APIRouter, HTTPException, Request, Depends, Query
from datetime import datetime
from typing import List, Optional
import logging

from models.post import (
    Post, PostCreate, PostUpdate, PostResponse, PostListResponse,
    PostStatus, PostCategory, slugify
)
from models.audit_log import AuditLog, AuditAction, EntityType
from middleware.auth_middleware import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cms/posts", tags=["Posts"])

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
            entity_type=EntityType.POST,
            entity_id=entity_id,
            old_values=old_values,
            new_values=new_values,
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent")
        )
        await db.audit_logs.insert_one(audit_log.dict())
    except Exception as e:
        logger.error(f"Failed to create audit log: {e}")


@router.get("", response_model=List[PostListResponse])
async def list_posts(
    status: Optional[PostStatus] = None,
    category: Optional[PostCategory] = None,
    limit: int = Query(50, le=100),
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """List all posts"""
    query = {"deleted_at": None}
    if status:
        query["status"] = status.value
    if category:
        query["category"] = category.value
    
    posts = await db.posts.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return [PostListResponse(**p) for p in posts]


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific post"""
    post = await db.posts.find_one({"id": post_id, "deleted_at": None})
    if not post:
        raise HTTPException(status_code=404, detail="Post nie znaleziony")
    return PostResponse(**post)


@router.post("", response_model=PostResponse)
async def create_post(
    request: Request,
    post_data: PostCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new post"""
    # Generate slug if not provided
    slug = post_data.slug or slugify(post_data.title)
    
    # Ensure unique slug
    base_slug = slug
    counter = 1
    while await db.posts.find_one({"slug": slug, "deleted_at": None}):
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    post = Post(
        slug=slug,
        title=post_data.title,
        excerpt=post_data.excerpt,
        content=post_data.content,
        featured_image_url=post_data.featured_image_url,
        category=post_data.category,
        tags=post_data.tags,
        status=post_data.status,
        created_by=current_user["user_id"]
    )
    
    if post_data.status == PostStatus.PUBLISHED:
        post.published_at = datetime.utcnow()
    
    await db.posts.insert_one(post.dict())
    
    await log_audit(
        action=AuditAction.POST_CREATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=post.id,
        new_values={"slug": post.slug, "title": post.title, "category": post.category.value}
    )
    
    return PostResponse(**post.dict())


@router.patch("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: str,
    request: Request,
    post_data: PostUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a post"""
    post = await db.posts.find_one({"id": post_id, "deleted_at": None})
    if not post:
        raise HTTPException(status_code=404, detail="Post nie znaleziony")
    
    update_data = {"updated_at": datetime.utcnow()}
    old_values = {}
    new_values = {}
    
    for field, value in post_data.dict(exclude_unset=True).items():
        if value is not None:
            old_values[field] = post.get(field)
            if field in ["status", "category"]:
                update_data[field] = value.value
                new_values[field] = value.value
                if field == "status" and value == PostStatus.PUBLISHED and post.get("status") != "published":
                    update_data["published_at"] = datetime.utcnow()
            else:
                update_data[field] = value
                new_values[field] = value
    
    await db.posts.update_one({"id": post_id}, {"$set": update_data})
    
    await log_audit(
        action=AuditAction.POST_UPDATE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=post_id,
        old_values=old_values,
        new_values=new_values
    )
    
    updated_post = await db.posts.find_one({"id": post_id})
    return PostResponse(**updated_post)


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Soft delete a post"""
    post = await db.posts.find_one({"id": post_id, "deleted_at": None})
    if not post:
        raise HTTPException(status_code=404, detail="Post nie znaleziony")
    
    await db.posts.update_one(
        {"id": post_id},
        {"$set": {"deleted_at": datetime.utcnow(), "updated_at": datetime.utcnow()}}
    )
    
    await log_audit(
        action=AuditAction.POST_DELETE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=post_id,
        old_values={"slug": post["slug"], "title": post["title"]}
    )
    
    return {"success": True, "message": "Post usunięty"}


@router.patch("/{post_id}/publish")
async def publish_post(
    post_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Publish a post"""
    post = await db.posts.find_one({"id": post_id, "deleted_at": None})
    if not post:
        raise HTTPException(status_code=404, detail="Post nie znaleziony")
    
    await db.posts.update_one(
        {"id": post_id},
        {"$set": {
            "status": PostStatus.PUBLISHED.value,
            "published_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }}
    )
    
    await log_audit(
        action=AuditAction.POST_PUBLISH,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=post_id
    )
    
    return {"success": True, "message": "Post opublikowany"}


@router.patch("/{post_id}/archive")
async def archive_post(
    post_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Archive a post"""
    post = await db.posts.find_one({"id": post_id, "deleted_at": None})
    if not post:
        raise HTTPException(status_code=404, detail="Post nie znaleziony")
    
    await db.posts.update_one(
        {"id": post_id},
        {"$set": {
            "status": PostStatus.ARCHIVED.value,
            "updated_at": datetime.utcnow()
        }}
    )
    
    await log_audit(
        action=AuditAction.POST_ARCHIVE,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"],
        entity_id=post_id
    )
    
    return {"success": True, "message": "Post zarchiwizowany"}


@router.post("/batch/publish")
async def batch_publish(
    request: Request,
    post_ids: List[str],
    current_user: dict = Depends(get_current_user)
):
    """Publish multiple posts"""
    updated = 0
    for post_id in post_ids:
        result = await db.posts.update_one(
            {"id": post_id, "deleted_at": None},
            {"$set": {
                "status": PostStatus.PUBLISHED.value,
                "published_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }}
        )
        if result.modified_count > 0:
            updated += 1
    
    return {"success": True, "message": f"Opublikowano {updated} postów"}


@router.post("/batch/archive")
async def batch_archive(
    request: Request,
    post_ids: List[str],
    current_user: dict = Depends(get_current_user)
):
    """Archive multiple posts"""
    updated = 0
    for post_id in post_ids:
        result = await db.posts.update_one(
            {"id": post_id, "deleted_at": None},
            {"$set": {
                "status": PostStatus.ARCHIVED.value,
                "updated_at": datetime.utcnow()
            }}
        )
        if result.modified_count > 0:
            updated += 1
    
    return {"success": True, "message": f"Zarchiwizowano {updated} postów"}


# Public endpoints
@router.get("/public/list")
async def list_public_posts(
    category: Optional[PostCategory] = None,
    limit: int = Query(10, le=50),
    skip: int = 0
):
    """List published posts (public endpoint)"""
    query = {"status": PostStatus.PUBLISHED.value, "deleted_at": None}
    if category:
        query["category"] = category.value
    
    posts = await db.posts.find(query).sort("published_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return [{
        "slug": p["slug"],
        "title": p["title"],
        "excerpt": p.get("excerpt"),
        "featured_image_url": p.get("featured_image_url"),
        "category": p["category"],
        "tags": p.get("tags", []),
        "published_at": p.get("published_at")
    } for p in posts]


@router.get("/public/{slug}")
async def get_public_post(slug: str):
    """Get published post by slug (public endpoint)"""
    post = await db.posts.find_one({
        "slug": slug,
        "status": PostStatus.PUBLISHED.value,
        "deleted_at": None
    })
    
    if not post:
        raise HTTPException(status_code=404, detail="Post nie znaleziony")
    
    return {
        "slug": post["slug"],
        "title": post["title"],
        "excerpt": post.get("excerpt"),
        "content": post["content"],
        "featured_image_url": post.get("featured_image_url"),
        "category": post["category"],
        "tags": post.get("tags", []),
        "published_at": post.get("published_at")
    }


# Get categories
@router.get("/meta/categories")
async def get_categories(current_user: dict = Depends(get_current_user)):
    """Get list of post categories"""
    return {
        "categories": [
            {"value": c.value, "label": c.value.capitalize()}
            for c in PostCategory
        ]
    }
