"""
Comprehensive Test Suite for AI Trading Signals Engine
Integration tests for multi-AI model ensemble, backtesting, and API endpoints
Enterprise-grade validation for production deployment
"""

import asyncio
import pytest
import json
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, List, Any
from unittest.mock import Mock, patch, AsyncMock
import httpx

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.services.ai_trading_signals_engine import (
    ai_signals_engine, AIModelType, SignalConfidence,
    GPT4SignalModel, ClaudeSignalModel, CustomMLModel,
    MarketData
)
from app.services.market_data_pipeline import (
    market_data_pipeline, NSEDataProvider, MarketTick, DataSource
)
from app.services.backtesting_framework import (
    backtest_engine, BacktestEngine, MarketSimulator, BacktestOrder
)
from app.api.v1.endpoints.ai_signals import SignalRequest, SignalResponse
from database.models import User, TradingSignal
from tests.conftest import test_user, test_db

client = TestClient(app)

class TestAISignalsEngine:
    """Test suite for AI Trading Signals Engine"""
    
    @pytest.fixture
    async def mock_market_data(self):
        """Mock market data for testing"""
        return MarketData(
            symbol="RELIANCE",
            current_price=2500.50,
            change_24h=2.5,
            volume_24h=1000000,
            market_cap=1500000.0,
            high_52w=2800.0,
            low_52w=2000.0,
            pe_ratio=15.5,
            dividend_yield=1.2,
            beta=1.1,
            rsi_14=65.0,
            macd_signal="BULLISH",
            bollinger_position=75.0,
            volume_sma_ratio=1.2,
            price_sma_50=2450.0,
            price_sma_200=2400.0,
            support_levels=[2400.0, 2350.0, 2300.0],
            resistance_levels=[2600.0, 2650.0, 2700.0]
        )
    
    @pytest.mark.asyncio
    async def test_gpt4_signal_generation(self, mock_market_data):
        """Test GPT-4 signal generation with valid response"""
        
        with patch('openai.AsyncOpenAI') as mock_openai:
            # Mock OpenAI response
            mock_response = Mock()
            mock_response.choices[0].message.content = json.dumps({
                "signal": "BUY",
                "strength": 8,
                "target_price": 2650.0,
                "stop_loss": 2400.0,
                "time_horizon": "1w",
                "reasoning": "Strong technical breakout with high volume",
                "risk_factors": ["Market volatility", "Sector rotation"],
                "market_sentiment": "bullish",
                "technical_score": 85,
                "fundamental_score": 75,
                "probability": 80
            })
            mock_response.usage.total_tokens = 500
            
            mock_client = AsyncMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai.return_value = mock_client
            
            # Test signal generation
            gpt4_model = GPT4SignalModel()
            result = await gpt4_model.generate_signal(mock_market_data)
            
            # Assertions
            assert result["model"] == AIModelType.GPT4
            assert "analysis" in result
            assert result["analysis"]["signal"] == "BUY"
            assert result["confidence"] > 0.7  # Should be high confidence
            assert result["tokens_used"] == 500
            
            # Verify OpenAI API called correctly
            mock_client.chat.completions.create.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_claude_signal_generation(self, mock_market_data):
        """Test Claude signal generation with API response"""
        
        with patch('httpx.AsyncClient') as mock_client:
            # Mock Claude response
            mock_response = Mock()
            mock_response.json.return_value = {
                "content": [{
                    "text": json.dumps({
                        "signal": "HOLD",
                        "confidence": 70,
                        "target_price": 2550.0,
                        "stop_loss": 2450.0,
                        "reasoning": "Mixed signals, recommend waiting",
                        "risk_level": "MEDIUM",
                        "time_horizon": "1w"
                    })
                }],
                "usage": {"output_tokens": 300}
            }
            mock_response.raise_for_status = Mock()
            
            mock_http_client = AsyncMock()
            mock_http_client.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_http_client
            
            # Test signal generation
            claude_model = ClaudeSignalModel()
            claude_model.api_key = "test-key"  # Set test API key
            
            result = await claude_model.generate_signal(mock_market_data)
            
            # Assertions
            assert result["model"] == AIModelType.CLAUDE_3_SONNET
            assert result["analysis"]["signal"] == "HOLD"
            assert result["confidence"] == 0.7  # 70% confidence
            assert "error" not in result["analysis"]
    
    @pytest.mark.asyncio
    async def test_custom_ml_model(self, mock_market_data):
        """Test custom ML model signal generation"""
        
        ml_model = CustomMLModel()
        result = await ml_model.generate_signal(mock_market_data)
        
        # Assertions
        assert result["model"] == AIModelType.CUSTOM_LSTM
        assert "analysis" in result
        assert result["analysis"]["signal"] in ["BUY", "SELL", "HOLD"]
        assert 0 <= result["confidence"] <= 1
        assert "features_used" in result["analysis"]
    
    @pytest.mark.asyncio
    async def test_ensemble_signal_generation(self, mock_market_data):
        """Test multi-model ensemble signal generation"""
        
        with patch.object(ai_signals_engine, '_fetch_market_data') as mock_fetch:
            mock_fetch.return_value = mock_market_data
            
            # Mock individual model responses
            with patch.object(ai_signals_engine.models[AIModelType.GPT4], 'generate_signal') as mock_gpt4:
                with patch.object(ai_signals_engine.models[AIModelType.CLAUDE_3_SONNET], 'generate_signal') as mock_claude:
                    with patch.object(ai_signals_engine.models[AIModelType.CUSTOM_LSTM], 'generate_signal') as mock_ml:
                        
                        # Setup mock responses
                        mock_gpt4.return_value = {
                            "model": AIModelType.GPT4,
                            "analysis": {"signal": "BUY", "target_price": 2650},
                            "confidence": 0.8
                        }
                        
                        mock_claude.return_value = {
                            "model": AIModelType.CLAUDE_3_SONNET,
                            "analysis": {"signal": "BUY", "confidence": 75},
                            "confidence": 0.75
                        }
                        
                        mock_ml.return_value = {
                            "model": AIModelType.CUSTOM_LSTM,
                            "analysis": {"signal": "HOLD", "probability": 60},
                            "confidence": 0.6
                        }
                        
                        # Test ensemble generation
                        result = await ai_signals_engine.generate_ensemble_signal("RELIANCE")
                        
                        # Assertions
                        assert "signal_id" in result
                        assert result["symbol"] == "RELIANCE"
                        assert result["signal"] in ["BUY", "SELL", "HOLD"]
                        assert result["model_count"] == 3
                        assert result["confidence"] > 0
                        assert result["confidence_level"] in [conf.value for conf in SignalConfidence]
                        assert "model_results" in result
                        assert len(result["model_results"]) == 3
    
    @pytest.mark.asyncio
    async def test_signal_confidence_calculation(self):
        """Test signal confidence scoring algorithm"""
        
        gpt4_model = GPT4SignalModel()
        
        # High confidence analysis
        high_conf_analysis = {
            "technical_score": 90,
            "fundamental_score": 85,
            "probability": 88,
            "strength": 9,
            "risk_factors": ["Minor volatility"],
            "reasoning": "Strong technical breakout with excellent fundamentals and high probability setup based on multiple confluences"
        }
        
        confidence = gpt4_model.calculate_confidence(high_conf_analysis)
        assert confidence > 0.8, f"Expected high confidence > 0.8, got {confidence}"
        
        # Low confidence analysis
        low_conf_analysis = {
            "technical_score": 40,
            "fundamental_score": 35,
            "probability": 45,
            "strength": 3,
            "risk_factors": ["High volatility", "Market uncertainty", "Sector headwinds"],
            "reasoning": "Weak"
        }
        
        confidence = gpt4_model.calculate_confidence(low_conf_analysis)
        assert confidence < 0.5, f"Expected low confidence < 0.5, got {confidence}"
    
    @pytest.mark.asyncio
    async def test_rate_limiting(self):
        """Test API rate limiting functionality"""
        
        gpt4_model = GPT4SignalModel()
        
        start_time = datetime.now()
        
        # Make multiple requests to test rate limiting
        await gpt4_model._rate_limit("test_key")
        await gpt4_model._rate_limit("test_key")
        
        elapsed = (datetime.now() - start_time).total_seconds()
        
        # Should enforce minimum delay
        assert elapsed >= gpt4_model.rate_limit_delay

