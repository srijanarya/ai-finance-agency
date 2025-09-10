#!/bin/bash
# registry-management.sh - GHCR registry management and maintenance script
# This script provides utilities for managing Docker images in GitHub Container Registry

set -euo pipefail

# Configuration
REGISTRY="ghcr.io"
REPO_OWNER="${GITHUB_REPOSITORY_OWNER:-$(git config user.name | tr '[:upper:]' '[:lower:]')}"
IMAGE_PREFIX="${REPO_OWNER}/ai-finance-agency"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

# Help function
show_help() {
    cat << EOF
Registry Management Script for AI Finance Agency

USAGE:
    ./registry-management.sh <command> [options]

COMMANDS:
    list-images          List all images in the registry
    list-tags <service>  List all tags for a specific service
    pull-all [tag]       Pull all service images (default: latest)
    push-all [tag]       Push all service images (default: latest)
    cleanup [days]       Remove images older than X days (default: 30)
    sign-images [tag]    Sign all images with cosign (default: latest)
    verify-images [tag]  Verify image signatures (default: latest)
    scan-security [tag]  Run security scan on all images (default: latest)
    sync-registry        Sync local images with registry
    health-check         Check registry connectivity and permissions

OPTIONS:
    -h, --help          Show this help message
    -v, --verbose       Enable verbose output
    -d, --dry-run       Show what would be done without executing
    --token TOKEN       GitHub token (or set GITHUB_TOKEN env var)

EXAMPLES:
    # List all images
    ./registry-management.sh list-images

    # Pull all latest images
    ./registry-management.sh pull-all latest

    # Clean up images older than 7 days
    ./registry-management.sh cleanup 7

    # Sign all production images
    ./registry-management.sh sign-images v1.2.3

    # Run security scan on development images
    ./registry-management.sh scan-security develop
EOF
}

# Check prerequisites
check_prerequisites() {
    local missing_tools=()
    
    command -v docker >/dev/null 2>&1 || missing_tools+=("docker")
    command -v jq >/dev/null 2>&1 || missing_tools+=("jq")
    command -v curl >/dev/null 2>&1 || missing_tools+=("curl")
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_info "Please install missing tools and try again"
        exit 1
    fi
    
    if [[ -z "$GITHUB_TOKEN" ]]; then
        log_warn "GITHUB_TOKEN not set. Some operations may fail."
        log_info "Set token with: export GITHUB_TOKEN=ghp_xxxxxxxxxxxx"
    fi
}

# Get list of services
get_services() {
    if [[ -d "services" ]]; then
        ls services/
    else
        echo "api-gateway content-intelligence education market-data notification payment risk-management signals trading user-management"
    fi
}

# Authenticate with registry
authenticate_registry() {
    if [[ -n "$GITHUB_TOKEN" ]]; then
        echo "$GITHUB_TOKEN" | docker login "$REGISTRY" -u "$REPO_OWNER" --password-stdin >/dev/null 2>&1
        log_success "Authenticated with $REGISTRY"
    else
        log_warn "No GitHub token provided, using existing authentication"
    fi
}

# List all images
list_images() {
    log_info "Listing all images in $REGISTRY/$IMAGE_PREFIX/"
    
    for service in $(get_services); do
        local image_url="$REGISTRY/$IMAGE_PREFIX/$service"
        
        if docker manifest inspect "$image_url:latest" >/dev/null 2>&1; then
            echo "✅ $service"
            
            if [[ "${VERBOSE:-false}" == "true" ]]; then
                # Get available tags using GitHub API
                if [[ -n "$GITHUB_TOKEN" ]]; then
                    curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
                        "https://api.github.com/user/packages/container/$IMAGE_PREFIX%2F$service/versions" | \
                        jq -r '.[].metadata.container.tags[]?' 2>/dev/null | sort -V | head -10 | \
                        sed 's/^/  - /' || echo "  - latest"
                fi
            fi
        else
            echo "❌ $service (not found)"
        fi
    done
}

# List tags for a specific service
list_tags() {
    local service="$1"
    
    if [[ -z "$service" ]]; then
        log_error "Service name required"
        return 1
    fi
    
    log_info "Listing tags for $service"
    
    if [[ -n "$GITHUB_TOKEN" ]]; then
        curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
            "https://api.github.com/user/packages/container/$IMAGE_PREFIX%2F$service/versions" | \
            jq -r '.[].metadata.container.tags[]?' 2>/dev/null | sort -V || {
            log_error "Failed to fetch tags for $service"
            return 1
        }
    else
        log_error "GitHub token required for tag listing"
        return 1
    fi
}

