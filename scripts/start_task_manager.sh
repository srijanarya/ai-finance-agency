#!/bin/bash
# AI Finance Agency Task Manager - Start Script

echo "🚀 Starting AI Finance Task Manager..."

# Check if Redis is running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "⚠️ Redis not running, starting..."
    if command -v brew > /dev/null; then
        brew services start redis
    elif command -v systemctl > /dev/null; then
        sudo systemctl start redis
    else
        redis-server --daemonize yes
    fi
    sleep 2
fi

# Start task manager
cd /Users/srijan/ai-finance-agency
python3 distributed_task_manager.py start &

echo "✅ Task Manager started successfully"
echo "📊 Monitor with: python3 distributed_task_manager.py dashboard"
