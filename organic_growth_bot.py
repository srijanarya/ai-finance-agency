#!/usr/bin/env python3
"""
ORGANIC GROWTH BOT - Smart, non-spammy Telegram growth
Uses only Bot API - no authentication needed
"""

import requests
import time
import random
from datetime import datetime, timedelta

BOT_TOKEN = "8478124403:AAFNni_9GQtWwrzk3ElhkMkTKljbSQyWp9Y"
CHANNEL = "@AIFinanceNews2024"
CHANNEL_LINK = "https://t.me/AIFinanceNews2024"

class OrganicGrowthBot:
    def __init__(self):
        self.bot_token = BOT_TOKEN
        self.channel = CHANNEL
        self.channel_link = CHANNEL_LINK
        
    def post_quality_content(self):
        """Post high-quality, engaging content"""
        
        quality_posts = [
            f"""📊 NIFTY Analysis - {datetime.now().strftime('%d %b, %I:%M %p')}

Current Level: 24,850
Immediate Support: 24,700
Strong Support: 24,500
Resistance: 25,000

📈 Bullish above 24,700
📉 Bearish below 24,500

Detailed chart analysis with entry/exit points available for members.

Join for free (limited time): {self.channel_link}""",

            f"""🎯 Tomorrow's High Probability Setup

Stock: RELIANCE
Pattern: Ascending Triangle
Entry: Above 2,980
Target 1: 3,020
Target 2: 3,050
Stop Loss: 2,950

Risk-Reward: 1:3 ✅

More setups posted daily.
Free for first 500 members.

{self.channel_link}""",

            f"""💡 Option Strategy of the Day

BANK NIFTY Iron Condor:
• Sell 51,500 PE & 52,500 CE
• Buy 51,000 PE & 53,000 CE
• Max Profit: ₹12,000
• Max Loss: ₹8,000

Best for sideways market.

Detailed strategies with Greeks explained.

Learn more: {self.channel_link}""",

            f"""📰 Market News Impact Analysis

✅ IT stocks to gain from weak rupee
✅ Banking sector positive on credit growth
✅ Auto sector mixed on chip shortage

How to trade these news?
Full analysis in our channel.

{self.channel_link}""",

            f"""🏆 Today's Performance

Morning Calls:
• NIFTY 24,800 CE: +45 points ✅
• TCS Buy: +₹35 profit ✅
• HDFC Sell: +₹28 profit ✅

Success Rate: 8/10 calls profitable

Get tomorrow's calls early.
Free membership ending soon.

{self.channel_link}""",

            f"""📚 Free Learning: Fibonacci Retracement

Key Levels to Watch:
• 23.6% - Minor support/resistance
• 38.2% - Moderate reversal point
• 50% - Strong psychological level
• 61.8% - Golden ratio (strongest)

Learn to use these in real trades.
Daily educational content.

{self.channel_link}""",

            f"""⚡ Quick Intraday Tip

Volume + Price Action = High Probability Trade

If price breaks resistance with 2x average volume:
✅ 70% chance of continuation
✅ Good risk-reward setup

More proven strategies shared daily.

{self.channel_link}""",

            f"""📊 FII/DII Data Analysis

Today's Data:
• FII: +₹2,346 Cr (Bullish)
• DII: -₹1,234 Cr
• Net: +₹1,112 Cr

FII buying in IT & Banking sectors.
Expect continued uptrend.

Daily institutional data analysis.

{self.channel_link}"""
        ]
        
        # Pick random quality content
        post = random.choice(quality_posts)
        
        # Add interactive buttons
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {
            'chat_id': self.channel,
            'text': post,
            'parse_mode': 'HTML',
            'reply_markup': {
                'inline_keyboard': [
                    [
                        {'text': '📈 Join Free', 'url': self.channel_link},
                        {'text': '📤 Share', 'url': f'https://t.me/share/url?url={self.channel_link}&text=Great trading channel with free signals!'}
                    ]
                ]
            }
        }
        
        response = requests.post(url, json=data)
        if response.status_code == 200:
            print(f"✅ Posted quality content at {datetime.now().strftime('%I:%M %p')}")
            return True
        return False
    
    def create_interactive_posts(self):
        """Create posts that encourage engagement"""
        
        interactive = [
            f"""🗳️ POLL: Where will NIFTY close tomorrow?

Click your prediction:
🔴 Below 24,700
🟡 24,700 - 24,900
🟢 Above 24,900

Results and analysis at 3:30 PM tomorrow!

Participate and learn: {self.channel_link}""",

            f"""🎁 GIVEAWAY: Free Stock Screener Access!

To participate:
1️⃣ Join our channel
2️⃣ Share this post
3️⃣ Comment your favorite stock

Winner announced at 8 PM!

{self.channel_link}""",

            f"""❓ QUIZ: Test Your Trading Knowledge!

What does RSI above 70 indicate?
A) Oversold
B) Overbought
C) Neutral
D) Breakout

First 5 correct answers get exclusive content!

Answer after joining: {self.channel_link}""",

            f"""💬 DISCUSSION: Best Sector for 2024?

Share your views:
• IT - US recovery play
• Banking - Credit growth story
• Auto - EV transformation
• Pharma - Export opportunity

Join the discussion: {self.channel_link}"""
        ]
        
        post = random.choice(interactive)
        
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {
            'chat_id': self.channel,
            'text': post,
            'parse_mode': 'HTML'
        }
        
        requests.post(url, json=data)
        print("✅ Posted interactive content")
    
    def post_scarcity_message(self):
        """Create urgency without being spammy"""
        
        # Gradually increasing member count
        current_members = random.randint(150, 250)
        spots_left = 500 - current_members
        
        scarcity_posts = [
            f"""📢 Membership Update

Current members: {current_members}/500
Spots remaining: {spots_left}

After 500 members:
• ❌ No new members for 3 months
• ❌ Paid membership (₹2,999/month)

Secure your free lifetime spot now:
{self.channel_link}""",

            f"""⏰ Limited Time Offer Ending Soon

Free Membership Includes:
✅ Daily 3-5 trading calls
✅ Risk management guidance
✅ Educational content
✅ Market analysis

Only {spots_left} spots left!

{self.channel_link}""",

            f"""🌟 Why Members Love Our Channel:

"Accurate calls, proper SL" - Raj
"Best educational content" - Priya
"Recovered losses in 1 month" - Amit

Join {current_members} smart traders.
{spots_left} spots remaining.

{self.channel_link}"""
        ]
        
        post = random.choice(scarcity_posts)
        
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {
            'chat_id': self.channel,
            'text': post,
            'parse_mode': 'HTML',
            'reply_markup': {
                'inline_keyboard': [
                    [{'text': f'🎯 Claim Your Spot ({spots_left} left)', 'url': self.channel_link}]
                ]
            }
        }
        
        requests.post(url, json=data)
        print(f"✅ Posted scarcity message ({spots_left} spots left)")
    
    def post_social_proof(self):
        """Share success stories and testimonials"""
        
        testimonials = [
            f"""💰 Member Success Story

Rajesh from Mumbai:
"Joined last week. Already made ₹45,000 profit from just 3 trades. The risk management tips are gold!"

Start your success story:
{self.channel_link}""",

            f"""📈 This Week's Results

Members reported:
• Average profit: ₹18,500
• Win rate: 78%
• Best trade: BANKNIFTY +₹32,000

Your results could be next!
{self.channel_link}""",

            f"""🏆 Top Performing Calls This Month

1. NIFTY 24,500 CE: +280%
2. RELIANCE Buy: +12%
3. TCS 3,100 CE: +220%
4. BANK NIFTY Bull Spread: +45%

Verified with screenshots.
Join for next month's calls:
{self.channel_link}"""
        ]
        
        post = random.choice(testimonials)
        
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {'chat_id': self.channel, 'text': post, 'parse_mode': 'HTML'}
        
        requests.post(url, json=data)
        print("✅ Posted social proof")
    
    def run_organic_growth(self):
        """Main loop for organic growth"""
        
        print("\n🌱 ORGANIC GROWTH BOT STARTED!")
        print("="*50)
        print("Strategy: Quality Content + Smart Marketing")
        print("No spam, No blocking, Just value!")
        print("="*50)
        
        post_types = [
            'quality',
            'interactive',
            'scarcity',
            'social_proof',
            'quality',
            'quality'  # More quality content
        ]
        
        cycle = 1
        
        while True:
            try:
                print(f"\n📍 CYCLE {cycle} - {datetime.now().strftime('%I:%M %p')}")
                print("-"*40)
                
                # Choose post type
                post_type = post_types[cycle % len(post_types)]
                
                if post_type == 'quality':
                    print("Posting quality content...")
                    self.post_quality_content()
                    
                elif post_type == 'interactive':
                    print("Posting interactive content...")
                    self.create_interactive_posts()
                    
                elif post_type == 'scarcity':
                    print("Creating urgency...")
                    self.post_scarcity_message()
                    
                elif post_type == 'social_proof':
                    print("Posting social proof...")
                    self.post_social_proof()
                
                print(f"Channel: {self.channel}")
                print(f"Link: {self.channel_link}")
                
                # Smart timing
                wait_minutes = random.randint(45, 75)  # 45-75 minutes
                print(f"\nNext post in {wait_minutes} minutes...")
                print("="*50)
                
                cycle += 1
                time.sleep(wait_minutes * 60)
                
            except KeyboardInterrupt:
                print("\n✅ Organic growth bot stopped")
                break
            except Exception as e:
                print(f"Error: {e}")
                time.sleep(300)

def main():
    bot = OrganicGrowthBot()
    bot.run_organic_growth()

if __name__ == "__main__":
    main()