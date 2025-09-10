"""
Zerodha Kite API Integration Service
Handles real-time trading, market data, and order management through Zerodha Kite Connect API
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
import json
import hashlib
import hmac

import httpx
import websockets
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.services.portfolio_management_engine import BrokerInterface, Order, Position, OrderStatus, OrderType
from app.services.market_data_pipeline import MarketDataPipeline

logger = logging.getLogger(__name__)

class KiteCredentials(BaseModel):
    """Zerodha Kite API credentials model"""
    api_key: str
    api_secret: str
    access_token: Optional[str] = None
    request_token: Optional[str] = None
    user_id: Optional[str] = None

class KiteInstrument(BaseModel):
    """Zerodha instrument data model"""
    instrument_token: int
    exchange_token: int
    tradingsymbol: str
    name: str
    last_price: float
    expiry: Optional[str] = None
    strike: Optional[float] = None
    tick_size: float
    lot_size: int
    instrument_type: str
    segment: str
    exchange: str

class KiteOrder(BaseModel):
    """Zerodha order model"""
    order_id: str
    tradingsymbol: str
    quantity: int
    price: float
    order_type: str
    transaction_type: str
    product: str
    status: str
    filled_quantity: int
    pending_quantity: int
    average_price: float
    order_timestamp: datetime

class ZerodhaKiteService(BrokerInterface):
    """
    Comprehensive Zerodha Kite API integration service
    """
    
    BASE_URL = "https://api.kite.trade"
    WEBSOCKET_URL = "wss://ws.kite.trade"
    
    def __init__(self, credentials: KiteCredentials):
        self.credentials = credentials
        self.session = httpx.AsyncClient(timeout=30.0)
        self.instruments: Dict[str, KiteInstrument] = {}
        self.websocket_connection = None
        self.subscribed_tokens: List[int] = []
        self.order_updates_callback = None
        self.market_data_callback = None
        
    async def initialize(self) -> bool:
        """Initialize the Kite service with authentication"""
        try:
            # Generate access token if not available
            if not self.credentials.access_token:
                await self._generate_access_token()
            
            # Load instruments
            await self._load_instruments()
            
            # Verify connection
            profile = await self.get_profile()
            if profile:
                logger.info(f"Zerodha Kite initialized successfully for user: {profile.get('user_name')}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to initialize Zerodha Kite service: {e}")
            return False
    
    async def _generate_access_token(self) -> str:
        """Generate access token from request token"""
        if not self.credentials.request_token:
            raise ValueError("Request token required for access token generation")
        
        checksum_data = f"{self.credentials.api_key}{self.credentials.request_token}{self.credentials.api_secret}"
        checksum = hashlib.sha256(checksum_data.encode()).hexdigest()
        
        data = {
            "api_key": self.credentials.api_key,
            "request_token": self.credentials.request_token,
            "checksum": checksum
        }
        
        response = await self.session.post(f"{self.BASE_URL}/session/token", data=data)
        response.raise_for_status()
        
        result = response.json()
        self.credentials.access_token = result["data"]["access_token"]
        self.credentials.user_id = result["data"]["user_id"]
        
        return self.credentials.access_token
    
    async def _load_instruments(self):
        """Load all available instruments"""
        headers = {"Authorization": f"token {self.credentials.api_key}:{self.credentials.access_token}"}
        
        # Load instruments for NSE, BSE, and derivatives
        exchanges = ["NSE", "BSE", "NFO", "BFO", "CDS"]
        
        for exchange in exchanges:
            try:
                response = await self.session.get(
                    f"{self.BASE_URL}/instruments/{exchange}",
                    headers=headers
                )
                
                if response.status_code == 200:
                    content = response.text
                    lines = content.strip().split('\n')
                    
                    # Skip header line
                    for line in lines[1:]:
                        parts = line.split(',')
                        if len(parts) >= 12:
                            instrument = KiteInstrument(
                                instrument_token=int(parts[0]),
                                exchange_token=int(parts[1]),
                                tradingsymbol=parts[2],
                                name=parts[3],
                                last_price=float(parts[4]) if parts[4] else 0.0,
                                expiry=parts[5] if parts[5] else None,
                                strike=float(parts[6]) if parts[6] else None,
                                tick_size=float(parts[7]),
                                lot_size=int(parts[8]),
                                instrument_type=parts[9],
                                segment=parts[10],
                                exchange=parts[11]
                            )
                            self.instruments[instrument.tradingsymbol] = instrument
                            
            except Exception as e:
                logger.warning(f"Failed to load instruments for {exchange}: {e}")
        
        logger.info(f"Loaded {len(self.instruments)} instruments from Zerodha")
    
    async def get_profile(self) -> Optional[Dict[str, Any]]:
        """Get user profile information"""
        headers = {"Authorization": f"token {self.credentials.api_key}:{self.credentials.access_token}"}
        
        try:
            response = await self.session.get(f"{self.BASE_URL}/user/profile", headers=headers)
            response.raise_for_status()
            return response.json()["data"]
        except Exception as e:
            logger.error(f"Failed to get profile: {e}")
            return None
    
    async def get_margins(self) -> Optional[Dict[str, Any]]:
        """Get account margins"""
        headers = {"Authorization": f"token {self.credentials.api_key}:{self.credentials.access_token}"}
        
        try:
            response = await self.session.get(f"{self.BASE_URL}/user/margins", headers=headers)
            response.raise_for_status()
            return response.json()["data"]
        except Exception as e:
            logger.error(f"Failed to get margins: {e}")
            return None
    
    async def place_order(
        self,
        symbol: str,
        quantity: int,
        price: float,
        order_type: OrderType,
        side: str,
        product: str = "CNC",
        validity: str = "DAY",
        disclosed_quantity: int = 0,
        trigger_price: float = 0,
        tag: Optional[str] = None
    ) -> Optional[str]:
        """Place an order on Zerodha"""
        
        if symbol not in self.instruments:
            logger.error(f"Instrument {symbol} not found")
            return None
        
        headers = {"Authorization": f"token {self.credentials.api_key}:{self.credentials.access_token}"}
        
        # Map order types
        kite_order_type = {
            OrderType.MARKET: "MARKET",
            OrderType.LIMIT: "LIMIT",
            OrderType.STOP_LOSS: "SL",
            OrderType.STOP_LOSS_MARKET: "SL-M"
        }.get(order_type, "LIMIT")
        
        data = {
            "tradingsymbol": symbol,
            "quantity": str(quantity),
            "price": str(price) if order_type != OrderType.MARKET else "0",
            "order_type": kite_order_type,
            "transaction_type": side.upper(),
            "product": product,
            "validity": validity,
            "exchange": self.instruments[symbol].exchange
        }
        
        if disclosed_quantity > 0:
            data["disclosed_quantity"] = str(disclosed_quantity)
        
        if trigger_price > 0:
            data["trigger_price"] = str(trigger_price)
        
        if tag:
            data["tag"] = tag
        
        try:
            response = await self.session.post(f"{self.BASE_URL}/orders/regular", headers=headers, data=data)
            response.raise_for_status()
            
            result = response.json()
            order_id = result["data"]["order_id"]
            
            logger.info(f"Order placed successfully: {order_id}")
            return order_id
            
        except Exception as e:
            logger.error(f"Failed to place order: {e}")
            return None
    
    async def modify_order(
        self,
        order_id: str,
        quantity: Optional[int] = None,
        price: Optional[float] = None,
        order_type: Optional[OrderType] = None,
        trigger_price: Optional[float] = None
    ) -> bool:
        """Modify an existing order"""
        headers = {"Authorization": f"token {self.credentials.api_key}:{self.credentials.access_token}"}
        
        data = {}
        if quantity is not None:
            data["quantity"] = str(quantity)
        if price is not None:
            data["price"] = str(price)
        if order_type is not None:
            kite_order_type = {
                OrderType.MARKET: "MARKET",
                OrderType.LIMIT: "LIMIT",
                OrderType.STOP_LOSS: "SL",
                OrderType.STOP_LOSS_MARKET: "SL-M"
            }.get(order_type, "LIMIT")
            data["order_type"] = kite_order_type
        if trigger_price is not None:
            data["trigger_price"] = str(trigger_price)
        
        try:
            response = await self.session.put(f"{self.BASE_URL}/orders/regular/{order_id}", headers=headers, data=data)
            response.raise_for_status()
            logger.info(f"Order {order_id} modified successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to modify order {order_id}: {e}")
            return False
    
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel an order"""
        headers = {"Authorization": f"token {self.credentials.api_key}:{self.credentials.access_token}"}
        
        try:
            response = await self.session.delete(f"{self.BASE_URL}/orders/regular/{order_id}", headers=headers)
            response.raise_for_status()
            logger.info(f"Order {order_id} cancelled successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to cancel order {order_id}: {e}")
            return False
    
    async def get_orders(self) -> List[KiteOrder]:
        """Get all orders for the day"""
        headers = {"Authorization": f"token {self.credentials.api_key}:{self.credentials.access_token}"}
        
        try:
            response = await self.session.get(f"{self.BASE_URL}/orders", headers=headers)
            response.raise_for_status()
            
            orders_data = response.json()["data"]
            orders = []
            
            for order_data in orders_data:
                order = KiteOrder(
                    order_id=order_data["order_id"],
                    tradingsymbol=order_data["tradingsymbol"],
                    quantity=order_data["quantity"],
                    price=order_data["price"],
                    order_type=order_data["order_type"],
                    transaction_type=order_data["transaction_type"],
                    product=order_data["product"],
                    status=order_data["status"],
                    filled_quantity=order_data["filled_quantity"],
                    pending_quantity=order_data["pending_quantity"],
                    average_price=order_data["average_price"],
                    order_timestamp=datetime.fromisoformat(order_data["order_timestamp"])
                )
                orders.append(order)
            
            return orders
            
        except Exception as e:
            logger.error(f"Failed to get orders: {e}")
            return []
    
    async def get_positions(self) -> List[Position]:
        """Get current positions"""
        headers = {"Authorization": f"token {self.credentials.api_key}:{self.credentials.access_token}"}
        
        try:
            response = await self.session.get(f"{self.BASE_URL}/portfolio/positions", headers=headers)
            response.raise_for_status()
            
            positions_data = response.json()["data"]
            positions = []
            
            for position_data in positions_data["day"]:  # Day positions
                if position_data["quantity"] != 0:
                    position = Position(
                        symbol=position_data["tradingsymbol"],
                        quantity=position_data["quantity"],
                        average_price=position_data["average_price"],
                        current_price=position_data["last_price"],
                        pnl=position_data["pnl"],
                        broker_id="zerodha"
                    )
                    positions.append(position)
            
            return positions
            
        except Exception as e:
            logger.error(f"Failed to get positions: {e}")
            return []
    
    async def get_holdings(self) -> List[Dict[str, Any]]:
        """Get portfolio holdings"""
        headers = {"Authorization": f"token {self.credentials.api_key}:{self.credentials.access_token}"}
        
        try:
            response = await self.session.get(f"{self.BASE_URL}/portfolio/holdings", headers=headers)
            response.raise_for_status()
            return response.json()["data"]
        except Exception as e:
            logger.error(f"Failed to get holdings: {e}")
            return []
    
    async def get_ltp(self, symbols: List[str]) -> Dict[str, float]:
        """Get last traded price for symbols"""
        if not symbols:
            return {}
        
        # Convert symbols to instrument tokens
        instrument_tokens = []
        symbol_to_token = {}
        
        for symbol in symbols:
            if symbol in self.instruments:
                token = self.instruments[symbol].instrument_token
                instrument_tokens.append(str(token))
                symbol_to_token[str(token)] = symbol
        
        if not instrument_tokens:
            return {}
        
        headers = {"Authorization": f"token {self.credentials.api_key}:{self.credentials.access_token}"}
        
        try:
            instruments_param = ",".join(instrument_tokens)
            response = await self.session.get(
                f"{self.BASE_URL}/quote/ltp",
                params={"i": instruments_param},
                headers=headers
            )
            response.raise_for_status()
            
            ltp_data = response.json()["data"]
            result = {}
            
            for token, data in ltp_data.items():
                if token in symbol_to_token:
                    result[symbol_to_token[token]] = data["last_price"]
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get LTP: {e}")
            return {}
    
    async def start_websocket(self, tokens: List[int], callback_order_updates=None, callback_market_data=None):
        """Start WebSocket connection for real-time data"""
        self.order_updates_callback = callback_order_updates
        self.market_data_callback = callback_market_data
        self.subscribed_tokens = tokens
        
        try:
            uri = f"{self.WEBSOCKET_URL}?api_key={self.credentials.api_key}&access_token={self.credentials.access_token}"
            
            async with websockets.connect(uri) as websocket:
                self.websocket_connection = websocket
                
                # Subscribe to instruments
                if tokens:
                    subscribe_message = {
                        "a": "subscribe",
                        "v": tokens
                    }
                    await websocket.send(json.dumps(subscribe_message))
                
                # Listen for messages
                async for message in websocket:
                    await self._handle_websocket_message(message)
                    
        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
            self.websocket_connection = None
    
    async def _handle_websocket_message(self, message: str):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(message)
            
            if data.get("type") == "order":
                # Order update
                if self.order_updates_callback:
                    await self.order_updates_callback(data)
            
            elif data.get("type") == "quote":
                # Market data update
                if self.market_data_callback:
                    await self.market_data_callback(data)
                    
        except Exception as e:
            logger.error(f"Error handling WebSocket message: {e}")
    
    async def subscribe_to_instruments(self, tokens: List[int]):
        """Subscribe to additional instruments"""
        if self.websocket_connection:
            subscribe_message = {
                "a": "subscribe",
                "v": tokens
            }
            await self.websocket_connection.send(json.dumps(subscribe_message))
            self.subscribed_tokens.extend(tokens)
    
    async def unsubscribe_from_instruments(self, tokens: List[int]):
        """Unsubscribe from instruments"""
        if self.websocket_connection:
            unsubscribe_message = {
                "a": "unsubscribe",
                "v": tokens
            }
            await self.websocket_connection.send(json.dumps(unsubscribe_message))
            for token in tokens:
                if token in self.subscribed_tokens:
                    self.subscribed_tokens.remove(token)
    
    async def get_historical_data(
        self,
        instrument_token: int,
        from_date: datetime,
        to_date: datetime,
        interval: str = "day"
    ) -> List[Dict[str, Any]]:
        """Get historical candle data"""
        headers = {"Authorization": f"token {self.credentials.api_key}:{self.credentials.access_token}"}
        
        try:
            params = {
                "from": from_date.strftime("%Y-%m-%d"),
                "to": to_date.strftime("%Y-%m-%d"),
                "interval": interval
            }
            
            response = await self.session.get(
                f"{self.BASE_URL}/instruments/historical/{instrument_token}/{interval}",
                headers=headers,
                params=params
            )
            response.raise_for_status()
            
            return response.json()["data"]["candles"]
            
        except Exception as e:
            logger.error(f"Failed to get historical data: {e}")
            return []
    
    # Implement BrokerInterface methods
    async def execute_order(self, order: Order) -> bool:
        """Execute order through Kite API"""
        try:
            order_id = await self.place_order(
                symbol=order.symbol,
                quantity=order.quantity,
                price=order.price,
                order_type=order.order_type,
                side="BUY" if order.quantity > 0 else "SELL",
                product="CNC" if order.order_type != OrderType.MARKET else "MIS",
                tag=f"ai_signal_{order.signal_id}" if hasattr(order, 'signal_id') else None
            )
            
            if order_id:
                order.broker_order_id = order_id
                order.status = OrderStatus.SUBMITTED
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to execute order: {e}")
            order.status = OrderStatus.REJECTED
            return False
    
    async def get_account_balance(self) -> float:
        """Get available account balance"""
        margins = await self.get_margins()
        if margins and "equity" in margins:
            return margins["equity"]["available"]["cash"]
        return 0.0
    
    async def get_portfolio_positions(self) -> List[Position]:
        """Get current portfolio positions"""
        return await self.get_positions()
    
    async def close(self):
        """Close the service and cleanup resources"""
        if self.websocket_connection:
            await self.websocket_connection.close()
        await self.session.aclose()

