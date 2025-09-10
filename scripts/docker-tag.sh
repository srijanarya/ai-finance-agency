#!/bin/bash
# docker-tag.sh - Semantic versioning and tagging strategy for Docker images
# This script generates semantic versions and tags for Docker images based on Git history

set -euo pipefail

# Configuration
DEFAULT_MAJOR=1
DEFAULT_MINOR=0
DEFAULT_PATCH=0

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

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to get the latest semantic version tag
get_latest_version() {
    # Get the latest semantic version tag (v1.2.3 format)
    local latest_tag
    latest_tag=$(git tag -l "v*.*.*" --sort=-version:refname | head -n1)
    
    if [[ -n "$latest_tag" ]]; then
        echo "$latest_tag"
    else
        echo "v${DEFAULT_MAJOR}.${DEFAULT_MINOR}.${DEFAULT_PATCH}"
    fi
}

# Function to parse semantic version
parse_version() {
    local version="$1"
    # Remove 'v' prefix if present
    version="${version#v}"
    
    IFS='.' read -r major minor patch <<< "$version"
    echo "$major $minor $patch"
}

# Function to increment version based on commit messages
increment_version() {
    local current_version="$1"
    local commits="$2"
    
    read -r major minor patch <<< "$(parse_version "$current_version")"
    
    # Analyze commits for conventional commit patterns
    local has_breaking=false
    local has_feat=false
    local has_fix=false
    
    while IFS= read -r commit; do
        if [[ "$commit" =~ ^(feat|feature)\(!|\(.*\)!|:.*BREAKING) ]]; then
            has_breaking=true
        elif [[ "$commit" =~ ^(feat|feature)(\(|:) ]]; then
            has_feat=true
        elif [[ "$commit" =~ ^(fix|bugfix)(\(|:) ]]; then
            has_fix=true
        elif [[ "$commit" =~ BREAKING[[:space:]]CHANGE ]]; then
            has_breaking=true
        fi
    done <<< "$commits"
    
    # Increment version based on conventional commits
    if [[ "$has_breaking" == true ]]; then
        ((major++))
        minor=0
        patch=0
        log_info "Breaking changes detected - incrementing major version"
    elif [[ "$has_feat" == true ]]; then
        ((minor++))
        patch=0
        log_info "New features detected - incrementing minor version"
    elif [[ "$has_fix" == true ]]; then
        ((patch++))
        log_info "Bug fixes detected - incrementing patch version"
    else
        ((patch++))
        log_info "No conventional commits detected - incrementing patch version"
    fi
    
    echo "${major}.${minor}.${patch}"
}

# Function to generate build metadata
generate_build_metadata() {
    local git_sha="$1"
    local git_branch="$2"
    local timestamp="$3"
    
    # Clean branch name for use in tags
    local clean_branch
    clean_branch=$(echo "$git_branch" | sed 's/[^a-zA-Z0-9-]/-/g' | tr '[:upper:]' '[:lower:]')
    
    echo "${clean_branch}.${git_sha:0:8}.${timestamp}"
}

# Main function
main() {
    log_info "Starting Docker tagging strategy..."
    
    # Get environment variables with defaults
    local git_ref="${GITHUB_REF:-$(git rev-parse --abbrev-ref HEAD)}"
    local git_sha="${GITHUB_SHA:-$(git rev-parse HEAD)}"
    local event_name="${GITHUB_EVENT_NAME:-manual}"
    local timestamp=$(date +%Y%m%d%H%M%S)
    
    # Extract branch name from ref
    local git_branch
    if [[ "$git_ref" =~ ^refs/heads/ ]]; then
        git_branch="${git_ref#refs/heads/}"
    elif [[ "$git_ref" =~ ^refs/tags/ ]]; then
        git_branch="${git_ref#refs/tags/}"
    else
        git_branch="$git_ref"
    fi
    
    log_info "Git Reference: $git_ref"
    log_info "Git SHA: $git_sha"
    log_info "Git Branch: $git_branch"
    log_info "Event: $event_name"
    
    # Get version based on context
    local version
    local version_type="development"
    
    if [[ "$git_ref" =~ ^refs/tags/v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        # This is a semantic version tag
        version="${git_ref#refs/tags/v}"
        version_type="release"
        log_info "Release tag detected: v$version"
    elif [[ "$git_branch" == "main" ]]; then
        # Main branch - generate next semantic version
        local latest_version
        latest_version=$(get_latest_version)
        log_info "Latest version: $latest_version"
        
        # Get commits since last tag
        local commits
        if git rev-list "$latest_version..HEAD" >/dev/null 2>&1; then
            commits=$(git log --format="%s" "$latest_version..HEAD")
        else
            commits=$(git log --format="%s" -n 10)
        fi
        
        if [[ -n "$commits" ]]; then
            version=$(increment_version "$latest_version" "$commits")
            version_type="prerelease"
            log_info "Generated version: v$version"
        else
            version="${latest_version#v}"
            log_info "No new commits, using existing version: v$version"
        fi
    else
        # Feature branch or PR - use base version with branch identifier
        local latest_version
        latest_version=$(get_latest_version)
        read -r major minor patch <<< "$(parse_version "$latest_version")"
        
        version="${major}.${minor}.${patch}-${git_branch}.${git_sha:0:8}"
        version_type="development"
        log_info "Development version: v$version"
    fi
    
    # Generate build metadata
    local build_metadata
    build_metadata=$(generate_build_metadata "$git_sha" "$git_branch" "$timestamp")
    
    # Set outputs for GitHub Actions
    if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
        {
            echo "version=$version"
            echo "version_type=$version_type"
            echo "build_metadata=$build_metadata"
            echo "timestamp=$timestamp"
            echo "git_sha=$git_sha"
            echo "git_branch=$git_branch"
            echo "clean_branch=$(echo "$git_branch" | sed 's/[^a-zA-Z0-9-]/-/g' | tr '[:upper:]' '[:lower:]')"
        } >> "$GITHUB_OUTPUT"
    fi
    
    # Generate additional tags
    local additional_tags=()
    
    if [[ "$version_type" == "release" ]]; then
        # For releases, also tag with major and major.minor
        read -r major minor patch <<< "$(parse_version "$version")"
        additional_tags+=("$major" "$major.$minor")
    elif [[ "$git_branch" == "main" ]]; then
        additional_tags+=("latest")
    fi
    
    # Output summary
    log_success "Tagging strategy completed!"
    echo
    echo "=== VERSION INFORMATION ==="
    echo "Primary Version: v$version"
    echo "Version Type: $version_type"
    echo "Build Metadata: $build_metadata"
    echo "Git SHA: $git_sha"
    echo "Git Branch: $git_branch"
    echo "Timestamp: $timestamp"
    
    if [[ ${#additional_tags[@]} -gt 0 ]]; then
        echo "Additional Tags: ${additional_tags[*]}"
    fi
    
    # Generate Docker tags for output
    if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
        {
            echo "docker_tags<<EOF"
            echo "$version"
            for tag in "${additional_tags[@]}"; do
                echo "$tag"
            done
            echo "EOF"
        } >> "$GITHUB_OUTPUT"
    fi
    
    echo "========================="
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi