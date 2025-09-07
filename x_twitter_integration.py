#!/usr/bin/env python3
"""
X (Twitter) Integration for N8N
Handles posting to X/Twitter using OAuth 1.0a
"""

import tweepy
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

class XTwitterPoster:
    def __init__(self):
        # Load credentials from environment
        self.consumer_key = os.getenv('TWITTER_CONSUMER_KEY')
        self.consumer_secret = os.getenv('TWITTER_CONSUMER_SECRET')
        self.access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        self.access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        
        # Initialize Tweepy client
        self.client = None
        self.api = None
        self.setup_client()
    
    def setup_client(self):
        """Setup Twitter/X API client"""
        try:
            # For Twitter API v2 (recommended)
            self.client = tweepy.Client(
                consumer_key=self.consumer_key,
                consumer_secret=self.consumer_secret,
                access_token=self.access_token,
                access_token_secret=self.access_token_secret,
                wait_on_rate_limit=True
            )
            
            # For Twitter API v1.1 (fallback)
            auth = tweepy.OAuth1UserHandler(
                self.consumer_key, 
                self.consumer_secret,
                self.access_token, 
                self.access_token_secret
            )
            self.api = tweepy.API(auth)
            
            print("✅ X/Twitter client initialized")
            
        except Exception as e:
            print(f"❌ Error setting up Twitter client: {e}")
    
    def post_tweet(self, content: str) -> dict:
        """Post content to X/Twitter"""
        try:
            # Truncate if too long (280 character limit)
            if len(content) > 280:
                content = content[:277] + "..."
            
            # Try API v2 first
            if self.client:
                response = self.client.create_tweet(text=content)
                
                if response.data:
                    return {
                        "success": True,
                        "tweet_id": response.data['id'],
                        "text": content,
                        "timestamp": datetime.now().isoformat()
                    }
            
            # Fallback to API v1.1
            elif self.api:
                tweet = self.api.update_status(content)
                return {
                    "success": True,
                    "tweet_id": str(tweet.id),
                    "text": content,
                    "timestamp": datetime.now().isoformat()
                }
            
            return {
                "success": False,
                "error": "No Twitter client available"
            }
            
        except tweepy.TweepyException as e:
            error_msg = str(e)
            
            # Handle specific errors
            if "401" in error_msg or "Unauthorized" in error_msg:
                return {
                    "success": False,
                    "error": "Authentication failed - check credentials"
                }
            elif "403" in error_msg:
                return {
                    "success": False,
                    "error": "Access denied - check app permissions"
                }
            elif "duplicate" in error_msg.lower():
                return {
                    "success": False,
                    "error": "Duplicate content - already tweeted"
                }
            else:
                return {
                    "success": False,
                    "error": f"Twitter API error: {error_msg}"
                }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {str(e)}"
            }
    
    def verify_credentials(self) -> dict:
        """Verify Twitter credentials are working"""
        try:
            if self.api:
                user = self.api.verify_credentials()
                return {
                    "success": True,
                    "username": user.screen_name,
                    "name": user.name,
                    "followers": user.followers_count
                }
            return {
                "success": False,
                "error": "No API connection"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

# Initialize Twitter poster
twitter_poster = XTwitterPoster()

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "X/Twitter Integration",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/verify', methods=['GET'])
def verify():
    """Verify Twitter credentials"""
    result = twitter_poster.verify_credentials()
    return jsonify(result)

@app.route('/post', methods=['POST'])
def post_to_twitter():
    """Post content to X/Twitter"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        
        if not content:
            return jsonify({
                "success": False,
                "error": "No content provided"
            }), 400
        
        result = twitter_poster.post_tweet(content)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/test', methods=['GET'])
def test_post():
    """Test posting with sample content"""
    test_content = f"🎯 Test post from AI Finance Agency - {datetime.now().strftime('%H:%M:%S')}\n\n#AIFinance #Testing"
    result = twitter_poster.post_tweet(test_content)
    return jsonify(result)

if __name__ == '__main__':
    print("🐦 X/Twitter Integration Service Starting...")
    print("📍 Endpoints:")
    print("   GET  http://localhost:5002/health - Health check")
    print("   GET  http://localhost:5002/verify - Verify credentials")
    print("   POST http://localhost:5002/post - Post to Twitter")
    print("   GET  http://localhost:5002/test - Test posting")
    print("\n✨ Service ready for N8N integration!")
    
    # Verify credentials on startup
    verify_result = twitter_poster.verify_credentials()
    if verify_result['success']:
        print(f"\n✅ Connected to X/Twitter as @{verify_result['username']}")
        print(f"   Followers: {verify_result['followers']}")
    else:
        print(f"\n⚠️ Warning: {verify_result['error']}")
        print("   Please check your Twitter credentials in .env file")
    
    app.run(host='0.0.0.0', port=5002, debug=False)