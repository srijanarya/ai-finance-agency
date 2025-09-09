"""
Authentication API endpoints for AI Finance Agency
Provides REST API for user registration, login, and email verification
"""

import uuid
from typing import Optional, Dict, Any
import logging
from datetime import datetime

from fastapi import APIRouter, HTTPException, Request, status, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field, validator

from services.auth_service import AuthService
from services.jwt_service import JWTService
from database.models.auth_models import UserRole
from database import get_db_session

logger = logging.getLogger(__name__)

# Create router
auth_router = APIRouter(prefix="/auth", tags=["authentication"])

# Initialize services
auth_service = AuthService()
jwt_service = JWTService()


# Pydantic models for request/response validation
class UserRegistrationRequest(BaseModel):
    """User registration request model"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, max_length=128, description="User password")
    first_name: str = Field(..., min_length=1, max_length=50, description="User's first name")
    last_name: str = Field(..., min_length=1, max_length=50, description="User's last name")
    tenant_id: Optional[str] = Field(None, description="Tenant ID (optional)")
    
    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty or just whitespace')
        return v.strip()
    
    class Config:
        schema_extra = {
            "example": {
                "email": "john.doe@example.com",
                "password": "SecurePass123!",
                "first_name": "John",
                "last_name": "Doe",
                "tenant_id": None
            }
        }


class EmailVerificationRequest(BaseModel):
    """Email verification request model"""
    token: str = Field(..., description="Email verification token")
    
    class Config:
        schema_extra = {
            "example": {
                "token": "abc123def456ghi789jkl012mno345pqr678stu"
            }
        }


class ResendVerificationRequest(BaseModel):
    """Resend verification email request model"""
    email: EmailStr = Field(..., description="User email address")
    tenant_id: Optional[str] = Field(None, description="Tenant ID (optional)")
    
    class Config:
        schema_extra = {
            "example": {
                "email": "john.doe@example.com",
                "tenant_id": None
            }
        }


class UserRegistrationResponse(BaseModel):
    """User registration response model"""
    success: bool = Field(..., description="Registration success status")
    message: str = Field(..., description="Response message")
    user_id: Optional[str] = Field(None, description="Created user ID")
    email: Optional[str] = Field(None, description="User email")
    status: Optional[str] = Field(None, description="User status")
    verification_required: Optional[bool] = Field(None, description="Email verification required")
    verification_email_sent: Optional[bool] = Field(None, description="Verification email sent status")


class StandardResponse(BaseModel):
    """Standard API response model"""
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[Dict[str, Any]] = Field(None, description="Additional response data")
    errors: Optional[list] = Field(None, description="Validation errors if any")


class LoginRequest(BaseModel):
    """User login request model"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=1, max_length=128, description="User password")
    remember_me: Optional[bool] = Field(False, description="Extended session duration")
    
    class Config:
        schema_extra = {
            "example": {
                "email": "john.doe@example.com",
                "password": "SecurePass123!",
                "remember_me": False
            }
        }


class LoginResponse(BaseModel):
    """User login response model"""
    success: bool = Field(..., description="Login success status")
    message: str = Field(..., description="Response message")
    access_token: Optional[str] = Field(None, description="JWT access token")
    refresh_token: Optional[str] = Field(None, description="JWT refresh token")
    token_type: Optional[str] = Field(None, description="Token type (Bearer)")
    expires_in: Optional[int] = Field(None, description="Access token expiration time in seconds")
    refresh_expires_in: Optional[int] = Field(None, description="Refresh token expiration time in seconds")
    user: Optional[Dict[str, Any]] = Field(None, description="User information")


