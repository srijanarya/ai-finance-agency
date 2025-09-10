"""
Authentication database models for AI Finance Agency
Multi-tenant user management with role-based access control
"""

import enum
import uuid
from datetime import datetime, timedelta
from typing import Optional, List

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, ForeignKey, String, Text, Integer,
    UniqueConstraint, Index, CheckConstraint, JSON
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship, validates
from sqlalchemy.sql import func

from database.connection import Base


class UserStatus(str, enum.Enum):
    """User account status enumeration"""
    PENDING = "pending"          # Email verification pending
    ACTIVE = "active"            # Active user
    SUSPENDED = "suspended"      # Temporarily suspended
    DEACTIVATED = "deactivated"  # Deactivated by user
    BANNED = "banned"            # Banned by admin


class UserRole(str, enum.Enum):
    """User role enumeration"""
    ADMIN = "admin"              # Full system access
    USER = "user"                # Standard user access
    VIEWER = "viewer"            # Read-only access
    ANALYST = "analyst"          # Content creation access
    MANAGER = "manager"          # Team management access


class PermissionType(str, enum.Enum):
    """Permission type enumeration"""
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    ADMIN = "admin"
    MANAGE = "manage"


class AuditAction(str, enum.Enum):
    """Audit action enumeration"""
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    PASSWORD_CHANGE = "password_change"
    ROLE_CHANGE = "role_change"
    PERMISSION_GRANT = "permission_grant"
    PERMISSION_REVOKE = "permission_revoke"


class Tenant(Base):
    """
    Tenant model for multi-tenant support
    Each tenant represents an organization or company using the platform
    """
    __tablename__ = "tenants"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Tenant information
    name = Column(String(255), nullable=False, index=True)
    subdomain = Column(String(63), unique=True, nullable=True, index=True)
    domain = Column(String(253), unique=True, nullable=True)
    
    # Contact information
    contact_email = Column(String(320), nullable=True)
    contact_name = Column(String(255), nullable=True)
    
    # Subscription and billing
    subscription_tier = Column(String(50), default="basic", nullable=False)
    billing_email = Column(String(320), nullable=True)
    
    # Settings
    settings = Column(JSONB, default=dict)
    features = Column(JSONB, default=dict)  # Feature flags
    
    # Status and metadata
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("name != ''", name="tenant_name_not_empty"),
        CheckConstraint("subdomain ~ '^[a-z0-9-]+$'", name="tenant_subdomain_format"),
        Index("idx_tenant_active", "is_active"),
        Index("idx_tenant_created", "created_at"),
    )
    
    @validates('subdomain')
    def validate_subdomain(self, key, subdomain):
        if subdomain:
            subdomain = subdomain.lower()
            # Check for reserved subdomains
            reserved = ['www', 'api', 'admin', 'app', 'dashboard', 'mail', 'ftp']
            if subdomain in reserved:
                raise ValueError(f"Subdomain '{subdomain}' is reserved")
        return subdomain
    
    def __repr__(self):
        return f"<Tenant(id={self.id}, name='{self.name}', subdomain='{self.subdomain}')>"


