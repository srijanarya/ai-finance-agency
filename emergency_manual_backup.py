#!/usr/bin/env python3
"""
Emergency Manual Backup - Post missed content NOW
"""

import os
from telethon.sync import TelegramClient
from dotenv import load_dotenv
from datetime import datetime
import yfinance as yf

load_dotenv()

api_id = os.getenv('TELEGRAM_API_ID')
api_hash = os.getenv('TELEGRAM_API_HASH')
channel = '@AIFinanceNews2024'

def get_market_data():
    """Get current market data"""
    try:
        symbols = {
            'NIFTY': '^NSEI',
            'SENSEX': '^BSESN', 
            'RELIANCE': 'RELIANCE.NS',
            'TCS': 'TCS.NS',
            'HDFC': 'HDFC.NS'
        }
        
        data = []
        for name, symbol in symbols.items():
            try:
                ticker = yf.Ticker(symbol)
                hist = ticker.history(period="1d")
                if not hist.empty:
                    price = hist['Close'].iloc[-1]
                    change = ((price - hist['Open'].iloc[0]) / hist['Open'].iloc[0]) * 100
                    emoji = "🟢" if change > 0 else "🔴"
                    data.append(f"{emoji} {name}: ₹{price:.2f} ({change:+.2f}%)")
            except:
                pass
        return "\n".join(data) if data else "Market data unavailable"
    except:
        return "Market data unavailable"

# Post 1: Missed Morning Update
morning_update = f"""📊 **MARKET ANALYSIS - AFTERNOON UPDATE** 📊

Today's Market Performance:
{get_market_data()}

📈 Key Observations:
• Banking sector showing strength
• IT stocks consolidating
• Metal stocks under pressure from global cues

💡 Afternoon Strategy:
Wait for 3:30 PM for intraday positions. Avoid FOMO!

🔔 Follow @AIFinanceNews2024 for EOD analysis!

#StockMarket #NIFTY #SENSEX #Trading"""

# Post 2: Trading Tip
trading_tip = """🎯 **POWER HOUR TRADING TIP** 🎯

The last hour (3:00-3:30 PM) often sees:
✅ Intraday square-offs
✅ Institutional activity
✅ Tomorrow's gap indicators

Pro Tip: Watch volume spikes in the last 30 minutes - they often predict next day's opening!

📊 Risk Management Rule:
Never hold intraday positions overnight unless you're prepared for gap risk.

@AIFinanceNews2024 #TradingStrategy #RiskManagement"""

# Post 3: Educational Content
education = """📚 **LEARN: CANDLESTICK PATTERNS** 📚

Today's Pattern: DOJI

What it means:
• Open and close prices are nearly equal
• Indicates market indecision
• Often signals potential reversal

How to trade it:
1. Wait for confirmation candle
2. Look at overall trend context
3. Check volume for validation

🎓 Master one pattern at a time!

Follow @AIFinanceNews2024 for daily pattern lessons

#TechnicalAnalysis #CandlestickPatterns #LearnTrading"""

# Post all three
posts = [
    ("Market Analysis", morning_update),
    ("Trading Tip", trading_tip),
    ("Educational Content", education)
]

print("=" * 60)
print("🚨 EMERGENCY CONTENT POSTING")
print("=" * 60)
print(f"Time: {datetime.now().strftime('%H:%M:%S')}")
print(f"Channel: {channel}")
print("=" * 60)

with TelegramClient('srijan_session', api_id, api_hash) as client:
    for title, content in posts:
        try:
            result = client.send_message(channel, content)
            print(f"✅ Posted: {title} (Message ID: {result.id})")
        except Exception as e:
            print(f"❌ Failed to post {title}: {e}")

print("=" * 60)
print("✅ Catch-up posts completed!")
print("Now starting continuous auto-poster...")
print("=" * 60)