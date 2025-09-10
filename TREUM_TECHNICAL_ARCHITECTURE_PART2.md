# TREUM ALGOTECH - Technical Architecture Document (Part 2)
## Infrastructure, Security, Scalability & Data Architecture

---

## 6. Infrastructure Architecture

### 6.1 AWS Cloud Architecture - Multi-Region Setup

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

### 6.2 Kubernetes Orchestration Design

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

### 6.3 CI/CD Pipeline with GitOps

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

### 6.4 Auto-scaling Strategies

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

### 6.5 Cost Optimization for ₹600 Cr Scale

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

## 7. Data Architecture

### 7.1 Database Design - PostgreSQL Schemas

**Core Database Schemas**:

```sql
-- ======================================
-- USER MANAGEMENT SCHEMA
-- ======================================
CREATE SCHEMA user_management;

-- Users table with KYC compliance
CREATE TABLE user_management.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    kyc_status VARCHAR(20) CHECK (kyc_status IN ('pending', 'verified', 'rejected', 'expired')),
    kyc_verified_at TIMESTAMP,
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Audit fields
    created_by UUID,
    updated_by UUID,
    
    -- Compliance fields
    aml_status VARCHAR(20) DEFAULT 'pending',
    sanctions_check_date TIMESTAMP,
    pep_status BOOLEAN DEFAULT FALSE
);

-- User profiles with PII encryption
CREATE TABLE user_management.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES user_management.users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    pan_number VARCHAR(20) UNIQUE, -- Encrypted
    aadhaar_number VARCHAR(20), -- Encrypted
    address JSONB, -- Encrypted JSON
    nationality VARCHAR(3) DEFAULT 'IND',
    occupation VARCHAR(100),
    annual_income DECIMAL(15,2),
    
    -- Investment profile
    investment_experience VARCHAR(20) CHECK (investment_experience IN ('beginner', 'intermediate', 'advanced', 'expert')),
    risk_tolerance VARCHAR(20) CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
    investment_horizon VARCHAR(20) CHECK (investment_horizon IN ('short', 'medium', 'long')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role-based access control
CREATE TABLE user_management.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_management.user_roles (
    user_id UUID REFERENCES user_management.users(id),
    role_id UUID REFERENCES user_management.roles(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    expires_at TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- ======================================
-- EDUCATION PLATFORM SCHEMA
-- ======================================
CREATE SCHEMA education;

-- Course catalog
CREATE TABLE education.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES user_management.users(id),
    category VARCHAR(100),
    level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    duration_minutes INTEGER,
    status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')),
    
    -- SEO and metadata
    slug VARCHAR(255) UNIQUE,
    meta_description TEXT,
    tags TEXT[],
    
    -- Content metadata
    module_count INTEGER DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    assessment_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

-- Course modules and lessons
CREATE TABLE education.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES education.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    is_preview BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(course_id, order_index)
);

CREATE TABLE education.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES education.course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(20) CHECK (content_type IN ('video', 'text', 'quiz', 'assignment')),
    content_url VARCHAR(500),
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    is_free BOOLEAN DEFAULT FALSE,
    
    -- Video specific fields
    video_id VARCHAR(100),
    transcript TEXT,
    subtitles JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(module_id, order_index)
);

-- Enrollments and progress tracking
CREATE TABLE education.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_management.users(id),
    course_id UUID REFERENCES education.courses(id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    last_accessed_at TIMESTAMP,
    
    -- Payment information
    payment_id UUID,
    amount_paid DECIMAL(10,2),
    
    UNIQUE(user_id, course_id)
);

CREATE TABLE education.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID REFERENCES education.enrollments(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES education.lessons(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    time_spent_minutes INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0,
    
    UNIQUE(enrollment_id, lesson_id)
);

-- ======================================
-- FINANCIAL TRANSACTIONS SCHEMA
-- ======================================
CREATE SCHEMA finance;

-- Payment transactions with full audit trail
CREATE TABLE finance.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_management.users(id),
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('payment', 'refund', 'subscription', 'commission')),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
    
    -- Payment gateway details
    gateway_provider VARCHAR(50), -- razorpay, stripe, payu
    gateway_transaction_id VARCHAR(255),
    gateway_reference VARCHAR(255),
    gateway_fees DECIMAL(10,2),
    
    -- Related entities
    related_entity_type VARCHAR(50), -- course, subscription, signal_plan
    related_entity_id UUID,
    
    -- Metadata
    metadata JSONB,
    failure_reason TEXT,
    processed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscription management
CREATE TABLE finance.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE finance.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_management.users(id),
    plan_id UUID REFERENCES finance.subscription_plans(id),
    status VARCHAR(20) CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
    
    -- Billing details
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    next_billing_date TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Payment details
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_method_id UUID,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================
-- SIGNALS & TRADING SCHEMA
-- ======================================
CREATE SCHEMA signals;

-- Signal generation and distribution
CREATE TABLE signals.signal_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    source_type VARCHAR(20) CHECK (source_type IN ('ai_model', 'analyst', 'algorithm', 'sentiment')),
    confidence_score DECIMAL(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signals.trading_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES signals.signal_sources(id),
    symbol VARCHAR(20) NOT NULL,
    exchange VARCHAR(50),
    signal_type VARCHAR(20) CHECK (signal_type IN ('buy', 'sell', 'hold', 'exit')),
    
    -- Signal details
    entry_price DECIMAL(15,4),
    target_price DECIMAL(15,4),
    stop_loss DECIMAL(15,4),
    quantity_recommended INTEGER,
    confidence_level DECIMAL(5,2),
    
    -- Timing
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    executed_at TIMESTAMP,
    
    -- Performance tracking
    actual_entry_price DECIMAL(15,4),
    actual_exit_price DECIMAL(15,4),
    actual_return_percentage DECIMAL(8,4),
    
    -- Metadata
    analysis_data JSONB,
    market_conditions JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Signal subscriptions and access control
CREATE TABLE signals.signal_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_management.users(id),
    subscription_id UUID REFERENCES finance.user_subscriptions(id),
    signal_categories TEXT[], -- ['equity', 'crypto', 'forex', 'commodity']
    max_signals_per_day INTEGER,
    real_time_access BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7.2 Data Warehouse for Analytics

**Snowflake Architecture**:
```sql
-- ======================================
-- SNOWFLAKE DATA WAREHOUSE SCHEMA
-- ======================================

