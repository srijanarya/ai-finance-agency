#!/usr/bin/env python3
"""
LinkedIn OAuth Browser Automation
Automates the OAuth flow with correct scopes for posting
"""

import os
import time
import webbrowser
import urllib.parse
from dotenv import load_dotenv
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading
import requests

# Load environment variables
load_dotenv()

class OAuthCallbackHandler(BaseHTTPRequestHandler):
    """Handle OAuth callback"""
    
    def do_GET(self):
        # Parse the callback URL
        if self.path.startswith('/callback'):
            # Extract authorization code
            query = urllib.parse.urlparse(self.path).query
            params = urllib.parse.parse_qs(query)
            
            if 'code' in params:
                self.server.auth_code = params['code'][0]
                
                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                
                success_html = """
                <html>
                <head>
                    <title>LinkedIn Authorization Success</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .success { color: green; font-size: 24px; }
                        .token { background: #f0f0f0; padding: 20px; margin: 20px; border-radius: 5px; }
                        .instructions { margin-top: 30px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto; }
                    </style>
                </head>
                <body>
                    <h1 class="success">✅ Authorization Successful!</h1>
                    <p>You can close this window. The script will now exchange the code for an access token.</p>
                    <div class="instructions">
                        <h3>Next Steps:</h3>
                        <ol>
                            <li>Return to your terminal</li>
                            <li>The script will automatically get your access token</li>
                            <li>Your .env file will be updated with the new token</li>
                        </ol>
                    </div>
                </body>
                </html>
                """
                self.wfile.write(success_html.encode())
            else:
                # Error response
                self.send_response(400)
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                error_html = """
                <html>
                <body>
                    <h1 style="color: red;">❌ Authorization Failed</h1>
                    <p>No authorization code received. Please try again.</p>
                </body>
                </html>
                """
                self.wfile.write(error_html.encode())
    
    def log_message(self, format, *args):
        # Suppress default logging
        pass

