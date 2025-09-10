#!/bin/bash

# SMS Notification Script for Critical Alerts
# AI Finance Agency monitoring system

set -euo pipefail

# Configuration
TWILIO_ACCOUNT_SID="${TWILIO_ACCOUNT_SID:-}"
TWILIO_AUTH_TOKEN="${TWILIO_AUTH_TOKEN:-}"
TWILIO_PHONE_NUMBER="${TWILIO_PHONE_NUMBER:-}"
EMERGENCY_CONTACTS="${EMERGENCY_CONTACTS:-+1234567890}"

# Log file
LOG_FILE="/var/log/webhook/sms-notifications.log"
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

# Check if Twilio is configured
if [ -z "$TWILIO_ACCOUNT_SID" ] || [ -z "$TWILIO_AUTH_TOKEN" ] || [ -z "$TWILIO_PHONE_NUMBER" ]; then
    log "ERROR: Twilio not configured. Skipping SMS notification."
    exit 0
fi

# Parse alert data from stdin
ALERT_DATA=$(cat)
ALERT_NAME=$(echo "$ALERT_DATA" | jq -r '.alertname // "Unknown Alert"')
SERVICE=$(echo "$ALERT_DATA" | jq -r '.service // "Unknown Service"')
SEVERITY=$(echo "$ALERT_DATA" | jq -r '.severity // "unknown"')
SUMMARY=$(echo "$ALERT_DATA" | jq -r '.summary // "Alert triggered"')

# Create SMS message
SMS_MESSAGE="🚨 AI Finance Critical Alert 🚨
Service: $SERVICE
Alert: $ALERT_NAME
$SUMMARY
Time: $(date '+%H:%M %Z')
Check dashboard immediately!"

log "INFO: Sending SMS for critical alert: $ALERT_NAME (Service: $SERVICE)"

# Send SMS to each emergency contact
IFS=',' read -ra CONTACTS <<< "$EMERGENCY_CONTACTS"
for contact in "${CONTACTS[@]}"; do
    contact=$(echo "$contact" | tr -d ' ')
    
    if [ -n "$contact" ]; then
        log "INFO: Sending SMS to $contact"
        
        # Send SMS via Twilio API
        RESPONSE=$(curl -s -X POST "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json" \
            --data-urlencode "From=$TWILIO_PHONE_NUMBER" \
            --data-urlencode "To=$contact" \
            --data-urlencode "Body=$SMS_MESSAGE" \
            -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" \
            -w "HTTP_CODE:%{http_code}")
        
        HTTP_CODE=$(echo "$RESPONSE" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)
        
        if [ "$HTTP_CODE" = "201" ]; then
            log "INFO: SMS sent successfully to $contact"
        else
            log "ERROR: Failed to send SMS to $contact. HTTP code: $HTTP_CODE"
            log "ERROR: Response: $RESPONSE"
        fi
    fi
done

# Also send to Slack as backup
if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    log "INFO: Sending backup notification to Slack"
    
    SLACK_PAYLOAD=$(cat <<EOF
{
    "text": "📱 SMS Alert Sent - $ALERT_NAME",
    "attachments": [
        {
            "color": "danger",
            "fields": [
                {
                    "title": "Service",
                    "value": "$SERVICE",
                    "short": true
                },
                {
                    "title": "Severity",
                    "value": "$SEVERITY",
                    "short": true
                },
                {
                    "title": "Summary",
                    "value": "$SUMMARY",
                    "short": false
                },
                {
                    "title": "Contacts Notified",
                    "value": "${#CONTACTS[@]} contacts",
                    "short": true
                }
            ],
            "footer": "AI Finance Monitoring",
            "ts": $(date +%s)
        }
    ]
}
EOF
)

    curl -s -X POST "$SLACK_WEBHOOK_URL" \
        -H "Content-type: application/json" \
        -d "$SLACK_PAYLOAD" > /dev/null
fi

log "INFO: SMS notification process completed for alert: $ALERT_NAME"