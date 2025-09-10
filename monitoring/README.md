# AI Finance Agency - Monitoring Stack

A comprehensive monitoring solution with Prometheus, Grafana, and AlertManager for the AI Finance Agency microservices architecture.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Microservices │───▶│   Prometheus    │───▶│     Grafana     │
│   (10 services) │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  AlertManager   │───▶│ Notifications   │
                       │                 │    │ (Email/Slack)   │
                       └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- AI Finance Agency microservices running
- Ports 9090, 3001, 9093 available

### 1. Start Monitoring Stack

```bash
# Make the script executable (if not already)
chmod +x scripts/start-monitoring.sh

# Start monitoring stack
./scripts/start-monitoring.sh start
```

### 2. Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Prometheus** | http://localhost:9090 | None |
| **Grafana** | http://localhost:3001 | admin / admin123 |
| **AlertManager** | http://localhost:9093 | None |
| **cAdvisor** | http://localhost:8080 | None |

### 3. View Dashboards

Navigate to Grafana and explore the pre-configured dashboards:
- Infrastructure Overview
- API Gateway Dashboard
- Trading Service Dashboard
- Payment Service Dashboard
- Business Metrics Dashboard

## 📊 Monitoring Features

### Service Metrics
- **Health Monitoring**: Service uptime and availability
- **Performance**: Request rates, response times, error rates
- **Resources**: CPU, memory, disk usage per service
- **Database**: Connection pools, query performance
- **Message Queues**: Queue depths, processing rates

### Business Metrics
- **Revenue**: Real-time revenue tracking and trends
- **Trading**: Volume, trades, PnL, risk metrics
- **Payments**: Transaction success rates, processing times
- **Users**: Active sessions, registrations, engagement
- **Signals**: Generation rates, accuracy, execution

### Infrastructure Metrics
- **System**: CPU, memory, disk, network I/O
- **Containers**: Resource usage per container
- **Databases**: PostgreSQL, Redis, MongoDB metrics
- **Load Balancer**: Nginx traffic and performance

## 🚨 Alerting

### Alert Categories

1. **Critical Alerts** (Immediate Response)
   - Service down
   - High error rates (>10%)
   - Payment system failures
   - Trading system issues

2. **Warning Alerts** (Monitor Closely)
   - High resource usage
   - Slow response times
   - Database connection issues
   - Queue backlogs

3. **Business Alerts** (Revenue Impact)
   - Low trading volume
   - Payment failures
   - High churn rate
   - Signal accuracy drops

### Notification Channels

- **Email**: Configured per alert severity
- **Slack**: Real-time notifications
- **SMS**: Critical alerts only (webhook)

## 📁 Directory Structure

```
monitoring/
├── prometheus/
│   ├── prometheus.yml          # Main Prometheus config
│   └── alert.rules.yml         # Alerting rules
├── grafana/
│   ├── dashboards/             # Dashboard JSON files
│   └── provisioning/           # Auto-provisioning config
│       ├── datasources/        # Prometheus datasource
│       └── dashboards/         # Dashboard provisioning
├── alertmanager/
│   └── alertmanager.yml        # Alert routing config
├── exporters/
│   └── postgres/
│       └── queries.yaml        # Custom PostgreSQL queries
├── data/                       # Persistent data (auto-created)
│   ├── prometheus/
│   ├── grafana/
│   └── alertmanager/
└── docker-compose.monitoring.yml
```

## ⚙️ Configuration

### Prometheus Configuration

- **Scrape Interval**: 15s (5s for critical services)
- **Retention**: 30 days
- **Storage**: 10GB limit
- **Targets**: All 10 microservices + infrastructure

### Grafana Configuration

- **Default User**: admin / admin123
- **Data Sources**: Auto-provisioned Prometheus
- **Dashboards**: Auto-loaded from JSON files
- **Plugins**: Clock, Piechart, Worldmap

### AlertManager Configuration

- **Grouping**: By service and severity
- **Routing**: Different channels per alert type
- **Inhibition**: Suppress redundant alerts
- **Repeat Interval**: Based on severity

## 🔧 Adding Metrics to Services

### For Node.js/TypeScript Services

1. **Install Dependencies**
   ```bash
   npm install prom-client
   ```

2. **Add Metrics Middleware**
   ```typescript
   import { paymentMetrics } from './middleware/metrics.middleware';
   
   // Record business event
   paymentMetrics.transactionsTotal.inc({
       status: 'success',
       method: 'stripe',
       currency: 'USD'
   });
   ```

