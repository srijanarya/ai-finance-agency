#!/usr/bin/env python3
"""
Telegram Power Bot - Fully automated group finder and poster
Finds groups that allow messages and auto-posts
"""

import asyncio
import random
import time
from datetime import datetime, timedelta
import os
from typing import List, Dict
from dotenv import load_dotenv
import sqlite3

try:
    from telethon import TelegramClient, events
    from telethon.tl.functions.channels import JoinChannelRequest, GetFullChannelRequest
    from telethon.tl.functions.messages import GetHistoryRequest, GetDialogsRequest
    from telethon.tl.types import Channel, Chat, User, InputPeerChannel
    from telethon.errors import FloodWaitError, ChannelPrivateError, UserAlreadyParticipantError, ChatWriteForbiddenError
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call(["pip3", "install", "telethon", "python-dotenv"])
    from telethon import TelegramClient, events
    from telethon.tl.functions.channels import JoinChannelRequest, GetFullChannelRequest
    from telethon.tl.functions.messages import GetHistoryRequest, GetDialogsRequest
    from telethon.tl.types import Channel, Chat, User, InputPeerChannel
    from telethon.errors import FloodWaitError, ChannelPrivateError, UserAlreadyParticipantError, ChatWriteForbiddenError

load_dotenv()

class TelegramPowerBot:
    def __init__(self):
        self.api_id = os.getenv('TELEGRAM_API_ID')
        self.api_hash = os.getenv('TELEGRAM_API_HASH')
        self.phone = os.getenv('TELEGRAM_PHONE')
        self.my_channel = "@AIFinanceNews2024"
        
        # Initialize database
        self.init_database()
        
        # Search keywords for finding groups
        self.search_keywords = [
            "nifty", "banknifty", "stock market india", "trading india",
            "nse", "bse", "sensex", "options trading", "intraday",
            "share market", "indian stocks", "trading tips", "market news",
            "finance india", "investment india", "trading community"
        ]
        
        # Promotional messages that work
        self.messages = [
            {
                "type": "question",
                "text": f"""Anyone here verify their data from multiple sources?

I found {self.my_channel} - they check TradingView + Yahoo + NSE before posting.

Thoughts? 🤔"""
            },
            {
                "type": "helpful",
                "text": f"""For those discussing data accuracy:

{self.my_channel} cross-verifies everything:
• TradingView ✅
• Yahoo Finance ✅
• NSE Official ✅

Educational content only."""
            },
            {
                "type": "casual", 
                "text": f"""Just sharing - {self.my_channel}

Multi-source verified data. No fake tips.

Might be useful for some here 📊"""
            },
            {
                "type": "testimonial",
                "text": f"""Been using {self.my_channel} for market data.

Every price matched my terminal. They verify from 3+ sources.

Free for now: https://t.me/AIFinanceNews2024"""
            }
        ]
        
        self.client = None
        self.joined_groups = []
        self.posted_groups = []
    
    def init_database(self):
        """Initialize database for tracking"""
        conn = sqlite3.connect('telegram_bot.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id TEXT UNIQUE,
                group_name TEXT,
                member_count INTEGER,
                can_post BOOLEAN,
                joined_at TIMESTAMP,
                last_posted TIMESTAMP,
                post_count INTEGER DEFAULT 0,
                status TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id TEXT,
                message TEXT,
                posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                success BOOLEAN
            )
        ''')
        
        conn.commit()
        conn.close()
    
    async def setup_client(self):
        """Setup Telegram client"""
        if not self.api_id or not self.api_hash:
            return None
            
        self.client = TelegramClient('power_bot_session', int(self.api_id), self.api_hash)
        await self.client.start(phone=self.phone)
        
        me = await self.client.get_me()
        print(f"✅ Logged in as: {me.first_name} (@{me.username})")
        return self.client
    
    async def search_and_join_groups(self):
        """Search for groups and join them"""
        print("\n🔍 Searching for active trading groups...")
        
        groups_found = []
        
        # Search using different methods
        for keyword in self.search_keywords:
            try:
                # Method 1: Search in global search
                result = await self.client(GetDialogsRequest(
                    offset_date=None,
                    offset_id=0,
                    offset_peer='me',
                    limit=100,
                    hash=0
                ))
                
                # Also search for public groups
                from telethon.tl.functions.contacts import SearchRequest
                search_result = await self.client(SearchRequest(
                    q=keyword,
                    limit=50
                ))
                
                # Process results
                for chat in search_result.chats:
                    if isinstance(chat, Channel):
                        if chat.broadcast:
                            continue  # Skip channels (broadcast only)
                        
                        groups_found.append({
                            'id': chat.id,
                            'title': chat.title,
                            'username': chat.username,
                            'members': getattr(chat, 'participants_count', 0)
                        })
                
            except Exception as e:
                print(f"Search error: {e}")
                continue
        
        # Try to join groups
        joined = 0
        for group in groups_found[:20]:  # Limit to 20 to avoid flood
            try:
                if group['username']:
                    await self.client(JoinChannelRequest(group['username']))
                    print(f"✅ Joined: {group['title']} ({group['members']} members)")
                    
                    # Save to database
                    self.save_group(group['id'], group['title'], group['members'])
                    joined += 1
                    
                    # Wait to avoid flood
                    await asyncio.sleep(random.randint(30, 60))
                    
            except UserAlreadyParticipantError:
                print(f"Already in: {group['title']}")
                self.save_group(group['id'], group['title'], group['members'])
                
            except FloodWaitError as e:
                print(f"⚠️ Rate limit. Waiting {e.seconds} seconds...")
                await asyncio.sleep(e.seconds)
                
            except Exception as e:
                print(f"Could not join {group['title']}: {e}")
        
        print(f"\n✅ Joined {joined} new groups")
        return joined
    
    async def find_postable_groups(self):
        """Find groups where we can post"""
        print("\n🔍 Finding groups where posting is allowed...")
        
        postable = []
        dialogs = await self.client.get_dialogs()
        
        for dialog in dialogs:
            if dialog.is_group or dialog.is_channel:
                try:
                    # Try to get last message to check if we can post
                    entity = await self.client.get_entity(dialog.entity)
                    
                    # Check if it's a group/supergroup where we can post
                    if hasattr(entity, 'broadcast') and not entity.broadcast:
                        # It's a group, not a channel
                        can_post = True
                        
                        # Try sending a test (we'll delete it)
                        try:
                            # Check permissions
                            if hasattr(entity, 'default_banned_rights'):
                                if entity.default_banned_rights and entity.default_banned_rights.send_messages:
                                    can_post = False
                        except:
                            pass
                        
                        if can_post:
                            postable.append({
                                'id': entity.id,
                                'title': entity.title,
                                'members': getattr(entity, 'participants_count', 0)
                            })
                            
                            # Update database
                            self.update_group_postable(entity.id, True)
                            
                except Exception as e:
                    continue
        
        print(f"✅ Found {len(postable)} groups where posting is allowed")
        return postable
    
    async def post_to_group(self, group_id, message=None):
        """Post promotional message to a group"""
        if not message:
            message = random.choice(self.messages)
        
        try:
            await self.client.send_message(group_id, message['text'])
            
            # Log to database
            self.log_post(group_id, message['text'], True)
            
            print(f"✅ Posted to group ({message['type']} message)")
            return True
            
        except ChatWriteForbiddenError:
            print(f"❌ Cannot post in this group")
            self.update_group_postable(group_id, False)
            return False
            
        except FloodWaitError as e:
            print(f"⚠️ Rate limited. Wait {e.seconds} seconds")
            await asyncio.sleep(e.seconds)
            return False
            
        except Exception as e:
            print(f"❌ Error posting: {e}")
            return False
    
    async def smart_posting_campaign(self):
        """Run intelligent posting campaign"""
        print("\n🚀 SMART POSTING CAMPAIGN")
        print("="*50)
        
        # Find postable groups
        postable_groups = await self.find_postable_groups()
        
        if not postable_groups:
            print("❌ No postable groups found. Searching for more...")
            await self.search_and_join_groups()
            postable_groups = await self.find_postable_groups()
        
        # Sort by member count (target bigger groups first)
        postable_groups.sort(key=lambda x: x.get('members', 0), reverse=True)
        
        posted = 0
        for group in postable_groups[:10]:  # Post to top 10 groups
            print(f"\n📤 Posting to: {group['title']} ({group['members']} members)")
            
            success = await self.post_to_group(group['id'])
            
            if success:
                posted += 1
                # Wait 2-5 minutes between posts
                wait = random.randint(120, 300)
                print(f"⏰ Waiting {wait//60} minutes...")
                await asyncio.sleep(wait)
        
        print(f"\n✅ Posted to {posted} groups successfully!")
        return posted
    
    async def auto_find_and_post(self):
        """Continuously find groups and post"""
        print("🤖 AUTO MODE ACTIVATED")
        print("="*50)
        print("Bot will automatically:")
        print("1. Search for new groups")
        print("2. Join them")
        print("3. Find where posting is allowed")
        print("4. Share your channel")
        print("5. Repeat every hour")
        print("="*50)
        
        while True:
            try:
                # Search and join new groups
                print(f"\n⏰ Cycle started at {datetime.now().strftime('%I:%M %p')}")
                
                new_groups = await self.search_and_join_groups()
                
                # Wait a bit
                await asyncio.sleep(300)  # 5 minutes
                
                # Post to groups
                posted = await self.smart_posting_campaign()
                
                print(f"\n📊 Cycle complete:")
                print(f"   New groups joined: {new_groups}")
                print(f"   Messages posted: {posted}")
                
                # Wait before next cycle
                print(f"\n⏰ Next cycle in 1 hour...")
                await asyncio.sleep(3600)  # 1 hour
                
            except KeyboardInterrupt:
                print("\n🛑 Stopped by user")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                await asyncio.sleep(600)  # Wait 10 min on error
    
    def save_group(self, group_id, name, members):
        """Save group to database"""
        conn = sqlite3.connect('telegram_bot.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO groups (group_id, group_name, member_count, joined_at, status)
            VALUES (?, ?, ?, datetime('now'), 'active')
        ''', (str(group_id), name, members))
        
        conn.commit()
        conn.close()
    
    def update_group_postable(self, group_id, can_post):
        """Update if group allows posting"""
        conn = sqlite3.connect('telegram_bot.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE groups SET can_post = ? WHERE group_id = ?
        ''', (can_post, str(group_id)))
        
        conn.commit()
        conn.close()
    
    def log_post(self, group_id, message, success):
        """Log posted message"""
        conn = sqlite3.connect('telegram_bot.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO posts (group_id, message, success)
            VALUES (?, ?, ?)
        ''', (str(group_id), message, success))
        
        if success:
            cursor.execute('''
                UPDATE groups 
                SET last_posted = datetime('now'), post_count = post_count + 1
                WHERE group_id = ?
            ''', (str(group_id),))
        
        conn.commit()
        conn.close()
    
    def get_stats(self):
        """Get bot statistics"""
        conn = sqlite3.connect('telegram_bot.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM groups WHERE status = "active"')
        total_groups = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM groups WHERE can_post = 1')
        postable = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM posts WHERE success = 1')
        total_posts = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'groups': total_groups,
            'postable': postable,
            'posts': total_posts
        }

async def main():
    bot = TelegramPowerBot()
    
    print("🤖 TELEGRAM POWER BOT")
    print("="*50)
    
    # Check credentials
    if not bot.api_id or not bot.api_hash:
        print("\n⚠️ API CREDENTIALS NEEDED!")
        print("="*50)
        print("1. Open: https://my.telegram.org/")
        print("2. Login with your phone")
        print("3. Create an app")
        print("4. Add to .env file:")
        print("   TELEGRAM_API_ID=your_id")
        print("   TELEGRAM_API_HASH=your_hash")
        print("   TELEGRAM_PHONE=+91xxxxxxxxxx")
        return
    
    # Setup client
    if not await bot.setup_client():
        print("❌ Could not connect to Telegram")
        return
    
    # Show menu
    print("\n📋 SELECT MODE:")
    print("1. AUTO MODE (Fully automated)")
    print("2. Find & Join Groups")
    print("3. Post to Existing Groups")
    print("4. Show Statistics")
    
    choice = input("\nEnter choice (1-4): ")
    
    if choice == "1":
        await bot.auto_find_and_post()
    elif choice == "2":
        await bot.search_and_join_groups()
    elif choice == "3":
        await bot.smart_posting_campaign()
    elif choice == "4":
        stats = bot.get_stats()
        print(f"\n📊 BOT STATISTICS:")
        print(f"Total Groups: {stats['groups']}")
        print(f"Postable Groups: {stats['postable']}")
        print(f"Total Posts: {stats['posts']}")
    
    await bot.client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())