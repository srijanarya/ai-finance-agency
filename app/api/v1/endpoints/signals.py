"""
Trading Signals API endpoints
Supports TREUM's Premium Signal Service (₹60-90 Cr revenue target)
"""

from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func

from app.core.database import get_db
from app.core.security import authenticate_request
from app.services.ai_signal_generator import signal_service, analyze_single_asset
from database.models import (
    User, TradingSignal, SignalProvider, SignalSubscription, UserSignalPreferences,
    SignalAnalytics, SignalType, SignalPriority, SignalStatus, AssetClass,
    SubscriptionTier, SignalSource
)

router = APIRouter()


# Request/Response Models

class SignalResponse(BaseModel):
    """Signal response model"""
    id: UUID
    signal_id: str
    symbol: str
    exchange: str
    asset_class: str
    signal_type: str
    priority: str
    confidence_score: float
    entry_price: Optional[float] = None
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    current_price: Optional[float] = None
    risk_reward_ratio: Optional[float] = None
    potential_return: Optional[float] = None
    potential_loss: Optional[float] = None
    generated_at: datetime
    valid_until: Optional[datetime] = None
    status: str
    min_subscription_tier: str
    tags: List[str] = []
    notes: Optional[str] = None
    
    # Technical indicators (limited for basic users)
    rsi: Optional[float] = None
    macd_signal: Optional[str] = None
    volume_signal: Optional[str] = None
    
    class Config:
        from_attributes = True


class DetailedSignalResponse(SignalResponse):
    """Detailed signal response for premium users"""
    technical_indicators: Dict[str, Any] = {}
    fundamental_data: Dict[str, Any] = {}
    sentiment_data: Dict[str, Any] = {}
    market_conditions: Dict[str, Any] = {}
    provider_info: Dict[str, Any] = {}


class SignalSubscriptionRequest(BaseModel):
    """Signal subscription request"""
    signal_id: UUID
    delivery_methods: List[str] = Field(default=["push_notification"], description="Delivery methods: email, sms, push_notification, api")
    is_auto_trade_enabled: bool = Field(default=False, description="Enable auto-trading for this signal")


class SignalFeedbackRequest(BaseModel):
    """Signal feedback request"""
    signal_id: UUID
    rating: int = Field(ge=1, le=5, description="Rating from 1 to 5 stars")
    feedback: Optional[str] = Field(None, max_length=500, description="Optional feedback text")
    execution_price: Optional[float] = Field(None, description="Price at which user executed the signal")
    is_executed: bool = Field(default=False, description="Whether user executed the signal")


