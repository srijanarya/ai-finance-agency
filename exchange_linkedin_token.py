#!/usr/bin/env python3
import requests
import json

# Your authorization code
code = "AQSSv28WnVrAF4DOAEmDkPn87KSuTlyiENpcqX6Fn5jvjxCenGfOaEq280N8ptM-8CWHnbvaNqbfowBAisyUQKeAyqaB5jRzDufIVHxfwHy3w5MwkYkDqcEiHAmUPnn-AFC-bcyHjJcbODzNbzJWylAgo4CHbfUNmK6jr0lYLSJq_jA8-7juBRPBonwCtwJZGbUGLfpWKUbfmMpA4TU"

# LinkedIn app credentials
client_id = "776dnomhse84tj"
client_secret = "WPL_AP1.r3GQEtOyAZpKQkFJ.mafPeA=="
redirect_uri = "http://localhost:8080/callback"

# Exchange code for token
url = "https://api.linkedin.com/oauth/v2/accessToken"
data = {
    "grant_type": "authorization_code",
    "code": code,
    "redirect_uri": redirect_uri,
    "client_id": client_id,
    "client_secret": client_secret
}

print("Exchanging code for token...")
response = requests.post(url, data=data)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    token_data = response.json()
    access_token = token_data.get('access_token')
    scope = token_data.get('scope', 'unknown')
    
    print(f"\n✅ Success!")
    print(f"Access Token: {access_token[:50]}...")
    print(f"Scopes: {scope}")
    
    # Save to .env
    with open('.env', 'w') as f:
        f.write(f"LINKEDIN_ACCESS_TOKEN={access_token}\n")
        f.write(f"LINKEDIN_COMPANY_ID=108595796\n")
        f.write(f"LINKEDIN_PERSONAL_CLIENT_ID={client_id}\n")
        f.write(f"LINKEDIN_PERSONAL_CLIENT_SECRET={client_secret}\n")
    
    print("\n✅ Token saved to .env file!")
else:
    print("\n❌ Failed to exchange code")
    error_data = response.json() if response.headers.get('content-type') == 'application/json' else {}
    print(f"Error: {error_data.get('error', 'unknown')}")
    print(f"Description: {error_data.get('error_description', response.text)}")
