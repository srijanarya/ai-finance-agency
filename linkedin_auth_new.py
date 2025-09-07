#!/usr/bin/env python3
"""
LinkedIn OAuth Setup - Complete flow to get access token with posting permissions
"""

import webbrowser
import http.server
import socketserver
import urllib.parse
import json
import requests
import threading
import time
import os
from datetime import datetime

# LinkedIn App Credentials
CLIENT_ID = "776dnomhse84tj"
CLIENT_SECRET = "WPL_AP1.r3GQEtOyAZpKQkFJ.mafPeA=="
REDIRECT_URI = "http://localhost:8080/callback"
PORT = 8080

# Global variable to store the authorization code
auth_code = None

class OAuthHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        global auth_code
        if '/callback' in self.path:
            # Parse the authorization code from the URL
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            
            if 'code' in params:
                auth_code = params['code'][0]
                # Send success response
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                
                html = """
                <html>
                <head>
                    <title>LinkedIn OAuth Success</title>
                    <style>
                        body { font-family: Arial; text-align: center; padding: 50px; }
                        h1 { color: #0077B5; }
                        .success { color: green; font-size: 24px; }
                    </style>
                </head>
                <body>
                    <h1>LinkedIn Authorization Successful!</h1>
                    <p class="success">✅ You can close this window and return to the terminal.</p>
                </body>
                </html>
                """
                self.wfile.write(html.encode())
            elif 'error' in params:
                # Handle error
                self.send_response(400)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                error_msg = params.get('error_description', ['Unknown error'])[0]
                self.wfile.write(f"<h1>Error: {error_msg}</h1>".encode())
    
    def log_message(self, format, *args):
        # Suppress server logs
        pass

def start_callback_server():
    """Start the local server to receive OAuth callback"""
    with socketserver.TCPServer(("", PORT), OAuthHandler) as httpd:
        httpd.timeout = 120  # 2 minute timeout
        httpd.handle_request()  # Handle single request then stop

def get_authorization_url():
    """Generate LinkedIn OAuth authorization URL"""
    scopes = "openid profile email w_member_social"  # Include posting permission
    auth_url = (
        f"https://www.linkedin.com/oauth/v2/authorization?"
        f"response_type=code&"
        f"client_id={CLIENT_ID}&"
        f"redirect_uri={urllib.parse.quote(REDIRECT_URI)}&"
        f"scope={urllib.parse.quote(scopes)}"
    )
    return auth_url

def exchange_code_for_token(code):
    """Exchange authorization code for access token"""
    token_url = "https://api.linkedin.com/oauth/v2/accessToken"
    
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET
    }
    
    response = requests.post(token_url, data=data)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Token exchange failed: {response.text}")

def save_credentials(token_data):
    """Save credentials to .env file"""
    access_token = token_data.get('access_token')
    
    # Read existing .env content
    env_content = ""
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            lines = f.readlines()
            # Remove old LinkedIn tokens
            lines = [line for line in lines if not line.startswith('LINKEDIN_ACCESS_TOKEN')]
    else:
        lines = []
    
    # Add new token
    lines.append(f"\n# LinkedIn OAuth Token - Generated {datetime.now()}\n")
    lines.append(f"LINKEDIN_ACCESS_TOKEN={access_token}\n")
    lines.append(f"LINKEDIN_CLIENT_ID={CLIENT_ID}\n")
    lines.append(f"LINKEDIN_CLIENT_SECRET={CLIENT_SECRET}\n")
    
    # Write back to .env
    with open('.env', 'w') as f:
        f.writelines(lines)
    
    return access_token

def test_token(access_token):
    """Test the token by getting user info"""
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    response = requests.get('https://api.linkedin.com/v2/userinfo', headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        return user_data
    else:
        return None

def main():
    global auth_code
    
    print("=" * 60)
    print("🔗 LinkedIn OAuth Setup")
    print("=" * 60)
    print("\nThis will help you get a LinkedIn access token with posting permissions.\n")
    
    # Step 1: Start callback server
    print("📡 Starting local callback server on port 8080...")
    server_thread = threading.Thread(target=start_callback_server)
    server_thread.daemon = True
    server_thread.start()
    time.sleep(1)  # Give server time to start
    
    # Step 2: Open authorization URL
    auth_url = get_authorization_url()
    print(f"\n🌐 Opening LinkedIn authorization page...")
    print(f"   URL: {auth_url}\n")
    print("⚠️  IMPORTANT: When authorizing, you may need to select which")
    print("   account/page to post to (personal or company).\n")
    
    webbrowser.open(auth_url)
    
    # Step 3: Wait for callback
    print("⏳ Waiting for authorization (timeout: 2 minutes)...")
    
    # Wait for auth code
    timeout = 120
    start_time = time.time()
    while auth_code is None and (time.time() - start_time) < timeout:
        time.sleep(1)
    
    if auth_code:
        print("\n✅ Authorization code received!")
        
        # Step 4: Exchange code for token
        print("🔄 Exchanging code for access token...")
        try:
            token_data = exchange_code_for_token(auth_code)
            access_token = token_data.get('access_token')
            scope = token_data.get('scope', 'unknown')
            
            print(f"✅ Access token obtained!")
            print(f"📋 Scopes: {scope}")
            
            # Step 5: Test token
            print("\n🧪 Testing token...")
            user_info = test_token(access_token)
            if user_info:
                print(f"✅ Token is valid!")
                print(f"👤 User: {user_info.get('name', 'Unknown')}")
                print(f"📧 Email: {user_info.get('email', 'Unknown')}")
            
            # Step 6: Save credentials
            save_credentials(token_data)
            print("\n💾 Credentials saved to .env file")
            
            print("\n" + "=" * 60)
            print("🎉 SUCCESS! LinkedIn OAuth setup complete!")
            print("=" * 60)
            print("\nYou can now use the access token to post to LinkedIn.")
            print("The token has been saved to your .env file.\n")
            
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("Please try again. Make sure you authorize quickly after opening the page.")
    else:
        print("\n⏰ Timeout - no authorization received")
        print("Please run the script again and authorize within 2 minutes.")

if __name__ == "__main__":
    main()