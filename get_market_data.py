#!/usr/bin/env python3
"""
Get Current Market Data
Shows real-time market prices and analysis
"""

import yfinance as yf
from datetime import datetime, timedelta
import pandas as pd
from agents.research_agent import ResearchAgent
import asyncio

def get_market_data():
    """Fetch current market data from yfinance"""
    
    print("\n" + "="*80)
    print("📊 REAL-TIME MARKET DATA")
    print("="*80)
    print(f"🕐 Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80 + "\n")
    
    # Key indices to track
    indices = {
        "^GSPC": "S&P 500",
        "^DJI": "Dow Jones",
        "^IXIC": "NASDAQ",
        "^VIX": "VIX (Volatility)",
        "^NSEI": "NIFTY 50",
        "^NSEBANK": "Bank NIFTY",
        "CL=F": "Crude Oil",
        "GC=F": "Gold",
        "BTC-USD": "Bitcoin",
        "ETH-USD": "Ethereum"
    }
    
    # Tech stocks
    stocks = {
        "AAPL": "Apple",
        "MSFT": "Microsoft",
        "GOOGL": "Google",
        "AMZN": "Amazon",
        "NVDA": "NVIDIA",
        "TSLA": "Tesla",
        "META": "Meta",
        "AMD": "AMD"
    }
    
    print("🌍 GLOBAL INDICES:")
    print("-" * 40)
    
    for symbol, name in indices.items():
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Get current price
            current_price = info.get('regularMarketPrice') or info.get('previousClose', 0)
            prev_close = info.get('regularMarketPreviousClose') or info.get('previousClose', 0)
            
            if current_price and prev_close:
                change = current_price - prev_close
                change_pct = (change / prev_close) * 100 if prev_close != 0 else 0
                
                # Color coding
                arrow = "🔺" if change > 0 else "🔻" if change < 0 else "➡️"
                
                print(f"{arrow} {name:15} ${current_price:10,.2f} "
                      f"({change:+8.2f} | {change_pct:+6.2f}%)")
            else:
                # Try getting data from history
                hist = ticker.history(period="1d")
                if not hist.empty:
                    current_price = hist['Close'].iloc[-1]
                    print(f"➡️ {name:15} ${current_price:10,.2f}")
                
        except Exception as e:
            print(f"❌ {name:15} Data unavailable")
    
    print("\n💻 TECH STOCKS:")
    print("-" * 40)
    
    for symbol, name in stocks.items():
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            current_price = info.get('regularMarketPrice') or info.get('previousClose', 0)
            prev_close = info.get('regularMarketPreviousClose') or info.get('previousClose', 0)
            
            if current_price and prev_close:
                change = current_price - prev_close
                change_pct = (change / prev_close) * 100 if prev_close != 0 else 0
                
                arrow = "🔺" if change > 0 else "🔻" if change < 0 else "➡️"
                
                print(f"{arrow} {name:15} ${current_price:10,.2f} "
                      f"({change:+8.2f} | {change_pct:+6.2f}%)")
            else:
                hist = ticker.history(period="1d")
                if not hist.empty:
                    current_price = hist['Close'].iloc[-1]
                    print(f"➡️ {name:15} ${current_price:10,.2f}")
                    
        except Exception as e:
            print(f"❌ {name:15} Data unavailable")
    
    # Market summary
    print("\n📈 MARKET SUMMARY:")
    print("-" * 40)
    
    # Get VIX for volatility check
    try:
        vix = yf.Ticker("^VIX")
        vix_info = vix.info
        vix_price = vix_info.get('regularMarketPrice') or vix_info.get('previousClose', 0)
        
        if vix_price:
            if vix_price < 15:
                print(f"✅ Market Volatility: LOW (VIX: {vix_price:.2f})")
            elif vix_price < 25:
                print(f"⚠️ Market Volatility: MODERATE (VIX: {vix_price:.2f})")
            else:
                print(f"🚨 Market Volatility: HIGH (VIX: {vix_price:.2f})")
    except:
        pass
    
    # Crypto sentiment
    try:
        btc = yf.Ticker("BTC-USD")
        btc_info = btc.info
        btc_price = btc_info.get('regularMarketPrice') or btc_info.get('previousClose', 0)
        
        if btc_price:
            if btc_price > 50000:
                print(f"🚀 Crypto Market: BULLISH (BTC: ${btc_price:,.0f})")
            elif btc_price > 30000:
                print(f"➡️ Crypto Market: NEUTRAL (BTC: ${btc_price:,.0f})")
            else:
                print(f"🐻 Crypto Market: BEARISH (BTC: ${btc_price:,.0f})")
    except:
        pass
    
    print("\n" + "="*80)
    print("💡 Dashboard available at: http://localhost:5001")
    print("🔄 Run 'python run.py scan' for detailed analysis")
    print("📊 Run 'python run.py abid' for options analysis")
    print("="*80 + "\n")

if __name__ == "__main__":
    get_market_data()