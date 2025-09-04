#!/usr/bin/env python3
"""
Verify n8n Workflow Setup
"""

import requests
import json
from datetime import datetime

def verify_setup():
    print("🔍 VERIFYING N8N WORKFLOW SETUP")
    print("=" * 50)
    
    checks = {
        "n8n_running": False,
        "webhook_server": False,
        "workflow_imported": "unknown"
    }
    
    # Check 1: n8n is running
    try:
        response = requests.get("http://localhost:5678", timeout=2)
        if response.status_code == 200:
            checks["n8n_running"] = True
            print("✅ n8n is running at http://localhost:5678")
        else:
            print("⚠️  n8n returned status:", response.status_code)
    except:
        print("❌ n8n is not accessible")
    
    # Check 2: Webhook server is running
    try:
        response = requests.get("http://localhost:5001/webhook/n8n/health", timeout=2)
        if response.status_code == 200:
            checks["webhook_server"] = True
            print("✅ Webhook server is running at http://localhost:5001")
        else:
            print("⚠️  Webhook server returned:", response.status_code)
    except:
        print("❌ Webhook server is not accessible")
    
    print("\n" + "=" * 50)
    print("📋 WHAT YOU SHOULD SEE IN N8N:")
    print("=" * 50)
    
    print("\n✅ IF WORKFLOW IS IMPORTED:")
    print("- You should see nodes on the canvas")
    print("- At minimum: Start node + HTTP Request node")
    print("- Nodes should be connected with lines")
    print("- HTTP Request node should show URL: localhost:5001")
    
    print("\n❌ IF NOT IMPORTED:")
    print("- Empty canvas with dotted grid")
    print("- No nodes visible")
    print("- Look for 'Add Workflow' or '+' button")
    
    print("\n" + "=" * 50)
    print("🧪 QUICK TEST:")
    print("=" * 50)
    
    if checks["n8n_running"] and checks["webhook_server"]:
        print("\n1. In n8n, if you see nodes:")
        print("   - Click 'Execute Workflow' button")
        print("   - You should see green checkmarks on nodes")
        print("\n2. Or test directly:")
        
        test_payload = {
            "content_type": "blog",
            "topic": "Quick Test - Market Update",
            "platforms": ["telegram"]
        }
        
        try:
            print("\n🚀 Sending test request to webhook...")
            response = requests.post(
                "http://localhost:5001/webhook/n8n/trigger",
                json=test_payload,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ SUCCESS! Content generation works!")
                print(f"   Pipeline ID: {result.get('pipeline_id', 'N/A')}")
                print(f"   Title: {result.get('content', {}).get('title', 'N/A')[:50]}...")
                return True
            else:
                print(f"⚠️  Webhook returned: {response.status_code}")
        except Exception as e:
            print(f"❌ Test failed: {e}")
    else:
        print("\n⚠️  Cannot test - services not ready")
        print("   Make sure both n8n and webhook server are running")
    
    return False

def visual_check():
    print("\n" + "=" * 50)
    print("👁️  VISUAL CHECK - What do you see?")
    print("=" * 50)
    print("\nIn your n8n browser tab, do you see:")
    print("\n1. [ ] Empty canvas (just dots)")
    print("2. [ ] One or more rectangular nodes")
    print("3. [ ] Lines connecting nodes")
    print("4. [ ] An 'Execute Workflow' button")
    print("5. [ ] A 'Save' button")
    print("\nIf you see 2-5, the workflow is imported! ✅")
    print("If only 1, you need to add the workflow ❌")

if __name__ == "__main__":
    success = verify_setup()
    visual_check()
    
    if success:
        print("\n🎉 Everything is working!")
    else:
        print("\n📝 Next steps:")
        print("1. Make sure workflow is visible in n8n")
        print("2. Click 'Execute Workflow' to test")
        print("3. Check if content is generated")