class LinkedInOAuthAutomation:
    def __init__(self):
        # Load existing credentials
        self.client_id = os.getenv('LINKEDIN_COMPANY_CLIENT_ID', '77ccq66ayuwvqo')
        self.client_secret = os.getenv('LINKEDIN_COMPANY_CLIENT_SECRET', 'WPL_AP1.Vj3PvAamQi6UQCmM.K478VA==')
        self.redirect_uri = 'http://localhost:8080/callback'
        
        # OAuth URLs
        self.auth_url = 'https://www.linkedin.com/oauth/v2/authorization'
        self.token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
        
        # Required scopes for posting
        self.scopes = [
            'openid',           # Basic profile
            'profile',          # Profile info
            'email',            # Email access
            'w_member_social',  # Personal posting
            'r_organization_social',    # Read organization
            'w_organization_social',    # Company posting
            'rw_organization_admin'     # Admin access
        ]
        
        self.auth_code = None
        self.access_token = None
    
    def build_authorization_url(self):
        """Build the authorization URL with all required scopes"""
        params = {
            'response_type': 'code',
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': ' '.join(self.scopes),
            'state': 'ai_finance_agency_' + str(int(time.time()))
        }
        
        # Ensure proper URL encoding
        auth_url = f"{self.auth_url}?{urllib.parse.urlencode(params, safe='', quote_via=urllib.parse.quote)}"
        return auth_url
    
    def start_callback_server(self):
        """Start local server to receive OAuth callback"""
        server = HTTPServer(('localhost', 8080), OAuthCallbackHandler)
        server.auth_code = None
        server.timeout = 300  # 5 minute timeout
        
        # Run server in a thread
        server_thread = threading.Thread(target=server.handle_request)
        server_thread.daemon = True
        server_thread.start()
        
        return server
    
    def exchange_code_for_token(self, auth_code):
        """Exchange authorization code for access token"""
        data = {
            'grant_type': 'authorization_code',
            'code': auth_code,
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'redirect_uri': self.redirect_uri
        }
        
        response = requests.post(self.token_url, data=data)
        
        if response.status_code == 200:
            token_data = response.json()
            self.access_token = token_data.get('access_token')
            self.refresh_token = token_data.get('refresh_token', '')
            self.expires_in = token_data.get('expires_in', 0)
            
            print(f"\n✅ Access Token Obtained!")
            print(f"   Token: {self.access_token[:30]}...{self.access_token[-10:]}")
            print(f"   Expires in: {self.expires_in} seconds ({self.expires_in // 3600} hours)")
            
            if self.refresh_token:
                print(f"   Refresh Token: {self.refresh_token[:20]}...")
            
            return True
        else:
            print(f"\n❌ Failed to exchange code for token")
            print(f"   Status: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    
    def update_env_file(self):
        """Update .env file with new token"""
        env_path = '/Users/srijan/ai-finance-agency/.env'
        
        # Read current .env
        with open(env_path, 'r') as f:
            lines = f.readlines()
        
        # Update LinkedIn tokens
        updated = False
        for i, line in enumerate(lines):
            if line.startswith('LINKEDIN_COMPANY_ACCESS_TOKEN='):
                lines[i] = f'LINKEDIN_COMPANY_ACCESS_TOKEN={self.access_token}\n'
                updated = True
                break
        
        if not updated:
            # Add the token if it doesn't exist
            lines.append(f'\nLINKEDIN_COMPANY_ACCESS_TOKEN={self.access_token}\n')
        
        # Write back
        with open(env_path, 'w') as f:
            f.writelines(lines)
        
        print(f"\n✅ Updated .env file with new token")
    
    def verify_token(self):
        """Verify the new token has correct permissions"""
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        # Check userinfo
        userinfo_url = 'https://api.linkedin.com/v2/userinfo'
        response = requests.get(userinfo_url, headers=headers)
        
        if response.status_code == 200:
            user_data = response.json()
            print(f"\n✅ Token Verification Successful!")
            print(f"   Name: {user_data.get('name', 'N/A')}")
            print(f"   Email: {user_data.get('email', 'N/A')}")
            
            # Check token introspection for scopes
            introspect_url = 'https://www.linkedin.com/oauth/v2/introspectToken'
            introspect_response = requests.post(
                introspect_url, 
                data={'token': self.access_token}
            )
            
            if introspect_response.status_code == 200:
                introspect_data = introspect_response.json()
                scopes = introspect_data.get('scope', '')
                print(f"\n📋 Token Scopes:")
                
                if 'w_member_social' in scopes:
                    print("   ✅ w_member_social - Can post as member")
                else:
                    print("   ❌ w_member_social - Missing")
                
                if 'w_organization_social' in scopes:
                    print("   ✅ w_organization_social - Can post to company page")
                else:
                    print("   ❌ w_organization_social - Missing")
                
                if 'r_organization_social' in scopes:
                    print("   ✅ r_organization_social - Can read organization data")
                
                if 'rw_organization_admin' in scopes:
                    print("   ✅ rw_organization_admin - Has admin access")
            
            return True
        else:
            print(f"\n❌ Token verification failed: {response.status_code}")
            return False
    
    def run(self):
        """Run the OAuth flow"""
        print("=" * 60)
        print("🔐 LINKEDIN OAUTH AUTHORIZATION")
        print("=" * 60)
        
        print("\n📋 Requesting Scopes:")
        for scope in self.scopes:
            print(f"   • {scope}")
        
        # Build authorization URL
        auth_url = self.build_authorization_url()
        
        print("\n🌐 Starting authorization flow...")
        print("\n" + "=" * 60)
        print("IMPORTANT INSTRUCTIONS:")
        print("=" * 60)
        print("1. Your browser will open in 3 seconds")
        print("2. Sign in to LinkedIn if required")
        print("3. ⚠️  CRITICAL: If you see a dropdown, select 'Treum Algotech'")
        print("4. Click 'Allow' to grant permissions")
        print("5. You'll be redirected back here automatically")
        print("=" * 60)
        
        # Start callback server
        print("\n🖥️  Starting callback server on http://localhost:8080...")
        server = self.start_callback_server()
        
        # Wait a moment
        time.sleep(3)
        
        # Open browser
        print("🌐 Opening browser...")
        webbrowser.open(auth_url)
        
        print("\n⏳ Waiting for authorization (timeout: 5 minutes)...")
        print("   Please complete the authorization in your browser...")
        
        # Wait for callback
        timeout = 300  # 5 minutes
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            if hasattr(server, 'auth_code') and server.auth_code:
                self.auth_code = server.auth_code
                print(f"\n✅ Authorization code received!")
                break
            time.sleep(1)
        
        if not self.auth_code:
            print("\n❌ Timeout - No authorization code received")
            print("   Please try again")
            return False
        
        # Exchange code for token
        print("\n🔄 Exchanging authorization code for access token...")
        if self.exchange_code_for_token(self.auth_code):
            # Update .env file
            self.update_env_file()
            
            # Verify token
            self.verify_token()
            
            print("\n" + "=" * 60)
            print("✅ LINKEDIN AUTHORIZATION COMPLETE!")
            print("=" * 60)
            print("\nYour LinkedIn integration is now ready for posting!")
            print("The new access token has been saved to your .env file.")
            
            return True
        else:
            return False

def main():
    automation = LinkedInOAuthAutomation()
    automation.run()

if __name__ == "__main__":
    main()