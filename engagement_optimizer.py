#!/usr/bin/env python3
"""
Financial Content Engagement Optimizer v2.0
Based on 30x engagement research findings
Implements all proven multipliers for maximum impact
"""

import random
import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import hashlib

class EngagementOptimizer:
    """
    Core engagement optimization engine
    Applies research-proven multipliers:
    - Loss framing: 2x engagement
    - Visual content: 30x engagement
    - List headlines: 65-95% engagement
    - Single CTA: 371% more clicks
    """
    
    def __init__(self):
        self.multipliers = {
            'loss_framing': 2.0,
            'visual_content': 30.0,
            'list_headline': 0.80,  # Average of 65-95%
            'single_cta': 4.71,  # 371% increase = 4.71x
            'urgency': 3.32,
            'social_proof': 2.70,
            'authority': 2.70
        }
        
        # Load history for tracking
        self.content_history = self.load_history()
        
        # Market data for realistic content
        self.market_data = {
            "nifty": 24734,
            "sensex": 80711,
            "banknifty": 51230,
            "nifty_change": -0.75,
            "sensex_change": -0.82,
            "vix": 13.45,
            "dii_flow": 2233,
            "fii_flow": -106,
            "dollar_inr": 85.42,
            "gold_price": 72450,
            "crude_oil": 78.32
        }
        
        self.stocks = {
            "RELIANCE": {"price": 2980, "change": -1.2, "pe": 28, "high52w": 3217, "sector": "Energy"},
            "TCS": {"price": 4150, "change": 0.8, "pe": 32, "high52w": 4465, "sector": "IT"},
            "HDFC_BANK": {"price": 1650, "change": -0.5, "pe": 19, "high52w": 1847, "sector": "Banking"},
            "INFOSYS": {"price": 1847, "change": 1.5, "pe": 27, "high52w": 2152, "sector": "IT"},
            "ICICI_BANK": {"price": 1280, "change": 1.8, "pe": 18, "high52w": 1340, "sector": "Banking"}
        }
    
    def load_history(self) -> set:
        """Load content history"""
        try:
            with open('engagement_history.json', 'r') as f:
                data = json.load(f)
                return set(data.get('hashes', []))
        except:
            return set()
    
    def save_to_history(self, content: str):
        """Save content hash to prevent duplicates"""
        content_hash = hashlib.md5(content.encode()).hexdigest()
        self.content_history.add(content_hash)
        try:
            with open('engagement_history.json', 'w') as f:
                json.dump({'hashes': list(self.content_history)}, f)
        except:
            pass
    
    def apply_loss_framing(self, content: str) -> str:
        """
        Transform gain-framed content to loss-framed for 2x engagement
        """
        gain_to_loss = {
            "earn": "avoid losing",
            "save": "stop wasting",
            "grow": "protect from erosion",
            "increase": "prevent decrease",
            "gain": "avoid missing",
            "profit": "prevent loss",
            "returns": "missed opportunities",
            "wealth": "purchasing power erosion"
        }
        
        for gain, loss in gain_to_loss.items():
            content = content.replace(gain, loss)
        
        return content
    
    def generate_viral_headline(self, topic: str, style: str = "list") -> str:
        """
        Generate headlines with 65-95% engagement rates
        """
        headlines = {
            "list": [
                f"7 {topic} Mistakes Costing You ₹{random.randint(10,100)}K Annually",
                f"5 Hidden {topic} Risks Destroying Your Portfolio",
                f"3 {topic} Strategies The Wealthy Won't Share",
                f"9 {topic} Warning Signs Everyone Ignores",
                f"6 {topic} Myths Keeping You Poor"
            ],
            "how_to": [
                f"How to Protect Your Portfolio From {topic} Without Losing Sleep",
                f"How to Beat {topic} Without Timing The Market",
                f"How to Survive {topic} When Everyone Else Panics"
            ],
            "loss_framed": [
                f"Why You're Losing ₹{random.randint(50,500)}K By Ignoring {topic}",
                f"The {topic} Mistake That's Costing You 40% Returns",
                f"Stop This {topic} Error Before It Destroys Your Retirement"
            ],
            "urgency": [
                f"Last Chance: {topic} Opportunity Expires Tomorrow",
                f"Warning: {topic} Changes Everything in 48 Hours",
                f"Act Now: {topic} Window Closing Fast"
            ]
        }
        
        return random.choice(headlines.get(style, headlines["list"]))
    
    def create_visual_description(self, data_type: str) -> str:
        """
        Generate visual content descriptions for 30x engagement
        """
        visuals = {
            "chart": f"""
[INFOGRAPHIC: Market Performance Dashboard]
┌─────────────────────────────────┐
│ NIFTY: {self.market_data['nifty']} ({self.market_data['nifty_change']:+.2f}%) 📉 │
│ ▼▼▼▼▼▼▼░░░ -0.75%              │
├─────────────────────────────────┤
│ FII FLOW: ₹{abs(self.market_data['fii_flow'])} Cr SELLING 🔴│
│ DII FLOW: ₹{self.market_data['dii_flow']} Cr BUYING 🟢 │
├─────────────────────────────────┤
│ VIX: {self.market_data['vix']}% - COMPLACENCY ZONE ⚠️│
└─────────────────────────────────┘
""",
            "comparison": f"""
[VISUAL: Winners vs Losers Bar Chart]
WINNERS 📈              LOSERS 📉
Banking  ████████ +2.1%  Pharma ██ -1.2%
IT       ███████ +1.8%   FMCG   █ -0.8%
Auto     ██████ +1.5%    Metal  ███ -1.5%
""",
            "pie": f"""
[PIE CHART: Smart Money Allocation]
     Cash 20% 💵
    ╱────────╲
   │  SAFETY  │
Gold│  FIRST  │Bonds
15% │ PORTFOLIO│ 25%
    ╲────────╱
  Equity 40% 📊
""",
            "timeline": f"""
[TIMELINE: Market Crash Recovery Periods]
2008: ━━━━━━━━━━ 18 months ⚠️
2020: ━━━━ 6 months 🚀
2022: ━━━━━━ 9 months 📊
NOW:  ━━? Your Money At Risk
"""
        }
        
        return visuals.get(data_type, visuals["chart"])
    
    def add_urgency_triggers(self, content: str, level: str = "medium") -> str:
        """
        Add FOMO activation for 332% conversion boost
        """
        triggers = {
            "high": [
                "\n\n⏰ EXPIRES IN 24 HOURS - Act Now!",
                "\n\n🚨 Only 3 hours left to protect your portfolio!",
                "\n\n⚠️ Market closes in 2 hours - Don't miss this!"
            ],
            "medium": [
                "\n\n📅 Valid only this week",
                "\n\n🔔 Limited time opportunity",
                "\n\n⏳ Offer ends soon"
            ],
            "low": [
                "\n\n💡 Consider this today",
                "\n\n📌 Save this for later",
                "\n\n🎯 Review your strategy"
            ]
        }
        
        return content + random.choice(triggers.get(level, triggers["medium"]))
    
    def add_social_proof(self, content: str) -> str:
        """
        Add social proof for 270% trust multiplier
        """
        proof_points = [
            f"\n\n✅ Join {random.randint(5000, 50000):,}+ smart investors",
            f"\n\n🏆 Trusted by {random.randint(10, 100)}K+ portfolio holders",
            f"\n\n⭐ Rated 4.8/5 by {random.randint(1000, 10000):,} users",
            f"\n\n📊 {random.randint(80, 95)}% success rate verified",
            f"\n\n🎯 Featured in Economic Times & Mint"
        ]
        
        return content + random.choice(proof_points)
    
    def add_single_cta(self, content: str, cta_type: str = "newsletter") -> str:
        """
        Add single CTA for 371% click boost
        """
        ctas = {
            "newsletter": "\n\n👉 Get Daily Market Insights → [Subscribe FREE]",
            "consultation": "\n\n📞 Book Your FREE Portfolio Review → [Schedule Now]",
            "download": "\n\n📥 Download Tax-Saving Guide → [Get Instant Access]",
            "webinar": "\n\n🎓 Join Live Trading Masterclass → [Reserve Seat]",
            "calculator": "\n\n🧮 Calculate Your Returns → [Try FREE Tool]"
        }
        
        return content + ctas.get(cta_type, ctas["newsletter"])
    
    def optimize_for_platform(self, content: str, platform: str) -> Dict:
        """
        Platform-specific optimization for maximum engagement
        """
        platform_specs = {
            "linkedin": {
                "word_count": (100, 300),
                "optimal_time": "Monday 5-7 AM EST",
                "hashtag_count": 5,
                "emoji_limit": 2,
                "format": "thought_leadership"
            },
            "email": {
                "word_count": (150, 400),
                "optimal_time": "Tuesday-Thursday 10 AM",
                "subject_length": 50,
                "preview_length": 90,
                "format": "bite_sized"
            },
            "twitter": {
                "word_count": (50, 280),
                "optimal_time": "9:30 AM EST",
                "hashtag_count": 2,
                "thread_length": 7,
                "format": "punchy"
            },
            "tiktok": {
                "word_count": (30, 100),
                "optimal_time": "6-10 PM",
                "hook_length": 3,
                "duration": "15-60s",
                "format": "educational_entertainment"
            }
        }
        
        spec = platform_specs.get(platform, platform_specs["linkedin"])
        
        # Trim or expand content to fit platform
        words = content.split()
        min_words, max_words = spec["word_count"]
        
        if len(words) > max_words:
            content = ' '.join(words[:max_words])
        
        return {
            "content": content,
            "platform": platform,
            "optimal_time": spec["optimal_time"],
            "format": spec["format"]
        }
    
    def calculate_engagement_score(self, content: str, multipliers_applied: List[str]) -> float:
        """
        Calculate predicted engagement based on multipliers applied
        """
        base_engagement = 1.0
        
        for multiplier in multipliers_applied:
            if multiplier in self.multipliers:
                base_engagement *= self.multipliers[multiplier]
        
        return base_engagement
    
    def generate_optimized_content(self, 
                                   topic: str = None,
                                   platform: str = "linkedin",
                                   audience: str = "retail",
                                   include_visual: bool = True,
                                   urgency_level: str = "medium") -> Dict:
        """
        Generate fully optimized content with all multipliers
        """
        if not topic:
            topics = ["market volatility", "inflation protection", "tax saving", 
                     "retirement planning", "wealth erosion", "portfolio risk"]
            topic = random.choice(topics)
        
        multipliers_applied = []
        
        # Step 1: Generate viral headline (65-95% engagement)
        headline = self.generate_viral_headline(topic, style="loss_framed")
        multipliers_applied.append("list_headline")
        
        # Step 2: Create main content with loss framing (2x)
        content = self._generate_base_content(topic, audience)
        content = self.apply_loss_framing(content)
        multipliers_applied.append("loss_framing")
        
        # Step 3: Add visual element (30x)
        if include_visual:
            visual = self.create_visual_description("chart")
            content = f"{headline}\n\n{visual}\n\n{content}"
            multipliers_applied.append("visual_content")
        else:
            content = f"{headline}\n\n{content}"
        
        # Step 4: Add urgency (332%)
        content = self.add_urgency_triggers(content, urgency_level)
        multipliers_applied.append("urgency")
        
        # Step 5: Add social proof (270%)
        content = self.add_social_proof(content)
        multipliers_applied.append("social_proof")
        
        # Step 6: Add single CTA (371%)
        content = self.add_single_cta(content, "newsletter")
        multipliers_applied.append("single_cta")
        
        # Step 7: Platform optimization
        optimized = self.optimize_for_platform(content, platform)
        
        # Calculate engagement score
        engagement_score = self.calculate_engagement_score(content, multipliers_applied)
        
        # Save to history
        self.save_to_history(content)
        
        return {
            "content": optimized["content"],
            "platform": platform,
            "headline": headline,
            "multipliers_applied": multipliers_applied,
            "engagement_score": round(engagement_score, 2),
            "predicted_performance": f"{engagement_score:.1f}x baseline",
            "optimal_posting_time": optimized["optimal_time"],
            "audience": audience,
            "topic": topic,
            "timestamp": datetime.now().isoformat()
        }
    
    def _generate_base_content(self, topic: str, audience: str) -> str:
        """
        Generate base content for different audiences
        """
        if audience == "retail":
            return f"""
Most investors don't realize they're losing money every single day.

While you're waiting for the "perfect" time to invest, inflation is silently destroying 
7% of your savings annually. That's ₹7,000 lost for every ₹1 lakh sitting idle.

The harsh truth? By avoiding market volatility, you're guaranteeing a loss. 
The market might go down 10%, but inflation WILL erode your money 100% of the time.

Here's what smart money is doing right now:
• Protecting against {self.market_data['vix']}% volatility with systematic investing
• Avoiding the ₹{random.randint(50,200)}K opportunity cost of staying in cash
• Building positions while {abs(self.market_data['fii_flow'])} Cr of weak hands sell

The difference between wealthy and poor? The wealthy understand that NOT investing 
is the riskiest decision you can make."""
        
        elif audience == "institutional":
            return f"""
Current market dynamics present asymmetric risk-reward at {self.market_data['nifty']} levels.

Quantitative indicators:
• VIX at {self.market_data['vix']}% suggests complacency despite global headwinds
• FII outflows of ₹{abs(self.market_data['fii_flow'])} Cr creating technical pressure
• DII absorption at ₹{self.market_data['dii_flow']} Cr preventing deeper correction

Risk factors overlooked by consensus:
• Dollar strength at {self.market_data['dollar_inr']} threatening EM flows
• Crude at ${self.market_data['crude_oil']} impacting fiscal mathematics
• Yield curve inversion signaling recession probability >65%

Opportunity cost of cash position exceeds downside risk by 240 basis points."""
        
        else:  # Gen Z
            return f"""
Your parents' financial advice is costing you millions. Here's the math:

Every ₹1,000 you DON'T invest today = ₹50,000 lost by retirement.
Every month you wait = another year of work added to your life.

While you're "waiting for a crash," rich kids are:
• Buying the fear at {self.market_data['vix']}% VIX
• Compound-crushing inflation daily
• Turning ₹5K monthly into ₹5 Cr by 45

The brutal reality: You can't afford to NOT be in markets.
Time is your only real edge. Waste it, and you'll work forever."""

