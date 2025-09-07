#!/bin/bash

# AI Finance Agency - Complete Deployment Script
# This script sets up everything: PostgreSQL, Redis, Celery, Docker, and starts all services

set -e  # Exit on error

echo "🚀 AI Finance Agency - Full Stack Deployment"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_status "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_status "Docker Compose is installed"
}

# Create necessary directories
setup_directories() {
    print_status "Creating necessary directories..."
    mkdir -p logs data templates static database cache health_reports
    mkdir -p .github/workflows
}

# Create environment file if not exists
setup_environment() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        cp .env.example .env
        print_warning "Please update .env with your actual API keys and credentials"
        read -p "Press enter to continue after updating .env..."
    fi
    print_status "Environment file configured"
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    docker-compose build --no-cache
}

# Start PostgreSQL and Redis
start_databases() {
    print_status "Starting PostgreSQL and Redis..."
    docker-compose up -d postgres redis
    
    # Wait for databases to be ready
    print_status "Waiting for databases to be ready..."
    sleep 10
    
    # Check if PostgreSQL is ready
    docker-compose exec postgres pg_isready -U ai_finance_user
    print_status "PostgreSQL is ready"
    
    # Check if Redis is ready
    docker-compose exec redis redis-cli ping
    print_status "Redis is ready"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    docker-compose run --rm app python -c "
from database.models import db_manager
db_manager.create_tables()
print('✓ Database tables created')

# Migrate from SQLite if files exist
import os
sqlite_files = [
    'data/agency.db',
    'content_history.db',
    'indian_market_data.db',
    'subscriber_growth.db'
]

existing_files = [f for f in sqlite_files if os.path.exists(f)]
if existing_files:
    print(f'Found {len(existing_files)} SQLite databases to migrate')
    db_manager.migrate_from_sqlite(existing_files)
else:
    print('No SQLite databases found to migrate')
"
}

# Start Celery workers
start_celery() {
    print_status "Starting Celery workers and beat scheduler..."
    docker-compose up -d celery_worker celery_beat
    
    # Start Flower for monitoring
    print_status "Starting Flower (Celery monitoring)..."
    docker-compose up -d flower
}

# Start Telegram Growth Engine
start_telegram_growth() {
    print_status "Starting Telegram Growth Engine..."
    docker-compose up -d telegram_growth
}

# Start main application
start_application() {
    print_status "Starting main application..."
    docker-compose up -d app
}

# Health check
health_check() {
    print_status "Running health checks..."
    
    # Check if services are running
    services=("postgres" "redis" "app" "celery_worker" "celery_beat" "telegram_growth")
    
    for service in "${services[@]}"; do
        if docker-compose ps | grep -q "$service.*Up"; then
            print_status "$service is running"
        else
            print_error "$service is not running"
        fi
    done
    
    # Test Redis connection
    docker-compose exec redis redis-cli ping > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_status "Redis connection successful"
    else
        print_error "Redis connection failed"
    fi
    
    # Test PostgreSQL connection
    docker-compose exec postgres psql -U ai_finance_user -d ai_finance_db -c "SELECT 1" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_status "PostgreSQL connection successful"
    else
        print_error "PostgreSQL connection failed"
    fi
}

# Show service URLs
show_urls() {
    echo ""
    echo "🎉 Deployment Complete!"
    echo "======================"
    echo ""
    echo "📊 Service URLs:"
    echo "  • Main Dashboard: http://localhost:5000"
    echo "  • API Endpoint: http://localhost:8000"
    echo "  • Flower (Celery): http://localhost:5555"
    echo "  • PostgreSQL: localhost:5432"
    echo "  • Redis: localhost:6379"
    echo ""
    echo "📝 Useful Commands:"
    echo "  • View logs: docker-compose logs -f [service_name]"
    echo "  • Stop all: docker-compose down"
    echo "  • Restart service: docker-compose restart [service_name]"
    echo "  • Shell access: docker-compose exec app bash"
    echo "  • Database access: docker-compose exec postgres psql -U ai_finance_user -d ai_finance_db"
    echo ""
    echo "🚀 Telegram Growth Engine is running!"
    echo "   Configure your bot token in .env to start getting subscribers"
    echo ""
}

# Main deployment flow
main() {
    echo "Starting deployment..."
    echo ""
    
    check_docker
    check_docker_compose
    setup_directories
    setup_environment
    
    # Ask user for deployment type
    echo ""
    echo "Select deployment type:"
    echo "1) Full deployment (recommended for first time)"
    echo "2) Quick restart (if already deployed)"
    echo "3) Update and rebuild"
    
    read -p "Enter choice [1-3]: " choice
    
    case $choice in
        1)
            build_images
            start_databases
            run_migrations
            start_celery
            start_telegram_growth
            start_application
            ;;
        2)
            docker-compose restart
            ;;
        3)
            docker-compose down
            git pull origin main
            build_images
            start_databases
            run_migrations
            start_celery
            start_telegram_growth
            start_application
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    sleep 5
    health_check
    show_urls
}

# Run main function
main