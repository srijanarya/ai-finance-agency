# Multi-stage build for Content Intelligence Engine
FROM node:20-alpine AS builder

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    ca-certificates \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Copy package files for better caching
COPY package*.json ./
COPY tsconfig*.json ./

# Install ALL dependencies (including dev for build)
RUN npm ci --silent && \
    npm cache clean --force

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Production stage
FROM node:20-alpine AS production

# Install security updates and dumb-init for proper signal handling
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    ca-certificates && \
    rm -rf /var/cache/apk/*

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S contentai -u 1001

# Set working directory
WORKDIR /app

# Copy built application and dependencies
COPY --from=builder --chown=contentai:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=contentai:nodejs /app/dist ./dist
COPY --from=builder --chown=contentai:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p logs && chown -R contentai:nodejs logs

# Switch to non-root user
USER contentai

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3005/health', (res) => { \
        if (res.statusCode === 200) { \
            process.exit(0); \
        } else { \
            process.exit(1); \
        } \
    }).on('error', () => process.exit(1));"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3005

# Start application
CMD ["dumb-init", "node", "dist/main.js"]