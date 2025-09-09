"""
API v1 router
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, content, market_data, social_media

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(market_data.router, prefix="/market", tags=["market-data"])
api_router.include_router(social_media.router, prefix="/social", tags=["social-media"])