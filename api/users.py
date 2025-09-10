"""
User Management API endpoints for AI Finance Agency
Provides protected endpoints demonstrating Role-Based Access Control (RBAC)
"""

import uuid
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime

from fastapi import APIRouter, HTTPException, Request, status, Depends, Query
from pydantic import BaseModel, EmailStr, Field, validator

from services import (
    CurrentUser, 
    get_current_user,
    require_permissions,
    require_roles,
    require_admin_user,
    require_manager_or_admin,
    Permissions
)
from database import get_db_session
from database.models.auth_models import User, UserRole, UserStatus

logger = logging.getLogger(__name__)

# Create router
users_router = APIRouter(prefix="/users", tags=["user-management"])


# Pydantic models for request/response validation
class UserProfileResponse(BaseModel):
    """User profile response model"""
    user_id: str = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    role: str = Field(..., description="User role")
    status: str = Field(..., description="Account status")
    email_verified: bool = Field(..., description="Email verification status")
    tenant_id: str = Field(..., description="Tenant ID")
    created_at: datetime = Field(..., description="Account creation date")
    last_login_at: Optional[datetime] = Field(None, description="Last login timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "a500aa58-0b95-4860-8914-840e4a31ecf7",
                "email": "john.doe@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "role": "user",
                "status": "active",
                "email_verified": True,
                "tenant_id": "8e5b7576-8d92-44dd-86b7-8a6e1821c8e5",
                "created_at": "2025-01-09T10:30:00Z",
                "last_login_at": "2025-01-09T12:00:00Z"
            }
        }


class UserUpdateRequest(BaseModel):
    """User profile update request model"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=50, description="First name")
    last_name: Optional[str] = Field(None, min_length=1, max_length=50, description="Last name")
    preferences: Optional[Dict[str, Any]] = Field(None, description="User preferences")
    
    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Name cannot be empty or just whitespace')
        return v.strip() if v else v
    
    class Config:
        json_schema_extra = {
            "example": {
                "first_name": "John",
                "last_name": "Doe Updated",
                "preferences": {
                    "theme": "dark",
                    "notifications": {
                        "email": True,
                        "browser": False
                    }
                }
            }
        }


class UserListResponse(BaseModel):
    """User list response model"""
    users: List[UserProfileResponse] = Field(..., description="List of users")
    total_count: int = Field(..., description="Total number of users")
    page: int = Field(..., description="Current page")
    per_page: int = Field(..., description="Users per page")


class AdminUserUpdateRequest(BaseModel):
    """Admin user update request model (additional fields for admins)"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    role: Optional[UserRole] = Field(None, description="User role")
    status: Optional[UserStatus] = Field(None, description="User status")
    email_verified: Optional[bool] = Field(None, description="Email verification status")
    preferences: Optional[Dict[str, Any]] = Field(None, description="User preferences")
    
    @validator('first_name', 'last_name')
    def validate_names(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Name cannot be empty or just whitespace')
        return v.strip() if v else v


class StandardResponse(BaseModel):
    """Standard API response model"""
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[Dict[str, Any]] = Field(None, description="Additional response data")


# API Endpoints

@users_router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get current user profile",
    description="Get the profile information of the currently authenticated user"
)
async def get_my_profile(
    current_user: CurrentUser = Depends(get_current_user)
) -> UserProfileResponse:
    """
    Get current user's profile
    
    This endpoint returns the profile information of the currently authenticated user.
    Requires valid JWT authentication token.
    """
    try:
        with get_db_session() as session:
            user = session.query(User).filter(
                User.id == uuid.UUID(current_user.user_id)
            ).first()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            return UserProfileResponse(
                user_id=str(user.id),
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                role=user.role.value,
                status=user.status.value,
                email_verified=user.email_verified,
                tenant_id=str(user.tenant_id),
                created_at=user.created_at,
                last_login_at=user.last_login_at
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile"
        )


@users_router.put(
    "/me",
    response_model=StandardResponse,
    summary="Update current user profile",
    description="Update the profile information of the currently authenticated user"
)
async def update_my_profile(
    update_data: UserUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user)
) -> StandardResponse:
    """
    Update current user's profile
    
    This endpoint allows authenticated users to update their own profile information.
    Users can update their name and preferences.
    """
    try:
        with get_db_session() as session:
            user = session.query(User).filter(
                User.id == uuid.UUID(current_user.user_id)
            ).first()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # Update allowed fields
            if update_data.first_name is not None:
                user.first_name = update_data.first_name
            
            if update_data.last_name is not None:
                user.last_name = update_data.last_name
            
            if update_data.preferences is not None:
                # Merge with existing preferences
                current_preferences = user.preferences or {}
                current_preferences.update(update_data.preferences)
                user.preferences = current_preferences
            
            user.updated_at = datetime.utcnow()
            session.commit()
            
            logger.info(f"Profile updated for user: {user.email} ({user.id})")
            
            return StandardResponse(
                success=True,
                message="Profile updated successfully",
                data={
                    "user_id": str(user.id),
                    "updated_fields": [
                        field for field, value in update_data.dict(exclude_unset=True).items()
                        if value is not None
                    ]
                }
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile"
        )


