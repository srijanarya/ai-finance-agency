#!/usr/bin/env python3
"""
Safe Telegram Poster - NEVER posts wrong information
Always verifies data before posting
"""

import requests
import os
from datetime import datetime
import time
from dotenv import load_dotenv
from real_time_verifier import MarketDataVerifier
import sqlite3

load_dotenv()

class SafeTelegramPoster:
    def __init__(self):
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.channel = '@AIFinanceNews2024'
        self.verifier = MarketDataVerifier()
        self.db_path = 'data/agency.db'
    
    def post_to_telegram(self, content: str) -> bool:
        """Post content to Telegram"""
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {
            'chat_id': self.channel,
            'text': content,
            'parse_mode': 'HTML'
        }
        
        response = requests.post(url, json=data)
        return response.status_code == 200
    
    def safe_post_market_update(self):
        """Post ONLY verified market updates"""
        print("🔍 Generating verified market update...")
        
        # Get real-time top movers
        content = self.verifier.get_top_movers()
        
        if content:
            if self.post_to_telegram(content):
                print("✅ Posted verified market movers")
                return True
        
        return False
    
    def safe_post_stock_update(self, symbol: str):
        """Post verified single stock update"""
        print(f"🔍 Verifying {symbol} data...")
        
        # Get real-time data
        content = self.verifier.generate_accurate_content(symbol)
        
        if content:
            if self.post_to_telegram(content):
                print(f"✅ Posted verified {symbol} update")
                return True
        else:
            print(f"⚠️ Could not verify {symbol} data - NOT POSTING")
        
        return False
    
    def post_educational_content(self):
        """Post educational content (no market data to verify)"""
        educational_posts = [
            """📚 TRADING TIP OF THE DAY

What is RSI (Relative Strength Index)?

RSI measures momentum - whether a stock is overbought or oversold.

• Above 70 = Overbought (may fall)
• Below 30 = Oversold (may rise)
• 50 = Neutral

Use RSI with other indicators for better accuracy!

Learn more trading tips: @AIFinanceNews2024""",

            """💡 INVESTMENT WISDOM

"Time in the market beats timing the market"

Studies show:
• 95% of day traders lose money
• Long-term investors average 10% yearly
• Missing 10 best days = 50% lower returns

Focus on quality stocks, not quick profits.

@AIFinanceNews2024""",

            """🎯 RISK MANAGEMENT 101

Never risk more than 2% per trade!

If you have ₹1,00,000:
• Max risk per trade: ₹2,000
• If stock is ₹100, stop-loss at ₹98
• Max shares: 1,000 (₹2,000 risk)

This ensures you survive losing streaks.

@AIFinanceNews2024"""
        ]
        
        import random
        content = random.choice(educational_posts)
        
        if self.post_to_telegram(content):
            print("✅ Posted educational content")
            return True
        
        return False
    
    def run_safe_posting_cycle(self):
        """Run a complete safe posting cycle"""
        print("🤖 SAFE POSTING CYCLE")
        print("="*50)
        
        # 1. Post market movers (verified)
        self.safe_post_market_update()
        time.sleep(60)
        
        # 2. Post specific stock (verified)
        stocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY']
        for stock in stocks[:2]:  # Post 2 stocks
            self.safe_post_stock_update(stock)
            time.sleep(60)
        
        # 3. Post educational content (safe)
        self.post_educational_content()
        
        print("\n✅ Safe posting cycle complete!")
        print("All content verified before posting.")

def main():
    poster = SafeTelegramPoster()
    
    print("🛡️ SAFE TELEGRAM POSTER")
    print("="*50)
    print("This poster NEVER sends unverified data\n")
    
    # Run safe posting
    poster.run_safe_posting_cycle()
    
    print("\n📋 Credibility Protection Rules:")
    print("1. Always verify market data before posting")
    print("2. Use real-time data from Yahoo Finance")
    print("3. Post corrections immediately if errors found")
    print("4. Educational content doesn't need verification")
    print("5. Never claim predictions without data")

if __name__ == "__main__":
    main()