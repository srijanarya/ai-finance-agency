# TREUM AI Finance Agency - Monitoring & Observability Guide

## Table of Contents

1. [Overview](#overview)
2. [Monitoring Stack](#monitoring-stack)
3. [Metrics Collection](#metrics-collection)
4. [Logging Strategy](#logging-strategy)
5. [Distributed Tracing](#distributed-tracing)
6. [Alerting Rules](#alerting-rules)
7. [Dashboard Setup](#dashboard-setup)
8. [Performance Monitoring](#performance-monitoring)
9. [Incident Response](#incident-response)

## Overview

This guide covers the complete monitoring and observability setup for the TREUM AI Finance Agency platform, ensuring high availability, performance, and quick incident resolution.

### Monitoring Objectives

- **Availability**: 99.9% uptime SLA
- **Performance**: <200ms P95 API latency
- **Reliability**: <0.1% error rate
- **Security**: Real-time threat detection
- **Business**: Trading signal accuracy tracking

## Monitoring Stack

### Core Components

```yaml
Metrics: Prometheus + Grafana
Logging: ELK Stack (Elasticsearch, Logstash, Kibana)
Tracing: Jaeger
APM: Datadog
Uptime: Pingdom
Error Tracking: Sentry
```

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Applications                       │
│  (Python API, Node.js Services, Trading Engine)     │
└────────────────┬────────────────────────────────────┘
                 │
    ┌────────────┼────────────┬──────────────┐
    │            │            │              │
┌───▼───┐  ┌────▼────┐  ┌────▼────┐  ┌─────▼─────┐
│Metrics│  │  Logs   │  │ Traces  │  │  Events   │
└───┬───┘  └────┬────┘  └────┬────┘  └─────┬─────┘
    │           │            │              │
┌───▼───────────▼────────────▼──────────────▼─────┐
│           Observability Platform                 │
│  (Prometheus, ELK, Jaeger, Datadog)            │
└───────────────┬──────────────────────────────────┘
                │
        ┌───────▼────────┐
        │  Visualization │
        │   (Grafana)    │
        └────────────────┘
```

## Metrics Collection

### 1. Application Metrics

#### Python Application (FastAPI)

```python
# app/metrics.py
from prometheus_client import Counter, Histogram, Gauge, Summary
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response
import time

# Define metrics
http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint']
)

active_trading_signals = Gauge(
    'active_trading_signals',
    'Number of active trading signals'
)

signal_accuracy = Summary(
    'signal_accuracy_percentage',
    'Trading signal accuracy'
)

orders_placed_total = Counter(
    'orders_placed_total',
    'Total orders placed',
    ['broker', 'order_type', 'status']
)

portfolio_value = Gauge(
    'portfolio_value_inr',
    'Total portfolio value in INR',
    ['user_id']
)

# Middleware for automatic metrics
from fastapi import Request
import time

async def metrics_middleware(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    duration = time.time() - start_time
    http_requests_total.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()

    http_request_duration_seconds.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)

    return response

# Metrics endpoint
async def metrics_endpoint():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
```

#### Node.js Application (Express)

```javascript
// metrics.js
const promClient = require("prom-client");
const collectDefaultMetrics = promClient.collectDefaultMetrics;

// Collect default metrics
collectDefaultMetrics({ timeout: 5000 });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 5, 15, 50, 100, 500],
});

const activeConnections = new promClient.Gauge({
  name: "websocket_active_connections",
  help: "Number of active WebSocket connections",
});

const tradingErrors = new promClient.Counter({
  name: "trading_errors_total",
  help: "Total trading errors",
  labelNames: ["broker", "error_type"],
});

// Middleware
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.url, res.statusCode)
      .observe(duration);
  });

  next();
};

module.exports = {
  httpRequestDuration,
  activeConnections,
  tradingErrors,
  metricsMiddleware,
  register: promClient.register,
};
```

### 2. Infrastructure Metrics

#### Kubernetes Metrics

```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s

    scrape_configs:
    - job_name: 'kubernetes-apiservers'
      kubernetes_sd_configs:
      - role: endpoints
      scheme: https
      tls_config:
        ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
      bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
      
    - job_name: 'kubernetes-nodes'
      kubernetes_sd_configs:
      - role: node
      
    - job_name: 'kubernetes-pods'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
        
    - job_name: 'application-metrics'
      kubernetes_sd_configs:
      - role: service
      relabel_configs:
      - source_labels: [__meta_kubernetes_service_name]
        regex: (api|trading|user-management).*
        action: keep
```

### 3. Business Metrics

```python
# app/business_metrics.py
from prometheus_client import Counter, Gauge, Histogram

# Revenue metrics
revenue_total = Counter(
    'revenue_total_inr',
    'Total revenue in INR',
    ['source', 'plan_type']
)

subscription_mrr = Gauge(
    'subscription_mrr_inr',
    'Monthly recurring revenue',
    ['plan_type']
)

# User metrics
active_users = Gauge(
    'active_users_total',
    'Number of active users',
    ['tier']
)

user_churn_rate = Gauge(
    'user_churn_rate_percentage',
    'User churn rate'
)

# Trading metrics
signal_generation_time = Histogram(
    'signal_generation_seconds',
    'Time to generate trading signal',
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0]
)

