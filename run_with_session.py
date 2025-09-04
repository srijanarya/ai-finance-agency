#!/usr/bin/env python3
"""
Run with existing session - No login needed!
"""

import asyncio
from telethon import TelegramClient
from telethon.tl.functions.messages import SearchGlobalRequest
from telethon.tl.functions.channels import JoinChannelRequest
from telethon.errors import FloodWaitError, UserAlreadyParticipantError
from telethon.tl.types import InputPeerEmpty
import random
import time

# Your API credentials
API_ID = 23925638
API_HASH = "36f8e3c8515c6b32ce45b5447ac93058"

async def run_automation():
    print("🚀 TELEGRAM AUTOMATION - USING EXISTING SESSION")
    print("="*50)
    
    # Use existing session
    client = TelegramClient('automation_session', API_ID, API_HASH)
    
    await client.connect()
    
    if await client.is_user_authorized():
        me = await client.get_me()
        print(f"✅ Already logged in as: {me.first_name}")
        print(f"   Phone: {me.phone}")
        print("="*50)
        
        # Start automation
        print("\n🤖 STARTING AUTOMATED OPERATIONS")
        print("-"*40)
        
        # Search terms
        search_terms = [
            "trading india", "stock market chat", "nifty discussion",
            "options trading", "intraday", "share market india"
        ]
        
        # Your channel to promote
        channel_link = "https://t.me/AIFinanceNews2024"
        
        messages = [
            f"📊 For accurate market data: @AIFinanceNews2024\n\nMulti-source verified prices.\nEducational content only.\n\n{channel_link}",
            f"Found this useful: @AIFinanceNews2024\n\nEvery price from 3+ sources.\nNo fake tips.\n\n{channel_link}",
            f"Check out @AIFinanceNews2024\n\nTradingView + Yahoo + NSE verified.\nFree for early members.\n\n{channel_link}"
        ]
        
        while True:
            print(f"\n⏰ Cycle started at {time.strftime('%I:%M %p')}")
            
            # Search for groups
            print("\n🔍 Searching for trading groups...")
            groups_found = []
            
            for term in search_terms:
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
                                    'title': chat.title
                                })
                    
                    await asyncio.sleep(2)
                    
                except FloodWaitError as e:
                    print(f"⚠️ Rate limit. Wait {e.seconds}s")
                    await asyncio.sleep(e.seconds)
                except Exception as e:
                    print(f"   Search error: {e}")
            
            print(f"\n✅ Found {len(groups_found)} groups")
            
            # Join groups
            joined = 0
            for group in groups_found[:10]:
                try:
                    print(f"   Joining: {group['title']}")
                    await client(JoinChannelRequest(group['username']))
                    joined += 1
                    await asyncio.sleep(random.randint(30, 60))
                    
                except UserAlreadyParticipantError:
                    print(f"   Already in: {group['title']}")
                except Exception as e:
                    print(f"   Could not join: {e}")
            
            print(f"\n✅ Joined {joined} new groups")
            
            # Post to groups
            print("\n📤 Posting to groups...")
            posted = 0
            
            dialogs = await client.get_dialogs()
            for dialog in dialogs[:10]:
                if dialog.is_group:
                    try:
                        msg = random.choice(messages)
                        await client.send_message(dialog.entity, msg)
                        print(f"   ✅ Posted to: {dialog.title}")
                        posted += 1
                        
                        await asyncio.sleep(random.randint(120, 300))
                        
                        if posted >= 5:
                            break
                            
                    except Exception as e:
                        print(f"   ❌ Can't post in {dialog.title}")
            
            print(f"\n✅ Posted to {posted} groups")
            
            # Stats
            print("\n📊 CYCLE COMPLETE")
            print(f"   Groups joined: {joined}")
            print(f"   Messages posted: {posted}")
            print(f"   Channel promoted: @AIFinanceNews2024")
            
            print("\n⏰ Next cycle in 1 hour...")
            await asyncio.sleep(3600)
            
    else:
        print("❌ Session expired. Need to login again.")
        print("\nRun: python3 auto_launch.py")
        print("And enter your phone number when prompted")
    
    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(run_automation())