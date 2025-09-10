"""Signal Generation Schema

Revision ID: 004_signal_generation_schema
Revises: 003_payment_wallet_schema
Create Date: 2025-01-08 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY


# revision identifiers, used by Alembic.
revision = '004_signal_generation_schema'
down_revision = '003_payment_wallet_schema'
branch_labels = None
depends_on = None


def upgrade():
    """Create signal generation related tables"""
    
    # Create signal_generators table
    op.create_table('signal_generators',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('source_type', sa.Enum('ai_model', 'expert_analyst', 'algorithm', 'news_sentiment', 'technical_analysis', 'fundamental_analysis', name='signalsourcetype'), nullable=False),
        sa.Column('version', sa.String(20), nullable=False, default='1.0'),
        sa.Column('accuracy_percentage', sa.Float(), nullable=False, default=0.0),
        sa.Column('total_signals', sa.Integer(), nullable=False, default=0),
        sa.Column('successful_signals', sa.Integer(), nullable=False, default=0),
        sa.Column('avg_return_percentage', sa.Float(), nullable=False, default=0.0),
        sa.Column('sharpe_ratio', sa.Float(), nullable=True),
        sa.Column('max_drawdown', sa.Float(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('subscription_tiers', ARRAY(sa.String), nullable=False, default=['basic', 'pro', 'elite']),
        sa.Column('supported_categories', ARRAY(sa.String), nullable=False, default=['equity']),
        sa.Column('risk_level', sa.Integer(), nullable=False, default=3),
        sa.Column('model_name', sa.String(100), nullable=True),
        sa.Column('model_version', sa.String(20), nullable=True),
        sa.Column('confidence_threshold', sa.Float(), nullable=False, default=0.75),
        sa.Column('signals_per_hour', sa.Integer(), nullable=False, default=10),
        sa.Column('signals_per_day', sa.Integer(), nullable=False, default=50),
        sa.Column('metadata', JSONB(), nullable=True, default={}),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint('accuracy_percentage >= 0 AND accuracy_percentage <= 100', name='generator_accuracy_range'),
        sa.CheckConstraint('risk_level >= 1 AND risk_level <= 5', name='generator_risk_level_range')
    )
    
    # Create indexes for signal_generators
    op.create_index('idx_generator_active', 'signal_generators', ['is_active'])
    op.create_index('idx_generator_source_type', 'signal_generators', ['source_type'])
    
    # Create trading_signals table
    op.create_table('trading_signals',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('signal_id', sa.String(50), nullable=False, unique=True),
        sa.Column('generator_id', UUID(as_uuid=True), sa.ForeignKey('signal_generators.id'), nullable=False),
        sa.Column('signal_type', sa.Enum('buy', 'sell', 'hold', 'exit', 'stop_loss', 'take_profit', name='signaltype'), nullable=False),
        sa.Column('category', sa.Enum('equity', 'crypto', 'forex', 'commodity', 'option', 'future', name='signalcategory'), nullable=False),
        sa.Column('priority', sa.Enum('low', 'medium', 'high', 'urgent', name='signalpriority'), nullable=False, default='medium'),
        sa.Column('symbol', sa.String(50), nullable=False),
        sa.Column('exchange', sa.String(20), nullable=True),
        sa.Column('asset_name', sa.String(200), nullable=True),
        sa.Column('isin_code', sa.String(12), nullable=True),
        sa.Column('entry_price', sa.DECIMAL(12, 4), nullable=True),
        sa.Column('target_price', sa.DECIMAL(12, 4), nullable=True),
        sa.Column('stop_loss_price', sa.DECIMAL(12, 4), nullable=True),
        sa.Column('current_price', sa.DECIMAL(12, 4), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('risk_reward_ratio', sa.Float(), nullable=True),
        sa.Column('expected_return_percentage', sa.Float(), nullable=True),
        sa.Column('max_risk_percentage', sa.Float(), nullable=False, default=5.0),
        sa.Column('valid_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expected_duration_hours', sa.Integer(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'active', 'executed', 'expired', 'cancelled', name='signalstatus'), nullable=False, default='pending'),
        sa.Column('execution_status', sa.Enum('not_executed', 'partially_executed', 'fully_executed', 'failed', name='signalexecutionstatus'), nullable=False, default='not_executed'),
        sa.Column('actual_entry_price', sa.DECIMAL(12, 4), nullable=True),
        sa.Column('actual_exit_price', sa.DECIMAL(12, 4), nullable=True),
        sa.Column('actual_return_percentage', sa.Float(), nullable=True),
        sa.Column('is_successful', sa.Boolean(), nullable=True),
        sa.Column('executed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('closed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('execution_notes', sa.Text(), nullable=True),
        sa.Column('min_subscription_tier', sa.Enum('basic', 'pro', 'elite', name='subscriptiontier'), nullable=False, default='basic'),
        sa.Column('premium_features', JSONB(), nullable=True, default={}),
        sa.Column('analysis_data', JSONB(), nullable=True, default={}),
        sa.Column('technical_indicators', JSONB(), nullable=True, default={}),
        sa.Column('fundamental_data', JSONB(), nullable=True, default={}),
        sa.Column('sentiment_score', sa.Float(), nullable=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('rationale', sa.Text(), nullable=True),
        sa.Column('key_factors', ARRAY(sa.String), nullable=True),
        sa.Column('metadata', JSONB(), nullable=True, default={}),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint('confidence_score >= 0 AND confidence_score <= 1', name='signal_confidence_range'),
        sa.CheckConstraint('max_risk_percentage >= 0 AND max_risk_percentage <= 100', name='signal_risk_percentage_range')
    )
    
    # Create indexes for trading_signals
    op.create_index('idx_signal_generator', 'trading_signals', ['generator_id'])
    op.create_index('idx_signal_symbol_category', 'trading_signals', ['symbol', 'category'])
    op.create_index('idx_signal_status_tier', 'trading_signals', ['status', 'min_subscription_tier'])
    op.create_index('idx_signal_created', 'trading_signals', ['created_at'])
    op.create_index('idx_signal_valid_until', 'trading_signals', ['valid_until'])
    op.create_index('idx_signal_signal_id', 'trading_signals', ['signal_id'])
    op.create_index('idx_signal_signal_type', 'trading_signals', ['signal_type'])
    op.create_index('idx_signal_category', 'trading_signals', ['category'])
    
    # Create signal_distributions table
    op.create_table('signal_distributions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('signal_id', UUID(as_uuid=True), sa.ForeignKey('trading_signals.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('distributed_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('delivery_method', sa.String(50), nullable=False),
        sa.Column('is_delivered', sa.Boolean(), nullable=False, default=False),
        sa.Column('delivered_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, default=False),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('user_subscription_tier', sa.Enum('basic', 'pro', 'elite', name='subscriptiontier'), nullable=False),
        sa.Column('subscription_valid_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('delivery_metadata', JSONB(), nullable=True, default={}),
        sa.Column('failure_reason', sa.Text(), nullable=True),
        sa.Column('retry_count', sa.Integer(), nullable=False, default=0),
        sa.UniqueConstraint('signal_id', 'user_id', 'delivery_method', name='unique_signal_user_delivery')
    )
    
    # Create indexes for signal_distributions
    op.create_index('idx_distribution_signal', 'signal_distributions', ['signal_id'])
    op.create_index('idx_distribution_user_delivered', 'signal_distributions', ['user_id', 'is_delivered'])
    op.create_index('idx_distribution_distributed_at', 'signal_distributions', ['distributed_at'])
    
    # Create signal_performances table
    op.create_table('signal_performances',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('signal_id', UUID(as_uuid=True), sa.ForeignKey('trading_signals.id', ondelete='CASCADE'), nullable=False),
        sa.Column('recorded_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('price_at_recording', sa.DECIMAL(12, 4), nullable=False),
        sa.Column('unrealized_pnl', sa.DECIMAL(12, 2), nullable=True),
        sa.Column('unrealized_pnl_percentage', sa.Float(), nullable=True),
        sa.Column('drawdown_from_peak', sa.Float(), nullable=True),
        sa.Column('volatility', sa.Float(), nullable=True),
        sa.Column('rsi', sa.Float(), nullable=True),
        sa.Column('macd', sa.Float(), nullable=True),
        sa.Column('bollinger_position', sa.Float(), nullable=True),
        sa.Column('volume_ratio', sa.Float(), nullable=True),
        sa.Column('market_trend', sa.String(20), nullable=True),
        sa.Column('sector_performance', sa.Float(), nullable=True),
        sa.Column('market_volatility', sa.Float(), nullable=True),
        sa.Column('news_sentiment', sa.Float(), nullable=True),
        sa.Column('social_sentiment', sa.Float(), nullable=True),
        sa.Column('institutional_activity', sa.String(20), nullable=True),
        sa.Column('metadata', JSONB(), nullable=True, default={})
    )
    
    # Create indexes for signal_performances
    op.create_index('idx_performance_signal_recorded', 'signal_performances', ['signal_id', 'recorded_at'])
    
    # Create user_signal_actions table
    op.create_table('user_signal_actions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('signal_id', UUID(as_uuid=True), sa.ForeignKey('trading_signals.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('action_type', sa.String(50), nullable=False),
        sa.Column('action_timestamp', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('user_entry_price', sa.DECIMAL(12, 4), nullable=True),
        sa.Column('user_exit_price', sa.DECIMAL(12, 4), nullable=True),
        sa.Column('user_quantity', sa.DECIMAL(12, 2), nullable=True),
        sa.Column('user_investment_amount', sa.DECIMAL(12, 2), nullable=True),
        sa.Column('user_pnl', sa.DECIMAL(12, 2), nullable=True),
        sa.Column('user_pnl_percentage', sa.Float(), nullable=True),
        sa.Column('user_holding_period_hours', sa.Integer(), nullable=True),
        sa.Column('user_rating', sa.Integer(), nullable=True),
        sa.Column('user_feedback', sa.Text(), nullable=True),
        sa.Column('stop_loss_set', sa.Boolean(), nullable=False, default=False),
        sa.Column('user_stop_loss_price', sa.DECIMAL(12, 4), nullable=True),
        sa.Column('risk_amount', sa.DECIMAL(12, 2), nullable=True),
        sa.Column('metadata', JSONB(), nullable=True, default={})
    )
    
    # Create indexes for user_signal_actions
    op.create_index('idx_user_action_signal_user', 'user_signal_actions', ['signal_id', 'user_id'])
    op.create_index('idx_user_action_timestamp', 'user_signal_actions', ['action_timestamp'])
    op.create_index('idx_user_action_user_type', 'user_signal_actions', ['user_id', 'action_type'])
    
    # Create signal_subscriptions table
    op.create_table('signal_subscriptions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('current_tier', sa.Enum('basic', 'pro', 'elite', name='subscriptiontier'), nullable=False, default='basic'),
        sa.Column('tier_valid_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('preferred_categories', ARRAY(sa.String), nullable=False, default=['equity']),
        sa.Column('max_risk_level', sa.Integer(), nullable=False, default=3),
        sa.Column('min_confidence_score', sa.Float(), nullable=False, default=0.6),
        sa.Column('email_notifications', sa.Boolean(), nullable=False, default=True),
        sa.Column('sms_notifications', sa.Boolean(), nullable=False, default=False),
        sa.Column('push_notifications', sa.Boolean(), nullable=False, default=True),
        sa.Column('telegram_notifications', sa.Boolean(), nullable=False, default=False),
        sa.Column('whatsapp_notifications', sa.Boolean(), nullable=False, default=False),
        sa.Column('notification_hours_start', sa.Integer(), nullable=False, default=9),
        sa.Column('notification_hours_end', sa.Integer(), nullable=False, default=18),
        sa.Column('weekend_notifications', sa.Boolean(), nullable=False, default=False),
        sa.Column('max_signals_per_day', sa.Integer(), nullable=False, default=10),
        sa.Column('max_signals_per_category', sa.Integer(), nullable=False, default=5),
        sa.Column('max_portfolio_exposure', sa.Float(), nullable=False, default=20.0),
        sa.Column('preferred_holding_period_days', sa.Integer(), nullable=True),
        sa.Column('total_signals_received', sa.Integer(), nullable=False, default=0),
        sa.Column('total_signals_acted_upon', sa.Integer(), nullable=False, default=0),
        sa.Column('avg_user_return_percentage', sa.Float(), nullable=False, default=0.0),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('paused_until', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint('max_risk_level >= 1 AND max_risk_level <= 5', name='subscription_risk_level_range'),
        sa.CheckConstraint('min_confidence_score >= 0 AND min_confidence_score <= 1', name='subscription_confidence_range'),
        sa.CheckConstraint('notification_hours_start >= 0 AND notification_hours_start <= 23', name='subscription_hours_start_range'),
        sa.CheckConstraint('notification_hours_end >= 0 AND notification_hours_end <= 23', name='subscription_hours_end_range'),
        sa.CheckConstraint('max_portfolio_exposure >= 0 AND max_portfolio_exposure <= 100', name='subscription_exposure_range')
    )
    
    # Create indexes for signal_subscriptions
    op.create_index('idx_subscription_user_active', 'signal_subscriptions', ['user_id', 'is_active'])
    op.create_index('idx_subscription_tier', 'signal_subscriptions', ['current_tier'])


def downgrade():
    """Drop signal generation related tables"""
    
    # Drop tables in reverse order
    op.drop_table('signal_subscriptions')
    op.drop_table('user_signal_actions')
    op.drop_table('signal_performances')
    op.drop_table('signal_distributions')
    op.drop_table('trading_signals')
    op.drop_table('signal_generators')
    
    # Drop custom enums
    op.execute("DROP TYPE IF EXISTS signalsourcetype")
    op.execute("DROP TYPE IF EXISTS signaltype")
    op.execute("DROP TYPE IF EXISTS signalcategory")
    op.execute("DROP TYPE IF EXISTS signalpriority")
    op.execute("DROP TYPE IF EXISTS signalstatus")
    op.execute("DROP TYPE IF EXISTS signalexecutionstatus")
    op.execute("DROP TYPE IF EXISTS subscriptiontier")