# 🔑 API Keys Setup Guide - AI Finance Agency

## 🚨 **URGENT: Configure These API Keys**

Your system is missing these critical API keys:

### **1. Telegram Bot Token**
```bash
# Steps:
1. Open Telegram and message @BotFather
2. Send: /newbot
3. Choose bot name and username
4. Copy the token (format: 1234567890:AAA-XXXXXXXXXXXXXXXXXXXXXXXXXXXXX)
5. Add to .env: TELEGRAM_BOT_TOKEN=your_token_here
```

### **2. LinkedIn OAuth Credentials**
```bash
# Steps:
1. Visit: https://developer.linkedin.com/
2. Create new app
3. Add redirect URL: http://localhost:3000/auth/linkedin/callback
4. Copy Client ID and Client Secret
5. Add to .env:
   LINKEDIN_PERSONAL_CLIENT_ID=your_client_id
   LINKEDIN_PERSONAL_CLIENT_SECRET=your_client_secret
```

### **3. Twitter API Credentials**
```bash
# Steps:
1. Visit: https://developer.twitter.com/
2. Create project and app
3. Generate API Keys and Bearer Token
4. Set permissions: Read and Write
5. Add to .env:
   TWITTER_CONSUMER_KEY=your_key
   TWITTER_CONSUMER_SECRET=your_secret
   TWITTER_BEARER_TOKEN=your_bearer_token
```

## 🔧 **Quick Configuration**

Copy your .env and add the keys:
```bash
cp .env .env.backup
# Edit .env with your actual API keys
```

## ✅ **Verification Commands**

Test each API after configuration:
```bash
# Test Telegram Bot
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"

# Test LinkedIn (after OAuth flow)
# Test Twitter
curl -H "Authorization: Bearer $TWITTER_BEARER_TOKEN" \
     "https://api.twitter.com/2/users/me"
```

## 🚀 **After Setup**

Once keys are configured:
1. Restart your services
2. Test social media integrations  
3. Verify notifications work
4. Proceed with Warp AI integration

## 🛡️ **Security Notes**

- Never commit .env files to git
- Rotate keys regularly
- Use environment-specific keys for prod/dev
- Monitor API usage and quotas