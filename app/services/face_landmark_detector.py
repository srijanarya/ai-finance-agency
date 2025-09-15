"""
High-Precision Facial Landmark Detection & Analysis
Optimized for video generation pipeline with 3D face modeling
"""

import cv2
import numpy as np
import mediapipe as mp
import dlib
from PIL import Image
from typing import Dict, List, Tuple, Optional, Any
import time
import logging
from dataclasses import dataclass
import math
from scipy.spatial import ConvexHull
from scipy.spatial.distance import euclidean

from .nano_banana_client import nano_banana_client

logger = logging.getLogger(__name__)

@dataclass
class FaceLandmarks:
    """Complete facial landmarks data structure"""
    # Basic detection info
    face_id: int
    confidence: float
    
    # Bounding box
    bbox: Tuple[float, float, float, float]  # x, y, width, height
    
    # Key landmarks for lip-sync
    left_eye_center: Tuple[float, float]
    right_eye_center: Tuple[float, float]
    nose_tip: Tuple[float, float]
    mouth_center: Tuple[float, float]
    mouth_left: Tuple[float, float]
    mouth_right: Tuple[float, float]
    
    # All facial landmarks (468 points for MediaPipe)
    all_landmarks: List[Tuple[float, float]]
    
    # Head pose (Euler angles in degrees)
    head_pose: Tuple[float, float, float]  # pitch, yaw, roll
    
    # Expression analysis
    expression_scores: Dict[str, float]
    primary_expression: str
    
    # 3D face mesh data
    face_mesh_3d: Optional[np.ndarray] = None
    texture_coordinates: Optional[np.ndarray] = None
    
    # Quality metrics
    landmark_quality: float = 0.0
    suitable_for_animation: bool = False
    symmetry_score: float = 0.0

@dataclass
class FaceAnalysisResult:
    """Complete face analysis result"""
    faces_detected: int
    primary_face: Optional[FaceLandmarks]
    all_faces: List[FaceLandmarks]
    processing_time: float
    detection_method: str
    image_quality_for_faces: float
    recommendations: List[str]


