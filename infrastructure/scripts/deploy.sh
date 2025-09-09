#!/bin/bash
# Deployment script for AI Finance Agency
# Usage: ./deploy.sh [environment] [options]

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
K8S_DIR="${PROJECT_ROOT}/infrastructure/kubernetes"
NAMESPACE="ai-finance-agency"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" >&2
}

# Help function
show_help() {
    cat << EOF
Deployment script for AI Finance Agency

Usage: $0 [OPTIONS]

Options:
    -e, --environment   Target environment (staging|production) [required]
    -i, --image         Docker image tag to deploy [default: latest]
    -n, --namespace     Kubernetes namespace [default: ai-finance-agency]
    --dry-run          Show what would be deployed without actually deploying
    --no-backup        Skip pre-deployment backup
    --no-migrate       Skip database migrations
    --force            Force deployment even if health checks fail
    --rollback         Rollback to previous deployment
    -w, --wait          Wait time for deployment completion in seconds [default: 300]
    -h, --help         Show this help message

Examples:
    $0 -e staging -i v1.2.3
    $0 --environment production --image latest --wait 600
    $0 --rollback --environment staging

Environment Variables:
    KUBECONFIG         Path to kubectl configuration file
    IMAGE_TAG          Docker image tag (overrides -i option)
    SKIP_HEALTH_CHECK  Skip health checks after deployment
EOF
}

# Parse command line arguments
ENVIRONMENT=""
IMAGE_TAG="${IMAGE_TAG:-latest}"
DRY_RUN=false
NO_BACKUP=false
NO_MIGRATE=false
FORCE_DEPLOY=false
ROLLBACK=false
WAIT_TIME=300

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -i|--image)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --no-backup)
            NO_BACKUP=true
            shift
            ;;
        --no-migrate)
            NO_MIGRATE=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --rollback)
            ROLLBACK=true
            shift
            ;;
        -w|--wait)
            WAIT_TIME="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate required arguments
if [ -z "$ENVIRONMENT" ]; then
    log_error "Environment is required. Use -e or --environment"
    show_help
    exit 1
fi

# Validate environment
case $ENVIRONMENT in
    staging|production)
        ;;
    *)
        log_error "Invalid environment: $ENVIRONMENT. Must be staging or production"
        exit 1
        ;;
esac

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl >/dev/null 2>&1; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info >/dev/null 2>&1; then
        log_error "Cannot connect to Kubernetes cluster. Check your KUBECONFIG"
        exit 1
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
        log_warn "Namespace $NAMESPACE does not exist, it will be created"
    fi
    
    log_success "Prerequisites check completed"
}

# Backup function
backup_database() {
    if [ "$NO_BACKUP" = true ]; then
        log_info "Skipping backup as requested"
        return 0
    fi
    
    log_info "Creating pre-deployment backup..."
    
    BACKUP_JOB="backup-$(date +%Y%m%d-%H%M%S)"
    
    # Create backup job from cronjob
    if kubectl get cronjob database-backup -n "$NAMESPACE" >/dev/null 2>&1; then
        kubectl create job "$BACKUP_JOB" --from=cronjob/database-backup -n "$NAMESPACE"
        
        # Wait for backup to complete
        log_info "Waiting for backup to complete..."
        kubectl wait --for=condition=complete job/"$BACKUP_JOB" -n "$NAMESPACE" --timeout=600s
        
        if [ $? -eq 0 ]; then
            log_success "Backup completed successfully"
        else
            log_error "Backup failed"
            if [ "$FORCE_DEPLOY" = false ]; then
                exit 1
            else
                log_warn "Continuing with deployment despite backup failure"
            fi
        fi
    else
        log_warn "Backup cronjob not found, skipping backup"
    fi
}