signal_success_rate = Gauge(
    'signal_success_rate_percentage',
    'Percentage of successful signals',
    ['strategy', 'timeframe']
)

trading_volume = Counter(
    'trading_volume_inr',
    'Total trading volume',
    ['broker', 'segment']
)
```

## Logging Strategy

### 1. Structured Logging

#### Python Logging Configuration

```python
# app/logging_config.py
import logging
import json
from pythonjsonlogger import jsonlogger
from datetime import datetime

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        log_record['timestamp'] = datetime.utcnow().isoformat()
        log_record['level'] = record.levelname
        log_record['logger'] = record.name
        log_record['service'] = 'api'
        log_record['environment'] = os.getenv('ENVIRONMENT', 'development')

def setup_logging():
    logHandler = logging.StreamHandler()
    formatter = CustomJsonFormatter()
    logHandler.setFormatter(formatter)

    logger = logging.getLogger()
    logger.addHandler(logHandler)
    logger.setLevel(logging.INFO)

    return logger

# Usage
logger = setup_logging()

# Log with context
logger.info(
    "Signal generated",
    extra={
        'user_id': user_id,
        'signal_id': signal_id,
        'symbol': symbol,
        'confidence': confidence,
        'execution_time': execution_time
    }
)
```

#### Node.js Logging Configuration

```javascript
// logging.js
const winston = require("winston");
const { ElasticsearchTransport } = require("winston-elasticsearch");

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: {
    service: "trading-service",
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new ElasticsearchTransport({
      level: "info",
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL,
      },
      index: "treum-logs",
    }),
  ],
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    logger.info("HTTP Request", {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: Date.now() - start,
      user_id: req.user?.id,
      ip: req.ip,
      user_agent: req.get("user-agent"),
    });
  });

  next();
};
```

### 2. Log Aggregation with ELK

#### Logstash Configuration

```ruby
# logstash.conf
input {
  beats {
    port => 5044
  }

  tcp {
    port => 5000
    codec => json
  }
}

