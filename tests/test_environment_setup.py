"""
Test environment setup and configuration
Validates that the development environment is properly configured
"""

import os
import pytest
from unittest.mock import patch
from app.core.config import get_settings, validate_settings


class TestEnvironmentConfiguration:
    """Test environment configuration setup"""
    
    def test_settings_load(self):
        """Test that settings can be loaded"""
        settings = get_settings()
        
        # Basic settings should be available
        assert settings.api_title == "AI Finance Agency API"
        assert settings.api_version == "2.0.0"
        assert settings.environment in ["development", "staging", "production", "testing"]
    
    def test_database_configuration(self):
        """Test database configuration"""
        settings = get_settings()
        db_config = settings.get_database_config()
        
        assert "url" in db_config
        assert "pool_size" in db_config
        assert db_config["pool_size"] > 0
    
    def test_redis_configuration(self):
        """Test Redis configuration"""
        settings = get_settings()
        redis_config = settings.get_redis_config()
        
        assert "url" in redis_config
        assert redis_config["decode_responses"] == True
    
    def test_development_mode_detection(self):
        """Test development mode detection"""
        with patch.dict(os.environ, {"APP_ENV": "development"}):
            settings = get_settings()
            assert settings.is_development() == True
            assert settings.is_production() == False
    
    def test_production_mode_detection(self):
        """Test production mode detection"""
        with patch.dict(os.environ, {"APP_ENV": "production"}):
            settings = get_settings()
            assert settings.is_production() == True
            assert settings.is_development() == False


class TestSecurityConfiguration:
    """Test security configuration"""
    
    def test_jwt_secret_configuration(self):
        """Test JWT secret configuration"""
        settings = get_settings()
        assert settings.jwt_secret is not None
        assert len(settings.jwt_secret) >= 10  # Minimum length
    
    def test_cors_origins_configuration(self):
        """Test CORS origins configuration"""
        settings = get_settings()
        assert isinstance(settings.cors_origins, list)
        assert len(settings.cors_origins) > 0
    
    def test_rate_limiting_configuration(self):
        """Test rate limiting configuration"""
        settings = get_settings()
        assert settings.rate_limit_window_seconds > 0
        assert settings.rate_limit_max_requests > 0


class TestServiceConfiguration:
    """Test service configuration"""
    
    def test_ai_service_detection(self):
        """Test AI service detection"""
        settings = get_settings()
        
        # Test method exists and returns boolean
        has_ai = settings.has_ai_service()
        assert isinstance(has_ai, bool)
    
    def test_social_media_service_detection(self):
        """Test social media service detection"""
        settings = get_settings()
        
        # Test method exists and returns boolean
        has_social = settings.has_social_media_service()
        assert isinstance(has_social, bool)
    
    def test_market_data_service_detection(self):
        """Test market data service detection"""
        settings = get_settings()
        
        # Test method exists and returns boolean
        has_market = settings.has_market_data_service()
        assert isinstance(has_market, bool)


class TestFeatureFlags:
    """Test feature flag configuration"""
    
    def test_feature_flags_exist(self):
        """Test that all feature flags exist and are boolean"""
        settings = get_settings()
        
        flags = [
            "enable_ai_generation",
            "enable_auto_posting", 
            "enable_compliance_check",
            "enable_market_data",
            "enable_analytics",
            "enable_error_reporting"
        ]
        
        for flag in flags:
            value = getattr(settings, flag)
            assert isinstance(value, bool), f"Feature flag {flag} should be boolean"
    
    def test_compliance_configuration(self):
        """Test compliance configuration"""
        settings = get_settings()
        
        assert settings.compliance_level in ["strict", "moderate", "relaxed"]
        assert isinstance(settings.enable_finra_check, bool)
        assert isinstance(settings.enable_sec_check, bool)
        assert isinstance(settings.enable_mifid_check, bool)


class TestProductionSecurityValidation:
    """Test production security validation"""
    
    def test_production_security_validation_with_dev_secrets(self):
        """Test production security validation fails with development secrets"""
        with patch.dict(os.environ, {
            "APP_ENV": "production",
            "JWT_SECRET": "dev-secret-change-in-production",
            "DEBUG": "true"
        }):
            settings = get_settings()
            issues = settings.validate_production_security()
            
            # Should have multiple security issues
            assert len(issues) > 0
            assert any("JWT secret" in issue for issue in issues)
            assert any("Debug mode" in issue for issue in issues)
    
    def test_production_security_validation_with_proper_secrets(self):
        """Test production security validation passes with proper secrets"""
        with patch.dict(os.environ, {
            "APP_ENV": "production",
            "JWT_SECRET": "a-very-long-and-secure-secret-key-for-production-use-only",
            "SESSION_SECRET": "another-secure-session-secret-for-production",
            "ENCRYPTION_KEY": "secure-encryption-key-for-production-use-only",
            "DEBUG": "false"
        }):
            settings = get_settings()
            issues = settings.validate_production_security()
            
            # Should have no security issues
            assert len(issues) == 0


class TestValidationFunction:
    """Test the main validation function"""
    
    def test_validate_settings_with_ai_service(self):
        """Test validation passes when AI service is configured"""
        with patch.dict(os.environ, {
            "OPENAI_API_KEY": "test-key-sk-123456789"
        }):
            # Should not raise exception
            validate_settings()
    
    def test_validate_settings_without_ai_service(self):
        """Test validation fails when no AI service is configured"""
        with patch.dict(os.environ, {}, clear=True):
            with patch.dict(os.environ, {
                "APP_ENV": "testing",  # Set minimal required env
                "DATABASE_URL": "sqlite:///:memory:",
                "JWT_SECRET": "test-secret",
                "SESSION_SECRET": "test-session",
                "ENCRYPTION_KEY": "test-encryption"
            }):
                with pytest.raises(ValueError, match="At least one AI service must be configured"):
                    validate_settings()


class TestDirectoryCreation:
    """Test that necessary directories are created"""
    
    def test_log_directory_creation(self):
        """Test that log directory is created during settings validation"""
        settings = get_settings()
        
        # Trigger validation which should create log directory
        try:
            validate_settings()
        except ValueError:
            pass  # May fail validation but should still create directories
        
        log_dir = os.path.dirname(settings.log_file_path)
        assert os.path.exists(log_dir), f"Log directory {log_dir} should be created"


class TestEnvironmentVariableHandling:
    """Test environment variable handling"""
    
    def test_cors_origins_from_string(self):
        """Test CORS origins can be loaded from comma-separated string"""
        with patch.dict(os.environ, {
            "CORS_ORIGINS": "http://localhost:3000,http://localhost:3001,https://example.com"
        }):
            settings = get_settings()
            expected = ["http://localhost:3000", "http://localhost:3001", "https://example.com"]
            assert settings.cors_origins == expected
    
    def test_boolean_environment_variables(self):
        """Test boolean environment variables are properly parsed"""
        with patch.dict(os.environ, {
            "DEBUG": "true",
            "ENABLE_AI_GENERATION": "false"
        }):
            settings = get_settings()
            assert settings.debug == True
            assert settings.enable_ai_generation == False
    
    def test_integer_environment_variables(self):
        """Test integer environment variables are properly parsed"""
        with patch.dict(os.environ, {
            "API_PORT": "9000",
            "RATE_LIMIT_MAX_REQUESTS": "200"
        }):
            settings = get_settings()
            assert settings.api_port == 9000
            assert settings.rate_limit_max_requests == 200