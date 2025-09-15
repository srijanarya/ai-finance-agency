#!/bin/bash

# B-MAD Party Coordination Dashboard
# Central command center for deployment management

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Make scripts executable
chmod +x scripts/*.sh

# Main menu function
show_menu() {
    clear
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                    🎛️  B-MAD COORDINATION DASHBOARD 🎛️                     ║${NC}"
    echo -e "${PURPLE}║                        AI Finance Agency Platform                           ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${WHITE}📊 DEPLOYMENT STATUS${NC}"
    echo "─────────────────────"
    
    # Quick status check
    running_containers=$(docker ps --filter "name=ai_finance" --format "{{.Names}}" 2>/dev/null | wc -l)
    total_containers=$(docker ps -a --filter "name=ai_finance" --format "{{.Names}}" 2>/dev/null | wc -l)
    
    if [ $running_containers -gt 8 ]; then
        echo -e "System Status: ${GREEN}● OPERATIONAL${NC} ($running_containers/$total_containers containers)"
    elif [ $running_containers -gt 3 ]; then
        echo -e "System Status: ${YELLOW}● PARTIAL${NC} ($running_containers/$total_containers containers)"
    else
        echo -e "System Status: ${RED}● DOWN${NC} ($running_containers/$total_containers containers)"
    fi
    
    # Check key services
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        echo -e "API Gateway: ${GREEN}● HEALTHY${NC}"
    else
        echo -e "API Gateway: ${RED}● DOWN${NC}"
    fi
    
    if docker exec ai_finance_postgres pg_isready >/dev/null 2>&1; then
        echo -e "Database: ${GREEN}● CONNECTED${NC}"
    else
        echo -e "Database: ${RED}● DISCONNECTED${NC}"
    fi
    
    echo ""
    echo -e "${WHITE}🎮 COORDINATION COMMANDS${NC}"
    echo "──────────────────────────"
    echo -e "${CYAN}1.${NC} 🚀 Full B-MAD Deployment"
    echo -e "${CYAN}2.${NC} 🏗️  Infrastructure Only"
    echo -e "${CYAN}3.${NC} 🔧 Microservices Only"
    echo -e "${CYAN}4.${NC} 📊 Real-time Monitor"
    echo -e "${CYAN}5.${NC} ✅ Validate Deployment"
    echo -e "${CYAN}6.${NC} 🔍 Service Logs"
    echo -e "${CYAN}7.${NC} 🔄 Restart Services"
    echo -e "${CYAN}8.${NC} 🛑 Stop All Services"
    echo -e "${CYAN}9.${NC} 📈 Performance Report"
    echo -e "${CYAN}0.${NC} ❌ Exit Dashboard"
    echo ""
    echo -e "${WHITE}🔗 Quick Access URLs${NC}"
    echo "────────────────────"
    echo "• API Gateway:  http://localhost:3000"
    echo "• Grafana:      http://localhost:3001"
    echo "• Prometheus:   http://localhost:9090"
    echo "• RabbitMQ:     http://localhost:15672"
    echo ""
}

# Execute deployment
full_deployment() {
    echo -e "${PURPLE}🎉 Starting Full B-MAD Deployment...${NC}"
    echo "══════════════════════════════════════"
    
    if [ -f "scripts/bmad-deployment.sh" ]; then
        ./scripts/bmad-deployment.sh
    else
        echo -e "${RED}❌ Deployment script not found!${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${GREEN}✅ Deployment completed! Press any key to continue...${NC}"
    read -n 1
}

# Infrastructure only
infrastructure_only() {
    echo -e "${BLUE}🏗️  Starting Infrastructure Services...${NC}"
    echo "═══════════════════════════════════════════"
    
    docker-compose --profile infrastructure up -d
    
    echo ""
    echo -e "${GREEN}✅ Infrastructure started! Press any key to continue...${NC}"
    read -n 1
}

# Microservices only
microservices_only() {
    echo -e "${BLUE}🚀 Starting Microservices...${NC}"
    echo "══════════════════════════════════"
    
    docker-compose --profile microservices up -d
    
    echo ""
    echo -e "${GREEN}✅ Microservices started! Press any key to continue...${NC}"
    read -n 1
}

# Real-time monitoring
start_monitoring() {
    if [ -f "scripts/coordination-monitor.sh" ]; then
        ./scripts/coordination-monitor.sh
    else
        echo -e "${RED}❌ Monitoring script not found!${NC}"
        echo "Press any key to continue..."
        read -n 1
    fi
}

# Validate deployment
validate_deployment() {
    echo -e "${BLUE}🔍 Running Deployment Validation...${NC}"
    echo "═══════════════════════════════════════"
    
    if [ -f "scripts/validate-coordination.sh" ]; then
        ./scripts/validate-coordination.sh
    else
        echo -e "${RED}❌ Validation script not found!${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Validation completed! Press any key to continue...${NC}"
    read -n 1
}

# View service logs
view_logs() {
    echo -e "${BLUE}📝 Service Logs Menu${NC}"
    echo "═══════════════════════"
    echo ""
    echo "Select a service to view logs:"
    echo "1. API Gateway"
    echo "2. User Management"
    echo "3. Trading Service"
    echo "4. Market Data"
    echo "5. Payment Service"
    echo "6. All Services"
    echo "7. Infrastructure"
    echo "0. Back to main menu"
    echo ""
    echo -n "Enter choice: "
    read log_choice
    
    case $log_choice in
        1) docker-compose logs -f api-gateway ;;
        2) docker-compose logs -f user-management ;;
        3) docker-compose logs -f trading ;;
        4) docker-compose logs -f market-data ;;
        5) docker-compose logs -f payment ;;
        6) docker-compose logs -f ;;
        7) docker-compose logs -f postgres redis rabbitmq mongodb ;;
        0) return ;;
        *) echo "Invalid choice" ;;
    esac
}

# Restart services
restart_services() {
    echo -e "${YELLOW}🔄 Service Restart Menu${NC}"
    echo "═══════════════════════════"
    echo ""
    echo "Select restart option:"
    echo "1. Restart all services"
    echo "2. Restart infrastructure"
    echo "3. Restart microservices"
    echo "4. Restart specific service"
    echo "0. Back to main menu"
    echo ""
    echo -n "Enter choice: "
    read restart_choice
    
    case $restart_choice in
        1) 
            echo "Restarting all services..."
            docker-compose restart
            ;;
        2) 
            echo "Restarting infrastructure..."
            docker-compose restart postgres redis rabbitmq mongodb
            ;;
        3) 
            echo "Restarting microservices..."
            docker-compose restart api-gateway user-management trading payment signals market-data risk-management education notification content-intelligence
            ;;
        4) 
            echo -n "Enter service name: "
            read service_name
            docker-compose restart $service_name
            ;;
        0) return ;;
        *) echo "Invalid choice" ;;
    esac
    
    echo ""
    echo -e "${GREEN}✅ Restart completed! Press any key to continue...${NC}"
    read -n 1
}

# Stop all services
stop_services() {
    echo -e "${RED}🛑 Stopping All Services...${NC}"
    echo "═══════════════════════════════"
    echo ""
    echo -e "${YELLOW}⚠️  This will stop all AI Finance Agency services!${NC}"
    echo -n "Are you sure? (y/N): "
    read confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        docker-compose down
        echo -e "${GREEN}✅ All services stopped!${NC}"
    else
        echo "Operation cancelled."
    fi
    
    echo ""
    echo "Press any key to continue..."
    read -n 1
}

# Performance report
performance_report() {
    echo -e "${BLUE}📈 Performance Report${NC}"
    echo "═══════════════════════"
    echo ""
    
    echo "🔍 Container Resource Usage:"
    echo "──────────────────────────────"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | grep ai_finance
    
    echo ""
    echo "🌐 Service Response Times:"
    echo "─────────────────────────"
    
    services=(
        "api-gateway:3000"
        "user-management:3002"
        "trading:3004"
        "market-data:3008"
        "payment:3001"
    )
    
    for service_port in "${services[@]}"; do
        service=$(echo $service_port | cut -d: -f1)
        port=$(echo $service_port | cut -d: -f2)
        
        response_time=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:$port/health 2>/dev/null || echo "N/A")
        printf "%-20s %s\n" "$service:" "${response_time}s"
    done
    
    echo ""
    echo "💾 Database Connections:"
    echo "───────────────────────"
    
    if docker exec ai_finance_postgres pg_stat_activity -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null; then
        echo "PostgreSQL: Connected"
    else
        echo "PostgreSQL: Disconnected"
    fi
    
    if docker exec ai_finance_redis redis-cli info clients 2>/dev/null | grep connected_clients; then
        echo "Redis: Connected"
    else
        echo "Redis: Disconnected"
    fi
    
    echo ""
    echo "Press any key to continue..."
    read -n 1
}

# Main loop
main() {
    while true; do
        show_menu
        echo -n "Enter your choice (0-9): "
        read choice
        
        case $choice in
            1) full_deployment ;;
            2) infrastructure_only ;;
            3) microservices_only ;;
            4) start_monitoring ;;
            5) validate_deployment ;;
            6) view_logs ;;
            7) restart_services ;;
            8) stop_services ;;
            9) performance_report ;;
            0) 
                echo -e "${GREEN}👋 Goodbye! B-MAD coordination complete.${NC}"
                exit 0
                ;;
            *) 
                echo -e "${RED}❌ Invalid choice. Please try again.${NC}"
                echo "Press any key to continue..."
                read -n 1
                ;;
        esac
    done
}

# Welcome message
echo -e "${PURPLE}🎉 Welcome to B-MAD Coordination Dashboard! 🎉${NC}"
echo ""
echo "Initializing dashboard..."
sleep 2

# Start main loop
main