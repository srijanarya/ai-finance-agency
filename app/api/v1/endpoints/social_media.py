"""
Social media endpoints
Social media posting and management
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List, Dict
import time

from app.core.security import security_scheme, authenticate_request
from app.core.config import get_settings

router = APIRouter()


class PostRequest(BaseModel):
    """Social media post request model"""
    content: str
    platforms: List[str]  # linkedin, twitter, telegram
    schedule_time: Optional[float] = None  # Unix timestamp, None for immediate
    hashtags: Optional[List[str]] = None
    media_urls: Optional[List[str]] = None


class PostResponse(BaseModel):
    """Social media post response model"""
    post_id: str
    content: str
    platforms: List[str]
    status: str  # scheduled, posted, failed
    scheduled_time: Optional[float]
    posted_time: Optional[float]
    platform_results: Dict[str, Dict]
    created_at: float


class PostStatus(BaseModel):
    """Post status model"""
    post_id: str
    platform: str
    status: str
    platform_post_id: Optional[str]
    error_message: Optional[str]
    engagement: Dict[str, int]  # likes, shares, comments
    updated_at: float


@router.post("/post", response_model=PostResponse)
async def create_social_post(
    post_request: PostRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Create and schedule social media posts across platforms
    """
    auth_info = authenticate_request(credentials)
    settings = get_settings()
    
    # Check if social media posting is enabled
    if not settings.enable_auto_posting:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Automatic social media posting is currently disabled"
        )
    
    # Validate platforms
    supported_platforms = []
    if settings.has_social_media_service():
        if settings.linkedin_access_token:
            supported_platforms.append("linkedin")
        if all([settings.twitter_consumer_key, settings.twitter_consumer_secret]):
            supported_platforms.append("twitter")
        if settings.telegram_bot_token:
            supported_platforms.append("telegram")
    
    if not supported_platforms:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No social media platforms are configured"
        )
    
    invalid_platforms = [p for p in post_request.platforms if p not in supported_platforms]
    if invalid_platforms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported platforms: {', '.join(invalid_platforms)}"
        )
    
    try:
        post_id = f"post_{int(time.time() * 1000)}"
        
        # Process post for each platform
        platform_results = {}
        for platform in post_request.platforms:
            if post_request.schedule_time and post_request.schedule_time > time.time():
                # Schedule for later
                platform_results[platform] = {
                    "status": "scheduled",
                    "scheduled_time": post_request.schedule_time,
                    "platform_post_id": None
                }
            else:
                # Post immediately (mock)
                platform_results[platform] = {
                    "status": "posted",
                    "platform_post_id": f"{platform}_{post_id}",
                    "posted_time": time.time()
                }
        
        return {
            "post_id": post_id,
            "content": post_request.content,
            "platforms": post_request.platforms,
            "status": "scheduled" if post_request.schedule_time else "posted",
            "scheduled_time": post_request.schedule_time,
            "posted_time": None if post_request.schedule_time else time.time(),
            "platform_results": platform_results,
            "created_at": time.time()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create social media post: {str(e)}"
        )


@router.get("/posts", response_model=List[PostResponse])
async def list_posts(
    limit: int = 10,
    platform: Optional[str] = None,
    status: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    List social media posts with filtering
    """
    auth_info = authenticate_request(credentials)
    
    # Mock data for demonstration
    posts = []
    for i in range(limit):
        post_id = f"post_{i + 1}"
        platforms = ["linkedin", "twitter"] if not platform else [platform]
        post_status = status if status else ("posted" if i % 3 != 0 else "scheduled")
        
        posts.append({
            "post_id": post_id,
            "content": f"Mock social media post {i + 1} content",
            "platforms": platforms,
            "status": post_status,
            "scheduled_time": time.time() + 3600 if post_status == "scheduled" else None,
            "posted_time": time.time() - (i * 3600) if post_status == "posted" else None,
            "platform_results": {
                platform: {
                    "status": post_status,
                    "platform_post_id": f"{platform}_{post_id}" if post_status == "posted" else None
                } for platform in platforms
            },
            "created_at": time.time() - (i * 3600)
        })
    
    return posts


@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Get specific post details
    """
    auth_info = authenticate_request(credentials)
    
    # Mock post data
    return {
        "post_id": post_id,
        "content": f"Mock content for post {post_id}",
        "platforms": ["linkedin", "twitter"],
        "status": "posted",
        "scheduled_time": None,
        "posted_time": time.time() - 3600,
        "platform_results": {
            "linkedin": {
                "status": "posted",
                "platform_post_id": f"linkedin_{post_id}",
                "posted_time": time.time() - 3600
            },
            "twitter": {
                "status": "posted",
                "platform_post_id": f"twitter_{post_id}",
                "posted_time": time.time() - 3600
            }
        },
        "created_at": time.time() - 3600
    }


@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Delete/cancel a scheduled post
    """
    auth_info = authenticate_request(credentials)
    
    # Check permissions
    permissions = auth_info.get("permissions", [])
    if "write" not in permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to delete posts"
        )
    
    return {
        "post_id": post_id,
        "status": "deleted",
        "deleted_by": auth_info.get("sub"),
        "deleted_at": time.time()
    }


@router.get("/posts/{post_id}/status", response_model=List[PostStatus])
async def get_post_status(
    post_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Get detailed status for all platforms for a specific post
    """
    auth_info = authenticate_request(credentials)
    
    # Mock status data
    platforms = ["linkedin", "twitter", "telegram"]
    statuses = []
    
    for platform in platforms:
        statuses.append({
            "post_id": post_id,
            "platform": platform,
            "status": "posted",
            "platform_post_id": f"{platform}_{post_id}",
            "error_message": None,
            "engagement": {
                "likes": random.randint(10, 100),
                "shares": random.randint(0, 20),
                "comments": random.randint(0, 15)
            },
            "updated_at": time.time()
        })
    
    return statuses


@router.get("/platforms/status")
async def get_platform_status(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Get status of all configured social media platforms
    """
    auth_info = authenticate_request(credentials)
    settings = get_settings()
    
    platform_status = {}
    
    # LinkedIn status
    if settings.linkedin_access_token:
        platform_status["linkedin"] = {
            "configured": True,
            "status": "active",
            "last_post": time.time() - 3600,
            "daily_limit": 20,
            "posts_today": 5
        }
    else:
        platform_status["linkedin"] = {
            "configured": False,
            "status": "not_configured",
            "error": "Access token not available"
        }
    
    # Twitter status
    if all([settings.twitter_consumer_key, settings.twitter_consumer_secret]):
        platform_status["twitter"] = {
            "configured": True,
            "status": "active",
            "last_post": time.time() - 1800,
            "daily_limit": 300,
            "posts_today": 12
        }
    else:
        platform_status["twitter"] = {
            "configured": False,
            "status": "not_configured",
            "error": "API credentials not available"
        }
    
    # Telegram status
    if settings.telegram_bot_token:
        platform_status["telegram"] = {
            "configured": True,
            "status": "active",
            "last_post": time.time() - 900,
            "daily_limit": 100,
            "posts_today": 8
        }
    else:
        platform_status["telegram"] = {
            "configured": False,
            "status": "not_configured",
            "error": "Bot token not available"
        }
    
    return {
        "platforms": platform_status,
        "updated_at": time.time(),
        "auto_posting_enabled": settings.enable_auto_posting
    }


import random  # Add this import at the top