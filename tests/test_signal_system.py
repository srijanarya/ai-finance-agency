"""
Comprehensive Test Suite for TREUM Signal Generation & Distribution System
Tests all components of the premium signal service targeting ₹60-90 Cr revenue
"""

import pytest
import asyncio
import json
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from unittest.mock import Mock, patch, AsyncMock
from uuid import uuid4

import pandas as pd
import numpy as np
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db, Base
from app.services.ai_signal_generator import (
    AISignalEngine, SignalGenerationService, TechnicalIndicators,
    MarketDataFetcher, analyze_single_asset
)
from app.services.signal_distribution_service import (
    SignalDistributionService, WebSocketManager, NotificationService
)
from app.services.signal_scheduler import SignalSchedulerService
from database.models import (
    User, TradingSignal, SignalProvider, SignalSubscription,
    UserSignalPreferences, SignalAnalytics, SignalType, SignalPriority,
    SignalStatus, AssetClass, SubscriptionTier, SignalSource
)

# Test Database Setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_client():
    """FastAPI test client"""
    return TestClient(app)

@pytest.fixture
def sample_user(db_session):
    """Create a test user"""
    user = User(
        id=uuid4(),
        email="test@treum.in",
        first_name="Test",
        last_name="User",
        phone="+919876543210",
        status="active"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def sample_provider(db_session):
    """Create a test signal provider"""
    provider = SignalProvider(
        id=uuid4(),
        name="Test AI Engine",
        description="Test signal provider",
        provider_type="ai_model",
        accuracy_score=Decimal('0.8500'),
        total_signals=100,
        successful_signals=85,
        is_active=True,
        model_version="v1.0"
    )
    db_session.add(provider)
    db_session.commit()
    db_session.refresh(provider)
    return provider

@pytest.fixture
def sample_signal(db_session, sample_provider):
    """Create a test trading signal"""
    signal = TradingSignal(
        id=uuid4(),
        signal_id="TEST_RELIANCE_20240910_143022",
        provider_id=sample_provider.id,
        source=SignalSource.AI_MODEL,
        symbol="RELIANCE",
        exchange="NSE",
        asset_class=AssetClass.EQUITY,
        signal_type=SignalType.BUY,
        priority=SignalPriority.HIGH,
        confidence_score=Decimal('0.8500'),
        entry_price=Decimal('2450.00'),
        target_price=Decimal('2520.00'),
        stop_loss=Decimal('2380.00'),
        current_price=Decimal('2445.00'),
        risk_reward_ratio=Decimal('2.3333'),
        valid_until=datetime.now(timezone.utc) + timedelta(hours=4),
        status=SignalStatus.ACTIVE,
        min_subscription_tier=SubscriptionTier.PRO,
        technical_indicators={
            "rsi": 35.5,
            "macd": 12.5,
            "volume_ratio": 1.8
        },
        tags=["oversold", "momentum", "high_volume"]
    )
    db_session.add(signal)
    db_session.commit()
    db_session.refresh(signal)
    return signal

class TestTechnicalIndicators:
    """Test technical analysis calculations"""
    
    def test_rsi_calculation(self):
        """Test RSI calculation accuracy"""
        # Create sample price data with known RSI
        prices = np.array([44, 44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.85, 46.08, 45.89,
                          46.03, 46.83, 47.69, 46.49, 46.26, 47.09, 47.37, 47.20, 46.21, 46.80])
        
        rsi = TechnicalIndicators.calculate_rsi(prices, period=14)
        
        # RSI should be between 0 and 100
        assert 0 <= rsi <= 100
        
        # For this specific data, RSI should be around 66-67
        assert 65 <= rsi <= 68
    
    def test_macd_calculation(self):
        """Test MACD calculation"""
        prices = np.random.normal(100, 10, 50)  # 50 price points around 100
        
        macd, signal, histogram = TechnicalIndicators.calculate_macd(prices)
        
        # All values should be numbers
        assert isinstance(macd, float)
        assert isinstance(signal, float)
        assert isinstance(histogram, float)
        
        # Histogram should equal MACD - Signal
        assert abs(histogram - (macd - signal)) < 0.001
    
    def test_bollinger_bands(self):
        """Test Bollinger Bands calculation"""
        prices = np.array([100, 101, 99, 102, 98, 103, 97, 104, 96, 105,
                          95, 106, 94, 107, 93, 108, 92, 109, 91, 110])
        
        upper, middle, lower = TechnicalIndicators.calculate_bollinger_bands(prices)
        
        # Upper should be > Middle > Lower
        assert upper > middle > lower
        
        # Middle should be close to the mean
        expected_mean = np.mean(prices[-20:])
        assert abs(middle - expected_mean) < 0.1
    
    def test_support_resistance(self):
        """Test support and resistance calculation"""
        # Create price data with clear support/resistance
        prices = np.array([100, 102, 98, 103, 97, 104, 96, 105, 95, 106,
                          94, 107, 93, 108, 92, 109, 91, 110, 90, 111])
        
        support, resistance = TechnicalIndicators.calculate_support_resistance(prices)
        
        # Support should be lower than resistance
        assert support < resistance
        
        # Both should be reasonable values
        assert 80 <= support <= 120
        assert 80 <= resistance <= 120


class TestMarketDataFetcher:
    """Test market data fetching functionality"""
    
    @pytest.mark.asyncio
    async def test_stock_data_fetching(self):
        """Test stock data fetching with mock data"""
        fetcher = MarketDataFetcher()
        
        # Mock yfinance data
        mock_data = pd.DataFrame({
            'Open': [100, 101, 102],
            'High': [102, 103, 104],
            'Low': [99, 100, 101],
            'Close': [101, 102, 103],
            'Volume': [1000000, 1100000, 1200000]
        })
        
        with patch('yfinance.Ticker') as mock_ticker:
            mock_ticker.return_value.history.return_value = mock_data
            
            data = await fetcher.get_stock_data("RELIANCE")
            
            assert not data.empty
            assert 'Close' in data.columns
            assert len(data) == 3
    
    @pytest.mark.asyncio
    async def test_crypto_data_fetching(self):
        """Test crypto data fetching"""
        fetcher = MarketDataFetcher()
        
        mock_data = pd.DataFrame({
            'Open': [50000, 51000, 52000],
            'High': [51000, 52000, 53000],
            'Low': [49000, 50000, 51000],
            'Close': [50500, 51500, 52500],
            'Volume': [100, 110, 120]
        })
        
        with patch('yfinance.Ticker') as mock_ticker:
            mock_ticker.return_value.history.return_value = mock_data
            
            data = await fetcher.get_crypto_data("BTC-USD")
            
            assert not data.empty
            assert 'Close' in data.columns


class TestAISignalEngine:
    """Test AI signal generation engine"""
    
    @pytest.mark.asyncio
    async def test_asset_analysis(self):
        """Test complete asset analysis"""
        engine = AISignalEngine()
        
        # Mock market data
        mock_data = pd.DataFrame({
            'Close': [100, 101, 99, 102, 98, 103, 97, 104, 96, 105,
                     95, 106, 94, 107, 93, 108, 92, 109, 91, 110],
            'Volume': [1000000] * 20
        })
        
        with patch.object(engine.data_fetcher, 'get_stock_data', return_value=mock_data):
            analysis = await engine.analyze_asset("RELIANCE", AssetClass.EQUITY)
            
            assert analysis is not None
            assert 'symbol' in analysis
            assert 'current_price' in analysis
            assert 'rsi' in analysis
            assert 'macd' in analysis
            assert 'volume_ratio' in analysis
            
            # RSI should be valid
            assert 0 <= analysis['rsi'] <= 100
    
    def test_signal_score_generation(self):
        """Test signal score calculation"""
        engine = AISignalEngine()
        
        # Mock analysis data
        analysis = {
            'symbol': 'RELIANCE',
            'current_price': 2450.0,
            'rsi': 25.0,  # Oversold
            'macd': 12.5,
            'macd_signal': 10.0,
            'macd_histogram': 2.5,
            'bb_position': 0.1,  # Near lower band
            'volume_ratio': 2.0,  # High volume
            'price_change_pct': 3.5,  # Strong positive momentum
            'support': 2400.0,
            'resistance': 2500.0
        }
        
        confidence, signal_type, reasoning = engine.generate_signal_score(analysis)
        
        # Should generate a BUY signal with good confidence
        assert signal_type == SignalType.BUY
        assert confidence > 0.5
        assert isinstance(reasoning, str)
        assert len(reasoning) > 0
    
    def test_price_targets_calculation(self):
        """Test price target calculation"""
        engine = AISignalEngine()
        
        analysis = {
            'current_price': 2450.0,
            'support': 2400.0,
            'resistance': 2500.0
        }
        
        entry, target, stop = engine.calculate_price_targets(analysis, SignalType.BUY)
        
        assert entry is not None
        assert target is not None
        assert stop is not None
        
        # For BUY signal: target > entry > stop
        assert target > entry > stop


class TestSignalGenerationService:
    """Test complete signal generation service"""
    
    @pytest.mark.asyncio
    async def test_watchlist_signal_generation(self, db_session, sample_provider):
        """Test signal generation for watchlist"""
        service = SignalGenerationService()
        service.db = db_session
        
        watchlist = [
            {'symbol': 'RELIANCE', 'asset_class': 'equity', 'exchange': 'NSE'},
            {'symbol': 'TCS', 'asset_class': 'equity', 'exchange': 'NSE'}
        ]
        
        # Mock the AI engine analysis
        mock_analysis = {
            'symbol': 'RELIANCE',
            'current_price': 2450.0,
            'rsi': 35.0,
            'macd': 12.5,
            'macd_signal': 10.0,
            'macd_histogram': 2.5,
            'bb_position': 0.3,
            'volume_ratio': 1.8,
            'price_change_pct': 2.5,
            'support': 2400.0,
            'resistance': 2500.0,
            'volume': 1500000,
            'avg_volume': 1200000,
            'bb_upper': 2480.0,
            'bb_middle': 2450.0,
            'bb_lower': 2420.0
        }
        
        with patch.object(service.ai_engine, 'analyze_asset', return_value=mock_analysis):
            signals = await service.generate_signals_for_watchlist(watchlist)
            
            assert len(signals) > 0
            
            for signal in signals:
                assert 'symbol' in signal
                assert 'confidence_score' in signal
                assert 'signal_type' in signal
                assert signal['confidence_score'] >= 0.6  # Should be strong signal
    
    @pytest.mark.asyncio
    async def test_signal_database_save(self, db_session, sample_provider):
        """Test saving signal to database"""
        service = SignalGenerationService()
        service.db = db_session
        
        signal_data = {
            'symbol': 'RELIANCE',
            'exchange': 'NSE',
            'asset_class': AssetClass.EQUITY,
            'signal_type': SignalType.BUY,
            'priority': SignalPriority.HIGH,
            'confidence_score': 0.85,
            'entry_price': Decimal('2450.00'),
            'target_price': Decimal('2520.00'),
            'stop_loss': Decimal('2380.00'),
            'current_price': Decimal('2445.00'),
            'risk_reward_ratio': 2.33,
            'min_subscription_tier': SubscriptionTier.PRO,
            'technical_indicators': {'rsi': 35.5},
            'tags': ['oversold', 'momentum'],
            'reasoning': 'RSI oversold; MACD bullish'
        }
        
        saved_signal = await service.save_signal_to_db(signal_data, sample_provider.id)
        
        assert saved_signal is not None
        assert saved_signal.symbol == 'RELIANCE'
        assert saved_signal.signal_type == SignalType.BUY
        assert saved_signal.status == SignalStatus.ACTIVE
        
        # Verify in database
        db_signal = db_session.query(TradingSignal).filter(
            TradingSignal.id == saved_signal.id
        ).first()
        
        assert db_signal is not None
        assert db_signal.confidence_score == Decimal('0.85')


class TestSignalDistribution:
    """Test signal distribution system"""
    
    def test_websocket_manager(self):
        """Test WebSocket connection management"""
        manager = WebSocketManager()
        
        # Mock WebSocket
        mock_websocket = Mock()
        mock_websocket.accept = AsyncMock()
        
        # Test connection
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            loop.run_until_complete(
                manager.connect(mock_websocket, "user123", "pro")
            )
            
            assert "user123" in manager.active_connections
            assert manager.connection_metadata["user123"]["tier"] == "pro"
            
            # Test disconnection
            manager.disconnect("user123")
            assert "user123" not in manager.active_connections
            
        finally:
            loop.close()
    
    @pytest.mark.asyncio
    async def test_notification_service(self):
        """Test notification service"""
        service = NotificationService()
        
        signal_data = {
            "signal_id": "TEST_SIGNAL_001",
            "symbol": "RELIANCE",
            "signal_type": "buy",
            "notes": "Strong buy signal based on technical analysis",
            "priority": "high"
        }
        
        # Test push notification (should not fail)
        await service.send_push_notification("user123", signal_data)
        
        # Test email notification
        await service.send_email_notification("user123", "test@example.com", signal_data)
        
        # Test SMS notification
        await service.send_sms_notification("user123", "+919876543210", signal_data)
    
    @pytest.mark.asyncio
    async def test_signal_distribution_service(self, db_session, sample_signal, sample_user):
        """Test complete signal distribution"""
        service = SignalDistributionService()
        service.db = db_session
        
        # Mock WebSocket manager
        service.websocket_manager = Mock()
        service.websocket_manager.broadcast_signal = AsyncMock()
        
        # Mock notification service
        service.notification_service = Mock()
        service.notification_service.send_push_notification = AsyncMock()
        
        await service.distribute_signal(sample_signal)
        
        # Verify WebSocket broadcast was called
        service.websocket_manager.broadcast_signal.assert_called_once()
        
        # Verify notification was sent
        service.notification_service.send_push_notification.assert_called()


class TestSignalScheduler:
    """Test signal scheduling system"""
    
    def test_market_hours_detection(self):
        """Test market hours detection"""
        scheduler = SignalSchedulerService()
        
        # Test NSE hours (should work with current logic)
        is_open = scheduler.is_market_hours("NSE")
        assert isinstance(is_open, bool)
    
    def test_watchlist_generation(self):
        """Test watchlist generation"""
        scheduler = SignalSchedulerService()
        
        equity_watchlist = scheduler.get_active_watchlist("equity")
        crypto_watchlist = scheduler.get_active_watchlist("crypto")
        
        assert len(equity_watchlist) > 0
        assert len(crypto_watchlist) > 0
        
        # Check structure
        for asset in equity_watchlist:
            assert 'symbol' in asset
            assert 'asset_class' in asset
            assert 'exchange' in asset
            assert asset['asset_class'] == 'equity'


class TestSignalAPI:
    """Test Signal API endpoints"""
    
    def test_get_signals_endpoint(self, test_client, sample_signal, sample_user):
        """Test GET /signals endpoint"""
        # Mock authentication
        with patch('app.core.security.authenticate_request', return_value=sample_user):
            response = test_client.get("/api/v1/signals/signals")
            
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
    
    def test_signal_subscription_endpoint(self, test_client, sample_signal, sample_user):
        """Test signal subscription endpoint"""
        subscription_data = {
            "signal_id": str(sample_signal.id),
            "delivery_methods": ["push_notification", "email"],
            "is_auto_trade_enabled": False
        }
        
        with patch('app.core.security.authenticate_request', return_value=sample_user):
            response = test_client.post(
                "/api/v1/signals/signals/subscribe",
                json=subscription_data
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
    
    def test_signal_feedback_endpoint(self, test_client, sample_signal, sample_user, db_session):
        """Test signal feedback endpoint"""
        # Create subscription first
        subscription = SignalSubscription(
            user_id=sample_user.id,
            signal_id=sample_signal.id,
            subscription_tier=SubscriptionTier.PRO
        )
        db_session.add(subscription)
        db_session.commit()
        
        feedback_data = {
            "signal_id": str(sample_signal.id),
            "rating": 5,
            "feedback": "Excellent signal!",
            "execution_price": 2455.0,
            "is_executed": True
        }
        
        with patch('app.core.security.authenticate_request', return_value=sample_user):
            response = test_client.post(
                "/api/v1/signals/signals/feedback",
                json=feedback_data
            )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True


class TestSignalPerformance:
    """Test signal performance tracking"""
    
    def test_signal_execution_tracking(self, db_session, sample_signal):
        """Test signal execution tracking"""
        # Mark signal as executed
        sample_signal.mark_executed(Decimal('2455.00'))
        
        assert sample_signal.status == SignalStatus.EXECUTED
        assert sample_signal.actual_entry_price == Decimal('2455.00')
        assert sample_signal.executed_at is not None
    
    def test_performance_calculation(self, db_session, sample_signal):
        """Test performance calculation"""
        # Execute and exit signal
        sample_signal.mark_executed(Decimal('2455.00'))
        sample_signal.update_performance(Decimal('2520.00'))
        
        assert sample_signal.actual_exit_price == Decimal('2520.00')
        assert sample_signal.actual_return_percentage is not None
        assert sample_signal.actual_return_percentage > 0  # Profitable trade


class TestIntegration:
    """Integration tests for complete signal flow"""
    
    @pytest.mark.asyncio
    async def test_complete_signal_flow(self, db_session, sample_provider, sample_user):
        """Test complete signal generation and distribution flow"""
        # 1. Generate signals
        service = SignalGenerationService()
        service.db = db_session
        
        watchlist = [{'symbol': 'RELIANCE', 'asset_class': 'equity', 'exchange': 'NSE'}]
        
        # Mock analysis
        mock_analysis = {
            'symbol': 'RELIANCE',
            'current_price': 2450.0,
            'rsi': 35.0,
            'macd': 12.5,
            'macd_signal': 10.0,
            'macd_histogram': 2.5,
            'bb_position': 0.3,
            'volume_ratio': 1.8,
            'price_change_pct': 2.5,
            'support': 2400.0,
            'resistance': 2500.0,
            'volume': 1500000,
            'avg_volume': 1200000,
            'bb_upper': 2480.0,
            'bb_middle': 2450.0,
            'bb_lower': 2420.0
        }
        
        with patch.object(service.ai_engine, 'analyze_asset', return_value=mock_analysis):
            signals = await service.generate_signals_for_watchlist(watchlist)
            
            # 2. Save signal to database
            if signals:
                saved_signal = await service.save_signal_to_db(signals[0], sample_provider.id)
                
                assert saved_signal is not None
                
                # 3. Test distribution
                distribution_service = SignalDistributionService()
                distribution_service.db = db_session
                
                # Mock distribution components
                distribution_service.websocket_manager = Mock()
                distribution_service.websocket_manager.broadcast_signal = AsyncMock()
                distribution_service.notification_service = Mock()
                distribution_service.notification_service.send_push_notification = AsyncMock()
                
                await distribution_service.distribute_signal(saved_signal)
                
                # Verify distribution was attempted
                distribution_service.websocket_manager.broadcast_signal.assert_called_once()


# Performance and Load Tests

class TestPerformance:
    """Performance tests for signal system"""
    
    @pytest.mark.asyncio
    async def test_signal_generation_performance(self):
        """Test signal generation performance"""
        engine = AISignalEngine()
        
        # Mock fast data fetching
        mock_data = pd.DataFrame({
            'Close': np.random.normal(100, 10, 30),
            'Volume': np.random.normal(1000000, 100000, 30)
        })
        
        start_time = datetime.now()
        
        with patch.object(engine.data_fetcher, 'get_stock_data', return_value=mock_data):
            analysis = await engine.analyze_asset("RELIANCE", AssetClass.EQUITY)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Should complete within 1 second
        assert duration < 1.0
        assert analysis is not None
    
    def test_websocket_manager_capacity(self):
        """Test WebSocket manager with multiple connections"""
        manager = WebSocketManager()
        
        # Simulate 1000 connections
        for i in range(1000):
            user_id = f"user_{i}"
            manager.connection_metadata[user_id] = {
                "tier": "pro",
                "connected_at": datetime.now(timezone.utc),
                "signals_sent": 0
            }
        
        stats = manager.get_connection_stats()
        assert stats["total_connections"] == 1000


# Fixtures for running tests
@pytest.fixture(autouse=True)
def setup_test_environment():
    """Setup test environment"""
    # Ensure we're using test database
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "--tb=short"])