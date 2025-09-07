#!/usr/bin/env python3
"""
Simplified Telegram Auto Poster - Posts valuable content to your channel
Uses existing session file to avoid authentication issues
"""

import asyncio
import os
import random
from datetime import datetime
from dotenv import load_dotenv
from telethon import TelegramClient
import yfinance as yf

# Load environment variables
load_dotenv()

class TelegramAutoPoster:
    def __init__(self):
        self.api_id = os.getenv('TELEGRAM_API_ID')
        self.api_hash = os.getenv('TELEGRAM_API_HASH')
        self.channel = os.getenv('TELEGRAM_CHANNEL_ID', '@AIFinanceNews2024')
        self.client = None
        
    async def connect(self):
        """Connect using existing session"""
        print("🔌 Connecting to Telegram...")
        
        # Try existing session files
        session_files = ['srijan_session', 'automation_session', 'test_session', 'growth_session']
        
        for session_name in session_files:
            if os.path.exists(f'{session_name}.session'):
                print(f"📁 Using existing session: {session_name}")
                self.client = TelegramClient(session_name, self.api_id, self.api_hash)
                
                try:
                    await self.client.connect()
                    if await self.client.is_user_authorized():
                        me = await self.client.get_me()
                        print(f"✅ Connected as: {me.first_name} (@{me.username})")
                        return True
                except:
                    continue
        
        print("❌ No valid session found. Please authenticate manually first.")
        return False
    
    async def get_market_data(self):
        """Get live market data"""
        try:
            symbols = {
                'NIFTY': '^NSEI',
                'SENSEX': '^BSESN',
                'RELIANCE': 'RELIANCE.NS',
                'TCS': 'TCS.NS',
                'INFY': 'INFY.NS'
            }
            
            data = {}
            for name, symbol in symbols.items():
                try:
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period="1d")
                    if not hist.empty:
                        current = hist['Close'].iloc[-1]
                        prev_close = hist['Open'].iloc[0]
                        change = ((current - prev_close) / prev_close) * 100
                        data[name] = {
                            'price': round(current, 2),
                            'change': round(change, 2)
                        }
                except:
                    pass
            
            return data
        except:
            return {}
    
    def generate_content(self):
        """Generate different types of valuable content"""
        content_types = [
            self.market_update_content,
            self.trading_tip_content,
            self.educational_content,
            self.motivational_content,
            self.news_analysis_content
        ]
        
        return random.choice(content_types)()
    
    def market_update_content(self):
        """Generate market update content"""
        market_data = asyncio.run(self.get_market_data())
        
        content = "📊 **MARKET UPDATE** 📊\n\n"
        
        if market_data:
            for symbol, data in market_data.items():
                emoji = "🟢" if data['change'] > 0 else "🔴"
                content += f"{emoji} **{symbol}**: ₹{data['price']} ({data['change']:+.2f}%)\n"
        
        content += "\n" + random.choice([
            "💡 Trade with discipline, not emotions",
            "📈 The trend is your friend",
            "⚡ Risk management is key to survival",
            "🎯 Plan your trade, trade your plan",
            "💪 Patience pays in the market"
        ])
        
        content += "\n\n🔔 Follow @AIFinanceNews2024 for more updates!"
        
        return content
    
    def trading_tip_content(self):
        """Generate trading tips"""
        tips = [
            {
                'title': '🎯 TRADING TIP OF THE DAY',
                'content': 'Never risk more than 2% of your capital on a single trade. This ensures you can survive losing streaks and stay in the game long-term.',
                'action': '📌 Set your stop loss before entering any trade!'
            },
            {
                'title': '💡 SMART MONEY TIP',
                'content': 'Volume precedes price. Watch for unusual volume spikes - they often signal big moves coming.',
                'action': '🔍 Check volume before taking positions!'
            },
            {
                'title': '📈 PROFIT BOOKING STRATEGY',
                'content': 'Book 50% profits at 1:2 risk-reward, let the rest run with trailing stop loss.',
                'action': '✅ Secure profits systematically!'
            }
        ]
        
        tip = random.choice(tips)
        
        return f"{tip['title']}\n\n{tip['content']}\n\n{tip['action']}\n\n🔔 @AIFinanceNews2024"
    
    def educational_content(self):
        """Generate educational content"""
        topics = [
            {
                'title': '📚 WHAT IS P/E RATIO?',
                'content': 'P/E (Price-to-Earnings) ratio shows how much investors are willing to pay per rupee of earnings.\n\nP/E = Share Price ÷ EPS\n\n• P/E < 15: May be undervalued\n• P/E 15-25: Fair value\n• P/E > 25: May be overvalued\n\nAlways compare with industry average!'
            },
            {
                'title': '📊 UNDERSTANDING RSI',
                'content': 'RSI (Relative Strength Index) measures momentum:\n\n• RSI > 70: Overbought (potential reversal)\n• RSI < 30: Oversold (potential bounce)\n• RSI 40-60: Neutral zone\n\nBest used with other indicators for confirmation!'
            },
            {
                'title': '💰 POWER OF COMPOUNDING',
                'content': '₹10,000 invested with 15% annual returns:\n\n• 5 years: ₹20,113\n• 10 years: ₹40,455\n• 20 years: ₹1,63,665\n• 30 years: ₹6,62,117\n\nStart early, stay invested!'
            }
        ]
        
        topic = random.choice(topics)
        
        return f"{topic['title']}\n\n{topic['content']}\n\n📖 Learn more @AIFinanceNews2024"
    
    def motivational_content(self):
        """Generate motivational content"""
        quotes = [
            "💎 Warren Buffett: 'Be fearful when others are greedy, and greedy when others are fearful.'",
            "🏆 Jesse Livermore: 'The market is never wrong, opinions often are.'",
            "🌟 Peter Lynch: 'Know what you own, and know why you own it.'",
            "⚡ George Soros: 'It's not whether you're right or wrong, but how much money you make when you're right.'",
            "🎯 Paul Tudor Jones: 'Risk control is the most important thing in trading.'"
        ]
        
        quote = random.choice(quotes)
        
        return f"**WISDOM FROM LEGENDS** 📜\n\n{quote}\n\n💪 Stay disciplined!\n\n@AIFinanceNews2024"
    
    def news_analysis_content(self):
        """Generate news analysis content"""
        analyses = [
            {
                'title': '📰 RBI POLICY IMPACT',
                'content': 'RBI keeps rates unchanged:\n\n✅ Good for: Growth stocks, Real Estate\n❌ Cautious on: Banking margins\n🎯 Focus: Quality mid-caps\n\nStrategy: Accumulate on dips'
            },
            {
                'title': '🌍 GLOBAL MARKETS',
                'content': 'US Fed signals:\n\n• Dollar strengthening\n• FII outflows possible\n• IT stocks may benefit\n• Metals under pressure\n\nHedge your portfolio!'
            },
            {
                'title': '📊 EARNINGS SEASON',
                'content': 'Q3 Results Preview:\n\n🟢 IT: Strong outlook\n🟢 Banks: Steady growth\n🟡 Auto: Mixed signals\n🔴 Realty: Pressure visible\n\nStock-specific approach needed!'
            }
        ]
        
        analysis = random.choice(analyses)
        
        return f"{analysis['title']}\n\n{analysis['content']}\n\n📡 Stay updated @AIFinanceNews2024"
    
    async def post_content(self, content):
        """Post content to channel"""
        try:
            await self.client.send_message(self.channel, content, parse_mode='markdown')
            print(f"✅ Posted to {self.channel}")
            return True
        except Exception as e:
            print(f"❌ Error posting: {e}")
            return False
    
    async def run_auto_poster(self):
        """Main auto-posting loop"""
        if not await self.connect():
            print("Failed to connect. Exiting.")
            return
        
        print(f"\n🚀 Starting auto-poster for {self.channel}")
        print("=" * 50)
        
        post_count = 0
        
        while True:
            try:
                # Generate content
                content = self.generate_content()
                
                # Post to channel
                if await self.post_content(content):
                    post_count += 1
                    print(f"📮 Post #{post_count} sent at {datetime.now().strftime('%H:%M:%S')}")
                    print(f"   Type: {content.split()[0]}")
                
                # Wait 30-60 minutes before next post
                wait_time = random.randint(1800, 3600)  # 30-60 minutes
                print(f"⏰ Next post in {wait_time//60} minutes...")
                await asyncio.sleep(wait_time)
                
            except KeyboardInterrupt:
                print("\n👋 Stopping auto-poster...")
                break
            except Exception as e:
                print(f"Error: {e}")
                await asyncio.sleep(300)  # Wait 5 minutes on error
        
        await self.client.disconnect()
        print(f"\n📊 Total posts: {post_count}")

async def main():
    poster = TelegramAutoPoster()
    await poster.run_auto_poster()

if __name__ == "__main__":
    print("=" * 60)
    print("🤖 TELEGRAM AUTO-POSTER")
    print("=" * 60)
    print("This will post valuable content to your channel every 30-60 minutes")
    print("Press Ctrl+C to stop")
    print("=" * 60)
    
    asyncio.run(main())