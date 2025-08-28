#!/usr/bin/env python3
"""
Intelligent Finance Content System
Smart content generation based on context and timing
"""

import random
import json
from datetime import datetime, time
from typing import Dict, List, Optional
import re

class IntelligentFinanceContent:
    def __init__(self):
        # Time-based content strategies
        self.content_by_time = {
            'morning': ['pre_market', 'global_cues', 'sgx_nifty', 'sector_watch', 'stock_focus'],
            'trading_hours': ['live_market', 'breakout_alert', 'volume_surge', 'sector_rotation', 'intraday_setup'],
            'closing': ['market_wrap', 'fii_dii_data', 'closing_thoughts', 'tomorrow_watch'],
            'evening': ['technical_analysis', 'earnings_preview', 'deep_analysis', 'portfolio_ideas'],
            'night': ['global_markets', 'commodity_update', 'long_term_view', 'educational']
        }
        
        # Diverse content templates (NO repetitive FII/DII in every post)
        self.diverse_templates = {
            'breakout_alert': [
                {
                    'title': "{stock} breaks out after {days} days of consolidation",
                    'content': """BREAKOUT ALERT 🚀

{stock} finally broke above {resistance} with {volume}% higher volumes.

Technical Picture:
• Breakout Level: {resistance}
• Next Target: {target1}, {target2}
• Stop Loss: {stoploss}

{catalyst_mention}

Trade Setup:
Entry: CMP or dips till {entry}
Targets: {target1}/{target2}
SL: {stoploss}

{risk_reward} Risk:Reward

Remember: Breakouts with volume are more reliable."""
                }
            ],
            
            'stock_story': [
                {
                    'title': "The {stock} turnaround story nobody's talking about",
                    'content': """{opening_hook}

The Numbers:
{metric1}
{metric2}
{metric3}

What Changed:
{catalyst1}
{catalyst2}

Street View:
{analyst_view}

Investment Angle:
{investment_thesis}

Risk: {key_risk}

{closing_question}"""
                }
            ],
            
            'sector_focus': [
                {
                    'title': "Why {sector} stocks are outperforming today",
                    'content': """{sector} index up {percent}% - leading the market rally.

Top Performers:
{stock1}: +{gain1}%
{stock2}: +{gain2}%
{stock3}: +{gain3}%

The Trigger:
{catalyst}

Technical View:
{sector} index near {level}
Next resistance: {target}
Support: {support}

Stocks to Watch:
{watchlist}

{outlook}"""
                }
            ],
            
            'option_opportunity': [
                {
                    'title': "Unusual options activity in {stock} - Big move coming?",
                    'content': """Options radar picking up unusual activity 📡

{stock} - Spot: {spot}

What we're seeing:
• {option_flow1}
• {option_flow2}
• IV spike to {iv}%

This suggests:
{interpretation}

Strategy for traders:
{strategy}
Max Profit: {max_profit}
Max Risk: {max_risk}

{caution}"""
                }
            ],
            
            'earnings_play': [
                {
                    'title': "{company} Q{quarter} today - Play it like this",
                    'content': """{company} reports after market today.

Street Expectations:
Revenue: ₹{revenue_est} Cr
EBITDA: {ebitda_margin}%
PAT: ₹{pat_est} Cr

Key Monitorables:
{key_metric1}
{key_metric2}

Options indicating: {implied_move}% move

Historical Moves:
Q1: {q1_move}%
Q2: {q2_move}%
Q3: {q3_move}%

The Play:
{trading_strategy}

{risk_note}"""
                }
            ],
            
            'market_sentiment': [
                {
                    'title': "Market breadth suggests {sentiment} - Here's why",
                    'content': """Reading between the lines 📊

Advance/Decline: {advance}/{decline}
{sentiment_indicator1}
{sentiment_indicator2}

What this means:
{interpretation}

Sectors showing strength:
{strong_sectors}

Sectors showing weakness:
{weak_sectors}

Strategy:
{strategy_suggestion}

{market_outlook}"""
                }
            ],
            
            'hidden_gem': [
                {
                    'title': "This {mcap} stock is quietly breaking records",
                    'content': """{attention_grabber}

{stock} - Industry: {industry}

The Story:
{story_point1}
{story_point2}
{story_point3}

Financials:
{financial_highlight1}
{financial_highlight2}

Why Now:
{catalyst}

Levels:
CMP: {cmp}
Target: {target}
Stop: {stoploss}

{disclaimer}"""
                }
            ],
            
            'global_impact': [
                {
                    'title': "{global_event} - Impact on Indian markets",
                    'content': """{global_event_description}

Immediate Impact:
{immediate_impact}

Sectors Affected:
Positive: {positive_sectors}
Negative: {negative_sectors}

Stocks in Focus:
{stock_impacts}

Strategic View:
{strategic_view}

Action Points:
{action1}
{action2}

{conclusion}"""
                }
            ],
            
            'technical_setup': [
                {
                    'title': "{pattern} forming in {index_or_stock} - {bias} setup",
                    'content': """Technical Alert 📈

{index_or_stock} forming {pattern} pattern.

Key Levels:
Current: {current}
Breakout: {breakout_level}
Target: {target}
Support: {support}

Indicators:
{indicator1}
{indicator2}
{indicator3}

Volume Analysis:
{volume_observation}

Trading Plan:
{entry_strategy}
{exit_strategy}

Probability: {probability}% based on historical patterns."""
                }
            ],
            
            'myth_buster': [
                {
                    'title': "The {topic} myth that's costing investors money",
                    'content': """{provocative_opening}

The Myth:
"{common_belief}"

The Reality:
{actual_fact}

Data Points:
{data1}
{data2}
{data3}

What Smart Money Does:
{smart_money_strategy}

How to Profit:
{actionable_strategy}

Bottom Line:
{conclusion}"""
                }
            ],
            
            'market_wrap': [
                {
                    'title': "Nifty {closes} at {level} - {emotion} end to the day",
                    'content': """Market Wrap:

Nifty: {nifty_close} ({nifty_change}%)
Sensex: {sensex_close} ({sensex_change}%)
Bank Nifty: {bank_nifty_close} ({bank_change}%)

{top_headline}

Winners:
{top_gainer1}: +{gain1}%
{top_gainer2}: +{gain2}%

Losers:
{top_loser1}: {loss1}%
{top_loser2}: {loss2}%

{key_event}

Tomorrow's Triggers:
{trigger1}
{trigger2}

{closing_thought}"""
                }
            ],
            
            'quick_insight': [
                {
                    'title': "{metric} at {value} - {interpretation}",
                    'content': """{metric} reading: {value}

What it means:
{explanation}

Historical Context:
{historical_comparison}

Impact:
{impact_analysis}

Action:
{suggested_action}

Watch: {watch_level}"""
                }
            ],
            
            'contrarian_call': [
                {
                    'title': "Going against the crowd on {topic}",
                    'content': """{bold_statement}

Market View: {consensus}
My View: {contrarian_view}

Why I'm Right:
{reason1}
{reason2}
{reason3}

The Trade:
{trade_setup}

Risk/Reward:
Risk: {risk}%
Reward: {reward}%

Time Frame: {timeframe}

{disclaimer}"""
                }
            ],
            
            'educational': [
                {
                    'title': "How to {skill} like a pro trader",
                    'content': """{educational_hook}

The Concept:
{concept_explanation}

Why It Matters:
{importance}

Step-by-Step:
1. {step1}
2. {step2}
3. {step3}

Real Example:
{example}

Common Mistakes:
{mistake1}
{mistake2}

Pro Tip:
{pro_tip}

Practice this with: {practice_suggestion}"""
                }
            ]
        }
        
        # Context-aware adjustments
        self.market_conditions = {
            'bullish': ['breakout_alert', 'hidden_gem', 'sector_focus', 'stock_story'],
            'bearish': ['contrarian_call', 'myth_buster', 'global_impact', 'educational'],
            'volatile': ['option_opportunity', 'technical_setup', 'quick_insight', 'market_sentiment'],
            'sideways': ['earnings_play', 'stock_story', 'educational', 'sector_focus']
        }
    
    def get_time_appropriate_content(self) -> str:
        """Get content type based on current time"""
        now = datetime.now().time()
        
        if time(6, 0) <= now < time(9, 15):
            return 'morning'
        elif time(9, 15) <= now < time(15, 30):
            return 'trading_hours'
        elif time(15, 30) <= now < time(17, 0):
            return 'closing'
        elif time(17, 0) <= now < time(21, 0):
            return 'evening'
        else:
            return 'night'
    
    def generate_smart_content(self, context: Dict = None) -> Dict:
        """Generate intelligent, varied content"""
        
        # Determine content type based on time and context
        time_slot = self.get_time_appropriate_content()
        
        # Smart content selection based on context
        if context and 'force_type' in context:
            content_type = context['force_type']
        else:
            # Pick appropriate content for time of day
            appropriate_types = self.content_by_time[time_slot]
            
            # Map to template categories
            type_mapping = {
                'pre_market': ['global_impact', 'quick_insight', 'sector_focus'],
                'live_market': ['breakout_alert', 'market_sentiment', 'technical_setup'],
                'market_wrap': ['market_wrap'],
                'fii_dii_data': ['market_wrap'],  # Only at closing, not every post!
                'technical_analysis': ['technical_setup', 'option_opportunity'],
                'earnings_preview': ['earnings_play'],
                'stock_focus': ['stock_story', 'hidden_gem'],
                'educational': ['educational', 'myth_buster']
            }
            
            # Get variety in content
            content_pool = []
            for atype in appropriate_types:
                if atype in type_mapping:
                    content_pool.extend(type_mapping[atype])
            
            if not content_pool:
                content_pool = list(self.diverse_templates.keys())
            
            content_type = random.choice(content_pool)
        
        # Get template
        templates = self.diverse_templates.get(content_type, self.diverse_templates['quick_insight'])
        template = random.choice(templates)
        
        # Generate realistic data
        data = self._generate_contextual_data(content_type, context)
        
        # Fill template
        title = template['title'].format(**data)
        content = template['content'].format(**data)
        
        return {
            'title': title,
            'content': content,
            'content_type': content_type,
            'time_appropriate': time_slot,
            'hashtags': self._generate_smart_hashtags(content_type, data),
            'visual_suggestion': self._suggest_visual(content_type, data)
        }
    
    def _generate_contextual_data(self, content_type: str, context: Dict = None) -> Dict:
        """Generate contextual, realistic data"""
        
        # Base data
        data = {
            # Stocks
            'stock': random.choice(['Reliance', 'TCS', 'HDFC Bank', 'Infosys', 'ICICI Bank', 'Kotak Bank', 'Axis Bank', 'Bharti Airtel', 'Asian Paints', 'Titan']),
            'company': random.choice(['L&T', 'Wipro', 'HCL Tech', 'Maruti', 'Bajaj Finance']),
            
            # Sectors
            'sector': random.choice(['Banking', 'IT', 'Pharma', 'Auto', 'FMCG', 'Metals', 'Realty', 'Energy', 'Chemicals']),
            
            # Market levels
            'level': random.choice(['24,700', '24,750', '24,800', '24,650']),
            'nifty_close': '24,712',
            'sensex_close': '80,845',
            'bank_nifty_close': '51,230',
            
            # Price movements
            'percent': round(random.uniform(0.5, 3.5), 1),
            'nifty_change': f"+{round(random.uniform(0.1, 1.5), 2)}",
            'sensex_change': f"+{round(random.uniform(0.1, 1.5), 2)}",
            'bank_change': f"+{round(random.uniform(0.2, 2.0), 2)}",
            
            # Technical levels
            'resistance': random.choice(['2,450', '3,200', '1,850', '4,500']),
            'support': random.choice(['2,380', '3,100', '1,780', '4,350']),
            'target1': random.choice(['2,500', '3,300', '1,900', '4,600']),
            'target2': random.choice(['2,550', '3,400', '1,950', '4,700']),
            'stoploss': random.choice(['2,350', '3,050', '1,750', '4,300']),
            
            # Options data
            'spot': random.choice(['24,700', '2,435', '3,150', '1,820']),
            'strike': random.choice(['24,700', '24,800', '24,600', '24,900']),
            'iv': random.randint(12, 35),
            'implied_move': round(random.uniform(1.5, 4.0), 1),
            
            # Volumes and breadth
            'volume': random.randint(20, 180),
            'advance': random.randint(25, 40),
            'decline': random.randint(10, 25),
            
            # Fundamentals
            'revenue_est': random.randint(5000, 25000),
            'ebitda_margin': random.randint(15, 35),
            'pat_est': random.randint(1000, 8000),
            'quarter': random.choice(['3', '4', '1', '2']),
            
            # Sentiment
            'sentiment': random.choice(['cautious optimism', 'selective buying', 'profit booking', 'accumulation']),
            'emotion': random.choice(['positive', 'cautious', 'mixed', 'optimistic']),
            'closes': random.choice(['higher', 'flat', 'lower', 'strong']),
            
            # Global
            'global_event': random.choice(['Fed minutes', 'China GDP', 'US inflation', 'ECB policy', 'Crude spike']),
            
            # Patterns
            'pattern': random.choice(['Cup & Handle', 'Flag', 'Triangle', 'Double Bottom', 'Inverse H&S']),
            'bias': random.choice(['Bullish', 'Bearish', 'Neutral']),
            
            # Time-based
            'days': random.randint(15, 90),
            'mcap': random.choice(['midcap', 'smallcap', 'largecap']),
            'industry': random.choice(['Chemicals', 'Textiles', 'Capital Goods', 'Consumer Durables', 'Healthcare']),
            
            # Educational content
            'skill': random.choice(['identify breakouts', 'read option chains', 'spot reversals', 'manage risk']),
            'concept_explanation': 'Understanding market psychology and price action',
            'importance': 'Helps identify high-probability trades',
            'step1': 'Identify the trend',
            'step2': 'Wait for confirmation',
            'step3': 'Execute with proper position size',
            'example': 'Recent Reliance breakout from 2,400 to 2,450',
            'mistake1': 'Entering too early',
            'mistake2': 'Ignoring stop losses',
            'pro_tip': 'Always wait for volume confirmation',
            'practice_suggestion': 'Paper trade for a week',
            'educational_hook': 'Most traders lose money because they skip this step',
            
            # Quick insights
            'metric': random.choice(['VIX', 'Put-Call Ratio', 'FII Activity', 'Advance-Decline']),
            'value': random.choice(['15.2', '1.35', '₹2,340 Cr', '25/25']),
            'interpretation': random.choice(['Bullish', 'Neutral', 'Cautious']),
            'explanation': 'Market sentiment indicator showing current mood',
            'historical_comparison': 'Below 3-month average',
            'impact_analysis': 'Suggests range-bound movement',
            'suggested_action': 'Wait for directional breakout',
            'watch_level': '24,750',
            
            # Stock story elements
            'metric1': 'Revenue up 25% YoY',
            'metric2': 'EBITDA margins expanded 300 bps',
            'metric3': 'Order book at all-time high',
            'catalyst1': 'New capacity coming online',
            'catalyst2': 'Export opportunity opening up',
            'analyst_view': 'Most brokerages have Buy rating',
            'investment_thesis': 'Multi-year growth story at reasonable valuations',
            'closing_question': 'Are you missing this opportunity?',
            
            # Sector elements
            'stock1': random.choice(['HDFC Bank', 'ICICI Bank', 'SBI', 'Kotak Bank']),
            'stock2': random.choice(['Axis Bank', 'IndusInd', 'IDFC First', 'Federal Bank']),
            'stock3': random.choice(['AU Bank', 'Bandhan Bank', 'RBL Bank', 'Yes Bank']),
            'gain1': round(random.uniform(2.0, 4.0), 1),
            'gain2': round(random.uniform(1.5, 3.5), 1),
            'gain3': round(random.uniform(1.0, 3.0), 1),
            'watchlist': 'HDFC Bank, ICICI Bank for fresh longs',
            'outlook': 'Sector momentum likely to continue',
            
            # Options elements
            'option_flow1': 'Heavy Call buying at 24,800 strike',
            'option_flow2': 'Put writing increasing at 24,600',
            'strategy': 'Bull Call Spread 24,700-24,900',
            'max_profit': '₹15,000 per lot',
            'max_risk': '₹5,000 per lot',
            'caution': 'Exit if spot falls below 24,650',
            
            # Global elements
            'global_event_description': 'US Fed minutes released overnight',
            'immediate_impact': 'IT stocks under pressure, Banks supportive',
            'positive_sectors': 'Banking, Auto, Capital Goods',
            'negative_sectors': 'IT, Pharma exports',
            'stock_impacts': 'TCS -1.5%, Infosys -1.2%, HDFC Bank +0.8%',
            'strategic_view': 'Domestic plays over export-oriented stocks',
            'action1': 'Book profits in IT',
            'action2': 'Accumulate domestic consumption stories',
            'conclusion': 'Stay selective, avoid knee-jerk reactions',
            
            # Technical elements
            'index_or_stock': random.choice(['Nifty', 'Bank Nifty', 'Reliance', 'TCS']),
            'current': '24,712',
            'breakout_level': '24,750',
            'target': '24,900',
            'entry_strategy': 'Buy on dips to 24,680-24,700',
            'exit_strategy': 'Book 50% at target, trail the rest',
            'probability': random.randint(65, 80),
            'indicator1': 'RSI turning up from 45',
            'indicator2': 'MACD positive crossover',
            'indicator3': '20 DMA acting as support',
            'volume_observation': 'Volumes picking up on upmoves',
            
            # Myth buster elements
            'topic': random.choice(['P/E ratios', 'Stop losses', 'Buy and hold', 'Technical analysis']),
            'provocative_opening': 'What 90% of retail investors get wrong',
            'common_belief': 'Low P/E stocks are always cheap',
            'actual_fact': 'P/E needs context - growth rate, sector, and cycle matter',
            'data1': 'High P/E stocks outperformed in last 5 years',
            'data2': 'Quality commands premium valuation',
            'data3': 'Sector P/E ranges vary widely',
            'smart_money_strategy': 'Focus on PEG ratio, not just P/E',
            'actionable_strategy': 'Buy quality growth at reasonable valuations',
            
            # Contrarian elements
            'bold_statement': 'When everyone zigs, I zag',
            'consensus': 'IT stocks are dead money',
            'contrarian_view': 'Best accumulation opportunity in 2 years',
            'reason1': 'Valuations at 5-year lows',
            'reason2': 'Dollar revenue growth resuming',
            'reason3': 'AI opportunity not priced in',
            'trade_setup': 'Accumulate TCS, Infosys, HCL Tech',
            'risk': '10',
            'reward': '35',
            'timeframe': '6-12 months',
            
            # Earnings elements
            'q1_move': '+3.2',
            'q2_move': '-1.5',
            'q3_move': '+2.8',
            'trading_strategy': 'Straddle if IV under 25%, else stay away',
            'risk_note': 'Earnings are binary events - size accordingly',
            
            # Market wrap elements
            'top_headline': 'Markets shrug off global weakness',
            'key_event': "Tomorrow's RBI policy in focus",
            'trigger1': 'RBI Policy decision',
            'trigger2': 'US CPI data tonight',
            
            # Content fillers
            'opening_hook': random.choice([
                "While everyone's watching the usual suspects",
                "Quietly outperforming the index",
                "The Street missed this completely"
            ]),
            'catalyst': random.choice([
                "New order wins worth ₹500 Cr",
                "Capacity expansion coming online",
                "Management guidance upgrade",
                "Sector tailwinds strengthening"
            ]),
            'key_risk': random.choice([
                "Raw material cost inflation",
                "Regulatory changes pending",
                "High valuations",
                "Global headwinds"
            ]),
            'closing_thought': random.choice([
                "Trade with proper risk management",
                "Tomorrow's GDP data crucial",
                "Watch global cues tonight",
                "Earnings season picks up pace"
            ]),
            'disclaimer': "Do your own research before investing",
            
            # More dynamic content
            'top_gainer1': random.choice(['Adani Ports', 'Tata Motors', 'JSW Steel', 'Grasim']),
            'top_gainer2': random.choice(['Coal India', 'ONGC', 'Power Grid', 'BPCL']),
            'gain1': round(random.uniform(2.0, 5.0), 1),
            'gain2': round(random.uniform(1.5, 4.0), 1),
            'top_loser1': random.choice(['Tech Mahindra', 'Nestle', 'HUL', 'Dr Reddy']),
            'top_loser2': random.choice(['Cipla', 'Eicher Motors', 'M&M', 'Hero Moto']),
            'loss1': f"-{round(random.uniform(1.0, 3.0), 1)}",
            'loss2': f"-{round(random.uniform(0.5, 2.5), 1)}"
        }
        
        # Override with context
        if context:
            data.update(context)
        
        return data
    
    def _generate_smart_hashtags(self, content_type: str, data: Dict) -> List[str]:
        """Generate contextual hashtags"""
        base = ['#StockMarket', '#Trading']
        
        type_specific = {
            'breakout_alert': ['#Breakout', '#TechnicalAnalysis'],
            'stock_story': [f"#{data.get('stock', 'Stocks').replace(' ', '')}", '#Investment'],
            'sector_focus': [f"#{data.get('sector', 'Sector')}Stocks", '#SectorAnalysis'],
            'option_opportunity': ['#OptionsTrading', '#Derivatives'],
            'earnings_play': ['#EarningsSeason', '#Results'],
            'market_wrap': ['#MarketWrap', '#Nifty'],
            'technical_setup': ['#ChartPatterns', '#TechnicalAnalysis'],
            'global_impact': ['#GlobalMarkets', '#MacroEconomics']
        }
        
        return base + type_specific.get(content_type, ['#MarketUpdate'])
    
    def _suggest_visual(self, content_type: str, data: Dict) -> Dict:
        """Suggest appropriate visual style"""
        visual_suggestions = {
            'breakout_alert': {
                'type': 'chart_with_arrow',
                'highlight': data.get('resistance', ''),
                'color': 'green'
            },
            'market_wrap': {
                'type': 'index_summary',
                'primary': data.get('nifty_close', ''),
                'color': 'blue'
            },
            'stock_story': {
                'type': 'stock_card',
                'stock': data.get('stock', ''),
                'color': 'purple'
            },
            'option_opportunity': {
                'type': 'option_chain',
                'strike': data.get('strike', ''),
                'color': 'orange'
            },
            'sector_focus': {
                'type': 'sector_heatmap',
                'sector': data.get('sector', ''),
                'color': 'mixed'
            }
        }
        
        return visual_suggestions.get(content_type, {
            'type': 'clean_text',
            'color': 'minimal'
        })


# Test the system
if __name__ == "__main__":
    creator = IntelligentFinanceContent()
    
    # Generate different types of content
    print("=== Morning Content ===")
    morning_content = creator.generate_smart_content({'force_type': 'sector_focus'})
    print(f"Title: {morning_content['title']}")
    print(f"Type: {morning_content['content_type']}")
    print(f"Time Slot: {morning_content['time_appropriate']}\n")
    
    print("=== Market Hours Content ===")
    market_content = creator.generate_smart_content({'force_type': 'breakout_alert'})
    print(f"Title: {market_content['title']}")
    print(f"Content:\n{market_content['content'][:300]}...\n")
    
    print("=== Educational Content ===")
    edu_content = creator.generate_smart_content({'force_type': 'educational'})
    print(f"Title: {edu_content['title']}")
    print(f"Hashtags: {edu_content['hashtags']}")