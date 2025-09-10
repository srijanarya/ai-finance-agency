"""
Security utilities and authentication
JWT token handling, password hashing, and API key management
"""

import jwt
import bcrypt
import secrets
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Union
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security scheme
security_scheme = HTTPBearer()


class SecurityManager:
    """Centralized security management"""
    
    def __init__(self):
        self.settings = get_settings()
    
    def create_access_token(
        self,
        data: Dict[str, Any],
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                hours=self.settings.jwt_expiration_hours
            )
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "access_token"
        })
        
        encoded_jwt = jwt.encode(
            to_encode,
            self.settings.jwt_secret,
            algorithm=self.settings.jwt_algorithm
        )
        
        return encoded_jwt
    
    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """Create JWT refresh token"""
        to_encode = data.copy()
        
        # Refresh tokens expire in 30 days
        expire = datetime.now(timezone.utc) + timedelta(days=30)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "refresh_token"
        })
        
        encoded_jwt = jwt.encode(
            to_encode,
            self.settings.jwt_secret,
            algorithm=self.settings.jwt_algorithm
        )
        
        return encoded_jwt
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(
                token,
                self.settings.jwt_secret,
                algorithms=[self.settings.jwt_algorithm]
            )
            
            # Check token type
            token_type = payload.get("type")
            if token_type not in ["access_token", "refresh_token"]:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            
            # Check expiration
            exp = payload.get("exp")
            if exp and datetime.fromtimestamp(exp, timezone.utc) < datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has expired"
                )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(
            password.encode('utf-8'),
            hashed.encode('utf-8')
        )
    
    def generate_api_key(self, prefix: str = "afa") -> str:
        """Generate secure API key"""
        random_part = secrets.token_urlsafe(32)
        return f"{prefix}_{random_part}"
    
    def generate_secure_token(self, length: int = 32) -> str:
        """Generate secure random token"""
        return secrets.token_urlsafe(length)
    
    def validate_api_key(self, api_key: str) -> bool:
        """Validate API key format"""
        if not api_key or not isinstance(api_key, str):
            return False
        
        parts = api_key.split("_")
        if len(parts) != 2:
            return False
        
        prefix, token = parts
        return len(prefix) >= 2 and len(token) >= 20


# Global security manager instance
security_manager = SecurityManager()


def get_password_hash(password: str) -> str:
    """Hash password (convenience function)"""
    return security_manager.hash_password(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password (convenience function)"""
    return security_manager.verify_password(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create access token (convenience function)"""
    return security_manager.create_access_token(data, expires_delta)


def verify_token(token: str) -> Dict[str, Any]:
    """Verify token (convenience function)"""
    return security_manager.verify_token(token)


class APIKeyManager:
    """API Key management for service authentication"""
    
    def __init__(self):
        self.settings = get_settings()
        # In production, these would be stored in database
        self.api_keys = {
            "internal": "afa_internal_service_key_dev_only",
            "admin": "afa_admin_key_dev_only"
        }
    
    def validate_api_key(self, api_key: str) -> Optional[Dict[str, Any]]:
        """Validate API key and return associated permissions"""
        for key_type, valid_key in self.api_keys.items():
            if api_key == valid_key:
                return {
                    "type": key_type,
                    "permissions": self._get_permissions(key_type),
                    "validated_at": datetime.now(timezone.utc)
                }
        return None
    
    def _get_permissions(self, key_type: str) -> list:
        """Get permissions for API key type"""
        permissions_map = {
            "internal": ["read", "write", "admin"],
            "admin": ["read", "write", "admin", "system"],
            "user": ["read", "write"]
        }
        return permissions_map.get(key_type, ["read"])


# Global API key manager
api_key_manager = APIKeyManager()


def authenticate_request(credentials: HTTPAuthorizationCredentials) -> Dict[str, Any]:
    """Authenticate request using bearer token or API key"""
    token = credentials.credentials
    
    # Try JWT token first
    try:
        return verify_token(token)
    except HTTPException:
        pass
    
    # Try API key authentication
    api_key_info = api_key_manager.validate_api_key(token)
    if api_key_info:
        return api_key_info
    
    # Authentication failed
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )


class RateLimitManager:
    """Rate limiting utilities"""
    
    def __init__(self):
        self.settings = get_settings()
    
    async def is_rate_limited(self, key: str, redis_client=None) -> bool:
        """Check if key is rate limited"""
        if not redis_client:
            return False  # No rate limiting if Redis unavailable
        
        try:
            current_count = await redis_client.get(f"rate_limit:{key}")
            if current_count is None:
                # First request in window
                await redis_client.setex(
                    f"rate_limit:{key}",
                    self.settings.rate_limit_window_seconds,
                    1
                )
                return False
            
            if int(current_count) >= self.settings.rate_limit_max_requests:
                return True
            
            # Increment counter
            await redis_client.incr(f"rate_limit:{key}")
            return False
            
        except Exception as e:
            logger.error(f"Rate limiting error: {e}")
            return False  # Fail open - don't block if rate limiting fails
    
    async def get_rate_limit_status(self, key: str, redis_client=None) -> Dict[str, Any]:
        """Get rate limit status for key"""
        if not redis_client:
            return {"limited": False, "remaining": self.settings.rate_limit_max_requests}
        
        try:
            current_count = await redis_client.get(f"rate_limit:{key}")
            ttl = await redis_client.ttl(f"rate_limit:{key}")
            
            if current_count is None:
                return {
                    "limited": False,
                    "remaining": self.settings.rate_limit_max_requests,
                    "reset_time": None
                }
            
            count = int(current_count)
            remaining = max(0, self.settings.rate_limit_max_requests - count)
            
            return {
                "limited": count >= self.settings.rate_limit_max_requests,
                "remaining": remaining,
                "reset_time": ttl if ttl > 0 else None,
                "window_seconds": self.settings.rate_limit_window_seconds
            }
            
        except Exception as e:
            logger.error(f"Rate limit status error: {e}")
            return {"limited": False, "remaining": self.settings.rate_limit_max_requests}


# Global rate limit manager
rate_limit_manager = RateLimitManager()


# Export commonly used functions
__all__ = [
    "SecurityManager",
    "APIKeyManager",
    "RateLimitManager",
    "get_password_hash",
    "verify_password",
    "create_access_token",
    "verify_token",
    "authenticate_request",
    "security_manager",
    "api_key_manager",
    "rate_limit_manager"
]