#!/bin/bash

# Multi-Agent Coordination Validation Script
# Validates deployment success and system readiness

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Logging functions
log() {
    echo -e "${BLUE}[VALIDATION]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_CHECKS++))
}

failure() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_CHECKS++))
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check function wrapper
check() {
    ((TOTAL_CHECKS++))
    local description="$1"
    local command="$2"
    
    log "Checking: $description"
    
    if eval "$command" >/dev/null 2>&1; then
        success "$description"
        return 0
    else
        failure "$description"
        return 1
    fi
}

# Header
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                     🔍 COORDINATION VALIDATION SUITE 🔍                     ║${NC}"
echo -e "${PURPLE}║                         AI Finance Agency Platform                           ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# PHASE 1: Infrastructure Validation
echo -e "${BLUE}🏗️  PHASE 1: Infrastructure Validation${NC}"
echo "═══════════════════════════════════════════"

# PostgreSQL
check "PostgreSQL container running" "docker ps | grep -q ai_finance_postgres"
check "PostgreSQL accepting connections" "docker exec ai_finance_postgres pg_isready -U ai_finance_user"
check "PostgreSQL databases created" "docker exec ai_finance_postgres psql -U ai_finance_user -d ai_finance_db -c 'SELECT 1;'"

# Redis
check "Redis container running" "docker ps | grep -q ai_finance_redis"
check "Redis responding to ping" "docker exec ai_finance_redis redis-cli ping | grep -q PONG"
check "Redis memory configuration" "docker exec ai_finance_redis redis-cli CONFIG GET maxmemory | grep -q 256mb"

# RabbitMQ
check "RabbitMQ container running" "docker ps | grep -q ai_finance_rabbitmq"
check "RabbitMQ management accessible" "curl -f http://localhost:15672/api/overview"
check "RabbitMQ vhost exists" "curl -f http://localhost:15672/api/vhosts/ai_finance"

# MongoDB
check "MongoDB container running" "docker ps | grep -q ai_finance_mongodb"
check "MongoDB accepting connections" "docker exec ai_finance_mongodb mongosh --eval 'db.runCommand(\"ping\")'"

echo ""

# PHASE 2: Microservices Validation
echo -e "${BLUE}🚀 PHASE 2: Microservices Validation${NC}"
echo "═══════════════════════════════════════════="

# Define services and their ports
declare -A services=(
    ["api-gateway"]="3000"
    ["user-management"]="3002"
    ["payment"]="3001"
    ["trading"]="3004"
    ["signals"]="3003"
    ["market-data"]="3008"
    ["risk-management"]="3007"
    ["education"]="3005"
    ["notification"]="3006"
    ["content-intelligence"]="3009"
)

# Check each microservice
for service in "${!services[@]}"; do
    port=${services[$service]}
    
    check "$service container running" "docker ps | grep -q ai_finance_$service"
    check "$service health endpoint" "curl -f http://localhost:$port/health"
    check "$service response time < 2s" "timeout 2s curl -f http://localhost:$port/health"
done

echo ""

# PHASE 3: Inter-Service Communication
echo -e "${BLUE}🔗 PHASE 3: Inter-Service Communication${NC}"
echo "═══════════════════════════════════════════════"

# Test API Gateway routing
check "API Gateway routes to user service" "curl -f http://localhost:3000/api/users/health"
check "API Gateway routes to trading service" "curl -f http://localhost:3000/api/trading/health"
check "API Gateway routes to market data" "curl -f http://localhost:3000/api/market-data/health"

# Test service-to-service communication
check "Trading service can reach market data" "docker exec ai_finance_trading curl -f http://market-data:3008/health"
check "Signals service can reach market data" "docker exec ai_finance_signals curl -f http://market-data:3008/health"
check "Risk management can reach trading" "docker exec ai_finance_risk_management curl -f http://trading:3004/health"

echo ""

# PHASE 4: Data Persistence
echo -e "${BLUE}💾 PHASE 4: Data Persistence Validation${NC}"
echo "════════════════════════════════════════════"

# Check database connections from services
check "User service database connection" "docker exec ai_finance_user_management node -e 'require(\"./src/config/database\").testConnection()'"
check "Trading service database connection" "docker exec ai_finance_trading node -e 'require(\"./src/config/database\").testConnection()'"
check "Payment service database connection" "docker exec ai_finance_payment node -e 'require(\"./src/config/database\").testConnection()'"

# Check Redis connections
check "API Gateway Redis connection" "docker exec ai_finance_api_gateway node -e 'require(\"redis\").createClient({url:\"redis://redis:6379\"}).ping()'"

echo ""

# PHASE 5: Security Validation
echo -e "${BLUE}🔒 PHASE 5: Security Validation${NC}"
echo "═══════════════════════════════════════════"

# Check JWT configuration
check "JWT secret configured" "docker exec ai_finance_api_gateway printenv JWT_SECRET | grep -v 'dev-secret'"
check "Database passwords not default" "docker exec ai_finance_postgres printenv POSTGRES_PASSWORD | grep -v 'securepassword123'"

