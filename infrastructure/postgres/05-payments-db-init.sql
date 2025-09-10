-- TREUM Payments Database Schema with Performance Optimizations
-- Database: treum_payments
-- Service: payment

\c treum_payments;

-- Payment-specific optimizations for financial transactions
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET work_mem = '8MB';
ALTER SYSTEM SET maintenance_work_mem = '128MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET random_page_cost = 1.1;

-- ACID compliance for financial transactions
ALTER SYSTEM SET synchronous_commit = on;  -- Ensure durability for payments
ALTER SYSTEM SET fsync = on;
ALTER SYSTEM SET full_page_writes = on;

-- Payment transaction indexes for high-frequency lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_user_id_status 
ON payments(user_id, status) WHERE status IN ('pending', 'processing');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_transaction_id 
ON payments USING hash(transaction_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_created_at_desc 
ON payments(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_amount_status 
ON payments(amount DESC, status) WHERE status = 'completed';

-- Invoice management indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_user_id_status 
ON invoices(user_id, status) WHERE status IN ('pending', 'overdue');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_due_date_status 
ON invoices(due_date ASC) WHERE status IN ('pending', 'overdue');

-- Subscription billing indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user_id_active 
ON subscriptions(user_id) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_next_billing 
ON subscriptions(next_billing_date ASC) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_plan_id 
ON subscriptions(plan_id) WHERE is_active = true;

-- Payment method security indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_methods_user_active 
ON payment_methods(user_id) WHERE is_active = true;

-- Transaction tracking for compliance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_payment_id 
ON transactions(payment_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_created_status 
ON transactions(created_at DESC, status);

-- Wallet management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallets_user_id_currency 
ON wallets(user_id, currency);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wallets_balance_currency 
ON wallets(balance DESC, currency) WHERE balance > 0;

-- Billing schema for subscription management
CREATE SCHEMA IF NOT EXISTS billing;

-- Subscription lifecycle tracking
CREATE TABLE IF NOT EXISTS billing.subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- created, activated, paused, cancelled, renewed
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscription_events_subscription_created 
ON billing.subscription_events(subscription_id, created_at DESC);

CREATE INDEX idx_subscription_events_type_created 
ON billing.subscription_events(event_type, created_at DESC);

-- Billing cycles and prorations
CREATE TABLE IF NOT EXISTS billing.billing_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL,
    cycle_start DATE NOT NULL,
    cycle_end DATE NOT NULL,
    billed_amount DECIMAL(10,2),
    prorated_amount DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    invoice_id UUID,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_billing_cycles_subscription_start 
ON billing.billing_cycles(subscription_id, cycle_start DESC);

-- Usage-based billing tracking
CREATE TABLE IF NOT EXISTS billing.usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL,
    user_id UUID NOT NULL,
    usage_type VARCHAR(50) NOT NULL, -- api_calls, data_usage, premium_features
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,4),
    total_cost DECIMAL(10,2),
    billing_period DATE,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usage_records_subscription_period 
ON billing.usage_records(subscription_id, billing_period DESC);

CREATE INDEX idx_usage_records_user_type_period 
ON billing.usage_records(user_id, usage_type, billing_period DESC);

-- Compliance schema for financial regulations
CREATE SCHEMA IF NOT EXISTS compliance;

-- Anti-money laundering (AML) checks
CREATE TABLE IF NOT EXISTS compliance.aml_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    payment_id UUID,
    check_type VARCHAR(50) NOT NULL,
    risk_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'pending',
    external_reference VARCHAR(100),
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID
);

CREATE INDEX idx_aml_checks_user_checked 
ON compliance.aml_checks(user_id, checked_at DESC);

CREATE INDEX idx_aml_checks_status_score 
ON compliance.aml_checks(status, risk_score DESC);

-- Transaction monitoring for suspicious activity
CREATE TABLE IF NOT EXISTS compliance.suspicious_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL,
    user_id UUID NOT NULL,
    suspicion_reason VARCHAR(100) NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'medium',
    amount DECIMAL(15,2),
    flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'flagged',
    notes TEXT
);

