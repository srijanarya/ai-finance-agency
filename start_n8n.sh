#!/bin/bash

echo "🚀 Starting n8n for AI Finance Agency"
echo "====================================="

# Set environment variables
export N8N_PORT=5678
export N8N_PROTOCOL=http
export N8N_HOST=localhost
export WEBHOOK_URL=http://localhost:5678
export N8N_BASIC_AUTH_ACTIVE=false
export EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
export EXECUTIONS_DATA_SAVE_ON_ERROR=all
export N8N_LOG_LEVEL=info
export N8N_METRICS=true

# Create data directory if not exists
mkdir -p ~/.n8n/ai-finance-agency

echo ""
echo "📋 Configuration:"
echo "  • Port: 5678"
echo "  • URL: http://localhost:5678"
echo "  • Data: ~/.n8n/ai-finance-agency"
echo ""
echo "✅ Starting n8n..."
echo "Press Ctrl+C to stop"
echo ""

# Start n8n
npx n8n start