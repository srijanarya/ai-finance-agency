#!/bin/bash

# AI Finance Agency - Automated Scheduler Setup
echo "📅 Setting up automated scheduling..."

# Create log directory
mkdir -p /Users/srijan/ai-finance-agency/logs

# Create the automation script
cat > /Users/srijan/ai-finance-agency/run_automation.sh << 'EOF'
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
EOF

chmod +x /Users/srijan/ai-finance-agency/run_automation.sh

# Add to crontab
echo "Adding cron jobs..."

# Save existing crontab
crontab -l > /tmp/mycron 2>/dev/null || true

# Remove any existing entries for our project
grep -v "ai-finance-agency" /tmp/mycron > /tmp/mycron_clean || true

# Add new cron jobs
echo "# AI Finance Agency Automation" >> /tmp/mycron_clean
echo "*/30 * * * * cd /Users/srijan/ai-finance-agency && python3 telegram_news_broadcaster.py >> logs/telegram.log 2>&1" >> /tmp/mycron_clean
echo "0 */4 * * * cd /Users/srijan/ai-finance-agency && python3 run_automation.sh >> logs/automation.log 2>&1" >> /tmp/mycron_clean

# Install new crontab
crontab /tmp/mycron_clean

echo "✅ Automation scheduled!"
echo ""
echo "📋 Scheduled tasks:"
echo "  • Telegram broadcast: Every 30 minutes"
echo "  • Full automation: Every 4 hours"
echo ""
echo "To view logs:"
echo "  tail -f logs/telegram.log"
echo ""
echo "To check cron jobs:"
echo "  crontab -l"
echo ""
echo "To stop automation:"
echo "  crontab -e  # Then remove the lines"