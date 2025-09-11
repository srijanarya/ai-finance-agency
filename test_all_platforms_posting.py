#!/usr/bin/env python3
"""
Multi-Platform Posting Test
Posts to all platforms in sequence: LinkedIn Personal -> LinkedIn Company -> X/Twitter -> Telegram
"""

import os
import sys
import time
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class MultiPlatformTester:
    def __init__(self):
        self.results = {
            'linkedin_personal': {'status': 'pending', 'message': '', 'post_id': None},
            'linkedin_company': {'status': 'pending', 'message': '', 'post_id': None},
            'twitter_personal': {'status': 'pending', 'message': '', 'post_id': None},
            'telegram': {'status': 'pending', 'message': '', 'post_id': None}
        }
        self.test_content = self.generate_test_content()
    
    def generate_test_content(self):
        """Generate test content for posting"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        
        return {
            'linkedin': f"""🚀 AI Finance Agency System Test - {timestamp}

Our automated financial research and content generation system is live and running smoothly!

✅ Multi-platform social media integration
✅ Real-time market data analysis  
✅ AI-powered content generation
✅ Automated posting workflows

#FinTech #AI #Automation #MarketAnalysis #Innovation

Testing all systems across LinkedIn, X, and Telegram. 🤖📊""",
            
            'twitter': f"""🚀 AI Finance Agency System Test - {timestamp}

✅ Multi-platform integration working
✅ Real-time market analysis active
✅ AI content generation online
✅ Automated workflows running

