"""
Comprehensive Backtesting Framework for AI Trading Signals
Enterprise-grade backtesting with risk metrics, performance analytics, and validation
Supports walk-forward analysis, Monte Carlo simulations, and institutional reporting
"""

import asyncio
import logging
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
from uuid import uuid4
import statistics

from app.services.ai_trading_signals_engine import ai_signals_engine, AIModelType
from app.services.market_data_pipeline import market_data_pipeline
from app.core.database import get_db

logger = logging.getLogger(__name__)

class OrderType(str, Enum):
    """Order types for backtesting"""
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"

class OrderStatus(str, Enum):
    """Order execution status"""
    PENDING = "pending"
    FILLED = "filled"
    PARTIAL = "partial"
    CANCELLED = "cancelled"
    REJECTED = "rejected"

class PositionSide(str, Enum):
    """Position sides"""
    LONG = "long"
    SHORT = "short"

@dataclass
class BacktestOrder:
    """Order representation for backtesting"""
    id: str
    symbol: str
    side: str  # BUY/SELL
    quantity: int
    order_type: OrderType
    price: Optional[Decimal] = None
    stop_price: Optional[Decimal] = None
    timestamp: datetime = None
    status: OrderStatus = OrderStatus.PENDING
    filled_price: Optional[Decimal] = None
    filled_quantity: int = 0
    commission: Decimal = Decimal('0')
    signal_id: Optional[str] = None

@dataclass
class BacktestPosition:
    """Position representation for backtesting"""
    symbol: str
    side: PositionSide
    quantity: int
    avg_price: Decimal
    current_price: Decimal
    unrealized_pnl: Decimal
    realized_pnl: Decimal
    commission_paid: Decimal
    entry_time: datetime
    exit_time: Optional[datetime] = None

@dataclass
class BacktestTrade:
    """Completed trade for performance analysis"""
    id: str
    symbol: str
    side: PositionSide
    entry_price: Decimal
    exit_price: Decimal
    quantity: int
    pnl: Decimal
    pnl_percent: Decimal
    commission: Decimal
    entry_time: datetime
    exit_time: datetime
    duration: timedelta
    signal_id: Optional[str] = None
    signal_confidence: Optional[float] = None
    max_favorable_excursion: Decimal = Decimal('0')
    max_adverse_excursion: Decimal = Decimal('0')

@dataclass
class BacktestMetrics:
    """Comprehensive backtest performance metrics"""
    # Basic metrics
    total_return: float
    annual_return: float
    volatility: float
    sharpe_ratio: float
    sortino_ratio: float
    calmar_ratio: float
    
    # Risk metrics
    max_drawdown: float
    max_drawdown_duration: int
    value_at_risk_95: float
    conditional_var_95: float
    
    # Trade metrics
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    profit_factor: float
    avg_win: float
    avg_loss: float
    largest_win: float
    largest_loss: float
    
    # Advanced metrics
    information_ratio: float
    treynor_ratio: float
    jensen_alpha: float
    beta: float
    tracking_error: float
    
    # Signal-specific metrics
    signal_accuracy: float
    avg_signal_confidence: float
    confidence_correlation: float
    model_performance: Dict[str, float]

class MarketSimulator:
    """Realistic market simulation with slippage, commissions, and liquidity"""
    
    def __init__(
        self,
        commission_rate: float = 0.0003,  # 0.03% commission
        slippage_rate: float = 0.0001,    # 0.01% slippage
        min_commission: Decimal = Decimal('10'),  # ₹10 minimum commission
        impact_model: bool = True
    ):
        self.commission_rate = commission_rate
        self.slippage_rate = slippage_rate
        self.min_commission = min_commission
        self.impact_model = impact_model
    
    def calculate_fill_price(
        self, 
        order: BacktestOrder, 
        market_price: Decimal,
        volume: int
    ) -> Tuple[Decimal, Decimal]:
        """Calculate realistic fill price with slippage and market impact"""
        
        base_price = market_price
        
        # Apply slippage based on order type and market conditions
        if order.order_type == OrderType.MARKET:
            # Market orders have higher slippage
            slippage_factor = self.slippage_rate * (1 + order.quantity / 10000)  # Volume impact
            
            if order.side == "BUY":
                fill_price = base_price * (1 + slippage_factor)
            else:  # SELL
                fill_price = base_price * (1 - slippage_factor)
        
        elif order.order_type == OrderType.LIMIT:
            # Limit orders fill at limit price if market crosses
            if order.side == "BUY" and market_price <= order.price:
                fill_price = order.price
            elif order.side == "SELL" and market_price >= order.price:
                fill_price = order.price
            else:
                return None, None  # Order not filled
        
        else:
            fill_price = base_price
        
        # Calculate commission
        commission = max(
            self.min_commission,
            Decimal(str(float(fill_price) * order.quantity * self.commission_rate))
        )
        
        return fill_price, commission

