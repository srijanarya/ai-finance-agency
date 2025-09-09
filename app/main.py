"""
FastAPI Main Application
Entry point for the AI Finance Agency microservices platform
"""

from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse
import logging
import time
from contextlib import asynccontextmanager
from typing import Dict, Any

from app.core.config import get_settings
from app.core.database import init_db, get_db
from app.core.security import verify_token
from app.api.v1 import api_router
from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limiting import RateLimitMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    logger.info("🚀 Starting AI Finance Agency API...")
    
    # Initialize database
    try:
        await init_db()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise
    
    yield
    
    logger.info("🔄 Shutting down AI Finance Agency API...")


def create_application() -> FastAPI:
    """Create and configure FastAPI application"""
    settings = get_settings()
    
    app = FastAPI(
        title="AI Finance Agency API",
        description="Microservices platform for AI-powered financial content and agency management",
        version="2.0.0",
        docs_url="/docs" if settings.environment == "development" else None,
        redoc_url="/redoc" if settings.environment == "development" else None,
        openapi_url="/openapi.json" if settings.environment != "production" else None,
        lifespan=lifespan
    )
    
    # Add middleware
    setup_middleware(app, settings)
    
    # Add routers
    app.include_router(api_router, prefix="/api/v1")
    
    # Add health check endpoints
    setup_health_checks(app)
    
    return app


def setup_middleware(app: FastAPI, settings) -> None:
    """Configure application middleware"""
    
    # Trusted Host Middleware (security)
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.allowed_hosts
    )
    
    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )
    
    # Custom Rate Limiting Middleware
    app.add_middleware(RateLimitMiddleware)
    
    # Custom Logging Middleware
    app.add_middleware(LoggingMiddleware)


def setup_health_checks(app: FastAPI) -> None:
    """Setup health check endpoints"""
    
    @app.get("/health")
    async def health_check():
        """Basic health check"""
        return {
            "status": "healthy",
            "timestamp": time.time(),
            "version": "2.0.0",
            "environment": get_settings().environment
        }
    
    @app.get("/health/ready")
    async def readiness_check(db=Depends(get_db)):
        """Readiness check with database connectivity"""
        try:
            # Test database connection
            await db.execute("SELECT 1")
            
            return {
                "status": "ready",
                "timestamp": time.time(),
                "checks": {
                    "database": "healthy"
                }
            }
        except Exception as e:
            logger.error(f"Readiness check failed: {e}")
            raise HTTPException(
                status_code=503,
                detail="Service not ready"
            )
    
    @app.get("/health/live")
    async def liveness_check():
        """Liveness check"""
        return {
            "status": "alive",
            "timestamp": time.time()
        }


# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": time.time(),
            "path": request.url.path
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": time.time(),
            "path": request.url.path
        }
    )


# Create application instance
app = create_application()

if __name__ == "__main__":
    import uvicorn
    
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.api_port,
        reload=settings.environment == "development",
        workers=1 if settings.environment == "development" else 4
    )