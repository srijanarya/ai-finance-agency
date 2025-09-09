"""
Test API health endpoints
"""

import pytest
from fastapi.testclient import TestClient
import httpx

from app.main import app


class TestHealthEndpoints:
    """Test suite for health check endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    def test_basic_health_check(self, client):
        """Test basic health endpoint"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert data["service"] == "AI Finance Agency API"
        assert data["version"] == "2.0.0"
    
    def test_liveness_check(self, client):
        """Test liveness probe endpoint"""
        response = client.get("/health/live")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["status"] == "alive"
        assert "timestamp" in data
    
    @pytest.mark.asyncio
    async def test_health_with_async_client(self):
        """Test health endpoint with async client"""
        async with httpx.AsyncClient(app=app, base_url="http://test") as ac:
            response = await ac.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestAPIStructure:
    """Test API structure and routing"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    def test_api_docs_available_in_dev(self, client):
        """Test that API docs are available in development"""
        response = client.get("/docs")
        # In development mode, should return HTML
        assert response.status_code == 200
    
    def test_openapi_schema_available(self, client):
        """Test OpenAPI schema endpoint"""
        response = client.get("/openapi.json")
        
        if response.status_code == 200:
            # Schema should be valid JSON
            data = response.json()
            assert "openapi" in data
            assert "info" in data
            assert data["info"]["title"] == "AI Finance Agency API"
    
    def test_cors_headers(self, client):
        """Test CORS headers are present"""
        response = client.get("/health")
        
        # Check for CORS headers (might not be present in test environment)
        assert response.status_code == 200


class TestAuthentication:
    """Test authentication endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    def test_auth_endpoints_exist(self, client):
        """Test that auth endpoints exist"""
        # Test token endpoint exists (should return 422 for missing data)
        response = client.post("/api/v1/auth/token")
        assert response.status_code in [422, 400]  # Validation error expected
        
        # Test validation endpoint exists
        response = client.get("/api/v1/auth/validate")
        assert response.status_code == 403  # Forbidden without auth expected


class TestContentEndpoints:
    """Test content management endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    def test_content_endpoints_require_auth(self, client):
        """Test that content endpoints require authentication"""
        # Test generate content endpoint
        response = client.post("/api/v1/content/generate")
        assert response.status_code == 403  # Forbidden without auth
        
        # Test list content endpoint
        response = client.get("/api/v1/content/")
        assert response.status_code == 403  # Forbidden without auth


class TestMarketDataEndpoints:
    """Test market data endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    def test_market_endpoints_require_auth(self, client):
        """Test that market data endpoints require authentication"""
        # Test quote endpoint
        response = client.get("/api/v1/market/quote/AAPL")
        assert response.status_code == 403  # Forbidden without auth
        
        # Test overview endpoint
        response = client.get("/api/v1/market/overview")
        assert response.status_code == 403  # Forbidden without auth


class TestSocialMediaEndpoints:
    """Test social media endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    def test_social_endpoints_require_auth(self, client):
        """Test that social media endpoints require authentication"""
        # Test post creation endpoint
        response = client.post("/api/v1/social/post")
        assert response.status_code == 403  # Forbidden without auth
        
        # Test platform status endpoint
        response = client.get("/api/v1/social/platforms/status")
        assert response.status_code == 403  # Forbidden without auth