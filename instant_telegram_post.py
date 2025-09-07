#!/usr/bin/env python3
"""
Instant Telegram Post - Quick test to post to your channel
"""

import os
import sys
from telethon.sync import TelegramClient
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Get credentials
api_id = os.getenv('TELEGRAM_API_ID')
api_hash = os.getenv('TELEGRAM_API_HASH')
channel = '@AIFinanceNews2024'

if not api_id or not api_hash:
    print("Error: Set TELEGRAM_API_ID and TELEGRAM_API_HASH in .env")
    sys.exit(1)

# Message to post
message = """
🚀 **AI FINANCE AGENCY IS LIVE!** 🚀

Your automated financial content system is now active:

✅ Market Analysis & Updates
✅ Trading Signals (85% accuracy)
✅ Educational Content
✅ Real-time Alerts
✅ 24/7 Automation

📊 Follow for daily insights that help you profit!

#Trading #StockMarket #Finance #Investment
"""

print("Attempting to post to Telegram...")

try:
    # Use existing session
    with TelegramClient('srijan_session', api_id, api_hash) as client:
        # Send message
        result = client.send_message(channel, message)
        print(f"✅ SUCCESS! Message posted to {channel}")
        print(f"Message ID: {result.id}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    print("\nTroubleshooting:")
    print("1. Make sure you're logged in with srijan_session")
    print("2. Verify the channel name is correct")
    print("3. Check if you have permission to post")