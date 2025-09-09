#!/usr/bin/env python3
"""
Subscription API Endpoints
=========================
RESTful API for subscription management and billing integration
Supports customer self-service and webhook endpoints

Author: TREUM ALGOTECH
Created: September 10, 2025
"""

from flask import Flask, request, jsonify, abort
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Optional, Any, List
from decimal import Decimal
import uuid
from functools import wraps
from dotenv import load_dotenv

from subscription_manager import (
    subscription_manager, SubscriptionTier, SubscriptionStatus, 
    BillingCycle, Subscription, SubscriptionPlan
)
from payment_processor import payment_processor, PaymentProvider
from database_helper import get_db_connection

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'treum-subscription-api-2025')
CORS(app)

# Rate limiting
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["100 per hour"]
)

# API Authentication
API_KEY = os.getenv('API_KEY', 'treum_api_key_2025')

def require_api_key(f):
    """API key authentication decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key') or request.args.get('api_key')
        
        if not api_key or api_key != API_KEY:
            return jsonify({'error': 'Invalid or missing API key'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

def validate_user_id(user_id: str) -> bool:
    """Validate user ID format"""
    return user_id and len(user_id) > 0 and len(user_id) <= 255

def handle_api_error(error: Exception) -> Dict[str, Any]:
    """Handle API errors consistently"""
    logger.error(f"API Error: {error}")
    
    error_msg = str(error)
    
    if "not found" in error_msg.lower():
        status_code = 404
    elif "invalid" in error_msg.lower() or "bad" in error_msg.lower():
        status_code = 400
    elif "unauthorized" in error_msg.lower() or "access denied" in error_msg.lower():
        status_code = 403
    else:
        status_code = 500
    
    return {
        'error': error_msg,
        'timestamp': datetime.now(timezone.utc).isoformat()
    }, status_code

# ==================== SUBSCRIPTION PLANS ====================

@app.route('/api/v1/plans', methods=['GET'])
@limiter.limit("20 per minute")
def get_subscription_plans():
    """Get all available subscription plans"""
    try:
        plans = subscription_manager.get_plans(active_only=True)
        
        return jsonify({
            'success': True,
            'plans': [
                {
                    'id': plan.id,
                    'name': plan.name,
                    'tier': plan.tier.value,
                    'price_monthly': float(plan.price_monthly),
                    'price_yearly': float(plan.price_yearly),
                    'currency': plan.currency,
                    'features': plan.features,
                    'limits': plan.limits,
                    'description': plan.description,
                    'savings_yearly': float(plan.price_monthly * 12 - plan.price_yearly)
                }
                for plan in plans
            ],
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        error_response, status_code = handle_api_error(e)
        return jsonify(error_response), status_code

@app.route('/api/v1/plans/<plan_id>', methods=['GET'])
@limiter.limit("30 per minute")
def get_subscription_plan(plan_id):
    """Get specific subscription plan details"""
    try:
        plan = subscription_manager.get_plan(plan_id)
        
        if not plan:
            return jsonify({'error': f'Plan {plan_id} not found'}), 404
        
        return jsonify({
            'success': True,
            'plan': {
                'id': plan.id,
                'name': plan.name,
                'tier': plan.tier.value,
                'price_monthly': float(plan.price_monthly),
                'price_yearly': float(plan.price_yearly),
                'currency': plan.currency,
                'features': plan.features,
                'limits': plan.limits,
                'description': plan.description,
                'savings_yearly': float(plan.price_monthly * 12 - plan.price_yearly)
            }
        })
        
    except Exception as e:
        error_response, status_code = handle_api_error(e)
        return jsonify(error_response), status_code

# ==================== SUBSCRIPTION MANAGEMENT ====================

@app.route('/api/v1/subscriptions', methods=['POST'])
@require_api_key
@limiter.limit("5 per minute")
def create_subscription():
    """Create new subscription with trial period"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'plan_id', 'billing_cycle']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        user_id = data['user_id']
        plan_id = data['plan_id']
        billing_cycle = data['billing_cycle']
        
        # Validate inputs
        if not validate_user_id(user_id):
            return jsonify({'error': 'Invalid user_id'}), 400
        
        try:
            billing_cycle_enum = BillingCycle(billing_cycle)
        except ValueError:
            return jsonify({'error': f'Invalid billing_cycle: {billing_cycle}'}), 400
        
        # Check if user already has active subscription
        existing = subscription_manager.get_user_subscription(user_id)
        if existing and existing.is_active:
            return jsonify({
                'error': 'User already has an active subscription',
                'existing_subscription_id': existing.id
            }), 409
        
        # Create subscription
        subscription = subscription_manager.create_subscription(
            user_id=user_id,
            plan_id=plan_id,
            billing_cycle=billing_cycle_enum,
            payment_method=data.get('payment_method', 'stripe'),
            trial_days=data.get('trial_days', 7),
            metadata=data.get('metadata', {})
        )
        
        return jsonify({
            'success': True,
            'subscription': {
                'id': subscription.id,
                'user_id': subscription.user_id,
                'plan_id': subscription.plan_id,
                'status': subscription.status.value,
                'billing_cycle': subscription.billing_cycle.value,
                'trial_end': subscription.trial_end.isoformat() if subscription.trial_end else None,
                'current_period_end': subscription.current_period_end.isoformat(),
                'created_at': subscription.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        error_response, status_code = handle_api_error(e)
        return jsonify(error_response), status_code

@app.route('/api/v1/users/<user_id>/subscription', methods=['GET'])
@require_api_key
@limiter.limit("30 per minute")
def get_user_subscription(user_id):
    """Get user's current subscription"""
    try:
        if not validate_user_id(user_id):
            return jsonify({'error': 'Invalid user_id'}), 400
        
        subscription = subscription_manager.get_user_subscription(user_id)
        
        if not subscription:
            return jsonify({
                'success': True,
                'subscription': None,
                'message': 'No active subscription found'
            })
        
        # Get plan details
        plan = subscription_manager.get_plan(subscription.plan_id)
        
        # Get current usage
        usage = subscription_manager.get_current_usage(subscription.id)
        
        return jsonify({
            'success': True,
            'subscription': {
                'id': subscription.id,
                'user_id': subscription.user_id,
                'plan_id': subscription.plan_id,
                'status': subscription.status.value,
                'billing_cycle': subscription.billing_cycle.value,
                'current_period_start': subscription.current_period_start.isoformat(),
                'current_period_end': subscription.current_period_end.isoformat(),
                'trial_end': subscription.trial_end.isoformat() if subscription.trial_end else None,
                'is_trial': subscription.is_trial,
                'is_active': subscription.is_active,
                'days_until_renewal': subscription.days_until_renewal,
                'created_at': subscription.created_at.isoformat(),
                'canceled_at': subscription.canceled_at.isoformat() if subscription.canceled_at else None
            },
            'plan': {
                'id': plan.id,
                'name': plan.name,
                'tier': plan.tier.value,
                'features': plan.features,
                'limits': plan.limits
            } if plan else None,
            'usage': usage
        })
        
    except Exception as e:
        error_response, status_code = handle_api_error(e)
        return jsonify(error_response), status_code

@app.route('/api/v1/subscriptions/<subscription_id>/cancel', methods=['POST'])
@require_api_key
@limiter.limit("5 per minute")
def cancel_subscription(subscription_id):
    """Cancel a subscription"""
    try:
        data = request.get_json() or {}
        reason = data.get('reason', 'User requested cancellation')
        immediate = data.get('immediate', False)
        
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            # Get subscription
            cursor.execute('SELECT * FROM subscriptions WHERE id = ?', (subscription_id,))
            sub_data = cursor.fetchone()
            
            if not sub_data:
                return jsonify({'error': 'Subscription not found'}), 404
            
            if sub_data['status'] == 'canceled':
                return jsonify({'error': 'Subscription already canceled'}), 400
            
            # Update subscription
            if immediate:
                # Cancel immediately
                cursor.execute('''
                    UPDATE subscriptions 
                    SET status = 'canceled', 
                        canceled_at = CURRENT_TIMESTAMP,
                        current_period_end = CURRENT_TIMESTAMP,
                        metadata = json_set(COALESCE(metadata, '{}'), '$.cancellation_reason', ?)
                    WHERE id = ?
                ''', (reason, subscription_id))
            else:
                # Cancel at period end
                cursor.execute('''
                    UPDATE subscriptions 
                    SET metadata = json_set(COALESCE(metadata, '{}'), '$.cancel_at_period_end', 1),
                        metadata = json_set(metadata, '$.cancellation_reason', ?)
                    WHERE id = ?
                ''', (reason, subscription_id))
            
            conn.commit()
        
        # Log compliance event
        subscription_manager.log_compliance_event(
            subscription_id=subscription_id,
            action='subscription_canceled',
            details={'reason': reason, 'immediate': immediate}
        )
        
        return jsonify({
            'success': True,
            'message': 'Subscription canceled successfully',
            'immediate': immediate
        })
        
    except Exception as e:
        error_response, status_code = handle_api_error(e)
        return jsonify(error_response), status_code

# ==================== ACCESS CONTROL ====================

@app.route('/api/v1/users/<user_id>/access/<resource>', methods=['GET'])
@require_api_key
@limiter.limit("100 per minute")
def check_access(user_id, resource):
    """Check if user has access to a resource"""
    try:
        if not validate_user_id(user_id):
            return jsonify({'error': 'Invalid user_id'}), 400
        
        has_access, details = subscription_manager.check_access(user_id, resource)
        
        return jsonify({
            'success': True,
            'has_access': has_access,
            'details': details,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
    except Exception as e:
        error_response, status_code = handle_api_error(e)
        return jsonify(error_response), status_code

@app.route('/api/v1/subscriptions/<subscription_id>/usage', methods=['POST'])
@require_api_key
@limiter.limit("1000 per hour")
def record_usage(subscription_id):
    """Record usage for a subscription"""
    try:
        data = request.get_json()
        
        if not data.get('resource_type'):
            return jsonify({'error': 'Missing resource_type'}), 400
        
        resource_type = data['resource_type']
        count = int(data.get('count', 1))
        
        if count <= 0:
            return jsonify({'error': 'Count must be positive'}), 400
        
        subscription_manager.record_usage(
            subscription_id=subscription_id,
            resource_type=resource_type,
            count=count
        )
        
        return jsonify({
            'success': True,
            'message': f'Recorded {count} usage for {resource_type}'
        })
        
    except Exception as e:
        error_response, status_code = handle_api_error(e)
        return jsonify(error_response), status_code

@app.route('/api/v1/subscriptions/<subscription_id>/usage', methods=['GET'])
@require_api_key
@limiter.limit("50 per minute")
def get_usage(subscription_id):
    """Get current usage for subscription"""
    try:
        usage = subscription_manager.get_current_usage(subscription_id)
        
        return jsonify({
            'success': True,
            'usage': usage,
            'subscription_id': subscription_id,
            'period': 'current_month'
        })
        
    except Exception as e:
        error_response, status_code = handle_api_error(e)
        return jsonify(error_response), status_code

# ==================== PAYMENT PROCESSING ====================

@app.route('/api/v1/payments/intent', methods=['POST'])
@require_api_key
@limiter.limit("10 per minute")
def create_payment_intent():
    """Create payment intent for subscription"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['subscription_id', 'customer_email', 'billing_address']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        subscription_id = data['subscription_id']
        customer_email = data['customer_email']
        billing_address = data['billing_address']
        provider = data.get('provider', 'stripe')
        
        # Get subscription details
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT s.*, sp.price_monthly, sp.price_yearly
                FROM subscriptions s
                JOIN subscription_plans sp ON s.plan_id = sp.id
                WHERE s.id = ?
            ''', (subscription_id,))
            
            sub_data = cursor.fetchone()
            if not sub_data:
                return jsonify({'error': 'Subscription not found'}), 404
        
        # Calculate amount based on billing cycle
        if sub_data['billing_cycle'] == 'monthly':
            amount = Decimal(str(sub_data['price_monthly']))
        elif sub_data['billing_cycle'] == 'yearly':
            amount = Decimal(str(sub_data['price_yearly']))
        else:  # quarterly
            amount = Decimal(str(sub_data['price_monthly'])) * 3 * Decimal('0.95')
        
        currency = data.get('currency', 'USD')
        
        # Create payment intent
        if provider == 'stripe':
            intent = payment_processor.create_payment_intent_stripe(
                amount=amount,
                currency=currency,
                customer_email=customer_email,
                subscription_id=subscription_id,
                billing_address=billing_address,
                metadata=data.get('metadata', {})
            )
        elif provider == 'razorpay':
            intent = payment_processor.create_payment_intent_razorpay(
                amount=amount,
                currency=currency,
                customer_email=customer_email,
                subscription_id=subscription_id,
                billing_address=billing_address,
                metadata=data.get('metadata', {})
            )
        else:
            return jsonify({'error': f'Unsupported payment provider: {provider}'}), 400
        
        return jsonify({
            'success': True,
            'payment_intent': {
                'id': intent.id,
                'amount': float(intent.amount),
                'currency': intent.currency,
                'provider': intent.provider.value,
                'client_secret': intent.client_secret,
                'status': intent.status
            }
        }), 201
        
    except Exception as e:
        error_response, status_code = handle_api_error(e)
        return jsonify(error_response), status_code

# ==================== WEBHOOK ENDPOINTS ====================

@app.route('/webhooks/stripe', methods=['POST'])
@limiter.limit("100 per minute")
def stripe_webhook():
    """Handle Stripe webhooks"""
    try:
        payload = request.get_data()
        sig_header = request.headers.get('Stripe-Signature')
        
        if not sig_header:
            return jsonify({'error': 'Missing signature'}), 400
        
        result = payment_processor.handle_stripe_webhook(
            payload=payload.decode('utf-8'),
            sig_header=sig_header
        )
        
        logger.info(f"Stripe webhook processed: {result}")
        
        return jsonify({'received': True}), 200
        
    except Exception as e:
        logger.error(f"Stripe webhook error: {e}")
        return jsonify({'error': str(e)}), 400

@app.route('/webhooks/razorpay', methods=['POST'])
@limiter.limit("100 per minute")
def razorpay_webhook():
    """Handle Razorpay webhooks"""
    try:
        payload = request.get_data()
        signature = request.headers.get('X-Razorpay-Signature')
        
        if not signature:
            return jsonify({'error': 'Missing signature'}), 400
        
        result = payment_processor.handle_razorpay_webhook(
            payload=payload.decode('utf-8'),
            signature=signature
        )
        
        logger.info(f"Razorpay webhook processed: {result}")
        
        return jsonify({'received': True}), 200
        
    except Exception as e:
        logger.error(f"Razorpay webhook error: {e}")
        return jsonify({'error': str(e)}), 400

# ==================== ANALYTICS & REPORTING ====================

@app.route('/api/v1/analytics/revenue', methods=['GET'])
@require_api_key
@limiter.limit("10 per minute")
def get_revenue_analytics():
    """Get revenue analytics"""
    try:
        days = int(request.args.get('days', 30))
        
        if days > 365:
            return jsonify({'error': 'Maximum 365 days allowed'}), 400
        
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        analytics = subscription_manager.get_revenue_analytics(start_date, end_date)
        payment_summary = payment_processor.get_revenue_summary(start_date, end_date)
        
        return jsonify({
            'success': True,
            'analytics': analytics,
            'payment_summary': payment_summary,
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'days': days
            }
        })
        
    except Exception as e:
        error_response, status_code = handle_api_error(e)
        return jsonify(error_response), status_code

# ==================== HEALTH CHECK ====================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'subscription-api',
        'version': '1.0.0',
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'features': {
            'subscription_management': 'active',
            'payment_processing': 'active',
            'webhook_handling': 'active',
            'usage_tracking': 'active',
            'analytics': 'active'
        }
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'timestamp': datetime.now(timezone.utc).isoformat()
    }), 404

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        'error': 'Rate limit exceeded',
        'retry_after': str(e.retry_after),
        'timestamp': datetime.now(timezone.utc).isoformat()
    }), 429

@app.errorhandler(500)
def server_error(error):
    logger.error(f"Server error: {error}")
    return jsonify({
        'error': 'Internal server error',
        'timestamp': datetime.now(timezone.utc).isoformat()
    }), 500

if __name__ == '__main__':
    print("🚀 Subscription API Starting...")
    print("🔑 Authentication: API Key required (X-API-Key header)")
    print("💳 Payment Providers: Stripe, Razorpay")
    print("📊 Analytics: Revenue tracking, usage monitoring")
    print("🔔 Webhooks: /webhooks/stripe, /webhooks/razorpay")
    print("\n✅ API ready at http://localhost:5008")
    
    app.run(host='0.0.0.0', port=5008, debug=True)
