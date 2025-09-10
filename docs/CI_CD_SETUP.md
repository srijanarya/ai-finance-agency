# TREUM AI Finance Platform - CI/CD Setup Guide

## Overview

This document provides a comprehensive guide for setting up and using the production-ready CI/CD pipeline for the TREUM AI Finance Platform. The pipeline is designed to handle a microservices architecture with 6 NestJS services using modern DevOps practices.

## Pipeline Architecture

### 🎯 **Key Features**

- **Incremental Builds**: Only builds and tests changed services using Turborepo
- **Parallel Testing**: Services are tested in parallel for speed
- **Security-First**: Multiple security scanning tools integrated
- **Blue-Green Deployments**: Zero-downtime production deployments
- **Automated Rollbacks**: Automatic rollback on deployment failures
- **Multi-Environment**: Separate staging and production pipelines
- **Performance Testing**: Load testing with Artillery
- **Monitoring Integration**: Comprehensive metrics and alerting

### 🏗️ **Pipeline Stages**

1. **Setup & Change Detection** - Determines which services need to be built
2. **Code Quality & Security** - ESLint, Prettier, CodeQL, Snyk, SonarCloud
3. **Testing Pipeline** - Unit, integration, and E2E tests per service
4. **Performance Testing** - Load testing for main branches
5. **Build & Package** - Docker image building with vulnerability scanning
6. **Staging Deployment** - Automated deployment to staging environment
7. **Production Deployment** - Blue-green deployment with health checks
8. **Notifications & Cleanup** - Slack notifications and resource cleanup

## Services Architecture

The platform consists of 6 microservices:

| Service | Port | Description | Docker Image |
|---------|------|-------------|--------------|
| api-gateway | 3000 | Main API gateway and routing | `ghcr.io/treum-algotech/treum-ai-finance-api-gateway` |
| user-management | 3001 | User authentication and management | `ghcr.io/treum-algotech/treum-ai-finance-user-management` |
| trading | 3002 | Trading operations and portfolio management | `ghcr.io/treum-algotech/treum-ai-finance-trading` |
| payment | 3003 | Payment processing and billing | `ghcr.io/treum-algotech/treum-ai-finance-payment` |
| signals | 3004 | Trading signals and analysis | `ghcr.io/treum-algotech/treum-ai-finance-signals` |
| education | 3005 | Educational content and courses | `ghcr.io/treum-algotech/treum-ai-finance-education` |

## Setup Instructions

### 1. GitHub Repository Configuration

#### Required Secrets

Configure the following secrets in your GitHub repository:

```bash
# Infrastructure
STAGING_KUBECONFIG          # Base64 encoded staging cluster config
PRODUCTION_KUBECONFIG       # Base64 encoded production cluster config

# Build Optimization
TURBO_TOKEN                 # Turborepo remote cache token
TURBO_TEAM                  # Turborepo team identifier

# Security Scanning
SNYK_TOKEN                  # Snyk authentication token
SONAR_TOKEN                 # SonarCloud authentication token

# Notifications
SLACK_WEBHOOK_URL           # Slack webhook for notifications

# Container Registry
GITHUB_TOKEN                # Automatically available, used for GHCR
```

#### Environment Configuration

Set up GitHub Environments:

**Staging Environment:**
- Name: `staging`
- URL: `https://staging-api.treum.ai`
- Protection rules: None (auto-deploy from develop)

**Production Environment:**
- Name: `production`
- URL: `https://api.treum.ai`
- Protection rules: Required reviewers, main branch only

### 2. Local Development Setup

#### Prerequisites

```bash
# Install required tools
npm install -g turbo@latest
npm install -g @nestjs/cli@latest
npm install -g artillery@latest

# Docker for local testing
# kubectl for deployment testing
# Node.js 22.11.0 (use nvm)
```

#### Development Commands

