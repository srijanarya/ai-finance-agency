#!/usr/bin/env python3
"""
Professional Content Generator for AI Finance Agency
Creates engaging, valuable content that doesn't sound like generic AI
"""

import random
import json
from datetime import datetime, timedelta
from typing import Dict, List
import hashlib

class ProContentGenerator:
    def __init__(self):
        self.content_history = self.load_history()
        
        # Realistic market data (will be replaced with real API later)
        self.market_data = {
            "nifty": 24734,
            "sensex": 80711,
            "banknifty": 51230,
            "nifty_change": 19,
            "sensex_change": -8,
            "vix": 13.45,
            "dii_flow": 2233,
            "fii_flow": -106
        }
        
        # Top stocks with realistic prices
        self.stocks = {
            "RELIANCE": {"price": 2980, "change": 1.2, "pe": 28, "high52w": 3217},
            "TCS": {"price": 4150, "change": 0.8, "pe": 32, "high52w": 4465},
            "HDFC_BANK": {"price": 1650, "change": -0.5, "pe": 19, "high52w": 1847},
            "INFOSYS": {"price": 1847, "change": 1.5, "pe": 27, "high52w": 2152},
            "ICICI_BANK": {"price": 1280, "change": 1.8, "pe": 18, "high52w": 1340},
            "SBI": {"price": 780, "change": 2.1, "pe": 12, "high52w": 856},
            "WIPRO": {"price": 560, "change": -0.3, "pe": 24, "high52w": 642},
            "ITC": {"price": 485, "change": 0.2, "pe": 26, "high52w": 499},
            "MARUTI": {"price": 12800, "change": 1.9, "pe": 28, "high52w": 13680},
            "ASIAN_PAINTS": {"price": 2890, "change": -1.2, "pe": 48, "high52w": 3422}
        }
        
    def load_history(self) -> set:
        """Load content history to avoid duplicates"""
        try:
            with open('content_history.json', 'r') as f:
                data = json.load(f)
                return set(data.get('hashes', []))
        except:
            return set()
    
    def save_to_history(self, content: str):
        """Save content hash to history"""
        content_hash = hashlib.md5(content.encode()).hexdigest()
        self.content_history.add(content_hash)
        try:
            with open('content_history.json', 'w') as f:
                json.dump({'hashes': list(self.content_history)}, f)
        except:
            pass
    
    def generate_contrarian_take(self) -> str:
        """Generate a contrarian market opinion"""
        templates = [
            {
                "hook": f"Unpopular opinion: Nifty won't cross {self.market_data['nifty'] + 500} this month.",
                "body": f"""
Why?
• RSI divergence on daily charts (68 overbought)
• {abs(self.market_data['fii_flow'])} Cr FII selling continues
• VIX at {self.market_data['vix']}% - complacency peak
• September historically weak (-2.3% avg)

Booking profits at resistance > Chasing momentum

Agree or disagree? 👇"""
            },
            {
                "hook": "Everyone's buying the dip. Here's why I'm not:",
                "body": f"""
• Nifty at {self.market_data['nifty']} - still 8% expensive vs earnings
• Global yields rising - money moving to bonds
• FII sold ₹{abs(self.market_data['fii_flow'])} Cr just yesterday
• Technical breakdown below 20 DMA

Sometimes cash is a position too.

What's your take?"""
            }
        ]
        
        template = random.choice(templates)
        return template["hook"] + "\n" + template["body"]
    
    def generate_mistake_story(self) -> str:
        """Generate a trading mistake story with lessons"""
        stock = random.choice(list(self.stocks.keys()))
        stock_data = self.stocks[stock]
        loss = random.randint(10000, 100000)
        
        templates = [
            f"""Lost ₹{loss:,} on {stock} options last month.

My mistakes:
1. Bought OTM calls before results
2. Ignored IV crush warning (120% → 40%)
3. Averaged down instead of cutting loss
4. Position size: 30% of capital (stupid)

Expensive MBA from the market.

Your worst options trade? Share below 👇""",

            f"""Sold {stock} at ₹{int(stock_data['price'] * 0.85)} in panic.
Today: ₹{stock_data['price']}

That ₹{random.randint(50000, 200000)} loss taught me:
• Stop loss ≠ Panic selling
• News creates opportunities, not disasters
• When retailers panic, institutions accumulate

The market is the best teacher. Fees are high though.

What's your most expensive lesson?"""
        ]
        
        return random.choice(templates)
    
    def generate_data_insight(self) -> str:
        """Generate data-driven market insights"""
        stock = random.choice(list(self.stocks.keys()))
        stock_data = self.stocks[stock]
        
        templates = [
            f"""📊 {stock} at ₹{stock_data['price']} - Trading {round((1 - stock_data['price']/stock_data['high52w']) * 100)}% below 52W high

Why I'm watching:
• PE at {stock_data['pe']}x vs sector avg {stock_data['pe'] + 5}x
• Q2 results beat estimates by 12%
• FII stake increased to 24.3%
• Support at ₹{int(stock_data['price'] * 0.95)}

Not a tip - Do your own research.

On your watchlist? 🎯""",

            f"""Pattern Alert on {stock} 📈

• Consolidating between ₹{int(stock_data['price']*0.98)}-{int(stock_data['price']*1.02)}
• Volume dried up - 60% below 20D avg
• RSI neutral at 52
• Breakout target: ₹{int(stock_data['price']*1.08)}

Big move coming. Direction? That's the ₹ question.

What's your bias on {stock}?"""
        ]
        
        return random.choice(templates)
    
    def generate_market_psychology(self) -> str:
        """Generate content about market psychology"""
        templates = [
            f"""Nifty at {self.market_data['nifty']}. Everyone waiting for {self.market_data['nifty'] + 250}.

But smart money is different:
• FIIs sold ₹{abs(self.market_data['fii_flow'])} Cr yesterday
• DIIs absorbed ₹{self.market_data['dii_flow']} Cr
• Put writers active at {self.market_data['nifty'] - 200}

Retail watches resistance. Pros accumulate at support.

Which side are you on?""",

            f"""Market truth nobody talks about:

Your returns aren't decided by:
• News channels ❌
• WhatsApp tips ❌
• Technical indicators ❌

They're decided by:
• Position sizing ✅
• Risk management ✅
• Emotional control ✅

The best setup fails with bad psychology.

Agree?"""
        ]
        
        return random.choice(templates)
    
    def generate_educational_hook(self) -> str:
        """Generate educational content with a hook"""
        templates = [
            f"""Option sellers have 86% win rate. Here's why:

1. Time decay (Theta) always on your side
2. Don't need big moves - sideways = profit
3. IV crush after events = free money
4. Premium collection = regular income

Risk: Unlimited (theoretically)
Reality: Manageable with hedges

Buying or selling? What works for you?""",

            f"""My 3-step stock selection process:

1. Revenue growth > 15% for 3 years
2. PE < Industry PE by 20%
3. Promoter holding > 50%

This filtered 2,800 stocks to 12.
7 outperformed Nifty.

What's your filtering criteria?""",

            f"""VIX at {self.market_data['vix']}% - What it really means:

• Daily Nifty range: ±{round(self.market_data['vix']/20, 1)}%
• Weekly range: ±{round(self.market_data['vix']/10, 1)}%
• Options premium: Cheaper now
• Market sentiment: Complacent

Low VIX = Sell options
High VIX = Buy options

How do you play volatility?"""
        ]
        
        return random.choice(templates)
    
    def generate_weekend_special(self) -> str:
        """Generate weekend analysis content"""
        weekly_change = round(random.uniform(-2, 3), 1)
        
        return f"""📊 Weekly Scorecard (Sep 2-6)

Winners 🟢:
• Banking: +2.1% (Rate cut hopes)
• IT: +1.8% (Weak rupee benefit)
• Auto: +1.5% (Festive demand)

Losers 🔴:
• Pharma: -1.2% (US FDA concerns)
• FMCG: -0.8% (Margin pressure)

Week ahead watchlist:
• {random.choice(list(self.stocks.keys()))} - Breakout setup
• Bank Nifty 52k - Key resistance
• VIX below 15 - Complacency zone

Your Monday plan? 🎯"""
    
    def generate_prediction_with_logic(self) -> str:
        """Generate specific predictions with reasoning"""
        stock = random.choice(list(self.stocks.keys()))
        stock_data = self.stocks[stock]
        target = int(stock_data['price'] * random.uniform(1.05, 1.15))
        
        return f"""{stock} to hit ₹{target} by month-end.

My thesis:
• Broke out of 6-month consolidation
• Volumes 2x of 20-day average
• FII buying for 8 straight sessions
• Sector rotation into {random.choice(['IT', 'Banking', 'Auto'])}

SL: ₹{int(stock_data['price'] * 0.97)}
Risk:Reward = 1:3

On your radar? Not a tip - DYOR! 📊"""
    
    def generate_content(self, platform: str = "linkedin") -> Dict:
        """Generate professional content based on type"""
        # Content types with weights (more variety)
        content_types = [
            (self.generate_contrarian_take, 0.15),
            (self.generate_mistake_story, 0.15),
            (self.generate_data_insight, 0.20),
            (self.generate_market_psychology, 0.15),
            (self.generate_educational_hook, 0.20),
            (self.generate_prediction_with_logic, 0.10),
            (self.generate_weekend_special, 0.05)
        ]
        
        # Select content type based on weights
        generators, weights = zip(*content_types)
        generator = random.choices(generators, weights=weights)[0]
        
        # Generate content
        content = generator()
        
        # Add hashtags for LinkedIn
        if platform == "linkedin":
            hashtags = "\n\n#StockMarket #Nifty50 #Trading #IndianMarkets #Investment"
            content += hashtags
        
        # Check for duplicates
        content_hash = hashlib.md5(content.encode()).hexdigest()
        if content_hash not in self.content_history:
            self.save_to_history(content)
            
            return {
                "content": content,
                "platform": platform,
                "timestamp": datetime.now().isoformat(),
                "type": generator.__name__.replace("generate_", ""),
                "success": True
            }
        else:
            # Recursively try again if duplicate
            return self.generate_content(platform)

def test_generator():
    """Test the professional content generator"""
    generator = ProContentGenerator()
    
    print("🚀 Professional Content Examples:\n")
    print("=" * 60)
    
    for i in range(5):
        result = generator.generate_content("linkedin")
        print(f"\n📝 Post #{i+1} ({result['type']}):")
        print("-" * 60)
        print(result['content'])
        print("-" * 60)

if __name__ == "__main__":
    test_generator()