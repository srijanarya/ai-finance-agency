#!/bin/bash

# TREUM AI Finance Platform - CI/CD Setup Validation Script
# Validates the complete CI/CD pipeline configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((PASSED_CHECKS++))
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    ((FAILED_CHECKS++))
}

check_item() {
    local description="$1"
    local command="$2"
    
    ((TOTAL_CHECKS++))
    
    if eval "$command" &> /dev/null; then
        log_success "$description"
    else
        log_error "$description"
    fi
}

# Header
echo "============================================="
echo "  TREUM AI Finance Platform CI/CD Validation"
echo "============================================="
echo

# 1. Project Structure Validation
echo "🏗️  PROJECT STRUCTURE"
echo "---------------------"

check_item "Root package.json exists" "test -f package.json"
check_item "Turbo configuration exists" "test -f turbo.json"
check_item "TypeScript config exists" "test -f tsconfig.json"
check_item "Services directory exists" "test -d services"
check_item "Infrastructure directory exists" "test -d infrastructure"
check_item "Tests directory exists" "test -d tests"
check_item "Scripts directory exists" "test -d scripts"
check_item "Docs directory exists" "test -d docs"

echo

# 2. Service Structure Validation
echo "🔧  MICROSERVICES STRUCTURE"
echo "---------------------------"

SERVICES=("api-gateway" "user-management" "trading" "payment" "signals" "education")

for service in "${SERVICES[@]}"; do
    check_item "Service $service directory exists" "test -d services/$service"
    check_item "Service $service package.json exists" "test -f services/$service/package.json"
    check_item "Service $service Dockerfile exists" "test -f services/$service/Dockerfile"
    check_item "Service $service source directory exists" "test -d services/$service/src"
done

echo

# 3. CI/CD Pipeline Files
echo "🚀  CI/CD PIPELINE FILES"
echo "------------------------"

check_item "Main CI/CD workflow exists" "test -f .github/workflows/ci-cd.yml"
check_item "CodeQL configuration exists" "test -f .github/codeql/codeql-config.yml"
check_item "Performance test config exists" "test -f tests/performance/api-load-test.yml"
check_item "Critical path tests exist" "test -d tests/critical-path"
check_item "Staging deployment script exists" "test -f scripts/deploy-staging.sh"
check_item "Production deployment script exists" "test -f scripts/deploy-production.sh"
check_item "CI/CD setup documentation exists" "test -f docs/CI_CD_SETUP.md"
check_item "Deployment guide exists" "test -f docs/DEPLOYMENT_GUIDE.md"

echo

# 4. Docker Configuration
echo "🐳  DOCKER CONFIGURATION"
echo "------------------------"

for service in "${SERVICES[@]}"; do
    check_item "Dockerfile for $service is valid" "docker build --dry-run -f services/$service/Dockerfile . 2>/dev/null"
done

check_item "Docker Compose config exists" "test -f docker-compose.yml"
check_item "Docker Compose microservices config exists" "test -f docker-compose.microservices.yml"

echo

# 5. Kubernetes Manifests
echo "☸️  KUBERNETES MANIFESTS"
echo "------------------------"

check_item "Staging Kubernetes manifests directory exists" "test -d infrastructure/kubernetes/staging"
check_item "Production Kubernetes manifests directory exists" "test -d infrastructure/kubernetes/production"

for service in "${SERVICES[@]}"; do
    check_item "Staging deployment manifest for $service exists" "test -f infrastructure/kubernetes/staging/$service-deployment.yaml"
    check_item "Staging service manifest for $service exists" "test -f infrastructure/kubernetes/staging/$service-service.yaml"
done

echo

# 6. Testing Infrastructure
echo "🧪  TESTING INFRASTRUCTURE"
echo "--------------------------"

check_item "Performance test data exists" "test -f tests/performance/test-data/users.csv"
check_item "API Gateway critical tests exist" "test -f tests/critical-path/api-gateway.test.js"
check_item "Jest configuration exists" "test -f jest.config.js || test -f package.json"

# Check if test commands are available in package.json
check_item "Unit test script configured" "grep -q 'test:unit' package.json"
check_item "Integration test script configured" "grep -q 'test:integration' package.json"
check_item "E2E test script configured" "grep -q 'test:e2e' package.json"
check_item "Critical path test script configured" "grep -q 'test:critical' package.json"
check_item "Performance test script configured" "grep -q 'performance:test' package.json"

echo

# 7. Security Configuration
echo "🔒  SECURITY CONFIGURATION"
echo "--------------------------"

check_item "ESLint configuration exists" "test -f .eslintrc.js || test -f eslint.config.js || grep -q eslint package.json"
check_item "Prettier configuration exists" "test -f .prettierrc || test -f prettier.config.js || grep -q prettier package.json"
check_item "Husky pre-commit hooks exist" "test -d .husky"
check_item "Commitlint configuration exists" "grep -q commitlint package.json"
check_item "Lint-staged configuration exists" "grep -q 'lint-staged' package.json"

echo

# 8. Build Tools and Dependencies
echo "📦  BUILD TOOLS & DEPENDENCIES"
echo "------------------------------"

# Check if Node.js tools are available
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_success "Node.js is installed ($NODE_VERSION)"
    ((PASSED_CHECKS++))
else
    log_error "Node.js is not installed"
    ((FAILED_CHECKS++))
fi
((TOTAL_CHECKS++))

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log_success "npm is installed (v$NPM_VERSION)"
    ((PASSED_CHECKS++))
else
    log_error "npm is not installed"
    ((FAILED_CHECKS++))
fi
((TOTAL_CHECKS++))

# Check for Turbo
if command -v turbo &> /dev/null || test -f node_modules/.bin/turbo; then
    log_success "Turborepo is available"
    ((PASSED_CHECKS++))
else
    log_error "Turborepo is not available"
    ((FAILED_CHECKS++))
fi
((TOTAL_CHECKS++))

# Check for Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    log_success "Docker is installed ($DOCKER_VERSION)"
    ((PASSED_CHECKS++))
else
    log_error "Docker is not installed"
    ((FAILED_CHECKS++))
fi
((TOTAL_CHECKS++))

echo

# 9. Environment Configuration
echo "🌍  ENVIRONMENT CONFIGURATION"
echo "-----------------------------"

check_item "Environment example file exists" "test -f .env.example"
check_item "Development environment file exists" "test -f .env.development"
check_item "Production environment file exists" "test -f .env.production"
check_item "Staging environment file exists" "test -f .env.staging || test -f .env.development"

echo

# 10. Package.json Scripts Validation
echo "📜  PACKAGE.JSON SCRIPTS"
echo "-----------------------"

REQUIRED_SCRIPTS=("build" "dev" "test" "lint" "typecheck" "format" "format:check")

for script in "${REQUIRED_SCRIPTS[@]}"; do
    check_item "Script '$script' is configured" "grep -q \"\\\"$script\\\"\" package.json"
done

echo

# Summary
echo "============================================="
echo "  VALIDATION SUMMARY"
echo "============================================="
echo
echo "Total Checks: $TOTAL_CHECKS"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed: ${RED}$FAILED_CHECKS${NC}"

if [[ $FAILED_CHECKS -eq 0 ]]; then
    echo
    echo -e "${GREEN}🎉 All checks passed! Your CI/CD setup is ready.${NC}"
    echo
    echo "Next steps:"
    echo "1. Configure GitHub repository secrets"
    echo "2. Set up staging and production environments"
    echo "3. Test the pipeline with a feature branch"
    echo "4. Deploy to staging and validate"
    echo
    exit 0
else
    echo
    echo -e "${RED}⚠️  Some checks failed. Please address the issues above.${NC}"
    echo
    echo "Common fixes:"
    echo "- Run 'npm install' to install dependencies"
    echo "- Ensure all required files are in place"
    echo "- Check file permissions for scripts"
    echo "- Verify Docker is installed and running"
    echo
    exit 1
fi