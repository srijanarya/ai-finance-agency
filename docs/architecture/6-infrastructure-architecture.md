# 6. Infrastructure Architecture

## 6.1 AWS Cloud Architecture - Multi-Region Setup

**Primary Architecture**:
```
┌─────────────────────────────────────────────────────────────────┐
│                       GLOBAL INFRASTRUCTURE                    │
├─────────────────────────────────────────────────────────────────┤
│  CloudFront CDN (Global Edge Locations)                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Static Assets + Video Content + API Caching               │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Route 53 DNS + Health Checks                                  │
├─────────────────────────────────────────────────────────────────┤
│  PRIMARY REGION (Mumbai - ap-south-1)                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ EKS Cluster (3 AZs)     │ RDS Multi-AZ │ ElastiCache       │ │
│  │ ┌─────┐ ┌─────┐ ┌─────┐ │ PostgreSQL   │ Redis Cluster     │ │
│  │ │ AZ-a│ │ AZ-b│ │ AZ-c│ │ + Read Rep   │ 6 Nodes           │ │
│  │ └─────┘ └─────┘ └─────┘ │              │                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  SECONDARY REGION (Singapore - ap-southeast-1)                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ EKS Standby Cluster     │ RDS Cross-    │ ElastiCache       │ │
│  │ Auto-scaling disabled   │ Region Replica│ Backup Cluster    │ │
│  │ 30% capacity baseline  │ Read-only     │ Cold standby      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Regional Distribution Strategy**:
```yaml
Primary Region (Mumbai):
  - 80% traffic handling capacity
  - All write operations
  - Real-time signal processing
  - Primary database masters
  
Secondary Region (Singapore):
  - 20% read traffic (Asian markets)
  - Disaster recovery hot standby
  - Read replicas for reporting
  - Backup processing systems

Edge Locations:
  - Content delivery (video courses)
  - API response caching
  - Static asset distribution
  - Real-time signal edge caching
```

## 6.2 Kubernetes Orchestration Design

**EKS Cluster Configuration**:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-config
data:
  cluster-spec: |
    EKS Version: 1.28
    Node Groups:
      - name: system-nodes
        instance_types: [m6i.large, m6i.xlarge]
        min_size: 3
        max_size: 10
        desired_size: 6
        
      - name: application-nodes
        instance_types: [c6i.xlarge, c6i.2xlarge]
        min_size: 5
        max_size: 50
        desired_size: 15
        
      - name: ml-nodes
        instance_types: [p3.2xlarge, g4dn.xlarge]
        min_size: 0
        max_size: 10
        desired_size: 2
        
    Networking:
      vpc_cidr: 10.0.0.0/16
      private_subnets: 
        - 10.0.1.0/24  # AZ-a
        - 10.0.2.0/24  # AZ-b
        - 10.0.3.0/24  # AZ-c
      public_subnets:
        - 10.0.101.0/24  # NAT Gateway AZ-a
        - 10.0.102.0/24  # NAT Gateway AZ-b
        - 10.0.103.0/24  # NAT Gateway AZ-c
```

**Service Mesh Architecture (Istio)**:
```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  name: treum-mesh
spec:
  components:
    pilot:
      k8s:
        resources:
          requests:
            cpu: 500m
            memory: 2Gi
    ingressGateways:
    - name: treum-gateway
      enabled: true
      k8s:
        service:
          type: LoadBalancer
          annotations:
            service.beta.kubernetes.io/aws-load-balancer-type: nlb
            service.beta.kubernetes.io/aws-load-balancer-cross-zone-load-balancing-enabled: "true"
  values:
    global:
      meshID: treum-mesh
      network: treum-network
```

## 6.3 CI/CD Pipeline with GitOps

**GitOps Architecture**:
```
┌─────────────────────────────────────────────────────────────────┐
│                       CI/CD PIPELINE                           │
├─────────────────────────────────────────────────────────────────┤
│  Developer Workflow                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Git Push  │─▶│GitHub Actions│─▶│Docker Build │             │
│  │   Feature   │  │   Triggers   │  │ & Security  │             │
│  │   Branch    │  │              │  │   Scan      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  Continuous Integration                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │Unit Tests   │─▶│Integration  │─▶│ E2E Tests   │             │
│  │Jest + Mocha │  │Tests + API  │  │ Playwright  │             │
│  │   > 90%     │  │  Testing    │  │  + Cypress  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  Container Registry & Security                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   AWS ECR   │─▶│  Trivy Scan │─▶│   Harbor    │             │
│  │Multi-arch   │  │Security +   │  │  Registry   │             │
│  │  Images     │  │Vulnerability│  │   Proxy     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  GitOps Deployment                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  ArgoCD     │─▶│Config Repo  │─▶│ Kubernetes  │             │
│  │Sync & Deploy│  │ Git Source  │  │  Cluster    │             │
│  │             │  │ of Truth    │  │ Application │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

**GitHub Actions Workflow**:
```yaml
name: TREUM CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Security audit
        run: npm audit --audit-level high
      
      - name: SAST scan
        uses: github/codeql-action/analyze@v2

  build-and-deploy:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1
      
      - name: Build Docker image
        run: |
          docker build -t treum-service:${{ github.sha }} .
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
          docker tag treum-service:${{ github.sha }} $ECR_REGISTRY/treum-service:${{ github.sha }}
          docker push $ECR_REGISTRY/treum-service:${{ github.sha }}
      
      - name: Update GitOps repo
        run: |
          git clone https://github.com/treum/k8s-configs.git
          cd k8s-configs
          yq e '.spec.template.spec.containers[0].image = "'$ECR_REGISTRY'/treum-service:'${{ github.sha }}'"' -i overlays/production/deployment.yaml
          git commit -am "Update image to ${{ github.sha }}"
          git push
```

## 6.4 Auto-scaling Strategies

**Horizontal Pod Autoscaler (HPA)**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: treum-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: treum-api
  minReplicas: 5
  maxReplicas: 100
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
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

**Vertical Pod Autoscaler (VPA)**:
```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: treum-ml-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: treum-ml-service
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: ml-container
      minAllowed:
        cpu: 100m
        memory: 512Mi
      maxAllowed:
        cpu: 8
        memory: 16Gi
      controlledResources: ["cpu", "memory"]
```

**Cluster Autoscaler Configuration**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  template:
    spec:
      containers:
      - image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.28.0
        name: cluster-autoscaler
        command:
        - ./cluster-autoscaler
        - --v=4
        - --stderrthreshold=info
        - --cloud-provider=aws
        - --skip-nodes-with-local-storage=false
        - --expander=least-waste
        - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/treum-cluster
        - --balance-similar-node-groups
        - --scale-down-delay-after-add=10m
        - --scale-down-unneeded-time=10m
        - --max-node-provision-time=15m
```

## 6.5 Cost Optimization for ₹600 Cr Scale

**Resource Optimization Strategy**:
```yaml
Cost Management:
  Compute Optimization:
    - Spot instances: 40% of workload (batch processing)
    - Reserved instances: 60% baseline capacity (1-year term)
    - Graviton processors: 20% cost reduction for compatible workloads
    
  Storage Optimization:
    - S3 Intelligent Tiering: Automatic cost optimization
    - EBS GP3: 20% cost reduction vs GP2
    - Lifecycle policies: 90-day archive to Glacier
    
  Network Optimization:
    - VPC endpoints: Reduce data transfer costs
    - CloudFront caching: 80% cache hit ratio target
    - Cross-region replication: Only critical data

  Database Optimization:
    - RDS Reserved instances: 60% cost reduction
    - Read replicas: Scale reads without master load
    - Automated backups: 7-day retention, cross-region
    
  Monitoring & Alerts:
    - AWS Cost Explorer: Daily cost tracking
    - Budget alerts: 80%, 90%, 100% thresholds
    - Resource tagging: Cost allocation by service/team
```

**Estimated Monthly Infrastructure Costs**:
```yaml
Production Environment (₹600 Cr scale):
  Compute (EKS + EC2):
    - Reserved instances: ₹8,50,000/month
    - Spot instances: ₹3,20,000/month
    - Load balancers: ₹1,80,000/month
    
  Storage:
    - RDS PostgreSQL: ₹6,40,000/month
    - ElastiCache Redis: ₹2,80,000/month
    - S3 + CloudFront: ₹4,50,000/month
    
  Networking:
    - Data transfer: ₹5,60,000/month
    - NAT Gateways: ₹1,20,000/month
    - Route 53: ₹80,000/month
    
  Additional Services:
    - Monitoring: ₹1,40,000/month
    - Security: ₹2,20,000/month
    - Backup: ₹1,80,000/month
    
  Total: ₹40,20,000/month (~₹4.8 Cr/year)
  Revenue ratio: 0.8% of ₹600 Cr revenue
```

---
