#!/usr/bin/env python3
"""
LinkedIn OAuth Helper
Helps you get access tokens for both personal and company LinkedIn accounts
"""

from flask import Flask, request, redirect, session
import requests
import os
from urllib.parse import urlencode
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'

# LinkedIn OAuth endpoints
LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization'
LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
LINKEDIN_PROFILE_URL = 'https://api.linkedin.com/v2/userinfo'

@app.route('/')
def index():
    return """
    <h1>LinkedIn OAuth Helper</h1>
    <p>Choose which account to authenticate:</p>
    <a href="/auth/personal" style="margin: 10px; padding: 10px; background: #0077B5; color: white; text-decoration: none;">
        🧑 Personal LinkedIn Account
    </a><br><br>
    <a href="/auth/company" style="margin: 10px; padding: 10px; background: #0077B5; color: white; text-decoration: none;">
        🏢 Company LinkedIn Account
    </a>
    """

@app.route('/auth/<account_type>')
def auth(account_type):
    if account_type not in ['personal', 'company']:
        return "Invalid account type", 400
    
    # Store account type in session
    session['account_type'] = account_type
    
    # Get credentials from environment variables
    if account_type == 'personal':
        client_id = os.getenv('LINKEDIN_PERSONAL_CLIENT_ID')
        client_secret = os.getenv('LINKEDIN_PERSONAL_CLIENT_SECRET')
    else:
        client_id = os.getenv('LINKEDIN_COMPANY_CLIENT_ID')
        client_secret = os.getenv('LINKEDIN_COMPANY_CLIENT_SECRET')
    
    if not client_id or not client_secret:
        return f"Missing LinkedIn {account_type} credentials in .env file", 400
    
    session['client_id'] = client_id
    session['client_secret'] = client_secret
    
    # Scopes based on account type
    if account_type == 'personal':
        scopes = 'openid profile email w_member_social'
    else:
        scopes = 'openid profile email w_organization_social'
    
    params = {
        'response_type': 'code',
        'client_id': client_id,
        'redirect_uri': 'http://localhost:3000/callback',
        'state': account_type,
        'scope': scopes
    }
    
    auth_url = f"{LINKEDIN_AUTH_URL}?{urlencode(params)}"
    return redirect(auth_url)

@app.route('/callback')
def callback():
    code = request.args.get('code')
    state = request.args.get('state')
    error = request.args.get('error')
    
    if error:
        return f"Error: {error}", 400
    
    if not code:
        return "No authorization code received", 400
    
    # Exchange code for access token
    token_data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': 'http://localhost:3000/callback',
        'client_id': session.get('client_id'),
        'client_secret': session.get('client_secret')
    }
    
    response = requests.post(LINKEDIN_TOKEN_URL, data=token_data)
    token_info = response.json()
    
    if 'access_token' in token_info:
        access_token = token_info['access_token']
        
        # Get user info
        headers = {'Authorization': f'Bearer {access_token}'}
        profile_response = requests.get(LINKEDIN_PROFILE_URL, headers=headers)
        profile_data = profile_response.json()
        
        # Save to .env format
        account_type = session.get('account_type', 'unknown')
        
        env_vars = f"""
# LinkedIn {account_type.title()} Account Credentials
LINKEDIN_{account_type.upper()}_ACCESS_TOKEN={access_token}
LINKEDIN_{account_type.upper()}_CLIENT_ID={session.get('client_id')}
LINKEDIN_{account_type.upper()}_CLIENT_SECRET={session.get('client_secret')}
"""
        
        if account_type == 'personal':
            env_vars += f"LINKEDIN_PERSONAL_USER_ID={profile_data.get('sub', 'MANUAL_LOOKUP_NEEDED')}\n"
        else:
            env_vars += f"LINKEDIN_COMPANY_PAGE_ID=YOUR_COMPANY_PAGE_ID_HERE\n"
        
        # Write to file
        with open('linkedin_tokens.txt', 'a') as f:
            f.write(env_vars)
        
        return f"""
        <h1>✅ Success!</h1>
        <h2>LinkedIn {account_type.title()} Authentication Complete</h2>
        
        <h3>📋 Copy these to your .env file:</h3>
        <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
{env_vars.strip()}
        </pre>
        
        <h3>👤 Profile Info:</h3>
        <pre>{json.dumps(profile_data, indent=2)}</pre>
        
        <p><strong>Next:</strong> Copy the credentials above to your .env file, then come back for the other account!</p>
        <a href="/">🔄 Authenticate Another Account</a>
        """
    else:
        return f"Token exchange failed: {token_info}", 400

if __name__ == '__main__':
    print("🚀 Starting LinkedIn OAuth Helper")
    print("📱 Open your browser to: http://localhost:3000")
    print("🔑 Have your LinkedIn Client ID and Client Secret ready!")
    app.run(host='localhost', port=3000, debug=True)
