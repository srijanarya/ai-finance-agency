"""
Database package for AI Finance Agency
Provides database connection, models, and utilities for the authentication system
"""

from .connection import (
    init_database, get_db_session, get_async_db_session,
    get_db, get_async_db, Base, DatabaseHealth, TenantContext
)
from .models.auth_models import (
    User, Tenant, UserRole, UserStatus, UserSession, 
    PasswordResetToken, UserPermission, AuditLog, AuditAction,
    PermissionType
)
from .utils import (
    DatabaseManager, TenantManager, DatabaseMaintenance,
    check_database_health
)

__all__ = [
    # Connection utilities
    'init_database',
    'get_db_session',
    'get_async_db_session', 
    'get_db',
    'get_async_db',
    'Base',
    'DatabaseHealth',
    'TenantContext',
    
    # Models
    'User',
    'Tenant', 
    'UserRole',
    'UserStatus',
    'UserSession',
    'PasswordResetToken',
    'UserPermission',
    'AuditLog',
    'AuditAction',
    'PermissionType',
    
    # Utilities
    'DatabaseManager',
    'TenantManager', 
    'DatabaseMaintenance',
    'check_database_health'
]