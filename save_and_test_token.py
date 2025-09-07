#!/usr/bin/env python3
"""
Save and test LinkedIn token from Token Generator
"""

import os
import sys
import requests
import json
from datetime import datetime

def save_token_to_env(token):
    """Save token to .env file"""
    
    # Read existing .env
    lines = []
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                # Skip old LinkedIn tokens
                if not line.startswith('LINKEDIN_ACCESS_TOKEN='):
                    lines.append(line)
    
    # Add new token
    lines.append(f"\n# LinkedIn Token from Token Generator - {datetime.now()}\n")
    lines.append(f"LINKEDIN_ACCESS_TOKEN={token}\n")
    lines.append(f"LINKEDIN_COMPANY_ID=108595796\n")
    
    # Write back
    with open('.env', 'w') as f:
        f.writelines(lines)
    
    print("✅ Token saved to .env file")

def test_token_permissions(token):
    """Test what the token can do"""
    
    headers = {
        'Authorization': f'Bearer {token}',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    print("\n🔍 Testing token capabilities...")
    print("-" * 50)
    
    # Test 1: User info
    user_response = requests.get(
        'https://api.linkedin.com/v2/userinfo',
        headers={'Authorization': f'Bearer {token}'}
    )
    
    if user_response.status_code == 200:
        user_data = user_response.json()
        print(f"✅ User: {user_data.get('name')}")
        print(f"   Email: {user_data.get('email')}")
    else:
        print("❌ Cannot access user info")
    
    # Test 2: Organization access
    org_response = requests.get(
        'https://api.linkedin.com/v2/organizationAcls?q=roleAssignee',
        headers=headers
    )
    
    has_company_access = False
    if org_response.status_code == 200:
        org_data = org_response.json()
        if org_data.get('elements'):
            print("\n✅ Company access found:")
            for org in org_data['elements']:
                org_id = org.get('organization', '').replace('urn:li:organization:', '')
                role = org.get('role', 'unknown')
                print(f"   Organization ID: {org_id}")
                print(f"   Role: {role}")
                if org_id == "108595796":  # Treum Algotech
                    has_company_access = True
                    print("   ✅ This is Treum Algotech!")
        else:
            print("⚠️ No organization access")
    else:
        print(f"❌ Cannot access organizations: {org_response.status_code}")
    
    return has_company_access

def post_to_company(token):
    """Post to Treum Algotech company page"""
    
    content = f"""🚀 Treum Algotech Market Update | {datetime.now().strftime('%B %d, %Y')}

📊 Algorithmic Trading Insights:

Today's financial markets present unique opportunities for systematic traders. Our AI-powered algorithms are identifying profitable patterns across multiple asset classes.

🎯 Key Market Observations:
• Equity indices showing momentum breakouts
• Currency pairs presenting arbitrage opportunities
• Commodity markets following seasonal trends
• Fixed income offering attractive risk-reward ratios

💡 Technology Spotlight:
At Treum Algotech, we leverage cutting-edge AI and machine learning to:
- Process thousands of market signals in real-time
- Execute trades with microsecond precision
- Manage risk through dynamic position sizing
- Adapt to changing market conditions automatically

🔐 Risk Management:
Our proprietary risk management system ensures capital preservation while maximizing returns through:
• Real-time portfolio monitoring
• Automated stop-loss protocols
• Position size optimization
• Correlation-based hedging strategies

Ready to transform your trading with algorithmic precision?

#AlgorithmicTrading #FinTech #AI #MachineLearning #QuantitativeFinance #TradingTechnology #MarketAnalysis #TreumAlgotech"""
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    company_urn = "urn:li:organization:108595796"
    
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
    
    print("\n📤 Posting to Treum Algotech company page...")
    print("-" * 50)
    
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
                'platform': 'LinkedIn - Treum Algotech Company Page'
            }, f, indent=2)
        
        print(f"📁 Saved to posts/company_post_{timestamp}.json")
        return True
    else:
        print(f"❌ Failed: {response.status_code}")
        error = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
        print(f"Error: {error.get('message', response.text)}")
        return False

def main():
    print("=" * 70)
    print("🔐 LinkedIn Token Setup & Test")
    print("=" * 70)
    
    if len(sys.argv) > 1:
        # Token passed as argument
        token = sys.argv[1]
        print(f"\n✅ Received token (first 30 chars): {token[:30]}...")
    else:
        # Ask for token
        print("\n📋 Steps to get token:")
        print("1. Go to: https://www.linkedin.com/developers/tools/oauth/token-generator")
        print("2. Select your app")
        print("3. Check these scopes:")
        print("   ✓ w_member_social")
        print("   ✓ w_organization_social")
        print("   ✓ r_organization_social")
        print("   ✓ rw_organization_admin")
        print("4. Click 'Request access token'")
        print("\nPaste your token here: ", end="")
        token = input().strip()
    
    if not token:
        print("❌ No token provided")
        return
    
    # Save token
    save_token_to_env(token)
    
    # Test token
    has_company_access = test_token_permissions(token)
    
    if has_company_access:
        print("\n" + "=" * 70)
        print("🎯 Ready to post to company page!")
        print("=" * 70)
        
        # Try posting
        if post_to_company(token):
            print("\n🎉 SUCCESS! Posted to Treum Algotech company page!")
        else:
            print("\n⚠️ Could not post. Check token permissions.")
    else:
        print("\n⚠️ Token doesn't have Treum Algotech access.")
        print("Make sure to:")
        print("1. Select the correct app in Token Generator")
        print("2. Check all company scopes")
        print("3. Authorize as admin of Treum Algotech")

if __name__ == "__main__":
    main()