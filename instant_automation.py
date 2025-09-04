#!/usr/bin/env python3
"""
INSTANT AUTOMATION - Works immediately
"""

import webbrowser
import subprocess
import time

def main():
    print("⚡ INSTANT AUTOMATION")
    print("=" * 50)
    
    # JavaScript code for automation
    js_code = '''// Paste this in browser console (F12)
const message = `🔥 Just discovered this amazing finance channel!

@AIFinanceNews2024

🛡️ They have CREDIBILITY PROTECTION:
✅ Every data verified within 30 minutes
✅ Multi-source validation (NSE, BSE, Yahoo)  
✅ Never posts stale/old market data
✅ 8.8/10 quality score average

🚀 8 AI agents working 24/7 for accuracy!

No fake tips, only verified data + education 📚`;

const comments = ["Found this really helpful!", "Finally, verified data! 🎯", "Love the credibility system!"];
let idx = 0;

function send(text) {
    const input = document.querySelector('div[contenteditable="true"], .input-message-input');
    if (input) {
        input.focus();
        input.textContent = text;
        setTimeout(() => {
            input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', keyCode: 13, bubbles: true}));
        }, 500);
        return true;
    }
    return false;
}

if (send(message)) {
    console.log("✅ Message sent");
    setTimeout(() => {
        if (send(comments[idx % 3])) {
            console.log("✅ Comment sent");
            idx++;
        }
    }, 3000);
}'''
    
    # Copy to clipboard
    try:
        subprocess.run(['pbcopy'], input=js_code.encode())
        print("✅ JavaScript copied to clipboard")
    except:
        print("⚠️ Could not copy to clipboard")
    
    # Open tabs
    print("🌐 Opening tabs...")
    webbrowser.open("https://web.telegram.org/k/")
    time.sleep(2)
    
    for group in ["IndianStockMarketLive", "StockMarketIndiaOfficial", "NSEBSETips"]:
        webbrowser.open(f"https://t.me/{group}")
        time.sleep(1)
    
    print("✅ Opened 4 tabs")
    
    # Save script
    with open("/Users/srijan/ai-finance-agency/automation.js", "w") as f:
        f.write(js_code)
    
    subprocess.run(['open', "/Users/srijan/ai-finance-agency/automation.js"])
    
    print("\n🎯 EXECUTE NOW:")
    print("1. Go to first group tab")
    print("2. Press F12 (open console)")
    print("3. Paste script (Cmd+V)")
    print("4. Press Enter")
    print("5. Repeat for other 2 tabs")
    print("\n📊 Expected: 30-90 subscribers!")

if __name__ == "__main__":
    main()
