"""
Comprehensive test suite for Payment System
Tests all payment functionality including security, compliance, and integration
"""

import pytest
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import Mock, patch, MagicMock
import json

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db
from database.models.base import Base
from database.models.user_models import User, UserRole, KYCLevel
from database.models.payment_models import (
    Wallet, PaymentMethod, Transaction, PaymentWebhook,
    PaymentGateway, PaymentMethodType, TransactionStatus,
    TransactionType, TransactionCategory, WebhookStatus,
    CardBrand
)
from app.services.wallet_service import wallet_service
from app.services.payment_gateway_service import payment_gateway_service
from app.services.transaction_service import transaction_service
from app.services.payment_security_service import payment_security_service


# Test Database Setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture
def db_session():
    """Create a fresh database session for each test"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def test_user(db_session):
    """Create a test user with basic KYC"""
    user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        phone="+919876543210",
        first_name="Test",
        last_name="User",
        is_active=True,
        is_verified=True,
        role=UserRole.USER,
        kyc_level=KYCLevel.BASIC,
        created_at=datetime.utcnow()
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    # Create wallet for user
    wallet = Wallet(
        id=uuid.uuid4(),
        user_id=user.id,
        balance=Decimal('1000.00'),
        locked_balance=Decimal('0.00')
    )
    db_session.add(wallet)
    db_session.commit()
    
    return user


@pytest.fixture
def advanced_user(db_session):
    """Create a test user with advanced KYC"""
    user = User(
        id=uuid.uuid4(),
        email="advanced@example.com",
        phone="+919876543211",
        first_name="Advanced",
        last_name="User",
        is_active=True,
        is_verified=True,
        role=UserRole.USER,
        kyc_level=KYCLevel.ADVANCED,
        created_at=datetime.utcnow()
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    
    # Create wallet for user
    wallet = Wallet(
        id=uuid.uuid4(),
        user_id=user.id,
        balance=Decimal('50000.00'),
        locked_balance=Decimal('0.00')
    )
    db_session.add(wallet)
    db_session.commit()
    
    return user


@pytest.fixture
def test_payment_method(db_session, test_user):
    """Create a test payment method"""
    payment_method = PaymentMethod(
        id=uuid.uuid4(),
        user_id=test_user.id,
        type=PaymentMethodType.CARD,
        provider=PaymentGateway.MOCK,
        token="card_token_123",
        last_four="1234",
        brand=CardBrand.VISA,
        expiry_month=12,
        expiry_year=2025,
        is_active=True,
        metadata={"gateway_method_id": "method_123"}
    )
    db_session.add(payment_method)
    db_session.commit()
    db_session.refresh(payment_method)
    return payment_method


class TestWalletService:
    """Test wallet service functionality"""
    
    def test_create_wallet(self, db_session, test_user):
        """Test wallet creation"""
        # Delete existing wallet
        db_session.query(Wallet).filter(Wallet.user_id == test_user.id).delete()
        db_session.commit()
        
        wallet = wallet_service.create_wallet(db_session, test_user.id)
        
        assert wallet is not None
        assert wallet.user_id == test_user.id
        assert wallet.balance == Decimal('0.00')
        assert wallet.locked_balance == Decimal('0.00')
    
    def test_get_wallet_balance(self, db_session, test_user):
        """Test getting wallet balance"""
        balance_info = wallet_service.get_wallet_balance(db_session, test_user.id)
        
        assert balance_info['balance'] == Decimal('1000.00')
        assert balance_info['locked_balance'] == Decimal('0.00')
        assert balance_info['available_balance'] == Decimal('1000.00')
    
    def test_credit_wallet(self, db_session, test_user):
        """Test crediting wallet"""
        initial_balance = wallet_service.get_wallet_balance(db_session, test_user.id)['balance']
        
        result = wallet_service.credit_wallet(
            db=db_session,
            user_id=test_user.id,
            amount=Decimal('500.00'),
            transaction_id=str(uuid.uuid4()),
            category=TransactionCategory.DEPOSIT,
            description="Test credit",
            reference_id="ref_123"
        )
        
        assert result['success'] is True
        
        new_balance = wallet_service.get_wallet_balance(db_session, test_user.id)['balance']
        assert new_balance == initial_balance + Decimal('500.00')
    
    def test_debit_wallet_sufficient_funds(self, db_session, test_user):
        """Test debiting wallet with sufficient funds"""
        initial_balance = wallet_service.get_wallet_balance(db_session, test_user.id)['balance']
        
        result = wallet_service.debit_wallet(
            db=db_session,
            user_id=test_user.id,
            amount=Decimal('100.00'),
            transaction_id=str(uuid.uuid4()),
            category=TransactionCategory.WITHDRAWAL,
            description="Test debit",
            reference_id="ref_124"
        )
        
        assert result['success'] is True
        
        new_balance = wallet_service.get_wallet_balance(db_session, test_user.id)['balance']
        assert new_balance == initial_balance - Decimal('100.00')
    
    def test_debit_wallet_insufficient_funds(self, db_session, test_user):
        """Test debiting wallet with insufficient funds"""
        result = wallet_service.debit_wallet(
            db=db_session,
            user_id=test_user.id,
            amount=Decimal('2000.00'),  # More than available balance
            transaction_id=str(uuid.uuid4()),
            category=TransactionCategory.WITHDRAWAL,
            description="Test insufficient funds",
            reference_id="ref_125"
        )
        
        assert result['success'] is False
        assert 'insufficient' in result['error'].lower()
    
    def test_lock_unlock_funds(self, db_session, test_user):
        """Test locking and unlocking funds"""
        # Lock funds
        lock_result = wallet_service.lock_funds(
            db=db_session,
            user_id=test_user.id,
            amount=Decimal('200.00'),
            transaction_id=str(uuid.uuid4()),
            description="Test lock"
        )
        
        assert lock_result['success'] is True
        
        balance_info = wallet_service.get_wallet_balance(db_session, test_user.id)
        assert balance_info['locked_balance'] == Decimal('200.00')
        assert balance_info['available_balance'] == Decimal('800.00')
        
        # Unlock funds
        unlock_result = wallet_service.unlock_funds(
            db=db_session,
            user_id=test_user.id,
            amount=Decimal('200.00'),
            transaction_id=lock_result['transaction_id'],
            description="Test unlock"
        )
        
        assert unlock_result['success'] is True
        
        balance_info = wallet_service.get_wallet_balance(db_session, test_user.id)
        assert balance_info['locked_balance'] == Decimal('0.00')
        assert balance_info['available_balance'] == Decimal('1000.00')


class TestPaymentGatewayService:
    """Test payment gateway service functionality"""
    
    def test_mock_gateway_create_order(self):
        """Test mock gateway order creation"""
        result = payment_gateway_service.create_order(
            amount=Decimal('100.00'),
            currency='INR',
            customer_id='customer_123',
            order_id='order_123',
            description='Test order'
        )
        
        assert result['success'] is True
        assert 'order_id' in result
        assert result['amount'] == Decimal('100.00')
        assert result['currency'] == 'INR'
    
    def test_mock_gateway_capture_payment(self):
        """Test mock gateway payment capture"""
        # First create an order
        order_result = payment_gateway_service.create_order(
            amount=Decimal('100.00'),
            currency='INR',
            customer_id='customer_123',
            order_id='order_123',
            description='Test order'
        )
        
        # Then capture payment
        result = payment_gateway_service.capture_payment(
            payment_id='payment_123',
            amount=Decimal('100.00'),
            currency='INR'
        )
        
        # Mock gateway has 90% success rate, so we might get success or failure
        assert 'success' in result
        assert 'payment_id' in result
    
    def test_mock_gateway_refund_payment(self):
        """Test mock gateway payment refund"""
        result = payment_gateway_service.refund_payment(
            payment_id='payment_123',
            amount=Decimal('50.00'),
            reason='Test refund'
        )
        
        assert result['success'] is True
        assert 'refund_id' in result
        assert result['amount'] == Decimal('50.00')
    
    def test_webhook_signature_verification(self):
        """Test webhook signature verification"""
        # Mock gateway always returns True for signature verification
        result = payment_gateway_service.verify_webhook_signature(
            payload='{"test": "data"}',
            signature='test_signature',
            secret='test_secret',
            gateway=PaymentGateway.MOCK
        )
        
        assert result is True


class TestTransactionService:
    """Test transaction service functionality"""
    
    @patch('app.services.payment_gateway_service.payment_gateway_service.create_order')
    def test_initiate_deposit(self, mock_create_order, db_session, test_user, test_payment_method):
        """Test deposit initiation"""
        mock_create_order.return_value = {
            'success': True,
            'order_id': 'gateway_order_123',
            'amount': Decimal('500.00'),
            'currency': 'INR',
            'checkout_url': 'https://example.com/checkout'
        }
        
        result = transaction_service.initiate_deposit(
            db=db_session,
            user_id=test_user.id,
            amount=Decimal('500.00'),
            payment_method_id=test_payment_method.id,
            gateway=PaymentGateway.MOCK,
            description='Test deposit'
        )
        
        assert result['success'] is True
        assert 'transaction_id' in result
        assert 'order_id' in result
        assert result['amount'] == Decimal('500.00')
        
        # Check transaction was created in database
        transaction = db_session.query(Transaction).filter(
            Transaction.id == result['transaction_id']
        ).first()
        
        assert transaction is not None
        assert transaction.user_id == test_user.id
        assert transaction.amount == Decimal('500.00')
        assert transaction.type == TransactionType.DEPOSIT
        assert transaction.status == TransactionStatus.PENDING
    
    def test_initiate_withdrawal_sufficient_balance(self, db_session, test_user, test_payment_method):
        """Test withdrawal with sufficient balance"""
        result = transaction_service.initiate_withdrawal(
            db=db_session,
            user_id=test_user.id,
            amount=Decimal('100.00'),
            payment_method_id=test_payment_method.id,
            description='Test withdrawal'
        )
        
        assert result['success'] is True
        assert 'transaction_id' in result
        
        # Check funds are locked
        balance_info = wallet_service.get_wallet_balance(db_session, test_user.id)
        assert balance_info['locked_balance'] == Decimal('100.00')
    
    def test_initiate_withdrawal_insufficient_balance(self, db_session, test_user, test_payment_method):
        """Test withdrawal with insufficient balance"""
        result = transaction_service.initiate_withdrawal(
            db=db_session,
            user_id=test_user.id,
            amount=Decimal('2000.00'),  # More than available balance
            payment_method_id=test_payment_method.id,
            description='Test withdrawal'
        )
        
        assert result['success'] is False
        assert 'insufficient' in result['error'].lower()


class TestPaymentSecurityService:
    """Test payment security service functionality"""
    
    def test_card_number_validation(self):
        """Test credit card number validation"""
        # Valid card numbers
        assert payment_security_service.validate_card_number('4111111111111111') is True  # Visa test
        assert payment_security_service.validate_card_number('5555555555554444') is True  # Mastercard test
        
        # Invalid card numbers
        assert payment_security_service.validate_card_number('1234567890123456') is False
        assert payment_security_service.validate_card_number('411111111111111') is False  # Too short
    
    def test_card_brand_detection(self):
        """Test card brand detection"""
        assert payment_security_service.get_card_brand('4111111111111111') == CardBrand.VISA
        assert payment_security_service.get_card_brand('5555555555554444') == CardBrand.MASTERCARD
        assert payment_security_service.get_card_brand('378282246310005') == CardBrand.AMEX
        assert payment_security_service.get_card_brand('1234567890123456') == CardBrand.UNKNOWN
    
    def test_cvv_validation(self):
        """Test CVV validation"""
        # 3-digit CVV for regular cards
        assert payment_security_service.validate_cvv('123', CardBrand.VISA) is True
        assert payment_security_service.validate_cvv('456', CardBrand.MASTERCARD) is True
        
        # 4-digit CVV for American Express
        assert payment_security_service.validate_cvv('1234', CardBrand.AMEX) is True
        assert payment_security_service.validate_cvv('123', CardBrand.AMEX) is False
        
        # Invalid CVV
        assert payment_security_service.validate_cvv('12', CardBrand.VISA) is False
        assert payment_security_service.validate_cvv('abcd', CardBrand.VISA) is False
    
    def test_card_number_masking(self):
        """Test card number masking"""
        masked = payment_security_service.mask_card_number('4111111111111111')
        assert masked == '****-****-****-1111'
        
        masked_short = payment_security_service.mask_card_number('123')
        assert masked_short == '****-****-****-****'
    
    def test_rate_limiting(self):
        """Test rate limiting functionality"""
        identifier = 'test_user_123'
        
        # First 5 requests should pass
        for i in range(5):
            assert payment_security_service.check_rate_limit(identifier, limit=5, window_minutes=1) is True
        
        # 6th request should fail
        assert payment_security_service.check_rate_limit(identifier, limit=5, window_minutes=1) is False
    
    def test_suspicious_activity_detection(self, db_session, test_user):
        """Test suspicious activity detection"""
        # Create multiple recent transactions
        for i in range(4):
            transaction = Transaction(
                id=uuid.uuid4(),
                user_id=test_user.id,
                amount=Decimal('100.00'),
                type=TransactionType.DEPOSIT,
                category=TransactionCategory.DEPOSIT,
                status=TransactionStatus.COMPLETED,
                description=f'Test transaction {i}',
                created_at=datetime.utcnow() - timedelta(minutes=2)
            )
            db_session.add(transaction)
        db_session.commit()
        
        indicators = payment_security_service.detect_suspicious_activity(
            db=db_session,
            user_id=test_user.id,
            transaction_data={'amount': 1000, 'type': 'deposit'}
        )
        
        assert 'rapid_successive_transactions' in indicators
        assert 'large_amount' in indicators
    
    def test_transaction_limits_validation(self, db_session, test_user, advanced_user):
        """Test transaction limits based on KYC level"""
        # Basic user - should have lower limits
        basic_validation = payment_security_service.validate_transaction_limits(
            db=db_session,
            user=test_user,
            amount=Decimal('6000.00'),  # Above basic single transaction limit
            transaction_type='deposit'
        )
        
        assert basic_validation['valid'] is False
        assert basic_validation['reason'] == 'single_transaction_limit_exceeded'
        
        # Advanced user - should have higher limits
        advanced_validation = payment_security_service.validate_transaction_limits(
            db=db_session,
            user=advanced_user,
            amount=Decimal('50000.00'),  # Within advanced limits
            transaction_type='deposit'
        )
        
        assert advanced_validation['valid'] is True
    
    def test_encryption_decryption(self):
        """Test data encryption and decryption"""
        sensitive_data = "4111111111111111"
        
        encrypted = payment_security_service.encrypt_sensitive_data(sensitive_data)
        assert encrypted != sensitive_data
        assert len(encrypted) > 0
        
        decrypted = payment_security_service.decrypt_sensitive_data(encrypted)
        assert decrypted == sensitive_data
    
    def test_log_sanitization(self):
        """Test sensitive data sanitization in logs"""
        test_data = {
            'card_number': '4111111111111111',
            'cvv': '123',
            'amount': 100.00,
            'user_id': 'user_123',
            'nested': {
                'cardnumber': '5555555555554444',
                'pin': '1234'
            }
        }
        
        sanitized = payment_security_service.sanitize_logs(test_data)
        
        assert sanitized['card_number'] == '****-****-****-1111'
        assert sanitized['cvv'] == '***'
        assert sanitized['amount'] == 100.00  # Non-sensitive data unchanged
        assert sanitized['nested']['cardnumber'] == '****-****-****-4444'
        assert sanitized['nested']['pin'] == '****'


class TestPaymentAPI:
    """Test payment API endpoints"""
    
    def test_get_wallet_balance(self, test_user):
        """Test wallet balance endpoint"""
        with patch('app.core.security.authenticate_request', return_value=test_user):
            response = client.get("/api/v1/payments/wallet/balance")
        
        assert response.status_code == 200
        data = response.json()
        assert 'balance' in data
        assert 'available_balance' in data
    
    @patch('app.services.transaction_service.transaction_service.initiate_deposit')
    def test_initiate_deposit_api(self, mock_initiate_deposit, test_user):
        """Test deposit initiation API"""
        mock_initiate_deposit.return_value = {
            'success': True,
            'transaction_id': str(uuid.uuid4()),
            'order_id': 'gateway_order_123',
            'amount': Decimal('500.00'),
            'checkout_url': 'https://example.com/checkout'
        }
        
        with patch('app.core.security.authenticate_request', return_value=test_user):
            response = client.post(
                "/api/v1/payments/deposits/initiate",
                json={
                    'amount': 500.0,
                    'gateway': 'mock',
                    'description': 'Test deposit'
                }
            )
        
        assert response.status_code == 200
        data = response.json()
        assert data['success'] is True
        assert 'transaction_id' in data
    
    def test_initiate_deposit_api_invalid_amount(self, test_user):
        """Test deposit initiation with invalid amount"""
        with patch('app.core.security.authenticate_request', return_value=test_user):
            response = client.post(
                "/api/v1/payments/deposits/initiate",
                json={
                    'amount': -100.0,  # Negative amount
                    'gateway': 'mock',
                    'description': 'Test deposit'
                }
            )
        
        assert response.status_code == 422  # Validation error
    
    def test_initiate_deposit_api_rate_limit(self, test_user):
        """Test deposit API rate limiting"""
        with patch('app.core.security.authenticate_request', return_value=test_user):
            with patch('app.services.payment_security_service.payment_security_service.check_rate_limit', return_value=False):
                response = client.post(
                    "/api/v1/payments/deposits/initiate",
                    json={
                        'amount': 100.0,
                        'gateway': 'mock',
                        'description': 'Test deposit'
                    }
                )
        
        assert response.status_code == 429  # Too many requests


class TestWebhookHandling:
    """Test webhook processing functionality"""
    
    def test_process_payment_success_webhook(self, db_session, test_user):
        """Test processing successful payment webhook"""
        # Create a pending transaction
        transaction = Transaction(
            id=uuid.uuid4(),
            user_id=test_user.id,
            amount=Decimal('100.00'),
            type=TransactionType.DEPOSIT,
            category=TransactionCategory.DEPOSIT,
            status=TransactionStatus.PENDING,
            description='Test deposit',
            gateway_order_id='order_123'
        )
        db_session.add(transaction)
        db_session.commit()
        
        # Create webhook payload
        webhook_payload = {
            'event_type': 'payment.captured',
            'payment_id': 'payment_123',
            'order_id': 'order_123',
            'amount': 10000,  # Amount in paise
            'currency': 'INR',
            'status': 'captured'
        }
        
        webhook = PaymentWebhook(
            id=uuid.uuid4(),
            provider='mock',
            event_type='payment.captured',
            payload=webhook_payload,
            signature='test_signature',
            headers={'content-type': 'application/json'},
            status=WebhookStatus.PENDING
        )
        db_session.add(webhook)
        db_session.commit()
        
        # Process webhook
        from app.api.v1.endpoints.webhooks import WebhookProcessor
        processor = WebhookProcessor(db_session)
        success = processor.process_webhook(webhook)
        
        assert success is True
        
        # Check transaction status updated
        updated_transaction = db_session.query(Transaction).filter(
            Transaction.id == transaction.id
        ).first()
        assert updated_transaction.status == TransactionStatus.COMPLETED
        
        # Check wallet balance updated
        balance_info = wallet_service.get_wallet_balance(db_session, test_user.id)
        assert balance_info['balance'] >= Decimal('1000.00')  # Original + deposit


class TestPCICompliance:
    """Test PCI DSS compliance features"""
    
    def test_sensitive_data_masking(self):
        """Test sensitive data masking utility"""
        from app.utils.pci_compliance import mask_sensitive_data
        
        test_data = {
            'card_number': '4111111111111111',
            'cvv': '123',
            'amount': 100.00,
            'description': 'Test payment'
        }
        
        masked = mask_sensitive_data(test_data)
        
        assert masked['card_number'] == '************1111'
        assert masked['cvv'] == '****'
        assert masked['amount'] == 100.00
        assert masked['description'] == 'Test payment'
    
    def test_audit_hash_generation(self):
        """Test audit hash generation for data integrity"""
        from app.utils.pci_compliance import generate_audit_hash
        
        test_data = {
            'transaction_id': 'txn_123',
            'amount': 100.00,
            'timestamp': '2024-01-01T10:00:00'
        }
        
        hash1 = generate_audit_hash(test_data)
        hash2 = generate_audit_hash(test_data)
        
        # Same data should produce same hash
        assert hash1 == hash2
        assert len(hash1) == 64  # SHA-256 hex length
        
        # Different data should produce different hash
        test_data['amount'] = 200.00
        hash3 = generate_audit_hash(test_data)
        assert hash1 != hash3
    
    def test_encryption_validation(self):
        """Test encryption requirements validation"""
        from app.utils.pci_compliance import validate_encryption_requirements
        
        # Unencrypted sensitive data
        unencrypted_data = {
            'card_number': '4111111111111111',
            'cvv': '123',
            'account_number': '1234567890'
        }
        
        errors = validate_encryption_requirements(unencrypted_data)
        assert len(errors) > 0
        assert any('card_number' in error for error in errors)
        
        # Encrypted data (base64 encoded string)
        encrypted_data = {
            'card_number': 'gAAAAABh5X7K8vQqE4mF...',  # Looks like encrypted data
            'user_name': 'John Doe',
            'amount': 100.00
        }
        
        errors = validate_encryption_requirements(encrypted_data)
        # Should have fewer or no errors for encrypted data
        assert len(errors) == 0 or not any('card_number' in error for error in errors)


@pytest.mark.integration
class TestPaymentIntegration:
    """Integration tests for complete payment workflows"""
    
    def test_complete_deposit_workflow(self, db_session, test_user, test_payment_method):
        """Test complete deposit workflow from initiation to completion"""
        # 1. Initiate deposit
        with patch('app.services.payment_gateway_service.payment_gateway_service.create_order') as mock_create:
            mock_create.return_value = {
                'success': True,
                'order_id': 'gateway_order_123',
                'amount': Decimal('500.00'),
                'currency': 'INR'
            }
            
            result = transaction_service.initiate_deposit(
                db=db_session,
                user_id=test_user.id,
                amount=Decimal('500.00'),
                payment_method_id=test_payment_method.id,
                gateway=PaymentGateway.MOCK,
                description='Integration test deposit'
            )
            
            assert result['success'] is True
            transaction_id = result['transaction_id']
        
        # 2. Simulate webhook completion
        transaction = db_session.query(Transaction).filter(
            Transaction.id == transaction_id
        ).first()
        
        webhook_payload = {
            'payment_id': 'payment_123',
            'order_id': transaction.gateway_order_id,
            'amount': 50000,  # 500.00 in paise
            'status': 'captured'
        }
        
        from app.api.v1.endpoints.webhooks import WebhookProcessor
        processor = WebhookProcessor(db_session)
        
        # Mock webhook processing
        success = processor.process_payment_success(
            webhook=Mock(id=uuid.uuid4()),
            payment_data=webhook_payload
        )
        
        assert success is True
        
        # 3. Verify final state
        updated_transaction = db_session.query(Transaction).filter(
            Transaction.id == transaction_id
        ).first()
        
        assert updated_transaction.status == TransactionStatus.COMPLETED
        
        # Check wallet balance increased
        final_balance = wallet_service.get_wallet_balance(db_session, test_user.id)
        assert final_balance['balance'] >= Decimal('1500.00')  # 1000 + 500
    
    def test_failed_deposit_workflow(self, db_session, test_user, test_payment_method):
        """Test deposit workflow with payment failure"""
        # 1. Initiate deposit
        with patch('app.services.payment_gateway_service.payment_gateway_service.create_order') as mock_create:
            mock_create.return_value = {
                'success': True,
                'order_id': 'gateway_order_failed',
                'amount': Decimal('500.00'),
                'currency': 'INR'
            }
            
            result = transaction_service.initiate_deposit(
                db=db_session,
                user_id=test_user.id,
                amount=Decimal('500.00'),
                payment_method_id=test_payment_method.id,
                gateway=PaymentGateway.MOCK,
                description='Failed deposit test'
            )
            
            transaction_id = result['transaction_id']
        
        # 2. Simulate webhook failure
        transaction = db_session.query(Transaction).filter(
            Transaction.id == transaction_id
        ).first()
        
        webhook_payload = {
            'payment_id': 'payment_failed',
            'order_id': transaction.gateway_order_id,
            'error_description': 'Card declined',
            'status': 'failed'
        }
        
        from app.api.v1.endpoints.webhooks import WebhookProcessor
        processor = WebhookProcessor(db_session)
        
        success = processor.process_payment_failed(
            webhook=Mock(id=uuid.uuid4()),
            payment_data=webhook_payload
        )
        
        assert success is True
        
        # 3. Verify transaction marked as failed
        updated_transaction = db_session.query(Transaction).filter(
            Transaction.id == transaction_id
        ).first()
        
        assert updated_transaction.status == TransactionStatus.FAILED
        assert 'declined' in updated_transaction.failure_reason.lower()
        
        # Verify wallet balance unchanged
        final_balance = wallet_service.get_wallet_balance(db_session, test_user.id)
        assert final_balance['balance'] == Decimal('1000.00')  # Original balance


if __name__ == '__main__':
    pytest.main([__file__, '-v'])