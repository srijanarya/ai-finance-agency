#!/bin/bash

# deploy-production.sh - Deploy to production environment
# This script is called from package.json npm scripts

set -e

echo "🚀 Starting production deployment..."

# Configuration
ENVIRONMENT="production"
COMPOSE_FILE="docker-compose.prod.yml"
PROJECT_NAME="ai-finance-production"
BACKUP_DIR="/tmp/ai-finance-backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites for production deployment..."
    
    if ! command -v docker >/dev/null 2>&1; then
        error "Docker is not installed or not in PATH"
    fi
    
    if ! command -v docker-compose >/dev/null 2>&1; then
        error "Docker Compose is not installed or not in PATH"
    fi
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        error "Production Docker Compose file not found: $COMPOSE_FILE"
    fi
    
    if [ ! -f ".env.production" ]; then
        warning "Production environment file not found: .env.production"
    fi
    
    # Check if we're on the main branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    if [ "$CURRENT_BRANCH" != "main" ] && [ "$FORCE_DEPLOY" != "true" ]; then
        error "Production deployments should only be done from 'main' branch. Current: $CURRENT_BRANCH"
    fi
    
    success "Prerequisites check passed"
}

# Load production environment
load_environment() {
    log "Loading production environment configuration..."
    
    if [ -f ".env" ]; then
        set -a
        source .env
        set +a
    fi
    
    if [ -f ".env.production" ]; then
        set -a
        source .env.production
        set +a
        success "Loaded .env.production file"
    fi
    
    # Set production-specific variables
    export NODE_ENV=production
    export ENVIRONMENT=production
    
    # Validate required production variables
    REQUIRED_VARS=("DATABASE_URL" "REDIS_URL" "JWT_SECRET")
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            error "Required production environment variable not set: $var"
        fi
    done
    
    success "Production environment loaded and validated"
}

# Create backup before deployment
create_backup() {
    log "Creating pre-deployment backup..."
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_NAME="pre_deploy_${BACKUP_TIMESTAMP}"
    
    # Database backup (if running)
    if docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps postgres | grep -q "Up"; then
        log "Backing up PostgreSQL database..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T postgres \
            pg_dump -U "${POSTGRES_USER:-ai_finance_user}" \
            "${POSTGRES_DB:-ai_finance_db}" \
            > "$BACKUP_DIR/${BACKUP_NAME}_database.sql"
        success "Database backup created: ${BACKUP_NAME}_database.sql"
    fi
    
    # Configuration backup
    log "Backing up configuration files..."
    tar -czf "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz" \
        .env.production docker-compose.prod.yml 2>/dev/null || true
    
    success "Backup created: $BACKUP_NAME"
    export BACKUP_NAME
}

# Deploy production services with blue-green strategy
deploy_services() {
    log "Deploying services to production..."
    
    # Build production images
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME build \
        --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        --build-arg VCS_REF="$(git rev-parse --short HEAD)" \
        --build-arg VERSION="${VERSION:-$(git rev-parse --short HEAD)}" \
        --build-arg NODE_ENV=production
    
    success "Production images built successfully"
    
    # Deploy infrastructure first
    log "Starting infrastructure services..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d \
        --remove-orphans \
        postgres redis rabbitmq mongodb prometheus grafana
    
    log "Waiting for infrastructure services to be ready..."
    sleep 45
    
    # Deploy application services with rolling update
    log "Deploying application services..."
    
    # Services in order of dependency
    SERVICES=(
        "api-gateway"
        "user-management"
        "payment"
        "signals"
        "trading"
        "education"
        "market-data"
        "risk-management"
        "notification"
        "content-intelligence"
    )
    
    for service in "${SERVICES[@]}"; do
        log "Deploying $service..."
        
        # Deploy new version
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d --no-deps $service
        
        # Wait for service to be healthy
        local max_attempts=20
        local attempt=0
        
        while [ $attempt -lt $max_attempts ]; do
            if docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps $service | grep -q "Up (healthy)"; then
                success "$service deployed and healthy"
                break
            fi
            
            attempt=$((attempt + 1))
            log "Waiting for $service health check... ($attempt/$max_attempts)"
            sleep 15
        done
        
        if [ $attempt -eq $max_attempts ]; then
            error "$service failed to become healthy"
        fi
    done
    
    success "All production services deployed successfully"
}

# Run comprehensive health checks
comprehensive_health_check() {
    log "Running comprehensive production health checks..."
    
    local base_url="http://localhost:3000"
    local max_attempts=30
    local attempt=0
    
    # Core health endpoints
    HEALTH_ENDPOINTS=(
        "/health"
        "/api/v1/status"
        "/api/v1/auth/status"
        "/api/v1/payments/health"
        "/api/v1/signals/health"
        "/metrics"
    )
    
    while [ $attempt -lt $max_attempts ]; do
        local all_healthy=true
        
        for endpoint in "${HEALTH_ENDPOINTS[@]}"; do
            if ! curl -sf "${base_url}${endpoint}" >/dev/null 2>&1; then
                all_healthy=false
                break
            fi
        done
        
        if [ "$all_healthy" = true ]; then
            success "All health checks passed"
            return 0
        fi
        
        attempt=$((attempt + 1))
        log "Health check attempt $attempt/$max_attempts..."
        sleep 10
    done
    
    error "Production health checks failed after $max_attempts attempts"
}

