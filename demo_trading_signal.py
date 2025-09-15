#!/usr/bin/env python3
"""
AI Finance Agency - Trading Signal Demo
Demonstrates AI-powered trading signal generation
"""

import os
import json
from datetime import datetime
import requests
from openai import OpenAI

# Load API keys from environment
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
ALPHA_VANTAGE_KEY = os.getenv('ALPHA_VANTAGE_API_KEY')
FINNHUB_KEY = os.getenv('FINNHUB_API_KEY')

def get_market_data(symbol='AAPL'):
    """Fetch real market data from Alpha Vantage"""
    url = f"https://www.alphavantage.co/query?function=QUOTE_ENDPOINT&symbol={symbol}&apikey={ALPHA_VANTAGE_KEY}"
    try:
        response = requests.get(url, timeout=10)
        return response.json()
    except:
        # Fallback demo data
        return {
            'symbol': symbol,
            'price': 178.45,
            'change': 2.35,
            'volume': 58234000,
            'timestamp': datetime.now().isoformat()
        }

def generate_ai_signal(market_data):
    """Generate trading signal using OpenAI"""
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    prompt = f"""
    Analyze this market data and generate a trading signal:
    Symbol: {market_data['symbol']}
    Current Price: ${market_data['price']}
    Change: {market_data['change']}
    Volume: {market_data['volume']:,}
    
    Provide:
    1. Signal (BUY/HOLD/SELL)
    2. Confidence level (0-100%)
    3. Key technical indicators
    4. Risk assessment
    5. Target price and stop loss
    
    Format as JSON.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional trading analyst providing technical analysis."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        # Fallback demo signal
        return {
            "signal": "BUY",
            "confidence": 72,
            "technical_indicators": {
                "RSI": 45,
                "MACD": "Bullish crossover",
                "Moving_Average": "Above 50-day MA"
            },
            "risk_assessment": "Medium - Market volatility present",
            "target_price": 185.00,
            "stop_loss": 175.00,
            "reasoning": "Strong support at current levels with positive momentum indicators"
        }

def display_signal(signal_data):
    """Display the trading signal in a formatted way"""
    print("\n" + "="*60)
    print("🤖 AI TRADING SIGNAL GENERATED")
    print("="*60)
    print(f"📈 Signal: {signal_data['signal']}")
    print(f"🎯 Confidence: {signal_data['confidence']}%")
    print(f"\n📊 Technical Indicators:")
    for key, value in signal_data.get('technical_indicators', {}).items():
        print(f"   • {key}: {value}")
    print(f"\n⚠️  Risk: {signal_data.get('risk_assessment', 'N/A')}")
    print(f"💰 Target Price: ${signal_data.get('target_price', 0):.2f}")
    print(f"🛑 Stop Loss: ${signal_data.get('stop_loss', 0):.2f}")
    print(f"\n💡 Analysis: {signal_data.get('reasoning', 'N/A')}")
    print("="*60)

def main():
    print("🚀 AI Finance Agency - Trading Signal Demo")
    print("-" * 60)
    
    # Get market data
    print("📊 Fetching market data...")
    market_data = get_market_data('AAPL')
    
    # Generate AI signal
    print("🤖 Generating AI trading signal...")
    signal = generate_ai_signal(market_data)
    
    # Display results
    display_signal(signal)
    
    # Save to file
    with open('trading_signal.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'market_data': market_data,
            'signal': signal
        }, f, indent=2)
    
    print("\n✅ Signal saved to trading_signal.json")

if __name__ == "__main__":
    main()