class TokenRefreshRequest(BaseModel):
    """Token refresh request model"""
    refresh_token: str = Field(..., description="JWT refresh token")
    
    class Config:
        schema_extra = {
            "example": {
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }


class TokenRefreshResponse(BaseModel):
    """Token refresh response model"""
    success: bool = Field(..., description="Refresh success status")
    message: str = Field(..., description="Response message")
    access_token: Optional[str] = Field(None, description="New JWT access token")
    refresh_token: Optional[str] = Field(None, description="New JWT refresh token")
    token_type: Optional[str] = Field(None, description="Token type (Bearer)")
    expires_in: Optional[int] = Field(None, description="Access token expiration time in seconds")
    refresh_expires_in: Optional[int] = Field(None, description="Refresh token expiration time in seconds")


class LogoutRequest(BaseModel):
    """Logout request model"""
    session_id: Optional[str] = Field(None, description="Session ID to logout (optional - will logout current session if not provided)")
    logout_all: Optional[bool] = Field(False, description="Logout from all sessions")
    
    class Config:
        schema_extra = {
            "example": {
                "session_id": None,
                "logout_all": False
            }
        }


# Helper functions
def get_client_ip(request: Request) -> str:
    """Get client IP address from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    return request.client.host if request.client else "unknown"


def get_user_agent(request: Request) -> str:
    """Get user agent from request"""
    return request.headers.get("User-Agent", "unknown")


# API Endpoints
@auth_router.post(
    "/register",
    response_model=UserRegistrationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user account",
    description="Register a new user account with email verification"
)
async def register_user(
    user_data: UserRegistrationRequest,
    request: Request
) -> UserRegistrationResponse:
    """
    Register a new user account
    
    This endpoint creates a new user account and sends an email verification.
    The user account will be in PENDING status until email is verified.
    
    **Requirements:**
    - Valid email address
    - Password with minimum 8 characters, containing uppercase, lowercase, number, and special character
    - First and last name (1-50 characters each)
    
    **Process:**
    1. Validates input data
    2. Checks if user already exists
    3. Creates user account with hashed password
    4. Sends verification email
    5. Returns registration result
    """
    try:
        # Get client information
        ip_address = get_client_ip(request)
        user_agent = get_user_agent(request)
        
        # Parse tenant_id if provided
        tenant_id = None
        if user_data.tenant_id:
            try:
                tenant_id = uuid.UUID(user_data.tenant_id)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid tenant ID format"
                )
        
        # Register user
        success, result = auth_service.register_user(
            email=user_data.email,
            password=user_data.password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            tenant_id=tenant_id,
            role=UserRole.USER,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        if success:
            logger.info(f"User registration successful: {user_data.email} from {ip_address}")
            return UserRegistrationResponse(
                success=True,
                message=result['message'],
                user_id=result['user_id'],
                email=result['email'],
                status=result['status'],
                verification_required=result['verification_required'],
                verification_email_sent=result['verification_email_sent']
            )
        else:
            # Handle specific error cases
            if result['error'] == 'validation_failed':
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "message": result['message'],
                        "errors": result['details']
                    }
                )
            elif result['error'] == 'user_exists':
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=result['message']
                )
            else:
                logger.error(f"Registration failed for {user_data.email}: {result}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Registration failed due to internal error"
                )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in user registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration"
        )


@auth_router.post(
    "/verify-email",
    response_model=StandardResponse,
    summary="Verify user email address",
    description="Verify user email address using verification token"
)
async def verify_email(
    verification_data: EmailVerificationRequest,
    request: Request
) -> StandardResponse:
    """
    Verify user email address
    
    This endpoint verifies a user's email address using the token sent via email.
    Upon successful verification, the user account is activated.
    
    **Process:**
    1. Validates the verification token
    2. Checks if token is not expired (24 hours)
    3. Activates the user account
    4. Optionally sends welcome email
    """
    try:
        ip_address = get_client_ip(request)
        
        # Verify email
        success, result = auth_service.verify_email(
            token=verification_data.token,
            ip_address=ip_address
        )
        
        if success:
            logger.info(f"Email verification successful: {result['email']} from {ip_address}")
            return StandardResponse(
                success=True,
                message=result['message'],
                data={
                    'user_id': result['user_id'],
                    'email': result['email'],
                    'status': result['status']
                }
            )
        else:
            if result['error'] == 'invalid_token':
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=result['message']
                )
            elif result['error'] == 'token_expired':
                raise HTTPException(
                    status_code=status.HTTP_410_GONE,
                    detail=result['message']
                )
            else:
                logger.error(f"Email verification failed: {result}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Email verification failed due to internal error"
                )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in email verification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during email verification"
        )


@auth_router.post(
    "/resend-verification",
    response_model=StandardResponse,
    summary="Resend email verification",
    description="Resend email verification for unverified user"
)
async def resend_verification_email(
    resend_data: ResendVerificationRequest,
    request: Request
) -> StandardResponse:
    """
    Resend email verification
    
    This endpoint resends the email verification for users who haven't verified
    their email address yet. A new verification token is generated.
    
    **Requirements:**
    - User must exist and be unverified
    - Email address must match an existing unverified user
    """
    try:
        ip_address = get_client_ip(request)
        
        # Parse tenant_id if provided
        tenant_id = None
        if resend_data.tenant_id:
            try:
                tenant_id = uuid.UUID(resend_data.tenant_id)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid tenant ID format"
                )
        
        # Resend verification email
        success, result = auth_service.resend_verification_email(
            email=resend_data.email,
            tenant_id=tenant_id,
            ip_address=ip_address
        )
        
        if success:
            logger.info(f"Verification email resent: {resend_data.email} from {ip_address}")
            return StandardResponse(
                success=True,
                message=result['message'],
                data={
                    'email': result['email'],
                    'verification_email_sent': result['verification_email_sent']
                }
            )
        else:
            if result['error'] == 'user_not_found':
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=result['message']
                )
            else:
                logger.error(f"Resend verification failed: {result}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to resend verification email"
                )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in resend verification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while resending verification email"
        )


@auth_router.post(
    "/login",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="User login with email and password",
    description="Authenticate user and return JWT tokens"
)
async def login_user(
    login_data: LoginRequest,
    request: Request
) -> LoginResponse:
    """
    User login endpoint
    
    This endpoint authenticates a user with email and password and returns JWT tokens.
    
    **Requirements:**
    - Valid email address
    - Correct password
    - User account must be active and email verified
    
    **Process:**
    1. Validates credentials
    2. Checks user status
    3. Generates JWT access and refresh tokens
    4. Creates user session
    5. Returns tokens and user info
    """
    try:
        # Get client information
        client_ip = get_client_ip(request)
        user_agent = get_user_agent(request)
        
        # First we need to authenticate the user using AuthService
        # For now, we'll implement a simple credential check
        with get_db_session() as session:
            from database.models.auth_models import User, UserStatus
            from services.auth_service import AuthService
            
            auth_service_instance = AuthService()
            
            # Find user
            user = session.query(User).filter(
                User.email == login_data.email.lower(),
                User.is_active == True
            ).first()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            
            # Verify password
            if not auth_service_instance._verify_password(login_data.password, user.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            
            # Check user status
            if user.status != UserStatus.ACTIVE:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account is not active. Please verify your email or contact support."
                )
            
            if not user.email_verified:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Email not verified. Please check your inbox and verify your email address."
                )
            
            # Generate JWT tokens
            success, result = jwt_service.generate_tokens(
                user=user,
                ip_address=client_ip,
                user_agent=user_agent
            )
            
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=result.get('message', 'Failed to generate authentication tokens')
                )
            
            return LoginResponse(
                success=True,
                message="Login successful",
                access_token=result['access_token'],
                refresh_token=result['refresh_token'],
                token_type=result['token_type'],
                expires_in=result['expires_in'],
                refresh_expires_in=result['refresh_expires_in'],
                user=result['user']
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login"
        )


@auth_router.post(
    "/refresh",
    response_model=TokenRefreshResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh JWT tokens",
    description="Generate new JWT tokens using refresh token"
)
async def refresh_tokens(
    refresh_data: TokenRefreshRequest,
    request: Request
) -> TokenRefreshResponse:
    """
    Token refresh endpoint
    
    This endpoint generates new JWT access and refresh tokens using a valid refresh token.
    
    **Requirements:**
    - Valid, non-expired refresh token
    - Active user session
    
    **Process:**
    1. Validates refresh token
    2. Checks session status
    3. Generates new tokens
    4. Invalidates old session
    5. Returns new tokens
    """
    try:
        # Get client information
        client_ip = get_client_ip(request)
        user_agent = get_user_agent(request)
        
        # Refresh tokens
        success, result = jwt_service.refresh_tokens(
            refresh_token=refresh_data.refresh_token,
            ip_address=client_ip,
            user_agent=user_agent
        )
        
        if not success:
            error_type = result.get('error', 'unknown_error')
            
            if error_type in ['refresh_token_expired', 'invalid_refresh_token', 'session_expired']:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=result.get('message', 'Invalid or expired refresh token')
                )
            elif error_type == 'user_inactive':
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=result.get('message', 'User account is not active')
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=result.get('message', 'Failed to refresh tokens')
                )
        
        return TokenRefreshResponse(
            success=True,
            message="Tokens refreshed successfully",
            access_token=result['access_token'],
            refresh_token=result['refresh_token'],
            token_type=result['token_type'],
            expires_in=result['expires_in'],
            refresh_expires_in=result['refresh_expires_in']
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during token refresh: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during token refresh"
        )


@auth_router.post(
    "/logout",
    response_model=StandardResponse,
    status_code=status.HTTP_200_OK,
    summary="User logout",
    description="Logout user and revoke JWT tokens"
)
async def logout_user(
    logout_data: LogoutRequest,
    request: Request
) -> StandardResponse:
    """
    User logout endpoint
    
    This endpoint logs out a user by revoking their JWT tokens.
    
    **Options:**
    - Logout current session (default)
    - Logout specific session (provide session_id)
    - Logout all sessions (set logout_all=true)
    
    **Process:**
    1. Validates authorization token (if provided)
    2. Revokes specified session(s)
    3. Creates audit log
    4. Returns success status
    """
    try:
        # Get client information
        client_ip = get_client_ip(request)
        
        current_user_id = None
        current_session_id = None
        
        # Try to get current user info from token
        authorization = request.headers.get("Authorization")
        if authorization and authorization.startswith("Bearer "):
            token = authorization[7:]  # Remove "Bearer " prefix
            valid, token_info = jwt_service.validate_access_token(token)
            if valid:
                current_user_id = token_info.get('user_id')
                current_session_id = token_info.get('session_id')
        
        if logout_data.logout_all and current_user_id:
            # Logout from all sessions
            success, result = jwt_service.revoke_all_user_tokens(
                user_id=current_user_id,
                ip_address=client_ip
            )
            
            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=result.get('message', 'Failed to logout from all sessions')
                )
            
            return StandardResponse(
                success=True,
                message=result.get('message', 'Logged out from all sessions'),
                data={'revoked_count': result.get('revoked_count', 0)}
            )
        
        else:
            # Logout from specific or current session
            session_id = logout_data.session_id or current_session_id
            
            if not session_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No session to logout. Provide session_id or include Authorization header."
                )
            
            success, result = jwt_service.revoke_token(
                session_id=session_id,
                user_id=current_user_id,
                ip_address=client_ip
            )
            
            if not success:
                error_type = result.get('error', 'unknown_error')
                
                if error_type == 'session_not_found':
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=result.get('message', 'Session not found')
                    )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=result.get('message', 'Failed to logout')
                    )
            
            return StandardResponse(
                success=True,
                message=result.get('message', 'Logout successful')
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during logout: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during logout"
        )


@auth_router.get(
    "/health",
    response_model=StandardResponse,
    summary="Authentication service health check",
    description="Check if authentication service is healthy"
)
async def health_check():
    """
    Authentication service health check
    
    Returns the health status of the authentication service and its dependencies.
    """
    try:
        # Basic health check - could be expanded to check database, email service, etc.
        return StandardResponse(
            success=True,
            message="Authentication service is healthy",
            data={
                "timestamp": datetime.utcnow().isoformat(),
                "service": "authentication",
                "version": "1.0.0"
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is not healthy"
        )