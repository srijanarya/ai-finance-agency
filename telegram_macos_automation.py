#!/usr/bin/env python3
"""
macOS Telegram Desktop Automation
Uses AppleScript to automate Telegram Desktop app
"""

import subprocess
import time
import os

class TelegramMacOSAutomation:
    """Automate Telegram Desktop on macOS using AppleScript"""
    
    def __init__(self):
        self.sharing_message = """🔥 Just discovered this amazing finance channel!

@AIFinanceNews2024

🛡️ They have CREDIBILITY PROTECTION:
✅ Every data verified within 30 minutes
✅ Multi-source validation (NSE, BSE, Yahoo)  
✅ Never posts stale/old market data
✅ 8.8/10 quality score average

🚀 8 AI agents working 24/7 for accuracy!

No fake tips, only verified data + education 📚"""
        
        self.target_groups = [
            "IndianStockMarketLive",
            "StockMarketIndiaOfficial", 
            "NSEBSETips"
        ]
        
        self.personal_comments = [
            "Found this really helpful for verified market data!",
            "Finally, a channel that verifies data before posting! 🎯",
            "Love their credibility protection system!"
        ]
    
    def create_applescript_for_group(self, group_name, message, comment):
        """Create AppleScript to share to a specific group"""
        
        applescript = f'''
        tell application "Telegram"
            activate
            delay 2
            
            -- Open search
            keystroke "k" using {{command down}}
            delay 1
            
            -- Search for group
            type text "@{group_name}"
            delay 3
            
            -- Select first result (Enter)
            key code 36
            delay 4
            
            -- Type main message
            type text "{message.replace('"', '\\"')}"
            delay 1
            
            -- Send message (Enter)
            key code 36
            delay 3
            
            -- Type personal comment
            type text "{comment.replace('"', '\\"')}"
            delay 1
            
            -- Send comment (Enter)  
            key code 36
            delay 2
            
        end tell
        '''
        
        return applescript
    
    def run_applescript(self, script):
        """Execute AppleScript"""
        try:
            # Write script to temporary file
            script_path = "/tmp/telegram_automation.scpt"
            with open(script_path, 'w') as f:
                f.write(script)
            
            # Execute script
            result = subprocess.run(['osascript', script_path], 
                                  capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                return True, "Success"
            else:
                return False, result.stderr
                
        except subprocess.TimeoutExpired:
            return False, "Script timeout"
        except Exception as e:
            return False, str(e)
        finally:
            # Clean up temp file
            if os.path.exists(script_path):
                os.remove(script_path)
    
    def check_telegram_installed(self):
        """Check if Telegram Desktop is installed"""
        try:
            result = subprocess.run(['osascript', '-e', 'tell application "System Events" to return exists (processes where name is "Telegram")'], 
                                  capture_output=True, text=True)
            
            # Also check if app exists
            telegram_exists = os.path.exists("/Applications/Telegram.app")
            
            return telegram_exists
            
        except:
            return False
    
    def automated_sharing(self):
        """Run automated sharing to all groups"""
        
        print("🚀 macOS TELEGRAM DESKTOP AUTOMATION")
        print("=" * 60)
        
        # Check if Telegram is installed
        if not self.check_telegram_installed():
            print("❌ Telegram Desktop not found!")
            print("📥 Please install from: https://desktop.telegram.org/")
            print("💡 Or use the web automation instead")
            return False
        
        print("✅ Telegram Desktop found")
        print("📋 Message to share:")
        print("-" * 40)
        print(self.sharing_message[:100] + "...")
        print("-" * 40)
        
        input("🔑 Please ensure you're logged into Telegram Desktop, then press Enter...")
        
        success_count = 0
        
        for i, group in enumerate(self.target_groups):
            print(f"\n[{i+1}/{len(self.target_groups)}] 📢 Sharing to @{group}")
            
            # Create script for this group
            script = self.create_applescript_for_group(
                group, self.sharing_message, self.personal_comments[i]
            )
            
            # Execute script
            success, message = self.run_applescript(script)
            
            if success:
                print(f"✅ Successfully shared to @{group}")
                success_count += 1
            else:
                print(f"❌ Failed to share to @{group}: {message}")
            
            # Wait between shares
            if i < len(self.target_groups) - 1:
                print("⏰ Waiting 45 seconds before next share...")
                time.sleep(45)
        
        print("\n" + "=" * 60)
        print("🎉 AUTOMATION COMPLETE!")
        print(f"✅ Successfully shared to {success_count}/{len(self.target_groups)} groups")
        print(f"📊 Expected new subscribers: {success_count * 15}-{success_count * 25}")
        
        if success_count > 0:
            print("📈 Check your @AIFinanceNews2024 channel for new subscribers!")
        
        return success_count > 0

def run_macos_automation():
    """Run the macOS automation"""
    
    print("🍎 macOS TELEGRAM AUTOMATION")
    print("=" * 50)
    print("This will automatically:")
    print("✅ Open Telegram Desktop app")
    print("✅ Search for target groups")
    print("✅ Share credibility message")  
    print("✅ Add personal comments")
    print("✅ Wait between shares")
    print("=" * 50)
    print("⚠️  Requirements:")
    print("📱 Telegram Desktop app installed")
    print("🔑 Already logged into Telegram")
    print("🖥️  macOS with AppleScript support")
    print("=" * 50)
    
    automator = TelegramMacOSAutomation()
    
    choice = input("Ready to start? (y/n): ").lower()
    if choice == 'y':
        automator.automated_sharing()
    else:
        print("👋 Automation cancelled")
        print("💡 Alternative: Use 'python auto_telegram_web_sharer.py' for web version")

if __name__ == "__main__":
    run_macos_automation()