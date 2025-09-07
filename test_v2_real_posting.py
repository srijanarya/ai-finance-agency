#!/usr/bin/env python3
"""
REAL TEST - Actually post v2.0 optimized content to all platforms
This will post to LinkedIn, Twitter, and Telegram with proof
"""
import requests
import json
from datetime import datetime
import time

def generate_v2_content(platform):
    """Generate v2.0 optimized content"""
    url = "http://localhost:5001/generate"
    
    payload = {
        "platform": platform,
        "use_v2": True,
        "audience": "retail_investors",
        "market_time": "market_open"
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error generating content: {response.text}")
        return None

def post_to_linkedin(content_data):
    """Actually post to LinkedIn"""
    print("\n📘 POSTING TO LINKEDIN...")
    
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    access_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
    if not access_token:
        print("❌ No LinkedIn token")
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
        print(f"❌ Could not get LinkedIn user info")
        return False
    
    user_id = user_response.json().get('sub')
    
    # Post the v2.0 optimized content
    post_content = content_data['content']
    
    # Remove any platform-specific formatting
    if '[Swipe for detailed breakdown →]' in post_content:
        post_content = post_content.replace('[Swipe for detailed breakdown →]', '')
    
    post_data = {
        "author": f"urn:li:person:{user_id}",
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": post_content[:1300]  # LinkedIn limit
                },
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }
    
    headers['Content-Type'] = 'application/json'
    response = requests.post(
        'https://api.linkedin.com/v2/ugcPosts',
        headers=headers,
        json=post_data
    )
    
    if response.status_code in [200, 201]:
        result = response.json()
        post_id = result.get('id', 'Unknown')
        print(f"✅ POSTED TO LINKEDIN!")
        print(f"   Post ID: {post_id}")
        print(f"   Engagement Score: {content_data.get('engagement_score')}x")
        print(f"   Expected: {content_data.get('expected_engagement')}")
        return True
    else:
        print(f"❌ Failed: {response.status_code} - {response.text}")
        return False

