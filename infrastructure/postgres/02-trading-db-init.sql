-- TREUM Trading Database Schema with Performance Optimizations
-- Database: treum_trading
-- Service: trading

\c treum_trading;

-- Enable TimescaleDB for time-series data
-- CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Trading-specific performance optimizations
ALTER SYSTEM SET shared_buffers = '512MB';
ALTER SYSTEM SET work_mem = '8MB';
ALTER SYSTEM SET maintenance_work_mem = '128MB';
ALTER SYSTEM SET effective_cache_size = '2GB';
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 300;

-- High-frequency trading optimizations
ALTER SYSTEM SET synchronous_commit = off;  -- For high-frequency inserts
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET max_wal_size = '2GB';

-- Order management indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_id_status 
ON orders(user_id, status) WHERE status IN ('pending', 'partial_filled');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_symbol_side_status 
ON orders(symbol, side, status) WHERE status IN ('pending', 'partial_filled');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at_desc 
ON orders(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_updated_at_status 
ON orders(updated_at DESC) WHERE status IN ('filled', 'cancelled');

-- Position tracking indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_positions_user_id_symbol 
ON positions(user_id, symbol) WHERE quantity != 0;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_positions_symbol_updated 
ON positions(symbol, updated_at DESC) WHERE quantity != 0;

-- Trade execution indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trades_order_id 
ON trades(order_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trades_user_id_executed 
ON trades(user_id, executed_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trades_symbol_executed 
ON trades(symbol, executed_at DESC);

-- Portfolio performance tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_portfolio_user_id_updated 
ON portfolio(user_id, updated_at DESC);

-- Market data correlation indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_market_data_symbol_timestamp 
ON market_data(symbol, timestamp DESC);

-- Create hypertables for time-series data (TimescaleDB)
-- SELECT create_hypertable('trades', 'executed_at', if_not_exists => TRUE);
-- SELECT create_hypertable('market_data', 'timestamp', if_not_exists => TRUE);

-- Partitioning for large tables
-- CREATE TABLE trades_2024 PARTITION OF trades 
-- FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- Analytics schema optimizations
CREATE SCHEMA IF NOT EXISTS analytics;

-- Pre-computed analytics tables
CREATE TABLE IF NOT EXISTS analytics.daily_pnl (
    user_id UUID NOT NULL,
    trading_date DATE NOT NULL,
    total_pnl DECIMAL(15,2),
    realized_pnl DECIMAL(15,2),
    unrealized_pnl DECIMAL(15,2),
    total_volume DECIMAL(15,2),
    trade_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, trading_date)
);

CREATE INDEX idx_daily_pnl_date_pnl 
ON analytics.daily_pnl(trading_date DESC, total_pnl DESC);

-- Trading performance metrics
CREATE TABLE IF NOT EXISTS analytics.trading_metrics (
    user_id UUID PRIMARY KEY,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2),
    total_pnl DECIMAL(15,2),
    max_drawdown DECIMAL(15,2),
    sharpe_ratio DECIMAL(8,4),
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance schema for regulatory requirements
CREATE SCHEMA IF NOT EXISTS compliance;

-- Trade reporting table
CREATE TABLE IF NOT EXISTS compliance.trade_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    trade_id UUID NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL,
    quantity DECIMAL(18,8) NOT NULL,
    price DECIMAL(18,8) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    regulatory_status VARCHAR(20) DEFAULT 'pending'
);

CREATE INDEX idx_trade_reports_user_executed 
ON compliance.trade_reports(user_id, executed_at DESC);

CREATE INDEX idx_trade_reports_symbol_executed 
ON compliance.trade_reports(symbol, executed_at DESC);

-- Risk limits tracking
CREATE TABLE IF NOT EXISTS compliance.risk_limit_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    violation_type VARCHAR(50) NOT NULL,
    current_value DECIMAL(18,8),
    limit_value DECIMAL(18,8),
    symbol VARCHAR(20),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active'
);

