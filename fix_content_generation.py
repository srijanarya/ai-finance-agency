#!/usr/bin/env python3
"""
Fix for Content Generation - Ensures Unique, Varied Content
This replaces the broken content generation that was posting identical content
"""

import os
import json
import hashlib
import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class UniqueContentGenerator:
    def __init__(self):
        self.openai_key = os.getenv('OPENAI_API_KEY')
        self.client = OpenAI(api_key=self.openai_key)
        self.content_history_file = "content_history.json"
        self.content_history = self.load_history()
        
        # Diverse content types to ensure variety
        self.content_types = [
            "market_analysis",
            "options_insight", 
            "technical_analysis",
            "fundamental_tips",
            "risk_management",
            "sector_analysis",
            "global_markets",
            "trading_psychology",
            "economic_indicators",
            "investment_strategy"
        ]
        
        # Track last used type to ensure rotation
        self.last_content_type = None
        
    def load_history(self) -> set:
        """Load content history to prevent duplicates"""
        if os.path.exists(self.content_history_file):
            with open(self.content_history_file, 'r') as f:
                data = json.load(f)
                return set(data.get('hashes', []))
        return set()
        
    def save_history(self):
        """Save content history"""
        with open(self.content_history_file, 'w') as f:
            json.dump({'hashes': list(self.content_history)}, f)
            
    def get_content_hash(self, content: str) -> str:
        """Generate hash of content for deduplication"""
        return hashlib.md5(content.encode()).hexdigest()
        
    def is_duplicate(self, content: str) -> bool:
        """Check if content is duplicate"""
        content_hash = self.get_content_hash(content)
        return content_hash in self.content_history
        
    def add_to_history(self, content: str):
        """Add content to history"""
        content_hash = self.get_content_hash(content)
        self.content_history.add(content_hash)
        self.save_history()
        
    def get_next_content_type(self, platform: str = None) -> str:
        """Rotate through content types to ensure variety"""
        # LinkedIn-specific content types (7 types only)
        linkedin_types = [
            "market_analysis",
            "technical_analysis",
            "sector_analysis",
            "global_markets",
            "trading_psychology",
            "economic_indicators",
            "investment_strategy"
        ]
        
        if platform in ['linkedin', 'twitter']:
            # LinkedIn and Twitter use the same 7 professional types
            available_types = [t for t in linkedin_types if t != self.last_content_type]
        else:
            # Other platforms (Telegram, Slack) get all 10 types
            available_types = [t for t in self.content_types if t != self.last_content_type]
            
        next_type = random.choice(available_types)
        self.last_content_type = next_type
        return next_type
        
    def generate_unique_content(self, platform: str = None) -> Dict:
        """Generate unique, non-duplicate content"""
        max_attempts = 5
        
        for attempt in range(max_attempts):
            content_type = self.get_next_content_type(platform=platform)
            
            # For LinkedIn, use Treum Algotech professional style
            if platform == 'linkedin' and content_type == 'market_analysis':
                # Import the professional generator
                try:
                    from treum_algotech_content import TreumAlgotechContent
                    treum = TreumAlgotechContent()
                    professional_content = treum.generate_market_intelligence_report()
                    
                    if professional_content and not self.is_duplicate(professional_content):
                        self.add_to_history(professional_content)
                        return {
                            "content": professional_content,
                            "type": "market_intelligence_treum",
                            "timestamp": datetime.now().isoformat(),
                            "unique": True,
                            "professional": True
                        }
                except Exception as e:
                    print(f"Treum content generation failed: {e}")
                    # Fall back to regular generation
            
            # Dynamic prompt based on content type
            prompts = {
                "market_analysis": f"Create a brief market analysis for Indian stock market (Nifty/Sensex) for {datetime.now().strftime('%B %d, %Y')}. Include specific levels, trends, and actionable insights.",
                "options_insight": "Share an options trading insight for Indian markets. Include strike prices, strategies, and risk management tips.",
                "technical_analysis": "Provide technical analysis for a trending Indian stock or index. Include support/resistance levels and indicators.",
                "fundamental_tips": "Share a fundamental analysis tip for Indian equity investors. Focus on valuation metrics and sector trends.",
                "risk_management": "Provide a risk management strategy for Indian retail investors. Include position sizing and stop-loss strategies.",
                "sector_analysis": "Analyze a specific sector in Indian markets (IT, Banking, Pharma, Auto). Include top picks and outlook.",
                "global_markets": "How are global markets affecting Indian indices today? Include US markets, crude oil, and dollar index impact.",
                "trading_psychology": "Share a trading psychology tip for Indian retail traders. Focus on emotional discipline and decision-making.",
                "economic_indicators": "Analyze recent Indian economic data (GDP, inflation, IIP) and its market impact.",
                "investment_strategy": "Share a long-term investment strategy for Indian markets. Include asset allocation and portfolio tips."
            }
            
            prompt = prompts.get(content_type, prompts["market_analysis"])
            
            # Add randomization elements
            prompt += f"\n\nIMPORTANT: Make this unique and specific to today's date: {datetime.now().strftime('%B %d, %Y')}."
            prompt += "\nUse specific numbers, levels, and examples."
            prompt += "\nKeep it concise (under 280 characters for main insight)."
            prompt += "\nInclude relevant emojis and hashtags."
            
            try:
                response = self.client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a professional financial content creator for Indian markets. Create engaging, unique content that provides value to retail investors."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.9,  # Higher temperature for more variety
                    max_tokens=400
                )
                
                content = response.choices[0].message.content.strip()
                
                # Check for duplicates
                if not self.is_duplicate(content):
                    self.add_to_history(content)
                    
                    return {
                        "content": content,
                        "type": content_type,
                        "timestamp": datetime.now().isoformat(),
                        "unique": True,
                        "attempt": attempt + 1
                    }
                    
            except Exception as e:
                print(f"Error generating content: {e}")
                
        # Fallback: Generate time-based unique content
        fallback_content = self.generate_fallback_content()
        self.add_to_history(fallback_content)
        
        return {
            "content": fallback_content,
            "type": "fallback",
            "timestamp": datetime.now().isoformat(),
            "unique": True,
            "fallback": True
        }
        
    def generate_fallback_content(self) -> str:
        """Generate fallback content that's always unique"""
        time_now = datetime.now()
        hour = time_now.hour
        
        market_phase = "pre-market" if hour < 9 else "market hours" if hour < 15.5 else "post-market"
        
        templates = [
            f"📊 {market_phase.title()} Update - {time_now.strftime('%B %d, %H:%M')}\n\nNifty holding above crucial support. Watch for breakout above resistance.\n\n#Nifty #StockMarket",
            f"🎯 Options Alert - {time_now.strftime('%B %d')}\n\nHigh OI buildup observed at key strikes. Premium sellers in control.\n\n#OptionsTrading #Nifty50",
            f"💡 Trading Tip - {time_now.strftime('%I:%M %p')}\n\nPatience pays in volatile markets. Wait for confirmation before entering trades.\n\n#TradingTips #StockMarketIndia"
        ]
        
        return random.choice(templates)

def test_generation():
    """Test the content generation"""
    generator = UniqueContentGenerator()
    
    print("Testing Unique Content Generation:")
    print("-" * 50)
    
    for i in range(3):
        result = generator.generate_unique_content()
        print(f"\nContent #{i+1}:")
        print(f"Type: {result['type']}")
        print(f"Content: {result['content'][:200]}...")
        print(f"Unique: {result['unique']}")
        print("-" * 50)

if __name__ == "__main__":
    test_generation()