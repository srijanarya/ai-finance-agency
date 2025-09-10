-- TREUM Signals Database Schema with Performance Optimizations
-- Database: treum_signals
-- Service: signals

\c treum_signals;

-- Signals-specific optimizations for analytical workloads
ALTER SYSTEM SET shared_buffers = '512MB';
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET maintenance_work_mem = '256MB';
ALTER SYSTEM SET effective_cache_size = '2GB';
ALTER SYSTEM SET random_page_cost = 1.0;
ALTER SYSTEM SET effective_io_concurrency = 400;

-- Enable parallel query processing for complex analytics
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
ALTER SYSTEM SET max_parallel_workers = 8;

-- Signal generation and tracking indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signals_symbol_created 
ON signals(symbol, created_at DESC) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signals_signal_type_created 
ON signals(signal_type, created_at DESC) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signals_confidence_created 
ON signals(confidence DESC, created_at DESC) WHERE confidence >= 0.7;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_signals_expiry_active 
ON signals(expires_at) WHERE is_active = true AND expires_at > NOW();

-- Backtesting performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_backtest_results_strategy_created 
ON backtest_results(strategy_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_backtest_results_symbol_performance 
ON backtest_results(symbol, total_return DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_backtest_results_period_return 
ON backtest_results(backtest_start_date DESC, total_return DESC);

-- Market data correlation for signals
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_market_data_signals_symbol_time 
ON market_data(symbol, timestamp DESC) WHERE timestamp > NOW() - INTERVAL '1 hour';

-- Backtesting schema for strategy analysis
CREATE SCHEMA IF NOT EXISTS backtesting;

-- Strategy performance tracking
CREATE TABLE IF NOT EXISTS backtesting.strategy_performance (
    strategy_id UUID NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    backtest_period_start DATE NOT NULL,
    backtest_period_end DATE NOT NULL,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    total_return DECIMAL(10,4),
    annualized_return DECIMAL(10,4),
    max_drawdown DECIMAL(10,4),
    sharpe_ratio DECIMAL(8,4),
    sortino_ratio DECIMAL(8,4),
    calmar_ratio DECIMAL(8,4),
    win_rate DECIMAL(5,2),
    profit_factor DECIMAL(8,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (strategy_id, symbol, backtest_period_start)
);

CREATE INDEX idx_strategy_performance_return 
ON backtesting.strategy_performance(total_return DESC);

CREATE INDEX idx_strategy_performance_sharpe 
ON backtesting.strategy_performance(sharpe_ratio DESC);

-- Strategy comparison matrix
CREATE TABLE IF NOT EXISTS backtesting.strategy_comparisons (
    comparison_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    strategy_ids UUID[],
    comparison_period_start DATE,
    comparison_period_end DATE,
    best_strategy_id UUID,
    comparison_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance schema for real-time analytics
CREATE SCHEMA IF NOT EXISTS performance;

-- Signal accuracy tracking
CREATE TABLE IF NOT EXISTS performance.signal_accuracy (
    signal_id UUID PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    signal_type VARCHAR(50) NOT NULL,
    predicted_direction VARCHAR(10),
    predicted_price DECIMAL(18,8),
    actual_price DECIMAL(18,8),
    accuracy_score DECIMAL(5,4),
    time_to_target INTEGER, -- minutes
    signal_created_at TIMESTAMP WITH TIME ZONE,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_signal_accuracy_symbol_type 
ON performance.signal_accuracy(symbol, signal_type, evaluated_at DESC);

CREATE INDEX idx_signal_accuracy_score 
ON performance.signal_accuracy(accuracy_score DESC, evaluated_at DESC);

-- Real-time signal performance metrics
CREATE TABLE IF NOT EXISTS performance.signal_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(20) NOT NULL,
    signal_type VARCHAR(50) NOT NULL,
    total_signals INTEGER DEFAULT 0,
    accurate_signals INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2),
    avg_time_to_target DECIMAL(8,2),
    avg_confidence DECIMAL(5,4),
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signal generation analytics procedures
CREATE OR REPLACE FUNCTION calculate_signal_performance()
RETURNS void AS $$
BEGIN
    -- Update signal accuracy based on actual market movements
    WITH signal_outcomes AS (
        SELECT 
            s.id as signal_id,
            s.symbol,
            s.signal_type,
            s.predicted_price,
            s.target_price,
            s.created_at,
            s.expires_at,
            -- Get the actual price at signal expiry or current time
            COALESCE(
                (SELECT price FROM market_data md 
                 WHERE md.symbol = s.symbol 
                 AND md.timestamp <= COALESCE(s.expires_at, NOW())
                 ORDER BY md.timestamp DESC LIMIT 1),
                s.predicted_price
            ) as actual_price
        FROM signals s
        WHERE s.created_at >= NOW() - INTERVAL '24 hours'
        AND s.created_at <= NOW() - INTERVAL '1 hour'  -- Allow time for market movement
    )
    INSERT INTO performance.signal_accuracy (
        signal_id, symbol, signal_type, predicted_price, actual_price, accuracy_score, signal_created_at
    )
    SELECT 
        signal_id,
        symbol,
        signal_type,
        predicted_price,
        actual_price,
        -- Calculate accuracy score based on price prediction accuracy
        GREATEST(0, 1 - (ABS(predicted_price - actual_price) / predicted_price)) as accuracy_score,
        created_at
    FROM signal_outcomes
    ON CONFLICT (signal_id) DO UPDATE SET
        actual_price = EXCLUDED.actual_price,
        accuracy_score = EXCLUDED.accuracy_score,
        evaluated_at = NOW();
        
    -- Update aggregated signal metrics
    INSERT INTO performance.signal_metrics (
        symbol, signal_type, total_signals, accurate_signals, accuracy_rate, 
        avg_confidence, period_start, period_end
    )
    SELECT 
        sa.symbol,
        sa.signal_type,
        COUNT(*) as total_signals,
        COUNT(CASE WHEN sa.accuracy_score >= 0.7 THEN 1 END) as accurate_signals,
        (COUNT(CASE WHEN sa.accuracy_score >= 0.7 THEN 1 END) * 100.0 / COUNT(*)) as accuracy_rate,
        AVG(s.confidence) as avg_confidence,
        DATE_TRUNC('day', MIN(sa.signal_created_at)) as period_start,
        DATE_TRUNC('day', MAX(sa.signal_created_at)) as period_end
    FROM performance.signal_accuracy sa
    JOIN signals s ON s.id = sa.signal_id
    WHERE sa.evaluated_at >= CURRENT_DATE - INTERVAL '1 day'
    GROUP BY sa.symbol, sa.signal_type, DATE_TRUNC('day', sa.signal_created_at)
    ON CONFLICT (symbol, signal_type, period_start, period_end) DO UPDATE SET
        total_signals = EXCLUDED.total_signals,
        accurate_signals = EXCLUDED.accurate_signals,
        accuracy_rate = EXCLUDED.accuracy_rate,
        avg_confidence = EXCLUDED.avg_confidence,
        calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Backtesting execution procedure
CREATE OR REPLACE FUNCTION run_strategy_backtest(
    p_strategy_id UUID,
    p_symbol VARCHAR(20),
    p_start_date DATE,
    p_end_date DATE
)
RETURNS void AS $$
DECLARE
    v_total_trades INTEGER := 0;
    v_winning_trades INTEGER := 0;
    v_total_return DECIMAL(10,4) := 0;
    v_max_drawdown DECIMAL(10,4) := 0;
BEGIN
    -- This is a simplified backtesting procedure
    -- In practice, this would include complex strategy logic
    
    -- Calculate basic performance metrics from historical signals and market data
    WITH backtest_trades AS (
        SELECT 
            s.id,
            s.symbol,
            s.signal_type,
            s.predicted_price,
            s.target_price,
            s.confidence,
            s.created_at,
            -- Get actual price movement
            LAG(md.price) OVER (ORDER BY md.timestamp) as entry_price,
            md.price as exit_price
        FROM signals s
        JOIN market_data md ON md.symbol = s.symbol
        WHERE s.symbol = p_symbol
        AND DATE(s.created_at) BETWEEN p_start_date AND p_end_date
        AND md.timestamp BETWEEN s.created_at AND s.created_at + INTERVAL '1 hour'
    ),
    trade_results AS (
        SELECT 
            COUNT(*) as total_trades,
            COUNT(CASE WHEN (exit_price - entry_price) / entry_price > 0 THEN 1 END) as winning_trades,
            AVG((exit_price - entry_price) / entry_price) as avg_return,
            STDDEV((exit_price - entry_price) / entry_price) as return_volatility
        FROM backtest_trades
        WHERE entry_price IS NOT NULL AND exit_price IS NOT NULL
    )
    INSERT INTO backtesting.strategy_performance (
        strategy_id, symbol, backtest_period_start, backtest_period_end,
        total_trades, winning_trades, total_return, win_rate, sharpe_ratio
    )
    SELECT 
        p_strategy_id,
        p_symbol,
        p_start_date,
        p_end_date,
        total_trades,
        winning_trades,
        avg_return * 100 as total_return,
        (winning_trades * 100.0 / total_trades) as win_rate,
        CASE WHEN return_volatility > 0 THEN avg_return / return_volatility ELSE 0 END as sharpe_ratio
    FROM trade_results
    ON CONFLICT (strategy_id, symbol, backtest_period_start) DO UPDATE SET
        total_trades = EXCLUDED.total_trades,
        winning_trades = EXCLUDED.winning_trades,
        total_return = EXCLUDED.total_return,
        win_rate = EXCLUDED.win_rate,
        sharpe_ratio = EXCLUDED.sharpe_ratio,
        created_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Data cleanup for signals
CREATE OR REPLACE FUNCTION cleanup_signals_data()
RETURNS void AS $$
BEGIN
    -- Archive old signals (keep last 90 days active)
    UPDATE signals 
    SET is_active = false 
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND is_active = true;
    
    -- Clean up expired signals
    UPDATE signals 
    SET is_active = false 
    WHERE expires_at < NOW()
    AND is_active = true;
    
    -- Remove old backtest results (keep last 1 year)
    DELETE FROM backtest_results 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Clean up old signal accuracy data (keep last 6 months)
    DELETE FROM performance.signal_accuracy 
    WHERE evaluated_at < NOW() - INTERVAL '6 months';
END;
$$ LANGUAGE plpgsql;

-- Materialized views for signal analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS performance.top_performing_signals AS
SELECT 
    symbol,
    signal_type,
    COUNT(*) as total_signals,
    AVG(accuracy_score) as avg_accuracy,
    AVG(time_to_target) as avg_time_to_target,
    MAX(evaluated_at) as last_evaluated
FROM performance.signal_accuracy 
WHERE evaluated_at > NOW() - INTERVAL '7 days'
GROUP BY symbol, signal_type
HAVING COUNT(*) >= 5  -- Minimum sample size
ORDER BY avg_accuracy DESC;

CREATE MATERIALIZED VIEW IF NOT EXISTS backtesting.strategy_rankings AS
SELECT 
    strategy_id,
    COUNT(DISTINCT symbol) as symbols_tested,
    AVG(total_return) as avg_return,
    AVG(sharpe_ratio) as avg_sharpe,
    AVG(win_rate) as avg_win_rate,
    MAX(created_at) as last_backtest
FROM backtesting.strategy_performance
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY strategy_id
ORDER BY avg_sharpe DESC, avg_return DESC;

-- Indexes on materialized views
CREATE INDEX idx_top_signals_accuracy ON performance.top_performing_signals(avg_accuracy DESC);
CREATE INDEX idx_strategy_rankings_sharpe ON backtesting.strategy_rankings(avg_sharpe DESC);

-- Schedule maintenance tasks
-- SELECT cron.schedule('calculate-signal-performance', '0 */2 * * *', 'SELECT calculate_signal_performance();');
-- SELECT cron.schedule('cleanup-signals-data', '0 3 * * *', 'SELECT cleanup_signals_data();');
-- SELECT cron.schedule('refresh-signal-analytics', '*/30 * * * *', 
--   'REFRESH MATERIALIZED VIEW performance.top_performing_signals; REFRESH MATERIALIZED VIEW backtesting.strategy_rankings;');

-- Enable query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

COMMENT ON DATABASE treum_signals IS 'Signals service database optimized for strategy backtesting and signal performance analytics';