#!/usr/bin/env python3
"""
RUN AUTO POSTER - Uses existing session file
No authentication needed!
"""

import asyncio
import random
import sqlite3
from datetime import datetime
from telethon import TelegramClient
from telethon.tl.functions.messages import SearchGlobalRequest
from telethon.tl.functions.channels import JoinChannelRequest
from telethon.tl.types import InputPeerEmpty
from telethon.errors import FloodWaitError, UserAlreadyParticipantError

API_ID = 23925638
API_HASH = "36f8e3c8515c6b32ce45b5447ac93058"
CHANNEL_LINK = "https://t.me/AIFinanceNews2024"

class RunAutoPoster:
    def __init__(self):
        self.channel_link = CHANNEL_LINK
        self.client = None
        self.init_db()
        
    def init_db(self):
        """Initialize database"""
        conn = sqlite3.connect('poster_tracking.db')
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS posted_groups
                    (group_name TEXT PRIMARY KEY, 
                     last_posted TIMESTAMP,
                     post_count INTEGER DEFAULT 0)''')
        conn.commit()
        conn.close()
    
    async def setup(self):
        """Use existing session file"""
        print("🔌 Connecting with existing session...")
        
        # Try different session files
        session_files = ['srijan_session', 'automation_session']
        
        for session_file in session_files:
            try:
                self.client = TelegramClient(session_file, API_ID, API_HASH)
                await self.client.connect()
                
                if await self.client.is_user_authorized():
                    me = await self.client.get_me()
                    print(f"✅ Connected as: {me.first_name}")
                    return True
            except:
                continue
        
        print("❌ No valid session found")
        return False
    
    async def find_groups(self):
        """Find trading groups"""
        print("\n🔍 Finding groups...")
        
        terms = ["trading", "nifty", "stock market", "options", "intraday"]
        groups = []
        
        for term in terms:
            try:
                result = await self.client(SearchGlobalRequest(
                    q=term,
                    offset_date=None,
                    offset_peer=InputPeerEmpty(),
                    offset_id=0,
                    limit=5
                ))
                
                for chat in result.chats:
                    if hasattr(chat, 'username') and chat.username:
                        if not getattr(chat, 'broadcast', False):
                            groups.append({
                                'username': chat.username,
                                'title': chat.title
                            })
                
                await asyncio.sleep(2)
            except:
                continue
        
        return groups[:10]  # Limit to 10 groups
    
    async def join_groups(self, groups):
        """Join groups"""
        print("\n👥 Joining groups...")
        joined = 0
        
        for group in groups:
            try:
                await self.client(JoinChannelRequest(group['username']))
                print(f"✅ Joined: {group['title']}")
                joined += 1
                await asyncio.sleep(random.randint(20, 40))
            except UserAlreadyParticipantError:
                print(f"Already in: {group['title']}")
            except:
                pass
        
        return joined
    
    async def post_to_groups(self):
        """Post to groups"""
        print("\n📤 Posting to groups...")
        
        messages = [
            f"""📊 Market Analysis - {datetime.now().strftime('%I:%M %p')}

NIFTY outlook: Bullish above 24,800
Key levels: Support 24,650 | Resistance 25,000

Detailed analysis: {self.channel_link}

What's your view?""",

            f"""💡 Trading Wisdom

"Cut losses short, let profits run"

Risk management tips and strategies:
{self.channel_link}

Educational purpose only.""",

            f"""📈 Options Strategy

Iron Condor setup for monthly expiry:
• Sell 24,700 PE & 25,300 CE
• Buy 24,500 PE & 25,500 CE

Full analysis: {self.channel_link}"""
        ]
        
        posted = 0
        dialogs = await self.client.get_dialogs(limit=30)
        
        conn = sqlite3.connect('poster_tracking.db')
        c = conn.cursor()
        
        for dialog in dialogs:
            if dialog.is_group:
                # Check if posted recently
                c.execute('SELECT last_posted FROM posted_groups WHERE group_name=?', 
                         (dialog.title,))
                result = c.fetchone()
                
                if result:
                    last = datetime.fromisoformat(result[0])
                    if (datetime.now() - last).seconds < 86400:  # 24 hours
                        continue
                
                try:
                    msg = random.choice(messages)
                    await self.client.send_message(dialog.entity, msg)
                    print(f"✅ Posted to: {dialog.title[:30]}")
                    
                    # Update database
                    c.execute('''INSERT OR REPLACE INTO posted_groups 
                                VALUES (?, ?, ?)''',
                             (dialog.title, datetime.now().isoformat(), 1))
                    conn.commit()
                    
                    posted += 1
                    await asyncio.sleep(random.randint(120, 180))
                    
                    if posted >= 5:
                        break
                except:
                    pass
        
        conn.close()
        return posted
    
    async def run(self):
        """Main loop"""
        print("\n🚀 AUTO POSTER RUNNING!")
        print("="*50)
        
        if not await self.setup():
            print("Failed to setup. Run quick_setup.py first")
            return
        
        cycle = 1
        
        while True:
            try:
                print(f"\n📍 Cycle {cycle} - {datetime.now().strftime('%I:%M %p')}")
                
                # Find and join groups every 3 cycles
                if cycle % 3 == 1:
                    groups = await self.find_groups()
                    if groups:
                        await self.join_groups(groups[:3])
                
                # Post to groups
                posted = await self.post_to_groups()
                print(f"Posted to {posted} groups")
                
                print(f"\nNext cycle in 1 hour...")
                cycle += 1
                await asyncio.sleep(3600)
                
            except Exception as e:
                print(f"Error: {e}")
                await asyncio.sleep(300)

if __name__ == "__main__":
    poster = RunAutoPoster()
    asyncio.run(poster.run())