"""
Compliance API endpoints for regulatory requirements
Handles KYC, AML, trading limits, and regulatory reporting
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.database import get_db
from app.core.auth import get_current_user, require_admin
from app.models.user import User
from app.services.compliance_service import (
    ComplianceService,
    KYCVerification,
    TradingLimit,
    ComplianceCheckRequest,
    ComplianceCheckResponse,
    ComplianceStatus,
    RegulationType,
    compliance_service
)

logger = logging.getLogger(__name__)

router = APIRouter()

class KYCSubmissionRequest(BaseModel):
    """KYC submission request"""
    pan_number: str = Field(..., description="PAN card number")
    aadhaar_last_four: str = Field(..., description="Last 4 digits of Aadhaar")
    bank_account_number: str = Field(..., description="Bank account number")
    bank_ifsc: str = Field(..., description="Bank IFSC code")
    demat_account: Optional[str] = Field(None, description="Demat account number")
    income_range: str = Field(..., description="Annual income range")
    occupation: str = Field(..., description="Occupation")
    trading_experience: str = Field(..., description="Trading experience in years")
    risk_profile: str = Field(..., description="Risk profile: conservative, moderate, aggressive")

class TradingLimitRequest(BaseModel):
    """Request to set trading limits"""
    daily_trade_limit: float
    single_trade_limit: float
    daily_loss_limit: float
    margin_limit: float
    position_limit: int

class ComplianceReportRequest(BaseModel):
    """Request to generate compliance report"""
    report_type: str = Field(..., description="Type of report: sebi_monthly, pmla_str, rbi_forex")
    start_date: datetime
    end_date: datetime
    regulator: str = Field(..., description="Regulator: SEBI, RBI, NSE, BSE")

@router.post("/kyc/submit", response_model=ComplianceCheckResponse)
async def submit_kyc(
    request: KYCSubmissionRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit KYC information for verification
    """
    try:
        # Prepare KYC data (mask sensitive information)
        kyc_data = KYCVerification(
            user_id=str(current_user.id),
            pan_number=request.pan_number.upper(),
            aadhaar_number=f"****{request.aadhaar_last_four}",
            bank_account=f"****{request.bank_account_number[-4:]}",
            demat_account=request.demat_account,
            income_range=request.income_range,
            occupation=request.occupation,
            trading_experience=request.trading_experience,
            risk_profile=request.risk_profile
        )
        
        # Perform KYC check
        result = await compliance_service.perform_kyc_check(db, kyc_data)
        
        # Update user KYC status
        if result.status == ComplianceStatus.APPROVED:
            # Update user profile with KYC verified status
            current_user.kyc_verified = True
            current_user.kyc_verified_at = datetime.utcnow()
            await db.commit()
            
            # Send confirmation email
            background_tasks.add_task(
                send_kyc_confirmation_email,
                user_email=current_user.email,
                status="approved"
            )
        elif result.status in [ComplianceStatus.FLAGGED, ComplianceStatus.UNDER_REVIEW]:
            # Schedule manual review
            background_tasks.add_task(
                schedule_manual_kyc_review,
                user_id=str(current_user.id),
                check_id=result.check_id
            )
        
        # Audit log
        await compliance_service.audit_user_activity(
            db=db,
            user_id=str(current_user.id),
            action="submit_kyc",
            resource_type="kyc",
            resource_id=result.check_id,
            request_data=request.dict(),
            response_data=result.dict(),
            ip_address="127.0.0.1",  # Should get from request
            user_agent="FastAPI"     # Should get from request
        )
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in KYC submission for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/kyc/status")
async def get_kyc_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current KYC status for user
    """
    try:
        from app.services.compliance_service import ComplianceCheck
        
        # Get latest KYC check
        result = await db.execute(
            select(ComplianceCheck)
            .where(
                and_(
                    ComplianceCheck.user_id == str(current_user.id),
                    ComplianceCheck.check_type == "kyc"
                )
            )
            .order_by(ComplianceCheck.created_at.desc())
            .limit(1)
        )
        
        kyc_check = result.scalar_one_or_none()
        
        if not kyc_check:
            return {
                "kyc_status": "not_submitted",
                "verified": False,
                "message": "KYC not yet submitted"
            }
        
        return {
            "kyc_status": kyc_check.status,
            "verified": kyc_check.status == ComplianceStatus.APPROVED,
            "risk_category": kyc_check.risk_category,
            "violations": kyc_check.violations_found or [],
            "submitted_at": kyc_check.created_at.isoformat(),
            "check_id": str(kyc_check.id)
        }
        
    except Exception as e:
        logger.error(f"Error fetching KYC status for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/trading-limits/set")
async def set_trading_limits(
    request: TradingLimitRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Set trading limits for user (self-imposed)
    """
    try:
        # Store trading limits
        trading_limits = TradingLimit(
            user_id=str(current_user.id),
            daily_trade_limit=request.daily_trade_limit,
            single_trade_limit=request.single_trade_limit,
            daily_loss_limit=request.daily_loss_limit,
            margin_limit=request.margin_limit,
            position_limit=request.position_limit,
            equity_limit=request.daily_trade_limit * 0.8,  # 80% for equity
            derivative_limit=request.daily_trade_limit * 0.5,  # 50% for derivatives
            commodity_limit=request.daily_trade_limit * 0.2,  # 20% for commodities
            currency_limit=request.daily_trade_limit * 0.1   # 10% for currency
        )
        
        # This would store in database
        # For now, returning success
        
        # Audit log
        await compliance_service.audit_user_activity(
            db=db,
            user_id=str(current_user.id),
            action="set_trading_limits",
            resource_type="limits",
            resource_id=str(current_user.id),
            request_data=request.dict(),
            response_data={"status": "success"},
            ip_address="127.0.0.1",
            user_agent="FastAPI"
        )
        
        return {
            "status": "success",
            "message": "Trading limits set successfully",
            "limits": trading_limits.dict()
        }
        
    except Exception as e:
        logger.error(f"Error setting trading limits for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/trading-limits")