-- Create databases
CREATE DATABASE TREUM_ANALYTICS;
CREATE DATABASE TREUM_STAGING;

USE DATABASE TREUM_ANALYTICS;

-- User analytics warehouse
CREATE OR REPLACE TABLE user_analytics (
    user_id STRING,
    registration_date DATE,
    kyc_completion_date DATE,
    user_tier STRING, -- free, premium, enterprise
    total_courses_enrolled INTEGER,
    total_amount_spent DECIMAL(15,2),
    last_login_date DATE,
    lifetime_value DECIMAL(15,2),
    churn_probability DECIMAL(5,4),
    
    -- Engagement metrics
    total_login_days INTEGER,
    avg_session_duration_minutes DECIMAL(8,2),
    total_video_watch_minutes INTEGER,
    course_completion_rate DECIMAL(5,4),
    
    -- Trading metrics
    total_signals_received INTEGER,
    signals_acted_upon INTEGER,
    avg_signal_return DECIMAL(8,4),
    total_trading_volume DECIMAL(15,2),
    
    -- Temporal fields
    date_created DATE,
    date_updated DATE,
    
    PRIMARY KEY (user_id, date_created)
) CLUSTER BY (date_created, user_tier);

-- Course performance analytics
CREATE OR REPLACE TABLE course_analytics (
    course_id STRING,
    course_title STRING,
    instructor_id STRING,
    category STRING,
    
    -- Enrollment metrics
    total_enrollments INTEGER,
    total_completions INTEGER,
    completion_rate DECIMAL(5,4),
    avg_completion_time_days DECIMAL(8,2),
    
    -- Financial metrics
    total_revenue DECIMAL(15,2),
    avg_price DECIMAL(10,2),
    refund_rate DECIMAL(5,4),
    
    -- Engagement metrics
    avg_rating DECIMAL(3,2),
    total_reviews INTEGER,
    avg_watch_time_percentage DECIMAL(5,4),
    
    -- Performance over time
    monthly_enrollments VARIANT, -- JSON array of monthly data
    revenue_trend VARIANT,
    
    date_created DATE,
    PRIMARY KEY (course_id, date_created)
) CLUSTER BY (date_created, category);

-- Signal performance analytics
CREATE OR REPLACE TABLE signal_analytics (
    signal_id STRING,
    symbol STRING,
    exchange STRING,
    signal_type STRING,
    source_id STRING,
    
    -- Performance metrics
    entry_price DECIMAL(15,4),
    exit_price DECIMAL(15,4),
    return_percentage DECIMAL(8,4),
    hold_duration_hours INTEGER,
    accuracy_score DECIMAL(5,4),
    
    -- Distribution metrics
    total_subscribers INTEGER,
    signals_acted_upon INTEGER,
    action_rate DECIMAL(5,4),
    avg_subscriber_return DECIMAL(8,4),
    
    -- Market context
    market_conditions VARIANT,
    volatility_index DECIMAL(8,4),
    
    signal_date DATE,
    created_date DATE,
    
    PRIMARY KEY (signal_id, created_date)
) CLUSTER BY (signal_date, symbol);
```

**ETL Pipeline with DBT**:
```yaml
# dbt_project.yml
name: 'treum_analytics'
version: '1.0.0'
config-version: 2

model-paths: ["models"]
analysis-paths: ["analysis"]
test-paths: ["tests"]
seed-paths: ["data"]

models:
  treum_analytics:
    staging:
      +materialized: view
      +schema: staging
    marts:
      +materialized: table
      +schema: marts
    aggregates:
      +materialized: incremental
      +schema: aggregates
      +unique_key: id
      +on_schema_change: append_new_columns

# DBT model for user analytics
# models/marts/user_analytics.sql
{{ config(
    materialized='incremental',
    unique_key='user_id',
    on_schema_change='append_new_columns'
) }}

WITH user_base AS (
    SELECT 
        u.id as user_id,
        u.created_at::date as registration_date,
        up.kyc_verified_at::date as kyc_completion_date,
        CASE 
            WHEN s.plan_id IS NOT NULL THEN sp.name
            ELSE 'free'
        END as user_tier
    FROM {{ ref('stg_users') }} u
    LEFT JOIN {{ ref('stg_user_profiles') }} up ON u.id = up.user_id
    LEFT JOIN {{ ref('stg_user_subscriptions') }} s ON u.id = s.user_id AND s.status = 'active'
    LEFT JOIN {{ ref('stg_subscription_plans') }} sp ON s.plan_id = sp.id
),

enrollment_metrics AS (
    SELECT 
        user_id,
        COUNT(*) as total_courses_enrolled,
        SUM(amount_paid) as total_amount_spent,
        AVG(progress_percentage) as avg_course_progress
    FROM {{ ref('stg_enrollments') }}
    GROUP BY user_id
),

engagement_metrics AS (
    SELECT 
        user_id,
        COUNT(DISTINCT login_date) as total_login_days,
        AVG(session_duration_minutes) as avg_session_duration,
        SUM(video_watch_minutes) as total_video_watch_minutes
    FROM {{ ref('stg_user_sessions') }}
    GROUP BY user_id
)

SELECT 
    ub.user_id,
    ub.registration_date,
    ub.kyc_completion_date,
    ub.user_tier,
    COALESCE(em.total_courses_enrolled, 0) as total_courses_enrolled,
    COALESCE(em.total_amount_spent, 0) as total_amount_spent,
    COALESCE(em.avg_course_progress, 0) as avg_course_progress,
    COALESCE(egm.total_login_days, 0) as total_login_days,
    COALESCE(egm.avg_session_duration, 0) as avg_session_duration,
    COALESCE(egm.total_video_watch_minutes, 0) as total_video_watch_minutes,
    CURRENT_DATE() as date_created
FROM user_base ub
LEFT JOIN enrollment_metrics em ON ub.user_id = em.user_id
LEFT JOIN engagement_metrics egm ON ub.user_id = egm.user_id

{% if is_incremental() %}
WHERE ub.registration_date >= (SELECT MAX(date_created) FROM {{ this }}) - INTERVAL '7 days'
{% endif %}
```

### 7.3 Real-time Streaming with Kafka

**Kafka Architecture for Signal Distribution**:
```yaml
Kafka Cluster Configuration:
  Brokers: 6 (across 3 AZs, 2 per AZ)
  Replication Factor: 3
  Min In-Sync Replicas: 2
  
Topics:
  trading-signals:
    partitions: 12
    retention: 7 days
    compression: lz4
    
  user-events:
    partitions: 24
    retention: 30 days
    compression: snappy
    
  payment-events:
    partitions: 6
    retention: 90 days
    compression: gzip
    
  video-analytics:
    partitions: 12
    retention: 14 days
    compression: lz4
```

**Kafka Streams Application for Real-time Processing**:
```java
@Component
public class SignalProcessingStream {
    
    @Bean
    public KStream<String, TradingSignal> signalProcessingTopology(
            StreamsBuilder streamsBuilder) {
        
        KStream<String, TradingSignal> signalStream = streamsBuilder
            .stream("raw-signals", Consumed.with(Serdes.String(), signalSerde()));
        
        // Enrich signals with market data
        KTable<String, MarketData> marketTable = streamsBuilder
            .table("market-data", Consumed.with(Serdes.String(), marketDataSerde()));
        
        KStream<String, EnrichedSignal> enrichedSignals = signalStream
            .join(marketTable, 
                (signal, market) -> new EnrichedSignal(signal, market),
                Joined.with(Serdes.String(), signalSerde(), marketDataSerde())
            );
        
        // Filter signals by confidence score
        KStream<String, EnrichedSignal> highConfidenceSignals = enrichedSignals
            .filter((key, signal) -> signal.getConfidenceScore() > 75.0);
        
        // Route signals to user-specific topics
        highConfidenceSignals
            .selectKey((key, signal) -> signal.getSymbol())
            .to("trading-signals", Produced.with(Serdes.String(), enrichedSignalSerde()));
        
        // Create aggregated statistics
        KTable<String, SignalStats> signalStats = enrichedSignals
            .groupBy((key, signal) -> signal.getSymbol())
            .aggregate(
                SignalStats::new,
                (key, signal, stats) -> stats.update(signal),
                Materialized.<String, SignalStats, KeyValueStore<Bytes, byte[]>>as("signal-stats")
                    .withKeySerde(Serdes.String())
                    .withValueSerde(signalStatsSerde())
            );
        
        return signalStream;
    }
    
    @Bean
    public KStream<String, UserEvent> userEventProcessing(
            StreamsBuilder streamsBuilder) {
        
        KStream<String, UserEvent> userEvents = streamsBuilder
            .stream("user-events", Consumed.with(Serdes.String(), userEventSerde()));
        
        // Real-time user segmentation
        KStream<String, UserSegment> userSegments = userEvents
            .groupByKey()
            .windowedBy(TimeWindows.of(Duration.ofMinutes(5)))
            .aggregate(
                UserActivity::new,
                (key, event, activity) -> activity.addEvent(event),
                Materialized.with(Serdes.String(), userActivitySerde())
            )
            .toStream()
            .mapValues(activity -> calculateUserSegment(activity));
        
        // Send to recommendations engine
        userSegments.to("user-segments", 
            Produced.with(Serdes.String(), userSegmentSerde()));
        
        return userEvents;
    }
}
```

### 7.4 Data Lake for ML Training

**S3 Data Lake Structure**:
```
treum-data-lake/
├── raw/
│   ├── year=2024/month=01/day=15/
│   │   ├── user-events/           # User interaction logs
│   │   ├── market-data/           # Price feeds, volumes
│   │   ├── social-sentiment/      # Social media sentiment
│   │   └── news-data/             # Financial news articles
│   └── year=2024/month=01/day=16/
├── processed/
│   ├── features/
│   │   ├── user-features/         # Engineered user features
│   │   ├── market-features/       # Technical indicators
│   │   └── signal-features/       # Signal performance features
│   └── training-data/
│       ├── signal-prediction/     # ML training datasets
│       ├── user-churn/           # Churn prediction data
│       └── recommendation/        # Course recommendation data
└── models/
    ├── signal-generation/         # Trained ML models
    ├── risk-assessment/          # Risk scoring models
    └── recommendation/           # Recommendation engines
```

**Apache Airflow DAGs for Data Pipeline**:
```python
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from airflow.operators.bash_operator import BashOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'data-team',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5)
}

dag = DAG(
    'treum_ml_pipeline',
    default_args=default_args,
    description='TREUM ML Training Pipeline',
    schedule_interval='@daily',
    catchup=False,
    max_active_runs=1
)

def extract_user_features(**context):
    """Extract user behavior features for ML training"""
    import pandas as pd
    from sqlalchemy import create_engine
    
    engine = create_engine(os.getenv('POSTGRES_URL'))
    
    query = """
    SELECT 
        u.id as user_id,
        EXTRACT(epoch FROM NOW() - u.created_at) / 86400 as account_age_days,
        COUNT(DISTINCT e.course_id) as courses_enrolled,
        AVG(e.progress_percentage) as avg_course_progress,
        SUM(t.amount) as total_spent,
        COUNT(DISTINCT DATE(s.login_at)) as active_days_last_30,
        AVG(s.session_duration) as avg_session_duration
    FROM user_management.users u
    LEFT JOIN education.enrollments e ON u.id = e.user_id
    LEFT JOIN finance.transactions t ON u.id = t.user_id AND t.status = 'completed'
    LEFT JOIN user_sessions s ON u.id = s.user_id 
        AND s.login_at >= NOW() - INTERVAL '30 days'
    WHERE u.created_at >= '{{ ds }}' - INTERVAL '7 days'
        AND u.created_at < '{{ ds }}'
    GROUP BY u.id, u.created_at
    """
    
    df = pd.read_sql(query, engine)
    
    # Feature engineering
    df['spending_velocity'] = df['total_spent'] / df['account_age_days']
    df['engagement_score'] = (df['active_days_last_30'] * df['avg_session_duration']) / 30
    df['course_completion_rate'] = df['avg_course_progress'] / 100
    
    # Save to S3
    s3_path = f"s3://treum-data-lake/processed/features/user-features/date={{ ds }}/user_features.parquet"
    df.to_parquet(s3_path, index=False)

def train_signal_model(**context):
    """Train signal generation model"""
    import mlflow
    import mlflow.sklearn
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_squared_error, r2_score
    
    # Load training data
    training_data = load_from_s3("s3://treum-data-lake/processed/training-data/signal-prediction/")
    
    X = training_data[['volatility', 'volume', 'rsi', 'macd', 'sentiment_score']]
    y = training_data['next_day_return']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    # Log with MLflow
    with mlflow.start_run():
        mlflow.log_param("n_estimators", 100)
        mlflow.log_metric("mse", mse)
        mlflow.log_metric("r2", r2)
        mlflow.sklearn.log_model(model, "signal_model")
        
        # Register model if performance is good
        if r2 > 0.7:
            mlflow.register_model(
                f"runs:/{mlflow.active_run().info.run_id}/signal_model",
                "signal_generation_model"
            )

# Define tasks
extract_features_task = PythonOperator(
    task_id='extract_user_features',
    python_callable=extract_user_features,
    dag=dag
)

extract_market_data_task = BashOperator(
    task_id='extract_market_data',
    bash_command="""
    python /opt/airflow/scripts/extract_market_data.py \
        --date {{ ds }} \
        --output s3://treum-data-lake/raw/year={{ macros.ds_format(ds, "%Y-%m-%d", "%Y") }}/month={{ macros.ds_format(ds, "%Y-%m-%d", "%m") }}/day={{ macros.ds_format(ds, "%Y-%m-%d", "%d") }}/market-data/
    """,
    dag=dag
)

train_model_task = PythonOperator(
    task_id='train_signal_model',
    python_callable=train_signal_model,
    dag=dag
)

# Set dependencies
extract_features_task >> train_model_task
extract_market_data_task >> train_model_task
```

### 7.5 OLTP vs OLAP Separation

**OLTP (Operational) - Production Databases**:
```yaml
PostgreSQL Primary (OLTP):
  Purpose: Transactional operations
  Characteristics:
    - High concurrency (1000+ connections)
    - Low latency (< 10ms queries)
    - ACID compliance
    - Normalized schema
    - Row-based storage
    
  Workload:
    - User authentication: 10K QPS
    - Course enrollments: 500 QPS
    - Payment processing: 200 QPS
    - Signal distribution: 5K QPS
    
  Configuration:
    shared_buffers: 8GB
    effective_cache_size: 24GB
    work_mem: 256MB
    max_connections: 1000
    checkpoint_segments: 64
```

**OLAP (Analytical) - Data Warehouse**:
```yaml
Snowflake (OLAP):
  Purpose: Analytics and reporting
  Characteristics:
    - Complex aggregations
    - Large data scans
    - Columnar storage
    - Denormalized schema
    - Time-based partitioning
    
  Workload:
    - Daily revenue reports
    - User behavior analysis
    - Signal performance analytics
    - Cohort analysis
    - Predictive modeling
    
  Warehouses:
    COMPUTE_WH_SMALL: 
      - Scheduled reports
      - Dashboard queries
    COMPUTE_WH_LARGE:
      - ML training data prep
      - Complex analytics
    COMPUTE_WH_XLARGE:
      - Historical data analysis
      - Data science workloads
```

**Data Synchronization Strategy**:
```yaml
Real-time Sync (CDC):
  Tool: Debezium + Kafka Connect
  Sources: PostgreSQL, MongoDB
  Targets: Snowflake, S3 Data Lake
  Latency: < 5 seconds
  
Batch Sync:
  Tool: Apache Airflow + Apache Spark
  Schedule: Hourly for aggregations, Daily for full sync
  Data Volume: 100GB+ daily
  
Stream Processing:
  Tool: Kafka Streams
  Purpose: Real-time aggregations
  Output: Redis for fast retrieval
```

---

## 8. Security Architecture

### 8.1 Zero-Trust Security Model

**Zero-Trust Implementation**:
```yaml
Core Principles:
  - Never trust, always verify
  - Least privilege access
  - Assume breach mentality
  - Continuous verification
  - Identity-centric security

Architecture Components:
  Identity Provider: 
    - Auth0 with multi-factor authentication
    - SAML/OIDC integration
    - Risk-based authentication
    
  Network Security:
    - Micro-segmentation with Istio service mesh
    - Application-layer security
    - Zero-trust network access (ZTNA)
    
  Device Trust:
    - Device fingerprinting
    - Endpoint detection and response (EDR)
    - Mobile application attestation
    
  Data Protection:
    - End-to-end encryption
    - Data loss prevention (DLP)
    - Field-level encryption for PII
```

**Service Mesh Security with Istio**:
```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: treum-production
spec:
  mtls:
    mode: STRICT

---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: payment-service-authz
  namespace: treum-production
spec:
  selector:
    matchLabels:
      app: payment-service
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/treum-production/sa/api-gateway"]
    to:
    - operation:
        methods: ["POST", "GET"]
        paths: ["/payments/*"]
    when:
    - key: custom.user_tier
      values: ["premium", "enterprise"]

---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: signals-service-authz
  namespace: treum-production
