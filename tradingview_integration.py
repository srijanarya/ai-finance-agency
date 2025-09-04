#!/usr/bin/env python3
"""
TradingView Integration for AI Finance Agency
Uses multiple methods to fetch live data from TradingView
"""

import json
import time
import requests
import pandas as pd
from datetime import datetime
from typing import Dict, List, Optional
import asyncio
import websocket
import random
import string

class TradingViewDataFetcher:
    """Fetches live market data from TradingView"""
    
    def __init__(self):
        self.session = self._generate_session()
        self.ws_url = "wss://data.tradingview.com/socket.io/websocket"
        
    def _generate_session(self) -> str:
        """Generate a random session ID"""
        return 'qs_' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=12))
    
    def get_live_quote(self, symbol: str) -> Dict:
        """
        Fetch live quote using TradingView's public websocket
        Symbols: NSE:NIFTY, NSE:SBIN, NSE:RELIANCE, etc.
        """
        try:
            # Method 1: Using tradingview-ta library (easiest)
            from tradingview_ta import TA_Handler, Interval
            
            # Parse symbol
            exchange, ticker = symbol.split(':') if ':' in symbol else ('NSE', symbol)
            
            handler = TA_Handler(
                symbol=ticker,
                exchange=exchange,
                screener="india",  # For Indian stocks
                interval=Interval.INTERVAL_1_MINUTE
            )
            
            analysis = handler.get_analysis()
            
            return {
                'symbol': symbol,
                'price': analysis.indicators.get('close'),
                'change': analysis.indicators.get('change'),
                'volume': analysis.indicators.get('volume'),
                'high': analysis.indicators.get('high'),
                'low': analysis.indicators.get('low'),
                'open': analysis.indicators.get('open'),
                'recommendation': analysis.summary.get('RECOMMENDATION'),
                'buy_signals': analysis.summary.get('BUY'),
                'sell_signals': analysis.summary.get('SELL'),
                'neutral_signals': analysis.summary.get('NEUTRAL'),
                'rsi': analysis.indicators.get('RSI'),
                'macd': analysis.indicators.get('MACD.macd'),
                'timestamp': datetime.now().isoformat()
            }
            
        except ImportError:
            print("Installing required library...")
            import subprocess
            subprocess.check_call(['pip', 'install', 'tradingview-ta'])
            return self.get_live_quote(symbol)  # Retry after installation
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None
    
    def get_multiple_quotes(self, symbols: List[str]) -> List[Dict]:
        """Fetch quotes for multiple symbols"""
        quotes = []
        for symbol in symbols:
            quote = self.get_live_quote(symbol)
            if quote:
                quotes.append(quote)
            time.sleep(2)  # Increased rate limiting to avoid 429 errors
        return quotes
    
    def get_market_overview(self) -> Dict:
        """Get Indian market overview"""
        indices = [
            'NSE:NIFTY',
            'NSE:BANKNIFTY', 
            'BSE:SENSEX',
            'NSE:NIFTYIT',
            'NSE:FINNIFTY'
        ]
        
        overview = {
            'timestamp': datetime.now().isoformat(),
            'indices': self.get_multiple_quotes(indices),
            'market_status': self._get_market_status()
        }
        
        return overview
    
    def get_options_data(self, symbol: str, expiry: Optional[str] = None) -> Dict:
        """Fetch options chain data"""
        base_symbol = symbol.replace('NSE:', '')
        
        # Get spot price first
        spot_data = self.get_live_quote(symbol)
        if not spot_data:
            return None
            
        spot_price = spot_data['price']
        
        # Calculate ATM strike
        if base_symbol == 'NIFTY':
            atm_strike = round(spot_price / 50) * 50
        elif base_symbol == 'BANKNIFTY':
            atm_strike = round(spot_price / 100) * 100
        else:
            atm_strike = round(spot_price / 100) * 100
        
        # Generate option symbols
        option_data = {
            'spot_price': spot_price,
            'atm_strike': atm_strike,
            'timestamp': datetime.now().isoformat(),
            'calls': [],
            'puts': []
        }
        
        # Fetch data for 5 strikes around ATM
        for i in range(-2, 3):
            if base_symbol == 'NIFTY':
                strike = atm_strike + (i * 50)
            else:
                strike = atm_strike + (i * 100)
            
            call_symbol = f"NSE:{base_symbol}{strike}CE"
            put_symbol = f"NSE:{base_symbol}{strike}PE"
            
            # Note: Actual option symbols would need proper expiry format
            # This is simplified for demonstration
            
            option_data['calls'].append({
                'strike': strike,
                'symbol': call_symbol,
                'moneyness': 'ITM' if strike < spot_price else 'OTM' if strike > spot_price else 'ATM'
            })
            
            option_data['puts'].append({
                'strike': strike, 
                'symbol': put_symbol,
                'moneyness': 'ITM' if strike > spot_price else 'OTM' if strike < spot_price else 'ATM'
            })
        
        return option_data
    
    def _get_market_status(self) -> str:
        """Check if Indian markets are open"""
        now = datetime.now()
        weekday = now.weekday()
        current_time = now.time()
        
        # Market closed on weekends
        if weekday >= 5:
            return "CLOSED - Weekend"
        
        # Check market hours (9:15 AM to 3:30 PM IST)
        from datetime import time
        market_open = time(9, 15)
        market_close = time(15, 30)
        
        if market_open <= current_time <= market_close:
            return "OPEN"
        elif current_time < market_open:
            return "PRE-MARKET"
        else:
            return "CLOSED"

def test_tradingview_integration():
    """Test the TradingView integration"""
    print("\n" + "="*60)
    print("🎯 TRADINGVIEW PREMIUM DATA INTEGRATION TEST")
    print("="*60)
    
    fetcher = TradingViewDataFetcher()
    
    # Test 1: Get single quote
    print("\n📊 Fetching NIFTY 50 Live Data...")
    nifty_data = fetcher.get_live_quote('NSE:NIFTY')
    if nifty_data:
        print(f"✅ NIFTY Price: {nifty_data['price']}")
        print(f"   Change: {nifty_data['change']}")
        print(f"   Volume: {nifty_data['volume']}")
        print(f"   RSI: {nifty_data['rsi']}")
        print(f"   Signal: {nifty_data['recommendation']}")
    
    # Test 2: Get market overview
    print("\n📈 Fetching Market Overview...")
    overview = fetcher.get_market_overview()
    print(f"✅ Market Status: {overview['market_status']}")
    for index in overview['indices']:
        if index:
            print(f"   {index['symbol']}: {index['price']}")
    
    # Test 3: Get options data
    print("\n🎯 Fetching Options Chain...")
    options = fetcher.get_options_data('NSE:NIFTY')
    if options:
        print(f"✅ Spot Price: {options['spot_price']}")
        print(f"   ATM Strike: {options['atm_strike']}")
        print(f"   Option Strikes Generated: {len(options['calls'])} calls, {len(options['puts'])} puts")
    
    print("\n✨ TradingView Integration Ready!")
    print("="*60)
    
    return {
        'status': 'success',
        'nifty_data': nifty_data,
        'market_overview': overview,
        'options_data': options
    }

if __name__ == "__main__":
    test_tradingview_integration()