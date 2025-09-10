#!/bin/bash

# AI Finance Agency - Start Monitoring Stack
# Production-ready monitoring with Prometheus, Grafana, and AlertManager

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MONITORING_DIR="$PROJECT_ROOT/monitoring"

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${PURPLE}[INFO]${NC} $1"
}

# Print banner
print_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║              AI Finance Agency - Monitoring Stack            ║"
    echo "║                                                              ║"
    echo "║  🔍 Prometheus - Metrics Collection                          ║"
    echo "║  📊 Grafana - Visualization & Dashboards                    ║"
    echo "║  🚨 AlertManager - Alert Management                         ║"
    echo "║  📈 Business Metrics - Revenue & KPI Tracking               ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null; then
        error "docker-compose is not installed. Please install docker-compose and try again."
        exit 1
    fi
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_ROOT/docker-compose.yml" ]]; then
        error "Please run this script from the AI Finance Agency project root"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Create required directories
setup_directories() {
    log "Setting up monitoring directories..."
    
    # Create data directories with proper permissions
    sudo mkdir -p "$MONITORING_DIR/data"/{prometheus,grafana,alertmanager}
    
    # Set ownership for Grafana (UID 472)
    sudo chown -R 472:472 "$MONITORING_DIR/data/grafana" 2>/dev/null || {
        warning "Could not set Grafana directory ownership. You may need to run with sudo."
    }
    
    # Set ownership for Prometheus (UID 65534)
    sudo chown -R 65534:65534 "$MONITORING_DIR/data/prometheus" 2>/dev/null || {
        warning "Could not set Prometheus directory ownership. You may need to run with sudo."
    }
    
    # Set ownership for AlertManager (UID 65534)
    sudo chown -R 65534:65534 "$MONITORING_DIR/data/alertmanager" 2>/dev/null || {
        warning "Could not set AlertManager directory ownership. You may need to run with sudo."
    }
    
    success "Monitoring directories created"
}

# Check configuration files
check_config() {
    log "Checking configuration files..."
    
    local required_files=(
        "$MONITORING_DIR/prometheus/prometheus.yml"
        "$MONITORING_DIR/prometheus/alert.rules.yml"
        "$MONITORING_DIR/alertmanager/alertmanager.yml"
        "$MONITORING_DIR/grafana/provisioning/datasources/prometheus.yml"
        "$MONITORING_DIR/grafana/provisioning/dashboards/dashboards.yml"
        "$MONITORING_DIR/docker-compose.monitoring.yml"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            error "Required configuration file not found: $file"
            exit 1
        fi
    done
    
    success "Configuration files validated"
}

# Create external network if it doesn't exist
setup_network() {
    log "Setting up Docker networks..."
    
    # Check if ai_finance_network exists
    if ! docker network ls | grep -q ai_finance_network; then
        log "Creating ai_finance_network..."
        docker network create ai_finance_network --driver bridge
    fi
    
    success "Docker networks ready"
}

# Start monitoring stack
start_monitoring() {
    log "Starting monitoring stack..."
    
    cd "$MONITORING_DIR"
    
    # Pull latest images
    log "Pulling latest Docker images..."
    docker-compose -f docker-compose.monitoring.yml pull --quiet
    
    # Start services
    log "Starting monitoring services..."
    docker-compose -f docker-compose.monitoring.yml up -d
    
    cd "$PROJECT_ROOT"
    
    success "Monitoring stack started"
}

# Wait for services to be ready
wait_for_services() {
    log "Waiting for services to be ready..."
    
    local services=(
        "http://localhost:9090/-/ready:Prometheus"
        "http://localhost:3001/api/health:Grafana"
        "http://localhost:9093/-/ready:AlertManager"
    )
    
    for service_info in "${services[@]}"; do
        IFS=':' read -r url name <<< "$service_info"
        
        log "Waiting for $name to be ready..."
        local max_attempts=30
        local attempt=1
        
        while [[ $attempt -le $max_attempts ]]; do
            if curl -f -s "$url" &> /dev/null; then
                success "$name is ready"
                break
            fi
            
            if [[ $attempt -eq $max_attempts ]]; then
                warning "$name is not responding after $max_attempts attempts"
                break
            fi
            
            sleep 2
            ((attempt++))
        done
    done
}

# Display service information
show_service_info() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    Monitoring Stack Ready!                  ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    info "Service URLs:"
    echo "  🔍 Prometheus:   http://localhost:9090"
    echo "  📊 Grafana:      http://localhost:3001"
    echo "     └─ Username:  admin"
    echo "     └─ Password:  admin123"
    echo "  🚨 AlertManager: http://localhost:9093"
    echo "  📊 cAdvisor:     http://localhost:8080"
    echo ""
    
    info "Available Dashboards:"
    echo "  • Infrastructure Overview"
    echo "  • API Gateway Dashboard"
    echo "  • Trading Service Dashboard"
    echo "  • Payment Service Dashboard"
    echo "  • Business Metrics Dashboard"
    echo ""
    
    info "Key Metrics Being Collected:"
    echo "  • Service health and uptime"
    echo "  • Request rates and response times"
    echo "  • Error rates and status codes"
    echo "  • Resource usage (CPU, memory, disk)"
    echo "  • Database performance"
    echo "  • Business metrics (revenue, trades, subscriptions)"
    echo ""
    
    info "Alert Channels:"
    echo "  • Email notifications"
    echo "  • Slack integration (configure webhook)"
    echo "  • Critical service alerts"
    echo "  • Business impact alerts"
    echo ""
    
    warning "Next Steps:"
    echo "  1. Configure email settings in monitoring/alertmanager/alertmanager.yml"
    echo "  2. Set up Slack webhook for alerts"
    echo "  3. Add monitoring middleware to your services"
    echo "  4. Customize dashboards as needed"
    echo ""
}

# Check service status
check_status() {
    log "Checking service status..."
    
    cd "$MONITORING_DIR"
    docker-compose -f docker-compose.monitoring.yml ps
    cd "$PROJECT_ROOT"
}

# Stop monitoring stack
stop_monitoring() {
    log "Stopping monitoring stack..."
    
    cd "$MONITORING_DIR"
    docker-compose -f docker-compose.monitoring.yml down
    cd "$PROJECT_ROOT"
    
    success "Monitoring stack stopped"
}

# Show logs
show_logs() {
    local service=${1:-}
    
    cd "$MONITORING_DIR"
    
    if [[ -n "$service" ]]; then
        docker-compose -f docker-compose.monitoring.yml logs -f "$service"
    else
        docker-compose -f docker-compose.monitoring.yml logs -f
    fi
    
    cd "$PROJECT_ROOT"
}

# Main function
main() {
    case "${1:-start}" in
        start)
            print_banner
            check_prerequisites
            setup_directories
            check_config
            setup_network
            start_monitoring
            wait_for_services
            show_service_info
            ;;
        stop)
            stop_monitoring
            ;;
        restart)
            stop_monitoring
            sleep 5
            main start
            ;;
        status)
            check_status
            ;;
        logs)
            show_logs "${2:-}"
            ;;
        *)
            echo "Usage: $0 {start|stop|restart|status|logs [service]}"
            echo ""
            echo "Commands:"
            echo "  start    - Start the monitoring stack"
            echo "  stop     - Stop the monitoring stack"
            echo "  restart  - Restart the monitoring stack"
            echo "  status   - Show service status"
            echo "  logs     - Show logs (optionally for specific service)"
            echo ""
            echo "Examples:"
            echo "  $0 start"
            echo "  $0 logs prometheus"
            echo "  $0 status"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"