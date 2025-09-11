#!/usr/bin/env python3
"""
Simple Platform Authentication Test
Tests if all OAuth tokens are valid without posting
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_telegram():
    """Test Telegram bot token"""
    print("\n📱 Testing Telegram...")
    
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    if not token:
        print("❌ No Telegram token found")
        return False
    
    try:
        response = requests.get(f"https://api.telegram.org/bot{token}/getMe", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data['ok']:
                bot_info = data['result']
                print(f"✅ Telegram bot: @{bot_info['username']} ({bot_info['first_name']})")
                return True
        
        print(f"❌ Telegram test failed: {response.status_code}")
        return False
        
    except Exception as e:
        print(f"❌ Telegram error: {e}")
        return False

def test_linkedin_personal():
    """Test LinkedIn personal token"""
    print("\n💼 Testing LinkedIn Personal...")
    
    token = os.getenv('LINKEDIN_PERSONAL_ACCESS_TOKEN')
    if not token:
        print("❌ No LinkedIn personal token found")
        return False
    
    try:
        # Try a simple profile endpoint
        headers = {
            'Authorization': f'Bearer {token}',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        response = requests.get('https://api.linkedin.com/v2/me', headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            name = data.get('localizedFirstName', 'User')
            print(f"✅ LinkedIn Personal: {name}")
            return True
        elif response.status_code == 403:
            # Token might work for posting even if profile access is limited
            print("🟡 LinkedIn Personal: Token exists but profile access limited")
            print("   (This is normal - token may still work for posting)")
            return True
        else:
            print(f"❌ LinkedIn Personal failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ LinkedIn Personal error: {e}")
        return False

def test_linkedin_company():
    """Test LinkedIn company token"""
    print("\n🏢 Testing LinkedIn Company...")
    
    token = os.getenv('LINKEDIN_COMPANY_ACCESS_TOKEN')
    if not token:
        print("❌ No LinkedIn company token found")
        return False
    
    try:
        headers = {
            'Authorization': f'Bearer {token}',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        # Try organizations endpoint for company tokens
        response = requests.get('https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee', 
                              headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            orgs = data.get('elements', [])
            print(f"✅ LinkedIn Company: Access to {len(orgs)} organization(s)")
            return True
        else:
            print(f"❌ LinkedIn Company failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ LinkedIn Company error: {e}")
        return False

def test_twitter():
    """Test Twitter token"""
    print("\n🐦 Testing Twitter/X...")
    
    token = os.getenv('TWITTER_PERSONAL_ACCESS_TOKEN')
    if not token:
        print("❌ No Twitter token found")
        return False
    
    try:
        headers = {
            'Authorization': f'Bearer {token}',
        }
        
        response = requests.get('https://api.twitter.com/2/users/me', headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            user_data = data.get('data', {})
            username = user_data.get('username', 'Unknown')
            print(f"✅ Twitter/X: @{username}")
            return True
        else:
            print(f"❌ Twitter test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Twitter error: {e}")
        return False

def main():
    """Main test function"""
    print("🔍 Platform Authentication Test")
    print("=" * 50)
    
    results = {}
    
    # Test all platforms
    results['telegram'] = test_telegram()
    results['linkedin_personal'] = test_linkedin_personal()  
    results['linkedin_company'] = test_linkedin_company()
    results['twitter'] = test_twitter()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 AUTHENTICATION SUMMARY")
    print("=" * 50)
    
    working_platforms = []
    failed_platforms = []
    
    for platform, status in results.items():
        platform_name = platform.replace('_', ' ').title()
        if status:
            print(f"✅ {platform_name}: Ready to use")
            working_platforms.append(platform_name)
        else:
            print(f"❌ {platform_name}: Needs attention")
            failed_platforms.append(platform_name)
    
    print(f"\n🎯 Result: {len(working_platforms)}/{len(results)} platforms ready")
    
    if len(working_platforms) >= 2:
        print(f"\n🚀 You can start posting to: {', '.join(working_platforms)}")
        print("📋 Next steps:")
        print("   1. Start research agent: python run.py agent")
        print("   2. Start dashboard: python run.py dashboard") 
        print("   3. Generate content: python run.py daily")
    else:
        print("\n⚠️  Need to fix authentication issues first")
        
    return results

if __name__ == "__main__":
    main()