class TestMarketDataPipeline:
    """Test suite for Market Data Pipeline"""
    
    @pytest.mark.asyncio
    async def test_nse_quote_fetch(self):
        """Test NSE quote fetching"""
        
        with patch('httpx.AsyncClient') as mock_client:
            # Mock NSE response
            mock_response = Mock()
            mock_response.json.return_value = {
                "data": {
                    "priceInfo": {
                        "lastPrice": 2500.50,
                        "totalTradedVolume": 1000000,
                        "bidprice": 2500.0,
                        "askprice": 2501.0,
                        "intraDayHighLow": {"max": 2520.0, "min": 2480.0},
                        "open": 2495.0,
                        "previousClose": 2440.0,
                        "change": 60.50,
                        "pChange": 2.48
                    }
                }
            }
            mock_response.raise_for_status = Mock()
            
            mock_session = AsyncMock()
            mock_session.get.return_value = mock_response
            mock_client.return_value = mock_session
            
            # Test NSE provider
            nse_provider = NSEDataProvider()
            nse_provider.session = mock_session
            
            tick = await nse_provider.get_quote("RELIANCE")
            
            # Assertions
            assert tick is not None
            assert tick.symbol == "RELIANCE"
            assert tick.price == Decimal('2500.50')
            assert tick.volume == 1000000
            assert tick.exchange == "NSE"
            assert tick.data_source == DataSource.NSE
    
    @pytest.mark.asyncio
    async def test_market_data_caching(self):
        """Test market data caching mechanism"""
        
        with patch.object(market_data_pipeline, 'redis_client') as mock_redis:
            # First call - cache miss
            mock_redis.get.return_value = None
            mock_redis.setex = AsyncMock()
            
            with patch.object(market_data_pipeline.providers[DataSource.NSE], 'get_quote') as mock_quote:
                mock_tick = MarketTick(
                    symbol="TEST",
                    timestamp=datetime.now(),
                    price=Decimal('100.0'),
                    volume=1000,
                    exchange="NSE",
                    data_source=DataSource.NSE
                )
                mock_quote.return_value = mock_tick
                
                # Initialize pipeline
                await market_data_pipeline.initialize()
                
                # First call should fetch from provider and cache
                result = await market_data_pipeline.get_realtime_quote("TEST")
                
                assert result is not None
                mock_quote.assert_called_once()
                mock_redis.setex.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_batch_quote_processing(self):
        """Test batch quote processing for multiple symbols"""
        
        symbols = ["RELIANCE", "TCS", "INFY", "HDFC", "ITC"]
        
        with patch.object(market_data_pipeline, 'get_realtime_quote') as mock_quote:
            # Mock individual quote responses
            mock_quote.side_effect = [
                MarketTick(symbol=symbol, timestamp=datetime.now(), price=Decimal('100.0'), 
                          volume=1000, exchange="NSE", data_source=DataSource.NSE)
                for symbol in symbols
            ]
            
            # Test batch processing
            results = await market_data_pipeline.get_batch_quotes(symbols)
            
            # Assertions
            assert len(results) == 5
            assert all(symbol in results for symbol in symbols)
            assert mock_quote.call_count == 5

