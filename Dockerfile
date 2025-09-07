FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install additional packages for new features
RUN pip install --no-cache-dir \
    psycopg2-binary \
    redis \
    celery \
    SQLAlchemy \
    alembic \
    python-telegram-bot \
    telethon

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs data templates static

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

EXPOSE 5000 8000

CMD ["python", "master_control_system.py"]