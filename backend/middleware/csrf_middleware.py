"""CSRF Protection Middleware for TimeLov Admin API"""
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Set
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

# CSRF token store (in production, use Redis)
csrf_tokens: dict = {}
CSRF_TOKEN_EXPIRY_HOURS = 24


def generate_csrf_token(session_id: str) -> str:
    """Generate a new CSRF token for a session"""
    token = secrets.token_urlsafe(32)
    csrf_tokens[session_id] = {
        'token': token,
        'created_at': datetime.utcnow()
    }
    return token


def validate_csrf_token(session_id: str, token: str) -> bool:
    """Validate a CSRF token against the stored token"""
    if session_id not in csrf_tokens:
        return False
    
    stored = csrf_tokens[session_id]
    
    # Check expiry
    if datetime.utcnow() - stored['created_at'] > timedelta(hours=CSRF_TOKEN_EXPIRY_HOURS):
        del csrf_tokens[session_id]
        return False
    
    # Constant-time comparison to prevent timing attacks
    return secrets.compare_digest(stored['token'], token)


def cleanup_expired_tokens():
    """Remove expired CSRF tokens"""
    now = datetime.utcnow()
    expired = [
        sid for sid, data in csrf_tokens.items()
        if now - data['created_at'] > timedelta(hours=CSRF_TOKEN_EXPIRY_HOURS)
    ]
    for sid in expired:
        del csrf_tokens[sid]


async def csrf_protection_middleware(request: Request, call_next):
    """Middleware to enforce CSRF protection on state-changing requests"""
    # Skip CSRF check for safe methods
    if request.method in ('GET', 'HEAD', 'OPTIONS'):
        return await call_next(request)
    
    # Skip CSRF for certain paths (like initial login)
    skip_paths = ['/api/auth/login', '/api/auth/refresh', '/api/auth/setup']
    if any(request.url.path.startswith(path) for path in skip_paths):
        return await call_next(request)
    
    # For API with JWT auth, the token itself provides CSRF protection
    # (stateless, token required in header)
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        return await call_next(request)
    
    # For cookie-based auth, check CSRF token
    csrf_token = request.headers.get('X-CSRF-Token')
    session_id = request.cookies.get('session_id')
    
    if session_id and csrf_token:
        if not validate_csrf_token(session_id, csrf_token):
            logger.warning(f"Invalid CSRF token from IP: {request.client.host}")
            return JSONResponse(
                status_code=403,
                content={"detail": "Invalid CSRF token"}
            )
    
    return await call_next(request)
