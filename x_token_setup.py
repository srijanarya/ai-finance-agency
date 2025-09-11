#!/usr/bin/env python3
"""
X (Twitter) Token Setup - Direct from Developer Dashboard
No OAuth flow needed - just paste tokens from dashboard
"""

import os
from dotenv import load_dotenv

def setup_x_tokens():
    """Setup X/Twitter tokens from developer dashboard"""
    
    print("🐦 X (Twitter) Token Setup")
    print("=" * 50)
    print("Get your tokens from: https://developer.twitter.com/en/portal/dashboard")
    print()
    
    load_dotenv()
    
    # Show current status
    current_tokens = {
        'TWITTER_BEARER_TOKEN': os.getenv('TWITTER_PERSONAL_BEARER_TOKEN'),
        'TWITTER_API_KEY': os.getenv('TWITTER_PERSONAL_CONSUMER_KEY'),
        'TWITTER_API_SECRET': os.getenv('TWITTER_PERSONAL_CONSUMER_SECRET'),
        'TWITTER_ACCESS_TOKEN': os.getenv('TWITTER_PERSONAL_ACCESS_TOKEN'),
        'TWITTER_ACCESS_TOKEN_SECRET': os.getenv('TWITTER_PERSONAL_ACCESS_TOKEN_SECRET'),
    }
    
    print("📋 Current Status:")
    for key, value in current_tokens.items():
        status = "✅ SET" if value and value != "your_personal_access_token" else "❌ NOT SET"
        print(f"  {key}: {status}")
    
    print("\n" + "=" * 50)
    print("💡 Token Types from X Developer Dashboard:")
    print()
    print("1️⃣  Bearer Token (App-only auth)")
    print("   - For reading tweets, user info")
    print("   - Most common for API v2")
    print()
    print("2️⃣  Consumer Keys (API Key & Secret)")
    print("   - For app identification") 
    print("   - Always needed")
    print()
    print("3️⃣  Access Token & Secret")
    print("   - For posting tweets")
    print("   - User-specific actions")
    print()
    
    choice = input("Do you want to update tokens? (y/n): ").lower()
    
    if choice == 'y':
        print("\n📝 Enter your tokens (press Enter to skip):")
        
        new_tokens = {}
        
        # Bearer Token
        bearer = input("\n🔑 Bearer Token: ").strip()
        if bearer:
            new_tokens['TWITTER_PERSONAL_BEARER_TOKEN'] = bearer
        
        # API Key (Consumer Key)
        api_key = input("🔑 API Key (Consumer Key): ").strip()
        if api_key:
            new_tokens['TWITTER_PERSONAL_CONSUMER_KEY'] = api_key
        
        # API Secret (Consumer Secret)
        api_secret = input("🔑 API Secret (Consumer Secret): ").strip()
        if api_secret:
            new_tokens['TWITTER_PERSONAL_CONSUMER_SECRET'] = api_secret
        
        # Access Token
        access_token = input("🔑 Access Token: ").strip()
        if access_token:
            new_tokens['TWITTER_PERSONAL_ACCESS_TOKEN'] = access_token
        
        # Access Token Secret
        access_secret = input("🔑 Access Token Secret: ").strip()
        if access_secret:
            new_tokens['TWITTER_PERSONAL_ACCESS_TOKEN_SECRET'] = access_secret
        
        if new_tokens:
            update_env_file(new_tokens)
        else:
            print("❌ No tokens provided")
    
    print("\n✅ X/Twitter Token Setup Complete!")
    print("\n📝 Next Steps:")
    print("1. Test with: python twitter_v2_poster.py")
    print("2. Use in your automation scripts")

def update_env_file(new_tokens):
    """Update .env file with new tokens"""
    
    env_file = '.env'
    
    try:
        # Read existing file
        with open(env_file, 'r') as f:
            lines = f.readlines()
        
        updated_keys = set()
        
        # Update existing lines
        for i, line in enumerate(lines):
            for key, value in new_tokens.items():
                if line.startswith(f'{key}='):
                    lines[i] = f'{key}={value}\n'
                    updated_keys.add(key)
                    print(f"✅ Updated {key}")
                    break
        
        # Add new keys
        for key, value in new_tokens.items():
            if key not in updated_keys:
                lines.append(f'{key}={value}\n')
                print(f"✅ Added {key}")
        
        # Write back
        with open(env_file, 'w') as f:
            f.writelines(lines)
        
        print(f"\n💾 Tokens saved to {env_file}")
        
    except Exception as e:
        print(f"❌ Error updating .env file: {e}")
        print("\n💾 Please add these manually to your .env file:")
        for key, value in new_tokens.items():
            print(f"{key}={value}")

def test_x_connection():
    """Test X/Twitter API connection"""
    
    load_dotenv()
    
    bearer_token = os.getenv('TWITTER_PERSONAL_BEARER_TOKEN')
    
    if not bearer_token or bearer_token.startswith('AAAAAAAAAAAAAAAAAAAAAE8D3w'):
        print("❌ No valid Bearer Token found")
        return
    
    try:
        import requests
        
        headers = {
            'Authorization': f'Bearer {bearer_token}',
            'Content-Type': 'application/json'
        }
        
        # Test with a simple user lookup
        response = requests.get(
            'https://api.twitter.com/2/users/me',
            headers=headers
        )
        
        if response.status_code == 200:
            user_data = response.json()
            print("✅ X API Connection Successful!")
            print(f"   User: {user_data.get('data', {}).get('username', 'Unknown')}")
        else:
            print(f"❌ X API Connection Failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except ImportError:
        print("❌ requests library not found. Install with: pip install requests")
    except Exception as e:
        print(f"❌ Error testing connection: {e}")

if __name__ == "__main__":
    setup_x_tokens()
    
    test_choice = input("\n🧪 Test X API connection? (y/n): ").lower()
    if test_choice == 'y':
        test_x_connection()
