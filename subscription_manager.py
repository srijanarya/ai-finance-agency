#!/usr/bin/env python3
"""
AI Finance Agency Subscription Management System
===============================================
Comprehensive subscription billing system with Stripe/Razorpay integration
Supports multi-tier pricing and regulatory compliance

Author: TREUM ALGOTECH
Created: September 10, 2025
"""

import sqlite3
import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any, Tuple
from enum import Enum
from dataclasses import dataclass, asdict
from decimal import Decimal
import uuid
from contextlib import contextmanager

from database_helper import get_db_connection, get_redis_client, cache_set, cache_get

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SubscriptionTier(Enum):
    """Subscription tier definitions"""
    BASIC = "basic"
    PROFESSIONAL = "professional" 
    ENTERPRISE = "enterprise"
    CUSTOM = "custom"

class SubscriptionStatus(Enum):
    """Subscription status definitions"""
    TRIAL = "trial"
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    SUSPENDED = "suspended"
    PAUSED = "paused"

class BillingCycle(Enum):
    """Billing cycle options"""
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

class PaymentStatus(Enum):
    """Payment status definitions"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    DISPUTED = "disputed"

@dataclass
class SubscriptionPlan:
    """Subscription plan definition"""
    id: str
    name: str
    tier: SubscriptionTier
    price_monthly: Decimal
    price_yearly: Decimal
    currency: str
    features: List[str]
    limits: Dict[str, Any]
    description: str
    is_active: bool = True
    
    def get_price(self, cycle: BillingCycle) -> Decimal:
        """Get price for billing cycle"""
        if cycle == BillingCycle.MONTHLY:
            return self.price_monthly
        elif cycle == BillingCycle.YEARLY:
            return self.price_yearly
        elif cycle == BillingCycle.QUARTERLY:
            return self.price_monthly * 3 * Decimal('0.95')  # 5% discount
        return self.price_monthly

@dataclass
class Subscription:
    """Subscription data model"""
    id: str
    user_id: str
    plan_id: str
    status: SubscriptionStatus
    billing_cycle: BillingCycle
    current_period_start: datetime
    current_period_end: datetime
    trial_end: Optional[datetime]
    stripe_subscription_id: Optional[str]
    razorpay_subscription_id: Optional[str]
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    canceled_at: Optional[datetime] = None
    
    @property
    def is_trial(self) -> bool:
        """Check if subscription is in trial"""
        return (
            self.status == SubscriptionStatus.TRIAL and
            self.trial_end and
            datetime.now(timezone.utc) < self.trial_end
        )
    
    @property
    def is_active(self) -> bool:
        """Check if subscription is active"""
        return self.status in [SubscriptionStatus.TRIAL, SubscriptionStatus.ACTIVE]
    
    @property
    def days_until_renewal(self) -> int:
        """Days until next billing cycle"""
        now = datetime.now(timezone.utc)
        if self.current_period_end > now:
            return (self.current_period_end - now).days
        return 0

class SubscriptionManager:
    """Core subscription management class"""
    
    def __init__(self):
        self.redis_client = get_redis_client()
        self.init_database()
        self.init_plans()
        logger.info("Subscription Manager initialized")
    
    def init_database(self):
        """Initialize subscription database schema"""
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            # Subscription plans table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS subscription_plans (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    tier TEXT NOT NULL,
                    price_monthly DECIMAL(10,2) NOT NULL,
                    price_yearly DECIMAL(10,2) NOT NULL,
                    currency TEXT DEFAULT 'USD',
                    features TEXT NOT NULL,  -- JSON array
                    limits TEXT NOT NULL,    -- JSON object
                    description TEXT,
                    is_active BOOLEAN DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Subscriptions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS subscriptions (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    plan_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    billing_cycle TEXT NOT NULL,
                    current_period_start TIMESTAMP NOT NULL,
                    current_period_end TIMESTAMP NOT NULL,
                    trial_end TIMESTAMP,
                    stripe_subscription_id TEXT,
                    razorpay_subscription_id TEXT,
                    metadata TEXT DEFAULT '{}',  -- JSON object
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    canceled_at TIMESTAMP,
                    FOREIGN KEY (plan_id) REFERENCES subscription_plans (id)
                )
            ''')
            
            # Payment history table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS payment_history (
                    id TEXT PRIMARY KEY,
                    subscription_id TEXT NOT NULL,
                    amount DECIMAL(10,2) NOT NULL,
                    currency TEXT NOT NULL,
                    status TEXT NOT NULL,
                    payment_method TEXT NOT NULL,  -- stripe, razorpay
                    external_payment_id TEXT,
                    invoice_number TEXT,
                    tax_amount DECIMAL(10,2) DEFAULT 0,
                    fees DECIMAL(10,2) DEFAULT 0,
                    net_amount DECIMAL(10,2),
                    billing_address TEXT,  -- JSON object
                    metadata TEXT DEFAULT '{}',
                    processed_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (subscription_id) REFERENCES subscriptions (id)
                )
            ''')
            
            # Subscription usage table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS subscription_usage (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    subscription_id TEXT NOT NULL,
                    resource_type TEXT NOT NULL,  -- api_calls, telegram_signals, etc.
                    usage_count INTEGER NOT NULL DEFAULT 0,
                    period_start TIMESTAMP NOT NULL,
                    period_end TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (subscription_id) REFERENCES subscriptions (id)
                )
            ''')
            
            # Revenue analytics table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS revenue_analytics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date DATE NOT NULL,
                    mrr DECIMAL(15,2) DEFAULT 0,     -- Monthly Recurring Revenue
                    arr DECIMAL(15,2) DEFAULT 0,     -- Annual Recurring Revenue
                    new_subscriptions INTEGER DEFAULT 0,
                    churned_subscriptions INTEGER DEFAULT 0,
                    revenue_by_tier TEXT DEFAULT '{}',  -- JSON
                    currency TEXT DEFAULT 'USD',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(date)
                )
            ''')
            
            # Compliance tracking
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS compliance_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    subscription_id TEXT,
                    user_id TEXT,
                    action TEXT NOT NULL,
                    details TEXT,  -- JSON
                    ip_address TEXT,
                    user_agent TEXT,
                    jurisdiction TEXT,
                    compliance_status TEXT DEFAULT 'compliant',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (subscription_id) REFERENCES subscriptions (id)
                )
            ''')
            
            # Create indexes for performance
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions (user_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_payment_history_subscription ON payment_history (subscription_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_usage_subscription ON subscription_usage (subscription_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_compliance_user ON compliance_logs (user_id)')
            
            conn.commit()
            logger.info("Subscription database schema initialized")
    
    def init_plans(self):
        """Initialize default subscription plans"""
        default_plans = [
            SubscriptionPlan(
                id="basic",
                name="Basic Plan",
                tier=SubscriptionTier.BASIC,
                price_monthly=Decimal('99.00'),
                price_yearly=Decimal('990.00'),  # 2 months free
                currency="USD",
                features=[
                    "Premium Telegram Signals",
                    "Daily Market Updates",
                    "Basic Technical Analysis",
                    "Email Support",
                    "7-day Free Trial"
                ],
                limits={
                    "api_calls_per_month": 1000,
                    "signals_per_day": 5,
                    "custom_alerts": 10,
                    "historical_data_months": 6
                },
                description="Perfect for individual traders getting started with AI-powered financial insights"
            ),
            SubscriptionPlan(
                id="professional",
                name="Professional Plan", 
                tier=SubscriptionTier.PROFESSIONAL,
                price_monthly=Decimal('500.00'),
                price_yearly=Decimal('5000.00'),  # 2 months free
                currency="USD",
                features=[
                    "All Basic Features",
                    "Full Dashboard Access",
                    "REST API Access",
                    "Advanced Analytics",
                    "Real-time Data",
                    "Priority Support",
                    "Custom Indicators",
                    "Portfolio Management"
                ],
                limits={
                    "api_calls_per_month": 10000,
                    "signals_per_day": 20,
                    "custom_alerts": 100,
                    "historical_data_months": 24,
                    "concurrent_connections": 5
                },
                description="Advanced tools for professional traders and investment advisors"
            ),
            SubscriptionPlan(
                id="enterprise",
                name="Enterprise Plan",
                tier=SubscriptionTier.ENTERPRISE,
                price_monthly=Decimal('2000.00'),
                price_yearly=Decimal('20000.00'),  # 2 months free
                currency="USD",
                features=[
                    "All Professional Features",
                    "White-label Solution",
                    "Custom Integrations",
                    "Dedicated Support Manager",
                    "SLA Guarantees",
                    "On-premise Deployment",
                    "Custom Algorithms",
                    "Institutional Data Feeds",
                    "Compliance Reporting"
                ],
                limits={
                    "api_calls_per_month": -1,  # Unlimited
                    "signals_per_day": -1,     # Unlimited
                    "custom_alerts": -1,       # Unlimited
                    "historical_data_months": -1,  # Unlimited
                    "concurrent_connections": 50
                },
                description="Complete solution for financial institutions and large trading firms"
            )
        ]
        
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            for plan in default_plans:
                cursor.execute('''
                    INSERT OR REPLACE INTO subscription_plans
                    (id, name, tier, price_monthly, price_yearly, currency, features, limits, description, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    plan.id,
                    plan.name,
                    plan.tier.value,
                    str(plan.price_monthly),
                    str(plan.price_yearly), 
                    plan.currency,
                    json.dumps(plan.features),
                    json.dumps(plan.limits),
                    plan.description,
                    plan.is_active
                ))
            
            conn.commit()
            logger.info(f"Initialized {len(default_plans)} default subscription plans")
    
    def get_plans(self, active_only: bool = True) -> List[SubscriptionPlan]:
        """Get all subscription plans"""
        cache_key = f"plans:{'active' if active_only else 'all'}"
        cached_plans = cache_get(cache_key)
        
        if cached_plans:
            plans = []
            for plan_data in cached_plans:
                # Convert back to proper types
                plan_data['tier'] = SubscriptionTier(plan_data['tier'])
                plan_data['price_monthly'] = Decimal(str(plan_data['price_monthly']))
                plan_data['price_yearly'] = Decimal(str(plan_data['price_yearly']))
                plans.append(SubscriptionPlan(**plan_data))
            return plans
        
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            query = "SELECT * FROM subscription_plans"
            if active_only:
                query += " WHERE is_active = 1"
            query += " ORDER BY price_monthly ASC"
            
            cursor.execute(query)
            rows = cursor.fetchall()
            
            plans = []
            for row in rows:
                plan = SubscriptionPlan(
                    id=row['id'],
                    name=row['name'],
                    tier=SubscriptionTier(row['tier']),
                    price_monthly=Decimal(str(row['price_monthly'])),
                    price_yearly=Decimal(str(row['price_yearly'])),
                    currency=row['currency'],
                    features=json.loads(row['features']),
                    limits=json.loads(row['limits']),
                    description=row['description'],
                    is_active=bool(row['is_active'])
                )
                plans.append(plan)
            
            # Cache for 1 hour - serialize enums and decimals properly
            serializable_plans = []
            for plan in plans:
                plan_dict = asdict(plan)
                plan_dict['tier'] = plan.tier.value  # Convert enum to string
                plan_dict['price_monthly'] = float(plan.price_monthly)  # Convert Decimal to float
                plan_dict['price_yearly'] = float(plan.price_yearly)  # Convert Decimal to float
                serializable_plans.append(plan_dict)
            cache_set(cache_key, serializable_plans, expire=3600)
            return plans
    
    def get_plan(self, plan_id: str) -> Optional[SubscriptionPlan]:
        """Get specific subscription plan"""
        plans = self.get_plans(active_only=False)
        return next((plan for plan in plans if plan.id == plan_id), None)
    
    def create_subscription(
        self,
        user_id: str,
        plan_id: str,
        billing_cycle: BillingCycle,
        payment_method: str = "stripe",
        trial_days: int = 7,
        metadata: Optional[Dict] = None
    ) -> Subscription:
        """Create new subscription with trial period"""
        
        plan = self.get_plan(plan_id)
        if not plan:
            raise ValueError(f"Plan {plan_id} not found")
        
        # Generate subscription ID
        subscription_id = f"sub_{uuid.uuid4().hex[:16]}"
        
        # Set trial and billing periods
        now = datetime.now(timezone.utc)
        trial_end = now + timedelta(days=trial_days)
        
        if billing_cycle == BillingCycle.MONTHLY:
            period_end = trial_end + timedelta(days=30)
        elif billing_cycle == BillingCycle.QUARTERLY:
            period_end = trial_end + timedelta(days=90)
        else:  # YEARLY
            period_end = trial_end + timedelta(days=365)
        
        subscription = Subscription(
            id=subscription_id,
            user_id=user_id,
            plan_id=plan_id,
            status=SubscriptionStatus.TRIAL,
            billing_cycle=billing_cycle,
            current_period_start=now,
            current_period_end=period_end,
            trial_end=trial_end,
            stripe_subscription_id=None,
            razorpay_subscription_id=None,
            metadata=metadata or {},
            created_at=now,
            updated_at=now
        )
        
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO subscriptions (
                    id, user_id, plan_id, status, billing_cycle,
                    current_period_start, current_period_end, trial_end,
                    metadata, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                subscription.id,
                subscription.user_id,
                subscription.plan_id,
                subscription.status.value,
                subscription.billing_cycle.value,
                subscription.current_period_start.isoformat(),
                subscription.current_period_end.isoformat(),
                subscription.trial_end.isoformat() if subscription.trial_end else None,
                json.dumps(subscription.metadata),
                subscription.created_at.isoformat(),
                subscription.updated_at.isoformat()
            ))
            
            conn.commit()
        
        # Log compliance event
        self.log_compliance_event(
            subscription_id=subscription.id,
            user_id=user_id,
            action="subscription_created",
            details={"plan_id": plan_id, "billing_cycle": billing_cycle.value}
        )
        
        # Clear user cache
        self.redis_client.delete(f"user_subscription:{user_id}")
        
        logger.info(f"Created subscription {subscription_id} for user {user_id}")
        return subscription
    
    def get_user_subscription(self, user_id: str) -> Optional[Subscription]:
        """Get user's active subscription"""
        cache_key = f"user_subscription:{user_id}"
        cached_sub = cache_get(cache_key)
        
        if cached_sub:
            return self._deserialize_subscription(cached_sub)
        
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM subscriptions 
                WHERE user_id = ? AND status IN ('trial', 'active', 'past_due')
                ORDER BY created_at DESC
                LIMIT 1
            ''', (user_id,))
            
            row = cursor.fetchone()
            if not row:
                return None
            
            subscription = self._deserialize_subscription(dict(row))
            
            # Cache for 30 minutes
            cache_set(cache_key, asdict(subscription), expire=1800)
            return subscription
    
    def _deserialize_subscription(self, data: Dict) -> Subscription:
        """Convert database row to Subscription object"""
        return Subscription(
            id=data['id'],
            user_id=data['user_id'],
            plan_id=data['plan_id'],
            status=SubscriptionStatus(data['status']),
            billing_cycle=BillingCycle(data['billing_cycle']),
            current_period_start=datetime.fromisoformat(data['current_period_start']),
            current_period_end=datetime.fromisoformat(data['current_period_end']),
            trial_end=datetime.fromisoformat(data['trial_end']) if data.get('trial_end') else None,
            stripe_subscription_id=data.get('stripe_subscription_id'),
            razorpay_subscription_id=data.get('razorpay_subscription_id'),
            metadata=json.loads(data.get('metadata', '{}')),
            created_at=datetime.fromisoformat(data['created_at']),
            updated_at=datetime.fromisoformat(data['updated_at']),
            canceled_at=datetime.fromisoformat(data['canceled_at']) if data.get('canceled_at') else None
        )
    
    def check_access(self, user_id: str, resource: str) -> Tuple[bool, Dict[str, Any]]:
        """Check if user has access to resource"""
        subscription = self.get_user_subscription(user_id)
        
        if not subscription:
            return False, {"error": "No active subscription"}
        
        if not subscription.is_active:
            return False, {"error": "Subscription inactive"}
        
        plan = self.get_plan(subscription.plan_id)
        if not plan:
            return False, {"error": "Invalid plan"}
        
        # Check usage limits
        usage = self.get_current_usage(subscription.id)
        limits = plan.limits
        
        # Check specific resource limits
        if resource in limits:
            limit = limits[resource]
            if limit != -1 and usage.get(resource, 0) >= limit:
                return False, {"error": f"Limit exceeded for {resource}"}
        
        return True, {"subscription": asdict(subscription), "plan": asdict(plan)}
    
    def get_current_usage(self, subscription_id: str) -> Dict[str, int]:
        """Get current period usage for subscription"""
        cache_key = f"usage:{subscription_id}"
        cached_usage = cache_get(cache_key)
        
        if cached_usage:
            return cached_usage
        
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            # Get current billing period
            now = datetime.now(timezone.utc)
            first_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            cursor.execute('''
                SELECT resource_type, SUM(usage_count) as total_usage
                FROM subscription_usage
                WHERE subscription_id = ? AND period_start >= ?
                GROUP BY resource_type
            ''', (subscription_id, first_of_month.isoformat()))
            
            usage = {}
            for row in cursor.fetchall():
                usage[row['resource_type']] = row['total_usage']
            
            # Cache for 5 minutes
            cache_set(cache_key, usage, expire=300)
            return usage
    
    def record_usage(self, subscription_id: str, resource_type: str, count: int = 1):
        """Record usage for a subscription"""
        now = datetime.now(timezone.utc)
        period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        if now.month == 12:
            period_end = period_start.replace(year=period_start.year + 1, month=1)
        else:
            period_end = period_start.replace(month=period_start.month + 1)
        
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            # Upsert usage record
            cursor.execute('''
                INSERT OR IGNORE INTO subscription_usage
                (subscription_id, resource_type, usage_count, period_start, period_end)
                VALUES (?, ?, 0, ?, ?)
            ''', (subscription_id, resource_type, period_start.isoformat(), period_end.isoformat()))
            
            cursor.execute('''
                UPDATE subscription_usage
                SET usage_count = usage_count + ?, updated_at = CURRENT_TIMESTAMP
                WHERE subscription_id = ? AND resource_type = ? AND period_start = ?
            ''', (count, subscription_id, resource_type, period_start.isoformat()))
            
            conn.commit()
        
        # Clear cache
        self.redis_client.delete(f"usage:{subscription_id}")
    
    def log_compliance_event(
        self,
        action: str,
        user_id: Optional[str] = None,
        subscription_id: Optional[str] = None,
        details: Optional[Dict] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        jurisdiction: str = "US"
    ):
        """Log compliance events for audit trail"""
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO compliance_logs
                (subscription_id, user_id, action, details, ip_address, user_agent, jurisdiction)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                subscription_id,
                user_id,
                action,
                json.dumps(details or {}),
                ip_address,
                user_agent,
                jurisdiction
            ))
            
            conn.commit()
    
    def get_revenue_analytics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get revenue analytics for date range"""
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            # Get revenue by date
            cursor.execute('''
                SELECT date, mrr, arr, new_subscriptions, churned_subscriptions, revenue_by_tier
                FROM revenue_analytics
                WHERE date BETWEEN ? AND ?
                ORDER BY date ASC
            ''', (start_date.date().isoformat(), end_date.date().isoformat()))
            
            analytics = []
            for row in cursor.fetchall():
                analytics.append({
                    'date': row['date'],
                    'mrr': float(row['mrr']),
                    'arr': float(row['arr']),
                    'new_subscriptions': row['new_subscriptions'],
                    'churned_subscriptions': row['churned_subscriptions'],
                    'revenue_by_tier': json.loads(row['revenue_by_tier'])
                })
            
            # Calculate totals
            total_mrr = sum(a['mrr'] for a in analytics)
            total_arr = sum(a['arr'] for a in analytics)
            total_new = sum(a['new_subscriptions'] for a in analytics)
            total_churned = sum(a['churned_subscriptions'] for a in analytics)
            
            return {
                'analytics': analytics,
                'totals': {
                    'mrr': total_mrr,
                    'arr': total_arr, 
                    'new_subscriptions': total_new,
                    'churned_subscriptions': total_churned,
                    'net_growth': total_new - total_churned
                }
            }
    
    def update_daily_revenue_analytics(self):
        """Update daily revenue analytics - run via cron"""
        today = datetime.now(timezone.utc).date()
        
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            # Calculate MRR/ARR
            cursor.execute('''
                SELECT 
                    sp.tier,
                    COUNT(s.id) as active_subs,
                    SUM(CASE 
                        WHEN s.billing_cycle = 'monthly' THEN sp.price_monthly
                        WHEN s.billing_cycle = 'yearly' THEN sp.price_yearly / 12
                        WHEN s.billing_cycle = 'quarterly' THEN sp.price_monthly * 3 / 3
                    END) as mrr
                FROM subscriptions s
                JOIN subscription_plans sp ON s.plan_id = sp.id
                WHERE s.status IN ('trial', 'active')
                GROUP BY sp.tier
            ''')
            
            revenue_by_tier = {}
            total_mrr = Decimal('0')
            
            for row in cursor.fetchall():
                tier = row['tier']
                mrr = Decimal(str(row['mrr'] or 0))
                revenue_by_tier[tier] = {
                    'active_subscriptions': row['active_subs'],
                    'mrr': float(mrr)
                }
                total_mrr += mrr
            
            total_arr = total_mrr * 12
            
            # Count new subscriptions today
            cursor.execute('''
                SELECT COUNT(*) as new_subs
                FROM subscriptions
                WHERE DATE(created_at) = ?
            ''', (today.isoformat(),))
            new_subs = cursor.fetchone()['new_subs']
            
            # Count churned subscriptions today
            cursor.execute('''
                SELECT COUNT(*) as churned
                FROM subscriptions
                WHERE DATE(canceled_at) = ?
            ''', (today.isoformat(),))
            churned = cursor.fetchone()['churned']
            
            # Insert/update analytics
            cursor.execute('''
                INSERT OR REPLACE INTO revenue_analytics
                (date, mrr, arr, new_subscriptions, churned_subscriptions, revenue_by_tier)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                today.isoformat(),
                str(total_mrr),
                str(total_arr),
                new_subs,
                churned,
                json.dumps(revenue_by_tier)
            ))
            
            conn.commit()
            
        logger.info(f"Updated revenue analytics for {today}: MRR=${total_mrr}, ARR=${total_arr}")

# Global instance
subscription_manager = SubscriptionManager()
