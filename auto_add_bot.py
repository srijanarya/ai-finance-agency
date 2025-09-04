#!/usr/bin/env python3
"""
Automated Telegram Bot Addition using PyAutoGUI
"""

import pyautogui
import time
import subprocess

# Safety settings
pyautogui.FAILSAFE = True
pyautogui.PAUSE = 1

def add_bot_to_channel():
    print("🤖 Starting Telegram bot addition automation...")
    print("You have 3 seconds to position your mouse. Don't move it after that!")
    time.sleep(3)
    
    # Open Telegram
    subprocess.run(["open", "-a", "Telegram"])
    time.sleep(3)
    
    # Open search with Cmd+K
    pyautogui.hotkey('cmd', 'k')
    time.sleep(1)
    
    # Search for bot first to activate it
    pyautogui.typewrite('@AIFinanceAgencyBot')
    time.sleep(2)
    pyautogui.press('enter')
    time.sleep(2)
    
    # Send /start to bot
    pyautogui.typewrite('/start')
    pyautogui.press('enter')
    time.sleep(2)
    
    # Now search for channel
    pyautogui.hotkey('cmd', 'k')
    time.sleep(1)
    pyautogui.typewrite('@AIFinanceNews2024')
    time.sleep(2)
    pyautogui.press('enter')
    time.sleep(3)
    
    # Open channel info
    pyautogui.hotkey('cmd', 'i')
    time.sleep(2)
    
    print("✅ Channel info should be open now")
    print("\n📱 Manual steps needed:")
    print("1. Look for 'Subscribers' or member count")
    print("2. Click on it")
    print("3. Click 'Add Members' or '+'")
    print("4. Type: AIFinanceAgencyBot")
    print("5. Select the bot and add")
    print("6. Then promote to admin with 'Post Messages' permission")
    
    # Try to click on Administrators area (approximate location)
    # This might need adjustment based on screen size
    screen_width, screen_height = pyautogui.size()
    
    # Click approximately where "Administrators" might be
    pyautogui.click(screen_width // 2, screen_height // 3)
    time.sleep(1)
    
    # Try Tab navigation to find Add button
    for _ in range(10):
        pyautogui.press('tab')
        time.sleep(0.5)
    
    print("\n✅ Automation complete. Please complete the manual steps above.")

if __name__ == "__main__":
    add_bot_to_channel()