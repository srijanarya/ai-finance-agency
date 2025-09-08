# 🎯 Centralized Posting Queue System

**Complete solution for preventing duplicate posts and coordinating all posting activities across LinkedIn, Twitter, and Telegram.**

## 🚀 Overview

The Centralized Posting Queue System is the **single source of truth** for all posts in the AI Finance Agency. It prevents duplicates, enforces rate limits, and coordinates posting across all platforms.

### 🎯 Key Features

- ✅ **Zero Duplicates**: Content hashing prevents any duplicate posts
- ⏰ **Smart Rate Limiting**: Platform-specific hourly and daily limits
- 🔄 **Automatic Processing**: Queue daemon processes posts automatically
- 📊 **Real-time Monitoring**: Web dashboard for queue status and control
- 🎪 **Priority System**: Urgent news gets posted first
- 🔄 **Retry Mechanism**: Failed posts are retried automatically
- 📈 **Analytics**: Track posting success rates and duplicate prevention

## 📁 Core Files

### 1. `centralized_posting_queue.py` - Main Queue System
The heart of the system. Handles all queue operations, duplicate detection, and posting.

**Key Classes:**
- `CentralizedPostingQueue`: Main queue management
- `QueueItem`: Individual post data structure
- `Platform`, `Priority`, `PostStatus`: Enums for organization

### 2. `queue_monitor_dashboard.py` - Web Dashboard
Flask app for monitoring and managing the queue (Port 5001).

**Features:**
- Real-time queue status
- Platform rate limit monitoring
- Recent posts tracking
- Manual queue processing
- Test posting interface

### 3. `approval_dashboard_queue.py` - Content Approval System
Enhanced approval dashboard integrated with the queue (Port 5002).

**Features:**
- Generate and queue content for approval
- Bulk approve/reject operations
- Preview content before approval
- Integration with quality system

### 4. `queue_processor_daemon.py` - Automated Processing
Background daemon that automatically processes the queue.

**Schedule:**
- Queue processing: Every 10 minutes
- Health checks: Every 30 minutes
- Cleanup: Every hour

### 5. Updated Integration Files
- `cloud_poster.py` - Modified to use centralized queue
- `realtime_news_telegram_queue.py` - News monitor with queue integration

## 🔧 Installation & Setup

### 1. Install Dependencies
```bash
pip install sqlite3 flask tweepy requests python-dotenv openai schedule
```

### 2. Environment Variables
Ensure your `.env` file contains:
```env
# LinkedIn
LINKEDIN_ACCESS_TOKEN=your_linkedin_token

# Twitter/X
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_CONSUMER_KEY=your_consumer_key
TWITTER_CONSUMER_SECRET=your_consumer_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHANNEL_ID=@AIFinanceNews2024

# OpenAI
OPENAI_API_KEY=your_openai_key
```

### 3. Initialize Database
The SQLite database is created automatically on first run.

## 🚀 Usage Guide

### Start the System

1. **Start Queue Monitor Dashboard** (Port 5001):
```bash
python queue_monitor_dashboard.py
```

2. **Start Approval Dashboard** (Port 5002):
```bash
python approval_dashboard_queue.py
```

3. **Start Queue Processor Daemon**:
```bash
python queue_processor_daemon.py
```

### Access Interfaces

- **Queue Monitor**: http://localhost:5001
- **Approval Dashboard**: http://localhost:5002

### Command Line Operations

#### Check Queue Status
```bash
python queue_processor_daemon.py status
```

#### Process Queue Manually
```bash
python queue_processor_daemon.py process
```

#### Clean Up Old Items
```bash
python queue_processor_daemon.py cleanup 7  # 7 days old
```

#### Test News Monitor
```bash
python realtime_news_telegram_queue.py test
```

#### Test Cloud Poster
```bash
python cloud_poster.py
```

## 📊 API Reference

### Core Queue Methods

