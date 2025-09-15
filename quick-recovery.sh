#!/bin/bash

echo "🚀 Quick AI Finance Agency Recovery"
echo "===================================="

# 1. Check Docker
echo "1. Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "   ❌ Docker is not running. Starting..."
    ./fix-docker-startup.sh
else
    echo "   ✅ Docker is running"
fi

# 2. Start only essential services
echo ""
echo "2. Starting essential services..."
docker run -d --name ai_finance_postgres \
  -e POSTGRES_USER=ai_finance_user \
  -e POSTGRES_PASSWORD=securepassword123 \
  -e POSTGRES_DB=ai_finance_db \
  -p 5432:5432 \
  postgres:15 2>/dev/null || echo "   Postgres already running"

docker run -d --name ai_finance_redis \
  -p 6379:6379 \
  redis:7-alpine 2>/dev/null || echo "   Redis already running"

# 3. Create database users
echo ""
echo "3. Setting up database users..."
sleep 5
docker exec ai_finance_postgres psql -U ai_finance_user -d postgres -c "
  CREATE USER payment_user WITH PASSWORD 'securepassword123';
  CREATE USER trading_user WITH PASSWORD 'securepassword123';
  CREATE USER user_management_user WITH PASSWORD 'securepassword123';
  CREATE USER signals_user WITH PASSWORD 'securepassword123';
  CREATE USER risk_user WITH PASSWORD 'securepassword123';
  CREATE USER education_user WITH PASSWORD 'securepassword123';
  GRANT ALL PRIVILEGES ON DATABASE ai_finance_db TO payment_user;
  GRANT ALL PRIVILEGES ON DATABASE ai_finance_db TO trading_user;
  GRANT ALL PRIVILEGES ON DATABASE ai_finance_db TO user_management_user;
  GRANT ALL PRIVILEGES ON DATABASE ai_finance_db TO signals_user;
  GRANT ALL PRIVILEGES ON DATABASE ai_finance_db TO risk_user;
  GRANT ALL PRIVILEGES ON DATABASE ai_finance_db TO education_user;
" 2>/dev/null || echo "   Users may already exist"

# 4. Start services
echo ""
echo "4. Starting microservices..."
./scripts/start-services-local.sh

echo ""
echo "✅ Recovery complete!"
echo ""
echo "Available endpoints:"
echo "  - API Gateway: http://localhost:3000/health"
echo "  - API Documentation: See api-testing-guide.md"
echo ""
echo "To test:"
echo "  curl http://localhost:3000/health | jq"