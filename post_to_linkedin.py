#!/usr/bin/env python3
import os
import requests
import json
from datetime import datetime

# Get the token from environment
with open('.env', 'r') as f:
    for line in f:
        if line.startswith('LINKEDIN_ACCESS_TOKEN='):
            access_token = line.strip().split('=')[1]
            break

# Create engaging content
content = f"""🚀 Market Insights | {datetime.now().strftime('%B %d, %Y')}

📊 Today's Trading Wisdom:
"In investing, what is comfortable is rarely profitable." - Robert Arnott

Key Market Lessons:
• Volatility creates opportunity for patient investors
• Risk management preserves capital for future gains
• Consistent strategy beats market timing
• Knowledge and discipline drive long-term success

💡 Remember: Every market cycle offers lessons. The key is to keep learning, adapting, and growing.

What's your biggest market learning this week?

#StockMarket #InvestmentStrategy #TradingWisdom #FinancialMarkets #WealthCreation"""

# Post to LinkedIn using personal URN
headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0'
}

# LinkedIn API payload for personal profile
data = {
    "author": "urn:li:person:ACoAABKNVpMB_uCNGv8olFM-a_a7aCY-Q7M9gIU",  # Your personal URN
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
    print("✅ Successfully posted to LinkedIn!")
    print(f"Post ID: {response.headers.get('X-RestLi-Id', 'unknown')}")
else:
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
