#!/usr/bin/env python3
"""
Debug Dashboard Issues
Comprehensive testing of all dashboard functionality
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = "http://localhost:5001"

def test_endpoint(endpoint, method="GET", data=None):
    """Test an endpoint and return status"""
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}")
        else:
            response = requests.post(f"{BASE_URL}{endpoint}", json=data)
        
        print(f"✅ {endpoint}: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                return True, data
            except:
                return True, response.text[:100]
        else:
            return False, response.text[:200]
    except Exception as e:
        print(f"❌ {endpoint}: {e}")
        return False, str(e)

def main():
    print("="*60)
    print("DASHBOARD DEBUGGING")
    print("="*60)
    
    # Test all endpoints
    print("\n1. Testing Basic Endpoints:")
    endpoints = [
        ("/api/stats", "GET", None),
        ("/api/ideas", "GET", None),
        ("/api/keywords", "GET", None),
        ("/api/topics", "GET", None),
        ("/api/kite/status", "GET", None),
    ]
    
    all_good = True
    for endpoint, method, data in endpoints:
        success, result = test_endpoint(endpoint, method, data)
        if not success:
            all_good = False
            print(f"  Error: {result}")
    
    print("\n2. Testing Content Generation:")
    
    # Test without Kite
    print("\n  Without Kite Data:")
    success, result = test_endpoint("/api/content/generate", "POST", {"use_live_data": False})
    if success and isinstance(result, dict):
        print(f"    Title: {result.get('title', 'N/A')[:50]}")
        print(f"    Quality: {result.get('quality_score', 'N/A')}/10")
        print(f"    Source: {result.get('data_source', 'N/A')}")
    
    # Test with Kite
    print("\n  With Kite Data:")
    success, result = test_endpoint("/api/content/generate", "POST", {"use_live_data": True})
    if success and isinstance(result, dict):
        print(f"    Title: {result.get('title', 'N/A')[:50]}")
        print(f"    Quality: {result.get('quality_score', 'N/A')}/10")
        print(f"    Source: {result.get('data_source', 'N/A')}")
    
    # Test with specific content_id
    print("\n  With Content ID:")
    success, result = test_endpoint("/api/content/generate", "POST", {"content_id": 100, "use_live_data": True})
    if success and isinstance(result, dict):
        print(f"    Title: {result.get('title', 'N/A')[:50]}")
        print(f"    Status: {result.get('status', 'N/A')}")
    
    print("\n3. Checking Dashboard HTML:")
    response = requests.get(f"{BASE_URL}/")
    if response.status_code == 200:
        html = response.text
        
        # Check for critical JavaScript functions
        checks = [
            ("generateContentForIdea function", "generateContentForIdea" in html),
            ("checkKiteStatus function", "checkKiteStatus" in html),
            ("displayGeneratedContent function", "displayGeneratedContent" in html),
            ("Kite status div", "kite-badge" in html),
            ("Generate button template", "Generate with Live Data" in html or "Generate Content" in html)
        ]
        
        for check_name, passed in checks:
            if passed:
                print(f"  ✅ {check_name}: Found")
            else:
                print(f"  ❌ {check_name}: Missing")
                all_good = False
    
    print("\n4. Testing Ideas with Generate Buttons:")
    success, ideas = test_endpoint("/api/ideas", "GET", None)
    if success and isinstance(ideas, dict) and 'data' in ideas:
        idea_count = len(ideas.get('data', []))
        print(f"  Found {idea_count} ideas")
        
        if idea_count > 0:
            first_idea = ideas['data'][0]
            print(f"  First idea: {first_idea.get('title', 'N/A')[:50]}")
            print(f"  ID: {first_idea.get('id', 'N/A')}")
    
    print("\n" + "="*60)
    if all_good:
        print("✅ ALL TESTS PASSED - Dashboard should be working!")
        print("\nTo use:")
        print("1. Go to http://localhost:5001")
        print("2. Look for ideas in the 'Content Ideas' section")
        print("3. Click any 'Generate with Live Data' button")
        print("4. A modal should appear with the generated content")
    else:
        print("⚠️  SOME TESTS FAILED - Check errors above")
        print("\nPossible issues:")
        print("1. Server not running properly")
        print("2. Database connection issues")
        print("3. Missing dependencies")
        print("\nTry restarting the server:")
        print("  pkill -f dashboard.py")
        print("  python3 dashboard.py")

if __name__ == "__main__":
    main()