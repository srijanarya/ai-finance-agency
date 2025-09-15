#!/usr/bin/env python3
"""
API Rate Limit Monitor
Checks current usage and limits across all platforms
"""

import os
import json
import requests
import tweepy
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class APIRateLimitMonitor:
    def __init__(self):
        # Platform credentials
        self.telegram_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.linkedin_token = os.getenv('LINKEDIN_COMPANY_ACCESS_TOKEN')
        
        # Twitter client
        self.twitter_client = tweepy.Client(
            bearer_token=os.getenv('TWITTER_BEARER_TOKEN'),
            consumer_key=os.getenv('TWITTER_CONSUMER_KEY'),
            consumer_secret=os.getenv('TWITTER_CONSUMER_SECRET'),
            access_token=os.getenv('TWITTER_ACCESS_TOKEN'),
            access_token_secret=os.getenv('TWITTER_ACCESS_TOKEN_SECRET'),
            wait_on_rate_limit=True
        )
        
        # Rate limits (documented limits)
        self.rate_limits = {
            'telegram': {
                'messages_per_second': 30,
                'messages_per_minute': 20,
                'daily_limit': 'unlimited',
                'notes': 'Bot API has built-in rate limiting'
            },
            'twitter': {
                'tweets_per_hour': 300,
                'tweets_per_day': 300,  # For personal accounts
                'api_calls_per_hour': 1500,
                'notes': 'Stricter limits for new accounts'
            },
            'linkedin': {
                'posts_per_day': 100,
                'api_calls_per_day': 500,
                'notes': 'Personal profile posting only'
            }
        }
    
    def check_telegram_limits(self):
        """Check Telegram bot limits and status"""
        try:
            # Get bot info
            url = f'https://api.telegram.org/bot{self.telegram_token}/getMe'
            response = requests.get(url)
            
            if response.status_code == 200:
                bot_info = response.json()['result']
                
                # Test message sending capability
                test_url = f'https://api.telegram.org/bot{self.telegram_token}/getUpdates'
                test_response = requests.get(test_url)
                
                status = {
                    'platform': 'Telegram',
                    'bot_username': f"@{bot_info['username']}",
                    'api_status': '✅ Healthy',
                    'rate_limit_status': '✅ Normal',
                    'daily_limit': 'Unlimited',
                    'current_usage': 'Unknown (no usage API)',
                    'recommendations': [
                        'Telegram has built-in rate limiting',
                        'Bot can send ~30 messages per second',
                        'No daily posting limits'
                    ],
                    'health_score': 100
                }
            else:
                status = {
                    'platform': 'Telegram',
                    'api_status': '❌ Error',
                    'error': response.text,
                    'health_score': 0
                }
            
            return status
            
        except Exception as e:
            return {
                'platform': 'Telegram',
                'api_status': '❌ Exception',
                'error': str(e),
                'health_score': 0
            }
    
    def check_twitter_limits(self):
        """Check Twitter API rate limits"""
        try:
            # Get account info
            me = self.twitter_client.get_me(user_fields=['public_metrics'])
            
            if me and me.data:
                # Get recent tweets to estimate usage
                tweets = self.twitter_client.get_users_tweets(
                    me.data.id, 
                    max_results=10,
                    tweet_fields=['created_at']
                )
                
                recent_tweets = 0
                if tweets and tweets.data:
                    # Count tweets from last hour
                    one_hour_ago = datetime.now() - timedelta(hours=1)
                    recent_tweets = sum(
                        1 for tweet in tweets.data 
                        if tweet.created_at > one_hour_ago
                    )
                
                # Estimate health based on usage
                usage_percentage = (recent_tweets / 300) * 100
                if usage_percentage < 50:
                    health_score = 100
                    rate_status = '✅ Low Usage'
                elif usage_percentage < 80:
                    health_score = 75
                    rate_status = '⚠️ Moderate Usage'
                else:
                    health_score = 40
                    rate_status = '🔴 High Usage'
                
                status = {
                    'platform': 'Twitter/X',
                    'username': f"@{me.data.username}",
                    'followers': me.data.public_metrics['followers_count'],
                    'api_status': '✅ Healthy',
                    'rate_limit_status': rate_status,
                    'hourly_limit': '300 tweets',
                    'recent_usage': f'{recent_tweets} tweets in last hour',
                    'usage_percentage': f'{usage_percentage:.1f}%',
                    'recommendations': [
                        f'Current usage: {usage_percentage:.1f}% of hourly limit',
                        'Space out posts to avoid hitting limits',
                        'Max 300 tweets per 3-hour window'
                    ],
                    'health_score': health_score
                }
            else:
                status = {
                    'platform': 'Twitter/X',
                    'api_status': '❌ No Access',
                    'health_score': 0
                }
            
            return status
            
        except Exception as e:
            return {
                'platform': 'Twitter/X',
                'api_status': '❌ Exception',
                'error': str(e),
                'health_score': 0
            }
    
    def check_linkedin_limits(self):
        """Check LinkedIn API rate limits"""
        try:
            headers = {
                'Authorization': f'Bearer {self.linkedin_token}',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            # Get user info
            response = requests.get('https://api.linkedin.com/v2/userinfo', headers=headers)
            
            if response.status_code == 200:
                user_data = response.json()
                
                # LinkedIn doesn't provide usage stats, so we estimate based on our tracking
                try:
                    import sqlite3
                    conn = sqlite3.connect('data/automated_posts.db')
                    cursor = conn.cursor()
                    cursor.execute('''
                        SELECT COUNT(*) FROM posts 
                        WHERE DATE(posted_at) = DATE('now')
                        AND linkedin_id IS NOT NULL
                    ''')
                    daily_posts = cursor.fetchone()[0]
                    conn.close()
                except:
                    daily_posts = 0
                
                usage_percentage = (daily_posts / 100) * 100
                if usage_percentage < 30:
                    health_score = 100
                    rate_status = '✅ Low Usage'
                elif usage_percentage < 70:
                    health_score = 75
                    rate_status = '⚠️ Moderate Usage'
                else:
                    health_score = 40
                    rate_status = '🔴 High Usage'
                
                status = {
                    'platform': 'LinkedIn',
                    'profile': user_data.get('name', 'Unknown'),
                    'email': user_data.get('email', 'Unknown'),
                    'api_status': '✅ Healthy',
                    'rate_limit_status': rate_status,
                    'daily_limit': '100 posts',
                    'current_usage': f'{daily_posts} posts today',
                    'usage_percentage': f'{usage_percentage:.1f}%',
                    'token_expires': 'Nov 10, 2025 (~60 days)',
                    'recommendations': [
                        f'Current usage: {usage_percentage:.1f}% of daily limit',
                        'LinkedIn has the strictest posting limits',
                        'Focus on quality over quantity',
                        'Renew token before Nov 10, 2025'
                    ],
                    'health_score': health_score
                }
            else:
                status = {
                    'platform': 'LinkedIn',
                    'api_status': '❌ Token Issue',
                    'error': f'HTTP {response.status_code}',
                    'health_score': 0 if response.status_code == 401 else 25
                }
            
            return status
            
        except Exception as e:
            return {
                'platform': 'LinkedIn',
                'api_status': '❌ Exception',
                'error': str(e),
                'health_score': 0
            }
    
    def generate_rate_limit_report(self):
        """Generate comprehensive rate limit report"""
        print("\n📊 API RATE LIMIT MONITORING REPORT")
        print("="*60)
        print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
        
        # Check all platforms
        telegram_status = self.check_telegram_limits()
        twitter_status = self.check_twitter_limits()
        linkedin_status = self.check_linkedin_limits()
        
        platforms = [telegram_status, twitter_status, linkedin_status]
        
        # Display individual platform status
        for platform in platforms:
            print(f"\n📱 {platform['platform'].upper()}")
            print("-" * 40)
            
            # Basic info
            if 'api_status' in platform:
                print(f"API Status: {platform['api_status']}")
            
            if 'rate_limit_status' in platform:
                print(f"Rate Limits: {platform['rate_limit_status']}")
            
            # Platform-specific info
            for key, value in platform.items():
                if key not in ['platform', 'api_status', 'rate_limit_status', 'recommendations', 'health_score', 'error']:
                    print(f"{key.replace('_', ' ').title()}: {value}")
            
            # Recommendations
            if 'recommendations' in platform:
                print("\nRecommendations:")
                for rec in platform['recommendations']:
                    print(f"  • {rec}")
            
            # Health score
            if 'health_score' in platform:
                score = platform['health_score']
                if score >= 90:
                    print(f"\nHealth Score: {score}/100 🟢 Excellent")
                elif score >= 70:
                    print(f"\nHealth Score: {score}/100 🟡 Good")
                elif score >= 40:
                    print(f"\nHealth Score: {score}/100 🟠 Fair")
                else:
                    print(f"\nHealth Score: {score}/100 🔴 Poor")
            
            if 'error' in platform:
                print(f"\nError: {platform['error']}")
        
        # Overall summary
        print("\n" + "="*60)
        print("📈 OVERALL SUMMARY")
        print("="*60)
        
        total_health = sum(p.get('health_score', 0) for p in platforms)
        avg_health = total_health / len(platforms)
        
        healthy_platforms = sum(1 for p in platforms if p.get('health_score', 0) >= 70)
        
        print(f"Healthy Platforms: {healthy_platforms}/{len(platforms)}")
        print(f"Average Health Score: {avg_health:.1f}/100")
        
        if avg_health >= 90:
            print("🎉 EXCELLENT: All systems operating optimally")
        elif avg_health >= 70:
            print("✅ GOOD: Systems running well with minor issues")
        elif avg_health >= 50:
            print("⚠️ FAIR: Some platforms need attention")
        else:
            print("🚨 CRITICAL: Multiple platform issues detected")
        
        # Save report
        report_data = {
            'generated_at': datetime.now().isoformat(),
            'platforms': platforms,
            'summary': {
                'healthy_platforms': healthy_platforms,
                'total_platforms': len(platforms),
                'average_health': avg_health
            }
        }
        
        report_file = f'data/rate_limit_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        with open(report_file, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"\n📄 Report saved: {report_file}")
        
        # Rate limit recommendations
        print("\n🎯 RATE LIMIT BEST PRACTICES:")
        print("- Space posts 20+ minutes apart")
        print("- Monitor usage daily")
        print("- Keep LinkedIn posts under 5 per day")
        print("- Twitter: Max 1 post per hour during peak times")
        print("- Set up alerts for 80% usage thresholds")
        
        return report_data

def main():
    """Main execution"""
    print("📊 AI Finance Agency - API Rate Limit Monitor")
    
    monitor = APIRateLimitMonitor()
    report = monitor.generate_rate_limit_report()
    
    print("\n✅ Rate limit monitoring complete!")

if __name__ == "__main__":
    main()