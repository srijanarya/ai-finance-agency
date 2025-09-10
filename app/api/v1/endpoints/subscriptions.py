"""
Subscription and Billing API endpoints
Handles subscription management, payment processing, and billing operations
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.services.subscription_billing_service import (
    SubscriptionBillingService,
    SubscriptionPlanSchema,
    CreateSubscriptionRequest,
    SubscriptionResponse,
    PaymentResponse,
    SubscriptionTier,
    BillingInterval,
    SubscriptionStatus,
    billing_service
)

logger = logging.getLogger(__name__)

router = APIRouter()

class SubscriptionPlansResponse(BaseModel):
    """Response model for subscription plans"""
    plans: List[SubscriptionPlanSchema]
    recommended_plan_id: Optional[str] = None

class SubscriptionUsageResponse(BaseModel):
    """Response model for subscription usage"""
    current_subscription: Optional[SubscriptionResponse] = None
    usage_summary: Dict[str, Any]
    billing_history: List[PaymentResponse]
    next_billing_date: Optional[datetime] = None

class UpdatePaymentMethodRequest(BaseModel):
    """Request to update payment method"""
    payment_method_id: str

class ApplyPromotionRequest(BaseModel):
    """Request to apply promotion code"""
    promotion_code: str

@router.get("/plans", response_model=SubscriptionPlansResponse)
async def get_subscription_plans(
    db: AsyncSession = Depends(get_db)
):
    """
    Get all available subscription plans with pricing and features
    """
    try:
        plans = await billing_service.get_available_plans(db)
        
        # Convert to schema format
        plan_schemas = []
        recommended_plan_id = None
        
        for plan in plans:
            plan_schema = SubscriptionPlanSchema(
                id=str(plan.id),
                tier=SubscriptionTier(plan.tier),
                name=plan.name,
                description=plan.description,
                price=plan.price,
                billing_interval=BillingInterval(plan.billing_interval),
                currency=plan.currency,
                daily_signals_limit=plan.daily_signals_limit,
                ai_models_access=plan.ai_models_access or [],
                backtesting_enabled=plan.backtesting_enabled,
                real_time_alerts=plan.real_time_alerts,
                portfolio_management=plan.portfolio_management,
                api_access=plan.api_access,
                priority_support=plan.priority_support,
                custom_strategies=plan.custom_strategies
            )
            plan_schemas.append(plan_schema)
            
            # Set Premium Monthly as recommended
            if plan.tier == SubscriptionTier.PREMIUM and plan.billing_interval == BillingInterval.MONTHLY:
                recommended_plan_id = str(plan.id)
        
        # Sort plans by price
        plan_schemas.sort(key=lambda x: x.price)
        
        return SubscriptionPlansResponse(
            plans=plan_schemas,
            recommended_plan_id=recommended_plan_id
        )
        
    except Exception as e:
        logger.error(f"Error fetching subscription plans: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/create", response_model=SubscriptionResponse)
async def create_subscription(
    request: CreateSubscriptionRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new subscription for the current user
    """
    try:
        subscription = await billing_service.create_user_subscription(
            db=db,
            user_id=str(current_user.id),
            request=request
        )
        
        # Calculate remaining signals for today
        signals_remaining = None
        if subscription.plan.daily_signals_limit > 0:
            signals_remaining = max(0, subscription.plan.daily_signals_limit - subscription.signals_consumed_today)
        
        # Schedule welcome email or onboarding tasks
        background_tasks.add_task(
            send_subscription_welcome_email,
            user_email=current_user.email,
            plan_name=subscription.plan.name
        )
        
        return SubscriptionResponse(
            id=str(subscription.id),
            status=SubscriptionStatus(subscription.status),
            plan=SubscriptionPlanSchema(
                id=str(subscription.plan.id),
                tier=SubscriptionTier(subscription.plan.tier),
                name=subscription.plan.name,
                description=subscription.plan.description,
                price=subscription.plan.price,
                billing_interval=BillingInterval(subscription.plan.billing_interval),
                currency=subscription.plan.currency,
                daily_signals_limit=subscription.plan.daily_signals_limit,
                ai_models_access=subscription.plan.ai_models_access or [],
                backtesting_enabled=subscription.plan.backtesting_enabled,
                real_time_alerts=subscription.plan.real_time_alerts,
                portfolio_management=subscription.plan.portfolio_management,
                api_access=subscription.plan.api_access,
                priority_support=subscription.plan.priority_support,
                custom_strategies=subscription.plan.custom_strategies
            ),
            current_period_start=subscription.current_period_start,
            current_period_end=subscription.current_period_end,
            trial_end=subscription.trial_end,
            signals_consumed_today=subscription.signals_consumed_today,
            signals_remaining_today=signals_remaining
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error creating subscription for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/current", response_model=SubscriptionResponse)
async def get_current_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the current user's active subscription
    """
    try:
        from sqlalchemy import select
        from app.services.subscription_billing_service import UserSubscription, SubscriptionPlan
        
        # Get active subscription
        result = await db.execute(
            select(UserSubscription)
            .join(SubscriptionPlan)
            .where(
                UserSubscription.user_id == str(current_user.id),
                UserSubscription.status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL])
            )
        )
        
        subscription = result.scalar_one_or_none()
        
        if not subscription:
            raise HTTPException(
                status_code=404,
                detail="No active subscription found"
            )
        
        # Calculate remaining signals for today
        signals_remaining = None
        if subscription.plan.daily_signals_limit > 0:
            signals_remaining = max(0, subscription.plan.daily_signals_limit - subscription.signals_consumed_today)
        
        return SubscriptionResponse(
            id=str(subscription.id),
            status=SubscriptionStatus(subscription.status),
            plan=SubscriptionPlanSchema(
                id=str(subscription.plan.id),
                tier=SubscriptionTier(subscription.plan.tier),
                name=subscription.plan.name,
                description=subscription.plan.description,
                price=subscription.plan.price,
                billing_interval=BillingInterval(subscription.plan.billing_interval),
                currency=subscription.plan.currency,
                daily_signals_limit=subscription.plan.daily_signals_limit,
                ai_models_access=subscription.plan.ai_models_access or [],
                backtesting_enabled=subscription.plan.backtesting_enabled,
                real_time_alerts=subscription.plan.real_time_alerts,
                portfolio_management=subscription.plan.portfolio_management,
                api_access=subscription.plan.api_access,
                priority_support=subscription.plan.priority_support,
                custom_strategies=subscription.plan.custom_strategies
            ),
            current_period_start=subscription.current_period_start,
            current_period_end=subscription.current_period_end,
            trial_end=subscription.trial_end,
            signals_consumed_today=subscription.signals_consumed_today,
            signals_remaining_today=signals_remaining
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching subscription for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.put("/{subscription_id}/upgrade")
async def upgrade_subscription(
    subscription_id: str,
    new_plan_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upgrade subscription to a higher tier
    """
    try:
        # Verify subscription belongs to current user
        from sqlalchemy import select
        from app.services.subscription_billing_service import UserSubscription
        
        result = await db.execute(
            select(UserSubscription)
            .where(
                UserSubscription.id == subscription_id,
                UserSubscription.user_id == str(current_user.id)
            )
        )
        
        subscription = result.scalar_one_or_none()
        if not subscription:
            raise HTTPException(
                status_code=404,
                detail="Subscription not found or access denied"
            )
        
        updated_subscription = await billing_service.upgrade_subscription(
            db=db,
            subscription_id=subscription_id,
            new_plan_id=new_plan_id
        )
        
        return {
            "status": "success",
            "message": "Subscription upgraded successfully",
            "subscription_id": str(updated_subscription.id)
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error upgrading subscription {subscription_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.delete("/{subscription_id}/cancel")
async def cancel_subscription(
    subscription_id: str,
    immediate: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cancel subscription (immediate or at period end)
    """
    try:
        # Verify subscription belongs to current user
        from sqlalchemy import select
        from app.services.subscription_billing_service import UserSubscription
        
        result = await db.execute(
            select(UserSubscription)
            .where(
                UserSubscription.id == subscription_id,
                UserSubscription.user_id == str(current_user.id)
            )
        )
        
        subscription = result.scalar_one_or_none()
        if not subscription:
            raise HTTPException(
                status_code=404,
                detail="Subscription not found or access denied"
            )
        
        cancelled_subscription = await billing_service.cancel_subscription(
            db=db,
            subscription_id=subscription_id,
            immediate=immediate
        )
        
        cancellation_date = cancelled_subscription.cancelled_at.isoformat() if cancelled_subscription.cancelled_at else None
        
        return {
            "status": "success",
            "message": "Subscription cancelled successfully",
            "cancellation_date": cancellation_date,
            "immediate": immediate
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error cancelling subscription {subscription_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/usage", response_model=SubscriptionUsageResponse)
async def get_subscription_usage(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get subscription usage summary and billing history
    """
    try:
        from sqlalchemy import select
        from app.services.subscription_billing_service import UserSubscription, SubscriptionPlan, Payment
        
        # Get current subscription
        result = await db.execute(
            select(UserSubscription)
            .join(SubscriptionPlan)
            .where(
                UserSubscription.user_id == str(current_user.id),
                UserSubscription.status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL, SubscriptionStatus.CANCELLED])
            )
            .order_by(UserSubscription.created_at.desc())
        )
        
        subscription = result.scalar_one_or_none()
        current_subscription = None
        next_billing_date = None
        
        if subscription:
            signals_remaining = None
            if subscription.plan.daily_signals_limit > 0:
                signals_remaining = max(0, subscription.plan.daily_signals_limit - subscription.signals_consumed_today)
            
            current_subscription = SubscriptionResponse(
                id=str(subscription.id),
                status=SubscriptionStatus(subscription.status),
                plan=SubscriptionPlanSchema(
                    id=str(subscription.plan.id),
                    tier=SubscriptionTier(subscription.plan.tier),
                    name=subscription.plan.name,
                    description=subscription.plan.description,
                    price=subscription.plan.price,
                    billing_interval=BillingInterval(subscription.plan.billing_interval),
                    currency=subscription.plan.currency,
                    daily_signals_limit=subscription.plan.daily_signals_limit,
                    ai_models_access=subscription.plan.ai_models_access or [],
                    backtesting_enabled=subscription.plan.backtesting_enabled,
                    real_time_alerts=subscription.plan.real_time_alerts,
                    portfolio_management=subscription.plan.portfolio_management,
                    api_access=subscription.plan.api_access,
                    priority_support=subscription.plan.priority_support,
                    custom_strategies=subscription.plan.custom_strategies
                ),
                current_period_start=subscription.current_period_start,
                current_period_end=subscription.current_period_end,
                trial_end=subscription.trial_end,
                signals_consumed_today=subscription.signals_consumed_today,
                signals_remaining_today=signals_remaining
            )
            
            next_billing_date = subscription.current_period_end
        
        # Get usage summary
        date_from = datetime.utcnow() - timedelta(days=days)
        date_to = datetime.utcnow()
        
        usage_summary = await billing_service.get_user_usage_summary(
            db=db,
            user_id=str(current_user.id),
            date_from=date_from,
            date_to=date_to
        )
        
        # Get billing history
        billing_history = []
        if subscription:
            result = await db.execute(
                select(Payment)
                .where(Payment.subscription_id == subscription.id)
                .order_by(Payment.created_at.desc())
                .limit(10)
            )
            
            payments = result.scalars().all()
            for payment in payments:
                billing_history.append(PaymentResponse(
                    id=str(payment.id),
                    amount=payment.amount,
                    currency=payment.currency,
                    status=payment.status,
                    payment_method=payment.payment_method,
                    created_at=payment.created_at,
                    completed_at=payment.completed_at
                ))
        
        return SubscriptionUsageResponse(
            current_subscription=current_subscription,
            usage_summary=usage_summary,
            billing_history=billing_history,
            next_billing_date=next_billing_date
        )
        
    except Exception as e:
        logger.error(f"Error fetching usage for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/access/{feature}")
async def check_feature_access(
    feature: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Check if user has access to a specific feature
    """
    try:
        has_access = await billing_service.check_user_access(
            db=db,
            user_id=str(current_user.id),
            feature=feature
        )
        
        return {
            "feature": feature,
            "has_access": has_access,
            "user_id": str(current_user.id)
        }
        
    except Exception as e:
        logger.error(f"Error checking feature access for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/usage/track")
async def track_feature_usage(
    feature: str,
    count: int = 1,
    metadata: Optional[Dict[str, Any]] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Track feature usage for billing and analytics
    """
    try:
        await billing_service.track_usage(
            db=db,
            user_id=str(current_user.id),
            feature=feature,
            count=count,
            metadata=metadata
        )
        
        return {
            "status": "success",
            "message": f"Tracked {count} usage(s) of {feature}"
        }
        
    except Exception as e:
        logger.error(f"Error tracking usage for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/webhook")
async def handle_stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    Handle Stripe webhook events for subscription and payment updates
    """
    try:
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        if not sig_header:
            raise HTTPException(
                status_code=400,
                detail="Missing Stripe signature header"
            )
        
        # Process webhook in background to avoid timeouts
        background_tasks.add_task(
            process_webhook_background,
            payload=payload,
            sig_header=sig_header
        )
        
        return {"status": "received"}
        
    except ValueError as e:
        logger.error(f"Invalid webhook payload: {e}")
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/invoices")
async def get_user_invoices(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's invoice history
    """
    try:
        from sqlalchemy import select
        from app.services.subscription_billing_service import UserSubscription, Payment
        
        # Get user's subscription
        result = await db.execute(
            select(UserSubscription)
            .where(UserSubscription.user_id == str(current_user.id))
            .order_by(UserSubscription.created_at.desc())
        )
        
        subscription = result.scalar_one_or_none()
        
        if not subscription or not subscription.stripe_customer_id:
            return {
                "invoices": [],
                "has_more": False
            }
        
        # Get invoices from Stripe
        import stripe
        invoices = stripe.Invoice.list(
            customer=subscription.stripe_customer_id,
            limit=limit
        )
        
        invoice_list = []
        for invoice in invoices.data:
            invoice_list.append({
                "id": invoice.id,
                "amount_paid": invoice.amount_paid / 100,
                "amount_due": invoice.amount_due / 100,
                "currency": invoice.currency.upper(),
                "status": invoice.status,
                "created": datetime.fromtimestamp(invoice.created),
                "due_date": datetime.fromtimestamp(invoice.due_date) if invoice.due_date else None,
                "invoice_pdf": invoice.invoice_pdf,
                "hosted_invoice_url": invoice.hosted_invoice_url
            })
        
        return {
            "invoices": invoice_list,
            "has_more": invoices.has_more
        }
        
    except Exception as e:
        logger.error(f"Error fetching invoices for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# Background tasks

async def send_subscription_welcome_email(user_email: str, plan_name: str):
    """Send welcome email to new subscriber"""
    # This would integrate with your email service
    logger.info(f"Sending welcome email to {user_email} for {plan_name} plan")

async def process_webhook_background(payload: bytes, sig_header: str):
    """Process Stripe webhook in background"""
    try:
        result = await billing_service.process_webhook(payload, sig_header)
        logger.info(f"Webhook processed successfully: {result}")
    except Exception as e:
        logger.error(f"Error processing webhook in background: {e}")

# Helper functions for admin

@router.post("/admin/plans", response_model=SubscriptionPlanSchema)
async def create_subscription_plan(
    plan_data: SubscriptionPlanSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new subscription plan (Admin only)
    """
    # TODO: Add admin role check
    if not hasattr(current_user, 'is_admin') or not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    
    try:
        plan = await billing_service.create_subscription_plan(db, plan_data)
        
        return SubscriptionPlanSchema(
            id=str(plan.id),
            tier=SubscriptionTier(plan.tier),
            name=plan.name,
            description=plan.description,
            price=plan.price,
            billing_interval=BillingInterval(plan.billing_interval),
            currency=plan.currency,
            daily_signals_limit=plan.daily_signals_limit,
            ai_models_access=plan.ai_models_access or [],
            backtesting_enabled=plan.backtesting_enabled,
            real_time_alerts=plan.real_time_alerts,
            portfolio_management=plan.portfolio_management,
            api_access=plan.api_access,
            priority_support=plan.priority_support,
            custom_strategies=plan.custom_strategies
        )
        
    except Exception as e:
        logger.error(f"Error creating subscription plan: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )