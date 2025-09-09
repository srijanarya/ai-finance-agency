"""
Authentication and Authorization Dependencies for FastAPI
Provides dependency injection for JWT token validation and role-based access control
"""

import uuid
from typing import List, Optional, Dict, Any
from functools import wraps
import logging

from fastapi import HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from services.jwt_service import JWTService
from database.models.auth_models import UserRole, User
from database import get_db_session

logger = logging.getLogger(__name__)

# Initialize JWT service and security scheme
jwt_service = JWTService()
security = HTTPBearer(auto_error=False)


class CurrentUser:
    """Current authenticated user context"""
    def __init__(
        self,
        user_id: str,
        email: str,
        first_name: str,
        last_name: str,
        role: str,
        tenant_id: str,
        session_id: str,
        permissions: List[str],
        is_active: bool = True
    ):
        self.user_id = user_id
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.role = role
        self.tenant_id = tenant_id
        self.session_id = session_id
        self.permissions = permissions
        self.is_active = is_active
    
    def has_permission(self, permission: str) -> bool:
        """Check if user has specific permission"""
        return permission in self.permissions
    
    def has_role(self, *roles: str) -> bool:
        """Check if user has one of the specified roles"""
        return self.role.lower() in [role.lower() for role in roles]
    
    def can_access_tenant(self, tenant_id: str) -> bool:
        """Check if user can access specific tenant"""
        return self.tenant_id == tenant_id
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization"""
        return {
            'user_id': self.user_id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'tenant_id': self.tenant_id,
            'session_id': self.session_id,
            'permissions': self.permissions,
            'is_active': self.is_active
        }


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[CurrentUser]:
    """
    Get current user from JWT token (optional - returns None if not authenticated)
    This dependency is used for endpoints that can work with or without authentication
    """
    if not credentials:
        return None
    
    try:
        # Validate access token
        valid, token_info = jwt_service.validate_access_token(credentials.credentials)
        
        if not valid:
            return None
        
        # Get additional user info from database
        with get_db_session() as session:
            user = session.query(User).filter(
                User.id == uuid.UUID(token_info['user_id']),
                User.is_active == True
            ).first()
            
            if not user:
                return None
            
            return CurrentUser(
                user_id=token_info['user_id'],
                email=token_info['email'],
                first_name=user.first_name,
                last_name=user.last_name,
                role=token_info['role'],
                tenant_id=token_info['tenant_id'],
                session_id=token_info['session_id'],
                permissions=token_info.get('permissions', []),
                is_active=user.is_active
            )
    
    except Exception as e:
        logger.error(f"Error in optional auth dependency: {e}")
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> CurrentUser:
    """
    Get current authenticated user from JWT token (required)
    This dependency is used for endpoints that require authentication
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Validate access token
        valid, token_info = jwt_service.validate_access_token(credentials.credentials)
        
        if not valid:
            error_type = token_info.get('error', 'invalid_token')
            
            if error_type == 'token_expired':
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Access token has expired",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            elif error_type == 'session_inactive':
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session is no longer active",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or malformed token",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        
        # Get additional user info from database
        with get_db_session() as session:
            user = session.query(User).filter(
                User.id == uuid.UUID(token_info['user_id']),
                User.is_active == True
            ).first()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User account is not active",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            return CurrentUser(
                user_id=token_info['user_id'],
                email=token_info['email'],
                first_name=user.first_name,
                last_name=user.last_name,
                role=token_info['role'],
                tenant_id=token_info['tenant_id'],
                session_id=token_info['session_id'],
                permissions=token_info.get('permissions', []),
                is_active=user.is_active
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in auth dependency: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service error"
        )


def require_permissions(*required_permissions: str):
    """
    Dependency factory for requiring specific permissions
    
    Usage:
        @router.get("/admin", dependencies=[Depends(require_permissions("users:read", "admin:access"))])
    """
    async def check_permissions(current_user: CurrentUser = Depends(get_current_user)):
        missing_permissions = []
        for permission in required_permissions:
            if not current_user.has_permission(permission):
                missing_permissions.append(permission)
        
        if missing_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permissions: {', '.join(missing_permissions)}"
            )
        
        return current_user
    
    return check_permissions


