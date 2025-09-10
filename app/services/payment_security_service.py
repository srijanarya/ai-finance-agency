"""
Payment Security Service for AI Finance Agency
Implements PCI DSS compliance, data encryption, and security controls
"""

import hashlib
import secrets
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, Any, Optional, List, Set
import logging
import re
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os

from sqlalchemy.orm import Session
from database.models.payment_models import (
    Transaction, PaymentMethod, PaymentWebhook,
    TransactionStatus, PaymentMethodType, CardBrand
)
from database.models.user_models import User

logger = logging.getLogger(__name__)


class PaymentSecurityService:
    """
    Payment security service implementing PCI DSS compliance and security controls
    """
    
    def __init__(self):
        """Initialize payment security service"""
        self.encryption_key = self._get_or_create_encryption_key()
        self.fernet = Fernet(self.encryption_key)
        
        # Security patterns
        self.card_number_pattern = re.compile(r'^\d{13,19}$')
        self.cvv_pattern = re.compile(r'^\d{3,4}$')
        self.sensitive_data_patterns = [
            re.compile(r'\b\d{13,19}\b'),  # Credit card numbers
            re.compile(r'\b\d{3,4}\b'),    # CVV codes (when context suggests payment)
            re.compile(r'\b\d{4}-\d{4}-\d{4}-\d{4}\b'),  # Formatted card numbers
        ]
        
        # Rate limiting storage (in production, use Redis)
        self.rate_limit_attempts = {}
        self.blocked_ips = set()
        self.suspicious_activities = {}
    
    def _get_or_create_encryption_key(self) -> bytes:
        """Get or create encryption key for sensitive data"""
        key_file = os.getenv('ENCRYPTION_KEY_FILE', 'encryption.key')
        
        if os.path.exists(key_file):
            with open(key_file, 'rb') as f:
                return f.read()
        else:
            # Generate new key
            password = os.getenv('ENCRYPTION_PASSWORD', 'default-password-change-in-production').encode()
            salt = os.urandom(16)
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(password))
            
            # Save key securely (in production, use proper key management)
            with open(key_file, 'wb') as f:
                f.write(key)
            
            # Also save salt for future use
            with open(f"{key_file}.salt", 'wb') as f:
                f.write(salt)
            
            return key
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """
        Encrypt sensitive payment data
        
        Args:
            data: Sensitive data to encrypt
            
        Returns:
            Encrypted data as base64 string
        """
        try:
            encrypted = self.fernet.encrypt(data.encode())
            return base64.urlsafe_b64encode(encrypted).decode()
        except Exception as e:
            logger.error(f"Encryption failed: {str(e)}")
            raise ValueError("Failed to encrypt sensitive data")
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """
        Decrypt sensitive payment data
        
        Args:
            encrypted_data: Base64 encrypted data
            
        Returns:
            Decrypted data
        """
        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode())
            decrypted = self.fernet.decrypt(encrypted_bytes)
            return decrypted.decode()
        except Exception as e:
            logger.error(f"Decryption failed: {str(e)}")
            raise ValueError("Failed to decrypt sensitive data")
    
    def mask_card_number(self, card_number: str) -> str:
        """
        Mask credit card number for display
        
        Args:
            card_number: Full card number
            
        Returns:
            Masked card number (e.g., ****-****-****-1234)
        """
        if not card_number or len(card_number) < 6:
            return "****-****-****-****"
        
        # Show only last 4 digits
        return f"****-****-****-{card_number[-4:]}"
    
    def get_card_brand(self, card_number: str) -> CardBrand:
        """
        Identify card brand from card number
        
        Args:
            card_number: Credit card number
            
        Returns:
            Card brand enum
        """
        # Remove spaces and dashes
        clean_number = re.sub(r'[^\d]', '', card_number)
        
        if not clean_number:
            return CardBrand.UNKNOWN
        
        # Visa: starts with 4
        if clean_number.startswith('4'):
            return CardBrand.VISA
        
        # Mastercard: starts with 5 or 2221-2720
        elif clean_number.startswith('5') or (clean_number.startswith('2') and 2221 <= int(clean_number[:4]) <= 2720):
            return CardBrand.MASTERCARD
        
        # American Express: starts with 34 or 37
        elif clean_number.startswith(('34', '37')):
            return CardBrand.AMEX
        
        # Discover: starts with 6011, 65, or 644-649
        elif (clean_number.startswith('6011') or 
              clean_number.startswith('65') or 
              (clean_number.startswith('64') and 644 <= int(clean_number[:3]) <= 649)):
            return CardBrand.DISCOVER
        
        # Diners: starts with 30, 36, 38
        elif clean_number.startswith(('30', '36', '38')):
            return CardBrand.DINERS
        
        # JCB: starts with 35
        elif clean_number.startswith('35'):
            return CardBrand.JCB
        
        # RuPay (India): starts with 60, 65, 81, 82
        elif clean_number.startswith(('60', '81', '82')):
            return CardBrand.RUPAY
        
        else:
            return CardBrand.UNKNOWN
    
    def validate_card_number(self, card_number: str) -> bool:
        """
        Validate credit card number using Luhn algorithm
        
        Args:
            card_number: Credit card number
            
        Returns:
            Validation result
        """
        # Remove spaces and dashes
        clean_number = re.sub(r'[^\d]', '', card_number)
        
        if not self.card_number_pattern.match(clean_number):
            return False
        
        # Luhn algorithm
        digits = [int(d) for d in clean_number]
        
        # Double every second digit from right
        for i in range(len(digits) - 2, -1, -2):
            digits[i] *= 2
            if digits[i] > 9:
                digits[i] -= 9
        
        # Check if sum is divisible by 10
        return sum(digits) % 10 == 0
    
    def validate_cvv(self, cvv: str, card_brand: CardBrand) -> bool:
        """
        Validate CVV based on card brand
        
        Args:
            cvv: CVV code
            card_brand: Card brand
            
        Returns:
            Validation result
        """
        if not self.cvv_pattern.match(cvv):
            return False
        
        # American Express uses 4-digit CVV
        if card_brand == CardBrand.AMEX:
            return len(cvv) == 4
        else:
            return len(cvv) == 3
    
    def sanitize_logs(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sanitize sensitive data from logs
        
        Args:
            data: Data to sanitize
            
        Returns:
            Sanitized data
        """
        sanitized = {}
        
        for key, value in data.items():
            if isinstance(value, str):
                # Check for sensitive patterns
                sanitized_value = value
                
                for pattern in self.sensitive_data_patterns:
                    sanitized_value = pattern.sub('****', sanitized_value)
                
                # Specific field sanitization
                if key.lower() in ['card_number', 'cardnumber', 'number']:
                    sanitized_value = self.mask_card_number(value)
                elif key.lower() in ['cvv', 'cvc', 'security_code']:
                    sanitized_value = '***'
                elif key.lower() in ['pin']:
                    sanitized_value = '****'
                
                sanitized[key] = sanitized_value
            
            elif isinstance(value, dict):
                sanitized[key] = self.sanitize_logs(value)
            
            elif isinstance(value, list):
                sanitized[key] = [
                    self.sanitize_logs(item) if isinstance(item, dict) else item
                    for item in value
                ]
            
            else:
                sanitized[key] = value
        
        return sanitized
    
    def check_rate_limit(self, identifier: str, limit: int = 5, window_minutes: int = 15) -> bool:
        """
        Check rate limiting for payment operations
        
        Args:
            identifier: IP address or user ID
            limit: Maximum attempts per window
            window_minutes: Time window in minutes
            
        Returns:
            True if within rate limit, False if exceeded
        """
        now = datetime.utcnow()
        window_start = now - timedelta(minutes=window_minutes)
        
        if identifier not in self.rate_limit_attempts:
            self.rate_limit_attempts[identifier] = []
        
        # Remove old attempts
        self.rate_limit_attempts[identifier] = [
            attempt_time for attempt_time in self.rate_limit_attempts[identifier]
            if attempt_time > window_start
        ]
        
        # Check if limit exceeded
        if len(self.rate_limit_attempts[identifier]) >= limit:
            logger.warning(f"Rate limit exceeded for {identifier}")
            return False
        
        # Record current attempt
        self.rate_limit_attempts[identifier].append(now)
        return True
    
    def detect_suspicious_activity(self, db: Session, user_id: uuid.UUID, transaction_data: Dict[str, Any]) -> List[str]:
        """
        Detect suspicious payment activity
        
        Args:
            db: Database session
            user_id: User ID
            transaction_data: Transaction information
            
        Returns:
            List of suspicious activity indicators
        """
        suspicious_indicators = []
        
        # Check for rapid successive transactions
        recent_transactions = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.created_at > datetime.utcnow() - timedelta(minutes=5)
        ).count()
        
        if recent_transactions > 3:
            suspicious_indicators.append("rapid_successive_transactions")
        
        # Check for unusual amounts
        amount = transaction_data.get('amount', 0)
        if isinstance(amount, (int, float, Decimal)):
            amount = float(amount)
            
            # Very large amounts
            if amount > 10000:
                suspicious_indicators.append("large_amount")
            
            # Unusual round amounts (possible testing)
            if amount in [100, 1000, 5000, 10000]:
                suspicious_indicators.append("round_amount_pattern")
        
        # Check for multiple failed attempts
        failed_transactions = db.query(Transaction).filter(
            Transaction.user_id == user_id,
            Transaction.status == TransactionStatus.FAILED,
            Transaction.created_at > datetime.utcnow() - timedelta(hours=1)
        ).count()
        
        if failed_transactions > 2:
            suspicious_indicators.append("multiple_failed_attempts")
        
        # Check for different payment methods in short time
        recent_payment_methods = db.query(PaymentMethod).filter(
            PaymentMethod.user_id == user_id,
            PaymentMethod.created_at > datetime.utcnow() - timedelta(hours=24)
        ).count()
        
        if recent_payment_methods > 3:
            suspicious_indicators.append("multiple_payment_methods")
        
        return suspicious_indicators
    
    def log_security_event(self, event_type: str, user_id: Optional[uuid.UUID], 
                          ip_address: str, details: Dict[str, Any]):
        """
        Log security-related events
        
        Args:
            event_type: Type of security event
            user_id: User ID if applicable
            ip_address: Client IP address
            details: Event details
        """
        sanitized_details = self.sanitize_logs(details)
        
        security_log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "user_id": str(user_id) if user_id else None,
            "ip_address": ip_address,
            "details": sanitized_details
        }
        
        # In production, send to security monitoring system
        logger.warning(f"SECURITY_EVENT: {security_log_entry}")
    
    def validate_transaction_limits(self, db: Session, user: User, amount: Decimal, 
                                   transaction_type: str) -> Dict[str, Any]:
        """
        Validate transaction against user limits
        
        Args:
            db: Database session
            user: User object
            amount: Transaction amount
            transaction_type: Type of transaction
            
        Returns:
            Validation result with limits info
        """
        # Get user's KYC level and calculate limits
        kyc_level = getattr(user, 'kyc_level', 'BASIC')
        
        # Define limits based on KYC level
        daily_limits = {
            'BASIC': Decimal('10000'),      # ₹10,000
            'INTERMEDIATE': Decimal('50000'), # ₹50,000
            'ADVANCED': Decimal('500000')    # ₹5,00,000
        }
        
        monthly_limits = {
            'BASIC': Decimal('100000'),     # ₹1,00,000
            'INTERMEDIATE': Decimal('1000000'), # ₹10,00,000
            'ADVANCED': Decimal('5000000')     # ₹50,00,000
        }
        
        single_transaction_limits = {
            'BASIC': Decimal('5000'),       # ₹5,000
            'INTERMEDIATE': Decimal('25000'), # ₹25,000
            'ADVANCED': Decimal('100000')   # ₹1,00,000
        }
        
        user_daily_limit = daily_limits.get(kyc_level, daily_limits['BASIC'])
        user_monthly_limit = monthly_limits.get(kyc_level, monthly_limits['BASIC'])
        user_single_limit = single_transaction_limits.get(kyc_level, single_transaction_limits['BASIC'])
        
        # Check single transaction limit
        if amount > user_single_limit:
            return {
                "valid": False,
                "reason": "single_transaction_limit_exceeded",
                "limit": user_single_limit,
                "amount": amount
            }
        
        # Check daily limit
        today = datetime.utcnow().date()
        daily_total = db.query(Transaction).filter(
            Transaction.user_id == user.id,
            Transaction.status == TransactionStatus.COMPLETED,
            Transaction.created_at >= today
        ).with_entities(
            db.func.sum(Transaction.amount)
        ).scalar() or Decimal('0')
        
        if daily_total + amount > user_daily_limit:
            return {
                "valid": False,
                "reason": "daily_limit_exceeded",
                "limit": user_daily_limit,
                "used": daily_total,
                "amount": amount
            }
        
        # Check monthly limit
        month_start = datetime.utcnow().replace(day=1).date()
        monthly_total = db.query(Transaction).filter(
            Transaction.user_id == user.id,
            Transaction.status == TransactionStatus.COMPLETED,
            Transaction.created_at >= month_start
        ).with_entities(
            db.func.sum(Transaction.amount)
        ).scalar() or Decimal('0')
        
        if monthly_total + amount > user_monthly_limit:
            return {
                "valid": False,
                "reason": "monthly_limit_exceeded",
                "limit": user_monthly_limit,
                "used": monthly_total,
                "amount": amount
            }
        
        return {
            "valid": True,
            "daily_limit": user_daily_limit,
            "daily_used": daily_total,
            "daily_remaining": user_daily_limit - daily_total,
            "monthly_limit": user_monthly_limit,
            "monthly_used": monthly_total,
            "monthly_remaining": user_monthly_limit - monthly_total
        }
    
    def generate_secure_token(self, length: int = 32) -> str:
        """
        Generate cryptographically secure token
        
        Args:
            length: Token length
            
        Returns:
            Secure random token
        """
        return secrets.token_urlsafe(length)
    
    def hash_payment_reference(self, reference_data: str) -> str:
        """
        Create secure hash of payment reference data
        
        Args:
            reference_data: Reference data to hash
            
        Returns:
            SHA-256 hash
        """
        return hashlib.sha256(reference_data.encode()).hexdigest()
    
    def is_ip_blocked(self, ip_address: str) -> bool:
        """
        Check if IP address is blocked
        
        Args:
            ip_address: IP address to check
            
        Returns:
            True if blocked
        """
        return ip_address in self.blocked_ips
    
    def block_ip_address(self, ip_address: str, reason: str):
        """
        Block IP address due to security violation
        
        Args:
            ip_address: IP address to block
            reason: Reason for blocking
        """
        self.blocked_ips.add(ip_address)
        logger.warning(f"IP {ip_address} blocked: {reason}")
    
    def validate_webhook_source(self, ip_address: str, user_agent: str) -> bool:
        """
        Validate webhook source IP and user agent
        
        Args:
            ip_address: Source IP address
            user_agent: User agent header
            
        Returns:
            True if valid webhook source
        """
        # Known payment gateway IP ranges (simplified)
        allowed_ranges = [
            # Razorpay IPs (example - use actual IPs in production)
            '18.209.',
            '3.6.',
            # Stripe IPs
            '54.187.',
            '54.188.',
            # Local testing
            '127.0.0.1',
            '::1'
        ]
        
        for allowed_range in allowed_ranges:
            if ip_address.startswith(allowed_range):
                return True
        
        return False


# Singleton instance
payment_security_service = PaymentSecurityService()