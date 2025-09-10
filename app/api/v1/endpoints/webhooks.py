from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import logging
import json
from datetime import datetime

from app.database.database import get_db
from app.services.payment_gateway_service import PaymentGatewayService
from app.services.transaction_service import TransactionService
from app.services.wallet_service import WalletService
from app.database.models.payment_models import PaymentWebhook, WebhookStatus, Transaction, TransactionStatus, TransactionType
from app.core.security import get_current_user
from app.database.models.user_models import User

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
security = HTTPBearer()
logger = logging.getLogger(__name__)


class WebhookProcessor:
    def __init__(self, db: Session):
        self.db = db
        self.gateway_service = PaymentGatewayService()
        self.transaction_service = TransactionService()
        self.wallet_service = WalletService()

    def create_webhook_record(self, provider: str, event_type: str, payload: Dict[str, Any], 
                            signature: str, request_headers: Dict[str, str]) -> PaymentWebhook:
        webhook = PaymentWebhook(
            provider=provider,
            event_type=event_type,
            payload=payload,
            signature=signature,
            headers=request_headers,
            status=WebhookStatus.PENDING
        )
        self.db.add(webhook)
        self.db.commit()
        self.db.refresh(webhook)
        return webhook

    def process_payment_success(self, webhook: PaymentWebhook, payment_data: Dict[str, Any]):
        try:
            gateway_transaction_id = payment_data.get('id')
            order_id = payment_data.get('order_id')
            amount = float(payment_data.get('amount', 0)) / 100  # Convert from paise to rupees
            
            # Find the transaction
            transaction = self.db.query(Transaction).filter(
                Transaction.gateway_order_id == order_id,
                Transaction.status == TransactionStatus.PENDING
            ).first()
            
            if not transaction:
                logger.warning(f"Transaction not found for order_id: {order_id}")
                return False
            
            # Update transaction
            transaction.gateway_transaction_id = gateway_transaction_id
            transaction.status = TransactionStatus.COMPLETED
            transaction.completed_at = datetime.utcnow()
            transaction.gateway_response = payment_data
            
            # Credit wallet for deposits
            if transaction.type == TransactionType.DEPOSIT:
                self.wallet_service.credit_wallet(
                    db=self.db,
                    user_id=transaction.user_id,
                    amount=transaction.amount,
                    transaction_id=str(transaction.id),
                    category=transaction.category,
                    description=f"Payment successful - {transaction.description}",
                    reference_id=gateway_transaction_id
                )
            
            self.db.commit()
            logger.info(f"Payment success processed for transaction: {transaction.id}")
            return True
            
        except Exception as e:
            logger.error(f"Error processing payment success: {str(e)}")
            self.db.rollback()
            return False

    def process_payment_failed(self, webhook: PaymentWebhook, payment_data: Dict[str, Any]):
        try:
            order_id = payment_data.get('order_id')
            error_reason = payment_data.get('error_description', 'Payment failed')
            
            # Find the transaction
            transaction = self.db.query(Transaction).filter(
                Transaction.gateway_order_id == order_id,
                Transaction.status == TransactionStatus.PENDING
            ).first()
            
            if not transaction:
                logger.warning(f"Transaction not found for order_id: {order_id}")
                return False
            
            # Update transaction
            transaction.status = TransactionStatus.FAILED
            transaction.failure_reason = error_reason
            transaction.completed_at = datetime.utcnow()
            transaction.gateway_response = payment_data
            
            self.db.commit()
            logger.info(f"Payment failure processed for transaction: {transaction.id}")
            return True
            
        except Exception as e:
            logger.error(f"Error processing payment failure: {str(e)}")
            self.db.rollback()
            return False

    def process_refund_processed(self, webhook: PaymentWebhook, refund_data: Dict[str, Any]):
        try:
            payment_id = refund_data.get('payment_id')
            refund_amount = float(refund_data.get('amount', 0)) / 100
            refund_id = refund_data.get('id')
            
            # Find the original transaction
            original_transaction = self.db.query(Transaction).filter(
                Transaction.gateway_transaction_id == payment_id,
                Transaction.status == TransactionStatus.COMPLETED
            ).first()
            
            if not original_transaction:
                logger.warning(f"Original transaction not found for payment_id: {payment_id}")
                return False
            
            # Create refund transaction
            refund_transaction = Transaction(
                user_id=original_transaction.user_id,
                amount=refund_amount,
                type=TransactionType.REFUND,
                category=original_transaction.category,
                status=TransactionStatus.COMPLETED,
                description=f"Refund for {original_transaction.description}",
                gateway_transaction_id=refund_id,
                gateway_order_id=f"refund_{refund_id}",
                gateway_response=refund_data,
                completed_at=datetime.utcnow()
            )
            
            self.db.add(refund_transaction)
            
            # Credit wallet with refund amount
            self.wallet_service.credit_wallet(
                db=self.db,
                user_id=original_transaction.user_id,
                amount=refund_amount,
                transaction_id=str(refund_transaction.id),
                category=original_transaction.category,
                description=f"Refund processed - {original_transaction.description}",
                reference_id=refund_id
            )
            
            self.db.commit()
            logger.info(f"Refund processed for original transaction: {original_transaction.id}")
            return True
            
        except Exception as e:
            logger.error(f"Error processing refund: {str(e)}")
            self.db.rollback()
            return False

    def process_webhook(self, webhook: PaymentWebhook) -> bool:
        try:
            webhook.status = WebhookStatus.PROCESSING
            webhook.processed_at = datetime.utcnow()
            self.db.commit()
            
            event_type = webhook.event_type
            payload = webhook.payload
            
            # Route to appropriate handler based on event type
            if event_type == 'payment.captured':
                success = self.process_payment_success(webhook, payload.get('payment', {}))
            elif event_type == 'payment.failed':
                success = self.process_payment_failed(webhook, payload.get('payment', {}))
            elif event_type == 'refund.processed':
                success = self.process_refund_processed(webhook, payload.get('refund', {}))
            else:
                logger.warning(f"Unhandled webhook event type: {event_type}")
                success = True  # Mark as processed but don't fail
            
            # Update webhook status
            webhook.status = WebhookStatus.PROCESSED if success else WebhookStatus.FAILED
            webhook.error_message = None if success else "Processing failed"
            self.db.commit()
            
            return success
            
        except Exception as e:
            logger.error(f"Error processing webhook {webhook.id}: {str(e)}")
            webhook.status = WebhookStatus.FAILED
            webhook.error_message = str(e)
            self.db.commit()
            return False


