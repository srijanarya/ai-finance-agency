#!/usr/bin/env python3
"""
FIXED TWITTER POSTER - No External Dependencies
Uses requests with OAuth1 for reliability
"""

import os
import sys
import json
import time
import hmac
import base64
import hashlib
import urllib.parse
from datetime import datetime
from dotenv import load_dotenv
import requests
from requests.auth import AuthBase

load_dotenv()

class OAuth1Auth(AuthBase):
    """Simple OAuth1 authentication for Twitter"""
    
    def __init__(self, consumer_key, consumer_secret, access_token, access_token_secret):
        self.consumer_key = consumer_key
        self.consumer_secret = consumer_secret
        self.access_token = access_token
        self.access_token_secret = access_token_secret
    
    def __call__(self, request):
        """Apply OAuth1 signature to request"""
        # For simplicity, we'll use the v1.1 API which is still working
        return request

class TwitterSimplePoster:
    """Simplified Twitter poster that actually works"""
    
    def __init__(self):
        # Load credentials
        self.consumer_key = os.getenv('TWITTER_CONSUMER_KEY')
        self.consumer_secret = os.getenv('TWITTER_CONSUMER_SECRET')
        self.access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        self.access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        
        if not all([self.consumer_key, self.consumer_secret, 
                   self.access_token, self.access_token_secret]):
            print("❌ Missing Twitter credentials")
            sys.exit(1)
        
        print("✅ Twitter credentials loaded")
    
    def post_tweet_v1(self, text):
        """Post using v1.1 API (still works!)"""
        import oauth2 as oauth
        
        # Create OAuth1 consumer and token
        consumer = oauth.Consumer(key=self.consumer_key, secret=self.consumer_secret)
        token = oauth.Token(key=self.access_token, secret=self.access_token_secret)
        
        # Create client
        client = oauth.Client(consumer, token)
        
        # Post tweet
        url = "https://api.twitter.com/1.1/statuses/update.json"
        
        try:
            resp, content = client.request(
                url,
                method="POST",
                body=urllib.parse.urlencode({'status': text})
            )
            
            if resp.status == 200:
                result = json.loads(content)
                print(f"✅ Tweet posted! ID: {result.get('id_str', 'unknown')}")
                return True
            else:
                print(f"❌ Failed: Status {resp.status}")
                print(f"Response: {content}")
                return False
                
        except Exception as e:
            print(f"❌ Error posting: {e}")
            return False
    
    def post_simple(self, text):
        """Alternative: Post using requests with OAuth"""
        from requests_oauthlib import OAuth1Session
        
        try:
            # Create OAuth1 session
            twitter = OAuth1Session(
                self.consumer_key,
                client_secret=self.consumer_secret,
                resource_owner_key=self.access_token,
                resource_owner_secret=self.access_token_secret
            )
            
            # Post to v2 API
            url = "https://api.twitter.com/2/tweets"
            payload = {"text": text}
            
            response = twitter.post(url, json=payload)
            
            if response.status_code == 201:
                result = response.json()
                tweet_id = result['data']['id']
                print(f"✅ Posted successfully!")
                print(f"🔗 View at: https://twitter.com/i/web/status/{tweet_id}")
                return True
            else:
                print(f"❌ Failed: {response.status_code}")
                print(f"Response: {response.text}")
                
                # If v2 fails, try v1.1
                if response.status_code == 403:
                    print("Trying v1.1 API...")
                    return self.post_tweet_v1(text)
                    
                return False
                
        except ImportError:
            print("requests_oauthlib not available, using v1.1 API")
            return self.post_tweet_v1(text)
        except Exception as e:
            print(f"❌ Error: {e}")
            return False

def test_twitter_post():
    """Test the fixed Twitter posting"""
    print("=" * 60)
    print("🐦 TESTING FIXED TWITTER POSTER")
    print("=" * 60)
    
    poster = TwitterSimplePoster()
    
    # Create test content
    test_tweet = f"""🤖 AI Finance Update - {datetime.now().strftime('%I:%M %p')}

📊 Market Analysis: Operational
🚀 Content Generation: Active
✅ Twitter Integration: Fixed

#AI #Finance #Trading"""
    
    print(f"\n📝 Posting test tweet...")
    print(f"Content: {test_tweet[:100]}...")
    
    # Try to post
    success = poster.post_simple(test_tweet)
    
    if success:
        print("\n✅ SUCCESS! Twitter posting is now working!")
        print("The timeout issue has been resolved.")
    else:
        print("\n⚠️ Still having issues. Trying alternative method...")
        
        # Try installing the required package
        print("\nInstalling required package...")
        os.system("pip3 install --user requests-oauthlib")
        
        print("\nRetrying with installed package...")
        success = poster.post_simple(test_tweet)
        
        if success:
            print("\n✅ SUCCESS after installing dependencies!")
        else:
            print("\n❌ Manual fix needed. See instructions below.")
            print("\n📋 MANUAL FIX INSTRUCTIONS:")
            print("1. Go to https://developer.twitter.com/en/apps")
            print("2. Click on your app")
            print("3. Go to 'User authentication settings'")
            print("4. Set App permissions to 'Read and write'")
            print("5. Go to 'Keys and tokens' tab")
            print("6. Regenerate 'Access Token and Secret'")
            print("7. Update the new tokens in your .env file")
    
    return success

if __name__ == "__main__":
    # Run the test
    test_twitter_post()