# Check service isolation
check "Services in isolated network" "docker network inspect ai_finance_network | grep -q ai_finance"
check "No services exposing internal ports" "! netstat -tulpn | grep -E ':5432|:6379|:5672' | grep -v '127.0.0.1'"

echo ""

# PHASE 6: Performance Metrics
echo -e "${BLUE}📊 PHASE 6: Performance Validation${NC}"
echo "═══════════════════════════════════════════"

# Memory usage
for service in "${!services[@]}"; do
    memory_usage=$(docker stats ai_finance_$service --no-stream --format "{{.MemUsage}}" | cut -d'/' -f1 | sed 's/MiB//')
    if [ "${memory_usage%.*}" -lt 512 ]; then
        success "$service memory usage within limits (${memory_usage}MiB)"
        ((PASSED_CHECKS++))
    else
        failure "$service memory usage too high (${memory_usage}MiB)"
        ((FAILED_CHECKS++))
    fi
    ((TOTAL_CHECKS++))
done

# Response time tests
for service in "${!services[@]}"; do
    port=${services[$service]}
    response_time=$(curl -o /dev/null -s -w "%{time_total}" http://localhost:$port/health)
    if (( $(echo "$response_time < 1.0" | bc -l) )); then
        success "$service response time acceptable (${response_time}s)"
        ((PASSED_CHECKS++))
    else
        warning "$service response time high (${response_time}s)"
        ((FAILED_CHECKS++))
    fi
    ((TOTAL_CHECKS++))
done

echo ""

# PHASE 7: Monitoring & Observability
echo -e "${BLUE}📈 PHASE 7: Monitoring Validation${NC}"
echo "═══════════════════════════════════════════"

# Check if monitoring services are running
if docker ps | grep -q ai_finance_prometheus; then
    check "Prometheus accessible" "curl -f http://localhost:9090/-/ready"
    check "Prometheus collecting metrics" "curl -s http://localhost:9090/api/v1/query?query=up | jq -r '.data.result | length' | grep -v '^0$'"
fi

if docker ps | grep -q ai_finance_grafana; then
    check "Grafana accessible" "curl -f http://localhost:3001/api/health"
fi

if docker ps | grep -q ai_finance_jaeger; then
    check "Jaeger accessible" "curl -f http://localhost:16686"
fi

echo ""

# Generate Final Report
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                              🎯 FINAL REPORT 🎯                              ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📊 VALIDATION SUMMARY${NC}"
echo "────────────────────"
echo "Total Checks: $TOTAL_CHECKS"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed: ${RED}$FAILED_CHECKS${NC}"

# Calculate success rate
success_rate=$(echo "scale=1; $PASSED_CHECKS * 100 / $TOTAL_CHECKS" | bc)
echo "Success Rate: $success_rate%"

echo ""

# Determine deployment status
if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "${GREEN}🎉 DEPLOYMENT STATUS: FULLY OPERATIONAL${NC}"
    echo -e "${GREEN}✅ All systems green - Ready for production!${NC}"
    exit_code=0
elif [ $FAILED_CHECKS -lt 5 ]; then
    echo -e "${YELLOW}⚠️  DEPLOYMENT STATUS: MOSTLY OPERATIONAL${NC}"
    echo -e "${YELLOW}🔧 Minor issues detected - Review and fix${NC}"
    exit_code=1
else
    echo -e "${RED}❌ DEPLOYMENT STATUS: NEEDS ATTENTION${NC}"
    echo -e "${RED}🚨 Critical issues detected - Immediate action required${NC}"
    exit_code=2
fi

echo ""
echo -e "${BLUE}🔗 ACCESS POINTS${NC}"
echo "───────────────"
echo "• API Gateway:     http://localhost:3000"
echo "• Health Status:   http://localhost:3000/health"
echo "• API Documentation: http://localhost:3000/docs"
echo "• Grafana:         http://localhost:3001"
echo "• Prometheus:      http://localhost:9090"
echo "• RabbitMQ:        http://localhost:15672"

echo ""
echo -e "${BLUE}📝 NEXT STEPS${NC}"
echo "─────────────"
if [ $exit_code -eq 0 ]; then
    echo "1. Run integration tests"
    echo "2. Configure production secrets"
    echo "3. Set up SSL certificates"
    echo "4. Configure monitoring alerts"
    echo "5. Deploy to production"
elif [ $exit_code -eq 1 ]; then
    echo "1. Review failed checks above"
    echo "2. Fix configuration issues"
    echo "3. Re-run validation"
    echo "4. Proceed with integration tests"
else
    echo "1. Check service logs: docker-compose logs [service-name]"
    echo "2. Restart failed services"
    echo "3. Verify network connectivity"
    echo "4. Re-run deployment script"
fi

echo ""
echo "Validation completed at $(date)"

exit $exit_code