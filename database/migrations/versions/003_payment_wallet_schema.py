"""Payment and wallet schema migration

Revision ID: 003_payment_wallet
Revises: 002_user_profile_kyc
Create Date: 2025-09-10 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_payment_wallet'
down_revision = '002_user_profile_kyc'
branch_labels = None
depends_on = None


def upgrade():
    # Create enum types
    op.execute("CREATE TYPE paymentmethodtype AS ENUM ('card', 'upi', 'netbanking', 'wallet', 'bank_transfer')")
    op.execute("CREATE TYPE cardbrand AS ENUM ('visa', 'mastercard', 'rupay', 'amex', 'diners')")
    op.execute("CREATE TYPE transactiontype AS ENUM ('credit', 'debit', 'refund', 'reversal')")
    op.execute("CREATE TYPE transactioncategory AS ENUM ('deposit', 'withdrawal', 'subscription', 'purchase', 'refund', 'fee', 'reward', 'transfer')")
    op.execute("CREATE TYPE transactionstatus AS ENUM ('pending', 'processing', 'success', 'failed', 'cancelled', 'expired')")
    op.execute("CREATE TYPE withdrawalstatus AS ENUM ('pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled')")
    op.execute("CREATE TYPE paymentgateway AS ENUM ('razorpay', 'stripe', 'paytm', 'phonepe', 'mock')")
    
    # Create wallets table
    op.create_table('wallets',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('balance', sa.DECIMAL(precision=12, scale=2), nullable=False, server_default='0.00'),
        sa.Column('locked_balance', sa.DECIMAL(precision=12, scale=2), nullable=False, server_default='0.00'),
        sa.Column('currency', sa.String(length=3), nullable=False, server_default='INR'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_frozen', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('frozen_reason', sa.Text(), nullable=True),
        sa.Column('frozen_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('frozen_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('daily_limit', sa.DECIMAL(precision=12, scale=2), nullable=True),
        sa.Column('monthly_limit', sa.DECIMAL(precision=12, scale=2), nullable=True),
        sa.Column('daily_spent', sa.DECIMAL(precision=12, scale=2), nullable=False, server_default='0.00'),
        sa.Column('monthly_spent', sa.DECIMAL(precision=12, scale=2), nullable=False, server_default='0.00'),
        sa.Column('daily_reset_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('monthly_reset_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['frozen_by'], ['users.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
        sa.CheckConstraint('balance >= 0', name='wallet_balance_positive'),
        sa.CheckConstraint('locked_balance >= 0', name='wallet_locked_balance_positive'),
        sa.CheckConstraint('daily_spent >= 0', name='wallet_daily_spent_positive'),
        sa.CheckConstraint('monthly_spent >= 0', name='wallet_monthly_spent_positive')
    )
    op.create_index('idx_wallet_active', 'wallets', ['is_active'])
    op.create_index('idx_wallet_user', 'wallets', ['user_id'])
    op.create_index(op.f('ix_wallets_id'), 'wallets', ['id'])
    
    # Create payment_methods table
    op.create_table('payment_methods',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('method_type', postgresql.ENUM('card', 'upi', 'netbanking', 'wallet', 'bank_transfer', name='paymentmethodtype'), nullable=False),
        sa.Column('provider', sa.String(length=50), nullable=True),
        sa.Column('token', sa.String(length=255), nullable=True),
        sa.Column('gateway_token', sa.String(length=255), nullable=True),
        sa.Column('last_four', sa.String(length=4), nullable=True),
        sa.Column('display_name', sa.String(length=100), nullable=False),
        sa.Column('card_brand', postgresql.ENUM('visa', 'mastercard', 'rupay', 'amex', 'diners', name='cardbrand'), nullable=True),
        sa.Column('card_expiry', sa.String(length=7), nullable=True),
        sa.Column('card_holder_name', sa.String(length=100), nullable=True),
        sa.Column('card_network', sa.String(length=20), nullable=True),
        sa.Column('upi_id', sa.String(length=100), nullable=True),
        sa.Column('upi_provider', sa.String(length=50), nullable=True),
        sa.Column('bank_name', sa.String(length=100), nullable=True),
        sa.Column('bank_code', sa.String(length=10), nullable=True),
        sa.Column('account_number_masked', sa.String(length=20), nullable=True),
        sa.Column('account_type', sa.String(length=20), nullable=True),
        sa.Column('wallet_provider', sa.String(length=50), nullable=True),
        sa.Column('wallet_phone', sa.String(length=15), nullable=True),
        sa.Column('is_default', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('fingerprint', sa.String(length=255), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token')
    )
    op.create_index('idx_payment_method_default', 'payment_methods', ['user_id', 'is_default'])
    op.create_index('idx_payment_method_type', 'payment_methods', ['method_type'])
    op.create_index('idx_payment_method_user', 'payment_methods', ['user_id'])
    op.create_index(op.f('ix_payment_methods_id'), 'payment_methods', ['id'])
    
    # Create transactions table
    op.create_table('transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('wallet_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('transaction_id', sa.String(length=100), nullable=False),
        sa.Column('external_transaction_id', sa.String(length=255), nullable=True),
        sa.Column('type', postgresql.ENUM('credit', 'debit', 'refund', 'reversal', name='transactiontype'), nullable=False),
        sa.Column('category', postgresql.ENUM('deposit', 'withdrawal', 'subscription', 'purchase', 'refund', 'fee', 'reward', 'transfer', name='transactioncategory'), nullable=False),
        sa.Column('amount', sa.DECIMAL(precision=12, scale=2), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=False, server_default='INR'),
        sa.Column('payment_method_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('gateway', postgresql.ENUM('razorpay', 'stripe', 'paytm', 'phonepe', 'mock', name='paymentgateway'), nullable=True),
        sa.Column('gateway_transaction_id', sa.String(length=255), nullable=True),
        sa.Column('gateway_order_id', sa.String(length=255), nullable=True),
        sa.Column('gateway_payment_id', sa.String(length=255), nullable=True),
        sa.Column('status', postgresql.ENUM('pending', 'processing', 'success', 'failed', 'cancelled', 'expired', name='transactionstatus'), nullable=False, server_default='pending'),
        sa.Column('status_message', sa.Text(), nullable=True),
        sa.Column('failure_reason', sa.String(length=255), nullable=True),
        sa.Column('parent_transaction_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('gateway_fee', sa.DECIMAL(precision=10, scale=2), nullable=False, server_default='0.00'),
        sa.Column('platform_fee', sa.DECIMAL(precision=10, scale=2), nullable=False, server_default='0.00'),
        sa.Column('gst_amount', sa.DECIMAL(precision=10, scale=2), nullable=False, server_default='0.00'),
        sa.Column('tds_amount', sa.DECIMAL(precision=10, scale=2), nullable=False, server_default='0.00'),
        sa.Column('net_amount', sa.DECIMAL(precision=12, scale=2), nullable=False),
        sa.Column('balance_before', sa.DECIMAL(precision=12, scale=2), nullable=True),
        sa.Column('balance_after', sa.DECIMAL(precision=12, scale=2), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('reference_id', sa.String(length=255), nullable=True),
        sa.Column('reference_type', sa.String(length=50), nullable=True),
        sa.Column('initiated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('authorized_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('captured_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('failed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['parent_transaction_id'], ['transactions.id']),
        sa.ForeignKeyConstraint(['payment_method_id'], ['payment_methods.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['wallet_id'], ['wallets.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('transaction_id'),
        sa.CheckConstraint('amount > 0', name='transaction_amount_positive'),
        sa.CheckConstraint('net_amount >= 0', name='transaction_net_amount_positive')
    )
    op.create_index('idx_transaction_created', 'transactions', ['created_at'])
    op.create_index('idx_transaction_gateway', 'transactions', ['gateway', 'gateway_transaction_id'])
    op.create_index('idx_transaction_reference', 'transactions', ['reference_type', 'reference_id'])
    op.create_index('idx_transaction_user_status', 'transactions', ['user_id', 'status'])
    op.create_index(op.f('ix_transactions_category'), 'transactions', ['category'])
    op.create_index(op.f('ix_transactions_gateway_transaction_id'), 'transactions', ['gateway_transaction_id'])
    op.create_index(op.f('ix_transactions_id'), 'transactions', ['id'])
    op.create_index(op.f('ix_transactions_status'), 'transactions', ['status'])
    op.create_index(op.f('ix_transactions_transaction_id'), 'transactions', ['transaction_id'])
    op.create_index(op.f('ix_transactions_type'), 'transactions', ['type'])
    op.create_index(op.f('ix_transactions_user_id'), 'transactions', ['user_id'])
    op.create_index(op.f('ix_transactions_wallet_id'), 'transactions', ['wallet_id'])
    
    # Create payment_webhooks table
    op.create_table('payment_webhooks',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('gateway', postgresql.ENUM('razorpay', 'stripe', 'paytm', 'phonepe', 'mock', name='paymentgateway'), nullable=False),
        sa.Column('event_type', sa.String(length=100), nullable=False),
        sa.Column('event_id', sa.String(length=255), nullable=False),
        sa.Column('headers', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('payload', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('signature', sa.String(length=500), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('is_processed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('retry_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('transaction_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('verification_error', sa.Text(), nullable=True),
        sa.Column('received_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['transaction_id'], ['transactions.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('event_id')
    )
    op.create_index('idx_webhook_gateway_event', 'payment_webhooks', ['gateway', 'event_type'])
    op.create_index('idx_webhook_processed', 'payment_webhooks', ['is_processed'])
    op.create_index('idx_webhook_received', 'payment_webhooks', ['received_at'])
    op.create_index(op.f('ix_payment_webhooks_event_id'), 'payment_webhooks', ['event_id'])
    op.create_index(op.f('ix_payment_webhooks_event_type'), 'payment_webhooks', ['event_type'])
    op.create_index(op.f('ix_payment_webhooks_gateway'), 'payment_webhooks', ['gateway'])
    op.create_index(op.f('ix_payment_webhooks_id'), 'payment_webhooks', ['id'])
    
    # Create withdrawal_requests table
    op.create_table('withdrawal_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('wallet_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('amount', sa.DECIMAL(precision=12, scale=2), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=False, server_default='INR'),
        sa.Column('bank_account_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('account_number', sa.String(length=50), nullable=False),
        sa.Column('ifsc_code', sa.String(length=11), nullable=False),
        sa.Column('account_holder_name', sa.String(length=100), nullable=False),
        sa.Column('bank_name', sa.String(length=100), nullable=True),
        sa.Column('status', postgresql.ENUM('pending', 'approved', 'processing', 'completed', 'rejected', 'cancelled', name='withdrawalstatus'), nullable=False, server_default='pending'),
        sa.Column('approved_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejected_reason', sa.Text(), nullable=True),
        sa.Column('transaction_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('utr_number', sa.String(length=50), nullable=True),
        sa.Column('processing_fee', sa.DECIMAL(precision=10, scale=2), nullable=False, server_default='0.00'),
        sa.Column('net_amount', sa.DECIMAL(precision=12, scale=2), nullable=False),
        sa.Column('requested_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['approved_by'], ['users.id']),
        sa.ForeignKeyConstraint(['bank_account_id'], ['payment_methods.id']),
        sa.ForeignKeyConstraint(['transaction_id'], ['transactions.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['wallet_id'], ['wallets.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('amount > 0', name='withdrawal_amount_positive'),
        sa.CheckConstraint('net_amount >= 0', name='withdrawal_net_amount_positive')
    )
    op.create_index('idx_withdrawal_requested', 'withdrawal_requests', ['requested_at'])
    op.create_index('idx_withdrawal_user_status', 'withdrawal_requests', ['user_id', 'status'])
    op.create_index(op.f('ix_withdrawal_requests_id'), 'withdrawal_requests', ['id'])
    op.create_index(op.f('ix_withdrawal_requests_status'), 'withdrawal_requests', ['status'])
    op.create_index(op.f('ix_withdrawal_requests_user_id'), 'withdrawal_requests', ['user_id'])
    
    # Add triggers for updated_at columns
    op.execute("""
        CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)
    
    op.execute("""
        CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)
    
    op.execute("""
        CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)
    
    op.execute("""
        CREATE TRIGGER update_withdrawal_requests_updated_at BEFORE UPDATE ON withdrawal_requests
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)


def downgrade():
    # Drop triggers
    op.execute("DROP TRIGGER IF EXISTS update_withdrawal_requests_updated_at ON withdrawal_requests")
    op.execute("DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions")
    op.execute("DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods")
    op.execute("DROP TRIGGER IF EXISTS update_wallets_updated_at ON wallets")
    
    # Drop tables
    op.drop_table('withdrawal_requests')
    op.drop_table('payment_webhooks')
    op.drop_table('transactions')
    op.drop_table('payment_methods')
    op.drop_table('wallets')
    
    # Drop enum types
    op.execute("DROP TYPE IF EXISTS paymentgateway")
    op.execute("DROP TYPE IF EXISTS withdrawalstatus")
    op.execute("DROP TYPE IF EXISTS transactionstatus")
    op.execute("DROP TYPE IF EXISTS transactioncategory")
    op.execute("DROP TYPE IF EXISTS transactiontype")
    op.execute("DROP TYPE IF EXISTS cardbrand")
    op.execute("DROP TYPE IF EXISTS paymentmethodtype")