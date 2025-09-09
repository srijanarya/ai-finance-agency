"""
Authentication Service for AI Finance Agency
Handles user registration, login, and authentication workflows
"""

import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple, Any
import logging

import bcrypt
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db_session
from database.models.auth_models import (
    User, Tenant, UserRole, UserStatus, UserSession, 
    PasswordResetToken, AuditLog, AuditAction
)
from services.email_service import EmailService
from services.validation_service import ValidationService

logger = logging.getLogger(__name__)


class AuthService:
    """Authentication service handling user registration and login"""
    
    def __init__(self):
        self.email_service = EmailService()
        self.validation_service = ValidationService()
    
    def register_user(
        self,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
        tenant_id: Optional[uuid.UUID] = None,
        role: UserRole = UserRole.USER,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Register a new user account
        
        Args:
            email: User email address
            password: User password (will be hashed)
            first_name: User's first name
            last_name: User's last name
            tenant_id: Optional tenant ID (uses default if None)
            role: User role (default: USER)
            ip_address: Registration IP address for audit
            user_agent: User agent string for audit
            
        Returns:
            Tuple of (success: bool, result: dict)
        """
        try:
            with get_db_session() as session:
                # Validate input data
                validation_result = self._validate_registration_data(
                    email, password, first_name, last_name
                )
                if not validation_result['valid']:
                    return False, {
                        'error': 'validation_failed',
                        'message': 'Registration data validation failed',
                        'details': validation_result['errors']
                    }
                
                # Get or create tenant
                tenant = self._get_or_create_tenant(session, tenant_id)
                if not tenant:
                    return False, {
                        'error': 'tenant_not_found',
                        'message': 'Invalid tenant specified'
                    }
                
                # Check if user already exists
                existing_user = session.query(User).filter(
                    User.email == email.lower(),
                    User.tenant_id == tenant.id
                ).first()
                
                if existing_user:
                    return False, {
                        'error': 'user_exists',
                        'message': 'User with this email already exists'
                    }
                
                # Hash password
                password_hash = self._hash_password(password)
                
                # Generate email verification token
                verification_token = self._generate_verification_token()
                
                # Create user
                user = User(
                    tenant_id=tenant.id,
                    email=email.lower(),
                    password_hash=password_hash,
                    first_name=first_name.strip(),
                    last_name=last_name.strip(),
                    role=role,
                    status=UserStatus.PENDING,
                    email_verified=False,
                    email_verification_token=verification_token,
                    password_changed_at=datetime.now(timezone.utc),
                    preferences={
                        'theme': 'light',
                        'notifications': {
                            'email': True,
                            'browser': True,
                            'mobile': False
                        }
                    }
                )
                
                session.add(user)
                session.flush()  # Get user ID
                
                # Create audit log
                audit_log = AuditLog.create_log(
                    user_id=None,  # No authenticated user for registration
                    tenant_id=tenant.id,
                    action=AuditAction.CREATE,
                    resource_type='user',
                    resource_id=str(user.id),
                    ip_address=ip_address,
                    user_agent=user_agent,
                    new_values={
                        'email': email,
                        'role': role.value,
                        'status': UserStatus.PENDING.value
                    },
                    details={
                        'registration_method': 'web',
                        'email_verification_required': True
                    }
                )
                session.add(audit_log)
                
                session.commit()
                
                # Send verification email (async)
                try:
                    self.email_service.send_verification_email(
                        user.email,
                        user.first_name,
                        verification_token,
                        tenant.name
                    )
                    email_sent = True
                except Exception as e:
                    logger.error(f"Failed to send verification email: {e}")
                    email_sent = False
                
                logger.info(f"User registered successfully: {user.email} ({user.id})")
                
                return True, {
                    'user_id': str(user.id),
                    'email': user.email,
                    'status': user.status.value,
                    'verification_required': True,
                    'verification_email_sent': email_sent,
                    'message': 'Registration successful. Please check your email to verify your account.'
                }
                
        except IntegrityError as e:
            logger.error(f"Database integrity error during registration: {e}")
            return False, {
                'error': 'database_error',
                'message': 'Registration failed due to database constraint violation'
            }
        except Exception as e:
            logger.error(f"Unexpected error during registration: {e}")
            return False, {
                'error': 'internal_error',
                'message': 'An unexpected error occurred during registration'
            }
    
    def verify_email(
        self,
        token: str,
        ip_address: Optional[str] = None
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Verify user email with verification token
        
        Args:
            token: Email verification token
            ip_address: Verification IP address for audit
            
        Returns:
            Tuple of (success: bool, result: dict)
        """
        try:
            with get_db_session() as session:
                # Find user by verification token
                user = session.query(User).filter(
                    User.email_verification_token == token,
                    User.email_verified == False
                ).first()
                
                if not user:
                    return False, {
                        'error': 'invalid_token',
                        'message': 'Invalid or expired verification token'
                    }
                
                # Check if token is expired (24 hours)
                if user.created_at < datetime.now(timezone.utc) - timedelta(hours=24):
                    return False, {
                        'error': 'token_expired',
                        'message': 'Verification token has expired. Please request a new one.'
                    }
                
                # Verify email and activate user
                user.email_verified = True
                user.email_verified_at = datetime.now(timezone.utc)
                user.email_verification_token = None
                user.status = UserStatus.ACTIVE
                user.is_active = True
                
                # Create audit log
                audit_log = AuditLog.create_log(
                    user_id=user.id,
                    tenant_id=user.tenant_id,
                    action=AuditAction.UPDATE,
                    resource_type='user',
                    resource_id=str(user.id),
                    ip_address=ip_address,
                    old_values={
                        'email_verified': False,
                        'status': UserStatus.PENDING.value
                    },
                    new_values={
                        'email_verified': True,
                        'status': UserStatus.ACTIVE.value
                    },
                    details={'verification_method': 'email_token'}
                )
                session.add(audit_log)
                
                session.commit()
                
                logger.info(f"Email verified successfully: {user.email} ({user.id})")
                
                return True, {
                    'user_id': str(user.id),
                    'email': user.email,
                    'status': user.status.value,
                    'message': 'Email verification successful. Your account is now active.'
                }
                
        except Exception as e:
            logger.error(f"Error during email verification: {e}")
            return False, {
                'error': 'internal_error',
                'message': 'An error occurred during email verification'
            }
    
    def resend_verification_email(
        self,
        email: str,
        tenant_id: Optional[uuid.UUID] = None,
        ip_address: Optional[str] = None
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Resend email verification for a user
        
        Args:
            email: User email address
            tenant_id: Tenant ID (uses default if None)
            ip_address: Request IP address for audit
            
        Returns:
            Tuple of (success: bool, result: dict)
        """
        try:
            with get_db_session() as session:
                # Get tenant
                tenant = self._get_or_create_tenant(session, tenant_id)
                if not tenant:
                    return False, {
                        'error': 'tenant_not_found',
                        'message': 'Invalid tenant specified'
                    }
                
                # Find unverified user
                user = session.query(User).filter(
                    User.email == email.lower(),
                    User.tenant_id == tenant.id,
                    User.email_verified == False
                ).first()
                
                if not user:
                    return False, {
                        'error': 'user_not_found',
                        'message': 'User not found or already verified'
                    }
                
                # Generate new verification token
                verification_token = self._generate_verification_token()
                user.email_verification_token = verification_token
                
                # Create audit log
                audit_log = AuditLog.create_log(
                    user_id=user.id,
                    tenant_id=user.tenant_id,
                    action=AuditAction.UPDATE,
                    resource_type='user',
                    resource_id=str(user.id),
                    ip_address=ip_address,
                    details={'action': 'resend_verification_email'}
                )
                session.add(audit_log)
                
                session.commit()
                
                # Send verification email
                try:
                    self.email_service.send_verification_email(
                        user.email,
                        user.first_name,
                        verification_token,
                        tenant.name
                    )
                    email_sent = True
                except Exception as e:
                    logger.error(f"Failed to send verification email: {e}")
                    email_sent = False
                
                logger.info(f"Verification email resent: {user.email} ({user.id})")
                
                return True, {
                    'email': user.email,
                    'verification_email_sent': email_sent,
                    'message': 'Verification email sent. Please check your inbox.'
                }
                
        except Exception as e:
            logger.error(f"Error resending verification email: {e}")
            return False, {
                'error': 'internal_error',
                'message': 'An error occurred while resending verification email'
            }
    
    def _validate_registration_data(
        self,
        email: str,
        password: str,
        first_name: str,
        last_name: str
    ) -> Dict[str, Any]:
        """Validate user registration data"""
        errors = []
        
        # Email validation
        if not self.validation_service.is_valid_email(email):
            errors.append({
                'field': 'email',
                'message': 'Invalid email address format'
            })
        
        # Password validation
        password_result = self.validation_service.validate_password(password)
        if not password_result['valid']:
            errors.extend([
                {'field': 'password', 'message': msg}
                for msg in password_result['errors']
            ])
        
        # Name validation
        if not first_name or len(first_name.strip()) < 1:
            errors.append({
                'field': 'first_name',
                'message': 'First name is required'
            })
        elif len(first_name.strip()) > 50:
            errors.append({
                'field': 'first_name',
                'message': 'First name must be 50 characters or less'
            })
        
        if not last_name or len(last_name.strip()) < 1:
            errors.append({
                'field': 'last_name',
                'message': 'Last name is required'
            })
        elif len(last_name.strip()) > 50:
            errors.append({
                'field': 'last_name',
                'message': 'Last name must be 50 characters or less'
            })
        
        return {
            'valid': len(errors) == 0,
            'errors': errors
        }
    
    def _get_or_create_tenant(
        self,
        session: Session,
        tenant_id: Optional[uuid.UUID] = None
    ) -> Optional[Tenant]:
        """Get tenant by ID or return default tenant"""
        if tenant_id:
            return session.query(Tenant).filter(
                Tenant.id == tenant_id,
                Tenant.is_active == True
            ).first()
        else:
            # Get default tenant (first active tenant)
            return session.query(Tenant).filter(
                Tenant.is_active == True
            ).first()
    
    def _hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        return bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt(rounds=12)
        ).decode('utf-8')
    
    def _generate_verification_token(self) -> str:
        """Generate secure email verification token"""
        return secrets.token_urlsafe(32)
    
    def _verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(
            password.encode('utf-8'),
            password_hash.encode('utf-8')
        )