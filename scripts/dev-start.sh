#!/bin/bash

# AI Finance Agency - Quick Development Start Script
# Start development environment quickly

set -e

echo "🚀 Starting AI Finance Agency Development Environment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if .env exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please update .env file with your API keys before proceeding"
        echo "Press Enter to continue or Ctrl+C to exit..."
        read
    else
        echo "Error: .env.example not found. Please run ./scripts/dev-setup.sh first"
        exit 1
    fi
fi

# Start services
print_status "Starting services with Docker Compose..."
docker-compose up -d --build

# Wait for services
print_status "Waiting for services to be ready..."
sleep 15

# Check health
print_status "Checking service health..."

# Check PostgreSQL
if docker-compose exec postgres pg_isready -U ai_finance_user -d ai_finance_db > /dev/null 2>&1; then
    print_success "PostgreSQL is ready"
else
    print_warning "PostgreSQL may not be ready yet"
fi

# Check Redis
if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is ready"
else
    print_warning "Redis may not be ready yet"
fi

# Check API
for i in {1..30}; do
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_success "API is ready and healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "API is taking longer than expected to start"
        break
    fi
    sleep 2
done

# Display status
print_success "Development environment started!"
echo ""
echo "📋 Quick Access:"
echo "================"
echo "• API: http://localhost:8000"
echo "• Health Check: http://localhost:8000/health"
echo "• API Docs: http://localhost:8000/docs"
echo "• Database: localhost:5432"
echo "• Redis: localhost:6379"
echo ""
echo "🔧 Quick Commands:"
echo "=================="
echo "• View API logs: docker-compose logs -f api"
echo "• View all logs: docker-compose logs -f"
echo "• Stop services: docker-compose down"
echo "• Restart API: docker-compose restart api"
echo ""
echo "Happy coding! 🎉"