#!/bin/bash
# Launch Multi-Agent Orchestrator in background

echo "🚀 Launching Multi-Agent Finance Orchestrator"
echo "============================================"

# Activate virtual environment if exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Run orchestrator in continuous mode
nohup python3 multi_agent_orchestrator.py << EOF > orchestrator.log 2>&1 &
3
EOF

# Store PID
echo $! > orchestrator.pid

echo "✅ Orchestrator running in background"
echo "📄 PID: $(cat orchestrator.pid)"
echo "📊 View logs: tail -f orchestrator.log"
echo "🛑 Stop: kill $(cat orchestrator.pid)"
echo ""
echo "The multi-agent system is now:"
echo "  • Generating content every 30 minutes"
echo "  • Using 8 specialized agents"
echo "  • Posting to all configured platforms"
echo "  • Running 24/7 autonomously"