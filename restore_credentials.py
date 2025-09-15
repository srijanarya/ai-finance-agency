#!/usr/bin/env python3
"""
Credential Recovery Script
Restores all social media credentials from backup
"""

import os
import json
import shutil
from pathlib import Path

def load_backup_credentials():
    """Load credentials from JSON backup"""
    backup_file = 'credentials_backup.json'
    
    if not os.path.exists(backup_file):
        print(f"❌ Backup file {backup_file} not found!")
        return None
    
    with open(backup_file, 'r') as f:
        return json.load(f)

def update_env_file(credentials):
    """Update .env file with backed up credentials"""
    env_path = '.env'
    
    # Create backup of current .env
    if os.path.exists(env_path):
        shutil.copy(env_path, f'{env_path}.backup')
        print(f"✅ Created backup of current .env as .env.backup")
    
    # Read current .env or create new
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            lines = f.readlines()
    else:
        lines = []
    
    # Update credentials
    updates = {
        # Telegram
        'TELEGRAM_BOT_TOKEN': credentials['platforms']['telegram']['bot_token'],
        'TELEGRAM_CHANNEL_ID': credentials['platforms']['telegram']['channel_id'],
        
        # Twitter
        'TWITTER_CONSUMER_KEY': credentials['platforms']['twitter']['consumer_key'],
        'TWITTER_CONSUMER_SECRET': credentials['platforms']['twitter']['consumer_secret'],
        'TWITTER_ACCESS_TOKEN': credentials['platforms']['twitter']['access_token'],
        'TWITTER_ACCESS_TOKEN_SECRET': credentials['platforms']['twitter']['access_token_secret'],
        'TWITTER_BEARER_TOKEN': credentials['platforms']['twitter']['bearer_token'],
        
        # LinkedIn
        'LINKEDIN_COMPANY_CLIENT_ID': credentials['platforms']['linkedin']['client_id'],
        'LINKEDIN_COMPANY_CLIENT_SECRET': credentials['platforms']['linkedin']['client_secret'],
        'LINKEDIN_COMPANY_ACCESS_TOKEN': credentials['platforms']['linkedin']['access_token'],
        'LINKEDIN_COMPANY_REFRESH_TOKEN': credentials['platforms']['linkedin']['refresh_token'],
        'LINKEDIN_REDIRECT_URI': credentials['platforms']['linkedin']['redirect_uri'],
    }
    
    # Update existing lines or add new ones
    for key, value in updates.items():
        found = False
        for i, line in enumerate(lines):
            if line.startswith(f'{key}='):
                lines[i] = f'{key}={value}\n'
                found = True
                print(f"✅ Updated {key}")
                break
        
        if not found:
            lines.append(f'{key}={value}\n')
            print(f"✅ Added {key}")
    
    # Write updated .env
    with open(env_path, 'w') as f:
        f.writelines(lines)
    
    print(f"\n✅ Updated {env_path} with all credentials")

def verify_credentials(credentials):
    """Display credential status"""
    print("\n" + "="*60)
    print("📊 CREDENTIAL STATUS")
    print("="*60)
    
    for platform, data in credentials['platforms'].items():
        status = "✅ WORKING" if data['status'] == 'working' else "❌ NEEDS UPDATE"
        print(f"\n{platform.upper()}: {status}")
        
        if platform == 'telegram':
            print(f"  Bot Token: ...{data['bot_token'][-10:]}")
            print(f"  Channel: {data['channel_id']}")
        elif platform == 'twitter':
            print(f"  Consumer Key: ...{data['consumer_key'][-10:]}")
            print(f"  Username: {data['username']}")
        elif platform == 'linkedin':
            print(f"  Client ID: {data['client_id']}")
            print(f"  Profile: {data['profile_name']}")
            print(f"  Token Expires: ~60 days from {data['token_created']}")

def main():
    print("="*60)
    print("🔧 CREDENTIAL RECOVERY SCRIPT")
    print("="*60)
    
    # Load backup
    print("\n📂 Loading credential backup...")
    credentials = load_backup_credentials()
    
    if not credentials:
        print("❌ Could not load credentials")
        return
    
    print(f"✅ Loaded credentials from {credentials['last_updated']}")
    
    # Display status
    verify_credentials(credentials)
    
    # Ask for confirmation
    print("\n" + "="*60)
    response = input("\n🔄 Restore these credentials to .env? (yes/no): ").strip().lower()
    
    if response == 'yes':
        update_env_file(credentials)
        
        print("\n" + "="*60)
        print("✅ CREDENTIALS RESTORED SUCCESSFULLY!")
        print("="*60)
        print("\nNext steps:")
        print("1. Test all platforms: python3 test_all_platforms.py")
        print("2. Test LinkedIn: python3 test_linkedin_post.py")
        print("3. If LinkedIn expired, renew with: python3 linkedin_oauth_personal.py")
    else:
        print("\n❌ Restoration cancelled")

if __name__ == "__main__":
    main()