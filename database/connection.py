"""
Database connection management for AI Finance Agency
Handles PostgreSQL connections with connection pooling and multi-tenant support
"""

import logging
from contextlib import asynccontextmanager, contextmanager
from typing import AsyncGenerator, Generator, Optional
from urllib.parse import urlparse

import asyncpg
from sqlalchemy import create_engine, event, pool
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool, QueuePool

from config.enhanced_config import enhanced_config

# Configure logging
logger = logging.getLogger(__name__)

# SQLAlchemy Base Model
Base = declarative_base()

# Database engines (sync and async)
engine = None
async_engine = None
SessionLocal = None
AsyncSessionLocal = None


def get_database_url(async_mode: bool = False) -> str:
    """
    Get database URL with proper driver for sync/async operations
    
    Args:
        async_mode: Whether to use async driver
        
    Returns:
        Properly formatted database URL
    """
    config = enhanced_config.database
    
    if config.supabase_enabled and config.supabase_url:
        # Use Supabase connection
        parsed = urlparse(config.supabase_url)
        
        if async_mode:
            return f"postgresql+asyncpg://{parsed.username}:{parsed.password}@{parsed.hostname}:{parsed.port or 5432}{parsed.path}"
        else:
            return f"postgresql+psycopg2://{parsed.username}:{parsed.password}@{parsed.hostname}:{parsed.port or 5432}{parsed.path}"
    
    elif config.database_url:
        # Use provided database URL
        if async_mode:
            return config.database_url.replace('postgresql://', 'postgresql+asyncpg://')
        else:
            return config.database_url.replace('postgresql://', 'postgresql+psycopg2://')
    
    else:
        # Construct from individual components
        user = config.database_user or 'ai_finance_user'
        password = config.database_password or 'change_me_in_prod'
        host = config.database_host or 'localhost'
        port = config.database_port or 5432
        name = config.database_name or 'ai_finance_prod'
        
        if async_mode:
            return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{name}"
        else:
            return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{name}"


def create_database_engine(async_mode: bool = False):
    """
    Create database engine with proper configuration
    
    Args:
        async_mode: Whether to create async engine
        
    Returns:
        SQLAlchemy engine instance
    """
    database_url = get_database_url(async_mode)
    
    # Common engine arguments
    engine_args = {
        'echo': enhanced_config.app.debug,
        'pool_size': 10,
        'max_overflow': 20,
        'pool_timeout': 30,
        'pool_recycle': 3600,  # Recycle connections every hour
        'pool_pre_ping': True,  # Validate connections before use
    }
    
    if async_mode:
        engine_args['poolclass'] = pool.NullPool  # Use default async pool
        return create_async_engine(database_url, **engine_args)
    else:
        engine_args['poolclass'] = QueuePool
        return create_engine(database_url, **engine_args)


def init_database():
    """Initialize database connections and session makers"""
    global engine, async_engine, SessionLocal, AsyncSessionLocal
    
    try:
        # Create engines
        engine = create_database_engine(async_mode=False)
        async_engine = create_database_engine(async_mode=True)
        
        # Create session makers
        SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=engine,
            expire_on_commit=False
        )
        
        AsyncSessionLocal = async_sessionmaker(
            async_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False
        )
        
        logger.info("Database connections initialized successfully")
        
        # Add connection event listeners
        @event.listens_for(engine, "connect")
        def set_sqlite_pragma(dbapi_connection, connection_record):
            """Set PostgreSQL specific settings on connection"""
            if 'postgresql' in str(dbapi_connection):
                with dbapi_connection.cursor() as cursor:
                    # Set timezone to UTC
                    cursor.execute("SET timezone TO 'UTC'")
                    # Set statement timeout to 30 seconds
                    cursor.execute("SET statement_timeout TO '30s'")
                    # Set lock timeout to 10 seconds
                    cursor.execute("SET lock_timeout TO '10s'")
        
        @event.listens_for(engine, "checkout")
        def receive_checkout(dbapi_connection, connection_record, connection_proxy):
            """Log connection checkout for monitoring"""
            logger.debug("Connection checked out from pool")
            
        @event.listens_for(engine, "checkin")
        def receive_checkin(dbapi_connection, connection_record):
            """Log connection checkin for monitoring"""
            logger.debug("Connection returned to pool")
            
    except Exception as e:
        logger.error(f"Failed to initialize database connections: {e}")
        raise


@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """
    Get synchronous database session with automatic cleanup
    
    Yields:
        SQLAlchemy Session instance
    """
    if SessionLocal is None:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        logger.error(f"Database session error: {e}")
        raise
    finally:
        session.close()


@asynccontextmanager
async def get_async_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Get asynchronous database session with automatic cleanup
    
    Yields:
        SQLAlchemy AsyncSession instance
    """
    if AsyncSessionLocal is None:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            logger.error(f"Async database session error: {e}")
            raise


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency for getting database session
    
    Yields:
        SQLAlchemy Session instance
    """
    with get_db_session() as session:
        yield session


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency for getting async database session
    
    Yields:
        SQLAlchemy AsyncSession instance
    """
    async with get_async_db_session() as session:
        yield session


class DatabaseHealth:
    """Database health check utilities"""
    
    @staticmethod
    def check_connection() -> bool:
        """
        Check database connection health
        
        Returns:
            True if connection is healthy, False otherwise
        """
        try:
            with get_db_session() as session:
                session.execute("SELECT 1")
                return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False
    
    @staticmethod
    async def async_check_connection() -> bool:
        """
        Async check database connection health
        
        Returns:
            True if connection is healthy, False otherwise
        """
        try:
            async with get_async_db_session() as session:
                await session.execute("SELECT 1")
                return True
        except Exception as e:
            logger.error(f"Async database health check failed: {e}")
            return False
    
    @staticmethod
    def get_pool_status() -> dict:
        """
        Get connection pool status for monitoring
        
        Returns:
            Dictionary with pool statistics
        """
        if engine is None:
            return {"status": "not_initialized"}
        
        pool = engine.pool
        return {
            "pool_size": pool.size(),
            "checked_in": pool.checkedin(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
            "invalid": pool.invalid()
        }


# Multi-tenant utilities
class TenantContext:
    """Context manager for multi-tenant operations"""
    
    def __init__(self, tenant_id: Optional[str] = None):
        self.tenant_id = tenant_id
        self._original_tenant_id = None
    
    def __enter__(self):
        # In a real implementation, you might set row-level security context
        # For now, we'll just store the tenant_id for use in queries
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        # Cleanup tenant context
        pass


def with_tenant_context(tenant_id: str):
    """
    Decorator for applying tenant context to database operations
    
    Args:
        tenant_id: Tenant identifier
    """
    def decorator(func):
        def wrapper(*args, **kwargs):
            with TenantContext(tenant_id):
                return func(*args, **kwargs)
        return wrapper
    return decorator


# Database initialization
def create_all_tables():
    """Create all database tables"""
    if engine is None:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise


def drop_all_tables():
    """Drop all database tables (use with caution!)"""
    if engine is None:
        raise RuntimeError("Database not initialized. Call init_database() first.")
    
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("Database tables dropped successfully")
    except Exception as e:
        logger.error(f"Failed to drop database tables: {e}")
        raise