CREATE INDEX idx_suspicious_transactions_user_flagged 
ON compliance.suspicious_transactions(user_id, flagged_at DESC);

CREATE INDEX idx_suspicious_transactions_status_level 
ON compliance.suspicious_transactions(status, risk_level);

-- Payment processing procedures
CREATE OR REPLACE FUNCTION process_recurring_billing()
RETURNS void AS $$
BEGIN
    -- Process subscriptions due for billing
    WITH due_subscriptions AS (
        SELECT 
            s.id,
            s.user_id,
            s.plan_id,
            p.price,
            s.next_billing_date
        FROM subscriptions s
        JOIN plans p ON p.id = s.plan_id
        WHERE s.is_active = true
        AND s.next_billing_date <= CURRENT_DATE
        AND s.status = 'active'
    )
    INSERT INTO invoices (user_id, subscription_id, amount, due_date, status)
    SELECT 
        user_id,
        id as subscription_id,
        price as amount,
        CURRENT_DATE + INTERVAL '30 days' as due_date,
        'pending' as status
    FROM due_subscriptions;
    
    -- Update next billing dates
    UPDATE subscriptions 
    SET next_billing_date = CASE 
        WHEN billing_interval = 'monthly' THEN next_billing_date + INTERVAL '1 month'
        WHEN billing_interval = 'yearly' THEN next_billing_date + INTERVAL '1 year'
        WHEN billing_interval = 'quarterly' THEN next_billing_date + INTERVAL '3 months'
        ELSE next_billing_date + INTERVAL '1 month'
    END
    WHERE is_active = true
    AND next_billing_date <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Usage billing calculation
CREATE OR REPLACE FUNCTION calculate_usage_billing()
RETURNS void AS $$
BEGIN
    -- Calculate monthly usage-based billing
    INSERT INTO billing.usage_records (subscription_id, user_id, usage_type, quantity, unit_price, total_cost, billing_period)
    SELECT 
        s.id as subscription_id,
        s.user_id,
        'api_calls' as usage_type,
        COALESCE(usage_data.api_calls, 0) as quantity,
        0.001 as unit_price, -- $0.001 per API call
        COALESCE(usage_data.api_calls, 0) * 0.001 as total_cost,
        DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE as billing_period
    FROM subscriptions s
    LEFT JOIN (
        -- This would typically come from an API usage tracking system
        SELECT user_id, COUNT(*) as api_calls
        FROM user_api_usage 
        WHERE usage_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        AND usage_date < DATE_TRUNC('month', CURRENT_DATE)
        GROUP BY user_id
    ) usage_data ON usage_data.user_id = s.user_id
    WHERE s.is_active = true
    AND s.plan_type = 'usage_based'
    ON CONFLICT (subscription_id, usage_type, billing_period) DO UPDATE SET
        quantity = EXCLUDED.quantity,
        total_cost = EXCLUDED.total_cost;
END;
$$ LANGUAGE plpgsql;

