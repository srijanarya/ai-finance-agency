#!/usr/bin/env python3
"""
SAFE Cloud Poster - With Manual Approval Gate
NEVER posts without your review
"""

import os
import sys
import json
import requests
from datetime import datetime
from safe_content_generator import SafeContentGenerator, ManualApprovalGate
from dotenv import load_dotenv

# Load environment variables
if not os.getenv('GITHUB_ACTIONS'):
    load_dotenv()

class SafeCloudPoster:
    """Safe posting with approval requirement"""
    
    def __init__(self):
        self.generator = SafeContentGenerator()
        self.approval = ManualApprovalGate()
        self.require_approval = True  # ALWAYS TRUE
        
    def generate_for_approval(self):
        """Generate content and queue for approval"""
        
        print("=" * 60)
        print("🛡️ SAFE CONTENT GENERATION")
        print("=" * 60)
        print(f"Time: {datetime.now()}")
        print("Mode: APPROVAL REQUIRED")
        print()
        
        platforms = ['linkedin', 'twitter', 'telegram']
        generated = []
        
        for platform in platforms:
            print(f"\n📝 Generating safe content for {platform}...")
            
            result = self.generator.generate_safe_content(platform, 'market_insight')
            
            if result['safe']:
                print("✅ Content is SAFE (no specific numbers)")
                approval_id = self.approval.add_for_approval(result)
                print(f"📋 Queued for approval (ID: {approval_id})")
                generated.append({
                    'platform': platform,
                    'approval_id': approval_id,
                    'preview': result['content'][:200]
                })
            else:
                print("❌ Content has safety issues:")
                for issue in result['issues']:
                    print(f"  - {issue}")
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 APPROVAL QUEUE SUMMARY")
        print("=" * 60)
        
        if generated:
            print(f"\n✅ {len(generated)} posts ready for your review")
            print("\n📱 Review and approve at: pending_approval.json")
            print("\nTo approve and post:")
            print("1. Review content in pending_approval.json")
            print("2. Run: python approve_and_post.py [approval_id]")
            
            # Save summary for easy access
            with open('approval_summary.json', 'w') as f:
                json.dump({
                    'generated_at': datetime.now().isoformat(),
                    'posts': generated,
                    'status': 'awaiting_approval'
                }, f, indent=2)
        else:
            print("❌ No safe content could be generated")
        
        return generated
    
    def post_approved_content(self, approval_id: str):
        """Post only after manual approval"""
        
        # Load pending approvals
        if not os.path.exists('pending_approval.json'):
            print("❌ No pending approvals found")
            return False
        
        with open('pending_approval.json', 'r') as f:
            pending = json.load(f)
        
        # Find the specific content
        content_to_post = None
        for item in pending:
            if item['approval_id'] == approval_id and item['status'] == 'approved':
                content_to_post = item
                break
        
        if not content_to_post:
            print(f"❌ No approved content found with ID: {approval_id}")
            return False
        
        # Post to appropriate platform
        platform = content_to_post['platform']
        content = content_to_post['content']
        
        print(f"\n📤 Posting approved content to {platform}...")
        
        if platform == 'linkedin':
            success = self.post_to_linkedin(content)
        elif platform == 'twitter':
            success = self.post_to_twitter(content)
        elif platform == 'telegram':
            success = self.post_to_telegram(content)
        else:
            success = False
        
        if success:
            print(f"✅ Successfully posted to {platform}")
            # Mark as posted
            for item in pending:
                if item['approval_id'] == approval_id:
                    item['status'] = 'posted'
                    item['posted_at'] = datetime.now().isoformat()
            
            with open('pending_approval.json', 'w') as f:
                json.dump(pending, f, indent=2)
        else:
            print(f"❌ Failed to post to {platform}")
        
        return success
    
    def post_to_linkedin(self, content: str) -> bool:
        """Post to LinkedIn"""
        token = os.getenv('LINKEDIN_ACCESS_TOKEN')
        if not token:
            print("❌ LinkedIn token not found")
            return False
        
        # Get user ID
        headers = {
            'Authorization': f'Bearer {token}',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        user_response = requests.get(
            'https://api.linkedin.com/v2/userinfo',
            headers=headers
        )
        
        if user_response.status_code != 200:
            print(f"❌ LinkedIn auth failed: {user_response.status_code}")
            return False
        
        user_id = user_response.json()['sub']
        
        # Post content
        post_data = {
            "author": f"urn:li:person:{user_id}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": content
                    },
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }
        
        response = requests.post(
            'https://api.linkedin.com/v2/ugcPosts',
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0'
            },
            json=post_data
        )
        
        return response.status_code == 201
    
    def post_to_twitter(self, content: str) -> bool:
        """Post to Twitter/X"""
        try:
            import tweepy
            
            auth = tweepy.OAuthHandler(
                os.getenv('TWITTER_API_KEY'),
                os.getenv('TWITTER_API_SECRET')
            )
            auth.set_access_token(
                os.getenv('TWITTER_ACCESS_TOKEN'),
                os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
            )
            
            api = tweepy.API(auth)
            api.update_status(content[:280])
            return True
        except Exception as e:
            print(f"❌ Twitter error: {e}")
            return False
    
    def post_to_telegram(self, content: str) -> bool:
        """Post to Telegram"""
        bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        channel_id = os.getenv('TELEGRAM_CHANNEL_ID')
        
        if not bot_token or not channel_id:
            print("❌ Telegram credentials missing")
            return False
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = {
            'chat_id': channel_id,
            'text': content,
            'parse_mode': 'Markdown'
        }
        
        response = requests.post(url, data=data)
        return response.status_code == 200


def main():
    """Main execution"""
    poster = SafeCloudPoster()
    
    # Check for command line arguments
    if len(sys.argv) > 1:
        # Approve and post mode
        approval_id = sys.argv[1]
        poster.post_approved_content(approval_id)
    else:
        # Generate for approval mode
        poster.generate_for_approval()


if __name__ == "__main__":
    main()