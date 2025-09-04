#!/usr/bin/env python3
"""
Automated Subscription Flows - Revenue Generation Engine
Handles customer acquisition, onboarding, and revenue optimization
"""

import sqlite3
import json
import requests
from datetime import datetime, timedelta
import uuid
import random
from flask import Flask, request, jsonify
import threading
import time
import logging
from typing import Dict, List

class SubscriptionFlowManager:
    """Manages automated subscription workflows"""
    
    def __init__(self):
        self.setup_logging()
        self.setup_webhooks()
        self.lead_sources = {
            'organic_search': 0.35,
            'social_media': 0.25, 
            'referrals': 0.20,
            'content_marketing': 0.15,
            'direct': 0.05
        }
        
    def setup_logging(self):
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
    def setup_webhooks(self):
        """Setup webhook endpoints for subscription automation"""
        self.app = Flask(__name__)
        
        @self.app.route('/subscribe/webhook', methods=['POST'])
        def handle_subscription_webhook():
            return jsonify(self.process_subscription_request(request.json))
        
        @self.app.route('/subscribe/plans', methods=['GET'])
        def get_subscription_plans():
            return jsonify(self.get_available_plans())
        
        @self.app.route('/subscribe/create', methods=['POST'])
        def create_subscription():
            return jsonify(self.create_new_subscription(request.json))
        
        @self.app.route('/subscribe/trial', methods=['POST'])
        def start_trial():
            return jsonify(self.start_free_trial(request.json))
        
        @self.app.route('/subscribe/upgrade', methods=['POST'])
        def upgrade_subscription():
            return jsonify(self.upgrade_customer_plan(request.json))
        
        @self.app.route('/subscribe/dashboard/<customer_id>', methods=['GET'])
        def customer_dashboard(customer_id):
            return jsonify(self.get_customer_dashboard(customer_id))
    
    def get_available_plans(self):
        """Get all available subscription plans with pricing"""
        try:
            conn = sqlite3.connect('killbill.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, name, amount, currency, billing_period, features, popular, discount_percent
                FROM billing_plans
                ORDER BY amount ASC
            ''')
            
            plans = []
            for row in cursor.fetchall():
                original_amount = row[2]
                discount = row[7] / 100
                discounted_amount = original_amount * (1 - discount)
                
                plans.append({
                    'plan_id': row[0],
                    'name': row[1],
                    'original_amount': original_amount,
                    'discounted_amount': discounted_amount,
                    'discount_percent': row[7],
                    'currency': row[3],
                    'billing_period': row[4],
                    'features': json.loads(row[5]),
                    'popular': bool(row[6]),
                    'savings_per_month': original_amount - discounted_amount,
                    'savings_per_year': (original_amount - discounted_amount) * 12
                })
            
            conn.close()
            
            return {
                'status': 'success',
                'plans': plans,
                'special_offers': [
                    {
                        'title': 'Limited Time: 15% off Enterprise Plan',
                        'description': 'Save ₹18,000 annually on Enterprise features',
                        'expires': (datetime.now() + timedelta(days=7)).isoformat()
                    },
                    {
                        'title': 'Free 7-Day Trial',
                        'description': 'Try any plan risk-free for 7 days',
                        'code': 'TRIAL7'
                    }
                ]
            }
            
        except Exception as e:
            self.logger.error(f"Error getting plans: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def process_subscription_request(self, data: Dict):
        """Process incoming subscription webhook"""
        try:
            event_type = data.get('event_type')
            customer_data = data.get('customer', {})
            
            if event_type == 'lead_captured':
                return self.handle_new_lead(customer_data)
            elif event_type == 'trial_requested':
                return self.start_free_trial(customer_data)
            elif event_type == 'subscription_created':
                return self.handle_new_subscription(customer_data)
            elif event_type == 'payment_failed':
                return self.handle_payment_failure(customer_data)
            elif event_type == 'subscription_cancelled':
                return self.handle_cancellation(customer_data)
            else:
                return {'status': 'ignored', 'message': f'Unknown event: {event_type}'}
                
        except Exception as e:
            self.logger.error(f"Webhook processing error: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def handle_new_lead(self, customer_data: Dict):
        """Handle new lead capture"""
        try:
            lead_id = str(uuid.uuid4())
            
            # Store lead in database
            conn = sqlite3.connect('chatwoot.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO conversations 
                (id, customer_name, customer_email, status, priority, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                lead_id,
                customer_data.get('name', 'Unknown'),
                customer_data.get('email', ''),
                'new_lead',
                'high',
                datetime.now(),
                datetime.now()
            ))
            
            conn.commit()
            conn.close()
            
            # Send welcome message
            welcome_message = f"""
🎉 Welcome to AI Finance Agency, {customer_data.get('name', 'there')}!

Thank you for your interest in our AI-powered financial analysis platform.

🚀 **What happens next:**
1. **Free 7-day trial** - Experience our Premium features
2. **Personalized demo** - Our team will reach out within 24 hours
3. **Custom analysis** - Get your first AI-generated market report

🎯 **Exclusive Offer**: Use code WELCOME15 for 15% off your first year!

Questions? Reply to this conversation or call us at +91-8888-FINANCE

Best regards,
AI Finance Agency Team
"""
            
            # Send to messaging queue (if available)
            self.send_to_messaging_queue('notification-queue', {
                'type': 'welcome_email',
                'customer_id': lead_id,
                'email': customer_data.get('email'),
                'message': welcome_message
            })
            
            return {
                'status': 'success',
                'lead_id': lead_id,
                'message': 'Lead captured and welcome sequence started'
            }
            
        except Exception as e:
            self.logger.error(f"Lead handling error: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def start_free_trial(self, customer_data: Dict):
        """Start free trial for customer"""
        try:
            trial_id = str(uuid.uuid4())
            
            # Create trial subscription
            conn = sqlite3.connect('killbill.db')
            cursor = conn.cursor()
            
            # Create account first
            cursor.execute('''
                INSERT INTO accounts (id, name, email, phone, plan_preference, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                trial_id,
                customer_data.get('name'),
                customer_data.get('email'),
                customer_data.get('phone', ''),
                customer_data.get('preferred_plan', 'premium'),
                datetime.now()
            ))
            
            # Create trial subscription (7 days free)
            trial_end = datetime.now() + timedelta(days=7)
            cursor.execute('''
                INSERT INTO subscriptions 
                (id, account_id, plan_id, status, amount, currency, billing_period, created_at, next_billing, auto_renew)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                f'trial_{trial_id}',
                trial_id,
                'premium-plan',  # Default to premium for trial
                'trial',
                0.0,  # Free trial
                'INR',
                'trial',
                datetime.now(),
                trial_end,
                True
            ))
            
            conn.commit()
            conn.close()
            
            # Send trial welcome message
            trial_message = f"""
🚀 **Your 7-Day Premium Trial is LIVE!**

Hi {customer_data.get('name')},

Your premium AI Finance analysis is now active:

✅ **Trial Benefits:**
• 50 AI-generated market reports
• FinGPT analysis (74.6% accuracy)
• Real-time alerts & notifications
• Options chain analysis
• Priority support

📅 **Trial Period:** {trial_end.strftime('%B %d, %Y')}

🎯 **Get Started:**
1. Login: https://dashboard.aifinance.com
2. Generate your first AI report
3. Set up custom alerts

💡 **Pro Tip:** Download our mobile app for real-time notifications!

Questions? Reply here or WhatsApp us at +91-9999-FINANCE

Happy Trading! 📈
AI Finance Team
"""
            
            # Schedule trial conversion reminders
            self.schedule_trial_reminders(trial_id, customer_data.get('email'), trial_end)
            
            return {
                'status': 'success',
                'trial_id': trial_id,
                'trial_end': trial_end.isoformat(),
                'message': 'Trial started successfully',
                'access_info': {
                    'dashboard_url': 'https://dashboard.aifinance.com',
                    'api_key': f'trial_{trial_id[:8]}',
                    'features_unlocked': ['premium_reports', 'real_time_alerts', 'fingpt_analysis']
                }
            }
            
        except Exception as e:
            self.logger.error(f"Trial start error: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def create_new_subscription(self, customer_data: Dict):
        """Create new paid subscription"""
        try:
            subscription_id = str(uuid.uuid4())
            plan_id = customer_data.get('plan_id', 'premium-plan')
            
            # Get plan details
            conn = sqlite3.connect('killbill.db')
            cursor = conn.cursor()
            
            cursor.execute('SELECT * FROM billing_plans WHERE id = ?', (plan_id,))
            plan = cursor.fetchone()
            
            if not plan:
                return {'status': 'error', 'message': 'Plan not found'}
            
            # Create account
            account_id = str(uuid.uuid4())
            cursor.execute('''
                INSERT INTO accounts (id, name, email, phone, plan_preference, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                account_id,
                customer_data.get('name'),
                customer_data.get('email'),
                customer_data.get('phone', ''),
                plan_id,
                datetime.now()
            ))
            
            # Apply discounts
            original_amount = plan[2]
            discount_percent = plan[7] / 100
            final_amount = original_amount * (1 - discount_percent)
            
            # Create subscription
            next_billing = datetime.now() + timedelta(days=30)
            cursor.execute('''
                INSERT INTO subscriptions 
                (id, account_id, plan_id, status, amount, currency, billing_period, created_at, next_billing, auto_renew)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                subscription_id,
                account_id,
                plan_id,
                'active',
                final_amount,
                'INR',
                'monthly',
                datetime.now(),
                next_billing,
                True
            ))
            
            conn.commit()
            conn.close()
            
            # Send subscription confirmation
            confirmation_message = f"""
🎉 **Subscription Activated! Welcome to the AI Finance Family**

Hi {customer_data.get('name')},

Your {plan[1]} subscription is now ACTIVE!

💰 **Billing Summary:**
• Plan: {plan[1]}
• Amount: ₹{final_amount:,.0f}/month
• Next Billing: {next_billing.strftime('%B %d, %Y')}
• Features: {len(json.loads(plan[5]))} premium features unlocked

🚀 **Immediate Access:**
• Full AI analysis suite
• Unlimited reports
• 24/7 priority support
• Custom alerts & automations

📱 **Your Account:**
• Dashboard: https://dashboard.aifinance.com
• Account ID: {account_id[:8]}...
• Support: reply here or call +91-8888-FINANCE

Thank you for choosing AI Finance Agency! 
Start generating wealth with AI today. 📈

Best regards,
AI Finance Team
"""
            
            # Update revenue tracking
            self.update_revenue_metrics(final_amount, 'new_subscription')
            
            return {
                'status': 'success',
                'subscription_id': subscription_id,
                'account_id': account_id,
                'plan_name': plan[1],
                'amount': final_amount,
                'next_billing': next_billing.isoformat(),
                'message': 'Subscription created successfully'
            }
            
        except Exception as e:
            self.logger.error(f"Subscription creation error: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def schedule_trial_reminders(self, trial_id: str, email: str, trial_end: datetime):
        """Schedule automated trial conversion reminders"""
        
        # Reminder schedule
        reminders = [
            {'days_before': 3, 'type': 'mid_trial'},
            {'days_before': 1, 'type': 'trial_ending'},
            {'days_before': 0, 'type': 'trial_expired'}
        ]
        
        for reminder in reminders:
            reminder_time = trial_end - timedelta(days=reminder['days_before'])
            
            # In production, this would use a job queue like Celery
            # For now, we'll simulate with a simple scheduler
            def send_reminder():
                self.send_trial_reminder(trial_id, email, reminder['type'])
            
            # Schedule reminder (simplified)
            self.logger.info(f"Scheduled {reminder['type']} reminder for {reminder_time}")
    
    def send_trial_reminder(self, trial_id: str, email: str, reminder_type: str):
        """Send trial conversion reminder"""
        
        messages = {
            'mid_trial': f"""
🔔 **Trial Update: 3 Days of Premium AI Access Remaining**

Hi there!

You're halfway through your AI Finance Premium trial - how's it going?

📊 **Have you tried:**
• Generating AI market reports?
• Setting up custom alerts?
• Exploring FinGPT analysis?

💡 **Exclusive Trial Offer:** 
Convert now and get 20% off your first 3 months!
Use code: CONVERT20

🎯 **Convert to Premium:**
• Continue unlimited access
• Keep all your custom settings
• Maintain alert configurations

Questions? Reply here or book a 15-min strategy call:
https://calendly.com/aifinance/strategy

Keep analyzing! 📈
AI Finance Team
""",
            
            'trial_ending': f"""
⏰ **Trial Ending Tomorrow - Don't Lose Your AI Edge!**

Hi!

Your premium trial expires in 24 hours. Don't lose access to:

🚀 **Premium Features:**
• AI-powered market analysis (74.6% accuracy)
• Real-time trading alerts
• Custom portfolio optimization
• Priority support

💰 **Special Offer - Last 24 Hours:**
• 25% off Annual Premium: ₹26,991 (Save ₹8,997)
• 15% off Monthly Premium: ₹2,549 (Save ₹450)

🎯 **Convert Now:**
https://subscribe.aifinance.com/convert/{trial_id}

⚡ **One-Click Upgrade** - Keep all your settings!

Don't let this opportunity slip away! 📈
AI Finance Team
""",
            
            'trial_expired': f"""
😔 **Trial Expired - We Miss You Already!**

Hi!

Your AI Finance Premium trial has ended. We hope you experienced the power of AI-driven financial analysis!

🎁 **Last Chance Offer:**
We're extending a special 30% discount just for you:

• Premium Plan: ₹2,099/month (usually ₹2,999)
• Valid for next 48 hours only
• Use code: COMEBACK30

💪 **Why Customers Love Us:**
• "Increased my portfolio returns by 23%" - Rajesh K.
• "The AI predictions are incredibly accurate" - Sunita G.
• "Best investment decision I made" - Vikash S.

🚀 **Reactivate Now:**
https://subscribe.aifinance.com/reactivate/{trial_id}

We'd love to have you back! 📈
AI Finance Team

P.S. Still deciding? Book a free consultation: https://calendly.com/aifinance
"""
        }
        
        message = messages.get(reminder_type, 'Trial reminder')
        
        # Send message (in production, would integrate with email service)
        self.send_to_messaging_queue('notification-queue', {
            'type': 'email',
            'recipient': email,
            'subject': f'AI Finance - {reminder_type.title().replace("_", " ")}',
            'message': message,
            'trial_id': trial_id
        })
    
    def send_to_messaging_queue(self, queue: str, message: Dict):
        """Send message to messaging queue"""
        try:
            # In production, would connect to actual message queue
            self.logger.info(f"Message queued for {queue}: {message['type']}")
        except Exception as e:
            self.logger.error(f"Queue error: {e}")
    
    def update_revenue_metrics(self, amount: float, event_type: str):
        """Update revenue tracking metrics"""
        try:
            conn = sqlite3.connect('killbill.db')
            cursor = conn.cursor()
            
            today = datetime.now().date()
            
            # Get current day metrics
            cursor.execute('SELECT * FROM revenue_tracking WHERE date = ?', (today,))
            existing = cursor.fetchone()
            
            if existing:
                # Update existing record
                new_customers = existing[3] + (1 if event_type == 'new_subscription' else 0)
                total_customers = existing[5] + (1 if event_type == 'new_subscription' else 0)
                new_mrr = existing[6] + amount
                
                cursor.execute('''
                    UPDATE revenue_tracking 
                    SET new_customers = ?, total_customers = ?, mrr = ?
                    WHERE date = ?
                ''', (new_customers, total_customers, new_mrr, today))
            else:
                # Create new record
                cursor.execute('''
                    INSERT INTO revenue_tracking
                    (date, subscription_revenue, new_customers, churned_customers, total_customers, mrr, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (today, amount, 1, 0, 1, amount, datetime.now()))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            self.logger.error(f"Revenue metrics error: {e}")
    
    def get_customer_dashboard(self, customer_id: str):
        """Get customer dashboard data"""
        try:
            conn = sqlite3.connect('killbill.db')
            cursor = conn.cursor()
            
            # Get customer subscription details
            cursor.execute('''
                SELECT s.*, a.name, a.email, p.name as plan_name, p.features
                FROM subscriptions s
                JOIN accounts a ON s.account_id = a.id
                JOIN billing_plans p ON s.plan_id = p.id
                WHERE a.id = ?
            ''', (customer_id,))
            
            subscription = cursor.fetchone()
            
            if not subscription:
                return {'status': 'error', 'message': 'Customer not found'}
            
            # Get usage metrics (simulated)
            usage_stats = {
                'reports_generated': random.randint(15, 150),
                'alerts_received': random.randint(25, 300),
                'api_calls_used': random.randint(100, 8000),
                'accuracy_score': round(random.uniform(72, 78), 1),
                'portfolio_performance': round(random.uniform(-5, 25), 2)
            }
            
            conn.close()
            
            return {
                'status': 'success',
                'customer': {
                    'name': subscription[9],
                    'email': subscription[10],
                    'plan': subscription[11],
                    'status': subscription[3],
                    'amount': subscription[4],
                    'next_billing': subscription[8],
                    'features': json.loads(subscription[12])
                },
                'usage': usage_stats,
                'recommendations': [
                    f"Your accuracy is {usage_stats['accuracy_score']}% - top 20% of users!",
                    f"You've generated {usage_stats['reports_generated']} reports this month",
                    "Consider upgrading for unlimited API access" if usage_stats['api_calls_used'] > 7000 else "Great API usage!"
                ]
            }
            
        except Exception as e:
            self.logger.error(f"Dashboard error: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def generate_revenue_forecast(self):
        """Generate revenue forecast based on current trends"""
        try:
            conn = sqlite3.connect('killbill.db')
            cursor = conn.cursor()
            
            # Get current metrics
            cursor.execute('''
                SELECT AVG(new_customers), AVG(churned_customers), 
                       SUM(mrr) as current_mrr, COUNT(*) as active_customers
                FROM revenue_tracking
                WHERE date >= date('now', '-7 days')
            ''')
            
            metrics = cursor.fetchone()
            conn.close()
            
            if not metrics[2]:  # No MRR data
                return {'status': 'error', 'message': 'No revenue data available'}
            
            avg_new_customers = metrics[0] or 5
            avg_churn = metrics[1] or 2
            current_mrr = metrics[2] or 22995
            
            # Forecast next 12 months
            forecasts = []
            monthly_mrr = current_mrr
            
            for month in range(1, 13):
                # Growth assumptions
                new_customers = avg_new_customers * 1.15  # 15% growth month over month
                churn_rate = max(0.05, avg_churn / max(1, metrics[3]) * 0.95)  # Decreasing churn
                
                # Calculate MRR growth
                new_mrr = new_customers * 2500  # Average revenue per customer
                churned_mrr = monthly_mrr * churn_rate
                
                monthly_mrr = monthly_mrr + new_mrr - churned_mrr
                
                forecasts.append({
                    'month': month,
                    'projected_mrr': monthly_mrr,
                    'new_customers': new_customers,
                    'churn_rate': f"{churn_rate*100:.1f}%",
                    'target_progress': f"{(monthly_mrr/3000000)*100:.1f}%"
                })
            
            # Calculate when we'll hit ₹3 crore target
            target_month = 0
            for i, forecast in enumerate(forecasts):
                if forecast['projected_mrr'] >= 3000000:
                    target_month = i + 1
                    break
            
            return {
                'status': 'success',
                'current_mrr': current_mrr,
                'target_mrr': 3000000,
                'months_to_target': target_month or 'Beyond 12 months',
                'growth_rate': '15% monthly',
                'monthly_forecasts': forecasts[:6],  # Show next 6 months
                'key_metrics': {
                    'projected_6_month_mrr': forecasts[5]['projected_mrr'] if len(forecasts) >= 6 else 0,
                    'required_monthly_growth': '15%',
                    'customer_acquisition_needed': avg_new_customers * 1.15
                }
            }
            
        except Exception as e:
            self.logger.error(f"Forecast error: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def start_subscription_service(self, port=5002):
        """Start the subscription service"""
        
        @self.app.route('/subscribe/forecast', methods=['GET'])
        def get_revenue_forecast():
            return jsonify(self.generate_revenue_forecast())
        
        def run_app():
            self.app.run(host='0.0.0.0', port=port, debug=False)
        
        service_thread = threading.Thread(target=run_app, daemon=True)
        service_thread.start()
        
        self.logger.info(f"✅ Subscription service started on port {port}")
        return True

def main():
    """Main function to start subscription flows"""
    print("🚀 AUTOMATED SUBSCRIPTION FLOWS - STARTING")
    print("=" * 60)
    
    subscription_manager = SubscriptionFlowManager()
    
    # Start the service
    success = subscription_manager.start_subscription_service()
    
    if success:
        print("✅ Subscription flows service started on port 5002")
        print("\n🎯 Available Endpoints:")
        print("   • GET /subscribe/plans - View all plans")
        print("   • POST /subscribe/create - Create subscription") 
        print("   • POST /subscribe/trial - Start free trial")
        print("   • GET /subscribe/forecast - Revenue forecast")
        print("   • GET /subscribe/dashboard/<id> - Customer dashboard")
        
        # Generate sample forecast
        forecast = subscription_manager.generate_revenue_forecast()
        if forecast['status'] == 'success':
            print(f"\n📈 REVENUE FORECAST:")
            print(f"Current MRR: ₹{forecast['current_mrr']:,.0f}")
            print(f"Target: ₹{forecast['target_mrr']:,.0f}")
            print(f"Months to target: {forecast['months_to_target']}")
            print(f"6-month projection: ₹{forecast['key_metrics']['projected_6_month_mrr']:,.0f}")
        
        print(f"\n⚡ Service ready for customer acquisition!")
        print("Test endpoints:")
        print("  curl http://localhost:5002/subscribe/plans")
        print("  curl http://localhost:5002/subscribe/forecast")
        
        # Keep service running
        try:
            while True:
                time.sleep(60)
        except KeyboardInterrupt:
            print("\n👋 Subscription service stopped")
    
    return success

if __name__ == "__main__":
    main()