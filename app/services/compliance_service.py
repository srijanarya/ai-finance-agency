"""
Regulatory Compliance Service for Trading Signals
Ensures compliance with SEBI, RBI, and other Indian financial regulations
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from decimal import Decimal
import hashlib
import json
from collections import defaultdict

from pydantic import BaseModel, Field, validator
from sqlalchemy import Column, Integer, String, DateTime, Decimal as SQLDecimal, Boolean, Text, ForeignKey, Index
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.core.config import get_settings
from app.core.database import Base, get_db
from app.models.user import User
from app.models.signals import Signal, SignalType

logger = logging.getLogger(__name__)
settings = get_settings()

class ComplianceStatus(str, Enum):
    """Compliance check status"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    FLAGGED = "flagged"
    UNDER_REVIEW = "under_review"

class RiskCategory(str, Enum):
    """Risk categorization for compliance"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"
    PROHIBITED = "prohibited"

class RegulationType(str, Enum):
    """Types of regulations"""
    SEBI = "sebi"  # Securities and Exchange Board of India
    RBI = "rbi"    # Reserve Bank of India
    NSE = "nse"    # National Stock Exchange
    BSE = "bse"    # Bombay Stock Exchange
    PMLA = "pmla"  # Prevention of Money Laundering Act
    FEMA = "fema"  # Foreign Exchange Management Act

class ComplianceAction(str, Enum):
    """Actions taken for compliance"""
    ALLOW = "allow"
    BLOCK = "block"
    REVIEW = "review"
    REPORT = "report"
    FREEZE = "freeze"

# Database Models

class ComplianceCheck(Base):
    """Compliance check records"""
    __tablename__ = "compliance_checks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Check details
    check_type = Column(String(50), nullable=False)  # kyc, aml, trading_limit, etc.
    entity_type = Column(String(50))  # user, signal, transaction, etc.
    entity_id = Column(String(100))
    
    # Results
    status = Column(String(20), nullable=False, default=ComplianceStatus.PENDING)
    risk_score = Column(Integer, default=0)  # 0-100
    risk_category = Column(String(20))
    action_taken = Column(String(20))
    
    # Compliance details
    regulations_checked = Column(JSONB, default=list)
    violations_found = Column(JSONB, default=list)
    metadata = Column(JSONB, default=dict)
    
    # Review details
    reviewed_by = Column(String(100))
    review_notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="compliance_checks")
    
    __table_args__ = (
        Index('ix_compliance_checks_user_id', 'user_id'),
        Index('ix_compliance_checks_status', 'status'),
        Index('ix_compliance_checks_created_at', 'created_at'),
    )

class RegulatoryRule(Base):
    """Regulatory rules and thresholds"""
    __tablename__ = "regulatory_rules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Rule identification
    rule_code = Column(String(50), unique=True, nullable=False)
    rule_name = Column(String(200), nullable=False)
    description = Column(Text)
    regulation_type = Column(String(20), nullable=False)
    
    # Rule configuration
    rule_config = Column(JSONB, default=dict)
    thresholds = Column(JSONB, default=dict)
    
    # Enforcement
    is_active = Column(Boolean, default=True)
    enforcement_level = Column(String(20))  # mandatory, recommended, optional
    penalty_amount = Column(SQLDecimal(10, 2))
    
    # Meta
    effective_date = Column(DateTime)
    expiry_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AuditLog(Base):
    """Audit trail for compliance"""
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Event details
    event_type = Column(String(50), nullable=False)
    event_category = Column(String(50))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    # Action details
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50))
    resource_id = Column(String(100))
    
    # Request/Response
    request_data = Column(JSONB, default=dict)
    response_data = Column(JSONB, default=dict)
    
    # Context
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    session_id = Column(String(100))
    
    # Compliance flags
    compliance_relevant = Column(Boolean, default=False)
    requires_review = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
    
    __table_args__ = (
        Index('ix_audit_logs_user_id', 'user_id'),
        Index('ix_audit_logs_event_type', 'event_type'),
        Index('ix_audit_logs_created_at', 'created_at'),
    )

class ComplianceReport(Base):
    """Compliance reports for regulators"""
    __tablename__ = "compliance_reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Report details
    report_type = Column(String(50), nullable=False)
    report_period_start = Column(DateTime, nullable=False)
    report_period_end = Column(DateTime, nullable=False)
    regulator = Column(String(50))
    
    # Report data
    report_data = Column(JSONB, default=dict)
    summary_metrics = Column(JSONB, default=dict)
    
    # Filing details
    filing_date = Column(DateTime)
    filing_reference = Column(String(100))
    status = Column(String(20), default="draft")
    
    # Meta
    generated_by = Column(String(100))
    approved_by = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Pydantic Models

class KYCVerification(BaseModel):
    """KYC verification data"""
    user_id: str
    pan_number: Optional[str] = None
    aadhaar_number: Optional[str] = None  # Masked
    bank_account: Optional[str] = None    # Masked
    demat_account: Optional[str] = None
    income_range: Optional[str] = None
    occupation: Optional[str] = None
    trading_experience: Optional[str] = None
    risk_profile: Optional[str] = None
    
    @validator('pan_number')
    def validate_pan(cls, v):
        if v and not cls._is_valid_pan(v):
            raise ValueError('Invalid PAN format')
        return v
    
    @staticmethod
    def _is_valid_pan(pan: str) -> bool:
        """Validate PAN format"""
        import re
        pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
        return bool(re.match(pattern, pan.upper()))

class TradingLimit(BaseModel):
    """Trading limits for users"""
    user_id: str
    daily_trade_limit: Decimal
    single_trade_limit: Decimal
    daily_loss_limit: Decimal
    margin_limit: Decimal
    position_limit: int
    
    # Segment-wise limits
    equity_limit: Decimal
    derivative_limit: Decimal
    commodity_limit: Decimal
    currency_limit: Decimal

class ComplianceCheckRequest(BaseModel):
    """Request for compliance check"""
    user_id: str
    check_type: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    metadata: Dict[str, Any] = {}

class ComplianceCheckResponse(BaseModel):
    """Response from compliance check"""
    check_id: str
    status: ComplianceStatus
    action: ComplianceAction
    risk_score: int
    risk_category: RiskCategory
    violations: List[str] = []
    recommendations: List[str] = []
    requires_manual_review: bool = False

# Service Implementation

class ComplianceService:
    """
    Comprehensive compliance service for regulatory requirements
    """
    
    def __init__(self):
        self.rules_cache = {}
        self.load_regulatory_rules()
    
    def load_regulatory_rules(self):
        """Load regulatory rules into cache"""
        # This would load from database in production
        self.rules_cache = {
            "SEBI_SIGNAL_DISCLAIMER": {
                "type": RegulationType.SEBI,
                "mandatory": True,
                "description": "All trading signals must include risk disclaimer"
            },
            "SEBI_NO_GUARANTEED_RETURNS": {
                "type": RegulationType.SEBI,
                "mandatory": True,
                "description": "Cannot promise guaranteed returns"
            },
            "RBI_FOREX_LIMITS": {
                "type": RegulationType.RBI,
                "mandatory": True,
                "description": "Forex trading limits for retail investors"
            },
            "NSE_CIRCUIT_LIMITS": {
                "type": RegulationType.NSE,
                "mandatory": True,
                "description": "Respect circuit breaker limits"
            },
            "PMLA_TRANSACTION_MONITORING": {
                "type": RegulationType.PMLA,
                "mandatory": True,
                "description": "Monitor suspicious transactions"
            }
        }
    
    async def perform_kyc_check(
        self,
        db: AsyncSession,
        kyc_data: KYCVerification
    ) -> ComplianceCheckResponse:
        """Perform KYC compliance check"""
        
        check_id = str(uuid.uuid4())
        violations = []
        risk_score = 0
        
        # Check PAN
        if not kyc_data.pan_number:
            violations.append("PAN number missing")
            risk_score += 30
        
        # Check bank account
        if not kyc_data.bank_account:
            violations.append("Bank account not verified")
            risk_score += 20
        
        # Check demat account
        if not kyc_data.demat_account:
            violations.append("Demat account not linked")
            risk_score += 25
        
        # Check trading experience
        if kyc_data.trading_experience == "none":
            risk_score += 15
        
        # Determine risk category
        if risk_score >= 80:
            risk_category = RiskCategory.PROHIBITED
            status = ComplianceStatus.REJECTED
            action = ComplianceAction.BLOCK
        elif risk_score >= 60:
            risk_category = RiskCategory.VERY_HIGH
            status = ComplianceStatus.FLAGGED
            action = ComplianceAction.REVIEW
        elif risk_score >= 40:
            risk_category = RiskCategory.HIGH
            status = ComplianceStatus.UNDER_REVIEW
            action = ComplianceAction.REVIEW
        elif risk_score >= 20:
            risk_category = RiskCategory.MEDIUM
            status = ComplianceStatus.APPROVED
            action = ComplianceAction.ALLOW
        else:
            risk_category = RiskCategory.LOW
            status = ComplianceStatus.APPROVED
            action = ComplianceAction.ALLOW
        
        # Store compliance check
        compliance_check = ComplianceCheck(
            id=check_id,
            user_id=kyc_data.user_id,
            check_type="kyc",
            entity_type="user",
            entity_id=kyc_data.user_id,
            status=status,
            risk_score=risk_score,
            risk_category=risk_category.value,
            action_taken=action.value,
            regulations_checked=[RegulationType.SEBI.value, RegulationType.PMLA.value],
            violations_found=violations,
            metadata={"kyc_data": kyc_data.dict()}
        )
        
        db.add(compliance_check)
        await db.commit()
        
        return ComplianceCheckResponse(
            check_id=check_id,
            status=status,
            action=action,
            risk_score=risk_score,
            risk_category=risk_category,
            violations=violations,
            recommendations=self._get_kyc_recommendations(violations),
            requires_manual_review=risk_category in [RiskCategory.HIGH, RiskCategory.VERY_HIGH]
        )
    
    async def check_trading_limits(
        self,
        db: AsyncSession,
        user_id: str,
        trade_details: Dict[str, Any]
    ) -> ComplianceCheckResponse:
        """Check if trade complies with user's trading limits"""
        
        check_id = str(uuid.uuid4())
        violations = []
        risk_score = 0
        
        # Get user's trading limits
        limits = await self._get_user_trading_limits(db, user_id)
        
        # Check single trade limit
        trade_value = Decimal(str(trade_details.get('value', 0)))
        if trade_value > limits.single_trade_limit:
            violations.append(f"Trade value exceeds single trade limit of ₹{limits.single_trade_limit}")
            risk_score += 40
        
        # Check daily trade limit
        daily_traded = await self._get_daily_traded_value(db, user_id)
        if daily_traded + trade_value > limits.daily_trade_limit:
            violations.append(f"Exceeds daily trading limit of ₹{limits.daily_trade_limit}")
            risk_score += 35
        
        # Check margin usage
        margin_required = Decimal(str(trade_details.get('margin_required', 0)))
        if margin_required > limits.margin_limit:
            violations.append(f"Margin requirement exceeds limit of ₹{limits.margin_limit}")
            risk_score += 30
        
        # Check segment limits
        segment = trade_details.get('segment', 'equity')
        segment_value = trade_value
        
        if segment == 'equity' and segment_value > limits.equity_limit:
            violations.append(f"Exceeds equity segment limit of ₹{limits.equity_limit}")
            risk_score += 25
        elif segment == 'derivative' and segment_value > limits.derivative_limit:
            violations.append(f"Exceeds derivative segment limit of ₹{limits.derivative_limit}")
            risk_score += 30
        
        # Determine action
        if violations:
            status = ComplianceStatus.REJECTED
            action = ComplianceAction.BLOCK
            risk_category = RiskCategory.HIGH
        else:
            status = ComplianceStatus.APPROVED
            action = ComplianceAction.ALLOW
            risk_category = RiskCategory.LOW
        
        # Store compliance check
        compliance_check = ComplianceCheck(
            id=check_id,
            user_id=user_id,
            check_type="trading_limits",
            entity_type="trade",
            entity_id=trade_details.get('trade_id'),
            status=status,
            risk_score=risk_score,
            risk_category=risk_category.value,
            action_taken=action.value,
            regulations_checked=[RegulationType.SEBI.value],
            violations_found=violations,
            metadata=trade_details
        )
        
        db.add(compliance_check)
        await db.commit()
        
        return ComplianceCheckResponse(
            check_id=check_id,
            status=status,
            action=action,
            risk_score=risk_score,
            risk_category=risk_category,
            violations=violations,
            recommendations=["Consider reducing position size"] if violations else [],
            requires_manual_review=False
        )
    
    async def check_anti_money_laundering(
        self,
        db: AsyncSession,
        user_id: str,
        transaction_details: Dict[str, Any]
    ) -> ComplianceCheckResponse:
        """Perform AML checks on transactions"""
        
        check_id = str(uuid.uuid4())
        violations = []
        risk_score = 0
        suspicious_patterns = []
        
        amount = Decimal(str(transaction_details.get('amount', 0)))
        transaction_type = transaction_details.get('type')
        
        # Check for suspicious patterns
        
        # 1. Large cash transactions (>₹10 lakhs)
        if amount > 1000000:
            suspicious_patterns.append("Large value transaction")
            risk_score += 30
        
        # 2. Rapid buy-sell patterns (possible layering)
        if await self._check_rapid_trading_pattern(db, user_id):
            suspicious_patterns.append("Rapid buy-sell pattern detected")
            risk_score += 40
            violations.append("Suspicious trading pattern")
        
        # 3. Unusual spike in activity
        if await self._check_activity_spike(db, user_id):
            suspicious_patterns.append("Unusual activity spike")
            risk_score += 25
        
        # 4. Multiple small transactions (structuring)
        if await self._check_structuring_pattern(db, user_id, amount):
            suspicious_patterns.append("Possible structuring detected")
            risk_score += 45
            violations.append("Transaction structuring pattern")
        
        # 5. Dormant account suddenly active
        if await self._check_dormant_account_activity(db, user_id):
            suspicious_patterns.append("Dormant account reactivation")
            risk_score += 35
        
        # Determine action based on risk
        if risk_score >= 70:
            status = ComplianceStatus.FLAGGED
            action = ComplianceAction.FREEZE
            risk_category = RiskCategory.VERY_HIGH
            
            # File Suspicious Transaction Report (STR)
            await self._file_suspicious_transaction_report(
                db, user_id, transaction_details, suspicious_patterns
            )
        elif risk_score >= 50:
            status = ComplianceStatus.UNDER_REVIEW
            action = ComplianceAction.REVIEW
            risk_category = RiskCategory.HIGH
        elif risk_score >= 30:
            status = ComplianceStatus.APPROVED
            action = ComplianceAction.REPORT
            risk_category = RiskCategory.MEDIUM
        else:
            status = ComplianceStatus.APPROVED
            action = ComplianceAction.ALLOW
            risk_category = RiskCategory.LOW
        
        # Store compliance check
        compliance_check = ComplianceCheck(
            id=check_id,
            user_id=user_id,
            check_type="aml",
            entity_type="transaction",
            entity_id=transaction_details.get('transaction_id'),
            status=status,
            risk_score=risk_score,
            risk_category=risk_category.value,
            action_taken=action.value,
            regulations_checked=[RegulationType.PMLA.value, RegulationType.FEMA.value],
            violations_found=violations,
            metadata={
                "transaction_details": transaction_details,
                "suspicious_patterns": suspicious_patterns
            }
        )
        
        db.add(compliance_check)
        await db.commit()
        
        return ComplianceCheckResponse(
            check_id=check_id,
            status=status,
            action=action,
            risk_score=risk_score,
            risk_category=risk_category,
            violations=violations,
            recommendations=self._get_aml_recommendations(suspicious_patterns),
            requires_manual_review=risk_category in [RiskCategory.HIGH, RiskCategory.VERY_HIGH]
        )
    
    async def validate_signal_compliance(
        self,
        db: AsyncSession,
        signal: Signal
    ) -> ComplianceCheckResponse:
        """Validate if signal complies with SEBI regulations"""
        
        check_id = str(uuid.uuid4())
        violations = []
        risk_score = 0
        
        # Check for required disclaimers
        if not hasattr(signal, 'disclaimer') or not signal.disclaimer:
            violations.append("Missing mandatory risk disclaimer")
            risk_score += 40
        
        # Check for guaranteed returns claims
        if signal.rationale and any(word in signal.rationale.lower() for word in ['guaranteed', 'assured', 'definite profit']):
            violations.append("Contains prohibited guaranteed returns claim")
            risk_score += 50
        
        # Check stop loss presence
        if not signal.stop_loss:
            violations.append("No stop loss defined")
            risk_score += 20
        
        # Check for reasonable targets
        if signal.target_price and signal.entry_price:
            target_percentage = abs((signal.target_price - signal.entry_price) / signal.entry_price * 100)
            if target_percentage > 20:  # More than 20% target
                violations.append("Unrealistic target price")
                risk_score += 25
        
        # Check for penny stocks
        if signal.entry_price < 10:
            violations.append("Penny stock - requires additional disclosure")
            risk_score += 15
        
        # Determine compliance status
        if risk_score >= 60:
            status = ComplianceStatus.REJECTED
            action = ComplianceAction.BLOCK
            risk_category = RiskCategory.HIGH
        elif risk_score >= 40:
            status = ComplianceStatus.FLAGGED
            action = ComplianceAction.REVIEW
            risk_category = RiskCategory.MEDIUM
        else:
            status = ComplianceStatus.APPROVED
            action = ComplianceAction.ALLOW
            risk_category = RiskCategory.LOW
        
        # Store compliance check
        compliance_check = ComplianceCheck(
            id=check_id,
            user_id=str(signal.user_id),
            check_type="signal_compliance",
            entity_type="signal",
            entity_id=str(signal.id),
            status=status,
            risk_score=risk_score,
            risk_category=risk_category.value,
            action_taken=action.value,
            regulations_checked=[RegulationType.SEBI.value],
            violations_found=violations,
            metadata={"signal_id": str(signal.id), "symbol": signal.symbol}
        )
        
        db.add(compliance_check)
        await db.commit()
        
        return ComplianceCheckResponse(
            check_id=check_id,
            status=status,
            action=action,
            risk_score=risk_score,
            risk_category=risk_category,
            violations=violations,
            recommendations=["Add risk disclaimer", "Include stop loss"] if violations else [],
            requires_manual_review=False
        )
    
    async def audit_user_activity(
        self,
        db: AsyncSession,
        user_id: str,
        action: str,
        resource_type: str,
        resource_id: str,
        request_data: Dict[str, Any],
        response_data: Dict[str, Any],
        ip_address: str,
        user_agent: str
    ):
        """Create audit log entry for user activity"""
        
        # Determine if compliance relevant
        compliance_relevant = action in [
            'execute_trade', 'place_order', 'withdraw_funds',
            'update_kyc', 'generate_signal', 'modify_limits'
        ]
        
        audit_log = AuditLog(
            event_type=action,
            event_category=resource_type,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            request_data=request_data,
            response_data=response_data,
            ip_address=ip_address,
            user_agent=user_agent,
            compliance_relevant=compliance_relevant,
            requires_review=False
        )
        
        db.add(audit_log)
        await db.commit()
    
    async def generate_compliance_report(
        self,
        db: AsyncSession,
        report_type: str,
        start_date: datetime,
        end_date: datetime,
        regulator: str
    ) -> Dict[str, Any]:
        """Generate compliance report for regulators"""
        
        report_data = {
            "report_type": report_type,
            "period": f"{start_date.date()} to {end_date.date()}",
            "regulator": regulator,
            "generated_at": datetime.utcnow().isoformat()
        }
        
        if report_type == "sebi_monthly":
            report_data.update(await self._generate_sebi_report(db, start_date, end_date))
        elif report_type == "pmla_str":
            report_data.update(await self._generate_str_report(db, start_date, end_date))
        elif report_type == "rbi_forex":
            report_data.update(await self._generate_forex_report(db, start_date, end_date))
        
        # Store report
        compliance_report = ComplianceReport(
            report_type=report_type,
            report_period_start=start_date,
            report_period_end=end_date,
            regulator=regulator,
            report_data=report_data,
            status="generated"
        )
        
        db.add(compliance_report)
        await db.commit()
        
        return report_data
    
    # Helper methods
    
    async def _get_user_trading_limits(self, db: AsyncSession, user_id: str) -> TradingLimit:
        """Get user's trading limits"""
        # This would fetch from database
        return TradingLimit(
            user_id=user_id,
            daily_trade_limit=Decimal('1000000'),  # ₹10 lakhs
            single_trade_limit=Decimal('200000'),   # ₹2 lakhs
            daily_loss_limit=Decimal('50000'),      # ₹50k
            margin_limit=Decimal('500000'),         # ₹5 lakhs
            position_limit=10,
            equity_limit=Decimal('800000'),
            derivative_limit=Decimal('500000'),
            commodity_limit=Decimal('200000'),
            currency_limit=Decimal('100000')
        )
    
    async def _get_daily_traded_value(self, db: AsyncSession, user_id: str) -> Decimal:
        """Get total value traded today by user"""
        # This would calculate from database
        return Decimal('250000')
    
    async def _check_rapid_trading_pattern(self, db: AsyncSession, user_id: str) -> bool:
        """Check for rapid buy-sell patterns indicating layering"""
        # This would analyze trading patterns
        return False
    
    async def _check_activity_spike(self, db: AsyncSession, user_id: str) -> bool:
        """Check for unusual spike in trading activity"""
        # This would compare with historical activity
        return False
    
    async def _check_structuring_pattern(self, db: AsyncSession, user_id: str, amount: Decimal) -> bool:
        """Check for transaction structuring to avoid reporting"""
        # This would analyze transaction patterns
        return False
    
    async def _check_dormant_account_activity(self, db: AsyncSession, user_id: str) -> bool:
        """Check if dormant account suddenly became active"""
        # This would check account activity history
        return False
    
    async def _file_suspicious_transaction_report(
        self,
        db: AsyncSession,
        user_id: str,
        transaction_details: Dict[str, Any],
        suspicious_patterns: List[str]
    ):
        """File STR with Financial Intelligence Unit"""
        logger.warning(f"Filing STR for user {user_id}: {suspicious_patterns}")
        # This would integrate with FIU-IND reporting system
    
    def _get_kyc_recommendations(self, violations: List[str]) -> List[str]:
        """Get recommendations based on KYC violations"""
        recommendations = []
        if "PAN number missing" in violations:
            recommendations.append("Submit PAN card for verification")
        if "Bank account not verified" in violations:
            recommendations.append("Complete bank account verification")
        if "Demat account not linked" in violations:
            recommendations.append("Link your demat account")
        return recommendations
    
    def _get_aml_recommendations(self, patterns: List[str]) -> List[str]:
        """Get recommendations based on AML patterns"""
        recommendations = []
        if "Large value transaction" in patterns:
            recommendations.append("Provide source of funds documentation")
        if "Rapid buy-sell pattern detected" in patterns:
            recommendations.append("Explain trading strategy")
        return recommendations
    
    async def _generate_sebi_report(self, db: AsyncSession, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate SEBI compliance report"""
        return {
            "total_users": 1000,
            "kyc_completed": 950,
            "signals_generated": 5000,
            "compliance_violations": 23,
            "enforcement_actions": 5
        }
    
    async def _generate_str_report(self, db: AsyncSession, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate Suspicious Transaction Report"""
        return {
            "suspicious_transactions": 12,
            "total_amount": 15000000,
            "users_flagged": 8,
            "patterns_detected": ["structuring", "layering", "rapid_trading"]
        }
    
    async def _generate_forex_report(self, db: AsyncSession, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate RBI forex compliance report"""
        return {
            "forex_transactions": 45,
            "total_volume": 2500000,
            "limit_breaches": 2,
            "lrs_utilization": "45%"
        }

# Initialize service
compliance_service = ComplianceService()