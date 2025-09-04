#!/bin/bash

echo "🚀 AI FINANCE AGENCY - QUICK API SETUP"
echo "======================================"
echo ""
echo "Opening all necessary setup pages in your browser..."
echo ""

# Open Twitter Developer Portal
echo "1. Opening Twitter/X Developer Portal..."
open "https://developer.twitter.com/en/portal/dashboard"
echo "   → Create app and get Consumer Key & Secret"
sleep 2

# Open Telegram Web for BotFather
echo ""
echo "2. Opening Telegram Web..."
open "https://web.telegram.org/"
echo "   → Search @BotFather"
echo "   → Send /newbot"
echo "   → Get bot token"
echo "   → Create channel @AIFinanceAgency"
sleep 2

# Open Anthropic Console
echo ""
echo "3. Opening Anthropic Console..."
open "https://console.anthropic.com/settings/keys"
echo "   → Get API key"
sleep 2

# Open Google AI Studio
echo ""
echo "4. Opening Google AI Studio..."
open "https://aistudio.google.com/apikey"
echo "   → Get API key"
sleep 2

echo ""
echo "======================================"
echo "✅ All pages opened!"
echo ""
echo "After getting the keys, run:"
echo "python3 update_keys.py"
echo ""