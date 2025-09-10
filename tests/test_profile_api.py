"""
Integration tests for Profile and KYC API endpoints
Tests API functionality, authentication, and data validation
"""

import pytest
import json
from datetime import datetime, date
from io import BytesIO
from unittest.mock import Mock, patch, MagicMock
from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import get_db
from database.connection import Base
from database.models import User, UserRole, UserStatus, Tenant
from database.models.profile_models import (
    UserProfile, KYCDocument, KYCStatus,
    IncomeBracket, KYCDocumentType, KYCVerificationStatus
)


# Test database setup
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module")
def test_db():
    """Create test database"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


@pytest.fixture
def test_tenant():
    """Create test tenant"""
    db = TestingSessionLocal()
    tenant = Tenant(
        id=uuid4(),
        name="Test Organization",
        subdomain="test-org",
        subscription_tier="premium"
    )
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    yield tenant
    db.delete(tenant)
    db.commit()
    db.close()


@pytest.fixture
def test_user(test_tenant):
    """Create test user"""
    db = TestingSessionLocal()
    user = User(
        id=uuid4(),
        tenant_id=test_tenant.id,
        email="test@example.com",
        password_hash="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # "password"
        first_name="Test",
        last_name="User",
        role=UserRole.USER,
        status=UserStatus.ACTIVE,
        email_verified=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user
    db.delete(user)
    db.commit()
    db.close()


@pytest.fixture
def auth_headers(test_user):
    """Create authentication headers"""
    # Mock JWT token for testing
    with patch('app.core.security.verify_token') as mock_verify:
        mock_verify.return_value = {"sub": test_user.email, "user_id": str(test_user.id)}
        return {"Authorization": "Bearer test_token"}


class TestProfileEndpoints:
    """Test cases for profile endpoints"""
    
    def test_get_profile_unauthenticated(self, client):
        """Test getting profile without authentication"""
        response = client.get("/api/v1/users/profile")
        assert response.status_code == 401
    
    @patch('app.core.security.authenticate_request')
    def test_get_profile_new_user(self, mock_auth, client, test_user):
        """Test getting profile for new user (creates profile)"""
        mock_auth.return_value = test_user
        
        response = client.get(
            "/api/v1/users/profile",
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == str(test_user.id)
        assert data["profile_completion_percentage"] == 0
        assert data["is_profile_complete"] is False
        assert data["income_bracket"] == "not_disclosed"
    
    @patch('app.core.security.authenticate_request')
    def test_update_profile(self, mock_auth, client, test_user):
        """Test updating user profile"""
        mock_auth.return_value = test_user
        
        profile_data = {
            "date_of_birth": "1990-01-01",
            "gender": "M",
            "phone_secondary": "+919876543210",
            "address_line_1": "123 Test Street",
            "city": "Bangalore",
            "state": "Karnataka",
            "pin_code": "560001",
            "income_bracket": "3-10L",
            "occupation": "Software Engineer",
            "pan_number": "ABCDE1234F"
        }
        
        response = client.put(
            "/api/v1/users/profile",
            json=profile_data,
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["city"] == "Bangalore"
        assert data["income_bracket"] == "3-10L"
        assert data["pan_number"] == "ABXXXX34F"  # Masked
        assert data["profile_completion_percentage"] > 0
    
    @patch('app.core.security.authenticate_request')
    def test_update_profile_invalid_data(self, mock_auth, client, test_user):
        """Test updating profile with invalid data"""
        mock_auth.return_value = test_user
        
        profile_data = {
            "pin_code": "INVALID",  # Should be 6 digits
            "income_bracket": "INVALID",  # Invalid bracket
            "pan_number": "INVALID123"  # Invalid PAN format
        }
        
        response = client.put(
            "/api/v1/users/profile",
            json=profile_data,
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 422  # Validation error
    
    @patch('app.core.security.authenticate_request')
    def test_update_profile_bank_details(self, mock_auth, client, test_user):
        """Test updating bank details in profile"""
        mock_auth.return_value = test_user
        
        profile_data = {
            "bank_name": "HDFC Bank",
            "bank_account_number": "1234567890",
            "bank_ifsc_code": "HDFC0001234",
            "bank_account_holder_name": "Test User"
        }
        
        response = client.put(
            "/api/v1/users/profile",
            json=profile_data,
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["bank_name"] == "HDFC Bank"
        assert data["bank_account_number"] == "XXXX7890"  # Masked
        assert data["bank_ifsc_code"] == "HDFC0001234"


class TestKYCDocumentEndpoints:
    """Test cases for KYC document endpoints"""
    
    @patch('app.core.security.authenticate_request')
    @patch('app.services.file_upload_service.file_upload_service.validate_file')
    @patch('app.services.file_upload_service.file_upload_service.save_encrypted_file')
    def test_upload_kyc_document(
        self, mock_save, mock_validate, mock_auth, client, test_user
    ):
        """Test uploading KYC document"""
        mock_auth.return_value = test_user
        mock_validate.return_value = (True, None)
        mock_save.return_value = (
            "/path/to/file",
            "file_hash_123",
            "key_123",
            1024
        )
        
        # Create a mock file
        file_content = b"mock pan card image"
        files = {
            "file": ("pan_card.jpg", BytesIO(file_content), "image/jpeg")
        }
        data = {
            "document_type": "PAN",
            "document_number": "ABCDE1234F"
        }
        
        response = client.post(
            "/api/v1/users/kyc/documents",
            files=files,
            data=data,
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 200
        result = response.json()
        assert result["success"] is True
        assert "document_id" in result
        assert result["verification_status"] in ["PENDING", "UNDER_REVIEW"]
    
    @patch('app.core.security.authenticate_request')
    def test_upload_kyc_document_invalid_type(self, mock_auth, client, test_user):
        """Test uploading document with invalid type"""
        mock_auth.return_value = test_user
        
        files = {
            "file": ("document.jpg", BytesIO(b"content"), "image/jpeg")
        }
        data = {
            "document_type": "INVALID_TYPE",
            "document_number": "12345"
        }
        
        response = client.post(
            "/api/v1/users/kyc/documents",
            files=files,
            data=data,
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 400
        assert "Invalid document type" in response.json()["detail"]
    
    @patch('app.core.security.authenticate_request')
    @patch('app.services.file_upload_service.file_upload_service.validate_file')
    def test_upload_kyc_document_validation_failed(
        self, mock_validate, mock_auth, client, test_user
    ):
        """Test uploading document that fails validation"""
        mock_auth.return_value = test_user
        mock_validate.return_value = (False, "File too large")
        
        files = {
            "file": ("large_file.jpg", BytesIO(b"x" * 11000000), "image/jpeg")
        }
        data = {
            "document_type": "AADHAAR"
        }
        
        response = client.post(
            "/api/v1/users/kyc/documents",
            files=files,
            data=data,
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 400
        assert "File too large" in response.json()["detail"]
    
    @patch('app.core.security.authenticate_request')
    def test_get_kyc_documents_empty(self, mock_auth, client, test_user):
        """Test getting KYC documents when none uploaded"""
        mock_auth.return_value = test_user
        
        response = client.get(
            "/api/v1/users/kyc/documents",
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 200
        assert response.json() == []
    
    @patch('app.core.security.authenticate_request')
    def test_get_kyc_documents_with_data(self, mock_auth, client, test_user):
        """Test getting KYC documents with uploaded documents"""
        mock_auth.return_value = test_user
        
        # Create test documents in database
        db = TestingSessionLocal()
        
        # Create profile first
        profile = UserProfile(user_id=test_user.id)
        db.add(profile)
        db.commit()
        
        # Create documents
        doc1 = KYCDocument(
            user_id=test_user.id,
            user_profile_id=profile.id,
            document_type=KYCDocumentType.PAN,
            document_number="ABCDE1234F",
            document_name="pan.pdf",
            file_path="/test/pan.pdf",
            file_hash="hash1",
            file_size=1024,
            mime_type="application/pdf",
            verification_status=KYCVerificationStatus.VERIFIED
        )
        
        doc2 = KYCDocument(
            user_id=test_user.id,
            user_profile_id=profile.id,
            document_type=KYCDocumentType.AADHAAR,
            document_number="123456789012",
            document_name="aadhaar.jpg",
            file_path="/test/aadhaar.jpg",
            file_hash="hash2",
            file_size=2048,
            mime_type="image/jpeg",
            verification_status=KYCVerificationStatus.PENDING
        )
        
        db.add(doc1)
        db.add(doc2)
        db.commit()
        
        response = client.get(
            "/api/v1/users/kyc/documents",
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 200
        documents = response.json()
        assert len(documents) == 2
        
        # Check document masking
        pan_doc = [d for d in documents if d["document_type"] == "PAN"][0]
        assert pan_doc["document_number"] == "ABXXXX34F"  # Masked
        assert pan_doc["verification_status"] == "VERIFIED"
        
        aadhaar_doc = [d for d in documents if d["document_type"] == "AADHAAR"][0]
        assert aadhaar_doc["document_number"] == "XXXX-XXXX-9012"  # Masked
        
        # Cleanup
        db.delete(doc1)
        db.delete(doc2)
        db.delete(profile)
        db.commit()
        db.close()


class TestKYCStatusEndpoints:
    """Test cases for KYC status endpoints"""
    
    @patch('app.core.security.authenticate_request')
    def test_get_kyc_status_new_user(self, mock_auth, client, test_user):
        """Test getting KYC status for new user"""
        mock_auth.return_value = test_user
        
        response = client.get(
            "/api/v1/users/kyc/status",
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["overall_status"] == "PENDING"
        assert data["pan_verified"] is False
        assert data["aadhaar_verified"] is False
        assert data["risk_score"] >= 0
        assert data["daily_transaction_limit"] == 10000.0
        assert data["documents"] == []
    
    @patch('app.core.security.authenticate_request')
    @patch('app.services.kyc_verification_service.kyc_verification_service.verify_pan_card')
    @patch('app.services.kyc_verification_service.kyc_verification_service.verify_aadhaar')
    def test_trigger_kyc_verification(
        self, mock_verify_aadhaar, mock_verify_pan, mock_auth, client, test_user
    ):
        """Test triggering KYC verification process"""
        mock_auth.return_value = test_user
        mock_verify_pan.return_value = {
            'verified': True,
            'pan_number': 'ABCDE1234F',
            'name_match': 0.95
        }
        mock_verify_aadhaar.return_value = {
            'verified': True,
            'aadhaar_number': 'XXXX-XXXX-9012',
            'name_match': 0.90
        }
        
        # Create profile and documents first
        db = TestingSessionLocal()
        
        profile = UserProfile(
            user_id=test_user.id,
            pan_number="ABCDE1234F",
            aadhaar_number="123456789012"
        )
        db.add(profile)
        db.commit()
        
        kyc_status = KYCStatus(
            user_id=test_user.id,
            user_profile_id=profile.id
        )
        db.add(kyc_status)
        
        doc = KYCDocument(
            user_id=test_user.id,
            user_profile_id=profile.id,
            document_type=KYCDocumentType.PAN,
            file_path="/test/pan.pdf",
            file_hash="hash1",
            file_size=1024,
            mime_type="application/pdf"
        )
        db.add(doc)
        db.commit()
        
        response = client.post(
            "/api/v1/users/kyc/verify",
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "verification_results" in data
        assert "risk_score" in data
        assert "transaction_limits" in data
        
        # Cleanup
        db.delete(doc)
        db.delete(kyc_status)
        db.delete(profile)
        db.commit()
        db.close()
    
    @patch('app.core.security.authenticate_request')
    def test_trigger_kyc_verification_no_documents(self, mock_auth, client, test_user):
        """Test triggering KYC verification without documents"""
        mock_auth.return_value = test_user
        
        # Create profile but no documents
        db = TestingSessionLocal()
        profile = UserProfile(user_id=test_user.id)
        db.add(profile)
        
        kyc_status = KYCStatus(
            user_id=test_user.id,
            user_profile_id=profile.id
        )
        db.add(kyc_status)
        db.commit()
        
        response = client.post(
            "/api/v1/users/kyc/verify",
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 400
        assert "No KYC documents found" in response.json()["detail"]
        
        # Cleanup
        db.delete(kyc_status)
        db.delete(profile)
        db.commit()
        db.close()


class TestSecurityFeatures:
    """Test security features of the API"""
    
    @patch('app.core.security.authenticate_request')
    @patch('app.services.file_upload_service.file_upload_service.retrieve_decrypted_file')
    def test_document_download_with_watermark(
        self, mock_retrieve, mock_auth, client, test_user
    ):
        """Test document download applies watermark"""
        mock_auth.return_value = test_user
        mock_retrieve.return_value = b"decrypted image content"
        
        # Create a document
        db = TestingSessionLocal()
        profile = UserProfile(user_id=test_user.id)
        db.add(profile)
        db.commit()
        
        doc = KYCDocument(
            id=uuid4(),
            user_id=test_user.id,
            user_profile_id=profile.id,
            document_type=KYCDocumentType.PAN,
            document_name="pan.jpg",
            file_path="/test/pan.jpg",
            file_hash="hash1",
            file_size=1024,
            mime_type="image/jpeg"
        )
        db.add(doc)
        db.commit()
        
        with patch('app.services.file_upload_service.file_upload_service.apply_watermark') as mock_watermark:
            mock_watermark.return_value = b"watermarked content"
            
            response = client.get(
                f"/api/v1/users/kyc/documents/{doc.id}/download",
                headers={"Authorization": "Bearer test_token"}
            )
            
            assert response.status_code == 200
            assert mock_watermark.called
            
        # Cleanup
        db.delete(doc)
        db.delete(profile)
        db.commit()
        db.close()
    
    @patch('app.core.security.authenticate_request')
    def test_cannot_access_other_user_documents(self, mock_auth, client, test_user):
        """Test user cannot access another user's documents"""
        mock_auth.return_value = test_user
        
        # Create document for different user
        db = TestingSessionLocal()
        other_user_id = uuid4()
        profile = UserProfile(user_id=other_user_id)
        db.add(profile)
        db.commit()
        
        doc = KYCDocument(
            id=uuid4(),
            user_id=other_user_id,  # Different user
            user_profile_id=profile.id,
            document_type=KYCDocumentType.PAN,
            file_path="/test/pan.pdf",
            file_hash="hash1",
            file_size=1024,
            mime_type="application/pdf"
        )
        db.add(doc)
        db.commit()
        
        response = client.get(
            f"/api/v1/users/kyc/documents/{doc.id}/download",
            headers={"Authorization": "Bearer test_token"}
        )
        
        assert response.status_code == 404
        
        # Cleanup
        db.delete(doc)
        db.delete(profile)
        db.commit()
        db.close()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])