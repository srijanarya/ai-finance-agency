"""
Payment and Wallet models for AI Finance Agency
Handles wallet management, transactions, payment methods, and financial operations
"""

import enum
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, Dict, Any

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, ForeignKey, String, Text, Integer,
    UniqueConstraint, Index, CheckConstraint, DECIMAL, JSON
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship, validates
from sqlalchemy.sql import func

from database.connection import Base


class PaymentMethodType(str, enum.Enum):
    """Payment method type enumeration"""
    CARD = "card"
    UPI = "upi"
    NETBANKING = "netbanking"
    WALLET = "wallet"
    BANK_TRANSFER = "bank_transfer"


class CardBrand(str, enum.Enum):
    """Card brand enumeration"""
    VISA = "visa"
    MASTERCARD = "mastercard"
    RUPAY = "rupay"
    AMEX = "amex"
    DINERS = "diners"


class TransactionType(str, enum.Enum):
    """Transaction type enumeration"""
    CREDIT = "credit"
    DEBIT = "debit"
    REFUND = "refund"
    REVERSAL = "reversal"


class TransactionCategory(str, enum.Enum):
    """Transaction category enumeration"""
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    SUBSCRIPTION = "subscription"
    PURCHASE = "purchase"
    REFUND = "refund"
    FEE = "fee"
    REWARD = "reward"
    TRANSFER = "transfer"


