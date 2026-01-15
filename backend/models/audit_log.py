from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
from datetime import datetime
import uuid
from enum import Enum


class AuditAction(str, Enum):
    """Enum for audit log actions"""
    # Auth actions
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILED = "login_failed"
    LOGOUT = "logout"
    PASSWORD_RESET_REQUEST = "password_reset_request"
    PASSWORD_RESET_SUCCESS = "password_reset_success"
    TOKEN_REFRESH = "token_refresh"
    
    # Page actions
    PAGE_CREATE = "page_create"
    PAGE_UPDATE = "page_update"
    PAGE_DELETE = "page_delete"
    PAGE_PUBLISH = "page_publish"
    PAGE_UNPUBLISH = "page_unpublish"
    
    # Post actions
    POST_CREATE = "post_create"
    POST_UPDATE = "post_update"
    POST_DELETE = "post_delete"
    POST_PUBLISH = "post_publish"
    POST_ARCHIVE = "post_archive"
    
    # Widget actions
    WIDGET_CREATE = "widget_create"
    WIDGET_UPDATE = "widget_update"
    WIDGET_DELETE = "widget_delete"
    WIDGET_ACTIVATE = "widget_activate"
    WIDGET_DEACTIVATE = "widget_deactivate"
    
    # Settings actions
    SETTINGS_UPDATE = "settings_update"


class EntityType(str, Enum):
    """Enum for entity types"""
    AUTH = "auth"
    PAGE = "page"
    POST = "post"
    WIDGET = "widget"
    SETTING = "setting"
    USER = "user"


class AuditLog(BaseModel):
    """Audit log model for tracking all admin actions"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    admin_id: Optional[str] = None
    admin_email: Optional[str] = None
    action: AuditAction
    entity_type: EntityType
    entity_id: Optional[str] = None
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    ip_address: str
    user_agent: Optional[str] = None
    additional_info: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class AuditLogResponse(BaseModel):
    """Schema for audit log response"""
    id: str
    admin_id: Optional[str]
    admin_email: Optional[str]
    action: str
    entity_type: str
    entity_id: Optional[str]
    old_values: Optional[Dict[str, Any]]
    new_values: Optional[Dict[str, Any]]
    ip_address: str
    user_agent: Optional[str]
    created_at: datetime


class AuditLogFilter(BaseModel):
    """Schema for filtering audit logs"""
    action: Optional[AuditAction] = None
    entity_type: Optional[EntityType] = None
    admin_id: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    limit: int = 100
    skip: int = 0
