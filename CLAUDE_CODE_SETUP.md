# AI Finance Agency - Claude Code Setup Guide

This guide helps you work with your AI Finance Agency project in Claude's Code environment safely and efficiently.

## 🚀 Quick Start

### 1. Upload Files to Claude Code

Upload these **SAFE** files (no secrets included):

```
📁 Essential Files for Claude Code:
├── .env.claude                 # Safe environment template
├── setup_claude_env.py        # Environment setup helper
├── requirements-claude.txt     # Dependencies
├── CLAUDE_CODE_SETUP.md       # This guide
├── run.py                     # Main application runner
├── agents/                    # Your agent modules
├── templates/                 # HTML templates
└── static/                    # CSS/JS files
```

### 2. Initial Setup

```bash
# Run the setup helper
python setup_claude_env.py

# Install dependencies
pip install -r requirements-claude.txt

# Test basic functionality
python -c "from dotenv import load_dotenv; load_dotenv(); print('✅ Environment loaded')"
```

### 3. Configure API Keys

Edit the `.env` file created by the setup script and replace placeholders with actual values:

```bash
# Edit environment variables
nano .env

# Add your actual API keys:
TELEGRAM_BOT_TOKEN=your_actual_token_here
OPENAI_API_KEY=sk-your_actual_openai_key
TWITTER_PERSONAL_BEARER_TOKEN=your_actual_twitter_token
# ... etc
```

## 🔧 Development Workflow

### Testing Components

```bash
# Test Telegram integration
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
token = os.getenv('TELEGRAM_BOT_TOKEN')
print('✅ Telegram token loaded' if token else '❌ Token missing')
"

# Test Twitter/X integration  
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
bearer = os.getenv('TWITTER_PERSONAL_BEARER_TOKEN')
print('✅ Twitter token loaded' if bearer else '❌ Token missing')
"

# Test OpenAI integration
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
key = os.getenv('OPENAI_API_KEY')
print('✅ OpenAI key loaded' if key else '❌ Key missing')
"
```

### Running Core Components

```bash
# Test research agent
python -c "from agents.research_agent import ResearchAgent; print('✅ Research agent imported')"

# Test content generation
python -c "from coherent_content_generator import generate_content; print('✅ Content generator ready')"

# Test multi-platform posting
python platform_styled_poster.py --test

# Run dashboard
python agency_dashboard.py
```

## 🧪 Testing Framework

### Unit Tests

```bash
# Test environment setup
python -c "
import os
from dotenv import load_dotenv
load_dotenv()

tests = {
    'Database Path': os.getenv('DATABASE_PATH'),
    'Flask Port': os.getenv('FLASK_PORT'),
    'Log Level': os.getenv('LOG_LEVEL'),
    'Development Mode': os.getenv('DEVELOPMENT_MODE')
}

for name, value in tests.items():
    print(f'✅ {name}: {value}' if value else f'❌ {name}: Not set')
"

# Test database initialization
python -c "
import sqlite3
import os
db_path = 'data/agency.db'
try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('SELECT name FROM sqlite_master WHERE type=\"table\";')
    tables = cursor.fetchall()
    print(f'✅ Database has {len(tables)} tables')
    conn.close()
except Exception as e:
    print(f'❌ Database error: {e}')
"
```

### API Integration Tests

```bash
# Test social media APIs (safe mode)
python -c "
import os
from dotenv import load_dotenv
load_dotenv()

# Set test mode to avoid real posting
os.environ['TEST_MODE'] = 'True'
os.environ['SKIP_REAL_POSTING'] = 'True'

print('🧪 Running in test mode - no real API calls')
"
```

## 📊 Monitoring & Debugging

### Log Analysis

```bash
# Check recent logs
tail -n 50 logs/research_agent.log

# Monitor real-time logs
tail -f logs/research_agent.log

# Search for errors
grep -i "error" logs/research_agent.log
```

### Database Inspection

