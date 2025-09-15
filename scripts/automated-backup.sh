#!/bin/bash

# AI Finance Agency - Automated Database Backup Script
# This script creates automated backups of all databases with rotation and monitoring

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/ai-finance-agency}"
S3_BUCKET="${BACKUP_S3_BUCKET:-ai-finance-agency-backup-prod}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
COMPRESSION_LEVEL="${BACKUP_COMPRESSION_LEVEL:-6}"
PARALLEL_JOBS="${BACKUP_PARALLEL_JOBS:-3}"

# Database configurations
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-ai_finance_user}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-securepassword123}"

MONGO_HOST="${MONGO_HOST:-localhost}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_USER="${MONGO_ROOT_USERNAME:-admin}"
MONGO_PASSWORD="${MONGO_ROOT_PASSWORD:-securepass123}"

REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
LOG_FILE="${BACKUP_DIR}/logs/backup-$(date +%Y%m%d).log"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

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

# Create directory structure
setup_directories() {
    local dirs=(
        "$BACKUP_DIR"
        "$BACKUP_DIR/postgresql"
        "$BACKUP_DIR/mongodb"
        "$BACKUP_DIR/redis"
        "$BACKUP_DIR/logs"
        "$BACKUP_DIR/temp"
    )
    
    for dir in "${dirs[@]}"; do
        mkdir -p "$dir"
    done
    
    log_success "Backup directories created"
}

# Check available disk space
check_disk_space() {
    local required_space_gb=10
    local available_space=$(df "$BACKUP_DIR" | awk 'NR==2 {print int($4/1024/1024)}')
    
    if [ "$available_space" -lt "$required_space_gb" ]; then
        log_error "Insufficient disk space. Required: ${required_space_gb}GB, Available: ${available_space}GB"
        exit 1
    fi
    
    log_info "Available disk space: ${available_space}GB"
}

# Test database connections
test_connections() {
    log_info "Testing database connections..."
    
    # PostgreSQL
    if psql "postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/postgres" -c "SELECT 1;" >/dev/null 2>&1; then
        log_success "PostgreSQL connection successful"
    else
        log_error "PostgreSQL connection failed"
        return 1
    fi
    
    # MongoDB
    if mongosh --host "$MONGO_HOST:$MONGO_PORT" --username "$MONGO_USER" --password "$MONGO_PASSWORD" --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
        log_success "MongoDB connection successful"
    else
        log_warning "MongoDB connection failed - will skip MongoDB backup"
    fi
    
    # Redis
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping >/dev/null 2>&1; then
        log_success "Redis connection successful"
    else
        log_warning "Redis connection failed - will skip Redis backup"
    fi
}

# Backup PostgreSQL databases
backup_postgresql() {
    log_info "Starting PostgreSQL backup..."
    
    local pg_backup_dir="$BACKUP_DIR/postgresql/$TIMESTAMP"
    mkdir -p "$pg_backup_dir"
    
    # List of databases to backup
    local databases=(
        "ai_finance_db"
        "user_db"
        "trading_db"
        "payment_db"
        "signals_db"
        "education_db"
        "risk_db"
    )
    
    # Create parallel backup function
    backup_pg_database() {
        local db_name=$1
        local output_file="$pg_backup_dir/${db_name}_${TIMESTAMP}.sql"
        local compressed_file="${output_file}.gz"
        
        log_info "Backing up PostgreSQL database: $db_name"
        
        if pg_dump "postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$db_name" \
            --verbose --clean --no-owner --no-acl --format=plain \
            --file="$output_file" 2>>"$LOG_FILE"; then
            
            # Compress the backup
            gzip -$COMPRESSION_LEVEL "$output_file"
            
            # Verify backup integrity
            if [ -f "$compressed_file" ] && [ -s "$compressed_file" ]; then
                local file_size=$(du -h "$compressed_file" | cut -f1)
                log_success "PostgreSQL backup completed: $db_name ($file_size)"
                
                # Upload to S3 if configured
                if [ -n "$S3_BUCKET" ]; then
                    upload_to_s3 "$compressed_file" "postgresql/${db_name}_${TIMESTAMP}.sql.gz"
                fi
            else
                log_error "PostgreSQL backup failed or empty: $db_name"
                return 1
            fi
        else
            log_error "PostgreSQL backup failed: $db_name"
            return 1
        fi
    }
    
    export -f backup_pg_database log_info log_success log_error upload_to_s3
    export pg_backup_dir TIMESTAMP POSTGRES_USER POSTGRES_PASSWORD POSTGRES_HOST POSTGRES_PORT
    export COMPRESSION_LEVEL LOG_FILE S3_BUCKET
    
    # Run backups in parallel
    printf '%s\n' "${databases[@]}" | xargs -n 1 -P "$PARALLEL_JOBS" -I {} bash -c 'backup_pg_database "$@"' _ {}
    
    log_success "PostgreSQL backup process completed"
}

