#!/usr/bin/env python3
"""
Simple LinkedIn OAuth URL Generator
"""

import webbrowser
import urllib.parse

# LinkedIn OAuth Configuration
CLIENT_ID = '77ccq66ayuwvqo'
CLIENT_SECRET = 'WPL_AP1.Vj3PvAamQi6UQCmM.K478VA=='
REDIRECT_URI = 'http://localhost:8080/callback'

# Required scopes for posting
SCOPES = [
    'openid',
    'profile', 
    'email',
    'w_member_social',
    'r_organization_social',
    'w_organization_social',
    'rw_organization_admin'
]

def generate_auth_url():
    """Generate LinkedIn OAuth URL"""
    
    base_url = 'https://www.linkedin.com/oauth/v2/authorization'
    
    params = {
        'response_type': 'code',
        'client_id': CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'state': 'ai_finance_agency',
        'scope': ' '.join(SCOPES)
    }
    
    # Build URL with proper encoding
    auth_url = f"{base_url}?{urllib.parse.urlencode(params)}"
    
    print("=" * 60)
    print("LINKEDIN OAUTH AUTHORIZATION")
    print("=" * 60)
    
    print("\n📋 Configuration:")
    print(f"Client ID: {CLIENT_ID}")
    print(f"Redirect URI: {REDIRECT_URI}")
    print(f"Scopes: {', '.join(SCOPES)}")
    
    print("\n🔗 Authorization URL:")
    print(auth_url)
    
    print("\n" + "=" * 60)
    print("MANUAL STEPS:")
    print("=" * 60)
    print("1. Copy this URL and paste in your browser:")
    print(f"\n{auth_url}\n")
    print("2. Sign in to LinkedIn")
    print("3. Select 'Treum Algotech' if there's a dropdown")
    print("4. Click 'Allow'")
    print("5. You'll be redirected to: http://localhost:8080/callback?code=XXXXX")
    print("6. Copy the 'code' value from the URL")
    print("7. Run: python3 exchange_linkedin_code.py YOUR_CODE")
    
    print("\n" + "=" * 60)
    
    # Also try with different redirect URI formats
    print("\nALTERNATIVE URLs (if the above doesn't work):")
    print("\nOption 1 - With trailing slash:")
    params['redirect_uri'] = 'http://localhost:8080/callback/'
    alt_url1 = f"{base_url}?{urllib.parse.urlencode(params)}"
    print(alt_url1)
    
    print("\nOption 2 - Without callback path:")
    params['redirect_uri'] = 'http://localhost:8080'
    alt_url2 = f"{base_url}?{urllib.parse.urlencode(params)}"
    print(alt_url2)
    
    print("\nOption 3 - With 127.0.0.1:")
    params['redirect_uri'] = 'http://127.0.0.1:8080/callback'
    alt_url3 = f"{base_url}?{urllib.parse.urlencode(params)}"
    print(alt_url3)
    
    return auth_url

if __name__ == "__main__":
    generate_auth_url()