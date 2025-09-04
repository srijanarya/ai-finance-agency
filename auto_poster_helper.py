#!/usr/bin/env python3
"""
Auto Poster Helper - Copies messages to clipboard for easy sharing
"""

import pyperclip
import time
import random

messages = [
    """For data accuracy discussion:

@AIFinanceNews2024 verifies everything before posting.

No single-source errors. Educational only.

Link: https://t.me/AIFinanceNews2024""",
    """For serious traders only:

@AIFinanceNews2024 - Multi-source verified data

No fake tips. Educational content only.

https://t.me/AIFinanceNews2024""",
    """Data verification is crucial!

@AIFinanceNews2024 checks 3+ sources before posting.

Free for early members: https://t.me/AIFinanceNews2024"""
]

print("🤖 AUTO POSTER HELPER")
print("="*50)

while True:
    # Select random message
    msg = random.choice(messages)
    
    # Copy to clipboard
    try:
        pyperclip.copy(msg)
        print("\n✅ Message copied to clipboard!")
        print("-"*40)
        print(msg)
        print("-"*40)
        print("\n📱 Paste this in Telegram groups")
        print("Press Enter for next message...")
        input()
    except:
        print("Install pyperclip: pip3 install pyperclip")
        break
