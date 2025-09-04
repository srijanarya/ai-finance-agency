#!/bin/bash

echo "🤖 TELEGRAM BOT RUNNER"
echo "====================="
echo ""
echo "This bot will:"
echo "1. Post educational content every 2 hours"
echo "2. Keep your channel active"
echo "3. Build credibility with verified data"
echo ""
echo "Starting in 5 seconds..."
sleep 5

# Run the auto-poster
echo "3" | python3 telegram_simple_bot.py &
BOT_PID=$!

echo ""
echo "✅ Bot is running in background (PID: $BOT_PID)"
echo ""
echo "📱 While bot runs, join these groups:"
echo "• Search: 'trading chat india'"
echo "• Search: 'stock discussion'"
echo "• Search: 'nifty chat'"
echo ""
echo "📝 Share this message in groups:"
echo "================================"
echo "@AIFinanceNews2024"
echo ""
echo "Multi-source verified data:"
echo "• TradingView ✅"
echo "• Yahoo Finance ✅"
echo "• NSE Official ✅"
echo ""
echo "https://t.me/AIFinanceNews2024"
echo "================================"
echo ""
echo "Press Ctrl+C to stop the bot"

wait $BOT_PID