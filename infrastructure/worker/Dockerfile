# Multi-stage build for AI Finance Agency Worker
ARG NODE_VERSION=20-alpine

# Build stage
FROM node:${NODE_VERSION} AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production

# Runtime stage
FROM node:${NODE_VERSION} AS runtime

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S worker -u 1001

WORKDIR /usr/src/app

# Copy built application
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=worker:nodejs infrastructure/worker/src ./src
COPY --chown=worker:nodejs package*.json ./

# Set proper permissions
RUN mkdir -p logs && chown -R worker:nodejs logs

# Switch to non-root user
USER worker

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3010/health || exit 1

# Expose port
EXPOSE 3010

# Start the worker
CMD ["node", "src/index.js"]