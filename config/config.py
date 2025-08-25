"""
Configuration management for AI Finance Agency
"""

import os
from dataclasses import dataclass
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()


@dataclass
class APIConfig:
    """API keys and endpoints configuration"""
    alpha_vantage_key: Optional[str] = None
    finnhub_key: Optional[str] = None
    news_api_key: Optional[str] = None
    polygon_key: Optional[str] = None
    
    def __post_init__(self):
        self.alpha_vantage_key = os.getenv('ALPHA_VANTAGE_API_KEY')
        self.finnhub_key = os.getenv('FINNHUB_API_KEY')
        self.news_api_key = os.getenv('NEWS_API_KEY')
        self.polygon_key = os.getenv('POLYGON_API_KEY')


@dataclass
class DatabaseConfig:
    """Database configuration"""
    path: str = "data/agency.db"
    backup_path: str = "data/backup/"
    
    def __post_init__(self):
        self.path = os.getenv('DATABASE_PATH', self.path)
        self.backup_path = os.getenv('BACKUP_DATABASE_PATH', self.backup_path)


@dataclass
class AgentConfig:
    """Research agent configuration"""
    research_interval_minutes: int = 30
    max_concurrent_requests: int = 10
    request_timeout_seconds: int = 30
    min_relevance_score: int = 7
    max_ideas_per_scan: int = 20
    
    def __post_init__(self):
        self.research_interval_minutes = int(os.getenv('RESEARCH_INTERVAL_MINUTES', self.research_interval_minutes))
        self.max_concurrent_requests = int(os.getenv('MAX_CONCURRENT_REQUESTS', self.max_concurrent_requests))
        self.request_timeout_seconds = int(os.getenv('REQUEST_TIMEOUT_SECONDS', self.request_timeout_seconds))
        self.min_relevance_score = int(os.getenv('MIN_RELEVANCE_SCORE', self.min_relevance_score))
        self.max_ideas_per_scan = int(os.getenv('MAX_IDEAS_PER_SCAN', self.max_ideas_per_scan))


@dataclass
class DashboardConfig:
    """Dashboard configuration"""
    port: int = 5000
    debug: bool = False
    secret_key: str = "dev-key-change-in-production"
    
    def __post_init__(self):
        self.port = int(os.getenv('FLASK_PORT', self.port))
        self.debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
        self.secret_key = os.getenv('SECRET_KEY', self.secret_key)


@dataclass
class LoggingConfig:
    """Logging configuration"""
    level: str = "INFO"
    file: str = "logs/research_agent.log"
    sentry_dsn: Optional[str] = None
    
    def __post_init__(self):
        self.level = os.getenv('LOG_LEVEL', self.level)
        self.file = os.getenv('LOG_FILE', self.file)
        self.sentry_dsn = os.getenv('SENTRY_DSN')


@dataclass
class ContentConfig:
    """Content generation configuration"""
    content_types: List[str] = None
    webhook_url: Optional[str] = None
    slack_webhook_url: Optional[str] = None
    
    def __post_init__(self):
        if self.content_types is None:
            types_str = os.getenv('CONTENT_TYPES', 'news_analysis,market_analysis,educational,trading_signals')
            self.content_types = [t.strip() for t in types_str.split(',')]
        
        self.webhook_url = os.getenv('WEBHOOK_URL')
        self.slack_webhook_url = os.getenv('SLACK_WEBHOOK_URL')


@dataclass 
class Config:
    """Main configuration class"""
    api: APIConfig
    database: DatabaseConfig
    agent: AgentConfig
    dashboard: DashboardConfig
    logging: LoggingConfig
    content: ContentConfig
    
    @classmethod
    def load(cls) -> 'Config':
        """Load configuration from environment"""
        return cls(
            api=APIConfig(),
            database=DatabaseConfig(),
            agent=AgentConfig(),
            dashboard=DashboardConfig(),
            logging=LoggingConfig(),
            content=ContentConfig()
        )
    
    def validate(self) -> Dict[str, List[str]]:
        """Validate configuration and return any issues"""
        issues = {}
        
        if not any([self.api.alpha_vantage_key, self.api.finnhub_key, self.api.news_api_key]):
            issues.setdefault('api', []).append('At least one API key should be configured')
        
        return issues


# Global config instance
config = Config.load()