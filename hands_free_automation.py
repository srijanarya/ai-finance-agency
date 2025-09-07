#!/usr/bin/env python3
"""
Hands-Free Telegram Automation - Posts valuable content automatically
"""

import os
import time
import random
from telethon.sync import TelegramClient
from dotenv import load_dotenv
import yfinance as yf
from datetime import datetime

# Load environment
load_dotenv()

# Credentials
api_id = os.getenv('TELEGRAM_API_ID')
api_hash = os.getenv('TELEGRAM_API_HASH')
channel = '@AIFinanceNews2024'

def get_market_snapshot():
    """Get quick market data"""
    try:
        symbols = {'NIFTY': '^NSEI', 'SENSEX': '^BSESN', 'RELIANCE': 'RELIANCE.NS'}
        data = []
        for name, symbol in symbols.items():
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="1d")
            if not hist.empty:
                price = hist['Close'].iloc[-1]
                change = ((price - hist['Open'].iloc[0]) / hist['Open'].iloc[0]) * 100
                emoji = "🟢" if change > 0 else "🔴"
                data.append(f"{emoji} {name}: ₹{price:.2f} ({change:+.2f}%)")
        return "\n".join(data) if data else "Market data unavailable"
    except:
        return "Market data unavailable"

def generate_content():
    """Generate different content types"""
    hour = datetime.now().hour
    
    # Morning update (9-10 AM)
    if 9 <= hour < 10:
        market = get_market_snapshot()
        return f"""📊 **MORNING MARKET UPDATE** 📊

{market}

💡 Today's Trading Tip:
Never chase a gap-up opening. Wait for the first 15-minute candle to close.

🔔 Follow @AIFinanceNews2024 for real-time updates!

#StockMarket #Trading #NIFTY #SENSEX"""

    # Mid-day analysis (12-2 PM)
    elif 12 <= hour < 14:
        tips = [
            "Volume spikes often precede price movements. Watch for unusual activity!",
            "Support becomes resistance once broken. Always respect these levels.",
            "The first hour and last hour of trading often set the day's range.",
            "Never average down on a losing position without a clear plan."
        ]
        return f"""🎯 **MID-DAY TRADING WISDOM** 🎯

💡 {random.choice(tips)}

📈 Key Levels to Watch:
• NIFTY Support: 25,100 | Resistance: 25,400
• BANK NIFTY Support: 51,200 | Resistance: 51,800

⚡ Trade with discipline, not emotions!

@AIFinanceNews2024 #TradingTips #StockMarket"""

    # Educational content (3-5 PM)
    elif 15 <= hour < 17:
        topics = [
            ("P/E Ratio", "Price ÷ Earnings per Share\n\n• < 15: Potentially undervalued\n• 15-25: Fair value\n• > 25: Potentially overvalued"),
            ("RSI Indicator", "Measures momentum (0-100)\n\n• > 70: Overbought zone\n• < 30: Oversold zone\n• 40-60: Neutral zone"),
            ("Moving Averages", "Trend following indicator\n\n• Price > MA: Bullish\n• Price < MA: Bearish\n• MA crossover: Trend change")
        ]
        topic, content = random.choice(topics)
        return f"""📚 **LEARN WITH AI FINANCE** 📚

Today's Topic: {topic}

{content}

🎓 Knowledge is profit!

Follow @AIFinanceNews2024 for daily lessons

#LearnTrading #StockMarketEducation #TechnicalAnalysis"""

    # Evening wrap-up (6-8 PM)
    elif 18 <= hour < 20:
        return f"""🌆 **MARKET CLOSING SUMMARY** 🌆

{get_market_snapshot()}

📊 Tomorrow's Watchlist:
• IT Stocks (TCS, Infy) - Q3 results impact
• Banking sector - RBI policy watch
• Metals - Global cues important

💪 Rest well, trade better tomorrow!

@AIFinanceNews2024 #MarketClose #Trading"""

    # Motivational content (other times)
    else:
        quotes = [
            "The stock market transfers money from the impatient to the patient. - Warren Buffett",
            "Risk comes from not knowing what you're doing. - Warren Buffett",
            "The trend is your friend until the end. - Market Wisdom",
            "Cut your losses short, let your profits run. - Trading Rule #1"
        ]
        return f"""💎 **TRADER'S MOTIVATION** 💎

"{random.choice(quotes)}"

🎯 Remember: Consistency beats intensity in trading.

📈 Small daily gains compound into wealth!

@AIFinanceNews2024 #TradingMotivation #SuccessMindset"""

def main():
    """Main automation loop"""
    print("=" * 60)
    print("🚀 HANDS-FREE TELEGRAM AUTOMATION")
    print("=" * 60)
    print(f"Channel: {channel}")
    print("Posting valuable content every 30-45 minutes")
    print("Press Ctrl+C to stop")
    print("=" * 60)
    
    post_count = 0
    
    # Use existing session
    with TelegramClient('srijan_session', api_id, api_hash) as client:
        print("✅ Connected to Telegram")
        
        while True:
            try:
                # Generate fresh content
                content = generate_content()
                
                # Post to channel
                result = client.send_message(channel, content)
                post_count += 1
                
                print(f"\n📮 Post #{post_count} sent at {datetime.now().strftime('%H:%M:%S')}")
                print(f"   Type: {content.split('**')[1] if '**' in content else 'Update'}")
                print(f"   Message ID: {result.id}")
                
                # Wait 30-45 minutes
                wait_time = random.randint(1800, 2700)
                print(f"⏰ Next post in {wait_time//60} minutes...")
                time.sleep(wait_time)
                
            except KeyboardInterrupt:
                print(f"\n\n👋 Stopping... Total posts: {post_count}")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                print("Retrying in 5 minutes...")
                time.sleep(300)

if __name__ == "__main__":
    main()