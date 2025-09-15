"""
TalkingPhoto AI MVP - Premium Subscription Management
Manages HeyGen Premium subscriptions and tier-based feature access
"""

import stripe
import json
import sqlite3
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
from redis import Redis
from config import Config

# Configure Stripe
stripe.api_key = Config.STRIPE_SECRET_KEY

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PremiumTier(Enum):
    """Premium tier definitions for HeyGen access"""
    FREE = "free"
    STANDARD = "standard"  # Veo3 access
    PREMIUM = "premium"    # HeyGen access
    ENTERPRISE = "enterprise"  # Full access


class ServiceProvider(Enum):
    """Available video generation providers"""
    VEO3 = "veo3"
    HEYGEN = "heygen"


@dataclass
class PremiumPlan:
    """Premium subscription plan configuration"""
    tier: PremiumTier
    name: str
    price_monthly_usd: float
    price_monthly_inr: float
    features: List[str]
    video_provider: ServiceProvider
    monthly_credits: int
    video_quality: str
    support_level: str
    stripe_price_id: str


class PremiumSubscriptionService:
    """
    Manages premium subscriptions with HeyGen access
    Handles tier-based routing between Veo3 (standard) and HeyGen (premium)
    """
    
    def __init__(self):
        self.db_path = "data/premium_subscriptions.db"
        self.redis_client = Redis(decode_responses=True)
        self.init_database()
        self.premium_plans = self._load_premium_plans()
    
    def init_database(self):
        """Initialize premium subscription database"""
        import os
        os.makedirs("data", exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Premium subscriptions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS premium_subscriptions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_email TEXT UNIQUE NOT NULL,
                    stripe_customer_id TEXT,
                    stripe_subscription_id TEXT,
                    tier TEXT NOT NULL DEFAULT 'free',
                    provider_access TEXT NOT NULL DEFAULT 'veo3',
                    monthly_credits INTEGER DEFAULT 3,
                    used_credits INTEGER DEFAULT 0,
                    subscription_status TEXT DEFAULT 'inactive',
                    current_period_start TIMESTAMP,
                    current_period_end TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Usage tracking table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS premium_usage (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_email TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    service_type TEXT NOT NULL, -- 'video_generation', 'avatar_creation'
                    credits_used INTEGER DEFAULT 1,
                    quality_tier TEXT,
                    duration REAL,
                    cost_usd REAL,
                    metadata TEXT, -- JSON string
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # A/B testing results table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS quality_comparison (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_email TEXT NOT NULL,
                    test_id TEXT NOT NULL,
                    veo3_video_id TEXT,
                    heygen_video_id TEXT,
                    user_preference TEXT, -- 'veo3', 'heygen', 'no_preference'
                    quality_rating_veo3 INTEGER, -- 1-10 scale
                    quality_rating_heygen INTEGER, -- 1-10 scale
                    feedback_text TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()
    
    def _load_premium_plans(self) -> Dict[PremiumTier, PremiumPlan]:
        """Load premium subscription plans"""
        return {
            PremiumTier.FREE: PremiumPlan(
                tier=PremiumTier.FREE,
                name="Free Trial",
                price_monthly_usd=0.0,
                price_monthly_inr=0.0,
                features=[
                    "3 free video generations",
                    "Veo3 AI technology",
                    "720p HD quality",
                    "Basic voice options",
                    "WhatsApp support"
                ],
                video_provider=ServiceProvider.VEO3,
                monthly_credits=3,
                video_quality="720p",
                support_level="community",
                stripe_price_id=""
            ),
            PremiumTier.STANDARD: PremiumPlan(
                tier=PremiumTier.STANDARD,
                name="Standard Plan - Veo3 Pro",
                price_monthly_usd=19.0,
                price_monthly_inr=1599.0,
                features=[
                    "50 video generations per month",
                    "Veo3 AI technology",
                    "1080p Full HD quality",
                    "Premium voice options",
                    "Priority support",
                    "Commercial usage rights",
                    "No watermark"
                ],
                video_provider=ServiceProvider.VEO3,
                monthly_credits=50,
                video_quality="1080p",
                support_level="email",
                stripe_price_id="price_veo3_standard_monthly"
            ),
            PremiumTier.PREMIUM: PremiumPlan(
                tier=PremiumTier.PREMIUM,
                name="Premium Plan - HeyGen Pro",
                price_monthly_usd=29.0,
                price_monthly_inr=2399.0,
                features=[
                    "25 premium video generations per month",
                    "HeyGen AI technology",
                    "Professional avatars library",
                    "1080p Full HD quality",
                    "Custom avatar creation",
                    "Professional voice cloning",
                    "Priority support",
                    "Commercial usage rights",
                    "Advanced customization"
                ],
                video_provider=ServiceProvider.HEYGEN,
                monthly_credits=25,
                video_quality="1080p",
                support_level="priority",
                stripe_price_id="price_heygen_premium_monthly"
            ),
            PremiumTier.ENTERPRISE: PremiumPlan(
                tier=PremiumTier.ENTERPRISE,
                name="Enterprise Plan - Full Access",
                price_monthly_usd=99.0,
                price_monthly_inr=8299.0,
                features=[
                    "Unlimited video generations",
                    "Both Veo3 & HeyGen access",
                    "4K Ultra HD quality",
                    "Full avatar library",
                    "Custom voice training",
                    "White-label solution",
                    "24/7 dedicated support",
                    "API access",
                    "Custom integrations",
                    "SLA guarantee"
                ],
                video_provider=ServiceProvider.HEYGEN,  # Primary, but has both
                monthly_credits=999,
                video_quality="4K",
                support_level="dedicated",
                stripe_price_id="price_enterprise_monthly"
            )
        }
    
    def create_premium_subscription(self, user_email: str, tier: PremiumTier, 
                                  billing_cycle: str = "monthly") -> str:
        """Create premium subscription checkout session"""
        try:
            plan = self.premium_plans[tier]
            
            if tier == PremiumTier.FREE:
                # Handle free tier signup
                return self._setup_free_tier(user_email)
            
            # Create Stripe customer if needed
            customer_id = self._get_or_create_customer(user_email)
            
            # Create checkout session
            checkout_session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=['card', 'upi'] if 'inr' in billing_cycle.lower() else ['card'],
                line_items=[{
                    'price': plan.stripe_price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=f'https://talkingphoto.in/premium/success?session_id={{CHECKOUT_SESSION_ID}}&tier={tier.value}',
                cancel_url='https://talkingphoto.in/premium/cancel',
                allow_promotion_codes=True,
                metadata={
                    'tier': tier.value,
                    'user_email': user_email,
                    'provider': plan.video_provider.value,
                    'service': 'talkingphoto_premium'
                }
            )
            
            logger.info(f"Created premium subscription checkout for {user_email}: {tier.value}")
            return checkout_session.url
            
        except Exception as e:
            logger.error(f"Failed to create premium subscription: {str(e)}")
            raise
    
    def _setup_free_tier(self, user_email: str) -> str:
        """Setup free tier access"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    INSERT OR REPLACE INTO premium_subscriptions 
                    (user_email, tier, provider_access, monthly_credits, subscription_status)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    user_email, PremiumTier.FREE.value, ServiceProvider.VEO3.value, 3, 'active'
                ))
                
                conn.commit()
            
            # Cache tier access
            self.redis_client.setex(f"user_tier:{user_email}", 3600, PremiumTier.FREE.value)
            
            return "free_tier_activated"
            
        except Exception as e:
            logger.error(f"Failed to setup free tier: {str(e)}")
            raise
    
    def handle_subscription_success(self, session_id: str):
        """Handle successful premium subscription payment"""
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            user_email = session.metadata['user_email']
            tier = PremiumTier(session.metadata['tier'])
            provider = ServiceProvider(session.metadata['provider'])
            
            subscription = stripe.Subscription.retrieve(session.subscription)
            plan = self.premium_plans[tier]
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    INSERT OR REPLACE INTO premium_subscriptions (
                        user_email, stripe_customer_id, stripe_subscription_id,
                        tier, provider_access, monthly_credits, subscription_status,
                        current_period_start, current_period_end
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    user_email, session.customer, subscription.id,
                    tier.value, provider.value, plan.monthly_credits, 'active',
                    datetime.fromtimestamp(subscription.current_period_start),
                    datetime.fromtimestamp(subscription.current_period_end)
                ))
                
                conn.commit()
            
            # Cache tier access
            self.redis_client.setex(f"user_tier:{user_email}", 3600, tier.value)
            self.redis_client.setex(f"user_provider:{user_email}", 3600, provider.value)
            
            logger.info(f"Premium subscription activated: {user_email} -> {tier.value}")
            
        except Exception as e:
            logger.error(f"Failed to handle subscription success: {str(e)}")
            raise
    
    def get_user_tier(self, user_email: str) -> PremiumTier:
        """Get user's current subscription tier"""
        try:
            # Check cache first
            cached_tier = self.redis_client.get(f"user_tier:{user_email}")
            if cached_tier:
                return PremiumTier(cached_tier)
            
            # Check database
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT tier FROM premium_subscriptions WHERE user_email = ? AND subscription_status = 'active'",
                    (user_email,)
                )
                result = cursor.fetchone()
                
                if result:
                    tier = PremiumTier(result[0])
                    # Cache result
                    self.redis_client.setex(f"user_tier:{user_email}", 3600, tier.value)
                    return tier
            
            return PremiumTier.FREE
            
        except Exception as e:
            logger.error(f"Failed to get user tier: {str(e)}")
            return PremiumTier.FREE
    
    def get_optimal_provider(self, user_email: str) -> ServiceProvider:
        """Get optimal video provider based on user tier"""
        tier = self.get_user_tier(user_email)
        plan = self.premium_plans[tier]
        return plan.video_provider
    
    def can_use_heygen(self, user_email: str) -> bool:
        """Check if user can access HeyGen premium service"""
        tier = self.get_user_tier(user_email)
        return tier in [PremiumTier.PREMIUM, PremiumTier.ENTERPRISE]
    
    def use_credit(self, user_email: str, provider: ServiceProvider) -> bool:
        """Use a credit for video generation"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Check current credits
                cursor.execute(
                    "SELECT monthly_credits, used_credits FROM premium_subscriptions WHERE user_email = ?",
                    (user_email,)
                )
                result = cursor.fetchone()
                
                if not result:
                    return False
                
                monthly_credits, used_credits = result
                remaining_credits = monthly_credits - used_credits
                
                if remaining_credits <= 0:
                    return False
                
                # Use credit
                cursor.execute(
                    "UPDATE premium_subscriptions SET used_credits = used_credits + 1 WHERE user_email = ?",
                    (user_email,)
                )
                
                # Track usage
                cursor.execute("""
                    INSERT INTO premium_usage (
                        user_email, provider, service_type, credits_used
                    ) VALUES (?, ?, ?, ?)
                """, (user_email, provider.value, 'video_generation', 1))
                
                conn.commit()
                return True
                
        except Exception as e:
            logger.error(f"Failed to use credit: {str(e)}")
            return False
    
    def get_user_credits(self, user_email: str) -> Dict[str, int]:
        """Get user's credit information"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT monthly_credits, used_credits FROM premium_subscriptions WHERE user_email = ?",
                    (user_email,)
                )
                result = cursor.fetchone()
                
                if result:
                    monthly_credits, used_credits = result
                    return {
                        'monthly_credits': monthly_credits,
                        'used_credits': used_credits,
                        'remaining_credits': monthly_credits - used_credits
                    }
                
                return {'monthly_credits': 0, 'used_credits': 0, 'remaining_credits': 0}
                
        except Exception as e:
            logger.error(f"Failed to get user credits: {str(e)}")
            return {'monthly_credits': 0, 'used_credits': 0, 'remaining_credits': 0}
    
    def create_ab_test(self, user_email: str, script_text: str) -> Dict[str, Any]:
        """Create A/B test comparing Veo3 vs HeyGen quality"""
        try:
            test_id = f"abtest_{user_email}_{int(datetime.now().timestamp())}"
            
            # Store test info in Redis
            test_data = {
                'test_id': test_id,
                'user_email': user_email,
                'script_text': script_text,
                'status': 'active',
                'created_at': datetime.now().isoformat()
            }
            
            self.redis_client.setex(f"ab_test:{test_id}", 86400, json.dumps(test_data))  # 24 hours
            
            return {
                'success': True,
                'test_id': test_id,
                'message': 'A/B test created. Generate videos with both providers to compare.'
            }
            
        except Exception as e:
            logger.error(f"Failed to create A/B test: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def submit_quality_feedback(self, test_id: str, veo3_rating: int, 
                               heygen_rating: int, preference: str,
                               feedback_text: str = "") -> bool:
        """Submit quality comparison feedback"""
        try:
            # Get test data
            test_data = self.redis_client.get(f"ab_test:{test_id}")
            if not test_data:
                return False
            
            test_info = json.loads(test_data)
            user_email = test_info['user_email']
            
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    INSERT INTO quality_comparison (
                        user_email, test_id, user_preference, 
                        quality_rating_veo3, quality_rating_heygen, feedback_text
                    ) VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    user_email, test_id, preference,
                    veo3_rating, heygen_rating, feedback_text
                ))
                
                conn.commit()
            
            # Update Redis with feedback
            test_info['feedback_submitted'] = True
            test_info['preference'] = preference
            self.redis_client.setex(f"ab_test:{test_id}", 86400, json.dumps(test_info))
            
            logger.info(f"Quality feedback submitted for test {test_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to submit quality feedback: {str(e)}")
            return False
    
    def get_quality_comparison_stats(self) -> Dict[str, Any]:
        """Get overall quality comparison statistics"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Overall preference distribution
                cursor.execute(
                    "SELECT user_preference, COUNT(*) FROM quality_comparison GROUP BY user_preference"
                )
                preferences = dict(cursor.fetchall())
                
                # Average ratings
                cursor.execute(
                    "SELECT AVG(quality_rating_veo3), AVG(quality_rating_heygen) FROM quality_comparison"
                )
                avg_ratings = cursor.fetchone()
                
                # Recent comparisons (last 30 days)
                cursor.execute("""
                    SELECT COUNT(*) FROM quality_comparison 
                    WHERE created_at > datetime('now', '-30 days')
                """)
                recent_tests = cursor.fetchone()[0]
                
                return {
                    'preference_distribution': preferences,
                    'average_veo3_rating': round(avg_ratings[0] or 0, 2),
                    'average_heygen_rating': round(avg_ratings[1] or 0, 2),
                    'recent_tests_30_days': recent_tests,
                    'winner': 'heygen' if (avg_ratings[1] or 0) > (avg_ratings[0] or 0) else 'veo3'
                }
                
        except Exception as e:
            logger.error(f"Failed to get quality comparison stats: {str(e)}")
            return {}
    
    def _get_or_create_customer(self, email: str) -> str:
        """Get or create Stripe customer"""
        try:
            # Search for existing customer
            customers = stripe.Customer.list(email=email, limit=1)
            if customers.data:
                return customers.data[0].id
            
            # Create new customer
            customer = stripe.Customer.create(email=email)
            return customer.id
            
        except Exception as e:
            logger.error(f"Failed to get/create customer: {str(e)}")
            raise


# Global premium subscription service instance
premium_subscription_service = PremiumSubscriptionService()
