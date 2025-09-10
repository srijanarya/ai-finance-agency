"""
Authentication endpoints
JWT token management and user authentication
"""

from datetime import timedelta
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional

from app.core.security import (
    security_scheme, 
    create_access_token, 
    verify_token,
    authenticate_request,
    get_password_hash,
    verify_password
)
from app.core.config import get_settings

router = APIRouter()


class TokenRequest(BaseModel):
    """Token request model"""
    username: str
    password: str


class TokenResponse(BaseModel):
    """Token response model"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenRefreshRequest(BaseModel):
    """Token refresh request model"""
    refresh_token: str


class UserInfo(BaseModel):
    """User information model"""
    username: str
    permissions: list
    created_at: str


@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(token_request: TokenRequest):
    """
    Authenticate user and return access and refresh tokens
    """
    settings = get_settings()
    
    # In production, verify against database
    # For now, using simple hardcoded authentication
    valid_users = {
        "admin": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",  # "admin"
        "user": "$2b$12$ZSU5LjxZkZfQ8KN5JxKpJOq8pNMHQYOl.G5QEGpHNkPYNO4B6YFfW"   # "user"
    }
    
    user_hash = valid_users.get(token_request.username)
    if not user_hash or not verify_password(token_request.password, user_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create tokens
    access_token_expires = timedelta(hours=settings.jwt_expiration_hours)
    access_token = create_access_token(
        data={"sub": token_request.username, "permissions": ["read", "write"]},
        expires_delta=access_token_expires
    )
    
    refresh_token = create_access_token(
        data={"sub": token_request.username, "type": "refresh"},
        expires_delta=timedelta(days=30)
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.jwt_expiration_hours * 3600
    }


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(refresh_request: TokenRefreshRequest):
    """
    Refresh access token using refresh token
    """
    settings = get_settings()
    
    try:
        # Verify refresh token
        payload = verify_token(refresh_request.refresh_token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        username = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Create new access token
        access_token_expires = timedelta(hours=settings.jwt_expiration_hours)
        new_access_token = create_access_token(
            data={"sub": username, "permissions": ["read", "write"]},
            expires_delta=access_token_expires
        )
        
        # Create new refresh token
        new_refresh_token = create_access_token(
            data={"sub": username, "type": "refresh"},
            expires_delta=timedelta(days=30)
        )
        
        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.jwt_expiration_hours * 3600
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.get("/me", response_model=UserInfo)
async def read_users_me(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Get current user information
    """
    try:
        auth_info = authenticate_request(credentials)
        
        return {
            "username": auth_info.get("sub", "unknown"),
            "permissions": auth_info.get("permissions", []),
            "created_at": auth_info.get("iat", "unknown")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )


@router.post("/validate")
async def validate_token(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Validate access token
    """
    try:
        auth_info = authenticate_request(credentials)
        
        return {
            "valid": True,
            "username": auth_info.get("sub"),
            "permissions": auth_info.get("permissions", []),
            "expires": auth_info.get("exp")
        }
        
    except HTTPException as e:
        return {
            "valid": False,
            "error": e.detail
        }


@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Logout user (token blacklisting would be implemented here in production)
    """
    try:
        # In production, add token to blacklist in Redis
        auth_info = authenticate_request(credentials)
        
        return {
            "message": "Successfully logged out",
            "username": auth_info.get("sub")
        }
        
    except HTTPException:
        raise