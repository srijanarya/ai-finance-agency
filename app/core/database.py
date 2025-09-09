"""
Database Configuration and Management
Handles PostgreSQL connections, SQLAlchemy setup, and multi-tenant support
"""

import logging
from typing import AsyncGenerator, Optional
from contextlib import asynccontextmanager
from sqlalchemy import create_engine, text, MetaData
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.pool import QueuePool
from sqlalchemy.orm import sessionmaker
import asyncpg
import redis.asyncio as redis

from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Database base class for models
Base = declarative_base()

# Global database instances
async_engine = None
async_session_factory = None
sync_engine = None
sync_session_factory = None
redis_client = None


async def init_db() -> None:
    """Initialize database connections and create tables"""
    global async_engine, async_session_factory, sync_engine, sync_session_factory, redis_client
    
    settings = get_settings()
    
    # Initialize PostgreSQL async engine
    database_config = settings.get_database_config()
    
    # Convert sync URL to async URL for PostgreSQL
    async_url = database_config["url"].replace("postgresql://", "postgresql+asyncpg://")
    
    async_engine = create_async_engine(
        async_url,
        pool_size=database_config["pool_size"],
        max_overflow=database_config["max_overflow"],
        pool_pre_ping=database_config["pool_pre_ping"],
        pool_recycle=database_config["pool_recycle"],
        echo=settings.debug,
    )
    
    # Create async session factory
    async_session_factory = async_sessionmaker(
        async_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    # Initialize sync engine for migrations and administrative tasks
    sync_engine = create_engine(
        database_config["url"],
        pool_size=database_config["pool_size"],
        max_overflow=database_config["max_overflow"],
        pool_pre_ping=database_config["pool_pre_ping"],
        pool_recycle=database_config["pool_recycle"],
        echo=settings.debug,
    )
    
    sync_session_factory = sessionmaker(bind=sync_engine)
    
    # Initialize Redis client
    redis_config = settings.get_redis_config()
    redis_client = redis.from_url(
        redis_config["url"],
        decode_responses=redis_config["decode_responses"],
        socket_keepalive=redis_config["socket_keepalive"],
        health_check_interval=redis_config["health_check_interval"]
    )
    
    # Test connections
    await test_database_connection()
    await test_redis_connection()
    
    # Create tables if they don't exist
    await create_tables()
    
    logger.info("✅ Database initialization completed")


async def test_database_connection() -> None:
    """Test database connection"""
    try:
        async with async_engine.begin() as conn:
            result = await conn.execute(text("SELECT 1"))
            assert result.scalar() == 1
        logger.info("✅ PostgreSQL connection successful")
    except Exception as e:
        logger.error(f"❌ PostgreSQL connection failed: {e}")
        raise


async def test_redis_connection() -> None:
    """Test Redis connection"""
    try:
        await redis_client.ping()
        logger.info("✅ Redis connection successful")
    except Exception as e:
        logger.warning(f"⚠️ Redis connection failed: {e}")
        # Don't raise - Redis is optional


async def create_tables() -> None:
    """Create database tables if they don't exist"""
    try:
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables created/verified")
    except Exception as e:
        logger.error(f"❌ Error creating database tables: {e}")
        raise


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session for dependency injection"""
    if async_session_factory is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    
    async with async_session_factory() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            await session.close()


async def get_redis() -> Optional[redis.Redis]:
    """Get Redis client"""
    return redis_client


def get_sync_db():
    """Get synchronous database session (for migrations, etc.)"""
    if sync_session_factory is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    
    return sync_session_factory()


@asynccontextmanager
async def get_db_context():
    """Get database session with context manager"""
    async with async_session_factory() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Database context error: {e}")
            raise


class DatabaseManager:
    """Database management utilities"""
    
    @staticmethod
    async def health_check() -> dict:
        """Check database health"""
        health = {
            "postgresql": "unknown",
            "redis": "unknown"
        }
        
        # Check PostgreSQL
        try:
            async with async_engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
            health["postgresql"] = "healthy"
        except Exception as e:
            health["postgresql"] = f"unhealthy: {str(e)}"
        
        # Check Redis
        try:
            if redis_client:
                await redis_client.ping()
                health["redis"] = "healthy"
            else:
                health["redis"] = "not configured"
        except Exception as e:
            health["redis"] = f"unhealthy: {str(e)}"
        
        return health
    
    @staticmethod
    async def get_connection_info() -> dict:
        """Get database connection information"""
        info = {
            "postgresql": {
                "url": str(async_engine.url) if async_engine else "Not initialized",
                "pool_size": async_engine.pool.size() if async_engine else 0,
                "checked_in": async_engine.pool.checkedin() if async_engine else 0,
                "checked_out": async_engine.pool.checkedout() if async_engine else 0,
            },
            "redis": {
                "url": str(redis_client.connection_pool.connection_kwargs.get('host', 'Not configured')) if redis_client else "Not configured",
                "connected": bool(redis_client) if redis_client else False,
            }
        }
        
        return info
    
    @staticmethod
    async def close_connections():
        """Close all database connections"""
        if async_engine:
            await async_engine.dispose()
        
        if redis_client:
            await redis_client.close()
        
        logger.info("✅ Database connections closed")


# Multi-tenant database utilities
class TenantManager:
    """Utilities for multi-tenant database operations"""
    
    @staticmethod
    async def create_tenant_schema(tenant_id: str) -> None:
        """Create schema for a new tenant"""
        schema_name = f"tenant_{tenant_id}"
        
        async with async_engine.begin() as conn:
            # Create schema
            await conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))
            
            # Create tables in the new schema
            metadata = MetaData(schema=schema_name)
            metadata.create_all(sync_engine)
        
        logger.info(f"✅ Created tenant schema: {schema_name}")
    
    @staticmethod
    async def get_tenant_session(tenant_id: str) -> AsyncSession:
        """Get database session for specific tenant"""
        session = async_session_factory()
        
        # Set the search path to the tenant schema
        schema_name = f"tenant_{tenant_id}"
        await session.execute(text(f"SET search_path TO {schema_name}, public"))
        
        return session
    
    @staticmethod
    def get_tenant_table_name(tenant_id: str, table_name: str) -> str:
        """Get fully qualified table name for tenant"""
        return f"tenant_{tenant_id}.{table_name}"


# Export commonly used items
__all__ = [
    "Base",
    "init_db",
    "get_db",
    "get_redis",
    "get_sync_db",
    "get_db_context",
    "DatabaseManager",
    "TenantManager"
]