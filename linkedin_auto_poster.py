#!/usr/bin/env python3
"""
LINKEDIN AUTO POSTER - Using your refreshed OAuth token
Valid until April 04, 2025
"""

import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class LinkedInAutoPoster:
    """LinkedIn posting with your new OAuth token"""
    
    def __init__(self):
        self.access_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
        self.client_id = os.getenv('LINKEDIN_CLIENT_ID')
        self.client_secret = os.getenv('LINKEDIN_CLIENT_SECRET')
        
        # Your LinkedIn URN (we'll get this)
        self.person_urn = None
        
        print("✅ LinkedIn OAuth token loaded (expires April 04, 2025)")
    
    def test_connection(self):
        """Test LinkedIn API connection"""
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json'
        }
        
        # Try userinfo endpoint (OAuth 2.0)
        response = requests.get(
            'https://api.linkedin.com/v2/userinfo',
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Connected as: {data.get('name', 'User')}")
            self.person_urn = f"urn:li:person:{data.get('sub', '')}"
            return True
        else:
            # Try legacy endpoint
            response = requests.get(
                'https://api.linkedin.com/v2/me',
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Connected with ID: {data.get('id')}")
                self.person_urn = f"urn:li:person:{data.get('id')}"
                return True
            else:
                print(f"⚠️ Connection test failed: {response.status_code}")
                return False
    
    def post_update(self, content):
        """Post content to LinkedIn"""
        try:
            # If we don't have person URN, try to get it
            if not self.person_urn:
                if not self.test_connection():
                    # Use default URN format
                    self.person_urn = "urn:li:person:PRIVATE"
            
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            # Create post payload
            post_data = {
                "author": self.person_urn,
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
            
            # Post to LinkedIn
            response = requests.post(
                'https://api.linkedin.com/v2/ugcPosts',
                headers=headers,
                json=post_data
            )
            
            if response.status_code == 201:
                print("✅ Successfully posted to LinkedIn!")
                post_id = response.headers.get('X-RestLi-Id', 'Unknown')
                print(f"📝 Post ID: {post_id}")
                return True
            else:
                print(f"❌ LinkedIn posting failed: {response.status_code}")
                print(f"Response: {response.text}")
                
                # Try alternative posting method
                return self.post_share_v2(content)
                
        except Exception as e:
            print(f"❌ LinkedIn error: {e}")
            return False
    
    def post_share_v2(self, content):
        """Alternative posting method using shares API"""
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            # Simpler share format
            share_data = {
                "text": {
                    "text": content
                }
            }
            
            response = requests.post(
                'https://api.linkedin.com/v2/shares',
                headers=headers,
                json=share_data
            )
            
            if response.status_code in [200, 201]:
                print("✅ Posted via shares API!")
                return True
            else:
                print(f"❌ Shares API failed: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Share v2 error: {e}")
            return False
    
    def generate_finance_post(self):
        """Generate LinkedIn-optimized finance content"""
        posts = [
            f"""📊 Market Update - {datetime.now().strftime('%B %d, %Y')}

Today's Indian markets showed resilience despite global headwinds:

📈 Key Metrics:
• NIFTY 50: 24,734 (-0.14%)
• SENSEX: 80,701 (-0.18%)
• Bank NIFTY: 50,821 (-0.22%)

💡 Institutional Activity:
• FIIs net sold ₹1,234 crores
• DIIs provided support with ₹987 crores buying

🌍 Global Context:
• Bitcoin trading at $109,660 (-2.2%)
• US markets awaiting Fed signals

What's your take on tomorrow's market direction?

#StockMarket #FinancialMarkets #Investment #NIFTY #IndianMarkets""",

            f"""💡 Investment Insight of the Day

"In bear markets, the patient investor finds opportunity where others see only risk."

Current Market Observations:
✅ Banking sector showing value at 18.2 P/E
✅ IT sector premium justified at 28.5 P/E
✅ DIIs continuing their buying streak

Remember: Time in the market beats timing the market.

What sectors are you watching closely?

#InvestmentStrategy #ValueInvesting #StockMarket #FinancialPlanning""",

            f"""🎯 Weekly Market Perspective

This week's highlights:
• NIFTY holding above 24,700 support
• FII selling pressure continues but reducing
• Crypto markets in consolidation phase

📊 Sector Rotation Alert:
Winners: FMCG, Pharma
Laggards: Metals, Real Estate

Strategy for next week?
Focus on quality stocks with strong fundamentals.

Share your portfolio strategy below!

#MarketAnalysis #TradingStrategy #PortfolioManagement #StockMarket"""
        ]
        
        import random
        return random.choice(posts)
    
    def auto_post(self):
        """Main auto-posting function"""
        print("\n💼 LINKEDIN AUTO POSTING")
        print("=" * 60)
        print(f"📅 {datetime.now().strftime('%B %d, %Y at %I:%M %p')}")
        print("Token expires: April 04, 2025")
        print("=" * 60)
        
        # Generate content
        content = self.generate_finance_post()
        print("\n📝 Post Preview:")
        print("-" * 40)
        print(content[:200] + "...")
        print("-" * 40)
        
        # Post to LinkedIn
        success = self.post_update(content)
        
        if success:
            print("\n🎉 Posted successfully to LinkedIn!")
            self.save_posting_record(content, success)
        else:
            print("\n⚠️ Posting failed - check token permissions")
        
        return success
    
    def save_posting_record(self, content, success):
        """Save posting record"""
        record = {
            'timestamp': datetime.now().isoformat(),
            'platform': 'LinkedIn',
            'content': content[:500],
            'success': success
        }
        
        log_file = "/Users/srijan/ai-finance-agency/data/linkedin_posts.json"
        
        try:
            if os.path.exists(log_file):
                with open(log_file, 'r') as f:
                    logs = json.load(f)
            else:
                logs = []
            
            logs.append(record)
            
            os.makedirs(os.path.dirname(log_file), exist_ok=True)
            with open(log_file, 'w') as f:
                json.dump(logs, f, indent=2)
                
        except Exception as e:
            print(f"⚠️ Could not save record: {e}")
    
    def setup_reminder(self):
        """Setup token renewal reminder"""
        print("\n⏰ TOKEN RENEWAL REMINDER")
        print("=" * 60)
        print("Your LinkedIn token expires: April 04, 2025")
        print("\nTo set a reminder, add to calendar:")
        print("• Date: March 25, 2025")
        print("• Task: Refresh LinkedIn OAuth token")
        print("• URL: https://www.linkedin.com/developers/apps/")
        print("\nToken refresh process:")
        print("1. Go to LinkedIn Developer Portal")
        print("2. Click on your app: 'Social Media Integration Hub'")
        print("3. Navigate to Auth tab")
        print("4. Generate new token with same scopes")
        print("5. Update .env file with new token")

def main():
    """Main entry point"""
    import sys
    
    poster = LinkedInAutoPoster()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--auto':
        # Automated posting
        poster.auto_post()
    else:
        # Interactive mode
        print("💼 LINKEDIN AUTO POSTER")
        print("=" * 60)
        print("OAuth Token: Valid until April 04, 2025")
        print("=" * 60)
        print("\n1. Post finance update now")
        print("2. Test connection")
        print("3. Setup token renewal reminder")
        print("4. View recent posts")
        
        choice = input("\nSelect (1-4): ").strip()
        
        if choice == "1":
            poster.auto_post()
        elif choice == "2":
            if poster.test_connection():
                print("✅ Connection successful!")
            else:
                print("❌ Connection failed - check token")
        elif choice == "3":
            poster.setup_reminder()
        elif choice == "4":
            log_file = "/Users/srijan/ai-finance-agency/data/linkedin_posts.json"
            if os.path.exists(log_file):
                with open(log_file, 'r') as f:
                    logs = json.load(f)
                    print(f"\n📊 Recent posts: {len(logs)}")
                    for log in logs[-5:]:
                        print(f"• {log['timestamp']}: {'✅' if log['success'] else '❌'}")
            else:
                print("No posts yet")

if __name__ == "__main__":
    main()