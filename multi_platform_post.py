#!/usr/bin/env python3
"""
Multi-Platform Auto Poster - Posts to Telegram, Twitter/X, and LinkedIn
"""

import os
import sys
import time
import random
import tweepy
import requests
from datetime import datetime
from telethon.sync import TelegramClient
from dotenv import load_dotenv
import yfinance as yf

# Load environment
load_dotenv()

class MultiPlatformPoster:
    def __init__(self):
        # Telegram
        self.tg_api_id = os.getenv('TELEGRAM_API_ID')
        self.tg_api_hash = os.getenv('TELEGRAM_API_HASH')
        self.tg_channel = '@AIFinanceNews2024'
        
        # Twitter/X
        self.twitter_consumer_key = os.getenv('TWITTER_CONSUMER_KEY')
        self.twitter_consumer_secret = os.getenv('TWITTER_CONSUMER_SECRET')
        self.twitter_access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        self.twitter_access_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        
        # LinkedIn
        self.linkedin_token = os.getenv('LINKEDIN_PERSONAL_ACCESS_TOKEN')
        self.linkedin_person_urn = os.getenv('LINKEDIN_PERSON_URN', 'urn:li:person:YOUR_ID')
        
        self.post_count = {
            'telegram': 0,
            'twitter': 0,
            'linkedin': 0
        }
        
    def get_market_data(self):
        """Get current market snapshot"""
        try:
            symbols = {'NIFTY': '^NSEI', 'SENSEX': '^BSESN'}
            data = {}
            for name, symbol in symbols.items():
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="1d")
                if not hist.empty:
                    price = hist['Close'].iloc[-1]
                    change = ((price - hist['Open'].iloc[0]) / hist['Open'].iloc[0]) * 100
                    data[name] = {'price': round(price, 2), 'change': round(change, 2)}
            return data
        except:
            return {}
    
    def generate_content(self, platform):
        """Generate platform-specific content"""
        hour = datetime.now().hour
        market = self.get_market_data()
        
        # Base content types
        content_types = [
            self.market_update_content,
            self.trading_tip_content,
            self.educational_content,
            self.motivational_content
        ]
        
        # Select content
        content_func = random.choice(content_types)
        return content_func(platform, market)
    
    def market_update_content(self, platform, market):
        """Market update for each platform"""
        base = f"Market Update: "
        
        if market:
            for name, data in market.items():
                emoji = "📈" if data['change'] > 0 else "📉"
                base += f"{emoji} {name}: {data['price']} ({data['change']:+.2f}%) "
        
        if platform == 'telegram':
            return f"""📊 **MARKET UPDATE** 📊

{base}

💡 Trade with discipline, not emotions!

🔔 Follow @AIFinanceNews2024 for more updates!

#Trading #StockMarket #NIFTY #SENSEX"""
        
        elif platform == 'twitter':
            # Twitter has 280 char limit
            return f"""{base}

💡 Trade with discipline!

#StockMarket #Trading #NIFTY #SENSEX #FinanceIndia"""
        
        elif platform == 'linkedin':
            return f"""📊 Market Update - {datetime.now().strftime('%B %d, %Y')}

{base}

Key Takeaway: Markets reflect short-term sentiment but long-term fundamentals always prevail. Stay invested, stay disciplined.

What's your market outlook for tomorrow? Share your thoughts below!

#StockMarket #InvestmentStrategy #FinancialMarkets #Trading"""
    
    def trading_tip_content(self, platform, market):
        """Trading tips for each platform"""
        tips = [
            "Never risk more than 2% of capital on a single trade",
            "Volume precedes price - watch for unusual spikes",
            "The trend is your friend until it ends",
            "Cut losses short, let profits run"
        ]
        tip = random.choice(tips)
        
        if platform == 'telegram':
            return f"""🎯 **TRADING TIP** 🎯

{tip}

✅ Risk management is the key to long-term success!

📊 Follow @AIFinanceNews2024

#TradingTips #RiskManagement #StockMarket"""
        
        elif platform == 'twitter':
            return f"""🎯 Trading Tip:

{tip}

#TradingTips #StockMarket #RiskManagement #Trading"""
        
        elif platform == 'linkedin':
            return f"""💡 Professional Trading Insight

{tip}

In my years of analyzing markets, this principle has proven invaluable. Risk management isn't just about protecting capital - it's about creating sustainable, long-term wealth.

What's your most important trading rule? Let's discuss!

#TradingStrategy #RiskManagement #FinancialEducation"""
    
    def educational_content(self, platform, market):
        """Educational content for each platform"""
        topics = [
            ("P/E Ratio", "Price ÷ EPS. <15 may be undervalued, >25 may be overvalued"),
            ("RSI", "Momentum indicator. >70 overbought, <30 oversold"),
            ("Moving Averages", "Trend indicator. Price above = bullish, below = bearish")
        ]
        topic, desc = random.choice(topics)
        
        if platform == 'telegram':
            return f"""📚 **LEARN: {topic}** 📚

{desc}

🎓 Master one concept at a time!

@AIFinanceNews2024 #Education #Trading"""
        
        elif platform == 'twitter':
            return f"""📚 Learn: {topic}

{desc}

#StockMarketEducation #Trading #TechnicalAnalysis"""
        
        elif platform == 'linkedin':
            return f"""📚 Financial Education: Understanding {topic}

{desc}

This fundamental concept helps investors make informed decisions. Remember, continuous learning is the foundation of investment success.

What technical indicators do you rely on most? Share your experience!

#FinancialLiteracy #InvestmentEducation #TechnicalAnalysis"""
    
    def motivational_content(self, platform, market):
        """Motivational content for each platform"""
        quotes = [
            "Warren Buffett: 'Be fearful when others are greedy, greedy when others are fearful'",
            "Peter Lynch: 'Know what you own, and know why you own it'",
            "Jesse Livermore: 'The market is never wrong, opinions often are'"
        ]
        quote = random.choice(quotes)
        
        if platform == 'telegram':
            return f"""💎 **WISDOM** 💎

{quote}

💪 Stay disciplined!

@AIFinanceNews2024 #Motivation"""
        
        elif platform == 'twitter':
            return f"""💎 {quote}

#InvestmentWisdom #Trading #StockMarket"""
        
        elif platform == 'linkedin':
            return f"""💎 Timeless Investment Wisdom

{quote}

These words have guided countless successful investors. In today's volatile markets, such principles become even more valuable.

Which investment philosophy guides your decisions?

#InvestmentPhilosophy #Leadership #WealthCreation"""
    
    def post_to_telegram(self, content):
        """Post to Telegram"""
        try:
            with TelegramClient('srijan_session', self.tg_api_id, self.tg_api_hash) as client:
                result = client.send_message(self.tg_channel, content)
                self.post_count['telegram'] += 1
                print(f"✅ Telegram: Posted (ID: {result.id})")
                return True
        except Exception as e:
            print(f"❌ Telegram error: {e}")
            return False
    
    def post_to_twitter(self, content):
        """Post to Twitter/X"""
        try:
            auth = tweepy.OAuthHandler(self.twitter_consumer_key, self.twitter_consumer_secret)
            auth.set_access_token(self.twitter_access_token, self.twitter_access_secret)
            api = tweepy.API(auth)
            
            # Post tweet
            result = api.update_status(content[:280])  # Ensure within limit
            self.post_count['twitter'] += 1
            print(f"✅ Twitter/X: Posted (ID: {result.id})")
            return True
        except Exception as e:
            print(f"❌ Twitter/X error: {e}")
            return False
    
    def post_to_linkedin(self, content):
        """Post to LinkedIn"""
        try:
            headers = {
                'Authorization': f'Bearer {self.linkedin_token}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            data = {
                "author": self.linkedin_person_urn,
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": content
                        },
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }
            
            response = requests.post(
                'https://api.linkedin.com/v2/ugcPosts',
                headers=headers,
                json=data
            )
            
            if response.status_code == 201:
                self.post_count['linkedin'] += 1
                print(f"✅ LinkedIn: Posted")
                return True
            else:
                print(f"❌ LinkedIn error: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ LinkedIn error: {e}")
            return False
    
    def post_to_all(self):
        """Post to all platforms"""
        print(f"\n📮 Posting at {datetime.now().strftime('%H:%M:%S')}...")
        
        # Generate content for each platform
        tg_content = self.generate_content('telegram')
        tw_content = self.generate_content('twitter')
        li_content = self.generate_content('linkedin')
        
        # Post to each platform
        self.post_to_telegram(tg_content)
        time.sleep(2)  # Small delay between platforms
        self.post_to_twitter(tw_content)
        time.sleep(2)
        self.post_to_linkedin(li_content)
        
        print(f"📊 Total posts - TG: {self.post_count['telegram']}, TW: {self.post_count['twitter']}, LI: {self.post_count['linkedin']}")
    
    def run_automation(self):
        """Main automation loop"""
        print("=" * 60)
        print("🚀 MULTI-PLATFORM AUTO POSTER")
        print("=" * 60)
        print("Platforms: Telegram, Twitter/X, LinkedIn")
        print("Schedule: Every 30-45 minutes")
        print("Press Ctrl+C to stop")
        print("=" * 60)
        
        while True:
            try:
                # Post to all platforms
                self.post_to_all()
                
                # Wait 30-45 minutes
                wait_time = random.randint(1800, 2700)
                print(f"⏰ Next post in {wait_time//60} minutes...")
                print("-" * 40)
                time.sleep(wait_time)
                
            except KeyboardInterrupt:
                print("\n\n👋 Stopping multi-platform poster...")
                print(f"Final stats - TG: {self.post_count['telegram']}, TW: {self.post_count['twitter']}, LI: {self.post_count['linkedin']}")
                break
            except Exception as e:
                print(f"Error: {e}")
                print("Retrying in 5 minutes...")
                time.sleep(300)

if __name__ == "__main__":
    poster = MultiPlatformPoster()
    poster.run_automation()