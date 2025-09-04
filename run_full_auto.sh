#!/bin/bash

echo "🚀 FULL AUTOMATION LAUNCHER"
echo "==========================="
echo ""

# Check if credentials exist
if grep -q "TELEGRAM_API_ID=" .env && grep -q "TELEGRAM_API_HASH=" .env; then
    echo "✅ Credentials found!"
    echo ""
    echo "Starting full automation bot..."
    echo "This will:"
    echo "• Search for trading groups"
    echo "• Join them automatically"
    echo "• Post your channel every hour"
    echo "• Run 24/7 without manual work"
    echo ""
    echo "Starting in 5 seconds..."
    sleep 5
    
    python3 full_automation_bot.py
else
    echo "❌ No API credentials found!"
    echo ""
    echo "Please run: ./setup_api.sh"
    echo "Or manually add to .env file:"
    echo "  TELEGRAM_API_ID=your_id"
    echo "  TELEGRAM_API_HASH=your_hash"
    echo "  TELEGRAM_PHONE=your_phone"
fi