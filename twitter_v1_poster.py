#!/usr/bin/env python3
"""
Twitter v1.1 API Compatible Poster
Works with basic Twitter API access levels
"""

import os
import tweepy
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def post_to_twitter_v1():
    """Post using Twitter API v1.1 (compatible with basic access)"""
    
    # Get credentials
    consumer_key = os.getenv('TWITTER_PERSONAL_CONSUMER_KEY')
    consumer_secret = os.getenv('TWITTER_PERSONAL_CONSUMER_SECRET')
    access_token = os.getenv('TWITTER_PERSONAL_ACCESS_TOKEN')
    access_token_secret = os.getenv('TWITTER_PERSONAL_ACCESS_TOKEN_SECRET')
    
    if not all([consumer_key, consumer_secret, access_token, access_token_secret]):
        print("❌ Missing Twitter credentials")
        return False
    
    try:
        # Initialize Tweepy with API v1.1
        auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
        auth.set_access_token(access_token, access_token_secret)
        api = tweepy.API(auth, wait_on_rate_limit=True)
        
        # Verify credentials first
        user = api.verify_credentials()
        if not user:
            print("❌ Twitter authentication failed")
            return False
        
        print(f"✅ Authenticated as @{user.screen_name}")
        
        # Create test tweet
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        tweet_text = f"""🚀 AI Finance Agency System Test - {timestamp}

✅ Multi-platform integration working
✅ Real-time market analysis active
✅ AI content generation online
✅ Automated workflows running

Using Twitter API v1.1 for compatibility! 🤖📊

#FinTech #AI #Automation #MarketData #Innovation"""
        
        # Post the tweet
        tweet = api.update_status(tweet_text)
        
        if tweet:
            print(f"✅ Tweet posted successfully!")
            print(f"Tweet ID: {tweet.id}")
            print(f"Tweet URL: https://twitter.com/{user.screen_name}/status/{tweet.id}")
            return True
        else:
            print("❌ Tweet posting failed")
            return False
            
    except Exception as e:
        print(f"❌ Twitter error: {e}")
        return False

def main():
    print("🐦 Twitter v1.1 API Test")
    print("=" * 40)
    
    success = post_to_twitter_v1()
    
    if success:
        print("\n🎉 Twitter posting successful with v1.1 API!")
    else:
        print("\n❌ Twitter posting failed")

if __name__ == "__main__":
    main()
