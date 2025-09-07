# 🔐 N8N Credentials - KEEP SECURE

## N8N Owner Account (Main Login)
- **URL**: http://localhost:5678
- **Email**: triumfagency@gmail.com
- **First Name**: Srijan
- **Last Name**: Arya
- **Password**: Aifanance2024

## Database Credentials (PostgreSQL)
- **Database**: ai_finance_agency
- **User**: postgres
- **Password**: aifinance123

## Basic Auth (if enabled)
- **Username**: admin
- **Password**: aifinance2024

## Slack Credentials (AI Finance Content Bot)
- **App ID**: A09E0HP1GUC
- **Client ID**: [STORED IN .env]
- **Client Secret**: [STORED IN .env]
- **Signing Secret**: [STORED IN .env]
- **Verification Token**: [STORED IN .env]
- **User OAuth Token**: [STORED IN .env]
- **Bot User OAuth Token**: [STORED IN .env]
- **App Token**: [STORED IN .env]
- **Workspace**: New Workspace

## Important Services URLs
- **N8N Dashboard**: http://localhost:5678
- **AI Finance Dashboard**: http://localhost:8088
- **Slack App Management**: https://api.slack.com/apps/A09E0HP1GUC

## Docker Commands
```bash
# Start N8N
docker-compose -f docker-compose-n8n.yml up -d

# Stop N8N
docker-compose -f docker-compose-n8n.yml down

# View Logs
docker logs -f n8n-finance

# Restart Services
docker-compose -f docker-compose-n8n.yml restart
```

## Workflow Files Location
`/Users/srijan/ai-finance-agency/n8n-workflows/`

---
*Created: September 6, 2025*
*Last Updated: September 6, 2025*

⚠️ **SECURITY NOTE**: Keep this file private. Do not commit to Git.