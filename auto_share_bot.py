#!/usr/bin/env python3
"""
Auto Share Bot - Shares your channel in multiple groups automatically
Uses your existing bot to promote the channel
"""

import requests
import time
import random
from datetime import datetime
import os
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

class AutoShareBot:
    def __init__(self):
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.channel = '@AIFinanceNews2024'
        
        # These are PUBLIC channels where we can post comments/discussions
        # Your bot needs to be added to these groups first
        self.target_groups = [
            # You need to add your bot to these groups/channels manually first
            # Then get their chat IDs
        ]
        
        # Promotional messages with channel link
        self.share_messages = [
            f"""📊 New Educational Finance Channel Alert!

{self.channel}

Features:
✅ Multi-source price verification (TradingView + Yahoo + NSE)
✅ Educational content only (SEBI compliant)
✅ Real-time market updates
✅ No fake tips or pump & dump

Free for first 500 members! Join now 👆""",

            f"""🎯 Traders! Looking for verified market data?

Check out {self.channel}

• Every price verified from 3+ sources
• Educational analysis with disclaimers
• Live market updates throughout the day
• Technical analysis tutorials

Join link: https://t.me/AIFinanceNews2024""",

            f"""📈 Tired of fake WhatsApp tips?

{self.channel} provides:
• TradingView verified data
• Yahoo Finance cross-checked
• NSE official prices
• Educational content ONLY

No investment advice, just facts & education!
Join: https://t.me/AIFinanceNews2024""",

            f"""🔍 Multi-Source Verified Market Data

Found this amazing channel: {self.channel}

They verify EVERY price before posting:
1️⃣ TradingView API
2️⃣ Yahoo Finance
3️⃣ Google Finance
4️⃣ NSE Official

Perfect for learning! Join: https://t.me/AIFinanceNews2024"""
        ]
    
    def get_channel_link_button(self):
        """Create inline keyboard with channel link"""
        return {
            "inline_keyboard": [[
                {
                    "text": "📈 Join AI Finance News 2024",
                    "url": "https://t.me/AIFinanceNews2024"
                }
            ]]
        }
    
    def share_in_group(self, chat_id: str, message: str = None) -> bool:
        """Share promotional message in a group"""
        if not message:
            message = random.choice(self.share_messages)
        
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        
        data = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'HTML',
            'reply_markup': self.get_channel_link_button(),
            'disable_web_page_preview': False
        }
        
        try:
            response = requests.post(url, json=data)
            if response.status_code == 200:
                print(f"✅ Shared in {chat_id}")
                return True
            else:
                print(f"❌ Failed to share in {chat_id}: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    def create_viral_content(self) -> str:
        """Create shareable content that encourages forwarding"""
        templates = [
            f"""🚨 BREAKING: New AI-Powered Finance Channel

{self.channel}

First 500 members get:
• FREE lifetime access
• Multi-source verified data
• Educational content
• Live market updates

⏰ Only 350 spots left!

Share with your trading friends! 
Forward this message 📤""",

            f"""💰 Your friends will thank you for this!

{self.channel}

Why it's different:
✓ No fake tips
✓ No pump & dump
✓ Only verified data
✓ Educational focus

Forward to your trading groups! 🚀
Link: https://t.me/AIFinanceNews2024""",

            f"""📱 Share = Care

Help your trader friends avoid fake tips!

{self.channel} provides:
• Verified prices (3+ sources)
• Educational content
• SEBI compliant posts
• Free for early joiners

Forward this to help others! 💚
https://t.me/AIFinanceNews2024"""
        ]
        
        return random.choice(templates)
    
    def create_clickable_share_link(self):
        """Create a shareable link with preview"""
        base_url = "https://t.me/share/url"
        text = f"""Join {self.channel} - Multi-source verified market data! Free for first 500 members"""
        url = "https://t.me/AIFinanceNews2024"
        
        share_link = f"{base_url}?url={url}&text={text}"
        
        message = f"""📤 CLICK TO SHARE WITH FRIENDS:

{share_link}

Or copy this message:

---
New verified finance channel!
{self.channel}

• TradingView data
• Yahoo Finance verified
• Educational only
• Free for 500 members

Join: https://t.me/AIFinanceNews2024
---

Share in your groups! 🚀"""
        
        return message
    
    def auto_share_campaign(self, group_ids: List[str] = None):
        """Run automated sharing campaign"""
        print("🤖 AUTO SHARE CAMPAIGN")
        print("="*50)
        
        if not group_ids:
            print("❌ No group IDs provided")
            print("\nTo get group IDs:")
            print("1. Add your bot to groups as admin")
            print("2. Send a message in the group")
            print("3. Visit: https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getUpdates")
            print("4. Look for 'chat': {'id': -123456789}")
            print("5. Use those negative numbers as group_ids")
            return
        
        messages_sent = 0
        
        for group_id in group_ids:
            print(f"\n📤 Sharing in group {group_id}...")
            
            # Share viral content
            viral_msg = self.create_viral_content()
            if self.share_in_group(group_id, viral_msg):
                messages_sent += 1
            
            # Wait 2-3 minutes between groups
            wait_time = random.randint(120, 180)
            print(f"⏰ Waiting {wait_time/60:.1f} minutes...")
            time.sleep(wait_time)
        
        print(f"\n✅ Campaign complete!")
        print(f"Messages sent: {messages_sent}")
        print(f"Channel promoted: {self.channel}")
    
    def generate_share_instructions(self):
        """Generate manual sharing instructions"""
        print("\n📱 MANUAL SHARING GUIDE")
        print("="*50)
        
        print("\n1️⃣ QUICK SHARE MESSAGE:")
        print("-"*40)
        msg = random.choice(self.share_messages)
        print(msg)
        
        print("\n2️⃣ CHANNEL LINK:")
        print("-"*40)
        print("https://t.me/AIFinanceNews2024")
        
        print("\n3️⃣ WHERE TO SHARE:")
        print("-"*40)
        print("Search and join these groups on Telegram:")
        print("• Indian Stock Market")
        print("• NSE BSE Trading")
        print("• Nifty Banknifty")
        print("• Intraday Trading India")
        print("• Options Trading India")
        
        print("\n4️⃣ SHARING TIPS:")
        print("-"*40)
        print("• Join group first, observe for 5 mins")
        print("• Share when discussion is active")
        print("• Engage with responses")
        print("• Don't spam - max 1 share per group")
        print("• Best times: 9AM, 1PM, 7PM IST")
        
        print("\n5️⃣ VIRAL SHARE LINK:")
        print("-"*40)
        share_msg = self.create_clickable_share_link()
        print(share_msg)

def main():
    bot = AutoShareBot()
    
    print("🤖 TELEGRAM AUTO SHARE BOT")
    print("="*50)
    
    # Generate sharing content
    bot.generate_share_instructions()
    
    print("\n" + "="*50)
    print("📌 NEXT STEPS:")
    print("1. Copy the message above")
    print("2. Share in Telegram groups")
    print("3. Or add bot to groups and use auto_share_campaign()")
    
    # Example of auto sharing (need real group IDs)
    # group_ids = ["-1001234567890", "-1009876543210"]  # Replace with real IDs
    # bot.auto_share_campaign(group_ids)

if __name__ == "__main__":
    main()