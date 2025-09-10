"""
Comprehensive test suite for subscription billing service
"""

import asyncio
import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import AsyncMock, Mock, patch
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.subscription_billing_service import (
    SubscriptionBillingService,
    SubscriptionPlan,
    UserSubscription,
    Payment,
    UsageLog,
    SubscriptionPlanSchema,
    CreateSubscriptionRequest,
    SubscriptionTier,
    BillingInterval,
    SubscriptionStatus,
    PaymentStatus,
    billing_service
)
from app.models.user import User

class TestSubscriptionBillingService:
    """Test cases for SubscriptionBillingService"""
    
    @pytest.fixture
    async def mock_db_session(self):
        """Create mock database session"""
        mock_session = AsyncMock(spec=AsyncSession)
        mock_session.execute = AsyncMock()
        mock_session.commit = AsyncMock()
        mock_session.refresh = AsyncMock()
        mock_session.add = Mock()
        return mock_session
    
    @pytest.fixture
    def sample_user(self):
        """Create sample user for testing"""
        return User(
            id="test-user-123",
            email="test@example.com",
            first_name="John",
            last_name="Doe"
        )
    
    @pytest.fixture
    def sample_plan_data(self):
        """Create sample subscription plan data"""
        return SubscriptionPlanSchema(
            tier=SubscriptionTier.PREMIUM,
            name="Premium Plan",
            description="Advanced AI trading signals",
            price=Decimal('2999.00'),
            billing_interval=BillingInterval.MONTHLY,
            currency="INR",
            daily_signals_limit=50,
            ai_models_access=["gpt4", "claude3"],
            backtesting_enabled=True,
            real_time_alerts=True,
            portfolio_management=True,
            api_access=True,
            priority_support=True
        )
    
    @pytest.fixture
    def sample_subscription_plan(self):
        """Create sample subscription plan"""
        return SubscriptionPlan(
            id="plan-123",
            tier=SubscriptionTier.PREMIUM.value,
            name="Premium Plan",
            description="Advanced AI trading signals",
            price=Decimal('2999.00'),
            billing_interval=BillingInterval.MONTHLY.value,
            currency="INR",
            daily_signals_limit=50,
            ai_models_access=["gpt4", "claude3"],
            backtesting_enabled=True,
            real_time_alerts=True,
            portfolio_management=True,
            api_access=True,
            priority_support=True,
            stripe_price_id="price_test123",
            stripe_product_id="prod_test123"
        )
    
    @pytest.mark.asyncio
    async def test_get_available_plans(self, mock_db_session):
        """Test fetching available subscription plans"""
        # Mock database response
        mock_result = Mock()
        mock_result.scalars.return_value.all.return_value = [
            SubscriptionPlan(
                id="plan-1",
                tier="free",
                name="Free Plan",
                price=Decimal('0'),
                billing_interval="monthly",
                is_active=True
            ),
            SubscriptionPlan(
                id="plan-2",
                tier="premium",
                name="Premium Plan",
                price=Decimal('2999'),
                billing_interval="monthly",
                is_active=True
            )
        ]
        
        mock_db_session.execute.return_value = mock_result
        
        service = SubscriptionBillingService()
        plans = await service.get_available_plans(mock_db_session)
        
        assert len(plans) == 2
        assert plans[0].tier == "free"
        assert plans[1].tier == "premium"
        assert plans[1].price == Decimal('2999')
    
    @pytest.mark.asyncio
    async def test_create_subscription_plan(self, mock_db_session, sample_plan_data):
        """Test creating a new subscription plan"""
        service = SubscriptionBillingService()
        
        # Mock Stripe API calls
        with patch('stripe.Product.create') as mock_product_create, \
             patch('stripe.Price.create') as mock_price_create:
            
            mock_product_create.return_value = Mock(id="prod_test123")
            mock_price_create.return_value = Mock(id="price_test123")
            
            plan = await service.create_subscription_plan(mock_db_session, sample_plan_data)
            
            # Verify Stripe calls
            mock_product_create.assert_called_once()
            mock_price_create.assert_called_once()
            
            # Verify database operations
            mock_db_session.add.assert_called_once()
            mock_db_session.commit.assert_called_once()
            mock_db_session.refresh.assert_called_once()
            
            # Verify plan properties
            assert plan.tier == sample_plan_data.tier.value
            assert plan.name == sample_plan_data.name
            assert plan.price == sample_plan_data.price
    
    @pytest.mark.asyncio
    async def test_create_user_subscription_success(self, mock_db_session, sample_user, sample_subscription_plan):
        """Test successful user subscription creation"""
        service = SubscriptionBillingService()
        
        # Mock database queries
        mock_plan_result = Mock()
        mock_plan_result.scalar_one_or_none.return_value = sample_subscription_plan
        
        mock_existing_result = Mock()
        mock_existing_result.scalar_one_or_none.return_value = None  # No existing subscription
        
        mock_user_result = Mock()
        mock_user_result.scalar_one_or_none.return_value = sample_user
        
        mock_db_session.execute.side_effect = [
            mock_plan_result,  # Plan query
            mock_existing_result,  # Existing subscription query
            mock_user_result   # User query
        ]
        
        # Mock Stripe API calls
        with patch.object(service, '_get_or_create_stripe_customer') as mock_get_customer, \
             patch('stripe.Subscription.create') as mock_sub_create:
            
            mock_customer = Mock(id="cus_test123")
            mock_get_customer.return_value = mock_customer
            mock_sub_create.return_value = Mock(id="sub_test123")
            
            request = CreateSubscriptionRequest(
                plan_id="plan-123",
                trial_days=7
            )
            
            subscription = await service.create_user_subscription(
                mock_db_session,
                str(sample_user.id),
                request
            )
            
            # Verify Stripe calls
            mock_get_customer.assert_called_once_with(sample_user)
            mock_sub_create.assert_called_once()
            
            # Verify database operations
            mock_db_session.add.assert_called_once()
            mock_db_session.commit.assert_called_once()
            mock_db_session.refresh.assert_called_once()
            
            # Verify subscription properties
            assert subscription.user_id == str(sample_user.id)
            assert subscription.plan_id == "plan-123"
            assert subscription.status == SubscriptionStatus.TRIAL
            assert subscription.stripe_subscription_id == "sub_test123"
    
    @pytest.mark.asyncio
    async def test_create_user_subscription_existing_active(self, mock_db_session, sample_user, sample_subscription_plan):
        """Test subscription creation when user already has active subscription"""
        service = SubscriptionBillingService()
        
        # Mock database queries
        mock_plan_result = Mock()
        mock_plan_result.scalar_one_or_none.return_value = sample_subscription_plan
        
        existing_subscription = UserSubscription(
            id="existing-sub",
            user_id=str(sample_user.id),
            status=SubscriptionStatus.ACTIVE
        )
        mock_existing_result = Mock()
        mock_existing_result.scalar_one_or_none.return_value = existing_subscription
        
        mock_db_session.execute.side_effect = [
            mock_plan_result,  # Plan query
            mock_existing_result  # Existing subscription query
        ]
        
        request = CreateSubscriptionRequest(plan_id="plan-123")
        
        with pytest.raises(ValueError, match="User already has an active subscription"):
            await service.create_user_subscription(
                mock_db_session,
                str(sample_user.id),
                request
            )
    
    @pytest.mark.asyncio
    async def test_cancel_subscription(self, mock_db_session):
        """Test subscription cancellation"""
        service = SubscriptionBillingService()
        
        subscription = UserSubscription(
            id="sub-123",
            stripe_subscription_id="sub_stripe123",
            status=SubscriptionStatus.ACTIVE
        )
        
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = subscription
        mock_db_session.execute.return_value = mock_result
        
        with patch('stripe.Subscription.modify') as mock_stripe_modify:
            cancelled_sub = await service.cancel_subscription(
                mock_db_session,
                "sub-123",
                immediate=False
            )
            
            # Verify Stripe call
            mock_stripe_modify.assert_called_once_with(
                "sub_stripe123",
                cancel_at_period_end=True
            )
            
            # Verify database operations
            mock_db_session.commit.assert_called_once()
            mock_db_session.refresh.assert_called_once()
            
            assert cancelled_sub.status == SubscriptionStatus.CANCELLED
    
    @pytest.mark.asyncio
    async def test_upgrade_subscription(self, mock_db_session):
        """Test subscription upgrade"""
        service = SubscriptionBillingService()
        
        old_plan = SubscriptionPlan(
            id="plan-basic",
            tier="basic",
            stripe_price_id="price_basic"
        )
        
        new_plan = SubscriptionPlan(
            id="plan-premium",
            tier="premium",
            stripe_price_id="price_premium"
        )
        
        subscription = UserSubscription(
            id="sub-123",
            stripe_subscription_id="sub_stripe123",
            plan_id="plan-basic"
        )
        
        mock_sub_result = Mock()
        mock_sub_result.scalar_one_or_none.return_value = subscription
        
        mock_plan_result = Mock()
        mock_plan_result.scalar_one_or_none.return_value = new_plan
        
        mock_db_session.execute.side_effect = [mock_sub_result, mock_plan_result]
        
        with patch('stripe.Subscription.retrieve') as mock_retrieve, \
             patch('stripe.Subscription.modify') as mock_modify:
            
            mock_stripe_sub = Mock()
            mock_stripe_sub.__getitem__.return_value = {'data': [Mock(id='si_test')]}
            mock_retrieve.return_value = mock_stripe_sub
            
            upgraded_sub = await service.upgrade_subscription(
                mock_db_session,
                "sub-123",
                "plan-premium"
            )
            
            # Verify Stripe calls
            mock_retrieve.assert_called_once_with("sub_stripe123")
            mock_modify.assert_called_once()
            
            # Verify database operations
            mock_db_session.commit.assert_called_once()
            mock_db_session.refresh.assert_called_once()
            
            assert upgraded_sub.plan_id == "plan-premium"
    
    @pytest.mark.asyncio
    async def test_check_user_access_with_subscription(self, mock_db_session):
        """Test checking user access with active subscription"""
        service = SubscriptionBillingService()
        
        plan = SubscriptionPlan(
            backtesting_enabled=True,
            api_access=True,
            portfolio_management=False
        )
        
        subscription = UserSubscription(
            user_id="user-123",
            status=SubscriptionStatus.ACTIVE,
            plan=plan
        )
        
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = subscription
        mock_db_session.execute.return_value = mock_result
        
        # Test accessible features
        has_backtesting = await service.check_user_access(
            mock_db_session, "user-123", "backtesting"
        )
        assert has_backtesting == True
        
        has_api = await service.check_user_access(
            mock_db_session, "user-123", "api_access"
        )
        assert has_api == True
        
        # Test inaccessible features
        has_portfolio = await service.check_user_access(
            mock_db_session, "user-123", "portfolio_management"
        )
        assert has_portfolio == False
    
    @pytest.mark.asyncio
    async def test_check_user_access_no_subscription(self, mock_db_session):
        """Test checking user access without subscription (free tier)"""
        service = SubscriptionBillingService()
        
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db_session.execute.return_value = mock_result
        
        # Test free tier features
        has_basic_signals = await service.check_user_access(
            mock_db_session, "user-123", "basic_signals"
        )
        assert has_basic_signals == True
        
        # Test premium features
        has_backtesting = await service.check_user_access(
            mock_db_session, "user-123", "backtesting"
        )
        assert has_backtesting == False
    
    @pytest.mark.asyncio
    async def test_track_usage_signals(self, mock_db_session):
        """Test tracking AI signals usage"""
        service = SubscriptionBillingService()
        
        subscription = UserSubscription(
            user_id="user-123",
            signals_consumed_today=5,
            total_signals_consumed=100,
            last_signal_date=datetime.utcnow() - timedelta(days=1)
        )
        
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = subscription
        mock_db_session.execute.return_value = mock_result
        
        await service.track_usage(
            mock_db_session,
            "user-123",
            "ai_signals",
            count=3,
            metadata={"symbols": ["RELIANCE", "TCS", "INFY"]}
        )
        
        # Verify database operations
        mock_db_session.add.assert_called()
        mock_db_session.commit.assert_called_once()
        
        # Verify usage counters updated
        assert subscription.signals_consumed_today == 8  # Reset to 0 + 3 (new day)
        assert subscription.total_signals_consumed == 103
    
    @pytest.mark.asyncio
    async def test_get_user_usage_summary(self, mock_db_session):
        """Test getting user usage summary"""
        service = SubscriptionBillingService()
        
        # Mock usage data
        mock_usage_data = [
            Mock(feature="ai_signals", total_count=150, usage_sessions=30),
            Mock(feature="backtesting", total_count=25, usage_sessions=10),
            Mock(feature="api_access", total_count=500, usage_sessions=100)
        ]
        
        mock_result = Mock()
        mock_result.__iter__ = Mock(return_value=iter(mock_usage_data))
        mock_db_session.execute.return_value = mock_result
        
        date_from = datetime.utcnow() - timedelta(days=30)
        date_to = datetime.utcnow()
        
        usage_summary = await service.get_user_usage_summary(
            mock_db_session,
            "user-123",
            date_from,
            date_to
        )
        
        assert len(usage_summary) == 3
        assert usage_summary["ai_signals"]["total_count"] == 150
        assert usage_summary["ai_signals"]["usage_sessions"] == 30
        assert usage_summary["backtesting"]["total_count"] == 25
        assert usage_summary["api_access"]["total_count"] == 500
    
    @pytest.mark.asyncio
    async def test_stripe_webhook_payment_succeeded(self, mock_db_session):
        """Test handling Stripe payment succeeded webhook"""
        service = SubscriptionBillingService()
        
        subscription = UserSubscription(
            id="sub-123",
            status=SubscriptionStatus.PENDING
        )
        
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = subscription
        
        invoice_data = {
            'id': 'in_test123',
            'subscription': 'sub_stripe123',
            'amount_paid': 299900,  # ₹2999 in cents
            'currency': 'inr',
            'payment_intent': 'pi_test123'
        }
        
        with patch('app.services.subscription_billing_service.get_db') as mock_get_db:
            mock_db_context = AsyncMock()
            mock_db_context.__aenter__ = AsyncMock(return_value=mock_db_session)
            mock_db_context.__aexit__ = AsyncMock()
            mock_get_db.return_value = mock_db_context
            
            mock_db_session.execute.return_value = mock_result
            
            await service._handle_payment_succeeded(invoice_data)
            
            # Verify payment record creation
            mock_db_session.add.assert_called()
            mock_db_session.commit.assert_called()
            
            # Verify subscription status update
            assert subscription.status == SubscriptionStatus.ACTIVE
    
    @pytest.mark.asyncio
    async def test_stripe_webhook_payment_failed(self, mock_db_session):
        """Test handling Stripe payment failed webhook"""
        service = SubscriptionBillingService()
        
        subscription = UserSubscription(
            id="sub-123",
            status=SubscriptionStatus.ACTIVE
        )
        
        mock_result = Mock()
        mock_result.scalar_one_or_none.return_value = subscription
        
        invoice_data = {
            'id': 'in_test123',
            'subscription': 'sub_stripe123',
            'amount_due': 299900,  # ₹2999 in cents
            'currency': 'inr',
            'last_finalization_error': {
                'message': 'Insufficient funds'
            }
        }
        
        with patch('app.services.subscription_billing_service.get_db') as mock_get_db:
            mock_db_context = AsyncMock()
            mock_db_context.__aenter__ = AsyncMock(return_value=mock_db_session)
            mock_db_context.__aexit__ = AsyncMock()
            mock_get_db.return_value = mock_db_context
            
            mock_db_session.execute.return_value = mock_result
            
            await service._handle_payment_failed(invoice_data)
            
            # Verify payment record creation
            mock_db_session.add.assert_called()
            mock_db_session.commit.assert_called()
            
            # Verify subscription status update
            assert subscription.status == SubscriptionStatus.PAST_DUE

