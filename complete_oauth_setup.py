#!/usr/bin/env python3
"""
Complete LinkedIn OAuth Setup
Generates authorization URL and handles the entire OAuth flow
"""

import os
import webbrowser
import time
from dotenv import load_dotenv

load_dotenv()

def main():
    print("\n🔐 LinkedIn OAuth Setup - Final Steps")
    print("=" * 60)
    
    client_id = os.getenv('LINKEDIN_CLIENT_ID', '776dnomhse84tj')
    redirect_uri = 'http://localhost:8080/callback'
    
    # Updated scope for LinkedIn API v2
    scope = 'w_member_social'  # Permission to post on LinkedIn
    
    # Generate authorization URL
    auth_url = (
        f"https://www.linkedin.com/oauth/v2/authorization?"
        f"response_type=code&"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"scope={scope}"
    )
    
    print("\n📋 Step 1: Authorization")
    print("-" * 60)
    print(f"Client ID: {client_id}")
    print(f"Redirect URI: {redirect_uri}")
    print(f"Scope: {scope}")
    
    print("\n🌐 Step 2: Opening LinkedIn Authorization Page")
    print("-" * 60)
    print("Opening your browser to LinkedIn authorization page...")
    print("\nIf the browser doesn't open automatically, visit this URL:")
    print(f"\n{auth_url}\n")
    
    # Open the authorization URL
    webbrowser.open(auth_url)
    
    print("📌 Step 3: After Authorization")
    print("-" * 60)
    print("1. Click 'Allow' on the LinkedIn page")
    print("2. You'll be redirected to: http://localhost:8080/callback?code=YOUR_CODE")
    print("3. Copy the ENTIRE URL from your browser")
    print("4. Paste it below:")
    
    print("\n" + "=" * 60)
    redirect_url = input("\n🔗 Paste the redirect URL here: ").strip()
    
    # Extract the code from the URL
    if 'code=' in redirect_url:
        code = redirect_url.split('code=')[1].split('&')[0]
        print(f"\n✅ Authorization code extracted: {code[:20]}...")
        
        print("\n🔄 Step 4: Exchanging Code for Access Token")
        print("-" * 60)
        
        # Run the exchange script
        os.system(f'python exchange_linkedin_code.py "{code}"')
        
    else:
        print("\n❌ No authorization code found in the URL")
        print("Please make sure you copied the complete URL after authorization")


if __name__ == "__main__":
    main()