#!/bin/bash

# AI Finance Agency - API Keys and Integrations Verification
# This script tests all external API connections and verifies credentials

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
LOG_FILE="/tmp/api-verification-$(date +%Y%m%d-%H%M%S).log"
RESULTS_FILE="/tmp/api-verification-results.json"

# Load environment variables
source .env 2>/dev/null || echo "Warning: .env file not found"

# Logging functions
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Initialize results file
init_results() {
    cat > "$RESULTS_FILE" << 'EOF'
{
  "verification_time": "",
  "total_apis": 0,
  "successful": 0,
  "failed": 0,
  "warnings": 0,
  "results": {}
}
EOF
}

# Update results
update_result() {
    local service=$1
    local status=$2
    local message=$3
    local response_time=${4:-"N/A"}
    
    # Use jq to update the results file
    local temp_file=$(mktemp)
    jq --arg service "$service" \
       --arg status "$status" \
       --arg message "$message" \
       --arg response_time "$response_time" \
       '.results[$service] = {
         "status": $status,
         "message": $message,
         "response_time": $response_time,
         "tested_at": now | strftime("%Y-%m-%d %H:%M:%S")
       }' "$RESULTS_FILE" > "$temp_file" && mv "$temp_file" "$RESULTS_FILE"
}

# Test Claude API
test_claude_api() {
    log_info "Testing Claude API..."
    
    if [[ -z "$CLAUDE_API_KEY" ]]; then
        log_error "Claude API key not found"
        update_result "claude" "MISSING" "API key not configured"
        return 1
    fi
    
    local start_time=$(date +%s%N)
    local response=$(curl -s -w "%{http_code}" \
        -H "Content-Type: application/json" \
        -H "X-API-Key: $CLAUDE_API_KEY" \
        -H "anthropic-version: 2023-06-01" \
        -d '{
            "model": "claude-3-haiku-20240307",
            "max_tokens": 10,
            "messages": [{"role": "user", "content": "test"}]
        }' \
        "https://api.anthropic.com/v1/messages" 2>/dev/null)
    
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        log_success "Claude API connection successful (${response_time}ms)"
        update_result "claude" "SUCCESS" "API key valid and working" "${response_time}ms"
        return 0
    else
        log_error "Claude API failed with status: $http_code"
        update_result "claude" "FAILED" "HTTP status: $http_code" "${response_time}ms"
        return 1
    fi
}

# Test OpenAI API
test_openai_api() {
    log_info "Testing OpenAI API..."
    
    if [[ -z "$OPENAI_API_KEY" ]]; then
        log_error "OpenAI API key not found"
        update_result "openai" "MISSING" "API key not configured"
        return 1
    fi
    
    local start_time=$(date +%s%N)
    local response=$(curl -s -w "%{http_code}" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $OPENAI_API_KEY" \
        -d '{
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": "test"}],
            "max_tokens": 5
        }' \
        "https://api.openai.com/v1/chat/completions" 2>/dev/null)
    
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        log_success "OpenAI API connection successful (${response_time}ms)"
        update_result "openai" "SUCCESS" "API key valid and working" "${response_time}ms"
        return 0
    else
        log_error "OpenAI API failed with status: $http_code"
        update_result "openai" "FAILED" "HTTP status: $http_code" "${response_time}ms"
        return 1
    fi
}

# Test Stripe API
test_stripe_api() {
    log_info "Testing Stripe API..."
    
    if [[ -z "$STRIPE_SECRET_KEY" ]]; then
        log_error "Stripe secret key not found"
        update_result "stripe" "MISSING" "API key not configured"
        return 1
    fi
    
    local start_time=$(date +%s%N)
    local response=$(curl -s -w "%{http_code}" \
        -u "$STRIPE_SECRET_KEY:" \
        "https://api.stripe.com/v1/customers?limit=1" 2>/dev/null)
    
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        log_success "Stripe API connection successful (${response_time}ms)"
        update_result "stripe" "SUCCESS" "API key valid and working" "${response_time}ms"
        return 0
    else
        log_error "Stripe API failed with status: $http_code"
        update_result "stripe" "FAILED" "HTTP status: $http_code" "${response_time}ms"
        return 1
    fi
}

