#!/bin/bash

# Build script for AI Finance Agency microservices
set -e

echo "🔨 Building microservice Docker images..."

# Build services without specific targets (use default runtime stage)
services=(
    "api-gateway"
    "user-management" 
    "payment"
    "trading"
    "signals"
    "market-data"
    "risk-management"
    "education"
    "notification"
    "content-intelligence"
)

for service in "${services[@]}"; do
    echo "Building $service..."
    
    # Check if Dockerfile exists
    if [ -f "services/$service/Dockerfile" ]; then
        docker build -t "ai-finance-$service:latest" \
            -f "services/$service/Dockerfile" \
            --target runtime \
            . 2>/dev/null || \
        docker build -t "ai-finance-$service:latest" \
            -f "services/$service/Dockerfile" \
            . || echo "⚠️  Failed to build $service"
    else
        echo "⚠️  No Dockerfile found for $service"
    fi
done

echo "✅ Build process completed"