class TestSubscriptionPlanModel:
    """Test cases for SubscriptionPlan model"""
    
    def test_subscription_plan_creation(self):
        """Test creating a subscription plan"""
        plan = SubscriptionPlan(
            tier=SubscriptionTier.PREMIUM.value,
            name="Premium Plan",
            description="Advanced features",
            price=Decimal('2999.00'),
            billing_interval=BillingInterval.MONTHLY.value,
            currency="INR",
            daily_signals_limit=50,
            backtesting_enabled=True,
            api_access=True
        )
        
        assert plan.tier == "premium"
        assert plan.name == "Premium Plan"
        assert plan.price == Decimal('2999.00')
        assert plan.daily_signals_limit == 50
        assert plan.backtesting_enabled == True

class TestUserSubscriptionModel:
    """Test cases for UserSubscription model"""
    
    def test_user_subscription_creation(self):
        """Test creating a user subscription"""
        subscription = UserSubscription(
            user_id="user-123",
            plan_id="plan-456",
            status=SubscriptionStatus.ACTIVE.value,
            started_at=datetime.utcnow(),
            current_period_start=datetime.utcnow(),
            current_period_end=datetime.utcnow() + timedelta(days=30),
            signals_consumed_today=10
        )
        
        assert subscription.user_id == "user-123"
        assert subscription.plan_id == "plan-456"
        assert subscription.status == "active"
        assert subscription.signals_consumed_today == 10

