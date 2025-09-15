#!/bin/bash

# AI Finance Agency - Backup Cron Setup
# This script sets up automated backup scheduling

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

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Setup backup scheduling
setup_backup_cron() {
    log_info "Setting up automated backup scheduling..."
    
    # Create backup cron job
    local cron_job="# AI Finance Agency - Automated Backup
# Daily backup at 2:00 AM
0 2 * * * $SCRIPT_DIR/automated-backup.sh >> /var/log/ai-finance-backup.log 2>&1

# Weekly full backup on Sunday at 1:00 AM  
0 1 * * 0 $SCRIPT_DIR/automated-backup.sh --full >> /var/log/ai-finance-backup.log 2>&1

# Monthly backup verification on 1st of each month at 3:00 AM
0 3 1 * * $SCRIPT_DIR/verify-backups.sh >> /var/log/ai-finance-backup-verify.log 2>&1"
    
    # Add to current user's crontab
    (crontab -l 2>/dev/null; echo "$cron_job") | crontab -
    
    log_success "Backup cron jobs installed"
    
    # Display current crontab
    log_info "Current crontab entries:"
    crontab -l | grep -A 10 "AI Finance Agency"
}

# Create backup verification script
create_verification_script() {
    log_info "Creating backup verification script..."
    
    cat > "$SCRIPT_DIR/verify-backups.sh" << 'EOF'
#!/bin/bash

# AI Finance Agency - Backup Verification Script
# This script verifies the integrity of backup files

set -e

BACKUP_DIR="${BACKUP_DIR:-/var/backups/ai-finance-agency}"
LOG_FILE="/var/log/ai-finance-backup-verify.log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

verify_postgresql_backup() {
    local backup_file=$1
    log "Verifying PostgreSQL backup: $backup_file"
    
    # Check if file exists and is not empty
    if [ ! -f "$backup_file" ] || [ ! -s "$backup_file" ]; then
        log "ERROR: Backup file missing or empty: $backup_file"
        return 1
    fi
    
    # Test gzip integrity
    if ! gzip -t "$backup_file" 2>/dev/null; then
        log "ERROR: Backup file corrupted: $backup_file"
        return 1
    fi
    
    # Check SQL syntax (basic check)
    if ! zcat "$backup_file" | head -100 | grep -q "PostgreSQL database dump"; then
        log "ERROR: Invalid PostgreSQL backup format: $backup_file"
        return 1
    fi
    
    log "SUCCESS: PostgreSQL backup verified: $backup_file"
    return 0
}

verify_mongodb_backup() {
    local backup_file=$1
    log "Verifying MongoDB backup: $backup_file"
    
    if [ ! -f "$backup_file" ] || [ ! -s "$backup_file" ]; then
        log "ERROR: Backup file missing or empty: $backup_file"
        return 1
    fi
    
    # Test tar.gz integrity
    if ! tar -tzf "$backup_file" >/dev/null 2>&1; then
        log "ERROR: Backup file corrupted: $backup_file"
        return 1
    fi
    
    log "SUCCESS: MongoDB backup verified: $backup_file"
    return 0
}

verify_redis_backup() {
    local backup_file=$1
    log "Verifying Redis backup: $backup_file"
    
    if [ ! -f "$backup_file" ] || [ ! -s "$backup_file" ]; then
        log "ERROR: Backup file missing or empty: $backup_file"
        return 1
    fi
    
    # Test gzip integrity
    if ! gzip -t "$backup_file" 2>/dev/null; then
        log "ERROR: Backup file corrupted: $backup_file"
        return 1
    fi
    
    log "SUCCESS: Redis backup verified: $backup_file"
    return 0
}

main() {
    log "Starting backup verification..."
    
    local failed_verifications=0
    local total_verifications=0
    
    # Find recent backup files (last 7 days)
    find "$BACKUP_DIR" -name "*.gz" -mtime -7 -type f | while read -r backup_file; do
        ((total_verifications++))
        
        if [[ "$backup_file" == *postgresql* ]]; then
            verify_postgresql_backup "$backup_file" || ((failed_verifications++))
        elif [[ "$backup_file" == *mongodb* ]]; then
            verify_mongodb_backup "$backup_file" || ((failed_verifications++))
        elif [[ "$backup_file" == *redis* ]]; then
            verify_redis_backup "$backup_file" || ((failed_verifications++))
        fi
    done
    
    log "Backup verification completed. Total: $total_verifications, Failed: $failed_verifications"
    
    if [ "$failed_verifications" -gt 0 ]; then
        exit 1
    fi
}

main "$@"
EOF
    
    chmod +x "$SCRIPT_DIR/verify-backups.sh"
    log_success "Backup verification script created"
}

