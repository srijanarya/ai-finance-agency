# AI Finance Agency - Deployment Guide

## Overview

This guide covers the complete deployment and orchestration of the AI Finance Agency microservices platform using Docker Compose. The platform consists of 10 microservices, supporting infrastructure, and comprehensive monitoring.

## Architecture

### Microservices
- **api-gateway** (port 3000) - Entry point and request routing
- **user-management** (port 3002) - Authentication and user profiles  
- **trading** (port 3004) - Order management and execution
- **signals** (port 3003) - Trading signals generation
- **payment** (port 3001) - Transaction processing and billing
- **education** (port 3005) - Learning content and courses
- **market-data** (port 3008) - Real-time and historical market data
- **risk-management** (port 3007) - Risk assessment and monitoring
- **notification** (port 3006) - Email, SMS, push notifications
- **content-intelligence** (port 3009) - AI-powered content analysis

### Infrastructure
- **PostgreSQL** - Primary relational database
- **MongoDB** - Document storage for content
- **Redis** - Caching and session storage
- **RabbitMQ** - Message broker for inter-service communication
- **Consul** - Service discovery and configuration
- **Nginx** - Load balancer and reverse proxy

### Monitoring & Observability
- **Prometheus** - Metrics collection
- **Grafana** - Dashboards and visualization
- **Jaeger** - Distributed tracing
- **ELK Stack** - Centralized logging (Elasticsearch, Logstash, Kibana)

## Prerequisites

### System Requirements
- Docker Engine 20.10+
- Docker Compose 2.0+
- 8GB RAM minimum (16GB recommended for full stack)
- 50GB disk space for data and logs
- Linux/macOS (Windows with WSL2)

### Required Files
```bash
# Create these files from examples
cp .env.example .env
# Edit .env with your actual values

# Create required directories
make setup-dirs
```

## Quick Start

### 1. Development Environment
```bash
# One-command setup for development
make quick-start

# Or step by step:
make setup-dirs          # Create directories
make up-dev             # Start development services
make health-check       # Verify services are healthy
```

### 2. Production Environment
```bash
# Build and deploy production
make deploy

# Or step by step:
make setup-dirs
make build-prod
make up-prod
make health-check
```

### 3. Full Stack with Monitoring
```bash
# Development with monitoring
make up-full

# Production with monitoring and logging
make up-prod-logging
```

## Environment Configuration

### Profile-Based Deployment

The platform uses Docker Compose profiles to control which services are started:

| Profile | Services | Use Case |
|---------|----------|----------|
| `infrastructure` | PostgreSQL, Redis, RabbitMQ, MongoDB, Consul | Core infrastructure only |
| `microservices` | All 10 microservices | Application services |
| `monitoring` | Prometheus, Grafana, Jaeger | Observability stack |
| `logging` | Elasticsearch, Logstash, Kibana | Centralized logging |
| `development` | Development overrides | Hot reloading, debugging |
| `production` | Production optimizations | Scaling, resource limits |

### Custom Profile Usage
```bash
# Start specific profiles
docker-compose --profile infrastructure --profile microservices up -d

# Multiple environments
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile production up -d
```

## Deployment Scenarios

### Scenario 1: Local Development
```bash
# Start infrastructure + microservices for development
make up-dev

# With monitoring
make up-full

# Individual service debugging
make logs-service SERVICE=api-gateway
make shell SERVICE=trading
```

### Scenario 2: Staging Environment
```bash
# Infrastructure first
make up-infrastructure

# Then microservices
docker-compose --profile microservices up -d

# Add monitoring
docker-compose --profile monitoring up -d
```

### Scenario 3: Production Deployment
```bash
# Full production stack
make up-prod

# With comprehensive monitoring
make up-prod-logging

# Health verification
make health-check
```

### Scenario 4: Scaled Production
```bash
# Use production compose file with scaling
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale api-gateway=3 --scale trading=3 --scale market-data=2
```

## Service Management

### Starting/Stopping Services
```bash
# Start all services
make up-dev

# Stop all services
make down

# Restart specific service
make restart-service SERVICE=api-gateway

# Stop and remove volumes (WARNING: Data loss!)
make down-volumes
```

### Monitoring Services
```bash
# View all logs
make logs

# View specific service logs
make logs-service SERVICE=signals

# Show running services
make ps

# Show resource usage
make stats

# Health check all services
make health-check
```

## Database Operations

### Migrations
```bash
# Run database migrations
make db-migrate

# Reset database (WARNING: Deletes all data!)
make db-reset
```

### Backup/Restore
```bash
# Create backup
make backup-db

# Manual backup
docker-compose exec postgres pg_dumpall -U ai_finance_user > backup.sql

# Restore
docker-compose exec -T postgres psql -U ai_finance_user < backup.sql
```

## Network Architecture

### Internal Networking
- **ai_finance_network**: Main application network (172.20.0.0/16)
- Service discovery via Consul
- Internal DNS resolution between services
- Isolation from external networks

### Port Mapping
```yaml
# External access ports
API Gateway: 3000
Payment: 3001  
User Management: 3002
Signals: 3003
Trading: 3004
Education: 3005
Notification: 3006
Risk Management: 3007
Market Data: 3008
Content Intelligence: 3009

# Infrastructure ports
PostgreSQL: 5432
Redis: 6379
RabbitMQ: 5672, 15672 (management)
MongoDB: 27017
Consul: 8500 (UI), 8600 (DNS)

# Monitoring ports
Prometheus: 9090
Grafana: 3001
Jaeger: 16686
Kibana: 5601
Elasticsearch: 9200
```