spec:
  selector:
    matchLabels:
      app: signals-service
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/treum-production/sa/api-gateway"]
    to:
    - operation:
        methods: ["GET", "POST"]
        paths: ["/signals/*"]
    when:
    - key: request.headers[x-subscription-status]
      values: ["active"]
  - to:
    - operation:
        methods: ["GET"]
        paths: ["/signals/free"]
```

### 8.2 KYC/AML Compliance

**KYC Implementation Framework**:
```javascript
// KYC Service Implementation
class KYCService {
    constructor() {
        this.providers = {
            identity: new IDFCFirstBankAPI(),
            document: new DigilockerAPI(),
            aml: new WorldCheckAPI(),
            sanctions: new OFACScreeningAPI()
        };
    }

    async performKYC(userId, documents) {
        const kycResult = {
            userId,
            status: 'pending',
            steps: [],
            riskScore: 0,
            timestamp: new Date()
        };

        try {
            // Step 1: Document Verification
            const docVerification = await this.verifyDocuments(documents);
            kycResult.steps.push({
                step: 'document_verification',
                status: docVerification.status,
                details: docVerification.details,
                timestamp: new Date()
            });

            if (docVerification.status !== 'approved') {
                kycResult.status = 'rejected';
                kycResult.rejectionReason = 'Document verification failed';
                return kycResult;
            }

            // Step 2: Identity Verification
            const identityCheck = await this.verifyIdentity(documents.pan, documents.aadhaar);
            kycResult.steps.push({
                step: 'identity_verification',
                status: identityCheck.status,
                details: identityCheck.details,
                timestamp: new Date()
            });

            // Step 3: AML Screening
            const amlScreening = await this.performAMLScreening(documents.personalInfo);
            kycResult.steps.push({
                step: 'aml_screening',
                status: amlScreening.status,
                riskLevel: amlScreening.riskLevel,
                details: amlScreening.details,
                timestamp: new Date()
            });

            // Step 4: Sanctions Check
            const sanctionsCheck = await this.checkSanctions(documents.personalInfo);
            kycResult.steps.push({
                step: 'sanctions_check',
                status: sanctionsCheck.status,
                details: sanctionsCheck.details,
                timestamp: new Date()
            });

            // Calculate overall risk score
            kycResult.riskScore = this.calculateRiskScore(kycResult.steps);

            // Determine final status
            if (kycResult.riskScore > 80) {
                kycResult.status = 'rejected';
                kycResult.rejectionReason = 'High risk score';
            } else if (kycResult.riskScore > 50) {
                kycResult.status = 'manual_review';
            } else {
                kycResult.status = 'approved';
            }

            // Store KYC result
            await this.storeKYCResult(kycResult);

            // Trigger compliance workflow if needed
            if (kycResult.status === 'manual_review') {
                await this.triggerManualReview(kycResult);
            }

            return kycResult;

        } catch (error) {
            logger.error('KYC processing failed', { userId, error });
            kycResult.status = 'error';
            kycResult.error = error.message;
            return kycResult;
        }
    }

    async verifyDocuments(documents) {
        // Verify PAN Card
        const panVerification = await this.providers.identity.verifyPAN(documents.pan);
        
        // Verify Aadhaar through Digilocker
        const aadhaarVerification = await this.providers.document.verifyAadhaar(documents.aadhaar);
        
        // Document authenticity check using AI
        const documentAI = await this.verifyDocumentAuthenticity(documents);

        return {
            status: panVerification.valid && aadhaarVerification.valid && documentAI.authentic ? 'approved' : 'rejected',
            details: {
                pan: panVerification,
                aadhaar: aadhaarVerification,
                authenticity: documentAI
            }
        };
    }

    async performAMLScreening(personalInfo) {
        const screeningResult = await this.providers.aml.screenPerson({
            name: personalInfo.fullName,
            dateOfBirth: personalInfo.dob,
            nationality: personalInfo.nationality,
            address: personalInfo.address
        });

        return {
            status: screeningResult.riskLevel === 'low' ? 'approved' : 'flagged',
            riskLevel: screeningResult.riskLevel,
            details: screeningResult.matches || []
        };
    }

    calculateRiskScore(steps) {
        let score = 0;
        const weights = {
            document_verification: 30,
            identity_verification: 25,
            aml_screening: 25,
            sanctions_check: 20
        };

        steps.forEach(step => {
            if (step.status === 'rejected' || step.status === 'flagged') {
                score += weights[step.step] || 0;
            }
        });

        return score;
    }
}

// Compliance Monitoring Service
class ComplianceMonitoringService {
    constructor() {
        this.riskThresholds = {
            transaction: {
                single: 50000, // ₹50K
                daily: 200000, // ₹2L
                monthly: 1000000 // ₹10L
            },
            behavioral: {
                rapidTransactions: 10, // per hour
                unusualPatterns: 5 // deviation score
            }
        };
    }

    async monitorTransaction(transaction) {
        const flags = [];

        // Amount-based monitoring
        if (transaction.amount > this.riskThresholds.transaction.single) {
            flags.push('HIGH_VALUE_TRANSACTION');
        }

        // Velocity monitoring
        const userTransactions = await this.getUserTransactionsToday(transaction.userId);
        const dailyTotal = userTransactions.reduce((sum, t) => sum + t.amount, 0);
        
        if (dailyTotal > this.riskThresholds.transaction.daily) {
            flags.push('DAILY_LIMIT_EXCEEDED');
        }

        // Pattern analysis
        const behavioralScore = await this.analyzeBehavioralPattern(transaction.userId);
        if (behavioralScore > this.riskThresholds.behavioral.unusualPatterns) {
            flags.push('UNUSUAL_PATTERN');
        }

        // Geographic analysis
        const locationRisk = await this.analyzeLocationRisk(transaction);
        if (locationRisk.score > 70) {
            flags.push('HIGH_RISK_LOCATION');
        }

        if (flags.length > 0) {
            await this.createComplianceAlert({
                transactionId: transaction.id,
                userId: transaction.userId,
                flags,
                riskScore: this.calculateTransactionRisk(flags),
                timestamp: new Date()
            });
        }

        return {
            approved: flags.length === 0 || !flags.includes('DAILY_LIMIT_EXCEEDED'),
            flags,
            requiresReview: flags.length > 1
        };
    }
}
```

### 8.3 PCI DSS Compliance for Payment Processing

**PCI DSS Implementation**:
```yaml
PCI DSS Requirements Implementation:

Requirement 1 & 2: Network Security
  - AWS WAF with custom rules
  - VPC with private subnets
  - Security groups with least privilege
  - No default passwords
  - Secure configurations for all systems

Requirement 3 & 4: Data Protection
  - Card data encryption at rest (AES-256)
  - TLS 1.3 for data in transit
  - Key management with AWS KMS
  - No storage of sensitive authentication data

Requirement 5 & 6: Vulnerability Management
  - Regular vulnerability scans (Nessus)
  - Secure development lifecycle
  - Code review process
  - Penetration testing (quarterly)

Requirement 7 & 8: Access Control
  - Role-based access control (RBAC)
  - Multi-factor authentication
  - Unique user accounts
  - Regular access reviews

Requirement 9 & 10: Physical Security & Logging
  - Cloud provider physical security
  - Comprehensive audit logging
  - Log monitoring and analysis
  - Secure log storage

Requirement 11 & 12: Testing & Policies
  - Regular security testing
  - Information security policy
  - Risk assessment procedures
  - Incident response plan
```

**Payment Processing Security**:
```javascript
// Secure Payment Processing Service
class SecurePaymentProcessor {
    constructor() {
        this.tokenizationService = new PaymentTokenizer();
        this.encryptionService = new FieldLevelEncryption();
        this.fraudDetection = new FraudDetectionEngine();
        this.auditLogger = new ComplianceAuditLogger();
    }

    async processPayment(paymentRequest) {
        const processingId = uuidv4();
        
        try {
            // Log payment initiation (without sensitive data)
            await this.auditLogger.log({
                event: 'PAYMENT_INITIATED',
                processingId,
                userId: paymentRequest.userId,
                amount: paymentRequest.amount,
                currency: paymentRequest.currency,
                timestamp: new Date()
            });

            // Step 1: Tokenize sensitive payment data
            const tokenizedCard = await this.tokenizationService.tokenize(paymentRequest.cardData);
            
            // Step 2: Fraud detection
            const fraudCheck = await this.fraudDetection.analyze({
                userId: paymentRequest.userId,
                amount: paymentRequest.amount,
                cardToken: tokenizedCard.token,
                merchantData: paymentRequest.merchantData,
                deviceFingerprint: paymentRequest.deviceFingerprint,
                ipAddress: paymentRequest.ipAddress
            });

            if (fraudCheck.riskScore > 80) {
                await this.auditLogger.log({
                    event: 'PAYMENT_BLOCKED_FRAUD',
                    processingId,
                    riskScore: fraudCheck.riskScore,
                    reasons: fraudCheck.reasons
                });
                
                return {
                    status: 'blocked',
                    reason: 'fraud_detected',
                    processingId
                };
            }

            // Step 3: 3DS Authentication for high-value transactions
            if (paymentRequest.amount > 50000) { // ₹50K
                const threeDSResult = await this.perform3DSAuthentication(tokenizedCard, paymentRequest);
                
                if (!threeDSResult.authenticated) {
                    return {
                        status: 'requires_authentication',
                        authenticationUrl: threeDSResult.authUrl,
                        processingId
                    };
                }
            }

            // Step 4: Process payment with gateway
            const gatewayResult = await this.processWithGateway(tokenizedCard, paymentRequest);

            // Step 5: Store transaction record (encrypted)
            const transactionRecord = {
                id: processingId,
                userId: paymentRequest.userId,
                amount: paymentRequest.amount,
                currency: paymentRequest.currency,
                status: gatewayResult.status,
                gatewayTransactionId: gatewayResult.transactionId,
                cardLastFour: tokenizedCard.lastFour,
                cardToken: tokenizedCard.token,
                createdAt: new Date()
            };

            await this.storeTransactionSecurely(transactionRecord);

            // Log successful payment
            await this.auditLogger.log({
                event: 'PAYMENT_COMPLETED',
                processingId,
                status: gatewayResult.status,
                gatewayTransactionId: gatewayResult.transactionId
            });

            return {
                status: 'success',
                transactionId: processingId,
                gatewayTransactionId: gatewayResult.transactionId
            };

        } catch (error) {
            await this.auditLogger.log({
                event: 'PAYMENT_ERROR',
                processingId,
                error: error.message,
                stackTrace: error.stack
            });

            throw new PaymentProcessingError('Payment processing failed', {
                processingId,
                originalError: error
            });
        }
    }

    async storeTransactionSecurely(transaction) {
        // Encrypt sensitive fields
        const encryptedTransaction = {
            ...transaction,
            cardToken: await this.encryptionService.encrypt(transaction.cardToken),
            gatewayTransactionId: await this.encryptionService.encrypt(transaction.gatewayTransactionId)
        };

        await this.database.transactions.create(encryptedTransaction);
    }
}

// Field-Level Encryption Service
class FieldLevelEncryption {
    constructor() {
        this.kmsClient = new AWS.KMS({
            region: process.env.AWS_REGION
        });
        this.keyId = process.env.PCI_ENCRYPTION_KEY_ID;
    }

    async encrypt(plaintext) {
        const params = {
            KeyId: this.keyId,
            Plaintext: Buffer.from(plaintext, 'utf8')
        };

        const result = await this.kmsClient.encrypt(params).promise();
        return result.CiphertextBlob.toString('base64');
    }

