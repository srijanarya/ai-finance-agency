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

# Create content
content = f"""🎯 Financial Insight | {datetime.now().strftime('%B %d, %Y')}

📈 Market Perspective:

"The stock market is filled with individuals who know the price of everything, but the value of nothing." - Philip Fisher

Today's Key Takeaways:
✅ Focus on value, not just price movements
✅ Long-term vision beats short-term speculation
✅ Risk management is wealth preservation
✅ Patience and discipline create sustainable returns

💡 In volatile markets, the winners are those who stay educated, stay disciplined, and stay invested.

What's your approach to navigating market volatility?

#InvestmentStrategy #StockMarket #FinancialWisdom #WealthBuilding #MarketInsights"""

# Use member URN format
headers = {
    'Authorization': f'Bearer {access_token}',
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0'
}

# First, let's get the member ID
profile_response = requests.get(
    'https://api.linkedin.com/v2/userinfo',
    headers={'Authorization': f'Bearer {access_token}'}
)

if profile_response.status_code == 200:
    profile_data = profile_response.json()
    member_id = profile_data.get('sub', '')
    print(f"Member ID: {member_id}")
    
    # Post using member URN
    data = {
        "author": f"urn:li:member:{member_id}",
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
        print("\n📄 Post content:")
        print(content)
    else:
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
else:
    print(f"Failed to get profile: {profile_response.status_code}")
    print(profile_response.text)
