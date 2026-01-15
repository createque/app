from fastapi import APIRouter, Depends, Query
from datetime import datetime
from typing import Optional, List
import logging
import csv
import io
from fastapi.responses import StreamingResponse

from models.audit_log import AuditLogResponse, AuditAction, EntityType
from middleware.auth_middleware import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/cms/audit-logs", tags=["Audit Logs"])

db = None

def set_db(database):
    global db
    db = database


@router.get("", response_model=List[AuditLogResponse])
async def list_audit_logs(
    action: Optional[AuditAction] = None,
    entity_type: Optional[EntityType] = None,
    admin_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = Query(100, le=500),
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """List audit logs with filtering"""
    query = {}
    
    if action:
        query["action"] = action.value
    if entity_type:
        query["entity_type"] = entity_type.value
    if admin_id:
        query["admin_id"] = admin_id
    if start_date:
        query["created_at"] = {"$gte": start_date}
    if end_date:
        if "created_at" in query:
            query["created_at"]["$lte"] = end_date
        else:
            query["created_at"] = {"$lte": end_date}
    
    logs = await db.audit_logs.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return [AuditLogResponse(**log) for log in logs]


@router.get("/export")
async def export_audit_logs(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: dict = Depends(get_current_user)
):
    """Export audit logs as CSV"""
    query = {}
    
    if start_date:
        query["created_at"] = {"$gte": start_date}
    if end_date:
        if "created_at" in query:
            query["created_at"]["$lte"] = end_date
        else:
            query["created_at"] = {"$lte": end_date}
    
    logs = await db.audit_logs.find(query).sort("created_at", -1).to_list(10000)
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "ID", "Admin Email", "Action", "Entity Type", "Entity ID",
        "IP Address", "User Agent", "Created At"
    ])
    
    # Data
    for log in logs:
        writer.writerow([
            log.get("id", ""),
            log.get("admin_email", ""),
            log.get("action", ""),
            log.get("entity_type", ""),
            log.get("entity_id", ""),
            log.get("ip_address", ""),
            log.get("user_agent", "")[:100] if log.get("user_agent") else "",
            log.get("created_at", "").isoformat() if log.get("created_at") else ""
        ])
    
    output.seek(0)
    
    filename = f"audit_logs_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/stats")
async def get_audit_stats(current_user: dict = Depends(get_current_user)):
    """Get audit log statistics"""
    total = await db.audit_logs.count_documents({})
    
    # Count by action type
    pipeline = [
        {"$group": {"_id": "$action", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    by_action = await db.audit_logs.aggregate(pipeline).to_list(100)
    
    # Count by entity type
    pipeline = [
        {"$group": {"_id": "$entity_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    by_entity = await db.audit_logs.aggregate(pipeline).to_list(100)
    
    return {
        "total": total,
        "by_action": {item["_id"]: item["count"] for item in by_action if item["_id"]},
        "by_entity": {item["_id"]: item["count"] for item in by_entity if item["_id"]}
    }