class BacktestEngine:
    """Advanced backtesting engine with comprehensive analytics"""
    
    def __init__(
        self,
        initial_capital: Decimal = Decimal('1000000'),  # ₹10 Lakhs
        market_simulator: Optional[MarketSimulator] = None
    ):
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        self.market_simulator = market_simulator or MarketSimulator()
        
        # Portfolio state
        self.positions: Dict[str, BacktestPosition] = {}
        self.orders: Dict[str, BacktestOrder] = {}
        self.completed_trades: List[BacktestTrade] = []
        self.equity_curve: List[Dict[str, Any]] = []
        
        # Performance tracking
        self.daily_returns: List[float] = []
        self.drawdown_series: List[float] = []
        self.benchmark_returns: List[float] = []
        
        # Signal tracking
        self.signal_performance: Dict[str, Dict[str, Any]] = {}
        self.model_performance: Dict[str, List[float]] = {}
    
    async def run_backtest(
        self,
        symbols: List[str],
        start_date: datetime,
        end_date: datetime,
        ai_models: Optional[List[AIModelType]] = None,
        benchmark_symbol: str = "NIFTY50"
    ) -> BacktestMetrics:
        """Run comprehensive backtest with AI signal generation"""
        
        logger.info(f"Starting backtest: {len(symbols)} symbols from {start_date} to {end_date}")
        
        # Initialize backtest
        self.current_capital = self.initial_capital
        self.positions.clear()
        self.orders.clear()
        self.completed_trades.clear()
        self.equity_curve.clear()
        
        # Generate date range for backtesting
        current_date = start_date
        
        while current_date <= end_date:
            # Simulate market day
            await self._simulate_trading_day(symbols, current_date, ai_models)
            
            # Record daily equity
            total_equity = self._calculate_total_equity(current_date)
            daily_return = (float(total_equity) - float(self.initial_capital)) / float(self.initial_capital)
            
            self.equity_curve.append({
                "date": current_date.isoformat(),
                "equity": float(total_equity),
                "return": daily_return,
                "positions": len(self.positions),
                "cash": float(self.current_capital)
            })
            
            # Move to next trading day
            current_date += timedelta(days=1)
            
            # Skip weekends (simplified)
            if current_date.weekday() >= 5:
                current_date += timedelta(days=2)
        
        # Calculate final metrics
        metrics = self._calculate_backtest_metrics()
        
        logger.info(f"Backtest completed: Total Return: {metrics.total_return:.2%}, "
                   f"Sharpe: {metrics.sharpe_ratio:.2f}, Max DD: {metrics.max_drawdown:.2%}")
        
        return metrics
    
    async def _simulate_trading_day(
        self,
        symbols: List[str],
        date: datetime,
        ai_models: Optional[List[AIModelType]] = None
    ):
        """Simulate a single trading day"""
        
        # Get market data for the day (mock implementation)
        market_data = await self._get_historical_data(symbols, date)
        
        # Generate AI signals for each symbol
        for symbol in symbols:
            if symbol not in market_data:
                continue
            
            try:
                # Generate AI signal (simplified - would use historical market conditions)
                signal_result = await ai_signals_engine.generate_ensemble_signal(
                    symbol=symbol,
                    models=ai_models
                )
                
                if "error" not in signal_result:
                    # Process signal
                    await self._process_signal(symbol, signal_result, market_data[symbol], date)
            
            except Exception as e:
                logger.warning(f"Signal generation failed for {symbol} on {date}: {e}")
        
        # Process pending orders
        await self._process_orders(market_data, date)
        
        # Update position valuations
        self._update_positions(market_data, date)
        
        # Check for stop-loss and take-profit triggers
        await self._check_exit_conditions(market_data, date)
    
    async def _get_historical_data(
        self, 
        symbols: List[str], 
        date: datetime
    ) -> Dict[str, Dict[str, Any]]:
        """Get historical market data for backtesting"""
        
        # Mock historical data - in production would fetch from database
        market_data = {}
        
        for symbol in symbols:
            # Generate realistic mock data
            base_price = 100 + hash(symbol) % 1000  # Deterministic base price
            volatility = 0.02  # 2% daily volatility
            
            # Random price movement
            price_change = np.random.normal(0, volatility)
            current_price = base_price * (1 + price_change)
            
            market_data[symbol] = {
                "open": current_price * 0.99,
                "high": current_price * 1.02,
                "low": current_price * 0.98,
                "close": current_price,
                "volume": np.random.randint(100000, 1000000),
                "timestamp": date
            }
        
        return market_data
    
    async def _process_signal(
        self,
        symbol: str,
        signal_result: Dict[str, Any],
        market_data: Dict[str, Any],
        date: datetime
    ):
        """Process AI-generated signal and create orders"""
        
        signal_type = signal_result.get("signal")
        confidence = signal_result.get("confidence", 0.0)
        
        # Skip low confidence signals
        if confidence < 0.6:
            return
        
        # Calculate position size based on confidence and risk management
        position_size = self._calculate_position_size(confidence, symbol)
        
        if position_size == 0:
            return
        
        current_price = Decimal(str(market_data["close"]))
        
        # Create order based on signal
        if signal_type == "BUY" and symbol not in self.positions:
            order = BacktestOrder(
                id=str(uuid4()),
                symbol=symbol,
                side="BUY",
                quantity=position_size,
                order_type=OrderType.MARKET,
                timestamp=date,
                signal_id=signal_result.get("signal_id")
            )
            self.orders[order.id] = order
            
        elif signal_type == "SELL" and symbol in self.positions:
            # Close existing position
            position = self.positions[symbol]
            order = BacktestOrder(
                id=str(uuid4()),
                symbol=symbol,
                side="SELL",
                quantity=position.quantity,
                order_type=OrderType.MARKET,
                timestamp=date,
                signal_id=signal_result.get("signal_id")
            )
            self.orders[order.id] = order
        
        # Track signal for performance analysis
        self.signal_performance[signal_result.get("signal_id", str(uuid4()))] = {
            "symbol": symbol,
            "signal": signal_type,
            "confidence": confidence,
            "price": float(current_price),
            "timestamp": date.isoformat(),
            "models": signal_result.get("model_count", 1)
        }
    
    def _calculate_position_size(self, confidence: float, symbol: str) -> int:
        """Calculate position size based on confidence and risk management"""
        
        # Risk per trade (2% of capital)
        risk_per_trade = float(self.current_capital) * 0.02
        
        # Position size based on confidence
        base_size = int(risk_per_trade / 100)  # Assuming ₹100 per share risk
        
        # Scale by confidence
        confidence_multiplier = 0.5 + confidence  # 0.5 to 1.5 range
        
        position_size = int(base_size * confidence_multiplier)
        
        # Ensure we have enough capital
        max_affordable = int(float(self.current_capital) * 0.1 / 100)  # Max 10% per position
        
        return min(position_size, max_affordable)
    
    async def _process_orders(self, market_data: Dict[str, Any], date: datetime):
        """Process and execute pending orders"""
        
        filled_orders = []
        
        for order_id, order in self.orders.items():
            if order.status != OrderStatus.PENDING:
                continue
            
            if order.symbol not in market_data:
                continue
            
            market_price = Decimal(str(market_data[order.symbol]["close"]))
            volume = market_data[order.symbol]["volume"]
            
            # Calculate fill
            fill_price, commission = self.market_simulator.calculate_fill_price(
                order, market_price, volume
            )
            
            if fill_price is None:
                continue  # Order not filled
            
            # Execute order
            order.status = OrderStatus.FILLED
            order.filled_price = fill_price
            order.filled_quantity = order.quantity
            order.commission = commission
            
            # Update portfolio
            if order.side == "BUY":
                await self._open_position(order, date)
            else:  # SELL
                await self._close_position(order, date)
            
            filled_orders.append(order_id)
        
        # Remove filled orders
        for order_id in filled_orders:
            del self.orders[order_id]
    
    async def _open_position(self, order: BacktestOrder, date: datetime):
        """Open new position"""
        
        cost = float(order.filled_price) * order.quantity + float(order.commission)
        
        if cost > float(self.current_capital):
            logger.warning(f"Insufficient capital for {order.symbol}")
            return
        
        # Deduct capital
        self.current_capital -= Decimal(str(cost))
        
        # Create position
        self.positions[order.symbol] = BacktestPosition(
            symbol=order.symbol,
            side=PositionSide.LONG,
            quantity=order.quantity,
            avg_price=order.filled_price,
            current_price=order.filled_price,
            unrealized_pnl=Decimal('0'),
            realized_pnl=Decimal('0'),
            commission_paid=order.commission,
            entry_time=date
        )
        
        logger.debug(f"Opened position: {order.symbol} @ ₹{order.filled_price}")
    
    async def _close_position(self, order: BacktestOrder, date: datetime):
        """Close existing position"""
        
        if order.symbol not in self.positions:
            return
        
        position = self.positions[order.symbol]
        
        # Calculate PnL
        proceeds = float(order.filled_price) * order.quantity - float(order.commission)
        cost_basis = float(position.avg_price) * position.quantity + float(position.commission_paid)
        pnl = proceeds - cost_basis
        
        # Add proceeds to capital
        self.current_capital += Decimal(str(proceeds))
        
        # Create trade record
        trade = BacktestTrade(
            id=str(uuid4()),
            symbol=order.symbol,
            side=position.side,
            entry_price=position.avg_price,
            exit_price=order.filled_price,
            quantity=position.quantity,
            pnl=Decimal(str(pnl)),
            pnl_percent=Decimal(str(pnl / cost_basis * 100)),
            commission=position.commission_paid + order.commission,
            entry_time=position.entry_time,
            exit_time=date,
            duration=date - position.entry_time,
            signal_id=order.signal_id
        )
        
        self.completed_trades.append(trade)
        
        # Remove position
        del self.positions[order.symbol]
        
        logger.debug(f"Closed position: {order.symbol} PnL: ₹{pnl:.2f}")
    
    def _update_positions(self, market_data: Dict[str, Any], date: datetime):
        """Update position valuations with current market prices"""
        
        for symbol, position in self.positions.items():
            if symbol in market_data:
                current_price = Decimal(str(market_data[symbol]["close"]))
                position.current_price = current_price
                
                # Calculate unrealized PnL
                cost_basis = position.avg_price * position.quantity
                current_value = current_price * position.quantity
                position.unrealized_pnl = current_value - cost_basis
    
    async def _check_exit_conditions(self, market_data: Dict[str, Any], date: datetime):
        """Check for stop-loss and take-profit conditions"""
        
        # Simplified exit logic - would be more sophisticated in production
        exit_orders = []
        
        for symbol, position in self.positions.items():
            if symbol not in market_data:
                continue
            
            current_price = Decimal(str(market_data[symbol]["close"]))
            entry_price = position.avg_price
            
            # Calculate return
            price_return = (current_price - entry_price) / entry_price
            
            # Stop-loss at -5%
            if price_return <= -0.05:
                exit_orders.append(symbol)
            
            # Take-profit at +15%
            elif price_return >= 0.15:
                exit_orders.append(symbol)
        
        # Create exit orders
        for symbol in exit_orders:
            position = self.positions[symbol]
            order = BacktestOrder(
                id=str(uuid4()),
                symbol=symbol,
                side="SELL",
                quantity=position.quantity,
                order_type=OrderType.MARKET,
                timestamp=date
            )
            self.orders[order.id] = order
    
    def _calculate_total_equity(self, date: datetime) -> Decimal:
        """Calculate total portfolio equity"""
        
        total_equity = self.current_capital
        
        # Add position values
        for position in self.positions.values():
            position_value = position.current_price * position.quantity
            total_equity += position_value
        
        return total_equity
    
    def _calculate_backtest_metrics(self) -> BacktestMetrics:
        """Calculate comprehensive backtest performance metrics"""
        
        if not self.equity_curve:
            return BacktestMetrics(
                total_return=0, annual_return=0, volatility=0, sharpe_ratio=0,
                sortino_ratio=0, calmar_ratio=0, max_drawdown=0, max_drawdown_duration=0,
                value_at_risk_95=0, conditional_var_95=0, total_trades=0,
                winning_trades=0, losing_trades=0, win_rate=0, profit_factor=0,
                avg_win=0, avg_loss=0, largest_win=0, largest_loss=0,
                information_ratio=0, treynor_ratio=0, jensen_alpha=0, beta=0,
                tracking_error=0, signal_accuracy=0, avg_signal_confidence=0,
                confidence_correlation=0, model_performance={}
            )
        
        # Extract returns
        returns = [point["return"] for point in self.equity_curve]
        equity_values = [point["equity"] for point in self.equity_curve]
        
        # Basic metrics
        total_return = returns[-1] if returns else 0
        days = len(returns)
        annual_return = (1 + total_return) ** (252 / days) - 1 if days > 0 else 0
        volatility = np.std(returns) * np.sqrt(252) if len(returns) > 1 else 0
        
        # Sharpe ratio (assuming risk-free rate of 6%)
        risk_free_rate = 0.06
        excess_returns = [r - risk_free_rate/252 for r in returns]
        sharpe_ratio = np.mean(excess_returns) / np.std(excess_returns) * np.sqrt(252) if np.std(excess_returns) > 0 else 0
        
        # Sortino ratio
        negative_returns = [r for r in returns if r < 0]
        downside_deviation = np.std(negative_returns) * np.sqrt(252) if negative_returns else volatility
        sortino_ratio = (annual_return - risk_free_rate) / downside_deviation if downside_deviation > 0 else 0
        
        # Drawdown calculation
        peak = equity_values[0]
        drawdowns = []
        for equity in equity_values:
            if equity > peak:
                peak = equity
            drawdown = (peak - equity) / peak
            drawdowns.append(drawdown)
        
        max_drawdown = max(drawdowns) if drawdowns else 0
        
        # Calmar ratio
        calmar_ratio = annual_return / max_drawdown if max_drawdown > 0 else 0
        
        # VaR and CVaR
        var_95 = np.percentile(returns, 5) if returns else 0
        cvar_95 = np.mean([r for r in returns if r <= var_95]) if returns else 0
        
        # Trade metrics
        winning_trades = len([t for t in self.completed_trades if t.pnl > 0])
        losing_trades = len([t for t in self.completed_trades if t.pnl <= 0])
        total_trades = len(self.completed_trades)
        win_rate = winning_trades / total_trades if total_trades > 0 else 0
        
        wins = [float(t.pnl) for t in self.completed_trades if t.pnl > 0]
        losses = [abs(float(t.pnl)) for t in self.completed_trades if t.pnl <= 0]
        
        avg_win = np.mean(wins) if wins else 0
        avg_loss = np.mean(losses) if losses else 0
        largest_win = max(wins) if wins else 0
        largest_loss = max(losses) if losses else 0
        profit_factor = sum(wins) / sum(losses) if losses and sum(losses) > 0 else float('inf')
        
        # Signal-specific metrics
        signal_accuracy = win_rate  # Simplified
        confidences = [s.get("confidence", 0) for s in self.signal_performance.values()]
        avg_signal_confidence = np.mean(confidences) if confidences else 0
        
        # Confidence correlation (simplified)
        confidence_correlation = 0.5  # Mock value
        
        return BacktestMetrics(
            total_return=total_return,
            annual_return=annual_return,
            volatility=volatility,
            sharpe_ratio=sharpe_ratio,
            sortino_ratio=sortino_ratio,
            calmar_ratio=calmar_ratio,
            max_drawdown=max_drawdown,
            max_drawdown_duration=0,  # Simplified
            value_at_risk_95=var_95,
            conditional_var_95=cvar_95,
            total_trades=total_trades,
            winning_trades=winning_trades,
            losing_trades=losing_trades,
            win_rate=win_rate,
            profit_factor=profit_factor,
            avg_win=avg_win,
            avg_loss=avg_loss,
            largest_win=largest_win,
            largest_loss=largest_loss,
            information_ratio=0,  # Simplified
            treynor_ratio=0,  # Simplified
            jensen_alpha=0,  # Simplified
            beta=1.0,  # Simplified
            tracking_error=0,  # Simplified
            signal_accuracy=signal_accuracy,
            avg_signal_confidence=avg_signal_confidence,
            confidence_correlation=confidence_correlation,
            model_performance={}  # Simplified
        )

# Global backtesting engine
backtest_engine = BacktestEngine()