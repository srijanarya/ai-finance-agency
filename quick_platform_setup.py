#!/usr/bin/env python3
"""
Quick Platform Setup
Interactive setup for each social media platform
"""

import os
import requests
import sys
from dotenv import load_dotenv

def setup_telegram():
    """Interactive Telegram bot setup"""
    print("🤖 Telegram Bot Setup")
    print("=" * 40)
    
    print("📱 Step 1: Create a Telegram Bot")
    print("1. Open Telegram and message @BotFather")
    print("2. Send: /newbot")
    print("3. Follow the prompts to create your bot")
    print("4. Copy the bot token when provided")
    print()
    
    bot_token = input("🔑 Enter your Telegram bot token: ").strip()
    
    if bot_token:
        # Test the bot token
        try:
            url = f"https://api.telegram.org/bot{bot_token}/getMe"
            response = requests.get(url)
            
            if response.status_code == 200:
                bot_info = response.json()
                if bot_info.get('ok'):
                    bot_name = bot_info['result']['username']
                    print(f"✅ Bot token verified! Connected to @{bot_name}")
                    
                    print("\n📢 Step 2: Set up your channel")
                    print("1. Create a new Telegram channel")
                    print("2. Make it public and set a username")
                    print("3. Add your bot as an administrator")
                    print("4. The channel ID should start with @")
                    print()
                    
                    channel_id = input("🔗 Enter your channel ID (e.g., @AIFinanceNews2024): ").strip()
                    
                    if channel_id:
                        # Update .env file
                        update_env_var('TELEGRAM_BOT_TOKEN', bot_token)
                        update_env_var('TELEGRAM_CHANNEL_ID', channel_id)
                        
                        print("✅ Telegram credentials saved!")
                        return True
                    else:
                        print("❌ Channel ID required")
                        return False
                else:
                    print("❌ Bot token invalid")
                    return False
            else:
                print(f"❌ Failed to verify bot token: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error testing bot token: {e}")
            return False
    else:
        print("❌ Bot token required")
        return False

def setup_twitter():
    """Interactive Twitter setup"""
    print("\n🐦 X (Twitter) Setup")
    print("=" * 40)
    
    print("📱 Get your Twitter API credentials:")
    print("1. Go to: https://developer.twitter.com/en/portal/dashboard")
    print("2. Select your app")
    print("3. Go to 'Keys and Tokens' tab")
    print("4. Copy the following values:")
    print()
    
    consumer_key = input("🔑 API Key (Consumer Key): ").strip()
    consumer_secret = input("🔑 API Secret (Consumer Secret): ").strip()
    access_token = input("🔑 Access Token: ").strip()
    access_token_secret = input("🔑 Access Token Secret: ").strip()
    
    if all([consumer_key, consumer_secret, access_token, access_token_secret]):
        # Test the credentials
        try:
            import tweepy
            
            auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
            auth.set_access_token(access_token, access_token_secret)
            api = tweepy.API(auth)
            
            user = api.verify_credentials()
            if user:
                print(f"✅ Twitter credentials verified! Connected to @{user.screen_name}")
                
                # Update .env file
                update_env_var('TWITTER_PERSONAL_CONSUMER_KEY', consumer_key)
                update_env_var('TWITTER_PERSONAL_CONSUMER_SECRET', consumer_secret)
                update_env_var('TWITTER_PERSONAL_ACCESS_TOKEN', access_token)
                update_env_var('TWITTER_PERSONAL_ACCESS_TOKEN_SECRET', access_token_secret)
                
                print("✅ Twitter credentials saved!")
                return True
            else:
                print("❌ Twitter authentication failed")
                return False
                
        except ImportError:
            print("⚠️  Installing tweepy...")
            os.system("pip install tweepy")
            return setup_twitter()
            
        except Exception as e:
            print(f"❌ Error testing Twitter credentials: {e}")
            return False
    else:
        print("❌ All Twitter credentials required")
        return False

def setup_linkedin_personal():
    """Guide for LinkedIn Personal setup"""
    print("\n💼 LinkedIn Personal Setup")
    print("=" * 40)
    
    print("📱 LinkedIn Personal requires OAuth flow:")
    print("1. Go to: https://www.linkedin.com/developers/apps")
    print("2. Create or select your app")
    print("3. Get Client ID and Client Secret")
    print("4. Run the OAuth setup script")
    print()
    
    client_id = input("🔑 LinkedIn Client ID (optional for now): ").strip()
    client_secret = input("🔑 LinkedIn Client Secret (optional for now): ").strip()
    
    if client_id and client_secret:
        update_env_var('LINKEDIN_PERSONAL_CLIENT_ID', client_id)
        update_env_var('LINKEDIN_PERSONAL_CLIENT_SECRET', client_secret)
        print("✅ LinkedIn client credentials saved!")
        print("💡 Next: Run 'python linkedin_oauth_setup.py' to complete setup")
        return True
    else:
        print("⚠️  LinkedIn setup requires OAuth flow - skipping for now")
        print("💡 Run 'python linkedin_oauth_setup.py' when ready")
        return False

def update_env_var(key, value):
    """Update environment variable in .env file"""
    # Read current .env file
    env_lines = []
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            env_lines = f.readlines()
    
    # Update or add the key
    key_found = False
    for i, line in enumerate(env_lines):
        if line.startswith(f'{key}='):
            env_lines[i] = f'{key}={value}\n'
            key_found = True
            break
    
    if not key_found:
        env_lines.append(f'{key}={value}\n')
    
    # Write back to file
    with open('.env', 'w') as f:
        f.writelines(env_lines)

def main():
    """Main setup flow"""
    print("🚀 AI Finance Agency - Quick Platform Setup")
    print("=" * 50)
    print("Let's set up your social media platforms step by step!")
    print()
    
    platforms = [
        ("Telegram (easiest)", setup_telegram),
        ("X/Twitter", setup_twitter),
        ("LinkedIn Personal", setup_linkedin_personal)
    ]
    
    results = {}
    
    for platform_name, setup_func in platforms:
        print(f"\n{'='*50}")
        choice = input(f"Set up {platform_name}? (y/n): ").lower()
        
        if choice == 'y':
            try:
                results[platform_name] = setup_func()
            except Exception as e:
                print(f"❌ Error setting up {platform_name}: {e}")
                results[platform_name] = False
        else:
            print(f"⏭️  Skipping {platform_name}")
            results[platform_name] = False
    
    # Summary
    print(f"\n{'='*50}")
    print("📊 SETUP SUMMARY")
    print("=" * 50)
    
    success_count = sum(1 for success in results.values() if success)
    total_count = len(results)
    
    for platform, success in results.items():
        icon = "✅" if success else "❌"
        status = "CONFIGURED" if success else "NEEDS SETUP"
        print(f"{icon} {platform}: {status}")
    
    print(f"\n📈 Configured: {success_count}/{total_count} platforms")
    
    if success_count > 0:
        print(f"\n🚀 Ready to test! Run:")
        print("python test_all_platforms_posting.py")
    else:
        print(f"\n💡 Set up at least one platform first")
    
    print("\n💡 For LinkedIn setup, run:")
    print("python linkedin_oauth_setup.py")

if __name__ == "__main__":
    main()
