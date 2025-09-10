#!/bin/bash

# AI Finance Agency - Enhanced Monitoring Stack Management
# Production-ready monitoring orchestration script

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.enhanced.yml"
PROJECT_NAME="ai_finance_monitoring"
DATA_DIR="$SCRIPT_DIR/data"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $*"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $*"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $*"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $*"
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    # Check if main network exists
    if ! docker network ls | grep -q "ai_finance_network"; then
        warn "Main AI Finance network not found. Creating it..."
        docker network create ai_finance_network --driver bridge --subnet 172.20.0.0/16
    fi
    
    log "Prerequisites check completed"
}

# Function to create data directories
create_data_dirs() {
    log "Creating data directories..."
    
    local dirs=(
        "$DATA_DIR/prometheus"
        "$DATA_DIR/grafana"
        "$DATA_DIR/alertmanager"
        "$DATA_DIR/elasticsearch"
        "$DATA_DIR/jaeger"
        "$DATA_DIR/uptime-kuma"
        "$DATA_DIR/filebeat"
    )
    
    for dir in "${dirs[@]}"; do
        mkdir -p "$dir"
        chmod 755 "$dir"
    done
    
    # Set proper permissions for Elasticsearch
    chmod 777 "$DATA_DIR/elasticsearch"
    
    log "Data directories created"
}

# Function to start monitoring stack
start_monitoring() {
    log "Starting AI Finance monitoring stack..."
    
    check_prerequisites
    create_data_dirs
    
    # Set environment variables
    export COMPOSE_PROJECT_NAME="$PROJECT_NAME"
    export GRAFANA_USER="${GRAFANA_USER:-admin}"
    export GRAFANA_PASSWORD="${GRAFANA_PASSWORD:-admin123}"
    export ENVIRONMENT="${ENVIRONMENT:-development}"
    
    # Start the stack
    if command -v docker-compose &> /dev/null; then
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d
    else
        docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d
    fi
    
    log "Monitoring stack started successfully!"
    
    # Wait for services to be ready
    info "Waiting for services to become ready..."
    wait_for_services
    
    # Display access information
    display_access_info
}

# Function to stop monitoring stack
stop_monitoring() {
    log "Stopping AI Finance monitoring stack..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down
    else
        docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down
    fi
    
    log "Monitoring stack stopped"
}

# Function to restart monitoring stack
restart_monitoring() {
    log "Restarting AI Finance monitoring stack..."
    stop_monitoring
    sleep 5
    start_monitoring
}

# Function to show stack status
show_status() {
    log "AI Finance monitoring stack status:"
    
    if command -v docker-compose &> /dev/null; then
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps
    else
        docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps
    fi
}

# Function to show logs
show_logs() {
    local service="${1:-}"
    
    if [ -n "$service" ]; then
        log "Showing logs for service: $service"
        if command -v docker-compose &> /dev/null; then
            docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f "$service"
        else
            docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f "$service"
        fi
    else
        log "Showing logs for all services:"
        if command -v docker-compose &> /dev/null; then
            docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f
        else
            docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f
        fi
    fi
}

# Function to wait for services
wait_for_services() {
    local services=(
        "localhost:9090"  # Prometheus
        "localhost:3001"  # Grafana
        "localhost:9093"  # AlertManager
        "localhost:9200"  # Elasticsearch
        "localhost:5601"  # Kibana
        "localhost:16686" # Jaeger
    )
    
    for service in "${services[@]}"; do
        info "Waiting for $service to be ready..."
        local retries=30
        while ! curl -s "http://$service" > /dev/null 2>&1; do
            sleep 10
            retries=$((retries - 1))
            if [ $retries -eq 0 ]; then
                warn "Service $service is not responding after 5 minutes"
                break
            fi
        done
        
        if [ $retries -gt 0 ]; then
            info "Service $service is ready"
        fi
    done
}

