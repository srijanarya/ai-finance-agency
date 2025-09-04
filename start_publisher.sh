#!/bin/bash
# Automated Publisher Startup Script

# Set working directory
cd /Users/srijan/ai-finance-agency

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Set Python path
export PYTHONPATH=/Users/srijan/ai-finance-agency:$PYTHONPATH

# Start the publisher
echo "🚀 Starting AI Finance Agency Automated Publisher..."
echo "📺 Channel: @AIFinanceNews2024"
echo "⏰ Time: $(date)"

python3 automated_publisher.py
