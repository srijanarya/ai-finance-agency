-- TREUM Database Performance Monitoring Queries
-- Cross-database performance monitoring and optimization queries

-- ==============================================================================
-- CONNECTION AND RESOURCE MONITORING
-- ==============================================================================

-- Monitor active connections across all databases
CREATE OR REPLACE VIEW system_connection_overview AS
SELECT 
    datname as database_name,
    usename as username,
    application_name,
    client_addr,
    state,
    COUNT(*) as connection_count,
    MAX(now() - query_start) as longest_running_query,
    AVG(now() - query_start) as avg_query_duration
FROM pg_stat_activity 
WHERE datname IN ('treum_users', 'treum_trading', 'treum_signals', 'treum_payments', 
                  'treum_notifications', 'treum_risk', 'treum_market_data', 'treum_education')
GROUP BY datname, usename, application_name, client_addr, state
ORDER BY connection_count DESC;

-- Database size monitoring
CREATE OR REPLACE VIEW database_size_monitoring AS
SELECT 
    datname as database_name,
    pg_size_pretty(pg_database_size(datname)) as size_pretty,
    pg_database_size(datname) as size_bytes,
    CASE 
        WHEN datname LIKE '%trading%' THEN 'High Growth Expected'
        WHEN datname LIKE '%market_data%' THEN 'Very High Growth Expected'
        WHEN datname LIKE '%notifications%' THEN 'Medium Growth Expected'
        ELSE 'Low Growth Expected'
    END as growth_category,
    -- Calculate growth rate (requires historical data)
    (pg_database_size(datname)::float / 1024 / 1024 / 1024) as size_gb
FROM pg_database 
WHERE datname IN ('treum_users', 'treum_trading', 'treum_signals', 'treum_payments', 
                  'treum_notifications', 'treum_risk', 'treum_market_data', 'treum_education')
ORDER BY pg_database_size(datname) DESC;

-- ==============================================================================
-- QUERY PERFORMANCE MONITORING
-- ==============================================================================

-- Slow query monitoring (requires pg_stat_statements)
CREATE OR REPLACE VIEW slow_queries_cross_database AS
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals[1:3] as top_values,
    most_common_freqs[1:3] as top_frequencies
FROM pg_stats 
WHERE schemaname = 'public'
AND tablename IN (
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename ~ '(users|orders|trades|signals|payments|notifications|risk|market_data)'
)
ORDER BY abs(correlation) DESC;

-- Index usage analysis
CREATE OR REPLACE VIEW index_usage_analysis AS
WITH index_usage AS (
    SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
        pg_relation_size(indexrelid) as index_size_bytes
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
),
table_sizes AS (
    SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
        pg_total_relation_size(schemaname||'.'||tablename) as table_size_bytes
    FROM pg_tables 
    WHERE schemaname = 'public'
)
SELECT 
    i.schemaname,
    i.tablename,
    i.indexname,
    i.idx_scan as times_used,
    i.idx_tup_read as tuples_read,
    i.idx_tup_fetch as tuples_fetched,
    i.index_size,
    t.table_size,
    CASE 
        WHEN i.idx_scan = 0 THEN 'UNUSED - Consider dropping'
        WHEN i.idx_scan < 100 THEN 'Low usage'
        WHEN i.idx_scan < 1000 THEN 'Medium usage'
        ELSE 'High usage'
    END as usage_category,
    ROUND((i.index_size_bytes::float / t.table_size_bytes * 100)::numeric, 2) as size_ratio_percent
FROM index_usage i
JOIN table_sizes t ON i.tablename = t.tablename AND i.schemaname = t.schemaname
ORDER BY i.idx_scan ASC, i.index_size_bytes DESC;

-- ==============================================================================
-- TABLE PERFORMANCE ANALYSIS
-- ==============================================================================

