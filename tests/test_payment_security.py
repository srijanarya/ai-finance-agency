"""
Security-focused tests for Payment Security Service
Tests encryption, validation, rate limiting, and compliance features
"""

import pytest
import uuid
import time
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import Mock, patch, MagicMock

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database.models.base import Base
from database.models.user_models import User, UserRole, KYCLevel
from database.models.payment_models import (
    Transaction, TransactionStatus, TransactionType, TransactionCategory, CardBrand
)
from app.services.payment_security_service import PaymentSecurityService, payment_security_service
from app.utils.pci_compliance import (
    mask_sensitive_data, validate_encryption_requirements, 
    generate_audit_hash, PCIDataValidator, pci_audit_logger
)


# Test Database Setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


@pytest.fixture
def db_session():
    """Create a fresh database session for each test"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def security_service():
    """Create a fresh security service instance for each test"""
    return PaymentSecurityService()


@pytest.fixture
def test_user(db_session):
    """Create a test user with basic KYC"""
    user = User(
        id=uuid.uuid4(),
        email="security_test@example.com",
        phone="+919876543210",
        first_name="Security",
        last_name="Test",
        is_active=True,
        is_verified=True,
        role=UserRole.USER,
        kyc_level=KYCLevel.BASIC
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def advanced_kyc_user(db_session):
    """Create a test user with advanced KYC"""
    user = User(
        id=uuid.uuid4(),
        email="advanced_test@example.com",
        phone="+919876543211",
        first_name="Advanced",
        last_name="Test",
        is_active=True,
        is_verified=True,
        role=UserRole.USER,
        kyc_level=KYCLevel.ADVANCED
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


class TestCardValidation:
    """Test credit card validation functionality"""
    
    def test_valid_visa_cards(self, security_service):
        """Test validation of valid Visa card numbers"""
        valid_visa_cards = [
            '4111111111111111',  # Test Visa
            '4012888888881881',  # Test Visa
            '4222222222222',     # Test Visa (13 digits)
        ]
        
        for card in valid_visa_cards:
            assert security_service.validate_card_number(card) is True
            assert security_service.get_card_brand(card) == CardBrand.VISA
    
    def test_valid_mastercard_cards(self, security_service):
        """Test validation of valid Mastercard numbers"""
        valid_mastercard_cards = [
            '5555555555554444',  # Test Mastercard
            '5105105105105100',  # Test Mastercard
            '2223003122003222',  # New Mastercard range
        ]
        
        for card in valid_mastercard_cards:
            assert security_service.validate_card_number(card) is True
            assert security_service.get_card_brand(card) == CardBrand.MASTERCARD
    
    def test_valid_amex_cards(self, security_service):
        """Test validation of valid American Express numbers"""
        valid_amex_cards = [
            '378282246310005',   # Test Amex
            '371449635398431',   # Test Amex
        ]
        
        for card in valid_amex_cards:
            assert security_service.validate_card_number(card) is True
            assert security_service.get_card_brand(card) == CardBrand.AMEX
    
    def test_invalid_card_numbers(self, security_service):
        """Test rejection of invalid card numbers"""
        invalid_cards = [
            '1234567890123456',  # Fails Luhn check
            '4111111111111112',  # Fails Luhn check  
            '411111111111111',   # Too short
            '41111111111111111', # Too long
            '1234',              # Way too short
            '',                  # Empty
            'abcd1234567890',    # Contains letters
        ]
        
        for card in invalid_cards:
            assert security_service.validate_card_number(card) is False
    
    def test_card_number_masking(self, security_service):
        """Test card number masking for display"""
        test_cases = [
            ('4111111111111111', '****-****-****-1111'),
            ('5555555555554444', '****-****-****-4444'),
            ('378282246310005', '****-****-****-0005'),
            ('1234', '****-****-****-****'),  # Too short
            ('', '****-****-****-****'),     # Empty
        ]
        
        for card_number, expected_mask in test_cases:
            assert security_service.mask_card_number(card_number) == expected_mask
    
    def test_cvv_validation(self, security_service):
        """Test CVV validation based on card brand"""
        # Test 3-digit CVV for regular cards
        assert security_service.validate_cvv('123', CardBrand.VISA) is True
        assert security_service.validate_cvv('456', CardBrand.MASTERCARD) is True
        assert security_service.validate_cvv('789', CardBrand.DISCOVER) is True
        
        # Test 4-digit CVV for American Express
        assert security_service.validate_cvv('1234', CardBrand.AMEX) is True
        
        # Test invalid CVVs
        assert security_service.validate_cvv('123', CardBrand.AMEX) is False  # Too short for Amex
        assert security_service.validate_cvv('1234', CardBrand.VISA) is False  # Too long for Visa
        assert security_service.validate_cvv('12', CardBrand.VISA) is False   # Too short
        assert security_service.validate_cvv('abcd', CardBrand.VISA) is False # Non-numeric
        assert security_service.validate_cvv('', CardBrand.VISA) is False     # Empty


class TestEncryption:
    """Test data encryption and decryption functionality"""
    
    def test_encryption_decryption_basic(self, security_service):
        """Test basic encryption and decryption"""
        sensitive_data = "4111111111111111"
        
        encrypted = security_service.encrypt_sensitive_data(sensitive_data)
        assert encrypted != sensitive_data
        assert len(encrypted) > 0
        
        decrypted = security_service.decrypt_sensitive_data(encrypted)
        assert decrypted == sensitive_data
    
    def test_encryption_different_data_different_output(self, security_service):
        """Test that different data produces different encrypted output"""
        data1 = "4111111111111111"
        data2 = "5555555555554444"
        
        encrypted1 = security_service.encrypt_sensitive_data(data1)
        encrypted2 = security_service.encrypt_sensitive_data(data2)
        
        assert encrypted1 != encrypted2
    
    def test_encryption_same_data_different_output(self, security_service):
        """Test that same data encrypted twice produces different output (due to nonce)"""
        data = "4111111111111111"
        
        encrypted1 = security_service.encrypt_sensitive_data(data)
        encrypted2 = security_service.encrypt_sensitive_data(data)
        
        # Should be different due to random nonce
        assert encrypted1 != encrypted2
        
        # But both should decrypt to same original data
        assert security_service.decrypt_sensitive_data(encrypted1) == data
        assert security_service.decrypt_sensitive_data(encrypted2) == data
    
    def test_encryption_special_characters(self, security_service):
        """Test encryption of data with special characters"""
        special_data = "Card#4111-1111-1111-1111@domain.com"
        
        encrypted = security_service.encrypt_sensitive_data(special_data)
        decrypted = security_service.decrypt_sensitive_data(encrypted)
        
        assert decrypted == special_data
    
    def test_encryption_unicode(self, security_service):
        """Test encryption of unicode data"""
        unicode_data = "कार्ड नंबर: 4111111111111111 🔒"
        
        encrypted = security_service.encrypt_sensitive_data(unicode_data)
        decrypted = security_service.decrypt_sensitive_data(encrypted)
        
        assert decrypted == unicode_data
    
    def test_decrypt_invalid_data(self, security_service):
        """Test decryption of invalid/corrupted data"""
        invalid_encrypted_data = "invalid_base64_data"
        
        with pytest.raises(ValueError, match="Failed to decrypt"):
            security_service.decrypt_sensitive_data(invalid_encrypted_data)


class TestRateLimiting:
    """Test rate limiting functionality"""
    
    def test_rate_limit_within_limit(self, security_service):
        """Test requests within rate limit are allowed"""
        identifier = "test_user_1"
        limit = 5
        
        # All requests within limit should pass
        for i in range(limit):
            assert security_service.check_rate_limit(identifier, limit=limit, window_minutes=1) is True
    
    def test_rate_limit_exceeded(self, security_service):
        """Test requests exceeding rate limit are blocked"""
        identifier = "test_user_2"
        limit = 3
        
        # Fill up the limit
        for i in range(limit):
            assert security_service.check_rate_limit(identifier, limit=limit, window_minutes=1) is True
        
        # Next request should be blocked
        assert security_service.check_rate_limit(identifier, limit=limit, window_minutes=1) is False
    
    def test_rate_limit_different_users(self, security_service):
        """Test rate limiting is per-user"""
        user1 = "test_user_3"
        user2 = "test_user_4"
        limit = 2
        
        # User 1 fills their limit
        for i in range(limit):
            assert security_service.check_rate_limit(user1, limit=limit, window_minutes=1) is True
        
        # User 1 should be blocked
        assert security_service.check_rate_limit(user1, limit=limit, window_minutes=1) is False
        
        # User 2 should still be allowed
        assert security_service.check_rate_limit(user2, limit=limit, window_minutes=1) is True
    
    def test_rate_limit_window_reset(self, security_service):
        """Test rate limit resets after time window"""
        identifier = "test_user_5"
        limit = 2
        window_seconds = 0.1  # Very short window for testing
        
        # Fill up the limit
        for i in range(limit):
            assert security_service.check_rate_limit(identifier, limit=limit, window_minutes=window_seconds/60) is True
        
        # Should be blocked
        assert security_service.check_rate_limit(identifier, limit=limit, window_minutes=window_seconds/60) is False
        
        # Wait for window to expire
        time.sleep(window_seconds + 0.01)
        
        # Should be allowed again
        assert security_service.check_rate_limit(identifier, limit=limit, window_minutes=window_seconds/60) is True


class TestTransactionLimits:
    """Test transaction limit validation"""
    
    def test_basic_kyc_limits(self, security_service, db_session, test_user):
        """Test transaction limits for basic KYC level"""
        # Single transaction limit test
        result = security_service.validate_transaction_limits(
            db=db_session,
            user=test_user,
            amount=Decimal('6000.00'),  # Above basic limit of 5000
            transaction_type='deposit'
        )
        
        assert result['valid'] is False
        assert result['reason'] == 'single_transaction_limit_exceeded'
        assert result['limit'] == Decimal('5000')
        
        # Valid amount should pass
        result = security_service.validate_transaction_limits(
            db=db_session,
            user=test_user,
            amount=Decimal('3000.00'),  # Within basic limit
            transaction_type='deposit'
        )
        
        assert result['valid'] is True
        assert 'daily_limit' in result
        assert 'monthly_limit' in result
    
    def test_advanced_kyc_limits(self, security_service, db_session, advanced_kyc_user):
        """Test transaction limits for advanced KYC level"""
        # Advanced KYC should have higher limits
        result = security_service.validate_transaction_limits(
            db=db_session,
            user=advanced_kyc_user,
            amount=Decimal('50000.00'),  # Within advanced limit
            transaction_type='deposit'
        )
        
        assert result['valid'] is True
        
        # But still has upper limits
        result = security_service.validate_transaction_limits(
            db=db_session,
            user=advanced_kyc_user,
            amount=Decimal('200000.00'),  # Above advanced single limit
            transaction_type='deposit'
        )
        
        assert result['valid'] is False
        assert result['reason'] == 'single_transaction_limit_exceeded'
    
    def test_daily_limit_tracking(self, security_service, db_session, test_user):
        """Test daily transaction limit tracking"""
        # Create some transactions for today
        today_transactions = [
            Transaction(
                id=uuid.uuid4(),
                user_id=test_user.id,
                amount=Decimal('3000.00'),
                type=TransactionType.DEPOSIT,
                category=TransactionCategory.DEPOSIT,
                status=TransactionStatus.COMPLETED,
                description='Previous transaction',
                created_at=datetime.utcnow()
            ),
            Transaction(
                id=uuid.uuid4(),
                user_id=test_user.id,
                amount=Decimal('4000.00'),
                type=TransactionType.DEPOSIT,
                category=TransactionCategory.DEPOSIT,
                status=TransactionStatus.COMPLETED,
                description='Another transaction',
                created_at=datetime.utcnow()
            )
        ]
        
        for txn in today_transactions:
            db_session.add(txn)
        db_session.commit()
        
        # Should exceed daily limit (basic: 10000, already used 7000)
        result = security_service.validate_transaction_limits(
            db=db_session,
            user=test_user,
            amount=Decimal('5000.00'),  # Would total 12000
            transaction_type='deposit'
        )
        
        assert result['valid'] is False
        assert result['reason'] == 'daily_limit_exceeded'
        assert result['used'] == Decimal('7000.00')


class TestSuspiciousActivityDetection:
    """Test suspicious activity detection"""
    
    def test_rapid_successive_transactions(self, security_service, db_session, test_user):
        """Test detection of rapid successive transactions"""
        # Create multiple recent transactions
        recent_time = datetime.utcnow() - timedelta(minutes=2)
        
        for i in range(4):  # Create 4 transactions in last 5 minutes
            transaction = Transaction(
                id=uuid.uuid4(),
                user_id=test_user.id,
                amount=Decimal('100.00'),
                type=TransactionType.DEPOSIT,
                category=TransactionCategory.DEPOSIT,
                status=TransactionStatus.COMPLETED,
                description=f'Rapid transaction {i}',
                created_at=recent_time
            )
            db_session.add(transaction)
        db_session.commit()
        
        indicators = security_service.detect_suspicious_activity(
            db=db_session,
            user_id=test_user.id,
            transaction_data={'amount': 500, 'type': 'deposit'}
        )
        
        assert 'rapid_successive_transactions' in indicators
    
    def test_large_amount_detection(self, security_service, db_session, test_user):
        """Test detection of unusually large amounts"""
        indicators = security_service.detect_suspicious_activity(
            db=db_session,
            user_id=test_user.id,
            transaction_data={'amount': 15000, 'type': 'deposit'}  # Large amount
        )
        
        assert 'large_amount' in indicators
    
    def test_round_amount_pattern(self, security_service, db_session, test_user):
        """Test detection of suspicious round amounts"""
        round_amounts = [100, 1000, 5000, 10000]
        
        for amount in round_amounts:
            indicators = security_service.detect_suspicious_activity(
                db=db_session,
                user_id=test_user.id,
                transaction_data={'amount': amount, 'type': 'deposit'}
            )
            
            assert 'round_amount_pattern' in indicators
    
    def test_multiple_failed_attempts(self, security_service, db_session, test_user):
        """Test detection of multiple failed transaction attempts"""
        # Create multiple failed transactions
        recent_time = datetime.utcnow() - timedelta(minutes=30)
        
        for i in range(3):  # Create 3 failed transactions
            transaction = Transaction(
                id=uuid.uuid4(),
                user_id=test_user.id,
                amount=Decimal('100.00'),
                type=TransactionType.DEPOSIT,
                category=TransactionCategory.DEPOSIT,
                status=TransactionStatus.FAILED,
                description=f'Failed transaction {i}',
                failure_reason='Card declined',
                created_at=recent_time
            )
            db_session.add(transaction)
        db_session.commit()
        
        indicators = security_service.detect_suspicious_activity(
            db=db_session,
            user_id=test_user.id,
            transaction_data={'amount': 100, 'type': 'deposit'}
        )
        
        assert 'multiple_failed_attempts' in indicators
    
    def test_normal_activity_no_flags(self, security_service, db_session, test_user):
        """Test that normal activity doesn't trigger suspicious indicators"""
        # Create one normal transaction from yesterday
        yesterday = datetime.utcnow() - timedelta(days=1)
        transaction = Transaction(
            id=uuid.uuid4(),
            user_id=test_user.id,
            amount=Decimal('150.00'),  # Normal amount
            type=TransactionType.DEPOSIT,
            category=TransactionCategory.DEPOSIT,
            status=TransactionStatus.COMPLETED,
            description='Normal transaction',
            created_at=yesterday
        )
        db_session.add(transaction)
        db_session.commit()
        
        indicators = security_service.detect_suspicious_activity(
            db=db_session,
            user_id=test_user.id,
            transaction_data={'amount': 250, 'type': 'deposit'}  # Normal amount
        )
        
        # Should not have any suspicious indicators
        assert len(indicators) == 0