class TestBacktestingFramework:
    """Test suite for Backtesting Framework"""
    
    @pytest.fixture
    def sample_orders(self):
        """Sample orders for testing"""
        return [
            BacktestOrder(
                id="order1",
                symbol="RELIANCE",
                side="BUY",
                quantity=100,
                order_type="MARKET",
                timestamp=datetime.now()
            ),
            BacktestOrder(
                id="order2",
                symbol="RELIANCE",
                side="SELL",
                quantity=100,
                order_type="MARKET",
                timestamp=datetime.now() + timedelta(days=5)
            )
        ]
    
    def test_market_simulator_fill_calculation(self):
        """Test market simulator fill price calculations"""
        
        simulator = MarketSimulator()
        
        # Test market order
        order = BacktestOrder(
            id="test",
            symbol="TEST",
            side="BUY",
            quantity=1000,
            order_type="MARKET"
        )
        
        market_price = Decimal('100.0')
        volume = 100000
        
        fill_price, commission = simulator.calculate_fill_price(order, market_price, volume)
        
        # Assertions
        assert fill_price > market_price  # Buy order should have positive slippage
        assert commission > 0
        assert commission >= simulator.min_commission
    
    @pytest.mark.asyncio
    async def test_backtest_execution(self):
        """Test complete backtest execution"""
        
        engine = BacktestEngine(initial_capital=Decimal('1000000'))
        
        # Mock historical data and signals
        with patch.object(engine, '_get_historical_data') as mock_data:
            with patch.object(ai_signals_engine, 'generate_ensemble_signal') as mock_signal:
                
                # Setup mocks
                mock_data.return_value = {
                    "TEST": {
                        "open": 95.0, "high": 105.0, "low": 90.0,
                        "close": 100.0, "volume": 100000,
                        "timestamp": datetime.now()
                    }
                }
                
                mock_signal.return_value = {
                    "signal_id": "test-signal",
                    "signal": "BUY",
                    "confidence": 0.8,
                    "target_price": 110.0,
                    "stop_loss": 95.0
                }
                
                # Run backtest
                start_date = datetime.now() - timedelta(days=30)
                end_date = datetime.now() - timedelta(days=1)
                
                metrics = await engine.run_backtest(
                    symbols=["TEST"],
                    start_date=start_date,
                    end_date=end_date
                )
                
                # Assertions
                assert metrics is not None
                assert hasattr(metrics, 'total_return')
                assert hasattr(metrics, 'sharpe_ratio')
                assert hasattr(metrics, 'max_drawdown')
                assert hasattr(metrics, 'win_rate')
    
    def test_position_size_calculation(self):
        """Test position size calculation logic"""
        
        engine = BacktestEngine(initial_capital=Decimal('1000000'))
        
        # High confidence signal
        high_conf_size = engine._calculate_position_size(0.9, "TEST")
        
        # Low confidence signal
        low_conf_size = engine._calculate_position_size(0.4, "TEST")
        
        # Assertions
        assert high_conf_size > low_conf_size
        assert high_conf_size > 0
        assert low_conf_size >= 0