def require_roles(*required_roles: str):
    """
    Dependency factory for requiring specific roles
    
    Usage:
        @router.get("/admin", dependencies=[Depends(require_roles("admin", "manager"))])
    """
    async def check_roles(current_user: CurrentUser = Depends(get_current_user)):
        if not current_user.has_role(*required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(required_roles)}"
            )
        
        return current_user
    
    return check_roles


def require_same_tenant(tenant_id_param: str = "tenant_id"):
    """
    Dependency factory for requiring access to same tenant
    
    Usage:
        @router.get("/tenants/{tenant_id}", dependencies=[Depends(require_same_tenant())])
    """
    async def check_tenant_access(
        request: Request,
        current_user: CurrentUser = Depends(get_current_user)
    ):
        # Extract tenant_id from path parameters
        path_params = request.path_params
        requested_tenant_id = path_params.get(tenant_id_param)
        
        if not requested_tenant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing {tenant_id_param} parameter"
            )
        
        # Check if user can access this tenant (same tenant or admin role)
        if not (current_user.can_access_tenant(requested_tenant_id) or 
                current_user.has_role("admin")):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this tenant"
            )
        
        return current_user
    
    return check_tenant_access


class AuthMiddleware:
    """Authentication middleware for more complex authorization logic"""
    
    @staticmethod
    def require_resource_access(resource_type: str, action: str):
        """
        Require specific resource access
        
        Args:
            resource_type: Type of resource (e.g., "users", "content", "settings")
            action: Action to perform (e.g., "read", "create", "update", "delete")
        """
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Extract current_user from dependencies
                current_user = None
                for arg in args:
                    if isinstance(arg, CurrentUser):
                        current_user = arg
                        break
                
                if not current_user:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Authentication required"
                    )
                
                # Check permission
                required_permission = f"{resource_type}:{action}"
                if not current_user.has_permission(required_permission):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Missing permission: {required_permission}"
                    )
                
                return await func(*args, **kwargs)
            return wrapper
        return decorator
    
    @staticmethod
    def admin_required(func):
        """Decorator to require admin role"""
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = None
            for arg in args:
                if isinstance(arg, CurrentUser):
                    current_user = arg
                    break
            
            if not current_user or not current_user.has_role("admin"):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Admin access required"
                )
            
            return await func(*args, **kwargs)
        return wrapper


# Convenience dependencies for common use cases
async def require_authenticated_user(
    current_user: CurrentUser = Depends(get_current_user)
) -> CurrentUser:
    """Dependency that simply requires authentication"""
    return current_user


async def require_admin_user(
    current_user: CurrentUser = Depends(require_roles("admin"))
) -> CurrentUser:
    """Dependency that requires admin role"""
    return current_user


async def require_manager_or_admin(
    current_user: CurrentUser = Depends(require_roles("admin", "manager"))
) -> CurrentUser:
    """Dependency that requires manager or admin role"""
    return current_user


# Permission constants for common operations
class Permissions:
    """Common permission constants"""
    
    # Profile permissions
    PROFILE_READ = "profile:read"
    PROFILE_UPDATE = "profile:update"
    
    # User management permissions
    USERS_READ = "users:read"
    USERS_CREATE = "users:create"
    USERS_UPDATE = "users:update"
    USERS_DELETE = "users:delete"
    
    # Content management permissions
    CONTENT_READ = "content:read"
    CONTENT_CREATE = "content:create"
    CONTENT_UPDATE = "content:update"
    CONTENT_DELETE = "content:delete"
    
    # Tenant management permissions
    TENANTS_READ = "tenants:read"
    TENANTS_CREATE = "tenants:create"
    TENANTS_UPDATE = "tenants:update"
    TENANTS_DELETE = "tenants:delete"
    
    # System administration
    SYSTEM_ADMIN = "system:admin"
    AUDIT_READ = "audit:read"