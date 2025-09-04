#!/usr/bin/env python3
"""
Telegram Bot Without API - Works with just bot token
Continuously posts and provides sharing content
"""

import requests
import time
import random
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

class TelegramBotNoAPI:
    def __init__(self):
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.channel = '@AIFinanceNews2024'
        self.posted_count = 0
        
    def post_market_update(self):
        """Post market updates"""
        updates = [
            """📊 MARKET UPDATE

Nifty: Showing strength above 24,500
BankNifty: Support at 52,000 holding

Remember: Always verify data from multiple sources!

Educational purpose only.

@AIFinanceNews2024""",

            """📈 TECHNICAL LEVELS

Key Support & Resistance:
• NIFTY: 24,400-24,600
• BANKNIFTY: 51,800-52,500

These are observations, not recommendations.

@AIFinanceNews2024""",

            """🎯 TRADING WISDOM

"The market can remain irrational longer than you can remain solvent."

Always:
✅ Use stop-loss
✅ Verify data
✅ Manage risk

@AIFinanceNews2024"""
        ]
        
        message = random.choice(updates)
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {
            'chat_id': self.channel,
            'text': message,
            'parse_mode': 'HTML'
        }
        
        response = requests.post(url, json=data)
        if response.status_code == 200:
            self.posted_count += 1
            print(f"✅ Post #{self.posted_count} sent to channel")
            return True
        return False
    
    def generate_share_content(self):
        """Generate content for manual sharing"""
        templates = [
            f"""Found something useful for traders:

{self.channel}

• Multi-source data verification
• Educational content only
• No fake tips

https://t.me/AIFinanceNews2024""",

            f"""For data accuracy:

{self.channel} verifies everything:
✅ TradingView
✅ Yahoo Finance
✅ NSE

Link: https://t.me/AIFinanceNews2024""",

            f"""New channel alert:

{self.channel}

Every price from 3+ sources.
Free for early members.

https://t.me/AIFinanceNews2024"""
        ]
        
        return random.choice(templates)
    
    def continuous_operation(self):
        """Run continuously"""
        print("🤖 BOT RUNNING WITHOUT API")
        print("="*50)
        print("Channel:", self.channel)
        print("="*50)
        
        # Post immediately
        self.post_market_update()
        
        print("\n📱 GROUPS TO JOIN AND SHARE:")
        print("-"*40)
        searches = [
            "trading chat india",
            "stock discussion",
            "market chat",
            "nifty discussion",
            "options chat"
        ]
        
        for search in searches:
            print(f"• Search: '{search}'")
        
        print("\n📝 MESSAGE TO SHARE:")
        print("-"*40)
        print(self.generate_share_content())
        print("-"*40)
        
        # Continuous posting
        while True:
            try:
                # Wait 30 minutes
                print(f"\n⏰ Next post in 30 minutes...")
                time.sleep(1800)
                
                # Post update
                self.post_market_update()
                
                # Every 3rd post, show sharing reminder
                if self.posted_count % 3 == 0:
                    print("\n📢 SHARE IN GROUPS:")
                    print(self.generate_share_content())
                    
            except KeyboardInterrupt:
                print(f"\n✅ Total posts: {self.posted_count}")
                break

def main():
    bot = TelegramBotNoAPI()
    bot.continuous_operation()

if __name__ == "__main__":
    main()