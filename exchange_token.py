#!/usr/bin/env python3
"""
Exchange LinkedIn authorization code for access token
Works with both personal and company apps
"""

import os
import sys
import requests
import json
from datetime import datetime

def exchange_code(code, client_id, client_secret, redirect_uri):
    """Exchange authorization code for access token"""
    
    url = "https://api.linkedin.com/oauth/v2/accessToken"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
        "client_id": client_id,
        "client_secret": client_secret
    }
    
    print(f"Exchanging with Client ID: {client_id}")
    response = requests.post(url, data=data)
    
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data.get('access_token')
        scope = token_data.get('scope', 'unknown')
        
        print(f"✅ SUCCESS! Token obtained!")
        print(f"Scopes: {scope}")
        
        # Check if it has company permissions
        if 'w_organization_social' in scope:
            print("✅ Has company posting permissions!")
        else:
            print("⚠️ Missing company posting permissions")
        
        # Save to .env
        save_token(access_token, scope)
        return access_token
    else:
        print(f"❌ Failed: {response.status_code}")
        print(response.text)
        return None

def save_token(token, scope):
    """Save token to .env file"""
    
    lines = []
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if not line.startswith('LINKEDIN_ACCESS_TOKEN='):
                    lines.append(line)
    
    lines.append(f"\nLINKEDIN_ACCESS_TOKEN={token}\n")
    lines.append(f"LINKEDIN_TOKEN_SCOPE={scope}\n")
    lines.append(f"LINKEDIN_COMPANY_ID=108595796\n")
    
    with open('.env', 'w') as f:
        f.writelines(lines)
    
    print("✅ Token saved to .env")

def test_company_access(token):
    """Test if token can access company page"""
    
    headers = {
        'Authorization': f'Bearer {token}',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    # Check organization access
    response = requests.get(
        'https://api.linkedin.com/v2/organizationAcls?q=roleAssignee',
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get('elements'):
            print("\n✅ Company access confirmed:")
            for org in data['elements']:
                print(f"  Organization: {org.get('organization')}")
                print(f"  Role: {org.get('role')}")
            return True
    
    print("\n⚠️ No company access found")
    return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 exchange_token.py YOUR_CODE_HERE")
        print("\nOr for LinkedIn OAuth Tools redirect:")
        print("python3 exchange_token.py YOUR_CODE_HERE linkedin")
        sys.exit(1)
    
    code = sys.argv[1]
    
    # Determine which redirect URI to use
    if len(sys.argv) > 2 and sys.argv[2] == 'linkedin':
        redirect_uri = "https://www.linkedin.com/developers/tools/oauth/redirect"
    else:
        redirect_uri = "http://localhost:8080/callback"
    
    print(f"Using redirect URI: {redirect_uri}")
    
    # Try personal app first (it was working earlier)
    print("\nTrying personal app credentials...")
    token = exchange_code(
        code,
        "776dnomhse84tj",
        "WPL_AP1.r3GQEtOyAZpKQkFJ.mafPeA==",
        redirect_uri
    )
    
    if token:
        test_company_access(token)
    else:
        print("\nTrying company app credentials...")
        token = exchange_code(
            code,
            "77ccq66ayuwvqo", 
            "WPL_AP1.Vj3PvAamQi6UQCmM.K478VA==",
            redirect_uri
        )
        
        if token:
            test_company_access(token)
