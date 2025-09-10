-- TREUM Market Data Database Schema with Performance Optimizations
-- Database: treum_market_data
-- Service: market-data

\c treum_market_data;

-- Market data specific optimizations for time-series workloads
ALTER SYSTEM SET shared_buffers = '1GB';
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET maintenance_work_mem = '256MB';
ALTER SYSTEM SET effective_cache_size = '4GB';
ALTER SYSTEM SET random_page_cost = 1.0;  -- SSD optimized
ALTER SYSTEM SET effective_io_concurrency = 500;

-- Write-heavy optimizations for market data ingestion
ALTER SYSTEM SET wal_buffers = '32MB';
ALTER SYSTEM SET max_wal_size = '4GB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET synchronous_commit = off;  -- For high-frequency market data

-- High-performance market data indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_market_data_symbol_timestamp 
ON market_data(symbol, timestamp DESC) WHERE timestamp > NOW() - INTERVAL '24 hours';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_market_data_timestamp_symbol 
ON market_data(timestamp DESC, symbol) WHERE timestamp > NOW() - INTERVAL '7 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_market_data_volume_timestamp 
ON market_data(volume DESC, timestamp DESC) WHERE timestamp > NOW() - INTERVAL '1 hour';

-- Historical data with different retention policies
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_historical_data_symbol_date 
ON historical_data(symbol, date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_historical_data_date_volume 
ON historical_data(date DESC, volume DESC);

-- Watchlist optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_watchlist_user_id 
ON watchlist(user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_watchlist_symbol_users 
ON watchlist(symbol) INCLUDE (user_id);

-- Market alerts for real-time notifications
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_market_alerts_user_active 
ON market_alerts(user_id) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_market_alerts_symbol_active 
ON market_alerts(symbol, alert_type) WHERE is_active = true;

-- Market session tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_market_sessions_date_status 
ON market_session(session_date DESC, status);

-- Historical schema for data archival
CREATE SCHEMA IF NOT EXISTS historical;

-- Time-based partitioning for market data (manual partitioning)
-- CREATE TABLE market_data_2024_q1 PARTITION OF market_data 
-- FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

-- Real-time schema for live data
CREATE SCHEMA IF NOT EXISTS realtime;

-- Live price feed table (temporary storage)
CREATE TABLE IF NOT EXISTS realtime.live_prices (
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(18,8) NOT NULL,
    volume DECIMAL(18,8),
    bid DECIMAL(18,8),
    ask DECIMAL(18,8),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(50),
    PRIMARY KEY (symbol, timestamp)
);

-- Optimize for rapid inserts and latest price queries
CREATE INDEX idx_live_prices_symbol_latest 
ON realtime.live_prices(symbol, timestamp DESC);

-- Price change tracking
CREATE TABLE IF NOT EXISTS realtime.price_changes (
    symbol VARCHAR(20) NOT NULL,
    price_change DECIMAL(18,8),
    percentage_change DECIMAL(8,4),
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (symbol, period_end)
);

-- Analytics schema for computed metrics
CREATE SCHEMA IF NOT EXISTS analytics;

-- Technical indicators storage
CREATE TABLE IF NOT EXISTS analytics.technical_indicators (
    symbol VARCHAR(20) NOT NULL,
    indicator_type VARCHAR(50) NOT NULL,
    indicator_value DECIMAL(18,8),
    period INTEGER,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (symbol, indicator_type, period, calculated_at)
);

CREATE INDEX idx_technical_indicators_symbol_type 
ON analytics.technical_indicators(symbol, indicator_type, calculated_at DESC);

-- Market volatility tracking
CREATE TABLE IF NOT EXISTS analytics.volatility_metrics (
    symbol VARCHAR(20) NOT NULL,
    volatility_1h DECIMAL(8,4),
    volatility_24h DECIMAL(8,4),
    volatility_7d DECIMAL(8,4),
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (symbol, calculated_at)
);

-- Symbol correlation matrix
CREATE TABLE IF NOT EXISTS analytics.symbol_correlations (
    symbol_a VARCHAR(20) NOT NULL,
    symbol_b VARCHAR(20) NOT NULL,
    correlation_coefficient DECIMAL(8,6),
    period_days INTEGER,
    calculated_at DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (symbol_a, symbol_b, period_days, calculated_at)
);

-- Market data aggregation procedures
CREATE OR REPLACE FUNCTION aggregate_market_data()
RETURNS void AS $$
BEGIN
    -- Create 1-hour aggregates from minute data
    INSERT INTO historical_data (symbol, date, open_price, high_price, low_price, close_price, volume, interval_type)
    SELECT 
        symbol,
        date_trunc('hour', timestamp) as date,
        first_value(price) OVER w as open_price,
        max(price) OVER w as high_price,
        min(price) OVER w as low_price,
        last_value(price) OVER w as close_price,
        sum(volume) OVER w as volume,
        '1h' as interval_type
    FROM market_data 
    WHERE timestamp >= NOW() - INTERVAL '2 hours'
    AND timestamp < NOW() - INTERVAL '1 hour'
    WINDOW w AS (PARTITION BY symbol, date_trunc('hour', timestamp) ORDER BY timestamp 
                ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
    ON CONFLICT (symbol, date, interval_type) DO UPDATE SET
        high_price = GREATEST(historical_data.high_price, EXCLUDED.high_price),
        low_price = LEAST(historical_data.low_price, EXCLUDED.low_price),
        close_price = EXCLUDED.close_price,
        volume = historical_data.volume + EXCLUDED.volume;
        
    -- Create daily aggregates from hourly data
    INSERT INTO historical_data (symbol, date, open_price, high_price, low_price, close_price, volume, interval_type)
    SELECT 
        symbol,
        DATE(date) as date,
        first_value(open_price) OVER w as open_price,
        max(high_price) OVER w as high_price,
        min(low_price) OVER w as low_price,
        last_value(close_price) OVER w as close_price,
        sum(volume) OVER w as volume,
        '1d' as interval_type
    FROM historical_data 
    WHERE date >= CURRENT_DATE - INTERVAL '2 days'
    AND date < CURRENT_DATE - INTERVAL '1 day'
    AND interval_type = '1h'
    WINDOW w AS (PARTITION BY symbol, DATE(date) ORDER BY date 
                ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)
    ON CONFLICT (symbol, date, interval_type) DO UPDATE SET
        high_price = GREATEST(historical_data.high_price, EXCLUDED.high_price),
        low_price = LEAST(historical_data.low_price, EXCLUDED.low_price),
        close_price = EXCLUDED.close_price,
        volume = historical_data.volume + EXCLUDED.volume;
END;
$$ LANGUAGE plpgsql;

-- Calculate technical indicators
CREATE OR REPLACE FUNCTION calculate_technical_indicators()
RETURNS void AS $$
BEGIN
    -- Simple Moving Average (SMA)
    INSERT INTO analytics.technical_indicators (symbol, indicator_type, indicator_value, period)
    SELECT 
        symbol,
        'SMA' as indicator_type,
        AVG(close_price) as indicator_value,
        20 as period
    FROM historical_data 
    WHERE date >= CURRENT_DATE - INTERVAL '20 days'
    AND interval_type = '1d'
    GROUP BY symbol
    ON CONFLICT (symbol, indicator_type, period, calculated_at) DO UPDATE SET
        indicator_value = EXCLUDED.indicator_value;
        
    -- Relative Strength Index (RSI) - simplified calculation
    WITH price_changes AS (
        SELECT 
            symbol,
            close_price - LAG(close_price) OVER (PARTITION BY symbol ORDER BY date) as price_change
        FROM historical_data 
        WHERE date >= CURRENT_DATE - INTERVAL '15 days'
        AND interval_type = '1d'
    ),
    gains_losses AS (
        SELECT 
            symbol,
            AVG(CASE WHEN price_change > 0 THEN price_change ELSE 0 END) as avg_gain,
            AVG(CASE WHEN price_change < 0 THEN ABS(price_change) ELSE 0 END) as avg_loss
        FROM price_changes 
        WHERE price_change IS NOT NULL
        GROUP BY symbol
    )
    INSERT INTO analytics.technical_indicators (symbol, indicator_type, indicator_value, period)
    SELECT 
        symbol,
        'RSI' as indicator_type,
        100 - (100 / (1 + (avg_gain / NULLIF(avg_loss, 0)))) as indicator_value,
        14 as period
    FROM gains_losses
    ON CONFLICT (symbol, indicator_type, period, calculated_at) DO UPDATE SET
        indicator_value = EXCLUDED.indicator_value;
END;
$$ LANGUAGE plpgsql;

-- Data cleanup procedures
CREATE OR REPLACE FUNCTION cleanup_market_data()
RETURNS void AS $$
BEGIN
    -- Remove minute-level data older than 7 days
    DELETE FROM market_data 
    WHERE timestamp < NOW() - INTERVAL '7 days'
    AND interval_type = '1m';
    
    -- Remove live prices older than 1 hour
    DELETE FROM realtime.live_prices 
    WHERE timestamp < NOW() - INTERVAL '1 hour';
    
    -- Clean up old price changes
    DELETE FROM realtime.price_changes 
    WHERE period_end < NOW() - INTERVAL '24 hours';
    
    -- Archive old technical indicators
    DELETE FROM analytics.technical_indicators 
    WHERE calculated_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Materialized views for common queries
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.market_summary AS
SELECT 
    symbol,
    COUNT(*) as data_points,
    MIN(timestamp) as first_data_point,
    MAX(timestamp) as last_data_point,
    AVG(price) as avg_price,
    STDDEV(price) as price_volatility,
    SUM(volume) as total_volume
FROM market_data 
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY symbol
ORDER BY total_volume DESC;

CREATE UNIQUE INDEX idx_market_summary_symbol 
ON analytics.market_summary(symbol);

-- Most active symbols view
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.most_active_symbols AS
SELECT 
    symbol,
    SUM(volume) as total_volume,
    COUNT(*) as trade_count,
    MAX(timestamp) as last_update
FROM market_data 
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY symbol
ORDER BY total_volume DESC
LIMIT 100;

-- Connection pooling configuration for high-throughput market data
ALTER SYSTEM SET max_connections = 500;
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';

-- Enable query performance tracking
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Schedule maintenance tasks
-- SELECT cron.schedule('aggregate-market-data', '5 * * * *', 'SELECT aggregate_market_data();');
-- SELECT cron.schedule('calculate-indicators', '10 */6 * * *', 'SELECT calculate_technical_indicators();');
-- SELECT cron.schedule('cleanup-market-data', '0 4 * * *', 'SELECT cleanup_market_data();');
-- SELECT cron.schedule('refresh-market-summary', '*/15 * * * *', 'REFRESH MATERIALIZED VIEW analytics.market_summary;');
-- SELECT cron.schedule('refresh-active-symbols', '*/5 * * * *', 'REFRESH MATERIALIZED VIEW analytics.most_active_symbols;');

COMMENT ON DATABASE treum_market_data IS 'Market data service database optimized for high-throughput time-series data ingestion and real-time analytics';