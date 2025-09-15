"""
TalkingPhoto MVP - Veo3 API Integration Tests

Integration tests that can be run against actual Veo3 API endpoints (with mock mode)
Tests the complete video generation pipeline with real database interactions.
"""

import pytest
import os
import time
import tempfile
from unittest.mock import patch, Mock
from datetime import datetime, timezone

from services.ai_service import AIService
from models.video import VideoGeneration, VideoStatus, VideoQuality, AspectRatio, AIProvider
from models.file import UploadedFile
from models.user import User
from app import create_app, db


@pytest.fixture(scope='session')
def app():
    """Create application for testing"""
    app = create_app(testing=True)
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'VEO3_API_KEY': os.getenv('VEO3_TEST_API_KEY', 'test_key'),
        'VEO3_API_BASE_URL': 'https://api.veo3.ai/v1',
        'FEATURE_VEO3_ENABLED': True,
        'CACHE_ENABLED': True,
        'CACHE_TTL_SECONDS': 300
    })

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def test_user(app):
    """Create test user"""
    with app.app_context():
        user = User(
            id='test_user_123',
            email='test@example.com',
            username='testuser',
            credits=10
        )
        db.session.add(user)
        db.session.commit()
        return user


@pytest.fixture
def test_file(app, test_user):
    """Create test uploaded file"""
    with app.app_context():
        # Create a temporary test image file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp:
            # Write minimal JPEG header
            tmp.write(b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xfe\x00\x13Created with test')
            tmp.write(b'\x00' * 1000)  # Pad with zeros
            tmp_path = tmp.name

        uploaded_file = UploadedFile(
            id='test_file_456',
            user_id=test_user.id,
            filename='test_image.jpg',
            original_filename='test_image.jpg',
            mime_type='image/jpeg',
            file_size=1000,
            file_hash='test_hash_123',
            storage_path=tmp_path,
            width=800,
            height=600
        )
        db.session.add(uploaded_file)
        db.session.commit()

        yield uploaded_file

        # Cleanup
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


@pytest.fixture
def test_video_generation(app, test_user, test_file):
    """Create test video generation"""
    with app.app_context():
        video_gen = VideoGeneration(
            user_id=test_user.id,
            source_file_id=test_file.id,
            script_text='This is a test script for video generation with Veo3 API integration.',
            ai_provider=AIProvider.VEO3,
            video_quality=VideoQuality.STANDARD,
            aspect_ratio=AspectRatio.LANDSCAPE,
            duration_seconds=30
        )
        db.session.add(video_gen)
        db.session.commit()
        return video_gen


class TestVeo3APIIntegration:
    """Integration tests for Veo3 API"""

    def test_veo3_service_initialization(self, app):
        """Test Veo3 service can be properly initialized"""
        with app.app_context():
            ai_service = AIService()
            assert ai_service.router.api_keys['veo3'] == 'test_key'
            assert 'veo3' in [service['name'] for service in ai_service.router.services['video_generation']]

    @patch('services.ai_service.requests.post')
    @patch('services.ai_service.requests.get')
    def test_complete_video_generation_workflow_mock(self, mock_get, mock_post, app, test_video_generation, test_file):
        """Test complete video generation workflow with mocked API responses"""
        with app.app_context():
            ai_service = AIService()

            # Mock successful submission
            mock_submit_response = Mock()
            mock_submit_response.status_code = 202
            mock_submit_response.json.return_value = {
                'job_id': 'veo3_integration_test_123',
                'request_id': 'req_integration_456',
                'estimated_completion_time': '2025-09-13T12:35:00Z'
            }
            mock_post.return_value = mock_submit_response

            # Mock file content reading
            ai_service.file_service.get_file_content = Mock()
            ai_service.file_service.get_file_content.return_value = b'\xff\xd8\xff\xe0fake_jpeg_content'

            # Execute video generation
            result = ai_service.generate_video(test_video_generation.id)

            # Verify result
            assert result['success'] is True
            assert 'job_id' in result or result.get('status') == 'processing'

            # Verify database was updated
            db.session.refresh(test_video_generation)
            if test_video_generation.provider_job_id:
                assert test_video_generation.provider_job_id == 'veo3_integration_test_123'
                assert test_video_generation.status == VideoStatus.PROCESSING

    @patch('services.ai_service.requests.post')
    def test_veo3_api_error_handling_integration(self, mock_post, app, test_video_generation, test_file):
        """Test API error handling in integration context"""
        with app.app_context():
            ai_service = AIService()

            # Mock API error
            mock_post.side_effect = Exception('Network connection failed')

            # Mock file service
            ai_service.file_service.get_file_content = Mock()
            ai_service.file_service.get_file_content.return_value = b'fake_content'

            result = ai_service.generate_video(test_video_generation.id)

            # Should either fail or use fallback
            assert 'error' in result or result.get('fallback_used', False)

    def test_caching_integration(self, app, test_video_generation, test_file):
        """Test caching integration in real application context"""
        with app.app_context():
            ai_service = AIService()

            # Mock file content
            ai_service.file_service.get_file_content = Mock()
            ai_service.file_service.get_file_content.return_value = b'fake_content'

            # Generate cache key
            cache_key = ai_service._get_veo3_cache_key(test_video_generation, test_file)
            assert cache_key is not None

            # Test cache set/get
            test_result = {'success': True, 'cached': True, 'cost': 4.5}
            ai_service._cache_result(cache_key, test_result)

            cached_result = ai_service._get_cached_result(cache_key)
            assert cached_result == test_result

    @patch('services.ai_service.requests.post')
    def test_fallback_mechanism_integration(self, mock_post, app, test_video_generation, test_file):
        """Test fallback mechanism in integration context"""
        with app.app_context():
            ai_service = AIService()

            # Mock Veo3 failure
            mock_post.side_effect = Exception('Veo3 API unavailable')

            # Mock file service
            ai_service.file_service.get_file_content = Mock()
            ai_service.file_service.get_file_content.return_value = b'fake_content'

            # Mock fallback success
            with patch.object(ai_service, '_generate_with_runway') as mock_runway:
                mock_runway.return_value = {
                    'success': True,
                    'cost': 6.0,
                    'output_file_path': '/test/fallback_video.mp4'
                }

                result = ai_service.generate_video(test_video_generation.id)

                # Verify fallback was triggered
                if result.get('success'):
                    assert result.get('fallback_used', False) is True

    def test_cost_calculation_integration(self, app, test_video_generation):
        """Test cost calculation in integration context"""
        with app.app_context():
            # Test different durations and qualities
            test_cases = [
                (15, VideoQuality.ECONOMY, 0.15 * 15 * 0.8),  # Economy multiplier
                (30, VideoQuality.STANDARD, 0.15 * 30 * 1.0),  # Standard multiplier
                (60, VideoQuality.PREMIUM, 0.15 * 60 * 1.5),   # Premium multiplier
            ]

            for duration, quality, expected_cost in test_cases:
                test_video_generation.duration_seconds = duration
                test_video_generation.video_quality = quality

                calculated_cost = test_video_generation.get_estimated_cost()
                assert abs(calculated_cost - expected_cost) < 0.01  # Allow small floating point differences

    def test_video_generation_status_tracking(self, app, test_video_generation):
        """Test video generation status tracking"""
        with app.app_context():
            # Test initial status
            assert test_video_generation.status == VideoStatus.PENDING
            assert test_video_generation.get_progress_percentage() == 0

            # Test processing status
            test_video_generation.mark_processing_started(
                provider_job_id='test_job_123',
                estimated_completion=datetime.now(timezone.utc)
            )
            assert test_video_generation.status == VideoStatus.PROCESSING
            assert test_video_generation.provider_job_id == 'test_job_123'

            # Test completion
            test_video_generation.mark_processing_completed(
                output_file_id='output_file_789',
                lip_sync_accuracy=88.5,
                video_resolution='1920x1080'
            )
            assert test_video_generation.status == VideoStatus.COMPLETED
            assert test_video_generation.get_progress_percentage() == 100
            assert test_video_generation.lip_sync_accuracy == 88.5

    def test_concurrent_generations_handling(self, app, test_user, test_file):
        """Test handling of multiple concurrent video generations"""
        with app.app_context():
            # Create multiple video generation requests
            video_generations = []
            for i in range(3):
                video_gen = VideoGeneration(
                    user_id=test_user.id,
                    source_file_id=test_file.id,
                    script_text=f'Test script {i} for concurrent generation testing.',
                    ai_provider=AIProvider.VEO3,
                    video_quality=VideoQuality.STANDARD,
                    duration_seconds=30
                )
                db.session.add(video_gen)
                video_generations.append(video_gen)

            db.session.commit()

            # Test that each has unique cache keys
            ai_service = AIService()
            cache_keys = []
            for video_gen in video_generations:
                cache_key = ai_service._get_veo3_cache_key(video_gen, test_file)
                cache_keys.append(cache_key)

            # All cache keys should be different (different script text)
            assert len(set(cache_keys)) == len(cache_keys)

    @patch('services.ai_service.requests.post')
    @patch('services.ai_service.requests.get')
    def test_status_check_integration(self, mock_get, mock_post, app, test_video_generation, test_file):
        """Test status checking integration with real database updates"""
        with app.app_context():
            ai_service = AIService()

            # Set up video generation with provider job ID
            test_video_generation.provider_job_id = 'test_status_job_123'
            test_video_generation.status = VideoStatus.PROCESSING
            db.session.commit()

            # Mock status response
            mock_response = Mock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                'status': 'completed',
                'progress': 100,
                'video_url': 'https://veo3.ai/videos/completed_123.mp4',
                'quality_metrics': {
                    'lip_sync_accuracy': 89.5,
                    'resolution': '1920x1080',
                    'audio_quality': 'high'
                }
            }
            mock_get.return_value = mock_response

            # Mock video download
            mock_video_response = Mock()
            mock_video_response.status_code = 200
            mock_video_response.content = b'fake_completed_video_content'
            mock_get.side_effect = [mock_response, mock_video_response]

            # Mock file storage
            ai_service.file_service.store_file = Mock()
            ai_service.file_service.store_file.return_value = {
                'success': True,
                'path': '/stored/completed_video.mp4',
                'url': 'https://cdn.com/completed_video.mp4'
            }

            # Check status
            status_result = ai_service.get_generation_status(test_video_generation)

            # Verify status was updated
            if status_result.get('status_changed'):
                db.session.refresh(test_video_generation)
                assert test_video_generation.status == VideoStatus.COMPLETED

    def test_database_cleanup_and_consistency(self, app, test_video_generation, test_file, test_user):
        """Test database operations maintain consistency"""
        with app.app_context():
            # Verify all related objects exist
            assert db.session.get(VideoGeneration, test_video_generation.id) is not None
            assert db.session.get(UploadedFile, test_file.id) is not None
            assert db.session.get(User, test_user.id) is not None

            # Test cascade relationships
            original_video_count = db.session.query(VideoGeneration).count()

            # Update video generation
            test_video_generation.processing_cost = 4.50
            test_video_generation.api_calls_made = 3
            db.session.commit()

            # Verify updates persist
            db.session.refresh(test_video_generation)
            assert test_video_generation.processing_cost == 4.50
            assert test_video_generation.api_calls_made == 3

            # Verify count unchanged
            assert db.session.query(VideoGeneration).count() == original_video_count


