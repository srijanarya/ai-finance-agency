"""
Application Configuration Management
Centralized configuration with environment validation and security
"""

import os
from typing import List, Optional, Union
from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field, validator


class Settings(BaseSettings):
    """Application settings with validation"""
    
    # Environment
    environment: str = Field(default="development", env="APP_ENV")
    debug: bool = Field(default=True, env="DEBUG")
    
    # API Configuration
    api_title: str = Field(default="AI Finance Agency API")
    api_version: str = Field(default="2.0.0")
    api_port: int = Field(default=8000, env="API_PORT")
    app_port: int = Field(default=3000, env="APP_PORT")
    
    # Security
    jwt_secret: str = Field(default="dev-jwt-secret-change-in-production", env="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256")
    jwt_expiration_hours: int = Field(default=24)
    session_secret: str = Field(default="dev-session-secret-change-in-production", env="SESSION_SECRET")
    encryption_key: str = Field(default="dev-encryption-key-change-in-production", env="ENCRYPTION_KEY")
    
    # Database Configuration
    database_url: str = Field(
        default="postgresql://ai_finance_user:securepassword123@localhost:5432/ai_finance_db",
        env="DATABASE_URL"
    )
    redis_url: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    database_pool_size: int = Field(default=20)
    database_max_overflow: int = Field(default=0)
    
    # CORS & Security
    cors_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001", "http://localhost:8080"],
        env="CORS_ORIGINS"
    )
    allowed_hosts: List[str] = Field(
        default=["localhost", "127.0.0.1", "0.0.0.0"],
        env="ALLOWED_HOSTS"
    )
    
    # Rate Limiting
    rate_limit_window_seconds: int = Field(default=900, env="RATE_LIMIT_WINDOW_MS")  # 15 minutes
    rate_limit_max_requests: int = Field(default=100, env="RATE_LIMIT_MAX_REQUESTS")
    
    # AI Services
    claude_api_key: Optional[str] = Field(default=None, env="CLAUDE_API_KEY")
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    perplexity_api_key: Optional[str] = Field(default=None, env="PERPLEXITY_API_KEY")
    google_ai_key: Optional[str] = Field(default=None, env="GOOGLE_AI_KEY")
    
    # Social Media APIs
    linkedin_client_id: Optional[str] = Field(default=None, env="LINKEDIN_PERSONAL_CLIENT_ID")
    linkedin_client_secret: Optional[str] = Field(default=None, env="LINKEDIN_PERSONAL_CLIENT_SECRET")
    linkedin_access_token: Optional[str] = Field(default=None, env="LINKEDIN_PERSONAL_ACCESS_TOKEN")
    
    twitter_consumer_key: Optional[str] = Field(default=None, env="TWITTER_CONSUMER_KEY")
    twitter_consumer_secret: Optional[str] = Field(default=None, env="TWITTER_CONSUMER_SECRET")
    twitter_access_token: Optional[str] = Field(default=None, env="TWITTER_ACCESS_TOKEN")
    twitter_access_token_secret: Optional[str] = Field(default=None, env="TWITTER_ACCESS_TOKEN_SECRET")
    
    telegram_bot_token: Optional[str] = Field(default=None, env="TELEGRAM_BOT_TOKEN")
    telegram_channel_id: Optional[str] = Field(default=None, env="TELEGRAM_CHANNEL_ID")
    
    # Market Data APIs
    alpha_vantage_key: Optional[str] = Field(default=None, env="ALPHA_VANTAGE_KEY")
    finnhub_api_key: Optional[str] = Field(default=None, env="FINNHUB_API_KEY")
    polygon_api_key: Optional[str] = Field(default=None, env="POLYGON_API_KEY")
    news_api_key: Optional[str] = Field(default=None, env="NEWS_API_KEY")
    
    # Feature Flags
    enable_ai_generation: bool = Field(default=True, env="ENABLE_AI_GENERATION")
    enable_auto_posting: bool = Field(default=False, env="ENABLE_AUTO_POSTING")
    enable_compliance_check: bool = Field(default=True, env="ENABLE_COMPLIANCE_CHECK")
    enable_market_data: bool = Field(default=True, env="ENABLE_MARKET_DATA")
    enable_analytics: bool = Field(default=True, env="ENABLE_ANALYTICS")
    enable_error_reporting: bool = Field(default=True, env="ENABLE_ERROR_REPORTING")
    
    # Content Generation Limits
    content_per_day: int = Field(default=15, env="CONTENT_PER_DAY")
    leads_per_day: int = Field(default=50, env="LEADS_PER_DAY")
    outreach_per_day: int = Field(default=30, env="OUTREACH_PER_DAY")
    max_tokens_per_request: int = Field(default=1000, env="MAX_TOKENS_PER_REQUEST")
    default_temperature: float = Field(default=0.7, env="DEFAULT_TEMPERATURE")
    
    # Compliance Settings
    compliance_level: str = Field(default="strict", env="COMPLIANCE_LEVEL")
    enable_finra_check: bool = Field(default=True, env="ENABLE_FINRA_CHECK")
    enable_sec_check: bool = Field(default=True, env="ENABLE_SEC_CHECK")
    enable_mifid_check: bool = Field(default=False, env="ENABLE_MIFID_CHECK")
    
    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_file_path: str = Field(default="logs/app.log", env="LOG_FILE_PATH")
    
    # Celery Configuration
    celery_broker_url: str = Field(default="redis://localhost:6379/0", env="CELERY_BROKER_URL")
    celery_result_backend: str = Field(default="redis://localhost:6379/1", env="CELERY_RESULT_BACKEND")
    
    # Monitoring & Observability
    sentry_dsn: Optional[str] = Field(default=None, env="SENTRY_DSN")
    enable_metrics: bool = Field(default=True)
    
    @validator("environment")
    def validate_environment(cls, v):
        """Validate environment values"""
        valid_environments = ["development", "staging", "production", "testing"]
        if v not in valid_environments:
            raise ValueError(f"Environment must be one of: {valid_environments}")
        return v
    
    @validator("compliance_level")
    def validate_compliance_level(cls, v):
        """Validate compliance level"""
        valid_levels = ["strict", "moderate", "relaxed"]
        if v not in valid_levels:
            raise ValueError(f"Compliance level must be one of: {valid_levels}")
        return v
    
    @validator("cors_origins", pre=True)
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @validator("allowed_hosts", pre=True)
    def parse_allowed_hosts(cls, v):
        """Parse allowed hosts from string or list"""
        if isinstance(v, str):
            return [host.strip() for host in v.split(",")]
        return v
    
    def get_database_config(self) -> dict:
        """Get database configuration dictionary"""
        return {
            "url": self.database_url,
            "pool_size": self.database_pool_size,
            "max_overflow": self.database_max_overflow,
            "pool_pre_ping": True,
            "pool_recycle": 3600,
        }
    
    def get_redis_config(self) -> dict:
        """Get Redis configuration dictionary"""
        return {
            "url": self.redis_url,
            "decode_responses": True,
            "socket_keepalive": True,
            "socket_keepalive_options": {},
            "health_check_interval": 30,
        }
    
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.environment == "development"
    
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.environment == "production"
    
    def is_testing(self) -> bool:
        """Check if running in testing mode"""
        return self.environment == "testing"
    
    def has_ai_service(self) -> bool:
        """Check if at least one AI service is configured"""
        return any([
            self.claude_api_key,
            self.openai_api_key,
            self.perplexity_api_key,
            self.google_ai_key
        ])
    
    def has_social_media_service(self) -> bool:
        """Check if at least one social media service is configured"""
        return any([
            self.linkedin_access_token,
            all([self.twitter_consumer_key, self.twitter_consumer_secret, 
                 self.twitter_access_token, self.twitter_access_token_secret]),
            all([self.telegram_bot_token, self.telegram_channel_id])
        ])
    
    def has_market_data_service(self) -> bool:
        """Check if at least one market data service is configured"""
        return any([
            self.alpha_vantage_key,
            self.finnhub_api_key,
            self.polygon_api_key,
            self.news_api_key
        ])
    
    def validate_production_security(self) -> List[str]:
        """Validate production security requirements"""
        issues = []
        
        if self.is_production():
            if self.jwt_secret == "dev-secret-change-in-production":
                issues.append("JWT secret must be changed for production")
            
            if self.session_secret == "dev-session-secret":
                issues.append("Session secret must be changed for production")
            
            if self.encryption_key == "dev-encryption-key":
                issues.append("Encryption key must be changed for production")
            
            if self.debug:
                issues.append("Debug mode must be disabled in production")
            
            if len(self.jwt_secret) < 32:
                issues.append("JWT secret must be at least 32 characters long")
        
        return issues
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields from .env


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


def validate_settings() -> None:
    """Validate settings and raise errors if invalid"""
    settings = get_settings()
    
    # Check for critical configuration issues
    security_issues = settings.validate_production_security()
    if security_issues and settings.is_production():
        raise ValueError(f"Production security issues: {', '.join(security_issues)}")
    
    # Check for required services
    if not settings.has_ai_service():
        raise ValueError("At least one AI service must be configured")
    
    # Create necessary directories
    os.makedirs(os.path.dirname(settings.log_file_path), exist_ok=True)