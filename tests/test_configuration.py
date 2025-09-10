#!/usr/bin/env python3
"""
Unit tests for environment configuration
"""

import unittest
import os
import sys
from unittest.mock import patch, MagicMock
import tempfile

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.enhanced_config import (
    EnhancedConfig, 
    AIServiceConfig, 
    DatabaseConfig,
    SocialMediaConfig,
    MarketDataConfig,
    ApplicationConfig,
    ServiceStatus
)


class TestAIServiceConfig(unittest.TestCase):
    """Test AI service configuration"""
    
    @patch.dict(os.environ, {'OPENAI_API_KEY': 'sk-test123'})
    def test_openai_config_valid(self):
        """Test valid OpenAI configuration"""
        config = AIServiceConfig()
        self.assertTrue(config.openai_enabled)
        self.assertEqual(config.openai_status, ServiceStatus.AVAILABLE)
        self.assertIn('openai', config.get_available_services())
    
    @patch.dict(os.environ, {'OPENAI_API_KEY': ''})
    def test_openai_config_missing(self):
        """Test missing OpenAI configuration"""
        config = AIServiceConfig()
        self.assertFalse(config.openai_enabled)
        self.assertEqual(config.openai_status, ServiceStatus.MISSING_CONFIG)
        self.assertNotIn('openai', config.get_available_services())
    
    @patch.dict(os.environ, {
        'CLAUDE_API_KEY': 'sk-ant-api03-valid',
        'OPENAI_API_KEY': 'sk-valid',
        'PERPLEXITY_API_KEY': 'pplx-valid',
        'GOOGLE_AI_KEY': 'google-valid'
    })
    def test_all_services_configured(self):
        """Test all AI services configured"""
        config = AIServiceConfig()
        services = config.get_available_services()
        self.assertEqual(len(services), 4)
        self.assertIn('claude', services)
        self.assertIn('openai', services)
        self.assertIn('perplexity', services)
        self.assertIn('google', services)


class TestDatabaseConfig(unittest.TestCase):
    """Test database configuration"""
    
    def test_sqlite_default_path(self):
        """Test SQLite default path"""
        config = DatabaseConfig()
        self.assertEqual(config.sqlite_path, 'data/agency.db')
        self.assertTrue(config.sqlite_enabled)
    
    @patch.dict(os.environ, {'DATABASE_PATH': '/custom/path/db.sqlite'})
    def test_sqlite_custom_path(self):
        """Test SQLite custom path from environment"""
        config = DatabaseConfig()
        self.assertEqual(config.sqlite_path, '/custom/path/db.sqlite')
    
    @patch.dict(os.environ, {
        'SUPABASE_URL': 'https://test.supabase.co',
        'SUPABASE_KEY': 'test-key'
    })
    def test_supabase_configured(self):
        """Test Supabase configuration"""
        config = DatabaseConfig()
        self.assertTrue(config.supabase_enabled)
        self.assertEqual(config.supabase_url, 'https://test.supabase.co')
        self.assertEqual(config.supabase_key, 'test-key')
    
    @patch.dict(os.environ, {'BACKUP_RETENTION_DAYS': '60'})
    def test_backup_settings(self):
        """Test backup configuration"""
        config = DatabaseConfig()
        self.assertEqual(config.backup_retention_days, 60)
        self.assertTrue(config.backup_enabled)


class TestSocialMediaConfig(unittest.TestCase):
    """Test social media configuration"""
    
    @patch.dict(os.environ, {
        'TWITTER_CONSUMER_KEY': 'key1',
        'TWITTER_CONSUMER_SECRET': 'secret1',
        'TWITTER_ACCESS_TOKEN': 'token1',
        'TWITTER_ACCESS_TOKEN_SECRET': 'secret2'
    })
    def test_twitter_configured(self):
        """Test Twitter configuration"""
        config = SocialMediaConfig()
        self.assertTrue(config.twitter_enabled)
        self.assertEqual(config.twitter_consumer_key, 'key1')
    
    @patch.dict(os.environ, {
        'TELEGRAM_BOT_TOKEN': 'bot-token',
        'TELEGRAM_CHANNEL_ID': '@channel'
    })
    def test_telegram_configured(self):
        """Test Telegram configuration"""
        config = SocialMediaConfig()
        self.assertTrue(config.telegram_enabled)
        self.assertEqual(config.telegram_bot_token, 'bot-token')
        self.assertEqual(config.telegram_channel_id, '@channel')
    
    @patch.dict(os.environ, {
        'LINKEDIN_PERSONAL_ACCESS_TOKEN': 'linkedin-token'
    })
    def test_linkedin_personal_configured(self):
        """Test LinkedIn personal account configuration"""
        config = SocialMediaConfig()
        self.assertTrue(config.linkedin_enabled)
        self.assertEqual(config.linkedin_personal_access_token, 'linkedin-token')


