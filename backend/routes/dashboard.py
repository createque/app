from fastapi import APIRouter, Depends
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/cms/dashboard", tags=["Dashboard"])

db = None

def set_db(database):
    global db
    db = database


@router.get("")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics"""
    # Count pages
    pages_count = await db.pages.count_documents({"deleted_at": None})
    published_pages = await db.pages.count_documents({"deleted_at": None, "status": "published"})
    
    # Count posts
    posts_count = await db.posts.count_documents({"deleted_at": None})
    published_posts = await db.posts.count_documents({"deleted_at": None, "status": "published"})
    
    # Count widgets
    widgets_count = await db.widgets.count_documents({"deleted_at": None})
    active_widgets = await db.widgets.count_documents({"deleted_at": None, "is_active": True})
    
    # Count audit logs
    audit_count = await db.audit_logs.count_documents({})
    
    # Recent activity (last 10 logs)
    recent_logs = await db.audit_logs.find({}).sort("created_at", -1).limit(10).to_list(10)
    
    return {
        "pages": {
            "total": pages_count,
            "published": published_pages,
            "draft": pages_count - published_pages
        },
        "posts": {
            "total": posts_count,
            "published": published_posts,
            "draft": posts_count - published_posts
        },
        "widgets": {
            "total": widgets_count,
            "active": active_widgets,
            "inactive": widgets_count - active_widgets
        },
        "audit_logs": audit_count,
        "recent_activity": [
            {
                "id": log.get("id"),
                "action": log.get("action"),
                "admin_email": log.get("admin_email"),
                "entity_type": log.get("entity_type"),
                "created_at": log.get("created_at").isoformat() if log.get("created_at") else None
            }
            for log in recent_logs
        ]
    }
