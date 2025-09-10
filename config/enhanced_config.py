"""
Enhanced Configuration Management for AI Finance Agency
Includes comprehensive environment validation and graceful degradation
"""

import os
import sys
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any
from dotenv import load_dotenv
import logging
from enum import Enum

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ServiceStatus(Enum):
    """Service availability status"""
    AVAILABLE = "available"
    MISSING_CONFIG = "missing_config"
    CONNECTION_FAILED = "connection_failed"
    DISABLED = "disabled"


@dataclass
class AIServiceConfig:
    """AI Service Configuration with validation"""
    # Claude (Anthropic)
    claude_api_key: Optional[str] = None
    claude_enabled: bool = False
    claude_status: ServiceStatus = ServiceStatus.MISSING_CONFIG
    
    # OpenAI
    openai_api_key: Optional[str] = None
    openai_enabled: bool = False
    openai_status: ServiceStatus = ServiceStatus.MISSING_CONFIG
    
    # Perplexity
    perplexity_api_key: Optional[str] = None
    perplexity_enabled: bool = False
    perplexity_status: ServiceStatus = ServiceStatus.MISSING_CONFIG
    
    # Google AI
    google_ai_key: Optional[str] = None
    google_enabled: bool = False
    google_status: ServiceStatus = ServiceStatus.MISSING_CONFIG
    
    def __post_init__(self):
        """Load and validate AI service configurations"""
        # Claude
        self.claude_api_key = os.getenv('CLAUDE_API_KEY')
        if self.claude_api_key and self.claude_api_key != 'sk-ant-api03-...':
            self.claude_enabled = True
            self.claude_status = ServiceStatus.AVAILABLE
            logger.info("✅ Claude API configured")
        else:
            logger.warning("⚠️ Claude API not configured")
        
        # OpenAI
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        if self.openai_api_key and self.openai_api_key.startswith('sk-'):
            self.openai_enabled = True
            self.openai_status = ServiceStatus.AVAILABLE
            logger.info("✅ OpenAI API configured")
        else:
            logger.warning("⚠️ OpenAI API not configured")
        
        # Perplexity
        self.perplexity_api_key = os.getenv('PERPLEXITY_API_KEY')
        if self.perplexity_api_key and self.perplexity_api_key != 'pplx-...':
            self.perplexity_enabled = True
            self.perplexity_status = ServiceStatus.AVAILABLE
            logger.info("✅ Perplexity API configured")
        else:
            logger.warning("⚠️ Perplexity API not configured")
        
        # Google AI
        self.google_ai_key = os.getenv('GOOGLE_AI_KEY')
        if self.google_ai_key and self.google_ai_key != '...':
            self.google_enabled = True
            self.google_status = ServiceStatus.AVAILABLE
            logger.info("✅ Google AI configured")
        else:
            logger.warning("⚠️ Google AI not configured")
    
    def get_available_services(self) -> List[str]:
        """Return list of available AI services"""
        services = []
        if self.claude_enabled:
            services.append("claude")
        if self.openai_enabled:
            services.append("openai")
        if self.perplexity_enabled:
            services.append("perplexity")
        if self.google_enabled:
            services.append("google")
        return services