class TestApplicationConfig(unittest.TestCase):
    """Test application configuration"""
    
    def test_default_ports(self):
        """Test default port configuration"""
        config = ApplicationConfig()
        self.assertEqual(config.app_port, 3000)
        self.assertEqual(config.api_port, 8000)
        self.assertEqual(config.dashboard_port, 3001)
    
    @patch.dict(os.environ, {
        'APP_PORT': '5000',
        'API_PORT': '5001',
        'DASHBOARD_PORT': '5002'
    })
    def test_custom_ports(self):
        """Test custom port configuration"""
        config = ApplicationConfig()
        self.assertEqual(config.app_port, 5000)
        self.assertEqual(config.api_port, 5001)
        self.assertEqual(config.dashboard_port, 5002)
    
    @patch.dict(os.environ, {'APP_ENV': 'production', 'DEBUG': 'false'})
    def test_production_environment(self):
        """Test production environment settings"""
        config = ApplicationConfig()
        self.assertEqual(config.app_env, 'production')
        self.assertFalse(config.debug)
    
    def test_feature_flags(self):
        """Test feature flags default values"""
        config = ApplicationConfig()
        self.assertTrue(config.enable_ai_generation)
        self.assertFalse(config.enable_auto_posting)
        self.assertTrue(config.enable_compliance_check)
    
    @patch.dict(os.environ, {
        'CONTENT_PER_DAY': '30',
        'LEADS_PER_DAY': '100',
        'OUTREACH_PER_DAY': '50'
    })
    def test_content_limits(self):
        """Test content generation limits"""
        config = ApplicationConfig()
        self.assertEqual(config.content_per_day, 30)
        self.assertEqual(config.leads_per_day, 100)
        self.assertEqual(config.outreach_per_day, 50)


class TestEnhancedConfig(unittest.TestCase):
    """Test main enhanced configuration class"""
    
    @patch.dict(os.environ, {
        'OPENAI_API_KEY': 'sk-test',
        'DATABASE_PATH': 'data/test.db'
    })
    def test_valid_minimal_config(self):
        """Test minimal valid configuration"""
        config = EnhancedConfig()
        self.assertTrue(config.validate())
        self.assertTrue(config.is_valid)
        self.assertEqual(len(config.validation_errors), 0)
    
    @patch.dict(os.environ, {}, clear=True)
    def test_invalid_config_no_ai(self):
        """Test invalid configuration with no AI services"""
        # Create a temporary directory for the database
        with tempfile.TemporaryDirectory() as tmpdir:
            with patch.dict(os.environ, {'DATABASE_PATH': f'{tmpdir}/test.db'}):
                config = EnhancedConfig()
                config.validate()
                self.assertFalse(config.is_valid)
                self.assertGreater(len(config.validation_errors), 0)
                self.assertIn('No AI services configured', config.validation_errors[0])
    
    @patch.dict(os.environ, {
        'OPENAI_API_KEY': 'sk-test',
        'JWT_SECRET': 'dev-secret-change-in-production',
        'APP_ENV': 'production'
    })
    def test_production_jwt_warning(self):
        """Test JWT secret warning in production"""
        config = EnhancedConfig()
        config.validate()
        self.assertFalse(config.is_valid)
        self.assertIn('JWT secret must be changed for production', config.validation_errors[0])
    
    @patch.dict(os.environ, {
        'OPENAI_API_KEY': 'sk-test',
        'TWITTER_CONSUMER_KEY': 'key',
        'TWITTER_CONSUMER_SECRET': 'secret',
        'TWITTER_ACCESS_TOKEN': 'token',
        'TWITTER_ACCESS_TOKEN_SECRET': 'secret2',
        'REDIS_URL': 'redis://localhost:6379'
    })
    def test_capability_matrix(self):
        """Test capability matrix generation"""
        config = EnhancedConfig()
        config.validate()
        capabilities = config.get_capability_matrix()
        
        self.assertTrue(capabilities['ai_generation'])
        self.assertFalse(capabilities['cloud_database'])
        self.assertTrue(capabilities['twitter_posting'])
        self.assertFalse(capabilities['instagram_posting'])
        self.assertTrue(capabilities['compliance_checking'])


class TestMarketDataConfig(unittest.TestCase):
    """Test market data configuration"""
    
    @patch.dict(os.environ, {'YAHOO_FINANCE_ENABLED': 'true'})
    def test_yahoo_finance_enabled(self):
        """Test Yahoo Finance enabled by default"""
        config = MarketDataConfig()
        self.assertTrue(config.yahoo_finance_enabled)
    
    @patch.dict(os.environ, {
        'ALPHA_VANTAGE_KEY': 'av-key',
        'FINNHUB_API_KEY': 'fh-key',
        'POLYGON_API_KEY': 'pg-key'
    })
    def test_multiple_market_sources(self):
        """Test multiple market data sources"""
        config = MarketDataConfig()
        self.assertEqual(config.alpha_vantage_key, 'av-key')
        self.assertEqual(config.finnhub_api_key, 'fh-key')
        self.assertEqual(config.polygon_api_key, 'pg-key')


class TestConfigValidation(unittest.TestCase):
    """Test configuration validation functions"""
    
    @patch.dict(os.environ, {
        'OPENAI_API_KEY': 'sk-test',
        'DATABASE_PATH': 'data/test.db'
    })
    def test_load_config(self):
        """Test loading configuration"""
        from config.enhanced_config import get_config
        config = get_config()
        self.assertIsInstance(config, EnhancedConfig)
        self.assertTrue(config.is_valid)
    
    def test_service_status_enum(self):
        """Test ServiceStatus enum values"""
        self.assertEqual(ServiceStatus.AVAILABLE.value, 'available')
        self.assertEqual(ServiceStatus.MISSING_CONFIG.value, 'missing_config')
        self.assertEqual(ServiceStatus.CONNECTION_FAILED.value, 'connection_failed')
        self.assertEqual(ServiceStatus.DISABLED.value, 'disabled')


if __name__ == '__main__':
    # Create test database directory
    os.makedirs('data', exist_ok=True)
    
    # Run tests
    unittest.main(verbosity=2)