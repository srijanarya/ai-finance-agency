#!/usr/bin/env python3
"""
Get Telegram Channel ID from updates
"""

import requests
import os
from dotenv import load_dotenv
import json

load_dotenv()

bot_token = os.getenv('TELEGRAM_BOT_TOKEN')

print("📱 TELEGRAM CHANNEL ID FINDER")
print("="*50)

# Get updates to find the channel
url = f'https://api.telegram.org/bot{bot_token}/getUpdates'
response = requests.get(url)

if response.status_code == 200:
    updates = response.json().get('result', [])
    
    print("\nLooking for channels where bot is admin...")
    
    channels_found = set()
    
    for update in updates:
        # Check for channel posts
        if 'channel_post' in update:
            chat = update['channel_post']['chat']
            if chat['type'] == 'channel':
                channel_id = chat['id']
                channel_title = chat.get('title', 'Unknown')
                channels_found.add((channel_id, channel_title))
        
        # Check for my_chat_member updates (when bot is added to channel)
        if 'my_chat_member' in update:
            chat = update['my_chat_member']['chat']
            if chat['type'] == 'channel':
                channel_id = chat['id']
                channel_title = chat.get('title', 'Unknown')
                channels_found.add((channel_id, channel_title))
    
    if channels_found:
        print("\n✅ Found these channels:")
        for channel_id, title in channels_found:
            print(f"  Channel: {title}")
            print(f"  ID: {channel_id}")
            print()
        
        # Use the first one found
        channel_id, title = list(channels_found)[0]
        print(f"To use '{title}', update your .env file:")
        print(f"TELEGRAM_CHANNEL_ID={channel_id}")
        
        # Test sending a message
        print("\n🧪 Testing message send...")
        test_url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
        test_data = {
            'chat_id': channel_id,
            'text': '✅ Bot successfully connected to this channel!',
            'parse_mode': 'Markdown'
        }
        
        test_response = requests.post(test_url, json=test_data)
        if test_response.status_code == 200:
            print("✅ Test message sent successfully!")
        else:
            print(f"❌ Could not send message: {test_response.json()}")
    else:
        print("\n❌ No channels found where bot is admin")
        print("\nTo fix this:")
        print("1. Make sure you've added @AIFinanceAgencyBot as admin to your channel")
        print("2. Post a message in the channel")
        print("3. Run this script again")
else:
    print("❌ Could not connect to Telegram bot")

print("\n" + "="*50)
print("Alternative method:")
print("1. In your channel, post: /start")
print("2. Forward that message to @userinfobot")
print("3. It will show the channel ID")
print("4. Use that ID in your .env file")