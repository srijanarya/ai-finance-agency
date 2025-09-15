# 🚨 Platform Issues Runbook
**AI Finance Agency - Social Media Automation Troubleshooting Guide**

---

## 🎯 Quick Diagnostic Commands

```bash
# Check overall system health
python3 platform_health_checker.py

# Run single monitoring check
python3 automated_monitoring.py

# View recent posts status
python3 social_media_verifier.py

# Check API rate limits
python3 api_rate_limit_monitor.py

# Test specific platform
python3 test_all_platforms.py
```

---

## 📱 TELEGRAM ISSUES

### Issue: "Bot not responding"

**Symptoms:**
- Bot doesn't post to channel
- Health check shows timeout/error
- No response from Bot API

**Diagnosis:**
```bash
# Test bot token
curl -X GET "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"

# Check bot permissions
python3 -c "
import os, requests
from dotenv import load_dotenv
load_dotenv()
token = os.getenv('TELEGRAM_BOT_TOKEN')
response = requests.get(f'https://api.telegram.org/bot{token}/getChat?chat_id=-1002345678901')
print(response.json())
"
```

**Solutions:**
1. **Invalid Token:**
   ```bash
   # Regenerate bot token via @BotFather
   # Update .env file
   echo "TELEGRAM_BOT_TOKEN=new_token_here" >> .env
   ```

2. **Bot not admin in channel:**
   - Go to Telegram channel
   - Add bot as administrator
   - Grant "Post Messages" permission

3. **Rate limiting:**
   ```bash
   # Check if too many requests
   # Telegram: 30 messages/second limit
   # Wait 1 minute and retry
   ```

4. **Channel ID changed:**
   ```bash
   # Get new channel ID
   python3 -c "
   import requests, os
   from dotenv import load_dotenv
   load_dotenv()
   token = os.getenv('TELEGRAM_BOT_TOKEN')
   # Forward a message from channel to @userinfobot to get ID
   "
   ```

**Prevention:**
- Monitor bot status daily
- Keep backup bot tokens
- Verify permissions weekly

---

## 🐦 TWITTER/X ISSUES

### Issue: "Authentication Failed"

**Symptoms:**
- 401 Unauthorized errors
- "Invalid or expired token" messages
- Health check shows unauthorized

**Diagnosis:**
```bash
# Test Twitter credentials
python3 -c "
import tweepy, os
from dotenv import load_dotenv
load_dotenv()
try:
    client = tweepy.Client(bearer_token=os.getenv('TWITTER_BEARER_TOKEN'))
    me = client.get_me()
    print(f'Connected as: @{me.data.username}')
except Exception as e:
    print(f'Error: {e}')
"
```

**Solutions:**
1. **Expired Tokens:**
   ```bash
   # Check developer.twitter.com
   # Regenerate keys if needed
   # Update .env with new credentials
   ```

2. **App Suspended:**
   - Check developer console
   - Review app compliance
   - Contact Twitter support if needed

3. **Rate Limiting:**
   ```bash
   # Twitter: 300 tweets per 3-hour window
   # Check current usage
   python3 api_rate_limit_monitor.py
   # Wait for reset or reduce posting frequency
   ```

4. **API Version Issues:**
   ```bash
   # Ensure using API v2
   pip install tweepy --upgrade
   ```

### Issue: "Tweet not posting"

**Diagnosis:**
```bash
# Check tweet content
python3 -c "
content = '''Your tweet content here'''
print(f'Length: {len(content)} chars')
print('Valid for Twitter:' , len(content) <= 280)
"
```

**Solutions:**
1. **Content too long:**
   - Split into thread
   - Use URL shorteners
   - Remove unnecessary text

2. **Duplicate content:**
   - Twitter blocks identical tweets
   - Add timestamp or variation

3. **Policy violation:**
   - Review Twitter content policy
   - Remove problematic keywords
   - Check for spam-like behavior

---

## 💼 LINKEDIN ISSUES

### Issue: "Token Expired"

**Symptoms:**
- 401 Unauthorized responses
- "Token has expired" errors
- No posts appearing on LinkedIn

**Diagnosis:**
```bash
# Check LinkedIn token status
python3 -c "
import requests, os
from dotenv import load_dotenv
load_dotenv()
headers = {'Authorization': f'Bearer {os.getenv(\"LINKEDIN_COMPANY_ACCESS_TOKEN\")}'}
response = requests.get('https://api.linkedin.com/v2/userinfo', headers=headers)
print(f'Status: {response.status_code}')
print(response.text)
"
```

**Solutions:**
1. **Renew Token (CRITICAL - Expires Nov 10, 2025):**
   ```bash
   # Step 1: Get authorization code
   python3 linkedin_oauth_personal.py
   # Step 2: Exchange code for token
   python3 exchange_linkedin_code.py [CODE_FROM_BROWSER]
   # Step 3: Update .env file
   ```

2. **Insufficient Permissions:**
   - Check LinkedIn app permissions
   - Ensure r_liteprofile and w_member_social scopes

3. **Account Restricted:**
   - Check LinkedIn messages for violations
   - Review content policy compliance

