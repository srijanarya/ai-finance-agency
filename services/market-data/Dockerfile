# Stage 1: Build
FROM node:20-alpine AS builder

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    ca-certificates \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files for better caching
COPY package*.json ./
COPY tsconfig*.json ./

# Install ALL dependencies (including dev for build)
RUN npm ci --silent && \
    npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Stage 2: Production
FROM node:20-alpine AS production

# Install security updates and dumb-init for proper signal handling
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    ca-certificates \
    curl && \
    rm -rf /var/cache/apk/*

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

WORKDIR /app

# Copy built application and production dependencies from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Copy any additional static files if needed
# COPY --chown=nestjs:nodejs public/ ./public/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3008

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3008/health || exit 1

# Expose port
EXPOSE 3008

# Switch to non-root user
USER nestjs

# Start the application with dumb-init
CMD ["dumb-init", "node", "dist/main"]