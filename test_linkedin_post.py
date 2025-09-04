#!/usr/bin/env python3
"""
Test LinkedIn Posting with Premium Content
"""

import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def post_to_linkedin():
    """Post premium content to LinkedIn"""
    
    access_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
    
    if not access_token:
        print("❌ No access token found")
        return False
    
    # Premium content to post
    content = """🚀 India's Hidden Market Opportunity

After analyzing 48 hours of market data, here's what smart money knows:

📊 Today's Reality:
• Nifty: 24,712 (-0.75%)
• FII Outflow: ₹13.23B YTD
• DII Inflow: ₹47.89B (Absorbing every dip)

💡 The Pattern Most Are Missing:
Similar FII-DII divergence in March 2019 → 15% rally in 90 days

🎯 3 Sectors Ready to Move:
1. IT - Breaking 8-month consolidation
2. Pharma - Testing 2-year resistance
3. Banking - Coiled spring at 52,000

📈 Smart Money Action:
→ Accumulate quality on dips
→ Keep 20% cash for volatility
→ Focus on earnings leaders

"Be greedy when others are fearful" - Buffett

This setup happens once every 2-3 years.

What's your view? Drop a comment 👇

#IndianStockMarket #Nifty50 #StockMarketIndia #InvestmentStrategy #WealthCreation"""
    
    print("📤 Posting to LinkedIn...")
    print("-" * 60)
    print(content[:200] + "...")
    print("-" * 60)
    
    # Import the poster module
    from linkedin_poster import post_content
    
    # Prepare content dict
    content_dict = {
        'content': content,
        'platform': 'linkedin'
    }
    
    # Post the content
    result = post_content(content_dict)
    
    print("\n📊 Result:")
    print(json.dumps(result, indent=2))
    
    if result.get('status') == 'success' or result.get('status') == 'saved':
        print("\n✅ Content ready for LinkedIn!")
        print(f"📁 Check: {result.get('filepath', 'posts/ folder')}")
        return True
    
    return False

if __name__ == "__main__":
    print("\n🚀 LinkedIn Premium Content Poster")
    print("=" * 60)
    
    if post_to_linkedin():
        print("\n" + "=" * 60)
        print("🎉 SUCCESS!")
        print("Your premium content is ready for LinkedIn")
        print("=" * 60)