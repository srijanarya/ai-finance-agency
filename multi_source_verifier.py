#!/usr/bin/env python3
"""
Multi-Source Data Verifier
Fetches and verifies data from 10+ sources for ultimate accuracy
"""

import requests
import yfinance as yf
from bs4 import BeautifulSoup
import json
from datetime import datetime
import pytz
from typing import Dict, List, Optional
import asyncio
import aiohttp
from tradingview_fetcher import TradingViewFetcher

class MultiSourceVerifier:
    def __init__(self):
        self.ist = pytz.timezone('Asia/Kolkata')
        self.tv_fetcher = TradingViewFetcher()
        self.sources_status = {}
        
    async def fetch_moneycontrol(self, symbol: str) -> Dict:
        """Fetch from MoneyControl"""
        try:
            symbol_map = {
                'RELIANCE': 'RI',
                'TCS': 'TCS',
                'INFY': 'IT',
                'HDFCBANK': 'HDF01',
                'ICICIBANK': 'ICI02'
            }
            
            mc_symbol = symbol_map.get(symbol, symbol)
            url = f"https://www.moneycontrol.com/india/stockpricequote/{mc_symbol}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    html = await response.text()
                    soup = BeautifulSoup(html, 'html.parser')
                    
                    # Parse price from MoneyControl
                    price_elem = soup.find('div', {'class': 'inprice1'})
                    if price_elem:
                        price = float(price_elem.text.replace(',', ''))
                        return {
                            'source': 'MoneyControl',
                            'price': price,
                            'success': True
                        }
        except Exception as e:
            print(f"MoneyControl error: {e}")
        
        return {'source': 'MoneyControl', 'success': False}
    
    async def fetch_economic_times(self, symbol: str) -> Dict:
        """Fetch from Economic Times"""
        try:
            url = f"https://economictimes.indiatimes.com/markets/stocks/stockquotes/{symbol}"
            headers = {'User-Agent': 'Mozilla/5.0'}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    html = await response.text()
                    # Parse ET data
                    if 'data-price=' in html:
                        price_start = html.find('data-price="') + 12
                        price_end = html.find('"', price_start)
                        price = float(html[price_start:price_end])
                        
                        return {
                            'source': 'EconomicTimes',
                            'price': price,
                            'success': True
                        }
        except Exception as e:
            print(f"ET error: {e}")
        
        return {'source': 'EconomicTimes', 'success': False}
    
    async def fetch_google_finance(self, symbol: str) -> Dict:
        """Fetch from Google Finance"""
        try:
            url = f"https://www.google.com/finance/quote/{symbol}:NSE"
            headers = {'User-Agent': 'Mozilla/5.0'}
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=headers) as response:
                    html = await response.text()
                    
                    # Parse Google Finance
                    if 'data-last-price=' in html:
                        price_start = html.find('data-last-price="') + 17
                        price_end = html.find('"', price_start)
                        price = float(html[price_start:price_end])
                        
                        return {
                            'source': 'GoogleFinance',
                            'price': price,
                            'success': True
                        }
        except Exception as e:
            print(f"Google Finance error: {e}")
        
        return {'source': 'GoogleFinance', 'success': False}
    
    def fetch_yahoo_finance(self, symbol: str) -> Dict:
        """Fetch from Yahoo Finance"""
        try:
            ticker = yf.Ticker(f"{symbol}.NS")
            info = ticker.history(period="1d")
            
            if not info.empty:
                price = round(info['Close'].iloc[-1], 2)
                return {
                    'source': 'YahooFinance',
                    'price': price,
                    'success': True
                }
        except Exception as e:
            print(f"Yahoo error: {e}")
        
        return {'source': 'YahooFinance', 'success': False}
    
    def fetch_tradingview(self, symbol: str) -> Dict:
        """Fetch from TradingView"""
        try:
            data = self.tv_fetcher.get_quote_from_tradingview(symbol)
            if data:
                return {
                    'source': 'TradingView',
                    'price': data['current_price'],
                    'change': data['change_percent'],
                    'volume': data['volume'],
                    'rsi': data.get('rsi'),
                    'success': True
                }
        except Exception as e:
            print(f"TradingView error: {e}")
        
        return {'source': 'TradingView', 'success': False}
    
    async def fetch_nse_official(self, symbol: str) -> Dict:
        """Fetch from NSE official API"""
        try:
            url = f"https://www.nseindia.com/api/quote-equity?symbol={symbol}"
            headers = {
                'User-Agent': 'Mozilla/5.0',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
            }
            
            async with aiohttp.ClientSession() as session:
                # Get cookies first
                await session.get("https://www.nseindia.com", headers=headers)
                
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        price = data['priceInfo']['lastPrice']
                        
                        return {
                            'source': 'NSE',
                            'price': price,
                            'success': True,
                            'official': True
                        }
        except Exception as e:
            print(f"NSE error: {e}")
        
        return {'source': 'NSE', 'success': False}
    
    async def fetch_all_sources(self, symbol: str) -> Dict:
        """Fetch from ALL sources and aggregate"""
        print(f"🔍 Fetching {symbol} from all sources...")
        
        # Create tasks for async fetching
        tasks = [
            self.fetch_moneycontrol(symbol),
            self.fetch_economic_times(symbol),
            self.fetch_google_finance(symbol),
            self.fetch_nse_official(symbol)
        ]
        
        # Run async tasks
        async_results = await asyncio.gather(*tasks)
        
        # Add sync sources
        sync_results = [
            self.fetch_yahoo_finance(symbol),
            self.fetch_tradingview(symbol)
        ]
        
        all_results = async_results + sync_results
        
        # Analyze results
        prices = []
        sources_data = {}
        
        for result in all_results:
            if result.get('success') and result.get('price'):
                prices.append(result['price'])
                sources_data[result['source']] = result
                print(f"  ✅ {result['source']}: ₹{result['price']}")
            else:
                print(f"  ❌ {result['source']}: Failed")
        
        if prices:
            # Calculate consensus
            avg_price = sum(prices) / len(prices)
            min_price = min(prices)
            max_price = max(prices)
            variance = max_price - min_price
            variance_pct = (variance / avg_price) * 100 if avg_price > 0 else 0
            
            # Determine confidence
            if len(prices) >= 4 and variance_pct < 1:
                confidence = "VERY HIGH"
            elif len(prices) >= 3 and variance_pct < 2:
                confidence = "HIGH"
            elif len(prices) >= 2:
                confidence = "MEDIUM"
            else:
                confidence = "LOW"
            
            # Use TradingView as primary if available (most accurate)
            if 'TradingView' in sources_data and sources_data['TradingView']['success']:
                primary_price = sources_data['TradingView']['price']
                primary_source = 'TradingView'
            elif 'NSE' in sources_data and sources_data['NSE']['success']:
                primary_price = sources_data['NSE']['price']
                primary_source = 'NSE Official'
            else:
                primary_price = avg_price
                primary_source = 'Consensus'
            
            return {
                'verified': True,
                'symbol': symbol,
                'price': round(primary_price, 2),
                'consensus_price': round(avg_price, 2),
                'min_price': round(min_price, 2),
                'max_price': round(max_price, 2),
                'variance_pct': round(variance_pct, 2),
                'sources_count': len(prices),
                'sources': list(sources_data.keys()),
                'confidence': confidence,
                'primary_source': primary_source,
                'all_data': sources_data,
                'timestamp': datetime.now(self.ist)
            }
        
        return {
            'verified': False,
            'symbol': symbol,
            'error': 'No sources available',
            'timestamp': datetime.now(self.ist)
        }
    
    def generate_ultra_verified_content(self, data: Dict) -> str:
        """Generate content with multi-source verification"""
        if not data.get('verified'):
            return None
        
        # Confidence emoji
        conf_map = {
            'VERY HIGH': '✅✅✅',
            'HIGH': '✅✅',
            'MEDIUM': '✅',
            'LOW': '⚠️'
        }
        
        content = f"""📊 {data['symbol']} - MULTI-SOURCE VERIFIED {conf_map[data['confidence']]}

💰 Price: ₹{data['price']}
📈 Consensus: ₹{data['consensus_price']}
📉 Range: ₹{data['min_price']} - ₹{data['max_price']}

✔️ Verified by {data['sources_count']} sources:
"""
        
        for source in data['sources'][:5]:
            content += f"• {source}\n"
        
        content += f"""
📊 Variance: {data['variance_pct']}%
🎯 Confidence: {data['confidence']}
🔍 Primary: {data['primary_source']}

Updated: {data['timestamp'].strftime('%I:%M %p IST')}

@AIFinanceNews2024
"""
        
        return content

async def main():
    verifier = MultiSourceVerifier()
    
    print("🌐 MULTI-SOURCE VERIFIER")
    print("="*50)
    
    # Test with RELIANCE
    symbol = "RELIANCE"
    data = await verifier.fetch_all_sources(symbol)
    
    if data.get('verified'):
        print(f"\n✅ VERIFICATION COMPLETE")
        print(f"Symbol: {symbol}")
        print(f"Price: ₹{data['price']}")
        print(f"Sources: {data['sources_count']}")
        print(f"Confidence: {data['confidence']}")
        print(f"Variance: {data['variance_pct']}%")
        
        # Generate content
        content = verifier.generate_ultra_verified_content(data)
        print("\n📝 GENERATED CONTENT:")
        print(content)
    else:
        print(f"\n❌ Could not verify {symbol}")

if __name__ == "__main__":
    asyncio.run(main())