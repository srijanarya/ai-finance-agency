"""
Signal Generation and Trading Models
Supports TREUM's Premium Signal Service (₹60-90 Cr revenue target)
"""

from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Dict, List, Optional, Any
from uuid import UUID, uuid4

from sqlalchemy import (
    Column, String, Integer, Decimal as SQLDecimal, DateTime, Boolean, 
    Text, JSON, ForeignKey, Index, UniqueConstraint, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, validates
from sqlalchemy.sql import func

from .auth_models import User
from .profile_models import UserProfile


class SignalType(str, Enum):
    """Signal types for different trading actions"""
    BUY = "buy"
    SELL = "sell" 
    HOLD = "hold"
    EXIT = "exit"
    STOP_LOSS = "stop_loss"
    TAKE_PROFIT = "take_profit"


class SignalPriority(str, Enum):
    """Signal priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class SignalStatus(str, Enum):
    """Signal lifecycle status"""
    ACTIVE = "active"
    EXPIRED = "expired"
    EXECUTED = "executed"
    CANCELLED = "cancelled"


class AssetClass(str, Enum):
    """Asset classes for signals"""
    EQUITY = "equity"
    CRYPTO = "crypto"
    FOREX = "forex"
    COMMODITY = "commodity"
    FUTURES = "futures"
    OPTIONS = "options"


class SubscriptionTier(str, Enum):
    """Signal subscription tiers with pricing"""
    BASIC = "basic"      # ₹999/month
    PRO = "pro"          # ₹2,999/month  
    ELITE = "elite"      # ₹9,999/month


class SignalSource(str, Enum):
    """Signal generation sources"""
    AI_MODEL = "ai_model"
    TECHNICAL_ANALYSIS = "technical_analysis"
    FUNDAMENTAL_ANALYSIS = "fundamental_analysis"
    SENTIMENT_ANALYSIS = "sentiment_analysis"
    EXPERT_ANALYST = "expert_analyst"
    ALGORITHMIC = "algorithmic"


Base = declarative_base()


class SignalProvider(Base):
    """Signal providers and AI models"""
    __tablename__ = "signal_providers"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    provider_type = Column(String(50), nullable=False)  # ai_model, analyst, algorithm
    accuracy_score = Column(SQLDecimal(5, 4), default=0.0)  # 0.0000 to 1.0000
    total_signals = Column(Integer, default=0)
    successful_signals = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    # AI Model specific fields
    model_version = Column(String(50))
    training_data_end_date = Column(DateTime(timezone=True))
    
    # Configuration
    config = Column(JSONB, default={})
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    signals = relationship("TradingSignal", back_populates="provider")
    
    @property
    def success_rate(self) -> float:
        """Calculate success rate"""
        if self.total_signals == 0:
            return 0.0
        return float(self.successful_signals / self.total_signals)
    
    def update_performance(self, success: bool):
        """Update provider performance metrics"""
        self.total_signals += 1
        if success:
            self.successful_signals += 1
        self.accuracy_score = Decimal(str(self.success_rate))


class TradingSignal(Base):
    """Core trading signals with comprehensive metadata"""
    __tablename__ = "trading_signals"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    signal_id = Column(String(50), unique=True, nullable=False)  # Human readable ID
    
    # Provider information
    provider_id = Column(PGUUID(as_uuid=True), ForeignKey("signal_providers.id"), nullable=False)
    source = Column(String(50), nullable=False)  # SignalSource enum
    
    # Asset information
    symbol = Column(String(20), nullable=False)  # RELIANCE, BTCUSDT, etc.
    exchange = Column(String(50), nullable=False)  # NSE, BINANCE, etc.
    asset_class = Column(String(20), nullable=False)  # AssetClass enum
    
    # Signal details
    signal_type = Column(String(20), nullable=False)  # SignalType enum
    priority = Column(String(20), default=SignalPriority.MEDIUM)
    confidence_score = Column(SQLDecimal(5, 4), nullable=False)  # 0.0000 to 1.0000
    
    # Price targets
    entry_price = Column(SQLDecimal(15, 4))
    target_price = Column(SQLDecimal(15, 4))
    stop_loss = Column(SQLDecimal(15, 4))
    current_price = Column(SQLDecimal(15, 4))
    
    # Position sizing
    recommended_quantity = Column(Integer)
    position_size_percentage = Column(SQLDecimal(5, 2))  # % of portfolio
    risk_reward_ratio = Column(SQLDecimal(8, 4))
    
    # Timing
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    valid_until = Column(DateTime(timezone=True))
    executed_at = Column(DateTime(timezone=True))
    
    # Signal lifecycle
    status = Column(String(20), default=SignalStatus.ACTIVE)
    
    # Performance tracking
    actual_entry_price = Column(SQLDecimal(15, 4))
    actual_exit_price = Column(SQLDecimal(15, 4))
    actual_return_percentage = Column(SQLDecimal(8, 4))
    max_drawdown_percentage = Column(SQLDecimal(8, 4))
    
    # Analysis data
    technical_indicators = Column(JSONB, default={})
    fundamental_data = Column(JSONB, default={})
    sentiment_data = Column(JSONB, default={})
    market_conditions = Column(JSONB, default={})
    
    # Subscription tiers
    min_subscription_tier = Column(String(20), default=SubscriptionTier.BASIC)
    
    # Metadata
    tags = Column(JSONB, default=[])  # ["momentum", "breakout", "swing"]
    notes = Column(Text)
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    provider = relationship("SignalProvider", back_populates="signals")
    subscriptions = relationship("SignalSubscription", back_populates="signal")
    performance_records = relationship("SignalPerformance", back_populates="signal")
    
    # Indexes
    __table_args__ = (
        Index('idx_signal_symbol_exchange', 'symbol', 'exchange'),
        Index('idx_signal_generated_at', 'generated_at'),
        Index('idx_signal_status', 'status'),
        Index('idx_signal_subscription_tier', 'min_subscription_tier'),
        Index('idx_signal_priority', 'priority'),
    )
    
    @validates('confidence_score')
    def validate_confidence_score(self, key, value):
        """Validate confidence score is between 0 and 1"""
        if value is not None and (value < 0 or value > 1):
            raise ValueError("Confidence score must be between 0 and 1")
        return value
    
    @property
    def is_active(self) -> bool:
        """Check if signal is still active"""
        if self.status != SignalStatus.ACTIVE:
            return False
        if self.valid_until and datetime.now(timezone.utc) > self.valid_until:
            return False
        return True
    
    @property
    def potential_return(self) -> Optional[float]:
        """Calculate potential return percentage"""
        if not (self.entry_price and self.target_price):
            return None
        return float((self.target_price - self.entry_price) / self.entry_price * 100)
    
    @property
    def potential_loss(self) -> Optional[float]:
        """Calculate potential loss percentage"""
        if not (self.entry_price and self.stop_loss):
            return None
        return float((self.entry_price - self.stop_loss) / self.entry_price * 100)
    
    def mark_executed(self, actual_entry_price: Decimal):
        """Mark signal as executed"""
        self.status = SignalStatus.EXECUTED
        self.executed_at = datetime.now(timezone.utc)
        self.actual_entry_price = actual_entry_price
    
    def update_performance(self, exit_price: Decimal, max_drawdown: Optional[Decimal] = None):
        """Update signal performance after exit"""
        self.actual_exit_price = exit_price
        if self.actual_entry_price:
            self.actual_return_percentage = (exit_price - self.actual_entry_price) / self.actual_entry_price * 100
        if max_drawdown:
            self.max_drawdown_percentage = max_drawdown


class SignalSubscription(Base):
    """User subscriptions to trading signals"""
    __tablename__ = "signal_subscriptions"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    signal_id = Column(PGUUID(as_uuid=True), ForeignKey("trading_signals.id"), nullable=False)
    
    # Subscription details
    subscription_tier = Column(String(20), nullable=False)  # SubscriptionTier enum
    subscribed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Delivery preferences
    delivery_methods = Column(JSONB, default=["push_notification"])  # email, sms, push, api
    is_auto_trade_enabled = Column(Boolean, default=False)
    
    # Performance tracking
    is_executed = Column(Boolean, default=False)
    executed_at = Column(DateTime(timezone=True))
    execution_price = Column(SQLDecimal(15, 4))
    user_return_percentage = Column(SQLDecimal(8, 4))
    
    # Feedback
    user_rating = Column(Integer)  # 1-5 stars
    user_feedback = Column(Text)
    
    # Relationships
    user = relationship("User")
    signal = relationship("TradingSignal", back_populates="subscriptions")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'signal_id', name='unique_user_signal_subscription'),
        Index('idx_subscription_user_id', 'user_id'),
        Index('idx_subscription_signal_id', 'signal_id'),
        CheckConstraint('user_rating >= 1 AND user_rating <= 5', name='valid_rating'),
    )


class SignalPerformance(Base):
    """Detailed performance tracking for signals"""
    __tablename__ = "signal_performance"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    signal_id = Column(PGUUID(as_uuid=True), ForeignKey("trading_signals.id"), nullable=False)
    
    # Time-based metrics
    date = Column(DateTime(timezone=True), nullable=False)
    price_at_time = Column(SQLDecimal(15, 4), nullable=False)
    return_since_signal = Column(SQLDecimal(8, 4))
    
    # Volume and market data
    volume = Column(Integer)
    market_cap = Column(SQLDecimal(20, 2))
    volatility = Column(SQLDecimal(8, 4))
    
    # Social metrics
    social_sentiment = Column(SQLDecimal(5, 4))  # -1 to 1
    social_volume = Column(Integer)
    news_sentiment = Column(SQLDecimal(5, 4))  # -1 to 1
    
    # Technical indicators at time
    rsi = Column(SQLDecimal(5, 2))
    macd = Column(SQLDecimal(8, 4))
    bollinger_position = Column(SQLDecimal(5, 4))  # 0 to 1
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    signal = relationship("TradingSignal", back_populates="performance_records")
    
    # Indexes
    __table_args__ = (
        Index('idx_performance_signal_date', 'signal_id', 'date'),
        Index('idx_performance_date', 'date'),
    )


class UserSignalPreferences(Base):
    """User preferences for signal delivery and filtering"""
    __tablename__ = "user_signal_preferences"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PGUUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    
    # Asset preferences
    preferred_asset_classes = Column(JSONB, default=["equity", "crypto"])
    excluded_symbols = Column(JSONB, default=[])
    min_confidence_score = Column(SQLDecimal(5, 4), default=0.7)
    
    # Risk preferences
    max_position_size_percentage = Column(SQLDecimal(5, 2), default=5.0)  # % of portfolio
    min_risk_reward_ratio = Column(SQLDecimal(8, 4), default=1.5)
    max_drawdown_tolerance = Column(SQLDecimal(5, 2), default=10.0)
    
    # Delivery preferences
    delivery_methods = Column(JSONB, default=["push_notification", "email"])
    quiet_hours_start = Column(String(5), default="22:00")  # HH:MM
    quiet_hours_end = Column(String(5), default="08:00")    # HH:MM
    timezone = Column(String(50), default="Asia/Kolkata")
    
    # Frequency limits
    max_signals_per_day = Column(Integer, default=10)
    max_signals_per_hour = Column(Integer, default=3)
    
    # Auto-trading preferences
    is_auto_trade_enabled = Column(Boolean, default=False)
    auto_trade_amount_per_signal = Column(SQLDecimal(10, 2))
    auto_trade_stop_loss_percentage = Column(SQLDecimal(5, 2), default=5.0)
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User")


class SignalAnalytics(Base):
    """Analytics and metrics for signal performance"""
    __tablename__ = "signal_analytics"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Time period
    date = Column(DateTime(timezone=True), nullable=False)
    period_type = Column(String(20), nullable=False)  # daily, weekly, monthly
    
    # Provider analytics
    provider_id = Column(PGUUID(as_uuid=True), ForeignKey("signal_providers.id"))
    
    # Overall metrics
    total_signals_generated = Column(Integer, default=0)
    total_signals_executed = Column(Integer, default=0)
    average_confidence_score = Column(SQLDecimal(5, 4))
    
    # Performance metrics
    win_rate = Column(SQLDecimal(5, 4))  # 0.0000 to 1.0000
    average_return = Column(SQLDecimal(8, 4))
    average_holding_period_hours = Column(SQLDecimal(8, 2))
    sharpe_ratio = Column(SQLDecimal(8, 4))
    max_drawdown = Column(SQLDecimal(8, 4))
    
    # User engagement
    total_subscribers = Column(Integer, default=0)
    execution_rate = Column(SQLDecimal(5, 4))  # % of signals that were executed
    average_user_rating = Column(SQLDecimal(3, 2))
    
    # Revenue metrics
    subscription_revenue = Column(SQLDecimal(15, 2), default=0)
    commission_revenue = Column(SQLDecimal(15, 2), default=0)
    
    # Asset class breakdown
    asset_class_distribution = Column(JSONB, default={})
    signal_type_distribution = Column(JSONB, default={})
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    provider = relationship("SignalProvider")
    
    # Indexes
    __table_args__ = (
        Index('idx_analytics_date_period', 'date', 'period_type'),
        Index('idx_analytics_provider', 'provider_id'),
        UniqueConstraint('date', 'period_type', 'provider_id', name='unique_analytics_period'),
    )


class SignalBacktest(Base):
    """Backtesting results for signal strategies"""
    __tablename__ = "signal_backtests"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Strategy information
    strategy_name = Column(String(100), nullable=False)
    provider_id = Column(PGUUID(as_uuid=True), ForeignKey("signal_providers.id"))
    
    # Backtest parameters
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    initial_capital = Column(SQLDecimal(15, 2), nullable=False)
    
    # Results
    final_value = Column(SQLDecimal(15, 2))
    total_return = Column(SQLDecimal(8, 4))
    annualized_return = Column(SQLDecimal(8, 4))
    max_drawdown = Column(SQLDecimal(8, 4))
    sharpe_ratio = Column(SQLDecimal(8, 4))
    sortino_ratio = Column(SQLDecimal(8, 4))
    
    # Trade statistics
    total_trades = Column(Integer)
    winning_trades = Column(Integer)
    losing_trades = Column(Integer)
    win_rate = Column(SQLDecimal(5, 4))
    average_win = Column(SQLDecimal(8, 4))
    average_loss = Column(SQLDecimal(8, 4))
    largest_win = Column(SQLDecimal(8, 4))
    largest_loss = Column(SQLDecimal(8, 4))
    
    # Additional metrics
    calmar_ratio = Column(SQLDecimal(8, 4))
    profit_factor = Column(SQLDecimal(8, 4))
    recovery_factor = Column(SQLDecimal(8, 4))
    
    # Detailed results
    equity_curve = Column(JSONB)  # Array of {date, value} objects
    trade_log = Column(JSONB)     # Array of trade details
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    provider = relationship("SignalProvider")
    
    # Indexes
    __table_args__ = (
        Index('idx_backtest_provider', 'provider_id'),
        Index('idx_backtest_dates', 'start_date', 'end_date'),
    )