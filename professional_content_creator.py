#!/usr/bin/env python3
"""
Professional Finance Content Creator
Lead Content Creator Module - Enterprise Grade
"""

import random
import json
from datetime import datetime
from typing import Dict, List, Optional
import re

class ProfessionalFinanceCreator:
    def __init__(self):
        # Professional templates that actually work on LinkedIn
        self.market_templates = {
            "fii_dii_flow": [
                {
                    "title": "FII pulled out ₹{fii_outflow} Cr while DIIs pumped ₹{dii_inflow} Cr today",
                    "content": """Market Dynamics Update:

📊 FII Activity: Net {fii_direction} of ₹{fii_outflow} Cr
📈 DII Counter: Net {dii_direction} of ₹{dii_inflow} Cr
🎯 Net Impact: {net_impact}

Sector Rotation Observed:
{sector_1}: FIIs {fii_action_1}, DIIs {dii_action_1}
{sector_2}: FIIs {fii_action_2}, DIIs {dii_action_2}

Key Takeaway: {key_insight}

The smart money divergence suggests {market_outlook}."""
                },
                {
                    "title": "Domestic institutions saved the day with ₹{dii_inflow} Cr buying",
                    "content": """While global funds turned cautious, Indian institutions stepped up.

Today's Flow Analysis:
• FII: -{fii_outflow} Cr (Risk-off mode)
• DII: +{dii_inflow} Cr (Buying the dip)
• Market: {market_movement}

Where DIIs deployed capital:
1. {sector_1}: Heavy accumulation
2. {sector_2}: Selective buying
3. {sector_3}: Profit booking

{key_insight}

This divergence typically leads to {outcome_prediction}."""
                }
            ],
            
            "nifty_analysis": [
                {
                    "title": "Nifty at {level}: Here's what the charts are telling us",
                    "content": """Technical Setup:

Current: {level}
Support: {support_1} | {support_2}
Resistance: {resistance_1} | {resistance_2}

Today's Action:
• Opened at {open_price}, tested {high_price}
• {volume_analysis}
• {breadth_analysis}

Critical Observations:
{observation_1}
{observation_2}

Trading Strategy:
Long above {long_level} for {target_1}
Short below {short_level} for {target_2}

{risk_warning}"""
                },
                {
                    "title": "{index} closed {change}% - {emotion} day for {investor_type}",
                    "content": """{dramatic_opening}

Numbers that matter:
• Index: {current_level} ({change}%)
• Advance/Decline: {advance}/{decline}
• Volume: {volume_comparison}

{sector_performance}

What worked: {winners}
What didn't: {losers}

Tomorrow's Levels:
Buy above: {buy_level}
Sell below: {sell_level}

{closing_thought}"""
                }
            ],
            
            "breaking_insight": [
                {
                    "title": "{company} just {action}. Here's what it means for investors",
                    "content": """{news_summary}

Quick Analysis:
• Impact: {immediate_impact}
• Sector Effect: {sector_impact}
• Competition: {competitive_angle}

Numbers to Consider:
{metric_1}: {value_1} ({comparison_1})
{metric_2}: {value_2} ({comparison_2})

Investment Angle:
{investment_thesis}

Risk Factors:
{risk_1}
{risk_2}

{actionable_advice}"""
                }
            ],
            
            "options_strategy": [
                {
                    "title": "Options data suggesting {direction} move in {underlying}",
                    "content": """Decoding Options Chain:

{underlying} Spot: {spot_price}
PCR: {pcr_value} ({pcr_interpretation})

Max Pain: {max_pain}
Put OI: Highest at {put_strike}
Call OI: Highest at {call_strike}

Today's Unusual Activity:
{unusual_activity_1}
{unusual_activity_2}

Suggested Strategy:
{strategy_name}
• Buy: {buy_leg}
• Sell: {sell_leg}
• Max Profit: {max_profit}
• Max Risk: {max_risk}

{trade_management}"""
                }
            ],
            
            "earnings_preview": [
                {
                    "title": "{company} earnings tomorrow: {expectation}",
                    "content": """Pre-Earnings Analysis:

Estimates:
• Revenue: ₹{revenue_est} Cr ({yoy_growth}% YoY)
• EBITDA: ₹{ebitda_est} Cr
• PAT: ₹{pat_est} Cr

What to Watch:
1. {key_metric_1}: {importance_1}
2. {key_metric_2}: {importance_2}
3. Management Commentary on {topic}

Options Implying: {implied_move}% move

Historical Earnings Moves:
Last 4 Qtrs: {historical_moves}

Trade Setup:
Above {upper_level}: Target {target_up}
Below {lower_level}: Target {target_down}

{risk_disclaimer}"""
                }
            ],
            
            "sector_rotation": [
                {
                    "title": "Money rotating from {exit_sector} to {entry_sector}",
                    "content": """Smart money movement detected.

Exodus from {exit_sector}:
• {exit_stock_1}: -₹{exit_value_1} Cr
• {exit_stock_2}: -₹{exit_value_2} Cr
• Reason: {exit_reason}

Flowing into {entry_sector}:
• {entry_stock_1}: +₹{entry_value_1} Cr
• {entry_stock_2}: +₹{entry_value_2} Cr
• Catalyst: {entry_catalyst}

This rotation suggests:
{market_implication}

Actionable Trades:
Long: {long_ideas}
Short: {short_ideas}

{time_horizon}"""
                }
            ],
            
            "contrarian_view": [
                {
                    "title": "Everyone's bearish on {topic}. Here's why they might be wrong",
                    "content": """{contrarian_opening}

Market Consensus: {consensus_view}
Why it's wrong: {counter_argument}

Data Supporting Contrarian View:
• {data_point_1}
• {data_point_2}
• {data_point_3}

Historical Precedent:
{historical_example}

Risk/Reward:
Downside: {downside}%
Upside: {upside}%

How to Play:
{trade_structure}

Remember: {wisdom}"""
                }
            ]
        }
        
        # Professional visual templates
        self.visual_templates = {
            "market_snapshot": {
                "layout": "clean_grid",
                "elements": ["index_level", "change_percent", "key_levels", "volume_bars"],
                "color_scheme": "professional_blue"
            },
            "flow_analysis": {
                "layout": "split_comparison",
                "elements": ["fii_bar", "dii_bar", "net_flow", "trend_arrow"],
                "color_scheme": "red_green_contrast"
            },
            "technical_setup": {
                "layout": "chart_focused",
                "elements": ["price_chart", "support_resistance", "indicators", "targets"],
                "color_scheme": "trading_terminal"
            }
        }
    
    def extract_insights_from_content(self, pasted_content: str) -> Dict:
        """
        Intelligently extract title and key insights from pasted content
        """
        lines = pasted_content.strip().split('\n')
        
        # Extract numbers and key metrics
        numbers = re.findall(r'₹?[\d,]+\.?\d*\s*(?:Cr|cr|CR|Lakh|%|K|M|B)', pasted_content)
        
        # Find company names (capitalized words)
        companies = re.findall(r'\b[A-Z][A-Z]+\b|\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', pasted_content)
        companies = [c for c in companies if len(c) > 2 and c not in ['The', 'This', 'That', 'What', 'When', 'Where']]
        
        # Detect content type
        content_type = self._detect_content_type(pasted_content)
        
        # Generate smart title
        title = self._generate_smart_title(pasted_content, content_type, numbers, companies)
        
        # Extract key insights
        insights = self._extract_key_insights(pasted_content, content_type)
        
        # Generate visual suggestion
        visual_style = self._suggest_visual_style(content_type, numbers)
        
        return {
            'title': title,
            'key_insights': insights,
            'content_type': content_type,
            'visual_style': visual_style,
            'extracted_metrics': {
                'numbers': numbers[:5],
                'companies': companies[:3]
            }
        }
    
    def _detect_content_type(self, content: str) -> str:
        """Detect what type of financial content this is"""
        content_lower = content.lower()
        
        if 'fii' in content_lower and 'dii' in content_lower:
            return 'fii_dii_flow'
        elif 'nifty' in content_lower or 'sensex' in content_lower:
            return 'index_analysis'
        elif 'earnings' in content_lower or 'results' in content_lower:
            return 'earnings'
        elif 'option' in content_lower or 'strike' in content_lower or 'pcr' in content_lower:
            return 'options'
        elif 'technical' in content_lower or 'support' in content_lower or 'resistance' in content_lower:
            return 'technical'
        elif 'ipo' in content_lower:
            return 'ipo'
        else:
            return 'market_update'
    
    def _generate_smart_title(self, content: str, content_type: str, numbers: List, companies: List) -> str:
        """Generate an intelligent, engaging title"""
        
        # Title patterns that work on LinkedIn
        title_patterns = {
            'fii_dii_flow': [
                f"FIIs {numbers[0] if numbers else 'pulled out'}, DIIs {numbers[1] if len(numbers) > 1 else 'stepped in'}",
                f"Domestic institutions counter FII selling with {numbers[0] if numbers else 'heavy buying'}",
                f"The {numbers[0] if numbers else '₹1000 Cr'} divergence between FII and DII"
            ],
            'index_analysis': [
                f"{companies[0] if companies else 'Nifty'} at {numbers[0] if numbers else 'crucial juncture'}",
                f"Key levels to watch as {companies[0] if companies else 'market'} tests {numbers[0] if numbers else 'resistance'}",
                f"{numbers[0] if numbers else 'This level'} will decide the next move"
            ],
            'earnings': [
                f"{companies[0] if companies else 'Company'} earnings: {numbers[0] if numbers else 'Beat or miss'}?",
                f"Why {companies[0] if companies else 'the Street'} is watching {numbers[0] if numbers else 'these numbers'}",
                f"{companies[0] if companies else 'Earnings'} preview: {numbers[0] if numbers else 'Key metrics'} to track"
            ],
            'options': [
                f"Options chain suggesting {numbers[0] if numbers else 'major'} move coming",
                f"Unusual activity in {companies[0] if companies else 'index'} options",
                f"PCR at {numbers[0] if numbers else 'extreme'}: Time to {random.choice(['hedge', 'position', 'book profits'])}"
            ],
            'default': [
                f"{companies[0] if companies else 'Market'} {random.choice(['update', 'insight', 'analysis'])}: {numbers[0] if numbers else 'Key development'}",
                f"Breaking: {companies[0] if companies else 'Major'} {random.choice(['move', 'development', 'announcement'])}",
                f"What {numbers[0] if numbers else 'this'} means for {companies[0] if companies else 'investors'}"
            ]
        }
        
        patterns = title_patterns.get(content_type, title_patterns['default'])
        return random.choice(patterns)
    
    def _extract_key_insights(self, content: str, content_type: str) -> List[str]:
        """Extract 3-5 key insights from the content"""
        insights = []
        lines = [l.strip() for l in content.split('\n') if l.strip()]
        
        # Look for lines with key patterns
        insight_patterns = [
            r'•\s*(.+)',  # Bullet points
            r'\d+\.\s*(.+)',  # Numbered lists
            r'Key\s+\w+:\s*(.+)',  # Key something: 
            r'Important:\s*(.+)',
            r'Note:\s*(.+)',
            r'(?:Buy|Sell|Hold|Long|Short)\s+(?:above|below|at)\s+(.+)',  # Trading levels
        ]
        
        for line in lines:
            for pattern in insight_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match and len(insights) < 5:
                    insights.append(match.group(1)[:100])
        
        # If not enough insights found, extract important sentences
        if len(insights) < 3:
            # Get sentences with numbers or important keywords
            important_words = ['target', 'support', 'resistance', 'buy', 'sell', 'breakout', 
                              'breakdown', 'bullish', 'bearish', 'opportunity', 'risk']
            for line in lines:
                if any(word in line.lower() for word in important_words):
                    insights.append(line[:100])
                    if len(insights) >= 5:
                        break
        
        return insights[:5] if insights else ["Key market movement detected", "Important levels identified", "Action required"]
    
    def _suggest_visual_style(self, content_type: str, numbers: List) -> Dict:
        """Suggest appropriate visual style based on content"""
        visual_suggestions = {
            'fii_dii_flow': {
                'type': 'comparison_bars',
                'primary_metric': numbers[0] if numbers else '₹1000 Cr',
                'secondary_metric': numbers[1] if len(numbers) > 1 else '₹800 Cr',
                'color_scheme': 'red_green',
                'layout': 'split_screen'
            },
            'index_analysis': {
                'type': 'level_chart',
                'primary_metric': numbers[0] if numbers else '24,500',
                'color_scheme': 'professional_blue',
                'layout': 'hero_number'
            },
            'options': {
                'type': 'options_grid',
                'primary_metric': numbers[0] if numbers else '1.2',
                'color_scheme': 'heatmap',
                'layout': 'data_table'
            },
            'default': {
                'type': 'clean_text',
                'primary_metric': numbers[0] if numbers else '',
                'color_scheme': 'minimal',
                'layout': 'text_focus'
            }
        }
        
        return visual_suggestions.get(content_type, visual_suggestions['default'])
    
    def generate_professional_content(self, content_type: Optional[str] = None, context: Dict = None) -> Dict:
        """Generate professional finance content"""
        if not content_type:
            content_type = random.choice(list(self.market_templates.keys()))
        
        templates = self.market_templates.get(content_type, self.market_templates['breaking_insight'])
        template = random.choice(templates)
        
        # Generate realistic data
        data = self._generate_realistic_data(content_type, context)
        
        # Fill template
        title = template['title'].format(**data)
        content = template['content'].format(**data)
        
        return {
            'title': title,
            'content': content,
            'content_type': content_type,
            'visual_suggestion': self.visual_templates.get(content_type, self.visual_templates['market_snapshot']),
            'hashtags': self._generate_hashtags(content_type),
            'estimated_engagement': random.randint(85, 98)
        }
    
    def _generate_realistic_data(self, content_type: str, context: Dict = None) -> Dict:
        """Generate realistic market data"""
        base_data = {
            # FII DII Flow
            'fii_outflow': random.randint(500, 3000),
            'dii_inflow': random.randint(800, 3500),
            'fii_direction': random.choice(['selling', 'outflow']),
            'dii_direction': random.choice(['buying', 'inflow']),
            'net_impact': random.choice(['Markets held ground', 'Volatility contained', 'Pressure absorbed']),
            'sector_1': random.choice(['Banking', 'IT', 'Pharma', 'Auto']),
            'sector_2': random.choice(['FMCG', 'Metals', 'Realty', 'Energy']),
            'sector_3': random.choice(['Chemicals', 'Infra', 'Telecom', 'Media']),
            'fii_action_1': 'sold heavily',
            'dii_action_1': 'accumulated',
            'fii_action_2': 'booked profits',
            'dii_action_2': 'cherry-picked',
            'key_insight': 'Domestic confidence remains despite global uncertainty',
            'market_outlook': 'near-term consolidation with upward bias',
            'outcome_prediction': 'range-bound movement with stock-specific action',
            
            # Nifty Analysis
            'level': '24,712',
            'index': 'Nifty',
            'support_1': '24,650',
            'support_2': '24,500',
            'resistance_1': '24,800',
            'resistance_2': '24,950',
            'open_price': '24,680',
            'high_price': '24,785',
            'change': '+0.35',
            'volume_analysis': 'Volumes picked up near day high',
            'breadth_analysis': 'Breadth positive with 31 advances vs 19 declines',
            'observation_1': 'Banking stocks led the recovery',
            'observation_2': 'Put writing seen at 24,600 strike',
            'long_level': '24,750',
            'target_1': '24,900',
            'short_level': '24,600',
            'target_2': '24,450',
            'risk_warning': 'Keep position size limited ahead of F&O expiry',
            'current_level': '24,712',
            'advance': '31',
            'decline': '19',
            'volume_comparison': '10% above average',
            'emotion': random.choice(['relief', 'cautious', 'optimistic']),
            'investor_type': random.choice(['bulls', 'bears', 'traders']),
            'dramatic_opening': random.choice([
                'Markets staged a smart recovery',
                'Bulls defended crucial support',
                'Volatility returned with vengeance'
            ]),
            'sector_performance': 'Banking +1.2%, IT -0.5%, Auto +0.8%',
            'winners': 'HDFC Bank, Reliance, Axis',
            'losers': 'Infosys, TCS, Wipro',
            'buy_level': '24,750',
            'sell_level': '24,650',
            'closing_thought': 'Tomorrow\'s GDP data will set the tone',
            
            # Add more data as needed
            'company': random.choice(['Reliance', 'TCS', 'HDFC Bank', 'Infosys', 'ICICI Bank']),
            'action': random.choice(['announced buyback', 'posted record profits', 'raised guidance']),
            'news_summary': 'Breaking development in the corporate space',
            'immediate_impact': 'Stock up 3% in pre-market',
            'sector_impact': 'Peers following suit',
            'competitive_angle': 'Competitive advantage strengthened',
            'metric_1': 'P/E Ratio',
            'value_1': '22.5',
            'comparison_1': 'vs sector avg 25',
            'metric_2': 'ROE',
            'value_2': '18%',
            'comparison_2': 'highest in 5 years',
            'investment_thesis': 'Strong buy on dips above 2,400',
            'risk_1': 'Global headwinds',
            'risk_2': 'Regulatory changes',
            'actionable_advice': 'Accumulate in 2,380-2,420 range for targets of 2,550'
        }
        
        # Override with context if provided
        if context:
            base_data.update(context)
        
        return base_data
    
    def _generate_hashtags(self, content_type: str) -> List[str]:
        """Generate relevant hashtags"""
        base_tags = ['#IndianStockMarket', '#Nifty50', '#StockMarket']
        
        type_specific = {
            'fii_dii_flow': ['#FIIDIIData', '#MarketFlows', '#InstitutionalActivity'],
            'nifty_analysis': ['#NiftyAnalysis', '#TechnicalAnalysis', '#MarketLevels'],
            'options_strategy': ['#OptionsTrading', '#Derivatives', '#OptionsStrategy'],
            'earnings_preview': ['#EarningsUpdate', '#QuarterlyResults', '#CorporateEarnings'],
            'sector_rotation': ['#SectorRotation', '#ThematicInvesting'],
            'breaking_insight': ['#Breaking', '#MarketNews', '#StockAlert']
        }
        
        return base_tags + type_specific.get(content_type, ['#MarketUpdate'])

# Example usage
if __name__ == "__main__":
    creator = ProfessionalFinanceCreator()
    
    # Test extraction from pasted content
    sample_content = """
    FII sold 2,340 Cr while DII bought 2,890 Cr today.
    Nifty closed at 24,712, up 0.35%.
    Banking stocks led the recovery with HDFC Bank up 2%.
    Support at 24,650, Resistance at 24,800.
    """
    
    extracted = creator.extract_insights_from_content(sample_content)
    print(json.dumps(extracted, indent=2))
    
    # Generate professional content
    content = creator.generate_professional_content('fii_dii_flow')
    print(f"\nTitle: {content['title']}")
    print(f"\nContent:\n{content['content']}")