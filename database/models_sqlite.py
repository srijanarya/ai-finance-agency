"""
SQLite Database Models for Local Development
"""

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, JSON, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import os
import json

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
    meta_data = Column(Text)  # SQLite doesn't have native JSON

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
    preferences = Column(Text)  # SQLite doesn't have native JSON

class GrowthMetric(Base):
    __tablename__ = 'growth_metrics'
    
    id = Column(Integer, primary_key=True)
    platform = Column(String(50))
    metric_name = Column(String(100))
    metric_value = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)
    meta_data = Column(Text)  # SQLite doesn't have native JSON

class Campaign(Base):
    __tablename__ = 'campaigns'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200))
    campaign_type = Column(String(50))
    status = Column(String(20), default='active')
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    target_subscribers = Column(Integer)
    current_subscribers = Column(Integer, default=0)
    rewards = Column(Text)  # SQLite doesn't have native JSON
    rules = Column(Text)  # SQLite doesn't have native JSON
    performance = Column(Text)  # SQLite doesn't have native JSON
    created_at = Column(DateTime, default=datetime.utcnow)

class DatabaseManager:
    def __init__(self):
        # Use SQLite for local development
        self.database_path = 'data/telegram_growth.db'
        self.database_url = f'sqlite:///{self.database_path}'
        self.engine = create_engine(self.database_url)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
    
    def create_tables(self):
        """Create all tables in the database"""
        Base.metadata.create_all(bind=self.engine)
        print(f"✅ Database tables created at {self.database_path}")
    
    def get_session(self):
        """Get a new database session"""
        return self.SessionLocal()

# Initialize database manager
db_manager = DatabaseManager()
db_manager.create_tables()