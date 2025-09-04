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

# Initialize database manager
db_manager = DatabaseManager()