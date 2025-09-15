#!/usr/bin/env python3
"""
Platform Health Check Script
Comprehensive health monitoring for all social media platforms
"""

import os
import json
import requests
import tweepy
import sqlite3
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class PlatformHealthChecker:
    def __init__(self):
        # Platform credentials
        self.telegram_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.linkedin_token = os.getenv('LINKEDIN_COMPANY_ACCESS_TOKEN')
        
        # Twitter client
        try:
            self.twitter_client = tweepy.Client(
                bearer_token=os.getenv('TWITTER_BEARER_TOKEN'),
                consumer_key=os.getenv('TWITTER_CONSUMER_KEY'),
                consumer_secret=os.getenv('TWITTER_CONSUMER_SECRET'),
                access_token=os.getenv('TWITTER_ACCESS_TOKEN'),
                access_token_secret=os.getenv('TWITTER_ACCESS_TOKEN_SECRET'),
                wait_on_rate_limit=True
            )
        except:
            self.twitter_client = None
        
        # Database
        self.db_path = 'data/automated_posts.db'
        
        # Health status thresholds
        self.thresholds = {
            'max_failures_24h': 3,
            'min_success_rate_7d': 80.0,
            'max_response_time_ms': 5000,
            'token_expiry_warning_days': 7
        }
    
    def check_telegram_health(self):
        """Check Telegram Bot API health"""
        health_data = {
            'platform': 'telegram',
            'timestamp': datetime.now().isoformat(),
            'status': 'unknown',
            'response_time_ms': None,
            'details': {}
        }
        
        if not self.telegram_token:
            health_data['status'] = 'error'
            health_data['details']['error'] = 'Missing bot token'
            return health_data
        
        try:
            start_time = datetime.now()
            
            # Test bot info endpoint
            url = f'https://api.telegram.org/bot{self.telegram_token}/getMe'
            response = requests.get(url, timeout=10)
            
            end_time = datetime.now()
            response_time = (end_time - start_time).total_seconds() * 1000
            health_data['response_time_ms'] = round(response_time, 2)
            
            if response.status_code == 200:
                bot_info = response.json()
                if bot_info['ok']:
                    health_data['status'] = 'healthy'
                    health_data['details'] = {
                        'bot_username': f"@{bot_info['result']['username']}",
                        'bot_id': bot_info['result']['id'],
                        'can_join_groups': bot_info['result'].get('can_join_groups', False),
                        'can_read_all_group_messages': bot_info['result'].get('can_read_all_group_messages', False)
                    }
                else:
                    health_data['status'] = 'error'
                    health_data['details']['error'] = bot_info.get('description', 'Unknown error')
            else:
                health_data['status'] = 'error'
                health_data['details']['error'] = f'HTTP {response.status_code}: {response.text}'
                
        except requests.exceptions.Timeout:
            health_data['status'] = 'timeout'
            health_data['details']['error'] = 'Request timeout (>10s)'
        except Exception as e:
            health_data['status'] = 'error'
            health_data['details']['error'] = str(e)
        
        return health_data
    
    def check_twitter_health(self):
        """Check Twitter API health"""
        health_data = {
            'platform': 'twitter',
            'timestamp': datetime.now().isoformat(),
            'status': 'unknown',
            'response_time_ms': None,
            'details': {}
        }
        
        if not self.twitter_client:
            health_data['status'] = 'error'
            health_data['details']['error'] = 'Twitter client not initialized'
            return health_data
        
        try:
            start_time = datetime.now()
            
            # Test with get_me endpoint
            me = self.twitter_client.get_me(user_fields=['public_metrics'])
            
            end_time = datetime.now()
            response_time = (end_time - start_time).total_seconds() * 1000
            health_data['response_time_ms'] = round(response_time, 2)
            
            if me and me.data:
                health_data['status'] = 'healthy'
                metrics = me.data.public_metrics
                health_data['details'] = {
                    'username': f"@{me.data.username}",
                    'user_id': me.data.id,
                    'followers_count': metrics['followers_count'],
                    'following_count': metrics['following_count'],
                    'tweet_count': metrics['tweet_count'],
                    'verified': getattr(me.data, 'verified', False)
                }
            else:
                health_data['status'] = 'error'
                health_data['details']['error'] = 'No user data returned'
                
        except Exception as e:
            health_data['status'] = 'error'
            health_data['details']['error'] = str(e)
            
            # Check for specific error types
            error_str = str(e).lower()
            if 'rate limit' in error_str:
                health_data['status'] = 'rate_limited'
            elif 'unauthorized' in error_str:
                health_data['status'] = 'unauthorized'
            elif 'timeout' in error_str:
                health_data['status'] = 'timeout'
        
        return health_data
    
    def check_linkedin_health(self):
        """Check LinkedIn API health"""
        health_data = {
            'platform': 'linkedin',
            'timestamp': datetime.now().isoformat(),
            'status': 'unknown',
            'response_time_ms': None,
            'details': {}
        }
        
        if not self.linkedin_token:
            health_data['status'] = 'error'
            health_data['details']['error'] = 'Missing access token'
            return health_data
        
        try:
            start_time = datetime.now()
            
            headers = {
                'Authorization': f'Bearer {self.linkedin_token}',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            # Test userinfo endpoint
            response = requests.get('https://api.linkedin.com/v2/userinfo', 
                                  headers=headers, timeout=10)
            
            end_time = datetime.now()
            response_time = (end_time - start_time).total_seconds() * 1000
            health_data['response_time_ms'] = round(response_time, 2)
            
            if response.status_code == 200:
                user_data = response.json()
                health_data['status'] = 'healthy'
                health_data['details'] = {
                    'profile_name': user_data.get('name', 'Unknown'),
                    'email': user_data.get('email', 'Unknown'),
                    'locale': user_data.get('locale', {}).get('language', 'Unknown'),
                    'token_expires': 'November 10, 2025'  # Known expiry date
                }
            elif response.status_code == 401:
                health_data['status'] = 'unauthorized'
                health_data['details']['error'] = 'Token expired or invalid'
            else:
                health_data['status'] = 'error'
                health_data['details']['error'] = f'HTTP {response.status_code}: {response.text}'
                
        except requests.exceptions.Timeout:
            health_data['status'] = 'timeout'
            health_data['details']['error'] = 'Request timeout (>10s)'
        except Exception as e:
            health_data['status'] = 'error'
            health_data['details']['error'] = str(e)
        
        return health_data
    
    def check_database_health(self):
        """Check database connectivity and data integrity"""
        health_data = {
            'platform': 'database',
            'timestamp': datetime.now().isoformat(),
            'status': 'unknown',
            'response_time_ms': None,
            'details': {}
        }
        
        try:
            start_time = datetime.now()
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Test basic connectivity
            cursor.execute("SELECT 1")
            cursor.fetchone()
            
            # Check table structure
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            
            # Get recent posts count
            cursor.execute("SELECT COUNT(*) FROM posts WHERE posted_at > datetime('now', '-24 hours')")
            recent_posts = cursor.fetchone()[0]
            
            # Check for any failed posts in last 24h
            cursor.execute("""
                SELECT COUNT(*) FROM posts 
                WHERE posted_at > datetime('now', '-24 hours') 
                AND status != 'success'
            """)
            failed_posts = cursor.fetchone()[0]
            
            conn.close()
            
            end_time = datetime.now()
            response_time = (end_time - start_time).total_seconds() * 1000
            health_data['response_time_ms'] = round(response_time, 2)
            
            health_data['status'] = 'healthy'
            health_data['details'] = {
                'database_file': self.db_path,
                'tables_found': tables,
                'recent_posts_24h': recent_posts,
                'failed_posts_24h': failed_posts,
                'database_accessible': True
            }
            
            # Warning if too many failures
            if failed_posts > self.thresholds['max_failures_24h']:
                health_data['status'] = 'warning'
                health_data['details']['warning'] = f'High failure rate: {failed_posts} failed posts in 24h'
                
        except Exception as e:
            health_data['status'] = 'error'
            health_data['details']['error'] = str(e)
        
        return health_data
    
    def get_posting_success_rates(self):
        """Get success rates for each platform over last 7 days"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get platform-specific success rates
            cursor.execute("""
                SELECT 
                    'telegram' as platform,
                    COUNT(*) as total_attempts,
                    COUNT(CASE WHEN telegram_id IS NOT NULL THEN 1 END) as successes
                FROM posts 
                WHERE posted_at > datetime('now', '-7 days')
                UNION ALL
                SELECT 
                    'twitter' as platform,
                    COUNT(*) as total_attempts,
                    COUNT(CASE WHEN twitter_id IS NOT NULL THEN 1 END) as successes
                FROM posts 
                WHERE posted_at > datetime('now', '-7 days')
                UNION ALL
                SELECT 
                    'linkedin' as platform,
                    COUNT(*) as total_attempts,
                    COUNT(CASE WHEN linkedin_id IS NOT NULL THEN 1 END) as successes
                FROM posts 
                WHERE posted_at > datetime('now', '-7 days')
            """)
            
            results = cursor.fetchall()
            conn.close()
            
            success_rates = {}
            for platform, total, successes in results:
                if total > 0:
                    rate = (successes / total) * 100
                    success_rates[platform] = {
                        'success_rate_percent': round(rate, 1),
                        'total_attempts': total,
                        'successful_posts': successes,
                        'status': 'healthy' if rate >= self.thresholds['min_success_rate_7d'] else 'warning'
                    }
                else:
                    success_rates[platform] = {
                        'success_rate_percent': 0,
                        'total_attempts': 0,
                        'successful_posts': 0,
                        'status': 'no_data'
                    }
            
            return success_rates
            
        except Exception as e:
            return {'error': str(e)}
    
    def run_comprehensive_health_check(self):
        """Run complete health check on all platforms"""
        print("🏥 AI FINANCE AGENCY - PLATFORM HEALTH CHECK")
        print("=" * 60)
        print(f"Health Check Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        # Run all health checks
        health_results = {
            'timestamp': datetime.now().isoformat(),
            'platforms': {},
            'overall_status': 'unknown',
            'summary': {}
        }
        
        print("\n🔍 PLATFORM API HEALTH")
        print("-" * 40)
        
        # Check each platform
        platforms = [
            ('telegram', self.check_telegram_health),
            ('twitter', self.check_twitter_health),
            ('linkedin', self.check_linkedin_health),
            ('database', self.check_database_health)
        ]
        
        healthy_count = 0
        warning_count = 0
        error_count = 0
        
        for platform_name, check_function in platforms:
            result = check_function()
            health_results['platforms'][platform_name] = result
            
            status = result['status']
            response_time = result.get('response_time_ms', 'N/A')
            
            # Status icons
            if status == 'healthy':
                icon = "✅"
                healthy_count += 1
            elif status in ['warning', 'rate_limited']:
                icon = "⚠️"
                warning_count += 1
            else:
                icon = "❌"
                error_count += 1
            
            print(f"{icon} {platform_name.capitalize()}: {status.upper()}")
            if response_time != 'N/A':
                print(f"   Response time: {response_time}ms")
            
            if 'error' in result['details']:
                print(f"   Error: {result['details']['error']}")
            elif status == 'healthy' and 'username' in result['details']:
                username = result['details'].get('username', result['details'].get('bot_username', ''))
                print(f"   Account: {username}")
        
        # Overall status
        if error_count == 0 and warning_count == 0:
            overall_status = "healthy"
        elif error_count == 0:
            overall_status = "warning"
        else:
            overall_status = "critical"
        
        health_results['overall_status'] = overall_status
        
        print(f"\n📊 POSTING SUCCESS RATES (7 days)")
        print("-" * 40)
        
        # Get success rates
        success_rates = self.get_posting_success_rates()
        health_results['success_rates'] = success_rates
        
        if 'error' not in success_rates:
            for platform, data in success_rates.items():
                rate = data['success_rate_percent']
                total = data['total_attempts']
                status = data['status']
                
                if status == 'healthy':
                    icon = "✅"
                elif status == 'warning':
                    icon = "⚠️"
                else:
                    icon = "📊"
                
                print(f"{icon} {platform.capitalize()}: {rate}% ({data['successful_posts']}/{total})")
        
        print(f"\n🎯 HEALTH SUMMARY")
        print("-" * 40)
        print(f"Overall Status: {overall_status.upper()}")
        print(f"Healthy Platforms: {healthy_count}/4")
        print(f"Warnings: {warning_count}")
        print(f"Errors: {error_count}")
        
        # Recommendations
        print(f"\n💡 RECOMMENDATIONS")
        print("-" * 40)
        
        recommendations = []
        
        if error_count > 0:
            recommendations.append("🔴 URGENT: Fix platform errors immediately")
            recommendations.append("• Check API credentials and permissions")
            recommendations.append("• Verify network connectivity")
        
        if warning_count > 0:
            recommendations.append("🟡 ATTENTION: Address warnings to prevent issues")
        
        # Check specific issues
        for platform_name, result in health_results['platforms'].items():
            if result['status'] == 'unauthorized':
                recommendations.append(f"• Renew {platform_name} credentials")
            elif result['status'] == 'rate_limited':
                recommendations.append(f"• Reduce {platform_name} posting frequency")
            elif result.get('response_time_ms', 0) > self.thresholds['max_response_time_ms']:
                recommendations.append(f"• Monitor {platform_name} API performance")
        
        if not recommendations:
            recommendations.append("✅ All systems operating normally")
            recommendations.append("• Continue regular monitoring")
            recommendations.append("• Maintain current posting schedule")
        
        for rec in recommendations:
            print(rec)
        
        health_results['recommendations'] = recommendations
        
        # Save health report
        os.makedirs('data/health_reports', exist_ok=True)
        report_file = f'data/health_reports/health_check_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
        
        with open(report_file, 'w') as f:
            json.dump(health_results, f, indent=2)
        
        print(f"\n📄 Health report saved: {report_file}")
        print(f"\n{'='*60}")
        
        return health_results
    
    def quick_health_check(self):
        """Quick health check with minimal output"""
        results = {}
        
        # Quick checks
        telegram = self.check_telegram_health()
        twitter = self.check_twitter_health()
        linkedin = self.check_linkedin_health()
        database = self.check_database_health()
        
        results = {
            'telegram': telegram['status'],
            'twitter': twitter['status'],
            'linkedin': linkedin['status'],
            'database': database['status']
        }
        
        # Overall health
        statuses = list(results.values())
        if all(s == 'healthy' for s in statuses):
            overall = "🟢 ALL SYSTEMS HEALTHY"
        elif any(s in ['error', 'critical'] for s in statuses):
            overall = "🔴 SYSTEM ERRORS DETECTED"
        else:
            overall = "🟡 WARNINGS PRESENT"
        
        print(f"Platform Health: {overall}")
        for platform, status in results.items():
            icon = "✅" if status == 'healthy' else "⚠️" if status == 'warning' else "❌"
            print(f"  {icon} {platform.capitalize()}: {status}")
        
        return results

def main():
    """Main execution"""
    checker = PlatformHealthChecker()
    
    print("Select health check mode:")
    print("1. Comprehensive health check")
    print("2. Quick health check")
    
    try:
        choice = input("\nEnter choice (1-2): ").strip()
        
        if choice == '1':
            checker.run_comprehensive_health_check()
        elif choice == '2':
            checker.quick_health_check()
        else:
            print("Invalid choice. Running comprehensive check...")
            checker.run_comprehensive_health_check()
            
    except KeyboardInterrupt:
        print("\n\nHealth check cancelled by user")

if __name__ == "__main__":
    main()