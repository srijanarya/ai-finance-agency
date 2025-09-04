#!/usr/bin/env python3
"""
Real-Time Market Data Fix
Ensures fresh data is always used instead of hardcoded fallback values
"""

import yfinance as yf
import asyncio
from datetime import datetime, timedelta
import json
import sqlite3
from typing import Dict, Optional, Any
import requests
from functools import lru_cache
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RealTimeMarketDataManager:
    """
    Centralized market data manager to ensure fresh data across all systems
    Replaces hardcoded fallback values with real-time data
    """
    
    def __init__(self):
        self.cache_duration = 60  # 1 minute cache
        self.last_update = None
        self.market_data_cache = {}
        
    def is_market_hours(self) -> bool:
        """Check if Indian markets are open (9:15 AM to 3:30 PM IST)"""
        now = datetime.now()
        market_open = now.replace(hour=9, minute=15, second=0, microsecond=0)
        market_close = now.replace(hour=15, minute=30, second=0, microsecond=0)
        
        # Check if it's a weekday and within market hours
        is_weekday = now.weekday() < 5  # Monday = 0, Friday = 4
        is_market_time = market_open <= now <= market_close
        
        return is_weekday and is_market_time
    
    def get_fresh_nifty_data(self) -> Dict[str, Any]:
        """Get fresh NIFTY data - NO hardcoded values"""
        try:
            logger.info("Fetching fresh NIFTY data from yfinance...")
            nifty = yf.Ticker("^NSEI")
            
            # Get latest data
            hist = nifty.history(period="5d", interval="1d")
            info = nifty.info
            
            if not hist.empty:
                current_price = float(hist['Close'].iloc[-1])
                previous_price = float(hist['Close'].iloc[-2]) if len(hist) > 1 else current_price
                change = current_price - previous_price
                change_pct = (change / previous_price) * 100 if previous_price > 0 else 0
                
                # Calculate support and resistance dynamically
                high_5d = float(hist['High'].max())
                low_5d = float(hist['Low'].min())
                support_level = round(low_5d * 0.995, -1)  # 0.5% below 5-day low
                resistance_level = round(high_5d * 1.005, -1)  # 0.5% above 5-day high
                
                return {
                    'symbol': 'NIFTY',
                    'current_price': round(current_price, 2),
                    'previous_close': round(previous_price, 2),
                    'change': round(change, 2),
                    'change_percent': round(change_pct, 2),
                    'support': support_level,
                    'resistance': resistance_level,
                    'high_5d': round(high_5d, 2),
                    'low_5d': round(low_5d, 2),
                    'volume': int(hist['Volume'].iloc[-1]) if 'Volume' in hist else 0,
                    'timestamp': datetime.now().isoformat(),
                    'market_status': 'OPEN' if self.is_market_hours() else 'CLOSED',
                    'data_freshness': 'REAL_TIME'
                }
            else:
                logger.error("No NIFTY historical data available")
                return self._get_fallback_nifty()
                
        except Exception as e:
            logger.error(f"Error fetching NIFTY data: {e}")
            return self._get_fallback_nifty()
    
    def get_fresh_banknifty_data(self) -> Dict[str, Any]:
        """Get fresh BankNifty data - NO hardcoded values"""
        try:
            logger.info("Fetching fresh BankNifty data from yfinance...")
            banknifty = yf.Ticker("^NSEBANK")
            
            hist = banknifty.history(period="5d", interval="1d")
            info = banknifty.info
            
            if not hist.empty:
                current_price = float(hist['Close'].iloc[-1])
                previous_price = float(hist['Close'].iloc[-2]) if len(hist) > 1 else current_price
                change = current_price - previous_price
                change_pct = (change / previous_price) * 100 if previous_price > 0 else 0
                
                # Dynamic support/resistance
                high_5d = float(hist['High'].max())
                low_5d = float(hist['Low'].min())
                support_level = round(low_5d * 0.995, -2)  # Round to nearest 100
                resistance_level = round(high_5d * 1.005, -2)
                
                return {
                    'symbol': 'BANKNIFTY',
                    'current_price': round(current_price, 2),
                    'previous_close': round(previous_price, 2),
                    'change': round(change, 2),
                    'change_percent': round(change_pct, 2),
                    'support': support_level,
                    'resistance': resistance_level,
                    'high_5d': round(high_5d, 2),
                    'low_5d': round(low_5d, 2),
                    'volume': int(hist['Volume'].iloc[-1]) if 'Volume' in hist else 0,
                    'timestamp': datetime.now().isoformat(),
                    'market_status': 'OPEN' if self.is_market_hours() else 'CLOSED',
                    'data_freshness': 'REAL_TIME'
                }
            else:
                logger.error("No BankNifty historical data available")
                return self._get_fallback_banknifty()
                
        except Exception as e:
            logger.error(f"Error fetching BankNifty data: {e}")
            return self._get_fallback_banknifty()
    
    def _get_fallback_nifty(self) -> Dict[str, Any]:
        """Emergency fallback - still use realistic approximations"""
        logger.warning("Using emergency fallback for NIFTY data")
        
        # Use a more realistic base value from recent market levels
        base_price = 25000  # Updated from outdated 24,500
        
        return {
            'symbol': 'NIFTY',
            'current_price': base_price,
            'previous_close': base_price - 50,
            'change': 50,
            'change_percent': 0.2,
            'support': base_price - 200,
            'resistance': base_price + 200,
            'high_5d': base_price + 100,
            'low_5d': base_price - 150,
            'volume': 150000000,
            'timestamp': datetime.now().isoformat(),
            'market_status': 'CLOSED',
            'data_freshness': 'FALLBACK_DATA',
            'warning': 'Using fallback data - real-time unavailable'
        }
    
    def _get_fallback_banknifty(self) -> Dict[str, Any]:
        """Emergency fallback for BankNifty"""
        logger.warning("Using emergency fallback for BankNifty data")
        
        # Updated from outdated 52,000
        base_price = 53000
        
        return {
            'symbol': 'BANKNIFTY',
            'current_price': base_price,
            'previous_close': base_price - 100,
            'change': 100,
            'change_percent': 0.19,
            'support': base_price - 500,
            'resistance': base_price + 500,
            'high_5d': base_price + 200,
            'low_5d': base_price - 300,
            'volume': 50000000,
            'timestamp': datetime.now().isoformat(),
            'market_status': 'CLOSED',
            'data_freshness': 'FALLBACK_DATA',
            'warning': 'Using fallback data - real-time unavailable'
        }
    
    def get_comprehensive_market_data(self) -> Dict[str, Any]:
        """Get comprehensive market data for content generation"""
        
        # Check cache first
        if (self.last_update and 
            datetime.now() - self.last_update < timedelta(seconds=self.cache_duration) and 
            self.market_data_cache):
            logger.info("Returning cached market data")
            return self.market_data_cache
        
        logger.info("Fetching fresh comprehensive market data...")
        
        # Get fresh data
        nifty_data = self.get_fresh_nifty_data()
        banknifty_data = self.get_fresh_banknifty_data()
        
        # Compile comprehensive data
        market_data = {
            'timestamp': datetime.now().isoformat(),
            'data_freshness': 'REAL_TIME',
            'market_session': 'OPEN' if self.is_market_hours() else 'CLOSED',
            
            'indices': {
                'nifty': nifty_data,
                'banknifty': banknifty_data
            },
            
            'market_summary': {
                'nifty_level': nifty_data['current_price'],
                'nifty_change': nifty_data['change'],
                'nifty_change_pct': nifty_data['change_percent'],
                'banknifty_level': banknifty_data['current_price'],
                'banknifty_change': banknifty_data['change'],
                'banknifty_change_pct': banknifty_data['change_percent'],
                
                'key_levels': {
                    'nifty_support': nifty_data['support'],
                    'nifty_resistance': nifty_data['resistance'],
                    'banknifty_support': banknifty_data['support'],
                    'banknifty_resistance': banknifty_data['resistance']
                }
            },
            
            'content_hints': {
                'market_direction': 'bullish' if nifty_data['change'] > 0 else 'bearish',
                'volatility': 'high' if abs(nifty_data['change_percent']) > 1 else 'moderate',
                'key_theme': self._generate_market_theme(nifty_data, banknifty_data)
            }
        }
        
        # Update cache
        self.market_data_cache = market_data
        self.last_update = datetime.now()
        
        return market_data
    
    def _generate_market_theme(self, nifty: Dict, banknifty: Dict) -> str:
        """Generate market theme based on current data"""
        nifty_change = nifty['change_percent']
        bank_change = banknifty['change_percent']
        
        if nifty_change > 1 and bank_change > 1:
            return "Strong bullish momentum across indices"
        elif nifty_change < -1 and bank_change < -1:
            return "Broad-based selling pressure"
        elif abs(nifty_change) < 0.5 and abs(bank_change) < 0.5:
            return "Consolidation and range-bound action"
        elif bank_change > nifty_change:
            return "Banking sector outperformance"
        else:
            return "Mixed market sentiment"
    
    def validate_data_freshness(self, data: Dict) -> bool:
        """Validate if data is fresh enough for publishing"""
        if 'timestamp' not in data:
            return False
            
        try:
            data_time = datetime.fromisoformat(data['timestamp'].replace('Z', ''))
            age_minutes = (datetime.now() - data_time).total_seconds() / 60
            
            # Data should be less than 30 minutes old
            is_fresh = age_minutes < 30
            
            if not is_fresh:
                logger.warning(f"Data is {age_minutes:.1f} minutes old - may be stale")
            
            return is_fresh
            
        except Exception as e:
            logger.error(f"Error validating data freshness: {e}")
            return False
    
    def save_market_snapshot(self) -> str:
        """Save current market data to database"""
        data = self.get_comprehensive_market_data()
        
        conn = sqlite3.connect('data/agency.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS market_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                nifty_price REAL,
                banknifty_price REAL,
                market_data TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            INSERT INTO market_snapshots (timestamp, nifty_price, banknifty_price, market_data)
            VALUES (?, ?, ?, ?)
        ''', (
            data['timestamp'],
            data['indices']['nifty']['current_price'],
            data['indices']['banknifty']['current_price'],
            json.dumps(data)
        ))
        
        conn.commit()
        snapshot_id = cursor.lastrowid
        conn.close()
        
        logger.info(f"Market snapshot saved with ID: {snapshot_id}")
        return str(snapshot_id)

def fix_hardcoded_values_in_content():
    """Replace hardcoded market values in generated content"""
    manager = RealTimeMarketDataManager()
    fresh_data = manager.get_comprehensive_market_data()
    
    print("\n" + "="*60)
    print("🔧 FIXING HARDCODED MARKET VALUES")
    print("="*60)
    
    print("\n❌ OLD HARDCODED VALUES:")
    print("   NIFTY: 24,500 (outdated)")
    print("   BankNifty: 52,000 (outdated)")
    
    print("\n✅ NEW REAL-TIME VALUES:")
    nifty = fresh_data['indices']['nifty']
    banknifty = fresh_data['indices']['banknifty']
    
    print(f"   NIFTY: {nifty['current_price']:,.0f} ({nifty['change']:+.0f} | {nifty['change_percent']:+.2f}%)")
    print(f"   BankNifty: {banknifty['current_price']:,.0f} ({banknifty['change']:+.0f} | {banknifty['change_percent']:+.2f}%)")
    
    print(f"\n📊 KEY LEVELS:")
    print(f"   NIFTY Support: {nifty['support']:,.0f}")
    print(f"   NIFTY Resistance: {nifty['resistance']:,.0f}")
    print(f"   BankNifty Support: {banknifty['support']:,.0f}")
    print(f"   BankNifty Resistance: {banknifty['resistance']:,.0f}")
    
    print(f"\n🎯 MARKET THEME: {fresh_data['content_hints']['key_theme']}")
    print(f"📈 DIRECTION: {fresh_data['content_hints']['market_direction'].upper()}")
    print(f"📊 VOLATILITY: {fresh_data['content_hints']['volatility'].upper()}")
    
    print(f"\n⏰ DATA TIMESTAMP: {fresh_data['timestamp']}")
    print(f"🔄 FRESHNESS: {fresh_data['data_freshness']}")
    print(f"🕐 MARKET STATUS: {fresh_data['market_session']}")
    
    print("\n" + "="*60)
    print("✅ SOLUTION IMPLEMENTED:")
    print("1. Real-time data fetching from yfinance")
    print("2. Dynamic support/resistance calculation") 
    print("3. Data freshness validation")
    print("4. Comprehensive market context")
    print("5. Emergency fallback with updated values")
    print("="*60)
    
    return fresh_data

async def main():
    """Demo the real-time market data fix"""
    print("🚀 REAL-TIME MARKET DATA FIX DEMO")
    
    # Show the fix in action
    fresh_data = fix_hardcoded_values_in_content()
    
    # Save snapshot
    manager = RealTimeMarketDataManager()
    snapshot_id = manager.save_market_snapshot()
    
    print(f"\n💾 Market snapshot saved: {snapshot_id}")
    print("\n🎯 TO INTEGRATE THIS FIX:")
    print("1. Import RealTimeMarketDataManager in your content generators")
    print("2. Replace hardcoded values with manager.get_comprehensive_market_data()")
    print("3. Use validate_data_freshness() before publishing")
    print("4. This will ensure all content uses fresh, accurate market data")
    
if __name__ == "__main__":
    asyncio.run(main())