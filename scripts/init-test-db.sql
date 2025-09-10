-- Initialize test databases for all services
CREATE DATABASE test_user_management;
CREATE DATABASE test_payment;
CREATE DATABASE test_trading;
CREATE DATABASE test_signals;
CREATE DATABASE test_market_data;
CREATE DATABASE test_risk_management;
CREATE DATABASE test_education;
CREATE DATABASE test_notification;

-- Create test user with appropriate permissions
CREATE USER test_service_user WITH PASSWORD 'test_service_password';

-- Grant permissions to test user for all test databases
GRANT ALL PRIVILEGES ON DATABASE test_user_management TO test_service_user;
GRANT ALL PRIVILEGES ON DATABASE test_payment TO test_service_user;
GRANT ALL PRIVILEGES ON DATABASE test_trading TO test_service_user;
GRANT ALL PRIVILEGES ON DATABASE test_signals TO test_service_user;
GRANT ALL PRIVILEGES ON DATABASE test_market_data TO test_service_user;
GRANT ALL PRIVILEGES ON DATABASE test_risk_management TO test_service_user;
GRANT ALL PRIVILEGES ON DATABASE test_education TO test_service_user;
GRANT ALL PRIVILEGES ON DATABASE test_notification TO test_service_user;

-- Connect to each database and set up schemas
\c test_user_management;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c test_payment;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c test_trading;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c test_signals;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c test_market_data;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c test_risk_management;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c test_education;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c test_notification;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";