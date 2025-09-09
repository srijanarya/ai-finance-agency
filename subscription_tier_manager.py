#!/usr/bin/env python3
"""
Subscription Tier Management System
Advanced subscription management with tiered access, billing, and analytics
Target: $500K-2M ARR through premium subscriptions
"""

import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import hashlib
import secrets
import stripe  # For payment processing
from typing import Dict, List, Optional, Tuple
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SubscriptionTierManager:
    def __init__(self):
        self.db_path = 'subscription_management.db'
        self.initialize_database()
        
        # Subscription tiers configuration
        self.subscription_tiers = {
            'BASIC': {
                'name': 'Basic Trader',
                'price_monthly': 49,
                'price_yearly': 490,  # 2 months free
                'features': [
                    'Basic intraday signals (5-10 per day)',
                    'Swing trading signals',
                    'Email & Telegram alerts',
                    'Basic performance reports',
                    'Indian equity signals',
                    'Community access'
                ],
                'signal_limits': {
                    'daily_signals': 10,
                    'asset_classes': ['INDIAN_EQUITY'],
                    'signal_types': ['INTRADAY', 'SWING']
                },
                'channels': ['email', 'telegram'],
                'api_access': False,
                'priority_support': False,
                'target_subscribers': 1000,
                'projected_arr': 490000  # 1000 * $490
            },
            'PRO': {
                'name': 'Professional Trader',
                'price_monthly': 199,
                'price_yearly': 1990,  # 2 months free
                'features': [
                    'All Basic features',
                    'Premium signals (15-20 per day)',
                    'Investment signals (long-term)',
                    'WhatsApp & Push notifications',
                    'Advanced analytics & reports',
                    'Global markets (US, Crypto)',
                    'Sector rotation alerts',
                    'Risk management tools',
                    'Portfolio tracker',
                    'Priority email support'
                ],
                'signal_limits': {
                    'daily_signals': 20,
                    'asset_classes': ['INDIAN_EQUITY', 'US_EQUITY', 'CRYPTO'],
                    'signal_types': ['INTRADAY', 'SWING', 'INVESTMENT']
                },
                'channels': ['email', 'telegram', 'whatsapp', 'push'],
                'api_access': True,
                'priority_support': True,
                'target_subscribers': 500,
                'projected_arr': 995000  # 500 * $1990
            },
            'ENTERPRISE': {
                'name': 'Enterprise & Institutional',
                'price_monthly': 999,
                'price_yearly': 9999,  # 2 months free
                'features': [
                    'All Pro features',
                    'Unlimited signals',
                    'Scalping signals',
                    'Custom signal filters',
                    'Real-time API access',
                    'Dedicated account manager',
                    'Custom reports & analytics',
                    'White-label solutions',
                    'Phone & video support',
                    'Custom integrations',
                    'Institutional-grade SLA'
                ],
                'signal_limits': {
                    'daily_signals': 999999,  # Unlimited
                    'asset_classes': ['INDIAN_EQUITY', 'US_EQUITY', 'CRYPTO', 'FOREX'],
                    'signal_types': ['INTRADAY', 'SWING', 'INVESTMENT', 'SCALPING']
                },
                'channels': ['email', 'telegram', 'whatsapp', 'push', 'api', 'custom'],
                'api_access': True,
                'priority_support': True,
                'target_subscribers': 50,
                'projected_arr': 499950  # 50 * $9999
            }
        }
        
        # Initialize Stripe (set your keys)
        # stripe.api_key = "sk_test_your_stripe_secret_key"
        
        # Total projected ARR: $1,984,950 (~$2M)
        self.total_projected_arr = sum(tier['projected_arr'] for tier in self.subscription_tiers.values())
    
    def initialize_database(self):
        """Initialize subscription management database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Subscriptions table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE NOT NULL,
            email TEXT NOT NULL,
            name TEXT,
            phone TEXT,
            subscription_tier TEXT NOT NULL,
            billing_cycle TEXT DEFAULT 'monthly',
            status TEXT DEFAULT 'ACTIVE',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            start_date DATETIME,
            end_date DATETIME,
            next_billing_date DATETIME,
            trial_end_date DATETIME,
            payment_method_id TEXT,
            stripe_customer_id TEXT,
            stripe_subscription_id TEXT,
            total_paid REAL DEFAULT 0,
            discount_percentage REAL DEFAULT 0,
            referral_code TEXT,
            referred_by TEXT,
            cancellation_date DATETIME,
            cancellation_reason TEXT,
            auto_renew BOOLEAN DEFAULT 1,
            preferences TEXT,
            notes TEXT
        )
        ''')
        
        # Payment history table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS payment_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            stripe_payment_id TEXT,
            amount REAL NOT NULL,
            currency TEXT DEFAULT 'USD',
            status TEXT NOT NULL,
            payment_method TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            billing_period_start DATE,
            billing_period_end DATE,
            invoice_url TEXT,
            receipt_url TEXT,
            failure_reason TEXT
        )
        ''')
        
        # Usage tracking table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS usage_tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            date DATE,
            signals_received INTEGER DEFAULT 0,
            signals_acted_on INTEGER DEFAULT 0,
            api_calls INTEGER DEFAULT 0,
            login_count INTEGER DEFAULT 0,
            last_activity DATETIME,
            feature_usage TEXT,
            PRIMARY KEY (user_id, date)
        )
        ''')
        
        # Subscription analytics table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscription_analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE PRIMARY KEY,
            tier TEXT,
            new_subscriptions INTEGER DEFAULT 0,
            cancelled_subscriptions INTEGER DEFAULT 0,
            renewed_subscriptions INTEGER DEFAULT 0,
            active_subscriptions INTEGER DEFAULT 0,
            mrr REAL DEFAULT 0,
            arr REAL DEFAULT 0,
            churn_rate REAL DEFAULT 0,
            ltv REAL DEFAULT 0,
            cac REAL DEFAULT 0,
            PRIMARY KEY (date, tier)
        )
        ''')
        
        # Discount codes table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS discount_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            discount_type TEXT DEFAULT 'percentage',
            discount_value REAL NOT NULL,
            applicable_tiers TEXT,
            max_uses INTEGER,
            current_uses INTEGER DEFAULT 0,
            valid_from DATETIME,
            valid_until DATETIME,
            created_by TEXT,
            status TEXT DEFAULT 'ACTIVE'
        )
        ''')
        
        # Referral system table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS referrals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            referrer_user_id TEXT NOT NULL,
            referred_user_id TEXT NOT NULL,
            referral_code TEXT NOT NULL,
            reward_amount REAL,
            reward_status TEXT DEFAULT 'PENDING',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            converted_at DATETIME
        )
        ''')
        
        # Trial conversions table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS trial_conversions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            trial_start DATETIME,
            trial_end DATETIME,
            converted BOOLEAN DEFAULT 0,
            conversion_date DATETIME,
            conversion_tier TEXT,
            engagement_score REAL,
            signals_during_trial INTEGER,
            last_activity_trial DATETIME
        )
        ''')
        
        conn.commit()
        conn.close()
        
        # Create default discount codes
        self.create_default_discount_codes()
    
    def create_default_discount_codes(self):
        """Create default discount codes for marketing"""
        default_codes = [
            {
                'code': 'WELCOME30',
                'discount_type': 'percentage',
                'discount_value': 30.0,
                'applicable_tiers': json.dumps(['BASIC', 'PRO']),
                'max_uses': 100,
                'valid_from': datetime.now(),
                'valid_until': datetime.now() + timedelta(days=90)
            },
            {
                'code': 'ANNUAL20',
                'discount_type': 'percentage',
                'discount_value': 20.0,
                'applicable_tiers': json.dumps(['BASIC', 'PRO', 'ENTERPRISE']),
                'max_uses': 500,
                'valid_from': datetime.now(),
                'valid_until': datetime.now() + timedelta(days=365)
            },
            {
                'code': 'EARLYBIRD',
                'discount_type': 'percentage',
                'discount_value': 50.0,
                'applicable_tiers': json.dumps(['BASIC', 'PRO']),
                'max_uses': 50,
                'valid_from': datetime.now(),
                'valid_until': datetime.now() + timedelta(days=30)
            }
        ]
        
        for code_data in default_codes:
            self.create_discount_code(**code_data)
    
    def create_subscription(self, user_data: Dict) -> Tuple[bool, str, Dict]:
        """Create new subscription with payment processing"""
        try:
            # Validate tier
            tier = user_data.get('subscription_tier', 'BASIC')
            if tier not in self.subscription_tiers:
                return False, "Invalid subscription tier", {}
            
            # Check if user already exists
            existing_user = self.get_subscription(user_data['user_id'])
            if existing_user:
                return False, "User already has an active subscription", {}
            
            # Apply discount code if provided
            discount_amount = 0
            if user_data.get('discount_code'):
                discount_valid, discount_amount = self.validate_discount_code(
                    user_data['discount_code'], tier
                )
                if not discount_valid:
                    return False, "Invalid or expired discount code", {}
            
            # Calculate pricing
            tier_config = self.subscription_tiers[tier]
            billing_cycle = user_data.get('billing_cycle', 'monthly')
            
            if billing_cycle == 'yearly':
                base_amount = tier_config['price_yearly']
            else:
                base_amount = tier_config['price_monthly']
            
            final_amount = base_amount * (1 - discount_amount / 100)
            
            # Create Stripe customer and subscription (if Stripe is configured)
            stripe_customer_id = None
            stripe_subscription_id = None
            
            if hasattr(stripe, 'api_key') and stripe.api_key:
                try:
                    # Create Stripe customer
                    customer = stripe.Customer.create(
                        email=user_data['email'],
                        name=user_data.get('name', ''),
                        metadata={
                            'user_id': user_data['user_id'],
                            'tier': tier
                        }
                    )
                    stripe_customer_id = customer.id
                    
                    # Create subscription
                    subscription = stripe.Subscription.create(
                        customer=stripe_customer_id,
                        items=[{
                            'price_data': {
                                'currency': 'usd',
                                'product_data': {
                                    'name': f"AI Finance Agency - {tier_config['name']}"
                                },
                                'unit_amount': int(final_amount * 100),  # Amount in cents
                                'recurring': {
                                    'interval': 'year' if billing_cycle == 'yearly' else 'month'
                                }
                            }
                        }],
                        trial_period_days=7  # 7-day free trial
                    )
                    stripe_subscription_id = subscription.id
                    
                except Exception as e:
                    logger.error(f"Stripe error: {e}")
                    return False, f"Payment processing error: {e}", {}
            
            # Calculate dates
            start_date = datetime.now()
            trial_end = start_date + timedelta(days=7)
            
            if billing_cycle == 'yearly':
                next_billing = trial_end + timedelta(days=365)
                end_date = next_billing
            else:
                next_billing = trial_end + timedelta(days=30)
                end_date = next_billing
            
            # Store subscription
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
            INSERT INTO subscriptions 
            (user_id, email, name, phone, subscription_tier, billing_cycle,
             start_date, end_date, next_billing_date, trial_end_date,
             stripe_customer_id, stripe_subscription_id, discount_percentage,
             referral_code, referred_by, preferences)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_data['user_id'], user_data['email'], user_data.get('name'),
                user_data.get('phone'), tier, billing_cycle, start_date, end_date,
                next_billing, trial_end, stripe_customer_id, stripe_subscription_id,
                discount_amount, user_data.get('referral_code'),
                user_data.get('referred_by'), json.dumps(user_data.get('preferences', {}))
            ))
            
            conn.commit()
            conn.close()
            
            # Update discount code usage
            if user_data.get('discount_code'):
                self.update_discount_code_usage(user_data['discount_code'])
            
            # Process referral if applicable
            if user_data.get('referred_by'):
                self.process_referral(user_data['referred_by'], user_data['user_id'])
            
            # Send welcome email
            self.send_welcome_email(user_data['email'], tier, trial_end)
            
            # Track trial conversion setup
            self.setup_trial_tracking(user_data['user_id'], trial_end)
            
            subscription_details = {
                'user_id': user_data['user_id'],
                'tier': tier,
                'billing_cycle': billing_cycle,
                'trial_end_date': trial_end.isoformat(),
                'next_billing_date': next_billing.isoformat(),
                'amount': final_amount,
                'features': tier_config['features'],
                'stripe_subscription_id': stripe_subscription_id
            }
            
            logger.info(f"Created subscription for user {user_data['user_id']}: {tier}")
            return True, "Subscription created successfully", subscription_details
            
        except Exception as e:
            logger.error(f"Error creating subscription: {e}")
            return False, f"Error creating subscription: {e}", {}
    
    def get_subscription(self, user_id: str) -> Optional[Dict]:
        """Get user's current subscription details"""
        conn = sqlite3.connect(self.db_path)
        
        query = '''
        SELECT * FROM subscriptions 
        WHERE user_id = ? AND status = 'ACTIVE'
        ORDER BY created_at DESC LIMIT 1
        '''
        
        df = pd.read_sql_query(query, conn, params=(user_id,))
        conn.close()
        
        if df.empty:
            return None
        
        subscription = df.iloc[0].to_dict()
        
        # Parse JSON fields
        if subscription['preferences']:
            subscription['preferences'] = json.loads(subscription['preferences'])
        
        # Add tier configuration
        tier = subscription['subscription_tier']
        subscription['tier_config'] = self.subscription_tiers.get(tier, {})
        
        # Check if subscription is expired
        if subscription['end_date']:
            end_date = datetime.fromisoformat(subscription['end_date'])
            if datetime.now() > end_date and subscription['status'] == 'ACTIVE':
                self.update_subscription_status(user_id, 'EXPIRED')
                subscription['status'] = 'EXPIRED'
        
        return subscription
    
    def upgrade_subscription(self, user_id: str, new_tier: str, billing_cycle: str = None) -> Tuple[bool, str]:
        """Upgrade user's subscription to a higher tier"""
        current_sub = self.get_subscription(user_id)
        if not current_sub:
            return False, "No active subscription found"
        
        current_tier = current_sub['subscription_tier']
        tier_order = {'BASIC': 1, 'PRO': 2, 'ENTERPRISE': 3}
        
        if tier_order.get(new_tier, 0) <= tier_order.get(current_tier, 0):
            return False, "Can only upgrade to a higher tier"
        
        try:
            # Calculate pro-rated amount
            new_tier_config = self.subscription_tiers[new_tier]
            current_billing_cycle = billing_cycle or current_sub['billing_cycle']
            
            if current_billing_cycle == 'yearly':
                new_amount = new_tier_config['price_yearly']
                current_amount = self.subscription_tiers[current_tier]['price_yearly']
            else:
                new_amount = new_tier_config['price_monthly']
                current_amount = self.subscription_tiers[current_tier]['price_monthly']
            
            # Calculate pro-rated upgrade cost
            days_remaining = (datetime.fromisoformat(current_sub['end_date']) - datetime.now()).days
            total_days = 365 if current_billing_cycle == 'yearly' else 30
            pro_rated_amount = (new_amount - current_amount) * (days_remaining / total_days)
            
            # Update Stripe subscription if applicable
            if current_sub.get('stripe_subscription_id'):
                try:
                    stripe.Subscription.modify(
                        current_sub['stripe_subscription_id'],
                        items=[{
                            'price_data': {
                                'currency': 'usd',
                                'product_data': {
                                    'name': f"AI Finance Agency - {new_tier_config['name']}"
                                },
                                'unit_amount': int(new_amount * 100),
                                'recurring': {
                                    'interval': 'year' if current_billing_cycle == 'yearly' else 'month'
                                }
                            }
                        }],
                        proration_behavior='create_prorations'
                    )
                except Exception as e:
                    logger.error(f"Stripe upgrade error: {e}")
                    return False, f"Payment processing error: {e}"
            
            # Update subscription in database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
            UPDATE subscriptions 
            SET subscription_tier = ?, billing_cycle = ?
            WHERE user_id = ? AND status = 'ACTIVE'
            ''', (new_tier, current_billing_cycle, user_id))
            
            conn.commit()
            conn.close()
            
            # Log payment for upgrade
            self.log_payment(user_id, pro_rated_amount, 'UPGRADE', f"Upgrade from {current_tier} to {new_tier}")
            
            # Send upgrade confirmation email
            self.send_upgrade_email(current_sub['email'], current_tier, new_tier)
            
            logger.info(f"Upgraded user {user_id} from {current_tier} to {new_tier}")
            return True, f"Successfully upgraded to {new_tier}"
            
        except Exception as e:
            logger.error(f"Error upgrading subscription: {e}")
            return False, f"Error upgrading subscription: {e}"
    
    def cancel_subscription(self, user_id: str, reason: str = None, immediate: bool = False) -> Tuple[bool, str]:
        """Cancel user's subscription"""
        subscription = self.get_subscription(user_id)
        if not subscription:
            return False, "No active subscription found"
        
        try:
            # Cancel Stripe subscription if applicable
            if subscription.get('stripe_subscription_id'):
                try:
                    if immediate:
                        stripe.Subscription.delete(subscription['stripe_subscription_id'])
                    else:
                        stripe.Subscription.modify(
                            subscription['stripe_subscription_id'],
                            cancel_at_period_end=True
                        )
                except Exception as e:
                    logger.error(f"Stripe cancellation error: {e}")
            
            # Update subscription status
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if immediate:
                new_status = 'CANCELLED'
                end_date = datetime.now()
            else:
                new_status = 'CANCELLED_AT_PERIOD_END'
                end_date = datetime.fromisoformat(subscription['end_date'])
            
            cursor.execute('''
            UPDATE subscriptions 
            SET status = ?, cancellation_date = ?, cancellation_reason = ?, auto_renew = 0
            WHERE user_id = ? AND status = 'ACTIVE'
            ''', (new_status, datetime.now(), reason, user_id))
            
            conn.commit()
            conn.close()
            
            # Send cancellation email
            self.send_cancellation_email(subscription['email'], subscription['subscription_tier'], end_date)
            
            # Track cancellation analytics
            self.track_cancellation(user_id, subscription['subscription_tier'], reason)
            
            logger.info(f"Cancelled subscription for user {user_id}: {reason}")
            return True, "Subscription cancelled successfully"
            
        except Exception as e:
            logger.error(f"Error cancelling subscription: {e}")
            return False, f"Error cancelling subscription: {e}"
    
    def validate_discount_code(self, code: str, tier: str) -> Tuple[bool, float]:
        """Validate discount code and return discount amount"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT * FROM discount_codes 
        WHERE code = ? AND status = 'ACTIVE'
        AND valid_from <= CURRENT_TIMESTAMP 
        AND valid_until >= CURRENT_TIMESTAMP
        ''', (code,))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return False, 0.0
        
        # Convert to dict
        columns = ['id', 'code', 'discount_type', 'discount_value', 'applicable_tiers', 
                  'max_uses', 'current_uses', 'valid_from', 'valid_until', 'created_by', 'status']
        discount = dict(zip(columns, result))
        
        # Check usage limit
        if discount['max_uses'] and discount['current_uses'] >= discount['max_uses']:
            return False, 0.0
        
        # Check tier applicability
        applicable_tiers = json.loads(discount['applicable_tiers'])
        if tier not in applicable_tiers:
            return False, 0.0
        
        return True, discount['discount_value']
    
    def create_discount_code(self, code: str, discount_type: str, discount_value: float,
                           applicable_tiers: List[str], max_uses: int = None,
                           valid_days: int = 30) -> bool:
        """Create a new discount code"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            valid_from = datetime.now()
            valid_until = valid_from + timedelta(days=valid_days)
            
            cursor.execute('''
            INSERT OR IGNORE INTO discount_codes 
            (code, discount_type, discount_value, applicable_tiers, max_uses,
             valid_from, valid_until, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                code, discount_type, discount_value, json.dumps(applicable_tiers),
                max_uses, valid_from, valid_until, 'SYSTEM'
            ))
            
            conn.commit()
            conn.close()
            return True
            
        except Exception as e:
            logger.error(f"Error creating discount code: {e}")
            return False
    
    def update_discount_code_usage(self, code: str):
        """Update discount code usage count"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        UPDATE discount_codes 
        SET current_uses = current_uses + 1
        WHERE code = ?
        ''', (code,))
        
        conn.commit()
        conn.close()
    
    def process_referral(self, referrer_user_id: str, referred_user_id: str):
        """Process referral reward"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Generate referral code if not exists
        referral_code = f"REF_{referrer_user_id[:8]}"
        
        # Calculate reward (10% of first payment)
        referred_sub = self.get_subscription(referred_user_id)
        if referred_sub:
            tier_config = self.subscription_tiers[referred_sub['subscription_tier']]
            if referred_sub['billing_cycle'] == 'yearly':
                reward_amount = tier_config['price_yearly'] * 0.1
            else:
                reward_amount = tier_config['price_monthly'] * 0.1
        else:
            reward_amount = 0
        
        cursor.execute('''
        INSERT INTO referrals 
        (referrer_user_id, referred_user_id, referral_code, reward_amount)
        VALUES (?, ?, ?, ?)
        ''', (referrer_user_id, referred_user_id, referral_code, reward_amount))
        
        conn.commit()
        conn.close()
    
    def setup_trial_tracking(self, user_id: str, trial_end: datetime):
        """Setup trial conversion tracking"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT INTO trial_conversions 
        (user_id, trial_start, trial_end)
        VALUES (?, ?, ?)
        ''', (user_id, datetime.now(), trial_end))
        
        conn.commit()
        conn.close()
    
    def track_usage(self, user_id: str, activity_type: str, count: int = 1):
        """Track user activity and usage"""
        date_today = datetime.now().date()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Update or insert usage record
        cursor.execute('''
        INSERT OR REPLACE INTO usage_tracking 
        (user_id, date, signals_received, signals_acted_on, api_calls, 
         login_count, last_activity)
        VALUES (?, ?, 
                COALESCE((SELECT signals_received FROM usage_tracking WHERE user_id = ? AND date = ?), 0) + ?,
                COALESCE((SELECT signals_acted_on FROM usage_tracking WHERE user_id = ? AND date = ?), 0) + ?,
                COALESCE((SELECT api_calls FROM usage_tracking WHERE user_id = ? AND date = ?), 0) + ?,
                COALESCE((SELECT login_count FROM usage_tracking WHERE user_id = ? AND date = ?), 0) + ?,
                ?)
        ''', (
            user_id, date_today,
            user_id, date_today, count if activity_type == 'signal_received' else 0,
            user_id, date_today, count if activity_type == 'signal_acted_on' else 0,
            user_id, date_today, count if activity_type == 'api_call' else 0,
            user_id, date_today, count if activity_type == 'login' else 0,
            datetime.now()
        ))
        
        conn.commit()
        conn.close()
    
    def calculate_subscription_analytics(self, date: datetime = None) -> Dict:
        """Calculate subscription analytics for a specific date"""
        if not date:
            date = datetime.now().date()
        
        conn = sqlite3.connect(self.db_path)
        
        analytics = {}
        
        for tier in self.subscription_tiers.keys():
            # Active subscriptions
            active_query = '''
            SELECT COUNT(*) as active_count
            FROM subscriptions 
            WHERE subscription_tier = ? 
            AND status IN ('ACTIVE', 'CANCELLED_AT_PERIOD_END')
            AND start_date <= ? AND end_date >= ?
            '''
            
            active_df = pd.read_sql_query(active_query, conn, params=(tier, date, date))
            active_count = active_df.iloc[0]['active_count'] if not active_df.empty else 0
            
            # New subscriptions today
            new_query = '''
            SELECT COUNT(*) as new_count
            FROM subscriptions 
            WHERE subscription_tier = ? 
            AND DATE(created_at) = ?
            '''
            
            new_df = pd.read_sql_query(new_query, conn, params=(tier, date))
            new_count = new_df.iloc[0]['new_count'] if not new_df.empty else 0
            
            # Cancelled subscriptions today
            cancelled_query = '''
            SELECT COUNT(*) as cancelled_count
            FROM subscriptions 
            WHERE subscription_tier = ? 
            AND DATE(cancellation_date) = ?
            '''
            
            cancelled_df = pd.read_sql_query(cancelled_query, conn, params=(tier, date))
            cancelled_count = cancelled_df.iloc[0]['cancelled_count'] if not cancelled_df.empty else 0
            
            # Calculate MRR and ARR
            tier_config = self.subscription_tiers[tier]
            monthly_revenue = 0
            
            # Get billing cycles for active subscriptions
            billing_query = '''
            SELECT billing_cycle, COUNT(*) as count
            FROM subscriptions 
            WHERE subscription_tier = ? 
            AND status IN ('ACTIVE', 'CANCELLED_AT_PERIOD_END')
            AND start_date <= ? AND end_date >= ?
            GROUP BY billing_cycle
            '''
            
            billing_df = pd.read_sql_query(billing_query, conn, params=(tier, date, date))
            
            for _, row in billing_df.iterrows():
                if row['billing_cycle'] == 'yearly':
                    monthly_revenue += (tier_config['price_yearly'] / 12) * row['count']
                else:
                    monthly_revenue += tier_config['price_monthly'] * row['count']
            
            annual_revenue = monthly_revenue * 12
            
            # Calculate churn rate (last 30 days)
            churn_start = date - timedelta(days=30)
            churn_query = '''
            SELECT 
                COUNT(CASE WHEN DATE(cancellation_date) BETWEEN ? AND ? THEN 1 END) as churned,
                COUNT(CASE WHEN start_date <= ? THEN 1 END) as total_at_start
            FROM subscriptions 
            WHERE subscription_tier = ?
            '''
            
            churn_df = pd.read_sql_query(churn_query, conn, params=(churn_start, date, churn_start, tier))
            
            if not churn_df.empty and churn_df.iloc[0]['total_at_start'] > 0:
                churn_rate = (churn_df.iloc[0]['churned'] / churn_df.iloc[0]['total_at_start']) * 100
            else:
                churn_rate = 0
            
            analytics[tier] = {
                'date': date,
                'tier': tier,
                'active_subscriptions': active_count,
                'new_subscriptions': new_count,
                'cancelled_subscriptions': cancelled_count,
                'mrr': monthly_revenue,
                'arr': annual_revenue,
                'churn_rate': churn_rate
            }
            
            # Store analytics
            self.store_subscription_analytics(analytics[tier])
        
        conn.close()
        return analytics
    
    def store_subscription_analytics(self, analytics: Dict):
        """Store subscription analytics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT OR REPLACE INTO subscription_analytics 
        (date, tier, new_subscriptions, cancelled_subscriptions, 
         active_subscriptions, mrr, arr, churn_rate)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            analytics['date'], analytics['tier'], analytics['new_subscriptions'],
            analytics['cancelled_subscriptions'], analytics['active_subscriptions'],
            analytics['mrr'], analytics['arr'], analytics['churn_rate']
        ))
        
        conn.commit()
        conn.close()
    
    def log_payment(self, user_id: str, amount: float, status: str, description: str = None):
        """Log payment transaction"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT INTO payment_history 
        (user_id, amount, status, payment_method, timestamp)
        VALUES (?, ?, ?, ?, ?)
        ''', (user_id, amount, status, description, datetime.now()))
        
        conn.commit()
        conn.close()
    
    def send_welcome_email(self, email: str, tier: str, trial_end: datetime):
        """Send welcome email to new subscriber"""
        try:
            tier_config = self.subscription_tiers[tier]
            
            subject = f"Welcome to AI Finance Agency - {tier_config['name']} Plan!"
            
            body = f"""
            Welcome to AI Finance Agency!
            
            Thank you for subscribing to our {tier_config['name']} plan. Your 7-day free trial has started
            and will end on {trial_end.strftime('%B %d, %Y')}.
            
            Your subscription includes:
            {chr(10).join(['• ' + feature for feature in tier_config['features']])}
            
            What's next:
            1. Check your email and Telegram for premium signals
            2. Join our community channels
            3. Set up your preferences in the dashboard
            4. Start receiving professional trading signals
            
            Need help? Reply to this email or contact our support team.
            
            Happy trading!
            AI Finance Agency Team
            """
            
            # Send email (implement your email sending logic)
            logger.info(f"Welcome email sent to {email}")
            
        except Exception as e:
            logger.error(f"Error sending welcome email: {e}")
    
    def send_upgrade_email(self, email: str, old_tier: str, new_tier: str):
        """Send upgrade confirmation email"""
        try:
            subject = f"Subscription Upgraded to {self.subscription_tiers[new_tier]['name']}!"
            
            body = f"""
            Congratulations on upgrading your subscription!
            
            You've successfully upgraded from {self.subscription_tiers[old_tier]['name']} 
            to {self.subscription_tiers[new_tier]['name']}.
            
            Your new benefits include:
            {chr(10).join(['• ' + feature for feature in self.subscription_tiers[new_tier]['features']])}
            
            The changes are effective immediately.
            
            Thank you for your continued trust in AI Finance Agency!
            """
            
            logger.info(f"Upgrade email sent to {email}")
            
        except Exception as e:
            logger.error(f"Error sending upgrade email: {e}")
    
    def send_cancellation_email(self, email: str, tier: str, end_date: datetime):
        """Send cancellation confirmation email"""
        try:
            subject = "Subscription Cancellation Confirmed"
            
            body = f"""
            We're sorry to see you go!
            
            Your {self.subscription_tiers[tier]['name']} subscription has been cancelled.
            You'll continue to have access until {end_date.strftime('%B %d, %Y')}.
            
            We'd love to have you back anytime. If you change your mind, you can 
            reactivate your subscription from your account dashboard.
            
            If you have any feedback on how we can improve, please reply to this email.
            
            Thank you for being part of AI Finance Agency!
            """
            
            logger.info(f"Cancellation email sent to {email}")
            
        except Exception as e:
            logger.error(f"Error sending cancellation email: {e}")
    
    def update_subscription_status(self, user_id: str, status: str):
        """Update subscription status"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        UPDATE subscriptions 
        SET status = ?
        WHERE user_id = ? AND status = 'ACTIVE'
        ''', (status, user_id))
        
        conn.commit()
        conn.close()
    
    def track_cancellation(self, user_id: str, tier: str, reason: str):
        """Track cancellation for analytics"""
        # This would integrate with analytics tools
        logger.info(f"Cancellation tracked: {user_id}, {tier}, {reason}")
    
    def get_subscription_overview(self) -> Dict:
        """Get overall subscription metrics"""
        conn = sqlite3.connect(self.db_path)
        
        # Total active subscriptions by tier
        active_query = '''
        SELECT subscription_tier, COUNT(*) as count
        FROM subscriptions 
        WHERE status IN ('ACTIVE', 'CANCELLED_AT_PERIOD_END')
        GROUP BY subscription_tier
        '''
        
        active_df = pd.read_sql_query(active_query, conn)
        
        # Calculate current ARR
        total_arr = 0
        tier_breakdown = {}
        
        for _, row in active_df.iterrows():
            tier = row['subscription_tier']
            count = row['count']
            
            # Get average revenue per user for this tier
            revenue_query = '''
            SELECT AVG(
                CASE 
                    WHEN billing_cycle = 'yearly' THEN 
                        CASE subscription_tier
                            WHEN 'BASIC' THEN 490
                            WHEN 'PRO' THEN 1990
                            WHEN 'ENTERPRISE' THEN 9999
                        END
                    ELSE 
                        CASE subscription_tier
                            WHEN 'BASIC' THEN 49 * 12
                            WHEN 'PRO' THEN 199 * 12
                            WHEN 'ENTERPRISE' THEN 999 * 12
                        END
                END
            ) as avg_arr
            FROM subscriptions 
            WHERE subscription_tier = ? AND status IN ('ACTIVE', 'CANCELLED_AT_PERIOD_END')
            '''
            
            revenue_df = pd.read_sql_query(revenue_query, conn, params=(tier,))
            avg_arr = revenue_df.iloc[0]['avg_arr'] if not revenue_df.empty else 0
            
            tier_arr = count * avg_arr
            total_arr += tier_arr
            
            tier_breakdown[tier] = {
                'subscribers': count,
                'arr': tier_arr,
                'avg_revenue_per_user': avg_arr
            }
        
        conn.close()
        
        return {
            'total_active_subscribers': active_df['count'].sum() if not active_df.empty else 0,
            'total_arr': total_arr,
            'projected_arr': self.total_projected_arr,
            'arr_achievement': (total_arr / self.total_projected_arr) * 100,
            'tier_breakdown': tier_breakdown,
            'last_updated': datetime.now().isoformat()
        }

if __name__ == "__main__":
    # Initialize subscription manager
    manager = SubscriptionTierManager()
    
    # Example: Create a new subscription
    test_user = {
        'user_id': 'user_12345',
        'email': 'test@example.com',
        'name': 'Test User',
        'subscription_tier': 'PRO',
        'billing_cycle': 'yearly',
        'discount_code': 'WELCOME30'
    }
    
    success, message, details = manager.create_subscription(test_user)
    print(f"Subscription creation: {success} - {message}")
    
    if success:
        print(f"Subscription details: {details}")
    
    # Get subscription overview
    overview = manager.get_subscription_overview()
    print(f"\nSubscription Overview:")
    print(f"Total ARR: ${overview['total_arr']:,.2f}")
    print(f"ARR Achievement: {overview['arr_achievement']:.1f}%")
    print(f"Active Subscribers: {overview['total_active_subscribers']}")