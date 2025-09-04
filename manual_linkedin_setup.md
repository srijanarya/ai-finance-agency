# 🔧 Manual LinkedIn Company Token Setup

If the automated script doesn't work, follow these manual steps:

## Step 1: Create Authorization URL

**Copy and paste this URL into your browser:**

```
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=77ccq66ayuwvqo&redirect_uri=https%3A%2F%2Fwww.linkedin.com%2Fdevelopers%2Ftools%2Foauth%2Fredirect&scope=r_liteprofile%20r_emailaddress%20w_member_social%20w_organization_social%20r_organization_social%20rw_organization_admin&state=treum_manual
```

## Step 2: LinkedIn Authorization

1. **Click the URL** - Opens LinkedIn OAuth page
2. **Look for dropdown** - Should show your name AND "Treum Algotech"
3. **⚠️ CRITICAL: Select "Treum Algotech"** from the dropdown
4. **Click "Allow"** - Grant all permissions

## Step 3: Get Authorization Code

After clicking "Allow", you'll see a page with an authorization code or be redirected to a URL containing the code.

**Copy the code** (looks like: `AQTQm3f4g5h6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3`)

## Step 4: Exchange for Token

Run this command with your code:

```bash
python3 -c "
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Your code from Step 3
AUTH_CODE = 'PASTE_YOUR_CODE_HERE'

# Exchange for token
token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
data = {
    'grant_type': 'authorization_code',
    'code': AUTH_CODE,
    'redirect_uri': 'https://www.linkedin.com/developers/tools/oauth/redirect',
    'client_id': os.getenv('LINKEDIN_CLIENT_ID'),
    'client_secret': os.getenv('LINKEDIN_CLIENT_SECRET')
}

response = requests.post(token_url, data=data)
if response.status_code == 200:
    token_data = response.json()
    token = token_data.get('access_token')
    print(f'SUCCESS! Your access token:')
    print(token)
else:
    print(f'Error: {response.status_code}')
    print(response.text)
"
```

## Step 5: Update .env File

Add the token to your `.env` file:

```bash
# Replace this line:
LINKEDIN_COMPANY_ACCESS_TOKEN=pending_oauth_setup

# With this (use your actual token):
LINKEDIN_COMPANY_ACCESS_TOKEN=AQVmAQaA1bL...your_token_here
```

## Step 6: Test Company Posting

```bash
python3 dual_linkedin_poster.py --company
```

---

## 🚨 Troubleshooting

### No Dropdown Appears
- Your app may not be associated with the company page
- Go to LinkedIn Developer Console → Your App → Settings
- Ensure "Treum Algotech" is selected as the LinkedIn Page

### "Access Denied" Error
- Your app needs "Share on LinkedIn" product
- Go to Products tab in your LinkedIn app
- Click "Request access" for required products

### Token Works but No Company Access
- You selected your personal profile instead of "Treum Algotech"
- Repeat the process and carefully select the company from dropdown

---

## ✅ Success Indicators

You'll know it's working when:
1. ✅ Authorization shows "Treum Algotech" option
2. ✅ Token exchange returns long token starting with "AQ"
3. ✅ Test posting shows "Posted by Treum Algotech"
4. ✅ Posts appear on company timeline, not personal profile