"""
Pytest Configuration and Shared Fixtures
Global test configuration for photo processing tests
"""

import pytest
import tempfile
import os
from PIL import Image, ImageDraw
import numpy as np
from unittest.mock import MagicMock, patch

# Test data directory
TEST_DATA_DIR = os.path.join(os.path.dirname(__file__), "test_data")


@pytest.fixture(scope="session")
def test_data_dir():
    """Create test data directory for the session"""
    os.makedirs(TEST_DATA_DIR, exist_ok=True)
    yield TEST_DATA_DIR
    # Cleanup is handled by individual test cleanup


@pytest.fixture
def mock_database_session():
    """Mock database session for testing"""
    session = MagicMock()
    session.query.return_value = session
    session.filter_by.return_value = session
    session.filter.return_value = session
    session.first.return_value = None
    session.all.return_value = []
    session.add.return_value = None
    session.commit.return_value = None
    session.rollback.return_value = None
    session.close.return_value = None
    return session


@pytest.fixture
def mock_settings():
    """Mock application settings"""
    settings = MagicMock()
    settings.nano_banana_api_key = "test_api_key"
    settings.nano_banana_base_url = "https://api.nanobanana.ai/v1"
    settings.photo_processing_timeout = 30
    settings.face_detection_confidence = 0.9
    settings.supported_photo_formats = ["JPEG", "PNG", "WEBP"]
    settings.max_photo_size_mb = 10
    settings.celery_broker_url = "redis://localhost:6379/0"
    settings.celery_result_backend = "redis://localhost:6379/1"
    return settings


@pytest.fixture
def sample_color_image():
    """Create a sample color image with various features"""
    img = Image.new('RGB', (800, 600), color=(128, 128, 128))
    draw = ImageDraw.Draw(img)
    
    # Add colorful content
    draw.rectangle([100, 100, 300, 250], fill=(255, 100, 100))  # Red rectangle
    draw.ellipse([400, 200, 600, 400], fill=(100, 255, 100))    # Green circle
    draw.polygon([(500, 50), (600, 150), (450, 150)], fill=(100, 100, 255))  # Blue triangle
    
    # Add some texture
    for i in range(0, 800, 20):
        draw.line([(i, 0), (i, 600)], fill=(200, 200, 200), width=1)
    
    return img


@pytest.fixture  
def sample_grayscale_image():
    """Create a sample grayscale image"""
    img = Image.new('L', (400, 300), color=128)
    draw = ImageDraw.Draw(img)
    
    # Add features
    draw.rectangle([50, 50, 150, 150], fill=200)
    draw.ellipse([200, 100, 350, 250], fill=80)
    
    return img


@pytest.fixture
def face_image():
    """Create an image with face-like features"""
    img = Image.new('RGB', (400, 400), color=(245, 220, 180))  # Skin tone background
    draw = ImageDraw.Draw(img)
    
    # Face outline
    draw.ellipse([80, 80, 320, 320], fill=(240, 210, 170))
    
    # Eyes
    draw.ellipse([120, 150, 160, 180], fill=(255, 255, 255))  # Left eye white
    draw.ellipse([130, 160, 150, 175], fill=(100, 50, 50))    # Left eye iris
    draw.ellipse([135, 162, 145, 172], fill=(0, 0, 0))       # Left eye pupil
    
    draw.ellipse([240, 150, 280, 180], fill=(255, 255, 255))  # Right eye white
    draw.ellipse([250, 160, 270, 175], fill=(100, 50, 50))    # Right eye iris
    draw.ellipse([255, 162, 265, 172], fill=(0, 0, 0))       # Right eye pupil
    
    # Nose
    draw.ellipse([190, 190, 210, 230], fill=(220, 190, 150))
    
    # Mouth
    draw.arc([160, 250, 240, 290], start=0, end=180, fill=(200, 100, 100), width=8)
    
    # Eyebrows
    draw.arc([115, 130, 165, 150], start=200, end=340, fill=(100, 80, 60), width=6)
    draw.arc([235, 130, 285, 150], start=200, end=340, fill=(100, 80, 60), width=6)
    
    return img


@pytest.fixture
def temp_image_file(sample_color_image):
    """Create a temporary image file"""
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
        sample_color_image.save(tmp.name, 'JPEG')
        yield tmp.name
    
    # Cleanup
    if os.path.exists(tmp.name):
        os.unlink(tmp.name)


@pytest.fixture
def temp_output_file():
    """Create a temporary output file path"""
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
        output_path = tmp.name
    
    yield output_path
    
    # Cleanup
    if os.path.exists(output_path):
        os.unlink(output_path)


@pytest.fixture(autouse=True)
def mock_external_dependencies():
    """Auto-mock external dependencies that might not be available"""
    with patch('cv2.imread') as mock_imread, \
         patch('cv2.cvtColor') as mock_cvtcolor, \
         patch('cv2.Canny') as mock_canny:
        
        # Mock OpenCV functions to return reasonable defaults
        mock_imread.return_value = np.ones((400, 600, 3), dtype=np.uint8) * 128
        mock_cvtcolor.return_value = np.ones((400, 600), dtype=np.uint8) * 128
        mock_canny.return_value = np.ones((400, 600), dtype=np.uint8) * 50
        
        yield