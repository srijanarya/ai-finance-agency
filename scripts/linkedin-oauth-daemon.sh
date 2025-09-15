#!/bin/bash
#
# LinkedIn OAuth Token Refresh Daemon
# Automatically manages LinkedIn OAuth tokens
#

# Set working directory
cd /Users/srijan/ai-finance-agency

# Create logs directory if it doesn't exist
mkdir -p data/logs
mkdir -p data/notifications

# Function to check if daemon is running
check_daemon() {
    if pgrep -f "linkedin_oauth_refresh.py daemon" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to start daemon
start_daemon() {
    if check_daemon; then
        echo "✅ LinkedIn OAuth daemon is already running"
    else
        echo "🚀 Starting LinkedIn OAuth daemon..."
        nohup python3 linkedin_oauth_refresh.py daemon > data/logs/oauth_daemon.log 2>&1 &
        echo $! > data/linkedin_oauth_daemon.pid
        sleep 2
        if check_daemon; then
            echo "✅ Daemon started successfully (PID: $(cat data/linkedin_oauth_daemon.pid))"
        else
            echo "❌ Failed to start daemon"
            exit 1
        fi
    fi
}

# Function to stop daemon
stop_daemon() {
    if [ -f data/linkedin_oauth_daemon.pid ]; then
        PID=$(cat data/linkedin_oauth_daemon.pid)
        if kill -0 $PID 2>/dev/null; then
            echo "🛑 Stopping LinkedIn OAuth daemon (PID: $PID)..."
            kill $PID
            rm data/linkedin_oauth_daemon.pid
            echo "✅ Daemon stopped"
        else
            echo "⚠️ Daemon not running (stale PID file)"
            rm data/linkedin_oauth_daemon.pid
        fi
    else
        echo "⚠️ No daemon PID file found"
    fi
}

# Function to restart daemon
restart_daemon() {
    stop_daemon
    sleep 2
    start_daemon
}

# Function to show daemon status
status_daemon() {
    echo "📊 LinkedIn OAuth Daemon Status"
    echo "================================"
    
    if check_daemon; then
        echo "✅ Daemon is running"
        if [ -f data/linkedin_oauth_daemon.pid ]; then
            echo "   PID: $(cat data/linkedin_oauth_daemon.pid)"
        fi
    else
        echo "❌ Daemon is not running"
    fi
    
    echo ""
    echo "📋 Token Status:"
    python3 linkedin_oauth_refresh.py status
    
    echo ""
    echo "📄 Recent Logs:"
    if [ -f data/logs/linkedin_oauth.log ]; then
        tail -5 data/logs/linkedin_oauth.log
    else
        echo "No logs available"
    fi
}

# Function to show logs
show_logs() {
    if [ -f data/logs/oauth_daemon.log ]; then
        echo "📄 LinkedIn OAuth Daemon Logs"
        echo "=============================="
        tail -f data/logs/oauth_daemon.log
    else
        echo "❌ No log file found"
    fi
}

# Main script logic
case "$1" in
    start)
        start_daemon
        ;;
    stop)
        stop_daemon
        ;;
    restart)
        restart_daemon
        ;;
    status)
        status_daemon
        ;;
    logs)
        show_logs
        ;;
    check)
        echo "🔍 Running manual token check..."
        python3 linkedin_oauth_refresh.py check
        ;;
    refresh)
        echo "🔄 Forcing token refresh..."
        python3 linkedin_oauth_refresh.py refresh
        ;;
    *)
        echo "LinkedIn OAuth Token Management Daemon"
        echo "======================================"
        echo ""
        echo "Usage: $0 {start|stop|restart|status|logs|check|refresh}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the OAuth daemon"
        echo "  stop    - Stop the OAuth daemon"
        echo "  restart - Restart the OAuth daemon"
        echo "  status  - Show daemon and token status"
        echo "  logs    - Show daemon logs (live)"
        echo "  check   - Run manual token check"
        echo "  refresh - Force token refresh"
        echo ""
        exit 1
        ;;
esac

exit 0