"""
Dashboard Service for Signal Management and Analytics
Provides comprehensive analytics, portfolio insights, and signal performance tracking
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from decimal import Decimal
import json
from collections import defaultdict

import pandas as pd
import numpy as np
from pydantic import BaseModel, Field
from sqlalchemy import select, func, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.services.ai_trading_signals_engine import (
    AITradingSignalsEngine, 
    SignalType, 
    SignalStatus,
    TradingSignal
)
from app.services.portfolio_management_engine import PortfolioManager
from app.services.subscription_billing_service import billing_service
from app.services.zerodha_kite_service import kite_manager

logger = logging.getLogger(__name__)

class DashboardMetric(str, Enum):
    """Dashboard metric types"""
    PORTFOLIO_VALUE = "portfolio_value"
    TOTAL_PNL = "total_pnl"
    WIN_RATE = "win_rate"
    SIGNALS_GENERATED = "signals_generated"
    SIGNALS_EXECUTED = "signals_executed"
    ROI = "roi"
    SHARPE_RATIO = "sharpe_ratio"
    MAX_DRAWDOWN = "max_drawdown"
    DAILY_RETURN = "daily_return"
    RISK_SCORE = "risk_score"

class TimeRange(str, Enum):
    """Time range for analytics"""
    TODAY = "today"
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"
    ALL_TIME = "all_time"

# Pydantic Models

class PortfolioSummary(BaseModel):
    """Portfolio summary data"""
    total_value: Decimal
    total_invested: Decimal
    current_pnl: Decimal
    pnl_percentage: float
    positions_count: int
    cash_balance: Decimal
    margin_used: Decimal
    margin_available: Decimal

class SignalPerformance(BaseModel):
    """Signal performance metrics"""
    signal_id: str
    symbol: str
    signal_type: SignalType
    entry_price: Decimal
    current_price: Decimal
    target_price: Optional[Decimal]
    stop_loss: Optional[Decimal]
    pnl: Decimal
    pnl_percentage: float
    status: SignalStatus
    generated_at: datetime
    executed_at: Optional[datetime]
    closed_at: Optional[datetime]

class AnalyticsSummary(BaseModel):
    """Analytics summary data"""
    time_range: TimeRange
    total_signals: int
    executed_signals: int
    successful_signals: int
    win_rate: float
    average_return: float
    total_return: float
    sharpe_ratio: float
    max_drawdown: float
    best_performer: Optional[Dict[str, Any]]
    worst_performer: Optional[Dict[str, Any]]

class MarketOverview(BaseModel):
    """Market overview data"""
    nifty_50: Dict[str, Any]
    sensex: Dict[str, Any]
    bank_nifty: Dict[str, Any]
    top_gainers: List[Dict[str, Any]]
    top_losers: List[Dict[str, Any]]
    market_sentiment: str
    vix_level: float

class RiskMetrics(BaseModel):
    """Risk assessment metrics"""
    portfolio_beta: float
    portfolio_var: float  # Value at Risk
    position_concentration: float
    sector_exposure: Dict[str, float]
    risk_score: int  # 1-100
    risk_level: str  # Low, Medium, High, Very High
    recommendations: List[str]

class DashboardData(BaseModel):
    """Complete dashboard data"""
    user_id: str
    portfolio_summary: PortfolioSummary
    recent_signals: List[SignalPerformance]
    analytics: AnalyticsSummary
    market_overview: MarketOverview
    risk_metrics: RiskMetrics
    subscription_info: Dict[str, Any]
    alerts: List[Dict[str, Any]]
    last_updated: datetime

# Service Implementation

class DashboardService:
    """
    Comprehensive dashboard service for signal management and analytics
    """
    
    def __init__(self):
        self.ai_engine = AITradingSignalsEngine()
        self.portfolio_manager = PortfolioManager()
        self._cache = {}
        self._cache_ttl = 60  # 60 seconds cache
    
    async def get_dashboard_data(
        self,
        db: AsyncSession,
        user_id: str,
        time_range: TimeRange = TimeRange.MONTH
    ) -> DashboardData:
        """Get complete dashboard data for user"""
        
        # Check cache
        cache_key = f"{user_id}_{time_range.value}"
        if cache_key in self._cache:
            cached_data, cached_time = self._cache[cache_key]
            if (datetime.utcnow() - cached_time).seconds < self._cache_ttl:
                return cached_data
        
        # Fetch all data components
        portfolio_summary = await self._get_portfolio_summary(user_id)
        recent_signals = await self._get_recent_signals(db, user_id, time_range)
        analytics = await self._get_analytics_summary(db, user_id, time_range)
        market_overview = await self._get_market_overview()
        risk_metrics = await self._get_risk_metrics(user_id, portfolio_summary)
        subscription_info = await self._get_subscription_info(db, user_id)
        alerts = await self._get_user_alerts(db, user_id)
        
        dashboard_data = DashboardData(
            user_id=user_id,
            portfolio_summary=portfolio_summary,
            recent_signals=recent_signals,
            analytics=analytics,
            market_overview=market_overview,
            risk_metrics=risk_metrics,
            subscription_info=subscription_info,
            alerts=alerts,
            last_updated=datetime.utcnow()
        )
        
        # Update cache
        self._cache[cache_key] = (dashboard_data, datetime.utcnow())
        
        return dashboard_data
    
    async def _get_portfolio_summary(self, user_id: str) -> PortfolioSummary:
        """Get portfolio summary for user"""
        
        # Get Kite service for user
        kite_service = await kite_manager.get_service(user_id)
        
        if not kite_service:
            # Return empty portfolio if no trading account
            return PortfolioSummary(
                total_value=Decimal('0'),
                total_invested=Decimal('0'),
                current_pnl=Decimal('0'),
                pnl_percentage=0.0,
                positions_count=0,
                cash_balance=Decimal('0'),
                margin_used=Decimal('0'),
                margin_available=Decimal('0')
            )
        
        # Get positions
        positions = await kite_service.get_positions()
        
        # Get margins
        margins = await kite_service.get_margins()
        
        # Calculate portfolio metrics
        total_value = Decimal('0')
        total_invested = Decimal('0')
        current_pnl = Decimal('0')
        
        for position in positions:
            position_value = Decimal(str(position.current_price * abs(position.quantity)))
            invested_value = Decimal(str(position.average_price * abs(position.quantity)))
            
            total_value += position_value
            total_invested += invested_value
            current_pnl += Decimal(str(position.pnl))
        
        # Add cash balance to total value
        cash_balance = Decimal('0')
        margin_available = Decimal('0')
        margin_used = Decimal('0')
        
        if margins and 'equity' in margins:
            cash_balance = Decimal(str(margins['equity']['available'].get('cash', 0)))
            margin_available = Decimal(str(margins['equity']['available'].get('cash', 0)))
            margin_used = Decimal(str(margins['equity']['utilised'].get('debits', 0)))
            total_value += cash_balance
        
        pnl_percentage = 0.0
        if total_invested > 0:
            pnl_percentage = float((current_pnl / total_invested) * 100)
        
        return PortfolioSummary(
            total_value=total_value,
            total_invested=total_invested,
            current_pnl=current_pnl,
            pnl_percentage=round(pnl_percentage, 2),
            positions_count=len(positions),
            cash_balance=cash_balance,
            margin_used=margin_used,
            margin_available=margin_available
        )
    
    async def _get_recent_signals(
        self,
        db: AsyncSession,
        user_id: str,
        time_range: TimeRange
    ) -> List[SignalPerformance]:
        """Get recent signals with performance metrics"""
        
        # Calculate date range
        start_date = self._get_start_date(time_range)
        
        # Query signals from database
        from app.models.signals import Signal
        
        result = await db.execute(
            select(Signal)
            .where(
                and_(
                    Signal.user_id == user_id,
                    Signal.created_at >= start_date
                )
            )
            .order_by(desc(Signal.created_at))
            .limit(50)
        )
        
        signals = result.scalars().all()
        
        # Get current prices for signals
        kite_service = await kite_manager.get_service(user_id)
        current_prices = {}
        
        if kite_service and signals:
            symbols = list(set([s.symbol for s in signals]))
            current_prices = await kite_service.get_ltp(symbols)
        
        # Build signal performance list
        signal_performances = []
        
        for signal in signals:
            current_price = Decimal(str(current_prices.get(signal.symbol, signal.entry_price)))
            
            # Calculate P&L
            if signal.signal_type == SignalType.BUY:
                pnl = (current_price - signal.entry_price) * signal.quantity
            else:  # SELL
                pnl = (signal.entry_price - current_price) * signal.quantity
            
            pnl_percentage = 0.0
            if signal.entry_price > 0:
                pnl_percentage = float((pnl / (signal.entry_price * signal.quantity)) * 100)
            
            # Determine status
            status = signal.status
            if status == SignalStatus.EXECUTED:
                if signal.stop_loss and current_price <= signal.stop_loss:
                    status = SignalStatus.STOPPED
                elif signal.target_price and current_price >= signal.target_price:
                    status = SignalStatus.TARGET_HIT
            
            signal_performances.append(SignalPerformance(
                signal_id=str(signal.id),
                symbol=signal.symbol,
                signal_type=signal.signal_type,
                entry_price=signal.entry_price,
                current_price=current_price,
                target_price=signal.target_price,
                stop_loss=signal.stop_loss,
                pnl=pnl,
                pnl_percentage=round(pnl_percentage, 2),
                status=status,
                generated_at=signal.created_at,
                executed_at=signal.executed_at,
                closed_at=signal.closed_at
            ))
        
        return signal_performances
    
    async def _get_analytics_summary(
        self,
        db: AsyncSession,
        user_id: str,
        time_range: TimeRange
    ) -> AnalyticsSummary:
        """Get analytics summary for time range"""
        
        start_date = self._get_start_date(time_range)
        
        # Query signal statistics
        from app.models.signals import Signal
        
        result = await db.execute(
            select(
                func.count(Signal.id).label('total'),
                func.sum(func.cast(Signal.status == SignalStatus.EXECUTED, Integer)).label('executed'),
                func.sum(func.cast(Signal.status == SignalStatus.TARGET_HIT, Integer)).label('successful')
            )
            .where(
                and_(
                    Signal.user_id == user_id,
                    Signal.created_at >= start_date
                )
            )
        )
        
        stats = result.first()
        
        total_signals = stats.total or 0
        executed_signals = stats.executed or 0
        successful_signals = stats.successful or 0
        
        # Calculate win rate
        win_rate = 0.0
        if executed_signals > 0:
            win_rate = (successful_signals / executed_signals) * 100
        
        # Get returns data
        returns = await self._calculate_returns(db, user_id, start_date)
        
        # Calculate Sharpe ratio
        sharpe_ratio = self._calculate_sharpe_ratio(returns)
        
        # Calculate max drawdown
        max_drawdown = self._calculate_max_drawdown(returns)
        
        # Get best and worst performers
        best_performer, worst_performer = await self._get_top_performers(db, user_id, start_date)
        
        return AnalyticsSummary(
            time_range=time_range,
            total_signals=total_signals,
            executed_signals=executed_signals,
            successful_signals=successful_signals,
            win_rate=round(win_rate, 2),
            average_return=round(np.mean(returns) if returns else 0, 2),
            total_return=round(sum(returns) if returns else 0, 2),
            sharpe_ratio=round(sharpe_ratio, 2),
            max_drawdown=round(max_drawdown, 2),
            best_performer=best_performer,
            worst_performer=worst_performer
        )
    
    async def _get_market_overview(self) -> MarketOverview:
        """Get current market overview"""
        
        # This would integrate with market data API
        # For now, returning mock data
        
        return MarketOverview(
            nifty_50={
                "value": 21500.50,
                "change": 125.30,
                "change_percent": 0.59,
                "volume": 250000000
            },
            sensex={
                "value": 71500.75,
                "change": 420.15,
                "change_percent": 0.59,
                "volume": 180000000
            },
            bank_nifty={
                "value": 47850.25,
                "change": -85.40,
                "change_percent": -0.18,
                "volume": 120000000
            },
            top_gainers=[
                {"symbol": "RELIANCE", "price": 2580.50, "change_percent": 3.5},
                {"symbol": "TCS", "price": 3920.75, "change_percent": 2.8},
                {"symbol": "HDFC", "price": 1650.25, "change_percent": 2.2}
            ],
            top_losers=[
                {"symbol": "ADANI", "price": 2150.30, "change_percent": -2.8},
                {"symbol": "BHARTIARTL", "price": 1480.60, "change_percent": -2.1},
                {"symbol": "MARUTI", "price": 11250.40, "change_percent": -1.9}
            ],
            market_sentiment="bullish",
            vix_level=14.5
        )
    
    async def _get_risk_metrics(
        self,
        user_id: str,
        portfolio_summary: PortfolioSummary
    ) -> RiskMetrics:
        """Calculate risk metrics for portfolio"""
        
        kite_service = await kite_manager.get_service(user_id)
        
        if not kite_service or portfolio_summary.positions_count == 0:
            return RiskMetrics(
                portfolio_beta=0.0,
                portfolio_var=0.0,
                position_concentration=0.0,
                sector_exposure={},
                risk_score=0,
                risk_level="Low",
                recommendations=["Start building your portfolio with diversified positions"]
            )
        
        # Get positions
        positions = await kite_service.get_positions()
        
        # Calculate position concentration (Herfindahl index)
        total_value = float(portfolio_summary.total_value)
        position_values = []
        sector_exposure = defaultdict(float)
        
        for position in positions:
            position_value = abs(position.quantity * position.current_price)
            position_weight = position_value / total_value if total_value > 0 else 0
            position_values.append(position_weight)
            
            # Map to sector (simplified)
            sector = self._get_sector(position.symbol)
            sector_exposure[sector] += position_weight
        
        # Calculate concentration
        position_concentration = sum([w**2 for w in position_values]) if position_values else 0
        
        # Calculate portfolio beta (simplified)
        portfolio_beta = 1.2  # This would be calculated from historical data
        
        # Calculate VaR (95% confidence, 1-day)
        portfolio_var = float(portfolio_summary.total_value) * 0.02  # 2% VaR
        
        # Calculate risk score
        risk_factors = {
            'concentration': min(position_concentration * 100, 40),  # Max 40 points
            'leverage': min((float(portfolio_summary.margin_used) / float(portfolio_summary.total_value) * 100) if portfolio_summary.total_value > 0 else 0, 30),  # Max 30 points
            'volatility': min(portfolio_beta * 15, 30)  # Max 30 points
        }
        
        risk_score = int(sum(risk_factors.values()))
        
        # Determine risk level
        if risk_score < 25:
            risk_level = "Low"
        elif risk_score < 50:
            risk_level = "Medium"
        elif risk_score < 75:
            risk_level = "High"
        else:
            risk_level = "Very High"
        
        # Generate recommendations
        recommendations = []
        if position_concentration > 0.3:
            recommendations.append("Consider diversifying - high position concentration detected")
        if portfolio_summary.margin_used > portfolio_summary.total_value * Decimal('0.5'):
            recommendations.append("High leverage usage - consider reducing margin exposure")
        if portfolio_beta > 1.5:
            recommendations.append("Portfolio has high market sensitivity - consider defensive positions")
        if len(sector_exposure) < 3:
            recommendations.append("Limited sector diversification - consider other sectors")
        
        if not recommendations:
            recommendations.append("Portfolio risk levels are within acceptable range")
        
        return RiskMetrics(
            portfolio_beta=round(portfolio_beta, 2),
            portfolio_var=round(portfolio_var, 2),
            position_concentration=round(position_concentration, 3),
            sector_exposure=dict(sector_exposure),
            risk_score=risk_score,
            risk_level=risk_level,
            recommendations=recommendations
        )
    
    async def _get_subscription_info(self, db: AsyncSession, user_id: str) -> Dict[str, Any]:
        """Get user subscription information"""
        
        has_subscription = await billing_service.check_user_access(db, user_id, "ai_signals")
        
        from app.services.subscription_billing_service import UserSubscription, SubscriptionPlan
        
        result = await db.execute(
            select(UserSubscription)
            .join(SubscriptionPlan)
            .where(
                UserSubscription.user_id == user_id,
                UserSubscription.status.in_(['active', 'trial'])
            )
        )
        
        subscription = result.scalar_one_or_none()
        
        if subscription:
            signals_remaining = None
            if subscription.plan.daily_signals_limit > 0:
                signals_remaining = max(0, subscription.plan.daily_signals_limit - subscription.signals_consumed_today)
            
            return {
                "tier": subscription.plan.tier,
                "plan_name": subscription.plan.name,
                "signals_consumed_today": subscription.signals_consumed_today,
                "signals_remaining": signals_remaining,
                "daily_limit": subscription.plan.daily_signals_limit,
                "features": {
                    "backtesting": subscription.plan.backtesting_enabled,
                    "real_time_alerts": subscription.plan.real_time_alerts,
                    "portfolio_management": subscription.plan.portfolio_management,
                    "api_access": subscription.plan.api_access,
                    "priority_support": subscription.plan.priority_support
                },
                "billing_date": subscription.current_period_end.isoformat()
            }
        else:
            return {
                "tier": "free",
                "plan_name": "Free Tier",
                "signals_consumed_today": 0,
                "signals_remaining": 3,
                "daily_limit": 3,
                "features": {
                    "backtesting": False,
                    "real_time_alerts": False,
                    "portfolio_management": False,
                    "api_access": False,
                    "priority_support": False
                },
                "billing_date": None
            }
    
    async def _get_user_alerts(self, db: AsyncSession, user_id: str) -> List[Dict[str, Any]]:
        """Get active alerts for user"""
        
        alerts = []
        
        # Check for important conditions
        portfolio_summary = await self._get_portfolio_summary(user_id)
        
        # Margin alert
        if portfolio_summary.margin_available < portfolio_summary.total_value * Decimal('0.2'):
            alerts.append({
                "type": "warning",
                "title": "Low Margin Available",
                "message": "Your available margin is below 20% of portfolio value",
                "timestamp": datetime.utcnow().isoformat()
            })
        
        # Check for stopped out positions
        from app.models.signals import Signal
        
        result = await db.execute(
            select(func.count(Signal.id))
            .where(
                and_(
                    Signal.user_id == user_id,
                    Signal.status == SignalStatus.STOPPED,
                    Signal.closed_at >= datetime.utcnow() - timedelta(hours=24)
                )
            )
        )
        
        stopped_count = result.scalar()
        
        if stopped_count > 0:
            alerts.append({
                "type": "info",
                "title": "Stop Loss Triggered",
                "message": f"{stopped_count} position(s) hit stop loss in last 24 hours",
                "timestamp": datetime.utcnow().isoformat()
            })
        
        # Market volatility alert
        market_overview = await self._get_market_overview()
        if market_overview.vix_level > 20:
            alerts.append({
                "type": "warning",
                "title": "High Market Volatility",
                "message": f"VIX at {market_overview.vix_level} - Consider reducing position sizes",
                "timestamp": datetime.utcnow().isoformat()
            })
        
        return alerts
    
    async def get_signal_details(
        self,
        db: AsyncSession,
        user_id: str,
        signal_id: str
    ) -> Dict[str, Any]:
        """Get detailed information for a specific signal"""
        
        from app.models.signals import Signal
        
        result = await db.execute(
            select(Signal)
            .where(
                and_(
                    Signal.id == signal_id,
                    Signal.user_id == user_id
                )
            )
        )
        
        signal = result.scalar_one_or_none()
        
        if not signal:
            return None
        
        # Get current price
        kite_service = await kite_manager.get_service(user_id)
        current_price = signal.entry_price
        
        if kite_service:
            ltp_data = await kite_service.get_ltp([signal.symbol])
            current_price = Decimal(str(ltp_data.get(signal.symbol, signal.entry_price)))
        
        # Calculate metrics
        if signal.signal_type == SignalType.BUY:
            pnl = (current_price - signal.entry_price) * signal.quantity
        else:
            pnl = (signal.entry_price - current_price) * signal.quantity
        
        pnl_percentage = 0.0
        if signal.entry_price > 0:
            pnl_percentage = float((pnl / (signal.entry_price * signal.quantity)) * 100)
        
        # Get execution details
        execution_details = {}
        if signal.executed_at:
            execution_details = {
                "executed_at": signal.executed_at.isoformat(),
                "execution_price": float(signal.execution_price) if hasattr(signal, 'execution_price') else float(signal.entry_price),
                "broker_order_id": signal.broker_order_id if hasattr(signal, 'broker_order_id') else None
            }
        
        return {
            "signal_id": str(signal.id),
            "symbol": signal.symbol,
            "signal_type": signal.signal_type.value,
            "status": signal.status.value,
            "entry_price": float(signal.entry_price),
            "current_price": float(current_price),
            "target_price": float(signal.target_price) if signal.target_price else None,
            "stop_loss": float(signal.stop_loss) if signal.stop_loss else None,
            "quantity": signal.quantity,
            "confidence": signal.confidence,
            "pnl": float(pnl),
            "pnl_percentage": round(pnl_percentage, 2),
            "generated_at": signal.created_at.isoformat(),
            "execution_details": execution_details,
            "ai_models_used": signal.ai_models if hasattr(signal, 'ai_models') else [],
            "technical_indicators": signal.technical_indicators if hasattr(signal, 'technical_indicators') else {},
            "rationale": signal.rationale if hasattr(signal, 'rationale') else ""
        }
    
    async def get_performance_chart_data(
        self,
        db: AsyncSession,
        user_id: str,
        time_range: TimeRange,
        metric: DashboardMetric
    ) -> Dict[str, Any]:
        """Get chart data for performance visualization"""
        
        start_date = self._get_start_date(time_range)
        
        # Generate time series data based on metric
        if metric == DashboardMetric.PORTFOLIO_VALUE:
            data = await self._get_portfolio_value_series(db, user_id, start_date)
        elif metric == DashboardMetric.TOTAL_PNL:
            data = await self._get_pnl_series(db, user_id, start_date)
        elif metric == DashboardMetric.WIN_RATE:
            data = await self._get_win_rate_series(db, user_id, start_date)
        elif metric == DashboardMetric.SIGNALS_GENERATED:
            data = await self._get_signals_series(db, user_id, start_date)
        else:
            data = []
        
        return {
            "metric": metric.value,
            "time_range": time_range.value,
            "data": data,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    # Helper methods
    
    def _get_start_date(self, time_range: TimeRange) -> datetime:
        """Get start date for time range"""
        now = datetime.utcnow()
        
        if time_range == TimeRange.TODAY:
            return now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif time_range == TimeRange.WEEK:
            return now - timedelta(days=7)
        elif time_range == TimeRange.MONTH:
            return now - timedelta(days=30)
        elif time_range == TimeRange.QUARTER:
            return now - timedelta(days=90)
        elif time_range == TimeRange.YEAR:
            return now - timedelta(days=365)
        else:  # ALL_TIME
            return datetime(2020, 1, 1)
    
    async def _calculate_returns(
        self,
        db: AsyncSession,
        user_id: str,
        start_date: datetime
    ) -> List[float]:
        """Calculate returns for the period"""
        
        # This would fetch actual P&L data from database
        # For now, returning sample data
        return [2.5, -1.2, 3.8, 0.5, -0.8, 4.2, 1.5, -2.0, 3.0, 1.8]
    
    def _calculate_sharpe_ratio(self, returns: List[float]) -> float:
        """Calculate Sharpe ratio"""
        if not returns or len(returns) < 2:
            return 0.0
        
        returns_array = np.array(returns)
        avg_return = np.mean(returns_array)
        std_return = np.std(returns_array)
        
        if std_return == 0:
            return 0.0
        
        # Assume risk-free rate of 6% annually (0.016% daily)
        risk_free_rate = 0.016
        sharpe = (avg_return - risk_free_rate) / std_return * np.sqrt(252)  # Annualized
        
        return sharpe
    
    def _calculate_max_drawdown(self, returns: List[float]) -> float:
        """Calculate maximum drawdown"""
        if not returns:
            return 0.0
        
        cumulative = np.cumprod(1 + np.array(returns) / 100)
        running_max = np.maximum.accumulate(cumulative)
        drawdown = (cumulative - running_max) / running_max * 100
        
        return float(np.min(drawdown))
    
    async def _get_top_performers(
        self,
        db: AsyncSession,
        user_id: str,
        start_date: datetime
    ) -> tuple[Optional[Dict], Optional[Dict]]:
        """Get best and worst performing signals"""
        
        from app.models.signals import Signal
        
        # Get best performer
        result = await db.execute(
            select(Signal)
            .where(
                and_(
                    Signal.user_id == user_id,
                    Signal.created_at >= start_date,
                    Signal.status == SignalStatus.TARGET_HIT
                )
            )
            .order_by(desc(Signal.pnl_percentage))
            .limit(1)
        )
        
        best = result.scalar_one_or_none()
        best_performer = None
        if best:
            best_performer = {
                "symbol": best.symbol,
                "return": float(best.pnl_percentage) if hasattr(best, 'pnl_percentage') else 0,
                "signal_id": str(best.id)
            }
        
        # Get worst performer
        result = await db.execute(
            select(Signal)
            .where(
                and_(
                    Signal.user_id == user_id,
                    Signal.created_at >= start_date,
                    Signal.status.in_([SignalStatus.STOPPED, SignalStatus.EXPIRED])
                )
            )
            .order_by(Signal.pnl_percentage)
            .limit(1)
        )
        
        worst = result.scalar_one_or_none()
        worst_performer = None
        if worst:
            worst_performer = {
                "symbol": worst.symbol,
                "return": float(worst.pnl_percentage) if hasattr(worst, 'pnl_percentage') else 0,
                "signal_id": str(worst.id)
            }
        
        return best_performer, worst_performer
    
    def _get_sector(self, symbol: str) -> str:
        """Map symbol to sector (simplified)"""
        sector_mapping = {
            "RELIANCE": "Energy",
            "TCS": "IT",
            "INFY": "IT",
            "HDFC": "Banking",
            "ICICIBANK": "Banking",
            "SBIN": "Banking",
            "HCLTECH": "IT",
            "WIPRO": "IT",
            "MARUTI": "Auto",
            "TATAMOTORS": "Auto",
            "BHARTIARTL": "Telecom",
            "ITC": "FMCG",
            "HINDUNILVR": "FMCG",
            "ASIANPAINT": "Paints",
            "TITAN": "Consumer",
            "ADANI": "Infrastructure"
        }
        
        return sector_mapping.get(symbol, "Others")
    
    async def _get_portfolio_value_series(
        self,
        db: AsyncSession,
        user_id: str,
        start_date: datetime
    ) -> List[Dict[str, Any]]:
        """Get portfolio value time series"""
        
        # This would fetch actual historical portfolio values
        # For now, returning sample data
        data = []
        current_date = start_date
        base_value = 100000
        
        while current_date <= datetime.utcnow():
            value = base_value * (1 + np.random.normal(0.001, 0.02))
            data.append({
                "date": current_date.isoformat(),
                "value": round(value, 2)
            })
            base_value = value
            current_date += timedelta(days=1)
        
        return data
    
    async def _get_pnl_series(
        self,
        db: AsyncSession,
        user_id: str,
        start_date: datetime
    ) -> List[Dict[str, Any]]:
        """Get P&L time series"""
        
        # This would fetch actual P&L data
        # For now, returning sample data
        data = []
        current_date = start_date
        cumulative_pnl = 0
        
        while current_date <= datetime.utcnow():
            daily_pnl = np.random.normal(500, 2000)
            cumulative_pnl += daily_pnl
            data.append({
                "date": current_date.isoformat(),
                "daily_pnl": round(daily_pnl, 2),
                "cumulative_pnl": round(cumulative_pnl, 2)
            })
            current_date += timedelta(days=1)
        
        return data
    
    async def _get_win_rate_series(
        self,
        db: AsyncSession,
        user_id: str,
        start_date: datetime
    ) -> List[Dict[str, Any]]:
        """Get win rate time series"""
        
        # This would calculate actual win rates
        # For now, returning sample data
        data = []
        current_date = start_date
        
        while current_date <= datetime.utcnow():
            win_rate = 50 + np.random.normal(5, 10)
            win_rate = max(0, min(100, win_rate))
            data.append({
                "date": current_date.isoformat(),
                "win_rate": round(win_rate, 2)
            })
            current_date += timedelta(days=7)  # Weekly
        
        return data
    
    async def _get_signals_series(
        self,
        db: AsyncSession,
        user_id: str,
        start_date: datetime
    ) -> List[Dict[str, Any]]:
        """Get signals count time series"""
        
        from app.models.signals import Signal
        
        # Group signals by day
        result = await db.execute(
            select(
                func.date(Signal.created_at).label('date'),
                func.count(Signal.id).label('count')
            )
            .where(
                and_(
                    Signal.user_id == user_id,
                    Signal.created_at >= start_date
                )
            )
            .group_by(func.date(Signal.created_at))
            .order_by('date')
        )
        
        data = []
        for row in result:
            data.append({
                "date": row.date.isoformat(),
                "count": row.count
            })
        
        return data

# Initialize service
dashboard_service = DashboardService()