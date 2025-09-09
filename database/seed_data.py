"""
Database seed data for AI Finance Agency
Creates initial tenants, users, and demo data for development and testing
"""

import hashlib
import secrets
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

import bcrypt
from sqlalchemy.exc import IntegrityError

from database.connection import get_db_session, init_database
from database.models.auth_models import (
    Tenant, User, UserRole, UserStatus, PermissionType,
    UserPermission, AuditLog, AuditAction
)


class DatabaseSeeder:
    """Database seeder for creating initial data"""
    
    def __init__(self):
        """Initialize the seeder"""
        self.session = None
    
    def seed_all(self, include_demo_data: bool = False):
        """
        Seed all initial data
        
        Args:
            include_demo_data: Whether to include demo users and content
        """
        print("🌱 Starting database seeding...")
        
        try:
            with get_db_session() as session:
                self.session = session
                
                # Create tenants
                tenants = self.seed_tenants()
                print(f"✅ Created {len(tenants)} tenants")
                
                # Create admin users
                admin_users = self.seed_admin_users(tenants)
                print(f"✅ Created {len(admin_users)} admin users")
                
                # Create demo data if requested
                if include_demo_data:
                    demo_users = self.seed_demo_users(tenants)
                    print(f"✅ Created {len(demo_users)} demo users")
                    
                    self.seed_demo_permissions(admin_users + demo_users)
                    print("✅ Created demo permissions")
                
                print("🎉 Database seeding completed successfully!")
                
        except Exception as e:
            print(f"❌ Database seeding failed: {e}")
            raise
    
    def seed_tenants(self) -> List[Tenant]:
        """Create initial tenant organizations"""
        tenants_data = [
            {
                'name': 'AI Finance Agency',
                'subdomain': 'main',
                'domain': 'ai-finance-agency.com',
                'contact_email': 'admin@ai-finance-agency.com',
                'contact_name': 'Platform Administrator',
                'subscription_tier': 'enterprise',
                'billing_email': 'billing@ai-finance-agency.com',
                'settings': {
                    'theme': 'professional',
                    'timezone': 'UTC',
                    'language': 'en',
                    'notifications_enabled': True,
                    'analytics_enabled': True
                },
                'features': {
                    'advanced_analytics': True,
                    'custom_branding': True,
                    'api_access': True,
                    'priority_support': True,
                    'multi_user': True,
                    'data_export': True
                }
            },
            {
                'name': 'Demo Financial Services',
                'subdomain': 'demo',
                'domain': 'demo.ai-finance-agency.com',
                'contact_email': 'demo@ai-finance-agency.com',
                'contact_name': 'Demo User',
                'subscription_tier': 'basic',
                'billing_email': 'demo@ai-finance-agency.com',
                'settings': {
                    'theme': 'default',
                    'timezone': 'UTC',
                    'language': 'en',
                    'notifications_enabled': True,
                    'analytics_enabled': False
                },
                'features': {
                    'advanced_analytics': False,
                    'custom_branding': False,
                    'api_access': False,
                    'priority_support': False,
                    'multi_user': True,
                    'data_export': False
                }
            }
        ]
        
        tenants = []
        for tenant_data in tenants_data:
            try:
                tenant = Tenant(**tenant_data)
                self.session.add(tenant)
                self.session.flush()  # Get the ID
                tenants.append(tenant)
            except IntegrityError:
                self.session.rollback()
                # Tenant might already exist, try to find it
                existing = self.session.query(Tenant).filter_by(
                    subdomain=tenant_data['subdomain']
                ).first()
                if existing:
                    tenants.append(existing)
        
        return tenants
    
    def seed_admin_users(self, tenants: List[Tenant]) -> List[User]:
        """Create admin users for each tenant"""
        admin_users = []
        
        admin_data = [
            {
                'email': 'admin@ai-finance-agency.com',
                'password': 'AdminPass123!',
                'first_name': 'System',
                'last_name': 'Administrator',
                'display_name': 'Admin',
                'role': UserRole.ADMIN,
                'status': UserStatus.ACTIVE,
                'email_verified': True,
                'email_verified_at': datetime.utcnow(),
                'preferences': {
                    'theme': 'dark',
                    'dashboard_layout': 'advanced',
                    'notifications': {
                        'email': True,
                        'browser': True,
                        'mobile': False
                    }
                }
            },
            {
                'email': 'demo@ai-finance-agency.com',
                'password': 'DemoPass123!',
                'first_name': 'Demo',
                'last_name': 'User',
                'display_name': 'Demo',
                'role': UserRole.ADMIN,
                'status': UserStatus.ACTIVE,
                'email_verified': True,
                'email_verified_at': datetime.utcnow(),
                'preferences': {
                    'theme': 'light',
                    'dashboard_layout': 'simple',
                    'notifications': {
                        'email': False,
                        'browser': True,
                        'mobile': False
                    }
                }
            }
        ]
        
        for i, user_data in enumerate(admin_data):
            tenant = tenants[i] if i < len(tenants) else tenants[0]
            
            # Hash password
            password = user_data.pop('password')
            password_hash = bcrypt.hashpw(
                password.encode('utf-8'), 
                bcrypt.gensalt(rounds=12)
            ).decode('utf-8')
            
            try:
                user = User(
                    tenant_id=tenant.id,
                    password_hash=password_hash,
                    password_changed_at=datetime.utcnow(),
                    **user_data
                )
                self.session.add(user)
                self.session.flush()
                admin_users.append(user)
                
                # Create audit log
                audit_log = AuditLog.create_log(
                    user_id=None,
                    tenant_id=tenant.id,
                    action=AuditAction.CREATE,
                    resource_type='user',
                    resource_id=str(user.id),
                    new_values={
                        'email': user.email,
                        'role': user.role.value,
                        'status': user.status.value
                    },
                    details={'created_by': 'database_seeder'}
                )
                self.session.add(audit_log)
                
            except IntegrityError:
                self.session.rollback()
                # User might already exist
                existing = self.session.query(User).filter_by(
                    email=user_data['email'],
                    tenant_id=tenant.id
                ).first()
                if existing:
                    admin_users.append(existing)
        
        return admin_users
    
    def seed_demo_users(self, tenants: List[Tenant]) -> List[User]:
        """Create demo users for testing"""
        demo_users = []
        
        demo_data = [
            {
                'email': 'analyst@ai-finance-agency.com',
                'password': 'AnalystPass123!',
                'first_name': 'John',
                'last_name': 'Analyst',
                'display_name': 'John A.',
                'role': UserRole.ANALYST,
                'status': UserStatus.ACTIVE,
                'email_verified': True,
                'email_verified_at': datetime.utcnow()
            },
            {
                'email': 'manager@ai-finance-agency.com', 
                'password': 'ManagerPass123!',
                'first_name': 'Sarah',
                'last_name': 'Manager',
                'display_name': 'Sarah M.',
                'role': UserRole.MANAGER,
                'status': UserStatus.ACTIVE,
                'email_verified': True,
                'email_verified_at': datetime.utcnow()
            },
            {
                'email': 'user@ai-finance-agency.com',
                'password': 'UserPass123!',
                'first_name': 'Mike',
                'last_name': 'User',
                'display_name': 'Mike U.',
                'role': UserRole.USER,
                'status': UserStatus.ACTIVE,
                'email_verified': True,
                'email_verified_at': datetime.utcnow()
            },
            {
                'email': 'viewer@ai-finance-agency.com',
                'password': 'ViewerPass123!',
                'first_name': 'Jane',
                'last_name': 'Viewer',
                'display_name': 'Jane V.',
                'role': UserRole.VIEWER,
                'status': UserStatus.ACTIVE,
                'email_verified': True,
                'email_verified_at': datetime.utcnow()
            }
        ]
        
        main_tenant = tenants[0]  # Use main tenant for demo users
        
        for user_data in demo_data:
            password = user_data.pop('password')
            password_hash = bcrypt.hashpw(
                password.encode('utf-8'),
                bcrypt.gensalt(rounds=12)
            ).decode('utf-8')
            
            try:
                user = User(
                    tenant_id=main_tenant.id,
                    password_hash=password_hash,
                    password_changed_at=datetime.utcnow(),
                    preferences={
                        'theme': 'light',
                        'dashboard_layout': 'standard'
                    },
                    **user_data
                )
                self.session.add(user)
                self.session.flush()
                demo_users.append(user)
                
            except IntegrityError:
                self.session.rollback()
                existing = self.session.query(User).filter_by(
                    email=user_data['email'],
                    tenant_id=main_tenant.id
                ).first()
                if existing:
                    demo_users.append(existing)
        
        return demo_users
    
    def seed_demo_permissions(self, users: List[User]):
        """Create demo permissions for users"""
        permission_templates = {
            UserRole.ADMIN: [
                ('users', PermissionType.ADMIN),
                ('content', PermissionType.ADMIN),
                ('analytics', PermissionType.ADMIN),
                ('settings', PermissionType.ADMIN),
                ('billing', PermissionType.ADMIN)
            ],
            UserRole.MANAGER: [
                ('users', PermissionType.MANAGE),
                ('content', PermissionType.WRITE),
                ('analytics', PermissionType.READ),
                ('settings', PermissionType.READ)
            ],
            UserRole.ANALYST: [
                ('content', PermissionType.WRITE),
                ('analytics', PermissionType.READ),
                ('dashboard', PermissionType.READ)
            ],
            UserRole.USER: [
                ('content', PermissionType.READ),
                ('dashboard', PermissionType.READ)
            ],
            UserRole.VIEWER: [
                ('dashboard', PermissionType.READ)
            ]
        }
        
        admin_user = next((u for u in users if u.role == UserRole.ADMIN), None)
        
        for user in users:
            permissions = permission_templates.get(user.role, [])
            
            for resource, action in permissions:
                try:
                    permission = UserPermission(
                        user_id=user.id,
                        resource=resource,
                        action=action,
                        granted_by=admin_user.id if admin_user else None
                    )
                    self.session.add(permission)
                except IntegrityError:
                    self.session.rollback()
                    continue
    
    def create_default_tenant_if_not_exists(self) -> Tenant:
        """Create default tenant if none exists"""
        with get_db_session() as session:
            existing = session.query(Tenant).first()
            if existing:
                return existing
            
            tenant = Tenant(
                name="Default Organization",
                subscription_tier="basic",
                settings={},
                features={}
            )
            session.add(tenant)
            session.commit()
            return tenant


