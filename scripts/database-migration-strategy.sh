#!/bin/bash

# TREUM AI Finance Agency - Database Migration Strategy
# Migrates from single PostgreSQL instance to separated service databases

set -e  # Exit on any error

# Configuration
SOURCE_DATABASE="postgresql://treum_user:${POSTGRES_PASSWORD:-securepassword123}@localhost:5432/treum_finance"
BACKUP_DIR="/var/backups/treum/migration-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="/var/log/treum/database-migration.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
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

# Pre-migration checks
pre_migration_checks() {
    log_info "Starting pre-migration checks..."
    
    # Check if source database is accessible
    if ! psql "$SOURCE_DATABASE" -c "SELECT 1;" >/dev/null 2>&1; then
        log_error "Cannot connect to source database"
        exit 1
    fi
    
    # Check available disk space
    available_space=$(df /var | awk 'NR==2 {print $4}')
    if [ "$available_space" -lt 10485760 ]; then  # Less than 10GB
        log_error "Insufficient disk space. Need at least 10GB available."
        exit 1
    fi
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"
    
    log_success "Pre-migration checks completed"
}

# Backup current database
backup_database() {
    log_info "Creating full database backup..."
    
    # Create full backup
    pg_dump "$SOURCE_DATABASE" --verbose --clean --no-owner --no-acl \
        --file="$BACKUP_DIR/full_backup.sql" 2>&1 | tee -a "$LOG_FILE"
    
    # Create schema-only backup
    pg_dump "$SOURCE_DATABASE" --schema-only --verbose --clean --no-owner --no-acl \
        --file="$BACKUP_DIR/schema_backup.sql" 2>&1 | tee -a "$LOG_FILE"
    
    # Create data-only backup
    pg_dump "$SOURCE_DATABASE" --data-only --verbose --no-owner --no-acl \
        --file="$BACKUP_DIR/data_backup.sql" 2>&1 | tee -a "$LOG_FILE"
    
    # Verify backup integrity
    if [ ! -s "$BACKUP_DIR/full_backup.sql" ]; then
        log_error "Backup file is empty or corrupted"
        exit 1
    fi
    
    log_success "Database backup completed: $BACKUP_DIR"
}

# Extract service-specific data
extract_service_data() {
    log_info "Extracting service-specific data..."
    
    # Users service tables
    pg_dump "$SOURCE_DATABASE" --verbose --clean --no-owner --no-acl \
        --table=users --table=user_sessions --table=audit_logs \
        --table=roles --table=permissions --table=user_roles --table=role_permissions \
        --file="$BACKUP_DIR/users_service.sql" 2>&1 | tee -a "$LOG_FILE"
    
    # Trading service tables
    pg_dump "$SOURCE_DATABASE" --verbose --clean --no-owner --no-acl \
        --table=orders --table=positions --table=trades --table=portfolio \
        --table=market_data --table=institutional_orders --table=institutional_strategies \
        --file="$BACKUP_DIR/trading_service.sql" 2>&1 | tee -a "$LOG_FILE"
    
    # Market Data service tables
    pg_dump "$SOURCE_DATABASE" --verbose --clean --no-owner --no-acl \
        --table=market_data --table=historical_data --table=market_alerts \
        --table=market_sessions --table=watchlists \
        --file="$BACKUP_DIR/market_data_service.sql" 2>&1 | tee -a "$LOG_FILE"
    
    # Signals service tables
    pg_dump "$SOURCE_DATABASE" --verbose --clean --no-owner --no-acl \
        --table=signals --table=backtest_results \
        --file="$BACKUP_DIR/signals_service.sql" 2>&1 | tee -a "$LOG_FILE"
    
    # Payments service tables
    pg_dump "$SOURCE_DATABASE" --verbose --clean --no-owner --no-acl \
        --table=payments --table=invoices --table=subscriptions --table=plans \
        --table=payment_methods --table=transactions --table=wallets \
        --file="$BACKUP_DIR/payments_service.sql" 2>&1 | tee -a "$LOG_FILE"
    
    # Notifications service tables
    pg_dump "$SOURCE_DATABASE" --verbose --clean --no-owner --no-acl \
        --table=notifications --table=notification_history --table=notification_preferences \
        --table=notification_templates --table=push_subscriptions \
        --file="$BACKUP_DIR/notifications_service.sql" 2>&1 | tee -a "$LOG_FILE"
    
    # Risk Management service tables
    pg_dump "$SOURCE_DATABASE" --verbose --clean --no-owner --no-acl \
        --table=risk_assessments --table=risk_limits --table=risk_alerts \
        --table=risk_metrics --table=compliance_checks \
        --file="$BACKUP_DIR/risk_service.sql" 2>&1 | tee -a "$LOG_FILE"
    
    # Education service tables
    pg_dump "$SOURCE_DATABASE" --verbose --clean --no-owner --no-acl \
        --table=courses --table=lessons --table=user_progress \
        --table=assessments --table=assessment_attempts --table=certificates \
        --table=categories \
        --file="$BACKUP_DIR/education_service.sql" 2>&1 | tee -a "$LOG_FILE"
    
    log_success "Service data extraction completed"
}

