"""
Telegram Growth Engine - Advanced Subscriber Acquisition System
Gets you thousands of real, engaged Telegram subscribers
"""

import asyncio
import random
import hashlib
import string
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from telethon import TelegramClient, events, Button
from telethon.tl.functions.channels import JoinChannelRequest, GetParticipantsRequest
from telethon.tl.functions.messages import GetHistoryRequest, ImportChatInviteRequest
from telethon.tl.types import ChannelParticipantsSearch
import os
try:
    from database.models import db_manager, Subscriber, Campaign, GrowthMetric
    from cache.redis_cache import cache
except ImportError:
    # Use SQLite for local development
    from database.models_sqlite import db_manager, Subscriber, Campaign, GrowthMetric
    from cache.simple_cache import cache
import json

class TelegramGrowthEngine:
    def __init__(self):
        self.api_id = os.getenv('TELEGRAM_API_ID')
        self.api_hash = os.getenv('TELEGRAM_API_HASH')
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.channel_username = os.getenv('TELEGRAM_CHANNEL', '@AIFinanceNews2024')
        self.client = None
        self.bot = None
        self.growth_strategies = []
        
    async def initialize(self):
        """Initialize Telegram clients"""
        # User client for advanced operations
        self.client = TelegramClient('growth_session', self.api_id, self.api_hash)
        await self.client.start()
        
        # Bot client for interactions
        if self.bot_token:
            self.bot = TelegramClient('bot_session', self.api_id, self.api_hash)
            await self.bot.start(bot_token=self.bot_token)
            self._setup_bot_handlers()
    
    def _setup_bot_handlers(self):
        """Set up bot command handlers"""
        
        @self.bot.on(events.NewMessage(pattern='/start'))
        async def start_handler(event):
            user_id = str(event.sender_id)
            
            # Extract referral code if present
            referral_code = None
            if ' ' in event.text:
                referral_code = event.text.split(' ')[1]
            
            # Register new subscriber
            await self.register_subscriber(
                telegram_id=user_id,
                username=event.sender.username,
                first_name=event.sender.first_name,
                referral_code=referral_code
            )
            
            # Send welcome message with benefits
            buttons = [
                [Button.url("📢 Join Our Channel", f"https://t.me/{self.channel_username[1:]}")],
                [Button.inline("🎁 Get Free Signals", "free_signals")],
                [Button.inline("💎 Premium Access", "premium")],
                [Button.inline("🔗 Get Referral Link", "referral")]
            ]
            
            welcome_msg = """
🚀 **Welcome to AI Finance Agency!**

Get exclusive benefits:
✅ Daily Trading Signals (85% accuracy)
✅ Real-time Market Analysis
✅ Premium Stock Picks
✅ Crypto Alerts
✅ Risk Management Tips

🎁 **Special Offer**: Invite 3 friends and get 1 month Premium FREE!

Join our channel now to never miss profitable opportunities!
            """
            
            await event.respond(welcome_msg, buttons=buttons, parse_mode='markdown')
        
        @self.bot.on(events.CallbackQuery(pattern='free_signals'))
        async def free_signals_handler(event):
            await event.answer("📊 Generating your free signals...")
            signals = await self.generate_sample_signals()
            await event.respond(signals, parse_mode='markdown')
        
        @self.bot.on(events.CallbackQuery(pattern='referral'))
        async def referral_handler(event):
            user_id = str(event.sender_id)
            referral_link = await self.generate_referral_link(user_id)
            
            msg = f"""
🔗 **Your Referral Link:**
`{referral_link}`

📢 Share this link and earn rewards:
• 3 referrals = 1 month Premium
• 10 referrals = 3 months Premium
• 50 referrals = Lifetime Premium + VIP Group

Current referrals: {await self.get_referral_count(user_id)}
            """
            
            await event.respond(msg, parse_mode='markdown')
    
    async def register_subscriber(self, telegram_id: str, username: str = None, 
                                 first_name: str = None, referral_code: str = None):
        """Register a new subscriber"""
        session = db_manager.get_session()
        
        try:
            # Check if subscriber exists
            subscriber = session.query(Subscriber).filter_by(telegram_id=telegram_id).first()
            
            if not subscriber:
                # Generate unique referral code for new subscriber
                new_referral_code = self.generate_referral_code()
                
                subscriber = Subscriber(
                    telegram_id=telegram_id,
                    username=username,
                    first_name=first_name,
                    referral_code=new_referral_code,
                    referred_by=referral_code
                )
                session.add(subscriber)
                
                # Credit referrer if exists
                if referral_code:
                    referrer = session.query(Subscriber).filter_by(referral_code=referral_code).first()
                    if referrer:
                        referrer.referral_count += 1
                        # Send notification to referrer
                        await self.notify_referral_success(referrer.telegram_id)
                
                # Track growth metric
                self.track_metric('new_subscriber', 1)
                
            session.commit()
            
            # Cache subscriber data
            cache.cache_subscriber(telegram_id, {
                'username': username,
                'first_name': first_name,
                'joined_at': datetime.utcnow().isoformat()
            })
            
            return subscriber
            
        except Exception as e:
            session.rollback()
            print(f"Error registering subscriber: {e}")
        finally:
            session.close()
    
    # GROWTH STRATEGIES
    
    async def strategy_1_cross_promotion(self):
        """Cross-promote in related finance/crypto groups"""
        target_groups = [
            'wallstbets', 'CryptoAlerts', 'IndianStockMarket',
            'TradingSignals', 'ForexTrading', 'BitcoinIndia',
            'StockMarketIndia', 'OptionsTrading', 'DayTraders'
        ]
        
        promotion_message = """
🔥 Tired of losing money in markets?

Join @AIFinanceNews2024 for:
• 85% Accurate Trading Signals
• Real-time Market Updates
• AI-Powered Analysis
• FREE Daily Tips

👥 15,000+ traders already profiting!
🎁 Join now and get 5 FREE premium signals!
        """
        
        for group in target_groups:
            try:
                await self.client(JoinChannelRequest(group))
                await asyncio.sleep(random.randint(5, 10))
                
                # Post valuable content first to build trust
                valuable_content = await self.generate_valuable_content()
                await self.client.send_message(group, valuable_content)
                
                await asyncio.sleep(random.randint(30, 60))
                
                # Then soft promotion
                await self.client.send_message(group, promotion_message)
                
                print(f"Promoted in {group}")
                
            except Exception as e:
                print(f"Error promoting in {group}: {e}")
            
            await asyncio.sleep(random.randint(300, 600))  # 5-10 min between groups
    
    async def strategy_2_referral_contest(self):
        """Run viral referral contests"""
        contest = {
            'name': 'Mega Referral Contest',
            'prizes': {
                'top1': 'iPhone 15 Pro',
                'top2': 'iPad Air',
                'top3': 'AirPods Pro',
                'top10': 'Lifetime Premium Access',
                'all': '1 Month Premium for 5+ referrals'
            },
            'duration': 7  # days
        }
        
        # Create campaign in database
        session = db_manager.get_session()
        campaign = Campaign(
            name=contest['name'],
            campaign_type='referral_contest',
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=contest['duration']),
            rewards=contest['prizes'],
            target_subscribers=5000
        )
        session.add(campaign)
        session.commit()
        session.close()
        
        # Broadcast to existing subscribers
        await self.broadcast_to_subscribers(f"""
🎉 **MEGA REFERRAL CONTEST STARTED!**

🏆 **Prizes:**
🥇 1st Place: iPhone 15 Pro
🥈 2nd Place: iPad Air  
🥉 3rd Place: AirPods Pro
🏅 Top 10: Lifetime Premium Access
🎁 5+ referrals: 1 Month Premium

⏰ Contest ends in 7 days!

Get your referral link: /referral
Current leaderboard: /leaderboard
        """)
        
        return campaign
    
    async def strategy_3_airdrop_campaign(self):
        """Run token/rewards airdrop for subscribers"""
        airdrop_message = """
💰 **MASSIVE AIRDROP ALERT!**

AI Finance Token Airdrop Worth $1000!

✅ Step 1: Join @AIFinanceNews2024
✅ Step 2: Share to 3 groups (proof required)
✅ Step 3: Invite 5 friends
✅ Step 4: Fill form: http://bit.ly/airdrop-form

💎 Extra Rewards:
• Top 100 participants: $50 bonus
• Random 10 winners: $100 each

⏰ Limited time only!
        """
        
        # Post in crypto airdrop groups
        airdrop_groups = [
            'airdropalerts', 'cryptoairdrops', 'freecoins',
            'airdrophunters', 'cryptogiveaway'
        ]
        
        for group in airdrop_groups:
            try:
                await self.client.send_message(group, airdrop_message)
                print(f"Posted airdrop in {group}")
            except:
                pass
            
            await asyncio.sleep(random.randint(60, 120))
    
    async def strategy_4_content_virality(self):
        """Create viral content that naturally promotes the channel"""
        viral_templates = [
            {
                'hook': "🤯 This trader turned ₹10,000 into ₹10 Lakhs in 3 months!",
                'content': "Here's the exact strategy (save this):",
                'steps': [
                    "1. Focus on high-momentum stocks only",
                    "2. Use our AI signals (85% accuracy)",
                    "3. Strict 2% stop loss, 6% target",
                    "4. Compound profits weekly",
                    "5. Never risk more than 5% per trade"
                ],
                'cta': "Get daily signals FREE 👉 @AIFinanceNews2024"
            },
            {
                'hook': "⚠️ URGENT: These 5 stocks will explode tomorrow!",
                'content': "Based on AI analysis + unusual options activity:",
                'steps': [
                    "1. RELIANCE - Breakout above 2850",
                    "2. TCS - Hidden accumulation pattern",
                    "3. INFY - Smart money loading",
                    "4. HDFC - Chart pattern complete",
                    "5. ITC - Volume spike detected"
                ],
                'cta': "Real-time alerts 👉 @AIFinanceNews2024"
            }
        ]
        
        for template in viral_templates:
            message = f"{template['hook']}\n\n{template['content']}\n"
            message += '\n'.join(template['steps'])
            message += f"\n\n{template['cta']}"
            
            # Post in multiple relevant groups
            await self.post_viral_content(message)
            
            await asyncio.sleep(random.randint(1800, 3600))  # 30-60 min
    
    async def strategy_5_influencer_partnerships(self):
        """Partner with finance influencers for shoutouts"""
        influencers = [
            {'username': 'tradingexpert', 'followers': 50000, 'rate': 100},
            {'username': 'stockguru', 'followers': 30000, 'rate': 75},
            {'username': 'cryptoking', 'followers': 40000, 'rate': 90}
        ]
        
        partnership_message = """
Hi! We're AI Finance Agency with 15K+ active traders.

We'd love to partner for a shoutout:
• We'll pay ${rate} for a post
• Or revenue share: 20% of new premium subscribers
• Plus free lifetime premium for you

Our channel has 85% signal accuracy and great engagement.

Interested? Let's discuss!
        """
        
        for influencer in influencers:
            try:
                await self.client.send_message(
                    influencer['username'],
                    partnership_message.format(rate=influencer['rate'])
                )
                print(f"Contacted {influencer['username']}")
            except:
                pass
            
            await asyncio.sleep(random.randint(300, 600))
    
    async def strategy_6_engagement_rewards(self):
        """Reward active members to boost engagement"""
        rewards = {
            'daily_login': 10,
            'share_post': 20,
            'invite_friend': 50,
            'premium_upgrade': 100,
            'write_review': 30
        }
        
        message = """
🎁 **ENGAGEMENT REWARDS PROGRAM**

Earn points for rewards:
• Daily check-in: 10 points
• Share our posts: 20 points  
• Invite friends: 50 points
• Upgrade to premium: 100 points
• Write testimonial: 30 points

🏆 Redeem Points:
• 100 points = 1 week premium
• 300 points = 1 month premium
• 1000 points = 3 months premium

Check your points: /points
        """
        
        await self.broadcast_to_subscribers(message)
    
    # HELPER METHODS
    
    async def generate_sample_signals(self) -> str:
        """Generate sample trading signals"""
        signals = """
📊 **Today's Trading Signals**

🟢 **BUY Signals:**
• RELIANCE @ 2845 | Target: 2920 | SL: 2810
• TCS @ 3456 | Target: 3520 | SL: 3420
• INFY @ 1567 | Target: 1610 | SL: 1540

🔴 **SELL Signals:**
• HDFC @ 1678 | Target: 1640 | SL: 1695
• ITC @ 445 | Target: 438 | SL: 448

⚡ **Crypto Alerts:**
• BTC: Bullish above $45,000
• ETH: Accumulate near $2,800

⚠️ Risk: 2% per trade only!

Get LIVE updates 👉 @AIFinanceNews2024
        """
        return signals
    
    async def generate_valuable_content(self) -> str:
        """Generate valuable content for trust building"""
        templates = [
            """
📈 Market Insight:

NIFTY closed at 19,674 (+0.8%)
Key support: 19,500 | Resistance: 19,750

Tomorrow's view: Bullish above 19,600
Top picks: RELIANCE, TCS, INFY

Risk management tip: Never trade without stop loss!
            """,
            """
💡 Trading Psychology Tip:

"The market can remain irrational longer than you can remain solvent"

Don't fight the trend. Follow these rules:
1. Trade with the trend
2. Use proper position sizing  
3. Accept small losses quickly
4. Let winners run with trailing SL
            """
        ]
        
        return random.choice(templates)
    
    def generate_referral_code(self) -> str:
        """Generate unique referral code"""
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    
    async def generate_referral_link(self, user_id: str) -> str:
        """Generate referral link for user"""
        session = db_manager.get_session()
        subscriber = session.query(Subscriber).filter_by(telegram_id=user_id).first()
        session.close()
        
        if subscriber:
            bot_username = (await self.bot.get_me()).username
            return f"https://t.me/{bot_username}?start={subscriber.referral_code}"
        return ""
    
    async def get_referral_count(self, user_id: str) -> int:
        """Get referral count for user"""
        session = db_manager.get_session()
        subscriber = session.query(Subscriber).filter_by(telegram_id=user_id).first()
        count = subscriber.referral_count if subscriber else 0
        session.close()
        return count
    
    async def notify_referral_success(self, telegram_id: str):
        """Notify user of successful referral"""
        try:
            await self.bot.send_message(
                int(telegram_id),
                "🎉 Congrats! Someone joined using your referral link! Check /referral for your rewards."
            )
        except:
            pass
    
    async def broadcast_to_subscribers(self, message: str):
        """Broadcast message to all subscribers"""
        session = db_manager.get_session()
        subscribers = session.query(Subscriber).filter_by(is_active=True).all()
        session.close()
        
        success_count = 0
        for subscriber in subscribers:
            try:
                await self.bot.send_message(int(subscriber.telegram_id), message, parse_mode='markdown')
                success_count += 1
                await asyncio.sleep(0.5)  # Avoid rate limits
            except:
                pass
        
        print(f"Broadcast sent to {success_count}/{len(subscribers)} subscribers")
    
    async def post_viral_content(self, content: str):
        """Post content to multiple groups"""
        groups = [
            'indiantraders', 'stockmarketindia', 'niftydiscussion',
            'bankniftytraders', 'optionstrading', 'intradaytrading'
        ]
        
        for group in groups:
            try:
                await self.client.send_message(group, content)
                print(f"Posted in {group}")
            except:
                pass
            
            await asyncio.sleep(random.randint(60, 180))
    
    def track_metric(self, metric_name: str, value: float = 1):
        """Track growth metrics"""
        cache.increment_metric(f"growth:{metric_name}", int(value))
        
        # Also store in database
        session = db_manager.get_session()
        metric = GrowthMetric(
            platform='telegram',
            metric_name=metric_name,
            metric_value=value
        )
        session.add(metric)
        session.commit()
        session.close()
    
    async def run_growth_campaign(self):
        """Main method to run all growth strategies"""
        print("🚀 Starting Telegram Growth Engine...")
        
        await self.initialize()
        
        # Run strategies in parallel
        tasks = [
            self.strategy_1_cross_promotion(),
            self.strategy_2_referral_contest(),
            self.strategy_3_airdrop_campaign(),
            self.strategy_4_content_virality(),
            self.strategy_5_influencer_partnerships(),
            self.strategy_6_engagement_rewards()
        ]
        
        await asyncio.gather(*tasks)
        
        print("✅ Growth campaign cycle completed!")

async def main():
    growth_engine = TelegramGrowthEngine()
    
    while True:
        try:
            await growth_engine.run_growth_campaign()
            await asyncio.sleep(7200)  # Run every 2 hours
        except Exception as e:
            print(f"Error in growth campaign: {e}")
            await asyncio.sleep(300)  # Retry after 5 minutes

if __name__ == "__main__":
    asyncio.run(main())