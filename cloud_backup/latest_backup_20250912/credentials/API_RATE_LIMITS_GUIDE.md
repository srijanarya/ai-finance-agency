# 📊 API Rate Limits & Best Practices Guide
**AI Finance Agency - Social Media Automation**

## 🎯 Quick Reference

| Platform | Daily Limit | Hourly Limit | Best Practice |
|----------|-------------|--------------|---------------|
| 📱 **Telegram** | Unlimited | 30 msg/sec | Built-in limiting ✅ |
| 🐦 **Twitter/X** | 300 tweets | 300/3hrs | Space 20+ min apart |
| 💼 **LinkedIn** | 100 posts | No limit | Max 5 posts/day |

---

## 📱 TELEGRAM RATE LIMITS

### Official Limits
- **Messages per second**: 30 (bot API)
- **Daily limit**: No restrictions
- **Flood control**: Built into Bot API

### Current Usage
- ✅ **Status**: Healthy
- **Bot**: @AIFinanceAgencyBot  
- **Channel**: @AIFinanceNews2024
- **Daily posts**: No tracking needed

### Best Practices
```python
# Telegram posting (no rate limiting needed)
def post_to_telegram(content):
    # Telegram handles rate limiting automatically
    # Just post and let the API manage the flow
    pass
```

### Recommendations
- ✅ No rate limiting code needed
- ✅ Telegram Bot API handles all throttling
- ✅ Can post as frequently as needed
- ⚠️ Avoid spam-like behavior for user experience

---

## 🐦 TWITTER/X RATE LIMITS

### Official Limits (API v2)
- **Tweets per 3-hour window**: 300
- **Tweets per day**: 300 (rolling window)
- **API calls per hour**: 1,500
- **Tweet creation**: 300 per 15-minute window

### Current Usage Analysis
- ⚠️ **Status**: API connection issues detected
- **Account**: @aryasrijan
- **Recent issues**: 404 errors on tweet verification

### Rate Limiting Strategy
```python
import time
from datetime import datetime, timedelta

class TwitterRateLimiter:
    def __init__(self):
        self.last_post_time = None
        self.posts_in_window = []
        self.window_minutes = 180  # 3 hours
        
    def can_post(self):
        now = datetime.now()
        
        # Remove posts older than 3 hours
        cutoff = now - timedelta(minutes=self.window_minutes)
        self.posts_in_window = [
            post_time for post_time in self.posts_in_window 
            if post_time > cutoff
        ]
        
        # Check if under limit
        return len(self.posts_in_window) < 300
    
    def wait_time_needed(self):
        if self.last_post_time:
            elapsed = (datetime.now() - self.last_post_time).total_seconds()
            min_interval = 20 * 60  # 20 minutes between posts
            if elapsed < min_interval:
                return min_interval - elapsed
        return 0
```

### Best Practices
- 🕐 **Minimum interval**: 20 minutes between tweets
- 📊 **Daily target**: 5-10 tweets maximum
- ⏰ **Peak hours**: Avoid 9-11 AM IST (high activity)
- 🔄 **Error handling**: Always check API responses

### Troubleshooting
```bash
# Check Twitter API status
python3 -c "
import tweepy, os
from dotenv import load_dotenv
load_dotenv()
client = tweepy.Client(bearer_token=os.getenv('TWITTER_BEARER_TOKEN'))
print('API Status:', client.get_me())
"
```

---

## 💼 LINKEDIN RATE LIMITS

### Official Limits (Personal Profile)
- **Posts per day**: 100 (theoretical maximum)
- **API calls per day**: 500
- **Recommended posting**: 1-3 posts per day
- **Token expiry**: 60 days (refresh needed)

### Current Usage
- ✅ **Status**: Healthy
- **Profile**: Srijan Arya (srijanaryay@gmail.com)
- **Daily usage**: 2/100 posts (2.0%)
- **Token expires**: November 10, 2025

### Rate Limiting Implementation
```python
import sqlite3
from datetime import datetime, date

def check_linkedin_daily_limit():
    conn = sqlite3.connect('data/automated_posts.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT COUNT(*) FROM posts 
        WHERE DATE(posted_at) = DATE('now')
        AND linkedin_id IS NOT NULL
    ''')
    
    daily_posts = cursor.fetchone()[0]
    conn.close()
    
    # Conservative limit: 5 posts per day
    return daily_posts < 5

def should_skip_linkedin_post():
    """Skip LinkedIn posting on weekends and holidays"""
    today = datetime.now()
    
    # Skip weekends
    if today.weekday() >= 5:  # Saturday=5, Sunday=6
        return True
    
    # Skip after market hours (after 4 PM IST)
    if today.hour >= 16:
        return True
        
    return False
```

### Best Practices
- 📅 **Frequency**: Maximum 5 posts per day
- 🕐 **Timing**: Business hours only (9 AM - 4 PM IST)
- 📝 **Content**: Professional, high-quality posts
- 🔄 **Token renewal**: Set reminder for November 3, 2025

### Professional Guidelines
- Quality over quantity
- Avoid repetitive content
- Focus on valuable insights
- Engage with your network

---

## 🎯 OVERALL BEST PRACTICES

