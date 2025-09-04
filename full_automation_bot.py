#!/usr/bin/env python3
"""
Full Automation Bot - Completely automated group joining and posting
Works with Telethon to handle everything automatically
"""

import asyncio
import random
import time
from datetime import datetime, timedelta
import os
import sqlite3
from typing import List, Dict
from dotenv import load_dotenv

# Try to use existing telethon or install it
try:
    from telethon.sync import TelegramClient
    from telethon.tl.functions.channels import JoinChannelRequest
    from telethon.tl.functions.messages import GetDialogsRequest, SearchGlobalRequest
    from telethon.errors import FloodWaitError, ChannelPrivateError, UserAlreadyParticipantError, ChatWriteForbiddenError
    from telethon.tl.types import InputPeerEmpty
except ImportError:
    print("Installing Telethon...")
    import subprocess
    subprocess.check_call(["pip3", "install", "telethon"])
    from telethon.sync import TelegramClient
    from telethon.tl.functions.channels import JoinChannelRequest
    from telethon.tl.functions.messages import GetDialogsRequest, SearchGlobalRequest
    from telethon.errors import FloodWaitError, ChannelPrivateError, UserAlreadyParticipantError, ChatWriteForbiddenError
    from telethon.tl.types import InputPeerEmpty

load_dotenv()

