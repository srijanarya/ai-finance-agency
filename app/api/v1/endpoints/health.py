"""
Health check endpoints
System status, readiness, and liveness checks
"""

import time
import psutil
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.database import get_db, get_redis, DatabaseManager
from app.core.config import get_settings

router = APIRouter()


@router.get("/")
async def basic_health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "AI Finance Agency API",
        "version": "2.0.0"
    }


@router.get("/detailed")
async def detailed_health_check(
    db: AsyncSession = Depends(get_db)
):
    """Detailed health check with database and service status"""
    settings = get_settings()
    redis_client = await get_redis()
    
    # System information
    system_info = {
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent,
        "uptime": time.time()
    }
    
    # Database health
    db_health = await DatabaseManager.health_check()
    
    # Service configuration status
    service_status = {
        "ai_services": settings.has_ai_service(),
        "social_media": settings.has_social_media_service(),
        "market_data": settings.has_market_data_service(),
        "redis_cache": redis_client is not None,
        "environment": settings.environment,
        "debug": settings.debug
    }
    
    # Overall health status
    overall_healthy = (
        db_health.get("postgresql") == "healthy" and
        system_info["cpu_percent"] < 90 and
        system_info["memory_percent"] < 90 and
        system_info["disk_percent"] < 90
    )
    
    return {
        "status": "healthy" if overall_healthy else "degraded",
        "timestamp": time.time(),
        "system": system_info,
        "databases": db_health,
        "services": service_status,
        "version": "2.0.0",
        "environment": settings.environment
    }


@router.get("/ready")
async def readiness_check(
    db: AsyncSession = Depends(get_db)
):
    """Kubernetes readiness probe endpoint"""
    try:
        # Test database connectivity
        result = await db.execute(text("SELECT 1"))
        assert result.scalar() == 1
        
        # Test basic application functionality
        settings = get_settings()
        
        # Check if critical services are configured
        if not settings.has_ai_service():
            raise HTTPException(
                status_code=503,
                detail="No AI services configured - service not ready"
            )
        
        return {
            "status": "ready",
            "timestamp": time.time(),
            "checks": {
                "database": "healthy",
                "ai_services": "configured",
                "configuration": "valid"
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Service not ready: {str(e)}"
        )


@router.get("/live")
async def liveness_check():
    """Kubernetes liveness probe endpoint"""
    return {
        "status": "alive",
        "timestamp": time.time(),
        "service": "AI Finance Agency API"
    }


@router.get("/startup")
async def startup_check(
    db: AsyncSession = Depends(get_db)
):
    """Kubernetes startup probe endpoint"""
    try:
        # Test database connectivity
        result = await db.execute(text("SELECT 1"))
        assert result.scalar() == 1
        
        return {
            "status": "started",
            "timestamp": time.time(),
            "message": "Application has started successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Application startup incomplete: {str(e)}"
        )


@router.get("/metrics")
async def metrics_endpoint():
    """Basic metrics endpoint for monitoring"""
    try:
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Database connection info
        db_info = await DatabaseManager.get_connection_info()
        
        return {
            "timestamp": time.time(),
            "system": {
                "cpu_usage_percent": cpu_percent,
                "memory_usage_percent": memory.percent,
                "memory_available_gb": memory.available / (1024**3),
                "disk_usage_percent": disk.percent,
                "disk_free_gb": disk.free / (1024**3)
            },
            "database": db_info,
            "version": "2.0.0"
        }
        
    except Exception as e:
        return {
            "timestamp": time.time(),
            "error": str(e),
            "status": "metrics_unavailable"
        }