## Security Considerations

### Production Security
1. **Secrets Management**
   ```bash
   # Use strong passwords
   POSTGRES_PASSWORD=<strong-password>
   JWT_SECRET=<32-char-secret>
   ENCRYPTION_KEY=<32-char-key>
   ```

2. **Network Security**
   - Services communicate on internal network only
   - Only necessary ports exposed externally
   - Nginx terminates SSL/TLS

3. **Container Security**
   - Non-root users in containers
   - Resource limits enforced
   - Health checks implemented
   - Multi-stage builds for minimal attack surface

### SSL/TLS Setup
```bash
# Generate SSL certificates
mkdir -p infrastructure/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout infrastructure/nginx/ssl/nginx.key \
  -out infrastructure/nginx/ssl/nginx.crt
```

## Resource Management

### Memory and CPU Limits

Production resource allocation:
- **Critical Services** (Trading, Risk, Market Data): 768MB RAM, 1.0 CPU
- **Standard Services** (Gateway, Signals, Payment): 512MB RAM, 0.75 CPU  
- **Light Services** (User, Education, Notification): 384MB RAM, 0.5 CPU
- **Infrastructure**: PostgreSQL 1GB, Redis 512MB, RabbitMQ 512MB

### Scaling Guidelines
```bash
# Scale critical services
docker-compose up -d --scale trading=3 --scale market-data=2

# Monitor resource usage
docker stats

# Adjust resources in docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '1.0'
```

## Monitoring and Alerting

### Metrics Collection
- **Prometheus** scrapes metrics from all services
- **Node Exporter** for system metrics
- **Service-specific metrics** via /metrics endpoints

### Dashboards
- **Grafana** provides pre-configured dashboards
- Service health overview
- Resource utilization
- Business metrics (trades, users, revenue)

### Distributed Tracing
- **Jaeger** tracks requests across services
- Automatic trace correlation
- Performance bottleneck identification

### Log Aggregation
- **ELK Stack** centralizes all service logs
- Structured logging with JSON format
- Log retention and rotation policies

## Troubleshooting

### Common Issues

1. **Service Won't Start**
   ```bash
   # Check logs
   make logs-service SERVICE=<service-name>
   
   # Check health
   docker-compose ps
   
   # Verify dependencies
   docker-compose config
   ```

2. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   docker-compose exec postgres pg_isready -U ai_finance_user
   
   # Reset database connection
   make restart-service SERVICE=postgres
   ```

3. **Memory Issues**
   ```bash
   # Check resource usage
   docker stats
   
   # Increase memory limits in compose file
   # Restart affected services
   ```

4. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep <port>
   
   # Update port mapping in .env file
   # Restart services
   ```

### Health Check Endpoints

All services provide health check endpoints:
```bash
# Individual service health
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Payment
curl http://localhost:3002/health  # User Management
# ... etc for all services

# Automated health check
make health-check
```

### Log Analysis
```bash
# Search logs across all services
docker-compose logs | grep "ERROR"

# Service-specific error analysis  
make logs-service SERVICE=trading | grep "ERROR"

# Real-time log monitoring
make logs-service SERVICE=market-data
```

## Backup and Recovery

### Automated Backups
```bash
# Schedule daily database backups
# Add to crontab: 0 2 * * * cd /path/to/project && make backup-db

# Backup volumes
docker run --rm -v ai_finance_postgres_data:/data -v $(pwd)/backups:/backup busybox tar czf /backup/postgres_$(date +%Y%m%d).tar.gz /data
```

### Disaster Recovery
1. **Data Recovery**
   - Restore from latest database backup
   - Restore volume snapshots
   - Verify data integrity

2. **Service Recovery**
   - Redeploy from known-good configuration
   - Verify all health checks pass
   - Monitor for cascading failures

## Performance Optimization

### Development Performance
- Use volume mounts for hot reloading
- Enable debug logging
- Single-instance services

### Production Performance  
- Multi-instance critical services
- Resource limits and reservations
- Optimized Docker images
- Connection pooling
- Caching strategies

### Monitoring Performance
```bash
# Service response times
curl -w "@curl-format.txt" -s -o /dev/null http://localhost:3000/health

# Database performance
docker-compose exec postgres psql -U ai_finance_user -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

## Maintenance

### Regular Maintenance Tasks
```bash
# Weekly cleanup
make clean

# Update Docker images
docker-compose pull
docker-compose up -d

# Log rotation
find logs/ -name "*.log" -mtime +30 -delete

# Health check verification
make health-check
```

### Updates and Deployments
```bash
# Zero-downtime deployment
# 1. Deploy new version alongside current
# 2. Health check new version
# 3. Switch traffic via load balancer
# 4. Remove old version

# Rolling update for critical services
docker-compose up -d --no-deps trading
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy AI Finance Platform
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          make validate-config
          make build-prod
          make deploy
          make health-check
```

This deployment guide provides comprehensive coverage for running the AI Finance Agency platform in various environments with proper monitoring, security, and maintenance practices.