# Create systemd service (alternative to cron)
create_systemd_service() {
    log_info "Creating systemd service for backup..."
    
    # Service file
    sudo tee /etc/systemd/system/ai-finance-backup.service > /dev/null << EOF
[Unit]
Description=AI Finance Agency Backup Service
After=postgresql.service redis.service

[Service]
Type=oneshot
User=$(whoami)
WorkingDirectory=$PROJECT_ROOT
Environment=BACKUP_DIR=/var/backups/ai-finance-agency
Environment=NODE_ENV=production
ExecStart=$SCRIPT_DIR/automated-backup.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    
    # Timer file
    sudo tee /etc/systemd/system/ai-finance-backup.timer > /dev/null << EOF
[Unit]
Description=AI Finance Agency Backup Timer
Requires=ai-finance-backup.service

[Timer]
OnCalendar=daily
Persistent=true
RandomizedDelaySec=30m

[Install]
WantedBy=timers.target
EOF
    
    # Enable and start timer
    sudo systemctl daemon-reload
    sudo systemctl enable ai-finance-backup.timer
    sudo systemctl start ai-finance-backup.timer
    
    log_success "Systemd backup service and timer created"
    
    # Show status
    sudo systemctl status ai-finance-backup.timer --no-pager
}

# Setup log rotation
setup_log_rotation() {
    log_info "Setting up log rotation..."
    
    sudo tee /etc/logrotate.d/ai-finance-backup > /dev/null << 'EOF'
/var/log/ai-finance-backup*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
    postrotate
        # Restart rsyslog if needed
        systemctl reload rsyslog >/dev/null 2>&1 || true
    endscript
}
EOF
    
    log_success "Log rotation configured"
}

# Create backup monitoring script
create_monitoring_script() {
    log_info "Creating backup monitoring script..."
    
    cat > "$SCRIPT_DIR/monitor-backups.sh" << 'EOF'
#!/bin/bash

# AI Finance Agency - Backup Monitoring Script
# This script monitors backup health and sends alerts

BACKUP_DIR="${BACKUP_DIR:-/var/backups/ai-finance-agency}"
ALERT_THRESHOLD_HOURS=26  # Alert if backup older than 26 hours
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL}"

check_backup_freshness() {
    local latest_backup=$(find "$BACKUP_DIR" -name "*.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2-)
    
    if [ -z "$latest_backup" ]; then
        echo "ERROR: No backup files found"
        return 1
    fi
    
    local backup_age_hours=$(( ($(date +%s) - $(stat -c %Y "$latest_backup")) / 3600 ))
    
    if [ "$backup_age_hours" -gt "$ALERT_THRESHOLD_HOURS" ]; then
        echo "ERROR: Latest backup is $backup_age_hours hours old (threshold: $ALERT_THRESHOLD_HOURS hours)"
        return 1
    fi
    
    echo "SUCCESS: Latest backup is $backup_age_hours hours old"
    return 0
}

send_alert() {
    local message=$1
    
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\": \"🚨 AI Finance Agency Backup Alert: $message\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
}

main() {
    if ! check_backup_freshness; then
        send_alert "Backup monitoring failed - check backup system"
        exit 1
    fi
}

main "$@"
EOF
    
    chmod +x "$SCRIPT_DIR/monitor-backups.sh"
    log_success "Backup monitoring script created"
}

# Main setup process
main() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         AI FINANCE AGENCY - BACKUP SYSTEM SETUP               ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║ This script will set up automated backup scheduling           ║${NC}"
    echo -e "${BLUE}║ and monitoring for your production environment.               ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo
    
    # Create backup directories
    sudo mkdir -p /var/backups/ai-finance-agency/{postgresql,mongodb,redis,logs,temp}
    sudo chown -R "$(whoami):$(whoami)" /var/backups/ai-finance-agency
    
    # Setup components
    create_verification_script
    create_monitoring_script
    setup_log_rotation
    
    # Choose scheduling method
    echo
    log_info "Choose backup scheduling method:"
    echo "1) Cron (traditional)"
    echo "2) Systemd (recommended for modern systems)"
    read -p "Enter choice (1 or 2): " choice
    
    case $choice in
        1)
            setup_backup_cron
            ;;
        2)
            create_systemd_service
            ;;
        *)
            log_warning "Invalid choice. Setting up both methods."
            setup_backup_cron
            create_systemd_service
            ;;
    esac
    
    echo
    log_success "Backup system setup completed!"
    echo
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                     NEXT STEPS                                 ║${NC}"
    echo -e "${BLUE}╠════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${BLUE}║ 1. Test backup: $SCRIPT_DIR/automated-backup.sh --test${NC}"
    echo -e "${BLUE}║ 2. Run manual backup: $SCRIPT_DIR/automated-backup.sh${NC}"
    echo -e "${BLUE}║ 3. Monitor backups: $SCRIPT_DIR/monitor-backups.sh${NC}"
    echo -e "${BLUE}║ 4. Verify backups: $SCRIPT_DIR/verify-backups.sh${NC}"
    echo -e "${BLUE}║                                                               ║${NC}"
    echo -e "${BLUE}║ Backup Location: /var/backups/ai-finance-agency               ║${NC}"
    echo -e "${BLUE}║ Log Files: /var/log/ai-finance-backup*.log                   ║${NC}"
    echo -e "${BLUE}║                                                               ║${NC}"
    echo -e "${YELLOW}║ Configure S3_BUCKET and SLACK_WEBHOOK_URL in environment     ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo
}

# Check if running as root for systemd setup
if [[ $EUID -eq 0 ]]; then
    log_warning "Running as root. Some operations may require sudo permissions."
fi

# Run main function
main "$@"