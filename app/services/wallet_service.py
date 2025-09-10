"""
Wallet management service for AI Finance Agency
Handles wallet operations, balance management, and transaction limits
"""

import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, Tuple, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc

from database.models import (
    User, Wallet, Transaction, PaymentMethod, KYCStatus,
    TransactionType, TransactionCategory, TransactionStatus,
    PaymentGateway
)


class WalletService:
    """
    Service for wallet management and operations
    Handles balance updates, transaction limits, and wallet status
    """
    
    # Minimum and maximum transaction amounts
    MIN_DEPOSIT = Decimal('100.00')  # ₹100
    MAX_DEPOSIT = Decimal('1000000.00')  # ₹10,00,000
    MIN_WITHDRAWAL = Decimal('100.00')  # ₹100
    
    # Default transaction limits (updated based on KYC)
    DEFAULT_DAILY_LIMIT = Decimal('50000.00')  # ₹50,000
    DEFAULT_MONTHLY_LIMIT = Decimal('200000.00')  # ₹2,00,000
    
    def __init__(self):
        """Initialize wallet service"""
        pass
    
    def get_or_create_wallet(self, db: Session, user_id: uuid.UUID) -> Wallet:
        """
        Get existing wallet or create new one for user
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Wallet instance
        """
        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
        
        if not wallet:
            # Get user's KYC status for setting limits
            kyc_status = db.query(KYCStatus).filter(KYCStatus.user_id == user_id).first()
            
            # Set limits based on KYC level
            daily_limit, monthly_limit = self._get_kyc_based_limits(kyc_status)
            
            wallet = Wallet(
                user_id=user_id,
                daily_limit=daily_limit,
                monthly_limit=monthly_limit,
                daily_reset_at=datetime.utcnow(),
                monthly_reset_at=datetime.utcnow()
            )
            
            db.add(wallet)
            db.commit()
            db.refresh(wallet)
        
        return wallet
    
    def get_wallet_balance(self, db: Session, user_id: uuid.UUID) -> Dict[str, Any]:
        """
        Get wallet balance and details
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Dictionary with wallet details
        """
        wallet = self.get_or_create_wallet(db, user_id)
        
        # Check if daily/monthly limits need reset
        self._check_and_reset_limits(db, wallet)
        
        # Get recent transactions
        recent_transactions = db.query(Transaction).filter(
            Transaction.wallet_id == wallet.id
        ).order_by(desc(Transaction.created_at)).limit(5).all()
        
        return {
            'wallet_id': str(wallet.id),
            'balance': float(wallet.balance),
            'locked_balance': float(wallet.locked_balance),
            'available_balance': float(wallet.available_balance),
            'currency': wallet.currency,
            'daily_limit': float(wallet.daily_limit) if wallet.daily_limit else None,
            'monthly_limit': float(wallet.monthly_limit) if wallet.monthly_limit else None,
            'daily_spent': float(wallet.daily_spent),
            'monthly_spent': float(wallet.monthly_spent),
            'daily_remaining': float(wallet.daily_remaining_limit) if wallet.daily_remaining_limit else None,
            'monthly_remaining': float(wallet.monthly_remaining_limit) if wallet.monthly_remaining_limit else None,
            'is_active': wallet.is_active,
            'is_frozen': wallet.is_frozen,
            'frozen_reason': wallet.frozen_reason,
            'recent_transactions': [
                {
                    'id': str(txn.id),
                    'type': txn.type.value,
                    'category': txn.category.value,
                    'amount': float(txn.amount),
                    'status': txn.status.value,
                    'description': txn.description,
                    'created_at': txn.created_at.isoformat()
                } for txn in recent_transactions
            ]
        }
    
    def can_transact(
        self, 
        db: Session, 
        user_id: uuid.UUID, 
        amount: Decimal,
        transaction_type: TransactionType = TransactionType.DEBIT
    ) -> Tuple[bool, Optional[str]]:
        """
        Check if user can perform transaction
        
        Args:
            db: Database session
            user_id: User ID
            amount: Transaction amount
            transaction_type: Type of transaction
            
        Returns:
            Tuple of (can_transact, error_message)
        """
        wallet = self.get_or_create_wallet(db, user_id)
        
        # Check wallet status
        can_transact, error = wallet.can_transact(amount)
        if not can_transact:
            return False, error
        
        # For debit transactions, check additional constraints
        if transaction_type == TransactionType.DEBIT:
            # Check minimum/maximum limits
            if amount < self.MIN_WITHDRAWAL:
                return False, f"Minimum withdrawal amount is ₹{self.MIN_WITHDRAWAL}"
            
            # Check daily/monthly spending limits
            self._check_and_reset_limits(db, wallet)
            
            if wallet.daily_limit and (wallet.daily_spent + amount) > wallet.daily_limit:
                return False, f"Daily transaction limit of ₹{wallet.daily_limit} exceeded"
            
            if wallet.monthly_limit and (wallet.monthly_spent + amount) > wallet.monthly_limit:
                return False, f"Monthly transaction limit of ₹{wallet.monthly_limit} exceeded"
        
        # For credit transactions, check deposit limits
        elif transaction_type == TransactionType.CREDIT:
            if amount < self.MIN_DEPOSIT:
                return False, f"Minimum deposit amount is ₹{self.MIN_DEPOSIT}"
            
            if amount > self.MAX_DEPOSIT:
                return False, f"Maximum deposit amount is ₹{self.MAX_DEPOSIT}"
        
        return True, None
    
    def lock_amount(
        self, 
        db: Session, 
        user_id: uuid.UUID, 
        amount: Decimal,
        reference_id: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Lock amount in wallet for pending transaction
        
        Args:
            db: Database session
            user_id: User ID
            amount: Amount to lock
            reference_id: Reference for tracking
            
        Returns:
            Tuple of (success, error_message)
        """
        wallet = self.get_or_create_wallet(db, user_id)
        
        # Check if amount can be locked
        can_transact, error = self.can_transact(db, user_id, amount, TransactionType.DEBIT)
        if not can_transact:
            return False, error
        
        # Lock the amount
        success = wallet.lock_amount(amount)
        if not success:
            return False, "Unable to lock amount"
        
        db.commit()
        return True, None
    
    def unlock_amount(
        self, 
        db: Session, 
        user_id: uuid.UUID, 
        amount: Decimal
    ) -> bool:
        """
        Unlock amount from wallet
        
        Args:
            db: Database session
            user_id: User ID
            amount: Amount to unlock
            
        Returns:
            Success status
        """
        wallet = self.get_or_create_wallet(db, user_id)
        success = wallet.unlock_amount(amount)
        
        if success:
            db.commit()
        
        return success
    
    def credit_wallet(
        self,
        db: Session,
        user_id: uuid.UUID,
        amount: Decimal,
        transaction_id: str,
        category: TransactionCategory,
        description: str,
        payment_method_id: Optional[uuid.UUID] = None,
        gateway: Optional[PaymentGateway] = None,
        gateway_transaction_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, Optional[str], Optional[Transaction]]:
        """
        Credit amount to wallet
        
        Args:
            db: Database session
            user_id: User ID
            amount: Amount to credit
            transaction_id: Unique transaction ID
            category: Transaction category
            description: Transaction description
            payment_method_id: Payment method used
            gateway: Payment gateway
            gateway_transaction_id: Gateway transaction ID
            metadata: Additional metadata
            
        Returns:
            Tuple of (success, error_message, transaction)
        """
        wallet = self.get_or_create_wallet(db, user_id)
        
        # Validate amount
        can_transact, error = self.can_transact(db, user_id, amount, TransactionType.CREDIT)
        if not can_transact:
            return False, error, None
        
        # Record balance before transaction
        balance_before = wallet.balance
        
        # Credit the wallet
        success = wallet.credit(amount)
        if not success:
            return False, "Failed to credit wallet", None
        
        # Create transaction record
        transaction = Transaction(
            user_id=user_id,
            wallet_id=wallet.id,
            transaction_id=transaction_id,
            type=TransactionType.CREDIT,
            category=category,
            amount=amount,
            net_amount=amount,
            payment_method_id=payment_method_id,
            gateway=gateway,
            gateway_transaction_id=gateway_transaction_id,
            status=TransactionStatus.SUCCESS,
            description=description,
            balance_before=balance_before,
            balance_after=wallet.balance,
            metadata=metadata or {},
            completed_at=datetime.utcnow()
        )
        
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        return True, None, transaction
    
    def debit_wallet(
        self,
        db: Session,
        user_id: uuid.UUID,
        amount: Decimal,
        transaction_id: str,
        category: TransactionCategory,
        description: str,
        payment_method_id: Optional[uuid.UUID] = None,
        gateway: Optional[PaymentGateway] = None,
        gateway_transaction_id: Optional[str] = None,
        fees: Optional[Dict[str, Decimal]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, Optional[str], Optional[Transaction]]:
        """
        Debit amount from wallet
        
        Args:
            db: Database session
            user_id: User ID
            amount: Amount to debit
            transaction_id: Unique transaction ID
            category: Transaction category
            description: Transaction description
            payment_method_id: Payment method used
            gateway: Payment gateway
            gateway_transaction_id: Gateway transaction ID
            fees: Dictionary of fees (gateway_fee, platform_fee, etc.)
            metadata: Additional metadata
            
        Returns:
            Tuple of (success, error_message, transaction)
        """
        wallet = self.get_or_create_wallet(db, user_id)
        
        # Validate amount
        can_transact, error = self.can_transact(db, user_id, amount, TransactionType.DEBIT)
        if not can_transact:
            return False, error, None
        
        # Process fees
        fees = fees or {}
        gateway_fee = fees.get('gateway_fee', Decimal('0.00'))
        platform_fee = fees.get('platform_fee', Decimal('0.00'))
        gst_amount = fees.get('gst_amount', Decimal('0.00'))
        tds_amount = fees.get('tds_amount', Decimal('0.00'))
        
        total_amount = amount + gateway_fee + platform_fee + gst_amount + tds_amount
        net_amount = amount - gateway_fee - platform_fee - gst_amount - tds_amount
        
        # Check if total amount can be debited
        if total_amount > wallet.available_balance:
            return False, "Insufficient balance including fees", None
        
        # Record balance before transaction
        balance_before = wallet.balance
        
        # Debit the wallet
        success = wallet.debit(total_amount)
        if not success:
            return False, "Failed to debit wallet", None
        
        # Update spending limits
        self._update_spending_limits(db, wallet, amount)
        
        # Create transaction record
        transaction = Transaction(
            user_id=user_id,
            wallet_id=wallet.id,
            transaction_id=transaction_id,
            type=TransactionType.DEBIT,
            category=category,
            amount=amount,
            gateway_fee=gateway_fee,
            platform_fee=platform_fee,
            gst_amount=gst_amount,
            tds_amount=tds_amount,
            net_amount=net_amount,
            payment_method_id=payment_method_id,
            gateway=gateway,
            gateway_transaction_id=gateway_transaction_id,
            status=TransactionStatus.SUCCESS,
            description=description,
            balance_before=balance_before,
            balance_after=wallet.balance,
            metadata=metadata or {},
            completed_at=datetime.utcnow()
        )
        
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        
        return True, None, transaction
    
    def get_transaction_history(
        self,
        db: Session,
        user_id: uuid.UUID,
        page: int = 1,
        limit: int = 20,
        transaction_type: Optional[TransactionType] = None,
        category: Optional[TransactionCategory] = None,
        status: Optional[TransactionStatus] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Get paginated transaction history
        
        Args:
            db: Database session
            user_id: User ID
            page: Page number (1-based)
            limit: Items per page
            transaction_type: Filter by transaction type
            category: Filter by category
            status: Filter by status
            start_date: Filter from date
            end_date: Filter to date
            
        Returns:
            Dictionary with transactions and pagination info
        """
        wallet = self.get_or_create_wallet(db, user_id)
        
        # Build query
        query = db.query(Transaction).filter(Transaction.wallet_id == wallet.id)
        
        # Apply filters
        if transaction_type:
            query = query.filter(Transaction.type == transaction_type)
        
        if category:
            query = query.filter(Transaction.category == category)
        
        if status:
            query = query.filter(Transaction.status == status)
        
        if start_date:
            query = query.filter(Transaction.created_at >= start_date)
        
        if end_date:
            query = query.filter(Transaction.created_at <= end_date)
        
        # Get total count
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * limit
        transactions = query.order_by(desc(Transaction.created_at)).offset(offset).limit(limit).all()
        
        # Calculate pagination info
        total_pages = (total_count + limit - 1) // limit
        has_next = page < total_pages
        has_prev = page > 1
        
        return {
            'transactions': [
                {
                    'id': str(txn.id),
                    'transaction_id': txn.transaction_id,
                    'type': txn.type.value,
                    'category': txn.category.value,
                    'amount': float(txn.amount),
                    'net_amount': float(txn.net_amount),
                    'currency': txn.currency,
                    'status': txn.status.value,
                    'description': txn.description,
                    'gateway': txn.gateway.value if txn.gateway else None,
                    'gateway_transaction_id': txn.gateway_transaction_id,
                    'balance_before': float(txn.balance_before) if txn.balance_before else None,
                    'balance_after': float(txn.balance_after) if txn.balance_after else None,
                    'fees': {
                        'gateway_fee': float(txn.gateway_fee),
                        'platform_fee': float(txn.platform_fee),
                        'gst_amount': float(txn.gst_amount),
                        'tds_amount': float(txn.tds_amount)
                    } if any([txn.gateway_fee, txn.platform_fee, txn.gst_amount, txn.tds_amount]) else None,
                    'created_at': txn.created_at.isoformat(),
                    'completed_at': txn.completed_at.isoformat() if txn.completed_at else None
                } for txn in transactions
            ],
            'pagination': {
                'page': page,
                'limit': limit,
                'total_count': total_count,
                'total_pages': total_pages,
                'has_next': has_next,
                'has_prev': has_prev
            }
        }
    
    def freeze_wallet(
        self,
        db: Session,
        user_id: uuid.UUID,
        reason: str,
        frozen_by_user_id: uuid.UUID
    ) -> bool:
        """
        Freeze user wallet
        
        Args:
            db: Database session
            user_id: User ID
            reason: Reason for freezing
            frozen_by_user_id: ID of user who froze the wallet
            
        Returns:
            Success status
        """
        wallet = self.get_or_create_wallet(db, user_id)
        wallet.freeze_wallet(reason, frozen_by_user_id)
        
        db.commit()
        return True
    
    def unfreeze_wallet(self, db: Session, user_id: uuid.UUID) -> bool:
        """
        Unfreeze user wallet
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            Success status
        """
        wallet = self.get_or_create_wallet(db, user_id)
        wallet.unfreeze_wallet()
        
        db.commit()
        return True
    
    def update_kyc_limits(
        self,
        db: Session,
        user_id: uuid.UUID,
        kyc_status: Optional[KYCStatus] = None
    ) -> bool:
        """
        Update wallet limits based on KYC status
        
        Args:
            db: Database session
            user_id: User ID
            kyc_status: KYC status (fetched if not provided)
            
        Returns:
            Success status
        """
        wallet = self.get_or_create_wallet(db, user_id)
        
        if not kyc_status:
            kyc_status = db.query(KYCStatus).filter(KYCStatus.user_id == user_id).first()
        
        daily_limit, monthly_limit = self._get_kyc_based_limits(kyc_status)
        
        wallet.daily_limit = daily_limit
        wallet.monthly_limit = monthly_limit
        
        db.commit()
        return True
    
    def _get_kyc_based_limits(self, kyc_status: Optional[KYCStatus]) -> Tuple[Decimal, Decimal]:
        """
        Get transaction limits based on KYC status
        
        Args:
            kyc_status: KYC status
            
        Returns:
            Tuple of (daily_limit, monthly_limit)
        """
        if not kyc_status:
            # No KYC - lowest limits
            return Decimal('10000.00'), Decimal('50000.00')
        
        if kyc_status.overall_status.value == 'VERIFIED':
            if kyc_status.risk_score <= 20:
                # Low risk - highest limits
                return Decimal('1000000.00'), Decimal('10000000.00')
            elif kyc_status.risk_score <= 50:
                # Medium risk - moderate limits
                return Decimal('500000.00'), Decimal('5000000.00')
            else:
                # High risk - lower limits
                return Decimal('100000.00'), Decimal('1000000.00')
        elif kyc_status.overall_status.value == 'UNDER_REVIEW':
            # Under review - restricted limits
            return Decimal('25000.00'), Decimal('100000.00')
        else:
            # Pending or rejected - lowest limits
            return Decimal('10000.00'), Decimal('50000.00')
    
    def _check_and_reset_limits(self, db: Session, wallet: Wallet):
        """
        Check and reset daily/monthly limits if needed
        
        Args:
            db: Database session
            wallet: Wallet instance
        """
        now = datetime.utcnow()
        
        # Check daily reset (reset at midnight)
        if wallet.daily_reset_at:
            if now.date() > wallet.daily_reset_at.date():
                wallet.reset_daily_limits()
        else:
            wallet.daily_reset_at = now
        
        # Check monthly reset (reset on 1st of month)
        if wallet.monthly_reset_at:
            if now.month != wallet.monthly_reset_at.month or now.year != wallet.monthly_reset_at.year:
                wallet.reset_monthly_limits()
        else:
            wallet.monthly_reset_at = now
        
        db.commit()
    
    def _update_spending_limits(self, db: Session, wallet: Wallet, amount: Decimal):
        """
        Update daily and monthly spending amounts
        
        Args:
            db: Database session
            wallet: Wallet instance
            amount: Transaction amount
        """
        wallet.daily_spent += amount
        wallet.monthly_spent += amount
        db.commit()


# Singleton instance
wallet_service = WalletService()