"""
AI-Powered Photo Quality Assessment and Analysis Engine
Implements advanced computer vision algorithms for photo quality evaluation
"""

import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageStat
from typing import Dict, Tuple, Optional, List, Any
import time
import logging
from dataclasses import dataclass
from skimage import feature, measure, filters, exposure
from skimage.metrics import structural_similarity as ssim
import math

logger = logging.getLogger(__name__)

@dataclass
class QualityMetrics:
    """Photo quality assessment results"""
    brightness_score: float  # 0-1, optimal around 0.5-0.7
    contrast_score: float    # 0-1, higher is better
    sharpness_score: float   # 0-1, higher is better
    noise_level: float       # 0-1, lower is better
    overall_score: float     # 0-1, computed overall quality
    is_blurry: bool
    is_overexposed: bool
    is_underexposed: bool

@dataclass
class CompositionAnalysis:
    """Photo composition analysis results"""
    rule_of_thirds_score: float    # 0-1, higher is better
    symmetry_score: float          # 0-1, higher is better
    leading_lines_detected: bool
    subject_placement_score: float  # 0-1, higher is better
    overall_composition_score: float
    suggested_improvements: List[str]

@dataclass
class CropRecommendation:
    """Automatic crop suggestion"""
    x: int
    y: int
    width: int
    height: int
    confidence: float
    improvement_score: float
    reason: str


