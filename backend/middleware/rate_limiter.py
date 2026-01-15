from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

# Create rate limiter instance
limiter = Limiter(key_func=get_remote_address)

# Rate limit configurations
LOGIN_RATE_LIMIT = "5/15minutes"  # 5 attempts per 15 minutes for login
API_RATE_LIMIT = "100/minute"      # 100 requests per minute for general API
PASSWORD_RESET_RATE_LIMIT = "3/hour"  # 3 password reset requests per hour


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Custom handler for rate limit exceeded errors"""
    logger.warning(f"Rate limit exceeded for IP: {get_remote_address(request)}")
    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "error": "Too many requests",
            "message": "Zbyt wiele prób. Spróbuj ponownie później.",
            "retry_after": exc.detail
        }
    )


def get_limiter() -> Limiter:
    """Get the rate limiter instance"""
    return limiter
