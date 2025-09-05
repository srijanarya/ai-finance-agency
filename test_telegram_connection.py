#!/usr/bin/env python3
"""
Test Telegram Connection and Basic Operations
"""

import asyncio
import os
from dotenv import load_dotenv
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError
import sys

# Load environment variables
load_dotenv()

async def test_connection():
    """Test basic Telegram connection"""
    
    # Get credentials
    api_id = os.getenv('TELEGRAM_API_ID')
    api_hash = os.getenv('TELEGRAM_API_HASH')
    phone = os.getenv('TELEGRAM_PHONE')
    channel = os.getenv('TELEGRAM_CHANNEL_ID', '@AIFinanceNews2024')
    
    print("=" * 60)
    print("🔧 TELEGRAM CONNECTION TEST")
    print("=" * 60)
    print(f"API ID: {'✅ Set' if api_id else '❌ Missing'}")
    print(f"API Hash: {'✅ Set' if api_hash else '❌ Missing'}")
    print(f"Phone: {'✅ Set' if phone else '⚠️ Not set (will prompt)'}")
    print(f"Channel: {channel}")
    print("=" * 60)
    
    if not api_id or not api_hash:
        print("\n❌ Error: TELEGRAM_API_ID and TELEGRAM_API_HASH must be set in .env")
        return False
    
    # Create client
    client = TelegramClient('test_session', api_id, api_hash)
    
    try:
        print("\n📱 Connecting to Telegram...")
        await client.start()
        
        # Check if we're logged in
        me = await client.get_me()
        print(f"✅ Connected as: {me.first_name} (@{me.username})")
        print(f"   Phone: {me.phone}")
        
        # Test channel access
        try:
            print(f"\n📢 Testing channel access: {channel}")
            entity = await client.get_entity(channel)
            
            if hasattr(entity, 'title'):
                print(f"✅ Channel found: {entity.title}")
                
                # Get participant count if possible
                if hasattr(entity, 'participants_count'):
                    print(f"   Subscribers: {entity.participants_count}")
                    
                # Check if we can send messages
                if hasattr(entity, 'broadcast'):
                    if entity.broadcast:
                        print("   Type: Channel (broadcast)")
                else:
                    print("   Type: Group")
                    
            print("\n✅ Connection successful! Ready for growth campaigns.")
            return True
            
        except Exception as e:
            print(f"⚠️ Channel access error: {e}")
            print("   Make sure the bot is added as admin to the channel")
            return False
            
    except SessionPasswordNeededError:
        print("\n⚠️ Two-factor authentication is enabled.")
        print("Please run the script manually and enter your password.")
        return False
        
    except Exception as e:
        print(f"\n❌ Connection error: {e}")
        return False
        
    finally:
        await client.disconnect()
        print("\n👋 Disconnected from Telegram")

async def main():
    """Main function"""
    success = await test_connection()
    
    if success:
        print("\n" + "=" * 60)
        print("🚀 READY TO RUN GROWTH ENGINE!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Run: python telegram_growth_engine.py")
        print("2. The engine will start all 6 growth strategies")
        print("3. Monitor your channel for new subscribers!")
    else:
        print("\n" + "=" * 60)
        print("⚠️ ISSUES DETECTED")
        print("=" * 60)
        print("\nPlease fix the issues above before running the growth engine.")
        print("\nCommon fixes:")
        print("1. Make sure .env has correct TELEGRAM_API_ID and TELEGRAM_API_HASH")
        print("2. Add the bot as admin to your channel")
        print("3. Use the correct channel username (with @)")

if __name__ == "__main__":
    asyncio.run(main())