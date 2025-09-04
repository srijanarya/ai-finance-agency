#!/usr/bin/env python3
"""
Telegram API Setup Helper
Guides through getting API credentials for automation
"""

import webbrowser
import os
from dotenv import load_dotenv, set_key

class TelegramAPISetup:
    def __init__(self):
        self.env_file = '.env'
        load_dotenv()
        
    def check_existing_credentials(self):
        """Check if API credentials already exist"""
        api_id = os.getenv('TELEGRAM_API_ID')
        api_hash = os.getenv('TELEGRAM_API_HASH')
        phone = os.getenv('TELEGRAM_PHONE')
        
        if api_id and api_hash:
            print("✅ Telegram API credentials found!")
            print(f"   API ID: {api_id}")
            print(f"   API Hash: {api_hash[:10]}...")
            print(f"   Phone: {phone}")
            return True
        return False
    
    def setup_api_credentials(self):
        """Interactive setup for API credentials"""
        print("🔧 TELEGRAM API SETUP")
        print("="*50)
        
        if self.check_existing_credentials():
            response = input("\nCredentials exist. Update them? (y/n): ")
            if response.lower() != 'y':
                return
        
        print("\n📱 STEP 1: Get Your API Credentials")
        print("-"*40)
        print("Opening https://my.telegram.org/ in your browser...")
        print("\n1. Log in with your phone number")
        print("2. Click 'API development tools'")
        print("3. Create a new application (any name)")
        print("4. You'll get api_id and api_hash")
        
        # Open the website
        webbrowser.open("https://my.telegram.org/")
        
        print("\n" + "="*50)
        print("📝 Enter your credentials below:")
        print("-"*40)
        
        # Get credentials from user
        api_id = input("Enter your api_id (numbers only): ").strip()
        api_hash = input("Enter your api_hash: ").strip()
        phone = input("Enter your phone (+91XXXXXXXXXX): ").strip()
        
        # Validate
        if not api_id or not api_hash or not phone:
            print("❌ All fields are required!")
            return
        
        # Save to .env
        set_key(self.env_file, "TELEGRAM_API_ID", api_id)
        set_key(self.env_file, "TELEGRAM_API_HASH", api_hash)
        set_key(self.env_file, "TELEGRAM_PHONE", phone)
        
        print("\n✅ Credentials saved to .env file!")
        print("="*50)
        
        return api_id, api_hash, phone
    
    def test_connection(self):
        """Test the API connection"""
        try:
            from telethon import TelegramClient
            import asyncio
            
            api_id = os.getenv('TELEGRAM_API_ID')
            api_hash = os.getenv('TELEGRAM_API_HASH')
            phone = os.getenv('TELEGRAM_PHONE')
            
            if not api_id or not api_hash:
                print("❌ No credentials found. Run setup first!")
                return False
            
            async def test():
                client = TelegramClient('test_session', int(api_id), api_hash)
                await client.connect()
                
                if not await client.is_user_authorized():
                    print("\n📱 Sending verification code to", phone)
                    await client.send_code_request(phone)
                    
                    code = input("Enter the code you received: ")
                    await client.sign_in(phone, code)
                
                me = await client.get_me()
                print(f"\n✅ Connected as: {me.first_name} {me.last_name or ''}")
                print(f"   Username: @{me.username}")
                print(f"   ID: {me.id}")
                
                await client.disconnect()
                return True
            
            return asyncio.run(test())
            
        except Exception as e:
            print(f"❌ Error: {e}")
            return False

def main():
    setup = TelegramAPISetup()
    
    print("🤖 TELEGRAM API AUTOMATION SETUP")
    print("="*50)
    print("This will help you set up Telegram automation")
    print("="*50)
    
    # Check or setup credentials
    if not setup.check_existing_credentials():
        print("\n⚠️ No API credentials found!")
        response = input("Set them up now? (y/n): ")
        
        if response.lower() == 'y':
            credentials = setup.setup_api_credentials()
            
            if credentials:
                print("\n🔌 Testing connection...")
                if setup.test_connection():
                    print("\n🎉 SUCCESS! You can now use automation!")
                else:
                    print("\n⚠️ Connection test failed. Check credentials.")
    else:
        print("\n🔌 Testing existing credentials...")
        if setup.test_connection():
            print("\n✅ Ready for automation!")
        else:
            print("\n❌ Credentials not working. Please update them.")
            setup.setup_api_credentials()
    
    print("\n" + "="*50)
    print("📌 NEXT STEPS:")
    print("1. Run: python3 telegram_auto_promoter.py")
    print("2. The bot will auto-join groups and promote")
    print("3. Monitor subscriber growth")
    print("="*50)

if __name__ == "__main__":
    main()