class ZerodhaKiteServiceManager:
    """
    Manager class for handling multiple Kite instances and connection pooling
    """
    
    def __init__(self):
        self.services: Dict[str, ZerodhaKiteService] = {}
        self.market_data_pipeline = None
    
    async def add_account(self, user_id: str, credentials: KiteCredentials) -> bool:
        """Add a new Kite account"""
        try:
            service = ZerodhaKiteService(credentials)
            if await service.initialize():
                self.services[user_id] = service
                logger.info(f"Added Kite account for user: {user_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to add Kite account for {user_id}: {e}")
            return False
    
    async def remove_account(self, user_id: str):
        """Remove a Kite account"""
        if user_id in self.services:
            await self.services[user_id].close()
            del self.services[user_id]
            logger.info(f"Removed Kite account for user: {user_id}")
    
    async def get_service(self, user_id: str) -> Optional[ZerodhaKiteService]:
        """Get Kite service for a user"""
        return self.services.get(user_id)
    
    async def execute_bulk_orders(self, orders: List[tuple]) -> Dict[str, bool]:
        """Execute orders across multiple accounts"""
        results = {}
        
        for user_id, order in orders:
            service = self.services.get(user_id)
            if service:
                success = await service.execute_order(order)
                results[f"{user_id}_{order.symbol}"] = success
            else:
                results[f"{user_id}_{order.symbol}"] = False
                logger.error(f"No Kite service found for user: {user_id}")
        
        return results
    
    async def get_consolidated_positions(self) -> Dict[str, List[Position]]:
        """Get positions from all accounts"""
        all_positions = {}
        
        for user_id, service in self.services.items():
            positions = await service.get_portfolio_positions()
            all_positions[user_id] = positions
        
        return all_positions
    
    async def initialize_market_data_streaming(self, tokens: List[int]):
        """Initialize market data streaming across all accounts"""
        if self.services:
            # Use the first available service for market data
            primary_service = next(iter(self.services.values()))
            
            async def market_data_callback(data):
                # Broadcast market data to all interested services
                logger.debug(f"Market data update: {data}")
                # Here you would typically update your market data cache
                
            await primary_service.start_websocket(
                tokens=tokens,
                callback_market_data=market_data_callback
            )
    
    async def close_all(self):
        """Close all services"""
        for service in self.services.values():
            await service.close()
        self.services.clear()

# Global instance
kite_manager = ZerodhaKiteServiceManager()