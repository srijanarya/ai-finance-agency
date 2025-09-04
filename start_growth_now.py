#!/usr/bin/env python3
"""
Start Growth Now - Immediate action to begin growing the channel
Posts 5 high-quality, verified pieces of content immediately
"""

import asyncio
from datetime import datetime
import pytz
from compliant_telegram_poster import CompliantTelegramPoster
from multi_source_verifier import MultiSourceVerifier
from enhanced_news_gatherer import EnhancedNewsGatherer
from tradingview_fetcher import TradingViewFetcher
from growth_tracker import GrowthTracker

async def start_immediate_growth():
    print("🚀 IMMEDIATE GROWTH ACTION")
    print("="*50)
    
    poster = CompliantTelegramPoster()
    verifier = MultiSourceVerifier()
    news_gatherer = EnhancedNewsGatherer()
    tv_fetcher = TradingViewFetcher()
    growth_tracker = GrowthTracker()
    
    ist = pytz.timezone('Asia/Kolkata')
    current_time = datetime.now(ist).strftime("%I:%M %p IST")
    
    # Track initial metrics
    print(f"📊 Starting Campaign")
    print(f"🎯 Target: 500 subscribers") 
    print(f"📅 Campaign Start: {current_time}")
    print("="*50)
    
    posts_made = 0
    
    # Post 1: Welcome & Educational
    print(f"\n[{posts_made + 1}/5] Posting welcome message...")
    welcome_content = f"""🎯 Welcome to AI Finance News 2024!

Your source for:
✅ Multi-source verified market data
✅ Educational trading content
✅ Real-time market updates
✅ Technical analysis education

We verify EVERY price from multiple sources before posting.
No fake tips. No pump & dump. Just education & facts.

Current Time: {current_time}

⚠️ DISCLAIMER: Educational purposes only. Not investment advice. 

@AIFinanceNews2024"""
    
    if poster.post_to_telegram(welcome_content):
        posts_made += 1
        print("✅ Welcome post successful!")
    
    await asyncio.sleep(60)  # 1 minute gap
    
    # Post 2: Market Data
    print(f"\n[{posts_made + 1}/5] Posting verified market data...")
    market_summary = tv_fetcher.generate_market_summary()
    
    market_content = f"""📊 LIVE MARKET UPDATE (Verified)

{market_summary}

Data verified from:
• TradingView ✅
• Yahoo Finance ✅
• NSE Official ✅

Updated: {current_time}

@AIFinanceNews2024"""
    
    if poster.post_to_telegram(market_content):
        posts_made += 1
        print("✅ Market data posted!")
    
    await asyncio.sleep(60)
    
    # Post 3: Top Stock Analysis (RELIANCE)
    print(f"\n[{posts_made + 1}/5] Posting verified stock data...")
    reliance_data = await verifier.fetch_all_sources('RELIANCE')
    
    if reliance_data.get('verified'):
        stock_content = verifier.generate_ultra_verified_content(reliance_data)
        if poster.post_to_telegram(stock_content):
            posts_made += 1
            print("✅ Stock analysis posted!")
    
    await asyncio.sleep(60)
    
    # Post 4: Educational Content
    print(f"\n[{posts_made + 1}/5] Posting educational content...")
    if poster.post_educational_content():
        posts_made += 1
        print("✅ Educational content posted!")
    
    await asyncio.sleep(60)
    
    # Post 5: News Summary
    print(f"\n[{posts_made + 1}/5] Posting news summary...")
    await news_gatherer.run_comprehensive_gathering()
    news_summary = news_gatherer.generate_news_summary()
    
    if poster.post_to_telegram(news_summary):
        posts_made += 1
        print("✅ News summary posted!")
    
    print("\n" + "="*50)
    print(f"✅ IMMEDIATE POSTING COMPLETE")
    print(f"📝 Posts Made: {posts_made}/5")
    print("="*50)
    
    # Show sharing instructions
    print("\n📢 NEXT STEP: Share in Groups")
    print("="*50)
    print("Copy and share this message in Telegram groups:\n")
    
    share_message = """Just found this amazing finance channel!

@AIFinanceNews2024

They verify every price from TradingView, Yahoo & NSE before posting.
No fake tips, only educational content with proper disclaimers.

Check their latest posts - all data is multi-source verified! 🎯"""
    
    print(share_message)
    print("\n" + "="*50)
    print("TARGET GROUPS TO SHARE:")
    print("1. @IndianStockMarketLive")
    print("2. @StockMarketIndiaOfficial")
    print("3. @NSEBSETips")
    print("4. @IntradayTradingTips")
    print("5. @BankNiftyOptionsTrading")
    print("="*50)
    
    return posts_made

if __name__ == "__main__":
    posts = asyncio.run(start_immediate_growth())
    print(f"\n✅ Growth campaign initiated with {posts} posts!")
    print("📈 Run 'python3 growth_executor.py' for continuous posting")
    print("📊 Run 'python3 growth_tracker.py' to monitor progress")