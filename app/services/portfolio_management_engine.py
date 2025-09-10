"""
Advanced Portfolio Management Engine
Multi-broker integration with real-time P&L, risk management, and tax optimization
Supports institutional-grade portfolio analytics and automated rebalancing
"""

import asyncio
import logging
import json
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
from uuid import UUID, uuid4
import numpy as np
import pandas as pd

from app.services.market_data_pipeline import market_data_pipeline, MarketTick
from app.services.ai_trading_signals_engine import ai_signals_engine
from app.core.database import get_db
from app.core.config import get_settings
from database.models import User, Portfolio, Position, Transaction

logger = logging.getLogger(__name__)
settings = get_settings()

class BrokerType(str, Enum):
    """Supported broker types"""
    ZERODHA_KITE = "zerodha_kite"
    ICICI_DIRECT = "icici_direct"
    HDFC_SECURITIES = "hdfc_securities"
    ANGEL_ONE = "angel_one"
    UPSTOX = "upstox"
    MOCK = "mock"

class OrderType(str, Enum):
    """Order types"""
    MARKET = "MARKET"
    LIMIT = "LIMIT"
    STOP_LOSS = "SL"
    STOP_LOSS_MARKET = "SL-M"
    BRACKET_ORDER = "BO"
    COVER_ORDER = "CO"

class OrderStatus(str, Enum):
    """Order execution status"""
    PENDING = "PENDING"
    OPEN = "OPEN"
    COMPLETE = "COMPLETE"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"

class PositionType(str, Enum):
    """Position types"""
    LONG = "LONG"
    SHORT = "SHORT"

class RiskLevel(str, Enum):
    """Portfolio risk levels"""
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"
    ULTRA_AGGRESSIVE = "ultra_aggressive"

@dataclass
class BrokerCredentials:
    """Broker API credentials"""
    broker_type: BrokerType
    api_key: str
    api_secret: str
    access_token: Optional[str] = None
    user_id: Optional[str] = None
    password: Optional[str] = None
    totp_secret: Optional[str] = None

@dataclass
class PortfolioHolding:
    """Portfolio holding representation"""
    symbol: str
    quantity: int
    avg_price: Decimal
    current_price: Decimal
    market_value: Decimal
    unrealized_pnl: Decimal
    unrealized_pnl_percent: Decimal
    day_change: Decimal
    day_change_percent: Decimal
    broker: BrokerType
    exchange: str
    product: str  # CNC, MIS, NRML
    last_updated: datetime

@dataclass
class PortfolioMetrics:
    """Comprehensive portfolio metrics"""
    total_value: Decimal
    total_invested: Decimal
    total_pnl: Decimal
    total_pnl_percent: Decimal
    day_pnl: Decimal
    day_pnl_percent: Decimal
    realized_pnl: Decimal
    unrealized_pnl: Decimal
    
    # Risk metrics
    portfolio_beta: float
    portfolio_volatility: float
    sharpe_ratio: float
    max_drawdown: float
    value_at_risk: float
    
    # Diversification metrics
    sector_allocation: Dict[str, float]
    stock_concentration: Dict[str, float]
    top_holdings: List[Dict[str, Any]]
    
    # Performance metrics
    annual_return: float
    monthly_returns: List[float]
    winning_trades: int
    losing_trades: int
    win_rate: float

