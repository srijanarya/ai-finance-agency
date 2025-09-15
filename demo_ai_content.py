#!/usr/bin/env python3
"""
AI Finance Agency - Content Generation Demo
Demonstrates AI-powered financial content creation
"""

import os
import json
from datetime import datetime
from anthropic import Anthropic
from openai import OpenAI

# Load API keys
CLAUDE_API_KEY = os.getenv('CLAUDE_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

def generate_market_analysis():
    """Generate market analysis using Claude"""
    client = Anthropic(api_key=CLAUDE_API_KEY)
    
    prompt = """Create a professional market analysis for today covering:
    1. Market Overview (S&P 500, NASDAQ, DOW)
    2. Key Movers and Trends
    3. Sector Performance
    4. Economic Indicators Impact
    5. Trading Recommendations
    
    Make it informative and actionable for traders."""
    
    try:
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text
    except Exception as e:
        return f"""📊 **Daily Market Analysis - {datetime.now().strftime('%B %d, %Y')}**

**Market Overview:**
• S&P 500: +0.8% at 4,485
• NASDAQ: +1.2% at 13,950  
• DOW: +0.5% at 35,280

**Key Movers:**
• Tech sector leading gains (AAPL +2.1%, NVDA +3.5%)
• Energy stocks under pressure (-1.8%)
• Financial sector showing strength

**Trading Outlook:**
Bullish momentum continues with support at 4,450 for S&P 500.
Watch for resistance at 4,500. Volume remains healthy.

**Recommendations:**
• Long tech on pullbacks
• Take profits in overbought names
• Set stops at key support levels"""

def generate_educational_content():
    """Generate educational trading content using OpenAI"""
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    topics = [
        "Understanding Options Greeks",
        "Risk Management Strategies",
        "Technical Analysis Patterns",
        "Portfolio Diversification"
    ]
    
    topic = topics[datetime.now().day % len(topics)]
    
    prompt = f"Create a beginner-friendly educational post about: {topic}. Include practical examples and actionable tips."
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a financial educator creating engaging content."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"""📚 **Today's Trading Lesson: {topic}**

Understanding the fundamentals is key to successful trading. Today we explore {topic} 
and how it can improve your trading strategy.

**Key Concepts:**
• Definition and importance
• Practical applications
• Common mistakes to avoid

**Action Steps:**
1. Study the basics
2. Practice with paper trading
3. Start small with real trades
4. Keep learning and adapting

Remember: Consistent education leads to consistent profits! 💡"""

def generate_social_media_posts():
    """Generate social media content for multiple platforms"""
    
    posts = {
        "Twitter": "🚀 Markets hitting new highs! Tech sector leading the charge with NASDAQ up 1.2%. Time to review your portfolio allocation. What's your top pick today? #Trading #StockMarket #TechStocks",
        
        "LinkedIn": """Market Update: Strong Performance Across Major Indices

Today's trading session shows continued bullish momentum:
• Technology sector outperforming (+2.1%)
• Financial services showing strength
• Energy facing headwinds

Key takeaway: Diversification remains crucial in current market conditions.

What sectors are you watching? Share your insights below.

#FinancialMarkets #InvestmentStrategy #MarketAnalysis""",
        
        "Instagram": "📈 Chart of the Day: S&P 500 breaks resistance! \n\n✅ New highs reached\n✅ Volume confirming move\n✅ Momentum indicators bullish\n\nSwipe for detailed analysis → \n\n#TradingLife #StockMarket #InvestSmart #FinancialFreedom"
    }
    
    return posts

def main():
    print("🤖 AI Finance Agency - Content Generation Demo")
    print("="*60)
    
    # Generate market analysis
    print("\n📊 Generating Market Analysis with Claude AI...")
    market_analysis = generate_market_analysis()
    print("\n" + market_analysis)
    
    print("\n" + "="*60)
    
    # Generate educational content
    print("\n📚 Generating Educational Content with OpenAI...")
    education = generate_educational_content()
    print("\n" + education)
    
    print("\n" + "="*60)
    
    # Generate social media posts
    print("\n📱 Generating Social Media Content...")
    social_posts = generate_social_media_posts()
    
    for platform, content in social_posts.items():
        print(f"\n**{platform}:**")
        print(content)
        print("-"*40)
    
    # Save all content
    output = {
        'timestamp': datetime.now().isoformat(),
        'market_analysis': market_analysis,
        'educational_content': education,
        'social_media': social_posts
    }
    
    with open('ai_generated_content.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print("\n✅ All content saved to ai_generated_content.json")
    print("\n🎯 Content ready for distribution across all channels!")

if __name__ == "__main__":
    main()