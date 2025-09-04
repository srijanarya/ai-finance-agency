# N8N Workflow Integration - AI Finance Content Agency

## Overview
Complete n8n automation workflow for AI-powered finance content generation with Reddit trend scanning, dual-AI generation (Claude + GPT-4), multi-channel distribution, and performance tracking.

## Workflow Features

### 1. **Automated Triggers**
- Runs every 30 minutes automatically
- Manual trigger available for on-demand generation
- Reddit trend scanning for high-engagement topics

### 2. **Content Pipeline**
- **Reddit Scanner**: Monitors r/personalfinance for trending topics (1000+ upvotes)
- **Claude Generation**: Creates comprehensive 1500-word articles
- **GPT-4 Enhancement**: Optimizes for engagement and readability
- **Compliance Check**: Adds FINRA-compliant disclaimers
- **SEO Optimization**: Extracts keywords and meta descriptions

### 3. **Multi-Channel Distribution**
- WordPress publishing
- LinkedIn posting
- Twitter updates
- Slack notifications
- Email campaigns

### 4. **Performance Tracking**
- Engagement score tracking
- Cost savings calculation
- Time efficiency metrics
- Dashboard updates

## Setup Instructions

### 1. Import Workflow to n8n

1. Open your n8n instance
2. Go to **Workflows** → **Import**
3. Select `ai_finance_content_agency.json`
4. Click **Import**

### 2. Configure Credentials

You'll need to set up the following credentials in n8n:

#### Claude API (Anthropic)
```
Name: Claude API
Type: HTTP Header Auth
Header Name: x-api-key
Header Value: YOUR_ANTHROPIC_API_KEY
```

#### OpenAI API
```
Name: OpenAI API
Type: HTTP Header Auth
Header Name: Authorization
Header Value: Bearer YOUR_OPENAI_API_KEY
```

#### Reddit OAuth2
```
Client ID: YOUR_REDDIT_CLIENT_ID
Client Secret: YOUR_REDDIT_CLIENT_SECRET
Authorization URL: https://www.reddit.com/api/v1/authorize
Access Token URL: https://www.reddit.com/api/v1/access_token
```

#### Airtable
```
API Key: YOUR_AIRTABLE_API_KEY
Base ID: YOUR_BASE_ID
Table ID: YOUR_TABLE_ID
```

#### WordPress
```
URL: https://your-site.com
Username: YOUR_USERNAME
Password: YOUR_APP_PASSWORD
```

#### LinkedIn
```
Follow LinkedIn OAuth2 setup in n8n documentation
```

#### Twitter/X
```
API Key: YOUR_TWITTER_API_KEY
API Secret: YOUR_TWITTER_API_SECRET
Access Token: YOUR_ACCESS_TOKEN
Access Token Secret: YOUR_ACCESS_TOKEN_SECRET
```

#### Slack
```
OAuth Access Token: YOUR_SLACK_TOKEN
Channel: #content-published
```

### 3. Start Webhook Server

Run the webhook integration server to connect n8n with your AI Finance Agency:

```bash
# Install Flask if needed
pip install flask

# Start the webhook server
python n8n_webhook_endpoint.py
```

The server will run on `http://localhost:5000`

### 4. Configure Webhook URLs

In the n8n workflow, update these webhook URLs:

1. **Dashboard Webhook**: Set environment variable
   ```
   DASHBOARD_WEBHOOK_URL=http://localhost:5000/webhook/n8n/metrics
   ```

2. **Content Trigger**: Use in HTTP Request nodes
   ```
   http://localhost:5000/webhook/n8n/trigger
   ```

### 5. Test the Workflow

1. Click **Execute Workflow** in n8n for manual test
2. Check execution logs for any errors
3. Verify content appears in configured channels

## Integration with Multi-Agent Orchestrator

The n8n workflow can trigger your Python-based multi-agent orchestrator:

```python
# Trigger from n8n
POST http://localhost:5000/webhook/n8n/trigger
{
  "content_type": "blog",
  "topic": "Market Analysis for Q1 2025",
  "platforms": ["telegram", "linkedin"],
  "priority": "high"
}

# Response
{
  "status": "success",
  "pipeline_id": "pipeline_20250904_180000",
  "content": {
    "title": "Market Analysis for Q1 2025: Your Complete Guide",
    "word_count": 1543,
    "keywords": ["market", "analysis", "q1", "2025", "investing"]
  },
  "quality_metrics": {
    "quality_score": 9.2,
    "readability_score": 8.7
  }
}
```

## API Endpoints

### Trigger Content Generation
```
POST /webhook/n8n/trigger
```

### Get Metrics
```
GET /webhook/n8n/metrics
```

### Get Content by ID
```
GET /webhook/n8n/content/{pipeline_id}
```

### Health Check
```
GET /webhook/n8n/health
```

## Monitoring & Metrics

The workflow tracks:
- **Content Generated**: Total articles created
- **Engagement Score**: Reddit upvotes + comments
- **Time Saved**: 6 hours per article
- **Cost Savings**: $75/hour traditional cost
- **Efficiency Gain**: 99x faster than manual

## Troubleshooting

### Common Issues

1. **API Rate Limits**
   - Reddit: 60 requests/minute
   - Claude: Based on your plan
   - GPT-4: Based on your plan
   - Solution: Adjust cron frequency

2. **Authentication Errors**
   - Verify all API keys are correct
   - Check OAuth2 tokens haven't expired
   - Regenerate tokens if needed

3. **Webhook Connection**
   - Ensure webhook server is running
   - Check firewall/port settings
   - Verify URLs are correct

## Advanced Configuration

### Custom Content Types

Modify the Filter & Sort Topics node to add custom content angles:

```javascript
function extractContentAngle(title) {
  const titleLower = title.toLowerCase();
  
  // Add your custom logic here
  if (titleLower.includes('crypto')) {
    return 'cryptocurrency';
  } else if (titleLower.includes('retirement')) {
    return 'retirement_planning';
  }
  // ... more conditions
}
```

### Adjust Quality Thresholds

In the Filter node, change the minimum upvotes:

```javascript
// Change from 1000 to your preferred threshold
if (postData.ups >= 500) {
  // Process post
}
```

## Support & Resources

- n8n Documentation: https://docs.n8n.io
- Claude API: https://docs.anthropic.com
- OpenAI API: https://platform.openai.com/docs
- Reddit API: https://www.reddit.com/dev/api

## License

This workflow is part of the AI Finance Agency project.
For commercial use, please contact the development team.