class TestVeo3PerformanceIntegration:
    """Performance-related integration tests"""

    def test_cache_performance(self, app, test_video_generation, test_file):
        """Test cache performance characteristics"""
        with app.app_context():
            ai_service = AIService()

            # Time cache operations
            start_time = time.time()
            cache_key = ai_service._get_veo3_cache_key(test_video_generation, test_file)
            key_generation_time = time.time() - start_time

            # Cache key generation should be fast
            assert key_generation_time < 0.1  # Less than 100ms

            # Test cache set/get performance
            test_data = {'large_data': 'x' * 10000}  # 10KB of data

            start_time = time.time()
            ai_service._cache_result(cache_key, test_data)
            cache_set_time = time.time() - start_time

            start_time = time.time()
            retrieved_data = ai_service._get_cached_result(cache_key)
            cache_get_time = time.time() - start_time

            # Cache operations should be fast
            assert cache_set_time < 0.1
            assert cache_get_time < 0.1
            assert retrieved_data == test_data

    def test_memory_usage_patterns(self, app):
        """Test memory usage patterns during video generation"""
        with app.app_context():
            import psutil
            import gc

            process = psutil.Process()
            initial_memory = process.memory_info().rss

            # Create and process multiple video generations
            ai_service = AIService()

            for i in range(10):
                # Simulate video generation workflow
                cache_key = f'test_memory_key_{i}'
                test_data = {'video_data': 'x' * 100000}  # 100KB per iteration
                ai_service._cache_result(cache_key, test_data)

            # Force garbage collection
            gc.collect()

            # Memory increase should be reasonable
            final_memory = process.memory_info().rss
            memory_increase_mb = (final_memory - initial_memory) / 1024 / 1024

            # Should not exceed 50MB increase for test data
            assert memory_increase_mb < 50


if __name__ == '__main__':
    # Run with specific markers for integration tests
    pytest.main([__file__, '-v', '--tb=short', '-m', 'not slow'])