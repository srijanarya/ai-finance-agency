#!/usr/bin/env python3
"""
LinkedIn Auto-Poster using Selenium
Posts content to LinkedIn automatically
"""

import os
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()


class LinkedInAutoPoster:
    def __init__(self):
        self.email = os.getenv('LINKEDIN_EMAIL', 'triumfagency@gmail.com')
        self.password = os.getenv('LINKEDIN_PASSWORD')
        self.driver = None
        
    def setup_driver(self):
        """Setup Chrome driver"""
        options = webdriver.ChromeOptions()
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        # Try Safari if Chrome is not available
        try:
            self.driver = webdriver.Chrome(options=options)
        except:
            print("Chrome not available, trying Safari...")
            self.driver = webdriver.Safari()
        
        self.driver.maximize_window()
        
    def login(self):
        """Login to LinkedIn"""
        print("🔐 Logging into LinkedIn...")
        self.driver.get("https://www.linkedin.com/login")
        time.sleep(3)
        
        # Enter email
        email_field = self.driver.find_element(By.ID, "username")
        email_field.send_keys(self.email)
        
        # Enter password
        if self.password and self.password != 'your_password_here':
            password_field = self.driver.find_element(By.ID, "password")
            password_field.send_keys(self.password)
            
            # Click login
            login_button = self.driver.find_element(By.XPATH, "//button[@type='submit']")
            login_button.click()
            time.sleep(5)
            
            return True
        else:
            print("⚠️ Please enter your LinkedIn password manually")
            print("Waiting 30 seconds for manual login...")
            time.sleep(30)
            return True
            
    def post_content(self, content_text):
        """Post content to LinkedIn"""
        print("📝 Creating new post...")
        
        # Navigate to feed
        self.driver.get("https://www.linkedin.com/feed/")
        time.sleep(3)
        
        try:
            # Click "Start a post" button
            start_post_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(@class, 'share-box-feed-entry__trigger')]"))
            )
            start_post_button.click()
            time.sleep(2)
            
            # Find the text editor
            post_editor = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//div[@contenteditable='true']"))
            )
            
            # Type the content
            post_editor.send_keys(content_text)
            time.sleep(2)
            
            # Click Post button
            post_button = self.driver.find_element(By.XPATH, "//button[contains(@class, 'share-actions__primary-action')]")
            
            # Take screenshot before posting
            self.driver.save_screenshot("posts/linkedin_before_post.png")
            print("📸 Screenshot saved: posts/linkedin_before_post.png")
            
            post_button.click()
            print("✅ Content posted successfully!")
            
            time.sleep(5)
            
            # Take screenshot after posting
            self.driver.save_screenshot("posts/linkedin_after_post.png")
            print("📸 Screenshot saved: posts/linkedin_after_post.png")
            
            return True
            
        except TimeoutException:
            print("❌ Could not find post elements. Taking screenshot...")
            self.driver.save_screenshot("posts/linkedin_error.png")
            return False
        except Exception as e:
            print(f"❌ Error posting: {e}")
            self.driver.save_screenshot("posts/linkedin_error.png")
            return False
    
    def verify_post(self):
        """Verify the post was published"""
        print("🔍 Verifying post...")
        
        # Go to profile
        self.driver.get(f"https://www.linkedin.com/in/{self.email.split('@')[0]}/recent-activity/all/")
        time.sleep(3)
        
        # Take screenshot of recent activity
        self.driver.save_screenshot("posts/linkedin_verification.png")
        print("📸 Verification screenshot saved: posts/linkedin_verification.png")
        
        return True
    
    def run(self, content):
        """Main execution"""
        try:
            self.setup_driver()
            
            if self.login():
                if self.post_content(content):
                    self.verify_post()
                    return True
            return False
            
        finally:
            if self.driver:
                time.sleep(5)
                self.driver.quit()


def main():
    # Load the premium content
    content = """I've spent 48 hours analyzing India's market resilience.

The results shocked me.

📊 Key Numbers:
• Nifty: 24,712 (-0.75%)
• Sensex: 80,787 (-0.73%)
• FII: ₹+892 Cr | DII: ₹+3,456 Cr
• Top Sector: Pharma (+2.9%)

🎯 What This Really Means:
While everyone focuses on the headline numbers...
The real story is in FII positioning.

💡 The Opportunity:
→ IT sector showing signs of recovery after 8-month consolidation
→ Smart money accumulating in chemicals
→ Risk-reward favorable for selective buying

💭 Remember Buffett's wisdom:
'Time in the market beats timing the market.'

What's your take on the current market setup?

#IndianStockMarket #Nifty50 #StockMarketIndia #InvestmentIdeas #FinanceIndia"""
    
    print("\n🚀 LinkedIn Auto-Poster")
    print("=" * 50)
    print("Content to post:")
    print("-" * 50)
    print(content[:200] + "...")
    print("-" * 50)
    
    poster = LinkedInAutoPoster()
    
    if poster.run(content):
        print("\n✅ SUCCESS: Content posted to LinkedIn!")
        print("📁 Check 'posts/' folder for screenshots")
    else:
        print("\n⚠️ Manual posting required")
        
        # Save content for manual posting
        with open('posts/linkedin_manual.txt', 'w') as f:
            f.write(content)
        print("📄 Content saved to: posts/linkedin_manual.txt")


if __name__ == "__main__":
    main()