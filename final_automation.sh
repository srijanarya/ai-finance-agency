#!/bin/bash

echo "🚀 FINAL TELEGRAM AUTOMATION"
echo "============================"
echo ""
echo "Starting all automation systems..."
echo ""

# Keep channel active with posts
echo "✅ Starting channel poster..."
python3 telegram_simple_bot.py &
PID1=$!
echo "   Channel poster PID: $PID1"

# Run group finder and sharer
echo "✅ Starting group finder..."
python3 instant_automation.py &
PID2=$!
echo "   Group finder PID: $PID2"

# Post educational content
echo "✅ Starting educational poster..."
python3 telegram_bot_without_api.py &
PID3=$!
echo "   Educational poster PID: $PID3"

echo ""
echo "============================"
echo "✅ ALL SYSTEMS RUNNING!"
echo "============================"
echo ""
echo "📊 What's happening now:"
echo "• Posting to channel every 30 minutes"
echo "• Finding and opening groups"
echo "• Sharing your channel link"
echo "• Running 24/7 automatically"
echo ""
echo "📱 Your channel: @AIFinanceNews2024"
echo "🔗 Link: https://t.me/AIFinanceNews2024"
echo ""
echo "Press Ctrl+C to stop all bots"
echo ""

# Keep script running
wait