@dataclass
class DatabaseConfig:
    """Enhanced database configuration with multiple backends"""
    # SQLite (Local)
    sqlite_path: str = "data/agency.db"
    sqlite_enabled: bool = True
    
    # PostgreSQL (Primary)
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "ai_finance_agency"
    postgres_user: str = "postgres"
    postgres_password: Optional[str] = None
    postgres_enabled: bool = False
    
    # Supabase (Cloud PostgreSQL)
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    supabase_enabled: bool = False
    
    # Redis (Cache)
    redis_url: str = "redis://localhost:6379"
    redis_password: Optional[str] = None
    redis_enabled: bool = False
    
    # Connection settings
    pool_size: int = 10
    pool_timeout: int = 30
    pool_recycle: int = 3600
    
    # Backup settings
    backup_enabled: bool = True
    backup_path: str = "data/backup/"
    backup_frequency: str = "hourly"
    backup_retention_days: int = 30
    
    def __post_init__(self):
        """Load and validate database configurations"""
        # SQLite
        self.sqlite_path = os.getenv('DATABASE_PATH', self.sqlite_path)
        os.makedirs(os.path.dirname(self.sqlite_path), exist_ok=True)
        logger.info(f"✅ SQLite database: {self.sqlite_path}")
        
        # PostgreSQL
        self.postgres_host = os.getenv('POSTGRES_HOST', self.postgres_host)
        self.postgres_port = int(os.getenv('POSTGRES_PORT', str(self.postgres_port)))
        self.postgres_db = os.getenv('POSTGRES_DB', self.postgres_db)
        self.postgres_user = os.getenv('POSTGRES_USER', self.postgres_user)
        self.postgres_password = os.getenv('POSTGRES_PASSWORD')
        
        # Check if PostgreSQL URL is provided (overrides individual settings)
        database_url = os.getenv('DATABASE_URL')
        if database_url:
            self.postgres_enabled = True
            logger.info("✅ PostgreSQL configured via DATABASE_URL")
        elif self.postgres_password:
            self.postgres_enabled = True
            logger.info(f"✅ PostgreSQL configured: {self.postgres_user}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}")
        else:
            logger.warning("⚠️ PostgreSQL not configured - set DATABASE_URL or POSTGRES_* variables")
        
        # Connection pool settings
        self.pool_size = int(os.getenv('DB_POOL_SIZE', str(self.pool_size)))
        self.pool_timeout = int(os.getenv('DB_POOL_TIMEOUT', str(self.pool_timeout)))
        self.pool_recycle = int(os.getenv('DB_POOL_RECYCLE', str(self.pool_recycle)))
        
        # Supabase
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_KEY')
        if self.supabase_url and self.supabase_key:
            self.supabase_enabled = True
            logger.info("✅ Supabase configured")
        else:
            logger.warning("⚠️ Supabase not configured")
        
        # Redis
        self.redis_url = os.getenv('REDIS_URL', self.redis_url)
        self.redis_password = os.getenv('REDIS_PASSWORD')
        try:
            import redis
            r = redis.from_url(self.redis_url)
            r.ping()
            self.redis_enabled = True
            logger.info("✅ Redis cache available")
        except:
            logger.warning("⚠️ Redis cache not available")
        
        # Backup settings
        self.backup_enabled = os.getenv('BACKUP_ENABLED', 'true').lower() == 'true'
        self.backup_path = os.getenv('BACKUP_DATABASE_PATH', self.backup_path)
        self.backup_frequency = os.getenv('BACKUP_FREQUENCY', self.backup_frequency)
        self.backup_retention_days = int(os.getenv('BACKUP_RETENTION_DAYS', self.backup_retention_days))