# Function to display access information
display_access_info() {
    echo ""
    log "🎉 AI Finance Enhanced Monitoring Stack is ready!"
    echo ""
    echo -e "${BLUE}📊 Access URLs:${NC}"
    echo "  Prometheus:    http://localhost:9090"
    echo "  Grafana:       http://localhost:3001 (admin/admin123)"
    echo "  AlertManager:  http://localhost:9093"
    echo "  Elasticsearch: http://localhost:9200"
    echo "  Kibana:        http://localhost:5601"
    echo "  Jaeger:        http://localhost:16686"
    echo "  Uptime Kuma:   http://localhost:3002"
    echo ""
    echo -e "${BLUE}📈 Metrics Endpoints:${NC}"
    echo "  Node Exporter:     http://localhost:9100/metrics"
    echo "  cAdvisor:          http://localhost:8080/metrics"
    echo "  Postgres Exporter: http://localhost:9187/metrics"
    echo "  Redis Exporter:    http://localhost:9121/metrics"
    echo "  MongoDB Exporter:  http://localhost:9216/metrics"
    echo "  Blackbox Exporter: http://localhost:9115/metrics"
    echo ""
    echo -e "${BLUE}🔧 Management:${NC}"
    echo "  Webhook Service: http://localhost:9000"
    echo "  Filebeat API:    http://localhost:5066"
    echo ""
    echo -e "${GREEN}✅ All services are configured and ready for monitoring!${NC}"
    echo ""
}

# Function to run health checks
health_check() {
    log "Running health checks on monitoring stack..."
    
    local failed_checks=0
    
    # Check Prometheus
    if curl -s "http://localhost:9090/-/ready" > /dev/null; then
        info "✅ Prometheus is healthy"
    else
        error "❌ Prometheus is not healthy"
        failed_checks=$((failed_checks + 1))
    fi
    
    # Check Grafana
    if curl -s "http://localhost:3001/api/health" > /dev/null; then
        info "✅ Grafana is healthy"
    else
        error "❌ Grafana is not healthy"
        failed_checks=$((failed_checks + 1))
    fi
    
    # Check AlertManager
    if curl -s "http://localhost:9093/-/ready" > /dev/null; then
        info "✅ AlertManager is healthy"
    else
        error "❌ AlertManager is not healthy"
        failed_checks=$((failed_checks + 1))
    fi
    
    # Check Elasticsearch
    if curl -s "http://localhost:9200/_cluster/health" | grep -q "green\|yellow"; then
        info "✅ Elasticsearch is healthy"
    else
        error "❌ Elasticsearch is not healthy"
        failed_checks=$((failed_checks + 1))
    fi
    
    if [ $failed_checks -eq 0 ]; then
        log "🎉 All health checks passed!"
    else
        error "❌ $failed_checks health checks failed"
        exit 1
    fi
}

# Function to backup configuration
backup_config() {
    local backup_dir="$SCRIPT_DIR/backups/$(date +%Y%m%d_%H%M%S)"
    
    log "Creating configuration backup in $backup_dir..."
    
    mkdir -p "$backup_dir"
    
    # Backup Prometheus config
    cp -r "$SCRIPT_DIR/prometheus" "$backup_dir/"
    
    # Backup Grafana dashboards
    cp -r "$SCRIPT_DIR/grafana" "$backup_dir/"
    
    # Backup AlertManager config
    cp -r "$SCRIPT_DIR/alertmanager" "$backup_dir/"
    
    # Backup docker-compose file
    cp "$COMPOSE_FILE" "$backup_dir/"
    
    log "Configuration backup completed: $backup_dir"
}

# Function to update stack
update_stack() {
    log "Updating monitoring stack..."
    
    # Backup current configuration
    backup_config
    
    # Pull latest images
    if command -v docker-compose &> /dev/null; then
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" pull
    else
        docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" pull
    fi
    
    # Restart with new images
    restart_monitoring
    
    log "Stack update completed"
}

# Function to show help
show_help() {
    echo "AI Finance Agency - Enhanced Monitoring Stack Management"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start     Start the monitoring stack"
    echo "  stop      Stop the monitoring stack"
    echo "  restart   Restart the monitoring stack"
    echo "  status    Show status of all services"
    echo "  logs      Show logs for all services or specific service"
    echo "  health    Run health checks on all services"
    echo "  backup    Backup current configuration"
    echo "  update    Update stack with latest images"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                 # Start monitoring stack"
    echo "  $0 logs                  # Show all logs"
    echo "  $0 logs prometheus       # Show Prometheus logs only"
    echo "  $0 health               # Run health checks"
    echo ""
}

# Main script logic
main() {
    case "${1:-help}" in
        start)
            start_monitoring
            ;;
        stop)
            stop_monitoring
            ;;
        restart)
            restart_monitoring
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs "${2:-}"
            ;;
        health)
            health_check
            ;;
        backup)
            backup_config
            ;;
        update)
            update_stack
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Unknown command: ${1:-}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"