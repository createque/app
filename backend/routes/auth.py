from fastapi import APIRouter, HTTPException, Request, Depends, Response
from datetime import datetime
from typing import Optional
import logging

from models.user import (
    AdminUser, AdminUserLogin, AdminUserResponse, 
    TokenResponse, RefreshTokenRequest,
    PasswordResetRequest, PasswordResetConfirm
)
from models.audit_log import AuditLog, AuditAction, EntityType
from services.auth_service import AuthService, EmailService
from middleware.auth_middleware import get_current_user, add_to_blacklist
from middleware.rate_limiter import limiter, LOGIN_RATE_LIMIT, PASSWORD_RESET_RATE_LIMIT

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Database reference (will be injected)
db = None

def set_db(database):
    """Set the database reference"""
    global db
    db = database


async def log_audit(
    action: AuditAction,
    entity_type: EntityType,
    request: Request,
    admin_id: Optional[str] = None,
    admin_email: Optional[str] = None,
    entity_id: Optional[str] = None,
    old_values: Optional[dict] = None,
    new_values: Optional[dict] = None,
    additional_info: Optional[dict] = None
):
    """Create an audit log entry"""
    try:
        audit_log = AuditLog(
            admin_id=admin_id,
            admin_email=admin_email,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_values=old_values,
            new_values=new_values,
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent"),
            additional_info=additional_info
        )
        await db.audit_logs.insert_one(audit_log.dict())
    except Exception as e:
        logger.error(f"Failed to create audit log: {e}")


@router.post("/login", response_model=TokenResponse)
@limiter.limit(LOGIN_RATE_LIMIT)
async def login(request: Request, login_data: AdminUserLogin):
    """Authenticate admin user and return JWT tokens"""
    # Find user by email
    user_doc = await db.admin_users.find_one({"email": login_data.email})
    
    # Generic error message to prevent email enumeration
    generic_error = "Błędne dane logowania"
    
    if not user_doc:
        # Log failed attempt (user not found)
        await log_audit(
            action=AuditAction.LOGIN_FAILED,
            entity_type=EntityType.AUTH,
            request=request,
            admin_email=login_data.email,
            additional_info={"reason": "user_not_found"}
        )
        raise HTTPException(status_code=401, detail=generic_error)
    
    user = AdminUser(**user_doc)
    
    # Check if account is locked
    if AuthService.is_account_locked(user.locked_until):
        await log_audit(
            action=AuditAction.LOGIN_FAILED,
            entity_type=EntityType.AUTH,
            request=request,
            admin_id=user.id,
            admin_email=user.email,
            additional_info={"reason": "account_locked"}
        )
        raise HTTPException(
            status_code=423,
            detail="Konto zablokowane. Spróbuj ponownie później."
        )
    
    # Check if user is active
    if not user.is_active:
        await log_audit(
            action=AuditAction.LOGIN_FAILED,
            entity_type=EntityType.AUTH,
            request=request,
            admin_id=user.id,
            admin_email=user.email,
            additional_info={"reason": "account_inactive"}
        )
        raise HTTPException(status_code=401, detail=generic_error)
    
    # Verify password
    if not AuthService.verify_password(login_data.password, user.password_hash):
        # Increment failed attempts
        new_attempts = user.failed_login_attempts + 1
        update_data = {
            "failed_login_attempts": new_attempts,
            "updated_at": datetime.utcnow()
        }
        
        # Lock account if too many failed attempts
        if AuthService.should_lock_account(new_attempts):
            update_data["locked_until"] = AuthService.get_lockout_time()
            logger.warning(f"Account locked due to failed attempts: {user.email}")
        
        await db.admin_users.update_one(
            {"id": user.id},
            {"$set": update_data}
        )
        
        await log_audit(
            action=AuditAction.LOGIN_FAILED,
            entity_type=EntityType.AUTH,
            request=request,
            admin_id=user.id,
            admin_email=user.email,
            additional_info={"reason": "invalid_password", "attempts": new_attempts}
        )
        
        raise HTTPException(status_code=401, detail=generic_error)
    
    # Successful login - reset failed attempts and update last login
    await db.admin_users.update_one(
        {"id": user.id},
        {"$set": {
            "failed_login_attempts": 0,
            "locked_until": None,
            "last_login": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Create tokens
    access_token, refresh_token, expires_in = AuthService.create_tokens(
        user.id, user.email, login_data.remember_me
    )
    
    # Log successful login
    await log_audit(
        action=AuditAction.LOGIN_SUCCESS,
        entity_type=EntityType.AUTH,
        request=request,
        admin_id=user.id,
        admin_email=user.email
    )
    
    logger.info(f"Successful login for: {user.email}")
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: Request, token_data: RefreshTokenRequest):
    """Refresh access token using refresh token (with rotation)"""
    # Decode refresh token
    payload = AuthService.decode_refresh_token(token_data.refresh_token)
    
    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Nieprawidłowy lub wygasły refresh token"
        )
    
    user_id = payload.get("sub")
    email = payload.get("email")
    
    # Verify user still exists and is active
    user_doc = await db.admin_users.find_one({"id": user_id})
    if not user_doc or not user_doc.get("is_active"):
        raise HTTPException(
            status_code=401,
            detail="Użytkownik nie istnieje lub jest nieaktywny"
        )
    
    # Blacklist old refresh token (rotation)
    add_to_blacklist(token_data.refresh_token)
    
    # Create new tokens
    access_token, refresh_token, expires_in = AuthService.create_tokens(user_id, email)
    
    # Log token refresh
    await log_audit(
        action=AuditAction.TOKEN_REFRESH,
        entity_type=EntityType.AUTH,
        request=request,
        admin_id=user_id,
        admin_email=email
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in
    )


@router.post("/logout")
async def logout(request: Request, current_user: dict = Depends(get_current_user)):
    """Logout and invalidate current token"""
    # Add token to blacklist
    if hasattr(request.state, 'token'):
        add_to_blacklist(request.state.token)
    
    # Log logout
    await log_audit(
        action=AuditAction.LOGOUT,
        entity_type=EntityType.AUTH,
        request=request,
        admin_id=current_user["user_id"],
        admin_email=current_user["email"]
    )
    
    return {"success": True, "message": "Wylogowano pomyślnie"}


@router.post("/forgot-password")
@limiter.limit(PASSWORD_RESET_RATE_LIMIT)
async def forgot_password(request: Request, reset_data: PasswordResetRequest):
    """Request password reset - sends email with reset link"""
    # Always return success to prevent email enumeration
    success_response = {
        "success": True,
        "message": "Jeśli podany email istnieje w systemie, wysłaliśmy link do resetu hasła."
    }
    
    # Find user
    user_doc = await db.admin_users.find_one({"email": reset_data.email})
    
    if not user_doc:
        # Log attempt but don't reveal user doesn't exist
        await log_audit(
            action=AuditAction.PASSWORD_RESET_REQUEST,
            entity_type=EntityType.AUTH,
            request=request,
            admin_email=reset_data.email,
            additional_info={"user_found": False}
        )
        return success_response
    
    user = AdminUser(**user_doc)
    
    # Generate reset token
    reset_token, expires = AuthService.generate_password_reset_token()
    
    # Save token to user
    await db.admin_users.update_one(
        {"id": user.id},
        {"$set": {
            "password_reset_token": reset_token,
            "password_reset_expires": expires,
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Send mock email
    reset_url = f"{request.base_url}admin/reset-password"
    EmailService.send_password_reset_email(user.email, reset_token, reset_url)
    
    # Log request
    await log_audit(
        action=AuditAction.PASSWORD_RESET_REQUEST,
        entity_type=EntityType.AUTH,
        request=request,
        admin_id=user.id,
        admin_email=user.email,
        additional_info={"user_found": True}
    )
    
    return success_response


@router.post("/reset-password")
async def reset_password(request: Request, reset_data: PasswordResetConfirm):
    """Reset password using token from email"""
    # Find user with valid reset token
    user_doc = await db.admin_users.find_one({
        "password_reset_token": reset_data.token,
        "password_reset_expires": {"$gt": datetime.utcnow()}
    })
    
    if not user_doc:
        raise HTTPException(
            status_code=400,
            detail="Nieprawidłowy lub wygasły token resetowania hasła"
        )
    
    user = AdminUser(**user_doc)
    
    # Validate new password (minimum 8 chars)
    if len(reset_data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Hasło musi mieć minimum 8 znaków"
        )
    
    # Hash new password
    new_hash = AuthService.hash_password(reset_data.new_password)
    
    # Update user
    await db.admin_users.update_one(
        {"id": user.id},
        {"$set": {
            "password_hash": new_hash,
            "password_reset_token": None,
            "password_reset_expires": None,
            "failed_login_attempts": 0,
            "locked_until": None,
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Log success
    await log_audit(
        action=AuditAction.PASSWORD_RESET_SUCCESS,
        entity_type=EntityType.AUTH,
        request=request,
        admin_id=user.id,
        admin_email=user.email
    )
    
    return {"success": True, "message": "Hasło zostało zmienione. Możesz się zalogować."}


@router.get("/me", response_model=AdminUserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user information"""
    user_doc = await db.admin_users.find_one({"id": current_user["user_id"]})
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="Użytkownik nie znaleziony")
    
    return AdminUserResponse(**user_doc)


# Helper endpoint to create initial admin (should be disabled in production)
@router.post("/setup", include_in_schema=False)
async def setup_admin(request: Request):
    """Create initial admin user (one-time setup)"""
    # Check if any admin exists
    existing = await db.admin_users.find_one({})
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Admin user already exists"
        )
    
    # Create default admin
    import os
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@timelov.pl")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin123!@#")
    
    admin_user = AdminUser(
        email=admin_email,
        username="admin",
        password_hash=AuthService.hash_password(admin_password),
        is_active=True,
        is_superadmin=True
    )
    
    await db.admin_users.insert_one(admin_user.dict())
    
    logger.info(f"Initial admin created: {admin_email}")
    print(f"\n{'='*60}")
    print(f"ADMIN CREATED")
    print(f"Email: {admin_email}")
    print(f"Password: {admin_password}")
    print(f"{'='*60}\n")
    
    return {
        "success": True,
        "message": "Admin user created",
        "email": admin_email
    }
