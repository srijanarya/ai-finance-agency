#!/usr/bin/env python3
"""
Update Telegram API Credentials
"""

import os
from dotenv import load_dotenv, set_key

def update_credentials():
    print("🔧 TELEGRAM API CREDENTIAL UPDATER")
    print("="*50)
    print("\nEnter the credentials from my.telegram.org:\n")
    
    # Get credentials
    api_id = input("Enter your api_id (8-digit number): ").strip()
    api_hash = input("Enter your api_hash (32-char string): ").strip()
    phone = input("Enter your phone (+919876543210): ").strip()
    
    # Validate
    if not api_id.isdigit() or len(api_id) < 5:
        print("❌ Invalid api_id! Should be numbers only")
        return False
    
    if len(api_hash) < 20:
        print("❌ Invalid api_hash! Too short")
        return False
    
    if not phone.startswith("+"):
        phone = "+" + phone
    
    # Save to .env
    env_file = '.env'
    set_key(env_file, "TELEGRAM_API_ID", api_id)
    set_key(env_file, "TELEGRAM_API_HASH", api_hash)
    set_key(env_file, "TELEGRAM_PHONE", phone)
    
    print("\n✅ Credentials saved successfully!")
    print("\nYour credentials:")
    print(f"API ID: {api_id}")
    print(f"API Hash: {api_hash[:10]}...")
    print(f"Phone: {phone}")
    
    return True

if __name__ == "__main__":
    if update_credentials():
        print("\n🚀 Ready to run automation!")
        print("Next step: python3 full_automation_bot.py")