class TestLogSanitization:
    """Test log sanitization for sensitive data"""
    
    def test_card_number_sanitization(self, security_service):
        """Test sanitization of card numbers in logs"""
        log_data = {
            'card_number': '4111111111111111',
            'user_id': 'user_123',
            'amount': 100.00,
            'timestamp': '2024-01-01T10:00:00'
        }
        
        sanitized = security_service.sanitize_logs(log_data)
        
        assert sanitized['card_number'] == '****-****-****-1111'
        assert sanitized['user_id'] == 'user_123'  # Non-sensitive unchanged
        assert sanitized['amount'] == 100.00
    
    def test_cvv_sanitization(self, security_service):
        """Test sanitization of CVV in logs"""
        log_data = {
            'cvv': '123',
            'cvc': '456',
            'security_code': '789',
            'amount': 100.00
        }
        
        sanitized = security_service.sanitize_logs(log_data)
        
        assert sanitized['cvv'] == '***'
        assert sanitized['cvc'] == '***'
        assert sanitized['security_code'] == '***'
        assert sanitized['amount'] == 100.00
    
    def test_nested_data_sanitization(self, security_service):
        """Test sanitization of nested sensitive data"""
        log_data = {
            'transaction': {
                'card_number': '5555555555554444',
                'amount': 200.00,
                'billing': {
                    'cardnumber': '4111111111111111',
                    'cvv': '123'
                }
            },
            'user_id': 'user_456'
        }
        
        sanitized = security_service.sanitize_logs(log_data)
        
        assert sanitized['transaction']['card_number'] == '****-****-****-4444'
        assert sanitized['transaction']['amount'] == 200.00
        assert sanitized['transaction']['billing']['cardnumber'] == '****-****-****-1111'
        assert sanitized['transaction']['billing']['cvv'] == '***'
        assert sanitized['user_id'] == 'user_456'
    
    def test_list_data_sanitization(self, security_service):
        """Test sanitization of sensitive data in lists"""
        log_data = {
            'payment_methods': [
                {'card_number': '4111111111111111', 'type': 'visa'},
                {'card_number': '5555555555554444', 'type': 'mastercard'}
            ],
            'user_id': 'user_789'
        }
        
        sanitized = security_service.sanitize_logs(log_data)
        
        assert len(sanitized['payment_methods']) == 2
        assert sanitized['payment_methods'][0]['card_number'] == '****-****-****-1111'
        assert sanitized['payment_methods'][1]['card_number'] == '****-****-****-4444'
        assert sanitized['payment_methods'][0]['type'] == 'visa'  # Non-sensitive unchanged


class TestPCIComplianceUtilities:
    """Test PCI compliance utility functions"""
    
    def test_sensitive_data_masking(self):
        """Test the mask_sensitive_data utility function"""
        test_data = {
            'card_number': '4111111111111111',
            'cvv': '123',
            'pin': '1234',
            'password': 'secret123',
            'amount': 100.00,
            'user_name': 'John Doe'
        }
        
        masked = mask_sensitive_data(test_data)
        
        assert masked['card_number'] == '************1111'
        assert masked['cvv'] == '****'
        assert masked['pin'] == '****'
        assert masked['password'] == '****'
        assert masked['amount'] == 100.00  # Non-sensitive unchanged
        assert masked['user_name'] == 'John Doe'
    
    def test_audit_hash_consistency(self):
        """Test audit hash generation consistency"""
        test_data = {
            'transaction_id': 'txn_123',
            'amount': 100.00,
            'user_id': 'user_456'
        }
        
        hash1 = generate_audit_hash(test_data)
        hash2 = generate_audit_hash(test_data)
        
        # Same data should produce same hash
        assert hash1 == hash2
        assert len(hash1) == 64  # SHA-256 hex length
    
    def test_audit_hash_different_data(self):
        """Test audit hash generation for different data"""
        data1 = {'transaction_id': 'txn_123', 'amount': 100.00}
        data2 = {'transaction_id': 'txn_456', 'amount': 200.00}
        
        hash1 = generate_audit_hash(data1)
        hash2 = generate_audit_hash(data2)
        
        assert hash1 != hash2
    
    def test_encryption_validation(self):
        """Test encryption requirements validation"""
        # Data with unencrypted sensitive fields
        unencrypted_data = {
            'card_number': '4111111111111111',
            'account_number': '1234567890',
            'cvv': '123',
            'user_name': 'John Doe'
        }
        
        errors = validate_encryption_requirements(unencrypted_data)
        
        # Should detect unencrypted sensitive fields
        assert len(errors) > 0
        assert any('card_number' in error for error in errors)
        assert any('account_number' in error for error in errors)
        assert any('cvv' in error for error in errors)
    
    def test_pci_data_validator(self):
        """Test PCI data validator functionality"""
        validator = PCIDataValidator()
        
        # Test card number storage validation
        errors = validator.validate_card_number_storage('4111111111111111', is_encrypted=False)
        assert len(errors) > 0
        assert any('encrypted' in error for error in errors)
        
        # Test CVV storage validation (should never be stored)
        errors = validator.validate_cvv_storage('123')
        assert len(errors) > 0
        assert any('never be stored' in error for error in errors)
        
        # Empty CVV should pass
        errors = validator.validate_cvv_storage('')
        assert len(errors) == 0


