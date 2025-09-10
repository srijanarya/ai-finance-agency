"""
Payment API endpoints for AI Finance Agency
Handles wallet operations, deposits, withdrawals, and transaction management
"""

from datetime import datetime, date
from decimal import Decimal
from typing import List, Optional, Dict, Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends, status, Query, Body, Request
from pydantic import BaseModel, Field, validator
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import authenticate_request
from app.services.wallet_service import wallet_service
from app.services.transaction_service import transaction_service
from app.services.payment_gateway_service import payment_gateway_service
from app.services.payment_security_service import payment_security_service
from app.utils.pci_compliance import pci_secure_endpoint, pci_audit_logger
from database.models import (
    User, PaymentMethod, PaymentGateway, PaymentMethodType,
    TransactionType, TransactionCategory, TransactionStatus
)

router = APIRouter()


# Request/Response Models

class DepositRequest(BaseModel):
    """Deposit initiation request"""
    amount: float = Field(..., gt=0, le=1000000, description="Deposit amount in INR")
    payment_method_id: Optional[str] = Field(None, description="Payment method ID")
    gateway: Optional[str] = Field("mock", description="Payment gateway")
    description: Optional[str] = Field(None, max_length=200, description="Deposit description")

    @validator('gateway')
    def validate_gateway(cls, v):
        if v not in ['razorpay', 'stripe', 'mock']:
            raise ValueError('Invalid gateway')
        return v


class DepositConfirmRequest(BaseModel):
    """Deposit confirmation request"""
    transaction_id: str = Field(..., description="Internal transaction ID")
    gateway_payment_id: str = Field(..., description="Gateway payment ID")
    gateway_data: Optional[Dict[str, Any]] = Field(None, description="Additional gateway data")


class WithdrawalRequest(BaseModel):
    """Withdrawal request"""
    amount: float = Field(..., gt=0, description="Withdrawal amount in INR")
    bank_account_id: str = Field(..., description="Bank account ID for withdrawal")
    description: Optional[str] = Field(None, max_length=200, description="Withdrawal description")


class RefundRequest(BaseModel):
    """Refund request"""
    transaction_id: str = Field(..., description="Original transaction ID")
    amount: Optional[float] = Field(None, gt=0, description="Refund amount (full refund if not specified)")
    reason: Optional[str] = Field(None, max_length=500, description="Refund reason")


class PaymentMethodCreateRequest(BaseModel):
    """Payment method creation request"""
    method_type: str = Field(..., description="Payment method type")
    display_name: str = Field(..., max_length=100, description="Display name")
    
    # Card specific fields
    card_token: Optional[str] = Field(None, description="Card token from gateway")
    card_brand: Optional[str] = Field(None, description="Card brand")
    card_last_four: Optional[str] = Field(None, regex="^[0-9]{4}$", description="Last 4 digits")
    card_expiry: Optional[str] = Field(None, regex="^[0-9]{2}/[0-9]{4}$", description="Card expiry MM/YYYY")
    
    # UPI specific fields
    upi_id: Optional[str] = Field(None, description="UPI ID")
    
    # Bank specific fields
    bank_name: Optional[str] = Field(None, description="Bank name")
    account_number: Optional[str] = Field(None, description="Bank account number")
    ifsc_code: Optional[str] = Field(None, regex="^[A-Z]{4}0[A-Z0-9]{6}$", description="IFSC code")

    @validator('method_type')
    def validate_method_type(cls, v):
        if v not in ['card', 'upi', 'netbanking', 'wallet', 'bank_transfer']:
            raise ValueError('Invalid payment method type')
        return v


