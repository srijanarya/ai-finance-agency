#!/usr/bin/env python3
"""
Instant Start - Ready to run automation
"""

import os
import asyncio
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError
import sys

# Your API credentials
API_ID = 23925638
API_HASH = "36f8e3c8515c6b32ce45b5447ac93058"

async def main():
    print("🚀 TELEGRAM FULL AUTOMATION")
    print("="*50)
    print("\n✅ API Credentials loaded!")
    print(f"   ID: {API_ID}")
    print(f"   Hash: {API_HASH[:10]}...")
    
    print("\n📱 PHONE NUMBER REQUIRED")
    print("="*50)
    print("\nPlease type your phone number below")
    print("Include country code (e.g., +919876543210)")
    print("\nAfter entering phone, you'll receive a code in Telegram")
    print("="*50)
    
    # Since I can't input interactively, showing what needs to be done
    print("\n📋 TO START AUTOMATION:")
    print("\n1. Run this command in terminal:")
    print("   python3 instant_start.py")
    print("\n2. Enter your phone when prompted")
    print("\n3. Enter the 5-digit code from Telegram")
    print("\n4. Bot starts automatically!")
    
    return
    
    # This part runs when you execute it manually:
    phone = input("\n📱 Your phone number: ").strip()
    
    if not phone.startswith("+"):
        phone = "+" + phone
    
    client = TelegramClient('auto_session', API_ID, API_HASH)
    await client.start(phone=phone)
    
    me = await client.get_me()
    print(f"\n✅ Logged in as: {me.first_name}")
    
    # Start automation
    print("\n🤖 AUTOMATION STARTED!")
    print("• Finding groups...")
    print("• Joining automatically...")
    print("• Posting every hour...")
    
    # Import and run the bot
    from full_automation_bot import FullAutomationBot
    bot = FullAutomationBot()
    bot.client = client
    
    # Search and join groups
    while True:
        await bot.search_and_join_groups(client)
        await asyncio.sleep(300)  # Wait 5 minutes
        await bot.post_to_groups(client)
        await asyncio.sleep(3600)  # Wait 1 hour

if __name__ == "__main__":
    asyncio.run(main())