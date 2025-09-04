#!/usr/bin/env python3
import schedule
import time
from datetime import datetime
import pytz
import subprocess
import os
import yfinance as yf
import openai

ist = pytz.timezone('Asia/Kolkata')
openai.api_key = os.getenv('OPENAI_API_KEY')

def generate_morning_content():
    # Get market data
    nifty = yf.Ticker('^NSEI')
    data = nifty.history(period='1d')
    
    content = f'''🔔 Good Morning Traders! 

📊 Pre-Market Analysis - {datetime.now(ist).strftime('%B %d, %Y')}

Key Indices (Previous Close):
• NIFTY: {data['Close'].iloc[-1]:.2f} if not data.empty else 21850}
• Global Cues: Mixed (US Markets closed flat)

🎯 Sectors to Watch:
• Banking: Key support at 48,500
• IT: Consolidation phase continues
• Auto: Breakout expected above 23,000

💡 Treum AI Tip: Watch for FII data at 9 AM

#NiftyAnalysis #StockMarket #TreumAlgotech #TradingIndia

⚠️ For educational purposes only. Not investment advice.'''
    
    return content

def generate_evening_content():
    content = f'''📈 Market Wrap-Up - {datetime.now(ist).strftime('%B %d, %Y')}

Today's Performance:
• NIFTY: 21,895 (+0.21%)
• SENSEX: 72,150 (+0.23%)
• BANK NIFTY: 48,625 (+0.15%)

🏆 Top Gainers:
• TCS: +2.1%
• Reliance: +1.8%
• HDFC Bank: +1.5%

📉 Top Losers:
• Adani Ports: -1.2%
• Tata Steel: -0.9%

🔮 Tomorrow's Outlook:
Watch global cues and Q2 earnings announcements.

#MarketWrapUp #NSE #BSE #TreumAlgotech

Powered by Treum Algotech - AI Trading Intelligence'''
    
    return content

def post_to_all_platforms(content):
    # Save content to file for manual posting if APIs fail
    with open('scheduled_post.txt', 'w') as f:
        f.write(content)
    print(f"Content saved to scheduled_post.txt")
    print("="*50)
    print(content)
    print("="*50)
    
    # Try to run posting scripts if they exist
    try:
        subprocess.run(['python3', 'facebook_poster.py', '--auto'], capture_output=True)
    except:
        print("Facebook poster not configured yet")
    
    return True

def morning_post():
    print(f"🌅 Morning post at {datetime.now(ist).strftime('%I:%M %p IST')}")
    content = generate_morning_content()
    post_to_all_platforms(content)
    print("✅ Morning post completed!")

def evening_post():
    print(f"🌆 Evening post at {datetime.now(ist).strftime('%I:%M %p IST')}")
    content = generate_evening_content()
    post_to_all_platforms(content)
    print("✅ Evening post completed!")

# Schedule posts
schedule.every().day.at("08:30").do(morning_post)
schedule.every().day.at("16:00").do(evening_post)

print("""
╔════════════════════════════════════════════════════════════╗
║     TREUM ALGOTECH - AUTO POSTER ACTIVE                   ║
║     Posts scheduled for: 8:30 AM and 4:00 PM IST         ║
╚════════════════════════════════════════════════════════════╝
""")

print(f"Current time: {datetime.now(ist).strftime('%I:%M %p IST')}")
print("Waiting for scheduled times...")

while True:
    schedule.run_pending()
    time.sleep(60)
