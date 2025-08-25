#!/usr/bin/env python3
'''
LinkedIn API Integration for AI Finance Agency
Uses OAuth2 for secure API access
'''

import os
import json
import requests
from urllib.parse import urlencode
from dotenv import load_dotenv

class LinkedInAPI:
    def __init__(self):
        load_dotenv()
        self.client_id = os.getenv('LINKEDIN_CLIENT_ID')
        self.client_secret = os.getenv('LINKEDIN_CLIENT_SECRET')
        self.redirect_uri = os.getenv('LINKEDIN_REDIRECT_URI', 'http://localhost:8080/callback')
        self.access_token = None
        
    def get_authorization_url(self):
        '''Generate LinkedIn OAuth authorization URL'''
        params = {
            'response_type': 'code',
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': 'r_liteprofile r_emailaddress w_member_social'
        }
        
        auth_url = f'https://www.linkedin.com/oauth/v2/authorization?{urlencode(params)}'
        return auth_url
    
    def get_access_token(self, authorization_code):
        '''Exchange authorization code for access token'''
        url = 'https://www.linkedin.com/oauth/v2/accessToken'
        
        data = {
            'grant_type': 'authorization_code',
            'code': authorization_code,
            'redirect_uri': self.redirect_uri,
            'client_id': self.client_id,
            'client_secret': self.client_secret
        }
        
        response = requests.post(url, data=data)
        
        if response.status_code == 200:
            token_data = response.json()
            self.access_token = token_data['access_token']
            
            # Save token for future use
            self.save_token(token_data)
            return token_data
        else:
            print(f'Error getting access token: {response.text}')
            return None
    
    def save_token(self, token_data):
        '''Save access token to secure storage'''
        token_file = 'secure_credentials/linkedin_token.json'
        with open(token_file, 'w') as f:
            json.dump(token_data, f, indent=4)
        print(f'✅ Access token saved to {token_file}')
    
    def post_update(self, text):
        '''Post an update to LinkedIn'''
        if not self.access_token:
            print('❌ No access token. Please authenticate first.')
            return None
        
        url = 'https://api.linkedin.com/v2/ugcPosts'
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        # Get user ID first (you'll need to implement this)
        user_id = 'urn:li:person:YOUR_USER_ID'
        
        data = {
            'author': user_id,
            'lifecycleState': 'PUBLISHED',
            'specificContent': {
                'com.linkedin.ugc.ShareContent': {
                    'shareCommentary': {
                        'text': text
                    },
                    'shareMediaCategory': 'NONE'
                }
            },
            'visibility': {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        }
        
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 201:
            print('✅ Successfully posted to LinkedIn!')
            return response.json()
        else:
            print(f'❌ Error posting: {response.text}')
            return None

# Quick test
if __name__ == '__main__':
    api = LinkedInAPI()
    
    print('🔐 LinkedIn API Credentials Loaded:')
    print(f'   Client ID: {api.client_id}')
    print(f'   Client Secret: ***HIDDEN***')
    print(f'   Redirect URI: {api.redirect_uri}')
    print('')
    print('📝 To authenticate:')
    print('1. Get authorization URL:')
    print(f'   {api.get_authorization_url()}')
    print('')
    print('2. Visit the URL, authorize, and get the code from callback')
    print('3. Exchange code for access token using: api.get_access_token(code)')

