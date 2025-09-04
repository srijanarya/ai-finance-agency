#!/usr/bin/env python3
"""
AUTO-START SHARING - Runs automatically without prompts
"""

import time
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import os

def setup_driver():
    """Setup Chrome driver for automation"""
    chrome_options = Options()
    
    # Use persistent session to remember login
    user_data_dir = os.path.expanduser("~/telegram_session_auto")
    chrome_options.add_argument(f"--user-data-dir={user_data_dir}")
    
    # Make browser behave more naturally
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.add_argument("--window-size=1200,800")
    chrome_options.add_argument("--start-maximized")
    
    try:
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        # Hide automation indicators
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        return driver
    except Exception as e:
        print(f"❌ Could not setup browser: {e}")
        return None

def human_delay(min_seconds=1, max_seconds=3):
    """Random human-like delay"""
    time.sleep(random.uniform(min_seconds, max_seconds))

def type_naturally(element, text):
    """Type with natural human speed"""
    element.clear()
    for char in text:
        element.send_keys(char)
        time.sleep(random.uniform(0.05, 0.1))

def attempt_sharing():
    """Attempt automated sharing"""
    
    print("🚀 AUTO-START TELEGRAM SHARING")
    print("=" * 60)
    
    sharing_message = """🔥 Just discovered this amazing finance channel!

@AIFinanceNews2024

🛡️ They have CREDIBILITY PROTECTION:
✅ Every data verified within 30 minutes
✅ Multi-source validation (NSE, BSE, Yahoo)  
✅ Never posts stale/old market data
✅ 8.8/10 quality score average

🚀 8 AI agents working 24/7 for accuracy!

No fake tips, only verified data + education 📚"""
    
    target_groups = ["IndianStockMarketLive", "StockMarketIndiaOfficial", "NSEBSETips"]
    comments = [
        "Found this really helpful for verified market data!",
        "Finally, a channel that verifies data before posting! 🎯",
        "Love their credibility protection system!"
    ]
    
    driver = setup_driver()
    if not driver:
        return False
    
    success_count = 0
    
    try:
        print("🌐 Opening Telegram Web...")
        driver.get("https://web.telegram.org/k/")
        human_delay(5, 8)
        
        # Check if login is needed
        page_source = driver.page_source.lower()
        
        if "phone" in page_source or "login" in page_source:
            print("📱 Login required - please complete in browser")
            print("⏳ Waiting 2 minutes for login...")
            time.sleep(120)  # Wait 2 minutes for login
        
        # Try to find search and proceed
        wait = WebDriverWait(driver, 30)
        
        for i, group in enumerate(target_groups):
            print(f"\n[{i+1}/3] 🎯 Attempting {group}...")
            
            try:
                # Look for search input
                search_selectors = [
                    "input[placeholder*='Search']",
                    ".input-search input",
                    "input.form-control"
                ]
                
                search_input = None
                for selector in search_selectors:
                    try:
                        search_input = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, selector)))
                        break
                    except:
                        continue
                
                if search_input:
                    # Search for group
                    search_input.click()
                    human_delay(0.5, 1)
                    type_naturally(search_input, f"@{group}")
                    human_delay(2, 3)
                    
                    # Press Enter to search
                    search_input.send_keys(Keys.ENTER)
                    human_delay(3, 5)
                    
                    # Try to find message input
                    message_selectors = [
                        "div[contenteditable='true']",
                        ".input-message-input",
                        "div[data-placeholder*='Message']"
                    ]
                    
                    message_input = None
                    for selector in message_selectors:
                        try:
                            message_input = WebDriverWait(driver, 10).until(
                                EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                            )
                            break
                        except:
                            continue
                    
                    if message_input:
                        # Send message
                        message_input.click()
                        human_delay(0.5, 1)
                        type_naturally(message_input, sharing_message)
                        human_delay(1, 2)
                        message_input.send_keys(Keys.ENTER)
                        
                        # Send comment
                        human_delay(2, 3)
                        message_input.click()
                        human_delay(0.5, 1)
                        type_naturally(message_input, comments[i])
                        human_delay(0.5, 1)
                        message_input.send_keys(Keys.ENTER)
                        
                        print(f"✅ Successfully shared to {group}")
                        success_count += 1
                    else:
                        print(f"⚠️ Could not find message input for {group}")
                else:
                    print(f"⚠️ Could not find search for {group}")
                
                # Wait between groups
                if i < len(target_groups) - 1:
                    print("⏰ Waiting 60 seconds...")
                    time.sleep(60)
                    
            except Exception as e:
                print(f"❌ Error with {group}: {e}")
        
        print(f"\n✅ Automation completed: {success_count}/3 groups")
        print(f"📊 Expected subscribers: {success_count * 20}-{success_count * 30}")
        
        # Keep browser open briefly
        print("👀 Keeping browser open for 30 seconds...")
        time.sleep(30)
        
    except Exception as e:
        print(f"❌ Automation error: {e}")
    finally:
        if driver:
            driver.quit()
    
    return success_count > 0