class TestAISignalsAPI:
    """Test suite for AI Signals API endpoints"""
    
    @pytest.fixture
    def auth_headers(self, test_user):
        """Authentication headers for API testing"""
        # Mock JWT token for testing
        return {"Authorization": "Bearer test-token"}
    
    def test_generate_signal_endpoint(self, auth_headers):
        """Test signal generation API endpoint"""
        
        with patch('app.core.auth.get_current_user') as mock_auth:
            mock_auth.return_value = Mock(id="test-user-id", email="test@example.com")
            
            with patch.object(ai_signals_engine, 'generate_ensemble_signal') as mock_generate:
                mock_generate.return_value = {
                    "signal_id": "test-signal-123",
                    "symbol": "RELIANCE",
                    "signal": "BUY",
                    "confidence": 0.85,
                    "confidence_level": "high",
                    "target_price": 2650.0,
                    "stop_loss": 2400.0,
                    "current_price": 2500.50,
                    "model_count": 3,
                    "signal_strength": 0.8,
                    "market_sentiment": "bullish",
                    "risk_level": "medium",
                    "expires_at": (datetime.now() + timedelta(hours=24)).isoformat(),
                    "timestamp": datetime.now().isoformat(),
                    "model_results": {}
                }
                
                # Test API call
                response = client.post(
                    "/api/v1/ai-signals/generate",
                    json={"symbol": "RELIANCE"},
                    headers=auth_headers
                )
                
                # Assertions
                assert response.status_code == 200
                data = response.json()
                assert data["symbol"] == "RELIANCE"
                assert data["signal"] == "BUY"
                assert data["confidence"] == 0.85
    
    def test_batch_signals_endpoint(self, auth_headers):
        """Test batch signal generation endpoint"""
        
        symbols = ["RELIANCE", "TCS", "INFY"]
        
        with patch('app.core.auth.get_current_user') as mock_auth:
            mock_auth.return_value = Mock(id="test-user-id")
            
            with patch.object(ai_signals_engine, 'generate_ensemble_signal') as mock_generate:
                # Mock successful responses
                mock_generate.return_value = {
                    "signal_id": "test-signal",
                    "signal": "BUY",
                    "confidence": 0.8
                }
                
                # Test API call
                response = client.post(
                    f"/api/v1/ai-signals/batch-generate?symbols={','.join(symbols)}",
                    headers=auth_headers
                )
                
                # Assertions
                assert response.status_code == 200
                data = response.json()
                assert data["total_symbols"] == 3
                assert "results" in data
                assert len(data["results"]) == 3
    
    def test_signal_history_endpoint(self, auth_headers):
        """Test signal history retrieval endpoint"""
        
        with patch('app.core.auth.get_current_user') as mock_auth:
            mock_auth.return_value = Mock(id="test-user-id")
            
            with patch('app.api.v1.endpoints.ai_signals.get_db') as mock_db:
                # Mock database query
                mock_db.return_value.query.return_value.filter.return_value.order_by.return_value.limit.return_value.all.return_value = []
                
                # Test API call
                response = client.get(
                    "/api/v1/ai-signals/history?symbol=RELIANCE&limit=10",
                    headers=auth_headers
                )
                
                # Assertions
                assert response.status_code == 200
                data = response.json()
                assert isinstance(data, list)
    
    def test_model_status_endpoint(self, auth_headers):
        """Test AI model status endpoint"""
        
        with patch('app.core.auth.get_current_user') as mock_auth:
            mock_auth.return_value = Mock(id="test-user-id")
            
            # Test API call
            response = client.get(
                "/api/v1/ai-signals/models/status",
                headers=auth_headers
            )
            
            # Assertions
            assert response.status_code == 200
            data = response.json()
            assert "ensemble_status" in data
            assert "total_models" in data
            assert "models" in data

