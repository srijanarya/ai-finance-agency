#!/usr/bin/env python3
"""Test webhook integration between n8n and orchestrator"""

import requests
import json

# Test webhook endpoint
url = "http://localhost:5000/webhook/n8n/trigger"

# Test payload
payload = {
    "content_type": "blog",
    "topic": "Testing n8n Integration - Market Update",
    "platforms": ["telegram"],
    "priority": "high"
}

print("🧪 Testing webhook integration...")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(url, json=payload, timeout=30)
    
    if response.status_code == 200:
        result = response.json()
        print("\n✅ Integration successful!")
        print(f"Pipeline ID: {result.get('pipeline_id')}")
        print(f"Title: {result.get('content', {}).get('title')}")
        print(f"Execution Time: {result.get('execution_time')}")
    else:
        print(f"\n❌ Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"\n❌ Connection error: {e}")
    print("Make sure webhook server is running: python n8n_webhook_endpoint.py")
