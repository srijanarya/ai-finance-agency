"""
Database utility functions for AI Finance Agency
Provides helper functions for database operations, migrations, and management
"""

import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any

from sqlalchemy import text, inspect, MetaData
from sqlalchemy.exc import SQLAlchemyError

from database.connection import (
    get_db_session, get_async_db_session, engine, async_engine,
    init_database, create_all_tables, drop_all_tables
)
from database.models.auth_models import (
    Tenant, User, UserSession, PasswordResetToken,
    UserPermission, AuditLog, AuditAction, UserRole, UserStatus
)

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Database management utility class"""
    
    @staticmethod
    def get_database_info() -> Dict[str, Any]:
        """
        Get comprehensive database information
        
        Returns:
            Dictionary with database statistics and health info
        """
        info = {}
        
        try:
            with get_db_session() as session:
                # Basic database info
                result = session.execute(text("SELECT version()"))
                info['postgresql_version'] = result.scalar()
                
                # Database size
                result = session.execute(text("""
                    SELECT pg_size_pretty(pg_database_size(current_database())) as size
                """))
                info['database_size'] = result.scalar()
                
                # Table statistics
                table_stats = {}
                tables = ['tenants', 'users', 'user_sessions', 'user_permissions', 
                         'password_reset_tokens', 'audit_logs']
                
                for table in tables:
                    try:
                        result = session.execute(text(f"SELECT COUNT(*) FROM {table}"))
                        table_stats[table] = result.scalar()
                    except SQLAlchemyError:
                        table_stats[table] = 0
                
                info['table_statistics'] = table_stats
                
                # Connection info
                result = session.execute(text("""
                    SELECT count(*) as total_connections,
                           count(*) FILTER (WHERE state = 'active') as active_connections
                    FROM pg_stat_activity 
                    WHERE datname = current_database()
                """))
                conn_info = result.fetchone()
                info['connections'] = {
                    'total': conn_info[0],
                    'active': conn_info[1]
                }
                
                # Database health
                info['healthy'] = True
                info['last_checked'] = datetime.utcnow().isoformat()
                
        except Exception as e:
            logger.error(f"Failed to get database info: {e}")
            info['healthy'] = False
            info['error'] = str(e)
        
        return info
    
    @staticmethod
    def cleanup_expired_tokens():
        """Clean up expired tokens and sessions"""
        cleaned_up = {'sessions': 0, 'reset_tokens': 0}
        
        try:
            with get_db_session() as session:
                # Clean up expired sessions
                expired_sessions = session.query(UserSession).filter(
                    UserSession.expires_at < datetime.utcnow()
                ).all()
                
                for session_obj in expired_sessions:
                    session.delete(session_obj)
                
                cleaned_up['sessions'] = len(expired_sessions)
                
                # Clean up expired password reset tokens
                expired_tokens = session.query(PasswordResetToken).filter(
                    PasswordResetToken.expires_at < datetime.utcnow()
                ).all()
                
                for token in expired_tokens:
                    session.delete(token)
                
                cleaned_up['reset_tokens'] = len(expired_tokens)
                
                session.commit()
                logger.info(f"Cleaned up {cleaned_up}")
                
        except Exception as e:
            logger.error(f"Failed to cleanup expired tokens: {e}")
            raise
        
        return cleaned_up
    
    @staticmethod
    def get_user_statistics(tenant_id: Optional[uuid.UUID] = None) -> Dict[str, Any]:
        """
        Get user statistics for monitoring
        
        Args:
            tenant_id: Optional tenant filter
            
        Returns:
            Dictionary with user statistics
        """
        stats = {}
        
        try:
            with get_db_session() as session:
                query = session.query(User)
                if tenant_id:
                    query = query.filter(User.tenant_id == tenant_id)
                
                # Total users
                stats['total_users'] = query.count()
                
                # Active users
                stats['active_users'] = query.filter(
                    User.is_active == True,
                    User.status == UserStatus.ACTIVE
                ).count()
                
                # Users by role
                stats['users_by_role'] = {}
                for role in UserRole:
                    count = query.filter(User.role == role).count()
                    stats['users_by_role'][role.value] = count
                
                # Users by status
                stats['users_by_status'] = {}
                for status in UserStatus:
                    count = query.filter(User.status == status).count()
                    stats['users_by_status'][status.value] = count
                
                # Email verification stats
                stats['email_verified'] = query.filter(
                    User.email_verified == True
                ).count()
                stats['email_unverified'] = query.filter(
                    User.email_verified == False
                ).count()
                
                # MFA stats
                stats['mfa_enabled'] = query.filter(
                    User.mfa_enabled == True
                ).count()
                
                # Recent login stats (last 30 days)
                thirty_days_ago = datetime.utcnow() - timedelta(days=30)
                stats['recent_logins'] = query.filter(
                    User.last_login_at >= thirty_days_ago
                ).count()
                
        except Exception as e:
            logger.error(f"Failed to get user statistics: {e}")
            stats['error'] = str(e)
        
        return stats
    
    @staticmethod
    def audit_user_activity(
        user_id: uuid.UUID,
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Get user activity audit trail
        
        Args:
            user_id: User UUID
            days: Number of days to look back
            
        Returns:
            List of audit log entries
        """
        try:
            with get_db_session() as session:
                since_date = datetime.utcnow() - timedelta(days=days)
                
                audit_logs = session.query(AuditLog).filter(
                    AuditLog.user_id == user_id,
                    AuditLog.timestamp >= since_date
                ).order_by(AuditLog.timestamp.desc()).limit(100).all()
                
                return [
                    {
                        'timestamp': log.timestamp.isoformat(),
                        'action': log.action.value,
                        'resource_type': log.resource_type,
                        'resource_id': log.resource_id,
                        'success': log.success,
                        'ip_address': log.ip_address,
                        'details': log.details
                    }
                    for log in audit_logs
                ]
                
        except Exception as e:
            logger.error(f"Failed to get user activity audit: {e}")
            return []


