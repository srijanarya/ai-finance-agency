"""
Unit tests for User Profile and KYC models
Tests model creation, validation, and business logic
"""

import pytest
from datetime import datetime, date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import uuid4

from database.connection import Base
from database.models import User, UserRole, UserStatus, Tenant
from database.models.profile_models import (
    UserProfile, KYCDocument, KYCStatus, AddressVerification,
    IncomeBracket, KYCDocumentType, KYCVerificationStatus,
    AddressVerificationMethod
)


@pytest.fixture
def test_db():
    """Create a test database session"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture
def test_tenant(test_db):
    """Create a test tenant"""
    tenant = Tenant(
        id=uuid4(),
        name="Test Organization",
        subdomain="test-org",
        subscription_tier="premium"
    )
    test_db.add(tenant)
    test_db.commit()
    return tenant


@pytest.fixture
def test_user(test_db, test_tenant):
    """Create a test user"""
    user = User(
        id=uuid4(),
        tenant_id=test_tenant.id,
        email="test@example.com",
        password_hash="hashed_password",
        first_name="Test",
        last_name="User",
        role=UserRole.USER,
        status=UserStatus.ACTIVE,
        email_verified=True
    )
    test_db.add(user)
    test_db.commit()
    return user


class TestUserProfile:
    """Test cases for UserProfile model"""
    
    def test_create_user_profile(self, test_db, test_user):
        """Test creating a user profile"""
        profile = UserProfile(
            user_id=test_user.id,
            date_of_birth=date(1990, 1, 1),
            gender="M",
            phone_secondary="+919876543210",
            address_line_1="123 Test Street",
            city="Bangalore",
            state="Karnataka",
            pin_code="560001",
            income_bracket=IncomeBracket.BRACKET_3_10L,
            occupation="Software Engineer",
            pan_number="ABCDE1234F"
        )
        
        test_db.add(profile)
        test_db.commit()
        
        assert profile.id is not None
        assert profile.user_id == test_user.id
        assert profile.income_bracket == IncomeBracket.BRACKET_3_10L
        assert profile.country == "IND"  # Default value
    
    def test_profile_completion_calculation(self, test_db, test_user):
        """Test profile completion percentage calculation"""
        profile = UserProfile(user_id=test_user.id)
        test_db.add(profile)
        test_db.commit()
        
        # Initially empty profile
        assert profile.calculate_completion_percentage() == 0
        
        # Add some fields
        profile.date_of_birth = date(1990, 1, 1)
        profile.gender = "M"
        profile.address_line_1 = "123 Test Street"
        profile.city = "Bangalore"
        profile.state = "Karnataka"
        
        completion = profile.calculate_completion_percentage()
        assert completion == 55  # 5 out of 9 required fields
        
        # Complete all required fields
        profile.pin_code = "560001"
        profile.income_bracket = IncomeBracket.BRACKET_3_10L
        profile.occupation = "Software Engineer"
        profile.pan_number = "ABCDE1234F"
        
        completion = profile.calculate_completion_percentage()
        assert completion == 100
    
    def test_profile_completion_status_update(self, test_db, test_user):
        """Test profile completion status update"""
        profile = UserProfile(user_id=test_user.id)
        test_db.add(profile)
        
        # Initially incomplete
        profile.update_completion_status()
        assert profile.is_profile_complete is False
        
        # Add required fields
        profile.date_of_birth = date(1990, 1, 1)
        profile.gender = "M"
        profile.address_line_1 = "123 Test Street"
        profile.city = "Bangalore"
        profile.state = "Karnataka"
        profile.pin_code = "560001"
        profile.income_bracket = IncomeBracket.BRACKET_3_10L
        profile.occupation = "Software Engineer"
        profile.pan_number = "ABCDE1234F"
        
        profile.update_completion_status()
        assert profile.profile_completion_percentage >= 90
        assert profile.is_profile_complete is True


class TestKYCDocument:
    """Test cases for KYCDocument model"""
    
    def test_create_kyc_document(self, test_db, test_user):
        """Test creating a KYC document"""
        profile = UserProfile(user_id=test_user.id)
        test_db.add(profile)
        test_db.commit()
        
        document = KYCDocument(
            user_id=test_user.id,
            user_profile_id=profile.id,
            document_type=KYCDocumentType.PAN,
            document_number="ABCDE1234F",
            document_name="pan_card.pdf",
            file_path="/encrypted/path/to/file",
            file_hash="sha256_hash_here",
            file_size=1024000,
            mime_type="application/pdf",
            encryption_key_id="key_123",
            is_encrypted=True
        )
        
        test_db.add(document)
        test_db.commit()
        
        assert document.id is not None
        assert document.verification_status == KYCVerificationStatus.PENDING
        assert document.is_encrypted is True
    
    def test_document_verification(self, test_db, test_user):
        """Test document verification methods"""
        profile = UserProfile(user_id=test_user.id)
        test_db.add(profile)
        test_db.commit()
        
        document = KYCDocument(
            user_id=test_user.id,
            user_profile_id=profile.id,
            document_type=KYCDocumentType.AADHAAR,
            file_path="/test/path",
            file_hash="test_hash",
            file_size=1024,
            mime_type="image/jpeg"
        )
        
        test_db.add(document)
        test_db.commit()
        
        # Test marking as verified
        verifier_id = uuid4()
        document.mark_as_verified(verifier_id, "Verified via DigiLocker")
        
        assert document.verification_status == KYCVerificationStatus.VERIFIED
        assert document.verified_at is not None
        assert document.verified_by == verifier_id
        assert document.rejection_reason is None
        
        # Test marking as rejected
        document2 = KYCDocument(
            user_id=test_user.id,
            user_profile_id=profile.id,
            document_type=KYCDocumentType.BANK_STATEMENT,
            file_path="/test/path2",
            file_hash="test_hash2",
            file_size=2048,
            mime_type="application/pdf"
        )
        test_db.add(document2)
        
        document2.mark_as_rejected(verifier_id, "Document unclear", "Please upload a clearer copy")
        
        assert document2.verification_status == KYCVerificationStatus.REJECTED
        assert document2.rejection_reason == "Document unclear"
        assert document2.verification_notes == "Please upload a clearer copy"
    
    def test_document_expiry(self, test_db, test_user):
        """Test document expiry detection"""
        profile = UserProfile(user_id=test_user.id)
        test_db.add(profile)
        test_db.commit()
        
        # Create expired document
        document = KYCDocument(
            user_id=test_user.id,
            user_profile_id=profile.id,
            document_type=KYCDocumentType.PASSPORT,
            file_path="/test/path",
            file_hash="test_hash",
            file_size=1024,
            mime_type="image/jpeg",
            issue_date=date(2015, 1, 1),
            expiry_date=date(2020, 1, 1)  # Expired
        )
        
        test_db.add(document)
        test_db.commit()
        
        assert document.is_expired is True
        assert document.is_valid is False
        
        # Create valid document
        document2 = KYCDocument(
            user_id=test_user.id,
            user_profile_id=profile.id,
            document_type=KYCDocumentType.DRIVING_LICENSE,
            file_path="/test/path2",
            file_hash="test_hash2",
            file_size=1024,
            mime_type="image/jpeg",
            expiry_date=date(2030, 1, 1),  # Future date
            verification_status=KYCVerificationStatus.VERIFIED
        )
        
        test_db.add(document2)
        test_db.commit()
        
        assert document2.is_expired is False
        assert document2.is_valid is True
    
    def test_document_soft_delete(self, test_db, test_user):
        """Test soft deletion of documents"""
        profile = UserProfile(user_id=test_user.id)
        test_db.add(profile)
        test_db.commit()
        
        document = KYCDocument(
            user_id=test_user.id,
            user_profile_id=profile.id,
            document_type=KYCDocumentType.PAN,
            file_path="/test/path",
            file_hash="test_hash",
            file_size=1024,
            mime_type="application/pdf"
        )
        
        test_db.add(document)
        test_db.commit()
        
        # Soft delete
        document.soft_delete()
        
        assert document.deleted_at is not None
        assert document.is_valid is False


class TestKYCStatus:
    """Test cases for KYCStatus model"""
    
    def test_create_kyc_status(self, test_db, test_user):
        """Test creating KYC status"""
        profile = UserProfile(user_id=test_user.id)
        test_db.add(profile)
        test_db.commit()
        
        kyc_status = KYCStatus(
            user_id=test_user.id,
            user_profile_id=profile.id
        )
        
        test_db.add(kyc_status)
        test_db.commit()
        
        assert kyc_status.id is not None
        assert kyc_status.overall_status == KYCVerificationStatus.PENDING
        assert kyc_status.risk_score == 0
        assert kyc_status.pan_verified is False
    
    def test_risk_score_calculation(self, test_db, test_user):
        """Test risk score calculation"""
        profile = UserProfile(
            user_id=test_user.id,
            profile_completion_percentage=30
        )
        test_db.add(profile)
        test_db.commit()
        
        kyc_status = KYCStatus(
            user_id=test_user.id,
            user_profile_id=profile.id
        )
        test_db.add(kyc_status)
        
        # All documents unverified
        risk_score = kyc_status.calculate_risk_score()
        assert risk_score == 100  # Maximum risk
        assert len(kyc_status.risk_factors) > 0
        
        # Verify some documents
        kyc_status.pan_verified = True
        kyc_status.aadhaar_verified = True
        
        risk_score = kyc_status.calculate_risk_score()
        assert risk_score < 100
        assert risk_score > 0  # Still some risk
        
        # Add video KYC
        kyc_status.video_kyc_completed = True
        risk_score = kyc_status.calculate_risk_score()
        assert risk_score < 50  # Reduced risk with video KYC
    
    def test_overall_status_update(self, test_db, test_user):
        """Test overall KYC status update"""
        profile = UserProfile(user_id=test_user.id)
        test_db.add(profile)
        test_db.commit()
        
        kyc_status = KYCStatus(
            user_id=test_user.id,
            user_profile_id=profile.id
        )
        test_db.add(kyc_status)
        
        # Initially pending
        kyc_status.update_overall_status()
        assert kyc_status.overall_status == KYCVerificationStatus.PENDING
        
        # Partial verification
        kyc_status.pan_verified = True
        kyc_status.update_overall_status()
        assert kyc_status.overall_status == KYCVerificationStatus.UNDER_REVIEW
        
        # Full verification
        kyc_status.aadhaar_verified = True
        kyc_status.address_verified = True
        kyc_status.bank_verified = True
        kyc_status.update_overall_status()
        assert kyc_status.overall_status == KYCVerificationStatus.VERIFIED
        assert kyc_status.verified_at is not None
    
    def test_transaction_limits(self, test_db, test_user):
        """Test transaction limit setting"""
        profile = UserProfile(user_id=test_user.id)
        test_db.add(profile)
        test_db.commit()
        
        kyc_status = KYCStatus(
            user_id=test_user.id,
            user_profile_id=profile.id
        )
        test_db.add(kyc_status)
        
        # Unverified user - lowest limits
        kyc_status.set_transaction_limits()
        assert kyc_status.daily_transaction_limit == 10000.0
        assert kyc_status.monthly_transaction_limit == 50000.0
        
        # Verified user with low risk - highest limits
        kyc_status.overall_status = KYCVerificationStatus.VERIFIED
        kyc_status.risk_score = 10
        kyc_status.set_transaction_limits()
        assert kyc_status.daily_transaction_limit == 1000000.0
        assert kyc_status.monthly_transaction_limit == 10000000.0
        
        # Verified user with high risk - moderate limits
        kyc_status.risk_score = 75
        kyc_status.set_transaction_limits()
        assert kyc_status.daily_transaction_limit == 100000.0
        assert kyc_status.monthly_transaction_limit == 1000000.0


class TestAddressVerification:
    """Test cases for AddressVerification model"""
    
    def test_create_address_verification(self, test_db, test_user):
        """Test creating address verification"""
        profile = UserProfile(user_id=test_user.id)
        test_db.add(profile)
        test_db.commit()
        
        address = AddressVerification(
            user_id=test_user.id,
            user_profile_id=profile.id,
            address_line_1="123 Test Street",
            address_line_2="Apt 4B",
            city="Bangalore",
            state="Karnataka",
            pin_code="560001",
            verification_method=AddressVerificationMethod.AADHAAR,
            is_current_address=True
        )
        
        test_db.add(address)
        test_db.commit()
        
        assert address.id is not None
        assert address.verification_status == KYCVerificationStatus.PENDING
        assert address.is_current_address is True
        assert address.country == "IND"
    
    def test_multiple_addresses(self, test_db, test_user):
        """Test handling multiple addresses"""
        profile = UserProfile(user_id=test_user.id)
        test_db.add(profile)
        test_db.commit()
        
        # Current address
        current_address = AddressVerification(
            user_id=test_user.id,
            user_profile_id=profile.id,
            address_line_1="123 Current Street",
            city="Bangalore",
            state="Karnataka",
            pin_code="560001",
            verification_method=AddressVerificationMethod.UTILITY_BILL,
            is_current_address=True,
            is_permanent_address=False
        )
        
        # Permanent address
        permanent_address = AddressVerification(
            user_id=test_user.id,
            user_profile_id=profile.id,
            address_line_1="456 Permanent Road",
            city="Mumbai",
            state="Maharashtra",
            pin_code="400001",
            verification_method=AddressVerificationMethod.AADHAAR,
            is_current_address=False,
            is_permanent_address=True
        )
        
        test_db.add(current_address)
        test_db.add(permanent_address)
        test_db.commit()
        
        # Query addresses
        addresses = test_db.query(AddressVerification).filter(
            AddressVerification.user_id == test_user.id
        ).all()
        
        assert len(addresses) == 2
        
        current = [a for a in addresses if a.is_current_address][0]
        permanent = [a for a in addresses if a.is_permanent_address][0]
        
        assert current.city == "Bangalore"
        assert permanent.city == "Mumbai"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])