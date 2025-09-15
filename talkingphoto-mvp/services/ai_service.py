"""
TalkingPhoto AI MVP - AI Service Integration
Multi-provider AI service routing with fallback and cost optimization
"""

import requests
import base64
import hashlib
import time
import json
from datetime import datetime, timezone, timedelta
from flask import current_app
from PIL import Image
import io
import structlog
from typing import Dict, Any, Optional, List
from urllib.parse import urljoin
from core.cache import cached_result

from models.video import VideoGeneration, AIProvider, VideoStatus
from models.file import UploadedFile
from services.file_service import FileService

logger = structlog.get_logger()


class AIServiceRouter:
    """
    AI service routing with automatic fallback and cost optimization
    """
    
    def __init__(self):
        self.services = {
            'image_enhancement': [
                {'name': 'nano_banana', 'cost': 0.039, 'quality': 8.5, 'speed': 2.1},
                {'name': 'openai_dall_e', 'cost': 0.50, 'quality': 9.2, 'speed': 3.4},
                {'name': 'stability_ai', 'cost': 0.35, 'quality': 9.0, 'speed': 2.8}
            ],
            'video_generation': [
                {'name': 'veo3', 'cost': 0.15, 'quality': 8.0, 'speed': 12.5},
                {'name': 'runway', 'cost': 0.20, 'quality': 8.8, 'speed': 15.2},
                {'name': 'nano_banana_video', 'cost': 0.08, 'quality': 7.2, 'speed': 8.0}
            ]
        }
        
        self.api_keys = {
            'nano_banana': current_app.config.get('NANO_BANANA_API_KEY'),
            'veo3': current_app.config.get('VEO3_API_KEY'),
            'runway': current_app.config.get('RUNWAY_API_KEY'),
            'openai': current_app.config.get('OPENAI_API_KEY')
        }
    
    def select_optimal_service(self, service_type: str, quality_preference: str = 'balanced') -> Dict[str, Any]:
        """
        Select optimal AI service based on cost, quality, and availability
        """
        available_services = self.services.get(service_type, [])
        
        if not available_services:
            return {'error': f'No services available for {service_type}'}
        
        # Filter based on quality preference
        if quality_preference == 'economy':
            # Prefer lowest cost
            available_services.sort(key=lambda x: x['cost'])
        elif quality_preference == 'premium':
            # Prefer highest quality
            available_services.sort(key=lambda x: -x['quality'])
        else:
            # Balanced: cost-quality ratio
            available_services.sort(key=lambda x: x['cost'] / x['quality'])
        
        # Check availability and return first working service
        for service in available_services:
            if self._is_service_available(service['name']):
                return {'success': True, 'service': service}
        
        return {'error': 'No services currently available'}
    
    def _is_service_available(self, service_name: str) -> bool:
        """
        Check if AI service is available (has API key and responds to health check)
        """
        api_key = self.api_keys.get(service_name)
        if not api_key:
            return False
        
        # In production, implement health checks for each service
        # For now, just check API key presence
        return True


