#!/bin/bash

# TREUM AI Finance Platform - Development Environment Setup
# This script sets up the complete development environment

set -e

echo "🚀 Setting up TREUM AI Finance Platform Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
print_status "Checking prerequisites..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 22.11.0"
    exit 1
fi

NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check npm version
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

NPM_VERSION=$(npm --version)
print_status "npm version: $NPM_VERSION"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker"
    exit 1
fi

DOCKER_VERSION=$(docker --version)
print_status "Docker version: $DOCKER_VERSION"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose"
    exit 1
fi

COMPOSE_VERSION=$(docker-compose --version)
print_status "Docker Compose version: $COMPOSE_VERSION"

# Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Build all packages
print_status "Building all packages..."
npm run build
print_success "All packages built successfully"

# Run type checking
print_status "Running type checks..."
npm run typecheck
print_success "Type checking passed"

# Run linting
print_status "Running linting..."
npm run lint
print_success "Linting passed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from .env.example..."
    cp .env.example .env
    print_warning "Please review and update .env file with your configuration"
fi

# Start Docker services
print_status "Starting Docker infrastructure..."
docker-compose up -d postgres redis rabbitmq consul
print_success "Docker services started"

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Check service health
print_status "Checking service health..."
docker-compose ps

print_success "🎉 Development environment setup complete!"
echo ""
print_status "Next steps:"
echo "  1. Review and update .env file"
echo "  2. Run database migrations: npm run db:migrate"
echo "  3. Start development server: npm run dev"
echo "  4. Access services:"
echo "     - API: http://localhost:8000"
echo "     - RabbitMQ Management: http://localhost:15672"
echo "     - Consul UI: http://localhost:8500"
echo ""
print_status "For more information, see README.md"