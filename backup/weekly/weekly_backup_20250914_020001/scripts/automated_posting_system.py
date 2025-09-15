#!/usr/bin/env python3
"""
Automated Posting System - End-to-End Content Pipeline
Posts to Telegram, Twitter/X, and LinkedIn automatically
"""

import os
import sys
import json
import sqlite3
import requests
import tweepy
import time
from datetime import datetime
from dotenv import load_dotenv
import openai

# Load environment variables
load_dotenv()

class AutomatedPostingSystem:
    def __init__(self):
        """Initialize with all platform credentials"""
        # Telegram
        self.telegram_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.telegram_channel = os.getenv('TELEGRAM_CHANNEL_ID', '@AIFinanceNews2024')
        
        # Twitter/X
        self.twitter_client = tweepy.Client(
            bearer_token=os.getenv('TWITTER_BEARER_TOKEN'),
            consumer_key=os.getenv('TWITTER_CONSUMER_KEY'),
            consumer_secret=os.getenv('TWITTER_CONSUMER_SECRET'),
            access_token=os.getenv('TWITTER_ACCESS_TOKEN'),
            access_token_secret=os.getenv('TWITTER_ACCESS_TOKEN_SECRET'),
            wait_on_rate_limit=True
        )
        
        # LinkedIn
        self.linkedin_token = os.getenv('LINKEDIN_COMPANY_ACCESS_TOKEN')
        self.linkedin_person_urn = 'urn:li:person:vlt5EDPS3C'  # Srijan Arya
        
        # OpenAI for content generation
        self.openai_key = os.getenv('OPENAI_API_KEY')
        if self.openai_key:
            openai.api_key = self.openai_key
        
        # Database
        self.db_path = 'data/automated_posts.db'
        self.init_database()
        
    def init_database(self):
        """Initialize database for tracking posts"""
        os.makedirs('data', exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT,
                telegram_id TEXT,
                twitter_id TEXT,
                linkedin_id TEXT,
                status TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                posted_at DATETIME
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def generate_content(self, topic="AI Finance Market Update"):
        """Generate content using OpenAI or use fallback"""
        try:
            if self.openai_key:
                response = openai.ChatCompletion.create(
                    model='gpt-3.5-turbo',
                    messages=[{
                        'role': 'user',
                        'content': f'''Generate a finance market update about {topic}.
                        Keep it under 250 characters for Twitter.
                        Include relevant hashtags.
                        Make it informative and engaging.'''
                    }],
                    max_tokens=100
                )
                return response.choices[0].message.content
        except:
            pass
        
        # Fallback content
        timestamp = datetime.now().strftime('%H:%M %d/%m')
        return f"""📊 AI Finance Market Update - {timestamp}

The markets are showing interesting patterns today. Key sectors to watch: Tech, Finance, and Healthcare.

Stay informed with data-driven insights!

#AIFinance #MarketUpdate #FinTech #DataDriven"""
    
    def post_to_telegram(self, content):
        """Post to Telegram channel"""
        try:
            # Format content for Telegram (HTML)
            telegram_content = f"""<b>🤖 AI Finance Agency Update</b>

{content}

<i>Generated at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</i>

Follow us for more financial insights!
#AIFinance #Automation"""
            
            url = f'https://api.telegram.org/bot{self.telegram_token}/sendMessage'
            payload = {
                'chat_id': self.telegram_channel,
                'text': telegram_content,
                'parse_mode': 'HTML'
            }
            
            response = requests.post(url, json=payload)
            
            if response.status_code == 200 and response.json()['ok']:
                message_id = response.json()['result']['message_id']
                print(f"✅ Telegram: Posted successfully (ID: {message_id})")
                return str(message_id)
            else:
                print(f"❌ Telegram: Failed - {response.json()}")
                return None
                
        except Exception as e:
            print(f"❌ Telegram Error: {e}")
            return None
    
    def post_to_twitter(self, content):
        """Post to Twitter/X"""
        try:
            # Ensure content fits Twitter limit (280 chars)
            if len(content) > 280:
                content = content[:277] + "..."
            
            response = self.twitter_client.create_tweet(text=content)
            
            if response and response.data:
                tweet_id = response.data['id']
                print(f"✅ Twitter: Posted successfully (ID: {tweet_id})")
                return tweet_id
            else:
                print(f"❌ Twitter: Failed to post")
                return None
                
        except Exception as e:
            print(f"❌ Twitter Error: {e}")
            return None
    
    def post_to_linkedin(self, content):
        """Post to LinkedIn personal profile"""
        try:
            headers = {
                'Authorization': f'Bearer {self.linkedin_token}',
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0',
                'LinkedIn-Version': '202401'
            }
            
            # LinkedIn post with more professional formatting
            linkedin_content = f"""{content}

Follow for more AI-powered financial insights and market analysis.

#AIFinance #FinTech #MarketAnalysis #DataDriven #Innovation"""
            
            post_data = {
                "author": self.linkedin_person_urn,
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": linkedin_content
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
                headers=headers,
                json=post_data
            )
            
            if response.status_code == 201:
                post_id = response.json().get('id', 'Unknown')
                print(f"✅ LinkedIn: Posted successfully (ID: {post_id})")
                return post_id
            else:
                print(f"❌ LinkedIn: Failed - {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ LinkedIn Error: {e}")
            return None
    
    def save_post_record(self, content, telegram_id, twitter_id, linkedin_id):
        """Save post record to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        status = 'success' if all([telegram_id, twitter_id, linkedin_id]) else 'partial'
        
        cursor.execute('''
            INSERT INTO posts (content, telegram_id, twitter_id, linkedin_id, status, posted_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (content, telegram_id, twitter_id, linkedin_id, status, datetime.now()))
        
        conn.commit()
        conn.close()
    
    def post_to_all_platforms(self, content=None, topic=None):
        """Main method to post to all platforms"""
        print("\n" + "="*60)
        print("🚀 AUTOMATED POSTING SYSTEM - FULL PIPELINE TEST")
        print("="*60)
        
        # Generate content if not provided
        if not content:
            print("\n📝 Generating content...")
            content = self.generate_content(topic or "AI Finance Market Update")
            print(f"Generated: {content[:100]}...")
        
        print(f"\n📤 Posting to all platforms...")
        print("-"*40)
        
        # Post to each platform
        results = {
            'content': content,
            'timestamp': datetime.now().isoformat(),
            'platforms': {}
        }
        
        # Telegram
        print("\n1️⃣ Posting to Telegram...")
        telegram_id = self.post_to_telegram(content)
        results['platforms']['telegram'] = {
            'success': telegram_id is not None,
            'id': telegram_id
        }
        time.sleep(1)  # Small delay between platforms
        
        # Twitter
        print("\n2️⃣ Posting to Twitter/X...")
        twitter_id = self.post_to_twitter(content)
        results['platforms']['twitter'] = {
            'success': twitter_id is not None,
            'id': twitter_id
        }
        time.sleep(1)
        
        # LinkedIn
        print("\n3️⃣ Posting to LinkedIn...")
        linkedin_id = self.post_to_linkedin(content)
        results['platforms']['linkedin'] = {
            'success': linkedin_id is not None,
            'id': linkedin_id
        }
        
        # Save to database
        self.save_post_record(content, telegram_id, twitter_id, linkedin_id)
        
        # Summary
        print("\n" + "="*60)
        print("📊 POSTING SUMMARY")
        print("="*60)
        
        success_count = sum(1 for p in results['platforms'].values() if p['success'])
        
        for platform, result in results['platforms'].items():
            status = "✅ SUCCESS" if result['success'] else "❌ FAILED"
            print(f"{platform.upper()}: {status}")
            if result['id']:
                print(f"  Post ID: {result['id']}")
        
        print(f"\nOverall: {success_count}/3 platforms successful")
        
        if success_count == 3:
            print("\n🎉 FULL PIPELINE SUCCESS! All platforms posted successfully!")
        elif success_count > 0:
            print(f"\n⚠️ PARTIAL SUCCESS: {success_count} platforms posted")
        else:
            print("\n❌ PIPELINE FAILED: No platforms posted successfully")
        
        print("="*60)
        
        return results
    
    def test_pipeline(self):
        """Test the full content pipeline"""
        test_content = f"""🚀 Automated Pipeline Test - {datetime.now().strftime('%H:%M')}

Testing the AI Finance Agency automated posting system across all platforms.

This demonstrates our end-to-end content distribution capability.

#AIFinance #Automation #Testing"""
        
        return self.post_to_all_platforms(test_content)
    
    def get_posting_stats(self):
        """Get statistics about posted content"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total posts
        cursor.execute('SELECT COUNT(*) FROM posts')
        total = cursor.fetchone()[0]
        
        # Successful posts
        cursor.execute('SELECT COUNT(*) FROM posts WHERE status = "success"')
        successful = cursor.fetchone()[0]
        
        # Today's posts
        cursor.execute('''
            SELECT COUNT(*) FROM posts 
            WHERE DATE(posted_at) = DATE('now')
        ''')
        today = cursor.fetchone()[0]
        
        conn.close()
        
        print("\n📈 POSTING STATISTICS")
        print("-"*40)
        print(f"Total Posts: {total}")
        print(f"Successful: {successful}")
        print(f"Today's Posts: {today}")
        print(f"Success Rate: {(successful/total*100 if total > 0 else 0):.1f}%")

def main():
    """Main execution"""
    system = AutomatedPostingSystem()
    
    print("🤖 AI Finance Agency - Automated Posting System")
    print("="*60)
    
    # Run test
    results = system.test_pipeline()
    
    # Show stats
    system.get_posting_stats()
    
    # Save results
    with open('data/last_pipeline_test.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print("\n✅ Pipeline test complete!")
    print("Results saved to: data/last_pipeline_test.json")

if __name__ == "__main__":
    main()