-- Table scan analysis
CREATE OR REPLACE VIEW table_scan_analysis AS
SELECT 
    schemaname,
    tablename,
    seq_scan as sequential_scans,
    seq_tup_read as sequential_tuples_read,
    idx_scan as index_scans,
    idx_tup_fetch as index_tuples_fetched,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_tup_hot_upd as hot_updates,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    CASE 
        WHEN seq_scan = 0 THEN 0
        ELSE ROUND((seq_tup_read::float / seq_scan)::numeric, 2)
    END as avg_seq_scan_size,
    CASE 
        WHEN seq_scan > idx_scan AND seq_scan > 1000 THEN 'HIGH SEQ SCAN - Consider indexing'
        WHEN n_dead_tup > n_live_tup * 0.1 THEN 'HIGH DEAD TUPLES - Needs VACUUM'
        WHEN n_tup_upd > n_tup_ins * 2 THEN 'UPDATE HEAVY - Monitor for bloat'
        ELSE 'Normal'
    END as recommendation
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY seq_tup_read DESC;

-- Vacuum and analyze status
CREATE OR REPLACE VIEW vacuum_analyze_status AS
SELECT 
    schemaname,
    tablename,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze,
    vacuum_count,
    autovacuum_count,
    analyze_count,
    autoanalyze_count,
    n_dead_tup,
    n_live_tup,
    CASE 
        WHEN last_autovacuum < NOW() - INTERVAL '1 day' AND n_dead_tup > 1000 THEN 'URGENT - Manual VACUUM needed'
        WHEN last_autoanalyze < NOW() - INTERVAL '1 day' THEN 'ANALYZE recommended'
        WHEN n_dead_tup > n_live_tup * 0.2 THEN 'VACUUM recommended'
        ELSE 'OK'
    END as maintenance_status
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC;

-- ==============================================================================
-- SPECIFIC SERVICE PERFORMANCE QUERIES
-- ==============================================================================

-- Trading service performance queries
-- (Run against treum_trading database)
CREATE OR REPLACE VIEW trading_performance_metrics AS
SELECT 
    'order_execution_speed' as metric,
    COUNT(*) as total_orders,
    AVG(EXTRACT(epoch FROM (updated_at - created_at))) as avg_execution_seconds,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(epoch FROM (updated_at - created_at))) as p95_execution_seconds,
    MAX(EXTRACT(epoch FROM (updated_at - created_at))) as max_execution_seconds
FROM orders 
WHERE created_at > NOW() - INTERVAL '1 hour'
AND status IN ('filled', 'partial_filled')

UNION ALL

SELECT 
    'position_updates' as metric,
    COUNT(*) as total_updates,
    AVG(EXTRACT(epoch FROM (updated_at - created_at))) as avg_update_seconds,
    NULL as p95_execution_seconds,
    MAX(EXTRACT(epoch FROM (updated_at - created_at))) as max_update_seconds
FROM positions 
WHERE updated_at > NOW() - INTERVAL '1 hour';

-- Market data ingestion performance
-- (Run against treum_market_data database)
CREATE OR REPLACE VIEW market_data_ingestion_metrics AS
SELECT 
    DATE_TRUNC('minute', timestamp) as minute_bucket,
    COUNT(*) as data_points_per_minute,
    COUNT(DISTINCT symbol) as unique_symbols,
    AVG(volume) as avg_volume,
    MIN(timestamp) as first_data_point,
    MAX(timestamp) as last_data_point,
    EXTRACT(epoch FROM (MAX(timestamp) - MIN(timestamp))) as time_span_seconds
FROM market_data 
WHERE timestamp > NOW() - INTERVAL '1 hour'
GROUP BY DATE_TRUNC('minute', timestamp)
ORDER BY minute_bucket DESC;

-- Notification delivery performance
-- (Run against treum_notifications database)
CREATE OR REPLACE VIEW notification_performance_metrics AS
SELECT 
    notification_type,
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
    ROUND(
        (COUNT(CASE WHEN status = 'sent' THEN 1 END)::float / COUNT(*) * 100)::numeric, 
        2
    ) as delivery_rate_percent,
    AVG(EXTRACT(epoch FROM (sent_at - created_at))) as avg_delivery_seconds,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(epoch FROM (sent_at - created_at))) as p95_delivery_seconds
