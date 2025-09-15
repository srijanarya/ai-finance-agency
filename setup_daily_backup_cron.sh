#!/bin/bash
# Setup daily backup cron job for AI Finance Agency

echo "🔐 Setting up daily backup cron job..."

# Get current crontab (if any)
CURRENT_CRON=$(crontab -l 2>/dev/null)

# Backup command
BACKUP_COMMAND="0 2 * * * cd /Users/srijan/ai-finance-agency && /usr/bin/python3 automated_credential_backup.py --daily >> backup_cron.log 2>&1"

# Check if backup job already exists
if echo "$CURRENT_CRON" | grep -q "automated_credential_backup.py"; then
    echo "⚠️ Daily backup cron job already exists!"
    echo "Current backup-related cron jobs:"
    echo "$CURRENT_CRON" | grep "automated_credential_backup.py"
else
    # Add the backup job
    echo "📅 Adding daily backup cron job (runs at 2:00 AM daily)..."
    
    # Create new crontab with existing jobs + backup job
    {
        echo "$CURRENT_CRON"
        echo "$BACKUP_COMMAND"
    } | crontab -
    
    echo "✅ Daily backup cron job installed successfully!"
    echo "📋 Current crontab:"
    crontab -l
fi

echo ""
echo "💡 Manual backup commands:"
echo "  Run backup now: python3 automated_credential_backup.py"
echo "  Test backup: echo '1' | python3 automated_credential_backup.py"
echo "  View logs: tail -f backup_cron.log"
echo ""
echo "🔍 To verify cron job: crontab -l"
echo "❌ To remove cron job: crontab -e (then delete the backup line)"