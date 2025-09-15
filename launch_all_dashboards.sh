#!/bin/bash

# AI Finance Agency - Unified Dashboard Launcher
# Starts all dashboards on different ports to avoid conflicts

echo "🚀 AI Finance Agency - Starting All Dashboards"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if port is available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 1
    else
        return 0
    fi
}

# Function to start dashboard
start_dashboard() {
    local script=$1
    local port=$2
    local name=$3
    
    if check_port $port; then
        echo -e "${GREEN}✓${NC} Starting $name on port $port..."
        if [[ "$script" == *.py ]]; then
            # Use virtual environment if available
            if [ -f "/Users/srijan/ai-finance-agency/venv/bin/python" ]; then
                FLASK_PORT=$port /Users/srijan/ai-finance-agency/venv/bin/python $script > /dev/null 2>&1 &
            else
                FLASK_PORT=$port python3 $script > /dev/null 2>&1 &
            fi
        else
            PORT=$port $script > /dev/null 2>&1 &
        fi
        echo -e "${GREEN}✓${NC} $name started: http://localhost:$port"
    else
        echo -e "${YELLOW}⚠${NC} Port $port is already in use, skipping $name"
    fi
}

# Main dashboards (already running, just display status)
echo "📊 Current Dashboard Status:"
echo "----------------------------"

if ! check_port 8080; then
    echo -e "${GREEN}✓${NC} Main Dashboard: http://localhost:8080 (already running)"
fi

if ! check_port 5002; then
    echo -e "${GREEN}✓${NC} Unified Demo: http://localhost:5002 (already running)"
fi

echo ""
echo "🚀 Starting Additional Dashboards:"
echo "----------------------------------"

# Start all other dashboards
start_dashboard "/Users/srijan/ai-finance-agency/.ignore/agency_dashboard.py" 8081 "Agency Dashboard"
sleep 1

start_dashboard "/Users/srijan/ai-finance-agency/.ignore/approval_dashboard.py" 8082 "Approval Dashboard"
sleep 1

start_dashboard "/Users/srijan/ai-finance-agency/.ignore/queue_monitor_dashboard.py" 5001 "Queue Monitor"
sleep 1

start_dashboard "/Users/srijan/ai-finance-agency/.ignore/debug_dashboard.py" 8083 "Debug Dashboard"
sleep 1

start_dashboard "/Users/srijan/ai-finance-agency/.ignore/simple_dashboard.py" 8084 "Simple Dashboard"
sleep 1

start_dashboard "/Users/srijan/ai-finance-agency/.ignore/posting_monitor.py" 8085 "Posting Monitor"
sleep 1

start_dashboard "/Users/srijan/ai-finance-agency/.ignore/monitor_bots.py" 5003 "Bot Monitor"
sleep 1

start_dashboard "/Users/srijan/ai-finance-agency/.ignore/monitor.py" 5004 "System Monitor"
sleep 1

# Start specialized dashboards
start_dashboard "/Users/srijan/ai-finance-agency/monitoring_dashboard.py" 5005 "Monitoring Dashboard"
sleep 1

start_dashboard "/Users/srijan/ai-finance-agency/realtime_news_monitor.py" 5006 "News Monitor"
sleep 1

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Dashboard Launch Complete!${NC}"
echo ""
echo "📊 Access your dashboards at:"
echo "------------------------------"
echo "Main Dashboard:        http://localhost:8080"
echo "Unified Demo:          http://localhost:5002"
echo "Agency Dashboard:      http://localhost:8081"
echo "Approval Dashboard:    http://localhost:8082"
echo "Queue Monitor:         http://localhost:5001"
echo "Debug Dashboard:       http://localhost:8083"
echo "Simple Dashboard:      http://localhost:8084"
echo "Posting Monitor:       http://localhost:8085"
echo "Bot Monitor:           http://localhost:5003"
echo "System Monitor:        http://localhost:5004"
echo "Monitoring Dashboard:  http://localhost:5005"
echo "News Monitor:          http://localhost:5006"
echo ""
echo "💡 To stop all dashboards, run: pkill -f 'python.*dashboard|python.*monitor'"