#!/usr/bin/env python3
"""
LINKEDIN COMPANY TOKEN GENERATOR
Helps you generate the correct authorization URL with company posting scopes
"""

import webbrowser
import urllib.parse
from datetime import datetime

def generate_authorization_url():
    """Generate LinkedIn OAuth URL with company posting permissions"""
    
    # Your Client ID
    CLIENT_ID = "776dnomhse84tj"
    
    # Redirect URI (LinkedIn's built-in redirect for testing)
    REDIRECT_URI = "https://www.linkedin.com/developers/tools/oauth/redirect"
    
    # Required scopes for company posting
    SCOPES = [
        "r_liteprofile",           # Read basic profile
        "r_emailaddress",          # Read email
        "w_member_social",         # Post as member
        "w_organization_social",   # POST AS COMPANY (CRITICAL!)
        "r_organization_social",   # Read company posts  
        "rw_organization_admin"    # Admin company access
    ]
    
    # Build authorization URL
    base_url = "https://www.linkedin.com/oauth/v2/authorization"
    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": " ".join(SCOPES),
        "state": f"treum_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    }
    
    auth_url = f"{base_url}?{urllib.parse.urlencode(params)}"
    
    print("🔐 LINKEDIN COMPANY TOKEN GENERATOR")
    print("="*60)
    print(f"Client ID: {CLIENT_ID}")
    print(f"Company ID: 108595796")
    print(f"Company: Treum Algotech")
    print("="*60)
    
    print("\n📋 STEP-BY-STEP INSTRUCTIONS:")
    print("-"*40)
    
    print("\n1️⃣ OPENING AUTHORIZATION URL...")
    print("   Your browser will open LinkedIn authorization")
    
    print("\n2️⃣ IMPORTANT: SELECT COMPANY")
    print("   ⚠️ You'll see a dropdown with:")
    print("   • Your personal profile name")
    print("   • Treum Algotech (company)")
    print("   👉 SELECT 'Treum Algotech' - NOT your personal profile!")
    
    print("\n3️⃣ AUTHORIZE THE APP")
    print("   Click 'Allow' to grant permissions")
    
    print("\n4️⃣ GET YOUR TOKEN")
    print("   After authorization, LinkedIn will show you:")
    print("   • Authorization code")
    print("   • Access token (this is what you need!)")
    
    print("\n5️⃣ UPDATE YOUR .env FILE")
    print("   Copy the access token and update your .env:")
    print("   LINKEDIN_ACCESS_TOKEN=your_new_token_here")
    
    print("\n" + "="*60)
    print("📌 AUTHORIZATION URL:")
    print("-"*40)
    print(auth_url)
    print("-"*40)
    
    # Ask user before opening
    print("\n🌐 Press Enter to open LinkedIn authorization in your browser...")
    print("   (Or copy the URL above and open manually)")
    input()
    
    # Open in browser
    webbrowser.open(auth_url)
    
    print("\n✅ Browser opened! Follow the steps above.")
    print("\n⏳ After you get the token, I'll help you test it...")
    
    # Wait for user to get token
    print("\n" + "="*60)
    new_token = input("📝 Paste your new access token here (or 'skip'): ").strip()
    
    if new_token and new_token.lower() != 'skip':
        # Test the new token
        test_new_token(new_token)
    else:
        print("\n👉 Remember to update your .env file with the new token!")
        print("   Then run: python linkedin_company_auto_poster.py --post")

def test_new_token(token):
    """Test if the new token has company permissions"""
    import requests
    
    print("\n🔍 Testing your new token...")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    # Check organizational access
    response = requests.get(
        'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee',
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        found_company = False
        
        print("\n✅ Token is valid! You can post as:")
        for element in data.get('elements', []):
            org_target = element.get('organizationalTarget', '')
            role = element.get('role', 'UNKNOWN')
            
            if '108595796' in org_target:
                found_company = True
                print(f"   🏢 Treum Algotech - Role: {role}")
            else:
                print(f"   👤 {org_target} - Role: {role}")
        
        if found_company:
            print("\n🎉 SUCCESS! Your token can post to Treum Algotech company page!")
            
            # Save to .env suggestion
            print("\n📝 Add this to your .env file:")
            print("-"*40)
            print(f"LINKEDIN_ACCESS_TOKEN={token}")
            print("-"*40)
            
            # Offer to update .env
            update = input("\n💾 Update .env file now? (y/n): ").strip().lower()
            if update == 'y':
                update_env_file(token)
        else:
            print("\n⚠️ Token doesn't have Treum Algotech company access")
            print("   Make sure you selected 'Treum Algotech' in the dropdown during authorization!")
    else:
        print(f"\n❌ Token validation failed: {response.status_code}")
        print("   Make sure you copied the entire token")

def update_env_file(token):
    """Update .env file with new token"""
    import os
    from datetime import datetime, timedelta
    
    env_file = '/Users/srijan/ai-finance-agency/.env'
    
    try:
        # Read existing .env
        with open(env_file, 'r') as f:
            lines = f.readlines()
        
        # Find and replace LinkedIn token
        updated = False
        for i, line in enumerate(lines):
            if line.startswith('LINKEDIN_ACCESS_TOKEN='):
                expiry = (datetime.now() + timedelta(days=60)).strftime('%B %d, %Y')
                lines[i] = f'# LinkedIn OAuth Token (Company-enabled, expires {expiry})\n'
                lines.insert(i+1, f'LINKEDIN_ACCESS_TOKEN={token}\n')
                updated = True
                break
        
        if not updated:
            # Add new token if not found
            lines.append(f'\n# LinkedIn OAuth Token (Company-enabled)\n')
            lines.append(f'LINKEDIN_ACCESS_TOKEN={token}\n')
        
        # Write back
        with open(env_file, 'w') as f:
            f.writelines(lines)
        
        print(f"\n✅ Updated {env_file}")
        print("\n🚀 You can now run:")
        print("   python linkedin_company_auto_poster.py --post")
        
    except Exception as e:
        print(f"\n⚠️ Couldn't update .env: {e}")
        print("   Please update it manually")

if __name__ == "__main__":
    generate_authorization_url()