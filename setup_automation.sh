#!/bin/bash
# SETUP AUTOMATION SCRIPT - Treum Algotech AI Finance Agency
# This script sets up automated posting and monitoring

echo "🚀 SETTING UP TREUM ALGOTECH AUTOMATION"
echo "========================================"

# Change to project directory
cd /Users/srijan/ai-finance-agency

# Create logs directory
mkdir -p logs
mkdir -p health_reports

# Set up virtual environment if not exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate and install dependencies
source venv/bin/activate
pip install python-dotenv requests tweepy pyperclip

echo "⏰ SETTING UP CRON JOBS"
echo "----------------------"

# Create crontab entries
CRON_ENTRIES="# Treum Algotech AI Finance Agency Automation
# Telegram posting every 4 hours during market hours
0 9,13,17 * * 1-5 cd /Users/srijan/ai-finance-agency && source venv/bin/activate && python3 auto_telegram_poster.py >> logs/telegram.log 2>&1

# Twitter posting every 6 hours
0 10,16 * * 1-5 cd /Users/srijan/ai-finance-agency && source venv/bin/activate && python3 platform_styled_poster.py --auto-twitter >> logs/twitter.log 2>&1

# Generate manual LinkedIn content daily at 8 AM
0 8 * * 1-5 cd /Users/srijan/ai-finance-agency && source venv/bin/activate && python3 instant_company_content.py >> logs/linkedin_content.log 2>&1

# Health monitoring every 15 minutes during market hours
*/15 9-16 * * 1-5 cd /Users/srijan/ai-finance-agency && source venv/bin/activate && python3 monitor.py --health-check >> logs/health.log 2>&1

# Daily health report at 6 PM
0 18 * * 1-5 cd /Users/srijan/ai-finance-agency && source venv/bin/activate && python3 monitor.py --daily-report >> logs/daily_reports.log 2>&1"

echo "📋 AUTOMATION SCHEDULE:"
echo "$CRON_ENTRIES"
echo ""

# Create cron setup script
cat > setup_cron.sh << 'EOF'
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
EOF

chmod +x setup_cron.sh

echo "🎯 NEXT STEPS:"
echo "1. Run: ./setup_cron.sh (to install cron jobs)"
echo "2. Manual LinkedIn posting: python3 instant_company_content.py"
echo "3. Check automation: tail -f logs/telegram.log"
echo "4. Monitor app verification: check LinkedIn Developer Console"
echo ""
echo "✅ AUTOMATION READY!"
echo "📊 Telegram: Automated ✅"
echo "📝 LinkedIn: Manual content generator ready ✅"  
echo "🔍 Monitoring: Health checks configured ✅"
echo "⏳ LinkedIn Company API: Waiting for verification"