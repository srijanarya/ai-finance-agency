#!/usr/bin/env python3
"""
Test All APIs - Verify complete setup
"""

import os
from dotenv import load_dotenv
import tweepy
import requests
from colorama import init, Fore, Style

load_dotenv()
init(autoreset=True)

def test_openai():
    """Test OpenAI API"""
    api_key = os.getenv('OPENAI_API_KEY')
    if api_key and not api_key.startswith('sk-...'):
        print(f"{Fore.GREEN}✅ OpenAI API configured{Style.RESET_ALL}")
        return True
    else:
        print(f"{Fore.YELLOW}⚠️  OpenAI API not configured{Style.RESET_ALL}")
        return False

def test_twitter():
    """Test Twitter/X API"""
    try:
        consumer_key = os.getenv('TWITTER_CONSUMER_KEY')
        consumer_secret = os.getenv('TWITTER_CONSUMER_SECRET')
        access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        
        if all([consumer_key, consumer_secret, access_token, access_token_secret]):
            auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
            auth.set_access_token(access_token, access_token_secret)
            api = tweepy.API(auth)
            user = api.verify_credentials()
            print(f"{Fore.GREEN}✅ Twitter/X API connected: @{user.screen_name}{Style.RESET_ALL}")
            return True
    except Exception as e:
        print(f"{Fore.RED}❌ Twitter/X API error: {e}{Style.RESET_ALL}")
        return False

def test_telegram():
    """Test Telegram Bot API"""
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    if not bot_token:
        print(f"{Fore.YELLOW}⚠️  Telegram bot token not configured{Style.RESET_ALL}")
        return False
    
    try:
        response = requests.get(f"https://api.telegram.org/bot{bot_token}/getMe")
        if response.status_code == 200:
            bot_info = response.json()['result']
            print(f"{Fore.GREEN}✅ Telegram bot connected: @{bot_info['username']}{Style.RESET_ALL}")
            
            # Test channel access
            channel_id = os.getenv('TELEGRAM_CHANNEL_ID', '@AIFinanceAgency')
            test_msg = {
                'chat_id': channel_id,
                'text': '🚀 AI Finance Agency Bot Test Message\n\nBot successfully connected!',
                'parse_mode': 'Markdown'
            }
            
            # Try sending a test message
            send_response = requests.post(
                f"https://api.telegram.org/bot{bot_token}/sendMessage",
                json=test_msg
            )
            
            if send_response.status_code == 200:
                print(f"{Fore.GREEN}✅ Can post to channel: {channel_id}{Style.RESET_ALL}")
            else:
                error = send_response.json().get('description', 'Unknown error')
                if 'chat not found' in error.lower():
                    print(f"{Fore.YELLOW}⚠️  Channel {channel_id} not found or bot not added as admin{Style.RESET_ALL}")
                    print(f"    → Create channel and add @{bot_info['username']} as admin")
                else:
                    print(f"{Fore.YELLOW}⚠️  Cannot post to channel: {error}{Style.RESET_ALL}")
            
            return True
        else:
            print(f"{Fore.RED}❌ Telegram bot connection failed{Style.RESET_ALL}")
            return False
    except Exception as e:
        print(f"{Fore.RED}❌ Telegram error: {e}{Style.RESET_ALL}")
        return False

def test_linkedin():
    """Test LinkedIn API"""
    client_id = os.getenv('LINKEDIN_CLIENT_ID')
    access_token = os.getenv('LINKEDIN_ACCESS_TOKEN')
    
    if client_id and access_token:
        print(f"{Fore.GREEN}✅ LinkedIn API configured{Style.RESET_ALL}")
        return True
    else:
        print(f"{Fore.YELLOW}⚠️  LinkedIn API partially configured{Style.RESET_ALL}")
        return False

def main():
    """Run all API tests"""
    print(f"\n{Fore.CYAN}{'='*50}")
    print(f"{Fore.YELLOW}AI FINANCE AGENCY - API STATUS CHECK")
    print(f"{Fore.CYAN}{'='*50}{Style.RESET_ALL}\n")
    
    results = {
        'OpenAI': test_openai(),
        'Twitter/X': test_twitter(),
        'Telegram': test_telegram(),
        'LinkedIn': test_linkedin()
    }
    
    print(f"\n{Fore.CYAN}{'='*50}")
    print(f"{Fore.YELLOW}SUMMARY")
    print(f"{Fore.CYAN}{'='*50}{Style.RESET_ALL}")
    
    ready_count = sum(1 for v in results.values() if v)
    total_count = len(results)
    
    print(f"\n{ready_count}/{total_count} APIs configured and ready")
    
    if ready_count == total_count:
        print(f"\n{Fore.GREEN}🎉 All systems operational!{Style.RESET_ALL}")
        print(f"\nYou can now run:")
        print(f"  • python3 proof_of_concept.py - Full demo")
        print(f"  • python3 dashboard.py - Web dashboard")
        print(f"  • python3 x_trader_publisher.py - Post to X")
        print(f"  • python3 telegram_news_broadcaster.py - Broadcast to Telegram")
    else:
        print(f"\n{Fore.YELLOW}Some APIs need configuration{Style.RESET_ALL}")
    
    return ready_count == total_count

if __name__ == "__main__":
    success = main()