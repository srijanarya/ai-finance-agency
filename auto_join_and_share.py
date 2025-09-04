#!/usr/bin/env python3
"""
Auto Join and Share - Opens groups and provides sharing content
"""

import webbrowser
import time
import pyperclip

# Verified groups to join
GROUPS = [
    "https://t.me/NIFTY50STOCKSSEBI",
    "https://t.me/SMT_Stock_MarketToday",
    "https://t.me/BullsVsBearsOG",
    "https://t.me/hindustan_trader_tradee",
    "https://t.me/stock_burner_03"
]

# Message to share
SHARE_MESSAGE = """📊 New Discovery for Serious Traders!

@AIFinanceNews2024

What makes it different:
• Multi-source price verification (TradingView + Yahoo + NSE)
• Educational content only (SEBI compliant)
• Real-time market updates
• No fake tips or pump & dump

Free for first 500 members! Currently at 150/500

Join: https://t.me/AIFinanceNews2024"""

def main():
    print("🚀 AUTO JOIN & SHARE HELPER")
    print("="*50)
    
    # Copy message to clipboard
    try:
        pyperclip.copy(SHARE_MESSAGE)
        print("✅ Share message copied to clipboard!")
        print("   (Just paste when ready to share)")
    except:
        print("📝 Copy this message manually:")
        print("-"*40)
        print(SHARE_MESSAGE)
        print("-"*40)
    
    print("\n📱 Opening top 5 groups in browser...")
    print("="*50)
    
    for i, group in enumerate(GROUPS, 1):
        print(f"\n[{i}/5] Opening: {group}")
        webbrowser.open(group)
        time.sleep(2)  # Give browser time to open
    
    print("\n✅ All groups opened!")
    print("\n📌 NEXT STEPS:")
    print("1. Join each group")
    print("2. Wait 5 minutes after joining")
    print("3. Paste the message (already in clipboard)")
    print("4. Move to next group")
    
    print("\n🎯 CHANNEL LINK FOR MANUAL SHARING:")
    print("https://t.me/AIFinanceNews2024")

if __name__ == "__main__":
    main()