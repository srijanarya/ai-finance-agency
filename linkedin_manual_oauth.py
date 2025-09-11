#!/usr/bin/env python3
"""
Manual LinkedIn OAuth Setup
For when automatic browser flow needs manual intervention
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_manual_auth_url():
    """Generate LinkedIn authorization URL for manual completion"""
    client_id = os.getenv('LINKEDIN_PERSONAL_CLIENT_ID')
    redirect_uri = 'http://localhost:8080/callback'
    scope = 'w_member_social r_liteprofile'
    
    auth_url = (
        f"https://www.linkedin.com/oauth/v2/authorization?"
        f"response_type=code&"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"scope={scope.replace(' ', '%20')}"
    )
    
    return auth_url

def exchange_code_for_token(auth_code):
    """Exchange authorization code for access token"""
    client_id = os.getenv('LINKEDIN_PERSONAL_CLIENT_ID')
    client_secret = os.getenv('LINKEDIN_PERSONAL_CLIENT_SECRET')
    redirect_uri = 'http://localhost:8080/callback'
    
    token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
    
    data = {
        'grant_type': 'authorization_code',
        'code': auth_code,
        'redirect_uri': redirect_uri,
        'client_id': client_id,
        'client_secret': client_secret
    }
    
    response = requests.post(token_url, data=data)
    
    if response.status_code == 200:
        token_data = response.json()
        return token_data.get('access_token')
    else:
        print(f"❌ Error getting token: {response.text}")
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
        if line.startswith('LINKEDIN_PERSONAL_ACCESS_TOKEN='):
            lines[i] = f'LINKEDIN_PERSONAL_ACCESS_TOKEN={token}\n'
            token_exists = True
            break
    
    # Add token if it doesn't exist
    if not token_exists:
        lines.append(f'\n# LinkedIn Personal OAuth Token (auto-generated)\n')
        lines.append(f'LINKEDIN_PERSONAL_ACCESS_TOKEN={token}\n')
    
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
    
    response = requests.get('https://api.linkedin.com/v2/me', headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        first_name = user_data.get('localizedFirstName', 'User')
        print(f"✅ Token valid! Authenticated as: {first_name}")
        return True
    else:
        print(f"❌ Token test failed: {response.text}")
        return False

def main():
    print("\n🔐 LinkedIn Manual OAuth Setup")
    print("=" * 50)
    
    # Check if we already have a valid token
    existing_token = os.getenv('LINKEDIN_PERSONAL_ACCESS_TOKEN')
    if existing_token and existing_token != 'your_personal_access_token_here':
        print("📌 Found existing access token in .env")
        print("Testing token validity...")
        
        if test_token(existing_token):
            print("\n✅ Existing token is valid! You're all set.")
            return existing_token
        else:
            print("⚠️ Existing token is invalid. Getting new token...")
    
    # Generate authorization URL
    auth_url = get_manual_auth_url()
    
    print("\n📋 MANUAL AUTHORIZATION STEPS:")
    print("1️⃣ Copy and paste this URL into your browser:")
    print(f"\n{auth_url}\n")
    print("2️⃣ Sign in to LinkedIn and click 'Allow'")
    print("3️⃣ You'll be redirected to localhost:8080/callback?code=...")
    print("4️⃣ Copy the 'code' parameter from the redirected URL")
    print("   (The part after 'code=' and before '&' if there are other parameters)")
    
    # Get authorization code from user
    print("\n" + "=" * 50)
    auth_code = input("5️⃣ Paste the authorization code here: ").strip()
    
    if not auth_code:
        print("❌ No code provided. Exiting.")
        return None
    
    # Exchange for access token
    print("\n6️⃣ Exchanging code for access token...")
    token = exchange_code_for_token(auth_code)
    
    if token:
        print("✅ Access token obtained!")
        
        # Test the token
        if test_token(token):
            # Save to .env
            save_token_to_env(token)
            
            print("\n" + "=" * 50)
            print("🎉 LinkedIn OAuth Setup Complete!")
            print("You can now use automated LinkedIn posting.")
            print("=" * 50)
            
            return token
        else:
            print("❌ Token validation failed")
    else:
        print("❌ Failed to get access token")
    
    return None

if __name__ == "__main__":
    token = main()
    
    if token:
        print(f"\n📋 Your access token: {token[:20]}...")
        print("\n🚀 Next steps:")
        print("1. Token saved to .env file")
        print("2. LinkedIn OAuth is now complete")
        print("3. You can test with: python test_all_platforms.py")
    else:
        print("\n❌ Setup failed. Please try again.")
