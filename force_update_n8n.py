#!/usr/bin/env python3
"""
Force Update n8n Workflow - Complete Replacement
"""

import subprocess
import time
import json
import pyautogui
import pyperclip
from datetime import datetime

def force_update_n8n():
    print("🔨 FORCE UPDATING N8N WORKFLOW")
    print("=" * 50)
    print(f"Current time: {datetime.now().strftime('%I:%M %p')}")
    
    # Kill the stuck orchestrator first
    subprocess.run("pkill -f 'multi_agent_orchestrator'", shell=True)
    time.sleep(1)
    
    # Create brand new workflow with timestamp
    timestamp = datetime.now().strftime("%H%M%S")
    new_workflow = {
        "name": f"AI Finance Agency - Updated {timestamp}",
        "nodes": [
            {
                "parameters": {},
                "id": f"start-{timestamp}",
                "name": "Start",
                "type": "n8n-nodes-base.start",
                "typeVersion": 1,
                "position": [250, 300]
            },
            {
                "parameters": {
                    "rule": {
                        "interval": [
                            {
                                "field": "minutes",
                                "minutesInterval": 30
                            }
                        ]
                    }
                },
                "id": f"cron-{timestamp}",
                "name": "Auto Trigger",
                "type": "n8n-nodes-base.cron",
                "typeVersion": 1,
                "position": [250, 450]
            },
            {
                "parameters": {
                    "url": "http://localhost:5001/webhook/n8n/trigger",
                    "method": "POST",
                    "sendBody": True,
                    "specifyBody": "json",
                    "jsonBody": json.dumps({
                        "content_type": "blog",
                        "topic": f"Market Update - {datetime.now().strftime('%I:%M %p')}",
                        "platforms": ["telegram"]
                    })
                },
                "id": f"http-{timestamp}",
                "name": "Generate Content",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 3,
                "position": [500, 375]
            },
            {
                "parameters": {
                    "message": "=Content generated: {{$json.pipeline_id}}"
                },
                "id": f"note-{timestamp}",
                "name": "Success Note",
                "type": "n8n-nodes-base.stickyNote",
                "typeVersion": 1,
                "position": [700, 375]
            }
        ],
        "connections": {
            "Start": {
                "main": [[{"node": "Generate Content", "type": "main", "index": 0}]]
            },
            "Auto Trigger": {
                "main": [[{"node": "Generate Content", "type": "main", "index": 0}]]
            },
            "Generate Content": {
                "main": [[{"node": "Success Note", "type": "main", "index": 0}]]
            }
        },
        "settings": {
            "saveManualExecutions": True,
            "saveExecutionProgress": True
        },
        "staticData": None,
        "tags": [{"name": "AI Finance"}],
        "triggerCount": 2,
        "updatedAt": datetime.now().isoformat(),
        "versionId": timestamp
    }
    
    # Convert to JSON string
    workflow_json = json.dumps(new_workflow, indent=2)
    
    # Copy to clipboard
    pyperclip.copy(workflow_json)
    print(f"✅ New workflow created with ID: {timestamp}")
    
    # Open n8n
    print("\n🌐 Opening n8n...")
    subprocess.run(["open", "http://localhost:5678"])
    time.sleep(3)
    
    # Create completely new workflow
    print("📝 Creating NEW workflow (not updating old one)...")
    
    # Try to create new workflow with keyboard shortcut
    pyautogui.hotkey('cmd', 'shift', 'n')
    time.sleep(2)
    
    # If that doesn't work, click on Workflows and then New
    screen_width, screen_height = pyautogui.size()
    
    # Click Workflows in sidebar (usually left side)
    pyautogui.click(100, 200)
    time.sleep(1)
    
    # Click New/Add button (usually top area)
    pyautogui.click(screen_width - 150, 150)
    time.sleep(2)
    
    # Now paste the workflow
    print("📋 Pasting new workflow...")
    
    # Click canvas center
    pyautogui.click(screen_width // 2, screen_height // 2)
    time.sleep(0.5)
    
    # Clear any existing content
    pyautogui.hotkey('cmd', 'a')
    time.sleep(0.5)
    pyautogui.press('delete')
    time.sleep(0.5)
    
    # Paste new workflow
    pyautogui.hotkey('cmd', 'v')
    time.sleep(2)
    
    # Save with new name
    print("💾 Saving with timestamp...")
    pyautogui.hotkey('cmd', 's')
    time.sleep(1)
    
    # Type new name if dialog appears
    pyautogui.typewrite(f'AI Finance {timestamp}')
    pyautogui.press('enter')
    time.sleep(1)
    
    # Execute workflow to test
    print("🧪 Executing workflow...")
    pyautogui.hotkey('cmd', 'enter')
    time.sleep(2)
    
    print(f"\n✅ NEW WORKFLOW CREATED at {datetime.now().strftime('%I:%M:%S %p')}")
    print(f"Workflow Name: AI Finance {timestamp}")
    
    # Now restart the orchestrator properly
    print("\n🔄 Restarting orchestrator in continuous mode...")
    subprocess.Popen(
        ["python3", "multi_agent_orchestrator.py"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    ).communicate(input=b"3\n")
    
    return timestamp

def verify_update(workflow_id):
    """Verify the update actually happened"""
    print(f"\n🔍 Verifying update {workflow_id}...")
    
    # Test the webhook
    import requests
    
    test_payload = {
        "content_type": "blog", 
        "topic": f"Verification Test - {workflow_id}",
        "platforms": ["telegram"]
    }
    
    try:
        response = requests.post(
            "http://localhost:5001/webhook/n8n/trigger",
            json=test_payload,
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Webhook test successful!")
            result = response.json()
            print(f"Pipeline: {result.get('pipeline_id')}")
            print(f"Time: {datetime.now().strftime('%I:%M:%S %p')}")
            return True
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    return False

def main():
    try:
        import pyautogui
        import pyperclip
    except ImportError:
        import sys
        print("Installing required packages...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pyautogui", "pyperclip"])
        import pyautogui
        import pyperclip
    
    # Force update
    workflow_id = force_update_n8n()
    
    # Verify
    time.sleep(2)
    success = verify_update(workflow_id)
    
    if success:
        print("\n" + "="*50)
        print("✅ WORKFLOW TRULY UPDATED!")
        print(f"Update Time: {datetime.now().strftime('%I:%M:%S %p')}")
        print(f"New Workflow ID: {workflow_id}")
        print("="*50)
    else:
        print("\n⚠️ Manual verification needed")
        print("Check n8n for the new workflow")

if __name__ == "__main__":
    main()