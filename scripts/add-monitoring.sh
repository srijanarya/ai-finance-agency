#!/bin/bash

# AI Finance Agency - Add Monitoring Script
# Automatically adds Prometheus metrics to all microservices

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
SERVICES=("api-gateway" "user-management" "payment" "signals" "trading" "education" "notification" "risk-management" "market-data" "content-intelligence")
MONITORING_DIR="$PROJECT_ROOT/monitoring"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running in project root
check_project_root() {
    if [[ ! -f "$PROJECT_ROOT/docker-compose.yml" ]]; then
        error "Please run this script from the AI Finance Agency project root"
        exit 1
    fi
}

# Create monitoring directories
create_monitoring_directories() {
    log "Creating monitoring directory structure..."
    
    mkdir -p "$MONITORING_DIR"/{prometheus,grafana,alertmanager}
    mkdir -p "$MONITORING_DIR/grafana"/{dashboards,provisioning/{datasources,dashboards}}
    mkdir -p "$MONITORING_DIR/exporters/postgres"
    mkdir -p "$MONITORING_DIR/data"/{prometheus,grafana,alertmanager}
    
    success "Monitoring directories created"
}

# Add Prometheus client to Node.js services
add_nodejs_metrics() {
    local service=$1
    local service_dir="$PROJECT_ROOT/services/$service"
    
    if [[ ! -d "$service_dir" ]]; then
        warning "Service directory $service_dir not found, skipping"
        return 1
    fi
    
    log "Adding Prometheus metrics to $service..."
    
    # Add prometheus client to package.json if not exists
    if [[ -f "$service_dir/package.json" ]]; then
        if ! grep -q "prom-client" "$service_dir/package.json"; then
            log "Adding prom-client dependency to $service"
            cd "$service_dir"
            npm install prom-client --save
            cd "$PROJECT_ROOT"
        fi
    fi
    
    # Create metrics middleware
    cat > "$service_dir/src/middleware/metrics.js" << 'EOF'
const promClient = require('prom-client');

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({
    register,
    prefix: 'nodejs_',
});

// Custom metrics
const httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [register],
});

const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
    registers: [register],
});

const activeConnections = new promClient.Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
    registers: [register],
});

// Business metrics (customize per service)
const businessMetrics = {
    // Payment service metrics
    paymentTransactions: new promClient.Counter({
        name: 'payment_transactions_total',
        help: 'Total payment transactions',
        labelNames: ['status', 'method'],
        registers: [register],
    }),
    
    paymentRevenue: new promClient.Counter({
        name: 'payment_revenue_total',
        help: 'Total payment revenue in USD',
        registers: [register],
    }),
    
    // Trading service metrics
    tradingVolume: new promClient.Counter({
        name: 'trading_volume_total',
        help: 'Total trading volume',
        registers: [register],
    }),
    
    tradingTrades: new promClient.Counter({
        name: 'trading_trades_total',
        help: 'Total number of trades',
        labelNames: ['status'],
        registers: [register],
    }),
    
    // Signals service metrics
    signalsGenerated: new promClient.Counter({
        name: 'signals_generated_total',
        help: 'Total signals generated',
        labelNames: ['type'],
        registers: [register],
    }),
    
    // User service metrics
    userRegistrations: new promClient.Counter({
        name: 'user_registrations_total',
        help: 'Total user registrations',
        registers: [register],
    }),
};

// Middleware function
const metricsMiddleware = (req, res, next) => {
    const start = Date.now();
    
    // Track active connections
    activeConnections.inc();
    
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;
        
        // Record metrics
        httpRequestsTotal.inc({
            method: req.method,
            route: route,
            status: res.statusCode,
        });
        
        httpRequestDuration.observe({
            method: req.method,
            route: route,
            status: res.statusCode,
        }, duration);
        
        // Decrease active connections
        activeConnections.dec();
    });
    
    next();
};

// Metrics endpoint
const metricsEndpoint = async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (ex) {
        res.status(500).end(ex);
    }
};

module.exports = {
    register,
    metricsMiddleware,
    metricsEndpoint,
    metrics: {
        httpRequestsTotal,
        httpRequestDuration,
        activeConnections,
        ...businessMetrics,
    },
};
EOF
    
    success "Metrics middleware added to $service"
}

# Add health check endpoint
add_health_endpoint() {
    local service=$1
    local service_dir="$PROJECT_ROOT/services/$service"
    
    if [[ ! -d "$service_dir" ]]; then
        return 1
    fi
    
    # Create health check middleware
    cat > "$service_dir/src/middleware/health.js" << 'EOF'
const healthCheck = {
    async checkDatabase(db) {
        try {
            await db.raw('SELECT 1');
            return { status: 'healthy', responseTime: Date.now() };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    },
    
    async checkRedis(redis) {
        try {
            await redis.ping();
            return { status: 'healthy', responseTime: Date.now() };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    },
    
    async checkRabbitMQ(channel) {
        try {
            await channel.checkQueue('health-check');
            return { status: 'healthy', responseTime: Date.now() };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    },
};

const healthEndpoint = async (req, res) => {
    const checks = {
        service: process.env.SERVICE_NAME || 'unknown',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.VERSION || '1.0.0',
        checks: {},
    };
    
    // Add database check if available
    if (req.app.locals.db) {
        checks.checks.database = await healthCheck.checkDatabase(req.app.locals.db);
    }
    
    // Add Redis check if available
    if (req.app.locals.redis) {
        checks.checks.redis = await healthCheck.checkRedis(req.app.locals.redis);
    }
    
    // Add RabbitMQ check if available
    if (req.app.locals.rabbitmq) {
        checks.checks.rabbitmq = await healthCheck.checkRabbitMQ(req.app.locals.rabbitmq);
    }
    
    // Determine overall status
    const hasUnhealthy = Object.values(checks.checks).some(check => check.status === 'unhealthy');
    if (hasUnhealthy) {
        checks.status = 'unhealthy';
        return res.status(503).json(checks);
    }
    
    res.status(200).json(checks);
};

module.exports = { healthEndpoint, healthCheck };
EOF
    
    success "Health check endpoint added to $service"
}

# Create PostgreSQL exporter queries
create_postgres_queries() {
    log "Creating PostgreSQL exporter queries..."
    
    cat > "$MONITORING_DIR/exporters/postgres/queries.yaml" << 'EOF'
# Custom PostgreSQL queries for AI Finance Agency

pg_database:
  query: "SELECT pg_database.datname, pg_database_size(pg_database.datname) as size FROM pg_database"
  master: true
  cache_seconds: 30
  metrics:
    - datname:
        usage: "LABEL"
        description: "Name of the database"
    - size:
        usage: "GAUGE"
        description: "Disk space used by the database"

pg_stat_user_tables:
  query: "SELECT schemaname, tablename, seq_scan, seq_tup_read, idx_scan, idx_tup_fetch, n_tup_ins, n_tup_upd, n_tup_del FROM pg_stat_user_tables"
  master: true
  cache_seconds: 30
  metrics:
    - schemaname:
        usage: "LABEL"
        description: "Name of the schema"
    - tablename:
        usage: "LABEL"
        description: "Name of the table"
    - seq_scan:
        usage: "COUNTER"
        description: "Number of sequential scans initiated on this table"
    - seq_tup_read:
        usage: "COUNTER"
        description: "Number of live rows fetched by sequential scans"
    - idx_scan:
        usage: "COUNTER"
        description: "Number of index scans initiated on this table"
    - idx_tup_fetch:
        usage: "COUNTER"
        description: "Number of live rows fetched by index scans"
    - n_tup_ins:
        usage: "COUNTER"
        description: "Number of rows inserted"
    - n_tup_upd:
        usage: "COUNTER"
        description: "Number of rows updated"
    - n_tup_del:
        usage: "COUNTER"
        description: "Number of rows deleted"

pg_stat_activity:
  query: "SELECT state, count(*) as count FROM pg_stat_activity GROUP BY state"
  master: true
  cache_seconds: 30
  metrics:
    - state:
        usage: "LABEL"
        description: "Connection state"
    - count:
        usage: "GAUGE"
        description: "Number of connections in this state"

pg_locks:
  query: "SELECT mode, count(*) as count FROM pg_locks GROUP BY mode"
  master: true
  cache_seconds: 30
  metrics:
    - mode:
        usage: "LABEL"
        description: "Lock mode"
    - count:
        usage: "GAUGE"
        description: "Number of locks in this mode"
EOF
    
    success "PostgreSQL exporter queries created"
}

# Update docker-compose to include monitoring
update_docker_compose() {
    log "Updating docker-compose files with monitoring configuration..."
    
    # Check if monitoring is already included
    if grep -q "prometheus" "$PROJECT_ROOT/docker-compose.yml"; then
        warning "Monitoring services already present in docker-compose.yml"
        return 0
    fi
    
    # Add monitoring profile to existing services
    log "Adding monitoring labels to services..."
    
    # This would be a complex sed operation, so we'll provide instructions instead
    cat << 'EOF'

To complete the monitoring setup, please:

1. Add the following labels to each service in docker-compose.yml:
   
   labels:
     - "prometheus.io/scrape=true"
     - "prometheus.io/port=<service-port>"
     - "prometheus.io/path=/metrics"

2. Add the /metrics endpoint to each service's Express app:
   
   const { metricsMiddleware, metricsEndpoint } = require('./middleware/metrics');
   
   // Add middleware
   app.use(metricsMiddleware);
   
   // Add metrics endpoint
   app.get('/metrics', metricsEndpoint);

3. Add the /health endpoint:
   
   const { healthEndpoint } = require('./middleware/health');
   app.get('/health', healthEndpoint);

EOF
}

# Create startup script
create_startup_script() {
    log "Creating monitoring startup script..."
    
    cat > "$PROJECT_ROOT/scripts/start-monitoring.sh" << 'EOF'
#!/bin/bash

# Start AI Finance Agency Monitoring Stack

set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[MONITORING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Ensure data directories exist
log "Creating data directories..."
mkdir -p monitoring/data/{prometheus,grafana,alertmanager}

# Set proper permissions
chmod 755 monitoring/data/*

# Start monitoring stack
log "Starting monitoring stack..."
docker-compose -f monitoring/docker-compose.monitoring.yml up -d

# Wait for services to be ready
log "Waiting for services to start..."
sleep 30

# Check service health
log "Checking service health..."
docker-compose -f monitoring/docker-compose.monitoring.yml ps

success "Monitoring stack started successfully!"

echo ""
echo "Access URLs:"
echo "- Prometheus: http://localhost:9090"
echo "- Grafana: http://localhost:3001 (admin/admin123)"
echo "- AlertManager: http://localhost:9093"
echo ""
EOF
    
    chmod +x "$PROJECT_ROOT/scripts/start-monitoring.sh"
    success "Monitoring startup script created"
}

# Main execution
main() {
    log "Starting AI Finance Agency monitoring setup..."
    
    check_project_root
    create_monitoring_directories
    
    # Add metrics to each service
    for service in "${SERVICES[@]}"; do
        add_nodejs_metrics "$service"
        add_health_endpoint "$service"
    done
    
    create_postgres_queries
    update_docker_compose
    create_startup_script
    
    success "Monitoring setup completed!"
    
    echo ""
    echo "Next steps:"
    echo "1. Run: ./scripts/start-monitoring.sh"
    echo "2. Update your services to include the metrics middleware"
    echo "3. Access Grafana at http://localhost:3001"
    echo "4. Configure alert notifications in monitoring/alertmanager/alertmanager.yml"
    echo ""
}

# Run main function
main "$@"
EOF