#FinTech #AI #Automation #MarketData #Innovation 🤖📊""",
            
            'telegram': f"""🚀 **AI Finance Agency System Test** - {timestamp}

Our automated financial research system is operational:

✅ Multi-platform social media integration
✅ Real-time market data analysis  
✅ AI-powered content generation
✅ Automated posting workflows

Testing complete across LinkedIn, X, and Telegram! 🤖📊

#FinTech #AI #Automation"""
        }
    
    def test_linkedin_personal(self):
        """Test LinkedIn Personal posting"""
        print("1️⃣ Testing LinkedIn Personal...")
        
        try:
            access_token = os.getenv('LINKEDIN_PERSONAL_ACCESS_TOKEN')
            if not access_token:
                self.results['linkedin_personal'] = {
                    'status': 'failed', 
                    'message': 'No access token found',
                    'post_id': None
                }
                return False
            
            # LinkedIn API v2 endpoint for personal posts
            url = "https://api.linkedin.com/v2/ugcPosts"
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            # Get user ID first
            profile_url = "https://api.linkedin.com/v2/people/~"
            profile_response = requests.get(profile_url, headers=headers)
            
            if profile_response.status_code != 200:
                self.results['linkedin_personal'] = {
                    'status': 'failed',
                    'message': f'Profile fetch failed: {profile_response.status_code}',
                    'post_id': None
                }
                return False
            
            user_id = profile_response.json().get('id')
            
            # Create post payload
            post_data = {
                "author": f"urn:li:person:{user_id}",
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": self.test_content['linkedin']
                        },
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }
            
            response = requests.post(url, json=post_data, headers=headers)
            
            if response.status_code in [200, 201]:
                post_id = response.headers.get('x-restli-id', 'unknown')
                self.results['linkedin_personal'] = {
                    'status': 'success',
                    'message': 'Posted successfully',
                    'post_id': post_id
                }
                print(f"   ✅ LinkedIn Personal: SUCCESS (ID: {post_id})")
                return True
            else:
                self.results['linkedin_personal'] = {
                    'status': 'failed',
                    'message': f'API error: {response.status_code} - {response.text}',
                    'post_id': None
                }
                print(f"   ❌ LinkedIn Personal: FAILED ({response.status_code})")
                return False
                
        except Exception as e:
            self.results['linkedin_personal'] = {
                'status': 'failed',
                'message': f'Exception: {str(e)}',
                'post_id': None
            }
            print(f"   ❌ LinkedIn Personal: ERROR - {e}")
            return False
    
    def test_linkedin_company(self):
        """Test LinkedIn Company posting"""
        print("2️⃣ Testing LinkedIn Company...")
        
        try:
            access_token = os.getenv('LINKEDIN_COMPANY_ACCESS_TOKEN')
            company_page_id = os.getenv('LINKEDIN_COMPANY_PAGE_ID')
            
            if not access_token or not company_page_id:
                self.results['linkedin_company'] = {
                    'status': 'failed',
                    'message': 'Missing company access token or page ID',
                    'post_id': None
                }
                return False
            
            url = "https://api.linkedin.com/v2/ugcPosts"
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            post_data = {
                "author": f"urn:li:organization:{company_page_id}",
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": self.test_content['linkedin']
                        },
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }
            
            response = requests.post(url, json=post_data, headers=headers)
            
            if response.status_code in [200, 201]:
                post_id = response.headers.get('x-restli-id', 'unknown')
                self.results['linkedin_company'] = {
                    'status': 'success',
                    'message': 'Posted successfully',
                    'post_id': post_id
                }
                print(f"   ✅ LinkedIn Company: SUCCESS (ID: {post_id})")
                return True
            else:
                self.results['linkedin_company'] = {
                    'status': 'failed',
                    'message': f'API error: {response.status_code} - {response.text}',
                    'post_id': None
                }
                print(f"   ❌ LinkedIn Company: FAILED ({response.status_code})")
                return False
                
        except Exception as e:
            self.results['linkedin_company'] = {
                'status': 'failed',
                'message': f'Exception: {str(e)}',
                'post_id': None
            }
            print(f"   ❌ LinkedIn Company: ERROR - {e}")
            return False
    
    def test_twitter_personal(self):
        """Test X/Twitter posting"""
        print("3️⃣ Testing X (Twitter) Personal...")
        
        try:
            import tweepy
            
            # Get Twitter credentials
            consumer_key = os.getenv('TWITTER_PERSONAL_CONSUMER_KEY')
            consumer_secret = os.getenv('TWITTER_PERSONAL_CONSUMER_SECRET')
            access_token = os.getenv('TWITTER_PERSONAL_ACCESS_TOKEN')
            access_token_secret = os.getenv('TWITTER_PERSONAL_ACCESS_TOKEN_SECRET')
            
            if not all([consumer_key, consumer_secret, access_token, access_token_secret]):
                self.results['twitter_personal'] = {
                    'status': 'failed',
                    'message': 'Missing Twitter credentials',
                    'post_id': None
                }
                return False
            
            # Initialize Tweepy client
            auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
            auth.set_access_token(access_token, access_token_secret)
            api = tweepy.API(auth)
            
            # Post tweet
            tweet = api.update_status(self.test_content['twitter'])
            
            if tweet:
                self.results['twitter_personal'] = {
                    'status': 'success',
                    'message': 'Posted successfully',
                    'post_id': tweet.id_str
                }
                print(f"   ✅ X (Twitter): SUCCESS (ID: {tweet.id_str})")
                return True
            else:
                self.results['twitter_personal'] = {
                    'status': 'failed',
                    'message': 'Tweet creation failed',
                    'post_id': None
                }
                return False
                
        except ImportError:
            print("   ⚠️  Installing tweepy...")
            os.system("pip install tweepy")
            return self.test_twitter_personal()
            
        except Exception as e:
            self.results['twitter_personal'] = {
                'status': 'failed',
                'message': f'Exception: {str(e)}',
                'post_id': None
            }
            print(f"   ❌ X (Twitter): ERROR - {e}")
            return False
    
    def test_telegram(self):
        """Test Telegram posting"""
        print("4️⃣ Testing Telegram...")
        
        try:
            bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
            channel_id = os.getenv('TELEGRAM_CHANNEL_ID')
            
            if not bot_token or not channel_id:
                self.results['telegram'] = {
                    'status': 'failed',
                    'message': 'Missing Telegram bot token or channel ID',
                    'post_id': None
                }
                return False
            
            url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
            
            payload = {
                'chat_id': channel_id,
                'text': self.test_content['telegram'],
                'parse_mode': 'Markdown'
            }
            
            response = requests.post(url, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('ok'):
                    message_id = result.get('result', {}).get('message_id')
                    self.results['telegram'] = {
                        'status': 'success',
                        'message': 'Posted successfully',
                        'post_id': str(message_id)
                    }
                    print(f"   ✅ Telegram: SUCCESS (ID: {message_id})")
                    return True
                else:
                    self.results['telegram'] = {
                        'status': 'failed',
                        'message': f'Telegram API error: {result.get("description")}',
                        'post_id': None
                    }
                    return False
            else:
                self.results['telegram'] = {
                    'status': 'failed',
                    'message': f'HTTP error: {response.status_code}',
                    'post_id': None
                }
                return False
                
        except Exception as e:
            self.results['telegram'] = {
                'status': 'failed',
                'message': f'Exception: {str(e)}',
                'post_id': None
            }
            print(f"   ❌ Telegram: ERROR - {e}")
            return False
    
    def run_full_test(self):
        """Run complete multi-platform posting test"""
        print("🚀 AI Finance Agency - Multi-Platform Posting Test")
        print("=" * 60)
        print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Test each platform in sequence
        platforms = [
            ('LinkedIn Personal', self.test_linkedin_personal),
            ('LinkedIn Company', self.test_linkedin_company),
            ('X (Twitter) Personal', self.test_twitter_personal),
            ('Telegram', self.test_telegram)
        ]
        
        for platform_name, test_func in platforms:
            try:
                test_func()
                time.sleep(2)  # Brief pause between platforms
            except Exception as e:
                print(f"   ❌ {platform_name}: CRITICAL ERROR - {e}")
        
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        success_count = 0
        for platform, result in self.results.items():
            status_icon = "✅" if result['status'] == 'success' else "❌"
            platform_name = platform.replace('_', ' ').title()
            
            print(f"{status_icon} {platform_name}: {result['status'].upper()}")
            if result['post_id']:
                print(f"   Post ID: {result['post_id']}")
            if result['message']:
                print(f"   Message: {result['message']}")
            print()
            
            if result['status'] == 'success':
                success_count += 1
        
        print(f"📈 Success Rate: {success_count}/{len(self.results)} platforms ({success_count/len(self.results)*100:.1f}%)")
        
        if success_count == len(self.results):
            print("🎉 ALL PLATFORMS WORKING PERFECTLY!")
        elif success_count > 0:
            print("⚠️  PARTIAL SUCCESS - Some platforms need attention")
        else:
            print("🚨 ALL PLATFORMS FAILED - Check credentials and configurations")
        
        return self.results

def main():
    """Main execution function"""
    tester = MultiPlatformTester()
    
    # Show test content preview
    print("📝 TEST CONTENT PREVIEW:")
    print("-" * 40)
    print("LinkedIn/Twitter:")
    print(tester.test_content['linkedin'][:100] + "...")
    print()
    
    confirm = input("🚀 Ready to post to ALL platforms? (y/n): ").lower()
    if confirm != 'y':
        print("❌ Test cancelled")
        return
    
    # Run the test
    results = tester.run_full_test()
    
    # Save results to file
    import json
    with open(f'posting_test_results_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print("\n💾 Results saved to posting_test_results_*.json")

if __name__ == "__main__":
    main()
