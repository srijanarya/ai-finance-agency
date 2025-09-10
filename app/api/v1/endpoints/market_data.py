"""
Market data endpoints
Financial market data and news aggregation
"""

from fastapi import APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict
import time
import random

from app.core.security import security_scheme, authenticate_request
from app.core.config import get_settings

router = APIRouter()


class StockQuote(BaseModel):
    """Stock quote model"""
    symbol: str
    price: float
    change: float
    change_percent: float
    volume: int
    market_cap: Optional[float]
    updated_at: float


class MarketNews(BaseModel):
    """Market news model"""
    news_id: str
    title: str
    summary: str
    source: str
    url: str
    published_at: float
    sentiment: str  # positive, negative, neutral
    relevance_score: float


class MarketOverview(BaseModel):
    """Market overview model"""
    indices: Dict[str, StockQuote]
    top_movers: Dict[str, List[StockQuote]]
    market_summary: Dict[str, any]
    updated_at: float


@router.get("/quote/{symbol}", response_model=StockQuote)
async def get_stock_quote(
    symbol: str,
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Get real-time stock quote for a symbol
    """
    auth_info = authenticate_request(credentials)
    settings = get_settings()
    
    if not settings.enable_market_data:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Market data service is currently disabled"
        )
    
    if not settings.has_market_data_service():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No market data services are configured"
        )
    
    try:
        # In production, this would call actual market data APIs
        # For now, returning mock data
        mock_quote = generate_mock_quote(symbol.upper())
        return mock_quote
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch quote for {symbol}: {str(e)}"
        )


@router.get("/quotes", response_model=List[StockQuote])
async def get_multiple_quotes(
    symbols: str = Query(..., description="Comma-separated list of symbols"),
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Get quotes for multiple symbols
    """
    auth_info = authenticate_request(credentials)
    settings = get_settings()
    
    if not settings.enable_market_data:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Market data service is currently disabled"
        )
    
    symbol_list = [s.strip().upper() for s in symbols.split(",")]
    if len(symbol_list) > 50:  # Limit batch size
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 50 symbols allowed per request"
        )
    
    try:
        quotes = [generate_mock_quote(symbol) for symbol in symbol_list]
        return quotes
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch quotes: {str(e)}"
        )


@router.get("/overview", response_model=MarketOverview)
async def get_market_overview(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Get market overview with indices and top movers
    """
    auth_info = authenticate_request(credentials)
    settings = get_settings()
    
    if not settings.enable_market_data:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Market data service is currently disabled"
        )
    
    try:
        # Mock market overview data
        indices = {
            "SPY": generate_mock_quote("SPY"),
            "QQQ": generate_mock_quote("QQQ"),
            "DIA": generate_mock_quote("DIA"),
            "NIFTY": generate_mock_quote("NIFTY"),
            "SENSEX": generate_mock_quote("SENSEX")
        }
        
        top_gainers = [
            generate_mock_quote("AAPL", positive_bias=True),
            generate_mock_quote("GOOGL", positive_bias=True),
            generate_mock_quote("MSFT", positive_bias=True)
        ]
        
        top_losers = [
            generate_mock_quote("TSLA", positive_bias=False),
            generate_mock_quote("META", positive_bias=False),
            generate_mock_quote("NFLX", positive_bias=False)
        ]
        
        return {
            "indices": indices,
            "top_movers": {
                "gainers": top_gainers,
                "losers": top_losers
            },
            "market_summary": {
                "market_sentiment": "neutral",
                "volatility_index": random.uniform(15, 25),
                "trading_volume": random.randint(1000000, 5000000),
                "market_status": "open"
            },
            "updated_at": time.time()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch market overview: {str(e)}"
        )


@router.get("/news", response_model=List[MarketNews])
async def get_market_news(
    limit: int = Query(10, description="Number of news items to return", le=50),
    category: Optional[str] = Query(None, description="News category filter"),
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Get latest market news
    """
    auth_info = authenticate_request(credentials)
    settings = get_settings()
    
    if not settings.enable_market_data:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Market data service is currently disabled"
        )
    
    try:
        # Mock news data
        news_items = []
        for i in range(limit):
            news_id = f"news_{int(time.time() * 1000) + i}"
            news_items.append({
                "news_id": news_id,
                "title": f"Market Update {i + 1}: Key Financial Developments",
                "summary": f"Latest analysis on market trends and economic indicators affecting investor sentiment.",
                "source": random.choice(["Reuters", "Bloomberg", "Financial Times", "WSJ"]),
                "url": f"https://example.com/news/{news_id}",
                "published_at": time.time() - (i * 3600),
                "sentiment": random.choice(["positive", "negative", "neutral"]),
                "relevance_score": random.uniform(0.5, 1.0)
            })
        
        return news_items
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch market news: {str(e)}"
        )


@router.get("/sectors")
async def get_sector_performance(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Get sector performance data
    """
    auth_info = authenticate_request(credentials)
    settings = get_settings()
    
    if not settings.enable_market_data:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Market data service is currently disabled"
        )
    
    try:
        # Mock sector data
        sectors = {
            "Technology": {"change_percent": random.uniform(-3, 3), "top_stock": "AAPL"},
            "Healthcare": {"change_percent": random.uniform(-3, 3), "top_stock": "JNJ"},
            "Financial": {"change_percent": random.uniform(-3, 3), "top_stock": "JPM"},
            "Energy": {"change_percent": random.uniform(-3, 3), "top_stock": "XOM"},
            "Consumer": {"change_percent": random.uniform(-3, 3), "top_stock": "AMZN"},
            "Industrial": {"change_percent": random.uniform(-3, 3), "top_stock": "CAT"},
            "Materials": {"change_percent": random.uniform(-3, 3), "top_stock": "FCX"},
            "Utilities": {"change_percent": random.uniform(-3, 3), "top_stock": "NEE"}
        }
        
        return {
            "sectors": sectors,
            "updated_at": time.time(),
            "market_date": time.strftime("%Y-%m-%d")
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch sector data: {str(e)}"
        )


def generate_mock_quote(symbol: str, positive_bias: Optional[bool] = None) -> StockQuote:
    """Generate mock stock quote data"""
    
    # Base prices for common symbols
    base_prices = {
        "AAPL": 175.0, "GOOGL": 135.0, "MSFT": 380.0, "TSLA": 220.0, "META": 320.0,
        "AMZN": 140.0, "NFLX": 450.0, "SPY": 450.0, "QQQ": 380.0, "DIA": 350.0,
        "NIFTY": 19500.0, "SENSEX": 65000.0, "JPM": 150.0, "JNJ": 160.0
    }
    
    base_price = base_prices.get(symbol, random.uniform(50, 200))
    
    # Generate price movement
    if positive_bias is True:
        change_percent = random.uniform(1.0, 5.0)
    elif positive_bias is False:
        change_percent = random.uniform(-5.0, -1.0)
    else:
        change_percent = random.uniform(-3.0, 3.0)
    
    change = base_price * (change_percent / 100)
    current_price = base_price + change
    
    return StockQuote(
        symbol=symbol,
        price=round(current_price, 2),
        change=round(change, 2),
        change_percent=round(change_percent, 2),
        volume=random.randint(1000000, 50000000),
        market_cap=random.randint(10000000000, 1000000000000) if random.choice([True, False]) else None,
        updated_at=time.time()
    )