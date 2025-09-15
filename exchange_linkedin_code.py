#!/usr/bin/env python3
"""
LinkedIn OAuth Code Exchange - Simple Version
Usage: python3 exchange_linkedin_code.py YOUR_AUTH_CODE
"""

import os
import sys
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def exchange_and_update(auth_code):
    """Exchange authorization code for access token and update .env"""
    
    # LinkedIn OAuth configuration
    client_id = '77ccq66ayuwvqo'
    client_secret = 'WPL_AP1.Vj3PvAamQi6UQCmM.K478VA=='
    redirect_uri = 'https://www.linkedin.com/developers/tools/oauth/redirect'  # CORRECT REDIRECT URI
    token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
    
    # Exchange code for token
    data = {
        'grant_type': 'authorization_code',
        'code': auth_code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri
    }
    
    print(f"🔄 Exchanging code for token...")
    response = requests.post(token_url, data=data)
    
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data.get('access_token')
        refresh_token = token_data.get('refresh_token', '')
        expires_in = token_data.get('expires_in', 0)
        
        print(f"✅ Success! Token obtained")
        print(f"   Expires in: {expires_in // 3600} hours")
        
        # Update .env file
        env_path = '/Users/srijan/ai-finance-agency/.env'
        
        with open(env_path, 'r') as f:
            lines = f.readlines()
        
        # Update token
        token_updated = False
        for i, line in enumerate(lines):
            if line.startswith('LINKEDIN_COMPANY_ACCESS_TOKEN='):
                lines[i] = f'LINKEDIN_COMPANY_ACCESS_TOKEN={access_token}\n'
                token_updated = True
                break
        
        if not token_updated:
            lines.append(f'\nLINKEDIN_COMPANY_ACCESS_TOKEN={access_token}\n')
        
        # Add refresh token if provided
        if refresh_token:
            refresh_updated = False
            for i, line in enumerate(lines):
                if line.startswith('LINKEDIN_COMPANY_REFRESH_TOKEN='):
                    lines[i] = f'LINKEDIN_COMPANY_REFRESH_TOKEN={refresh_token}\n'
                    refresh_updated = True
                    break
            
            if not refresh_updated:
                lines.append(f'LINKEDIN_COMPANY_REFRESH_TOKEN={refresh_token}\n')
        
        # Write back
        with open(env_path, 'w') as f:
            f.writelines(lines)
        
        print(f"✅ Updated .env file")
        
        # Quick verification
        headers = {
            'Authorization': f'Bearer {access_token}',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        verify_response = requests.get('https://api.linkedin.com/v2/userinfo', headers=headers)
        if verify_response.status_code == 200:
            user_data = verify_response.json()
            print(f"✅ Verified! Connected as: {user_data.get('name', 'Unknown')}")
        
        return True
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 exchange_linkedin_code.py YOUR_AUTH_CODE")
        print("\nAfter authorizing LinkedIn, copy the 'code' parameter from the redirect URL")
        print("Example: http://localhost:8080/callback?code=AQRx123...")
        print("Then run: python3 exchange_linkedin_code.py AQRx123...")
        sys.exit(1)
    
    auth_code = sys.argv[1]
    print(f"Using authorization code: {auth_code[:20]}...")
    
    if exchange_and_update(auth_code):
        print("\n✅ LinkedIn OAuth complete! Your token has been updated.")
        print("You can now post to LinkedIn with proper permissions.")
    else:
        print("\n❌ OAuth exchange failed. The code may have expired.")
        print("Please try the authorization process again.")