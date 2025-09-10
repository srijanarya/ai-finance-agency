"""
KYC verification service with mock external API integrations
Handles document verification, risk scoring, and compliance checks
"""

import random
import re
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple, Any
import uuid

from sqlalchemy.orm import Session

from database.models import (
    User, UserProfile, KYCDocument, KYCStatus,
    AddressVerification, KYCDocumentType, KYCVerificationStatus,
    AddressVerificationMethod, AuditLog, AuditAction
)


class KYCVerificationService:
    """
    Service for KYC verification and compliance
    Integrates with external verification APIs (mocked for development)
    """
    
    # PAN card regex pattern
    PAN_PATTERN = re.compile(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$')
    
    # Aadhaar regex pattern (simplified)
    AADHAAR_PATTERN = re.compile(r'^\d{12}$')
    
    # IFSC code pattern
    IFSC_PATTERN = re.compile(r'^[A-Z]{4}0[A-Z0-9]{6}$')
    
    # Pin code pattern
    PINCODE_PATTERN = re.compile(r'^\d{6}$')
    
    def __init__(self):
        """Initialize KYC verification service"""
        self.digilocker_enabled = False  # Set to True when DigiLocker is integrated
        self.nsdl_enabled = False  # Set to True when NSDL is integrated
    
    async def verify_pan_card(
        self,
        pan_number: str,
        name: str,
        date_of_birth: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Verify PAN card details with NSDL (mocked)
        
        Args:
            pan_number: PAN card number
            name: Name to verify
            date_of_birth: Date of birth for additional verification
            
        Returns:
            Verification result dictionary
        """
        # Validate PAN format
        if not self.PAN_PATTERN.match(pan_number):
            return {
                'verified': False,
                'error': 'Invalid PAN format',
                'details': None
            }
        
        # Mock NSDL API call
        if self.nsdl_enabled:
            # TODO: Implement actual NSDL API integration
            pass
        
        # Mock verification logic
        mock_success = random.random() > 0.1  # 90% success rate
        
        if mock_success:
            # Generate mock response
            mock_response = {
                'verified': True,
                'pan_number': pan_number,
                'name_match': self._fuzzy_name_match(name, f"Mock {name}"),
                'status': 'ACTIVE',
                'category': 'INDIVIDUAL',
                'last_updated': datetime.utcnow().isoformat(),
                'verification_id': f"NSDL_{uuid.uuid4().hex[:12]}",
                'details': {
                    'first_name': name.split()[0] if name else '',
                    'last_name': name.split()[-1] if name and len(name.split()) > 1 else '',
                    'pan_status': 'E-KYC Verified',
                    'aadhaar_linked': random.choice([True, False])
                }
            }
        else:
            mock_response = {
                'verified': False,
                'error': 'PAN verification failed',
                'details': None
            }
        
        return mock_response
    
    async def verify_aadhaar(
        self,
        aadhaar_number: str,
        name: str,
        date_of_birth: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Verify Aadhaar details via DigiLocker (mocked)
        
        Args:
            aadhaar_number: Aadhaar number (masked)
            name: Name to verify
            date_of_birth: Date of birth for verification
            
        Returns:
            Verification result dictionary
        """
        # Validate Aadhaar format (simplified check)
        if not self.AADHAAR_PATTERN.match(aadhaar_number):
            return {
                'verified': False,
                'error': 'Invalid Aadhaar format',
                'details': None
            }
        
        # Mock DigiLocker API call
        if self.digilocker_enabled:
            # TODO: Implement actual DigiLocker API integration
            pass
        
        # Mock verification logic
        mock_success = random.random() > 0.15  # 85% success rate
        
        if mock_success:
            mock_response = {
                'verified': True,
                'aadhaar_number': f"XXXX-XXXX-{aadhaar_number[-4:]}",  # Masked
                'name_match': self._fuzzy_name_match(name, f"Mock {name}"),
                'dob_match': True if date_of_birth else None,
                'verification_id': f"DL_{uuid.uuid4().hex[:12]}",
                'digilocker_reference': f"DL_REF_{uuid.uuid4().hex[:8]}",
                'details': {
                    'name': name,
                    'gender': random.choice(['M', 'F', 'O']),
                    'address': {
                        'state': 'Karnataka',
                        'district': 'Bangalore',
                        'pin_code': '560001'
                    },
                    'mobile_verified': True,
                    'email_verified': random.choice([True, False])
                }
            }
        else:
            mock_response = {
                'verified': False,
                'error': 'Aadhaar verification failed',
                'details': None
            }
        
        return mock_response
    
    async def verify_bank_account(
        self,
        account_number: str,
        ifsc_code: str,
        account_holder_name: str
    ) -> Dict[str, Any]:
        """
        Verify bank account details (mocked)
        
        Args:
            account_number: Bank account number
            ifsc_code: IFSC code
            account_holder_name: Account holder name
            
        Returns:
            Verification result dictionary
        """
        # Validate IFSC format
        if not self.IFSC_PATTERN.match(ifsc_code):
            return {
                'verified': False,
                'error': 'Invalid IFSC code format',
                'details': None
            }
        
        # Mock bank verification
        mock_success = random.random() > 0.1  # 90% success rate
        
        if mock_success:
            mock_response = {
                'verified': True,
                'account_number': f"XXXX{account_number[-4:]}",  # Masked
                'ifsc_code': ifsc_code,
                'name_match': self._fuzzy_name_match(account_holder_name, f"Mock {account_holder_name}"),
                'bank_name': self._get_bank_name_from_ifsc(ifsc_code),
                'branch': 'Mock Branch',
                'account_type': random.choice(['SAVINGS', 'CURRENT']),
                'account_status': 'ACTIVE',
                'verification_id': f"BANK_{uuid.uuid4().hex[:12]}",
                'details': {
                    'micr_code': f"{random.randint(100000000, 999999999)}",
                    'branch_address': 'Mock Branch Address, City',
                    'upi_enabled': random.choice([True, False]),
                    'net_banking_enabled': True
                }
            }
        else:
            mock_response = {
                'verified': False,
                'error': 'Bank account verification failed',
                'details': None
            }
        
        return mock_response
    
    async def verify_address(
        self,
        address: str,
        pin_code: str,
        document_type: AddressVerificationMethod
    ) -> Dict[str, Any]:
        """
        Verify address details (mocked)
        
        Args:
            address: Full address
            pin_code: Pin code
            document_type: Type of address proof document
            
        Returns:
            Verification result dictionary
        """
        # Validate pin code format
        if not self.PINCODE_PATTERN.match(pin_code):
            return {
                'verified': False,
                'error': 'Invalid pin code format',
                'details': None
            }
        
        # Mock address verification
        mock_success = random.random() > 0.05  # 95% success rate
        
        if mock_success:
            mock_response = {
                'verified': True,
                'pin_code': pin_code,
                'pin_code_valid': True,
                'document_type': document_type.value,
                'verification_id': f"ADDR_{uuid.uuid4().hex[:12]}",
                'details': {
                    'state': self._get_state_from_pincode(pin_code),
                    'district': 'Mock District',
                    'post_office': 'Mock Post Office',
                    'division': 'Mock Division',
                    'region': 'Mock Region',
                    'circle': 'Mock Circle',
                    'delivery_status': 'DELIVERABLE',
                    'latitude': 12.9716 + random.uniform(-0.1, 0.1),
                    'longitude': 77.5946 + random.uniform(-0.1, 0.1)
                }
            }
        else:
            mock_response = {
                'verified': False,
                'error': 'Address verification failed',
                'details': None
            }
        
        return mock_response
    
    def calculate_risk_score(
        self,
        user_profile: UserProfile,
        kyc_status: KYCStatus
    ) -> Tuple[int, list]:
        """
        Calculate risk score based on KYC verification status
        
        Args:
            user_profile: User profile
            kyc_status: KYC status
            
        Returns:
            Tuple of (risk_score, risk_factors)
        """
        risk_score = 0
        risk_factors = []
        
        # Document verification status
        if not kyc_status.pan_verified:
            risk_score += 30
            risk_factors.append("PAN not verified")
        
        if not kyc_status.aadhaar_verified:
            risk_score += 25
            risk_factors.append("Aadhaar not verified")
        
        if not kyc_status.address_verified:
            risk_score += 15
            risk_factors.append("Address not verified")
        
        if not kyc_status.bank_verified:
            risk_score += 20
            risk_factors.append("Bank account not verified")
        
        # Profile completeness
        if user_profile.profile_completion_percentage < 50:
            risk_score += 15
            risk_factors.append("Profile less than 50% complete")
        elif user_profile.profile_completion_percentage < 80:
            risk_score += 10
            risk_factors.append("Profile incomplete")
        
        # Income bracket
        if user_profile.income_bracket == 'NOT_DISCLOSED':
            risk_score += 10
            risk_factors.append("Income not disclosed")
        
        # Enhanced verification bonus
        if kyc_status.video_kyc_completed:
            risk_score = max(0, risk_score - 15)
            risk_factors.append("Video KYC completed (-15 bonus)")
        
        if kyc_status.in_person_verification:
            risk_score = max(0, risk_score - 20)
            risk_factors.append("In-person verification (-20 bonus)")
        
        # Cap risk score at 100
        risk_score = min(100, risk_score)
        
        return risk_score, risk_factors
    
    def set_transaction_limits(self, kyc_status: KYCStatus) -> Dict[str, float]:
        """
        Set transaction limits based on KYC verification level
        
        Args:
            kyc_status: KYC status
            
        Returns:
            Dictionary with daily and monthly limits
        """
        limits = {
            'daily_limit': 10000.0,  # Default 10k
            'monthly_limit': 50000.0  # Default 50k
        }
        
        if kyc_status.overall_status == KYCVerificationStatus.VERIFIED:
            if kyc_status.risk_score <= 20:
                # Low risk - highest limits
                limits['daily_limit'] = 1000000.0  # 10 lakhs
                limits['monthly_limit'] = 10000000.0  # 1 crore
            elif kyc_status.risk_score <= 50:
                # Medium risk - moderate limits
                limits['daily_limit'] = 500000.0  # 5 lakhs
                limits['monthly_limit'] = 5000000.0  # 50 lakhs
            else:
                # High risk - lower limits
                limits['daily_limit'] = 100000.0  # 1 lakh
                limits['monthly_limit'] = 1000000.0  # 10 lakhs
        elif kyc_status.overall_status == KYCVerificationStatus.UNDER_REVIEW:
            # Under review - restricted limits
            limits['daily_limit'] = 25000.0  # 25k
            limits['monthly_limit'] = 100000.0  # 1 lakh
        
        return limits
    
    async def perform_video_kyc(
        self,
        user_id: str,
        session_id: str,
        video_data: bytes
    ) -> Dict[str, Any]:
        """
        Perform video KYC verification (mocked)
        
        Args:
            user_id: User ID
            session_id: Video session ID
            video_data: Video recording data
            
        Returns:
            Verification result dictionary
        """
        # Mock video KYC verification
        mock_success = random.random() > 0.2  # 80% success rate
        
        if mock_success:
            return {
                'verified': True,
                'session_id': session_id,
                'verification_id': f"VKYC_{uuid.uuid4().hex[:12]}",
                'confidence_score': random.uniform(0.85, 0.99),
                'checks_passed': {
                    'face_match': True,
                    'liveness_detection': True,
                    'document_visible': True,
                    'audio_clear': True
                },
                'recording_url': f"/recordings/{session_id}.mp4",
                'completed_at': datetime.utcnow().isoformat()
            }
        else:
            return {
                'verified': False,
                'session_id': session_id,
                'error': 'Video KYC verification failed',
                'failure_reason': random.choice([
                    'Face match failed',
                    'Liveness detection failed',
                    'Document not visible',
                    'Audio quality poor'
                ])
            }
    
    def create_audit_log(
        self,
        db: Session,
        user_id: str,
        action: str,
        resource_type: str,
        resource_id: str,
        details: Dict[str, Any],
        success: bool = True
    ):
        """
        Create audit log for KYC actions
        
        Args:
            db: Database session
            user_id: User ID
            action: Action performed
            resource_type: Type of resource
            resource_id: Resource ID
            details: Action details
            success: Whether action was successful
        """
        audit_log = AuditLog.create_log(
            user_id=user_id,
            tenant_id=None,  # Will be set from user's tenant
            action=AuditAction.UPDATE,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            success=success
        )
        
        db.add(audit_log)
        db.commit()
    
    def _fuzzy_name_match(self, name1: str, name2: str) -> float:
        """
        Perform fuzzy name matching
        
        Args:
            name1: First name
            name2: Second name
            
        Returns:
            Match score (0.0 to 1.0)
        """
        # Simple mock implementation
        # In production, use proper fuzzy matching library
        if name1.lower() == name2.lower():
            return 1.0
        elif name1.lower() in name2.lower() or name2.lower() in name1.lower():
            return 0.8
        else:
            return random.uniform(0.6, 0.95)
    
    def _get_bank_name_from_ifsc(self, ifsc_code: str) -> str:
        """
        Get bank name from IFSC code
        
        Args:
            ifsc_code: IFSC code
            
        Returns:
            Bank name
        """
        # Mock bank name mapping
        bank_codes = {
            'SBIN': 'State Bank of India',
            'HDFC': 'HDFC Bank',
            'ICIC': 'ICICI Bank',
            'AXIS': 'Axis Bank',
            'KOTAK': 'Kotak Mahindra Bank',
            'PUNB': 'Punjab National Bank',
            'CANR': 'Canara Bank',
            'BOBR': 'Bank of Baroda'
        }
        
        bank_code = ifsc_code[:4] if len(ifsc_code) >= 4 else 'UNKN'
        return bank_codes.get(bank_code, 'Unknown Bank')
    
    def _get_state_from_pincode(self, pin_code: str) -> str:
        """
        Get state from pin code
        
        Args:
            pin_code: Pin code
            
        Returns:
            State name
        """
        # Mock state mapping based on first digit
        first_digit = pin_code[0] if pin_code else '0'
        state_map = {
            '1': 'Delhi/Haryana',
            '2': 'Uttar Pradesh/Uttarakhand',
            '3': 'Rajasthan/Gujarat',
            '4': 'Maharashtra/Goa',
            '5': 'Karnataka/Andhra Pradesh',
            '6': 'Tamil Nadu/Kerala',
            '7': 'West Bengal/Odisha',
            '8': 'Assam/Northeast',
            '9': 'Army Post Office'
        }
        
        return state_map.get(first_digit, 'Unknown')


# Singleton instance
kyc_verification_service = KYCVerificationService()