#!/bin/bash

# AI Finance Agency - Start All Services Script
# This script starts all microservices with proper environment variables

echo "🚀 Starting AI Finance Agency Microservices..."
echo "============================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -t -i:$port)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Killing process on port $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null
        sleep 2
    fi
}

# Check infrastructure services
echo -e "\n${GREEN}📊 Checking Infrastructure Services...${NC}"
echo "---------------------------------------"

if check_port 5432; then
    echo -e "✅ PostgreSQL is running on port 5432"
else
    echo -e "${RED}❌ PostgreSQL is not running! Please start it first.${NC}"
    exit 1
fi

if check_port 27017; then
    echo -e "✅ MongoDB is running on port 27017"
else
    echo -e "${RED}❌ MongoDB is not running! Please start it first.${NC}"
    exit 1
fi

if check_port 6379; then
    echo -e "✅ Redis is running on port 6379"
else
    echo -e "${RED}❌ Redis is not running! Please start it first.${NC}"
    exit 1
fi

if check_port 5672; then
    echo -e "✅ RabbitMQ is running on port 5672"
else
    echo -e "${RED}❌ RabbitMQ is not running! Please start it first.${NC}"
    exit 1
fi

# Kill any existing services on our ports
echo -e "\n${YELLOW}🔧 Cleaning up existing services...${NC}"
echo "------------------------------------"

for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010; do
    if check_port $port; then
        kill_port $port
    fi
done

# Start services
echo -e "\n${GREEN}🎯 Starting Microservices...${NC}"
echo "-----------------------------"

# Common environment variables
export NODE_ENV=development
export JWT_SECRET=your-secret-key-min-32-chars-change-in-production
export DATABASE_HOST=localhost
export DATABASE_PORT=5432
export DATABASE_USER=ai_finance_user
export DATABASE_PASSWORD=securepassword123

# 1. API Gateway (Port 3000)
echo -e "\n${YELLOW}Starting API Gateway on port 3000...${NC}"
cd /Users/srijan/ai-finance-agency/services/api-gateway
export PORT=3000
export DATABASE_NAME=ai_finance_db
npm run start:dev > /tmp/api-gateway.log 2>&1 &
sleep 3

# 2. Payment Service (Port 3001)
echo -e "${YELLOW}Starting Payment Service on port 3001...${NC}"
cd /Users/srijan/ai-finance-agency/services/payment
export PORT=3001
export DATABASE_NAME=payment_db
export DATABASE_USERNAME=$DATABASE_USER
export STRIPE_SECRET_KEY=sk_test_dev_placeholder
export STRIPE_WEBHOOK_SECRET=whsec_dev_placeholder
export PAYPAL_CLIENT_ID=dev_placeholder
npm run start:dev > /tmp/payment.log 2>&1 &
sleep 3

# 3. User Management (Port 3002)
echo -e "${YELLOW}Starting User Management on port 3002...${NC}"
cd /Users/srijan/ai-finance-agency/services/user-management
export PORT=3002
export DB_HOST=$DATABASE_HOST
export DB_PORT=$DATABASE_PORT
export DB_USERNAME=$DATABASE_USER
export DB_PASSWORD=$DATABASE_PASSWORD
export DB_NAME=ai_finance_db
npm run start:dev > /tmp/user-management.log 2>&1 &
sleep 3

# 4. Signals Service (Port 3003)
echo -e "${YELLOW}Starting Signals Service on port 3003...${NC}"
cd /Users/srijan/ai-finance-agency/services/signals
export PORT=3003
export DATABASE_NAME=ai_finance_db
export DATABASE_SYNCHRONIZE=true
export ALPHA_VANTAGE_API_KEY=demo
export FINNHUB_API_KEY=demo
export POLYGON_API_KEY=demo
npm run start:dev > /tmp/signals.log 2>&1 &
sleep 3

# 5. Trading Service (Port 3004)
echo -e "${YELLOW}Starting Trading Service on port 3004...${NC}"
cd /Users/srijan/ai-finance-agency/services/trading
export PORT=3004
export DATABASE_NAME=ai_finance_db
npm run start:dev > /tmp/trading.log 2>&1 &
sleep 3

