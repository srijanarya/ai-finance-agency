#!/usr/bin/env python3
"""
LinkedIn Posting Module
Handles actual posting to LinkedIn using the API
"""

import os
import json
import requests
from datetime import datetime
from typing import Dict, Optional
from dotenv import load_dotenv
import logging

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LinkedInPoster:
    """Handles LinkedIn API posting"""
    
    def __init__(self):
        self.client_id = os.getenv('LINKEDIN_CLIENT_ID')
        self.client_secret = os.getenv('LINKEDIN_CLIENT_SECRET')
        self.redirect_uri = os.getenv('LINKEDIN_REDIRECT_URI', 'http://localhost:8080/callback')
        self.access_token = os.getenv('LINKEDIN_ACCESS_TOKEN')  # You'll need to get this
        
        # LinkedIn API endpoints
        self.api_base = 'https://api.linkedin.com/v2'
        self.user_info_url = f'{self.api_base}/me'
        self.share_url = f'{self.api_base}/ugcPosts'
        
    def get_profile_id(self) -> Optional[str]:
        """Get LinkedIn profile ID"""
        if not self.access_token:
            logger.error("No access token available")
            return None
            
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        try:
            response = requests.get(self.user_info_url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                return f"urn:li:person:{data['id']}"
            else:
                logger.error(f"Failed to get profile: {response.status_code}")
                return None
        except Exception as e:
            logger.error(f"Error getting profile: {e}")
            return None
    
    def post_to_linkedin(self, content: Dict) -> Dict:
        """
        Post content to LinkedIn
        
        Args:
            content: Dictionary with 'text' and optional 'hashtags'
        
        Returns:
            Result dictionary with status and message
        """
        
        if not self.access_token:
            # For now, we'll save content and return instruction
            return self.save_for_manual_posting(content)
        
        profile_id = self.get_profile_id()
        if not profile_id:
            return self.save_for_manual_posting(content)
        
        # Prepare the post text
        post_text = content.get('content', content.get('text', ''))
        if content.get('hashtags'):
            hashtags = ' '.join(content['hashtags'])
            post_text = f"{post_text}\n\n{hashtags}"
        
        # LinkedIn API payload
        payload = {
            "author": profile_id,
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
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        try:
            response = requests.post(
                self.share_url,
                headers=headers,
                json=payload
            )
            
            if response.status_code == 201:
                logger.info("Successfully posted to LinkedIn")
                return {
                    'status': 'success',
                    'message': 'Posted to LinkedIn successfully',
                    'timestamp': datetime.now().isoformat(),
                    'post_id': response.headers.get('X-RestLi-Id', '')
                }
            else:
                logger.error(f"LinkedIn API error: {response.status_code}")
                return self.save_for_manual_posting(content)
                
        except Exception as e:
            logger.error(f"Error posting to LinkedIn: {e}")
            return self.save_for_manual_posting(content)
    
    def save_for_manual_posting(self, content: Dict) -> Dict:
        """
        Save content for manual posting when API is not available
        """
        # Save content to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"posts/linkedin_ready_{timestamp}.json"
        
        os.makedirs('posts', exist_ok=True)
        
        # Prepare the formatted text for easy copying
        post_text = content.get('content', content.get('text', ''))
        if content.get('hashtags'):
            hashtags = ' '.join(content['hashtags'])
            formatted_text = f"{post_text}\n\n{hashtags}"
        else:
            formatted_text = post_text
        
        save_data = {
            'content': formatted_text,
            'original': content,
            'timestamp': datetime.now().isoformat(),
            'status': 'ready_for_manual_posting'
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(save_data, f, indent=2, ensure_ascii=False)
        
        # Also save as plain text for easy copying
        text_filename = f"posts/linkedin_ready_{timestamp}.txt"
        with open(text_filename, 'w', encoding='utf-8') as f:
            f.write(formatted_text)
        
        logger.info(f"Content saved for manual posting: {filename}")
        
        return {
            'status': 'saved',
            'message': 'Content saved for manual posting',
            'filename': filename,
            'text_file': text_filename,
            'instruction': 'Copy the content from the text file and post manually to LinkedIn',
            'content_preview': formatted_text[:200] + '...' if len(formatted_text) > 200 else formatted_text
        }
    
    def get_auth_url(self) -> str:
        """
        Get LinkedIn OAuth authorization URL
        This is needed to get the access token
        """
        auth_url = (
            f"https://www.linkedin.com/oauth/v2/authorization?"
            f"response_type=code&"
            f"client_id={self.client_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"scope=w_member_social%20r_liteprofile"
        )
        return auth_url


def post_content(content: Dict) -> Dict:
    """
    Main function to post content to LinkedIn
    
    Args:
        content: Dictionary with content details
    
    Returns:
        Result dictionary
    """
    poster = LinkedInPoster()
    return poster.post_to_linkedin(content)


def main():
    """Test the LinkedIn poster"""
    
    # Test content
    test_content = {
        'content': """The Nifty dropped 150 points today.

But that's not the real story.

📊 Key Numbers:
• Nifty: 24,712 (-0.75%)
• FII: ₹+892 Cr | DII: ₹+1,765 Cr

🔍 The Pattern Most Missed:
Similar pattern in 2019 led to 15% rally

What's your take on this?""",
        'hashtags': ['#IndianStockMarket', '#Nifty50', '#StockMarketIndia']
    }
    
    print("\n🔗 LinkedIn Poster Test")
    print("=" * 50)
    
    result = post_content(test_content)
    
    print(f"\nStatus: {result['status']}")
    print(f"Message: {result['message']}")
    
    if result.get('text_file'):
        print(f"\n📄 Content saved to: {result['text_file']}")
        print("\n📋 To post manually:")
        print("1. Copy content from the file above")
        print("2. Go to LinkedIn.com")
        print("3. Create a new post and paste the content")
    
    print("=" * 50)


if __name__ == "__main__":
    main()