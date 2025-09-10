"""
User Profile and KYC models for AI Finance Agency
Handles user profiles, KYC verification, and document management
"""

import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, ForeignKey, String, Text, Integer,
    UniqueConstraint, Index, CheckConstraint, Float, Date
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database.connection import Base


class IncomeBracket(str, enum.Enum):
    """Income bracket enumeration for user profiling"""
    BRACKET_0_3L = "0-3L"
    BRACKET_3_10L = "3-10L"
    BRACKET_10L_PLUS = "10L+"
    NOT_DISCLOSED = "not_disclosed"


class KYCDocumentType(str, enum.Enum):
    """KYC document type enumeration"""
    PAN = "PAN"
    AADHAAR = "AADHAAR"
    BANK_STATEMENT = "BANK_STATEMENT"
    UTILITY_BILL = "UTILITY_BILL"
    PASSPORT = "PASSPORT"
    DRIVING_LICENSE = "DRIVING_LICENSE"
    VOTER_ID = "VOTER_ID"


class KYCVerificationStatus(str, enum.Enum):
    """KYC verification status enumeration"""
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"


class AddressVerificationMethod(str, enum.Enum):
    """Address verification method enumeration"""
    AADHAAR = "AADHAAR"
    UTILITY_BILL = "UTILITY_BILL"
    BANK_STATEMENT = "BANK_STATEMENT"
    RENTAL_AGREEMENT = "RENTAL_AGREEMENT"
    PROPERTY_DEED = "PROPERTY_DEED"


class UserProfile(Base):
    """
    User profile model for storing additional user information
    Extends the base User model with profile-specific data
    """
    __tablename__ = "user_profiles"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # User association (one-to-one)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Personal information
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(10), nullable=True)
    phone_secondary = Column(String(15), nullable=True)
    
    # Address information
    address_line_1 = Column(String(255), nullable=True)
    address_line_2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pin_code = Column(String(6), nullable=True)
    country = Column(String(3), default="IND", nullable=False)
    
    # Financial information
    income_bracket = Column(Enum(IncomeBracket), default=IncomeBracket.NOT_DISCLOSED, nullable=False)
    occupation = Column(String(100), nullable=True)
    employer_name = Column(String(255), nullable=True)
    
    # Bank details (encrypted in production)
    bank_name = Column(String(100), nullable=True)
    bank_account_number = Column(String(255), nullable=True)  # Encrypted
    bank_ifsc_code = Column(String(11), nullable=True)
    bank_account_holder_name = Column(String(255), nullable=True)
    
    # Government IDs (encrypted/hashed in production)
    pan_number = Column(String(255), nullable=True)  # Encrypted
    aadhaar_number = Column(String(255), nullable=True)  # Encrypted/Hashed
    
    # Profile completion tracking
    profile_completion_percentage = Column(Integer, default=0, nullable=False)
    is_profile_complete = Column(Boolean, default=False, nullable=False)
    
    # Preferences
    investment_preferences = Column(JSONB, default=dict)
    risk_appetite = Column(String(20), nullable=True)  # conservative, moderate, aggressive
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="profile", uselist=False)
    kyc_documents = relationship("KYCDocument", back_populates="user_profile", cascade="all, delete-orphan")
    kyc_status = relationship("KYCStatus", back_populates="user_profile", uselist=False, cascade="all, delete-orphan")
    address_verifications = relationship("AddressVerification", back_populates="user_profile", cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        CheckConstraint("pin_code ~ '^[0-9]{6}$'", name="profile_pin_code_format"),
        CheckConstraint("bank_ifsc_code ~ '^[A-Z]{4}0[A-Z0-9]{6}$'", name="profile_ifsc_format"),
        Index("idx_profile_created", "created_at"),
        Index("idx_profile_completion", "profile_completion_percentage"),
    )
    
    def calculate_completion_percentage(self) -> int:
        """Calculate profile completion percentage based on filled fields"""
        required_fields = [
            'date_of_birth', 'gender', 'address_line_1', 'city', 'state', 
            'pin_code', 'income_bracket', 'occupation', 'pan_number'
        ]
        
        filled_count = sum(1 for field in required_fields if getattr(self, field))
        return int((filled_count / len(required_fields)) * 100)
    
    def update_completion_status(self):
        """Update profile completion percentage and status"""
        self.profile_completion_percentage = self.calculate_completion_percentage()
        self.is_profile_complete = self.profile_completion_percentage >= 90
    
    def __repr__(self):
        return f"<UserProfile(id={self.id}, user_id={self.user_id}, completion={self.profile_completion_percentage}%)>"


