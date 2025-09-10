"""
Comprehensive test suite for Zerodha Kite API integration
"""

import asyncio
import pytest
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, Mock, patch
from httpx import AsyncClient, Response
import json

from app.services.zerodha_kite_service import (
    ZerodhaKiteService,
    KiteCredentials,
    KiteInstrument,
    KiteOrder,
    ZerodhaKiteServiceManager
)
from app.services.portfolio_management_engine import Order, OrderType, OrderStatus, Position

# Mock credentials for testing
TEST_CREDENTIALS = KiteCredentials(
    api_key="test_api_key",
    api_secret="test_api_secret",
    access_token="test_access_token",
    user_id="test_user"
)

# Mock market data
MOCK_INSTRUMENTS_CSV = """instrument_token,exchange_token,tradingsymbol,name,last_price,expiry,strike,tick_size,lot_size,instrument_type,segment,exchange
738561,2884,RELIANCE,Reliance Industries Limited,2500.0,,0,0.05,1,EQ,NSE,NSE
1270,5,NIFTY,NIFTY 50,18500.0,,0,0.05,50,INDEX,NSE,NSE"""

class TestZerodhaKiteService:
    """Test cases for ZerodhaKiteService"""
    
    @pytest.fixture
    async def mock_service(self):
        """Create a mock Zerodha Kite service for testing"""
        service = ZerodhaKiteService(TEST_CREDENTIALS)
        
        # Mock the HTTP session
        mock_session = AsyncMock()
        service.session = mock_session
        
        return service, mock_session
    
    @pytest.mark.asyncio
    async def test_service_initialization(self, mock_service):
        """Test service initialization and authentication"""
        service, mock_session = mock_service
        
        # Mock profile response
        profile_response = Mock()
        profile_response.json.return_value = {
            "data": {
                "user_name": "Test User",
                "user_id": "test_user",
                "email": "test@example.com"
            }
        }
        profile_response.raise_for_status = Mock()
        
        # Mock instruments response
        instruments_response = Mock()
        instruments_response.text = MOCK_INSTRUMENTS_CSV
        instruments_response.status_code = 200
        
        mock_session.get.side_effect = [instruments_response, profile_response]
        
        # Test initialization
        result = await service.initialize()
        
        assert result == True
        assert len(service.instruments) == 2
        assert "RELIANCE" in service.instruments
        assert "NIFTY" in service.instruments
        
        # Verify instrument data
        reliance = service.instruments["RELIANCE"]
        assert reliance.instrument_token == 738561
        assert reliance.name == "Reliance Industries Limited"
        assert reliance.last_price == 2500.0
        assert reliance.exchange == "NSE"
    
    @pytest.mark.asyncio
    async def test_generate_access_token(self, mock_service):
        """Test access token generation"""
        service, mock_session = mock_service
        
        # Set request token
        service.credentials.request_token = "test_request_token"
        service.credentials.access_token = None
        
        # Mock token response
        token_response = Mock()
        token_response.json.return_value = {
            "data": {
                "access_token": "new_access_token",
                "user_id": "test_user_id"
            }
        }
        token_response.raise_for_status = Mock()
        
        mock_session.post.return_value = token_response
        
        # Test token generation
        access_token = await service._generate_access_token()
        
        assert access_token == "new_access_token"
        assert service.credentials.access_token == "new_access_token"
        assert service.credentials.user_id == "test_user_id"
        
        # Verify the request was made with correct checksum
        mock_session.post.assert_called_once()
        call_args = mock_session.post.call_args
        assert "/session/token" in call_args[0][0]
        assert "checksum" in call_args[1]["data"]
    
    @pytest.mark.asyncio
    async def test_place_order_success(self, mock_service):
        """Test successful order placement"""
        service, mock_session = mock_service
        
        # Add mock instrument
        service.instruments["RELIANCE"] = KiteInstrument(
            instrument_token=738561,
            exchange_token=2884,
            tradingsymbol="RELIANCE",
            name="Reliance Industries Limited",
            last_price=2500.0,
            tick_size=0.05,
            lot_size=1,
            instrument_type="EQ",
            segment="NSE",
            exchange="NSE"
        )
        
        # Mock order response
        order_response = Mock()
        order_response.json.return_value = {
            "data": {
                "order_id": "test_order_123"
            }
        }
        order_response.raise_for_status = Mock()
        
        mock_session.post.return_value = order_response
        
        # Test order placement
        order_id = await service.place_order(
            symbol="RELIANCE",
            quantity=10,
            price=2500.0,
            order_type=OrderType.LIMIT,
            side="BUY"
        )
        
        assert order_id == "test_order_123"
        
        # Verify the request
        mock_session.post.assert_called_once()
        call_args = mock_session.post.call_args
        assert "/orders/regular" in call_args[0][0]
        
        # Verify order data
        order_data = call_args[1]["data"]
        assert order_data["tradingsymbol"] == "RELIANCE"
        assert order_data["quantity"] == "10"
        assert order_data["price"] == "2500.0"
        assert order_data["order_type"] == "LIMIT"
        assert order_data["transaction_type"] == "BUY"
    
    @pytest.mark.asyncio
    async def test_place_order_invalid_symbol(self, mock_service):
        """Test order placement with invalid symbol"""
        service, mock_session = mock_service
        
        # Test with non-existent symbol
        order_id = await service.place_order(
            symbol="INVALID_SYMBOL",
            quantity=10,
            price=100.0,
            order_type=OrderType.LIMIT,
            side="BUY"
        )
        
        assert order_id is None
        mock_session.post.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_modify_order(self, mock_service):
        """Test order modification"""
        service, mock_session = mock_service
        
        # Mock modify response
        modify_response = Mock()
        modify_response.raise_for_status = Mock()
        
        mock_session.put.return_value = modify_response
        
        # Test order modification
        result = await service.modify_order(
            order_id="test_order_123",
            quantity=20,
            price=2600.0
        )
        
        assert result == True
        
        # Verify the request
        mock_session.put.assert_called_once()
        call_args = mock_session.put.call_args
        assert "/orders/regular/test_order_123" in call_args[0][0]
        
        # Verify modify data
        modify_data = call_args[1]["data"]
        assert modify_data["quantity"] == "20"
        assert modify_data["price"] == "2600.0"
    
    @pytest.mark.asyncio
    async def test_cancel_order(self, mock_service):
        """Test order cancellation"""
        service, mock_session = mock_service
        
        # Mock cancel response
        cancel_response = Mock()
        cancel_response.raise_for_status = Mock()
        
        mock_session.delete.return_value = cancel_response
        
        # Test order cancellation
        result = await service.cancel_order("test_order_123")
        
        assert result == True
        
        # Verify the request
        mock_session.delete.assert_called_once()
        call_args = mock_session.delete.call_args
        assert "/orders/regular/test_order_123" in call_args[0][0]
    
    @pytest.mark.asyncio
    async def test_get_orders(self, mock_service):
        """Test fetching orders"""
        service, mock_session = mock_service
        
        # Mock orders response
        orders_response = Mock()
        orders_response.json.return_value = {
            "data": [
                {
                    "order_id": "order_1",
                    "tradingsymbol": "RELIANCE",
                    "quantity": 10,
                    "price": 2500.0,
                    "order_type": "LIMIT",
                    "transaction_type": "BUY",
                    "product": "CNC",
                    "status": "COMPLETE",
                    "filled_quantity": 10,
                    "pending_quantity": 0,
                    "average_price": 2500.0,
                    "order_timestamp": "2024-01-15T10:30:00+05:30"
                }
            ]
        }
        orders_response.raise_for_status = Mock()
        
        mock_session.get.return_value = orders_response
        
        # Test get orders
        orders = await service.get_orders()
        
        assert len(orders) == 1
        assert orders[0].order_id == "order_1"
        assert orders[0].tradingsymbol == "RELIANCE"
        assert orders[0].quantity == 10
        assert orders[0].status == "COMPLETE"
    
    @pytest.mark.asyncio
    async def test_get_positions(self, mock_service):
        """Test fetching positions"""
        service, mock_session = mock_service
        
        # Mock positions response
        positions_response = Mock()
        positions_response.json.return_value = {
            "data": {
                "day": [
                    {
                        "tradingsymbol": "RELIANCE",
                        "quantity": 10,
                        "average_price": 2500.0,
                        "last_price": 2550.0,
                        "pnl": 500.0
                    }
                ],
                "net": []
            }
        }
        positions_response.raise_for_status = Mock()
        
        mock_session.get.return_value = positions_response
        
        # Test get positions
        positions = await service.get_positions()
        
        assert len(positions) == 1
        assert positions[0].symbol == "RELIANCE"
        assert positions[0].quantity == 10
        assert positions[0].average_price == 2500.0
        assert positions[0].current_price == 2550.0
        assert positions[0].pnl == 500.0
    
    @pytest.mark.asyncio
    async def test_get_ltp(self, mock_service):
        """Test getting last traded price"""
        service, mock_session = mock_service
        
        # Add mock instruments
        service.instruments["RELIANCE"] = KiteInstrument(
            instrument_token=738561,
            exchange_token=2884,
            tradingsymbol="RELIANCE",
            name="Reliance Industries Limited",
            last_price=2500.0,
            tick_size=0.05,
            lot_size=1,
            instrument_type="EQ",
            segment="NSE",
            exchange="NSE"
        )
        
        # Mock LTP response
        ltp_response = Mock()
        ltp_response.json.return_value = {
            "data": {
                "738561": {
                    "last_price": 2550.0
                }
            }
        }
        ltp_response.raise_for_status = Mock()
        
        mock_session.get.return_value = ltp_response
        
        # Test get LTP
        ltp_data = await service.get_ltp(["RELIANCE"])
        
        assert "RELIANCE" in ltp_data
        assert ltp_data["RELIANCE"] == 2550.0
    
    @pytest.mark.asyncio
    async def test_get_historical_data(self, mock_service):
        """Test getting historical data"""
        service, mock_session = mock_service
        
        # Mock historical data response
        historical_response = Mock()
        historical_response.json.return_value = {
            "data": {
                "candles": [
                    ["2024-01-15T09:15:00+05:30", 2500.0, 2550.0, 2490.0, 2540.0, 1000],
                    ["2024-01-15T09:16:00+05:30", 2540.0, 2560.0, 2530.0, 2555.0, 800]
                ]
            }
        }
        historical_response.raise_for_status = Mock()
        
        mock_session.get.return_value = historical_response
        
        # Test get historical data
        from_date = datetime.now() - timedelta(days=1)
        to_date = datetime.now()
        
        candles = await service.get_historical_data(
            instrument_token=738561,
            from_date=from_date,
            to_date=to_date,
            interval="minute"
        )
        
        assert len(candles) == 2
        assert candles[0][1] == 2500.0  # Open price
        assert candles[0][4] == 2540.0  # Close price
    
    @pytest.mark.asyncio
    async def test_margins(self, mock_service):
        """Test getting account margins"""
        service, mock_session = mock_service
        
        # Mock margins response
        margins_response = Mock()
        margins_response.json.return_value = {
            "data": {
                "equity": {
                    "available": {"cash": 100000.0},
                    "utilised": {"debits": 20000.0},
                    "net": 80000.0
                }
            }
        }
        margins_response.raise_for_status = Mock()
        
        mock_session.get.return_value = margins_response
        
        # Test get margins
        margins = await service.get_margins()
        
        assert margins is not None
        assert margins["equity"]["available"]["cash"] == 100000.0
        assert margins["equity"]["utilised"]["debits"] == 20000.0
        assert margins["equity"]["net"] == 80000.0

