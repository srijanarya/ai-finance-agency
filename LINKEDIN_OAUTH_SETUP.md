# LinkedIn OAuth Automation Setup Guide

## 🚀 Overview

The LinkedIn OAuth automation system ensures your access tokens are automatically refreshed before expiry, preventing any interruption in social media posting.

## 📦 Components

1. **`linkedin_oauth_refresh.py`** - Core token management system
2. **`scripts/linkedin-oauth-daemon.sh`** - Daemon control script
3. **`scripts/com.aifinance.linkedin-oauth.plist`** - macOS LaunchAgent

## 🔧 Installation

### Step 1: Install Dependencies

```bash
pip install schedule python-dotenv requests
```

### Step 2: Test Token Management

```bash
# Check current token status
python3 linkedin_oauth_refresh.py status

# Run a manual check
python3 linkedin_oauth_refresh.py check

# Force refresh (if needed)
python3 linkedin_oauth_refresh.py refresh
```

### Step 3: Start the Daemon

#### Option A: Using Shell Script (Recommended for Testing)

```bash
# Start the daemon
./scripts/linkedin-oauth-daemon.sh start

# Check status
./scripts/linkedin-oauth-daemon.sh status

# View logs
./scripts/linkedin-oauth-daemon.sh logs

# Stop daemon
./scripts/linkedin-oauth-daemon.sh stop
```

#### Option B: Using macOS LaunchAgent (Recommended for Production)

```bash
# Copy plist to LaunchAgents
cp scripts/com.aifinance.linkedin-oauth.plist ~/Library/LaunchAgents/

# Load the agent
launchctl load ~/Library/LaunchAgents/com.aifinance.linkedin-oauth.plist

# Start immediately
launchctl start com.aifinance.linkedin-oauth

# Check if running
launchctl list | grep linkedin
```

### Step 4: Verify Automation

```bash
# Check logs
tail -f data/logs/linkedin_oauth.log

# Check notifications
cat data/notifications/linkedin_oauth.json | jq '.'
```

## 📋 Features

### Automatic Token Refresh
- Checks token validity every 12 hours
- Refreshes tokens 7 days before expiry
- Uses refresh token for seamless renewal

### Monitoring & Notifications
- Logs all token operations
- Creates JSON notifications for status changes
- Tracks expiry dates and validity

### Error Handling
- Retries failed refresh attempts
- Sends alerts when manual intervention needed
- Maintains backup token information

## 🔍 Token Status Commands

```bash
# Quick status check
python3 linkedin_oauth_refresh.py status

# Output example:
# 📊 LinkedIn Token Status
# ==================================================
# Has Access Token: ✅
# Has Refresh Token: ✅
# Is Valid: ✅
# Expires At: 2025-11-10T09:00:00
# Days Remaining: 60
# Needs Refresh: No
```

## 📅 Scheduled Checks

The daemon performs checks:
- Every day at 9:00 AM
- Every day at 9:00 PM
- Every 12 hours as backup

## 🚨 Manual Token Renewal

If automatic refresh fails:

1. **Get new authorization code:**
```bash
python3 linkedin_oauth_personal.py
```

2. **Exchange for access token:**
```bash
python3 exchange_linkedin_code.py YOUR_AUTH_CODE
```

3. **Update token manager:**
```bash
python3 linkedin_oauth_refresh.py refresh
```

4. **Verify working:**
```bash
python3 test_linkedin_post.py
```

## 📊 Monitoring Dashboard

View token status in real-time:

```bash
# Start monitoring dashboard
python3 monitoring_dashboard.py

# API endpoint for status
curl http://localhost:8080/api/linkedin/token/status
```

## 🔐 Security Notes

1. **Token Storage:**
   - Tokens stored in `data/linkedin_tokens.json`
   - Encrypted in `.env` file
   - Backup in `credentials_backup.json`

2. **Access Control:**
   - Daemon runs with user permissions only
   - No root access required
   - Tokens never logged in plaintext

3. **Refresh Token Security:**
   - Refresh tokens rotated on each use
   - Stored separately from access tokens
   - Never exposed in logs or notifications

## 🛠️ Troubleshooting

### Daemon Not Starting
```bash
# Check for existing process
ps aux | grep linkedin_oauth

# Kill existing process
pkill -f linkedin_oauth_refresh

# Restart daemon
./scripts/linkedin-oauth-daemon.sh restart
```

### Token Refresh Failing
```bash
# Check logs for errors
tail -50 data/logs/linkedin_oauth.log | grep ERROR

# Verify credentials
cat .env | grep LINKEDIN

# Force manual refresh
python3 linkedin_oauth_refresh.py refresh
```

### LaunchAgent Issues (macOS)
```bash
# Unload agent
launchctl unload ~/Library/LaunchAgents/com.aifinance.linkedin-oauth.plist

# Check for errors
tail -f /var/log/system.log | grep linkedin

# Reload agent
launchctl load ~/Library/LaunchAgents/com.aifinance.linkedin-oauth.plist
```

## 📈 Success Metrics

When properly configured:
- ✅ Zero manual token renewals required
- ✅ 100% uptime for LinkedIn posting
- ✅ Automatic recovery from token expiry
- ✅ Proactive refresh before expiration
- ✅ Complete audit trail of all operations

## 🔄 Next Steps

1. ✅ OAuth automation system installed
2. ⏳ Monitor first automatic refresh (7 days before Nov 10)
3. 📊 Review logs weekly for any issues
4. 🔐 Backup refresh tokens monthly

---

**Last Updated:** September 11, 2025
**Token Expires:** November 10, 2025
**Days Remaining:** 60