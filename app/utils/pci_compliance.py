"""
PCI DSS Compliance Utilities for AI Finance Agency
Provides utilities and decorators for PCI DSS compliance
"""

import functools
import logging
import os
import time
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional
from fastapi import Request, HTTPException
import hashlib
import secrets

logger = logging.getLogger(__name__)


class PCIComplianceError(Exception):
    """Custom exception for PCI compliance violations"""
    pass


def pci_secure_endpoint(
    require_https: bool = True,
    rate_limit: int = 10,
    window_seconds: int = 60,
    log_requests: bool = True
):
    """
    Decorator for PCI-compliant API endpoints
    
    Args:
        require_https: Require HTTPS connection
        rate_limit: Maximum requests per window
        window_seconds: Rate limiting window
        log_requests: Log all requests for audit trail
    """
    def decorator(func: Callable) -> Callable:
        # Simple in-memory rate limiting (use Redis in production)
        rate_limit_storage = {}
        
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract request object
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            if not request:
                # Look in kwargs
                request = kwargs.get('request')
            
            if request:
                # Check HTTPS requirement
                if require_https and request.url.scheme != 'https':
                    logger.warning(f"Non-HTTPS request to secure endpoint: {request.url}")
                    raise HTTPException(
                        status_code=403,
                        detail="HTTPS required for payment operations"
                    )
                
                # Rate limiting
                client_ip = request.client.host if request.client else 'unknown'
                current_time = time.time()
                
                if client_ip not in rate_limit_storage:
                    rate_limit_storage[client_ip] = []
                
                # Clean old entries
                rate_limit_storage[client_ip] = [
                    timestamp for timestamp in rate_limit_storage[client_ip]
                    if current_time - timestamp < window_seconds
                ]
                
                # Check rate limit
                if len(rate_limit_storage[client_ip]) >= rate_limit:
                    logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                    raise HTTPException(
                        status_code=429,
                        detail="Rate limit exceeded"
                    )
                
                # Record current request
                rate_limit_storage[client_ip].append(current_time)
                
                # Log request for audit
                if log_requests:
                    log_data = {
                        'timestamp': datetime.utcnow().isoformat(),
                        'endpoint': str(request.url.path),
                        'method': request.method,
                        'ip': client_ip,
                        'user_agent': request.headers.get('user-agent', 'unknown'),
                        'content_length': request.headers.get('content-length', '0')
                    }
                    logger.info(f"PCI_AUDIT: {log_data}")
            
            # Execute the original function
            try:
                result = await func(*args, **kwargs)
                
                # Log successful completion
                if request and log_requests:
                    logger.info(f"PCI_AUDIT_SUCCESS: {request.url.path} completed")
                
                return result
                
            except Exception as e:
                # Log failed requests
                if request and log_requests:
                    logger.error(f"PCI_AUDIT_FAILURE: {request.url.path} failed: {str(e)}")
                raise
        
        return wrapper
    return decorator


def mask_sensitive_data(data: Dict[str, Any], sensitive_fields: List[str] = None) -> Dict[str, Any]:
    """
    Mask sensitive data in dictionaries for logging
    
    Args:
        data: Data dictionary
        sensitive_fields: List of field names to mask
        
    Returns:
        Dictionary with sensitive fields masked
    """
    if sensitive_fields is None:
        sensitive_fields = [
            'card_number', 'cardnumber', 'number', 'pan',
            'cvv', 'cvc', 'security_code', 'cvv2',
            'pin', 'password', 'secret', 'key',
            'token', 'api_key', 'private_key',
            'account_number', 'routing_number',
            'ssn', 'social_security_number',
            'aadhaar', 'passport_number'
        ]
    
    masked_data = {}
    
    for key, value in data.items():
        if isinstance(value, dict):
            masked_data[key] = mask_sensitive_data(value, sensitive_fields)
        elif isinstance(value, list):
            masked_data[key] = [
                mask_sensitive_data(item, sensitive_fields) if isinstance(item, dict) else item
                for item in value
            ]
        elif key.lower() in [field.lower() for field in sensitive_fields]:
            # Mask the sensitive field
            if isinstance(value, str) and len(value) > 4:
                masked_data[key] = f"{'*' * (len(value) - 4)}{value[-4:]}"
            else:
                masked_data[key] = '****'
        else:
            masked_data[key] = value
    
    return masked_data


def validate_card_data_retention(days_since_creation: int) -> bool:
    """
    Validate card data retention policy (PCI DSS requirement)
    
    Args:
        days_since_creation: Days since card data was created
        
    Returns:
        True if within retention policy
    """
    # PCI DSS requires card data to be deleted after it's no longer needed
    # For payment processing, typically 30-90 days maximum
    MAX_RETENTION_DAYS = 90
    
    return days_since_creation <= MAX_RETENTION_DAYS


def generate_audit_hash(data: Dict[str, Any]) -> str:
    """
    Generate audit hash for transaction data integrity
    
    Args:
        data: Transaction data
        
    Returns:
        SHA-256 audit hash
    """
    # Sort keys for consistent hashing
    sorted_data = sorted(data.items())
    data_string = str(sorted_data)
    
    return hashlib.sha256(data_string.encode()).hexdigest()


