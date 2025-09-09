# AI Finance Agency - Development Environment Guide

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose** installed
- **Python 3.11+** installed
- **Git** installed

### One-Command Setup
```bash
./scripts/dev-setup.sh
```

This script will:
- ✅ Check prerequisites
- ✅ Create environment configuration
- ✅ Set up Python virtual environment
- ✅ Start database services (PostgreSQL + Redis)
- ✅ Run database migrations
- ✅ Start all microservices
- ✅ Run tests to verify setup
- ✅ Display access information

### Quick Start (Existing Environment)
```bash
./scripts/dev-start.sh
```

### Stop Development Environment
```bash
./scripts/dev-stop.sh
```

## 📋 Service Architecture

### Core Services
- **FastAPI API** - Main REST API server (Port 8000)
- **PostgreSQL** - Primary database (Port 5432)
- **Redis** - Caching and session storage (Port 6379)
- **Celery Worker** - Background task processing
- **Celery Beat** - Task scheduling

### Optional Services
- **Nginx** - Reverse proxy (Production profile)
- **Prometheus** - Metrics collection (Monitoring profile)
- **Grafana** - Metrics visualization (Port 3001, Monitoring profile)

## 🛠️ Development Workflow

### Environment Configuration

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure your API keys in `.env`:**
   ```bash
   # AI Services
   CLAUDE_API_KEY=your-claude-key
   OPENAI_API_KEY=your-openai-key
   
   # Social Media APIs
   LINKEDIN_PERSONAL_ACCESS_TOKEN=your-token
   TWITTER_CONSUMER_KEY=your-key
   TELEGRAM_BOT_TOKEN=your-token
   
   # Market Data APIs
   ALPHA_VANTAGE_KEY=your-key
   FINNHUB_API_KEY=your-key
   ```

### Project Structure
```
ai-finance-agency/
├── app/                          # FastAPI application
│   ├── core/                     # Core components
│   │   ├── config.py            # Configuration management
│   │   ├── database.py          # Database setup
│   │   └── security.py          # Security utilities
│   ├── api/                      # API routes
│   │   └── v1/                   # API version 1
│   │       └── endpoints/        # API endpoints
│   ├── middleware/               # Custom middleware
│   └── main.py                   # FastAPI application entry
├── migrations/                   # Database migrations
├── tests/                        # Test files
├── scripts/                      # Development scripts
├── requirements/                 # Dependency management
│   ├── base.txt                 # Core dependencies
│   ├── dev.txt                  # Development dependencies
│   ├── prod.txt                 # Production dependencies
│   └── test.txt                 # Testing dependencies
├── docker-compose.yml           # Docker services
└── Dockerfile                   # Application container
```

### Database Management

#### Run Migrations
```bash
# Using Docker
docker-compose run --rm migrations

# Using local environment
alembic upgrade head
```

#### Create New Migration
```bash
# Generate migration automatically
alembic revision --autogenerate -m "Add new table"

# Create empty migration
alembic revision -m "Custom migration"
```

#### Database Access
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U ai_finance_user -d ai_finance_db

# Access Redis
docker-compose exec redis redis-cli
```

### Testing

#### Run All Tests
```bash
# Using pytest directly
pytest

# With coverage report
pytest --cov=app --cov-report=html

# Run specific test categories
pytest -m unit          # Unit tests only
pytest -m integration   # Integration tests only
pytest -m api           # API tests only
```

#### Test Categories
- **Unit Tests** - Test individual functions/classes
- **Integration Tests** - Test service interactions
- **API Tests** - Test HTTP endpoints
- **Security Tests** - Test security features
- **Performance Tests** - Test performance characteristics

### Code Quality

#### Code Formatting
```bash
# Format code
black app/ tests/

# Sort imports
isort app/ tests/
```

#### Linting
```bash
# Python linting
flake8 app/ tests/

# Type checking
mypy app/
```

#### Security Scanning
```bash
# Security issues
bandit -r app/

# Dependency vulnerabilities
safety check
```

## 🔧 Development Commands

### Docker Commands
```bash
# View logs
docker-compose logs -f api          # API logs only
docker-compose logs -f              # All services

# Restart services
docker-compose restart api          # Restart API only
docker-compose restart              # Restart all

# Clean rebuild
docker-compose down --volumes
docker-compose up -d --build
```

### Service Management
```bash
# Start specific services
docker-compose up -d postgres redis  # Database services only
docker-compose up -d --scale worker=3 # Scale workers

# Stop services
docker-compose down                   # Stop all
docker-compose down --volumes        # Stop and remove data
```

### Monitoring
```bash
# View service status
docker-compose ps

# View resource usage
docker stats

# Monitor logs in real-time
docker-compose logs -f api
```

## 🌐 API Development

### API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

### API Authentication
```bash
# Get access token
curl -X POST "http://localhost:8000/api/v1/auth/token" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'

# Use token in requests
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/v1/content/"
```

### Testing API Endpoints
```bash
# Health check
curl http://localhost:8000/health

# Test content generation (requires auth)
curl -X POST "http://localhost:8000/api/v1/content/generate" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Market Analysis",
    "content_type": "social_post",
    "platform": "linkedin"
  }'
```

## 🚧 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using port 8000
lsof -i :8000

# Kill process using port
kill -9 $(lsof -t -i:8000)
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U ai_finance_user

# Reset database
docker-compose down --volumes
docker-compose up -d postgres
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

#### Memory Issues
```bash
# Clean up Docker
docker system prune -a --volumes

# View Docker resource usage
docker stats
```

### Service Health Checks
```bash
# API health
curl http://localhost:8000/health/detailed

# Database health
docker-compose exec postgres pg_isready -U ai_finance_user

# Redis health
docker-compose exec redis redis-cli ping
```

## 🔒 Security Notes

### Development Security
- Default passwords are used for development
- API keys should never be committed to git
- Use `.env` file for sensitive configuration
- Production secrets are different from development

### Production Considerations
- Change all default passwords
- Use environment-specific secrets
- Enable HTTPS/TLS
- Configure proper firewall rules
- Enable monitoring and alerting

## 📚 Additional Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Celery Documentation](https://docs.celeryproject.org/)

### Development Tools
- **API Client**: Postman, Insomnia, or curl
- **Database Client**: pgAdmin, DBeaver, or psql
- **Redis Client**: RedisInsight or redis-cli
- **Code Editor**: VS Code with Python and Docker extensions

## 🎯 Next Steps

1. **Configure API Keys** in `.env` file
2. **Test Core Functionality** using API documentation
3. **Review Project Structure** to understand the codebase
4. **Run Tests** to ensure everything works
5. **Start Developing** your features!

---

**Happy Coding!** 🎉

For additional help, check the `scripts/` directory for utility scripts or refer to the comprehensive logging in the application.