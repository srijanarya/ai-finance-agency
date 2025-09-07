#!/usr/bin/env python3
"""
Cloud-based poster for GitHub Actions
Runs in the cloud without needing local Mac
"""
import os
import sys
import json
import random
import requests
from datetime import datetime
from coherent_content_generator import CoherentContentGenerator
from engagement_optimizer_v2 import EngagementOptimizerV2

class CloudPoster:
    """Posts content from GitHub Actions"""
    
    def __init__(self):
        self.generator = CoherentContentGenerator()
        self.optimizer = EngagementOptimizerV2()
        
        # Content rotation for diversity
        self.content_types = [
            # Success stories (40%)
            'options_win_story',
            'successful_trade',
            'smart_investment',
            'wealth_lesson',
            
            # Educational (40%)
            'market_insight',
            'trading_tool',
            'educational_concept',
            'tax_strategies',
            
            # Lessons (20%)
            'options_loss_story',
            'investment_mistake'
        ]
        
        # Load posting history to avoid duplicates
        self.history_file = 'cloud_posting_history.json'
        self.load_history()
    
    def load_history(self):
        """Load posting history"""
        if os.path.exists(self.history_file):
            with open(self.history_file, 'r') as f:
                self.history = json.load(f)
        else:
            self.history = {
                'last_types': [],
                'posts_today': 0,
                'last_post_date': None
            }
    
    def save_history(self):
        """Save posting history"""
        with open(self.history_file, 'w') as f:
            json.dump(self.history, f, indent=2)
    
    def get_next_content_type(self):
        """Get diverse content type"""
        # Avoid repeating last 3 types
        available = [ct for ct in self.content_types 
                    if ct not in self.history['last_types'][-3:]]
        
        if not available:
            available = self.content_types
        
        # Weight towards success and education
        weights = []
        for ct in available:
            if 'loss' in ct or 'mistake' in ct:
                weights.append(0.5)  # Lower weight for losses
            elif 'win' in ct or 'successful' in ct:
                weights.append(2.0)  # Higher for success
            else:
                weights.append(1.0)  # Normal for education
        
        # Normalize and select
        total = sum(weights)
        weights = [w/total for w in weights]
        selected = random.choices(available, weights=weights)[0]
        
        # Update history
        self.history['last_types'].append(selected)
        if len(self.history['last_types']) > 5:
            self.history['last_types'] = self.history['last_types'][-5:]
        
        return selected
    
    def generate_content(self, platform):
        """Generate optimized content"""
        content_type = self.get_next_content_type()
        
        print(f"📝 Generating {content_type} for {platform}...")
        
        # Generate coherent content
        result = self.generator.generate_coherent_content(
            content_type=content_type,
            platform=platform
        )
        
        if result['success']:
            # Apply v2.0 optimization
            optimized = self.optimizer.optimize_content(
                result['content'],
                platform=platform,
                audience='retail_investors',
                apply_all=True
            )
            
            result['content'] = optimized['content']
            result['engagement_score'] = optimized['engagement_score']
            
            print(f"✅ Generated: {content_type}")
            print(f"   Coherence: {result.get('coherence_score')}/10")
            print(f"   Engagement: {result.get('engagement_score')}x")
            
            return result
        
        return None
    
    def post_to_linkedin(self, content):
        """Post to LinkedIn"""
        token = os.getenv('LINKEDIN_ACCESS_TOKEN')
        if not token:
            print("❌ No LinkedIn token in GitHub Secrets")
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
        
        user_id = user_response.json().get('sub')
        
        # Post content
        post_data = {
            "author": f"urn:li:person:{user_id}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": content['content'][:1300]
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
            print(f"✅ Posted to LinkedIn!")
            return True
        else:
            print(f"❌ LinkedIn post failed: {response.status_code}")
            return False
    
    def post_to_twitter(self, content):
        """Post to Twitter/X"""
        # Using OAuth 1.0a for Twitter
        import tweepy
        
        consumer_key = os.getenv('TWITTER_CONSUMER_KEY')
        consumer_secret = os.getenv('TWITTER_CONSUMER_SECRET')
        access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        
        if not all([consumer_key, consumer_secret, access_token, access_token_secret]):
            print("❌ Missing Twitter credentials in GitHub Secrets")
            return False
        
        try:
            # Authenticate
            auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
            auth.set_access_token(access_token, access_token_secret)
            api = tweepy.API(auth)
            
            # Post tweet (280 char limit)
            tweet_text = content['content']
            if len(tweet_text) > 280:
                tweet_text = tweet_text[:277] + "..."
            
            tweet = api.update_status(tweet_text)
            print(f"✅ Posted to Twitter/X!")
            print(f"   Tweet ID: {tweet.id}")
            return True
        except Exception as e:
            print(f"❌ Twitter post failed: {e}")
            return False
    
    def post_to_telegram(self, content):
        """Post to Telegram"""
        bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        channel_id = os.getenv('TELEGRAM_CHANNEL_ID', '@AIFinanceNews2024')
        
        if not bot_token:
            print("❌ No Telegram token in GitHub Secrets")
            return False
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        
        # Add channel link if not present
        text = content['content']
        if '@AIFinanceNews2024' not in text:
            text += '\n\n📊 Follow: @AIFinanceNews2024'
        
        payload = {
            'chat_id': channel_id,
            'text': text[:4096],
            'parse_mode': 'HTML'
        }
        
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('ok'):
                print(f"✅ Posted to Telegram!")
                return True
        
        print(f"❌ Telegram post failed")
        return False
    
    def run(self):
        """Main execution for GitHub Actions"""
        print("="*60)
        print("🌩️ CLOUD POSTER - GitHub Actions")
        print("="*60)
        print(f"Time: {datetime.now()}")
        print(f"Running from: GitHub Actions (Cloud)")
        
        # Check if we've already posted today
        today = datetime.now().date().isoformat()
        if self.history.get('last_post_date') == today:
            if self.history['posts_today'] >= 3:
                print("⚠️ Already posted 3 times today. Skipping.")
                return
        else:
            self.history['posts_today'] = 0
            self.history['last_post_date'] = today
        
        results = []
        
        # Post to LinkedIn
        print("\n📘 LinkedIn Post:")
        content = self.generate_content('linkedin')
        if content:
            if self.post_to_linkedin(content):
                results.append('LinkedIn')
        
        # Post to Twitter/X
        print("\n🐦 Twitter/X Post:")
        content = self.generate_content('twitter')
        if content:
            if self.post_to_twitter(content):
                results.append('Twitter')
        
        # Post to Telegram
        print("\n💬 Telegram Post:")
        content = self.generate_content('telegram')
        if content:
            if self.post_to_telegram(content):
                results.append('Telegram')
        
        # Update history
        self.history['posts_today'] += len(results)
        self.save_history()
        
        # Summary
        print("\n" + "="*60)
        print("📊 POSTING SUMMARY")
        print("="*60)
        
        if results:
            print(f"✅ Successfully posted to: {', '.join(results)}")
            print(f"📈 Posts today: {self.history['posts_today']}/3")
            print("🚀 Running in the cloud - no Mac needed!")
        else:
            print("❌ No successful posts")
            print("Check GitHub Secrets are configured:")
            print("  - LINKEDIN_ACCESS_TOKEN")
            print("  - TELEGRAM_BOT_TOKEN")
        
        # Commit history file back to repo
        if results and os.getenv('GITHUB_ACTIONS'):
            print("\n📝 Updating posting history...")
            os.system(f"""
                git config --local user.email "action@github.com"
                git config --local user.name "GitHub Action"
                git add {self.history_file}
                git diff --staged --quiet || git commit -m "Update posting history [skip ci]"
                git push || echo "Could not push history update"
            """)


if __name__ == "__main__":
    poster = CloudPoster()
    poster.run()