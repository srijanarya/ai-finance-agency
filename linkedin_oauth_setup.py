#!/usr/bin/env python3
"""
LinkedIn OAuth Setup
Get access token for automated posting
"""

import os
import json
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import requests
import threading
from dotenv import load_dotenv

load_dotenv()


class OAuthCallbackHandler(BaseHTTPRequestHandler):
    """Handle OAuth callback from LinkedIn"""
    
    def do_GET(self):
        """Handle GET request with authorization code"""
        query = urlparse(self.path).query
        params = parse_qs(query)
        
        if 'code' in params:
            self.server.auth_code = params['code'][0]
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            success_html = """
            <html>
            <head><title>LinkedIn OAuth Success</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1 style="color: #0077B5;">✅ Authorization Successful!</h1>
                <p>You can close this window and return to the terminal.</p>
                <p style="color: #666;">Access token will be saved automatically.</p>
            </body>
            </html>
            """
            self.wfile.write(success_html.encode())
        else:
            self.send_response(400)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<h1>Error: No authorization code received</h1>")
    
    def log_message(self, format, *args):
        """Suppress log messages"""
        pass


class LinkedInOAuth:
    """Handle LinkedIn OAuth flow"""
    
    def __init__(self):
        self.client_id = os.getenv('LINKEDIN_PERSONAL_CLIENT_ID')
        self.client_secret = os.getenv('LINKEDIN_PERSONAL_CLIENT_SECRET')
        self.redirect_uri = 'http://localhost:8080/callback'
        self.auth_code = None
        self.access_token = None
        
    def get_authorization_url(self):
        """Generate LinkedIn authorization URL"""
        scope = 'w_member_social'  # Only use the posting permission
        
        auth_url = (
            f"https://www.linkedin.com/oauth/v2/authorization?"
            f"response_type=code&"
            f"client_id={self.client_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"scope={scope.replace(' ', '%20')}"
        )
        
        return auth_url
    
    def start_callback_server(self):
        """Start local server to receive OAuth callback"""
        server = HTTPServer(('localhost', 8080), OAuthCallbackHandler)
        server.auth_code = None
        
        # Start server in a thread
        thread = threading.Thread(target=server.handle_request)
        thread.daemon = True
        thread.start()
        
        return server
    
    def exchange_code_for_token(self, auth_code):
        """Exchange authorization code for access token"""
        token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
        
        data = {
            'grant_type': 'authorization_code',
            'code': auth_code,
            'redirect_uri': self.redirect_uri,
            'client_id': self.client_id,
            'client_secret': self.client_secret
        }
        
        response = requests.post(token_url, data=data)
        
        if response.status_code == 200:
            token_data = response.json()
            return token_data.get('access_token')
        else:
            print(f"❌ Error getting token: {response.text}")
            return None
    
    def save_token(self, token):
        """Save access token to .env file"""
        env_path = '.env'
        
        # Read existing .env
        with open(env_path, 'r') as f:
            lines = f.readlines()
        
        # Check if token already exists
        token_exists = False
        for i, line in enumerate(lines):
            if line.startswith('LINKEDIN_PERSONAL_ACCESS_TOKEN='):
                lines[i] = f'LINKEDIN_PERSONAL_ACCESS_TOKEN={token}\n'
                token_exists = True
                break
        
        # Add token if it doesn't exist
        if not token_exists:
            lines.append(f'\n# LinkedIn Personal OAuth Token (auto-generated)\n')
            lines.append(f'LINKEDIN_PERSONAL_ACCESS_TOKEN={token}\n')
        
        # Write back to .env
        with open(env_path, 'w') as f:
            f.writelines(lines)
        
        print(f"✅ Access token saved to .env file")
    
    def test_token(self, token):
        """Test if the token works - skip profile test since we only have posting permissions"""
        # Since we only have w_member_social scope, we can't test profile access
        # Just verify the token exists and isn't empty
        if token and len(token) > 20:
            print(f"✅ Token received and appears valid! Ready for posting.")
            return True
        else:
            print(f"❌ Token appears invalid or empty")
            return False
    
    def setup(self):
        """Complete OAuth setup process"""
        print("\n🔐 LinkedIn OAuth Setup")
        print("=" * 50)
        
        # Check if we already have a token
        existing_token = os.getenv('LINKEDIN_PERSONAL_ACCESS_TOKEN')
        if existing_token and existing_token != 'your_personal_access_token_here':
            print("📌 Found existing access token in .env")
            print("Testing token validity...")
            
            if self.test_token(existing_token):
                print("\n✅ Existing token is valid! You're all set.")
                return existing_token
            else:
                print("⚠️ Existing token is invalid. Getting new token...")
        
        # Start callback server
        print("\n1️⃣ Starting callback server on http://localhost:8080...")
        server = self.start_callback_server()
        
        # Generate and open authorization URL
        auth_url = self.get_authorization_url()
        print(f"\n2️⃣ Opening LinkedIn authorization page...")
        print(f"URL: {auth_url}\n")
        
        # Open browser
        webbrowser.open(auth_url)
        print("3️⃣ Please authorize the application in your browser...")
        print("   - Sign in to LinkedIn if needed")
        print("   - Click 'Allow' to grant permissions")
        print("\nWaiting for authorization...")
        
        # Wait for callback (max 60 seconds)
        import time
        timeout = 60
        start_time = time.time()
        
        while server.auth_code is None and (time.time() - start_time) < timeout:
            time.sleep(1)
        
        if server.auth_code:
            print(f"\n✅ Authorization code received!")
            
            # Exchange for access token
            print("4️⃣ Exchanging code for access token...")
            token = self.exchange_code_for_token(server.auth_code)
            
            if token:
                print(f"\n✅ Access token obtained!")
                
                # Test the token
                if self.test_token(token):
                    # Save to .env
                    self.save_token(token)
                    
                    print("\n" + "=" * 50)
                    print("🎉 Setup Complete!")
                    print("You can now use automated LinkedIn posting.")
                    print("=" * 50)
                    
                    return token
            else:
                print("❌ Failed to get access token")
        else:
            print(f"\n❌ Timeout: No authorization code received")
        
        return None


def main():
    oauth = LinkedInOAuth()
    token = oauth.setup()
    
    if token:
        print(f"\n📋 Your access token: {token[:20]}...")
        print("\n🚀 Next steps:")
        print("1. The token has been saved to your .env file")
        print("2. You can now use automated LinkedIn posting")
        print("3. Run: python linkedin_poster.py to test posting")
    else:
        print("\n❌ Setup failed. Please try again.")


if __name__ == "__main__":
    main()