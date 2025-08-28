#!/usr/bin/env python3
"""
Exchange LinkedIn authorization code for access token
"""

import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv()


def exchange_code_for_token(auth_code):
    """Exchange authorization code for access token"""
    
    client_id = os.getenv('LINKEDIN_CLIENT_ID')
    client_secret = os.getenv('LINKEDIN_CLIENT_SECRET')
    redirect_uri = 'http://localhost:8080/callback'
    
    token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
    
    data = {
        'grant_type': 'authorization_code',
        'code': auth_code,
        'redirect_uri': redirect_uri,
        'client_id': client_id,
        'client_secret': client_secret
    }
    
    print(f"🔄 Exchanging code for access token...")
    response = requests.post(token_url, data=data)
    
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data.get('access_token')
        expires_in = token_data.get('expires_in_seconds', 0)
        
        print(f"✅ Success! Access token obtained")
        print(f"📅 Token expires in {expires_in // 86400} days")
        
        # Save to .env
        save_token_to_env(access_token)
        
        # Test the token
        test_token(access_token)
        
        return access_token
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"Response: {response.text}")
        return None


def save_token_to_env(token):
    """Save access token to .env file"""
    env_path = '.env'
    
    # Read existing .env
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    # Check if token already exists
    token_exists = False
    for i, line in enumerate(lines):
        if line.startswith('LINKEDIN_ACCESS_TOKEN='):
            lines[i] = f'LINKEDIN_ACCESS_TOKEN={token}\n'
            token_exists = True
            break
    
    # Add token if it doesn't exist
    if not token_exists:
        lines.append(f'\n# LinkedIn OAuth Token (auto-generated)\n')
        lines.append(f'LINKEDIN_ACCESS_TOKEN={token}\n')
    
    # Write back to .env
    with open(env_path, 'w') as f:
        f.writelines(lines)
    
    print(f"✅ Access token saved to .env file")


def test_token(token):
    """Test if the token works"""
    headers = {
        'Authorization': f'Bearer {token}',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    print(f"\n🔍 Testing token...")
    response = requests.get('https://api.linkedin.com/v2/me', headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        first_name = user_data.get('localizedFirstName', 'User')
        last_name = user_data.get('localizedLastName', '')
        print(f"✅ Token valid! Authenticated as: {first_name} {last_name}")
        return True
    else:
        print(f"❌ Token test failed: {response.text}")
        return False


def main():
    print("\n🔐 LinkedIn Code Exchange")
    print("=" * 50)
    
    if len(sys.argv) > 1:
        auth_code = sys.argv[1]
    else:
        print("\nAfter authorizing LinkedIn, you'll be redirected to:")
        print("http://localhost:8080/callback?code=YOUR_CODE_HERE")
        print("\nPaste the code from the URL:")
        auth_code = input("Code: ").strip()
    
    if auth_code:
        token = exchange_code_for_token(auth_code)
        
        if token:
            print("\n" + "=" * 50)
            print("🎉 Setup Complete!")
            print("You can now use automated LinkedIn posting.")
            print("\nYour access token:", token[:30] + "...")
            print("=" * 50)
    else:
        print("❌ No code provided")


if __name__ == "__main__":
    main()