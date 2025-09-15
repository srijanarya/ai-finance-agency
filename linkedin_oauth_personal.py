#!/usr/bin/env python3
"""
LinkedIn OAuth - Personal Posting Only (without company scopes)
"""

import urllib.parse
import webbrowser

# LinkedIn OAuth Configuration
CLIENT_ID = '77ccq66ayuwvqo'
CLIENT_SECRET = 'WPL_AP1.Vj3PvAamQi6UQCmM.K478VA=='
REDIRECT_URI = 'https://www.linkedin.com/developers/tools/oauth/redirect'

# Scopes WITHOUT company posting (since those aren't authorized)
PERSONAL_SCOPES = 'openid profile email w_member_social'

# Build OAuth URL for personal posting only
base_url = 'https://www.linkedin.com/oauth/v2/authorization'
params = {
    'response_type': 'code',
    'client_id': CLIENT_ID,
    'redirect_uri': REDIRECT_URI,
    'state': 'ai_finance_agency',
    'scope': PERSONAL_SCOPES
}

auth_url = f"{base_url}?{urllib.parse.urlencode(params)}"

print("=" * 60)
print("✅ LINKEDIN OAUTH - PERSONAL POSTING")
print("=" * 60)
print("\n⚠️  NOTE: Your app doesn't have company posting permissions")
print("This will only allow posting to your PERSONAL LinkedIn profile")
print("\n🔗 Authorization URL:\n")
print(auth_url)
print("\n" + "=" * 60)
print("STEPS:")
print("=" * 60)
print("1. Click the link above or copy to browser")
print("2. Sign in to LinkedIn")
print("3. Click 'Allow'")
print("4. Copy the authorization code from LinkedIn's page")
print("5. Run: python3 exchange_linkedin_code.py YOUR_CODE")
print("=" * 60)
print("\n📋 Authorized Scopes:")
print("  ✅ openid - Basic authentication")
print("  ✅ profile - Profile information")
print("  ✅ email - Email access")
print("  ✅ w_member_social - Personal posting")
print("\n❌ Unavailable Scopes (not authorized for your app):")
print("  ❌ w_organization_social - Company posting")
print("  ❌ r_organization_social - Read company data")
print("  ❌ rw_organization_admin - Company admin access")
print("=" * 60)

# Open in browser
print("\n🌐 Opening in browser...")
webbrowser.open(auth_url)