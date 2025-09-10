#!/bin/bash
# Production startup script for TREUM Signal Service
# Handles database migrations, health checks, and graceful startup

set -e

echo "🚀 Starting TREUM Signal Generation Service..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until pg_isready -h $DATABASE_HOST -p 5432 -U $DATABASE_USER; do
  echo "⏳ PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "✅ PostgreSQL is up and running!"

# Wait for Redis to be ready
echo "⏳ Waiting for Redis connection..."
until redis-cli -h $REDIS_HOST -p 6379 ping; do
  echo "⏳ Redis is unavailable - sleeping"
  sleep 2
done
echo "✅ Redis is up and running!"

# Run database migrations
echo "🗄️ Running database migrations..."
alembic upgrade head

# Create initial data if needed
echo "📊 Setting up initial data..."
python -c "
import asyncio
from app.services.ai_signal_generator import signal_service
from database.models import SignalProvider
from app.core.database import get_db

async def setup_initial_data():
    db = next(get_db())
    
    # Create AI signal provider if it doesn't exist
    provider = db.query(SignalProvider).filter(
        SignalProvider.name == 'TREUM AI Signal Engine'
    ).first()
    
    if not provider:
        provider = SignalProvider(
            name='TREUM AI Signal Engine',
            description='AI-powered signal generation using technical analysis and machine learning',
            provider_type='ai_model',
            model_version='v1.0',
            config={
                'indicators': ['RSI', 'MACD', 'Bollinger Bands', 'Support/Resistance'],
                'weights': {'rsi': 0.25, 'macd': 0.25, 'bollinger': 0.20, 'volume': 0.15, 'momentum': 0.15}
            }
        )
        db.add(provider)
        db.commit()
        print('✅ Created AI signal provider')
    else:
        print('✅ AI signal provider already exists')

asyncio.run(setup_initial_data())
"

# Initialize monitoring
echo "📊 Initializing monitoring..."
python -c "
import asyncio
from app.services.signal_monitoring import initialize_monitoring

async def init():
    await initialize_monitoring()
    print('✅ Monitoring initialized')

asyncio.run(init())
"

# Set up log rotation
echo "📝 Setting up log rotation..."
mkdir -p /app/logs
touch /app/logs/app.log
touch /app/logs/celery.log
touch /app/logs/error.log

# Health check before starting
echo "🏥 Running health check..."
python -c "
from app.core.database import get_db
try:
    db = next(get_db())
    db.execute('SELECT 1')
    print('✅ Database health check passed')
except Exception as e:
    print(f'❌ Database health check failed: {e}')
    exit(1)
"

# Start the application
echo "🎯 Starting TREUM Signal API..."

if [ "$ENVIRONMENT" = "production" ]; then
    echo "🏭 Starting in production mode with Gunicorn..."
    exec gunicorn app.main:app \
        --bind 0.0.0.0:8000 \
        --workers 4 \
        --worker-class uvicorn.workers.UvicornWorker \
        --worker-connections 1000 \
        --max-requests 1000 \
        --max-requests-jitter 100 \
        --timeout 60 \
        --keep-alive 5 \
        --log-level info \
        --access-logfile /app/logs/access.log \
        --error-logfile /app/logs/error.log \
        --log-config-dict '{
            "version": 1,
            "disable_existing_loggers": false,
            "formatters": {
                "default": {
                    "format": "%(asctime)s [%(process)d] [%(levelname)s] %(name)s: %(message)s",
                    "datefmt": "%Y-%m-%d %H:%M:%S %z"
                }
            },
            "handlers": {
                "default": {
                    "formatter": "default",
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout"
                },
                "file": {
                    "formatter": "default", 
                    "class": "logging.handlers.RotatingFileHandler",
                    "filename": "/app/logs/app.log",
                    "maxBytes": 10485760,
                    "backupCount": 5
                }
            },
            "root": {
                "level": "INFO",
                "handlers": ["default", "file"]
            },
            "loggers": {
                "app": {
                    "level": "INFO",
                    "handlers": ["default", "file"],
                    "propagate": false
                },
                "uvicorn": {
                    "level": "INFO",
                    "handlers": ["default", "file"],
                    "propagate": false
                }
            }
        }'
else
    echo "🛠️ Starting in development mode..."
    exec uvicorn app.main:app \
        --host 0.0.0.0 \
        --port 8000 \
        --reload \
        --log-level debug
fi