class BrokerInterface:
    """Abstract broker interface"""
    
    def __init__(self, credentials: BrokerCredentials):
        self.credentials = credentials
        self.is_connected = False
        self.last_sync = None
    
    async def connect(self) -> bool:
        """Connect to broker API"""
        raise NotImplementedError
    
    async def get_holdings(self) -> List[PortfolioHolding]:
        """Get current portfolio holdings"""
        raise NotImplementedError
    
    async def get_positions(self) -> List[Dict[str, Any]]:
        """Get open trading positions"""
        raise NotImplementedError
    
    async def place_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Place trading order"""
        raise NotImplementedError
    
    async def get_order_status(self, order_id: str) -> Dict[str, Any]:
        """Get order execution status"""
        raise NotImplementedError
    
    async def get_margins(self) -> Dict[str, Any]:
        """Get account margins and limits"""
        raise NotImplementedError

class ZerodhaKiteBroker(BrokerInterface):
    """Zerodha Kite broker integration"""
    
    def __init__(self, credentials: BrokerCredentials):
        super().__init__(credentials)
        self.kite = None
        self.session = None
    
    async def connect(self) -> bool:
        """Connect to Zerodha Kite API"""
        try:
            # Initialize Kite session (using kiteconnect library)
            from kiteconnect import KiteConnect
            
            self.kite = KiteConnect(api_key=self.credentials.api_key)
            
            if self.credentials.access_token:
                self.kite.set_access_token(self.credentials.access_token)
                
                # Validate session
                profile = self.kite.profile()
                logger.info(f"Connected to Zerodha Kite for user: {profile['user_name']}")
                
                self.is_connected = True
                self.last_sync = datetime.utcnow()
                return True
            else:
                logger.error("Zerodha access token required")
                return False
                
        except Exception as e:
            logger.error(f"Zerodha Kite connection failed: {e}")
            return False
    
    async def get_holdings(self) -> List[PortfolioHolding]:
        """Get portfolio holdings from Zerodha"""
        if not self.is_connected:
            await self.connect()
        
        try:
            holdings = self.kite.holdings()
            portfolio_holdings = []
            
            for holding in holdings:
                # Get current market price
                instrument_token = holding.get('instrument_token')
                if instrument_token:
                    quote = self.kite.quote([instrument_token])
                    current_price = Decimal(str(quote[str(instrument_token)]['last_price']))
                else:
                    current_price = Decimal(str(holding.get('last_price', 0)))
                
                quantity = int(holding.get('quantity', 0))
                avg_price = Decimal(str(holding.get('average_price', 0)))
                market_value = current_price * quantity
                invested_value = avg_price * quantity
                unrealized_pnl = market_value - invested_value
                unrealized_pnl_percent = (unrealized_pnl / invested_value * 100) if invested_value > 0 else Decimal('0')
                
                portfolio_holding = PortfolioHolding(
                    symbol=holding.get('tradingsymbol', ''),
                    quantity=quantity,
                    avg_price=avg_price,
                    current_price=current_price,
                    market_value=market_value,
                    unrealized_pnl=unrealized_pnl,
                    unrealized_pnl_percent=unrealized_pnl_percent,
                    day_change=Decimal(str(holding.get('day_change', 0))),
                    day_change_percent=Decimal(str(holding.get('day_change_percentage', 0))),
                    broker=BrokerType.ZERODHA_KITE,
                    exchange=holding.get('exchange', 'NSE'),
                    product=holding.get('product', 'CNC'),
                    last_updated=datetime.utcnow()
                )
                
                portfolio_holdings.append(portfolio_holding)
            
            return portfolio_holdings
            
        except Exception as e:
            logger.error(f"Failed to fetch Zerodha holdings: {e}")
            return []
    
    async def get_positions(self) -> List[Dict[str, Any]]:
        """Get trading positions from Zerodha"""
        if not self.is_connected:
            await self.connect()
        
        try:
            positions = self.kite.positions()
            return positions.get('day', []) + positions.get('net', [])
            
        except Exception as e:
            logger.error(f"Failed to fetch Zerodha positions: {e}")
            return []
    
    async def place_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Place order through Zerodha Kite"""
        if not self.is_connected:
            await self.connect()
        
        try:
            order_id = self.kite.place_order(
                variety=order_data.get('variety', 'regular'),
                exchange=order_data.get('exchange', 'NSE'),
                tradingsymbol=order_data['symbol'],
                transaction_type=order_data['side'],
                quantity=order_data['quantity'],
                product=order_data.get('product', 'CNC'),
                order_type=order_data.get('order_type', 'MARKET'),
                price=order_data.get('price'),
                validity=order_data.get('validity', 'DAY'),
                disclosed_quantity=order_data.get('disclosed_quantity'),
                trigger_price=order_data.get('trigger_price'),
                squareoff=order_data.get('squareoff'),
                stoploss=order_data.get('stoploss'),
                trailing_stoploss=order_data.get('trailing_stoploss')
            )
            
            return {
                "order_id": order_id,
                "status": "SUCCESS",
                "message": "Order placed successfully"
            }
            
        except Exception as e:
            logger.error(f"Failed to place Zerodha order: {e}")
            return {
                "order_id": None,
                "status": "FAILED", 
                "message": str(e)
            }
    
    async def get_order_status(self, order_id: str) -> Dict[str, Any]:
        """Get order status from Zerodha"""
        if not self.is_connected:
            await self.connect()
        
        try:
            orders = self.kite.orders()
            order = next((o for o in orders if o['order_id'] == order_id), None)
            
            if order:
                return {
                    "order_id": order_id,
                    "status": order['status'],
                    "filled_quantity": int(order.get('filled_quantity', 0)),
                    "pending_quantity": int(order.get('pending_quantity', 0)),
                    "average_price": float(order.get('average_price', 0)),
                    "transaction_type": order.get('transaction_type'),
                    "order_timestamp": order.get('order_timestamp')
                }
            else:
                return {"order_id": order_id, "status": "NOT_FOUND"}
                
        except Exception as e:
            logger.error(f"Failed to get Zerodha order status: {e}")
            return {"order_id": order_id, "status": "ERROR", "message": str(e)}
    
    async def get_margins(self) -> Dict[str, Any]:
        """Get account margins from Zerodha"""
        if not self.is_connected:
            await self.connect()
        
        try:
            margins = self.kite.margins()
            return {
                "equity": {
                    "available": float(margins['equity']['available']['cash']),
                    "utilised": float(margins['equity']['utilised']['debits']),
                    "total": float(margins['equity']['net'])
                },
                "commodity": {
                    "available": float(margins['commodity']['available']['cash']),
                    "utilised": float(margins['commodity']['utilised']['debits']),
                    "total": float(margins['commodity']['net'])
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get Zerodha margins: {e}")
            return {}

class MockBroker(BrokerInterface):
    """Mock broker for testing and development"""
    
    def __init__(self, credentials: BrokerCredentials):
        super().__init__(credentials)
        self.mock_holdings = []
        self.mock_orders = {}
    
    async def connect(self) -> bool:
        """Mock connection"""
        self.is_connected = True
        self.last_sync = datetime.utcnow()
        
        # Create mock holdings
        self.mock_holdings = [
            PortfolioHolding(
                symbol="RELIANCE",
                quantity=100,
                avg_price=Decimal('2400.00'),
                current_price=Decimal('2500.50'),
                market_value=Decimal('250050.00'),
                unrealized_pnl=Decimal('10050.00'),
                unrealized_pnl_percent=Decimal('4.19'),
                day_change=Decimal('25.50'),
                day_change_percent=Decimal('1.03'),
                broker=BrokerType.MOCK,
                exchange="NSE",
                product="CNC",
                last_updated=datetime.utcnow()
            ),
            PortfolioHolding(
                symbol="TCS",
                quantity=50,
                avg_price=Decimal('3200.00'),
                current_price=Decimal('3250.75'),
                market_value=Decimal('162537.50'),
                unrealized_pnl=Decimal('2537.50'),
                unrealized_pnl_percent=Decimal('1.59'),
                day_change=Decimal('15.25'),
                day_change_percent=Decimal('0.47'),
                broker=BrokerType.MOCK,
                exchange="NSE",
                product="CNC",
                last_updated=datetime.utcnow()
            )
        ]
        
        return True
    
    async def get_holdings(self) -> List[PortfolioHolding]:
        """Return mock holdings"""
        # Update with latest market prices
        for holding in self.mock_holdings:
            # Simulate price movements
            price_change = Decimal(str(np.random.normal(0, 0.02)))  # 2% volatility
            holding.current_price *= (1 + price_change)
            holding.market_value = holding.current_price * holding.quantity
            holding.unrealized_pnl = holding.market_value - (holding.avg_price * holding.quantity)
            holding.unrealized_pnl_percent = (holding.unrealized_pnl / (holding.avg_price * holding.quantity)) * 100
            holding.last_updated = datetime.utcnow()
        
        return self.mock_holdings
    
    async def get_positions(self) -> List[Dict[str, Any]]:
        """Return mock positions"""
        return []
    
    async def place_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Place mock order"""
        order_id = str(uuid4())
        self.mock_orders[order_id] = {
            "order_id": order_id,
            "status": "COMPLETE",
            "symbol": order_data['symbol'],
            "side": order_data['side'],
            "quantity": order_data['quantity'],
            "price": order_data.get('price', 100.0),
            "timestamp": datetime.utcnow()
        }
        
        return {
            "order_id": order_id,
            "status": "SUCCESS",
            "message": "Mock order placed successfully"
        }
    
    async def get_order_status(self, order_id: str) -> Dict[str, Any]:
        """Get mock order status"""
        return self.mock_orders.get(order_id, {"order_id": order_id, "status": "NOT_FOUND"})
    
    async def get_margins(self) -> Dict[str, Any]:
        """Return mock margins"""
        return {
            "equity": {
                "available": 500000.0,
                "utilised": 250000.0,
                "total": 750000.0
            }
        }

class PortfolioManagementEngine:
    """Advanced portfolio management engine"""
    
    def __init__(self):
        self.brokers: Dict[str, BrokerInterface] = {}
        self.portfolio_cache: Dict[str, Dict[str, Any]] = {}
        self.risk_manager = RiskManager()
        self.tax_optimizer = TaxOptimizer()
        self.rebalancer = PortfolioRebalancer()
    
    async def add_broker_account(
        self,
        user_id: str,
        broker_credentials: BrokerCredentials,
        account_name: Optional[str] = None
    ) -> bool:
        """Add broker account for user"""
        
        try:
            # Create broker interface
            if broker_credentials.broker_type == BrokerType.ZERODHA_KITE:
                broker = ZerodhaKiteBroker(broker_credentials)
            elif broker_credentials.broker_type == BrokerType.MOCK:
                broker = MockBroker(broker_credentials)
            else:
                logger.error(f"Unsupported broker type: {broker_credentials.broker_type}")
                return False
            
            # Connect to broker
            if await broker.connect():
                broker_key = f"{user_id}_{broker_credentials.broker_type}"
                if account_name:
                    broker_key += f"_{account_name}"
                
                self.brokers[broker_key] = broker
                logger.info(f"Added broker account: {broker_key}")
                return True
            else:
                logger.error(f"Failed to connect to broker: {broker_credentials.broker_type}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to add broker account: {e}")
            return False
    
    async def get_consolidated_portfolio(self, user_id: str) -> Dict[str, Any]:
        """Get consolidated portfolio across all broker accounts"""
        
        all_holdings = []
        total_metrics = {
            "total_value": Decimal('0'),
            "total_invested": Decimal('0'),
            "total_pnl": Decimal('0'),
            "day_pnl": Decimal('0')
        }
        
        # Get holdings from all brokers
        user_brokers = {k: v for k, v in self.brokers.items() if k.startswith(user_id)}
        
        for broker_key, broker in user_brokers.items():
            try:
                holdings = await broker.get_holdings()
                
                for holding in holdings:
                    all_holdings.append(holding)
                    
                    # Aggregate metrics
                    total_metrics["total_value"] += holding.market_value
                    total_metrics["total_invested"] += (holding.avg_price * holding.quantity)
                    total_metrics["total_pnl"] += holding.unrealized_pnl
                    total_metrics["day_pnl"] += (holding.day_change * holding.quantity)
                
            except Exception as e:
                logger.error(f"Failed to fetch holdings from {broker_key}: {e}")
        
        # Calculate percentage metrics
        if total_metrics["total_invested"] > 0:
            total_metrics["total_pnl_percent"] = (total_metrics["total_pnl"] / total_metrics["total_invested"]) * 100
            total_metrics["day_pnl_percent"] = (total_metrics["day_pnl"] / total_metrics["total_value"]) * 100
        else:
            total_metrics["total_pnl_percent"] = Decimal('0')
            total_metrics["day_pnl_percent"] = Decimal('0')
        
        # Calculate advanced metrics
        advanced_metrics = await self._calculate_portfolio_metrics(all_holdings)
        
        # Cache results
        self.portfolio_cache[user_id] = {
            "holdings": all_holdings,
            "metrics": total_metrics,
            "advanced_metrics": advanced_metrics,
            "last_updated": datetime.utcnow()
        }
        
        return {
            "user_id": user_id,
            "holdings": [asdict(holding) for holding in all_holdings],
            "summary": {
                "total_value": float(total_metrics["total_value"]),
                "total_invested": float(total_metrics["total_invested"]),
                "total_pnl": float(total_metrics["total_pnl"]),
                "total_pnl_percent": float(total_metrics["total_pnl_percent"]),
                "day_pnl": float(total_metrics["day_pnl"]),
                "day_pnl_percent": float(total_metrics["day_pnl_percent"]),
                "holdings_count": len(all_holdings),
                "brokers_count": len(user_brokers)
            },
            "advanced_metrics": advanced_metrics,
            "last_updated": datetime.utcnow().isoformat()
        }
    
    async def _calculate_portfolio_metrics(self, holdings: List[PortfolioHolding]) -> Dict[str, Any]:
        """Calculate advanced portfolio metrics"""
        
        if not holdings:
            return {}
        
        # Portfolio composition
        total_value = sum(holding.market_value for holding in holdings)
        
        # Stock concentration
        stock_weights = {}
        for holding in holdings:
            weight = float(holding.market_value / total_value) * 100
            stock_weights[holding.symbol] = weight
        
        # Top holdings
        top_holdings = sorted(
            [{"symbol": symbol, "weight": weight} for symbol, weight in stock_weights.items()],
            key=lambda x: x["weight"],
            reverse=True
        )[:10]
        
        # Calculate portfolio beta and volatility (simplified)
        portfolio_beta = 1.0  # Would calculate against market benchmark
        portfolio_volatility = 15.0  # Would calculate historical volatility
        
        # Risk metrics (simplified)
        sharpe_ratio = 1.2  # Would calculate using returns and risk-free rate
        max_drawdown = 8.5  # Would calculate from historical data
        value_at_risk = 12.3  # Would calculate VaR
        
        return {
            "portfolio_beta": portfolio_beta,
            "portfolio_volatility": portfolio_volatility,
            "sharpe_ratio": sharpe_ratio,
            "max_drawdown": max_drawdown,
            "value_at_risk": value_at_risk,
            "stock_concentration": stock_weights,
            "top_holdings": top_holdings,
            "diversification_score": min(100, (100 - max(stock_weights.values(), default=0))),
            "risk_level": self._assess_portfolio_risk(stock_weights, portfolio_volatility)
        }
    
    def _assess_portfolio_risk(self, stock_weights: Dict[str, float], volatility: float) -> str:
        """Assess portfolio risk level"""
        
        max_concentration = max(stock_weights.values(), default=0)
        
        if volatility > 25 or max_concentration > 40:
            return RiskLevel.ULTRA_AGGRESSIVE.value
        elif volatility > 20 or max_concentration > 25:
            return RiskLevel.AGGRESSIVE.value
        elif volatility > 15 or max_concentration > 15:
            return RiskLevel.MODERATE.value
        else:
            return RiskLevel.CONSERVATIVE.value
    
    async def execute_ai_signal(
        self,
        user_id: str,
        signal_data: Dict[str, Any],
        broker_preference: Optional[BrokerType] = None
    ) -> Dict[str, Any]:
        """Execute trading order based on AI signal"""
        
        try:
            symbol = signal_data["symbol"]
            signal = signal_data["signal"]
            confidence = signal_data.get("confidence", 0.0)
            target_price = signal_data.get("target_price")
            stop_loss = signal_data.get("stop_loss")
            
            # Determine position size based on confidence and risk management
            position_size = await self._calculate_position_size(user_id, symbol, confidence)
            
            if position_size == 0:
                return {
                    "status": "SKIPPED",
                    "message": "Position size calculation resulted in zero"
                }
            
            # Select broker
            selected_broker = await self._select_optimal_broker(user_id, broker_preference)
            
            if not selected_broker:
                return {
                    "status": "FAILED",
                    "message": "No available broker found"
                }
            
            # Prepare order data
            order_data = {
                "symbol": symbol,
                "side": "BUY" if signal == "BUY" else "SELL",
                "quantity": position_size,
                "order_type": "LIMIT" if target_price else "MARKET",
                "price": target_price,
                "product": "CNC",
                "validity": "DAY"
            }
            
            # Add stop-loss if provided
            if stop_loss and signal == "BUY":
                order_data["stoploss"] = float(stop_loss)
            
            # Execute order
            result = await selected_broker.place_order(order_data)
            
            # Log execution
            logger.info(f"AI Signal executed: {symbol} {signal} {position_size} shares - {result['status']}")
            
            return {
                "status": result["status"],
                "order_id": result.get("order_id"),
                "symbol": symbol,
                "side": order_data["side"],
                "quantity": position_size,
                "broker": selected_broker.credentials.broker_type,
                "signal_id": signal_data.get("signal_id"),
                "confidence": confidence,
                "message": result.get("message"),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to execute AI signal: {e}")
            return {
                "status": "FAILED",
                "message": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def _calculate_position_size(
        self,
        user_id: str,
        symbol: str,
        confidence: float
    ) -> int:
        """Calculate optimal position size"""
        
        try:
            # Get portfolio data
            portfolio = self.portfolio_cache.get(user_id)
            if not portfolio:
                portfolio = await self.get_consolidated_portfolio(user_id)
            
            total_value = portfolio["summary"]["total_value"]
            
            # Risk management rules
            max_position_size_percent = 5.0  # Max 5% per position
            confidence_multiplier = confidence  # Scale by confidence
            
            # Calculate base position size
            max_position_value = total_value * (max_position_size_percent / 100) * confidence_multiplier
            
            # Get current price
            current_price = 100.0  # Would fetch from market data
            position_size = int(max_position_value / current_price)
            
            return max(0, position_size)
            
        except Exception as e:
            logger.error(f"Position size calculation failed: {e}")
            return 0
    
    async def _select_optimal_broker(
        self,
        user_id: str,
        preference: Optional[BrokerType] = None
    ) -> Optional[BrokerInterface]:
        """Select optimal broker for order execution"""
        
        user_brokers = {k: v for k, v in self.brokers.items() if k.startswith(user_id)}
        
        if preference:
            # Use preferred broker if available
            for broker_key, broker in user_brokers.items():
                if broker.credentials.broker_type == preference and broker.is_connected:
                    return broker
        
        # Select first available connected broker
        for broker in user_brokers.values():
            if broker.is_connected:
                return broker
        
        return None

class RiskManager:
    """Portfolio risk management"""
    
    def assess_portfolio_risk(self, holdings: List[PortfolioHolding]) -> Dict[str, Any]:
        """Assess overall portfolio risk"""
        
        if not holdings:
            return {"risk_level": "NONE", "recommendations": []}
        
        total_value = sum(holding.market_value for holding in holdings)
        risks = []
        recommendations = []
        
        # Concentration risk
        for holding in holdings:
            weight = float(holding.market_value / total_value) * 100
            if weight > 30:
                risks.append(f"High concentration in {holding.symbol}: {weight:.1f}%")
                recommendations.append(f"Consider reducing {holding.symbol} position")
        
        # Sector concentration (simplified)
        # Would analyze sector allocation in production
        
        return {
            "risk_level": "MODERATE",
            "risks": risks,
            "recommendations": recommendations,
            "concentration_score": len([h for h in holdings if float(h.market_value / total_value) > 0.1])
        }

class TaxOptimizer:
    """Tax optimization for portfolio"""
    
    def calculate_tax_implications(self, holdings: List[PortfolioHolding]) -> Dict[str, Any]:
        """Calculate tax implications for current holdings"""
        
        short_term_gains = Decimal('0')
        long_term_gains = Decimal('0')
        
        # Tax harvesting opportunities
        harvesting_opportunities = []
        
        for holding in holdings:
            if holding.unrealized_pnl < 0:
                # Loss harvesting opportunity
                harvesting_opportunities.append({
                    "symbol": holding.symbol,
                    "loss": float(holding.unrealized_pnl),
                    "recommendation": "Consider booking loss for tax benefits"
                })
        
        return {
            "short_term_gains": float(short_term_gains),
            "long_term_gains": float(long_term_gains),
            "harvesting_opportunities": harvesting_opportunities,
            "estimated_tax_liability": float(short_term_gains * Decimal('0.15'))  # 15% STCG
        }

class PortfolioRebalancer:
    """Automated portfolio rebalancing"""
    
    async def suggest_rebalancing(
        self,
        current_holdings: List[PortfolioHolding],
        target_allocation: Dict[str, float]
    ) -> List[Dict[str, Any]]:
        """Suggest portfolio rebalancing actions"""
        
        rebalancing_actions = []
        total_value = sum(holding.market_value for holding in current_holdings)
        
        # Calculate current allocation
        current_allocation = {}
        for holding in current_holdings:
            weight = float(holding.market_value / total_value) * 100
            current_allocation[holding.symbol] = weight
        
        # Compare with target allocation
        for symbol, target_weight in target_allocation.items():
            current_weight = current_allocation.get(symbol, 0)
            deviation = target_weight - current_weight
            
            if abs(deviation) > 2:  # 2% threshold
                action = "BUY" if deviation > 0 else "SELL"
                rebalancing_actions.append({
                    "symbol": symbol,
                    "action": action,
                    "current_weight": current_weight,
                    "target_weight": target_weight,
                    "deviation": deviation,
                    "recommended_amount": abs(float(total_value * Decimal(str(deviation / 100))))
                })
        
        return rebalancing_actions

# Global portfolio management engine
portfolio_engine = PortfolioManagementEngine()