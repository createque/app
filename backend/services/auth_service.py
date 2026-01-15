from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Tuple
import secrets
import os
import logging

logger = logging.getLogger(__name__)

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

# JWT configuration
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", secrets.token_urlsafe(32))
REFRESH_SECRET_KEY = os.environ.get("JWT_REFRESH_SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7
REMEMBER_ME_EXPIRE_DAYS = 30

# Rate limiting configuration
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 15


class AuthService:
    """Service for handling authentication operations"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt with 12 salt rounds"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception as e:
            logger.error(f"Password verification error: {e}")
            return False
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    @staticmethod
    def create_refresh_token(data: dict, remember_me: bool = False) -> str:
        """Create a JWT refresh token with optional extended expiry"""
        to_encode = data.copy()
        if remember_me:
            expire = datetime.utcnow() + timedelta(days=REMEMBER_ME_EXPIRE_DAYS)
        else:
            expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh",
            "jti": secrets.token_urlsafe(16)  # Unique token ID for rotation
        })
        return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    
    @staticmethod
    def decode_access_token(token: str) -> Optional[dict]:
        """Decode and validate an access token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("type") != "access":
                return None
            return payload
        except JWTError as e:
            logger.warning(f"Access token decode error: {e}")
            return None
    
    @staticmethod
    def decode_refresh_token(token: str) -> Optional[dict]:
        """Decode and validate a refresh token"""
        try:
            payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("type") != "refresh":
                return None
            return payload
        except JWTError as e:
            logger.warning(f"Refresh token decode error: {e}")
            return None
    
    @staticmethod
    def create_tokens(user_id: str, email: str, remember_me: bool = False) -> Tuple[str, str, int]:
        """Create both access and refresh tokens"""
        token_data = {"sub": user_id, "email": email}
        access_token = AuthService.create_access_token(token_data)
        refresh_token = AuthService.create_refresh_token(token_data, remember_me)
        return access_token, refresh_token, ACCESS_TOKEN_EXPIRE_MINUTES * 60
    
    @staticmethod
    def generate_password_reset_token() -> Tuple[str, datetime]:
        """Generate a secure password reset token with 1 hour expiry"""
        token = secrets.token_urlsafe(32)
        expires = datetime.utcnow() + timedelta(hours=1)
        return token, expires
    
    @staticmethod
    def is_account_locked(locked_until: Optional[datetime]) -> bool:
        """Check if account is currently locked"""
        if locked_until is None:
            return False
        return datetime.utcnow() < locked_until
    
    @staticmethod
    def get_lockout_time() -> datetime:
        """Get the lockout end time"""
        return datetime.utcnow() + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
    
    @staticmethod
    def should_lock_account(failed_attempts: int) -> bool:
        """Check if account should be locked based on failed attempts"""
        return failed_attempts >= MAX_LOGIN_ATTEMPTS


# Email mock service (simulates sending emails to console)
class EmailService:
    """Mock email service - prints to console instead of sending"""
    
    @staticmethod
    def send_password_reset_email(email: str, reset_token: str, reset_url: str):
        """Mock: Send password reset email (prints to console)"""
        logger.info("="*60)
        logger.info("[MOCK EMAIL] Password Reset Request")
        logger.info(f"To: {email}")
        logger.info(f"Subject: Reset your password - TimeLov Admin")
        logger.info(f"")
        logger.info(f"Click the link below to reset your password:")
        logger.info(f"{reset_url}?token={reset_token}")
        logger.info(f"")
        logger.info(f"This link expires in 1 hour.")
        logger.info(f"If you didn't request this, ignore this email.")
        logger.info("="*60)
        print(f"\n[MOCK EMAIL] Password reset link sent to {email}")
        print(f"Reset URL: {reset_url}?token={reset_token}\n")
        return True
    
    @staticmethod
    def send_login_alert_email(email: str, ip_address: str, user_agent: str):
        """Mock: Send login alert email (prints to console)"""
        logger.info("="*60)
        logger.info("[MOCK EMAIL] New Login Alert")
        logger.info(f"To: {email}")
        logger.info(f"Subject: New login to your TimeLov Admin account")
        logger.info(f"")
        logger.info(f"A new login was detected:")
        logger.info(f"IP Address: {ip_address}")
        logger.info(f"Device: {user_agent}")
        logger.info(f"Time: {datetime.utcnow().isoformat()}")
        logger.info("="*60)
        return True
