#!/usr/bin/env python3
"""
Simple Telegram Bot - Works with just your bot token
No API credentials needed!
"""

import requests
import time
import random
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

class SimpleTelegramBot:
    def __init__(self):
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.channel = '@AIFinanceNews2024'
        
        # Your messages
        self.messages = [
            f"""📊 Multi-source verified market data!

{self.channel}

• TradingView verified ✅
• Yahoo Finance checked ✅
• NSE official data ✅
• Educational content only

Free for first 500 members!
Join: https://t.me/AIFinanceNews2024""",

            f"""🎯 For serious traders:

{self.channel} provides:
• Real-time verified data
• No fake tips
• Educational analysis
• SEBI compliant

Link: https://t.me/AIFinanceNews2024""",

            f"""📈 New discovery!

{self.channel}

Every price verified from 3+ sources.
No pump & dump. Education only.

https://t.me/AIFinanceNews2024"""
        ]
    
    def send_to_channel(self, message: str):
        """Send message to your channel"""
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {
            'chat_id': '@AIFinanceNews2024',
            'text': message,
            'parse_mode': 'HTML'
        }
        
        try:
            response = requests.post(url, json=data)
            if response.status_code == 200:
                print("✅ Posted to channel!")
                return True
        except Exception as e:
            print(f"❌ Error: {e}")
        return False
    
    def post_educational_content(self):
        """Post educational content to keep channel active"""
        educational = [
            """📚 TRADING TIP OF THE DAY

Always verify prices from multiple sources!

Why? Single-source errors can cost you money.

We verify from:
• TradingView
• Yahoo Finance  
• NSE Official

Stay safe, verify always! 🎯

@AIFinanceNews2024""",

            """📊 MARKET INSIGHT

RSI below 30 = Oversold
RSI above 70 = Overbought

But remember: Oversold can stay oversold!

Always use multiple indicators.

Educational purpose only.

@AIFinanceNews2024""",

            """🎯 RISK MANAGEMENT 101

Never risk more than 2% per trade.

With ₹1,00,000 capital:
• Max risk: ₹2,000
• If stop-loss is 5%: Max position = ₹40,000

Protect capital first!

@AIFinanceNews2024"""
        ]
        
        msg = random.choice(educational)
        return self.send_to_channel(msg)
    
    def get_groups_to_join(self):
        """List of groups to join and share in"""
        print("\n📱 GROUPS TO JOIN (Open in Telegram app):")
        print("="*50)
        
        groups = [
            "Search: 'trading chat india'",
            "Search: 'stock discussion'",
            "Search: 'nifty chat'",
            "Search: 'market discussion'",
            "Search: 'traders forum'",
            "Search: 'intraday discussion'",
            "Search: 'options chat india'"
        ]
        
        for i, search in enumerate(groups, 1):
            print(f"{i}. {search}")
        
        print("\n📝 MESSAGE TO SHARE (Copy this):")
        print("="*50)
        print(random.choice(self.messages))
        print("="*50)
    
    def auto_post_loop(self):
        """Keep channel active with posts"""
        print("\n🤖 AUTO POSTING STARTED")
        print("="*50)
        
        post_count = 0
        
        while True:
            try:
                # Post educational content
                if self.post_educational_content():
                    post_count += 1
                    print(f"✅ Post #{post_count} sent")
                
                # Wait 2 hours
                wait_time = 7200  # 2 hours
                print(f"⏰ Next post in {wait_time//60} minutes...")
                time.sleep(wait_time)
                
            except KeyboardInterrupt:
                print(f"\n✅ Posted {post_count} times")
                break

def main():
    bot = SimpleTelegramBot()
    
    print("🤖 SIMPLE TELEGRAM BOT")
    print("="*50)
    print("Works with your existing bot token!")
    print("="*50)
    
    print("\n📋 OPTIONS:")
    print("1. Show groups to join & message to share")
    print("2. Post educational content now")
    print("3. Start auto-posting (every 2 hours)")
    
    choice = input("\nChoice (1-3): ")
    
    if choice == "1":
        bot.get_groups_to_join()
    elif choice == "2":
        bot.post_educational_content()
    elif choice == "3":
        bot.auto_post_loop()

if __name__ == "__main__":
    main()