class FaceLandmarkDetector:
    """
    High-precision facial landmark detector using multiple methods
    Optimized for video generation with accurate lip-sync capabilities
    """
    
    def __init__(self):
        # Initialize MediaPipe
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=5,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Initialize dlib (as fallback)
        try:
            self.dlib_predictor_path = "models/shape_predictor_68_face_landmarks.dat"
            self.dlib_detector = dlib.get_frontal_face_detector()
            # Note: Download shape_predictor_68_face_landmarks.dat from dlib
            # self.dlib_predictor = dlib.shape_predictor(self.dlib_predictor_path)
            self.dlib_available = False  # Set to True when model is available
        except:
            self.dlib_available = False
            logger.warning("Dlib face predictor model not available")
        
        # Expression labels for analysis
        self.expressions = [
            'neutral', 'happy', 'sad', 'angry', 'surprised', 
            'fearful', 'disgusted', 'contempt'
        ]
        
        # Key landmark indices for MediaPipe (468-point model)
        self.mp_landmark_indices = {
            'left_eye_center': 468,  # Approximation
            'right_eye_center': 473,  # Approximation
            'nose_tip': 1,
            'mouth_center': 13,
            'mouth_left': 61,
            'mouth_right': 291,
            'left_eye': [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
            'right_eye': [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
            'mouth_outer': [61, 146, 91, 181, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318],
            'face_outline': [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
        }
    
    async def detect_landmarks(self, image_path: str, use_nano_banana: bool = True) -> FaceAnalysisResult:
        """
        Detect facial landmarks using the best available method
        
        Args:
            image_path: Path to image file
            use_nano_banana: Whether to use Nano Banana API as primary method
            
        Returns:
            FaceAnalysisResult with detected landmarks
        """
        start_time = time.time()
        
        try:
            # Try Nano Banana API first if requested and available
            if use_nano_banana and nano_banana_client.api_key:
                try:
                    nano_result = await nano_banana_client.detect_faces(image_path)
                    if nano_result.faces_detected > 0:
                        return self._process_nano_banana_result(nano_result, image_path, start_time)
                except Exception as e:
                    logger.warning(f"Nano Banana detection failed, falling back to MediaPipe: {e}")
            
            # Fallback to MediaPipe
            return self._detect_with_mediapipe(image_path, start_time)
            
        except Exception as e:
            logger.error(f"Landmark detection failed for {image_path}: {e}")
            return self._create_empty_result(start_time, str(e))
    
    def _detect_with_mediapipe(self, image_path: str, start_time: float) -> FaceAnalysisResult:
        """Detect landmarks using MediaPipe"""
        try:
            # Load image
            image = cv2.imread(image_path)
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Process with MediaPipe
            results = self.face_mesh.process(rgb_image)
            
            if not results.multi_face_landmarks:
                return self._create_empty_result(start_time, "No faces detected by MediaPipe")
            
            # Process detected faces
            all_faces = []
            for face_idx, face_landmarks in enumerate(results.multi_face_landmarks):
                face_data = self._process_mediapipe_landmarks(
                    face_landmarks, rgb_image, face_idx
                )
                all_faces.append(face_data)
            
            # Select primary face (largest or most centered)
            primary_face = self._select_primary_face(all_faces, rgb_image.shape)
            
            # Calculate image quality for faces
            image_quality = self._calculate_face_image_quality(rgb_image, all_faces)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(all_faces, image_quality)
            
            processing_time = time.time() - start_time
            
            return FaceAnalysisResult(
                faces_detected=len(all_faces),
                primary_face=primary_face,
                all_faces=all_faces,
                processing_time=processing_time,
                detection_method="mediapipe",
                image_quality_for_faces=image_quality,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"MediaPipe detection error: {e}")
            return self._create_empty_result(start_time, str(e))
    
    def _process_mediapipe_landmarks(self, face_landmarks, image: np.ndarray, face_id: int) -> FaceLandmarks:
        """Process MediaPipe landmarks into standardized format"""
        height, width = image.shape[:2]
        
        # Extract landmark coordinates
        landmarks = []
        for landmark in face_landmarks.landmark:
            x = int(landmark.x * width)
            y = int(landmark.y * height)
            landmarks.append((x, y))
        
        # Calculate bounding box
        bbox = self._calculate_bounding_box(landmarks)
        
        # Extract key landmarks
        key_landmarks = self._extract_key_landmarks(landmarks)
        
        # Calculate head pose
        head_pose = self._estimate_head_pose(key_landmarks, image.shape)
        
        # Analyze expression
        expression_scores, primary_expression = self._analyze_expression(landmarks)
        
        # Generate 3D mesh data
        face_mesh_3d = self._generate_3d_mesh(face_landmarks, (width, height))
        
        # Calculate quality metrics
        landmark_quality = self._calculate_landmark_quality(landmarks, bbox)
        symmetry_score = self._calculate_face_symmetry(landmarks)
        suitable_for_animation = self._assess_animation_suitability(
            landmark_quality, symmetry_score, bbox, head_pose
        )
        
        return FaceLandmarks(
            face_id=face_id,
            confidence=0.8,  # MediaPipe doesn't provide confidence
            bbox=bbox,
            left_eye_center=key_landmarks['left_eye_center'],
            right_eye_center=key_landmarks['right_eye_center'],
            nose_tip=key_landmarks['nose_tip'],
            mouth_center=key_landmarks['mouth_center'],
            mouth_left=key_landmarks['mouth_left'],
            mouth_right=key_landmarks['mouth_right'],
            all_landmarks=landmarks,
            head_pose=head_pose,
            expression_scores=expression_scores,
            primary_expression=primary_expression,
            face_mesh_3d=face_mesh_3d,
            landmark_quality=landmark_quality,
            suitable_for_animation=suitable_for_animation,
            symmetry_score=symmetry_score
        )
    
    def _process_nano_banana_result(self, nano_result, image_path: str, start_time: float) -> FaceAnalysisResult:
        """Process Nano Banana API result"""
        try:
            # Load image for additional processing
            image = cv2.imread(image_path)
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            all_faces = []
            for face_idx, (bbox, landmarks) in enumerate(zip(nano_result.bounding_boxes, nano_result.landmarks)):
                # Convert Nano Banana format to our format
                face_data = self._convert_nano_banana_landmarks(
                    bbox, landmarks, face_idx, nano_result.confidence
                )
                all_faces.append(face_data)
            
            # Select primary face
            primary_face = self._select_primary_face(all_faces, rgb_image.shape)
            
            # Calculate image quality
            image_quality = self._calculate_face_image_quality(rgb_image, all_faces)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(all_faces, image_quality)
            
            processing_time = time.time() - start_time
            
            return FaceAnalysisResult(
                faces_detected=nano_result.faces_detected,
                primary_face=primary_face,
                all_faces=all_faces,
                processing_time=processing_time,
                detection_method="nano_banana",
                image_quality_for_faces=image_quality,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"Nano Banana result processing error: {e}")
            return self._create_empty_result(start_time, str(e))
    
    def _convert_nano_banana_landmarks(self, bbox: Dict, landmarks: Dict, 
                                     face_id: int, confidence: float) -> FaceLandmarks:
        """Convert Nano Banana landmarks to our format"""
        # Extract key points from Nano Banana format
        left_eye = landmarks.get('left_eye', {})
        right_eye = landmarks.get('right_eye', {})
        nose = landmarks.get('nose', {})
        mouth = landmarks.get('mouth', {})
        
        # Convert to our key landmarks format
        key_landmarks = {
            'left_eye_center': (left_eye.get('center_x', 0), left_eye.get('center_y', 0)),
            'right_eye_center': (right_eye.get('center_x', 0), right_eye.get('center_y', 0)),
            'nose_tip': (nose.get('tip_x', 0), nose.get('tip_y', 0)),
            'mouth_center': (mouth.get('center_x', 0), mouth.get('center_y', 0)),
            'mouth_left': (mouth.get('left_x', 0), mouth.get('left_y', 0)),
            'mouth_right': (mouth.get('right_x', 0), mouth.get('right_y', 0)),
        }
        
        # Convert all landmarks (if available)
        all_landmarks = []
        if 'face_outline' in landmarks:
            for point in landmarks['face_outline']:
                all_landmarks.append((point.get('x', 0), point.get('y', 0)))
        
        # Extract head pose
        head_pose_data = landmarks.get('head_pose', {})
        head_pose = (
            head_pose_data.get('pitch', 0),
            head_pose_data.get('yaw', 0), 
            head_pose_data.get('roll', 0)
        )
        
        # Extract expression
        expression_data = landmarks.get('expression', {})
        primary_expression = expression_data.get('primary', 'neutral')
        expression_scores = expression_data.get('scores', {})
        
        # Calculate metrics
        bbox_tuple = (bbox['x'], bbox['y'], bbox['width'], bbox['height'])
        landmark_quality = confidence  # Use detection confidence as quality
        symmetry_score = 0.8  # Default value from Nano Banana
        
        return FaceLandmarks(
            face_id=face_id,
            confidence=confidence,
            bbox=bbox_tuple,
            left_eye_center=key_landmarks['left_eye_center'],
            right_eye_center=key_landmarks['right_eye_center'],
            nose_tip=key_landmarks['nose_tip'],
            mouth_center=key_landmarks['mouth_center'],
            mouth_left=key_landmarks['mouth_left'],
            mouth_right=key_landmarks['mouth_right'],
            all_landmarks=all_landmarks,
            head_pose=head_pose,
            expression_scores=expression_scores,
            primary_expression=primary_expression,
            landmark_quality=landmark_quality,
            suitable_for_animation=landmark_quality > 0.8 and abs(head_pose[1]) < 30,
            symmetry_score=symmetry_score
        )
    
    def _calculate_bounding_box(self, landmarks: List[Tuple[float, float]]) -> Tuple[float, float, float, float]:
        """Calculate bounding box from landmarks"""
        if not landmarks:
            return (0, 0, 0, 0)
        
        x_coords = [point[0] for point in landmarks]
        y_coords = [point[1] for point in landmarks]
        
        min_x, max_x = min(x_coords), max(x_coords)
        min_y, max_y = min(y_coords), max(y_coords)
        
        return (min_x, min_y, max_x - min_x, max_y - min_y)
    
    def _extract_key_landmarks(self, landmarks: List[Tuple[float, float]]) -> Dict[str, Tuple[float, float]]:
        """Extract key landmarks for lip-sync from MediaPipe 468-point model"""
        if len(landmarks) < 468:
            # Fallback for insufficient landmarks
            return {
                'left_eye_center': landmarks[0] if landmarks else (0, 0),
                'right_eye_center': landmarks[1] if len(landmarks) > 1 else (0, 0),
                'nose_tip': landmarks[2] if len(landmarks) > 2 else (0, 0),
                'mouth_center': landmarks[3] if len(landmarks) > 3 else (0, 0),
                'mouth_left': landmarks[4] if len(landmarks) > 4 else (0, 0),
                'mouth_right': landmarks[5] if len(landmarks) > 5 else (0, 0),
            }
        
        # Extract specific landmark points from MediaPipe 468-point model
        return {
            'left_eye_center': self._calculate_eye_center(landmarks, self.mp_landmark_indices['left_eye']),
            'right_eye_center': self._calculate_eye_center(landmarks, self.mp_landmark_indices['right_eye']),
            'nose_tip': landmarks[1],  # Nose tip
            'mouth_center': landmarks[13],  # Mouth center
            'mouth_left': landmarks[61],  # Left mouth corner
            'mouth_right': landmarks[291],  # Right mouth corner
        }
    
    def _calculate_eye_center(self, landmarks: List[Tuple[float, float]], eye_indices: List[int]) -> Tuple[float, float]:
        """Calculate center of eye from landmark points"""
        if not eye_indices:
            return (0, 0)
        
        valid_points = []
        for idx in eye_indices:
            if idx < len(landmarks):
                valid_points.append(landmarks[idx])
        
        if not valid_points:
            return (0, 0)
        
        avg_x = sum(point[0] for point in valid_points) / len(valid_points)
        avg_y = sum(point[1] for point in valid_points) / len(valid_points)
        
        return (avg_x, avg_y)
    
    def _estimate_head_pose(self, key_landmarks: Dict, image_shape: Tuple[int, int]) -> Tuple[float, float, float]:
        """Estimate head pose angles from key landmarks"""
        try:
            # Get key points
            left_eye = key_landmarks['left_eye_center']
            right_eye = key_landmarks['right_eye_center']
            nose_tip = key_landmarks['nose_tip']
            mouth_center = key_landmarks['mouth_center']
            
            # Calculate roll (head tilt)
            eye_vector = (right_eye[0] - left_eye[0], right_eye[1] - left_eye[1])
            roll = math.degrees(math.atan2(eye_vector[1], eye_vector[0]))
            
            # Calculate yaw (left/right turn) - simplified approximation
            face_center_x = (left_eye[0] + right_eye[0]) / 2
            image_center_x = image_shape[1] / 2
            yaw_factor = (face_center_x - image_center_x) / image_center_x
            yaw = yaw_factor * 30  # Scale to degrees
            
            # Calculate pitch (up/down) - simplified approximation
            eye_center_y = (left_eye[1] + right_eye[1]) / 2
            mouth_y = mouth_center[1]
            face_height = abs(mouth_y - eye_center_y)
            image_center_y = image_shape[0] / 2
            
            pitch_factor = (eye_center_y - image_center_y) / image_center_y
            pitch = pitch_factor * 20  # Scale to degrees
            
            return (pitch, yaw, roll)
        except Exception as e:
            logger.error(f"Head pose estimation error: {e}")
            return (0.0, 0.0, 0.0)
    
    def _analyze_expression(self, landmarks: List[Tuple[float, float]]) -> Tuple[Dict[str, float], str]:
        """Analyze facial expression from landmarks (simplified)"""
        # This is a simplified expression analysis
        # In production, you'd use a trained model or more sophisticated analysis
        
        expression_scores = {
            'neutral': 0.7,
            'happy': 0.1,
            'sad': 0.05,
            'angry': 0.05,
            'surprised': 0.05,
            'fearful': 0.025,
            'disgusted': 0.025,
            'contempt': 0.025
        }
        
        # Simple heuristic based on mouth landmarks (if available)
        if len(landmarks) >= 300:  # MediaPipe has mouth landmarks
            # Analyze mouth curvature for smile detection
            mouth_landmarks = landmarks[61:78]  # Approximate mouth region
            if mouth_landmarks:
                # Simple smile detection
                mouth_height = abs(max(p[1] for p in mouth_landmarks) - min(p[1] for p in mouth_landmarks))
                mouth_width = abs(max(p[0] for p in mouth_landmarks) - min(p[0] for p in mouth_landmarks))
                
                if mouth_width > mouth_height * 2.5:  # Wide mouth suggests smile
                    expression_scores['happy'] = 0.6
                    expression_scores['neutral'] = 0.3
        
        primary_expression = max(expression_scores, key=expression_scores.get)
        return expression_scores, primary_expression
    
    def _generate_3d_mesh(self, face_landmarks, image_size: Tuple[int, int]) -> np.ndarray:
        """Generate 3D face mesh coordinates"""
        try:
            # Extract z-coordinates (depth) from MediaPipe landmarks
            width, height = image_size
            mesh_points = []
            
            for landmark in face_landmarks.landmark:
                x = landmark.x * width
                y = landmark.y * height
                z = landmark.z * width  # Normalized depth
                mesh_points.append([x, y, z])
            
            return np.array(mesh_points)
        except Exception as e:
            logger.error(f"3D mesh generation error: {e}")
            return np.array([])
    
    def _calculate_landmark_quality(self, landmarks: List[Tuple[float, float]], 
                                  bbox: Tuple[float, float, float, float]) -> float:
        """Calculate quality score for detected landmarks"""
        try:
            if not landmarks:
                return 0.0
            
            # Check if landmarks are within bounding box
            x, y, w, h = bbox
            landmarks_in_bbox = 0
            
            for lx, ly in landmarks:
                if x <= lx <= x + w and y <= ly <= y + h:
                    landmarks_in_bbox += 1
            
            bbox_ratio = landmarks_in_bbox / len(landmarks) if landmarks else 0
            
            # Check landmark distribution (not clustered)
            if len(landmarks) >= 10:
                x_coords = [p[0] for p in landmarks[:10]]  # Sample points
                y_coords = [p[1] for p in landmarks[:10]]
                
                x_spread = (max(x_coords) - min(x_coords)) / w if w > 0 else 0
                y_spread = (max(y_coords) - min(y_coords)) / h if h > 0 else 0
                
                distribution_score = min(1.0, (x_spread + y_spread) / 2)
            else:
                distribution_score = 0.5
            
            # Face size quality (larger faces generally better for detection)
            face_area = w * h
            size_score = min(1.0, face_area / (50 * 50))  # Minimum 50x50 pixels
            
            overall_quality = (bbox_ratio * 0.4 + distribution_score * 0.3 + size_score * 0.3)
            return overall_quality
            
        except Exception as e:
            logger.error(f"Landmark quality calculation error: {e}")
            return 0.5
    
    def _calculate_face_symmetry(self, landmarks: List[Tuple[float, float]]) -> float:
        """Calculate facial symmetry score"""
        try:
            if len(landmarks) < 10:
                return 0.5
            
            # Find face center line (approximation)
            x_coords = [p[0] for p in landmarks]
            center_x = (max(x_coords) + min(x_coords)) / 2
            
            # Compare left and right sides
            left_points = [p for p in landmarks if p[0] < center_x]
            right_points = [p for p in landmarks if p[0] > center_x]
            
            if not left_points or not right_points:
                return 0.5
            
            # Mirror right side points to left side
            mirrored_right = [(2 * center_x - p[0], p[1]) for p in right_points]
            
            # Calculate distances between left points and mirrored right points
            if len(left_points) != len(mirrored_right):
                # Sample equal number of points
                min_points = min(len(left_points), len(mirrored_right))
                left_sample = left_points[:min_points]
                right_sample = mirrored_right[:min_points]
            else:
                left_sample = left_points
                right_sample = mirrored_right
            
            # Calculate average distance (lower is more symmetric)
            total_distance = 0
            for lp, rp in zip(left_sample, right_sample):
                total_distance += euclidean(lp, rp)
            
            avg_distance = total_distance / len(left_sample) if left_sample else float('inf')
            
            # Convert to symmetry score (higher is more symmetric)
            # Assume max reasonable distance is 50 pixels
            symmetry_score = max(0.0, 1.0 - (avg_distance / 50.0))
            
            return min(1.0, symmetry_score)
            
        except Exception as e:
            logger.error(f"Symmetry calculation error: {e}")
            return 0.5
    
    def _assess_animation_suitability(self, landmark_quality: float, symmetry_score: float,
                                    bbox: Tuple[float, float, float, float],
                                    head_pose: Tuple[float, float, float]) -> bool:
        """Assess if face is suitable for video animation"""
        try:
            # Quality thresholds
            min_quality = 0.7
            min_symmetry = 0.6
            max_head_turn = 45  # degrees
            min_face_size = 80 * 80  # pixels
            
            # Check quality
            if landmark_quality < min_quality:
                return False
            
            # Check symmetry
            if symmetry_score < min_symmetry:
                return False
            
            # Check head pose (not too extreme)
            pitch, yaw, roll = head_pose
            if abs(yaw) > max_head_turn or abs(pitch) > max_head_turn:
                return False
            
            # Check face size
            _, _, w, h = bbox
            if w * h < min_face_size:
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Animation suitability assessment error: {e}")
            return False
    
    def _select_primary_face(self, faces: List[FaceLandmarks], image_shape: Tuple[int, int]) -> Optional[FaceLandmarks]:
        """Select the best face for video generation"""
        if not faces:
            return None
        
        if len(faces) == 1:
            return faces[0]
        
        # Score each face based on multiple criteria
        best_face = None
        best_score = -1
        
        image_center_x = image_shape[1] / 2
        image_center_y = image_shape[0] / 2
        
        for face in faces:
            # Calculate composite score
            score = 0
            
            # Quality and suitability (40% weight)
            score += face.landmark_quality * 0.2
            score += face.symmetry_score * 0.1
            score += (1.0 if face.suitable_for_animation else 0.0) * 0.1
            
            # Size (20% weight) - larger faces preferred
            _, _, w, h = face.bbox
            face_area = w * h
            max_area = image_shape[0] * image_shape[1]
            size_score = min(1.0, face_area / (max_area * 0.1))  # 10% of image area = score 1.0
            score += size_score * 0.2
            
            # Central position (20% weight) - faces in center preferred
            face_center_x = face.bbox[0] + face.bbox[2] / 2
            face_center_y = face.bbox[1] + face.bbox[3] / 2
            
            distance_from_center = euclidean(
                (face_center_x, face_center_y),
                (image_center_x, image_center_y)
            )
            max_distance = euclidean((0, 0), (image_shape[1], image_shape[0]))
            center_score = 1.0 - (distance_from_center / max_distance)
            score += center_score * 0.2
            
            # Head pose (20% weight) - frontal faces preferred
            pitch, yaw, roll = face.head_pose
            pose_penalty = (abs(pitch) + abs(yaw) + abs(roll)) / 180.0  # Normalize to 0-1
            pose_score = 1.0 - pose_penalty
            score += pose_score * 0.2
            
            if score > best_score:
                best_score = score
                best_face = face
        
        return best_face
    
    def _calculate_face_image_quality(self, image: np.ndarray, faces: List[FaceLandmarks]) -> float:
        """Calculate overall image quality for face detection"""
        if not faces:
            return 0.0
        
        # Average landmark quality across all faces
        avg_landmark_quality = sum(face.landmark_quality for face in faces) / len(faces)
        
        # Image sharpness around faces
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        total_sharpness = 0
        
        for face in faces:
            x, y, w, h = face.bbox
            x, y, w, h = int(x), int(y), int(w), int(h)
            
            # Extract face region
            face_region = gray[y:y+h, x:x+w]
            if face_region.size > 0:
                # Calculate Laplacian variance (sharpness)
                sharpness = cv2.Laplacian(face_region, cv2.CV_64F).var()
                total_sharpness += sharpness
        
        avg_sharpness = total_sharpness / len(faces)
        normalized_sharpness = min(1.0, avg_sharpness / 1000.0)  # Normalize
        
        # Combine metrics
        overall_quality = (avg_landmark_quality * 0.6 + normalized_sharpness * 0.4)
        return overall_quality
    
    def _generate_recommendations(self, faces: List[FaceLandmarks], image_quality: float) -> List[str]:
        """Generate recommendations for improving face detection"""
        recommendations = []
        
        if not faces:
            recommendations.extend([
                "No faces detected. Ensure faces are clearly visible and well-lit.",
                "Try improving image brightness and contrast.",
                "Make sure faces are facing the camera."
            ])
            return recommendations
        
        primary_face = faces[0] if faces else None
        
        # Quality recommendations
        if image_quality < 0.5:
            recommendations.append("Image quality is low. Consider using a higher resolution image.")
        
        if primary_face:
            # Pose recommendations
            pitch, yaw, roll = primary_face.head_pose
            if abs(yaw) > 30:
                recommendations.append("Face is turned too much to the side. Face the camera more directly.")
            if abs(pitch) > 25:
                recommendations.append("Face angle is too extreme. Keep head level with camera.")
            
            # Size recommendations
            _, _, w, h = primary_face.bbox
            if w * h < 100 * 100:
                recommendations.append("Face is too small in the image. Move closer to the camera.")
            
            # Quality recommendations
            if primary_face.landmark_quality < 0.7:
                recommendations.append("Facial landmarks are not clearly detected. Improve lighting and image sharpness.")
            
            if primary_face.symmetry_score < 0.6:
                recommendations.append("Face symmetry could be improved. Ensure even lighting on both sides of face.")
            
            if not primary_face.suitable_for_animation:
                recommendations.append("Face may not be optimal for video generation. Follow the above suggestions to improve.")
        
        # Multiple faces
        if len(faces) > 1:
            recommendations.append(f"Multiple faces detected ({len(faces)}). Primary face selected automatically.")
        
        if not recommendations:
            recommendations.append("Face detection looks good! Ready for video generation.")
        
        return recommendations
    
    def _create_empty_result(self, start_time: float, error_message: str = "") -> FaceAnalysisResult:
        """Create empty result for failed detection"""
        return FaceAnalysisResult(
            faces_detected=0,
            primary_face=None,
            all_faces=[],
            processing_time=time.time() - start_time,
            detection_method="failed",
            image_quality_for_faces=0.0,
            recommendations=[f"Detection failed: {error_message}"]
        )


# Global detector instance
face_landmark_detector = FaceLandmarkDetector()