#!/usr/bin/env python3
"""
Treum Algotech Professional Content Generator
Creates sophisticated market intelligence reports in the brand voice
"""

import os
import json
import random
from datetime import datetime
from typing import Dict, List
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class TreumAlgotechContent:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.brand_name = "Treum Algotech"
        self.tagline = "Advanced Algorithms. Quantitative Excellence."
        
    def generate_market_intelligence_report(self) -> str:
        """Generate a sophisticated market intelligence report"""
        
        date = datetime.now().strftime('%B %d, %Y')
        
        # Professional prompt for sophisticated content
        prompt = f"""Create a professional market intelligence report for {date} in the style of an elite quantitative trading firm called Treum Algotech.

Structure the report EXACTLY like this:

🎯 Market Intelligence Report by Treum Algotech | {date}

Start with: "At Treum Algotech, we leverage advanced algorithms and quantitative analysis to navigate market complexities. Here's our latest assessment:"

📊 Market Performance:
[Provide specific NIFTY and SENSEX closing levels with percentages. Make the numbers realistic for the current market around 24,500-25,000 for NIFTY and 80,000-82,000 for SENSEX. Include a sophisticated observation about market structure beyond just the numbers.]

💼 Institutional Dynamics:
[Discuss FII vs DII activity with specific rupee amounts (in crores). Provide thoughtful analysis about what this divergence means. Include a thought-provoking question for readers.]

🎯 Sectoral Rotation:
[Identify 2-3 specific sectors showing strength/weakness. Explain what this rotation signals for upcoming market moves.]

🌐 Global Context:
[Connect 2-3 global factors (US markets, crude oil, dollar index, or crypto) to Indian market sentiment. Show how these correlations matter.]

💭 Strategic Perspective:
[Start with "In my 15+ years of market experience..." and share a sophisticated insight. Then provide 3 specific, actionable recommendations for institutional investors.]

End with: "What's your take on the current market setup? Are you seeing this as a buying opportunity or a signal to reduce exposure?

Share your quantitative insights in the comments below.

— The Treum Algotech Team"

Use hashtags: #AlgorithmicTrading #QuantitativeFinance #MarketAnalytics #TreumAlgotech #FinTech #TradingStrategies #MarketIntelligence #IndianStockMarket

IMPORTANT:
- Use specific, realistic numbers
- Include sophisticated terminology (risk-off, high-beta, covered calls, relative strength)
- Ask thought-provoking questions
- Maintain professional yet engaging tone
- Show expertise through specific strategies and observations
- Make it feel like it's written by experienced quant traders"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4",  # Using GPT-4 for higher quality
                messages=[
                    {"role": "system", "content": "You are a senior quantitative analyst at Treum Algotech, an elite algorithmic trading firm. You have 15+ years of experience in Indian and global markets."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=800
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"Error generating content: {e}")
            # Fallback to GPT-3.5 if GPT-4 fails
            try:
                response = self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a senior quantitative analyst at Treum Algotech."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=800
                )
                return response.choices[0].message.content.strip()
            except:
                return self.generate_fallback_content()
    
    def generate_fallback_content(self) -> str:
        """Generate fallback content if API fails"""
        date = datetime.now().strftime('%B %d, %Y')
        nifty = random.randint(24500, 25000)
        sensex = random.randint(80500, 82000)
        
        return f"""🎯 Market Intelligence Report by Treum Algotech | {date}

At Treum Algotech, we leverage advanced algorithms and quantitative analysis to navigate market complexities. Here's our latest assessment:

📊 Market Performance:
NIFTY closed at {nifty} with mixed signals across timeframes. SENSEX at {sensex} showing consolidation patterns. The market structure suggests accumulation by smart money despite headline weakness.

💼 Institutional Dynamics:
FIIs remained net sellers while DIIs provided support. This divergence often marks inflection points in medium-term trends.

🎯 Sectoral Rotation:
IT and Pharma showing defensive strength. Banking sector awaits RBI policy clarity.

🌐 Global Context:
US futures indicate cautious optimism. Dollar index stability supporting emerging market flows.

💭 Strategic Perspective:
In my 15+ years of market experience, such consolidation phases often precede directional moves. Consider accumulating quality names on dips.

What's your take on the current market setup?

— The Treum Algotech Team

#AlgorithmicTrading #QuantitativeFinance #MarketAnalytics #TreumAlgotech"""

    def get_content_variations(self) -> List[Dict[str, str]]:
        """Generate different types of professional content"""
        variations = [
            {
                "type": "market_intelligence",
                "focus": "Daily comprehensive market report",
                "style": "Full analysis with all sections"
            },
            {
                "type": "options_strategy",
                "focus": "Sophisticated options plays for the day",
                "style": "Technical with Greeks and probability analysis"
            },
            {
                "type": "quant_insights",
                "focus": "Statistical patterns and algorithmic signals",
                "style": "Data-driven with backtesting results"
            },
            {
                "type": "sector_deepdive",
                "focus": "In-depth analysis of specific sector",
                "style": "Fundamental + Technical combined"
            },
            {
                "type": "risk_analytics",
                "focus": "Portfolio risk management strategies",
                "style": "VaR, correlation matrices, hedging"
            }
        ]
        return variations

def test_generation():
    """Test the Treum Algotech content generation"""
    generator = TreumAlgotechContent()
    
    print("Generating Treum Algotech Market Intelligence Report...")
    print("=" * 60)
    
    content = generator.generate_market_intelligence_report()
    print(content)
    
    print("\n" + "=" * 60)
    print("Content length:", len(content), "characters")
    print("Perfect for LinkedIn's algorithm!")

if __name__ == "__main__":
    test_generation()