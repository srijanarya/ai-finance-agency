# Infrastructure Documentation

This document provides comprehensive information about the AI Finance Agency infrastructure setup, deployment procedures, and operational guidelines.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Infrastructure Components](#infrastructure-components)
- [Deployment Guide](#deployment-guide)
- [Monitoring and Observability](#monitoring-and-observability)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

## Overview

The AI Finance Agency infrastructure is designed as a cloud-native, microservices-based platform that provides:

- **High Availability**: Multi-replica deployments with automatic failover
- **Scalability**: Horizontal Pod Autoscaling based on resource utilization
- **Security**: Network policies, RBAC, and container security scanning
- **Observability**: Comprehensive monitoring, logging, and alerting
- **CI/CD**: Automated testing, building, and deployment pipelines

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │────│     Nginx       │────│   Application   │
│    (External)   │    │   (Ingress)     │    │     Pods        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                         │
                              │                         │
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Monitoring    │    │   Databases     │
                       │ (Prometheus/    │    │ (PostgreSQL/    │
                       │   Grafana)      │    │    Redis)       │
                       └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Container Platform**: Docker + Kubernetes
- **Web Server**: Nginx (Load Balancer & Reverse Proxy)
- **Application Runtime**: Python 3.11 + FastAPI/Flask
- **Databases**: PostgreSQL (primary), Redis (cache/queue)
- **Message Queue**: Celery + Redis
- **Monitoring**: Prometheus + Grafana + Alertmanager
- **Logging**: Loki (optional)
- **CI/CD**: GitHub Actions

## Infrastructure Components

### Docker Infrastructure

#### Multi-stage Dockerfile

The application uses a multi-stage Docker build process:

1. **Builder Stage**: Compiles dependencies and builds the application
2. **Runtime Stage**: Minimal production image with only runtime dependencies
3. **Development Stage**: Includes development tools for local development
4. **Testing Stage**: Includes testing frameworks for CI/CD

**Key Features**:
- Non-root user execution for security
- Optimized layer caching
- Health checks included
- Multi-architecture support (AMD64/ARM64)

#### Docker Compose

Two Docker Compose configurations are provided:

- `docker-compose.yml`: Development environment with hot reload
- `docker-compose.prod.yml`: Production-optimized with resource limits

### Kubernetes Infrastructure

#### Core Components

1. **Namespace**: Isolated environment for all resources
2. **RBAC**: Role-based access control for service accounts
3. **ConfigMaps**: Application configuration management
4. **Secrets**: Secure storage of sensitive data
5. **PersistentVolumes**: Data persistence for databases and logs

#### Application Deployment

- **Deployment**: 3 replicas with rolling update strategy
- **Services**: Internal load balancing and service discovery
- **Ingress**: External traffic routing with SSL termination
- **HPA**: Horizontal Pod Autoscaling (3-10 pods)

#### Supporting Services

- **PostgreSQL**: Primary database with persistence
- **Redis**: Cache and message broker
- **Nginx**: Load balancer and reverse proxy
- **Celery Workers**: Background task processing

### Load Balancing & Networking

#### Nginx Configuration

**Features**:
- SSL/TLS termination
- Rate limiting and DDoS protection
- Gzip compression
- Static file serving
- Health checks
- Request routing based on paths

**Rate Limiting Zones**:
- API endpoints: 100 req/s
- Authentication: 5 req/s
- File uploads: 1 req/s
- General traffic: 10 req/s

#### Ingress Controller

**Configuration**:
- HTTPS redirect enforcement
- Security headers injection
- CORS policy management
- Path-based routing
- Session affinity support

### Monitoring & Observability

#### Prometheus Metrics Collection

**Targets**:
- Application metrics (HTTP requests, response times, errors)
- System metrics (CPU, memory, disk, network)
- Database metrics (connections, query performance)
- Kubernetes metrics (pod status, resource utilization)

**Alerting Rules**:
- System alerts (high CPU/memory, disk space)
- Application alerts (high response time, error rate)
- Database alerts (connection issues, slow queries)
- Security alerts (failed logins, suspicious activity)

#### Grafana Dashboards

**Available Dashboards**:
- System Overview
- Application Performance
- Database Monitoring
- Business Metrics
- Security Dashboard

#### Log Management

**Log Aggregation**:
- Structured JSON logging
- Centralized log collection with Loki
- Log retention policies
- Search and filtering capabilities

### Auto-scaling

#### Horizontal Pod Autoscaler (HPA)

**Configuration**:
- Min replicas: 3
- Max replicas: 10
- Target CPU utilization: 70%
- Target memory utilization: 80%
- Scale-up policy: 100% increase every 60s
- Scale-down policy: 50% decrease every 60s

#### Vertical Pod Autoscaler (VPA)

**Optional Configuration**:
- Automatic resource recommendation
- Resource limit adjustment
- Memory and CPU optimization

## Deployment Guide

### Prerequisites

1. **Docker**: Version 20.10 or later
2. **Kubernetes**: Version 1.24 or later
3. **kubectl**: Configured for target cluster
4. **Helm**: Version 3.0 or later (optional)

### Local Development

```bash
# Clone repository
git clone <repository-url>
cd ai-finance-agency

# Start development environment
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Check services
docker-compose ps
```

### Build and Push Images

```bash
# Build production image
./infrastructure/scripts/build.sh -e production -t v1.0.0 -p

# Build with security scan
./infrastructure/scripts/build.sh -e production --scan -p
```

### Staging Deployment

```bash
# Deploy to staging
./infrastructure/scripts/deploy.sh -e staging -i v1.0.0

# Check deployment status
kubectl get pods -n ai-finance-agency
```

### Production Deployment

```bash
# Deploy to production with backup
./infrastructure/scripts/deploy.sh -e production -i v1.0.0 -w 600

# Monitor rollout
kubectl rollout status deployment/ai-finance-app -n ai-finance-agency
```

### Rollback Procedure

```bash
# Rollback to previous version
./infrastructure/scripts/deploy.sh --rollback -e production

# Check rollback status
kubectl rollout history deployment/ai-finance-app -n ai-finance-agency
```

## Monitoring and Observability

### Accessing Monitoring

#### Grafana Dashboard
- URL: `https://grafana.ai-finance-agency.com`
- Default credentials: admin/admin (change on first login)

#### Prometheus Metrics
- URL: `https://prometheus.ai-finance-agency.com`
- Query interface for custom metrics exploration

### Key Metrics to Monitor

#### Application Metrics
- Request rate and response time
- Error rate and success rate
- Active user sessions
- API endpoint performance

#### System Metrics
- CPU and memory utilization
- Disk space and I/O
- Network traffic and latency
- Pod restart count

#### Business Metrics
- User registrations and activity
- Content generation requests
- Social media post success rate
- Market data fetch performance

### Alert Management

#### Critical Alerts
- Service downtime
- Database connectivity issues
- High error rates (>5%)
- Resource exhaustion

#### Warning Alerts
- High resource utilization
- Slow response times
- Queue length increases
- SSL certificate expiration

### Log Analysis

#### Log Locations
- Application logs: `/app/logs/`
- System logs: Kubernetes events
- Access logs: Nginx logs
- Database logs: PostgreSQL logs

#### Common Log Queries
```bash
# View application logs
kubectl logs -f deployment/ai-finance-app -n ai-finance-agency

# View specific pod logs
kubectl logs <pod-name> -n ai-finance-agency

# View events
kubectl get events -n ai-finance-agency --sort-by=.metadata.creationTimestamp
```

## Security

### Security Measures

#### Container Security
- Non-root user execution
- Read-only root filesystem
- Security context enforcement
- Regular vulnerability scanning

#### Network Security
- Network policies for pod communication
- Ingress controller with WAF capabilities
- SSL/TLS encryption for all traffic
- Rate limiting and DDoS protection

#### Access Control
- RBAC for service accounts
- Namespace isolation
- Secret management with encryption
- Pod security policies/standards

#### Data Protection
- Encrypted data at rest
- Secure inter-service communication
- Regular security updates
- Backup encryption

### Security Monitoring

#### Security Events
- Failed authentication attempts
- Unauthorized access attempts
- Suspicious network activity
- Configuration changes

#### Compliance
- Regular security scans
- Vulnerability assessments
- Access auditing
- Compliance reporting

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check pod status
kubectl describe pod <pod-name> -n ai-finance-agency

# Check logs
kubectl logs <pod-name> -n ai-finance-agency

# Check resources
kubectl top pods -n ai-finance-agency
```

#### Database Connection Issues
```bash
# Test database connectivity
kubectl exec -it <app-pod> -n ai-finance-agency -- python -c "from config.enhanced_config import enhanced_config; print('DB Config:', enhanced_config.database)"

# Check PostgreSQL status
kubectl exec -it <postgres-pod> -n ai-finance-agency -- pg_isready
```

#### High CPU/Memory Usage
```bash
# Check resource usage
kubectl top pods -n ai-finance-agency

# Check HPA status
kubectl get hpa -n ai-finance-agency

# Scale manually if needed
kubectl scale deployment/ai-finance-app --replicas=5 -n ai-finance-agency
```

#### SSL Certificate Issues
```bash
# Check certificate expiration
kubectl get secrets -n ai-finance-agency
kubectl describe secret ai-finance-tls -n ai-finance-agency

# Check ingress status
kubectl describe ingress -n ai-finance-agency
```

### Debugging Commands

#### General Debugging
```bash
# Get all resources
kubectl get all -n ai-finance-agency

# Describe problematic resource
kubectl describe <resource-type>/<resource-name> -n ai-finance-agency

# Get events
kubectl get events --sort-by=.metadata.creationTimestamp -n ai-finance-agency
```

#### Network Debugging
```bash
# Test service connectivity
kubectl exec -it <pod> -n ai-finance-agency -- curl http://service-name:port/health

# Check DNS resolution
kubectl exec -it <pod> -n ai-finance-agency -- nslookup service-name
```

## Maintenance

### Regular Maintenance Tasks

#### Daily
- Monitor application health and performance
- Check error logs and alerts
- Verify backup completion
- Review resource utilization

#### Weekly
- Update container images with security patches
- Review and rotate secrets
- Clean up old logs and unused resources
- Performance optimization review

#### Monthly
- Update Kubernetes cluster
- Review and update monitoring dashboards
- Capacity planning assessment
- Security audit and penetration testing

### Backup and Recovery

#### Backup Strategy
- Database backups: Daily automated backups with 30-day retention
- Configuration backups: Weekly GitOps sync
- Persistent volume snapshots: Daily snapshots

#### Recovery Procedures
```bash
# Database recovery
kubectl create job restore-db-$(date +%s) --from=cronjob/database-restore -n ai-finance-agency

# Application rollback
kubectl rollout undo deployment/ai-finance-app -n ai-finance-agency

# Configuration restore
git revert <commit-hash>
kubectl apply -f infrastructure/kubernetes/
```

### Scaling Procedures

#### Manual Scaling
```bash
# Scale application
kubectl scale deployment/ai-finance-app --replicas=8 -n ai-finance-agency

# Scale workers
kubectl scale deployment/celery-worker --replicas=6 -n ai-finance-agency
```

#### Auto-scaling Configuration
```bash
# Update HPA settings
kubectl patch hpa ai-finance-app-hpa -n ai-finance-agency --patch '{"spec":{"maxReplicas":15}}'
```

### Performance Optimization

#### Application Optimization
- Enable connection pooling
- Implement caching strategies
- Optimize database queries
- Use CDN for static assets

#### Infrastructure Optimization
- Resource right-sizing
- Node auto-scaling
- Storage optimization
- Network optimization

## Support and Contact

For infrastructure-related issues:
- **Emergency**: On-call rotation via PagerDuty
- **General Issues**: Create GitHub issue or Slack #infrastructure
- **Documentation**: Update this document with any changes

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintained By**: DevOps Team