-- Maintenance procedures for trading data
CREATE OR REPLACE FUNCTION cleanup_old_market_data()
RETURNS void AS $$
BEGIN
    -- Keep only last 30 days of minute-level market data
    DELETE FROM market_data 
    WHERE timestamp < NOW() - INTERVAL '30 days'
    AND interval_type = '1m';
    
    -- Keep last 90 days of hourly data
    DELETE FROM market_data 
    WHERE timestamp < NOW() - INTERVAL '90 days'
    AND interval_type = '1h';
    
    -- Archive old trades (move to archive table instead of delete)
    INSERT INTO trades_archive 
    SELECT * FROM trades 
    WHERE executed_at < NOW() - INTERVAL '1 year';
    
    DELETE FROM trades 
    WHERE executed_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Performance monitoring
CREATE OR REPLACE FUNCTION analyze_trading_performance()
RETURNS void AS $$
BEGIN
    -- Update daily PnL calculations
    INSERT INTO analytics.daily_pnl (user_id, trading_date, total_pnl, realized_pnl, total_volume, trade_count)
    SELECT 
        user_id,
        DATE(executed_at) as trading_date,
        SUM(pnl) as total_pnl,
        SUM(CASE WHEN status = 'closed' THEN pnl ELSE 0 END) as realized_pnl,
        SUM(quantity * price) as total_volume,
        COUNT(*) as trade_count
    FROM trades 
    WHERE DATE(executed_at) = CURRENT_DATE - INTERVAL '1 day'
    GROUP BY user_id, DATE(executed_at)
    ON CONFLICT (user_id, trading_date) DO UPDATE SET
        total_pnl = EXCLUDED.total_pnl,
        realized_pnl = EXCLUDED.realized_pnl,
        total_volume = EXCLUDED.total_volume,
        trade_count = EXCLUDED.trade_count;
        
    -- Update user trading metrics
    INSERT INTO analytics.trading_metrics (user_id, total_trades, winning_trades, losing_trades, win_rate, total_pnl)
    SELECT 
        user_id,
        COUNT(*) as total_trades,
        COUNT(CASE WHEN pnl > 0 THEN 1 END) as winning_trades,
        COUNT(CASE WHEN pnl < 0 THEN 1 END) as losing_trades,
        (COUNT(CASE WHEN pnl > 0 THEN 1 END) * 100.0 / COUNT(*)) as win_rate,
        SUM(pnl) as total_pnl
    FROM trades 
    GROUP BY user_id
    ON CONFLICT (user_id) DO UPDATE SET
        total_trades = EXCLUDED.total_trades,
        winning_trades = EXCLUDED.winning_trades,
        losing_trades = EXCLUDED.losing_trades,
        win_rate = EXCLUDED.win_rate,
        total_pnl = EXCLUDED.total_pnl,
        last_calculated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create materialized views for common queries
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.top_trading_symbols AS
SELECT 
    symbol,
    COUNT(*) as trade_count,
    SUM(quantity * price) as total_volume,
    AVG(price) as avg_price,
    DATE(MAX(executed_at)) as last_traded
FROM trades 
WHERE executed_at > NOW() - INTERVAL '30 days'
GROUP BY symbol
ORDER BY total_volume DESC;

CREATE INDEX idx_top_trading_symbols_volume 
ON analytics.top_trading_symbols(total_volume DESC);

-- Schedule maintenance tasks
-- SELECT cron.schedule('cleanup-trading-data', '0 3 * * *', 'SELECT cleanup_old_market_data();');
-- SELECT cron.schedule('analyze-trading-performance', '0 1 * * *', 'SELECT analyze_trading_performance();');
-- SELECT cron.schedule('refresh-trading-symbols', '0 */6 * * *', 'REFRESH MATERIALIZED VIEW analytics.top_trading_symbols;');

COMMENT ON DATABASE treum_trading IS 'Trading service database optimized for high-frequency operations and real-time analytics';