class TestSecurityEventLogging:
    """Test security event logging functionality"""
    
    @patch('app.services.payment_security_service.logger')
    def test_security_event_logging(self, mock_logger, security_service):
        """Test security event logging with data sanitization"""
        security_service.log_security_event(
            event_type='suspicious_activity',
            user_id=uuid.uuid4(),
            ip_address='192.168.1.100',
            details={
                'card_number': '4111111111111111',
                'amount': 5000,
                'indicators': ['large_amount', 'rapid_transactions']
            }
        )
        
        # Verify logger was called
        mock_logger.warning.assert_called_once()
        
        # Get the logged data
        logged_call = mock_logger.warning.call_args[0][0]
        assert 'SECURITY_EVENT' in logged_call
        assert 'suspicious_activity' in logged_call
        assert '192.168.1.100' in logged_call
        # Card number should be masked in logs
        assert '4111111111111111' not in logged_call
    
    def test_audit_logger_payment_event(self):
        """Test PCI audit logger for payment events"""
        with patch('app.utils.pci_compliance.logging.getLogger') as mock_get_logger:
            mock_logger = Mock()
            mock_get_logger.return_value = mock_logger
            
            pci_audit_logger.log_payment_event(
                event_type='deposit_initiated',
                user_id='user_123',
                amount=500.00,
                currency='INR',
                transaction_id='txn_456',
                additional_data={'gateway': 'mock', 'card_number': '4111111111111111'}
            )
            
            # Verify audit log was created
            mock_logger.info.assert_called_once()
            logged_data = mock_logger.info.call_args[0][0]
            assert 'deposit_initiated' in logged_data
            assert 'user_123' in logged_data
            assert 'txn_456' in logged_data
            # Sensitive data should be masked
            assert '4111111111111111' not in logged_data