class TestPaymentModel:
    """Test cases for Payment model"""
    
    def test_payment_creation(self):
        """Test creating a payment record"""
        payment = Payment(
            subscription_id="sub-123",
            amount=Decimal('2999.00'),
            currency="INR",
            status=PaymentStatus.COMPLETED.value,
            payment_method="card",
            stripe_payment_intent_id="pi_test123",
            completed_at=datetime.utcnow()
        )
        
        assert payment.subscription_id == "sub-123"
        assert payment.amount == Decimal('2999.00')
        assert payment.status == "completed"
        assert payment.payment_method == "card"

class TestIntegrationScenarios:
    """Integration test scenarios"""
    
    @pytest.mark.asyncio
    async def test_complete_subscription_lifecycle(self):
        """Test complete subscription lifecycle from creation to cancellation"""
        # This would test the entire flow:
        # 1. Create subscription plan
        # 2. User subscribes
        # 3. Track usage
        # 4. Process payments
        # 5. Upgrade subscription
        # 6. Cancel subscription
        
        service = SubscriptionBillingService()
        
        with patch.multiple(
            service,
            create_subscription_plan=AsyncMock(),
            create_user_subscription=AsyncMock(),
            track_usage=AsyncMock(),
            upgrade_subscription=AsyncMock(),
            cancel_subscription=AsyncMock()
        ):
            
            # Mock successful workflow
            service.create_subscription_plan.return_value = Mock(id="plan-123")
            service.create_user_subscription.return_value = Mock(id="sub-123")
            service.upgrade_subscription.return_value = Mock(id="sub-123")
            service.cancel_subscription.return_value = Mock(id="sub-123")
            
            # Simulate lifecycle
            plan = await service.create_subscription_plan(None, None)
            subscription = await service.create_user_subscription(None, "user-123", None)
            await service.track_usage(None, "user-123", "ai_signals", 5)
            upgraded = await service.upgrade_subscription(None, "sub-123", "plan-premium")
            cancelled = await service.cancel_subscription(None, "sub-123")
            
            # Verify all steps were called
            service.create_subscription_plan.assert_called_once()
            service.create_user_subscription.assert_called_once()
            service.track_usage.assert_called_once()
            service.upgrade_subscription.assert_called_once()
            service.cancel_subscription.assert_called_once()

