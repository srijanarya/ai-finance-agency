#!/usr/bin/env python3
"""
Post to LinkedIn Company Page using existing token
"""

import os
import requests
import json
from datetime import datetime

def post_to_company():
    """Try posting to company page with existing token"""
    
    # Get token from .env
    access_token = None
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if line.startswith('LINKEDIN_ACCESS_TOKEN='):
                    access_token = line.strip().split('=', 1)[1]
                    break
    
    if not access_token:
        print("❌ No access token found in .env")
        return
    
    print("✅ Using existing access token")
    
    # Company content
    content = f"""🚀 Treum Algotech Insights | {datetime.now().strftime('%B %d, %Y')}

📊 Market Analysis Update:

The financial markets continue to present opportunities for algorithmic traders. Our AI-powered systems are identifying key patterns across global markets.

🎯 Today's Focus Areas:
• Equity markets showing momentum signals
• Currency pairs presenting arbitrage opportunities
• Commodity trends aligning with seasonal patterns
• Fixed income spreads at attractive levels

💡 At Treum Algotech, we combine cutting-edge technology with proven trading strategies to deliver consistent results.

Our quantitative models process thousands of data points in real-time, ensuring we never miss an opportunity while maintaining strict risk controls.

Ready to transform your trading with AI-powered precision?

#AlgorithmicTrading #FinTech #AI #TradingTechnology #MarketAnalysis #TreumAlgotech"""
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    # Try posting to company page
    company_id = "108595796"
    company_urn = f"urn:li:organization:{company_id}"
    
    post_data = {
        "author": company_urn,
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
    
    print(f"\n📤 Attempting to post to Treum Algotech (ID: {company_id})...")
    
    response = requests.post(
        'https://api.linkedin.com/v2/ugcPosts',
        headers=headers,
        json=post_data
    )
    
    if response.status_code == 201:
        post_id = response.headers.get('X-RestLi-Id', 'unknown')
        print(f"✅ Successfully posted to company page!")
        print(f"📌 Post ID: {post_id}")
        print(f"🔗 View at: https://www.linkedin.com/company/treum-algotech/")
        
        # Save record
        os.makedirs('posts', exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        with open(f'posts/company_post_{timestamp}.json', 'w') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'post_id': post_id,
                'content': content,
                'platform': 'LinkedIn - Treum Algotech',
                'company_id': company_id
            }, f, indent=2)
        
        return True
    else:
        print(f"❌ Failed: {response.status_code}")
        error = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
        print(f"Error: {error.get('message', response.text)}")
        
        if response.status_code == 403:
            print("\n⚠️ This token doesn't have company posting permissions.")
            print("You need a token with 'w_organization_social' scope.")
        
        return False

if __name__ == "__main__":
    print("=" * 70)
    print("🏢 LinkedIn Company Page Poster")
    print("=" * 70)
    
    if post_to_company():
        print("\n🎉 Success!")
    else:
        print("\n❌ Unable to post to company page")
        print("\nTo fix this, you need to:")
        print("1. Check your LinkedIn app's registered redirect URIs")
        print("2. Or create a new LinkedIn app with the correct settings")
        print("3. Or add yourself as an admin of the company page")