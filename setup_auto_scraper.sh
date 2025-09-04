#!/bin/bash

# Setup Automated News Scraping for AI Finance Agency
# Runs at 9 AM and 4 PM daily

echo "========================================="
echo "📅 SETTING UP AUTOMATED NEWS SCRAPING"
echo "========================================="

# Get the current directory
PROJECT_DIR="/Users/srijan/ai-finance-agency"

# Create the scraper script with logging
cat > "$PROJECT_DIR/auto_scrape.sh" << 'EOF'
#!/bin/bash

# Auto Scraper with Logging
PROJECT_DIR="/Users/srijan/ai-finance-agency"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/scraper_$(date +%Y%m%d_%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Log start time
echo "=========================================" >> "$LOG_FILE"
echo "📰 AUTO SCRAPER STARTED: $(date)" >> "$LOG_FILE"
echo "=========================================" >> "$LOG_FILE"

# Change to project directory
cd "$PROJECT_DIR"

# Run the scraper
python3 refresh_content_ideas.py >> "$LOG_FILE" 2>&1

# Log completion
echo "" >> "$LOG_FILE"
echo "✅ SCRAPER COMPLETED: $(date)" >> "$LOG_FILE"
echo "=========================================" >> "$LOG_FILE"

# Keep only last 30 log files
cd "$LOG_DIR"
ls -t scraper_*.log | tail -n +31 | xargs -r rm

echo "Scraping completed at $(date)"
EOF

# Make the script executable
chmod +x "$PROJECT_DIR/auto_scrape.sh"

# Test if crontab is accessible
if command -v crontab &> /dev/null; then
    echo ""
    echo "📝 ADDING CRON JOBS..."
    
    # Backup existing crontab
    crontab -l > /tmp/mycron 2>/dev/null || touch /tmp/mycron
    
    # Remove any existing scraper entries
    grep -v "auto_scrape.sh" /tmp/mycron > /tmp/mycron_clean
    
    # Add new cron jobs
    echo "# AI Finance Agency - Auto Scraper (9 AM daily)" >> /tmp/mycron_clean
    echo "0 9 * * * $PROJECT_DIR/auto_scrape.sh" >> /tmp/mycron_clean
    echo "" >> /tmp/mycron_clean
    echo "# AI Finance Agency - Auto Scraper (4 PM daily)" >> /tmp/mycron_clean
    echo "0 16 * * * $PROJECT_DIR/auto_scrape.sh" >> /tmp/mycron_clean
    
    # Install new crontab
    crontab /tmp/mycron_clean
    
    echo "✅ CRON JOBS INSTALLED!"
    echo ""
    echo "📅 SCHEDULED TIMES:"
    echo "  • 9:00 AM daily"
    echo "  • 4:00 PM daily"
    echo ""
    echo "📁 LOGS LOCATION: $PROJECT_DIR/logs/"
    
    # Show current cron jobs
    echo ""
    echo "📋 YOUR CURRENT CRON JOBS:"
    crontab -l | grep "auto_scrape"
    
else
    echo "⚠️ Crontab not available. Using launchd for macOS..."
    
    # Create launchd plist for 9 AM
    cat > ~/Library/LaunchAgents/com.aifinance.scraper.morning.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.aifinance.scraper.morning</string>
    <key>ProgramArguments</key>
    <array>
        <string>$PROJECT_DIR/auto_scrape.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>$PROJECT_DIR/logs/launchd_morning.log</string>
    <key>StandardErrorPath</key>
    <string>$PROJECT_DIR/logs/launchd_morning_error.log</string>
</dict>
</plist>
EOF

    # Create launchd plist for 4 PM
    cat > ~/Library/LaunchAgents/com.aifinance.scraper.afternoon.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.aifinance.scraper.afternoon</string>
    <key>ProgramArguments</key>
    <array>
        <string>$PROJECT_DIR/auto_scrape.sh</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>16</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>$PROJECT_DIR/logs/launchd_afternoon.log</string>
    <key>StandardErrorPath</key>
    <string>$PROJECT_DIR/logs/launchd_afternoon_error.log</string>
</dict>
</plist>
EOF

    # Load the launch agents
    launchctl load ~/Library/LaunchAgents/com.aifinance.scraper.morning.plist 2>/dev/null
    launchctl load ~/Library/LaunchAgents/com.aifinance.scraper.afternoon.plist 2>/dev/null
    
    echo "✅ LAUNCHD JOBS INSTALLED!"
    echo ""
    echo "📅 SCHEDULED TIMES:"
    echo "  • 9:00 AM daily"
    echo "  • 4:00 PM daily"
    echo ""
    echo "📁 LOGS LOCATION: $PROJECT_DIR/logs/"
fi

# Create initial log directory
mkdir -p "$PROJECT_DIR/logs"

echo ""
echo "========================================="
echo "✅ AUTOMATION SETUP COMPLETE!"
echo "========================================="
echo ""
echo "📊 WHAT HAPPENS NOW:"
echo "  1. News will be scraped at 9 AM and 4 PM daily"
echo "  2. Fresh content ideas will be added automatically"
echo "  3. Logs will be saved in: $PROJECT_DIR/logs/"
echo ""
echo "🧪 TEST THE SCRAPER NOW:"
echo "  $PROJECT_DIR/auto_scrape.sh"
echo ""
echo "📈 VIEW LOGS:"
echo "  tail -f $PROJECT_DIR/logs/scraper_*.log"
echo ""
echo "🔍 CHECK RELEVANCE:"
echo "  python view_content_with_relevance.py"
echo ""