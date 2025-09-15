#!/usr/bin/env python3
"""
Daily Posting Report and Analytics Generator
Comprehensive analysis of social media performance
"""

import os
import json
import sqlite3
import requests
import tweepy
from datetime import datetime, timedelta
from dotenv import load_dotenv
import matplotlib.pyplot as plt
import seaborn as sns

# Load environment variables
load_dotenv()

class DailyAnalyticsReporter:
    def __init__(self):
        # Database
        self.db_path = 'data/automated_posts.db'
        
        # Platform credentials for analytics
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
    
    def get_daily_posting_stats(self):
        """Get posting statistics for today"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Today's posts
            cursor.execute('''
                SELECT 
                    COUNT(*) as total_posts,
                    COUNT(CASE WHEN telegram_id IS NOT NULL THEN 1 END) as telegram_posts,
                    COUNT(CASE WHEN twitter_id IS NOT NULL THEN 1 END) as twitter_posts,
                    COUNT(CASE WHEN linkedin_id IS NOT NULL THEN 1 END) as linkedin_posts,
                    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_posts
                FROM posts 
                WHERE DATE(posted_at) = DATE('now')
            ''')
            
            today_stats = cursor.fetchone()
            
            # Weekly comparison
            cursor.execute('''
                SELECT 
                    DATE(posted_at) as post_date,
                    COUNT(*) as daily_posts,
                    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_posts
                FROM posts 
                WHERE posted_at > datetime('now', '-7 days')
                GROUP BY DATE(posted_at)
                ORDER BY post_date DESC
            ''')
            
            weekly_stats = cursor.fetchall()
            
            # Platform success rates (last 7 days)
            cursor.execute('''
                SELECT 
                    'telegram' as platform,
                    COUNT(*) as attempts,
                    COUNT(CASE WHEN telegram_id IS NOT NULL THEN 1 END) as successes
                FROM posts 
                WHERE posted_at > datetime('now', '-7 days')
                UNION ALL
                SELECT 
                    'twitter' as platform,
                    COUNT(*) as attempts,
                    COUNT(CASE WHEN twitter_id IS NOT NULL THEN 1 END) as successes
                FROM posts 
                WHERE posted_at > datetime('now', '-7 days')
                UNION ALL
                SELECT 
                    'linkedin' as platform,
                    COUNT(*) as attempts,
                    COUNT(CASE WHEN linkedin_id IS NOT NULL THEN 1 END) as successes
                FROM posts 
                WHERE posted_at > datetime('now', '-7 days')
            ''')
            
            platform_stats = cursor.fetchall()
            
            conn.close()
            
            return {
                'today': {
                    'total_posts': today_stats[0] or 0,
                    'telegram_posts': today_stats[1] or 0,
                    'twitter_posts': today_stats[2] or 0,
                    'linkedin_posts': today_stats[3] or 0,
                    'successful_posts': today_stats[4] or 0
                },
                'weekly': weekly_stats,
                'platform_success_rates': platform_stats
            }
            
        except Exception as e:
            print(f"❌ Database error: {e}")
            return None
    
    def get_engagement_metrics(self):
        """Get engagement metrics where possible"""
        engagement = {}
        
        # Telegram - limited metrics available
        try:
            url = f'https://api.telegram.org/bot{self.telegram_token}/getMe'
            response = requests.get(url)
            if response.status_code == 200:
                bot_info = response.json()['result']
                engagement['telegram'] = {
                    'bot_username': f"@{bot_info['username']}",
                    'status': 'active',
                    'metrics_available': False,
                    'note': 'Telegram Bot API provides limited engagement metrics'
                }
            else:
                engagement['telegram'] = {'status': 'error', 'error': response.text}
        except Exception as e:
            engagement['telegram'] = {'status': 'error', 'error': str(e)}
        
        # Twitter - try to get user metrics
        try:
            if self.twitter_client:
                me = self.twitter_client.get_me(user_fields=['public_metrics'])
                if me and me.data:
                    metrics = me.data.public_metrics
                    engagement['twitter'] = {
                        'username': f"@{me.data.username}",
                        'followers': metrics['followers_count'],
                        'following': metrics['following_count'],
                        'tweet_count': metrics['tweet_count'],
                        'listed_count': metrics['listed_count'],
                        'status': 'active'
                    }
                else:
                    engagement['twitter'] = {'status': 'no_data'}
            else:
                engagement['twitter'] = {'status': 'client_error'}
        except Exception as e:
            engagement['twitter'] = {'status': 'error', 'error': str(e)}
        
        # LinkedIn - basic profile info
        try:
            headers = {
                'Authorization': f'Bearer {self.linkedin_token}',
                'X-Restli-Protocol-Version': '2.0.0'
            }
            
            response = requests.get('https://api.linkedin.com/v2/userinfo', headers=headers)
            if response.status_code == 200:
                user_data = response.json()
                engagement['linkedin'] = {
                    'profile_name': user_data.get('name', 'Unknown'),
                    'email': user_data.get('email', 'Unknown'),
                    'status': 'active',
                    'metrics_available': False,
                    'note': 'LinkedIn API provides limited engagement metrics for personal profiles'
                }
            else:
                engagement['linkedin'] = {'status': 'error', 'error': f'HTTP {response.status_code}'}
        except Exception as e:
            engagement['linkedin'] = {'status': 'error', 'error': str(e)}
        
        return engagement
    
    def calculate_performance_metrics(self, stats):
        """Calculate key performance indicators"""
        if not stats:
            return {}
        
        today = stats['today']
        weekly = stats['weekly']
        
        # Success rate
        overall_success_rate = (today['successful_posts'] / today['total_posts'] * 100) if today['total_posts'] > 0 else 0
        
        # Platform distribution
        platform_distribution = {
            'telegram': today['telegram_posts'],
            'twitter': today['twitter_posts'],
            'linkedin': today['linkedin_posts']
        }
        
        # Weekly average
        weekly_total = sum(day[1] for day in weekly) if weekly else 0
        weekly_avg = weekly_total / len(weekly) if weekly else 0
        
        # Trend analysis
        if len(weekly) >= 2:
            today_count = weekly[0][1] if weekly else 0
            yesterday_count = weekly[1][1] if len(weekly) > 1 else 0
            trend = "📈 Increasing" if today_count > yesterday_count else "📉 Decreasing" if today_count < yesterday_count else "➡️ Stable"
        else:
            trend = "📊 Insufficient data"
        
        return {
            'overall_success_rate': overall_success_rate,
            'platform_distribution': platform_distribution,
            'weekly_average': weekly_avg,
            'trend': trend,
            'total_posts_this_week': weekly_total
        }
    
    def generate_visual_report(self, stats, engagement):
        """Generate visual charts for the report"""
        try:
            # Create output directory
            os.makedirs('data/reports', exist_ok=True)
            
            # Set style
            plt.style.use('seaborn-v0_8')
            fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
            
            # 1. Platform Distribution (Pie Chart)
            platform_data = [
                stats['today']['telegram_posts'],
                stats['today']['twitter_posts'], 
                stats['today']['linkedin_posts']
            ]
            platform_labels = ['Telegram', 'Twitter', 'LinkedIn']
            colors = ['#0088cc', '#1da1f2', '#0077b5']
            
            ax1.pie(platform_data, labels=platform_labels, colors=colors, autopct='%1.1f%%', startangle=90)
            ax1.set_title("Today's Posts by Platform")
            
            # 2. Weekly Posting Trend (Line Chart)
            if stats['weekly']:
                dates = [day[0] for day in stats['weekly'][-7:]]  # Last 7 days
                posts = [day[1] for day in stats['weekly'][-7:]]
                
                ax2.plot(dates, posts, marker='o', linewidth=2, markersize=6)
                ax2.set_title("Weekly Posting Trend")
                ax2.set_xlabel("Date")
                ax2.set_ylabel("Posts")
                ax2.tick_params(axis='x', rotation=45)
            else:
                ax2.text(0.5, 0.5, 'No data available', ha='center', va='center', transform=ax2.transAxes)
                ax2.set_title("Weekly Posting Trend - No Data")
            
            # 3. Platform Success Rates (Bar Chart)
            if stats['platform_success_rates']:
                platforms = [row[0] for row in stats['platform_success_rates']]
                success_rates = [
                    (row[2] / row[1] * 100) if row[1] > 0 else 0 
                    for row in stats['platform_success_rates']
                ]
                
                bars = ax3.bar(platforms, success_rates, color=['#0088cc', '#1da1f2', '#0077b5'])
                ax3.set_title("Platform Success Rates (7 days)")
                ax3.set_ylabel("Success Rate (%)")
                ax3.set_ylim(0, 100)
                
                # Add value labels on bars
                for bar, rate in zip(bars, success_rates):
                    height = bar.get_height()
                    ax3.text(bar.get_x() + bar.get_width()/2., height + 1,
                            f'{rate:.1f}%', ha='center', va='bottom')
            else:
                ax3.text(0.5, 0.5, 'No data available', ha='center', va='center', transform=ax3.transAxes)
                ax3.set_title("Platform Success Rates - No Data")
            
            # 4. Engagement Summary (Text)
            ax4.axis('off')
            engagement_text = "📊 ENGAGEMENT OVERVIEW\n\n"
            
            for platform, data in engagement.items():
                if data.get('status') == 'active':
                    if platform == 'twitter' and 'followers' in data:
                        engagement_text += f"🐦 Twitter: {data['followers']} followers\n"
                    elif platform == 'linkedin':
                        engagement_text += f"💼 LinkedIn: {data['profile_name']}\n"
                    elif platform == 'telegram':
                        engagement_text += f"📱 Telegram: {data['bot_username']}\n"
                else:
                    engagement_text += f"❌ {platform.title()}: {data.get('status', 'Unknown')}\n"
            
            ax4.text(0.1, 0.8, engagement_text, transform=ax4.transAxes, 
                    fontsize=12, verticalalignment='top', fontfamily='monospace')
            
            plt.tight_layout()
            
            # Save chart
            chart_file = f'data/reports/daily_analytics_{datetime.now().strftime("%Y%m%d")}.png'
            plt.savefig(chart_file, dpi=300, bbox_inches='tight')
            plt.close()
            
            print(f"📊 Visual report saved: {chart_file}")
            return chart_file
            
        except Exception as e:
            print(f"⚠️ Could not generate visual report: {e}")
            return None
    
    def generate_daily_report(self):
        """Generate comprehensive daily analytics report"""
        print("📊 AI FINANCE AGENCY - DAILY ANALYTICS REPORT")
        print("="*60)
        print(f"Report Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
        
        # Get data
        stats = self.get_daily_posting_stats()
        engagement = self.get_engagement_metrics()
        
        if not stats:
            print("❌ Could not generate report - database issues")
            return None
        
        performance = self.calculate_performance_metrics(stats)
        
        # Display report
        print("\n📈 TODAY'S POSTING SUMMARY")
        print("-"*40)
        print(f"Total Posts: {stats['today']['total_posts']}")
        print(f"Successful Posts: {stats['today']['successful_posts']}")
        print(f"Success Rate: {performance['overall_success_rate']:.1f}%")
        
        print(f"\n📱 Platform Breakdown:")
        print(f"  Telegram: {stats['today']['telegram_posts']} posts")
        print(f"  Twitter: {stats['today']['twitter_posts']} posts")
        print(f"  LinkedIn: {stats['today']['linkedin_posts']} posts")
        
        print(f"\n📊 WEEKLY ANALYSIS")
        print("-"*40)
        print(f"Weekly Average: {performance['weekly_average']:.1f} posts/day")
        print(f"Total This Week: {performance['total_posts_this_week']} posts")
        print(f"Trend: {performance['trend']}")
        
        if stats['weekly']:
            print(f"\nRecent Daily Counts:")
            for date, count, success in stats['weekly'][:5]:  # Last 5 days
                success_rate = (success / count * 100) if count > 0 else 0
                print(f"  {date}: {count} posts ({success_rate:.1f}% success)")
        
        print(f"\n🎯 PLATFORM HEALTH")
        print("-"*40)
        
        for platform, data in engagement.items():
            if data.get('status') == 'active':
                print(f"✅ {platform.title()}: Healthy")
                if platform == 'twitter' and 'followers' in data:
                    print(f"   Followers: {data['followers']:,}")
                elif platform == 'linkedin':
                    print(f"   Profile: {data['profile_name']}")
                elif platform == 'telegram':
                    print(f"   Bot: {data['bot_username']}")
            else:
                status = data.get('status', 'Unknown')
                print(f"❌ {platform.title()}: {status}")
        
        # Generate recommendations
        print(f"\n💡 RECOMMENDATIONS")
        print("-"*40)
        
        if performance['overall_success_rate'] < 80:
            print("• Investigate posting failures")
            print("• Check API credentials and rate limits")
        
        if stats['today']['total_posts'] < 3:
            print("• Consider increasing posting frequency")
            print("• Schedule more content throughout the day")
        
        if performance['weekly_average'] < 5:
            print("• Weekly posting volume is low")
            print("• Consider automating more content")
        
        # Platform-specific recommendations
        failed_platforms = [p for p, data in engagement.items() if data.get('status') != 'active']
        if failed_platforms:
            print(f"• Fix issues with: {', '.join(failed_platforms)}")
        
        print("• Continue monitoring daily analytics")
        print("• Maintain content quality standards")
        
        # Generate visual report
        chart_file = self.generate_visual_report(stats, engagement)
        
        # Save JSON report
        report_data = {
            'report_date': datetime.now().isoformat(),
            'stats': stats,
            'performance': performance,
            'engagement': engagement,
            'chart_file': chart_file
        }
        
        json_file = f'data/reports/daily_report_{datetime.now().strftime("%Y%m%d")}.json'
        os.makedirs('data/reports', exist_ok=True)
        
        with open(json_file, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"\n📄 Report saved: {json_file}")
        if chart_file:
            print(f"📊 Charts saved: {chart_file}")
        
        print("\n✅ Daily analytics report complete!")
        
        return report_data

def main():
    """Main execution"""
    reporter = DailyAnalyticsReporter()
    reporter.generate_daily_report()

if __name__ == "__main__":
    main()