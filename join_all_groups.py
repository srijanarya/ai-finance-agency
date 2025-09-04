#!/usr/bin/env python3
import webbrowser
import time

# List of verified Indian trading groups
groups = [
    "https://t.me/NIFTY50STOCKSSEBI",
    "https://t.me/SMT_Stock_MarketToday",
    "https://t.me/BullsVsBearsOG",
    "https://t.me/hindustan_trader_tradee",
    "https://t.me/stock_burner_03",
    "https://t.me/indianstockmarket",
    "https://t.me/nsebsetips",
    "https://t.me/niftybankniftytrading",
    "https://t.me/intradaytradingindia",
    "https://t.me/optionstradingindia",
    "https://t.me/stockmarketindia",
    "https://t.me/tradingsignalsindia",
    "https://t.me/fotradingind",
    "https://t.me/swingtradingindia",
    "https://t.me/technicalanalysisindia",

]

print("🚀 JOINING TELEGRAM GROUPS")
print("="*50)

for i, link in enumerate(groups, 1):
    print(f"\nOpening group {i}/{len(groups)}: {link}")
    webbrowser.open(link)
    
    # Wait for you to join
    input("Press Enter after joining the group...")
    
print("\n✅ All groups opened!")
print("Now run the promotion script to share your channel!")
