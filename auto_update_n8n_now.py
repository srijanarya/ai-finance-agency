#!/usr/bin/env python3
"""
Automatically update n8n workflow NOW
"""

import subprocess
import time
import pyautogui
import pyperclip
from datetime import datetime

# Disable failsafe
pyautogui.FAILSAFE = False
pyautogui.PAUSE = 0.5

print(f"🤖 AUTO-UPDATING N8N at {datetime.now().strftime('%I:%M:%S %p')}")
print("=" * 50)

# Workflow already in clipboard from previous command
# Just need to paste it

# Focus n8n
print("1️⃣ Focusing n8n browser...")
subprocess.run(["open", "http://localhost:5678"])
time.sleep(2)

# Select all
print("2️⃣ Selecting all (Cmd+A)...")
pyautogui.hotkey('cmd', 'a')
time.sleep(0.5)

# Paste
print("3️⃣ Pasting new workflow (Cmd+V)...")
pyautogui.hotkey('cmd', 'v')
time.sleep(1)

# Save
print("4️⃣ Saving (Cmd+S)...")
pyautogui.hotkey('cmd', 's')
time.sleep(1)

# Press Enter if save dialog appears
pyautogui.press('enter')
time.sleep(0.5)

# Execute workflow
print("5️⃣ Executing workflow (Cmd+Enter)...")
pyautogui.hotkey('cmd', 'enter')

print(f"\n✅ UPDATED at {datetime.now().strftime('%I:%M:%S %p')}")
print("Workflow should now show current timestamp in n8n!")