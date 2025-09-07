#!/bin/bash

# AI Finance Agency - Quick Start Script
# This script starts the AI Finance Agency system locally

echo "================================================"
echo "AI FINANCE AGENCY - STARTUP SCRIPT"
echo "================================================"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/update dependencies
echo "Checking dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt 2>/dev/null || {
    echo "Installing core dependencies only..."
    pip install -q flask flask-cors aiohttp yfinance feedparser pandas numpy python-dotenv
}

# Create necessary directories
mkdir -p logs data posts/visuals templates static secure_credentials

# Check for .env file
if [ ! -f ".env" ]; then
    echo "Creating default .env file..."
    cat > .env << EOF
# AI Finance Agency Environment Configuration
FLASK_ENV=development
DASHBOARD_SECRET_KEY=dev-secret-key-change-in-production
LOG_LEVEL=INFO
LOG_FILE=logs/app.log

# Database
DATABASE_URL=sqlite:///data/research.db

# API Keys (Add your keys here)
ALPHA_VANTAGE_API_KEY=
FINNHUB_API_KEY=
NEWS_API_KEY=
OPENAI_API_KEY=

# Telegram Configuration
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=

# Twitter Configuration
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=

# LinkedIn Configuration
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
EOF
    echo ".env file created. Please add your API keys."
fi

# Start services
echo ""
echo "Starting services..."
echo "================================================"

# Kill any existing processes on port 8088
lsof -ti:8088 | xargs kill -9 2>/dev/null

# Start Dashboard
echo "1. Starting Dashboard on http://localhost:8088"
python3 dashboard.py &
DASHBOARD_PID=$!

# Give dashboard time to start
sleep 2

# Optional: Start Master Control System
read -p "Start Master Control System? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "2. Starting Master Control System..."
    python3 master_control_system.py &
    MASTER_PID=$!
fi

echo ""
echo "================================================"
echo "SYSTEM STARTED SUCCESSFULLY!"
echo "================================================"
echo "Dashboard: http://localhost:8088"
echo ""
echo "Press Ctrl+C to stop all services"
echo "================================================"

# Function to handle shutdown
cleanup() {
    echo ""
    echo "Shutting down services..."
    kill $DASHBOARD_PID 2>/dev/null
    [ ! -z "$MASTER_PID" ] && kill $MASTER_PID 2>/dev/null
    echo "Shutdown complete."
    exit 0
}

# Set up trap for clean shutdown
trap cleanup SIGINT SIGTERM

# Keep script running
wait