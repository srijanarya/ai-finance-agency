#!/bin/bash

echo "🔧 TELEGRAM API SETUP HELPER"
echo "============================"
echo ""
echo "📱 Get your credentials from: https://my.telegram.org/apps"
echo ""
echo "You should see:"
echo "  App api_id: [8-digit number]"
echo "  App api_hash: [32-character string]"
echo ""
echo "Enter your credentials below:"
echo ""

read -p "API ID (numbers only): " API_ID
read -p "API Hash (long string): " API_HASH  
read -p "Phone (+919876543210): " PHONE

# Update .env file
cat >> .env << EOF

# Telegram API Credentials (Updated)
TELEGRAM_API_ID=$API_ID
TELEGRAM_API_HASH=$API_HASH
TELEGRAM_PHONE=$PHONE
EOF

echo ""
echo "✅ Credentials saved!"
echo ""
echo "Your setup:"
echo "  API ID: $API_ID"
echo "  API Hash: ${API_HASH:0:10}..."
echo "  Phone: $PHONE"
echo ""
echo "🚀 Now run: python3 full_automation_bot.py"