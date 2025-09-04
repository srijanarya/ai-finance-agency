#!/usr/bin/env python3
"""
Browser Automation for n8n Workflow Import
Uses Selenium to automate the import process
"""

import time
import json
from pathlib import Path

def setup_selenium():
    """Setup Selenium with Chrome"""
    try:
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        from selenium.webdriver.common.keys import Keys
        
        print("✅ Selenium is available")
        return True
    except ImportError:
        print("❌ Selenium not installed")
        print("Installing required packages...")
        import subprocess
        subprocess.run(["pip", "install", "selenium"], check=True)
        return setup_selenium()

def import_with_playwright():
    """Alternative: Use Playwright for automation"""
    print("\n🎭 Using Playwright for browser automation...")
    
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Installing Playwright...")
        import subprocess
        subprocess.run(["pip", "install", "playwright"], check=True)
        subprocess.run(["playwright", "install", "chromium"], check=True)
        from playwright.sync_api import sync_playwright
    
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        
        print("📱 Opening n8n...")
        page.goto("http://localhost:5678")
        
        # Wait for page to load
        page.wait_for_timeout(3000)
        
        try:
            # Check if login is needed
            if page.locator("input[type='email']").is_visible():
                print("🔐 Login required - entering credentials...")
                page.fill("input[type='email']", "srijan@treumalgotech.in")
                page.fill("input[type='password']", input("Enter password: "))
                page.click("button[type='submit']")
                page.wait_for_timeout(2000)
            
            # Navigate to workflows
            print("📂 Navigating to workflows...")
            if page.locator("text='Workflows'").is_visible():
                page.click("text='Workflows'")
                page.wait_for_timeout(1000)
            
            # Click Add Workflow
            print("➕ Adding new workflow...")
            page.click("button:has-text('Add Workflow')")
            page.wait_for_timeout(1000)
            
            # Look for import option
            print("📤 Looking for import option...")
            page.click("button[aria-label='Workflow menu']")
            page.wait_for_timeout(500)
            page.click("text='Import from File'")
            
            # Upload file
            print("📁 Uploading workflow file...")
            file_input = page.locator("input[type='file']")
            file_path = str(Path("n8n_workflows/ai_finance_content_agency.json").absolute())
            file_input.set_input_files(file_path)
            
            page.wait_for_timeout(2000)
            print("✅ Workflow imported successfully!")
            
            # Keep browser open for manual verification
            print("\n⚠️ Browser will stay open for you to:")
            print("1. Configure API credentials")
            print("2. Save the workflow")
            print("3. Activate it")
            print("\nPress Enter when done...")
            input()
            
        except Exception as e:
            print(f"❌ Error during import: {e}")
            print("Please complete the import manually in the browser")
            input("Press Enter when done...")
        
        finally:
            browser.close()

def import_via_api_with_auth():
    """Try API import with session cookie"""
    import requests
    
    print("\n🔑 Attempting authenticated API import...")
    
    # Get session cookie from browser
    print("First, make sure you're logged into n8n at http://localhost:5678")
    input("Press Enter when logged in...")
    
    # Read workflow
    with open("n8n_workflows/ai_finance_content_agency.json", 'r') as f:
        workflow = json.load(f)
    
    # Prepare the import data
    import_data = {
        "name": "AI Finance Content Agency",
        "nodes": workflow["nodes"],
        "connections": workflow["connections"],
        "settings": workflow.get("settings", {}),
        "active": False
    }
    
    # Try to import
    session = requests.Session()
    
    # You might need to add cookies here
    cookies = input("Enter your n8n.sessionId cookie value (from browser DevTools): ").strip()
    if cookies:
        session.cookies.set("n8n.sessionId", cookies)
    
    try:
        response = session.post(
            "http://localhost:5678/rest/workflows",
            json=import_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code in [200, 201]:
            print("✅ Workflow imported via API!")
            print(f"Workflow ID: {response.json().get('id')}")
        else:
            print(f"❌ Import failed: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    print("🚀 N8N WORKFLOW BROWSER AUTOMATION")
    print("=" * 50)
    
    print("\nChoose import method:")
    print("1. Playwright automation (recommended)")
    print("2. API with auth cookie")
    print("3. Manual instructions")
    
    choice = input("\nSelect (1-3): ").strip()
    
    if choice == "1":
        import_with_playwright()
    elif choice == "2":
        import_via_api_with_auth()
    else:
        print("\n📋 MANUAL IMPORT INSTRUCTIONS:")
        print("1. Open http://localhost:5678")
        print("2. Login with srijan@treumalgotech.in")
        print("3. Click 'Workflows' in sidebar")
        print("4. Click 'Add Workflow' button")
        print("5. Click 3-dot menu → 'Import from File'")
        print("6. Select: /Users/srijan/ai-finance-agency/n8n_workflows/ai_finance_content_agency.json")
        print("7. Save and activate the workflow")

if __name__ == "__main__":
    main()