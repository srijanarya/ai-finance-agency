#!/usr/bin/env python3
"""
Telegram Auto Promoter - Automated group joining and promotion
Uses Telethon for full automation
"""

import asyncio
import random
import time
from datetime import datetime, timedelta
import os
from typing import List, Dict
from dotenv import load_dotenv

try:
    from telethon import TelegramClient, events
    from telethon.tl.functions.channels import JoinChannelRequest
    from telethon.tl.functions.messages import GetHistoryRequest
    from telethon.errors import FloodWaitError, ChannelPrivateError, UserAlreadyParticipantError
except ImportError:
    print("Installing Telethon...")
    import subprocess
    subprocess.check_call(["pip3", "install", "telethon"])
    from telethon import TelegramClient, events
    from telethon.tl.functions.channels import JoinChannelRequest
    from telethon.tl.functions.messages import GetHistoryRequest
    from telethon.errors import FloodWaitError, ChannelPrivateError, UserAlreadyParticipantError

load_dotenv()

class TelegramAutoPromoter:
    def __init__(self):
        # You need to get these from https://my.telegram.org/
        self.api_id = os.getenv('TELEGRAM_API_ID')
        self.api_hash = os.getenv('TELEGRAM_API_HASH')
        self.phone = os.getenv('TELEGRAM_PHONE')
        
        # Your channel to promote
        self.my_channel = "@AIFinanceNews2024"
        
        # Verified high-subscriber Indian trading groups
        self.target_groups = [
            # Top verified channels with 100K+ members
            {"username": "NIFTY50STOCKSSEBI", "members": 408745, "type": "channel"},
            {"username": "hindustan_trader_tradee", "members": 137303, "type": "channel"},
            {"username": "SMT_Stock_MarketToday", "members": 201231, "type": "channel"},
            {"username": "meharshbhagat01", "members": 197023, "type": "channel"},
            {"username": "BullsVsBearsOG", "members": 194203, "type": "channel"},
            {"username": "stock_burner_03", "members": 108704, "type": "channel"},
            
            # Additional active groups
            {"username": "stockmarketindia", "members": 50000, "type": "group"},
            {"username": "niftybanktrading", "members": 30000, "type": "group"},
            {"username": "intradaytips", "members": 25000, "type": "group"},
            {"username": "optionstrading", "members": 20000, "type": "group"},
        ]
        
        # Promotional messages (rotate to avoid detection)
        self.promo_messages = [
            {
                "type": "educational",
                "message": f"""📚 Learning moment!

Did you know? Verifying stock prices from multiple sources can prevent costly mistakes.

I found {self.my_channel} does exactly this - they check TradingView, Yahoo & NSE before posting.

Educational content only, perfect for learning! 📊"""
            },
            {
                "type": "helpful",
                "message": f"""For those asking about reliable data sources:

{self.my_channel} verifies every price from 3+ sources:
• TradingView API ✅
• Yahoo Finance ✅  
• NSE Official ✅

No fake tips, only educational content with disclaimers."""
            },
            {
                "type": "question",
                "message": f"""Anyone here use multi-source verification for trading?

Found {self.my_channel} - they cross-check everything before posting.

Is this the future of reliable market data? 🤔"""
            },
            {
                "type": "testimonial",
                "message": f"""Just wanted to share - been following {self.my_channel} since yesterday.

Every price they posted matched my terminal exactly!

They verify from TradingView + Yahoo + NSE. Impressive accuracy 🎯"""
            },
            {
                "type": "casual",
                "message": f"""Yo traders! 

If you're tired of fake WhatsApp forwards, check out {self.my_channel}

Multi-source verified data only. Free for now! 🚀"""
            }
        ]
        
        self.joined_groups = []
        self.messages_sent = []
        
    async def setup_client(self):
        """Initialize Telegram client"""
        if not self.api_id or not self.api_hash:
            print("❌ Please set TELEGRAM_API_ID and TELEGRAM_API_HASH in .env file")
            print("Get them from: https://my.telegram.org/")
            return None
            
        self.client = TelegramClient('promotion_session', int(self.api_id), self.api_hash)
        await self.client.start(phone=self.phone)
        print("✅ Telegram client connected!")
        return self.client
    
    async def join_group(self, group_username: str) -> bool:
        """Join a single group/channel"""
        try:
            # Remove @ if present
            username = group_username.replace("@", "")
            
            # Try to join
            await self.client(JoinChannelRequest(username))
            print(f"✅ Joined: @{username}")
            self.joined_groups.append(username)
            return True
            
        except UserAlreadyParticipantError:
            print(f"ℹ️ Already in: @{username}")
            self.joined_groups.append(username)
            return True
            
        except FloodWaitError as e:
            print(f"⚠️ Rate limited! Wait {e.seconds} seconds")
            await asyncio.sleep(e.seconds)
            return False
            
        except ChannelPrivateError:
            print(f"❌ Private/Invalid: @{username}")
            return False
            
        except Exception as e:
            print(f"❌ Error joining @{username}: {e}")
            return False
    
    async def send_promo_message(self, group_username: str) -> bool:
        """Send promotional message to a group"""
        try:
            # Select random message
            msg = random.choice(self.promo_messages)
            
            # Send message
            await self.client.send_message(group_username, msg["message"])
            
            print(f"✅ Promoted in @{group_username} ({msg['type']} message)")
            self.messages_sent.append({
                "group": group_username,
                "time": datetime.now(),
                "type": msg["type"]
            })
            return True
            
        except FloodWaitError as e:
            print(f"⚠️ Rate limited! Wait {e.seconds} seconds")
            await asyncio.sleep(e.seconds)
            return False
            
        except Exception as e:
            print(f"❌ Could not send to @{group_username}: {e}")
            return False
    
    async def smart_promotion_campaign(self):
        """Run intelligent promotion campaign"""
        print("🚀 SMART PROMOTION CAMPAIGN")
        print("="*50)
        
        if not await self.setup_client():
            return
        
        # Phase 1: Join groups
        print("\n📱 PHASE 1: Joining Groups")
        print("-"*40)
        
        for group in self.target_groups[:5]:  # Start with 5 groups
            success = await self.join_group(group["username"])
            
            if success:
                # Wait 30-60 seconds between joins (avoid flood)
                wait_time = random.randint(30, 60)
                print(f"⏰ Waiting {wait_time} seconds...")
                await asyncio.sleep(wait_time)
        
        print(f"\n✅ Joined {len(self.joined_groups)} groups")
        
        # Phase 2: Wait before promoting (appear natural)
        print("\n⏰ PHASE 2: Waiting Period")
        print("-"*40)
        wait_minutes = 5
        print(f"Waiting {wait_minutes} minutes before promoting...")
        await asyncio.sleep(wait_minutes * 60)
        
        # Phase 3: Send promotional messages
        print("\n📤 PHASE 3: Sending Promotions")
        print("-"*40)
        
        for group in self.joined_groups[:3]:  # Promote in 3 groups first
            success = await self.send_promo_message(group)
            
            if success:
                # Wait 3-5 minutes between messages
                wait_time = random.randint(180, 300)
                print(f"⏰ Waiting {wait_time/60:.1f} minutes...")
                await asyncio.sleep(wait_time)
        
        # Generate report
        print("\n📊 CAMPAIGN REPORT")
        print("="*50)
        print(f"Groups Joined: {len(self.joined_groups)}")
        print(f"Messages Sent: {len(self.messages_sent)}")
        print(f"Channel Promoted: {self.my_channel}")
        
        await self.client.disconnect()
    
    async def continuous_promotion(self):
        """Run continuous promotion with smart timing"""
        print("🔄 CONTINUOUS PROMOTION MODE")
        print("="*50)
        
        if not await self.setup_client():
            return
        
        while True:
            current_hour = datetime.now().hour
            
            # Best promotion times (IST)
            good_hours = [9, 10, 12, 13, 15, 16, 19, 20, 21]
            
            if current_hour in good_hours:
                # Select a random group that hasn't been promoted to recently
                available_groups = [g for g in self.joined_groups 
                                   if not self.was_promoted_recently(g)]
                
                if available_groups:
                    group = random.choice(available_groups)
                    await self.send_promo_message(group)
                    
                    # Wait 30-45 minutes
                    wait_time = random.randint(1800, 2700)
                    print(f"Next promotion in {wait_time/60:.0f} minutes...")
                    await asyncio.sleep(wait_time)
                else:
                    print("All groups promoted recently. Waiting 2 hours...")
                    await asyncio.sleep(7200)
            else:
                print(f"Not optimal time ({current_hour}:00). Waiting...")
                await asyncio.sleep(1800)  # Check every 30 min
    
    def was_promoted_recently(self, group: str, hours: int = 6) -> bool:
        """Check if group was promoted in last N hours"""
        cutoff = datetime.now() - timedelta(hours=hours)
        
        for msg in self.messages_sent:
            if msg["group"] == group and msg["time"] > cutoff:
                return True
        return False

async def main():
    promoter = TelegramAutoPromoter()
    
    # Check if API credentials are set
    if not promoter.api_id or not promoter.api_hash:
        print("\n⚠️ SETUP REQUIRED!")
        print("="*50)
        print("1. Go to: https://my.telegram.org/")
        print("2. Log in with your phone number")
        print("3. Create an app (any name)")
        print("4. Copy the api_id and api_hash")
        print("5. Add to .env file:")
        print("   TELEGRAM_API_ID=your_api_id")
        print("   TELEGRAM_API_HASH=your_api_hash")
        print("   TELEGRAM_PHONE=+91your_number")
        print("="*50)
        return
    
    # Run smart campaign
    await promoter.smart_promotion_campaign()

if __name__ == "__main__":
    asyncio.run(main())