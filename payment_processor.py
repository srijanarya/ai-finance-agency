#!/usr/bin/env python3
"""
Payment Processing System
=======================
Stripe and Razorpay integration for subscription billing
Supports multi-currency, compliance, and webhook handling

Author: TREUM ALGOTECH
Created: September 10, 2025
"""

import stripe
import razorpay
import hmac
import hashlib
import json
import logging
from typing import Dict, Optional, Any, List, Tuple
from decimal import Decimal
from datetime import datetime, timezone
from dataclasses import dataclass
from enum import Enum
import os
from dotenv import load_dotenv

from subscription_manager import (
    subscription_manager, SubscriptionStatus, PaymentStatus,
    BillingCycle, SubscriptionTier
)
from database_helper import get_db_connection

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PaymentProvider(Enum):
    """Payment provider options"""
    STRIPE = "stripe"
    RAZORPAY = "razorpay"

@dataclass
class PaymentIntent:
    """Payment intent data structure"""
    id: str
    amount: Decimal
    currency: str
    provider: PaymentProvider
    client_secret: Optional[str]
    status: str
    metadata: Dict[str, Any]

@dataclass
class TaxInfo:
    """Tax calculation information"""
    country_code: str
    state_code: Optional[str]
    tax_rate: Decimal
    tax_amount: Decimal
    is_business: bool
    vat_number: Optional[str]

class PaymentProcessor:
    """Unified payment processing system"""
    
    def __init__(self):
        # Initialize Stripe
        self.stripe_secret_key = os.getenv('STRIPE_SECRET_KEY')
        self.stripe_webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        
        if self.stripe_secret_key:
            stripe.api_key = self.stripe_secret_key
            logger.info("Stripe initialized")
        else:
            logger.warning("Stripe not configured - missing STRIPE_SECRET_KEY")
        
        # Initialize Razorpay
        self.razorpay_key_id = os.getenv('RAZORPAY_KEY_ID')
        self.razorpay_key_secret = os.getenv('RAZORPAY_KEY_SECRET')
        self.razorpay_webhook_secret = os.getenv('RAZORPAY_WEBHOOK_SECRET')
        
        if self.razorpay_key_id and self.razorpay_key_secret:
            self.razorpay_client = razorpay.Client(
                auth=(self.razorpay_key_id, self.razorpay_key_secret)
            )
            logger.info("Razorpay initialized")
        else:
            logger.warning("Razorpay not configured - missing credentials")
            self.razorpay_client = None
        
        # Tax rates by jurisdiction
        self.tax_rates = {
            'US': {
                'federal': Decimal('0'),  # No federal VAT
                'state_rates': {
                    'CA': Decimal('0.08'),  # California
                    'NY': Decimal('0.08'),  # New York
                    'TX': Decimal('0.0625'), # Texas
                    # Add more states as needed
                }
            },
            'IN': {
                'gst': Decimal('0.18'),  # 18% GST for digital services
            },
            'GB': {
                'vat': Decimal('0.20'),  # 20% VAT
            },
            'EU': {
                'vat': Decimal('0.20'),  # Average EU VAT
            }
        }
    
    def calculate_tax(self, amount: Decimal, country_code: str, 
                     state_code: Optional[str] = None,
                     is_business: bool = False,
                     vat_number: Optional[str] = None) -> TaxInfo:
        """Calculate tax based on jurisdiction"""
        
        tax_rate = Decimal('0')
        
        if country_code == 'US' and state_code:
            # US state sales tax
            state_rates = self.tax_rates.get('US', {}).get('state_rates', {})
            tax_rate = state_rates.get(state_code, Decimal('0'))
        
        elif country_code == 'IN':
            # Indian GST - 18% for digital services
            tax_rate = self.tax_rates.get('IN', {}).get('gst', Decimal('0.18'))
        
        elif country_code in ['GB', 'EU'] or country_code in [
            'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'PT', 'FI', 'SE', 'DK'
        ]:
            # EU VAT - reverse charge for B2B with valid VAT number
            if is_business and vat_number:
                tax_rate = Decimal('0')  # Reverse charge
            else:
                tax_rate = self.tax_rates.get('EU', {}).get('vat', Decimal('0.20'))
        
        tax_amount = amount * tax_rate
        
        return TaxInfo(
            country_code=country_code,
            state_code=state_code,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            is_business=is_business,
            vat_number=vat_number
        )
    
    def create_payment_intent_stripe(
        self,
        amount: Decimal,
        currency: str,
        customer_email: str,
        subscription_id: str,
        billing_address: Dict[str, Any],
        metadata: Optional[Dict] = None
    ) -> PaymentIntent:
        """Create Stripe payment intent"""
        
        if not self.stripe_secret_key:
            raise ValueError("Stripe not configured")
        
        # Calculate tax
        country = billing_address.get('country', 'US')
        state = billing_address.get('state')
        tax_info = self.calculate_tax(
            amount, country, state,
            is_business=billing_address.get('is_business', False),
            vat_number=billing_address.get('vat_number')
        )
        
        # Total amount including tax
        total_amount = amount + tax_info.tax_amount
        
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(total_amount * 100),  # Convert to cents
                currency=currency.lower(),
                automatic_payment_methods={'enabled': True},
                metadata={
                    'subscription_id': subscription_id,
                    'customer_email': customer_email,
                    'tax_amount': str(tax_info.tax_amount),
                    'tax_rate': str(tax_info.tax_rate),
                    'country': country,
                    **(metadata or {})
                },
                receipt_email=customer_email,
            )
            
            return PaymentIntent(
                id=intent.id,
                amount=total_amount,
                currency=currency,
                provider=PaymentProvider.STRIPE,
                client_secret=intent.client_secret,
                status=intent.status,
                metadata=intent.metadata
            )
            
        except stripe.StripeError as e:
            logger.error(f"Stripe payment intent creation failed: {e}")
            raise ValueError(f"Payment processing failed: {str(e)}")
    
    def create_payment_intent_razorpay(
        self,
        amount: Decimal,
        currency: str,
        customer_email: str,
        subscription_id: str,
        billing_address: Dict[str, Any],
        metadata: Optional[Dict] = None
    ) -> PaymentIntent:
        """Create Razorpay payment intent"""
        
        if not self.razorpay_client:
            raise ValueError("Razorpay not configured")
        
        # Calculate GST for India
        tax_info = self.calculate_tax(
            amount, 'IN',
            is_business=billing_address.get('is_business', False)
        )
        
        total_amount = amount + tax_info.tax_amount
        
        try:
            order_data = {
                'amount': int(total_amount * 100),  # Convert to paise
                'currency': currency.upper(),
                'notes': {
                    'subscription_id': subscription_id,
                    'customer_email': customer_email,
                    'tax_amount': str(tax_info.tax_amount),
                    'gst_rate': str(tax_info.tax_rate),
                    **(metadata or {})
                }
            }
            
            order = self.razorpay_client.order.create(data=order_data)
            
            return PaymentIntent(
                id=order['id'],
                amount=total_amount,
                currency=currency,
                provider=PaymentProvider.RAZORPAY,
                client_secret=None,  # Razorpay doesn't use client secrets
                status=order['status'],
                metadata=order['notes']
            )
            
        except Exception as e:
            logger.error(f"Razorpay order creation failed: {e}")
            raise ValueError(f"Payment processing failed: {str(e)}")
    
    def create_subscription_stripe(
        self,
        customer_email: str,
        price_id: str,
        trial_period_days: int = 7,
        metadata: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Create Stripe subscription"""
        
        try:
            # Create or retrieve customer
            customers = stripe.Customer.list(email=customer_email, limit=1)
            
            if customers.data:
                customer = customers.data[0]
            else:
                customer = stripe.Customer.create(
                    email=customer_email,
                    metadata=metadata or {}
                )
            
            # Create subscription
            subscription = stripe.Subscription.create(
                customer=customer.id,
                items=[{'price': price_id}],
                trial_period_days=trial_period_days,
                metadata=metadata or {},
                expand=['latest_invoice.payment_intent']
            )
            
            return {
                'subscription_id': subscription.id,
                'customer_id': customer.id,
                'status': subscription.status,
                'client_secret': subscription.latest_invoice.payment_intent.client_secret
            }
            
        except stripe.StripeError as e:
            logger.error(f"Stripe subscription creation failed: {e}")
            raise ValueError(f"Subscription creation failed: {str(e)}")
    
    def create_subscription_razorpay(
        self,
        customer_email: str,
        plan_id: str,
        trial_period_days: int = 7,
        metadata: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Create Razorpay subscription"""
        
        try:
            # Create customer
            customer_data = {
                'name': customer_email.split('@')[0].title(),
                'email': customer_email,
                'notes': metadata or {}
            }
            
            customer = self.razorpay_client.customer.create(customer_data)
            
            # Create subscription
            subscription_data = {
                'plan_id': plan_id,
                'customer_id': customer['id'],
                'total_count': 12,  # 12 months
                'start_at': int((datetime.now() + timedelta(days=trial_period_days)).timestamp()),
                'notes': metadata or {}
            }
            
            subscription = self.razorpay_client.subscription.create(subscription_data)
            
            return {
                'subscription_id': subscription['id'],
                'customer_id': customer['id'],
                'status': subscription['status'],
                'short_url': subscription.get('short_url')
            }
            
        except Exception as e:
            logger.error(f"Razorpay subscription creation failed: {e}")
            raise ValueError(f"Subscription creation failed: {str(e)}")
    
    def handle_stripe_webhook(self, payload: str, sig_header: str) -> Dict[str, Any]:
        """Handle Stripe webhook events"""
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, self.stripe_webhook_secret
            )
        except ValueError as e:
            logger.error(f"Invalid payload: {e}")
            raise ValueError("Invalid payload")
        except stripe.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {e}")
            raise ValueError("Invalid signature")
        
        # Handle different event types
        if event['type'] == 'payment_intent.succeeded':
            return self._handle_stripe_payment_success(event['data']['object'])
        
        elif event['type'] == 'payment_intent.payment_failed':
            return self._handle_stripe_payment_failed(event['data']['object'])
        
        elif event['type'] == 'invoice.payment_succeeded':
            return self._handle_stripe_invoice_paid(event['data']['object'])
        
        elif event['type'] == 'invoice.payment_failed':
            return self._handle_stripe_invoice_failed(event['data']['object'])
        
        elif event['type'] == 'customer.subscription.updated':
            return self._handle_stripe_subscription_updated(event['data']['object'])
        
        elif event['type'] == 'customer.subscription.deleted':
            return self._handle_stripe_subscription_canceled(event['data']['object'])
        
        else:
            logger.info(f"Unhandled Stripe event type: {event['type']}")
            return {'status': 'ignored'}
    
    def _handle_stripe_payment_success(self, payment_intent) -> Dict[str, Any]:
        """Handle successful Stripe payment"""
        subscription_id = payment_intent['metadata'].get('subscription_id')
        
        if subscription_id:
            # Record payment in database
            with get_db_connection('core') as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    INSERT INTO payment_history (
                        id, subscription_id, amount, currency, status, 
                        payment_method, external_payment_id, processed_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    f"pay_{payment_intent['id']}",
                    subscription_id,
                    str(Decimal(payment_intent['amount']) / 100),  # Convert from cents
                    payment_intent['currency'].upper(),
                    PaymentStatus.COMPLETED.value,
                    PaymentProvider.STRIPE.value,
                    payment_intent['id'],
                    datetime.now(timezone.utc).isoformat()
                ))
                
                # Update subscription status to active
                cursor.execute('''
                    UPDATE subscriptions 
                    SET status = 'active', updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', (subscription_id,))
                
                conn.commit()
            
            logger.info(f"Payment successful for subscription {subscription_id}")
        
        return {'status': 'processed'}
    
    def _handle_stripe_payment_failed(self, payment_intent) -> Dict[str, Any]:
        """Handle failed Stripe payment"""
        subscription_id = payment_intent['metadata'].get('subscription_id')
        
        if subscription_id:
            # Record failed payment
            with get_db_connection('core') as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    INSERT INTO payment_history (
                        id, subscription_id, amount, currency, status, 
                        payment_method, external_payment_id, processed_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    f"pay_{payment_intent['id']}",
                    subscription_id,
                    str(Decimal(payment_intent['amount']) / 100),
                    payment_intent['currency'].upper(),
                    PaymentStatus.FAILED.value,
                    PaymentProvider.STRIPE.value,
                    payment_intent['id'],
                    datetime.now(timezone.utc).isoformat()
                ))
                
                # Update subscription to past due
                cursor.execute('''
                    UPDATE subscriptions 
                    SET status = 'past_due', updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', (subscription_id,))
                
                conn.commit()
            
            logger.warning(f"Payment failed for subscription {subscription_id}")
        
        return {'status': 'processed'}
    
    def handle_razorpay_webhook(self, payload: str, signature: str) -> Dict[str, Any]:
        """Handle Razorpay webhook events"""
        
        # Verify webhook signature
        expected_signature = hmac.new(
            self.razorpay_webhook_secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_signature):
            logger.error("Invalid Razorpay webhook signature")
            raise ValueError("Invalid signature")
        
        try:
            event = json.loads(payload)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON payload: {e}")
            raise ValueError("Invalid payload")
        
        # Handle different event types
        event_type = event.get('event')
        
        if event_type == 'payment.captured':
            return self._handle_razorpay_payment_success(event['payload']['payment']['entity'])
        
        elif event_type == 'payment.failed':
            return self._handle_razorpay_payment_failed(event['payload']['payment']['entity'])
        
        elif event_type == 'subscription.charged':
            return self._handle_razorpay_subscription_charged(event['payload']['subscription']['entity'])
        
        elif event_type == 'subscription.cancelled':
            return self._handle_razorpay_subscription_canceled(event['payload']['subscription']['entity'])
        
        else:
            logger.info(f"Unhandled Razorpay event type: {event_type}")
            return {'status': 'ignored'}
    
    def _handle_razorpay_payment_success(self, payment) -> Dict[str, Any]:
        """Handle successful Razorpay payment"""
        subscription_id = payment['notes'].get('subscription_id')
        
        if subscription_id:
            # Record payment in database
            with get_db_connection('core') as conn:
                cursor = conn.cursor()
                
                cursor.execute('''
                    INSERT INTO payment_history (
                        id, subscription_id, amount, currency, status, 
                        payment_method, external_payment_id, processed_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    f"pay_{payment['id']}",
                    subscription_id,
                    str(Decimal(payment['amount']) / 100),  # Convert from paise
                    payment['currency'].upper(),
                    PaymentStatus.COMPLETED.value,
                    PaymentProvider.RAZORPAY.value,
                    payment['id'],
                    datetime.now(timezone.utc).isoformat()
                ))
                
                # Update subscription status to active
                cursor.execute('''
                    UPDATE subscriptions 
                    SET status = 'active', updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', (subscription_id,))
                
                conn.commit()
            
            logger.info(f"Razorpay payment successful for subscription {subscription_id}")
        
        return {'status': 'processed'}
    
    def get_payment_history(
        self, 
        subscription_id: str, 
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get payment history for subscription"""
        
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM payment_history 
                WHERE subscription_id = ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            ''', (subscription_id, limit, offset))
            
            payments = []
            for row in cursor.fetchall():
                payments.append({
                    'id': row['id'],
                    'amount': float(row['amount']),
                    'currency': row['currency'],
                    'status': row['status'],
                    'payment_method': row['payment_method'],
                    'external_payment_id': row['external_payment_id'],
                    'invoice_number': row['invoice_number'],
                    'tax_amount': float(row['tax_amount'] or 0),
                    'fees': float(row['fees'] or 0),
                    'processed_at': row['processed_at'],
                    'created_at': row['created_at']
                })
            
            return payments
    
    def process_refund(
        self,
        payment_id: str,
        amount: Optional[Decimal] = None,
        reason: str = "requested_by_customer"
    ) -> Dict[str, Any]:
        """Process refund for a payment"""
        
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            # Get payment details
            cursor.execute('''
                SELECT * FROM payment_history WHERE id = ?
            ''', (payment_id,))
            
            payment = cursor.fetchone()
            if not payment:
                raise ValueError(f"Payment {payment_id} not found")
            
            if payment['status'] != PaymentStatus.COMPLETED.value:
                raise ValueError(f"Cannot refund payment with status {payment['status']}")
            
            provider = PaymentProvider(payment['payment_method'])
            external_id = payment['external_payment_id']
            refund_amount = amount or Decimal(str(payment['amount']))
            
            try:
                if provider == PaymentProvider.STRIPE:
                    refund = stripe.Refund.create(
                        payment_intent=external_id,
                        amount=int(refund_amount * 100),  # Convert to cents
                        reason=reason
                    )
                    refund_id = refund.id
                    
                elif provider == PaymentProvider.RAZORPAY:
                    refund = self.razorpay_client.payment.refund(
                        external_id,
                        {
                            'amount': int(refund_amount * 100),  # Convert to paise
                            'notes': {'reason': reason}
                        }
                    )
                    refund_id = refund['id']
                
                else:
                    raise ValueError(f"Unsupported payment provider: {provider}")
                
                # Record refund
                cursor.execute('''
                    INSERT INTO payment_history (
                        id, subscription_id, amount, currency, status, 
                        payment_method, external_payment_id, processed_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    f"refund_{refund_id}",
                    payment['subscription_id'],
                    str(-refund_amount),  # Negative amount for refund
                    payment['currency'],
                    PaymentStatus.REFUNDED.value,
                    provider.value,
                    refund_id,
                    datetime.now(timezone.utc).isoformat()
                ))
                
                conn.commit()
                
                logger.info(f"Refund processed: {refund_id} for payment {payment_id}")
                
                return {
                    'refund_id': refund_id,
                    'amount': float(refund_amount),
                    'currency': payment['currency'],
                    'status': 'processed'
                }
                
            except Exception as e:
                logger.error(f"Refund processing failed: {e}")
                raise ValueError(f"Refund failed: {str(e)}")
    
    def get_revenue_summary(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get revenue summary for date range"""
        
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT 
                    COUNT(*) as total_payments,
                    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
                    SUM(CASE WHEN status = 'refunded' THEN ABS(amount) ELSE 0 END) as total_refunds,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
                    payment_method,
                    currency
                FROM payment_history
                WHERE DATE(created_at) BETWEEN ? AND ?
                GROUP BY payment_method, currency
            ''', (start_date.date().isoformat(), end_date.date().isoformat()))
            
            summary = {
                'by_provider': {},
                'totals': {
                    'revenue': Decimal('0'),
                    'refunds': Decimal('0'),
                    'net_revenue': Decimal('0'),
                    'total_payments': 0,
                    'failed_payments': 0
                }
            }
            
            for row in cursor.fetchall():
                provider = row['payment_method']
                currency = row['currency']
                
                if provider not in summary['by_provider']:
                    summary['by_provider'][provider] = {}
                
                summary['by_provider'][provider][currency] = {
                    'total_payments': row['total_payments'],
                    'total_revenue': float(row['total_revenue'] or 0),
                    'total_refunds': float(row['total_refunds'] or 0),
                    'failed_payments': row['failed_payments'],
                    'net_revenue': float((row['total_revenue'] or 0) - (row['total_refunds'] or 0))
                }
                
                # Add to totals
                summary['totals']['revenue'] += Decimal(str(row['total_revenue'] or 0))
                summary['totals']['refunds'] += Decimal(str(row['total_refunds'] or 0))
                summary['totals']['total_payments'] += row['total_payments']
                summary['totals']['failed_payments'] += row['failed_payments']
            
            summary['totals']['net_revenue'] = summary['totals']['revenue'] - summary['totals']['refunds']
            
            # Convert Decimal to float for JSON serialization
            summary['totals'] = {
                k: float(v) if isinstance(v, Decimal) else v 
                for k, v in summary['totals'].items()
            }
            
            return summary

# Global instance
payment_processor = PaymentProcessor()
