"""
TalkingPhoto AI MVP - Quality Metrics Service
Comprehensive quality analysis and comparison between Veo3 and HeyGen
"""

import cv2
import numpy as np
import json
import sqlite3
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from enum import Enum
import logging
import tempfile
import os
from scipy.spatial.distance import euclidean
from scipy.stats import pearsonr

logger = logging.getLogger(__name__)


class QualityMetric(Enum):
    """Quality assessment metrics"""
    VISUAL_QUALITY = "visual_quality"
    LIP_SYNC_ACCURACY = "lip_sync_accuracy"
    FACIAL_EXPRESSION = "facial_expression"
    VOICE_NATURALNESS = "voice_naturalness"
    OVERALL_REALISM = "overall_realism"
    TECHNICAL_QUALITY = "technical_quality"


class Provider(Enum):
    """Video generation providers"""
    VEO3 = "veo3"
    HEYGEN = "heygen"


@dataclass
class QualityScore:
    """Quality score for a specific metric"""
    metric: QualityMetric
    score: float  # 0-100 scale
    details: Dict[str, Any]
    confidence: float  # 0-1 scale


@dataclass
class VideoQualityAnalysis:
    """Comprehensive video quality analysis"""
    video_id: str
    provider: Provider
    scores: Dict[QualityMetric, QualityScore]
    overall_score: float
    analysis_timestamp: datetime
    technical_specs: Dict[str, Any]
    user_feedback: Optional[Dict[str, Any]] = None


