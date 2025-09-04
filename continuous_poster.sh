#!/bin/bash
# Continuous Poster - Keeps channel active with verified content

echo "🚀 CONTINUOUS POSTING ACTIVATED"
echo "================================"
echo "Target: 500 Subscribers"
echo "Strategy: Verified content every 2 hours"
echo "================================"

while true; do
    # Get current hour
    HOUR=$(date +%H)
    
    echo ""
    echo "⏰ Current time: $(date '+%I:%M %p')"
    
    # Post content
    echo "📝 Posting verified content..."
    python3 quick_launch.py
    
    echo ""
    echo "✅ Content posted successfully!"
    echo ""
    echo "📊 Next post in 2 hours..."
    echo "================================"
    
    # Share reminder every 4 hours
    if [ $((HOUR % 4)) -eq 0 ]; then
        echo ""
        echo "📢 TIME TO SHARE IN GROUPS!"
        echo "Copy this message:"
        echo "================================"
        echo "📊 For serious traders only!"
        echo ""
        echo "@AIFinanceNews2024"
        echo ""
        echo "• Multi-source verified data"
        echo "• Educational content only"
        echo "• No fake tips"
        echo ""
        echo "Join: https://t.me/AIFinanceNews2024"
        echo "================================"
    fi
    
    # Wait 2 hours
    sleep 7200
done