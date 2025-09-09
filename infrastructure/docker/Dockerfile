# Multi-stage Dockerfile for AI Finance Agency
# Optimized for production deployment with minimal attack surface

# ==================== BUILDER STAGE ====================
FROM python:3.11-slim as builder

# Set build arguments
ARG BUILD_ENV=production
ARG PYTHON_VERSION=3.11

# Set environment variables for build
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies for building Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    libffi-dev \
    libssl-dev \
    libpq-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create application directory
WORKDIR /app

# Copy requirements first for better layer caching
COPY requirements/base.txt requirements/prod.txt ./requirements/
COPY requirements.txt .

# Create virtual environment and install dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip and install dependencies
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements/prod.txt

# ==================== RUNTIME STAGE ====================
FROM python:3.11-slim as runtime

# Set runtime arguments
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION=latest

# Add metadata labels
LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.version=$VERSION \
      org.label-schema.name="AI Finance Agency" \
      org.label-schema.description="AI-powered financial content generation platform" \
      org.label-schema.vendor="AI Finance Agency" \
      org.label-schema.schema-version="1.0"

# Set runtime environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONPATH=/app
ENV PATH="/opt/venv/bin:$PATH"
ENV APP_ENV=production
ENV DEBIAN_FRONTEND=noninteractive

# Install runtime system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libffi7 \
    libssl3 \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user for security
RUN groupadd --gid 1000 appuser && \
    useradd --uid 1000 --gid appuser --shell /bin/bash --create-home appuser

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv

# Create application directories
RUN mkdir -p /app/logs /app/data /app/tmp && \
    chown -R appuser:appuser /app

# Set working directory
WORKDIR /app

# Copy application code
COPY --chown=appuser:appuser . .

# Create startup script
COPY --chown=appuser:appuser infrastructure/scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Switch to non-root user
USER appuser

# Expose ports
EXPOSE 8000 8001 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Set default command
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

# ==================== DEVELOPMENT STAGE ====================
FROM runtime as development

# Install development dependencies
USER root
COPY requirements/dev.txt ./requirements/
RUN pip install --no-cache-dir -r requirements/dev.txt

# Install development tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    vim \
    git \
    && rm -rf /var/lib/apt/lists/*

# Switch back to non-root user
USER appuser

# Override command for development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--log-level", "debug"]

# ==================== TESTING STAGE ====================
FROM runtime as testing

# Install test dependencies
USER root
COPY requirements/test.txt ./requirements/
RUN pip install --no-cache-dir -r requirements/test.txt

# Switch back to non-root user  
USER appuser

# Override command for testing
CMD ["python", "-m", "pytest", "tests/", "-v", "--cov=.", "--cov-report=xml"]