# Test Alpha Vantage API
test_alpha_vantage_api() {
    log_info "Testing Alpha Vantage API..."
    
    if [[ -z "$ALPHA_VANTAGE_API_KEY" ]]; then
        log_warning "Alpha Vantage API key not found"
        update_result "alpha_vantage" "MISSING" "API key not configured"
        return 1
    fi
    
    local start_time=$(date +%s%N)
    local response=$(curl -s -w "%{http_code}" \
        "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=$ALPHA_VANTAGE_API_KEY" 2>/dev/null)
    
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]] && [[ "$response" == *"Global Quote"* ]]; then
        log_success "Alpha Vantage API connection successful (${response_time}ms)"
        update_result "alpha_vantage" "SUCCESS" "API key valid and working" "${response_time}ms"
        return 0
    else
        log_error "Alpha Vantage API failed"
        update_result "alpha_vantage" "FAILED" "Invalid response or API key" "${response_time}ms"
        return 1
    fi
}

# Test Finnhub API
test_finnhub_api() {
    log_info "Testing Finnhub API..."
    
    if [[ -z "$FINNHUB_API_KEY" ]]; then
        log_warning "Finnhub API key not found"
        update_result "finnhub" "MISSING" "API key not configured"
        return 1
    fi
    
    local start_time=$(date +%s%N)
    local response=$(curl -s -w "%{http_code}" \
        "https://finnhub.io/api/v1/quote?symbol=AAPL&token=$FINNHUB_API_KEY" 2>/dev/null)
    
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]] && [[ "$response" == *"c"* ]]; then
        log_success "Finnhub API connection successful (${response_time}ms)"
        update_result "finnhub" "SUCCESS" "API key valid and working" "${response_time}ms"
        return 0
    else
        log_error "Finnhub API failed"
        update_result "finnhub" "FAILED" "Invalid response or API key" "${response_time}ms"
        return 1
    fi
}

# Test SendGrid API
test_sendgrid_api() {
    log_info "Testing SendGrid API..."
    
    if [[ -z "$SENDGRID_API_KEY" ]]; then
        log_warning "SendGrid API key not found"
        update_result "sendgrid" "MISSING" "API key not configured"
        return 1
    fi
    
    local start_time=$(date +%s%N)
    local response=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer $SENDGRID_API_KEY" \
        "https://api.sendgrid.com/v3/user/profile" 2>/dev/null)
    
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        log_success "SendGrid API connection successful (${response_time}ms)"
        update_result "sendgrid" "SUCCESS" "API key valid and working" "${response_time}ms"
        return 0
    else
        log_error "SendGrid API failed with status: $http_code"
        update_result "sendgrid" "FAILED" "HTTP status: $http_code" "${response_time}ms"
        return 1
    fi
}

# Test Twilio API
test_twilio_api() {
    log_info "Testing Twilio API..."
    
    if [[ -z "$TWILIO_ACCOUNT_SID" ]] || [[ -z "$TWILIO_AUTH_TOKEN" ]]; then
        log_warning "Twilio credentials not found"
        update_result "twilio" "MISSING" "Credentials not configured"
        return 1
    fi
    
    local start_time=$(date +%s%N)
    local response=$(curl -s -w "%{http_code}" \
        -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
        "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID.json" 2>/dev/null)
    
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        log_success "Twilio API connection successful (${response_time}ms)"
        update_result "twilio" "SUCCESS" "Credentials valid and working" "${response_time}ms"
        return 0
    else
        log_error "Twilio API failed with status: $http_code"
        update_result "twilio" "FAILED" "HTTP status: $http_code" "${response_time}ms"
        return 1
    fi
}

# Test Slack Webhook
test_slack_webhook() {
    log_info "Testing Slack Webhook..."
    
    if [[ -z "$SLACK_WEBHOOK_URL" ]]; then
        log_warning "Slack webhook URL not found"
        update_result "slack" "MISSING" "Webhook URL not configured"
        return 1
    fi
    
    local start_time=$(date +%s%N)
    local response=$(curl -s -w "%{http_code}" \
        -H "Content-Type: application/json" \
        -d '{"text": "API verification test from AI Finance Agency"}' \
        "$SLACK_WEBHOOK_URL" 2>/dev/null)
    
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        log_success "Slack webhook connection successful (${response_time}ms)"
        update_result "slack" "SUCCESS" "Webhook working correctly" "${response_time}ms"
        return 0
    else
        log_error "Slack webhook failed with status: $http_code"
        update_result "slack" "FAILED" "HTTP status: $http_code" "${response_time}ms"
        return 1
    fi
}

