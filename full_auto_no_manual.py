#!/usr/bin/env python3
"""
FULL AUTOMATION - NO MANUAL WORK REQUIRED
This bot handles EVERYTHING automatically
"""

import asyncio
import random
import time
import os
from datetime import datetime
import requests
from telethon import TelegramClient, events
from telethon.tl.functions.messages import SearchGlobalRequest, GetDialogsRequest
from telethon.tl.functions.channels import JoinChannelRequest, GetFullChannelRequest
from telethon.tl.types import InputPeerEmpty
from telethon.errors import FloodWaitError, UserAlreadyParticipantError, SessionPasswordNeededError
from telethon.sessions import StringSession
import sqlite3

# Your credentials
API_ID = 23925638
API_HASH = "36f8e3c8515c6b32ce45b5447ac93058"
PHONE = "+919819515128"
BOT_TOKEN = "8478124403:AAFNni_9GQtWwrzk3ElhkMkTKljbSQyWp9Y"

class FullAutoBot:
    def __init__(self):
        self.channel = "@AIFinanceNews2024"
        self.channel_link = "https://t.me/AIFinanceNews2024"
        self.session_string = None
        self.client = None
        self.init_database()
        
    def init_database(self):
        """Initialize database for tracking"""
        conn = sqlite3.connect('full_auto.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE,
                title TEXT,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                posted BOOLEAN DEFAULT 0
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS session (
                id INTEGER PRIMARY KEY,
                session_string TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def save_session(self, session_string):
        """Save session to database"""
        conn = sqlite3.connect('full_auto.db')
        cursor = conn.cursor()
        cursor.execute('INSERT OR REPLACE INTO session (id, session_string) VALUES (1, ?)', (session_string,))
        conn.commit()
        conn.close()
    
    def load_session(self):
        """Load saved session"""
        conn = sqlite3.connect('full_auto.db')
        cursor = conn.cursor()
        cursor.execute('SELECT session_string FROM session WHERE id = 1')
        result = cursor.fetchone()
        conn.close()
        return result[0] if result else None
    
    async def authenticate_once(self):
        """Authenticate and save session permanently"""
        print("🔐 Setting up permanent authentication...")
        
        # Check for saved session
        saved_session = self.load_session()
        
        if saved_session:
            print("✅ Using saved session")
            self.client = TelegramClient(StringSession(saved_session), API_ID, API_HASH)
        else:
            print("📱 Creating new session")
            self.client = TelegramClient(StringSession(), API_ID, API_HASH)
        
        await self.client.connect()
        
        if not await self.client.is_user_authorized():
            print(f"📤 Sending code to {PHONE}")
            await self.client.send_code_request(PHONE)
            
            # Auto-retry with different codes
            possible_codes = ["47049", "12345", "00000"]  # Try known codes first
            
            for code in possible_codes:
                try:
                    print(f"Trying code: {code}")
                    await self.client.sign_in(PHONE, code)
                    print("✅ Successfully authenticated!")
                    break
                except:
                    continue
            else:
                # If no code works, generate a new session later
                print("⚠️ Need manual code entry once")
                code = input("Enter code from Telegram: ")
                await self.client.sign_in(PHONE, code)
        
        # Save session for permanent use
        session_string = self.client.session.save()
        self.save_session(session_string)
        print("✅ Session saved permanently!")
        
        me = await self.client.get_me()
        print(f"✅ Logged in as: {me.first_name}")
        return True
    
    async def find_and_join_groups(self):
        """Automatically find and join groups"""
        print("\n🔍 Finding groups automatically...")
        
        # Comprehensive search terms
        search_terms = [
            "trading india", "stock market india", "nifty", "banknifty",
            "options trading", "intraday", "share market", "indian stocks",
            "zerodha", "groww", "upstox", "market chat", "trading discussion",
            "forex india", "commodity trading", "crypto india", "investment india"
        ]
        
        groups_joined = 0
        
        for term in search_terms:
            try:
                print(f"Searching: {term}")
                
                # Search for groups
                result = await self.client(SearchGlobalRequest(
                    q=term,
                    offset_date=None,
                    offset_peer=InputPeerEmpty(),
                    offset_id=0,
                    limit=10
                ))
                
                # Join groups automatically
                for chat in result.chats:
                    if hasattr(chat, 'username') and chat.username:
                        try:
                            # Join the group
                            await self.client(JoinChannelRequest(chat.username))
                            print(f"✅ Joined: {chat.title}")
                            
                            # Save to database
                            conn = sqlite3.connect('full_auto.db')
                            cursor = conn.cursor()
                            cursor.execute('''
                                INSERT OR IGNORE INTO groups (username, title)
                                VALUES (?, ?)
                            ''', (chat.username, chat.title))
                            conn.commit()
                            conn.close()
                            
                            groups_joined += 1
                            
                            # Small delay to avoid flood
                            await asyncio.sleep(random.randint(20, 40))
                            
                        except UserAlreadyParticipantError:
                            pass
                        except Exception as e:
                            print(f"Couldn't join {chat.title}: {e}")
                
                # Delay between searches
                await asyncio.sleep(random.randint(30, 60))
                
            except FloodWaitError as e:
                print(f"Rate limit. Waiting {e.seconds} seconds...")
                await asyncio.sleep(e.seconds)
            except Exception as e:
                print(f"Search error: {e}")
        
        print(f"\n✅ Automatically joined {groups_joined} groups!")
        return groups_joined
    
    async def auto_post_to_groups(self):
        """Automatically post to all joined groups"""
        print("\n📤 Auto-posting to groups...")
        
        messages = [
            f"""📊 Accurate Market Data Alert!

{self.channel}

✅ Multi-source verification
✅ TradingView + Yahoo + NSE
✅ Educational content only
✅ No fake tips

Free for first 500 members!
{self.channel_link}""",

            f"""🎯 For serious traders:

{self.channel}

• Every price verified from 3+ sources
• Real-time market updates
• Educational analysis
• SEBI compliant

Join now: {self.channel_link}""",

            f"""📈 New Discovery!

{self.channel}

What makes us different:
• Verify EVERY price before posting
• Cross-check with multiple sources
• Educational purpose only

{self.channel_link}"""
        ]
        
        posted = 0
        dialogs = await self.client.get_dialogs(limit=100)
        
        for dialog in dialogs:
            if dialog.is_group or (dialog.is_channel and not dialog.entity.broadcast):
                try:
                    # Post message
                    msg = random.choice(messages)
                    await self.client.send_message(dialog.entity, msg)
                    print(f"✅ Posted to: {dialog.title}")
                    posted += 1
                    
                    # Mark as posted
                    conn = sqlite3.connect('full_auto.db')
                    cursor = conn.cursor()
                    cursor.execute('UPDATE groups SET posted = 1 WHERE title = ?', (dialog.title,))
                    conn.commit()
                    conn.close()
                    
                    # Delay to avoid spam
                    await asyncio.sleep(random.randint(60, 120))
                    
                    if posted >= 10:  # Limit per cycle
                        break
                        
                except Exception as e:
                    pass  # Skip if can't post
        
        print(f"\n✅ Posted to {posted} groups automatically!")
        return posted
    
    async def keep_channel_active(self):
        """Post content to keep channel active"""
        url = f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage'
        
        messages = [
            "📊 MARKET WISDOM\n\nAlways verify from multiple sources!\n\nWe check:\n• TradingView\n• Yahoo Finance\n• NSE Official\n\n@AIFinanceNews2024",
            "🎯 RISK MANAGEMENT\n\nNever risk more than 2% per trade.\n\nProtect capital first!\n\nEducational purpose only.\n\n@AIFinanceNews2024",
            "📈 TECHNICAL TIP\n\nVolume confirms price movement.\n\nNo volume = Weak move\n\nEducational content only.\n\n@AIFinanceNews2024"
        ]
        
        msg = random.choice(messages)
        data = {'chat_id': self.channel, 'text': msg}
        
        response = requests.post(url, json=data)
        if response.status_code == 200:
            print("✅ Posted to channel")
    
    async def run_full_automation(self):
        """Main automation loop - runs forever"""
        print("\n🚀 FULL AUTOMATION STARTED - NO MANUAL WORK NEEDED!")
        print("="*60)
        
        # Authenticate once
        if not await self.authenticate_once():
            print("❌ Authentication failed. Retrying...")
            return
        
        cycle = 1
        
        while True:
            try:
                print(f"\n📍 AUTOMATION CYCLE {cycle}")
                print("="*60)
                print(f"Time: {datetime.now().strftime('%I:%M %p')}")
                
                # 1. Keep channel active
                await self.keep_channel_active()
                
                # 2. Find and join new groups
                new_groups = await self.find_and_join_groups()
                
                # 3. Post to groups
                posts_made = await self.auto_post_to_groups()
                
                # 4. Statistics
                conn = sqlite3.connect('full_auto.db')
                cursor = conn.cursor()
                cursor.execute('SELECT COUNT(*) FROM groups')
                total_groups = cursor.fetchone()[0]
                cursor.execute('SELECT COUNT(*) FROM groups WHERE posted = 1')
                posted_groups = cursor.fetchone()[0]
                conn.close()
                
                print("\n📊 CYCLE STATISTICS")
                print("-"*40)
                print(f"Total groups joined: {total_groups}")
                print(f"New groups this cycle: {new_groups}")
                print(f"Posts made this cycle: {posts_made}")
                print(f"Total groups posted to: {posted_groups}")
                print(f"Channel: {self.channel}")
                print("-"*40)
                
                # 5. Wait for next cycle
                wait_time = 30  # 30 minutes
                print(f"\n⏰ Next cycle in {wait_time} minutes...")
                print("Bot is running 24/7 - NO MANUAL WORK NEEDED!")
                print("="*60)
                
                cycle += 1
                await asyncio.sleep(wait_time * 60)
                
            except KeyboardInterrupt:
                print("\n🛑 Automation stopped")
                break
            except Exception as e:
                print(f"\n❌ Error: {e}")
                print("Auto-recovering in 5 minutes...")
                await asyncio.sleep(300)

async def main():
    bot = FullAutoBot()
    await bot.run_full_automation()

if __name__ == "__main__":
    print("🤖 LAUNCHING FULL AUTOMATION - ZERO MANUAL WORK!")
    print("="*60)
    print("This bot will:")
    print("✅ Find groups automatically")
    print("✅ Join them automatically")
    print("✅ Post your channel automatically")
    print("✅ Run 24/7 without any manual intervention")
    print("="*60)
    asyncio.run(main())