class TenantManager:
    """Multi-tenant database operations"""
    
    @staticmethod
    def create_tenant(
        name: str,
        subdomain: Optional[str] = None,
        contact_email: Optional[str] = None,
        subscription_tier: str = "basic"
    ) -> Tenant:
        """
        Create a new tenant
        
        Args:
            name: Tenant name
            subdomain: Optional subdomain
            contact_email: Contact email
            subscription_tier: Subscription tier
            
        Returns:
            Created Tenant instance
        """
        try:
            with get_db_session() as session:
                tenant = Tenant(
                    name=name,
                    subdomain=subdomain,
                    contact_email=contact_email,
                    subscription_tier=subscription_tier,
                    settings={},
                    features={}
                )
                session.add(tenant)
                session.commit()
                
                # Create audit log
                audit_log = AuditLog.create_log(
                    user_id=None,
                    tenant_id=tenant.id,
                    action=AuditAction.CREATE,
                    resource_type='tenant',
                    resource_id=str(tenant.id),
                    new_values={'name': name, 'subdomain': subdomain}
                )
                session.add(audit_log)
                session.commit()
                
                logger.info(f"Created tenant: {tenant.name} ({tenant.id})")
                return tenant
                
        except Exception as e:
            logger.error(f"Failed to create tenant: {e}")
            raise
    
    @staticmethod
    def get_tenant_by_subdomain(subdomain: str) -> Optional[Tenant]:
        """
        Get tenant by subdomain
        
        Args:
            subdomain: Tenant subdomain
            
        Returns:
            Tenant instance or None
        """
        try:
            with get_db_session() as session:
                return session.query(Tenant).filter(
                    Tenant.subdomain == subdomain,
                    Tenant.is_active == True
                ).first()
        except Exception as e:
            logger.error(f"Failed to get tenant by subdomain: {e}")
            return None
    
    @staticmethod
    def get_tenant_users_count(tenant_id: uuid.UUID) -> int:
        """
        Get number of users in tenant
        
        Args:
            tenant_id: Tenant UUID
            
        Returns:
            Number of users
        """
        try:
            with get_db_session() as session:
                return session.query(User).filter(
                    User.tenant_id == tenant_id
                ).count()
        except Exception as e:
            logger.error(f"Failed to get tenant user count: {e}")
            return 0
    
    @staticmethod
    def disable_tenant(tenant_id: uuid.UUID, disabled_by: Optional[uuid.UUID] = None):
        """
        Disable a tenant and all its users
        
        Args:
            tenant_id: Tenant UUID to disable
            disabled_by: User who disabled the tenant
        """
        try:
            with get_db_session() as session:
                # Disable tenant
                tenant = session.query(Tenant).filter(
                    Tenant.id == tenant_id
                ).first()
                
                if tenant:
                    tenant.is_active = False
                    
                    # Disable all users in tenant
                    users = session.query(User).filter(
                        User.tenant_id == tenant_id
                    ).all()
                    
                    for user in users:
                        user.is_active = False
                        user.status = UserStatus.SUSPENDED
                    
                    # Revoke all active sessions
                    sessions = session.query(UserSession).join(User).filter(
                        User.tenant_id == tenant_id,
                        UserSession.is_active == True
                    ).all()
                    
                    for session_obj in sessions:
                        session_obj.revoke(disabled_by)
                    
                    session.commit()
                    
                    # Create audit log
                    audit_log = AuditLog.create_log(
                        user_id=disabled_by,
                        tenant_id=tenant_id,
                        action=AuditAction.UPDATE,
                        resource_type='tenant',
                        resource_id=str(tenant_id),
                        old_values={'is_active': True},
                        new_values={'is_active': False},
                        details={'users_disabled': len(users), 'sessions_revoked': len(sessions)}
                    )
                    session.add(audit_log)
                    session.commit()
                    
                    logger.info(f"Disabled tenant {tenant_id} and {len(users)} users")
                    
        except Exception as e:
            logger.error(f"Failed to disable tenant: {e}")
            raise