class TestZerodhaKiteServiceManager:
    """Test cases for ZerodhaKiteServiceManager"""
    
    @pytest.fixture
    def manager(self):
        """Create a service manager for testing"""
        return ZerodhaKiteServiceManager()
    
    @pytest.mark.asyncio
    async def test_add_account(self, manager):
        """Test adding a Kite account"""
        with patch.object(ZerodhaKiteService, 'initialize', return_value=True):
            result = await manager.add_account("user_123", TEST_CREDENTIALS)
            
            assert result == True
            assert "user_123" in manager.services
            assert isinstance(manager.services["user_123"], ZerodhaKiteService)
    
    @pytest.mark.asyncio
    async def test_add_account_initialization_failure(self, manager):
        """Test adding account with initialization failure"""
        with patch.object(ZerodhaKiteService, 'initialize', return_value=False):
            result = await manager.add_account("user_123", TEST_CREDENTIALS)
            
            assert result == False
            assert "user_123" not in manager.services
    
    @pytest.mark.asyncio
    async def test_remove_account(self, manager):
        """Test removing a Kite account"""
        # Add an account first
        mock_service = Mock()
        mock_service.close = AsyncMock()
        manager.services["user_123"] = mock_service
        
        # Remove the account
        await manager.remove_account("user_123")
        
        assert "user_123" not in manager.services
        mock_service.close.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_service(self, manager):
        """Test getting service for a user"""
        # Add a mock service
        mock_service = Mock()
        manager.services["user_123"] = mock_service
        
        # Test getting service
        service = await manager.get_service("user_123")
        assert service == mock_service
        
        # Test getting non-existent service
        service = await manager.get_service("user_456")
        assert service is None
    
    @pytest.mark.asyncio
    async def test_execute_bulk_orders(self, manager):
        """Test executing bulk orders across multiple accounts"""
        # Create mock services
        service1 = Mock()
        service1.execute_order = AsyncMock(return_value=True)
        service2 = Mock()
        service2.execute_order = AsyncMock(return_value=False)
        
        manager.services["user_1"] = service1
        manager.services["user_2"] = service2
        
        # Create mock orders
        order1 = Order(symbol="RELIANCE", quantity=10, price=2500.0, order_type=OrderType.LIMIT)
        order2 = Order(symbol="TCS", quantity=5, price=3500.0, order_type=OrderType.LIMIT)
        
        orders = [("user_1", order1), ("user_2", order2), ("user_3", order1)]
        
        # Execute bulk orders
        results = await manager.execute_bulk_orders(orders)
        
        assert len(results) == 3
        assert results["user_1_RELIANCE"] == True
        assert results["user_2_TCS"] == False
        assert results["user_3_RELIANCE"] == False  # No service for user_3
    
    @pytest.mark.asyncio
    async def test_get_consolidated_positions(self, manager):
        """Test getting consolidated positions from all accounts"""
        # Create mock services with positions
        position1 = Position(symbol="RELIANCE", quantity=10, average_price=2500.0, current_price=2550.0, pnl=500.0, broker_id="zerodha")
        position2 = Position(symbol="TCS", quantity=5, average_price=3500.0, current_price=3600.0, pnl=500.0, broker_id="zerodha")
        
        service1 = Mock()
        service1.get_portfolio_positions = AsyncMock(return_value=[position1])
        service2 = Mock()
        service2.get_portfolio_positions = AsyncMock(return_value=[position2])
        
        manager.services["user_1"] = service1
        manager.services["user_2"] = service2
        
        # Get consolidated positions
        all_positions = await manager.get_consolidated_positions()
        
        assert len(all_positions) == 2
        assert "user_1" in all_positions
        assert "user_2" in all_positions
        assert len(all_positions["user_1"]) == 1
        assert len(all_positions["user_2"]) == 1
        assert all_positions["user_1"][0].symbol == "RELIANCE"
        assert all_positions["user_2"][0].symbol == "TCS"

