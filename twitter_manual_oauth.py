#!/usr/bin/env python3
"""
Manual Twitter OAuth 2.0 Setup
For when automatic browser flow needs manual intervention
"""

import os
import requests
import secrets
import hashlib
import base64
from urllib.parse import urlencode
from dotenv import load_dotenv

load_dotenv()

class TwitterManualOAuth:
    def __init__(self):
        self.client_id = os.getenv('TWITTER_CLIENT_ID')
        self.client_secret = os.getenv('TWITTER_CLIENT_SECRET')
        self.redirect_uri = 'http://localhost:9876/callback'
        self.scope = 'tweet.read tweet.write users.read offline.access'
        
    def generate_pkce_pair(self):
        """Generate PKCE code verifier and challenge"""
        code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode()).digest()
        ).decode('utf-8').rstrip('=')
        return code_verifier, code_challenge
        
    def get_authorization_url(self):
        """Generate Twitter authorization URL"""
        code_verifier, code_challenge = self.generate_pkce_pair()
        
        # Store code verifier for later use
        self.code_verifier = code_verifier
        
        # Generate random state for security
        state = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
        self.state = state
        
        params = {
            'response_type': 'code',
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': self.scope,
            'state': state,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256'
        }
        
        auth_url = f"https://twitter.com/i/oauth2/authorize?{urlencode(params)}"
        return auth_url
        
    def exchange_code_for_token(self, auth_code):
        """Exchange authorization code for access token"""
        token_url = 'https://api.twitter.com/2/oauth2/token'
        
        data = {
            'grant_type': 'authorization_code',
            'code': auth_code,
            'redirect_uri': self.redirect_uri,
            'code_verifier': self.code_verifier,
            'client_id': self.client_id
        }
        
        # Twitter OAuth 2.0 requires Basic Auth with client credentials
        auth_header = base64.b64encode(f"{self.client_id}:{self.client_secret}".encode()).decode()
        headers = {
            'Authorization': f'Basic {auth_header}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        response = requests.post(token_url, data=data, headers=headers)
        
        if response.status_code == 200:
            token_data = response.json()
            return token_data.get('access_token'), token_data.get('refresh_token')
        else:
            print(f"❌ Error getting token: {response.status_code} - {response.text}")
            return None, None
            
    def save_tokens_to_env(self, access_token, refresh_token):
        """Save access and refresh tokens to .env file"""
        env_path = '.env'
        
        # Read existing .env
        with open(env_path, 'r') as f:
            lines = f.readlines()
        
        # Update or add access token
        access_token_exists = False
        refresh_token_exists = False
        
        for i, line in enumerate(lines):
            if line.startswith('TWITTER_PERSONAL_ACCESS_TOKEN='):
                lines[i] = f'TWITTER_PERSONAL_ACCESS_TOKEN={access_token}\n'
                access_token_exists = True
            elif line.startswith('TWITTER_PERSONAL_REFRESH_TOKEN='):
                lines[i] = f'TWITTER_PERSONAL_REFRESH_TOKEN={refresh_token}\n'
                refresh_token_exists = True
        
        # Add tokens if they don't exist
        if not access_token_exists:
            lines.append(f'\n# Twitter Personal OAuth Tokens (auto-generated)\n')
            lines.append(f'TWITTER_PERSONAL_ACCESS_TOKEN={access_token}\n')
            
        if not refresh_token_exists:
            lines.append(f'TWITTER_PERSONAL_REFRESH_TOKEN={refresh_token}\n')
        
        # Write back to .env
        with open(env_path, 'w') as f:
            f.writelines(lines)
        
        print(f"✅ Access and refresh tokens saved to .env file")
        
    def test_token(self, access_token):
        """Test if the Twitter token works"""
        headers = {
            'Authorization': f'Bearer {access_token}',
        }
        
        response = requests.get('https://api.twitter.com/2/users/me', headers=headers)
        
        if response.status_code == 200:
            user_data = response.json()
            username = user_data.get('data', {}).get('username', 'User')
            print(f"✅ Token valid! Authenticated as: @{username}")
            return True
        else:
            print(f"❌ Token test failed: {response.status_code} - {response.text}")
            return False
            
    def setup(self):
        """Complete manual OAuth setup process"""
        print("\n🐦 Twitter Manual OAuth 2.0 Setup")
        print("=" * 50)
        
        # Check if we already have a valid token
        existing_token = os.getenv('TWITTER_PERSONAL_ACCESS_TOKEN')
        if existing_token and existing_token != 'your_personal_access_token':
            print("📌 Found existing access token in .env")
            print("Testing token validity...")
            
            if self.test_token(existing_token):
                print("\n✅ Existing token is valid! You're all set.")
                return existing_token
            else:
                print("⚠️ Existing token is invalid. Getting new token...")
        
        # Generate authorization URL
        auth_url = self.get_authorization_url()
        
        print("\n📋 MANUAL AUTHORIZATION STEPS:")
        print("1️⃣ Copy and paste this URL into your browser:")
        print(f"\n{auth_url}\n")
        print("2️⃣ Sign in to Twitter/X and click 'Authorize App'")
        print("3️⃣ You'll be redirected to localhost:9876/callback?code=...")
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
        access_token, refresh_token = self.exchange_code_for_token(auth_code)
        
        if access_token:
            print("✅ Access token obtained!")
            
            # Test the token
            if self.test_token(access_token):
                # Save to .env
                self.save_tokens_to_env(access_token, refresh_token)
                
                print("\n" + "=" * 50)
                print("🎉 Twitter OAuth Setup Complete!")
                print("You can now use automated Twitter posting.")
                print("=" * 50)
                
                return access_token
            else:
                print("❌ Token validation failed")
        else:
            print("❌ Failed to get access token")
        
        return None

def main():
    oauth = TwitterManualOAuth()
    token = oauth.setup()
    
    if token:
        print(f"\n📋 Your access token: {token[:20]}...")
        print("\n🚀 Next steps:")
        print("1. Token saved to .env file")
        print("2. Twitter OAuth is now complete")
        print("3. You can test with: python test_all_platforms.py")
    else:
        print("\n❌ Setup failed. Please try again.")

if __name__ == "__main__":
    main()