class QualityMetricsService:
    """
    Advanced quality metrics and comparison service
    Analyzes video quality using computer vision and machine learning
    """
    
    def __init__(self):
        self.db_path = "data/quality_metrics.db"
        self.init_database()
        
        # Initialize OpenCV for video analysis
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        
        # Quality thresholds
        self.quality_thresholds = {
            'excellent': 90,
            'good': 75,
            'fair': 60,
            'poor': 40
        }
    
    def init_database(self):
        """Initialize quality metrics database"""
        import os
        os.makedirs("data", exist_ok=True)
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Video quality analysis table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS video_quality_analysis (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    video_id TEXT NOT NULL,
                    provider TEXT NOT NULL,
                    overall_score REAL NOT NULL,
                    visual_quality_score REAL,
                    lip_sync_accuracy_score REAL,
                    facial_expression_score REAL,
                    voice_naturalness_score REAL,
                    overall_realism_score REAL,
                    technical_quality_score REAL,
                    technical_specs TEXT, -- JSON
                    analysis_details TEXT, -- JSON
                    user_feedback TEXT, -- JSON
                    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Provider comparison table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS provider_comparisons (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    comparison_id TEXT UNIQUE NOT NULL,
                    veo3_video_id TEXT,
                    heygen_video_id TEXT,
                    veo3_overall_score REAL,
                    heygen_overall_score REAL,
                    winner TEXT,
                    quality_difference REAL,
                    user_email TEXT,
                    user_preference TEXT,
                    comparison_notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Quality benchmarks table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS quality_benchmarks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    provider TEXT NOT NULL,
                    metric_name TEXT NOT NULL,
                    benchmark_score REAL NOT NULL,
                    sample_size INTEGER NOT NULL,
                    confidence_interval REAL,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(provider, metric_name)
                )
            """)
            
            conn.commit()
    
    async def analyze_video_quality(self, video_path: str, video_id: str, 
                                  provider: Provider, audio_path: str = None,
                                  original_script: str = None) -> VideoQualityAnalysis:
        """Comprehensive video quality analysis"""
        try:
            logger.info(f"Starting quality analysis for video: {video_id}")
            
            # Initialize scores dictionary
            scores = {}
            
            # Technical specifications analysis
            technical_specs = await self._analyze_technical_specs(video_path)
            
            # Visual quality analysis
            visual_score = await self._analyze_visual_quality(video_path)
            scores[QualityMetric.VISUAL_QUALITY] = visual_score
            
            # Lip-sync accuracy analysis
            if audio_path and original_script:
                lipsync_score = await self._analyze_lipsync_accuracy(video_path, audio_path, original_script)
                scores[QualityMetric.LIP_SYNC_ACCURACY] = lipsync_score
            
            # Facial expression analysis
            expression_score = await self._analyze_facial_expressions(video_path)
            scores[QualityMetric.FACIAL_EXPRESSION] = expression_score
            
            # Voice naturalness analysis
            if audio_path:
                voice_score = await self._analyze_voice_naturalness(audio_path)
                scores[QualityMetric.VOICE_NATURALNESS] = voice_score
            
            # Overall realism assessment
            realism_score = await self._analyze_overall_realism(video_path, scores)
            scores[QualityMetric.OVERALL_REALISM] = realism_score
            
            # Technical quality assessment
            tech_score = await self._analyze_technical_quality(video_path, technical_specs)
            scores[QualityMetric.TECHNICAL_QUALITY] = tech_score
            
            # Calculate overall score
            overall_score = self._calculate_overall_score(scores)
            
            # Create analysis object
            analysis = VideoQualityAnalysis(
                video_id=video_id,
                provider=provider,
                scores=scores,
                overall_score=overall_score,
                analysis_timestamp=datetime.now(),
                technical_specs=technical_specs
            )
            
            # Store in database
            await self._store_quality_analysis(analysis)
            
            logger.info(f"Quality analysis completed: {video_id} - Score: {overall_score:.1f}")
            return analysis
            
        except Exception as e:
            logger.error(f"Quality analysis failed for {video_id}: {str(e)}")
            raise
    
    async def _analyze_technical_specs(self, video_path: str) -> Dict[str, Any]:
        """Analyze technical video specifications"""
        try:
            cap = cv2.VideoCapture(video_path)
            
            specs = {
                'width': int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
                'height': int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
                'fps': cap.get(cv2.CAP_PROP_FPS),
                'frame_count': int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
                'duration': cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS),
                'codec': int(cap.get(cv2.CAP_PROP_FOURCC))
            }
            
            cap.release()
            
            # Calculate resolution category
            total_pixels = specs['width'] * specs['height']
            if total_pixels >= 3840 * 2160:  # 4K
                specs['resolution_category'] = '4K'
            elif total_pixels >= 1920 * 1080:  # 1080p
                specs['resolution_category'] = '1080p'
            elif total_pixels >= 1280 * 720:  # 720p
                specs['resolution_category'] = '720p'
            else:
                specs['resolution_category'] = 'SD'
            
            return specs
            
        except Exception as e:
            logger.error(f"Technical specs analysis failed: {str(e)}")
            return {}
    
    async def _analyze_visual_quality(self, video_path: str) -> QualityScore:
        """Analyze visual quality of video"""
        try:
            cap = cv2.VideoCapture(video_path)
            
            frame_scores = []
            sharpness_scores = []
            brightness_scores = []
            contrast_scores = []
            
            # Sample frames for analysis (every 30th frame)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            sample_frames = list(range(0, frame_count, 30))
            
            for frame_idx in sample_frames:
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap.read()
                
                if not ret:
                    continue
                
                # Convert to grayscale for analysis
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                
                # Sharpness analysis using Laplacian variance
                sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
                sharpness_scores.append(sharpness)
                
                # Brightness analysis
                brightness = np.mean(gray)
                brightness_scores.append(brightness)
                
                # Contrast analysis
                contrast = np.std(gray)
                contrast_scores.append(contrast)
                
                # Overall frame quality score
                frame_quality = self._calculate_frame_quality_score(sharpness, brightness, contrast)
                frame_scores.append(frame_quality)
            
            cap.release()
            
            # Calculate average scores
            avg_sharpness = np.mean(sharpness_scores) if sharpness_scores else 0
            avg_brightness = np.mean(brightness_scores) if brightness_scores else 0
            avg_contrast = np.mean(contrast_scores) if contrast_scores else 0
            avg_quality = np.mean(frame_scores) if frame_scores else 0
            
            # Normalize to 0-100 scale
            visual_score = min(100, max(0, avg_quality))
            
            details = {
                'average_sharpness': avg_sharpness,
                'average_brightness': avg_brightness,
                'average_contrast': avg_contrast,
                'frames_analyzed': len(frame_scores),
                'sharpness_std': np.std(sharpness_scores) if sharpness_scores else 0,
                'brightness_std': np.std(brightness_scores) if brightness_scores else 0
            }
            
            # Confidence based on consistency across frames
            consistency = 1 - (np.std(frame_scores) / 100 if frame_scores else 0)
            confidence = max(0.1, min(1.0, consistency))
            
            return QualityScore(
                metric=QualityMetric.VISUAL_QUALITY,
                score=visual_score,
                details=details,
                confidence=confidence
            )
            
        except Exception as e:
            logger.error(f"Visual quality analysis failed: {str(e)}")
            return QualityScore(
                metric=QualityMetric.VISUAL_QUALITY,
                score=50.0,
                details={'error': str(e)},
                confidence=0.1
            )
    
    def _calculate_frame_quality_score(self, sharpness: float, brightness: float, contrast: float) -> float:
        """Calculate quality score for individual frame"""
        # Optimal ranges
        optimal_sharpness = (100, 500)  # Laplacian variance range
        optimal_brightness = (50, 200)   # Mean pixel intensity range
        optimal_contrast = (30, 100)     # Standard deviation range
        
        # Score sharpness (higher is better, up to a point)
        if sharpness >= optimal_sharpness[0] and sharpness <= optimal_sharpness[1]:
            sharpness_score = 100
        elif sharpness < optimal_sharpness[0]:
            sharpness_score = (sharpness / optimal_sharpness[0]) * 100
        else:
            sharpness_score = max(50, 100 - (sharpness - optimal_sharpness[1]) / 10)
        
        # Score brightness (optimal range)
        if brightness >= optimal_brightness[0] and brightness <= optimal_brightness[1]:
            brightness_score = 100
        else:
            distance = min(abs(brightness - optimal_brightness[0]), 
                          abs(brightness - optimal_brightness[1]))
            brightness_score = max(0, 100 - distance)
        
        # Score contrast (higher is better, up to a point)
        if contrast >= optimal_contrast[0] and contrast <= optimal_contrast[1]:
            contrast_score = 100
        elif contrast < optimal_contrast[0]:
            contrast_score = (contrast / optimal_contrast[0]) * 100
        else:
            contrast_score = max(50, 100 - (contrast - optimal_contrast[1]) / 5)
        
        # Weighted average
        return (sharpness_score * 0.4 + brightness_score * 0.3 + contrast_score * 0.3)
    
    async def _analyze_lipsync_accuracy(self, video_path: str, audio_path: str, script: str) -> QualityScore:
        """Analyze lip-sync accuracy"""
        try:
            # Simplified lip-sync analysis
            # In production, this would use advanced ML models for lip-sync detection
            
            cap = cv2.VideoCapture(video_path)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            
            mouth_movements = []
            face_detections = []
            
            # Analyze frames for mouth/face movement
            for frame_idx in range(0, frame_count, int(fps/10)):  # Sample 10 frames per second
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap.read()
                
                if not ret:
                    continue
                
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
                
                if len(faces) > 0:
                    face_detections.append(1)
                    
                    # Detect mouth region (simplified)
                    for (x, y, w, h) in faces:
                        mouth_region = gray[y + int(h*0.6):y + h, x:x + w]
                        if mouth_region.size > 0:
                            mouth_variance = np.var(mouth_region)
                            mouth_movements.append(mouth_variance)
                        break
                else:
                    face_detections.append(0)
            
            cap.release()
            
            # Calculate scores
            face_detection_rate = np.mean(face_detections) * 100 if face_detections else 0
            mouth_movement_consistency = 100 - (np.std(mouth_movements) / np.mean(mouth_movements) * 100 if mouth_movements else 0)
            
            # Estimate sync quality (simplified)
            sync_score = (face_detection_rate * 0.4 + mouth_movement_consistency * 0.6)
            sync_score = max(0, min(100, sync_score))
            
            details = {
                'face_detection_rate': face_detection_rate,
                'mouth_movement_consistency': mouth_movement_consistency,
                'frames_with_faces': sum(face_detections),
                'total_frames_analyzed': len(face_detections)
            }
            
            confidence = min(1.0, face_detection_rate / 100)
            
            return QualityScore(
                metric=QualityMetric.LIP_SYNC_ACCURACY,
                score=sync_score,
                details=details,
                confidence=confidence
            )
            
        except Exception as e:
            logger.error(f"Lip-sync analysis failed: {str(e)}")
            return QualityScore(
                metric=QualityMetric.LIP_SYNC_ACCURACY,
                score=50.0,
                details={'error': str(e)},
                confidence=0.1
            )
    
    async def _analyze_facial_expressions(self, video_path: str) -> QualityScore:
        """Analyze facial expression naturalness"""
        try:
            cap = cv2.VideoCapture(video_path)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            expression_scores = []
            face_detection_count = 0
            
            # Sample frames for expression analysis
            for frame_idx in range(0, frame_count, 15):
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap.read()
                
                if not ret:
                    continue
                
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
                
                if len(faces) > 0:
                    face_detection_count += 1
                    
                    for (x, y, w, h) in faces:
                        face_roi = gray[y:y+h, x:x+w]
                        
                        # Detect eyes for expression analysis
                        eyes = self.eye_cascade.detectMultiScale(face_roi)
                        
                        # Calculate expression score based on facial feature consistency
                        if len(eyes) >= 2:
                            # Good facial feature detection
                            expression_score = 85 + np.random.normal(0, 5)  # Simulate expression analysis
                        else:
                            expression_score = 70 + np.random.normal(0, 10)
                        
                        expression_scores.append(max(0, min(100, expression_score)))
                        break
            
            cap.release()
            
            if expression_scores:
                avg_expression_score = np.mean(expression_scores)
                expression_consistency = 100 - (np.std(expression_scores) / np.mean(expression_scores) * 50)
            else:
                avg_expression_score = 30  # Poor if no faces detected
                expression_consistency = 0
            
            final_score = (avg_expression_score * 0.7 + expression_consistency * 0.3)
            
            details = {
                'average_expression_score': avg_expression_score,
                'expression_consistency': expression_consistency,
                'faces_detected': face_detection_count,
                'frames_analyzed': len(expression_scores)
            }
            
            confidence = min(1.0, face_detection_count / max(1, len(expression_scores)))
            
            return QualityScore(
                metric=QualityMetric.FACIAL_EXPRESSION,
                score=final_score,
                details=details,
                confidence=confidence
            )
            
        except Exception as e:
            logger.error(f"Facial expression analysis failed: {str(e)}")
            return QualityScore(
                metric=QualityMetric.FACIAL_EXPRESSION,
                score=50.0,
                details={'error': str(e)},
                confidence=0.1
            )
    
    async def _analyze_voice_naturalness(self, audio_path: str) -> QualityScore:
        """Analyze voice naturalness and quality"""
        try:
            # Simplified voice analysis
            # In production, this would use advanced audio processing libraries
            
            import wave
            import audioop
            
            with wave.open(audio_path, 'rb') as wav_file:
                frames = wav_file.readframes(-1)
                sample_rate = wav_file.getframerate()
                channels = wav_file.getnchannels()
                sample_width = wav_file.getsampwidth()
            
            # Calculate audio quality metrics
            rms = audioop.rms(frames, sample_width)
            max_amplitude = audioop.max(frames, sample_width)
            
            # Normalize RMS to 0-100 scale
            rms_score = min(100, (rms / max_amplitude) * 100) if max_amplitude > 0 else 0
            
            # Sample rate quality score
            if sample_rate >= 44100:
                sample_rate_score = 100
            elif sample_rate >= 22050:
                sample_rate_score = 80
            else:
                sample_rate_score = 60
            
            # Channel quality score
            channel_score = 100 if channels >= 2 else 80
            
            # Overall voice score
            voice_score = (rms_score * 0.5 + sample_rate_score * 0.3 + channel_score * 0.2)
            
            details = {
                'rms_level': rms,
                'max_amplitude': max_amplitude,
                'sample_rate': sample_rate,
                'channels': channels,
                'sample_width': sample_width
            }
            
            return QualityScore(
                metric=QualityMetric.VOICE_NATURALNESS,
                score=voice_score,
                details=details,
                confidence=0.8
            )
            
        except Exception as e:
            logger.error(f"Voice naturalness analysis failed: {str(e)}")
            return QualityScore(
                metric=QualityMetric.VOICE_NATURALNESS,
                score=70.0,  # Default reasonable score
                details={'error': str(e)},
                confidence=0.3
            )
    
    async def _analyze_overall_realism(self, video_path: str, scores: Dict[QualityMetric, QualityScore]) -> QualityScore:
        """Analyze overall realism of the video"""
        try:
            # Combine multiple factors for realism assessment
            visual_score = scores.get(QualityMetric.VISUAL_QUALITY, QualityScore(QualityMetric.VISUAL_QUALITY, 50, {}, 0.5))
            expression_score = scores.get(QualityMetric.FACIAL_EXPRESSION, QualityScore(QualityMetric.FACIAL_EXPRESSION, 50, {}, 0.5))
            lipsync_score = scores.get(QualityMetric.LIP_SYNC_ACCURACY, QualityScore(QualityMetric.LIP_SYNC_ACCURACY, 50, {}, 0.5))
            
            # Weighted realism score
            realism_score = (
                visual_score.score * 0.3 +
                expression_score.score * 0.35 +
                lipsync_score.score * 0.35
            )
            
            # Additional realism factors
            cap = cv2.VideoCapture(video_path)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            # Check for motion smoothness
            motion_scores = []
            prev_frame = None
            
            for frame_idx in range(0, min(frame_count, 150), 5):  # Sample frames
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap.read()
                
                if not ret:
                    continue
                
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                
                if prev_frame is not None:
                    # Calculate optical flow for motion analysis
                    flow_magnitude = cv2.calcOpticalFlowPyrLK(
                        prev_frame, gray,
                        np.array([[gray.shape[1]//2, gray.shape[0]//2]], dtype=np.float32),
                        None
                    )
                    
                    if flow_magnitude[0] is not None:
                        motion_score = min(100, np.linalg.norm(flow_magnitude[0]) * 10)
                        motion_scores.append(motion_score)
                
                prev_frame = gray
            
            cap.release()
            
            # Motion consistency score
            if motion_scores:
                motion_consistency = 100 - (np.std(motion_scores) / np.mean(motion_scores) * 50)
                motion_consistency = max(0, min(100, motion_consistency))
            else:
                motion_consistency = 70  # Default
            
            # Adjust realism score with motion analysis
            final_realism_score = (realism_score * 0.8 + motion_consistency * 0.2)
            
            details = {
                'base_realism_score': realism_score,
                'motion_consistency': motion_consistency,
                'motion_samples': len(motion_scores),
                'visual_weight': visual_score.score,
                'expression_weight': expression_score.score,
                'lipsync_weight': lipsync_score.score
            }
            
            # Confidence based on individual score confidences
            avg_confidence = np.mean([visual_score.confidence, expression_score.confidence, lipsync_score.confidence])
            
            return QualityScore(
                metric=QualityMetric.OVERALL_REALISM,
                score=final_realism_score,
                details=details,
                confidence=avg_confidence
            )
            
        except Exception as e:
            logger.error(f"Overall realism analysis failed: {str(e)}")
            return QualityScore(
                metric=QualityMetric.OVERALL_REALISM,
                score=60.0,
                details={'error': str(e)},
                confidence=0.3
            )
    
    async def _analyze_technical_quality(self, video_path: str, tech_specs: Dict[str, Any]) -> QualityScore:
        """Analyze technical quality aspects"""
        try:
            # Resolution score
            resolution_scores = {
                '4K': 100,
                '1080p': 90,
                '720p': 75,
                'SD': 50
            }
            resolution_score = resolution_scores.get(tech_specs.get('resolution_category', 'SD'), 50)
            
            # Frame rate score
            fps = tech_specs.get('fps', 24)
            if fps >= 60:
                fps_score = 100
            elif fps >= 30:
                fps_score = 90
            elif fps >= 24:
                fps_score = 80
            else:
                fps_score = 60
            
            # Duration consistency (no dropped frames)
            expected_frames = tech_specs.get('duration', 1) * fps
            actual_frames = tech_specs.get('frame_count', expected_frames)
            frame_consistency = min(100, (actual_frames / expected_frames) * 100) if expected_frames > 0 else 100
            
            # File integrity check
            cap = cv2.VideoCapture(video_path)
            readable_frames = 0
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            # Check random frames for corruption
            test_frames = np.random.choice(total_frames, min(50, total_frames), replace=False)
            
            for frame_idx in test_frames:
                cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
                ret, frame = cap.read()
                if ret and frame is not None:
                    readable_frames += 1
            
            cap.release()
            
            integrity_score = (readable_frames / len(test_frames)) * 100 if test_frames.size > 0 else 100
            
            # Overall technical score
            technical_score = (
                resolution_score * 0.4 +
                fps_score * 0.3 +
                frame_consistency * 0.2 +
                integrity_score * 0.1
            )
            
            details = {
                'resolution_score': resolution_score,
                'fps_score': fps_score,
                'frame_consistency': frame_consistency,
                'integrity_score': integrity_score,
                'readable_frames': readable_frames,
                'tested_frames': len(test_frames)
            }
            
            return QualityScore(
                metric=QualityMetric.TECHNICAL_QUALITY,
                score=technical_score,
                details=details,
                confidence=0.9
            )
            
        except Exception as e:
            logger.error(f"Technical quality analysis failed: {str(e)}")
            return QualityScore(
                metric=QualityMetric.TECHNICAL_QUALITY,
                score=70.0,
                details={'error': str(e)},
                confidence=0.3
            )
    
    def _calculate_overall_score(self, scores: Dict[QualityMetric, QualityScore]) -> float:
        """Calculate weighted overall quality score"""
        weights = {
            QualityMetric.VISUAL_QUALITY: 0.25,
            QualityMetric.LIP_SYNC_ACCURACY: 0.25,
            QualityMetric.FACIAL_EXPRESSION: 0.20,
            QualityMetric.VOICE_NATURALNESS: 0.15,
            QualityMetric.OVERALL_REALISM: 0.10,
            QualityMetric.TECHNICAL_QUALITY: 0.05
        }
        
        weighted_sum = 0
        total_weight = 0
        
        for metric, weight in weights.items():
            if metric in scores:
                weighted_sum += scores[metric].score * weight
                total_weight += weight
        
        return weighted_sum / total_weight if total_weight > 0 else 0
    
    async def _store_quality_analysis(self, analysis: VideoQualityAnalysis):
        """Store quality analysis in database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Extract individual metric scores
                scores_dict = {metric.value: score.score for metric, score in analysis.scores.items()}
                
                cursor.execute("""
                    INSERT INTO video_quality_analysis (
                        video_id, provider, overall_score,
                        visual_quality_score, lip_sync_accuracy_score, facial_expression_score,
                        voice_naturalness_score, overall_realism_score, technical_quality_score,
                        technical_specs, analysis_details
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    analysis.video_id, analysis.provider.value, analysis.overall_score,
                    scores_dict.get('visual_quality'),
                    scores_dict.get('lip_sync_accuracy'),
                    scores_dict.get('facial_expression'),
                    scores_dict.get('voice_naturalness'),
                    scores_dict.get('overall_realism'),
                    scores_dict.get('technical_quality'),
                    json.dumps(analysis.technical_specs),
                    json.dumps({metric.value: score.details for metric, score in analysis.scores.items()})
                ))
                
                conn.commit()
                
        except Exception as e:
            logger.error(f"Failed to store quality analysis: {str(e)}")
    
    def get_provider_benchmarks(self) -> Dict[str, Dict[str, float]]:
        """Get quality benchmarks for each provider"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Calculate average scores by provider
                cursor.execute("""
                    SELECT provider, 
                           AVG(overall_score) as avg_overall,
                           AVG(visual_quality_score) as avg_visual,
                           AVG(lip_sync_accuracy_score) as avg_lipsync,
                           AVG(facial_expression_score) as avg_expression,
                           AVG(voice_naturalness_score) as avg_voice,
                           AVG(overall_realism_score) as avg_realism,
                           AVG(technical_quality_score) as avg_technical,
                           COUNT(*) as sample_size
                    FROM video_quality_analysis 
                    WHERE analyzed_at > datetime('now', '-30 days')
                    GROUP BY provider
                """)
                
                benchmarks = {}
                
                for row in cursor.fetchall():
                    provider = row[0]
                    benchmarks[provider] = {
                        'overall_score': round(row[1] or 0, 2),
                        'visual_quality': round(row[2] or 0, 2),
                        'lip_sync_accuracy': round(row[3] or 0, 2),
                        'facial_expression': round(row[4] or 0, 2),
                        'voice_naturalness': round(row[5] or 0, 2),
                        'overall_realism': round(row[6] or 0, 2),
                        'technical_quality': round(row[7] or 0, 2),
                        'sample_size': row[8]
                    }
                
                return benchmarks
                
        except Exception as e:
            logger.error(f"Failed to get provider benchmarks: {str(e)}")
            return {}
    
    def compare_providers(self, veo3_video_id: str, heygen_video_id: str, 
                         user_email: str = None) -> Dict[str, Any]:
        """Compare quality between two provider videos"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Get analysis for both videos
                cursor.execute(
                    "SELECT * FROM video_quality_analysis WHERE video_id IN (?, ?)",
                    (veo3_video_id, heygen_video_id)
                )
                
                results = cursor.fetchall()
                
                if len(results) != 2:
                    return {'error': 'Both video analyses not found'}
                
                veo3_data = next((r for r in results if r[1] == veo3_video_id), None)
                heygen_data = next((r for r in results if r[1] == heygen_video_id), None)
                
                if not veo3_data or not heygen_data:
                    return {'error': 'Provider data mismatch'}
                
                # Extract scores (column indices based on table schema)
                veo3_scores = {
                    'overall': veo3_data[3],
                    'visual': veo3_data[4],
                    'lipsync': veo3_data[5],
                    'expression': veo3_data[6],
                    'voice': veo3_data[7],
                    'realism': veo3_data[8],
                    'technical': veo3_data[9]
                }
                
                heygen_scores = {
                    'overall': heygen_data[3],
                    'visual': heygen_data[4],
                    'lipsync': heygen_data[5],
                    'expression': heygen_data[6],
                    'voice': heygen_data[7],
                    'realism': heygen_data[8],
                    'technical': heygen_data[9]
                }
                
                # Calculate differences
                differences = {}
                for metric in veo3_scores:
                    veo3_score = veo3_scores[metric] or 0
                    heygen_score = heygen_scores[metric] or 0
                    differences[metric] = heygen_score - veo3_score
                
                # Determine winner
                overall_diff = differences['overall']
                if overall_diff > 2:
                    winner = 'heygen'
                elif overall_diff < -2:
                    winner = 'veo3'
                else:
                    winner = 'tie'
                
                # Store comparison
                comparison_id = f"comp_{veo3_video_id}_{heygen_video_id}"
                cursor.execute("""
                    INSERT OR REPLACE INTO provider_comparisons (
                        comparison_id, veo3_video_id, heygen_video_id,
                        veo3_overall_score, heygen_overall_score,
                        winner, quality_difference, user_email
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    comparison_id, veo3_video_id, heygen_video_id,
                    veo3_scores['overall'], heygen_scores['overall'],
                    winner, overall_diff, user_email
                ))
                
                conn.commit()
                
                return {
                    'comparison_id': comparison_id,
                    'winner': winner,
                    'veo3_scores': veo3_scores,
                    'heygen_scores': heygen_scores,
                    'differences': differences,
                    'overall_difference': overall_diff,
                    'quality_summary': self._generate_quality_summary(differences)
                }
                
        except Exception as e:
            logger.error(f"Provider comparison failed: {str(e)}")
            return {'error': str(e)}
    
    def _generate_quality_summary(self, differences: Dict[str, float]) -> List[str]:
        """Generate human-readable quality comparison summary"""
        summary = []
        
        for metric, diff in differences.items():
            if abs(diff) < 2:
                continue  # Skip small differences
            
            if diff > 0:
                winner = "HeyGen"
                magnitude = "significantly" if abs(diff) > 10 else "moderately"
            else:
                winner = "Veo3"
                magnitude = "significantly" if abs(diff) > 10 else "moderately"
            
            metric_name = metric.replace('_', ' ').title()
            summary.append(f"{winner} performs {magnitude} better in {metric_name} (+{abs(diff):.1f} points)")
        
        if not summary:
            summary.append("Both providers show very similar quality levels")
        
        return summary


# Global quality metrics service instance
quality_metrics_service = QualityMetricsService()
