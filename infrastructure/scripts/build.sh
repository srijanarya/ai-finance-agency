#!/bin/bash
# Build script for AI Finance Agency Docker images
# Usage: ./build.sh [environment] [tag]

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
REGISTRY="ghcr.io"
IMAGE_NAME="ai-finance-agency"
DEFAULT_TAG="latest"

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
Build script for AI Finance Agency Docker images

Usage: $0 [OPTIONS]

Options:
    -e, --environment   Target environment (development|staging|production) [default: development]
    -t, --tag          Docker image tag [default: latest]
    -r, --registry     Docker registry [default: ghcr.io]
    -p, --push         Push image to registry after build
    -n, --no-cache     Build without cache
    --multi-platform   Build for multiple platforms (linux/amd64,linux/arm64)
    --scan            Run security scan after build
    -h, --help         Show this help message

Examples:
    $0 -e production -t v1.2.3 -p
    $0 --environment staging --push --scan
    $0 --multi-platform --no-cache

Environment Variables:
    DOCKER_REGISTRY    Override default registry
    GITHUB_SHA         Git commit SHA (used for tagging)
    GITHUB_REF_NAME    Git branch name (used for tagging)
EOF
}

# Parse command line arguments
ENVIRONMENT="development"
TAG="${DEFAULT_TAG}"
PUSH_IMAGE=false
NO_CACHE=false
MULTI_PLATFORM=false
SECURITY_SCAN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -p|--push)
            PUSH_IMAGE=true
            shift
            ;;
        -n|--no-cache)
            NO_CACHE=true
            shift
            ;;
        --multi-platform)
            MULTI_PLATFORM=true
            shift
            ;;
        --scan)
            SECURITY_SCAN=true
            shift
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

# Validate environment
case $ENVIRONMENT in
    development|staging|production)
        ;;
    *)
        log_error "Invalid environment: $ENVIRONMENT. Must be one of: development, staging, production"
        exit 1
        ;;
esac

# Set target based on environment
case $ENVIRONMENT in
    development)
        TARGET="development"
        ;;
    staging)
        TARGET="runtime"
        ;;
    production)
        TARGET="runtime"
        ;;
esac

# Use environment variables if available
REGISTRY="${DOCKER_REGISTRY:-$REGISTRY}"

# Generate build metadata
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
VCS_REF="${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo 'unknown')}"
VERSION="${GITHUB_REF_NAME:-$(git branch --show-current 2>/dev/null || echo 'unknown')}"

# Full image name
FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}"

log_info "Starting Docker build process..."
log_info "Environment: $ENVIRONMENT"
log_info "Target: $TARGET"
log_info "Registry: $REGISTRY"
log_info "Image: $FULL_IMAGE_NAME"
log_info "Tag: $TAG"
log_info "Build Date: $BUILD_DATE"
log_info "VCS Ref: $VCS_REF"
log_info "Version: $VERSION"

# Change to project root
cd "$PROJECT_ROOT"

# Check if Dockerfile exists
DOCKERFILE="infrastructure/docker/Dockerfile"
if [ ! -f "$DOCKERFILE" ]; then
    log_error "Dockerfile not found: $DOCKERFILE"
    exit 1
fi

# Prepare build arguments
BUILD_ARGS=(
    "--build-arg" "BUILD_DATE=${BUILD_DATE}"
    "--build-arg" "VCS_REF=${VCS_REF}"
    "--build-arg" "VERSION=${VERSION}"
    "--target" "$TARGET"
    "--file" "$DOCKERFILE"
)

# Add cache options
if [ "$NO_CACHE" = true ]; then
    BUILD_ARGS+=("--no-cache")
fi

# Add platform options for multi-platform builds
if [ "$MULTI_PLATFORM" = true ]; then
    BUILD_ARGS+=("--platform" "linux/amd64,linux/arm64")
fi

# Build tags
TAGS=(
    "--tag" "${FULL_IMAGE_NAME}:${TAG}"
    "--tag" "${FULL_IMAGE_NAME}:${ENVIRONMENT}"
)

# Add additional tags based on context
if [ "$TAG" != "latest" ] && [ "$ENVIRONMENT" = "production" ]; then
    TAGS+=("--tag" "${FULL_IMAGE_NAME}:latest")
fi

if [ -n "$GITHUB_SHA" ]; then
    TAGS+=("--tag" "${FULL_IMAGE_NAME}:${GITHUB_SHA:0:7}")
fi

# Add labels
LABELS=(
    "--label" "org.opencontainers.image.title=AI Finance Agency"
    "--label" "org.opencontainers.image.description=AI-powered financial content generation platform"
    "--label" "org.opencontainers.image.version=${VERSION}"
    "--label" "org.opencontainers.image.created=${BUILD_DATE}"
    "--label" "org.opencontainers.image.revision=${VCS_REF}"
    "--label" "org.opencontainers.image.source=https://github.com/ai-finance-agency/platform"
    "--label" "org.opencontainers.image.vendor=AI Finance Agency"
    "--label" "environment=${ENVIRONMENT}"
)

# Build the Docker image
log_info "Building Docker image..."
docker build \
    "${BUILD_ARGS[@]}" \
    "${TAGS[@]}" \
    "${LABELS[@]}" \
    .

if [ $? -eq 0 ]; then
    log_success "Docker image built successfully"
else
    log_error "Docker build failed"
    exit 1
fi

# Run security scan if requested
if [ "$SECURITY_SCAN" = true ]; then
    log_info "Running security scan..."
    
    # Check if Trivy is installed
    if command -v trivy >/dev/null 2>&1; then
        trivy image --exit-code 1 --severity HIGH,CRITICAL "${FULL_IMAGE_NAME}:${TAG}"
        if [ $? -eq 0 ]; then
            log_success "Security scan passed"
        else
            log_error "Security scan found vulnerabilities"
            exit 1
        fi
    else
        log_warn "Trivy not installed, skipping security scan"
    fi
fi

# Push image if requested
if [ "$PUSH_IMAGE" = true ]; then
    log_info "Pushing image to registry..."
    
    # Push all tags
    for tag in $(docker images --format "{{.Repository}}:{{.Tag}}" | grep "^${FULL_IMAGE_NAME}:"); do
        log_info "Pushing $tag..."
        docker push "$tag"
        if [ $? -eq 0 ]; then
            log_success "Successfully pushed $tag"
        else
            log_error "Failed to push $tag"
            exit 1
        fi
    done
fi

# Display image information
log_info "Build completed successfully!"
echo
echo "Image Information:"
echo "=================="
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}\t{{.Size}}" | grep "$IMAGE_NAME" | head -5

# Display image details
echo
echo "Image Details:"
echo "============="
docker inspect "${FULL_IMAGE_NAME}:${TAG}" --format='
Image ID: {{.Id}}
Created: {{.Created}}
Size: {{.Size}}
Architecture: {{.Architecture}}
OS: {{.Os}}
Labels: {{range $k, $v := .Config.Labels}}
  {{$k}}: {{$v}}{{end}}
' 2>/dev/null || log_warn "Could not retrieve image details"

log_success "Build process completed successfully!"

# Cleanup old images (optional)
if [ "$ENVIRONMENT" = "production" ]; then
    log_info "Cleaning up old images..."
    docker image prune -f --filter "label=org.opencontainers.image.title=AI Finance Agency" --filter "until=72h"
fi