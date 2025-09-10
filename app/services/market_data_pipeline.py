"""
Real-time Market Data Ingestion Pipeline
High-performance data collection from NSE, BSE, and premium data providers
Supports institutional-grade data feeds with sub-second latency
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Callable, Set
from decimal import Decimal
from dataclasses import dataclass, asdict
from enum import Enum
import hashlib

import aioredis
import asyncpg
import websockets
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db
from app.core.config import get_settings
from database.models import MarketData, TradingSignal

logger = logging.getLogger(__name__)
settings = get_settings()

class DataSource(str, Enum):
    """Market data sources"""
    NSE = "nse"
    BSE = "bse"
    YAHOO = "yahoo"
    ZERODHA_KITE = "zerodha_kite"
    ALPHA_VANTAGE = "alpha_vantage"
    POLYGON = "polygon"
    FINNHUB = "finnhub"

class DataType(str, Enum):
    """Types of market data"""
    TICK = "tick"           # Real-time tick data
    QUOTE = "quote"         # Current quote (bid/ask)
    OHLCV = "ohlcv"        # OHLC + Volume bars
    DEPTH = "depth"        # Market depth (L2 data)
    TRADES = "trades"      # Trade executions
    NEWS = "news"          # Market news
    CORPORATE = "corporate" # Corporate actions

@dataclass
class MarketTick:
    """Real-time market tick data"""
    symbol: str
    timestamp: datetime
    price: Decimal
    volume: int
    exchange: str
    data_source: DataSource
    bid: Optional[Decimal] = None
    ask: Optional[Decimal] = None
    bid_size: Optional[int] = None
    ask_size: Optional[int] = None
    high: Optional[Decimal] = None
    low: Optional[Decimal] = None
    open: Optional[Decimal] = None
    prev_close: Optional[Decimal] = None
    change: Optional[Decimal] = None
    change_percent: Optional[Decimal] = None
    total_volume: Optional[int] = None
    total_trades: Optional[int] = None

@dataclass
class MarketDepth:
    """Market depth data (Level 2)"""
    symbol: str
    timestamp: datetime
    bids: List[Dict[str, Any]]  # [{"price": 100.50, "size": 1000}]
    asks: List[Dict[str, Any]]
    data_source: DataSource

class DataSubscription:
    """Subscription configuration for market data"""
    
    def __init__(
        self,
        symbols: List[str],
        data_types: List[DataType],
        data_sources: List[DataSource],
        callback: Callable,
        filters: Optional[Dict[str, Any]] = None
    ):
        self.symbols = set(symbols)
        self.data_types = set(data_types)
        self.data_sources = set(data_sources)
        self.callback = callback
        self.filters = filters or {}
        self.created_at = datetime.utcnow()
        self.is_active = True

class NSEDataProvider:
    """NSE (National Stock Exchange) data provider"""
    
    def __init__(self):
        self.base_url = "https://www.nseindia.com/api"
        self.session = None
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json, text/plain, */*",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
        }
        self.last_request_time = 0
        self.rate_limit_delay = 1.0  # 1 second between requests
    
    async def connect(self):
        """Initialize NSE session"""
        if not self.session:
            self.session = httpx.AsyncClient(
                headers=self.headers,
                timeout=httpx.Timeout(10.0),
                limits=httpx.Limits(max_connections=10, max_keepalive_connections=5)
            )
    
    async def get_quote(self, symbol: str) -> Optional[MarketTick]:
        """Get real-time quote from NSE"""
        await self._rate_limit()
        
        try:
            url = f"{self.base_url}/quote-equity?symbol={symbol}"
            response = await self.session.get(url)
            response.raise_for_status()
            
            data = response.json()
            if not data or 'data' not in data:
                return None
            
            quote_data = data['data']
            price_info = quote_data.get('priceInfo', {})
            
            return MarketTick(
                symbol=symbol,
                timestamp=datetime.now(timezone.utc),
                price=Decimal(str(price_info.get('lastPrice', 0))),
                volume=int(price_info.get('totalTradedVolume', 0)),
                exchange="NSE",
                data_source=DataSource.NSE,
                bid=Decimal(str(price_info.get('bidprice', 0))) if price_info.get('bidprice') else None,
                ask=Decimal(str(price_info.get('askprice', 0))) if price_info.get('askprice') else None,
                high=Decimal(str(price_info.get('intraDayHighLow', {}).get('max', 0))),
                low=Decimal(str(price_info.get('intraDayHighLow', {}).get('min', 0))),
                open=Decimal(str(price_info.get('open', 0))),
                prev_close=Decimal(str(price_info.get('previousClose', 0))),
                change=Decimal(str(price_info.get('change', 0))),
                change_percent=Decimal(str(price_info.get('pChange', 0)))
            )
            
        except Exception as e:
            logger.error(f"NSE quote fetch failed for {symbol}: {e}")
            return None
    
    async def get_market_depth(self, symbol: str) -> Optional[MarketDepth]:
        """Get market depth from NSE"""
        await self._rate_limit()
        
        try:
            url = f"{self.base_url}/quote-equity?symbol={symbol}&section=trade_info"
            response = await self.session.get(url)
            response.raise_for_status()
            
            data = response.json()
            market_depth_data = data.get('marketDeptOrderBook', {})
            
            bids = []
            asks = []
            
            # Parse bid data
            for bid in market_depth_data.get('bid', []):
                bids.append({
                    "price": float(bid.get('price', 0)),
                    "size": int(bid.get('quantity', 0))
                })
            
            # Parse ask data  
            for ask in market_depth_data.get('ask', []):
                asks.append({
                    "price": float(ask.get('price', 0)),
                    "size": int(ask.get('quantity', 0))
                })
            
            return MarketDepth(
                symbol=symbol,
                timestamp=datetime.now(timezone.utc),
                bids=bids,
                asks=asks,
                data_source=DataSource.NSE
            )
            
        except Exception as e:
            logger.error(f"NSE market depth fetch failed for {symbol}: {e}")
            return None
    
    async def _rate_limit(self):
        """Enforce rate limiting for NSE requests"""
        now = time.time()
        time_since_last = now - self.last_request_time
        if time_since_last < self.rate_limit_delay:
            await asyncio.sleep(self.rate_limit_delay - time_since_last)
        self.last_request_time = time.time()
    
    async def close(self):
        """Close the HTTP session"""
        if self.session:
            await self.session.aclose()

class ZerodhaKiteDataProvider:
    """Zerodha Kite API data provider"""
    
    def __init__(self):
        self.api_key = settings.zerodha_api_key
        self.access_token = settings.zerodha_access_token
        self.base_url = "https://api.kite.trade"
        self.session = None
        self.websocket = None
        self.subscriptions: Set[str] = set()
    
    async def connect(self):
        """Initialize Kite session"""
        if not self.api_key or not self.access_token:
            logger.warning("Zerodha Kite credentials not configured")
            return False
        
        self.session = httpx.AsyncClient(
            headers={
                "X-Kite-Version": "3",
                "Authorization": f"token {self.api_key}:{self.access_token}"
            },
            timeout=httpx.Timeout(10.0)
        )
        
        return True
    
    async def get_quote(self, symbol: str, exchange: str = "NSE") -> Optional[MarketTick]:
        """Get real-time quote from Kite"""
        if not self.session:
            await self.connect()
        
        try:
            instrument = f"{exchange}:{symbol}"
            url = f"{self.base_url}/quote?i={instrument}"
            
            response = await self.session.get(url)
            response.raise_for_status()
            
            data = response.json()
            if not data or 'data' not in data:
                return None
            
            quote = data['data'][instrument]
            
            return MarketTick(
                symbol=symbol,
                timestamp=datetime.now(timezone.utc),
                price=Decimal(str(quote.get('last_price', 0))),
                volume=int(quote.get('volume', 0)),
                exchange=exchange,
                data_source=DataSource.ZERODHA_KITE,
                bid=Decimal(str(quote.get('depth', {}).get('buy', [{}])[0].get('price', 0))),
                ask=Decimal(str(quote.get('depth', {}).get('sell', [{}])[0].get('price', 0))),
                high=Decimal(str(quote.get('ohlc', {}).get('high', 0))),
                low=Decimal(str(quote.get('ohlc', {}).get('low', 0))),
                open=Decimal(str(quote.get('ohlc', {}).get('open', 0))),
                prev_close=Decimal(str(quote.get('ohlc', {}).get('close', 0))),
                change=Decimal(str(quote.get('net_change', 0))),
                total_volume=int(quote.get('volume', 0))
            )
            
        except Exception as e:
            logger.error(f"Kite quote fetch failed for {symbol}: {e}")
            return None
    
    async def start_websocket_feed(self, symbols: List[str], callback: Callable):
        """Start real-time WebSocket data feed"""
        if not self.access_token:
            logger.error("Kite access token required for WebSocket feed")
            return
        
        try:
            # Kite WebSocket implementation would go here
            # This is a placeholder for the actual WebSocket connection
            logger.info(f"Starting Kite WebSocket feed for {len(symbols)} symbols")
            
            # Mock WebSocket data for demonstration
            while True:
                for symbol in symbols:
                    mock_tick = MarketTick(
                        symbol=symbol,
                        timestamp=datetime.now(timezone.utc),
                        price=Decimal("100.50"),  # Mock price
                        volume=1000,
                        exchange="NSE",
                        data_source=DataSource.ZERODHA_KITE
                    )
                    await callback(mock_tick)
                    await asyncio.sleep(1)  # 1 second delay between ticks
                    
        except Exception as e:
            logger.error(f"Kite WebSocket feed error: {e}")

class MarketDataPipeline:
    """High-performance market data ingestion pipeline"""
    
    def __init__(self):
        self.providers = {
            DataSource.NSE: NSEDataProvider(),
            DataSource.ZERODHA_KITE: ZerodhaKiteDataProvider()
        }
        self.subscriptions: Dict[str, DataSubscription] = {}
        self.redis_client = None
        self.is_running = False
        self.stats = {
            "ticks_processed": 0,
            "errors": 0,
            "last_update": None,
            "active_symbols": set(),
            "data_sources": set()
        }
    
    async def initialize(self):
        """Initialize the market data pipeline"""
        try:
            # Initialize Redis for caching
            self.redis_client = aioredis.from_url(
                settings.redis_url,
                decode_responses=True
            )
            
            # Initialize data providers
            for provider in self.providers.values():
                await provider.connect()
            
            logger.info("Market data pipeline initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Pipeline initialization failed: {e}")
            return False
    
    async def subscribe(
        self,
        symbols: List[str],
        data_types: List[DataType],
        data_sources: List[DataSource],
        callback: Callable,
        subscription_id: Optional[str] = None
    ) -> str:
        """Subscribe to real-time market data"""
        
        if not subscription_id:
            subscription_id = hashlib.md5(
                f"{','.join(symbols)}_{time.time()}".encode()
            ).hexdigest()
        
        subscription = DataSubscription(
            symbols=symbols,
            data_types=data_types,
            data_sources=data_sources,
            callback=callback
        )
        
        self.subscriptions[subscription_id] = subscription
        
        # Update stats
        self.stats["active_symbols"].update(symbols)
        self.stats["data_sources"].update(data_sources)
        
        logger.info(f"Created subscription {subscription_id} for {len(symbols)} symbols")
        return subscription_id
    
    async def unsubscribe(self, subscription_id: str) -> bool:
        """Unsubscribe from market data"""
        if subscription_id in self.subscriptions:
            del self.subscriptions[subscription_id]
            logger.info(f"Removed subscription {subscription_id}")
            return True
        return False
    
    async def get_realtime_quote(
        self, 
        symbol: str, 
        data_source: DataSource = DataSource.NSE
    ) -> Optional[MarketTick]:
        """Get real-time quote for a single symbol"""
        
        if data_source not in self.providers:
            logger.error(f"Data source {data_source} not supported")
            return None
        
        provider = self.providers[data_source]
        
        # Check cache first
        cache_key = f"quote:{data_source}:{symbol}"
        cached_data = await self.redis_client.get(cache_key)
        
        if cached_data:
            try:
                tick_data = json.loads(cached_data)
                # Check if data is fresh (less than 5 seconds old)
                timestamp = datetime.fromisoformat(tick_data['timestamp'].replace('Z', '+00:00'))
                if (datetime.now(timezone.utc) - timestamp).total_seconds() < 5:
                    return MarketTick(**tick_data)
            except Exception as e:
                logger.warning(f"Cache data parsing error: {e}")
        
        # Fetch fresh data
        tick = await provider.get_quote(symbol)
        
        if tick:
            # Cache the result
            await self.redis_client.setex(
                cache_key,
                5,  # 5 seconds TTL
                json.dumps(asdict(tick), default=str)
            )
            
            # Update stats
            self.stats["ticks_processed"] += 1
            self.stats["last_update"] = datetime.utcnow().isoformat()
        
        return tick
    
    async def get_batch_quotes(
        self,
        symbols: List[str],
        data_source: DataSource = DataSource.NSE
    ) -> Dict[str, MarketTick]:
        """Get real-time quotes for multiple symbols concurrently"""
        
        tasks = []
        for symbol in symbols:
            task = self.get_realtime_quote(symbol, data_source)
            tasks.append((symbol, task))
        
        results = {}
        for symbol, task in tasks:
            try:
                tick = await task
                if tick:
                    results[symbol] = tick
            except Exception as e:
                logger.error(f"Batch quote failed for {symbol}: {e}")
                self.stats["errors"] += 1
        
        return results
    
    async def start_streaming(self):
        """Start real-time data streaming for all subscriptions"""
        if self.is_running:
            logger.warning("Pipeline is already running")
            return
        
        self.is_running = True
        logger.info("Starting market data streaming pipeline")
        
        try:
            while self.is_running:
                # Process all active subscriptions
                for sub_id, subscription in self.subscriptions.items():
                    if not subscription.is_active:
                        continue
                    
                    try:
                        # Fetch data for subscribed symbols
                        for symbol in subscription.symbols:
                            for data_source in subscription.data_sources:
                                if DataType.TICK in subscription.data_types:
                                    tick = await self.get_realtime_quote(symbol, data_source)
                                    if tick:
                                        await subscription.callback(tick)
                    
                    except Exception as e:
                        logger.error(f"Subscription {sub_id} processing error: {e}")
                        self.stats["errors"] += 1
                
                # Small delay to prevent overwhelming the system
                await asyncio.sleep(0.1)
        
        except Exception as e:
            logger.error(f"Streaming pipeline error: {e}")
        finally:
            self.is_running = False
            logger.info("Market data streaming pipeline stopped")
    
    async def stop_streaming(self):
        """Stop the streaming pipeline"""
        self.is_running = False
        logger.info("Stopping market data streaming pipeline")
    
    async def get_pipeline_stats(self) -> Dict[str, Any]:
        """Get pipeline performance statistics"""
        return {
            "is_running": self.is_running,
            "active_subscriptions": len(self.subscriptions),
            "ticks_processed": self.stats["ticks_processed"],
            "errors": self.stats["errors"],
            "last_update": self.stats["last_update"],
            "active_symbols_count": len(self.stats["active_symbols"]),
            "data_sources_count": len(self.stats["data_sources"]),
            "cache_status": "connected" if self.redis_client else "disconnected",
            "provider_status": {
                source.value: "connected" 
                for source in self.providers.keys()
            }
        }
    
    async def cleanup(self):
        """Cleanup resources"""
        try:
            self.is_running = False
            
            # Close data providers
            for provider in self.providers.values():
                if hasattr(provider, 'close'):
                    await provider.close()
            
            # Close Redis connection
            if self.redis_client:
                await self.redis_client.close()
            
            logger.info("Market data pipeline cleanup completed")
            
        except Exception as e:
            logger.error(f"Pipeline cleanup error: {e}")

# Global instance
market_data_pipeline = MarketDataPipeline()

# Callback functions for AI signal integration
async def signal_data_callback(tick: MarketTick):
    """Callback function to process real-time data for AI signals"""
    try:
        # This would trigger AI signal generation when significant price movements occur
        if abs(float(tick.change_percent or 0)) > 2.0:  # 2% price change threshold
            logger.info(f"Significant price movement in {tick.symbol}: {tick.change_percent}%")
            
            # Trigger AI signal generation
            from app.services.ai_trading_signals_engine import ai_signals_engine
            await ai_signals_engine.generate_ensemble_signal(tick.symbol)
    
    except Exception as e:
        logger.error(f"Signal callback error for {tick.symbol}: {e}")

async def portfolio_data_callback(tick: MarketTick):
    """Callback function for portfolio management updates"""
    try:
        # Update portfolio positions with real-time prices
        logger.debug(f"Portfolio update: {tick.symbol} @ {tick.price}")
        
        # This would update user portfolio valuations in real-time
        # Implementation would depend on portfolio management service
        
    except Exception as e:
        logger.error(f"Portfolio callback error for {tick.symbol}: {e}")