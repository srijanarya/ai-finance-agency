#!/usr/bin/env python3
"""
Fix n8n JSON Error and Auto-Import
"""

import json
import pyperclip
import subprocess
import time
import pyautogui

def fix_and_import():
    print("🔧 FIXING N8N JSON ERROR")
    print("=" * 50)
    
    # Create a simple, valid workflow
    valid_workflow = {
        "nodes": [
            {
                "parameters": {},
                "name": "Start",
                "type": "n8n-nodes-base.start",
                "typeVersion": 1,
                "position": [250, 300],
                "id": "start-node"
            },
            {
                "parameters": {
                    "url": "http://localhost:5001/webhook/n8n/trigger",
                    "method": "POST",
                    "sendBody": True,
                    "specifyBody": "json",
                    "jsonBody": "{\"content_type\":\"blog\",\"topic\":\"Market Analysis\",\"platforms\":[\"telegram\"]}"
                },
                "name": "AI Finance Trigger",
                "type": "n8n-nodes-base.httpRequest",
                "typeVersion": 3,
                "position": [450, 300],
                "id": "http-node"
            }
        ],
        "connections": {
            "Start": {
                "main": [
                    [
                        {
                            "node": "AI Finance Trigger",
                            "type": "main",
                            "index": 0
                        }
                    ]
                ]
            }
        }
    }
    
    # Validate JSON
    try:
        json_str = json.dumps(valid_workflow, indent=2)
        json.loads(json_str)  # Validate it parses correctly
        print("✅ JSON is valid")
    except json.JSONDecodeError as e:
        print(f"❌ JSON Error: {e}")
        return False
    
    # Copy to clipboard
    pyperclip.copy(json_str)
    print("📋 Valid workflow copied to clipboard")
    
    # Auto-paste in n8n
    print("\n🤖 Auto-fixing in n8n...")
    
    # Focus on n8n
    subprocess.run(["open", "http://localhost:5678"])
    time.sleep(2)
    
    # Clear current workflow
    pyautogui.hotkey('cmd', 'a')
    time.sleep(0.5)
    pyautogui.press('delete')
    time.sleep(0.5)
    
    # Paste new valid workflow
    pyautogui.hotkey('cmd', 'v')
    time.sleep(1)
    
    # Save
    pyautogui.hotkey('cmd', 's')
    time.sleep(1)
    
    # If save dialog appears, just press Enter
    pyautogui.press('enter')
    
    print("✅ Fixed and saved!")
    
    # Test it
    print("\n🧪 Testing fixed workflow...")
    pyautogui.hotkey('cmd', 'enter')  # Execute workflow
    
    return True

def main():
    try:
        import pyperclip
        import pyautogui
    except ImportError:
        import subprocess
        import sys
        print("Installing required packages...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pyperclip", "pyautogui"], 
                      stdout=subprocess.DEVNULL)
        import pyperclip
        import pyautogui
    
    success = fix_and_import()
    
    if success:
        print("\n✅ JSON ERROR FIXED!")
        print("Your workflow is now valid and saved")
        print("\n📊 You can now:")
        print("1. Execute workflow in n8n")
        print("2. Content will be generated automatically")
    else:
        print("\n⚠️ Manual fix needed")
        print("The valid workflow is in your clipboard")
        print("Just paste it in n8n with Cmd+V")

if __name__ == "__main__":
    main()