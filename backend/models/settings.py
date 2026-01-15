from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class SiteSetting(BaseModel):
    """Model for site settings"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    setting_key: str  # e.g., "site_name", "site_description", "admin_email", "maintenance_mode"
    setting_value: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: Optional[str] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class SettingUpdate(BaseModel):
    """Schema for updating a setting"""
    setting_value: str


class SettingsResponse(BaseModel):
    """Schema for all settings response"""
    site_name: str = "TimeLov"
    site_description: str = "Centralna kontrola zasobami, ludźmi i procesami"
    admin_email: str = "admin@timelov.pl"
    maintenance_mode: bool = False


# Default settings
DEFAULT_SETTINGS = {
    "site_name": "TimeLov",
    "site_description": "Centralna kontrola zasobami, ludźmi i procesami",
    "admin_email": "admin@timelov.pl",
    "maintenance_mode": "false"
}
