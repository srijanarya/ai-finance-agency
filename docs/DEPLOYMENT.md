# Deployment Guide

This guide provides detailed instructions for deploying the AI Finance Agency platform to different environments.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Staging Deployment](#staging-deployment)
- [Production Deployment](#production-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Overview

The AI Finance Agency platform supports multiple deployment environments:

- **Local Development**: Docker Compose for local development and testing
- **Staging**: Kubernetes cluster for pre-production testing
- **Production**: High-availability Kubernetes deployment

Each environment is optimized for its specific use case with appropriate resource allocation, security measures, and monitoring.

## Prerequisites

### Required Tools

1. **Docker**: Version 20.10+
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

2. **Docker Compose**: Version 2.0+
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **kubectl**: Kubernetes command-line tool
   ```bash
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
   ```

4. **Helm** (optional): Package manager for Kubernetes
   ```bash
   curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
   ```

### Access Requirements

- Docker registry access (GitHub Container Registry)
- Kubernetes cluster access (kubeconfig file)
- Environment-specific secrets and configurations

## Environment Setup

### Environment Variables

Create environment-specific configuration files:

#### `.env.development`
```bash
# Application
APP_ENV=development
DEBUG=true
LOG_LEVEL=DEBUG

# Database
DATABASE_URL=postgresql://ai_finance_user:dev_password@postgres:5432/ai_finance_dev
REDIS_URL=redis://redis:6379/0

# API Keys (development/test keys only)
OPENAI_API_KEY=sk-test-key
ANTHROPIC_API_KEY=test-key

# External URLs
BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

#### `.env.staging`
```bash
# Application
APP_ENV=staging
DEBUG=false
LOG_LEVEL=INFO

# Database
DATABASE_URL=postgresql://ai_finance_user:staging_password@postgres-service:5432/ai_finance_staging
REDIS_URL=redis://:staging_redis_password@redis-service:6379/0

# API Keys (staging keys)
OPENAI_API_KEY=sk-staging-key
ANTHROPIC_API_KEY=staging-key

# External URLs
BASE_URL=https://staging-api.ai-finance-agency.com
FRONTEND_URL=https://staging.ai-finance-agency.com
```

#### `.env.production`
```bash
# Application
APP_ENV=production
DEBUG=false
LOG_LEVEL=WARNING

# Database
DATABASE_URL=postgresql://ai_finance_user:prod_password@postgres-service:5432/ai_finance_prod
REDIS_URL=redis://:prod_redis_password@redis-service:6379/0

# API Keys (production keys)
OPENAI_API_KEY=sk-prod-key
ANTHROPIC_API_KEY=prod-key

# External URLs
BASE_URL=https://api.ai-finance-agency.com
FRONTEND_URL=https://ai-finance-agency.com
```

## Local Development

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-finance-agency
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

3. **Start services**
   ```bash
   docker-compose -f infrastructure/docker/docker-compose.yml up -d
   ```

4. **Verify deployment**
   ```bash
   # Check service status
   docker-compose ps
   
   # Test application
   curl http://localhost:8000/health
   ```

5. **View logs**
   ```bash
   docker-compose logs -f app
   ```

6. **Stop services**
   ```bash
   docker-compose down
   ```

### Development Workflow

#### Code Changes
```bash
# Services automatically reload on code changes
# No restart needed for Python code changes

# For dependency changes, rebuild:
docker-compose build app
docker-compose up -d app
```

#### Database Operations
```bash
# Run migrations
docker-compose exec app python -m alembic upgrade head

# Create new migration
docker-compose exec app python -m alembic revision --autogenerate -m "description"

# Reset database
docker-compose exec app python scripts/reset_database.py
```

#### Testing
```bash
# Run tests
docker-compose exec app pytest

# Run specific test file
docker-compose exec app pytest tests/test_specific.py

# Run with coverage
docker-compose exec app pytest --cov=. --cov-report=html
```

## Staging Deployment

### Infrastructure Preparation

1. **Setup Kubernetes cluster**
   ```bash
   # Configure kubectl context
   kubectl config use-context staging-cluster
   
   # Verify connection
   kubectl cluster-info
   ```

2. **Create secrets**
   ```bash
   # Database credentials
   kubectl create secret generic ai-finance-secrets \
     --from-literal=DATABASE_USER=ai_finance_user \
     --from-literal=DATABASE_PASSWORD=staging_password \
     --from-literal=REDIS_PASSWORD=staging_redis_password \
     -n ai-finance-agency
   
   # API keys
   kubectl create secret generic ai-finance-api-keys \
     --from-literal=OPENAI_API_KEY=sk-staging-key \
     --from-literal=ANTHROPIC_API_KEY=staging-key \
     -n ai-finance-agency
   ```

### Deployment Process

#### Method 1: Automated Script

```bash
# Build and push image
./infrastructure/scripts/build.sh -e staging -t staging-v1.0.0 -p

# Deploy to staging
./infrastructure/scripts/deploy.sh -e staging -i staging-v1.0.0 -w 300
```

#### Method 2: Manual Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f infrastructure/kubernetes/namespace.yaml
kubectl apply -f infrastructure/kubernetes/rbac.yaml
kubectl apply -f infrastructure/kubernetes/configmap.yaml
kubectl apply -f infrastructure/kubernetes/secrets.yaml
kubectl apply -f infrastructure/kubernetes/pvc.yaml
kubectl apply -f infrastructure/kubernetes/deployment.yaml
kubectl apply -f infrastructure/kubernetes/service.yaml
kubectl apply -f infrastructure/kubernetes/ingress.yaml
kubectl apply -f infrastructure/kubernetes/hpa.yaml

# Wait for deployment
kubectl wait --for=condition=available --timeout=300s deployment/ai-finance-app -n ai-finance-agency
```

### Verification

```bash
# Check pod status
kubectl get pods -n ai-finance-agency

# Check service endpoints
kubectl get services -n ai-finance-agency

# Test health endpoints
curl https://staging-api.ai-finance-agency.com/health
curl https://staging-api.ai-finance-agency.com/ready

# Check logs
kubectl logs -f deployment/ai-finance-app -n ai-finance-agency
```

## Production Deployment

### Pre-deployment Checklist

- [ ] All tests pass in staging environment
- [ ] Security scan completed
- [ ] Database backup completed
- [ ] Monitoring alerts configured
- [ ] Rollback plan prepared
- [ ] Stakeholders notified

### Blue-Green Deployment Strategy

#### 1. Prepare Green Environment

```bash
# Create green namespace
kubectl create namespace ai-finance-agency-green

# Deploy to green environment
./infrastructure/scripts/deploy.sh -e production -n ai-finance-agency-green -i v1.0.0
```

#### 2. Smoke Testing

```bash
# Port forward for testing
kubectl port-forward service/ai-finance-app-service 8080:8000 -n ai-finance-agency-green

# Run smoke tests
pytest tests/smoke/ --base-url=http://localhost:8080
```

#### 3. Traffic Switch

```bash
# Update ingress to point to green service
kubectl patch ingress ai-finance-ingress -n ai-finance-agency \
  --patch '{"spec":{"rules":[{"host":"api.ai-finance-agency.com","http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"ai-finance-app-service","port":{"number":8000}}}}]}}]}}'

# Monitor metrics and logs
kubectl logs -f deployment/ai-finance-app -n ai-finance-agency-green
```

#### 4. Cleanup Blue Environment

```bash
# After verification period (e.g., 24 hours)
kubectl delete namespace ai-finance-agency-blue
```

### Rolling Deployment (Alternative)

```bash
# Gradual rollout with rolling update
kubectl set image deployment/ai-finance-app ai-finance-app=ghcr.io/ai-finance-agency:v1.0.0 -n ai-finance-agency

# Monitor rollout
kubectl rollout status deployment/ai-finance-app -n ai-finance-agency

# Verify health
kubectl get pods -n ai-finance-agency
```

### Post-deployment Verification

```bash
# Run production health checks
./infrastructure/scripts/test-infrastructure.sh production

# Check metrics dashboard
open https://grafana.ai-finance-agency.com

# Verify all endpoints
curl -f https://api.ai-finance-agency.com/health
curl -f https://ai-finance-agency.com/
```

## CI/CD Pipeline

### GitHub Actions Workflow

The CI/CD pipeline automatically handles:

1. **Code Quality Checks**
   - Linting (flake8, black, isort)
   - Type checking (mypy)
   - Security scanning (bandit, safety)

2. **Testing**
   - Unit tests
   - Integration tests
   - API tests
   - Coverage reporting

3. **Build & Push**
   - Docker image building
   - Multi-architecture support
   - Container security scanning
   - Registry push

4. **Deployment**
   - Staging deployment (on develop branch)
   - Production deployment (on main branch)
   - Health checks and verification

### Manual Pipeline Triggers

#### Staging Deployment
```bash
# Push to develop branch triggers staging deployment
git checkout develop
git push origin develop
```

#### Production Deployment
```bash
# Create release and push to main
git checkout main
git merge develop
git tag v1.0.0
git push origin main --tags
```

#### Manual Workflow Dispatch
```bash
# Using GitHub CLI
gh workflow run ci-cd.yml --ref main -f environment=production -f force_deploy=false
```

### Pipeline Configuration

#### Secrets Setup

Configure the following secrets in GitHub:

```bash
# Repository secrets
DOCKER_REGISTRY_TOKEN=<github-token>
STAGING_KUBECONFIG=<base64-encoded-kubeconfig>
PRODUCTION_KUBECONFIG=<base64-encoded-kubeconfig>

# Environment secrets
OPENAI_API_KEY=<production-key>
ANTHROPIC_API_KEY=<production-key>
DATABASE_PASSWORD=<production-password>
REDIS_PASSWORD=<production-password>
```

## Rollback Procedures

### Automatic Rollback

The deployment script includes automatic rollback on failure:

```bash
# Rollback is triggered automatically if:
# - Health checks fail
# - Deployment timeout exceeded
# - Critical errors detected
```

### Manual Rollback

#### Kubernetes Rollback

```bash
# Check rollout history
kubectl rollout history deployment/ai-finance-app -n ai-finance-agency

# Rollback to previous version
kubectl rollout undo deployment/ai-finance-app -n ai-finance-agency

# Rollback to specific revision
kubectl rollout undo deployment/ai-finance-app --to-revision=2 -n ai-finance-agency

# Monitor rollback
kubectl rollout status deployment/ai-finance-app -n ai-finance-agency
```

#### Script-based Rollback

```bash
# Using deployment script
./infrastructure/scripts/deploy.sh --rollback -e production

# Verify rollback
kubectl get pods -n ai-finance-agency
kubectl logs -f deployment/ai-finance-app -n ai-finance-agency
```

#### Database Rollback

```bash
# Restore from backup (if schema changes)
kubectl create job restore-$(date +%s) --from=cronjob/database-restore -n ai-finance-agency

# Run down migrations (if applicable)
kubectl exec -it deployment/ai-finance-app -n ai-finance-agency -- python -m alembic downgrade <revision>
```

### Rollback Testing

```bash
# Test rollback procedure in staging
./infrastructure/scripts/deploy.sh -e staging -i v1.0.0
./infrastructure/scripts/deploy.sh --rollback -e staging

# Verify functionality
pytest tests/critical_path/ --base-url=https://staging-api.ai-finance-agency.com
```

## Troubleshooting

### Common Deployment Issues

#### Image Pull Errors

```bash
# Check image exists
docker pull ghcr.io/ai-finance-agency:v1.0.0

# Verify registry credentials
kubectl get secret regcred -o yaml -n ai-finance-agency

# Create registry secret
kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=<username> \
  --docker-password=<token> \
  -n ai-finance-agency
```

#### Resource Constraints

```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n ai-finance-agency

# Check resource quotas
kubectl describe resourcequota -n ai-finance-agency

# Scale down if needed
kubectl scale deployment/ai-finance-app --replicas=2 -n ai-finance-agency
```

#### Configuration Issues

```bash
# Check ConfigMap
kubectl describe configmap ai-finance-config -n ai-finance-agency

# Check Secrets
kubectl get secrets -n ai-finance-agency

# Verify environment variables
kubectl exec -it <pod> -n ai-finance-agency -- env | grep DATABASE_URL
```

#### Network Issues

```bash
# Test service connectivity
kubectl exec -it <pod> -n ai-finance-agency -- curl http://postgres-service:5432

# Check DNS resolution
kubectl exec -it <pod> -n ai-finance-agency -- nslookup postgres-service

# Verify ingress configuration
kubectl describe ingress -n ai-finance-agency
```

### Deployment Debugging

#### Pod Debugging

```bash
# Describe pod
kubectl describe pod <pod-name> -n ai-finance-agency

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp -n ai-finance-agency

# Access pod shell
kubectl exec -it <pod-name> -n ai-finance-agency -- /bin/bash

# Check logs with more context
kubectl logs <pod-name> -n ai-finance-agency --previous
```

#### Service Debugging

```bash
# Test service endpoints
kubectl port-forward service/ai-finance-app-service 8080:8000 -n ai-finance-agency
curl http://localhost:8080/health

# Check service endpoints
kubectl describe service ai-finance-app-service -n ai-finance-agency

# Verify selector labels
kubectl get pods --show-labels -n ai-finance-agency
```

### Performance Issues

#### Scaling Issues

```bash
# Check HPA status
kubectl describe hpa ai-finance-app-hpa -n ai-finance-agency

# Manual scaling
kubectl scale deployment/ai-finance-app --replicas=5 -n ai-finance-agency

# Check resource metrics
kubectl top pods -n ai-finance-agency
```

#### Database Performance

```bash
# Check database connections
kubectl exec -it <postgres-pod> -n ai-finance-agency -- psql -U ai_finance_user -d ai_finance_prod -c "SELECT count(*) FROM pg_stat_activity;"

# Monitor slow queries
kubectl logs <postgres-pod> -n ai-finance-agency | grep "slow query"
```

### Emergency Procedures

#### Complete Service Outage

```bash
# Scale to zero and back up
kubectl scale deployment/ai-finance-app --replicas=0 -n ai-finance-agency
kubectl scale deployment/ai-finance-app --replicas=3 -n ai-finance-agency

# Restart all pods
kubectl rollout restart deployment/ai-finance-app -n ai-finance-agency

# Check cluster health
kubectl get nodes
kubectl get pods --all-namespaces | grep -v Running
```

#### Data Recovery

```bash
# List available backups
kubectl get jobs -n ai-finance-agency | grep backup

# Restore from latest backup
kubectl create job emergency-restore-$(date +%s) --from=cronjob/database-backup -n ai-finance-agency

# Monitor restore process
kubectl logs -f job/emergency-restore-* -n ai-finance-agency
```

## Best Practices

### Deployment Best Practices

1. **Always test in staging first**
2. **Use infrastructure as code**
3. **Implement proper monitoring and alerting**
4. **Have a rollback plan ready**
5. **Document all changes**
6. **Use blue-green or canary deployments for critical updates**
7. **Regular backup and disaster recovery testing**

### Security Best Practices

1. **Use least-privilege access**
2. **Encrypt secrets at rest and in transit**
3. **Regular security scanning**
4. **Network segmentation**
5. **Audit logging**
6. **Regular certificate rotation**

### Monitoring Best Practices

1. **Monitor business metrics, not just system metrics**
2. **Set up meaningful alerts**
3. **Use distributed tracing**
4. **Log structured data**
5. **Regular review of metrics and dashboards**

---

For additional help or questions, please refer to the [Infrastructure Documentation](INFRASTRUCTURE.md) or contact the DevOps team.