#!/bin/bash
# Session Manager - Maintains context across conversations

PROJECT_DIR="/Users/srijan/ai-finance-agency"
cd $PROJECT_DIR

echo "🧠 AI FINANCE AGENCY - SESSION MANAGER"
echo "======================================"
echo ""
echo "📋 Current Context:"
cat PROJECT_BRAIN.md | head -20
echo ""
echo "🤖 Starting Autonomous Work..."
python3 autonomous_worker.py
echo ""
echo "✅ Session logged. Context preserved."
echo ""
echo "📝 Next conversation: Just run 'bash session_manager.sh' to continue!"