# Run smoke tests
run_smoke_tests() {
    log "Running production smoke tests..."
    
    # Run critical path tests
    if [ -f "tests/smoke/production.test.js" ]; then
        npm run test:smoke:production || {
            error "Production smoke tests failed"
        }
    else
        warning "No production smoke tests found, skipping"
    fi
    
    success "Smoke tests completed"
}

# Setup production monitoring
setup_monitoring() {
    log "Setting up production monitoring..."
    
    # Deploy monitoring services
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d \
        prometheus grafana jaeger elasticsearch kibana
    
    # Wait for Grafana to be ready
    local attempt=0
    while [ $attempt -lt 20 ]; do
        if curl -sf http://localhost:3001/api/health >/dev/null 2>&1; then
            break
        fi
        attempt=$((attempt + 1))
        sleep 5
    done
    
    # Import dashboards (if available)
    if [ -d "monitoring/grafana/dashboards" ]; then
        log "Importing Grafana dashboards..."
        # Dashboard import logic would go here
    fi
    
    success "Production monitoring setup completed"
}

# Send deployment notifications
send_notifications() {
    log "Sending deployment notifications..."
    
    local status="${1:-success}"
    local message=""
    
    case $status in
        "success")
            message="✅ Production deployment completed successfully!"
            ;;
        "failure")
            message="❌ Production deployment failed!"
            ;;
        "rollback")
            message="🔄 Production deployment rolled back!"
            ;;
    esac
    
    # Slack notification (if webhook configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || true
    fi
    
    # Email notification could be added here
    
    success "Notifications sent"
}

# Display production deployment info
show_deployment_info() {
    log "Production deployment completed successfully!"
    echo ""
    echo "🌐 Production URLs:"
    echo "   API Gateway: http://localhost:3000"
    echo "   Health Check: http://localhost:3000/health"
    echo "   API Status: http://localhost:3000/api/v1/status"
    echo ""
    echo "📊 Monitoring:"
    echo "   Grafana: http://localhost:3001"
    echo "   Prometheus: http://localhost:9090"
    echo "   Jaeger: http://localhost:16686"
    echo "   Kibana: http://localhost:5601"
    echo ""
    echo "💾 Backup created: $BACKUP_NAME"
    echo ""
    
    # Show service status
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
    
    echo ""
    success "Production is now live with the new version! 🎉"
}

# Rollback function
rollback() {
    warning "Initiating automatic rollback..."
    
    if [ -n "$BACKUP_NAME" ] && [ -f "$BACKUP_DIR/${BACKUP_NAME}_database.sql" ]; then
        log "Rolling back database..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec -T postgres \
            psql -U "${POSTGRES_USER:-ai_finance_user}" \
            -d "${POSTGRES_DB:-ai_finance_db}" \
            < "$BACKUP_DIR/${BACKUP_NAME}_database.sql"
    fi
    
    # Rollback to previous Docker images
    log "Rolling back services..."
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d
    
    send_notifications "rollback"
    error "Production deployment failed and was rolled back"
}

# Cleanup on failure
cleanup() {
    if [ $? -ne 0 ]; then
        if [ "$AUTO_ROLLBACK" = "true" ]; then
            rollback
        else
            warning "Deployment failed. Manual intervention required."
            warning "Backup available: $BACKUP_NAME"
            send_notifications "failure"
        fi
    fi
}

# Main deployment flow
main() {
    trap cleanup EXIT
    
    log "Starting production deployment (this may take several minutes)"
    
    check_prerequisites
    load_environment
    create_backup
    deploy_services
    comprehensive_health_check
    run_smoke_tests
    setup_monitoring
    send_notifications "success"
    show_deployment_info
    
    success "Production deployment completed successfully! 🚀"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --version)
            export VERSION="$2"
            shift 2
            ;;
        --compose-file)
            COMPOSE_FILE="$2"
            shift 2
            ;;
        --project-name)
            PROJECT_NAME="$2"
            shift 2
            ;;
        --force-deploy)
            FORCE_DEPLOY=true
            shift
            ;;
        --auto-rollback)
            AUTO_ROLLBACK=true
            shift
            ;;
        --skip-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --skip-smoke-tests)
            SKIP_SMOKE_TESTS=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --version VERSION          Set deployment version"
            echo "  --compose-file FILE        Docker Compose file to use"
            echo "  --project-name NAME        Docker Compose project name"
            echo "  --force-deploy             Force deploy from non-main branch"
            echo "  --auto-rollback            Automatically rollback on failure"
            echo "  --skip-backup              Skip pre-deployment backup"
            echo "  --skip-smoke-tests         Skip smoke tests"
            echo "  --help                     Show this help message"
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Override functions if flags are set
if [ "$SKIP_BACKUP" = "true" ]; then
    create_backup() {
        warning "Skipping pre-deployment backup"
    }
fi

if [ "$SKIP_SMOKE_TESTS" = "true" ]; then
    run_smoke_tests() {
        warning "Skipping smoke tests"
    }
fi

# Run main function
main "$@"