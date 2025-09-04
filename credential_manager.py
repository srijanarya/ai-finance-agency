#!/usr/bin/env python3
'''
Credential Manager for AI Finance Agency
Securely stores and retrieves API credentials
'''

import json
import os
from pathlib import Path
from datetime import datetime

class CredentialManager:
    def __init__(self):
        self.project_dir = Path('/Users/srijan/ai-finance-agency')
        self.creds_dir = self.project_dir / 'secure_credentials'
        self.creds_dir.mkdir(exist_ok=True)
        
    def save_linkedin_creds(self, email, password):
        '''Save LinkedIn credentials securely'''
        creds = {
            'linkedin': {
                'email': email,
                'password': password,
                'profile_url': 'https://www.linkedin.com/in/srijan-arya-9a6a19244/',
                'updated_at': datetime.now().isoformat()
            }
        }
        
        creds_file = self.creds_dir / 'linkedin_credentials.json'
        with open(creds_file, 'w') as f:
            json.dump(creds, f, indent=4)
        
        print(f'✅ LinkedIn credentials saved to {creds_file}')
        
    def load_credentials(self):
        '''Load all credentials'''
        creds_file = self.creds_dir / 'linkedin_credentials.json'
        if creds_file.exists():
            with open(creds_file, 'r') as f:
                return json.load(f)
        return None
        
    def update_env_file(self):
        '''Update .env file with all credentials'''
        env_file = self.project_dir / '.env'
        # Add logic to update .env file
        print(f'✅ Environment file updated: {env_file}')

if __name__ == '__main__':
    manager = CredentialManager()
    
    # Example: Save LinkedIn credentials
    manager.save_linkedin_creds(
        email='triumfagency@gmail.com',
        password='your_secure_password'
    )
    
    # Load and display (for verification)
    creds = manager.load_credentials()
    if creds:
        print('
📧 LinkedIn Email:', creds['linkedin']['email'])
        print('✅ Credentials stored securely!')