class TestIPBlocking:
    """Test IP blocking functionality"""
    
    def test_ip_blocking(self, security_service):
        """Test IP address blocking and checking"""
        test_ip = '192.168.1.100'
        
        # Initially IP should not be blocked
        assert security_service.is_ip_blocked(test_ip) is False
        
        # Block the IP
        security_service.block_ip_address(test_ip, 'Suspicious activity detected')
        
        # Now IP should be blocked
        assert security_service.is_ip_blocked(test_ip) is True
        
        # Other IPs should not be blocked
        assert security_service.is_ip_blocked('192.168.1.101') is False
    
    def test_webhook_source_validation(self, security_service):
        """Test webhook source IP validation"""
        # Valid webhook sources (simplified test IPs)
        valid_ips = ['127.0.0.1', '18.209.1.1', '3.6.1.1']
        
        for ip in valid_ips:
            assert security_service.validate_webhook_source(ip, 'webhook-agent') is True
        
        # Invalid webhook source
        assert security_service.validate_webhook_source('10.0.0.1', 'malicious-agent') is False


class TestSecureTokenGeneration:
    """Test secure token generation"""
    
    def test_secure_token_generation(self, security_service):
        """Test generation of cryptographically secure tokens"""
        token1 = security_service.generate_secure_token()
        token2 = security_service.generate_secure_token()
        
        # Tokens should be different
        assert token1 != token2
        
        # Should be URL-safe base64
        assert len(token1) > 0
        assert len(token2) > 0
        
        # Test custom length
        long_token = security_service.generate_secure_token(length=64)
        assert len(long_token) > len(token1)
    
    def test_payment_reference_hashing(self, security_service):
        """Test payment reference data hashing"""
        reference_data = "payment_ref_12345_user_67890"
        
        hash1 = security_service.hash_payment_reference(reference_data)
        hash2 = security_service.hash_payment_reference(reference_data)
        
        # Same data should produce same hash
        assert hash1 == hash2
        assert len(hash1) == 64  # SHA-256 hex length
        
        # Different data should produce different hash
        different_data = "payment_ref_54321_user_09876"
        hash3 = security_service.hash_payment_reference(different_data)
        assert hash1 != hash3


if __name__ == '__main__':
    pytest.main([__file__, '-v'])