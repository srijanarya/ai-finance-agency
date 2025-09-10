-- Database initialization script for AI Finance Agency
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'user', 'viewer', 'api');
CREATE TYPE content_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'published');
CREATE TYPE platform_type AS ENUM ('linkedin', 'twitter', 'telegram', 'instagram', 'facebook');

-- Create sequences for ID generation
CREATE SEQUENCE IF NOT EXISTS global_id_seq START 1000;

-- Create function to generate custom IDs
CREATE OR REPLACE FUNCTION generate_custom_id(prefix text DEFAULT 'afa') 
RETURNS text AS $$
BEGIN
    RETURN prefix || '_' || LPAD(nextval('global_id_seq')::text, 8, '0');
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions to application user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ai_finance_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ai_finance_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ai_finance_user;

-- Ensure future tables/sequences also get proper permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ai_finance_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ai_finance_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO ai_finance_user;

-- Create indexes for better performance
-- (These will be created by Alembic migrations, but having them here for reference)

-- Log the completion
INSERT INTO pg_stat_statements_info VALUES ('AI Finance Agency database initialized successfully');

COMMENT ON DATABASE ai_finance_db IS 'AI Finance Agency - Microservices Platform Database';