class AIService:
    """
    Main AI service class for image enhancement and video generation
    """
    
    def __init__(self):
        self.router = AIServiceRouter()
        self.file_service = FileService()
    
    def enhance_image(self, file_id: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Enhance image using optimal AI service
        """
        try:
            # Get source file
            source_file = UploadedFile.query.get(file_id)
            if not source_file:
                return {'success': False, 'error': 'Source file not found'}
            
            # Select optimal service
            service_selection = self.router.select_optimal_service(
                'image_enhancement',
                options.get('quality_preference', 'balanced')
            )
            
            if not service_selection.get('success'):
                return {'success': False, 'error': service_selection['error']}
            
            service = service_selection['service']
            
            # Get file content
            file_content = self.file_service.get_file_content(source_file.storage_path)
            if not file_content:
                return {'success': False, 'error': 'Unable to read source file'}
            
            # Route to specific AI service
            if service['name'] == 'nano_banana':
                return self._enhance_with_nano_banana(file_content, source_file, options or {})
            elif service['name'] == 'openai_dall_e':
                return self._enhance_with_openai(file_content, source_file, options or {})
            elif service['name'] == 'stability_ai':
                return self._enhance_with_stability_ai(file_content, source_file, options or {})
            else:
                return {'success': False, 'error': f'Service {service["name"]} not implemented'}
                
        except Exception as e:
            logger.error("Image enhancement failed", file_id=file_id, error=str(e))
            return {'success': False, 'error': str(e)}
    
    def generate_video(self, video_generation_id: str) -> Dict[str, Any]:
        """
        Generate talking video from photo and script
        """
        try:
            # Get video generation record
            video_gen = VideoGeneration.query.get(video_generation_id)
            if not video_gen:
                return {'success': False, 'error': 'Video generation not found'}
            
            video_gen.mark_processing_started()
            
            # Get source file
            source_file = video_gen.source_file
            if not source_file:
                return {'success': False, 'error': 'Source file not found'}
            
            # Route to AI provider
            if video_gen.ai_provider == AIProvider.VEO3:
                result = self._generate_with_veo3(video_gen, source_file)
            elif video_gen.ai_provider == AIProvider.RUNWAY:
                result = self._generate_with_runway(video_gen, source_file)
            elif video_gen.ai_provider == AIProvider.NANO_BANANA:
                result = self._generate_with_nano_banana_video(video_gen, source_file)
            elif video_gen.ai_provider == AIProvider.MOCK:
                result = self._generate_mock_video(video_gen, source_file)
            else:
                return {'success': False, 'error': f'AI provider {video_gen.ai_provider.value} not supported'}
            
            return result
            
        except Exception as e:
            logger.error("Video generation failed", 
                        video_generation_id=video_generation_id, error=str(e))
            return {'success': False, 'error': str(e)}
    
    def get_generation_status(self, video_generation: VideoGeneration) -> Dict[str, Any]:
        """
        Get updated status from AI provider
        """
        try:
            if not video_generation.provider_job_id:
                return {'status_changed': False}
            
            if video_generation.ai_provider == AIProvider.VEO3:
                return self._get_veo3_status(video_generation)
            elif video_generation.ai_provider == AIProvider.RUNWAY:
                return self._get_runway_status(video_generation)
            elif video_generation.ai_provider == AIProvider.NANO_BANANA:
                return self._get_nano_banana_video_status(video_generation)
            elif video_generation.ai_provider == AIProvider.MOCK:
                return self._get_mock_status(video_generation)
            
            return {'status_changed': False}
            
        except Exception as e:
            logger.error("Status check failed", 
                        video_id=video_generation.id, error=str(e))
            return {'status_changed': False, 'error': str(e)}
    
    # Nano Banana Image Enhancement
    def _enhance_with_nano_banana(self, file_content: bytes, source_file: UploadedFile, options: Dict) -> Dict[str, Any]:
        """
        Enhance image using Google Nano Banana (Gemini 2.5 Flash)
        """
        try:
            api_key = self.router.api_keys['nano_banana']
            if not api_key:
                return {'success': False, 'error': 'Nano Banana API key not configured'}
            
            # Convert image to base64
            image_b64 = base64.b64encode(file_content).decode('utf-8')
            
            # Prepare enhancement prompt
            enhancement_prompt = options.get('prompt', 
                "Enhance this photo for professional video creation. Improve lighting, clarity, and overall composition while maintaining natural appearance.")
            
            # API request
            url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
            headers = {
                'Content-Type': 'application/json',
                'x-goog-api-key': api_key
            }
            
            payload = {
                "contents": [{
                    "parts": [
                        {"text": enhancement_prompt},
                        {
                            "inline_data": {
                                "mime_type": source_file.mime_type,
                                "data": image_b64
                            }
                        }
                    ]
                }],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 1024
                }
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code != 200:
                logger.error("Nano Banana API error", 
                           status_code=response.status_code,
                           response=response.text)
                return {'success': False, 'error': f'API error: {response.status_code}'}
            
            # For mock implementation, return enhanced version
            # In production, parse response and generate enhanced image
            enhanced_filename = f"enhanced_{source_file.filename}"
            enhanced_hash = hashlib.sha256(file_content).hexdigest()
            
            # Store enhanced file
            storage_result = self.file_service.store_file(
                file_content=file_content,  # In production, use actual enhanced content
                filename=enhanced_filename,
                content_type=source_file.mime_type
            )
            
            if not storage_result['success']:
                return {'success': False, 'error': 'Failed to store enhanced file'}
            
            return {
                'success': True,
                'filename': enhanced_filename,
                'file_hash': enhanced_hash,
                'file_size': len(file_content),
                'storage_path': storage_result['path'],
                'storage_url': storage_result.get('url'),
                'cdn_url': storage_result.get('cdn_url'),
                'cost': 0.039,
                'prompt': enhancement_prompt,
                'width': source_file.width,
                'height': source_file.height
            }
            
        except Exception as e:
            logger.error("Nano Banana enhancement failed", error=str(e))
            return {'success': False, 'error': str(e)}
    
    def _enhance_with_openai(self, file_content: bytes, source_file: UploadedFile, options: Dict) -> Dict[str, Any]:
        """
        Enhance image using OpenAI DALL-E
        """
        # Mock implementation - in production, integrate with OpenAI API
        return {'success': False, 'error': 'OpenAI enhancement not yet implemented'}
    
    def _enhance_with_stability_ai(self, file_content: bytes, source_file: UploadedFile, options: Dict) -> Dict[str, Any]:
        """
        Enhance image using Stability AI
        """
        # Mock implementation - in production, integrate with Stability AI API
        return {'success': False, 'error': 'Stability AI enhancement not yet implemented'}
    
    # Video Generation Services
    def _generate_with_veo3(self, video_gen: VideoGeneration, source_file: UploadedFile) -> Dict[str, Any]:
        """
        Generate video using Veo3 API with production-ready implementation
        """
        try:
            api_key = self.router.api_keys['veo3']
            if not api_key:
                logger.error("Veo3 API key not configured", video_id=video_gen.id)
                return self._try_fallback_provider(video_gen, source_file, 'Veo3 API key not configured')

            logger.info("Starting Veo3 video generation",
                       video_id=video_gen.id,
                       duration=video_gen.duration_seconds,
                       quality=video_gen.video_quality.value)

            # Check cache first to avoid duplicate processing
            cache_key = self._get_veo3_cache_key(video_gen, source_file)
            cached_result = self._get_cached_result(cache_key)
            if cached_result:
                logger.info("Using cached Veo3 result", video_id=video_gen.id)
                return cached_result

            # Get file content and prepare for upload
            file_content = self.file_service.get_file_content(source_file.storage_path)
            if not file_content:
                return {'success': False, 'error': 'Unable to read source file'}

            # Prepare Veo3 API request
            veo3_request = self._prepare_veo3_request(video_gen, source_file, file_content)

            # Submit generation request
            submission_result = self._submit_veo3_generation(veo3_request, api_key)
            if not submission_result['success']:
                logger.error("Veo3 submission failed", error=submission_result['error'])
                return self._try_fallback_provider(video_gen, source_file, submission_result['error'])

            # Update video generation record with provider job ID
            video_gen.provider_job_id = submission_result['job_id']
            video_gen.provider_request_id = submission_result.get('request_id')

            # For asynchronous processing, return pending status
            if submission_result.get('async_processing', True):
                estimated_completion = datetime.now(timezone.utc) + timedelta(seconds=video_gen.duration_seconds * 2)
                video_gen.mark_processing_started(
                    provider_job_id=submission_result['job_id'],
                    estimated_completion=estimated_completion
                )

                return {
                    'success': True,
                    'status': 'processing',
                    'job_id': submission_result['job_id'],
                    'estimated_completion': estimated_completion.isoformat(),
                    'cost': 0.15 * video_gen.duration_seconds
                }

            # For synchronous processing, wait for completion
            return self._wait_for_veo3_completion(video_gen, submission_result['job_id'], api_key, cache_key)

        except requests.exceptions.RequestException as e:
            logger.error("Veo3 network error", video_id=video_gen.id, error=str(e))
            return self._try_fallback_provider(video_gen, source_file, f'Network error: {str(e)}')
        except Exception as e:
            logger.error("Veo3 generation failed", video_id=video_gen.id, error=str(e))
            return {'success': False, 'error': str(e)}
    
    def _generate_with_runway(self, video_gen: VideoGeneration, source_file: UploadedFile) -> Dict[str, Any]:
        """
        Generate video using Runway API
        """
        try:
            api_key = self.router.api_keys['runway']
            if not api_key:
                return {'success': False, 'error': 'Runway API key not configured'}
            
            # Mock implementation for MVP
            logger.info("Mock Runway video generation", video_id=video_gen.id)
            
            time.sleep(3)  # Simulate longer processing
            
            mock_video_content = self._create_mock_video_content()
            output_filename = f"video_{video_gen.id}.mp4"
            
            storage_result = self.file_service.store_file(
                file_content=mock_video_content,
                filename=output_filename,
                content_type='video/mp4'
            )
            
            if not storage_result['success']:
                return {'success': False, 'error': 'Failed to store output video'}
            
            return {
                'success': True,
                'output_file_path': storage_result['path'],
                'output_file_url': storage_result.get('url'),
                'file_size': len(mock_video_content),
                'duration': video_gen.duration_seconds,
                'cost': 0.20 * video_gen.duration_seconds,
                'quality_metrics': {
                    'lip_sync_accuracy': 92.3,
                    'video_resolution': '1920x1080',
                    'audio_quality': 'premium'
                }
            }
            
        except Exception as e:
            logger.error("Runway generation failed", error=str(e))
            return {'success': False, 'error': str(e)}
    
    def _generate_with_nano_banana_video(self, video_gen: VideoGeneration, source_file: UploadedFile) -> Dict[str, Any]:
        """
        Generate video using Nano Banana video API
        """
        # Mock implementation for economy option
        logger.info("Mock Nano Banana video generation", video_id=video_gen.id)
        
        time.sleep(1)  # Faster processing
        
        mock_video_content = self._create_mock_video_content()
        output_filename = f"video_{video_gen.id}.mp4"
        
        storage_result = self.file_service.store_file(
            file_content=mock_video_content,
            filename=output_filename,
            content_type='video/mp4'
        )
        
        if not storage_result['success']:
            return {'success': False, 'error': 'Failed to store output video'}
        
        return {
            'success': True,
            'output_file_path': storage_result['path'],
            'output_file_url': storage_result.get('url'),
            'file_size': len(mock_video_content),
            'duration': video_gen.duration_seconds,
            'cost': 0.08 * video_gen.duration_seconds,
            'quality_metrics': {
                'lip_sync_accuracy': 78.2,
                'video_resolution': '1280x720',
                'audio_quality': 'standard'
            }
        }
    
    def _generate_mock_video(self, video_gen: VideoGeneration, source_file: UploadedFile) -> Dict[str, Any]:
        """
        Generate mock video for testing
        """
        logger.info("Mock video generation", video_id=video_gen.id)
        
        mock_video_content = self._create_mock_video_content()
        output_filename = f"mock_video_{video_gen.id}.mp4"
        
        storage_result = self.file_service.store_file(
            file_content=mock_video_content,
            filename=output_filename,
            content_type='video/mp4'
        )
        
        if not storage_result['success']:
            return {'success': False, 'error': 'Failed to store mock video'}
        
        return {
            'success': True,
            'output_file_path': storage_result['path'],
            'output_file_url': storage_result.get('url'),
            'file_size': len(mock_video_content),
            'duration': video_gen.duration_seconds,
            'cost': 0.0,  # No cost for mock
            'quality_metrics': {
                'lip_sync_accuracy': 95.0,
                'video_resolution': '1920x1080',
                'audio_quality': 'mock'
            }
        }
    
    def _create_mock_video_content(self) -> bytes:
        """
        Create mock video content for testing
        """
        # Create a minimal valid MP4 file header
        # In production, this would be actual video content
        mock_content = b'\x00\x00\x00\x20ftypmp41\x00\x00\x00\x00mp41isom' + b'\x00' * 1000
        return mock_content
    
    # Status Check Methods
    def _get_veo3_status(self, video_gen: VideoGeneration) -> Dict[str, Any]:
        """Get status from Veo3 API"""
        try:
            if not video_gen.provider_job_id:
                return {'status_changed': False}

            api_key = self.router.api_keys.get('veo3')
            if not api_key:
                return {'status_changed': False, 'error': 'API key not available'}

            status_result = self._check_veo3_status(video_gen.provider_job_id, api_key)

            if not status_result['success']:
                return {'status_changed': False, 'error': status_result['error']}

            current_status = status_result.get('status')
            if not current_status:
                return {'status_changed': False}

            # Map Veo3 status to our VideoStatus enum
            status_mapping = {
                'pending': VideoStatus.PENDING,
                'processing': VideoStatus.PROCESSING,
                'completed': VideoStatus.COMPLETED,
                'failed': VideoStatus.FAILED,
                'cancelled': VideoStatus.CANCELLED
            }

            new_status = status_mapping.get(current_status)
            if not new_status:
                return {'status_changed': False}

            # Check if status actually changed
            if new_status == video_gen.status:
                # Status same, but update progress if available
                progress = status_result.get('progress', 0)
                return {
                    'status_changed': False,
                    'progress': progress,
                    'estimated_completion_time': status_result.get('estimated_completion_time')
                }

            # Status changed
            old_status = video_gen.status
            video_gen.status = new_status

            if new_status == VideoStatus.COMPLETED:
                # Process completion
                completion_result = self._process_veo3_completion(video_gen, status_result)
                if completion_result['success']:
                    video_gen.mark_processing_completed(
                        output_file_id=None,  # We'll handle file creation in the service layer
                        **completion_result.get('quality_metrics', {})
                    )

                    # Update costs
                    video_gen.processing_cost = completion_result.get('cost', 0)

                    return {
                        'status_changed': True,
                        'old_status': old_status.value,
                        'new_status': new_status.value,
                        'completion_result': completion_result
                    }
                else:
                    # Completion processing failed
                    video_gen.mark_processing_failed(
                        completion_result.get('error', 'Failed to process completion'),
                        'completion_error'
                    )
                    return {
                        'status_changed': True,
                        'old_status': old_status.value,
                        'new_status': VideoStatus.FAILED.value,
                        'error': completion_result.get('error')
                    }

            elif new_status == VideoStatus.FAILED:
                error_message = status_result.get('error', 'Video generation failed')
                video_gen.mark_processing_failed(error_message, 'veo3_error')
                return {
                    'status_changed': True,
                    'old_status': old_status.value,
                    'new_status': new_status.value,
                    'error': error_message
                }

            return {
                'status_changed': True,
                'old_status': old_status.value,
                'new_status': new_status.value,
                'progress': status_result.get('progress', 0)
            }

        except Exception as e:
            logger.error("Veo3 status check failed",
                        video_id=video_gen.id,
                        job_id=video_gen.provider_job_id,
                        error=str(e))
            return {'status_changed': False, 'error': str(e)}
    
    def _get_runway_status(self, video_gen: VideoGeneration) -> Dict[str, Any]:
        """Get status from Runway API"""
        # Mock status check
        return {'status_changed': False}
    
    def _get_nano_banana_video_status(self, video_gen: VideoGeneration) -> Dict[str, Any]:
        """Get status from Nano Banana video API"""
        # Mock status check
        return {'status_changed': False}
    
    def _get_mock_status(self, video_gen: VideoGeneration) -> Dict[str, Any]:
        """Get mock status for testing"""
        return {'status_changed': False}

    # Veo3 API Implementation Methods
    def _get_veo3_cache_key(self, video_gen: VideoGeneration, source_file: UploadedFile) -> str:
        """Generate cache key for Veo3 request"""
        cache_data = {
            'script_text': video_gen.script_text,
            'duration': video_gen.duration_seconds,
            'quality': video_gen.video_quality.value,
            'aspect_ratio': video_gen.aspect_ratio.value,
            'file_hash': source_file.file_hash,
            'voice_settings': video_gen.voice_settings
        }
        cache_string = json.dumps(cache_data, sort_keys=True)
        return f"veo3_{hashlib.sha256(cache_string.encode()).hexdigest()[:16]}"

    def _get_cached_result(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached Veo3 result"""
        from core.cache import _cache
        return _cache.get(cache_key)

    def _cache_result(self, cache_key: str, result: Dict[str, Any], ttl: int = 3600):
        """Cache Veo3 result"""
        from core.cache import _cache
        _cache.set(cache_key, result, ttl)

    def _prepare_veo3_request(self, video_gen: VideoGeneration, source_file: UploadedFile, file_content: bytes) -> Dict[str, Any]:
        """Prepare Veo3 API request payload"""

        # Convert image to base64 for API
        image_b64 = base64.b64encode(file_content).decode('utf-8')

        # Map quality settings to Veo3 parameters
        quality_settings = {
            'economy': {'resolution': '720p', 'bitrate': 2000, 'fps': 24},
            'standard': {'resolution': '1080p', 'bitrate': 4000, 'fps': 30},
            'premium': {'resolution': '1080p', 'bitrate': 8000, 'fps': 60}
        }

        quality_config = quality_settings.get(video_gen.video_quality.value, quality_settings['standard'])

        # Map aspect ratio to Veo3 format
        aspect_ratio_map = {
            '1:1': 'square',
            '9:16': 'portrait',
            '16:9': 'landscape'
        }

        return {
            'image': {
                'data': image_b64,
                'format': source_file.mime_type
            },
            'script': {
                'text': video_gen.script_text,
                'voice_settings': video_gen.voice_settings or {}
            },
            'video_config': {
                'duration_seconds': video_gen.duration_seconds,
                'aspect_ratio': aspect_ratio_map.get(video_gen.aspect_ratio.value, 'landscape'),
                'resolution': quality_config['resolution'],
                'bitrate': quality_config['bitrate'],
                'fps': quality_config['fps']
            },
            'generation_config': {
                'lip_sync_enabled': True,
                'facial_animation_strength': 0.8,
                'background_noise_reduction': True,
                'audio_enhancement': video_gen.video_quality.value != 'economy'
            },
            'metadata': {
                'user_id': video_gen.user_id,
                'generation_id': video_gen.id,
                'created_at': datetime.now(timezone.utc).isoformat()
            }
        }

    def _submit_veo3_generation(self, request_payload: Dict[str, Any], api_key: str) -> Dict[str, Any]:
        """Submit generation request to Veo3 API"""
        import uuid

        # Veo3 API endpoints (these would be the actual API URLs)
        veo3_base_url = current_app.config.get('VEO3_API_BASE_URL', 'https://api.veo3.ai/v1')
        submit_endpoint = urljoin(veo3_base_url, '/video/generate')

        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'TalkingPhoto-AI/2.0',
            'X-Request-ID': str(uuid.uuid4())
        }

        try:
            logger.info("Submitting Veo3 generation request",
                       endpoint=submit_endpoint,
                       duration=request_payload['video_config']['duration_seconds'])

            response = requests.post(
                submit_endpoint,
                json=request_payload,
                headers=headers,
                timeout=60  # Longer timeout for file upload
            )

            if response.status_code == 202:  # Accepted for processing
                response_data = response.json()
                return {
                    'success': True,
                    'job_id': response_data.get('job_id'),
                    'request_id': response_data.get('request_id'),
                    'async_processing': True,
                    'estimated_completion_time': response_data.get('estimated_completion_time')
                }
            elif response.status_code == 200:  # Immediate processing
                response_data = response.json()
                return {
                    'success': True,
                    'job_id': response_data.get('job_id'),
                    'request_id': response_data.get('request_id'),
                    'async_processing': False,
                    'video_url': response_data.get('video_url'),
                    'video_data': response_data.get('video_data')
                }
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {'message': response.text}
                logger.error("Veo3 API error response",
                           status_code=response.status_code,
                           error=error_data)

                # Handle specific error codes
                if response.status_code == 429:  # Rate limited
                    return {'success': False, 'error': 'Rate limit exceeded. Please try again later.', 'retry_after': response.headers.get('Retry-After')}
                elif response.status_code == 402:  # Payment required
                    return {'success': False, 'error': 'Insufficient credits. Please upgrade your plan.'}
                elif response.status_code == 413:  # File too large
                    return {'success': False, 'error': 'Source image file is too large.'}
                else:
                    return {'success': False, 'error': f"API error: {error_data.get('message', 'Unknown error')}"}

        except requests.exceptions.Timeout:
            return {'success': False, 'error': 'Request timeout. Please try again.'}
        except requests.exceptions.ConnectionError:
            return {'success': False, 'error': 'Connection error. Please check your internet connection.'}
        except requests.exceptions.RequestException as e:
            return {'success': False, 'error': f'Request failed: {str(e)}'}

    def _wait_for_veo3_completion(self, video_gen: VideoGeneration, job_id: str, api_key: str, cache_key: str) -> Dict[str, Any]:
        """Wait for synchronous Veo3 processing to complete"""

        max_wait_time = 300  # 5 minutes max
        poll_interval = 5  # Poll every 5 seconds
        start_time = time.time()

        while time.time() - start_time < max_wait_time:
            status_result = self._check_veo3_status(job_id, api_key)

            if not status_result['success']:
                return status_result

            if status_result['status'] == 'completed':
                result = self._process_veo3_completion(video_gen, status_result)
                # Cache the successful result
                if result['success']:
                    self._cache_result(cache_key, result)
                return result
            elif status_result['status'] == 'failed':
                return {'success': False, 'error': status_result.get('error', 'Video generation failed')}

            time.sleep(poll_interval)

        return {'success': False, 'error': 'Video generation timeout'}

    def _check_veo3_status(self, job_id: str, api_key: str) -> Dict[str, Any]:
        """Check Veo3 generation status"""

        veo3_base_url = current_app.config.get('VEO3_API_BASE_URL', 'https://api.veo3.ai/v1')
        status_endpoint = urljoin(veo3_base_url, f'/video/status/{job_id}')

        headers = {
            'Authorization': f'Bearer {api_key}',
            'User-Agent': 'TalkingPhoto-AI/2.0'
        }

        try:
            response = requests.get(status_endpoint, headers=headers, timeout=30)

            if response.status_code == 200:
                data = response.json()
                return {
                    'success': True,
                    'status': data.get('status'),
                    'progress': data.get('progress', 0),
                    'video_url': data.get('video_url'),
                    'thumbnail_url': data.get('thumbnail_url'),
                    'quality_metrics': data.get('quality_metrics', {}),
                    'error': data.get('error')
                }
            else:
                return {'success': False, 'error': f'Status check failed: {response.status_code}'}

        except requests.exceptions.RequestException as e:
            return {'success': False, 'error': f'Status check error: {str(e)}'}

    def _process_veo3_completion(self, video_gen: VideoGeneration, status_result: Dict[str, Any]) -> Dict[str, Any]:
        """Process completed Veo3 generation"""

        try:
            # Download generated video
            video_url = status_result.get('video_url')
            if not video_url:
                return {'success': False, 'error': 'No video URL provided'}

            # Download video content
            video_response = requests.get(video_url, timeout=120)
            if video_response.status_code != 200:
                return {'success': False, 'error': 'Failed to download generated video'}

            video_content = video_response.content
            output_filename = f"veo3_video_{video_gen.id}.mp4"

            # Store output file
            storage_result = self.file_service.store_file(
                file_content=video_content,
                filename=output_filename,
                content_type='video/mp4'
            )

            if not storage_result['success']:
                return {'success': False, 'error': 'Failed to store output video'}

            # Process thumbnail if available
            thumbnail_url = status_result.get('thumbnail_url')
            thumbnail_storage_path = None
            if thumbnail_url:
                try:
                    thumb_response = requests.get(thumbnail_url, timeout=30)
                    if thumb_response.status_code == 200:
                        thumb_filename = f"veo3_thumb_{video_gen.id}.jpg"
                        thumb_storage = self.file_service.store_file(
                            file_content=thumb_response.content,
                            filename=thumb_filename,
                            content_type='image/jpeg'
                        )
                        if thumb_storage['success']:
                            thumbnail_storage_path = thumb_storage['path']
                except Exception as e:
                    logger.warning("Failed to download thumbnail", error=str(e))

            # Extract quality metrics
            quality_metrics = status_result.get('quality_metrics', {})

            return {
                'success': True,
                'output_file_path': storage_result['path'],
                'output_file_url': storage_result.get('url'),
                'thumbnail_path': thumbnail_storage_path,
                'file_size': len(video_content),
                'duration': video_gen.duration_seconds,
                'cost': 0.15 * video_gen.duration_seconds,
                'quality_metrics': {
                    'lip_sync_accuracy': quality_metrics.get('lip_sync_accuracy', 85.0),
                    'video_resolution': quality_metrics.get('resolution', '1920x1080'),
                    'audio_quality': quality_metrics.get('audio_quality', 'high'),
                    'facial_animation_quality': quality_metrics.get('facial_animation', 8.5),
                    'overall_score': quality_metrics.get('overall_score', 8.0)
                },
                'processing_time': quality_metrics.get('processing_time_seconds'),
                'provider_metadata': {
                    'job_id': video_gen.provider_job_id,
                    'api_version': quality_metrics.get('api_version', 'v1'),
                    'model_version': quality_metrics.get('model_version', 'veo3-1.0')
                }
            }

        except Exception as e:
            logger.error("Failed to process Veo3 completion", error=str(e))
            return {'success': False, 'error': str(e)}

    def _try_fallback_provider(self, video_gen: VideoGeneration, source_file: UploadedFile, error_reason: str) -> Dict[str, Any]:
        """Try fallback provider when Veo3 fails"""

        logger.info("Attempting fallback provider",
                   video_id=video_gen.id,
                   original_provider=video_gen.ai_provider.value,
                   error_reason=error_reason)

        # Get next best provider from router
        fallback_selection = self.router.select_optimal_service('video_generation')

        if not fallback_selection.get('success'):
            return {'success': False, 'error': f'No fallback providers available: {error_reason}'}

        fallback_service = fallback_selection['service']

        # Skip if same provider or if it's Veo3 again
        if fallback_service['name'] == 'veo3':
            # Try next provider
            available_services = [s for s in self.router.services['video_generation'] if s['name'] != 'veo3']
            if available_services:
                fallback_service = available_services[0]  # Get first alternative
            else:
                return {'success': False, 'error': f'No alternative providers available: {error_reason}'}

        # Mark fallback usage
        original_provider = video_gen.ai_provider
        fallback_provider = AIProvider.RUNWAY if fallback_service['name'] == 'runway' else AIProvider.NANO_BANANA
        video_gen.mark_fallback_used(fallback_provider)

        logger.info("Using fallback provider",
                   video_id=video_gen.id,
                   original_provider=original_provider.value,
                   fallback_provider=fallback_provider.value)

        try:
            # Route to fallback provider
            if fallback_provider == AIProvider.RUNWAY:
                result = self._generate_with_runway(video_gen, source_file)
            elif fallback_provider == AIProvider.NANO_BANANA:
                result = self._generate_with_nano_banana_video(video_gen, source_file)
            else:
                return {'success': False, 'error': f'Fallback provider {fallback_provider.value} not implemented'}

            # Add fallback information to result
            if result.get('success'):
                result['fallback_used'] = True
                result['original_error'] = error_reason
                result['original_provider'] = original_provider.value
                result['fallback_provider'] = fallback_provider.value

            return result

        except Exception as e:
            logger.error("Fallback provider also failed",
                        video_id=video_gen.id,
                        fallback_provider=fallback_provider.value,
                        error=str(e))
            return {
                'success': False,
                'error': f'Both primary and fallback providers failed. Original: {error_reason}, Fallback: {str(e)}'
            }