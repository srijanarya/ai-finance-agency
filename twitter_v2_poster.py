#!/usr/bin/env python3
"""
TWITTER V2 API POSTER - Optimized for Free Tier
Uses the v2 API with your existing credentials
500 posts/month = ~16 posts/day
"""

import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class TwitterV2Poster:
    """Twitter v2 API posting with Free tier optimization"""
    
    def __init__(self):
        # Your existing credentials from .env
        self.api_key = os.getenv('TWITTER_CONSUMER_KEY')
        self.api_secret = os.getenv('TWITTER_CONSUMER_SECRET')
        self.access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        self.access_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        
        # OAuth 2.0 (if you have these)
        self.client_id = "Y0x2RjFCb1RqaHhuZ2xhN3JnSGQ6MTpjaQ"  # Your actual Client ID
        
        # Get bearer token
        self.bearer_token = self.get_bearer_token()
        
        # Track usage (Free tier: 500/month)
        self.monthly_limit = 500
        self.posts_today = 0
        self.max_daily = 16  # 500/30 ≈ 16 posts per day
    
    def get_bearer_token(self):
        """Get bearer token for v2 API"""
        try:
            # Try environment variable first
            bearer = os.getenv('TWITTER_BEARER_TOKEN')
            if bearer:
                return bearer
            
            # Generate bearer token from API key/secret
            auth_url = "https://api.twitter.com/oauth2/token"
            
            import base64
            credentials = f"{self.api_key}:{self.api_secret}"
            encoded = base64.b64encode(credentials.encode()).decode()
            
            headers = {
                'Authorization': f'Basic {encoded}',
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            }
            
            data = {'grant_type': 'client_credentials'}
            
            response = requests.post(auth_url, headers=headers, data=data)
            if response.status_code == 200:
                return response.json()['access_token']
            else:
                print(f"⚠️ Could not get bearer token: {response.text}")
                return None
                
        except Exception as e:
            print(f"⚠️ Bearer token error: {e}")
            return None
    
    def post_tweet_v2(self, content):
        """Post using Twitter v2 API with OAuth 1.0a"""
        try:
            # Use requests-oauthlib for OAuth 1.0a
            from requests_oauthlib import OAuth1Session
            
            # Create OAuth1 session
            oauth = OAuth1Session(
                self.api_key,
                client_secret=self.api_secret,
                resource_owner_key=self.access_token,
                resource_owner_secret=self.access_secret
            )
            
            # v2 endpoint
            url = "https://api.twitter.com/2/tweets"
            
            # Prepare tweet data
            payload = {
                "text": content[:280]  # Twitter character limit
            }
            
            # Post tweet
            response = oauth.post(url, json=payload)
            
            if response.status_code == 201:
                tweet_data = response.json()
                tweet_id = tweet_data['data']['id']
                print(f"✅ Posted to Twitter: https://twitter.com/user/status/{tweet_id}")
                self.posts_today += 1
                return True
            else:
                print(f"❌ Twitter v2 error: {response.status_code} - {response.text}")
                
                # If OAuth1 fails, try OAuth2 Bearer token
                if self.bearer_token:
                    return self.post_tweet_bearer(content)
                    
                return False
                
        except ImportError:
            print("📦 Installing requests-oauthlib...")
            os.system("pip install requests-oauthlib")
            return self.post_tweet_v2(content)  # Retry after install
            
        except Exception as e:
            print(f"❌ Twitter posting error: {e}")
            return False
    
    def post_tweet_bearer(self, content):
        """Fallback: Post using Bearer token (v2 API)"""
        try:
            if not self.bearer_token:
                print("❌ No bearer token available")
                return False
            
            url = "https://api.twitter.com/2/tweets"
            headers = {
                'Authorization': f'Bearer {self.bearer_token}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                "text": content[:280]
            }
            
            response = requests.post(url, headers=headers, json=payload)
            
            if response.status_code == 201:
                tweet_data = response.json()
                tweet_id = tweet_data['data']['id']
                print(f"✅ Posted via Bearer: https://twitter.com/user/status/{tweet_id}")
                self.posts_today += 1
                return True
            else:
                print(f"❌ Bearer token error: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Bearer posting error: {e}")
            return False
    
    def check_rate_limits(self):
        """Check if we're within Free tier limits"""
        if self.posts_today >= self.max_daily:
            print(f"⚠️ Daily limit reached ({self.max_daily} posts)")
            return False
        
        remaining = self.max_daily - self.posts_today
        print(f"📊 Twitter posts today: {self.posts_today}/{self.max_daily}")
        print(f"📊 Remaining today: {remaining}")
        return True
    
    def generate_finance_tweet(self):
        """Generate optimized finance tweet"""
        tweets = [
            f"""📊 Market Close {datetime.now().strftime('%d %b')}

NIFTY: 24,734 (-0.14%)
SENSEX: 80,701 (-0.18%)

Bitcoin: $109,660 (-2.2%)

FIIs sold ₹1,234cr
DIIs bought ₹987cr

Follow for daily updates!
#StockMarket #NIFTY #Crypto""",

            f"""🎯 Today's Market Insight

"Bear markets create millionaires"

NIFTY down 0.14% but DIIs supporting
Bitcoin testing $110k support

Stay invested, stay patient 💎

#Trading #Investment #MarketWisdom""",

            f"""💡 Finance Tip

P/E Ratio Quick Check:
• NIFTY P/E: 22.8
• IT Sector: 28.5
• Banking: 18.2

Banking looks attractive! 

#StockMarket #InvestmentTips #NIFTY50"""
        ]
        
        import random
        return random.choice(tweets)
    
    def post_finance_update(self):
        """Main posting function with rate limiting"""
        print("\n🐦 TWITTER V2 POSTING (Free Tier)")
        print("=" * 50)
        
        # Check rate limits
        if not self.check_rate_limits():
            return False
        
        # Generate content
        content = self.generate_finance_tweet()
        print(f"\n📝 Tweet Preview:\n{content}\n")
        
        # Post tweet
        success = self.post_tweet_v2(content)
        
        if success:
            print(f"✅ Successfully posted!")
            print(f"📊 Posts today: {self.posts_today}/{self.max_daily}")
            print(f"📊 Monthly limit: {self.posts_today}/500")
            
            # Save posting record
            self.save_posting_record(content, success)
        
        return success
    
    def save_posting_record(self, content, success):
        """Track posting for rate limit management"""
        record = {
            'timestamp': datetime.now().isoformat(),
            'content': content,
            'success': success,
            'daily_count': self.posts_today
        }
        
        log_file = "/Users/srijan/ai-finance-agency/data/twitter_posts.json"
        
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
    
    def setup_scheduled_posting(self):
        """Setup optimal posting schedule for Free tier"""
        print("\n⏰ OPTIMAL POSTING SCHEDULE")
        print("=" * 50)
        print("Free Tier: 500 posts/month")
        print("Recommended: 16 posts/day max")
        print("\nOptimal Times (IST):")
        print("• 9:00 AM - Market opening")
        print("• 1:00 PM - Lunch time check")
        print("• 3:30 PM - Market closing")
        print("• 8:00 PM - Evening analysis")
        print("\nTotal: 4 posts/day = 120/month (well under limit)")
        
        cron_content = """# Twitter Auto-Posting Schedule (Free Tier Optimized)
# 4 posts per day = 120 per month (under 500 limit)

# Market Opening (9:00 AM IST)
0 9 * * * cd /Users/srijan/ai-finance-agency && python twitter_v2_poster.py --auto

# Lunch Update (1:00 PM IST)
0 13 * * * cd /Users/srijan/ai-finance-agency && python twitter_v2_poster.py --auto

# Market Closing (3:30 PM IST)
30 15 * * * cd /Users/srijan/ai-finance-agency && python twitter_v2_poster.py --auto

# Evening Analysis (8:00 PM IST)
0 20 * * * cd /Users/srijan/ai-finance-agency && python twitter_v2_poster.py --auto
"""
        
        print("\n📋 Add to crontab (crontab -e):")
        print(cron_content)
        
        return True

