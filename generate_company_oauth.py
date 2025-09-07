#!/usr/bin/env python3
"""
COMPANY OAUTH GENERATOR - Treum Algotech LinkedIn App
Generates OAuth token for company page posting using your new app credentials
Client ID: 77ccq66ayuwvqo
"""

import webbrowser
import urllib.parse
import requests
import os
from datetime import datetime

def generate_company_oauth():
    """Generate OAuth URL for company posting with your new app"""
    
    # Your company app credentials
    CLIENT_ID = "77ccq66ayuwvqo"
    CLIENT_SECRET = "WPL_AP1.Vj3PvAamQi6UQCmM.K478VA=="
    
    # Required scopes for company posting
    SCOPES = [
        "r_liteprofile",
        "r_emailaddress", 
        "w_member_social",
        "w_organization_social",  # Company posting - CRITICAL!
        "r_organization_social",
        "rw_organization_admin"
    ]
    
    # Build authorization URL (using LinkedIn's redirect instead of localhost)
    base_url = "https://www.linkedin.com/oauth/v2/authorization"
    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "redirect_uri": "https://www.linkedin.com/developers/tools/oauth/redirect",
        "scope": " ".join(SCOPES),
        "state": f"treum_company_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    }
    
    auth_url = f"{base_url}?{urllib.parse.urlencode(params)}"
    
    print("🏢 TREUM ALGOTECH COMPANY OAUTH GENERATOR")
    print("=" * 60)
    print(f"Your App Client ID: {CLIENT_ID}")
    print("Company: Treum Algotech (ID: 108595796)")
    print("=" * 60)
    
    print("\n📋 STEP-BY-STEP INSTRUCTIONS:")
    print("1. Browser will open LinkedIn OAuth page")
    print("2. ⚠️ CRITICAL: Look for dropdown menu")
    print("3. SELECT 'Treum Algotech' from dropdown (NOT your personal name)")
    print("4. Click 'Allow' to grant permissions")
    print("5. You'll be redirected to localhost (page won't load - that's OK)")
    print("6. Copy the 'code' parameter from the URL")
    print("7. Paste the code below")
    
    print("\n🔗 AUTHORIZATION URL:")
    print("-" * 60)
    print(auth_url)
    print("-" * 60)
    
    # Open browser
    print("\n🌐 Opening browser in 3 seconds...")
    print("📌 Remember: SELECT 'Treum Algotech' from the dropdown!")
    
    import time
    time.sleep(3)
    webbrowser.open(auth_url)
    
    # Get authorization code from user
    print("\n⏳ After authorization, LinkedIn will show you the code directly")
    print("or redirect to a page with the code in the URL like:")
    print("https://www.linkedin.com/developers/tools/oauth/redirect?code=AQTD3K4d5f6g7h8i9j0k&state=...")
    print("                                                              ^^^^^^^^^^^^^^^^^^^")
    print("                                                              Copy this 'code' part")
    
    auth_code = input("\n📝 Paste the authorization code here: ").strip()
    
    if not auth_code:
        print("❌ No code provided. Please try again.")
        return False
    
    # Exchange code for token
    print(f"\n🔄 Exchanging code for access token...")
    
    success = exchange_code_for_token(auth_code, CLIENT_ID, CLIENT_SECRET)
    return success

