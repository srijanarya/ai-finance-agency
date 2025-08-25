# 🚀 AI Finance Agency

An autonomous research agent that scans financial markets, analyzes trends, and generates content ideas for financial publications.

## Features

### 🔍 Research Agent
- **Multi-source data collection**: RSS feeds from Bloomberg, Yahoo Finance, MarketWatch, Reuters, CNBC, WSJ
- **Real-time market analysis**: Stock prices, indices, sector performance
- **Intelligent content classification**: News analysis, market analysis, educational content, trading signals
- **Keyword extraction and trend tracking**: Automatic identification of relevant financial terms
- **Relevance scoring**: Smart filtering based on keyword importance and content quality

### 📊 Web Dashboard
- **Real-time monitoring**: Live view of research agent activity
- **Content idea management**: View, filter, and track content ideas
- **Trending keywords**: Visual display of hot topics
- **Performance metrics**: Statistics on content generation and relevance scores
- **Manual scan trigger**: On-demand research scans

### 🗄️ Data Management
- **SQLite database**: Structured storage of topics, ideas, and keywords
- **Automatic deduplication**: Prevents duplicate content ideas
- **Historical tracking**: Performance metrics and trend analysis
- **Backup support**: Database backup configuration

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-finance-agency

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

### 2. Configuration

Edit `.env` file with your API keys:

```bash
# Financial Data APIs (optional but recommended)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
FINNHUB_API_KEY=your_finnhub_key
NEWS_API_KEY=your_newsapi_key

# Agent Configuration
RESEARCH_INTERVAL_MINUTES=30
MIN_RELEVANCE_SCORE=7
MAX_IDEAS_PER_SCAN=20
```

### 3. Run the System

```bash
# Start the research agent (continuous mode)
python run.py agent

# Run a single research scan
python run.py scan

# Start the web dashboard
python run.py dashboard
```

### 4. Access Dashboard

Open your browser and go to: http://localhost:5000

## Project Structure

```
ai-finance-agency/
├── agents/
│   └── research_agent.py      # Main research agent
├── config/
│   └── config.py             # Configuration management
├── data/                     # Database and data files
├── logs/                     # Log files
├── templates/
│   └── dashboard.html        # Web dashboard template
├── dashboard.py              # Flask web application
├── run.py                   # Main CLI interface
├── requirements.txt         # Python dependencies
├── .env.example            # Environment template
└── README.md               # This file
```

## API Endpoints

The dashboard provides REST API endpoints:

- `GET /api/stats` - Dashboard statistics
- `GET /api/ideas` - Recent content ideas
- `GET /api/keywords` - Trending keywords
- `GET /api/topics` - Research topics
- `POST /api/scan` - Trigger manual scan
- `POST /api/idea/<id>/publish` - Mark idea as published

## Content Types

The system generates different types of content ideas:

- **News Analysis**: Deep dives into breaking financial news
- **Market Analysis**: Technical and fundamental market movements
- **Educational**: How-to guides and explanatory content
- **Trading Signals**: Actionable trading recommendations
- **Sector Reports**: Industry-specific analysis
- **Earnings Previews**: Upcoming earnings analysis

## Configuration Options

### Agent Settings
- `RESEARCH_INTERVAL_MINUTES`: How often to run scans (default: 30)
- `MIN_RELEVANCE_SCORE`: Minimum score for content ideas (default: 7)
- `MAX_IDEAS_PER_SCAN`: Maximum ideas per scan (default: 20)

### Database Settings
- `DATABASE_PATH`: Database file location (default: data/agency.db)
- `BACKUP_DATABASE_PATH`: Backup directory (default: data/backup/)

### Dashboard Settings
- `FLASK_PORT`: Web server port (default: 5000)
- `FLASK_DEBUG`: Debug mode (default: false)
- `SECRET_KEY`: Session security key

## Advanced Usage

### Custom Keywords

Edit the keyword weights in `agents/research_agent.py`:

```python
self.keyword_weights = {
    'earnings': 10,
    'ipo': 9,
    'merger': 9,
    # Add your custom keywords here
}
```

### API Integration

The system supports multiple financial data APIs:

- **Alpha Vantage**: Stock data and fundamentals
- **Finnhub**: Real-time market data
- **NewsAPI**: News article aggregation
- **Polygon**: Market data and analytics

### Extending the Agent

Create custom analyzers by extending the `ContentAnalyzer` class:

```python
class CustomAnalyzer(ContentAnalyzer):
    def custom_analysis(self, data):
        # Your custom analysis logic
        pass
```

## Monitoring and Logging

### Log Files
- Research agent logs: `logs/research_agent.log`
- Dashboard logs: Console output

### Performance Metrics
- Content ideas generated per day
- Average relevance scores
- Keyword frequency tracking
- Source performance analysis

### Health Checks
- Database connectivity
- API endpoint availability
- Data freshness monitoring

## Troubleshooting

### Common Issues

1. **Database locked error**
   - Make sure only one instance is running
   - Check file permissions on data directory

2. **API rate limits**
   - Reduce scan frequency in configuration
   - Use multiple API keys with rotation

3. **Memory usage**
   - Limit concurrent requests in configuration
   - Increase scan interval for slower systems

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
export LOG_LEVEL=DEBUG

# Or run with debug flag
python agents/research_agent.py --debug
```

## Production Deployment

### Using Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["python", "run.py", "agent"]
```

### Using Supervisor

```ini
[program:research-agent]
command=python run.py agent
directory=/path/to/ai-finance-agency
user=finance
autostart=true
autorestart=true

[program:dashboard]
command=python run.py dashboard
directory=/path/to/ai-finance-agency
user=finance
autostart=true
autorestart=true
```

### Environment Variables for Production

```bash
DATABASE_PATH=/var/lib/finance-agency/agency.db
LOG_FILE=/var/log/finance-agency/agent.log
SECRET_KEY=your-production-secret-key
FLASK_DEBUG=False
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the configuration options

---

**Built with ❤️ for the financial community**