class KYCDocument(Base):
    """
    KYC document model for storing user verification documents
    Handles document storage, verification, and audit trail
    """
    __tablename__ = "kyc_documents"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # User association
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    user_profile_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Document information
    document_type = Column(Enum(KYCDocumentType), nullable=False, index=True)
    document_number = Column(String(255), nullable=True)  # Encrypted
    document_name = Column(String(255), nullable=True)  # Original filename
    
    # File storage (encrypted)
    file_path = Column(String(500), nullable=False)  # Encrypted storage path
    file_hash = Column(String(255), nullable=False)  # SHA-256 hash for integrity
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    
    # Encryption details
    encryption_key_id = Column(String(255), nullable=True)  # Key management reference
    is_encrypted = Column(Boolean, default=True, nullable=False)
    
    # Verification details
    verification_status = Column(Enum(KYCVerificationStatus), default=KYCVerificationStatus.PENDING, nullable=False, index=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    verification_notes = Column(Text, nullable=True)
    
    # External verification
    digilocker_reference = Column(String(255), nullable=True)
    external_verification_id = Column(String(255), nullable=True)
    external_verification_response = Column(JSONB, nullable=True)
    
    # Document expiry
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    
    # Metadata
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)  # Soft delete
    
    # Relationships
    user = relationship("User")
    user_profile = relationship("UserProfile", back_populates="kyc_documents")
    verified_by_user = relationship("User", foreign_keys=[verified_by])
    
    # Constraints and indexes
    __table_args__ = (
        UniqueConstraint('user_id', 'document_type', 'deleted_at', name='unique_document_type_per_user'),
        Index("idx_kyc_doc_user_type", "user_id", "document_type"),
        Index("idx_kyc_doc_status", "verification_status"),
        Index("idx_kyc_doc_uploaded", "uploaded_at"),
    )
    
    @hybrid_property
    def is_expired(self) -> bool:
        """Check if document is expired"""
        return self.expiry_date is not None and self.expiry_date < datetime.now().date()
    
    @hybrid_property
    def is_valid(self) -> bool:
        """Check if document is valid for use"""
        return (
            self.verification_status == KYCVerificationStatus.VERIFIED and
            not self.is_expired and
            self.deleted_at is None
        )
    
    def mark_as_verified(self, verified_by_user_id: uuid.UUID, notes: Optional[str] = None):
        """Mark document as verified"""
        self.verification_status = KYCVerificationStatus.VERIFIED
        self.verified_at = datetime.utcnow()
        self.verified_by = verified_by_user_id
        self.verification_notes = notes
        self.rejection_reason = None
    
    def mark_as_rejected(self, verified_by_user_id: uuid.UUID, reason: str, notes: Optional[str] = None):
        """Mark document as rejected"""
        self.verification_status = KYCVerificationStatus.REJECTED
        self.verified_at = datetime.utcnow()
        self.verified_by = verified_by_user_id
        self.rejection_reason = reason
        self.verification_notes = notes
    
    def soft_delete(self):
        """Soft delete the document"""
        self.deleted_at = datetime.utcnow()
    
    def __repr__(self):
        return f"<KYCDocument(id={self.id}, type={self.document_type}, status={self.verification_status})>"


