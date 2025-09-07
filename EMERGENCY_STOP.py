#!/usr/bin/env python3
"""
EMERGENCY STOP - Disable ALL automated posting immediately
"""

import os
import subprocess
import glob

print("🚨 EMERGENCY STOP ACTIVATED")
print("=" * 50)
print("Stopping ALL automated posting processes...")

# 1. Kill all running automation processes
automation_processes = [
    "auto_telegram_poster.py",
    "instant_automation.py", 
    "auto_everything_system.py",
    "automated_publisher.py",
    "marketing_automation_engine.py",
    "automated_subscription_flows.py",
    "complete_auto_poster.py",
    "platform_styled_poster.py",
    "continuous_poster.sh"
]

killed_count = 0
for process in automation_processes:
    try:
        result = subprocess.run(['pkill', '-f', process], capture_output=True)
        if result.returncode == 0:
            print(f"✅ Stopped: {process}")
            killed_count += 1
    except:
        pass

print(f"🛑 Stopped {killed_count} processes")

# 2. Remove all cron jobs
try:
    subprocess.run(['crontab', '-r'], capture_output=True)
    print("✅ Removed all cron jobs")
except:
    print("⚠️ No cron jobs to remove")

# 3. Create posting lock file
lock_file = "/Users/srijan/ai-finance-agency/POSTING_DISABLED.lock"
with open(lock_file, 'w') as f:
    f.write(f"Posting disabled at: {os.popen('date').read().strip()}\n")
    f.write("Reason: Data accuracy issues\n")
    f.write("Remove this file only after fixing ALL hardcoded data\n")

print(f"🔒 Created posting lock: {lock_file}")

# 4. Disable executable permissions on problematic scripts
problematic_scripts = glob.glob("/Users/srijan/ai-finance-agency/*auto*.py")
problematic_scripts.extend(glob.glob("/Users/srijan/ai-finance-agency/*telegram*.py"))

disabled_count = 0
for script in problematic_scripts:
    try:
        os.chmod(script, 0o644)  # Remove execute permissions
        disabled_count += 1
    except:
        pass

print(f"🚫 Disabled {disabled_count} scripts")

print("\n" + "=" * 50)
print("✅ EMERGENCY STOP COMPLETE")
print("=" * 50)
print("\n📋 SUMMARY:")
print(f"• Stopped {killed_count} running processes")
print("• Removed all cron jobs") 
print(f"• Disabled {disabled_count} scripts")
print("• Created posting lock file")
print("\n🔧 NEXT STEPS:")
print("1. Fix ALL hardcoded data in scripts")
print("2. Test with live data verification")
print("3. Remove POSTING_DISABLED.lock when ready")
print("4. Re-enable scripts one by one after verification")