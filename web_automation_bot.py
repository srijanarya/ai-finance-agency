#!/usr/bin/env python3
"""
Web Automation Bot - Uses web scraping and automation
to find and join Telegram groups automatically
"""

import asyncio
import time
import random
from playwright.async_api import async_playwright
import os
from dotenv import load_dotenv

load_dotenv()

class WebAutomationBot:
    def __init__(self):
        self.channel_link = "https://t.me/AIFinanceNews2024"
        self.groups_to_join = []
        
    async def find_telegram_groups(self, page):
        """Find Telegram groups from directories"""
        print("🔍 Finding active trading groups...")
        
        # Visit Telegram directory sites
        directories = [
            "https://www.google.com/search?q=telegram+trading+groups+india",
            "https://www.google.com/search?q=telegram+stock+market+chat+india",
            "https://www.google.com/search?q=telegram+nifty+discussion+group"
        ]
        
        groups = []
        
        for url in directories:
            try:
                await page.goto(url)
                await page.wait_for_timeout(2000)
                
                # Find telegram links
                links = await page.query_selector_all("a[href*='t.me']")
                
                for link in links:
                    href = await link.get_attribute("href")
                    if href and "t.me/" in href and "@" not in href:
                        # Extract group username
                        parts = href.split("t.me/")
                        if len(parts) > 1:
                            username = parts[1].split("?")[0].split("/")[0]
                            if username and username not in ["share", "iv"]:
                                groups.append(f"https://t.me/{username}")
                
            except Exception as e:
                print(f"Error searching: {e}")
                continue
        
        # Remove duplicates
        groups = list(set(groups))
        print(f"✅ Found {len(groups)} potential groups")
        return groups
    
    async def open_telegram_web(self, browser):
        """Open Telegram Web and automate joining"""
        print("\n📱 Opening Telegram Web...")
        
        page = await browser.new_page()
        await page.goto("https://web.telegram.org/k/")
        
        print("⏰ Please login to Telegram Web if needed")
        print("Waiting for login...")
        
        # Wait for user to login
        await page.wait_for_timeout(10000)  # 10 seconds
        
        return page
    
    async def join_and_share(self, page, groups):
        """Join groups and share channel"""
        print("\n🚀 Starting automation...")
        
        for group in groups[:10]:  # Limit to 10 groups
            try:
                print(f"\n📌 Opening: {group}")
                
                # Open group
                await page.goto(group)
                await page.wait_for_timeout(3000)
                
                # Look for join button
                join_btn = await page.query_selector("button:has-text('JOIN')")
                if join_btn:
                    await join_btn.click()
                    print("✅ Joined group!")
                    await page.wait_for_timeout(2000)
                
                # Try to send message
                message_input = await page.query_selector(".input-message-input")
                if message_input:
                    message = f"""Found something useful:

{self.channel_link}

Multi-source verified market data.
Educational content only."""
                    
                    await message_input.fill(message)
                    await page.keyboard.press("Enter")
                    print("✅ Message sent!")
                
                # Wait before next group
                wait = random.randint(60, 120)
                print(f"⏰ Waiting {wait} seconds...")
                await page.wait_for_timeout(wait * 1000)
                
            except Exception as e:
                print(f"❌ Error with group: {e}")
                continue
    
    async def run_automation(self):
        """Main automation flow"""
        print("🤖 WEB AUTOMATION BOT")
        print("="*50)
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=False)
            
            # Find groups
            search_page = await browser.new_page()
            groups = await self.find_telegram_groups(search_page)
            await search_page.close()
            
            if groups:
                print(f"\n📋 Groups found:")
                for i, group in enumerate(groups[:10], 1):
                    print(f"{i}. {group}")
                
                # Open Telegram Web
                telegram_page = await self.open_telegram_web(browser)
                
                # Join and share
                await self.join_and_share(telegram_page, groups)
            
            await browser.close()
        
        print("\n✅ Automation complete!")

async def main():
    bot = WebAutomationBot()
    await bot.run_automation()

if __name__ == "__main__":
    asyncio.run(main())