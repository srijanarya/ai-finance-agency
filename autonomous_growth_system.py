#!/usr/bin/env python3
"""
AUTONOMOUS GROWTH SYSTEM - No Groups, No Manual Work
Grows 24/7 through viral content and discovery
"""

import requests
import time
import random
import hashlib
from datetime import datetime, timedelta
import json

BOT_TOKEN = "8478124403:AAFNni_9GQtWwrzk3ElhkMkTKljbSQyWp9Y"
CHANNEL = "@AIFinanceNews2024"
CHANNEL_LINK = "https://t.me/AIFinanceNews2024"

class AutonomousGrowthSystem:
    def __init__(self):
        self.bot_token = BOT_TOKEN
        self.channel = CHANNEL
        self.channel_link = CHANNEL_LINK
        self.viral_counter = 0
        
    def create_viral_searchable_content(self):
        """Create content that gets discovered through Telegram search"""
        
        # Popular search terms people use
        trending_keywords = [
            "#NIFTY", "#BANKNIFTY", "#StockMarket", "#Trading", "#Options",
            "#Intraday", "#FreeSignals", "#TradingSignals", "#StockTips",
            "#NSE", "#BSE", "#IndianStocks", "#ShareMarket", "#BreakoutStocks"
        ]
        
        viral_posts = [
            f"""🔴 BREAKING: {random.choice(['RELIANCE', 'TCS', 'INFOSYS', 'HDFC'])} MASSIVE MOVE!
            
{random.choice(trending_keywords)} {random.choice(trending_keywords)} {random.choice(trending_keywords)}

📈 Entry: Current Price
🎯 Target 1: +5%
🎯 Target 2: +8%
🛑 Stoploss: -3%

⚠️ BIG INSTITUTIONS BUYING!

Get all calls FREE (First 500 only!)
Join fast: {self.channel_link}

#FreeSignals #TradingSignals #StockMarket #NIFTY #Options #Intraday #ProfitableTrading""",

            f"""💰 YESTERDAY'S PROFIT: ₹{random.randint(25000, 75000)}!

{random.choice(trending_keywords)} {random.choice(trending_keywords)}

Our members made:
✅ NIFTY CALL: +₹{random.randint(8000, 15000)}
✅ BANKNIFTY PUT: +₹{random.randint(10000, 20000)}
✅ STOCK FUTURE: +₹{random.randint(5000, 12000)}

Want tomorrow's calls?
FREE till 500 members!

{self.channel_link}

#ProfitableTrading #SuccessStory #TradingResults #FreeSignals #MoneyMaking""",

            f"""🚨 TOMORROW'S JACKPOT TRADE REVEALED!

{random.choice(trending_keywords)} {random.choice(trending_keywords)} {random.choice(trending_keywords)}

Our AI detected HUGE order flow in:
🔥 {random.choice(['Banking', 'IT', 'Pharma', 'Auto'])} Sector

Expecting {random.randint(3, 7)}% move!

Details at 9:00 AM sharp.
Only for members: {self.channel_link}

#JackpotTrade #BigMove #TomorrowTrade #BreakoutAlert #HugeProfit""",

            f"""📊 LIVE MARKET SECRET REVEALED!

How I turned ₹50,000 into ₹{random.randint(200000, 500000)} in 3 months!

The strategy:
1. Follow smart money
2. Risk only 2% per trade
3. Use our signals

Get the FULL strategy FREE:
{self.channel_link}

Currently: {random.randint(200, 400)}/500 members

#TradingStrategy #SuccessSecret #MoneyMultiplier #Profit #WealthCreation"""
        ]
        
        post = random.choice(viral_posts)
        
        # Post with maximum discoverability
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {
            'chat_id': self.channel,
            'text': post,
            'parse_mode': 'HTML',
            'reply_markup': {
                'inline_keyboard': [
                    [
                        {'text': '🚀 JOIN NOW (FREE)', 'url': self.channel_link},
                        {'text': '📤 SHARE = EARN ₹500', 'url': f'https://t.me/share/url?url={self.channel_link}&text=I made profit! Join fast!'}
                    ]
                ]
            }
        }
        
        response = requests.post(url, json=data)
        if response.status_code == 200:
            self.viral_counter += 1
            print(f"✅ Posted viral searchable content #{self.viral_counter}")
            return True
        return False
    
    def create_forwarding_chain(self):
        """Create content designed to be forwarded"""
        
        forward_posts = [
            f"""🎁 GIFT FOR YOUR FRIENDS!

Share this with 5 friends and get:
✅ 1 Month Premium Signals FREE
✅ Worth ₹5,000
✅ Instant activation

Your friends get:
• Free signals for 1 week
• Daily profit opportunities

Share now: {self.channel_link}

*Forward this message to claim*""",

            f"""⚠️ URGENT: Market Crash/Rally Alert!

Big move expected tomorrow!
Protect your capital.

FREE emergency alerts available here:
{self.channel_link}

*Forward to all trader friends*
*They'll thank you later*""",

            f"""💎 SECRET FORMULA LEAKED!

The ₹1 Lakh per month trading formula:
Step 1: Join {self.channel}
Step 2: Follow signals
Step 3: Maintain discipline
Step 4: Book profits

*Forward to someone who needs this*

Limited FREE access: {self.channel_link}""",

            f"""🏆 CONTEST ALERT!

Win ₹10,000 Amazon Voucher!

How to participate:
1. Join {self.channel}
2. Forward this to 10 groups
3. Screenshot proof

Winner announced Sunday!

*Start forwarding now!*"""
        ]
        
        post = random.choice(forward_posts)
        
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {
            'chat_id': self.channel,
            'text': post,
            'parse_mode': 'HTML'
        }
        
        requests.post(url, json=data)
        print("✅ Posted forward-chain content")
    
    def create_fomo_countdown(self):
        """Create urgency with countdown"""
        
        # Calculate fake but believable numbers
        current_members = 287 + (self.viral_counter * 3)  # Increases with each post
        spots_left = 500 - current_members
        hours_left = random.randint(24, 72)
        
        countdown_post = f"""⏰ COUNTDOWN STARTED!

🔴 {spots_left} SPOTS LEFT
🔴 {hours_left} HOURS REMAINING
🔴 THEN PAID FOREVER

Current: {current_members}/500 members

After 500:
❌ ₹4,999/month fee
❌ No new members for 6 months
❌ Exclusive access only

Your last chance for FREE lifetime access:
{self.channel_link}

*This message will self-destruct*
*Screenshot now*"""
        
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {
            'chat_id': self.channel,
            'text': countdown_post,
            'parse_mode': 'HTML',
            'reply_markup': {
                'inline_keyboard': [
                    [{'text': f'🏃 GRAB SPOT ({spots_left} left)', 'url': self.channel_link}]
                ]
            }
        }
        
        requests.post(url, json=data)
        print(f"✅ Posted FOMO countdown ({spots_left} spots left)")
    
    def create_social_proof_testimonials(self):
        """Generate believable testimonials"""
        
        names = ["Raj", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohit", "Deepa"]
        cities = ["Mumbai", "Delhi", "Bangalore", "Pune", "Chennai", "Kolkata", "Hyderabad"]
        
        testimonials = [
            f"""💬 Real Member Reviews:

"{random.choice(names)} from {random.choice(cities)}:
Made ₹{random.randint(20, 60)}K this week! Best decision ever! 🙏"

"{random.choice(names)} from {random.choice(cities)}:
Finally profitable after joining. Accuracy is amazing! ⭐⭐⭐⭐⭐"

"{random.choice(names)} from {random.choice(cities)}:
Recovered all losses in 15 days. Thank you! 🎯"

Join them: {self.channel_link}""",

            f"""📸 PROFIT SCREENSHOTS from members:

Member 1: +₹{random.randint(15000, 35000)} today
Member 2: +₹{random.randint(20000, 45000)} this week  
Member 3: +₹{random.randint(30000, 60000)} this month

*Screenshots in channel*

See for yourself: {self.channel_link}"""
        ]
        
        post = random.choice(testimonials)
        
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {'chat_id': self.channel, 'text': post, 'parse_mode': 'HTML'}
        
        requests.post(url, json=data)
        print("✅ Posted social proof")
    
    def create_exclusive_leak(self):
        """Create 'leaked' exclusive content"""
        
        leaks = [
            f"""🔒 CONFIDENTIAL (Deleted in 30 mins)

Operator buying detected in:
Stock: {random.choice(['RELIANCE', 'TCS', 'HDFC', 'ICICI', 'AXIS'])}
Target: +{random.randint(5, 15)}% in {random.randint(3, 7)} days

This is insider-level info.
Members get it first: {self.channel_link}

*Screenshot before deletion*""",

            f"""🤫 DON'T SHARE THIS!

FII's big order tomorrow:
Sector: {random.choice(['Banking', 'IT', 'Pharma'])}
Size: ₹{random.randint(500, 1500)} Crores

Positioning now = Huge profits!

Exclusive for members: {self.channel_link}"""
        ]
        
        post = random.choice(leaks)
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {'chat_id': self.channel, 'text': post}
        
        requests.post(url, json=data)
        print("✅ Posted 'leaked' content")
    
    def create_interactive_quiz(self):
        """Create engaging quiz content"""
        
        quiz = f"""🎯 TRADING QUIZ - Win ₹1,000!

Q: If NIFTY is at 24,850 and you buy 24,900 CE at ₹50, what's your breakeven?

A) 24,900
B) 24,950
C) 24,850
D) 25,000

First correct answer wins!
Answer in channel: {self.channel_link}

*Hint: Premium + Strike*"""
        
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {'chat_id': self.channel, 'text': quiz}
        
        requests.post(url, json=data)
        print("✅ Posted interactive quiz")
    
    def create_news_alert(self):
        """Create urgent news alerts"""
        
        alerts = [
            f"""🚨 BREAKING NEWS ALERT!

RBI ANNOUNCEMENT IN 30 MINS!
Market expecting volatile move!

Get positioned now!
Live updates: {self.channel_link}

#RBI #BreakingNews #MarketAlert""",

            f"""📰 FLASH: {random.choice(['RELIANCE', 'TCS', 'INFOSYS'])} NEWS!

Major announcement coming!
Stock halted, will resume soon.

Members get instant alerts: {self.channel_link}

#BreakingNews #StockAlert"""
        ]
        
        post = random.choice(alerts)
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {'chat_id': self.channel, 'text': post}
        
        requests.post(url, json=data)
        print("✅ Posted news alert")
    
    def run_autonomous_growth(self):
        """Main autonomous growth loop"""
        
        print("\n🤖 AUTONOMOUS GROWTH SYSTEM STARTED!")
        print("="*60)
        print("NO GROUPS NEEDED - Pure Viral Growth")
        print("Runs 24/7 automatically")
        print("="*60)
        
        strategies = [
            self.create_viral_searchable_content,
            self.create_forwarding_chain,
            self.create_fomo_countdown,
            self.create_social_proof_testimonials,
            self.create_exclusive_leak,
            self.create_interactive_quiz,
            self.create_news_alert,
            self.create_viral_searchable_content,  # More viral content
            self.create_viral_searchable_content   # Even more
        ]
        
        cycle = 1
        
        while True:
            try:
                print(f"\n📍 GROWTH CYCLE {cycle}")
                print(f"Time: {datetime.now().strftime('%I:%M %p')}")
                print("-"*40)
                
                # Run different strategies
                strategy = strategies[cycle % len(strategies)]
                strategy()
                
                # Occasionally run multiple strategies
                if cycle % 3 == 0:
                    print("🔥 Boost mode - extra posts!")
                    self.create_viral_searchable_content()
                    time.sleep(60)
                    self.create_forwarding_chain()
                
                # Show progress
                fake_members = 287 + (cycle * random.randint(3, 8))
                print(f"\n📊 Progress: ~{fake_members}/500 members")
                print(f"Channel: {self.channel}")
                
                # Smart timing - more posts during market hours
                hour = datetime.now().hour
                
                if 9 <= hour <= 15:  # Market hours
                    wait = random.randint(20, 40)  # 20-40 mins
                else:  # Off hours
                    wait = random.randint(40, 80)  # 40-80 mins
                
                print(f"Next post in {wait} minutes...")
                print("="*60)
                
                cycle += 1
                time.sleep(wait * 60)
                
            except KeyboardInterrupt:
                print("\n✅ Autonomous system stopped")
                break
            except Exception as e:
                print(f"Error: {e}")
                time.sleep(300)

def main():
    system = AutonomousGrowthSystem()
    system.run_autonomous_growth()

if __name__ == "__main__":
    main()