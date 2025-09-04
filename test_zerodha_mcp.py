#!/usr/bin/env python3
"""
Test Zerodha MCP Integration
Verify that the MCP server is working correctly
"""

import os
import json
from datetime import datetime

def test_zerodha_integration():
    """Test the Zerodha integration without MCP protocol"""
    
    print("🔄 Testing Zerodha MCP Integration...")
    print("=" * 60)
    
    # Import the integration
    from zerodha_mcp_integration import ZerodhaMCPIntegration
    
    # Check mode
    mode = os.getenv('ZERODHA_MODE', 'DEMO')
    
    if mode == 'DEMO':
        print("📊 Running in DEMO mode with simulated data")
        
        # Create demo instance
        zerodha = ZerodhaMCPIntegration()
        
        # Simulate market snapshot
        snapshot = {
            'timestamp': datetime.now().isoformat(),
            'indices': {
                'NIFTY': {
                    'last_price': 24712.80,
                    'change': 125.50,
                    'change_percent': 0.51,
                    'high': 24785.60,
                    'low': 24650.20,
                    'volume': 2850000000
                },
                'SENSEX': {
                    'last_price': 81234.15,
                    'change': 350.25,
                    'change_percent': 0.43,
                    'high': 81456.30,
                    'low': 81050.45,
                    'volume': 1950000000
                },
                'BANKNIFTY': {
                    'last_price': 51875.30,
                    'change': -125.60,
                    'change_percent': -0.24,
                    'high': 52150.00,
                    'low': 51750.00,
                    'volume': 850000000
                }
            },
            'stocks': {
                'RELIANCE': {'last_price': 2435.60},
                'TCS': {'last_price': 3245.80},
                'HDFCBANK': {'last_price': 1678.90},
                'INFY': {'last_price': 1345.20},
                'ICICIBANK': {'last_price': 967.45}
            },
            'market_status': 'open' if 9 <= datetime.now().hour < 16 else 'closed',
            'fii_dii': {
                'fii_equity': -2341.67,
                'dii_equity': 2890.34,
                'fii_debt': 456.78,
                'date': datetime.now().strftime('%Y-%m-%d')
            }
        }
        
    elif mode == 'YAHOO':
        print("📊 Fetching real data from Yahoo Finance...")
        
        from realtime_data_fetcher import RealtimeMarketData
        fetcher = RealtimeMarketData()
        yahoo_data = fetcher.fetch_yahoo_data()
        
        if yahoo_data:
            snapshot = {
                'timestamp': datetime.now().isoformat(),
                'indices': {},
                'stocks': {},
                'market_status': 'data_available'
            }
            
            # Map Yahoo data to our format
            if 'nifty' in yahoo_data:
                snapshot['indices']['NIFTY'] = {
                    'last_price': yahoo_data['nifty'].get('current'),
                    'change_percent': yahoo_data['nifty'].get('change'),
                    'high': yahoo_data['nifty'].get('high'),
                    'low': yahoo_data['nifty'].get('low'),
                    'volume': yahoo_data['nifty'].get('volume')
                }
            
            if 'top_stocks' in yahoo_data:
                for stock in yahoo_data['top_stocks']:
                    snapshot['stocks'][stock['symbol']] = {
                        'last_price': stock['price']
                    }
        else:
            print("⚠️  Could not fetch Yahoo data, using demo data")
            # Fall back to demo
            mode = 'DEMO'
    
    else:  # LIVE mode
        print("📊 Connecting to Zerodha Kite Connect...")
        
        api_key = os.getenv('KITE_API_KEY')
        api_secret = os.getenv('KITE_API_SECRET')
        access_token = os.getenv('KITE_ACCESS_TOKEN')
        
        if not all([api_key, api_secret, access_token]):
            print("❌ Missing Zerodha credentials!")
            print("Please run: python3 setup_zerodha_mcp.py")
            return
        
        zerodha = ZerodhaMCPIntegration(api_key, api_secret, access_token)
        
        try:
            snapshot = zerodha.get_market_snapshot()
        except Exception as e:
            print(f"❌ Failed to fetch live data: {e}")
            print("Falling back to demo mode...")
            mode = 'DEMO'
    
    # Display the snapshot
    print("\n📊 MARKET SNAPSHOT")
    print("=" * 60)
    
    if 'indices' in snapshot:
        print("\n📈 INDICES:")
        for idx, data in snapshot.get('indices', {}).items():
            if data:
                price = data.get('last_price', 'N/A')
                change = data.get('change_percent', 0)
                print(f"  {idx:12} : {price:>10} ({change:+.2f}%)")
    
    if 'stocks' in snapshot:
        print("\n📊 TOP STOCKS:")
        for stock, data in list(snapshot.get('stocks', {}).items())[:5]:
            if data:
                price = data.get('last_price', 'N/A')
                print(f"  {stock:12} : ₹{price}")
    
    if 'fii_dii' in snapshot:
        fii_dii = snapshot['fii_dii']
        print("\n💰 FII/DII Activity:")
        print(f"  FII Equity   : ₹{fii_dii.get('fii_equity', 0):>8.2f} Cr")
        print(f"  DII Equity   : ₹{fii_dii.get('dii_equity', 0):>8.2f} Cr")
    
    print("\n" + "=" * 60)
    
    # Test content generation
    if mode in ['DEMO', 'YAHOO']:
        zerodha = ZerodhaMCPIntegration()
        content = zerodha.generate_smart_content(snapshot)
        
        print("\n📝 GENERATED CONTENT:")
        print("=" * 60)
        print(content.get('content', 'No content generated'))
        print("\n" + "=" * 60)
        print(f"Quality Score: {content.get('quality_score', 0)}/10")
        print(f"Data Source: {mode}")
    
    print("\n✅ Test completed successfully!")
    
    if mode == 'DEMO':
        print("\n💡 To use real data:")
        print("  1. Get Zerodha Kite Connect subscription")
        print("  2. Run: python3 setup_zerodha_mcp.py")
        print("  3. Choose option 1 for LIVE data")
        print("\n  OR use option 3 for free Yahoo Finance data")


if __name__ == "__main__":
    test_zerodha_integration()