"""
Nano Banana API Client for AI-Powered Photo Analysis
Integrates with Google Gemini 2.5 Flash Image for face detection and analysis
Cost: ₹0.039 per image
"""

import base64
import requests
import time
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from PIL import Image
import io
import logging

from ..core.config import get_settings

logger = logging.getLogger(__name__)

@dataclass
class FaceDetectionResult:
    """Result from face detection API"""
    faces_detected: int
    confidence: float
    bounding_boxes: List[Dict[str, float]]
    landmarks: List[Dict[str, Any]]
    processing_time: float
    raw_response: Dict[str, Any]

@dataclass
class PhotoAnalysisResult:
    """Complete photo analysis result"""
    quality_score: float
    brightness_score: float
    contrast_score: float
    sharpness_score: float
    noise_level: float
    composition_score: float
    crop_suggestions: Optional[Dict[str, int]]
    processing_time: float
    raw_response: Dict[str, Any]


class NanoBananaClient:
    """
    High-performance client for Nano Banana AI API
    Handles face detection, photo analysis, and quality assessment
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.nano_banana_api_key
        self.base_url = self.settings.nano_banana_base_url
        self.timeout = self.settings.photo_processing_timeout
        
        if not self.api_key:
            logger.warning("Nano Banana API key not configured")
        
        # Request session for connection pooling
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'TalkingPhoto-AI/1.0'
        })
    
    def _encode_image_to_base64(self, image_path: str) -> str:
        """Convert image to base64 for API transmission"""
        try:
            with open(image_path, 'rb') as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                return encoded_string
        except Exception as e:
            logger.error(f"Failed to encode image {image_path}: {e}")
            raise
    
    def _encode_pil_image_to_base64(self, pil_image: Image.Image) -> str:
        """Convert PIL Image to base64"""
        try:
            buffer = io.BytesIO()
            pil_image.save(buffer, format='JPEG')
            encoded_string = base64.b64encode(buffer.getvalue()).decode('utf-8')
            return encoded_string
        except Exception as e:
            logger.error(f"Failed to encode PIL image: {e}")
            raise
    
    def _make_request(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Make authenticated request to Nano Banana API"""
        url = f"{self.base_url}/{endpoint}"
        
        try:
            start_time = time.time()
            response = self.session.post(url, json=payload, timeout=self.timeout)
            processing_time = time.time() - start_time
            
            response.raise_for_status()
            result = response.json()
            result['processing_time'] = processing_time
            
            return result
        
        except requests.exceptions.Timeout:
            logger.error(f"Nano Banana API timeout for endpoint {endpoint}")
            raise Exception("API request timeout")
        
        except requests.exceptions.HTTPError as e:
            logger.error(f"Nano Banana API HTTP error: {e.response.status_code} - {e.response.text}")
            raise Exception(f"API request failed: {e.response.status_code}")
        
        except Exception as e:
            logger.error(f"Nano Banana API request error: {e}")
            raise
    
    async def detect_faces(self, image_path: str, confidence_threshold: float = None) -> FaceDetectionResult:
        """
        Detect faces in image using Google Gemini 2.5 Flash Image
        
        Args:
            image_path: Path to image file
            confidence_threshold: Minimum confidence for face detection
            
        Returns:
            FaceDetectionResult with detection results
        """
        if confidence_threshold is None:
            confidence_threshold = self.settings.face_detection_confidence
        
        try:
            # Encode image
            image_b64 = self._encode_image_to_base64(image_path)
            
            # Prepare request payload
            payload = {
                "model": "gemini-2.5-flash-image",
                "task": "face_detection",
                "image": image_b64,
                "parameters": {
                    "confidence_threshold": confidence_threshold,
                    "return_landmarks": True,
                    "return_expressions": True,
                    "max_faces": 10
                }
            }
            
            # Make API request
            response = self._make_request("face-detection", payload)
            
            # Parse response
            faces_detected = len(response.get('faces', []))
            avg_confidence = sum(face.get('confidence', 0) for face in response.get('faces', [])) / max(faces_detected, 1)
            
            bounding_boxes = []
            landmarks = []
            
            for face in response.get('faces', []):
                # Extract bounding box
                bbox = face.get('bounding_box', {})
                bounding_boxes.append({
                    'x': bbox.get('x', 0),
                    'y': bbox.get('y', 0), 
                    'width': bbox.get('width', 0),
                    'height': bbox.get('height', 0)
                })
                
                # Extract landmarks
                face_landmarks = face.get('landmarks', {})
                landmarks.append({
                    'left_eye': face_landmarks.get('left_eye'),
                    'right_eye': face_landmarks.get('right_eye'),
                    'nose': face_landmarks.get('nose'),
                    'mouth': face_landmarks.get('mouth'),
                    'face_outline': face_landmarks.get('face_outline'),
                    'expression': face.get('expression'),
                    'head_pose': face.get('head_pose')
                })
            
            return FaceDetectionResult(
                faces_detected=faces_detected,
                confidence=avg_confidence,
                bounding_boxes=bounding_boxes,
                landmarks=landmarks,
                processing_time=response.get('processing_time', 0),
                raw_response=response
            )
            
        except Exception as e:
            logger.error(f"Face detection failed for {image_path}: {e}")
            # Return empty result on failure
            return FaceDetectionResult(
                faces_detected=0,
                confidence=0.0,
                bounding_boxes=[],
                landmarks=[],
                processing_time=0.0,
                raw_response={}
            )
    
    async def analyze_photo_quality(self, image_path: str) -> PhotoAnalysisResult:
        """
        Analyze photo quality, composition, and provide enhancement recommendations
        
        Args:
            image_path: Path to image file
            
        Returns:
            PhotoAnalysisResult with analysis results
        """
        try:
            # Encode image
            image_b64 = self._encode_image_to_base64(image_path)
            
            # Prepare request payload
            payload = {
                "model": "gemini-2.5-flash-image",
                "task": "photo_analysis",
                "image": image_b64,
                "parameters": {
                    "analyze_quality": True,
                    "analyze_composition": True,
                    "suggest_crops": True,
                    "return_metrics": True
                }
            }
            
            # Make API request
            response = self._make_request("photo-analysis", payload)
            
            # Parse quality metrics
            quality = response.get('quality', {})
            composition = response.get('composition', {})
            crops = response.get('crop_suggestions', [])
            
            # Extract best crop suggestion
            crop_suggestion = None
            if crops:
                best_crop = max(crops, key=lambda x: x.get('score', 0))
                crop_suggestion = {
                    'x': best_crop.get('x', 0),
                    'y': best_crop.get('y', 0),
                    'width': best_crop.get('width', 0),
                    'height': best_crop.get('height', 0)
                }
            
            return PhotoAnalysisResult(
                quality_score=quality.get('overall_score', 0.5),
                brightness_score=quality.get('brightness', 0.5),
                contrast_score=quality.get('contrast', 0.5),
                sharpness_score=quality.get('sharpness', 0.5),
                noise_level=quality.get('noise_level', 0.5),
                composition_score=composition.get('overall_score', 0.5),
                crop_suggestions=crop_suggestion,
                processing_time=response.get('processing_time', 0),
                raw_response=response
            )
            
        except Exception as e:
            logger.error(f"Photo analysis failed for {image_path}: {e}")
            # Return default result on failure
            return PhotoAnalysisResult(
                quality_score=0.5,
                brightness_score=0.5,
                contrast_score=0.5,
                sharpness_score=0.5,
                noise_level=0.5,
                composition_score=0.5,
                crop_suggestions=None,
                processing_time=0.0,
                raw_response={}
            )
    
    def validate_image_format(self, image_path: str) -> Tuple[bool, str]:
        """
        Validate image format and size for processing
        
        Args:
            image_path: Path to image file
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            with Image.open(image_path) as img:
                # Check format
                if img.format not in self.settings.supported_photo_formats:
                    return False, f"Unsupported format: {img.format}. Supported: {self.settings.supported_photo_formats}"
                
                # Check file size
                import os
                file_size_mb = os.path.getsize(image_path) / (1024 * 1024)
                if file_size_mb > self.settings.max_photo_size_mb:
                    return False, f"File too large: {file_size_mb:.2f}MB. Max: {self.settings.max_photo_size_mb}MB"
                
                # Check dimensions (minimum requirements for face detection)
                min_width, min_height = 200, 200
                if img.width < min_width or img.height < min_height:
                    return False, f"Image too small: {img.width}x{img.height}. Min: {min_width}x{min_height}"
                
                return True, ""
        
        except Exception as e:
            return False, f"Invalid image file: {e}"
    
    def get_api_usage_stats(self) -> Dict[str, Any]:
        """Get API usage statistics"""
        try:
            response = self._make_request("usage", {})
            return response
        except Exception as e:
            logger.error(f"Failed to get API usage stats: {e}")
            return {}
    
    def health_check(self) -> bool:
        """Check if Nano Banana API is available"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=5)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Nano Banana API health check failed: {e}")
            return False


# Global client instance for dependency injection
nano_banana_client = NanoBananaClient()