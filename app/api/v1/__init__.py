"""
API v1 router
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, content, market_data, social_media, profile, payments, webhooks, signals, signal_stream, ai_signals, trading, subscriptions, dashboard, compliance

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(profile.router, prefix="/users", tags=["profile", "kyc"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(market_data.router, prefix="/market", tags=["market-data"])
api_router.include_router(social_media.router, prefix="/social", tags=["social-media"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(signals.router, prefix="/signals", tags=["signals"])
api_router.include_router(ai_signals.router, prefix="/ai-signals", tags=["ai-signals"])
api_router.include_router(signal_stream.router, prefix="/stream", tags=["signal-stream"])
api_router.include_router(trading.router, prefix="/trading", tags=["trading"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["subscriptions"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
api_router.include_router(webhooks.router, tags=["webhooks"])