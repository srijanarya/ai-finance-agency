"""
Trading API endpoints for Zerodha Kite integration
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.services.zerodha_kite_service import (
    ZerodhaKiteService, 
    KiteCredentials, 
    kite_manager
)
from app.services.portfolio_management_engine import Order, OrderType, OrderStatus

logger = logging.getLogger(__name__)

router = APIRouter()

class KiteAccountRequest(BaseModel):
    """Request model for adding Kite account"""
    api_key: str = Field(..., description="Zerodha API key")
    api_secret: str = Field(..., description="Zerodha API secret")
    request_token: Optional[str] = Field(None, description="Request token from Zerodha login")
    access_token: Optional[str] = Field(None, description="Pre-generated access token")

class PlaceOrderRequest(BaseModel):
    """Request model for placing orders"""
    symbol: str = Field(..., description="Trading symbol (e.g., RELIANCE, NIFTY22OCT17000CE)")
    quantity: int = Field(..., description="Order quantity", gt=0)
    price: float = Field(..., description="Order price", ge=0)
    order_type: str = Field(..., description="Order type: MARKET, LIMIT, SL, SL-M")
    side: str = Field(..., description="Transaction side: BUY or SELL")
    product: str = Field(default="CNC", description="Product type: CNC, MIS, NRML")
    validity: str = Field(default="DAY", description="Order validity: DAY, IOC, GTT")
    disclosed_quantity: int = Field(default=0, description="Disclosed quantity", ge=0)
    trigger_price: float = Field(default=0, description="Trigger price for stop-loss orders", ge=0)
    tag: Optional[str] = Field(None, description="Custom order tag")

class ModifyOrderRequest(BaseModel):
    """Request model for modifying orders"""
    quantity: Optional[int] = Field(None, description="New quantity", gt=0)
    price: Optional[float] = Field(None, description="New price", ge=0)
    order_type: Optional[str] = Field(None, description="New order type")
    trigger_price: Optional[float] = Field(None, description="New trigger price", ge=0)

class OrderResponse(BaseModel):
    """Order response model"""
    order_id: str
    status: str
    message: str

class PositionResponse(BaseModel):
    """Position response model"""
    symbol: str
    quantity: int
    average_price: float
    current_price: float
    pnl: float
    pnl_percentage: float

class MarginResponse(BaseModel):
    """Margin response model"""
    available: float
    utilised: float
    total: float

class HistoricalDataRequest(BaseModel):
    """Request model for historical data"""
    symbol: str = Field(..., description="Trading symbol")
    from_date: datetime = Field(..., description="Start date")
    to_date: datetime = Field(..., description="End date")
    interval: str = Field(default="day", description="Candle interval: minute, 3minute, 5minute, 10minute, 15minute, 30minute, 60minute, day")

@router.post("/accounts/add", response_model=Dict[str, Any])
async def add_kite_account(
    account_request: KiteAccountRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add Zerodha Kite account for trading
    """
    try:
        credentials = KiteCredentials(
            api_key=account_request.api_key,
            api_secret=account_request.api_secret,
            request_token=account_request.request_token,
            access_token=account_request.access_token
        )
        
        success = await kite_manager.add_account(str(current_user.id), credentials)
        
        if success:
            return {
                "status": "success",
                "message": "Kite account added successfully",
                "user_id": str(current_user.id)
            }
        else:
            raise HTTPException(
                status_code=400,
                detail="Failed to initialize Kite account. Check credentials and try again."
            )
            
    except Exception as e:
        logger.error(f"Error adding Kite account for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/accounts/profile")
