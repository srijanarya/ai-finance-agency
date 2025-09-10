-- TREUM Risk Management Database Schema with Performance Optimizations
-- Database: treum_risk
-- Service: risk-management

\c treum_risk;

-- Risk management optimizations for real-time monitoring
ALTER SYSTEM SET shared_buffers = '512MB';
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET maintenance_work_mem = '128MB';
ALTER SYSTEM SET effective_cache_size = '2GB';
ALTER SYSTEM SET random_page_cost = 1.0;
ALTER SYSTEM SET effective_io_concurrency = 400;

-- Time-series optimizations for risk metrics
ALTER SYSTEM SET wal_buffers = '32MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;

-- Risk assessment indexes for real-time monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_assessments_user_created 
ON risk_assessments(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_assessments_risk_level_created 
ON risk_assessments(risk_level, created_at DESC) WHERE risk_level IN ('high', 'critical');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_assessments_symbol_created 
ON risk_assessments(symbol, created_at DESC);

-- Risk limits monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_limits_user_active 
ON risk_limits(user_id) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_limits_limit_type 
ON risk_limits(limit_type, limit_value DESC) WHERE is_active = true;

-- Risk alerts for immediate action
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_alerts_user_severity_created 
ON risk_alerts(user_id, severity, created_at DESC) WHERE is_resolved = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_alerts_alert_type_created 
ON risk_alerts(alert_type, created_at DESC) WHERE is_resolved = false;

-- Risk metrics time-series data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_metrics_user_calculated 
ON risk_metrics(user_id, calculated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_risk_metrics_metric_type_calculated 
ON risk_metrics(metric_type, calculated_at DESC);

-- Compliance checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_checks_user_performed 
ON compliance_checks(user_id, performed_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_compliance_checks_status_performed 
ON compliance_checks(compliance_status, performed_at DESC) WHERE compliance_status = 'failed';

-- Metrics schema for risk analytics
CREATE SCHEMA IF NOT EXISTS metrics;

-- Portfolio risk metrics aggregation
CREATE TABLE IF NOT EXISTS metrics.portfolio_risk_summary (
    user_id UUID NOT NULL,
    summary_date DATE NOT NULL,
    total_portfolio_value DECIMAL(18,2),
    portfolio_var DECIMAL(18,8), -- Value at Risk
    portfolio_beta DECIMAL(8,4),
    portfolio_sharpe_ratio DECIMAL(8,4),
    max_drawdown DECIMAL(8,4),
    concentration_risk_score DECIMAL(5,2),
    currency_exposure JSONB,
    sector_exposure JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, summary_date)
);

CREATE INDEX idx_portfolio_risk_summary_date_var 
ON metrics.portfolio_risk_summary(summary_date DESC, portfolio_var DESC);

-- Risk factor exposures
CREATE TABLE IF NOT EXISTS metrics.risk_factor_exposures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    risk_factor VARCHAR(50) NOT NULL, -- market, credit, operational, liquidity
    exposure_value DECIMAL(18,8),
    exposure_percentage DECIMAL(8,4),
    risk_contribution DECIMAL(8,4),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_risk_factor_exposures_user_factor_calc 
ON metrics.risk_factor_exposures(user_id, risk_factor, calculated_at DESC);

-- Stress testing results
CREATE TABLE IF NOT EXISTS metrics.stress_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    scenario_name VARCHAR(100) NOT NULL,
    scenario_type VARCHAR(50), -- market_crash, interest_rate_shock, currency_crisis
    portfolio_loss DECIMAL(18,8),
    loss_percentage DECIMAL(8,4),
    worst_performing_positions JSONB,
    scenario_parameters JSONB,
    tested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stress_test_results_user_tested 
ON metrics.stress_test_results(user_id, tested_at DESC);

CREATE INDEX idx_stress_test_results_scenario_loss 
ON metrics.stress_test_results(scenario_type, portfolio_loss DESC);

-- Alerts schema for risk monitoring
CREATE SCHEMA IF NOT EXISTS alerts;

-- Real-time risk threshold breaches
CREATE TABLE IF NOT EXISTS alerts.risk_threshold_breaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    threshold_type VARCHAR(50) NOT NULL, -- var_limit, concentration, leverage
    current_value DECIMAL(18,8),
    threshold_value DECIMAL(18,8),
    breach_severity VARCHAR(20) DEFAULT 'medium',
    position_details JSONB,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_action TEXT
);

CREATE INDEX idx_risk_threshold_breaches_user_detected 
ON alerts.risk_threshold_breaches(user_id, detected_at DESC);

CREATE INDEX idx_risk_threshold_breaches_severity_unresolved 
ON alerts.risk_threshold_breaches(breach_severity, detected_at DESC) 
WHERE resolved_at IS NULL;

-- Market regime change alerts
CREATE TABLE IF NOT EXISTS alerts.market_regime_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market VARCHAR(20) NOT NULL, -- US_EQUITY, CRYPTO, FOREX
    previous_regime VARCHAR(50),
    current_regime VARCHAR(50), -- trending_up, trending_down, high_volatility, low_volatility
    regime_strength DECIMAL(5,2), -- confidence score 0-100
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    regime_indicators JSONB
);

