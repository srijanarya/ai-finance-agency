#!/usr/bin/env python3
"""
Simple n8n Workflow Addition Helper
"""

import time
import subprocess
import pyperclip

def add_workflow_to_n8n():
    print("🚀 N8N WORKFLOW ADDITION HELPER")
    print("=" * 40)
    
    # Create the simplest possible workflow
    simple_workflow = '''
{
  "nodes": [
    {
      "parameters": {},
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "http://localhost:5001/webhook/n8n/trigger",
        "method": "POST",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "{\\"content_type\\": \\"blog\\", \\"topic\\": \\"Market Analysis\\"}"
      },
      "name": "Trigger AI Finance",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [450, 300]
    }
  ],
  "connections": {
    "Start": {
      "main": [[{"node": "Trigger AI Finance", "type": "main", "index": 0}]]
    }
  }
}
'''
    
    print("📋 Copying simple workflow to clipboard...")
    pyperclip.copy(simple_workflow.strip())
    
    print("\n✅ Workflow copied to clipboard!")
    print("\n📝 INSTRUCTIONS:")
    print("-" * 40)
    print("\n1. Go to n8n browser tab")
    print("\n2. Try these in order:")
    print("   a) Click the canvas and press Cmd+V")
    print("   b) Press Cmd+A (select all) then Cmd+V")
    print("   c) Look for + or 'New' button")
    print("\n3. If you see nodes appear - SUCCESS!")
    print("\n4. Save with Cmd+S")
    print("-" * 40)
    
    # Open n8n
    subprocess.run(["open", "http://localhost:5678"])
    
    print("\n🎯 Alternative: Create manually")
    print("1. Click '+' to add node")
    print("2. Search 'HTTP Request'")
    print("3. Add it to canvas")
    print("4. Configure:")
    print("   URL: http://localhost:5001/webhook/n8n/trigger")
    print("   Method: POST")

if __name__ == "__main__":
    try:
        import pyperclip
    except ImportError:
        import subprocess
        import sys
        print("Installing pyperclip...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pyperclip"], check=True)
        import pyperclip
    
    add_workflow_to_n8n()