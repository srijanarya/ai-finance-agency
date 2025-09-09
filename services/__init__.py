"""
Services package for AI Finance Agency
Provides business logic layer between API and database models
"""

from .auth_service import AuthService
from .email_service import EmailService
from .validation_service import ValidationService
from .jwt_service import JWTService
from .auth_dependencies import (
    CurrentUser, 
    get_current_user,
    get_current_user_optional,
    require_permissions,
    require_roles,
    require_authenticated_user,
    require_admin_user,
    require_manager_or_admin,
    Permissions,
    AuthMiddleware
)

__all__ = [
    'AuthService',
    'EmailService', 
    'ValidationService',
    'JWTService',
    'CurrentUser',
    'get_current_user',
    'get_current_user_optional',
    'require_permissions',
    'require_roles',
    'require_authenticated_user',
    'require_admin_user',
    'require_manager_or_admin',
    'Permissions',
    'AuthMiddleware'
]