-- Fraud detection procedure
CREATE OR REPLACE FUNCTION detect_payment_fraud()
RETURNS void AS $$
BEGIN
    -- Flag potentially fraudulent transactions
    INSERT INTO compliance.suspicious_transactions (transaction_id, user_id, suspicion_reason, risk_level, amount)
    SELECT 
        t.id as transaction_id,
        p.user_id,
        'High velocity transactions' as suspicion_reason,
        'high' as risk_level,
        p.amount
    FROM transactions t
    JOIN payments p ON p.id = t.payment_id
    WHERE t.created_at >= NOW() - INTERVAL '1 hour'
    AND (
        -- Multiple high-value transactions in short time
        SELECT COUNT(*) 
        FROM transactions t2 
        JOIN payments p2 ON p2.id = t2.payment_id
        WHERE p2.user_id = p.user_id 
        AND p2.amount > 1000
        AND t2.created_at >= NOW() - INTERVAL '10 minutes'
    ) >= 3
    ON CONFLICT DO NOTHING;
    
    -- Flag transactions from new payment methods
    INSERT INTO compliance.suspicious_transactions (transaction_id, user_id, suspicion_reason, risk_level, amount)
    SELECT 
        t.id as transaction_id,
        p.user_id,
        'New payment method' as suspicion_reason,
        'medium' as risk_level,
        p.amount
    FROM transactions t
    JOIN payments p ON p.id = t.payment_id
    JOIN payment_methods pm ON pm.id = p.payment_method_id
    WHERE t.created_at >= NOW() - INTERVAL '1 hour'
    AND pm.created_at >= NOW() - INTERVAL '24 hours'
    AND p.amount > 500
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Financial reporting procedures
CREATE OR REPLACE FUNCTION generate_revenue_report(report_date DATE)
RETURNS TABLE(
    revenue_date DATE,
    total_revenue DECIMAL(15,2),
    subscription_revenue DECIMAL(15,2),
    usage_revenue DECIMAL(15,2),
    transaction_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        report_date as revenue_date,
        COALESCE(SUM(p.amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN p.payment_type = 'subscription' THEN p.amount ELSE 0 END), 0) as subscription_revenue,
        COALESCE(SUM(CASE WHEN p.payment_type = 'usage' THEN p.amount ELSE 0 END), 0) as usage_revenue,
        COUNT(p.id)::INTEGER as transaction_count
    FROM payments p
    WHERE DATE(p.created_at) = report_date
    AND p.status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Data cleanup procedures
CREATE OR REPLACE FUNCTION cleanup_payment_data()
RETURNS void AS $$
BEGIN
    -- Archive old completed transactions (keep 7 years for compliance)
    DELETE FROM transactions 
    WHERE created_at < NOW() - INTERVAL '7 years'
    AND status = 'completed';
    
    -- Clean up failed payment attempts (keep 1 year)
    DELETE FROM payments 
    WHERE created_at < NOW() - INTERVAL '1 year'
    AND status = 'failed';
    
    -- Archive old AML checks
    DELETE FROM compliance.aml_checks 
    WHERE checked_at < NOW() - INTERVAL '5 years'
    AND status = 'cleared';
    
    -- Clean up old subscription events (keep 2 years)
    DELETE FROM billing.subscription_events 
    WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Materialized views for financial analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS billing.monthly_revenue AS
SELECT 
    DATE_TRUNC('month', created_at)::DATE as revenue_month,
    COUNT(*) as transaction_count,
    SUM(amount) as total_revenue,
    AVG(amount) as avg_transaction_amount,
    COUNT(DISTINCT user_id) as unique_customers
FROM payments 
WHERE status = 'completed'
AND created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY revenue_month DESC;

-- Customer lifetime value calculation
CREATE MATERIALIZED VIEW IF NOT EXISTS billing.customer_ltv AS
SELECT 
    user_id,
    COUNT(*) as total_transactions,
    SUM(amount) as total_spent,
    AVG(amount) as avg_transaction_amount,
    MAX(created_at) as last_transaction_date,
    MIN(created_at) as first_transaction_date,
    EXTRACT(days FROM MAX(created_at) - MIN(created_at)) as customer_lifespan_days
FROM payments 
WHERE status = 'completed'
GROUP BY user_id
HAVING COUNT(*) >= 2;

-- Schedule maintenance tasks
-- SELECT cron.schedule('process-recurring-billing', '0 1 * * *', 'SELECT process_recurring_billing();');
-- SELECT cron.schedule('calculate-usage-billing', '0 2 1 * *', 'SELECT calculate_usage_billing();');
-- SELECT cron.schedule('detect-payment-fraud', '*/15 * * * *', 'SELECT detect_payment_fraud();');
-- SELECT cron.schedule('cleanup-payment-data', '0 3 * * 0', 'SELECT cleanup_payment_data();');
-- SELECT cron.schedule('refresh-revenue-analytics', '0 */6 * * *', 
--   'REFRESH MATERIALIZED VIEW billing.monthly_revenue; REFRESH MATERIALIZED VIEW billing.customer_ltv;');

COMMENT ON DATABASE treum_payments IS 'Payment service database with ACID compliance, fraud detection, and financial compliance features';