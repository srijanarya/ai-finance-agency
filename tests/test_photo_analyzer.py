"""
Unit Tests for Photo Quality Analyzer
Tests for AI-powered photo quality assessment and composition analysis
"""

import pytest
import numpy as np
import cv2
from PIL import Image, ImageDraw
import tempfile
import os
from unittest.mock import patch, MagicMock

from app.services.photo_analyzer import (
    PhotoQualityAnalyzer, QualityMetrics, CompositionAnalysis, CropRecommendation
)


class TestPhotoQualityAnalyzer:
    """Test suite for PhotoQualityAnalyzer"""
    
    @pytest.fixture
    def analyzer(self):
        """Create PhotoQualityAnalyzer instance"""
        return PhotoQualityAnalyzer()
    
    @pytest.fixture
    def sample_image_path(self):
        """Create a temporary sample image for testing"""
        # Create a simple test image
        img = Image.new('RGB', (800, 600), color='white')
        draw = ImageDraw.Draw(img)
        
        # Add some content to make it more realistic
        draw.rectangle([100, 100, 300, 250], fill='blue')
        draw.ellipse([400, 200, 600, 400], fill='red')
        draw.line([0, 300, 800, 300], fill='black', width=5)
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            img.save(tmp.name, 'JPEG')
            yield tmp.name
        
        # Cleanup
        os.unlink(tmp.name)
    
    @pytest.fixture
    def high_quality_image_path(self):
        """Create a high quality test image"""
        img = Image.new('RGB', (1200, 800), color=(128, 128, 128))
        draw = ImageDraw.Draw(img)
        
        # Add detailed content
        for i in range(10):
            for j in range(8):
                x = i * 120
                y = j * 100
                color = (i * 25, j * 30, 128)
                draw.rectangle([x, y, x + 100, y + 80], fill=color)
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            img.save(tmp.name, 'JPEG', quality=95)
            yield tmp.name
        
        os.unlink(tmp.name)
    
    @pytest.fixture
    def blurry_image_path(self):
        """Create a blurry test image"""
        img = Image.new('RGB', (800, 600), color=(100, 100, 100))
        draw = ImageDraw.Draw(img)
        draw.rectangle([200, 200, 600, 400], fill='yellow')
        
        # Apply blur
        img = img.filter(Image.ImageFilter.GaussianBlur(radius=10))
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            img.save(tmp.name, 'JPEG')
            yield tmp.name
        
        os.unlink(tmp.name)
    
    def test_analyze_image_quality_success(self, analyzer, sample_image_path):
        """Test successful image quality analysis"""
        result = analyzer.analyze_image_quality(sample_image_path)
        
        assert isinstance(result, QualityMetrics)
        assert 0 <= result.brightness_score <= 1
        assert 0 <= result.contrast_score <= 1
        assert 0 <= result.sharpness_score <= 1
        assert 0 <= result.noise_level <= 1
        assert 0 <= result.overall_score <= 1
        assert isinstance(result.is_blurry, bool)
        assert isinstance(result.is_overexposed, bool)
        assert isinstance(result.is_underexposed, bool)
    
    def test_analyze_image_quality_high_quality_image(self, analyzer, high_quality_image_path):
        """Test quality analysis on high quality image"""
        result = analyzer.analyze_image_quality(high_quality_image_path)
        
        # High quality image should have better scores
        assert result.overall_score > 0.3  # Should be reasonably good
        assert result.contrast_score > 0.2  # Should have some contrast
        assert not result.is_blurry  # Should not be detected as blurry
    
    def test_analyze_image_quality_blurry_image(self, analyzer, blurry_image_path):
        """Test quality analysis on blurry image"""
        result = analyzer.analyze_image_quality(blurry_image_path)
        
        # Blurry image should have lower sharpness
        assert result.sharpness_score < 0.5  # Should detect low sharpness
        # Note: blur detection depends on the specific implementation
    
    def test_analyze_image_quality_invalid_path(self, analyzer):
        """Test quality analysis with invalid image path"""
        result = analyzer.analyze_image_quality("/nonexistent/path.jpg")
        
        # Should return default metrics on failure
        assert isinstance(result, QualityMetrics)
        assert result.overall_score == 0.5  # Default value
    
    def test_calculate_brightness(self, analyzer):
        """Test brightness calculation"""
        # Create bright image
        bright_img = Image.new('RGB', (100, 100), color=(200, 200, 200))
        brightness = analyzer._calculate_brightness(bright_img)
        assert brightness > 0.7  # Should be high
        
        # Create dark image
        dark_img = Image.new('RGB', (100, 100), color=(50, 50, 50))
        brightness = analyzer._calculate_brightness(dark_img)
        assert brightness < 0.3  # Should be low
    
    def test_calculate_contrast(self, analyzer):
        """Test contrast calculation"""
        # Create high contrast image
        high_contrast = np.zeros((100, 100), dtype=np.uint8)
        high_contrast[:50, :] = 255  # Half white, half black
        contrast = analyzer._calculate_contrast(high_contrast)
        assert contrast > 0.8  # Should be high
        
        # Create low contrast image
        low_contrast = np.ones((100, 100), dtype=np.uint8) * 128  # All gray
        contrast = analyzer._calculate_contrast(low_contrast)
        assert contrast < 0.1  # Should be low
    
    def test_calculate_sharpness(self, analyzer):
        """Test sharpness calculation"""
        # Create sharp image (high frequency content)
        sharp_img = np.zeros((100, 100), dtype=np.uint8)
        # Add checkerboard pattern
        sharp_img[::2, ::2] = 255
        sharp_img[1::2, 1::2] = 255
        sharpness = analyzer._calculate_sharpness(sharp_img)
        assert sharpness > 0.5  # Should be high
        
        # Create blurry image (low frequency content)
        blurry_img = np.ones((100, 100), dtype=np.uint8) * 128
        sharpness = analyzer._calculate_sharpness(blurry_img)
        assert sharpness < 0.1  # Should be low
    
    def test_calculate_noise_level(self, analyzer):
        """Test noise level calculation"""
        # Create noisy image
        noisy_img = np.random.randint(0, 256, (100, 100), dtype=np.uint8)
        noise = analyzer._calculate_noise_level(noisy_img)
        assert noise > 0.5  # Should detect high noise
        
        # Create clean image
        clean_img = np.ones((100, 100), dtype=np.uint8) * 128
        noise = analyzer._calculate_noise_level(clean_img)
        assert noise < 0.3  # Should detect low noise
    
    def test_calculate_overall_quality(self, analyzer):
        """Test overall quality score calculation"""
        # Test with good metrics
        score = analyzer._calculate_overall_quality(
            brightness=0.6, contrast=0.8, sharpness=0.9, noise=0.1,
            is_blurry=False, is_overexposed=False, is_underexposed=False
        )
        assert score > 0.7  # Should be high
        
        # Test with poor metrics
        score = analyzer._calculate_overall_quality(
            brightness=0.1, contrast=0.2, sharpness=0.1, noise=0.9,
            is_blurry=True, is_overexposed=True, is_underexposed=False
        )
        assert score < 0.3  # Should be low
    
    def test_analyze_composition_success(self, analyzer, sample_image_path):
        """Test successful composition analysis"""
        result = analyzer.analyze_composition(sample_image_path)
        
        assert isinstance(result, CompositionAnalysis)
        assert 0 <= result.rule_of_thirds_score <= 1
        assert 0 <= result.symmetry_score <= 1
        assert isinstance(result.leading_lines_detected, bool)
        assert 0 <= result.subject_placement_score <= 1
        assert 0 <= result.overall_composition_score <= 1
        assert isinstance(result.suggested_improvements, list)
    
    def test_analyze_composition_invalid_path(self, analyzer):
        """Test composition analysis with invalid path"""
        result = analyzer.analyze_composition("/nonexistent/path.jpg")
        
        # Should return default composition analysis
        assert isinstance(result, CompositionAnalysis)
        assert result.overall_composition_score == 0.5  # Default value
    
    def test_analyze_rule_of_thirds(self, analyzer):
        """Test rule of thirds analysis"""
        # Create test image with content at rule of thirds points
        test_img = np.zeros((300, 400), dtype=np.uint8)
        # Place content at rule of thirds intersection
        test_img[100:110, 133:143] = 255  # Top-left third
        test_img[200:210, 267:277] = 255  # Bottom-right third
        
        score = analyzer._analyze_rule_of_thirds(test_img)
        assert 0 <= score <= 1
    
    def test_analyze_symmetry(self, analyzer):
        """Test symmetry analysis"""
        # Create symmetric image
        symmetric_img = np.zeros((100, 200), dtype=np.uint8)
        symmetric_img[:, :100] = np.arange(100).reshape(100, 1)  # Left half
        symmetric_img[:, 100:] = np.arange(100).reshape(100, 1)[:, ::-1]  # Mirror right half
        
        score = analyzer._analyze_symmetry(symmetric_img)
        assert score > 0.5  # Should detect symmetry
    
    def test_detect_leading_lines(self, analyzer):
        """Test leading lines detection"""
        # Create image with strong lines
        lined_img = np.zeros((200, 200), dtype=np.uint8)
        # Add diagonal lines
        for i in range(200):
            lined_img[i, i] = 255  # Diagonal line
            lined_img[i, 199-i] = 255  # Other diagonal
        
        has_lines = analyzer._detect_leading_lines(lined_img)
        assert isinstance(has_lines, bool)
    
    def test_analyze_subject_placement(self, analyzer):
        """Test subject placement analysis"""
        # Create image with subject
        test_img = np.zeros((300, 400), dtype=np.uint8)
        # Place subject near rule of thirds point
        test_img[90:110, 130:150] = 255
        
        with patch('cv2.saliency.StaticSaliencyFineGrained_create') as mock_saliency:
            mock_detector = MagicMock()
            mock_detector.computeSaliency.return_value = (True, np.ones((300, 400)) * 0.1)
            mock_saliency.return_value = mock_detector
            
            score = analyzer._analyze_subject_placement(test_img)
            assert 0 <= score <= 1
    
    def test_suggest_auto_crop_success(self, analyzer, sample_image_path):
        """Test successful auto crop suggestion"""
        result = analyzer.suggest_auto_crop(sample_image_path, "1:1")
        
        if result:  # May return None if no good crop found
            assert isinstance(result, CropRecommendation)
            assert result.x >= 0
            assert result.y >= 0
            assert result.width > 0
            assert result.height > 0
            assert 0 <= result.confidence <= 1
            assert 0 <= result.improvement_score <= 1
            assert isinstance(result.reason, str)
    
    def test_suggest_auto_crop_different_ratios(self, analyzer, sample_image_path):
        """Test auto crop with different aspect ratios"""
        ratios = ["1:1", "4:3", "16:9"]
        
        for ratio in ratios:
            result = analyzer.suggest_auto_crop(sample_image_path, ratio)
            if result:
                # Check that aspect ratio is approximately correct
                actual_ratio = result.width / result.height
                if ratio == "1:1":
                    assert abs(actual_ratio - 1.0) < 0.1
                elif ratio == "4:3":
                    assert abs(actual_ratio - 4/3) < 0.2
                elif ratio == "16:9":
                    assert abs(actual_ratio - 16/9) < 0.2
    
    def test_suggest_auto_crop_invalid_path(self, analyzer):
        """Test auto crop with invalid image path"""
        result = analyzer.suggest_auto_crop("/nonexistent/path.jpg")
        assert result is None
    
    def test_center_crop_fallback(self, analyzer):
        """Test center crop fallback method"""
        result = analyzer._center_crop(400, 300, 1.0)  # Square crop
        
        assert isinstance(result, CropRecommendation)
        assert result.width == result.height  # Should be square
        assert result.confidence == 0.5  # Default confidence
        assert result.reason == "Center crop as fallback"
    
    def test_calculate_crop_improvement(self, analyzer):
        """Test crop improvement calculation"""
        # Create test image
        test_img = np.random.randint(0, 256, (300, 400), dtype=np.uint8)
        
        improvement = analyzer._calculate_crop_improvement(test_img, 50, 50, 200, 200)
        assert 0 <= improvement <= 1
    
    def test_generate_composition_suggestions(self, analyzer):
        """Test composition suggestions generation"""
        # Test various scenarios
        suggestions = analyzer._generate_composition_suggestions(
            rule_of_thirds=0.3, symmetry=0.8, leading_lines=False, subject_placement=0.2
        )
        assert isinstance(suggestions, list)
        assert len(suggestions) > 0
        assert all(isinstance(s, str) for s in suggestions)
        
        # Test good composition
        good_suggestions = analyzer._generate_composition_suggestions(
            rule_of_thirds=0.8, symmetry=0.6, leading_lines=True, subject_placement=0.9
        )
        assert "Composition looks well-balanced" in good_suggestions
    
    def test_error_handling(self, analyzer):
        """Test error handling in various methods"""
        # Test with corrupted image data
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            tmp.write(b'corrupted_image_data')
            tmp.flush()
            
            try:
                result = analyzer.analyze_image_quality(tmp.name)
                assert isinstance(result, QualityMetrics)  # Should return default
                
                comp_result = analyzer.analyze_composition(tmp.name)
                assert isinstance(comp_result, CompositionAnalysis)  # Should return default
                
            finally:
                os.unlink(tmp.name)
    
    def test_edge_cases(self, analyzer):
        """Test edge cases and boundary conditions"""
        # Test with very small image
        small_img = Image.new('RGB', (10, 10), color='red')
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            small_img.save(tmp.name, 'JPEG')
            
            try:
                result = analyzer.analyze_image_quality(tmp.name)
                assert isinstance(result, QualityMetrics)
                
                # Small image should have poor quality scores
                assert result.overall_score < 0.8
                
            finally:
                os.unlink(tmp.name)
        
        # Test empty arrays
        empty_landmarks = []
        bbox = analyzer._calculate_bounding_box(empty_landmarks)
        assert bbox == (0, 0, 0, 0)
    
    def test_performance(self, analyzer, sample_image_path):
        """Test performance of analysis methods"""
        import time
        
        # Test quality analysis performance
        start_time = time.time()
        analyzer.analyze_image_quality(sample_image_path)
        quality_time = time.time() - start_time
        
        # Should complete within reasonable time
        assert quality_time < 5.0  # 5 seconds max
        
        # Test composition analysis performance
        start_time = time.time()
        analyzer.analyze_composition(sample_image_path)
        composition_time = time.time() - start_time
        
        assert composition_time < 10.0  # 10 seconds max
    
    @patch('app.services.photo_analyzer.cv2.imread')
    def test_mock_opencv_failure(self, mock_imread, analyzer, sample_image_path):
        """Test handling of OpenCV failures"""
        mock_imread.return_value = None  # Simulate imread failure
        
        result = analyzer.analyze_image_quality(sample_image_path)
        assert isinstance(result, QualityMetrics)
        # Should return default metrics when OpenCV fails
    
    def test_thread_safety(self, analyzer, sample_image_path):
        """Test thread safety of analyzer methods"""
        import threading
        import concurrent.futures
        
        def analyze_worker():
            return analyzer.analyze_image_quality(sample_image_path)
        
        # Run multiple analyses concurrently
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            futures = [executor.submit(analyze_worker) for _ in range(10)]
            results = [future.result() for future in futures]
        
        # All results should be valid
        assert len(results) == 10
        for result in results:
            assert isinstance(result, QualityMetrics)
            assert 0 <= result.overall_score <= 1


