# Installation Guide - AI Finance Agency

Complete installation and setup guide for the AI Finance Agency platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Manual Installation](#manual-installation)
4. [Environment Configuration](#environment-configuration)
5. [Dependency Management](#dependency-management)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)
8. [Development Setup](#development-setup)

---

## Prerequisites

### System Requirements

**Operating Systems:**
- macOS 10.15+ (Catalina or later)
- Linux (Ubuntu 20.04+, CentOS 8+, or equivalent)
- Windows 10+ with PowerShell 5.1+

**Required Software:**
- **Python 3.11+** (Python 3.12 recommended)
- **Git** for version control
- **Node.js 18+** (for some development tools)

### Platform-Specific Prerequisites

#### macOS
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required system packages
brew install python@3.11 git redis postgresql ta-lib
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev \
    python3-pip git build-essential libpq-dev redis-server \
    postgresql-client libta-lib-dev pkg-config libffi-dev libssl-dev
```

#### CentOS/RHEL
```bash
sudo yum install -y python311 python311-devel python311-pip git gcc \
    postgresql-devel redis ta-lib-devel openssl-devel libffi-devel
```

#### Windows
1. Download Python 3.11+ from [python.org](https://www.python.org/downloads/)
2. Install Git from [git-scm.com](https://git-scm.com/download/windows)
3. Install Visual C++ Build Tools from [Microsoft](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

---

## Quick Start

### Automated Setup (Recommended)

**For macOS/Linux:**
```bash
# Clone the repository
git clone <repository-url>
cd ai-finance-agency

# Run automated setup
./scripts/setup_env.sh

# For development setup
./scripts/setup_env.sh dev
```

**For Windows (PowerShell):**
```powershell
# Clone the repository
git clone <repository-url>
cd ai-finance-agency

# Run automated setup
.\scripts\setup_env.ps1

# For development setup
.\scripts\setup_env.ps1 -Environment dev
```

The automated setup will:
1. ✅ Check system requirements
2. ✅ Create virtual environment
3. ✅ Install all dependencies
4. ✅ Verify installation
5. ✅ Create activation scripts

---

## Manual Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd ai-finance-agency
```

### 2. Create Virtual Environment
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 3. Upgrade pip
```bash
python -m pip install --upgrade pip setuptools wheel
```

### 4. Install Dependencies

Choose the appropriate requirements file based on your needs:

```bash
# Base installation (production-ready)
pip install -r requirements.txt

# Development installation (includes testing tools)
pip install -r requirements/dev.txt

# Testing only
pip install -r requirements/test.txt

# Production with optimizations
pip install -r requirements/prod.txt
```

---

## Environment Configuration

### 1. Create Environment File
```bash
# Copy the example environment file
cp .env.example .env

# Edit the file with your API keys and configurations
nano .env  # or use your preferred editor
```

### 2. Required API Keys

Add the following API keys to your `.env` file:

**AI Services:**
```bash
OPENAI_API_KEY=sk-...
CLAUDE_API_KEY=sk-ant-api03-...
PERPLEXITY_API_KEY=pplx-...
```

**Social Media:**
```bash
TWITTER_CONSUMER_KEY=...
TWITTER_CONSUMER_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_TOKEN_SECRET=...

TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHANNEL_ID=@yourchannel

LINKEDIN_PERSONAL_ACCESS_TOKEN=...
```

**Market Data:**
```bash
ALPHA_VANTAGE_KEY=...
FINNHUB_API_KEY=...
POLYGON_API_KEY=...
```

**Database (Optional):**
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=...
REDIS_URL=redis://localhost:6379
```

### 3. Validate Configuration
```bash
# Run configuration validation
python validate_environment.py

# Or use enhanced validation
python validate_environment.py --enhanced
```

---

## Dependency Management

### Requirements File Structure

The project uses a modular requirements structure:

```
requirements/
├── base.txt      # Core dependencies (120+ packages)
├── dev.txt       # Development tools (100+ packages)
├── test.txt      # Testing frameworks (80+ packages)
├── prod.txt      # Production optimizations (60+ packages)
└── requirements.txt  # Main file (includes base.txt)
```

### Package Categories

**AI/ML Libraries:**
- OpenAI, Anthropic Claude, LangChain
- Transformers, PyTorch, Scikit-learn

**Web Frameworks:**
- Flask (dashboards), FastAPI (APIs)
- Uvicorn, Gunicorn (ASGI/WSGI servers)

**Database & Storage:**
- SQLAlchemy, Alembic (ORM & migrations)
- Redis, Supabase (caching & cloud DB)

**Social Media APIs:**
- Tweepy (Twitter), python-telegram-bot
- requests-oauthlib (LinkedIn)

**Data Processing:**
- Pandas, NumPy, SciPy
- TA-Lib (technical analysis)

### Updating Dependencies

```bash
# Check for outdated packages
pip list --outdated

# Update specific package
pip install --upgrade package-name

# Update all packages (use with caution)
pip install --upgrade -r requirements.txt

# Generate updated requirements
pip freeze > requirements-new.txt
```

### Security Scanning
```bash
# Run security vulnerability scan
python scripts/security_scan.py

# Install and use pip-audit (alternative)
pip install pip-audit
pip-audit --requirements requirements.txt
```

---

## Verification

### 1. Installation Verification
```bash
# Test core imports
python -c "
import flask, pandas, numpy, requests
import openai, anthropic, sqlalchemy, redis
print('✅ All core packages imported successfully')
"
```

### 2. Environment Validation
```bash
# Run comprehensive validation
python validate_environment.py

# Expected output:
# ✅ Configuration is VALID
# ✅ OpenAI API configured
# ✅ Database connections working
# ✅ Environment is ready for use
```

### 3. Run Tests
```bash
# Install test dependencies
pip install -r requirements/test.txt

# Run unit tests
python -m pytest tests/ -v

# Run with coverage
python -m pytest tests/ --cov=. --cov-report=html
```

### 4. Start Application
```bash
# Run main application
python main.py

# Or start specific components
python dashboard.py  # Start dashboard
python validate_environment.py  # Validate setup
```

---

## Troubleshooting

### Common Issues

#### Python Version Issues
```bash
# Check Python version
python --version
python3 --version

# If wrong version, ensure Python 3.11+ is installed
# and create virtual environment with specific version:
python3.11 -m venv venv
```

#### Package Installation Failures

**On macOS (M1/M2 chips):**
```bash
# For packages requiring compilation
pip install --no-use-pep517 package-name

# For ta-lib specifically
brew install ta-lib
pip install ta-lib
```

**On Ubuntu/Debian:**
```bash
# Install build dependencies
sudo apt install build-essential python3-dev

# For ta-lib
sudo apt install libta-lib-dev
```

**On Windows:**
```bash
# Install pre-compiled wheels
pip install --only-binary=all package-name

# Or install Visual C++ Build Tools
# https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

#### Database Connection Issues
```bash
# Test Redis connection
redis-cli ping
# Expected: PONG

# Test PostgreSQL connection (if using)
psql -h localhost -U username -d database

# Check database configuration
python -c "
from config.enhanced_config import enhanced_config
print(f'Database enabled: {enhanced_config.database.sqlite_enabled}')
print(f'Redis enabled: {enhanced_config.database.redis_enabled}')
"
```

#### API Key Issues
```bash
# Validate API keys
python -c "
import os
from dotenv import load_dotenv
load_dotenv()

print('OpenAI Key:', 'SET' if os.getenv('OPENAI_API_KEY') else 'MISSING')
print('Claude Key:', 'SET' if os.getenv('CLAUDE_API_KEY') else 'MISSING')
"
```

#### Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Performance Issues

#### Slow Installation
```bash
# Use faster index
pip install -i https://pypi.org/simple/ -r requirements.txt

# Install from wheel files only
pip install --only-binary=all -r requirements.txt

# Parallel installation (use with caution)
pip install --upgrade pip
pip install -r requirements.txt --upgrade
```

#### Memory Issues
```bash
# Install packages one by one
cat requirements.txt | xargs -n 1 pip install

# Or split into smaller batches
head -20 requirements.txt | pip install -r /dev/stdin
```

### Getting Help

If you encounter issues not covered here:

1. **Check existing issues:** Search project GitHub issues
2. **Environment info:** Run `python validate_environment.py` and share output
3. **Create issue:** Include OS, Python version, error messages
4. **Community:** Join project Discord/Slack for real-time help

---

## Development Setup

### Additional Development Tools

```bash
# Install development dependencies
pip install -r requirements/dev.txt

# Install pre-commit hooks
pre-commit install

# Install IDE extensions (VS Code)
code --install-extension ms-python.python
code --install-extension ms-python.flake8
code --install-extension ms-python.black-formatter
```

### Code Quality Tools

```bash
# Format code
black .
isort .

# Lint code
flake8 .
pylint src/

# Type checking
mypy src/

# Security scan
bandit -r src/
```

### Testing Setup

```bash
# Install test dependencies
pip install -r requirements/test.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test
pytest tests/test_configuration.py::TestAIServiceConfig::test_openai_config_valid
```

### Database Development

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Reset database
alembic downgrade base
alembic upgrade head
```

---

## Quick Reference

### Activation Commands
```bash
# Activate environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Or use convenience scripts
./activate.sh             # macOS/Linux
.\activate.ps1            # Windows PowerShell
.\activate.bat            # Windows Command Prompt
```

### Validation Commands
```bash
python validate_environment.py           # Basic validation
python validate_environment.py --enhanced # Comprehensive validation
python scripts/security_scan.py          # Security scan
```

### Quick Setup Commands
```bash
./scripts/setup_env.sh                   # Base setup
./scripts/setup_env.sh dev              # Development setup
./scripts/setup_env.sh prod             # Production setup
./scripts/setup_env.sh test             # Testing setup
```

---

**🎉 Installation complete!** Your AI Finance Agency platform is ready for use.