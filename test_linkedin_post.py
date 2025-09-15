#!/usr/bin/env python3
"""
Test LinkedIn Posting with New Token
"""

import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_user_profile():
    """Get LinkedIn user profile to get the person URN"""
    token = os.getenv('LINKEDIN_COMPANY_ACCESS_TOKEN')
    
    headers = {
        'Authorization': f'Bearer {token}',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202401'
    }
    
    # Get user info
    userinfo_url = 'https://api.linkedin.com/v2/userinfo'
    response = requests.get(userinfo_url, headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ Connected as: {user_data.get('name', 'Unknown')}")
        print(f"   Email: {user_data.get('email', 'N/A')}")
        
        # Get the person URN using the sub (subject) field
        sub = user_data.get('sub')
        if sub:
            person_urn = f"urn:li:person:{sub}"
            print(f"   Person URN: {person_urn}")
            return person_urn
    
    print(f"❌ Failed to get user profile: {response.status_code}")
    return None

def post_to_linkedin(person_urn):
    """Post to LinkedIn using the new token"""
    token = os.getenv('LINKEDIN_COMPANY_ACCESS_TOKEN')
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
        'LinkedIn-Version': '202401'
    }
    
    # Create post content
    post_text = f"""🚀 AI Finance Agency Test Post

📊 Platform: LinkedIn
📅 Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
✅ Status: Testing new OAuth token with posting permissions

This is an automated test from the AI Finance Agency system to verify LinkedIn posting capabilities with the newly configured OAuth token.

#AIFinance #FinTech #Automation #Testing"""
    
    # LinkedIn post payload using the new API format
    post_data = {
        "author": person_urn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": post_text
                },
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }
    
    # Post to LinkedIn
    post_url = 'https://api.linkedin.com/v2/ugcPosts'
    
    print("\n📤 Posting to LinkedIn...")
    print(f"   Author: {person_urn}")
    print(f"   Content length: {len(post_text)} characters")
    
    response = requests.post(post_url, headers=headers, json=post_data)
    
    if response.status_code == 201:
        result = response.json()
        post_id = result.get('id', 'Unknown')
        print(f"\n✅ SUCCESS! Post created on LinkedIn!")
        print(f"   Post ID: {post_id}")
        print(f"   View your post at: https://www.linkedin.com/feed/")
        return True
    else:
        print(f"\n❌ Failed to post: {response.status_code}")
        print(f"   Error: {response.text}")
        
        # Try to provide more specific error information
        try:
            error_data = response.json()
            if 'message' in error_data:
                print(f"   Message: {error_data['message']}")
            if 'status' in error_data:
                print(f"   Status: {error_data['status']}")
        except:
            pass
        
        return False

def main():
    print("=" * 60)
    print("🔧 LINKEDIN POSTING TEST")
    print("=" * 60)
    
    # Get user profile and person URN
    person_urn = get_user_profile()
    
    if person_urn:
        # Post to LinkedIn
        success = post_to_linkedin(person_urn)
        
        if success:
            print("\n" + "=" * 60)
            print("✅ LINKEDIN POSTING SUCCESSFUL!")
            print("=" * 60)
            print("Check your LinkedIn profile to see the test post.")
            print("URL: https://www.linkedin.com/in/me/recent-activity/all/")
        else:
            print("\n" + "=" * 60)
            print("❌ LINKEDIN POSTING FAILED")
            print("=" * 60)
            print("The token is valid but posting failed.")
            print("This might be due to rate limiting or API changes.")
    else:
        print("\n❌ Could not get user profile. Check your token.")

if __name__ == "__main__":
    main()