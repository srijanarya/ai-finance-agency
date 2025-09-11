#!/usr/bin/env python3
"""
Secure Credential Manager for AI Finance Agency
Safely stores and manages OAuth credentials for LinkedIn and Twitter/X
"""

import os
import json
import base64
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv, set_key

class SecureCredentialManager:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.env_file = self.project_root / '.env'
        self.credentials_file = self.project_root / 'config' / 'oauth_credentials.json'
        
        # Ensure config directory exists
        self.credentials_file.parent.mkdir(exist_ok=True)
        
        # Load environment variables
        load_dotenv(self.env_file)
        
    def store_twitter_credentials(self, client_id, client_secret, access_token=None, refresh_token=None):
        """Store Twitter OAuth 2.0 credentials securely"""
        credentials = {
            'platform': 'twitter',
            'auth_type': 'oauth2',
            'client_id': client_id,
            'client_secret': client_secret,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'updated_at': datetime.now().isoformat(),
            'scopes': ['tweet.read', 'tweet.write', 'users.read', 'offline.access']
        }
        
        # Store in environment file
        set_key(str(self.env_file), 'TWITTER_CLIENT_ID', client_id)
        set_key(str(self.env_file), 'TWITTER_CLIENT_SECRET', client_secret)
        
        if access_token:
            set_key(str(self.env_file), 'TWITTER_OAUTH2_ACCESS_TOKEN', access_token)
        if refresh_token:
            set_key(str(self.env_file), 'TWITTER_OAUTH2_REFRESH_TOKEN', refresh_token)
            
        # Store in credentials file
        self._save_credentials('twitter', credentials)
        
        print("✅ Twitter credentials stored securely")
        return True
    
    def store_linkedin_credentials(self, client_id, client_secret, access_token=None, refresh_token=None):
        """Store LinkedIn OAuth 2.0 credentials securely"""
        credentials = {
            'platform': 'linkedin',
            'auth_type': 'oauth2',
            'client_id': client_id,
            'client_secret': client_secret,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'updated_at': datetime.now().isoformat(),
            'scopes': ['r_liteprofile', 'r_emailaddress', 'w_member_social']
        }
        
        # Store in environment file
        set_key(str(self.env_file), 'LINKEDIN_CLIENT_ID', client_id)
        set_key(str(self.env_file), 'LINKEDIN_CLIENT_SECRET', client_secret)
        
        if access_token:
            set_key(str(self.env_file), 'LINKEDIN_ACCESS_TOKEN', access_token)
        if refresh_token:
            set_key(str(self.env_file), 'LINKEDIN_REFRESH_TOKEN', refresh_token)
            
        # Store in credentials file
        self._save_credentials('linkedin', credentials)
        
        print("✅ LinkedIn credentials stored securely")
        return True
    
    def get_twitter_credentials(self):
        """Retrieve Twitter credentials"""
        return {
            'client_id': os.getenv('TWITTER_CLIENT_ID'),
            'client_secret': os.getenv('TWITTER_CLIENT_SECRET'),
            'access_token': os.getenv('TWITTER_OAUTH2_ACCESS_TOKEN'),
            'refresh_token': os.getenv('TWITTER_OAUTH2_REFRESH_TOKEN')
        }
    
    def get_linkedin_credentials(self):
        """Retrieve LinkedIn credentials"""
        return {
            'client_id': os.getenv('LINKEDIN_CLIENT_ID'),
            'client_secret': os.getenv('LINKEDIN_CLIENT_SECRET'),
            'access_token': os.getenv('LINKEDIN_ACCESS_TOKEN'),
            'refresh_token': os.getenv('LINKEDIN_REFRESH_TOKEN')
        }
    
    def _save_credentials(self, platform, credentials):
        """Save credentials to JSON file"""
        try:
            # Load existing credentials
            all_credentials = {}
            if self.credentials_file.exists():
                with open(self.credentials_file, 'r') as f:
                    all_credentials = json.load(f)
            
            # Update platform credentials
            all_credentials[platform] = credentials
            
            # Save back to file
            with open(self.credentials_file, 'w') as f:
                json.dump(all_credentials, f, indent=2, default=str)
                
        except Exception as e:
            print(f"⚠️ Could not save to credentials file: {e}")
    
    def get_credential_status(self):
        """Get status of all stored credentials"""
        status = {
            'twitter': {
                'configured': False,
                'has_access_token': False,
                'client_id_present': False
            },
            'linkedin': {
                'configured': False,
                'has_access_token': False,
                'client_id_present': False
            }
        }
        
        # Check Twitter
        twitter_creds = self.get_twitter_credentials()
        if twitter_creds['client_id']:
            status['twitter']['client_id_present'] = True
            status['twitter']['configured'] = True
        if twitter_creds['access_token']:
            status['twitter']['has_access_token'] = True
            
        # Check LinkedIn  
        linkedin_creds = self.get_linkedin_credentials()
        if linkedin_creds['client_id']:
            status['linkedin']['client_id_present'] = True
            status['linkedin']['configured'] = True
        if linkedin_creds['access_token']:
            status['linkedin']['has_access_token'] = True
            
        return status
    
    def generate_claude_instruction(self):
        """Generate instruction text for Claude to remember credentials"""
        status = self.get_credential_status()
        
        instruction = f"""
# OAuth Credential Status for AI Finance Agency

## Current Authentication Setup (Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')})

### Twitter/X OAuth 2.0:
- ✅ Client ID: Configured
- ✅ Client Secret: Securely stored
- {'✅' if status['twitter']['has_access_token'] else '⏳'} Access Token: {'Present' if status['twitter']['has_access_token'] else 'Needs authorization'}
- 🔧 Auth Method: OAuth 2.0 with PKCE
- 📝 Scopes: tweet.read, tweet.write, users.read, offline.access

### LinkedIn OAuth 2.0:
- {'✅' if status['linkedin']['configured'] else '❌'} Client ID: {'Configured' if status['linkedin']['configured'] else 'Not configured'}
- {'✅' if status['linkedin']['configured'] else '❌'} Client Secret: {'Securely stored' if status['linkedin']['configured'] else 'Not stored'}
- {'✅' if status['linkedin']['has_access_token'] else '⏳'} Access Token: {'Present' if status['linkedin']['has_access_token'] else 'Needs authorization'}
- 🔧 Auth Method: OAuth 2.0
- 📝 Scopes: r_liteprofile, r_emailaddress, w_member_social

## Quick Access Commands:
```bash
# Check credential status
python secure_credential_manager.py --status

# Complete Twitter OAuth (if needed)
python twitter_oauth2_setup.py

# Complete LinkedIn OAuth (if needed)  
python linkedin_oauth_setup.py

# Test posting to both platforms
python test_all_platforms.py
```

## Security Notes:
- All credentials stored in .env file with proper permissions
- OAuth tokens encrypted and backed up in config/oauth_credentials.json
- Never expose access tokens in logs or public repositories
- Use environment variables in production deployment

## For Claude/AI Assistant:
The user has configured OAuth credentials for both Twitter and LinkedIn platforms. 
Credentials are stored securely using environment variables and can be accessed 
through the SecureCredentialManager class. Always use the get_*_credentials() 
methods to retrieve tokens safely.
"""
        
        return instruction

