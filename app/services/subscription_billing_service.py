"""
Subscription Billing Service for Premium AI Trading Signals
Handles tiered subscriptions, payment processing, and billing automation
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from decimal import Decimal
import json
import hashlib
import hmac

import stripe
from pydantic import BaseModel, Field, validator
from sqlalchemy import Column, Integer, String, DateTime, Decimal as SQLDecimal, Boolean, Text, ForeignKey, Index
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid

from app.core.config import get_settings
from app.core.database import Base, get_db
from app.models.user import User
from app.services.ai_trading_signals_engine import AITradingSignalsEngine

logger = logging.getLogger(__name__)
settings = get_settings()

# Configure Stripe
stripe.api_key = settings.stripe_secret_key

class SubscriptionTier(str, Enum):
    """Subscription tier levels"""
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"

class BillingInterval(str, Enum):
    """Billing frequency options"""
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

class SubscriptionStatus(str, Enum):
    """Subscription status states"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    CANCELLED = "cancelled"
    PAST_DUE = "past_due"
    TRIAL = "trial"
    SUSPENDED = "suspended"

class PaymentStatus(str, Enum):
    """Payment status states"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"

# Database Models

class SubscriptionPlan(Base):
    """Subscription plans and pricing configuration"""
    __tablename__ = "subscription_plans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tier = Column(String(50), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(SQLDecimal(10, 2), nullable=False)
    billing_interval = Column(String(20), nullable=False)
    currency = Column(String(3), default="INR")
    
    # Feature limits
    daily_signals_limit = Column(Integer, default=0)  # 0 = unlimited
    ai_models_access = Column(JSONB, default=list)  # List of AI model types
    backtesting_enabled = Column(Boolean, default=False)
    real_time_alerts = Column(Boolean, default=False)
    portfolio_management = Column(Boolean, default=False)
    api_access = Column(Boolean, default=False)
    priority_support = Column(Boolean, default=False)
    custom_strategies = Column(Boolean, default=False)
    
    # Stripe configuration
    stripe_price_id = Column(String(200))
    stripe_product_id = Column(String(200))
    
    # Meta
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subscriptions = relationship("UserSubscription", back_populates="plan")
    
    __table_args__ = (
        Index('ix_subscription_plans_tier_interval', 'tier', 'billing_interval'),
    )

class UserSubscription(Base):
    """User subscription instances"""
    __tablename__ = "user_subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("subscription_plans.id"), nullable=False)
    
    # Subscription details
    status = Column(String(20), nullable=False, default=SubscriptionStatus.PENDING)
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    current_period_start = Column(DateTime, nullable=False)
    current_period_end = Column(DateTime, nullable=False)
    cancelled_at = Column(DateTime)
    trial_end = Column(DateTime)
    
    # Payment details
    stripe_subscription_id = Column(String(200))
    stripe_customer_id = Column(String(200))
    
    # Usage tracking
    signals_consumed_today = Column(Integer, default=0)
    last_signal_date = Column(DateTime)
    total_signals_consumed = Column(Integer, default=0)
    
    # Meta
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
    payments = relationship("Payment", back_populates="subscription")
    
    __table_args__ = (
        Index('ix_user_subscriptions_user_id', 'user_id'),
        Index('ix_user_subscriptions_status', 'status'),
        Index('ix_user_subscriptions_stripe_id', 'stripe_subscription_id'),
    )

class Payment(Base):
    """Payment transactions"""
    __tablename__ = "payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("user_subscriptions.id"), nullable=False)
    
    # Payment details
    amount = Column(SQLDecimal(10, 2), nullable=False)
    currency = Column(String(3), default="INR")
    status = Column(String(20), nullable=False, default=PaymentStatus.PENDING)
    payment_method = Column(String(50))  # card, upi, netbanking, wallet
    
    # External IDs
    stripe_payment_intent_id = Column(String(200))
    stripe_invoice_id = Column(String(200))
    transaction_id = Column(String(200))  # External transaction ID
    
    # Metadata
    payment_metadata = Column(JSONB, default=dict)
    failure_reason = Column(Text)
    
    # Timing
    attempted_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)
    
    # Meta
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subscription = relationship("UserSubscription", back_populates="payments")
    
    __table_args__ = (
        Index('ix_payments_subscription_id', 'subscription_id'),
        Index('ix_payments_status', 'status'),
        Index('ix_payments_stripe_intent', 'stripe_payment_intent_id'),
    )

class UsageLog(Base):
    """Track feature usage for billing and analytics"""
    __tablename__ = "usage_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Usage details
    feature = Column(String(100), nullable=False)  # signals, backtesting, api_call
    usage_count = Column(Integer, default=1)
    usage_data = Column(JSONB, default=dict)  # Additional context
    
    # Timing
    date = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Meta
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('ix_usage_logs_user_date', 'user_id', 'date'),
        Index('ix_usage_logs_feature', 'feature'),
    )

# Pydantic Models

class SubscriptionPlanSchema(BaseModel):
    """Subscription plan data model"""
    id: Optional[str] = None
    tier: SubscriptionTier
    name: str
    description: Optional[str] = None
    price: Decimal
    billing_interval: BillingInterval
    currency: str = "INR"
    
    # Features
    daily_signals_limit: int = 0
    ai_models_access: List[str] = []
    backtesting_enabled: bool = False
    real_time_alerts: bool = False
    portfolio_management: bool = False
    api_access: bool = False
    priority_support: bool = False
    custom_strategies: bool = False
    
    class Config:
        orm_mode = True

class CreateSubscriptionRequest(BaseModel):
    """Request to create a new subscription"""
    plan_id: str
    payment_method_id: Optional[str] = None
    trial_days: int = 0
    promotion_code: Optional[str] = None

class SubscriptionResponse(BaseModel):
    """Subscription response model"""
    id: str
    status: SubscriptionStatus
    plan: SubscriptionPlanSchema
    current_period_start: datetime
    current_period_end: datetime
    trial_end: Optional[datetime] = None
    
    # Usage
    signals_consumed_today: int
    signals_remaining_today: Optional[int] = None
    
    class Config:
        orm_mode = True

class PaymentResponse(BaseModel):
    """Payment response model"""
    id: str
    amount: Decimal
    currency: str
    status: PaymentStatus
    payment_method: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

# Service Classes

class SubscriptionBillingService:
    """
    Core subscription billing service
    """
    
    def __init__(self):
        self.stripe = stripe
        self.ai_signals_engine = AITradingSignalsEngine()
    
    async def get_available_plans(self, db: AsyncSession) -> List[SubscriptionPlan]:
        """Get all available subscription plans"""
        from sqlalchemy import select
        
        result = await db.execute(
            select(SubscriptionPlan)
            .where(SubscriptionPlan.is_active == True)
            .order_by(SubscriptionPlan.price)
        )
        
        return result.scalars().all()
    
    async def create_subscription_plan(
        self,
        db: AsyncSession,
        plan_data: SubscriptionPlanSchema
    ) -> SubscriptionPlan:
        """Create a new subscription plan"""
        
        # Create Stripe product and price
        stripe_product = self.stripe.Product.create(
            name=plan_data.name,
            description=plan_data.description,
            metadata={
                'tier': plan_data.tier.value,
                'billing_interval': plan_data.billing_interval.value
            }
        )
        
        # Create Stripe price
        billing_interval_map = {
            BillingInterval.MONTHLY: 'month',
            BillingInterval.QUARTERLY: {'interval': 'month', 'interval_count': 3},
            BillingInterval.YEARLY: 'year'
        }
        
        interval_data = billing_interval_map[plan_data.billing_interval]
        if isinstance(interval_data, dict):
            stripe_price = self.stripe.Price.create(
                product=stripe_product.id,
                unit_amount=int(plan_data.price * 100),  # Convert to cents
                currency=plan_data.currency.lower(),
                recurring=interval_data
            )
        else:
            stripe_price = self.stripe.Price.create(
                product=stripe_product.id,
                unit_amount=int(plan_data.price * 100),
                currency=plan_data.currency.lower(),
                recurring={'interval': interval_data}
            )
        
        # Create database record
        plan = SubscriptionPlan(
            tier=plan_data.tier.value,
            name=plan_data.name,
            description=plan_data.description,
            price=plan_data.price,
            billing_interval=plan_data.billing_interval.value,
            currency=plan_data.currency,
            daily_signals_limit=plan_data.daily_signals_limit,
            ai_models_access=plan_data.ai_models_access,
            backtesting_enabled=plan_data.backtesting_enabled,
            real_time_alerts=plan_data.real_time_alerts,
            portfolio_management=plan_data.portfolio_management,
            api_access=plan_data.api_access,
            priority_support=plan_data.priority_support,
            custom_strategies=plan_data.custom_strategies,
            stripe_price_id=stripe_price.id,
            stripe_product_id=stripe_product.id
        )
        
        db.add(plan)
        await db.commit()
        await db.refresh(plan)
        
        logger.info(f"Created subscription plan: {plan.name} ({plan.tier})")
        return plan
    
    async def create_user_subscription(
        self,
        db: AsyncSession,
        user_id: str,
        request: CreateSubscriptionRequest
    ) -> UserSubscription:
        """Create a new user subscription"""
        
        # Get subscription plan
        from sqlalchemy import select
        
        result = await db.execute(
            select(SubscriptionPlan).where(SubscriptionPlan.id == request.plan_id)
        )
        plan = result.scalar_one_or_none()
        
        if not plan:
            raise ValueError(f"Subscription plan not found: {request.plan_id}")
        
        # Check if user already has an active subscription
        result = await db.execute(
            select(UserSubscription)
            .where(
                UserSubscription.user_id == user_id,
                UserSubscription.status == SubscriptionStatus.ACTIVE
            )
        )
        
        existing_subscription = result.scalar_one_or_none()
        if existing_subscription:
            raise ValueError("User already has an active subscription")
        
        # Get or create Stripe customer
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise ValueError(f"User not found: {user_id}")
        
        stripe_customer = await self._get_or_create_stripe_customer(user)
        
        # Calculate subscription periods
        start_date = datetime.utcnow()
        if request.trial_days > 0:
            trial_end = start_date + timedelta(days=request.trial_days)
            period_start = trial_end
        else:
            trial_end = None
            period_start = start_date
        
        # Calculate period end based on billing interval
        if plan.billing_interval == BillingInterval.MONTHLY:
            period_end = period_start + timedelta(days=30)
        elif plan.billing_interval == BillingInterval.QUARTERLY:
            period_end = period_start + timedelta(days=90)
        else:  # YEARLY
            period_end = period_start + timedelta(days=365)
        
        # Create Stripe subscription
        stripe_subscription_data = {
            'customer': stripe_customer.id,
            'items': [{'price': plan.stripe_price_id}],
            'metadata': {
                'user_id': str(user_id),
                'plan_id': str(plan.id)
            }
        }
        
        if request.trial_days > 0:
            stripe_subscription_data['trial_end'] = int(trial_end.timestamp())
        
        if request.payment_method_id:
            stripe_subscription_data['default_payment_method'] = request.payment_method_id
        
        stripe_subscription = self.stripe.Subscription.create(**stripe_subscription_data)
        
        # Create database subscription
        subscription = UserSubscription(
            user_id=user_id,
            plan_id=plan.id,
            status=SubscriptionStatus.TRIAL if trial_end else SubscriptionStatus.ACTIVE,
            started_at=start_date,
            current_period_start=period_start,
            current_period_end=period_end,
            trial_end=trial_end,
            stripe_subscription_id=stripe_subscription.id,
            stripe_customer_id=stripe_customer.id
        )
        
        db.add(subscription)
        await db.commit()
        await db.refresh(subscription)
        
        logger.info(f"Created subscription for user {user_id}: {plan.name}")
        return subscription
    
    async def _get_or_create_stripe_customer(self, user: User) -> stripe.Customer:
        """Get existing Stripe customer or create new one"""
        
        # Check if user already has a Stripe customer ID
        if hasattr(user, 'stripe_customer_id') and user.stripe_customer_id:
            try:
                return self.stripe.Customer.retrieve(user.stripe_customer_id)
            except stripe.error.InvalidRequestError:
                # Customer doesn't exist, create new one
                pass
        
        # Create new Stripe customer
        customer_data = {
            'email': user.email,
            'name': f"{user.first_name} {user.last_name}".strip(),
            'metadata': {
                'user_id': str(user.id),
                'platform': 'treum_ai_finance'
            }
        }
        
        if hasattr(user, 'phone') and user.phone:
            customer_data['phone'] = user.phone
        
        stripe_customer = self.stripe.Customer.create(**customer_data)
        
        # Update user with Stripe customer ID
        # Note: This would require adding stripe_customer_id to User model
        # user.stripe_customer_id = stripe_customer.id
        # await db.commit()
        
        return stripe_customer
    
    async def cancel_subscription(
        self,
        db: AsyncSession,
        subscription_id: str,
        immediate: bool = False
    ) -> UserSubscription:
        """Cancel a user subscription"""
        
        from sqlalchemy import select
        
        # Get subscription
        result = await db.execute(
            select(UserSubscription).where(UserSubscription.id == subscription_id)
        )
        subscription = result.scalar_one_or_none()
        
        if not subscription:
            raise ValueError(f"Subscription not found: {subscription_id}")
        
        # Cancel in Stripe
        if subscription.stripe_subscription_id:
            if immediate:
                self.stripe.Subscription.delete(subscription.stripe_subscription_id)
                subscription.status = SubscriptionStatus.CANCELLED
                subscription.cancelled_at = datetime.utcnow()
            else:
                # Cancel at period end
                self.stripe.Subscription.modify(
                    subscription.stripe_subscription_id,
                    cancel_at_period_end=True
                )
                subscription.status = SubscriptionStatus.CANCELLED
                subscription.cancelled_at = subscription.current_period_end
        
        await db.commit()
        await db.refresh(subscription)
        
        logger.info(f"Cancelled subscription: {subscription_id}")
        return subscription
    
    async def upgrade_subscription(
        self,
        db: AsyncSession,
        subscription_id: str,
        new_plan_id: str
    ) -> UserSubscription:
        """Upgrade user subscription to a higher tier"""
        
        from sqlalchemy import select
        
        # Get current subscription and new plan
        result = await db.execute(
            select(UserSubscription).where(UserSubscription.id == subscription_id)
        )
        subscription = result.scalar_one_or_none()
        
        result = await db.execute(
            select(SubscriptionPlan).where(SubscriptionPlan.id == new_plan_id)
        )
        new_plan = result.scalar_one_or_none()
        
        if not subscription or not new_plan:
            raise ValueError("Subscription or plan not found")
        
        # Update Stripe subscription
        if subscription.stripe_subscription_id:
            stripe_subscription = self.stripe.Subscription.retrieve(subscription.stripe_subscription_id)
            
            self.stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                items=[{
                    'id': stripe_subscription['items']['data'][0].id,
                    'price': new_plan.stripe_price_id,
                }],
                proration_behavior='create_prorations'
            )
        
        # Update database subscription
        subscription.plan_id = new_plan.id
        await db.commit()
        await db.refresh(subscription)
        
        logger.info(f"Upgraded subscription {subscription_id} to {new_plan.name}")
        return subscription
    
    async def process_webhook(self, payload: bytes, sig_header: str) -> Dict[str, Any]:
        """Process Stripe webhook events"""
        
        try:
            event = self.stripe.Webhook.construct_event(
                payload, sig_header, settings.stripe_webhook_secret
            )
        except ValueError:
            raise ValueError("Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise ValueError("Invalid signature")
        
        # Handle different event types
        if event['type'] == 'invoice.payment_succeeded':
            await self._handle_payment_succeeded(event['data']['object'])
        elif event['type'] == 'invoice.payment_failed':
            await self._handle_payment_failed(event['data']['object'])
        elif event['type'] == 'customer.subscription.updated':
            await self._handle_subscription_updated(event['data']['object'])
        elif event['type'] == 'customer.subscription.deleted':
            await self._handle_subscription_deleted(event['data']['object'])
        else:
            logger.info(f"Unhandled webhook event type: {event['type']}")
        
        return {"status": "success"}
    
    async def _handle_payment_succeeded(self, invoice):
        """Handle successful payment webhook"""
        async with get_db() as db:
            from sqlalchemy import select
            
            # Get subscription by Stripe subscription ID
            result = await db.execute(
                select(UserSubscription)
                .where(UserSubscription.stripe_subscription_id == invoice['subscription'])
            )
            subscription = result.scalar_one_or_none()
            
            if subscription:
                # Create payment record
                payment = Payment(
                    subscription_id=subscription.id,
                    amount=Decimal(invoice['amount_paid'] / 100),
                    currency=invoice['currency'].upper(),
                    status=PaymentStatus.COMPLETED,
                    stripe_payment_intent_id=invoice['payment_intent'],
                    stripe_invoice_id=invoice['id'],
                    completed_at=datetime.utcnow(),
                    payment_metadata={'invoice_data': invoice}
                )
                
                db.add(payment)
                
                # Update subscription status if needed
                if subscription.status != SubscriptionStatus.ACTIVE:
                    subscription.status = SubscriptionStatus.ACTIVE
                
                await db.commit()
                logger.info(f"Payment succeeded for subscription: {subscription.id}")
    
    async def _handle_payment_failed(self, invoice):
        """Handle failed payment webhook"""
        async with get_db() as db:
            from sqlalchemy import select
            
            # Get subscription by Stripe subscription ID
            result = await db.execute(
                select(UserSubscription)
                .where(UserSubscription.stripe_subscription_id == invoice['subscription'])
            )
            subscription = result.scalar_one_or_none()
            
            if subscription:
                # Create payment record
                payment = Payment(
                    subscription_id=subscription.id,
                    amount=Decimal(invoice['amount_due'] / 100),
                    currency=invoice['currency'].upper(),
                    status=PaymentStatus.FAILED,
                    stripe_invoice_id=invoice['id'],
                    failure_reason=invoice.get('last_finalization_error', {}).get('message'),
                    payment_metadata={'invoice_data': invoice}
                )
                
                db.add(payment)
                
                # Update subscription status
                subscription.status = SubscriptionStatus.PAST_DUE
                
                await db.commit()
                logger.warning(f"Payment failed for subscription: {subscription.id}")
    
    async def _handle_subscription_updated(self, subscription_data):
        """Handle subscription update webhook"""
        async with get_db() as db:
            from sqlalchemy import select
            
            result = await db.execute(
                select(UserSubscription)
                .where(UserSubscription.stripe_subscription_id == subscription_data['id'])
            )
            subscription = result.scalar_one_or_none()
            
            if subscription:
                # Update subscription details
                subscription.current_period_start = datetime.fromtimestamp(
                    subscription_data['current_period_start']
                )
                subscription.current_period_end = datetime.fromtimestamp(
                    subscription_data['current_period_end']
                )
                
                # Map Stripe status to our status
                stripe_status = subscription_data['status']
                status_mapping = {
                    'active': SubscriptionStatus.ACTIVE,
                    'past_due': SubscriptionStatus.PAST_DUE,
                    'canceled': SubscriptionStatus.CANCELLED,
                    'incomplete': SubscriptionStatus.PENDING,
                    'incomplete_expired': SubscriptionStatus.CANCELLED,
                    'trialing': SubscriptionStatus.TRIAL,
                    'unpaid': SubscriptionStatus.PAST_DUE
                }
                
                subscription.status = status_mapping.get(
                    stripe_status, 
                    SubscriptionStatus.INACTIVE
                )
                
                await db.commit()
                logger.info(f"Updated subscription: {subscription.id}")
    
    async def _handle_subscription_deleted(self, subscription_data):
        """Handle subscription deletion webhook"""
        async with get_db() as db:
            from sqlalchemy import select
            
            result = await db.execute(
                select(UserSubscription)
                .where(UserSubscription.stripe_subscription_id == subscription_data['id'])
            )
            subscription = result.scalar_one_or_none()
            
            if subscription:
                subscription.status = SubscriptionStatus.CANCELLED
                subscription.cancelled_at = datetime.utcnow()
                
                await db.commit()
                logger.info(f"Deleted subscription: {subscription.id}")
    
    async def check_user_access(
        self,
        db: AsyncSession,
        user_id: str,
        feature: str
    ) -> bool:
        """Check if user has access to a feature"""
        
        from sqlalchemy import select
        
        # Get user's active subscription
        result = await db.execute(
            select(UserSubscription)
            .join(SubscriptionPlan)
            .where(
                UserSubscription.user_id == user_id,
                UserSubscription.status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL])
            )
        )
        
        subscription = result.scalar_one_or_none()
        if not subscription:
            # Check if feature is available in free tier
            return feature in ['basic_signals']
        
        plan = subscription.plan
        
        # Feature access mapping
        feature_mapping = {
            'ai_signals': True,  # All paid plans have basic signals
            'backtesting': plan.backtesting_enabled,
            'real_time_alerts': plan.real_time_alerts,
            'portfolio_management': plan.portfolio_management,
            'api_access': plan.api_access,
            'priority_support': plan.priority_support,
            'custom_strategies': plan.custom_strategies
        }
        
        return feature_mapping.get(feature, False)
    
    async def track_usage(
        self,
        db: AsyncSession,
        user_id: str,
        feature: str,
        count: int = 1,
        metadata: Dict[str, Any] = None
    ):
        """Track feature usage for billing and analytics"""
        
        usage_log = UsageLog(
            user_id=user_id,
            feature=feature,
            usage_count=count,
            usage_data=metadata or {}
        )
        
        db.add(usage_log)
        
        # Update subscription usage counters
        if feature == 'ai_signals':
            from sqlalchemy import select, update
            
            today = datetime.utcnow().date()
            
            result = await db.execute(
                select(UserSubscription)
                .where(
                    UserSubscription.user_id == user_id,
                    UserSubscription.status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL])
                )
            )
            
            subscription = result.scalar_one_or_none()
            if subscription:
                # Reset daily counter if it's a new day
                if not subscription.last_signal_date or subscription.last_signal_date.date() != today:
                    subscription.signals_consumed_today = 0
                
                subscription.signals_consumed_today += count
                subscription.total_signals_consumed += count
                subscription.last_signal_date = datetime.utcnow()
        
        await db.commit()
    
    async def get_user_usage_summary(
        self,
        db: AsyncSession,
        user_id: str,
        date_from: datetime,
        date_to: datetime
    ) -> Dict[str, Any]:
        """Get user usage summary for a date range"""
        
        from sqlalchemy import select, func
        
        result = await db.execute(
            select(
                UsageLog.feature,
                func.sum(UsageLog.usage_count).label('total_count'),
                func.count(UsageLog.id).label('usage_sessions')
            )
            .where(
                UsageLog.user_id == user_id,
                UsageLog.date >= date_from,
                UsageLog.date <= date_to
            )
            .group_by(UsageLog.feature)
        )
        
        usage_data = {}
        for row in result:
            usage_data[row.feature] = {
                'total_count': row.total_count,
                'usage_sessions': row.usage_sessions
            }
        
        return usage_data

# Initialize service
billing_service = SubscriptionBillingService()