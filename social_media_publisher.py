#!/usr/bin/env python3
"""
Social Media Publisher for AI Finance Agency
Publishes AI-generated content to various social platforms
"""

import json
import requests
import os
from datetime import datetime

class SocialMediaPublisher:
    def __init__(self):
        # Load credentials from environment
        self.twitter_api_key = os.getenv('TWITTER_API_KEY')
        self.linkedin_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
        self.facebook_token = os.getenv('FACEBOOK_PAGE_TOKEN')
        
        # API Gateway endpoint
        self.api_gateway = "http://localhost:3000/api/v1"
        
    def publish_to_twitter(self, content):
        """Publish content to Twitter/X"""
        # This would use Twitter API v2
        # For now, we'll use the local API gateway
        
        endpoint = f"{self.api_gateway}/social/twitter/post"
        payload = {
            "text": content[:280],  # Twitter character limit
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            response = requests.post(endpoint, json=payload)
            if response.status_code == 200:
                print(f"✅ Posted to Twitter: {content[:50]}...")
                return response.json()
            else:
                print(f"❌ Twitter post failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Twitter API error: {e}")
            
    def publish_to_linkedin(self, content, title=None):
        """Publish content to LinkedIn"""
        endpoint = f"{self.api_gateway}/social/linkedin/post"
        
        payload = {
            "title": title or "Market Update",
            "text": content,
            "visibility": "PUBLIC",
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            response = requests.post(endpoint, json=payload)
            if response.status_code == 200:
                print(f"✅ Posted to LinkedIn: {title}")
                return response.json()
            else:
                print(f"❌ LinkedIn post failed: {response.status_code}")
        except Exception as e:
            print(f"❌ LinkedIn API error: {e}")
            
    def publish_to_telegram(self, content, channel="@aifinanceagency"):
        """Publish to Telegram channel"""
        endpoint = f"{self.api_gateway}/social/telegram/message"
        
        payload = {
            "channel": channel,
            "message": content,
            "parse_mode": "Markdown",
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            response = requests.post(endpoint, json=payload)
            if response.status_code == 200:
                print(f"✅ Posted to Telegram channel: {channel}")
                return response.json()
            else:
                print(f"❌ Telegram post failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Telegram API error: {e}")
            
    def schedule_post(self, content, platform, scheduled_time):
        """Schedule a post for future publication"""
        endpoint = f"{self.api_gateway}/social/schedule"
        
        payload = {
            "platform": platform,
            "content": content,
            "scheduled_time": scheduled_time,
            "status": "pending"
        }
        
        try:
            response = requests.post(endpoint, json=payload)
            if response.status_code == 200:
                print(f"✅ Scheduled post for {platform} at {scheduled_time}")
                return response.json()
            else:
                print(f"❌ Scheduling failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Scheduling error: {e}")

def load_generated_content(filename="ai_generated_content.json"):
    """Load previously generated AI content"""
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Content file not found: {filename}")
        return None

def main():
    print("📱 Social Media Publisher for AI Finance Agency")
    print("=" * 60)
    
    # Initialize publisher
    publisher = SocialMediaPublisher()
    
    # Load generated content
    content = load_generated_content()
    
    if not content:
        print("No content to publish. Generate content first!")
        return
    
    # Publish to different platforms
    print("\n🚀 Publishing content to social platforms...")
    
    # Twitter
    if "twitter" in content.get("social_media", {}):
        twitter_content = content["social_media"]["twitter"]
        publisher.publish_to_twitter(twitter_content)
    
    # LinkedIn
    if "linkedin" in content.get("social_media", {}):
        linkedin_content = content["social_media"]["linkedin"]
        publisher.publish_to_linkedin(
            linkedin_content, 
            title="AI Finance Agency Market Update"
        )
    
    # Telegram
    if "market_analysis" in content:
        telegram_content = content["market_analysis"]
        publisher.publish_to_telegram(telegram_content)
    
    # Schedule future posts
    print("\n📅 Scheduling future posts...")
    
    # Schedule tomorrow's market preview
    from datetime import datetime, timedelta
    tomorrow = (datetime.now() + timedelta(days=1)).replace(
        hour=8, minute=0, second=0
    ).isoformat()
    
    publisher.schedule_post(
        "Tomorrow's market preview coming soon!",
        "twitter",
        tomorrow
    )
    
    print("\n✅ Social media publishing complete!")

if __name__ == "__main__":
    main()