@users_router.get(
    "/",
    response_model=UserListResponse,
    summary="List all users (Admin/Manager only)",
    description="Get a paginated list of all users. Requires admin or manager role.",
    dependencies=[Depends(require_manager_or_admin)]
)
async def list_users(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Users per page"),
    current_user: CurrentUser = Depends(require_manager_or_admin)
) -> UserListResponse:
    """
    List all users (Admin/Manager access only)
    
    This endpoint returns a paginated list of all users in the system.
    Only administrators and managers can access this endpoint.
    """
    try:
        with get_db_session() as session:
            # Base query
            query = session.query(User)
            
            # If not admin, only show users from same tenant
            if not current_user.has_role("admin"):
                query = query.filter(User.tenant_id == uuid.UUID(current_user.tenant_id))
            
            # Get total count
            total_count = query.count()
            
            # Apply pagination
            offset = (page - 1) * per_page
            users = query.offset(offset).limit(per_page).all()
            
            user_profiles = []
            for user in users:
                user_profiles.append(UserProfileResponse(
                    user_id=str(user.id),
                    email=user.email,
                    first_name=user.first_name,
                    last_name=user.last_name,
                    role=user.role.value,
                    status=user.status.value,
                    email_verified=user.email_verified,
                    tenant_id=str(user.tenant_id),
                    created_at=user.created_at,
                    last_login_at=user.last_login_at
                ))
            
            logger.info(f"User list accessed by: {current_user.email} (role: {current_user.role})")
            
            return UserListResponse(
                users=user_profiles,
                total_count=total_count,
                page=page,
                per_page=per_page
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing users: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user list"
        )


@users_router.get(
    "/{user_id}",
    response_model=UserProfileResponse,
    summary="Get user by ID (Admin/Manager only)",
    description="Get detailed information about a specific user. Requires admin or manager role.",
    dependencies=[Depends(require_manager_or_admin)]
)
async def get_user(
    user_id: str,
    current_user: CurrentUser = Depends(require_manager_or_admin)
) -> UserProfileResponse:
    """
    Get user by ID (Admin/Manager access only)
    
    This endpoint returns detailed information about a specific user.
    Only administrators and managers can access this endpoint.
    """
    try:
        with get_db_session() as session:
            user = session.query(User).filter(User.id == uuid.UUID(user_id)).first()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # If not admin, can only view users from same tenant
            if not current_user.has_role("admin") and str(user.tenant_id) != current_user.tenant_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied to this user"
                )
            
            logger.info(f"User profile accessed: {user.email} by {current_user.email}")
            
            return UserProfileResponse(
                user_id=str(user.id),
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                role=user.role.value,
                status=user.status.value,
                email_verified=user.email_verified,
                tenant_id=str(user.tenant_id),
                created_at=user.created_at,
                last_login_at=user.last_login_at
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user information"
        )


@users_router.put(
    "/{user_id}",
    response_model=StandardResponse,
    summary="Update user by ID (Admin only)",
    description="Update any user's profile information. Requires admin role.",
    dependencies=[Depends(require_admin_user)]
)
async def update_user(
    user_id: str,
    update_data: AdminUserUpdateRequest,
    current_user: CurrentUser = Depends(require_admin_user)
) -> StandardResponse:
    """
    Update user by ID (Admin access only)
    
    This endpoint allows administrators to update any user's profile information,
    including role and status changes.
    """
    try:
        with get_db_session() as session:
            user = session.query(User).filter(User.id == uuid.UUID(user_id)).first()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # Prevent admin from modifying their own role/status to avoid lockout
            if str(user.id) == current_user.user_id:
                if update_data.role is not None or update_data.status is not None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Cannot modify your own role or status"
                    )
            
            updated_fields = []
            
            # Update fields
            if update_data.first_name is not None:
                user.first_name = update_data.first_name
                updated_fields.append("first_name")
            
            if update_data.last_name is not None:
                user.last_name = update_data.last_name
                updated_fields.append("last_name")
            
            if update_data.role is not None:
                user.role = update_data.role
                updated_fields.append("role")
            
            if update_data.status is not None:
                user.status = update_data.status
                updated_fields.append("status")
            
            if update_data.email_verified is not None:
                user.email_verified = update_data.email_verified
                if update_data.email_verified:
                    user.email_verified_at = datetime.utcnow()
                updated_fields.append("email_verified")
            
            if update_data.preferences is not None:
                current_preferences = user.preferences or {}
                current_preferences.update(update_data.preferences)
                user.preferences = current_preferences
                updated_fields.append("preferences")
            
            user.updated_at = datetime.utcnow()
            session.commit()
            
            logger.info(f"User updated by admin: {user.email} by {current_user.email} (fields: {updated_fields})")
            
            return StandardResponse(
                success=True,
                message="User updated successfully",
                data={
                    "user_id": str(user.id),
                    "updated_fields": updated_fields
                }
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )


@users_router.delete(
    "/{user_id}",
    response_model=StandardResponse,
    summary="Delete user by ID (Admin only)",
    description="Soft delete a user account. Requires admin role.",
    dependencies=[Depends(require_admin_user)]
)
async def delete_user(
    user_id: str,
    current_user: CurrentUser = Depends(require_admin_user)
) -> StandardResponse:
    """
    Delete user by ID (Admin access only)
    
    This endpoint performs a soft delete on a user account by deactivating it.
    Only administrators can access this endpoint.
    """
    try:
        with get_db_session() as session:
            user = session.query(User).filter(User.id == uuid.UUID(user_id)).first()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # Prevent admin from deleting themselves
            if str(user.id) == current_user.user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot delete your own account"
                )
            
            # Soft delete - deactivate user
            user.is_active = False
            user.status = UserStatus.INACTIVE
            user.updated_at = datetime.utcnow()
            
            session.commit()
            
            logger.info(f"User deleted by admin: {user.email} by {current_user.email}")
            
            return StandardResponse(
                success=True,
                message="User account deactivated successfully",
                data={
                    "user_id": str(user.id),
                    "email": user.email
                }
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )