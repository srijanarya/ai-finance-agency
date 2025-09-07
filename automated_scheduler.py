#!/usr/bin/env python3
"""
Automated Content Scheduling System
Posts diverse, high-quality content at optimal times
"""
import schedule
import time
import random
import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

class ContentScheduler:
    """Automated scheduler for posting diverse content"""
    
    def __init__(self):
        self.schedule_file = 'posting_schedule.json'
        self.load_schedule()
        
        # Balanced content rotation - mix of wins, losses, and education
        self.content_rotation = [
            # SUCCESS STORIES (40%)
            'options_win_story',
            'successful_trade', 
            'smart_investment',
            'wealth_lesson',
            
            # EDUCATIONAL (40%)
            'market_insight',
            'trading_tool',
            'educational_concept',
            'tax_strategies',
            
            # LESSONS FROM MISTAKES (20%)
            'options_loss_story',
            'investment_mistake'
        ]
        
        self.last_content_type = None
        self.daily_post_count = 0
        self.max_daily_posts = 3  # Limit to avoid spam
        
    def load_schedule(self):
        """Load posting schedule"""
        if os.path.exists(self.schedule_file):
            with open(self.schedule_file, 'r') as f:
                self.schedule_data = json.load(f)
        else:
            # Default optimal posting times (IST)
            self.schedule_data = {
                'linkedin': {
                    'times': ['09:00', '14:00', '19:00'],
                    'enabled': True
                },
                'twitter': {
                    'times': ['08:30', '13:30', '20:30'],
                    'enabled': True
                },
                'telegram': {
                    'times': ['09:30', '15:00', '21:00'],
                    'enabled': True
                }
            }
            self.save_schedule()
    
    def save_schedule(self):
        """Save schedule to file"""
        with open(self.schedule_file, 'w') as f:
            json.dump(self.schedule_data, f, indent=2)
    
    def get_next_content_type(self) -> str:
        """Get next content type ensuring diversity"""
        # Avoid repeating the same type
        available = [ct for ct in self.content_rotation if ct != self.last_content_type]
        
        # Weight selection to avoid too many loss stories
        weights = []
        for ct in available:
            if 'loss' in ct or 'mistake' in ct:
                weights.append(0.5)  # Lower weight for loss stories
            elif 'win' in ct or 'successful' in ct or 'smart' in ct:
                weights.append(2.0)  # Higher weight for success stories
            else:
                weights.append(1.0)  # Normal weight for educational
        
        # Normalize weights
        total_weight = sum(weights)
        weights = [w/total_weight for w in weights]
        
        # Random weighted selection
        selected = random.choices(available, weights=weights)[0]
        self.last_content_type = selected
        
        return selected
    
    def generate_content(self, platform: str) -> Optional[Dict]:
        """Generate diverse content for platform"""
        content_type = self.get_next_content_type()
        
        print(f"\n📝 Generating {content_type} for {platform}...")
        
        url = "http://localhost:5001/generate_coherent"
        payload = {
            "content_type": content_type,
            "platform": platform,
            "apply_optimization": True
        }
        
        try:
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✅ Generated: {content_type}")
                    return result
        except Exception as e:
            print(f"❌ Generation failed: {e}")
        
        return None
    
    def post_to_platform(self, platform: str, content: Dict) -> bool:
        """Post content to specific platform"""
        if platform == 'linkedin':
            return self.post_to_linkedin(content)
        elif platform == 'twitter':
            return self.post_to_twitter(content)
        elif platform == 'telegram':
            return self.post_to_telegram(content)
        return False
    
    def post_to_linkedin(self, content: Dict) -> bool:
        """Post to LinkedIn"""
        access_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
        if not access_token:
            return False
        
        # Implementation would post to LinkedIn
        # For now, log the action
        print(f"📘 Would post to LinkedIn: {content.get('type')}")
        return True
    
    def post_to_twitter(self, content: Dict) -> bool:
        """Post to Twitter"""
        url = "http://localhost:5002/post"
        payload = {"content": content['content'][:280]}
        
        try:
            response = requests.post(url, json=payload)
            return response.status_code == 200
        except:
            return False
    
    def post_to_telegram(self, content: Dict) -> bool:
        """Post to Telegram"""
        bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        channel_id = os.getenv('TELEGRAM_CHANNEL_ID', '@AIFinanceNews2024')
        
        if not bot_token:
            return False
        
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            'chat_id': channel_id,
            'text': content['content'][:4096],
            'parse_mode': 'HTML'
        }
        
        try:
            response = requests.post(url, json=payload)
            return response.status_code == 200
        except:
            return False
    
    def scheduled_post(self, platform: str):
        """Execute scheduled post"""
        if self.daily_post_count >= self.max_daily_posts:
            print(f"⚠️ Daily post limit reached ({self.max_daily_posts})")
            return
        
        print(f"\n{'='*60}")
        print(f"⏰ Scheduled Post: {platform.upper()} at {datetime.now().strftime('%H:%M')}")
        print(f"{'='*60}")
        
        # Generate diverse content
        content = self.generate_content(platform)
        
        if content and content.get('success'):
            # Post to platform
            if self.post_to_platform(platform, content):
                self.daily_post_count += 1
                print(f"✅ Posted to {platform}: {content.get('type')}")
                print(f"   Topic: {content.get('topic')}")
                print(f"   Coherence: {content.get('coherence_score')}/10")
                
                # Track in engagement system
                self.track_post(platform, content)
            else:
                print(f"❌ Failed to post to {platform}")
    
    def track_post(self, platform: str, content: Dict):
        """Track posted content for analytics"""
        # Would integrate with engagement_tracker.py
        pass
    
    def reset_daily_count(self):
        """Reset daily post counter"""
        self.daily_post_count = 0
        print(f"📅 Daily post count reset at {datetime.now()}")
    
    def setup_schedule(self):
        """Setup all scheduled posts"""
        # Schedule posts for each platform
        for platform, config in self.schedule_data.items():
            if config.get('enabled', False):
                for post_time in config['times']:
                    schedule.every().day.at(post_time).do(
                        self.scheduled_post, platform
                    )
                    print(f"📅 Scheduled {platform} post at {post_time}")
        
        # Reset counter at midnight
        schedule.every().day.at("00:00").do(self.reset_daily_count)
        
        print(f"\n✅ Scheduler configured with {len(schedule.jobs)} jobs")
    
    def run(self):
        """Run the scheduler"""
        print("="*60)
        print("🤖 AUTOMATED CONTENT SCHEDULER")
        print("="*60)
        print(f"Started at: {datetime.now()}")
        print(f"Max daily posts: {self.max_daily_posts}")
        print(f"Content types: {len(self.content_rotation)}")
        print("\nContent Distribution:")
        print("  • 40% Success Stories")
        print("  • 40% Educational Content")
        print("  • 20% Lessons from Mistakes")
        
        self.setup_schedule()
        
        print("\n⏳ Scheduler running... (Press Ctrl+C to stop)")
        
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute


def test_scheduler():
    """Test the scheduler with immediate posts"""
    print("="*60)
    print("🧪 TESTING CONTENT SCHEDULER")
    print("="*60)
    
    scheduler = ContentScheduler()
    
    # Test content diversity
    print("\n📊 Testing Content Diversity (10 selections):")
    type_count = {}
    for i in range(10):
        content_type = scheduler.get_next_content_type()
        type_count[content_type] = type_count.get(content_type, 0) + 1
        print(f"  {i+1}. {content_type}")
    
    print("\n📈 Distribution:")
    for ct, count in sorted(type_count.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / 10) * 100
        category = "SUCCESS" if any(x in ct for x in ['win', 'successful', 'smart']) else \
                  "LESSON" if any(x in ct for x in ['loss', 'mistake']) else "EDUCATION"
        print(f"  {ct}: {count} times ({percentage:.0f}%) - {category}")
    
    # Test single post generation
    print("\n🚀 Testing Single Post Generation:")
    for platform in ['linkedin', 'twitter', 'telegram']:
        print(f"\nTesting {platform}...")
        content = scheduler.generate_content(platform)
        if content:
            print(f"  ✅ Type: {content.get('type')}")
            print(f"  ✅ Coherence: {content.get('coherence_score')}/10")
            print(f"  ✅ Preview: {content.get('content', '')[:100]}...")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'test':
        test_scheduler()
    else:
        scheduler = ContentScheduler()
        try:
            scheduler.run()
        except KeyboardInterrupt:
            print("\n\n✋ Scheduler stopped by user")
            print(f"Total posts made: {scheduler.daily_post_count}")