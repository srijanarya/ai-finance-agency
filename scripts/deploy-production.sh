#!/bin/bash

# TREUM AI Finance Platform - Production Deployment Script
# Blue-Green deployment with automatic rollback on failure

set -e  # Exit on any error
set -u  # Exit on undefined variable
set -o pipefail  # Exit on pipe failure

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PRODUCTION_NAMESPACE="treum-production"
KUBECONFIG_FILE="${HOME}/.kube/production-config"

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
    log_info "Checking production deployment prerequisites..."
    
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
        log_error "Production kubeconfig not found at $KUBECONFIG_FILE"
        exit 1
    fi
    
    # Set kubeconfig
    export KUBECONFIG="$KUBECONFIG_FILE"
    
    # Test cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to production cluster"
        exit 1
    fi
    
    # Check if we're on main branch (safety check)
    if [[ "${GITHUB_REF_NAME:-$(git branch --show-current)}" != "main" ]]; then
        log_warning "Production deployment should only happen from main branch"
        if [[ "${FORCE_DEPLOY:-false}" != "true" ]]; then
            log_error "Set FORCE_DEPLOY=true to override branch check"
            exit 1
        fi
    fi
    
    log_success "Prerequisites check passed"
}

# Pre-deployment backup
create_backup() {
    log_info "Creating pre-deployment backup..."
    
    # Create database backup job
    local backup_name="backup-$(date +%s)"
    
    if kubectl get cronjob database-backup -n "$PRODUCTION_NAMESPACE" &> /dev/null; then
        kubectl create job "$backup_name" --from=cronjob/database-backup -n "$PRODUCTION_NAMESPACE"
        
        # Wait for backup to complete (with timeout)
        if kubectl wait --for=condition=complete "job/$backup_name" -n "$PRODUCTION_NAMESPACE" --timeout=300s; then
            log_success "Database backup completed: $backup_name"
        else
            log_warning "Database backup timed out, but continuing with deployment"
        fi
    else
        log_warning "No backup cronjob found, skipping database backup"
    fi
}

# Get current deployment version
get_current_version() {
    local service="$1"
    local current_version
    
    current_version=$(kubectl get deployment "${service}-deployment" -n "$PRODUCTION_NAMESPACE" \
        -o jsonpath='{.metadata.labels.version}' 2>/dev/null || echo "blue")
    
    echo "$current_version"
}

# Get next deployment version
get_next_version() {
    local current="$1"
    
    if [[ "$current" == "blue" ]]; then
        echo "green"
    else
        echo "blue"
    fi
}

# Blue-Green deployment
deploy_service_blue_green() {
    local service="$1"
    local image_name="$2"
    
    log_info "Starting blue-green deployment for $service..."
    
    # Get current and next versions
    local current_version
    local next_version
    current_version=$(get_current_version "$service")
    next_version=$(get_next_version "$current_version")
    
    log_info "Current version: $current_version, deploying: $next_version"
    
    # Create new deployment with next version
    export SERVICE_NAME="$service"
    export IMAGE_NAME="$image_name"
    export VERSION="$next_version"
    export ENVIRONMENT="production"
    
    # Apply new deployment
    envsubst < "infrastructure/kubernetes/production/${service}-deployment.yaml" | \
        sed "s/version: [^[:space:]]*/version: $next_version/" | \
        kubectl apply -f -
    
    # Wait for new deployment to be ready
    log_info "Waiting for $service ($next_version) to be ready..."
    if ! kubectl rollout status "deployment/${service}-deployment" -n "$PRODUCTION_NAMESPACE" --timeout=600s; then
        log_error "Deployment rollout failed for $service"
        return 1
    fi
    
    # Health check new deployment
    log_info "Running health checks for $service ($next_version)..."
    if ! health_check_service "$service" "$next_version"; then
        log_error "Health check failed for $service ($next_version)"
        return 1
    fi
    
    # Switch traffic to new version
    log_info "Switching traffic to $service ($next_version)..."
    kubectl patch service "${service}-service" -n "$PRODUCTION_NAMESPACE" \
        -p "{\"spec\":{\"selector\":{\"version\":\"$next_version\"}}}"
    
    # Wait and verify traffic switch
    sleep 30
    
    # Final health check after traffic switch
    if ! health_check_service "$service" "$next_version"; then
        log_error "Health check failed after traffic switch for $service"
        # Rollback traffic
        kubectl patch service "${service}-service" -n "$PRODUCTION_NAMESPACE" \
            -p "{\"spec\":{\"selector\":{\"version\":\"$current_version\"}}}"
        return 1
    fi
    
    # Clean up old deployment
    log_info "Cleaning up old deployment for $service ($current_version)..."
    if kubectl get deployment "${service}-deployment-${current_version}" -n "$PRODUCTION_NAMESPACE" 2>/dev/null; then
        kubectl delete deployment "${service}-deployment-${current_version}" -n "$PRODUCTION_NAMESPACE"
    fi
    
    log_success "Blue-green deployment completed for $service"
    return 0
}

# Health check service
health_check_service() {
    local service="$1"
    local version="$2"
    local max_attempts=5
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log_info "Health check attempt $attempt/$max_attempts for $service ($version)..."
        
        # Port forward to service
        local local_port=$((9000 + $(echo "$service" | wc -c)))
        kubectl port-forward "service/${service}-service" "$local_port:80" -n "$PRODUCTION_NAMESPACE" &
        local port_forward_pid=$!
        
        # Wait for port forward to establish
        sleep 5
        
        # Run health check
        local health_url="http://localhost:$local_port/health"
        if curl -f -s --max-time 10 "$health_url" > /dev/null; then
            kill $port_forward_pid 2>/dev/null || true
            log_success "Health check passed for $service ($version)"
            return 0
        fi
        
        # Clean up port forward
        kill $port_forward_pid 2>/dev/null || true
        
        ((attempt++))
        sleep 10
    done
    
    log_error "Health check failed for $service ($version) after $max_attempts attempts"
    return 1
}