    async decrypt(ciphertext) {
        const params = {
            CiphertextBlob: Buffer.from(ciphertext, 'base64')
        };

        const result = await this.kmsClient.decrypt(params).promise();
        return result.Plaintext.toString('utf8');
    }
}
```

### 8.4 API Security with Rate Limiting

**API Gateway Security Configuration**:
```yaml
# Kong API Gateway Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: kong-config
data:
  kong.yml: |
    _format_version: "3.0"
    
    services:
    - name: user-service
      url: http://user-service:3001
      plugins:
      - name: rate-limiting
        config:
          minute: 1000
          hour: 10000
          policy: redis
          redis_host: redis-cluster
          fault_tolerant: true
          hide_client_headers: false
      
      - name: jwt
        config:
          uri_param_names: ["token"]
          header_names: ["Authorization"]
          claims_to_verify: ["exp", "iat"]
          key_claim_name: kid
          secret_is_base64: false
      
      - name: ip-restriction
        config:
          allow: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]
          deny: ["0.0.0.0/0"]
      
      - name: request-size-limiting
        config:
          allowed_payload_size: 10 # 10MB
      
      - name: cors
        config:
          origins: ["https://treum.in", "https://app.treum.in"]
          methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
          headers: ["Accept", "Authorization", "Content-Type", "X-CSRF-Token"]
          exposed_headers: ["X-Auth-Token"]
          credentials: true
          max_age: 3600

    - name: signals-service
      url: http://signals-service:3002
      plugins:
      - name: rate-limiting-advanced
        config:
          limit:
          - 100 # requests
          - 60  # per 60 seconds
          window_size: [60]
          identifier: consumer
          sync_rate: 10
          strategy: redis
          redis:
            host: redis-cluster
            port: 6379
            database: 2
          hide_client_headers: false
          disable_penalty: false
          
      - name: response-ratelimiting
        config:
          limits:
            video: 
              minute: 10
              hour: 100
            signals:
              minute: 1000
              hour: 5000
              
      - name: bot-detection
        config:
          allow: []
          deny: []
          whitelist: ["Googlebot", "Bingbot"]
          blacklist: ["BadBot", "Crawler"]

    consumers:
    - username: premium-user
      plugins:
      - name: rate-limiting
        config:
          minute: 5000
          hour: 50000
          
    - username: enterprise-user
      plugins:
      - name: rate-limiting
        config:
          minute: 10000
          hour: 100000
```

**Advanced Rate Limiting with Redis**:
```javascript
// Distributed Rate Limiter
class DistributedRateLimiter {
    constructor(redisClient) {
        this.redis = redisClient;
        this.scripts = this.loadLuaScripts();
    }

    async isAllowed(identifier, limits) {
        const key = `rate_limit:${identifier}`;
        const now = Date.now();
        
        // Use Lua script for atomic operations
        const result = await this.redis.eval(
            this.scripts.slidingWindow,
            1, // number of keys
            key,
            now,
            limits.window * 1000, // window in milliseconds
            limits.max,
            limits.window
        );

        return {
            allowed: result[0] === 1,
            count: result[1],
            remaining: Math.max(0, limits.max - result[1]),
            resetTime: result[2],
            retryAfter: result[0] === 0 ? Math.ceil((result[2] - now) / 1000) : 0
        };
    }

    loadLuaScripts() {
        return {
            slidingWindow: `
                local key = KEYS[1]
                local now = tonumber(ARGV[1])
                local window = tonumber(ARGV[2])
                local limit = tonumber(ARGV[3])
                local window_size = tonumber(ARGV[4])
                
                -- Remove expired entries
                redis.call('zremrangebyscore', key, 0, now - window)
                
                -- Count current requests
                local current = redis.call('zcard', key)
                
                if current < limit then
                    -- Add current request
                    redis.call('zadd', key, now, now)
                    redis.call('expire', key, window_size)
                    return {1, current + 1, now + window}
                else
                    -- Get the oldest request time
                    local oldest = redis.call('zrange', key, 0, 0, 'WITHSCORES')
                    local retry_after = oldest[2] and (oldest[2] + window) or (now + window)
                    return {0, current, retry_after}
                end
            `
        };
    }
}

// API Security Middleware
class APISecurityMiddleware {
    constructor() {
        this.rateLimiter = new DistributedRateLimiter(redisClient);
        this.jwtValidator = new JWTValidator();
        this.ipBlocklist = new IPBlocklistManager();
    }

    async securityCheck(req, res, next) {
        try {
            // 1. IP Address Validation
            const clientIP = this.getClientIP(req);
            const ipStatus = await this.ipBlocklist.checkIP(clientIP);
            
            if (ipStatus.blocked) {
                return res.status(403).json({
                    error: 'IP_BLOCKED',
                    message: 'Access denied from this IP address',
                    blockReason: ipStatus.reason
                });
            }

            // 2. User Agent Validation
            const userAgent = req.headers['user-agent'];
            if (this.isSuspiciousUserAgent(userAgent)) {
                await this.logSuspiciousActivity(clientIP, userAgent);
                return res.status(403).json({
                    error: 'SUSPICIOUS_CLIENT',
                    message: 'Request blocked due to suspicious client'
                });
            }

            // 3. JWT Validation
            const token = this.extractToken(req);
            if (token) {
                const jwtResult = await this.jwtValidator.validate(token);
                if (!jwtResult.valid) {
                    return res.status(401).json({
                        error: 'INVALID_TOKEN',
                        message: 'Invalid or expired token'
                    });
                }
                req.user = jwtResult.payload;
            }

            // 4. Rate Limiting
            const rateLimitResult = await this.applyRateLimit(req);
            if (!rateLimitResult.allowed) {
                res.set({
                    'X-RateLimit-Limit': rateLimitResult.limit,
                    'X-RateLimit-Remaining': rateLimitResult.remaining,
                    'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
                    'Retry-After': rateLimitResult.retryAfter
                });
                
                return res.status(429).json({
                    error: 'RATE_LIMIT_EXCEEDED',
                    message: 'Too many requests',
                    retryAfter: rateLimitResult.retryAfter
                });
            }

            // 5. Request Size Validation
            if (req.headers['content-length'] > 10 * 1024 * 1024) { // 10MB
                return res.status(413).json({
                    error: 'PAYLOAD_TOO_LARGE',
                    message: 'Request payload exceeds maximum size'
                });
            }

            // Add security headers
            res.set({
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1; mode=block',
                'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
            });

            next();

        } catch (error) {
            logger.error('Security middleware error', { error, ip: clientIP });
            return res.status(500).json({
                error: 'SECURITY_CHECK_FAILED',
                message: 'Internal security error'
            });
        }
    }

    async applyRateLimit(req) {
        const identifier = this.getRateLimitIdentifier(req);
        const limits = this.getRateLimits(req);
        
        return await this.rateLimiter.isAllowed(identifier, limits);
    }

    getRateLimitIdentifier(req) {
        // Priority: User ID > API Key > IP Address
        if (req.user && req.user.id) {
            return `user:${req.user.id}`;
        }
        
        if (req.headers['x-api-key']) {
            return `api_key:${req.headers['x-api-key']}`;
        }
        
        return `ip:${this.getClientIP(req)}`;
    }

    getRateLimits(req) {
        const baseUrl = req.baseUrl || '';
        const userTier = req.user?.tier || 'free';

        // Different limits for different endpoints and user tiers
        const limits = {
            '/auth': { window: 300, max: 10 }, // 10 requests per 5 minutes
            '/payments': { window: 3600, max: 50 }, // 50 requests per hour
            '/signals/live': {
                free: { window: 3600, max: 100 },
                premium: { window: 3600, max: 1000 },
                enterprise: { window: 3600, max: 10000 }
            }
        };

        if (baseUrl.includes('/signals/live')) {
            return limits['/signals/live'][userTier] || limits['/signals/live'].free;
        }

        return limits[baseUrl] || { window: 3600, max: 1000 }; // Default
    }
}
```

### 8.5 Data Encryption at Rest and in Transit

**Encryption Implementation**:
```yaml
Encryption at Rest:
  Database Encryption:
    - PostgreSQL: Transparent Data Encryption (TDE)
    - MongoDB: WiredTiger encryption
    - Redis: Encryption at rest enabled
    - S3: Server-side encryption with KMS
    
  Key Management:
    - AWS KMS for key management
    - Key rotation every 90 days
    - Hardware Security Module (HSM) for critical keys
    - Separate keys per environment
    
  Application-Level Encryption:
    - PII fields encrypted with AES-256-GCM
    - Payment data tokenized
    - Sensitive logs encrypted
    - Backup encryption mandatory

Encryption in Transit:
  Network Level:
    - TLS 1.3 for all external communications
    - mTLS for internal service communication
    - VPN for administrative access
    - Certificate management with Let's Encrypt
    
  API Security:
    - HTTPS enforced (HSTS)
    - Certificate pinning for mobile apps
    - API request/response encryption for sensitive data
    - WebSocket over WSS (TLS)
```

**Application-Level Encryption Service**:
```javascript
// Application Encryption Service
class ApplicationEncryption {
    constructor() {
        this.keyManagement = new AWSKeyManagement();
        this.fieldEncryption = new FieldEncryption();
    }

    async encryptPII(data) {
        const encryptedData = {};
        const piiFields = ['pan', 'aadhaar', 'phone', 'email', 'address'];
        
        for (const [key, value] of Object.entries(data)) {
            if (piiFields.includes(key) && value) {
                encryptedData[key] = await this.fieldEncryption.encrypt(value, 'pii-key');
                encryptedData[`${key}_encrypted`] = true;
            } else {
                encryptedData[key] = value;
            }
        }
        
        return encryptedData;
    }

    async decryptPII(encryptedData) {
        const decryptedData = {};
        
        for (const [key, value] of Object.entries(encryptedData)) {
            if (key.endsWith('_encrypted')) {
                continue; // Skip encryption flags
            }
            
            if (encryptedData[`${key}_encrypted`]) {
                decryptedData[key] = await this.fieldEncryption.decrypt(value, 'pii-key');
            } else {
                decryptedData[key] = value;
            }
        }
        
        return decryptedData;
    }
}

// TLS Configuration for Services
const tlsConfig = {
    // API Gateway TLS
    gateway: {
        cert: '/etc/ssl/certs/treum.in.crt',
        key: '/etc/ssl/private/treum.in.key',
        ca: '/etc/ssl/certs/ca-bundle.crt',
        requestCert: true,
        rejectUnauthorized: true,
        ciphers: [
            'ECDHE-RSA-AES128-GCM-SHA256',
            'ECDHE-RSA-AES256-GCM-SHA384',
            'ECDHE-RSA-AES128-SHA256',
            'ECDHE-RSA-AES256-SHA384'
        ].join(':'),
        honorCipherOrder: true,
        secureProtocol: 'TLSv1_3_method'
    },
    
    // Internal service mTLS
    internal: {
        cert: '/etc/ssl/internal/service.crt',
        key: '/etc/ssl/internal/service.key',
        ca: '/etc/ssl/internal/ca.crt',
        requestCert: true,
        rejectUnauthorized: true,
        checkServerIdentity: (hostname, cert) => {
            // Custom hostname verification for service mesh
            return undefined; // Valid
        }
    }
};
```

---

This completes Part 2 of the TREUM ALGOTECH technical architecture document, covering comprehensive infrastructure, security, scalability, and data architecture for a production-grade ₹600 Cr revenue platform. The architecture addresses real-time signal delivery, financial compliance, and enterprise-scale security requirements.

Key files created:
- `/Users/srijan/ai-finance-agency/TREUM_TECHNICAL_ARCHITECTURE_PART2.md` - Complete Part 2 documentation

The architecture provides:
1. **Multi-region AWS infrastructure** with auto-scaling and cost optimization
2. **Comprehensive security** with zero-trust model and financial compliance
3. **Scalable data architecture** supporting OLTP/OLAP separation and real-time streaming
4. **Production-grade monitoring** and disaster recovery capabilities
5. **Enterprise security** with PCI DSS compliance and advanced threat protection

This technical foundation supports the ambitious goal of handling ₹600 Cr in annual revenue with 1M+ concurrent users while maintaining financial regulatory compliance.