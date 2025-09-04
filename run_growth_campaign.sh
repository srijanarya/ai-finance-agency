#!/bin/bash
# Growth Campaign Runner - Manages all growth activities

echo "🚀 AI FINANCE AGENCY - GROWTH CAMPAIGN"
echo "======================================"
echo "Target: 500 Telegram Subscribers"
echo "Strategy: Verified Data + Education"
echo "======================================"

# Function to post content
post_content() {
    echo "📝 Posting verified content..."
    python3 quick_launch.py
    echo "✅ Content posted!"
}

# Function to show sharing instructions
show_sharing() {
    echo ""
    echo "📢 TIME TO SHARE IN GROUPS!"
    echo "============================"
    python3 share_helper.py | tail -n 10
}

# Main loop
while true; do
    # Get current hour
    HOUR=$(date +%H)
    
    # Check if it's a good time to post (9AM, 12PM, 3PM, 6PM, 9PM IST)
    if [[ "$HOUR" == "09" ]] || [[ "$HOUR" == "12" ]] || [[ "$HOUR" == "15" ]] || [[ "$HOUR" == "18" ]] || [[ "$HOUR" == "21" ]]; then
        post_content
        show_sharing
        
        # Wait 59 minutes to avoid double posting
        echo "⏰ Waiting for next posting window..."
        sleep 3540
    else
        echo "⏰ Current hour: $HOUR:00 - Next post at scheduled time"
        sleep 600  # Check every 10 minutes
    fi
done