# Test Yahoo Finance (free API)
test_yahoo_finance() {
    log_info "Testing Yahoo Finance API..."
    
    local start_time=$(date +%s%N)
    local response=$(curl -s -w "%{http_code}" \
        "https://query1.finance.yahoo.com/v8/finance/chart/AAPL?interval=1d&range=1d" 2>/dev/null)
    
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))
    local http_code="${response: -3}"
    
    if [[ "$http_code" == "200" ]]; then
        log_success "Yahoo Finance API connection successful (${response_time}ms)"
        update_result "yahoo_finance" "SUCCESS" "Free API working correctly" "${response_time}ms"
        return 0
    else
        log_error "Yahoo Finance API failed with status: $http_code"
        update_result "yahoo_finance" "FAILED" "HTTP status: $http_code" "${response_time}ms"
        return 1
    fi
}

# Generate final report
generate_report() {
    local verification_time=$(date "+%Y-%m-%d %H:%M:%S")
    
    # Update summary in results file
    local temp_file=$(mktemp)
    jq --arg time "$verification_time" \
       '.verification_time = $time |
        .total_apis = (.results | length) |
        .successful = [.results[] | select(.status == "SUCCESS")] | length |
        .failed = [.results[] | select(.status == "FAILED")] | length |
        .warnings = [.results[] | select(.status == "MISSING")] | length' \
       "$RESULTS_FILE" > "$temp_file" && mv "$temp_file" "$RESULTS_FILE"
    
    log_info "Generating verification report..."
    
    # Read results
    local total_apis=$(jq -r '.total_apis' "$RESULTS_FILE")
    local successful=$(jq -r '.successful' "$RESULTS_FILE")
    local failed=$(jq -r '.failed' "$RESULTS_FILE")
    local warnings=$(jq -r '.warnings' "$RESULTS_FILE")
    
    # Display summary
    echo
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                 API VERIFICATION REPORT                        ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║ Verification Time: $verification_time                    ║${NC}"
    echo -e "${BLUE}║ Total APIs Tested: $total_apis                                          ║${NC}"
    echo -e "${GREEN}║ Successful: $successful                                               ║${NC}"
    echo -e "${RED}║ Failed: $failed                                                   ║${NC}"
    echo -e "${YELLOW}║ Missing/Not Configured: $warnings                                     ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════════════╣${NC}"
    
    # Display detailed results
    echo -e "${BLUE}║ Detailed Results:                                             ║${NC}"
    jq -r '.results | to_entries[] | "║ \(.key): \(.value.status) - \(.value.message)"' "$RESULTS_FILE" | while read -r line; do
        if [[ "$line" == *"SUCCESS"* ]]; then
            echo -e "${GREEN}$line${NC}"
        elif [[ "$line" == *"FAILED"* ]]; then
            echo -e "${RED}$line${NC}"
        else
            echo -e "${YELLOW}$line${NC}"
        fi
    done
    
    echo -e "${BLUE}╠════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║ Files Generated:                                               ║${NC}"
    echo -e "${BLUE}║ • Log file: $LOG_FILE${NC}"
    echo -e "${BLUE}║ • Results JSON: $RESULTS_FILE${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo
    
    # Return appropriate exit code
    if [[ "$failed" -gt 0 ]]; then
        return 1
    else
        return 0
    fi
}

# Main execution
main() {
    log_info "Starting API integrations verification..."
    
    # Check dependencies
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log_error "jq is required but not installed"
        exit 1
    fi
    
    # Initialize results
    init_results
    
    # Test all APIs
    test_claude_api || true
    test_openai_api || true
    test_stripe_api || true
    test_alpha_vantage_api || true
    test_finnhub_api || true
    test_sendgrid_api || true
    test_twilio_api || true
    test_slack_webhook || true
    test_yahoo_finance || true
    
    # Generate final report
    generate_report
}

# Run main function
main "$@"