class FullAutomationBot:
    def __init__(self):
        # Load credentials
        self.api_id = os.getenv('TELEGRAM_API_ID', '')
        self.api_hash = os.getenv('TELEGRAM_API_HASH', '')
        self.phone = os.getenv('TELEGRAM_PHONE', '')
        self.my_channel = "@AIFinanceNews2024"
        
        # Search terms for Indian trading groups
        self.search_terms = [
            "trading india", "stock market india", "nifty chat", "banknifty",
            "options trading", "intraday", "share market", "bse nse",
            "indian stocks", "market discussion", "traders group",
            "zerodha", "groww", "upstox", "angel broking"
        ]
        
        # Promotional messages
        self.promo_messages = [
            f"""📊 Interesting find for traders:

{self.my_channel}

• Multi-source price verification
• TradingView + Yahoo + NSE
• Educational content only

https://t.me/AIFinanceNews2024""",

            f"""For accurate market data:

{self.my_channel} verifies everything from 3+ sources.

No fake tips, education only.

Link: https://t.me/AIFinanceNews2024""",

            f"""New channel alert: {self.my_channel}

Every price verified before posting.
Free for first 500 members.

https://t.me/AIFinanceNews2024"""
        ]
        
        # Track progress
        self.joined_groups = []
        self.posted_groups = []
        self.init_database()
    
    def init_database(self):
        """Initialize tracking database"""
        conn = sqlite3.connect('automation_bot.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY,
                group_id TEXT UNIQUE,
                group_name TEXT,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                can_post BOOLEAN DEFAULT 1,
                last_posted TIMESTAMP,
                member_count INTEGER
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY,
                group_id TEXT,
                message TEXT,
                posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                success BOOLEAN
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def setup_client(self):
        """Setup Telethon client"""
        if not self.api_id or not self.api_hash:
            print("❌ No API credentials found!")
            print("\nTo get them:")
            print("1. Go to https://my.telegram.org/")
            print("2. Login and go to 'API development tools'")
            print("3. Copy the api_id and api_hash")
            print("\nTrying alternative method...")
            return None
        
        try:
            # Create client
            client = TelegramClient('automation_session', int(self.api_id), self.api_hash)
            client.connect()
            
            # Check if authorized
            if not client.is_user_authorized():
                print(f"📱 Sending code to {self.phone}...")
                client.send_code_request(self.phone)
                code = input("Enter the code you received: ")
                client.sign_in(self.phone, code)
            
            me = client.get_me()
            print(f"✅ Logged in as: {me.first_name}")
            return client
            
        except Exception as e:
            print(f"❌ Error setting up client: {e}")
            return None
    
    def search_and_join_groups(self, client):
        """Search for groups and join them automatically"""
        print("\n🔍 Searching for trading groups...")
        
        groups_found = []
        
        for term in self.search_terms:
            try:
                print(f"Searching: {term}")
                
                # Search globally
                result = client(SearchGlobalRequest(
                    q=term,
                    offset_date=None,
                    offset_peer=InputPeerEmpty(),
                    offset_id=0,
                    limit=10
                ))
                
                # Process chats found
                for chat in result.chats:
                    if hasattr(chat, 'username') and chat.username:
                        if not hasattr(chat, 'broadcast') or not chat.broadcast:
                            # It's a group, not a channel
                            groups_found.append({
                                'username': chat.username,
                                'title': chat.title,
                                'id': chat.id,
                                'members': getattr(chat, 'participants_count', 0)
                            })
                
                # Small delay
                time.sleep(2)
                
            except FloodWaitError as e:
                print(f"Rate limit. Waiting {e.seconds} seconds...")
                time.sleep(e.seconds)
            except Exception as e:
                print(f"Search error: {e}")
                continue
        
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
        for group in unique_groups[:20]:  # Limit to 20 to avoid flood
            try:
                print(f"Joining: {group['title']}")
                client(JoinChannelRequest(group['username']))
                
                # Save to database
                self.save_group(group['id'], group['title'], group['members'])
                self.joined_groups.append(group)
                joined += 1
                
                # Wait to avoid flood
                time.sleep(random.randint(30, 60))
                
            except UserAlreadyParticipantError:
                print(f"Already in: {group['title']}")
                self.joined_groups.append(group)
                
            except FloodWaitError as e:
                print(f"Rate limit. Waiting {e.seconds} seconds...")
                time.sleep(e.seconds)
                
            except Exception as e:
                print(f"Could not join: {e}")
        
        print(f"\n✅ Successfully joined {joined} new groups")
        return joined
    
    def post_to_groups(self, client):
        """Post promotional messages to joined groups"""
        print("\n📤 Posting to groups...")
        
        posted = 0
        dialogs = client.get_dialogs()
        
        for dialog in dialogs:
            if dialog.is_group:
                try:
                    # Try to send message
                    message = random.choice(self.promo_messages)
                    client.send_message(dialog.entity, message)
                    
                    print(f"✅ Posted to: {dialog.title}")
                    self.log_post(dialog.entity.id, message, True)
                    posted += 1
                    
                    # Wait to avoid flood
                    time.sleep(random.randint(120, 300))
                    
                    if posted >= 5:  # Limit per session
                        break
                        
                except ChatWriteForbiddenError:
                    print(f"❌ Can't post in: {dialog.title}")
                    self.update_group_can_post(dialog.entity.id, False)
                    
                except FloodWaitError as e:
                    print(f"Rate limit. Waiting {e.seconds} seconds...")
                    time.sleep(e.seconds)
                    
                except Exception as e:
                    print(f"Error posting: {e}")
        
        print(f"\n✅ Posted to {posted} groups")
        return posted
    
    def save_group(self, group_id, name, members):
        """Save group to database"""
        conn = sqlite3.connect('automation_bot.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO groups (group_id, group_name, member_count)
            VALUES (?, ?, ?)
        ''', (str(group_id), name, members))
        
        conn.commit()
        conn.close()
    
    def update_group_can_post(self, group_id, can_post):
        """Update posting permission"""
        conn = sqlite3.connect('automation_bot.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE groups SET can_post = ? WHERE group_id = ?
        ''', (can_post, str(group_id)))
        
        conn.commit()
        conn.close()
    
    def log_post(self, group_id, message, success):
        """Log posted message"""
        conn = sqlite3.connect('automation_bot.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO posts (group_id, message, success)
            VALUES (?, ?, ?)
        ''', (str(group_id), message, success))
        
        if success:
            cursor.execute('''
                UPDATE groups SET last_posted = datetime('now')
                WHERE group_id = ?
            ''', (str(group_id),))
        
        conn.commit()
        conn.close()
    
    def run_full_automation(self):
        """Run complete automation"""
        print("🚀 FULL AUTOMATION MODE")
        print("="*50)
        
        client = self.setup_client()
        
        if not client:
            print("\n⚠️ Running without API - Manual mode")
            self.run_manual_mode()
            return
        
        try:
            while True:
                print(f"\n⏰ Cycle started at {datetime.now().strftime('%I:%M %p')}")
                
                # Search and join groups
                new_groups = self.search_and_join_groups(client)
                
                # Wait a bit
                time.sleep(300)  # 5 minutes
                
                # Post to groups
                posted = self.post_to_groups(client)
                
                print(f"\n📊 Cycle complete:")
                print(f"New groups joined: {new_groups}")
                print(f"Messages posted: {posted}")
                
                # Show stats
                self.show_stats()
                
                # Wait for next cycle
                print("\n⏰ Next cycle in 1 hour...")
                time.sleep(3600)
                
        except KeyboardInterrupt:
            print("\n🛑 Automation stopped")
        finally:
            client.disconnect()
    
    def run_manual_mode(self):
        """Run without API - provides instructions"""
        print("\n📱 MANUAL MODE (No API)")
        print("="*50)
        
        while True:
            print("\n🔍 GROUPS TO SEARCH AND JOIN:")
            for term in self.search_terms[:5]:
                print(f"• {term}")
            
            print("\n📝 MESSAGE TO SHARE:")
            print("-"*40)
            print(random.choice(self.promo_messages))
            print("-"*40)
            
            print("\n⏰ Next update in 30 minutes...")
            
            try:
                time.sleep(1800)  # 30 minutes
            except KeyboardInterrupt:
                break
    
    def show_stats(self):
        """Show automation statistics"""
        conn = sqlite3.connect('automation_bot.db')
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM groups')
        total_groups = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM groups WHERE can_post = 1')
        can_post = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM posts WHERE success = 1')
        total_posts = cursor.fetchone()[0]
        
        conn.close()
        
        print("\n📊 AUTOMATION STATS:")
        print(f"Total groups joined: {total_groups}")
        print(f"Groups allowing posts: {can_post}")
        print(f"Total posts sent: {total_posts}")

def main():
    bot = FullAutomationBot()
    bot.run_full_automation()

if __name__ == "__main__":
    main()