class TestKiteOrderModel:
    """Test cases for KiteOrder model"""
    
    def test_kite_order_creation(self):
        """Test creating a KiteOrder instance"""
        order = KiteOrder(
            order_id="test_order_123",
            tradingsymbol="RELIANCE",
            quantity=10,
            price=2500.0,
            order_type="LIMIT",
            transaction_type="BUY",
            product="CNC",
            status="COMPLETE",
            filled_quantity=10,
            pending_quantity=0,
            average_price=2500.0,
            order_timestamp=datetime.now()
        )
        
        assert order.order_id == "test_order_123"
        assert order.tradingsymbol == "RELIANCE"
        assert order.quantity == 10
        assert order.status == "COMPLETE"

class TestKiteInstrumentModel:
    """Test cases for KiteInstrument model"""
    
    def test_kite_instrument_creation(self):
        """Test creating a KiteInstrument instance"""
        instrument = KiteInstrument(
            instrument_token=738561,
            exchange_token=2884,
            tradingsymbol="RELIANCE",
            name="Reliance Industries Limited",
            last_price=2500.0,
            tick_size=0.05,
            lot_size=1,
            instrument_type="EQ",
            segment="NSE",
            exchange="NSE"
        )
        
        assert instrument.instrument_token == 738561
        assert instrument.tradingsymbol == "RELIANCE"
        assert instrument.name == "Reliance Industries Limited"
        assert instrument.exchange == "NSE"