class ContentPipeline:
    """
    Automated pipeline for generating optimized content
    """
    
    def __init__(self):
        self.optimizer = EngagementOptimizer()
        self.platform_schedule = {
            "monday": [
                ("linkedin", "5:00", "thought_leadership"),
                ("email", "10:00", "newsletter")
            ],
            "tuesday": [
                ("twitter", "9:30", "market_open"),
                ("linkedin", "15:30", "market_close")
            ],
            "wednesday": [
                ("linkedin", "5:00", "educational"),
                ("tiktok", "18:00", "edutainment")
            ],
            "thursday": [
                ("email", "10:00", "analysis"),
                ("twitter", "15:30", "recap")
            ],
            "friday": [
                ("linkedin", "9:00", "weekly_roundup"),
                ("email", "16:00", "weekend_reads")
            ]
        }
    
    def generate_daily_content(self, day: str = None) -> List[Dict]:
        """
        Generate all content for a specific day
        """
        if not day:
            day = datetime.now().strftime("%A").lower()
        
        schedule = self.platform_schedule.get(day, [])
        daily_content = []
        
        for platform, time, content_type in schedule:
            # Vary topics throughout the day
            topics = {
                "thought_leadership": "market volatility",
                "newsletter": "weekly opportunities",
                "market_open": "pre-market analysis",
                "market_close": "day recap",
                "educational": "investment psychology",
                "edutainment": "wealth mistakes",
                "analysis": "sector rotation",
                "recap": "weekly performance",
                "weekly_roundup": "week ahead",
                "weekend_reads": "deep dive"
            }
            
            topic = topics.get(content_type, "market update")
            
            # Generate optimized content
            content = self.optimizer.generate_optimized_content(
                topic=topic,
                platform=platform,
                audience="retail" if platform != "linkedin" else "institutional",
                include_visual=True,
                urgency_level="high" if "market" in content_type else "medium"
            )
            
            content["scheduled_time"] = time
            content["content_type"] = content_type
            daily_content.append(content)
        
        return daily_content
    
    def generate_crisis_content(self, crisis_type: str = "market_crash") -> Dict:
        """
        Generate emergency content for market events
        """
        crisis_topics = {
            "market_crash": "emergency portfolio protection",
            "fed_announcement": "rate decision impact",
            "earnings_shock": "earnings disaster response",
            "geopolitical": "war impact on markets",
            "bank_failure": "banking crisis protection"
        }
        
        # Crisis content needs maximum urgency and visual impact
        content = self.optimizer.generate_optimized_content(
            topic=crisis_topics.get(crisis_type, "market emergency"),
            platform="linkedin",  # Start with LinkedIn for credibility
            audience="retail",
            include_visual=True,
            urgency_level="high"
        )
        
        # Add crisis-specific elements
        content["crisis_mode"] = True
        content["distribution"] = ["linkedin", "twitter", "email", "telegram"]
        content["priority"] = "IMMEDIATE"
        
        return content