class TransactionStatus(str, enum.Enum):
    """Transaction status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class WithdrawalStatus(str, enum.Enum):
    """Withdrawal status enumeration"""
    PENDING = "pending"
    APPROVED = "approved"
    PROCESSING = "processing"
    COMPLETED = "completed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class PaymentGateway(str, enum.Enum):
    """Payment gateway enumeration"""
    RAZORPAY = "razorpay"
    STRIPE = "stripe"
    PAYTM = "paytm"
    PHONEPE = "phonepe"
    MOCK = "mock"  # For testing


class Wallet(Base):
    """
    User wallet model for managing digital wallet balance and limits
    Each user has one wallet for INR transactions
    """
    __tablename__ = "wallets"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # User association (one-to-one)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Balance information (in paise for precision)
    balance = Column(DECIMAL(12, 2), default=Decimal('0.00'), nullable=False)
    locked_balance = Column(DECIMAL(12, 2), default=Decimal('0.00'), nullable=False)
    currency = Column(String(3), default="INR", nullable=False)
    
    # Wallet status
    is_active = Column(Boolean, default=True, nullable=False)
    is_frozen = Column(Boolean, default=False, nullable=False)
    frozen_reason = Column(Text, nullable=True)
    frozen_at = Column(DateTime(timezone=True), nullable=True)
    frozen_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Transaction limits (based on KYC level)
    daily_limit = Column(DECIMAL(12, 2), nullable=True)
    monthly_limit = Column(DECIMAL(12, 2), nullable=True)
    daily_spent = Column(DECIMAL(12, 2), default=Decimal('0.00'), nullable=False)
    monthly_spent = Column(DECIMAL(12, 2), default=Decimal('0.00'), nullable=False)
    
    # Limit reset timestamps
    daily_reset_at = Column(DateTime(timezone=True), nullable=True)
    monthly_reset_at = Column(DateTime(timezone=True), nullable=True)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="wallet", uselist=False)
    transactions = relationship("Transaction", back_populates="wallet", cascade="all, delete-orphan")
    withdrawal_requests = relationship("WithdrawalRequest", back_populates="wallet", cascade="all, delete-orphan")
    frozen_by_user = relationship("User", foreign_keys=[frozen_by])
    
    # Constraints
    __table_args__ = (
        CheckConstraint("balance >= 0", name="wallet_balance_positive"),
        CheckConstraint("locked_balance >= 0", name="wallet_locked_balance_positive"),
        CheckConstraint("daily_spent >= 0", name="wallet_daily_spent_positive"),
        CheckConstraint("monthly_spent >= 0", name="wallet_monthly_spent_positive"),
        Index("idx_wallet_user", "user_id"),
        Index("idx_wallet_active", "is_active"),
    )
    
    @hybrid_property
    def available_balance(self) -> Decimal:
        """Get available balance (total - locked)"""
        return self.balance - self.locked_balance
    
    @hybrid_property
    def daily_remaining_limit(self) -> Optional[Decimal]:
        """Get remaining daily transaction limit"""
        if not self.daily_limit:
            return None
        return max(Decimal('0.00'), self.daily_limit - self.daily_spent)
    
    @hybrid_property
    def monthly_remaining_limit(self) -> Optional[Decimal]:
        """Get remaining monthly transaction limit"""
        if not self.monthly_limit:
            return None
        return max(Decimal('0.00'), self.monthly_limit - self.monthly_spent)
    
    def can_transact(self, amount: Decimal) -> tuple[bool, Optional[str]]:
        """Check if wallet can perform transaction of given amount"""
        if not self.is_active:
            return False, "Wallet is inactive"
        
        if self.is_frozen:
            return False, f"Wallet is frozen: {self.frozen_reason}"
        
        if amount > self.available_balance:
            return False, "Insufficient balance"
        
        if self.daily_limit and (self.daily_spent + amount) > self.daily_limit:
            return False, "Daily transaction limit exceeded"
        
        if self.monthly_limit and (self.monthly_spent + amount) > self.monthly_limit:
            return False, "Monthly transaction limit exceeded"
        
        return True, None
    
    def lock_amount(self, amount: Decimal) -> bool:
        """Lock amount for pending transaction"""
        if amount > self.available_balance:
            return False
        
        self.locked_balance += amount
        return True
    
    def unlock_amount(self, amount: Decimal) -> bool:
        """Unlock amount from pending transaction"""
        if amount > self.locked_balance:
            return False
        
        self.locked_balance -= amount
        return True
    
    def credit(self, amount: Decimal) -> bool:
        """Credit amount to wallet"""
        if amount <= 0:
            return False
        
        self.balance += amount
        return True
    
    def debit(self, amount: Decimal) -> bool:
        """Debit amount from wallet (includes locked amount)"""
        if amount <= 0:
            return False
        
        if amount > self.balance:
            return False
        
        self.balance -= amount
        # Also reduce from locked if applicable
        if self.locked_balance > 0:
            unlock_amount = min(amount, self.locked_balance)
            self.locked_balance -= unlock_amount
        
        return True
    
    def reset_daily_limits(self):
        """Reset daily spending limits"""
        self.daily_spent = Decimal('0.00')
        self.daily_reset_at = datetime.utcnow()
    
    def reset_monthly_limits(self):
        """Reset monthly spending limits"""
        self.monthly_spent = Decimal('0.00')
        self.monthly_reset_at = datetime.utcnow()
    
    def freeze_wallet(self, reason: str, frozen_by_user_id: uuid.UUID):
        """Freeze wallet with reason"""
        self.is_frozen = True
        self.frozen_reason = reason
        self.frozen_at = datetime.utcnow()
        self.frozen_by = frozen_by_user_id
    
    def unfreeze_wallet(self):
        """Unfreeze wallet"""
        self.is_frozen = False
        self.frozen_reason = None
        self.frozen_at = None
        self.frozen_by = None
    
    def __repr__(self):
        return f"<Wallet(id={self.id}, user_id={self.user_id}, balance={self.balance})>"


class PaymentMethod(Base):
    """
    Payment method model for storing user's payment instruments
    Supports cards, UPI, net banking, and wallet integrations
    """
    __tablename__ = "payment_methods"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # User association
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Method details
    method_type = Column(Enum(PaymentMethodType), nullable=False, index=True)
    provider = Column(String(50), nullable=True)  # 'hdfc', 'phonepe', etc.
    
    # Tokenized data (for security)
    token = Column(String(255), unique=True, nullable=True)
    gateway_token = Column(String(255), nullable=True)  # Gateway-specific token
    last_four = Column(String(4), nullable=True)
    display_name = Column(String(100), nullable=False)
    
    # Card specific (encrypted/tokenized)
    card_brand = Column(Enum(CardBrand), nullable=True)
    card_expiry = Column(String(7), nullable=True)  # MM/YYYY
    card_holder_name = Column(String(100), nullable=True)
    card_network = Column(String(20), nullable=True)  # 'domestic', 'international'
    
    # UPI specific
    upi_id = Column(String(100), nullable=True)
    upi_provider = Column(String(50), nullable=True)  # 'phonepe', 'gpay', 'paytm'
    
    # Bank specific
    bank_name = Column(String(100), nullable=True)
    bank_code = Column(String(10), nullable=True)  # IFSC first 4 chars
    account_number_masked = Column(String(20), nullable=True)
    account_type = Column(String(20), nullable=True)  # 'savings', 'current'
    
    # Wallet specific
    wallet_provider = Column(String(50), nullable=True)  # 'paytm', 'phonepe'
    wallet_phone = Column(String(15), nullable=True)
    
    # Status and verification
    is_default = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Security
    fingerprint = Column(String(255), nullable=True)  # Unique identifier
    
    # Metadata
    payment_metadata = Column(JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    transactions = relationship("Transaction", back_populates="payment_method")
    withdrawal_requests = relationship("WithdrawalRequest", back_populates="bank_account")
    
    # Constraints
    __table_args__ = (
        Index("idx_payment_method_user", "user_id"),
        Index("idx_payment_method_type", "method_type"),
        Index("idx_payment_method_default", "user_id", "is_default"),
    )
    
    @validates('method_type')
    def validate_method_type(self, key, method_type):
        """Validate method type and required fields"""
        if method_type == PaymentMethodType.CARD:
            if not self.card_brand or not self.card_expiry:
                raise ValueError("Card brand and expiry are required for card payments")
        elif method_type == PaymentMethodType.UPI:
            if not self.upi_id:
                raise ValueError("UPI ID is required for UPI payments")
        elif method_type == PaymentMethodType.NETBANKING:
            if not self.bank_name:
                raise ValueError("Bank name is required for net banking")
        
        return method_type
    
    def is_expired(self) -> bool:
        """Check if payment method is expired (for cards)"""
        if self.method_type != PaymentMethodType.CARD or not self.card_expiry:
            return False
        
        try:
            month, year = self.card_expiry.split('/')
            expiry_date = datetime(int(year), int(month), 1)
            return datetime.utcnow() > expiry_date
        except (ValueError, IndexError):
            return True
    
    def mask_sensitive_data(self):
        """Mask sensitive data for display"""
        if self.method_type == PaymentMethodType.CARD:
            return f"**** **** **** {self.last_four}"
        elif self.method_type == PaymentMethodType.UPI:
            if self.upi_id:
                parts = self.upi_id.split('@')
                if len(parts) == 2:
                    return f"{parts[0][:2]}***@{parts[1]}"
            return "UPI ***"
        elif self.method_type == PaymentMethodType.NETBANKING:
            return f"{self.bank_name} ***{self.last_four or ''}"
        else:
            return f"{self.method_type.value} ***"
    
    def __repr__(self):
        return f"<PaymentMethod(id={self.id}, type={self.method_type}, display_name='{self.display_name}')>"


class Transaction(Base):
    """
    Transaction model for recording all financial transactions
    Supports credits, debits, refunds, and reversals
    """
    __tablename__ = "transactions"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # User and wallet association
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    wallet_id = Column(UUID(as_uuid=True), ForeignKey("wallets.id"), nullable=False, index=True)
    
    # Transaction identification
    transaction_id = Column(String(100), unique=True, nullable=False, index=True)
    external_transaction_id = Column(String(255), nullable=True)  # From external system
    
    # Transaction details
    type = Column(Enum(TransactionType), nullable=False, index=True)
    category = Column(Enum(TransactionCategory), nullable=False, index=True)
    amount = Column(DECIMAL(12, 2), nullable=False)
    currency = Column(String(3), default="INR", nullable=False)
    
    # Payment details
    payment_method_id = Column(UUID(as_uuid=True), ForeignKey("payment_methods.id"), nullable=True)
    gateway = Column(Enum(PaymentGateway), nullable=True)
    gateway_transaction_id = Column(String(255), nullable=True, index=True)
    gateway_order_id = Column(String(255), nullable=True)
    gateway_payment_id = Column(String(255), nullable=True)
    
    # Status tracking
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING, nullable=False, index=True)
    status_message = Column(Text, nullable=True)
    failure_reason = Column(String(255), nullable=True)
    
    # Related transaction (for refunds, reversals)
    parent_transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True)
    
    # Financial breakdown
    gateway_fee = Column(DECIMAL(10, 2), default=Decimal('0.00'), nullable=False)
    platform_fee = Column(DECIMAL(10, 2), default=Decimal('0.00'), nullable=False)
    gst_amount = Column(DECIMAL(10, 2), default=Decimal('0.00'), nullable=False)
    tds_amount = Column(DECIMAL(10, 2), default=Decimal('0.00'), nullable=False)
    net_amount = Column(DECIMAL(12, 2), nullable=False)
    
    # Balance snapshots
    balance_before = Column(DECIMAL(12, 2), nullable=True)
    balance_after = Column(DECIMAL(12, 2), nullable=True)
    
    # Description and metadata
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    payment_metadata = Column(JSONB, default=dict)
    
    # Reference information
    reference_id = Column(String(255), nullable=True)  # Order ID, subscription ID, etc.
    reference_type = Column(String(50), nullable=True)  # 'order', 'subscription', etc.
    
    # Timestamps
    initiated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    authorized_at = Column(DateTime(timezone=True), nullable=True)
    captured_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    failed_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    wallet = relationship("Wallet", back_populates="transactions")
    payment_method = relationship("PaymentMethod", back_populates="transactions")
    parent_transaction = relationship("Transaction", remote_side=[id])
    child_transactions = relationship("Transaction", remote_side=[parent_transaction_id])
    
    # Constraints
    __table_args__ = (
        CheckConstraint("amount > 0", name="transaction_amount_positive"),
        CheckConstraint("net_amount >= 0", name="transaction_net_amount_positive"),
        Index("idx_transaction_user_status", "user_id", "status"),
        Index("idx_transaction_gateway", "gateway", "gateway_transaction_id"),
        Index("idx_transaction_created", "created_at"),
        Index("idx_transaction_reference", "reference_type", "reference_id"),
    )
    
    @hybrid_property
    def is_successful(self) -> bool:
        """Check if transaction is successful"""
        return self.status == TransactionStatus.SUCCESS
    
    @hybrid_property
    def is_pending(self) -> bool:
        """Check if transaction is pending"""
        return self.status in [TransactionStatus.PENDING, TransactionStatus.PROCESSING]
    
    @hybrid_property
    def is_failed(self) -> bool:
        """Check if transaction failed"""
        return self.status in [TransactionStatus.FAILED, TransactionStatus.CANCELLED, TransactionStatus.EXPIRED]
    
    def mark_success(self, gateway_transaction_id: Optional[str] = None):
        """Mark transaction as successful"""
        self.status = TransactionStatus.SUCCESS
        self.completed_at = datetime.utcnow()
        if gateway_transaction_id:
            self.gateway_transaction_id = gateway_transaction_id
    
    def mark_failed(self, reason: str, failure_code: Optional[str] = None):
        """Mark transaction as failed"""
        self.status = TransactionStatus.FAILED
        self.failure_reason = reason
        self.failed_at = datetime.utcnow()
        if failure_code:
            self.status_message = failure_code
    
    def mark_processing(self):
        """Mark transaction as processing"""
        self.status = TransactionStatus.PROCESSING
        self.authorized_at = datetime.utcnow()
    
    def calculate_net_amount(self):
        """Calculate net amount after fees and taxes"""
        self.net_amount = self.amount - self.gateway_fee - self.platform_fee - self.gst_amount - self.tds_amount
    
    def __repr__(self):
        return f"<Transaction(id={self.id}, type={self.type}, amount={self.amount}, status={self.status})>"


class PaymentWebhook(Base):
    """
    Payment webhook model for storing and processing gateway webhooks
    Ensures idempotent processing of payment events
    """
    __tablename__ = "payment_webhooks"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Webhook details
    gateway = Column(Enum(PaymentGateway), nullable=False, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    event_id = Column(String(255), unique=True, nullable=False, index=True)
    
    # Request details
    headers = Column(JSONB, nullable=True)
    payload = Column(JSONB, nullable=False)
    signature = Column(String(500), nullable=True)
    ip_address = Column(String(45), nullable=True)
    
    # Processing status
    is_processed = Column(Boolean, default=False, nullable=False, index=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)
    error_message = Column(Text, nullable=True)
    
    # Related transaction
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True)
    
    # Verification
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_error = Column(Text, nullable=True)
    
    # Metadata
    received_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    transaction = relationship("Transaction")
    
    # Constraints
    __table_args__ = (
        Index("idx_webhook_gateway_event", "gateway", "event_type"),
        Index("idx_webhook_processed", "is_processed"),
        Index("idx_webhook_received", "received_at"),
    )
    
    def mark_processed(self, transaction_id: Optional[uuid.UUID] = None):
        """Mark webhook as processed"""
        self.is_processed = True
        self.processed_at = datetime.utcnow()
        if transaction_id:
            self.transaction_id = transaction_id
    
    def mark_failed(self, error: str):
        """Mark webhook processing as failed"""
        self.error_message = error
        self.retry_count += 1
    
    def __repr__(self):
        return f"<PaymentWebhook(id={self.id}, gateway={self.gateway}, event_type={self.event_type})>"


class WithdrawalRequest(Base):
    """
    Withdrawal request model for managing fund withdrawals
    Supports bank transfer withdrawals with approval workflow
    """
    __tablename__ = "withdrawal_requests"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # User and wallet association
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    wallet_id = Column(UUID(as_uuid=True), ForeignKey("wallets.id"), nullable=False)
    
    # Withdrawal details
    amount = Column(DECIMAL(12, 2), nullable=False)
    currency = Column(String(3), default="INR", nullable=False)
    
    # Bank account details
    bank_account_id = Column(UUID(as_uuid=True), ForeignKey("payment_methods.id"), nullable=True)
    account_number = Column(String(50), nullable=False)  # Encrypted
    ifsc_code = Column(String(11), nullable=False)
    account_holder_name = Column(String(100), nullable=False)
    bank_name = Column(String(100), nullable=True)
    
    # Approval workflow
    status = Column(Enum(WithdrawalStatus), default=WithdrawalStatus.PENDING, nullable=False, index=True)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejected_reason = Column(Text, nullable=True)
    
    # Processing details
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True)
    utr_number = Column(String(50), nullable=True)  # Bank reference number
    processing_fee = Column(DECIMAL(10, 2), default=Decimal('0.00'), nullable=False)
    net_amount = Column(DECIMAL(12, 2), nullable=False)
    
    # Timestamps
    requested_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    wallet = relationship("Wallet", back_populates="withdrawal_requests")
    bank_account = relationship("PaymentMethod", back_populates="withdrawal_requests")
    transaction = relationship("Transaction")
    approved_by_user = relationship("User", foreign_keys=[approved_by])
    
    # Constraints
    __table_args__ = (
        CheckConstraint("amount > 0", name="withdrawal_amount_positive"),
        CheckConstraint("net_amount >= 0", name="withdrawal_net_amount_positive"),
        Index("idx_withdrawal_user_status", "user_id", "status"),
        Index("idx_withdrawal_requested", "requested_at"),
    )
    
    def approve(self, approved_by_user_id: uuid.UUID):
        """Approve withdrawal request"""
        self.status = WithdrawalStatus.APPROVED
        self.approved_by = approved_by_user_id
        self.approved_at = datetime.utcnow()
    
    def reject(self, reason: str, rejected_by_user_id: uuid.UUID):
        """Reject withdrawal request"""
        self.status = WithdrawalStatus.REJECTED
        self.rejected_reason = reason
        self.approved_by = rejected_by_user_id  # Who rejected
        self.approved_at = datetime.utcnow()
    
    def mark_processing(self):
        """Mark withdrawal as processing"""
        self.status = WithdrawalStatus.PROCESSING
        self.processed_at = datetime.utcnow()
    
    def mark_completed(self, utr_number: str):
        """Mark withdrawal as completed"""
        self.status = WithdrawalStatus.COMPLETED
        self.utr_number = utr_number
        self.completed_at = datetime.utcnow()
    
    def calculate_net_amount(self):
        """Calculate net amount after processing fee"""
        self.net_amount = self.amount - self.processing_fee
    
    def __repr__(self):
        return f"<WithdrawalRequest(id={self.id}, amount={self.amount}, status={self.status})>"