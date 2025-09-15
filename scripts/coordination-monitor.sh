#!/bin/bash

# Multi-Agent Coordination Monitor
# Real-time status tracking for B-MAD deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Clear screen and show header
clear
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                    🎉 B-MAD PARTY COORDINATION MONITOR 🎉                    ║${NC}"
echo -e "${PURPLE}║                        AI Finance Agency Deployment                          ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check service health
check_service_health() {
    local service=$1
    local port=$2
    local url="http://localhost:$port/health"
    
    if curl -f "$url" >/dev/null 2>&1; then
        echo -e "${GREEN}●${NC}"
    else
        echo -e "${RED}●${NC}"
    fi
}

# Function to check container status
check_container_status() {
    local container=$1
    local status=$(docker ps --filter "name=$container" --format "{{.Status}}" 2>/dev/null | head -1)
    
    if [[ $status == *"healthy"* ]] || [[ $status == *"Up"* ]]; then
        echo -e "${GREEN}●${NC}"
    elif [[ -n $status ]]; then
        echo -e "${YELLOW}●${NC}"
    else
        echo -e "${RED}●${NC}"
    fi
}

# Function to get service response time
get_response_time() {
    local port=$1
    local url="http://localhost:$port/health"
    
    local response_time=$(curl -o /dev/null -s -w "%{time_total}" "$url" 2>/dev/null || echo "0")
    local response_time_ms=$(echo "$response_time * 1000" | bc 2>/dev/null || echo "0")
    echo "${response_time_ms%.*}ms"
}

# Main monitoring loop
monitor_deployment() {
    while true; do
        clear
        echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${PURPLE}║                    🎉 B-MAD PARTY COORDINATION MONITOR 🎉                    ║${NC}"
        echo -e "${PURPLE}║                        AI Finance Agency Deployment                          ║${NC}"
        echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        
        echo -e "${CYAN}📊 REAL-TIME SERVICE STATUS${NC} - $(date '+%Y-%m-%d %H:%M:%S')"
        echo "─────────────────────────────────────────────────────────────────────────────────"
        echo ""
        
        # Infrastructure Services
        echo -e "${BLUE}🏗️  INFRASTRUCTURE SERVICES${NC}"
        echo "─────────────────────────────"
        printf "%-20s %-10s %-15s\n" "Service" "Status" "Container"
        echo "─────────────────────────────────────────────"
        
        # PostgreSQL
        pg_status=$(check_container_status "ai_finance_postgres")
        printf "%-20s %-10s %-15s\n" "PostgreSQL" "$pg_status" "$(docker ps --filter 'name=ai_finance_postgres' --format '{{.Status}}' 2>/dev/null | cut -d' ' -f1-2 || echo 'stopped')"
        
        # Redis
        redis_status=$(check_container_status "ai_finance_redis")
        printf "%-20s %-10s %-15s\n" "Redis" "$redis_status" "$(docker ps --filter 'name=ai_finance_redis' --format '{{.Status}}' 2>/dev/null | cut -d' ' -f1-2 || echo 'stopped')"
        
        # RabbitMQ
        rabbitmq_status=$(check_container_status "ai_finance_rabbitmq")
        printf "%-20s %-10s %-15s\n" "RabbitMQ" "$rabbitmq_status" "$(docker ps --filter 'name=ai_finance_rabbitmq' --format '{{.Status}}' 2>/dev/null | cut -d' ' -f1-2 || echo 'stopped')"
        
        # MongoDB
        mongo_status=$(check_container_status "ai_finance_mongodb")
        printf "%-20s %-10s %-15s\n" "MongoDB" "$mongo_status" "$(docker ps --filter 'name=ai_finance_mongodb' --format '{{.Status}}' 2>/dev/null | cut -d' ' -f1-2 || echo 'stopped')"
        
        echo ""
        
        # Microservices
        echo -e "${BLUE}🚀 MICROSERVICES STATUS${NC}"
        echo "───────────────────────────"
        printf "%-25s %-10s %-10s %-15s\n" "Service" "Health" "Port" "Response Time"
        echo "─────────────────────────────────────────────────────────────────"
        
        # Service array with ports
        declare -A services=(
            ["api-gateway"]="3000"
            ["user-management"]="3002"
            ["payment"]="3001"
            ["trading"]="3004"
            ["signals"]="3003"
            ["market-data"]="3008"
            ["risk-management"]="3007"
            ["education"]="3005"
            ["notification"]="3006"
            ["content-intelligence"]="3009"
        )
        
        for service in "${!services[@]}"; do
            port=${services[$service]}
            health_status=$(check_service_health "$service" "$port")
            response_time=$(get_response_time "$port")
            printf "%-25s %-10s %-10s %-15s\n" "$service" "$health_status" "$port" "$response_time"
        done
        
        echo ""
        
        # System Statistics
        echo -e "${BLUE}📈 SYSTEM METRICS${NC}"
        echo "─────────────────"
        
        # Docker stats
        running_containers=$(docker ps --format "table {{.Names}}" | grep ai_finance | wc -l)
        total_containers=$(docker ps -a --format "table {{.Names}}" | grep ai_finance | wc -l)
        
        echo "Active Containers: $running_containers/$total_containers"
        
        # Memory usage
        if command -v free >/dev/null 2>&1; then
            memory_usage=$(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')
            echo "Memory Usage: $memory_usage"
        fi
        
        # Disk usage
        if command -v df >/dev/null 2>&1; then
            disk_usage=$(df -h . | awk 'NR==2{printf "%s", $5}')
            echo "Disk Usage: $disk_usage"
        fi
        
        echo ""
        
        # Service URLs
        echo -e "${BLUE}🔗 ACCESS POINTS${NC}"
        echo "───────────────"
        echo "• API Gateway:     http://localhost:3000"
        echo "• Trading API:     http://localhost:3004"
        echo "• Payment API:     http://localhost:3001"
        echo "• Market Data:     http://localhost:3008"
        echo "• Grafana:         http://localhost:3001"
        echo "• Prometheus:      http://localhost:9090"
        echo "• RabbitMQ:        http://localhost:15672"
        
        echo ""
        echo -e "${YELLOW}Press Ctrl+C to exit monitoring${NC}"
        echo "─────────────────────────────────────────────────────────────────────────────────"
        
        # Wait 5 seconds before refresh
        sleep 5
    done
}

# Start monitoring
monitor_deployment