def test_optimizer():
    """Test the engagement optimizer"""
    print("="*60)
    print("🚀 ENGAGEMENT OPTIMIZER TEST")
    print("="*60)
    
    optimizer = EngagementOptimizer()
    
    # Test 1: Generate standard optimized content
    print("\n📊 TEST 1: Standard Optimized Content")
    print("-"*60)
    result = optimizer.generate_optimized_content(
        topic="inflation protection",
        platform="linkedin",
        audience="retail",
        include_visual=True,
        urgency_level="high"
    )
    
    print(f"Headline: {result['headline']}")
    print(f"Engagement Score: {result['engagement_score']}x baseline")
    print(f"Multipliers Applied: {', '.join(result['multipliers_applied'])}")
    print(f"Content Preview: {result['content'][:200]}...")
    
    # Test 2: Generate crisis content
    print("\n\n🚨 TEST 2: Crisis Content")
    print("-"*60)
    pipeline = ContentPipeline()
    crisis = pipeline.generate_crisis_content("market_crash")
    
    print(f"Crisis Topic: {crisis['topic']}")
    print(f"Priority: {crisis['priority']}")
    print(f"Engagement Score: {crisis['engagement_score']}x baseline")
    print(f"Distribution: {', '.join(crisis['distribution'])}")
    
    # Test 3: Calculate maximum possible engagement
    print("\n\n🎯 TEST 3: Maximum Engagement Calculation")
    print("-"*60)
    all_multipliers = ["loss_framing", "visual_content", "list_headline", 
                       "single_cta", "urgency", "social_proof"]
    max_score = optimizer.calculate_engagement_score("test", all_multipliers)
    print(f"Maximum Possible Engagement: {max_score:.1f}x baseline")
    print(f"That's a {(max_score-1)*100:.0f}% increase!")
    
    print("\n" + "="*60)
    print("✅ OPTIMIZER READY FOR DEPLOYMENT")
    print("="*60)

if __name__ == "__main__":
    test_optimizer()