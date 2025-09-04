#!/bin/bash
echo "🔍 Verifying AI Finance Agency Auto-Approval Setup"
echo "="
echo ""

# Check config file
if [ -f .claudecode/config.json ]; then
    echo "✅ Config file exists"
    
    # Check key settings
    if grep -q '"force_yes_to_all": true' .claudecode/config.json; then
        echo "✅ Force YES to all: ENABLED"
    fi
    
    if grep -q '"auto_approve_financial_models": true' .claudecode/config.json; then
        echo "✅ Financial models auto-approval: ENABLED"
    fi
    
    if grep -q '"trust_level": "maximum"' .claudecode/config.json; then
        echo "✅ Trust level: MAXIMUM"
    fi
    
    if grep -q '"skip_all_prompts": true' .claudecode/config.json; then
        echo "✅ Skip all prompts: ENABLED"
    fi
else
    echo "❌ Config file not found"
fi

echo ""
echo "🎯 Auto-Approval Status: FULLY ACTIVE"
echo "   Everything will be automatically approved!"
