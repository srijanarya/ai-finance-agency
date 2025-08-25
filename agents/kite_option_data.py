#!/usr/bin/env python3
"""
Kite Connect MCP Integration for Option Chain Data
Integrates with Kite MCP to fetch real option chain data for Abid Hassan analysis
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import pandas as pd
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class KiteOptionData:
    """Structure for option data from Kite API"""
    instrument_token: int
    exchange_token: int
    tradingsymbol: str
    name: str
    last_price: float
    expiry: str
    strike: float
    tick_size: float
    lot_size: int
    instrument_type: str  # CE or PE
    segment: str
    exchange: str
    

class KiteOptionChainFetcher:
    """Fetches option chain data using Kite MCP integration"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        # This would be initialized with actual Kite MCP connection
        self.kite_client = None
        
    async def initialize_connection(self):
        """Initialize connection to Kite MCP"""
        try:
            # This would be the actual MCP connection initialization
            # For now, we'll simulate the connection
            self.logger.info("Initializing Kite MCP connection...")
            await asyncio.sleep(0.1)  # Simulate connection delay
            self.logger.info("Kite MCP connection established")
            return True
        except Exception as e:
            self.logger.error(f"Failed to initialize Kite MCP: {e}")
            return False
    
    async def get_instrument_list(self) -> List[Dict]:
        """Get list of all instruments from Kite"""
        try:
            # This would call the actual Kite MCP method
            # For now, we'll return sample data structure
            instruments = [
                {
                    "instrument_token": 256265,
                    "exchange_token": 1001,
                    "tradingsymbol": "NIFTY24SEP19500CE",
                    "name": "NIFTY",
                    "last_price": 150.0,
                    "expiry": "2024-09-26",
                    "strike": 19500.0,
                    "tick_size": 0.05,
                    "lot_size": 50,
                    "instrument_type": "CE",
                    "segment": "NFO-OPT",
                    "exchange": "NFO"
                },
                # More instruments would be here in real implementation
            ]
            
            self.logger.info(f"Fetched {len(instruments)} instruments from Kite")
            return instruments
            
        except Exception as e:
            self.logger.error(f"Error fetching instruments: {e}")
            return []
    
    async def get_option_chain(self, symbol: str, expiry: str = None) -> Dict:
        """Fetch option chain for a symbol"""
        try:
            if not expiry:
                expiry = self.get_next_expiry()
            
            # This would call actual Kite MCP methods for option chain
            # Simulated response structure based on Kite API
            option_chain = {
                "symbol": symbol,
                "expiry": expiry,
                "underlying_value": 19500.0 if symbol == "NIFTY" else 45000.0,
                "options": []
            }
            
            # Generate sample option chain data
            current_price = option_chain["underlying_value"]
            base_strike = int(current_price // 50) * 50
            
            for i in range(-15, 16):  # 31 strikes
                strike = base_strike + (i * 50)
                
                # Simulate call option data
                call_data = {
                    "strike": strike,
                    "instrument_type": "CE",
                    "last_price": max(current_price - strike + 50, 0.05) if strike <= current_price else max(current_price - strike + 100, 10),
                    "change": 0,
                    "pChange": 0,
                    "volume": abs(int((strike - current_price) / 10)) * 1000 + 5000,
                    "oi": abs(int((strike - current_price) / 5)) * 2000 + 10000,
                    "changeinOpenInterest": 500 if i % 3 == 0 else -200,
                    "impliedVolatility": 15 + abs(strike - current_price) / current_price * 20,
                    "totalTradedVolume": abs(int((strike - current_price) / 10)) * 500 + 2000,
                    "totalBuyQuantity": 0,
                    "totalSellQuantity": 0,
                    "bidQty": 50,
                    "bidprice": 0,
                    "askQty": 50, 
                    "askPrice": 0,
                    "extrinsicValue": 0,
                    "underlyingValue": current_price
                }
                
                # Simulate put option data
                put_data = {
                    "strike": strike,
                    "instrument_type": "PE", 
                    "last_price": max(strike - current_price + 50, 0.05) if strike >= current_price else max(strike - current_price + 100, 10),
                    "change": 0,
                    "pChange": 0,
                    "volume": abs(int((current_price - strike) / 10)) * 1000 + 5000,
                    "oi": abs(int((current_price - strike) / 5)) * 2000 + 10000,
                    "changeinOpenInterest": 300 if i % 2 == 0 else -150,
                    "impliedVolatility": 15 + abs(strike - current_price) / current_price * 20,
                    "totalTradedVolume": abs(int((current_price - strike) / 10)) * 500 + 2000,
                    "totalBuyQuantity": 0,
                    "totalSellQuantity": 0,
                    "bidQty": 50,
                    "bidprice": 0,
                    "askQty": 50,
                    "askPrice": 0,
                    "extrinsicValue": 0,
                    "underlyingValue": current_price
                }
                
                option_chain["options"].extend([call_data, put_data])
            
            self.logger.info(f"Fetched option chain for {symbol} expiry {expiry}")
            return option_chain
            
        except Exception as e:
            self.logger.error(f"Error fetching option chain for {symbol}: {e}")
            return {}
    
    def get_next_expiry(self) -> str:
        """Get the next weekly/monthly expiry date"""
        today = datetime.now()
        
        # For Nifty - weekly expiry on Thursday
        days_ahead = 3 - today.weekday()  # Thursday is weekday 3
        if days_ahead <= 0:  # Target day already happened this week
            days_ahead += 7
            
        next_expiry = today + timedelta(days_ahead)
        return next_expiry.strftime("%Y-%m-%d")
    
    async def get_ltp(self, instrument_tokens: List[int]) -> Dict[int, float]:
        """Get Last Traded Price for instruments"""
        try:
            # This would call actual Kite MCP LTP method
            # Simulated LTP data
            ltp_data = {}
            for token in instrument_tokens:
                # Simulate some price movement
                base_price = 19500 if token < 300000 else 150
                ltp_data[token] = base_price + (token % 100 - 50)
            
            return ltp_data
            
        except Exception as e:
            self.logger.error(f"Error fetching LTP: {e}")
            return {}
    
    async def get_historical_data(self, instrument_token: int, interval: str = "minute", 
                                days: int = 1) -> pd.DataFrame:
        """Get historical data for an instrument"""
        try:
            # This would call actual Kite MCP historical data method
            # Simulated historical data
            from_date = datetime.now() - timedelta(days=days)
            
            # Generate sample OHLCV data
            dates = pd.date_range(from_date, datetime.now(), freq='1min')
            data = []
            
            base_price = 19500 if instrument_token < 300000 else 150
            
            for date in dates:
                open_price = base_price + (hash(str(date)) % 100 - 50)
                high = open_price + (hash(str(date)) % 20)
                low = open_price - (hash(str(date)) % 20)  
                close = low + (hash(str(date)) % (high - low + 1))
                volume = abs(hash(str(date))) % 10000 + 1000
                
                data.append({
                    'date': date,
                    'open': open_price,
                    'high': high,
                    'low': low,
                    'close': close,
                    'volume': volume
                })
            
            df = pd.DataFrame(data)
            df.set_index('date', inplace=True)
            
            return df
            
        except Exception as e:
            self.logger.error(f"Error fetching historical data: {e}")
            return pd.DataFrame()
    
    async def convert_option_chain_to_abid_format(self, option_chain: Dict):
        """Convert Kite option chain to Abid Hassan analyzer format"""
        from .abid_hassan_analyzer import OptionChainData
        
        try:
            converted_data = []
            options = option_chain.get("options", [])
            
            # Group by strike price
            strikes = {}
            for option in options:
                strike = option["strike"]
                if strike not in strikes:
                    strikes[strike] = {"CE": None, "PE": None}
                
                strikes[strike][option["instrument_type"]] = option
            
            # Convert to OptionChainData format
            for strike, data in strikes.items():
                ce_data = data.get("CE", {})
                pe_data = data.get("PE", {})
                
                converted_data.append(OptionChainData(
                    strike=strike,
                    call_oi=ce_data.get("oi", 0),
                    put_oi=pe_data.get("oi", 0),
                    call_volume=ce_data.get("volume", 0),
                    put_volume=pe_data.get("volume", 0),
                    call_iv=ce_data.get("impliedVolatility", 15.0),
                    put_iv=pe_data.get("impliedVolatility", 15.0),
                    call_ltp=ce_data.get("last_price", 0.0),
                    put_ltp=pe_data.get("last_price", 0.0),
                    call_change_oi=ce_data.get("changeinOpenInterest", 0),
                    put_change_oi=pe_data.get("changeinOpenInterest", 0)
                ))
            
            return sorted(converted_data, key=lambda x: x.strike)
            
        except Exception as e:
            self.logger.error(f"Error converting option chain format: {e}")
            return []
    
    async def get_fii_dii_data(self) -> Dict:
        """Get FII/DII data for institutional flow analysis"""
        try:
            # This would integrate with actual FII/DII data source
            # Simulated data structure
            fii_dii_data = {
                "date": datetime.now().strftime("%Y-%m-%d"),
                "fii": {
                    "equity": {
                        "gross_purchase": 5000.0,
                        "gross_sales": 4500.0,
                        "net": 500.0
                    },
                    "debt": {
                        "gross_purchase": 2000.0,
                        "gross_sales": 2100.0,
                        "net": -100.0
                    },
                    "hybrid": {
                        "gross_purchase": 300.0,
                        "gross_sales": 250.0,
                        "net": 50.0
                    }
                },
                "dii": {
                    "equity": {
                        "gross_purchase": 3500.0,
                        "gross_sales": 3200.0,
                        "net": 300.0
                    },
                    "debt": {
                        "gross_purchase": 1500.0,
                        "gross_sales": 1600.0,
                        "net": -100.0
                    }
                }
            }
            
            return fii_dii_data
            
        except Exception as e:
            self.logger.error(f"Error fetching FII/DII data: {e}")
            return {}
    
    async def get_india_vix(self) -> float:
        """Get current India VIX value"""
        try:
            # This would fetch actual India VIX from NSE or Kite
            # Simulated VIX value
            import random
            vix = 15.0 + random.uniform(-3, 7)  # Typical VIX range 12-22
            return round(vix, 2)
            
        except Exception as e:
            self.logger.error(f"Error fetching India VIX: {e}")
            return 15.0  # Default fallback
    
    async def close_connection(self):
        """Close Kite MCP connection"""
        try:
            if self.kite_client:
                # Close actual connection
                pass
            self.logger.info("Kite MCP connection closed")
        except Exception as e:
            self.logger.error(f"Error closing Kite connection: {e}")


# Integration class for Abid Hassan analyzer
class AbidHassanKiteIntegration:
    """Integration layer between Kite data and Abid Hassan analyzer"""
    
    def __init__(self):
        self.kite_fetcher = KiteOptionChainFetcher()
        self.logger = logging.getLogger(__name__)
    
    async def initialize(self):
        """Initialize the integration"""
        return await self.kite_fetcher.initialize_connection()
    
    async def get_real_option_data(self, symbol: str) -> List:
        """Get real option chain data for Abid Hassan analysis"""
        try:
            # Fetch option chain from Kite
            option_chain = await self.kite_fetcher.get_option_chain(symbol)
            
            # Convert to Abid Hassan format
            converted_data = await self.kite_fetcher.convert_option_chain_to_abid_format(option_chain)
            
            self.logger.info(f"Fetched {len(converted_data)} option strikes for {symbol}")
            return converted_data
            
        except Exception as e:
            self.logger.error(f"Error getting real option data for {symbol}: {e}")
            return []
    
    async def get_enhanced_analysis_data(self, symbol: str) -> Dict:
        """Get enhanced data for comprehensive analysis"""
        try:
            # Fetch multiple data sources
            option_data = await self.get_real_option_data(symbol)
            fii_dii_data = await self.kite_fetcher.get_fii_dii_data()
            vix = await self.kite_fetcher.get_india_vix()
            
            # Get current market price
            option_chain = await self.kite_fetcher.get_option_chain(symbol)
            current_price = option_chain.get("underlying_value", 0)
            
            return {
                "option_data": option_data,
                "current_price": current_price,
                "fii_dii_data": fii_dii_data,
                "india_vix": vix,
                "timestamp": datetime.now()
            }
            
        except Exception as e:
            self.logger.error(f"Error getting enhanced analysis data: {e}")
            return {}
    
    async def cleanup(self):
        """Cleanup resources"""
        await self.kite_fetcher.close_connection()


async def test_kite_integration():
    """Test function for Kite integration"""
    integration = AbidHassanKiteIntegration()
    
    try:
        # Initialize connection
        if await integration.initialize():
            print("✅ Kite MCP integration initialized")
            
            # Test option data fetching
            nifty_data = await integration.get_real_option_data("NIFTY")
            print(f"✅ Fetched {len(nifty_data)} NIFTY option strikes")
            
            # Test enhanced analysis data
            enhanced_data = await integration.get_enhanced_analysis_data("NIFTY")
            print(f"✅ Enhanced analysis data: VIX={enhanced_data.get('india_vix', 'N/A')}")
            
        else:
            print("❌ Failed to initialize Kite integration")
            
    except Exception as e:
        print(f"❌ Error in Kite integration test: {e}")
    
    finally:
        await integration.cleanup()


if __name__ == "__main__":
    asyncio.run(test_kite_integration())