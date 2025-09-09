"""
Validation Service for AI Finance Agency
Provides comprehensive input validation for authentication
"""

import re
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class ValidationService:
    """Validation service for user input validation"""
    
    def __init__(self):
        # Password validation rules
        self.min_password_length = 8
        self.max_password_length = 128
        self.password_patterns = {
            'uppercase': r'[A-Z]',
            'lowercase': r'[a-z]', 
            'digit': r'[0-9]',
            'special': r'[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]'
        }
        
        # Email validation pattern (RFC 5322 compliant)
        self.email_pattern = re.compile(
            r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        )
        
        # Common weak passwords
        self.weak_passwords = {
            'password', 'password123', '123456', '123456789', 
            'qwerty', 'abc123', 'password1', 'admin', 'letmein',
            'welcome', 'monkey', '1234567890', 'password!',
            'Password1', 'Password123'
        }
    
    def is_valid_email(self, email: str) -> bool:
        """
        Validate email address format
        
        Args:
            email: Email address to validate
            
        Returns:
            True if valid, False otherwise
        """
        if not email or not isinstance(email, str):
            return False
        
        # Check length (email can be max 320 characters per RFC 5321)
        if len(email) > 320:
            return False
        
        # Check format
        return bool(self.email_pattern.match(email.strip().lower()))
    
    def validate_password(self, password: str) -> Dict[str, Any]:
        """
        Comprehensive password validation
        
        Args:
            password: Password to validate
            
        Returns:
            Dictionary with validation results
        """
        errors = []
        
        if not password or not isinstance(password, str):
            return {
                'valid': False,
                'errors': ['Password is required'],
                'strength': 0
            }
        
        # Length check
        if len(password) < self.min_password_length:
            errors.append(f'Password must be at least {self.min_password_length} characters long')
        elif len(password) > self.max_password_length:
            errors.append(f'Password must be no more than {self.max_password_length} characters long')
        
        # Character requirements
        missing_requirements = []
        
        if not re.search(self.password_patterns['uppercase'], password):
            missing_requirements.append('uppercase letter')
        
        if not re.search(self.password_patterns['lowercase'], password):
            missing_requirements.append('lowercase letter')
        
        if not re.search(self.password_patterns['digit'], password):
            missing_requirements.append('number')
        
        if not re.search(self.password_patterns['special'], password):
            missing_requirements.append('special character (!@#$%^&*)')
        
        if missing_requirements:
            errors.append(f'Password must contain at least one: {", ".join(missing_requirements)}')
        
        # Check for weak/common passwords
        if password.lower() in self.weak_passwords:
            errors.append('Password is too common. Please choose a more unique password')
        
        # Check for sequential/repeated characters
        if self._has_sequential_chars(password):
            errors.append('Password should not contain sequential characters (e.g., 123, abc)')
        
        if self._has_repeated_chars(password):
            errors.append('Password should not contain repeated characters (e.g., aaa, 111)')
        
        # Calculate strength score
        strength = self._calculate_password_strength(password)
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'strength': strength,
            'strength_label': self._get_strength_label(strength)
        }
    
    def validate_name(self, name: str, field_name: str = "Name") -> Dict[str, Any]:
        """
        Validate first/last name
        
        Args:
            name: Name to validate
            field_name: Field name for error messages
            
        Returns:
            Dictionary with validation results
        """
        errors = []
        
        if not name or not isinstance(name, str):
            errors.append(f'{field_name} is required')
            return {'valid': False, 'errors': errors}
        
        name = name.strip()
        
        # Length check
        if len(name) < 1:
            errors.append(f'{field_name} is required')
        elif len(name) > 50:
            errors.append(f'{field_name} must be 50 characters or less')
        
        # Character validation (allow letters, spaces, hyphens, apostrophes)
        if not re.match(r"^[a-zA-Z\s\-']+$", name):
            errors.append(f'{field_name} can only contain letters, spaces, hyphens, and apostrophes')
        
        # Check for excessive spaces or special chars
        if re.search(r'\s{2,}', name):
            errors.append(f'{field_name} should not contain multiple consecutive spaces')
        
        return {
            'valid': len(errors) == 0,
            'errors': errors
        }
    
    def validate_registration_data(
        self,
        email: str,
        password: str,
        first_name: str,
        last_name: str
    ) -> Dict[str, Any]:
        """
        Validate all registration data together
        
        Args:
            email: Email address
            password: Password
            first_name: First name
            last_name: Last name
            
        Returns:
            Dictionary with validation results
        """
        all_errors = []
        
        # Email validation
        if not self.is_valid_email(email):
            all_errors.append({
                'field': 'email',
                'message': 'Please enter a valid email address'
            })
        
        # Password validation
        password_result = self.validate_password(password)
        if not password_result['valid']:
            all_errors.extend([
                {'field': 'password', 'message': error}
                for error in password_result['errors']
            ])
        
        # First name validation
        first_name_result = self.validate_name(first_name, 'First name')
        if not first_name_result['valid']:
            all_errors.extend([
                {'field': 'first_name', 'message': error}
                for error in first_name_result['errors']
            ])
        
        # Last name validation
        last_name_result = self.validate_name(last_name, 'Last name')
        if not last_name_result['valid']:
            all_errors.extend([
                {'field': 'last_name', 'message': error}
                for error in last_name_result['errors']
            ])
        
        return {
            'valid': len(all_errors) == 0,
            'errors': all_errors,
            'password_strength': password_result.get('strength', 0) if password_result['valid'] else 0
        }
    
    def sanitize_input(self, text: str, max_length: int = None) -> str:
        """
        Sanitize user input
        
        Args:
            text: Input text to sanitize
            max_length: Maximum allowed length
            
        Returns:
            Sanitized text
        """
        if not isinstance(text, str):
            return ""
        
        # Strip whitespace
        text = text.strip()
        
        # Remove null bytes and control characters
        text = ''.join(char for char in text if ord(char) >= 32 or char in '\t\n\r')
        
        # Truncate if needed
        if max_length and len(text) > max_length:
            text = text[:max_length]
        
        return text
    
    def _has_sequential_chars(self, password: str) -> bool:
        """Check for sequential characters in password"""
        for i in range(len(password) - 2):
            if len(set(password[i:i+3])) == 3:
                chars = password[i:i+3]
                if (ord(chars[1]) == ord(chars[0]) + 1 and 
                    ord(chars[2]) == ord(chars[1]) + 1):
                    return True
        return False
    
    def _has_repeated_chars(self, password: str) -> bool:
        """Check for repeated characters in password"""
        for i in range(len(password) - 2):
            if password[i] == password[i+1] == password[i+2]:
                return True
        return False
    
    def _calculate_password_strength(self, password: str) -> int:
        """
        Calculate password strength score (0-100)
        
        Args:
            password: Password to analyze
            
        Returns:
            Strength score from 0-100
        """
        score = 0
        
        # Length bonus
        if len(password) >= 8:
            score += 25
        if len(password) >= 12:
            score += 10
        if len(password) >= 16:
            score += 10
        
        # Character variety bonus
        if re.search(self.password_patterns['lowercase'], password):
            score += 10
        if re.search(self.password_patterns['uppercase'], password):
            score += 10
        if re.search(self.password_patterns['digit'], password):
            score += 10
        if re.search(self.password_patterns['special'], password):
            score += 15
        
        # Uniqueness bonus
        unique_chars = len(set(password))
        if unique_chars >= len(password) * 0.7:
            score += 10
        
        return min(score, 100)
    
    def _get_strength_label(self, strength: int) -> str:
        """
        Get human-readable strength label
        
        Args:
            strength: Strength score
            
        Returns:
            Strength label
        """
        if strength >= 80:
            return 'Very Strong'
        elif strength >= 60:
            return 'Strong'
        elif strength >= 40:
            return 'Moderate'
        elif strength >= 20:
            return 'Weak'
        else:
            return 'Very Weak'