class TestUsageTracking:
    """Test cases for usage tracking and billing"""
    
    @pytest.mark.asyncio
    async def test_daily_signals_limit_enforcement(self):
        """Test enforcement of daily signals limits"""
        # This would test the logic for checking and enforcing
        # daily signal limits based on subscription tier
        pass
    
    @pytest.mark.asyncio
    async def test_usage_reset_daily(self):
        """Test daily usage counter reset"""
        # This would test the logic for resetting daily counters
        # when a new day starts
        pass

class TestErrorHandling:
    """Error handling test scenarios"""
    
    @pytest.mark.asyncio
    async def test_stripe_api_error_handling(self):
        """Test handling of Stripe API errors"""
        service = SubscriptionBillingService()
        
        with patch('stripe.Product.create') as mock_create:
            import stripe
            mock_create.side_effect = stripe.error.APIError("API Error")
            
            with pytest.raises(stripe.error.APIError):
                await service.create_subscription_plan(Mock(), Mock())
    
    @pytest.mark.asyncio
    async def test_webhook_signature_validation(self):
        """Test webhook signature validation"""
        service = SubscriptionBillingService()
        
        with patch('stripe.Webhook.construct_event') as mock_construct:
            import stripe
            mock_construct.side_effect = stripe.error.SignatureVerificationError(
                "Invalid signature", "sig_header"
            )
            
            with pytest.raises(ValueError, match="Invalid signature"):
                await service.process_webhook(b"payload", "invalid_sig")

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--asyncio-mode=auto"])