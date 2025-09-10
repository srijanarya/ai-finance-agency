"""
WebSocket endpoint for real-time signal streaming
Provides sub-100ms signal delivery for premium users
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
import jwt
import logging

from app.core.database import get_db
from app.core.config import settings
from app.services.signal_distribution_service import distribution_service
from database.models import User

router = APIRouter()
logger = logging.getLogger(__name__)

security = HTTPBearer()


async def get_user_from_websocket_token(token: str, db: Session) -> User:
    """Authenticate user from WebSocket token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
        
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return user
        
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )


def get_user_subscription_tier(user: User) -> str:
    """Get user's subscription tier (mock implementation)"""
    # In production, this would check the user's active subscription
    # For now, return based on email domain or default to basic
    if user.email.endswith("@treum.in"):
        return "elite"
    elif "pro" in user.email.lower():
        return "pro"
    else:
        return "basic"


@router.websocket("/signals/stream")
async def signal_stream_websocket(
    websocket: WebSocket,
    token: str,
    db: Session = Depends(get_db)
):
    """
    WebSocket endpoint for real-time signal streaming
    
    Connect with: ws://localhost:8000/api/v1/signals/stream?token=YOUR_JWT_TOKEN
    
    Real-time signal delivery with tier-based filtering:
    - Basic: Signal alerts without price targets
    - Pro: Signal alerts with entry/exit prices  
    - Elite: Full signal data with technical analysis
    
    Message format:
    {
        "type": "trading_signal",
        "data": {
            "signal_id": "SIG_RELIANCE_20240910_143022",
            "symbol": "RELIANCE",
            "signal_type": "buy",
            "priority": "high",
            "confidence_score": 0.85,
            ...
        },
        "timestamp": "2024-09-10T14:30:22.123Z"
    }
    """
    
    try:
        # Authenticate user
        user = await get_user_from_websocket_token(token, db)
        
        # Get user's subscription tier
        subscription_tier = get_user_subscription_tier(user)
        
        # Establish WebSocket connection
        await distribution_service.handle_websocket_connection(
            websocket, 
            str(user.id), 
            subscription_tier
        )
        
    except HTTPException as e:
        # Send error and close connection
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason=e.detail)
        
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user {user.id if 'user' in locals() else 'unknown'}")
        
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        if websocket.application_state == websocket.client_state:
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR, reason="Internal server error")


@router.get("/signals/stream/stats")
async def get_stream_stats():
    """Get WebSocket streaming statistics (admin only)"""
    return distribution_service.get_distribution_stats()


@router.post("/signals/stream/test")
async def test_signal_distribution(
    test_signal: dict,
    current_user: User = Depends(get_user_from_websocket_token)
):
    """Test signal distribution (admin only)"""
    
    # Check admin permissions
    if not current_user.email.endswith("@treum.in"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    # Simulate signal distribution
    websocket_manager = distribution_service.websocket_manager
    connected_users = set(websocket_manager.active_connections.keys())
    
    if connected_users:
        await websocket_manager.broadcast_signal(test_signal, connected_users)
        return {
            "success": True,
            "message": f"Test signal sent to {len(connected_users)} connected users",
            "users_notified": len(connected_users)
        }
    else:
        return {
            "success": True,
            "message": "No users currently connected",
            "users_notified": 0
        }