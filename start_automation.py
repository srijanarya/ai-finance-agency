#!/usr/bin/env python3
"""
Start Full Automation - With your API credentials
"""

import os
from dotenv import load_dotenv, set_key

load_dotenv()

def get_phone_and_start():
    print("🚀 TELEGRAM FULL AUTOMATION")
    print("="*50)
    print("\n✅ API Credentials loaded:")
    print(f"   API ID: {os.getenv('TELEGRAM_API_ID')}")
    print(f"   API Hash: {os.getenv('TELEGRAM_API_HASH')[:10]}...")
    
    print("\n📱 Enter your phone number:")
    print("   Example: +919876543210 (with country code)")
    phone = input("\nYour phone number: ").strip()
    
    if not phone.startswith("+"):
        phone = "+" + phone
    
    # Save phone
    set_key('.env', 'TELEGRAM_PHONE', phone)
    print(f"\n✅ Phone saved: {phone}")
    
    print("\n" + "="*50)
    print("🤖 Starting Full Automation Bot...")
    print("="*50)
    print("\nWhat will happen next:")
    print("1. You'll receive a verification code in Telegram")
    print("2. Enter that code when prompted")
    print("3. Bot will start finding and joining groups")
    print("4. Automatic posting every hour")
    print("5. Runs 24/7 without any manual work!")
    print("\n" + "="*50)
    
    # Start the bot
    import subprocess
    subprocess.run(["python3", "full_automation_bot.py"])

if __name__ == "__main__":
    get_phone_and_start()