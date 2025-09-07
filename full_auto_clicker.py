#!/usr/bin/env python3
"""
Full Auto Clicker - One click to start posting
"""

import os
import sys
import time
import random
from telethon.sync import TelegramClient
from dotenv import load_dotenv
from datetime import datetime

# Load environment
load_dotenv()

# Get credentials
api_id = os.getenv('TELEGRAM_API_ID')
api_hash = os.getenv('TELEGRAM_API_HASH')
channel = '@AIFinanceNews2024'

if not api_id or not api_hash:
    print("Error: Set TELEGRAM_API_ID and TELEGRAM_API_HASH in .env")
    sys.exit(1)

# Content templates
CONTENTS = [
    """📊 **MARKET INSIGHT** 📊

The key to successful trading isn't predicting the future - it's managing risk in the present.

✅ Set stop losses
✅ Size positions properly  
✅ Follow your plan

Success comes from discipline, not luck!

🔔 @AIFinanceNews2024 #Trading #RiskManagement""",

    """🎯 **TRADING TIP** 🎯

Never enter a trade without knowing:
1. Your entry point
2. Your stop loss
3. Your profit target

Risk-Reward ratio should be minimum 1:2

Plan the trade, trade the plan!

📈 @AIFinanceNews2024 #TradingStrategy""",

    """💡 **MARKET WISDOM** 💡

"The stock market is a device for transferring money from the impatient to the patient."
- Warren Buffett

Patience + Discipline = Profits

Follow @AIFinanceNews2024 for daily insights!""",

    """📚 **LEARN & EARN** 📚

Understanding Moving Averages:
• 50 DMA: Short-term trend
• 200 DMA: Long-term trend
• Golden Cross: 50 crosses above 200 (Bullish)
• Death Cross: 50 crosses below 200 (Bearish)

Knowledge is your best investment!

@AIFinanceNews2024 #TechnicalAnalysis""",

    """⚡ **QUICK MARKET UPDATE** ⚡

Key Sectors to Watch:
✅ IT - Q3 earnings season
✅ Banking - Rate cycle impact
✅ Auto - Festival demand
✅ FMCG - Rural recovery

Stay informed, stay ahead!

📊 @AIFinanceNews2024 #StockMarket"""
]

def post_now():
    """Post immediately and schedule next"""
    print("\n🚀 Starting Auto-Poster...")
    
    try:
        with TelegramClient('srijan_session', api_id, api_hash) as client:
            # Pick random content
            content = random.choice(CONTENTS)
            
            # Send message
            result = client.send_message(channel, content)
            
            print(f"✅ Posted at {datetime.now().strftime('%H:%M:%S')}")
            print(f"   Message ID: {result.id}")
            print(f"   Content: {content[:50]}...")
            
            return True
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run continuous posting"""
    print("=" * 60)
    print("🤖 FULL AUTO TELEGRAM POSTER")
    print("=" * 60)
    print(f"Channel: {channel}")
    print("Starting immediate posting...")
    
    post_count = 0
    
    while True:
        if post_now():
            post_count += 1
            print(f"📮 Total posts: {post_count}")
            
            # Wait 20-30 minutes
            wait = random.randint(1200, 1800)
            print(f"⏰ Next post in {wait//60} minutes...")
            print("-" * 40)
            time.sleep(wait)
        else:
            print("Retrying in 5 minutes...")
            time.sleep(300)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Auto-poster stopped!")