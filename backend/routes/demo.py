"""Demo request routes for TimeLov"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid
import logging

# Import database
from server import db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/demo", tags=["Demo"])


class DemoRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    company: str = Field(..., min_length=2, max_length=100)
    phone: Optional[str] = None


class DemoRequestResponse(BaseModel):
    id: str
    name: str
    email: str
    company: str
    phone: Optional[str]
    status: str
    created_at: datetime


@router.post("/request")
async def create_demo_request(demo_data: DemoRequest, request: Request):
    """Create a new demo request"""
    # Check for duplicate requests in last 24 hours
    existing = await db.demo_requests.find_one({
        "email": demo_data.email.lower(),
        "created_at": {"$gte": datetime.utcnow().replace(hour=0, minute=0, second=0)}
    })
    
    if existing:
        return {
            "success": True,
            "message": "Twoja prośba została już zarejestrowana. Skontaktujemy się wkrótce!",
            "request_id": existing["id"]
        }

    # Create demo request
    request_id = str(uuid.uuid4())
    demo_doc = {
        "id": request_id,
        "name": demo_data.name,
        "email": demo_data.email.lower(),
        "company": demo_data.company,
        "phone": demo_data.phone,
        "status": "pending",
        "source": "website",
        "ip_address": request.client.host if request.client else None,
        "user_agent": request.headers.get("user-agent"),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "contacted_at": None,
        "notes": None
    }

    await db.demo_requests.insert_one(demo_doc)

    logger.info(f"New demo request from: {demo_data.email} ({demo_data.company})")

    return {
        "success": True,
        "message": "Dziękujemy! Skontaktujemy się w ciągu 24 godzin.",
        "request_id": request_id
    }


@router.get("/requests")
async def list_demo_requests(
    status: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
):
    """List demo requests (admin endpoint - to be protected)"""
    query = {}
    if status:
        query["status"] = status

    cursor = db.demo_requests.find(query).sort("created_at", -1).skip(skip).limit(limit)
    requests = await cursor.to_list(length=limit)

    # Clean up MongoDB _id
    for req in requests:
        req.pop("_id", None)

    total = await db.demo_requests.count_documents(query)

    return {
        "requests": requests,
        "total": total,
        "limit": limit,
        "skip": skip
    }


@router.patch("/requests/{request_id}")
async def update_demo_request(request_id: str, status: str, notes: Optional[str] = None):
    """Update demo request status (admin endpoint)"""
    valid_statuses = ["pending", "contacted", "scheduled", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status musi być jednym z: {', '.join(valid_statuses)}")

    result = await db.demo_requests.update_one(
        {"id": request_id},
        {
            "$set": {
                "status": status,
                "notes": notes,
                "updated_at": datetime.utcnow(),
                "contacted_at": datetime.utcnow() if status == "contacted" else None
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Prośba nie znaleziona")

    return {"success": True, "message": "Status zaktualizowany"}
