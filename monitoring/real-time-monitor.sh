#!/usr/bin/env bash

# 🚀 AI Finance Agency - Real-Time Service Monitor
# Performance Monitor - Party Mode Dashboard

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Service definitions (using arrays for macOS compatibility)
SERVICE_NAMES=("user-management" "payment" "market-data" "signals" "risk-management")
SERVICE_PORTS=("3000" "3001" "3002" "3003" "3007")

# Infrastructure services
INFRA_NAMES=("PostgreSQL" "MongoDB" "Redis" "RabbitMQ")
INFRA_PORTS=("5432" "27017" "6379" "5672")

clear
echo -e "${PURPLE}🚀 AI FINANCE AGENCY - REAL-TIME MONITORING DASHBOARD${NC}"
echo -e "${CYAN}Performance Monitor - Party Mode Active${NC}"
echo "=================================================="

# Function to check port
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        return 0  # Port is listening
    else
        return 1  # Port is not listening
    fi
}

# Function to check HTTP health
check_http_health() {
    local port=$1
    local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health --connect-timeout 2 2>/dev/null)
    if [[ "$response" == "200" ]]; then
        return 0  # Healthy
    else
        return 1  # Unhealthy
    fi
}

# Monitor loop
while true; do
    echo -e "\n${BLUE}📊 Infrastructure Status - $(date '+%H:%M:%S')${NC}"
    echo "----------------------------------------"
    
    infra_healthy=0
    infra_total=${#INFRA_NAMES[@]}
    
    for i in $(seq 0 $((infra_total - 1))); do
        service=${INFRA_NAMES[$i]}
        port=${INFRA_PORTS[$i]}
        
        if check_port $port; then
            echo -e "${GREEN}✅ $service${NC} (Port $port) - ${GREEN}HEALTHY${NC}"
            infra_healthy=$((infra_healthy + 1))
        else
            echo -e "${RED}❌ $service${NC} (Port $port) - ${RED}DOWN${NC}"
        fi
    done
    
    echo -e "\n${BLUE}🎯 Microservices Status${NC}"
    echo "----------------------------------------"
    
    services_healthy=0
    services_total=${#SERVICE_NAMES[@]}
    
    for i in $(seq 0 $((services_total - 1))); do
        service=${SERVICE_NAMES[$i]}
        port=${SERVICE_PORTS[$i]}
        
        echo -n -e "${CYAN}$service${NC} (Port $port): "
        
        if check_port $port; then
            if check_http_health $port; then
                echo -e "${GREEN}🟢 HEALTHY${NC} - Responding"
                services_healthy=$((services_healthy + 1))
            else
                echo -e "${YELLOW}🟡 PARTIAL${NC} - Port open, no HTTP health"
            fi
        else
            echo -e "${RED}🔴 DOWN${NC} - Not listening"
        fi
    done
    
    # Node.js processes count
    node_processes=$(ps aux | grep "nest start" | grep -v grep | wc -l | tr -d ' ')
    
    echo -e "\n${BLUE}📈 System Metrics${NC}"
    echo "----------------------------------------"
    echo -e "Infrastructure Health: ${GREEN}$infra_healthy${NC}/${CYAN}$infra_total${NC}"
    echo -e "Services Health: ${GREEN}$services_healthy${NC}/${CYAN}$services_total${NC}"
    echo -e "Active Node Processes: ${YELLOW}$node_processes${NC}"
    
    # Overall system health
    if [[ $infra_healthy -eq $infra_total ]] && [[ $services_healthy -gt 0 ]]; then
        echo -e "Overall Status: ${GREEN}🚀 OPERATIONAL${NC}"
    elif [[ $infra_healthy -eq $infra_total ]]; then
        echo -e "Overall Status: ${YELLOW}⚠️ SERVICES STARTING${NC}"
    else
        echo -e "Overall Status: ${RED}🚨 INFRASTRUCTURE ISSUES${NC}"
    fi
    
    echo -e "\n${PURPLE}Press Ctrl+C to stop monitoring...${NC}"
    echo "=================================================="
    
    sleep 10
    clear
done