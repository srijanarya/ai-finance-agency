-- Connect to treum_user database and create user management tables
\connect treum_user;

-- Users table (Story 001.1)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_or_phone CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Refresh tokens table (Story 001.1)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_fingerprint VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP verifications table (Story 001.1)
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL, -- email or phone
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(20) NOT NULL, -- 'registration', 'password_reset'
    attempts INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Two-factor authentication settings (Story 001.2)
CREATE TABLE two_factor_auth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    secret VARCHAR(255) NOT NULL, -- Encrypted
    enabled BOOLEAN DEFAULT FALSE,
    enabled_at TIMESTAMP,
    backup_codes_generated_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Backup codes table (Story 001.2)
CREATE TABLE backup_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2FA audit log (Story 001.2)
CREATE TABLE two_factor_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL, -- 'enabled', 'disabled', 'verified', 'failed'
    method VARCHAR(20), -- 'totp', 'sms', 'backup_code'
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KYC applications (Story 001.3)
CREATE TABLE kyc_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tier_requested VARCHAR(20) NOT NULL, -- 'basic', 'intermediate', 'advanced'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_review', 'approved', 'rejected', 'expired'
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    approved_at TIMESTAMP,
    expires_at TIMESTAMP,
    reviewer_id UUID,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- KYC documents (Story 001.3)
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES kyc_applications(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- 'pan', 'aadhaar_front', 'aadhaar_back', 'address_proof', 'income_proof', 'selfie'
    file_path VARCHAR(500) NOT NULL,
    file_hash VARCHAR(64),
    ocr_data JSONB,
    verification_status VARCHAR(20) DEFAULT 'pending',
    verification_confidence DECIMAL(5,2),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP
);

-- KYC verification results (Story 001.3)
CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES kyc_applications(id),
    verification_type VARCHAR(50), -- 'pan', 'aadhaar', 'face_match', 'address', 'income'
    provider VARCHAR(50), -- 'nsdl', 'uidai', 'digilocker', 'manual'
    request_data JSONB,
    response_data JSONB,
    status VARCHAR(20), -- 'success', 'failed', 'pending'
    confidence_score DECIMAL(5,2),
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AML screening results (Story 001.3)
CREATE TABLE aml_screenings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES kyc_applications(id),
    screening_provider VARCHAR(50),
    name_searched VARCHAR(255),
    matches_found INTEGER DEFAULT 0,
    risk_level VARCHAR(20), -- 'low', 'medium', 'high'
    screening_data JSONB,
    screened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX idx_otp_verifications_identifier ON otp_verifications(identifier);
CREATE INDEX idx_otp_verifications_expires_at ON otp_verifications(expires_at);
CREATE INDEX idx_backup_codes_user_id ON backup_codes(user_id);
CREATE INDEX idx_2fa_audit_user_id ON two_factor_audit_log(user_id);
CREATE INDEX idx_2fa_audit_created_at ON two_factor_audit_log(created_at);
CREATE INDEX idx_kyc_applications_user_id ON kyc_applications(user_id);
CREATE INDEX idx_kyc_applications_status ON kyc_applications(status);
CREATE INDEX idx_kyc_documents_application_id ON kyc_documents(application_id);
CREATE INDEX idx_kyc_documents_type ON kyc_documents(document_type);

-- Connect to treum_education database and create education tables
\connect treum_education;

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    language VARCHAR(10) DEFAULT 'en',
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    duration_hours INTEGER,
    is_published BOOLEAN DEFAULT FALSE,
    instructor_id UUID NOT NULL,
    category VARCHAR(50),
    tags TEXT[],
    thumbnail_url VARCHAR(500),
    preview_video_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course modules
CREATE TABLE course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course lessons
CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    duration_seconds INTEGER,
    order_index INTEGER NOT NULL,
    is_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course enrollments
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    last_accessed_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Lesson progress tracking
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    watched_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, lesson_id)
);

-- Create indexes for education tables
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_is_published ON courses(is_published);
CREATE INDEX idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_lesson_progress_enrollment_id ON lesson_progress(enrollment_id);

-- Connect to treum_signals database and create signals tables
\connect treum_signals;

-- Trading signals
CREATE TABLE trading_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(20) NOT NULL,
    signal_type VARCHAR(10) CHECK (signal_type IN ('BUY', 'SELL', 'HOLD')),
    asset_class VARCHAR(20) CHECK (asset_class IN ('equity', 'forex', 'crypto', 'commodity')),
    entry_price DECIMAL(15,8),
    target_price DECIMAL(15,8),
    stop_loss DECIMAL(15,8),
    confidence_score DECIMAL(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
    strategy_name VARCHAR(100),
    timeframe VARCHAR(10),
    generated_by VARCHAR(50), -- 'ai_model', 'expert', 'algorithm'
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'executed', 'expired', 'cancelled'))
);

