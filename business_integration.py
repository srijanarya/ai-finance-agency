#!/usr/bin/env python3
"""
Business Integration Module
==========================
Integrates subscription billing with existing AI Finance Agency platform
Enables immediate revenue generation and customer onboarding

Author: TREUM ALGOTECH
Created: September 10, 2025
"""

import sqlite3
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from decimal import Decimal
from dataclasses import dataclass

from subscription_manager import subscription_manager, SubscriptionTier, BillingCycle
from payment_processor import payment_processor
from database_helper import get_db_connection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class CustomerProfile:
    """Customer profile for targeted pricing"""
    user_id: str
    email: str
    engagement_score: int  # 0-100
    platform_usage: Dict[str, int]  # Feature usage counts
    signup_source: str
    country: str
    is_business: bool
    annual_volume: Optional[Decimal] = None

class BusinessIntegration:
    """Integrates subscription system with business operations"""
    
    def __init__(self):
        logger.info("Initializing Business Integration System")
    
    def onboard_trial_user(self, email: str, source: str = 'website') -> Dict[str, Any]:
        """Onboard new trial user with automatic plan assignment"""
        try:
            # Generate user ID
            user_id = f"user_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{email.split('@')[0]}"
            
            # Determine best starting plan based on source
            if source in ['linkedin', 'professional_referral']:
                plan_id = 'professional'
            elif source in ['enterprise_inquiry', 'api_docs']:
                plan_id = 'enterprise'
            else:
                plan_id = 'basic'
            
            # Create trial subscription
            subscription = subscription_manager.create_subscription(
                user_id=user_id,
                plan_id=plan_id,
                billing_cycle=BillingCycle.MONTHLY,
                trial_days=7,
                metadata={
                    'signup_source': source,
                    'onboarding_date': datetime.now(timezone.utc).isoformat()
                }
            )
            
            # Log business event
            self._log_business_event(
                event='trial_started',
                user_id=user_id,
                data={
                    'plan': plan_id,
                    'source': source,
                    'trial_ends': subscription.trial_end.isoformat() if subscription.trial_end else None
                }
            )
            
            return {
                'success': True,
                'user_id': user_id,
                'subscription_id': subscription.id,
                'plan': plan_id,
                'trial_ends': subscription.trial_end.isoformat() if subscription.trial_end else None,
                'access_granted': True
            }
            
        except Exception as e:
            logger.error(f"Trial onboarding failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def handle_platform_integration(self, user_id: str, feature: str, usage_data: Dict = None) -> Dict[str, Any]:
        """Handle feature access and usage tracking from main platform"""
        try:
            # Check user access
            has_access, details = subscription_manager.check_access(user_id, feature)
            
            if not has_access:
                return {
                    'access_granted': False,
                    'message': details.get('error', 'Access denied'),
                    'upgrade_suggestion': self._get_upgrade_suggestion(user_id, feature)
                }
            
            # Record usage if access granted
            subscription = subscription_manager.get_user_subscription(user_id)
            if subscription:
                subscription_manager.record_usage(
                    subscription_id=subscription.id,
                    resource_type=feature,
                    count=usage_data.get('count', 1) if usage_data else 1
                )
            
            return {
                'access_granted': True,
                'subscription_details': details.get('subscription', {}),
                'usage_remaining': self._calculate_usage_remaining(user_id, feature)
            }
            
        except Exception as e:
            logger.error(f"Platform integration error: {e}")
            return {
                'access_granted': False,
                'error': str(e)
            }
    
    def _get_upgrade_suggestion(self, user_id: str, blocked_feature: str) -> Dict[str, Any]:
        """Suggest appropriate plan upgrade based on blocked feature"""
        feature_plan_mapping = {
            'api_calls': 'professional',
            'advanced_analytics': 'professional',
            'custom_alerts': 'professional',
            'white_label': 'enterprise',
            'custom_integrations': 'enterprise',
            'dedicated_support': 'enterprise'
        }
        
        suggested_plan = feature_plan_mapping.get(blocked_feature, 'professional')
        plan = subscription_manager.get_plan(suggested_plan)
        
        if not plan:
            return {'message': 'Upgrade required'}
        
        return {
            'suggested_plan': suggested_plan,
            'plan_name': plan.name,
            'price_monthly': float(plan.price_monthly),
            'features': plan.features,
            'message': f'Upgrade to {plan.name} to access {blocked_feature}'
        }
    
    def _calculate_usage_remaining(self, user_id: str, resource: str) -> Dict[str, Any]:
        """Calculate remaining usage for user"""
        subscription = subscription_manager.get_user_subscription(user_id)
        if not subscription:
            return {'error': 'No active subscription'}
        
        plan = subscription_manager.get_plan(subscription.plan_id)
        if not plan:
            return {'error': 'Invalid plan'}
        
        current_usage = subscription_manager.get_current_usage(subscription.id)
        limit = plan.limits.get(resource, -1)
        used = current_usage.get(resource, 0)
        
        if limit == -1:
            return {'unlimited': True}
        
        remaining = max(0, limit - used)
        
        return {
            'limit': limit,
            'used': used,
            'remaining': remaining,
            'percentage_used': (used / limit * 100) if limit > 0 else 0
        }
    
    def generate_business_metrics(self) -> Dict[str, Any]:
        """Generate key business metrics for revenue tracking"""
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            # Current MRR by tier
            cursor.execute('''
                SELECT sp.tier, COUNT(s.id) as subscribers,
                       SUM(CASE 
                           WHEN s.billing_cycle = 'monthly' THEN sp.price_monthly
                           WHEN s.billing_cycle = 'yearly' THEN sp.price_yearly / 12
                           ELSE sp.price_monthly
                       END) as mrr
                FROM subscriptions s
                JOIN subscription_plans sp ON s.plan_id = sp.id
                WHERE s.status IN ('trial', 'active')
                GROUP BY sp.tier
            ''')
            
            mrr_by_tier = {}
            total_mrr = Decimal('0')
            total_subscribers = 0
            
            for row in cursor.fetchall():
                tier = row['tier']
                subscribers = row['subscribers']
                mrr = Decimal(str(row['mrr'] or 0))
                
                mrr_by_tier[tier] = {
                    'subscribers': subscribers,
                    'mrr': float(mrr)
                }
                
                total_mrr += mrr
                total_subscribers += subscribers
            
            # Trial conversion rate
            cursor.execute('''
                SELECT 
                    COUNT(CASE WHEN status = 'trial' THEN 1 END) as trials,
                    COUNT(CASE WHEN status = 'active' AND trial_end IS NOT NULL 
                               AND created_at >= DATE('now', '-30 days') THEN 1 END) as converted
                FROM subscriptions
                WHERE created_at >= DATE('now', '-30 days')
            ''')
            
            conversion_data = cursor.fetchone()
            trials = conversion_data['trials']
            converted = conversion_data['converted']
            conversion_rate = (converted / trials * 100) if trials > 0 else 0
            
            # Customer lifetime value estimation
            clv = self._calculate_customer_lifetime_value()
            
            return {
                'financial_metrics': {
                    'total_mrr': float(total_mrr),
                    'total_arr': float(total_mrr * 12),
                    'total_subscribers': total_subscribers,
                    'average_revenue_per_user': float(total_mrr / total_subscribers) if total_subscribers > 0 else 0
                },
                'mrr_by_tier': mrr_by_tier,
                'conversion_metrics': {
                    'trial_conversion_rate': round(conversion_rate, 2),
                    'trials_this_month': trials,
                    'conversions_this_month': converted
                },
                'growth_metrics': {
                    'customer_lifetime_value': clv,
                    'revenue_growth_rate': self._calculate_growth_rate()
                },
                'generated_at': datetime.now(timezone.utc).isoformat()
            }
    
    def _calculate_customer_lifetime_value(self) -> float:
        """Calculate estimated customer lifetime value"""
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            # Average subscription duration and revenue
            cursor.execute('''
                SELECT AVG(
                    CASE 
                        WHEN canceled_at IS NOT NULL 
                        THEN julianday(canceled_at) - julianday(created_at)
                        ELSE julianday('now') - julianday(created_at)
                    END
                ) as avg_duration_days,
                AVG(sp.price_monthly) as avg_monthly_revenue
                FROM subscriptions s
                JOIN subscription_plans sp ON s.plan_id = sp.id
                WHERE s.created_at >= DATE('now', '-90 days')
            ''')
            
            result = cursor.fetchone()
            avg_duration_days = result['avg_duration_days'] or 30
            avg_monthly_revenue = result['avg_monthly_revenue'] or 0
            
            # Convert to months and calculate CLV
            avg_duration_months = avg_duration_days / 30
            clv = avg_duration_months * avg_monthly_revenue
            
            return round(float(clv), 2)
    
    def _calculate_growth_rate(self) -> float:
        """Calculate month-over-month growth rate"""
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            # Current month MRR
            cursor.execute('''
                SELECT SUM(
                    CASE 
                        WHEN s.billing_cycle = 'monthly' THEN sp.price_monthly
                        WHEN s.billing_cycle = 'yearly' THEN sp.price_yearly / 12
                        ELSE sp.price_monthly
                    END
                ) as current_mrr
                FROM subscriptions s
                JOIN subscription_plans sp ON s.plan_id = sp.id
                WHERE s.status IN ('trial', 'active')
                AND s.created_at >= DATE('now', 'start of month')
            ''')
            
            current_mrr = cursor.fetchone()['current_mrr'] or 0
            
            # Previous month MRR
            cursor.execute('''
                SELECT SUM(
                    CASE 
                        WHEN s.billing_cycle = 'monthly' THEN sp.price_monthly
                        WHEN s.billing_cycle = 'yearly' THEN sp.price_yearly / 12
                        ELSE sp.price_monthly
                    END
                ) as previous_mrr
                FROM subscriptions s
                JOIN subscription_plans sp ON s.plan_id = sp.id
                WHERE s.status IN ('trial', 'active')
                AND s.created_at >= DATE('now', '-1 month', 'start of month')
                AND s.created_at < DATE('now', 'start of month')
            ''')
            
            previous_mrr = cursor.fetchone()['previous_mrr'] or 1
            
            if previous_mrr == 0:
                return 0.0
            
            growth_rate = ((current_mrr - previous_mrr) / previous_mrr) * 100
            return round(growth_rate, 2)
    
    def setup_automated_revenue_tracking(self):
        """Set up automated revenue tracking and reporting"""
        logger.info("Setting up automated revenue tracking")
        
        # This would typically set up cron jobs or scheduled tasks
        # For now, we'll create a simple tracking system
        
        try:
            # Update daily revenue analytics
            subscription_manager.update_daily_revenue_analytics()
            
            # Log business event
            self._log_business_event(
                event='revenue_tracking_setup',
                data={'timestamp': datetime.now(timezone.utc).isoformat()}
            )
            
            logger.info("Automated revenue tracking setup complete")
            return True
            
        except Exception as e:
            logger.error(f"Revenue tracking setup failed: {e}")
            return False
    
    def _log_business_event(self, event: str, user_id: Optional[str] = None, data: Optional[Dict] = None):
        """Log business events for analytics"""
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS business_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_type TEXT NOT NULL,
                    user_id TEXT,
                    event_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            cursor.execute('''
                INSERT INTO business_events (event_type, user_id, event_data)
                VALUES (?, ?, ?)
            ''', (event, user_id, json.dumps(data or {})))
            
            conn.commit()
    
    def generate_revenue_forecast(self, months_ahead: int = 12) -> Dict[str, Any]:
        """Generate revenue forecast based on current trends"""
        current_metrics = self.generate_business_metrics()
        current_mrr = current_metrics['financial_metrics']['total_mrr']
        growth_rate = current_metrics['growth_metrics']['revenue_growth_rate'] / 100
        
        forecast = []
        projected_mrr = current_mrr
        
        for month in range(1, months_ahead + 1):
            projected_mrr *= (1 + growth_rate)
            forecast.append({
                'month': month,
                'projected_mrr': round(projected_mrr, 2),
                'projected_arr': round(projected_mrr * 12, 2)
            })
        
        return {
            'current_mrr': current_mrr,
            'growth_rate': growth_rate * 100,
            'forecast': forecast,
            'total_projected_arr': round(forecast[-1]['projected_arr'], 2) if forecast else 0
        }
    
    def create_pricing_optimization_report(self) -> Dict[str, Any]:
        """Create report for pricing optimization"""
        with get_db_connection('core') as conn:
            cursor = conn.cursor()
            
            # Analyze plan distribution
            cursor.execute('''
                SELECT sp.tier, sp.price_monthly, COUNT(s.id) as subscribers,
                       AVG(julianday('now') - julianday(s.created_at)) as avg_tenure_days
                FROM subscriptions s
                JOIN subscription_plans sp ON s.plan_id = sp.id
                WHERE s.status IN ('trial', 'active')
                GROUP BY sp.tier, sp.price_monthly
            ''')
            
            plan_analysis = []
            for row in cursor.fetchall():
                plan_analysis.append({
                    'tier': row['tier'],
                    'price': float(row['price_monthly']),
                    'subscribers': row['subscribers'],
                    'avg_tenure_days': round(row['avg_tenure_days'], 1)
                })
            
            # Analyze upgrade patterns
            cursor.execute('''
                SELECT 
                    old_plan.tier as from_tier,
                    new_plan.tier as to_tier,
                    COUNT(*) as upgrade_count
                FROM business_events be
                JOIN subscriptions s ON be.user_id = s.user_id
                JOIN subscription_plans old_plan ON JSON_EXTRACT(be.event_data, '$.old_plan') = old_plan.id
                JOIN subscription_plans new_plan ON JSON_EXTRACT(be.event_data, '$.new_plan') = new_plan.id
                WHERE be.event_type = 'plan_upgraded'
                GROUP BY from_tier, to_tier
            ''')
            
            upgrade_patterns = []
            for row in cursor.fetchall():
                upgrade_patterns.append({
                    'from_tier': row['from_tier'],
                    'to_tier': row['to_tier'],
                    'count': row['upgrade_count']
                })
            
            return {
                'plan_analysis': plan_analysis,
                'upgrade_patterns': upgrade_patterns,
                'recommendations': self._generate_pricing_recommendations(plan_analysis),
                'generated_at': datetime.now(timezone.utc).isoformat()
            }
    
    def _generate_pricing_recommendations(self, plan_analysis: List[Dict]) -> List[str]:
        """Generate pricing optimization recommendations"""
        recommendations = []
        
        # Find most popular tier
        if plan_analysis:
            most_popular = max(plan_analysis, key=lambda x: x['subscribers'])
            recommendations.append(
                f"Most popular tier: {most_popular['tier'].title()} "
                f"(${most_popular['price']}/month, {most_popular['subscribers']} subscribers)"
            )
        
        # Analyze pricing gaps
        prices = sorted([p['price'] for p in plan_analysis])
        if len(prices) >= 2:
            gaps = [prices[i+1] - prices[i] for i in range(len(prices)-1)]
            max_gap = max(gaps)
            if max_gap > 200:
                recommendations.append(
                    f"Consider adding a plan between ${min(prices)} and ${max(prices)} "
                    f"to fill ${max_gap} pricing gap"
                )
        
        # Usage-based recommendations
        recommendations.append("Monitor usage patterns to identify upselling opportunities")
        recommendations.append("Consider introducing annual discount to improve cash flow")
        
        return recommendations

# Global instance
business_integration = BusinessIntegration()
