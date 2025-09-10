"""
Subscription billing schema migration
Creates tables for subscription plans, user subscriptions, payments, and usage tracking

Revision ID: 004_subscription_billing_schema
Revises: 003_payment_wallet_schema
Create Date: 2025-01-15 14:30:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '004_subscription_billing_schema'
down_revision = '003_payment_wallet_schema'
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Create subscription billing schema"""
    
    # Create subscription_plans table
    op.create_table(
        'subscription_plans',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tier', sa.String(50), nullable=False, index=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('billing_interval', sa.String(20), nullable=False),
        sa.Column('currency', sa.String(3), default='INR'),
        
        # Feature limits
        sa.Column('daily_signals_limit', sa.Integer(), default=0),
        sa.Column('ai_models_access', postgresql.JSONB(), default=sa.text("'[]'")),
        sa.Column('backtesting_enabled', sa.Boolean(), default=False),
        sa.Column('real_time_alerts', sa.Boolean(), default=False),
        sa.Column('portfolio_management', sa.Boolean(), default=False),
        sa.Column('api_access', sa.Boolean(), default=False),
        sa.Column('priority_support', sa.Boolean(), default=False),
        sa.Column('custom_strategies', sa.Boolean(), default=False),
        
        # Stripe configuration
        sa.Column('stripe_price_id', sa.String(200)),
        sa.Column('stripe_product_id', sa.String(200)),
        
        # Meta
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(), default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), default=sa.text('CURRENT_TIMESTAMP'))
    )
    
    # Create indexes for subscription_plans
    op.create_index(
        'ix_subscription_plans_tier_interval',
        'subscription_plans',
        ['tier', 'billing_interval']
    )
    
    # Create user_subscriptions table
    op.create_table(
        'user_subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('plan_id', postgresql.UUID(as_uuid=True), nullable=False),
        
        # Subscription details
        sa.Column('status', sa.String(20), nullable=False, default='pending'),
        sa.Column('started_at', sa.DateTime(), nullable=False, default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('current_period_start', sa.DateTime(), nullable=False),
        sa.Column('current_period_end', sa.DateTime(), nullable=False),
        sa.Column('cancelled_at', sa.DateTime()),
        sa.Column('trial_end', sa.DateTime()),
        
        # Payment details
        sa.Column('stripe_subscription_id', sa.String(200)),
        sa.Column('stripe_customer_id', sa.String(200)),
        
        # Usage tracking
        sa.Column('signals_consumed_today', sa.Integer(), default=0),
        sa.Column('last_signal_date', sa.DateTime()),
        sa.Column('total_signals_consumed', sa.Integer(), default=0),
        
        # Meta
        sa.Column('created_at', sa.DateTime(), default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), default=sa.text('CURRENT_TIMESTAMP')),
        
        # Foreign keys
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['plan_id'], ['subscription_plans.id'], ondelete='RESTRICT')
    )
    
    # Create indexes for user_subscriptions
    op.create_index('ix_user_subscriptions_user_id', 'user_subscriptions', ['user_id'])
    op.create_index('ix_user_subscriptions_status', 'user_subscriptions', ['status'])
    op.create_index('ix_user_subscriptions_stripe_id', 'user_subscriptions', ['stripe_subscription_id'])
    
    # Create payments table
    op.create_table(
        'payments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('subscription_id', postgresql.UUID(as_uuid=True), nullable=False),
        
        # Payment details
        sa.Column('amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), default='INR'),
        sa.Column('status', sa.String(20), nullable=False, default='pending'),
        sa.Column('payment_method', sa.String(50)),
        
        # External IDs
        sa.Column('stripe_payment_intent_id', sa.String(200)),
        sa.Column('stripe_invoice_id', sa.String(200)),
        sa.Column('transaction_id', sa.String(200)),
        
        # Metadata
        sa.Column('payment_metadata', postgresql.JSONB(), default=sa.text("'{}'")),
        sa.Column('failure_reason', sa.Text()),
        
        # Timing
        sa.Column('attempted_at', sa.DateTime(), default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('completed_at', sa.DateTime()),
        
        # Meta
        sa.Column('created_at', sa.DateTime(), default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), default=sa.text('CURRENT_TIMESTAMP')),
        
        # Foreign keys
        sa.ForeignKeyConstraint(['subscription_id'], ['user_subscriptions.id'], ondelete='CASCADE')
    )
    
    # Create indexes for payments
    op.create_index('ix_payments_subscription_id', 'payments', ['subscription_id'])
    op.create_index('ix_payments_status', 'payments', ['status'])
    op.create_index('ix_payments_stripe_intent', 'payments', ['stripe_payment_intent_id'])
    
    # Create usage_logs table
    op.create_table(
        'usage_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        
        # Usage details
        sa.Column('feature', sa.String(100), nullable=False),
        sa.Column('usage_count', sa.Integer(), default=1),
        sa.Column('usage_data', postgresql.JSONB(), default=sa.text("'{}'")),
        
        # Timing
        sa.Column('date', sa.DateTime(), nullable=False, default=sa.text('CURRENT_TIMESTAMP')),
        
        # Meta
        sa.Column('created_at', sa.DateTime(), default=sa.text('CURRENT_TIMESTAMP')),
        
        # Foreign keys
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    
    # Create indexes for usage_logs
    op.create_index('ix_usage_logs_user_date', 'usage_logs', ['user_id', 'date'])
    op.create_index('ix_usage_logs_feature', 'usage_logs', ['feature'])
    
    # Insert default subscription plans
    subscription_plans_data = [
        {
            'id': 'gen_random_uuid()',
            'tier': 'free',
            'name': 'Free Tier',
            'description': 'Basic AI trading signals with limited access',
            'price': 0.00,
            'billing_interval': 'monthly',
            'currency': 'INR',
            'daily_signals_limit': 3,
            'ai_models_access': '["basic"]',
            'backtesting_enabled': False,
            'real_time_alerts': False,
            'portfolio_management': False,
            'api_access': False,
            'priority_support': False,
            'custom_strategies': False
        },
        {
            'id': 'gen_random_uuid()',
            'tier': 'basic',
            'name': 'Basic Plan',
            'description': 'Essential AI trading signals for individual traders',
            'price': 999.00,
            'billing_interval': 'monthly',
            'currency': 'INR',
            'daily_signals_limit': 10,
            'ai_models_access': '["gpt4", "basic"]',
            'backtesting_enabled': True,
            'real_time_alerts': True,
            'portfolio_management': False,
            'api_access': False,
            'priority_support': False,
            'custom_strategies': False
        },
        {
            'id': 'gen_random_uuid()',
            'tier': 'premium',
            'name': 'Premium Plan',
            'description': 'Advanced AI signals with portfolio management',
            'price': 2999.00,
            'billing_interval': 'monthly',
            'currency': 'INR',
            'daily_signals_limit': 50,
            'ai_models_access': '["gpt4", "claude3", "custom_lstm"]',
            'backtesting_enabled': True,
            'real_time_alerts': True,
            'portfolio_management': True,
            'api_access': True,
            'priority_support': True,
            'custom_strategies': False
        },
        {
            'id': 'gen_random_uuid()',
            'tier': 'professional',
            'name': 'Professional Plan',
            'description': 'Professional-grade trading with unlimited signals',
            'price': 5999.00,
            'billing_interval': 'monthly',
            'currency': 'INR',
            'daily_signals_limit': 0,  # Unlimited
            'ai_models_access': '["gpt4", "claude3", "custom_lstm", "ensemble"]',
            'backtesting_enabled': True,
            'real_time_alerts': True,
            'portfolio_management': True,
            'api_access': True,
            'priority_support': True,
            'custom_strategies': True
        },
        {
            'id': 'gen_random_uuid()',
            'tier': 'enterprise',
            'name': 'Enterprise Plan',
            'description': 'Complete enterprise solution with dedicated support',
            'price': 19999.00,
            'billing_interval': 'monthly',
            'currency': 'INR',
            'daily_signals_limit': 0,  # Unlimited
            'ai_models_access': '["gpt4", "claude3", "custom_lstm", "ensemble", "custom"]',
            'backtesting_enabled': True,
            'real_time_alerts': True,
            'portfolio_management': True,
            'api_access': True,
            'priority_support': True,
            'custom_strategies': True
        }
    ]
    
    for plan in subscription_plans_data:
        op.execute(f"""
            INSERT INTO subscription_plans (
                id, tier, name, description, price, billing_interval, currency,
                daily_signals_limit, ai_models_access, backtesting_enabled,
                real_time_alerts, portfolio_management, api_access,
                priority_support, custom_strategies, is_active
            ) VALUES (
                {plan['id']}, '{plan['tier']}', '{plan['name']}', 
                '{plan['description']}', {plan['price']}, '{plan['billing_interval']}', 
                '{plan['currency']}', {plan['daily_signals_limit']}, 
                '{plan['ai_models_access']}'::jsonb, {plan['backtesting_enabled']},
                {plan['real_time_alerts']}, {plan['portfolio_management']}, 
                {plan['api_access']}, {plan['priority_support']}, 
                {plan['custom_strategies']}, true
            )
        """)
    
    # Create yearly variants of paid plans with discount
    yearly_plans_data = [
        {
            'tier': 'basic',
            'name': 'Basic Plan (Yearly)',
            'description': 'Essential AI trading signals - Annual billing with 2 months free',
            'price': 9990.00,  # 10 months price
            'billing_interval': 'yearly'
        },
        {
            'tier': 'premium',
            'name': 'Premium Plan (Yearly)',
            'description': 'Advanced AI signals with portfolio management - Annual billing with 2 months free',
            'price': 29990.00,
            'billing_interval': 'yearly'
        },
        {
            'tier': 'professional',
            'name': 'Professional Plan (Yearly)',
            'description': 'Professional-grade trading - Annual billing with 2 months free',
            'price': 59990.00,
            'billing_interval': 'yearly'
        },
        {
            'tier': 'enterprise',
            'name': 'Enterprise Plan (Yearly)',
            'description': 'Complete enterprise solution - Annual billing with 2 months free',
            'price': 199990.00,
            'billing_interval': 'yearly'
        }
    ]
    
    for plan in yearly_plans_data:
        op.execute(f"""
            INSERT INTO subscription_plans (
                id, tier, name, description, price, billing_interval, currency,
                daily_signals_limit, ai_models_access, backtesting_enabled,
                real_time_alerts, portfolio_management, api_access,
                priority_support, custom_strategies, is_active
            ) 
            SELECT 
                gen_random_uuid(), '{plan['tier']}', '{plan['name']}', 
                '{plan['description']}', {plan['price']}, '{plan['billing_interval']}', 
                currency, daily_signals_limit, ai_models_access, backtesting_enabled,
                real_time_alerts, portfolio_management, api_access,
                priority_support, custom_strategies, true
            FROM subscription_plans 
            WHERE tier = '{plan['tier']}' AND billing_interval = 'monthly'
            LIMIT 1
        """)

def downgrade() -> None:
    """Drop subscription billing schema"""
    
    # Drop tables in reverse order due to foreign key constraints
    op.drop_table('usage_logs')
    op.drop_table('payments')
    op.drop_table('user_subscriptions')
    op.drop_table('subscription_plans')