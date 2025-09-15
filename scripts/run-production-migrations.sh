#!/bin/bash

# AI Finance Agency - Production Database Migrations
# This script ensures all databases are properly initialized and migrated

set -e  # Exit on any error

# Configuration
LOG_FILE="/tmp/production-migrations-$(date +%Y%m%d-%H%M%S).log"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-ai_finance_user}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-securepassword123}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Database connection test
test_connection() {
    local db_name=$1
    local connection_string="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${db_name}"
    
    if psql "$connection_string" -c "SELECT 1;" >/dev/null 2>&1; then
        log_success "Connected to database: $db_name"
        return 0
    else
        log_error "Failed to connect to database: $db_name"
        return 1
    fi
}

# Create database if it doesn't exist
create_database_if_not_exists() {
    local db_name=$1
    local admin_connection="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/postgres"
    
    log_info "Checking if database $db_name exists..."
    
    if psql "$admin_connection" -t -c "SELECT 1 FROM pg_database WHERE datname='$db_name'" | grep -q 1; then
        log_info "Database $db_name already exists"
    else
        log_info "Creating database: $db_name"
        psql "$admin_connection" -c "CREATE DATABASE $db_name;"
        log_success "Database $db_name created"
    fi
}

# Initialize core tables
initialize_core_tables() {
    local db_name=$1
    local connection_string="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${db_name}"
    
    log_info "Initializing core tables for $db_name..."
    
    psql "$connection_string" << 'EOF'
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create audit table for all databases
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
EOF

    log_success "Core tables initialized for $db_name"
}

# Initialize User Management Database
initialize_user_management() {
    local db_name="user_db"
    create_database_if_not_exists "$db_name"
    test_connection "$db_name"
    initialize_core_tables "$db_name"
    
    local connection_string="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${db_name}"
    
    log_info "Creating user management tables..."
    
    psql "$connection_string" << 'EOF'
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- Insert default roles
INSERT INTO roles (id, name, description, permissions) VALUES 
    (uuid_generate_v4(), 'admin', 'System Administrator', '["all"]'),
    (uuid_generate_v4(), 'trader', 'Trading User', '["trading", "market_data", "signals"]'),
    (uuid_generate_v4(), 'viewer', 'Read-only User', '["view"]')
ON CONFLICT (name) DO NOTHING;
EOF

    log_success "User management database initialized"
}

# Initialize Trading Database
initialize_trading() {
    local db_name="trading_db"
    create_database_if_not_exists "$db_name"
    test_connection "$db_name"
    initialize_core_tables "$db_name"
    
    local connection_string="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${db_name}"
    
    log_info "Creating trading tables..."
    
    psql "$connection_string" << 'EOF'
-- Trading orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT')),
    quantity DECIMAL(18, 8) NOT NULL,
    price DECIMAL(18, 8),
    stop_price DECIMAL(18, 8),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FILLED', 'PARTIALLY_FILLED', 'CANCELLED', 'REJECTED')),
    filled_quantity DECIMAL(18, 8) DEFAULT 0,
    average_price DECIMAL(18, 8),
    commission DECIMAL(18, 8) DEFAULT 0,
    time_in_force VARCHAR(10) DEFAULT 'GTC' CHECK (time_in_force IN ('GTC', 'IOC', 'FOK')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio positions table
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(18, 8) NOT NULL DEFAULT 0,
    average_cost DECIMAL(18, 8) NOT NULL DEFAULT 0,
    market_value DECIMAL(18, 8),
    unrealized_pnl DECIMAL(18, 8),
    realized_pnl DECIMAL(18, 8) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- Trade executions table
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    user_id UUID NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL,
    quantity DECIMAL(18, 8) NOT NULL,
    price DECIMAL(18, 8) NOT NULL,
    commission DECIMAL(18, 8) DEFAULT 0,
    trade_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_symbol ON orders(symbol);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
EOF

    log_success "Trading database initialized"
}

# Initialize Payment Database
initialize_payment() {
    local db_name="payment_db"
    create_database_if_not_exists "$db_name"
    test_connection "$db_name"
    initialize_core_tables "$db_name"
    
    local connection_string="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${db_name}"
    
    log_info "Creating payment tables..."
    
    psql "$connection_string" << 'EOF'
-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('CARD', 'BANK', 'WALLET', 'CRYPTO')),
    provider VARCHAR(50) NOT NULL,
    external_id VARCHAR(255),
    details JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    payment_method_id UUID REFERENCES payment_methods(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'REFUND')),
    amount DECIMAL(18, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    external_transaction_id VARCHAR(255),
    description TEXT,
    metadata JSONB DEFAULT '{}',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    currency VARCHAR(3) NOT NULL,
    balance DECIMAL(18, 8) NOT NULL DEFAULT 0,
    available_balance DECIMAL(18, 8) NOT NULL DEFAULT 0,
    locked_balance DECIMAL(18, 8) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, currency)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    plan_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'EXPIRED', 'SUSPENDED')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    external_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
EOF

    log_success "Payment database initialized"
}

