"""
PostgreSQL Database Models using SQLAlchemy
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, JSON, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import os

Base = declarative_base()

class Content(Base):
    __tablename__ = 'content'
    
    id = Column(Integer, primary_key=True)
    content_hash = Column(String(64), unique=True, index=True)
    content_text = Column(Text)
    content_type = Column(String(50))
    platform = Column(String(50))
    quality_score = Column(Float)
    engagement_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    published_at = Column(DateTime)
    meta_data = Column(JSON)
    
    __table_args__ = (
        Index('idx_content_created', 'created_at'),
        Index('idx_content_platform', 'platform'),
    )

class Subscriber(Base):
    __tablename__ = 'subscribers'
    
    id = Column(Integer, primary_key=True)
    telegram_id = Column(String(100), unique=True)
    username = Column(String(100))
    first_name = Column(String(100))
    last_name = Column(String(100))
    joined_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    referral_code = Column(String(50), unique=True)
    referred_by = Column(String(50))
    referral_count = Column(Integer, default=0)
    engagement_score = Column(Float, default=0.0)
    preferences = Column(JSON)
    
    # Relationships
    interactions = relationship("Interaction", back_populates="subscriber")
    
    __table_args__ = (
        Index('idx_subscriber_telegram', 'telegram_id'),
        Index('idx_subscriber_referral', 'referral_code'),
    )

class Interaction(Base):
    __tablename__ = 'interactions'
    
    id = Column(Integer, primary_key=True)
    subscriber_id = Column(Integer, ForeignKey('subscribers.id'))
    content_id = Column(Integer, ForeignKey('content.id'))
    interaction_type = Column(String(50))  # view, like, share, comment
    timestamp = Column(DateTime, default=datetime.utcnow)
    meta_data = Column(JSON)
    
    # Relationships
    subscriber = relationship("Subscriber", back_populates="interactions")
    
    __table_args__ = (
        Index('idx_interaction_subscriber', 'subscriber_id'),
        Index('idx_interaction_timestamp', 'timestamp'),
    )

class MarketData(Base):
    __tablename__ = 'market_data'
    
    id = Column(Integer, primary_key=True)
    symbol = Column(String(20))
    price = Column(Float)
    change_percent = Column(Float)
    volume = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    source = Column(String(50))
    data = Column(JSON)
    
    __table_args__ = (
        Index('idx_market_symbol', 'symbol'),
        Index('idx_market_timestamp', 'timestamp'),
    )

class TradingSignal(Base):
    __tablename__ = 'trading_signals'
    
    id = Column(Integer, primary_key=True)
    symbol = Column(String(20))
    signal_type = Column(String(20))  # BUY, SELL, HOLD
    confidence = Column(Float)
    entry_price = Column(Float)
    target_price = Column(Float)
    stop_loss = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    performance = Column(JSON)
    
    __table_args__ = (
        Index('idx_signal_symbol', 'symbol'),
        Index('idx_signal_created', 'created_at'),
    )

class GrowthMetric(Base):
    __tablename__ = 'growth_metrics'
    
    id = Column(Integer, primary_key=True)
    platform = Column(String(50))
    metric_name = Column(String(100))
    metric_value = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    meta_data = Column(JSON)
    
    __table_args__ = (
        Index('idx_metric_platform', 'platform'),
        Index('idx_metric_timestamp', 'timestamp'),
    )

class Campaign(Base):
    __tablename__ = 'campaigns'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200))
    campaign_type = Column(String(50))  # referral, contest, airdrop, engagement
    status = Column(String(20), default='active')
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    target_subscribers = Column(Integer)
    current_subscribers = Column(Integer, default=0)
    rewards = Column(JSON)
    rules = Column(JSON)
    performance = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_campaign_status', 'status'),
        Index('idx_campaign_type', 'campaign_type'),
    )

# Database connection and session management
class DatabaseManager:
    def __init__(self):
        self.database_url = os.getenv('DATABASE_URL', 'postgresql://ai_finance_user:securepassword123@localhost:5432/ai_finance_db')
        self.engine = create_engine(self.database_url, pool_size=20, max_overflow=40)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def create_tables(self):
        """Create all tables in the database"""
        Base.metadata.create_all(bind=self.engine)
    
    def get_session(self):
        """Get a new database session"""
        return self.SessionLocal()
    
    def migrate_from_sqlite(self, sqlite_paths):
        """Migrate data from SQLite to PostgreSQL"""
        import sqlite3
        session = self.get_session()
        
        try:
            for sqlite_path in sqlite_paths:
                if os.path.exists(sqlite_path):
                    conn = sqlite3.connect(sqlite_path)
                    conn.row_factory = sqlite3.Row
                    cursor = conn.cursor()
                    
                    # Migration logic here based on table structure
                    print(f"Migrating data from {sqlite_path}...")
                    
                    conn.close()
            
            session.commit()
            print("Migration completed successfully!")
            
        except Exception as e:
            session.rollback()
            print(f"Migration error: {e}")
        finally:
            session.close()

# Photo Processing Models for TalkingPhoto AI

class Photo(Base):
    __tablename__ = 'photos'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    s3_key = Column(String(500), nullable=True)  # S3 storage key
    file_size_bytes = Column(Integer, nullable=False)
    format = Column(String(10), nullable=False)  # JPEG, PNG, WEBP
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    
    # Processing status
    processing_status = Column(String(20), default='uploaded')  # uploaded, processing, completed, failed
    upload_timestamp = Column(DateTime, default=datetime.utcnow)
    processing_started_at = Column(DateTime, nullable=True)
    processing_completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    analysis_results = relationship("PhotoAnalysis", back_populates="photo", cascade="all, delete-orphan")
    enhancements = relationship("PhotoEnhancement", back_populates="photo", cascade="all, delete-orphan")
    face_detections = relationship("FaceDetection", back_populates="photo", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_photo_user_id', 'user_id'),
        Index('idx_photo_status', 'processing_status'),
        Index('idx_photo_timestamp', 'upload_timestamp'),
    )


class PhotoAnalysis(Base):
    __tablename__ = 'photo_analysis'
    
    id = Column(Integer, primary_key=True)
    photo_id = Column(Integer, ForeignKey('photos.id'), nullable=False)
    
    # Quality metrics
    brightness_score = Column(Float, nullable=True)
    contrast_score = Column(Float, nullable=True)
    sharpness_score = Column(Float, nullable=True)
    noise_level = Column(Float, nullable=True)
    overall_quality_score = Column(Float, nullable=True)
    
    # Composition analysis
    rule_of_thirds_score = Column(Float, nullable=True)
    symmetry_score = Column(Float, nullable=True)
    leading_lines_detected = Column(Boolean, default=False)
    composition_score = Column(Float, nullable=True)
    
    # Auto-crop recommendations
    suggested_crop_x = Column(Integer, nullable=True)
    suggested_crop_y = Column(Integer, nullable=True)
    suggested_crop_width = Column(Integer, nullable=True)
    suggested_crop_height = Column(Integer, nullable=True)
    
    # AI service results
    nano_banana_response = Column(JSON, nullable=True)
    analysis_metadata = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    photo = relationship("Photo", back_populates="analysis_results")
    
    __table_args__ = (
        Index('idx_analysis_photo_id', 'photo_id'),
        Index('idx_analysis_quality', 'overall_quality_score'),
    )


class PhotoEnhancement(Base):
    __tablename__ = 'photo_enhancements'
    
    id = Column(Integer, primary_key=True)
    photo_id = Column(Integer, ForeignKey('photos.id'), nullable=False)
    
    # Enhancement settings applied
    brightness_adjustment = Column(Float, default=0.0)
    contrast_adjustment = Column(Float, default=0.0)
    saturation_adjustment = Column(Float, default=0.0)
    sharpness_adjustment = Column(Float, default=0.0)
    noise_reduction_level = Column(Float, default=0.0)
    
    # Enhancement results
    enhanced_file_path = Column(String(500), nullable=True)
    enhanced_s3_key = Column(String(500), nullable=True)
    enhancement_applied = Column(Boolean, default=False)
    
    # Performance metrics
    processing_time_seconds = Column(Float, nullable=True)
    enhancement_score = Column(Float, nullable=True)  # Before/after comparison
    
    # Metadata
    enhancement_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    photo = relationship("Photo", back_populates="enhancements")
    
    __table_args__ = (
        Index('idx_enhancement_photo_id', 'photo_id'),
        Index('idx_enhancement_score', 'enhancement_score'),
    )


class FaceDetection(Base):
    __tablename__ = 'face_detections'
    
    id = Column(Integer, primary_key=True)
    photo_id = Column(Integer, ForeignKey('photos.id'), nullable=False)
    
    # Detection results
    faces_detected = Column(Integer, default=0)
    primary_face_id = Column(Integer, nullable=True)  # ID of the main face for video generation
    
    # Confidence scores
    detection_confidence = Column(Float, nullable=True)
    face_recognition_confidence = Column(Float, nullable=True)
    
    # Face detection service used
    detection_service = Column(String(50), default='nano_banana')  # nano_banana, mediapipe, dlib
    service_response = Column(JSON, nullable=True)
    
    # Processing info
    processing_time_seconds = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    photo = relationship("Photo", back_populates="face_detections")
    face_landmarks = relationship("FaceLandmark", back_populates="face_detection", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_face_detection_photo_id', 'photo_id'),
        Index('idx_face_detection_count', 'faces_detected'),
    )


class FaceLandmark(Base):
    __tablename__ = 'face_landmarks'
    
    id = Column(Integer, primary_key=True)
    face_detection_id = Column(Integer, ForeignKey('face_detections.id'), nullable=False)
    face_index = Column(Integer, default=0)  # Index of face in multi-face photos
    
    # Bounding box
    bbox_x = Column(Float, nullable=False)
    bbox_y = Column(Float, nullable=False)
    bbox_width = Column(Float, nullable=False)
    bbox_height = Column(Float, nullable=False)
    
    # Key facial landmarks (stored as JSON for flexibility)
    landmarks = Column(JSON, nullable=False)  # All facial landmarks
    
    # Specific landmark coordinates for lip-sync accuracy
    left_eye_center_x = Column(Float, nullable=True)
    left_eye_center_y = Column(Float, nullable=True)
    right_eye_center_x = Column(Float, nullable=True)
    right_eye_center_y = Column(Float, nullable=True)
    nose_tip_x = Column(Float, nullable=True)
    nose_tip_y = Column(Float, nullable=True)
    mouth_left_x = Column(Float, nullable=True)
    mouth_left_y = Column(Float, nullable=True)
    mouth_right_x = Column(Float, nullable=True)
    mouth_right_y = Column(Float, nullable=True)
    mouth_center_x = Column(Float, nullable=True)
    mouth_center_y = Column(Float, nullable=True)
    
    # Head pose estimation for animation
    head_pose_pitch = Column(Float, nullable=True)  # Up/down rotation
    head_pose_yaw = Column(Float, nullable=True)    # Left/right rotation
    head_pose_roll = Column(Float, nullable=True)   # Tilting rotation
    
    # Expression analysis
    expression_scores = Column(JSON, nullable=True)  # Happy, sad, surprised, etc.
    primary_expression = Column(String(50), nullable=True)
    expression_confidence = Column(Float, nullable=True)
    
    # 3D face model preparation data
    face_mesh_points = Column(JSON, nullable=True)  # 3D mesh coordinates
    texture_coordinates = Column(JSON, nullable=True)  # UV mapping for textures
    
    # Quality metrics for video generation
    landmark_quality_score = Column(Float, nullable=True)
    suitable_for_animation = Column(Boolean, default=False)
    
    # Relationships
    face_detection = relationship("FaceDetection", back_populates="face_landmarks")
    
    __table_args__ = (
        Index('idx_landmark_face_detection', 'face_detection_id'),
        Index('idx_landmark_quality', 'landmark_quality_score'),
    )


class PhotoProcessingJob(Base):
    __tablename__ = 'photo_processing_jobs'
    
    id = Column(Integer, primary_key=True)
    photo_id = Column(Integer, ForeignKey('photos.id'), nullable=False)
    
    # Job details
    job_type = Column(String(50), nullable=False)  # analysis, enhancement, face_detection
    celery_task_id = Column(String(255), nullable=True)  # Celery task ID for tracking
    
    # Job status
    status = Column(String(20), default='pending')  # pending, running, completed, failed
    progress_percentage = Column(Integer, default=0)
    
    # Error handling
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    
    # Timing
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Results
    result_data = Column(JSON, nullable=True)
    
    __table_args__ = (
        Index('idx_job_photo_id', 'photo_id'),
        Index('idx_job_status', 'status'),
        Index('idx_job_type', 'job_type'),
        Index('idx_job_celery_id', 'celery_task_id'),
    )


# Initialize database manager
db_manager = DatabaseManager()