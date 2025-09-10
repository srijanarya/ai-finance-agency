# TREUM AI Finance Platform - Trading Service
# Multi-stage Dockerfile for optimal production builds

ARG NODE_VERSION=20-alpine

# ============================================
# Base stage - Common dependencies
# ============================================
FROM node:${NODE_VERSION} AS base

# Set working directory
WORKDIR /usr/src/app

# Install system dependencies required for node-gyp and native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    dumb-init

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy package files
COPY package*.json ./
COPY services/trading/package*.json ./services/trading/
COPY turbo.json ./
COPY tsconfig.json ./

# ============================================
# Dependencies stage - Install all dependencies
# ============================================
FROM base AS deps

# Install all dependencies (including devDependencies for build)
RUN npm ci --prefer-offline --no-audit

# Install service-specific dependencies
WORKDIR /usr/src/app/services/trading
RUN npm ci --prefer-offline --no-audit

# ============================================
# Builder stage - Build the application
# ============================================
FROM deps AS builder

WORKDIR /usr/src/app

# Copy source code
COPY . .

# Build the service using Turbo
RUN npm run build -- --filter=trading

# ============================================
# Production dependencies stage
# ============================================
FROM base AS production-deps

# Install only production dependencies
RUN npm ci --prefer-offline --no-audit --omit=dev

WORKDIR /usr/src/app/services/trading
RUN npm ci --prefer-offline --no-audit --omit=dev

# ============================================
# Runtime stage - Final production image
# ============================================
FROM node:${NODE_VERSION} AS runtime

# Security and performance optimizations
RUN apk add --no-cache dumb-init curl && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /usr/src/app

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/services/trading/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/services/trading/package*.json ./
COPY --from=production-deps --chown=nestjs:nodejs /usr/src/app/services/trading/node_modules ./node_modules

# Copy configuration files
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/.env* ./

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3002/health || exit 1

# Security: Run as non-root user
USER nestjs

# Environment variables
ENV NODE_ENV=production \
    PORT=3002 \
    SERVICE_NAME=trading

# Expose port
EXPOSE 3002

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]

# Build-time metadata
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION
ARG SERVICE_NAME

LABEL org.opencontainers.image.title="TREUM Trading Service" \
      org.opencontainers.image.description="TREUM AI Finance Platform - Trading Service" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.vendor="TREUM ALGOTECH" \
      org.opencontainers.image.source="https://github.com/treum-algotech/platform" \
      org.opencontainers.image.documentation="https://docs.treum.ai" \
      service.name="${SERVICE_NAME}"