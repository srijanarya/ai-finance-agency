#!/bin/bash
# AI Finance Agency Task Manager - Status Script

echo "📊 AI Finance Task Manager Status"
echo "================================"

# Check if processes are running
if pgrep -f "distributed_task_manager.py" > /dev/null; then
    echo "✅ Task Manager: RUNNING"
else
    echo "❌ Task Manager: STOPPED"
fi

# Check Redis
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: RUNNING"
else
    echo "❌ Redis: STOPPED"
fi

echo ""
echo "📈 Resource Usage:"
if command -v top > /dev/null; then
    top -l 1 | head -10 | grep -E "(CPU usage|PhysMem)"
fi

echo ""
echo "🔍 Recent logs:"
tail -5 /Users/srijan/ai-finance-agency/logs/task_manager.log 2>/dev/null || echo "No logs found"
