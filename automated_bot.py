#!/usr/bin/env python3
"""
Automated Bot - Runs with saved session
"""

import asyncio
from telethon import TelegramClient
from telethon.tl.functions.messages import SearchGlobalRequest
from telethon.tl.functions.channels import JoinChannelRequest
from telethon.tl.types import InputPeerEmpty
from telethon.errors import FloodWaitError, UserAlreadyParticipantError
import random
import time
import os

# Your credentials
API_ID = 23925638
API_HASH = "36f8e3c8515c6b32ce45b5447ac93058"
PHONE = "+919819515128"

async def run_bot():
    print("🚀 TELEGRAM AUTOMATION BOT")
    print("="*50)
    
    # Use the session file
    client = TelegramClient('srijan_session', API_ID, API_HASH)
    
    try:
        await client.connect()
        
        # Check if we need to authenticate
        if not await client.is_user_authorized():
            print(f"📱 Sending code to {PHONE}...")
            await client.send_code_request(PHONE)
            
            # Use the code 47049
            code = "47049"
            print(f"📝 Using code: {code}")
            
            try:
                await client.sign_in(PHONE, code)
                print("✅ Successfully authenticated!")
            except Exception as e:
                print(f"❌ Code might have expired. Need new code: {e}")
                return
        
        me = await client.get_me()
        print(f"\n✅ Logged in as: {me.first_name}")
        print(f"   Phone: {me.phone}")
        print("="*50)
        
        # Start automation
        print("\n🤖 STARTING AUTOMATION")
        print("-"*40)
        
        # Search terms for Indian trading groups
        search_terms = [
            "trading india", "stock market india", "nifty chat",
            "banknifty discussion", "options trading india", 
            "share market chat", "intraday trading", "indian stocks"
        ]
        
        # Messages to promote your channel
        promo_messages = [
            """📊 For traders seeking accuracy:

@AIFinanceNews2024

• Multi-source verified data
• TradingView + Yahoo + NSE
• Educational content only

https://t.me/AIFinanceNews2024""",

            """Check out @AIFinanceNews2024

Every price verified from 3+ sources.
No fake tips, education only.

https://t.me/AIFinanceNews2024""",

            """New discovery: @AIFinanceNews2024

Verified market data.
Free for first 500 members.

https://t.me/AIFinanceNews2024"""
        ]
        
        # Main automation loop
        cycle = 1
        while True:
            try:
                print(f"\n📍 CYCLE {cycle} - {time.strftime('%I:%M %p')}")
                print("-"*40)
                
                # 1. Search for groups
                print("\n🔍 Searching for groups...")
                groups_found = []
                
                for term in random.sample(search_terms, 3):  # Search 3 random terms
                    try:
                        print(f"   Searching: {term}")
                        result = await client(SearchGlobalRequest(
                            q=term,
                            offset_date=None,
                            offset_peer=InputPeerEmpty(),
                            offset_id=0,
                            limit=5
                        ))
                        
                        for chat in result.chats:
                            if hasattr(chat, 'username') and chat.username:
                                if not hasattr(chat, 'broadcast') or not chat.broadcast:
                                    groups_found.append({
                                        'username': chat.username,
                                        'title': chat.title[:30]
                                    })
                        
                        await asyncio.sleep(2)
                        
                    except FloodWaitError as e:
                        print(f"   ⚠️ Rate limit: Wait {e.seconds}s")
                        await asyncio.sleep(e.seconds)
                    except Exception as e:
                        print(f"   Error: {str(e)[:50]}")
                
                print(f"\n✅ Found {len(groups_found)} potential groups")
                
                # 2. Join groups
                print("\n👥 Joining groups...")
                joined = 0
                
                for group in groups_found[:5]:  # Join max 5 per cycle
                    try:
                        await client(JoinChannelRequest(group['username']))
                        print(f"   ✅ Joined: {group['title']}")
                        joined += 1
                        await asyncio.sleep(random.randint(20, 40))
                        
                    except UserAlreadyParticipantError:
                        print(f"   Already in: {group['title']}")
                    except Exception as e:
                        print(f"   ❌ Can't join: {group['title']}")
                
                print(f"\n✅ Joined {joined} new groups")
                
                # 3. Post to groups
                print("\n📤 Posting to groups...")
                posted = 0
                
                dialogs = await client.get_dialogs(limit=30)
                random.shuffle(dialogs)  # Randomize order
                
                for dialog in dialogs:
                    if dialog.is_group:
                        try:
                            msg = random.choice(promo_messages)
                            await client.send_message(dialog.entity, msg)
                            print(f"   ✅ Posted to: {dialog.title[:30]}")
                            posted += 1
                            
                            # Wait between posts
                            await asyncio.sleep(random.randint(90, 150))
                            
                            if posted >= 3:  # Max 3 posts per cycle
                                break
                                
                        except Exception as e:
                            pass  # Can't post, skip silently
                
                print(f"\n✅ Posted to {posted} groups")
                
                # 4. Summary
                print("\n📊 CYCLE SUMMARY")
                print(f"   Groups found: {len(groups_found)}")
                print(f"   Groups joined: {joined}")
                print(f"   Posts made: {posted}")
                print(f"   Channel: @AIFinanceNews2024")
                
                # 5. Wait for next cycle
                wait_mins = 30
                print(f"\n⏰ Next cycle in {wait_mins} minutes...")
                print("="*50)
                
                cycle += 1
                await asyncio.sleep(wait_mins * 60)
                
            except KeyboardInterrupt:
                print("\n🛑 Stopping automation...")
                break
            except Exception as e:
                print(f"\n❌ Error in cycle: {e}")
                print("Retrying in 5 minutes...")
                await asyncio.sleep(300)
        
    finally:
        await client.disconnect()
        print("\n✅ Bot disconnected")

if __name__ == "__main__":
    print("Starting Telegram automation bot...")
    asyncio.run(run_bot())