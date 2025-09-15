"""
TalkingPhoto AI MVP - Stripe Payment Service
Comprehensive payment processing optimized for Indian market
Supports UPI, cards, wallets, and local payment methods
"""

import stripe
import os
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Union
from dataclasses import dataclass
from enum import Enum
import streamlit as st
import sqlite3
import json
import hashlib
import hmac
import requests
from config import Config

# Configure Stripe
stripe.api_key = Config.STRIPE_SECRET_KEY

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SubscriptionTier(Enum):
    """Subscription tier definitions"""
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class PaymentStatus(Enum):
    """Payment status definitions"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELED = "canceled"
    REFUNDED = "refunded"


@dataclass
class PricingPlan:
    """Pricing plan configuration"""
    tier: SubscriptionTier
    name: str
    price_monthly: float
    price_yearly: float
    credits_monthly: int
    features: List[str]
    stripe_price_id_monthly: str
    stripe_price_id_yearly: str
    currency: str = "usd"


class PaymentService:
    """
    Comprehensive payment service for TalkingPhoto MVP
    Handles subscriptions, one-time payments, and credit purchases
    """
    
    def __init__(self):
        self.db_path = "data/payments.db"
        self.webhook_secret = Config.STRIPE_WEBHOOK_SECRET
        self.init_database()
        self.pricing_plans = self._load_pricing_plans()
    
    def init_database(self):
        """Initialize SQLite database for payment tracking"""
        os.makedirs("data", exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    stripe_customer_id TEXT UNIQUE,
                    subscription_tier TEXT DEFAULT 'free',
                    credits INTEGER DEFAULT 3,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Payments table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS payments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    stripe_payment_intent_id TEXT,
                    stripe_subscription_id TEXT,
                    amount REAL,
                    currency TEXT DEFAULT 'usd',
                    status TEXT,
                    payment_type TEXT, -- 'subscription', 'credits', 'one_time'
                    credits_purchased INTEGER DEFAULT 0,
                    metadata TEXT, -- JSON string
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            # Subscription history table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS subscription_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    stripe_subscription_id TEXT,
                    tier TEXT,
                    status TEXT,
                    current_period_start TIMESTAMP,
                    current_period_end TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
            
            # Credit transactions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS credit_transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    transaction_type TEXT, -- 'purchase', 'usage', 'refund', 'bonus', 'monthly_renewal'
                    credits INTEGER,
                    description TEXT,
                    payment_id INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (payment_id) REFERENCES payments (id)
                )
            """)

            # GST compliant invoices table for Indian market
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS invoices (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    invoice_number TEXT UNIQUE NOT NULL,
                    invoice_data TEXT, -- JSON string with complete invoice details
                    amount REAL NOT NULL,
                    gst_amount REAL NOT NULL,
                    status TEXT DEFAULT 'generated', -- 'generated', 'sent', 'paid'
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)

            # Payment retry tracking table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS payment_retries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    payment_intent_id TEXT NOT NULL,
                    customer_email TEXT NOT NULL,
                    retry_count INTEGER DEFAULT 0,
                    last_retry_at TIMESTAMP,
                    next_retry_at TIMESTAMP,
                    failure_reason TEXT,
                    status TEXT DEFAULT 'pending', -- 'pending', 'retrying', 'exhausted', 'recovered'
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            conn.commit()
    
    def _load_pricing_plans(self) -> Dict[SubscriptionTier, PricingPlan]:
        """Load pricing plans configuration optimized for Indian market"""
        return {
            SubscriptionTier.FREE: PricingPlan(
                tier=SubscriptionTier.FREE,
                name="Free Trial",
                price_monthly=0.0,
                price_yearly=0.0,
                credits_monthly=3,
                features=[
                    "3 free video generations",
                    "720p HD quality",
                    "Basic voice options",
                    "WhatsApp support",
                    "No watermark"
                ],
                stripe_price_id_monthly="",
                stripe_price_id_yearly="",
                currency="inr"
            ),
            SubscriptionTier.STARTER: PricingPlan(
                tier=SubscriptionTier.STARTER,
                name="Basic Plan",
                price_monthly=999.0,
                price_yearly=9999.0,
                credits_monthly=30,
                features=[
                    "30 video generations per month",
                    "1080p Full HD quality",
                    "Premium voice options",
                    "Priority WhatsApp support",
                    "Commercial usage rights",
                    "Download in multiple formats",
                    "Hindi and English voices"
                ],
                stripe_price_id_monthly=os.getenv('STRIPE_BASIC_MONTHLY_PRICE_ID_INR'),
                stripe_price_id_yearly=os.getenv('STRIPE_BASIC_YEARLY_PRICE_ID_INR'),
                currency="inr"
            ),
            SubscriptionTier.PRO: PricingPlan(
                tier=SubscriptionTier.PRO,
                name="Pro Plan",
                price_monthly=2999.0,
                price_yearly=29999.0,
                credits_monthly=100,
                features=[
                    "100 video generations per month",
                    "4K Ultra HD quality",
                    "All voice options + voice cloning",
                    "24/7 priority support",
                    "Commercial usage rights",
                    "Custom branding removal",
                    "Bulk processing",
                    "API access",
                    "Multi-language support"
                ],
                stripe_price_id_monthly=os.getenv('STRIPE_PRO_MONTHLY_PRICE_ID_INR'),
                stripe_price_id_yearly=os.getenv('STRIPE_PRO_YEARLY_PRICE_ID_INR'),
                currency="inr"
            ),
            SubscriptionTier.ENTERPRISE: PricingPlan(
                tier=SubscriptionTier.ENTERPRISE,
                name="Enterprise Plan",
                price_monthly=9999.0,
                price_yearly=99999.0,
                credits_monthly=500,
                features=[
                    "500 video generations per month",
                    "4K Ultra HD + Custom resolutions",
                    "All premium features",
                    "Dedicated account manager",
                    "White-label solution",
                    "Custom voice training",
                    "Advanced API access",
                    "SLA guarantee (99.9% uptime)",
                    "Custom integrations",
                    "Priority feature requests"
                ],
                stripe_price_id_monthly=os.getenv('STRIPE_ENTERPRISE_MONTHLY_PRICE_ID_INR'),
                stripe_price_id_yearly=os.getenv('STRIPE_ENTERPRISE_YEARLY_PRICE_ID_INR'),
                currency="inr"
            )
        }
    
    def create_customer(self, email: str, name: str = None) -> str:
        """Create a new Stripe customer"""
        try:
            customer_data = {"email": email}
            if name:
                customer_data["name"] = name
            
            customer = stripe.Customer.create(**customer_data)
            
            # Store in local database
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO users (email, stripe_customer_id)
                    VALUES (?, ?)
                """, (email, customer.id))
                conn.commit()
            
            logger.info(f"Created customer {customer.id} for {email}")
            return customer.id
        
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create customer: {str(e)}")
            raise
    
    def get_or_create_customer(self, email: str, name: str = None) -> str:
        """Get existing customer or create new one"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT stripe_customer_id FROM users WHERE email = ?", (email,))
            result = cursor.fetchone()
            
            if result and result[0]:
                return result[0]
            else:
                return self.create_customer(email, name)
    
    def create_subscription_checkout(
        self, 
        customer_email: str, 
        tier: SubscriptionTier, 
        billing_cycle: str = "monthly",
        success_url: str = None,
        cancel_url: str = None
    ) -> str:
        """Create Stripe checkout session for subscription"""
        try:
            customer_id = self.get_or_create_customer(customer_email)
            plan = self.pricing_plans[tier]
            
            price_id = (plan.stripe_price_id_monthly if billing_cycle == "monthly" 
                       else plan.stripe_price_id_yearly)
            
            if not price_id:
                raise ValueError(f"Price ID not configured for {tier.value} {billing_cycle}")
            
            # Indian market payment methods
            payment_method_types = [
                'card',
                'upi',  # UPI payments for Indian users
                'netbanking',
                'wallet'  # Paytm, PhonePe, etc.
            ]

            checkout_session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=payment_method_types,
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=success_url or 'https://talkingphoto.in/success?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=cancel_url or 'https://talkingphoto.in/cancel',
                allow_promotion_codes=True,  # Enable discount codes
                billing_address_collection='required',
                tax_id_collection={'enabled': True},  # For GST compliance
                locale='hi',  # Hindi locale for Indian users
                metadata={
                    'tier': tier.value,
                    'billing_cycle': billing_cycle,
                    'customer_email': customer_email,
                    'market': 'IN',
                    'source': 'talkingphoto_mvp'
                }
            )
            
            logger.info(f"Created subscription checkout for {customer_email}: {checkout_session.id}")
            return checkout_session.url
        
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create subscription checkout: {str(e)}")
            raise
    
    def create_credits_checkout(
        self, 
        customer_email: str, 
        credits_amount: int,
        price_per_credit: float = 0.99,
        success_url: str = None,
        cancel_url: str = None
    ) -> str:
        """Create Stripe checkout session for credit purchase"""
        try:
            customer_id = self.get_or_create_customer(customer_email)
            total_amount = int(credits_amount * price_per_credit * 100)  # Convert to cents
            
            # Convert USD pricing to INR (approximate rate: 1 USD = 83 INR)
            total_amount_inr = int(credits_amount * price_per_credit * 83 * 100)  # Convert to paisa

            checkout_session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=['card', 'upi', 'netbanking', 'wallet'],
                line_items=[{
                    'price_data': {
                        'currency': 'inr',
                        'product_data': {
                            'name': f'{credits_amount} TalkingPhoto Credits',
                            'description': f'Purchase {credits_amount} video generation credits for premium AI videos'
                        },
                        'unit_amount': total_amount_inr,
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=success_url or 'https://talkingphoto.in/success?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=cancel_url or 'https://talkingphoto.in/cancel',
                billing_address_collection='required',
                tax_id_collection={'enabled': True},
                locale='hi',
                metadata={
                    'payment_type': 'credits',
                    'credits_amount': str(credits_amount),
                    'customer_email': customer_email,
                    'market': 'IN',
                    'currency': 'inr'
                }
            )
            
            logger.info(f"Created credits checkout for {customer_email}: {checkout_session.id}")
            return checkout_session.url
        
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create credits checkout: {str(e)}")
            raise
    
    def handle_successful_payment(self, session_id: str):
        """Handle successful payment completion"""
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            customer_email = session.metadata.get('customer_email')
            
            if session.mode == 'subscription':
                self._handle_subscription_success(session, customer_email)
            elif session.metadata.get('payment_type') == 'credits':
                self._handle_credits_success(session, customer_email)
            
            logger.info(f"Successfully processed payment for session {session_id}")
        
        except stripe.error.StripeError as e:
            logger.error(f"Failed to handle successful payment: {str(e)}")
            raise
    
    def _handle_subscription_success(self, session, customer_email: str):
        """Handle successful subscription payment"""
        subscription = stripe.Subscription.retrieve(session.subscription)
        tier = SubscriptionTier(session.metadata.get('tier'))
        plan = self.pricing_plans[tier]
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Update user subscription
            cursor.execute("""
                UPDATE users 
                SET subscription_tier = ?, credits = credits + ?, updated_at = CURRENT_TIMESTAMP
                WHERE email = ?
            """, (tier.value, plan.credits_monthly, customer_email))
            
            # Get user ID
            cursor.execute("SELECT id FROM users WHERE email = ?", (customer_email,))
            user_id = cursor.fetchone()[0]
            
            # Record payment
            cursor.execute("""
                INSERT INTO payments (
                    user_id, stripe_subscription_id, amount, currency, status, 
                    payment_type, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, subscription.id, session.amount_total / 100, session.currency,
                PaymentStatus.COMPLETED.value, 'subscription', json.dumps(session.metadata)
            ))
            
            # Record subscription history
            cursor.execute("""
                INSERT INTO subscription_history (
                    user_id, stripe_subscription_id, tier, status,
                    current_period_start, current_period_end
                ) VALUES (?, ?, ?, ?, ?, ?)
            """, (
                user_id, subscription.id, tier.value, subscription.status,
                datetime.fromtimestamp(subscription.current_period_start),
                datetime.fromtimestamp(subscription.current_period_end)
            ))
            
            # Record credit transaction
            cursor.execute("""
                INSERT INTO credit_transactions (
                    user_id, transaction_type, credits, description
                ) VALUES (?, ?, ?, ?)
            """, (
                user_id, 'purchase', plan.credits_monthly,
                f"Monthly credits for {plan.name} subscription"
            ))
            
            conn.commit()
    
    def _handle_credits_success(self, session, customer_email: str):
        """Handle successful credit purchase"""
        credits_amount = int(session.metadata.get('credits_amount'))
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Update user credits
            cursor.execute("""
                UPDATE users 
                SET credits = credits + ?, updated_at = CURRENT_TIMESTAMP
                WHERE email = ?
            """, (credits_amount, customer_email))
            
            # Get user ID
            cursor.execute("SELECT id FROM users WHERE email = ?", (customer_email,))
            user_id = cursor.fetchone()[0]
            
            # Record payment
            cursor.execute("""
                INSERT INTO payments (
                    user_id, stripe_payment_intent_id, amount, currency, status, 
                    payment_type, credits_purchased, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, session.payment_intent, session.amount_total / 100, session.currency,
                PaymentStatus.COMPLETED.value, 'credits', credits_amount, json.dumps(session.metadata)
            ))
            
            payment_id = cursor.lastrowid
            
            # Record credit transaction
            cursor.execute("""
                INSERT INTO credit_transactions (
                    user_id, transaction_type, credits, description, payment_id
                ) VALUES (?, ?, ?, ?, ?)
            """, (
                user_id, 'purchase', credits_amount,
                f"Purchased {credits_amount} credits", payment_id
            ))
            
            conn.commit()
    
    def use_credit(self, customer_email: str, description: str = "Video generation") -> bool:
        """Use one credit for video generation"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Check current credits
            cursor.execute("SELECT id, credits FROM users WHERE email = ?", (customer_email,))
            result = cursor.fetchone()
            
            if not result or result[1] <= 0:
                return False
            
            user_id, current_credits = result
            
            # Deduct credit
            cursor.execute("""
                UPDATE users 
                SET credits = credits - 1, updated_at = CURRENT_TIMESTAMP
                WHERE email = ?
            """, (customer_email,))
            
            # Record transaction
            cursor.execute("""
                INSERT INTO credit_transactions (
                    user_id, transaction_type, credits, description
                ) VALUES (?, ?, ?, ?)
            """, (user_id, 'usage', -1, description))
            
            conn.commit()
            return True
    
    def get_user_info(self, customer_email: str) -> Optional[Dict]:
        """Get user subscription and credit information"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT subscription_tier, credits, created_at
                FROM users WHERE email = ?
            """, (customer_email,))
            result = cursor.fetchone()
            
            if result:
                return {
                    'subscription_tier': result[0],
                    'credits': result[1],
                    'created_at': result[2]
                }
            return None
    
    def get_payment_history(self, customer_email: str) -> List[Dict]:
        """Get user payment history"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT p.amount, p.currency, p.status, p.payment_type, 
                       p.credits_purchased, p.created_at
                FROM payments p
                JOIN users u ON p.user_id = u.id
                WHERE u.email = ?
                ORDER BY p.created_at DESC
            """, (customer_email,))
            
            payments = []
            for row in cursor.fetchall():
                payments.append({
                    'amount': row[0],
                    'currency': row[1],
                    'status': row[2],
                    'payment_type': row[3],
                    'credits_purchased': row[4],
                    'created_at': row[5]
                })
            
            return payments
    
    def add_monthly_credits(self, customer_email: str, credits: int) -> bool:
        """Add monthly credits to user account"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Update user credits
                cursor.execute("""
                    UPDATE users
                    SET credits = credits + ?, updated_at = CURRENT_TIMESTAMP
                    WHERE email = ?
                """, (credits, customer_email))

                # Get user ID
                cursor.execute("SELECT id FROM users WHERE email = ?", (customer_email,))
                result = cursor.fetchone()

                if result:
                    user_id = result[0]

                    # Record credit transaction
                    cursor.execute("""
                        INSERT INTO credit_transactions (
                            user_id, transaction_type, credits, description
                        ) VALUES (?, ?, ?, ?)
                    """, (
                        user_id, 'monthly_renewal', credits,
                        f"Monthly credit renewal: {credits} credits"
                    ))

                conn.commit()
                logger.info(f"Added {credits} monthly credits for {customer_email}")
                return True

        except Exception as e:
            logger.error(f"Failed to add monthly credits: {str(e)}")
            return False

    def update_user_subscription(self, customer_email: str, tier: str, subscription_id: str = None) -> bool:
        """Update user subscription tier"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                cursor.execute("""
                    UPDATE users
                    SET subscription_tier = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE email = ?
                """, (tier, customer_email))

                if subscription_id:
                    # Get user ID and record subscription history
                    cursor.execute("SELECT id FROM users WHERE email = ?", (customer_email,))
                    result = cursor.fetchone()

                    if result:
                        user_id = result[0]
                        cursor.execute("""
                            INSERT INTO subscription_history (
                                user_id, stripe_subscription_id, tier, status,
                                current_period_start, current_period_end
                            ) VALUES (?, ?, ?, ?, ?, ?)
                        """, (
                            user_id, subscription_id, tier, 'active',
                            datetime.now(), datetime.now() + timedelta(days=30)
                        ))

                conn.commit()
                logger.info(f"Updated subscription for {customer_email} to {tier}")
                return True

        except Exception as e:
            logger.error(f"Failed to update user subscription: {str(e)}")
            return False

    def cancel_subscription(self, customer_email: str) -> bool:
        """Cancel user subscription"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT stripe_customer_id FROM users WHERE email = ?
                """, (customer_email,))
                result = cursor.fetchone()

                if not result:
                    return False

                customer_id = result[0]

                # Get active subscriptions
                subscriptions = stripe.Subscription.list(customer=customer_id, status='active')

                for subscription in subscriptions:
                    stripe.Subscription.delete(subscription.id)

                # Update user tier to free
                cursor.execute("""
                    UPDATE users
                    SET subscription_tier = 'free', updated_at = CURRENT_TIMESTAMP
                    WHERE email = ?
                """, (customer_email,))
                conn.commit()

                logger.info(f"Canceled subscription for {customer_email}")
                return True

        except stripe.error.StripeError as e:
            logger.error(f"Failed to cancel subscription: {str(e)}")
            return False

    def generate_gst_invoice(self, customer_email: str, payment_data: Dict) -> Dict:
        """Generate GST compliant invoice for Indian customers"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT id, subscription_tier FROM users WHERE email = ?",
                    (customer_email,)
                )
                user_result = cursor.fetchone()

                if not user_result:
                    raise ValueError("User not found")

                user_id, tier = user_result
                plan = self.pricing_plans.get(SubscriptionTier(tier))

                # Generate invoice data with GST calculation
                invoice_data = {
                    'invoice_number': f"TP-{datetime.now().strftime('%Y%m%d')}-{user_id:06d}",
                    'invoice_date': datetime.now().isoformat(),
                    'customer_email': customer_email,
                    'customer_gstin': payment_data.get('customer_gstin', ''),
                    'billing_address': payment_data.get('billing_address', {}),
                    'items': [
                        {
                            'description': f"{plan.name} Subscription",
                            'quantity': 1,
                            'rate': plan.price_monthly,
                            'amount': plan.price_monthly,
                            'hsn_code': '998313',  # Software services HSN code
                            'gst_rate': 18.0,
                            'cgst': plan.price_monthly * 0.09,  # 9% CGST
                            'sgst': plan.price_monthly * 0.09,  # 9% SGST
                            'igst': 0.0  # No IGST for intra-state
                        }
                    ],
                    'subtotal': plan.price_monthly,
                    'total_gst': plan.price_monthly * 0.18,
                    'grand_total': plan.price_monthly * 1.18,
                    'currency': 'INR',
                    'company_details': {
                        'name': 'TalkingPhoto Technologies Pvt Ltd',
                        'gstin': '29AABCT1332L000',  # Replace with actual GSTIN
                        'address': 'Bangalore, Karnataka, India',
                        'pan': 'AABCT1332L'  # Replace with actual PAN
                    }
                }

                # Store invoice in database
                cursor.execute("""
                    INSERT INTO invoices (
                        user_id, invoice_number, invoice_data, amount, gst_amount, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    user_id, invoice_data['invoice_number'],
                    json.dumps(invoice_data), plan.price_monthly,
                    plan.price_monthly * 0.18, datetime.now()
                ))

                conn.commit()

                logger.info(f"Generated GST invoice {invoice_data['invoice_number']} for {customer_email}")
                return invoice_data

        except Exception as e:
            logger.error(f"Failed to generate GST invoice: {str(e)}")
            return None


# Global payment service instance
payment_service = PaymentService()