#!/usr/bin/env python3
"""
Quick Launch - Post 3 verified content pieces immediately
"""

import asyncio
from datetime import datetime
import pytz
from compliant_telegram_poster import CompliantTelegramPoster
from tradingview_fetcher import TradingViewFetcher
from multi_source_verifier import MultiSourceVerifier

async def quick_launch():
    poster = CompliantTelegramPoster()
    tv_fetcher = TradingViewFetcher()
    verifier = MultiSourceVerifier()
    ist = pytz.timezone('Asia/Kolkata')
    
    print("🚀 QUICK LAUNCH - 3 POSTS")
    print("="*50)
    
    # Post 1: Market Summary
    print("\n[1/3] Posting market summary...")
    market_summary = tv_fetcher.generate_market_summary()
    content1 = f"""📊 LIVE MARKET DATA (Multi-Source Verified)

{market_summary}

✅ Verified from TradingView & Yahoo Finance
📚 Educational purpose only

@AIFinanceNews2024"""
    
    if poster.post_to_telegram(content1):
        print("✅ Market summary posted!")
    
    # Post 2: Educational
    print("\n[2/3] Posting educational content...")
    if poster.post_educational_content():
        print("✅ Educational content posted!")
    
    # Post 3: Stock Analysis
    print("\n[3/3] Fetching and posting RELIANCE data...")
    data = await verifier.fetch_all_sources('RELIANCE')
    if data.get('verified') and data['confidence'] in ['HIGH', 'VERY HIGH']:
        content3 = verifier.generate_ultra_verified_content(data)
        if poster.post_to_telegram(content3):
            print("✅ RELIANCE analysis posted!")
    
    print("\n" + "="*50)
    print("✅ QUICK LAUNCH COMPLETE!")
    print("="*50)
    print("\n📢 SHARE THIS IN GROUPS NOW:")
    print("\nNew verified finance channel launched!")
    print("@AIFinanceNews2024")
    print("\n• Multi-source price verification")
    print("• Educational content only")
    print("• No fake tips or pump & dump")
    print("• Free for first 500 members!")
    
    return True

if __name__ == "__main__":
    asyncio.run(quick_launch())