def validate_encryption_requirements(data: Dict[str, Any]) -> List[str]:
    """
    Validate that sensitive data meets encryption requirements
    
    Args:
        data: Data to validate
        
    Returns:
        List of validation errors
    """
    errors = []
    
    # Check for unencrypted sensitive fields
    sensitive_patterns = [
        ('card_number', r'^\d{13,19}$'),
        ('cvv', r'^\d{3,4}$'),
        ('pin', r'^\d{4,6}$'),
        ('account_number', r'^\d+$'),
    ]
    
    for field_name, pattern in sensitive_patterns:
        if field_name in data:
            value = data[field_name]
            if isinstance(value, str) and len(value) > 0:
                # If it matches the pattern, it's likely unencrypted
                import re
                if re.match(pattern, value):
                    errors.append(f"Unencrypted sensitive data detected in field: {field_name}")
    
    return errors


class PCIAuditLogger:
    """
    Specialized logger for PCI compliance audit trails
    """
    
    def __init__(self):
        self.logger = logging.getLogger('pci_audit')
        
    def log_payment_event(self, event_type: str, user_id: str, amount: float,
                         currency: str, transaction_id: str, additional_data: Dict[str, Any] = None):
        """
        Log payment-related events for audit trail
        
        Args:
            event_type: Type of payment event
            user_id: User identifier
            amount: Transaction amount
            currency: Currency code
            transaction_id: Transaction identifier
            additional_data: Additional audit data
        """
        audit_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            'user_id': user_id,
            'amount': amount,
            'currency': currency,
            'transaction_id': transaction_id,
            'audit_hash': self._generate_entry_hash(event_type, user_id, amount, transaction_id)
        }
        
        if additional_data:
            # Mask sensitive data before logging
            masked_data = mask_sensitive_data(additional_data)
            audit_entry['additional_data'] = masked_data
        
        self.logger.info(f"PCI_AUDIT: {audit_entry}")
    
    def log_access_event(self, user_id: str, resource: str, action: str, 
                        ip_address: str, user_agent: str, success: bool):
        """
        Log access events for security monitoring
        
        Args:
            user_id: User identifier
            resource: Accessed resource
            action: Action performed
            ip_address: Client IP
            user_agent: Client user agent
            success: Whether access was successful
        """
        access_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': 'access_event',
            'user_id': user_id,
            'resource': resource,
            'action': action,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'success': success,
            'audit_hash': self._generate_entry_hash('access', user_id, resource, action)
        }
        
        self.logger.info(f"PCI_ACCESS_AUDIT: {access_entry}")
    
    def log_data_event(self, event_type: str, data_type: str, record_id: str,
                      user_id: str, action: str):
        """
        Log data manipulation events
        
        Args:
            event_type: Type of data event (create, read, update, delete)
            data_type: Type of data (payment_method, transaction, etc.)
            record_id: Record identifier
            user_id: User who performed action
            action: Detailed action description
        """
        data_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': f'data_{event_type}',
            'data_type': data_type,
            'record_id': record_id,
            'user_id': user_id,
            'action': action,
            'audit_hash': self._generate_entry_hash(event_type, data_type, record_id, user_id)
        }
        
        self.logger.info(f"PCI_DATA_AUDIT: {data_entry}")
    
    def _generate_entry_hash(self, *args) -> str:
        """Generate hash for audit entry integrity"""
        entry_string = '|'.join(str(arg) for arg in args)
        salt = secrets.token_hex(8)
        return hashlib.sha256(f"{entry_string}|{salt}".encode()).hexdigest()


class PCIDataValidator:
    """
    Validator for PCI DSS data requirements
    """
    
    @staticmethod
    def validate_card_number_storage(card_number: str, is_encrypted: bool) -> List[str]:
        """
        Validate card number storage compliance
        
        Args:
            card_number: Card number to validate
            is_encrypted: Whether the card number is encrypted
            
        Returns:
            List of validation errors
        """
        errors = []
        
        if not is_encrypted:
            errors.append("Card number must be encrypted when stored")
        
        # Check if it looks like a raw card number
        if card_number and len(card_number) > 6:
            # Should not contain readable card numbers
            clean_number = ''.join(filter(str.isdigit, card_number))
            if len(clean_number) >= 13 and not is_encrypted:
                errors.append("Raw card number detected in storage")
        
        return errors
    
    @staticmethod
    def validate_cvv_storage(cvv: str) -> List[str]:
        """
        Validate CVV storage compliance (CVV should never be stored)
        
        Args:
            cvv: CVV to validate
            
        Returns:
            List of validation errors
        """
        errors = []
        
        if cvv:
            errors.append("CVV/CVC must never be stored after authorization")
        
        return errors
    
    @staticmethod
    def validate_encryption_key_management() -> List[str]:
        """
        Validate encryption key management practices
        
        Returns:
            List of validation warnings
        """
        warnings = []
        
        # Check if default encryption password is being used
        if os.getenv('ENCRYPTION_PASSWORD') == 'default-password-change-in-production':
            warnings.append("Default encryption password detected - change in production")
        
        # Check key file permissions (simplified - implement proper checks)
        key_file = os.getenv('ENCRYPTION_KEY_FILE', 'encryption.key')
        if os.path.exists(key_file):
            stat = os.stat(key_file)
            # Check if file is readable by others (simplified permission check)
            if stat.st_mode & 0o044:
                warnings.append("Encryption key file has overly permissive permissions")
        
        return warnings


# Singleton instances
pci_audit_logger = PCIAuditLogger()
pci_data_validator = PCIDataValidator()


def setup_pci_logging():
    """Setup PCI-compliant logging configuration"""
    pci_logger = logging.getLogger('pci_audit')
    pci_logger.setLevel(logging.INFO)
    
    # Create secure file handler
    handler = logging.FileHandler('pci_audit.log', mode='a')
    handler.setLevel(logging.INFO)
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    
    pci_logger.addHandler(handler)
    
    return pci_logger