@dataclass
class SocialMediaConfig:
    """Social media platform configurations"""
    # LinkedIn
    linkedin_personal_client_id: Optional[str] = None
    linkedin_personal_client_secret: Optional[str] = None
    linkedin_personal_access_token: Optional[str] = None
    linkedin_company_client_id: Optional[str] = None
    linkedin_company_client_secret: Optional[str] = None
    linkedin_company_access_token: Optional[str] = None
    linkedin_enabled: bool = False
    
    # Twitter
    twitter_consumer_key: Optional[str] = None
    twitter_consumer_secret: Optional[str] = None
    twitter_access_token: Optional[str] = None
    twitter_access_token_secret: Optional[str] = None
    twitter_enabled: bool = False
    
    # Telegram
    telegram_bot_token: Optional[str] = None
    telegram_channel_id: Optional[str] = None
    telegram_api_id: Optional[str] = None
    telegram_api_hash: Optional[str] = None
    telegram_enabled: bool = False
    
    # Instagram
    instagram_access_token: Optional[str] = None
    instagram_business_account_id: Optional[str] = None
    instagram_enabled: bool = False
    
    def __post_init__(self):
        """Load and validate social media configurations"""
        # LinkedIn
        self.linkedin_personal_client_id = os.getenv('LINKEDIN_PERSONAL_CLIENT_ID')
        self.linkedin_personal_client_secret = os.getenv('LINKEDIN_PERSONAL_CLIENT_SECRET')
        self.linkedin_personal_access_token = os.getenv('LINKEDIN_PERSONAL_ACCESS_TOKEN')
        self.linkedin_company_client_id = os.getenv('LINKEDIN_COMPANY_CLIENT_ID')
        self.linkedin_company_client_secret = os.getenv('LINKEDIN_COMPANY_CLIENT_SECRET')
        self.linkedin_company_access_token = os.getenv('LINKEDIN_COMPANY_ACCESS_TOKEN')
        
        if (self.linkedin_personal_access_token or self.linkedin_company_access_token):
            self.linkedin_enabled = True
            logger.info("✅ LinkedIn configured")
        else:
            logger.warning("⚠️ LinkedIn not configured")
        
        # Twitter
        self.twitter_consumer_key = os.getenv('TWITTER_CONSUMER_KEY')
        self.twitter_consumer_secret = os.getenv('TWITTER_CONSUMER_SECRET')
        self.twitter_access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        self.twitter_access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        
        if all([self.twitter_consumer_key, self.twitter_consumer_secret, 
                self.twitter_access_token, self.twitter_access_token_secret]):
            self.twitter_enabled = True
            logger.info("✅ Twitter configured")
        else:
            logger.warning("⚠️ Twitter not configured")
        
        # Telegram
        self.telegram_bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.telegram_channel_id = os.getenv('TELEGRAM_CHANNEL_ID')
        self.telegram_api_id = os.getenv('TELEGRAM_API_ID')
        self.telegram_api_hash = os.getenv('TELEGRAM_API_HASH')
        
        if self.telegram_bot_token and self.telegram_channel_id:
            self.telegram_enabled = True
            logger.info("✅ Telegram configured")
        else:
            logger.warning("⚠️ Telegram not configured")
        
        # Instagram
        self.instagram_access_token = os.getenv('INSTAGRAM_ACCESS_TOKEN')
        self.instagram_business_account_id = os.getenv('INSTAGRAM_BUSINESS_ACCOUNT_ID')
        
        if self.instagram_access_token and self.instagram_business_account_id:
            self.instagram_enabled = True
            logger.info("✅ Instagram configured")
        else:
            logger.warning("⚠️ Instagram not configured")


@dataclass
class MarketDataConfig:
    """Market data API configurations"""
    alpha_vantage_key: Optional[str] = None
    yahoo_finance_enabled: bool = True
    nse_api_key: Optional[str] = None
    finnhub_api_key: Optional[str] = None
    polygon_api_key: Optional[str] = None
    news_api_key: Optional[str] = None
    
    def __post_init__(self):
        """Load and validate market data configurations"""
        self.alpha_vantage_key = os.getenv('ALPHA_VANTAGE_KEY')
        self.yahoo_finance_enabled = os.getenv('YAHOO_FINANCE_ENABLED', 'true').lower() == 'true'
        self.nse_api_key = os.getenv('NSE_API_KEY')
        self.finnhub_api_key = os.getenv('FINNHUB_API_KEY')
        self.polygon_api_key = os.getenv('POLYGON_API_KEY')
        self.news_api_key = os.getenv('NEWS_API_KEY')
        
        configured = []
        if self.alpha_vantage_key:
            configured.append("Alpha Vantage")
        if self.yahoo_finance_enabled:
            configured.append("Yahoo Finance")
        if self.finnhub_api_key:
            configured.append("Finnhub")
        if self.polygon_api_key:
            configured.append("Polygon")
        if self.news_api_key:
            configured.append("News API")
        
        if configured:
            logger.info(f"✅ Market data sources: {', '.join(configured)}")
        else:
            logger.warning("⚠️ No market data sources configured")


