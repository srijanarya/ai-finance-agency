#!/bin/bash
# AI Finance Agency Task Manager - Stop Script

echo "🛑 Stopping AI Finance Task Manager..."

# Kill task manager processes
pkill -f "distributed_task_manager.py"

echo "✅ Task Manager stopped"
