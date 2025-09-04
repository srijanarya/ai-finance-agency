#!/usr/bin/env python3
"""
VIRAL GROWTH CAMPAIGN - Get 500 Subscribers FAST
Campaign Manager Strategy Implementation
"""

import requests
import time
import random
from datetime import datetime, timedelta
import webbrowser

BOT_TOKEN = "8478124403:AAFNni_9GQtWwrzk3ElhkMkTKljbSQyWp9Y"
CHANNEL = "@AIFinanceNews2024"
CHANNEL_LINK = "https://t.me/AIFinanceNews2024"

class ViralGrowthCampaign:
    def __init__(self):
        self.bot_token = BOT_TOKEN
        self.channel = CHANNEL
        self.channel_link = CHANNEL_LINK
        
    def create_fomo_posts(self):
        """Create urgency and FOMO to drive subscribers"""
        posts = [
            f"""🚨 EXCLUSIVE ALERT - LIMITED TIME!

We're giving away our PREMIUM Trading Signals FREE to the first 500 subscribers!

Current: 52/500 spots taken ⏰

What you get:
✅ LIVE Intraday Calls
✅ Option Chain Analysis 
✅ Breakout Alerts
✅ Stop Loss & Targets

After 500: ₹5,000/month

Join NOW: {self.channel_link}

⚡ 448 spots remaining!""",

            f"""💰 YESTERDAY'S PROFIT ALERT!

Our subscribers made:
• RELIANCE Call: +12,500 profit
• NIFTY PUT: +8,200 profit  
• BANK NIFTY: +15,300 profit

Total: ₹36,000 in ONE DAY!

FREE for next 443 members only!

{self.channel_link}

Share with your trading group NOW! 📤""",

            f"""🔥 BREAKING: Tomorrow's BIG MOVE!

Our AI detected unusual options activity in 3 stocks.
Possible 20-30% move expected!

This info will be shared at 9:00 AM sharp.

Only channel members will get it.

Join before market opens: {self.channel_link}

87 traders joined in last hour!""",

            f"""⚠️ WARNING TO TRADERS!

90% of traders lose money because they:
❌ Follow fake tips
❌ No stop loss
❌ Wrong entry/exit

Our AI gives you:
✅ Verified signals
✅ Exact entry/exit
✅ Risk management

FREE till we hit 500 members!
Currently: 109/500

{self.channel_link}""",

            f"""🎯 LIVE PROFIT BOOKING!

JUST NOW:
TCS 3150 CALL → Book at 3180
Profit: ₹7,500 per lot ✅

HDFC 1680 PUT → Book at 1650  
Profit: ₹9,000 per lot ✅

These calls were given 2 hours ago in our channel!

Join for tomorrow's calls: {self.channel_link}

⏰ Only 391 FREE spots left!"""
        ]
        
        for post in posts:
            url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
            data = {
                'chat_id': self.channel,
                'text': post,
                'parse_mode': 'HTML',
                'reply_markup': {
                    'inline_keyboard': [
                        [{'text': '🚀 Join Now (FREE)', 'url': self.channel_link}],
                        [{'text': '📤 Share with Friends', 'url': f'https://t.me/share/url?url={self.channel_link}&text=Free trading signals! Limited spots!'}]
                    ]
                }
            }
            
            requests.post(url, json=data)
            print(f"✅ Posted FOMO message at {datetime.now().strftime('%I:%M %p')}")
            time.sleep(2)
    
    def create_testimonial_posts(self):
        """Create fake urgency with testimonials"""
        testimonials = [
            f"""💬 MEMBER TESTIMONIALS:

"Made 45K in 3 days! Best channel ever!" - Raj, Mumbai

"Their BANKNIFTY calls are 90% accurate" - Priya, Delhi

"Recovered all my losses in 1 week!" - Amit, Bangalore

Join them: {self.channel_link}

🔥 157 members joined today!""",

            f"""📈 TODAY'S PERFORMANCE:

Morning Calls:
✅ NIFTY 24850 CE - Target hit (+180%)
✅ SBIN 625 CE - Target hit (+220%)
✅ RELIANCE 2950 PE - Target hit (+150%)

Success Rate: 9/10 calls profitable!

Get tomorrow's calls: {self.channel_link}

⚡ Filling fast - 312/500!"""
        ]
        
        for post in testimonials:
            url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
            data = {'chat_id': self.channel, 'text': post, 'parse_mode': 'HTML'}
            requests.post(url, json=data)
            print("✅ Posted testimonial")
    
    def spam_trading_groups(self):
        """Aggressive promotion in trading groups"""
        
        # List of known trading groups
        groups = [
            "https://t.me/intradaytrading",
            "https://t.me/sharemarket",
            "https://t.me/niftyfifty",
            "https://t.me/optionstrading",
            "https://t.me/bankniftyoptions",
            "https://t.me/stockmarketindia",
            "https://t.me/tradingcommunity",
            "https://t.me/marketgurukul"
        ]
        
        messages = [
            f"""Friends, found an amazing channel with FREE signals!

They gave 3 profitable calls today:
• NIFTY CE +8,500
• BANKNIFTY PE +12,000
• RELIANCE +6,200

Check out: {self.channel_link}

It's FREE for first 500 members only!""",

            f"""🔥 Made 25K profit today!

All thanks to @AIFinanceNews2024

Their AI-powered signals are incredible.
Join fast, they're going paid after 500 members.

{self.channel_link}"""
        ]
        
        print("📤 Opening groups for promotion...")
        for group in groups:
            try:
                webbrowser.open(group)
                print(f"   Opened: {group}")
                time.sleep(3)
            except:
                pass
    
    def create_exclusive_content(self):
        """Create exclusive member-only content"""
        
        exclusive_posts = [
            f"""🔒 MEMBERS ONLY - CONFIDENTIAL

Tomorrow's High Probability Trades:

1. NIFTY: Buy above 24,880, Target 25,050
2. BANKNIFTY: Sell below 51,700, Target 51,400
3. RELIANCE: Bullish above 2,980

Full analysis with SL in channel.

Not a member? Join now: {self.channel_link}

⚠️ This info worth ₹10,000 - FREE for you!""",

            f"""💎 VIP ALERT FOR MEMBERS!

Institutional buying detected in:
• TCS (Large call buying)
• INFY (Accumulation phase)
• HDFC (Breakout imminent)

Detailed levels at 9:15 AM tomorrow.

Non-members missing out on profits!

Last chance: {self.channel_link}"""
        ]
        
        for post in exclusive_posts:
            url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
            data = {'chat_id': self.channel, 'text': post}
            requests.post(url, json=data)
            print("✅ Posted exclusive content")
    
    def run_paid_promotion(self):
        """Instructions for paid promotion"""
        
        print("\n💰 PAID PROMOTION STRATEGY:")
        print("="*50)
        print("""
1. TELEGRAM ADS (₹5,000 budget):
   • Contact @TelegramGrowth
   • Buy 5000 targeted views
   • Target: Indian traders, 25-45 age
   
2. INFLUENCER SHOUTOUTS:
   • @TraderRavi (50K followers) - ₹2,000
   • @StockGuruIndia (30K) - ₹1,500
   • @OptionsKing (25K) - ₹1,000
   
3. PAID GROUP POSTS:
   • Pay admins of large groups
   • ₹500-1000 per group post
   • Target 10 groups = 10,000 reach
   
4. YOUTUBE PROMOTION:
   • Finance YouTubers description
   • ₹3,000 for video mention
   
Total Budget: ₹15,000
Expected Subscribers: 500+
Cost per subscriber: ₹30
""")
        
    def create_referral_program(self):
        """Create viral referral incentive"""
        
        referral_post = f"""🎁 MEGA REFERRAL CONTEST!

Invite friends and WIN:

🥇 50 invites = ₹5,000 Amazon voucher
🥈 25 invites = ₹2,500 Paytm cash
🥉 10 invites = ₹1,000 recharge

How to participate:
1. Join: {self.channel_link}
2. Share with friends
3. Screenshot proof of invites
4. DM @AIFinanceAdmin

Contest ends when we hit 500 members!
Current: 198/500

Start inviting NOW! 💰"""
        
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {
            'chat_id': self.channel,
            'text': referral_post,
            'parse_mode': 'HTML',
            'reply_markup': {
                'inline_keyboard': [
                    [{'text': '📤 Share & Earn', 'url': f'https://t.me/share/url?url={self.channel_link}&text=Join and earn rewards!'}]
                ]
            }
        }
        
        requests.post(url, json=data)
        print("✅ Posted referral program")
    
    def aggressive_growth_campaign(self):
        """Run complete aggressive campaign"""
        
        print("\n🚀 AGGRESSIVE GROWTH CAMPAIGN STARTED!")
        print("="*50)
        print("Target: 500 subscribers in 48 hours")
        print("="*50)
        
        cycle = 1
        
        while True:
            print(f"\n📍 CAMPAIGN CYCLE {cycle}")
            print(f"Time: {datetime.now().strftime('%I:%M %p')}")
            
            # 1. Create FOMO
            print("\n1. Creating FOMO posts...")
            self.create_fomo_posts()
            
            # 2. Post testimonials
            print("\n2. Posting testimonials...")
            self.create_testimonial_posts()
            
            # 3. Exclusive content
            print("\n3. Creating exclusive content...")
            self.create_exclusive_content()
            
            # 4. Referral program
            if cycle % 3 == 0:
                print("\n4. Posting referral contest...")
                self.create_referral_program()
            
            # 5. Group spam (manual)
            if cycle % 2 == 0:
                print("\n5. Opening groups for promotion...")
                self.spam_trading_groups()
            
            # 6. Show paid promotion options
            if cycle == 1:
                self.run_paid_promotion()
            
            print(f"\n✅ Cycle {cycle} complete")
            print("Next cycle in 30 minutes...")
            print("-"*40)
            
            cycle += 1
            time.sleep(30 * 60)  # 30 minutes

def main():
    campaign = ViralGrowthCampaign()
    campaign.aggressive_growth_campaign()

if __name__ == "__main__":
    main()