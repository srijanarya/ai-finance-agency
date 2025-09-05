#!/usr/bin/env python3
"""
Simple LinkedIn Posting Script
"""

import os
import requests
import json
from datetime import datetime

def create_market_post():
    """Create engaging financial content"""
    content = f"""📊 Market Insights | {datetime.now().strftime('%B %d, %Y')}

🎯 Today's Financial Wisdom:

"The most important quality for an investor is temperament, not intellect." - Warren Buffett

Key Market Principles:
✅ Diversification reduces risk without sacrificing returns
✅ Time in market beats timing the market  
✅ Compound interest is the eighth wonder of the world
✅ Risk management preserves capital for opportunities

💡 Remember: Successful investing is about making informed decisions based on fundamentals, not emotions.

The current market volatility presents opportunities for patient, disciplined investors.

What's your investment philosophy?

#InvestmentStrategy #FinancialMarkets #WealthManagement #StockMarket #FinancialWisdom"""
    
    return content

def post_to_linkedin(access_token, content):
    """Post content to LinkedIn"""
    
    # First, get user info to determine the correct URN
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    user_response = requests.get('https://api.linkedin.com/v2/userinfo', headers=headers)
    
    if user_response.status_code == 200:
        user_data = user_response.json()
        member_id = user_data.get('sub')
        print(f"✅ Authenticated as: {user_data.get('name')}")
        print(f"📧 Email: {user_data.get('email')}")
        
        # Try posting with member URN
        post_headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        # Try different URN formats
        urns_to_try = [
            f"urn:li:person:{member_id}",
            f"urn:li:member:{member_id}",
            "urn:li:organization:108595796"  # Treum Algotech
        ]
        
        for urn in urns_to_try:
            print(f"\n🔄 Trying URN: {urn}")
            
            post_data = {
                "author": urn,
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
                headers=post_headers,
                json=post_data
            )
            
            if response.status_code == 201:
                print(f"✅ Successfully posted to LinkedIn!")
                post_id = response.headers.get('X-RestLi-Id', 'unknown')
                print(f"📌 Post ID: {post_id}")
                
                # Save post record
                os.makedirs('posts', exist_ok=True)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"posts/linkedin_post_{timestamp}.json"
                
                with open(filename, 'w') as f:
                    json.dump({
                        'timestamp': datetime.now().isoformat(),
                        'post_id': post_id,
                        'content': content,
                        'author_urn': urn
                    }, f, indent=2)
                
                print(f"📁 Post saved to {filename}")
                return True
            else:
                print(f"❌ Failed with status {response.status_code}")
                error_detail = response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
                print(f"   Error: {error_detail}")
        
        return False
    else:
        print(f"❌ Authentication failed: {user_response.status_code}")
        print(user_response.text)
        return False

def main():
    print("=" * 60)
    print("📤 LinkedIn Simple Post")
    print("=" * 60)
    
    # Check for access token in environment
    access_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
    
    if not access_token:
        # Try to read from .env file
        if os.path.exists('.env'):
            with open('.env', 'r') as f:
                for line in f:
                    if line.startswith('LINKEDIN_ACCESS_TOKEN='):
                        access_token = line.strip().split('=', 1)[1]
                        break
    
    if not access_token:
        print("\n❌ No LinkedIn access token found!")
        print("\nTo get an access token:")
        print("1. Visit this URL in your browser:")
        print("   https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=776dnomhse84tj&redirect_uri=http://localhost:8080/callback&scope=openid%20profile%20email%20w_member_social")
        print("\n2. After authorizing, copy the 'code' parameter from the redirect URL")
        print("\n3. Exchange it for a token using:")
        print("   curl -X POST 'https://api.linkedin.com/oauth/v2/accessToken' \\")
        print("     -d 'grant_type=authorization_code&code=YOUR_CODE&redirect_uri=http://localhost:8080/callback&client_id=776dnomhse84tj&client_secret=WPL_AP1.r3GQEtOyAZpKQkFJ.mafPeA=='")
        print("\n4. Save the access_token to your .env file as LINKEDIN_ACCESS_TOKEN=...")
        return
    
    # Create content
    print("\n📝 Creating content...")
    content = create_market_post()
    
    print("\n📄 Post preview:")
    print("-" * 60)
    print(content[:500] + "..." if len(content) > 500 else content)
    print("-" * 60)
    
    # Post to LinkedIn
    print("\n📤 Posting to LinkedIn...")
    if post_to_linkedin(access_token, content):
        print("\n🎉 Success! Your post is now live on LinkedIn!")
    else:
        print("\n⚠️ Unable to post. Please check your access token permissions.")
        print("Make sure the token has 'w_member_social' scope.")

if __name__ == "__main__":
    main()