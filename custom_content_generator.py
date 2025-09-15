#!/usr/bin/env python3
"""
Custom Content Generator for AI Finance Agency
Customize the prompts below for your specific needs
"""

import os
import json
from datetime import datetime
from anthropic import Anthropic
from openai import OpenAI

# Load API keys from environment
CLAUDE_API_KEY = os.getenv('CLAUDE_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

def generate_trading_strategy(ticker="AAPL", timeframe="daily"):
    """Generate a custom trading strategy analysis"""
    client = Anthropic(api_key=CLAUDE_API_KEY)
    
    prompt = f"""
    Create a detailed trading strategy analysis for {ticker} on a {timeframe} timeframe.
    Include:
    1. Technical analysis with key levels
    2. Entry and exit points
    3. Risk management (position sizing, stop loss)
    4. Market sentiment analysis
    5. Probability assessment
    Format as actionable trading plan.
    """
    
    response = client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.content[0].text

def generate_market_newsletter():
    """Generate a weekly market newsletter"""
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{
            "role": "system",
            "content": "You are a senior financial analyst writing a weekly newsletter."
        }, {
            "role": "user",
            "content": """
            Write a compelling weekly market newsletter covering:
            1. Market recap (major indices performance)
            2. Top 3 sector rotations
            3. Upcoming economic events
            4. Trading opportunities for next week
            5. Risk factors to watch
            Make it engaging and actionable for traders.
            """
        }],
        max_tokens=1500
    )
    
    return response.choices[0].message.content

def generate_crypto_analysis(coin="BTC"):
    """Generate cryptocurrency analysis"""
    client = Anthropic(api_key=CLAUDE_API_KEY)
    
    prompt = f"""
    Provide comprehensive {coin} cryptocurrency analysis:
    1. On-chain metrics interpretation
    2. Technical chart patterns
    3. Correlation with traditional markets
    4. DeFi ecosystem impact
    5. Price targets (short/medium/long term)
    Include both bullish and bearish scenarios.
    """
    
    response = client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.content[0].text

def generate_earnings_preview(company="NVDA"):
    """Generate earnings preview content"""
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{
            "role": "user",
            "content": f"""
            Create an earnings preview for {company}:
            1. Revenue and EPS estimates
            2. Key metrics to watch
            3. Guidance expectations
            4. Potential market reaction scenarios
            5. Options strategies for earnings play
            Format for both institutional and retail traders.
            """
        }],
        max_tokens=1000
    )
    
    return response.choices[0].message.content

def main():
    print("🎯 Custom Content Generator for AI Finance Agency")
    print("=" * 60)
    
    # Generate different types of content
    content = {
        "timestamp": datetime.now().isoformat(),
        "content_types": {}
    }
    
    try:
        # Skip Claude API calls for now due to credit limit
        # Trading Strategy
        # print("\n📊 Generating Trading Strategy...")
        # strategy = generate_trading_strategy("TSLA", "4-hour")
        # content["content_types"]["trading_strategy"] = strategy
        # print("✅ Trading strategy generated")
        
        # Market Newsletter  
        print("\n📰 Generating Market Newsletter...")
        newsletter = generate_market_newsletter()
        content["content_types"]["market_newsletter"] = newsletter
        print("✅ Newsletter generated")
        
        # Crypto Analysis
        print("\n🪙 Generating Crypto Analysis...")
        crypto = generate_crypto_analysis("ETH")
        content["content_types"]["crypto_analysis"] = crypto
        print("✅ Crypto analysis generated")
        
        # Earnings Preview
        print("\n📈 Generating Earnings Preview...")
        earnings = generate_earnings_preview("AAPL")
        content["content_types"]["earnings_preview"] = earnings
        print("✅ Earnings preview generated")
        
        # Save all content
        filename = f"custom_content_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w') as f:
            json.dump(content, f, indent=2)
        
        print(f"\n✅ All content saved to {filename}")
        
        # Display sample
        print("\n" + "="*60)
        print("SAMPLE OUTPUT - Trading Strategy:")
        print("="*60)
        print(strategy[:500] + "...")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure to set CLAUDE_API_KEY and OPENAI_API_KEY environment variables")

if __name__ == "__main__":
    main()