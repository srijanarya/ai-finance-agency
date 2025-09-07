# 🧪 N8N Testing & Maintenance Guide

## Testing Procedures

### 1. Market Data Collection Test
```bash
# Test Yahoo Finance API
curl -X POST https://your-n8n.com/webhook/test-market-data \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Expected response:
# {
#   "marketData": {
#     "nifty": { "price": 24600, "change": 1.2 },
#     "banknifty": { "price": 54100, "change": 0.8 },
#     "sensex": { "price": 81500, "change": 1.0 }
#   }
# }
```

### 2. Content Generation Test
```bash
# Test OpenAI integration
curl -X POST https://your-n8n.com/webhook/test-content-generation \
  -H "Content-Type: application/json" \
  -d '{"contentType": "market_analysis", "test": true}'

# Test different content types
for type in market_analysis educational options_insight; do
  curl -X POST https://your-n8n.com/webhook/test-content-generation \
    -H "Content-Type: application/json" \
    -d "{\"contentType\": \"$type\", \"test\": true}"
done
```

### 3. Platform Publishing Test
```bash
# Test individual platforms
for platform in telegram linkedin twitter; do
  curl -X POST https://your-n8n.com/webhook/test-publishing \
    -H "Content-Type: application/json" \
    -d "{\"platform\": \"$platform\", \"content\": \"Test message\", \"test\": true}"
done
```

### 4. End-to-End Test
```bash
# Complete workflow test
curl -X POST https://your-n8n.com/webhook/e2e-test \
  -H "Content-Type: application/json" \
  -d '{"triggerFullWorkflow": true}'
```

## 🔐 Security & Compliance

### SEBI Compliance Checklist

- ✅ **All content includes disclaimers**
  ```
  Disclaimer: This is for educational purposes only. Not investment advice.
  ```
- ✅ **No guaranteed returns mentioned**
- ✅ **Educational content only**
- ✅ **Risk warnings prominent**
- ✅ **No personalized advice**
- ✅ **Clear company identification**

### Security Best Practices

1. **🔒 Use environment variables for secrets**
   - Never hardcode API keys
   - Use N8N credentials system
   - Rotate keys quarterly

2. **🔒 Enable N8N authentication**
   ```bash
   N8N_BASIC_AUTH_ACTIVE=true
   N8N_BASIC_AUTH_USER=admin
   N8N_BASIC_AUTH_PASSWORD=secure-password
   ```

3. **🔒 Implement rate limiting**
   - Configure per-platform limits
   - Monitor API usage
   - Set up alerts for threshold breaches

4. **🔒 Regular backup of database**
   ```bash
   # Daily backup script
   pg_dump -U postgres ai_finance_agency > backup_$(date +%Y%m%d).sql
   ```

5. **🔒 Monitor for anomalies**
   - Check unusual posting patterns
   - Monitor error rates
   - Track API response times

6. **🔒 Encrypt sensitive data**
   - Use SSL/TLS for all connections
   - Encrypt database at rest
   - Secure credential storage

## 📈 Scaling Guidelines

### Performance Optimization

1. **Database Indexing**
   ```sql
   -- Ensure all frequently queried columns are indexed
   CREATE INDEX idx_content_timestamp ON content_history(created_at);
   CREATE INDEX idx_publishing_platform ON publishing_log(platform, posted_at);
   ```

2. **Caching Strategy**
   - Implement Redis for frequently accessed data
   - Cache market data for 1 minute
   - Cache generated content for deduplication

3. **Parallel Processing**
   - Use N8N's parallel execution for independent tasks
   - Process multiple platforms simultaneously
   - Batch database operations

4. **Resource Allocation**
   ```yaml
   # Docker resource limits
   services:
     n8n:
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 4G
   ```

### Adding New Platforms

1. **Create platform-specific formatting**
   - Add new format function in Content Generation workflow
   - Define character limits and hashtags
   - Implement platform-specific disclaimers

2. **Add routing logic**
   - Update Publishing workflow switch node
   - Add new platform credentials
   - Configure platform-specific scheduling

3. **Update database schema**
   ```sql
   ALTER TABLE publishing_log ADD COLUMN new_platform_status VARCHAR(20);
   ```

4. **Add platform-specific rate limiting**
   ```sql
   INSERT INTO api_rate_limits (platform, requests_limit, reset_time) 
   VALUES ('new_platform', 200, NOW() + INTERVAL '1 hour');
   ```

5. **Update monitoring metrics**
   - Add platform to monitoring workflow
   - Configure platform-specific alerts
   - Update dashboard queries

## 🛠️ Maintenance Schedule

### Daily Tasks
- [ ] Check monitoring dashboard
- [ ] Review error logs
- [ ] Verify content quality
- [ ] Check API rate limits
- [ ] Validate posting schedule

