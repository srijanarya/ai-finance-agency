#!/usr/bin/env python3
"""
Exchange LinkedIn authorization code for access token with company permissions
"""

import os
import requests
import json
from datetime import datetime

# Authorization code from user
CODE = "AQRDetv8J-8SfXnEXTUlgxdf7EEvPX_rsNaCgtIuOSr4M2JHhQGVho4OXj0ji7HRLEqk7azIIZOpu5PY9C6ppIne9eI1qcxJ-3MfxYJ3ZfKR8SbYKylbKVJxMR_YG81BnSmVYY0uHqWEMcHrcGDzHVLAoMIadNT4J9cfdIeewMO033OJ4DRp-9z8NEidgLaJw-6QJTJDOaoDxAmSB8M"

# LinkedIn app credentials
CLIENT_ID = "776dnomhse84tj"
CLIENT_SECRET = "WPL_AP1.r3GQEtOyAZpKQkFJ.mafPeA=="
REDIRECT_URI = "http://localhost:8080/callback"

print("=" * 70)
print("🔄 Exchanging authorization code for access token...")
print("=" * 70)

# Exchange code for token
url = "https://api.linkedin.com/oauth/v2/accessToken"
data = {
    "grant_type": "authorization_code",
    "code": CODE,
    "redirect_uri": REDIRECT_URI,
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET
}

response = requests.post(url, data=data)

print(f"\nResponse Status: {response.status_code}")

if response.status_code == 200:
    token_data = response.json()
    access_token = token_data.get('access_token')
    scope = token_data.get('scope', 'unknown')
    expires_in = token_data.get('expires_in', 'unknown')
    
    print("\n✅ SUCCESS! Token obtained!")
    print(f"📋 Scopes: {scope}")
    print(f"⏱️ Expires in: {expires_in} seconds")
    print(f"🔑 Token (first 50 chars): {access_token[:50]}...")
    
    # Update .env file
    print("\n💾 Updating .env file...")
    
    # Read existing .env
    env_lines = []
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                # Skip old LinkedIn tokens
                if not line.startswith('LINKEDIN_ACCESS_TOKEN=') and \
                   not line.startswith('LINKEDIN_COMPANY_ACCESS_TOKEN='):
                    env_lines.append(line)
    
    # Add new tokens
    env_lines.append(f"\n# LinkedIn Company Access Token - Generated {datetime.now()}\n")
    env_lines.append(f"LINKEDIN_COMPANY_ACCESS_TOKEN={access_token}\n")
    env_lines.append(f"LINKEDIN_ACCESS_TOKEN={access_token}\n")
    env_lines.append(f"LINKEDIN_COMPANY_ID=108595796\n")
    env_lines.append(f"LINKEDIN_TOKEN_SCOPE={scope}\n")
    
    # Write back to .env
    with open('.env', 'w') as f:
        f.writelines(env_lines)
    
    print("✅ Token saved to .env file!")
    
    # Test the token
    print("\n🧪 Testing token with company page access...")
    
    test_headers = {
        'Authorization': f'Bearer {access_token}',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    # Check organization access
    org_response = requests.get(
        'https://api.linkedin.com/v2/organizationAcls?q=roleAssignee',
        headers=test_headers
    )
    
    if org_response.status_code == 200:
        org_data = org_response.json()
        if org_data.get('elements'):
            print("✅ Company page access confirmed!")
            for org in org_data['elements']:
                print(f"   Organization: {org.get('organization')}")
                print(f"   Role: {org.get('role')}")
        else:
            print("⚠️ No organization access found in token")
    else:
        print(f"⚠️ Could not verify organization access: {org_response.status_code}")
    
    print("\n" + "=" * 70)
    print("🎉 Token exchange complete! You can now post to your company page.")
    print("=" * 70)
    
else:
    print(f"\n❌ Failed to exchange code!")
    error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {}
    print(f"Error: {error_data.get('error', 'unknown')}")
    print(f"Description: {error_data.get('error_description', response.text)}")
    
    if 'invalid_grant' in str(error_data.get('error', '')):
        print("\n⚠️ The authorization code may have expired.")
        print("Authorization codes are only valid for a short time.")
        print("Please get a new authorization code and try again quickly.")