class PhotoQualityAnalyzer:
    """
    Advanced photo quality analysis using computer vision
    Combines multiple algorithms for comprehensive assessment
    """
    
    def __init__(self):
        self.blur_threshold = 100.0  # Laplacian variance threshold
        self.brightness_optimal_range = (0.3, 0.7)  # Optimal brightness range
        self.contrast_min_threshold = 30.0  # Minimum acceptable contrast
    
    def analyze_image_quality(self, image_path: str) -> QualityMetrics:
        """
        Comprehensive image quality analysis
        
        Args:
            image_path: Path to image file
            
        Returns:
            QualityMetrics with detailed quality assessment
        """
        try:
            # Load image in multiple formats for different analyses
            pil_image = Image.open(image_path).convert('RGB')
            cv_image = cv2.imread(image_path)
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            
            # Calculate individual quality metrics
            brightness = self._calculate_brightness(pil_image)
            contrast = self._calculate_contrast(gray)
            sharpness = self._calculate_sharpness(gray)
            noise = self._calculate_noise_level(gray)
            
            # Determine quality issues
            is_blurry = sharpness < 0.3
            is_overexposed = brightness > 0.85
            is_underexposed = brightness < 0.15
            
            # Calculate overall quality score
            overall_score = self._calculate_overall_quality(
                brightness, contrast, sharpness, noise,
                is_blurry, is_overexposed, is_underexposed
            )
            
            return QualityMetrics(
                brightness_score=brightness,
                contrast_score=contrast,
                sharpness_score=sharpness,
                noise_level=noise,
                overall_score=overall_score,
                is_blurry=is_blurry,
                is_overexposed=is_overexposed,
                is_underexposed=is_underexposed
            )
            
        except Exception as e:
            logger.error(f"Quality analysis failed for {image_path}: {e}")
            return self._default_quality_metrics()
    
    def _calculate_brightness(self, pil_image: Image.Image) -> float:
        """Calculate normalized brightness score (0-1)"""
        try:
            # Convert to grayscale and calculate mean brightness
            grayscale = pil_image.convert('L')
            stat = ImageStat.Stat(grayscale)
            brightness = stat.mean[0] / 255.0
            return brightness
        except Exception as e:
            logger.error(f"Brightness calculation error: {e}")
            return 0.5
    
    def _calculate_contrast(self, gray_image: np.ndarray) -> float:
        """Calculate normalized contrast score (0-1)"""
        try:
            # Use standard deviation of pixel intensities as contrast measure
            contrast = np.std(gray_image)
            # Normalize to 0-1 range (max possible std for 8-bit image is ~127)
            normalized_contrast = min(contrast / 127.0, 1.0)
            return normalized_contrast
        except Exception as e:
            logger.error(f"Contrast calculation error: {e}")
            return 0.5
    
    def _calculate_sharpness(self, gray_image: np.ndarray) -> float:
        """Calculate sharpness using Laplacian variance"""
        try:
            # Apply Laplacian filter and calculate variance
            laplacian_var = cv2.Laplacian(gray_image, cv2.CV_64F).var()
            
            # Normalize sharpness score (higher variance = sharper image)
            # Typical range: 0-2000+ for natural images
            normalized_sharpness = min(laplacian_var / 1000.0, 1.0)
            return normalized_sharpness
        except Exception as e:
            logger.error(f"Sharpness calculation error: {e}")
            return 0.5
    
    def _calculate_noise_level(self, gray_image: np.ndarray) -> float:
        """Calculate noise level using edge detection"""
        try:
            # Apply Gaussian blur to estimate noise
            blurred = cv2.GaussianBlur(gray_image, (5, 5), 0)
            noise = cv2.subtract(gray_image, blurred)
            noise_level = np.std(noise)
            
            # Normalize noise level (lower is better)
            # Typical range: 0-20 for natural images
            normalized_noise = min(noise_level / 20.0, 1.0)
            return normalized_noise
        except Exception as e:
            logger.error(f"Noise calculation error: {e}")
            return 0.3
    
    def _calculate_overall_quality(self, brightness: float, contrast: float, 
                                 sharpness: float, noise: float,
                                 is_blurry: bool, is_overexposed: bool, 
                                 is_underexposed: bool) -> float:
        """Calculate overall quality score with weighted factors"""
        try:
            # Base score from individual metrics
            base_score = (
                brightness * 0.15 +  # Lower weight for brightness
                contrast * 0.25 +    # Contrast is important
                sharpness * 0.35 +   # Sharpness is critical
                (1 - noise) * 0.25   # Invert noise (lower noise = better)
            )
            
            # Apply penalties for quality issues
            penalty = 0.0
            if is_blurry:
                penalty += 0.3
            if is_overexposed or is_underexposed:
                penalty += 0.2
            
            # Adjust for brightness being in optimal range
            if self.brightness_optimal_range[0] <= brightness <= self.brightness_optimal_range[1]:
                base_score += 0.1  # Bonus for good brightness
            
            final_score = max(0.0, base_score - penalty)
            return min(final_score, 1.0)
        except Exception as e:
            logger.error(f"Overall quality calculation error: {e}")
            return 0.5
    
    def analyze_composition(self, image_path: str) -> CompositionAnalysis:
        """
        Analyze photo composition using rule of thirds and other principles
        
        Args:
            image_path: Path to image file
            
        Returns:
            CompositionAnalysis with composition assessment
        """
        try:
            # Load image
            cv_image = cv2.imread(image_path)
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            height, width = gray.shape
            
            # Calculate composition metrics
            rule_of_thirds = self._analyze_rule_of_thirds(gray)
            symmetry = self._analyze_symmetry(gray)
            leading_lines = self._detect_leading_lines(gray)
            subject_placement = self._analyze_subject_placement(gray)
            
            # Calculate overall composition score
            overall_score = (
                rule_of_thirds * 0.3 +
                symmetry * 0.2 +
                subject_placement * 0.4 +
                (0.1 if leading_lines else 0.0)
            )
            
            # Generate improvement suggestions
            suggestions = self._generate_composition_suggestions(
                rule_of_thirds, symmetry, leading_lines, subject_placement
            )
            
            return CompositionAnalysis(
                rule_of_thirds_score=rule_of_thirds,
                symmetry_score=symmetry,
                leading_lines_detected=leading_lines,
                subject_placement_score=subject_placement,
                overall_composition_score=overall_score,
                suggested_improvements=suggestions
            )
            
        except Exception as e:
            logger.error(f"Composition analysis failed for {image_path}: {e}")
            return self._default_composition_analysis()
    
    def _analyze_rule_of_thirds(self, gray_image: np.ndarray) -> float:
        """Analyze adherence to rule of thirds"""
        try:
            height, width = gray_image.shape
            
            # Define rule of thirds grid points
            third_x = width // 3
            two_third_x = 2 * width // 3
            third_y = height // 3
            two_third_y = 2 * height // 3
            
            # Interest points (intersections of grid lines)
            interest_points = [
                (third_x, third_y), (two_third_x, third_y),
                (third_x, two_third_y), (two_third_x, two_third_y)
            ]
            
            # Find edges/features in image
            edges = cv2.Canny(gray_image, 50, 150)
            
            # Calculate activity near interest points
            total_activity = 0
            region_size = min(width, height) // 10  # 10% of smaller dimension
            
            for x, y in interest_points:
                # Extract region around interest point
                x1 = max(0, x - region_size // 2)
                x2 = min(width, x + region_size // 2)
                y1 = max(0, y - region_size // 2)
                y2 = min(height, y + region_size // 2)
                
                region = edges[y1:y2, x1:x2]
                activity = np.sum(region) / 255.0  # Normalize
                total_activity += activity
            
            # Normalize score
            max_possible_activity = len(interest_points) * region_size * region_size
            rule_of_thirds_score = min(total_activity / max_possible_activity, 1.0)
            
            return rule_of_thirds_score
        except Exception as e:
            logger.error(f"Rule of thirds analysis error: {e}")
            return 0.5
    
    def _analyze_symmetry(self, gray_image: np.ndarray) -> float:
        """Analyze symmetry in the image"""
        try:
            height, width = gray_image.shape
            
            # Check horizontal symmetry
            left_half = gray_image[:, :width//2]
            right_half = gray_image[:, width//2:]
            right_half_flipped = np.fliplr(right_half)
            
            # Resize to match if needed
            if left_half.shape != right_half_flipped.shape:
                min_width = min(left_half.shape[1], right_half_flipped.shape[1])
                left_half = left_half[:, :min_width]
                right_half_flipped = right_half_flipped[:, :min_width]
            
            # Calculate similarity using SSIM
            horizontal_symmetry = ssim(left_half, right_half_flipped)
            
            # Check vertical symmetry
            top_half = gray_image[:height//2, :]
            bottom_half = gray_image[height//2:, :]
            bottom_half_flipped = np.flipud(bottom_half)
            
            # Resize to match if needed
            if top_half.shape != bottom_half_flipped.shape:
                min_height = min(top_half.shape[0], bottom_half_flipped.shape[0])
                top_half = top_half[:min_height, :]
                bottom_half_flipped = bottom_half_flipped[:min_height, :]
            
            vertical_symmetry = ssim(top_half, bottom_half_flipped)
            
            # Return best symmetry score
            return max(horizontal_symmetry, vertical_symmetry)
        except Exception as e:
            logger.error(f"Symmetry analysis error: {e}")
            return 0.3
    
    def _detect_leading_lines(self, gray_image: np.ndarray) -> bool:
        """Detect presence of leading lines"""
        try:
            # Apply edge detection
            edges = cv2.Canny(gray_image, 50, 150, apertureSize=3)
            
            # Use Hough Line Transform to detect lines
            lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=100)
            
            if lines is not None and len(lines) > 5:
                # Analyze line orientations
                angles = []
                for line in lines:
                    rho, theta = line[0]
                    angles.append(theta)
                
                # Check for dominant line orientations (leading lines)
                angles = np.array(angles)
                angle_hist, _ = np.histogram(angles, bins=18)  # 10-degree bins
                
                # Leading lines present if there are dominant orientations
                max_count = np.max(angle_hist)
                total_lines = len(lines)
                
                return max_count > total_lines * 0.3  # 30% of lines in similar orientation
            
            return False
        except Exception as e:
            logger.error(f"Leading lines detection error: {e}")
            return False
    
    def _analyze_subject_placement(self, gray_image: np.ndarray) -> float:
        """Analyze main subject placement in the image"""
        try:
            # Find the main subject using saliency detection
            saliency = cv2.saliency.StaticSaliencyFineGrained_create()
            success, saliency_map = saliency.computeSaliency(gray_image)
            
            if not success:
                return 0.5
            
            # Find the center of mass of salient regions
            saliency_uint8 = (saliency_map * 255).astype(np.uint8)
            threshold = 0.7 * 255
            _, binary_saliency = cv2.threshold(saliency_uint8, threshold, 255, cv2.THRESH_BINARY)
            
            # Calculate centroid of salient regions
            M = cv2.moments(binary_saliency)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
                
                # Check placement relative to rule of thirds
                height, width = gray_image.shape
                third_x = width // 3
                two_third_x = 2 * width // 3
                third_y = height // 3
                two_third_y = 2 * height // 3
                
                # Distance to nearest rule of thirds point
                distances = []
                for x in [third_x, two_third_x]:
                    for y in [third_y, two_third_y]:
                        dist = np.sqrt((cx - x)**2 + (cy - y)**2)
                        distances.append(dist)
                
                min_distance = min(distances)
                max_possible_distance = np.sqrt(width**2 + height**2)
                
                # Better placement = smaller distance to rule of thirds points
                placement_score = 1.0 - (min_distance / max_possible_distance)
                return placement_score
            
            return 0.5
        except Exception as e:
            logger.error(f"Subject placement analysis error: {e}")
            return 0.5
    
    def suggest_auto_crop(self, image_path: str, target_aspect_ratio: str = "1:1") -> Optional[CropRecommendation]:
        """
        Suggest optimal crop based on composition analysis
        
        Args:
            image_path: Path to image file
            target_aspect_ratio: Desired aspect ratio ("1:1", "4:3", "16:9")
            
        Returns:
            CropRecommendation with optimal crop coordinates
        """
        try:
            # Load image
            cv_image = cv2.imread(image_path)
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            height, width = gray.shape
            
            # Parse target aspect ratio
            if target_aspect_ratio == "1:1":
                target_ratio = 1.0
            elif target_aspect_ratio == "4:3":
                target_ratio = 4.0 / 3.0
            elif target_aspect_ratio == "16:9":
                target_ratio = 16.0 / 9.0
            else:
                target_ratio = 1.0  # Default to square
            
            # Find salient regions
            saliency = cv2.saliency.StaticSaliencyFineGrained_create()
            success, saliency_map = saliency.computeSaliency(gray)
            
            if not success:
                return self._center_crop(width, height, target_ratio)
            
            # Find the most salient region
            saliency_uint8 = (saliency_map * 255).astype(np.uint8)
            threshold = 0.5 * 255
            _, binary_saliency = cv2.threshold(saliency_uint8, threshold, 255, cv2.THRESH_BINARY)
            
            # Find contours of salient regions
            contours, _ = cv2.findContours(binary_saliency, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            if not contours:
                return self._center_crop(width, height, target_ratio)
            
            # Find largest salient region
            largest_contour = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(largest_contour)
            
            # Calculate optimal crop around salient region
            center_x = x + w // 2
            center_y = y + h // 2
            
            # Calculate crop dimensions based on target ratio
            if target_ratio > (width / height):
                # Wider ratio - constrain by width
                crop_width = width
                crop_height = int(crop_width / target_ratio)
            else:
                # Taller ratio - constrain by height
                crop_height = height
                crop_width = int(crop_height * target_ratio)
            
            # Ensure crop doesn't exceed image bounds
            crop_width = min(crop_width, width)
            crop_height = min(crop_height, height)
            
            # Center crop around salient region
            crop_x = max(0, center_x - crop_width // 2)
            crop_y = max(0, center_y - crop_height // 2)
            
            # Adjust if crop extends beyond image
            if crop_x + crop_width > width:
                crop_x = width - crop_width
            if crop_y + crop_height > height:
                crop_y = height - crop_height
            
            # Calculate improvement score
            improvement_score = self._calculate_crop_improvement(
                gray, crop_x, crop_y, crop_width, crop_height
            )
            
            return CropRecommendation(
                x=crop_x,
                y=crop_y,
                width=crop_width,
                height=crop_height,
                confidence=0.8,
                improvement_score=improvement_score,
                reason=f"Focused on main subject with {target_aspect_ratio} aspect ratio"
            )
            
        except Exception as e:
            logger.error(f"Auto-crop suggestion failed for {image_path}: {e}")
            return None
    
    def _center_crop(self, width: int, height: int, target_ratio: float) -> CropRecommendation:
        """Generate center crop as fallback"""
        if target_ratio > (width / height):
            crop_width = width
            crop_height = int(crop_width / target_ratio)
        else:
            crop_height = height
            crop_width = int(crop_height * target_ratio)
        
        crop_x = (width - crop_width) // 2
        crop_y = (height - crop_height) // 2
        
        return CropRecommendation(
            x=crop_x,
            y=crop_y,
            width=crop_width,
            height=crop_height,
            confidence=0.5,
            improvement_score=0.3,
            reason="Center crop as fallback"
        )
    
    def _calculate_crop_improvement(self, gray: np.ndarray, x: int, y: int, 
                                  width: int, height: int) -> float:
        """Calculate how much the crop improves composition"""
        try:
            # Extract cropped region
            cropped = gray[y:y+height, x:x+width]
            
            # Compare composition scores
            original_composition = self._analyze_rule_of_thirds(gray)
            cropped_composition = self._analyze_rule_of_thirds(cropped)
            
            improvement = cropped_composition - original_composition
            return max(0.0, improvement)
        except Exception as e:
            logger.error(f"Crop improvement calculation error: {e}")
            return 0.0
    
    def _generate_composition_suggestions(self, rule_of_thirds: float, symmetry: float,
                                        leading_lines: bool, subject_placement: float) -> List[str]:
        """Generate actionable composition improvement suggestions"""
        suggestions = []
        
        if rule_of_thirds < 0.4:
            suggestions.append("Consider positioning key subjects along rule-of-thirds lines")
        
        if symmetry > 0.7:
            suggestions.append("Strong symmetry detected - ensure it's intentional")
        elif symmetry < 0.3 and subject_placement < 0.4:
            suggestions.append("Consider improving balance in the composition")
        
        if not leading_lines:
            suggestions.append("Look for opportunities to include leading lines")
        
        if subject_placement < 0.3:
            suggestions.append("Main subject could be positioned more effectively")
        
        if not suggestions:
            suggestions.append("Composition looks well-balanced")
        
        return suggestions
    
    def _default_quality_metrics(self) -> QualityMetrics:
        """Return default quality metrics on error"""
        return QualityMetrics(
            brightness_score=0.5,
            contrast_score=0.5,
            sharpness_score=0.5,
            noise_level=0.5,
            overall_score=0.5,
            is_blurry=False,
            is_overexposed=False,
            is_underexposed=False
        )
    
    def _default_composition_analysis(self) -> CompositionAnalysis:
        """Return default composition analysis on error"""
        return CompositionAnalysis(
            rule_of_thirds_score=0.5,
            symmetry_score=0.5,
            leading_lines_detected=False,
            subject_placement_score=0.5,
            overall_composition_score=0.5,
            suggested_improvements=["Analysis unavailable"]
        )


# Global analyzer instance
photo_analyzer = PhotoQualityAnalyzer()