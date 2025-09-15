"""
TalkingPhoto MVP - Veo3 Integration Unit Tests

Comprehensive test suite for Veo3 API integration including:
- API request/response handling
- Error scenarios and fallback mechanisms
- Caching behavior
- Cost calculation
- Status tracking
"""

import pytest
import json
import hashlib
import base64
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timezone, timedelta

from services.ai_service import AIService, AIServiceRouter
from models.video import VideoGeneration, VideoStatus, VideoQuality, AspectRatio, AIProvider
from models.file import UploadedFile


class TestVeo3Integration:
    """Test suite for Veo3 API integration"""

    @pytest.fixture
    def ai_service(self):
        """Create AIService instance for testing"""
        with patch('services.ai_service.current_app') as mock_app:
            mock_app.config.get.side_effect = lambda key, default=None: {
                'VEO3_API_KEY': 'test_veo3_key',
                'VEO3_API_BASE_URL': 'https://api.veo3.ai/v1',
                'RUNWAY_API_KEY': 'test_runway_key',
                'NANO_BANANA_API_KEY': 'test_nano_key'
            }.get(key, default)

            service = AIService()
            service.file_service = Mock()
            return service

    @pytest.fixture
    def mock_video_generation(self):
        """Create mock video generation object"""
        video_gen = Mock(spec=VideoGeneration)
        video_gen.id = 'test_video_123'
        video_gen.user_id = 'user_456'
        video_gen.script_text = 'Hello, this is a test video script for Veo3 integration.'
        video_gen.duration_seconds = 30
        video_gen.video_quality = VideoQuality.STANDARD
        video_gen.aspect_ratio = AspectRatio.LANDSCAPE
        video_gen.ai_provider = AIProvider.VEO3
        video_gen.voice_settings = {'speed': 1.0, 'pitch': 0.0}
        video_gen.provider_job_id = None
        video_gen.provider_request_id = None
        video_gen.status = VideoStatus.PENDING
        return video_gen

    @pytest.fixture
    def mock_source_file(self):
        """Create mock source file object"""
        source_file = Mock(spec=UploadedFile)
        source_file.id = 'file_789'
        source_file.filename = 'test_photo.jpg'
        source_file.mime_type = 'image/jpeg'
        source_file.file_hash = 'abcd1234hash'
        source_file.storage_path = '/path/to/test_photo.jpg'
        return source_file

    @pytest.fixture
    def mock_file_content(self):
        """Create mock file content"""
        return b'\xff\xd8\xff\xe0\x00\x10JFIF' + b'\x00' * 1000  # Mock JPEG header

    def test_veo3_cache_key_generation(self, ai_service, mock_video_generation, mock_source_file):
        """Test cache key generation for Veo3 requests"""
        cache_key = ai_service._get_veo3_cache_key(mock_video_generation, mock_source_file)

        assert cache_key.startswith('veo3_')
        assert len(cache_key) == 21  # 'veo3_' + 16 character hash

        # Test consistency - same inputs should produce same key
        cache_key_2 = ai_service._get_veo3_cache_key(mock_video_generation, mock_source_file)
        assert cache_key == cache_key_2

        # Test uniqueness - different inputs should produce different keys
        mock_video_generation.script_text = 'Different script'
        cache_key_3 = ai_service._get_veo3_cache_key(mock_video_generation, mock_source_file)
        assert cache_key != cache_key_3

    def test_prepare_veo3_request_payload(self, ai_service, mock_video_generation, mock_source_file, mock_file_content):
        """Test Veo3 API request payload preparation"""
        payload = ai_service._prepare_veo3_request(mock_video_generation, mock_source_file, mock_file_content)

        # Validate payload structure
        assert 'image' in payload
        assert 'script' in payload
        assert 'video_config' in payload
        assert 'generation_config' in payload
        assert 'metadata' in payload

        # Validate image data
        assert payload['image']['data'] == base64.b64encode(mock_file_content).decode('utf-8')
        assert payload['image']['format'] == 'image/jpeg'

        # Validate script data
        assert payload['script']['text'] == mock_video_generation.script_text
        assert payload['script']['voice_settings'] == mock_video_generation.voice_settings

        # Validate video config
        video_config = payload['video_config']
        assert video_config['duration_seconds'] == 30
        assert video_config['aspect_ratio'] == 'landscape'
        assert video_config['resolution'] == '1080p'
        assert video_config['bitrate'] == 4000
        assert video_config['fps'] == 30

        # Validate generation config
        gen_config = payload['generation_config']
        assert gen_config['lip_sync_enabled'] is True
        assert gen_config['facial_animation_strength'] == 0.8
        assert gen_config['background_noise_reduction'] is True
        assert gen_config['audio_enhancement'] is True

    @patch('services.ai_service.requests.post')
    def test_submit_veo3_generation_success_async(self, mock_post, ai_service):
        """Test successful async Veo3 generation submission"""
        # Mock successful response
        mock_response = Mock()
        mock_response.status_code = 202
        mock_response.json.return_value = {
            'job_id': 'veo3_job_123',
            'request_id': 'req_456',
            'estimated_completion_time': '2025-09-13T12:30:00Z'
        }
        mock_post.return_value = mock_response

        payload = {'test': 'payload'}
        result = ai_service._submit_veo3_generation(payload, 'test_api_key')

        # Validate result
        assert result['success'] is True
        assert result['job_id'] == 'veo3_job_123'
        assert result['request_id'] == 'req_456'
        assert result['async_processing'] is True

        # Validate API call
        mock_post.assert_called_once()
        call_args = mock_post.call_args
        assert call_args[1]['json'] == payload
        assert call_args[1]['headers']['Authorization'] == 'Bearer test_api_key'
        assert call_args[1]['headers']['Content-Type'] == 'application/json'

    @patch('services.ai_service.requests.post')
    def test_submit_veo3_generation_success_sync(self, mock_post, ai_service):
        """Test successful sync Veo3 generation submission"""
        # Mock successful immediate response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'job_id': 'veo3_job_123',
            'request_id': 'req_456',
            'video_url': 'https://veo3.ai/videos/generated_123.mp4'
        }
        mock_post.return_value = mock_response

        payload = {'test': 'payload'}
        result = ai_service._submit_veo3_generation(payload, 'test_api_key')

        # Validate result
        assert result['success'] is True
        assert result['async_processing'] is False
        assert result['video_url'] == 'https://veo3.ai/videos/generated_123.mp4'

    @patch('services.ai_service.requests.post')
    def test_submit_veo3_generation_rate_limit(self, mock_post, ai_service):
        """Test Veo3 API rate limit handling"""
        # Mock rate limit response
        mock_response = Mock()
        mock_response.status_code = 429
        mock_response.headers = {'Retry-After': '60'}
        mock_response.json.return_value = {'message': 'Rate limit exceeded'}
        mock_post.return_value = mock_response

        payload = {'test': 'payload'}
        result = ai_service._submit_veo3_generation(payload, 'test_api_key')

        assert result['success'] is False
        assert 'Rate limit exceeded' in result['error']
        assert result['retry_after'] == '60'

    @patch('services.ai_service.requests.post')
    def test_submit_veo3_generation_payment_required(self, mock_post, ai_service):
        """Test Veo3 API payment required handling"""
        mock_response = Mock()
        mock_response.status_code = 402
        mock_response.json.return_value = {'message': 'Insufficient credits'}
        mock_post.return_value = mock_response

        result = ai_service._submit_veo3_generation({}, 'test_api_key')

        assert result['success'] is False
        assert 'Insufficient credits' in result['error']

    @patch('services.ai_service.requests.post')
    def test_submit_veo3_generation_network_error(self, mock_post, ai_service):
        """Test network error handling"""
        mock_post.side_effect = requests.exceptions.ConnectionError('Network error')

        result = ai_service._submit_veo3_generation({}, 'test_api_key')

        assert result['success'] is False
        assert 'Connection error' in result['error']

    @patch('services.ai_service.requests.get')
    def test_check_veo3_status_completed(self, mock_get, ai_service):
        """Test Veo3 status check for completed generation"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'status': 'completed',
            'progress': 100,
            'video_url': 'https://veo3.ai/videos/final_123.mp4',
            'thumbnail_url': 'https://veo3.ai/thumbnails/thumb_123.jpg',
            'quality_metrics': {
                'lip_sync_accuracy': 92.5,
                'resolution': '1920x1080',
                'audio_quality': 'high',
                'processing_time_seconds': 45
            }
        }
        mock_get.return_value = mock_response

        result = ai_service._check_veo3_status('job_123', 'test_api_key')

        assert result['success'] is True
        assert result['status'] == 'completed'
        assert result['progress'] == 100
        assert result['video_url'] is not None
        assert result['quality_metrics']['lip_sync_accuracy'] == 92.5

    @patch('services.ai_service.requests.get')
    def test_check_veo3_status_processing(self, mock_get, ai_service):
        """Test Veo3 status check for ongoing processing"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'status': 'processing',
            'progress': 65
        }
        mock_get.return_value = mock_response

        result = ai_service._check_veo3_status('job_123', 'test_api_key')

        assert result['success'] is True
        assert result['status'] == 'processing'
        assert result['progress'] == 65

    @patch('services.ai_service.requests.get')
    def test_check_veo3_status_failed(self, mock_get, ai_service):
        """Test Veo3 status check for failed generation"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'status': 'failed',
            'error': 'Invalid input format'
        }
        mock_get.return_value = mock_response

        result = ai_service._check_veo3_status('job_123', 'test_api_key')

        assert result['success'] is True
        assert result['status'] == 'failed'
        assert result['error'] == 'Invalid input format'

    @patch('services.ai_service.requests.get')
    def test_process_veo3_completion_success(self, mock_get, ai_service, mock_video_generation):
        """Test successful Veo3 completion processing"""
        # Mock video download
        mock_video_response = Mock()
        mock_video_response.status_code = 200
        mock_video_response.content = b'fake_video_content_' + b'\x00' * 1000

        # Mock thumbnail download
        mock_thumb_response = Mock()
        mock_thumb_response.status_code = 200
        mock_thumb_response.content = b'fake_thumbnail_content'

        mock_get.side_effect = [mock_video_response, mock_thumb_response]

        # Mock file service
        ai_service.file_service.store_file.side_effect = [
            {'success': True, 'path': '/stored/video.mp4', 'url': 'https://cdn.com/video.mp4'},
            {'success': True, 'path': '/stored/thumb.jpg', 'url': 'https://cdn.com/thumb.jpg'}
        ]

        status_result = {
            'video_url': 'https://veo3.ai/videos/final_123.mp4',
            'thumbnail_url': 'https://veo3.ai/thumbnails/thumb_123.jpg',
            'quality_metrics': {
                'lip_sync_accuracy': 88.5,
                'resolution': '1920x1080',
                'audio_quality': 'high',
                'processing_time_seconds': 45
            }
        }

        result = ai_service._process_veo3_completion(mock_video_generation, status_result)

        assert result['success'] is True
        assert result['output_file_path'] == '/stored/video.mp4'
        assert result['thumbnail_path'] == '/stored/thumb.jpg'
        assert result['cost'] == 4.5  # 0.15 * 30 seconds
        assert result['quality_metrics']['lip_sync_accuracy'] == 88.5

    def test_fallback_provider_selection(self, ai_service, mock_video_generation, mock_source_file):
        """Test fallback provider selection when Veo3 fails"""
        with patch.object(ai_service, '_generate_with_runway') as mock_runway:
            mock_runway.return_value = {'success': True, 'cost': 6.0}

            result = ai_service._try_fallback_provider(
                mock_video_generation,
                mock_source_file,
                'Veo3 API key not configured'
            )

            assert result['success'] is True
            assert result['fallback_used'] is True
            assert result['original_error'] == 'Veo3 API key not configured'
            assert result['fallback_provider'] == 'runway'
            mock_runway.assert_called_once()

    def test_caching_behavior(self, ai_service, mock_video_generation, mock_source_file):
        """Test caching of Veo3 results"""
        with patch.object(ai_service, '_get_cached_result') as mock_get_cache, \
             patch.object(ai_service, '_cache_result') as mock_set_cache:

            # Test cache hit
            cached_result = {'success': True, 'cached': True}
            mock_get_cache.return_value = cached_result
            ai_service.file_service.get_file_content.return_value = b'fake_content'

            with patch.object(ai_service, '_submit_veo3_generation'):
                result = ai_service._generate_with_veo3(mock_video_generation, mock_source_file)

            assert result == cached_result
            mock_get_cache.assert_called_once()

    @patch('services.ai_service.time.sleep')  # Mock sleep to speed up tests
    def test_wait_for_completion_timeout(self, mock_sleep, ai_service, mock_video_generation):
        """Test timeout handling in wait_for_completion"""
        with patch.object(ai_service, '_check_veo3_status') as mock_check:
            mock_check.return_value = {'success': True, 'status': 'processing'}

            with patch('services.ai_service.time.time') as mock_time:
                # Simulate timeout
                mock_time.side_effect = [0, 400]  # Start time, then time > max_wait_time

                result = ai_service._wait_for_veo3_completion(
                    mock_video_generation, 'job_123', 'api_key', 'cache_key'
                )

                assert result['success'] is False
                assert 'timeout' in result['error'].lower()

    def test_quality_settings_mapping(self, ai_service, mock_video_generation, mock_source_file, mock_file_content):
        """Test quality settings mapping for different video qualities"""
        quality_tests = [
            (VideoQuality.ECONOMY, '720p', 2000, 24, False),
            (VideoQuality.STANDARD, '1080p', 4000, 30, True),
            (VideoQuality.PREMIUM, '1080p', 8000, 60, True)
        ]

        for quality, expected_res, expected_bitrate, expected_fps, expected_audio_enhancement in quality_tests:
            mock_video_generation.video_quality = quality

            payload = ai_service._prepare_veo3_request(mock_video_generation, mock_source_file, mock_file_content)

            video_config = payload['video_config']
            assert video_config['resolution'] == expected_res
            assert video_config['bitrate'] == expected_bitrate
            assert video_config['fps'] == expected_fps

            gen_config = payload['generation_config']
            assert gen_config['audio_enhancement'] == expected_audio_enhancement

    def test_aspect_ratio_mapping(self, ai_service, mock_video_generation, mock_source_file, mock_file_content):
        """Test aspect ratio mapping to Veo3 format"""
        aspect_tests = [
            (AspectRatio.SQUARE, 'square'),
            (AspectRatio.PORTRAIT, 'portrait'),
            (AspectRatio.LANDSCAPE, 'landscape')
        ]

        for aspect_ratio, expected_veo3_format in aspect_tests:
            mock_video_generation.aspect_ratio = aspect_ratio

            payload = ai_service._prepare_veo3_request(mock_video_generation, mock_source_file, mock_file_content)

            assert payload['video_config']['aspect_ratio'] == expected_veo3_format

    def test_error_scenarios_comprehensive(self, ai_service, mock_video_generation, mock_source_file):
        """Test comprehensive error scenario handling"""
        error_scenarios = [
            # (condition, expected_error_content)
            ('no_api_key', 'API key not configured'),
            ('no_file_content', 'Unable to read source file'),
        ]

        for scenario, expected_error in error_scenarios:
            if scenario == 'no_api_key':
                with patch.object(ai_service.router, 'api_keys', {'veo3': None}):
                    result = ai_service._generate_with_veo3(mock_video_generation, mock_source_file)
            elif scenario == 'no_file_content':
                ai_service.file_service.get_file_content.return_value = None
                result = ai_service._generate_with_veo3(mock_video_generation, mock_source_file)

            assert result['success'] is False
            assert expected_error in result.get('error', '') or result.get('fallback_used', False)


class TestVeo3IntegrationScenarios:
    """Integration test scenarios for complete Veo3 workflows"""

    @pytest.fixture
    def integration_setup(self):
        """Set up integration test environment"""
        with patch('services.ai_service.current_app') as mock_app:
            mock_app.config.get.side_effect = lambda key, default=None: {
                'VEO3_API_KEY': 'test_veo3_key',
                'VEO3_API_BASE_URL': 'https://api.veo3.ai/v1',
            }.get(key, default)

            ai_service = AIService()
            ai_service.file_service = Mock()
            ai_service.file_service.get_file_content.return_value = b'fake_image_content'
            ai_service.file_service.store_file.return_value = {
                'success': True,
                'path': '/stored/video.mp4',
                'url': 'https://cdn.com/video.mp4'
            }

            return ai_service

    @patch('services.ai_service.requests.post')
    @patch('services.ai_service.requests.get')
    def test_end_to_end_async_workflow(self, mock_get, mock_post, integration_setup, mock_video_generation, mock_source_file):
        """Test complete async workflow from submission to completion"""
        ai_service = integration_setup

        # Step 1: Successful submission (async)
        mock_submit_response = Mock()
        mock_submit_response.status_code = 202
        mock_submit_response.json.return_value = {
            'job_id': 'veo3_job_async_123',
            'request_id': 'req_456'
        }
        mock_post.return_value = mock_submit_response

        # Step 2: Status check (processing)
        mock_status_response = Mock()
        mock_status_response.status_code = 200
        mock_status_response.json.return_value = {
            'status': 'processing',
            'progress': 75
        }

        # Step 3: Status check (completed)
        mock_completed_response = Mock()
        mock_completed_response.status_code = 200
        mock_completed_response.json.return_value = {
            'status': 'completed',
            'progress': 100,
            'video_url': 'https://veo3.ai/videos/final_123.mp4',
            'quality_metrics': {'lip_sync_accuracy': 91.0}
        }

        mock_get.side_effect = [mock_status_response, mock_completed_response]

        # Execute generation
        result = ai_service._generate_with_veo3(mock_video_generation, mock_source_file)

        # Verify async submission result
        assert result['success'] is True
        assert result['status'] == 'processing'
        assert result['job_id'] == 'veo3_job_async_123'

        # Verify video generation was updated
        assert mock_video_generation.provider_job_id == 'veo3_job_async_123'

    @patch('services.ai_service.requests.post')
    def test_end_to_end_fallback_workflow(self, mock_post, integration_setup, mock_video_generation, mock_source_file):
        """Test complete fallback workflow when Veo3 fails"""
        ai_service = integration_setup

        # Mock Veo3 failure
        mock_post.side_effect = requests.exceptions.ConnectionError('Network error')

        # Mock successful fallback
        with patch.object(ai_service, '_generate_with_runway') as mock_runway:
            mock_runway.return_value = {
                'success': True,
                'cost': 6.0,
                'output_file_path': '/stored/fallback_video.mp4'
            }

            result = ai_service._generate_with_veo3(mock_video_generation, mock_source_file)

            # Verify fallback was used
            assert result['success'] is True
            assert result['fallback_used'] is True
            assert result['original_error'] == 'Network error: Network error'
            assert result['fallback_provider'] == 'runway'
            assert result['cost'] == 6.0


if __name__ == '__main__':
    pytest.main([__file__, '-v', '--tb=short'])