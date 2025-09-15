#!/bin/bash

# AI Finance Agency - Production Secrets Setup
# This script helps you configure all production API keys and secrets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Generate secure random string
generate_secure_string() {
    local length=${1:-64}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Prompt for API key
prompt_for_key() {
    local service=$1
    local var_name=$2
    local description=$3
    local optional=${4:-false}
    
    echo -e "\n${BLUE}━━━ $service ━━━${NC}"
    echo "Description: $description"
    
    if [[ "$optional" == "true" ]]; then
        echo -e "${YELLOW}(Optional - press Enter to skip)${NC}"
    fi
    
    read -p "Enter $var_name: " -s value
    echo
    
    if [[ -n "$value" ]]; then
        echo "export $var_name=\"$value\"" >> .env.production.secrets
        log_success "$service configured"
    elif [[ "$optional" == "false" ]]; then
        log_warning "$service skipped (required for production)"
    else
        log_info "$service skipped (optional)"
    fi
}

main() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║              AI FINANCE AGENCY - PRODUCTION SETUP              ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║ This script will help you configure production API keys       ║${NC}"
    echo -e "${BLUE}║ and secrets for your AI Finance Agency deployment.            ║${NC}"
    echo -e "${BLUE}║                                                               ║${NC}"
    echo -e "${YELLOW}║ ⚠️  SECURITY WARNING: Never share these credentials!          ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo
    
    # Create production secrets file
    cat > .env.production.secrets << 'EOF'
# AI Finance Agency - Production Secrets
# ⚠️  CRITICAL: Never commit this file to version control
# Generated on: $(date)

# ===========================================
# SECURITY SECRETS (Generated)
# ===========================================
EOF
    
    log_info "Generating secure secrets..."
    
    # Generate secure secrets
    JWT_SECRET=$(generate_secure_string 64)
    SESSION_SECRET=$(generate_secure_string 64)
    ENCRYPTION_KEY=$(generate_secure_string 32)
    
    cat >> .env.production.secrets << EOF

# Security secrets (auto-generated)
export JWT_PROD_SECRET="$JWT_SECRET"
export SESSION_PROD_SECRET="$SESSION_SECRET"
export ENCRYPTION_PROD_KEY="$ENCRYPTION_KEY"

# Database passwords (auto-generated)
export POSTGRES_PROD_PASSWORD="$(generate_secure_string 32)"
export REDIS_PROD_PASSWORD="$(generate_secure_string 32)"
export MONGO_PROD_PASSWORD="$(generate_secure_string 32)"
export RABBITMQ_PROD_PASSWORD="$(generate_secure_string 32)"

# ===========================================
# EXTERNAL API KEYS (Manual Configuration)
# ===========================================
EOF
    
    log_success "Security secrets generated"
    
    echo -e "\n${BLUE}Now let's configure your external API keys...${NC}"
    echo -e "${YELLOW}Note: You can skip optional services and configure them later${NC}"
    
    # AI Services
    prompt_for_key "Claude AI (Anthropic)" "CLAUDE_PROD_API_KEY" "Claude API key for AI analysis and compliance features"
    prompt_for_key "OpenAI" "OPENAI_PROD_API_KEY" "OpenAI API key for content generation and creative tasks"
    prompt_for_key "Perplexity" "PERPLEXITY_PROD_API_KEY" "Perplexity API key for web search and research" true
    
    # Payment Processing
    prompt_for_key "Stripe" "STRIPE_PROD_SECRET_KEY" "Stripe secret key for payment processing"
    prompt_for_key "Stripe Webhooks" "STRIPE_PROD_WEBHOOK_SECRET" "Stripe webhook endpoint secret"
    prompt_for_key "PayPal" "PAYPAL_PROD_CLIENT_ID" "PayPal client ID for payment processing" true
    prompt_for_key "PayPal Secret" "PAYPAL_PROD_CLIENT_SECRET" "PayPal client secret" true
    
    # Market Data
    prompt_for_key "Alpha Vantage" "ALPHA_VANTAGE_PROD_KEY" "Alpha Vantage API key for stock market data"
    prompt_for_key "Finnhub" "FINNHUB_PROD_KEY" "Finnhub API key for financial data" true
    prompt_for_key "Polygon.io" "POLYGON_PROD_KEY" "Polygon.io API key for market data" true
    
    # Notifications
    prompt_for_key "SendGrid" "SENDGRID_PROD_KEY" "SendGrid API key for email notifications"
    prompt_for_key "Twilio SID" "TWILIO_PROD_SID" "Twilio Account SID for SMS notifications" true
    prompt_for_key "Twilio Token" "TWILIO_PROD_TOKEN" "Twilio Auth Token" true
    prompt_for_key "Twilio Phone" "TWILIO_PROD_PHONE" "Twilio phone number (format: +1234567890)" true
    
    # Monitoring
    prompt_for_key "Slack Webhook" "SLACK_PROD_WEBHOOK" "Slack webhook URL for notifications" true
    prompt_for_key "Sentry DSN" "SENTRY_PROD_DSN" "Sentry DSN for error tracking" true
    
    # Additional configurations
    cat >> .env.production.secrets << 'EOF'

# ===========================================
# ADDITIONAL CONFIGURATIONS
# ===========================================

# Monitoring passwords (auto-generated)
export GRAFANA_PROD_PASSWORD="$(generate_secure_string 16)"

# Backup configuration
export BACKUP_S3_BUCKET_NAME="ai-finance-agency-backup-prod"

EOF
    
    # Set secure permissions
    chmod 600 .env.production.secrets
    
    echo
    log_success "Production secrets configuration completed!"
    echo
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                        NEXT STEPS                              ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║ 1. Review the generated file: .env.production.secrets         ║${NC}"
    echo -e "${BLUE}║ 2. Source the secrets: source .env.production.secrets        ║${NC}"
    echo -e "${BLUE}║ 3. Test API connections: ./scripts/verify-api-integrations.sh ║${NC}"
    echo -e "${BLUE}║ 4. Deploy to production with these environment variables      ║${NC}"
    echo -e "${BLUE}║                                                               ║${NC}"
    echo -e "${YELLOW}║ ⚠️  IMPORTANT: Keep .env.production.secrets secure!           ║${NC}"
    echo -e "${YELLOW}║    - Never commit to version control                          ║${NC}"
    echo -e "${YELLOW}║    - Use secure deployment methods                            ║${NC}"
    echo -e "${YELLOW}║    - Rotate keys regularly                                    ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo
    
    # Show file location
    echo -e "${GREEN}Configuration saved to: $(pwd)/.env.production.secrets${NC}"
    echo -e "${YELLOW}File permissions set to 600 (owner read/write only)${NC}"
}

# Check dependencies
if ! command -v openssl &> /dev/null; then
    log_error "OpenSSL is required but not installed"
    exit 1
fi

# Run main function
main "$@"