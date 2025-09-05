#!/usr/bin/env python3
"""
LinkedIn Company Page Posting Script - Treum Algotech
"""

import os
import requests
import json
from datetime import datetime
import webbrowser
import urllib.parse

# Company details
COMPANY_ID = "108595796"  # Treum Algotech LinkedIn Company ID
COMPANY_URN = f"urn:li:organization:{COMPANY_ID}"

# App credentials
CLIENT_ID = "776dnomhse84tj"
CLIENT_SECRET = "WPL_AP1.r3GQEtOyAZpKQkFJ.mafPeA=="
REDIRECT_URI = "http://localhost:8080/callback"

def get_authorization_url():
    """Generate authorization URL for company page posting"""
    # Need w_organization_social scope for company posting
    scopes = "openid profile email w_organization_social r_organization_social rw_organization_admin"
    
    auth_url = (
        f"https://www.linkedin.com/oauth/v2/authorization?"
        f"response_type=code&"
        f"client_id={CLIENT_ID}&"
        f"redirect_uri={urllib.parse.quote(REDIRECT_URI)}&"
        f"scope={urllib.parse.quote(scopes)}"
    )
    return auth_url

def create_company_content():
    """Create professional content for Treum Algotech"""
    content = f"""🚀 Treum Algotech Market Analysis | {datetime.now().strftime('%B %d, %Y')}

📈 Algorithmic Trading Insights:

Today's markets present unique opportunities for systematic traders. Our quantitative models are identifying key patterns across multiple asset classes.

🔍 Key Market Observations:
• Volatility clustering in equity indices creating mean reversion opportunities
• Currency pairs showing strong momentum signals
• Commodity markets exhibiting seasonal patterns
• Fixed income spreads at attractive levels

💡 Technology Spotlight:
Our AI-powered trading systems continuously adapt to market conditions, processing thousands of data points per second to identify alpha-generating opportunities.

🎯 Risk Management Focus:
• Dynamic position sizing based on market volatility
• Multi-factor risk models preventing concentration
• Real-time portfolio rebalancing
• Systematic stop-loss protocols

At Treum Algotech, we believe in the power of technology to transform trading. Our algorithms work 24/7 to capture market inefficiencies while maintaining strict risk controls.

Ready to elevate your trading with algorithmic precision?

#AlgorithmicTrading #FinTech #QuantitativeFinance #TradingTechnology #MarketAnalysis #TreumAlgotech"""
    
    return content

def test_token_permissions(access_token):
    """Test what permissions the token has"""
    headers = {
        'Authorization': f'Bearer {access_token}',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    print("\n🔍 Testing token permissions...")
    
    # Test 1: Get user info
    user_response = requests.get('https://api.linkedin.com/v2/userinfo', headers=headers)
    if user_response.status_code == 200:
        user_data = user_response.json()
        print(f"✅ Basic profile access: {user_data.get('name')}")
    else:
        print("❌ No basic profile access")
    
    # Test 2: Get organization access
    org_response = requests.get(
        f'https://api.linkedin.com/v2/organizationAcls?q=roleAssignee',
        headers=headers
    )
    
    if org_response.status_code == 200:
        org_data = org_response.json()
        if org_data.get('elements'):
            print("✅ Organization access found:")
            for org in org_data['elements']:
                print(f"   - Organization: {org.get('organization')}")
                print(f"     Role: {org.get('role')}")
        else:
            print("⚠️ No organization access found")
    else:
        print(f"❌ Cannot access organizations: {org_response.status_code}")
    
    return user_response.status_code == 200

def post_to_company_page(access_token, content):
    """Post content to Treum Algotech company page"""
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    # LinkedIn API payload for company posts
    post_data = {
        "author": COMPANY_URN,
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
    
    print(f"\n📤 Posting to Treum Algotech (Organization ID: {COMPANY_ID})...")
    
    response = requests.post(
        'https://api.linkedin.com/v2/ugcPosts',
        headers=headers,
        json=post_data
    )
    
    if response.status_code == 201:
        post_id = response.headers.get('X-RestLi-Id', 'unknown')
        print(f"✅ Successfully posted to Treum Algotech company page!")
        print(f"📌 Post ID: {post_id}")
        print(f"🔗 View at: https://www.linkedin.com/company/treum-algotech/")
        
        # Save post record
        os.makedirs('posts', exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"posts/company_post_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'post_id': post_id,
                'content': content,
                'platform': 'LinkedIn - Treum Algotech Company Page',
                'company_id': COMPANY_ID
            }, f, indent=2)
        
        print(f"📁 Post saved to {filename}")
        return True
    else:
        print(f"❌ Failed to post. Status code: {response.status_code}")
        error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
        print(f"Error: {error_data.get('message', response.text)}")
        
        if response.status_code == 403:
            print("\n⚠️ Access denied. You need to:")
            print("1. Be an admin of the Treum Algotech company page")
            print("2. Have a token with 'w_organization_social' scope")
            print("\nGet a new token with company permissions using the URL below.")
        
        return False

def main():
    print("=" * 70)
    print("🏢 LinkedIn Company Page Poster - Treum Algotech")
    print("=" * 70)
    
    # Check for access token
    access_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
    
    if not access_token and os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if line.startswith('LINKEDIN_ACCESS_TOKEN='):
                    access_token = line.strip().split('=', 1)[1]
                    break
    
    if not access_token:
        print("\n❌ No access token found!")
    else:
        print("\n✅ Access token found")
        
        # Test permissions
        if test_token_permissions(access_token):
            # Create content
            print("\n📝 Creating company content...")
            content = create_company_content()
            
            print("\n📄 Content preview:")
            print("-" * 70)
            print(content[:400] + "..." if len(content) > 400 else content)
            print("-" * 70)
            
            # Try to post
            if post_to_company_page(access_token, content):
                print("\n🎉 Successfully posted to Treum Algotech company page!")
                return
            else:
                print("\n⚠️ Could not post to company page with current token")
    
    # If we get here, we need a new token
    print("\n" + "=" * 70)
    print("📋 To post to your company page, you need authorization:")
    print("=" * 70)
    
    auth_url = get_authorization_url()
    
    print("\n1️⃣ Visit this URL in your browser:")
    print(f"\n{auth_url}\n")
    
    print("2️⃣ IMPORTANT: When authorizing:")
    print("   - Sign in with your LinkedIn account")
    print("   - Select 'Treum Algotech' from the dropdown")
    print("   - Click 'Allow' to grant permissions")
    
    print("\n3️⃣ After authorization, copy the 'code' from the redirect URL")
    
    print("\n4️⃣ Run this command to exchange the code for a token:")
    print("\nCODE='YOUR_CODE_HERE'")
    print("curl -X POST 'https://api.linkedin.com/oauth/v2/accessToken' \\")
    print(f"  -d \"grant_type=authorization_code&code=$CODE&redirect_uri={REDIRECT_URI}&client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}\" \\")
    print("  | python3 -c \"import sys,json;t=json.load(sys.stdin);print('Token:',t.get('access_token'));print('Scope:',t.get('scope'))\"")
    
    print("\n5️⃣ Save the token to your .env file as:")
    print("   LINKEDIN_ACCESS_TOKEN=your_token_here")
    
    print("\n" + "=" * 70)
    
    # Optionally open the browser
    print("\nWould you like to open the authorization URL now? (y/n): ", end="")
    if input().lower().strip() in ['y', 'yes']:
        webbrowser.open(auth_url)
        print("✅ Browser opened. Complete the authorization and follow the steps above.")

if __name__ == "__main__":
    main()