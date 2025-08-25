#!/usr/bin/env python3
"""
AUTOMATIC SCHEDULER - Posts at 8 AM and 3:30 PM IST Daily
"""

import schedule
import time
from datetime import datetime
import pytz
import subprocess

ist = pytz.timezone('Asia/Kolkata')

def morning_post():
    """8 AM Post"""
    print(f'🌅 Morning post at {datetime.now(ist).strftime("%I:%M %p")}')
    subprocess.run(['python3', '/Users/srijan/ai-finance-agency/post_everywhere.py'])

def evening_post():
    """3:30 PM Post"""
    print(f'🌆 Evening post at {datetime.now(ist).strftime("%I:%M %p")}')
    subprocess.run(['python3', '/Users/srijan/ai-finance-agency/post_everywhere.py'])

# Schedule posts
schedule.every().day.at('08:00').do(morning_post)
schedule.every().day.at('15:30').do(evening_post)

print('🤖 TREUM ALGOTECH AUTO-POSTER RUNNING')
print('Scheduled posts: 8:00 AM and 3:30 PM IST daily')
print('Press Ctrl+C to stop')

while True:
    schedule.run_pending()
    time.sleep(60)
