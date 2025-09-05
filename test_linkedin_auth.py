#!/usr/bin/env python3
import requests

# Get token from .env
with open('.env', 'r') as f:
    for line in f:
        if line.startswith('LINKEDIN_ACCESS_TOKEN='):
            token = line.strip().split('=')[1]
            break

# Test token validity
print("Testing LinkedIn token...")
print(f"Token (first 20 chars): {token[:20]}...")

# Get user info
response = requests.get(
    'https://api.linkedin.com/v2/userinfo',
    headers={'Authorization': f'Bearer {token}'}
)

print(f"\nUser info response: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"Name: {data.get('name', 'N/A')}")
    print(f"Email: {data.get('email', 'N/A')}")
    print(f"Sub (Member ID): {data.get('sub', 'N/A')}")
else:
    print(response.text)

# Check permissions
print("\nChecking permissions...")
perm_response = requests.get(
    'https://api.linkedin.com/v2/me',
    headers={
        'Authorization': f'Bearer {token}',
        'X-Restli-Protocol-Version': '2.0.0'
    }
)

print(f"Profile access response: {perm_response.status_code}")
if perm_response.status_code == 200:
    print("✅ Token has profile access")
else:
    print(f"❌ {perm_response.text}")
