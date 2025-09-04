#!/usr/bin/env python3
"""
Start Now - Ready with your phone number
"""

import asyncio
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError, FloodWaitError
from telethon.tl.functions.messages import SearchGlobalRequest
from telethon.tl.functions.channels import JoinChannelRequest
from telethon.tl.types import InputPeerEmpty
import random
import time

# Your credentials
API_ID = 23925638
API_HASH = "36f8e3c8515c6b32ce45b5447ac93058"
PHONE = "+919819515128"

async def main():
    print("🚀 TELEGRAM FULL AUTOMATION")
    print("="*50)
    print(f"📱 Phone: {PHONE}")
    print("="*50)
    
    client = TelegramClient('srijan_session', API_ID, API_HASH)
    
    await client.start(phone=PHONE)
    
    me = await client.get_me()
    print(f"\n✅ Logged in as: {me.first_name} {me.last_name or ''}")
    print(f"   Username: @{me.username}")
    print("="*50)
    
    print("\n🤖 AUTOMATION STARTED!")
    print("-"*40)
    print("• Searching for groups...")
    print("• Joining automatically...")
    print("• Posting every hour...")
    print("-"*40)
    
    # Search terms
    search_terms = [
        "trading india", "stock market india", "nifty chat",
        "banknifty", "options trading", "share market",
        "intraday", "indian stocks", "market discussion"
    ]
    
    # Messages to post
    messages = [
        """📊 For accurate market data:

@AIFinanceNews2024

✅ TradingView verified
✅ Yahoo Finance checked  
✅ NSE official data

https://t.me/AIFinanceNews2024""",

        """Found this useful:

@AIFinanceNews2024

Multi-source data verification.
Educational content only.

https://t.me/AIFinanceNews2024""",

        """Check out @AIFinanceNews2024

Every price from 3+ sources.
No fake tips.

https://t.me/AIFinanceNews2024"""
    ]
    
    while True:
        try:
            print(f"\n⏰ Cycle started at {time.strftime('%I:%M %p')}")
            
            # Search for groups
            print("\n🔍 Searching for trading groups...")
            groups_found = []
            
            for term in search_terms[:3]:  # Start with 3 searches
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
                                    'title': chat.title,
                                    'id': chat.id
                                })
                    
                    await asyncio.sleep(2)
                    
                except FloodWaitError as e:
                    print(f"   ⚠️ Rate limit: {e.seconds}s")
                    await asyncio.sleep(e.seconds)
                except Exception as e:
                    print(f"   Error: {e}")
            
            # Remove duplicates
            seen = set()
            unique_groups = []
            for g in groups_found:
                if g['username'] not in seen:
                    seen.add(g['username'])
                    unique_groups.append(g)
            
            print(f"\n✅ Found {len(unique_groups)} unique groups")
            
            # Join groups
            joined = 0
            for group in unique_groups[:5]:  # Join 5 at a time
                try:
                    print(f"   Joining: {group['title']}")
                    await client(JoinChannelRequest(group['username']))
                    joined += 1
                    await asyncio.sleep(random.randint(30, 60))
                    
                except Exception as e:
                    print(f"   Already in or error: {group['title']}")
            
            print(f"\n✅ Joined {joined} new groups")
            
            # Post to groups
            print("\n📤 Posting to groups...")
            posted = 0
            
            dialogs = await client.get_dialogs()
            for dialog in dialogs[:20]:  # Check first 20 dialogs
                if dialog.is_group:
                    try:
                        msg = random.choice(messages)
                        await client.send_message(dialog.entity, msg)
                        print(f"   ✅ Posted to: {dialog.title}")
                        posted += 1
                        
                        await asyncio.sleep(random.randint(120, 180))
                        
                        if posted >= 3:  # Post to 3 groups per cycle
                            break
                            
                    except Exception as e:
                        pass  # Can't post, skip
            
            print(f"\n✅ Posted to {posted} groups")
            
            # Summary
            print("\n📊 CYCLE COMPLETE")
            print(f"   Groups joined: {joined}")
            print(f"   Messages posted: {posted}")
            print(f"   Channel: @AIFinanceNews2024")
            
            # Wait for next cycle
            print("\n⏰ Next cycle in 30 minutes...")
            await asyncio.sleep(1800)  # 30 minutes
            
        except KeyboardInterrupt:
            print("\n🛑 Stopping automation...")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("Retrying in 5 minutes...")
            await asyncio.sleep(300)
    
    await client.disconnect()

if __name__ == "__main__":
    print("="*50)
    print("📱 TELEGRAM AUTOMATION LAUNCHER")
    print("="*50)
    print("\nYour credentials:")
    print(f"Phone: {PHONE}")
    print(f"API ID: {API_ID}")
    print(f"API Hash: {API_HASH[:10]}...")
    print("\n⚠️ You'll receive a verification code in Telegram")
    print("Enter it when prompted")
    print("="*50)
    print("\nStarting...")
    
    asyncio.run(main())