FROM notifications 
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY notification_type
ORDER BY total_notifications DESC;

-- ==============================================================================
-- PERFORMANCE OPTIMIZATION RECOMMENDATIONS
-- ==============================================================================

-- Generate performance optimization recommendations
CREATE OR REPLACE FUNCTION generate_performance_recommendations()
RETURNS TABLE (
    database_name TEXT,
    table_name TEXT,
    issue_type TEXT,
    current_value NUMERIC,
    recommended_action TEXT,
    priority TEXT
) AS $$
BEGIN
    -- High sequential scan recommendations
    RETURN QUERY
    SELECT 
        'cross-database'::TEXT as database_name,
        tablename::TEXT,
        'High Sequential Scans'::TEXT as issue_type,
        seq_scan::NUMERIC as current_value,
        'Consider adding indexes on frequently queried columns'::TEXT as recommended_action,
        CASE 
            WHEN seq_scan > 10000 THEN 'HIGH'
            WHEN seq_scan > 1000 THEN 'MEDIUM'
            ELSE 'LOW'
        END::TEXT as priority
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    AND seq_scan > idx_scan
    AND seq_scan > 100;
    
    -- Dead tuple recommendations
    RETURN QUERY
    SELECT 
        'cross-database'::TEXT as database_name,
        tablename::TEXT,
        'High Dead Tuples'::TEXT as issue_type,
        n_dead_tup::NUMERIC as current_value,
        'Run VACUUM or increase autovacuum frequency'::TEXT as recommended_action,
        CASE 
            WHEN n_dead_tup > n_live_tup * 0.5 THEN 'HIGH'
            WHEN n_dead_tup > n_live_tup * 0.2 THEN 'MEDIUM'
            ELSE 'LOW'
        END::TEXT as priority
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    AND n_dead_tup > 1000;
    
    -- Unused index recommendations
    RETURN QUERY
    SELECT 
        'cross-database'::TEXT as database_name,
        tablename::TEXT,
        'Unused Index'::TEXT as issue_type,
        pg_relation_size(indexrelid)::NUMERIC as current_value,
        'Consider dropping unused index: ' || indexname::TEXT as recommended_action,
        CASE 
            WHEN pg_relation_size(indexrelid) > 100 * 1024 * 1024 THEN 'HIGH'  -- 100MB
            WHEN pg_relation_size(indexrelid) > 10 * 1024 * 1024 THEN 'MEDIUM'   -- 10MB
            ELSE 'LOW'
        END::TEXT as priority
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    AND idx_scan = 0
    AND pg_relation_size(indexrelid) > 1024 * 1024;  -- Larger than 1MB
    
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- AUTOMATED PERFORMANCE MONITORING PROCEDURES
-- ==============================================================================

