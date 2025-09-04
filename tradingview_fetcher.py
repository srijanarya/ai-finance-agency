#!/usr/bin/env python3
"""
TradingView Data Fetcher - More accurate for Indian markets
Fetches real-time data from TradingView for NSE/BSE stocks
"""

import requests
import json
from datetime import datetime
import pytz
from typing import Dict, List, Optional

class TradingViewFetcher:
    def __init__(self):
        self.ist = pytz.timezone('Asia/Kolkata')
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://www.tradingview.com',
            'Referer': 'https://www.tradingview.com/'
        }
        
        # TradingView symbol mapping for Indian stocks
        self.symbol_map = {
            'RELIANCE': 'NSE:RELIANCE',
            'TCS': 'NSE:TCS',
            'INFY': 'NSE:INFY',
            'HDFCBANK': 'NSE:HDFCBANK',
            'HDFC': 'NSE:HDFC',
            'ICICIBANK': 'NSE:ICICIBANK',
            'SBIN': 'NSE:SBIN',
            'ITC': 'NSE:ITC',
            'WIPRO': 'NSE:WIPRO',
            'BAJFINANCE': 'NSE:BAJFINANCE',
            'LT': 'NSE:LT',
            'MARUTI': 'NSE:MARUTI',
            'AXISBANK': 'NSE:AXISBANK',
            'KOTAKBANK': 'NSE:KOTAKBANK',
            'NIFTY': 'NSE:NIFTY',
            'BANKNIFTY': 'NSE:BANKNIFTY',
            'SENSEX': 'BSE:SENSEX'
        }
    
    def get_quote_from_tradingview(self, symbol: str) -> Dict:
        """
        Fetch real-time data from TradingView scanner API
        """
        try:
            # Convert to TradingView format
            tv_symbol = self.symbol_map.get(symbol, f"NSE:{symbol}")
            
            # TradingView scanner API endpoint
            url = "https://scanner.tradingview.com/india/scan"
            
            payload = {
                "symbols": {
                    "tickers": [tv_symbol],
                    "query": {
                        "types": []
                    }
                },
                "columns": [
                    "name",
                    "close",
                    "change",
                    "change_abs",
                    "high",
                    "low",
                    "volume",
                    "Recommend.All",
                    "description",
                    "open",
                    "Perf.W",
                    "Perf.1M",
                    "Perf.3M",
                    "Perf.6M",
                    "Perf.Y",
                    "Volatility.D",
                    "RSI",
                    "RSI[1]"
                ]
            }
            
            response = requests.post(url, json=payload, headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'data' in data and len(data['data']) > 0:
                    stock_data = data['data'][0]['d']
                    
                    # Parse the response
                    return {
                        'symbol': symbol,
                        'name': stock_data[0] if len(stock_data) > 0 else symbol,
                        'current_price': round(stock_data[1], 2) if len(stock_data) > 1 else 0,
                        'change_percent': round(stock_data[2], 2) if len(stock_data) > 2 else 0,
                        'change_abs': round(stock_data[3], 2) if len(stock_data) > 3 else 0,
                        'day_high': round(stock_data[4], 2) if len(stock_data) > 4 else 0,
                        'day_low': round(stock_data[5], 2) if len(stock_data) > 5 else 0,
                        'volume': int(stock_data[6]) if len(stock_data) > 6 else 0,
                        'recommendation': stock_data[7] if len(stock_data) > 7 else 0,
                        'description': stock_data[8] if len(stock_data) > 8 else '',
                        'open': round(stock_data[9], 2) if len(stock_data) > 9 else 0,
                        'perf_week': stock_data[10] if len(stock_data) > 10 else 0,
                        'perf_month': stock_data[11] if len(stock_data) > 11 else 0,
                        'rsi': round(stock_data[16], 2) if len(stock_data) > 16 else 50,
                        'timestamp': datetime.now(self.ist),
                        'source': 'TradingView'
                    }
            
            return None
            
        except Exception as e:
            print(f"Error fetching from TradingView: {e}")
            return None
    
    def get_market_movers(self) -> Dict:
        """
        Get top gainers and losers from NSE
        """
        try:
            url = "https://scanner.tradingview.com/india/scan"
            
            # Get top gainers
            gainers_payload = {
                "filter": [
                    {"left": "change", "operation": "greater", "right": 0},
                    {"left": "volume", "operation": "greater", "right": 1000000}
                ],
                "options": {
                    "lang": "en"
                },
                "markets": ["india"],
                "symbols": {
                    "query": {
                        "types": []
                    },
                    "tickers": []
                },
                "columns": [
                    "name",
                    "close",
                    "change",
                    "volume",
                    "market_cap_basic"
                ],
                "sort": {
                    "sortBy": "change",
                    "sortOrder": "desc"
                },
                "range": [0, 5]
            }
            
            response = requests.post(url, json=gainers_payload, headers=self.headers)
            
            gainers = []
            losers = []
            
            if response.status_code == 200:
                data = response.json()
                if 'data' in data:
                    for item in data['data'][:5]:
                        stock_info = item['d']
                        gainers.append({
                            'symbol': stock_info[0],
                            'price': round(stock_info[1], 2),
                            'change': round(stock_info[2], 2)
                        })
            
            # Get top losers (change sort order)
            losers_payload = gainers_payload.copy()
            losers_payload['filter'][0] = {"left": "change", "operation": "less", "right": 0}
            losers_payload['sort']['sortOrder'] = "asc"
            
            response = requests.post(url, json=losers_payload, headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                if 'data' in data:
                    for item in data['data'][:5]:
                        stock_info = item['d']
                        losers.append({
                            'symbol': stock_info[0],
                            'price': round(stock_info[1], 2),
                            'change': round(stock_info[2], 2)
                        })
            
            return {
                'gainers': gainers,
                'losers': losers,
                'timestamp': datetime.now(self.ist)
            }
            
        except Exception as e:
            print(f"Error fetching market movers: {e}")
            return {'gainers': [], 'losers': []}
    
    def get_nifty_data(self) -> Dict:
        """
        Get NIFTY 50 and BANK NIFTY data
        """
        nifty = self.get_quote_from_tradingview('NIFTY')
        banknifty = self.get_quote_from_tradingview('BANKNIFTY')
        sensex = self.get_quote_from_tradingview('SENSEX')
        
        return {
            'NIFTY50': nifty,
            'BANKNIFTY': banknifty,
            'SENSEX': sensex
        }
    
    def generate_accurate_content(self, symbol: str) -> str:
        """
        Generate content with TradingView data
        """
        data = self.get_quote_from_tradingview(symbol)
        
        if not data:
            return None
        
        # Determine sentiment based on recommendation score
        rec_score = data.get('recommendation', 0)
        if rec_score > 0.1:
            sentiment = "BUY signal"
            emoji = "🟢"
        elif rec_score < -0.1:
            sentiment = "SELL signal"
            emoji = "🔴"
        else:
            sentiment = "NEUTRAL"
            emoji = "⚪"
        
        # Determine trend
        if data['change_percent'] > 1:
            trend = "strong uptrend"
            trend_emoji = "📈"
        elif data['change_percent'] > 0:
            trend = "mild uptrend"
            trend_emoji = "📊"
        elif data['change_percent'] < -1:
            trend = "strong downtrend"
            trend_emoji = "📉"
        elif data['change_percent'] < 0:
            trend = "mild downtrend"
            trend_emoji = "📊"
        else:
            trend = "sideways"
            trend_emoji = "➡️"
        
        content = f"""{trend_emoji} LIVE: {symbol}

Price: ₹{data['current_price']} ({data['change_percent']:+.2f}%)
Change: ₹{data['change_abs']:+.2f}
Range: ₹{data['day_low']} - ₹{data['day_high']}
Volume: {data['volume']:,}

📊 Technical Analysis:
• RSI: {data.get('rsi', 'N/A')} {'(Overbought)' if data.get('rsi', 50) > 70 else '(Oversold)' if data.get('rsi', 50) < 30 else ''}
• Trend: {trend}
• Signal: {emoji} {sentiment}

Performance:
• Week: {data.get('perf_week', 0):+.1f}%
• Month: {data.get('perf_month', 0):+.1f}%

Source: TradingView Live Data
Updated: {data['timestamp'].strftime('%I:%M %p IST')}

@AIFinanceNews2024"""
        
        return content
    
    def generate_market_summary(self) -> str:
        """
        Generate market summary with indices
        """
        indices = self.get_nifty_data()
        movers = self.get_market_movers()
        
        content = "📊 MARKET SUMMARY (LIVE)\n\n"
        content += "📈 INDICES:\n"
        
        for name, data in indices.items():
            if data:
                emoji = "🟢" if data['change_percent'] > 0 else "🔴"
                content += f"{emoji} {name}: {data['current_price']:,.2f} ({data['change_percent']:+.2f}%)\n"
        
        content += "\n🚀 TOP GAINERS:\n"
        for stock in movers['gainers'][:3]:
            content += f"• {stock['symbol']}: ₹{stock['price']} (+{stock['change']}%)\n"
        
        content += "\n📉 TOP LOSERS:\n"
        for stock in movers['losers'][:3]:
            content += f"• {stock['symbol']}: ₹{stock['price']} ({stock['change']}%)\n"
        
        content += f"\nSource: TradingView\n"
        content += f"Updated: {datetime.now(self.ist).strftime('%I:%M %p IST')}\n"
        content += "@AIFinanceNews2024"
        
        return content

def main():
    fetcher = TradingViewFetcher()
    
    print("📊 TRADINGVIEW DATA FETCHER")
    print("="*50)
    
    # Test with RELIANCE
    print("\n1. Fetching RELIANCE from TradingView...")
    data = fetcher.get_quote_from_tradingview('RELIANCE')
    if data:
        print(f"   Price: ₹{data['current_price']}")
        print(f"   Change: {data['change_percent']:+.2f}%")
        print(f"   Volume: {data['volume']:,}")
        print(f"   RSI: {data.get('rsi', 'N/A')}")
    
    # Generate content
    print("\n2. Generating content...")
    content = fetcher.generate_accurate_content('RELIANCE')
    if content:
        print(content)
    
    # Get market summary
    print("\n3. Market Summary...")
    summary = fetcher.generate_market_summary()
    print(summary)

if __name__ == "__main__":
    main()