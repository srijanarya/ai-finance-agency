"""
Transaction Processing Service for AI Finance Agency
Handles end-to-end transaction processing, payment flows, and state management
"""

import uuid
import secrets
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from database.models import (
    User, Wallet, Transaction, PaymentMethod, PaymentWebhook,
    TransactionType, TransactionCategory, TransactionStatus,
    PaymentGateway, PaymentMethodType
)
from app.services.wallet_service import wallet_service
from app.services.payment_gateway_service import payment_gateway_service


class TransactionService:
    """
    Service for processing transactions and managing payment flows
    Coordinates between wallet, payment gateway, and database operations
    """
    
    def __init__(self):
        """Initialize transaction service"""
        pass
    
    def initiate_deposit(
        self,
        db: Session,
        user_id: uuid.UUID,
        amount: Decimal,
        payment_method_id: Optional[uuid.UUID] = None,
        gateway: Optional[PaymentGateway] = None,
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Initiate deposit transaction
        
        Args:
            db: Database session
            user_id: User ID
            amount: Deposit amount
            payment_method_id: Payment method to use
            gateway: Payment gateway to use
            description: Transaction description
            metadata: Additional metadata
            
        Returns:
            Transaction initiation response
        """
        try:
            # Validate user and get wallet
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return {
                    "success": False,
                    "error": "User not found",
                    "error_code": "USER_NOT_FOUND"
                }
            
            wallet = wallet_service.get_or_create_wallet(db, user_id)
            
            # Validate transaction amount
            can_transact, error = wallet_service.can_transact(
                db, user_id, amount, TransactionType.CREDIT
            )
            if not can_transact:
                return {
                    "success": False,
                    "error": error,
                    "error_code": "TRANSACTION_NOT_ALLOWED"
                }
            
            # Get payment method if specified
            payment_method = None
            if payment_method_id:
                payment_method = db.query(PaymentMethod).filter(
                    and_(
                        PaymentMethod.id == payment_method_id,
                        PaymentMethod.user_id == user_id,
                        PaymentMethod.is_active == True
                    )
                ).first()
                
                if not payment_method:
                    return {
                        "success": False,
                        "error": "Payment method not found or inactive",
                        "error_code": "PAYMENT_METHOD_NOT_FOUND"
                    }
            
            # Generate transaction ID
            transaction_id = f"dep_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{secrets.token_hex(4)}"
            
            # Create pending transaction
            transaction = Transaction(
                user_id=user_id,
                wallet_id=wallet.id,
                transaction_id=transaction_id,
                type=TransactionType.CREDIT,
                category=TransactionCategory.DEPOSIT,
                amount=amount,
                net_amount=amount,
                currency="INR",
                payment_method_id=payment_method_id,
                gateway=gateway or payment_gateway_service.default_gateway,
                status=TransactionStatus.PENDING,
                description=description or f"Wallet deposit of ₹{amount}",
                metadata=metadata or {},
                balance_before=wallet.balance
            )
            
            db.add(transaction)
            db.commit()
            db.refresh(transaction)
            
            # Create payment gateway order
            gateway_response = payment_gateway_service.create_order(
                amount=amount,
                currency="INR",
                customer_id=str(user_id),
                order_id=transaction_id,
                description=transaction.description,
                gateway=gateway,
                metadata={
                    "transaction_id": str(transaction.id),
                    "user_id": str(user_id),
                    "wallet_id": str(wallet.id),
                    **(metadata or {})
                }
            )
            
            if not gateway_response.get("success"):
                # Mark transaction as failed
                transaction.mark_failed(
                    gateway_response.get("error", "Gateway order creation failed"),
                    gateway_response.get("error_code", "GATEWAY_ERROR")
                )
                db.commit()
                
                return {
                    "success": False,
                    "error": gateway_response.get("error"),
                    "error_code": gateway_response.get("error_code", "GATEWAY_ERROR"),
                    "transaction_id": transaction_id
                }
            
            # Update transaction with gateway details
            transaction.gateway_order_id = gateway_response.get("order_id")
            transaction.mark_processing()
            db.commit()
            
            return {
                "success": True,
                "transaction_id": transaction_id,
                "order_id": gateway_response.get("order_id"),
                "amount": float(amount),
                "currency": "INR",
                "gateway": str(gateway or payment_gateway_service.default_gateway.value),
                "payment_url": gateway_response.get("checkout_url"),
                "expires_at": (datetime.utcnow() + timedelta(minutes=30)).isoformat(),
                "metadata": {
                    "key": gateway_response.get("key"),
                    "order_details": gateway_response.get("raw_response")
                }
            }
            
        except Exception as e:
            db.rollback()
            return {
                "success": False,
                "error": f"Transaction initiation failed: {str(e)}",
                "error_code": "INTERNAL_ERROR"
            }
    
    def confirm_deposit(
        self,
        db: Session,
        transaction_id: str,
        gateway_payment_id: str,
        gateway_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Confirm deposit transaction after gateway payment
        
        Args:
            db: Database session
            transaction_id: Internal transaction ID
            gateway_payment_id: Gateway payment ID
            gateway_data: Additional gateway data
            
        Returns:
            Confirmation response
        """
        try:
            # Get transaction
            transaction = db.query(Transaction).filter(
                Transaction.transaction_id == transaction_id
            ).first()
            
            if not transaction:
                return {
                    "success": False,
                    "error": "Transaction not found",
                    "error_code": "TRANSACTION_NOT_FOUND"
                }
            
            if transaction.status != TransactionStatus.PROCESSING:
                return {
                    "success": False,
                    "error": f"Transaction is in {transaction.status.value} state",
                    "error_code": "INVALID_TRANSACTION_STATE"
                }
            
            # Verify payment with gateway
            gateway_response = payment_gateway_service.get_payment_status(
                payment_id=gateway_payment_id,
                gateway=transaction.gateway
            )
            
            if not gateway_response.get("success"):
                transaction.mark_failed(
                    f"Gateway verification failed: {gateway_response.get('error')}",
                    gateway_response.get("error_code", "GATEWAY_VERIFICATION_FAILED")
                )
                db.commit()
                
                return {
                    "success": False,
                    "error": gateway_response.get("error"),
                    "error_code": gateway_response.get("error_code"),
                    "transaction_id": transaction_id
                }
            
            # Check if payment is successful
            payment_status = gateway_response.get("status")
            if payment_status not in ["captured", "authorized", "success"]:
                transaction.mark_failed(
                    f"Payment failed with status: {payment_status}",
                    "PAYMENT_FAILED"
                )
                db.commit()
                
                return {
                    "success": False,
                    "error": f"Payment failed with status: {payment_status}",
                    "error_code": "PAYMENT_FAILED",
                    "transaction_id": transaction_id
                }
            
            # Credit wallet
            success, error, _ = wallet_service.credit_wallet(
                db=db,
                user_id=transaction.user_id,
                amount=transaction.amount,
                transaction_id=f"{transaction_id}_credit",
                category=TransactionCategory.DEPOSIT,
                description=f"Deposit confirmation for {transaction_id}",
                gateway_transaction_id=gateway_payment_id
            )
            
            if not success:
                transaction.mark_failed(f"Wallet credit failed: {error}", "WALLET_CREDIT_FAILED")
                db.commit()
                
                return {
                    "success": False,
                    "error": error,
                    "error_code": "WALLET_CREDIT_FAILED",
                    "transaction_id": transaction_id
                }
            
            # Update transaction
            transaction.gateway_payment_id = gateway_payment_id
            transaction.mark_success(gateway_payment_id)
            transaction.balance_after = transaction.wallet.balance
            
            # Update metadata with gateway data
            if gateway_data:
                transaction.metadata.update(gateway_data)
            
            db.commit()
            
            return {
                "success": True,
                "transaction_id": transaction_id,
                "gateway_payment_id": gateway_payment_id,
                "amount": float(transaction.amount),
                "new_balance": float(transaction.balance_after),
                "status": "SUCCESS",
                "completed_at": transaction.completed_at.isoformat()
            }
            
        except Exception as e:
            db.rollback()
            return {
                "success": False,
                "error": f"Deposit confirmation failed: {str(e)}",
                "error_code": "INTERNAL_ERROR"
            }
    
    def initiate_withdrawal(
        self,
        db: Session,
        user_id: uuid.UUID,
        amount: Decimal,
        bank_account_id: uuid.UUID,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Initiate withdrawal request
        
        Args:
            db: Database session
            user_id: User ID
            amount: Withdrawal amount
            bank_account_id: Bank account for withdrawal
            description: Withdrawal description
            
        Returns:
            Withdrawal initiation response
        """
        try:
            # Validate user and wallet
            wallet = wallet_service.get_or_create_wallet(db, user_id)
            
            # Check if withdrawal is possible
            can_transact, error = wallet_service.can_transact(
                db, user_id, amount, TransactionType.DEBIT
            )
            if not can_transact:
                return {
                    "success": False,
                    "error": error,
                    "error_code": "WITHDRAWAL_NOT_ALLOWED"
                }
            
            # Get bank account
            bank_account = db.query(PaymentMethod).filter(
                and_(
                    PaymentMethod.id == bank_account_id,
                    PaymentMethod.user_id == user_id,
                    PaymentMethod.method_type == PaymentMethodType.BANK_TRANSFER,
                    PaymentMethod.is_active == True
                )
            ).first()
            
            if not bank_account:
                return {
                    "success": False,
                    "error": "Bank account not found or invalid",
                    "error_code": "BANK_ACCOUNT_NOT_FOUND"
                }
            
            # Lock amount in wallet
            success, error = wallet_service.lock_amount(
                db, user_id, amount, f"withdrawal_{datetime.utcnow().isoformat()}"
            )
            if not success:
                return {
                    "success": False,
                    "error": error,
                    "error_code": "AMOUNT_LOCK_FAILED"
                }
            
            # Generate transaction ID
            transaction_id = f"wth_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{secrets.token_hex(4)}"
            
            # Create withdrawal transaction
            transaction = Transaction(
                user_id=user_id,
                wallet_id=wallet.id,
                transaction_id=transaction_id,
                type=TransactionType.DEBIT,
                category=TransactionCategory.WITHDRAWAL,
                amount=amount,
                net_amount=amount,  # Will be updated after fees calculation
                currency="INR",
                payment_method_id=bank_account_id,
                status=TransactionStatus.PENDING,
                description=description or f"Withdrawal of ₹{amount} to bank account",
                balance_before=wallet.balance
            )
            
            db.add(transaction)
            db.commit()
            db.refresh(transaction)
            
            return {
                "success": True,
                "transaction_id": transaction_id,
                "amount": float(amount),
                "status": "PENDING_APPROVAL",
                "bank_account": {
                    "id": str(bank_account.id),
                    "display_name": bank_account.display_name,
                    "account_number": bank_account.account_number_masked,
                    "bank_name": bank_account.bank_name
                },
                "estimated_processing_time": "1-2 business days",
                "locked_balance": float(wallet.locked_balance)
            }
            
        except Exception as e:
            db.rollback()
            return {
                "success": False,
                "error": f"Withdrawal initiation failed: {str(e)}",
                "error_code": "INTERNAL_ERROR"
            }
    
    def process_refund(
        self,
        db: Session,
        original_transaction_id: str,
        refund_amount: Optional[Decimal] = None,
        reason: Optional[str] = None,
        initiated_by: Optional[uuid.UUID] = None
    ) -> Dict[str, Any]:
        """
        Process refund for a transaction
        
        Args:
            db: Database session
            original_transaction_id: Original transaction ID to refund
            refund_amount: Amount to refund (full refund if None)
            reason: Refund reason
            initiated_by: User who initiated refund
            
        Returns:
            Refund processing response
        """
        try:
            # Get original transaction
            original_txn = db.query(Transaction).filter(
                Transaction.transaction_id == original_transaction_id
            ).first()
            
            if not original_txn:
                return {
                    "success": False,
                    "error": "Original transaction not found",
                    "error_code": "TRANSACTION_NOT_FOUND"
                }
            
            if original_txn.type != TransactionType.CREDIT:
                return {
                    "success": False,
                    "error": "Only credit transactions can be refunded",
                    "error_code": "INVALID_TRANSACTION_TYPE"
                }
            
            if original_txn.status != TransactionStatus.SUCCESS:
                return {
                    "success": False,
                    "error": "Only successful transactions can be refunded",
                    "error_code": "INVALID_TRANSACTION_STATUS"
                }
            
            # Check if already refunded
            existing_refund = db.query(Transaction).filter(
                and_(
                    Transaction.parent_transaction_id == original_txn.id,
                    Transaction.type == TransactionType.REFUND,
                    Transaction.status == TransactionStatus.SUCCESS
                )
            ).first()
            
            if existing_refund:
                return {
                    "success": False,
                    "error": "Transaction already refunded",
                    "error_code": "ALREADY_REFUNDED"
                }
            
            # Calculate refund amount
            refund_amount = refund_amount or original_txn.amount
            if refund_amount > original_txn.amount:
                return {
                    "success": False,
                    "error": "Refund amount cannot exceed original amount",
                    "error_code": "INVALID_REFUND_AMOUNT"
                }
            
            # Generate refund transaction ID
            refund_transaction_id = f"rfd_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{secrets.token_hex(4)}"
            
            # Process gateway refund if applicable
            gateway_refund_response = None
            if original_txn.gateway_payment_id and original_txn.gateway:
                gateway_refund_response = payment_gateway_service.refund_payment(
                    payment_id=original_txn.gateway_payment_id,
                    amount=refund_amount,
                    reason=reason,
                    gateway=original_txn.gateway
                )
                
                if not gateway_refund_response.get("success"):
                    return {
                        "success": False,
                        "error": f"Gateway refund failed: {gateway_refund_response.get('error')}",
                        "error_code": "GATEWAY_REFUND_FAILED"
                    }
            
            # Debit wallet for refund
            wallet = wallet_service.get_or_create_wallet(db, original_txn.user_id)
            
            success, error, refund_transaction = wallet_service.debit_wallet(
                db=db,
                user_id=original_txn.user_id,
                amount=refund_amount,
                transaction_id=refund_transaction_id,
                category=TransactionCategory.REFUND,
                description=f"Refund for transaction {original_transaction_id}: {reason or 'No reason provided'}",
                gateway_transaction_id=gateway_refund_response.get("refund_id") if gateway_refund_response else None,
                metadata={
                    "original_transaction_id": original_transaction_id,
                    "refund_reason": reason,
                    "initiated_by": str(initiated_by) if initiated_by else None,
                    "gateway_refund_data": gateway_refund_response
                }
            )
            
            if not success:
                return {
                    "success": False,
                    "error": error,
                    "error_code": "WALLET_DEBIT_FAILED"
                }
            
            # Update refund transaction to link with original
            refund_transaction.parent_transaction_id = original_txn.id
            refund_transaction.type = TransactionType.REFUND
            db.commit()
            
            return {
                "success": True,
                "refund_transaction_id": refund_transaction_id,
                "original_transaction_id": original_transaction_id,
                "refund_amount": float(refund_amount),
                "reason": reason,
                "gateway_refund_id": gateway_refund_response.get("refund_id") if gateway_refund_response else None,
                "new_balance": float(wallet.balance),
                "processed_at": refund_transaction.completed_at.isoformat()
            }
            
        except Exception as e:
            db.rollback()
            return {
                "success": False,
                "error": f"Refund processing failed: {str(e)}",
                "error_code": "INTERNAL_ERROR"
            }
    
    def get_transaction_details(
        self,
        db: Session,
        transaction_id: str,
        user_id: Optional[uuid.UUID] = None
    ) -> Dict[str, Any]:
        """
        Get detailed transaction information
        
        Args:
            db: Database session
            transaction_id: Transaction ID
            user_id: User ID for authorization (optional)
            
        Returns:
            Transaction details
        """
        query = db.query(Transaction).filter(Transaction.transaction_id == transaction_id)
        
        if user_id:
            query = query.filter(Transaction.user_id == user_id)
        
        transaction = query.first()
        
        if not transaction:
            return {
                "success": False,
                "error": "Transaction not found",
                "error_code": "TRANSACTION_NOT_FOUND"
            }
        
        # Get related transactions (refunds, etc.)
        related_transactions = db.query(Transaction).filter(
            or_(
                Transaction.parent_transaction_id == transaction.id,
                Transaction.id == transaction.parent_transaction_id
            )
        ).all()
        
        return {
            "success": True,
            "transaction": {
                "id": str(transaction.id),
                "transaction_id": transaction.transaction_id,
                "type": transaction.type.value,
                "category": transaction.category.value,
                "amount": float(transaction.amount),
                "net_amount": float(transaction.net_amount),
                "currency": transaction.currency,
                "status": transaction.status.value,
                "description": transaction.description,
                "gateway": transaction.gateway.value if transaction.gateway else None,
                "gateway_transaction_id": transaction.gateway_transaction_id,
                "gateway_payment_id": transaction.gateway_payment_id,
                "gateway_order_id": transaction.gateway_order_id,
                "balance_before": float(transaction.balance_before) if transaction.balance_before else None,
                "balance_after": float(transaction.balance_after) if transaction.balance_after else None,
                "fees": {
                    "gateway_fee": float(transaction.gateway_fee),
                    "platform_fee": float(transaction.platform_fee),
                    "gst_amount": float(transaction.gst_amount),
                    "tds_amount": float(transaction.tds_amount)
                },
                "timestamps": {
                    "initiated_at": transaction.initiated_at.isoformat(),
                    "authorized_at": transaction.authorized_at.isoformat() if transaction.authorized_at else None,
                    "captured_at": transaction.captured_at.isoformat() if transaction.captured_at else None,
                    "completed_at": transaction.completed_at.isoformat() if transaction.completed_at else None,
                    "failed_at": transaction.failed_at.isoformat() if transaction.failed_at else None
                },
                "metadata": transaction.metadata,
                "failure_reason": transaction.failure_reason
            },
            "related_transactions": [
                {
                    "id": str(rtxn.id),
                    "transaction_id": rtxn.transaction_id,
                    "type": rtxn.type.value,
                    "amount": float(rtxn.amount),
                    "status": rtxn.status.value,
                    "created_at": rtxn.created_at.isoformat()
                } for rtxn in related_transactions
            ]
        }


# Singleton instance
transaction_service = TransactionService()