# 6. Education Service (Port 3005)
echo -e "${YELLOW}Starting Education Service on port 3005...${NC}"
cd /Users/srijan/ai-finance-agency/services/education
export PORT=3005
export DATABASE_NAME=ai_finance_db
npm run start:dev > /tmp/education.log 2>&1 &
sleep 3

# 7. Notification Service (Port 3006)
echo -e "${YELLOW}Starting Notification Service on port 3006...${NC}"
cd /Users/srijan/ai-finance-agency/services/notification
export PORT=3006
export DATABASE_NAME=ai_finance_db
npm run start:dev > /tmp/notification.log 2>&1 &
sleep 3

# 8. Risk Management (Port 3007)
echo -e "${YELLOW}Starting Risk Management on port 3007...${NC}"
cd /Users/srijan/ai-finance-agency/services/risk-management
export PORT=3007
export GRPC_PORT=5007
export DB_HOST=$DATABASE_HOST
export DB_PORT=$DATABASE_PORT
export DB_USERNAME=$DATABASE_USER
export DB_PASSWORD=$DATABASE_PASSWORD
export DB_NAME=risk_management
npm run start:dev > /tmp/risk-management.log 2>&1 &
sleep 3

# 9. Market Data (Port 3008)
echo -e "${YELLOW}Starting Market Data Service on port 3008...${NC}"
cd /Users/srijan/ai-finance-agency/services/market-data
export PORT=3008
export DATABASE_NAME=ai_finance_db
npm run start:dev > /tmp/market-data.log 2>&1 &
sleep 3

# 10. Content Intelligence (Port 3009)
echo -e "${YELLOW}Starting Content Intelligence on port 3009...${NC}"
cd /Users/srijan/ai-finance-agency/services/content-intelligence
export PORT=3009
export DATABASE_NAME=ai_finance_db
npm run start:dev > /tmp/content-intelligence.log 2>&1 &
sleep 3

# Wait for services to start
echo -e "\n${GREEN}⏳ Waiting for services to initialize...${NC}"
sleep 10

# Check service status
echo -e "\n${GREEN}📊 Service Status Check:${NC}"
echo "------------------------"

services=(
    "3000:API Gateway"
    "3001:Payment Service"
    "3002:User Management"
    "3003:Signals Service"
    "3004:Trading Service"
    "3005:Education Service"
    "3006:Notification Service"
    "3007:Risk Management"
    "3008:Market Data"
    "3009:Content Intelligence"
)

running=0
total=${#services[@]}

for service in "${services[@]}"; do
    IFS=':' read -r port name <<< "$service"
    if check_port $port; then
        echo -e "✅ ${name} is running on port ${port}"
        ((running++))
    else
        echo -e "❌ ${name} failed to start on port ${port}"
        echo -e "   Check log: /tmp/$(echo $name | tr '[:upper:]' '[:lower:]' | tr ' ' '-').log"
    fi
done

echo -e "\n${GREEN}📈 Summary:${NC}"
echo "----------"
echo -e "Services Running: ${running}/${total}"

if [ $running -eq $total ]; then
    echo -e "\n${GREEN}🎉 All services started successfully!${NC}"
    echo -e "\n📋 API Documentation URLs:"
    echo "  - API Gateway: http://localhost:3000/docs"
    echo "  - Payment: http://localhost:3001/docs"
    echo "  - User Management: http://localhost:3002/docs"
    echo "  - Signals: http://localhost:3003/docs"
    echo "  - Trading: http://localhost:3004/docs"
    echo "  - Education: http://localhost:3005/docs"
    echo "  - Notification: http://localhost:3006/docs"
    echo "  - Risk Management: http://localhost:3007/docs"
    echo "  - Market Data: http://localhost:3008/docs"
    echo "  - Content Intelligence: http://localhost:3009/docs"
else
    echo -e "\n${YELLOW}⚠️ Some services failed to start. Check the logs for details.${NC}"
fi

echo -e "\n${GREEN}💡 Tips:${NC}"
echo "  - View logs: tail -f /tmp/<service-name>.log"
echo "  - Stop all: pkill -f 'nest start'"
echo "  - Monitor: ./monitoring/real-time-monitor.sh"