async def process_webhook_background(webhook_id: str, db: Session):
    """Background task to process webhook"""
    webhook = db.query(PaymentWebhook).filter(PaymentWebhook.id == webhook_id).first()
    if webhook:
        processor = WebhookProcessor(db)
        processor.process_webhook(webhook)


@router.post("/razorpay")
async def razorpay_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Handle Razorpay webhooks"""
    try:
        # Get raw body and headers
        body = await request.body()
        signature = request.headers.get('X-Razorpay-Signature', '')
        headers = dict(request.headers)
        
        # Parse JSON payload
        try:
            payload = json.loads(body.decode('utf-8'))
        except json.JSONDecodeError:
            logger.error("Invalid JSON payload in Razorpay webhook")
            raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
        # Verify signature
        gateway_service = PaymentGatewayService()
        if not gateway_service.verify_razorpay_signature(body.decode('utf-8'), signature):
            logger.error("Invalid webhook signature from Razorpay")
            raise HTTPException(status_code=401, detail="Invalid signature")
        
        # Extract event info
        event_type = payload.get('event')
        if not event_type:
            logger.error("Missing event type in Razorpay webhook")
            raise HTTPException(status_code=400, detail="Missing event type")
        
        # Create webhook record
        processor = WebhookProcessor(db)
        webhook = processor.create_webhook_record(
            provider='razorpay',
            event_type=event_type,
            payload=payload,
            signature=signature,
            request_headers=headers
        )
        
        # Process webhook in background
        background_tasks.add_task(process_webhook_background, str(webhook.id), db)
        
        return {"status": "received", "webhook_id": str(webhook.id)}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing Razorpay webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhooks"""
    try:
        # Get raw body and headers
        body = await request.body()
        signature = request.headers.get('Stripe-Signature', '')
        headers = dict(request.headers)
        
        # Parse JSON payload
        try:
            payload = json.loads(body.decode('utf-8'))
        except json.JSONDecodeError:
            logger.error("Invalid JSON payload in Stripe webhook")
            raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
        # Verify signature (implement Stripe signature verification)
        gateway_service = PaymentGatewayService()
        if not gateway_service.verify_stripe_signature(body.decode('utf-8'), signature):
            logger.error("Invalid webhook signature from Stripe")
            raise HTTPException(status_code=401, detail="Invalid signature")
        
        # Extract event info
        event_type = payload.get('type')
        if not event_type:
            logger.error("Missing event type in Stripe webhook")
            raise HTTPException(status_code=400, detail="Missing event type")
        
        # Create webhook record
        processor = WebhookProcessor(db)
        webhook = processor.create_webhook_record(
            provider='stripe',
            event_type=event_type,
            payload=payload,
            signature=signature,
            request_headers=headers
        )
        
        # Process webhook in background
        background_tasks.add_task(process_webhook_background, str(webhook.id), db)
        
        return {"status": "received", "webhook_id": str(webhook.id)}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing Stripe webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/mock")
