-- TREUM Users Database Schema with Performance Optimizations
-- Database: treum_users
-- Service: user-management

\c treum_users;

-- Create optimized indexes for user management
-- These will be created after TypeORM entities are initialized

-- User table indexes (assuming standard user entity structure)
-- Primary email lookup (most frequent query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active 
ON users(email) WHERE is_active = true;

-- Login performance optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_password_hash 
ON users(email, password_hash) WHERE is_active = true;

-- User search and filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at_desc 
ON users(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_login_active 
ON users(last_login_at DESC) WHERE is_active = true;

-- User session optimizations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_user_id_active 
ON user_sessions(user_id) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_token_hash 
ON user_sessions USING hash(session_token);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_expires_at 
ON user_sessions(expires_at) WHERE expires_at > NOW();

-- Audit log performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id_created 
ON audit_logs(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action_created 
ON audit_logs(action, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_created_at_month 
ON audit_logs(date_trunc('month', created_at));

-- Role and permission indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_id 
ON user_roles(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_role_permissions_role_id 
ON role_permissions(role_id);

-- Composite index for permission checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_permissions_lookup 
ON user_roles(user_id) 
INCLUDE (role_id);

-- Partitioning for audit logs (by month)
-- This will be implemented as part of the migration strategy

-- Connection pooling configuration
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- Query optimization settings
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Logging for performance monitoring
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_checkpoints = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;

-- Security configurations
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET password_encryption = 'scram-sha-256';

-- Create audit schema tables for enhanced tracking
CREATE TABLE IF NOT EXISTS audit.user_login_history (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    ip_address INET,
    user_agent TEXT,
    login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    failure_reason TEXT
);

CREATE INDEX idx_user_login_history_user_id_time 
ON audit.user_login_history(user_id, login_at DESC);

CREATE INDEX idx_user_login_history_ip_time 
ON audit.user_login_history(ip_address, login_at DESC);

-- Failed login attempt tracking
CREATE TABLE IF NOT EXISTS audit.failed_login_attempts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255),
    ip_address INET,
    attempt_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    INDEX(email, attempt_time),
    INDEX(ip_address, attempt_time)
);

-- Maintenance procedures
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() - INTERVAL '7 days';
    
    DELETE FROM audit.failed_login_attempts 
    WHERE attempt_time < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-user-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');

COMMENT ON DATABASE treum_users IS 'User management service database with optimized indexes for authentication and audit tracking';