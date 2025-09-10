#!/bin/bash

# AI Finance Agency - Development Environment Setup Script
# This script sets up the complete development environment

set -e  # Exit on any error

echo "🚀 AI Finance Agency - Development Environment Setup"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Desktop first."
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.11+ first."
        exit 1
    fi
    
    # Check Python version
    python_version=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
    required_version="3.11"
    
    if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 11) else 1)"; then
        print_error "Python 3.11+ is required. Current version: $python_version"
        exit 1
    fi
    
    print_success "All prerequisites are met"
}

# Create environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Created .env file from template"
        else
            print_error ".env.example not found. Please create it first."
            exit 1
        fi
    else
        print_warning ".env file already exists. Skipping creation."
    fi
    
    # Generate secure secrets if using defaults
    if grep -q "dev-secret-change-in-production" .env; then
        print_status "Generating secure JWT secret..."
        jwt_secret=$(openssl rand -hex 32)
        sed -i.bak "s/JWT_SECRET=dev-secret-change-in-production/JWT_SECRET=$jwt_secret/" .env
        rm .env.bak 2>/dev/null || true
    fi
    
    if grep -q "dev-session-secret" .env; then
        print_status "Generating secure session secret..."
        session_secret=$(openssl rand -hex 32)
        sed -i.bak "s/SESSION_SECRET=dev-session-secret/SESSION_SECRET=$session_secret/" .env
        rm .env.bak 2>/dev/null || true
    fi
    
    if grep -q "dev-encryption-key" .env; then
        print_status "Generating secure encryption key..."
        encryption_key=$(openssl rand -hex 32)
        sed -i.bak "s/ENCRYPTION_KEY=dev-encryption-key/ENCRYPTION_KEY=$encryption_key/" .env
        rm .env.bak 2>/dev/null || true
    fi
    
    print_success "Environment configuration completed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    directories=("logs" "data" "uploads" "static" "monitoring/grafana/dashboards" "monitoring/grafana/provisioning")
    
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            print_success "Created directory: $dir"
        fi
    done
}

# Setup Python virtual environment
setup_python_env() {
    print_status "Setting up Python virtual environment..."
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "Created Python virtual environment"
    else
        print_warning "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Upgrade pip
    pip install --upgrade pip
    
    # Install requirements
    if [ -f "requirements/base.txt" ]; then
        pip install -r requirements/base.txt
        print_success "Installed Python dependencies"
    else
        print_error "requirements/base.txt not found"
        exit 1
    fi
    
    # Install development dependencies
    if [ -f "requirements/dev.txt" ]; then
        pip install -r requirements/dev.txt
        print_success "Installed development dependencies"
    fi
}

# Setup database
setup_database() {
    print_status "Starting database services..."
    
    # Start only database services first
    docker-compose up -d postgres redis
    
    # Wait for services to be ready
    print_status "Waiting for database services to be ready..."
    sleep 10
    
    # Check if services are healthy
    for i in {1..30}; do
        if docker-compose ps postgres | grep -q "healthy"; then
            print_success "PostgreSQL is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "PostgreSQL failed to start properly"
            exit 1
        fi
        sleep 2
    done
    
    for i in {1..30}; do
        if docker-compose ps redis | grep -q "healthy"; then
            print_success "Redis is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Redis failed to start properly"
            exit 1
        fi
        sleep 2
    done
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Create initial migration if it doesn't exist
    if [ ! -d "migrations/versions" ] || [ -z "$(ls -A migrations/versions 2>/dev/null)" ]; then
        print_status "Creating initial migration..."
        source venv/bin/activate
        alembic revision --autogenerate -m "Initial migration"
    fi
    
    # Run migrations using Docker
    docker-compose run --rm migrations
    print_success "Database migrations completed"
}

# Start all services
start_services() {
    print_status "Starting all services..."
    
    # Build and start all services
    docker-compose up -d --build
    
    # Wait for API to be ready
    print_status "Waiting for API service to be ready..."
    for i in {1..60}; do
        if curl -f http://localhost:8000/health >/dev/null 2>&1; then
            print_success "API service is ready"
            break
        fi
        if [ $i -eq 60 ]; then
            print_error "API service failed to start properly"
            exit 1
        fi
        sleep 3
    done
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    source venv/bin/activate
    
    if [ -f "requirements/test.txt" ]; then
        pip install -r requirements/test.txt
    fi
    
    # Run configuration tests
    if [ -f "tests/test_configuration.py" ]; then
        python -m pytest tests/test_configuration.py -v
        print_success "Configuration tests passed"
    fi
    
    # Run dependency tests
    if [ -f "tests/test_dependencies.py" ]; then
        python -m pytest tests/test_dependencies.py -v
        print_success "Dependency tests passed"
    fi
    
    # Test API endpoints
    print_status "Testing API endpoints..."
    
    # Test health endpoint
    if curl -f http://localhost:8000/health >/dev/null 2>&1; then
        print_success "Health endpoint working"
    else
        print_error "Health endpoint failed"
    fi
    
    # Test API docs
    if curl -f http://localhost:8000/docs >/dev/null 2>&1; then
        print_success "API documentation accessible"
    else
        print_warning "API documentation not accessible (might be disabled in production mode)"
    fi
}

# Display final information
show_final_info() {
    print_success "🎉 Development environment setup completed!"
    echo ""
    echo "📋 Service Information:"
    echo "======================"
    echo "• API Server: http://localhost:8000"
    echo "• API Documentation: http://localhost:8000/docs"
    echo "• PostgreSQL: localhost:5432"
    echo "• Redis: localhost:6379"
    echo "• Grafana (if monitoring enabled): http://localhost:3001"
    echo ""
    echo "🔧 Useful Commands:"
    echo "=================="
    echo "• View logs: docker-compose logs -f [service_name]"
    echo "• Stop all services: docker-compose down"
    echo "• Restart services: docker-compose restart [service_name]"
    echo "• Run migrations: docker-compose run --rm migrations"
    echo "• Access database: docker-compose exec postgres psql -U ai_finance_user -d ai_finance_db"
    echo "• Access Redis CLI: docker-compose exec redis redis-cli"
    echo ""
    echo "📁 Project Structure:"
    echo "===================="
    echo "• app/ - FastAPI application code"
    echo "• migrations/ - Database migrations"
    echo "• tests/ - Test files"
    echo "• scripts/ - Utility scripts"
    echo "• logs/ - Application logs"
    echo "• data/ - Application data"
    echo ""
    echo "🚀 Next Steps:"
    echo "============="
    echo "1. Configure your API keys in .env file"
    echo "2. Test the API: curl http://localhost:8000/health"
    echo "3. View API docs: open http://localhost:8000/docs"
    echo "4. Start developing your features!"
}

# Main execution
main() {
    echo ""
    check_prerequisites
    echo ""
    setup_environment
    echo ""
    create_directories
    echo ""
    setup_python_env
    echo ""
    setup_database
    echo ""
    run_migrations
    echo ""
    start_services
    echo ""
    run_tests
    echo ""
    show_final_info
}

# Run main function
main "$@"