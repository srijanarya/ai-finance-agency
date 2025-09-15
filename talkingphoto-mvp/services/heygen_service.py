"""
TalkingPhoto AI MVP - HeyGen Premium Service Integration
Professional AI avatar video generation with HeyGen API
Premium tier: $29/month subscription with professional avatars
"""

import requests
import base64
import json
import time
import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import structlog
from flask import current_app
from redis import Redis
import os

logger = structlog.get_logger()


class HeyGenAvatarType(Enum):
    """HeyGen avatar categories"""
    BUSINESS_PROFESSIONAL = 'business_professional'
    EDUCATOR = 'educator'
    PRESENTER = 'presenter'
    CASUAL = 'casual'
    CUSTOM = 'custom'


class HeyGenVideoQuality(Enum):
    """HeyGen video quality options"""
    HD_720P = '720p'
    FULL_HD_1080P = '1080p'
    UHD_4K = '4k'


class HeyGenLanguage(Enum):
    """HeyGen supported languages"""
    ENGLISH = 'en'
    HINDI = 'hi'
    SPANISH = 'es'
    FRENCH = 'fr'
    GERMAN = 'de'
    CHINESE = 'zh'
    JAPANESE = 'ja'


@dataclass
class HeyGenAvatar:
    """HeyGen avatar configuration"""
    avatar_id: str
    name: str
    type: HeyGenAvatarType
    gender: str
    age_range: str
    ethnicity: str
    description: str
    preview_image_url: str
    is_premium: bool = True
    languages: List[HeyGenLanguage] = None


@dataclass
class HeyGenGenerationRequest:
    """HeyGen video generation request"""
    avatar_id: str
    text: str
    voice_id: str
    quality: HeyGenVideoQuality
    background: Optional[str] = None
    language: HeyGenLanguage = HeyGenLanguage.ENGLISH
    emotion: str = 'neutral'
    speed: float = 1.0
    custom_avatar_image: Optional[str] = None  # For custom avatar creation


