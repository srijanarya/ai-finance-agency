#!/bin/bash

# B-MAD Method Activation Script for AI Finance Agency
# This script manually activates the B-MAD method for this project

echo "🚀 Activating B-MAD Method for AI Finance Agency..."

# Check if we're in the right directory
if [ ! -d "bmad-method/bmad-method" ]; then
    echo "❌ Error: bmad-method directory not found. Are you in the project root?"
    exit 1
fi

# Navigate to b-mad directory and run installer
cd bmad-method/bmad-method

echo "📦 Installing B-MAD agents and tools..."
echo "/Users/srijan/ai-finance-agency" | node tools/installer/bin/bmad.js install

echo "✅ B-MAD Method activated successfully!"
echo "💡 Tip: This should happen automatically when you start Claude Code in this project"

# Return to project root
cd ../..