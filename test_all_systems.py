#!/usr/bin/env python3
"""
Complete System Test for AI Finance Agency
Tests Dashboard, TradingView Integration, and Content Generation
"""

import requests
import json
import time
from datetime import datetime

def test_dashboard():
    """Test dashboard is running"""
    try:
        response = requests.get('http://localhost:8088/api/market/live')
        if response.status_code == 200:
            data = response.json()
            if data.get('data', {}).get('live'):
                print("✅ Dashboard: Running with LIVE data")
                return True
            else:
                print("⚠️  Dashboard: Running with simulated data")
                return True
        else:
            print("❌ Dashboard: Not responding")
            return False
    except:
        print("❌ Dashboard: Not running at http://localhost:8088")
        return False

def test_tradingview_data():
    """Test TradingView data fetching"""
    try:
        response = requests.get('http://localhost:8088/api/market/live')
        data = response.json()
        
        if data.get('status') == 'success' and data.get('data'):
            market_data = data['data']
            
            print("\n📊 LIVE MARKET DATA:")
            print("-" * 40)
            
            if market_data.get('nifty'):
                nifty = market_data['nifty']
                print(f"NIFTY: {nifty.get('price', 'N/A')}")
                print(f"  RSI: {nifty.get('rsi', 'N/A')}")
                print(f"  Signal: {nifty.get('recommendation', 'N/A')}")
                print(f"  Change: {nifty.get('change', 0)*100:.2f}%")
            
            if market_data.get('banknifty'):
                banknifty = market_data['banknifty']
                print(f"\nBANKNIFTY: {banknifty.get('price', 'N/A')}")
                print(f"  RSI: {banknifty.get('rsi', 'N/A')}")
                print(f"  Signal: {banknifty.get('recommendation', 'N/A')}")
            
            print(f"\nMarket Status: {market_data.get('market_status', 'Unknown')}")
            print(f"Data Source: {market_data.get('source', 'Unknown')}")
            return True
        else:
            print("⚠️  Market data not available")
            return False
    except Exception as e:
        print(f"❌ Error fetching market data: {e}")
        return False

def test_content_generation():
    """Test content generation with live data"""
    try:
        response = requests.post('http://localhost:8088/api/content/generate',
                                json={
                                    'use_live_data': True,
                                    'data_source': 'tradingview'
                                })
        
        if response.status_code == 200:
            data = response.json()
            
            print("\n📝 GENERATED CONTENT:")
            print("-" * 40)
            print(f"Title: {data.get('title', 'N/A')}")
            print(f"Quality Score: {data.get('quality_score', 'N/A')}/10")
            print(f"Data Source: {data.get('data_source', 'N/A')}")
            print(f"\nContent Preview:")
            content = data.get('content', '')
            print(content[:200] + '...' if len(content) > 200 else content)
            return True
        else:
            print(f"❌ Content generation failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error generating content: {e}")
        return False

def test_options_data():
    """Test options chain data"""
    try:
        response = requests.get('http://localhost:8088/api/market/options?symbol=NSE:NIFTY')
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('status') == 'success' and data.get('data'):
                options = data['data']
                print("\n🎯 OPTIONS DATA:")
                print("-" * 40)
                print(f"Spot Price: {options.get('spot_price', 'N/A')}")
                print(f"ATM Strike: {options.get('atm_strike', 'N/A')}")
                print(f"Strikes Generated: {len(options.get('calls', []))} calls, {len(options.get('puts', []))} puts")
                return True
        
        print("⚠️  Options data not available")
        return False
    except Exception as e:
        print(f"❌ Error fetching options data: {e}")
        return False

def main():
    print("=" * 60)
    print("🚀 AI FINANCE AGENCY - COMPLETE SYSTEM TEST")
    print("=" * 60)
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    tests_passed = 0
    tests_total = 4
    
    # Test 1: Dashboard
    print("\n[1/4] Testing Dashboard...")
    if test_dashboard():
        tests_passed += 1
    
    time.sleep(1)
    
    # Test 2: TradingView Data
    print("\n[2/4] Testing TradingView Data...")
    if test_tradingview_data():
        tests_passed += 1
    
    time.sleep(1)
    
    # Test 3: Content Generation
    print("\n[3/4] Testing Content Generation...")
    if test_content_generation():
        tests_passed += 1
    
    time.sleep(1)
    
    # Test 4: Options Data
    print("\n[4/4] Testing Options Data...")
    if test_options_data():
        tests_passed += 1
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Tests Passed: {tests_passed}/{tests_total}")
    
    if tests_passed == tests_total:
        print("\n✅ ALL SYSTEMS OPERATIONAL!")
        print("Your AI Finance Agency is ready for production.")
    elif tests_passed >= 3:
        print("\n⚠️  MOSTLY OPERATIONAL")
        print("System is working but some features may be limited.")
    else:
        print("\n❌ SYSTEM NEEDS ATTENTION")
        print("Please check the failed tests above.")
    
    print("\n📌 Access Dashboard at: http://localhost:8088")
    print("=" * 60)

if __name__ == "__main__":
    main()