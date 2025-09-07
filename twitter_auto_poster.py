#!/usr/bin/env python3
"""
Twitter/X Auto-Poster - Posts valuable finance content
Uses v2 API with OAuth1 (working!)
"""

import os
import sys
import time
import random
from datetime import datetime
from twitter_v2_poster import TwitterV2Poster
import yfinance as yf

class TwitterAutoPoster:
    def __init__(self):
        self.poster = TwitterV2Poster()
        self.post_count = 0
        self.max_daily = 16  # Free tier limit
        
    def get_market_data(self):
        """Get quick market snapshot"""
        try:
            symbols = {'NIFTY': '^NSEI', 'SENSEX': '^BSESN'}
            data = []
            for name, symbol in symbols.items():
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="1d")
                if not hist.empty:
                    price = hist['Close'].iloc[-1]
                    change = ((price - hist['Open'].iloc[0]) / hist['Open'].iloc[0]) * 100
                    emoji = "📈" if change > 0 else "📉"
                    data.append(f"{emoji} {name}: {price:.0f} ({change:+.1f}%)")
            return " | ".join(data) if data else ""
        except:
            return ""
    
    def generate_tweet(self):
        """Generate Twitter-appropriate content (280 chars)"""
        hour = datetime.now().hour
        market = self.get_market_data()
        
        templates = [
            # Market updates (with live data)
            f"📊 Market Update: {market}\n\n💡 Smart money tip: Volume confirms price direction\n\n#StockMarket #Trading #NIFTY",
            
            # Trading tips (short & punchy)
            "🎯 Trading Rule #1: Never risk more than 2% per trade\n\nThis simple rule has saved more traders than any strategy\n\n#TradingTips #RiskManagement",
            
            "📈 Pattern Alert: Doji candles signal indecision\n\nWait for confirmation before taking position\n\n#TechnicalAnalysis #Trading",
            
            "💡 Fact: 90% of traders fail because of emotions, not strategy\n\nStay disciplined!\n\n#Trading #StockMarket #Psychology",
            
            # Market wisdom
            "🧠 Warren Buffett: 'Be fearful when others are greedy'\n\nTimeless advice for volatile markets\n\n#InvestmentWisdom #StockMarket",
            
            "⚡ Quick Tip: RSI > 70 = Overbought | RSI < 30 = Oversold\n\nBut always confirm with price action!\n\n#TechnicalAnalysis #Trading",
            
            # Motivational
            "💪 Remember: Every expert was once a beginner\n\nKeep learning, keep growing\n\n#TradingMotivation #StockMarket",
            
            # Educational
            "📚 P/E Ratio:\n• <15 = Potentially undervalued\n• 15-25 = Fair value\n• >25 = Potentially overvalued\n\n#StockMarketEducation #Investing",
            
            # Time-based
            f"⏰ {'Good Morning' if hour < 12 else 'Good Evening'} Traders!\n\n{market if market else 'Markets showing opportunity'}\n\nStay sharp, trade smart!\n\n#Trading #India"
        ]
        
        # Pick a random template
        tweet = random.choice(templates)
        
        # Ensure within Twitter limit
        if len(tweet) > 280:
            tweet = tweet[:277] + "..."
            
        return tweet
    
    def post_tweet(self):
        """Post a tweet"""
        if self.post_count >= self.max_daily:
            print(f"⚠️ Daily limit reached ({self.max_daily} tweets)")
            return False
            
        content = self.generate_tweet()
        print(f"\n📝 Tweeting: {content[:100]}...")
        
        if self.poster.post_tweet_v2(content):
            self.post_count += 1
            print(f"✅ Tweet #{self.post_count} posted successfully!")
            return True
        else:
            print("❌ Failed to post tweet")
            return False
    
    def run_automation(self):
        """Main automation loop"""
        print("=" * 60)
        print("🐦 TWITTER/X AUTO-POSTER")
        print("=" * 60)
        print("Free Tier: Max 16 posts/day")
        print("Schedule: Every 60-90 minutes")
        print("Press Ctrl+C to stop")
        print("=" * 60)
        
        while True:
            try:
                # Check if within daily limit
                if self.post_count >= self.max_daily:
                    print(f"\n⚠️ Daily limit reached. Waiting until tomorrow...")
                    time.sleep(3600)  # Check every hour
                    
                    # Reset counter at midnight
                    if datetime.now().hour == 0:
                        self.post_count = 0
                        print("✅ Daily counter reset!")
                    continue
                
                # Post tweet
                if self.post_tweet():
                    print(f"📊 Posts today: {self.post_count}/{self.max_daily}")
                
                # Wait 60-90 minutes
                wait_time = random.randint(3600, 5400)
                print(f"⏰ Next tweet in {wait_time//60} minutes...")
                print("-" * 60)
                time.sleep(wait_time)
                
            except KeyboardInterrupt:
                print(f"\n\n👋 Stopping Twitter poster...")
                print(f"📊 Total tweets today: {self.post_count}")
                break
            except Exception as e:
                print(f"Error: {e}")
                print("Retrying in 10 minutes...")
                time.sleep(600)

if __name__ == "__main__":
    # Quick test mode
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        print("\n🧪 TEST MODE - Posting once")
        poster = TwitterAutoPoster()
        poster.post_tweet()
    else:
        # Normal automation mode
        poster = TwitterAutoPoster()
        poster.run_automation()