```bash
# Check database status
python -c "
import sqlite3
import os

db_path = 'data/agency.db'
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get table info
    cursor.execute('SELECT name FROM sqlite_master WHERE type=\"table\";')
    tables = cursor.fetchall()
    
    for table in tables:
        cursor.execute(f'SELECT COUNT(*) FROM {table[0]}')
        count = cursor.fetchone()[0]
        print(f'📊 {table[0]}: {count} records')
    
    conn.close()
else:
    print('❌ Database not found')
"
```

## 🔄 Development Tasks

### Content Generation

```bash
# Generate sample content
python -c "
import os
os.environ['TEST_MODE'] = 'True'

# Import your content generator
# from coherent_content_generator import generate_sample_content
# content = generate_sample_content()
# print('✅ Content generated:', len(content), 'characters')
"
```

### Social Media Testing

```bash
# Test posting pipeline (dry run)
python -c "
import os
os.environ['SKIP_REAL_POSTING'] = 'True'

# Test your posting logic
print('🧪 Testing posting pipeline in dry-run mode')
# Your posting test code here
"
```

## 🚀 Advanced Features

### AI Integration

```bash
# Test OpenAI integration
python -c "
import os
from dotenv import load_dotenv
load_dotenv()

openai_key = os.getenv('OPENAI_API_KEY')
if openai_key and openai_key.startswith('sk-'):
    print('✅ OpenAI key format looks correct')
    # Test basic API call (uncomment when ready)
    # import openai
    # openai.api_key = openai_key
    # response = openai.ChatCompletion.create(model='gpt-3.5-turbo', messages=[{'role': 'user', 'content': 'Hello'}])
    # print('✅ OpenAI API working')
else:
    print('❌ OpenAI key missing or invalid format')
"
```

### Financial Data Integration

```bash
# Test financial APIs
python -c "
import os
from dotenv import load_dotenv
load_dotenv()

apis = {
    'Alpha Vantage': os.getenv('ALPHA_VANTAGE_API_KEY'),
    'Finnhub': os.getenv('FINNHUB_API_KEY'),
    'News API': os.getenv('NEWS_API_KEY')
}

for name, key in apis.items():
    status = '✅ SET' if key and not key.startswith('your_') else '❌ NOT SET'
    print(f'{name}: {status}')
"
```

## 🔒 Security Best Practices

### Environment Management

```bash
# Verify no secrets in code
grep -r "sk-" . --exclude-dir=".git" --exclude="*.log" || echo "✅ No API keys found in code"

# Check .gitignore is properly set
cat .gitignore | grep -E "\.env|secrets|\.key" || echo "⚠️ Update .gitignore"
```

### Safe Development

1. **Always use test mode** when developing
2. **Set SKIP_REAL_POSTING=True** to prevent accidental posts
3. **Use small test datasets** to avoid rate limits
4. **Monitor API usage** to stay within limits

## 📝 Common Commands

```bash
# Quick environment check
python -c "from dotenv import load_dotenv; load_dotenv(); print('✅ Environment loaded')"

# Database reset (if needed)
rm -f data/agency.db && python -c "from agents.research_agent import DatabaseManager; DatabaseManager('data/agency.db').initialize_database()"

# Test all systems
python -c "
import os
os.environ['TEST_MODE'] = 'True'
os.environ['DEBUG_LOGGING'] = 'True'
print('🧪 All systems in test mode')
"

# Generate test content
python -c "
import os
os.environ['DEVELOPMENT_MODE'] = 'True'
print('🛠️ Development mode enabled')
"
```

## 🎯 Next Steps

1. **Test each component** individually before integration
2. **Use logging extensively** to debug issues  
3. **Start with small datasets** to test functionality
4. **Monitor API rate limits** carefully
5. **Keep backups** of your configurations

## 🆘 Troubleshooting

### Common Issues

- **Import errors**: Check requirements-claude.txt installation
- **API errors**: Verify tokens in .env file  
- **Database errors**: Initialize with setup script
- **Permission errors**: Check file permissions

### Getting Help

Run diagnostics:
```bash
python setup_claude_env.py
```

This will show you current environment status and missing components.

---

**Remember**: This setup is designed for safe development in Claude Code. Always use test modes and never commit real API keys!
