"""
Pytest configuration and shared fixtures for payment system tests
"""

import os
import sys
import pytest
from unittest.mock import Mock, patch

# Add the app directory to Python path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Set test environment variables
os.environ['TESTING'] = 'true'
os.environ['ENCRYPTION_PASSWORD'] = 'test-encryption-password-for-testing'

# Mock external dependencies
@pytest.fixture(autouse=True)
def mock_external_services():
    """Mock external services for all tests"""
    with patch('app.services.payment_gateway_service.requests.Session') as mock_session:
        # Mock successful responses for payment gateway requests
        mock_response = Mock()
        mock_response.json.return_value = {
            'id': 'mock_order_123',
            'amount': 10000,
            'currency': 'INR',
            'status': 'created',
            'created_at': 1640995200
        }
        mock_response.raise_for_status.return_value = None
        
        mock_session.return_value.post.return_value = mock_response
        mock_session.return_value.get.return_value = mock_response
        
        yield mock_session


@pytest.fixture
def mock_authentication():
    """Mock authentication for API tests"""
    from database.models.user_models import User, UserRole, KYCLevel
    import uuid
    
    mock_user = User(
        id=uuid.uuid4(),
        email="test@example.com",
        phone="+919876543210",
        first_name="Test",
        last_name="User",
        is_active=True,
        is_verified=True,
        role=UserRole.USER,
        kyc_level=KYCLevel.BASIC
    )
    
    with patch('app.core.security.authenticate_request', return_value=mock_user):
        yield mock_user


@pytest.fixture(scope="session")
def test_database_url():
    """Provide test database URL"""
    return "sqlite:///:memory:"


# Configure pytest logging
def pytest_configure():
    """Configure pytest settings"""
    # Reduce logging noise during tests
    import logging
    logging.getLogger('app.services').setLevel(logging.WARNING)
    logging.getLogger('app.utils').setLevel(logging.WARNING)


# Custom markers for test categorization
def pytest_configure(config):
    """Configure custom pytest markers"""
    config.addinivalue_line(
        "markers", "unit: mark test as a unit test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as an integration test"
    )
    config.addinivalue_line(
        "markers", "security: mark test as a security test"
    )
    config.addinivalue_line(
        "markers", "performance: mark test as a performance test"
    )


# Test data factories
@pytest.fixture
def sample_card_data():
    """Sample credit card data for testing"""
    return {
        'visa': {
            'number': '4111111111111111',
            'cvv': '123',
            'expiry_month': 12,
            'expiry_year': 2025,
            'brand': 'VISA'
        },
        'mastercard': {
            'number': '5555555555554444',
            'cvv': '456',
            'expiry_month': 11,
            'expiry_year': 2026,
            'brand': 'MASTERCARD'
        },
        'amex': {
            'number': '378282246310005',
            'cvv': '1234',
            'expiry_month': 10,
            'expiry_year': 2024,
            'brand': 'AMEX'
        }
    }


@pytest.fixture
def sample_transaction_data():
    """Sample transaction data for testing"""
    return {
        'deposit': {
            'amount': 500.00,
            'currency': 'INR',
            'type': 'deposit',
            'description': 'Test deposit transaction'
        },
        'withdrawal': {
            'amount': 200.00,
            'currency': 'INR',
            'type': 'withdrawal',
            'description': 'Test withdrawal transaction'
        }
    }


@pytest.fixture
def sample_webhook_data():
    """Sample webhook data for testing"""
    return {
        'razorpay_success': {
            'event': 'payment.captured',
            'payload': {
                'payment': {
                    'entity': {
                        'id': 'pay_test123',
                        'order_id': 'order_test123',
                        'amount': 50000,
                        'currency': 'INR',
                        'status': 'captured',
                        'method': 'card'
                    }
                }
            }
        },
        'razorpay_failed': {
            'event': 'payment.failed',
            'payload': {
                'payment': {
                    'entity': {
                        'id': 'pay_test124',
                        'order_id': 'order_test124',
                        'amount': 50000,
                        'currency': 'INR',
                        'status': 'failed',
                        'error_description': 'Card declined by bank'
                    }
                }
            }
        }
    }


# Performance testing utilities
@pytest.fixture
def performance_timer():
    """Timer fixture for performance tests"""
    import time
    
    class Timer:
        def __init__(self):
            self.start_time = None
            self.end_time = None
        
        def start(self):
            self.start_time = time.time()
        
        def stop(self):
            self.end_time = time.time()
        
        @property
        def elapsed(self):
            if self.start_time and self.end_time:
                return self.end_time - self.start_time
            return None
    
    return Timer()


# Cleanup fixtures
@pytest.fixture(autouse=True)
def cleanup_test_data():
    """Clean up test data after each test"""
    yield
    # Any cleanup code would go here
    # For in-memory SQLite, this is handled automatically


# Test data validation utilities
def validate_transaction_response(response_data):
    """Validate transaction response structure"""
    required_fields = ['success', 'transaction_id', 'amount']
    for field in required_fields:
        assert field in response_data, f"Missing required field: {field}"


def validate_wallet_response(response_data):
    """Validate wallet response structure"""
    required_fields = ['balance', 'available_balance', 'locked_balance']
    for field in required_fields:
        assert field in response_data, f"Missing required field: {field}"