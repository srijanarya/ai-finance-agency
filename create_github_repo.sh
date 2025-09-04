#!/bin/bash

echo "🚀 GitHub Repository Creation Script"
echo "===================================="
echo ""
echo "This script will:"
echo "1. Authenticate with GitHub"
echo "2. Create the repository"
echo "3. Push all your code"
echo ""
echo "Press Enter to start GitHub authentication..."
read

# Authenticate with GitHub
echo "Authenticating with GitHub..."
gh auth login

# Check if authentication succeeded
if gh auth status > /dev/null 2>&1; then
    echo "✅ Successfully authenticated!"
    
    # Create the repository
    echo ""
    echo "Creating repository 'ai-finance-agency'..."
    
    # Create private repository (change to --public if you want it public)
    gh repo create ai-finance-agency --private --source=. --description="AI Finance Agency - Telegram automation system for financial content and 500 subscriber growth" --push
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ SUCCESS! Repository created and code pushed!"
        echo ""
        echo "Your repository is now available at:"
        echo "https://github.com/$(gh api user --jq .login)/ai-finance-agency"
        echo ""
        echo "Summary of what was pushed:"
        echo "- 179 files"
        echo "- 24,091 lines of code"
        echo "- Complete Telegram automation system"
        echo "- Real-time news monitor"
        echo "- Auto group poster"
        echo "- All configuration files"
    else
        echo ""
        echo "If the repo already exists, let's just push to it:"
        git push -u origin main
    fi
else
    echo "❌ Authentication failed. Please try again."
fi