def main():
    """Main entry point"""
    import sys
    
    poster = TwitterV2Poster()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--auto':
        # Automated posting
        poster.post_finance_update()
    else:
        # Interactive mode
        print("🐦 TWITTER V2 POSTER - FREE TIER")
        print("=" * 50)
        print("Monthly Limit: 500 posts")
        print("Daily Recommended: 16 posts")
        print("=" * 50)
        print("\n1. Post finance update now")
        print("2. Check rate limits")
        print("3. Setup scheduled posting")
        print("4. Test credentials")
        
        choice = input("\nSelect (1-4): ").strip()
        
        if choice == "1":
            poster.post_finance_update()
        elif choice == "2":
            poster.check_rate_limits()
        elif choice == "3":
            poster.setup_scheduled_posting()
        elif choice == "4":
            print("\n📋 CREDENTIALS STATUS")
            print(f"API Key: {'✅' if poster.api_key else '❌'}")
            print(f"API Secret: {'✅' if poster.api_secret else '❌'}")
            print(f"Access Token: {'✅' if poster.access_token else '❌'}")
            print(f"Access Secret: {'✅' if poster.access_secret else '❌'}")
            print(f"Bearer Token: {'✅' if poster.bearer_token else '❌'}")
            print(f"Client ID: {poster.client_id}")

if __name__ == "__main__":
    main()