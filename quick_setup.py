#!/usr/bin/env python3
"""
QUICK SETUP - Get your authentication working
"""

import asyncio
from telethon import TelegramClient
from telethon.sessions import StringSession

API_ID = 23925638
API_HASH = "36f8e3c8515c6b32ce45b5447ac93058"
PHONE = "+919819515128"

async def quick_setup():
    print("\n🔐 QUICK AUTHENTICATION SETUP")
    print("="*50)
    print("This will create a session that works forever!")
    print("="*50)
    
    # Create new client
    client = TelegramClient(StringSession(), API_ID, API_HASH)
    
    await client.connect()
    
    if not await client.is_user_authorized():
        print(f"\n📱 Sending code to {PHONE}...")
        await client.send_code_request(PHONE)
        
        print("\n⚠️ CHECK YOUR TELEGRAM APP!")
        print("You'll receive a code from Telegram")
        print("It looks like: 12345")
        print()
        
        code = input("Enter the code: ")
        
        try:
            await client.sign_in(PHONE, code)
            print("\n✅ SUCCESS! Authentication complete!")
            
            # Get session string
            session_string = client.session.save()
            
            # Save to file
            with open('session.txt', 'w') as f:
                f.write(session_string)
            
            print("\n✅ Session saved to session.txt")
            print("You can now run the auto poster!")
            
            # Show user info
            me = await client.get_me()
            print(f"\n📱 Logged in as: {me.first_name}")
            print(f"📞 Phone: {me.phone}")
            print(f"👤 Username: @{me.username}")
            
            return session_string
            
        except Exception as e:
            print(f"\n❌ Error: {e}")
            return None
    else:
        print("\n✅ Already authenticated!")
        session_string = client.session.save()
        return session_string

if __name__ == "__main__":
    session = asyncio.run(quick_setup())
    
    if session:
        print("\n" + "="*50)
        print("✅ SETUP COMPLETE!")
        print("="*50)
        print("\nYour session string (save this):")
        print(session[:50] + "...")
        print("\nNow run: python3 auto_group_poster.py")
    else:
        print("\n❌ Setup failed. Please try again.")