#!/bin/bash

# TREUM AI Finance Platform - Dockerfile Generator Script

set -e

SERVICES=("trading" "payment" "signals" "education")
PORTS=(3002 3003 3004 3005)

BASE_DOCKERFILE="/Users/srijan/ai-finance-agency/services/api-gateway/Dockerfile"

for i in "${!SERVICES[@]}"; do
  SERVICE="${SERVICES[$i]}"
  PORT="${PORTS[$i]}"
  SERVICE_DIR="/Users/srijan/ai-finance-agency/services/${SERVICE}"
  
  echo "Generating Dockerfile for ${SERVICE} service on port ${PORT}..."
  
  # Create Dockerfile for each service
  sed "s/api-gateway/${SERVICE}/g; s/API Gateway/${SERVICE^}/g; s/3000/${PORT}/g" \
    "${BASE_DOCKERFILE}" > "${SERVICE_DIR}/Dockerfile"
  
  echo "✓ Created ${SERVICE_DIR}/Dockerfile"
done

echo "All Dockerfiles generated successfully!"