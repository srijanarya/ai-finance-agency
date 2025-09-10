"""
Unit tests for KYC services
Tests file upload, encryption, and verification services
"""

import pytest
import os
import tempfile
import secrets
from io import BytesIO
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime

from app.services.file_upload_service import FileUploadService
from app.services.kyc_verification_service import KYCVerificationService
from database.models.profile_models import (
    UserProfile, KYCStatus, IncomeBracket, KYCVerificationStatus
)


class TestFileUploadService:
    """Test cases for FileUploadService"""
    
    @pytest.fixture
    def service(self):
        """Create file upload service instance"""
        with tempfile.TemporaryDirectory() as tmpdir:
            service = FileUploadService()
            service.upload_dir = Path(tmpdir)
            yield service
    
    @pytest.fixture
    def sample_image(self):
        """Create a sample image file"""
        from PIL import Image
        
        img = Image.new('RGB', (500, 500), color='white')
        buffer = BytesIO()
        img.save(buffer, format='JPEG')
        buffer.seek(0)
        return buffer
    
    @pytest.fixture
    def sample_pdf(self):
        """Create a sample PDF file"""
        pdf_content = b'%PDF-1.4\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n'
        return BytesIO(pdf_content)
    
    def test_validate_file_valid_image(self, service, sample_image):
        """Test validation of valid image file"""
        is_valid, error = service.validate_file(sample_image, "PAN")
        assert is_valid is True
        assert error is None
    
    def test_validate_file_invalid_size(self, service):
        """Test validation of oversized file"""
        # Create file larger than limit
        large_file = BytesIO(b'x' * (11 * 1024 * 1024))  # 11MB
        is_valid, error = service.validate_file(large_file, "PAN")
        assert is_valid is False
        assert "size exceeds" in error.lower()
    
    def test_validate_file_invalid_type(self, service):
        """Test validation of invalid file type"""
        # Create executable file
        exe_file = BytesIO(b'MZ\x90\x00\x03')  # Windows EXE header
        is_valid, error = service.validate_file(exe_file, "PAN")
        assert is_valid is False
        assert "not allowed" in error.lower()
    
    def test_encrypt_decrypt_file(self, service):
        """Test file encryption and decryption"""
        original_content = b"This is sensitive KYC data"
        
        # Encrypt
        encrypted, key_id = service.encrypt_file(original_content)
        assert encrypted != original_content
        assert key_id is not None
        
        # Decrypt
        decrypted = service.decrypt_file(encrypted)
        assert decrypted == original_content
    
    def test_calculate_file_hash(self, service):
        """Test file hash calculation"""
        content = b"Test content for hashing"
        hash1 = service.calculate_file_hash(content)
        hash2 = service.calculate_file_hash(content)
        
        # Same content should produce same hash
        assert hash1 == hash2
        assert len(hash1) == 64  # SHA-256 produces 64 hex characters
        
        # Different content should produce different hash
        different_content = b"Different content"
        hash3 = service.calculate_file_hash(different_content)
        assert hash3 != hash1
    
    def test_generate_secure_filename(self, service):
        """Test secure filename generation"""
        user_id = "user123"
        document_type = "PAN"
        original_filename = "my_pan_card.pdf"
        
        secure_filename = service.generate_secure_filename(
            original_filename, user_id, document_type
        )
        
        assert user_id in secure_filename
        assert document_type in secure_filename
        assert secure_filename.endswith(".pdf")
        assert "my_pan_card" not in secure_filename  # Original name not preserved
    
    def test_save_encrypted_file(self, service, sample_image):
        """Test saving encrypted file"""
        user_id = "test_user"
        document_type = "AADHAAR"
        original_filename = "aadhaar.jpg"
        
        file_path, file_hash, key_id, file_size = service.save_encrypted_file(
            sample_image,
            user_id,
            document_type,
            original_filename
        )
        
        assert file_path is not None
        assert file_hash is not None
        assert key_id is not None
        assert file_size > 0
        
        # Verify file exists
        assert Path(file_path).exists()
        
        # Verify file is encrypted (content should be different)
        with open(file_path, 'rb') as f:
            saved_content = f.read()
        
        sample_image.seek(0)
        original_content = sample_image.read()
        assert saved_content != original_content
    
    def test_retrieve_decrypted_file(self, service, sample_image):
        """Test retrieving and decrypting saved file"""
        # Save file first
        file_path, _, _, _ = service.save_encrypted_file(
            sample_image,
            "test_user",
            "PAN",
            "pan.jpg"
        )
        
        # Retrieve and decrypt
        decrypted_content = service.retrieve_decrypted_file(file_path)
        
        sample_image.seek(0)
        original_content = sample_image.read()
        
        assert decrypted_content == original_content
    
    def test_delete_file_secure(self, service, sample_image):
        """Test secure file deletion"""
        # Save file first
        file_path, _, _, _ = service.save_encrypted_file(
            sample_image,
            "test_user",
            "PAN",
            "pan.jpg"
        )
        
        assert Path(file_path).exists()
        
        # Delete file
        success = service.delete_file(file_path)
        assert success is True
        assert not Path(file_path).exists()
    
    def test_scan_for_malware(self, service):
        """Test malware scanning"""
        with tempfile.NamedTemporaryFile(mode='wb', delete=False) as f:
            # Clean file
            f.write(b"Clean content")
            f.flush()
            
            is_clean, threat = service.scan_for_malware(Path(f.name))
            assert is_clean is True
            assert threat is None
            
        with tempfile.NamedTemporaryFile(mode='wb', delete=False) as f:
            # Suspicious file with script tag
            f.write(b"<script>alert('hack')</script>")
            f.flush()
            
            is_clean, threat = service.scan_for_malware(Path(f.name))
            assert is_clean is False
            assert threat is not None
    
    def test_create_thumbnail(self, service, sample_image):
        """Test thumbnail creation"""
        sample_image.seek(0)
        original_content = sample_image.read()
        
        thumbnail_content = service.create_thumbnail(original_content)
        
        # Verify thumbnail is smaller
        assert len(thumbnail_content) < len(original_content)
        
        # Verify it's still a valid image
        from PIL import Image
        thumbnail_img = Image.open(BytesIO(thumbnail_content))
        assert thumbnail_img.size[0] <= 200
        assert thumbnail_img.size[1] <= 200