3. **Add Endpoints**
   ```typescript
   app.get('/metrics', metricsEndpoint);
   app.get('/health', healthEndpoint);
   ```

### Custom Business Metrics

```typescript
// Payment service example
paymentMetrics.revenueTotal.inc({ method: 'stripe' }, 99.99);
paymentMetrics.subscriptionNew.inc({ plan_type: 'premium' });

// Trading service example
tradingMetrics.volumeTotal.inc({ pair: 'BTC/USD' }, 1.5);
tradingMetrics.tradesTotal.inc({ status: 'executed' });

// Signals service example
signalsMetrics.generated.inc({ type: 'buy_signal' });
signalsMetrics.accuracy.set(0.85); // 85% accuracy
```

## 📈 Dashboard Customization

### Creating Custom Dashboards

1. **Via Grafana UI**: Create and save dashboards
2. **JSON Export**: Export dashboard JSON for version control
3. **Auto-Provisioning**: Place JSON in `grafana/dashboards/`

### Key Metrics to Monitor

**Service Health**:
- `up{job="service-name"}` - Service availability
- `http_requests_total` - Request rates
- `http_request_duration_seconds` - Response times

**Business KPIs**:
- `payment_revenue_total` - Revenue tracking
- `trading_volume_total` - Trading activity
- `user_registrations_total` - Growth metrics

**Infrastructure**:
- `node_memory_MemAvailable_bytes` - Available memory
- `rate(container_cpu_usage_seconds_total[5m])` - CPU usage
- `pg_stat_activity_count` - Database connections

## 🛠️ Operations

### Starting/Stopping Services

```bash
# Start monitoring stack
./scripts/start-monitoring.sh start

# Stop monitoring stack
./scripts/start-monitoring.sh stop

# Restart monitoring stack
./scripts/start-monitoring.sh restart

# Check service status
./scripts/start-monitoring.sh status

# View logs
./scripts/start-monitoring.sh logs
./scripts/start-monitoring.sh logs prometheus
```

### Maintenance Tasks

**Daily**:
- Check alert status
- Verify all services are reporting metrics
- Review error rates and performance

**Weekly**:
- Update dashboards based on business needs
- Review alert thresholds
- Check disk usage for metrics storage

**Monthly**:
- Export important dashboards for backup
- Review and update alert rules
- Performance tune Prometheus queries

## 🔒 Security Considerations

### Access Control
- Change default Grafana credentials
- Use environment variables for sensitive config
- Restrict network access to monitoring ports

### Data Protection
- Metrics data contains business information
- Consider encryption for external storage
- Regular backup of dashboard configurations

### Alert Security
- Secure webhook URLs
- Use encrypted email for sensitive alerts
- Validate alert sources

## 🚨 Troubleshooting

### Common Issues

**Prometheus not scraping services**:
```bash
# Check service discovery
curl http://localhost:9090/api/v1/targets

# Verify service metrics endpoint
curl http://service-name:port/metrics
```

**Grafana dashboards not loading**:
```bash
# Check provisioning logs
docker logs ai_finance_grafana_monitoring

# Verify dashboard JSON syntax
cat monitoring/grafana/dashboards/dashboard-name.json | jq .
```

**Alerts not firing**:
```bash
# Check alert rules
curl http://localhost:9090/api/v1/rules

# Verify AlertManager config
curl http://localhost:9093/api/v1/status
```

### Performance Tuning

**High Memory Usage**:
- Increase retention settings
- Add more specific metric filters
- Use recording rules for complex queries

**Slow Queries**:
- Optimize dashboard queries
- Use shorter time ranges
- Add query caching

**High Cardinality**:
- Limit label values
- Use label dropping/renaming
- Implement metric sampling

## 📞 Support

For issues with the monitoring setup:

1. Check service logs: `./scripts/start-monitoring.sh logs`
2. Verify configuration files
3. Review Prometheus targets: http://localhost:9090/targets
4. Check Grafana data sources: http://localhost:3001/datasources

## 🎯 Business Impact

This monitoring solution provides:

- **99.9% Uptime Visibility**: Real-time service health monitoring
- **Revenue Protection**: Immediate alerts on payment system issues
- **Performance Optimization**: Detailed metrics for capacity planning
- **Business Intelligence**: KPI tracking and trend analysis
- **Proactive Alerting**: Early warning system for issues
- **Compliance**: Audit trail for all system activities

The comprehensive metrics collection enables data-driven decisions and ensures the AI Finance Agency can maintain high service quality while scaling operations.