class UserPreferencesRequest(BaseModel):
    """User signal preferences request"""
    preferred_asset_classes: List[str] = Field(default=["equity", "crypto"])
    excluded_symbols: List[str] = Field(default=[])
    min_confidence_score: float = Field(default=0.7, ge=0.0, le=1.0)
    max_position_size_percentage: float = Field(default=5.0, ge=0.1, le=100.0)
    min_risk_reward_ratio: float = Field(default=1.5, ge=0.1)
    max_drawdown_tolerance: float = Field(default=10.0, ge=0.1, le=100.0)
    delivery_methods: List[str] = Field(default=["push_notification", "email"])
    quiet_hours_start: str = Field(default="22:00", regex="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    quiet_hours_end: str = Field(default="08:00", regex="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    timezone: str = Field(default="Asia/Kolkata")
    max_signals_per_day: int = Field(default=10, ge=1, le=100)
    max_signals_per_hour: int = Field(default=3, ge=1, le=20)
    is_auto_trade_enabled: bool = Field(default=False)
    auto_trade_amount_per_signal: Optional[float] = Field(None, ge=100.0)
    auto_trade_stop_loss_percentage: float = Field(default=5.0, ge=0.1, le=50.0)


class AssetAnalysisRequest(BaseModel):
    """Asset analysis request"""
    symbol: str = Field(..., max_length=20, description="Asset symbol (e.g., RELIANCE, BTC-USD)")
    asset_class: str = Field(..., description="Asset class: equity, crypto, forex, commodity")


# Helper Functions

def get_user_subscription_tier(user: User) -> SubscriptionTier:
    """Get user's subscription tier (mock implementation)"""
    # In production, this would check the user's active subscription
    # For now, return BASIC as default
    return SubscriptionTier.BASIC


def filter_signal_data_by_tier(signal: TradingSignal, user_tier: SubscriptionTier) -> Dict[str, Any]:
    """Filter signal data based on user's subscription tier"""
    
    # Basic data available to all tiers
    signal_data = {
        'id': signal.id,
        'signal_id': signal.signal_id,
        'symbol': signal.symbol,
        'exchange': signal.exchange,
        'asset_class': signal.asset_class,
        'signal_type': signal.signal_type,
        'priority': signal.priority,
        'confidence_score': float(signal.confidence_score),
        'current_price': float(signal.current_price) if signal.current_price else None,
        'generated_at': signal.generated_at,
        'valid_until': signal.valid_until,
        'status': signal.status,
        'min_subscription_tier': signal.min_subscription_tier,
        'tags': signal.tags or [],
        'notes': signal.notes
    }
    
    # Add price targets for PRO and ELITE
    if user_tier in [SubscriptionTier.PRO, SubscriptionTier.ELITE]:
        signal_data.update({
            'entry_price': float(signal.entry_price) if signal.entry_price else None,
            'target_price': float(signal.target_price) if signal.target_price else None,
            'stop_loss': float(signal.stop_loss) if signal.stop_loss else None,
            'risk_reward_ratio': float(signal.risk_reward_ratio) if signal.risk_reward_ratio else None,
            'potential_return': signal.potential_return,
            'potential_loss': signal.potential_loss
        })
    
    # Add basic technical indicators for all tiers
    if signal.technical_indicators:
        signal_data['rsi'] = signal.technical_indicators.get('rsi')
        
        # Simplified MACD signal
        macd = signal.technical_indicators.get('macd', 0)
        macd_signal = signal.technical_indicators.get('macd_signal', 0)
        if macd > macd_signal:
            signal_data['macd_signal'] = "bullish"
        elif macd < macd_signal:
            signal_data['macd_signal'] = "bearish"
        else:
            signal_data['macd_signal'] = "neutral"
        
        # Volume signal
        volume_ratio = signal.technical_indicators.get('volume_ratio', 1.0)
        if volume_ratio > 1.5:
            signal_data['volume_signal'] = "high"
        elif volume_ratio > 1.0:
            signal_data['volume_signal'] = "above_average"
        else:
            signal_data['volume_signal'] = "normal"
    
    # Add detailed technical data for ELITE
    if user_tier == SubscriptionTier.ELITE:
        signal_data.update({
            'technical_indicators': signal.technical_indicators or {},
            'fundamental_data': signal.fundamental_data or {},
            'sentiment_data': signal.sentiment_data or {},
            'market_conditions': signal.market_conditions or {},
            'provider_info': {
                'name': signal.provider.name,
                'accuracy_score': float(signal.provider.accuracy_score),
                'total_signals': signal.provider.total_signals,
                'success_rate': signal.provider.success_rate
            } if signal.provider else {}
        })
    
    return signal_data


def check_signal_access(signal: TradingSignal, user_tier: SubscriptionTier) -> bool:
    """Check if user has access to signal based on subscription tier"""
    tier_hierarchy = {
        SubscriptionTier.BASIC: 1,
        SubscriptionTier.PRO: 2,
        SubscriptionTier.ELITE: 3
    }
    
    required_tier = SubscriptionTier(signal.min_subscription_tier)
    return tier_hierarchy[user_tier] >= tier_hierarchy[required_tier]


# API Endpoints

@router.get("/signals", response_model=List[SignalResponse])
async def get_signals(
    asset_class: Optional[str] = Query(None, description="Filter by asset class"),
    signal_type: Optional[str] = Query(None, description="Filter by signal type"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of signals to return"),
    offset: int = Query(0, ge=0, description="Number of signals to skip"),
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Get trading signals for the current user"""
    
    # Get user's subscription tier
    user_tier = get_user_subscription_tier(current_user)
    
    # Build query
    query = db.query(TradingSignal).filter(
        TradingSignal.status == SignalStatus.ACTIVE,
        TradingSignal.valid_until > datetime.now(timezone.utc)
    )
    
    # Apply filters
    if asset_class:
        query = query.filter(TradingSignal.asset_class == asset_class)
    
    if signal_type:
        query = query.filter(TradingSignal.signal_type == signal_type)
    
    if priority:
        query = query.filter(TradingSignal.priority == priority)
    
    # Get signals ordered by priority and generation time
    signals = query.order_by(
        desc(TradingSignal.priority),
        desc(TradingSignal.generated_at)
    ).offset(offset).limit(limit).all()
    
    # Filter signals based on user's subscription tier and format response
    response_signals = []
    for signal in signals:
        if check_signal_access(signal, user_tier):
            signal_data = filter_signal_data_by_tier(signal, user_tier)
            
            if user_tier == SubscriptionTier.ELITE:
                response_signals.append(DetailedSignalResponse(**signal_data))
            else:
                response_signals.append(SignalResponse(**signal_data))
    
    return response_signals


@router.get("/signals/{signal_id}", response_model=DetailedSignalResponse)
async def get_signal(
    signal_id: UUID,
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Get a specific signal by ID"""
    
    signal = db.query(TradingSignal).filter(TradingSignal.id == signal_id).first()
    
    if not signal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signal not found"
        )
    
    user_tier = get_user_subscription_tier(current_user)
    
    if not check_signal_access(signal, user_tier):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient subscription tier to access this signal"
        )
    
    signal_data = filter_signal_data_by_tier(signal, user_tier)
    return DetailedSignalResponse(**signal_data)


@router.post("/signals/subscribe")
async def subscribe_to_signal(
    subscription_request: SignalSubscriptionRequest,
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Subscribe to a specific signal"""
    
    signal = db.query(TradingSignal).filter(
        TradingSignal.id == subscription_request.signal_id
    ).first()
    
    if not signal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signal not found"
        )
    
    user_tier = get_user_subscription_tier(current_user)
    
    if not check_signal_access(signal, user_tier):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient subscription tier to access this signal"
        )
    
    # Check if already subscribed
    existing_subscription = db.query(SignalSubscription).filter(
        SignalSubscription.user_id == current_user.id,
        SignalSubscription.signal_id == subscription_request.signal_id
    ).first()
    
    if existing_subscription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already subscribed to this signal"
        )
    
    # Create subscription
    subscription = SignalSubscription(
        user_id=current_user.id,
        signal_id=subscription_request.signal_id,
        subscription_tier=user_tier,
        delivery_methods=subscription_request.delivery_methods,
        is_auto_trade_enabled=subscription_request.is_auto_trade_enabled
    )
    
    db.add(subscription)
    db.commit()
    
    return {
        "success": True,
        "message": "Successfully subscribed to signal",
        "subscription_id": str(subscription.id)
    }


@router.post("/signals/feedback")
async def submit_signal_feedback(
    feedback: SignalFeedbackRequest,
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Submit feedback for a signal"""
    
    # Find user's subscription to this signal
    subscription = db.query(SignalSubscription).filter(
        SignalSubscription.user_id == current_user.id,
        SignalSubscription.signal_id == feedback.signal_id
    ).first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signal subscription not found"
        )
    
    # Update subscription with feedback
    subscription.user_rating = feedback.rating
    subscription.user_feedback = feedback.feedback
    subscription.is_executed = feedback.is_executed
    
    if feedback.execution_price:
        subscription.execution_price = feedback.execution_price
        subscription.executed_at = datetime.now(timezone.utc)
        
        # Calculate user return percentage
        signal = subscription.signal
        if signal.entry_price:
            if signal.signal_type == SignalType.BUY:
                subscription.user_return_percentage = (
                    (feedback.execution_price - float(signal.entry_price)) / float(signal.entry_price) * 100
                )
            else:  # SELL
                subscription.user_return_percentage = (
                    (float(signal.entry_price) - feedback.execution_price) / float(signal.entry_price) * 100
                )
    
    db.commit()
    
    return {
        "success": True,
        "message": "Feedback submitted successfully"
    }


@router.get("/signals/preferences", response_model=UserPreferencesRequest)
async def get_signal_preferences(
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Get user's signal preferences"""
    
    preferences = db.query(UserSignalPreferences).filter(
        UserSignalPreferences.user_id == current_user.id
    ).first()
    
    if not preferences:
        # Return default preferences
        return UserPreferencesRequest()
    
    return UserPreferencesRequest(
        preferred_asset_classes=preferences.preferred_asset_classes or ["equity", "crypto"],
        excluded_symbols=preferences.excluded_symbols or [],
        min_confidence_score=float(preferences.min_confidence_score),
        max_position_size_percentage=float(preferences.max_position_size_percentage),
        min_risk_reward_ratio=float(preferences.min_risk_reward_ratio),
        max_drawdown_tolerance=float(preferences.max_drawdown_tolerance),
        delivery_methods=preferences.delivery_methods or ["push_notification", "email"],
        quiet_hours_start=preferences.quiet_hours_start,
        quiet_hours_end=preferences.quiet_hours_end,
        timezone=preferences.timezone,
        max_signals_per_day=preferences.max_signals_per_day,
        max_signals_per_hour=preferences.max_signals_per_hour,
        is_auto_trade_enabled=preferences.is_auto_trade_enabled,
        auto_trade_amount_per_signal=float(preferences.auto_trade_amount_per_signal) if preferences.auto_trade_amount_per_signal else None,
        auto_trade_stop_loss_percentage=float(preferences.auto_trade_stop_loss_percentage)
    )


@router.put("/signals/preferences")
async def update_signal_preferences(
    preferences: UserPreferencesRequest,
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Update user's signal preferences"""
    
    existing_preferences = db.query(UserSignalPreferences).filter(
        UserSignalPreferences.user_id == current_user.id
    ).first()
    
    if existing_preferences:
        # Update existing preferences
        for field, value in preferences.dict().items():
            setattr(existing_preferences, field, value)
        existing_preferences.updated_at = datetime.now(timezone.utc)
    else:
        # Create new preferences
        existing_preferences = UserSignalPreferences(
            user_id=current_user.id,
            **preferences.dict()
        )
        db.add(existing_preferences)
    
    db.commit()
    
    return {
        "success": True,
        "message": "Signal preferences updated successfully"
    }


@router.post("/signals/analyze")
async def analyze_asset(
    analysis_request: AssetAnalysisRequest,
    current_user: User = Depends(authenticate_request)
):
    """Analyze a specific asset and return signal data"""
    
    user_tier = get_user_subscription_tier(current_user)
    
    # Check if user has access to real-time analysis (PRO and ELITE only)
    if user_tier == SubscriptionTier.BASIC:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Real-time asset analysis requires PRO or ELITE subscription"
        )
    
    try:
        analysis_result = await analyze_single_asset(
            analysis_request.symbol,
            analysis_request.asset_class
        )
        
        if not analysis_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Unable to analyze the specified asset. Check symbol and asset class."
            )
        
        # Filter data based on subscription tier
        if user_tier == SubscriptionTier.PRO:
            # Remove detailed technical analysis for PRO users
            analysis_result['analysis'] = {
                'current_price': analysis_result['analysis']['current_price'],
                'price_change_pct': analysis_result['analysis']['price_change_pct'],
                'volume_ratio': analysis_result['analysis']['volume_ratio']
            }
        
        return {
            "success": True,
            "data": analysis_result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing asset: {str(e)}"
        )


@router.get("/signals/performance/user")
async def get_user_signal_performance(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Get user's signal performance metrics"""
    
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Get user's signal subscriptions with feedback
    subscriptions = db.query(SignalSubscription).filter(
        SignalSubscription.user_id == current_user.id,
        SignalSubscription.subscribed_at >= start_date
    ).all()
    
    if not subscriptions:
        return {
            "period_days": days,
            "total_signals": 0,
            "executed_signals": 0,
            "execution_rate": 0.0,
            "average_return": 0.0,
            "win_rate": 0.0,
            "average_rating": 0.0
        }
    
    total_signals = len(subscriptions)
    executed_signals = len([s for s in subscriptions if s.is_executed])
    total_return = sum([s.user_return_percentage or 0 for s in subscriptions if s.user_return_percentage])
    positive_returns = len([s for s in subscriptions if s.user_return_percentage and s.user_return_percentage > 0])
    rated_signals = [s for s in subscriptions if s.user_rating]
    
    execution_rate = (executed_signals / total_signals) * 100 if total_signals > 0 else 0
    average_return = total_return / executed_signals if executed_signals > 0 else 0
    win_rate = (positive_returns / executed_signals) * 100 if executed_signals > 0 else 0
    average_rating = sum([s.user_rating for s in rated_signals]) / len(rated_signals) if rated_signals else 0
    
    return {
        "period_days": days,
        "total_signals": total_signals,
        "executed_signals": executed_signals,
        "execution_rate": round(execution_rate, 2),
        "average_return": round(average_return, 2),
        "win_rate": round(win_rate, 2),
        "average_rating": round(average_rating, 2)
    }


@router.post("/signals/generate")
async def trigger_signal_generation(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(authenticate_request)
):
    """Trigger signal generation (admin only)"""
    
    # Check if user has admin permissions
    # In production, this would check user roles
    if not current_user.email.endswith("@treum.in"):  # Mock admin check
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Add signal generation to background tasks
    background_tasks.add_task(signal_service.run_signal_generation_cycle)
    
    return {
        "success": True,
        "message": "Signal generation triggered successfully"
    }


@router.get("/signals/providers")
async def get_signal_providers(
    current_user: User = Depends(authenticate_request),
    db: Session = Depends(get_db)
):
    """Get list of signal providers and their performance"""
    
    providers = db.query(SignalProvider).filter(
        SignalProvider.is_active == True
    ).all()
    
    provider_data = []
    for provider in providers:
        provider_data.append({
            "id": str(provider.id),
            "name": provider.name,
            "description": provider.description,
            "provider_type": provider.provider_type,
            "accuracy_score": float(provider.accuracy_score),
            "total_signals": provider.total_signals,
            "successful_signals": provider.successful_signals,
            "success_rate": provider.success_rate,
            "model_version": provider.model_version
        })
    
    return provider_data