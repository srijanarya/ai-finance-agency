#!/usr/bin/env python3
"""
Get correct LinkedIn authorization URL for company posting
"""

import urllib.parse

# Your LinkedIn app credentials
CLIENT_ID = "776dnomhse84tj"

# Try different redirect URIs
redirect_uris = [
    "http://localhost:8080/callback",
    "http://localhost:8080",
    "https://www.linkedin.com/developers/tools/oauth/redirect",
    "http://127.0.0.1:8080/callback"
]

# Scopes for company posting
company_scopes = "w_organization_social r_organization_social rw_organization_admin"
personal_scopes = "w_member_social openid profile email"

print("=" * 70)
print("LinkedIn Authorization URLs")
print("=" * 70)

print("\n🏢 FOR COMPANY PAGE POSTING (Treum Algotech):")
print("-" * 70)
for i, redirect_uri in enumerate(redirect_uris, 1):
    encoded_uri = urllib.parse.quote(redirect_uri, safe='')
    encoded_scopes = urllib.parse.quote(company_scopes, safe='')
    
    url = f"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={CLIENT_ID}&redirect_uri={encoded_uri}&scope={encoded_scopes}"
    
    print(f"\nOption {i} (Redirect: {redirect_uri}):")
    print(url)

print("\n" + "=" * 70)
print("\n👤 FOR PERSONAL PROFILE POSTING:")
print("-" * 70)
redirect_uri = "http://localhost:8080/callback"
encoded_uri = urllib.parse.quote(redirect_uri, safe='')
encoded_scopes = urllib.parse.quote(personal_scopes, safe='')

url = f"https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={CLIENT_ID}&redirect_uri={encoded_uri}&scope={encoded_scopes}"
print(url)

print("\n" + "=" * 70)
print("\n📋 INSTRUCTIONS:")
print("1. Try Option 3 first (LinkedIn's official redirect)")
print("2. If that doesn't work, try Option 1 (localhost)")
print("3. Make sure to SELECT 'Treum Algotech' from the dropdown")
print("4. Copy the authorization code after redirect")
print("=" * 70)