#!/usr/bin/env python3
"""
Test All Social Media Platforms
Comprehensive testing for Telegram, LinkedIn, and Twitter/X
"""

import os
import sys
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SocialMediaTester:
    def __init__(self):
        # Telegram
        self.telegram_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.telegram_channel = os.getenv('TELEGRAM_CHANNEL_ID', '@AIFinanceNews2024')
        
        # LinkedIn
        self.linkedin_personal_token = os.getenv('LINKEDIN_PERSONAL_ACCESS_TOKEN')
        self.linkedin_company_token = os.getenv('LINKEDIN_COMPANY_ACCESS_TOKEN')
        
        # Twitter
        self.twitter_consumer_key = os.getenv('TWITTER_CONSUMER_KEY', os.getenv('TWITTER_PERSONAL_CONSUMER_KEY'))
        self.twitter_consumer_secret = os.getenv('TWITTER_CONSUMER_SECRET', os.getenv('TWITTER_PERSONAL_CONSUMER_SECRET'))
        self.twitter_access_token = os.getenv('TWITTER_ACCESS_TOKEN', os.getenv('TWITTER_PERSONAL_ACCESS_TOKEN'))
        self.twitter_access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET', os.getenv('TWITTER_PERSONAL_ACCESS_TOKEN_SECRET'))
        self.twitter_bearer_token = os.getenv('TWITTER_BEARER_TOKEN', os.getenv('TWITTER_PERSONAL_BEARER_TOKEN'))
        
        self.results = {}
    
    def test_telegram(self):
        """Test Telegram posting"""
        print("\n📱 Testing Telegram...")
        
        try:
            # Test bot info
            url = f'https://api.telegram.org/bot{self.telegram_token}/getMe'
            response = requests.get(url)
            
            if response.status_code == 200 and response.json()['ok']:
                bot_info = response.json()['result']
                print(f"✅ Connected as @{bot_info['username']}")
                
                # Send test message
                test_message = f"""
📊 <b>AI Finance Agency Test Post</b>

🎯 Platform: Telegram
📅 Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
✅ Status: Credentials Working

<i>This is an automated test from your AI Finance Agency system.</i>

#AIFinance #Testing #Automation
"""
                send_url = f'https://api.telegram.org/bot{self.telegram_token}/sendMessage'
                payload = {
                    'chat_id': self.telegram_channel,
                    'text': test_message,
                    'parse_mode': 'HTML'
                }
                
                send_response = requests.post(send_url, json=payload)
                if send_response.status_code == 200 and send_response.json()['ok']:
                    print(f"✅ Message posted to {self.telegram_channel}")
                    self.results['telegram'] = {'status': 'success', 'channel': self.telegram_channel}
                else:
                    print(f"❌ Failed to post: {send_response.json()}")
                    self.results['telegram'] = {'status': 'failed', 'error': send_response.json()}
            else:
                print(f"❌ Connection failed: {response.json()}")
                self.results['telegram'] = {'status': 'failed', 'error': 'Connection failed'}
                
        except Exception as e:
            print(f"❌ Error: {e}")
            self.results['telegram'] = {'status': 'error', 'error': str(e)}
    
    def test_twitter(self):
        """Test Twitter/X posting"""
        print("\n🐦 Testing Twitter/X...")
        
        try:
            import tweepy
            
            # Create client
            client = tweepy.Client(
                bearer_token=self.twitter_bearer_token,
                consumer_key=self.twitter_consumer_key,
                consumer_secret=self.twitter_consumer_secret,
                access_token=self.twitter_access_token,
                access_token_secret=self.twitter_access_token_secret,
                wait_on_rate_limit=True
            )
            
            # Verify credentials
            me = client.get_me()
            if me and me.data:
                print(f"✅ Connected as @{me.data.username}")
                
                # Post test tweet
                test_tweet = f"""
📊 AI Finance Agency Test

🎯 Platform: Twitter/X
📅 {datetime.now().strftime('%H:%M %d/%m')}
✅ System Operational

#AIFinance #FinTech #Automation
"""
                response = client.create_tweet(text=test_tweet.strip())
                if response and response.data:
                    print(f"✅ Tweet posted! ID: {response.data['id']}")
                    self.results['twitter'] = {
                        'status': 'success', 
                        'username': me.data.username,
                        'tweet_id': response.data['id']
                    }
                else:
                    print("❌ Failed to post tweet")
                    self.results['twitter'] = {'status': 'failed', 'error': 'Post failed'}
            else:
                print("❌ Could not verify credentials")
                self.results['twitter'] = {'status': 'failed', 'error': 'Auth failed'}
                
        except ImportError:
            print("❌ Tweepy not installed. Run: pip install tweepy")
            self.results['twitter'] = {'status': 'error', 'error': 'Tweepy not installed'}
        except Exception as e:
            print(f"❌ Error: {e}")
            self.results['twitter'] = {'status': 'error', 'error': str(e)}
    
    def test_linkedin(self):
        """Test LinkedIn posting"""
        print("\n💼 Testing LinkedIn...")
        
        try:
            # Test token validity
            headers = {
                'Authorization': f'Bearer {self.linkedin_company_token}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0',
                'LinkedIn-Version': '202401'
            }
            
            # Check token with userinfo
            userinfo_url = 'https://api.linkedin.com/v2/userinfo'
            response = requests.get(userinfo_url, headers=headers)
            
            if response.status_code == 200:
                user_data = response.json()
                print(f"✅ Connected as {user_data.get('name', 'Unknown')}")
                print(f"   Email: {user_data.get('email', 'N/A')}")
                
                # Note: Actual posting requires specific scopes and company page ID
                print("ℹ️  LinkedIn posting requires specific OAuth scopes")
                print("   Token is valid for API access")
                
                self.results['linkedin'] = {
                    'status': 'partial',
                    'name': user_data.get('name'),
                    'note': 'Token valid, posting requires additional setup'
                }
            else:
                print(f"⚠️  LinkedIn token may need re-authorization")
                print(f"   Status: {response.status_code}")
                self.results['linkedin'] = {
                    'status': 'needs_auth',
                    'error': f'HTTP {response.status_code}'
                }
                
        except Exception as e:
            print(f"❌ Error: {e}")
            self.results['linkedin'] = {'status': 'error', 'error': str(e)}
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        
        platforms = ['telegram', 'twitter', 'linkedin']
        
        for platform in platforms:
            result = self.results.get(platform, {'status': 'not_tested'})
            status = result.get('status', 'unknown')
            
            if status == 'success':
                emoji = "✅"
                msg = "WORKING"
            elif status == 'partial':
                emoji = "⚠️"
                msg = "PARTIAL"
            elif status == 'needs_auth':
                emoji = "🔄"
                msg = "NEEDS AUTH"
            else:
                emoji = "❌"
                msg = "FAILED"
            
            print(f"{emoji} {platform.upper()}: {msg}")
            
            if status == 'success':
                if platform == 'telegram':
                    print(f"   Channel: {result.get('channel', 'N/A')}")
                elif platform == 'twitter':
                    print(f"   Username: @{result.get('username', 'N/A')}")
                elif platform == 'linkedin':
                    print(f"   Name: {result.get('name', 'N/A')}")
            elif result.get('error'):
                print(f"   Error: {result['error']}")
        
        print("\n" + "="*60)
        
        # Overall status
        working = sum(1 for r in self.results.values() if r.get('status') == 'success')
        partial = sum(1 for r in self.results.values() if r.get('status') == 'partial')
        failed = len(platforms) - working - partial
        
        print(f"📈 Overall: {working}/{len(platforms)} fully working")
        if partial > 0:
            print(f"   {partial} platform(s) partially working")
        if failed > 0:
            print(f"   {failed} platform(s) need attention")
        
        print("="*60)

def main():
    print("🚀 AI FINANCE AGENCY - SOCIAL MEDIA TEST")
    print("="*60)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*60)
    
    tester = SocialMediaTester()
    
    # Test all platforms
    tester.test_telegram()
    tester.test_twitter()
    tester.test_linkedin()
    
    # Generate summary
    tester.generate_summary()
    
    print("\n✅ Testing complete!")
    print("Check your social media channels for test posts.")

if __name__ == "__main__":
    main()