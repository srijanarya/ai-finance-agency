"""
Unit Tests for Face Landmark Detector
Tests for high-precision facial landmark detection and analysis
"""

import pytest
import numpy as np
from PIL import Image, ImageDraw
import tempfile
import os
from unittest.mock import patch, MagicMock, AsyncMock
import asyncio

from app.services.face_landmark_detector import (
    FaceLandmarkDetector, FaceLandmarks, FaceAnalysisResult
)


class TestFaceLandmarkDetector:
    """Test suite for FaceLandmarkDetector"""
    
    @pytest.fixture
    def detector(self):
        """Create FaceLandmarkDetector instance"""
        return FaceLandmarkDetector()
    
    @pytest.fixture
    def face_image_path(self):
        """Create a temporary image with face-like features"""
        # Create image with simple face-like pattern
        img = Image.new('RGB', (400, 400), color='white')
        draw = ImageDraw.Draw(img)
        
        # Face outline
        draw.ellipse([50, 50, 350, 350], fill='beige')
        
        # Eyes
        draw.ellipse([100, 150, 140, 180], fill='black')  # Left eye
        draw.ellipse([260, 150, 300, 180], fill='black')  # Right eye
        
        # Nose
        draw.line([200, 180, 200, 240], fill='brown', width=3)
        
        # Mouth
        draw.arc([150, 260, 250, 300], start=0, end=180, fill='red', width=5)
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            img.save(tmp.name, 'JPEG')
            yield tmp.name
        
        os.unlink(tmp.name)
    
    @pytest.fixture
    def no_face_image_path(self):
        """Create a temporary image without faces"""
        img = Image.new('RGB', (300, 300), color='blue')
        draw = ImageDraw.Draw(img)
        draw.rectangle([50, 50, 250, 250], fill='green')
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            img.save(tmp.name, 'JPEG')
            yield tmp.name
        
        os.unlink(tmp.name)
    
    @pytest.fixture
    def multi_face_image_path(self):
        """Create a temporary image with multiple face-like features"""
        img = Image.new('RGB', (600, 400), color='white')
        draw = ImageDraw.Draw(img)
        
        # First face
        draw.ellipse([50, 50, 250, 250], fill='beige')
        draw.ellipse([80, 120, 110, 140], fill='black')  # Left eye
        draw.ellipse([190, 120, 220, 140], fill='black')  # Right eye
        draw.arc([120, 180, 180, 220], start=0, end=180, fill='red', width=3)
        
        # Second face
        draw.ellipse([350, 100, 550, 300], fill='beige')
        draw.ellipse([380, 170, 410, 190], fill='black')  # Left eye
        draw.ellipse([490, 170, 520, 190], fill='black')  # Right eye
        draw.arc([420, 230, 480, 270], start=0, end=180, fill='red', width=3)
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            img.save(tmp.name, 'JPEG')
            yield tmp.name
        
        os.unlink(tmp.name)
    
    @pytest.fixture
    def sample_landmarks(self):
        """Create sample facial landmarks for testing"""
        return FaceLandmarks(
            face_id=0,
            confidence=0.95,
            bbox=(100, 100, 200, 200),
            left_eye_center=(130, 140),
            right_eye_center=(270, 140),
            nose_tip=(200, 180),
            mouth_center=(200, 220),
            mouth_left=(170, 220),
            mouth_right=(230, 220),
            all_landmarks=[(x, y) for x, y in zip(range(100, 300, 5), range(100, 300, 5))],
            head_pose=(5.0, -10.0, 2.0),
            expression_scores={'happy': 0.8, 'neutral': 0.2},
            primary_expression='happy',
            landmark_quality=0.9,
            suitable_for_animation=True,
            symmetry_score=0.85
        )
    
    @pytest.mark.asyncio
    async def test_detect_landmarks_with_mediapipe(self, detector, face_image_path):
        """Test landmark detection using MediaPipe"""
        with patch.object(detector, '_detect_with_mediapipe') as mock_mediapipe:
            # Mock successful detection
            mock_result = FaceAnalysisResult(
                faces_detected=1,
                primary_face=None,  # Will be set in actual implementation
                all_faces=[],
                processing_time=0.5,
                detection_method="mediapipe",
                image_quality_for_faces=0.8,
                recommendations=["Good quality for face detection"]
            )
            mock_mediapipe.return_value = mock_result
            
            # Test without Nano Banana
            result = await detector.detect_landmarks(face_image_path, use_nano_banana=False)
            
            assert isinstance(result, FaceAnalysisResult)
            assert result.detection_method == "mediapipe"
            mock_mediapipe.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_detect_landmarks_with_nano_banana(self, detector, face_image_path):
        """Test landmark detection using Nano Banana API"""
        with patch('app.services.face_landmark_detector.nano_banana_client') as mock_client:
            # Mock Nano Banana API availability and response
            mock_client.api_key = "test_key"
            mock_nano_result = MagicMock()
            mock_nano_result.faces_detected = 1
            mock_nano_result.bounding_boxes = [{'x': 100, 'y': 100, 'width': 200, 'height': 200}]
            mock_nano_result.landmarks = [{'left_eye': {'center_x': 130, 'center_y': 140}}]
            mock_nano_result.confidence = 0.95
            
            mock_client.detect_faces = AsyncMock(return_value=mock_nano_result)
            
            with patch.object(detector, '_process_nano_banana_result') as mock_process:
                mock_process.return_value = FaceAnalysisResult(
                    faces_detected=1,
                    primary_face=None,
                    all_faces=[],
                    processing_time=0.3,
                    detection_method="nano_banana",
                    image_quality_for_faces=0.9,
                    recommendations=["High quality detection"]
                )
                
                result = await detector.detect_landmarks(face_image_path, use_nano_banana=True)
                
                assert result.detection_method == "nano_banana"
                mock_client.detect_faces.assert_called_once_with(face_image_path)
    
    @pytest.mark.asyncio
    async def test_detect_landmarks_nano_banana_fallback(self, detector, face_image_path):
        """Test fallback to MediaPipe when Nano Banana fails"""
        with patch('app.services.face_landmark_detector.nano_banana_client') as mock_client:
            # Mock Nano Banana failure
            mock_client.api_key = "test_key"
            mock_client.detect_faces = AsyncMock(side_effect=Exception("API Error"))
            
            with patch.object(detector, '_detect_with_mediapipe') as mock_mediapipe:
                mock_mediapipe.return_value = FaceAnalysisResult(
                    faces_detected=1,
                    primary_face=None,
                    all_faces=[],
                    processing_time=0.8,
                    detection_method="mediapipe",
                    image_quality_for_faces=0.7,
                    recommendations=["Fallback detection"]
                )
                
                result = await detector.detect_landmarks(face_image_path, use_nano_banana=True)
                
                assert result.detection_method == "mediapipe"
                mock_mediapipe.assert_called_once()
    
    def test_detect_with_mediapipe_success(self, detector, face_image_path):
        """Test successful MediaPipe detection"""
        with patch.object(detector.face_mesh, 'process') as mock_process:
            # Mock MediaPipe results
            mock_landmark = MagicMock()
            mock_landmark.x = 0.5
            mock_landmark.y = 0.4
            mock_landmark.z = 0.01
            
            mock_face_landmarks = MagicMock()
            mock_face_landmarks.landmark = [mock_landmark] * 468  # MediaPipe has 468 landmarks
            
            mock_results = MagicMock()
            mock_results.multi_face_landmarks = [mock_face_landmarks]
            mock_process.return_value = mock_results
            
            result = detector._detect_with_mediapipe(face_image_path, 0.0)
            
            assert isinstance(result, FaceAnalysisResult)
            assert result.faces_detected == 1
            assert result.detection_method == "mediapipe"
            assert len(result.all_faces) == 1
    
    def test_detect_with_mediapipe_no_faces(self, detector, no_face_image_path):
        """Test MediaPipe detection with no faces"""
        with patch.object(detector.face_mesh, 'process') as mock_process:
            # Mock no faces detected
            mock_results = MagicMock()
            mock_results.multi_face_landmarks = None
            mock_process.return_value = mock_results
            
            result = detector._detect_with_mediapipe(no_face_image_path, 0.0)
            
            assert result.faces_detected == 0
            assert len(result.all_faces) == 0
            assert result.primary_face is None
    
    def test_process_mediapipe_landmarks(self, detector, sample_landmarks):
        """Test processing of MediaPipe landmarks"""
        # Create mock MediaPipe landmarks
        mock_landmark = MagicMock()
        mock_landmark.x = 0.5
        mock_landmark.y = 0.4
        mock_landmark.z = 0.01
        
        mock_face_landmarks = MagicMock()
        mock_face_landmarks.landmark = [mock_landmark] * 468
        
        # Create mock image
        test_image = np.ones((400, 600, 3), dtype=np.uint8) * 128
        
        result = detector._process_mediapipe_landmarks(mock_face_landmarks, test_image, 0)
        
        assert isinstance(result, FaceLandmarks)
        assert result.face_id == 0
        assert result.confidence == 0.8  # Default MediaPipe confidence
        assert len(result.all_landmarks) == 468
        assert isinstance(result.bbox, tuple)
        assert len(result.bbox) == 4
        assert isinstance(result.head_pose, tuple)
        assert len(result.head_pose) == 3
    
    def test_convert_nano_banana_landmarks(self, detector):
        """Test conversion of Nano Banana landmarks"""
        bbox = {'x': 100, 'y': 100, 'width': 200, 'height': 200}
        landmarks = {
            'left_eye': {'center_x': 130, 'center_y': 140},
            'right_eye': {'center_x': 270, 'center_y': 140},
            'nose': {'tip_x': 200, 'tip_y': 180},
            'mouth': {
                'center_x': 200, 'center_y': 220,
                'left_x': 170, 'left_y': 220,
                'right_x': 230, 'right_y': 220
            },
            'head_pose': {'pitch': 5.0, 'yaw': -10.0, 'roll': 2.0},
            'expression': {'primary': 'happy', 'scores': {'happy': 0.8, 'neutral': 0.2}}
        }
        
        result = detector._convert_nano_banana_landmarks(bbox, landmarks, 0, 0.95)
        
        assert isinstance(result, FaceLandmarks)
        assert result.face_id == 0
        assert result.confidence == 0.95
        assert result.bbox == (100, 100, 200, 200)
        assert result.left_eye_center == (130, 140)
        assert result.right_eye_center == (270, 140)
        assert result.nose_tip == (200, 180)
        assert result.mouth_center == (200, 220)
        assert result.head_pose == (5.0, -10.0, 2.0)
        assert result.primary_expression == 'happy'
    
    def test_calculate_bounding_box(self, detector):
        """Test bounding box calculation"""
        landmarks = [(100, 150), (200, 100), (300, 200), (150, 250)]
        
        bbox = detector._calculate_bounding_box(landmarks)
        
        assert bbox == (100, 100, 200, 150)  # x, y, width, height
        
        # Test with empty landmarks
        empty_bbox = detector._calculate_bounding_box([])
        assert empty_bbox == (0, 0, 0, 0)
    
    def test_extract_key_landmarks(self, detector):
        """Test extraction of key landmarks"""
        # Create landmarks list with enough points
        landmarks = [(i, i+10) for i in range(500)]  # 500 landmarks
        
        key_landmarks = detector._extract_key_landmarks(landmarks)
        
        assert isinstance(key_landmarks, dict)
        expected_keys = [
            'left_eye_center', 'right_eye_center', 'nose_tip',
            'mouth_center', 'mouth_left', 'mouth_right'
        ]
        
        for key in expected_keys:
            assert key in key_landmarks
            assert isinstance(key_landmarks[key], tuple)
            assert len(key_landmarks[key]) == 2
        
        # Test with insufficient landmarks
        few_landmarks = [(i, i+10) for i in range(10)]
        key_landmarks_few = detector._extract_key_landmarks(few_landmarks)
        
        for key in expected_keys:
            assert key in key_landmarks_few
    
    def test_calculate_eye_center(self, detector):
        """Test eye center calculation"""
        landmarks = [(i, i+10) for i in range(20)]
        eye_indices = [0, 1, 2, 3, 4]
        
        center = detector._calculate_eye_center(landmarks, eye_indices)
        
        assert isinstance(center, tuple)
        assert len(center) == 2
        
        # Test with empty indices
        empty_center = detector._calculate_eye_center(landmarks, [])
        assert empty_center == (0, 0)
    
    def test_estimate_head_pose(self, detector):
        """Test head pose estimation"""
        key_landmarks = {
            'left_eye_center': (120, 150),
            'right_eye_center': (280, 160),  # Slightly tilted
            'nose_tip': (200, 180),
            'mouth_center': (200, 220)
        }
        image_shape = (400, 600)
        
        pose = detector._estimate_head_pose(key_landmarks, image_shape)
        
        assert isinstance(pose, tuple)
        assert len(pose) == 3  # pitch, yaw, roll
        assert all(isinstance(angle, (int, float)) for angle in pose)
        
        # Roll should be non-zero due to eye height difference
        pitch, yaw, roll = pose
        assert abs(roll) > 0  # Should detect the tilt
    
    def test_analyze_expression(self, detector):
        """Test expression analysis"""
        landmarks = [(i, i+10) for i in range(400)]  # Enough landmarks for mouth analysis
        
        scores, primary = detector._analyze_expression(landmarks)
        
        assert isinstance(scores, dict)
        assert isinstance(primary, str)
        assert primary in scores
        assert all(0 <= score <= 1 for score in scores.values())
        assert abs(sum(scores.values()) - 1.0) < 0.01  # Should sum to ~1.0
    
    def test_generate_3d_mesh(self, detector):
        """Test 3D mesh generation"""
        # Mock MediaPipe landmarks with z-coordinates
        mock_landmark = MagicMock()
        mock_landmark.x = 0.5
        mock_landmark.y = 0.4
        mock_landmark.z = 0.01
        
        mock_face_landmarks = MagicMock()
        mock_face_landmarks.landmark = [mock_landmark] * 468
        
        mesh = detector._generate_3d_mesh(mock_face_landmarks, (600, 400))
        
        assert isinstance(mesh, np.ndarray)
        assert mesh.shape == (468, 3)  # 468 points with x, y, z coordinates
    
    def test_calculate_landmark_quality(self, detector):
        """Test landmark quality calculation"""
        landmarks = [(x, y) for x in range(100, 200, 10) for y in range(100, 200, 10)]
        bbox = (90, 90, 120, 120)  # Bounding box that contains most landmarks
        
        quality = detector._calculate_landmark_quality(landmarks, bbox)
        
        assert 0 <= quality <= 1
        assert isinstance(quality, float)
        
        # Test with empty landmarks
        empty_quality = detector._calculate_landmark_quality([], bbox)
        assert empty_quality == 0.0
    
    def test_calculate_face_symmetry(self, detector):
        """Test face symmetry calculation"""
        # Create symmetric landmarks
        center_x = 200
        left_points = [(center_x - 50, 100), (center_x - 30, 120), (center_x - 40, 150)]
        right_points = [(center_x + 50, 100), (center_x + 30, 120), (center_x + 40, 150)]
        symmetric_landmarks = left_points + right_points
        
        symmetry = detector._calculate_face_symmetry(symmetric_landmarks)
        
        assert 0 <= symmetry <= 1
        assert isinstance(symmetry, float)
        
        # Symmetric face should have higher score
        assert symmetry > 0.3  # Should detect some symmetry
        
        # Test with few landmarks
        few_landmarks = [(100, 100), (200, 100)]
        few_symmetry = detector._calculate_face_symmetry(few_landmarks)
        assert few_symmetry == 0.5  # Default value
    
    def test_assess_animation_suitability(self, detector):
        """Test animation suitability assessment"""
        # Test suitable face
        suitable = detector._assess_animation_suitability(
            landmark_quality=0.8,
            symmetry_score=0.7,
            bbox=(100, 100, 150, 150),  # Large enough face
            head_pose=(5.0, 10.0, 3.0)  # Reasonable pose
        )
        assert suitable
        
        # Test unsuitable face (low quality)
        unsuitable_quality = detector._assess_animation_suitability(
            landmark_quality=0.5,  # Too low
            symmetry_score=0.7,
            bbox=(100, 100, 150, 150),
            head_pose=(5.0, 10.0, 3.0)
        )
        assert not unsuitable_quality
        
        # Test unsuitable face (extreme pose)
        unsuitable_pose = detector._assess_animation_suitability(
            landmark_quality=0.8,
            symmetry_score=0.7,
            bbox=(100, 100, 150, 150),
            head_pose=(60.0, 10.0, 3.0)  # Extreme pitch
        )
        assert not unsuitable_pose
        
        # Test unsuitable face (too small)
        unsuitable_size = detector._assess_animation_suitability(
            landmark_quality=0.8,
            symmetry_score=0.7,
            bbox=(100, 100, 50, 50),  # Too small
            head_pose=(5.0, 10.0, 3.0)
        )
        assert not unsuitable_size
    
    def test_select_primary_face_single(self, detector, sample_landmarks):
        """Test primary face selection with single face"""
        faces = [sample_landmarks]
        image_shape = (400, 600)
        
        primary = detector._select_primary_face(faces, image_shape)
        
        assert primary == sample_landmarks
    
    def test_select_primary_face_multiple(self, detector):
        """Test primary face selection with multiple faces"""
        # Create two faces with different qualities
        face1 = FaceLandmarks(
            face_id=0, confidence=0.8, bbox=(50, 50, 100, 100),
            left_eye_center=(70, 70), right_eye_center=(130, 70),
            nose_tip=(100, 90), mouth_center=(100, 110),
            mouth_left=(85, 110), mouth_right=(115, 110),
            all_landmarks=[], head_pose=(0, 0, 0),
            expression_scores={'neutral': 1.0}, primary_expression='neutral',
            landmark_quality=0.6, suitable_for_animation=False, symmetry_score=0.5
        )
        
        face2 = FaceLandmarks(
            face_id=1, confidence=0.95, bbox=(200, 100, 150, 150),
            left_eye_center=(250, 150), right_eye_center=(325, 150),
            nose_tip=(287, 180), mouth_center=(287, 210),
            mouth_left=(270, 210), mouth_right=(305, 210),
            all_landmarks=[], head_pose=(0, 0, 0),
            expression_scores={'happy': 1.0}, primary_expression='happy',
            landmark_quality=0.9, suitable_for_animation=True, symmetry_score=0.8
        )
        
        faces = [face1, face2]
        image_shape = (400, 600)
        
        primary = detector._select_primary_face(faces, image_shape)
        
        # Should select face2 (higher quality)
        assert primary == face2
    
    def test_select_primary_face_empty(self, detector):
        """Test primary face selection with no faces"""
        primary = detector._select_primary_face([], (400, 600))
        assert primary is None
    
    def test_calculate_face_image_quality(self, detector):
        """Test face image quality calculation"""
        # Create test image
        test_image = np.random.randint(0, 256, (400, 600, 3), dtype=np.uint8)
        
        # Create test faces
        face1 = FaceLandmarks(
            face_id=0, confidence=0.8, bbox=(50, 50, 100, 100),
            left_eye_center=(70, 70), right_eye_center=(130, 70),
            nose_tip=(100, 90), mouth_center=(100, 110),
            mouth_left=(85, 110), mouth_right=(115, 110),
            all_landmarks=[], head_pose=(0, 0, 0),
            expression_scores={'neutral': 1.0}, primary_expression='neutral',
            landmark_quality=0.8, suitable_for_animation=True, symmetry_score=0.7
        )
        
        faces = [face1]
        quality = detector._calculate_face_image_quality(test_image, faces)
        
        assert 0 <= quality <= 1
        assert isinstance(quality, float)
        
        # Test with no faces
        no_face_quality = detector._calculate_face_image_quality(test_image, [])
        assert no_face_quality == 0.0
    
    def test_generate_recommendations(self, detector):
        """Test recommendation generation"""
        # Test with no faces
        no_face_recs = detector._generate_recommendations([], 0.5)
        assert isinstance(no_face_recs, list)
        assert len(no_face_recs) > 0
        assert any("no faces detected" in rec.lower() for rec in no_face_recs)
        
        # Test with good quality face
        good_face = FaceLandmarks(
            face_id=0, confidence=0.95, bbox=(100, 100, 200, 200),
            left_eye_center=(150, 150), right_eye_center=(250, 150),
            nose_tip=(200, 180), mouth_center=(200, 220),
            mouth_left=(170, 220), mouth_right=(230, 220),
            all_landmarks=[], head_pose=(2, 5, 1),  # Good pose
            expression_scores={'happy': 1.0}, primary_expression='happy',
            landmark_quality=0.9, suitable_for_animation=True, symmetry_score=0.8
        )
        
        good_recs = detector._generate_recommendations([good_face], 0.8)
        assert any("ready for video generation" in rec.lower() or "looks good" in rec.lower() 
                  for rec in good_recs)
        
        # Test with poor quality face
        poor_face = FaceLandmarks(
            face_id=0, confidence=0.6, bbox=(50, 50, 80, 80),  # Small face
            left_eye_center=(70, 70), right_eye_center=(110, 70),
            nose_tip=(90, 85), mouth_center=(90, 100),
            mouth_left=(80, 100), mouth_right=(100, 100),
            all_landmarks=[], head_pose=(40, 50, 20),  # Extreme pose
            expression_scores={'neutral': 1.0}, primary_expression='neutral',
            landmark_quality=0.5, suitable_for_animation=False, symmetry_score=0.4
        )
        
        poor_recs = detector._generate_recommendations([poor_face], 0.3)
        assert len(poor_recs) > 1  # Should have multiple recommendations
        assert any("too small" in rec.lower() or "too extreme" in rec.lower() or 
                  "improve" in rec.lower() for rec in poor_recs)
    
    def test_create_empty_result(self, detector):
        """Test empty result creation"""
        result = detector._create_empty_result(0.0, "Test error")
        
        assert isinstance(result, FaceAnalysisResult)
        assert result.faces_detected == 0
        assert result.primary_face is None
        assert result.all_faces == []
        assert result.detection_method == "failed"
        assert result.image_quality_for_faces == 0.0
        assert "Test error" in result.recommendations[0]
    
    def test_error_handling(self, detector):
        """Test error handling in various scenarios"""
        # Test with invalid image path
        import asyncio
        
        async def test_invalid_path():
            result = await detector.detect_landmarks("/nonexistent/path.jpg", use_nano_banana=False)
            assert isinstance(result, FaceAnalysisResult)
            assert result.faces_detected == 0
            assert result.detection_method == "failed"
        
        asyncio.run(test_invalid_path())
    
    def test_edge_cases(self, detector):
        """Test edge cases and boundary conditions"""
        # Test with very small landmarks list
        small_landmarks = [(100, 100), (200, 200)]
        key_landmarks = detector._extract_key_landmarks(small_landmarks)
        
        # Should handle gracefully
        assert isinstance(key_landmarks, dict)
        assert len(key_landmarks) == 6  # All required keys
        
        # Test symmetry with insufficient points
        symmetry = detector._calculate_face_symmetry(small_landmarks)
        assert symmetry == 0.5  # Default value
    
    @pytest.mark.asyncio
    async def test_performance(self, detector, face_image_path):
        """Test performance of detection operations"""
        import time
        
        start_time = time.time()
        result = await detector.detect_landmarks(face_image_path, use_nano_banana=False)
        detection_time = time.time() - start_time
        
        # Should complete within reasonable time
        assert detection_time < 15.0  # 15 seconds max
        assert result.processing_time > 0
        assert result.processing_time <= detection_time + 1
    
    def test_thread_safety(self, detector, face_image_path):
        """Test thread safety of detector methods"""
        import concurrent.futures
        import asyncio
        
        async def detect_worker():
            return await detector.detect_landmarks(face_image_path, use_nano_banana=False)
        
        def run_detection():
            return asyncio.run(detect_worker())
        
        # Run multiple detections concurrently
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            futures = [executor.submit(run_detection) for _ in range(5)]
            results = [future.result() for future in futures]
        
        # All results should be valid
        assert len(results) == 5
        for result in results:
            assert isinstance(result, FaceAnalysisResult)


