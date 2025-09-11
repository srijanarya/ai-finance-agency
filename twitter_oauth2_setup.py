#!/usr/bin/env python3
"""
Twitter OAuth 2.0 Setup Script
Uses your provided Client ID and Client Secret to complete OAuth flow
"""

import os
import requests
import json
import base64
import secrets
import hashlib
import webbrowser
from urllib.parse import urlencode, parse_qs
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

class TwitterOAuth2Setup:
    def __init__(self):
        # Your OAuth 2.0 credentials
        self.client_id = "Y0x2RjFCb1RqaHhuZ2xhN3JnSGQ6MTpjaQ"
        self.client_secret = "q0hCR3CMJnUesthRe9kIaLjK0oC_p7Pf16yOwE-xiitf6KSTka"
        
        # OAuth 2.0 endpoints
        self.authorization_endpoint = "https://twitter.com/i/oauth2/authorize"
        self.token_endpoint = "https://api.twitter.com/2/oauth2/token"
        self.redirect_uri = "http://localhost:9876/callback"
        
        # PKCE parameters
        self.code_verifier = self.generate_code_verifier()
        self.code_challenge = self.generate_code_challenge(self.code_verifier)
        
        # Store authorization code
        self.auth_code = None
        
    def generate_code_verifier(self):
        """Generate PKCE code verifier"""
        return base64.urlsafe_b64encode(secrets.token_bytes(96)).decode('utf-8').rstrip('=')
    
    def generate_code_challenge(self, verifier):
        """Generate PKCE code challenge"""
        digest = hashlib.sha256(verifier.encode('utf-8')).digest()
        return base64.urlsafe_b64encode(digest).decode('utf-8').rstrip('=')
    
    def get_authorization_url(self):
        """Build authorization URL"""
        params = {
            'response_type': 'code',
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': 'tweet.read tweet.write users.read offline.access',
            'state': secrets.token_urlsafe(32),
            'code_challenge': self.code_challenge,
            'code_challenge_method': 'S256'
        }
        
        return f"{self.authorization_endpoint}?{urlencode(params)}"
    
    def exchange_code_for_token(self, authorization_code):
        """Exchange authorization code for access token"""
        
        # Prepare token request
        token_data = {
            'grant_type': 'authorization_code',
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': authorization_code,
            'redirect_uri': self.redirect_uri,
            'code_verifier': self.code_verifier
        }
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        try:
            response = requests.post(
                self.token_endpoint,
                data=token_data,
                headers=headers
            )
            
            if response.status_code == 200:
                token_data = response.json()
                print("✅ Successfully obtained access token!")
                print(f"Access Token: {token_data.get('access_token', 'N/A')}")
                print(f"Token Type: {token_data.get('token_type', 'N/A')}")
                print(f"Expires In: {token_data.get('expires_in', 'N/A')} seconds")
                
                if 'refresh_token' in token_data:
                    print(f"Refresh Token: {token_data.get('refresh_token')}")
                
                # Save to environment file
                self.save_tokens_to_env(token_data)
                return token_data
            else:
                print(f"❌ Token exchange failed: {response.status_code}")
                print(f"Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Error exchanging code for token: {e}")
            return None
    
    def save_tokens_to_env(self, token_data):
        """Save tokens to .env file"""
        try:
            # Read existing .env file
            env_file_path = '.env'
            env_lines = []
            
            if os.path.exists(env_file_path):
                with open(env_file_path, 'r') as f:
                    env_lines = f.readlines()
            
            # Update or add Twitter OAuth 2.0 tokens
            token_keys = {
                'TWITTER_OAUTH2_ACCESS_TOKEN': token_data.get('access_token'),
                'TWITTER_OAUTH2_TOKEN_TYPE': token_data.get('token_type'),
                'TWITTER_OAUTH2_REFRESH_TOKEN': token_data.get('refresh_token'),
                'TWITTER_CLIENT_ID': self.client_id,
                'TWITTER_CLIENT_SECRET': self.client_secret
            }
            
            # Update existing lines or prepare new ones
            updated_keys = set()
            for i, line in enumerate(env_lines):
                for key, value in token_keys.items():
                    if line.startswith(f'{key}=') and value:
                        env_lines[i] = f'{key}={value}\n'
                        updated_keys.add(key)
                        break
            
            # Add new keys that weren't found
            for key, value in token_keys.items():
                if key not in updated_keys and value:
                    env_lines.append(f'{key}={value}\n')
            
            # Write back to file
            with open(env_file_path, 'w') as f:
                f.writelines(env_lines)
            
            print(f"✅ Tokens saved to {env_file_path}")
            
        except Exception as e:
            print(f"⚠️ Could not save to .env file: {e}")
            print("💾 Please save these tokens manually:")
            print(f"TWITTER_OAUTH2_ACCESS_TOKEN={token_data.get('access_token')}")
            print(f"TWITTER_OAUTH2_TOKEN_TYPE={token_data.get('token_type')}")
            if token_data.get('refresh_token'):
                print(f"TWITTER_OAUTH2_REFRESH_TOKEN={token_data.get('refresh_token')}")

class CallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle OAuth callback"""
        if self.path.startswith('/callback'):
            # Parse query parameters
            query_params = parse_qs(self.path.split('?')[1])
            
            if 'code' in query_params:
                # Store the authorization code
                self.server.auth_code = query_params['code'][0]
                
                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                html_response = '''
                    <html>
                        <body>
                            <h2>✅ Authorization Successful!</h2>
                            <p>You can now close this window and return to the terminal.</p>
                            <script>setTimeout(function(){ window.close(); }, 3000);</script>
                        </body>
                    </html>
                '''
                self.wfile.write(html_response.encode('utf-8'))
            else:
                # Handle error
                error = query_params.get('error', ['Unknown error'])[0]
                self.send_response(400)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                error_html = f'''
                    <html>
                        <body>
                            <h2>❌ Authorization Failed</h2>
                            <p>Error: {error}</p>
                        </body>
                    </html>
                '''
                self.wfile.write(error_html.encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        """Suppress log messages"""
        pass

def run_oauth_flow():
    """Run the complete OAuth 2.0 flow"""
    print("🐦 Twitter OAuth 2.0 Setup")
    print("=" * 50)
    
    oauth = TwitterOAuth2Setup()
    
    print(f"📋 Client ID: {oauth.client_id}")
    print(f"🔧 Using PKCE for security")
    print(f"🌐 Callback URL: {oauth.redirect_uri}")
    print()
    
    # Start local server for callback
    server = HTTPServer(('localhost', 9876), CallbackHandler)
    server.auth_code = None
    server.timeout = 1
    
    def server_thread():
        print("🚀 Starting local callback server...")
        while server.auth_code is None:
            server.handle_request()
    
    thread = threading.Thread(target=server_thread)
    thread.daemon = True
    thread.start()
    
    # Build authorization URL
    auth_url = oauth.get_authorization_url()
    print(f"🔗 Authorization URL: {auth_url}")
    print()
    print("📖 Instructions:")
    print("1. Your browser will open to Twitter's authorization page")
    print("2. Log in to Twitter if needed")
    print("3. Click 'Authorize App' to grant permissions")
    print("4. You'll be redirected back automatically")
    print()
    
    input("Press Enter to open your browser and start OAuth flow...")
    
    # Open browser
    webbrowser.open(auth_url)
    
    # Wait for authorization
    print("⏳ Waiting for authorization...")
    print("   (This will timeout in 60 seconds)")
    
    timeout = 60
    while server.auth_code is None and timeout > 0:
        import time
        time.sleep(1)
        timeout -= 1
        if timeout % 10 == 0:
            print(f"   ⏰ {timeout} seconds remaining...")
    
    if server.auth_code:
        print("✅ Authorization code received!")
        
        # Exchange code for token
        print("🔄 Exchanging code for access token...")
        token_data = oauth.exchange_code_for_token(server.auth_code)
        
        if token_data:
            print()
            print("🎉 OAuth 2.0 setup complete!")
            print("✅ You can now use Twitter API v2 with OAuth 2.0")
            print()
            print("📝 Next steps:")
            print("1. Test your setup with: python twitter_v2_poster.py")
            print("2. Check your .env file for the new tokens")
            print("3. Use the access token in your API calls")
        else:
            print("❌ Failed to obtain access token")
    else:
        print("⏰ Authorization timed out or failed")
        print("💡 You can try again by running this script")

if __name__ == "__main__":
    run_oauth_flow()
