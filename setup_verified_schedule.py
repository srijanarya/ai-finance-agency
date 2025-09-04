#!/usr/bin/env python3
"""
SETUP VERIFIED POSTING SCHEDULE
Creates cron jobs with mandatory verification
"""

import subprocess
import os
from datetime import datetime

def setup_verified_cron_jobs():
    """Setup cron jobs with verification safeguards"""
    
    print("⏰ SETTING UP VERIFIED POSTING SCHEDULE")
    print("=" * 60)
    
    # Verified posting schedule (market hours only)
    cron_entries = [
        # Market opening (9:30 AM IST) - Pre-market analysis
        "25 9 * * 1-5 cd /Users/srijan/ai-finance-agency && python3 verified_posting_system.py >> logs/verified_posts.log 2>&1",
        
        # Mid-morning update (11:00 AM IST)
        "0 11 * * 1-5 cd /Users/srijan/ai-finance-agency && python3 verified_posting_system.py >> logs/verified_posts.log 2>&1",
        
        # Lunch time update (1:00 PM IST)
        "0 13 * * 1-5 cd /Users/srijan/ai-finance-agency && python3 verified_posting_system.py >> logs/verified_posts.log 2>&1",
        
        # Market closing (3:30 PM IST) - Post-market analysis
        "35 15 * * 1-5 cd /Users/srijan/ai-finance-agency && python3 verified_posting_system.py >> logs/verified_posts.log 2>&1",
        
        # Evening global markets update (8:00 PM IST)
        "0 20 * * 1-5 cd /Users/srijan/ai-finance-agency && python3 verified_posting_system.py >> logs/verified_posts.log 2>&1",
        
        # Data verification health check (every 2 hours)
        "0 */2 * * * cd /Users/srijan/ai-finance-agency && python3 data_verification_system.py >> logs/verification.log 2>&1"
    ]
    
    # Create new crontab
    crontab_content = "# AI Finance Agency - Verified Posting Schedule\n"
    crontab_content += "# All posts go through mandatory verification\n\n"
    
    for entry in cron_entries:
        crontab_content += entry + "\n"
    
    # Backup existing crontab
    try:
        result = subprocess.run(['crontab', '-l'], capture_output=True, text=True)
        if result.returncode == 0:
            with open('/Users/srijan/ai-finance-agency/crontab_backup.txt', 'w') as f:
                f.write(result.stdout)
            print("✅ Existing crontab backed up")
    except:
        print("ℹ️ No existing crontab to backup")
    
    # Install new crontab
    try:
        process = subprocess.Popen(['crontab', '-'], stdin=subprocess.PIPE, text=True)
        process.communicate(crontab_content)
        
        if process.returncode == 0:
            print("✅ Verified posting schedule installed")
            print(f"📅 Posts scheduled for: 9:25 AM, 11:00 AM, 1:00 PM, 3:35 PM, 8:00 PM (Weekdays)")
            print("🔍 Verification health check: Every 2 hours")
        else:
            print("❌ Failed to install cron jobs")
            return False
            
    except Exception as e:
        print(f"❌ Error setting up cron jobs: {e}")
        return False
    
    # Create monitoring script
    create_monitoring_script()
    
    return True

def create_monitoring_script():
    """Create script to monitor posting activity"""
    
    monitor_script = '''#!/bin/bash
# Verified Posting Monitor

echo "📊 VERIFIED POSTING SYSTEM STATUS"
echo "=================================="

# Check if posting is disabled
if [ -f "/Users/srijan/ai-finance-agency/POSTING_DISABLED.lock" ]; then
    echo "🔒 POSTING DISABLED (lock file exists)"
    exit 1
fi

# Check recent verified posts
echo "📝 Recent verified posts (last 24 hours):"
if [ -f "/Users/srijan/ai-finance-agency/logs/verified_posts.log" ]; then
    tail -10 /Users/srijan/ai-finance-agency/logs/verified_posts.log
else
    echo "No verified posts log found"
fi

echo ""
echo "🔍 Data verification status:"
if [ -f "/Users/srijan/ai-finance-agency/logs/data_verification.log" ]; then
    tail -5 /Users/srijan/ai-finance-agency/logs/data_verification.log
else
    echo "No verification log found"
fi

echo ""
echo "⏰ Next scheduled posts:"
crontab -l | grep verified_posting_system

echo ""
echo "✅ Monitoring complete"
'''
    
    monitor_path = '/Users/srijan/ai-finance-agency/scripts/monitor_verified_posting.sh'
    os.makedirs(os.path.dirname(monitor_path), exist_ok=True)
    
    with open(monitor_path, 'w') as f:
        f.write(monitor_script)
    
    os.chmod(monitor_path, 0o755)
    print(f"✅ Monitoring script created: {monitor_path}")

def main():
    """Setup the verified posting system"""
    
    print("🛡️ AI FINANCE AGENCY - VERIFIED POSTING SETUP")
    print("=" * 70)
    print("Setting up posting schedule with mandatory verification")
    print("=" * 70)
    
    # Check if verification system exists
    if not os.path.exists('/Users/srijan/ai-finance-agency/data_verification_system.py'):
        print("❌ Data verification system not found")
        return
    
    if not os.path.exists('/Users/srijan/ai-finance-agency/verified_posting_system.py'):
        print("❌ Verified posting system not found") 
        return
    
    # Setup the schedule
    if setup_verified_cron_jobs():
        print("\n🎉 VERIFIED POSTING SYSTEM ACTIVE")
        print("=" * 50)
        print("✅ All posts now require verification")
        print("✅ Hardcoded data detection active")
        print("✅ Cross-source validation enabled")
        print("✅ Market hours posting schedule")
        print("✅ Comprehensive logging")
        print("\n📋 COMMANDS:")
        print("• Monitor: ./scripts/monitor_verified_posting.sh")
        print("• Disable: touch POSTING_DISABLED.lock")
        print("• Enable: rm POSTING_DISABLED.lock")
        print("\n🔒 SAFEGUARDS:")
        print("• No posting without data verification")
        print("• Automatic rejection of suspicious values")
        print("• Complete audit trail")
        print("• Manual override protection")
    else:
        print("❌ Failed to setup verified posting system")

if __name__ == "__main__":
    main()