CREATE INDEX idx_market_regime_changes_market_detected 
ON alerts.market_regime_changes(market, detected_at DESC);

-- Risk calculation procedures
CREATE OR REPLACE FUNCTION calculate_portfolio_risk()
RETURNS void AS $$
DECLARE
    user_rec RECORD;
    portfolio_value DECIMAL(18,2);
    var_95 DECIMAL(18,8);
    beta_value DECIMAL(8,4);
    sharpe_ratio DECIMAL(8,4);
BEGIN
    -- Calculate risk metrics for all active users
    FOR user_rec IN
        SELECT DISTINCT user_id FROM positions WHERE quantity != 0
    LOOP
        -- Calculate total portfolio value
        SELECT COALESCE(SUM(ABS(quantity) * current_price), 0)
        INTO portfolio_value
        FROM positions p
        JOIN market_data md ON md.symbol = p.symbol
        WHERE p.user_id = user_rec.user_id
        AND p.quantity != 0
        AND md.timestamp >= NOW() - INTERVAL '1 hour'
        ORDER BY md.timestamp DESC
        LIMIT 1;
        
        -- Calculate Value at Risk (simplified historical method)
        WITH position_returns AS (
            SELECT 
                p.symbol,
                p.quantity,
                (md.price - LAG(md.price, 20) OVER (PARTITION BY md.symbol ORDER BY md.timestamp)) / 
                LAG(md.price, 20) OVER (PARTITION BY md.symbol ORDER BY md.timestamp) as daily_return
            FROM positions p
            JOIN market_data md ON md.symbol = p.symbol
            WHERE p.user_id = user_rec.user_id
            AND p.quantity != 0
            AND md.timestamp >= NOW() - INTERVAL '30 days'
        )
        SELECT PERCENTILE_CONT(0.05) WITHIN GROUP (ORDER BY daily_return * portfolio_value)
        INTO var_95
        FROM position_returns
        WHERE daily_return IS NOT NULL;
        
        -- Calculate portfolio beta (simplified against market index)
        WITH portfolio_returns AS (
            SELECT 
                DATE_TRUNC('day', md.timestamp) as trade_date,
                SUM((md.price - LAG(md.price) OVER (PARTITION BY md.symbol ORDER BY md.timestamp)) / 
                    LAG(md.price) OVER (PARTITION BY md.symbol ORDER BY md.timestamp) * 
                    ABS(p.quantity) * md.price) / portfolio_value as portfolio_return
            FROM positions p
            JOIN market_data md ON md.symbol = p.symbol
            WHERE p.user_id = user_rec.user_id
            AND p.quantity != 0
            AND md.timestamp >= NOW() - INTERVAL '30 days'
            GROUP BY DATE_TRUNC('day', md.timestamp)
            HAVING SUM(ABS(p.quantity) * md.price) > 0
        )
        SELECT COALESCE(
            (COUNT(*) * SUM(portfolio_return * 0.1) - SUM(portfolio_return) * SUM(0.1)) / 
            NULLIF((COUNT(*) * SUM(0.1 * 0.1) - SUM(0.1) * SUM(0.1)), 0), 
            1.0
        )
        INTO beta_value
        FROM portfolio_returns
        WHERE portfolio_return IS NOT NULL;
        
        -- Insert/update risk metrics
        INSERT INTO metrics.portfolio_risk_summary (
            user_id, summary_date, total_portfolio_value, portfolio_var, portfolio_beta
        ) VALUES (
            user_rec.user_id, CURRENT_DATE, portfolio_value, var_95, beta_value
        )
        ON CONFLICT (user_id, summary_date) DO UPDATE SET
            total_portfolio_value = EXCLUDED.total_portfolio_value,
            portfolio_var = EXCLUDED.portfolio_var,
            portfolio_beta = EXCLUDED.portfolio_beta,
            created_at = NOW();
        
        -- Check for risk threshold breaches
        PERFORM check_risk_thresholds(user_rec.user_id, portfolio_value, var_95, beta_value);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Risk threshold monitoring
