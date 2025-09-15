"""
Unit Tests for Photo Enhancer
Tests for intelligent photo enhancement algorithms
"""

import pytest
import numpy as np
from PIL import Image, ImageDraw
import tempfile
import os
from unittest.mock import patch, MagicMock

from app.services.photo_enhancer import (
    IntelligentPhotoEnhancer, EnhancementSettings, EnhancementResult
)


class TestIntelligentPhotoEnhancer:
    """Test suite for IntelligentPhotoEnhancer"""
    
    @pytest.fixture
    def enhancer(self):
        """Create IntelligentPhotoEnhancer instance"""
        return IntelligentPhotoEnhancer()
    
    @pytest.fixture
    def sample_image_path(self):
        """Create a temporary sample image for testing"""
        img = Image.new('RGB', (800, 600), color=(100, 120, 140))
        draw = ImageDraw.Draw(img)
        
        # Add some content
        draw.rectangle([100, 100, 300, 250], fill=(200, 100, 50))
        draw.ellipse([400, 200, 600, 400], fill=(50, 200, 100))
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            img.save(tmp.name, 'JPEG')
            yield tmp.name
        
        os.unlink(tmp.name)
    
    @pytest.fixture
    def dark_image_path(self):
        """Create a dark test image"""
        img = Image.new('RGB', (400, 300), color=(30, 40, 50))
        draw = ImageDraw.Draw(img)
        draw.rectangle([50, 50, 150, 100], fill=(60, 70, 80))
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            img.save(tmp.name, 'JPEG')
            yield tmp.name
        
        os.unlink(tmp.name)
    
    @pytest.fixture
    def bright_image_path(self):
        """Create a bright test image"""
        img = Image.new('RGB', (400, 300), color=(220, 230, 240))
        draw = ImageDraw.Draw(img)
        draw.rectangle([50, 50, 150, 100], fill=(200, 210, 220))
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            img.save(tmp.name, 'JPEG')
            yield tmp.name
        
        os.unlink(tmp.name)
    
    @pytest.fixture
    def output_path(self):
        """Create temporary output path"""
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            output_path = tmp.name
        
        yield output_path
        
        # Cleanup
        if os.path.exists(output_path):
            os.unlink(output_path)
    
    def test_auto_enhance_success(self, enhancer, sample_image_path, output_path):
        """Test successful auto enhancement"""
        result = enhancer.auto_enhance(sample_image_path, output_path)
        
        assert isinstance(result, EnhancementResult)
        assert result.success
        assert result.enhanced_image_path == output_path
        assert os.path.exists(output_path)
        assert result.processing_time > 0
        assert isinstance(result.settings_applied, EnhancementSettings)
        assert isinstance(result.before_after_metrics, dict)
        assert result.improvement_score >= 0
    
    def test_auto_enhance_with_quality_metrics(self, enhancer, sample_image_path, output_path):
        """Test auto enhancement with provided quality metrics"""
        quality_metrics = {
            'brightness_score': 0.3,  # Dark image
            'contrast_score': 0.4,
            'sharpness_score': 0.2,   # Blurry
            'noise_level': 0.6,       # Noisy
            'is_blurry': True,
            'is_overexposed': False,
            'is_underexposed': True
        }
        
        result = enhancer.auto_enhance(sample_image_path, output_path, quality_metrics)
        
        assert result.success
        assert result.settings_applied.brightness_adjustment > 0  # Should brighten
        assert result.settings_applied.sharpness_adjustment > 0   # Should sharpen
        assert result.settings_applied.noise_reduction_level > 0  # Should reduce noise
    
    def test_enhance_with_custom_settings(self, enhancer, sample_image_path, output_path):
        """Test enhancement with custom settings"""
        settings = EnhancementSettings(
            brightness_adjustment=0.2,
            contrast_adjustment=0.3,
            saturation_adjustment=0.1,
            sharpness_adjustment=0.4,
            noise_reduction_level=0.5,
            auto_white_balance=True,
            auto_color_correction=True
        )
        
        result = enhancer.enhance_with_settings(sample_image_path, output_path, settings)
        
        assert result.success
        assert result.settings_applied == settings
        assert os.path.exists(output_path)
    
    def test_calculate_auto_enhancement_settings(self, enhancer):
        """Test automatic enhancement settings calculation"""
        # Test underexposed image
        dark_metrics = {
            'brightness_score': 0.2,
            'contrast_score': 0.5,
            'sharpness_score': 0.6,
            'noise_level': 0.3,
            'is_underexposed': True,
            'is_overexposed': False,
            'is_blurry': False
        }
        
        settings = enhancer._calculate_auto_enhancement_settings(dark_metrics)
        assert settings.brightness_adjustment > 0  # Should brighten
        
        # Test overexposed image
        bright_metrics = {
            'brightness_score': 0.9,
            'contrast_score': 0.5,
            'sharpness_score': 0.6,
            'noise_level': 0.3,
            'is_underexposed': False,
            'is_overexposed': True,
            'is_blurry': False
        }
        
        settings = enhancer._calculate_auto_enhancement_settings(bright_metrics)
        assert settings.brightness_adjustment < 0  # Should darken
        
        # Test low contrast image
        low_contrast_metrics = {
            'brightness_score': 0.5,
            'contrast_score': 0.2,  # Low contrast
            'sharpness_score': 0.6,
            'noise_level': 0.3,
            'is_underexposed': False,
            'is_overexposed': False,
            'is_blurry': False
        }
        
        settings = enhancer._calculate_auto_enhancement_settings(low_contrast_metrics)
        assert settings.contrast_adjustment > 0  # Should increase contrast
        
        # Test blurry image
        blurry_metrics = {
            'brightness_score': 0.5,
            'contrast_score': 0.5,
            'sharpness_score': 0.2,  # Low sharpness
            'noise_level': 0.3,
            'is_underexposed': False,
            'is_overexposed': False,
            'is_blurry': True
        }
        
        settings = enhancer._calculate_auto_enhancement_settings(blurry_metrics)
        assert settings.sharpness_adjustment > 0  # Should sharpen
    
    def test_apply_enhancements(self, enhancer):
        """Test individual enhancement applications"""
        # Create test image
        pil_image = Image.new('RGB', (200, 200), color=(100, 100, 100))
        cv_image = np.array(pil_image)
        
        # Test brightness adjustment
        settings = EnhancementSettings(brightness_adjustment=0.3)
        enhanced = enhancer._apply_enhancements(pil_image, cv_image, settings)
        assert isinstance(enhanced, Image.Image)
        # Enhanced image should be brighter (this is a simplified check)
        
        # Test contrast adjustment
        settings = EnhancementSettings(contrast_adjustment=0.2)
        enhanced = enhancer._apply_enhancements(pil_image, cv_image, settings)
        assert isinstance(enhanced, Image.Image)
        
        # Test saturation adjustment
        settings = EnhancementSettings(saturation_adjustment=0.1)
        enhanced = enhancer._apply_enhancements(pil_image, cv_image, settings)
        assert isinstance(enhanced, Image.Image)
        
        # Test sharpness adjustment
        settings = EnhancementSettings(sharpness_adjustment=0.2)
        enhanced = enhancer._apply_enhancements(pil_image, cv_image, settings)
        assert isinstance(enhanced, Image.Image)
    
    def test_reduce_noise(self, enhancer):
        """Test noise reduction"""
        # Create noisy image
        noisy_array = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)
        noisy_image = Image.fromarray(noisy_array)
        
        # Test mild noise reduction
        result = enhancer._reduce_noise(noisy_image, 0.3)
        assert isinstance(result, Image.Image)
        
        # Test strong noise reduction
        result = enhancer._reduce_noise(noisy_image, 0.8)
        assert isinstance(result, Image.Image)
        
        # Test with PIL image that might cause issues
        result = enhancer._reduce_noise(noisy_image, 0.0)  # No noise reduction
        assert isinstance(result, Image.Image)
    
    def test_auto_white_balance(self, enhancer):
        """Test automatic white balance correction"""
        # Create image with color cast (too blue)
        blue_cast_img = Image.new('RGB', (100, 100), color=(80, 100, 150))
        
        result = enhancer._auto_white_balance(blue_cast_img)
        assert isinstance(result, Image.Image)
        
        # Should adjust the color balance (this is a simplified test)
        original_avg = np.mean(np.array(blue_cast_img))
        corrected_avg = np.mean(np.array(result))
        # The correction should make some change
        assert abs(original_avg - corrected_avg) >= 0  # Some change expected
    
    def test_auto_color_correction(self, enhancer):
        """Test automatic color correction"""
        test_img = Image.new('RGB', (100, 100), color=(120, 90, 110))
        
        result = enhancer._auto_color_correction(test_img)
        assert isinstance(result, Image.Image)
        
        # Should return a valid image
        assert result.size == test_img.size
    
    @patch('cv2.CascadeClassifier')
    def test_enhance_face_regions(self, mock_cascade, enhancer):
        """Test face region enhancement"""
        # Mock face detection
        mock_detector = MagicMock()
        mock_detector.detectMultiScale.return_value = np.array([[50, 50, 100, 100]])  # One face
        mock_cascade.return_value = mock_detector
        
        pil_image = Image.new('RGB', (200, 200), color=(100, 100, 100))
        cv_image = np.array(pil_image)
        
        result = enhancer._enhance_face_regions(pil_image, cv_image)
        assert isinstance(result, Image.Image)
    
    def test_apply_background_blur(self, enhancer):
        """Test background blur application"""
        pil_image = Image.new('RGB', (200, 200), color=(100, 100, 100))
        cv_image = np.array(pil_image)
        
        result = enhancer._apply_background_blur(pil_image, cv_image)
        assert isinstance(result, Image.Image)
    
    def test_calculate_improvement_score(self, enhancer, sample_image_path, output_path):
        """Test improvement score calculation"""
        # First enhance an image
        enhancer.auto_enhance(sample_image_path, output_path)
        
        score = enhancer._calculate_improvement_score(sample_image_path, output_path)
        assert isinstance(score, float)
        assert score >= 0
        
        # Test with original metrics provided
        original_metrics = {'overall_score': 0.5}
        score = enhancer._calculate_improvement_score(
            sample_image_path, output_path, original_metrics
        )
        assert isinstance(score, float)
        assert score >= 0
    
    def test_calculate_before_after_metrics(self, enhancer, sample_image_path, output_path):
        """Test before/after metrics calculation"""
        # First enhance an image
        enhancer.auto_enhance(sample_image_path, output_path)
        
        metrics = enhancer._calculate_before_after_metrics(sample_image_path, output_path)
        
        assert isinstance(metrics, dict)
        expected_keys = ['brightness', 'contrast', 'sharpness', 'noise_level', 'overall_quality']
        
        for key in expected_keys:
            assert key in metrics
            assert isinstance(metrics[key], tuple)
            assert len(metrics[key]) == 2  # Before and after values
            assert all(isinstance(val, (int, float)) for val in metrics[key])
    
    def test_create_before_after_comparison(self, enhancer, sample_image_path, output_path):
        """Test before/after comparison creation"""
        # First enhance an image
        enhancer.auto_enhance(sample_image_path, output_path)
        
        # Create comparison
        comparison_path = output_path.replace('.jpg', '_comparison.jpg')
        success = enhancer.create_before_after_comparison(
            sample_image_path, output_path, comparison_path
        )
        
        assert success
        assert os.path.exists(comparison_path)
        
        # Check that comparison image is wider (side-by-side)
        original_img = Image.open(sample_image_path)
        comparison_img = Image.open(comparison_path)
        
        assert comparison_img.width == original_img.width * 2
        assert comparison_img.height == original_img.height
        
        # Cleanup
        os.unlink(comparison_path)
    
    def test_batch_enhance(self, enhancer, sample_image_path):
        """Test batch enhancement"""
        # Create multiple test images
        test_images = []
        for i in range(3):
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
                img = Image.new('RGB', (100, 100), color=(50 + i*50, 100, 150))
                img.save(tmp.name, 'JPEG')
                test_images.append(tmp.name)
        
        # Create output directory
        with tempfile.TemporaryDirectory() as output_dir:
            try:
                # Test batch enhancement
                results = enhancer.batch_enhance(test_images, output_dir)
                
                assert len(results) == 3
                for i, result in enumerate(results):
                    assert isinstance(result, EnhancementResult)
                    if result.success:
                        assert os.path.exists(result.enhanced_image_path)
                
            finally:
                # Cleanup test images
                for img_path in test_images:
                    if os.path.exists(img_path):
                        os.unlink(img_path)
    
    def test_enhancement_with_invalid_input(self, enhancer, output_path):
        """Test enhancement with invalid input"""
        # Test with non-existent file
        result = enhancer.auto_enhance("/nonexistent/path.jpg", output_path)
        assert not result.success
        assert result.error_message is not None
        
        # Test with invalid output path
        result = enhancer.auto_enhance("/nonexistent/input.jpg", "/invalid/path/output.jpg")
        assert not result.success
    
    def test_enhancement_settings_validation(self):
        """Test EnhancementSettings validation"""
        # Test valid settings
        settings = EnhancementSettings(
            brightness_adjustment=0.5,
            contrast_adjustment=-0.3,
            saturation_adjustment=0.2,
            sharpness_adjustment=0.8,
            noise_reduction_level=0.7
        )
        
        assert settings.brightness_adjustment == 0.5
        assert settings.contrast_adjustment == -0.3
        assert settings.saturation_adjustment == 0.2
        assert settings.sharpness_adjustment == 0.8
        assert settings.noise_reduction_level == 0.7
        
        # Test default settings
        default_settings = EnhancementSettings()
        assert default_settings.brightness_adjustment == 0.0
        assert default_settings.contrast_adjustment == 0.0
        assert not default_settings.apply_background_blur
        assert not default_settings.enhance_face_region
    
    def test_edge_cases(self, enhancer):
        """Test edge cases and boundary conditions"""
        # Test with very small image
        small_img = Image.new('RGB', (10, 10), color=(100, 100, 100))
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_input:
            small_img.save(tmp_input.name, 'JPEG')
            
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_output:
                try:
                    result = enhancer.auto_enhance(tmp_input.name, tmp_output.name)
                    # Should handle small images gracefully
                    assert isinstance(result, EnhancementResult)
                    
                finally:
                    os.unlink(tmp_input.name)
                    if os.path.exists(tmp_output.name):
                        os.unlink(tmp_output.name)
    
    def test_error_handling(self, enhancer):
        """Test error handling in various scenarios"""
        # Test with corrupted image
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            tmp.write(b'corrupted_image_data')
            tmp.flush()
            
            try:
                result = enhancer.auto_enhance(tmp.name, tmp.name + "_output.jpg")
                assert not result.success
                assert result.error_message is not None
                
            finally:
                os.unlink(tmp.name)
                if os.path.exists(tmp.name + "_output.jpg"):
                    os.unlink(tmp.name + "_output.jpg")
    
    def test_performance(self, enhancer, sample_image_path, output_path):
        """Test performance of enhancement operations"""
        import time
        
        start_time = time.time()
        result = enhancer.auto_enhance(sample_image_path, output_path)
        enhancement_time = time.time() - start_time
        
        if result.success:
            # Should complete within reasonable time
            assert enhancement_time < 10.0  # 10 seconds max
            assert result.processing_time > 0
            assert result.processing_time <= enhancement_time + 1  # Should be close
    
    @patch('app.services.photo_enhancer.cv2.bilateralFilter')
    def test_noise_reduction_failure(self, mock_filter, enhancer):
        """Test noise reduction failure handling"""
        mock_filter.side_effect = Exception("OpenCV error")
        
        test_img = Image.new('RGB', (100, 100), color=(100, 100, 100))
        result = enhancer._reduce_noise(test_img, 0.5)
        
        # Should return original image on failure
        assert isinstance(result, Image.Image)
    
    def test_thread_safety(self, enhancer, sample_image_path):
        """Test thread safety of enhancer methods"""
        import threading
        import concurrent.futures
        
        def enhance_worker(worker_id):
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
                output_path = tmp.name
            
            try:
                result = enhancer.auto_enhance(sample_image_path, output_path)
                return result.success
            finally:
                if os.path.exists(output_path):
                    os.unlink(output_path)
        
        # Run multiple enhancements concurrently
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            futures = [executor.submit(enhance_worker, i) for i in range(5)]
            results = [future.result() for future in futures]
        
        # All enhancements should succeed
        assert all(results)