@dataclass
class ApplicationConfig:
    """Application settings and feature flags"""
    # Environment
    app_env: str = "development"
    debug: bool = True
    
    # Server ports
    app_port: int = 3000
    api_port: int = 8000
    dashboard_port: int = 3001
    
    # Security
    jwt_secret: str = "dev-secret-change-in-production"
    session_secret: str = "dev-session-secret"
    encryption_key: str = "dev-encryption-key"
    
    # Rate limiting
    rate_limit_window_ms: int = 900000
    rate_limit_max_requests: int = 100
    
    # Content generation
    content_per_day: int = 15
    leads_per_day: int = 50
    outreach_per_day: int = 30
    max_tokens_per_request: int = 1000
    default_temperature: float = 0.7
    
    # Feature flags
    enable_ai_generation: bool = True
    enable_auto_posting: bool = False
    enable_compliance_check: bool = True
    enable_market_data: bool = True
    enable_analytics: bool = True
    enable_error_reporting: bool = True
    
    # Compliance
    compliance_level: str = "strict"
    enable_finra_check: bool = True
    enable_sec_check: bool = True
    enable_mifid_check: bool = False
    
    # Logging
    log_level: str = "INFO"
    log_file_path: str = "logs/app.log"
    
    def __post_init__(self):
        """Load application configuration"""
        self.app_env = os.getenv('APP_ENV', self.app_env)
        self.debug = os.getenv('DEBUG', 'true').lower() == 'true'
        
        self.app_port = int(os.getenv('APP_PORT', self.app_port))
        self.api_port = int(os.getenv('API_PORT', self.api_port))
        self.dashboard_port = int(os.getenv('DASHBOARD_PORT', self.dashboard_port))
        
        self.jwt_secret = os.getenv('JWT_SECRET', self.jwt_secret)
        self.session_secret = os.getenv('SESSION_SECRET', self.session_secret)
        self.encryption_key = os.getenv('ENCRYPTION_KEY', self.encryption_key)
        
        self.content_per_day = int(os.getenv('CONTENT_PER_DAY', self.content_per_day))
        self.leads_per_day = int(os.getenv('LEADS_PER_DAY', self.leads_per_day))
        self.outreach_per_day = int(os.getenv('OUTREACH_PER_DAY', self.outreach_per_day))
        
        # Feature flags
        self.enable_ai_generation = os.getenv('ENABLE_AI_GENERATION', 'true').lower() == 'true'
        self.enable_auto_posting = os.getenv('ENABLE_AUTO_POSTING', 'false').lower() == 'true'
        self.enable_compliance_check = os.getenv('ENABLE_COMPLIANCE_CHECK', 'true').lower() == 'true'
        
        # Create log directory if it doesn't exist
        os.makedirs(os.path.dirname(self.log_file_path), exist_ok=True)


