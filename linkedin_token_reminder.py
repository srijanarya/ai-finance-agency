#!/usr/bin/env python3
"""
LinkedIn Token Renewal Reminder System
Creates calendar reminder for token expiry (Nov 10, 2025)
"""

import os
import json
from datetime import datetime, timedelta
from icalendar import Calendar, Event, Alarm

def create_linkedin_token_reminder():
    """Create calendar reminder for LinkedIn token renewal"""
    
    # Token expiry date (60 days from Sept 11, 2025)
    expiry_date = datetime(2025, 11, 10, 9, 0)  # Nov 10, 2025 at 9 AM
    reminder_date = expiry_date - timedelta(days=7)  # 7 days before expiry
    
    print("📅 Creating LinkedIn Token Renewal Reminder")
    print("="*50)
    
    # Create calendar
    cal = Calendar()
    cal.add('prodid', '-//AI Finance Agency//LinkedIn Token Reminder//EN')
    cal.add('version', '2.0')
    
    # Create event
    event = Event()
    event.add('summary', '🔐 LinkedIn Token Renewal Required - AI Finance Agency')
    event.add('dtstart', reminder_date)
    event.add('dtend', reminder_date + timedelta(hours=1))
    event.add('description', f'''
URGENT: LinkedIn Access Token expires on {expiry_date.strftime('%B %d, %Y')}

ACTION REQUIRED:
1. Run: python3 linkedin_oauth_personal.py
2. Complete OAuth authorization in browser
3. Copy authorization code
4. Run: python3 exchange_linkedin_code.py YOUR_CODE
5. Test with: python3 test_linkedin_post.py

Current Token Details:
- Client ID: 77ccq66ayuwvqo
- Person URN: urn:li:person:vlt5EDPS3C
- Profile: Srijan Arya (srijanaryay@gmail.com)
- Scopes: openid, profile, email, w_member_social

Files to use:
- /Users/srijan/ai-finance-agency/linkedin_oauth_personal.py
- /Users/srijan/ai-finance-agency/exchange_linkedin_code.py
- /Users/srijan/ai-finance-agency/restore_credentials.py

DO NOT DELAY - Social media automation depends on this!
    '''.strip())
    
    event.add('location', 'AI Finance Agency - LinkedIn Integration')
    event.add('priority', 1)  # High priority
    
    # Add alarm (notification)
    alarm = Alarm()
    alarm.add('trigger', timedelta(minutes=-60))  # 1 hour before
    alarm.add('action', 'DISPLAY')
    alarm.add('description', 'LinkedIn Token Renewal Due!')
    event.add_component(alarm)
    
    # Add to calendar
    cal.add_component(event)
    
    # Save calendar file
    calendar_file = '/Users/srijan/ai-finance-agency/LinkedIn_Token_Renewal.ics'
    with open(calendar_file, 'wb') as f:
        f.write(cal.to_ical())
    
    print(f"✅ Calendar reminder created: {calendar_file}")
    print(f"📅 Reminder Date: {reminder_date.strftime('%B %d, %Y at %I:%M %p')}")
    print(f"🔴 Token Expires: {expiry_date.strftime('%B %d, %Y at %I:%M %p')}")
    print(f"⚠️ Days until expiry: {(expiry_date - datetime.now()).days}")
    
    # Also create a simple text reminder
    reminder_file = '/Users/srijan/ai-finance-agency/LINKEDIN_TOKEN_REMINDER.txt'
    with open(reminder_file, 'w') as f:
        f.write(f"""
🔐 LINKEDIN TOKEN RENEWAL REMINDER
================================

⚠️ CRITICAL: LinkedIn access token expires on {expiry_date.strftime('%B %d, %Y')}

📅 SET REMINDER FOR: {reminder_date.strftime('%B %d, %Y')} (7 days before)

🚨 RENEWAL PROCESS:
1. cd /Users/srijan/ai-finance-agency
2. python3 linkedin_oauth_personal.py
3. Complete OAuth in browser (select Treum Algotech if dropdown)
4. Copy authorization code from redirect URL
5. python3 exchange_linkedin_code.py [YOUR_CODE]
6. python3 test_linkedin_post.py (verify working)

📊 CURRENT TOKEN DETAILS:
- Created: September 11, 2025
- Expires: November 10, 2025 (60 days)
- Profile: Srijan Arya (srijanaryay@gmail.com)
- Client ID: 77ccq66ayuwvqo
- Person URN: urn:li:person:vlt5EDPS3C

🔗 BACKUP FILES:
- WORKING_CREDENTIALS_BACKUP.md
- credentials_backup.json
- restore_credentials.py

⚡ AUTOMATION IMPACT:
Without renewal, automated posting to LinkedIn will STOP working!
All Telegram and Twitter posts will continue working.

💾 Calendar file created: LinkedIn_Token_Renewal.ics
Import this file into your calendar app for automatic reminder.
""")
    
    print(f"📝 Text reminder saved: {reminder_file}")
    print("\n🎯 NEXT STEPS:")
    print("1. Import LinkedIn_Token_Renewal.ics into your calendar")
    print("2. Set phone reminder for Nov 3, 2025")
    print("3. Add to your task management system")
    
    return calendar_file, reminder_file

def check_token_status():
    """Check current token status and time until expiry"""
    expiry_date = datetime(2025, 11, 10, 9, 0)
    days_remaining = (expiry_date - datetime.now()).days
    
    print("\n📊 CURRENT TOKEN STATUS:")
    print(f"Days until expiry: {days_remaining}")
    
    if days_remaining <= 7:
        print("🔴 URGENT: Renewal needed within a week!")
    elif days_remaining <= 30:
        print("🟡 WARNING: Renewal needed within a month!")
    else:
        print("🟢 OK: Token valid for more than 30 days")
    
    return days_remaining

def main():
    """Main execution"""
    print("🤖 AI Finance Agency - LinkedIn Token Reminder Setup")
    print("="*60)
    
    try:
        # Check if required package is available
        import icalendar
        
        # Create reminders
        calendar_file, reminder_file = create_linkedin_token_reminder()
        
        # Check current status
        days_remaining = check_token_status()
        
        print("\n" + "="*60)
        print("✅ REMINDER SYSTEM SETUP COMPLETE")
        print("="*60)
        
    except ImportError:
        print("⚠️ icalendar package not found. Installing...")
        os.system("pip install icalendar")
        print("📦 Package installed. Please run script again.")

if __name__ == "__main__":
    main()