### Issue: "Posts not appearing"

**Solutions:**
1. **Content Guidelines:**
   - Keep posts professional
   - Avoid excessive hashtags (max 3-5)
   - Include meaningful insights

2. **Posting Frequency:**
   ```bash
   # LinkedIn recommends 1-2 posts per day maximum
   # Check current frequency
   python3 daily_analytics_report.py
   ```

---

## 💾 DATABASE ISSUES

### Issue: "Database locked" or Connection errors

**Symptoms:**
- "Database is locked" errors
- Unable to save posts
- Health check fails on database

**Diagnosis:**
```bash
# Check database file permissions
ls -la data/automated_posts.db

# Check for locks
lsof data/automated_posts.db

# Test database integrity
sqlite3 data/automated_posts.db "PRAGMA integrity_check;"
```

**Solutions:**
1. **Database Locked:**
   ```bash
   # Find processes using database
   lsof data/automated_posts.db
   # Kill blocking processes
   kill [PID]
   # Restart services
   ```

2. **Corrupted Database:**
   ```bash
   # Backup current database
   cp data/automated_posts.db data/automated_posts.db.backup
   
   # Dump and restore
   sqlite3 data/automated_posts.db .dump | sqlite3 data/automated_posts_new.db
   mv data/automated_posts_new.db data/automated_posts.db
   ```

3. **Disk Space:**
   ```bash
   # Check available space
   df -h .
   # Clean up old logs if needed
   find . -name "*.log" -mtime +30 -delete
   ```

---

## ⚙️ API RATE LIMITING ISSUES

### Issue: "Rate limit exceeded"

**Diagnosis:**
```bash
# Check current API usage
python3 api_rate_limit_monitor.py

# View posting frequency
python3 daily_analytics_report.py
```

**Solutions:**
1. **Immediate Relief:**
   ```bash
   # Stop automated posting temporarily
   crontab -l > crontab_backup.txt
   crontab -r
   # Wait for rate limit reset
   ```

2. **Long-term fixes:**
   ```bash
   # Reduce posting frequency
   # Edit content_scheduler.py intervals
   # Implement intelligent spacing
   ```

3. **Platform-specific limits:**
   - **Telegram**: No limits (built-in throttling)
   - **Twitter**: 300 tweets/3hrs (20min spacing recommended)
   - **LinkedIn**: 100 posts/day (5 posts/day recommended)

---

## 🔧 SYSTEM-LEVEL ISSUES

### Issue: "Scripts not running"

**Diagnosis:**
```bash
# Check cron jobs
crontab -l

# Check system logs
tail -f /var/log/system.log | grep -i error

# Check Python environment
which python3
python3 --version
pip list | grep -E "(tweepy|requests|python-dotenv)"
```

**Solutions:**
1. **Missing Dependencies:**
   ```bash
   pip install -r requirements.txt
   # Or install individually:
   pip install tweepy requests python-dotenv sqlite3 matplotlib seaborn
   ```

2. **Path Issues:**
   ```bash
   # Update cron jobs with full paths
   crontab -e
   # Change: python3 script.py
   # To: cd /Users/srijan/ai-finance-agency && /usr/bin/python3 script.py
   ```

3. **Permissions:**
   ```bash
   chmod +x *.py
   chmod +x *.sh
   ```

### Issue: "High system resource usage"

**Diagnosis:**
```bash
# Check CPU/Memory usage
top -l 1 | grep -E "(CPU|Memory)"

# Check disk usage
df -h

# Find large files
find . -type f -size +10M
```

**Solutions:**
1. **Clean up old files:**
   ```bash
   # Clean old backups (keeps last 30 days)
   find backup/ -type f -mtime +30 -delete
   
   # Clean old reports (keeps last 90 days)  
   find data/reports/ -type f -mtime +90 -delete
   
   # Clean old logs
   find . -name "*.log" -mtime +7 -delete
   ```

---

## 🚨 EMERGENCY PROCEDURES

### Complete System Failure

**Immediate Steps:**
1. **Stop all automation:**
   ```bash
   crontab -r  # Remove all cron jobs
   pkill -f "python3.*automated"  # Kill running scripts
   ```

2. **Check system status:**
   ```bash
   python3 platform_health_checker.py
   python3 error_notification_system.py --monitor
   ```

3. **Restore from backup:**
   ```bash
   python3 automated_credential_backup.py
   # Choose option 2: List available backups
   # Copy latest backup to current directory
   ```

4. **Manual posting if needed:**
   ```bash
   python3 automated_posting_system.py
   # Post urgent content manually
   ```

### Data Recovery

**If database is corrupted:**
```bash
# 1. Stop all services
crontab -r

# 2. Backup corrupted database
cp data/automated_posts.db data/corrupted_backup.db

# 3. Restore from latest backup
ls -la backup/daily/
cp backup/daily/backup_YYYYMMDD_HHMMSS/data/automated_posts.db data/

# 4. Verify restoration
python3 social_media_verifier.py

# 5. Resume services
./setup_daily_backup_cron.sh
```

---

## 📊 MONITORING & ALERTS