async def get_account_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get Kite account profile information
    """
    try:
        service = await kite_manager.get_service(str(current_user.id))
        if not service:
            raise HTTPException(
                status_code=404,
                detail="Kite account not found. Please add your account first."
            )
        
        profile = await service.get_profile()
        if not profile:
            raise HTTPException(
                status_code=400,
                detail="Failed to fetch profile information"
            )
        
        return {
            "status": "success",
            "data": profile
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching profile for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/accounts/margins", response_model=Dict[str, Any])
async def get_account_margins(
    current_user: User = Depends(get_current_user)
):
    """
    Get account margin details
    """
    try:
        service = await kite_manager.get_service(str(current_user.id))
        if not service:
            raise HTTPException(
                status_code=404,
                detail="Kite account not found. Please add your account first."
            )
        
        margins = await service.get_margins()
        if margins is None:
            raise HTTPException(
                status_code=400,
                detail="Failed to fetch margin information"
            )
        
        # Format response
        formatted_margins = {
            "equity": {
                "available": margins.get("equity", {}).get("available", {}).get("cash", 0),
                "utilised": margins.get("equity", {}).get("utilised", {}).get("debits", 0),
                "total": margins.get("equity", {}).get("net", 0)
            },
            "commodity": {
                "available": margins.get("commodity", {}).get("available", {}).get("cash", 0),
                "utilised": margins.get("commodity", {}).get("utilised", {}).get("debits", 0),
                "total": margins.get("commodity", {}).get("net", 0)
            }
        }
        
        return {
            "status": "success",
            "data": formatted_margins
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching margins for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/orders/place", response_model=OrderResponse)
async def place_order(
    order_request: PlaceOrderRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Place a new order
    """
    try:
        service = await kite_manager.get_service(str(current_user.id))
        if not service:
            raise HTTPException(
                status_code=404,
                detail="Kite account not found. Please add your account first."
            )
        
        # Map order type
        order_type_mapping = {
            "MARKET": OrderType.MARKET,
            "LIMIT": OrderType.LIMIT,
            "SL": OrderType.STOP_LOSS,
            "SL-M": OrderType.STOP_LOSS_MARKET
        }
        
        order_type = order_type_mapping.get(order_request.order_type.upper())
        if not order_type:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid order type: {order_request.order_type}"
            )
        
        order_id = await service.place_order(
            symbol=order_request.symbol,
            quantity=order_request.quantity if order_request.side.upper() == "BUY" else -order_request.quantity,
            price=order_request.price,
            order_type=order_type,
            side=order_request.side.upper(),
            product=order_request.product,
            validity=order_request.validity,
            disclosed_quantity=order_request.disclosed_quantity,
            trigger_price=order_request.trigger_price,
            tag=order_request.tag
        )
        
        if order_id:
            return OrderResponse(
                order_id=order_id,
                status="success",
                message="Order placed successfully"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Failed to place order. Please check order details."
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error placing order for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.put("/orders/{order_id}/modify", response_model=OrderResponse)
async def modify_order(
    order_id: str,
    modify_request: ModifyOrderRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Modify an existing order
    """
    try:
        service = await kite_manager.get_service(str(current_user.id))
        if not service:
            raise HTTPException(
                status_code=404,
                detail="Kite account not found. Please add your account first."
            )
        
        # Map order type if provided
        order_type = None
        if modify_request.order_type:
            order_type_mapping = {
                "MARKET": OrderType.MARKET,
                "LIMIT": OrderType.LIMIT,
                "SL": OrderType.STOP_LOSS,
                "SL-M": OrderType.STOP_LOSS_MARKET
            }
            order_type = order_type_mapping.get(modify_request.order_type.upper())
            if not order_type:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid order type: {modify_request.order_type}"
                )
        
        success = await service.modify_order(
            order_id=order_id,
            quantity=modify_request.quantity,
            price=modify_request.price,
            order_type=order_type,
            trigger_price=modify_request.trigger_price
        )
        
        if success:
            return OrderResponse(
                order_id=order_id,
                status="success",
                message="Order modified successfully"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Failed to modify order. Order may not exist or cannot be modified."
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error modifying order {order_id} for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.delete("/orders/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Cancel an existing order
    """
    try:
        service = await kite_manager.get_service(str(current_user.id))
        if not service:
            raise HTTPException(
                status_code=404,
                detail="Kite account not found. Please add your account first."
            )
        
        success = await service.cancel_order(order_id)
        
        if success:
            return OrderResponse(
                order_id=order_id,
                status="success",
                message="Order cancelled successfully"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Failed to cancel order. Order may not exist or cannot be cancelled."
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling order {order_id} for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/orders", response_model=Dict[str, Any])
async def get_orders(
    current_user: User = Depends(get_current_user)
):
    """
    Get all orders for the current session
    """
    try:
        service = await kite_manager.get_service(str(current_user.id))
        if not service:
            raise HTTPException(
                status_code=404,
                detail="Kite account not found. Please add your account first."
            )
        
        orders = await service.get_orders()
        
        formatted_orders = []
        for order in orders:
            formatted_orders.append({
                "order_id": order.order_id,
                "tradingsymbol": order.tradingsymbol,
                "quantity": order.quantity,
                "price": order.price,
                "order_type": order.order_type,
                "transaction_type": order.transaction_type,
                "product": order.product,
                "status": order.status,
                "filled_quantity": order.filled_quantity,
                "pending_quantity": order.pending_quantity,
                "average_price": order.average_price,
                "order_timestamp": order.order_timestamp.isoformat()
            })
        
        return {
            "status": "success",
            "data": formatted_orders,
            "count": len(formatted_orders)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching orders for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/positions", response_model=Dict[str, Any])
async def get_positions(
    current_user: User = Depends(get_current_user)
):
    """
    Get current trading positions
    """
    try:
        service = await kite_manager.get_service(str(current_user.id))
        if not service:
            raise HTTPException(
                status_code=404,
                detail="Kite account not found. Please add your account first."
            )
        
        positions = await service.get_positions()
        
        formatted_positions = []
        for position in positions:
            pnl_percentage = (position.pnl / (position.average_price * abs(position.quantity))) * 100 if position.average_price > 0 else 0
            
            formatted_positions.append({
                "symbol": position.symbol,
                "quantity": position.quantity,
                "average_price": position.average_price,
                "current_price": position.current_price,
                "pnl": position.pnl,
                "pnl_percentage": round(pnl_percentage, 2),
                "side": "LONG" if position.quantity > 0 else "SHORT"
            })
        
        # Calculate total P&L
        total_pnl = sum(pos["pnl"] for pos in formatted_positions)
        
        return {
            "status": "success",
            "data": {
                "positions": formatted_positions,
                "total_pnl": round(total_pnl, 2),
                "count": len(formatted_positions)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching positions for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/holdings", response_model=Dict[str, Any])
async def get_holdings(
    current_user: User = Depends(get_current_user)
):
    """
    Get portfolio holdings (long-term investments)
    """
    try:
        service = await kite_manager.get_service(str(current_user.id))
        if not service:
            raise HTTPException(
                status_code=404,
                detail="Kite account not found. Please add your account first."
            )
        
        holdings = await service.get_holdings()
        
        return {
            "status": "success",
            "data": holdings,
            "count": len(holdings)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching holdings for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/ltp", response_model=Dict[str, Any])
async def get_last_traded_price(
    symbols: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get last traded price for symbols (comma-separated)
    """
    try:
        service = await kite_manager.get_service(str(current_user.id))
        if not service:
            raise HTTPException(
                status_code=404,
                detail="Kite account not found. Please add your account first."
            )
        
        symbol_list = [s.strip() for s in symbols.split(",") if s.strip()]
        if not symbol_list:
            raise HTTPException(
                status_code=400,
                detail="No symbols provided"
            )
        
        ltp_data = await service.get_ltp(symbol_list)
        
        return {
            "status": "success",
            "data": ltp_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching LTP for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.post("/historical", response_model=Dict[str, Any])
async def get_historical_data(
    request: HistoricalDataRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Get historical candle data for a symbol
    """
    try:
        service = await kite_manager.get_service(str(current_user.id))
        if not service:
            raise HTTPException(
                status_code=404,
                detail="Kite account not found. Please add your account first."
            )
        
        # Get instrument token for symbol
        if request.symbol not in service.instruments:
            raise HTTPException(
                status_code=400,
                detail=f"Symbol {request.symbol} not found"
            )
        
        instrument_token = service.instruments[request.symbol].instrument_token
        
        candles = await service.get_historical_data(
            instrument_token=instrument_token,
            from_date=request.from_date,
            to_date=request.to_date,
            interval=request.interval
        )
        
        return {
            "status": "success",
            "data": {
                "symbol": request.symbol,
                "interval": request.interval,
                "candles": candles
            },
            "count": len(candles)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching historical data for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/instruments/search")
async def search_instruments(
    query: str,
    exchange: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """
    Search for trading instruments
    """
    try:
        service = await kite_manager.get_service(str(current_user.id))
        if not service:
            raise HTTPException(
                status_code=404,
                detail="Kite account not found. Please add your account first."
            )
        
        query = query.upper()
        results = []
        
        for symbol, instrument in service.instruments.items():
            if query in symbol or query in instrument.name.upper():
                if not exchange or instrument.exchange == exchange.upper():
                    results.append({
                        "symbol": symbol,
                        "name": instrument.name,
                        "exchange": instrument.exchange,
                        "instrument_type": instrument.instrument_type,
                        "segment": instrument.segment,
                        "lot_size": instrument.lot_size,
                        "tick_size": instrument.tick_size
                    })
                    
                    if len(results) >= 50:  # Limit results
                        break
        
        return {
            "status": "success",
            "data": results,
            "count": len(results)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching instruments for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.delete("/accounts/remove")
async def remove_kite_account(
    current_user: User = Depends(get_current_user)
):
    """
    Remove Kite account and close all connections
    """
    try:
        await kite_manager.remove_account(str(current_user.id))
        
        return {
            "status": "success",
            "message": "Kite account removed successfully"
        }
        
    except Exception as e:
        logger.error(f"Error removing Kite account for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

# WebSocket endpoint for real-time data would be implemented separately
# using FastAPI's WebSocket support or a separate WebSocket server