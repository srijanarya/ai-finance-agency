"""
Dashboard API endpoints for signal management and analytics
Provides comprehensive portfolio analytics, signal performance, and market insights
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, Depends, Query, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
import json
import asyncio

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.services.dashboard_service import (
    DashboardService,
    DashboardData,
    TimeRange,
    DashboardMetric,
    dashboard_service
)
from app.services.ai_trading_signals_engine import AITradingSignalsEngine

logger = logging.getLogger(__name__)

router = APIRouter()

class DashboardResponse(BaseModel):
    """Dashboard response model"""
    status: str
    data: DashboardData
    timestamp: datetime

class SignalExecuteRequest(BaseModel):
    """Request to execute a signal"""
    signal_id: str
    quantity: Optional[int] = None
    broker: str = Field(default="zerodha", description="Broker to use for execution")

class SignalModifyRequest(BaseModel):
    """Request to modify a signal"""
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    quantity: Optional[int] = None

class AlertPreference(BaseModel):
    """User alert preferences"""
    email_alerts: bool = True
    sms_alerts: bool = False
    push_notifications: bool = True
    signal_generation: bool = True
    signal_execution: bool = True
    stop_loss_hit: bool = True
    target_reached: bool = True
    market_alerts: bool = True

@router.get("/overview", response_model=DashboardResponse)
async def get_dashboard_overview(
    time_range: TimeRange = Query(default=TimeRange.MONTH),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get complete dashboard overview with all metrics
    """
    try:
        dashboard_data = await dashboard_service.get_dashboard_data(
            db=db,
            user_id=str(current_user.id),
            time_range=time_range
        )
        
        return DashboardResponse(
            status="success",
            data=dashboard_data,
            timestamp=datetime.utcnow()
        )
        
    except Exception as e:
        logger.error(f"Error fetching dashboard for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/portfolio/summary")
