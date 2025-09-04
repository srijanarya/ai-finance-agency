#!/usr/bin/env python3
"""
Help find and configure Telegram channel
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

bot_token = os.getenv('TELEGRAM_BOT_TOKEN')

print("🔍 TELEGRAM CHANNEL FINDER")
print("="*50)
print("\nTrying different channel variations...")

# Try different possible channel usernames
possible_channels = [
    '@AIFinanceAgency',
    '@AIFinanceAgencyBot',
    '@aifinanceagency',
    '@ai_finance_agency',
    '@financeagency',
]

print("\nTesting channels:")
for channel in possible_channels:
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    data = {
        'chat_id': channel,
        'text': 'Test',
        'parse_mode': 'Markdown'
    }
    
    response = requests.post(url, json=data)
    if response.status_code == 200:
        print(f"✅ Found working channel: {channel}")
        print(f"\nUpdate your .env file:")
        print(f"TELEGRAM_CHANNEL_ID={channel}")
        break
    else:
        print(f"❌ {channel} - Not accessible")

print("\n" + "="*50)
print("If none work, in Telegram:")
print("1. Create a NEW channel")
print("2. Make it PUBLIC")
print("3. Choose a UNIQUE username (it will say if taken)")
print("4. Add @AIFinanceAgencyBot as administrator")
print("5. Give 'Post Messages' permission")
print("\nOr try with the channel ID number instead:")
print("1. Forward any message from your channel to @userinfobot")
print("2. It will give you the channel ID (like -1001234567890)")
print("3. Use that ID instead of @username")