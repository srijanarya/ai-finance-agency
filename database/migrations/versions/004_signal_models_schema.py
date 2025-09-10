"""004_signal_models_schema

Revision ID: 004
Revises: 003
Create Date: 2024-09-10 15:30:00.000000

Creates tables for TREUM's Premium Signal Service (₹60-90 Cr revenue target):
- signal_providers: AI models and signal sources
- trading_signals: Core signal data with comprehensive metadata  
- signal_subscriptions: User signal subscriptions and preferences
- signal_performance: Detailed performance tracking
- user_signal_preferences: User delivery and filtering preferences
- signal_analytics: Performance metrics and analytics
- signal_backtests: Strategy backtesting results
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

# revision identifiers
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade():
    """Create signal-related tables"""
    
    # 1. Signal Providers table
    op.create_table(
        'signal_providers',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False, unique=True),
        sa.Column('description', sa.Text),
        sa.Column('provider_type', sa.String(50), nullable=False),
        sa.Column('accuracy_score', sa.Numeric(5, 4), default=0.0),
        sa.Column('total_signals', sa.Integer, default=0),
        sa.Column('successful_signals', sa.Integer, default=0),
        sa.Column('is_active', sa.Boolean, default=True),
        sa.Column('model_version', sa.String(50)),
        sa.Column('training_data_end_date', sa.DateTime(timezone=True)),
        sa.Column('config', JSONB, default={}),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    
    # 2. Trading Signals table
    op.create_table(
        'trading_signals',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('signal_id', sa.String(50), unique=True, nullable=False),
        sa.Column('provider_id', UUID(as_uuid=True), sa.ForeignKey('signal_providers.id'), nullable=False),
        sa.Column('source', sa.String(50), nullable=False),
        sa.Column('symbol', sa.String(20), nullable=False),
        sa.Column('exchange', sa.String(50), nullable=False),
        sa.Column('asset_class', sa.String(20), nullable=False),
        sa.Column('signal_type', sa.String(20), nullable=False),
        sa.Column('priority', sa.String(20), default='medium'),
        sa.Column('confidence_score', sa.Numeric(5, 4), nullable=False),
        sa.Column('entry_price', sa.Numeric(15, 4)),
        sa.Column('target_price', sa.Numeric(15, 4)),
        sa.Column('stop_loss', sa.Numeric(15, 4)),
        sa.Column('current_price', sa.Numeric(15, 4)),
        sa.Column('recommended_quantity', sa.Integer),
        sa.Column('position_size_percentage', sa.Numeric(5, 2)),
        sa.Column('risk_reward_ratio', sa.Numeric(8, 4)),
        sa.Column('generated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('valid_until', sa.DateTime(timezone=True)),
        sa.Column('executed_at', sa.DateTime(timezone=True)),
        sa.Column('status', sa.String(20), default='active'),
        sa.Column('actual_entry_price', sa.Numeric(15, 4)),
        sa.Column('actual_exit_price', sa.Numeric(15, 4)),
        sa.Column('actual_return_percentage', sa.Numeric(8, 4)),
        sa.Column('max_drawdown_percentage', sa.Numeric(8, 4)),
        sa.Column('technical_indicators', JSONB, default={}),
        sa.Column('fundamental_data', JSONB, default={}),
        sa.Column('sentiment_data', JSONB, default={}),
        sa.Column('market_conditions', JSONB, default={}),
        sa.Column('min_subscription_tier', sa.String(20), default='basic'),
        sa.Column('tags', JSONB, default=[]),
        sa.Column('notes', sa.Text),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        
        # Constraints
        sa.CheckConstraint('confidence_score >= 0 AND confidence_score <= 1', name='valid_confidence_score'),
    )
    
    # 3. Signal Subscriptions table
    op.create_table(
        'signal_subscriptions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('signal_id', UUID(as_uuid=True), sa.ForeignKey('trading_signals.id'), nullable=False),
        sa.Column('subscription_tier', sa.String(20), nullable=False),
        sa.Column('subscribed_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('delivery_methods', JSONB, default=['push_notification']),
        sa.Column('is_auto_trade_enabled', sa.Boolean, default=False),
        sa.Column('is_executed', sa.Boolean, default=False),
        sa.Column('executed_at', sa.DateTime(timezone=True)),
        sa.Column('execution_price', sa.Numeric(15, 4)),
        sa.Column('user_return_percentage', sa.Numeric(8, 4)),
        sa.Column('user_rating', sa.Integer),
        sa.Column('user_feedback', sa.Text),
        
        # Constraints
        sa.UniqueConstraint('user_id', 'signal_id', name='unique_user_signal_subscription'),
        sa.CheckConstraint('user_rating >= 1 AND user_rating <= 5', name='valid_rating'),
    )
    
    # 4. Signal Performance table
    op.create_table(
        'signal_performance',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('signal_id', UUID(as_uuid=True), sa.ForeignKey('trading_signals.id'), nullable=False),
        sa.Column('date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('price_at_time', sa.Numeric(15, 4), nullable=False),
        sa.Column('return_since_signal', sa.Numeric(8, 4)),
        sa.Column('volume', sa.Integer),
        sa.Column('market_cap', sa.Numeric(20, 2)),
        sa.Column('volatility', sa.Numeric(8, 4)),
        sa.Column('social_sentiment', sa.Numeric(5, 4)),
        sa.Column('social_volume', sa.Integer),
        sa.Column('news_sentiment', sa.Numeric(5, 4)),
        sa.Column('rsi', sa.Numeric(5, 2)),
        sa.Column('macd', sa.Numeric(8, 4)),
        sa.Column('bollinger_position', sa.Numeric(5, 4)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # 5. User Signal Preferences table
    op.create_table(
        'user_signal_preferences',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False, unique=True),
        sa.Column('preferred_asset_classes', JSONB, default=['equity', 'crypto']),
        sa.Column('excluded_symbols', JSONB, default=[]),
        sa.Column('min_confidence_score', sa.Numeric(5, 4), default=0.7),
        sa.Column('max_position_size_percentage', sa.Numeric(5, 2), default=5.0),
        sa.Column('min_risk_reward_ratio', sa.Numeric(8, 4), default=1.5),
        sa.Column('max_drawdown_tolerance', sa.Numeric(5, 2), default=10.0),
        sa.Column('delivery_methods', JSONB, default=['push_notification', 'email']),
        sa.Column('quiet_hours_start', sa.String(5), default='22:00'),
        sa.Column('quiet_hours_end', sa.String(5), default='08:00'),
        sa.Column('timezone', sa.String(50), default='Asia/Kolkata'),
        sa.Column('max_signals_per_day', sa.Integer, default=10),
        sa.Column('max_signals_per_hour', sa.Integer, default=3),
        sa.Column('is_auto_trade_enabled', sa.Boolean, default=False),
        sa.Column('auto_trade_amount_per_signal', sa.Numeric(10, 2)),
        sa.Column('auto_trade_stop_loss_percentage', sa.Numeric(5, 2), default=5.0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
    )
    
    # 6. Signal Analytics table
    op.create_table(
        'signal_analytics',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('period_type', sa.String(20), nullable=False),
        sa.Column('provider_id', UUID(as_uuid=True), sa.ForeignKey('signal_providers.id')),
        sa.Column('total_signals_generated', sa.Integer, default=0),
        sa.Column('total_signals_executed', sa.Integer, default=0),
        sa.Column('average_confidence_score', sa.Numeric(5, 4)),
        sa.Column('win_rate', sa.Numeric(5, 4)),
        sa.Column('average_return', sa.Numeric(8, 4)),
        sa.Column('average_holding_period_hours', sa.Numeric(8, 2)),
        sa.Column('sharpe_ratio', sa.Numeric(8, 4)),
        sa.Column('max_drawdown', sa.Numeric(8, 4)),
        sa.Column('total_subscribers', sa.Integer, default=0),
        sa.Column('execution_rate', sa.Numeric(5, 4)),
        sa.Column('average_user_rating', sa.Numeric(3, 2)),
        sa.Column('subscription_revenue', sa.Numeric(15, 2), default=0),
        sa.Column('commission_revenue', sa.Numeric(15, 2), default=0),
        sa.Column('asset_class_distribution', JSONB, default={}),
        sa.Column('signal_type_distribution', JSONB, default={}),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        
        # Constraints
        sa.UniqueConstraint('date', 'period_type', 'provider_id', name='unique_analytics_period'),
    )
    
    # 7. Signal Backtests table
    op.create_table(
        'signal_backtests',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('strategy_name', sa.String(100), nullable=False),
        sa.Column('provider_id', UUID(as_uuid=True), sa.ForeignKey('signal_providers.id')),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('initial_capital', sa.Numeric(15, 2), nullable=False),
        sa.Column('final_value', sa.Numeric(15, 2)),
        sa.Column('total_return', sa.Numeric(8, 4)),
        sa.Column('annualized_return', sa.Numeric(8, 4)),
        sa.Column('max_drawdown', sa.Numeric(8, 4)),
        sa.Column('sharpe_ratio', sa.Numeric(8, 4)),
        sa.Column('sortino_ratio', sa.Numeric(8, 4)),
        sa.Column('total_trades', sa.Integer),
        sa.Column('winning_trades', sa.Integer),
        sa.Column('losing_trades', sa.Integer),
        sa.Column('win_rate', sa.Numeric(5, 4)),
        sa.Column('average_win', sa.Numeric(8, 4)),
        sa.Column('average_loss', sa.Numeric(8, 4)),
        sa.Column('largest_win', sa.Numeric(8, 4)),
        sa.Column('largest_loss', sa.Numeric(8, 4)),
        sa.Column('calmar_ratio', sa.Numeric(8, 4)),
        sa.Column('profit_factor', sa.Numeric(8, 4)),
        sa.Column('recovery_factor', sa.Numeric(8, 4)),
        sa.Column('equity_curve', JSONB),
        sa.Column('trade_log', JSONB),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Create indexes for performance
    
    # Trading signals indexes
    op.create_index('idx_signal_symbol_exchange', 'trading_signals', ['symbol', 'exchange'])
    op.create_index('idx_signal_generated_at', 'trading_signals', ['generated_at'])
    op.create_index('idx_signal_status', 'trading_signals', ['status'])
    op.create_index('idx_signal_subscription_tier', 'trading_signals', ['min_subscription_tier'])
    op.create_index('idx_signal_priority', 'trading_signals', ['priority'])
    op.create_index('idx_signal_asset_class', 'trading_signals', ['asset_class'])
    op.create_index('idx_signal_valid_until', 'trading_signals', ['valid_until'])
    
    # Signal subscriptions indexes
    op.create_index('idx_subscription_user_id', 'signal_subscriptions', ['user_id'])
    op.create_index('idx_subscription_signal_id', 'signal_subscriptions', ['signal_id'])
    op.create_index('idx_subscription_tier', 'signal_subscriptions', ['subscription_tier'])
    op.create_index('idx_subscription_subscribed_at', 'signal_subscriptions', ['subscribed_at'])
    
    # Signal performance indexes
    op.create_index('idx_performance_signal_date', 'signal_performance', ['signal_id', 'date'])
    op.create_index('idx_performance_date', 'signal_performance', ['date'])
    
    # Signal analytics indexes
    op.create_index('idx_analytics_date_period', 'signal_analytics', ['date', 'period_type'])
    op.create_index('idx_analytics_provider', 'signal_analytics', ['provider_id'])
    
    # Signal backtests indexes
    op.create_index('idx_backtest_provider', 'signal_backtests', ['provider_id'])
    op.create_index('idx_backtest_dates', 'signal_backtests', ['start_date', 'end_date'])
    op.create_index('idx_backtest_strategy', 'signal_backtests', ['strategy_name'])


def downgrade():
    """Drop signal-related tables"""
    
    # Drop indexes first
    op.drop_index('idx_backtest_strategy', 'signal_backtests')
    op.drop_index('idx_backtest_dates', 'signal_backtests')
    op.drop_index('idx_backtest_provider', 'signal_backtests')
    op.drop_index('idx_analytics_provider', 'signal_analytics')
    op.drop_index('idx_analytics_date_period', 'signal_analytics')
    op.drop_index('idx_performance_date', 'signal_performance')
    op.drop_index('idx_performance_signal_date', 'signal_performance')
    op.drop_index('idx_subscription_subscribed_at', 'signal_subscriptions')
    op.drop_index('idx_subscription_tier', 'signal_subscriptions')
    op.drop_index('idx_subscription_signal_id', 'signal_subscriptions')
    op.drop_index('idx_subscription_user_id', 'signal_subscriptions')
    op.drop_index('idx_signal_valid_until', 'trading_signals')
    op.drop_index('idx_signal_asset_class', 'trading_signals')
    op.drop_index('idx_signal_priority', 'trading_signals')
    op.drop_index('idx_signal_subscription_tier', 'trading_signals')
    op.drop_index('idx_signal_status', 'trading_signals')
    op.drop_index('idx_signal_generated_at', 'trading_signals')
    op.drop_index('idx_signal_symbol_exchange', 'trading_signals')
    
    # Drop tables in reverse order
    op.drop_table('signal_backtests')
    op.drop_table('signal_analytics')
    op.drop_table('user_signal_preferences')
    op.drop_table('signal_performance')
    op.drop_table('signal_subscriptions')
    op.drop_table('trading_signals')
    op.drop_table('signal_providers')