def post_to_twitter(content_data):
    """Actually post to Twitter/X"""
    print("\n🐦 POSTING TO TWITTER...")
    
    url = "http://localhost:5002/post"
    
    # Get the content (already optimized for Twitter)
    content = content_data['content']
    
    # Extract just the first tweet if it's a thread
    if '---' in content:
        content = content.split('---')[0]
    
    payload = {
        "content": content[:280]  # Twitter limit
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        result = response.json()
        if result.get('success'):
            print(f"✅ POSTED TO TWITTER!")
            print(f"   Tweet ID: {result.get('tweet_id')}")
            print(f"   Engagement Score: {content_data.get('engagement_score')}x")
            print(f"   Expected: {content_data.get('expected_engagement')}")
            return True
    
    print(f"❌ Failed to post to Twitter")
    return False

def post_to_telegram(content_data):
    """Actually post to Telegram"""
    print("\n💬 POSTING TO TELEGRAM...")
    
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    channel_id = os.getenv('TELEGRAM_CHANNEL_ID', '@AIFinanceNews2024')
    
    if not bot_token:
        print("❌ No Telegram bot token")
        return False
    
    content = content_data['content']
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    
    payload = {
        'chat_id': channel_id,
        'text': content[:4096],  # Telegram limit
        'parse_mode': 'HTML'
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        result = response.json()
        if result.get('ok'):
            message_id = result['result']['message_id']
            print(f"✅ POSTED TO TELEGRAM!")
            print(f"   Message ID: {message_id}")
            print(f"   Channel: {channel_id}")
            print(f"   Engagement Score: {content_data.get('engagement_score')}x")
            print(f"   Expected: {content_data.get('expected_engagement')}")
            return True
    
    print(f"❌ Failed to post to Telegram")
    return False

def main():
    print("="*80)
    print("🚀 REAL V2.0 POSTING TEST - ACTUAL PROOF")
    print("="*80)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("\nThis will ACTUALLY post to all platforms with v2.0 optimization")
    print("Watch for the real IDs and engagement scores!\n")
    
    results = {}
    
    # 1. Generate and post to LinkedIn
    print("="*80)
    print("1️⃣ LINKEDIN TEST")
    print("="*80)
    
    linkedin_content = generate_v2_content('linkedin')
    if linkedin_content and linkedin_content['success']:
        print(f"\n📊 Generated Content Stats:")
        print(f"   Engagement Score: {linkedin_content.get('engagement_score')}x")
        print(f"   Multipliers Applied: {len(linkedin_content.get('multipliers_applied', []))}")
        print(f"   Expected Performance: {linkedin_content.get('expected_engagement')}")
        print(f"\n📝 Content Preview:")
        print(f"   {linkedin_content['content'][:200]}...")
        
        if post_to_linkedin(linkedin_content):
            results['linkedin'] = {
                'success': True,
                'score': linkedin_content.get('engagement_score'),
                'expected': linkedin_content.get('expected_engagement')
            }
    
    time.sleep(2)  # Rate limiting
    
    # 2. Generate and post to Twitter
    print("\n" + "="*80)
    print("2️⃣ TWITTER TEST")
    print("="*80)
    
    twitter_content = generate_v2_content('twitter')
    if twitter_content and twitter_content['success']:
        print(f"\n📊 Generated Content Stats:")
        print(f"   Engagement Score: {twitter_content.get('engagement_score')}x")
        print(f"   Multipliers Applied: {len(twitter_content.get('multipliers_applied', []))}")
        print(f"   Expected Performance: {twitter_content.get('expected_engagement')}")
        print(f"\n📝 Content Preview:")
        print(f"   {twitter_content['content'][:200]}...")
        
        if post_to_twitter(twitter_content):
            results['twitter'] = {
                'success': True,
                'score': twitter_content.get('engagement_score'),
                'expected': twitter_content.get('expected_engagement')
            }
    
    time.sleep(2)  # Rate limiting
    
    # 3. Generate and post to Telegram
    print("\n" + "="*80)
    print("3️⃣ TELEGRAM TEST")
    print("="*80)
    
    telegram_content = generate_v2_content('telegram')
    if telegram_content and telegram_content['success']:
        print(f"\n📊 Generated Content Stats:")
        print(f"   Engagement Score: {telegram_content.get('engagement_score')}x")
        print(f"   Multipliers Applied: {len(telegram_content.get('multipliers_applied', []))}")
        print(f"   Expected Performance: {telegram_content.get('expected_engagement')}")
        print(f"\n📝 Content Preview:")
        print(f"   {telegram_content['content'][:200]}...")
        
        if post_to_telegram(telegram_content):
            results['telegram'] = {
                'success': True,
                'score': telegram_content.get('engagement_score'),
                'expected': telegram_content.get('expected_engagement')
            }
    
    # Summary
    print("\n" + "="*80)
    print("📊 REAL POSTING RESULTS - ACTUAL PROOF")
    print("="*80)
    
    successful = sum(1 for r in results.values() if r.get('success'))
    
    if successful > 0:
        print(f"\n✅ SUCCESSFULLY POSTED TO {successful} PLATFORMS!\n")
        
        for platform, result in results.items():
            if result.get('success'):
                print(f"{platform.upper()}:")
                print(f"   ✅ POSTED WITH {result['score']}x ENGAGEMENT SCORE")
                print(f"   📈 Expected: {result['expected']}")
                print()
        
        avg_score = sum(r['score'] for r in results.values() if r.get('success')) / successful
        print(f"🎯 Average Engagement Score: {avg_score:.1f}x")
        print(f"🚀 This is REAL, LIVE content with v2.0 optimization!")
        print(f"📊 Check the platforms NOW to see the actual posts!")
    else:
        print("\n❌ No successful posts - check credentials")
    
    print("\n" + "="*80)
    print("THIS IS YOUR PROOF - REAL POSTS WITH REAL IDS!")
    print("="*80)

if __name__ == "__main__":
    main()