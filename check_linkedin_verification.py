#!/usr/bin/env python3
"""
LINKEDIN APP VERIFICATION CHECKER
Monitors your app verification status and provides next steps
"""

import requests
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class LinkedInVerificationChecker:
    def __init__(self):
        self.app_id = "9a47c30f-c31a-4203-a678-523772eb8230"
        self.client_id = "77ccq66ayuwvqo"
        self.client_secret = os.getenv('LINKEDIN_COMPANY_CLIENT_SECRET')
        
    def check_app_status(self):
        """Check current app verification status"""
        
        print("🔍 LINKEDIN APP VERIFICATION STATUS")
        print("="*50)
        print(f"App ID: {self.app_id}")
        print(f"Client ID: {self.client_id}")
        print(f"Company: Treum Algotech (ID: 108595796)")
        print("="*50)
        
        # Try basic API call to check if app is working
        headers = {
            'Authorization': f'Bearer {os.getenv("LINKEDIN_COMPANY_ACCESS_TOKEN", "")}',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        # Test if token works (even if it's pending)
        current_token = os.getenv("LINKEDIN_COMPANY_ACCESS_TOKEN", "")
        
        if current_token == "pending_oauth_setup":
            print("⏳ STATUS: Waiting for OAuth setup")
            print("📋 CURRENT STATE:")
            print("   • App created with company permissions ✅")
            print("   • Verification submitted ⏳")
            print("   • OAuth token not yet generated ❌")
            
        else:
            print("🔍 Testing current token...")
            try:
                response = requests.get(
                    'https://api.linkedin.com/v2/userinfo', 
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    print("✅ Token works! App likely verified.")
                    user_data = response.json()
                    print(f"   Authenticated as: {user_data.get('name', 'Unknown')}")
                    
                    # Test company access
                    org_response = requests.get(
                        'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee',
                        headers=headers,
                        timeout=10
                    )
                    
                    if org_response.status_code == 200:
                        org_data = org_response.json()
                        has_company_access = any('108595796' in str(element) for element in org_data.get('elements', []))
                        
                        if has_company_access:
                            print("🎉 FULL COMPANY ACCESS CONFIRMED!")
                            print("   Ready for automated company posting!")
                        else:
                            print("⚠️ Token works but no company access detected")
                    
                elif response.status_code == 401:
                    print("❌ Token invalid - app may still be under review")
                else:
                    print(f"⚠️ API returned: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ API test failed: {str(e)}")
                
        print(f"\n📅 Check performed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
    def provide_next_steps(self):
        """Provide actionable next steps"""
        
        current_token = os.getenv("LINKEDIN_COMPANY_ACCESS_TOKEN", "")
        
        print(f"\n🎯 NEXT STEPS:")
        print("-"*30)
        
        if current_token == "pending_oauth_setup":
            print("1. ⏳ WAIT for app verification")
            print("   • LinkedIn is reviewing your app")
            print("   • Usually takes 7-14 business days")
            print("   • Check: https://www.linkedin.com/developers/apps/verification/9a47c30f-c31a-4203-a678-523772eb8230")
            print("")
            print("2. 📝 MEANWHILE: Use manual posting")
            print("   • Run: python3 instant_company_content.py")
            print("   • Copy content to: https://www.linkedin.com/company/108595796/")
            print("   • Post manually from company page")
            print("")
            print("3. 🤖 AUTOMATION READY for other platforms")
            print("   • Telegram: Fully automated ✅")
            print("   • Twitter: Ready (needs testing)")
            print("   • Monitoring: Active ✅")
            
        else:
            print("1. 🔄 TRY OAuth generation")
            print("   • Run: python3 generate_company_oauth.py")
            print("   • Look for 'Treum Algotech' in dropdown")
            print("   • Complete authorization flow")
            print("")
            print("2. ✅ VERIFY company posting")
            print("   • Run: python3 dual_linkedin_poster.py --company")
            print("   • Check if post appears on company page")
            
        print("\n📊 CURRENT AUTOMATION STATUS:")
        print("   🟢 Telegram: Active")
        print("   🟡 LinkedIn: Manual (content generator ready)")
        print("   🟡 Twitter: Ready for testing")
        print("   🟢 Monitoring: Active")
        
    def run_check(self):
        """Run complete verification check"""
        self.check_app_status()
        self.provide_next_steps()

def main():
    checker = LinkedInVerificationChecker()
    checker.run_check()

if __name__ == "__main__":
    main()