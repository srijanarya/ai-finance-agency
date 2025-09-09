"""
JWT Token Service for AI Finance Agency
Handles JWT token generation, validation, and refresh operations
"""

import uuid
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple, Any, List
import jwt
from jwt import PyJWTError
from sqlalchemy.orm import Session

from database import get_db_session
from database.models.auth_models import User, UserSession, UserStatus, AuditLog, AuditAction
from config.config import config

logger = logging.getLogger(__name__)


class JWTService:
    """JWT token service for authentication and authorization"""
    
    def __init__(self):
        self.jwt_config = config.jwt
    
    def generate_tokens(
        self,
        user: User,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Generate access and refresh tokens for authenticated user
        
        Args:
            user: Authenticated user object
            ip_address: Client IP address
            user_agent: Client user agent string
            
        Returns:
            Tuple of (success: bool, result: dict)
        """
        try:
            if user.status != UserStatus.ACTIVE:
                return False, {
                    'error': 'user_inactive',
                    'message': 'User account is not active'
                }
            
            # Generate unique session ID
            session_id = str(uuid.uuid4())
            
            # Current time
            now = datetime.now(timezone.utc)
            
            # Generate access token
            access_token_payload = {
                'sub': str(user.id),  # Subject (user ID)
                'tenant_id': str(user.tenant_id),
                'email': user.email,
                'role': user.role.value,
                'session_id': session_id,
                'token_type': 'access',
                'iat': now,  # Issued at
                'exp': now + timedelta(minutes=self.jwt_config.access_token_expire_minutes),  # Expires
                'iss': self.jwt_config.issuer,  # Issuer
                'permissions': self._get_user_permissions(user)
            }
            
            # Generate refresh token
            refresh_token_payload = {
                'sub': str(user.id),
                'tenant_id': str(user.tenant_id),
                'session_id': session_id,
                'token_type': 'refresh',
                'iat': now,
                'exp': now + timedelta(days=self.jwt_config.refresh_token_expire_days),
                'iss': self.jwt_config.issuer
            }
            
            # Create JWT tokens
            access_token = jwt.encode(
                access_token_payload,
                self.jwt_config.secret_key,
                algorithm=self.jwt_config.algorithm
            )
            
            refresh_token = jwt.encode(
                refresh_token_payload,
                self.jwt_config.secret_key,
                algorithm=self.jwt_config.algorithm
            )
            
            # Store session in database
            with get_db_session() as session:
                user_session = UserSession(
                    id=uuid.UUID(session_id),
                    user_id=user.id,
                    refresh_token_hash=self._hash_token(refresh_token),
                    session_id=session_id,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    expires_at=now + timedelta(days=self.jwt_config.refresh_token_expire_days),
                    is_active=True
                )
                session.add(user_session)
                
                # Create audit log
                audit_log = AuditLog.create_log(
                    user_id=user.id,
                    tenant_id=user.tenant_id,
                    action=AuditAction.LOGIN,
                    resource_type='session',
                    resource_id=session_id,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    session_id=session_id,
                    details={
                        'login_method': 'jwt_token',
                        'access_token_expires': access_token_payload['exp'].isoformat(),
                        'refresh_token_expires': refresh_token_payload['exp'].isoformat()
                    }
                )
                session.add(audit_log)
                
                session.commit()
            
            logger.info(f"JWT tokens generated for user: {user.email} ({user.id})")
            
            return True, {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'token_type': 'Bearer',
                'expires_in': self.jwt_config.access_token_expire_minutes * 60,  # in seconds
                'refresh_expires_in': self.jwt_config.refresh_token_expire_days * 24 * 3600,  # in seconds
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role.value,
                    'tenant_id': str(user.tenant_id)
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating JWT tokens: {e}")
            return False, {
                'error': 'token_generation_failed',
                'message': 'Failed to generate authentication tokens'
            }
    
    def validate_access_token(
        self,
        token: str,
        required_permissions: Optional[List[str]] = None
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Validate JWT access token and extract user information
        
        Args:
            token: JWT access token
            required_permissions: List of required permissions
            
        Returns:
            Tuple of (valid: bool, user_info: dict)
        """
        try:
            # Decode and verify token
            payload = jwt.decode(
                token,
                self.jwt_config.secret_key,
                algorithms=[self.jwt_config.algorithm],
                options={'verify_exp': True}
            )
            
            # Verify token type
            if payload.get('token_type') != 'access':
                return False, {
                    'error': 'invalid_token_type',
                    'message': 'Token is not an access token'
                }
            
            # Verify issuer
            if payload.get('iss') != self.jwt_config.issuer:
                return False, {
                    'error': 'invalid_issuer',
                    'message': 'Token issued by invalid issuer'
                }
            
            # Check if session is still active
            session_id = payload.get('session_id')
            if not self._is_session_active(session_id):
                return False, {
                    'error': 'session_inactive',
                    'message': 'User session is no longer active'
                }
            
            # Check required permissions
            user_permissions = payload.get('permissions', [])
            if required_permissions:
                missing_permissions = set(required_permissions) - set(user_permissions)
                if missing_permissions:
                    return False, {
                        'error': 'insufficient_permissions',
                        'message': f'Missing required permissions: {list(missing_permissions)}'
                    }
            
            return True, {
                'user_id': payload.get('sub'),
                'tenant_id': payload.get('tenant_id'),
                'email': payload.get('email'),
                'role': payload.get('role'),
                'session_id': session_id,
                'permissions': user_permissions,
                'expires_at': datetime.fromtimestamp(payload.get('exp'), timezone.utc)
            }
            
        except jwt.ExpiredSignatureError:
            return False, {
                'error': 'token_expired',
                'message': 'Access token has expired'
            }
        except jwt.InvalidTokenError as e:
            return False, {
                'error': 'invalid_token',
                'message': f'Invalid access token: {str(e)}'
            }
        except Exception as e:
            logger.error(f"Error validating access token: {e}")
            return False, {
                'error': 'token_validation_failed',
                'message': 'Failed to validate access token'
            }
    
    def refresh_tokens(
        self,
        refresh_token: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Generate new tokens using refresh token
        
        Args:
            refresh_token: JWT refresh token
            ip_address: Client IP address
            user_agent: Client user agent string
            
        Returns:
            Tuple of (success: bool, result: dict)
        """
        try:
            # Decode refresh token
            payload = jwt.decode(
                refresh_token,
                self.jwt_config.secret_key,
                algorithms=[self.jwt_config.algorithm],
                options={'verify_exp': True}
            )
            
            # Verify token type
            if payload.get('token_type') != 'refresh':
                return False, {
                    'error': 'invalid_token_type',
                    'message': 'Token is not a refresh token'
                }
            
            session_id = payload.get('session_id')
            user_id = payload.get('sub')
            
            with get_db_session() as session:
                # Verify refresh token in database
                user_session = session.query(UserSession).filter(
                    UserSession.id == uuid.UUID(session_id),
                    UserSession.user_id == uuid.UUID(user_id),
                    UserSession.is_active == True
                ).first()
                
                if not user_session:
                    return False, {
                        'error': 'invalid_session',
                        'message': 'Session not found or inactive'
                    }
                
                # Verify refresh token hash
                if not self._verify_token_hash(refresh_token, user_session.refresh_token_hash):
                    return False, {
                        'error': 'invalid_refresh_token',
                        'message': 'Invalid refresh token'
                    }
                
                # Check if session is expired
                if user_session.expires_at < datetime.now(timezone.utc):
                    # Deactivate expired session
                    user_session.is_active = False
                    session.commit()
                    return False, {
                        'error': 'session_expired',
                        'message': 'Refresh token has expired'
                    }
                
                # Get user
                user = session.query(User).filter(
                    User.id == user_session.user_id,
                    User.is_active == True
                ).first()
                
                if not user or user.status != UserStatus.ACTIVE:
                    return False, {
                        'error': 'user_inactive',
                        'message': 'User account is not active'
                    }
                
                # Generate new tokens
                success, result = self.generate_tokens(user, ip_address, user_agent)
                
                if success:
                    # Deactivate old session
                    user_session.is_active = False
                    session.commit()
                    
                    logger.info(f"JWT tokens refreshed for user: {user.email} ({user.id})")
                
                return success, result
                
        except jwt.ExpiredSignatureError:
            return False, {
                'error': 'refresh_token_expired',
                'message': 'Refresh token has expired'
            }
        except jwt.InvalidTokenError as e:
            return False, {
                'error': 'invalid_refresh_token',
                'message': f'Invalid refresh token: {str(e)}'
            }
        except Exception as e:
            logger.error(f"Error refreshing tokens: {e}")
            return False, {
                'error': 'token_refresh_failed',
                'message': 'Failed to refresh authentication tokens'
            }
    
    def revoke_token(
        self,
        session_id: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Revoke JWT token by deactivating session
        
        Args:
            session_id: Session ID to revoke
            user_id: User ID (for additional verification)
            ip_address: Client IP address for audit
            
        Returns:
            Tuple of (success: bool, result: dict)
        """
        try:
            with get_db_session() as session:
                query = session.query(UserSession).filter(
                    UserSession.id == uuid.UUID(session_id),
                    UserSession.is_active == True
                )
                
                if user_id:
                    query = query.filter(UserSession.user_id == uuid.UUID(user_id))
                
                user_session = query.first()
                
                if not user_session:
                    return False, {
                        'error': 'session_not_found',
                        'message': 'Session not found or already inactive'
                    }
                
                # Deactivate session
                user_session.is_active = False
                user_session.revoked_at = datetime.now(timezone.utc)
                
                # Create audit log - need to get tenant_id from user
                user = session.query(User).get(user_session.user_id)
                audit_log = AuditLog.create_log(
                    user_id=user_session.user_id,
                    tenant_id=user.tenant_id if user else None,
                    action=AuditAction.LOGOUT,
                    resource_type='session',
                    resource_id=session_id,
                    ip_address=ip_address,
                    session_id=session_id,
                    details={'logout_method': 'token_revocation'}
                )
                session.add(audit_log)
                
                session.commit()
                
                logger.info(f"JWT session revoked: {session_id}")
                
                return True, {
                    'message': 'Token revoked successfully'
                }
                
        except Exception as e:
            logger.error(f"Error revoking token: {e}")
            return False, {
                'error': 'token_revocation_failed',
                'message': 'Failed to revoke authentication token'
            }
    
    def revoke_all_user_tokens(
        self,
        user_id: str,
        ip_address: Optional[str] = None
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Revoke all JWT tokens for a user
        
        Args:
            user_id: User ID
            ip_address: Client IP address for audit
            
        Returns:
            Tuple of (success: bool, result: dict)
        """
        try:
            with get_db_session() as session:
                # Get all active sessions for user
                active_sessions = session.query(UserSession).filter(
                    UserSession.user_id == uuid.UUID(user_id),
                    UserSession.is_active == True
                ).all()
                
                if not active_sessions:
                    return True, {
                        'message': 'No active sessions found',
                        'revoked_count': 0
                    }
                
                # Get user info for audit logs
                user = session.query(User).get(uuid.UUID(user_id))
                tenant_id = user.tenant_id if user else None
                
                # Deactivate all sessions
                revoked_count = 0
                for user_session in active_sessions:
                    user_session.is_active = False
                    user_session.revoked_at = datetime.now(timezone.utc)
                    revoked_count += 1
                    
                    # Create audit log for each session
                    audit_log = AuditLog.create_log(
                        user_id=user_session.user_id,
                        tenant_id=tenant_id,
                        action=AuditAction.LOGOUT,
                        resource_type='session',
                        resource_id=str(user_session.id),
                        ip_address=ip_address,
                        session_id=str(user_session.id),
                        details={'logout_method': 'revoke_all_tokens'}
                    )
                    session.add(audit_log)
                
                session.commit()
                
                logger.info(f"All JWT sessions revoked for user: {user_id} (count: {revoked_count})")
                
                return True, {
                    'message': f'Successfully revoked {revoked_count} active sessions',
                    'revoked_count': revoked_count
                }
                
        except Exception as e:
            logger.error(f"Error revoking all user tokens: {e}")
            return False, {
                'error': 'bulk_revocation_failed',
                'message': 'Failed to revoke all user tokens'
            }
    
    def _get_user_permissions(self, user: User) -> List[str]:
        """Get user permissions based on role"""
        permissions = []
        
        # Base permissions for all authenticated users
        permissions.extend([
            'profile:read',
            'profile:update'
        ])
        
        # Role-based permissions
        if user.role.value == 'ADMIN':
            permissions.extend([
                'users:read', 'users:create', 'users:update', 'users:delete',
                'tenants:read', 'tenants:create', 'tenants:update', 'tenants:delete',
                'audit:read', 'system:admin'
            ])
        elif user.role.value == 'MANAGER':
            permissions.extend([
                'users:read', 'users:create', 'users:update',
                'tenants:read', 'audit:read'
            ])
        elif user.role.value == 'USER':
            permissions.extend([
                'content:read', 'content:create'
            ])
        
        return permissions
    
    def _is_session_active(self, session_id: str) -> bool:
        """Check if session is still active in database"""
        try:
            with get_db_session() as session:
                user_session = session.query(UserSession).filter(
                    UserSession.id == uuid.UUID(session_id),
                    UserSession.is_active == True
                ).first()
                
                return user_session is not None
        except Exception:
            return False
    
    def _hash_token(self, token: str) -> str:
        """Hash token for secure storage"""
        import hashlib
        return hashlib.sha256(token.encode()).hexdigest()
    
    def _verify_token_hash(self, token: str, token_hash: str) -> bool:
        """Verify token against stored hash"""
        return self._hash_token(token) == token_hash