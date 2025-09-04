#!/usr/bin/env python3
"""
Demo instant news posting
"""

import requests
from datetime import datetime

BOT_TOKEN = "8478124403:AAFNni_9GQtWwrzk3ElhkMkTKljbSQyWp9Y"
CHANNEL = "@AIFinanceNews2024"

def post_instant_news():
    """Post breaking news immediately"""
    
    message = f"""🔴 BREAKING NEWS - {datetime.now().strftime('%I:%M:%S %p')}

📰 RBI GOVERNOR STATEMENT:
"India's economic growth remains resilient despite global headwinds. GDP expected to grow at 7.2% in FY25"

📊 MARKET REACTION:
• Banking stocks surge 2%
• NIFTY breaks 24,900 resistance
• Rupee strengthens to 83.20

🎯 KEY TAKEAWAYS:
• Interest rates likely to remain unchanged
• Focus on controlling inflation
• Credit growth healthy at 16%

This is developing news. More updates to follow...

@AIFinanceNews2024"""
    
    url = f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage'
    data = {
        'chat_id': CHANNEL,
        'text': message,
        'parse_mode': 'HTML'
    }
    
    response = requests.post(url, json=data)
    if response.status_code == 200:
        print("✅ INSTANT NEWS POSTED!")
        print(f"Posted at: {datetime.now().strftime('%I:%M:%S %p')}")
    else:
        print("❌ Failed to post")

if __name__ == "__main__":
    post_instant_news()