class DatabaseMaintenance:
    """Database maintenance and optimization utilities"""
    
    @staticmethod
    def vacuum_analyze():
        """Run VACUUM ANALYZE on all tables"""
        try:
            with get_db_session() as session:
                tables = ['tenants', 'users', 'user_sessions', 'user_permissions', 
                         'password_reset_tokens', 'audit_logs']
                
                for table in tables:
                    session.execute(text(f"VACUUM ANALYZE {table}"))
                    logger.info(f"Vacuumed and analyzed table: {table}")
                
                session.commit()
                
        except Exception as e:
            logger.error(f"Failed to vacuum analyze: {e}")
            raise
    
    @staticmethod
    def reindex_tables():
        """Reindex all authentication tables"""
        try:
            with get_db_session() as session:
                tables = ['tenants', 'users', 'user_sessions', 'user_permissions', 
                         'password_reset_tokens', 'audit_logs']
                
                for table in tables:
                    session.execute(text(f"REINDEX TABLE {table}"))
                    logger.info(f"Reindexed table: {table}")
                
                session.commit()
                
        except Exception as e:
            logger.error(f"Failed to reindex tables: {e}")
            raise
    
    @staticmethod
    def cleanup_old_audit_logs(days_to_keep: int = 90):
        """
        Clean up old audit logs
        
        Args:
            days_to_keep: Number of days to keep audit logs
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
            
            with get_db_session() as session:
                deleted_count = session.query(AuditLog).filter(
                    AuditLog.timestamp < cutoff_date
                ).delete()
                
                session.commit()
                logger.info(f"Cleaned up {deleted_count} old audit logs")
                
                return deleted_count
                
        except Exception as e:
            logger.error(f"Failed to cleanup old audit logs: {e}")
            raise


def check_database_health() -> Dict[str, Any]:
    """
    Comprehensive database health check
    
    Returns:
        Health check results
    """
    health_check = {
        'healthy': False,
        'timestamp': datetime.utcnow().isoformat(),
        'checks': {}
    }
    
    try:
        # Test basic connectivity
        with get_db_session() as session:
            session.execute(text("SELECT 1"))
            health_check['checks']['connectivity'] = True
            
        # Check table existence
        inspector = inspect(engine)
        required_tables = ['tenants', 'users', 'user_sessions', 'user_permissions']
        existing_tables = inspector.get_table_names()
        
        missing_tables = [t for t in required_tables if t not in existing_tables]
        health_check['checks']['tables_exist'] = len(missing_tables) == 0
        if missing_tables:
            health_check['checks']['missing_tables'] = missing_tables
        
        # Get database info
        db_info = DatabaseManager.get_database_info()
        health_check['database_info'] = db_info
        
        # All checks passed
        health_check['healthy'] = all([
            health_check['checks']['connectivity'],
            health_check['checks']['tables_exist']
        ])
        
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_check['error'] = str(e)
        health_check['checks']['connectivity'] = False
    
    return health_check


def reset_database(confirm: bool = False):
    """
    Reset database (DROP ALL TABLES) - USE WITH EXTREME CAUTION
    
    Args:
        confirm: Must be True to actually reset
    """
    if not confirm:
        raise ValueError("Must confirm database reset by setting confirm=True")
    
    logger.warning("RESETTING DATABASE - ALL DATA WILL BE LOST")
    
    try:
        drop_all_tables()
        create_all_tables()
        logger.info("Database reset completed")
    except Exception as e:
        logger.error(f"Database reset failed: {e}")
        raise


if __name__ == "__main__":
    # Quick database health check
    init_database()
    health = check_database_health()
    
    if health['healthy']:
        print("✅ Database is healthy")
        print(f"📊 Statistics: {health['database_info']['table_statistics']}")
    else:
        print("❌ Database health check failed")
        print(f"Error: {health.get('error', 'Unknown error')}")