filter {
  if [service] == "api" {
    mutate {
      add_tag => ["python", "api"]
    }
  }

  if [service] =~ /trading.*/ {
    mutate {
      add_tag => ["nodejs", "trading"]
    }
  }

  # Parse timestamps
  date {
    match => ["timestamp", "ISO8601"]
    target => "@timestamp"
  }

  # Add GeoIP for user locations
  if [ip] {
    geoip {
      source => "ip"
      target => "geoip"
    }
  }

  # Extract error details
  if [level] == "ERROR" {
    grok {
      match => {
        "message" => "%{GREEDYDATA:error_message}"
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "treum-%{service}-%{+YYYY.MM.dd}"
  }

  # Send errors to Slack
  if [level] == "ERROR" {
    http {
      url => "${SLACK_WEBHOOK_URL}"
      http_method => "post"
      format => "json"
      mapping => {
        "text" => "Error in %{service}: %{message}"
      }
    }
  }
}
```

## Distributed Tracing

### Jaeger Setup

#### Python Tracing

```python
# app/tracing.py
from jaeger_client import Config
from opentracing.ext import tags
from opentracing.propagation import Format
import opentracing

def init_tracer(service_name):
    config = Config(
        config={
            'sampler': {
                'type': 'probabilistic',
                'param': 0.1,  # Sample 10% of traces
            },
            'local_agent': {
                'reporting_host': 'jaeger-agent',
                'reporting_port': '6831',
            },
            'logging': True,
        },
        service_name=service_name,
    )
    return config.initialize_tracer()

tracer = init_tracer('api-service')

# Trace decorator
def trace_operation(operation_name):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            with tracer.start_span(operation_name) as span:
                span.set_tag('function', func.__name__)
                try:
                    result = await func(*args, **kwargs)
                    span.set_tag('status', 'success')
                    return result
                except Exception as e:
                    span.set_tag('status', 'error')
                    span.set_tag('error', str(e))
                    raise
        return wrapper
    return decorator

# Usage
@trace_operation('generate_signal')
async def generate_trading_signal(symbol: str):
    with tracer.start_span('fetch_market_data', child_of=span):
        market_data = await fetch_market_data(symbol)

    with tracer.start_span('run_ai_model', child_of=span):
        signal = await run_ai_model(market_data)

    return signal
```

#### Node.js Tracing

```javascript
// tracing.js
const { initTracer } = require("jaeger-client");
const opentracing = require("opentracing");

const config = {
  serviceName: "trading-service",
  sampler: {
    type: "probabilistic",
    param: 0.1,
  },
  reporter: {
    agentHost: "jaeger-agent",
    agentPort: 6831,
  },
};

const tracer = initTracer(config);

// Express middleware
const tracingMiddleware = (req, res, next) => {
  const span = tracer.startSpan("http_request");
  span.setTag(opentracing.Tags.HTTP_METHOD, req.method);
  span.setTag(opentracing.Tags.HTTP_URL, req.url);

  req.span = span;

  res.on("finish", () => {
    span.setTag(opentracing.Tags.HTTP_STATUS_CODE, res.statusCode);
    span.finish();
  });

  next();
};
```

## Alerting Rules

### Prometheus Alert Rules

```yaml
# alerts.yaml
groups:
  - name: application
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: |
          rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
          team: backend
        annotations:
          summary: "High error rate on {{ $labels.service }}"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: HighLatency
        expr: |
          histogram_quantile(0.95,
            rate(http_request_duration_seconds_bucket[5m])
          ) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency on {{ $labels.endpoint }}"
          description: "P95 latency is {{ $value }}s"

      - alert: SignalGenerationSlow
        expr: |
          histogram_quantile(0.95,
            rate(signal_generation_seconds_bucket[5m])
          ) > 5
        for: 10m
        labels:
          severity: warning
          team: ai
        annotations:
          summary: "Signal generation taking too long"
          description: "P95 generation time is {{ $value }}s"

  - name: infrastructure
    rules:
      - alert: PodCrashLooping
        expr: |
          rate(kube_pod_container_status_restarts_total[15m]) > 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Pod {{ $labels.pod }} is crash looping"

      - alert: HighMemoryUsage
        expr: |
          container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Container {{ $labels.container }} high memory usage"

      - alert: DiskSpaceLow
        expr: |
          node_filesystem_avail_bytes / node_filesystem_size_bytes < 0.1
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space on {{ $labels.instance }}"

  - name: business
    rules:
      - alert: LowSignalAccuracy
        expr: |
          signal_success_rate_percentage < 60
        for: 30m
        labels:
          severity: warning
          team: ai
        annotations:
          summary: "Trading signal accuracy below threshold"
          description: "Accuracy is {{ $value }}%"

      - alert: HighChurnRate
        expr: |
          user_churn_rate_percentage > 10
        for: 1h
        labels:
          severity: warning
          team: product
        annotations:
          summary: "User churn rate is high"
          description: "Churn rate is {{ $value }}%"
```

### Alert Routing

```yaml
# alertmanager.yaml
global:
  slack_api_url: "${SLACK_WEBHOOK_URL}"
  pagerduty_url: "https://events.pagerduty.com/v2/enqueue"

route:
  group_by: ["alertname", "cluster", "service"]
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: "default"
  routes:
    - match:
        severity: critical
      receiver: pagerduty
      continue: true
    - match:
        severity: warning
      receiver: slack
    - match:
        team: ai
      receiver: ai-team

receivers:
  - name: "default"
    slack_configs:
      - channel: "#alerts"
        title: "Alert: {{ .GroupLabels.alertname }}"
        text: "{{ range .Alerts }}{{ .Annotations.description }}{{ end }}"

  - name: "pagerduty"
    pagerduty_configs:
      - service_key: "${PAGERDUTY_SERVICE_KEY}"
        description: "{{ .GroupLabels.alertname }}"

  - name: "ai-team"
    email_configs:
      - to: "ai-team@treum.ai"
        from: "alerts@treum.ai"
```

## Dashboard Setup

### Grafana Dashboards

#### API Performance Dashboard

```json
{
  "dashboard": {
    "title": "API Performance",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (endpoint)"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))"
          }
        ],
        "type": "stat"
      },
      {
        "title": "P95 Latency",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ],
        "type": "gauge"
      },
      {
        "title": "Active Users",
        "targets": [
          {
            "expr": "active_users_total"
          }
        ],
        "type": "stat"
      }
    ]
  }
}
```

#### Trading Dashboard

```json
{
  "dashboard": {
    "title": "Trading Operations",
    "panels": [
      {
        "title": "Active Signals",
        "targets": [
          {
            "expr": "active_trading_signals"
          }
        ],
        "type": "stat"
      },
      {
        "title": "Signal Accuracy",
        "targets": [
          {
            "expr": "signal_success_rate_percentage"
          }
        ],
        "type": "gauge",
        "thresholds": {
          "mode": "absolute",
          "steps": [
            { "color": "red", "value": 0 },
            { "color": "yellow", "value": 60 },
            { "color": "green", "value": 70 }
          ]
        }
      },
      {
        "title": "Orders Placed",
        "targets": [
          {
            "expr": "sum(rate(orders_placed_total[1h])) by (broker)"
          }
        ],
        "type": "bar"
      },
      {
        "title": "Portfolio Value",
        "targets": [
          {
            "expr": "sum(portfolio_value_inr)"
          }
        ],
        "type": "timeseries"
      }
    ]
  }
}
```

## Performance Monitoring

### Application Performance Monitoring (APM)

#### Datadog Integration

```python
# app/apm.py
from ddtrace import patch_all, tracer
from ddtrace.contrib.fastapi import TraceMiddleware