# Initialize separated databases
initialize_separated_databases() {
    log_info "Initializing separated databases..."
    
    # Wait for database containers to be healthy
    local max_wait=300
    local wait_time=0
    
    while [ $wait_time -lt $max_wait ]; do
        if docker-compose -f docker-compose.separated-databases.yml ps | grep -q "healthy"; then
            break
        fi
        log_info "Waiting for database containers to be healthy... ($wait_time/$max_wait)"
        sleep 10
        wait_time=$((wait_time + 10))
    done
    
    if [ $wait_time -ge $max_wait ]; then
        log_error "Database containers failed to become healthy within $max_wait seconds"
        exit 1
    fi
    
    log_success "Separated databases are healthy and ready"
}

# Migrate data to separated databases
migrate_service_data() {
    local service=$1
    local port=$2
    local db_name=$3
    local user=$4
    local password=$5
    local backup_file="$BACKUP_DIR/${service}_service.sql"
    
    log_info "Migrating $service service data..."
    
    if [ ! -f "$backup_file" ]; then
        log_warning "No backup file found for $service service: $backup_file"
        return 0
    fi
    
    # Clean and prepare the SQL file for the target database
    local clean_backup_file="$BACKUP_DIR/${service}_service_clean.sql"
    
    # Remove schema creation statements and adjust for new database
    sed -e 's/CREATE SCHEMA IF NOT EXISTS public;//g' \
        -e 's/SET search_path = public;//g' \
        -e '/^--/d' \
        -e '/^$/d' \
        "$backup_file" > "$clean_backup_file"
    
    # Import data into separated database
    local target_db="postgresql://$user:$password@localhost:$port/$db_name"
    
    if psql "$target_db" -f "$clean_backup_file" 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Successfully migrated $service service data"
    else
        log_error "Failed to migrate $service service data"
        return 1
    fi
}

# Migrate all services
migrate_all_services() {
    log_info "Starting migration of all service data..."
    
    # Users service
    migrate_service_data "users" "6432" "treum_users" "treum_user_service" "user_secure_pass_2024"
    
    # Trading service
    migrate_service_data "trading" "6433" "treum_trading" "treum_trading_service" "trading_secure_pass_2024"
    
    # Market Data service
    migrate_service_data "market_data" "6434" "treum_market_data" "treum_market_data_service" "market_data_secure_pass_2024"
    
    # Signals service
    migrate_service_data "signals" "5435" "treum_signals" "treum_signals_service" "signals_secure_pass_2024"
    
    # Payments service
    migrate_service_data "payments" "5436" "treum_payments" "treum_payments_service" "payments_secure_pass_2024"
    
    # Notifications service
    migrate_service_data "notifications" "5437" "treum_notifications" "treum_notifications_service" "notifications_secure_pass_2024"
    
    # Risk Management service
    migrate_service_data "risk" "5438" "treum_risk" "treum_risk_service" "risk_secure_pass_2024"
    
    # Education service
    migrate_service_data "education" "5439" "treum_education" "treum_education_service" "education_secure_pass_2024"
    
    log_success "All service data migration completed"
}

