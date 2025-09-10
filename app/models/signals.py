"""
Signal models for database storage
"""

from sqlalchemy import Column, Integer, String, DateTime, Decimal, Boolean, Text, ForeignKey, Index, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from enum import Enum

from app.core.database import Base

class SignalType(str, Enum):
    """Signal type enumeration"""
    BUY = "buy"
    SELL = "sell"
    HOLD = "hold"

class SignalStatus(str, Enum):
    """Signal status enumeration"""
    PENDING = "pending"
    EXECUTED = "executed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    TARGET_HIT = "target_hit"
    STOPPED = "stopped"

class Signal(Base):
    """Trading signal model"""
    __tablename__ = "signals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Signal details
    symbol = Column(String(50), nullable=False, index=True)
    signal_type = Column(SQLEnum(SignalType), nullable=False)
    status = Column(SQLEnum(SignalStatus), nullable=False, default=SignalStatus.PENDING)
    
    # Price levels
    entry_price = Column(Decimal(10, 2), nullable=False)
    target_price = Column(Decimal(10, 2))
    stop_loss = Column(Decimal(10, 2))
    execution_price = Column(Decimal(10, 2))
    
    # Quantity and confidence
    quantity = Column(Integer, default=1)
    confidence = Column(Decimal(3, 2), default=0.5)  # 0.00 to 1.00
    
    # P&L tracking
    pnl = Column(Decimal(10, 2))
    pnl_percentage = Column(Decimal(5, 2))
    
    # AI model information
    ai_models = Column(JSONB, default=list)  # List of models used
    technical_indicators = Column(JSONB, default=dict)  # Technical analysis data
    rationale = Column(Text)  # Explanation for the signal
    
    # Execution details
    broker_order_id = Column(String(100))
    executed_at = Column(DateTime)
    closed_at = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="signals")
    
    __table_args__ = (
        Index('ix_signals_user_id', 'user_id'),
        Index('ix_signals_symbol', 'symbol'),
        Index('ix_signals_status', 'status'),
        Index('ix_signals_created_at', 'created_at'),
    )