# Migration function
run_migrations() {
    if [ "$NO_MIGRATE" = true ]; then
        log_info "Skipping database migrations as requested"
        return 0
    fi
    
    log_info "Running database migrations..."
    
    MIGRATION_JOB="migration-$(date +%Y%m%d-%H%M%S)"
    
    # Create migration job
    kubectl create job "$MIGRATION_JOB" --image="ghcr.io/ai-finance-agency:${IMAGE_TAG}" -n "$NAMESPACE" -- python -m alembic upgrade head
    
    # Wait for migration to complete
    log_info "Waiting for migrations to complete..."
    kubectl wait --for=condition=complete job/"$MIGRATION_JOB" -n "$NAMESPACE" --timeout=300s
    
    if [ $? -eq 0 ]; then
        log_success "Migrations completed successfully"
    else
        log_error "Migrations failed"
        if [ "$FORCE_DEPLOY" = false ]; then
            exit 1
        else
            log_warn "Continuing with deployment despite migration failure"
        fi
    fi
    
    # Clean up migration job
    kubectl delete job "$MIGRATION_JOB" -n "$NAMESPACE"
}

# Deploy function
deploy_application() {
    log_info "Deploying application to $ENVIRONMENT..."
    
    cd "$PROJECT_ROOT"
    
    # Update image tag in deployment file
    if [ -f "$K8S_DIR/deployment.yaml" ]; then
        # Create a temporary deployment file with updated image
        TEMP_DEPLOYMENT=$(mktemp)
        sed "s|ai-finance-agency:latest|ghcr.io/ai-finance-agency:${IMAGE_TAG}|g" "$K8S_DIR/deployment.yaml" > "$TEMP_DEPLOYMENT"
    else
        log_error "Deployment file not found: $K8S_DIR/deployment.yaml"
        exit 1
    fi
    
    # Dry run check
    if [ "$DRY_RUN" = true ]; then
        log_info "Dry run - showing what would be deployed:"
        kubectl diff -f "$K8S_DIR/namespace.yaml" || true
        kubectl diff -f "$K8S_DIR/configmap.yaml" || true
        kubectl diff -f "$K8S_DIR/secrets.yaml" || true
        kubectl diff -f "$K8S_DIR/pvc.yaml" || true
        kubectl diff -f "$K8S_DIR/rbac.yaml" || true
        kubectl diff -f "$TEMP_DEPLOYMENT" || true
        kubectl diff -f "$K8S_DIR/service.yaml" || true
        kubectl diff -f "$K8S_DIR/ingress.yaml" || true
        kubectl diff -f "$K8S_DIR/hpa.yaml" || true
        rm -f "$TEMP_DEPLOYMENT"
        return 0
    fi
    
    # Apply Kubernetes manifests in order
    log_info "Applying namespace..."
    kubectl apply -f "$K8S_DIR/namespace.yaml"
    
    log_info "Applying RBAC configuration..."
    kubectl apply -f "$K8S_DIR/rbac.yaml"
    
    log_info "Applying configuration maps..."
    kubectl apply -f "$K8S_DIR/configmap.yaml"
    
    log_info "Applying secrets..."
    kubectl apply -f "$K8S_DIR/secrets.yaml"
    
    log_info "Applying persistent volume claims..."
    kubectl apply -f "$K8S_DIR/pvc.yaml"
    
    log_info "Applying services..."
    kubectl apply -f "$K8S_DIR/service.yaml"
    
    log_info "Deploying application..."
    kubectl apply -f "$TEMP_DEPLOYMENT"
    
    log_info "Applying ingress..."
    kubectl apply -f "$K8S_DIR/ingress.yaml"
    
    log_info "Applying horizontal pod autoscaler..."
    kubectl apply -f "$K8S_DIR/hpa.yaml"
    
    # Clean up temporary file
    rm -f "$TEMP_DEPLOYMENT"
    
    log_success "Kubernetes manifests applied successfully"
}

