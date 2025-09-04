#!/usr/bin/env python3
"""
Test Dashboard Functionality
"""

import requests
import json
from datetime import datetime

def test_dashboard():
    """Test all dashboard endpoints"""
    
    base_url = "http://localhost:5001"
    
    print("\n" + "="*60)
    print("🔍 DASHBOARD API TEST")
    print("="*60)
    
    # Test endpoints
    endpoints = [
        ("/api/stats", "GET", None),
        ("/api/ideas?limit=5", "GET", None),
        ("/api/topics?limit=5", "GET", None),
        ("/api/keywords?limit=10", "GET", None),
    ]
    
    all_success = True
    
    for endpoint, method, data in endpoints:
        url = base_url + endpoint
        print(f"\nTesting: {endpoint}")
        print("-"*40)
        
        try:
            if method == "GET":
                response = requests.get(url)
            else:
                response = requests.post(url, json=data)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('status') == 'success':
                    data_count = len(result.get('data', [])) if isinstance(result.get('data'), list) else 1
                    print(f"✅ SUCCESS - Status: {response.status_code}")
                    print(f"   Data items: {data_count}")
                    
                    # Show sample data
                    if isinstance(result.get('data'), list) and result['data']:
                        item = result['data'][0]
                        print(f"   Sample: {json.dumps(item, indent=2)[:200]}...")
                    elif isinstance(result.get('data'), dict):
                        print(f"   Data: {json.dumps(result['data'], indent=2)[:200]}...")
                else:
                    print(f"⚠️ API returned error: {result.get('message', 'Unknown error')}")
                    all_success = False
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                all_success = False
                
        except Exception as e:
            print(f"❌ Request failed: {str(e)}")
            all_success = False
    
    # Test dashboard page
    print("\n\nTesting Dashboard Page")
    print("-"*40)
    try:
        response = requests.get(base_url)
        if response.status_code == 200:
            print(f"✅ Dashboard page loads successfully")
            # Check for error messages in HTML
            if "Error loading" in response.text:
                print("⚠️ But contains error messages in HTML")
        else:
            print(f"❌ Dashboard page error: {response.status_code}")
            all_success = False
    except Exception as e:
        print(f"❌ Failed to load dashboard: {str(e)}")
        all_success = False
    
    # Summary
    print("\n" + "="*60)
    if all_success:
        print("✅ ALL TESTS PASSED - Dashboard is working correctly!")
    else:
        print("⚠️ SOME TESTS FAILED - Please review the errors above")
    print("="*60)
    
    return all_success

if __name__ == "__main__":
    test_dashboard()