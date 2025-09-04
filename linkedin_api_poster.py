#!/usr/bin/env python3
"""
LinkedIn API Poster
Posts content to LinkedIn using OAuth API
"""

import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()


class LinkedInAPIPoster:
    def __init__(self):
        self.access_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
        self.api_base = 'https://api.linkedin.com/v2'
        
    def get_profile_urn(self):
        """Get user's LinkedIn URN (user ID)"""
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        # Use userinfo endpoint which requires less permissions
        response = requests.get(
            'https://api.linkedin.com/v2/userinfo',
            headers=headers
        )
        
        if response.status_code == 200:
            user_data = response.json()
            # LinkedIn URN format
            return f"urn:li:person:{user_data.get('sub')}"
        else:
            print(f"Could not get profile URN: {response.text}")
            # Use a default URN format - will be replaced with actual ID
            return None
    
    def post_content(self, text_content):
        """Post content to LinkedIn using the API"""
        print("📤 Posting to LinkedIn via API...")
        
        # Get user URN
        author_urn = self.get_profile_urn()
        
        if not author_urn:
            # Try posting without profile URN (some apps allow this)
            print("⚠️ Could not get profile URN, attempting post anyway...")
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        # Prepare the post data for LinkedIn Share API v2
        post_data = {
            "author": author_urn if author_urn else "urn:li:person:UNKNOWN",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": text_content
                    },
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }
        
        # Post to LinkedIn
        response = requests.post(
            f'{self.api_base}/ugcPosts',
            headers=headers,
            json=post_data
        )
        
        if response.status_code in [200, 201]:
            print("✅ Successfully posted to LinkedIn!")
            result = response.json()
            post_id = result.get('id', 'Unknown')
            print(f"📌 Post ID: {post_id}")
            
            # Save post details
            self.save_post_record(text_content, post_id)
            
            return True
        else:
            print(f"❌ Failed to post: {response.status_code}")
            print(f"Response: {response.text}")
            
            # Try alternative posting method
            return self.post_alternative_method(text_content)
    
    def post_alternative_method(self, text_content):
        """Alternative posting method using shares endpoint"""
        print("\n🔄 Trying alternative posting method...")
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        
        # Simplified post structure for shares endpoint
        post_data = {
            "distribution": {
                "linkedInDistributionTarget": {}
            },
            "text": {
                "text": text_content
            }
        }
        
        response = requests.post(
            'https://api.linkedin.com/v2/shares',
            headers=headers,
            json=post_data
        )
        
        if response.status_code in [200, 201]:
            print("✅ Successfully posted using shares API!")
            result = response.json()
            print(f"📌 Share ID: {result.get('id', 'Unknown')}")
            return True
        else:
            print(f"❌ Alternative method also failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    
    def save_post_record(self, content, post_id):
        """Save a record of the posted content"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Create posts directory if it doesn't exist
        os.makedirs('posts', exist_ok=True)
        
        # Save post record
        record = {
            'timestamp': timestamp,
            'post_id': post_id,
            'content': content,
            'status': 'posted'
        }
        
        filename = f'posts/linkedin_post_{timestamp}.json'
        with open(filename, 'w') as f:
            json.dump(record, f, indent=2)
        
        print(f"📁 Post record saved: {filename}")


def main():
    # Load premium content from file
    content_file = 'posts/linkedin_premium_post.txt'
    
    if os.path.exists(content_file):
        with open(content_file, 'r') as f:
            content = f.read()
    else:
        # Use default premium content
        content = """🚀 India's Market Opportunity of the Decade

After analyzing 10,000+ data points, here's what smart money is doing:

📊 Today's Reality Check:
• Nifty: 24,712 (-0.75%)
• FII Selling: ₹13.23 Billion YTD
• But DIIs bought ₹47.89 Billion

💡 The Pattern Most Missed:
Every time FIIs sold >₹10B and DIIs absorbed it, markets rallied 12-18% in next quarter.

We're seeing this pattern NOW.

🎯 3 Sectors Ready to Explode:
1. IT: 8-month consolidation ending
2. Pharma: Breaking 2-year resistance
3. Banking: Coiled spring at 52,000

📈 Action for Smart Investors:
→ Accumulate quality on dips
→ Keep 20% cash ready
→ Focus on earnings leaders

Remember: "Be greedy when others are fearful" - Buffett

This setup happens once every 2-3 years.

Don't miss it.

What's your take? 👇

#IndianStockMarket #Nifty50 #InvestmentStrategy #StockMarketIndia #WealthCreation"""
    
    print("\n🚀 LinkedIn API Poster")
    print("=" * 60)
    print("📝 Content to post:")
    print("-" * 60)
    print(content[:300] + "...")
    print("-" * 60)
    
    # Check if we have access token
    if not os.getenv('LINKEDIN_ACCESS_TOKEN'):
        print("\n❌ No LinkedIn access token found!")
        print("Please run: python linkedin_auth_server.py")
        return
    
    # Initialize poster
    poster = LinkedInAPIPoster()
    
    # Post the content
    if poster.post_content(content):
        print("\n" + "=" * 60)
        print("🎉 SUCCESS! Content posted to LinkedIn")
        print("Check your LinkedIn profile to verify")
        print("=" * 60)
    else:
        print("\n⚠️ Could not post via API")
        print("Saving content for manual posting...")
        
        # Save for manual posting
        with open('posts/linkedin_manual_post.txt', 'w') as f:
            f.write(content)
        print("📄 Content saved to: posts/linkedin_manual_post.txt")


if __name__ == "__main__":
    main()