class WalletResponse(BaseModel):
    """Wallet details response"""
    wallet_id: str
    balance: float
    locked_balance: float
    available_balance: float
    currency: str = "INR"
    daily_limit: Optional[float]
    monthly_limit: Optional[float]
    daily_spent: float
    monthly_spent: float
    daily_remaining: Optional[float]
    monthly_remaining: Optional[float]
    is_active: bool
    is_frozen: bool
    frozen_reason: Optional[str]
    recent_transactions: List[Dict[str, Any]]

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    """Transaction details response"""
    id: str
    transaction_id: str
    type: str
    category: str
    amount: float
    net_amount: float
    currency: str
    status: str
    description: Optional[str]
    gateway: Optional[str]
    gateway_transaction_id: Optional[str]
    balance_before: Optional[float]
    balance_after: Optional[float]
    fees: Optional[Dict[str, float]]
    created_at: str
    completed_at: Optional[str]

    class Config:
        from_attributes = True


class PaymentMethodResponse(BaseModel):
    """Payment method response"""
    id: str
    method_type: str
    display_name: str
    last_four: Optional[str]
    is_default: bool
    is_verified: bool
    created_at: str

    class Config:
        from_attributes = True


# Wallet Endpoints

@router.get("/wallet", response_model=WalletResponse)
async def get_wallet(
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Get current user's wallet details"""
    try:
        wallet_data = wallet_service.get_wallet_balance(db, current_user.id)
        return WalletResponse(**wallet_data)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get wallet details: {str(e)}"
        )


@router.get("/wallet/transactions")
async def get_wallet_transactions(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    transaction_type: Optional[str] = Query(None, description="Filter by transaction type"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    start_date: Optional[date] = Query(None, description="Start date filter"),
    end_date: Optional[date] = Query(None, description="End date filter"),
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Get paginated transaction history"""
    try:
        # Convert string enums to enum objects
        type_filter = None
        if transaction_type:
            try:
                type_filter = TransactionType(transaction_type)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid transaction type: {transaction_type}"
                )
        
        category_filter = None
        if category:
            try:
                category_filter = TransactionCategory(category)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid category: {category}"
                )
        
        status_filter = None
        if status:
            try:
                status_filter = TransactionStatus(status)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status: {status}"
                )
        
        # Convert dates to datetime
        start_datetime = datetime.combine(start_date, datetime.min.time()) if start_date else None
        end_datetime = datetime.combine(end_date, datetime.max.time()) if end_date else None
        
        result = wallet_service.get_transaction_history(
            db=db,
            user_id=current_user.id,
            page=page,
            limit=limit,
            transaction_type=type_filter,
            category=category_filter,
            status=status_filter,
            start_date=start_datetime,
            end_date=end_datetime
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get transaction history: {str(e)}"
        )


# Deposit Endpoints

@router.post("/deposits/initiate")
@pci_secure_endpoint(require_https=True, rate_limit=5, window_seconds=300)
async def initiate_deposit(
    deposit_request: DepositRequest,
    request: Request,
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Initiate deposit transaction"""
    try:
        # Security validations
        client_ip = request.client.host if request.client else 'unknown'
        
        # Check rate limiting
        if not payment_security_service.check_rate_limit(str(current_user.id), limit=5, window_minutes=5):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many deposit attempts. Please try again later."
            )
        
        # Validate transaction limits
        amount = Decimal(str(deposit_request.amount))
        limit_validation = payment_security_service.validate_transaction_limits(
            db=db, user=current_user, amount=amount, transaction_type='deposit'
        )
        
        if not limit_validation['valid']:
            pci_audit_logger.log_payment_event(
                event_type='deposit_limit_exceeded',
                user_id=str(current_user.id),
                amount=float(amount),
                currency='INR',
                transaction_id='n/a',
                additional_data={'reason': limit_validation['reason']}
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Transaction limit exceeded: {limit_validation['reason']}"
            )
        
        # Detect suspicious activity
        suspicious_indicators = payment_security_service.detect_suspicious_activity(
            db=db, 
            user_id=current_user.id,
            transaction_data={'amount': amount, 'type': 'deposit'}
        )
        
        if suspicious_indicators:
            payment_security_service.log_security_event(
                event_type='suspicious_deposit_attempt',
                user_id=current_user.id,
                ip_address=client_ip,
                details={'indicators': suspicious_indicators, 'amount': float(amount)}
            )
        
        # Convert gateway string to enum
        gateway = PaymentGateway(deposit_request.gateway) if deposit_request.gateway else None
        
        # Convert payment method ID
        payment_method_id = None
        if deposit_request.payment_method_id:
            try:
                payment_method_id = UUID(deposit_request.payment_method_id)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid payment method ID format"
                )
        
        result = transaction_service.initiate_deposit(
            db=db,
            user_id=current_user.id,
            amount=Decimal(str(deposit_request.amount)),
            payment_method_id=payment_method_id,
            gateway=gateway,
            description=deposit_request.description
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error")
            )
        
        # Log successful deposit initiation
        pci_audit_logger.log_payment_event(
            event_type='deposit_initiated',
            user_id=str(current_user.id),
            amount=float(amount),
            currency='INR',
            transaction_id=result.get('transaction_id', 'unknown'),
            additional_data={
                'gateway': deposit_request.gateway,
                'payment_method_id': deposit_request.payment_method_id,
                'client_ip': client_ip
            }
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate deposit: {str(e)}"
        )


