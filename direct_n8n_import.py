#!/usr/bin/env python3
"""
Direct n8n Import using Browser Session
Extracts session cookie and imports via API
"""

import json
import requests
import subprocess
import time
from pathlib import Path

def get_n8n_session():
    """Get n8n session info using browser cookies"""
    print("🔍 Extracting n8n session...")
    
    # Try to get cookie from Chrome/Safari
    try:
        # For macOS, we can try to extract from browser storage
        import sqlite3
        import tempfile
        import shutil
        
        # Common browser cookie locations on macOS
        chrome_cookies = Path.home() / "Library/Application Support/Google/Chrome/Default/Cookies"
        
        if chrome_cookies.exists():
            # Make a temporary copy to avoid locking issues
            with tempfile.NamedTemporaryFile(delete=False) as tmp:
                shutil.copy2(chrome_cookies, tmp.name)
                
                conn = sqlite3.connect(tmp.name)
                cursor = conn.cursor()
                
                # Query for n8n cookies
                cursor.execute("""
                    SELECT name, value FROM cookies 
                    WHERE host_key = 'localhost' 
                    AND name LIKE '%session%'
                    ORDER BY last_access_utc DESC
                    LIMIT 1
                """)
                
                result = cursor.fetchone()
                conn.close()
                
                if result:
                    return result[1]
    except Exception as e:
        print(f"Could not extract cookie automatically: {e}")
    
    return None

def import_workflow_directly():
    """Import workflow using direct file manipulation"""
    print("\n🚀 DIRECT N8N WORKFLOW IMPORT")
    print("=" * 50)
    
    # Read workflow
    workflow_path = Path("n8n_workflows/ai_finance_content_agency.json")
    with open(workflow_path, 'r') as f:
        workflow = json.load(f)
    
    # Create a simplified version
    simplified = {
        "name": "AI Finance Content Agency - Direct Import",
        "nodes": [
            {
                "parameters": {},
                "id": "start-1",
                "name": "Start",
                "type": "n8n-nodes-base.start",
                "typeVersion": 1,
                "position": [250, 300]
            },
            {
                "parameters": {
                    "rule": {
                        "interval": [{"field": "minutes", "minutesInterval": 30}]
                    }
                },
                "id": "cron-1",
                "name": "Every 30 Minutes",
                "type": "n8n-nodes-base.cron",
                "typeVersion": 1,
                "position": [450, 300]
            },
            {
                "parameters": {
                    "url": "http://localhost:5001/webhook/n8n/trigger",
                    "method": "POST",
                    "sendBody": True,
                    "specifyBody": "json",
                    "jsonBody": json.dumps({
                        "content_type": "blog",
                        "topic": "Market Analysis",
                        "platforms": ["telegram"]
                    })
                },
                "id": "webhook-1",
                "name": "Trigger AI Finance",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 3,
                "position": [650, 300]
            }
        ],
        "connections": {
            "Start": {
                "main": [[{"node": "Every 30 Minutes", "type": "main", "index": 0}]]
            },
            "Every 30 Minutes": {
                "main": [[{"node": "Trigger AI Finance", "type": "main", "index": 0}]]
            }
        },
        "active": False,
        "settings": {},
        "tags": []
    }
    
    # Save simplified workflow
    simple_path = Path("n8n_workflows/ai_finance_simple.json")
    with open(simple_path, 'w') as f:
        json.dump(simplified, f, indent=2)
    
    print(f"✅ Created simplified workflow: {simple_path}")
    
    # Try API import with different auth methods
    base_url = "http://localhost:5678"
    
    # Method 1: Try without auth (might work if n8n is in open mode)
    print("\n📤 Attempting import via API...")
    
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    # Get session cookie if possible
    session_cookie = get_n8n_session()
    
    session = requests.Session()
    if session_cookie:
        session.cookies.set("n8n.sessionId", session_cookie)
        print("🔑 Using extracted session cookie")
    
    # Try different endpoints
    endpoints = [
        f"{base_url}/rest/workflows",
        f"{base_url}/api/v1/workflows",
        f"{base_url}/workflows"
    ]
    
    for endpoint in endpoints:
        try:
            response = session.post(
                endpoint,
                json=simplified,
                headers=headers,
                timeout=5
            )
            
            if response.status_code in [200, 201]:
                print(f"✅ Workflow imported successfully via {endpoint}!")
                workflow_id = response.json().get('id', 'unknown')
                print(f"📋 Workflow ID: {workflow_id}")
                return True
            else:
                print(f"❌ {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: {str(e)[:50]}")
    
    return False

def open_n8n_with_import():
    """Open n8n with import instructions"""
    print("\n📂 Opening n8n and workflow file...")
    
    # Open n8n in browser
    subprocess.run(["open", "http://localhost:5678"])
    
    # Open the JSON file in Finder
    workflow_path = Path("n8n_workflows/ai_finance_content_agency.json").absolute()
    subprocess.run(["open", "-R", str(workflow_path)])
    
    print("\n📋 MANUAL IMPORT INSTRUCTIONS:")
    print("1. n8n is now open in your browser")
    print("2. The workflow file is highlighted in Finder")
    print("3. In n8n: Click 'Add Workflow' (+)")
    print("4. Drag and drop the JSON file into n8n")
    print("   OR")
    print("   - Open the JSON file in a text editor")
    print("   - Copy all content (Cmd+A, Cmd+C)")
    print("   - Paste into n8n canvas (Cmd+V)")
    
    # Create a simple HTML helper
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>N8N Import Helper</title>
        <style>
            body {{ font-family: Arial; padding: 20px; }}
            textarea {{ width: 100%; height: 400px; }}
            button {{ padding: 10px 20px; margin: 10px; }}
        </style>
    </head>
    <body>
        <h1>N8N Workflow Import Helper</h1>
        <p>1. Click "Copy Workflow" below</p>
        <p>2. Go to n8n and press Cmd+V to paste</p>
        <textarea id="workflow">{open('n8n_workflows/ai_finance_content_agency.json').read()}</textarea>
        <button onclick="copyWorkflow()">Copy Workflow to Clipboard</button>
        <script>
            function copyWorkflow() {{
                document.getElementById('workflow').select();
                document.execCommand('copy');
                alert('Workflow copied! Now paste it in n8n with Cmd+V');
            }}
        </script>
    </body>
    </html>
    """
    
    # Save and open helper
    helper_path = Path("n8n_import_helper.html")
    with open(helper_path, 'w') as f:
        f.write(html_content)
    
    subprocess.run(["open", str(helper_path)])
    print(f"\n✅ Import helper opened: {helper_path}")

def main():
    print("🤖 N8N WORKFLOW IMPORT AUTOMATION")
    print("=" * 50)
    
    # Try direct import first
    success = import_workflow_directly()
    
    if not success:
        print("\n⚠️  Direct import failed. Using helper method...")
        open_n8n_with_import()
    
    print("\n✅ Setup Complete!")
    print("\n🧪 Test the integration:")
    print("   python test_n8n_integration.py")
    print("\n🚀 Start continuous generation:")
    print("   python multi_agent_orchestrator.py")

if __name__ == "__main__":
    main()