#!/bin/bash

# Docker Desktop Installation & N8N Setup Script for macOS
# This script guides you through installing Docker and setting up N8N

echo "================================================"
echo "🐳 Docker Desktop & N8N Setup for macOS"
echo "================================================"
echo ""

# Check if Docker is already installed
if command -v docker &> /dev/null; then
    echo "✅ Docker is already installed!"
    docker --version
else
    echo "❌ Docker is not installed."
    echo ""
    echo "📥 Please install Docker Desktop manually:"
    echo ""
    echo "1. Visit: https://www.docker.com/products/docker-desktop/"
    echo "2. Click 'Download for Mac'"
    echo "3. Choose the correct version:"
    echo "   - Mac with Intel chip → Intel version"
    echo "   - Mac with Apple Silicon (M1/M2/M3) → Apple Silicon version"
    echo "4. Open the downloaded .dmg file"
    echo "5. Drag Docker to Applications folder"
    echo "6. Launch Docker from Applications"
    echo "7. Complete the setup wizard"
    echo ""
    echo "After installation, run this script again."
    
    # Open Docker download page
    read -p "Open Docker download page in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://www.docker.com/products/docker-desktop/"
    fi
    
    exit 0
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "⚠️ Docker is installed but not running."
    echo "Please start Docker Desktop from Applications and try again."
    
    # Try to open Docker
    read -p "Try to open Docker Desktop? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open -a Docker
        echo "Waiting for Docker to start..."
        sleep 10
        
        # Check again
        if ! docker info &> /dev/null; then
            echo "Docker is still not running. Please ensure it's started and try again."
            exit 1
        fi
    else
        exit 1
    fi
fi

echo "✅ Docker is running!"
echo ""
echo "================================================"
echo "🚀 Setting up N8N with Docker Compose"
echo "================================================"
echo ""

# Navigate to project directory
cd /Users/srijan/ai-finance-agency

# Check if docker-compose file exists
if [ ! -f "docker-compose-n8n.yml" ]; then
    echo "❌ docker-compose-n8n.yml not found!"
    echo "Please ensure you're in the correct directory."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    if [ -f ".env.n8n" ]; then
        cp .env.n8n .env
        echo "✅ .env file created. Please edit it with your API keys:"
        echo "   vim .env"
        echo "   OR"
        echo "   nano .env"
        echo ""
        read -p "Edit .env file now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env
        fi
    else
        echo "❌ .env.n8n template not found!"
    fi
fi

echo ""
echo "================================================"
echo "📦 Starting N8N Services"
echo "================================================"
echo ""

# Pull Docker images
echo "Pulling Docker images..."
docker-compose -f docker-compose-n8n.yml pull

# Start services
echo "Starting services..."
docker-compose -f docker-compose-n8n.yml up -d

# Check if services are running
sleep 5
echo ""
echo "Checking service status..."
docker-compose -f docker-compose-n8n.yml ps

echo ""
echo "================================================"
echo "✅ Setup Complete!"
echo "================================================"
echo ""
echo "🌐 Access N8N at: http://localhost:5678"
echo ""
echo "Default credentials (from .env):"
echo "  Username: admin"
echo "  Password: (check your .env file)"
echo ""
echo "📊 Next steps:"
echo "1. Open http://localhost:5678 in your browser"
echo "2. Log in with credentials"
echo "3. Import workflows from n8n-workflows/ folder"
echo "4. Configure API credentials in N8N"
echo ""
echo "🛠️ Useful commands:"
echo "  View logs:    docker-compose -f docker-compose-n8n.yml logs -f"
echo "  Stop N8N:     docker-compose -f docker-compose-n8n.yml down"
echo "  Restart N8N:  docker-compose -f docker-compose-n8n.yml restart"
echo "  Check status: docker-compose -f docker-compose-n8n.yml ps"
echo ""
echo "================================================"

# Ask if user wants to open N8N
read -p "Open N8N in browser? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sleep 3  # Give N8N a moment to fully start
    open "http://localhost:5678"
fi