@dataclass
class EnhancedConfig:
    """Main enhanced configuration class with validation"""
    ai_services: AIServiceConfig = field(default_factory=AIServiceConfig)
    database: DatabaseConfig = field(default_factory=DatabaseConfig)
    social_media: SocialMediaConfig = field(default_factory=SocialMediaConfig)
    market_data: MarketDataConfig = field(default_factory=MarketDataConfig)
    application: ApplicationConfig = field(default_factory=ApplicationConfig)
    
    # Validation results
    is_valid: bool = False
    validation_errors: List[str] = field(default_factory=list)
    validation_warnings: List[str] = field(default_factory=list)
    
    def validate(self) -> bool:
        """Comprehensive validation of all configurations"""
        self.validation_errors = []
        self.validation_warnings = []
        
        # Critical checks (errors)
        if not self.ai_services.get_available_services():
            self.validation_errors.append("❌ No AI services configured - at least one is required")
        
        if not os.path.exists(os.path.dirname(self.database.sqlite_path)):
            self.validation_errors.append(f"❌ Database directory does not exist: {os.path.dirname(self.database.sqlite_path)}")
        
        if self.application.jwt_secret == "dev-secret-change-in-production" and self.application.app_env == "production":
            self.validation_errors.append("❌ JWT secret must be changed for production")
        
        # Warning checks
        if not self.database.redis_enabled:
            self.validation_warnings.append("⚠️ Redis cache not available - performance may be impacted")
        
        if not self.database.supabase_enabled:
            self.validation_warnings.append("⚠️ Supabase not configured - using local SQLite only")
        
        if not any([self.social_media.linkedin_enabled, self.social_media.twitter_enabled, 
                    self.social_media.telegram_enabled]):
            self.validation_warnings.append("⚠️ No social media platforms configured")
        
        if not any([self.market_data.alpha_vantage_key, self.market_data.finnhub_api_key,
                    self.market_data.polygon_api_key]):
            self.validation_warnings.append("⚠️ No premium market data sources configured")
        
        # Set validation status
        self.is_valid = len(self.validation_errors) == 0
        
        return self.is_valid
    
    def print_validation_report(self):
        """Print a formatted validation report"""
        print("\n" + "="*60)
        print("🔍 CONFIGURATION VALIDATION REPORT")
        print("="*60)
        
        if self.is_valid:
            print("✅ Configuration is VALID")
        else:
            print("❌ Configuration has ERRORS")
        
        if self.validation_errors:
            print("\n🚫 ERRORS (must fix):")
            for error in self.validation_errors:
                print(f"  {error}")
        
        if self.validation_warnings:
            print("\n⚠️ WARNINGS (recommended to fix):")
            for warning in self.validation_warnings:
                print(f"  {warning}")
        
        print("\n📊 SERVICE STATUS:")
        print(f"  AI Services: {', '.join(self.ai_services.get_available_services()) or 'None'}")
        print(f"  Databases: SQLite={'✅' if self.database.sqlite_enabled else '❌'}, "
              f"Supabase={'✅' if self.database.supabase_enabled else '❌'}, "
              f"Redis={'✅' if self.database.redis_enabled else '❌'}")
        print(f"  Social Media: LinkedIn={'✅' if self.social_media.linkedin_enabled else '❌'}, "
              f"Twitter={'✅' if self.social_media.twitter_enabled else '❌'}, "
              f"Telegram={'✅' if self.social_media.telegram_enabled else '❌'}, "
              f"Instagram={'✅' if self.social_media.instagram_enabled else '❌'}")
        
        print("\n" + "="*60 + "\n")
    
    def get_capability_matrix(self) -> Dict[str, bool]:
        """Get matrix of available capabilities"""
        return {
            "ai_generation": bool(self.ai_services.get_available_services()),
            "cloud_database": self.database.supabase_enabled,
            "caching": self.database.redis_enabled,
            "linkedin_posting": self.social_media.linkedin_enabled,
            "twitter_posting": self.social_media.twitter_enabled,
            "telegram_posting": self.social_media.telegram_enabled,
            "instagram_posting": self.social_media.instagram_enabled,
            "market_data": bool(self.market_data.alpha_vantage_key or 
                               self.market_data.finnhub_api_key or 
                               self.market_data.polygon_api_key),
            "compliance_checking": self.application.enable_compliance_check,
            "auto_posting": self.application.enable_auto_posting,
        }
    
    @classmethod
    def load(cls) -> 'EnhancedConfig':
        """Load and validate configuration"""
        config = cls()
        config.validate()
        return config


# Global enhanced config instance
enhanced_config = EnhancedConfig.load()

# Export for backward compatibility
def get_config():
    """Get the enhanced configuration instance"""
    return enhanced_config

if __name__ == "__main__":
    # Run validation when executed directly
    config = EnhancedConfig.load()
    config.print_validation_report()
    
    if not config.is_valid:
        print("⚠️ Please fix the configuration errors before proceeding")
        sys.exit(1)