class HeyGenService:
    """
    HeyGen Premium Service Integration
    Professional AI avatar video generation for premium subscribers
    """
    
    def __init__(self):
        self.api_key = current_app.config.get('HEYGEN_API_KEY')
        self.api_url = current_app.config.get('HEYGEN_API_URL', 'https://api.heygen.com/v1')
        
        if not self.api_key:
            raise ValueError("HeyGen API key not configured")
        
        self.redis_client = Redis(
            host=current_app.config.get('REDIS_HOST', 'localhost'),
            port=current_app.config.get('REDIS_PORT', 6379),
            decode_responses=True
        )
        
        # Premium avatar library
        self.premium_avatars = self._load_premium_avatars()
        
        # Subscription tracking
        self.subscription_cache = {}
    
    def _load_premium_avatars(self) -> Dict[str, HeyGenAvatar]:
        """Load HeyGen premium avatar library"""
        return {
            'anna_business': HeyGenAvatar(
                avatar_id='heygen_anna_business_001',
                name='Anna - Business Professional',
                type=HeyGenAvatarType.BUSINESS_PROFESSIONAL,
                gender='female',
                age_range='25-35',
                ethnicity='caucasian',
                description='Professional business executive, perfect for corporate presentations',
                preview_image_url='https://cdn.heygen.com/avatars/anna_business_preview.jpg',
                languages=[HeyGenLanguage.ENGLISH, HeyGenLanguage.SPANISH]
            ),
            'raj_educator': HeyGenAvatar(
                avatar_id='heygen_raj_educator_002',
                name='Raj - Professional Educator',
                type=HeyGenAvatarType.EDUCATOR,
                gender='male',
                age_range='30-40',
                ethnicity='indian',
                description='Experienced educator, ideal for training and educational content',
                preview_image_url='https://cdn.heygen.com/avatars/raj_educator_preview.jpg',
                languages=[HeyGenLanguage.ENGLISH, HeyGenLanguage.HINDI]
            ),
            'sarah_presenter': HeyGenAvatar(
                avatar_id='heygen_sarah_presenter_003',
                name='Sarah - TV Presenter',
                type=HeyGenAvatarType.PRESENTER,
                gender='female',
                age_range='28-38',
                ethnicity='mixed',
                description='Television presenter style, perfect for news and announcements',
                preview_image_url='https://cdn.heygen.com/avatars/sarah_presenter_preview.jpg',
                languages=[HeyGenLanguage.ENGLISH, HeyGenLanguage.FRENCH]
            ),
            'marcus_casual': HeyGenAvatar(
                avatar_id='heygen_marcus_casual_004',
                name='Marcus - Casual Friendly',
                type=HeyGenAvatarType.CASUAL,
                gender='male',
                age_range='25-35',
                ethnicity='african',
                description='Friendly and approachable, great for social media content',
                preview_image_url='https://cdn.heygen.com/avatars/marcus_casual_preview.jpg',
                languages=[HeyGenLanguage.ENGLISH]
            ),
            'li_professional': HeyGenAvatar(
                avatar_id='heygen_li_professional_005',
                name='Li - Tech Professional',
                type=HeyGenAvatarType.BUSINESS_PROFESSIONAL,
                gender='female',
                age_range='26-36',
                ethnicity='asian',
                description='Technology professional, ideal for tech demos and tutorials',
                preview_image_url='https://cdn.heygen.com/avatars/li_professional_preview.jpg',
                languages=[HeyGenLanguage.ENGLISH, HeyGenLanguage.CHINESE]
            ),
            'custom_avatar': HeyGenAvatar(
                avatar_id='heygen_custom_upload',
                name='Custom Avatar (Upload Your Photo)',
                type=HeyGenAvatarType.CUSTOM,
                gender='any',
                age_range='any',
                ethnicity='any',
                description='Upload your own photo to create a custom AI avatar',
                preview_image_url='https://cdn.heygen.com/avatars/custom_upload_preview.jpg',
                languages=list(HeyGenLanguage)
            )
        }
    
    async def check_premium_access(self, user_email: str) -> bool:
        """Check if user has premium subscription access"""
        try:
            # Check Redis cache first
            cache_key = f"premium_access:{user_email}"
            cached_result = self.redis_client.get(cache_key)
            
            if cached_result is not None:
                return json.loads(cached_result)
            
            # Check database for premium subscription
            from services.payment_service import payment_service
            user_info = payment_service.get_user_info(user_email)
            
            if not user_info:
                return False
            
            # Premium tiers: PRO and ENTERPRISE get HeyGen access
            premium_tiers = ['pro', 'enterprise', 'heygen_premium']
            has_premium = user_info.get('subscription_tier') in premium_tiers
            
            # Cache result for 5 minutes
            self.redis_client.setex(cache_key, 300, json.dumps(has_premium))
            
            return has_premium
            
        except Exception as e:
            logger.error("Failed to check premium access", error=str(e), user=user_email)
            return False
    
    async def get_available_avatars(self, user_email: str) -> List[HeyGenAvatar]:
        """Get available avatars for user based on subscription"""
        has_premium = await self.check_premium_access(user_email)
        
        if not has_premium:
            return []  # No HeyGen avatars for non-premium users
        
        return list(self.premium_avatars.values())
    
    async def create_custom_avatar(self, user_email: str, image_data: bytes, 
                                  avatar_name: str) -> Dict[str, Any]:
        """Create custom avatar from user photo"""
        try:
            # Verify premium access
            if not await self.check_premium_access(user_email):
                return {
                    'success': False,
                    'error': 'Premium subscription required for custom avatars'
                }
            
            # Prepare image for HeyGen
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            payload = {
                'image': f"data:image/jpeg;base64,{image_base64}",
                'name': avatar_name,
                'quality': 'high',
                'style': 'professional'
            }
            
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(
                f"{self.api_url}/avatars/create",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 201:
                avatar_data = response.json()
                
                # Store custom avatar info
                custom_avatar = HeyGenAvatar(
                    avatar_id=avatar_data['avatar_id'],
                    name=avatar_name,
                    type=HeyGenAvatarType.CUSTOM,
                    gender='custom',
                    age_range='custom',
                    ethnicity='custom',
                    description=f'Custom avatar: {avatar_name}',
                    preview_image_url=avatar_data.get('preview_url', ''),
                    languages=[HeyGenLanguage.ENGLISH]  # Default language
                )
                
                # Cache custom avatar
                cache_key = f"custom_avatar:{user_email}:{avatar_data['avatar_id']}"
                self.redis_client.setex(
                    cache_key, 86400,  # 24 hours
                    json.dumps({
                        'avatar_id': avatar_data['avatar_id'],
                        'name': avatar_name,
                        'preview_url': avatar_data.get('preview_url', ''),
                        'status': avatar_data.get('status', 'processing')
                    })
                )
                
                return {
                    'success': True,
                    'avatar': custom_avatar,
                    'processing_time_estimate': avatar_data.get('processing_time', 300)
                }
            else:
                return {
                    'success': False,
                    'error': f'HeyGen API error: {response.status_code}'
                }
                
        except Exception as e:
            logger.error("Custom avatar creation failed", error=str(e))
            return {'success': False, 'error': str(e)}
    
    async def generate_video(self, user_email: str, request: HeyGenGenerationRequest,
                           progress_callback=None) -> Dict[str, Any]:
        """Generate video using HeyGen API"""
        try:
            # Verify premium access
            if not await self.check_premium_access(user_email):
                return {
                    'success': False,
                    'error': 'HeyGen premium service requires Pro or Enterprise subscription',
                    'upgrade_required': True
                }
            
            # Validate avatar access
            if request.avatar_id not in self.premium_avatars:
                # Check if it's a custom avatar
                custom_avatar_key = f"custom_avatar:{user_email}:*"
                custom_avatars = self.redis_client.keys(custom_avatar_key)
                
                if not any(request.avatar_id in key for key in custom_avatars):
                    return {
                        'success': False,
                        'error': 'Selected avatar not available or invalid'
                    }
            
            # Generate unique job ID
            job_id = f"heygen_{uuid.uuid4().hex}"
            
            if progress_callback:
                await progress_callback(0, "Initializing HeyGen premium generation")
            
            # Prepare generation payload
            payload = {
                'avatar_id': request.avatar_id,
                'text': request.text,
                'voice': {
                    'voice_id': request.voice_id,
                    'language': request.language.value,
                    'speed': request.speed,
                    'emotion': request.emotion
                },
                'video': {
                    'quality': request.quality.value,
                    'background': request.background or 'studio_white',
                    'aspect_ratio': '16:9',
                    'format': 'mp4'
                },
                'settings': {
                    'enhance_speech': True,
                    'stabilize_video': True,
                    'remove_background_noise': True,
                    'professional_lighting': True
                }
            }
            
            # Handle custom avatar image
            if request.custom_avatar_image:
                payload['custom_image'] = request.custom_avatar_image
            
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
                'X-User-Email': user_email,
                'X-Job-ID': job_id
            }
            
            if progress_callback:
                await progress_callback(10, "Submitting to HeyGen premium service")
            
            # Submit generation request
            response = requests.post(
                f"{self.api_url}/videos/generate",
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code != 201:
                error_msg = f"HeyGen API error: {response.status_code}"
                if response.content:
                    try:
                        error_data = response.json()
                        error_msg = error_data.get('message', error_msg)
                    except:
                        pass
                
                return {'success': False, 'error': error_msg}
            
            generation_data = response.json()
            generation_id = generation_data['id']
            
            if progress_callback:
                await progress_callback(20, "HeyGen processing started")
            
            # Store generation info in Redis
            generation_info = {
                'user_email': user_email,
                'generation_id': generation_id,
                'job_id': job_id,
                'avatar_id': request.avatar_id,
                'status': 'processing',
                'estimated_completion': (datetime.now() + timedelta(minutes=3)).isoformat(),
                'created_at': datetime.now().isoformat()
            }
            
            self.redis_client.setex(
                f"heygen_generation:{job_id}",
                3600,  # 1 hour TTL
                json.dumps(generation_info)
            )
            
            # Poll for completion
            result = await self._poll_generation_status(
                generation_id, job_id, progress_callback
            )
            
            if result['success']:
                # Track usage for premium tier
                await self._track_premium_usage(user_email, {
                    'service': 'heygen',
                    'avatar_id': request.avatar_id,
                    'quality': request.quality.value,
                    'duration': result.get('duration', 0),
                    'cost': result.get('cost', 0)
                })
            
            return result
            
        except Exception as e:
            logger.error("HeyGen video generation failed", error=str(e), user=user_email)
            return {'success': False, 'error': str(e)}
    
    async def _poll_generation_status(self, generation_id: str, job_id: str,
                                    progress_callback=None) -> Dict[str, Any]:
        """Poll HeyGen generation status until completion"""
        max_attempts = 180  # 15 minutes at 5 second intervals
        attempt = 0
        
        while attempt < max_attempts:
            await asyncio.sleep(5)
            attempt += 1
            
            # Update progress
            progress = min(20 + (attempt / max_attempts) * 70, 90)
            if progress_callback:
                await progress_callback(progress, "HeyGen premium processing...")
            
            try:
                # Check generation status
                response = requests.get(
                    f"{self.api_url}/videos/{generation_id}",
                    headers={'Authorization': f'Bearer {self.api_key}'},
                    timeout=10
                )
                
                if response.status_code == 200:
                    status_data = response.json()
                    
                    if status_data['status'] == 'completed':
                        # Download video
                        video_url = status_data['video_url']
                        video_response = requests.get(video_url, timeout=120)
                        
                        if video_response.status_code == 200:
                            if progress_callback:
                                await progress_callback(95, "Finalizing premium video")
                            
                            return {
                                'success': True,
                                'video_data': video_response.content,
                                'format': 'mp4',
                                'provider': 'heygen_premium',
                                'quality': status_data.get('quality', '1080p'),
                                'duration': status_data.get('duration', 0),
                                'cost': status_data.get('cost', 0),
                                'avatar_id': status_data.get('avatar_id'),
                                'generation_id': generation_id,
                                'premium_features': {
                                    'professional_lighting': True,
                                    'enhanced_speech': True,
                                    'background_removal': True,
                                    'video_stabilization': True
                                },
                                'processing_time': status_data.get('processing_time_seconds', 0)
                            }
                        else:
                            return {
                                'success': False,
                                'error': 'Failed to download premium video'
                            }
                    
                    elif status_data['status'] == 'failed':
                        error_msg = status_data.get('error_message', 'Generation failed')
                        return {'success': False, 'error': f'HeyGen error: {error_msg}'}
                    
                    elif status_data['status'] == 'processing':
                        # Update Redis with current status
                        self.redis_client.setex(
                            f"heygen_generation:{job_id}",
                            3600,
                            json.dumps({
                                **json.loads(self.redis_client.get(f"heygen_generation:{job_id}") or '{}'),
                                'progress': status_data.get('progress', 0),
                                'current_step': status_data.get('current_step', 'processing')
                            })
                        )
                
            except Exception as e:
                logger.warning("Error checking HeyGen status", error=str(e))
                continue
        
        return {'success': False, 'error': 'HeyGen generation timeout (15 minutes)'}
    
    async def _track_premium_usage(self, user_email: str, usage_data: Dict[str, Any]):
        """Track premium service usage for analytics and billing"""
        try:
            usage_record = {
                'user_email': user_email,
                'service': 'heygen_premium',
                'timestamp': datetime.now().isoformat(),
                **usage_data
            }
            
            # Store in Redis for analytics
            usage_key = f"premium_usage:{user_email}:{datetime.now().strftime('%Y%m%d')}"
            current_usage = self.redis_client.get(usage_key)
            
            if current_usage:
                usage_list = json.loads(current_usage)
            else:
                usage_list = []
            
            usage_list.append(usage_record)
            
            # Store with 30-day TTL
            self.redis_client.setex(usage_key, 2592000, json.dumps(usage_list))
            
            logger.info("Premium usage tracked", user=user_email, service='heygen')
            
        except Exception as e:
            logger.error("Failed to track premium usage", error=str(e))
    
    def get_premium_usage_stats(self, user_email: str, days: int = 30) -> Dict[str, Any]:
        """Get premium usage statistics for user"""
        try:
            total_videos = 0
            total_cost = 0.0
            usage_by_avatar = {}
            
            for i in range(days):
                date = (datetime.now() - timedelta(days=i)).strftime('%Y%m%d')
                usage_key = f"premium_usage:{user_email}:{date}"
                
                usage_data = self.redis_client.get(usage_key)
                if usage_data:
                    usage_list = json.loads(usage_data)
                    
                    for usage in usage_list:
                        if usage.get('service') == 'heygen_premium':
                            total_videos += 1
                            total_cost += usage.get('cost', 0)
                            
                            avatar_id = usage.get('avatar_id')
                            if avatar_id in usage_by_avatar:
                                usage_by_avatar[avatar_id] += 1
                            else:
                                usage_by_avatar[avatar_id] = 1
            
            return {
                'total_premium_videos': total_videos,
                'total_cost': round(total_cost, 2),
                'usage_by_avatar': usage_by_avatar,
                'period_days': days,
                'most_used_avatar': max(usage_by_avatar.items(), key=lambda x: x[1]) if usage_by_avatar else None
            }
            
        except Exception as e:
            logger.error("Failed to get usage stats", error=str(e))
            return {
                'total_premium_videos': 0,
                'total_cost': 0.0,
                'usage_by_avatar': {},
                'period_days': days
            }
    
    def get_generation_status(self, job_id: str) -> Dict[str, Any]:
        """Get current status of HeyGen generation"""
        try:
            generation_data = self.redis_client.get(f"heygen_generation:{job_id}")
            
            if generation_data:
                return json.loads(generation_data)
            else:
                return {'status': 'not_found', 'error': 'Generation not found'}
                
        except Exception as e:
            logger.error("Failed to get generation status", error=str(e))
            return {'status': 'error', 'error': str(e)}
    
    def estimate_premium_cost(self, duration: float, quality: HeyGenVideoQuality,
                             avatar_type: HeyGenAvatarType) -> Dict[str, float]:
        """Estimate cost for HeyGen premium generation"""
        # Base costs (higher for premium quality)
        base_costs = {
            HeyGenVideoQuality.HD_720P: 0.50,  # per second
            HeyGenVideoQuality.FULL_HD_1080P: 0.75,
            HeyGenVideoQuality.UHD_4K: 1.25
        }
        
        # Avatar type multipliers
        avatar_multipliers = {
            HeyGenAvatarType.BUSINESS_PROFESSIONAL: 1.0,
            HeyGenAvatarType.EDUCATOR: 1.0,
            HeyGenAvatarType.PRESENTER: 1.2,
            HeyGenAvatarType.CASUAL: 0.9,
            HeyGenAvatarType.CUSTOM: 1.5  # Custom avatars cost more
        }
        
        base_cost = base_costs.get(quality, 0.75) * duration
        multiplier = avatar_multipliers.get(avatar_type, 1.0)
        
        total_cost = base_cost * multiplier
        
        return {
            'base_cost': round(base_cost, 2),
            'avatar_multiplier': multiplier,
            'total_cost': round(total_cost, 2),
            'currency': 'USD',
            'premium_features_included': True
        }


# Global HeyGen service instance
heygen_service = HeyGenService()
