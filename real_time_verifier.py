#!/usr/bin/env python3
"""
Real-Time Market Data Verifier
Ensures all posts contain accurate, current information
"""

import yfinance as yf
import requests
from datetime import datetime, timedelta
import pytz
from typing import Dict, Tuple, Optional
import json

class MarketDataVerifier:
    def __init__(self):
        self.ist = pytz.timezone('Asia/Kolkata')
        self.market_open = 9  # 9:15 AM
        self.market_close = 15  # 3:30 PM
        
        # NSE/BSE stock symbols mapping
        self.symbol_map = {
            'RELIANCE': 'RELIANCE.NS',
            'TCS': 'TCS.NS',
            'INFY': 'INFY.NS',
            'HDFC': 'HDFC.NS',
            'HDFCBANK': 'HDFCBANK.NS',
            'ICICIBANK': 'ICICIBANK.NS',
            'SBIN': 'SBIN.NS',
            'ITC': 'ITC.NS',
            'WIPRO': 'WIPRO.NS',
            'BAJFINANCE': 'BAJFINANCE.NS',
            'NIFTY': '^NSEI',
            'SENSEX': '^BSESN'
        }
    
    def get_real_time_price(self, symbol: str) -> Dict:
        """Get real-time stock data"""
        try:
            # Convert to Yahoo Finance symbol
            yf_symbol = self.symbol_map.get(symbol, f"{symbol}.NS")
            
            # Get stock data
            stock = yf.Ticker(yf_symbol)
            
            # Get latest data
            info = stock.info
            history = stock.history(period="5d")
            
            if history.empty:
                return None
            
            # Current data
            current_price = history['Close'][-1]
            prev_close = history['Close'][-2] if len(history) > 1 else current_price
            change = current_price - prev_close
            change_pct = (change / prev_close) * 100
            
            # Get day's high/low
            today_data = stock.history(period="1d")
            
            return {
                'symbol': symbol,
                'current_price': round(current_price, 2),
                'prev_close': round(prev_close, 2),
                'change': round(change, 2),
                'change_percent': round(change_pct, 2),
                'day_high': round(today_data['High'][0], 2) if not today_data.empty else current_price,
                'day_low': round(today_data['Low'][0], 2) if not today_data.empty else current_price,
                'volume': int(today_data['Volume'][0]) if not today_data.empty else 0,
                'timestamp': datetime.now(self.ist),
                'market_status': self.get_market_status()
            }
        except Exception as e:
            print(f"Error fetching {symbol}: {e}")
            return None
    
    def get_market_status(self) -> str:
        """Check if market is open"""
        now = datetime.now(self.ist)
        current_hour = now.hour
        
        # Check if weekend
        if now.weekday() in [5, 6]:  # Saturday, Sunday
            return "CLOSED (Weekend)"
        
        # Check market hours
        if current_hour < 9:
            return "PRE-MARKET"
        elif 9 <= current_hour < 15 or (current_hour == 15 and now.minute <= 30):
            return "OPEN"
        else:
            return "CLOSED"
    
    def verify_content(self, content: str, stock_symbol: str = None) -> Tuple[bool, str]:
        """Verify if content is accurate"""
        if not stock_symbol:
            # Try to extract stock symbol from content
            for symbol in self.symbol_map.keys():
                if symbol in content.upper():
                    stock_symbol = symbol
                    break
        
        if not stock_symbol:
            return True, "No specific stock data to verify"
        
        # Get real data
        real_data = self.get_real_time_price(stock_symbol)
        
        if not real_data:
            return False, f"Could not verify {stock_symbol} data"
        
        # Check for false claims in content
        issues = []
        
        # Check if content mentions wrong direction
        if "crash" in content.lower() and real_data['change_percent'] > 0:
            issues.append(f"{stock_symbol} is actually UP {real_data['change_percent']}%, not crashing")
        
        if "surge" in content.lower() and real_data['change_percent'] < 0:
            issues.append(f"{stock_symbol} is actually DOWN {real_data['change_percent']}%, not surging")
        
        # Check for outdated prices
        if str(int(real_data['current_price'])) not in content and stock_symbol in content:
            issues.append(f"Current price is ₹{real_data['current_price']}, content may have old price")
        
        if issues:
            return False, "; ".join(issues)
        
        return True, "Content verified"
    
    def generate_accurate_content(self, symbol: str) -> str:
        """Generate accurate, real-time content"""
        data = self.get_real_time_price(symbol)
        
        if not data:
            return None
        
        # Determine the narrative
        if data['change_percent'] > 2:
            action = "surges"
            emoji = "🚀"
            sentiment = "bullish momentum"
        elif data['change_percent'] > 0:
            action = "gains"
            emoji = "📈"
            sentiment = "positive sentiment"
        elif data['change_percent'] < -2:
            action = "falls"
            emoji = "📉"
            sentiment = "bearish pressure"
        elif data['change_percent'] < 0:
            action = "dips"
            emoji = "📊"
            sentiment = "mild weakness"
        else:
            action = "steady"
            emoji = "➡️"
            sentiment = "consolidation"
        
        content = f"""{emoji} LIVE UPDATE: {symbol}

Current: ₹{data['current_price']} ({data['change_percent']:+.2f}%)
Day Range: ₹{data['day_low']} - ₹{data['day_high']}
Volume: {data['volume']:,}

{symbol} {action} amid {sentiment}. 

Key Levels:
• Support: ₹{round(data['day_low'] * 0.98, 0)}
• Resistance: ₹{round(data['day_high'] * 1.02, 0)}

Market Status: {data['market_status']}
Updated: {data['timestamp'].strftime('%I:%M %p')}

@AIFinanceNews2024
"""
        return content
    
    def get_top_movers(self) -> str:
        """Get actual top gainers and losers"""
        # Major stocks to check
        stocks = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN', 'WIPRO', 'ITC']
        
        movers = []
        for symbol in stocks:
            data = self.get_real_time_price(symbol)
            if data:
                movers.append({
                    'symbol': symbol,
                    'change': data['change_percent'],
                    'price': data['current_price']
                })
        
        # Sort by change percentage
        movers.sort(key=lambda x: x['change'], reverse=True)
        
        content = "📊 MARKET MOVERS (LIVE)\n\n"
        content += "🟢 TOP GAINERS:\n"
        
        for stock in movers[:3]:
            if stock['change'] > 0:
                content += f"• {stock['symbol']}: ₹{stock['price']} (+{stock['change']:.1f}%)\n"
        
        content += "\n🔴 TOP LOSERS:\n"
        
        for stock in reversed(movers[-3:]):
            if stock['change'] < 0:
                content += f"• {stock['symbol']}: ₹{stock['price']} ({stock['change']:.1f}%)\n"
        
        content += f"\nUpdated: {datetime.now(self.ist).strftime('%I:%M %p IST')}\n"
        content += "@AIFinanceNews2024"
        
        return content

def main():
    verifier = MarketDataVerifier()
    
    print("🔍 REAL-TIME MARKET VERIFIER")
    print("="*50)
    
    # Test with RELIANCE
    print("\n1. Checking RELIANCE...")
    data = verifier.get_real_time_price('RELIANCE')
    if data:
        print(f"   Current Price: ₹{data['current_price']}")
        print(f"   Change: {data['change_percent']:+.2f}%")
        print(f"   Status: {data['market_status']}")
    
    # Generate accurate content
    print("\n2. Generating accurate content...")
    content = verifier.generate_accurate_content('RELIANCE')
    if content:
        print(content)
    
    # Get top movers
    print("\n3. Getting top movers...")
    movers = verifier.get_top_movers()
    print(movers)
    
    # Verify the wrong content
    wrong_content = "Reliance share price crashes over 2% to 4-month low"
    is_valid, message = verifier.verify_content(wrong_content, 'RELIANCE')
    
    print("\n4. Verification Result:")
    print(f"   Content: {wrong_content}")
    print(f"   Valid: {is_valid}")
    print(f"   Issue: {message}")

if __name__ == "__main__":
    main()