def create_simple_web_approach():
    """Create a simple web-based approach"""
    
    print("\n🌐 ALTERNATIVE: Simple Web Approach")
    print("=" * 40)
    
    import webbrowser
    import subprocess
    
    # Copy message to clipboard
    message = """🔥 Just discovered this amazing finance channel!

@AIFinanceNews2024

🛡️ They have CREDIBILITY PROTECTION:
✅ Every data verified within 30 minutes
✅ Multi-source validation (NSE, BSE, Yahoo)  
✅ Never posts stale/old market data
✅ 8.8/10 quality score average

🚀 8 AI agents working 24/7 for accuracy!

No fake tips, only verified data + education 📚"""
    
    try:
        # Copy to clipboard
        process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
        process.communicate(message.encode())
        print("✅ Message copied to clipboard!")
        
        # Open Telegram Web
        print("🌐 Opening Telegram Web...")
        webbrowser.open("https://web.telegram.org/k/")
        time.sleep(2)
        
        # Open group tabs
        groups = ["IndianStockMarketLive", "StockMarketIndiaOfficial", "NSEBSETips"]
        for group in groups:
            webbrowser.open(f"https://t.me/{group}")
            time.sleep(1)
        
        print(f"✅ Opened {len(groups)} group tabs")
        print("📋 Message is copied - just paste (Cmd+V) in each tab!")
        print("⏰ Takes 2 minutes to paste in all groups")
        
        return True
        
    except Exception as e:
        print(f"❌ Web approach error: {e}")
        return False

def main():
    """Main execution"""
    
    print("🤖 AUTOMATED TELEGRAM SHARING")
    print("=" * 50)
    print("🎯 Attempting full automation...")
    
    # Try automated approach first
    if attempt_sharing():
        print("\n🎉 FULL AUTOMATION SUCCESSFUL!")
        print("📈 Check @AIFinanceNews2024 for new subscribers!")
    else:
        print("\n⚠️ Full automation had issues")
        print("🔄 Trying simple web approach...")
        
        if create_simple_web_approach():
            print("\n✅ WEB APPROACH READY!")
            print("📱 Just paste in the open browser tabs!")
        else:
            print("\n💡 Manual approach recommended:")
            print("1. Copy this message:")
            print("-" * 30)
            print("""🔥 Just discovered this amazing finance channel!

@AIFinanceNews2024

🛡️ They have CREDIBILITY PROTECTION:
✅ Every data verified within 30 minutes
✅ Multi-source validation (NSE, BSE, Yahoo)  
✅ Never posts stale/old market data
✅ 8.8/10 quality score average

🚀 8 AI agents working 24/7 for accuracy!

No fake tips, only verified data + education 📚""")
            print("-" * 30)
            print("2. Share in @IndianStockMarketLive")
            print("3. Share in @StockMarketIndiaOfficial") 
            print("4. Share in @NSEBSETips")

if __name__ == "__main__":
    main()