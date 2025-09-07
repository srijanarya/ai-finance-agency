#!/usr/bin/env python3
"""
Quick Twitter/X Test - Diagnose and fix timeout issues
"""

import os
import sys
import time
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

print("=" * 60)
print("🐦 TWITTER/X POSTING FIX")
print("=" * 60)

# Step 1: Check if tweepy is installed
try:
    import tweepy
    print("✅ Tweepy installed")
except ImportError:
    print("❌ Tweepy not installed. Installing...")
    os.system("pip install tweepy")
    import tweepy

# Step 2: Load credentials
consumer_key = os.getenv('TWITTER_CONSUMER_KEY')
consumer_secret = os.getenv('TWITTER_CONSUMER_SECRET')
access_token = os.getenv('TWITTER_ACCESS_TOKEN')
access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')

if not all([consumer_key, consumer_secret, access_token, access_token_secret]):
    print("❌ Missing Twitter credentials in .env")
    sys.exit(1)

print("✅ Credentials loaded")

# Step 3: Test API v2 connection with timeout handling
print("\n📡 Testing Twitter API v2 connection...")

try:
    # Create client with v2 API
    client = tweepy.Client(
        consumer_key=consumer_key,
        consumer_secret=consumer_secret,
        access_token=access_token,
        access_token_secret=access_token_secret,
        wait_on_rate_limit=False  # Don't wait, fail fast
    )
    
    # Test authentication by getting user info
    print("🔐 Verifying authentication...")
    me = client.get_me()
    
    if me and me.data:
        print(f"✅ Authenticated as: @{me.data.username}")
        print(f"📊 Account ID: {me.data.id}")
    else:
        print("⚠️ Authentication succeeded but couldn't get user info")
    
    # Step 4: Post a test tweet
    print("\n📝 Posting test tweet...")
    
    test_content = f"""🤖 Twitter Integration Test - {datetime.now().strftime('%I:%M %p')}

📊 System Status: Operational
🚀 AI Finance Agency: Active
⚡ Real-time posting: Fixed

#AI #Finance #Automation"""
    
    # Post with timeout
    start_time = time.time()
    response = client.create_tweet(text=test_content)
    post_time = time.time() - start_time
    
    if response and response.data:
        print(f"✅ Tweet posted successfully in {post_time:.1f} seconds!")
        print(f"🔗 Tweet ID: {response.data['id']}")
        print(f"📱 View at: https://twitter.com/i/web/status/{response.data['id']}")
    else:
        print("❌ Tweet posted but no response data")
        
except tweepy.TooManyRequests:
    print("❌ Rate limit exceeded. Wait 15 minutes.")
except tweepy.Forbidden as e:
    print(f"❌ Forbidden: {e}")
    print("Possible issues:")
    print("1. Check if your app has read AND write permissions")
    print("2. Regenerate your access tokens")
except tweepy.Unauthorized as e:
    print(f"❌ Unauthorized: {e}")
    print("Your credentials may be invalid. Regenerate them.")
except Exception as e:
    print(f"❌ Error: {e}")
    print(f"Error type: {type(e).__name__}")

print("\n" + "=" * 60)
print("💡 NEXT STEPS IF FAILED:")
print("=" * 60)
print("1. Go to https://developer.twitter.com/en/apps")
print("2. Select your app")
print("3. Go to 'Keys and tokens'")
print("4. Regenerate access token & secret")
print("5. Update .env file with new tokens")
print("6. Make sure app has 'Read and Write' permissions")
print("=" * 60)