def seed_clients():
    """Legacy function name for compatibility - seeds database"""
    try:
        init_database()
        seeder = DatabaseSeeder()
        seeder.seed_all(include_demo_data=True)
    except Exception as e:
        print(f"Failed to seed database: {e}")
        raise


def seed_database(include_demo_data: bool = True):
    """
    Main function to seed the database
    
    Args:
        include_demo_data: Whether to include demo users and data
    """
    try:
        init_database()
        seeder = DatabaseSeeder()
        seeder.seed_all(include_demo_data=include_demo_data)
    except Exception as e:
        print(f"Failed to seed database: {e}")
        raise


def create_admin_user(
    tenant_id: uuid.UUID,
    email: str,
    password: str,
    first_name: str,
    last_name: str
) -> User:
    """
    Create a new admin user
    
    Args:
        tenant_id: Tenant UUID
        email: User email
        password: User password (will be hashed)
        first_name: User's first name
        last_name: User's last name
        
    Returns:
        Created User instance
    """
    password_hash = bcrypt.hashpw(
        password.encode('utf-8'),
        bcrypt.gensalt(rounds=12)
    ).decode('utf-8')
    
    with get_db_session() as session:
        user = User(
            tenant_id=tenant_id,
            email=email,
            password_hash=password_hash,
            first_name=first_name,
            last_name=last_name,
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE,
            email_verified=True,
            email_verified_at=datetime.utcnow(),
            password_changed_at=datetime.utcnow()
        )
        session.add(user)
        session.commit()
        return user


if __name__ == "__main__":
    import sys
    
    include_demo = "--no-demo" not in sys.argv
    seed_database(include_demo_data=include_demo)
    print("\n🎉 Database seeding complete!")
    
    if include_demo:
        print("\n📋 Demo Credentials:")
        print("Admin: admin@ai-finance-agency.com / AdminPass123!")
        print("Demo:  demo@ai-finance-agency.com  / DemoPass123!")
        print("Analyst: analyst@ai-finance-agency.com / AnalystPass123!")
        print("Manager: manager@ai-finance-agency.com / ManagerPass123!")
        print("User: user@ai-finance-agency.com / UserPass123!")
        print("Viewer: viewer@ai-finance-agency.com / ViewerPass123!")
        print("\n⚠️  Change these passwords in production!")