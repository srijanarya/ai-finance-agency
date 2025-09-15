# 🔐 WORKING CREDENTIALS - BACKUP
**Last Updated: 2025-09-13**
**Status: ALL PLATFORMS TESTED AND WORKING ✅**

---

# TALKINGPHOTO AI MVP CREDENTIALS

## Google Cloud APIs (Working & Verified)
```bash
GOOGLE_AI_API_KEY=AIzaSyBCQtNVqS3ZnyF09yzKc547dFyJ_4hOp-A
GEMINI_API_KEY=AIzaSyBVvo-cEZzLwJfiHR6pC5dFOVLxZaryGKU
```

## Supabase Database (Free Tier - 500MB)
```bash
DATABASE_URL=postgresql://postgres:TalkingPhoto2024!Secure@db.ggubaujwlnfmmnsxjdtv.supabase.co:5432/postgres
```

## Cloudinary (Free Tier - 25GB Storage)
```bash
CLOUDINARY_CLOUD_NAME=da3qhmqa5
CLOUDINARY_API_KEY=854916998285751
CLOUDINARY_API_SECRET=bkKx0Qfh6YDdjdG4oGRxBWo6_Jw
```

---

# SOCIAL MEDIA CREDENTIALS - AI FINANCE AGENCY

**Last Updated: 2025-09-11**
**Status: ALL PLATFORMS TESTED AND WORKING ✅**

## ⚠️ IMPORTANT: KEEP THIS FILE SECURE
This file contains working API credentials. Store securely and never commit to public repos.

---

## 1. TELEGRAM ✅ FULLY WORKING
**Bot Name:** @AIFinanceAgencyBot  
**Channel:** @AIFinanceNews2024  
**Status:** Posting successfully

```env
TELEGRAM_BOT_TOKEN=8478124403:AAFNni_9GQtWwrzk3ElhkMkTKljbSQyWp9Y
TELEGRAM_CHANNEL_ID=@AIFinanceNews2024
```

---

## 2. TWITTER/X ✅ FULLY WORKING
**Username:** @aryasrijan  
**Status:** Posting successfully

```env
TWITTER_CONSUMER_KEY=j4VWZwNvLSofKFy2amwMV6rr6
TWITTER_CONSUMER_SECRET=Msqc2wAAQwWDRy2LzI0DJlbViT6X2AJVUkTV37ciSmVrQwBDAY
TWITTER_ACCESS_TOKEN=345467935-Xq7uiZiza3YJHRRQK0lQtVvEnTY9REYZWqZs34l8
TWITTER_ACCESS_TOKEN_SECRET=X0mF6MN7GdWwjsbzbuZj7D6A2uiUIUmK1XPyisVAgRY5G
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAE8D3wEAAAAAaonW8G8xbYQlQYAeq0AD7fgI2MQ%3DoG79wfMULuzbKpXYJEMMRkUGdvTB7ActgzwNjuursqPxMAkW80
```

---

## 3. LINKEDIN ✅ FULLY WORKING (Personal Profile)
**Profile:** Srijan Arya  
**Email:** srijanaryay@gmail.com  
**Person URN:** urn:li:person:vlt5EDPS3C  
**Status:** Posting successfully to personal profile  
**Token Expiry:** ~60 days from 2025-09-11  

```env
# LinkedIn Company Account (Used for Personal Posting with w_member_social scope)
LINKEDIN_COMPANY_CLIENT_ID=77ccq66ayuwvqo
LINKEDIN_COMPANY_CLIENT_SECRET=WPL_AP1.Vj3PvAamQi6UQCmM.K478VA==
LINKEDIN_COMPANY_ACCESS_TOKEN=AQVXY1W0yXOv79JRcw-uAG7pKxuuVlUM4vbBKi94lMpUbzl6Azh09SiaJAZhMZVXmcl09dyEhDhUQQRO8r-8Za1NC-_nTokusYZupJ7vI0pJwv_3levqX-PdyRDfNdI_6BkH_9_fhKDDc1HJFCciSez2bSxaExl2bs58ew4qfuWYwO3oEaDAJ-deCURayBB-0EldaqvSg8ZOvbayMW1TvaD4CCfY4j7BjTExXwz5LVXz9PsZr2S6PF8fXd7gVqcPC_ONzpre7jv2BWwqwOhDPBCTBMAg2_JCSujShlzxaW-1jIIcKOKrCCrw_r9Bhbuvceb30wRPNEEw0KyYvur7-U7Ygb-Nqg
LINKEDIN_COMPANY_REFRESH_TOKEN=AQWnNgWG5y-P4WFr_La4PWQ64I8vmceTnFomaBNtYqG8rWqPmM7Tvn4dKtFkQM4Ny8wzz0kuvo8tOBIHMbepSXFwSdh321_wTrno3c_Uy4lF6mb-_BQem2gjy1SiphmK31aE8_2tXtM6xFg2afWYMjJuOfXXa6u36hFc_agNS1JXDMs3pwsqmqcmvu5RSoQYh-Xg94QEPRnWKngc3NFpL08tvQZf7yesjgEF-gN-LNfs9bptx6FN5lDooH-nktADhBhSFubqIJnjFTHse8uGjFjuppqMBx_ZMmjG6cYbIxhu_2VjCRYaAzgeytg5aU-O6AmdkgSn64noq64Rc4i2bt-cxn9smg

# LinkedIn OAuth Configuration
LINKEDIN_REDIRECT_URI=https://www.linkedin.com/developers/tools/oauth/redirect
```

### LinkedIn OAuth Scopes Available:
- ✅ openid - Basic authentication
- ✅ profile - Profile information  
- ✅ email - Email access
- ✅ w_member_social - Personal posting (WORKING)

---

## 📝 TEST RESULTS (2025-09-11)

### Telegram Test
- **Status:** ✅ SUCCESS
- **Test Post ID:** Sent to @AIFinanceNews2024
- **Connection:** @AIFinanceAgencyBot

### Twitter/X Test  
- **Status:** ✅ SUCCESS
- **Test Post ID:** 1965969072123678841
- **Profile:** @aryasrijan

### LinkedIn Test
- **Status:** ✅ SUCCESS  
- **Test Post ID:** urn:li:share:7371735198029410304
- **Profile:** Srijan Arya (Personal)
- **Person URN:** urn:li:person:vlt5EDPS3C

---

## 🔧 QUICK RECOVERY COMMANDS

### Test All Platforms:
```bash
python3 test_all_platforms.py
```

### Test LinkedIn Posting:
```bash
python3 test_linkedin_post.py
```

### Renew LinkedIn Token (when expires):
```bash
python3 linkedin_oauth_personal.py
# Then use: python3 exchange_linkedin_code.py YOUR_CODE
```

---

## 📁 FILE LOCATIONS

1. **Main .env file:** `/Users/srijan/ai-finance-agency/.env`
2. **Backup .env:** `/Users/srijan/projects/ai-finance-agency/.env`
3. **This backup:** `/Users/srijan/ai-finance-agency/WORKING_CREDENTIALS_BACKUP.md`
4. **Test scripts:** 
   - `/Users/srijan/ai-finance-agency/test_all_platforms.py`
   - `/Users/srijan/ai-finance-agency/test_linkedin_post.py`

---

## ⚠️ SECURITY NOTES

1. These are PRODUCTION credentials - handle with care
2. LinkedIn token expires in ~60 days - set reminder for renewal
3. Never commit these to public repositories
4. Keep backups in secure, encrypted locations
5. Telegram and Twitter tokens don't expire unless revoked

---

## 📊 CONFIGURATION VERIFIED

- Database: `/Users/srijan/ai-finance-agency/posting_queue.db` (queue table fixed)
- All platforms tested with actual posts
- OAuth flow documented and working
- Recovery scripts in place

---

**SAVE THIS FILE IN MULTIPLE SECURE LOCATIONS**