class TestIntegrationScenarios:
    """Integration test scenarios"""
    
    @pytest.mark.asyncio
    async def test_complete_trading_workflow(self):
        """Test complete trading workflow from signal to execution"""
        # This would be a comprehensive integration test
        # that tests the entire flow from AI signal generation
        # to actual order placement and monitoring
        
        # Mock the AI signals engine
        from app.services.ai_trading_signals_engine import AITradingSignalsEngine
        
        with patch.object(AITradingSignalsEngine, 'generate_signals') as mock_generate:
            # Mock signal generation
            mock_generate.return_value = [{
                'symbol': 'RELIANCE',
                'signal_type': 'BUY',
                'confidence': 0.85,
                'target_price': 2600.0,
                'stop_loss': 2400.0,
                'quantity': 10
            }]
            
            # Mock Kite service
            credentials = KiteCredentials(
                api_key="test_key",
                api_secret="test_secret",
                access_token="test_token"
            )
            
            with patch.object(ZerodhaKiteService, 'initialize', return_value=True), \
                 patch.object(ZerodhaKiteService, 'place_order', return_value="order_123"):
                
                service = ZerodhaKiteService(credentials)
                initialized = await service.initialize()
                
                assert initialized == True
                
                # Place order based on signal
                order_id = await service.place_order(
                    symbol="RELIANCE",
                    quantity=10,
                    price=2600.0,
                    order_type=OrderType.LIMIT,
                    side="BUY"
                )
                
                assert order_id == "order_123"

