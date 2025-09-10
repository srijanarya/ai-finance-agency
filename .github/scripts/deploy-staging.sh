#!/bin/bash

# deploy-staging.sh - Deploy to staging environment
# This script is called from package.json npm scripts

set -e

echo "🚀 Starting staging deployment..."

# Configuration
ENVIRONMENT="staging"
COMPOSE_FILE="docker-compose.yml"
COMPOSE_OVERRIDE="docker-compose.override.yml" 
PROJECT_NAME="ai-finance-staging"

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
    log "Checking prerequisites..."
    
    if ! command -v docker >/dev/null 2>&1; then
        error "Docker is not installed or not in PATH"
    fi
    
    if ! command -v docker-compose >/dev/null 2>&1; then
        error "Docker Compose is not installed or not in PATH"
    fi
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        error "Docker Compose file not found: $COMPOSE_FILE"
    fi
    
    success "Prerequisites check passed"
}

# Load environment variables
load_environment() {
    log "Loading environment configuration..."
    
    if [ -f ".env" ]; then
        set -a
        source .env
        set +a
        success "Loaded .env file"
    fi
    
    if [ -f ".env.staging" ]; then
        set -a
        source .env.staging
        set +a
        success "Loaded .env.staging file"
    fi
    
    # Set staging-specific variables
    export NODE_ENV=staging
    export ENVIRONMENT=staging
}

# Build and deploy services
deploy_services() {
    log "Building and deploying services..."
    
    # Build images
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME build \
        --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        --build-arg VCS_REF="$(git rev-parse --short HEAD)" \
        --build-arg VERSION="${VERSION:-$(git rev-parse --short HEAD)}"
    
    success "Images built successfully"
    
    # Deploy with staging profile
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d \
        --remove-orphans \
        postgres redis rabbitmq mongodb
    
    log "Infrastructure services started, waiting for readiness..."
    sleep 30
    
    # Deploy application services
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d \
        --remove-orphans \
        api-gateway user-management payment signals trading \
        education market-data risk-management notification content-intelligence
    
    success "Application services deployed"
}

# Run health checks
health_check() {
    log "Running health checks..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -sf http://localhost:3000/health >/dev/null 2>&1; then
            success "Health check passed"
            return 0
        fi
        
        attempt=$((attempt + 1))
        log "Health check attempt $attempt/$max_attempts..."
        sleep 10
    done
    
    error "Health check failed after $max_attempts attempts"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME run --rm migrations
    
    success "Database migrations completed"
}

# Display deployment info
show_deployment_info() {
    log "Deployment completed successfully!"
    echo ""
    echo "🌐 Staging URLs:"
    echo "   API Gateway: http://localhost:3000"
    echo "   Health Check: http://localhost:3000/health"
    echo "   API Status: http://localhost:3000/api/v1/status"
    echo ""
    echo "📊 Monitoring:"
    echo "   Grafana: http://localhost:3001"
    echo "   Prometheus: http://localhost:9090"
    echo "   Jaeger: http://localhost:16686"
    echo ""
    echo "🗄️  Databases:"
    echo "   PostgreSQL: localhost:5432"
    echo "   Redis: localhost:6379" 
    echo "   MongoDB: localhost:27017"
    echo ""
    
    # Show running services
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
}

# Cleanup on failure
cleanup() {
    if [ $? -ne 0 ]; then
        warning "Deployment failed, cleaning up..."
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down --remove-orphans
    fi
}

# Main deployment flow
main() {
    trap cleanup EXIT
    
    log "Starting deployment to staging environment"
    
    check_prerequisites
    load_environment
    run_migrations
    deploy_services
    health_check
    show_deployment_info
    
    success "Staging deployment completed successfully! 🎉"
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
        --skip-migrations)
            SKIP_MIGRATIONS=true
            shift
            ;;
        --skip-health-check)
            SKIP_HEALTH_CHECK=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --version VERSION          Set deployment version"
            echo "  --compose-file FILE        Docker Compose file to use"
            echo "  --project-name NAME        Docker Compose project name"
            echo "  --skip-migrations          Skip database migrations"
            echo "  --skip-health-check        Skip health checks"
            echo "  --help                     Show this help message"
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            ;;
    esac
done

# Override functions if flags are set
if [ "$SKIP_MIGRATIONS" = "true" ]; then
    run_migrations() {
        warning "Skipping database migrations"
    }
fi

if [ "$SKIP_HEALTH_CHECK" = "true" ]; then
    health_check() {
        warning "Skipping health checks"
    }
fi

# Run main function
main "$@"