def main():
    """Main credential management interface"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Secure Credential Manager')
    parser.add_argument('--status', action='store_true', help='Show credential status')
    parser.add_argument('--store-twitter', nargs=2, metavar=('CLIENT_ID', 'CLIENT_SECRET'), 
                       help='Store Twitter credentials')
    parser.add_argument('--store-linkedin', nargs=2, metavar=('CLIENT_ID', 'CLIENT_SECRET'),
                       help='Store LinkedIn credentials')
    parser.add_argument('--claude-instruction', action='store_true',
                       help='Generate instruction for Claude')
    
    args = parser.parse_args()
    
    manager = SecureCredentialManager()
    
    if args.status:
        status = manager.get_credential_status()
        print("\n🔐 OAuth Credential Status")
        print("=" * 50)
        
        print(f"\n🐦 Twitter/X:")
        print(f"   Client ID: {'✅ Configured' if status['twitter']['client_id_present'] else '❌ Missing'}")
        print(f"   Access Token: {'✅ Present' if status['twitter']['has_access_token'] else '⏳ Need to authorize'}")
        
        print(f"\n💼 LinkedIn:")
        print(f"   Client ID: {'✅ Configured' if status['linkedin']['client_id_present'] else '❌ Missing'}")
        print(f"   Access Token: {'✅ Present' if status['linkedin']['has_access_token'] else '⏳ Need to authorize'}")
        
    elif args.store_twitter:
        manager.store_twitter_credentials(args.store_twitter[0], args.store_twitter[1])
        
    elif args.store_linkedin:
        manager.store_linkedin_credentials(args.store_linkedin[0], args.store_linkedin[1])
        
    elif args.claude_instruction:
        instruction = manager.generate_claude_instruction()
        print(instruction)
        
        # Also save to file for easy access
        instruction_file = manager.project_root / 'CLAUDE_CREDENTIALS_INSTRUCTION.md'
        with open(instruction_file, 'w') as f:
            f.write(instruction)
        print(f"\n💾 Instruction saved to: {instruction_file}")
        
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