class User(Base):
    """
    User model for authentication and user management
    Supports multi-tenant architecture with row-level security
    """
    __tablename__ = "users"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Tenant association (for multi-tenancy)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Authentication fields
    email = Column(String(320), nullable=False, index=True)  # RFC 5321 max email length
    password_hash = Column(String(255), nullable=False)
    
    # User information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    display_name = Column(String(200), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Role and permissions
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False, index=True)
    
    # Account status
    status = Column(Enum(UserStatus), default=UserStatus.PENDING, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    email_verified = Column(Boolean, default=False, nullable=False)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    email_verification_token = Column(String(255), nullable=True, index=True)  # Email verification token
    
    # Security fields
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    last_login_ip = Column(String(45), nullable=True)  # IPv6 max length
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    password_changed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Multi-factor authentication
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    mfa_secret = Column(String(32), nullable=True)  # TOTP secret
    backup_codes = Column(JSONB, nullable=True)  # Encrypted backup codes
    
    # Preferences and settings
    preferences = Column(JSONB, default=dict)
    timezone = Column(String(50), default="UTC")
    language = Column(String(10), default="en")
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # Soft delete
    
    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")
    permissions = relationship("UserPermission", back_populates="user", cascade="all, delete-orphan", foreign_keys="UserPermission.user_id")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    
    # Constraints and indexes
    __table_args__ = (
        UniqueConstraint('email', 'tenant_id', name='unique_email_per_tenant'),
        CheckConstraint("first_name != ''", name="user_first_name_not_empty"),
        CheckConstraint("last_name != ''", name="user_last_name_not_empty"),
        CheckConstraint("email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'", name="user_email_format"),
        Index("idx_user_email_tenant", "email", "tenant_id"),
        Index("idx_user_status_active", "status", "is_active"),
        Index("idx_user_role", "role"),
        Index("idx_user_created", "created_at"),
        Index("idx_user_last_login", "last_login_at"),
    )
    
    @hybrid_property
    def full_name(self) -> str:
        """Get user's full name"""
        return f"{self.first_name} {self.last_name}".strip()
    
    @hybrid_property
    def is_locked(self) -> bool:
        """Check if user account is currently locked"""
        return self.locked_until is not None and self.locked_until > datetime.utcnow()
    
    @hybrid_property
    def is_admin(self) -> bool:
        """Check if user has admin role"""
        return self.role == UserRole.ADMIN
    
    def can_login(self) -> bool:
        """Check if user can login (active, verified, not locked)"""
        return (
            self.is_active and 
            self.status == UserStatus.ACTIVE and 
            self.email_verified and 
            not self.is_locked
        )
    
    def lock_account(self, duration_minutes: int = 30):
        """Lock user account for specified duration"""
        self.locked_until = datetime.utcnow() + timedelta(minutes=duration_minutes)
        self.failed_login_attempts += 1
    
    def unlock_account(self):
        """Unlock user account and reset failed attempts"""
        self.locked_until = None
        self.failed_login_attempts = 0
    
    def record_login(self, ip_address: str):
        """Record successful login"""
        self.last_login_at = datetime.utcnow()
        self.last_login_ip = ip_address
        self.failed_login_attempts = 0
        self.locked_until = None
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"


class UserSession(Base):
    """
    User session model for JWT token management and tracking
    Supports refresh token rotation and session invalidation
    """
    __tablename__ = "user_sessions"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # User association
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Session information
    refresh_token_hash = Column(String(255), nullable=False, unique=True, index=True)
    session_id = Column(String(255), nullable=False, unique=True, index=True)
    
    # Device and client information
    user_agent = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    device_id = Column(String(255), nullable=True)
    client_type = Column(String(50), default="web", nullable=False)  # web, mobile, api
    
    # Session timing
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    last_used_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Session status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    revoked_by = Column(UUID(as_uuid=True), nullable=True)  # Admin who revoked
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    
    # Constraints and indexes
    __table_args__ = (
        Index("idx_session_user_active", "user_id", "is_active"),
        Index("idx_session_expires", "expires_at"),
        Index("idx_session_last_used", "last_used_at"),
    )
    
    @hybrid_property
    def is_expired(self) -> bool:
        """Check if session is expired"""
        return datetime.utcnow() > self.expires_at
    
    @hybrid_property
    def is_valid(self) -> bool:
        """Check if session is valid (active and not expired)"""
        return self.is_active and not self.is_expired and self.revoked_at is None
    
    def revoke(self, revoked_by_user_id: Optional[uuid.UUID] = None):
        """Revoke the session"""
        self.is_active = False
        self.revoked_at = datetime.utcnow()
        self.revoked_by = revoked_by_user_id
    
    def extend_expiry(self, hours: int = 24):
        """Extend session expiry"""
        self.expires_at = datetime.utcnow() + timedelta(hours=hours)
        self.last_used_at = datetime.utcnow()
    
    def __repr__(self):
        return f"<UserSession(id={self.id}, user_id={self.user_id}, expires={self.expires_at})>"


class PasswordResetToken(Base):
    """
    Password reset token model for secure password recovery
    Tokens have limited lifespan and single-use policy
    """
    __tablename__ = "password_reset_tokens"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # User association
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Token information
    token_hash = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Usage tracking
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Security information
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="password_reset_tokens")
    
    # Constraints and indexes
    __table_args__ = (
        Index("idx_password_reset_user", "user_id"),
        Index("idx_password_reset_expires", "expires_at"),
    )
    
    @hybrid_property
    def is_expired(self) -> bool:
        """Check if token is expired"""
        return datetime.utcnow() > self.expires_at
    
    @hybrid_property
    def is_used(self) -> bool:
        """Check if token has been used"""
        return self.used_at is not None
    
    @hybrid_property
    def is_valid(self) -> bool:
        """Check if token is valid (not expired and not used)"""
        return not self.is_expired and not self.is_used
    
    def mark_as_used(self):
        """Mark token as used"""
        self.used_at = datetime.utcnow()
    
    def __repr__(self):
        return f"<PasswordResetToken(id={self.id}, user_id={self.user_id}, expires={self.expires_at})>"