class TestQualityMetrics:
    """Test QualityMetrics data class"""
    
    def test_quality_metrics_creation(self):
        """Test QualityMetrics creation"""
        metrics = QualityMetrics(
            brightness_score=0.7,
            contrast_score=0.8,
            sharpness_score=0.6,
            noise_level=0.3,
            overall_score=0.75,
            is_blurry=False,
            is_overexposed=False,
            is_underexposed=False
        )
        
        assert metrics.brightness_score == 0.7
        assert metrics.contrast_score == 0.8
        assert metrics.sharpness_score == 0.6
        assert metrics.noise_level == 0.3
        assert metrics.overall_score == 0.75
        assert not metrics.is_blurry
        assert not metrics.is_overexposed
        assert not metrics.is_underexposed


class TestCompositionAnalysis:
    """Test CompositionAnalysis data class"""
    
    def test_composition_analysis_creation(self):
        """Test CompositionAnalysis creation"""
        analysis = CompositionAnalysis(
            rule_of_thirds_score=0.6,
            symmetry_score=0.4,
            leading_lines_detected=True,
            subject_placement_score=0.8,
            overall_composition_score=0.7,
            suggested_improvements=["Test suggestion"]
        )
        
        assert analysis.rule_of_thirds_score == 0.6
        assert analysis.symmetry_score == 0.4
        assert analysis.leading_lines_detected
        assert analysis.subject_placement_score == 0.8
        assert analysis.overall_composition_score == 0.7
        assert "Test suggestion" in analysis.suggested_improvements


class TestCropRecommendation:
    """Test CropRecommendation data class"""
    
    def test_crop_recommendation_creation(self):
        """Test CropRecommendation creation"""
        crop = CropRecommendation(
            x=100,
            y=50,
            width=200,
            height=200,
            confidence=0.9,
            improvement_score=0.3,
            reason="Test crop"
        )
        
        assert crop.x == 100
        assert crop.y == 50
        assert crop.width == 200
        assert crop.height == 200
        assert crop.confidence == 0.9
        assert crop.improvement_score == 0.3
        assert crop.reason == "Test crop"


if __name__ == "__main__":
    pytest.main([__file__])