#!/usr/bin/env python3
"""
Update API Keys in .env file
Simple interactive script to update your API credentials
"""

import os

def update_env_file():
    """Update .env file with new API keys"""
    env_path = "/Users/srijan/ai-finance-agency/.env"
    
    print("🔑 API KEY UPDATER")
    print("="*50)
    print("Enter the API keys you obtained (press Enter to skip)")
    print("")
    
    # Collect keys
    updates = {}
    
    # Twitter/X
    print("TWITTER/X API:")
    consumer_key = input("  Consumer Key (API Key): ").strip()
    if consumer_key:
        updates['TWITTER_CONSUMER_KEY'] = consumer_key
    
    consumer_secret = input("  Consumer Secret (API Secret): ").strip()
    if consumer_secret:
        updates['TWITTER_CONSUMER_SECRET'] = consumer_secret
    
    # Telegram
    print("\nTELEGRAM:")
    bot_token = input("  Bot Token: ").strip()
    if bot_token:
        updates['TELEGRAM_BOT_TOKEN'] = bot_token
    
    channel_id = input("  Channel ID (@channelname): ").strip()
    if channel_id:
        updates['TELEGRAM_CHANNEL_ID'] = channel_id
    
    # Anthropic
    print("\nANTHROPIC:")
    anthropic_key = input("  API Key: ").strip()
    if anthropic_key:
        updates['ANTHROPIC_API_KEY'] = anthropic_key
    
    # Google AI
    print("\nGOOGLE AI:")
    google_key = input("  API Key: ").strip()
    if google_key:
        updates['GOOGLE_AI_KEY'] = google_key
    
    if not updates:
        print("\n❌ No keys to update")
        return
    
    # Read current .env
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    # Update lines
    new_lines = []
    for line in lines:
        updated = False
        for key, value in updates.items():
            if line.startswith(f"{key}="):
                new_lines.append(f"{key}={value}\n")
                updated = True
                print(f"  ✅ Updated {key}")
                break
        if not updated:
            new_lines.append(line)
    
    # Add new keys if not present
    for key, value in updates.items():
        if not any(line.startswith(f"{key}=") for line in new_lines):
            new_lines.append(f"{key}={value}\n")
            print(f"  ✅ Added {key}")
    
    # Write back
    with open(env_path, 'w') as f:
        f.writelines(new_lines)
    
    print("\n✅ .env file updated successfully!")
    print("\nNext steps:")
    print("1. Test Twitter/X posting: python3 x_trader_publisher.py")
    print("2. Test Telegram: python3 telegram_news_broadcaster.py")
    print("3. Run full demo: python3 proof_of_concept.py")

if __name__ == "__main__":
    update_env_file()