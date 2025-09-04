#!/usr/bin/env python3
"""
Telegram Auto Setup - Uses Playwright to automate everything
Gets API credentials and searches for groups
"""

import asyncio
import os
import time
from dotenv import load_dotenv, set_key

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("Installing Playwright...")
    import subprocess
    subprocess.check_call(["pip3", "install", "playwright"])
    subprocess.check_call(["playwright", "install", "chromium"])
    from playwright.async_api import async_playwright

load_dotenv()

class TelegramAutoSetup:
    def __init__(self):
        self.env_file = '.env'
        self.groups_found = []
        
    async def get_api_credentials(self, browser):
        """Automate getting API credentials from my.telegram.org"""
        print("\n🔧 Getting API Credentials...")
        print("="*50)
        
        # Open my.telegram.org
        page = await browser.new_page()
        await page.goto("https://my.telegram.org/")
        
        print("📱 Please complete the login process:")
        print("1. Enter your phone number")
        print("2. Enter the code you receive")
        print("3. I'll handle the rest!")
        
        # Wait for user to login
        print("\nWaiting for login...")
        
        try:
            # Wait for the main page after login
            await page.wait_for_selector("text='API development tools'", timeout=120000)
            print("✅ Logged in successfully!")
            
            # Click on API development tools
            await page.click("text='API development tools'")
            await page.wait_for_load_state()
            
            # Check if app already exists
            if await page.locator("text='App api_id'").is_visible():
                # App exists, get credentials
                api_id_element = await page.query_selector("//span[contains(text(),'App api_id')]/following-sibling::span/strong")
                api_hash_element = await page.query_selector("//span[contains(text(),'App api_hash')]/following-sibling::span")
                
                if api_id_element and api_hash_element:
                    api_id = await api_id_element.text_content()
                    api_hash = await api_hash_element.text_content()
                    
                    print(f"\n✅ Found existing credentials!")
                    print(f"API ID: {api_id}")
                    print(f"API Hash: {api_hash[:10]}...")
                    
                    return api_id, api_hash
            else:
                # Create new app
                print("\n📝 Creating new app...")
                
                # Fill the form
                await page.fill("input[name='app_title']", "AI Finance Bot")
                await page.fill("input[name='app_shortname']", "aifinancebot")
                await page.select_option("select[name='app_platform']", "5")  # Other
                await page.fill("textarea[name='app_desc']", "Personal trading bot")
                
                # Submit
                await page.click("button[type='submit']")
                await page.wait_for_load_state()
                
                # Get credentials
                api_id_element = await page.query_selector("//span[contains(text(),'App api_id')]/following-sibling::span/strong")
                api_hash_element = await page.query_selector("//span[contains(text(),'App api_hash')]/following-sibling::span")
                
                if api_id_element and api_hash_element:
                    api_id = await api_id_element.text_content()
                    api_hash = await api_hash_element.text_content()
                    
                    print(f"\n✅ App created successfully!")
                    print(f"API ID: {api_id}")
                    print(f"API Hash: {api_hash[:10]}...")
                    
                    return api_id, api_hash
                    
        except Exception as e:
            print(f"❌ Error: {e}")
            print("\nPlease complete the process manually:")
            print("1. Go to 'API development tools'")
            print("2. Create an app or copy existing credentials")
            
            api_id = input("\nEnter API ID: ")
            api_hash = input("Enter API Hash: ")
            
            return api_id, api_hash
        
        finally:
            await page.close()
    
    async def search_telegram_groups(self, browser):
        """Search for Telegram groups using web.telegram.org"""
        print("\n🔍 Searching for Trading Groups...")
        print("="*50)
        
        page = await browser.new_page()
        
        # Try Telegram Web
        await page.goto("https://web.telegram.org/k/")
        
        print("\n📱 Please login to Telegram Web if needed")
        print("Waiting for Telegram to load...")
        
        try:
            # Wait for search button
            await page.wait_for_selector(".sidebar-header__btn-container", timeout=30000)
            
            # Search keywords
            keywords = [
                "trading chat india",
                "stock discussion",
                "nifty chat",
                "market discussion",
                "traders forum",
                "intraday discussion",
                "options chat"
            ]
            
            groups_found = []
            
            for keyword in keywords:
                print(f"\nSearching: {keyword}")
                
                # Click search
                await page.click(".sidebar-header__btn-container button")
                
                # Type search query
                await page.fill("input.input-search", keyword)
                await page.wait_for_timeout(2000)
                
                # Get results
                results = await page.query_selector_all(".search-super-item")
                
                for result in results[:5]:
                    try:
                        title = await result.query_selector(".row-title")
                        if title:
                            group_name = await title.text_content()
                            groups_found.append(group_name)
                            print(f"  Found: {group_name}")
                    except:
                        continue
            
            self.groups_found = groups_found
            print(f"\n✅ Found {len(groups_found)} potential groups")
            
        except Exception as e:
            print(f"Note: Telegram Web requires manual login")
            print("\nAlternative: Search directly in Telegram app for:")
            for keyword in ["trading chat", "stock discussion", "nifty chat"]:
                print(f"  • {keyword}")
        
        finally:
            await page.close()
    
    async def save_credentials(self, api_id, api_hash, phone):
        """Save credentials to .env file"""
        set_key(self.env_file, "TELEGRAM_API_ID", api_id)
        set_key(self.env_file, "TELEGRAM_API_HASH", api_hash)
        set_key(self.env_file, "TELEGRAM_PHONE", phone)
        
        print("\n✅ Credentials saved to .env file!")
    
    async def run_setup(self):
        """Run the complete setup process"""
        print("🚀 TELEGRAM AUTOMATION SETUP")
        print("="*50)
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            
            # Get API credentials
            api_id, api_hash = await self.get_api_credentials(browser)
            
            if api_id and api_hash:
                # Get phone number
                phone = input("\nEnter your phone number (+91XXXXXXXXXX): ")
                
                # Save credentials
                await self.save_credentials(api_id, api_hash, phone)
                
                # Search for groups
                await self.search_telegram_groups(browser)
            
            await browser.close()
        
        return api_id, api_hash

async def main():
    setup = TelegramAutoSetup()
    
    # Run automated setup
    api_id, api_hash = await setup.run_setup()
    
    if api_id and api_hash:
        print("\n" + "="*50)
        print("✅ SETUP COMPLETE!")
        print("="*50)
        print("\n🤖 Now you can run the Power Bot:")
        print("\npython3 telegram_power_bot.py")
        print("\nSelect Option 1 for AUTO MODE")
        print("\nThe bot will:")
        print("• Search for groups automatically")
        print("• Join groups where posting is allowed")
        print("• Share your channel every hour")
        print("• Run 24/7 without manual work")
        
        if setup.groups_found:
            print("\n📱 Groups to join manually:")
            for group in setup.groups_found[:10]:
                print(f"  • {group}")

if __name__ == "__main__":
    asyncio.run(main())