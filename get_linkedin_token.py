#!/usr/bin/env python3
"""
Simple LinkedIn Access Token Generator
"""

import os
import webbrowser
from dotenv import load_dotenv
from urllib.parse import urlencode
import requests

load_dotenv()

def get_linkedin_access_token():
    client_id = os.getenv('LINKEDIN_PERSONAL_CLIENT_ID')
    client_secret = os.getenv('LINKEDIN_PERSONAL_CLIENT_SECRET')
    
    if not client_id or not client_secret:
        print("❌ Missing LinkedIn credentials in .env file")
        return
    
    # Step 1: Generate authorization URL
    params = {
        'response_type': 'code',
        'client_id': client_id,
        'redirect_uri': 'https://www.linkedin.com/developers/tools/oauth/redirect',
        'scope': 'openid profile email w_member_social'
    }
    
    auth_url = f"https://www.linkedin.com/oauth/v2/authorization?{urlencode(params)}"
    
    print("🚀 LinkedIn Personal Access Token Generator")
    print("=" * 50)
    print()
    print("📋 STEP 1: Authorize your app")
    print("Copy this URL and open it in your browser:")
    print()
    print(auth_url)
    print()
    print("📋 STEP 2: After authorization")
    print("LinkedIn will redirect you to a page that shows:")
    print('{"error":"invalid_redirect_uri",...}')
    print()
    print("📋 STEP 3: Look at the URL bar")
    print("The URL will look like:")
    print("https://www.linkedin.com/developers/tools/oauth/redirect?code=AQT...&state=...")
    print()
    print("📋 STEP 4: Copy the 'code' parameter")
    
    # Get the code from user
    code = input("\n🔑 Paste the 'code' value here: ").strip()
    
    if not code:
        print("❌ No code provided")
        return
    
    # Step 2: Exchange code for access token
    token_data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': 'https://www.linkedin.com/developers/tools/oauth/redirect',
        'client_id': client_id,
        'client_secret': client_secret
    }
    
    print("\n🔄 Exchanging code for access token...")
    response = requests.post('https://www.linkedin.com/oauth/v2/accessToken', data=token_data)
    
    if response.status_code == 200:
        token_info = response.json()
        access_token = token_info.get('access_token')
        
        if access_token:
            print("✅ Success! Got access token")
            
            # Get user profile to get user ID
            headers = {'Authorization': f'Bearer {access_token}'}
            profile_response = requests.get('https://api.linkedin.com/v2/userinfo', headers=headers)
            
            if profile_response.status_code == 200:
                profile_data = profile_response.json()
                user_id = profile_data.get('sub')
                
                print("\n📋 ADD THESE TO YOUR .env FILE:")
                print("=" * 40)
                print(f"LINKEDIN_PERSONAL_ACCESS_TOKEN={access_token}")
                print(f"LINKEDIN_PERSONAL_USER_ID={user_id}")
                print("=" * 40)
                print()
                print("✅ LinkedIn Personal setup complete!")
            else:
                print("⚠️ Got access token but couldn't get user profile")
                print(f"Access Token: {access_token}")
        else:
            print(f"❌ No access token in response: {token_info}")
    else:
        print(f"❌ Token exchange failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    get_linkedin_access_token()
