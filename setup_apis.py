#!/usr/bin/env python3
"""
API Setup Helper - Opens necessary pages for API configuration
Uses Playwright for browser automation
"""

import asyncio
import time
from playwright.async_api import async_playwright
import webbrowser

async def setup_twitter_api():
    """Open Twitter Developer Portal"""
    print("\n🐦 TWITTER/X DEVELOPER SETUP")
    print("="*50)
    print("Opening Twitter Developer Portal...")
    print("\nSteps to follow:")
    print("1. Sign in with your Twitter account")
    print("2. Create a new App (or use existing)")
    print("3. Go to 'Keys and tokens' tab")
    print("4. Copy the following:")
    print("   - API Key (Consumer Key)")
    print("   - API Key Secret (Consumer Secret)")
    print("   - Access Token (already have)")
    print("   - Access Token Secret (already have)")
    
    # Open Twitter Developer Portal
    webbrowser.open("https://developer.twitter.com/en/portal/dashboard")
    
    input("\nPress Enter after you've copied the Consumer Keys...")
    
    consumer_key = input("Enter Twitter Consumer Key: ")
    consumer_secret = input("Enter Twitter Consumer Secret: ")
    
    return consumer_key, consumer_secret

async def setup_telegram_bot():
    """Guide through Telegram bot creation"""
    print("\n🤖 TELEGRAM BOT SETUP")
    print("="*50)
    print("Opening Telegram Web...")
    print("\nSteps to follow:")
    print("1. Search for @BotFather")
    print("2. Send: /newbot")
    print("3. Choose a name for your bot (e.g., AI Finance News)")
    print("4. Choose a username (must end in 'bot', e.g., AIFinanceAgencyBot)")
    print("5. Copy the bot token BotFather gives you")
    print("\nThen create a channel:")
    print("6. Create a new channel in Telegram")
    print("7. Make it public with username (e.g., @AIFinanceAgency)")
    print("8. Add your bot as administrator to the channel")
    
    # Open Telegram Web
    webbrowser.open("https://web.telegram.org/")
    
    input("\nPress Enter after creating the bot and channel...")
    
    bot_token = input("Enter Telegram Bot Token: ")
    channel_id = input("Enter Channel ID (e.g., @AIFinanceAgency): ")
    
    return bot_token, channel_id

async def setup_anthropic_api():
    """Open Anthropic Console"""
    print("\n🤖 ANTHROPIC API SETUP")
    print("="*50)
    print("Opening Anthropic Console...")
    print("\nSteps to follow:")
    print("1. Sign in to your Anthropic account")
    print("2. Go to API Keys section")
    print("3. Create a new API key")
    print("4. Copy the API key")
    
    webbrowser.open("https://console.anthropic.com/settings/keys")
    
    input("\nPress Enter after you've accessed the console...")
    
    api_key = input("Enter Anthropic API Key (or press Enter to skip): ")
    return api_key if api_key else None

async def setup_google_ai():
    """Open Google AI Studio"""
    print("\n🔮 GOOGLE AI SETUP")
    print("="*50)
    print("Opening Google AI Studio...")
    print("\nSteps to follow:")
    print("1. Sign in with your Google account")
    print("2. Get API key from the dashboard")
    print("3. Copy the API key")
    
    webbrowser.open("https://aistudio.google.com/apikey")
    
    input("\nPress Enter after accessing AI Studio...")
    
    api_key = input("Enter Google AI Key (or press Enter to skip): ")
    return api_key if api_key else None

def update_env_file(updates):
    """Update .env file with new keys"""
    env_path = "/Users/srijan/ai-finance-agency/.env"
    
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
                break
        if not updated:
            new_lines.append(line)
    
    # Add new keys if not present
    for key, value in updates.items():
        if not any(line.startswith(f"{key}=") for line in new_lines):
            new_lines.append(f"{key}={value}\n")
    
    # Write back
    with open(env_path, 'w') as f:
        f.writelines(new_lines)
    
    print("\n✅ .env file updated successfully!")

async def main():
    """Main setup flow"""
    print("🚀 AI FINANCE AGENCY - API SETUP WIZARD")
    print("="*50)
    print("This wizard will help you set up all necessary APIs")
    print("We'll open the required pages and guide you through each step")
    
    updates = {}
    
    # Twitter Setup
    print("\n" + "="*50)
    choice = input("Setup Twitter/X API? (y/n): ")
    if choice.lower() == 'y':
        consumer_key, consumer_secret = await setup_twitter_api()
        if consumer_key and consumer_secret:
            updates['TWITTER_CONSUMER_KEY'] = consumer_key
            updates['TWITTER_CONSUMER_SECRET'] = consumer_secret
    
    # Telegram Setup
    print("\n" + "="*50)
    choice = input("Setup Telegram Bot? (y/n): ")
    if choice.lower() == 'y':
        bot_token, channel_id = await setup_telegram_bot()
        if bot_token:
            updates['TELEGRAM_BOT_TOKEN'] = bot_token
            updates['TELEGRAM_CHANNEL_ID'] = channel_id
    
    # Anthropic Setup
    print("\n" + "="*50)
    choice = input("Setup Anthropic API? (y/n): ")
    if choice.lower() == 'y':
        api_key = await setup_anthropic_api()
        if api_key:
            updates['ANTHROPIC_API_KEY'] = api_key
    
    # Google AI Setup
    print("\n" + "="*50)
    choice = input("Setup Google AI? (y/n): ")
    if choice.lower() == 'y':
        api_key = await setup_google_ai()
        if api_key:
            updates['GOOGLE_AI_KEY'] = api_key
    
    # Update .env file
    if updates:
        print("\n" + "="*50)
        print("Updating .env file with new credentials...")
        update_env_file(updates)
        
        print("\n📋 SUMMARY")
        print("="*50)
        print("Updated the following APIs:")
        for key in updates:
            print(f"  ✅ {key}")
    else:
        print("\nNo updates made to .env file")
    
    print("\n🎉 Setup Complete!")
    print("You can now run: python3 proof_of_concept.py")

if __name__ == "__main__":
    asyncio.run(main())