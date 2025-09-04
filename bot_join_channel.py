#!/usr/bin/env python3
"""
Alternative method: Use bot link to join channel
"""

import webbrowser
import time
import os
from dotenv import load_dotenv

load_dotenv()

print("🤖 BOT-CHANNEL CONNECTION HELPER")
print("="*50)

print("\n📱 Method 1: Add Bot via Direct Link")
print("Opening bot page in browser...")

# Open the bot
webbrowser.open("https://t.me/AIFinanceAgencyBot")
time.sleep(2)

print("\nIn Telegram (browser or app):")
print("1. Click 'START' button if you see it")
print("2. Click menu (⋮) or 'Add to Group or Channel'")
print("3. Select your channel: AI Finance News 2024")
print("4. Confirm to add as admin")

print("\n" + "="*50)
print("📱 Method 2: Invite Link Method")
print("\n1. Go to your channel: @AIFinanceNews2024")
print("2. Click channel name → Manage Channel")
print("3. Find 'Invite Links' or 'Channel Link'")
print("4. Create an invite link")
print("5. Share the link here and we'll try joining")

print("\n" + "="*50)
print("📱 Method 3: Manual Bot Start")
print("\n1. Open this link in Telegram: https://t.me/AIFinanceAgencyBot")
print("2. Press START button")
print("3. The bot should respond")
print("4. Then try adding to channel again")

# Try to get bot info
import requests
bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
url = f'https://api.telegram.org/bot{bot_token}/getMe'
response = requests.get(url)
if response.status_code == 200:
    bot_info = response.json()['result']
    print(f"\n✅ Bot Details:")
    print(f"   Username: @{bot_info['username']}")
    print(f"   Bot ID: {bot_info['id']}")
    print(f"   Name: {bot_info['first_name']}")
    
    print("\n📱 Method 4: Add by Bot ID")
    print(f"In 'Add Administrator', try searching for: {bot_info['id']}")