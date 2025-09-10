#!/bin/bash

# TREUM AI Finance Platform - Staging Deployment Script
# Automated deployment to staging environment

set -e  # Exit on any error
set -u  # Exit on undefined variable
set -o pipefail  # Exit on pipe failure

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
STAGING_NAMESPACE="treum-staging"
KUBECONFIG_FILE="${HOME}/.kube/staging-config"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check required tools
    local required_tools=("kubectl" "docker" "jq" "curl")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool '$tool' is not installed"
            exit 1
        fi
    done
    
    # Check kubeconfig
    if [[ ! -f "$KUBECONFIG_FILE" ]]; then
        log_error "Staging kubeconfig not found at $KUBECONFIG_FILE"
        exit 1
    fi
    
    # Set kubeconfig
    export KUBECONFIG="$KUBECONFIG_FILE"
    
    # Test cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to staging cluster"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Get service information
get_services() {
    local services
    if [[ -n "${SERVICE_NAME:-}" ]]; then
        services="$SERVICE_NAME"
    else
        # Default to all services
        services="api-gateway user-management trading payment signals education"
    fi
    echo "$services"
}

# Build and push Docker images
build_and_push_images() {
    local services="$1"
    log_info "Building and pushing Docker images for services: $services"
    
    cd "$PROJECT_ROOT"
    
    for service in $services; do
        log_info "Building $service..."
        
        # Build image
        local image_tag="${GITHUB_REF_NAME:-develop}-${GITHUB_SHA:0:7}"
        local image_name="ghcr.io/treum-algotech/treum-ai-finance-${service}:${image_tag}"
        
        docker build \
            -f "services/$service/Dockerfile" \
            -t "$image_name" \
            --build-arg NODE_VERSION=22.11.0 \
            --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
            --build-arg VCS_REF="${GITHUB_SHA:-$(git rev-parse HEAD)}" \
            --build-arg VERSION="$image_tag" \
            --build-arg SERVICE_NAME="$service" \
            .
        
        # Push image
        log_info "Pushing $service image..."
        docker push "$image_name"
        
        log_success "Built and pushed $service image: $image_name"
    done
}

# Deploy services to staging
deploy_services() {
    local services="$1"
    log_info "Deploying services to staging: $services"
    
    # Ensure namespace exists
    kubectl create namespace "$STAGING_NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    
    for service in $services; do
        log_info "Deploying $service to staging..."
        
        # Set image name for deployment
        local image_tag="${GITHUB_REF_NAME:-develop}-${GITHUB_SHA:0:7}"
        local image_name="ghcr.io/treum-algotech/treum-ai-finance-${service}:${image_tag}"
        
        # Apply deployment with environment substitution
        export SERVICE_NAME="$service"
        export IMAGE_NAME="$image_name"
        export VERSION="$image_tag"
        export ENVIRONMENT="staging"
        
        # Apply Kubernetes manifests
        envsubst < "infrastructure/kubernetes/staging/${service}-deployment.yaml" | kubectl apply -f -
        kubectl apply -f "infrastructure/kubernetes/staging/${service}-service.yaml"
        
        # Wait for rollout to complete
        log_info "Waiting for $service rollout to complete..."
        kubectl rollout status "deployment/${service}-deployment" -n "$STAGING_NAMESPACE" --timeout=600s
        
        log_success "$service deployed successfully"
    done
}

# Run health checks
run_health_checks() {
    local services="$1"
    log_info "Running health checks for services: $services"
    
    for service in $services; do
        log_info "Health checking $service..."
        
        # Port forward to service
        local local_port=$((8000 + $(echo "$service" | wc -c)))
        kubectl port-forward "service/${service}-service" "$local_port:80" -n "$STAGING_NAMESPACE" &
        local port_forward_pid=$!
        
        # Wait for port forward to establish
        sleep 5
        
        # Run health check
        local health_url="http://localhost:$local_port/health"
        if curl -f -s "$health_url" > /dev/null; then
            log_success "$service health check passed"
        else
            log_error "$service health check failed"
            kill $port_forward_pid 2>/dev/null || true
            exit 1
        fi
        
        # Clean up port forward
        kill $port_forward_pid 2>/dev/null || true
    done
}

# Run smoke tests
run_smoke_tests() {
    log_info "Running smoke tests..."
    
    # Basic API connectivity test
    local api_gateway_url="https://staging-api.treum.ai"
    
    if curl -f -s "${api_gateway_url}/health" > /dev/null; then
        log_success "Smoke tests passed"
    else
        log_warning "Smoke tests failed - manual verification recommended"
    fi
}

# Notification function
send_notification() {
    local status="$1"
    local services="$2"
    
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local message
        if [[ "$status" == "success" ]]; then
            message="✅ Staging deployment successful for services: $services"
        else
            message="❌ Staging deployment failed for services: $services"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
}

# Main deployment function
main() {
    log_info "Starting staging deployment..."
    
    # Check prerequisites
    check_prerequisites
    
    # Get services to deploy
    local services
    services=$(get_services)
    
    log_info "Deploying services: $services"
    
    # Build and push images
    build_and_push_images "$services"
    
    # Deploy services
    deploy_services "$services"
    
    # Run health checks
    run_health_checks "$services"
    
    # Run smoke tests
    run_smoke_tests
    
    # Send success notification
    send_notification "success" "$services"
    
    log_success "Staging deployment completed successfully!"
    log_info "Services deployed: $services"
    log_info "Environment: $STAGING_NAMESPACE"
    log_info "Staging URL: https://staging-api.treum.ai"
}

# Error handler
error_handler() {
    local line_number=$1
    local error_code=$2
    
    log_error "Deployment failed on line $line_number with exit code $error_code"
    
    # Send failure notification
    local services
    services=$(get_services)
    send_notification "failure" "$services"
    
    exit $error_code
}

# Set error trap
trap 'error_handler ${LINENO} $?' ERR

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi