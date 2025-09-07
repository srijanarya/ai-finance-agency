#!/usr/bin/env python3
"""
LINKEDIN OAUTH TOKEN EXCHANGE
Exchanges authorization code for access token with company permissions
Client ID: 776dnomhse84tj
Client Secret: WPL_AP1.r3GQEtOyAZpKQkFJ.mafPeA==
"""

import os
import requests
import webbrowser
import urllib.parse
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

class LinkedInOAuthExchange:
    """Handle OAuth token exchange for company page posting"""
    
    def __init__(self):
        self.client_id = "776dnomhse84tj"
        self.client_secret = "WPL_AP1.r3GQEtOyAZpKQkFJ.mafPeA=="
        self.redirect_uri = "http://localhost:8080/callback"
        self.company_id = "108595796"
        
    def step1_generate_auth_url(self):
        """Generate authorization URL with company scopes"""
        
        # Required scopes for company posting
        scopes = [
            "r_liteprofile",
            "r_emailaddress", 
            "w_member_social",
            "w_organization_social",  # CRITICAL for company posting
            "r_organization_social",
            "rw_organization_admin"
        ]
        
        base_url = "https://www.linkedin.com/oauth/v2/authorization"
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": " ".join(scopes),
            "state": f"treum_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        }
        
        auth_url = f"{base_url}?{urllib.parse.urlencode(params)}"
        
        print("="*60)
        print("🔐 STEP 1: AUTHORIZE WITH LINKEDIN")
        print("="*60)
        print("\n📋 Instructions:")
        print("1. Click the authorization URL below")
        print("2. ⚠️ SELECT 'Treum Algotech' from the dropdown (NOT personal profile)")
        print("3. Click 'Allow'")
        print("4. You'll be redirected to localhost:8080 (page won't load - that's OK)")
        print("5. Copy the 'code' parameter from the URL")
        print("\n🔗 Authorization URL:")
        print("-"*60)
        print(auth_url)
        print("-"*60)
        
        return auth_url
    
    def step2_exchange_code_for_token(self, auth_code):
        """Exchange authorization code for access token"""
        
        print("\n="*60)
        print("🔄 STEP 2: EXCHANGING CODE FOR TOKEN")
        print("="*60)
        
        token_url = "https://www.linkedin.com/oauth/v2/accessToken"
        
        data = {
            "grant_type": "authorization_code",
            "code": auth_code,
            "redirect_uri": self.redirect_uri,
            "client_id": self.client_id,
            "client_secret": self.client_secret
        }
        
        try:
            response = requests.post(token_url, data=data)
            
            if response.status_code == 200:
                token_data = response.json()
                access_token = token_data.get('access_token')
                expires_in = token_data.get('expires_in', 5184000)  # Default 60 days
                
                expiry_date = datetime.now() + timedelta(seconds=expires_in)
                
                print("✅ SUCCESS! Token obtained!")
                print(f"📅 Expires: {expiry_date.strftime('%B %d, %Y')}")
                print("\n🔑 Access Token:")
                print("-"*60)
                print(access_token)
                print("-"*60)
                
                return access_token
                
            else:
                print(f"❌ Token exchange failed: {response.status_code}")
                print(f"Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Error exchanging code: {e}")
            return None
    
    def step3_verify_company_access(self, token):
        """Verify the token has company posting permissions"""
        
        print("\n="*60)
        print("🔍 STEP 3: VERIFYING COMPANY ACCESS")
        print("="*60)
        
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
            
            print("\n✅ Token is valid! Access permissions:")
            for element in data.get('elements', []):
                org_target = element.get('organizationalTarget', '')
                role = element.get('role', 'UNKNOWN')
                
                if self.company_id in org_target:
                    found_company = True
                    print(f"   🏢 Treum Algotech - Role: {role} ✓")
                elif 'person' in org_target:
                    print(f"   👤 Personal Profile - Role: {role}")
            
            return found_company
        else:
            print(f"❌ Could not verify access: {response.status_code}")
            return False
    
    def step4_test_company_post(self, token):
        """Test posting to company page"""
        
        print("\n="*60)
        print("🚀 STEP 4: TESTING COMPANY PAGE POST")
        print("="*60)
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        test_content = f"""🧪 Test Post from Treum Algotech | {datetime.now().strftime('%I:%M %p')}

This is an automated test post to verify company page posting capabilities.

If you can see this, the OAuth setup was successful!

#TreumAlgotech #Test"""
        
        post_data = {
            "author": f"urn:li:organization:{self.company_id}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": test_content
                    },
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }
        
        response = requests.post(
            'https://api.linkedin.com/v2/ugcPosts',
            headers=headers,
            json=post_data
        )
        
        if response.status_code == 201:
            post_id = response.headers.get('X-RestLi-Id', '')
            print("✅ TEST POST SUCCESSFUL!")
            print(f"📝 Post ID: {post_id}")
            print(f"🔗 View at: https://www.linkedin.com/company/{self.company_id}/")
            return True
        else:
            print(f"❌ Test post failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    
    def update_env_file(self, token):
        """Update .env file with new token"""
        
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
                    # Remove old token line if it exists
                    if i+2 < len(lines) and lines[i+2].startswith('LINKEDIN_ACCESS_TOKEN='):
                        lines.pop(i+2)
                    updated = True
                    break
            
            if not updated:
                # Add new token if not found
                lines.append(f'\n# LinkedIn OAuth Token (Company-enabled, expires in 60 days)\n')
                lines.append(f'LINKEDIN_ACCESS_TOKEN={token}\n')
            
            # Write back
            with open(env_file, 'w') as f:
                f.writelines(lines)
            
            print(f"\n✅ Updated {env_file}")
            return True
            
        except Exception as e:
            print(f"⚠️ Couldn't update .env: {e}")
            return False
    
    def run_complete_flow(self):
        """Run the complete OAuth flow"""
        
        print("\n🏢 LINKEDIN COMPANY PAGE OAUTH SETUP")
        print("="*60)
        print(f"Client ID: {self.client_id}")
        print(f"Company ID: {self.company_id}")
        print(f"Company: Treum Algotech")
        print("="*60)
        
        # Step 1: Generate auth URL
        auth_url = self.step1_generate_auth_url()
        
        print("\n📌 Open this URL in your browser and follow the steps")
        print("After authorization, copy the 'code' from the redirect URL")
        print("\nExample redirect URL:")
        print("http://localhost:8080/callback?code=AQTD3K...&state=treum_...")
        print("                                    ^^^^^^^^ Copy this part")
        
        auth_code = input("\n📝 Paste the authorization code here: ").strip()
        
        if not auth_code:
            print("❌ No code provided. Exiting.")
            return
        
        # Step 2: Exchange for token
        token = self.step2_exchange_code_for_token(auth_code)
        
        if not token:
            print("❌ Could not obtain token. Please try again.")
            return
        
        # Step 3: Verify access
        has_company_access = self.step3_verify_company_access(token)
        
        if not has_company_access:
            print("\n⚠️ Token doesn't have company access!")
            print("Make sure you selected 'Treum Algotech' in the dropdown during authorization")
            return
        
        # Step 4: Test post
        print("\n📝 Would you like to test posting to the company page? (y/n): ", end="")
        test = input().strip().lower()
        
        if test == 'y':
            self.step4_test_company_post(token)
        
        # Step 5: Update .env
        print("\n💾 Update .env file with new token? (y/n): ", end="")
        update = input().strip().lower()
        
        if update == 'y':
            if self.update_env_file(token):
                print("\n🎉 SUCCESS! Setup complete!")
                print("You can now run: python linkedin_company_auto_poster.py --post")
            else:
                print("\n📋 Add this to your .env manually:")
                print(f"LINKEDIN_ACCESS_TOKEN={token}")

def main():
    """Main entry point"""
    oauth = LinkedInOAuthExchange()
    oauth.run_complete_flow()

if __name__ == "__main__":
    main()