class TestIntegrationScenarios:
    """Integration tests for complete workflows"""
    
    @pytest.mark.asyncio
    async def test_end_to_end_signal_workflow(self):
        """Test complete signal generation to backtesting workflow"""
        
        # Step 1: Generate signal
        with patch.object(ai_signals_engine, '_fetch_market_data') as mock_market:
            mock_market.return_value = MarketData(
                symbol="RELIANCE",
                current_price=2500.0,
                change_24h=1.5,
                volume_24h=1000000,
                market_cap=1500000.0,
                high_52w=2800.0,
                low_52w=2000.0,
                pe_ratio=15.0,
                dividend_yield=1.0,
                beta=1.0,
                rsi_14=60.0,
                macd_signal="BULLISH",
                bollinger_position=60.0,
                volume_sma_ratio=1.0,
                price_sma_50=2450.0,
                price_sma_200=2400.0,
                support_levels=[2400.0],
                resistance_levels=[2600.0]
            )
            
            # Mock model responses
            with patch.object(ai_signals_engine.models[AIModelType.GPT4], 'generate_signal') as mock_gpt4:
                mock_gpt4.return_value = {
                    "model": AIModelType.GPT4,
                    "analysis": {"signal": "BUY", "target_price": 2650, "stop_loss": 2400},
                    "confidence": 0.8
                }
                
                # Generate signal
                signal = await ai_signals_engine.generate_ensemble_signal("RELIANCE")
                assert signal["signal"] == "BUY"
                
                # Step 2: Use signal in backtest
                engine = BacktestEngine()
                
                # Mock backtest execution
                with patch.object(engine, '_get_historical_data') as mock_hist:
                    mock_hist.return_value = {
                        "RELIANCE": {
                            "open": 2495.0, "high": 2520.0, "low": 2480.0,
                            "close": 2500.0, "volume": 1000000,
                            "timestamp": datetime.now()
                        }
                    }
                    
                    # Process signal
                    await engine._process_signal(
                        "RELIANCE", 
                        signal, 
                        mock_hist.return_value["RELIANCE"],
                        datetime.now()
                    )
                    
                    # Verify order created
                    assert len(engine.orders) > 0
                    order = list(engine.orders.values())[0]
                    assert order.symbol == "RELIANCE"
                    assert order.side == "BUY"
    
    @pytest.mark.asyncio
    async def test_high_frequency_signal_generation(self):
        """Test system performance under high-frequency signal requests"""
        
        symbols = [f"STOCK{i}" for i in range(100)]  # 100 symbols
        
        with patch.object(ai_signals_engine, '_fetch_market_data') as mock_market:
            mock_market.return_value = MarketData(
                symbol="TEST",
                current_price=100.0,
                change_24h=0.5,
                volume_24h=100000,
                market_cap=1000000.0,
                high_52w=120.0,
                low_52w=80.0,
                pe_ratio=20.0,
                dividend_yield=2.0,
                beta=1.2,
                rsi_14=50.0,
                macd_signal="NEUTRAL",
                bollinger_position=50.0,
                volume_sma_ratio=1.0,
                price_sma_50=95.0,
                price_sma_200=90.0,
                support_levels=[90.0],
                resistance_levels=[110.0]
            )
            
            with patch.object(ai_signals_engine.models[AIModelType.CUSTOM_LSTM], 'generate_signal') as mock_ml:
                mock_ml.return_value = {
                    "model": AIModelType.CUSTOM_LSTM,
                    "analysis": {"signal": "HOLD", "confidence": 60},
                    "confidence": 0.6
                }
                
                # Generate signals for all symbols concurrently
                tasks = []
                for symbol in symbols:
                    task = ai_signals_engine.generate_ensemble_signal(symbol, models=[AIModelType.CUSTOM_LSTM])
                    tasks.append(task)
                
                # Execute all tasks
                results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Verify results
                successful_results = [r for r in results if not isinstance(r, Exception)]
                assert len(successful_results) > 90  # At least 90% success rate

