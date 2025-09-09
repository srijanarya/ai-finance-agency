#!/usr/bin/env python3
"""
Billing & Subscription Management Dashboard
==========================================
Admin interface for managing subscriptions, payments, and revenue analytics

Author: TREUM ALGOTECH
Created: September 10, 2025
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, session
from flask_cors import CORS
import os
import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Any
from decimal import Decimal

from subscription_manager import (
    subscription_manager, SubscriptionTier, SubscriptionStatus, 
    BillingCycle, Subscription, SubscriptionPlan
)
from payment_processor import payment_processor, PaymentProvider
from database_helper import get_db_connection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, template_folder='templates')
app.secret_key = os.getenv('SECRET_KEY', 'treum-billing-dashboard-2025')
CORS(app)

# Admin authentication (basic - enhance for production)
ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'treum2025')

def require_admin_auth():
    """Simple admin authentication middleware"""
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin_login'))
    return None

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Admin login page"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            flash('Logged in successfully', 'success')
            return redirect(url_for('billing_dashboard'))
        else:
            flash('Invalid credentials', 'error')
    
    return render_template('admin_login.html')

@app.route('/admin/logout')
def admin_logout():
    """Admin logout"""
    session.pop('admin_logged_in', None)
    flash('Logged out successfully', 'info')
    return redirect(url_for('admin_login'))

@app.route('/')
@app.route('/admin/dashboard')
def billing_dashboard():
    """Main billing dashboard"""
    auth_redirect = require_admin_auth()
    if auth_redirect:
        return auth_redirect
    
    # Get key metrics
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=30)
    
    metrics = get_dashboard_metrics(start_date, end_date)
    
    return render_template('billing_dashboard.html', metrics=metrics)

def get_dashboard_metrics(start_date: datetime, end_date: datetime) -> Dict[str, Any]:
    """Get dashboard metrics"""
    with get_db_connection('core') as conn:
        cursor = conn.cursor()
        
        # Active subscriptions by tier
        cursor.execute('''
            SELECT sp.tier, COUNT(s.id) as count, sp.price_monthly
            FROM subscriptions s
            JOIN subscription_plans sp ON s.plan_id = sp.id
            WHERE s.status IN ('trial', 'active')
            GROUP BY sp.tier, sp.price_monthly
        ''')
        
        active_subs = {}
        total_mrr = Decimal('0')
        total_active = 0
        
        for row in cursor.fetchall():
            tier = row['tier']
            count = row['count']
            price = Decimal(str(row['price_monthly']))
            
            active_subs[tier] = {
                'count': count,
                'mrr': float(price * count),
                'price': float(price)
            }
            
            total_mrr += price * count
            total_active += count
        
        # Revenue this month
        cursor.execute('''
            SELECT SUM(amount) as revenue
            FROM payment_history
            WHERE status = 'completed' 
            AND DATE(created_at) >= DATE('now', 'start of month')
        ''')
        
        monthly_revenue = cursor.fetchone()['revenue'] or 0
        
        # New subscriptions today
        cursor.execute('''
            SELECT COUNT(*) as new_today
            FROM subscriptions
            WHERE DATE(created_at) = DATE('now')
        ''')
        
        new_today = cursor.fetchone()['new_today']
        
        # Churned subscriptions this month
        cursor.execute('''
            SELECT COUNT(*) as churned
            FROM subscriptions
            WHERE status = 'canceled'
            AND DATE(canceled_at) >= DATE('now', 'start of month')
        ''')
        
        churned_month = cursor.fetchone()['churned']
        
        # Failed payments this week
        cursor.execute('''
            SELECT COUNT(*) as failed
            FROM payment_history
            WHERE status = 'failed'
            AND DATE(created_at) >= DATE('now', '-7 days')
        ''')
        
        failed_payments = cursor.fetchone()['failed']
        
        # Payment provider breakdown
        cursor.execute('''
            SELECT payment_method, COUNT(*) as count, SUM(amount) as revenue
            FROM payment_history
            WHERE status = 'completed'
            AND DATE(created_at) >= ?
            GROUP BY payment_method
        ''', (start_date.date().isoformat(),))
        
        provider_stats = {}
        for row in cursor.fetchall():
            provider_stats[row['payment_method']] = {
                'count': row['count'],
                'revenue': float(row['revenue'] or 0)
            }
        
    return {
        'active_subscriptions': active_subs,
        'totals': {
            'active_count': total_active,
            'mrr': float(total_mrr),
            'arr': float(total_mrr * 12),
            'monthly_revenue': float(monthly_revenue),
            'new_today': new_today,
            'churned_month': churned_month,
            'failed_payments': failed_payments
        },
        'provider_stats': provider_stats,
        'last_updated': datetime.now(timezone.utc).isoformat()
    }

@app.route('/admin/subscriptions')
def list_subscriptions():
    """List all subscriptions"""
    auth_redirect = require_admin_auth()
    if auth_redirect:
        return auth_redirect
    
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))
    status_filter = request.args.get('status', 'all')
    tier_filter = request.args.get('tier', 'all')
    
    offset = (page - 1) * per_page
    
    with get_db_connection('core') as conn:
        cursor = conn.cursor()
        
        # Build query with filters
        where_conditions = []
        params = []
        
        if status_filter != 'all':
            where_conditions.append('s.status = ?')
            params.append(status_filter)
        
        if tier_filter != 'all':
            where_conditions.append('sp.tier = ?')
            params.append(tier_filter)
        
        where_clause = 'WHERE ' + ' AND '.join(where_conditions) if where_conditions else ''
        
        # Get subscriptions
        query = f'''
            SELECT s.*, sp.name as plan_name, sp.tier, sp.price_monthly
            FROM subscriptions s
            JOIN subscription_plans sp ON s.plan_id = sp.id
            {where_clause}
            ORDER BY s.created_at DESC
            LIMIT ? OFFSET ?
        '''
        
        cursor.execute(query, params + [per_page, offset])
        subscriptions = cursor.fetchall()
        
        # Get total count
        count_query = f'''
            SELECT COUNT(*) as total
            FROM subscriptions s
            JOIN subscription_plans sp ON s.plan_id = sp.id
            {where_clause}
        '''
        
        cursor.execute(count_query, params)
        total = cursor.fetchone()['total']
    
    return render_template(
        'subscriptions_list.html',
        subscriptions=subscriptions,
        page=page,
        per_page=per_page,
        total=total,
        status_filter=status_filter,
        tier_filter=tier_filter
    )

@app.route('/admin/subscription/<subscription_id>')
def subscription_detail(subscription_id):
    """Subscription detail page"""
    auth_redirect = require_admin_auth()
    if auth_redirect:
        return auth_redirect
    
    with get_db_connection('core') as conn:
        cursor = conn.cursor()
        
        # Get subscription details
        cursor.execute('''
            SELECT s.*, sp.name as plan_name, sp.tier, sp.price_monthly, sp.features
            FROM subscriptions s
            JOIN subscription_plans sp ON s.plan_id = sp.id
            WHERE s.id = ?
        ''', (subscription_id,))
        
        subscription = cursor.fetchone()
        if not subscription:
            flash('Subscription not found', 'error')
            return redirect(url_for('list_subscriptions'))
        
        # Get payment history
        payments = payment_processor.get_payment_history(subscription_id, limit=20)
        
        # Get usage data
        cursor.execute('''
            SELECT resource_type, usage_count, period_start, period_end
            FROM subscription_usage
            WHERE subscription_id = ?
            ORDER BY period_start DESC
            LIMIT 12
        ''', (subscription_id,))
        
        usage_data = cursor.fetchall()
    
    return render_template(
        'subscription_detail.html',
        subscription=subscription,
        payments=payments,
        usage_data=usage_data
    )

@app.route('/admin/subscription/<subscription_id>/cancel', methods=['POST'])
def cancel_subscription(subscription_id):
    """Cancel a subscription"""
    auth_redirect = require_admin_auth()
    if auth_redirect:
        return auth_redirect
    
    reason = request.form.get('reason', 'Admin cancellation')
    
    with get_db_connection('core') as conn:
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE subscriptions 
            SET status = 'canceled', 
                canceled_at = CURRENT_TIMESTAMP,
                metadata = json_set(COALESCE(metadata, '{}'), '$.cancellation_reason', ?)
            WHERE id = ?
        ''', (reason, subscription_id))
        
        if cursor.rowcount > 0:
            conn.commit()
            flash('Subscription canceled successfully', 'success')
            
            # Log compliance event
            subscription_manager.log_compliance_event(
                subscription_id=subscription_id,
                action='subscription_canceled_admin',
                details={'reason': reason}
            )
        else:
            flash('Subscription not found', 'error')
    
    return redirect(url_for('subscription_detail', subscription_id=subscription_id))

@app.route('/admin/payments')
def list_payments():
    """List all payments"""
    auth_redirect = require_admin_auth()
    if auth_redirect:
        return auth_redirect
    
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))
    status_filter = request.args.get('status', 'all')
    
    offset = (page - 1) * per_page
    
    with get_db_connection('core') as conn:
        cursor = conn.cursor()
        
        where_clause = ''
        params = []
        
        if status_filter != 'all':
            where_clause = 'WHERE ph.status = ?'
            params.append(status_filter)
        
        # Get payments with subscription info
        query = f'''
            SELECT ph.*, s.user_id, sp.name as plan_name
            FROM payment_history ph
            LEFT JOIN subscriptions s ON ph.subscription_id = s.id
            LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
            {where_clause}
            ORDER BY ph.created_at DESC
            LIMIT ? OFFSET ?
        '''
        
        cursor.execute(query, params + [per_page, offset])
        payments = cursor.fetchall()
        
        # Get total count
        count_query = f'''
            SELECT COUNT(*) as total
            FROM payment_history ph
            {where_clause}
        '''
        
        cursor.execute(count_query, params)
        total = cursor.fetchone()['total']
    
    return render_template(
        'payments_list.html',
        payments=payments,
        page=page,
        per_page=per_page,
        total=total,
        status_filter=status_filter
    )

@app.route('/admin/payment/<payment_id>/refund', methods=['POST'])
def process_refund(payment_id):
    """Process payment refund"""
    auth_redirect = require_admin_auth()
    if auth_redirect:
        return auth_redirect
    
    amount = request.form.get('amount')
    reason = request.form.get('reason', 'Admin refund')
    
    try:
        refund_amount = Decimal(amount) if amount else None
        
        result = payment_processor.process_refund(
            payment_id=payment_id,
            amount=refund_amount,
            reason=reason
        )
        
        flash(f'Refund processed successfully: {result["refund_id"]}', 'success')
        
    except Exception as e:
        logger.error(f"Refund processing error: {e}")
        flash(f'Refund failed: {str(e)}', 'error')
    
    return redirect(url_for('list_payments'))

@app.route('/admin/plans')
def list_plans():
    """List subscription plans"""
    auth_redirect = require_admin_auth()
    if auth_redirect:
        return auth_redirect
    
    plans = subscription_manager.get_plans(active_only=False)
    
    return render_template('plans_list.html', plans=plans)

@app.route('/admin/plan/<plan_id>/toggle', methods=['POST'])
def toggle_plan(plan_id):
    """Toggle plan active status"""
    auth_redirect = require_admin_auth()
    if auth_redirect:
        return auth_redirect
    
    with get_db_connection('core') as conn:
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE subscription_plans 
            SET is_active = NOT is_active,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (plan_id,))
        
        if cursor.rowcount > 0:
            conn.commit()
            flash('Plan status updated', 'success')
        else:
            flash('Plan not found', 'error')
    
    return redirect(url_for('list_plans'))

@app.route('/admin/analytics')
def revenue_analytics():
    """Revenue analytics page"""
    auth_redirect = require_admin_auth()
    if auth_redirect:
        return auth_redirect
    
    # Get date range from query params
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=30)
    
    # Get revenue analytics
    analytics = subscription_manager.get_revenue_analytics(start_date, end_date)
    
    # Get payment summary
    payment_summary = payment_processor.get_revenue_summary(start_date, end_date)
    
    return render_template(
        'revenue_analytics.html',
        analytics=analytics,
        payment_summary=payment_summary,
        start_date=start_date.date(),
        end_date=end_date.date()
    )

@app.route('/admin/compliance')
def compliance_dashboard():
    """Compliance and audit dashboard"""
    auth_redirect = require_admin_auth()
    if auth_redirect:
        return auth_redirect
    
    with get_db_connection('core') as conn:
        cursor = conn.cursor()
        
        # Recent compliance events
        cursor.execute('''
            SELECT cl.*, s.user_id, s.plan_id
            FROM compliance_logs cl
            LEFT JOIN subscriptions s ON cl.subscription_id = s.id
            ORDER BY cl.created_at DESC
            LIMIT 100
        ''')
        
        compliance_events = cursor.fetchall()
        
        # Compliance summary by jurisdiction
        cursor.execute('''
            SELECT jurisdiction, COUNT(*) as event_count,
                   COUNT(CASE WHEN compliance_status = 'compliant' THEN 1 END) as compliant_count
            FROM compliance_logs
            WHERE DATE(created_at) >= DATE('now', '-30 days')
            GROUP BY jurisdiction
        ''')
        
        jurisdiction_summary = cursor.fetchall()
    
    return render_template(
        'compliance_dashboard.html',
        compliance_events=compliance_events,
        jurisdiction_summary=jurisdiction_summary
    )

@app.route('/api/metrics', methods=['GET'])
def api_get_metrics():
    """API endpoint for dashboard metrics"""
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=30)
    
    metrics = get_dashboard_metrics(start_date, end_date)
    
    return jsonify(metrics)

@app.route('/api/revenue/chart', methods=['GET'])
def api_revenue_chart():
    """API endpoint for revenue chart data"""
    days = int(request.args.get('days', 30))
    
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)
    
    with get_db_connection('core') as conn:
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT DATE(created_at) as date, 
                   SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as revenue,
                   COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_payments,
                   COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments
            FROM payment_history
            WHERE DATE(created_at) BETWEEN ? AND ?
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ''', (start_date.date().isoformat(), end_date.date().isoformat()))
        
        chart_data = []
        for row in cursor.fetchall():
            chart_data.append({
                'date': row['date'],
                'revenue': float(row['revenue']),
                'successful_payments': row['successful_payments'],
                'failed_payments': row['failed_payments']
            })
    
    return jsonify(chart_data)

@app.route('/api/subscriptions/growth', methods=['GET'])
def api_subscription_growth():
    """API endpoint for subscription growth data"""
    days = int(request.args.get('days', 30))
    
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)
    
    with get_db_connection('core') as conn:
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT DATE(created_at) as date,
                   COUNT(*) as new_subscriptions
            FROM subscriptions
            WHERE DATE(created_at) BETWEEN ? AND ?
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ''', (start_date.date().isoformat(), end_date.date().isoformat()))
        
        growth_data = []
        for row in cursor.fetchall():
            growth_data.append({
                'date': row['date'],
                'new_subscriptions': row['new_subscriptions']
            })
    
    return jsonify(growth_data)

@app.errorhandler(404)
def not_found(error):
    return render_template('error.html', error='Page not found'), 404

@app.errorhandler(500)
def server_error(error):
    return render_template('error.html', error='Server error'), 500

if __name__ == '__main__':
    print("🏦 Billing Dashboard Starting...")
    print("📊 Features: Subscription Management, Payment Processing, Revenue Analytics")
    print("🔐 Admin Access: /admin/login")
    print("\n✅ Dashboard ready at http://localhost:5007")
    
    app.run(host='0.0.0.0', port=5007, debug=True)
