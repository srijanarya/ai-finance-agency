#!/usr/bin/env python3
import os
import requests
import json
from datetime import datetime

# Get the token
with open('.env', 'r') as f:
    for line in f:
        if line.startswith('LINKEDIN_ACCESS_TOKEN='):
            access_token = line.strip().split('=')[1]
            break

# Create professional content
content = f"""📊 Market Update | {datetime.now().strftime('%B %d, %Y')}

🎯 Strategic Insights for Smart Investors:

The markets continue to offer compelling opportunities for those who understand the fundamentals. Today's volatility is tomorrow's opportunity.

Key Strategies for Success:
• Diversification across sectors reduces portfolio risk
• Dollar-cost averaging smooths market volatility
• Focus on companies with strong fundamentals
• Maintain liquidity for unexpected opportunities

💡 "Time in the market beats timing the market" - This principle remains as true today as ever.

Remember: Successful investing is not about predicting the future, but about preparing for it.

What's your investment strategy for the current market cycle?

#FinancialMarkets #InvestmentStrategy #WealthManagement #StockMarket #FinancialPlanning"""

# Post to Treum Algotech company page (organization URN from your working curl command)
headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0'
}

data = {
    "author": "urn:li:organization:108595796",  # Treum Algotech organization URN
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
    print("✅ Successfully posted to LinkedIn (Treum Algotech)!")
    print(f"📌 Post ID: {response.headers.get('X-RestLi-Id', 'unknown')}")
    print("\n📄 Posted content:")
    print("-" * 60)
    print(content)
    print("-" * 60)
    
    # Save post record
    os.makedirs('posts', exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    with open(f'posts/linkedin_post_{timestamp}.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'post_id': response.headers.get('X-RestLi-Id', 'unknown'),
            'content': content,
            'platform': 'LinkedIn - Treum Algotech'
        }, f, indent=2)
    print(f"\n📁 Post saved to posts/linkedin_post_{timestamp}.json")
else:
    print(f"❌ Failed to post. Status: {response.status_code}")
    print(f"Response: {response.text}")