### Weekly Tasks
- [ ] Database backup
- [ ] Performance review
- [ ] Content variety analysis
- [ ] API usage audit
- [ ] Clean old logs

### Monthly Tasks
- [ ] Update market data sources
- [ ] Review and optimize prompts
- [ ] Analyze engagement metrics
- [ ] Security audit
- [ ] Update dependencies

## 📊 Custom Metrics Dashboard

### SQL Queries for Monitoring

```sql
-- Content Generation Rate
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as posts_generated
FROM content_history
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;

-- Platform Success Rate
SELECT 
  platform,
  COUNT(*) as total_attempts,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as successes,
  ROUND(COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
FROM publishing_log
WHERE posted_at > NOW() - INTERVAL '7 days'
GROUP BY platform;

-- API Usage vs Limits
SELECT 
  a.platform,
  a.requests_made,
  a.requests_limit,
  ROUND(a.requests_made * 100.0 / a.requests_limit, 2) as usage_percentage,
  CASE 
    WHEN a.requests_made * 100.0 / a.requests_limit > 80 THEN 'WARNING'
    WHEN a.requests_made * 100.0 / a.requests_limit > 90 THEN 'CRITICAL'
    ELSE 'OK'
  END as status
FROM api_rate_limits a;

-- Content Diversity Score
SELECT 
  content_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM content_history
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY content_type;

-- System Health Check
SELECT 
  'Uptime' as metric,
  EXTRACT(EPOCH FROM (NOW() - MIN(created_at))) / 3600 as hours,
  'hours' as unit
FROM system_metrics
UNION ALL
SELECT 
  'Error Rate' as metric,
  ROUND(COUNT(CASE WHEN status = 'failed' THEN 1 END) * 100.0 / COUNT(*), 2) as value,
  '%' as unit
FROM publishing_log
WHERE posted_at > NOW() - INTERVAL '24 hours';
```

## 🎯 Success Criteria

Your system is successful when:

- ✅ **99.9% uptime achieved**
  ```bash
  # Check uptime
  curl https://your-n8n.com/webhook/health-check
  ```

- ✅ **Zero duplicate content in 7 days**
  ```sql
  SELECT COUNT(*) FROM content_history 
  WHERE content_hash IN (
    SELECT content_hash FROM content_history 
    GROUP BY content_hash HAVING COUNT(*) > 1
  );
  ```

- ✅ **All platforms posting on schedule**
- ✅ **<1% error rate**
- ✅ **Varied content types daily**
- ✅ **Compliance maintained 100%**
- ✅ **Fully autonomous operation**

## 🚀 Quick Start Commands

```bash
# Clone and setup
git clone your-repo
cd ai-finance-agency
cp .env.n8n .env
# Edit .env with your credentials

# Start the system
docker-compose -f docker-compose-n8n.yml up -d

# Import workflows
docker exec -it n8n-finance n8n import:workflow --input=/workflows/

# Monitor logs
docker logs -f n8n-finance

# Check system health
curl https://your-n8n.com/webhook/health-check

# Stop the system
docker-compose -f docker-compose-n8n.yml down

# Backup database
docker exec n8n-postgres pg_dump -U postgres ai_finance_agency > backup.sql

# Restore database
docker exec -i n8n-postgres psql -U postgres ai_finance_agency < backup.sql
```

## 🔍 Debugging Commands

```bash
# Check workflow execution history
docker exec n8n-finance n8n execute list

# Debug specific workflow
docker exec n8n-finance n8n execute get <execution-id>

# Test database connection
docker exec n8n-postgres psql -U postgres -c "SELECT NOW();"

# Check Redis status
docker exec n8n-redis redis-cli ping

# View error logs
docker logs n8n-finance 2>&1 | grep ERROR

# Monitor resource usage
docker stats n8n-finance n8n-postgres n8n-redis
```

## 📝 Troubleshooting Guide

### Issue: Workflows not triggering
```bash
# Check webhook URL
curl -I https://your-n8n.com/webhook/test
# Should return 200 OK

# Check N8N logs
docker logs n8n-finance | tail -100
```

### Issue: Database connection failed
```bash
# Test connection
docker exec n8n-postgres pg_isready

# Check credentials
docker exec n8n-finance env | grep DB_
```

### Issue: Content generation failing
```bash
# Test OpenAI key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"

# Check quota
# Visit https://platform.openai.com/usage
```

### Issue: Platform posting errors
```bash
# Verify credentials in N8N UI
# Settings → Credentials → Test Connection

# Check rate limits
docker exec n8n-postgres psql -U postgres -d ai_finance_agency \
  -c "SELECT * FROM api_rate_limits;"
```

---

This complete N8N system replaces all your Python scripts with visual, maintainable, and scalable workflows. The system is designed to run 24/7 autonomously while maintaining compliance, variety, and quality in your financial content generation.

**Support**: For issues, check logs first, then consult N8N documentation or create an issue in the repository.