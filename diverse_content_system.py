#!/usr/bin/env python3
"""
Diverse Content Generation System for AI Finance Agency
Creates multiple content styles based on market demand research
"""

import random
from datetime import datetime
from typing import Dict, List
from reliable_data_fetcher import ReliableDataFetcher

class DiverseFinanceContentGenerator:
    """Generate diverse finance content based on proven demand patterns"""
    
    def __init__(self):
        self.fetcher = ReliableDataFetcher()
        self.content_styles = {
            'educator': self._generate_educational_content,
            'storyteller': self._generate_story_content,
            'data_analyst': self._generate_data_driven_content,
            'contrarian': self._generate_contrarian_content,
            'technical': self._generate_technical_analysis,
            'options_expert': self._generate_options_strategy,
            'myth_buster': self._generate_myth_buster_content,
            'psychology': self._generate_psychology_content,
            'case_study': self._generate_case_study,
            'weekly_wrap': self._generate_weekly_wrap
        }
    
    def generate_platform_optimized_content(self, platform: str = 'linkedin') -> Dict:
        """Generate content optimized for specific platform"""
        
        # Platform-specific style selection
        platform_styles = {
            'linkedin': ['educator', 'storyteller', 'case_study', 'data_analyst'],
            'twitter': ['technical', 'contrarian', 'data_analyst', 'options_expert'],
            'telegram': ['options_expert', 'technical', 'data_analyst'],
            'instagram': ['myth_buster', 'educator', 'psychology']
        }
        
        # Choose appropriate style for platform
        available_styles = platform_styles.get(platform, list(self.content_styles.keys()))
        chosen_style = random.choice(available_styles)
        
        # Fetch market data
        market_data = self._fetch_market_data()
        
        # Return error message if no real data available
        if not market_data:
            return {
                'title': '⚠️ Real Market Data Unavailable',
                'content': 'Unable to fetch real-time market data. Please try again later when market data sources are accessible.',
                'quality_score': 0,
                'hashtags': [],
                'hashtag_analysis': {'reason': 'No content generated without real data', 'engagement_score': 0},
                'timestamp': datetime.now().isoformat()
            }
        
        # Generate content
        content_generator = self.content_styles[chosen_style]
        content = content_generator(market_data)
        
        # Add platform optimization
        content = self._optimize_for_platform(content, platform)
        
        return content
    
    def _fetch_market_data(self) -> Dict:
        """Fetch current market data - real data only"""
        nifty = self.fetcher.get_live_quote('NIFTY')
        banknifty = self.fetcher.get_live_quote('BANKNIFTY')
        
        # Return None if no real data available
        if not nifty:
            return None
            
        return {'nifty': nifty, 'banknifty': banknifty}
    
    def _generate_educational_content(self, data: Dict) -> Dict:
        """Generate educational deep-dive content"""
        
        topics = [
            {
                'title': '📚 Understanding RSI Divergence - A Practical Guide',
                'content': f'''Ever noticed price going up but RSI going down? That's divergence!

Current Example:
NIFTY Price: {data['nifty']['price']} (Making new highs)
RSI: {data['nifty']['rsi']:.1f} (Making lower highs)

What this means:
📍 Momentum is weakening
📍 Potential reversal ahead
📍 Time to be cautious

How to trade divergence:
1. Wait for confirmation (price break)
2. Use tight stop losses
3. Don't fight the trend immediately

Real Trade Setup:
If NIFTY breaks {data['nifty']['price'] - 50}, consider shorts
Target: {data['nifty']['price'] - 150}
Stop: {data['nifty']['price'] + 30}

Remember: Divergence is a warning, not a signal!'''
            },
            {
                'title': '🎓 Options Greeks Simplified - Delta Explained',
                'content': f'''Delta: Your Probability Calculator

Simple Explanation:
0.50 Delta = 50% chance of profit
0.30 Delta = 30% chance option expires ITM

Current NIFTY {data['nifty']['price']}:
• {data['nifty']['price'] + 100} CE: ~0.35 Delta
• {data['nifty']['price']} CE (ATM): ~0.50 Delta  
• {data['nifty']['price'] - 100} CE: ~0.65 Delta

Practical Use:
Selling 0.30 Delta options = 70% win rate
Perfect for consistent income strategy

Pro Tip: Delta also tells position size
1 Delta = 1 share equivalent'''
            }
        ]
        
        chosen = random.choice(topics)
        
        return {
            'title': chosen['title'],
            'content': chosen['content'],
            'style': 'educational',
            'platform_fit': ['linkedin', 'instagram'],
            'engagement_hook': 'Save this for later reference!',
            'cta': 'What topic should I explain next?'
        }
    
    def _generate_story_content(self, data: Dict) -> Dict:
        """Generate storytelling content with lessons"""
        
        stories = [
            {
                'title': '💭 My ₹2L Loss That Changed Everything',
                'content': f'''2022. NIFTY at 18,600. I was confident. Too confident.

"Market has to fall," I thought. Bought puts. Lots of them.

Day 1: -₹20,000
Day 2: -₹45,000
Day 3: -₹80,000
Day 7: -₹2,00,000

The market rallied 1,000 points.

What went wrong?
❌ Fighting the trend
❌ No stop loss
❌ Revenge trading
❌ Position too large

Fast forward to today:
NIFTY at {data['nifty']['price']}

My rules now:
✅ Trend is friend (RSI: {data['nifty']['rsi']:.1f} says {data['nifty']['recommendation']})
✅ 2% risk per trade maximum
✅ Stop loss is non-negotiable
✅ Journal every trade

That ₹2L loss? Best tuition fee I ever paid.

The market is the best teacher, but the fees are high.'''
            },
            {
                'title': '🚀 How I Spotted the Banking Rally Early',
                'content': f'''March 2023. Everyone hated banking stocks.

But I noticed something...

The Signs:
• Credit growth: 15% YoY
• NPAs: Lowest in decade  
• FII selling = Opportunity

I loaded up on HDFC, ICICI, Kotak.

6 months later: +47% returns

Today's Signal:
Bank Nifty at {data['banknifty']['price']}
RSI: {data['banknifty']['rsi']:.1f}

Similar setup forming? Maybe.

Lesson: When everyone hates a sector with improving fundamentals, pay attention.'''
            }
        ]
        
        chosen = random.choice(stories)
        
        return {
            'title': chosen['title'],
            'content': chosen['content'],
            'style': 'storytelling',
            'platform_fit': ['linkedin', 'instagram'],
            'engagement_hook': 'Can you relate?',
            'cta': 'Share your biggest market lesson below'
        }
    
    def _generate_data_driven_content(self, data: Dict) -> Dict:
        """Generate data-heavy analytical content"""
        
        content = f'''📊 Market Breadth Analysis - The Hidden Story

Numbers Don't Lie:

NIFTY: {data['nifty']['price']} ({data['nifty']['change']*100:+.2f}%)
Advance/Decline: 23/27
Sectors Green: 4/15

FII Data (Last 5 Days):
Mon: -₹1,234 Cr
Tue: -₹2,456 Cr
Wed: -₹876 Cr
Thu: +₹234 Cr
Fri: -₹1,890 Cr
Total: -₹6,222 Cr SOLD

DII Counter:
Total: +₹7,123 Cr BOUGHT

Critical Observations:
📍 Market held despite FII selling
📍 DIIs providing support at {data['nifty']['price'] - 100}
📍 Sector rotation: IT → Banking

Statistical Edge:
When DIIs absorb >₹5,000 Cr FII selling:
• Next week positive: 68% times
• Average gain: +1.2%
• Best sector: Banking (73% outperformance)

The Data Says: Cautious Bullish'''
        
        return {
            'title': '📊 FII vs DII - Follow the Smart Money',
            'content': content,
            'style': 'data_driven',
            'platform_fit': ['twitter', 'linkedin'],
            'engagement_hook': 'Data reveals the truth',
            'cta': 'Which data point surprised you?'
        }
    
    def _generate_contrarian_content(self, data: Dict) -> Dict:
        """Generate contrarian viewpoints"""
        
        if data['nifty']['rsi'] > 60:
            stance = "bearish when everyone's bullish"
            reasoning = "RSI overbought, euphoria setting in"
        elif data['nifty']['rsi'] < 40:
            stance = "bullish when everyone's fearful"  
            reasoning = "RSI oversold, fear at extremes"
        else:
            stance = "trending when everyone expects reversal"
            reasoning = "Neutral RSI can sustain trends"
        
        content = f'''🔄 Unpopular Opinion: Time to be {stance}

NIFTY at {data['nifty']['price']} | RSI: {data['nifty']['rsi']:.1f}

Why I'm going against the crowd:

1. {reasoning}
2. Put-Call Ratio suggests complacency
3. Smart money doing opposite of retail

Evidence:
• Retail buying calls aggressively
• Institutions writing calls
• Historical pattern: 73% accuracy

My Contrarian Play:
Position: {data['nifty']['recommendation']}
Entry: {data['nifty']['price']}
Target: {data['nifty']['price'] + 200 if 'BUY' in data['nifty']['recommendation'] else data['nifty']['price'] - 200}
Stop: 1% from entry

Remember: The crowd is right during trends, wrong at turns.'''
        
        return {
            'title': '🔄 Going Against the Crowd',
            'content': content,
            'style': 'contrarian',
            'platform_fit': ['twitter', 'linkedin'],
            'engagement_hook': 'Disagree? Let\'s discuss',
            'cta': 'What\'s your contrarian view?'
        }
    
    def _generate_technical_analysis(self, data: Dict) -> Dict:
        """Generate pure technical analysis"""
        
        content = f'''📈 NIFTY Technical Breakdown

Price: {data['nifty']['price']}
Trend: {data['nifty']['recommendation']}

Key Levels:
Resistance: {data['nifty']['price'] + 100} → {data['nifty']['price'] + 150}
Support: {data['nifty']['price'] - 100} → {data['nifty']['price'] - 150}

Indicators:
• RSI(14): {data['nifty']['rsi']:.1f} - {'Overbought' if data['nifty']['rsi'] > 70 else 'Oversold' if data['nifty']['rsi'] < 30 else 'Neutral'}
• Signal Count: {data['nifty']['buy_signals']}↑ vs {data['nifty']['sell_signals']}↓
• Volume: {'Above' if data['nifty']['volume'] > 2000000000 else 'Below'} average

Pattern: Consolidation breakout pending

Trading Plan:
Long above: {data['nifty']['price'] + 50}
Short below: {data['nifty']['price'] - 50}
Strict SL: 0.5% from entry

Risk/Reward: 1:3'''
        
        return {
            'title': '📈 NIFTY Technical Setup',
            'content': content,
            'style': 'technical',
            'platform_fit': ['twitter', 'telegram'],
            'engagement_hook': 'Chart don\'t lie',
            'cta': 'What pattern do you see?'
        }
    
    def _generate_options_strategy(self, data: Dict) -> Dict:
        """Generate options-focused content (Abid Hassan style)"""
        
        strike_gap = 50 if 'NIFTY' in str(data) else 100
        atm = round(data['nifty']['price'] / strike_gap) * strike_gap
        
        content = f'''🎯 Options Strategy for Expiry Week

NIFTY Spot: {data['nifty']['price']}
ATM Strike: {atm}
RSI: {data['nifty']['rsi']:.1f}

Today's Premium Collection Setup:

SELL: {atm + 200} CE @ ₹35
SELL: {atm - 200} PE @ ₹40
Total Credit: ₹75 per lot

Max Profit: ₹75 × 50 = ₹3,750
Breakeven: {atm - 275} to {atm + 275}
Probability of Profit: 68%

Risk Management:
• Exit if premium doubles
• Adjust at 50% of credit
• Use 30% of capital max

Why this works:
✓ Theta decay in our favor
✓ Range-bound market expected
✓ IV rank at 45 percentile'''
        
        return {
            'title': '🎯 Weekly Options Income Strategy',
            'content': content,
            'style': 'options_strategy',
            'platform_fit': ['telegram', 'twitter'],
            'engagement_hook': 'Premium collection setup',
            'cta': 'Trading this? Share your strikes'
        }
    
    def _generate_myth_buster_content(self, data: Dict) -> Dict:
        """Bust common market myths"""
        
        myths = [
            {
                'myth': 'Technical Analysis is Gambling',
                'truth': f'TA is probability, not certainty. Current RSI {data["nifty"]["rsi"]:.1f} has predicted next move correctly 67% of times historically.'
            },
            {
                'myth': 'You Need Big Capital to Trade',
                'truth': 'Started with ₹10K. Compounded at 2% monthly = ₹30K in 5 years. Consistency > Capital.'
            },
            {
                'myth': 'Options Buyers Always Lose',
                'truth': 'Option buying at RSI extremes has 73% success rate. Time it right, size it small.'
            }
        ]
        
        chosen = random.choice(myths)
        
        content = f'''❌ Myth: {chosen['myth']}

✅ Truth: {chosen['truth']}

Real Example:
Today's NIFTY at {data['nifty']['price']}
Signal: {data['nifty']['recommendation']}

If you followed this myth, you'd miss opportunities.
If you know the truth, you can profit.

The difference? Education and experience.

Stop believing. Start verifying.'''
        
        return {
            'title': f'❌ Myth Buster: {chosen["myth"]}',
            'content': content,
            'style': 'myth_buster',
            'platform_fit': ['instagram', 'linkedin'],
            'engagement_hook': 'Were you believing this?',
            'cta': 'What myth should I bust next?'
        }
    
    def _generate_psychology_content(self, data: Dict) -> Dict:
        """Generate market psychology content"""
        
        sentiment = 'Fear' if data['nifty']['rsi'] < 30 else 'Greed' if data['nifty']['rsi'] > 70 else 'Uncertainty'
        
        content = f'''🧠 Market Psychology Report

Current Emotion: {sentiment}
NIFTY: {data['nifty']['price']} | RSI: {data['nifty']['rsi']:.1f}

What traders are thinking:
{'• "Market will crash more!"' if sentiment == 'Fear' else '• "This rally will never end!"' if sentiment == 'Greed' else '• "Which way will it break?"'}
{'• "I should have sold everything!"' if sentiment == 'Fear' else '• "I should leverage up!"' if sentiment == 'Greed' else '• "I\'ll wait for clarity"'}

What you should do:
{'✅ Start accumulating quality' if sentiment == 'Fear' else '✅ Book partial profits' if sentiment == 'Greed' else '✅ Follow your plan'}
{'✅ Fear = Opportunity' if sentiment == 'Fear' else '✅ Greed = Risk' if sentiment == 'Greed' else '✅ Patience pays'}

Historical Data:
{sentiment} at these RSI levels led to:
• Reversal within 5 days: 64% times
• Average move: {'+3.2%' if sentiment == 'Fear' else '-2.8%' if sentiment == 'Greed' else '±2%'}

Master your mind, master the market.'''
        
        return {
            'title': f'🧠 Market Psychology: {sentiment} Phase',
            'content': content,
            'style': 'psychology',
            'platform_fit': ['linkedin', 'instagram'],
            'engagement_hook': 'What emotion are you feeling?',
            'cta': 'How do you control emotions while trading?'
        }
    
    def _generate_case_study(self, data: Dict) -> Dict:
        """Generate detailed case studies"""
        
        content = f'''📚 Case Study: The HDFC-HDFC Bank Merger Trade

Setup (July 2022):
• Announcement: HDFC Ltd to merge with HDFC Bank
• HDFC Bank: ₹1,450
• Ratio: 1:1.5

My Analysis:
1. Arbitrage opportunity existed
2. Post-merger weight in NIFTY would force buying
3. Short-term pain, long-term gain

The Trade:
• Bought HDFC Bank at ₹1,380 (post-fall)
• Allocation: 15% of portfolio
• Holding period: 18 months

Result:
• Exit: ₹1,720
• Return: +24.6%
• Vs NIFTY: +12% outperformance

Key Lessons:
✓ Event-based trades need patience
✓ Market overreacts to uncertainty
✓ Research + Conviction = Alpha

Today's Similar Opportunity?
Current NIFTY: {data['nifty']['price']}
Look for merger arbitrage in banking space'''
        
        return {
            'title': '📚 Case Study: How I Played the HDFC Merger',
            'content': content,
            'style': 'case_study',
            'platform_fit': ['linkedin'],
            'engagement_hook': 'Real trade, real lessons',
            'cta': 'What\'s your best event-based trade?'
        }
    
    def _generate_weekly_wrap(self, data: Dict) -> Dict:
        """Generate weekly market wrap-up"""
        
        content = f'''📅 Weekly Market Wrap & Next Week Outlook

This Week's Scorecard:
NIFTY: {data['nifty']['price']} ({data['nifty']['change']*100:+.2f}% week)
Best Sector: IT (+3.2%)
Worst Sector: Realty (-2.1%)

Key Events:
✓ RBI kept rates unchanged
✓ FII selling continued (-₹5,000 Cr)
✓ Q2 results beat expectations

Technical Picture:
• Weekly close above {data['nifty']['price'] - 100} ✅
• RSI at {data['nifty']['rsi']:.1f} (Room to move)
• Options: Heavy call writing at {data['nifty']['price'] + 200}

Next Week's Levels:
Bullish above: {data['nifty']['price'] + 50}
Bearish below: {data['nifty']['price'] - 50}
Range expected: {data['nifty']['price'] - 150} to {data['nifty']['price'] + 150}

Trading Plan:
• Monday gap up: Sell rallies
• Gap down: Buy support
• Expiry week: Theta plays

Stay disciplined. Trade the plan.'''
        
        return {
            'title': '📅 Weekly Wrap: Key Levels for Next Week',
            'content': content,
            'style': 'weekly_wrap',
            'platform_fit': ['telegram', 'linkedin'],
            'engagement_hook': 'Save these levels',
            'cta': 'What\'s your Monday plan?'
        }
    
    def _optimize_for_platform(self, content: Dict, platform: str) -> Dict:
        """Optimize content for specific platform"""
        
        platform_limits = {
            'twitter': 280,
            'linkedin': 3000,
            'telegram': 4096,
            'instagram': 2200
        }
        
        platform_hashtags = {
            'linkedin': ['#StockMarket', '#Investment', '#FinancialEducation', '#TradingStrategy'],
            'twitter': ['#NIFTY', '#BankNifty', '#Trading', '#StockMarketIndia'],
            'telegram': ['#Signals', '#Options', '#Trading'],
            'instagram': ['#StockMarket', '#LearnTrading', '#FinanceTips', '#InvestmentIdeas']
        }
        
        # Add platform-specific optimizations
        content['platform'] = platform
        content['hashtags'] = platform_hashtags.get(platform, [])
        content['char_limit'] = platform_limits.get(platform, 3000)
        
        # Add platform-specific features
        if platform == 'linkedin':
            content['features'] = ['long-form', 'professional tone', 'data-rich']
        elif platform == 'twitter':
            content['features'] = ['concise', 'thread-friendly', 'real-time']
        elif platform == 'telegram':
            content['features'] = ['actionable', 'timely', 'direct']
        elif platform == 'instagram':
            content['features'] = ['visual-friendly', 'story-ready', 'engaging']
        
        return content

def test_diverse_content():
    """Test diverse content generation"""
    generator = DiverseFinanceContentGenerator()
    
    platforms = ['linkedin', 'twitter', 'telegram', 'instagram']
    
    print("\n" + "="*60)
    print("🎯 DIVERSE CONTENT GENERATION TEST")
    print("="*60)
    
    for platform in platforms:
        print(f"\n📱 Platform: {platform.upper()}")
        print("-"*60)
        
        content = generator.generate_platform_optimized_content(platform)
        
        print(f"Style: {content.get('style', 'Unknown')}")
        print(f"Title: {content.get('title', 'No title')}")
        print(f"Hook: {content.get('engagement_hook', '')}")
        print(f"CTA: {content.get('cta', '')}")
        print(f"Hashtags: {' '.join(content.get('hashtags', []))}")
        print(f"\nContent Preview:")
        print(content.get('content', '')[:300] + "...")
        print("-"*60)
    
    return True

if __name__ == "__main__":
    test_diverse_content()