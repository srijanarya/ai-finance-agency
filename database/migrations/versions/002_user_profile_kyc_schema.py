"""User profile and KYC schema migration

Revision ID: 002_user_profile_kyc
Revises: 112b37a02444
Create Date: 2025-09-10 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_user_profile_kyc'
down_revision = '112b37a02444'
branch_labels = None
depends_on = None


def upgrade():
    # Create enum types
    op.execute("CREATE TYPE incomebracket AS ENUM ('0-3L', '3-10L', '10L+', 'not_disclosed')")
    op.execute("CREATE TYPE kycdocumenttype AS ENUM ('PAN', 'AADHAAR', 'BANK_STATEMENT', 'UTILITY_BILL', 'PASSPORT', 'DRIVING_LICENSE', 'VOTER_ID')")
    op.execute("CREATE TYPE kycverificationstatus AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED')")
    op.execute("CREATE TYPE addressverificationmethod AS ENUM ('AADHAAR', 'UTILITY_BILL', 'BANK_STATEMENT', 'RENTAL_AGREEMENT', 'PROPERTY_DEED')")
    
    # Create user_profiles table
    op.create_table('user_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.String(length=10), nullable=True),
        sa.Column('phone_secondary', sa.String(length=15), nullable=True),
        sa.Column('address_line_1', sa.String(length=255), nullable=True),
        sa.Column('address_line_2', sa.String(length=255), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('pin_code', sa.String(length=6), nullable=True),
        sa.Column('country', sa.String(length=3), nullable=False, server_default='IND'),
        sa.Column('income_bracket', postgresql.ENUM('0-3L', '3-10L', '10L+', 'not_disclosed', name='incomebracket'), nullable=False, server_default='not_disclosed'),
        sa.Column('occupation', sa.String(length=100), nullable=True),
        sa.Column('employer_name', sa.String(length=255), nullable=True),
        sa.Column('bank_name', sa.String(length=100), nullable=True),
        sa.Column('bank_account_number', sa.String(length=255), nullable=True),
        sa.Column('bank_ifsc_code', sa.String(length=11), nullable=True),
        sa.Column('bank_account_holder_name', sa.String(length=255), nullable=True),
        sa.Column('pan_number', sa.String(length=255), nullable=True),
        sa.Column('aadhaar_number', sa.String(length=255), nullable=True),
        sa.Column('profile_completion_percentage', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_profile_complete', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('investment_preferences', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('risk_appetite', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
        sa.CheckConstraint("pin_code ~ '^[0-9]{6}$'", name='profile_pin_code_format'),
        sa.CheckConstraint("bank_ifsc_code ~ '^[A-Z]{4}0[A-Z0-9]{6}$'", name='profile_ifsc_format')
    )
    op.create_index('idx_profile_completion', 'user_profiles', ['profile_completion_percentage'])
    op.create_index('idx_profile_created', 'user_profiles', ['created_at'])
    op.create_index(op.f('ix_user_profiles_id'), 'user_profiles', ['id'])
    op.create_index(op.f('ix_user_profiles_user_id'), 'user_profiles', ['user_id'])
    
    # Create kyc_documents table
    op.create_table('kyc_documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_profile_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('document_type', postgresql.ENUM('PAN', 'AADHAAR', 'BANK_STATEMENT', 'UTILITY_BILL', 'PASSPORT', 'DRIVING_LICENSE', 'VOTER_ID', name='kycdocumenttype'), nullable=False),
        sa.Column('document_number', sa.String(length=255), nullable=True),
        sa.Column('document_name', sa.String(length=255), nullable=True),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('file_hash', sa.String(length=255), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('mime_type', sa.String(length=100), nullable=False),
        sa.Column('encryption_key_id', sa.String(length=255), nullable=True),
        sa.Column('is_encrypted', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('verification_status', postgresql.ENUM('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED', name='kycverificationstatus'), nullable=False, server_default='PENDING'),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('verified_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('verification_notes', sa.Text(), nullable=True),
        sa.Column('digilocker_reference', sa.String(length=255), nullable=True),
        sa.Column('external_verification_id', sa.String(length=255), nullable=True),
        sa.Column('external_verification_response', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('issue_date', sa.Date(), nullable=True),
        sa.Column('expiry_date', sa.Date(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_profile_id'], ['user_profiles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['verified_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'document_type', 'deleted_at', name='unique_document_type_per_user')
    )
    op.create_index('idx_kyc_doc_status', 'kyc_documents', ['verification_status'])
    op.create_index('idx_kyc_doc_uploaded', 'kyc_documents', ['uploaded_at'])
    op.create_index('idx_kyc_doc_user_type', 'kyc_documents', ['user_id', 'document_type'])
    op.create_index(op.f('ix_kyc_documents_document_type'), 'kyc_documents', ['document_type'])
    op.create_index(op.f('ix_kyc_documents_id'), 'kyc_documents', ['id'])
    op.create_index(op.f('ix_kyc_documents_user_id'), 'kyc_documents', ['user_id'])
    op.create_index(op.f('ix_kyc_documents_user_profile_id'), 'kyc_documents', ['user_profile_id'])
    
    # Create kyc_status table
    op.create_table('kyc_status',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_profile_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('overall_status', postgresql.ENUM('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED', name='kycverificationstatus'), nullable=False, server_default='PENDING'),
        sa.Column('pan_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('pan_verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('aadhaar_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('aadhaar_verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('address_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('address_verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('bank_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('bank_verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('reviewer_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('review_notes', sa.Text(), nullable=True),
        sa.Column('risk_score', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('risk_factors', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='[]'),
        sa.Column('compliance_notes', sa.Text(), nullable=True),
        sa.Column('daily_transaction_limit', sa.Float(), nullable=True),
        sa.Column('monthly_transaction_limit', sa.Float(), nullable=True),
        sa.Column('video_kyc_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('video_kyc_completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('in_person_verification', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['reviewer_id'], ['users.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_profile_id'], ['user_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
        sa.UniqueConstraint('user_profile_id'),
        sa.CheckConstraint('risk_score >= 0 AND risk_score <= 100', name='kyc_status_risk_score_range')
    )
    op.create_index('idx_kyc_status_overall', 'kyc_status', ['overall_status'])
    op.create_index('idx_kyc_status_risk', 'kyc_status', ['risk_score'])
    op.create_index('idx_kyc_status_submitted', 'kyc_status', ['submitted_at'])
    op.create_index(op.f('ix_kyc_status_id'), 'kyc_status', ['id'])
    op.create_index(op.f('ix_kyc_status_user_id'), 'kyc_status', ['user_id'])
    
    # Create address_verifications table
    op.create_table('address_verifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_profile_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('address_line_1', sa.String(length=255), nullable=False),
        sa.Column('address_line_2', sa.String(length=255), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=False),
        sa.Column('pin_code', sa.String(length=6), nullable=False),
        sa.Column('country', sa.String(length=3), nullable=False, server_default='IND'),
        sa.Column('verification_method', postgresql.ENUM('AADHAAR', 'UTILITY_BILL', 'BANK_STATEMENT', 'RENTAL_AGREEMENT', 'PROPERTY_DEED', name='addressverificationmethod'), nullable=False),
        sa.Column('verification_status', postgresql.ENUM('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED', name='kycverificationstatus'), nullable=False, server_default='PENDING'),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('kyc_document_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_current_address', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_permanent_address', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('pin_code_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('google_maps_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['kyc_document_id'], ['kyc_documents.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_profile_id'], ['user_profiles.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint("pin_code ~ '^[0-9]{6}$'", name='address_pin_code_format')
    )
    op.create_index('idx_address_pin_code', 'address_verifications', ['pin_code'])
    op.create_index('idx_address_status', 'address_verifications', ['verification_status'])
    op.create_index('idx_address_user', 'address_verifications', ['user_id'])
    op.create_index(op.f('ix_address_verifications_id'), 'address_verifications', ['id'])
    op.create_index(op.f('ix_address_verifications_user_id'), 'address_verifications', ['user_id'])
    op.create_index(op.f('ix_address_verifications_user_profile_id'), 'address_verifications', ['user_profile_id'])
    op.create_index(op.f('ix_address_verifications_verification_status'), 'address_verifications', ['verification_status'])
    
    # Add triggers for updated_at columns
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)
    
    op.execute("""
        CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)
    
    op.execute("""
        CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON kyc_documents
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)
    
    op.execute("""
        CREATE TRIGGER update_kyc_status_updated_at BEFORE UPDATE ON kyc_status
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)
    
    op.execute("""
        CREATE TRIGGER update_address_verifications_updated_at BEFORE UPDATE ON address_verifications
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)


def downgrade():
    # Drop triggers
    op.execute("DROP TRIGGER IF EXISTS update_address_verifications_updated_at ON address_verifications")
    op.execute("DROP TRIGGER IF EXISTS update_kyc_status_updated_at ON kyc_status")
    op.execute("DROP TRIGGER IF EXISTS update_kyc_documents_updated_at ON kyc_documents")
    op.execute("DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column()")
    
    # Drop tables
    op.drop_table('address_verifications')
    op.drop_table('kyc_status')
    op.drop_table('kyc_documents')
    op.drop_table('user_profiles')
    
    # Drop enum types
    op.execute("DROP TYPE IF EXISTS addressverificationmethod")
    op.execute("DROP TYPE IF EXISTS kycverificationstatus")
    op.execute("DROP TYPE IF EXISTS kycdocumenttype")
    op.execute("DROP TYPE IF EXISTS incomebracket")