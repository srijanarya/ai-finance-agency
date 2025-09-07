#!/usr/bin/env python3
"""
Test posting to all platforms with professional content
"""
import requests
import json
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def generate_content(platform):
    """Generate content for a specific platform"""
    url = "http://localhost:5001/generate"
    payload = {
        "platform": platform,
        "use_pro": True
    }
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error generating content for {platform}: {response.text}")
        return None

def post_to_linkedin(content_data):
    """Post to LinkedIn using the API"""
    print("\n📘 POSTING TO LINKEDIN...")
    
    # Check if we have LinkedIn token
    access_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
    if not access_token:
        print("❌ No LinkedIn access token found")
        return False
    
    # Get user ID
    headers = {
        'Authorization': f'Bearer {access_token}',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    user_response = requests.get(
        'https://api.linkedin.com/v2/userinfo',
        headers=headers
    )
    
    if user_response.status_code != 200:
        print(f"❌ Could not get LinkedIn user info: {user_response.text}")
        return False
    
    user_id = user_response.json().get('sub')
    
    # Prepare post data
    post_content = content_data.get('content', '')
    hashtags = content_data.get('hashtags', '')
    
    # Combine content and hashtags
    full_content = f"{post_content}\n\n{hashtags}" if hashtags else post_content
    
    post_data = {
        "author": f"urn:li:person:{user_id}",
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": full_content
                },
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }
    
    # Post to LinkedIn
    headers['Content-Type'] = 'application/json'
    response = requests.post(
        'https://api.linkedin.com/v2/ugcPosts',
        headers=headers,
        json=post_data
    )
    
    if response.status_code in [200, 201]:
        result = response.json()
        post_id = result.get('id', 'Unknown')
        print(f"✅ Successfully posted to LinkedIn!")
        print(f"   Post ID: {post_id}")
        print(f"   Content preview: {post_content[:100]}...")
        return True
    else:
        print(f"❌ Failed to post to LinkedIn: {response.status_code}")
        print(f"   Error: {response.text}")
        return False

def post_to_twitter(content_data):
    """Post to Twitter using the X integration"""
    print("\n🐦 POSTING TO TWITTER...")
    
    # Use the X/Twitter integration API
    url = "http://localhost:5002/post"
    
    content = content_data.get('content', '')
    
    payload = {
        "content": content
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        result = response.json()
        if result.get('success'):
            print(f"✅ Successfully posted to Twitter!")
            print(f"   Tweet ID: {result.get('tweet_id', 'Unknown')}")
            print(f"   Content preview: {content[:100]}...")
            return True
        else:
            print(f"❌ Failed to post to Twitter: {result.get('error')}")
            return False
    else:
        print(f"❌ Twitter API error: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def post_to_telegram(content_data):
    """Post to Telegram channel"""
    print("\n💬 POSTING TO TELEGRAM...")
    
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    channel_id = os.getenv('TELEGRAM_CHANNEL_ID', '@AIFinanceNews2024')
    
    if not bot_token:
        print("❌ No Telegram bot token found")
        return False
    
    content = content_data.get('content', '')
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    
    payload = {
        'chat_id': channel_id,
        'text': content,
        'parse_mode': 'HTML'
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        result = response.json()
        if result.get('ok'):
            message_id = result['result']['message_id']
            print(f"✅ Successfully posted to Telegram!")
            print(f"   Message ID: {message_id}")
            print(f"   Channel: {channel_id}")
            print(f"   Content preview: {content[:100]}...")
            return True
        else:
            print(f"❌ Telegram API error: {result.get('description')}")
            return False
    else:
        print(f"❌ Failed to post to Telegram: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def main():
    print("="*60)
    print("🚀 TESTING ALL PLATFORMS WITH PROFESSIONAL CONTENT")
    print("="*60)
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    results = {
        'linkedin': False,
        'twitter': False,
        'telegram': False
    }
    
    # 1. Generate and post to LinkedIn
    print("\n1️⃣ LinkedIn Test:")
    linkedin_content = generate_content('linkedin')
    if linkedin_content and linkedin_content.get('success'):
        print(f"   Generated: {linkedin_content['type']} content")
        results['linkedin'] = post_to_linkedin(linkedin_content)
    
    # 2. Generate and post to Twitter
    print("\n2️⃣ Twitter Test:")
    twitter_content = generate_content('twitter')
    if twitter_content and twitter_content.get('success'):
        print(f"   Generated: {twitter_content['type']} content")
        results['twitter'] = post_to_twitter(twitter_content)
    
    # 3. Generate and post to Telegram
    print("\n3️⃣ Telegram Test:")
    telegram_content = generate_content('telegram')
    if telegram_content and telegram_content.get('success'):
        print(f"   Generated: {telegram_content['type']} content")
        results['telegram'] = post_to_telegram(telegram_content)
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST RESULTS SUMMARY:")
    print("="*60)
    
    for platform, success in results.items():
        status = "✅ SUCCESS" if success else "❌ FAILED"
        print(f"{platform.upper():12} : {status}")
    
    successful = sum(1 for v in results.values() if v)
    total = len(results)
    
    print(f"\nOverall: {successful}/{total} platforms successful")
    
    if successful == total:
        print("\n🎉 ALL PLATFORMS WORKING PERFECTLY!")
    else:
        print("\n⚠️ Some platforms need attention")
    
    return results

if __name__ == "__main__":
    results = main()
    
    # Exit with error code if any platform failed
    if not all(results.values()):
        exit(1)