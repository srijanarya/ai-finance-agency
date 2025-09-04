#!/usr/bin/env python3
"""
Share Helper - Provides messages to share in Telegram groups
"""

import random
from datetime import datetime
import pytz

def generate_share_messages():
    """Generate variety of messages to share"""
    
    messages = [
        {
            "tone": "helpful",
            "message": """Just discovered @AIFinanceNews2024

They verify every price from 3+ sources before posting!
No fake tips, only educational content.

Perfect for learning technical analysis 📊"""
        },
        {
            "tone": "excited", 
            "message": """Guys! Check out @AIFinanceNews2024

Finally a channel that:
✅ Verifies data from TradingView
✅ Cross-checks with Yahoo & NSE
✅ Only educational, no tips!

Free for first 500 members! 🚀"""
        },
        {
            "tone": "casual",
            "message": """For those asking about reliable data sources:

@AIFinanceNews2024 - multi-source verified

Better than random WhatsApp forwards 😅"""
        },
        {
            "tone": "analytical",
            "message": """Found an interesting channel: @AIFinanceNews2024

Their approach:
• Fetch from TradingView API
• Verify with Yahoo Finance  
• Cross-check NSE data
• Post only if all match

Educational content with proper disclaimers."""
        },
        {
            "tone": "testimonial",
            "message": """Been following @AIFinanceNews2024 since morning.

Every single price they posted matched my terminal!
They verify from multiple sources.

Worth checking out for educational content."""
        }
    ]
    
    return messages

def show_sharing_strategy():
    """Display complete sharing strategy"""
    
    ist = pytz.timezone('Asia/Kolkata')
    current_time = datetime.now(ist)
    
    print("📱 TELEGRAM GROUP SHARING STRATEGY")
    print("="*50)
    print(f"Time: {current_time.strftime('%I:%M %p IST')}")
    print("="*50)
    
    # Groups to target
    groups = {
        "High Priority": [
            "@IndianStockMarketLive",
            "@StockMarketIndiaOfficial",
            "@NSEBSETips"
        ],
        "Medium Priority": [
            "@IntradayTradingTips",
            "@BankNiftyOptionsTrading",
            "@NiftyFiftyTraders"
        ],
        "Low Priority": [
            "@SwingTradingIndia",
            "@TechnicalAnalysisIndia",
            "@OptionsStrategiesIndia"
        ]
    }
    
    messages = generate_share_messages()
    
    print("\n📝 STEP 1: JOIN THESE GROUPS")
    print("-"*40)
    for priority, group_list in groups.items():
        print(f"\n{priority}:")
        for group in group_list:
            print(f"  • {group}")
            print(f"    Link: https://t.me/{group[1:]}")
    
    print("\n📤 STEP 2: SHARE MESSAGES")
    print("-"*40)
    print("\nUse different messages for each group:")
    
    for i, msg in enumerate(messages[:3], 1):
        print(f"\n🔸 Message {i} ({msg['tone'].upper()}):")
        print("-"*30)
        print(msg['message'])
        print("-"*30)
    
    print("\n⏰ STEP 3: TIMING")
    print("-"*40)
    print("Best times to share:")
    print("• 9:00 AM - Market opening")
    print("• 12:30 PM - Lunch break")
    print("• 3:30 PM - After market")
    print("• 8:00 PM - Evening traders")
    
    print("\n✅ STEP 4: ENGAGE")
    print("-"*40)
    print("After sharing:")
    print("1. Reply to questions genuinely")
    print("2. Share educational insights")
    print("3. Don't spam or oversell")
    print("4. Build trust gradually")
    
    print("\n🎯 TARGET")
    print("-"*40)
    print("Goal: 500 subscribers")
    print("Strategy: Share in 3 groups every 2 hours")
    print("Expected: 20-50 subscribers per day")
    print("Timeline: 10-25 days to reach 500")
    
    print("\n" + "="*50)
    print("📋 COPY A MESSAGE AND START SHARING NOW!")
    print("="*50)
    
    # Show one random message to copy
    selected = random.choice(messages)
    print(f"\n📌 MESSAGE TO COPY NOW:")
    print("="*40)
    print(selected['message'])
    print("="*40)

if __name__ == "__main__":
    show_sharing_strategy()