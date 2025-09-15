# 🔐 Social Media Credentials Documentation
**Created: 2025-09-11**  
**Status: ALL SYSTEMS OPERATIONAL ✅**

## Quick Status Check

| Platform | Status | Username/Channel | Last Tested |
|----------|--------|-----------------|-------------|
| Telegram | ✅ Working | @AIFinanceNews2024 | 2025-09-11 |
| Twitter/X | ✅ Working | @aryasrijan | 2025-09-11 |
| LinkedIn | ✅ Working | Srijan Arya (Personal) | 2025-09-11 |

## 🚀 Quick Test Commands

```bash
# Test all platforms at once
python3 test_all_platforms.py

# Test LinkedIn posting specifically
python3 test_linkedin_post.py

# Test Twitter posting
python3 test_twitter_fix.py
```

## 📁 Credential Storage Locations

Your credentials are stored in multiple secure locations:

1. **Primary Location:** `/Users/srijan/ai-finance-agency/.env`
2. **Backup Locations:**
   - `/Users/srijan/ai-finance-agency/WORKING_CREDENTIALS_BACKUP.md` (human-readable)
   - `/Users/srijan/ai-finance-agency/credentials_backup.json` (JSON format)
   - `/Users/srijan/ai-finance-agency/.ignore/` (backup copies)
   - `/Users/srijan/projects/ai-finance-agency/.env` (alternate project)

## 🔄 LinkedIn Token Renewal (Required every 60 days)

LinkedIn access tokens expire after 60 days. Your current token expires around **2025-11-10**.

### To Renew LinkedIn Token:

1. Run the OAuth script:
```bash
python3 linkedin_oauth_personal.py
```

2. Sign in and authorize when browser opens

3. Copy the authorization code from the redirect URL

4. Exchange for new token:
```bash
python3 exchange_linkedin_code.py YOUR_CODE_HERE
```

## 🛠️ Troubleshooting

### If LinkedIn stops working:
- Token may have expired (check if 60 days passed)
- Run renewal process above
- Verify with: `python3 test_linkedin_post.py`

### If Twitter stops working:
- Tokens don't expire but may be revoked
- Check rate limits (300 posts per 3 hours)
- Verify with test script

### If Telegram stops working:
- Bot tokens don't expire
- Check if bot was blocked from channel
- Verify bot is admin in channel

## 📊 Token Details

### Telegram
- **Type:** Bot Token (never expires)
- **Bot:** @AIFinanceAgencyBot
- **Channel:** @AIFinanceNews2024

### Twitter/X
- **Type:** OAuth 1.0a (never expires unless revoked)
- **Account:** @aryasrijan
- **Rate Limit:** 300 posts per 3 hours

### LinkedIn
- **Type:** OAuth 2.0 (expires in 60 days)
- **Account:** Srijan Arya (personal profile)
- **Scopes:** openid, profile, email, w_member_social
- **Person URN:** urn:li:person:vlt5EDPS3C

## 🔒 Security Notes

1. **NEVER** commit these files to public repositories
2. Keep the `.ignore` directory in `.gitignore`
3. Credentials are production keys - handle with care
4. Set calendar reminder for LinkedIn token renewal
5. Backup these files to secure cloud storage

## ✅ Verification Log

All platforms were tested and verified working on **2025-09-11**:
- Telegram: Message posted successfully
- Twitter: Tweet ID 1965969072123678841
- LinkedIn: Post ID urn:li:share:7371735198029410304

## 📝 Notes

- Database issue with missing 'queue' table was fixed
- LinkedIn app only has personal posting scope (w_member_social)
- Company posting requires additional LinkedIn app permissions
- All test scripts are included in the project directory

---

**Remember:** Keep this documentation updated when credentials change!