### Setting Up Continuous Monitoring

```bash
# Start continuous monitoring (runs in background)
nohup python3 automated_monitoring.py --continuous > monitoring.log 2>&1 &

# Check monitoring status
tail -f monitoring.log

# Stop monitoring
pkill -f "automated_monitoring.py"
```

### Alert Configuration

**Email Alerts:**
```bash
# Add to .env file:
echo "EMAIL_APP_PASSWORD=your_gmail_app_password" >> .env
echo "ALERT_EMAIL=your@email.com" >> .env
```

**Slack Alerts:**
```bash
# Add to .env file:
echo "SLACK_WEBHOOK_URL=https://hooks.slack.com/..." >> .env
echo "SLACK_CHANNEL=#ai-finance-alerts" >> .env
```

---

## 🔍 DIAGNOSTIC SCRIPTS

### Quick Health Check
```bash
#!/bin/bash
echo "🔍 Quick System Health Check"
echo "================================"

echo "📱 Platform Health:"
python3 platform_health_checker.py --quick

echo "📊 Recent Posts:"
python3 -c "
import sqlite3
conn = sqlite3.connect('data/automated_posts.db')
cursor = conn.cursor()
cursor.execute('SELECT COUNT(*) FROM posts WHERE posted_at > datetime(\"now\", \"-24 hours\")')
print(f'  Last 24h: {cursor.fetchone()[0]} posts')
cursor.execute('SELECT COUNT(*) FROM posts WHERE posted_at > datetime(\"now\", \"-24 hours\") AND status != \"success\"')
print(f'  Failures: {cursor.fetchone()[0]} posts')
conn.close()
"

echo "💾 System Resources:"
df -h . | tail -1 | awk '{print "  Disk Usage: " $5 " (" $4 " free)"}'
```

### Platform Test Script
```bash
#!/bin/bash
echo "🧪 Testing All Platforms"
echo "========================="

# Test each platform individually
python3 -c "
from automated_posting_system import AutomatedPostingSystem
system = AutomatedPostingSystem()

test_content = 'TEST: System health check - $(date)'

print('Testing Telegram...')
result = system.post_to_telegram(test_content + ' #SystemTest')
print(f'  Result: {result}')

print('Testing Twitter...')  
result = system.post_to_twitter(test_content + ' #Test')
print(f'  Result: {result}')

print('Testing LinkedIn...')
result = system.post_to_linkedin(test_content + ' - Automated system test')
print(f'  Result: {result}')
"
```

---

## 📞 ESCALATION PROCEDURES

### Severity Levels

**🔴 CRITICAL (Immediate attention required)**
- All platforms down
- Database corruption
- Security breach
- Token compromised

**🟡 HIGH (Fix within 2 hours)**
- Single platform failure
- High error rate (>20%)
- API quota exhausted

**🟢 MEDIUM (Fix within 24 hours)**
- Performance degradation
- Content policy warnings
- Token expiring soon (< 7 days)

**🔵 LOW (Fix within 1 week)**
- Minor content issues
- Optimization opportunities
- Documentation updates

### Emergency Contacts

1. **Platform Issues:**
   - Check platform status pages
   - Review developer documentation
   - Contact platform support if needed

2. **System Issues:**
   - Review runbook procedures
   - Check backup systems
   - Restore from known good state

3. **Security Issues:**
   - Rotate all API keys immediately
   - Check access logs
   - Run security audit

---

## 📚 REFERENCE LINKS

### Platform Documentation
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api)
- [LinkedIn API](https://docs.microsoft.com/en-us/linkedin/)

### Status Pages
- [Twitter API Status](https://api.twitterstat.us/)
- [LinkedIn Status](https://www.linkedin-status.com/)

### Tools
- [JSON Formatter](https://jsonformatter.curiousconcept.com/)
- [URL Encoder](https://www.urlencoder.org/)
- [Epoch Converter](https://www.epochconverter.com/)

---

## 📝 CHANGE LOG

| Date | Change | Impact |
|------|--------|---------|
| 2025-09-11 | Initial runbook creation | Complete troubleshooting guide |
| | LinkedIn token renewal system | Proactive token management |
| | Automated monitoring system | Real-time issue detection |
| | Error notification system | Immediate alert capabilities |

---

## 🎯 PREVENTIVE MAINTENANCE CHECKLIST

### Daily (Automated)
- [ ] Platform health checks
- [ ] API usage monitoring  
- [ ] Error scanning
- [ ] Backup verification

### Weekly (Manual)
- [ ] Review analytics reports
- [ ] Check content performance
- [ ] Update content calendar
- [ ] Test recovery procedures

### Monthly (Manual)
- [ ] Review and update API keys
- [ ] Audit system permissions
- [ ] Update documentation
- [ ] Performance optimization review

### Quarterly (Manual)
- [ ] Security audit
- [ ] Disaster recovery test
- [ ] System architecture review
- [ ] Compliance check

---

**Last Updated**: September 11, 2025  
**Next Review**: December 11, 2025  
**Version**: 1.0

*This runbook is a living document. Update it as new issues are discovered and resolved.*