CREATE OR REPLACE FUNCTION check_risk_thresholds(
    p_user_id UUID,
    p_portfolio_value DECIMAL(18,2),
    p_var DECIMAL(18,8),
    p_beta DECIMAL(8,4)
)
RETURNS void AS $$
DECLARE
    var_limit DECIMAL(18,8);
    concentration_limit DECIMAL(5,2);
    max_position_pct DECIMAL(5,2);
BEGIN
    -- Check VaR limits
    SELECT limit_value INTO var_limit
    FROM risk_limits 
    WHERE user_id = p_user_id 
    AND limit_type = 'var_limit'
    AND is_active = true;
    
    IF var_limit IS NOT NULL AND ABS(p_var) > var_limit THEN
        INSERT INTO alerts.risk_threshold_breaches (
            user_id, threshold_type, current_value, threshold_value, breach_severity
        ) VALUES (
            p_user_id, 'var_limit', ABS(p_var), var_limit, 
            CASE WHEN ABS(p_var) > var_limit * 1.5 THEN 'critical' ELSE 'high' END
        );
        
        -- Create risk alert
        INSERT INTO risk_alerts (
            user_id, alert_type, severity, description
        ) VALUES (
            p_user_id, 'var_breach', 'high',
            'Portfolio VaR (' || ABS(p_var) || ') exceeds limit (' || var_limit || ')'
        );
    END IF;
    
    -- Check concentration limits
    SELECT 
        MAX((ABS(quantity) * current_price) / p_portfolio_value * 100)
    INTO max_position_pct
    FROM positions p
    JOIN market_data md ON md.symbol = p.symbol
    WHERE p.user_id = p_user_id
    AND p.quantity != 0;
    
    SELECT limit_value INTO concentration_limit
    FROM risk_limits 
    WHERE user_id = p_user_id 
    AND limit_type = 'concentration_limit'
    AND is_active = true;
    
    IF concentration_limit IS NOT NULL AND max_position_pct > concentration_limit THEN
        INSERT INTO alerts.risk_threshold_breaches (
            user_id, threshold_type, current_value, threshold_value, breach_severity
        ) VALUES (
            p_user_id, 'concentration', max_position_pct, concentration_limit, 'medium'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Stress testing procedure
CREATE OR REPLACE FUNCTION run_stress_tests()
RETURNS void AS $$
DECLARE
    user_rec RECORD;
    market_crash_loss DECIMAL(18,8);
    interest_shock_loss DECIMAL(18,8);
BEGIN
    FOR user_rec IN
        SELECT DISTINCT user_id FROM positions WHERE quantity != 0
    LOOP
        -- Market crash scenario (-20% equity markets)
        SELECT COALESCE(SUM(
            CASE 
                WHEN p.symbol LIKE '%EQUITY%' OR p.symbol IN ('AAPL', 'GOOGL', 'MSFT', 'AMZN')
                THEN quantity * current_price * -0.20
                WHEN p.symbol LIKE '%CRYPTO%' OR p.symbol IN ('BTC', 'ETH')
                THEN quantity * current_price * -0.35
                ELSE quantity * current_price * -0.10
            END
        ), 0)
        INTO market_crash_loss
        FROM positions p
        JOIN market_data md ON md.symbol = p.symbol
        WHERE p.user_id = user_rec.user_id
        AND p.quantity != 0;
        
        INSERT INTO metrics.stress_test_results (
            user_id, scenario_name, scenario_type, portfolio_loss, 
            loss_percentage, scenario_parameters
        ) VALUES (
            user_rec.user_id, 'Market Crash 2024', 'market_crash', market_crash_loss,
            (market_crash_loss / NULLIF((SELECT SUM(ABS(quantity) * current_price) 
                                       FROM positions p2 
                                       JOIN market_data md2 ON md2.symbol = p2.symbol 
                                       WHERE p2.user_id = user_rec.user_id), 0)) * 100,
            '{"equity_shock": -20, "crypto_shock": -35, "other_shock": -10}'::jsonb
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Market regime detection
CREATE OR REPLACE FUNCTION detect_market_regime_changes()
RETURNS void AS $$
DECLARE
    market_rec RECORD;
    volatility_20d DECIMAL(8,4);
    trend_strength DECIMAL(5,2);
    current_regime VARCHAR(50);
BEGIN
    FOR market_rec IN
        SELECT DISTINCT 
            CASE 
                WHEN symbol ~ '^[A-Z]{1,4}$' THEN 'US_EQUITY'
                WHEN symbol IN ('BTC', 'ETH', 'ADA', 'DOT') THEN 'CRYPTO'
                WHEN symbol ~ '.*USD$' THEN 'FOREX'
                ELSE 'OTHER'
            END as market
        FROM market_data 
        WHERE timestamp >= NOW() - INTERVAL '1 hour'
    LOOP
        -- Calculate 20-day volatility
        SELECT STDDEV((price - LAG(price) OVER (ORDER BY timestamp)) / LAG(price) OVER (ORDER BY timestamp))
        INTO volatility_20d
        FROM market_data
        WHERE timestamp >= NOW() - INTERVAL '20 days'
        AND CASE 
            WHEN market_rec.market = 'US_EQUITY' THEN symbol ~ '^[A-Z]{1,4}$'
            WHEN market_rec.market = 'CRYPTO' THEN symbol IN ('BTC', 'ETH', 'ADA', 'DOT')
            WHEN market_rec.market = 'FOREX' THEN symbol ~ '.*USD$'
            ELSE false
        END;
        
        -- Determine regime
        current_regime := CASE 
            WHEN volatility_20d > 0.03 THEN 'high_volatility'
            WHEN volatility_20d < 0.01 THEN 'low_volatility'
            ELSE 'normal_volatility'
        END;
        
        -- Check if regime changed
        IF NOT EXISTS (
            SELECT 1 FROM alerts.market_regime_changes
            WHERE market = market_rec.market
            AND current_regime = current_regime
            AND detected_at >= NOW() - INTERVAL '24 hours'
        ) THEN
            INSERT INTO alerts.market_regime_changes (
                market, current_regime, regime_strength, regime_indicators
            ) VALUES (
                market_rec.market, current_regime, volatility_20d * 100,
                jsonb_build_object('volatility_20d', volatility_20d, 'calculated_at', NOW())
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Data cleanup procedures
CREATE OR REPLACE FUNCTION cleanup_risk_data()
RETURNS void AS $$
BEGIN
    -- Clean up old risk assessments (keep 1 year)
    DELETE FROM risk_assessments 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Clean up resolved risk alerts (keep 6 months)
    DELETE FROM risk_alerts 
    WHERE is_resolved = true 
    AND resolved_at < NOW() - INTERVAL '6 months';
    
    -- Clean up old risk metrics (keep daily summaries for 2 years, hourly for 3 months)
    DELETE FROM risk_metrics 
    WHERE calculated_at < NOW() - INTERVAL '3 months'
    AND metric_interval = 'hourly';
    
    -- Clean up old threshold breaches (keep 1 year)
    DELETE FROM alerts.risk_threshold_breaches 
    WHERE detected_at < NOW() - INTERVAL '1 year';
    
    -- Clean up old stress test results (keep 2 years)
    DELETE FROM metrics.stress_test_results 
    WHERE tested_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Materialized views for risk analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS metrics.risk_dashboard AS
SELECT 
    user_id,
    total_portfolio_value,
    portfolio_var,
    portfolio_beta,
    max_drawdown,
    concentration_risk_score,
    summary_date,
    RANK() OVER (PARTITION BY summary_date ORDER BY ABS(portfolio_var) DESC) as risk_rank
FROM metrics.portfolio_risk_summary
WHERE summary_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY summary_date DESC, risk_rank ASC;

-- High-risk users monitoring
CREATE MATERIALIZED VIEW IF NOT EXISTS alerts.high_risk_users AS
SELECT 
    rtb.user_id,
    COUNT(DISTINCT rtb.threshold_type) as breach_types,
    MAX(rtb.detected_at) as latest_breach,
    STRING_AGG(DISTINCT rtb.threshold_type, ', ') as breached_thresholds,
    AVG(rtb.current_value / rtb.threshold_value) as avg_breach_ratio
FROM alerts.risk_threshold_breaches rtb
WHERE rtb.resolved_at IS NULL
AND rtb.detected_at >= NOW() - INTERVAL '7 days'
GROUP BY rtb.user_id
HAVING COUNT(DISTINCT rtb.threshold_type) >= 2
ORDER BY breach_types DESC, latest_breach DESC;

-- Schedule maintenance tasks
-- SELECT cron.schedule('calculate-portfolio-risk', '*/15 * * * *', 'SELECT calculate_portfolio_risk();');
-- SELECT cron.schedule('run-stress-tests', '0 */6 * * *', 'SELECT run_stress_tests();');
-- SELECT cron.schedule('detect-market-regimes', '*/30 * * * *', 'SELECT detect_market_regime_changes();');
-- SELECT cron.schedule('cleanup-risk-data', '0 3 * * *', 'SELECT cleanup_risk_data();');
-- SELECT cron.schedule('refresh-risk-analytics', '*/10 * * * *', 
--   'REFRESH MATERIALIZED VIEW metrics.risk_dashboard; REFRESH MATERIALIZED VIEW alerts.high_risk_users;');

COMMENT ON DATABASE treum_risk IS 'Risk management service database with real-time monitoring, stress testing, and compliance tracking';