# Patch all supported libraries
patch_all()

# Configure tracer
tracer.configure(
    hostname='datadog-agent',
    port=8126,
    env='production',
    service='treum-api',
    version='1.0.0'
)

# Add to FastAPI app
app.add_middleware(TraceMiddleware, tracer=tracer, service="treum-api")

# Custom spans
@tracer.wrap('ai.generate_signal')
def generate_signal(symbol: str):
    span = tracer.current_span()
    span.set_tag('symbol', symbol)
    span.set_tag('model', 'ensemble')

    # Your logic here
    signal = run_ai_model(symbol)

    span.set_metric('confidence', signal.confidence)
    return signal
```

### Database Performance Monitoring

```sql
-- Enable pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Query to find slow queries
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time,
    stddev_exec_time,
    rows
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- Queries taking more than 100ms
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Index usage statistics
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

## Incident Response

### Incident Response Playbook

#### Severity Levels

- **P1 (Critical)**: Complete outage, data loss risk
- **P2 (High)**: Major feature broken, significant degradation
- **P3 (Medium)**: Minor feature broken, workaround available
- **P4 (Low)**: Cosmetic issue, minimal impact

#### Response Process

```yaml
1. Detection:
  - Alert triggered
  - User report
  - Monitoring anomaly

2. Triage (5 mins):
  - Acknowledge alert
  - Assess severity
  - Page on-call if P1/P2

3. Investigation (15 mins):
  - Check dashboards
  - Review logs
  - Identify root cause

4. Mitigation (30 mins):
  - Apply immediate fix
  - Rollback if needed
  - Communicate status

5. Resolution:
  - Verify fix
  - Monitor metrics
  - Update status page

6. Post-mortem (24 hours):
  - Timeline of events
  - Root cause analysis
  - Action items
  - Documentation update
```

### Runbooks

#### High Error Rate Runbook

```bash
#!/bin/bash
# high-error-rate-runbook.sh

echo "=== High Error Rate Investigation ==="

# 1. Check current error rate
kubectl exec -n monitoring prometheus-0 -- \
  promtool query instant 'rate(http_requests_total{status=~"5.."}[5m])'

# 2. Get recent error logs
kubectl logs -n treum-production -l app=api --tail=100 | grep ERROR

# 3. Check recent deployments
kubectl rollout history deployment/api-deployment -n treum-production

# 4. Check database status
kubectl exec -n treum-production postgres-0 -- \
  psql -U postgres -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# 5. Check external service status
curl -s https://status.stripe.com/api/v2/status.json | jq '.status'
curl -s https://api.zerodha.com/health

# 6. Rollback if needed
read -p "Rollback to previous version? (y/n) " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    kubectl rollout undo deployment/api-deployment -n treum-production
fi
```

#### Database Connection Pool Exhaustion

```python
# db_pool_fix.py
import psycopg2
from psycopg2 import pool
import logging

logger = logging.getLogger(__name__)

def check_connection_pool():
    """Check and fix database connection pool issues"""

    # Get current connections
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()

    # Check active connections
    cur.execute("""
        SELECT count(*), state
        FROM pg_stat_activity
        WHERE datname = current_database()
        GROUP BY state
    """)

    for count, state in cur.fetchall():
        logger.info(f"Connections in {state} state: {count}")

    # Kill idle connections older than 5 minutes
    cur.execute("""
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = current_database()
          AND state = 'idle'
          AND state_change < now() - interval '5 minutes'
    """)

    terminated = cur.rowcount
    logger.info(f"Terminated {terminated} idle connections")

    # Reset application connection pool
    from app.database import engine
    engine.dispose()
    logger.info("Application connection pool reset")

    conn.commit()
    cur.close()
    conn.close()

if __name__ == "__main__":
    check_connection_pool()
```

## Health Checks

### Application Health Endpoints

```python
# app/health.py
from fastapi import APIRouter, status
from typing import Dict
import asyncio
import aioredis
import asyncpg

router = APIRouter()

@router.get("/health")
async def health_check() -> Dict:
    """Basic health check"""
    return {"status": "healthy"}

@router.get("/health/detailed")
async def detailed_health_check() -> Dict:
    """Detailed health check with dependencies"""

    checks = {
        "api": "healthy",
        "database": "unknown",
        "redis": "unknown",
        "broker": "unknown"
    }

    # Check database
    try:
        conn = await asyncpg.connect(DATABASE_URL)
        await conn.fetchval("SELECT 1")
        await conn.close()
        checks["database"] = "healthy"
    except Exception as e:
        checks["database"] = f"unhealthy: {str(e)}"

    # Check Redis
    try:
        redis = await aioredis.create_redis_pool(REDIS_URL)
        await redis.ping()
        redis.close()
        await redis.wait_closed()
        checks["redis"] = "healthy"
    except Exception as e:
        checks["redis"] = f"unhealthy: {str(e)}"

    # Check broker connectivity
    try:
        response = await check_broker_health()
        checks["broker"] = "healthy" if response else "degraded"
    except Exception as e:
        checks["broker"] = f"unhealthy: {str(e)}"

    # Overall status
    overall_status = "healthy"
    if any("unhealthy" in v for v in checks.values()):
        overall_status = "unhealthy"
    elif any("degraded" in v for v in checks.values()):
        overall_status = "degraded"

    return {
        "status": overall_status,
        "checks": checks,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/ready")
async def readiness_check() -> Dict:
    """Kubernetes readiness probe"""
    # Check if application is ready to serve traffic
    if not app.state.initialized:
        return {"status": "not ready"}, status.HTTP_503_SERVICE_UNAVAILABLE

    return {"status": "ready"}

@router.get("/live")
async def liveness_check() -> Dict:
    """Kubernetes liveness probe"""
    # Basic check to see if application is alive
    return {"status": "alive"}
```

## Cost Optimization

### Monitoring Cost Analysis

```python
# cost_analysis.py
def calculate_monitoring_costs():
    """Calculate monthly monitoring infrastructure costs"""

    costs = {
        "prometheus_storage": {
            "size_gb": 500,
            "cost_per_gb": 0.10,
            "monthly_cost": 50
        },
        "elasticsearch_cluster": {
            "nodes": 3,
            "instance_type": "t3.large",
            "cost_per_hour": 0.0832,
            "monthly_cost": 179
        },
        "datadog_apm": {
            "hosts": 6,
            "cost_per_host": 15,
            "monthly_cost": 90
        },
        "grafana_cloud": {
            "users": 10,
            "cost_per_user": 8,
            "monthly_cost": 80
        }
    }

    total = sum(c["monthly_cost"] for c in costs.values())

    return {
        "breakdown": costs,
        "total_monthly_cost": total,
        "annual_cost": total * 12
    }

# Optimization recommendations
def monitoring_optimizations():
    return [
        "Use sampling for traces (10% instead of 100%)",
        "Implement log retention policies (30 days for info, 90 days for errors)",
        "Use metric aggregation for high-cardinality data",
        "Archive old logs to S3 Glacier",
        "Use spot instances for non-critical monitoring infrastructure"
    ]
```

## Monitoring Checklist

### Daily Checks

- [ ] Review error rate trends
- [ ] Check API latency percentiles
- [ ] Monitor active user count
- [ ] Verify backup completion
- [ ] Review security alerts

### Weekly Checks

- [ ] Analyze slow query logs
- [ ] Review capacity metrics
- [ ] Check certificate expiration
- [ ] Validate alerting rules
- [ ] Review cost optimization opportunities

### Monthly Checks

- [ ] Conduct monitoring drill
- [ ] Review and update dashboards
- [ ] Analyze incident trends
- [ ] Update runbooks
- [ ] Performance baseline review

---

Last Updated: January 2025
Version: 1.0.0