class KYCStatus(Base):
    """
    KYC status model for tracking overall KYC verification status
    Aggregates individual document verifications into overall status
    """
    __tablename__ = "kyc_status"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # User association (one-to-one)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    user_profile_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Overall status
    overall_status = Column(Enum(KYCVerificationStatus), default=KYCVerificationStatus.PENDING, nullable=False, index=True)
    
    # Individual verification status
    pan_verified = Column(Boolean, default=False, nullable=False)
    pan_verified_at = Column(DateTime(timezone=True), nullable=True)
    
    aadhaar_verified = Column(Boolean, default=False, nullable=False)
    aadhaar_verified_at = Column(DateTime(timezone=True), nullable=True)
    
    address_verified = Column(Boolean, default=False, nullable=False)
    address_verified_at = Column(DateTime(timezone=True), nullable=True)
    
    bank_verified = Column(Boolean, default=False, nullable=False)
    bank_verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Verification timeline
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    last_updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Review details
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    review_notes = Column(Text, nullable=True)
    
    # Risk assessment
    risk_score = Column(Integer, default=0, nullable=False)  # 0-100
    risk_factors = Column(JSONB, default=list)
    compliance_notes = Column(Text, nullable=True)
    
    # Verification limits
    daily_transaction_limit = Column(Float, nullable=True)
    monthly_transaction_limit = Column(Float, nullable=True)
    
    # Enhanced verification
    video_kyc_completed = Column(Boolean, default=False, nullable=False)
    video_kyc_completed_at = Column(DateTime(timezone=True), nullable=True)
    in_person_verification = Column(Boolean, default=False, nullable=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    user_profile = relationship("UserProfile", back_populates="kyc_status")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    
    # Constraints and indexes
    __table_args__ = (
        CheckConstraint("risk_score >= 0 AND risk_score <= 100", name="kyc_status_risk_score_range"),
        Index("idx_kyc_status_overall", "overall_status"),
        Index("idx_kyc_status_submitted", "submitted_at"),
        Index("idx_kyc_status_risk", "risk_score"),
    )
    
    def calculate_risk_score(self) -> int:
        """Calculate risk score based on various factors"""
        score = 0
        factors = []
        
        # Basic verification checks
        if not self.pan_verified:
            score += 25
            factors.append("PAN not verified")
        if not self.aadhaar_verified:
            score += 25
            factors.append("Aadhaar not verified")
        if not self.address_verified:
            score += 15
            factors.append("Address not verified")
        if not self.bank_verified:
            score += 15
            factors.append("Bank account not verified")
        
        # Enhanced verification bonus
        if self.video_kyc_completed:
            score = max(0, score - 10)
            factors.append("Video KYC completed (bonus)")
        if self.in_person_verification:
            score = max(0, score - 15)
            factors.append("In-person verification (bonus)")
        
        self.risk_score = min(100, score)
        self.risk_factors = factors
        return self.risk_score
    
    def update_overall_status(self):
        """Update overall KYC status based on individual verifications"""
        all_verified = all([
            self.pan_verified,
            self.aadhaar_verified,
            self.address_verified,
            self.bank_verified
        ])
        
        if all_verified:
            self.overall_status = KYCVerificationStatus.VERIFIED
            self.verified_at = datetime.utcnow()
        elif any([self.pan_verified, self.aadhaar_verified, self.address_verified, self.bank_verified]):
            self.overall_status = KYCVerificationStatus.UNDER_REVIEW
        else:
            self.overall_status = KYCVerificationStatus.PENDING
    
    def set_transaction_limits(self):
        """Set transaction limits based on KYC level"""
        if self.overall_status == KYCVerificationStatus.VERIFIED:
            if self.risk_score <= 20:
                self.daily_transaction_limit = 1000000.0  # 10 lakhs
                self.monthly_transaction_limit = 10000000.0  # 1 crore
            elif self.risk_score <= 50:
                self.daily_transaction_limit = 500000.0  # 5 lakhs
                self.monthly_transaction_limit = 5000000.0  # 50 lakhs
            else:
                self.daily_transaction_limit = 100000.0  # 1 lakh
                self.monthly_transaction_limit = 1000000.0  # 10 lakhs
        else:
            self.daily_transaction_limit = 10000.0  # 10k for unverified
            self.monthly_transaction_limit = 50000.0  # 50k for unverified
    
    def __repr__(self):
        return f"<KYCStatus(user_id={self.user_id}, status={self.overall_status}, risk_score={self.risk_score})>"


class AddressVerification(Base):
    """
    Address verification model for tracking address proof documents
    Supports multiple verification methods and address history
    """
    __tablename__ = "address_verifications"
    
    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # User association
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    user_profile_id = Column(UUID(as_uuid=True), ForeignKey("user_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Address details
    address_line_1 = Column(String(255), nullable=False)
    address_line_2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pin_code = Column(String(6), nullable=False)
    country = Column(String(3), default="IND", nullable=False)
    
    # Verification details
    verification_method = Column(Enum(AddressVerificationMethod), nullable=False, index=True)
    verification_status = Column(Enum(KYCVerificationStatus), default=KYCVerificationStatus.PENDING, nullable=False, index=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    
    # Document reference
    kyc_document_id = Column(UUID(as_uuid=True), ForeignKey("kyc_documents.id"), nullable=True)
    
    # Address type
    is_current_address = Column(Boolean, default=True, nullable=False)
    is_permanent_address = Column(Boolean, default=False, nullable=False)
    
    # Geo-location (for enhanced verification)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # External verification
    pin_code_verified = Column(Boolean, default=False, nullable=False)
    google_maps_verified = Column(Boolean, default=False, nullable=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")
    user_profile = relationship("UserProfile", back_populates="address_verifications")
    kyc_document = relationship("KYCDocument")
    
    # Constraints and indexes
    __table_args__ = (
        CheckConstraint("pin_code ~ '^[0-9]{6}$'", name="address_pin_code_format"),
        Index("idx_address_user", "user_id"),
        Index("idx_address_pin_code", "pin_code"),
        Index("idx_address_status", "verification_status"),
    )
    
    def __repr__(self):
        return f"<AddressVerification(id={self.id}, user_id={self.user_id}, status={self.verification_status})>"