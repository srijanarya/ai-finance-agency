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
