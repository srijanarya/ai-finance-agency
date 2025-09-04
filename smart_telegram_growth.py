#!/usr/bin/env python3
"""
SMART TELEGRAM GROWTH - Non-spammy, organic growth strategy
Focus on quality engagement, not spam
"""

import asyncio
import random
import time
from datetime import datetime
from telethon import TelegramClient
from telethon.tl.functions.messages import SearchGlobalRequest, GetDialogsRequest
from telethon.tl.functions.channels import JoinChannelRequest
from telethon.tl.types import InputPeerEmpty
from telethon.errors import FloodWaitError, UserAlreadyParticipantError
import sqlite3
import requests

# Credentials
API_ID = 23925638
API_HASH = "36f8e3c8515c6b32ce45b5447ac93058"
BOT_TOKEN = "8478124403:AAFNni_9GQtWwrzk3ElhkMkTKljbSQyWp9Y"
CHANNEL = "@AIFinanceNews2024"
CHANNEL_LINK = "https://t.me/AIFinanceNews2024"

class SmartTelegramGrowth:
    def __init__(self):
        self.channel = CHANNEL
        self.channel_link = CHANNEL_LINK
        self.client = None
        self.init_database()
        
    def init_database(self):
        """Track groups to avoid spam"""
        conn = sqlite3.connect('smart_growth.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS group_posts (
                id INTEGER PRIMARY KEY,
                group_name TEXT,
                last_posted TIMESTAMP,
                post_count INTEGER DEFAULT 0,
                quality_score INTEGER DEFAULT 5
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages_sent (
                id INTEGER PRIMARY KEY,
                message_type TEXT,
                group_name TEXT,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    async def setup_client(self):
        """Setup Telegram client with saved session"""
        # Try to use saved session
        self.client = TelegramClient('smart_growth_session', API_ID, API_HASH)
        await self.client.start()
        
        me = await self.client.get_me()
        print(f"✅ Logged in as: {me.first_name}")
        return True
    
    async def find_quality_groups(self):
        """Find high-quality trading groups"""
        print("\n🔍 Finding quality trading groups...")
        
        # Specific searches for Indian trading groups
        search_terms = [
            "nifty discussion",
            "banknifty traders",
            "indian stocks tips",
            "share market india",
            "options trading india",
            "intraday calls",
            "stock market learning",
            "trading strategies india"
        ]
        
        quality_groups = []
        
        for term in search_terms:
            try:
                print(f"   Searching: {term}")
                
                result = await self.client(SearchGlobalRequest(
                    q=term,
                    offset_date=None,
                    offset_peer=InputPeerEmpty(),
                    offset_id=0,
                    limit=10
                ))
                
                for chat in result.chats:
                    if hasattr(chat, 'username') and chat.username:
                        # Check if it's a group (not channel)
                        if not getattr(chat, 'broadcast', False):
                            participants = getattr(chat, 'participants_count', 0)
                            
                            # Only quality groups (100+ members)
                            if participants > 100:
                                quality_groups.append({
                                    'username': chat.username,
                                    'title': chat.title,
                                    'members': participants
                                })
                                print(f"      ✓ Found: {chat.title} ({participants} members)")
                
                # Respect rate limits
                await asyncio.sleep(random.randint(5, 10))
                
            except FloodWaitError as e:
                print(f"   ⏳ Rate limit, waiting {e.seconds}s...")
                await asyncio.sleep(e.seconds)
            except Exception as e:
                continue
        
        return quality_groups
    
    async def join_groups_smartly(self, groups):
        """Join groups with delays to avoid spam detection"""
        print("\n👥 Joining groups smartly...")
        
        joined = 0
        for group in groups[:10]:  # Max 10 groups per session
            try:
                await self.client(JoinChannelRequest(group['username']))
                print(f"   ✅ Joined: {group['title']}")
                joined += 1
                
                # Smart delay (longer between joins)
                delay = random.randint(60, 120)
                print(f"   ⏰ Waiting {delay}s before next join...")
                await asyncio.sleep(delay)
                
            except UserAlreadyParticipantError:
                print(f"   ✓ Already in: {group['title']}")
            except Exception as e:
                print(f"   ❌ Couldn't join: {group['title']}")
        
        return joined
    
    def create_value_messages(self):
        """Create valuable, non-spammy messages"""
        messages = [
            """📊 Market Analysis for Tomorrow:

Based on options data, expecting:
• NIFTY range: 24,700-24,950
• Key support: 24,650
• Resistance: 25,000

For detailed analysis with charts, check @AIFinanceNews2024

What's your view on tomorrow's market?""",

            """💡 Trading Tip:

Always check these before entering a trade:
1. Volume confirmation
2. Support/Resistance levels
3. Market trend
4. Risk-Reward ratio

I share detailed setups on @AIFinanceNews2024
Educational purpose only.""",

            """📈 Interesting observation:

FII data shows continuous buying in IT sector.
TCS, Infosys, Wipro showing accumulation.

Anyone else tracking IT stocks?

I post detailed FII/DII analysis on @AIFinanceNews2024""",

            """🎯 Options Strategy for Monthly Expiry:

With VIX at 13, consider:
• Iron Condor on NIFTY
• Bull Put Spread on strong stocks
• Covered calls on holdings

Detailed strategies with greeks on @AIFinanceNews2024

What's your expiry strategy?""",

            """📰 Important News Impact:

US Fed meeting next week.
Historical data shows NIFTY reacts 1-2% on Fed days.

How are you positioning?

I analyze all major events impact on @AIFinanceNews2024""",

            """📊 Today's Hidden Gem:

Noticed unusual options activity in a mid-cap stock.
OI increased 300% with price consolidation.
Possible breakout coming.

Full analysis posted on @AIFinanceNews2024

Anyone else tracking unusual options activity?"""
        ]
        
        return messages
    
    async def post_to_groups_intelligently(self):
        """Post valuable content to groups without spamming"""
        print("\n📤 Sharing valuable content in groups...")
        
        conn = sqlite3.connect('smart_growth.db')
        cursor = conn.cursor()
        
        dialogs = await self.client.get_dialogs(limit=50)
        messages = self.create_value_messages()
        
        posted = 0
        
        for dialog in dialogs:
            if dialog.is_group:
                try:
                    # Check last post time for this group
                    cursor.execute('''
                        SELECT last_posted, post_count 
                        FROM group_posts 
                        WHERE group_name = ?
                    ''', (dialog.title,))
                    
                    result = cursor.fetchone()
                    
                    # Smart posting rules
                    can_post = False
                    
                    if not result:
                        # Never posted here
                        can_post = True
                    else:
                        last_posted = datetime.fromisoformat(result[0]) if result[0] else None
                        post_count = result[1]
                        
                        if last_posted:
                            hours_since = (datetime.now() - last_posted).seconds / 3600
                            
                            # Post only if:
                            # - More than 24 hours passed
                            # - Less than 3 posts total in this group
                            if hours_since > 24 and post_count < 3:
                                can_post = True
                    
                    if can_post:
                        # Choose appropriate message
                        message = random.choice(messages)
                        
                        # Send message
                        await self.client.send_message(dialog.entity, message)
                        print(f"   ✅ Shared in: {dialog.title[:30]}")
                        
                        # Update database
                        cursor.execute('''
                            INSERT OR REPLACE INTO group_posts 
                            (group_name, last_posted, post_count)
                            VALUES (?, ?, COALESCE((SELECT post_count FROM group_posts WHERE group_name = ?), 0) + 1)
                        ''', (dialog.title, datetime.now().isoformat(), dialog.title))
                        
                        conn.commit()
                        posted += 1
                        
                        # Long delay between posts (2-4 minutes)
                        delay = random.randint(120, 240)
                        print(f"   ⏰ Waiting {delay}s before next post...")
                        await asyncio.sleep(delay)
                        
                        if posted >= 5:  # Max 5 posts per session
                            break
                    
                except Exception as e:
                    continue
        
        conn.close()
        print(f"\n✅ Posted in {posted} groups")
        return posted
    
    def boost_channel_engagement(self):
        """Post engaging content to keep channel active"""
        
        engaging_posts = [
            f"""🔥 POLL: Tomorrow's Market Direction?

React with:
👍 - Bullish (Above 24,900)
👎 - Bearish (Below 24,700)
❤️ - Sideways (24,700-24,900)

I'll share the analysis based on your votes!

@AIFinanceNews2024""",

            f"""💰 CHALLENGE: Spot the Breakout!

Which stock will breakout tomorrow?
A) RELIANCE
B) TCS  
C) HDFC BANK
D) INFOSYS

First 10 correct answers get exclusive analysis!

Answer in comments 👇

@AIFinanceNews2024""",

            f"""📊 FREE EBOOK ALERT!

"Top 10 Candlestick Patterns That Actually Work"

To get it:
1. Join @AIFinanceNews2024
2. Forward this message to 2 trading friends
3. Comment "DONE"

Sending in 30 minutes!""",

            f"""🎯 LIVE TRADE ALERT!

Buying NIFTY 24850 CE at 120
Stop Loss: 100
Target 1: 150
Target 2: 180

Reason: Breakout above resistance with volume

Following this trade? React with 🚀

Updates only on @AIFinanceNews2024"""
        ]
        
        # Post to channel
        for post in engaging_posts:
            url = f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage'
            data = {
                'chat_id': CHANNEL,
                'text': post,
                'parse_mode': 'HTML'
            }
            
            requests.post(url, json=data)
            print(f"✅ Posted engaging content")
            time.sleep(2)
    
    async def run_smart_growth(self):
        """Main smart growth loop"""
        print("\n🚀 SMART TELEGRAM GROWTH STARTED!")
        print("="*50)
        print("Strategy: Quality over Quantity")
        print("Goal: 500 subscribers organically")
        print("="*50)
        
        # Setup client
        if not await self.setup_client():
            print("❌ Failed to setup client")
            return
        
        cycle = 1
        
        while True:
            try:
                print(f"\n📍 GROWTH CYCLE {cycle}")
                print(f"Time: {datetime.now().strftime('%I:%M %p')}")
                print("-"*40)
                
                # 1. Find quality groups (once per day)
                if cycle == 1 or cycle % 24 == 0:
                    print("\n[Phase 1] Finding quality groups...")
                    groups = await self.find_quality_groups()
                    
                    if groups:
                        print(f"Found {len(groups)} quality groups")
                        
                        # Join some groups
                        print("\n[Phase 2] Joining groups...")
                        joined = await self.join_groups_smartly(groups[:5])
                        print(f"Joined {joined} new groups")
                
                # 2. Post valuable content
                print("\n[Phase 3] Sharing valuable content...")
                posted = await self.post_to_groups_intelligently()
                
                # 3. Boost channel engagement
                print("\n[Phase 4] Boosting channel engagement...")
                self.boost_channel_engagement()
                
                # Statistics
                print(f"\n📊 CYCLE {cycle} COMPLETE")
                print(f"Posts made: {posted}")
                print(f"Channel: {CHANNEL}")
                
                # Wait before next cycle (1 hour)
                print(f"\n⏰ Next cycle in 1 hour...")
                print("="*50)
                
                cycle += 1
                await asyncio.sleep(3600)  # 1 hour
                
            except KeyboardInterrupt:
                print("\n✅ Smart growth stopped")
                break
            except Exception as e:
                print(f"\n❌ Error: {e}")
                print("Recovering in 10 minutes...")
                await asyncio.sleep(600)

async def main():
    bot = SmartTelegramGrowth()
    await bot.run_smart_growth()

if __name__ == "__main__":
    print("Starting Smart Telegram Growth System...")
    asyncio.run(main())