### Posting Schedule Optimization
```python
# Recommended posting times (IST)
OPTIMAL_POSTING_SCHEDULE = {
    'telegram': {
        'frequency': 'Multiple times daily',
        'best_times': ['09:00', '11:30', '14:00', '16:30', '19:00'],
        'avoid': []  # No restrictions
    },
    'twitter': {
        'frequency': '5-8 tweets per day',
        'best_times': ['07:00', '12:00', '17:00', '20:00'],
        'avoid': ['09:00-11:00']  # Peak activity
    },
    'linkedin': {
        'frequency': '2-3 posts per day',
        'best_times': ['09:00', '13:00', '16:00'],
        'avoid': ['18:00-08:00', 'weekends']
    }
}
```

### Error Handling Strategy
```python
def post_with_rate_limiting(content, platforms=['telegram', 'twitter', 'linkedin']):
    results = {}
    
    for platform in platforms:
        try:
            # Check rate limits before posting
            if not can_post_to_platform(platform):
                results[platform] = {
                    'success': False,
                    'reason': 'Rate limit exceeded',
                    'retry_after': get_retry_time(platform)
                }
                continue
            
            # Attempt to post
            result = post_to_platform(platform, content)
            results[platform] = result
            
            # Update rate limiting counters
            update_rate_limit_tracking(platform)
            
        except Exception as e:
            results[platform] = {
                'success': False,
                'reason': str(e),
                'needs_attention': True
            }
    
    return results
```

### Monitoring & Alerts
```python
# Daily health check
def daily_rate_limit_check():
    report = []
    
    # Check each platform
    platforms = ['telegram', 'twitter', 'linkedin']
    
    for platform in platforms:
        usage = get_daily_usage(platform)
        limit = get_daily_limit(platform)
        percentage = (usage / limit) * 100 if limit > 0 else 0
        
        if percentage > 80:
            report.append(f"🔴 {platform}: {percentage:.1f}% usage - NEAR LIMIT")
        elif percentage > 60:
            report.append(f"🟡 {platform}: {percentage:.1f}% usage - HIGH")
        else:
            report.append(f"🟢 {platform}: {percentage:.1f}% usage - OK")
    
    return report
```

---

## 📈 USAGE ANALYTICS

### Daily Tracking Queries
```sql
-- Today's posts by platform
SELECT 
    COUNT(CASE WHEN telegram_id IS NOT NULL THEN 1 END) as telegram_posts,
    COUNT(CASE WHEN twitter_id IS NOT NULL THEN 1 END) as twitter_posts,
    COUNT(CASE WHEN linkedin_id IS NOT NULL THEN 1 END) as linkedin_posts
FROM posts 
WHERE DATE(posted_at) = DATE('now');

-- Success rate by platform (last 7 days)
SELECT 
    platform,
    COUNT(*) as total_attempts,
    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
    (SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate
FROM posts 
WHERE posted_at > datetime('now', '-7 days')
GROUP BY platform;
```

### Weekly Reports
Run every Sunday to analyze the week's performance:
```bash
python3 api_rate_limit_monitor.py
```

---

## 🚨 Emergency Procedures

### Rate Limit Exceeded
```bash
# If rate limits are hit:
1. Check current usage:
   python3 api_rate_limit_monitor.py

2. Pause automated posting:
   # Kill any running schedulers
   ps aux | grep content_scheduler
   kill [PID]

3. Wait for reset period:
   # Twitter: Wait 3 hours
   # LinkedIn: Wait until next day
   # Telegram: Usually immediate

4. Resume with reduced frequency
```

### API Token Issues
```bash
# LinkedIn token expired:
python3 linkedin_oauth_personal.py
# Follow browser prompts
python3 exchange_linkedin_code.py [CODE]

# Twitter API issues:
# Check developer console at developer.twitter.com
# Verify app permissions and keys
```

---

## 📋 Compliance Checklist

### Before Going Live
- [ ] Rate limits configured for all platforms
- [ ] Error handling implemented
- [ ] Monitoring alerts set up
- [ ] Backup credentials stored securely
- [ ] Token expiry reminders active
- [ ] Content complies with platform policies
- [ ] FINRA disclaimers included where required

### Daily Maintenance
- [ ] Check API usage statistics
- [ ] Review error logs
- [ ] Verify all platforms posting successfully
- [ ] Monitor success rates
- [ ] Update content calendar

### Weekly Review
- [ ] Analyze posting performance
- [ ] Adjust rate limiting if needed
- [ ] Review content engagement
- [ ] Plan next week's topics
- [ ] Check token expiry dates

---

## 📞 Support & Resources

### API Documentation
- **Telegram Bot API**: https://core.telegram.org/bots/api
- **Twitter API v2**: https://developer.twitter.com/en/docs/twitter-api
- **LinkedIn API**: https://docs.microsoft.com/en-us/linkedin/

### Monitoring Scripts
- `api_rate_limit_monitor.py` - Daily usage check
- `social_media_verifier.py` - Platform health check
- `automated_posting_system.py` - Main posting engine

### Recovery Scripts
- `restore_credentials.py` - Restore from backup
- `linkedin_oauth_personal.py` - Renew LinkedIn token
- `test_all_platforms.py` - Verify all platforms

---

**Last Updated**: September 11, 2025  
**Next Review**: October 1, 2025  
**Token Expiry Alert**: November 3, 2025