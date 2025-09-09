"""
Main FastAPI application for AI Finance Agency
Configures and creates the FastAPI app with all routers and middleware
"""

import logging
import time
from contextlib import asynccontextmanager
from typing import Any, Dict

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import uvicorn

from database import init_database, check_database_health
from api.auth import auth_router
from config.enhanced_config import enhanced_config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("🚀 Starting AI Finance Agency API...")
    
    try:
        # Initialize database
        logger.info("Initializing database connections...")
        init_database()
        
        # Check database health
        health = check_database_health()
        if health['healthy']:
            logger.info("✅ Database connection healthy")
        else:
            logger.error(f"❌ Database health check failed: {health.get('error')}")
            
        logger.info("✅ AI Finance Agency API started successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize application: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down AI Finance Agency API...")


def create_app() -> FastAPI:
    """
    Create and configure FastAPI application
    
    Returns:
        Configured FastAPI application instance
    """
    
    # Create FastAPI app
    app = FastAPI(
        title="AI Finance Agency API",
        description="""
        **AI Finance Agency Authentication API**
        
        Comprehensive authentication system for the AI Finance Agency platform.
        
        ## Features
        
        * **User Registration** - Secure user account creation with email verification
        * **Email Verification** - Multi-step email confirmation workflow  
        * **Input Validation** - Comprehensive data validation and sanitization
        * **Security** - bcrypt password hashing, audit logging, rate limiting
        * **Multi-tenant** - Support for multiple organizations
        
        ## Authentication Flow
        
        1. **Register** - Create account with `/auth/register`
        2. **Verify Email** - Confirm email with token from `/auth/verify-email`  
        3. **Login** - Authenticate with credentials *(coming soon)*
        4. **Access Protected Resources** - Use JWT tokens *(coming soon)*
        
        ## Security Features
        
        * Password strength validation
        * Account lockout protection
        * Audit logging for compliance
        * IP address tracking
        * Email verification required
        
        ---
        
        Built with ❤️ using FastAPI, SQLAlchemy, and PostgreSQL.
        """,
        version="1.0.0",
        contact={
            "name": "AI Finance Agency Support",
            "email": "support@ai-finance-agency.com",
        },
        license_info={
            "name": "MIT License",
            "url": "https://opensource.org/licenses/MIT",
        },
        lifespan=lifespan,
        # Custom OpenAPI
        openapi_tags=[
            {
                "name": "authentication",
                "description": "User authentication operations including registration and email verification",
            }
        ]
    )
    
    # Add middleware
    setup_middleware(app)
    
    # Add routers
    from .users import users_router
    app.include_router(auth_router)
    app.include_router(users_router)
    
    # Add exception handlers
    setup_exception_handlers(app)
    
    # Add root endpoint
    @app.get(
        "/",
        summary="API Root",
        description="Get API information and health status"
    )
    async def root():
        """API root endpoint with basic information"""
        return {
            "name": "AI Finance Agency API",
            "version": "1.0.0",
            "description": "Authentication and core services for AI Finance Agency",
            "status": "healthy",
            "docs_url": "/docs",
            "redoc_url": "/redoc",
            "endpoints": {
                "authentication": "/auth",
                "health": "/auth/health"
            }
        }
    
    @app.get(
        "/health",
        summary="System Health Check",
        description="Check overall system health including database connectivity"
    )
    async def system_health():
        """System health check endpoint"""
        try:
            # Check database
            db_health = check_database_health()
            
            # Compile health status
            health_status = {
                "status": "healthy" if db_health['healthy'] else "unhealthy",
                "timestamp": db_health['timestamp'],
                "services": {
                    "api": "healthy",
                    "database": "healthy" if db_health['healthy'] else "unhealthy"
                }
            }
            
            if db_health['healthy']:
                health_status["database_info"] = db_health.get('database_info', {})
            else:
                health_status["errors"] = [db_health.get('error', 'Unknown database error')]
            
            status_code = status.HTTP_200_OK if db_health['healthy'] else status.HTTP_503_SERVICE_UNAVAILABLE
            
            return JSONResponse(
                status_code=status_code,
                content=health_status
            )
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={
                    "status": "unhealthy",
                    "services": {
                        "api": "unhealthy",
                        "database": "unknown"
                    },
                    "errors": [str(e)]
                }
            )
    
    return app


def setup_middleware(app: FastAPI) -> None:
    """Configure application middleware"""
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",  # React dev server
            "http://localhost:8080",  # Local development
            "https://ai-finance-agency.com",  # Production
            "https://*.ai-finance-agency.com",  # Subdomains
        ],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "User-Agent",
            "DNT",
            "Cache-Control",
            "X-Mx-ReqToken",
            "Keep-Alive",
            "X-Requested-With",
        ],
    )
    
    # Gzip compression
    app.add_middleware(
        GZipMiddleware,
        minimum_size=1000
    )
    
    # Request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        """Log all HTTP requests"""
        start_time = time.time()
        
        # Get client IP
        client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
        
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log request
        logger.info(
            f"{request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"IP: {client_ip} - "
            f"Time: {process_time:.3f}s"
        )
        
        # Add processing time header
        response.headers["X-Process-Time"] = str(process_time)
        
        return response


def setup_exception_handlers(app: FastAPI) -> None:
    """Configure application exception handlers"""
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """Handle Pydantic validation errors"""
        errors = []
        for error in exc.errors():
            field = " -> ".join(str(x) for x in error["loc"])
            message = error["msg"]
            errors.append(f"{field}: {message}")
        
        logger.warning(f"Validation error on {request.url.path}: {errors}")
        
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "message": "Validation failed",
                "errors": errors,
                "detail": exc.errors()
            }
        )
    
    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """Handle unexpected exceptions"""
        logger.error(f"Unexpected error on {request.url.path}: {exc}")
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "An unexpected error occurred",
                "error": "internal_server_error"
            }
        )


# Create app instance
app = create_app()


if __name__ == "__main__":
    """Run the application directly"""
    import time
    
    logger.info("🚀 Starting AI Finance Agency API server...")
    
    # Run with uvicorn
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )