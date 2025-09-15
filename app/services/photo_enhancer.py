"""
Intelligent Photo Enhancement Engine
AI-powered automatic corrections for brightness, contrast, color, noise reduction
"""

import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageOps
from typing import Dict, Tuple, Optional, List, Any
import time
import logging
from dataclasses import dataclass
from skimage import exposure, restoration, filters, morphology
from skimage.restoration import denoise_nl_means, denoise_tv_chambolle
from skimage.filters import gaussian
from skimage.color import rgb2lab, lab2rgb
import math

logger = logging.getLogger(__name__)

@dataclass
class EnhancementSettings:
    """Enhancement parameters for photo processing"""
    brightness_adjustment: float = 0.0      # -1.0 to 1.0
    contrast_adjustment: float = 0.0        # -1.0 to 1.0
    saturation_adjustment: float = 0.0      # -1.0 to 1.0
    sharpness_adjustment: float = 0.0       # -1.0 to 1.0
    noise_reduction_level: float = 0.0      # 0.0 to 1.0
    apply_background_blur: bool = False
    enhance_face_region: bool = False
    auto_white_balance: bool = False
    auto_color_correction: bool = False

@dataclass
class EnhancementResult:
    """Result of photo enhancement process"""
    enhanced_image_path: str
    settings_applied: EnhancementSettings
    processing_time: float
    improvement_score: float
    before_after_metrics: Dict[str, Tuple[float, float]]
    success: bool
    error_message: Optional[str] = None


class IntelligentPhotoEnhancer:
    """
    Advanced photo enhancement using AI and computer vision
    Provides automatic corrections and intelligent adjustments
    """
    
    def __init__(self):
        self.enhancement_strength = 0.7  # Default enhancement strength
        self.preserve_original_ratio = 0.3  # How much of original to preserve
    
    def auto_enhance(self, image_path: str, output_path: str, 
                    quality_metrics: Optional[Dict] = None) -> EnhancementResult:
        """
        Automatically enhance photo based on quality analysis
        
        Args:
            image_path: Input image path
            output_path: Output image path
            quality_metrics: Optional quality metrics for smart enhancement
            
        Returns:
            EnhancementResult with enhancement details
        """
        start_time = time.time()
        
        try:
            # Load image
            pil_image = Image.open(image_path).convert('RGB')
            cv_image = cv2.imread(image_path)
            
            # Analyze current quality if not provided
            if quality_metrics is None:
                from .photo_analyzer import photo_analyzer
                quality_analysis = photo_analyzer.analyze_image_quality(image_path)
                quality_metrics = {
                    'brightness_score': quality_analysis.brightness_score,
                    'contrast_score': quality_analysis.contrast_score,
                    'sharpness_score': quality_analysis.sharpness_score,
                    'noise_level': quality_analysis.noise_level,
                    'is_blurry': quality_analysis.is_blurry,
                    'is_overexposed': quality_analysis.is_overexposed,
                    'is_underexposed': quality_analysis.is_underexposed
                }
            
            # Calculate optimal enhancement settings
            settings = self._calculate_auto_enhancement_settings(quality_metrics)
            
            # Apply enhancements
            enhanced_image = self._apply_enhancements(pil_image, cv_image, settings)
            
            # Save enhanced image
            enhanced_image.save(output_path, 'JPEG', quality=95)
            
            # Calculate improvement metrics
            improvement_score = self._calculate_improvement_score(
                image_path, output_path, quality_metrics
            )
            
            # Calculate before/after metrics
            before_after = self._calculate_before_after_metrics(image_path, output_path)
            
            processing_time = time.time() - start_time
            
            return EnhancementResult(
                enhanced_image_path=output_path,
                settings_applied=settings,
                processing_time=processing_time,
                improvement_score=improvement_score,
                before_after_metrics=before_after,
                success=True
            )
            
        except Exception as e:
            logger.error(f"Auto enhancement failed for {image_path}: {e}")
            return EnhancementResult(
                enhanced_image_path="",
                settings_applied=EnhancementSettings(),
                processing_time=time.time() - start_time,
                improvement_score=0.0,
                before_after_metrics={},
                success=False,
                error_message=str(e)
            )
    
    def enhance_with_settings(self, image_path: str, output_path: str, 
                            settings: EnhancementSettings) -> EnhancementResult:
        """
        Enhance photo with specific settings
        
        Args:
            image_path: Input image path
            output_path: Output image path
            settings: Enhancement settings to apply
            
        Returns:
            EnhancementResult with enhancement details
        """
        start_time = time.time()
        
        try:
            # Load image
            pil_image = Image.open(image_path).convert('RGB')
            cv_image = cv2.imread(image_path)
            
            # Apply enhancements
            enhanced_image = self._apply_enhancements(pil_image, cv_image, settings)
            
            # Save enhanced image
            enhanced_image.save(output_path, 'JPEG', quality=95)
            
            # Calculate improvement score
            improvement_score = self._calculate_improvement_score(image_path, output_path)
            
            # Calculate before/after metrics
            before_after = self._calculate_before_after_metrics(image_path, output_path)
            
            processing_time = time.time() - start_time
            
            return EnhancementResult(
                enhanced_image_path=output_path,
                settings_applied=settings,
                processing_time=processing_time,
                improvement_score=improvement_score,
                before_after_metrics=before_after,
                success=True
            )
            
        except Exception as e:
            logger.error(f"Enhancement with settings failed for {image_path}: {e}")
            return EnhancementResult(
                enhanced_image_path="",
                settings_applied=settings,
                processing_time=time.time() - start_time,
                improvement_score=0.0,
                before_after_metrics={},
                success=False,
                error_message=str(e)
            )
    
    def _calculate_auto_enhancement_settings(self, quality_metrics: Dict) -> EnhancementSettings:
        """Calculate optimal enhancement settings based on quality analysis"""
        settings = EnhancementSettings()
        
        # Brightness adjustment
        brightness = quality_metrics.get('brightness_score', 0.5)
        if quality_metrics.get('is_underexposed', False):
            settings.brightness_adjustment = 0.3 * (0.5 - brightness)
        elif quality_metrics.get('is_overexposed', False):
            settings.brightness_adjustment = -0.3 * (brightness - 0.5)
        elif brightness < 0.4:
            settings.brightness_adjustment = 0.2 * (0.5 - brightness)
        elif brightness > 0.6:
            settings.brightness_adjustment = -0.2 * (brightness - 0.5)
        
        # Contrast adjustment
        contrast = quality_metrics.get('contrast_score', 0.5)
        if contrast < 0.4:
            settings.contrast_adjustment = 0.3 * (0.6 - contrast)
        
        # Sharpness adjustment
        sharpness = quality_metrics.get('sharpness_score', 0.5)
        is_blurry = quality_metrics.get('is_blurry', False)
        if is_blurry or sharpness < 0.4:
            settings.sharpness_adjustment = 0.4 * (0.7 - sharpness)
        
        # Noise reduction
        noise_level = quality_metrics.get('noise_level', 0.3)
        if noise_level > 0.4:
            settings.noise_reduction_level = min(0.8, noise_level * 1.5)
        
        # Auto adjustments for general improvement
        settings.auto_color_correction = True
        settings.saturation_adjustment = 0.1  # Slight saturation boost
        
        return settings
    
    def _apply_enhancements(self, pil_image: Image.Image, cv_image: np.ndarray, 
                          settings: EnhancementSettings) -> Image.Image:
        """Apply all enhancement settings to the image"""
        enhanced = pil_image.copy()
        
        # Apply brightness adjustment
        if abs(settings.brightness_adjustment) > 0.01:
            enhancer = ImageEnhance.Brightness(enhanced)
            factor = 1.0 + settings.brightness_adjustment
            enhanced = enhancer.enhance(factor)
        
        # Apply contrast adjustment
        if abs(settings.contrast_adjustment) > 0.01:
            enhancer = ImageEnhance.Contrast(enhanced)
            factor = 1.0 + settings.contrast_adjustment
            enhanced = enhancer.enhance(factor)
        
        # Apply saturation adjustment
        if abs(settings.saturation_adjustment) > 0.01:
            enhancer = ImageEnhance.Color(enhanced)
            factor = 1.0 + settings.saturation_adjustment
            enhanced = enhancer.enhance(factor)
        
        # Apply sharpness adjustment
        if abs(settings.sharpness_adjustment) > 0.01:
            enhancer = ImageEnhance.Sharpness(enhanced)
            factor = 1.0 + settings.sharpness_adjustment
            enhanced = enhancer.enhance(factor)
        
        # Apply noise reduction
        if settings.noise_reduction_level > 0.01:
            enhanced = self._reduce_noise(enhanced, settings.noise_reduction_level)
        
        # Apply auto white balance
        if settings.auto_white_balance:
            enhanced = self._auto_white_balance(enhanced)
        
        # Apply auto color correction
        if settings.auto_color_correction:
            enhanced = self._auto_color_correction(enhanced)
        
        # Apply background blur (for portrait mode effect)
        if settings.apply_background_blur:
            enhanced = self._apply_background_blur(enhanced, cv_image)
        
        # Enhance face region specifically
        if settings.enhance_face_region:
            enhanced = self._enhance_face_regions(enhanced, cv_image)
        
        return enhanced
    
    def _reduce_noise(self, pil_image: Image.Image, noise_reduction_level: float) -> Image.Image:
        """Reduce noise while preserving details"""
        try:
            # Convert to numpy array for advanced processing
            img_array = np.array(pil_image)
            
            # Apply bilateral filter for edge-preserving noise reduction
            if noise_reduction_level > 0.5:
                # Strong noise reduction
                denoised = cv2.bilateralFilter(img_array, 9, 75, 75)
            else:
                # Mild noise reduction
                denoised = cv2.bilateralFilter(img_array, 5, 50, 50)
            
            # Additional non-local means denoising for severe noise
            if noise_reduction_level > 0.7:
                denoised = cv2.fastNlMeansDenoisingColored(denoised, None, 10, 10, 7, 21)
            
            return Image.fromarray(denoised)
        except Exception as e:
            logger.error(f"Noise reduction error: {e}")
            return pil_image
    
    def _auto_white_balance(self, pil_image: Image.Image) -> Image.Image:
        """Apply automatic white balance correction"""
        try:
            img_array = np.array(pil_image)
            
            # Calculate channel means
            mean_b = np.mean(img_array[:, :, 2])  # Blue channel
            mean_g = np.mean(img_array[:, :, 1])  # Green channel
            mean_r = np.mean(img_array[:, :, 0])  # Red channel
            
            # Calculate gray world assumption correction
            gray_mean = (mean_r + mean_g + mean_b) / 3
            
            # Correction factors
            kr = gray_mean / mean_r if mean_r > 0 else 1.0
            kg = gray_mean / mean_g if mean_g > 0 else 1.0
            kb = gray_mean / mean_b if mean_b > 0 else 1.0
            
            # Limit correction factors to reasonable range
            kr = np.clip(kr, 0.5, 2.0)
            kg = np.clip(kg, 0.5, 2.0)
            kb = np.clip(kb, 0.5, 2.0)
            
            # Apply correction
            corrected = img_array.astype(np.float32)
            corrected[:, :, 0] *= kr  # Red
            corrected[:, :, 1] *= kg  # Green
            corrected[:, :, 2] *= kb  # Blue
            
            # Clip and convert back
            corrected = np.clip(corrected, 0, 255).astype(np.uint8)
            
            return Image.fromarray(corrected)
        except Exception as e:
            logger.error(f"Auto white balance error: {e}")
            return pil_image
    
    def _auto_color_correction(self, pil_image: Image.Image) -> Image.Image:
        """Apply automatic color correction and enhancement"""
        try:
            img_array = np.array(pil_image)
            
            # Convert to LAB color space for better color manipulation
            lab = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
            l, a, b = cv2.split(lab)
            
            # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) to L channel
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            
            # Merge channels and convert back to RGB
            lab = cv2.merge((l, a, b))
            corrected = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)
            
            return Image.fromarray(corrected)
        except Exception as e:
            logger.error(f"Auto color correction error: {e}")
            return pil_image
    
    def _apply_background_blur(self, pil_image: Image.Image, cv_image: np.ndarray) -> Image.Image:
        """Apply background blur while keeping subject in focus"""
        try:
            # Simple implementation using edge detection for mask
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            
            # Create a rough subject mask using edge detection and morphology
            edges = cv2.Canny(gray, 50, 150)
            kernel = np.ones((5, 5), np.uint8)
            mask = cv2.dilate(edges, kernel, iterations=2)
            mask = cv2.GaussianBlur(mask, (5, 5), 0)
            
            # Convert mask to 3 channels
            mask_3ch = cv2.merge([mask, mask, mask])
            mask_normalized = mask_3ch.astype(np.float32) / 255.0
            
            # Create blurred version of image
            img_array = np.array(pil_image)
            blurred = cv2.GaussianBlur(img_array, (15, 15), 0)
            
            # Blend original and blurred based on mask
            result = (mask_normalized * img_array + (1 - mask_normalized) * blurred).astype(np.uint8)
            
            return Image.fromarray(result)
        except Exception as e:
            logger.error(f"Background blur error: {e}")
            return pil_image
    
    def _enhance_face_regions(self, pil_image: Image.Image, cv_image: np.ndarray) -> Image.Image:
        """Enhance face regions specifically"""
        try:
            # Load face cascade classifier
            face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
            
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) == 0:
                return pil_image
            
            img_array = np.array(pil_image)
            enhanced_array = img_array.copy()
            
            for (x, y, w, h) in faces:
                # Extract face region
                face_region = img_array[y:y+h, x:x+w]
                
                # Apply specific face enhancements
                # Slight brightness increase for faces
                face_enhanced = cv2.convertScaleAbs(face_region, alpha=1.1, beta=10)
                
                # Reduce noise in face region
                face_enhanced = cv2.bilateralFilter(face_enhanced, 5, 50, 50)
                
                # Replace face region in main image
                enhanced_array[y:y+h, x:x+w] = face_enhanced
            
            return Image.fromarray(enhanced_array)
        except Exception as e:
            logger.error(f"Face enhancement error: {e}")
            return pil_image
    
    def _calculate_improvement_score(self, original_path: str, enhanced_path: str, 
                                   original_metrics: Optional[Dict] = None) -> float:
        """Calculate how much the enhancement improved the photo"""
        try:
            from .photo_analyzer import photo_analyzer
            
            # Analyze original if metrics not provided
            if original_metrics is None:
                original_analysis = photo_analyzer.analyze_image_quality(original_path)
                original_score = original_analysis.overall_score
            else:
                original_score = original_metrics.get('overall_score', 0.5)
            
            # Analyze enhanced image
            enhanced_analysis = photo_analyzer.analyze_image_quality(enhanced_path)
            enhanced_score = enhanced_analysis.overall_score
            
            # Calculate improvement
            improvement = enhanced_score - original_score
            return max(0.0, improvement)
        except Exception as e:
            logger.error(f"Improvement score calculation error: {e}")
            return 0.0
    
    def _calculate_before_after_metrics(self, original_path: str, enhanced_path: str) -> Dict[str, Tuple[float, float]]:
        """Calculate detailed before/after metrics"""
        try:
            from .photo_analyzer import photo_analyzer
            
            # Analyze both images
            original_analysis = photo_analyzer.analyze_image_quality(original_path)
            enhanced_analysis = photo_analyzer.analyze_image_quality(enhanced_path)
            
            return {
                'brightness': (original_analysis.brightness_score, enhanced_analysis.brightness_score),
                'contrast': (original_analysis.contrast_score, enhanced_analysis.contrast_score),
                'sharpness': (original_analysis.sharpness_score, enhanced_analysis.sharpness_score),
                'noise_level': (original_analysis.noise_level, enhanced_analysis.noise_level),
                'overall_quality': (original_analysis.overall_score, enhanced_analysis.overall_score)
            }
        except Exception as e:
            logger.error(f"Before/after metrics calculation error: {e}")
            return {}
    
    def create_before_after_comparison(self, original_path: str, enhanced_path: str, 
                                     output_path: str) -> bool:
        """Create side-by-side before/after comparison image"""
        try:
            # Load both images
            original = Image.open(original_path)
            enhanced = Image.open(enhanced_path)
            
            # Resize to same dimensions
            width = max(original.width, enhanced.width)
            height = max(original.height, enhanced.height)
            
            original_resized = original.resize((width, height), Image.Resampling.LANCZOS)
            enhanced_resized = enhanced.resize((width, height), Image.Resampling.LANCZOS)
            
            # Create side-by-side comparison
            comparison = Image.new('RGB', (width * 2, height))
            comparison.paste(original_resized, (0, 0))
            comparison.paste(enhanced_resized, (width, 0))
            
            # Save comparison
            comparison.save(output_path, 'JPEG', quality=95)
            return True
        except Exception as e:
            logger.error(f"Comparison creation error: {e}")
            return False
    
    def batch_enhance(self, image_paths: List[str], output_dir: str, 
                     settings: Optional[EnhancementSettings] = None) -> List[EnhancementResult]:
        """Enhance multiple images in batch"""
        results = []
        
        for i, image_path in enumerate(image_paths):
            try:
                output_path = f"{output_dir}/enhanced_{i+1:03d}.jpg"
                
                if settings:
                    result = self.enhance_with_settings(image_path, output_path, settings)
                else:
                    result = self.auto_enhance(image_path, output_path)
                
                results.append(result)
                logger.info(f"Enhanced {image_path} -> {output_path}")
                
            except Exception as e:
                logger.error(f"Batch enhancement failed for {image_path}: {e}")
                results.append(EnhancementResult(
                    enhanced_image_path="",
                    settings_applied=settings or EnhancementSettings(),
                    processing_time=0.0,
                    improvement_score=0.0,
                    before_after_metrics={},
                    success=False,
                    error_message=str(e)
                ))
        
        return results


# Global enhancer instance
photo_enhancer = IntelligentPhotoEnhancer()