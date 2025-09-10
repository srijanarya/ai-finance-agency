#!/bin/bash

# wait-for-services.sh - Wait for services to be ready in CI/CD pipelines
# Usage: ./wait-for-services.sh [timeout_seconds]

set -e

TIMEOUT=${1:-300}  # Default 5 minutes
INTERVAL=5
ELAPSED=0

echo "⏳ Waiting for services to be ready (timeout: ${TIMEOUT}s)..."

# List of services to check
SERVICES=(
    "postgres-test:5432"
    "redis-test:6379" 
    "mongodb-test:27017"
    "api-gateway-test:3000"
)

# Function to check if service is ready
check_service() {
    local service=$1
    local host=$(echo $service | cut -d: -f1)
    local port=$(echo $service | cut -d: -f2)
    
    if command -v nc >/dev/null 2>&1; then
        nc -z $host $port >/dev/null 2>&1
    elif command -v telnet >/dev/null 2>&1; then
        timeout 1 telnet $host $port >/dev/null 2>&1
    else
        # Fallback using curl for HTTP services
        case $port in
            3000|3001|3002|3003|3004|3005|3006|3007|3008|3009)
                curl -sf http://$host:$port/health >/dev/null 2>&1
                ;;
            *)
                return 1
                ;;
        esac
    fi
}

# Check Docker Compose services
check_docker_services() {
    if command -v docker-compose >/dev/null 2>&1; then
        # Check if all services are running
        local unhealthy=$(docker-compose ps --services --filter "status=running" | wc -l)
        local total=$(docker-compose ps --services | wc -l)
        
        if [ "$unhealthy" -eq "$total" ]; then
            return 0
        else
            return 1
        fi
    fi
    return 1
}

# Main waiting loop
while [ $ELAPSED -lt $TIMEOUT ]; do
    ALL_READY=true
    
    # First check docker-compose services
    if check_docker_services; then
        echo "✅ All Docker Compose services are running"
    else
        echo "⏳ Waiting for Docker Compose services... (${ELAPSED}s/${TIMEOUT}s)"
        ALL_READY=false
    fi
    
    # Then check individual service connectivity
    for service in "${SERVICES[@]}"; do
        if check_service $service; then
            echo "✅ $service is ready"
        else
            echo "⏳ Waiting for $service... (${ELAPSED}s/${TIMEOUT}s)"
            ALL_READY=false
        fi
    done
    
    if [ "$ALL_READY" = true ]; then
        echo "🎉 All services are ready!"
        exit 0
    fi
    
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

echo "❌ Timeout reached. Some services may not be ready:"
for service in "${SERVICES[@]}"; do
    if ! check_service $service; then
        echo "  - $service: NOT READY"
    fi
done

exit 1