# Pull all service images
pull_all() {
    local tag="${1:-latest}"
    log_info "Pulling all service images with tag: $tag"
    
    authenticate_registry
    
    local failed_services=()
    
    for service in $(get_services); do
        local image_url="$REGISTRY/$IMAGE_PREFIX/$service:$tag"
        
        log_info "Pulling $service:$tag"
        if [[ "${DRY_RUN:-false}" == "true" ]]; then
            echo "Would pull: $image_url"
        else
            if docker pull "$image_url"; then
                log_success "Pulled $service:$tag"
            else
                log_error "Failed to pull $service:$tag"
                failed_services+=("$service")
            fi
        fi
    done
    
    if [[ ${#failed_services[@]} -gt 0 ]]; then
        log_warn "Failed to pull: ${failed_services[*]}"
        return 1
    fi
}

# Push all service images
push_all() {
    local tag="${1:-latest}"
    log_info "Pushing all service images with tag: $tag"
    
    authenticate_registry
    
    local failed_services=()
    
    for service in $(get_services); do
        local image_url="$REGISTRY/$IMAGE_PREFIX/$service:$tag"
        
        # Check if local image exists
        if docker image inspect "$image_url" >/dev/null 2>&1; then
            log_info "Pushing $service:$tag"
            if [[ "${DRY_RUN:-false}" == "true" ]]; then
                echo "Would push: $image_url"
            else
                if docker push "$image_url"; then
                    log_success "Pushed $service:$tag"
                else
                    log_error "Failed to push $service:$tag"
                    failed_services+=("$service")
                fi
            fi
        else
            log_warn "Local image not found: $service:$tag"
            failed_services+=("$service")
        fi
    done
    
    if [[ ${#failed_services[@]} -gt 0 ]]; then
        log_warn "Failed to push: ${failed_services[*]}"
        return 1
    fi
}

# Cleanup old images
cleanup_registry() {
    local days="${1:-30}"
    log_info "Cleaning up images older than $days days"
    
    if [[ -z "$GITHUB_TOKEN" ]]; then
        log_error "GitHub token required for cleanup operations"
        return 1
    fi
    
    local cutoff_date
    cutoff_date=$(date -d "$days days ago" -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-"${days}d" +%Y-%m-%dT%H:%M:%SZ)
    
    for service in $(get_services); do
        log_info "Cleaning up $service images older than $cutoff_date"
        
        # Get package versions
        local versions
        versions=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
            "https://api.github.com/user/packages/container/$IMAGE_PREFIX%2F$service/versions")
        
        # Find old versions
        local old_versions
        old_versions=$(echo "$versions" | jq -r --arg cutoff "$cutoff_date" \
            '.[] | select(.created_at < $cutoff) | .id')
        
        if [[ -n "$old_versions" ]]; then
            while IFS= read -r version_id; do
                if [[ "${DRY_RUN:-false}" == "true" ]]; then
                    echo "Would delete version ID: $version_id"
                else
                    log_info "Deleting old version: $version_id"
                    curl -s -X DELETE \
                        -H "Authorization: Bearer $GITHUB_TOKEN" \
                        "https://api.github.com/user/packages/container/$IMAGE_PREFIX%2F$service/versions/$version_id"
                fi
            done <<< "$old_versions"
        else
            log_info "No old versions found for $service"
        fi
    done
}

# Sign images with cosign
sign_images() {
    local tag="${1:-latest}"
    log_info "Signing images with tag: $tag"
    
    if ! command -v cosign >/dev/null 2>&1; then
        log_error "cosign not found. Please install cosign first."
        return 1
    fi
    
    authenticate_registry
    
    for service in $(get_services); do
        local image_url="$REGISTRY/$IMAGE_PREFIX/$service:$tag"
        
        log_info "Signing $service:$tag"
        if [[ "${DRY_RUN:-false}" == "true" ]]; then
            echo "Would sign: $image_url"
        else
            if cosign sign --yes "$image_url"; then
                log_success "Signed $service:$tag"
            else
                log_error "Failed to sign $service:$tag"
            fi
        fi
    done
}

# Verify image signatures
verify_images() {
    local tag="${1:-latest}"
    log_info "Verifying image signatures for tag: $tag"
    
    if ! command -v cosign >/dev/null 2>&1; then
        log_error "cosign not found. Please install cosign first."
        return 1
    fi
    
    for service in $(get_services); do
        local image_url="$REGISTRY/$IMAGE_PREFIX/$service:$tag"
        
        log_info "Verifying $service:$tag"
        if cosign verify "$image_url" \
            --certificate-identity-regexp=".*" \
            --certificate-oidc-issuer="https://token.actions.githubusercontent.com" 2>/dev/null; then
            log_success "Verified $service:$tag"
        else
            log_warn "Failed to verify signature for $service:$tag"
        fi
    done
}

# Run security scan
scan_security() {
    local tag="${1:-latest}"
    log_info "Running security scan for images with tag: $tag"
    
    if ! command -v trivy >/dev/null 2>&1 && ! docker image inspect aquasec/trivy:latest >/dev/null 2>&1; then
        log_error "trivy not found. Please install trivy or pull aquasec/trivy:latest"
        return 1
    fi
    
    for service in $(get_services); do
        local image_url="$REGISTRY/$IMAGE_PREFIX/$service:$tag"
        
        log_info "Scanning $service:$tag"
        
        # Use local trivy if available, otherwise use Docker
        if command -v trivy >/dev/null 2>&1; then
            trivy image --severity HIGH,CRITICAL "$image_url"
        else
            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                aquasec/trivy:latest image --severity HIGH,CRITICAL "$image_url"
        fi
    done
}

# Sync local images with registry
sync_registry() {
    log_info "Syncing local images with registry"
    
    authenticate_registry
    
    # Pull latest versions of all services
    pull_all "latest"
    
    # Check for any locally modified images and push if needed
    for service in $(get_services); do
        local image_url="$REGISTRY/$IMAGE_PREFIX/$service:latest"
        
        if docker image inspect "$image_url" >/dev/null 2>&1; then
            local local_digest remote_digest
            local_digest=$(docker image inspect "$image_url" --format '{{.RepoDigests}}' 2>/dev/null || echo "")
            remote_digest=$(docker manifest inspect "$image_url" 2>/dev/null | jq -r '.config.digest' || echo "")
            
            if [[ "$local_digest" != "$remote_digest" ]] && [[ -n "$local_digest" ]] && [[ -n "$remote_digest" ]]; then
                log_warn "$service has local modifications"
                if [[ "${DRY_RUN:-false}" != "true" ]]; then
                    read -p "Push local changes? (y/N): " -n 1 -r
                    echo
                    if [[ $REPLY =~ ^[Yy]$ ]]; then
                        docker push "$image_url"
                        log_success "Pushed local changes for $service"
                    fi
                fi
            fi
        fi
    done
}

# Health check
health_check() {
    log_info "Running registry health check"
    
    # Check Docker daemon
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker daemon not running"
        return 1
    fi
    log_success "Docker daemon is running"
    
    # Check registry connectivity
    if curl -s -f "https://$REGISTRY/v2/" >/dev/null; then
        log_success "Registry is accessible"
    else
        log_error "Cannot reach registry at $REGISTRY"
        return 1
    fi
    
    # Check authentication
    if [[ -n "$GITHUB_TOKEN" ]]; then
        if echo "$GITHUB_TOKEN" | docker login "$REGISTRY" -u "$REPO_OWNER" --password-stdin >/dev/null 2>&1; then
            log_success "Authentication successful"
        else
            log_error "Authentication failed"
            return 1
        fi
    else
        log_warn "No GitHub token provided - cannot test authentication"
    fi
    
    # Check sample image
    local test_service="api-gateway"
    if docker manifest inspect "$REGISTRY/$IMAGE_PREFIX/$test_service:latest" >/dev/null 2>&1; then
        log_success "Sample image accessible"
    else
        log_warn "Sample image not found - may need to run initial build"
    fi
    
    log_success "Health check completed"
}

# Main function
main() {
    local command="${1:-}"
    
    if [[ -z "$command" ]]; then
        show_help
        exit 1
    fi
    
    # Parse global options
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            --token)
                GITHUB_TOKEN="$2"
                shift 2
                ;;
            *)
                break
                ;;
        esac
    done
    
    check_prerequisites
    
    case "$command" in
        list-images)
            list_images
            ;;
        list-tags)
            list_tags "$2"
            ;;
        pull-all)
            pull_all "$2"
            ;;
        push-all)
            push_all "$2"
            ;;
        cleanup)
            cleanup_registry "$2"
            ;;
        sign-images)
            sign_images "$2"
            ;;
        verify-images)
            verify_images "$2"
            ;;
        scan-security)
            scan_security "$2"
            ;;
        sync-registry)
            sync_registry
            ;;
        health-check)
            health_check
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi