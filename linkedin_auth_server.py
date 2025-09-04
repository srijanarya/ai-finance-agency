#!/usr/bin/env python3
"""
LinkedIn OAuth Server
Automatically captures authorization code
"""

import os
import webbrowser
import requests
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv
import json

load_dotenv()

auth_code = None

class CallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global auth_code
        query = urlparse(self.path).query
        params = parse_qs(query)
        
        if 'code' in params:
            auth_code = params['code'][0]
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            html = """
            <html>
            <head>
                <title>LinkedIn OAuth Success</title>
                <style>
                    body { font-family: Arial; text-align: center; padding: 50px; background: #f0f2f5; }
                    .container { background: white; padding: 40px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    h1 { color: #0077B5; }
                    .code { background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace; margin: 20px 0; }
                    .success { color: #28a745; font-size: 48px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="success">✅</div>
                    <h1>Authorization Successful!</h1>
                    <p>Authorization code received. Processing...</p>
                    <div class="code">Code: """ + auth_code[:20] + """...</div>
                    <p style="color: #666;">You can close this window and check the terminal.</p>
                </div>
            </body>
            </html>
            """
            self.wfile.write(html.encode())
        else:
            self.send_response(400)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"<h1>Error: No authorization code received</h1>")
    
    def log_message(self, format, *args):
        pass

def exchange_code(code):
    """Exchange authorization code for access token"""
    client_id = os.getenv('LINKEDIN_CLIENT_ID', '776dnomhse84tj')
    client_secret = os.getenv('LINKEDIN_CLIENT_SECRET')
    redirect_uri = 'http://localhost:8080/callback'
    
    token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
    
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri,
        'client_id': client_id,
        'client_secret': client_secret
    }
    
    print(f"\n🔄 Exchanging code for access token...")
    response = requests.post(token_url, data=data)
    
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data.get('access_token')
        expires_in = token_data.get('expires_in_seconds', 0)
        
        print(f"✅ Success! Access token obtained")
        print(f"📅 Token expires in {expires_in // 86400} days")
        
        # Save to .env
        save_token(access_token)
        
        # Test the token
        test_token(access_token)
        
        return access_token
    else:
        print(f"❌ Error: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def save_token(token):
    """Save access token to .env file"""
    env_path = '.env'
    
    # Read existing .env
    with open(env_path, 'r') as f:
        lines = f.readlines()
    
    # Update or add token
    token_exists = False
    for i, line in enumerate(lines):
        if line.startswith('LINKEDIN_ACCESS_TOKEN='):
            lines[i] = f'LINKEDIN_ACCESS_TOKEN={token}\n'
            token_exists = True
            break
    
    if not token_exists:
        lines.append(f'\n# LinkedIn OAuth Token (auto-generated)\n')
        lines.append(f'LINKEDIN_ACCESS_TOKEN={token}\n')
    
    # Write back
    with open(env_path, 'w') as f:
        f.writelines(lines)
    
    print(f"✅ Access token saved to .env file")

def test_token(token):
    """Test if the token works"""
    headers = {
        'Authorization': f'Bearer {token}',
        'X-Restli-Protocol-Version': '2.0.0'
    }
    
    print(f"\n🔍 Testing token...")
    response = requests.get('https://api.linkedin.com/v2/me', headers=headers)
    
    if response.status_code == 200:
        user_data = response.json()
        first_name = user_data.get('localizedFirstName', 'User')
        last_name = user_data.get('localizedLastName', '')
        print(f"✅ Token valid! Authenticated as: {first_name} {last_name}")
        
        # Save user info
        with open('linkedin_user.json', 'w') as f:
            json.dump(user_data, f, indent=2)
        
        return True
    else:
        print(f"❌ Token test failed: {response.text}")
        return False

def main():
    global auth_code
    
    print("\n🚀 LinkedIn OAuth Setup with Auto-Capture")
    print("=" * 60)
    
    client_id = os.getenv('LINKEDIN_CLIENT_ID', '776dnomhse84tj')
    redirect_uri = 'http://localhost:8080/callback'
    scope = 'w_member_social'
    
    auth_url = (
        f"https://www.linkedin.com/oauth/v2/authorization?"
        f"response_type=code&"
        f"client_id={client_id}&"
        f"redirect_uri={redirect_uri}&"
        f"scope={scope}"
    )
    
    print("\n📡 Starting callback server on http://localhost:8080...")
    server = HTTPServer(('localhost', 8080), CallbackHandler)
    
    print("🌐 Opening LinkedIn authorization page...")
    print(f"\nAuthorization URL:\n{auth_url}\n")
    
    webbrowser.open(auth_url)
    
    print("⏳ Waiting for authorization (timeout: 60 seconds)...")
    print("   Please click 'Allow' on the LinkedIn page")
    
    # Handle one request (the callback)
    server.timeout = 60
    server.handle_request()
    
    if auth_code:
        print(f"\n✅ Authorization code received!")
        token = exchange_code(auth_code)
        
        if token:
            print("\n" + "=" * 60)
            print("🎉 Setup Complete!")
            print("Your LinkedIn posting system is now configured.")
            print("=" * 60)
            
            # Now test posting
            print("\n📝 Would you like to test posting now? Check the dashboard!")
            print("Visit: http://127.0.0.1:8088/content")
    else:
        print("\n❌ No authorization code received. Please try again.")

if __name__ == "__main__":
    main()