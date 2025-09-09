"""Initial authentication schema

Revision ID: 001_initial_auth
Revises: 
Create Date: 2024-12-09 20:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial_auth'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial authentication tables"""
    
    # Create custom enum types
    sa.Enum('PENDING', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'BANNED', name='userstatus').create(op.get_bind())
    sa.Enum('ADMIN', 'USER', 'VIEWER', 'ANALYST', 'MANAGER', name='userrole').create(op.get_bind())
    sa.Enum('READ', 'WRITE', 'DELETE', 'ADMIN', 'MANAGE', name='permissiontype').create(op.get_bind())
    sa.Enum('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'ROLE_CHANGE', 'PERMISSION_GRANT', 'PERMISSION_REVOKE', name='auditaction').create(op.get_bind())
    
    # Create tenants table
    op.create_table('tenants',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('subdomain', sa.String(length=63), nullable=True),
        sa.Column('domain', sa.String(length=253), nullable=True),
        sa.Column('contact_email', sa.String(length=320), nullable=True),
        sa.Column('contact_name', sa.String(length=255), nullable=True),
        sa.Column('subscription_tier', sa.String(length=50), nullable=False),
        sa.Column('billing_email', sa.String(length=320), nullable=True),
        sa.Column('settings', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('features', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.CheckConstraint("name != ''", name='tenant_name_not_empty'),
        sa.CheckConstraint("subdomain ~ '^[a-z0-9-]+$'", name='tenant_subdomain_format'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('domain'),
        sa.UniqueConstraint('subdomain')
    )
    
    # Create indexes for tenants
    op.create_index('idx_tenant_active', 'tenants', ['is_active'])
    op.create_index('idx_tenant_created', 'tenants', ['created_at'])
    op.create_index(op.f('ix_tenants_id'), 'tenants', ['id'])
    op.create_index(op.f('ix_tenants_name'), 'tenants', ['name'])
    
    # Create users table
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=320), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('first_name', sa.String(length=100), nullable=False),
        sa.Column('last_name', sa.String(length=100), nullable=False),
        sa.Column('display_name', sa.String(length=200), nullable=True),
        sa.Column('avatar_url', sa.String(length=500), nullable=True),
        sa.Column('role', sa.Enum('ADMIN', 'USER', 'VIEWER', 'ANALYST', 'MANAGER', name='userrole'), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'BANNED', name='userstatus'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('email_verified', sa.Boolean(), nullable=False),
        sa.Column('email_verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_login_ip', sa.String(length=45), nullable=True),
        sa.Column('failed_login_attempts', sa.Integer(), nullable=False),
        sa.Column('locked_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('password_changed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('mfa_enabled', sa.Boolean(), nullable=False),
        sa.Column('mfa_secret', sa.String(length=32), nullable=True),
        sa.Column('backup_codes', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('preferences', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('timezone', sa.String(length=50), nullable=True),
        sa.Column('language', sa.String(length=10), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("first_name != ''", name='user_first_name_not_empty'),
        sa.CheckConstraint("last_name != ''", name='user_last_name_not_empty'),
        sa.CheckConstraint("email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'", name='user_email_format'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email', 'tenant_id', name='unique_email_per_tenant')
    )
    
    # Create indexes for users
    op.create_index('idx_user_created', 'users', ['created_at'])
    op.create_index('idx_user_email_tenant', 'users', ['email', 'tenant_id'])
    op.create_index('idx_user_last_login', 'users', ['last_login_at'])
    op.create_index('idx_user_role', 'users', ['role'])
    op.create_index('idx_user_status_active', 'users', ['status', 'is_active'])
    op.create_index(op.f('ix_users_email'), 'users', ['email'])
    op.create_index(op.f('ix_users_id'), 'users', ['id'])
    op.create_index(op.f('ix_users_tenant_id'), 'users', ['tenant_id'])
    
    # Create user_sessions table
    op.create_table('user_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('refresh_token_hash', sa.String(length=255), nullable=False),
        sa.Column('session_id', sa.String(length=255), nullable=False),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('device_id', sa.String(length=255), nullable=True),
        sa.Column('client_type', sa.String(length=50), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('last_used_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revoked_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('refresh_token_hash'),
        sa.UniqueConstraint('session_id')
    )
    
    # Create indexes for user_sessions
    op.create_index('idx_session_expires', 'user_sessions', ['expires_at'])
    op.create_index('idx_session_last_used', 'user_sessions', ['last_used_at'])
    op.create_index('idx_session_user_active', 'user_sessions', ['user_id', 'is_active'])
    op.create_index(op.f('ix_user_sessions_id'), 'user_sessions', ['id'])
    op.create_index(op.f('ix_user_sessions_user_id'), 'user_sessions', ['user_id'])
    
    # Create password_reset_tokens table
    op.create_table('password_reset_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('token_hash', sa.String(length=255), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token_hash')
    )
    
    # Create indexes for password_reset_tokens
    op.create_index('idx_password_reset_expires', 'password_reset_tokens', ['expires_at'])
    op.create_index('idx_password_reset_user', 'password_reset_tokens', ['user_id'])
    op.create_index(op.f('ix_password_reset_tokens_id'), 'password_reset_tokens', ['id'])
    
    # Create user_permissions table
    op.create_table('user_permissions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('resource', sa.String(length=100), nullable=False),
        sa.Column('action', sa.Enum('READ', 'WRITE', 'DELETE', 'ADMIN', 'MANAGE', name='permissiontype'), nullable=False),
        sa.Column('resource_id', sa.String(length=255), nullable=True),
        sa.Column('granted_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('granted_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['granted_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'resource', 'action', 'resource_id', name='unique_user_permission')
    )
    
    # Create indexes for user_permissions
    op.create_index('idx_permission_expires', 'user_permissions', ['expires_at'])
    op.create_index('idx_permission_user_resource', 'user_permissions', ['user_id', 'resource'])
    op.create_index(op.f('ix_user_permissions_action'), 'user_permissions', ['action'])
    op.create_index(op.f('ix_user_permissions_id'), 'user_permissions', ['id'])
    op.create_index(op.f('ix_user_permissions_resource'), 'user_permissions', ['resource'])
    op.create_index(op.f('ix_user_permissions_user_id'), 'user_permissions', ['user_id'])
    
    # Create audit_logs table
    op.create_table('audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('action', sa.Enum('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'ROLE_CHANGE', 'PERMISSION_GRANT', 'PERMISSION_REVOKE', name='auditaction'), nullable=False),
        sa.Column('resource_type', sa.String(length=100), nullable=False),
        sa.Column('resource_id', sa.String(length=255), nullable=True),
        sa.Column('old_values', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('new_values', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('session_id', sa.String(length=255), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('success', sa.Boolean(), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for audit_logs
    op.create_index('idx_audit_resource', 'audit_logs', ['resource_type', 'resource_id'])
    op.create_index('idx_audit_tenant_timestamp', 'audit_logs', ['tenant_id', 'timestamp'])
    op.create_index('idx_audit_timestamp', 'audit_logs', ['timestamp'])
    op.create_index('idx_audit_user_action', 'audit_logs', ['user_id', 'action'])
    op.create_index(op.f('ix_audit_logs_action'), 'audit_logs', ['action'])
    op.create_index(op.f('ix_audit_logs_id'), 'audit_logs', ['id'])
    op.create_index(op.f('ix_audit_logs_resource_id'), 'audit_logs', ['resource_id'])
    op.create_index(op.f('ix_audit_logs_resource_type'), 'audit_logs', ['resource_type'])
    op.create_index(op.f('ix_audit_logs_tenant_id'), 'audit_logs', ['tenant_id'])
    op.create_index(op.f('ix_audit_logs_user_id'), 'audit_logs', ['user_id'])
    
    # Set default values
    op.execute("ALTER TABLE tenants ALTER COLUMN subscription_tier SET DEFAULT 'basic'")
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER'")
    op.execute("ALTER TABLE users ALTER COLUMN status SET DEFAULT 'PENDING'")
    op.execute("ALTER TABLE users ALTER COLUMN is_active SET DEFAULT true")
    op.execute("ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT false")
    op.execute("ALTER TABLE users ALTER COLUMN failed_login_attempts SET DEFAULT 0")
    op.execute("ALTER TABLE users ALTER COLUMN mfa_enabled SET DEFAULT false")
    op.execute("ALTER TABLE users ALTER COLUMN preferences SET DEFAULT '{}'")
    op.execute("ALTER TABLE users ALTER COLUMN timezone SET DEFAULT 'UTC'")
    op.execute("ALTER TABLE users ALTER COLUMN language SET DEFAULT 'en'")
    op.execute("ALTER TABLE user_sessions ALTER COLUMN client_type SET DEFAULT 'web'")
    op.execute("ALTER TABLE user_sessions ALTER COLUMN is_active SET DEFAULT true")
    op.execute("ALTER TABLE user_permissions ALTER COLUMN is_active SET DEFAULT true")
    op.execute("ALTER TABLE audit_logs ALTER COLUMN success SET DEFAULT true")


def downgrade() -> None:
    """Drop all authentication tables"""
    
    # Drop tables in reverse order of creation
    op.drop_table('audit_logs')
    op.drop_table('user_permissions')
    op.drop_table('password_reset_tokens')
    op.drop_table('user_sessions')
    op.drop_table('users')
    op.drop_table('tenants')
    
    # Drop custom enum types
    sa.Enum(name='auditaction').drop(op.get_bind())
    sa.Enum(name='permissiontype').drop(op.get_bind())
    sa.Enum(name='userrole').drop(op.get_bind())
    sa.Enum(name='userstatus').drop(op.get_bind())