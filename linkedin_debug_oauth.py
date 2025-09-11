#!/usr/bin/env python3
"""
LinkedIn OAuth Debug Script
Detailed error reporting and troubleshooting
"""

import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

def debug_linkedin_oauth():
    """Debug LinkedIn OAuth with detailed logging"""
    
    client_id = os.getenv('LINKEDIN_PERSONAL_CLIENT_ID')
    client_secret = os.getenv('LINKEDIN_PERSONAL_CLIENT_SECRET')
    
    print("🔍 LinkedIn OAuth Debug")
    print("=" * 50)
    print(f"Client ID: {client_id}")
    print(f"Client Secret: {'*' * 10}{client_secret[-10:] if client_secret else 'None'}")
    print()
    
    # Check credentials
    if not client_id or not client_secret:
        print("❌ Missing credentials in .env file")
        return
    
    print("🔗 Fresh Authorization URL (copy this to browser):")
    auth_url = f"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={client_id}&redirect_uri=http://localhost:8080/callback&scope=w_member_social%20r_liteprofile"
    print(auth_url)
    print()
    
    print("📋 After authorization, paste the FULL code below:")
    auth_code = input("Authorization code: ").strip()
    
    if not auth_code:
        print("❌ No code provided")
        return
    
    print(f"\n📝 Code Info:")
    print(f"Length: {len(auth_code)} characters")
    print(f"First 20 chars: {auth_code[:20]}")
    print(f"Last 20 chars: {auth_code[-20:]}")
    
    # Prepare detailed request
    token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
    
    data = {
        'grant_type': 'authorization_code',
        'code': auth_code,
        'redirect_uri': 'http://localhost:8080/callback',
        'client_id': client_id,
        'client_secret': client_secret
    }
    
    print(f"\n🔄 Making request to: {token_url}")
    print("📤 Request data:")
    for key, value in data.items():
        if key == 'client_secret':
            print(f"  {key}: {'*' * 10}{value[-5:]}")
        elif key == 'code':
            print(f"  {key}: {value[:20]}...{value[-20:]}")
        else:
            print(f"  {key}: {value}")
    
    try:
        # Make the request
        response = requests.post(token_url, data=data)
        
        print(f"\n📥 Response:")
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        try:
            response_json = response.json()
            print(f"JSON Response: {json.dumps(response_json, indent=2)}")
            
            if response.status_code == 200:
                access_token = response_json.get('access_token')
                if access_token:
                    print(f"\n✅ SUCCESS! Access token received")
                    print(f"Token: {access_token[:30]}...")
                    
                    # Test the token
                    test_token(access_token)
                    
                    # Ask if user wants to save
                    save = input("\n💾 Save token to .env file? (y/N): ").lower().strip()
                    if save == 'y':
                        save_to_env(access_token)
                
        except json.JSONDecodeError:
            print(f"Raw Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_token(access_token):
    """Test the access token"""
    print("\n🧪 Testing access token...")
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    try:
        response = requests.get('https://api.linkedin.com/v2/me', headers=headers)
        print(f"Test Status: {response.status_code}")
        
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ Token works! User: {user_data.get('localizedFirstName', 'Unknown')}")
        else:
            print(f"❌ Token test failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Token test error: {e}")

def save_to_env(access_token):
    """Save token to .env"""
    try:
        with open('.env', 'r') as f:
            lines = f.readlines()
        
        updated = False
        for i, line in enumerate(lines):
            if line.startswith('LINKEDIN_PERSONAL_ACCESS_TOKEN='):
                lines[i] = f'LINKEDIN_PERSONAL_ACCESS_TOKEN={access_token}\n'
                updated = True
                break
        
        if not updated:
            lines.append(f'\nLINKEDIN_PERSONAL_ACCESS_TOKEN={access_token}\n')
        
        with open('.env', 'w') as f:
            f.writelines(lines)
        
        print("✅ Token saved to .env file!")
        
    except Exception as e:
        print(f"❌ Failed to save: {e}")

if __name__ == "__main__":
    debug_linkedin_oauth()
