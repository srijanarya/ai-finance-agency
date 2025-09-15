#!/bin/bash

echo "🚀 Quick Docker Start for AI Finance Agency"
echo "==========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Starting Docker Desktop..."
    open -a Docker
    echo "⏳ Waiting 20 seconds for Docker to start..."
    sleep 20
fi

# Check again
if docker info > /dev/null 2>&1; then
    echo "✅ Docker is running!"
    echo ""
    
    # Start only essential services first
    echo "Starting PostgreSQL..."
    docker-compose up -d postgres
    sleep 5
    
    echo "Starting Redis..."
    docker-compose up -d redis
    sleep 3
    
    echo "Starting RabbitMQ..."
    docker-compose up -d rabbitmq
    sleep 5
    
    echo ""
    echo "🎯 Essential services started!"
    echo ""
    echo "Check status with: docker ps"
    echo "View logs with: docker logs <container-name>"
    echo ""
    echo "To start all services: docker-compose up -d"
else
    echo "❌ Docker failed to start. Please:"
    echo "1. Open Docker Desktop manually"
    echo "2. Wait for it to fully start"
    echo "3. Run this script again"
fi