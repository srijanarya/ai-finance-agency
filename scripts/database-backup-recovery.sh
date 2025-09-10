#!/bin/bash

# TREUM AI Finance Agency - Database Backup and Recovery System
# Automated backup and recovery for separated database instances

set -e

# Configuration
BACKUP_BASE_DIR="/var/backups/treum"
LOG_DIR="/var/log/treum/backup"
RETENTION_DAYS=30
RETENTION_WEEKS=12
RETENTION_MONTHS=12

# Database configurations
declare -A DATABASES=(
    ["users"]="treum_users:treum_user_service:user_secure_pass_2024:5432:pgbouncer-users"
    ["trading"]="treum_trading:treum_trading_service:trading_secure_pass_2024:5433:pgbouncer-trading"
    ["market-data"]="treum_market_data:treum_market_data_service:market_data_secure_pass_2024:5434:pgbouncer-market-data"
    ["signals"]="treum_signals:treum_signals_service:signals_secure_pass_2024:5435:postgres-signals"
    ["payments"]="treum_payments:treum_payments_service:payments_secure_pass_2024:5436:postgres-payments"
    ["notifications"]="treum_notifications:treum_notifications_service:notifications_secure_pass_2024:5437:postgres-notifications"
    ["risk"]="treum_risk:treum_risk_service:risk_secure_pass_2024:5438:postgres-risk"
    ["education"]="treum_education:treum_education_service:education_secure_pass_2024:5439:postgres-education"
    ["content"]="treum_content_intelligence:treum_content_service:content_secure_pass_2024:5440:postgres-content"
)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_DIR/backup.log"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_DIR/backup.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_DIR/backup.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_DIR/backup.log"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_DIR/backup.log"
}

# Initialize backup environment
init_backup_env() {
    log_info "Initializing backup environment..."
    
    # Create directories
    mkdir -p "$BACKUP_BASE_DIR"/{daily,weekly,monthly}
    mkdir -p "$LOG_DIR"
    
    # Create backup subdirectories for each service
    for service in "${!DATABASES[@]}"; do
        mkdir -p "$BACKUP_BASE_DIR"/{daily,weekly,monthly}/"$service"
    done
    
    log_success "Backup environment initialized"
}

# Check database connectivity
check_database_connectivity() {
    local service=$1
    local db_config=${DATABASES[$service]}
    
    IFS=':' read -r db_name user password port host <<< "$db_config"
    
    local connection_string="postgresql://$user:$password@localhost:$port/$db_name"
    
    if ! psql "$connection_string" -c "SELECT 1;" >/dev/null 2>&1; then
        log_error "Cannot connect to $service database"
        return 1
    fi
    
    return 0
}

# Perform database backup
backup_database() {
    local service=$1
    local backup_type=$2  # daily, weekly, monthly
    local db_config=${DATABASES[$service]}
    
    IFS=':' read -r db_name user password port host <<< "$db_config"
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="$BACKUP_BASE_DIR/$backup_type/$service"
    local backup_file="$backup_dir/${service}_${backup_type}_${timestamp}.sql"
    local compressed_file="$backup_file.gz"
    local metadata_file="$backup_dir/${service}_${backup_type}_${timestamp}.meta"
    
    log_info "Starting $backup_type backup for $service database..."
    
    # Check connectivity
    if ! check_database_connectivity "$service"; then
        return 1
    fi
    
    local connection_string="postgresql://$user:$password@localhost:$port/$db_name"
    
    # Get database statistics before backup
    local db_size=$(psql "$connection_string" -t -c "SELECT pg_size_pretty(pg_database_size('$db_name'));" | xargs)
    local table_count=$(psql "$connection_string" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
    
    # Create metadata file
    cat > "$metadata_file" << EOF
{
    "service": "$service",
    "database": "$db_name",
    "backup_type": "$backup_type",
    "timestamp": "$timestamp",
    "database_size": "$db_size",
    "table_count": $table_count,
    "backup_start": "$(date -Iseconds)",
    "pg_version": "$(psql "$connection_string" -t -c "SELECT version();" | head -1 | xargs)"
}
EOF
    
    # Perform backup with compression
    if pg_dump "$connection_string" \
        --verbose \
        --clean \
        --no-owner \
        --no-acl \
        --format=custom \
        --compress=9 \
        --file="$backup_file" 2>&1 | tee -a "$LOG_DIR/backup.log"; then
        
        # Additional gzip compression
        gzip "$backup_file"
        
        # Update metadata with completion info
        local backup_size=$(stat -f%z "$compressed_file" 2>/dev/null || stat -c%s "$compressed_file" 2>/dev/null || echo "unknown")
        
        # Update metadata file
        jq --arg end_time "$(date -Iseconds)" \
           --arg backup_size "$backup_size" \
           --arg status "success" \
           '. + {backup_end: $end_time, backup_file_size: $backup_size, status: $status}' \
           "$metadata_file" > "$metadata_file.tmp" && mv "$metadata_file.tmp" "$metadata_file"
        
        log_success "$service $backup_type backup completed: $compressed_file ($db_size -> $(numfmt --to=iec $backup_size) compressed)"
        return 0
    else
        # Update metadata with failure info
        jq --arg end_time "$(date -Iseconds)" \
           --arg status "failed" \
           '. + {backup_end: $end_time, status: $status}' \
           "$metadata_file" > "$metadata_file.tmp" && mv "$metadata_file.tmp" "$metadata_file"
        
        log_error "$service $backup_type backup failed"
        return 1
    fi
}

# Backup all databases
backup_all_databases() {
    local backup_type=${1:-daily}
    
    log_info "Starting $backup_type backup for all databases..."
    
    local success_count=0
    local failed_count=0
    local failed_services=()
    
    for service in "${!DATABASES[@]}"; do
        if backup_database "$service" "$backup_type"; then
            ((success_count++))
        else
            ((failed_count++))
            failed_services+=("$service")
        fi
    done
    
    log_info "Backup summary: $success_count successful, $failed_count failed"
    
    if [ $failed_count -gt 0 ]; then
        log_warning "Failed backups for services: ${failed_services[*]}"
        return 1
    fi
    
    log_success "All $backup_type backups completed successfully"
    return 0
}

# Restore database from backup
restore_database() {
    local service=$1
    local backup_file=$2
    local restore_options=${3:-""}
    
    local db_config=${DATABASES[$service]}
    IFS=':' read -r db_name user password port host <<< "$db_config"
    
    log_info "Starting restore for $service database from $backup_file..."
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    local connection_string="postgresql://$user:$password@localhost:$port/$db_name"
    
    # Check if backup file is compressed
    local restore_file="$backup_file"
    if [[ "$backup_file" == *.gz ]]; then
        restore_file="/tmp/$(basename "$backup_file" .gz)"
        log_info "Decompressing backup file..."
        gunzip -c "$backup_file" > "$restore_file"
    fi
    
    # Create database restore point
    local restore_timestamp=$(date +%Y%m%d_%H%M%S)
    local pre_restore_backup="$BACKUP_BASE_DIR/pre_restore_${service}_${restore_timestamp}.sql.gz"
    
    log_info "Creating pre-restore backup..."
    pg_dump "$connection_string" --format=custom --compress=9 | gzip > "$pre_restore_backup"
    
    # Perform restore
    if pg_restore "$connection_string" \
        --verbose \
        --clean \
        --no-owner \
        --no-acl \
        $restore_options \
        "$restore_file" 2>&1 | tee -a "$LOG_DIR/restore.log"; then
        
        log_success "$service database restored successfully from $backup_file"
        
        # Cleanup temporary files
        if [[ "$backup_file" == *.gz ]]; then
            rm -f "$restore_file"
        fi
        
        return 0
    else
        log_error "$service database restore failed"
        
        # Attempt to restore from pre-restore backup
        log_warning "Attempting to restore from pre-restore backup..."
        pg_restore "$connection_string" --clean --no-owner --no-acl "$pre_restore_backup"
        
        return 1
    fi
}

# List available backups
list_backups() {
    local service=${1:-"all"}
    local backup_type=${2:-"all"}
    
    log_info "Available backups:"
    
    for backup_dir in "$BACKUP_BASE_DIR"/{daily,weekly,monthly}; do
        local dir_type=$(basename "$backup_dir")
        
        if [ "$backup_type" != "all" ] && [ "$backup_type" != "$dir_type" ]; then
            continue
        fi
        
        echo -e "\n${BLUE}$dir_type backups:${NC}"
        
        if [ "$service" == "all" ]; then
            find "$backup_dir" -name "*.sql.gz" -type f | sort -r | while read -r backup_file; do
                local service_name=$(basename "$(dirname "$backup_file")")
                local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
                local file_date=$(date -r "$backup_file" +"%Y-%m-%d %H:%M:%S")
                
                echo "  $service_name: $(basename "$backup_file") ($(numfmt --to=iec "$file_size"), $file_date)"
            done
        else
            find "$backup_dir/$service" -name "*.sql.gz" -type f 2>/dev/null | sort -r | while read -r backup_file; do
                local file_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
                local file_date=$(date -r "$backup_file" +"%Y-%m-%d %H:%M:%S")
                
                echo "  $(basename "$backup_file") ($(numfmt --to=iec "$file_size"), $file_date)"
            done
        fi
    done
}

# Cleanup old backups based on retention policy
cleanup_old_backups() {
    log_info "Starting backup cleanup based on retention policy..."
    
    local cleaned_count=0
    
    # Daily backups - keep for $RETENTION_DAYS days
    find "$BACKUP_BASE_DIR/daily" -name "*.sql.gz" -type f -mtime +$RETENTION_DAYS | while read -r old_backup; do
        log_info "Removing old daily backup: $(basename "$old_backup")"
        rm -f "$old_backup"
        rm -f "${old_backup%.*}.meta"  # Remove metadata file too
        ((cleaned_count++))
    done
    
    # Weekly backups - keep for $RETENTION_WEEKS weeks
    find "$BACKUP_BASE_DIR/weekly" -name "*.sql.gz" -type f -mtime +$((RETENTION_WEEKS * 7)) | while read -r old_backup; do
        log_info "Removing old weekly backup: $(basename "$old_backup")"
        rm -f "$old_backup"
        rm -f "${old_backup%.*}.meta"
        ((cleaned_count++))
    done
    
    # Monthly backups - keep for $RETENTION_MONTHS months
    find "$BACKUP_BASE_DIR/monthly" -name "*.sql.gz" -type f -mtime +$((RETENTION_MONTHS * 30)) | while read -r old_backup; do
        log_info "Removing old monthly backup: $(basename "$old_backup")"
        rm -f "$old_backup"
        rm -f "${old_backup%.*}.meta"
        ((cleaned_count++))
    done
    
    log_success "Cleanup completed. Removed $cleaned_count old backup files"
}

# Verify backup integrity
verify_backup_integrity() {
    local backup_file=$1
    
    log_info "Verifying backup integrity: $(basename "$backup_file")"
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    # For compressed files, test the compression
    if [[ "$backup_file" == *.gz ]]; then
        if ! gzip -t "$backup_file" 2>/dev/null; then
            log_error "Backup file is corrupted (compression test failed): $backup_file"
            return 1
        fi
    fi
    
    # For PostgreSQL custom format, use pg_restore to validate
    if pg_restore -l "$backup_file" >/dev/null 2>&1; then
        log_success "Backup integrity verified: $(basename "$backup_file")"
        return 0
    else
        log_error "Backup integrity check failed: $backup_file"
        return 1
    fi
}

# Generate backup report
generate_backup_report() {
    local report_file="$BACKUP_BASE_DIR/backup_report_$(date +%Y%m%d).html"
    
    log_info "Generating backup report: $report_file"
    
    cat > "$report_file" << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>TREUM Database Backup Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
        .summary { background-color: #ecf0f1; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .service { border: 1px solid #bdc3c7; margin: 10px 0; padding: 10px; border-radius: 3px; }
        .success { border-left: 5px solid #27ae60; }
        .warning { border-left: 5px solid #f39c12; }
        .error { border-left: 5px solid #e74c3c; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #34495e; color: white; }
    </style>
</head>
<body>
    <div class="header">
        <h1>TREUM AI Finance Agency</h1>
        <h2>Database Backup Report</h2>
        <p>Generated on $(date)</p>
    </div>
EOF
    
    # Add backup statistics
    echo "<div class='summary'>" >> "$report_file"
    echo "<h3>Backup Summary</h3>" >> "$report_file"
    
    for backup_type in daily weekly monthly; do
        local backup_count=$(find "$BACKUP_BASE_DIR/$backup_type" -name "*.sql.gz" -type f | wc -l)
        local total_size=$(find "$BACKUP_BASE_DIR/$backup_type" -name "*.sql.gz" -type f -exec stat -f%z {} + 2>/dev/null | awk '{sum += $1} END {print sum}' || echo "0")
        
        echo "<p><strong>$backup_type backups:</strong> $backup_count files, $(numfmt --to=iec $total_size)</p>" >> "$report_file"
    done
    
    echo "</div>" >> "$report_file"
    
    # Add service details
    for service in "${!DATABASES[@]}"; do
        echo "<div class='service success'>" >> "$report_file"
        echo "<h4>$service Service</h4>" >> "$report_file"
        
        echo "<table>" >> "$report_file"
        echo "<tr><th>Backup Type</th><th>Latest Backup</th><th>Size</th><th>Status</th></tr>" >> "$report_file"
        
        for backup_type in daily weekly monthly; do
            local latest_backup=$(find "$BACKUP_BASE_DIR/$backup_type/$service" -name "*.sql.gz" -type f 2>/dev/null | sort -r | head -1)
            
            if [ -n "$latest_backup" ]; then
                local backup_size=$(stat -f%z "$latest_backup" 2>/dev/null || stat -c%s "$latest_backup" 2>/dev/null)
                local backup_date=$(date -r "$latest_backup" +"%Y-%m-%d %H:%M:%S")
                echo "<tr><td>$backup_type</td><td>$backup_date</td><td>$(numfmt --to=iec $backup_size)</td><td>✅ Available</td></tr>" >> "$report_file"
            else
                echo "<tr><td>$backup_type</td><td>-</td><td>-</td><td>❌ No backup</td></tr>" >> "$report_file"
            fi
        done
        
        echo "</table>" >> "$report_file"
        echo "</div>" >> "$report_file"
    done
    
    echo "</body></html>" >> "$report_file"
    
    log_success "Backup report generated: $report_file"
}

# Main function
main() {
    local command=${1:-backup}
    
    case "$command" in
        "backup")
            local backup_type=${2:-daily}
            init_backup_env
            backup_all_databases "$backup_type"
            cleanup_old_backups
            generate_backup_report
            ;;
        "restore")
            local service=$2
            local backup_file=$3
            
            if [ -z "$service" ] || [ -z "$backup_file" ]; then
                log_error "Usage: $0 restore <service> <backup_file>"
                exit 1
            fi
            
            restore_database "$service" "$backup_file"
            ;;
        "list")
            list_backups "$2" "$3"
            ;;
        "cleanup")
            init_backup_env
            cleanup_old_backups
            ;;
        "verify")
            local backup_file=$2
            if [ -z "$backup_file" ]; then
                log_error "Usage: $0 verify <backup_file>"
                exit 1
            fi
            verify_backup_integrity "$backup_file"
            ;;
        "report")
            generate_backup_report
            ;;
        *)
            echo "Usage: $0 {backup|restore|list|cleanup|verify|report} [options]"
            echo ""
            echo "Commands:"
            echo "  backup [daily|weekly|monthly]  - Create backups (default: daily)"
            echo "  restore <service> <backup_file> - Restore service from backup"
            echo "  list [service] [type]           - List available backups"
            echo "  cleanup                         - Remove old backups per retention policy"
            echo "  verify <backup_file>            - Verify backup file integrity"
            echo "  report                          - Generate HTML backup report"
            echo ""
            echo "Examples:"
            echo "  $0 backup daily"
            echo "  $0 restore users /var/backups/treum/daily/users/users_daily_20241201_120000.sql.gz"
            echo "  $0 list trading daily"
            echo "  $0 verify /var/backups/treum/daily/payments/payments_daily_20241201_120000.sql.gz"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"