# Wait for deployment
wait_for_deployment() {
    log_info "Waiting for deployment to be ready (timeout: ${WAIT_TIME}s)..."
    
    # Wait for deployment to be available
    if kubectl wait --for=condition=available --timeout="${WAIT_TIME}s" deployment/ai-finance-app -n "$NAMESPACE"; then
        log_success "Deployment is ready"
    else
        log_error "Deployment failed to become ready within ${WAIT_TIME} seconds"
        return 1
    fi
    
    # Wait for pods to be ready
    if kubectl wait --for=condition=ready pod -l app=ai-finance-agency -n "$NAMESPACE" --timeout=300s; then
        log_success "All pods are ready"
    else
        log_error "Pods failed to become ready"
        return 1
    fi
}

# Health check function
health_check() {
    if [ "$SKIP_HEALTH_CHECK" = "true" ]; then
        log_info "Skipping health checks as requested"
        return 0
    fi
    
    log_info "Running health checks..."
    
    # Port forward to test health endpoint
    kubectl port-forward service/ai-finance-app-service 8080:8000 -n "$NAMESPACE" &
    PORT_FORWARD_PID=$!
    
    # Give port-forward time to establish
    sleep 10
    
    # Test health endpoints
    HEALTH_CHECK_PASSED=true
    
    if ! curl -f http://localhost:8080/health >/dev/null 2>&1; then
        log_error "Health check endpoint failed"
        HEALTH_CHECK_PASSED=false
    fi
    
    if ! curl -f http://localhost:8080/ready >/dev/null 2>&1; then
        log_error "Ready check endpoint failed"
        HEALTH_CHECK_PASSED=false
    fi
    
    # Clean up port forward
    kill $PORT_FORWARD_PID >/dev/null 2>&1 || true
    
    if [ "$HEALTH_CHECK_PASSED" = true ]; then
        log_success "Health checks passed"
        return 0
    else
        log_error "Health checks failed"
        return 1
    fi
}

# Rollback function
rollback_deployment() {
    log_info "Rolling back deployment..."
    
    if kubectl rollout undo deployment/ai-finance-app -n "$NAMESPACE"; then
        log_info "Rollback initiated, waiting for completion..."
        kubectl rollout status deployment/ai-finance-app -n "$NAMESPACE" --timeout=300s
        log_success "Rollback completed successfully"
    else
        log_error "Rollback failed"
        exit 1
    fi
}

# Display deployment status
show_status() {
    log_info "Deployment Status:"
    echo "=================="
    
    echo
    echo "Pods:"
    kubectl get pods -l app=ai-finance-agency -n "$NAMESPACE" -o wide
    
    echo
    echo "Services:"
    kubectl get services -l app=ai-finance-agency -n "$NAMESPACE"
    
    echo
    echo "Ingress:"
    kubectl get ingress -n "$NAMESPACE"
    
    echo
    echo "HPA Status:"
    kubectl get hpa -n "$NAMESPACE"
    
    echo
    echo "Recent Events:"
    kubectl get events -n "$NAMESPACE" --sort-by=.metadata.creationTimestamp | tail -10
}

# Main execution
main() {
    log_info "Starting deployment process..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Image Tag: $IMAGE_TAG"
    log_info "Namespace: $NAMESPACE"
    log_info "Dry Run: $DRY_RUN"
    
    # Handle rollback request
    if [ "$ROLLBACK" = true ]; then
        check_prerequisites
        rollback_deployment
        show_status
        exit 0
    fi
    
    # Normal deployment flow
    check_prerequisites
    
    if [ "$DRY_RUN" = false ]; then
        backup_database
        run_migrations
    fi
    
    deploy_application
    
    if [ "$DRY_RUN" = false ]; then
        if wait_for_deployment; then
            if health_check; then
                log_success "Deployment completed successfully!"
                show_status
            else
                log_error "Health checks failed"
                if [ "$FORCE_DEPLOY" = false ]; then
                    log_info "Initiating automatic rollback..."
                    rollback_deployment
                    exit 1
                else
                    log_warn "Health checks failed but deployment marked as successful due to --force flag"
                fi
            fi
        else
            log_error "Deployment failed"
            if [ "$FORCE_DEPLOY" = false ]; then
                log_info "Initiating automatic rollback..."
                rollback_deployment
                exit 1
            fi
        fi
    fi
}

# Run main function
main "$@"