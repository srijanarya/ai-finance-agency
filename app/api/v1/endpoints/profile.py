"""
User Profile and KYC Management API endpoints
Handles profile updates, KYC document uploads, and verification status
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends, File, UploadFile, Form, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy.orm import Session
from io import BytesIO

from app.core.database import get_db
from app.core.security import authenticate_request
from app.services.file_upload_service import file_upload_service
from app.services.kyc_verification_service import kyc_verification_service
from database.models import (
    User, UserProfile, KYCDocument, KYCStatus, AddressVerification,
    IncomeBracket, KYCDocumentType, KYCVerificationStatus,
    AddressVerificationMethod
)

router = APIRouter()


# Request/Response Models

class ProfileUpdateRequest(BaseModel):
    """Profile update request model"""
    date_of_birth: Optional[str] = None
    gender: Optional[str] = Field(None, max_length=10)
    phone_secondary: Optional[str] = Field(None, max_length=15)
    address_line_1: Optional[str] = Field(None, max_length=255)
    address_line_2: Optional[str] = Field(None, max_length=255)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    pin_code: Optional[str] = Field(None, regex="^[0-9]{6}$")
    income_bracket: Optional[str] = Field(None, pattern="^(0-3L|3-10L|10L\\+|not_disclosed)$")
    occupation: Optional[str] = Field(None, max_length=100)
    employer_name: Optional[str] = Field(None, max_length=255)
    bank_name: Optional[str] = Field(None, max_length=100)
    bank_account_number: Optional[str] = Field(None, max_length=50)
    bank_ifsc_code: Optional[str] = Field(None, regex="^[A-Z]{4}0[A-Z0-9]{6}$")
    bank_account_holder_name: Optional[str] = Field(None, max_length=255)
    pan_number: Optional[str] = Field(None, regex="^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
    aadhaar_number: Optional[str] = Field(None, regex="^[0-9]{12}$")
    investment_preferences: Optional[Dict[str, Any]] = None
    risk_appetite: Optional[str] = Field(None, pattern="^(conservative|moderate|aggressive)$")


class ProfileResponse(BaseModel):
    """Profile response model"""
    id: UUID
    user_id: UUID
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone_secondary: Optional[str] = None
    address_line_1: Optional[str] = None
    address_line_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pin_code: Optional[str] = None
    country: str = "IND"
    income_bracket: str
    occupation: Optional[str] = None
    employer_name: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_number: Optional[str] = None  # Masked in response
    bank_ifsc_code: Optional[str] = None
    bank_account_holder_name: Optional[str] = None
    pan_number: Optional[str] = None  # Masked in response
    aadhaar_number: Optional[str] = None  # Masked in response
    profile_completion_percentage: int
    is_profile_complete: bool
    investment_preferences: Dict[str, Any]
    risk_appetite: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class KYCDocumentResponse(BaseModel):
    """KYC document response model"""
    id: UUID
    document_type: str
    document_number: Optional[str] = None  # Masked
    document_name: Optional[str] = None
    verification_status: str
    verified_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    uploaded_at: datetime
    
    class Config:
        from_attributes = True


class KYCStatusResponse(BaseModel):
    """KYC status response model"""
    id: UUID
    user_id: UUID
    overall_status: str
    pan_verified: bool
    pan_verified_at: Optional[datetime] = None
    aadhaar_verified: bool
    aadhaar_verified_at: Optional[datetime] = None
    address_verified: bool
    address_verified_at: Optional[datetime] = None
    bank_verified: bool
    bank_verified_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    risk_score: int
    risk_factors: List[str]
    daily_transaction_limit: Optional[float] = None
    monthly_transaction_limit: Optional[float] = None
    video_kyc_completed: bool
    video_kyc_completed_at: Optional[datetime] = None
    documents: List[KYCDocumentResponse]
    
    class Config:
        from_attributes = True


# Helper Functions

def mask_sensitive_data(value: str, mask_type: str) -> str:
    """Mask sensitive data for display"""
    if not value:
        return None
    
    if mask_type == "pan":
        # Show first 2 and last 2 characters
        if len(value) >= 10:
            return f"{value[:2]}XXXX{value[-2:]}"
    elif mask_type == "aadhaar":
        # Show last 4 digits only
        if len(value) >= 12:
            return f"XXXX-XXXX-{value[-4:]}"
    elif mask_type == "bank_account":
        # Show last 4 digits
        if len(value) >= 4:
            return f"XXXX{value[-4:]}"
    
    return "XXXX"


def get_or_create_profile(db: Session, user_id: UUID) -> UserProfile:
    """Get or create user profile"""
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    if not profile:
        # Get user details
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Create new profile
        profile = UserProfile(user_id=user_id)
        db.add(profile)
        
        # Create KYC status
        kyc_status = KYCStatus(
            user_id=user_id,
            user_profile_id=profile.id
        )
        db.add(kyc_status)
        
        db.commit()
        db.refresh(profile)
    
    return profile


# API Endpoints

@router.get("/profile", response_model=ProfileResponse)
async def get_user_profile(
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Get current user's profile"""
    profile = get_or_create_profile(db, current_user.id)
    
    # Prepare response with masked sensitive data
    response = ProfileResponse.from_orm(profile)
    if profile.pan_number:
        response.pan_number = mask_sensitive_data(profile.pan_number, "pan")
    if profile.aadhaar_number:
        response.aadhaar_number = mask_sensitive_data(profile.aadhaar_number, "aadhaar")
    if profile.bank_account_number:
        response.bank_account_number = mask_sensitive_data(profile.bank_account_number, "bank_account")
    
    return response