async def get_portfolio_summary(
    current_user: User = Depends(get_current_user)
):
    """
    Get current portfolio summary
    """
    try:
        portfolio_summary = await dashboard_service._get_portfolio_summary(str(current_user.id))
        
        return {
            "status": "success",
            "data": portfolio_summary.dict(),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching portfolio summary for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/signals/recent")
async def get_recent_signals(
    time_range: TimeRange = Query(default=TimeRange.WEEK),
    limit: int = Query(default=20, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get recent signals with performance metrics
    """
    try:
        signals = await dashboard_service._get_recent_signals(
            db=db,
            user_id=str(current_user.id),
            time_range=time_range
        )
        
        # Apply limit
        signals = signals[:limit]
        
        return {
            "status": "success",
            "data": [signal.dict() for signal in signals],
            "count": len(signals),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching signals for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/signals/{signal_id}")
async def get_signal_details(
    signal_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information for a specific signal
    """
    try:
        signal_details = await dashboard_service.get_signal_details(
            db=db,
            user_id=str(current_user.id),
            signal_id=signal_id
        )
        
        if not signal_details:
            raise HTTPException(
                status_code=404,
                detail="Signal not found or access denied"
            )
        
        return {
            "status": "success",
            "data": signal_details,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching signal {signal_id} for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/signals/{signal_id}/execute")
async def execute_signal(
    signal_id: str,
    request: SignalExecuteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Execute a trading signal
    """
    try:
        # Get signal details
        signal_details = await dashboard_service.get_signal_details(
            db=db,
            user_id=str(current_user.id),
            signal_id=signal_id
        )
        
        if not signal_details:
            raise HTTPException(
                status_code=404,
                detail="Signal not found or access denied"
            )
        
        # Execute through portfolio manager
        from app.services.portfolio_management_engine import PortfolioManager
        portfolio_manager = PortfolioManager()
        
        execution_result = await portfolio_manager.execute_signal_via_broker(
            signal_data={
                'symbol': signal_details['symbol'],
                'signal_type': signal_details['signal_type'],
                'quantity': request.quantity or signal_details['quantity'],
                'entry_price': signal_details['entry_price'],
                'target_price': signal_details['target_price'],
                'stop_loss': signal_details['stop_loss']
            },
            broker_type=request.broker,
            user_id=str(current_user.id)
        )
        
        # Update signal status in database
        from app.models.signals import Signal, SignalStatus
        
        result = await db.execute(
            select(Signal).where(Signal.id == signal_id)
        )
        signal = result.scalar_one_or_none()
        
        if signal:
            signal.status = SignalStatus.EXECUTED
            signal.executed_at = datetime.utcnow()
            await db.commit()
        
        return {
            "status": "success",
            "message": "Signal executed successfully",
            "execution_result": execution_result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing signal {signal_id} for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.put("/signals/{signal_id}/modify")
async def modify_signal(
    signal_id: str,
    request: SignalModifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Modify signal parameters (target, stop loss, quantity)
    """
    try:
        from app.models.signals import Signal
        
        # Get signal
        result = await db.execute(
            select(Signal).where(
                and_(
                    Signal.id == signal_id,
                    Signal.user_id == str(current_user.id)
                )
            )
        )
        
        signal = result.scalar_one_or_none()
        
        if not signal:
            raise HTTPException(
                status_code=404,
                detail="Signal not found or access denied"
            )
        
        # Update signal parameters
        if request.target_price is not None:
            signal.target_price = request.target_price
        if request.stop_loss is not None:
            signal.stop_loss = request.stop_loss
        if request.quantity is not None:
            signal.quantity = request.quantity
        
        signal.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(signal)
        
        return {
            "status": "success",
            "message": "Signal modified successfully",
            "signal_id": str(signal.id),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error modifying signal {signal_id} for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.delete("/signals/{signal_id}/cancel")
async def cancel_signal(
    signal_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cancel a pending signal
    """
    try:
        from app.models.signals import Signal, SignalStatus
        
        # Get signal
        result = await db.execute(
            select(Signal).where(
                and_(
                    Signal.id == signal_id,
                    Signal.user_id == str(current_user.id)
                )
            )
        )
        
        signal = result.scalar_one_or_none()
        
        if not signal:
            raise HTTPException(
                status_code=404,
                detail="Signal not found or access denied"
            )
        
        if signal.status == SignalStatus.EXECUTED:
            raise HTTPException(
                status_code=400,
                detail="Cannot cancel an executed signal"
            )
        
        # Cancel signal
        signal.status = SignalStatus.CANCELLED
        signal.closed_at = datetime.utcnow()
        
        await db.commit()
        
        return {
            "status": "success",
            "message": "Signal cancelled successfully",
            "signal_id": str(signal.id),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling signal {signal_id} for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/analytics/summary")
async def get_analytics_summary(
    time_range: TimeRange = Query(default=TimeRange.MONTH),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get analytics summary for specified time range
    """
    try:
        analytics = await dashboard_service._get_analytics_summary(
            db=db,
            user_id=str(current_user.id),
            time_range=time_range
        )
        
        return {
            "status": "success",
            "data": analytics.dict(),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching analytics for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/analytics/chart")
async def get_chart_data(
    metric: DashboardMetric = Query(...),
    time_range: TimeRange = Query(default=TimeRange.MONTH),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get chart data for specific metric
    """
    try:
        chart_data = await dashboard_service.get_performance_chart_data(
            db=db,
            user_id=str(current_user.id),
            time_range=time_range,
            metric=metric
        )
        
        return {
            "status": "success",
            "data": chart_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching chart data for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/market/overview")
async def get_market_overview(
    current_user: User = Depends(get_current_user)
):
    """
    Get current market overview
    """
    try:
        market_overview = await dashboard_service._get_market_overview()
        
        return {
            "status": "success",
            "data": market_overview.dict(),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching market overview: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/risk/metrics")
async def get_risk_metrics(
    current_user: User = Depends(get_current_user)
):
    """
    Get portfolio risk metrics
    """
    try:
        portfolio_summary = await dashboard_service._get_portfolio_summary(str(current_user.id))
        risk_metrics = await dashboard_service._get_risk_metrics(
            str(current_user.id),
            portfolio_summary
        )
        
        return {
            "status": "success",
            "data": risk_metrics.dict(),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching risk metrics for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/alerts")
async def get_user_alerts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get active alerts for user
    """
    try:
        alerts = await dashboard_service._get_user_alerts(
            db=db,
            user_id=str(current_user.id)
        )
        
        return {
            "status": "success",
            "data": alerts,
            "count": len(alerts),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching alerts for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/alerts/preferences")
async def update_alert_preferences(
    preferences: AlertPreference,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update user alert preferences
    """
    try:
        # Store preferences in user profile
        # This would update the user's alert preferences in the database
        
        return {
            "status": "success",
            "message": "Alert preferences updated successfully",
            "preferences": preferences.dict(),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating alert preferences for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/signals/generate")
async def generate_new_signals(
    symbols: List[str] = Query(..., description="List of symbols to generate signals for"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate new AI trading signals for specified symbols
    """
    try:
        # Check subscription limits
        from app.services.subscription_billing_service import billing_service
        
        has_access = await billing_service.check_user_access(
            db=db,
            user_id=str(current_user.id),
            feature="ai_signals"
        )
        
        if not has_access:
            raise HTTPException(
                status_code=403,
                detail="Upgrade your subscription to access AI signals"
            )
        
        # Track usage
        await billing_service.track_usage(
            db=db,
            user_id=str(current_user.id),
            feature="ai_signals",
            count=len(symbols),
            metadata={"symbols": symbols}
        )
        
        # Generate signals
        ai_engine = AITradingSignalsEngine()
        signals = await ai_engine.generate_signals(symbols)
        
        # Store signals in database
        from app.models.signals import Signal
        
        created_signals = []
        for signal_data in signals:
            signal = Signal(
                user_id=str(current_user.id),
                symbol=signal_data['symbol'],
                signal_type=signal_data['signal_type'],
                entry_price=signal_data['entry_price'],
                target_price=signal_data.get('target_price'),
                stop_loss=signal_data.get('stop_loss'),
                quantity=signal_data.get('quantity', 1),
                confidence=signal_data.get('confidence', 0.5),
                status='pending',
                created_at=datetime.utcnow()
            )
            db.add(signal)
            created_signals.append(signal)
        
        await db.commit()
        
        return {
            "status": "success",
            "message": f"Generated {len(created_signals)} new signals",
            "signals": [
                {
                    "signal_id": str(s.id),
                    "symbol": s.symbol,
                    "signal_type": s.signal_type,
                    "entry_price": float(s.entry_price),
                    "confidence": s.confidence
                }
                for s in created_signals
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating signals for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/export/csv")
async def export_dashboard_data(
    time_range: TimeRange = Query(default=TimeRange.MONTH),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Export dashboard data as CSV
    """
    try:
        import csv
        import io
        
        # Get dashboard data
        dashboard_data = await dashboard_service.get_dashboard_data(
            db=db,
            user_id=str(current_user.id),
            time_range=time_range
        )
        
        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write portfolio summary
        writer.writerow(["Portfolio Summary"])
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Total Value", dashboard_data.portfolio_summary.total_value])
        writer.writerow(["Total Invested", dashboard_data.portfolio_summary.total_invested])
        writer.writerow(["Current P&L", dashboard_data.portfolio_summary.current_pnl])
        writer.writerow(["P&L %", dashboard_data.portfolio_summary.pnl_percentage])
        writer.writerow([])
        
        # Write signals
        writer.writerow(["Recent Signals"])
        writer.writerow(["Symbol", "Type", "Entry Price", "Current Price", "P&L", "P&L %", "Status"])
        
        for signal in dashboard_data.recent_signals:
            writer.writerow([
                signal.symbol,
                signal.signal_type.value,
                signal.entry_price,
                signal.current_price,
                signal.pnl,
                signal.pnl_percentage,
                signal.status.value
            ])
        
        # Get CSV content
        output.seek(0)
        csv_content = output.getvalue()
        
        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(csv_content.encode()),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=dashboard_export_{time_range.value}_{datetime.utcnow().strftime('%Y%m%d')}.csv"
            }
        )
        
    except Exception as e:
        logger.error(f"Error exporting dashboard data for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# WebSocket endpoint for real-time updates
@router.websocket("/ws")
async def dashboard_websocket(
    websocket: WebSocket,
    db: AsyncSession = Depends(get_db)
):
    """
    WebSocket endpoint for real-time dashboard updates
    """
    await websocket.accept()
    
    try:
        # Authenticate user
        auth_message = await websocket.receive_json()
        if "token" not in auth_message:
            await websocket.close(code=1008, reason="Authentication required")
            return
        
        # Verify JWT token and get user
        from app.core.auth import verify_token
        try:
            user_id = verify_token(auth_message["token"])
        except Exception:
            await websocket.close(code=1008, reason="Invalid token")
            return
        
        # Send initial dashboard data
        dashboard_data = await dashboard_service.get_dashboard_data(
            db=db,
            user_id=user_id,
            time_range=TimeRange.TODAY
        )
        
        await websocket.send_json({
            "type": "dashboard_update",
            "data": dashboard_data.dict()
        })
        
        # Keep connection alive and send periodic updates
        while True:
            try:
                # Wait for client messages or timeout after 30 seconds
                message = await asyncio.wait_for(
                    websocket.receive_json(),
                    timeout=30.0
                )
                
                # Handle client requests
                if message.get("type") == "refresh":
                    dashboard_data = await dashboard_service.get_dashboard_data(
                        db=db,
                        user_id=user_id,
                        time_range=TimeRange.TODAY
                    )
                    
                    await websocket.send_json({
                        "type": "dashboard_update",
                        "data": dashboard_data.dict()
                    })
                    
            except asyncio.TimeoutError:
                # Send heartbeat
                await websocket.send_json({"type": "heartbeat"})
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user {user_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close(code=1011, reason="Internal server error")