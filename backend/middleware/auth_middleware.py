from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from services.auth_service import AuthService
import logging

logger = logging.getLogger(__name__)  

security = HTTPBearer(auto_error=False)

# Token blacklist (in production, use Redis)
token_blacklist = set()


def add_to_blacklist(token: str):
    """Add a token to the blacklist"""
    token_blacklist.add(token)


def is_blacklisted(token: str) -> bool:
    """Check if a token is blacklisted"""
    return token in token_blacklist


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> dict:
    """Dependency to get the current authenticated user"""
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Brak tokenu autoryzacji",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = credentials.credentials
    
    # Check if token is blacklisted
    if is_blacklisted(token):
        raise HTTPException(
            status_code=401,
            detail="Token został unieważniony",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Decode and validate token
    payload = AuthService.decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Nieprawidłowy lub wygasły token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Add token to request state for potential blacklisting on logout
    request.state.token = token
    
    return {
        "user_id": payload.get("sub"),
        "email": payload.get("email")
    }


async def get_optional_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[dict]:
    """Dependency to optionally get the current user (doesn't raise if not authenticated)"""
    if credentials is None:
        return None
    
    token = credentials.credentials
    
    if is_blacklisted(token):
        return None
    
    payload = AuthService.decode_access_token(token)
    if payload is None:
        return None
    
    request.state.token = token
    
    return {
        "user_id": payload.get("sub"),
        "email": payload.get("email")
    }


def require_superadmin(current_user: dict = Depends(get_current_user)):
    """Dependency to require superadmin privileges"""
    # This would check the database for superadmin status
    # For now, we pass through - will be enhanced in Phase 3
    return current_user
