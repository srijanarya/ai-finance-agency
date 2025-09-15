#!/bin/bash

# Start AI Finance Agency services locally
set -e

echo "🚀 Starting AI Finance Agency Services Locally..."

# Export common environment variables
export NODE_ENV=development
export DATABASE_HOST=localhost
export DATABASE_PORT=5432
export DATABASE_USER=ai_finance_user
export DATABASE_PASSWORD=securepassword123
export REDIS_HOST=localhost
export REDIS_PORT=6379
export RABBITMQ_HOST=localhost
export RABBITMQ_PORT=5672

# Function to start a service
start_service() {
    local service=$1
    local port=$2
    
    echo "Starting $service on port $port..."
    
    if [ -d "services/$service" ]; then
        cd "services/$service"
        
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            echo "Installing dependencies for $service..."
            npm install --silent
        fi
        
        # Set service-specific env vars
        export PORT=$port
        export SERVICE_NAME=$service
        
        # Start in background
        npm run start:dev > "../../logs/${service}.log" 2>&1 &
        echo "✅ $service started (PID: $!)"
        
        cd ../..
    else
        echo "⚠️  Service directory not found: $service"
    fi
}

# Create logs directory
mkdir -p logs

# Start services in order
start_service "user-management" 3002
sleep 2

start_service "market-data" 3008
sleep 2

start_service "api-gateway" 3000
sleep 2

start_service "payment" 3001
start_service "trading" 3004
start_service "signals" 3003
start_service "risk-management" 3007
start_service "education" 3006
start_service "notification" 3005

echo "✅ All services started!"
echo ""
echo "📊 Service URLs:"
echo "  API Gateway:     http://localhost:3000"
echo "  User Management: http://localhost:3002/health"
echo "  Payment:         http://localhost:3001/health"
echo "  Trading:         http://localhost:3004/health"
echo "  Signals:         http://localhost:3003/health"
echo ""
echo "📝 Logs available in ./logs/"
echo ""
echo "To stop all services, run: pkill -f 'npm run start:dev'"