-- Create performance monitoring log table
CREATE TABLE IF NOT EXISTS performance_monitoring_log (
    id SERIAL PRIMARY KEY,
    database_name TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value NUMERIC,
    metric_metadata JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on monitoring log
CREATE INDEX IF NOT EXISTS idx_perf_log_database_metric_recorded 
ON performance_monitoring_log(database_name, metric_name, recorded_at DESC);

-- Automated performance data collection
CREATE OR REPLACE FUNCTION collect_performance_metrics()
RETURNS void AS $$
DECLARE
    db_record RECORD;
    metric_record RECORD;
BEGIN
    -- Collect database size metrics
    FOR db_record IN 
        SELECT datname, pg_database_size(datname) as db_size
        FROM pg_database 
        WHERE datname IN ('treum_users', 'treum_trading', 'treum_signals', 'treum_payments', 
                          'treum_notifications', 'treum_risk', 'treum_market_data', 'treum_education')
    LOOP
        INSERT INTO performance_monitoring_log (database_name, metric_name, metric_value)
        VALUES (db_record.datname, 'database_size_bytes', db_record.db_size);
    END LOOP;
    
    -- Collect connection count metrics
    FOR db_record IN 
        SELECT datname, COUNT(*) as conn_count
        FROM pg_stat_activity 
        WHERE datname IN ('treum_users', 'treum_trading', 'treum_signals', 'treum_payments', 
                          'treum_notifications', 'treum_risk', 'treum_market_data', 'treum_education')
        GROUP BY datname
    LOOP
        INSERT INTO performance_monitoring_log (database_name, metric_name, metric_value)
        VALUES (db_record.datname, 'active_connections', db_record.conn_count);
    END LOOP;
    
    -- Collect query performance metrics (if pg_stat_statements is available)
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements') THEN
        FOR metric_record IN 
            SELECT 
                'all_databases' as database_name,
                'avg_query_time' as metric_name,
                AVG(mean_exec_time) as metric_value
            FROM pg_stat_statements 
            WHERE calls > 100
        LOOP
            INSERT INTO performance_monitoring_log (database_name, metric_name, metric_value)
            VALUES (metric_record.database_name, metric_record.metric_name, metric_record.metric_value);
        END LOOP;
    END IF;
    
END;
$$ LANGUAGE plpgsql;

-- Performance alert function
CREATE OR REPLACE FUNCTION check_performance_alerts()
RETURNS TABLE (
    alert_level TEXT,
    database_name TEXT,
    alert_message TEXT,
    current_value NUMERIC,
    threshold_value NUMERIC
) AS $$
BEGIN
    -- Check for high connection usage
    RETURN QUERY
    SELECT 
        'WARNING'::TEXT as alert_level,
        datname::TEXT as database_name,
        'High connection count detected'::TEXT as alert_message,
        COUNT(*)::NUMERIC as current_value,
        200::NUMERIC as threshold_value
    FROM pg_stat_activity 
    WHERE datname IN ('treum_users', 'treum_trading', 'treum_signals', 'treum_payments', 
                      'treum_notifications', 'treum_risk', 'treum_market_data', 'treum_education')
    GROUP BY datname
    HAVING COUNT(*) > 200;
    
    -- Check for databases approaching size limits
    RETURN QUERY
    SELECT 
        CASE 
            WHEN pg_database_size(datname) > 50 * 1024 * 1024 * 1024 THEN 'CRITICAL'  -- 50GB
            WHEN pg_database_size(datname) > 10 * 1024 * 1024 * 1024 THEN 'WARNING'   -- 10GB
            ELSE 'INFO'
        END::TEXT as alert_level,
        datname::TEXT as database_name,
        'Database size approaching limits'::TEXT as alert_message,
        pg_database_size(datname)::NUMERIC as current_value,
        (50 * 1024 * 1024 * 1024)::NUMERIC as threshold_value
    FROM pg_database 
    WHERE datname IN ('treum_users', 'treum_trading', 'treum_signals', 'treum_payments', 
                      'treum_notifications', 'treum_risk', 'treum_market_data', 'treum_education')
    AND pg_database_size(datname) > 5 * 1024 * 1024 * 1024;  -- Alert when over 5GB
    
END;
$$ LANGUAGE plpgsql;

-- Schedule automated monitoring (requires pg_cron extension)
-- SELECT cron.schedule('collect-performance-metrics', '*/5 * * * *', 'SELECT collect_performance_metrics();');
-- SELECT cron.schedule('performance-alerts', '*/15 * * * *', 'SELECT * FROM check_performance_alerts();');

COMMENT ON FUNCTION generate_performance_recommendations() IS 'Generate actionable performance optimization recommendations across all TREUM databases';
COMMENT ON FUNCTION collect_performance_metrics() IS 'Automated collection of performance metrics for monitoring and alerting';
COMMENT ON FUNCTION check_performance_alerts() IS 'Check for performance issues that require immediate attention';