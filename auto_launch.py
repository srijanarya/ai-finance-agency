#!/usr/bin/env python3
"""
Auto Launch - Automated Telegram Bot with preset phone
"""

import os
import sys
import time
from telethon.sync import TelegramClient
from telethon.errors import SessionPasswordNeededError
from dotenv import load_dotenv

load_dotenv()

# Your credentials
API_ID = 23925638
API_HASH = "36f8e3c8515c6b32ce45b5447ac93058"

print("🚀 TELEGRAM AUTOMATION STARTING")
print("="*50)

# Get phone number
print("\n📱 Enter your phone number with country code")
print("   Example: +919876543210")
phone = input("Phone: ").strip()

if not phone.startswith("+"):
    phone = "+" + phone

print(f"\n✅ Using phone: {phone}")

# Create client
client = TelegramClient('automation_session', API_ID, API_HASH)

print("\n🔌 Connecting to Telegram...")
client.connect()

if not client.is_user_authorized():
    print(f"\n📤 Sending verification code to {phone}...")
    client.send_code_request(phone)
    
    print("\n📱 Check your Telegram app for the code")
    code = input("Enter the 5-digit code: ").strip()
    
    try:
        print("\n🔐 Signing in...")
        client.sign_in(phone, code)
        print("✅ Successfully logged in!")
        
    except SessionPasswordNeededError:
        print("\n🔒 2FA enabled. Enter your password:")
        password = input("Password: ")
        client.sign_in(password=password)
        print("✅ Successfully logged in with 2FA!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

# Get user info
me = client.get_me()
print(f"\n✅ Logged in as: {me.first_name} {me.last_name or ''}")
print(f"   Username: @{me.username}")
print(f"   Phone: {me.phone}")

print("\n" + "="*50)
print("🤖 FULL AUTOMATION ACTIVE!")
print("="*50)

# Now run the full automation
from full_automation_bot import FullAutomationBot

print("\n📊 Starting automated operations...")
print("• Searching for trading groups")
print("• Joining automatically")
print("• Posting every hour")
print("• Running 24/7")

bot = FullAutomationBot()
bot.client = client
bot.run_full_automation()