class UserPermission(Base):
    """
    User permission model for granular access control
    Supports resource-based permissions beyond basic roles
    """
    __tablename__ = "user_permissions"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # User association
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Permission details
    resource = Column(String(100), nullable=False, index=True)  # e.g., "dashboard", "content", "users"
    action = Column(Enum(PermissionType), nullable=False, index=True)
    resource_id = Column(String(255), nullable=True)  # Specific resource ID
    
    # Permission metadata
    granted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    granted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="permissions", foreign_keys=[user_id])
    granted_by_user = relationship("User", foreign_keys=[granted_by])
    
    # Constraints and indexes
    __table_args__ = (
        UniqueConstraint('user_id', 'resource', 'action', 'resource_id', name='unique_user_permission'),
        Index("idx_permission_user_resource", "user_id", "resource"),
        Index("idx_permission_expires", "expires_at"),
    )
    
    @hybrid_property
    def is_expired(self) -> bool:
        """Check if permission is expired"""
        return self.expires_at is not None and datetime.utcnow() > self.expires_at
    
    @hybrid_property
    def is_valid(self) -> bool:
        """Check if permission is valid"""
        return self.is_active and not self.is_expired
    
    def __repr__(self):
        return f"<UserPermission(user_id={self.user_id}, resource='{self.resource}', action='{self.action}')>"


class AuditLog(Base):
    """
    Audit log model for tracking user actions and system events
    Provides comprehensive audit trail for compliance and security
    """
    __tablename__ = "audit_logs"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # User and tenant
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Action details
    action = Column(Enum(AuditAction), nullable=False, index=True)
    resource_type = Column(String(100), nullable=False, index=True)
    resource_id = Column(String(255), nullable=True, index=True)
    
    # Change details
    old_values = Column(JSONB, nullable=True)
    new_values = Column(JSONB, nullable=True)
    details = Column(JSONB, nullable=True)
    
    # Context information
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    session_id = Column(String(255), nullable=True)
    
    # Timing
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # Status
    success = Column(Boolean, default=True, nullable=False)
    error_message = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
    tenant = relationship("Tenant")
    
    # Constraints and indexes
    __table_args__ = (
        Index("idx_audit_user_action", "user_id", "action"),
        Index("idx_audit_resource", "resource_type", "resource_id"),
        Index("idx_audit_timestamp", "timestamp"),
        Index("idx_audit_tenant_timestamp", "tenant_id", "timestamp"),
    )
    
    @classmethod
    def create_log(
        cls,
        user_id: Optional[uuid.UUID],
        tenant_id: uuid.UUID,
        action: AuditAction,
        resource_type: str,
        resource_id: Optional[str] = None,
        old_values: Optional[dict] = None,
        new_values: Optional[dict] = None,
        details: Optional[dict] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        session_id: Optional[str] = None,
        success: bool = True,
        error_message: Optional[str] = None
    ) -> 'AuditLog':
        """Create a new audit log entry"""
        return cls(
            user_id=user_id,
            tenant_id=tenant_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            old_values=old_values,
            new_values=new_values,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent,
            session_id=session_id,
            success=success,
            error_message=error_message
        )
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, action='{self.action}', resource_type='{self.resource_type}')>"