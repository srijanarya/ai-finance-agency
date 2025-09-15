#!/bin/bash

echo "🔧 Docker Recovery Script"
echo "========================="

# Step 1: Kill all Docker processes
echo "1. Killing stuck Docker processes..."
pkill -f Docker 2>/dev/null
pkill -f docker 2>/dev/null
sleep 2

# Step 2: Clean Docker temporary files
echo "2. Cleaning Docker temporary files..."
rm -rf ~/Library/Containers/com.docker.docker/Data/vms 2>/dev/null
rm -rf ~/Library/Containers/com.docker.docker/Data/com.docker.driver.amd64-linux 2>/dev/null

# Step 3: Reset Docker socket
echo "3. Resetting Docker socket..."
rm -f ~/.docker/run/docker.sock 2>/dev/null

# Step 4: Start Docker Desktop
echo "4. Starting Docker Desktop..."
open -a Docker

# Step 5: Wait for Docker to be ready
echo "5. Waiting for Docker daemon to start..."
for i in {1..30}; do
    echo -n "Attempt $i/30: "
    if docker ps >/dev/null 2>&1; then
        echo "✅ Docker is ready!"
        docker version
        echo ""
        echo "Docker Desktop is now running! You can execute:"
        echo "  ./scripts/bmad-deployment.sh"
        exit 0
    else
        echo "Waiting..."
        sleep 5
    fi
done

echo "❌ Docker failed to start after 2.5 minutes"
echo "Please try:"
echo "1. Manually restart your Mac"
echo "2. Reinstall Docker Desktop from https://www.docker.com/products/docker-desktop/"
exit 1
