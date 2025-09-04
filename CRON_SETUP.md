
🕰️ CRON JOB SETUP INSTRUCTIONS
============================================================

1. Edit crontab:
   crontab -e

2. Add these lines:

# AI Finance Agency - Automated Posts (3 times daily)
0 9,15,21 * * * cd /Users/srijan/ai-finance-agency && /usr/bin/python3 platform_styled_poster.py --auto >> /Users/srijan/ai-finance-agency/logs/auto_posts.log 2>&1

# Dual LinkedIn posting (personal + company)
0 9,15,21 * * * cd /Users/srijan/ai-finance-agency && /usr/bin/python3 dual_linkedin_poster.py --auto >> /Users/srijan/ai-finance-agency/logs/linkedin_posts.log 2>&1

# Hourly system monitoring
0 * * * * /usr/bin/python3 /Users/srijan/ai-finance-agency/monitor.py --monitor >> /Users/srijan/ai-finance-agency/logs/monitor.log 2>&1

3. Verify cron jobs:
   crontab -l

4. Check cron logs:
   tail -f /Users/srijan/ai-finance-agency/logs/auto_posts.log

============================================================
SCHEDULE: Posts at 9 AM, 3 PM, and 9 PM daily
MONITORING: System checked every hour
LOGS: All activity logged to /Users/srijan/ai-finance-agency/logs/
        