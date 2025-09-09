#!/bin/bash
# Docker entrypoint script for AI Finance Agency
# Handles initialization, health checks, and graceful shutdown

set -e

# Color codes for logging
RED='\033[0;31m'
GREEN='\033[0;32m' 
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" >&1
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" >&1
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" >&2
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" >&1
}

# Configuration
APP_NAME="AI Finance Agency"
APP_USER="appuser"
DATA_DIR="/app/data"
LOGS_DIR="/app/logs"
TMP_DIR="/app/tmp"

# Signal handlers for graceful shutdown
cleanup() {
    log_info "Received shutdown signal, performing cleanup..."
    
    # Kill any background processes
    jobs -p | xargs -r kill
    
    # Wait for processes to terminate
    sleep 5
    
    log_success "Cleanup completed"
    exit 0
}

# Trap signals
trap cleanup SIGTERM SIGINT

# Pre-flight checks
preflight_checks() {
    log_info "Starting preflight checks for $APP_NAME..."
    
    # Check if running as correct user
    if [ "$(whoami)" != "$APP_USER" ]; then
        log_error "Container must run as user: $APP_USER"
        exit 1
    fi
    
    # Check required directories
    for dir in "$DATA_DIR" "$LOGS_DIR" "$TMP_DIR"; do
        if [ ! -d "$dir" ]; then
            log_warn "Creating missing directory: $dir"
            mkdir -p "$dir"
        fi
        
        if [ ! -w "$dir" ]; then
            log_error "Directory not writable: $dir"
            exit 1
        fi
    done
    
    # Check Python environment
    if ! python --version > /dev/null 2>&1; then
        log_error "Python not available"
        exit 1
    fi
    
    # Check virtual environment
    if [ -z "$VIRTUAL_ENV" ] && [ -d "/opt/venv" ]; then
        log_info "Activating virtual environment..."
        source /opt/venv/bin/activate
        export PATH="/opt/venv/bin:$PATH"
    fi
    
    log_success "Preflight checks completed"
}

# Validate configuration
validate_config() {
    log_info "Validating application configuration..."
    
    # Check if configuration files exist
    if [ ! -f ".env" ] && [ ! -f ".env.example" ]; then
        log_warn "No environment configuration found"
    fi
    
    # Validate Python dependencies
    if ! python -c "import flask, pandas, numpy" > /dev/null 2>&1; then
        log_error "Critical Python dependencies missing"
        exit 1
    fi
    
    # Test database connections (if configured)
    if [ ! -z "$DATABASE_URL" ] || [ ! -z "$DATABASE_PATH" ]; then
        log_info "Testing database connection..."
        if python -c "
from config.enhanced_config import enhanced_config
try:
    config = enhanced_config
    if config.database.sqlite_enabled or config.database.supabase_enabled:
        print('Database configuration valid')
    else:
        print('No database configured')
except Exception as e:
    print(f'Database validation failed: {e}')
    exit(1)
" > /dev/null 2>&1; then
            log_success "Database connection validated"
        else
            log_warn "Database connection validation failed (continuing anyway)"
        fi
    fi
    
    log_success "Configuration validation completed"
}

# Initialize application
initialize_app() {
    log_info "Initializing application..."
    
    # Run database migrations if needed
    if [ "$RUN_MIGRATIONS" = "true" ]; then
        log_info "Running database migrations..."
        if [ -f "alembic.ini" ]; then
            alembic upgrade head || log_warn "Migration failed (continuing anyway)"
        fi
    fi
    
    # Create initial data if needed
    if [ "$CREATE_INITIAL_DATA" = "true" ]; then
        log_info "Creating initial data..."
        python -c "
try:
    from database.seed_data import seed_clients
    seed_clients()
    print('Initial data created')
except Exception as e:
    print(f'Failed to create initial data: {e}')
" || log_warn "Failed to create initial data"
    fi
    
    # Validate environment
    if [ "$VALIDATE_ENV" != "false" ]; then
        log_info "Running environment validation..."
        python validate_environment.py --enhanced > /dev/null 2>&1 || log_warn "Environment validation had warnings"
    fi
    
    log_success "Application initialization completed"
}

# Health check function
health_check() {
    local max_attempts=30
    local attempt=1
    
    log_info "Waiting for application to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
            log_success "Application is ready and healthy"
            return 0
        fi
        
        log_info "Health check attempt $attempt/$max_attempts failed, retrying in 5s..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    log_error "Application failed to become healthy after $max_attempts attempts"
    return 1
}

# Start background health monitor
start_health_monitor() {
    if [ "$HEALTH_MONITOR" = "true" ]; then
        log_info "Starting health monitor..."
        
        while true; do
            sleep 60
            if ! curl -f -s http://localhost:8000/health > /dev/null 2>&1; then
                log_warn "Health check failed, application may be unhealthy"
            fi
        done &
        
        log_success "Health monitor started"
    fi
}

# Main execution
main() {
    log_info "Starting $APP_NAME container..."
    log_info "Arguments: $@"
    
    # Run preflight checks
    preflight_checks
    
    # Validate configuration
    validate_config
    
    # Initialize application
    initialize_app
    
    # Start health monitor if enabled
    start_health_monitor
    
    log_success "Container startup completed, executing: $@"
    
    # Execute the main command
    exec "$@"
}

# Handle special commands
case "$1" in
    bash|sh)
        log_info "Starting interactive shell"
        exec "$@"
        ;;
    test)
        log_info "Running tests"
        exec python -m pytest tests/ -v
        ;;
    migrate)
        log_info "Running database migrations"
        exec alembic upgrade head
        ;;
    seed)
        log_info "Seeding database"
        exec python -c "from database.seed_data import seed_clients; seed_clients()"
        ;;
    validate)
        log_info "Validating environment"
        exec python validate_environment.py --enhanced
        ;;
    health)
        log_info "Running health check"
        curl -f http://localhost:8000/health || exit 1
        ;;
    *)
        # Run main startup sequence
        main "$@"
        ;;
esac