# Run critical path tests
run_critical_path_tests() {
    local service="$1"
    
    log_info "Running critical path tests for $service..."
    
    if [[ -f "tests/critical-path/${service}.test.js" ]]; then
        if npm run test:critical -- --testNamePattern="$service" --testTimeout=30000; then
            log_success "Critical path tests passed for $service"
            return 0
        else
            log_error "Critical path tests failed for $service"
            return 1
        fi
    else
        log_warning "No critical path tests found for $service, skipping..."
        return 0
    fi
}

# Rollback deployment
rollback_service() {
    local service="$1"
    
    log_error "Rolling back $service deployment..."
    
    # Rollback using kubectl
    if kubectl rollout undo "deployment/${service}-deployment" -n "$PRODUCTION_NAMESPACE"; then
        # Wait for rollback to complete
        kubectl rollout status "deployment/${service}-deployment" -n "$PRODUCTION_NAMESPACE" --timeout=300s
        log_success "Rollback completed for $service"
    else
        log_error "Rollback failed for $service"
    fi
}

# Deploy services
deploy_services() {
    local services="$1"
    local failed_services=()
    
    log_info "Starting production deployment for services: $services"
    
    for service in $services; do
        log_info "Deploying $service to production..."
        
        # Build image name
        local image_tag="${GITHUB_REF_NAME:-main}-${GITHUB_SHA:0:7}"
        local image_name="ghcr.io/treum-algotech/treum-ai-finance-${service}:${image_tag}"
        
        # Deploy with blue-green strategy
        if deploy_service_blue_green "$service" "$image_name"; then
            # Run critical path tests
            if run_critical_path_tests "$service"; then
                log_success "$service deployed successfully to production"
            else
                log_error "Critical path tests failed for $service"
                rollback_service "$service"
                failed_services+=("$service")
            fi
        else
            log_error "Blue-green deployment failed for $service"
            rollback_service "$service"
            failed_services+=("$service")
        fi
        
        # Add delay between service deployments
        if [[ ${#services[@]} -gt 1 ]]; then
            log_info "Waiting 60 seconds before next service deployment..."
            sleep 60
        fi
    done
    
    # Check if any deployments failed
    if [[ ${#failed_services[@]} -gt 0 ]]; then
        log_error "Production deployment failed for services: ${failed_services[*]}"
        return 1
    fi
    
    return 0
}

# Post-deployment verification
post_deployment_verification() {
    log_info "Running post-deployment verification..."
    
    # Check all pods are running
    local not_ready_pods
    not_ready_pods=$(kubectl get pods -n "$PRODUCTION_NAMESPACE" --field-selector=status.phase!=Running -o name 2>/dev/null | wc -l)
    
    if [[ $not_ready_pods -gt 0 ]]; then
        log_warning "Found $not_ready_pods pods not in Running state"
        kubectl get pods -n "$PRODUCTION_NAMESPACE" --field-selector=status.phase!=Running
    fi
    
    # Test API Gateway endpoint
    local api_url="https://api.treum.ai"
    if curl -f -s --max-time 10 "${api_url}/health" > /dev/null; then
        log_success "API Gateway health check passed"
    else
        log_error "API Gateway health check failed"
        return 1
    fi
    
    log_success "Post-deployment verification completed"
}

# Send notification
send_notification() {
    local status="$1"
    local services="$2"
    local details="${3:-}"
    
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local message
        local emoji
        
        if [[ "$status" == "success" ]]; then
            emoji="✅"
            message="Production deployment successful for services: $services"
        else
            emoji="🚨"
            message="Production deployment failed for services: $services"
            if [[ -n "$details" ]]; then
                message="$message\nDetails: $details"
            fi
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$emoji TREUM Production Deployment\\n$message\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
}

# Main production deployment function
main() {
    local services="${SERVICE_NAME:-api-gateway user-management trading payment signals education}"
    
    log_info "Starting production deployment..."
    log_info "Services to deploy: $services"
    log_info "Target namespace: $PRODUCTION_NAMESPACE"
    
    # Check prerequisites
    check_prerequisites
    
    # Create backup
    create_backup
    
    # Deploy services
    if deploy_services "$services"; then
        # Post-deployment verification
        if post_deployment_verification; then
            # Send success notification
            send_notification "success" "$services"
            
            log_success "Production deployment completed successfully!"
            log_info "Services deployed: $services"
            log_info "Environment: $PRODUCTION_NAMESPACE"
            log_info "Production URL: https://api.treum.ai"
        else
            send_notification "failure" "$services" "Post-deployment verification failed"
            exit 1
        fi
    else
        send_notification "failure" "$services" "Service deployment failed"
        exit 1
    fi
}

# Error handler
error_handler() {
    local line_number=$1
    local error_code=$2
    
    log_error "Production deployment failed on line $line_number with exit code $error_code"
    
    # Send failure notification
    local services="${SERVICE_NAME:-api-gateway user-management trading payment signals education}"
    send_notification "failure" "$services" "Unexpected error on line $line_number"
    
    exit $error_code
}

# Set error trap
trap 'error_handler ${LINENO} $?' ERR

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi