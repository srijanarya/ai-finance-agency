#!/bin/bash
# Infrastructure test script for AI Finance Agency
# Usage: ./test-infrastructure.sh [environment]

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TEST_TIMEOUT=300
NAMESPACE="ai-finance-agency"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1" >&2
}

# Test result tracking
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

# Test result functions
test_passed() {
    ((TESTS_PASSED++))
    log_success "$1"
}

test_failed() {
    ((TESTS_FAILED++))
    FAILED_TESTS+=("$1")
    log_error "$1"
}

# Parse arguments
ENVIRONMENT="${1:-local}"

log_info "Starting infrastructure tests for environment: $ENVIRONMENT"
log_info "Test timeout: ${TEST_TIMEOUT}s"

# Docker tests
test_docker() {
    log_info "Testing Docker infrastructure..."
    
    # Test Docker daemon
    if docker info >/dev/null 2>&1; then
        test_passed "Docker daemon is running"
    else
        test_failed "Docker daemon is not accessible"
        return 1
    fi
    
    # Test Docker build
    cd "$PROJECT_ROOT"
    if docker build -f infrastructure/docker/Dockerfile --target runtime -t ai-finance-test . >/dev/null 2>&1; then
        test_passed "Docker image builds successfully"
        
        # Clean up test image
        docker rmi ai-finance-test >/dev/null 2>&1 || true
    else
        test_failed "Docker image build failed"
    fi
    
    # Test Docker Compose
    if [ -f "infrastructure/docker/docker-compose.yml" ]; then
        if docker-compose -f infrastructure/docker/docker-compose.yml config >/dev/null 2>&1; then
            test_passed "Docker Compose configuration is valid"
        else
            test_failed "Docker Compose configuration is invalid"
        fi
    else
        test_failed "Docker Compose file not found"
    fi
}

# Kubernetes tests
test_kubernetes() {
    log_info "Testing Kubernetes configuration..."
    
    # Test kubectl connectivity
    if kubectl cluster-info >/dev/null 2>&1; then
        test_passed "Kubernetes cluster is accessible"
    else
        test_failed "Cannot connect to Kubernetes cluster"
        return 1
    fi
    
    # Test namespace
    if kubectl get namespace "$NAMESPACE" >/dev/null 2>&1; then
        test_passed "Namespace '$NAMESPACE' exists"
    else
        log_info "Namespace '$NAMESPACE' does not exist, creating it..."
        if kubectl apply -f infrastructure/kubernetes/namespace.yaml >/dev/null 2>&1; then
            test_passed "Namespace created successfully"
        else
            test_failed "Failed to create namespace"
        fi
    fi
    
    # Validate Kubernetes manifests
    local k8s_files=(
        "infrastructure/kubernetes/namespace.yaml"
        "infrastructure/kubernetes/configmap.yaml"
        "infrastructure/kubernetes/secrets.yaml"
        "infrastructure/kubernetes/pvc.yaml"
        "infrastructure/kubernetes/rbac.yaml"
        "infrastructure/kubernetes/deployment.yaml"
        "infrastructure/kubernetes/service.yaml"
        "infrastructure/kubernetes/ingress.yaml"
        "infrastructure/kubernetes/hpa.yaml"
    )
    
    for file in "${k8s_files[@]}"; do
        if [ -f "$file" ]; then
            if kubectl apply --dry-run=client -f "$file" >/dev/null 2>&1; then
                test_passed "Kubernetes manifest valid: $(basename "$file")"
            else
                test_failed "Kubernetes manifest invalid: $(basename "$file")"
            fi
        else
            test_failed "Kubernetes manifest not found: $file"
        fi
    done
}

# Nginx configuration tests
test_nginx() {
    log_info "Testing Nginx configuration..."
    
    # Test nginx configuration syntax
    local nginx_configs=(
        "infrastructure/nginx/nginx.conf"
        "infrastructure/nginx/default.conf"
        "infrastructure/nginx/prod.conf"
    )
    
    for config in "${nginx_configs[@]}"; do
        if [ -f "$config" ]; then
            # Use docker to test nginx config
            if docker run --rm -v "$PROJECT_ROOT/$config:/etc/nginx/nginx.conf:ro" nginx:alpine nginx -t >/dev/null 2>&1; then
                test_passed "Nginx configuration valid: $(basename "$config")"
            else
                test_failed "Nginx configuration invalid: $(basename "$config")"
            fi
        else
            test_failed "Nginx configuration not found: $config"
        fi
    done
}

# Monitoring configuration tests
test_monitoring() {
    log_info "Testing monitoring configuration..."
    
    # Test Prometheus configuration
    if [ -f "infrastructure/monitoring/prometheus.yml" ]; then
        # Use promtool to validate config (if available)
        if command -v promtool >/dev/null 2>&1; then
            if promtool check config infrastructure/monitoring/prometheus.yml >/dev/null 2>&1; then
                test_passed "Prometheus configuration is valid"
            else
                test_failed "Prometheus configuration is invalid"
            fi
        else
            # Basic YAML validation
            if python3 -c "import yaml; yaml.safe_load(open('infrastructure/monitoring/prometheus.yml'))" 2>/dev/null; then
                test_passed "Prometheus YAML is valid"
            else
                test_failed "Prometheus YAML is invalid"
            fi
        fi
    else
        test_failed "Prometheus configuration not found"
    fi
    
    # Test Alertmanager configuration
    if [ -f "infrastructure/monitoring/alertmanager.yml" ]; then
        if python3 -c "import yaml; yaml.safe_load(open('infrastructure/monitoring/alertmanager.yml'))" 2>/dev/null; then
            test_passed "Alertmanager YAML is valid"
        else
            test_failed "Alertmanager YAML is invalid"
        fi
    else
        test_failed "Alertmanager configuration not found"
    fi
    
    # Test Grafana provisioning
    local grafana_configs=(
        "infrastructure/monitoring/grafana/provisioning/datasources/prometheus.yml"
        "infrastructure/monitoring/grafana/provisioning/dashboards/default.yml"
    )
    
    for config in "${grafana_configs[@]}"; do
        if [ -f "$config" ]; then
            if python3 -c "import yaml; yaml.safe_load(open('$config'))" 2>/dev/null; then
                test_passed "Grafana config valid: $(basename "$config")"
            else
                test_failed "Grafana config invalid: $(basename "$config")"
            fi
        else
            test_failed "Grafana configuration not found: $config"
        fi
    done
}

# Application deployment test
test_application_deployment() {
    if [ "$ENVIRONMENT" = "local" ]; then
        log_info "Testing local application deployment..."
        
        # Start services with Docker Compose
        cd "$PROJECT_ROOT"
        docker-compose -f infrastructure/docker/docker-compose.yml up -d >/dev/null 2>&1
        
        # Wait for services to be ready
        log_info "Waiting for services to be ready..."
        sleep 30
        
        # Test service endpoints
        local services=(
            "http://localhost:8000/health:Application"
            "http://localhost:5432:PostgreSQL"
            "http://localhost:6379:Redis"
            "http://localhost:80:Nginx"
        )
        
        for service in "${services[@]}"; do
            IFS=':' read -r url name <<< "$service"
            if curl -f -s --connect-timeout 10 "$url" >/dev/null 2>&1; then
                test_passed "$name service is responding"
            else
                test_failed "$name service is not responding"
            fi
        done
        
        # Clean up
        docker-compose -f infrastructure/docker/docker-compose.yml down >/dev/null 2>&1
    else
        log_info "Skipping application deployment test for environment: $ENVIRONMENT"
    fi
}

# Security tests
test_security() {
    log_info "Testing security configuration..."
    
    # Test for sensitive files in git
    if find . -name "*.key" -o -name "*.pem" -o -name "*secret*" -o -name "*password*" | grep -v ".gitignore" | grep -q .; then
        test_failed "Sensitive files found in repository"
    else
        test_passed "No sensitive files found in repository"
    fi
    
    # Test Docker image security
    if command -v trivy >/dev/null 2>&1; then
        cd "$PROJECT_ROOT"
        if docker build -f infrastructure/docker/Dockerfile --target runtime -t ai-finance-security-test . >/dev/null 2>&1; then
            if trivy image --exit-code 1 --severity HIGH,CRITICAL ai-finance-security-test >/dev/null 2>&1; then
                test_passed "Docker image security scan passed"
            else
                test_failed "Docker image has security vulnerabilities"
            fi
            docker rmi ai-finance-security-test >/dev/null 2>&1 || true
        else
            test_failed "Could not build image for security scanning"
        fi
    else
        log_warn "Trivy not installed, skipping security scan"
    fi
    
    # Test Kubernetes security
    if kubectl get psp >/dev/null 2>&1; then
        test_passed "Pod Security Policies are configured"
    else
        log_warn "Pod Security Policies not found (may be using Pod Security Standards)"
    fi
}

# Performance tests
test_performance() {
    log_info "Testing performance configuration..."
    
    # Check resource limits in Kubernetes manifests
    if grep -q "resources:" infrastructure/kubernetes/deployment.yaml; then
        test_passed "Resource limits are configured"
    else
        test_failed "Resource limits not configured"
    fi
    
    # Check HPA configuration
    if [ -f "infrastructure/kubernetes/hpa.yaml" ]; then
        test_passed "Horizontal Pod Autoscaler is configured"
    else
        test_failed "Horizontal Pod Autoscaler not configured"
    fi
    
    # Check caching configuration in Nginx
    if grep -q "proxy_cache" infrastructure/nginx/nginx.conf; then
        test_passed "Nginx caching is configured"
    else
        test_failed "Nginx caching not configured"
    fi
}

# Backup and recovery tests
test_backup_recovery() {
    log_info "Testing backup and recovery configuration..."
    
    # Check for backup scripts
    if [ -f "infrastructure/scripts/backup.sh" ]; then
        test_passed "Backup script exists"
    else
        test_failed "Backup script not found"
    fi
    
    # Check persistent volume configuration
    if [ -f "infrastructure/kubernetes/pvc.yaml" ]; then
        if grep -q "persistentvolumeclaims" infrastructure/kubernetes/pvc.yaml; then
            test_passed "Persistent volumes are configured"
        else
            test_failed "Persistent volumes not properly configured"
        fi
    else
        test_failed "PVC configuration not found"
    fi
}

# CI/CD tests
test_cicd() {
    log_info "Testing CI/CD configuration..."
    
    # Check GitHub Actions workflow
    if [ -f ".github/workflows/ci-cd.yml" ]; then
        test_passed "CI/CD workflow exists"
    else
        test_failed "CI/CD workflow not found"
    fi
    
    # Check deployment scripts
    local scripts=(
        "infrastructure/scripts/build.sh"
        "infrastructure/scripts/deploy.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [ -f "$script" ] && [ -x "$script" ]; then
            test_passed "Script exists and is executable: $(basename "$script")"
        else
            test_failed "Script missing or not executable: $(basename "$script")"
        fi
    done
}

# Generate test report
generate_report() {
    log_info "Generating test report..."
    
    local total_tests=$((TESTS_PASSED + TESTS_FAILED))
    local success_rate=0
    
    if [ $total_tests -gt 0 ]; then
        success_rate=$(echo "scale=2; $TESTS_PASSED * 100 / $total_tests" | bc 2>/dev/null || echo "0")
    fi
    
    cat > infrastructure-test-report.txt << EOF
Infrastructure Test Report
==========================
Date: $(date)
Environment: $ENVIRONMENT

Test Summary:
- Total Tests: $total_tests
- Passed: $TESTS_PASSED
- Failed: $TESTS_FAILED
- Success Rate: ${success_rate}%

Failed Tests:
EOF
    
    for test in "${FAILED_TESTS[@]}"; do
        echo "- $test" >> infrastructure-test-report.txt
    done
    
    echo >> infrastructure-test-report.txt
    echo "Recommendations:" >> infrastructure-test-report.txt
    
    if [ $TESTS_FAILED -gt 0 ]; then
        echo "- Address failed tests before production deployment" >> infrastructure-test-report.txt
        echo "- Review security configurations" >> infrastructure-test-report.txt
        echo "- Ensure all monitoring is properly configured" >> infrastructure-test-report.txt
    else
        echo "- All tests passed! Infrastructure is ready for deployment" >> infrastructure-test-report.txt
        echo "- Consider running load tests for performance validation" >> infrastructure-test-report.txt
        echo "- Review backup and disaster recovery procedures" >> infrastructure-test-report.txt
    fi
    
    log_info "Test report generated: infrastructure-test-report.txt"
}

# Main test execution
main() {
    log_info "Starting comprehensive infrastructure tests..."
    
    # Run all test suites
    test_docker
    test_kubernetes
    test_nginx
    test_monitoring
    test_application_deployment
    test_security
    test_performance
    test_backup_recovery
    test_cicd
    
    # Generate report
    generate_report
    
    # Display summary
    echo
    echo "==============================================="
    echo "         INFRASTRUCTURE TEST SUMMARY"
    echo "==============================================="
    echo "Environment: $ENVIRONMENT"
    echo "Tests Passed: $TESTS_PASSED"
    echo "Tests Failed: $TESTS_FAILED"
    echo "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
    echo
    
    if [ $TESTS_FAILED -eq 0 ]; then
        log_success "All tests passed! Infrastructure is ready for deployment."
        exit 0
    else
        log_error "$TESTS_FAILED tests failed. Please review and fix issues before deployment."
        echo "Failed tests:"
        for test in "${FAILED_TESTS[@]}"; do
            echo "  - $test"
        done
        exit 1
    fi
}

# Run main function
main "$@"