-- Signal subscriptions
CREATE TABLE signal_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    subscription_tier VARCHAR(20) CHECK (subscription_tier IN ('basic', 'premium', 'pro')),
    asset_classes TEXT[],
    max_signals_per_day INTEGER,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id)
);

-- Signal deliveries
CREATE TABLE signal_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id UUID REFERENCES trading_signals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    delivery_method VARCHAR(20) CHECK (delivery_method IN ('websocket', 'email', 'sms', 'push')),
    delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    UNIQUE(signal_id, user_id)
);

-- Signal performance tracking
CREATE TABLE signal_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id UUID REFERENCES trading_signals(id) ON DELETE CASCADE,
    actual_entry_price DECIMAL(15,8),
    actual_exit_price DECIMAL(15,8),
    exit_reason VARCHAR(20) CHECK (exit_reason IN ('target_hit', 'stop_loss', 'manual', 'expired')),
    profit_loss_percentage DECIMAL(8,4),
    executed_at TIMESTAMP,
    closed_at TIMESTAMP
);

-- Create indexes for signals tables
CREATE INDEX idx_trading_signals_symbol ON trading_signals(symbol);
CREATE INDEX idx_trading_signals_asset_class ON trading_signals(asset_class);
CREATE INDEX idx_trading_signals_generated_at ON trading_signals(generated_at);
CREATE INDEX idx_trading_signals_status ON trading_signals(status);
CREATE INDEX idx_signal_subscriptions_user_id ON signal_subscriptions(user_id);
CREATE INDEX idx_signal_deliveries_signal_id ON signal_deliveries(signal_id);
CREATE INDEX idx_signal_deliveries_user_id ON signal_deliveries(user_id);

-- Connect to treum_payment database and create payment tables
\connect treum_payment;

-- Payment transactions
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('course_purchase', 'subscription', 'signal_package', 'refund')),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_gateway VARCHAR(20) CHECK (payment_gateway IN ('razorpay', 'payu', 'stripe')),
    gateway_transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed', 'cancelled', 'refunded')),
    payment_method VARCHAR(20), -- 'card', 'upi', 'netbanking', 'wallet'
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods (stored cards, UPI IDs, etc.)
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    method_type VARCHAR(20) CHECK (method_type IN ('card', 'upi', 'bank_account')),
    gateway_method_id VARCHAR(255), -- tokenized reference from gateway
    display_name VARCHAR(100), -- e.g., "**** 1234", "user@upi"
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP -- for cards
);

-- Subscription plans
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User subscriptions
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    auto_renew BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, plan_id)
);

-- Create indexes for payment tables
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);

-- Connect to treum_trading database and create trading tables
\connect treum_trading;

-- Exchange connections
CREATE TABLE exchange_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    exchange_name VARCHAR(50) NOT NULL, -- 'binance', 'wazirx', 'coindcx'
    api_key_encrypted TEXT NOT NULL,
    api_secret_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    permissions TEXT[], -- ['read', 'trade', 'withdraw']
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    UNIQUE(user_id, exchange_name)
);

-- Trading orders
CREATE TABLE trading_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    exchange_connection_id UUID REFERENCES exchange_connections(id),
    signal_id UUID, -- Reference to signal if order was from signal
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(4) CHECK (side IN ('BUY', 'SELL')),
    order_type VARCHAR(20) CHECK (order_type IN ('MARKET', 'LIMIT', 'STOP_LOSS', 'STOP_LIMIT')),
    quantity DECIMAL(20,8) NOT NULL,
    price DECIMAL(15,8),
    stop_price DECIMAL(15,8),
    exchange_order_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'open', 'filled', 'cancelled', 'rejected')),
    filled_quantity DECIMAL(20,8) DEFAULT 0,
    filled_price DECIMAL(15,8),
    commission DECIMAL(15,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio holdings
CREATE TABLE portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    exchange_connection_id UUID REFERENCES exchange_connections(id),
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(20,8) NOT NULL,
    average_price DECIMAL(15,8),
    current_price DECIMAL(15,8),
    unrealized_pnl DECIMAL(15,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, exchange_connection_id, symbol)
);

-- Create indexes for trading tables
CREATE INDEX idx_exchange_connections_user_id ON exchange_connections(user_id);
CREATE INDEX idx_trading_orders_user_id ON trading_orders(user_id);
CREATE INDEX idx_trading_orders_signal_id ON trading_orders(signal_id);
CREATE INDEX idx_trading_orders_status ON trading_orders(status);
CREATE INDEX idx_portfolio_holdings_user_id ON portfolio_holdings(user_id);
CREATE INDEX idx_portfolio_holdings_symbol ON portfolio_holdings(symbol);