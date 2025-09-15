"""
Secrets Management for Streamlit Cloud Deployment
Secure handling of API keys, environment variables, and sensitive configuration
"""

import streamlit as st
import os
from typing import Dict, Any, Optional, List
import logging
from dataclasses import dataclass
from enum import Enum
import json
import base64
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SecretType(Enum):
    API_KEY = "api_key"
    DATABASE_URL = "database_url"
    WEBHOOK_SECRET = "webhook_secret"
    JWT_SECRET = "jwt_secret"
    ENCRYPTION_KEY = "encryption_key"

@dataclass
class SecretConfig:
    name: str
    secret_type: SecretType
    required: bool = True
    environment_fallback: Optional[str] = None
    default_value: Optional[str] = None
    validation_pattern: Optional[str] = None
    description: str = ""

class SecretsManager:
    """
    Centralized secrets management for TalkingPhoto MVP
    Handles Streamlit Cloud secrets with fallbacks and validation
    """

    def __init__(self):
        self.secret_configs = self._initialize_secret_configs()
        self.cached_secrets = {}
        self._validate_critical_secrets()

    def _initialize_secret_configs(self) -> Dict[str, SecretConfig]:
        """Initialize configuration for all secrets"""
        return {
            # Video Generation APIs
            "heygen_api_key": SecretConfig(
                name="heygen_api_key",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="HEYGEN_API_KEY",
                description="HeyGen API key for video generation"
            ),
            "d_id_api_key": SecretConfig(
                name="d_id_api_key",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="D_ID_API_KEY",
                description="D-ID API key for video generation"
            ),
            "synthesia_api_key": SecretConfig(
                name="synthesia_api_key",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="SYNTHESIA_API_KEY",
                description="Synthesia API key for video generation"
            ),
            "luma_ai_api_key": SecretConfig(
                name="luma_ai_api_key",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="LUMA_AI_API_KEY",
                description="Luma AI API key for Veo3 integration"
            ),

            # Payment Processing
            "stripe_publishable_key": SecretConfig(
                name="stripe_publishable_key",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="STRIPE_PUBLISHABLE_KEY",
                validation_pattern=r"^pk_(test|live)_",
                description="Stripe publishable key"
            ),
            "stripe_secret_key": SecretConfig(
                name="stripe_secret_key",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="STRIPE_SECRET_KEY",
                validation_pattern=r"^sk_(test|live)_",
                description="Stripe secret key"
            ),
            "stripe_webhook_secret": SecretConfig(
                name="stripe_webhook_secret",
                secret_type=SecretType.WEBHOOK_SECRET,
                required=False,
                environment_fallback="STRIPE_WEBHOOK_SECRET",
                validation_pattern=r"^whsec_",
                description="Stripe webhook secret"
            ),
            "razorpay_key_id": SecretConfig(
                name="razorpay_key_id",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="RAZORPAY_KEY_ID",
                validation_pattern=r"^rzp_(test|live)_",
                description="Razorpay key ID"
            ),
            "razorpay_key_secret": SecretConfig(
                name="razorpay_key_secret",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="RAZORPAY_KEY_SECRET",
                description="Razorpay key secret"
            ),

            # Cloud Storage
            "cloudinary_cloud_name": SecretConfig(
                name="cloudinary_cloud_name",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="CLOUDINARY_CLOUD_NAME",
                description="Cloudinary cloud name"
            ),
            "cloudinary_api_key": SecretConfig(
                name="cloudinary_api_key",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="CLOUDINARY_API_KEY",
                description="Cloudinary API key"
            ),
            "cloudinary_api_secret": SecretConfig(
                name="cloudinary_api_secret",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="CLOUDINARY_API_SECRET",
                description="Cloudinary API secret"
            ),

            # AWS (Alternative storage)
            "aws_access_key_id": SecretConfig(
                name="aws_access_key_id",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="AWS_ACCESS_KEY_ID",
                description="AWS access key ID"
            ),
            "aws_secret_access_key": SecretConfig(
                name="aws_secret_access_key",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="AWS_SECRET_ACCESS_KEY",
                description="AWS secret access key"
            ),
            "aws_s3_bucket": SecretConfig(
                name="aws_s3_bucket",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="AWS_S3_BUCKET",
                default_value="talkingphoto-storage",
                description="AWS S3 bucket name"
            ),

            # Security & Authentication
            "jwt_secret_key": SecretConfig(
                name="jwt_secret_key",
                secret_type=SecretType.JWT_SECRET,
                required=True,
                environment_fallback="JWT_SECRET_KEY",
                default_value=self._generate_jwt_secret(),
                description="JWT signing secret (min 32 characters)"
            ),

            # Analytics & Monitoring
            "google_analytics_id": SecretConfig(
                name="google_analytics_id",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="GOOGLE_ANALYTICS_ID",
                validation_pattern=r"^G-[A-Z0-9]{10}$",
                description="Google Analytics measurement ID"
            ),
            "mixpanel_token": SecretConfig(
                name="mixpanel_token",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="MIXPANEL_TOKEN",
                description="Mixpanel project token"
            ),
            "sentry_dsn": SecretConfig(
                name="sentry_dsn",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="SENTRY_DSN",
                description="Sentry DSN for error tracking"
            ),

            # Email Services
            "sendgrid_api_key": SecretConfig(
                name="sendgrid_api_key",
                secret_type=SecretType.API_KEY,
                required=False,
                environment_fallback="SENDGRID_API_KEY",
                validation_pattern=r"^SG\.",
                description="SendGrid API key"
            ),
        }

    def _generate_jwt_secret(self) -> str:
        """Generate a secure JWT secret"""
        import secrets
        return secrets.token_urlsafe(32)

    def _validate_critical_secrets(self):
        """Validate that critical secrets are available"""
        critical_secrets = [config for config in self.secret_configs.values() if config.required]

        missing_secrets = []
        for config in critical_secrets:
            value = self.get_secret(config.name)
            if not value:
                missing_secrets.append(config.name)

        if missing_secrets:
            logger.warning(f"Missing critical secrets: {missing_secrets}")
            # In production, you might want to handle this more strictly

    def get_secret(self, key: str, category: str = None) -> Optional[str]:
        """
        Get secret value with fallback mechanisms

        Priority order:
        1. Streamlit secrets (st.secrets)
        2. Environment variables
        3. Default values
        """

        # Check cache first
        cache_key = f"{category}.{key}" if category else key
        if cache_key in self.cached_secrets:
            return self.cached_secrets[cache_key]

        config = self.secret_configs.get(key)
        value = None

        try:
            # 1. Try Streamlit secrets
            if category:
                value = st.secrets.get(category, {}).get(key)
            else:
                # Try nested structure first
                for section_name, section in st.secrets.items():
                    if isinstance(section, dict) and key in section:
                        value = section[key]
                        break

                # Try direct key
                if not value:
                    value = st.secrets.get(key)

            # 2. Try environment variable fallback
            if not value and config and config.environment_fallback:
                value = os.getenv(config.environment_fallback)

            # 3. Use default value
            if not value and config and config.default_value:
                value = config.default_value

            # Validate the secret if pattern is provided
            if value and config and config.validation_pattern:
                import re
                if not re.match(config.validation_pattern, value):
                    logger.warning(f"Secret {key} doesn't match expected pattern")

            # Cache the value
            if value:
                self.cached_secrets[cache_key] = value

            return value

        except Exception as e:
            logger.error(f"Error getting secret {key}: {e}")
            return None

    def get_video_api_config(self) -> Dict[str, Dict[str, str]]:
        """Get configuration for all video generation APIs"""
        apis = {}

        # HeyGen
        heygen_key = self.get_secret("api_key", "heygen")
        if heygen_key:
            apis["heygen"] = {
                "api_key": heygen_key,
                "endpoint": st.secrets.get("heygen", {}).get("api_endpoint", "https://api.heygen.com/v1"),
                "priority": 1
            }

        # D-ID
        did_key = self.get_secret("api_key", "d_id")
        if did_key:
            apis["d_id"] = {
                "api_key": did_key,
                "endpoint": st.secrets.get("d_id", {}).get("api_endpoint", "https://api.d-id.com"),
                "priority": 2
            }

        # Synthesia
        synthesia_key = self.get_secret("api_key", "synthesia")
        if synthesia_key:
            apis["synthesia"] = {
                "api_key": synthesia_key,
                "endpoint": st.secrets.get("synthesia", {}).get("api_endpoint", "https://api.synthesia.io"),
                "priority": 3
            }

        # Luma AI (Veo3)
        luma_key = self.get_secret("api_key", "luma_ai")
        if luma_key:
            apis["luma_ai"] = {
                "api_key": luma_key,
                "endpoint": st.secrets.get("luma_ai", {}).get("api_endpoint", "https://api.luma-ai.com"),
                "priority": 0  # Highest priority for Veo3
            }

        return dict(sorted(apis.items(), key=lambda x: x[1]["priority"]))

    def get_payment_config(self) -> Dict[str, Dict[str, str]]:
        """Get payment processing configuration"""
        payment_config = {}

        # Stripe
        stripe_pub = self.get_secret("publishable_key", "stripe")
        stripe_sec = self.get_secret("secret_key", "stripe")
        if stripe_pub and stripe_sec:
            payment_config["stripe"] = {
                "publishable_key": stripe_pub,
                "secret_key": stripe_sec,
                "webhook_secret": self.get_secret("webhook_secret", "stripe"),
                "enabled": True
            }

        # Razorpay
        razorpay_id = self.get_secret("key_id", "razorpay")
        razorpay_secret = self.get_secret("key_secret", "razorpay")
        if razorpay_id and razorpay_secret:
            payment_config["razorpay"] = {
                "key_id": razorpay_id,
                "key_secret": razorpay_secret,
                "enabled": True
            }

        return payment_config

    def get_storage_config(self) -> Dict[str, Dict[str, str]]:
        """Get cloud storage configuration"""
        storage_config = {}

        # Cloudinary
        cloudinary_name = self.get_secret("cloud_name", "cloudinary")
        cloudinary_key = self.get_secret("api_key", "cloudinary")
        cloudinary_secret = self.get_secret("api_secret", "cloudinary")

        if cloudinary_name and cloudinary_key and cloudinary_secret:
            storage_config["cloudinary"] = {
                "cloud_name": cloudinary_name,
                "api_key": cloudinary_key,
                "api_secret": cloudinary_secret,
                "enabled": True,
                "priority": 1
            }

        # AWS S3
        aws_key = self.get_secret("access_key_id", "aws")
        aws_secret = self.get_secret("secret_access_key", "aws")
        aws_bucket = self.get_secret("s3_bucket", "aws") or "talkingphoto-storage"

        if aws_key and aws_secret:
            storage_config["aws"] = {
                "access_key_id": aws_key,
                "secret_access_key": aws_secret,
                "bucket": aws_bucket,
                "region": st.secrets.get("aws", {}).get("region", "us-east-1"),
                "enabled": True,
                "priority": 2
            }

        return storage_config

    def get_app_config(self) -> Dict[str, Any]:
        """Get general application configuration"""
        return {
            "environment": st.secrets.get("app", {}).get("environment", "production"),
            "debug": st.secrets.get("app", {}).get("debug", False),
            "log_level": st.secrets.get("app", {}).get("log_level", "INFO"),
            "max_concurrent_jobs": st.secrets.get("app", {}).get("max_concurrent_jobs", 3),
            "jwt_secret": self.get_secret("secret_key", "jwt"),
            "rate_limits": {
                "max_requests_per_hour": st.secrets.get("security", {}).get("max_requests_per_hour", 100),
                "max_video_generations_per_day": st.secrets.get("security", {}).get("max_video_generations_per_day", 10),
                "max_file_size_mb": st.secrets.get("security", {}).get("max_file_size_mb", 25)
            }
        }

    def get_feature_flags(self) -> Dict[str, bool]:
        """Get feature flag configuration"""
        features = st.secrets.get("features", {})
        return {
            "enable_payments": features.get("enable_payments", True),
            "enable_analytics": features.get("enable_analytics", True),
            "enable_caching": features.get("enable_caching", True),
            "enable_social_sharing": features.get("enable_social_sharing", True),
            "enable_advanced_options": features.get("enable_advanced_options", True),
            "enable_mobile_upload": features.get("enable_mobile_upload", True),
            "enable_veo3": features.get("enable_veo3", True),
            "enable_indian_payments": features.get("enable_indian_payments", True)
        }

    def validate_api_keys(self) -> Dict[str, bool]:
        """Validate API key formats and availability"""
        validation_results = {}

        for key, config in self.secret_configs.items():
            value = self.get_secret(key)
            is_valid = bool(value)

            # Additional validation for specific patterns
            if is_valid and config.validation_pattern:
                import re
                is_valid = bool(re.match(config.validation_pattern, value))

            validation_results[key] = is_valid

        return validation_results

    def get_secrets_status(self) -> Dict[str, Any]:
        """Get comprehensive secrets status for debugging"""
        status = {
            "total_secrets": len(self.secret_configs),
            "configured_secrets": 0,
            "missing_critical": [],
            "validation_errors": [],
            "last_check": datetime.now().isoformat()
        }

        validation_results = self.validate_api_keys()

        for key, config in self.secret_configs.items():
            is_configured = validation_results.get(key, False)

            if is_configured:
                status["configured_secrets"] += 1
            elif config.required:
                status["missing_critical"].append(key)

            if not validation_results.get(key, True):  # If validation failed
                status["validation_errors"].append(key)

        # Service availability
        status["services"] = {
            "video_apis": len(self.get_video_api_config()),
            "payment_providers": len(self.get_payment_config()),
            "storage_providers": len(self.get_storage_config())
        }

        return status