async def mock_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Handle Mock payment gateway webhooks for testing"""
    try:
        # Get raw body and headers
        body = await request.body()
        signature = request.headers.get('X-Mock-Signature', '')
        headers = dict(request.headers)
        
        # Parse JSON payload
        try:
            payload = json.loads(body.decode('utf-8'))
        except json.JSONDecodeError:
            logger.error("Invalid JSON payload in Mock webhook")
            raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
        # For mock gateway, we'll accept any signature or no signature
        # In real implementation, you'd verify the signature
        
        # Extract event info
        event_type = payload.get('event_type')
        if not event_type:
            logger.error("Missing event type in Mock webhook")
            raise HTTPException(status_code=400, detail="Missing event type")
        
        # Create webhook record
        processor = WebhookProcessor(db)
        webhook = processor.create_webhook_record(
            provider='mock',
            event_type=event_type,
            payload=payload,
            signature=signature,
            request_headers=headers
        )
        
        # Process webhook in background
        background_tasks.add_task(process_webhook_background, str(webhook.id), db)
        
        return {"status": "received", "webhook_id": str(webhook.id)}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing Mock webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/status/{webhook_id}")
async def get_webhook_status(
    webhook_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get webhook processing status"""
    try:
        webhook = db.query(PaymentWebhook).filter(PaymentWebhook.id == webhook_id).first()
        if not webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")
        
        return {
            "webhook_id": str(webhook.id),
            "provider": webhook.provider,
            "event_type": webhook.event_type,
            "status": webhook.status.value,
            "created_at": webhook.created_at,
            "processed_at": webhook.processed_at,
            "error_message": webhook.error_message
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting webhook status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/list")
async def list_webhooks(
    skip: int = 0,
    limit: int = 50,
    provider: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List webhook records with filtering"""
    try:
        query = db.query(PaymentWebhook)
        
        if provider:
            query = query.filter(PaymentWebhook.provider == provider)
        
        if status:
            query = query.filter(PaymentWebhook.status == WebhookStatus(status))
        
        webhooks = query.order_by(PaymentWebhook.created_at.desc()).offset(skip).limit(limit).all()
        
        return {
            "webhooks": [
                {
                    "id": str(webhook.id),
                    "provider": webhook.provider,
                    "event_type": webhook.event_type,
                    "status": webhook.status.value,
                    "created_at": webhook.created_at,
                    "processed_at": webhook.processed_at,
                    "error_message": webhook.error_message
                }
                for webhook in webhooks
            ],
            "count": len(webhooks)
        }
        
    except Exception as e:
        logger.error(f"Error listing webhooks: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/retry/{webhook_id}")
async def retry_webhook(
    webhook_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retry failed webhook processing"""
    try:
        webhook = db.query(PaymentWebhook).filter(PaymentWebhook.id == webhook_id).first()
        if not webhook:
            raise HTTPException(status_code=404, detail="Webhook not found")
        
        if webhook.status not in [WebhookStatus.FAILED, WebhookStatus.PROCESSED]:
            raise HTTPException(status_code=400, detail="Webhook is currently being processed")
        
        # Reset webhook status for retry
        webhook.status = WebhookStatus.PENDING
        webhook.error_message = None
        webhook.processed_at = None
        db.commit()
        
        # Process webhook in background
        background_tasks.add_task(process_webhook_background, webhook_id, db)
        
        return {"status": "retry_initiated", "webhook_id": webhook_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrying webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")