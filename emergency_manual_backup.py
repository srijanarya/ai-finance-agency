#!/usr/bin/env python3
# Emergency Manual Backup
import webbrowser
import subprocess
import time

# Copy message to clipboard
message = '''🔥 Just discovered this amazing finance channel!

@AIFinanceNews2024

🛡️ They have CREDIBILITY PROTECTION:
✅ Every data verified within 30 minutes
✅ Multi-source validation (NSE, BSE, Yahoo)  
✅ Never posts stale/old market data
✅ 8.8/10 quality score average

🚀 8 AI agents working 24/7 for accuracy!

No fake tips, only verified data + education 📚'''

try:
    process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
    process.communicate(message.encode())
    print("✅ Message copied to clipboard")
except:
    print("❌ Could not copy to clipboard")

# Open tabs
webbrowser.open("https://web.telegram.org/k/")
time.sleep(2)

for group in ['IndianStockMarketLive', 'StockMarketIndiaOfficial', 'NSEBSETips']:
    webbrowser.open(f"https://t.me/{group}")
    time.sleep(1)

print("✅ Browser tabs opened")
print("📋 Message is in clipboard - paste (Cmd+V) in each group tab")
print("💬 Add personal comments as shown in instructions")