# Initialize Signals Database
initialize_signals() {
    local db_name="signals_db"
    create_database_if_not_exists "$db_name"
    test_connection "$db_name"
    initialize_core_tables "$db_name"
    
    local connection_string="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${db_name}"
    
    log_info "Creating signals tables..."
    
    psql "$connection_string" << 'EOF'
-- Trading signals table
CREATE TABLE IF NOT EXISTS signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    signal_type VARCHAR(20) NOT NULL CHECK (signal_type IN ('BUY', 'SELL', 'HOLD')),
    confidence DECIMAL(5, 4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    target_price DECIMAL(18, 8),
    stop_loss DECIMAL(18, 8),
    entry_price DECIMAL(18, 8),
    timeframe VARCHAR(10) NOT NULL,
    strategy VARCHAR(50) NOT NULL,
    analysis JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXECUTED', 'EXPIRED', 'CANCELLED')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signal performance tracking
CREATE TABLE IF NOT EXISTS signal_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signal_id UUID REFERENCES signals(id),
    actual_entry_price DECIMAL(18, 8),
    actual_exit_price DECIMAL(18, 8),
    pnl_percentage DECIMAL(10, 4),
    execution_time TIMESTAMP WITH TIME ZONE,
    result VARCHAR(20) CHECK (result IN ('WIN', 'LOSS', 'BREAKEVEN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_signals_symbol ON signals(symbol);
CREATE INDEX IF NOT EXISTS idx_signals_type ON signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at);
EOF

    log_success "Signals database initialized"
}

# Initialize Education Database
initialize_education() {
    local db_name="education_db"
    create_database_if_not_exists "$db_name"
    test_connection "$db_name"
    initialize_core_tables "$db_name"
    
    local connection_string="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${db_name}"
    
    log_info "Creating education tables..."
    
    psql "$connection_string" << 'EOF'
-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(20) CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    duration_minutes INTEGER,
    price DECIMAL(10, 2) DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER,
    video_url VARCHAR(500),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    progress_percentage DECIMAL(5, 2) DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress(course_id);
EOF

    log_success "Education database initialized"
}

# Initialize Risk Management Database
initialize_risk() {
    local db_name="risk_db"
    create_database_if_not_exists "$db_name"
    test_connection "$db_name"
    initialize_core_tables "$db_name"
    
    local connection_string="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${db_name}"
    
    log_info "Creating risk management tables..."
    
    psql "$connection_string" << 'EOF'
-- Risk assessments table
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    assessment_type VARCHAR(50) NOT NULL,
    risk_score DECIMAL(5, 2) NOT NULL,
    risk_level VARCHAR(20) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    factors JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk limits table
CREATE TABLE IF NOT EXISTS risk_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    limit_type VARCHAR(50) NOT NULL,
    limit_value DECIMAL(18, 8) NOT NULL,
    current_exposure DECIMAL(18, 8) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_risk_assessments_user_id ON risk_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_limits_user_id ON risk_limits(user_id);
EOF

    log_success "Risk management database initialized"
}

# Main database initialization
initialize_main_database() {
    local db_name="${POSTGRES_DB:-ai_finance_db}"
    create_database_if_not_exists "$db_name"
    test_connection "$db_name"
    initialize_core_tables "$db_name"
    
    local connection_string="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${db_name}"
    
    log_info "Creating main database tables..."
    
    psql "$connection_string" << 'EOF'
-- System configuration table
CREATE TABLE IF NOT EXISTS system_config (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system configuration
INSERT INTO system_config (key, value, description) VALUES 
    ('maintenance_mode', 'false', 'System maintenance mode flag'),
    ('api_version', '"v1"', 'Current API version'),
    ('max_concurrent_sessions', '5', 'Maximum concurrent sessions per user'),
    ('session_timeout_minutes', '60', 'Session timeout in minutes')
ON CONFLICT (key) DO NOTHING;
EOF

    log_success "Main database initialized"
}

# Verify all databases
verify_databases() {
    log_info "Verifying all database connections..."
    
    local databases=(
        "ai_finance_db"
        "user_db"
        "trading_db"
        "payment_db"
        "signals_db"
        "education_db"
        "risk_db"
    )
    
    local failed_connections=0
    
    for db in "${databases[@]}"; do
        if test_connection "$db"; then
            log_success "✓ $db connection verified"
        else
            log_error "✗ $db connection failed"
            ((failed_connections++))
        fi
    done
    
    if [ $failed_connections -eq 0 ]; then
        log_success "All database connections verified successfully"
        return 0
    else
        log_error "$failed_connections database connections failed"
        return 1
    fi
}

# Main execution
main() {
    log_info "Starting AI Finance Agency database migrations..."
    log_info "Log file: $LOG_FILE"
    
    # Initialize all databases
    initialize_main_database
    initialize_user_management
    initialize_trading
    initialize_payment
    initialize_signals
    initialize_education
    initialize_risk
    
    # Verify all connections
    verify_databases
    
    log_success "All database migrations completed successfully!"
    
    echo
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                 DATABASE MIGRATIONS COMPLETE!                  ║${NC}"
    echo -e "${GREEN}╠════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║ Databases initialized:                                        ║${NC}"
    echo -e "${GREEN}║ ✓ Main Database (ai_finance_db)                              ║${NC}"
    echo -e "${GREEN}║ ✓ User Management (user_db)                                  ║${NC}"
    echo -e "${GREEN}║ ✓ Trading (trading_db)                                       ║${NC}"
    echo -e "${GREEN}║ ✓ Payment (payment_db)                                       ║${NC}"
    echo -e "${GREEN}║ ✓ Signals (signals_db)                                       ║${NC}"
    echo -e "${GREEN}║ ✓ Education (education_db)                                   ║${NC}"
    echo -e "${GREEN}║ ✓ Risk Management (risk_db)                                  ║${NC}"
    echo -e "${GREEN}║                                                               ║${NC}"
    echo -e "${GREEN}║ Log file: $LOG_FILE${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
}

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    log_error "PostgreSQL client (psql) not found. Please install PostgreSQL client tools."
    exit 1
fi

# Run main function
main "$@"