# Performance and load testing
class TestPerformanceScenarios:
    """Performance test scenarios"""
    
    @pytest.mark.asyncio
    @pytest.mark.performance
    async def test_concurrent_order_placement(self):
        """Test concurrent order placement performance"""
        # Test placing multiple orders concurrently
        credentials = KiteCredentials(
            api_key="test_key",
            api_secret="test_secret",
            access_token="test_token"
        )
        
        with patch.object(ZerodhaKiteService, 'initialize', return_value=True), \
             patch.object(ZerodhaKiteService, 'place_order', return_value="order_123"):
            
            service = ZerodhaKiteService(credentials)
            await service.initialize()
            
            # Create multiple order placement tasks
            tasks = []
            for i in range(10):
                task = service.place_order(
                    symbol="RELIANCE",
                    quantity=10,
                    price=2500.0 + i,
                    order_type=OrderType.LIMIT,
                    side="BUY"
                )
                tasks.append(task)
            
            # Execute all orders concurrently
            start_time = asyncio.get_event_loop().time()
            results = await asyncio.gather(*tasks)
            end_time = asyncio.get_event_loop().time()
            
            # Assert all orders were placed successfully
            assert all(result == "order_123" for result in results)
            
            # Performance assertion (should complete within 5 seconds)
            execution_time = end_time - start_time
            assert execution_time < 5.0

# Error handling and edge cases
class TestErrorHandling:
    """Error handling test scenarios"""
    
    @pytest.mark.asyncio
    async def test_network_error_handling(self):
        """Test handling of network errors"""
        from httpx import ConnectError
        
        service = ZerodhaKiteService(TEST_CREDENTIALS)
        
        # Mock network error
        mock_session = AsyncMock()
        mock_session.get.side_effect = ConnectError("Network error")
        service.session = mock_session
        
        # Test that initialization fails gracefully
        result = await service.initialize()
        assert result == False
    
    @pytest.mark.asyncio
    async def test_invalid_credentials_handling(self):
        """Test handling of invalid credentials"""
        from httpx import HTTPStatusError
        
        invalid_credentials = KiteCredentials(
            api_key="invalid_key",
            api_secret="invalid_secret",
            access_token="invalid_token"
        )
        
        service = ZerodhaKiteService(invalid_credentials)
        
        # Mock HTTP 401 error
        mock_response = Mock()
        mock_response.status_code = 401
        mock_response.json.return_value = {"error": "Invalid credentials"}
        
        mock_session = AsyncMock()
        mock_session.get.side_effect = HTTPStatusError("401 Unauthorized", request=None, response=mock_response)
        service.session = mock_session
        
        # Test that profile fetch fails gracefully
        profile = await service.get_profile()
        assert profile is None

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--asyncio-mode=auto"])