def exchange_code_for_token(auth_code, client_id, client_secret):
    """Exchange authorization code for access token"""
    
    token_url = "https://www.linkedin.com/oauth/v2/accessToken"
    data = {
        "grant_type": "authorization_code",
        "code": auth_code,
        "redirect_uri": "https://www.linkedin.com/developers/tools/oauth/redirect",
        "client_id": client_id,
        "client_secret": client_secret
    }
    
    try:
        response = requests.post(token_url, data=data)
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access_token')
            expires_in = token_data.get('expires_in', 5184000)  # Default 60 days
            
            print("✅ SUCCESS! Got company access token!")
            print(f"📅 Token expires in: {expires_in // 86400} days")
            print("\n🔑 Access Token:")
            print("-" * 60)
            print(access_token)
            print("-" * 60)
            
            # Test the token immediately
            if test_company_token(access_token):
                # Update .env file
                update_env_file(access_token)
                return True
            else:
                print("⚠️ Token works but may not have company permissions")
                return False
                
        else:
            print(f"❌ Token exchange failed: {response.status_code}")
            print(f"Response: {response.text}")
            print("\nCommon issues:")
            print("• Make sure you copied the entire code")
            print("• Check that your app is verified")
            print("• Ensure you selected 'Treum Algotech' in dropdown")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_company_token(token):
    """Test if token has company posting permissions"""
    
    print("\n🔍 Testing company token permissions...")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    # Test 1: Basic user info
    response = requests.get('https://api.linkedin.com/v2/userinfo', headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Basic token test failed: {response.status_code}")
        return False
    
    user_data = response.json()
    print(f"✅ Token valid for user: {user_data.get('name', 'Unknown')}")
    
    # Test 2: Check organizational access
    response = requests.get(
        'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee',
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        found_company = False
        
        print("\n📊 Organization Access:")
        for element in data.get('elements', []):
            org_target = element.get('organizationalTarget', '')
            role = element.get('role', 'UNKNOWN')
            
            if '108595796' in org_target:
                found_company = True
                print(f"   🏢 Treum Algotech - Role: {role} ✅")
            elif 'person' in org_target:
                print(f"   👤 Personal Profile - Role: {role}")
        
        if found_company:
            print("\n🎉 PERFECT! Token can post to Treum Algotech company page!")
            return True
        else:
            print("\n⚠️ Token doesn't have company access")
            print("This means you selected your personal profile instead of 'Treum Algotech'")
            print("Please run the script again and select 'Treum Algotech' from dropdown")
            return False
    
    else:
        print(f"⚠️ Could not verify company access: {response.status_code}")
        print("Token might still work for company posting")
        return True

def update_env_file(token):
    """Update .env file with company access token"""
    
    env_file = '/Users/srijan/ai-finance-agency/.env'
    
    try:
        # Read existing .env
        with open(env_file, 'r') as f:
            content = f.read()
        
        # Replace company access token
        updated_content = content.replace(
            'LINKEDIN_COMPANY_ACCESS_TOKEN=pending_oauth_setup',
            f'LINKEDIN_COMPANY_ACCESS_TOKEN={token}'
        )
        
        # Write back
        with open(env_file, 'w') as f:
            f.write(updated_content)
        
        print(f"\n✅ Updated {env_file}")
        print("\n🚀 YOU CAN NOW RUN:")
        print("   python3 dual_linkedin_poster.py --company")
        print("   python3 dual_linkedin_poster.py --auto")
        print("\nThis will post automatically to your Treum Algotech company page!")
        
        return True
        
    except Exception as e:
        print(f"\n⚠️ Couldn't update .env: {e}")
        print(f"\nMANUALLY ADD THIS TO YOUR .env FILE:")
        print(f"LINKEDIN_COMPANY_ACCESS_TOKEN={token}")
        return False

def main():
    """Main entry point"""
    print("🎯 READY TO SET UP COMPANY POSTING FOR TREUM ALGOTECH")
    print("\nThis will:")
    print("✅ Open LinkedIn OAuth with your company app")
    print("✅ Let you select 'Treum Algotech' from dropdown")  
    print("✅ Generate working access token")
    print("✅ Enable automated company page posting")
    
    proceed = input("\n🚀 Ready to proceed? (y/n): ").strip().lower()
    
    if proceed == 'y':
        success = generate_company_oauth()
        
        if success:
            print("\n" + "="*60)
            print("🎉 SETUP COMPLETE!")
            print("="*60)
            print("Your Treum Algotech company page is now ready for automated posting!")
            print("\nTest it with:")
            print("  python3 dual_linkedin_poster.py --company")
        else:
            print("\n" + "="*60)
            print("⚠️ SETUP INCOMPLETE")
            print("="*60)
            print("Please try again or check the troubleshooting tips above.")
    else:
        print("👋 Setup cancelled. Run again when ready!")

if __name__ == "__main__":
    main()