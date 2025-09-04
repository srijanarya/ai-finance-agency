#!/usr/bin/env python3
"""
Test Dashboard Functionality
Test the "Generate with Live Data" functionality to ensure it's working properly
"""

import requests
import json
import time
from datetime import datetime

def test_dashboard_api():
    """Test all dashboard API endpoints"""
    
    base_url = "http://localhost:5001"
    
    print("🚀 Testing AI Finance Agency Dashboard API")
    print("=" * 50)
    
    # Test 1: Kite Status
    print("1️⃣ Testing Kite MCP Status...")
    try:
        response = requests.get(f"{base_url}/api/kite/status")
        data = response.json()
        print(f"   ✅ Status: {data['status']}")
        print(f"   📊 Data Quality: {data['data_quality']}")
        if 'sample' in data:
            print(f"   📈 Sample NIFTY: {data['sample'].get('nifty')}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
    
    # Test 2: Get Ideas
    print("\n2️⃣ Testing Ideas API...")
    try:
        response = requests.get(f"{base_url}/api/ideas?limit=5")
        data = response.json()
        if data['status'] == 'success' and data['data']:
            print(f"   ✅ Found {len(data['data'])} ideas")
            for i, idea in enumerate(data['data'][:2]):
                print(f"   📝 Idea {i+1}: {idea['title'][:50]}...")
        else:
            print("   ⚠️ No ideas found")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
    
    # Test 3: Content Generation (the main issue we're fixing)
    print("\n3️⃣ Testing Content Generation (Generate with Live Data)...")
    try:
        # Get a content idea first
        ideas_response = requests.get(f"{base_url}/api/ideas?limit=1")
        ideas_data = ideas_response.json()
        
        if ideas_data['status'] == 'success' and ideas_data['data']:
            idea_id = ideas_data['data'][0]['id']
            print(f"   🎯 Using idea ID: {idea_id}")
            
            # Test content generation
            gen_payload = {
                "content_id": idea_id,
                "use_live_data": True
            }
            
            response = requests.post(
                f"{base_url}/api/content/generate",
                headers={"Content-Type": "application/json"},
                json=gen_payload
            )
            
            data = response.json()
            
            if data['status'] == 'success':
                print("   ✅ Content Generation SUCCESSFUL!")
                print(f"   📄 Title: {data['title'][:60]}...")
                print(f"   🏆 Quality Score: {data.get('quality_score', 'N/A')}/10")
                print(f"   📡 Data Source: {data.get('data_source', 'Unknown')}")
                print(f"   📅 Timestamp: {data.get('timestamp', 'N/A')}")
                print(f"   📝 Content Length: {len(data.get('content', ''))} chars")
                
                # Show first few lines of content
                content = data.get('content', '')
                if content:
                    lines = content.split('\n')[:3]
                    print("   📄 Content Preview:")
                    for line in lines:
                        if line.strip():
                            print(f"      {line.strip()}")
                
            else:
                print(f"   ❌ Content Generation Failed: {data.get('message', 'Unknown error')}")
                
        else:
            print("   ⚠️ No ideas available for testing")
            
    except Exception as e:
        print(f"   ❌ Failed: {e}")
    
    # Test 4: Dashboard Stats
    print("\n4️⃣ Testing Dashboard Stats...")
    try:
        response = requests.get(f"{base_url}/api/stats")
        data = response.json()
        if data['status'] == 'success':
            stats = data['data']
            print("   ✅ Dashboard Stats:")
            print(f"   📊 Total Ideas: {stats.get('total_ideas', 0)}")
            print(f"   ⏳ Pending Ideas: {stats.get('pending_ideas', 0)}")
            print(f"   ✅ Published Ideas: {stats.get('published_ideas', 0)}")
            print(f"   🎯 Avg Relevance: {stats.get('avg_relevance_24h', 0)}")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
    
    # Test 5: Keywords
    print("\n5️⃣ Testing Keywords API...")
    try:
        response = requests.get(f"{base_url}/api/keywords?limit=10")
        data = response.json()
        if data['status'] == 'success' and data['data']:
            print(f"   ✅ Found {len(data['data'])} trending keywords")
            for kw in data['data'][:5]:
                print(f"   🏷️ {kw['keyword']} (frequency: {kw['frequency']})")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Dashboard API Testing Complete!")
    print(f"⏰ Test completed at: {datetime.now().strftime('%H:%M:%S')}")


def test_content_generation_multiple():
    """Test content generation multiple times to ensure consistency"""
    
    print("\n🔄 Testing Multiple Content Generations...")
    print("-" * 40)
    
    base_url = "http://localhost:5001"
    
    for i in range(3):
        print(f"\n🎯 Generation #{i+1}:")
        try:
            gen_payload = {
                "use_live_data": True
            }
            
            response = requests.post(
                f"{base_url}/api/content/generate",
                headers={"Content-Type": "application/json"},
                json=gen_payload
            )
            
            data = response.json()
            
            if data['status'] == 'success':
                print(f"   ✅ Success - Quality: {data.get('quality_score', 'N/A')}/10")
                print(f"   📄 Title: {data['title'][:50]}...")
            else:
                print(f"   ❌ Failed: {data.get('message', 'Unknown')}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        time.sleep(1)  # Small delay between requests


if __name__ == "__main__":
    test_dashboard_api()
    test_content_generation_multiple()