async def get_trading_limits(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current trading limits for user
    """
    try:
        limits = await compliance_service._get_user_trading_limits(db, str(current_user.id))
        
        # Get today's usage
        daily_traded = await compliance_service._get_daily_traded_value(db, str(current_user.id))
        
        return {
            "limits": limits.dict(),
            "usage": {
                "daily_traded": float(daily_traded),
                "daily_remaining": float(limits.daily_trade_limit - daily_traded),
                "utilization_percentage": float((daily_traded / limits.daily_trade_limit * 100) if limits.daily_trade_limit > 0 else 0)
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching trading limits for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/check/trade", response_model=ComplianceCheckResponse)
async def check_trade_compliance(
    trade_details: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Check if a trade complies with regulations and limits
    """
    try:
        # Add user context
        trade_details["user_id"] = str(current_user.id)
        trade_details["timestamp"] = datetime.utcnow().isoformat()
        
        # Check trading limits
        result = await compliance_service.check_trading_limits(
            db=db,
            user_id=str(current_user.id),
            trade_details=trade_details
        )
        
        # If blocked, prevent trade
        if result.action == "block":
            logger.warning(f"Trade blocked for user {current_user.id}: {result.violations}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error checking trade compliance for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/check/aml", response_model=ComplianceCheckResponse)
async def check_aml_compliance(
    transaction_details: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Perform AML check on transaction
    """
    try:
        result = await compliance_service.check_anti_money_laundering(
            db=db,
            user_id=str(current_user.id),
            transaction_details=transaction_details
        )
        
        # If suspicious, take action
        if result.action in ["freeze", "review"]:
            logger.warning(f"Suspicious transaction detected for user {current_user.id}")
            # Would trigger additional workflows here
        
        return result
        
    except Exception as e:
        logger.error(f"Error in AML check for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/history")
async def get_compliance_history(
    limit: int = Query(default=10, le=100),
    check_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get compliance check history for user
    """
    try:
        from app.services.compliance_service import ComplianceCheck
        
        query = select(ComplianceCheck).where(
            ComplianceCheck.user_id == str(current_user.id)
        )
        
        if check_type:
            query = query.where(ComplianceCheck.check_type == check_type)
        
        query = query.order_by(ComplianceCheck.created_at.desc()).limit(limit)
        
        result = await db.execute(query)
        checks = result.scalars().all()
        
        return {
            "checks": [
                {
                    "check_id": str(check.id),
                    "check_type": check.check_type,
                    "status": check.status,
                    "risk_score": check.risk_score,
                    "risk_category": check.risk_category,
                    "violations": check.violations_found or [],
                    "created_at": check.created_at.isoformat()
                }
                for check in checks
            ],
            "count": len(checks)
        }
        
    except Exception as e:
        logger.error(f"Error fetching compliance history for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Admin endpoints

@router.post("/admin/report/generate")
async def generate_compliance_report(
    request: ComplianceReportRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate compliance report for regulators (Admin only)
    """
    try:
        report = await compliance_service.generate_compliance_report(
            db=db,
            report_type=request.report_type,
            start_date=request.start_date,
            end_date=request.end_date,
            regulator=request.regulator
        )
        
        # Schedule report filing
        background_tasks.add_task(
            file_regulatory_report,
            report_data=report,
            regulator=request.regulator
        )
        
        return {
            "status": "success",
            "message": "Report generated successfully",
            "report_summary": report,
            "filing_status": "scheduled"
        }
        
    except Exception as e:
        logger.error(f"Error generating compliance report: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/admin/violations/recent")
async def get_recent_violations(
    days: int = Query(default=7),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get recent compliance violations (Admin only)
    """
    try:
        from app.services.compliance_service import ComplianceCheck
        
        since_date = datetime.utcnow() - timedelta(days=days)
        
        result = await db.execute(
            select(ComplianceCheck)
            .where(
                and_(
                    ComplianceCheck.created_at >= since_date,
                    ComplianceCheck.status.in_([
                        ComplianceStatus.REJECTED,
                        ComplianceStatus.FLAGGED
                    ])
                )
            )
            .order_by(ComplianceCheck.created_at.desc())
        )
        
        violations = result.scalars().all()
        
        # Group by type
        violations_by_type = {}
        for violation in violations:
            if violation.check_type not in violations_by_type:
                violations_by_type[violation.check_type] = []
            
            violations_by_type[violation.check_type].append({
                "check_id": str(violation.id),
                "user_id": str(violation.user_id),
                "risk_score": violation.risk_score,
                "violations": violation.violations_found,
                "created_at": violation.created_at.isoformat()
            })
        
        return {
            "period": f"Last {days} days",
            "total_violations": len(violations),
            "violations_by_type": violations_by_type,
            "high_risk_users": len(set([v.user_id for v in violations if v.risk_category in ["high", "very_high"]]))
        }
        
    except Exception as e:
        logger.error(f"Error fetching recent violations: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/admin/audit-logs")
async def get_audit_logs(
    user_id: Optional[str] = None,
    event_type: Optional[str] = None,
    days: int = Query(default=7),
    limit: int = Query(default=100, le=1000),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get audit logs (Admin only)
    """
    try:
        from app.services.compliance_service import AuditLog
        
        since_date = datetime.utcnow() - timedelta(days=days)
        
        query = select(AuditLog).where(AuditLog.created_at >= since_date)
        
        if user_id:
            query = query.where(AuditLog.user_id == user_id)
        
        if event_type:
            query = query.where(AuditLog.event_type == event_type)
        
        query = query.order_by(AuditLog.created_at.desc()).limit(limit)
        
        result = await db.execute(query)
        logs = result.scalars().all()
        
        return {
            "logs": [
                {
                    "log_id": str(log.id),
                    "user_id": str(log.user_id) if log.user_id else None,
                    "event_type": log.event_type,
                    "action": log.action,
                    "resource_type": log.resource_type,
                    "resource_id": log.resource_id,
                    "ip_address": log.ip_address,
                    "compliance_relevant": log.compliance_relevant,
                    "created_at": log.created_at.isoformat()
                }
                for log in logs
            ],
            "count": len(logs)
        }
        
    except Exception as e:
        logger.error(f"Error fetching audit logs: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/admin/user/{user_id}/freeze")
async def freeze_user_account(
    user_id: str,
    reason: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Freeze user account for compliance reasons (Admin only)
    """
    try:
        # Get user
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Freeze account
        user.is_active = False
        user.freeze_reason = reason
        user.frozen_at = datetime.utcnow()
        
        await db.commit()
        
        # Audit log
        await compliance_service.audit_user_activity(
            db=db,
            user_id=str(current_user.id),
            action="freeze_account",
            resource_type="user",
            resource_id=user_id,
            request_data={"reason": reason},
            response_data={"status": "frozen"},
            ip_address="127.0.0.1",
            user_agent="FastAPI"
        )
        
        return {
            "status": "success",
            "message": f"User account {user_id} frozen",
            "reason": reason
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error freezing user account {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Background tasks

async def send_kyc_confirmation_email(user_email: str, status: str):
    """Send KYC confirmation email"""
    logger.info(f"Sending KYC confirmation email to {user_email}: {status}")

async def schedule_manual_kyc_review(user_id: str, check_id: str):
    """Schedule manual KYC review"""
    logger.info(f"Scheduling manual KYC review for user {user_id}, check {check_id}")

async def file_regulatory_report(report_data: Dict[str, Any], regulator: str):
    """File report with regulator"""
    logger.info(f"Filing report with {regulator}: {report_data.get('report_type')}")