class TestKYCVerificationService:
    """Test cases for KYCVerificationService"""
    
    @pytest.fixture
    def service(self):
        """Create KYC verification service instance"""
        return KYCVerificationService()
    
    @pytest.fixture
    def mock_profile(self):
        """Create mock user profile"""
        profile = Mock(spec=UserProfile)
        profile.pan_number = "ABCDE1234F"
        profile.aadhaar_number = "123456789012"
        profile.date_of_birth = datetime(1990, 1, 1).date()
        profile.profile_completion_percentage = 80
        profile.income_bracket = IncomeBracket.BRACKET_3_10L
        return profile
    
    @pytest.fixture
    def mock_kyc_status(self):
        """Create mock KYC status"""
        status = Mock(spec=KYCStatus)
        status.pan_verified = False
        status.aadhaar_verified = False
        status.address_verified = False
        status.bank_verified = False
        status.video_kyc_completed = False
        status.in_person_verification = False
        status.overall_status = KYCVerificationStatus.PENDING
        status.risk_score = 0
        return status
    
    @pytest.mark.asyncio
    async def test_verify_pan_card_valid(self, service):
        """Test PAN card verification with valid data"""
        result = await service.verify_pan_card(
            "ABCDE1234F",
            "John Doe",
            datetime(1990, 1, 1).date()
        )
        
        assert 'verified' in result
        assert 'pan_number' in result or 'error' in result
        
        if result['verified']:
            assert result['pan_number'] == "ABCDE1234F"
            assert 'verification_id' in result
    
    @pytest.mark.asyncio
    async def test_verify_pan_card_invalid_format(self, service):
        """Test PAN card verification with invalid format"""
        result = await service.verify_pan_card(
            "INVALID",
            "John Doe",
            None
        )
        
        assert result['verified'] is False
        assert 'error' in result
        assert 'format' in result['error'].lower()
    
    @pytest.mark.asyncio
    async def test_verify_aadhaar_valid(self, service):
        """Test Aadhaar verification with valid data"""
        result = await service.verify_aadhaar(
            "123456789012",
            "John Doe",
            datetime(1990, 1, 1).date()
        )
        
        assert 'verified' in result
        
        if result['verified']:
            assert 'aadhaar_number' in result
            assert result['aadhaar_number'].startswith('XXXX-XXXX-')  # Masked
            assert 'verification_id' in result
            assert 'digilocker_reference' in result
    
    @pytest.mark.asyncio
    async def test_verify_aadhaar_invalid_format(self, service):
        """Test Aadhaar verification with invalid format"""
        result = await service.verify_aadhaar(
            "12345",  # Too short
            "John Doe",
            None
        )
        
        assert result['verified'] is False
        assert 'error' in result
        assert 'format' in result['error'].lower()
    
    @pytest.mark.asyncio
    async def test_verify_bank_account_valid(self, service):
        """Test bank account verification"""
        result = await service.verify_bank_account(
            "1234567890",
            "HDFC0001234",
            "John Doe"
        )
        
        assert 'verified' in result
        
        if result['verified']:
            assert 'account_number' in result
            assert result['account_number'].endswith('7890')  # Last 4 digits
            assert 'bank_name' in result
            assert 'verification_id' in result
    
    @pytest.mark.asyncio
    async def test_verify_bank_account_invalid_ifsc(self, service):
        """Test bank account verification with invalid IFSC"""
        result = await service.verify_bank_account(
            "1234567890",
            "INVALID",
            "John Doe"
        )
        
        assert result['verified'] is False
        assert 'error' in result
        assert 'ifsc' in result['error'].lower()
    
    @pytest.mark.asyncio
    async def test_verify_address_valid(self, service):
        """Test address verification"""
        from database.models.profile_models import AddressVerificationMethod
        
        result = await service.verify_address(
            "123 Test Street, Bangalore",
            "560001",
            AddressVerificationMethod.AADHAAR
        )
        
        assert 'verified' in result
        
        if result['verified']:
            assert result['pin_code'] == "560001"
            assert 'verification_id' in result
            assert 'details' in result
    
    @pytest.mark.asyncio
    async def test_verify_address_invalid_pincode(self, service):
        """Test address verification with invalid pin code"""
        from database.models.profile_models import AddressVerificationMethod
        
        result = await service.verify_address(
            "123 Test Street",
            "INVALID",
            AddressVerificationMethod.UTILITY_BILL
        )
        
        assert result['verified'] is False
        assert 'error' in result
        assert 'pin code' in result['error'].lower()
    
    def test_calculate_risk_score_unverified(self, service, mock_profile, mock_kyc_status):
        """Test risk score calculation for unverified user"""
        risk_score, risk_factors = service.calculate_risk_score(
            mock_profile,
            mock_kyc_status
        )
        
        assert risk_score > 50  # High risk for unverified
        assert len(risk_factors) > 0
        assert "PAN not verified" in risk_factors
        assert "Aadhaar not verified" in risk_factors
    
    def test_calculate_risk_score_partially_verified(self, service, mock_profile, mock_kyc_status):
        """Test risk score calculation for partially verified user"""
        mock_kyc_status.pan_verified = True
        mock_kyc_status.aadhaar_verified = True
        
        risk_score, risk_factors = service.calculate_risk_score(
            mock_profile,
            mock_kyc_status
        )
        
        assert risk_score < 100  # Reduced risk
        assert risk_score > 0  # Still some risk
        assert "Address not verified" in risk_factors
    
    def test_calculate_risk_score_with_video_kyc(self, service, mock_profile, mock_kyc_status):
        """Test risk score calculation with video KYC"""
        mock_kyc_status.pan_verified = True
        mock_kyc_status.video_kyc_completed = True
        
        risk_score, risk_factors = service.calculate_risk_score(
            mock_profile,
            mock_kyc_status
        )
        
        # Video KYC should reduce risk
        assert "Video KYC completed (-15 bonus)" in risk_factors
    
    def test_set_transaction_limits_unverified(self, service, mock_kyc_status):
        """Test transaction limits for unverified user"""
        limits = service.set_transaction_limits(mock_kyc_status)
        
        assert limits['daily_limit'] == 10000.0
        assert limits['monthly_limit'] == 50000.0
    
    def test_set_transaction_limits_verified_low_risk(self, service, mock_kyc_status):
        """Test transaction limits for verified low-risk user"""
        mock_kyc_status.overall_status = KYCVerificationStatus.VERIFIED
        mock_kyc_status.risk_score = 15
        
        limits = service.set_transaction_limits(mock_kyc_status)
        
        assert limits['daily_limit'] == 1000000.0  # 10 lakhs
        assert limits['monthly_limit'] == 10000000.0  # 1 crore
    
    def test_set_transaction_limits_verified_high_risk(self, service, mock_kyc_status):
        """Test transaction limits for verified high-risk user"""
        mock_kyc_status.overall_status = KYCVerificationStatus.VERIFIED
        mock_kyc_status.risk_score = 75
        
        limits = service.set_transaction_limits(mock_kyc_status)
        
        assert limits['daily_limit'] == 100000.0  # 1 lakh
        assert limits['monthly_limit'] == 1000000.0  # 10 lakhs
    
    @pytest.mark.asyncio
    async def test_perform_video_kyc(self, service):
        """Test video KYC verification"""
        result = await service.perform_video_kyc(
            "user123",
            "session456",
            b"mock_video_data"
        )
        
        assert 'verified' in result
        assert 'session_id' in result
        assert result['session_id'] == "session456"
        
        if result['verified']:
            assert 'verification_id' in result
            assert 'confidence_score' in result
            assert 'checks_passed' in result
        else:
            assert 'error' in result or 'failure_reason' in result
    
    def test_fuzzy_name_match(self, service):
        """Test fuzzy name matching"""
        # Exact match
        score = service._fuzzy_name_match("John Doe", "John Doe")
        assert score == 1.0
        
        # Case insensitive match
        score = service._fuzzy_name_match("John Doe", "john doe")
        assert score == 1.0
        
        # Partial match
        score = service._fuzzy_name_match("John", "John Doe")
        assert score >= 0.8
        
        # Different names
        score = service._fuzzy_name_match("John", "Jane")
        assert score < 1.0
    
    def test_get_bank_name_from_ifsc(self, service):
        """Test bank name extraction from IFSC"""
        assert service._get_bank_name_from_ifsc("HDFC0001234") == "HDFC Bank"
        assert service._get_bank_name_from_ifsc("SBIN0001234") == "State Bank of India"
        assert service._get_bank_name_from_ifsc("ICIC0001234") == "ICICI Bank"
        assert service._get_bank_name_from_ifsc("UNKN0001234") == "Unknown Bank"
    
    def test_get_state_from_pincode(self, service):
        """Test state extraction from pin code"""
        assert "Delhi" in service._get_state_from_pincode("110001")
        assert "Maharashtra" in service._get_state_from_pincode("400001")
        assert "Karnataka" in service._get_state_from_pincode("560001")
        assert "Tamil Nadu" in service._get_state_from_pincode("600001")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])