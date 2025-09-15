"""
Unit Tests for Nano Banana API Client
Tests for AI-powered photo analysis using Google Gemini 2.5 Flash Image
"""

import pytest
import base64
import json
from unittest.mock import patch, MagicMock
import tempfile
import os
from PIL import Image, ImageDraw
import requests

from app.services.nano_banana_client import (
    NanoBananaClient, FaceDetectionResult, PhotoAnalysisResult
)


class TestNanoBananaClient:
    """Test suite for NanoBananaClient"""
    
    @pytest.fixture
    def mock_settings(self):
        """Mock settings for testing"""
        mock_settings = MagicMock()
        mock_settings.nano_banana_api_key = "test_api_key"
        mock_settings.nano_banana_base_url = "https://api.nanobanana.ai/v1"
        mock_settings.photo_processing_timeout = 30
        mock_settings.face_detection_confidence = 0.9
        mock_settings.supported_photo_formats = ["JPEG", "PNG", "WEBP"]
        mock_settings.max_photo_size_mb = 10
        return mock_settings
    
    @pytest.fixture
    def client(self, mock_settings):
        """Create NanoBananaClient with mocked settings"""
        with patch('app.services.nano_banana_client.get_settings', return_value=mock_settings):
            return NanoBananaClient()
    
    @pytest.fixture
    def sample_image_path(self):
        """Create a temporary sample image for testing"""
        img = Image.new('RGB', (400, 300), color='white')
        draw = ImageDraw.Draw(img)
        
        # Add face-like features
        draw.ellipse([100, 50, 300, 250], fill='beige')  # Face
        draw.ellipse([130, 100, 160, 130], fill='black')  # Left eye
        draw.ellipse([240, 100, 270, 130], fill='black')  # Right eye
        draw.arc([160, 180, 240, 220], start=0, end=180, fill='red', width=3)  # Mouth
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            img.save(tmp.name, 'JPEG')
            yield tmp.name
        
        os.unlink(tmp.name)
    
    @pytest.fixture
    def large_image_path(self):
        """Create a large test image"""
        img = Image.new('RGB', (2000, 1500), color='blue')
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            img.save(tmp.name, 'JPEG', quality=95)
            yield tmp.name
        
        os.unlink(tmp.name)
    
    def test_client_initialization(self, client):
        """Test client initialization"""
        assert client.api_key == "test_api_key"
        assert client.base_url == "https://api.nanobanana.ai/v1"
        assert client.timeout == 30
        assert client.session is not None
        assert "Authorization" in client.session.headers
        assert client.session.headers["Authorization"] == "Bearer test_api_key"
    
    def test_client_initialization_no_api_key(self):
        """Test client initialization without API key"""
        mock_settings = MagicMock()
        mock_settings.nano_banana_api_key = None
        mock_settings.nano_banana_base_url = "https://api.nanobanana.ai/v1"
        mock_settings.photo_processing_timeout = 30
        mock_settings.face_detection_confidence = 0.9
        
        with patch('app.services.nano_banana_client.get_settings', return_value=mock_settings):
            client = NanoBananaClient()
            assert client.api_key is None
    
    def test_encode_image_to_base64(self, client, sample_image_path):
        """Test image encoding to base64"""
        encoded = client._encode_image_to_base64(sample_image_path)
        
        assert isinstance(encoded, str)
        assert len(encoded) > 0
        
        # Test that it's valid base64
        try:
            decoded = base64.b64decode(encoded)
            assert len(decoded) > 0
        except Exception:
            pytest.fail("Invalid base64 encoding")
    
    def test_encode_image_to_base64_invalid_path(self, client):
        """Test image encoding with invalid path"""
        with pytest.raises(Exception):
            client._encode_image_to_base64("/nonexistent/path.jpg")
    
    def test_encode_pil_image_to_base64(self, client):
        """Test PIL image encoding to base64"""
        pil_image = Image.new('RGB', (100, 100), color='red')
        
        encoded = client._encode_pil_image_to_base64(pil_image)
        
        assert isinstance(encoded, str)
        assert len(encoded) > 0
        
        # Verify it's valid base64
        try:
            decoded = base64.b64decode(encoded)
            assert len(decoded) > 0
        except Exception:
            pytest.fail("Invalid base64 encoding")
    
    @patch('app.services.nano_banana_client.requests.Session.post')
    def test_make_request_success(self, mock_post, client):
        """Test successful API request"""
        # Mock successful response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": "success",
            "data": {"test": "value"}
        }
        mock_post.return_value = mock_response
        
        payload = {"test": "data"}
        result = client._make_request("test-endpoint", payload)
        
        assert result["status"] == "success"
        assert result["data"]["test"] == "value"
        assert "processing_time" in result
        
        # Verify request was made correctly
        mock_post.assert_called_once()
        call_args = mock_post.call_args
        assert call_args[1]["json"] == payload
        assert call_args[1]["timeout"] == 30
    
    @patch('app.services.nano_banana_client.requests.Session.post')
    def test_make_request_timeout(self, mock_post, client):
        """Test API request timeout"""
        mock_post.side_effect = requests.exceptions.Timeout("Request timeout")
        
        with pytest.raises(Exception, match="API request timeout"):
            client._make_request("test-endpoint", {"test": "data"})
    
    @patch('app.services.nano_banana_client.requests.Session.post')
    def test_make_request_http_error(self, mock_post, client):
        """Test API request HTTP error"""
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.text = "Bad Request"
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError(response=mock_response)
        mock_post.return_value = mock_response
        
        with pytest.raises(Exception, match="API request failed: 400"):
            client._make_request("test-endpoint", {"test": "data"})
    
    @pytest.mark.asyncio
    async def test_detect_faces_success(self, client, sample_image_path):
        """Test successful face detection"""
        mock_response = {
            "faces": [
                {
                    "confidence": 0.95,
                    "bounding_box": {"x": 100, "y": 50, "width": 200, "height": 200},
                    "landmarks": {
                        "left_eye": {"x": 130, "y": 100},
                        "right_eye": {"x": 240, "y": 100},
                        "nose": {"x": 185, "y": 140},
                        "mouth": {"x": 185, "y": 180},
                        "face_outline": [
                            {"x": 100, "y": 50}, {"x": 150, "y": 40}, {"x": 200, "y": 50}
                        ]
                    },
                    "expression": "neutral",
                    "head_pose": {"pitch": 0, "yaw": 5, "roll": -2}
                }
            ],
            "processing_time": 0.5
        }
        
        with patch.object(client, '_make_request', return_value=mock_response):
            result = await client.detect_faces(sample_image_path)
            
            assert isinstance(result, FaceDetectionResult)
            assert result.faces_detected == 1
            assert result.confidence > 0.9
            assert len(result.bounding_boxes) == 1
            assert len(result.landmarks) == 1
            assert result.processing_time == 0.5
            assert result.raw_response == mock_response
            
            # Check bounding box
            bbox = result.bounding_boxes[0]
            assert bbox['x'] == 100
            assert bbox['y'] == 50
            assert bbox['width'] == 200
            assert bbox['height'] == 200
            
            # Check landmarks
            landmarks = result.landmarks[0]
            assert landmarks['left_eye'] is not None
            assert landmarks['right_eye'] is not None
            assert landmarks['nose'] is not None
            assert landmarks['mouth'] is not None
    
    @pytest.mark.asyncio
    async def test_detect_faces_no_faces(self, client, sample_image_path):
        """Test face detection with no faces found"""
        mock_response = {
            "faces": [],
            "processing_time": 0.3
        }
        
        with patch.object(client, '_make_request', return_value=mock_response):
            result = await client.detect_faces(sample_image_path)
            
            assert isinstance(result, FaceDetectionResult)
            assert result.faces_detected == 0
            assert result.confidence == 0.0
            assert len(result.bounding_boxes) == 0
            assert len(result.landmarks) == 0
    
    @pytest.mark.asyncio
    async def test_detect_faces_api_error(self, client, sample_image_path):
        """Test face detection with API error"""
        with patch.object(client, '_make_request', side_effect=Exception("API Error")):
            result = await client.detect_faces(sample_image_path)
            
            # Should return empty result on error
            assert isinstance(result, FaceDetectionResult)
            assert result.faces_detected == 0
            assert result.confidence == 0.0
            assert result.processing_time == 0.0
            assert result.raw_response == {}
    
    @pytest.mark.asyncio
    async def test_detect_faces_custom_confidence(self, client, sample_image_path):
        """Test face detection with custom confidence threshold"""
        mock_response = {"faces": [], "processing_time": 0.2}
        
        with patch.object(client, '_make_request', return_value=mock_response) as mock_request:
            await client.detect_faces(sample_image_path, confidence_threshold=0.8)
            
            # Check that custom confidence was used in request
            call_args = mock_request.call_args[0]  # Get positional arguments
            payload = call_args[1]  # Second argument is payload
            assert payload["parameters"]["confidence_threshold"] == 0.8
    
    @pytest.mark.asyncio
    async def test_analyze_photo_quality_success(self, client, sample_image_path):
        """Test successful photo quality analysis"""
        mock_response = {
            "quality": {
                "overall_score": 0.85,
                "brightness": 0.7,
                "contrast": 0.8,
                "sharpness": 0.9,
                "noise_level": 0.2
            },
            "composition": {
                "overall_score": 0.75,
                "rule_of_thirds": 0.6,
                "symmetry": 0.8
            },
            "crop_suggestions": [
                {
                    "x": 50,
                    "y": 30,
                    "width": 300,
                    "height": 240,
                    "score": 0.9
                }
            ],
            "processing_time": 0.8
        }
        
        with patch.object(client, '_make_request', return_value=mock_response):
            result = await client.analyze_photo_quality(sample_image_path)
            
            assert isinstance(result, PhotoAnalysisResult)
            assert result.quality_score == 0.85
            assert result.brightness_score == 0.7
            assert result.contrast_score == 0.8
            assert result.sharpness_score == 0.9
            assert result.noise_level == 0.2
            assert result.composition_score == 0.75
            assert result.processing_time == 0.8
            assert result.raw_response == mock_response
            
            # Check crop suggestion
            assert result.crop_suggestions is not None
            assert result.crop_suggestions['x'] == 50
            assert result.crop_suggestions['y'] == 30
            assert result.crop_suggestions['width'] == 300
            assert result.crop_suggestions['height'] == 240
    
    @pytest.mark.asyncio
    async def test_analyze_photo_quality_no_crops(self, client, sample_image_path):
        """Test photo quality analysis with no crop suggestions"""
        mock_response = {
            "quality": {"overall_score": 0.6},
            "composition": {"overall_score": 0.5},
            "crop_suggestions": [],
            "processing_time": 0.4
        }
        
        with patch.object(client, '_make_request', return_value=mock_response):
            result = await client.analyze_photo_quality(sample_image_path)
            
            assert result.crop_suggestions is None
    
    @pytest.mark.asyncio
    async def test_analyze_photo_quality_api_error(self, client, sample_image_path):
        """Test photo quality analysis with API error"""
        with patch.object(client, '_make_request', side_effect=Exception("API Error")):
            result = await client.analyze_photo_quality(sample_image_path)
            
            # Should return default result on error
            assert isinstance(result, PhotoAnalysisResult)
            assert result.quality_score == 0.5
            assert result.processing_time == 0.0
            assert result.raw_response == {}
    
    def test_validate_image_format_valid(self, client, sample_image_path):
        """Test image format validation with valid image"""
        is_valid, error_msg = client.validate_image_format(sample_image_path)
        
        assert is_valid
        assert error_msg == ""
    
    def test_validate_image_format_unsupported_format(self, client):
        """Test image format validation with unsupported format"""
        # Create BMP image (not supported)
        img = Image.new('RGB', (100, 100), color='red')
        
        with tempfile.NamedTemporaryFile(suffix='.bmp', delete=False) as tmp:
            img.save(tmp.name, 'BMP')
            
            try:
                is_valid, error_msg = client.validate_image_format(tmp.name)
                
                assert not is_valid
                assert "Unsupported format" in error_msg
                
            finally:
                os.unlink(tmp.name)
    
    def test_validate_image_format_too_large(self, client, large_image_path):
        """Test image format validation with oversized image"""
        # Mock smaller size limit
        with patch.object(client.settings, 'max_photo_size_mb', 1):  # 1MB limit
            is_valid, error_msg = client.validate_image_format(large_image_path)
            
            # Large image should fail validation
            if not is_valid:
                assert "File too large" in error_msg
    
    def test_validate_image_format_too_small(self, client):
        """Test image format validation with very small image"""
        # Create very small image
        small_img = Image.new('RGB', (50, 50), color='blue')
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            small_img.save(tmp.name, 'JPEG')
            
            try:
                is_valid, error_msg = client.validate_image_format(tmp.name)
                
                assert not is_valid
                assert "Image too small" in error_msg
                
            finally:
                os.unlink(tmp.name)
    
    def test_validate_image_format_invalid_file(self, client):
        """Test image format validation with invalid file"""
        is_valid, error_msg = client.validate_image_format("/nonexistent/file.jpg")
        
        assert not is_valid
        assert "Invalid image file" in error_msg
    
    @patch('app.services.nano_banana_client.requests.Session.post')
    def test_get_api_usage_stats(self, mock_post, client):
        """Test API usage statistics retrieval"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "requests_this_month": 1500,
            "requests_remaining": 8500,
            "reset_date": "2025-10-01"
        }
        mock_post.return_value = mock_response
        
        stats = client.get_api_usage_stats()
        
        assert stats["requests_this_month"] == 1500
        assert stats["requests_remaining"] == 8500
        assert stats["reset_date"] == "2025-10-01"
    
    @patch('app.services.nano_banana_client.requests.Session.post')
    def test_get_api_usage_stats_error(self, mock_post, client):
        """Test API usage statistics with error"""
        mock_post.side_effect = Exception("Network error")
        
        stats = client.get_api_usage_stats()
        
        assert stats == {}  # Should return empty dict on error
    
    @patch('app.services.nano_banana_client.requests.Session.get')
    def test_health_check_success(self, mock_get, client):
        """Test successful health check"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response
        
        is_healthy = client.health_check()
        
        assert is_healthy
        mock_get.assert_called_once_with("https://api.nanobanana.ai/v1/health", timeout=5)
    
    @patch('app.services.nano_banana_client.requests.Session.get')
    def test_health_check_failure(self, mock_get, client):
        """Test health check failure"""
        mock_get.side_effect = Exception("Connection failed")
        
        is_healthy = client.health_check()
        
        assert not is_healthy
    
    @patch('app.services.nano_banana_client.requests.Session.get')
    def test_health_check_bad_status(self, mock_get, client):
        """Test health check with bad HTTP status"""
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_get.return_value = mock_response
        
        is_healthy = client.health_check()
        
        assert not is_healthy
    
    def test_error_handling_with_corrupted_image(self, client):
        """Test error handling with corrupted image file"""
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            tmp.write(b'corrupted_image_data')
            tmp.flush()
            
            try:
                with pytest.raises(Exception):
                    client._encode_image_to_base64(tmp.name)
            finally:
                os.unlink(tmp.name)
    
    def test_thread_safety(self, client, sample_image_path):
        """Test thread safety of client operations"""
        import concurrent.futures
        import asyncio
        
        async def detect_worker():
            return await client.detect_faces(sample_image_path)
        
        def run_detection():
            # Mock the API response to avoid actual network calls
            mock_response = {"faces": [], "processing_time": 0.1}
            with patch.object(client, '_make_request', return_value=mock_response):
                return asyncio.run(detect_worker())
        
        # Run multiple detections concurrently
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = [executor.submit(run_detection) for _ in range(5)]
            results = [future.result() for future in futures]
        
        # All results should be valid
        assert len(results) == 5
        for result in results:
            assert isinstance(result, FaceDetectionResult)
    
    def test_request_headers(self, client):
        """Test that request headers are set correctly"""
        assert "Authorization" in client.session.headers
        assert client.session.headers["Authorization"] == "Bearer test_api_key"
        assert client.session.headers["Content-Type"] == "application/json"
        assert client.session.headers["User-Agent"] == "TalkingPhoto-AI/1.0"
    
    @pytest.mark.asyncio
    async def test_multiple_faces_detection(self, client, sample_image_path):
        """Test detection of multiple faces"""
        mock_response = {
            "faces": [
                {
                    "confidence": 0.95,
                    "bounding_box": {"x": 50, "y": 50, "width": 150, "height": 150},
                    "landmarks": {"left_eye": {"x": 80, "y": 80}},
                    "expression": "happy"
                },
                {
                    "confidence": 0.88,
                    "bounding_box": {"x": 250, "y": 100, "width": 140, "height": 140},
                    "landmarks": {"left_eye": {"x": 280, "y": 130}},
                    "expression": "neutral"
                }
            ],
            "processing_time": 0.7
        }
        
        with patch.object(client, '_make_request', return_value=mock_response):
            result = await client.detect_faces(sample_image_path)
            
            assert result.faces_detected == 2
            assert len(result.bounding_boxes) == 2
            assert len(result.landmarks) == 2
            assert result.confidence == 0.915  # Average of 0.95 and 0.88


