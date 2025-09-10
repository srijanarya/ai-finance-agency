# Multi-stage build for risk management service
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force && rm package*.json

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy necessary files
COPY --chown=nestjs:nodejs . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3007
ENV GRPC_PORT=5007

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

# Expose ports
EXPOSE $PORT $GRPC_PORT

# Switch to non-root user
USER nestjs

# Start the application
CMD ["node", "dist/main.js"]