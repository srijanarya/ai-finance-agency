#!/usr/bin/env python3
"""
Visual Content Generator for LinkedIn
Creates engaging titles and visual content using Canva
"""

import json
import sqlite3
from datetime import datetime
import random
import yfinance as yf
import os
from typing import Dict, List

class VisualContentGenerator:
    def __init__(self):
        self.db_path = "data/agency.db"
        
        # Engaging title templates (no more "Deep Dive")
        self.title_templates = [
            # Curiosity-driven titles
            "Why {company} is the Hidden Gem Nobody's Talking About",
            "The ₹{amount} Opportunity Most Investors Are Missing Right Now",
            "{number} Warning Signs Smart Money Saw Before the {event}",
            "How {person} Made {returns}% Returns When Markets Crashed",
            
            # Data-driven titles
            "Nifty at {level}: Here's What History Tells Us Happens Next",
            "FIIs Sold ₹{amount} Yesterday. Here's Why You Should Care",
            "{sector} Stocks Set to Explode: {number} Data Points Say So",
            
            # Contrarian titles
            "Everyone's Buying {stock}. Here's Why They're Wrong",
            "The Market Just Gave Us a {percentage}% Discount on Quality",
            "Forget {popular_stock}. This Sector Will Outperform by {percentage}%",
            
            # Educational titles
            "The {concept} Strategy That Beat Nifty by {percentage}% Last Year",
            "How to Read {indicator} Like a Pro Trader (With Live Examples)",
            "{number} Metrics That Actually Predict Stock Movements",
            
            # Urgent/Timely titles
            "RBI's Latest Move: {number} Stocks to Buy Before {date}",
            "Budget {year}: {number} Sectors Set to Benefit Most",
            "Q{quarter} Results Preview: {number} Stocks on My Watchlist",
            
            # Story-driven titles
            "From ₹{start_amount} to ₹{end_amount}: My {timeframe} Journey",
            "I Analyzed {number} Indian Stocks. These {count} Stand Out",
            "The ₹{amount} Mistake That Taught Me Everything About Trading",
            
            # List-based titles
            "{number} Undervalued Stocks Trading Below Book Value",
            "{number} Dividend Kings for Passive Income in {year}",
            "My Top {number} Picks for {timeframe}",
            
            # Question titles
            "Is {stock} the Next Multibagger? {number} Signs Point to Yes",
            "Should You Buy the Dip in {sector}? Data Says...",
            "Why Are DIIs Accumulating {stock} Aggressively?"
        ]
        
        # Visual content templates for Canva
        self.visual_templates = {
            "market_snapshot": {
                "type": "infographic",
                "elements": [
                    "market_indices",
                    "top_gainers_losers",
                    "sector_performance",
                    "fii_dii_data"
                ],
                "color_scheme": ["#00B4D8", "#0077B6", "#03045E", "#FF006E"],
                "format": "square"  # 1:1 for LinkedIn
            },
            
            "stock_analysis": {
                "type": "chart",
                "elements": [
                    "price_chart",
                    "key_metrics",
                    "target_levels",
                    "recommendation"
                ],
                "color_scheme": ["#2ECC71", "#E74C3C", "#F39C12", "#3498DB"],
                "format": "square"
            },
            
            "educational": {
                "type": "carousel",
                "elements": [
                    "concept_title",
                    "step_by_step",
                    "examples",
                    "key_takeaway"
                ],
                "color_scheme": ["#6C63FF", "#FF6B6B", "#4ECDC4", "#FFE66D"],
                "format": "square"
            },
            
            "data_story": {
                "type": "comparison",
                "elements": [
                    "before_after",
                    "key_statistics",
                    "trend_arrows",
                    "conclusion"
                ],
                "color_scheme": ["#FF4757", "#00D2D3", "#FECA57", "#54A0FF"],
                "format": "square"
            },
            
            "quote_card": {
                "type": "quote",
                "elements": [
                    "quote_text",
                    "author",
                    "market_context",
                    "brand_logo"
                ],
                "color_scheme": ["#2C3E50", "#E67E22", "#ECF0F1", "#C0392B"],
                "format": "square"
            }
        }
        
        # Improved hook templates
        self.hook_templates = [
            "{emoji} {strong_statement}\n\nHere's what you need to know:\n\n",
            "BREAKING: {event}\n\n{number} things smart investors are doing right now:\n\n",
            "Unpopular opinion: {contrarian_view}\n\nLet me explain with data:\n\n",
            "After {timeframe} of research, I found {discovery}\n\nThread below {emoji}\n\n",
            "{question}?\n\nI analyzed {data_points} to find the answer:\n\n",
            "The {superlative} opportunity in Indian markets right now.\n\nA thread:\n\n",
            "If you're not {action}, you're missing out.\n\nHere's why:\n\n"
        ]
        
        # Call to action templates
        self.cta_templates = [
            "\n\n↓ What's your take on this?",
            "\n\nAgree? Disagree? Let me know in the comments.",
            "\n\n♻️ Repost if you found this valuable.",
            "\n\nWhat would you add to this analysis?",
            "\n\nTag someone who needs to see this.",
            "\n\nFollow for daily Indian market insights.",
            "\n\n💭 Drop your thoughts below."
        ]
        
    def generate_engaging_title(self, content_type: str, data: Dict = None) -> str:
        """Generate an engaging title based on content type"""
        
        # Select appropriate templates based on content type
        if content_type == "market_analysis":
            templates = [t for t in self.title_templates if any(
                keyword in t.lower() for keyword in ['nifty', 'market', 'fii', 'sector']
            )]
        elif content_type == "stock_pick":
            templates = [t for t in self.title_templates if any(
                keyword in t.lower() for keyword in ['stock', 'company', 'pick', 'undervalued']
            )]
        elif content_type == "educational":
            templates = [t for t in self.title_templates if any(
                keyword in t.lower() for keyword in ['how', 'strategy', 'metric', 'read']
            )]
        else:
            templates = self.title_templates
        
        # Select a random template
        template = random.choice(templates if templates else self.title_templates)
        
        # Fill in the template with relevant data
        title_data = {
            'company': random.choice(['Reliance', 'TCS', 'Infosys', 'HDFC Bank', 'ITC']),
            'amount': random.choice(['50,000 Cr', '1 Lakh Cr', '25,000 Cr', '75,000 Cr']),
            'number': random.choice(['3', '5', '7', '10']),
            'event': random.choice(['correction', 'rally', 'crash', 'breakout']),
            'person': random.choice(['Rakesh Jhunjhunwala', 'Radhakrishnan Damani', 'Vijay Kedia']),
            'returns': random.choice(['127', '85', '234', '156']),
            'level': '24,500',
            'sector': random.choice(['IT', 'Banking', 'Pharma', 'Auto', 'FMCG']),
            'stock': random.choice(['HDFC', 'Reliance', 'TCS', 'Wipro', 'Maruti']),
            'percentage': random.choice(['15', '23', '30', '40']),
            'popular_stock': 'Adani',
            'concept': random.choice(['RSI Divergence', 'Volume Analysis', 'Options Chain']),
            'indicator': random.choice(['Option Chain', 'RSI', 'Moving Averages', 'Volume']),
            'date': 'March 31',
            'year': '2025',
            'quarter': random.choice(['1', '2', '3', '4']),
            'start_amount': '10,000',
            'end_amount': '1 Crore',
            'timeframe': random.choice(['6 months', '1 year', '2 years']),
            'count': '3'
        }
        
        # Update with actual data if provided
        if data:
            title_data.update(data)
        
        # Generate title
        try:
            title = template.format(**title_data)
        except KeyError:
            # Fallback to a simpler title if template fails
            title = f"{title_data['sector']} Sector: {title_data['number']} Stocks to Watch"
        
        return title
    
    def create_visual_content(self, content: str, visual_type: str = "market_snapshot") -> Dict:
        """Create visual content specification for Canva"""
        
        visual_spec = {
            "template": self.visual_templates.get(visual_type, self.visual_templates["market_snapshot"]),
            "content_text": content[:500],  # First 500 chars for visual
            "timestamp": datetime.now().strftime("%d %b %Y"),
            "branding": {
                "name": "AI Finance Agency",
                "tagline": "Data-Driven Insights",
                "logo_position": "bottom-right"
            }
        }
        
        # Add specific data based on visual type
        if visual_type == "market_snapshot":
            visual_spec["data"] = {
                "nifty": "24,712 (-0.75%)",
                "sensex": "80,787 (-0.73%)",
                "top_gainer": "Pharma +2.9%",
                "top_loser": "Realty -3.2%",
                "fii_flow": "₹-892 Cr",
                "dii_flow": "₹+3,456 Cr"
            }
        elif visual_type == "stock_analysis":
            visual_spec["data"] = {
                "stock": "TCS",
                "cmp": "₹4,234",
                "target": "₹4,500",
                "stop_loss": "₹4,100",
                "pe_ratio": "29.5",
                "recommendation": "BUY"
            }
        
        return visual_spec
    
    def generate_complete_content(self, content_type: str = "market_analysis") -> Dict:
        """Generate complete content with title, text, and visual specs"""
        
        # Generate engaging title
        title = self.generate_engaging_title(content_type)
        
        # Generate hook
        hook_data = {
            'emoji': random.choice(['🚀', '📊', '💡', '🎯', '⚡', '🔥', '📈']),
            'strong_statement': random.choice([
                "India's next wealth creator is hiding in plain sight",
                "The biggest opportunity since 2020 crash",
                "Smart money is quietly accumulating",
                "This pattern has 87% success rate"
            ]),
            'event': "FII selling reaches 3-month high",
            'number': random.choice(['3', '5', '7']),
            'contrarian_view': "expensive stocks are actually cheap right now",
            'timeframe': "48 hours",
            'discovery': "a pattern that predicts 80% of market moves",
            'question': "Why are DIIs buying when everyone's selling",
            'data_points': "10,000+ trades",
            'superlative': "most undervalued",
            'action': "watching these 3 indicators"
        }
        
        hook = random.choice(self.hook_templates).format(**hook_data)
        
        # Generate main content
        content = hook + self.generate_body_content(content_type)
        
        # Add engagement elements
        content += random.choice(self.cta_templates)
        
        # Add hashtags
        hashtags = [
            "#IndianStockMarket", "#Nifty50", "#StockMarketIndia",
            "#InvestmentIdeas", "#FinanceIndia", "#WealthCreation",
            "#StockMarketTips", "#TradingIndia", "#MarketAnalysis"
        ]
        
        # Create visual specification
        visual_spec = self.create_visual_content(content, 
                                                 "market_snapshot" if content_type == "market_analysis" else "stock_analysis")
        
        return {
            "title": title,
            "content": content,
            "hashtags": random.sample(hashtags, 5),
            "visual_spec": visual_spec,
            "content_type": content_type,
            "timestamp": datetime.now().isoformat()
        }
    
    def generate_body_content(self, content_type: str) -> str:
        """Generate body content based on type"""
        
        if content_type == "market_analysis":
            return """📊 Key Numbers:
• Nifty: 24,712 (-0.75%)
• Sensex: 80,787 (-0.73%)
• FII: ₹-892 Cr | DII: ₹+3,456 Cr
• Top Sector: Pharma (+2.9%)

🔍 The Pattern Most Missed:
Every time this setup occurred, Nifty moved 5-7% within 30 days

🏦 What Institutions Are Doing:
• DIIs bought ₹15,000 Cr in last 10 sessions
• Mutual funds increasing allocation to mid-caps
• Insurance companies accumulating banking stocks

📈 Your Action Plan:
✓ Accumulate quality stocks on dips
✓ Keep 20% cash for opportunities
✓ Set stop-loss at key support levels

💭 Remember:
"Time in the market beats timing the market"
"""
        else:
            return """📊 Today's Opportunity:
• Sector showing breakout signs
• Volume surge indicates institutional interest
• Risk-reward ratio favorable at current levels

🎯 Key Levels to Watch:
• Support: Previous level
• Resistance: Next target
• Stop Loss: Below recent low

📈 Smart Money Move:
Start accumulating in small quantities
"""

def main():
    generator = VisualContentGenerator()
    
    # Generate different types of content
    for content_type in ["market_analysis", "stock_pick", "educational"]:
        print(f"\n{'='*60}")
        print(f"Generating {content_type.upper()} Content")
        print('='*60)
        
        content = generator.generate_complete_content(content_type)
        
        print(f"\n📌 TITLE: {content['title']}")
        print(f"\n📝 CONTENT:\n{content['content']}")
        print(f"\n🏷️ HASHTAGS: {' '.join(content['hashtags'])}")
        print(f"\n🎨 VISUAL TYPE: {content['visual_spec']['template']['type']}")
        
        # Save to file
        filename = f"posts/visual_{content_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        os.makedirs('posts', exist_ok=True)
        
        with open(filename, 'w') as f:
            json.dump(content, f, indent=2)
        
        print(f"\n💾 Saved to: {filename}")

if __name__ == "__main__":
    main()