#!/usr/bin/env python3
"""
LinkedIn OAuth Manual Token Exchange
Run this after authorizing in the browser
"""

import os
import requests
from dotenv import load_dotenv
import sys

# Load environment variables
load_dotenv()

def exchange_code_for_token(auth_code):
    """Exchange authorization code for access token"""
    
    client_id = os.getenv('LINKEDIN_COMPANY_CLIENT_ID', '77ccq66ayuwvqo')
    client_secret = os.getenv('LINKEDIN_COMPANY_CLIENT_SECRET', 'WPL_AP1.Vj3PvAamQi6UQCmM.K478VA==')
    redirect_uri = 'http://localhost:8080/callback'
    token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
    
    data = {
        'grant_type': 'authorization_code',
        'code': auth_code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri
    }
    
    print(f"🔄 Exchanging authorization code for access token...")
    response = requests.post(token_url, data=data)
    
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data.get('access_token')
        refresh_token = token_data.get('refresh_token', '')
        expires_in = token_data.get('expires_in', 0)
        
        print(f"\n✅ Access Token Obtained!")
        print(f"   Token: {access_token[:30]}...{access_token[-10:]}")
        print(f"   Expires in: {expires_in} seconds ({expires_in // 3600} hours)")
        
        if refresh_token:
            print(f"   Refresh Token: {refresh_token[:20]}...")
        
        # Update .env file
        update_env_file(access_token, refresh_token)
        
        # Verify token
        verify_token(access_token)
        
        return True
    else:
        print(f"\n❌ Failed to exchange code for token")
        print(f"   Status: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def update_env_file(access_token, refresh_token=''):
    """Update .env file with new tokens"""
    env_path = '/Users/srijan/ai-finance-agency/.env'
    
    # Read current .env
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    # Update LinkedIn tokens
    token_updated = False
    refresh_updated = False
    
    for i, line in enumerate(lines):
        if line.startswith('LINKEDIN_COMPANY_ACCESS_TOKEN='):
            lines[i] = f'LINKEDIN_COMPANY_ACCESS_TOKEN={access_token}\n'
            token_updated = True
        elif line.startswith('LINKEDIN_COMPANY_REFRESH_TOKEN=') and refresh_token:
            lines[i] = f'LINKEDIN_COMPANY_REFRESH_TOKEN={refresh_token}\n'
            refresh_updated = True
    
    # Add tokens if they don't exist
    if not token_updated:
        lines.append(f'\nLINKEDIN_COMPANY_ACCESS_TOKEN={access_token}\n')
    
    if refresh_token and not refresh_updated:
        lines.append(f'LINKEDIN_COMPANY_REFRESH_TOKEN={refresh_token}\n')
    
    # Write back
    with open(env_path, 'w') as f:
        f.writelines(lines)
    
    print(f"\n✅ Updated .env file with new token")

def verify_token(access_token):
    """Verify the new token has correct permissions"""
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    # Check userinfo
    userinfo_url = 'https://api.linkedin.com/v2/userinfo'
    response = requests.get(userinfo_url, headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        print(f"\n✅ Token Verification Successful!")
        print(f"   Name: {user_data.get('name', 'N/A')}")
        print(f"   Email: {user_data.get('email', 'N/A')}")
        
        # Try to check token introspection for scopes
        print(f"\n📋 Checking token scopes...")
        introspect_url = 'https://www.linkedin.com/oauth/v2/introspectToken'
        introspect_response = requests.post(
            introspect_url, 
            data={'token': access_token}
        )
        
        if introspect_response.status_code == 200:
            introspect_data = introspect_response.json()
            scopes = introspect_data.get('scope', '')
            
            print(f"\n📋 Token Scopes:")
            if 'w_member_social' in scopes:
                print("   ✅ w_member_social - Can post as member")
            else:
                print("   ❌ w_member_social - Missing")
            
            if 'w_organization_social' in scopes:
                print("   ✅ w_organization_social - Can post to company page")
            else:
                print("   ❌ w_organization_social - Missing")
            
            if 'r_organization_social' in scopes:
                print("   ✅ r_organization_social - Can read organization data")
            
            if 'rw_organization_admin' in scopes:
                print("   ✅ rw_organization_admin - Has admin access")
    else:
        print(f"\n❌ Token verification failed: {response.status_code}")

def main():
    print("=" * 60)
    print("🔐 LINKEDIN OAUTH MANUAL TOKEN EXCHANGE")
    print("=" * 60)
    
    print("\nPaste the authorization code from the URL after authorizing")
    print("(The code parameter from the redirect URL)")
    print("\nExample: If redirected to:")
    print("http://localhost:8080/callback?code=AQRx...&state=...")
    print("Then paste: AQRx...")
    
    auth_code = input("\nEnter authorization code: ").strip()
    
    if auth_code:
        exchange_code_for_token(auth_code)
        print("\n✅ Process complete!")
    else:
        print("\n❌ No authorization code provided")

if __name__ == "__main__":
    main()