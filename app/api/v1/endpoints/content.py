"""
Content management endpoints
AI content generation and management
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import time

from app.core.security import security_scheme, authenticate_request
from app.core.config import get_settings

router = APIRouter()


class ContentRequest(BaseModel):
    """Content generation request model"""
    topic: str
    content_type: str = "social_post"  # social_post, blog_article, newsletter
    platform: Optional[str] = None  # linkedin, twitter, telegram
    max_length: Optional[int] = None
    tone: Optional[str] = "professional"  # professional, casual, technical
    include_hashtags: bool = True
    compliance_check: bool = True


class ContentResponse(BaseModel):
    """Content generation response model"""
    content_id: str
    content: str
    content_type: str
    platform: Optional[str]
    metadata: dict
    compliance_status: str
    created_at: float


class ContentListResponse(BaseModel):
    """Content list response model"""
    contents: List[ContentResponse]
    total: int
    page: int
    per_page: int


@router.post("/generate", response_model=ContentResponse)
async def generate_content(
    content_request: ContentRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Generate AI content based on request parameters
    """
    auth_info = authenticate_request(credentials)
    settings = get_settings()
    
    # Check if AI generation is enabled
    if not settings.enable_ai_generation:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI content generation is currently disabled"
        )
    
    # Check if any AI service is available
    if not settings.has_ai_service():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No AI services are configured"
        )
    
    try:
        # In production, this would integrate with actual AI services
        # For now, returning mock response
        content_id = f"content_{int(time.time() * 1000)}"
        
        # Mock content generation based on request
        mock_content = generate_mock_content(content_request)
        
        # Mock compliance check
        compliance_status = "approved" if settings.enable_compliance_check else "pending"
        
        return {
            "content_id": content_id,
            "content": mock_content,
            "content_type": content_request.content_type,
            "platform": content_request.platform,
            "metadata": {
                "topic": content_request.topic,
                "tone": content_request.tone,
                "length": len(mock_content),
                "generated_by": "mock_ai",
                "user": auth_info.get("sub")
            },
            "compliance_status": compliance_status,
            "created_at": time.time()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Content generation failed: {str(e)}"
        )


@router.get("/", response_model=ContentListResponse)
async def list_content(
    page: int = 1,
    per_page: int = 10,
    content_type: Optional[str] = None,
    platform: Optional[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    List generated content with pagination and filtering
    """
    auth_info = authenticate_request(credentials)
    
    # In production, this would query the database
    # For now, returning mock data
    mock_contents = []
    for i in range(per_page):
        content_id = f"content_{i + (page - 1) * per_page}"
        mock_contents.append({
            "content_id": content_id,
            "content": f"Mock content {i + 1} for demonstration purposes",
            "content_type": content_type or "social_post",
            "platform": platform or "linkedin",
            "metadata": {
                "topic": f"Topic {i + 1}",
                "tone": "professional",
                "length": 50,
                "generated_by": "mock_ai",
                "user": auth_info.get("sub")
            },
            "compliance_status": "approved",
            "created_at": time.time() - (i * 3600)
        })
    
    return {
        "contents": mock_contents,
        "total": 100,  # Mock total
        "page": page,
        "per_page": per_page
    }


@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Get specific content by ID
    """
    auth_info = authenticate_request(credentials)
    
    # In production, this would query the database
    # For now, returning mock data
    return {
        "content_id": content_id,
        "content": f"Mock content for ID {content_id}",
        "content_type": "social_post",
        "platform": "linkedin",
        "metadata": {
            "topic": "Financial Markets",
            "tone": "professional",
            "length": 150,
            "generated_by": "mock_ai",
            "user": auth_info.get("sub")
        },
        "compliance_status": "approved",
        "created_at": time.time()
    }


@router.delete("/{content_id}")
async def delete_content(
    content_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Delete content by ID
    """
    auth_info = authenticate_request(credentials)
    
    # In production, this would delete from database
    return {
        "message": f"Content {content_id} deleted successfully",
        "deleted_by": auth_info.get("sub"),
        "deleted_at": time.time()
    }


@router.post("/{content_id}/approve")
async def approve_content(
    content_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Approve content for publishing
    """
    auth_info = authenticate_request(credentials)
    
    # Check permissions (in production)
    permissions = auth_info.get("permissions", [])
    if "write" not in permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to approve content"
        )
    
    return {
        "content_id": content_id,
        "status": "approved",
        "approved_by": auth_info.get("sub"),
        "approved_at": time.time()
    }


@router.post("/{content_id}/reject")
async def reject_content(
    content_id: str,
    reason: str,
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
):
    """
    Reject content with reason
    """
    auth_info = authenticate_request(credentials)
    
    # Check permissions (in production)
    permissions = auth_info.get("permissions", [])
    if "write" not in permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to reject content"
        )
    
    return {
        "content_id": content_id,
        "status": "rejected",
        "reason": reason,
        "rejected_by": auth_info.get("sub"),
        "rejected_at": time.time()
    }


def generate_mock_content(request: ContentRequest) -> str:
    """Generate mock content based on request parameters"""
    
    topic = request.topic
    platform = request.platform or "generic"
    tone = request.tone or "professional"
    
    if request.content_type == "social_post":
        if platform == "linkedin":
            content = f"🚀 Insights on {topic}\n\nIn today's dynamic financial landscape, understanding {topic} is crucial for informed decision-making.\n\n"
            if tone == "professional":
                content += f"Key considerations for {topic} include market volatility, regulatory changes, and emerging trends."
            else:
                content += f"Let's dive into what makes {topic} so interesting right now!"
            
            if request.include_hashtags:
                content += f"\n\n#{topic.replace(' ', '')} #Finance #Investment #MarketInsights"
                
        elif platform == "twitter":
            content = f"💡 Quick take on {topic}: Market dynamics are shifting. "
            content += f"Smart investors are paying attention to these trends. "
            if request.include_hashtags:
                content += f"#{topic.replace(' ', '')} #Finance"
                
        else:
            content = f"Understanding {topic} in today's market context. Professional analysis and insights for informed decision-making."
            
    elif request.content_type == "blog_article":
        content = f"# Understanding {topic}: A Comprehensive Analysis\n\n"
        content += f"## Introduction\n\n{topic} has become increasingly important in today's financial landscape.\n\n"
        content += f"## Key Considerations\n\nWhen analyzing {topic}, several factors come into play...\n\n"
        content += f"## Conclusion\n\nStaying informed about {topic} is essential for making sound financial decisions."
        
    else:  # newsletter
        content = f"📈 Weekly Financial Newsletter\n\n"
        content += f"This week's focus: {topic}\n\n"
        content += f"Market Update: Key developments in {topic} sector...\n\n"
        content += f"Expert Analysis: What this means for your portfolio..."
    
    # Apply length limit if specified
    if request.max_length and len(content) > request.max_length:
        content = content[:request.max_length - 3] + "..."
    
    return content