```bash
# Install dependencies
npm ci

# Development
npm run dev                 # Start all services in dev mode
npm run dev -- --filter=api-gateway  # Start specific service

# Testing
npm run test               # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e           # End-to-end tests
npm run test:coverage      # Generate coverage reports
npm run test:critical      # Critical path tests

# Code Quality
npm run lint               # ESLint
npm run format             # Format with Prettier
npm run format:check       # Check formatting
npm run typecheck          # TypeScript compilation

# Building
npm run build              # Build all services
npm run build -- --filter=user-management  # Build specific service

# Performance Testing
npm run performance:test   # Run load tests locally

# Security
npm run security:audit     # npm audit
npm run security:snyk      # Snyk security scan

# Deployment (local scripts)
npm run ci:deploy-staging     # Deploy to staging
npm run ci:deploy-production  # Deploy to production
```

### 3. Branch Strategy

The CI/CD pipeline supports the following branching strategy:

```
main                 # Production releases
├── develop          # Staging releases
├── feature/*        # Feature development
├── release/*        # Release preparation
└── hotfix/*         # Production hotfixes
```

**Deployment Rules:**
- `develop` → Staging (automatic)
- `main` → Production (automatic)
- `feature/*` → Tests only (no deployment)
- `release/*` → Staging (automatic)
- `hotfix/*` → Tests only (manual deployment)

### 4. Testing Strategy

#### Test Structure

```
tests/
├── critical-path/          # Production validation tests
│   ├── api-gateway.test.js
│   ├── user-management.test.js
│   └── ...
├── performance/            # Load testing configurations
│   ├── api-load-test.yml
│   └── test-data/
└── e2e/                   # End-to-end tests

services/{service}/
├── src/
│   └── **/*.spec.ts       # Unit tests (co-located)
└── test/
    ├── **/*.test.ts       # Integration tests
    └── jest-e2e.json      # E2E test configuration
```

#### Coverage Requirements

- **Unit Tests**: 90%+ coverage target
- **Integration Tests**: Critical paths covered
- **E2E Tests**: Main user journeys
- **Performance Tests**: P95 < 500ms, P99 < 1s, Error rate < 1%

### 5. Docker Configuration

Each service includes a multi-stage Dockerfile with:

- **Security**: Non-root user, read-only filesystem
- **Optimization**: Multi-stage builds, layer caching
- **Health Checks**: Built-in health and readiness endpoints
- **Observability**: Proper logging and metrics

#### Build Process

```bash
# Local build
docker build -f services/api-gateway/Dockerfile -t api-gateway:local .

# Production build (CI/CD)
docker build \
  -f services/api-gateway/Dockerfile \
  -t ghcr.io/treum-algotech/treum-ai-finance-api-gateway:v1.0.0 \
  --build-arg NODE_VERSION=22.11.0 \
  --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
  --build-arg VCS_REF="$GITHUB_SHA" \
  --build-arg VERSION="v1.0.0" \
  --build-arg SERVICE_NAME="api-gateway" \
  .
```

### 6. Deployment Configuration

#### Kubernetes Manifests

```
infrastructure/kubernetes/
├── staging/
│   ├── api-gateway-deployment.yaml
│   ├── api-gateway-service.yaml
│   └── ...
└── production/
    ├── api-gateway-deployment.yaml
    ├── api-gateway-service.yaml
    └── ...
```

#### Blue-Green Deployment

Production deployments use blue-green strategy:

1. Deploy new version alongside current version
2. Run health checks on new version
3. Switch traffic to new version
4. Verify new version is healthy
5. Remove old version

#### Rollback Strategy

Automatic rollback triggers:
- Health check failures
- Critical path test failures
- Manual intervention (force rollback)

### 7. Monitoring & Observability

#### Health Checks

Each service exposes:
- `/health` - Basic health status
- `/ready` - Readiness for traffic
- `/metrics` - Prometheus metrics

#### Alerting

Integrated with:
- Slack notifications for build status
- Email alerts for production issues
- PagerDuty for critical incidents

## Troubleshooting

### Common Issues

#### 1. Build Failures

```bash
# Check Turborepo cache
turbo run build --dry-run

# Clear Turborepo cache
turbo run clean

# Check service-specific logs
npm run build -- --filter=api-gateway --verbose
```

#### 2. Test Failures

```bash
# Run tests with verbose output
npm run test -- --verbose --runInBand

# Debug specific service tests
npm run test -- --filter=user-management --verbose

# Check test environment
cat .env.test
```

#### 3. Deployment Issues

```bash
# Check deployment status
kubectl get deployments -n treum-production
kubectl describe deployment api-gateway-deployment -n treum-production

# Check pod logs
kubectl logs -f deployment/api-gateway-deployment -n treum-production

# Manual rollback
kubectl rollout undo deployment/api-gateway-deployment -n treum-production
```

#### 4. Performance Issues

```bash
# Run performance tests locally
npm run performance:test

# Check service metrics
kubectl top pods -n treum-production

# View service logs
kubectl logs -f service/api-gateway-service -n treum-production
```

### Pipeline Debugging

#### GitHub Actions Debugging

Enable debug logging:

```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

#### Service-Specific Issues

Check individual service builds:

```bash
# Test service locally
cd services/api-gateway
npm test
npm run build
docker build -f Dockerfile -t api-gateway:debug .
```

## Performance Optimization

### Build Speed

- **Turborepo**: Incremental builds and remote caching
- **Docker Layer Caching**: GitHub Actions cache layers
- **Parallel Execution**: Matrix strategy for services
- **Smart Change Detection**: Only build modified services

### Resource Usage

- **Concurrency Control**: Limited parallel deployments
- **Resource Limits**: Kubernetes resource constraints
- **Cleanup Jobs**: Automatic resource cleanup

## Security

### Security Scanning

- **CodeQL**: Static analysis for vulnerabilities
- **Snyk**: Dependency vulnerability scanning
- **Trivy**: Container image scanning
- **npm audit**: Package vulnerability checking

### Access Control

- **GitHub Secrets**: Encrypted secret storage
- **RBAC**: Kubernetes role-based access control
- **Service Accounts**: Dedicated service accounts per service
- **Network Policies**: Kubernetes network isolation

## Best Practices

### Development

1. **Feature Flags**: Use feature flags for safe deployments
2. **Database Migrations**: Always backward compatible
3. **API Versioning**: Maintain API backward compatibility
4. **Logging**: Structured logging with correlation IDs
5. **Error Handling**: Graceful error handling and recovery

### Operations

1. **Health Checks**: Implement comprehensive health checks
2. **Graceful Shutdown**: Handle SIGTERM signals properly
3. **Circuit Breakers**: Implement circuit breakers for external calls
4. **Rate Limiting**: Protect APIs with rate limiting
5. **Monitoring**: Monitor all critical metrics

### Security

1. **Principle of Least Privilege**: Minimal required permissions
2. **Secrets Management**: Never commit secrets to repository
3. **Container Security**: Use non-root users and read-only filesystems
4. **Network Security**: Implement network policies
5. **Regular Updates**: Keep dependencies up to date

## Support

### Emergency Contacts

- **On-Call Engineer**: Available 24/7 for production issues
- **DevOps Team**: Business hours support for CI/CD issues
- **Security Team**: Security incident response

### Documentation

- [Architecture Documentation](./TREUM_COMPLETE_ARCHITECTURE_DOCUMENT.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [API Documentation](./api-documentation.yaml)
- [Monitoring Dashboard](https://grafana.treum.ai)

### Getting Help

1. Check this documentation first
2. Review recent pipeline runs in GitHub Actions
3. Check service logs in Kubernetes
4. Contact the on-call engineer for urgent issues
5. Create an issue in the repository for non-urgent problems

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Pipeline Version**: Latest  
**Maintained By**: TREUM DevOps Team