# Performance benchmarks
class TestPerformanceBenchmarks:
    """Performance benchmarking tests"""
    
    @pytest.mark.asyncio
    async def test_signal_generation_latency(self):
        """Test signal generation latency requirements"""
        
        with patch.object(ai_signals_engine, '_fetch_market_data') as mock_market:
            mock_market.return_value = MarketData(
                symbol="BENCHMARK",
                current_price=1000.0,
                change_24h=1.0,
                volume_24h=500000,
                market_cap=10000000.0,
                high_52w=1200.0,
                low_52w=800.0,
                pe_ratio=18.0,
                dividend_yield=1.5,
                beta=0.9,
                rsi_14=55.0,
                macd_signal="BULLISH",
                bollinger_position=65.0,
                volume_sma_ratio=1.1,
                price_sma_50=980.0,
                price_sma_200=950.0,
                support_levels=[950.0, 920.0],
                resistance_levels=[1050.0, 1100.0]
            )
            
            with patch.object(ai_signals_engine.models[AIModelType.CUSTOM_LSTM], 'generate_signal') as mock_ml:
                mock_ml.return_value = {
                    "model": AIModelType.CUSTOM_LSTM,
                    "analysis": {"signal": "BUY", "probability": 75},
                    "confidence": 0.75
                }
                
                # Measure latency
                start_time = datetime.now()
                
                signal = await ai_signals_engine.generate_ensemble_signal(
                    "BENCHMARK",
                    models=[AIModelType.CUSTOM_LSTM]  # Use fastest model for benchmark
                )
                
                end_time = datetime.now()
                latency_ms = (end_time - start_time).total_seconds() * 1000
                
                # Assert latency requirements (< 500ms for single model)
                assert latency_ms < 500, f"Signal generation took {latency_ms}ms, expected < 500ms"
                assert signal is not None
    
    @pytest.mark.asyncio  
    async def test_market_data_throughput(self):
        """Test market data pipeline throughput"""
        
        # Test concurrent data fetching
        symbols = ["STOCK1", "STOCK2", "STOCK3", "STOCK4", "STOCK5"]
        
        with patch.object(market_data_pipeline, 'get_realtime_quote') as mock_quote:
            mock_quote.return_value = MarketTick(
                symbol="TEST",
                timestamp=datetime.now(),
                price=Decimal('100.0'),
                volume=1000,
                exchange="NSE", 
                data_source=DataSource.NSE
            )
            
            # Measure throughput
            start_time = datetime.now()
            
            results = await market_data_pipeline.get_batch_quotes(symbols)
            
            end_time = datetime.now()
            duration_ms = (end_time - start_time).total_seconds() * 1000
            
            # Assert throughput requirements
            throughput = len(symbols) / (duration_ms / 1000)  # quotes per second
            assert throughput > 10, f"Throughput {throughput} quotes/sec, expected > 10"
            assert len(results) == len(symbols)

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--asyncio-mode=auto"])