class TestFaceDetectionResult:
    """Test FaceDetectionResult data class"""
    
    def test_face_detection_result_creation(self):
        """Test FaceDetectionResult creation"""
        result = FaceDetectionResult(
            faces_detected=2,
            confidence=0.9,
            bounding_boxes=[{"x": 100, "y": 100, "width": 200, "height": 200}],
            landmarks=[{"left_eye": {"x": 130, "y": 140}}],
            processing_time=0.5,
            raw_response={"status": "success"}
        )
        
        assert result.faces_detected == 2
        assert result.confidence == 0.9
        assert len(result.bounding_boxes) == 1
        assert len(result.landmarks) == 1
        assert result.processing_time == 0.5
        assert result.raw_response["status"] == "success"


class TestPhotoAnalysisResult:
    """Test PhotoAnalysisResult data class"""
    
    def test_photo_analysis_result_creation(self):
        """Test PhotoAnalysisResult creation"""
        result = PhotoAnalysisResult(
            quality_score=0.85,
            brightness_score=0.7,
            contrast_score=0.8,
            sharpness_score=0.9,
            noise_level=0.2,
            composition_score=0.75,
            crop_suggestions={"x": 50, "y": 30, "width": 300, "height": 240},
            processing_time=0.8,
            raw_response={"status": "analyzed"}
        )
        
        assert result.quality_score == 0.85
        assert result.brightness_score == 0.7
        assert result.contrast_score == 0.8
        assert result.sharpness_score == 0.9
        assert result.noise_level == 0.2
        assert result.composition_score == 0.75
        assert result.crop_suggestions["x"] == 50
        assert result.processing_time == 0.8
        assert result.raw_response["status"] == "analyzed"


if __name__ == "__main__":
    pytest.main([__file__])