#### Add to Queue
```python
from centralized_posting_queue import posting_queue, Platform, Priority

result = posting_queue.add_to_queue(
    content="Your post content",
    platform=Platform.LINKEDIN.value,
    priority=Priority.HIGH,
    source="your_app_name",
    metadata={"custom": "data"}
)
```

#### Process Queue
```python
results = posting_queue.process_queue(max_items=5)
print(f"Posted: {results['successful']}")
print(f"Failed: {results['failed']}")
print(f"Skipped: {results['skipped']}")
```

#### Check Status
```python
status = posting_queue.get_queue_status()
print(f"Pending: {status['queue_counts']['pending']}")
print(f"Duplicates prevented: {status['duplicate_stats']['duplicates_prevented']}")
```

### Web API Endpoints

#### Queue Monitor Dashboard (Port 5001)
- `GET /` - Dashboard view
- `GET /api/status` - Queue status JSON
- `POST /api/queue/add` - Add item to queue
- `POST /api/queue/process` - Process queue
- `POST /api/queue/cleanup` - Clean old items

#### Approval Dashboard (Port 5002)
- `GET /` - Approval interface
- `POST /generate` - Generate content
- `POST /approve/<item_id>` - Approve item
- `POST /reject/<item_id>` - Reject item
- `POST /bulk-approve` - Bulk approve items

## 🔄 Integration Guide

### Integrate Your Posting System

1. **Import the Queue**:
```python
from centralized_posting_queue import posting_queue, Platform, Priority
```

2. **Replace Direct Posting**:
```python
# Old way - Direct posting
# post_to_platform(content)

# New way - Queue-based
result = posting_queue.add_to_queue(
    content=content,
    platform=Platform.LINKEDIN.value,
    priority=Priority.NORMAL,
    source="your_system_name"
)

if result['success']:
    print(f"Queued: {result['item_id']}")
else:
    if result.get('reason') == 'duplicate':
        print("Duplicate prevented!")
```

3. **Check Before Adding** (Optional):
```python
# Check for duplicates manually
content_hash = posting_queue.generate_content_hash(content)
if posting_queue.is_duplicate(content_hash):
    print("Content is duplicate, skipping")
else:
    # Add to queue
```

## 📈 Rate Limits & Settings

### Default Platform Limits
- **LinkedIn**: 2/hour, 5/day
- **Twitter**: 5/hour, 20/day  
- **Telegram**: 10/hour, 50/day

### Minimum Gap Between Posts
- **All Platforms**: 30 minutes

### Priority Levels
- **LOW (1)**: Regular content
- **NORMAL (2)**: Standard posts
- **HIGH (3)**: Important updates
- **URGENT (4)**: Breaking news (bypasses some delays)

## 🛡️ Duplicate Prevention

### How It Works
1. **Content Hashing**: SHA-256 of normalized content
2. **Cross-Platform**: Checks duplicates across ALL platforms
3. **Normalization**: Removes formatting differences
4. **Smart Comparison**: Ignores minor variations

### Content Normalization
- Convert to lowercase
- Strip extra whitespace
- Remove multiple newlines
- Consistent spacing

## 📊 Monitoring & Analytics

### Queue Status Dashboard
- Real-time queue counts
- Platform rate limit status
- Recent posting activity
- Duplicate prevention stats
- Failed post alerts

### Log Files
- `posting_queue.log` - Main queue operations
- `queue_processor.log` - Daemon activity

### Health Checks
- Stuck items detection
- Rate limit monitoring
- Failed post analysis
- System performance metrics

## 🚨 Troubleshooting

### Common Issues

#### 1. Queue Not Processing
```bash
# Check daemon status
python queue_processor_daemon.py status

# Process manually
python queue_processor_daemon.py process
```

#### 2. Database Locked
```bash
# Stop all processes using the queue
pkill -f queue_processor_daemon
pkill -f queue_monitor_dashboard

# Restart systems
```