# Global instance
_secrets_manager = None

def get_secrets_manager() -> SecretsManager:
    """Get or create global secrets manager instance"""
    global _secrets_manager
    if _secrets_manager is None:
        _secrets_manager = SecretsManager()
    return _secrets_manager

# Convenience functions
def get_secret(key: str, category: str = None) -> Optional[str]:
    """Convenience function to get a secret"""
    return get_secrets_manager().get_secret(key, category)

def get_video_api_config() -> Dict[str, Dict[str, str]]:
    """Convenience function to get video API configuration"""
    return get_secrets_manager().get_video_api_config()

def get_payment_config() -> Dict[str, Dict[str, str]]:
    """Convenience function to get payment configuration"""
    return get_secrets_manager().get_payment_config()

def get_storage_config() -> Dict[str, Dict[str, str]]:
    """Convenience function to get storage configuration"""
    return get_secrets_manager().get_storage_config()

def get_app_config() -> Dict[str, Any]:
    """Convenience function to get app configuration"""
    return get_secrets_manager().get_app_config()

def get_feature_flags() -> Dict[str, bool]:
    """Convenience function to get feature flags"""
    return get_secrets_manager().get_feature_flags()

# Streamlit UI for secrets management (for development/debugging)
def render_secrets_dashboard():
    """Render secrets management dashboard"""
    st.title("🔐 Secrets Management Dashboard")

    secrets_manager = get_secrets_manager()

    # Secrets status overview
    status = secrets_manager.get_secrets_status()

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("Total Secrets", status["total_secrets"])

    with col2:
        st.metric("Configured", status["configured_secrets"])

    with col3:
        st.metric("Missing Critical", len(status["missing_critical"]))

    with col4:
        st.metric("Validation Errors", len(status["validation_errors"]))

    # Service availability
    st.subheader("🌐 Service Availability")

    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric("Video APIs", status["services"]["video_apis"])
        video_apis = secrets_manager.get_video_api_config()
        for api_name in video_apis.keys():
            st.success(f"✅ {api_name.replace('_', ' ').title()}")

    with col2:
        st.metric("Payment Providers", status["services"]["payment_providers"])
        payment_providers = secrets_manager.get_payment_config()
        for provider in payment_providers.keys():
            st.success(f"✅ {provider.title()}")

    with col3:
        st.metric("Storage Providers", status["services"]["storage_providers"])
        storage_providers = secrets_manager.get_storage_config()
        for provider in storage_providers.keys():
            st.success(f"✅ {provider.title()}")

    # Feature flags
    st.subheader("🚩 Feature Flags")
    flags = secrets_manager.get_feature_flags()

    cols = st.columns(3)
    for i, (flag, enabled) in enumerate(flags.items()):
        with cols[i % 3]:
            icon = "✅" if enabled else "❌"
            st.write(f"{icon} {flag.replace('_', ' ').title()}")

    # Issues and warnings
    if status["missing_critical"] or status["validation_errors"]:
        st.subheader("⚠️ Issues")

        if status["missing_critical"]:
            st.error(f"Missing critical secrets: {', '.join(status['missing_critical'])}")

        if status["validation_errors"]:
            st.warning(f"Validation errors: {', '.join(status['validation_errors'])}")

if __name__ == "__main__":
    st.set_page_config(
        page_title="Secrets Management",
        page_icon="🔐",
        layout="wide"
    )

    render_secrets_dashboard()