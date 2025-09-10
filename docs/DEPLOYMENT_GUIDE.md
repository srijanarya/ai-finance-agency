# TREUM AI Finance Agency - Production Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Deployment Strategies](#deployment-strategies)
4. [Production Deployment](#production-deployment)
5. [Monitoring & Alerting](#monitoring--alerting)
6. [Disaster Recovery](#disaster-recovery)
7. [Scaling Guidelines](#scaling-guidelines)
8. [Security Hardening](#security-hardening)

## Prerequisites

### Required Tools

- Kubernetes 1.25+
- Terraform 1.3+
- Helm 3.10+
- Docker 20.10+
- AWS CLI 2.9+
- kubectl 1.25+

### Cloud Resources Required

- AWS Account with appropriate IAM permissions
- Domain name with DNS management access
- SSL certificates (or use cert-manager)
- Container registry access

### Estimated Costs (AWS)

| Resource                  | Specification             | Monthly Cost   |
| ------------------------- | ------------------------- | -------------- |
| EKS Cluster               | 3 node groups             | $216           |
| EC2 Instances             | 6x t3.large               | $360           |
| RDS PostgreSQL            | db.t3.large Multi-AZ      | $145           |
| ElastiCache Redis         | cache.t3.medium (3 nodes) | $135           |
| Application Load Balancer | 1 ALB                     | $25            |
| S3 Storage                | 500GB                     | $12            |
| CloudFront CDN            | 100GB transfer            | $15            |
| **Total Estimated**       |                           | **$908/month** |

## Infrastructure Setup

### 1. AWS Infrastructure with Terraform

#### Initialize Terraform

```bash
cd infrastructure/terraform/aws
terraform init
terraform workspace new production
```

#### Configure Variables

Create `terraform.tfvars`:

```hcl
aws_region = "ap-south-1"
environment = "production"
project_name = "treum-ai-finance"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"
availability_zones = ["ap-south-1a", "ap-south-1b", "ap-south-1c"]

# EKS Configuration
eks_cluster_version = "1.28"
eks_node_groups = {
  general = {
    desired_size = 2
    min_size = 1
    max_size = 5
    instance_types = ["t3.large"]
  }
  compute = {
    desired_size = 2
    min_size = 1
    max_size = 10
    instance_types = ["c5.xlarge"]
  }
}

# Database Configuration
rds_instance_class = "db.t3.large"
rds_allocated_storage = 100
rds_multi_az = true

# Redis Configuration
redis_node_type = "cache.t3.medium"
redis_num_cache_nodes = 3

# Domain
domain_name = "treum.ai"
```

#### Deploy Infrastructure

```bash
# Plan deployment
terraform plan -out=tfplan

# Apply infrastructure
terraform apply tfplan

# Save outputs
terraform output -json > infrastructure-outputs.json
```

### 2. Kubernetes Cluster Setup

#### Configure kubectl

```bash
# Update kubeconfig
aws eks update-kubeconfig --region ap-south-1 --name treum-production

# Verify connection
kubectl get nodes
```

#### Install Essential Components

```bash
# Install metrics server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Install ingress controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer

# Install cert-manager for SSL
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

#### Create Namespaces and Secrets

```bash
# Create production namespace
kubectl create namespace treum-production

# Create image pull secret
kubectl create secret docker-registry regcred \
  --docker-server=registry.treum.ai \
  --docker-username=$REGISTRY_USER \
  --docker-password=$REGISTRY_PASSWORD \
  --docker-email=$REGISTRY_EMAIL \
  -n treum-production

# Create application secrets
kubectl create secret generic app-secrets \
  --from-literal=database-url=$DATABASE_URL \
  --from-literal=redis-url=$REDIS_URL \
  --from-literal=jwt-secret=$JWT_SECRET \
  --from-literal=openai-api-key=$OPENAI_API_KEY \
  --from-literal=stripe-secret-key=$STRIPE_SECRET_KEY \
  -n treum-production
```

## Deployment Strategies

### Blue-Green Deployment

#### Setup Blue Environment

```yaml
# k8s/blue-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-blue
  namespace: treum-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
      version: blue
  template:
    metadata:
      labels:
        app: api
        version: blue
    spec:
      containers:
        - name: api
          image: registry.treum.ai/api:v1.0.0
          ports:
            - containerPort: 8000
          env:
            - name: ENVIRONMENT
              value: "production"
          resources:
            requests:
              memory: "512Mi"
              cpu: "250m"
            limits:
              memory: "1Gi"
              cpu: "500m"
```

#### Deploy Green Version

```bash
# Deploy new version as green
kubectl apply -f k8s/green-deployment.yaml

# Wait for green to be ready
kubectl wait --for=condition=available --timeout=300s \
  deployment/api-green -n treum-production

# Switch traffic to green
kubectl patch service api-service -n treum-production \
  -p '{"spec":{"selector":{"version":"green"}}}'

# Delete blue deployment after verification
kubectl delete deployment api-blue -n treum-production
```

### Canary Deployment

```yaml
# k8s/canary-deployment.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: treum-production
spec:
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 8000

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-stable
  namespace: treum-production
spec:
  replicas: 9 # 90% traffic
  selector:
    matchLabels:
      app: api
      track: stable
  template:
    metadata:
      labels:
        app: api
        track: stable
    spec:
      containers:
        - name: api
          image: registry.treum.ai/api:v1.0.0

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-canary
  namespace: treum-production
spec:
  replicas: 1 # 10% traffic
  selector:
    matchLabels:
      app: api
      track: canary
  template:
    metadata:
      labels:
        app: api
        track: canary
    spec:
      containers:
        - name: api
          image: registry.treum.ai/api:v1.1.0
```

### Rolling Update

```bash
# Update deployment image
kubectl set image deployment/api-deployment \
  api=registry.treum.ai/api:v1.1.0 \
  -n treum-production

# Monitor rollout
kubectl rollout status deployment/api-deployment -n treum-production

# Rollback if needed
kubectl rollout undo deployment/api-deployment -n treum-production
```

## Production Deployment

### 1. Build and Push Images

```bash
# Build Python API
docker build -t registry.treum.ai/api:v1.0.0 -f Dockerfile.api .
docker push registry.treum.ai/api:v1.0.0

# Build Node.js services
docker build -t registry.treum.ai/api-gateway:v1.0.0 -f services/api-gateway/Dockerfile services/api-gateway
docker build -t registry.treum.ai/user-management:v1.0.0 -f services/user-management/Dockerfile services/user-management
docker build -t registry.treum.ai/trading:v1.0.0 -f services/trading/Dockerfile services/trading

# Push all images
docker push registry.treum.ai/api-gateway:v1.0.0
docker push registry.treum.ai/user-management:v1.0.0
docker push registry.treum.ai/trading:v1.0.0
```

### 2. Deploy Database Migrations

```bash
# Run database migrations
kubectl run migrations --image=registry.treum.ai/api:v1.0.0 \
  --rm -it --restart=Never \
  -n treum-production \
  -- alembic upgrade head
```

### 3. Deploy Applications

```bash
# Deploy all services
kubectl apply -f infrastructure/kubernetes/production/ -n treum-production

# Verify deployments
kubectl get deployments -n treum-production
kubectl get pods -n treum-production
kubectl get services -n treum-production
```

### 4. Configure DNS

```bash
# Get Load Balancer URL
kubectl get ingress treum-ingress -n treum-production

# Update Route53 records
aws route53 change-resource-record-sets \
  --hosted-zone-id $ZONE_ID \
  --change-batch file://dns-records.json
```

### 5. Verify Deployment

```bash
# Check health endpoints
curl https://api.treum.ai/health
curl https://api.treum.ai/api/v1/health

# Run smoke tests
python scripts/smoke_tests.py --env production

# Check logs
kubectl logs -f deployment/api-deployment -n treum-production
```

## Monitoring & Alerting

### 1. Install Prometheus & Grafana

```bash
# Add Prometheus helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.adminPassword=$GRAFANA_PASSWORD

# Port forward to access Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

### 2. Configure Application Metrics

```python
# app/monitoring.py
from prometheus_client import Counter, Histogram, Gauge
import time

# Metrics
request_count = Counter('api_requests_total', 'Total API requests', ['method', 'endpoint', 'status'])
request_duration = Histogram('api_request_duration_seconds', 'API request duration', ['method', 'endpoint'])
active_signals = Gauge('active_trading_signals', 'Number of active trading signals')

def track_request(method, endpoint, status, duration):
    request_count.labels(method=method, endpoint=endpoint, status=status).inc()
    request_duration.labels(method=method, endpoint=endpoint).observe(duration)
```

### 3. Setup Alerts

```yaml
# k8s/prometheus-alerts.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: api-alerts
  namespace: monitoring
spec:
  groups:
    - name: api.rules
      interval: 30s
      rules:
        - alert: HighErrorRate
          expr: rate(api_requests_total{status=~"5.."}[5m]) > 0.05
          for: 5m
          annotations:
            summary: "High error rate detected"
            description: "Error rate is {{ $value }} errors per second"

        - alert: HighLatency
          expr: histogram_quantile(0.95, rate(api_request_duration_seconds_bucket[5m])) > 1
          for: 5m
          annotations:
            summary: "High API latency"
            description: "95th percentile latency is {{ $value }} seconds"

        - alert: PodCrashLooping
          expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
          for: 5m
          annotations:
            summary: "Pod {{ $labels.pod }} is crash looping"
```

### 4. Setup Logging with ELK Stack

```bash
# Install Elasticsearch
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch \
  --namespace elastic \
  --create-namespace

# Install Kibana
helm install kibana elastic/kibana \
  --namespace elastic

# Install Filebeat
helm install filebeat elastic/filebeat \
  --namespace elastic \
  --set config.output.elasticsearch.hosts=["elasticsearch-master:9200"]
```

### 5. Application Performance Monitoring

```bash
# Install Datadog agent
helm repo add datadog https://helm.datadoghq.com
helm install datadog-agent datadog/datadog \
  --set datadog.apiKey=$DD_API_KEY \
  --set datadog.appKey=$DD_APP_KEY \
  --set datadog.logs.enabled=true \
  --set datadog.apm.enabled=true \
  --namespace monitoring
```

## Disaster Recovery

### 1. Backup Strategy

#### Database Backups

```bash
# Automated daily backups
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: treum-production
spec:
  schedule: "0 2 * * *"  # 2 AM daily
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: postgres-backup
            image: postgres:14
            command:
            - /bin/bash
            - -c
            - |
              DATE=\$(date +%Y%m%d_%H%M%S)
              pg_dump \$DATABASE_URL | gzip > /backup/db_\$DATE.sql.gz
              aws s3 cp /backup/db_\$DATE.sql.gz s3://treum-backups/postgres/
          restartPolicy: OnFailure
EOF
```

#### Application State Backup

```bash
# Backup Kubernetes resources
kubectl get all -n treum-production -o yaml > k8s-backup.yaml

# Backup persistent volumes
kubectl get pv -o yaml > pv-backup.yaml
kubectl get pvc -n treum-production -o yaml > pvc-backup.yaml
```

### 2. Restore Procedures

#### Database Restore

```bash
# Download latest backup
aws s3 cp s3://treum-backups/postgres/db_latest.sql.gz .

# Restore database
gunzip -c db_latest.sql.gz | psql $DATABASE_URL
```

#### Application Restore

```bash
# Restore Kubernetes resources
kubectl apply -f k8s-backup.yaml

# Restore persistent volumes
kubectl apply -f pv-backup.yaml
kubectl apply -f pvc-backup.yaml
```

### 3. Disaster Recovery Testing

```bash
# Monthly DR drill
./scripts/dr-drill.sh

# Verify backups
./scripts/verify-backups.sh

# Test restore procedures
./scripts/test-restore.sh
```

## Scaling Guidelines

### Horizontal Pod Autoscaling

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: treum-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-deployment
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 100
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
```

### Vertical Pod Autoscaling

```yaml
# k8s/vpa.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: api-vpa
  namespace: treum-production
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-deployment
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
      - containerName: api
        minAllowed:
          cpu: 250m
          memory: 512Mi
        maxAllowed:
          cpu: 2
          memory: 4Gi
```

### Cluster Autoscaling

```bash
# Enable cluster autoscaler
eksctl create iamserviceaccount \
  --cluster=treum-production \
  --namespace=kube-system \
  --name=cluster-autoscaler \
  --attach-policy-arn=arn:aws:iam::aws:policy/AutoScalingFullAccess \
  --override-existing-serviceaccounts \
  --approve

# Deploy cluster autoscaler
kubectl apply -f https://raw.githubusercontent.com/kubernetes/autoscaler/master/cluster-autoscaler/cloudprovider/aws/examples/cluster-autoscaler-autodiscover.yaml

# Configure for your cluster
kubectl -n kube-system annotate deployment.apps/cluster-autoscaler \
  cluster-autoscaler.kubernetes.io/safe-to-evict="false"
```

### Database Scaling

```bash
# Scale RDS instance
aws rds modify-db-instance \
  --db-instance-identifier treum-production \
  --db-instance-class db.r5.xlarge \
  --apply-immediately

# Add read replicas
aws rds create-db-instance-read-replica \
  --db-instance-identifier treum-production-read-1 \
  --source-db-instance-identifier treum-production
```

## Security Hardening

### 1. Network Policies

```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-network-policy
  namespace: treum-production
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: treum-production
        - podSelector:
            matchLabels:
              app: api-gateway
      ports:
        - protocol: TCP
          port: 8000
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: treum-production
      ports:
        - protocol: TCP
          port: 5432 # PostgreSQL
        - protocol: TCP
          port: 6379 # Redis
```

### 2. Pod Security Policies

```yaml
# k8s/pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: restricted
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - "configMap"
    - "emptyDir"
    - "projected"
    - "secret"
    - "persistentVolumeClaim"
  hostNetwork: false
  hostIPC: false
  hostPID: false
  runAsUser:
    rule: "MustRunAsNonRoot"
  seLinux:
    rule: "RunAsAny"
  fsGroup:
    rule: "RunAsAny"
  readOnlyRootFilesystem: true
```

### 3. RBAC Configuration

```yaml
# k8s/rbac.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: api-role
  namespace: treum-production
rules:
  - apiGroups: [""]
    resources: ["configmaps", "secrets"]
    verbs: ["get", "list"]
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: api-rolebinding
  namespace: treum-production
subjects:
  - kind: ServiceAccount
    name: api-service-account
    namespace: treum-production
roleRef:
  kind: Role
  name: api-role
  apiGroup: rbac.authorization.k8s.io
```

### 4. Secrets Management

```bash
# Use AWS Secrets Manager
aws secretsmanager create-secret \
  --name treum/production/api \
  --secret-string file://secrets.json

# Install Secrets Store CSI Driver
helm repo add secrets-store-csi-driver https://kubernetes-sigs.github.io/secrets-store-csi-driver/charts
helm install csi-secrets-store secrets-store-csi-driver/secrets-store-csi-driver \
  --namespace kube-system

# Configure SecretProviderClass
kubectl apply -f - <<EOF
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: aws-secrets
  namespace: treum-production
spec:
  provider: aws
  parameters:
    objects: |
      - objectName: "treum/production/api"
        objectType: "secretsmanager"
EOF
```

### 5. Security Scanning

```bash
# Scan container images
trivy image registry.treum.ai/api:v1.0.0

# Scan Kubernetes manifests
kubesec scan k8s/*.yaml

# Runtime security with Falco
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm install falco falcosecurity/falco \
  --namespace falco \
  --create-namespace
```

## Production Checklist

### Pre-Deployment

- [ ] All tests passing (unit, integration, e2e)
- [ ] Security scanning completed
- [ ] Load testing performed
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Backup systems verified

### Deployment

- [ ] Database backed up
- [ ] Maintenance window announced
- [ ] Feature flags configured
- [ ] Images pushed to registry
- [ ] Kubernetes manifests applied
- [ ] Health checks passing
- [ ] SSL certificates valid

### Post-Deployment

- [ ] Smoke tests passing
- [ ] Monitoring dashboard green
- [ ] Error rates normal
- [ ] Performance metrics acceptable
- [ ] User acceptance testing completed
- [ ] Documentation updated
- [ ] Team notified

## Troubleshooting

### Common Issues

#### Pods Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n treum-production

# Check logs
kubectl logs <pod-name> -n treum-production --previous

# Check events
kubectl get events -n treum-production --sort-by='.lastTimestamp'
```

#### High Memory Usage

```bash
# Check memory usage
kubectl top pods -n treum-production

# Get heap dump (Java services)
kubectl exec <pod-name> -n treum-production -- jmap -dump:format=b,file=/tmp/heap.bin 1

# Analyze Python memory
kubectl exec <pod-name> -n treum-production -- python -m memory_profiler
```

#### Database Connection Issues

```bash
# Test database connection
kubectl run -it --rm debug --image=postgres:14 --restart=Never -- psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
kubectl exec <pod-name> -n treum-production -- python -c "from app import db; print(db.engine.pool.status())"
```

#### Slow API Response

```bash
# Enable debug logging
kubectl set env deployment/api-deployment LOG_LEVEL=DEBUG -n treum-production

# Profile application
kubectl exec <pod-name> -n treum-production -- python -m cProfile -o profile.stats app.main

# Check database slow queries
kubectl exec postgres-0 -n treum-production -- psql -U postgres -c "SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10"
```

## Support

### Emergency Contacts

- **On-Call Engineer**: +91-XXX-XXX-XXXX
- **DevOps Lead**: devops-lead@treum.ai
- **Security Team**: security@treum.ai

### Escalation Matrix

1. L1 Support (0-15 mins): On-call engineer
2. L2 Support (15-30 mins): DevOps team lead
3. L3 Support (30+ mins): CTO/Engineering head

### Resources

- [Runbooks](https://docs.treum.ai/runbooks)
- [Architecture Docs](https://docs.treum.ai/architecture)
- [Monitoring Dashboard](https://grafana.treum.ai)
- [Status Page](https://status.treum.ai)

---

Last Updated: January 2025
Version: 1.0.0
