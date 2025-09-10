-- TREUM AI Finance Agency - Separated Database Initialization
-- This script creates separate databases for each microservice
-- Execute with PostgreSQL superuser privileges

-- Create databases for each service
CREATE DATABASE treum_users;
CREATE DATABASE treum_trading;
CREATE DATABASE treum_signals;
CREATE DATABASE treum_payments;
CREATE DATABASE treum_notifications;
CREATE DATABASE treum_risk;
CREATE DATABASE treum_market_data;
CREATE DATABASE treum_education;
CREATE DATABASE treum_content_intelligence;

-- Create service-specific users with appropriate privileges
CREATE USER treum_user_service WITH PASSWORD 'user_secure_pass_2024';
CREATE USER treum_trading_service WITH PASSWORD 'trading_secure_pass_2024';
CREATE USER treum_signals_service WITH PASSWORD 'signals_secure_pass_2024';
CREATE USER treum_payments_service WITH PASSWORD 'payments_secure_pass_2024';
CREATE USER treum_notifications_service WITH PASSWORD 'notifications_secure_pass_2024';
CREATE USER treum_risk_service WITH PASSWORD 'risk_secure_pass_2024';
CREATE USER treum_market_data_service WITH PASSWORD 'market_data_secure_pass_2024';
CREATE USER treum_education_service WITH PASSWORD 'education_secure_pass_2024';
CREATE USER treum_content_service WITH PASSWORD 'content_secure_pass_2024';

-- Grant database ownership to respective service users
ALTER DATABASE treum_users OWNER TO treum_user_service;
ALTER DATABASE treum_trading OWNER TO treum_trading_service;
ALTER DATABASE treum_signals OWNER TO treum_signals_service;
ALTER DATABASE treum_payments OWNER TO treum_payments_service;
ALTER DATABASE treum_notifications OWNER TO treum_notifications_service;
ALTER DATABASE treum_risk OWNER TO treum_risk_service;
ALTER DATABASE treum_market_data OWNER TO treum_market_data_service;
ALTER DATABASE treum_education OWNER TO treum_education_service;
ALTER DATABASE treum_content_intelligence OWNER TO treum_content_service;

-- Connect to each database and configure extensions and schemas
\c treum_users;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE SCHEMA IF NOT EXISTS audit;
GRANT ALL PRIVILEGES ON SCHEMA public TO treum_user_service;
GRANT ALL PRIVILEGES ON SCHEMA audit TO treum_user_service;

\c treum_trading;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS compliance;
GRANT ALL PRIVILEGES ON SCHEMA public TO treum_trading_service;
GRANT ALL PRIVILEGES ON SCHEMA analytics TO treum_trading_service;
GRANT ALL PRIVILEGES ON SCHEMA compliance TO treum_trading_service;

\c treum_signals;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;
CREATE SCHEMA IF NOT EXISTS backtesting;
CREATE SCHEMA IF NOT EXISTS performance;
GRANT ALL PRIVILEGES ON SCHEMA public TO treum_signals_service;
GRANT ALL PRIVILEGES ON SCHEMA backtesting TO treum_signals_service;
GRANT ALL PRIVILEGES ON SCHEMA performance TO treum_signals_service;

\c treum_payments;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS compliance;
GRANT ALL PRIVILEGES ON SCHEMA public TO treum_payments_service;
GRANT ALL PRIVILEGES ON SCHEMA billing TO treum_payments_service;
GRANT ALL PRIVILEGES ON SCHEMA compliance TO treum_payments_service;

\c treum_notifications;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE SCHEMA IF NOT EXISTS templates;
CREATE SCHEMA IF NOT EXISTS delivery;
GRANT ALL PRIVILEGES ON SCHEMA public TO treum_notifications_service;
GRANT ALL PRIVILEGES ON SCHEMA templates TO treum_notifications_service;
GRANT ALL PRIVILEGES ON SCHEMA delivery TO treum_notifications_service;

\c treum_risk;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;
CREATE SCHEMA IF NOT EXISTS metrics;
CREATE SCHEMA IF NOT EXISTS alerts;
GRANT ALL PRIVILEGES ON SCHEMA public TO treum_risk_service;
GRANT ALL PRIVILEGES ON SCHEMA metrics TO treum_risk_service;
GRANT ALL PRIVILEGES ON SCHEMA alerts TO treum_risk_service;

\c treum_market_data;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;
CREATE SCHEMA IF NOT EXISTS historical;
CREATE SCHEMA IF NOT EXISTS realtime;
CREATE SCHEMA IF NOT EXISTS analytics;
GRANT ALL PRIVILEGES ON SCHEMA public TO treum_market_data_service;
GRANT ALL PRIVILEGES ON SCHEMA historical TO treum_market_data_service;
GRANT ALL PRIVILEGES ON SCHEMA realtime TO treum_market_data_service;
GRANT ALL PRIVILEGES ON SCHEMA analytics TO treum_market_data_service;

\c treum_education;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS progress;
GRANT ALL PRIVILEGES ON SCHEMA public TO treum_education_service;
GRANT ALL PRIVILEGES ON SCHEMA content TO treum_education_service;
GRANT ALL PRIVILEGES ON SCHEMA progress TO treum_education_service;

\c treum_content_intelligence;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE SCHEMA IF NOT EXISTS generation;
CREATE SCHEMA IF NOT EXISTS compliance;
GRANT ALL PRIVILEGES ON SCHEMA public TO treum_content_service;
GRANT ALL PRIVILEGES ON SCHEMA generation TO treum_content_service;
GRANT ALL PRIVILEGES ON SCHEMA compliance TO treum_content_service;

-- Create cross-service read-only users for analytics and reporting
CREATE USER treum_analytics_readonly WITH PASSWORD 'analytics_readonly_2024';

-- Grant read access to analytics user on key tables (to be executed after table creation)
GRANT CONNECT ON DATABASE treum_users TO treum_analytics_readonly;
GRANT CONNECT ON DATABASE treum_trading TO treum_analytics_readonly;
GRANT CONNECT ON DATABASE treum_signals TO treum_analytics_readonly;
GRANT CONNECT ON DATABASE treum_payments TO treum_analytics_readonly;
GRANT CONNECT ON DATABASE treum_market_data TO treum_analytics_readonly;

-- Switch back to default database
\c postgres;

-- Create database monitoring views
CREATE OR REPLACE VIEW database_health AS
SELECT 
  datname as database_name,
  pg_database_size(datname) as size_bytes,
  pg_size_pretty(pg_database_size(datname)) as size_pretty,
  (SELECT count(*) FROM pg_stat_activity WHERE datname = d.datname) as active_connections,
  datconnlimit as connection_limit
FROM pg_database d 
WHERE datname LIKE 'treum_%' 
ORDER BY pg_database_size(datname) DESC;

COMMENT ON VIEW database_health IS 'Monitor database sizes and connection counts for all TREUM services';