# Backup MongoDB
backup_mongodb() {
    log_info "Starting MongoDB backup..."
    
    local mongo_backup_dir="$BACKUP_DIR/mongodb/$TIMESTAMP"
    mkdir -p "$mongo_backup_dir"
    
    # Create MongoDB backup
    if mongodump --host "$MONGO_HOST:$MONGO_PORT" \
        --username "$MONGO_USER" --password "$MONGO_PASSWORD" \
        --authenticationDatabase admin \
        --out "$mongo_backup_dir" 2>>"$LOG_FILE"; then
        
        # Compress the backup
        local archive_file="$mongo_backup_dir/../mongodb_${TIMESTAMP}.tar.gz"
        tar -czf "$archive_file" -C "$mongo_backup_dir" . 2>>"$LOG_FILE"
        
        # Remove uncompressed files
        rm -rf "$mongo_backup_dir"
        
        if [ -f "$archive_file" ] && [ -s "$archive_file" ]; then
            local file_size=$(du -h "$archive_file" | cut -f1)
            log_success "MongoDB backup completed ($file_size)"
            
            # Upload to S3 if configured
            if [ -n "$S3_BUCKET" ]; then
                upload_to_s3 "$archive_file" "mongodb/mongodb_${TIMESTAMP}.tar.gz"
            fi
        else
            log_error "MongoDB backup failed or empty"
            return 1
        fi
    else
        log_error "MongoDB backup failed"
        return 1
    fi
}

# Backup Redis
backup_redis() {
    log_info "Starting Redis backup..."
    
    local redis_backup_dir="$BACKUP_DIR/redis/$TIMESTAMP"
    mkdir -p "$redis_backup_dir"
    
    # Create Redis backup
    local backup_file="$redis_backup_dir/redis_${TIMESTAMP}.rdb"
    
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" --rdb "$backup_file" 2>>"$LOG_FILE"; then
        
        # Compress the backup
        gzip -$COMPRESSION_LEVEL "$backup_file"
        local compressed_file="${backup_file}.gz"
        
        if [ -f "$compressed_file" ] && [ -s "$compressed_file" ]; then
            local file_size=$(du -h "$compressed_file" | cut -f1)
            log_success "Redis backup completed ($file_size)"
            
            # Upload to S3 if configured
            if [ -n "$S3_BUCKET" ]; then
                upload_to_s3 "$compressed_file" "redis/redis_${TIMESTAMP}.rdb.gz"
            fi
        else
            log_error "Redis backup failed or empty"
            return 1
        fi
    else
        log_error "Redis backup failed"
        return 1
    fi
}

# Upload to S3
upload_to_s3() {
    local file_path=$1
    local s3_key=$2
    
    if command -v aws &> /dev/null; then
        log_info "Uploading to S3: $s3_key"
        
        if aws s3 cp "$file_path" "s3://$S3_BUCKET/$s3_key" --storage-class STANDARD_IA 2>>"$LOG_FILE"; then
            log_success "S3 upload completed: $s3_key"
        else
            log_warning "S3 upload failed: $s3_key"
        fi
    else
        log_warning "AWS CLI not found - skipping S3 upload"
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    # Local cleanup
    find "$BACKUP_DIR" -type f -name "*.gz" -mtime +$RETENTION_DAYS -delete 2>>"$LOG_FILE"
    find "$BACKUP_DIR" -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete 2>>"$LOG_FILE"
    
    # S3 cleanup (if configured)
    if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        aws s3 ls "s3://$S3_BUCKET/" --recursive | \
        awk -v date="$(date -d "$RETENTION_DAYS days ago" '+%Y-%m-%d')" '$1 < date {print $4}' | \
        while read -r file; do
            aws s3 rm "s3://$S3_BUCKET/$file" 2>>"$LOG_FILE"
        done
    fi
    
    log_success "Cleanup completed"
}

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    # Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local color="good"
        local emoji="✅"
        
        if [ "$status" = "error" ]; then
            color="danger"
            emoji="❌"
        elif [ "$status" = "warning" ]; then
            color="warning"
            emoji="⚠️"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"$emoji AI Finance Agency - Backup $status\",
                    \"text\": \"$message\",
                    \"footer\": \"Backup System\",
                    \"ts\": $(date +%s)
                }]
            }" \
            "$SLACK_WEBHOOK_URL" 2>>"$LOG_FILE"
    fi
    
    # Email notification (if configured)
    if [ -n "$NOTIFICATION_EMAIL" ] && command -v mail &> /dev/null; then
        echo "$message" | mail -s "AI Finance Agency - Backup $status" "$NOTIFICATION_EMAIL"
    fi
}

