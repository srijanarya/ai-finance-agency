#!/usr/bin/env python3
"""
AUTO GROUP POSTER - Joins groups and posts automatically
One-time setup, then runs forever
"""

import asyncio
import random
import time
import sqlite3
from datetime import datetime, timedelta
from telethon import TelegramClient
from telethon.tl.functions.messages import SearchGlobalRequest, GetDialogsRequest
from telethon.tl.functions.channels import JoinChannelRequest
from telethon.tl.types import InputPeerEmpty
from telethon.errors import FloodWaitError, UserAlreadyParticipantError
from telethon.sessions import StringSession
import os

# Your credentials
API_ID = 23925638
API_HASH = "36f8e3c8515c6b32ce45b5447ac93058"
PHONE = "+919819515128"
CHANNEL = "@AIFinanceNews2024"
CHANNEL_LINK = "https://t.me/AIFinanceNews2024"

# Session string (will be saved after first run)
SESSION_STRING = ""

class AutoGroupPoster:
    def __init__(self):
        self.channel = CHANNEL
        self.channel_link = CHANNEL_LINK
        self.client = None
        self.init_database()
        
    def init_database(self):
        """Create database to track everything"""
        conn = sqlite3.connect('auto_poster.db')
        cursor = conn.cursor()
        
        # Track groups
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE,
                title TEXT,
                members INTEGER,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_posted TIMESTAMP,
                post_count INTEGER DEFAULT 0,
                can_post BOOLEAN DEFAULT 1
            )
        ''')
        
        # Track session
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS session (
                id INTEGER PRIMARY KEY,
                string_session TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def save_session(self, session_string):
        """Save session permanently"""
        conn = sqlite3.connect('auto_poster.db')
        cursor = conn.cursor()
        cursor.execute('INSERT OR REPLACE INTO session (id, string_session) VALUES (1, ?)', 
                      (session_string,))
        conn.commit()
        conn.close()
        print("✅ Session saved to database")
    
    def load_session(self):
        """Load saved session"""
        conn = sqlite3.connect('auto_poster.db')
        cursor = conn.cursor()
        cursor.execute('SELECT string_session FROM session WHERE id = 1')
        result = cursor.fetchone()
        conn.close()
        
        if result:
            print("✅ Found saved session")
            return result[0]
        return None
    
    async def setup_client(self):
        """Setup Telegram client - one time authentication"""
        print("\n🔐 Setting up Telegram client...")
        
        # Try to load saved session
        saved_session = self.load_session()
        
        if saved_session:
            print("Using saved session...")
            self.client = TelegramClient(
                StringSession(saved_session), 
                API_ID, 
                API_HASH
            )
        else:
            print("Creating new session...")
            self.client = TelegramClient(
                StringSession(), 
                API_ID, 
                API_HASH
            )
        
        await self.client.connect()
        
        # Check if authorized
        if not await self.client.is_user_authorized():
            print(f"\n📱 First time setup - sending code to {PHONE}")
            await self.client.send_code_request(PHONE)
            
            print("\n⚠️ ONE-TIME AUTHENTICATION REQUIRED!")
            print("Check your Telegram app for the code")
            code = input("Enter the code you received: ")
            
            try:
                await self.client.sign_in(PHONE, code)
                print("✅ Successfully authenticated!")
                
                # Save session for future use
                session_string = self.client.session.save()
                self.save_session(session_string)
                
                print("✅ Session saved! You won't need to login again!")
                
            except Exception as e:
                print(f"❌ Authentication failed: {e}")
                return False
        
        me = await self.client.get_me()
        print(f"✅ Logged in as: {me.first_name} (@{me.username})")
        return True
    
    async def find_and_join_groups(self):
        """Find and join trading groups automatically"""
        print("\n🔍 Finding trading groups...")
        
        # Search terms for Indian trading groups
        searches = [
            "trading india", "nifty", "banknifty", "stock market india",
            "options trading", "intraday", "share market", "indian stocks",
            "zerodha", "trading tips", "forex india", "commodity",
            "sensex", "bse nse", "equity tips"
        ]
        
        all_groups = []
        
        for search_term in searches:
            try:
                print(f"   Searching: {search_term}")
                
                # Search for groups
                result = await self.client(SearchGlobalRequest(
                    q=search_term,
                    offset_date=None,
                    offset_peer=InputPeerEmpty(),
                    offset_id=0,
                    limit=20
                ))
                
                # Process results
                for chat in result.chats:
                    if hasattr(chat, 'username') and chat.username:
                        # Check if it's a group (not channel)
                        if not getattr(chat, 'broadcast', False):
                            members = getattr(chat, 'participants_count', 0)
                            
                            # Only groups with 100+ members
                            if members > 100:
                                all_groups.append({
                                    'username': chat.username,
                                    'title': chat.title,
                                    'members': members
                                })
                
                # Rate limit protection
                await asyncio.sleep(random.randint(3, 7))
                
            except FloodWaitError as e:
                print(f"   Rate limit - waiting {e.seconds}s")
                await asyncio.sleep(e.seconds)
            except Exception as e:
                continue
        
        # Remove duplicates
        unique_groups = {g['username']: g for g in all_groups}.values()
        print(f"\n✅ Found {len(unique_groups)} unique groups")
        
        # Join groups
        joined_count = 0
        conn = sqlite3.connect('auto_poster.db')
        cursor = conn.cursor()
        
        for group in unique_groups:
            try:
                # Check if already in database
                cursor.execute('SELECT id FROM groups WHERE username = ?', (group['username'],))
                if cursor.fetchone():
                    continue
                
                # Join the group
                await self.client(JoinChannelRequest(group['username']))
                print(f"   ✅ Joined: {group['title']} ({group['members']} members)")
                
                # Save to database
                cursor.execute('''
                    INSERT INTO groups (username, title, members)
                    VALUES (?, ?, ?)
                ''', (group['username'], group['title'], group['members']))
                conn.commit()
                
                joined_count += 1
                
                # Smart delay to avoid spam detection
                delay = random.randint(30, 60)
                print(f"   Waiting {delay}s before next join...")
                await asyncio.sleep(delay)
                
                # Limit joins per session
                if joined_count >= 10:
                    print("   Reached join limit for this session")
                    break
                    
            except UserAlreadyParticipantError:
                # Already in group, add to database
                cursor.execute('''
                    INSERT OR IGNORE INTO groups (username, title, members)
                    VALUES (?, ?, ?)
                ''', (group['username'], group['title'], group['members']))
                conn.commit()
            except Exception as e:
                print(f"   ❌ Couldn't join {group['title']}: {str(e)[:50]}")
        
        conn.close()
        print(f"\n✅ Joined {joined_count} new groups")
        return joined_count
    
    async def post_to_groups(self):
        """Post to groups intelligently"""
        print("\n📤 Posting to groups...")
        
        conn = sqlite3.connect('auto_poster.db')
        cursor = conn.cursor()
        
        # Get groups that haven't been posted to recently
        cursor.execute('''
            SELECT username, title, members 
            FROM groups 
            WHERE can_post = 1
            AND (last_posted IS NULL OR last_posted < datetime('now', '-24 hours'))
            ORDER BY members DESC
            LIMIT 10
        ''')
        
        groups = cursor.fetchall()
        
        if not groups:
            print("No groups available for posting right now")
            return 0
        
        # Create valuable messages
        messages = [
            f"""📊 Market Insight - {datetime.now().strftime('%I:%M %p')}

NIFTY showing bullish momentum above 24,800.
Key resistance at 25,000.

Sectors to watch:
• Banking - Leading the rally
• IT - Consolidation phase
• Auto - Showing strength

For detailed analysis with charts: {self.channel_link}

What's your market view?""",

            f"""💡 Trading Tip of the Day

Never enter a trade without:
1. Clear stop loss
2. Risk-reward ratio minimum 1:2
3. Volume confirmation

I share my trade setups with all these parameters on {self.channel_link}

Educational purpose only.""",

            f"""📈 Options Data Analysis

NIFTY Options Chain:
• Max Call OI: 25,000 (Resistance)
• Max Put OI: 24,500 (Support)
• PCR: 0.92 (Neutral)

Range for tomorrow: 24,500-25,000

Detailed options strategies: {self.channel_link}""",

            f"""🎯 Stock in Focus

Watching RELIANCE for breakout above 2,980.
Volume picking up, RSI favorable.

Target: 3,050 | Stop: 2,920

More such opportunities shared on {self.channel_link}

This is for educational purpose only."""
        ]
        
        posted = 0
        
        # Get dialogs
        dialogs = await self.client.get_dialogs(limit=100)
        
        for dialog in dialogs:
            # Check if it's a group we want to post to
            group_info = None
            for g in groups:
                if dialog.title and g[1] in dialog.title:
                    group_info = g
                    break
            
            if group_info and dialog.is_group:
                try:
                    # Choose a message
                    message = random.choice(messages)
                    
                    # Send message
                    await self.client.send_message(dialog.entity, message)
                    print(f"   ✅ Posted to: {dialog.title[:40]}")
                    
                    # Update database
                    cursor.execute('''
                        UPDATE groups 
                        SET last_posted = ?, post_count = post_count + 1
                        WHERE username = ?
                    ''', (datetime.now().isoformat(), group_info[0]))
                    conn.commit()
                    
                    posted += 1
                    
                    # Smart delay between posts
                    delay = random.randint(120, 240)  # 2-4 minutes
                    print(f"   Waiting {delay}s before next post...")
                    await asyncio.sleep(delay)
                    
                    # Limit posts per session
                    if posted >= 5:
                        print("   Posted to enough groups this session")
                        break
                        
                except Exception as e:
                    print(f"   ❌ Couldn't post to {dialog.title}: {str(e)[:50]}")
                    
                    # Mark as can't post
                    if "USER_BANNED_IN_CHANNEL" in str(e):
                        cursor.execute('''
                            UPDATE groups SET can_post = 0 WHERE username = ?
                        ''', (group_info[0],))
                        conn.commit()
        
        conn.close()
        print(f"\n✅ Posted to {posted} groups")
        return posted
    
    async def run_auto_poster(self):
        """Main loop - runs forever"""
        print("\n🚀 AUTO GROUP POSTER STARTED!")
        print("="*60)
        
        # Setup client once
        if not await self.setup_client():
            print("❌ Failed to setup client")
            return
        
        print("\n✅ Setup complete! Bot will now run 24/7")
        print("="*60)
        
        cycle = 1
        
        while True:
            try:
                print(f"\n📍 CYCLE {cycle} - {datetime.now().strftime('%I:%M %p')}")
                print("-"*40)
                
                # Phase 1: Find and join new groups (once every 6 hours)
                if cycle == 1 or cycle % 6 == 0:
                    print("\n[Phase 1] Finding new groups...")
                    joined = await self.find_and_join_groups()
                    
                    # Wait after joining
                    if joined > 0:
                        print("Waiting 10 minutes after joining...")
                        await asyncio.sleep(600)
                
                # Phase 2: Post to groups
                print("\n[Phase 2] Posting to groups...")
                posted = await self.post_to_groups()
                
                # Statistics
                conn = sqlite3.connect('auto_poster.db')
                cursor = conn.cursor()
                cursor.execute('SELECT COUNT(*) FROM groups WHERE can_post = 1')
                active_groups = cursor.fetchone()[0]
                cursor.execute('SELECT SUM(post_count) FROM groups')
                total_posts = cursor.fetchone()[0] or 0
                conn.close()
                
                print(f"\n📊 STATISTICS")
                print(f"Active groups: {active_groups}")
                print(f"Total posts made: {total_posts}")
                print(f"Channel: {self.channel}")
                
                # Wait before next cycle
                wait_time = 60  # 1 hour
                print(f"\n⏰ Next cycle in {wait_time} minutes...")
                print("="*60)
                
                cycle += 1
                await asyncio.sleep(wait_time * 60)
                
            except KeyboardInterrupt:
                print("\n✅ Auto poster stopped")
                break
            except Exception as e:
                print(f"\n❌ Error: {e}")
                print("Recovering in 10 minutes...")
                await asyncio.sleep(600)

async def main():
    poster = AutoGroupPoster()
    await poster.run_auto_poster()

if __name__ == "__main__":
    print("""
╔══════════════════════════════════════════════════════╗
║           AUTO GROUP POSTER - SETUP                   ║
╠══════════════════════════════════════════════════════╣
║                                                        ║
║  This bot will:                                       ║
║  ✅ Find trading groups automatically                 ║
║  ✅ Join them intelligently                          ║
║  ✅ Post valuable content                            ║
║  ✅ Run 24/7 without intervention                    ║
║                                                        ║
║  First run: You'll need to enter code ONCE           ║
║  After that: Fully automated forever!                 ║
║                                                        ║
╚══════════════════════════════════════════════════════╝
    """)
    
    asyncio.run(main())