@router.post("/deposits/confirm")
async def confirm_deposit(
    confirm_request: DepositConfirmRequest,
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Confirm deposit after gateway payment"""
    try:
        result = transaction_service.confirm_deposit(
            db=db,
            transaction_id=confirm_request.transaction_id,
            gateway_payment_id=confirm_request.gateway_payment_id,
            gateway_data=confirm_request.gateway_data
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error")
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to confirm deposit: {str(e)}"
        )


@router.get("/deposits/{transaction_id}")
async def get_deposit_status(
    transaction_id: str,
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Get deposit transaction status"""
    try:
        result = transaction_service.get_transaction_details(
            db=db,
            transaction_id=transaction_id,
            user_id=current_user.id
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.get("error")
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get deposit status: {str(e)}"
        )


# Withdrawal Endpoints

@router.post("/withdrawals/request")
async def request_withdrawal(
    withdrawal_request: WithdrawalRequest,
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Request withdrawal to bank account"""
    try:
        # Convert bank account ID
        try:
            bank_account_id = UUID(withdrawal_request.bank_account_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid bank account ID format"
            )
        
        result = transaction_service.initiate_withdrawal(
            db=db,
            user_id=current_user.id,
            amount=Decimal(str(withdrawal_request.amount)),
            bank_account_id=bank_account_id,
            description=withdrawal_request.description
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error")
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to request withdrawal: {str(e)}"
        )


@router.get("/withdrawals/{transaction_id}")
async def get_withdrawal_status(
    transaction_id: str,
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Get withdrawal status"""
    try:
        result = transaction_service.get_transaction_details(
            db=db,
            transaction_id=transaction_id,
            user_id=current_user.id
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.get("error")
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get withdrawal status: {str(e)}"
        )


# Payment Method Endpoints

@router.get("/payment-methods", response_model=List[PaymentMethodResponse])
async def get_payment_methods(
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Get user's payment methods"""
    try:
        payment_methods = db.query(PaymentMethod).filter(
            PaymentMethod.user_id == current_user.id,
            PaymentMethod.is_active == True
        ).all()
        
        return [
            PaymentMethodResponse(
                id=str(pm.id),
                method_type=pm.method_type.value,
                display_name=pm.display_name,
                last_four=pm.last_four,
                is_default=pm.is_default,
                is_verified=pm.is_verified,
                created_at=pm.created_at.isoformat()
            ) for pm in payment_methods
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get payment methods: {str(e)}"
        )


@router.post("/payment-methods", response_model=PaymentMethodResponse)
async def create_payment_method(
    pm_request: PaymentMethodCreateRequest,
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Add new payment method"""
    try:
        # Convert method type
        method_type = PaymentMethodType(pm_request.method_type)
        
        # Create payment method
        payment_method = PaymentMethod(
            user_id=current_user.id,
            method_type=method_type,
            display_name=pm_request.display_name,
            last_four=pm_request.card_last_four,
            upi_id=pm_request.upi_id,
            bank_name=pm_request.bank_name,
            # Note: In production, sensitive data should be tokenized/encrypted
            account_number_masked=f"XXXX{pm_request.account_number[-4:]}" if pm_request.account_number else None
        )
        
        # Set as default if it's the first payment method
        existing_count = db.query(PaymentMethod).filter(
            PaymentMethod.user_id == current_user.id,
            PaymentMethod.is_active == True
        ).count()
        
        if existing_count == 0:
            payment_method.is_default = True
        
        db.add(payment_method)
        db.commit()
        db.refresh(payment_method)
        
        return PaymentMethodResponse(
            id=str(payment_method.id),
            method_type=payment_method.method_type.value,
            display_name=payment_method.display_name,
            last_four=payment_method.last_four,
            is_default=payment_method.is_default,
            is_verified=payment_method.is_verified,
            created_at=payment_method.created_at.isoformat()
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment method: {str(e)}"
        )


@router.delete("/payment-methods/{payment_method_id}")
async def delete_payment_method(
    payment_method_id: str,
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Delete payment method"""
    try:
        # Convert ID
        try:
            pm_id = UUID(payment_method_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment method ID format"
            )
        
        payment_method = db.query(PaymentMethod).filter(
            PaymentMethod.id == pm_id,
            PaymentMethod.user_id == current_user.id
        ).first()
        
        if not payment_method:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment method not found"
            )
        
        # Soft delete
        payment_method.is_active = False
        db.commit()
        
        return {"success": True, "message": "Payment method deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete payment method: {str(e)}"
        )


# Refund Endpoints

@router.post("/refunds")
async def request_refund(
    refund_request: RefundRequest,
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Request refund for a transaction"""
    try:
        refund_amount = None
        if refund_request.amount:
            refund_amount = Decimal(str(refund_request.amount))
        
        result = transaction_service.process_refund(
            db=db,
            original_transaction_id=refund_request.transaction_id,
            refund_amount=refund_amount,
            reason=refund_request.reason,
            initiated_by=current_user.id
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error")
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process refund: {str(e)}"
        )


# Transaction Details

@router.get("/transactions/{transaction_id}")
async def get_transaction_details(
    transaction_id: str,
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Get detailed transaction information"""
    try:
        result = transaction_service.get_transaction_details(
            db=db,
            transaction_id=transaction_id,
            user_id=current_user.id
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.get("error")
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get transaction details: {str(e)}"
        )


# Export Transactions

@router.post("/wallet/transactions/export")
async def export_transactions(
    start_date: Optional[date] = Body(None),
    end_date: Optional[date] = Body(None),
    format: str = Body("csv"),
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Export transaction history"""
    try:
        if format not in ["csv", "excel", "pdf"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid export format. Use csv, excel, or pdf"
            )
        
        # Get all transactions for the date range
        start_datetime = datetime.combine(start_date, datetime.min.time()) if start_date else None
        end_datetime = datetime.combine(end_date, datetime.max.time()) if end_date else None
        
        result = wallet_service.get_transaction_history(
            db=db,
            user_id=current_user.id,
            page=1,
            limit=10000,  # Large limit for export
            start_date=start_datetime,
            end_date=end_datetime
        )
        
        # In a real implementation, you would generate the actual file here
        # For now, return the data with export information
        return {
            "success": True,
            "format": format,
            "export_url": f"/api/v1/payments/exports/{current_user.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.{format}",
            "transaction_count": len(result["transactions"]),
            "date_range": {
                "start_date": start_date.isoformat() if start_date else None,
                "end_date": end_date.isoformat() if end_date else None
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export transactions: {str(e)}"
        )