# Generate backup report
generate_report() {
    local start_time=$1
    local end_time=$(date '+%Y-%m-%d %H:%M:%S')
    local duration=$(($(date -d "$end_time" +%s) - $(date -d "$start_time" +%s)))
    
    local report_file="$BACKUP_DIR/logs/backup_report_${TIMESTAMP}.txt"
    
    cat > "$report_file" << EOF
AI Finance Agency - Backup Report
=================================

Backup Date: $TIMESTAMP
Start Time: $start_time
End Time: $end_time
Duration: ${duration} seconds

Backup Locations:
- Local: $BACKUP_DIR
- S3 Bucket: ${S3_BUCKET:-"Not configured"}

Files Created:
$(find "$BACKUP_DIR" -name "*$TIMESTAMP*" -type f -exec ls -lh {} \; 2>/dev/null || echo "No files found")

Disk Usage:
$(du -sh "$BACKUP_DIR" 2>/dev/null || echo "Unable to calculate")

Log File: $LOG_FILE
EOF
    
    log_info "Backup report generated: $report_file"
    
    # Send report via notification
    send_notification "success" "Backup completed successfully in ${duration} seconds. Report: $report_file"
}

# Main backup process
main() {
    local start_time=$(date '+%Y-%m-%d %H:%M:%S')
    
    log_info "Starting AI Finance Agency backup process..."
    log_info "Timestamp: $TIMESTAMP"
    
    # Setup
    setup_directories
    check_disk_space
    test_connections
    
    # Perform backups
    backup_postgresql || log_error "PostgreSQL backup failed"
    
    # Only backup MongoDB and Redis if connections are available
    if mongosh --host "$MONGO_HOST:$MONGO_PORT" --username "$MONGO_USER" --password "$MONGO_PASSWORD" --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
        backup_mongodb || log_error "MongoDB backup failed"
    fi
    
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping >/dev/null 2>&1; then
        backup_redis || log_error "Redis backup failed"
    fi
    
    # Cleanup and reporting
    cleanup_old_backups
    generate_report "$start_time"
    
    log_success "Backup process completed successfully!"
}

# Error handling
trap 'log_error "Backup process failed with exit code $?"; send_notification "error" "Backup process failed. Check logs: $LOG_FILE"; exit 1' ERR

# Check dependencies
check_dependencies() {
    local missing_deps=()
    
    if ! command -v pg_dump &> /dev/null; then
        missing_deps+=("postgresql-client")
    fi
    
    if ! command -v mongodump &> /dev/null; then
        missing_deps+=("mongodb-tools")
    fi
    
    if ! command -v redis-cli &> /dev/null; then
        missing_deps+=("redis-tools")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Install with: sudo apt-get install ${missing_deps[*]}"
        exit 1
    fi
}

# Command line options
case "${1:-}" in
    --test)
        log_info "Running backup test..."
        check_dependencies
        test_connections
        log_success "Backup test completed"
        ;;
    --restore)
        log_info "Restore functionality not implemented yet"
        exit 1
        ;;
    --help)
        echo "Usage: $0 [--test|--restore|--help]"
        echo "  --test     Test database connections and dependencies"
        echo "  --restore  Restore from backup (not implemented)"
        echo "  --help     Show this help message"
        ;;
    *)
        check_dependencies
        main "$@"
        ;;
esac