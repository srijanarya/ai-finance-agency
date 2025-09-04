#!/usr/bin/env python3
"""
Telegram Group Manager - Automated sharing in relevant groups
Your personal social media manager for Telegram
"""

import asyncio
import time
from datetime import datetime
import random
import os
from typing import List, Dict
import json

class TelegramGroupManager:
    def __init__(self):
        # Top Indian Trading/Finance Telegram Groups to join
        self.target_groups = [
            # Public groups (you can search and join these)
            "@IndianStockMarketLive",
            "@StockMarketIndiaOfficial", 
            "@NSEBSETips",
            "@IntradayTradingTips",
            "@EquityResearch",
            "@BankNiftyOptionsTrading",
            "@NiftyFiftyTraders",
            "@IndianIPONews",
            "@ShareMarketGyan",
            "@TradingGuruIndia",
            "@StockMarketCollegeIndia",
            "@OptionsStrategiesIndia",
            "@SwingTradingIndia",
            "@TechnicalAnalysisIndia",
            "@MutualFundsIndia",
            "@CryptoIndiaOfficial",
            "@ForexTradingIndia",
            "@CommodityTradingIndia",
            "@FundamentalAnalysisIndia",
            "@DerivativesTradingIndia"
        ]
        
        # Different message templates for variety
        self.message_templates = [
            {
                "type": "helpful",
                "message": """Friends, I found something useful!

There's a new Telegram channel providing FREE real-time market data using TradingView API.

They verify every price before posting (no fake tips!)

Check it out: @AIFinanceNews2024

Currently free for first 500 members."""
            },
            {
                "type": "question",
                "message": """Anyone here using TradingView for live data?

Found this channel that posts verified TradingView data for free: @AIFinanceNews2024

Is it reliable? They cross-check with multiple sources before posting."""
            },
            {
                "type": "share_success",
                "message": """Got this from @AIFinanceNews2024 this morning:

HDFCBANK was showing RSI below 30 - bought at open.
Already up 1.2%! 

They use AI + TradingView. Worth following."""
            },
            {
                "type": "casual",
                "message": """Yo! For those who keep asking for real-time prices...

@AIFinanceNews2024 - posts live verified data

Better than random WhatsApp forwards 😅"""
            },
            {
                "type": "professional",
                "message": """For serious traders:

New channel with institutional-grade data:
✓ TradingView integration
✓ Real-time verification
✓ No pump & dump

@AIFinanceNews2024 (Free for early joiners)"""
            },
            {
                "type": "fomo",
                "message": """Guys quick update!

That AI finance channel I mentioned yesterday (@AIFinanceNews2024) is at 450/500 free members.

After 500 they're charging ₹2999/month.

Join now if interested!"""
            }
        ]
        
        # Track where we've posted
        self.posted_groups = []
        self.conversion_tracking = {}
    
    def get_join_links(self) -> List[str]:
        """Generate join links for groups"""
        links = []
        for group in self.target_groups:
            group_name = group.replace("@", "")
            links.append(f"https://t.me/{group_name}")
        return links
    
    def create_sharing_schedule(self) -> List[Dict]:
        """Create optimized posting schedule"""
        schedule = []
        
        # Best times to post (IST)
        posting_windows = [
            {"start": 9, "end": 10, "desc": "Market opening"},
            {"start": 12, "end": 13, "desc": "Lunch break"},
            {"start": 15, "end": 16, "desc": "Market closing"},
            {"start": 20, "end": 21, "desc": "Evening analysis"}
        ]
        
        for window in posting_windows:
            # Select 5 groups randomly for each window
            selected_groups = random.sample(self.target_groups, min(5, len(self.target_groups)))
            
            for group in selected_groups:
                if group not in self.posted_groups:
                    # Select appropriate message
                    if window["desc"] == "Market opening":
                        msg = random.choice([m for m in self.message_templates if m["type"] in ["helpful", "professional"]])
                    elif window["desc"] == "Lunch break":
                        msg = random.choice([m for m in self.message_templates if m["type"] in ["casual", "question"]])
                    elif window["desc"] == "Market closing":
                        msg = random.choice([m for m in self.message_templates if m["type"] in ["share_success", "fomo"]])
                    else:
                        msg = random.choice(self.message_templates)
                    
                    schedule.append({
                        "group": group,
                        "time_window": window["desc"],
                        "hour": window["start"],
                        "message": msg["message"],
                        "type": msg["type"]
                    })
                    
                    self.posted_groups.append(group)
        
        return schedule
    
    def generate_manual_instructions(self) -> str:
        """Generate step-by-step instructions for manual sharing"""
        schedule = self.create_sharing_schedule()
        
        instructions = """
📱 TELEGRAM GROUP SHARING GUIDE
================================

STEP 1: JOIN THESE GROUPS FIRST
--------------------------------"""
        
        for i, group in enumerate(self.target_groups[:10], 1):
            instructions += f"\n{i}. {group}"
            instructions += f"\n   Link: https://t.me/{group.replace('@', '')}"
        
        instructions += """

STEP 2: SHARING SCHEDULE
------------------------
⏰ Follow this timing for maximum engagement:
"""
        
        current_time = ""
        for item in schedule[:10]:  # First 10 posts
            if current_time != item["time_window"]:
                current_time = item["time_window"]
                instructions += f"\n\n📍 {current_time.upper()}:\n"
            
            instructions += f"\n→ In {item['group']}:\n"
            instructions += f"   Message type: {item['type']}\n"
            instructions += f"   Copy & paste:\n"
            instructions += f"   ---\n{item['message']}\n   ---\n"
        
        instructions += """

STEP 3: TRACKING RESULTS
------------------------
After each post, note:
1. Group name
2. Time posted
3. Any immediate responses
4. Number of clicks (if visible)

TIPS FOR SUCCESS:
----------------
✅ Wait 10-15 minutes between posts
✅ Engage with responses naturally
✅ Don't post same message in multiple groups
✅ If someone asks, provide genuine help
✅ Join group discussions before posting
"""
        
        return instructions
    
    def create_auto_poster_script(self) -> str:
        """Create a script for semi-automated posting"""
        script = '''#!/usr/bin/env python3
"""
Semi-Automated Telegram Poster
Run this to get reminders and messages to post
"""

import time
import random
from datetime import datetime

messages = %s

groups = %s

def run_posting_campaign():
    print("🚀 TELEGRAM POSTING CAMPAIGN")
    print("="*50)
    
    posted = 0
    for group in groups[:5]:  # Start with 5 groups
        msg = random.choice(messages)
        
        print(f"\\n📱 POST #{posted + 1}")
        print(f"Group: {group}")
        print(f"Time: {datetime.now().strftime('%%H:%%M')}")
        print("-"*40)
        print("COPY THIS MESSAGE:")
        print("-"*40)
        print(msg["message"])
        print("-"*40)
        
        input("\\nPress Enter after posting...")
        posted += 1
        
        if posted < 5:
            wait_time = random.randint(300, 600)  # 5-10 minutes
            print(f"\\n⏰ Wait {wait_time//60} minutes before next post...")
            time.sleep(wait_time)
    
    print(f"\\n✅ Campaign complete! Posted in {posted} groups")

if __name__ == "__main__":
    run_posting_campaign()
''' % (json.dumps(self.message_templates, indent=2), 
       json.dumps(self.target_groups[:10], indent=2))
        
        return script

def main():
    manager = TelegramGroupManager()
    
    print("🤖 TELEGRAM GROUP MANAGER")
    print("="*50)
    
    # Generate instructions
    instructions = manager.generate_manual_instructions()
    
    # Save instructions
    with open("telegram_sharing_guide.txt", "w") as f:
        f.write(instructions)
    
    print(instructions)
    
    # Create auto-poster script
    script = manager.create_auto_poster_script()
    with open("auto_poster.py", "w") as f:
        f.write(script)
    
    print("\n✅ Files created:")
    print("1. telegram_sharing_guide.txt - Manual instructions")
    print("2. auto_poster.py - Semi-automated poster")
    
    print("\n🎯 START NOW:")
    print("1. Join the first 5 groups")
    print("2. Run: python3 auto_poster.py")
    print("3. Follow the prompts")

if __name__ == "__main__":
    main()