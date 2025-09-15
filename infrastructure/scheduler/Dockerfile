# Multi-stage build for AI Finance Agency Scheduler
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
    adduser -S scheduler -u 1001

WORKDIR /usr/src/app

# Copy built application
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --chown=scheduler:nodejs infrastructure/scheduler/src ./src
COPY --chown=scheduler:nodejs package*.json ./

# Set proper permissions
RUN mkdir -p logs config && chown -R scheduler:nodejs logs config

# Switch to non-root user
USER scheduler

# Expose port (for health checks)
EXPOSE 3011

# Start the scheduler
CMD ["node", "src/index.js"]