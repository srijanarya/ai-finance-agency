#!/bin/bash

# AI Finance Agency - Development Environment Stop Script
# Clean shutdown of development environment

set -e

echo "🛑 Stopping AI Finance Agency Development Environment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Parse command line arguments
CLEAN=false
VOLUMES=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            CLEAN=true
            shift
            ;;
        --volumes)
            VOLUMES=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --clean    Remove containers and images"
            echo "  --volumes  Remove volumes (WARNING: This will delete all data)"
            echo "  -h, --help Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Stop services
echo "Stopping services..."
docker-compose down

print_success "Services stopped"

# Clean up if requested
if [ "$CLEAN" = true ]; then
    echo "Cleaning up containers and images..."
    
    # Remove containers
    docker-compose rm -f
    
    # Remove images
    docker-compose down --rmi all
    
    print_success "Containers and images cleaned up"
fi

# Remove volumes if requested (WARNING: This deletes all data)
if [ "$VOLUMES" = true ]; then
    print_warning "WARNING: This will delete ALL database and cache data!"
    echo "Are you sure you want to continue? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Removing volumes..."
        docker-compose down --volumes
        docker volume prune -f
        print_success "Volumes removed"
    else
        print_success "Volume removal cancelled"
    fi
fi

# Show remaining resources
echo ""
echo "📊 Remaining Docker Resources:"
echo "=============================="

# Show running containers related to the project
running_containers=$(docker ps --filter "name=ai_finance" --format "table {{.Names}}\t{{.Status}}")
if [ -n "$running_containers" ] && [ "$running_containers" != "NAMES	STATUS" ]; then
    echo "🟡 Running containers:"
    echo "$running_containers"
else
    echo "✅ No project containers running"
fi

# Show project volumes
project_volumes=$(docker volume ls --filter "name=ai-finance-agency" --format "table {{.Name}}\t{{.Driver}}")
if [ -n "$project_volumes" ] && [ "$project_volumes" != "VOLUME NAME	DRIVER" ]; then
    echo ""
    echo "💾 Project volumes:"
    echo "$project_volumes"
else
    echo "✅ No project volumes found"
fi

# Show networks
project_networks=$(docker network ls --filter "name=ai_finance" --format "table {{.Name}}\t{{.Driver}}")
if [ -n "$project_networks" ] && [ "$project_networks" != "NAME	DRIVER" ]; then
    echo ""
    echo "🌐 Project networks:"
    echo "$project_networks"
else
    echo "✅ No project networks found"
fi

echo ""
print_success "Development environment stopped successfully!"

echo ""
echo "🔧 Quick Commands:"
echo "=================="
echo "• Restart: ./scripts/dev-start.sh"
echo "• Full cleanup: ./scripts/dev-stop.sh --clean --volumes"
echo "• Setup from scratch: ./scripts/dev-setup.sh"