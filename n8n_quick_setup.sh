#!/bin/bash

# N8N QUICK SETUP SCRIPT
# Sets up your Living Content System with existing credentials

echo "============================================================"
echo "🚀 N8N LIVING CONTENT SYSTEM - QUICK SETUP"
echo "============================================================"

# Check if n8n is installed
if ! command -v n8n &> /dev/null; then
    echo "📦 Installing n8n..."
    npm install -g n8n
fi

# Create n8n data directory
mkdir -p ~/.n8n

# Create environment file for n8n
cat > ~/.n8n/.env << 'EOF'
# N8N Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=aifinance2024
N8N_PORT=5678
N8N_PROTOCOL=http
N8N_HOST=localhost

# Webhook URL
WEBHOOK_URL=http://localhost:5678

# Execution settings
EXECUTIONS_PROCESS=main
EXECUTIONS_TIMEOUT=300
EXECUTIONS_TIMEOUT_MAX=3600

# Timezone
GENERIC_TIMEZONE=America/New_York
EOF

# Create credentials backup file
cat > ~/.n8n/credentials_to_add.json << 'EOF'
{
  "credentials": [
    {
      "name": "OpenAI API",
      "type": "openAiApi",
      "data": {
        "apiKey": "YOUR_OPENAI_API_KEY_HERE"
      }
    },
    {
      "name": "LinkedIn OAuth2",
      "type": "linkedInOAuth2Api",
      "data": {
        "clientId": "776dnomhse84tj",
        "clientSecret": "WPL_AP1.r3GQEtOyAZpKQkFJ.mafPeA==",
        "accessToken": "AQVNBJLurvvQadnOxVjEmDvw5Ly1QJ1xFDwtQ0-CizCgE6Nnn6nLR1Ge2sV5rsu6R3YflGSIdk18iG8kJ7AckrzD9hsgWKnzYE2qXVJ8C1nfzbwwczO0piHrMn5d5ZBGhlPikpKHQ69kAGlv0bjPd6qR3Pv3q401vKju4Jq1_yusR9ZlVH89vrGKzS9XmujzFDvs3oYGrRs3Ai94-ab7xayW_QrW97o_vHPWGUcNnMgKwWU-HcaZkL9_8cVrksgw-CezNSNHy1l42fQSU9gxy6wchhsitXG1sClUbiR-pyuw2FjY7bqvFu3axikXdn5rPkbbECCussoFJuyv8520Aa6Cagx02g"
      }
    },
    {
      "name": "Twitter OAuth",
      "type": "twitterOAuth1Api",
      "data": {
        "consumerKey": "m8cjXHgfiqIi7hmTjZggkezNR",
        "consumerSecret": "0NzKnMEBAii19BPJQg2hOnbKCISCSJK8BEyZDLZ6iXYoucVjX4",
        "accessToken": "345467935-RHxezdyz6tKzPH5lBGWEiQbeVmaLMMPvEOy28XkL",
        "accessTokenSecret": "qGLb2HCbk5kAUEbDnbd8BseV1VZehUuTZPjVfzh51reKM"
      }
    }
  ]
}
EOF

echo "✅ Configuration files created"

# Start n8n
echo ""
echo "🚀 Starting n8n..."
echo "============================================================"
echo "Access n8n at: http://localhost:5678"
echo "Username: admin"
echo "Password: aifinance2024"
echo "============================================================"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Open http://localhost:5678 in your browser"
echo "2. Import the workflow JSON"
echo "3. Credentials are saved in ~/.n8n/credentials_to_add.json"
echo "4. Activate the workflow"
echo "============================================================"

# Start n8n
n8n start