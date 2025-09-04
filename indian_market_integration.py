#!/usr/bin/env python3
"""
Indian Market Integration - NSE/BSE Live Data
Integrates multiple Indian market data sources for real-time intelligence
"""

import requests
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import asyncio
import aiohttp
from typing import Dict, List, Optional
import sqlite3
from dataclasses import dataclass
import logging

@dataclass
class MarketData:
    symbol: str
    current_price: float
    change: float
    change_pct: float
    volume: int
    day_high: float
    day_low: float
    timestamp: datetime

class IndianMarketAPI:
    """
    Comprehensive Indian Market Data Integration
    Sources: NSE, BSE, Yahoo Finance, Multiple APIs
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.db_conn = sqlite3.connect('indian_market_data.db')
        self.setup_database()
        
        # Market sessions
        self.market_hours = {
            'pre_open': ('09:00', '09:15'),
            'regular': ('09:15', '15:30'),
            'post_close': ('15:40', '16:00')
        }
        
        # Key Indian indices and stocks  
        self.nse_indices = {
            'NIFTY': '^NSEI',
            'BANKNIFTY': '^NSEBANK',
            'FINNIFTY': 'NIFTY_FIN_SERVICE.NS'
            # Removing problematic midcap/smallcap symbols until we find working ones
        }
        
        self.top_stocks = {
            'RELIANCE': 'RELIANCE.NS',
            'TCS': 'TCS.NS',
            'HDFCBANK': 'HDFCBANK.NS',  # Use HDFCBANK instead of HDFC
            'INFY': 'INFY.NS',
            'ICICIBANK': 'ICICIBANK.NS',
            'KOTAKBANK': 'KOTAKBANK.NS',
            'SBIN': 'SBIN.NS',
            'ITC': 'ITC.NS',
            'LT': 'LT.NS',
            'WIPRO': 'WIPRO.NS'  # Replace problematic symbols
        }
    
    def setup_database(self):
        """Setup SQLite database for market data storage"""
        cursor = self.db_conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS market_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT,
                current_price REAL,
                change_value REAL,
                change_percent REAL,
                volume INTEGER,
                day_high REAL,
                day_low REAL,
                market_cap REAL,
                pe_ratio REAL,
                timestamp DATETIME,
                source TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS fii_dii_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE,
                fii_buy_value REAL,
                fii_sell_value REAL,
                fii_net_value REAL,
                dii_buy_value REAL,
                dii_sell_value REAL,
                dii_net_value REAL,
                timestamp DATETIME
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS options_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT,
                expiry_date DATE,
                strike_price REAL,
                option_type TEXT,
                open_interest INTEGER,
                change_in_oi INTEGER,
                volume INTEGER,
                implied_volatility REAL,
                timestamp DATETIME
            )
        """)
        
        self.db_conn.commit()
    
    async def get_live_market_data(self) -> Dict[str, MarketData]:
        """Get live market data for all major indices and stocks"""
        market_data = {}
        
        try:
            # Get indices data
            for name, symbol in self.nse_indices.items():
                data = await self._get_yfinance_data(symbol)
                if data:
                    market_data[name] = data
            
            # Get top stocks data
            for name, symbol in self.top_stocks.items():
                data = await self._get_yfinance_data(symbol)
                if data:
                    market_data[name] = data
            
            # Store in database
            self._store_market_data(market_data)
            
        except Exception as e:
            self.logger.error(f"Error fetching market data: {e}")
        
        return market_data
    
    async def _get_yfinance_data(self, symbol: str) -> Optional[MarketData]:
        """Fetch data from Yahoo Finance"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period="1d")
            
            if hist.empty:
                return None
            
            current_price = info.get('regularMarketPrice', hist['Close'].iloc[-1])
            prev_close = info.get('regularMarketPreviousClose', hist['Close'].iloc[-2] if len(hist) > 1 else current_price)
            
            change = current_price - prev_close
            change_pct = (change / prev_close) * 100 if prev_close != 0 else 0
            
            return MarketData(
                symbol=symbol,
                current_price=current_price,
                change=change,
                change_pct=change_pct,
                volume=info.get('regularMarketVolume', hist['Volume'].iloc[-1]),
                day_high=info.get('dayHigh', hist['High'].iloc[-1]),
                day_low=info.get('dayLow', hist['Low'].iloc[-1]),
                timestamp=datetime.now()
            )
            
        except Exception as e:
            self.logger.error(f"Error fetching data for {symbol}: {e}")
            return None
    
    async def get_nse_data_direct(self) -> Dict:
        """
        Direct NSE API integration (requires headers to avoid blocking)
        """
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
        
        nse_data = {}
        
        try:
            # NSE Indices API
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    'https://www.nseindia.com/api/allIndices', 
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        nse_data['indices'] = data.get('data', [])
                
                # Top gainers/losers
                async with session.get(
                    'https://www.nseindia.com/api/live-analysis-variations?index=gainers',
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        nse_data['gainers'] = data.get('NIFTY', {}).get('data', [])
                
                async with session.get(
                    'https://www.nseindia.com/api/live-analysis-variations?index=losers',
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        nse_data['losers'] = data.get('NIFTY', {}).get('data', [])
        
        except Exception as e:
            self.logger.error(f"NSE API error: {e}")
            # Fallback to Yahoo Finance
            return await self._get_fallback_data()
        
        return nse_data
    
    async def _get_fallback_data(self) -> Dict:
        """Fallback data source when NSE API fails - with timestamp validation"""
        try:
            # Only use fallback during market hours or within 30 minutes of market close
            now = datetime.now()
            market_start = now.replace(hour=9, minute=15, second=0, microsecond=0)
            market_end = now.replace(hour=16, minute=0, second=0, microsecond=0)  # 30min buffer after 3:30PM
            
            if not (market_start <= now <= market_end and now.weekday() < 5):
                self.logger.warning("Market closed - not generating fallback data to prevent stale content")
                return {}
            
            # Use Yahoo Finance as fallback with fresh data validation
            nifty = yf.Ticker('^NSEI')
            bank_nifty = yf.Ticker('^NSEBANK')
            
            # Validate data freshness
            nifty_hist = nifty.history(period="1d")
            if nifty_hist.empty or (now - nifty_hist.index[-1].to_pydatetime()).seconds > 1800:  # 30 minutes
                self.logger.warning("Yahoo Finance data too stale - skipping fallback")
                return {}
            
            # Get top stocks for gainers/losers
            top_stocks_data = []
            for name, symbol in list(self.top_stocks.items())[:10]:
                stock_data = await self._get_yfinance_data(symbol)
                if stock_data:
                    # Validate stock data timestamp
                    if (now - stock_data.timestamp).seconds < 1800:  # Fresh within 30 minutes
                        top_stocks_data.append({
                            'symbol': name,
                            'ltp': stock_data.current_price,
                            'netPrice': stock_data.change,
                            'pChange': stock_data.change_pct,
                            'timestamp': stock_data.timestamp.isoformat()
                        })
            
            if not top_stocks_data:
                self.logger.warning("No fresh stock data available - skipping fallback")
                return {}
            
            # Sort for gainers and losers
            gainers = sorted(top_stocks_data, key=lambda x: x['pChange'], reverse=True)[:5]
            losers = sorted(top_stocks_data, key=lambda x: x['pChange'])[:5]
            
            return {
                'indices': [
                    {'indexName': 'NIFTY 50', 'last': nifty.info.get('regularMarketPrice', 0), 'timestamp': now.isoformat()},
                    {'indexName': 'NIFTY BANK', 'last': bank_nifty.info.get('regularMarketPrice', 0), 'timestamp': now.isoformat()}
                ],
                'gainers': gainers,
                'losers': losers,
                'data_freshness': 'live_fallback',
                'generated_at': now.isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Fallback data error: {e}")
            return {}
    
    async def get_fii_dii_data(self) -> Dict:
        """
        Get FII/DII data (Foreign and Domestic Institutional Investor flows)
        """
        try:
            # NSE FII/DII data endpoint
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            async with aiohttp.ClientSession() as session:
                # Try NSE historical data API
                url = "https://www.nseindia.com/api/fiidiiTradeReact"
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_fii_dii_data(data)
            
            # Fallback: Mock data based on typical patterns
            return self._get_mock_fii_dii_data()
            
        except Exception as e:
            self.logger.error(f"FII/DII data error: {e}")
            return self._get_mock_fii_dii_data()
    
    def _parse_fii_dii_data(self, raw_data: Dict) -> Dict:
        """Parse FII/DII data from NSE API response"""
        try:
            # Handle both array and object response formats
            if isinstance(raw_data, list):
                fii_data = raw_data
            else:
                fii_data = raw_data.get('fiiDiiData', raw_data.get('data', []))
            
            if fii_data and len(fii_data) > 0:
                latest = fii_data[0] if isinstance(fii_data, list) else fii_data
                
                # Handle different API response structures
                if isinstance(latest, dict):
                    return {
                        'date': latest.get('date', latest.get('tradingDate', 'N/A')),
                        'fii': {
                            'buy': latest.get('fii', {}).get('buy', latest.get('fiiBuyValue', 0)),
                            'sell': latest.get('fii', {}).get('sell', latest.get('fiiSellValue', 0)),
                            'net': latest.get('fii', {}).get('net', latest.get('fiiNetValue', 0))
                        },
                        'dii': {
                            'buy': latest.get('dii', {}).get('buy', latest.get('diiBuyValue', 0)),
                            'sell': latest.get('dii', {}).get('sell', latest.get('diiSellValue', 0)),
                            'net': latest.get('dii', {}).get('net', latest.get('diiNetValue', 0))
                        }
                    }
        except Exception as e:
            self.logger.error(f"FII/DII parsing error: {e}")
            self.logger.error(f"Raw data structure: {type(raw_data)} - {str(raw_data)[:200]}...")
        
        return self._get_mock_fii_dii_data()
    
    def _get_mock_fii_dii_data(self) -> Dict:
        """NEVER generate mock data - return None to prevent stale content"""
        self.logger.warning("FII/DII API failed - returning None to prevent stale content")
        return None
    
    async def get_options_data(self, symbol: str = 'NIFTY') -> Dict:
        """Get options chain data for given symbol"""
        try:
            if symbol == 'NIFTY':
                ticker = yf.Ticker('^NSEI')
            elif symbol == 'BANKNIFTY':
                ticker = yf.Ticker('^NSEBANK')
            else:
                ticker = yf.Ticker(f'{symbol}.NS')
            
            options_dates = ticker.options
            if not options_dates:
                return {}
            
            # Get nearest expiry
            nearest_expiry = options_dates[0]
            option_chain = ticker.option_chain(nearest_expiry)
            
            # Calculate Put-Call Ratio
            calls_oi = option_chain.calls['openInterest'].sum()
            puts_oi = option_chain.puts['openInterest'].sum()
            pcr = puts_oi / calls_oi if calls_oi > 0 else 0
            
            return {
                'symbol': symbol,
                'expiry': nearest_expiry,
                'calls_oi': calls_oi,
                'puts_oi': puts_oi,
                'pcr': pcr,
                'max_pain': self._calculate_max_pain(option_chain),
                'timestamp': datetime.now()
            }
            
        except Exception as e:
            self.logger.error(f"Options data error for {symbol}: {e}")
            return {}
    
    def _calculate_max_pain(self, option_chain) -> float:
        """Calculate Max Pain point for options"""
        try:
            calls = option_chain.calls
            puts = option_chain.puts
            
            strikes = sorted(set(calls['strike'].tolist() + puts['strike'].tolist()))
            
            max_pain = 0
            min_total_loss = float('inf')
            
            for strike in strikes:
                total_loss = 0
                
                # Calculate loss for calls
                call_strikes = calls[calls['strike'] > strike]
                total_loss += ((call_strikes['strike'] - strike) * call_strikes['openInterest']).sum()
                
                # Calculate loss for puts
                put_strikes = puts[puts['strike'] < strike]
                total_loss += ((strike - put_strikes['strike']) * put_strikes['openInterest']).sum()
                
                if total_loss < min_total_loss:
                    min_total_loss = total_loss
                    max_pain = strike
            
            return max_pain
            
        except Exception as e:
            self.logger.error(f"Max pain calculation error: {e}")
            return 0
    
    def _store_market_data(self, market_data: Dict[str, MarketData]):
        """Store market data in database"""
        cursor = self.db_conn.cursor()
        
        for symbol, data in market_data.items():
            cursor.execute("""
                INSERT INTO market_data 
                (symbol, current_price, change_value, change_percent, volume, 
                 day_high, day_low, timestamp, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                symbol,
                data.current_price,
                data.change,
                data.change_pct,
                data.volume,
                data.day_high,
                data.day_low,
                data.timestamp,
                'yahoo_finance'
            ))
        
        self.db_conn.commit()
    
    def is_market_open(self) -> bool:
        """Check if market is currently open"""
        now = datetime.now().time()
        market_start = datetime.strptime('09:15', '%H:%M').time()
        market_end = datetime.strptime('15:30', '%H:%M').time()
        
        # Check if today is weekday (Monday = 0, Sunday = 6)
        is_weekday = datetime.now().weekday() < 5
        
        return is_weekday and market_start <= now <= market_end
    
    async def get_market_summary(self) -> Dict:
        """Get comprehensive market summary"""
        summary = {
            'timestamp': datetime.now(),
            'market_status': 'OPEN' if self.is_market_open() else 'CLOSED',
            'indices': {},
            'movers': {},
            'fii_dii': {},
            'options': {}
        }
        
        try:
            # Get live market data
            market_data = await self.get_live_market_data()
            
            # Format indices data
            for name in ['NIFTY', 'BANKNIFTY']:
                if name in market_data:
                    data = market_data[name]
                    summary['indices'][name] = {
                        'current': data.current_price,
                        'change': data.change,
                        'change_pct': data.change_pct,
                        'volume': data.volume
                    }
            
            # Get movers
            nse_data = await self.get_nse_data_direct()
            summary['movers'] = {
                'gainers': nse_data.get('gainers', [])[:5],
                'losers': nse_data.get('losers', [])[:5]
            }
            
            # Get FII/DII data
            summary['fii_dii'] = await self.get_fii_dii_data()
            
            # Get options data
            summary['options'] = await self.get_options_data('NIFTY')
            
        except Exception as e:
            self.logger.error(f"Market summary error: {e}")
        
        return summary

# Integration with existing content generation
class MarketContentIntegrator:
    """Integrate market data with content generation"""
    
    def __init__(self):
        self.market_api = IndianMarketAPI()
    
    async def generate_market_brief(self) -> str:
        """Generate market brief using live data with freshness validation"""
        summary = await self.market_api.get_market_summary()
        
        # Validate data freshness
        now = datetime.now()
        data_age = (now - summary['timestamp']).seconds
        
        # Don't generate content if data is older than 30 minutes during market hours
        if summary['market_status'] == 'OPEN' and data_age > 1800:
            raise ValueError(f"Market data too stale ({data_age//60} minutes old). Not posting to maintain credibility.")
        
        # Don't generate content if market is closed for more than 1 hour
        if summary['market_status'] == 'CLOSED' and data_age > 3600:
            raise ValueError("Market closed for too long. Not posting stale content.")
        
        # Create market brief with freshness indicator
        brief = f"""
📊 MARKET BRIEF - {summary['timestamp'].strftime('%d %B %Y, %I:%M %p')}
⏰ Data Age: {data_age//60} minutes | Status: {summary['market_status']}

🎯 Market Status: {summary['market_status']}

📈 Key Indices:
"""
        
        for index, data in summary['indices'].items():
            trend = "📈" if data['change_pct'] > 0 else "📉"
            brief += f"• {index}: {data['current']:.2f} ({data['change_pct']:+.2f}%) {trend}\n"
        
        brief += "\n🔥 Top Movers:\n"
        
        if summary['movers']['gainers']:
            brief += "🚀 Gainers:\n"
            for gainer in summary['movers']['gainers'][:3]:
                brief += f"• {gainer.get('symbol', '')}: +{gainer.get('pChange', 0):.2f}%\n"
        
        if summary['movers']['losers']:
            brief += "\n📉 Losers:\n"
            for loser in summary['movers']['losers'][:3]:
                brief += f"• {loser.get('symbol', '')}: {loser.get('pChange', 0):.2f}%\n"
        
        # Add FII/DII data
        fii_dii = summary.get('fii_dii', {})
        if fii_dii:
            brief += f"""
💰 FII/DII Activity:
• FII Net: ₹{fii_dii.get('fii', {}).get('net', 0):.0f} Cr
• DII Net: ₹{fii_dii.get('dii', {}).get('net', 0):.0f} Cr
"""
        
        # Add options data
        options = summary.get('options', {})
        if options:
            brief += f"""
⚡ Options Activity:
• PCR: {options.get('pcr', 0):.2f}
• Max Pain: {options.get('max_pain', 0):.0f}
"""
        
        brief += "\n💡 Market Insight: "
        nifty_change = summary['indices'].get('NIFTY', {}).get('change_pct', 0)
        
        if nifty_change > 1.5:
            insights = [
                "Strong bullish momentum. Consider booking partial profits at resistance levels.",
                "Euphoria building up. Remember - trees don't grow to the sky.",
                "Green across the board! But don't let greed cloud your judgment."
            ]
        elif nifty_change > 0.5:
            insights = [
                "Positive sentiment prevailing. Look for quality stocks with good fundamentals.",
                "Moderate gains suggest healthy market behavior. Stay selective.",
                "Bulls are in control but remain cautious about valuations."
            ]
        elif nifty_change < -1.5:
            insights = [
                "Sharp correction underway. Quality stocks might offer good entry points.",
                "Fear gripping the market. This could be opportunity knocking for patient investors.",
                "Red sea everywhere! But remember - fortunes are made in bear markets."
            ]
        elif nifty_change < -0.5:
            insights = [
                "Market showing weakness. Consider defensive sectors and cash positions.",
                "Profit booking visible. Watch for support levels closely.",
                "Bears flexing muscles. Time to review your stop losses."
            ]
        else:
            insights = [
                "Range-bound consolidation. Wait for clear directional breakout.",
                "Sideways grind continues. Focus on individual stock stories.",
                "Market indecisive. Better to stay on the sidelines and observe."
            ]
        
        import random
        brief += random.choice(insights)
        
        return brief

# Main execution
async def main():
    """Test the Indian Market Integration"""
    print("🇮🇳 INDIAN MARKET INTEGRATION - TESTING")
    print("=" * 50)
    
    market_api = IndianMarketAPI()
    integrator = MarketContentIntegrator()
    
    print("📊 Fetching live market data...")
    summary = await market_api.get_market_summary()
    
    print("✅ Market Summary Retrieved!")
    print(f"Market Status: {summary['market_status']}")
    print(f"Indices Count: {len(summary['indices'])}")
    print(f"Top Gainers: {len(summary['movers'].get('gainers', []))}")
    
    print("\n📝 Generating market brief...")
    brief = await integrator.generate_market_brief()
    
    print("\n" + "="*50)
    print("GENERATED MARKET BRIEF:")
    print("="*50)
    print(brief)
    print("="*50)
    
    # Test integration with webhook
    print("\n🔗 Testing webhook integration...")
    try:
        import requests
        response = requests.post(
            'http://localhost:5001/webhook/n8n/trigger',
            json={
                'content_type': 'market_analysis',
                'topic': 'Live Market Update',
                'platforms': ['telegram'],
                'market_data': summary
            }
        )
        print(f"✅ Webhook test: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Webhook test failed: {e}")
    
    return summary

if __name__ == "__main__":
    asyncio.run(main())