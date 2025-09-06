-- AI Finance Agency Database Schema for N8N Workflows
-- PostgreSQL Database Setup

-- Create database
CREATE DATABASE ai_finance_agency;

-- Connect to the database
\c ai_finance_agency;

-- Market data table
CREATE TABLE market_data (
    id SERIAL PRIMARY KEY,
    index_name VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2),
    open DECIMAL(10, 2),
    high DECIMAL(10, 2),
    low DECIMAL(10, 2),
    volume BIGINT,
    change_percent DECIMAL(5, 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content history table
CREATE TABLE content_history (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    content_hash VARCHAR(64) UNIQUE,
    content_type VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Publishing log table
CREATE TABLE publishing_log (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(20) NOT NULL,
    content_id INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    response TEXT,
    error_message TEXT,
    posted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News feed cache
CREATE TABLE news_cache (
    id SERIAL PRIMARY KEY,
    source VARCHAR(100),
    title TEXT,
    url TEXT,
    description TEXT,
    published_at TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance metrics table
CREATE TABLE performance_metrics (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(20),
    metric_type VARCHAR(50),
    metric_value DECIMAL(10, 2),
    metadata JSONB,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System metrics table for monitoring
CREATE TABLE system_metrics (
    id SERIAL PRIMARY KEY,
    metrics JSONB,
    alerts JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content queue for scheduled posting
CREATE TABLE content_queue (
    id SERIAL PRIMARY KEY,
    content_type VARCHAR(50),
    content TEXT,
    platform VARCHAR(20),
    scheduled_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'queued',
    priority INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API rate limits tracking
CREATE TABLE api_rate_limits (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(20) UNIQUE,
    requests_made INTEGER DEFAULT 0,
    requests_limit INTEGER,
    reset_time TIMESTAMP,
    last_request TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_market_data_timestamp ON market_data(timestamp DESC);
CREATE INDEX idx_market_data_index ON market_data(index_name, timestamp DESC);
CREATE INDEX idx_content_history_hash ON content_history(content_hash);
CREATE INDEX idx_content_history_platform ON content_history(platform, created_at DESC);
CREATE INDEX idx_publishing_log_platform ON publishing_log(platform, posted_at);
CREATE INDEX idx_publishing_log_status ON publishing_log(status, created_at DESC);
CREATE INDEX idx_news_cache_processed ON news_cache(processed, published_at);
CREATE INDEX idx_content_queue_scheduled ON content_queue(scheduled_time, status);
CREATE INDEX idx_performance_metrics_platform ON performance_metrics(platform, recorded_at DESC);

-- Create views for analytics
CREATE VIEW daily_posting_stats AS
SELECT 
    DATE(posted_at) as post_date,
    platform,
    COUNT(*) as total_posts,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_posts,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_posts,
    ROUND(COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
FROM publishing_log
WHERE posted_at IS NOT NULL
GROUP BY DATE(posted_at), platform
ORDER BY post_date DESC;

CREATE VIEW hourly_market_summary AS
SELECT 
    DATE_TRUNC('hour', timestamp) as hour,
    index_name,
    AVG(price) as avg_price,
    MAX(high) as max_high,
    MIN(low) as min_low,
    AVG(volume) as avg_volume,
    AVG(change_percent) as avg_change
FROM market_data
GROUP BY DATE_TRUNC('hour', timestamp), index_name
ORDER BY hour DESC;

-- Create functions for data management
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete market data older than 30 days
    DELETE FROM market_data WHERE timestamp < NOW() - INTERVAL '30 days';
    
    -- Delete old news cache entries
    DELETE FROM news_cache WHERE created_at < NOW() - INTERVAL '7 days' AND processed = true;
    
    -- Delete old system metrics
    DELETE FROM system_metrics WHERE timestamp < NOW() - INTERVAL '14 days';
    
    -- Archive old publishing logs
    DELETE FROM publishing_log WHERE created_at < NOW() - INTERVAL '60 days';
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating API rate limits
CREATE OR REPLACE FUNCTION update_api_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.platform IS NOT NULL THEN
        INSERT INTO api_rate_limits (platform, requests_made, last_request)
        VALUES (NEW.platform, 1, NOW())
        ON CONFLICT (platform) 
        DO UPDATE SET 
            requests_made = api_rate_limits.requests_made + 1,
            last_request = NOW(),
            updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rate_limit_trigger
AFTER INSERT ON publishing_log
FOR EACH ROW
EXECUTE FUNCTION update_api_rate_limit();

-- Insert initial rate limit configurations
INSERT INTO api_rate_limits (platform, requests_limit, reset_time) VALUES
    ('linkedin', 100, NOW() + INTERVAL '24 hours'),
    ('twitter', 300, NOW() + INTERVAL '3 hours'),
    ('telegram', 30, NOW() + INTERVAL '1 minute')
ON CONFLICT (platform) DO NOTHING;

-- Grant permissions (adjust user as needed)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO n8n_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO n8n_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO n8n_user;