class TestFaceLandmarks:
    """Test FaceLandmarks data class"""
    
    def test_face_landmarks_creation(self):
        """Test FaceLandmarks creation"""
        landmarks = FaceLandmarks(
            face_id=1,
            confidence=0.95,
            bbox=(100, 100, 200, 200),
            left_eye_center=(130, 140),
            right_eye_center=(270, 140),
            nose_tip=(200, 180),
            mouth_center=(200, 220),
            mouth_left=(170, 220),
            mouth_right=(230, 220),
            all_landmarks=[(i, i+10) for i in range(50)],
            head_pose=(5.0, -10.0, 2.0),
            expression_scores={'happy': 0.8, 'neutral': 0.2},
            primary_expression='happy',
            landmark_quality=0.9,
            suitable_for_animation=True,
            symmetry_score=0.85
        )
        
        assert landmarks.face_id == 1
        assert landmarks.confidence == 0.95
        assert landmarks.bbox == (100, 100, 200, 200)
        assert landmarks.left_eye_center == (130, 140)
        assert landmarks.right_eye_center == (270, 140)
        assert landmarks.nose_tip == (200, 180)
        assert landmarks.mouth_center == (200, 220)
        assert landmarks.mouth_left == (170, 220)
        assert landmarks.mouth_right == (230, 220)
        assert len(landmarks.all_landmarks) == 50
        assert landmarks.head_pose == (5.0, -10.0, 2.0)
        assert landmarks.expression_scores == {'happy': 0.8, 'neutral': 0.2}
        assert landmarks.primary_expression == 'happy'
        assert landmarks.landmark_quality == 0.9
        assert landmarks.suitable_for_animation
        assert landmarks.symmetry_score == 0.85


class TestFaceAnalysisResult:
    """Test FaceAnalysisResult data class"""
    
    def test_face_analysis_result_creation(self, sample_landmarks):
        """Test FaceAnalysisResult creation"""
        result = FaceAnalysisResult(
            faces_detected=2,
            primary_face=sample_landmarks,
            all_faces=[sample_landmarks],
            processing_time=1.5,
            detection_method="mediapipe",
            image_quality_for_faces=0.8,
            recommendations=["Good quality", "Ready for processing"]
        )
        
        assert result.faces_detected == 2
        assert result.primary_face == sample_landmarks
        assert len(result.all_faces) == 1
        assert result.processing_time == 1.5
        assert result.detection_method == "mediapipe"
        assert result.image_quality_for_faces == 0.8
        assert "Good quality" in result.recommendations


if __name__ == "__main__":
    pytest.main([__file__])