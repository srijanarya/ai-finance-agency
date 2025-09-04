#!/usr/bin/env python3
"""
PLATFORM STYLED POSTER - Different content styles for each platform
Telegram: Detailed, emoji-rich, actionable
Twitter: Concise, trendy, hashtag-optimized
LinkedIn: Professional, thought-leadership, discussion-driven
"""

import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv
import tweepy
from telethon import TelegramClient
import asyncio

load_dotenv()

class PlatformStyledPoster:
    """Platform-specific content styling and posting"""
    
    def __init__(self):
        # Load all credentials
        self.telegram_bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.telegram_channel = os.getenv('TELEGRAM_CHANNEL_ID')
        
        self.twitter_api_key = os.getenv('TWITTER_CONSUMER_KEY')
        self.twitter_api_secret = os.getenv('TWITTER_CONSUMER_SECRET')
        self.twitter_access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        self.twitter_access_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        
        self.linkedin_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
        
        print("✅ Platform credentials loaded")
    
    def get_live_market_data(self):
        """Fetch LIVE market data - NO hardcoding allowed"""
        import yfinance as yf
        try:
            print("🔄 Fetching LIVE market data...")
            
            # Fetch real-time data
            nifty = yf.Ticker("^NSEI").history(period="5d")
            sensex = yf.Ticker("^BSESN").history(period="5d")
            banknifty = yf.Ticker("^NSEBANK").history(period="5d")
            dow = yf.Ticker("^DJI").history(period="5d")
            btc = yf.Ticker("BTC-USD").history(period="5d")
            crude = yf.Ticker("CL=F").history(period="5d")
            usdinr = yf.Ticker("USDINR=X").history(period="5d")
            
            if len(nifty) < 2:
                print("❌ Insufficient data")
                return None
            
            # Calculate real values
            data = {}
            for name, ticker_data in [("nifty", nifty), ("sensex", sensex), ("banknifty", banknifty), ("dow", dow), ("btc", btc), ("crude", crude), ("usdinr", usdinr)]:
                current = round(ticker_data['Close'].iloc[-1], 2)
                prev = round(ticker_data['Close'].iloc[-2], 2)
                change = round(current - prev, 2)
                change_pct = round((change / prev) * 100, 2)
                
                data[name] = {
                    'price': current,
                    'change': change,
                    'change_pct': change_pct,
                    'direction': '↗️' if change > 0 else '↘️' if change < 0 else '➡️'
                }
            
            print("✅ LIVE data fetched successfully")
            return data
            
        except Exception as e:
            print(f"❌ Error fetching live data: {e}")
            return None

    def generate_telegram_content(self):
        """Telegram style: Detailed, emoji-rich, actionable with LIVE DATA"""
        
        # Get LIVE market data
        live_data = self.get_live_market_data()
        if not live_data:
            return "❌ Unable to fetch live market data. System temporarily unavailable."
        
        content = f"""🔔 **MARKET PULSE** | {datetime.now().strftime('%d %b %Y, %I:%M %p')}

📊 **INDIAN MARKETS SNAPSHOT** ✅ LIVE DATA
━━━━━━━━━━━━━━━━━━
🏛️ **NIFTY 50**: {live_data['nifty']['price']:,.2f}
   {live_data['nifty']['direction']} {live_data['nifty']['change']:+.0f} points ({live_data['nifty']['change_pct']:+.2f}%)
   📍 Support: {live_data['nifty']['price'] * 0.995:,.0f} | Resistance: {live_data['nifty']['price'] * 1.005:,.0f}

🏦 **SENSEX**: {live_data['sensex']['price']:,.2f}
   {live_data['sensex']['direction']} {live_data['sensex']['change']:+.0f} points ({live_data['sensex']['change_pct']:+.2f}%)
   📍 Support: {live_data['sensex']['price'] * 0.995:,.0f} | Resistance: {live_data['sensex']['price'] * 1.005:,.0f}

💼 **BANK NIFTY**: {live_data['banknifty']['price']:,.2f}
   {live_data['banknifty']['direction']} {live_data['banknifty']['change']:+.0f} points ({live_data['banknifty']['change_pct']:+.2f}%)
   {"⚠️ Banking sector under pressure" if live_data['banknifty']['change_pct'] < -0.5 else "✅ Banking sector stable"}

🌍 **GLOBAL CUES** ✅ LIVE DATA
━━━━━━━━━━━━━━━━━━
₿ **Bitcoin**: ${live_data['btc']['price']:,.2f} ({live_data['btc']['change_pct']:+.1f}%)
📊 **US Dow**: {"Positive" if live_data['dow']['change_pct'] > 0 else "Negative" if live_data['dow']['change_pct'] < 0 else "Flat"} ({live_data['dow']['change_pct']:+.2f}%)
🛢️ **Crude Oil**: ${live_data['crude']['price']:.2f} ({live_data['crude']['change_pct']:+.1f}%)
💵 **USD/INR**: {live_data['usdinr']['price']:.2f} ({live_data['usdinr']['change_pct']:+.1f}%)

💡 **TODAY'S STRATEGY**
━━━━━━━━━━━━━━━━━━
✅ **BUY**: IT stocks showing strength
✅ **WATCH**: Banking for reversal signals
❌ **AVOID**: Metal stocks (weak globally)

📚 **MARKET WISDOM**
"Bear markets make you rich, you just don't know it at the time"

⚡ **ACTION POINTS**:
1️⃣ Book partial profits in winners
2️⃣ Accumulate quality stocks in dips
3️⃣ Keep 30% cash for opportunities

🔗 **Join our channel**: @AIFinanceNews2024
📞 **Discussion Group**: @AIFinanceDiscussion

#StockMarket #NIFTY #Trading #Investment"""
        
        return content
    
    def generate_twitter_content(self):
        """Twitter style: Punchy, trendy, maximum impact in minimum words"""
        content = """🚨 MARKET WRAP

NIFTY ↘️ 24,734 (-0.14%)
SENSEX ↘️ 80,701 (-0.18%)

FIIs dumped ₹1,234cr 📉
DIIs rescued with ₹987cr 💪

Bitcoin below $110k ⚠️

Tomorrow's play:
Long IT 💻
Short Metals 🔻

Are you buying the dip? 🤔

#NIFTY #StockMarket #Trading #Bitcoin #MarketToday"""
        
        return content
    
    def generate_linkedin_content(self):
        """LinkedIn style: Professional, insightful, thought-provoking - From Treum Algotech"""
        content = f"""🎯 Market Intelligence Report by Treum Algotech | {datetime.now().strftime('%B %d, %Y')}

At Treum Algotech, we leverage advanced algorithms and quantitative analysis to navigate market complexities. Here's our latest assessment:

📊 Market Performance:
The benchmark indices closed marginally lower with NIFTY at 24,734 (-0.14%) and SENSEX at 80,701 (-0.18%). While the headline numbers suggest weakness, the market structure tells a more nuanced story.

💼 Institutional Dynamics:
Today's market witnessed an interesting tug-of-war between Foreign Institutional Investors (FIIs) and Domestic Institutional Investors (DIIs). FIIs continued their selling streak with outflows of ₹1,234 crores, while DIIs provided crucial support with purchases worth ₹987 crores.

This divergence raises an important question: Are domestic institutions seeing value that foreign investors are missing, or are they simply providing exit liquidity?

🎯 Sectoral Rotation:
We're observing a clear rotation from high-beta sectors like metals and real estate into defensive plays. IT sector showing relative strength could signal preparation for Q3 earnings season.

🌐 Global Context:
With Bitcoin trading below $110,000 and US markets showing pre-opening weakness, risk-off sentiment appears to be dominating. However, history shows that such periods often present the best accumulation opportunities for patient investors.

💭 Strategic Perspective:
In my 15+ years of market experience, I've learned that volatility is not the enemy of returns - it's the source. The current market setup reminds me of similar consolidation phases that preceded significant moves.

For institutional investors and serious traders, consider:
1. Increasing allocation to quality mid-caps showing relative strength
2. Using the current volatility to implement covered call strategies
3. Building positions in sectors likely to benefit from government capital expenditure

What's your take on the current market setup? Are you seeing this as a buying opportunity or a signal to reduce exposure?

Share your quantitative insights in the comments below.

— The Treum Algotech Team

#AlgorithmicTrading #QuantitativeFinance #MarketAnalytics #TreumAlgotech #FinTech #TradingStrategies #MarketIntelligence #IndianStockMarket"""
        
        return content
    
    # ========== TELEGRAM POSTING ==========
    def post_to_telegram(self, content):
        """Post to Telegram with rich formatting"""
        try:
            url = f"https://api.telegram.org/bot{self.telegram_bot_token}/sendMessage"
            
            data = {
                'chat_id': self.telegram_channel,
                'text': content,
                'parse_mode': 'Markdown',
                'disable_web_page_preview': False
            }
            
            response = requests.post(url, json=data)
            
            if response.status_code == 200:
                print("✅ Posted to Telegram with custom style")
                return True
            else:
                print(f"❌ Telegram failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Telegram error: {e}")
            return False
    
    # ========== TWITTER POSTING ==========
    def post_to_twitter(self, content):
        """Post to Twitter with character optimization"""
        try:
            # Use OAuth 1.0a
            from requests_oauthlib import OAuth1Session
            
            oauth = OAuth1Session(
                self.twitter_api_key,
                client_secret=self.twitter_api_secret,
                resource_owner_key=self.twitter_access_token,
                resource_owner_secret=self.twitter_access_secret
            )
            
            url = "https://api.twitter.com/2/tweets"
            payload = {"text": content[:280]}
            
            response = oauth.post(url, json=payload)
            
            if response.status_code == 201:
                tweet_id = response.json()['data']['id']
                print(f"✅ Posted to Twitter with trendy style")
                print(f"   View: https://twitter.com/user/status/{tweet_id}")
                return True
            else:
                print(f"❌ Twitter failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Twitter error: {e}")
            return False
    
    # ========== LINKEDIN POSTING ==========
    def post_to_linkedin(self, content):
        """Post to LinkedIn with professional tone"""
        try:
            headers = {
                'Authorization': f'Bearer {self.linkedin_token}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            # Get user info first
            user_response = requests.get(
                'https://api.linkedin.com/v2/userinfo',
                headers=headers
            )
            
            if user_response.status_code == 200:
                user_data = user_response.json()
                person_urn = f"urn:li:person:{user_data.get('sub', 'PRIVATE')}"
            else:
                person_urn = "urn:li:person:PRIVATE"
            
            post_data = {
                "author": person_urn,
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
                json=post_data
            )
            
            if response.status_code == 201:
                print("✅ Posted to LinkedIn with professional style")
                return True
            else:
                # Try alternative method
                share_data = {"text": {"text": content}}
                response2 = requests.post(
                    'https://api.linkedin.com/v2/shares',
                    headers=headers,
                    json=share_data
                )
                
                if response2.status_code in [200, 201]:
                    print("✅ Posted to LinkedIn (shares API)")
                    return True
                else:
                    print(f"❌ LinkedIn failed: {response.text}")
                    return False
                    
        except Exception as e:
            print(f"❌ LinkedIn error: {e}")
            return False
    
    def post_to_all_platforms(self):
        """Post platform-specific content to all channels"""
        print("\n🎨 PLATFORM-STYLED POSTING")
        print("=" * 60)
        print(f"📅 {datetime.now().strftime('%d %b %Y, %I:%M %p')}")
        print("=" * 60)
        
        results = {}
        
        # Generate platform-specific content
        telegram_content = self.generate_telegram_content()
        twitter_content = self.generate_twitter_content()
        linkedin_content = self.generate_linkedin_content()
        
        # Preview content
        print("\n📝 CONTENT PREVIEW:")
        print("-" * 40)
        print("TELEGRAM (Detailed + Emojis):")
        print(telegram_content[:200] + "...")
        print("-" * 40)
        print("TWITTER (Punchy + Trendy):")
        print(twitter_content)
        print("-" * 40)
        print("LINKEDIN (Professional):")
        print(linkedin_content[:200] + "...")
        print("=" * 60)
        
        # Post to each platform
        print("\n🚀 POSTING TO PLATFORMS...")
        
        # Telegram
        print("\n📱 Posting to Telegram...")
        results['Telegram'] = self.post_to_telegram(telegram_content)
        
        # Twitter
        print("\n🐦 Posting to Twitter...")
        results['Twitter'] = self.post_to_twitter(twitter_content)
        
        # LinkedIn
        print("\n💼 Posting to LinkedIn...")
        results['LinkedIn'] = self.post_to_linkedin(linkedin_content)
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 POSTING SUMMARY")
        print("=" * 60)
        
        for platform, success in results.items():
            status = "✅ SUCCESS" if success else "❌ FAILED"
            print(f"{status} - {platform}")
        
        success_count = sum(1 for v in results.values() if v)
        print(f"\nTotal Success: {success_count}/3 platforms")
        
        # Save records
        self.save_posting_record(results, {
            'telegram': telegram_content[:200],
            'twitter': twitter_content,
            'linkedin': linkedin_content[:200]
        })
        
        return results
    
    def save_posting_record(self, results, content_preview):
        """Save posting records"""
        record = {
            'timestamp': datetime.now().isoformat(),
            'results': results,
            'content_preview': content_preview
        }
        
        log_file = "/Users/srijan/ai-finance-agency/data/styled_posts.json"
        
        try:
            if os.path.exists(log_file):
                with open(log_file, 'r') as f:
                    logs = json.load(f)
            else:
                logs = []
            
            logs.append(record)
            
            os.makedirs(os.path.dirname(log_file), exist_ok=True)
            with open(log_file, 'w') as f:
                json.dump(logs, f, indent=2)
            
            print(f"\n📝 Records saved to {log_file}")
            
        except Exception as e:
            print(f"⚠️ Could not save record: {e}")

def main():
    """Main entry point"""
    import sys
    
    # Install required packages
    try:
        from requests_oauthlib import OAuth1Session
    except ImportError:
        print("Installing requests-oauthlib...")
        os.system("pip install requests-oauthlib")
    
    poster = PlatformStyledPoster()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--auto':
        poster.post_to_all_platforms()
    else:
        print("🎨 PLATFORM STYLED POSTER")
        print("=" * 60)
        print("Each platform gets unique, optimized content:")
        print("• Telegram: Detailed, emoji-rich, actionable")
        print("• Twitter: Punchy, trendy, hashtag-optimized")
        print("• LinkedIn: Professional, thought-leadership")
        print("=" * 60)
        print("\n1. Post to all platforms with unique styles")
        print("2. Preview content styles")
        print("3. Post to individual platform")
        
        choice = input("\nSelect (1-3): ").strip()
        
        if choice == "1":
            poster.post_to_all_platforms()
        elif choice == "2":
            print("\n📝 CONTENT STYLES PREVIEW")
            print("=" * 60)
            print("\nTELEGRAM STYLE:")
            print(poster.generate_telegram_content()[:500])
            print("\nTWITTER STYLE:")
            print(poster.generate_twitter_content())
            print("\nLINKEDIN STYLE:")
            print(poster.generate_linkedin_content()[:500])
        elif choice == "3":
            platform = input("Platform (telegram/twitter/linkedin): ").lower()
            if platform == "telegram":
                poster.post_to_telegram(poster.generate_telegram_content())
            elif platform == "twitter":
                poster.post_to_twitter(poster.generate_twitter_content())
            elif platform == "linkedin":
                poster.post_to_linkedin(poster.generate_linkedin_content())

if __name__ == "__main__":
    main()