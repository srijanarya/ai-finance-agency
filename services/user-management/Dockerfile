# TREUM AI Finance Platform - User Management Service
# Multi-stage Dockerfile for optimal production builds

ARG NODE_VERSION=22.11.0

# ============================================
# Base stage - Common dependencies
# ============================================
FROM node:${NODE_VERSION}-alpine AS base

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
COPY services/user-management/package*.json ./services/user-management/
COPY turbo.json ./
COPY tsconfig.json ./

# ============================================
# Dependencies stage - Install all dependencies
# ============================================
FROM base AS deps

# Install all dependencies (including devDependencies for build)
RUN npm ci --prefer-offline --no-audit

# Install service-specific dependencies
WORKDIR /usr/src/app/services/user-management
RUN npm ci --prefer-offline --no-audit

# ============================================
# Builder stage - Build the application
# ============================================
FROM deps AS builder

WORKDIR /usr/src/app

# Copy source code
COPY . .

# Build the service using Turbo
RUN npm run build -- --filter=user-management

# ============================================
# Production dependencies stage
# ============================================
FROM base AS production-deps

# Install only production dependencies
RUN npm ci --prefer-offline --no-audit --omit=dev

WORKDIR /usr/src/app/services/user-management
RUN npm ci --prefer-offline --no-audit --omit=dev

# ============================================
# Runtime stage - Final production image
# ============================================
FROM node:${NODE_VERSION}-alpine AS runtime

# Security and performance optimizations
RUN apk add --no-cache dumb-init curl && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /usr/src/app

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/services/user-management/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/services/user-management/package*.json ./
COPY --from=production-deps --chown=nestjs:nodejs /usr/src/app/services/user-management/node_modules ./node_modules

# Copy configuration files
COPY --from=builder --chown=nestjs:nodejs /usr/src/app/.env* ./

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Security: Run as non-root user
USER nestjs

# Environment variables
ENV NODE_ENV=production \
    PORT=3001 \
    SERVICE_NAME=user-management

# Expose port
EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]

# Build-time metadata
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION
ARG SERVICE_NAME

LABEL org.opencontainers.image.title="TREUM User Management" \
      org.opencontainers.image.description="TREUM AI Finance Platform - User Management Service" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.vendor="TREUM ALGOTECH" \
      org.opencontainers.image.source="https://github.com/treum-algotech/platform" \
      org.opencontainers.image.documentation="https://docs.treum.ai" \
      service.name="${SERVICE_NAME}"