# Verify migration integrity
verify_migration() {
    log_info "Verifying migration integrity..."
    
    local services=(
        "users:6432:treum_users:treum_user_service:user_secure_pass_2024"
        "trading:6433:treum_trading:treum_trading_service:trading_secure_pass_2024"
        "market_data:6434:treum_market_data:treum_market_data_service:market_data_secure_pass_2024"
        "signals:5435:treum_signals:treum_signals_service:signals_secure_pass_2024"
        "payments:5436:treum_payments:treum_payments_service:payments_secure_pass_2024"
        "notifications:5437:treum_notifications:treum_notifications_service:notifications_secure_pass_2024"
        "risk:5438:treum_risk:treum_risk_service:risk_secure_pass_2024"
        "education:5439:treum_education:treum_education_service:education_secure_pass_2024"
    )
    
    local verification_results="$BACKUP_DIR/verification_results.txt"
    echo "Migration Verification Results - $(date)" > "$verification_results"
    echo "================================================" >> "$verification_results"
    
    for service_config in "${services[@]}"; do
        IFS=':' read -r service port db_name user password <<< "$service_config"
        
        local target_db="postgresql://$user:$password@localhost:$port/$db_name"
        
        log_info "Verifying $service database..."
        
        # Count tables
        local table_count=$(psql "$target_db" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs || echo "0")
        
        # Count total records (approximation)
        local record_count=$(psql "$target_db" -t -c "
            SELECT COALESCE(SUM(n_tup_ins + n_tup_upd), 0) 
            FROM pg_stat_user_tables;" 2>/dev/null | xargs || echo "0")
        
        echo "$service: $table_count tables, $record_count operations" >> "$verification_results"
        log_info "$service verification: $table_count tables, $record_count operations"
    done
    
    log_success "Migration verification completed. Results saved to: $verification_results"
}

# Update service configurations
update_service_configs() {
    log_info "Updating service configuration files..."
    
    # Backup original configurations
    local config_backup_dir="$BACKUP_DIR/config_backup"
    mkdir -p "$config_backup_dir"
    
    # Update database URLs in environment files
    if [ -f ".env" ]; then
        cp .env "$config_backup_dir/env.backup"
        
        # Update .env with new database connections
        cat >> .env << EOF

# Separated Database Configurations (Added by migration script)
POSTGRES_USERS_PASSWORD=user_secure_pass_2024
POSTGRES_TRADING_PASSWORD=trading_secure_pass_2024
POSTGRES_MARKET_DATA_PASSWORD=market_data_secure_pass_2024
POSTGRES_SIGNALS_PASSWORD=signals_secure_pass_2024
POSTGRES_PAYMENTS_PASSWORD=payments_secure_pass_2024
POSTGRES_NOTIFICATIONS_PASSWORD=notifications_secure_pass_2024
POSTGRES_RISK_PASSWORD=risk_secure_pass_2024
POSTGRES_EDUCATION_PASSWORD=education_secure_pass_2024
POSTGRES_CONTENT_PASSWORD=content_secure_pass_2024

# Connection Pool Settings
PGBOUNCER_POOL_MODE=transaction
PGBOUNCER_MAX_CLIENT_CONN=1000
PGBOUNCER_DEFAULT_POOL_SIZE=25
EOF
    fi
    
    log_success "Service configurations updated"
}

# Rollback function
rollback_migration() {
    log_warning "Starting migration rollback..."
    
    # Stop separated database containers
    docker-compose -f docker-compose.separated-databases.yml down
    
    # Restore original docker-compose
    if [ -f "docker-compose.microservices.yml.backup" ]; then
        mv docker-compose.microservices.yml.backup docker-compose.microservices.yml
    fi
    
    # Restore original .env
    if [ -f "$BACKUP_DIR/config_backup/env.backup" ]; then
        cp "$BACKUP_DIR/config_backup/env.backup" .env
    fi
    
    # Start original configuration
    docker-compose -f docker-compose.microservices.yml up -d postgres
    
    # Restore database from backup
    local max_wait=60
    local wait_time=0
    while [ $wait_time -lt $max_wait ]; do
        if docker-compose -f docker-compose.microservices.yml ps postgres | grep -q "healthy"; then
            break
        fi
        sleep 5
        wait_time=$((wait_time + 5))
    done
    
    # Drop and recreate database
    psql "$SOURCE_DATABASE" -c "DROP DATABASE IF EXISTS treum_finance;"
    psql "$SOURCE_DATABASE" -c "CREATE DATABASE treum_finance;"
    
    # Restore from backup
    psql "$SOURCE_DATABASE" -f "$BACKUP_DIR/full_backup.sql"
    
    log_success "Migration rollback completed"
}

# Main execution
main() {
    log_info "Starting TREUM database migration to separated instances..."
    
    # Trap to handle rollback on failure
    trap 'log_error "Migration failed. Starting rollback..."; rollback_migration; exit 1' ERR
    
    pre_migration_checks
    
    # Backup original docker-compose
    cp docker-compose.microservices.yml docker-compose.microservices.yml.backup
    
    backup_database
    extract_service_data
    
    # Start separated database containers
    docker-compose -f docker-compose.separated-databases.yml up -d \
        postgres-users postgres-trading postgres-market-data postgres-signals \
        postgres-payments postgres-notifications postgres-risk postgres-education \
        postgres-content pgbouncer-users pgbouncer-trading pgbouncer-market-data
    
    initialize_separated_databases
    migrate_all_services
    verify_migration
    update_service_configs
    
    log_success "Database migration completed successfully!"
    log_info "Backup location: $BACKUP_DIR"
    log_info "Log file: $LOG_FILE"
    
    echo
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    MIGRATION COMPLETED!                        ║${NC}"
    echo -e "${GREEN}╠════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║ Next Steps:                                                    ║${NC}"
    echo -e "${GREEN}║ 1. Update service configurations to use new database URLs     ║${NC}"
    echo -e "${GREEN}║ 2. Test all services with new database connections           ║${NC}"
    echo -e "${GREEN}║ 3. Update monitoring and backup scripts                      ║${NC}"
    echo -e "${GREEN}║ 4. Run performance tests to validate improvements            ║${NC}"
    echo -e "${GREEN}║                                                               ║${NC}"
    echo -e "${GREEN}║ To rollback: ./database-migration-strategy.sh --rollback     ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
}

# Handle command line arguments
case "${1:-}" in
    --rollback)
        rollback_migration
        ;;
    --help)
        echo "Usage: $0 [--rollback|--help]"
        echo "  --rollback  Rollback the migration and restore original database"
        echo "  --help      Show this help message"
        ;;
    *)
        main "$@"
        ;;
esac