#### 3. High Failed Count
```bash
# Check failed items
python queue_processor_daemon.py status

# View detailed logs
tail -f posting_queue.log
```

#### 4. Duplicate Detection Issues
```bash
# Check content hash generation
python -c "
from centralized_posting_queue import posting_queue
hash1 = posting_queue.generate_content_hash('test content')
hash2 = posting_queue.generate_content_hash('test content')
print(f'Same hash: {hash1 == hash2}')
"
```

### Rate Limit Exceeded
If you hit rate limits, the system will automatically skip posting until limits reset. Check the dashboard for rate limit status.

### Database Corruption
If the SQLite database becomes corrupted:
```bash
# Backup current database
cp posting_queue.db posting_queue.db.backup

# Delete and reinitialize
rm posting_queue.db
python centralized_posting_queue.py
```

## 🔮 Advanced Configuration

### Custom Rate Limits
Edit `centralized_posting_queue.py`:
```python
self.platform_limits = {
    Platform.LINKEDIN.value: {"daily": 10, "hourly": 3},  # Custom limits
    Platform.TWITTER.value: {"daily": 30, "hourly": 8},
    Platform.TELEGRAM.value: {"daily": 100, "hourly": 20}
}
```

### Custom Minimum Gap
```python
self.min_gap_minutes = 45  # 45 minutes between posts
```

### Priority Weights
Modify queue processing to respect priority levels differently by editing the `get_next_items_to_post` method.

## 🎯 Best Practices

### 1. Content Guidelines
- Make content unique and valuable
- Use appropriate priority levels
- Include relevant metadata
- Test with low priority first

### 2. System Management
- Monitor dashboards regularly
- Check logs for errors
- Keep daemon running
- Clean up old items weekly

### 3. Integration
- Always check return values
- Handle duplicate responses gracefully
- Use appropriate priorities
- Include source identification

## 🔄 Migration from Old Systems

### Step 1: Update Existing Code
Replace direct posting calls with queue-based calls.

### Step 2: Run Both Systems Temporarily
Keep old systems running while testing the new queue.

### Step 3: Monitor and Verify
Use dashboards to ensure no duplicates and proper posting.

### Step 4: Disable Old Systems
Once confident, disable direct posting systems.

## 📝 System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Content Sources │    │ Centralized      │    │ Social Platforms│
│                 │    │ Posting Queue    │    │                 │
│ • Cloud Poster  │───▶│                  │───▶│ • LinkedIn      │
│ • News Monitor  │    │ • Deduplication  │    │ • Twitter/X     │
│ • Manual Posts  │    │ • Rate Limiting  │    │ • Telegram      │
│ • API Requests  │    │ • Priority Queue │    │                 │
└─────────────────┘    │ • Retry Logic    │    └─────────────────┘
                       └──────────────────┘
                               │
                   ┌───────────┼───────────┐
                   │           │           │
        ┌──────────▼─┐  ┌──────▼──────┐  ┌─▼─────────────┐
        │ Queue      │  │ Approval    │  │ Processor     │
        │ Monitor    │  │ Dashboard   │  │ Daemon        │
        │ (Port 5001)│  │ (Port 5002) │  │ (Background)  │
        └────────────┘  └─────────────┘  └───────────────┘
```

## ✅ Success Metrics

After implementing the centralized queue system, you should see:

- **Zero duplicate posts** across all platforms
- **Consistent posting schedule** with proper gaps
- **Higher success rate** due to retry mechanisms
- **Better analytics** and monitoring capabilities
- **Easier management** through web dashboards

## 🆘 Support

For issues or questions:
1. Check the logs (`posting_queue.log`, `queue_processor.log`)
2. Review the dashboard status at http://localhost:5001
3. Run diagnostic commands (`python queue_processor_daemon.py status`)
4. Check database integrity and permissions

---

**The Centralized Posting Queue System ensures your AI Finance Agency never posts duplicates again while maintaining optimal posting schedules across all social media platforms!** 🚀