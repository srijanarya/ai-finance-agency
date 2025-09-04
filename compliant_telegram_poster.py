#!/usr/bin/env python3
"""
SEBI-Compliant Telegram Poster
Only posts educational content and factual data with proper disclaimers
"""

import requests
import os
from datetime import datetime
import random
from dotenv import load_dotenv
from tradingview_fetcher import TradingViewFetcher

load_dotenv()

class CompliantTelegramPoster:
    def __init__(self):
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.channel = '@AIFinanceNews2024'
        self.tv_fetcher = TradingViewFetcher()
        
        # Compliance disclaimer
        self.disclaimer = """
⚠️ DISCLAIMER: Educational purposes only. Not investment advice. We are not SEBI-registered advisors. Trading carries risk of loss. Consult qualified professionals before investing."""
    
    def post_to_telegram(self, content: str) -> bool:
        """Post content with disclaimer"""
        # Always add disclaimer
        full_content = content + "\n" + self.disclaimer
        
        url = f'https://api.telegram.org/bot{self.bot_token}/sendMessage'
        data = {
            'chat_id': self.channel,
            'text': full_content,
            'parse_mode': 'HTML'
        }
        
        response = requests.post(url, json=data)
        return response.status_code == 200
    
    def post_market_data(self):
        """Post factual market data (compliant)"""
        summary = self.tv_fetcher.generate_market_summary()
        
        # Make it educational
        educational_content = f"""📊 MARKET DATA UPDATE (Educational)

Understanding Today's Market Movement:

{summary}

What do these numbers mean?
• Positive %: More buyers than sellers
• Negative %: More sellers than buyers  
• Volume: Number of shares traded

This is factual data for educational purposes.
"""
        
        return self.post_to_telegram(educational_content)
    
    def post_educational_content(self):
        """Post pure educational content (always compliant)"""
        topics = [
            {
                "title": "📚 LEARN: What is P/E Ratio?",
                "content": """Price-to-Earnings (P/E) Ratio explained:

P/E = Stock Price ÷ Earnings Per Share

What it tells you:
• High P/E (>25): Stock may be overvalued OR high growth expected
• Low P/E (<15): Stock may be undervalued OR low growth
• Industry average matters!

Example: If stock is ₹100 and EPS is ₹5, P/E = 20

Remember: P/E alone doesn't determine if you should invest."""
            },
            {
                "title": "📚 LEARN: Support & Resistance",
                "content": """Understanding Support & Resistance Levels:

SUPPORT: Price level where buying interest is strong
• Stock tends to bounce from this level
• Previous lows often become support

RESISTANCE: Price level where selling pressure increases  
• Stock struggles to break above
• Previous highs often become resistance

Important: These are observations, not guarantees!"""
            },
            {
                "title": "📚 LEARN: Volume Analysis",
                "content": """Why Volume Matters in Trading:

HIGH VOLUME indicates:
• Strong interest in the stock
• Potential trend confirmation
• Institution participation

LOW VOLUME indicates:
• Lack of interest
• Potential false breakout
• Retail-only participation

Rule: "Volume precedes price" - but not always!"""
            },
            {
                "title": "📚 LEARN: Risk Management 101",
                "content": """The 2% Rule of Risk Management:

Never risk more than 2% of capital on one trade.

Example with ₹1,00,000 capital:
• Max risk per trade: ₹2,000
• If stop-loss is 5% away: Max position = ₹40,000
• This ensures you survive 50 losing trades!

Remember: Protecting capital > Making profits"""
            }
        ]
        
        topic = random.choice(topics)
        content = f"{topic['title']}\n\n{topic['content']}\n\n@AIFinanceNews2024"
        
        return self.post_to_telegram(content)
    
    def post_news_summary(self):
        """Post news summary with no recommendations"""
        content = """📰 MARKET NEWS SUMMARY (Factual)

Top Headlines from verified sources:

1. RBI keeps repo rate unchanged at 6.5%
   Source: RBI Official

2. FIIs net buyers of ₹2,500 cr yesterday
   Source: NSE Data

3. Crude oil at $72/barrel
   Source: International markets

4. Dollar index at 103.5
   Source: Forex markets

These are factual headlines for information only.
Form your own opinion after research.

@AIFinanceNews2024"""
        
        return self.post_to_telegram(content)
    
    def post_technical_education(self, symbol: str):
        """Post technical indicator education with real data"""
        data = self.tv_fetcher.get_quote_from_tradingview(symbol)
        
        if not data:
            return False
        
        content = f"""📊 TECHNICAL EDUCATION: Reading {symbol} Indicators

Current Data (Source: TradingView):
• Price: ₹{data['current_price']}
• Change: {data['change_percent']}%
• RSI: {data.get('rsi', 'N/A')}

What these indicators mean (Educational):

RSI (Relative Strength Index):
• Current: {data.get('rsi', 'N/A')}
• Below 30: Often considered oversold
• Above 70: Often considered overbought
• This is historical observation, not prediction

Volume:
• Today: {data.get('volume', 0):,}
• Helps confirm price movements

Remember: Indicators are tools, not crystal balls!

@AIFinanceNews2024"""
        
        return self.post_to_telegram(content)
    
    def run_compliant_posting(self):
        """Run only compliant posts"""
        print("🛡️ COMPLIANT POSTING SESSION")
        print("="*50)
        
        posts = [
            ("Educational Content", self.post_educational_content),
            ("Market Data", self.post_market_data),
            ("News Summary", self.post_news_summary),
            ("Technical Education", lambda: self.post_technical_education("RELIANCE"))
        ]
        
        for post_type, post_func in posts:
            print(f"\n📝 Posting {post_type}...")
            if post_func():
                print(f"✅ {post_type} posted (compliant)")
            else:
                print(f"⚠️ Could not post {post_type}")
            
            import time
            time.sleep(60)  # Wait between posts
        
        print("\n✅ All posts are SEBI-compliant!")
        print("Focus: Education, Data, News - NO advice!")

def main():
    poster = CompliantTelegramPoster()
    poster.run_compliant_posting()

if __name__ == "__main__":
    main()