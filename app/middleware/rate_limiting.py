"""
Rate limiting middleware
"""

import time
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable

from app.core.database import get_redis
from app.core.security import rate_limit_manager


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware to implement rate limiting"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for health checks and internal endpoints
        if request.url.path.startswith("/health"):
            return await call_next(request)
        
        # Get client identifier (IP address or user ID from auth)
        client_ip = request.client.host if request.client else "unknown"
        auth_header = request.headers.get("authorization")
        
        # Use authenticated user ID if available, otherwise use IP
        if auth_header and auth_header.startswith("Bearer "):
            try:
                # Extract user info from token (simplified)
                rate_limit_key = f"user_{hash(auth_header)}"
            except:
                rate_limit_key = f"ip_{client_ip}"
        else:
            rate_limit_key = f"ip_{client_ip}"
        
        # Check rate limit
        redis_client = await get_redis()
        is_limited = await rate_limit_manager.is_rate_limited(rate_limit_key, redis_client)
        
        if is_limited:
            # Get remaining time for rate limit reset
            status_info = await rate_limit_manager.get_rate_limit_status(rate_limit_key, redis_client)
            
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Try again later.",
                headers={
                    "Retry-After": str(status_info.get("reset_time", 900)),
                    "X-RateLimit-Limit": "100",
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(time.time() + status_info.get("reset_time", 900))
                }
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers to response
        if redis_client:
            status_info = await rate_limit_manager.get_rate_limit_status(rate_limit_key, redis_client)
            response.headers["X-RateLimit-Limit"] = "100"
            response.headers["X-RateLimit-Remaining"] = str(status_info.get("remaining", 0))
            if status_info.get("reset_time"):
                response.headers["X-RateLimit-Reset"] = str(time.time() + status_info["reset_time"])
        
        return response