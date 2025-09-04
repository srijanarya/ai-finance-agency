#!/bin/bash

echo "🔧 TELEGRAM API QUICK SETUP"
echo "============================"
echo ""
echo "Opening https://my.telegram.org/ ..."
echo ""

# Open the website
open "https://my.telegram.org/" 2>/dev/null || xdg-open "https://my.telegram.org/" 2>/dev/null || echo "Please open: https://my.telegram.org/"

echo "📱 STEPS TO GET API CREDENTIALS:"
echo "================================"
echo ""
echo "1. Login with your phone number"
echo "2. Click 'API development tools'"
echo "3. Fill the form:"
echo "   • App title: Trading Bot"
echo "   • Short name: tradingbot"
echo "   • Platform: Other"
echo "   • Description: Personal bot"
echo ""
echo "4. You'll get:"
echo "   • api_id (numbers)"
echo "   • api_hash (long string)"
echo ""
echo "5. Press Enter when ready..."
read

echo ""
echo "Enter your api_id: "
read API_ID

echo "Enter your api_hash: "
read API_HASH

echo "Enter your phone (+91XXXXXXXXXX): "
read PHONE

# Add to .env
echo "" >> .env
echo "# Telegram API credentials" >> .env
echo "TELEGRAM_API_ID=$API_ID" >> .env
echo "TELEGRAM_API_HASH=$API_HASH" >> .env
echo "TELEGRAM_PHONE=$PHONE" >> .env

echo ""
echo "✅ Credentials saved to .env!"
echo ""
echo "Now run: python3 telegram_power_bot.py"
echo "Select option 1 for AUTO MODE!"
echo ""