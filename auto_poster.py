#!/usr/bin/env python3
"""
Semi-Automated Telegram Poster
Run this to get reminders and messages to post
"""

import time
import random
from datetime import datetime

messages = [
  {
    "type": "helpful",
    "message": "Friends, I found something useful!\n\nThere's a new Telegram channel providing FREE real-time market data using TradingView API.\n\nThey verify every price before posting (no fake tips!)\n\nCheck it out: @AIFinanceNews2024\n\nCurrently free for first 500 members."
  },
  {
    "type": "question",
    "message": "Anyone here using TradingView for live data?\n\nFound this channel that posts verified TradingView data for free: @AIFinanceNews2024\n\nIs it reliable? They cross-check with multiple sources before posting."
  },
  {
    "type": "share_success",
    "message": "Got this from @AIFinanceNews2024 this morning:\n\nHDFCBANK was showing RSI below 30 - bought at open.\nAlready up 1.2%! \n\nThey use AI + TradingView. Worth following."
  },
  {
    "type": "casual",
    "message": "Yo! For those who keep asking for real-time prices...\n\n@AIFinanceNews2024 - posts live verified data\n\nBetter than random WhatsApp forwards \ud83d\ude05"
  },
  {
    "type": "professional",
    "message": "For serious traders:\n\nNew channel with institutional-grade data:\n\u2713 TradingView integration\n\u2713 Real-time verification\n\u2713 No pump & dump\n\n@AIFinanceNews2024 (Free for early joiners)"
  },
  {
    "type": "fomo",
    "message": "Guys quick update!\n\nThat AI finance channel I mentioned yesterday (@AIFinanceNews2024) is at 450/500 free members.\n\nAfter 500 they're charging \u20b92999/month.\n\nJoin now if interested!"
  }
]

groups = [
  "@IndianStockMarketLive",
  "@StockMarketIndiaOfficial",
  "@NSEBSETips",
  "@IntradayTradingTips",
  "@EquityResearch",
  "@BankNiftyOptionsTrading",
  "@NiftyFiftyTraders",
  "@IndianIPONews",
  "@ShareMarketGyan",
  "@TradingGuruIndia"
]

def run_posting_campaign():
    print("🚀 TELEGRAM POSTING CAMPAIGN")
    print("="*50)
    
    posted = 0
    for group in groups[:5]:  # Start with 5 groups
        msg = random.choice(messages)
        
        print(f"\n📱 POST #{posted + 1}")
        print(f"Group: {group}")
        print(f"Time: {datetime.now().strftime('%H:%M')}")
        print("-"*40)
        print("COPY THIS MESSAGE:")
        print("-"*40)
        print(msg["message"])
        print("-"*40)
        
        input("\nPress Enter after posting...")
        posted += 1
        
        if posted < 5:
            wait_time = random.randint(300, 600)  # 5-10 minutes
            print(f"\n⏰ Wait {wait_time//60} minutes before next post...")
            time.sleep(wait_time)
    
    print(f"\n✅ Campaign complete! Posted in {posted} groups")

if __name__ == "__main__":
    run_posting_campaign()
