# 🔐 LinkedIn Company Page API Setup Guide
**For Treum Algotech (Company ID: 108595796)**

---

## Step 1: Open LinkedIn Developers Portal

1. **Open this link:** https://www.linkedin.com/developers/apps/
2. Sign in with your LinkedIn account (the one that manages Treum Algotech)
3. You should see your existing app or need to create one

---

## Step 2: Find or Create Your App

### If you see "Social Media Integration Hub" app:
- Click on it to open

### If you need to create a new app:
1. Click **"Create app"**
2. Fill in:
   - **App name:** Treum Algotech Automation
   - **LinkedIn Page:** Select "Treum Algotech" from dropdown
   - **Privacy policy URL:** https://treumalgotech.com/privacy (or your website)
   - **App logo:** Upload Treum logo
3. Click **"Create app"**

---

## Step 3: Request Required Products

1. Go to **"Products"** tab
2. Request access to these products by clicking **"Request access"**:
   
   ✅ **Share on LinkedIn** 
   - Status should show "Added" or click to add
   
   ✅ **Sign In with LinkedIn using OpenID Connect**
   - Should already be added
   
   ⚠️ **Marketing Developer Platform** (if available)
   - This gives full company page access
   - May require LinkedIn review (24-48 hours)

---

## Step 4: Configure OAuth 2.0 Scopes

1. Go to **"Auth"** tab
2. Under **"OAuth 2.0 scopes"**, check these boxes:

   ### Required Scopes:
   - ✅ `r_liteprofile` - Read basic profile
   - ✅ `r_emailaddress` - Read email 
   - ✅ `w_member_social` - Post as member
   - ✅ **`w_organization_social`** - POST AS COMPANY (CRITICAL!)
   - ✅ **`r_organization_social`** - Read company posts
   - ✅ **`rw_organization_admin`** - Admin company access

3. **Redirect URLs:** Add if not present:
   - `http://localhost:8080/callback`
   - `https://www.linkedin.com/developers/tools/oauth/redirect`

---

## Step 5: Generate Company-Authorized Token

### Method A: Using OAuth Tool (Easier)

1. Scroll down to **"OAuth 2.0 tools"** section
2. Click **"Create token"**
3. **IMPORTANT STEP:** You'll see a screen with:
   - Your name (personal profile)
   - **Treum Algotech** (company page)
   
   ⚠️ **SELECT "Treum Algotech" - NOT your personal profile!**

4. Click **"Request access token"**
5. Copy the generated token

### Method B: Manual OAuth Flow

1. Create authorization URL:
```
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:8080/callback&scope=r_liteprofile%20r_emailaddress%20w_member_social%20w_organization_social%20r_organization_social%20rw_organization_admin
```

2. When you authorize, **SELECT TREUM ALGOTECH** from the dropdown
3. Get the code from redirect URL
4. Exchange for token

---

## Step 6: Test Your New Token

Run this Python code to verify:

```python
import requests

# Your new token
TOKEN = "YOUR_NEW_TOKEN_HERE"

headers = {
    'Authorization': f'Bearer {TOKEN}',
    'X-Restli-Protocol-Version': '2.0.0'
}

# Check what organizations you can post as
response = requests.get(
    'https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee',
    headers=headers
)

if response.status_code == 200:
    print("✅ Token works! You can post as:")
    data = response.json()
    for element in data.get('elements', []):
        print(f"  - {element.get('organizationalTarget')}")
else:
    print(f"❌ Error: {response.status_code}")
```

---

## Step 7: Update Your .env File

Replace your current token:

```bash
# LinkedIn OAuth Token (Company-enabled, expires April 04, 2025)
LINKEDIN_ACCESS_TOKEN=YOUR_NEW_TOKEN_WITH_COMPANY_PERMISSIONS
```

---

## 🚨 Common Issues & Solutions

### Issue: "w_organization_social" not available
**Solution:** Your app needs approval. Go to Products tab and request "Marketing Developer Platform"

### Issue: No company dropdown during authorization
**Solution:** Make sure you're an admin of the company page:
1. Go to https://www.linkedin.com/company/108595796/admin/
2. Check you have "Super Admin" or "Content Admin" role

### Issue: Token works but still can't post
**Solution:** The token might be authorized for personal only. Regenerate and ensure you select Treum Algotech

---

## 📞 Need More Help?

1. **LinkedIn Support:** https://www.linkedin.com/help/linkedin
2. **Developer Forum:** https://www.linkedin.com/groups/4632065/
3. **API Documentation:** https://docs.microsoft.com/en-us/linkedin/

---

## ✅ Success Checklist

- [ ] App created/found in developer portal
- [ ] "Share on LinkedIn" product added
- [ ] Company scopes (w_organization_social) added
- [ ] Token generated WITH Treum Algotech selected
- [ ] Token tested and working
- [ ] .env file updated

Once complete, your company page posting will work automatically!