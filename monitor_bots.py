#!/usr/bin/env python3
"""
Monitor running bots and show their status
"""

import subprocess
import requests
import time
from datetime import datetime

BOT_TOKEN = "8478124403:AAFNni_9GQtWwrzk3ElhkMkTKljbSQyWp9Y"
CHANNEL = "@AIFinanceNews2024"

def check_bot_status():
    """Check if bot is working"""
    url = f'https://api.telegram.org/bot{BOT_TOKEN}/getMe'
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data['ok']:
                print(f"✅ Bot is active: @{data['result']['username']}")
                return True
    except:
        pass
    print("❌ Bot not responding")
    return False

def get_channel_info():
    """Get channel subscriber count"""
    url = f'https://api.telegram.org/bot{BOT_TOKEN}/getChat'
    data = {'chat_id': CHANNEL}
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            result = response.json()
            if result['ok']:
                chat = result['result']
                print(f"📱 Channel: {chat.get('title', 'Unknown')}")
                print(f"   Username: @{chat.get('username', 'Unknown')}")
                # Note: member count may not be available for channels
                if 'member_count' in chat:
                    print(f"   Subscribers: {chat['member_count']}")
                return True
    except Exception as e:
        print(f"Error getting channel info: {e}")
    return False

def check_running_processes():
    """Check running bot processes"""
    try:
        result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
        lines = result.stdout.split('\n')
        
        bots = []
        for line in lines:
            if 'python' in line and any(bot in line for bot in ['zero_manual_bot', 'automated_bot', 'full_auto']):
                parts = line.split()
                if len(parts) > 10:
                    pid = parts[1]
                    script = parts[-1]
                    bots.append({'pid': pid, 'script': script})
        
        if bots:
            print(f"\n🤖 Running bots ({len(bots)}):")
            for bot in bots:
                print(f"   PID {bot['pid']}: {bot['script']}")
        else:
            print("\n❌ No bots running")
        
        return len(bots) > 0
    except:
        return False

def post_test_message():
    """Post a test message to channel"""
    url = f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage'
    message = f"""📊 AUTOMATION STATUS UPDATE
    
Time: {datetime.now().strftime('%I:%M %p')}

✅ Bot systems active
✅ Channel growing automatically
✅ Zero manual work required

Educational content only.

@AIFinanceNews2024"""
    
    data = {
        'chat_id': CHANNEL,
        'text': message,
        'parse_mode': 'HTML'
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            print("\n✅ Successfully posted to channel")
            return True
    except Exception as e:
        print(f"\n❌ Failed to post: {e}")
    return False

def main():
    print("🔍 TELEGRAM BOT MONITOR")
    print("="*50)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %I:%M %p')}")
    print("-"*50)
    
    # Check bot status
    print("\n1. BOT STATUS:")
    check_bot_status()
    
    # Check channel info
    print("\n2. CHANNEL INFO:")
    get_channel_info()
    
    # Check running processes
    print("\n3. RUNNING PROCESSES:")
    check_running_processes()
    
    # Post test message
    print("\n4. POSTING TEST MESSAGE:")
    post_test_message()
    
    print("\n" + "="*50)
    print("✅ Monitoring complete")
    print("="*50)

if __name__ == "__main__":
    main()