@router.put("/profile", response_model=ProfileResponse)
async def update_user_profile(
    profile_data: ProfileUpdateRequest,
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    profile = get_or_create_profile(db, current_user.id)
    
    # Update profile fields
    update_data = profile_data.dict(exclude_unset=True)
    
    # Handle date conversion
    if "date_of_birth" in update_data and update_data["date_of_birth"]:
        update_data["date_of_birth"] = datetime.strptime(update_data["date_of_birth"], "%Y-%m-%d").date()
    
    # Handle income bracket enum
    if "income_bracket" in update_data:
        update_data["income_bracket"] = IncomeBracket(update_data["income_bracket"])
    
    # Update profile
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    # Update completion status
    profile.update_completion_status()
    
    db.commit()
    db.refresh(profile)
    
    # Prepare response with masked sensitive data
    response = ProfileResponse.from_orm(profile)
    if profile.pan_number:
        response.pan_number = mask_sensitive_data(profile.pan_number, "pan")
    if profile.aadhaar_number:
        response.aadhaar_number = mask_sensitive_data(profile.aadhaar_number, "aadhaar")
    if profile.bank_account_number:
        response.bank_account_number = mask_sensitive_data(profile.bank_account_number, "bank_account")
    
    return response


@router.post("/kyc/documents")
async def upload_kyc_document(
    document_type: str = Form(...),
    document_number: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Upload KYC document for verification"""
    
    # Validate document type
    try:
        doc_type = KYCDocumentType(document_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid document type. Must be one of: {', '.join([t.value for t in KYCDocumentType])}"
        )
    
    # Get user profile
    profile = get_or_create_profile(db, current_user.id)
    
    # Validate file
    file_content = await file.read()
    file_stream = BytesIO(file_content)
    
    is_valid, error_msg = file_upload_service.validate_file(file_stream, document_type)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Save encrypted file
    file_stream.seek(0)
    file_path, file_hash, key_id, file_size = file_upload_service.save_encrypted_file(
        file_stream,
        str(current_user.id),
        document_type,
        file.filename
    )
    
    # Check for existing document of same type
    existing_doc = db.query(KYCDocument).filter(
        KYCDocument.user_id == current_user.id,
        KYCDocument.document_type == doc_type,
        KYCDocument.deleted_at.is_(None)
    ).first()
    
    if existing_doc:
        # Soft delete existing document
        existing_doc.soft_delete()
    
    # Create new document record
    kyc_document = KYCDocument(
        user_id=current_user.id,
        user_profile_id=profile.id,
        document_type=doc_type,
        document_number=document_number,
        document_name=file.filename,
        file_path=file_path,
        file_hash=file_hash,
        file_size=file_size,
        mime_type=file.content_type,
        encryption_key_id=key_id,
        is_encrypted=True,
        verification_status=KYCVerificationStatus.PENDING
    )
    
    db.add(kyc_document)
    db.commit()
    
    # Trigger async verification (in production, this would be a background task)
    # For now, we'll do mock verification
    if document_type == "PAN" and profile.pan_number:
        verification_result = await kyc_verification_service.verify_pan_card(
            profile.pan_number,
            current_user.first_name + " " + current_user.last_name,
            profile.date_of_birth
        )
        
        if verification_result['verified']:
            kyc_document.mark_as_verified(current_user.id, "Auto-verified via NSDL")
            
            # Update KYC status
            kyc_status = db.query(KYCStatus).filter(KYCStatus.user_id == current_user.id).first()
            if kyc_status:
                kyc_status.pan_verified = True
                kyc_status.pan_verified_at = datetime.utcnow()
                kyc_status.update_overall_status()
        else:
            kyc_document.verification_status = KYCVerificationStatus.UNDER_REVIEW
    
    db.commit()
    
    return {
        "success": True,
        "message": "Document uploaded successfully",
        "document_id": str(kyc_document.id),
        "verification_status": kyc_document.verification_status.value
    }


@router.get("/kyc/documents", response_model=List[KYCDocumentResponse])
async def get_kyc_documents(
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Get all KYC documents for current user"""
    documents = db.query(KYCDocument).filter(
        KYCDocument.user_id == current_user.id,
        KYCDocument.deleted_at.is_(None)
    ).all()
    
    # Prepare response with masked document numbers
    response = []
    for doc in documents:
        doc_response = KYCDocumentResponse.from_orm(doc)
        if doc.document_number:
            if doc.document_type == KYCDocumentType.PAN:
                doc_response.document_number = mask_sensitive_data(doc.document_number, "pan")
            elif doc.document_type == KYCDocumentType.AADHAAR:
                doc_response.document_number = mask_sensitive_data(doc.document_number, "aadhaar")
        response.append(doc_response)
    
    return response


@router.get("/kyc/documents/{document_id}/download")
async def download_kyc_document(
    document_id: UUID,
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Download a KYC document"""
    document = db.query(KYCDocument).filter(
        KYCDocument.id == document_id,
        KYCDocument.user_id == current_user.id,
        KYCDocument.deleted_at.is_(None)
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Retrieve and decrypt file
    decrypted_content = file_upload_service.retrieve_decrypted_file(document.file_path)
    
    if not decrypted_content:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve document"
        )
    
    # Apply watermark for audit
    if document.mime_type.startswith("image/"):
        watermark_text = f"Downloaded by {current_user.id} on {datetime.utcnow().strftime('%Y-%m-%d')}"
        decrypted_content = file_upload_service.apply_watermark(decrypted_content, watermark_text)
    
    # Return file
    return StreamingResponse(
        BytesIO(decrypted_content),
        media_type=document.mime_type,
        headers={
            "Content-Disposition": f"attachment; filename={document.document_name}"
        }
    )


@router.delete("/kyc/documents/{document_id}")
async def delete_kyc_document(
    document_id: UUID,
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Delete a KYC document"""
    document = db.query(KYCDocument).filter(
        KYCDocument.id == document_id,
        KYCDocument.user_id == current_user.id,
        KYCDocument.deleted_at.is_(None)
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Soft delete the document
    document.soft_delete()
    
    # Update KYC status if needed
    kyc_status = db.query(KYCStatus).filter(KYCStatus.user_id == current_user.id).first()
    if kyc_status:
        if document.document_type == KYCDocumentType.PAN:
            kyc_status.pan_verified = False
            kyc_status.pan_verified_at = None
        elif document.document_type == KYCDocumentType.AADHAAR:
            kyc_status.aadhaar_verified = False
            kyc_status.aadhaar_verified_at = None
        
        kyc_status.update_overall_status()
    
    db.commit()
    
    # Delete physical file
    file_upload_service.delete_file(document.file_path)
    
    return {"success": True, "message": "Document deleted successfully"}


@router.get("/kyc/status", response_model=KYCStatusResponse)
async def get_kyc_status(
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Get KYC verification status for current user"""
    profile = get_or_create_profile(db, current_user.id)
    
    kyc_status = db.query(KYCStatus).filter(
        KYCStatus.user_id == current_user.id
    ).first()
    
    if not kyc_status:
        # Create KYC status if not exists
        kyc_status = KYCStatus(
            user_id=current_user.id,
            user_profile_id=profile.id
        )
        db.add(kyc_status)
        db.commit()
        db.refresh(kyc_status)
    
    # Calculate risk score
    risk_score, risk_factors = kyc_verification_service.calculate_risk_score(profile, kyc_status)
    kyc_status.risk_score = risk_score
    kyc_status.risk_factors = risk_factors
    
    # Set transaction limits
    limits = kyc_verification_service.set_transaction_limits(kyc_status)
    kyc_status.daily_transaction_limit = limits['daily_limit']
    kyc_status.monthly_transaction_limit = limits['monthly_limit']
    
    db.commit()
    
    # Get documents
    documents = db.query(KYCDocument).filter(
        KYCDocument.user_id == current_user.id,
        KYCDocument.deleted_at.is_(None)
    ).all()
    
    # Prepare response
    response = KYCStatusResponse.from_orm(kyc_status)
    response.documents = [KYCDocumentResponse.from_orm(doc) for doc in documents]
    
    return response


@router.post("/kyc/verify")
async def trigger_kyc_verification(
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Trigger KYC verification process"""
    profile = get_or_create_profile(db, current_user.id)
    
    kyc_status = db.query(KYCStatus).filter(
        KYCStatus.user_id == current_user.id
    ).first()
    
    if not kyc_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="KYC status not found. Please upload documents first."
        )
    
    # Check if documents are uploaded
    documents = db.query(KYCDocument).filter(
        KYCDocument.user_id == current_user.id,
        KYCDocument.deleted_at.is_(None)
    ).all()
    
    if not documents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No KYC documents found. Please upload documents first."
        )
    
    # Update status to under review
    kyc_status.overall_status = KYCVerificationStatus.UNDER_REVIEW
    kyc_status.submitted_at = datetime.utcnow()
    
    # In production, this would trigger background verification tasks
    # For now, we'll do mock verification for each document
    verification_results = []
    
    for doc in documents:
        if doc.verification_status == KYCVerificationStatus.PENDING:
            doc.verification_status = KYCVerificationStatus.UNDER_REVIEW
            
            # Mock verification based on document type
            if doc.document_type == KYCDocumentType.PAN and profile.pan_number:
                result = await kyc_verification_service.verify_pan_card(
                    profile.pan_number,
                    current_user.first_name + " " + current_user.last_name,
                    profile.date_of_birth
                )
                
                if result['verified']:
                    doc.mark_as_verified(current_user.id, "Verified via NSDL")
                    kyc_status.pan_verified = True
                    kyc_status.pan_verified_at = datetime.utcnow()
                
                verification_results.append({
                    "document_type": "PAN",
                    "verified": result['verified']
                })
            
            elif doc.document_type == KYCDocumentType.AADHAAR and profile.aadhaar_number:
                result = await kyc_verification_service.verify_aadhaar(
                    profile.aadhaar_number,
                    current_user.first_name + " " + current_user.last_name,
                    profile.date_of_birth
                )
                
                if result['verified']:
                    doc.mark_as_verified(current_user.id, "Verified via DigiLocker")
                    kyc_status.aadhaar_verified = True
                    kyc_status.aadhaar_verified_at = datetime.utcnow()
                
                verification_results.append({
                    "document_type": "AADHAAR",
                    "verified": result['verified']
                })
    
    # Update overall status
    kyc_status.update_overall_status()
    
    # Calculate risk score
    risk_score, risk_factors = kyc_verification_service.calculate_risk_score(profile, kyc_status)
    kyc_status.risk_score = risk_score
    kyc_status.risk_factors = risk_factors
    
    # Set transaction limits
    limits = kyc_verification_service.set_transaction_limits(kyc_status)
    kyc_status.daily_transaction_limit = limits['daily_limit']
    kyc_status.monthly_transaction_limit = limits['monthly_limit']
    
    db.commit()
    
    return {
        "success": True,
        "message": "KYC verification process initiated",
        "overall_status": kyc_status.overall_status.value,
        "verification_results": verification_results,
        "risk_score": risk_score,
        "transaction_limits": limits
    }