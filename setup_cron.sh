#!/bin/bash
# Add to crontab
(crontab -l 2>/dev/null; cat << 'CRONEND'
# Treum Algotech AI Finance Agency Automation
# Telegram posting every 4 hours during market hours
0 9,13,17 * * 1-5 cd /Users/srijan/ai-finance-agency && source venv/bin/activate && python3 auto_telegram_poster.py >> logs/telegram.log 2>&1

# Generate manual LinkedIn content daily at 8 AM
0 8 * * 1-5 cd /Users/srijan/ai-finance-agency && source venv/bin/activate && python3 instant_company_content.py >> logs/linkedin_content.log 2>&1

# Health monitoring every 15 minutes during market hours
*/15 9-16 * * 1-5 cd /Users/srijan/ai-finance-agency && source venv/bin/activate && python3 monitor.py --health-check >> logs/health.log 2>&1

# Daily health report at 6 PM
0 18 * * 1-5 cd /Users/srijan/ai-finance-agency && source venv/bin/activate && python3 monitor.py --daily-report >> logs/daily_reports.log 2>&1
CRONEND
) | crontab -

echo "✅ Cron jobs installed successfully!"
crontab -l | grep "Treum Algotech"
