#!/usr/bin/env python3
"""
Simple LinkedIn Token Exchange
Exchange authorization code for access token
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

def exchange_linkedin_token():
    """Exchange LinkedIn authorization code for access token"""
    
    # Get credentials from .env
    client_id = os.getenv('LINKEDIN_PERSONAL_CLIENT_ID')
    client_secret = os.getenv('LINKEDIN_PERSONAL_CLIENT_SECRET')
    
    print("🔐 LinkedIn Personal Token Exchange")
    print("=" * 50)
    print(f"Client ID: {client_id}")
    print(f"Client Secret: {client_secret[:15]}...")
    print()
    
    # Get authorization code from user
    auth_code = input("📋 Paste your LinkedIn authorization code here: ").strip()
    
    if not auth_code:
        print("❌ No authorization code provided")
        return None
    
    # Prepare token exchange request
    token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
    
    data = {
        'grant_type': 'authorization_code',
        'code': auth_code,
        'redirect_uri': 'http://localhost:8080/callback',
        'client_id': client_id,
        'client_secret': client_secret
    }
    
    print("\n🔄 Exchanging authorization code for access token...")
    
    try:
        response = requests.post(token_url, data=data)
        
        print(f"Response Status: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access_token')
            
            if access_token:
                print("✅ Access token received!")
                print(f"Token: {access_token[:30]}...")
                
                # Test the token
                if test_linkedin_token(access_token):
                    # Save to .env file
                    save_token_to_env(access_token)
                    return access_token
                else:
                    print("❌ Token validation failed")
            else:
                print("❌ No access token in response")
                print(f"Response: {token_data}")
        else:
            print(f"❌ Token exchange failed: {response.status_code}")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception during token exchange: {e}")
    
    return None

def test_linkedin_token(access_token):
    """Test if LinkedIn token works"""
    print("\n🧪 Testing access token...")
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    try:
        response = requests.get('https://api.linkedin.com/v2/me', headers=headers)
        
        if response.status_code == 200:
            user_data = response.json()
            first_name = user_data.get('localizedFirstName', 'User')
            last_name = user_data.get('localizedLastName', '')
            print(f"✅ Token valid! Authenticated as: {first_name} {last_name}")
            return True
        else:
            print(f"❌ Token test failed: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception during token test: {e}")
        return False

def save_token_to_env(access_token):
    """Save access token to .env file"""
    print("\n💾 Saving token to .env file...")
    
    env_path = '.env'
    
    try:
        # Read existing .env
        with open(env_path, 'r') as f:
            lines = f.readlines()
        
        # Update or add access token
        token_updated = False
        for i, line in enumerate(lines):
            if line.startswith('LINKEDIN_PERSONAL_ACCESS_TOKEN='):
                lines[i] = f'LINKEDIN_PERSONAL_ACCESS_TOKEN={access_token}\n'
                token_updated = True
                break
        
        # Add token if it doesn't exist
        if not token_updated:
            lines.append(f'\n# LinkedIn Personal OAuth Token (auto-generated)\n')
            lines.append(f'LINKEDIN_PERSONAL_ACCESS_TOKEN={access_token}\n')
        
        # Write back to .env
        with open(env_path, 'w') as f:
            f.writelines(lines)
        
        print("✅ Token saved successfully!")
        
    except Exception as e:
        print(f"❌ Error saving token: {e}")

def main():
    token = exchange_linkedin_token()
    
    if token:
        print("\n" + "=" * 50)
        print("🎉 LinkedIn Personal OAuth Complete!")
        print("✅ You can now post to LinkedIn automatically")
        print("=" * 50)
        print("\n🚀 Next steps:")
        print("1. Test with: python -c \"import test_all_platforms; test_all_platforms.test_linkedin()\"")
        print("2. Or run full test: python test_all_platforms.py")
    else:
        print("\n❌ Token exchange failed. Please try again.")
        print("\n💡 Tips:")
        print("- Make sure you copied the FULL authorization code")
        print("- The code should be quite long (100+ characters)")
        print("- Don't include 'code=' in your paste, just the code itself")
        print("- Try getting a fresh authorization code if this one is old")

if __name__ == "__main__":
    main()
