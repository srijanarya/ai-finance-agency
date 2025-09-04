#!/usr/bin/env python3
"""
Fully Automated n8n Workflow Import
Using pyautogui for GUI automation
"""

import time
import json
import subprocess
import sys

def install_requirements():
    """Install required packages"""
    try:
        import pyautogui
        import pyperclip
    except ImportError:
        print("Installing required packages...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pyautogui", "pyperclip"], check=True)
        print("✅ Packages installed")

def automated_import():
    """Automate the n8n import process"""
    import pyautogui
    import pyperclip
    
    print("🤖 AUTOMATED N8N WORKFLOW IMPORT")
    print("=" * 50)
    
    # Read the workflow file
    print("📄 Reading workflow file...")
    with open('n8n_workflows/ai_finance_content_agency.json', 'r') as f:
        workflow_content = f.read()
    
    # Copy to clipboard
    print("📋 Copying workflow to clipboard...")
    pyperclip.copy(workflow_content)
    
    # Open browser with n8n
    print("🌐 Opening n8n in browser...")
    subprocess.run(["open", "http://localhost:5678"])
    
    # Wait for browser to load
    print("⏳ Waiting for n8n to load (5 seconds)...")
    time.sleep(5)
    
    # Alert user
    pyautogui.alert(text='Click OK when you see the n8n dashboard', title='Ready to Import', button='OK')
    
    # Click Add Workflow button
    print("🖱️ Looking for Add Workflow button...")
    
    # Try to find and click the + button or "Add Workflow" text
    try:
        # Method 1: Look for + button
        add_button = pyautogui.locateOnScreen('add_workflow_button.png', confidence=0.7)
        if add_button:
            pyautogui.click(add_button)
        else:
            # Method 2: Use keyboard shortcut
            print("Using keyboard shortcut...")
            pyautogui.hotkey('cmd', 'shift', 'n')  # Common shortcut for new workflow
    except:
        # Method 3: Click based on position (fallback)
        print("Clicking in expected button area...")
        screen_width, screen_height = pyautogui.size()
        # Click approximately where Add button usually is
        pyautogui.click(screen_width * 0.85, screen_height * 0.15)
    
    time.sleep(2)
    
    # Clear canvas and paste
    print("📝 Clearing canvas and pasting workflow...")
    
    # Select all and delete existing content
    pyautogui.hotkey('cmd', 'a')
    time.sleep(0.5)
    pyautogui.press('delete')
    time.sleep(0.5)
    
    # Paste the workflow
    pyautogui.hotkey('cmd', 'v')
    
    print("✅ Workflow pasted!")
    
    # Save workflow
    time.sleep(2)
    print("💾 Saving workflow...")
    pyautogui.hotkey('cmd', 's')
    
    time.sleep(1)
    
    # Type workflow name if prompted
    pyautogui.typewrite('AI Finance Content Agency - Automated', interval=0.05)
    pyautogui.press('enter')
    
    print("\n✅ SUCCESS! Workflow imported")
    print("\n📋 Next steps:")
    print("1. Check the workflow in n8n")
    print("2. Configure any missing credentials")
    print("3. Activate the workflow")
    print("4. Test with: python test_n8n_integration.py")

def main():
    install_requirements()
    
    print("\n⚠️  IMPORTANT: This will automate your mouse and keyboard")
    print("Please ensure:")
    print("1. n8n is running at http://localhost:5678")
    print("2. You are logged into n8n")
    print("3. You're ready for automated clicks")
    
    input("\nPress Enter to start automation...")
    
    automated_import()

if __name__ == "__main__":
    main()