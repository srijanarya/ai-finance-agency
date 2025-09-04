#!/bin/bash

# AI Finance Agency Production Deployment Script
# ================================================

echo "🚀 AI FINANCE AGENCY - PRODUCTION DEPLOYMENT"
echo "=============================================="
echo ""

# Configuration
export FLASK_ENV=production
export PORT=5001

# Function to check if service is running
check_service() {
    local service=$1
    if pgrep -f "$service" > /dev/null; then
        echo "✅ $service is running"
        return 0
    else
        echo "❌ $service is not running"
        return 1
    fi
}

# Function to start service with PM2
start_with_pm2() {
    local name=$1
    local script=$2
    
    echo "🔄 Starting $name with PM2..."
    
    # Stop if already running
    pm2 stop $name 2>/dev/null || true
    pm2 delete $name 2>/dev/null || true
    
    # Start service
    pm2 start $script --name $name --interpreter python3 --watch false
    
    # Save PM2 configuration
    pm2 save
}

# 1. Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

# Check Python
if python3 --version > /dev/null 2>&1; then
    echo "✅ Python3 installed: $(python3 --version)"
else
    echo "❌ Python3 not found. Please install Python 3.8+"
    exit 1
fi

# Check n8n
if [ -f "$HOME/.n8n/database.sqlite" ]; then
    echo "✅ n8n database found"
else
    echo "⚠️  n8n database not found. Make sure n8n is properly configured"
fi

# Check PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi
echo "✅ PM2 installed"

# 2. Install Python dependencies
echo ""
echo "📦 Installing Python dependencies..."
pip3 install -q -r requirements.txt 2>/dev/null || {
    echo "⚠️  No requirements.txt found. Installing core dependencies..."
    pip3 install -q flask flask-cors requests yfinance pandas numpy telethon python-telegram-bot
}

# 3. Stop existing services
echo ""
echo "🛑 Stopping existing services..."
pkill -f n8n_webhook_endpoint 2>/dev/null || true
pkill -f multi_agent_orchestrator 2>/dev/null || true
pm2 stop all 2>/dev/null || true
echo "✅ Services stopped"

# 4. Start n8n (if not running)
echo ""
echo "🌐 Starting n8n..."
if ! pgrep -f "n8n" > /dev/null; then
    pm2 start n8n --name n8n-server -- start
    echo "✅ n8n started with PM2"
else
    echo "✅ n8n already running"
fi

# 5. Deploy webhook server
echo ""
echo "🎯 Deploying webhook server..."

# Create production config
cat > production_config.py << 'EOF'
# Production Configuration
import os

class Config:
    DEBUG = False
    TESTING = False
    PORT = int(os.environ.get('PORT', 5001))
    HOST = '0.0.0.0'
    
    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')
    
    # CORS settings
    CORS_ORIGINS = ['http://localhost:5678', 'http://127.0.0.1:5678']
    
    # Rate limiting
    RATE_LIMIT = '100 per minute'
    
    # Database
    DATABASE_PATH = 'data/agency.db'
    
    # Logging
    LOG_LEVEL = 'INFO'
    LOG_FILE = 'logs/production.log'
EOF

# Update webhook server for production
sed -i.bak 's/debug=True/debug=False/g' n8n_webhook_endpoint.py 2>/dev/null || true

# Start webhook server with PM2
start_with_pm2 "ai-webhook" "n8n_webhook_endpoint.py"

# 6. Deploy orchestrator
echo ""
echo "🤖 Deploying multi-agent orchestrator..."

# Create orchestrator wrapper for PM2
cat > orchestrator_daemon.py << 'EOF'
#!/usr/bin/env python3
"""
Orchestrator daemon for PM2
"""
import sys
sys.path.insert(0, '.')
from multi_agent_orchestrator import MultiAgentOrchestrator
import time
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/orchestrator.log'),
        logging.StreamHandler()
    ]
)

def run_continuous():
    """Run orchestrator in continuous mode"""
    orchestrator = MultiAgentOrchestrator()
    logging.info("🚀 Orchestrator started in continuous mode")
    
    while True:
        try:
            # Wait for webhooks - orchestrator handles internally
            time.sleep(30)
        except KeyboardInterrupt:
            logging.info("Orchestrator stopped")
            break
        except Exception as e:
            logging.error(f"Orchestrator error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    run_continuous()
EOF

# Start orchestrator with PM2
start_with_pm2 "ai-orchestrator" "orchestrator_daemon.py"

# 7. Setup monitoring
echo ""
echo "📊 Setting up monitoring..."

# Create health check script
cat > health_check.sh << 'EOF'
#!/bin/bash
# Health check for AI Finance Agency

echo "🏥 Health Check - $(date)"
echo "========================"

# Check webhook server
curl -s http://localhost:5001/webhook/n8n/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Webhook server: HEALTHY"
else
    echo "❌ Webhook server: DOWN"
    pm2 restart ai-webhook
fi

# Check n8n
curl -s http://localhost:5678 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ n8n: HEALTHY"
else
    echo "❌ n8n: DOWN"
    pm2 restart n8n-server
fi

# Check metrics
metrics=$(curl -s http://localhost:5001/webhook/n8n/metrics)
echo ""
echo "📈 Current Metrics:"
echo "$metrics" | python3 -m json.tool 2>/dev/null || echo "Unable to fetch metrics"
EOF

chmod +x health_check.sh

# Setup cron job for health checks
(crontab -l 2>/dev/null; echo "*/5 * * * * $(pwd)/health_check.sh >> logs/health.log 2>&1") | crontab -

# 8. Configure PM2 startup
echo ""
echo "⚙️ Configuring PM2 startup..."
pm2 startup
pm2 save

# 9. Create logs directory
mkdir -p logs

# 10. Display status
echo ""
echo "=============================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "📊 Service Status:"
pm2 list

echo ""
echo "🌐 Access Points:"
echo "   • n8n UI: http://localhost:5678"
echo "   • Webhook: http://localhost:5001/webhook/n8n/trigger"
echo "   • Metrics: http://localhost:5001/webhook/n8n/metrics"
echo "   • Health: http://localhost:5001/webhook/n8n/health"

echo ""
echo "📝 Useful Commands:"
echo "   • View logs: pm2 logs"
echo "   • Monitor: pm2 monit"
echo "   • Restart all: pm2 restart all"
echo "   • Stop all: pm2 stop all"
echo "   • Health check: ./health_check.sh"

echo ""
echo "🔒 Security Notes:"
echo "   1. Update SECRET_KEY in production_config.py"
echo "   2. Configure firewall rules for ports 5001 and 5678"
echo "   3. Set up SSL/TLS with nginx reverse proxy"
echo "   4. Enable authentication in n8n"

echo ""
echo "🚀 System is now running in production mode!"