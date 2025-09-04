#!/bin/bash
cd /Users/srijan/ai-finance-agency

# Log timestamp
echo "$(date): Running automation" >> logs/automation.log

# Run Telegram broadcaster
python3 telegram_news_broadcaster.py >> logs/telegram.log 2>&1

# Sleep for a bit
sleep 5

# Run dashboard update (if needed)
# python3 dashboard.py >> logs/dashboard.log 2>&1 &

echo "$(date): Automation complete" >> logs/automation.log
