#!/usr/bin/env python3
"""
LinkedIn OAuth with CORRECT Redirect URI
"""

import urllib.parse
import webbrowser

# LinkedIn OAuth Configuration - CORRECT VALUES
CLIENT_ID = '77ccq66ayuwvqo'
CLIENT_SECRET = 'WPL_AP1.Vj3PvAamQi6UQCmM.K478VA=='
REDIRECT_URI = 'https://www.linkedin.com/developers/tools/oauth/redirect'  # THIS IS THE CORRECT ONE!

# Required scopes for posting
SCOPES = 'openid profile email w_member_social r_organization_social w_organization_social rw_organization_admin'

# Build OAuth URL
base_url = 'https://www.linkedin.com/oauth/v2/authorization'
params = {
    'response_type': 'code',
    'client_id': CLIENT_ID,
    'redirect_uri': REDIRECT_URI,
    'state': 'ai_finance_agency',
    'scope': SCOPES
}

auth_url = f"{base_url}?{urllib.parse.urlencode(params)}"

print("=" * 60)
print("✅ CORRECT LINKEDIN OAUTH URL")
print("=" * 60)
print("\n🔗 Click this link or copy to browser:\n")
print(auth_url)
print("\n" + "=" * 60)
print("STEPS:")
print("=" * 60)
print("1. Sign in to LinkedIn")
print("2. Select 'Treum Algotech' if dropdown appears")
print("3. Click 'Allow'")
print("4. You'll see the authorization code on LinkedIn's page")
print("5. Copy the authorization code")
print("6. Use it to exchange for token")
print("=" * 60)

# Open in browser
print("\n🌐 Opening in browser...")
webbrowser.open(auth_url)