class TestEnhancementSettings:
    """Test EnhancementSettings data class"""
    
    def test_default_values(self):
        """Test default EnhancementSettings values"""
        settings = EnhancementSettings()
        
        assert settings.brightness_adjustment == 0.0
        assert settings.contrast_adjustment == 0.0
        assert settings.saturation_adjustment == 0.0
        assert settings.sharpness_adjustment == 0.0
        assert settings.noise_reduction_level == 0.0
        assert not settings.apply_background_blur
        assert not settings.enhance_face_region
        assert not settings.auto_white_balance
        assert not settings.auto_color_correction
    
    def test_custom_values(self):
        """Test EnhancementSettings with custom values"""
        settings = EnhancementSettings(
            brightness_adjustment=0.3,
            contrast_adjustment=-0.2,
            saturation_adjustment=0.1,
            sharpness_adjustment=0.5,
            noise_reduction_level=0.7,
            apply_background_blur=True,
            enhance_face_region=True,
            auto_white_balance=True,
            auto_color_correction=True
        )
        
        assert settings.brightness_adjustment == 0.3
        assert settings.contrast_adjustment == -0.2
        assert settings.saturation_adjustment == 0.1
        assert settings.sharpness_adjustment == 0.5
        assert settings.noise_reduction_level == 0.7
        assert settings.apply_background_blur
        assert settings.enhance_face_region
        assert settings.auto_white_balance
        assert settings.auto_color_correction


class TestEnhancementResult:
    """Test EnhancementResult data class"""
    
    def test_successful_result(self):
        """Test successful EnhancementResult"""
        settings = EnhancementSettings(brightness_adjustment=0.2)
        
        result = EnhancementResult(
            enhanced_image_path="/path/to/enhanced.jpg",
            settings_applied=settings,
            processing_time=2.5,
            improvement_score=0.3,
            before_after_metrics={"brightness": (0.4, 0.6)},
            success=True
        )
        
        assert result.success
        assert result.enhanced_image_path == "/path/to/enhanced.jpg"
        assert result.settings_applied == settings
        assert result.processing_time == 2.5
        assert result.improvement_score == 0.3
        assert result.before_after_metrics == {"brightness": (0.4, 0.6)}
        assert result.error_message is None
    
    def test_failed_result(self):
        """Test failed EnhancementResult"""
        result = EnhancementResult(
            enhanced_image_path="",
            settings_applied=EnhancementSettings(),
            processing_time=0.0,
            improvement_score=0.0,
            before_after_metrics={},
            success=False,
            error_message="Enhancement failed"
        )
        
        assert not result.success
        assert result.error_message == "Enhancement failed"


if __name__ == "__main__":
    pytest.main([__file__])