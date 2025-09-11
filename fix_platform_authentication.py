#!/usr/bin/env python3
"""
Platform Authentication Fix
Help refresh and set up proper authentication for all platforms
"""

import os
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class AuthenticationFixer:
    def __init__(self):
        self.issues = []
        self.fixes = []
    
    def check_linkedin_personal(self):
        """Check and guide LinkedIn Personal token refresh"""
        print("🔍 Checking LinkedIn Personal Authentication...")
        
        access_token = os.getenv('LINKEDIN_PERSONAL_ACCESS_TOKEN')
        
        if not access_token or access_token.startswith('your_'):
            self.issues.append("LinkedIn Personal: Invalid token")
            print("❌ LinkedIn Personal token is invalid or placeholder")
            self.show_linkedin_personal_fix()
            return False
        
        # Test the token
        try:
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get('https://api.linkedin.com/v2/people/~', headers=headers)
            
            if response.status_code == 200:
                profile = response.json()
                print(f"✅ LinkedIn Personal: Working! Connected to {profile.get('localizedFirstName', 'Unknown')}")
                return True
            else:
                self.issues.append(f"LinkedIn Personal: Token expired ({response.status_code})")
                print(f"❌ LinkedIn Personal: Token expired or invalid ({response.status_code})")
                self.show_linkedin_personal_fix()
                return False
                
        except Exception as e:
            self.issues.append(f"LinkedIn Personal: Error - {e}")
            print(f"❌ LinkedIn Personal: Error - {e}")
            return False
    
    def show_linkedin_personal_fix(self):
        """Show how to fix LinkedIn Personal authentication"""
        print("\n💡 How to fix LinkedIn Personal:")
        print("1. Go to: https://www.linkedin.com/developers/apps")
        print("2. Select your app (or create one)")
        print("3. Go to 'Auth' tab")
        print("4. Copy the 'Client ID' and 'Client Secret'") 
        print("5. Run: python linkedin_oauth_setup.py")
        print("6. Follow the OAuth flow to get a new access token")
        self.fixes.append("Run LinkedIn Personal OAuth flow")
    
    def check_linkedin_company(self):
        """Check LinkedIn Company authentication"""
        print("\n🔍 Checking LinkedIn Company Authentication...")
        
        access_token = os.getenv('LINKEDIN_COMPANY_ACCESS_TOKEN')
        company_page_id = os.getenv('LINKEDIN_COMPANY_PAGE_ID')
        
        if not access_token or access_token.startswith('your_'):
            self.issues.append("LinkedIn Company: Invalid token")
            print("❌ LinkedIn Company token is invalid or placeholder")
            self.show_linkedin_company_fix()
            return False
        
        if not company_page_id or company_page_id.startswith('your_'):
            self.issues.append("LinkedIn Company: Missing page ID")
            print("❌ LinkedIn Company page ID is missing")
            self.show_linkedin_company_fix()
            return False
        
        # Test the token
        try:
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(f'https://api.linkedin.com/v2/organizations/{company_page_id}', headers=headers)
            
            if response.status_code == 200:
                org = response.json()
                print(f"✅ LinkedIn Company: Working! Connected to {org.get('localizedName', 'Unknown Company')}")
                return True
            else:
                self.issues.append(f"LinkedIn Company: Token expired ({response.status_code})")
                print(f"❌ LinkedIn Company: Token expired or invalid ({response.status_code})")
                self.show_linkedin_company_fix()
                return False
                
        except Exception as e:
            self.issues.append(f"LinkedIn Company: Error - {e}")
            print(f"❌ LinkedIn Company: Error - {e}")
            return False
    
    def show_linkedin_company_fix(self):
        """Show how to fix LinkedIn Company authentication"""
        print("\n💡 How to fix LinkedIn Company:")
        print("1. Go to: https://www.linkedin.com/developers/apps")
        print("2. Select your company app")
        print("3. Ensure you have 'w_organization_social' permission")
        print("4. Run: python generate_company_oauth.py")
        print("5. Complete the OAuth flow for organization access")
        self.fixes.append("Run LinkedIn Company OAuth flow")
    
    def check_twitter(self):
        """Check Twitter authentication"""
        print("\n🔍 Checking X (Twitter) Authentication...")
        
        consumer_key = os.getenv('TWITTER_PERSONAL_CONSUMER_KEY')
        consumer_secret = os.getenv('TWITTER_PERSONAL_CONSUMER_SECRET') 
        access_token = os.getenv('TWITTER_PERSONAL_ACCESS_TOKEN')
        access_token_secret = os.getenv('TWITTER_PERSONAL_ACCESS_TOKEN_SECRET')
        
        missing_creds = []
        if not consumer_key or consumer_key.startswith('your_'):
            missing_creds.append('Consumer Key')
        if not consumer_secret or consumer_secret.startswith('your_'):
            missing_creds.append('Consumer Secret')
        if not access_token or access_token.startswith('your_'):
            missing_creds.append('Access Token')
        if not access_token_secret or access_token_secret.startswith('your_'):
            missing_creds.append('Access Token Secret')
        
        if missing_creds:
            self.issues.append(f"Twitter: Missing {', '.join(missing_creds)}")
            print(f"❌ Twitter: Missing {', '.join(missing_creds)}")
            self.show_twitter_fix()
            return False
        
        # Test the credentials
        try:
            import tweepy
            
            auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
            auth.set_access_token(access_token, access_token_secret)
            api = tweepy.API(auth)
            
            # Test by getting user info
            user = api.verify_credentials()
            if user:
                print(f"✅ Twitter: Working! Connected to @{user.screen_name}")
                return True
            else:
                self.issues.append("Twitter: Authentication failed")
                print("❌ Twitter: Authentication failed")
                self.show_twitter_fix()
                return False
                
        except ImportError:
            print("⚠️  Installing tweepy...")
            os.system("pip install tweepy")
            return self.check_twitter()
            
        except Exception as e:
            self.issues.append(f"Twitter: Error - {e}")
            print(f"❌ Twitter: Error - {e}")
            self.show_twitter_fix()
            return False
    
    def show_twitter_fix(self):
        """Show how to fix Twitter authentication"""
        print("\n💡 How to fix X (Twitter):")
        print("1. Go to: https://developer.twitter.com/en/portal/dashboard")
        print("2. Select your app")
        print("3. Go to 'Keys and Tokens' tab")
        print("4. Copy:")
        print("   - API Key (Consumer Key)")
        print("   - API Secret (Consumer Secret)")
        print("   - Access Token")
        print("   - Access Token Secret")
        print("5. Update your .env file with these values")
        self.fixes.append("Get fresh Twitter API credentials from developer dashboard")
    
    def check_telegram(self):
        """Check Telegram authentication"""
        print("\n🔍 Checking Telegram Authentication...")
        
        bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        channel_id = os.getenv('TELEGRAM_CHANNEL_ID')
        
        if not bot_token or bot_token.startswith('XXXXXXXXX'):
            self.issues.append("Telegram: Invalid bot token")
            print("❌ Telegram bot token is invalid or placeholder")
            self.show_telegram_fix()
            return False
        
        if not channel_id or channel_id.startswith('@your_'):
            self.issues.append("Telegram: Invalid channel ID")
            print("❌ Telegram channel ID is invalid or placeholder")
            self.show_telegram_fix()
            return False
        
        # Test the bot
        try:
            url = f"https://api.telegram.org/bot{bot_token}/getMe"
            response = requests.get(url)
            
            if response.status_code == 200:
                bot_info = response.json()
                if bot_info.get('ok'):
                    bot_name = bot_info['result']['username']
                    print(f"✅ Telegram Bot: Working! Connected to @{bot_name}")
                    
                    # Test channel access
                    chat_url = f"https://api.telegram.org/bot{bot_token}/getChat"
                    chat_response = requests.get(chat_url, params={'chat_id': channel_id})
                    
                    if chat_response.status_code == 200:
                        chat_info = chat_response.json()
                        if chat_info.get('ok'):
                            chat_title = chat_info['result'].get('title', 'Unknown')
                            print(f"✅ Telegram Channel: Access confirmed to '{chat_title}'")
                            return True
                        else:
                            self.issues.append("Telegram: Channel access denied")
                            print("❌ Telegram: Cannot access channel - check bot permissions")
                            return False
                    else:
                        self.issues.append("Telegram: Channel check failed")
                        print("❌ Telegram: Channel check failed")
                        return False
                else:
                    self.issues.append("Telegram: Bot API error")
                    print("❌ Telegram: Bot API returned error")
                    return False
            else:
                self.issues.append(f"Telegram: HTTP error {response.status_code}")
                print(f"❌ Telegram: HTTP error {response.status_code}")
                self.show_telegram_fix()
                return False
                
        except Exception as e:
            self.issues.append(f"Telegram: Error - {e}")
            print(f"❌ Telegram: Error - {e}")
            return False
    
    def show_telegram_fix(self):
        """Show how to fix Telegram authentication"""
        print("\n💡 How to fix Telegram:")
        print("1. Create a bot: Message @BotFather on Telegram")
        print("2. Send: /newbot")
        print("3. Follow prompts to create your bot")
        print("4. Copy the bot token (format: 123456789:ABC-DEF...)")
        print("5. Create/get your channel:")
        print("   - Create a public channel")
        print("   - Get the channel username (e.g., @AIFinanceNews2024)")
        print("   - Add your bot as admin to the channel")
        print("6. Update your .env file with bot token and channel ID")
        self.fixes.append("Create new Telegram bot and get proper credentials")
    
    def run_full_check(self):
        """Run complete authentication check"""
        print("🔐 AI Finance Agency - Authentication Check")
        print("=" * 60)
        print(f"Check started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        results = {
            'linkedin_personal': self.check_linkedin_personal(),
            'linkedin_company': self.check_linkedin_company(), 
            'twitter': self.check_twitter(),
            'telegram': self.check_telegram()
        }
        
        print("\n" + "=" * 60)
        print("📊 AUTHENTICATION STATUS SUMMARY")
        print("=" * 60)
        
        working_count = sum(1 for status in results.values() if status)
        total_count = len(results)
        
        for platform, working in results.items():
            status_icon = "✅" if working else "❌"
            platform_name = platform.replace('_', ' ').title()
            status_text = "WORKING" if working else "NEEDS FIXING"
            print(f"{status_icon} {platform_name}: {status_text}")
        
        print(f"\n📈 Working Platforms: {working_count}/{total_count} ({working_count/total_count*100:.1f}%)")
        
        if working_count == total_count:
            print("🎉 ALL PLATFORMS AUTHENTICATED AND WORKING!")
        else:
            print(f"\n⚠️  AUTHENTICATION ISSUES FOUND:")
            for i, issue in enumerate(self.issues, 1):
                print(f"   {i}. {issue}")
            
            print(f"\n🔧 FIXES NEEDED:")
            for i, fix in enumerate(self.fixes, 1):
                print(f"   {i}. {fix}")
        
        return results, self.issues, self.fixes

def main():
    """Main execution"""
    fixer = AuthenticationFixer()
    results, issues, fixes = fixer.run_full_check()
    
    if issues:
        print(f"\n💡 RECOMMENDATION:")
        print("Fix the authentication issues above, then run:")
        print("python test_all_platforms_posting.py")
        print("to test posting to all platforms!")
    else:
        print(f"\n🚀 READY TO POST!")
        print("All platforms are authenticated and working.")
        print("Run: python test_all_platforms_posting.py")

if __name__ == "__main__":
    main()
